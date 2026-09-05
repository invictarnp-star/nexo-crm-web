/**
 * /api/consulta-veiculo
 *
 * Recebe ?placa=ABC1D23 (ou ?chassi=...) e devolve marca, modelo, ano,
 * código Fipe e valor Fipe do veículo.
 *
 * Como funciona (dois serviços diferentes, encadeados):
 *   1) Consulta a placa num provedor pago de dados veiculares — você
 *      escolhe o provedor e configura as variáveis de ambiente abaixo.
 *   2) Com marca/modelo/ano em mãos, consulta a API pública e gratuita
 *      da Tabela Fipe (fipe.parallelum.com.br) para achar o código Fipe
 *      e o valor de referência.
 *
 * Variáveis de ambiente necessárias (configure no Vercel, NUNCA com
 * prefixo VITE_ — são segredos de servidor, não podem ir para o navegador):
 *
 *   PLACA_API_URL     ex.: https://api-do-seu-provedor.com/v1/placa/{placa}
 *                     (o texto "{placa}" é substituído pela placa pesquisada)
 *   PLACA_API_TOKEN   o token/chave que o provedor te entregar
 *   PLACA_API_HEADER  (opcional) nome do header de autenticação.
 *                     Padrão: "Authorization" enviado como "Bearer TOKEN".
 *                     Alguns provedores usam um header próprio, ex.: "AccessToken".
 *                     Se o seu provedor usar um header diferente sem o
 *                     prefixo "Bearer", ajuste a função `montarHeaders` abaixo.
 *
 * Enquanto essas variáveis não estiverem configuradas, o endpoint responde
 * com uma mensagem explicando o que falta — o restante do sistema
 * continua funcionando normalmente com preenchimento manual.
 */

const FIPE_BASE = "https://fipe.parallelum.com.br/api/v2";

function normalize(s) {
  return (s || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, " ")
    .trim();
}

function pickField(obj, candidates) {
  if (!obj) return "";
  const keys = Object.keys(obj);
  for (const c of candidates) {
    const found = keys.find((k) => k.toLowerCase() === c.toLowerCase());
    if (found && obj[found] != null && obj[found] !== "") return obj[found];
  }
  return "";
}

function findBestMatch(list, target, nameKey) {
  const nTarget = normalize(target);
  if (!nTarget || !Array.isArray(list) || list.length === 0) return null;
  let best = null;
  let bestScore = -1;
  for (const item of list) {
    const nName = normalize(item[nameKey]);
    let score = 0;
    if (nName === nTarget) score = 100;
    else if (nName.startsWith(nTarget) || nTarget.startsWith(nName)) score = 80;
    else if (nName.includes(nTarget) || nTarget.includes(nName)) score = 60;
    else {
      const targetTokens = new Set(nTarget.split(" "));
      const overlap = nName.split(" ").filter((t) => targetTokens.has(t)).length;
      score = overlap * 10;
    }
    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  }
  return bestScore > 0 ? best : null;
}

