# 070 — Operação e Dados

**Status:** Rascunho para revisão da Direção
**Versão:** 0.1.0
**Parte:** VI

---

## 1. OCR (reconhecimento de comprovantes)

Quando a empresa parceira não tem uma integração direta de ponto de venda com a Bright, o consumidor pode enviar uma foto do comprovante de compra para validar uma ação elegível manualmente. OCR extrai valor, data, estabelecimento e (quando aplicável) itens da compra.

**Riscos a considerar (detalhados tecnicamente em fase futura, registrados aqui como princípio):**
- Comprovante forjado/editado — precisa de verificação cruzada com o Motor de Benefícios (`060-IA.md`) antes de confirmar emissão.
- Comprovante duplicado (mesmo comprovante enviado mais de uma vez, por um ou mais consumidores) — precisa de deduplicação.

## 2. Upload de comprovantes

Fluxo de envio (foto/PDF) que alimenta o OCR. Enquanto o processamento não confirma a leitura, a ação permanece `Pendente` (`040-Economia.md §3`) — nunca gera saldo `Disponível` antes da confirmação.

## 3. Integrações

Conexões com sistemas de ponto de venda, ERP ou e-commerce da empresa parceira, para captura automática de transações elegíveis — reduz dependência de OCR/upload manual e é a via preferencial sempre que disponível (menos fricção para o consumidor, menos risco de fraude por comprovante forjado).

## 4. Marketplace

Espaço dentro do aplicativo Bright Rewards onde o consumidor pode trocar pontos/cashback acumulado por benefícios além dos oferecidos diretamente pela empresa parceira de origem (ex.: catálogo de recompensas de terceiros). **Escopo e modelo de parceria comercial do marketplace são decisão pendente da Direção** — não detalhado nesta versão além do conceito.

## 5. Empresas Parceiras

Empresa cliente da Bright Platform que habilita a Bright Rewards (ver `020-Visao.md §5`). Este documento não repete o ciclo de vida de onboarding (já descrito em `030-Jornadas.md §2`) — o recorte aqui é puramente sobre os dados/integrações que uma empresa parceira precisa fornecer ou conectar para operar: ponto de venda (ou aceitar OCR/upload manual como alternativa), branding básico (para a experiência dentro do app parecer "da empresa", não genérica da Bright), e parâmetros econômicos dentro da faixa permitida (`040-Economia.md`).
