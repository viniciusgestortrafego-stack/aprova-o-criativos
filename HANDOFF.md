# Ferramenta de Criativos: handoff

Ferramenta web para agência de tráfego pago com dois módulos:

1. **Criativos ativos:** lista os anúncios que estão rodando em cada conta da Meta, com miniatura, link para o post no Instagram, status e agrupamento por objetivo da campanha. Gera um link para o cliente acompanhar sem login.
2. **Aprovação de criativos:** você cola links do Instagram ou de vídeos e pastas do Google Drive, a ferramenta gera um link, e o cliente responde **Aprovar**, **Ajustar** ou **Reprovar** em cada criativo, com comentário e histórico.

Este pacote é o código completo e funcionando, sem nenhuma chave, ID ou dado da agência de origem. Tudo o que é específico da sua agência entra pelas variáveis de ambiente.

> **Usando o Claude Code?** Abra esta pasta nele e peça: "Leia o HANDOFF.md e me guie na configuração, um passo por vez." O documento foi escrito para servir também de contexto para ele.

---

## 1. O que você vai precisar

| Conta / ferramenta | Para quê | Custo |
|---|---|---|
| **Meta Business Manager** da agência, com as contas de anúncio dos clientes | Ler os anúncios | Grátis |
| **Usuário do sistema** na BM (System User) com permissão `ads_read` | Token que não expira | Grátis |
| **GitHub** | Guardar o código (repositório **privado**) | Grátis |
| **Vercel** | Hospedar o site | Grátis só para uso **não comercial**. Para usar com cliente, o correto é o plano **Pro** (cerca de US$ 20/mês por membro; confira o preço atual) |
| **Neon** (pela Vercel) | Banco de dados da aprovação | Plano grátis atende bem |
| **Google Cloud** | Chave de API para ler pastas do Drive | Grátis, sem cartão |
| **Node.js 20+** | Rodar no computador | Grátis |

---

## 2. Configuração passo a passo

### 2.1 Instalar e rodar no computador

```bash
npm install
cp .env.example .env.local   # no Windows: copy .env.example .env.local
```

Preencha o `.env.local` com as 6 variáveis abaixo. **Esse arquivo nunca vai para o GitHub** (já está no `.gitignore`).

### 2.2 As variáveis

| Variável | Como conseguir |
|---|---|
| `META_ACCESS_TOKEN` | BM → Configurações do negócio → Usuários do sistema → crie um (função **Admin**) → Gerar token, marcando `ads_read`. Atribua a ele as contas de anúncio, ou deixe como Admin da BM (a ferramenta lê todas as contas da BM). |
| `META_BUSINESS_ID` | O número da sua BM (aparece na URL de business.facebook.com, `business_id=...`). Não é segredo. |
| `LINK_SECRET` | Gere com `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`. Assina os links dos clientes. **Trocar invalida todos os links já enviados.** |
| `ADMIN_PASSWORD` | Gere do mesmo jeito (`randomBytes(18)`). É a senha do painel; o usuário pode ser qualquer coisa. |
| `DATABASE_URL` | Veja 2.4. |
| `GOOGLE_API_KEY` | Veja 2.5. |

### 2.3 Testar o módulo de criativos

```bash
npm run build && npm run start
```

Abra `http://localhost:3000`, entre com qualquer usuário e a `ADMIN_PASSWORD`. Devem aparecer as contas da BM. A aprovação ainda vai dar erro até o banco existir.

### 2.4 Banco de dados (Neon pela Vercel)

1. Suba o código num repositório **privado** do GitHub e crie o projeto na Vercel ligado a ele (`vercel link`).
2. Instale o Neon no projeto:
   ```bash
   vercel integration add neon --plan free_v3 -m region=iad1 -m auth=false --no-env-pull
   ```
   Na primeira vez a Vercel pede para aceitar os termos do Neon no navegador; aceite e rode o comando de novo.
3. Copie o `DATABASE_URL` que a Vercel criou para o seu `.env.local` (`vercel env pull` num arquivo **separado** e copie só essa linha, **sem aspas**).
4. Crie as tabelas:
   ```bash
   node --env-file=.env.local db/aplicar.mjs
   ```

