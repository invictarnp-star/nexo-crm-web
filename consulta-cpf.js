/**
 * /api/consulta-cpf
 *
 * Recebe ?cpf=00000000000 e devolve nome completo e data de nascimento.
 *
 * IMPORTANTE (LGPD): nome e data de nascimento associados a um CPF são
 * dados pessoais. Não existe fonte pública e gratuita para isso —
 * diferente da Fipe ou do ViaCEP, aqui é sempre um provedor comercial
 * (ex.: Serasa, Assertiva, BigDataCorp, entre outros), contratado por
 * você, com uma base legal para o tratamento desses dados (em geral,
 * execução do contrato com o próprio cliente que está sendo cadastrado).
 * Confirme com seu provedor e, se possível, com um advogado, que o uso
 * está de acordo com a LGPD antes de usar em produção.
 *
 * Variáveis de ambiente necessárias (configure no Vercel — nunca com
 * prefixo VITE_, são segredos de servidor):
 *
 *   CPF_API_URL     ex.: https://api.seuprovedor.com/v1/cpf/{cpf}
 *                   ("{cpf}" é substituído pelo CPF pesquisado, só números)
 *   CPF_API_TOKEN   o token/chave que o provedor te entregar
 *   CPF_API_HEADER  (opcional) nome do header de autenticação.
 *                   Padrão: "Authorization" enviado como "Bearer TOKEN".
 *
 * Enquanto essas variáveis não estiverem configuradas, o endpoint responde
 * com uma mensagem explicando o que falta — o cadastro continua
 * funcionando normalmente com preenchimento manual.
 */

function pickField(obj, candidates) {
  if (!obj) return "";
  const keys = Object.keys(obj);
  for (const c of candidates) {
    const found = keys.find((k) => k.toLowerCase() === c.toLowerCase());
    if (found && obj[found] != null && obj[found] !== "") return obj[found];
  }
  return "";
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

function paraDataISO(valor) {
  if (!valor) return "";
  const s = String(valor).trim();
  // já está em YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  // formato DD/MM/YYYY
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return "";
}

export default async function handler(req, res) {
  try {
    const cpf = (req.query.cpf || "").toString().replace(/\D/g, "");
    if (cpf.length !== 11) {
      res.status(400).json({ erro: "Informe um CPF válido, com 11 dígitos (?cpf=00000000000)." });
      return;
    }

    const url = process.env.CPF_API_URL;
    const token = process.env.CPF_API_TOKEN;
    const headerName = process.env.CPF_API_HEADER || "Authorization";

    if (!url) {
      res.status(501).json({
        erro: "Consulta por CPF ainda não configurada. Defina CPF_API_URL e CPF_API_TOKEN nas variáveis de ambiente do projeto (veja o comentário no topo de api/consulta-cpf.js).",
      });
      return;
    }

    const finalUrl = url.replace("{cpf}", encodeURIComponent(cpf));
    const resp = await fetch(finalUrl, { headers: montarHeaders(token, headerName) });
    if (!resp.ok) {
      res.status(502).json({ erro: `O provedor de consulta de CPF retornou erro (HTTP ${resp.status}).` });
      return;
    }
    const raw = await resp.json();
    const obj = raw.data || raw.resultado || raw.result || raw;

    const nome = pickField(obj, ["nome", "name", "nomeCompleto", "razaoSocial"]);
    const nascimento = paraDataISO(pickField(obj, ["dataNascimento", "data_nascimento", "nascimento", "birthDate", "dtNascimento"]));

    if (!nome) {
      res.status(404).json({ erro: "Não foi possível localizar dados para este CPF." });
      return;
    }

    res.status(200).json({ nome, nascimento });
  } catch (e) {
    res.status(500).json({ erro: e.message || "Erro ao consultar o CPF." });
  }
}
