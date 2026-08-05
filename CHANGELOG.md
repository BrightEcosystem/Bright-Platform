# Changelog — Bright Multi Plataforma

Histórico de fases do projeto, uma entrada por commit relevante. Segue Conventional Commits (`BE-001 §9`). Para a Constituição de produto especificamente, ver `docs/product/CHANGELOG.md`. Para a sequência/dependência entre fases, ver `PROJECT-ROADMAP.md`.

## *(em andamento)* — feat: aplica schema, funções e RLS da CORE-002.1 ao Supabase real

Autorizada pela Direção com decisões finais (permissões `tenant.consumers.view`/`tenant.consumers.manage` mapeadas a `tenant.admin`/`platform.admin`; estado terminal `closed` com `closed_at`/`closed_reason`; idempotência única por tenant; precisão por `asset_type` — decimal+moeda para cashback, inteiro para pontos/XP/tickets; `criar_lancamento` reforçada), o plano técnico evoluiu para v0.3.0 e 8 migrations foram aplicadas ao projeto Supabase real: tabelas `contas_fidelidade`/`lancamentos`, 5 funções `security definer` (`has_permission`, `join_tenant_loyalty`, `alterar_status_conta_fidelidade`, `recalcular_saldo_conta_fidelidade`, `criar_lancamento`), RLS completa (apenas `SELECT`, nenhuma escrita direta de cliente) e extensão aditiva do catálogo de permissões. Matriz de 24 testes obrigatórios executada com dados fictícios reais (usuários criados via Admin API, sessão simulada via `request.jwt.claim.sub`) — **24/24 aprovados**, após duas correções aplicadas na própria execução: (1) `REVOKE EXECUTE/privilégios de tabela FROM PUBLIC` não bloqueava `anon`/`authenticated` neste projeto Supabase, que concede privilégios automaticamente via `alter default privileges` a cada papel na criação de tabelas/funções — corrigido revogando explicitamente de cada papel; (2) a checagem de saldo suficiente em `criar_lancamento` bloqueava incorretamente estornos, que devem sempre poder corrigir um lançamento anterior. Ver `docs/reports/CORE-002.1-Relatorio.md`. Nenhuma alteração em tabela existente do Core, nenhum código-fonte da aplicação alterado. Dados fictícios 100% removidos e confirmados por consulta. `CORE-002.2` (autenticação real) aguarda nova confirmação da Direção.

## *(em andamento)* — docs: revisão final do schema e da RLS da CORE-002 (CORE-002.1, plano técnico v0.2.0)

A Direção revisou a modelagem física inicial da CORE-002 (v0.1.0) e **não autorizou migrations**, exigindo 14 ajustes obrigatórios antes de qualquer alteração no Supabase real, sob a sub-fase formal **CORE-002.1 — Revisão Final do Schema e da RLS**. Todos os 14 incorporados em `docs/architecture/CORE-002-Plano-Tecnico.md` v0.2.0: `lancamentos` passa a ser um ledger **unificado** por `asset_type` (cashback/points/xp/tickets, em vez de um campo `tipo` cashback|ponto), com `natureza` (crédito/débito) e `valor` sempre positivo; chave de idempotência obrigatória (`idempotency_key`, única, construída a partir de `tenant_id`+`source_type`+`source_reference`+`asset_type`); referência estruturada ao evento de origem (`source_type`/`source_reference`); declaração formal de que o saldo oficial é sempre derivado do ledger (`contas_fidelidade.balance_cashback`/`balance_points`/`xp_atual` são cache/projeção, nunca fonte de verdade); RLS completa por operação (SELECT/INSERT/UPDATE/DELETE) e por ator (consumidor, colaborador do tenant, `platform.admin`, servidor), incluindo uma nova função `has_permission` para granularidade de permissão dentro de RLS (primeira tabela do Core a precisar disso); criação de lançamento exclusivamente via função `security definer` (`criar_lancamento`), nunca por `INSERT` direto de nenhum ator — nenhum uso de `service_role` no navegador; lista de 6 índices obrigatórios; estratégia de rollback (tabelas aditivas, sem dado real ainda). Nenhuma migration aplicada, nenhuma alteração destrutiva em tabela existente. Aguardando nova autorização explícita da Direção antes de qualquer ação em banco.

## *(em andamento)* — docs: análise inicial da CORE-002 (plano técnico)

Modelagem física proposta para `contas_fidelidade` e `lancamentos` (tabelas aditivas, sem alterar nada do Core existente), RLS mapeada 1:1 da Matriz Oficial (`IDENT-001 §7`), estratégia de autenticação real do consumidor (identidade única, sem reuso de `tenant_memberships`), e plano de execução em 5 sub-fases com commit isolado cada uma. Nenhuma migration aplicada ainda — aguardando confirmação da Direção. Ver `docs/architecture/CORE-002-Plano-Tecnico.md`.

## *(gate)* — HOM-001 aprovada pela Direção; QA-001 não executada; CORE-002 liberada

