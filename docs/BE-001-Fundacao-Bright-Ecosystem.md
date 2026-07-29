# BE-001 — Fundação da Bright Ecosystem

**Status:** Aprovado para execução  
**Versão:** 1.0.0  
**Responsável pela arquitetura:** ChatGPT — Direção de Engenharia Bright Ecosystem  
**Responsável pela implementação:** Claude Code  
**Repositório oficial:** `BrightEcosystem/Bright-Platform`  
**Pasta local oficial:** `C:\Projetos\bright-ecosystem\bright-platform-org`

---

## 1. Objetivo deste documento

Este documento define a fundação institucional, técnica e operacional da Bright Ecosystem. Ele é a referência obrigatória para qualquer agente de IA, desenvolvedor, automação ou serviço que participe do projeto.

Nenhuma implementação poderá contrariar este documento sem uma nova decisão formal registrada em documento posterior da série `BE-XXX`.

---

## 2. Visão da Bright Ecosystem

A Bright Ecosystem será uma plataforma SaaS modular, multiempresa e orientada a produtos, criada para centralizar sistemas, dados, automações, integrações e agentes de inteligência artificial da Bright Telecom e de seus clientes.

A plataforma deverá permitir que novos produtos sejam adicionados sem reconstrução do núcleo, preservando autenticação, permissões, auditoria, cobrança, integrações e padrões visuais compartilhados.

---

## 3. Produto principal

### 3.1 Nome

**Bright Platform**

### 3.2 Função

A Bright Platform será o ambiente central de acesso ao ecossistema. Ela concentrará:

- gestão de empresas;
- gestão de usuários;
- gestão de clientes;
- catálogo de produtos;
- licenciamento de módulos;
- agentes de IA;
- workflows e automações;
- integrações externas;
- relatórios e indicadores;
- auditoria;
- configurações gerais.

---

## 4. Princípios obrigatórios

Toda decisão de engenharia deverá seguir os princípios abaixo:

1. **Multiempresa desde a origem:** todo dado de negócio deve estar associado a uma empresa ou tenant.
2. **Segurança por padrão:** acesso negado por padrão e liberado apenas por permissão explícita.
3. **Modularidade:** cada produto deve poder evoluir sem comprometer o núcleo.
4. **Rastreabilidade:** ações relevantes devem gerar registro de auditoria.
5. **API First:** integrações devem utilizar contratos claros e versionáveis.
6. **Automação controlada:** n8n e agentes de IA executam processos, mas não redefinem arquitetura.
7. **Código reutilizável:** componentes, serviços e tipos compartilhados ficam no CORE.
8. **Separação de responsabilidades:** páginas não devem concentrar regras de negócio.
9. **Observabilidade:** erros, eventos e operações críticas devem ser monitoráveis.
10. **Evolução incremental:** cada tarefa deve ser pequena, testável e versionada.

---

## 5. Escopo da primeira fase

A primeira fase deverá criar somente a fundação técnica e visual necessária para as próximas entregas.

### Incluído

- estrutura oficial de pastas;
- aplicação Next.js executável localmente;
- TypeScript;
- Tailwind CSS;
- lint e build funcionando;
- layout base;
- sidebar;
- header;
- dashboard inicial;
- rotas principais vazias ou com placeholders controlados;
- componentes reutilizáveis básicos;
- arquivos de configuração;
- documentação inicial;
- preparação para integração futura com Supabase;
- preparação para testes;
- `.env.example` sem segredos;
- organização inicial para banco, automações e IA.

### Não incluído nesta fase

- autenticação real;
- conexão ativa com Supabase;
- banco de produção;
- integrações com n8n;
- cobrança;
- licenciamento real;
- agentes de IA em produção;
- APIs externas;
- publicação definitiva em produção;
- dados reais de clientes.

---

## 6. Stack oficial

### Frontend

- Next.js 16
- React
- TypeScript
- Tailwind CSS

### Backend e dados

- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage

### Infraestrutura

- GitHub
- Vercel
- n8n

### Inteligência artificial

- Claude Code para implementação
- ChatGPT para arquitetura e direção de engenharia
- OpenAI para recursos de IA quando aprovado
- MCP quando houver necessidade de integração entre ferramentas

---

## 7. Estrutura organizacional do repositório

A estrutura mínima oficial será:

