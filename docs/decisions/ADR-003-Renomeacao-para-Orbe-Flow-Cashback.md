# ADR-003 — Renomeação do Projeto para Orbe Flow - Cashback

**Status:** Aprovado
**Data:** 2026-08-05
**Substitui:** a decisão de nomenclatura de `ADR-002` (item "Marketplace"/nome do projeto) — a arquitetura técnica de `ADR-002` (três camadas, identidade única, Marketplace de Benefícios) **permanece integralmente válida e congelada**; apenas o **nome comercial do projeto** muda.
**Relacionado a:** `docs/decisions/ADR-002-Arquitetura-do-Ecossistema-Bright.md`, `docs/reports/CORE-002.2-Relatorio.md`

---

## Contexto

A Direção determinou que este projeto passa a se chamar **Orbe Flow - Cashback**, e solicitou verificação de que nenhum conteúdo de gestão de frotas existe no repositório. Uma busca completa no código-fonte, documentação e histórico do projeto (`grep` recursivo por "frota", "fleet", "veículo") **não encontrou nenhuma ocorrência** — este projeto sempre foi, exclusivamente, a plataforma de fidelidade/cashback/gamificação hoje chamada de "Bright Multi Plataforma" (`ADR-002`). Não há nada de gestão de frotas para remover.

## Decisão adotada

1. **Novo nome oficial do projeto:** **Orbe Flow - Cashback**.
2. **A arquitetura técnica congelada em `ADR-002` não muda:** três camadas (Core da Plataforma / Retaguarda da Empresa / Aplicativo do Consumidor), identidade única, Marketplace de Benefícios único, princípios de segurança (sem aposta financeira entre usuários) — tudo isso permanece exatamente como está. Esta ADR altera apenas o **nome comercial**, não a arquitetura.
3. **Escopo do produto reafirmado:** fidelidade, cashback, pontuação, gamificação (jogos, missões, XP, níveis, roleta/raspadinha/baús — sob o selo "Em breve" até liberação jurídica, `UX-001`) e demais mecânicas já documentadas em `DATA-001`/`UX-001`/`DS-001`. **Nunca houve, e não há agora, qualquer módulo de gestão de frotas neste projeto.**

## Artefatos atualizados nesta ADR ("branding vivo")

| Artefato | Alteração |
|---|---|
| `README.md` | Título e descrição atualizados para Orbe Flow - Cashback |
| `package.json` | Campo `name` atualizado para `orbe-flow-cashback` |
| `CLAUDE.md` | Nome do projeto/produto atualizado na tabela "Informações do projeto" e no texto introdutório |
| `PROJECT-ROADMAP.md` / `PROJECT-CHECKLIST.md` | Títulos atualizados para Orbe Flow - Cashback |
| Repositório GitHub | `BrightEcosystem/Bright-Platform` → renomeação solicitada; ver pendência técnica abaixo |

## O que **não** foi reescrito (registro histórico, não vivo)

Por decisão explícita da Direção (opção "Nova ADR + branding vivo", não "reescrever tudo"), os seguintes documentos **permanecem com o nome "Bright" tal como estavam**, pois são registro histórico de decisões já tomadas e commits já enviados ao GitHub — reescrevê-los apagaria o contexto real de por que cada decisão foi tomada:

- `CHANGELOG.md` (todas as entradas anteriores a esta)
- Todos os relatórios em `docs/reports/*.md`
- `ADR-001` e `ADR-002` (o texto original permanece; esta ADR os complementa, não os substitui integralmente)
- Documentos de arquitetura já congelados: `ARCH-001`, `IDENT-001`, `DATA-001`, `UX-001`, `DS-001`, `CORE-002-Plano-Tecnico.md`
- `docs/product/*` (Constituição do produto)

Documentos **futuros** (novas fases, novos relatórios) devem usar **Orbe Flow - Cashback** como nome do projeto.

## Pendência técnica: infraestrutura externa

A Direção autorizou também a renomeação do repositório GitHub, do projeto Vercel e do projeto Supabase. **Nenhuma dessas três ações pôde ser executada por mim nesta fase** — o ambiente de execução não tem uma ferramenta de "renomear repositório" no conjunto de ferramentas GitHub disponível, nem `gh` CLI instalado, nem acesso programático ao painel da Vercel ou às configurações de projeto do Supabase (apenas à API de migrations do banco). As três ações abaixo exigem ação manual da Direção:

1. **GitHub:** `github.com/BrightEcosystem/Bright-Platform` → **Settings → General → Repository name** → renomear para `Orbe-Flow-Cashback` (ou nome equivalente). O GitHub mantém um redirecionamento automático do nome antigo por tempo indeterminado, então nenhum link existente quebra imediatamente. Após o rename, o remote local precisa ser atualizado (`git remote set-url origin <nova-url>`) — posso fazer isso assim que a Direção confirmar o novo nome/URL.
2. **Vercel:** projeto `bright-ecosystem/web` → **Settings → General → Project Name** → renomear. Isso não altera a URL de produção automaticamente (a URL é um campo separado, "Domains").
3. **Supabase:** projeto `nsilqajyvezaaddlhwyu` → **Settings → General → Project Name** → renomear (é só o nome de exibição no painel; não altera a URL/API do projeto).

## Consequências futuras

- Todo documento novo deste projeto deve usar **Orbe Flow - Cashback** como nome oficial.
- Nenhum documento futuro deve introduzir conteúdo de gestão de frotas ou qualquer domínio fora de fidelidade/cashback/gamificação — isso nunca fez parte do escopo e esta ADR reafirma isso explicitamente.
- A arquitetura técnica de `ADR-002` permanece congelada; mudança futura na arquitetura (não no nome) continua exigindo uma nova ADR.
- Assim que a Direção confirmar a renomeação manual do repositório GitHub, o remote git local será atualizado em commit próprio.

## Status

**Aprovado** pela Direção de Engenharia.