Gate de decisão fechado: a Direção confirmou a recomendação de `HOM-001` (**APROVADO**, sem ressalvas) após a evidência de clique/digitação reais na URL pública. `QA-001` não foi executada — nenhum defeito impeditivo encontrado. `CORE-002` (Evolução do Core — Integração Real) liberada para início: autenticação real do consumidor, Conta Fidelidade real (`IDENT-001`), dados reais do Supabase, carteira/cashback reais, remoção gradual dos mocks. Gamificação e demais mecânicas permanecem fora de escopo nesta fase.

## `4da4b92` — docs: confirma fluxo de login por clique real na URL pública (HOM-001)

A pedido da Direção, refeito o teste de interação usando digitação real via teclado e clique real por coordenada de mouse na URL pública, com sessão previamente limpa. Resultado: navegação real confirmada Entrar → Início, e Início → Carteira via navegação inferior, sem erros de console. Ressalva de severidade Baixa removida do relatório de `HOM-001`.

## `e59097a` — fix: corrige tema claro do Aplicativo do Consumidor não aplicado (HOM-001)

Falha crítica encontrada durante a homologação pública: o fundo escuro da Retaguarda aparecia em todas as telas do Aplicativo do Consumidor porque o bloco `@theme` de `consumer-theme.css` não estava na cadeia de build do Tailwind (era importado via JS em um layout aninhado, não via `@import` de CSS a partir de `globals.css`). Corrigido movendo a importação para `@import` de CSS na raiz do Tailwind. Confirmado via computed style e capturas de tela em produção. Nenhuma alteração visual na Retaguarda.

## `ad06b6d` — chore: conecta Vercel e realiza primeiro deploy de produção (HOM-001)

Repositório `BrightEcosystem/Bright-Platform` tornado público (decisão da Direção — histórico completo verificado sem segredos antes da mudança) para contornar a limitação do plano Hobby da Vercel com repositórios privados de organização. Projeto `bright-ecosystem/web` conectado ao repositório. Configuradas as duas variáveis exigidas pelo build (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — valores públicos por design, chave `anon`, não `service_role`). Primeiro deploy de produção com sucesso: `https://web-bn7zgaumy-bright-ecosystem.vercel.app`. Nenhuma credencial privilegiada adicionada, nenhuma migration, nenhum dado real conectado.

## *(em andamento)* — docs: cria fase HOM-001 e corrige status/relatório de APP-001

A Direção decidiu que a validação local (lint/build/HTTP) não substitui a homologação visual pública exigida antes de `CORE-002`. `APP-001` passa a constar como **implementação concluída, homologação pendente** (antes constava como "Concluída"). Corrigida no relatório de `APP-001` uma ambiguidade sobre o teste do fluxo Entrar → Início (cronologia exata reconciliada: o clique simulado não produziu efeito observável em três tentativas, mas a lógica foi comprovada correta por invocação direta do handler — ver `docs/reports/APP-001-Relatorio.md §5`) e a contagem de rotas (12 telas de `UX-001` + 1 rota técnica de redirecionamento = 13 rotas Next.js, antes descrita de forma inconsistente). Criada a fase `HOM-001` — Homologação do Aplicativo do Consumidor — bloqueada externamente pela conexão manual entre Vercel e GitHub. `CORE-002` não iniciada.

## `680918a` — feat: fundação visual do Aplicativo do Consumidor (APP-001)

Primeira versão pública em código do Aplicativo do Consumidor, com dados 100% mockados: as 12 telas de `UX-001` (mais 1 rota técnica de redirecionamento) sob `/cliente/*`, os 16 componentes de `DS-001` (incluindo tokens de cor/tipografia/animação), navegação inferior fixa, sessão mockada em `localStorage` (sem autenticação real) e camada de dados mock cobrindo as entidades de `DATA-001`. Corrigido um bloqueio real: o middleware de autenticação da Retaguarda (`src/proxy.ts`) redirecionava qualquer acesso a `/cliente/*` para `/login` — agora tratado como caminho público, já que a identidade do consumidor (`IDENT-001`) é um domínio de autenticação separado do multiempresa administrativo. Build e lint validados; nenhuma tabela, migration, RLS ou autenticação real alterada. **Implementação concluída — homologação visual pública pendente (`HOM-001`)**, decisão da Direção.

## `972fb27` — docs: design system do Aplicativo do Consumidor (DS-001)

Paleta oficial de cores (azul-violeta primária, amarelo-ouro secundária, verde apoio, laranja alerta, vermelho erro, fundo claro), tipografia oficial (Inter), ícones, grid/responsividade (Mobile First confirmado, sem experiência desktop separada), espaçamento, bordas/elevação, regra formal de animação (quatro momentos especiais: subir de nível, concluir missão, ganhar recompensa, abrir prêmio) e catálogo conceitual de 16 componentes (incluindo Card de Recompensa, Indicador de Nível, Barra de XP, Banner Inteligente), implementando os wireframes de `UX-001`. Reconciliação explícita com o padrão visual já existente na Retaguarda. Todas as decisões de marca congeladas — mudança futura exige ADR. Sem código, sem componentes React implementados, sem alteração de banco. Aprovado pela Direção.

