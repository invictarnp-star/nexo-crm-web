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
    const usuarioBruto = String(process.env.SGA_USUARIO);
    const senhaBruta = String(process.env.SGA_SENHA);
    const tokenBruto = String(process.env.SGA_TOKEN);
    const auth = await chamar("usuario/autenticar", "POST", tokenBruto.trim(), { usuario: usuarioBruto.trim(), senha: senhaBruta.trim() });
    const tokenUsuario = auth.json && auth.json.token_usuario;
    if (!auth.ok || !tokenUsuario) {
      const erroSga = auth.json && (auth.json.error || auth.json.erro || auth.json);
      const motivo = (erroSga && (erroSga.mensagem || erroSga.message)) || auth.texto || "sem mensagem";
      return res.status(200).json({
        ok: false, etapa: "autenticacao", status_http: auth.status,
        mensagem: `O SGA recusou o login: "${motivo}"`,
        codigo_erro_sga: erroSga && (erroSga.codigo_erro || erroSga.code),
        diagnostico_sem_revelar_dados: {
          letras_no_login: usuarioBruto.trim().length,
          login_tem_espaco_no_meio: /\s/.test(usuarioBruto.trim()),
          letras_na_senha: senhaBruta.trim().length,
          tinha_espaco_sobrando_no_inicio_ou_fim: usuarioBruto !== usuarioBruto.trim() || senhaBruta !== senhaBruta.trim() || tokenBruto !== tokenBruto.trim(),
          letras_no_token: tokenBruto.trim().length,
          primeira_letra_do_login: usuarioBruto.trim().slice(0, 1),
        },
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

    if (acao === "resumo") {
      // Conta TODOS os boletos com vencimento no mês (só números, nenhum dado pessoal)
      const hoje = new Date();
      const ini = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
      const todos = [];
      let pagina = 0, totalPaginas = 1;
      while (pagina < totalPaginas && pagina < 20) {
        const r = await chamar("listar/boleto-associado/periodo", "POST", tokenUsuario, {
          data_vencimento_inicial: ddmmyyyy(ini), data_vencimento_final: ddmmyyyy(fim),
          codigo_voluntario: [Number(codigoVoluntario)], quantidade_por_pagina: 500, inicio_paginacao: pagina,
        });
        if (!r.ok) return res.status(200).json({ ok: false, etapa: "resumo", status_http: r.status, resposta_sga: mascarar(r.json) || r.texto });
        todos.push(...((r.json && r.json.boletos) || []));
        totalPaginas = Number(r.json && r.json.numero_paginas) || 1;
        pagina++;
      }
      const meus = todos.filter((b) => !Array.isArray(b.veiculos) || b.veiculos.length === 0 || b.veiculos.some((v) => minhaBase(v.codigo_voluntario)));
      const contar = (fn) => meus.reduce((m, b) => { const k = fn(b) || "(vazio)"; m[k] = m[k] || { qtd: 0, valor: 0 }; m[k].qtd++; m[k].valor = Math.round((m[k].valor + (Number(b.valor_boleto) || 0)) * 100) / 100; return m; }, {});
      const nossos = new Set(meus.map((b) => String(b.nosso_numero)));
      const associados = new Set(meus.map((b) => String(b.codigo_associado)));
      const veiculos = new Set(meus.flatMap((b) => (b.veiculos || []).map((v) => String(v.codigo_veiculo))));
      return res.status(200).json({
        ok: true, etapa: "resumo",
        mensagem: `Resumo dos boletos com vencimento em ${String(hoje.getMonth() + 1).padStart(2, "0")}/${hoje.getFullYear()} da sua base (só números).`,
        boletos_lidos: todos.length, boletos_da_sua_base: meus.length, nosso_numero_diferentes: nossos.size,
        associados_diferentes: associados.size, veiculos_diferentes: veiculos.size,
        boletos_com_varios_veiculos: meus.filter((b) => (b.veiculos || []).length > 1).length,
        por_situacao: contar((b) => b.situacao_boleto),
        por_tipo: contar((b) => b.tipo_boleto),
        por_mes_referente: contar((b) => b.mes_referente),
        pagos_com_data_pagamento: meus.filter((b) => b.data_pagamento).length,
      });
    }

    if (acao === "relatorio") {
      // Relatório legível dos boletos do mês (dados reais, só da sua base) — para mostrar NA TELA do Nexo.
      const mesParam = String(req.query.mes || "");
      const [ano, mes] = /^\d{4}-\d{2}$/.test(mesParam) ? mesParam.split("-").map(Number) : [new Date().getFullYear(), new Date().getMonth() + 1];
      const ini = new Date(ano, mes - 1, 1), fim = new Date(ano, mes, 0);
      const todos = [];
      let pagina = 0, totalPaginas = 1;
      while (pagina < totalPaginas && pagina < 20) {
        const r = await chamar("listar/boleto-associado/periodo", "POST", tokenUsuario, {
          data_vencimento_inicial: ddmmyyyy(ini), data_vencimento_final: ddmmyyyy(fim),
          codigo_voluntario: [Number(codigoVoluntario)], quantidade_por_pagina: 500, inicio_paginacao: pagina, link_boleto: true,
        });
        if (!r.ok) return res.status(200).json({ ok: false, etapa: "relatorio", status_http: r.status, mensagem: "O SGA recusou a consulta.", resposta_sga: mascarar(r.json) || r.texto });
        todos.push(...((r.json && r.json.boletos) || []));
        totalPaginas = Number(r.json && r.json.numero_paginas) || 1;
        pagina++;
      }
      const linhas = todos
        .filter((b) => !Array.isArray(b.veiculos) || b.veiculos.length === 0 || b.veiculos.some((v) => minhaBase(v.codigo_voluntario)))
        .map((b) => ({
          nosso_numero: b.nosso_numero, cliente: b.nome_associado, cpf: b.cpf, codigo_associado: b.codigo_associado,
          placas: (b.veiculos || []).map((v) => v.placa).filter(Boolean),
          valor: Number(b.valor_boleto) || 0, valor_pago: Number(b.valor_pagamento) || 0,
          vencimento: b.data_vencimento, pagamento: b.data_pagamento, situacao: b.situacao_boleto,
          mes_referente: b.mes_referente, tipo: b.tipo_boleto,
          parcela: b.parcelado === "Y" && b.qtde_parcela ? `${b.parcela_paga ?? "?"}/${b.qtde_parcela}` : "",
          link: b.link_boleto || b.url_boleto || b.link || null,
          celular: b.celular || null,
        }));
      return res.status(200).json({ ok: true, etapa: "relatorio", mes: `${String(mes).padStart(2, "0")}/${ano}`, total: linhas.length, boletos: linhas });
    }

    if (acao === "bases") {
      // Lista regionais e cooperativas (nomes de bases, sem dados pessoais) e conta os boletos do mês por base
      const [reg, coop] = await Promise.all([
        chamar("listar/regional/todos", "GET", tokenUsuario),
        chamar("listar/cooperativa/todos", "GET", tokenUsuario),
      ]);
      const comoLista = (j) => (Array.isArray(j) ? j : (j && (j.regionais || j.cooperativas || j.dados || j.data)) || []);
      const regionais = comoLista(reg.json).map((x) => ({ codigo: x.codigo_regional, nome: x.descricao_regional || x.nome, situacao: x.situacao }));
      const cooperativas = comoLista(coop.json).map((x) => ({ codigo: x.codigo_cooperativa, nome: x.nome || x.descricao_cooperativa || x.descricao, situacao: x.situacao }));
      // boletos do mês do voluntário: em quais regionais/cooperativas estão os veículos
      const hoje = new Date();
      const r = await chamar("listar/boleto-associado/periodo", "POST", tokenUsuario, {
        data_vencimento_inicial: ddmmyyyy(new Date(hoje.getFullYear(), hoje.getMonth(), 1)),
        data_vencimento_final: ddmmyyyy(new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)),
        codigo_voluntario: [Number(codigoVoluntario)], quantidade_por_pagina: 1000, inicio_paginacao: 0,
      });
      const nomeReg = (c) => (regionais.find((x) => String(x.codigo) === String(c)) || {}).nome || `regional ${c}`;
      const nomeCoop = (c) => (cooperativas.find((x) => String(x.codigo) === String(c)) || {}).nome || `cooperativa ${c}`;
      const contagem = {};
      for (const b of (r.json && r.json.boletos) || []) {
        for (const v of b.veiculos || []) {
          const k = `${nomeReg(v.codigo_regional)} (reg ${v.codigo_regional}) / ${nomeCoop(v.codigo_cooperativa)} (coop ${v.codigo_cooperativa}) / ${minhaBase(v.codigo_voluntario) ? "voluntário EU" : "OUTRO voluntário"}`;
          contagem[k] = (contagem[k] || 0) + 1;
        }
      }
      return res.status(200).json({
        ok: reg.ok || coop.ok, etapa: "bases",
        mensagem: !reg.ok && !coop.ok ? "Libere no token (Gerenciar APIs) os endpoints 'Regional - Listar' e 'Cooperativa - Listar'." : "Bases cadastradas no SGA e onde estão os veículos dos seus boletos deste mês.",
        regional_status_http: reg.status, cooperativa_status_http: coop.status,
        veiculos_dos_seus_boletos_do_mes_por_base: contagem,
        regionais, cooperativas,
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