### 2.5 Chave do Google Drive

1. console.cloud.google.com → crie um projeto.
2. APIs e serviços → Biblioteca → **Google Drive API** → Ativar.
3. Credenciais → Criar credenciais → **Chave de API**.
4. Restrições do aplicativo: **Nenhum** (a chave é usada pelo servidor; "Sites" e "IP" não funcionam na Vercel).
5. Restrições de API: **Restringir chave → só Google Drive API**. Salve.

### 2.6 Publicar

Cadastre as mesmas variáveis na Vercel (marque como **Sensitive**). O `DATABASE_URL` a integração já cadastrou.

```bash
vercel env add META_ACCESS_TOKEN production --sensitive
# repita para META_BUSINESS_ID, LINK_SECRET, ADMIN_PASSWORD, GOOGLE_API_KEY
```

Depois, todo `git push` na branch principal publica sozinho.

### 2.7 Endereço próprio (opcional)

Adicione um subdomínio no projeto da Vercel (ex.: `criativos.suaagencia.com.br`) e crie no DNS do domínio um CNAME apontando para `cname.vercel-dns.com`. O certificado HTTPS sai sozinho.

---

## 3. Como usar

**Criativos ativos**
1. Painel (`/`): lista as contas da BM. Contas desativadas na Meta aparecem com a etiqueta "com restrição".
2. Clique numa conta: aparecem os criativos agrupados por objetivo (Vendas, Leads, Engajamento, Tráfego, Reconhecimento e Posts impulsionados), com busca, filtro Ativos/Inativos/Todos e filtro pelas tags `[ENTRE COLCHETES]` do nome da campanha.
3. **Copiar link**: manda para o cliente. Abre sem senha e mostra só a conta dele.

**Aprovação**
1. Painel → **Aprovação de criativos**.
2. Preencha cliente, nome da rodada e cole os links, um por linha: posts do Instagram, vídeos do Drive ou pastas do Drive (compartilhadas como "Qualquer pessoa com o link"). O texto depois de cada link vira a observação daquele criativo.
3. Mande o link gerado. O cliente digita o nome uma vez e responde cada criativo. Ajustar e Reprovar pedem comentário.
4. A página da rodada mostra o placar e o histórico de cada criativo (quem, quando e o quê).

---

## 4. Regras de negócio (e por quê)

- **Ativo = status ativo na Meta E dentro da data de término** do conjunto e da campanha. A Meta continua marcando como ativo um anúncio cuja data já passou; na conta de origem, 339 de 412 "ativos" já tinham acabado.
- **Em análise e em processamento contam como ativos**, com o texto "Ativo · em análise". "Preparando" no Gerenciador já é ativo na API.
- **Inativos mostrados** = só os que veicularam nos **últimos 7 dias** (relatório de entrega da Meta), com o motivo (campanha desligada, conjunto desligado, anúncio desligado, encerrado). Buscar o histórico inteiro levava mais de 40 segundos numa conta grande.
- **Agrupamento pelo objetivo da campanha na API**, não pela tag do nome: as tags variam (`LEAD`, `LEADS`, `FORMULÁRIO`, colchete quebrado) e o objetivo da Meta bateu em 100% dos casos.
- **Posts impulsionados** = campanha que começa com "Post do Instagram", "Instagram post", "Publicação do Instagram" ou "Publicação".
- **Contas** vêm da BM (contas próprias + contas de clientes). `/me/adaccounts` só traz as atribuídas direto ao usuário do sistema.
- **Link do Instagram** = `instagram_permalink_url` + `#advertiser`, o mesmo do "Post do Instagram com comentários" do Gerenciador.
- **Nome de quem aprova** fica salvo no navegador de cada aparelho (não no link). Cada clique vira uma linha nova no banco; vale a resposta mais recente.

---

## 5. Arquitetura

Next.js 14 (App Router) + Tailwind, servidor fala direto com a Graph API da Meta (v23.0), Neon (Postgres) para a aprovação e Drive API v3 para pastas.

