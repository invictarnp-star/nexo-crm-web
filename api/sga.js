// Integração com o SGA (Hinova) — ETAPA 1: teste de conexão (SOMENTE LEITURA, não grava nada).
// Baseado na documentação oficial da API SGA v2 (https://api.hinova.com.br/api/sga/v2/doc/).
//
// Variáveis de ambiente (Vercel → Settings → Environment Variables), lidas SÓ no servidor:
//   SGA_TOKEN            = token gerado no SGA (Área Cliente → APIs → Gerenciar APIs)
//   SGA_USUARIO          = usuário ATIVO do SGA
//   SGA_SENHA            = senha desse usuário
//   SGA_CPF_VOLUNTARIO   = CPF do voluntário dono da base (só os dados dele saem do servidor)
//   SGA_BASE_URL         = (opcional) padrão https://api.hinova.com.br/api/sga/v2
//
// Segurança: só responde para quem está logado no Nexo; filtra pela base do voluntário NA CONSULTA
// ao SGA (codigo_voluntario) e confere de novo aqui; nunca devolve token/senha; dados pessoais mascarados.

const BASE = (process.env.SGA_BASE_URL || "https://api.hinova.com.br/api/sga/v2").replace(/\/+$/, "");

async function usuarioLogadoNoNexo(req) {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_KEY;
  const auth = req.headers.authorization || "";
  if (!url || !anon || !auth.startsWith("Bearer ")) return false;
  try {
    const r = await fetch(`${url.replace(/\/+$/, "")}/auth/v1/user`, { headers: { apikey: anon, Authorization: auth } });
    return r.ok;
  } catch {
    return false;
  }
}

// Mostra só o formato dos dados: nomes dos campos + pedacinho dos valores
const CAMPOS_PESSOAIS = /cpf|rg|cnh|telefone|celular|email|logradouro|numero$|complemento|bairro|cep|linha_digitavel|chassi|renavam|qrcode|copia_cola|nome_mae|nome_pai|data_nascimento/i;
function mascarar(v, chave = "") {
  if (v === null || v === undefined) return v;
  if (/token|senha|password|secret/i.test(chave)) return "***";
  if (Array.isArray(v)) return v.length ? [mascarar(v[0], chave), `… (${v.length} itens)`] : [];
  if (typeof v === "object") {
    const o = {};
    for (const [k, val] of Object.entries(v)) o[k] = mascarar(val, k);
    return o;
  }
  if (typeof v === "number" || typeof v === "boolean") return CAMPOS_PESSOAIS.test(chave) ? "***" : v;
  const s = String(v);
  if (CAMPOS_PESSOAIS.test(chave)) return s ? "***(" + s.length + ")" : s;
  if (/^\d{4}-\d{2}-\d{2}/.test(s) || /^\d{2}\/\d{2}\/\d{4}/.test(s)) return s;
  if (/^-?[\d.,]+$/.test(s) && s.length <= 12) return s;
  if (s.length <= 12) return s;
  return s.slice(0, 4) + "…(" + s.length + ")";
}

