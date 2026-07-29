# BE-002 — Arquitetura da Bright Platform

**Status:** Aprovado para execução  
**Versão:** 1.0.0  
**Responsável pela arquitetura:** ChatGPT — Direção de Engenharia Bright Ecosystem  
**Responsável pela implementação:** Claude Code  
**Documento relacionado:** `BE-001-Fundacao-Bright-Ecosystem.md`

---

## 1. Objetivo

Este documento define a arquitetura inicial da Bright Platform, incluindo camadas, módulos, estrutura de código, dependências, fluxo de dados, convenções e limites de responsabilidade.

O objetivo é impedir que o sistema cresça de forma desorganizada e garantir que os próximos produtos compartilhem um núcleo comum.

---

## 2. Modelo arquitetural

A Bright Platform adotará uma arquitetura modular em camadas, inspirada em Clean Architecture, sem aplicar abstrações desnecessárias para a fase inicial.

As camadas principais serão:

```text
Interface
↓
Aplicação
↓
Domínio
↓
Infraestrutura
```

### Interface

Responsável por:

- páginas;
- layouts;
- componentes visuais;
- formulários;
- estados de interface;
- interação com o usuário.

### Aplicação

Responsável por:

- casos de uso;
- coordenação de serviços;
- validações de fluxo;
- transformação de dados para a interface.

### Domínio

Responsável por:

- entidades;
- regras de negócio;
- tipos centrais;
- contratos e interfaces.

### Infraestrutura

Responsável por:

- Supabase;
- APIs externas;
- armazenamento;
- n8n;
- logs;
- adaptadores;
- implementação concreta de repositórios.

---

## 3. Arquitetura macro do ecossistema

```text
Bright Ecosystem
├── Bright CORE
│   ├── Autenticação
│   ├── Empresas
│   ├── Usuários
│   ├── Permissões
│   ├── Produtos
│   ├── Licenças
│   ├── Auditoria
│   ├── Configurações
│   └── Integrações compartilhadas
├── Bright Platform
│   ├── Dashboard
│   ├── Administração
│   ├── Marketplace
│   └── Central de integrações
└── Produtos
    ├── CRM
    ├── Licitações
    ├── Atendimento IA
    ├── Automações
    ├── Financeiro
    ├── Analytics
    ├── Delivery
    └── Produtos futuros
```

O CORE deve possuir apenas capacidades compartilhadas. Regras específicas de CRM, licitações, alimentação, telecom ou qualquer outro produto não podem ser inseridas no CORE.

---

## 4. Multiempresa

A plataforma será multiempresa desde o banco até a interface.

### Regras obrigatórias

- Toda entidade de negócio deve conter `tenant_id`, quando aplicável.
- O tenant ativo deve ser conhecido no contexto da sessão.
- Consultas devem filtrar o tenant automaticamente.
- Usuários podem pertencer a uma ou mais empresas.
- Permissões podem variar por empresa.
- Nenhuma empresa pode acessar dados de outra.
- A futura implementação no Supabase deve utilizar RLS.

### Entidades iniciais previstas

> Atualizado por `DOC-001` para refletir o modelo aprovado em `BE-003-Arquitetura-de-Dados-e-Supabase.md`. Os nomes `users` e `memberships` desta lista original foram substituídos por `profiles` e `tenant_memberships` — ver `docs/decisions/ADR-001-Modelo-de-identidade-e-multiempresa.md` para o motivo.

- tenants
- profiles (anteriormente listado como `users`; vinculado a `auth.users` do Supabase Auth)
- tenant_memberships (anteriormente listado como `memberships`)
- roles
- permissions
- role_permissions
- membership_roles (relacionamento entre `tenant_memberships` e `roles`, não estava na lista original)
- products
- tenant_products
- audit_logs

A criação efetiva dessas tabelas ocorreu em `DB-001` (ver `database/migrations/`).

**`integrations`** permanece no roadmap, mas sua implementação será feita em uma tarefa própria e ainda não faz parte das migrations atuais.

---

## 5. Estrutura de código em `src`

A estrutura inicial oficial será:

```text
src/
├── app/
│   ├── (platform)/
│   │   ├── dashboard/
│   │   ├── empresas/
│   │   ├── clientes/
│   │   ├── produtos/
│   │   ├── agentes-ia/
│   │   ├── workflows/
│   │   ├── integracoes/
│   │   ├── licitacoes/
│   │   ├── financeiro/
│   │   ├── analytics/
│   │   └── configuracoes/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── loading.tsx
│   ├── error.tsx
│   └── not-found.tsx
├── components/
│   ├── ui/
│   ├── layout/
│   ├── navigation/
│   ├── feedback/
│   └── data-display/
├── modules/
│   ├── core/
│   ├── companies/
│   ├── clients/
│   ├── products/
│   ├── ai-agents/
│   ├── workflows/
│   ├── integrations/
│   └── tenders/
├── services/
├── hooks/
├── providers/
├── contexts/
├── lib/
├── types/
├── utils/
├── config/
└── styles/
```

### Regra de organização

- `app/`: rotas e composição de páginas.
- `components/`: componentes compartilhados.
- `modules/`: lógica e componentes específicos de domínio.
- `services/`: acesso a serviços e integrações.
- `hooks/`: hooks reutilizáveis.
- `providers/`: providers globais.
- `contexts/`: contextos React quando necessários.
- `lib/`: clientes e utilidades de bibliotecas.
- `types/`: tipos compartilhados.
- `utils/`: funções puras e reutilizáveis.
- `config/`: configurações sem segredos.

---

## 6. Regras para componentes

### Componentes compartilhados

Devem ficar em `src/components` quando forem reutilizáveis por mais de um módulo.

### Componentes de módulo

Devem ficar dentro do próprio módulo quando forem específicos daquele domínio.

### Páginas

Páginas devem apenas:

- receber parâmetros;
- chamar componentes de alto nível;
- coordenar carregamento inicial;
- definir metadata quando necessário.

Páginas não devem conter regra complexa de negócio.

---

## 7. Server Components e Client Components

- Server Components serão o padrão.
- Usar `'use client'` apenas quando houver interação, estado local, efeitos ou dependência exclusiva do navegador.
- Evitar transformar layouts inteiros em Client Components.
- Buscar dados no servidor quando isso aumentar segurança e desempenho.
- Dados sensíveis nunca devem ser enviados ao navegador sem necessidade.

---

## 8. Padrão de dados e serviços

A interface não deve acessar Supabase ou API externa diretamente.

Fluxo recomendado:

```text
Página ou componente
↓
Caso de uso ou serviço do módulo
↓
Contrato de repositório
↓
Adaptador de infraestrutura
↓
Supabase ou API externa
```

Na fase inicial, serviços podem ser simples, mas devem preservar essa separação.

---

## 9. APIs

Quando forem criadas APIs internas:

- utilizar rotas do Next.js em `src/app/api`;
- validar entrada;
- retornar códigos HTTP corretos;
- não expor stack trace ao cliente;
- usar respostas JSON consistentes;
- registrar erros críticos;
- aplicar autenticação e autorização quando disponíveis;
- versionar APIs públicas futuramente.

Formato base de sucesso:

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

