/**
 * /api/cotacao-publica
 *
 * Alimenta a PÁGINA PÚBLICA da cotação (o link que o cliente recebe por
 * WhatsApp/e-mail). O cliente não tem login, então esta função lê o banco
 * com a chave de administrador (SUPABASE_SERVICE_ROLE_KEY, que fica só no
 * servidor) e devolve APENAS o que a cotação precisa mostrar — nunca dados
 * de outros clientes.
 *
 *   GET  /api/cotacao-publica?codigo=XXXX
 *        -> dados da negociação, planos já com preço calculado e consultor
 *   POST /api/cotacao-publica   { codigo, planoId }
 *        -> o cliente aceitou a proposta daquele plano
 *
 * O código da cotação é um texto aleatório difícil de adivinhar; quem tem
 * o link vê aquela cotação, e só ela.
 *
 * Variáveis de ambiente (Vercel): VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";

function admin() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    const e = new Error("Servidor sem SUPABASE_SERVICE_ROLE_KEY configurada.");
    e.status = 501;
    throw e;
  }
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

function mensalidadeDoPlano(plano, fipe) {
  const faixas = (Array.isArray(plano.faixas) ? plano.faixas : [])
    .map((f) => ({ ate: Number(f.ate) || 0, mensalidade: Number(f.mensalidade) || 0 }))
    .filter((f) => f.ate > 0)
    .sort((a, b) => a.ate - b.ate);
  if (faixas.length && Number(fipe) > 0) {
    const achada = faixas.find((f) => Number(fipe) <= f.ate) || faixas[faixas.length - 1];
    return r2(achada.mensalidade);
  }
  return r2(plano.valor_mensal);
}

function franquiaDoPlano(plano, fipe) {
  if (Number(plano.franquia_percentual) > 0 && Number(fipe) > 0) return r2((Number(fipe) * Number(plano.franquia_percentual)) / 100);
  return r2(plano.valor_franquia);
}

export default async function handler(req, res) {
  try {
    const db = admin();

    if (req.method === "GET") {
      const codigo = String(req.query.codigo || "").trim();
      if (!/^[A-Za-z0-9]{6,32}$/.test(codigo)) { res.status(400).json({ erro: "Código inválido." }); return; }

      const { data: n } = await db.from("negociacoes").select("*").eq("codigo", codigo).maybeSingle();
      if (!n) { res.status(404).json({ erro: "Cotação não encontrada." }); return; }

      let planos = [];
      if (n.seguradora_id) {
        const { data } = await db.from("planos").select("*").eq("seguradora_id", n.seguradora_id);
        planos = (data || []).filter((p) => !n.tabela || !p.tabela || p.tabela === n.tabela);
      }
      let consultor = null;
      if (n.consultora_id) {
        const { data } = await db.from("consultoras").select("nome,telefone,email").eq("id", n.consultora_id).maybeSingle();
        consultor = data || null;
      }

      // registra que o cliente abriu a cotação (no máximo 1 vez a cada 6 horas)
      const desde = new Date(Date.now() - 6 * 3600 * 1000).toISOString();
      const { data: recentes } = await db
        .from("negociacao_eventos").select("id").eq("negociacao_id", n.id).eq("tipo", "cotacao").ilike("texto", "%visualizou%").gte("created_at", desde).limit(1);
      if (!recentes || recentes.length === 0) {
        await db.from("negociacao_eventos").insert({ negociacao_id: n.id, tipo: "cotacao", texto: "o cliente visualizou a cotação pelo link", autor: "Cliente" });
      }

      res.status(200).json({
        negociacao: {
          codigo: n.codigo, nomeContato: n.nome_contato, placa: n.placa, marca: n.marca, modelo: n.modelo, anoModelo: n.ano_modelo,
          codigoFipe: n.codigo_fipe, valorFipe: n.valor_fipe, taxaAtivacao: n.taxa_ativacao, taxaAtivacaoOriginal: n.taxa_ativacao_original,
          rastreador: n.rastreador, validadeDias: n.validade_dias, createdAt: n.created_at, propostaAceita: n.proposta_aceita, planoId: n.plano_id,
        },
        planos: planos
          .map((p) => ({
            id: p.id, nome: p.nome, tabela: p.tabela || "", mensalidade: mensalidadeDoPlano(p, n.valor_fipe), franquia: franquiaDoPlano(p, n.valor_fipe),
            coberturas: Array.isArray(p.coberturas) ? p.coberturas : [],
          }))
          .sort((a, b) => a.mensalidade - b.mensalidade),
        consultor,
      });
      return;
    }

    if (req.method === "POST") {
      const { codigo, planoId } = req.body || {};
      if (!/^[A-Za-z0-9]{6,32}$/.test(String(codigo || ""))) { res.status(400).json({ erro: "Código inválido." }); return; }
      const { data: n } = await db.from("negociacoes").select("*").eq("codigo", codigo).maybeSingle();
      if (!n) { res.status(404).json({ erro: "Cotação não encontrada." }); return; }
      const { data: plano } = await db.from("planos").select("*").eq("id", planoId).eq("seguradora_id", n.seguradora_id).maybeSingle();
      if (!plano) { res.status(400).json({ erro: "Plano inválido para esta cotação." }); return; }

      const agora = new Date().toISOString();
      const { error } = await db
        .from("negociacoes")
        .update({
          plano_id: plano.id, proposta_aceita: true, proposta_aceita_em: agora, updated_at: agora,
          mensalidade: mensalidadeDoPlano(plano, n.valor_fipe), franquia: franquiaDoPlano(plano, n.valor_fipe),
          taxa_ativacao: n.taxa_ativacao ?? plano.taxa_ativacao, taxa_ativacao_original: n.taxa_ativacao_original ?? plano.taxa_ativacao,
          rastreador: n.rastreador ?? plano.rastreador,
        })
        .eq("id", n.id);
      if (error) throw error;
      await db.from("negociacao_eventos").insert({ negociacao_id: n.id, tipo: "cotacao", texto: `o cliente aceitou a proposta do plano ${plano.nome} pelo link`, autor: "Cliente" });
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ erro: "Método não permitido." });
  } catch (e) {
    res.status(e.status || 500).json({ erro: e.message || "Erro ao carregar a cotação." });
  }
}