## `318339c` — docs: arquitetura da experiência do consumidor (UX-001)

Mapa de navegação completo (12 telas), wireframes textuais e fluxo por tela (objetivo/componentes/ações/estados/navegação/regras), fluxos de onboarding, envio de comprovantes, missões, gamificação, Marketplace de Benefícios, notificações e campanhas. Princípio de UX Emocional (cinco perguntas-guia). Notificações separadas em Central de Notificações (operacional) e Central de Novidades (promocional). Estado "Primeiro acesso" em todas as telas. Selo "Em breve" obrigatório na tela Jogar até liberação jurídica e implementação técnica. Seleção de contexto de empresa não bloqueante, conforme `IDENT-001`. Aprovado pela Direção. Sem código, sem componentes React, sem alteração de banco.

## `af83667` — docs: modelo conceitual de dados da Bright Multi Plataforma (DATA-001)

Catálogo de 15 entidades do domínio de fidelidade/gamificação, todas ancoradas na Conta Fidelidade (`IDENT-001`), com estado (cria/altera/consulta/administra/consome), origem da informação, eventos de ciclo de vida e dependências por entidade. Diagrama ER completo. "Marketplace" padronizado como "Marketplace de Benefícios". Aprovado pela Direção. Sem SQL, sem migrations, sem alteração de banco.

## `8461039` — docs: congela o modelo de identidade do consumidor (IDENT-001)

Conta Fidelidade definida como entidade central do relacionamento consumidor × empresa parceira (rejeitados: `ConsumidorEmpresa`, `Participação`, `Carteira`), com proprietário, relacionamento, responsabilidades e ciclo de vida. Fluxo Oficial do Consumidor v1 congelado. Matriz Oficial de RLS (Visualiza/Edita/Administra) definida por ator. Aprovado pela Direção após duas rodadas de revisão — todos os itens listados em `IDENT-001 §11` (Congelamento Arquitetural) só podem mudar por ADR.

## `9fbae05` — docs: consolida arquitetura completa da Bright Multi Plataforma (ARCH-001)

Três camadas documentadas (Core da Plataforma, Retaguarda da Empresa, Aplicativo do Consumidor), camadas técnicas, comunicação entre módulos, modularização por contratação (reaproveitando `products`/`tenant_products`), riscos de escalabilidade nomeados. Reconhece `CORE-001` como fundação real da Retaguarda da Empresa. Adiciona `PROJECT-ROADMAP.md` e este `CHANGELOG.md`.

## `e9cbd67` — docs: corrige ADR-002 e padroniza nomenclatura da Bright Multi Plataforma

Corrige uma versão anterior (nunca commitada) de `ADR-002` que misturava escopo com produtos fora do projeto. Arquitetura oficial: projeto único, três camadas (Core da Plataforma, Retaguarda da Empresa, Aplicativo do Consumidor). Padroniza terminologia em todos os documentos de `docs/product/` e em `BE-002 §3`. Inclui `docs/reports/PRODUCT-002-Relatorio-de-Auditoria-Tecnica.md`.

## `9e3d73e` — docs: aprova constituicao do produto Bright Rewards (PRODUCT-001 v0.1.0)

Primeira versão da Constituição do produto em `docs/product/` (posteriormente corrigida em nomenclatura pelo commit acima).

## `36b043c` — feat: prepara infraestrutura de deploy (CI minimo e documentacao Vercel)

Workflow de CI (install/lint/build), versão mínima do Node fixada, arquitetura de deploy e runbook de rollback documentados. Conexão real com a Vercel pendente de ação manual.

## `8d39c71` — feat: cria estrutura inicial da area autenticada

Layout com sidebar/header filtrados por permissão, dashboard institucional, Minha Conta, Empresa, Usuários, Produtos, Configurações, `/sem-permissao`. Hoje reconhecida como a fundação da Retaguarda da Empresa (`ARCH-001`).

## `22a6f6f` — feat: implementa catalogo inicial de permissoes

Catálogo de 15 permissões, 4 papéis de sistema, helpers de autorização granular (`hasPermission`/`requirePermission` etc.).

## `226730e` — fix: corrige validacao da autenticacao multiempresa

Dois bugs corrigidos na validação funcional do `AUTH-001`: cookie de tenant ativo não limpo no logout; redirecionamento indevido em `/selecionar-empresa`.

## `a6decaf` — feat: implementa autenticacao multiempresa

Login, logout, recuperação de senha, seleção de empresa ativa, proteção de rotas via Proxy + layout.

## `3182c78` — feat: aplica fundacao multiempresa no Supabase

7 migrations aplicadas ao projeto Supabase real, RLS validada em todas as tabelas.

## `c439a07` — feat: prepara arquitetura multiempresa e fundacao Supabase

Schema multiempresa inicial (10 tabelas), ainda como migrations locais não aplicadas.

## `7f0cb81` — feat: cria fundação técnica inicial da Bright Platform

Scaffold Next.js 16 + TypeScript + Tailwind, estrutura oficial de pastas, layout base.