async function chamar(caminho, metodo, tokenBearer, corpo) {
  const r = await fetch(`${BASE}/${caminho.replace(/^\/+/, "")}`, {
    method: metodo,
    headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${tokenBearer}` },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  const texto = await r.text();
  let json = null;
  try { json = JSON.parse(texto); } catch { /* não é JSON */ }
  return { status: r.status, ok: r.ok, json, texto: json ? null : texto.slice(0, 300) };
}

const ddmmyyyy = (d) => `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const temSupabase = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL) && (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_KEY);
  if (!temSupabase) {
    return res.status(200).json({ ok: false, etapa: "configuracao", mensagem: "O servidor não encontrou as variáveis do Supabase (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) no Vercel." });
  }
  if (!(await usuarioLogadoNoNexo(req))) {
    return res.status(401).json({ ok: false, erro: "Faça login no Nexo para usar a integração com o SGA." });
  }
  const faltando = ["SGA_TOKEN", "SGA_USUARIO", "SGA_SENHA", "SGA_CPF_VOLUNTARIO"].filter((k) => !process.env[k]);
  if (faltando.length) {
    return res.status(200).json({ ok: false, etapa: "configuracao", mensagem: `Falta cadastrar no Vercel: ${faltando.join(", ")} (Settings → Environment Variables) e fazer um Redeploy.` });
  }

  const acao = String(req.query.acao || "teste");
  try {
    // 1) Autenticar usuário (POST /usuario/autenticar) — retorna token_usuario
    const auth = await chamar("usuario/autenticar", "POST", process.env.SGA_TOKEN, { usuario: process.env.SGA_USUARIO, senha: process.env.SGA_SENHA });
    const tokenUsuario = auth.json && auth.json.token_usuario;
    if (!auth.ok || !tokenUsuario) {
      return res.status(200).json({
        ok: false, etapa: "autenticacao", status_http: auth.status,
        mensagem: "O SGA não aceitou o login. Confira token, usuário e senha no Vercel, e se o endpoint 'usuario/autenticar' está liberado no token (Gerenciar APIs).",
        resposta_sga: mascarar(auth.json) || auth.texto,
      });
    }

    // 2) Descobrir o código do voluntário pelo CPF (GET /buscar/voluntario/:cpfOuCodigo)
    const cpfVol = String(process.env.SGA_CPF_VOLUNTARIO).replace(/\D/g, "");
    const vol = await chamar(`buscar/voluntario/${cpfVol}`, "GET", tokenUsuario);
    const voluntario = vol.json && (Array.isArray(vol.json) ? vol.json[0] : vol.json);
    const codigoVoluntario = voluntario && voluntario.codigo_voluntario;
    if (!vol.ok || !codigoVoluntario) {
      return res.status(200).json({
        ok: false, etapa: "voluntario", status_http: vol.status,
        mensagem: "Login OK, mas não encontrei o voluntário pelo CPF. Confira SGA_CPF_VOLUNTARIO e se o endpoint 'buscar/voluntario' está liberado no token.",
        resposta_sga: mascarar(vol.json) || vol.texto,
      });
    }
    const minhaBase = (codigo) => String(codigo ?? "") === String(codigoVoluntario);

    if (acao === "teste") {
      return res.status(200).json({
        ok: true, etapa: "teste",
        mensagem: `Conexão com o SGA funcionando! Voluntário: ${voluntario.nome || "—"} (código ${codigoVoluntario}).`,
        voluntario: { codigo_voluntario: codigoVoluntario, nome: voluntario.nome, situacao: voluntario.situacao },
      });
    }

    if (acao === "situacoes") {
      // GET /listar/situacao-boleto/todos — códigos das situações (ex.: BAIXADO, pago SIM)
      const r = await chamar("listar/situacao-boleto/todos", "GET", tokenUsuario);
      return res.status(200).json({ ok: r.ok, etapa: "situacoes", status_http: r.status, situacoes_de_boleto: r.json || r.texto });
    }

    if (acao === "boletos") {
      // POST /listar/boleto-associado/periodo — vencimentos do mês atual (limite 31 dias), só do voluntário
      const hoje = new Date();
      const ini = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
      const r = await chamar("listar/boleto-associado/periodo", "POST", tokenUsuario, {
        data_vencimento_inicial: ddmmyyyy(ini), data_vencimento_final: ddmmyyyy(fim),
        codigo_voluntario: [Number(codigoVoluntario)], quantidade_por_pagina: 20, inicio_paginacao: 0,
      });
      const lista = (r.json && r.json.boletos) || [];
      // segunda trava: só boletos cujos veículos são do voluntário
      const meus = lista.filter((b) => !Array.isArray(b.veiculos) || b.veiculos.length === 0 || b.veiculos.some((v) => minhaBase(v.codigo_voluntario)));
      return res.status(200).json({
        ok: r.ok, etapa: "boletos", status_http: r.status,
        mensagem: r.ok ? `Boletos com vencimento em ${String(hoje.getMonth() + 1).padStart(2, "0")}/${hoje.getFullYear()} da sua base.` : "O SGA recusou a consulta de boletos (confira se 'listar/boleto-associado/periodo' está liberado no token).",
        total_registros_no_sga: r.json && r.json.total_registros, paginas: r.json && r.json.numero_paginas,
        nesta_pagina: lista.length, descartados_outros_voluntarios: lista.length - meus.length,
        exemplo_mascarado: meus.length ? mascarar(meus[0]) : (r.ok ? null : mascarar(r.json) || r.texto),
      });
    }

    if (acao === "veiculos") {
      // POST /listar/veiculo — veículos do voluntário (codigo_situacao obrigatório; 1 = normalmente ATIVO)
      const r = await chamar("listar/veiculo", "POST", tokenUsuario, {
        codigo_situacao: String(req.query.situacao || "1"), codigo_voluntario: String(codigoVoluntario),
        quantidade_por_pagina: 20, inicio_paginacao: 0,
      });
      const lista = (r.json && r.json.veiculos) || [];
      const meus = lista.filter((v) => v.codigo_voluntario === undefined || minhaBase(v.codigo_voluntario));
      return res.status(200).json({
        ok: r.ok, etapa: "veiculos", status_http: r.status,
        mensagem: r.ok ? "Veículos ativos da sua base." : "O SGA recusou a consulta de veículos (confira se 'listar/veiculo' está liberado no token).",
        total_veiculos_no_sga: r.json && r.json.total_veiculos, nesta_pagina: lista.length,
        descartados_outros_voluntarios: lista.length - meus.length,
        exemplo_mascarado: meus.length ? mascarar(meus[0]) : (r.ok ? null : mascarar(r.json) || r.texto),
      });
    }

    return res.status(400).json({ ok: false, erro: "Ação desconhecida." });
  } catch (e) {
    return res.status(200).json({ ok: false, etapa: "rede", mensagem: "Não foi possível falar com o SGA: " + e.message });
  }
}
