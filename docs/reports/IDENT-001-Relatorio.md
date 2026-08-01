# IDENT-001 — Relatório

**Status:** Concluído e aprovado pela Direção — congelado (conceitual, nenhum código, banco ou migration alterados)
**Data:** 2026-08-01
**Responsável pela execução:** Claude Code

---

## 1. Objetivo cumprido

Documento `docs/architecture/IDENT-001-Modelo-de-Identidade.md` na versão final v0.3.0, aprovada pela Direção após duas rodadas de revisão (v0.1.0 rejeitada por falta da entidade central e do fluxo/RLS detalhados; v0.2.0 aprovada com quatro ajustes de formalização, incorporados nesta v0.3.0).

## 2. O que ficou congelado (§11 do documento técnico)

- **Identidade única** — mesmo mecanismo de autenticação para todos os papéis.
- **Conta Fidelidade** — nome oficial da entidade central do relacionamento consumidor × empresa parceira (rejeitados: `ConsumidorEmpresa`, `Participação`, `Carteira`), com proprietário, relacionamento, responsabilidades e ciclo de vida definidos (§8).
- **Relacionamento N:N** consumidor × empresa parceira.
- **Fluxo Oficial do Consumidor v1** — sequência única e decidida, base para `UX-001`, `APP-001`, onboarding, OCR e campanhas.
- **Matriz Oficial de RLS** — agora com três dimensões (Visualiza/Edita/Administra), não apenas leitura.

**Regra de governança registrada:** nenhum desses itens pode ser alterado diretamente em `DATA-001`, `UX-001` ou fases seguintes — mudança futura exige uma ADR, mesmo padrão de `ADR-001`/`ADR-002`.

## 3. Ajustes incorporados nesta rodada (v0.2.0 → v0.3.0)

- §8.4 reforçada com o diagrama Consumidor→Conta Fidelidade←Empresa e a frase de princípio "toda evolução da fidelidade acontece dentro da Conta Fidelidade".
- §7 (RLS) reconstruída com a coluna "Administra", cobrindo não só visualização mas também edição e administração, por ator.
- §6 renomeada para "Fluxo Oficial do Consumidor v1", com nota explícita de que mudanças futuras exigem ADR.
- Novo §11 "Congelamento Arquitetural", consolidando os cinco itens frozen e a regra de que só uma ADR os altera.

## 4. Validação

- Consistência com `ADR-002`: `IDENT-001 §9`, todos os itens confirmados.
- Fronteira com `DATA-001` (`IDENT-001 §10`): esquema físico da Conta Fidelidade, do livro-razão, e as permissões `tenant.consumers.view`/`tenant.consumers.manage` (propostas, não formalizadas) ficam para a próxima fase.

## 5. Documentação criada/atualizada

- `docs/architecture/IDENT-001-Modelo-de-Identidade.md` — v0.1.0 → v0.2.0 → v0.3.0 (final).
- `docs/reports/IDENT-001-Relatorio.md` (este documento).
- `PROJECT-ROADMAP.md`, `PROJECT-CHECKLIST.md`, `CHANGELOG.md` (raiz) — atualizados nesta rodada para refletir a conclusão.

## 6. Restrições respeitadas

Nenhum código escrito, nenhuma migration criada, nenhuma alteração de banco/RLS real, nenhum componente React criado.

## 7. Pendências que seguem para DATA-001 (não bloqueantes)

1. Métodos de autenticação do consumidor além de e-mail/senha — não decidido, mantido como está hoje.
2. Visibilidade entre colaboradores administrativos da mesma empresa (`CORE-001 §10`) — pendência antiga, não é escopo de Conta Fidelidade.
3. Formalização das permissões `tenant.consumers.view`/`tenant.consumers.manage` no catálogo — nomes propostos aqui, catálogo formal é `DATA-001`.