| Arquivo | Papel |
|---|---|
| `src/lib/meta.ts` | Contas, criativos, regra de ativo/inativo (único lugar que usa o token) |
| `src/lib/tags.ts` | Agrupamento por objetivo e tags do nome |
| `src/lib/assinatura.ts` | Assinatura HMAC dos links (conta e rodada usam prefixos diferentes) |
| `src/lib/senha.ts`, `src/lib/painel.ts`, `src/middleware.ts` | Senha do painel (checada no middleware **e** de novo em cada página) |
| `src/lib/aprovacoes.ts` | Banco da aprovação |
| `src/lib/links.ts`, `src/lib/drive.ts` | Leitura da lista de links e das pastas do Drive |
| `src/app/aprovacoes/acoes.ts`, `src/app/a/[token]/acoes.ts` | Criar rodada (exige senha) e responder (exige link válido) |
| `src/components/estilos.ts`, `src/app/globals.css` | Visual: cores (tokens claro/escuro), botões, campos |
| `db/schema.sql`, `db/aplicar.mjs` | Tabelas `rodadas`, `itens`, `respostas` |

**Rotas:** `/` e `/conta/[id]` (painel), `/c/[token]` (cliente vê criativos), `/aprovacoes` e `/aprovacoes/[id]` (painel de aprovação), `/a/[token]` (cliente aprova).

---

## 6. Segurança

- Nenhuma chave vai para o navegador: nenhuma variável usa o prefixo `NEXT_PUBLIC_`, e os módulos que tocam em chave importam `server-only` (o build quebra se alguém importar no lado do navegador).
- Painel protegido por senha no middleware **e** de novo dentro de cada página e de cada ação (defesa contra a falha CVE-2025-29927 do Next, que permitia pular o middleware; use Next **14.2.25 ou mais novo**).
- Link do cliente é `ID.assinatura`; trocar o ID para outra conta dá 404. Link de conta não abre rodada e vice-versa.
- Ações de servidor podem ser chamadas por POST de qualquer rota, por isso **toda ação de painel chama `exigirAdmin()` na primeira linha**.
- `Referrer-Policy: no-referrer` e `noindex` em tudo (a assinatura está na URL).
- O que o cliente vê: nome das campanhas, conjuntos e anúncios dele. Se sua equipe escreve observação interna no nome da campanha, o cliente vai ler.

---

## 7. Armadilhas que já custaram tempo

- **Campo inexistente na Graph API derruba a requisição inteira** (erro 400 e tudo zera). Teste campo novo isolado antes.
- **O Next 14 cacheia requisições POST.** O driver do Neon consulta via POST; sem `fetchOptions: { cache: "no-store" }` a tela mostra a resposta antiga. Já está no código; não remova.
- **`vercel integration add` mexe no seu projeto:** sem `--no-env-pull` ele pode regravar o `.env.local` com o que está na Vercel, e variável marcada como Sensitive não volta pelo CLI. Faça backup do arquivo antes. Ele também instala skills do Neon em `.agents/` e `.claude/` dentro da pasta; não são necessárias.
- **`vercel env pull` grava o `DATABASE_URL` entre aspas.** O app lê certo, mas script seu que ler o arquivo na mão precisa tirar as aspas. Nunca imprima o erro do driver do Neon em log: ele mostra a URL com senha.
- **Banco único:** o Neon da integração é o mesmo para teste local e produção. Rodada criada no seu computador aparece no painel real; apague as de teste.
- **Pasta do Drive restrita não funciona**, nem se você tiver acesso: a chave de API só enxerga "Qualquer pessoa com o link". A API devolve 404 e o painel avisa.
- **Chrome em modo invisível (testes automatizados) toca som** nas caixas do computador. Use `--mute-audio`.

---

## 8. Ideias que ficaram de fora

- Link de aprovação por pessoa, com o nome já embutido (ninguém responde no nome de outro).
- Pasta do Drive compartilhada só com o e-mail da agência (exige login Google e copiar os vídeos para uma pasta pública da agência).
- Revogar o link de um cliente sem derrubar os outros (exige guardar os links no banco).
- Métricas por criativo (gasto, CTR, resultado). Hoje é só inventário.