```text
bright-platform-org/
├── docs/
│   ├── BE-000-Plano-Oficial-de-Execucao.md
│   ├── BE-001-Fundacao-Bright-Ecosystem.md
│   └── BE-002-Arquitetura-Bright-Platform.md
├── src/
├── public/
├── database/
│   ├── migrations/
│   ├── seeds/
│   └── policies/
├── automation/
│   └── n8n/
├── ai/
│   ├── agents/
│   ├── prompts/
│   ├── skills/
│   └── rules/
├── tests/
├── scripts/
├── .github/
│   └── workflows/
├── .env.example
├── .gitignore
├── package.json
├── docker-compose.yml
├── CLAUDE.md
├── AGENTS.md
└── README.md
```

Pastas sem uso imediato podem conter um arquivo `.gitkeep` para serem versionadas.

---

## 8. Responsabilidades

### 8.1 Direção de Engenharia

Responsável por:

- arquitetura;
- escopo;
- prioridades;
- padrões;
- decisões técnicas;
- aprovação de entregas;
- documentos oficiais.

### 8.2 Claude Code

Responsável por:

- implementar tarefas aprovadas;
- editar arquivos;
- executar comandos;
- testar;
- corrigir erros;
- relatar alterações;
- fazer commits somente quando solicitado.

O Claude Code não está autorizado a:

- redefinir arquitetura;
- criar produto novo sem tarefa;
- alterar stack;
- inserir dependência sem necessidade justificada;
- armazenar segredos no repositório;
- executar tarefas futuras sem autorização.

### 8.3 Usuário responsável pelo projeto

Responsável por:

- operar o computador e serviços externos quando necessário;
- validar telas e fluxos;
- fornecer regras de negócio;
- aprovar resultados funcionais.

---

## 9. Regras de versionamento

### Branch principal

`main`

### Padrão de commits

Usar Conventional Commits:

```text
feat: adiciona nova funcionalidade
fix: corrige comportamento
refactor: reorganiza código sem alterar função
docs: atualiza documentação
test: adiciona ou ajusta testes
chore: manutenção técnica
build: altera processo de build
ci: altera automação de integração
```

### Regra de commit

Cada commit deve representar uma entrega coerente. Não misturar documentação, funcionalidade e correção não relacionadas no mesmo commit.

---

## 10. Critérios de qualidade

Antes de concluir qualquer tarefa, o Claude Code deve:

1. executar `npm run lint`;
2. executar `npm run build`;
3. executar testes disponíveis;
4. corrigir erros gerados pela própria implementação;
5. confirmar que nenhum segredo foi versionado;
6. listar arquivos criados e alterados;
7. apresentar pendências reais;
8. informar como validar localmente.

---

## 11. Segurança

- Nenhuma chave, senha ou token deve aparecer em arquivos Markdown.
- Segredos devem existir somente em `.env.local` ou serviço seguro equivalente.
- `.env.local` deve permanecer no `.gitignore`.
- `.env.example` deve conter apenas nomes de variáveis e valores fictícios.
- Logs não podem expor senhas, tokens ou dados pessoais sensíveis.
- Dados multiempresa devem ser isolados por `tenant_id` ou equivalente.
- Políticas RLS serão obrigatórias quando o Supabase for conectado.

---

## 12. Padrão visual inicial

A interface inicial deverá seguir:

- tema escuro profissional;
- visual limpo e minimalista;
- alta legibilidade;
- responsividade;
- navegação lateral;
- cabeçalho superior;
- cartões de indicadores;
- componentes reutilizáveis;
- sem excesso de animações;
- sem dados falsos apresentados como reais.

Referências visuais: Vercel, Linear, GitHub, Stripe e Supabase.

---

## 13. Menu inicial

A navegação inicial da plataforma deverá conter:

- Dashboard
- Empresas
- Clientes
- Produtos
- Agentes IA
- Workflows
- Integrações
- Licitações
- Financeiro
- Analytics
- Configurações

Nesta fase, módulos ainda não implementados podem usar páginas de placeholder identificadas claramente como “Em construção”.

---

## 14. Definição de pronto da fundação

A fundação será considerada concluída quando:

- o projeto executar localmente;
- a estrutura oficial existir;
- o dashboard base estiver funcional;
- as rotas principais estiverem acessíveis;
- lint e build concluírem sem erro;
- a documentação BE-001 e BE-002 estiver versionada;
- o README explicar instalação e execução;
- nenhum segredo estiver no Git;
- houver commit e push aprovados.

---

## 15. Próxima tarefa autorizada

Após este documento e o BE-002 estarem no repositório, o Claude Code está autorizado a criar a estrutura técnica inicial definida no BE-000, sem iniciar Supabase, autenticação ou integrações reais.

