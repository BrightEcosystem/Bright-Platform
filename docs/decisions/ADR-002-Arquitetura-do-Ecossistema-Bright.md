# ADR-002 — Arquitetura da Bright Multi Plataforma

**Status:** Aprovado
**Data:** 2026-07-31
**Relacionado a:** `BE-002-Arquitetura-Bright-Platform.md` §3, `docs/product/020-Visao.md`, `docs/reports/PRODUCT-002-Relatorio-de-Auditoria-Tecnica.md` §8

> Este documento substitui uma versão anterior deste mesmo ADR (nunca commitada) que misturava, incorretamente, referências a produtos de um escopo mais amplo — Bright IA, Bright Licitações, Bright CRM como produtos irmãos, e "Bright Platform"/"Bright Rewards" tratados como projetos separados. Essa versão corrige o escopo: este projeto é um só, a **Bright Multi Plataforma**.

---

## Contexto

`PRODUCT-002` (auditoria técnica da Constituição de produto) identificou uma ambiguidade real entre o diagrama de `BE-002 §3` e o de `docs/product/020-Visao.md §5`. A primeira tentativa de resolver isso introduziu um modelo de três camadas, mas foi além do escopo deste projeto ao nomear "Bright IA", "Bright Licitações" e "Bright CRM" como produtos irmãos, e ao tratar "Bright Platform" e "Bright Rewards" como se fossem projetos/repositórios distintos. Nenhum desses produtos pertence a este projeto — a Direção corrigiu isso antes do commit.

## Escopo oficial deste projeto

Este projeto é exclusivamente a **Bright Multi Plataforma**: uma plataforma multiempresa de fidelidade, cashback, pontuação, gamificação e experiência interativa do consumidor, com retaguarda modular liberada por contratação. Não há outros produtos irmãos dentro deste escopo — CRM, IA, Licitações, ou qualquer produto fora do programa de fidelidade/gamificação não fazem parte desta arquitetura.

## Decisão adotada

A Bright Multi Plataforma tem **três camadas**, não três produtos separados — é um projeto único com duas experiências sobre o mesmo Core:

```text
Bright Multi Plataforma
│
├── Core da Plataforma
│   ├── Autenticação
│   ├── Multiempresa
│   ├── Usuários
│   ├── Permissões
│   ├── Produtos contratados
│   ├── Auditoria
│   └── Integrações-base
│
├── Retaguarda da Empresa
│   ├── Clientes
│   ├── Campanhas
│   ├── Pontuação
│   ├── Cashback
│   ├── Gamificação
│   ├── Benefícios
│   ├── Comprovantes
│   ├── Relatórios
│   └── Configurações
│
└── Aplicativo do Consumidor
    ├── Carteira de pontos
    ├── Cashback
    ├── Missões
    ├── Níveis
    ├── XP
    ├── Tickets
    ├── Roletas
    ├── Raspadinhas
    ├── Baús
    ├── Cupons
    ├── Indicação
    ├── Ranking
    └── Envio de comprovantes
```

### Responsabilidade de cada camada

- **Core da Plataforma** — infraestrutura compartilhada, sem regra de negócio de fidelidade/gamificação em si: autenticação, multiempresa, usuários, permissões, catálogo de produtos contratados (reaproveitando `tenants`/`products`/`tenant_products` já existentes), auditoria e integrações-base.
- **Retaguarda da Empresa** — a experiência operacional da empresa parceira: gestão de clientes, campanhas, configuração de pontuação/cashback/gamificação, cadastro de benefícios, validação de comprovantes, relatórios e configurações gerais. **Módulos da retaguarda são liberados conforme contratação** — a mesma lógica de habilitação por tenant já usada hoje (`tenant_products`), não um mecanismo novo.
- **Aplicativo do Consumidor** — a experiência do cliente final: carteira de pontos, cashback, missões, níveis, XP, tickets, roletas, raspadinhas, baús, cupons, indicação, ranking e envio de comprovantes. A entrada e a navegação do aplicativo devem ter caráter gamificado, com experiência semelhante a um jogo interativo — **sem depender de aposta financeira entre usuários** (nenhuma mecânica envolve um consumidor apostando contra outro, ou contra a própria plataforma, com dinheiro real; prêmios são sempre benefícios/pontos/cupons obtidos por engajamento, nunca por contrapartida financeira do consumidor — ver `080-Seguranca.md` para o detalhamento de princípios de segurança/conformidade, ainda não atualizado por este ADR).

### Comunicação entre as camadas

