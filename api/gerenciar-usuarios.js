/**
 * /api/gerenciar-usuarios
 *
 * Cria, exclui e altera o perfil de usuários do sistema usando a API de
 * administração do Supabase. A chave usada aqui (SUPABASE_SERVICE_ROLE_KEY)
 * é secreta e poderosa — por isso essa lógica roda só no servidor, nunca
 * no navegador.
 *
 * Antes de qualquer ação, confirmamos que quem está pedindo é, de fato,
 * um administrador logado (via o token enviado no header Authorization).
 *
 * Variáveis de ambiente necessárias no Vercel:
 *   VITE_SUPABASE_URL          (a mesma URL já usada pelo resto do sistema)
 *   SUPABASE_SERVICE_ROLE_KEY  (Supabase → Project Settings → API →
 *                                "service_role" — NUNCA use a "anon" aqui,
 *                                e NUNCA prefixe com VITE_)
 *
 * Pré-requisito: rode supabase/perfis-usuarios.sql no SQL Editor do
 * Supabase antes de usar esta tela (cria a tabela "perfis" e as políticas
 * de segurança que este endpoint e o restante do app dependem).
 */

import { createClient } from "@supabase/supabase-js";

async function clienteAdmin() {
  const url = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    const erro = new Error("Variáveis SUPABASE_SERVICE_ROLE_KEY / VITE_SUPABASE_URL não configuradas no servidor.");
    erro.status = 501;
    throw erro;
  }
  return createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function confirmarQueEhAdmin(admin, token) {
  if (!token) {
    const erro = new Error("Não autenticado.");
    erro.status = 401;
    throw erro;
  }
  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData?.user) {
    const erro = new Error("Sessão inválida.");
    erro.status = 401;
    throw erro;
  }
  const { data: perfil } = await admin.from("perfis").select("role").eq("user_id", userData.user.id).single();
  if (!perfil || perfil.role !== "admin") {
    const erro = new Error("Só administradores podem gerenciar usuários.");
    erro.status = 403;
    throw erro;
  }
  return userData.user;
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ erro: "Método não permitido." });
      return;
    }

    const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    const admin = await clienteAdmin();
    const chamador = await confirmarQueEhAdmin(admin, token);

    const { acao } = req.body || {};

    if (acao === "criar") {
      const { nome, email, senha, role } = req.body;
      if (!nome || !email || !senha) {
        res.status(400).json({ erro: "Informe nome, e-mail e senha." });
        return;
      }
      if (senha.length < 6) {
        res.status(400).json({ erro: "A senha precisa ter pelo menos 6 caracteres." });
        return;
      }
      const { data: novo, error: erroCriar } = await admin.auth.admin.createUser({
        email, password: senha, email_confirm: true,
      });
      if (erroCriar) {
        res.status(400).json({ erro: erroCriar.message });
        return;
      }
      const { error: erroPerfil } = await admin.from("perfis").insert({
        user_id: novo.user.id, nome, email, role: role === "admin" ? "admin" : "operador",
      });
      if (erroPerfil) {
        // Se não conseguimos criar o perfil, desfaz a criação do login para
        // não deixar um usuário "fantasma" sem registro na tabela perfis.
        await admin.auth.admin.deleteUser(novo.user.id);
        res.status(400).json({ erro: erroPerfil.message });
        return;
      }
      res.status(200).json({ ok: true });
      return;
    }

    if (acao === "excluir") {
      const { userId } = req.body;
      if (!userId) {
        res.status(400).json({ erro: "Informe o usuário a excluir." });
        return;
      }
      if (userId === chamador.id) {
        res.status(400).json({ erro: "Você não pode excluir seu próprio usuário." });
        return;
      }
      const { error: erroExcluir } = await admin.auth.admin.deleteUser(userId);
      if (erroExcluir) {
        res.status(400).json({ erro: erroExcluir.message });
        return;
      }
      res.status(200).json({ ok: true });
      return;
    }

    if (acao === "alterar_role") {
      const { userId, role } = req.body;
      if (!userId || !role) {
        res.status(400).json({ erro: "Informe o usuário e o novo perfil." });
        return;
      }
      const { error: erroRole } = await admin.from("perfis").update({ role: role === "admin" ? "admin" : "operador" }).eq("user_id", userId);
      if (erroRole) {
        res.status(400).json({ erro: erroRole.message });
        return;
      }
      res.status(200).json({ ok: true });
      return;
    }

    res.status(400).json({ erro: "Ação inválida." });
  } catch (e) {
    res.status(e.status || 500).json({ erro: e.message || "Erro ao gerenciar usuários." });
  }
}