function montarHeaders(token, headerName) {
  const headers = { Accept: "application/json" };
  if (!token) return headers;
  if (headerName && headerName.toLowerCase() !== "authorization") {
    headers[headerName] = token;
  } else {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function consultarProvedorDePlaca(placaOuChassi, tipoParam) {
  const url = process.env.PLACA_API_URL;
  const token = process.env.PLACA_API_TOKEN;
  const headerName = process.env.PLACA_API_HEADER || "Authorization";

  if (!url) {
    const erro = new Error(
      "Consulta por placa ainda não configurada. Defina PLACA_API_URL e PLACA_API_TOKEN nas variáveis de ambiente do projeto (veja o comentário no topo de api/consulta-veiculo.js)."
    );
    erro.status = 501;
    throw erro;
  }

  const finalUrl = url.replace("{placa}", encodeURIComponent(placaOuChassi)).replace("{chassi}", encodeURIComponent(placaOuChassi));

  const resp = await fetch(finalUrl, { headers: montarHeaders(token, headerName) });
  if (!resp.ok) {
    const erro = new Error(`O provedor de consulta veicular retornou erro (HTTP ${resp.status}).`);
    erro.status = 502;
    throw erro;
  }
  const raw = await resp.json();
  // alguns provedores retornam o veículo dentro de um envelope, ex.: { data: {...} } ou { resultado: {...} }
  const obj = raw.data || raw.resultado || raw.result || raw;

  const marca = pickField(obj, ["marca", "brand", "fabricante"]);
  const modelo = pickField(obj, ["modelo", "model"]);
  const ano = pickField(obj, ["anoModelo", "ano_modelo", "anoFabricacao", "ano", "year", "modelYear"]);
  const chassi = pickField(obj, ["chassi", "chassis"]);

  if (!marca || !modelo) {
    const erro = new Error("O veículo foi encontrado, mas o provedor não retornou marca/modelo reconhecíveis.");
    erro.status = 404;
    throw erro;
  }
  return { marca, modelo, ano: String(ano || "").slice(0, 4), chassi };
}

async function buscarNaFipe({ marca, modelo, ano }) {
  const brandsResp = await fetch(`${FIPE_BASE}/cars/brands`);
  if (!brandsResp.ok) throw new Error("Não foi possível consultar as marcas na API Fipe.");
  const brands = await brandsResp.json();
  const brand = findBestMatch(brands, marca, "name");
  if (!brand) return null;

  const modelsResp = await fetch(`${FIPE_BASE}/cars/brands/${brand.code}/models`);
  if (!modelsResp.ok) throw new Error("Não foi possível consultar os modelos na API Fipe.");
  const modelsData = await modelsResp.json();
  const models = modelsData.models || modelsData;
  const model = findBestMatch(models, modelo, "name");
  if (!model) return null;

  const yearsResp = await fetch(`${FIPE_BASE}/cars/brands/${brand.code}/models/${model.code}/years`);
  if (!yearsResp.ok) throw new Error("Não foi possível consultar os anos na API Fipe.");
  const years = await yearsResp.json();
  if (!Array.isArray(years) || years.length === 0) return null;

  let chosenYear = years[0];
  const anoAlvo = parseInt(ano, 10);
  if (!isNaN(anoAlvo)) {
    let melhorDiff = Infinity;
    for (const y of years) {
      const anoDoItem = parseInt(String(y.name).match(/\d{4}/)?.[0] || "", 10);
      if (!isNaN(anoDoItem)) {
        const diff = Math.abs(anoDoItem - anoAlvo);
        if (diff < melhorDiff) { melhorDiff = diff; chosenYear = y; }
      }
    }
  }

  const detailResp = await fetch(`${FIPE_BASE}/cars/brands/${brand.code}/models/${model.code}/years/${chosenYear.code}`);
  if (!detailResp.ok) throw new Error("Não foi possível consultar o valor na API Fipe.");
  const detail = await detailResp.json();

  const price = pickField(detail, ["price", "valor", "Valor"]);
  const codeFipe = pickField(detail, ["codeFipe", "codigoFipe", "CodigoFipe"]);
  const referenceMonth = pickField(detail, ["referenceMonth", "mesReferencia", "MesReferencia"]);
  const modelYear = pickField(detail, ["modelYear", "anoModelo", "AnoModelo"]);

  const valorNumerico = Number(
    String(price).replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3},)/g, "").replace(",", ".")
  ) || null;

  return { codigoFipe: codeFipe || "", valorFipe: valorNumerico, mesReferencia: referenceMonth || "", anoModeloFipe: modelYear || "" };
}

export default async function handler(req, res) {
  try {
    const placa = (req.query.placa || "").toString().trim();
    const chassi = (req.query.chassi || "").toString().trim();
    const termo = placa || chassi;

    if (!termo) {
      res.status(400).json({ erro: "Informe a placa ou o chassi na consulta (?placa=ABC1D23)." });
      return;
    }

    const dadosVeiculo = await consultarProvedorDePlaca(termo, placa ? "placa" : "chassi");

    let dadosFipe = null;
    try {
      dadosFipe = await buscarNaFipe(dadosVeiculo);
    } catch (e) {
      // Se a Fipe falhar, ainda devolvemos marca/modelo/ano da consulta de placa
      console.error("Falha ao buscar na Fipe:", e);
    }

    res.status(200).json({
      marca: dadosVeiculo.marca,
      modelo: dadosVeiculo.modelo,
      ano: dadosVeiculo.ano,
      chassi: dadosVeiculo.chassi,
      codigoFipe: dadosFipe?.codigoFipe || "",
      valorFipe: dadosFipe?.valorFipe ?? null,
      mesReferenciaFipe: dadosFipe?.mesReferencia || "",
      fipeEncontrada: !!dadosFipe,
    });
  } catch (e) {
    res.status(e.status || 500).json({ erro: e.message || "Erro ao consultar o veículo." });
  }
}