- Retaguarda da Empresa e Aplicativo do Consumidor **consomem** o Core — nunca duplicam autenticação, multiempresa, permissões ou auditoria dentro de si mesmos.
- As duas experiências **não se comunicam diretamente entre si** — qualquer dado que uma precise da outra passa pelo Core (ex.: o Aplicativo do Consumidor precisa saber quais benefícios a empresa cadastrou na Retaguarda; isso é lido via dados do Core, não por uma chamada direta de uma experiência para a outra).

### Modelo de identidade

A identidade permanece **única** — não há um mecanismo de autenticação paralelo para o consumidor. Usuários administrativos (Retaguarda) e consumidores (Aplicativo do Consumidor) compartilham a mesma base de autenticação do Core. O que muda são os **vínculos e permissões**, não o mecanismo de login: **o consumidor não deve usar `tenant_memberships` como vínculo final** — esse modelo foi desenhado para colaboradores administrativos (RBAC, papéis, permissões granulares) e não se encaixa na relação consumidor-empresa. O desenho técnico do vínculo próprio do consumidor será tratado na fase `IDENT-001 — Modelo de Identidade do Consumidor e Revisão de RLS` (ainda não iniciada).

### Marketplace

Neste escopo existe **apenas um marketplace**: o **Marketplace de Benefícios**, dentro do Aplicativo do Consumidor — onde o consumidor visualiza e resgata benefícios, cupons, vantagens e recompensas das empresas participantes. **Não existe marketplace corporativo neste escopo.**

## Alternativas analisadas

1. **Manter "Bright Platform" e "Bright Rewards" como produtos/repositórios separados, com "Bright IA", "Bright CRM" e "Bright Licitações" como produtos irmãos adicionais.** Rejeitada: esses produtos pertencem a uma visão de ecossistema mais ampla, fora do escopo deste projeto. A Bright Multi Plataforma é um projeto único, focado exclusivamente em fidelidade, cashback e gamificação.
2. **Manter o modelo de três ramos original de `BE-002 §3` (Bright CORE / Bright Platform / Produtos).** Rejeitada pelos mesmos motivos já registrados na primeira tentativa deste ADR: não refletia a intenção de a experiência do consumidor ser de primeira classe, equivalente à retaguarda administrativa.
3. **Criar um mecanismo de identidade totalmente separado para o consumidor.** Rejeitada: duplicaria autenticação, recuperação de senha e gestão de sessão sem necessidade — o que muda é o vínculo, não o mecanismo de login.
4. **Usar `tenant_memberships`/`membership_roles` também para o vínculo do consumidor.** Rejeitada explicitamente pela Direção: esse modelo foi desenhado para RBAC administrativo (papéis, permissões granulares de colaborador) e não se encaixa na relação consumidor-empresa, que é de outra natureza (saldo, engajamento, não papel/permissão).

## Impacto sobre a arquitetura existente

- `BE-002 §3` atualizado para o diagrama desta seção.
- Todos os documentos de `docs/product/` (`000` a `090`) padronizados para a nomenclatura "Bright Multi Plataforma" / "Core da Plataforma" / "Retaguarda da Empresa" / "Aplicativo do Consumidor" / "Marketplace de Benefícios", sem menção a produtos irmãos fora de escopo. Nenhuma regra de negócio, fluxo, mecânica, economia ou roadmap foi alterado nessa padronização — apenas terminologia.
- Nenhuma migration, tabela ou código é alterada por este ADR.

## Consequências futuras

- Nenhum documento futuro deste projeto deve introduzir "Bright IA", "Bright Licitações", "Bright CRM" ou qualquer produto fora do programa de fidelidade/gamificação — esse conteúdo pertence a um escopo diferente.
- "Bright Platform" e "Bright Rewards" não devem ser usados como nomes de produtos/projetos separados — o nome do projeto é **Bright Multi Plataforma**; as duas experiências internas são **Retaguarda da Empresa** e **Aplicativo do Consumidor**. (Nota técnica: o repositório GitHub `BrightEcosystem/Bright-Platform` e o pacote `bright-platform` no código mantêm seus nomes atuais — renomear o repositório/pacote é uma mudança de infraestrutura fora do escopo deste ADR, não uma decisão de arquitetura de produto.)
- A próxima fase de arquitetura de identidade é `IDENT-001 — Modelo de Identidade do Consumidor e Revisão de RLS`, não `DB-001` (nome já usado pela fase original de schema, concluída).
- Módulos da Retaguarda da Empresa são liberados por contratação — qualquer novo módulo de retaguarda deve seguir esse princípio desde o desenho inicial, reaproveitando `tenant_products`.

## Status

**Aprovado** pela Direção de Engenharia.