Formato base de erro:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Mensagem segura para o cliente"
  }
}
```

---

## 10. Configuração e variáveis de ambiente

O arquivo `.env.example` deve prever, inicialmente:

```dotenv
NEXT_PUBLIC_APP_NAME=Bright Platform
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
N8N_BASE_URL=
N8N_API_KEY=
```

Valores reais não devem ser versionados.

---

## 11. Banco de dados

A estrutura física será mantida em:

```text
database/
├── migrations/
├── seeds/
├── policies/
├── functions/
└── README.md
```

### Convenções iniciais

- nomes de tabelas em `snake_case` e plural;
- chaves primárias UUID;
- colunas de data com timezone;
- `created_at` e `updated_at` quando aplicável;
- soft delete apenas quando houver justificativa;
- índices para filtros frequentes;
- migrations imutáveis após aplicação;
- alterações futuras por nova migration.

---

## 12. Automação n8n

Workflows exportados devem ficar em:

```text
automation/n8n/
├── workflows/
├── credentials.example/
├── docs/
└── README.md
```

Credenciais reais nunca devem ser exportadas para o Git.

Cada workflow deverá possuir:

- nome padronizado;
- objetivo;
- gatilho;
- entradas;
- saídas;
- tratamento de erro;
- versão;
- responsável.

---

## 13. Inteligência artificial

A estrutura de IA será:

```text
ai/
├── agents/
├── prompts/
├── skills/
├── rules/
├── evaluations/
└── README.md
```

### Regras

- prompts devem ser versionados;
- agentes devem ter objetivo e limite de atuação;
- nenhuma IA deve possuir autoridade arquitetural automática;
- saídas críticas devem ser validadas;
- dados sensíveis não devem ser enviados a modelos sem autorização;
- avaliações devem ser criadas para fluxos importantes.

---

## 14. Interface inicial

### Layout

- sidebar fixa em desktop;
- sidebar recolhível em telas menores;
- header com busca, notificações e perfil;
- conteúdo principal responsivo;
- navegação com estado ativo;
- acessibilidade por teclado;
- contraste adequado.

### Dashboard

O dashboard inicial deverá exibir cartões de estrutura, sem representar dados reais:

- Empresas
- Clientes
- Produtos
- Agentes IA
- Workflows
- Integrações

Quando não houver backend, utilizar valores neutros ou indicação de “Não conectado”. Não inventar faturamento, clientes ou indicadores.

---

## 15. Estado, formulários e validação

- preferir estado local para interações simples;
- evitar Context API global sem necessidade;
- utilizar validação tipada quando formulários reais forem implementados;
- erros devem ser exibidos de forma compreensível;
- loading e empty states devem existir;
- formulários não devem perder dados silenciosamente.

Bibliotecas adicionais só podem ser instaladas quando houver benefício claro.

---

## 16. Tratamento de erros

A aplicação deve possuir:

- `error.tsx` para erros de rota;
- `not-found.tsx` para páginas inexistentes;
- mensagens seguras;
- logs técnicos separados da mensagem ao usuário;
- fallback visual consistente;
- tratamento de falhas de rede quando integrações forem adicionadas.

---

## 17. Testes

A estrutura inicial será:

```text
tests/
├── unit/
├── integration/
└── e2e/
```

Na primeira fundação, o mínimo obrigatório é:

- lint sem erro;
- build sem erro;
- aplicação inicial acessível;
- navegação das rotas principais;
- ausência de erros críticos no console.

Testes automatizados serão adicionados de forma incremental a partir das funcionalidades reais.

---

## 18. Dependências

Antes de instalar uma nova dependência, o Claude Code deve verificar:

1. se o Next.js ou a plataforma já oferece solução nativa;
2. se a biblioteca é mantida;
3. se aumenta significativamente o bundle;
4. se cria risco de segurança;
5. se realmente reduz complexidade.

Não instalar bibliotecas apenas por preferência estética.

---

## 19. Critérios de aceite da fundação técnica

A implementação inicial será aceita quando:

- a estrutura de pastas estiver criada;
- `npm install` concluir;
- `npm run dev` iniciar a aplicação;
- `npm run lint` concluir sem erro;
- `npm run build` concluir sem erro;
- a página inicial redirecionar ou apresentar o dashboard;
- as rotas do menu existirem;
- o layout for responsivo;
- os componentes estiverem organizados;
- `.env.example` existir;
- `.gitignore` proteger segredos;
- README estiver atualizado;
- nenhuma integração real tiver sido iniciada fora do escopo.

---

## 20. Ordem de execução autorizada

Após BE-001 e BE-002 estarem preenchidos e versionados, executar nesta ordem:

1. inspecionar o repositório existente;
2. preservar arquivos válidos;
3. criar a estrutura técnica faltante;
4. configurar ou confirmar Next.js, TypeScript e Tailwind;
5. criar layout base;
6. criar dashboard inicial;
7. criar rotas principais;
8. criar arquivos auxiliares da fundação;
9. atualizar README;
10. executar lint e build;
11. corrigir erros;
12. apresentar relatório;
13. aguardar aprovação antes de iniciar Supabase.

---

## 21. Restrições desta etapa

Não executar ainda:

- criação de projeto Supabase;
- migrations reais;
- autenticação;
- RLS;
- cobrança;
- integração n8n;
- integração OpenAI;
- conexão Vercel definitiva;
- cadastro real de empresas ou usuários.

---

## 22. Decisão final

O Claude Code deve utilizar este documento como contrato técnico da fundação. Em caso de conflito entre uma preferência do agente e esta arquitetura, prevalece esta arquitetura.

