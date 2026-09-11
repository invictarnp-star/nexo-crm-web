/**
 * /api/assistente-ia
 *
 * Backend do assistente de IA do sistema (botão flutuante, ícone de robô).
 * Usa o Google Gemini (modelo "gemini-2.5-flash"), que tem uso gratuito
 * dentro dos limites da conta do Google AI Studio — por isso foi escolhido
 * no lugar de uma API paga.
 *
 * Recebe via POST: { pergunta, contexto, historico }
 *   pergunta  — string, a mensagem que o usuário digitou agora.
 *   contexto  — string opcional, um resumo já ANONIMIZADO (montado no
 *               navegador, em App.jsx) com números gerais do sistema
 *               (quantos clientes, veículos, boletos em aberto/atrasados
 *               etc.) para o assistente responder com mais contexto sem
 *               que dado pessoal saia do sistema.
 *   historico — array opcional [{ autor: "usuario" | "assistente", texto }]
 *               com as últimas mensagens da conversa, pra manter contexto.
 * Devolve: { resposta } ou { erro }.
 *
 * IMPORTANTE (LGPD/privacidade): este arquivo só repassa o que já chegou
 * pronto do navegador — a anonimização (remover CPF, telefone, WhatsApp,
 * e-mail, endereço, CEP, nascimento, CNH) é feita em App.jsx, ANTES de
 * qualquer requisição sair do sistema. Este backend não deve ser alterado
 * para aceitar ou repassar esses campos.
 *
 * Variável de ambiente necessária (configure no Vercel — nunca com
 * prefixo VITE_, é um segredo de servidor):
 *
 *   GEMINI_API_KEY  chave gratuita criada em https://aistudio.google.com/apikey
 *                   (entrar com conta Google → "Create API key").
 *
 * Enquanto essa variável não estiver configurada, o endpoint responde com
 * uma mensagem explicando o que falta — o botão do assistente continua
 * aparecendo, só avisa que precisa ser configurado (mesmo padrão das
 * outras funções de api/, como consulta-cpf.js).
 */

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const INSTRUCAO_SISTEMA =
  "Você é o assistente virtual do Nexo Gestão, um sistema de gestão de clientes, veículos e " +
  "boletos de uma corretora de seguros/consórcio chamada Seu Seguro Corretora. Responda em " +
  "português do Brasil, de forma direta e cordial. Você recebe apenas um resumo geral e " +
  "anonimizado dos dados (contagens e situações), nunca dados pessoais de clientes " +
  "individuais — se perguntarem algo que exigiria dado pessoal específico (CPF, telefone, " +
  "endereço, etc.), explique que essa informação não é compartilhada com você por segurança " +
  "e sugira consultar diretamente a tela do cliente no sistema. Ajude com dúvidas sobre como " +
  "usar o sistema, dicas de gestão da carteira de clientes e interpretação dos números do " +
  "resumo fornecido.";

function montarConteudo(historico, contexto, pergunta) {
  const contents = [];

  (Array.isArray(historico) ? historico : []).slice(-10).forEach((m) => {
    const texto = (m && m.texto) ? String(m.texto).slice(0, 4000) : "";
    if (!texto) return;
    contents.push({
      role: m.autor === "assistente" ? "model" : "user",
      parts: [{ text: texto }],
    });
  });

  const perguntaComContexto = contexto
    ? `Resumo atual do sistema (anonimizado):\n${String(contexto).slice(0, 4000)}\n\nPergunta do usuário: ${pergunta}`
    : String(pergunta || "");

  contents.push({ role: "user", parts: [{ text: perguntaComContexto }] });
  return contents;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ erro: "Use o método POST." });
    return;
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(501).json({
        erro:
          "Assistente de IA ainda não configurado. Crie uma chave gratuita em " +
          "https://aistudio.google.com/apikey e defina GEMINI_API_KEY nas variáveis de " +
          "ambiente do projeto na Vercel (depois faça um Redeploy).",
      });
      return;
    }

    const { pergunta, contexto, historico } = req.body || {};
    const perguntaTexto = (pergunta || "").toString().trim();
    if (!perguntaTexto) {
      res.status(400).json({ erro: "Envie uma pergunta no campo \"pergunta\"." });
      return;
    }

    const corpo = {
      systemInstruction: { role: "system", parts: [{ text: INSTRUCAO_SISTEMA }] },
      contents: montarConteudo(historico, contexto, perguntaTexto),
      generationConfig: { temperature: 0.4, maxOutputTokens: 800 },
    };

    const resp = await fetch(`${GEMINI_URL}?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corpo),
    });

    if (resp.status === 429) {
      res.status(200).json({
        resposta: "O assistente atingiu o limite de uso gratuito do momento. Tente novamente em alguns instantes.",
      });
      return;
    }

    if (!resp.ok) {
      const detalhe = await resp.text().catch(() => "");
      const erro = new Error(`O assistente de IA não respondeu (HTTP ${resp.status}). ${detalhe}`.trim());
      erro.status = 502;
      throw erro;
    }

    const dados = await resp.json();
    const resposta =
      dados?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("").trim() || "";

    if (!resposta) {
      res.status(200).json({
        resposta: "Não consegui gerar uma resposta agora. Pode reformular a pergunta ou tentar novamente em instantes?",
      });
      return;
    }

    res.status(200).json({ resposta });
  } catch (e) {
    res.status(e.status || 500).json({
      erro: e.message || "Não foi possível falar com o assistente de IA no momento. Tente novamente.",
    });
  }
}
