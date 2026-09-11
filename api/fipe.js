/**
 * /api/fipe
 *
 * Consulta a Tabela Fipe (marca → modelo → ano → valor) usada no cadastro
 * de veículo (botão "Consultar Fipe" em Marca/Modelo/Ano).
 *
 * Usa a API pública e gratuita da Fipe (fipe.parallelum.com.br), a mesma
 * já usada em api/consulta-veiculo.js — não precisa de chave/token.
 *
 * Se um dia quiser trocar para uma API Fipe paga/oficial, troque só a
 * função `fipeFetch` abaixo (e a FIPE_BASE) — o resto do arquivo
 * (endpoints /api/fipe?action=...) não precisa mudar.
 *
 * Ações (todas via GET /api/fipe?action=...):
 *   action=marcas                                  → [{ codigo, nome }]
 *   action=modelos&marca=<codigo>                  → [{ codigo, nome }]
 *   action=anos&marca=<codigo>&modelo=<codigo>     → [{ codigo, nome }]
 *   action=valor&marca=<codigo>&modelo=<codigo>&ano=<codigo>
 *     → { marca, modelo, ano, codigoFipe, valor, combustivel, mesReferencia }
 *
 * "tipo" opcional (padrão "cars"): cars | motorcycles | trucks
 */

const FIPE_BASE = "https://fipe.parallelum.com.br/api/v2";
const TIPOS_VALIDOS = new Set(["cars", "motorcycles", "trucks"]);

// Cache em memória (dura enquanto a função ficar "quente" no servidor) para
// evitar bater na Fipe de novo pelo mesmo dado quando várias pessoas usam o
// sistema ao mesmo tempo. Não é persistente — é só uma economia de chamadas.
const cache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hora

async function comCache(chave, calcular) {
  const agora = Date.now();
  const emCache = cache.get(chave);
  if (emCache && agora - emCache.quando < CACHE_TTL_MS) return emCache.valor;
  const valor = await calcular();
  cache.set(chave, { valor, quando: agora });
  return valor;
}

async function fipeFetch(caminho) {
  const resp = await fetch(`${FIPE_BASE}${caminho}`, { headers: { Accept: "application/json" } });
  if (!resp.ok) {
    const erro = new Error("Não foi possível consultar a Tabela Fipe neste momento. Tente novamente.");
    erro.status = 502;
    throw erro;
  }
  return resp.json();
}

function paraNumero(valorTexto) {
  const n = Number(
    String(valorTexto || "")
      .replace(/[^\d,.-]/g, "")
      .replace(/\.(?=\d{3},)/g, "")
      .replace(",", ".")
  );
  return isNaN(n) ? null : n;
}

async function listarMarcas(tipo) {
  const dados = await comCache(`marcas:${tipo}`, () => fipeFetch(`/${tipo}/brands`));
  return (Array.isArray(dados) ? dados : []).map((m) => ({ codigo: String(m.code), nome: m.name }));
}

async function listarModelos(tipo, marca) {
  const dados = await comCache(`modelos:${tipo}:${marca}`, () => fipeFetch(`/${tipo}/brands/${marca}/models`));
  const lista = dados?.models || dados || [];
  return (Array.isArray(lista) ? lista : []).map((m) => ({ codigo: String(m.code), nome: m.name }));
}

async function listarAnos(tipo, marca, modelo) {
  const dados = await comCache(`anos:${tipo}:${marca}:${modelo}`, () =>
    fipeFetch(`/${tipo}/brands/${marca}/models/${modelo}/years`)
  );
  return (Array.isArray(dados) ? dados : []).map((a) => ({ codigo: String(a.code), nome: a.name }));
}

async function consultarValor(tipo, marca, modelo, ano) {
  const detalhe = await comCache(`valor:${tipo}:${marca}:${modelo}:${ano}`, () =>
    fipeFetch(`/${tipo}/brands/${marca}/models/${modelo}/years/${ano}`)
  );
  return {
    marca: detalhe.brand || "",
    modelo: detalhe.model || "",
    ano: String(detalhe.modelYear || "").slice(0, 4),
    codigoFipe: detalhe.codeFipe || "",
    valor: paraNumero(detalhe.price),
    combustivel: detalhe.fuel || "",
    mesReferencia: detalhe.referenceMonth || "",
  };
}

export default async function handler(req, res) {
  try {
    const action = (req.query.action || "").toString();
    const tipo = TIPOS_VALIDOS.has(req.query.tipo) ? req.query.tipo : "cars";
    const marca = (req.query.marca || "").toString().trim();
    const modelo = (req.query.modelo || "").toString().trim();
    const ano = (req.query.ano || "").toString().trim();

    if (action === "marcas") {
      res.status(200).json(await listarMarcas(tipo));
      return;
    }

    if (action === "modelos") {
      if (!marca) return res.status(400).json({ erro: "Informe a marca (?action=modelos&marca=CODIGO)." });
      res.status(200).json(await listarModelos(tipo, marca));
      return;
    }

    if (action === "anos") {
      if (!marca || !modelo) return res.status(400).json({ erro: "Informe marca e modelo (?action=anos&marca=..&modelo=..)." });
      res.status(200).json(await listarAnos(tipo, marca, modelo));
      return;
    }

    if (action === "valor") {
      if (!marca || !modelo || !ano) {
        return res.status(400).json({ erro: "Informe marca, modelo e ano (?action=valor&marca=..&modelo=..&ano=..)." });
      }
      res.status(200).json(await consultarValor(tipo, marca, modelo, ano));
      return;
    }

    res.status(400).json({ erro: "Ação inválida. Use action=marcas, modelos, anos ou valor." });
  } catch (e) {
    res.status(e.status || 500).json({ erro: e.message || "Não foi possível consultar a Tabela Fipe neste momento. Tente novamente." });
  }
}
