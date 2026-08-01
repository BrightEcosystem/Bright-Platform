# 020 — Visão, Missão, Público e Arquitetura da Plataforma

**Status:** Rascunho para revisão da Direção
**Versão:** 0.3.0 — §5/§6 corrigidos por `ADR-002-Arquitetura-do-Ecossistema-Bright.md` (ver `CHANGELOG.md`)
**Parte:** I

---

## 1. Visão

Ser a infraestrutura de fidelização que qualquer empresa parceira consegue habilitar para o seu cliente final, sem precisar construir ou operar nada sozinha — combinando cashback, pontuação e gamificação em uma experiência que o consumidor final realmente quer usar.

## 2. Missão

Dar a empresas de qualquer porte uma forma de reconhecer e recompensar o cliente que já confia nelas, e dar ao consumidor final uma experiência de fidelidade transparente, divertida e que genuinamente compensa — tudo isso sobre a mesma infraestrutura multiempresa do Core da Plataforma, compartilhada entre a Retaguarda da Empresa e o Aplicativo do Consumidor.

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
| **Empresa parceira** | Negócio que contrata a Bright Multi Plataforma e usa a Retaguarda da Empresa para oferecer fidelidade ao seu cliente | Simplicidade de configuração, dado real de retorno, baixo custo operacional |
| **Consumidor final** | Cliente da empresa parceira, usuário do Aplicativo do Consumidor | Transparência, recompensa genuína, experiência agradável e gamificada |
| **Administrador** | Time interno da Bright que opera a plataforma para múltiplas empresas parceiras | Visibilidade operacional, ferramentas de suporte, controle de abuso/fraude |

*(A definição de público prioritário para o MVP — ex.: um segmento de mercado específico como varejo, alimentação, serviços — é uma decisão pendente da Direção, listada em `090-Roadmap.md`.)*

## 5. Arquitetura da Bright Multi Plataforma

> Corrigido por `ADR-002-Arquitetura-do-Ecossistema-Bright.md`. Esta seção já teve duas versões anteriores incorretas: uma tratava "Bright Platform" como sinônimo do Core; outra introduziu "Bright Rewards" como produto irmão separado, junto de produtos fora de escopo (Bright IA, Bright CRM, Bright Licitações). Nenhuma das duas está correta. A versão abaixo é a oficial.

Este projeto é um só: a **Bright Multi Plataforma**. Não existem "Bright Platform" e "Bright Rewards" como produtos ou repositórios separados — existem **duas experiências** (Retaguarda da Empresa e Aplicativo do Consumidor) sobre o mesmo Core.

```
Bright Multi Plataforma
│
├── Core da Plataforma
│       ├── Autenticação
│       ├── Multiempresa
│       ├── Usuários
│       ├── Permissões
│       ├── Produtos contratados
│       ├── Auditoria
│       └── Integrações-base
│
├── Retaguarda da Empresa
│       ├── Clientes
│       ├── Campanhas
│       ├── Pontuação
│       ├── Cashback
│       ├── Gamificação
│       ├── Benefícios
│       ├── Comprovantes
│       ├── Relatórios
│       └── Configurações
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

**O que isso significa na prática:**

- Autenticação, multiempresa, usuários, permissões, produtos contratados, auditoria e integrações-base **pertencem ao Core da Plataforma** — a Retaguarda da Empresa e o Aplicativo do Consumidor os consomem, nunca os duplicam.
- **Retaguarda da Empresa** é a experiência voltada à empresa parceira e ao administrador. **Aplicativo do Consumidor** é a experiência voltada ao cliente final. As duas não se comunicam diretamente entre si — qualquer dado que uma precise da outra passa pelo Core.
- Módulos da Retaguarda são **liberados por contratação**, reaproveitando o modelo já existente de `tenants`/`products`/`tenant_products` — não um mecanismo novo.
- **Modelo de identidade (`ADR-002`):** a identidade é única — não há um mecanismo de autenticação paralelo para o consumidor. O que muda entre o usuário administrativo e o consumidor é o vínculo, não o mecanismo de login. **O consumidor não usa `tenant_memberships` como vínculo final** — esse modelo foi desenhado para colaborador administrativo (RBAC), não para a relação consumidor-empresa. O desenho técnico do vínculo próprio do consumidor é tratado na fase `IDENT-001 — Modelo de Identidade do Consumidor e Revisão de RLS`, ainda não iniciada.
- O Aplicativo do Consumidor deve ter entrada e navegação de caráter gamificado, com experiência semelhante a um jogo interativo — **sem depender de aposta financeira entre usuários**. Nenhuma mecânica envolve um consumidor apostando contra outro ou contra a plataforma com dinheiro real; prêmios são sempre obtidos por engajamento (compra, missão, indicação), nunca por contrapartida financeira do consumidor.

## 6. O que este projeto não é

Para evitar ambiguidade: este projeto não inclui CRM, inteligência artificial como produto próprio, licitações, ou qualquer módulo fora do programa de fidelidade/cashback/gamificação — isso pertence a um escopo diferente, fora desta Constituição. A Bright Multi Plataforma também não é um ERP completo nem gerencia toda a operação interna da empresa parceira — a Retaguarda da Empresa cobre especificamente o que é necessário para operar o programa de fidelidade (clientes, campanhas, pontuação, cashback, gamificação, benefícios, comprovantes, relatórios, configurações), não a operação de negócio da empresa como um todo.
