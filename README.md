# Corretora Seu Seguro — Clientes, Veículos e Financeiro

Sistema web de gestão de clientes, veículos e recebimentos, com banco de dados no Supabase.

## 1. Criar o banco de dados no Supabase

1. Crie uma conta grátis em https://supabase.com e clique em **New project**.
2. Escolha um nome e uma senha para o banco (guarde a senha) e aguarde o projeto ser criado (leva 1-2 minutos).
3. No menu lateral, abra **SQL Editor** → **New query**.
4. Copie todo o conteúdo do arquivo `supabase/schema.sql` (desta pasta), cole no editor e clique em **Run**.
   Isso cria as tabelas `clientes`, `veiculos` e `boletos` já relacionadas entre si.
5. No menu lateral, abra **Project Settings** → **API**. Você vai precisar de dois valores:
   - **Project URL**
   - **anon public key**

## 2. Configurar o projeto localmente

Requisitos: ter o [Node.js](https://nodejs.org) instalado (versão 18 ou superior).

1. Extraia esta pasta em seu computador e abra um terminal dentro dela.
2. Copie o arquivo de exemplo de variáveis de ambiente:
   ```
   cp .env.example .env
   ```
3. Abra o arquivo `.env` e cole a URL e a chave que você pegou no passo 1.5:
   ```
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anonima
   ```
4. Instale as dependências:
   ```
   npm install
   ```
5. Rode localmente para testar:
   ```
   npm run dev
   ```
   Acesse o endereço mostrado no terminal (geralmente http://localhost:5173).

Se o dashboard abrir vazio e sem erros, está tudo funcionando — os dados agora ficam salvos no Supabase.

## 3. Consulta automática por CPF (nome e data de nascimento)

O campo CPF tem um botão **"Buscar dados"** (e busca sozinho ao sair do campo, com os 11 dígitos preenchidos) que preenche nome completo e data de nascimento.

**Atenção — isto envolve dados pessoais (LGPD):** diferente da placa/Fipe e do CEP, não existe fonte pública e gratuita para nome + nascimento a partir do CPF, porque essa é uma informação pessoal protegida. Você precisa contratar um provedor comercial (ex.: Serasa, Assertiva, BigDataCorp) e ter uma base legal para consultar — normalmente a execução do contrato com o próprio cliente que está sendo cadastrado. Vale confirmar com o provedor e, se possível, com um advogado, que o uso está adequado antes de colocar em produção.

Configuração (mesmo esquema da consulta de placa), no painel da Vercel → **Settings → Environment Variables**:
```
CPF_API_URL   = URL de consulta do provedor, com {cpf} no lugar do CPF (só números)
                Ex.: https://api.provedor.com/v1/pessoa/{cpf}
CPF_API_TOKEN = o token que o provedor te der
CPF_API_HEADER (opcional) = nome do header de autenticação, se não for "Authorization: Bearer"
```

Enquanto essas variáveis não estiverem configuradas, o botão mostra uma mensagem explicando o que falta, e o cadastro continua funcionando normalmente com preenchimento manual.

## 4. Perfis de usuário (Administrador / Operador)

O sistema tem dois níveis de acesso: **Administrador** (acesso total) e **Operador** (acesso ao dia a dia — Clientes, Veículos, Financeiro, Cotações e Comissões — sem ver Consultores, Adesões, Relatórios, Links Úteis nem a tela de Usuários).

Para ativar:

1. No **SQL Editor** do Supabase, copie e rode o conteúdo de `supabase/perfis-usuarios.sql`. Isso cria a tabela `perfis` e restringe Consultores/Adesões a administradores.
2. Rode o comando de exemplo no fim desse mesmo arquivo para transformar sua própria conta em administrador (troque o e-mail pelo que você usa para logar).
3. No painel da Vercel → **Settings → Environment Variables**, adicione:
   ```
   SUPABASE_SERVICE_ROLE_KEY = a chave "service_role" do seu projeto
                                (Supabase → Project Settings → API)
   ```
   Essa variável é secreta e usada só no servidor (`api/gerenciar-usuarios.js`) — nunca prefixe com `VITE_`.
4. Depois de publicar (ou rodar `vercel dev`), acesse **Usuários** no menu (só aparece para administradores) para criar os acessos da sua equipe, escolhendo o perfil de cada um.

Enquanto o passo 1 não for feito, a tela de Usuários simplesmente não aparece e o restante do sistema continua funcionando normalmente — nenhuma tabela existente é alterada.

## 5. Esteira de status das cotações

Cada cotação agora tem um status que representa o andamento da negociação: **Nova → Em análise → Enviada → Negociação → Aprovada / Recusada → Convertida**. O status aparece como uma coluna com um seletor rápido na tabela de "Cotações realizadas" (e como selo na aba Cotações do detalhe do cliente), além de um card com o total de cotações **Convertidas** no topo da página.

Para ativar:

1. No **SQL Editor** do Supabase, copie e rode o conteúdo de `supabase/status-cotacoes.sql`. Isso adiciona a coluna `status` na tabela `cotacoes` (todas as cotações já existentes ficam com "Nova" por padrão) — nenhum dado é apagado.
2. Pronto — não precisa de nenhuma variável de ambiente nem passo na Vercel. Recarregue a página depois de rodar o script.

Enquanto o passo 1 não for feito, o sistema continua salvando e editando cotações normalmente (só sem o campo de status); ao rodar o script, o recurso passa a funcionar sem precisar mexer em mais nada.

## 6. Consulta automática por placa (marca, modelo, ano e valor Fipe)

O sistema tem um botão **"Buscar dados"** no campo Placa (e outro para Chassi) que preenche marca, modelo e ano automaticamente, além do código Fipe e do valor de referência.

Isso funciona em duas etapas, feitas pelo arquivo `api/consulta-veiculo.js`:

1. **Consulta da placa** — a Tabela Fipe não aceita busca por placa, então essa etapa depende de um provedor pago à sua escolha (ex.: BigDataCorp, ou outro serviço de "consulta de placa"). Você precisa:
   - Criar conta no provedor escolhido e conseguir a URL de consulta e o token de acesso.
   - No painel da Vercel, ir em **Settings → Environment Variables** do projeto e adicionar:
     ```
     PLACA_API_URL   = URL de consulta do provedor, com {placa} no lugar da placa
                        Ex.: https://api.provedor.com/v1/veiculo/{placa}
     PLACA_API_TOKEN = o token que o provedor te der
     ```
   - Se o provedor exigir um header diferente de "Authorization: Bearer", adicione também `PLACA_API_HEADER` com o nome do header (ex.: `AccessToken`).
   - Essas variáveis são apenas de servidor — nunca coloque o prefixo `VITE_` nelas, senão o token vazaria no navegador.
2. **Consulta na Tabela Fipe** — usa a API pública e gratuita da Fipe (fipe.parallelum.com.br), sem necessidade de chave. Essa parte já funciona assim que a etapa 1 retornar marca/modelo/ano.

Enquanto `PLACA_API_URL` não estiver configurada, o botão "Buscar dados" mostra uma mensagem explicando o que falta, e o resto do sistema continua funcionando normalmente com preenchimento manual.

**Testando localmente:** como essa consulta roda numa função de servidor (Vercel Function), o `npm run dev` comum (Vite) não a executa. Para testar localmente, instale a CLI da Vercel (`npm i -g vercel`) e rode `vercel dev` na pasta do projeto — ou simplesmente teste depois de publicar.

## 7. Publicar o site (Vercel — grátis)

1. Crie uma conta em https://vercel.com (pode entrar com GitHub, GitLab ou e-mail).
2. Se você tiver o código num repositório do GitHub: no painel da Vercel, clique em **Add New → Project** e importe o repositório.
   Se preferir não usar GitHub, instale a CLI da Vercel (`npm i -g vercel`) e rode `vercel` dentro da pasta do projeto — ela publica direto do seu computador.
3. Quando a Vercel perguntar as variáveis de ambiente, adicione as mesmas duas do seu `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Clique em **Deploy**. Em cerca de 1 minuto você recebe um endereço próprio, tipo `https://nexo-crm-seunome.vercel.app`.

Pronto — esse é o link que você pode acessar de qualquer computador ou celular, e os dados ficam salvos permanentemente no Supabase.

## Observação sobre segurança

As tabelas foram criadas com acesso liberado para a chave pública (anon), o que é adequado para uso interno com o link não divulgado. Se for expor o sistema publicamente ou para vários clientes externos, ative o **Authentication** do Supabase e ajuste as políticas de acesso (RLS) em `supabase/schema.sql` para exigir login.

## Estrutura do projeto

```
src/
  App.jsx            → toda a aplicação (dashboard, clientes, veículos, financeiro)
  supabaseClient.js  → conexão com o Supabase
  main.jsx           → ponto de entrada do React
api/
  consulta-veiculo.js   → consulta de placa/chassi + Fipe (servidor)
  consulta-cpf.js       → consulta de CPF (servidor)
  gerenciar-usuarios.js → criar/excluir usuários e alterar perfil (servidor, admin)
supabase/
  schema.sql              → script para criar as tabelas no Supabase
  perfis-usuarios.sql     → script para ativar os perfis Administrador/Operador
  status-cotacoes.sql     → script para ativar a esteira de status das cotações
```
