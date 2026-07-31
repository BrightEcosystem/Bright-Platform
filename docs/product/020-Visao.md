# 020 — Visão, Missão, Público e Arquitetura do Ecossistema

**Status:** Rascunho para revisão da Direção
**Versão:** 0.1.0
**Parte:** I

---

## 1. Visão

Ser a infraestrutura de fidelização que qualquer empresa parceira consegue habilitar para o seu cliente final, sem precisar construir ou operar nada sozinha — combinando cashback, gamificação e inteligência artificial em uma experiência que o consumidor final realmente quer usar.

## 2. Missão

Dar a empresas de qualquer porte uma forma de reconhecer e recompensar o cliente que já confia nelas, e dar ao consumidor final uma experiência de fidelidade transparente, divertida e que genuinamente compensa — tudo isso sobre a mesma infraestrutura multiempresa que já sustenta a Bright Platform.

## 3. Problemas que resolvemos

**Para a empresa parceira:**
- Programas de fidelidade tradicionais são caros de construir e operar sozinhos — só grandes redes conseguem bancar.
- Desconto raso corrói margem e não constrói relação nenhuma com o cliente.
- Falta uma forma simples de entender, com dado real, se o programa de fidelidade está funcionando.

**Para o consumidor final:**
- "Fidelidade" hoje costuma significar um cartão de papel furado ou um app esquecido depois da segunda visita.
- Falta transparência: o consumidor raramente sabe quanto tem, de onde veio, e quando expira.
- Faltam experiências que tornem o processo de ser recompensado genuinamente agradável, não só transacional.

*(Seção proposta como estrutura mínima — a Direção pode adicionar problemas específicos identificados em pesquisa de mercado ou conversas com empresas parceiras piloto.)*

## 4. Público

| Perfil | Quem é | O que busca |
|---|---|---|
| **Empresa parceira** | Negócio que já usa (ou passará a usar) a Bright Platform e quer oferecer fidelidade ao seu cliente | Simplicidade de configuração, dado real de retorno, baixo custo operacional |
| **Consumidor final** | Cliente da empresa parceira, usuário do aplicativo Bright Rewards | Transparência, recompensa genuína, experiência agradável |
| **Administrador** | Time interno da Bright que opera a plataforma para múltiplas empresas parceiras | Visibilidade operacional, ferramentas de suporte, controle de abuso/fraude |

*(A definição de público prioritário para o MVP — ex.: um segmento de mercado específico como varejo, alimentação, serviços — é uma decisão pendente da Direção, listada em `090-Roadmap.md`.)*

## 5. Arquitetura do Ecossistema Bright

A Bright Rewards **não é um produto separado, nem terá repositório independente nesta fase**. Ela é um produto dentro do Bright Ecosystem, construído sobre a infraestrutura já existente na Bright Platform (o CORE).

```
Bright Ecosystem
│
├── Bright Platform (CORE)
│       ├── Autenticação e multiempresa
│       ├── Permissões e papéis
│       ├── Usuários e perfis
│       ├── Integrações
│       ├── Billing
│       └── Auditoria
│
├── Bright Rewards
│       ├── Fidelidade
│       ├── Cashback
│       ├── Missões
│       ├── Ranking
│       ├── Cupons
│       └── Comunidade
│
├── Bright CRM
├── Bright IA
├── Bright Licitações
│
└── futuros produtos
```

**O que isso significa na prática:**

- Autenticação, multiempresa, permissões, usuários, integrações, billing e auditoria **continuam pertencendo ao CORE** (Bright Platform) — a Bright Rewards os consome, nunca os duplica.
- Uma empresa parceira que já é tenant da Bright Platform apenas **habilita** a Bright Rewards como um produto adicional — reaproveitando o modelo já existente de `tenants`/`products`/`tenant_products` e o catálogo de permissões (`PermissionCode`/`RoleName`), estendido conforme necessário, não recriado do zero (decisão registrada nesta fase; ver `docs/BE-006-Papeis-e-Permissoes.md` para o catálogo atual).
- O consumidor final é um novo tipo de usuário no ecossistema, distinto do usuário administrativo/empresa que já existe na Bright Platform hoje — sua modelagem de dados e autenticação própria é uma decisão de arquitetura técnica a ser tomada na fase de implementação, não nesta Constituição.
- Isso evita duplicação de código, infraestrutura e manutenção entre os produtos do ecossistema — cada novo produto (CRM, IA, Licitações, e os que vierem depois) segue o mesmo princípio: consumir o CORE, nunca reconstruí-lo.

## 6. O que a Bright Rewards não é

Para evitar ambiguidade: a Bright Rewards não é um ERP, não gerencia operação interna da empresa parceira, não substitui a Bright Platform. Ela é a camada voltada ao consumidor final — a Bright Platform continua sendo a camada voltada à empresa parceira, ao administrador e ao suporte.
