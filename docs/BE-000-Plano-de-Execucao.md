[BE-000-Plano-de-Execucao-Bright-Ecosystem.md](https://github.com/user-attachments/files/30482041/BE-000-Plano-de-Execucao-Bright-Ecosystem.md)
# BE-000 — Plano Oficial de Execução da Bright Ecosystem

**Projeto:** Bright Platform  
**Organização:** BrightEcosystem  
**Repositório principal:** Bright-Platform  
**Responsável pelo produto:** Renan Lopes Lagares  
**Versão:** 1.0  
**Data:** 28/07/2026  
**Prazo do primeiro MVP (Produto Mínimo Viável):** até 5 dias

---

## 1. Objetivo deste documento

Este documento define a sequência oficial de execução do projeto. Nenhuma plataforma será configurada fora desta ordem sem registro da decisão.

A prioridade é colocar no ar uma primeira versão funcional da Bright Platform para uso interno no Enéias, preservando uma base que depois permita vender a solução para outras empresas.

---

## 2. Produto que será construído primeiro

A primeira versão será uma plataforma digital de relacionamento e benefícios com os seguintes recursos mínimos:

1. Cadastro de empresa participante.
2. Cadastro de clientes.
3. Envio de comprovante de compra.
4. Validação básica do comprovante.
5. Registro de pontos ou saldo de benefícios.
6. Liberação de recompensa digital.
7. Área do cliente acessível por link.
8. Painel administrativo básico.
9. Estrutura pronta para comunicação via WhatsApp.
10. Aplicação instalável no telefone como PWA (Aplicativo Web Progressivo).

Recursos como roleta, raspadinha, indicação, motor antifraude avançado e inteligência comportamental entrarão por etapas após a fundação estar funcionando.

---

## 3. Ordem oficial das plataformas

### ETAPA 1 — GitHub

**Função:** guardar, organizar e versionar todo o código e a documentação.

**Status atual:**

- Organização criada: `BrightEcosystem`
- Repositório criado: `Bright-Platform`
- Repositório privado: sim

### O que será feito dentro do GitHub

O GitHub será a fonte oficial do projeto. Dentro do repositório `Bright-Platform` serão mantidos:

```text
Bright-Platform/
├── README.md
├── docs/
│   ├── BE-000-Plano-de-Execucao.md
│   ├── BE-001-Fundacao-Bright-Ecosystem.md
│   ├── BE-002-Arquitetura-Bright-Platform.md
│   ├── BE-003-Regras-de-Negocio.md
│   └── BE-004-Banco-de-Dados.md
├── src/
│   ├── app/
│   ├── components/
│   ├── modules/
│   └── lib/
├── database/
│   ├── migrations/
│   ├── seeds/
│   └── policies/
├── automation/
│   └── n8n/
├── ai/
│   ├── prompts/
│   └── agents/
├── public/
├── tests/
├── .env.example
├── .gitignore
├── package.json
└── docker-compose.yml
```

### Primeira entrega no GitHub

Antes de programar funcionalidades, serão incluídos:

1. Este documento `BE-000`.
2. Documento `BE-001` com a fundação da empresa e do produto.
3. Documento `BE-002` com a arquitetura técnica.
4. Estrutura inicial do projeto Next.js.
5. Arquivo `.env.example` sem senhas.
6. README com instruções de instalação e execução.

---

### ETAPA 2 — Supabase

**Função:** banco de dados PostgreSQL, autenticação, armazenamento de comprovantes e regras de acesso.

No Supabase serão criados inicialmente:

- empresas;
- usuários administrativos;
- clientes;
- comprovantes;
- compras;
- saldos;
- pontos;
- recompensas;
- resgates;
- eventos;
- registros de auditoria.

Nenhuma chave secreta será salva diretamente no GitHub.

---

### ETAPA 3 — Vercel

**Função:** publicar a aplicação na internet.

A Vercel será conectada ao repositório `Bright-Platform`. Cada atualização aprovada na ramificação principal poderá gerar uma nova publicação.

---

### ETAPA 4 — Domínio

**Função:** endereço oficial da aplicação e do site.

Estrutura provisória recomendada:

- domínio institucional: `brightecosystem.com.br`
- plataforma: `app.brightecosystem.com.br`
- administração: `painel.brightecosystem.com.br`

Os nomes dos produtos comerciais serão definidos posteriormente com nomenclaturas simples e fáceis para o público brasileiro.

---

### ETAPA 5 — n8n

**Função:** automações e comunicação entre sistemas.

No primeiro MVP, o n8n ficará preparado para:

- receber eventos de compra;
- receber solicitações de validação;
- registrar movimentações;
- acionar mensagens de WhatsApp;
- criar rotinas de reengajamento.

---

### ETAPA 6 — Claude Code

**Função:** implementar o código conforme os documentos oficiais.

O Claude Code não decidirá sozinho regras de negócio. Ele deverá:

1. ler a documentação;
2. executar uma tarefa numerada;
3. alterar somente o necessário;
4. testar;
5. registrar o que foi criado;
6. enviar as alterações ao GitHub.

---

## 4. Papéis oficiais do projeto

### Renan Lopes Lagares — CEO e Dono do Produto

- define a visão;
- valida regras de negócio;
- decide prioridades;
- aprova a experiência do cliente;
- autoriza publicação.

### ChatGPT — Arquitetura e Coordenação

- cria e mantém a documentação;
- define arquitetura;
- modela o banco de dados;
- estrutura tarefas para o Claude Code;
- revisa decisões técnicas;
- acompanha o cronograma.

### Claude Code — Implementação

- cria arquivos;
- implementa funcionalidades;
- executa testes;
- corrige erros;
- organiza o código;
- prepara as alterações para o GitHub.

---

## 5. Plano de execução em 5 dias

### Dia 1 — Fundação

- concluir GitHub;
- publicar documentos BE-000, BE-001 e BE-002;
- criar projeto Supabase;
- criar projeto Next.js;
- configurar autenticação;
- conectar GitHub, Supabase e Vercel;
- publicar uma primeira página vazia funcionando.

### Dia 2 — Empresa e cliente

- cadastro da empresa;
- cadastro do administrador;
- cadastro do cliente;
- painel inicial;
- separação de dados por empresa.

### Dia 3 — Compra e comprovante

- envio de imagem;
- armazenamento;
- leitura inicial;
- cadastro manual assistido do valor;
- validação básica;
- prevenção de comprovante duplicado.

### Dia 4 — Pontuação e recompensa

- regras de pontuação;
- saldo do cliente;
- recompensa simples;
- histórico;
- primeira experiência gamificada.

### Dia 5 — WhatsApp e publicação piloto

- preparar integração de WhatsApp;
- mensagens de confirmação;
- mensagem de retorno;
- teste com clientes internos do Enéias;
- correções críticas;
- publicação do MVP.

---

## 6. Decisão importante para cumprir o prazo

O primeiro MVP não terá toda a inteligência imaginada. Para entrar no ar em 5 dias, algumas etapas serão inicialmente manuais ou semiautomáticas.

Exemplo: a foto do comprovante poderá ser enviada e armazenada, mas quando a leitura automática não tiver confiança suficiente, o administrador confirma o valor. Depois o motor de leitura e antifraude será ampliado.

Essa decisão permite testar o produto real antes de investir tempo em automações avançadas.

---

## 7. Próxima ação imediata

### Tarefa GIT-001 — Publicar a documentação inicial

1. Criar a pasta `docs` no repositório `Bright-Platform`.
2. Adicionar este arquivo com o nome:

```text
docs/BE-000-Plano-de-Execucao.md
```

3. Criar o arquivo vazio:

```text
docs/BE-001-Fundacao-Bright-Ecosystem.md
```

4. Criar o arquivo vazio:

```text
docs/BE-002-Arquitetura-Bright-Platform.md
```

5. Registrar a alteração com a mensagem:

```text
docs: adiciona plano oficial de execução da Bright Ecosystem
```

Somente depois dessa tarefa será criada a fundação técnica do projeto.

---

## 8. Regra de segurança

Não colocar no GitHub:

- CPF;
- senhas;
- tokens;
- chaves de API;
- dados bancários;
- credenciais do Supabase;
- credenciais do WhatsApp;
- dados pessoais de clientes.

O documento público/técnico usará apenas os dados empresariais necessários. Dados pessoais e societários restritos ficarão em documentação administrativa separada.

---

## 9. Critério de conclusão da Etapa 1

A etapa GitHub será considerada concluída quando o repositório possuir:

- documentação inicial;
- estrutura de pastas;
- projeto executável localmente;
- histórico de alterações organizado;
- nenhuma senha exposta;
- instruções claras para o Claude Code.

---

**Situação atual:** Etapa 1 (GitHub) concluída. Etapa 2 (Supabase) em preparação — modelo de dados e migrations definidos como código local, sem conexão real.

**Histórico de tarefas concluídas:**

- `GIT-001` — documentação inicial (BE-000, BE-001, BE-002) publicada.
- `GIT-002` — fundação técnica: Next.js + TypeScript + Tailwind, layout, dashboard, rotas principais, lint e build validados.
- `SEC-001` — auditoria controlada de dependências (`reports/security/SEC-001-Relatorio.md`), nenhuma correção destrutiva aplicada.
- `DB-001` — arquitetura de dados multiempresa definida (`BE-003`), migrations e seed de desenvolvimento criados como código local. Nenhum projeto Supabase real conectado, nenhuma migration executada remotamente.

**Próxima tarefa:** aguardando aprovação explícita da Direção de Engenharia para conectar um projeto Supabase real e aplicar as migrations.
