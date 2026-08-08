# AI

Estrutura de inteligência artificial da Bright Ecosystem.

- `agents/` — definições de agentes, objetivos e limites de atuação.
- `prompts/` — prompts versionados.
- `skills/` — referências técnicas e procedimentos reutilizáveis.
- `rules/` — regras e restrições para agentes de IA.
- `evaluations/` — avaliações de fluxos importantes.
- `schemas/` — contratos de validação para integrações.
- `catalog.yaml` — catálogo legível por máquina de todos os recursos de IA.

## Como localizar recursos sem perder o caminho

Todo sistema, agente ou integração deve iniciar por esta sequência:

1. Ler `/manifest.yaml`.
2. Confirmar `repository_id`, `product_id` e `status`.
3. Resolver a categoria em `/ai/catalog.yaml`.
4. Restringir a busca aos caminhos declarados em `canonical_paths`.
5. Se o caminho não existir, consultar `path_fallbacks`.
6. Retornar o caminho exato e o SHA do commit junto da resposta.

Fluxo:

`manifest.yaml -> ai/catalog.yaml -> coleção -> arquivo -> evidência da origem`

Não iniciar buscas globais antes de consultar o manifesto. Não misturar arquivos de outros repositórios, produtos, branches ou estados. Conteúdo marcado como `draft`, `deprecated` ou `archived` não pode alimentar integrações de produção.

## Banco de dados

Para evitar resultados contraditórios:

- `database/` representa o desenho e a documentação técnica.
- `supabase/migrations/` representa o estado aplicado ao Supabase real.
- Para perguntas sobre produção ou estado implantado, `supabase/migrations/` tem prioridade.

Nenhum agente de IA em produção foi criado nesta fase. Ver `docs/BE-002-Arquitetura-Bright-Platform.md` §13.
