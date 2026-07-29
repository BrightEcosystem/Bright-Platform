# ADR-001 — Modelo de Identidade e Multiempresa

**Status:** Aprovado
**Data:** 2026-07-29
**Relacionado a:** `BE-002-Arquitetura-Bright-Platform.md` §4, `BE-003-Arquitetura-de-Dados-e-Supabase.md`

---

## Contexto

`BE-002 §4` previa originalmente as entidades `users` e `memberships` como parte do modelo multiempresa, com uma lista de dez entidades incluindo `integrations`. Ao detalhar a implementação em `BE-003`/`DB-001`, a Direção de Engenharia optou por nomes mais precisos e por desmembrar o relacionamento de papéis em uma tabela própria (`membership_roles`), o que não estava previsto na lista original. Este ADR registra formalmente essa decisão e o porquê, para que `BE-002` não fique divergente do que foi de fato implementado.

## Decisão adotada

- A tabela de usuários da aplicação se chama **`profiles`**, não `users`.
- O vínculo entre um perfil e uma empresa se chama **`tenant_memberships`**, não `memberships`.
- A atribuição de papéis a um vínculo é uma tabela própria, **`membership_roles`**, que não constava na lista original de `BE-002`.
- **`integrations`** permanece no roadmap, mas é adiada para uma tarefa própria — não faz parte do modelo mínimo implementado em `DB-001`.

## Alternativas analisadas

1. **Manter uma tabela `users` própria com dados de autenticação.** Rejeitada: o Supabase Auth já gerencia credenciais, sessão e provedores de login em `auth.users`. Duplicar esses dados em uma tabela própria criaria risco de dessincronia entre o estado de autenticação e o estado de aplicação.
2. **Guardar o papel do membro como uma coluna simples em `tenant_memberships` (ex.: `role text`).** Rejeitada: um membro frequentemente precisa de mais de um papel simultâneo (ex.: "Gerente" e "Financeiro"), o que uma única coluna não suporta sem gambiarra (concatenar valores, etc.).
3. **Nomear a atribuição de papéis como `user_roles`, ligada direto ao perfil.** Rejeitada: um papel só faz sentido no contexto de um vínculo com uma empresa específica — um usuário pode ter papéis diferentes em empresas diferentes. Ligar direto ao perfil perderia essa granularidade por tenant.

## Motivo do uso de `profiles`

`profiles` estende `auth.users` (via FK 1:1 em `id`) apenas com dados de perfil de aplicação — nome, e-mail replicado, status. Essa é a separação de responsabilidade recomendada pelo próprio Supabase: autenticação fica inteiramente a cargo do `auth.users`, e a aplicação nunca escreve diretamente nesse schema.

## Motivo do uso de `tenant_memberships`

O nome deixa explícito que é o vínculo entre um perfil e uma empresa (tenant) — evita a ambiguidade de "memberships" genérico, que em outros contextos de produto (ex.: assinatura/plano) poderia ser confundido com algo diferente de vínculo organizacional.

## Motivo da separação `membership_roles`

Desacopla a atribuição de papéis do vínculo em si: papéis podem ser adicionados ou revogados de um membro sem tocar no registro de `tenant_memberships`, e um mesmo vínculo pode ter múltiplos papéis simultâneos — necessário para RBAC granular (ver `BE-003 §2.7`).

## Impacto sobre autenticação

Nenhuma mudança na autenticação em si — ela ainda não foi implementada (fora do escopo de `DB-001` e `SUP-001`). Fica registrado que, quando a autenticação real for conectada, será necessário um mecanismo (trigger de banco ou hook de aplicação) para criar automaticamente um `profiles` correspondente a cada novo `auth.users` — esse mecanismo é trabalho futuro, não coberto por este ADR.

## Impacto sobre RLS

Nenhum — as políticas de RLS em `BE-003 §5` já foram escritas usando `tenant_memberships` e a função `is_tenant_member()` desde a origem. O impacto deste ADR ficou restrito a `BE-002`, que descrevia um plano anterior com nomes diferentes.

## Consequências futuras

- Todo código de aplicação (frontend, backend, migrations futuras) deve usar `profiles` e `tenant_memberships` — não `users`/`memberships`.
- Qualquer novo documento `BE-XXX` que trate deste domínio deve manter esses nomes.
- A entidade `integrations` será modelada em uma tarefa própria futura, fora do escopo deste ADR e de `DB-001`.

## Status

**Aprovado** pela Direção de Engenharia.
