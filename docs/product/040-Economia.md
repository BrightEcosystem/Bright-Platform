# 040 — Economia da Plataforma

**Status:** Rascunho para revisão da Direção — **contém múltiplos pontos marcados como proposta**
**Versão:** 0.2.0 — terminologia padronizada por `ADR-002-Arquitetura-do-Ecossistema-Bright.md` (ver `CHANGELOG.md`)
**Parte:** III

---

> Este é, nas palavras da Direção, o capítulo mais importante do documento. Ele define o motor financeiro que sustenta cashback, fidelidade, missões, ranking e todas as mecânicas de `050-Gamificacao.md`. Onde este documento propõe um número, uma fórmula ou uma regra, isso está marcado explicitamente como **proposta, sujeita à aprovação** — não é regra vigente. Onde a decisão exige dado real de negócio (custo, margem, apetite a risco), não há como eu presumir o valor certo; apresento o modelo e o espaço de decisão, não o número final.

## 1. Quem paga, quem recebe, quem financia

| Papel | Descrição |
|---|---|
| **Empresa parceira** | Financia o cashback/pontos concedidos aos seus próprios clientes — é o custo direto de adquirir/reter aquele cliente. |
| **Consumidor final** | Recebe o benefício; não paga para participar (proposta — a Direção pode decidir por um modelo de assinatura premium no futuro, mas o modelo base assumido aqui é gratuito para o consumidor). |
| **Bright** | Cobra da empresa parceira pelo uso da infraestrutura (modelo de monetização do programa em si — SaaS fee, percentual sobre volume transacionado, ou híbrido — **decisão pendente da Direção**, listada como bloqueio já registrado na proposta de estrutura anterior). |

## 2. Quem subsidia campanhas

Duas fontes possíveis, não mutuamente exclusivas:

- **A própria empresa parceira** subsidia campanhas específicas suas (ex.: "cashback em dobro esta semana") — custo adicional sobre o que ela já paga no modelo padrão.
- **A Bright** pode, eventualmente, subsidiar campanhas cross-tenant (ex.: uma campanha de lançamento do programa em si, para atrair adoção) — isso é orçamento de marketing da Bright, não da empresa parceira, e deve ser contabilizado separadamente (seção 6).

**Proposta:** nenhuma campanha subsidiada pela Bright deve ser lançada sem um teto de orçamento pré-aprovado e um mecanismo de corte automático ao atingir o teto (ver limite de emissão, seção 8) — para evitar que uma campanha vire um passivo descontrolado.

## 3. Como nasce um ponto (ou cashback)

Um ponto/cashback nasce quando uma ação elegível é confirmada — tipicamente uma compra verificada (via integração direta com o sistema da empresa parceira, ou via OCR de comprovante, `070-Integracoes.md`). O nascimento **não é imediato à ação do usuário**; passa por uma etapa de confirmação (evitar emissão sobre transação que pode ser cancelada/estornada, ver seção 9).

**Proposta de estados do ciclo de vida de um ponto:**

```
Pendente → Confirmado → Disponível → Resgatado
                     ↘ Expirado
        ↘ Estornado (a partir de Pendente ou Confirmado)
```

- **Pendente**: ação registrada, aguardando confirmação (ex.: janela de arrependimento da compra).
- **Confirmado**: ação validada, ponto contabilizado como passivo (seção 6), mas ainda não liberado para uso (ex.: prazo de carência).
- **Disponível**: liberado para o consumidor usar.
- **Resgatado**: usado pelo consumidor — baixa o passivo.
- **Expirado**: não usado dentro da validade (seção 5) — vira breakage (seção 6).
- **Estornado**: a transação de origem foi cancelada/estornada pela empresa parceira ou identificada como fraude — remove o ponto do saldo do consumidor.

## 4. Como morre um ponto

Um ponto "morre" (deixa de existir como saldo disponível) de três formas: **resgate** (uso legítimo — o objetivo do sistema), **expiração** (não uso dentro da validade) ou **estorno** (reversão da transação de origem ou fraude confirmada). Cada uma tem tratamento contábil diferente (seção 6).

## 5. Validade

**Proposta:** todo ponto/cashback tem uma validade explícita, comunicada ao consumidor no momento da emissão (nunca descoberta depois — ver `010-Manifesto.md`, princípio de transparência). Prazo exato (ex.: 90, 180, 365 dias) é uma decisão de negócio pendente — pode variar por empresa parceira dentro de uma faixa definida pela Bright, para preservar previsibilidade contábil (seção 6).

## 6. Passivo financeiro e contabilização

Todo ponto no estado `Confirmado` ou `Disponível` é um **passivo** — uma obrigação da empresa parceira (e, no caso de campanha subsidiada pela Bright, da própria Bright) de honrar aquele valor quando resgatado. Isso é conceitualmente equivalente a "receita diferida"/"gift card liability" em contabilidade de varejo.

- **Contabilização proposta:** o Core da Plataforma deve manter, por tenant, um saldo agregado de passivo de pontos emitidos e não resgatados — dado que a empresa parceira precisa poder consultar a qualquer momento (transparência também para quem paga, não só para quem recebe).
- **Provisões:** propõe-se que a empresa parceira (e a Bright, para campanhas próprias) mantenha uma provisão contábil baseada na taxa histórica de resgate — não é papel da plataforma dar consultoria contábil à empresa parceira, mas o produto deve fornecer o dado bruto (emitido, resgatado, expirado) para que a contabilidade dela faça esse cálculo.
- **Breakage:** pontos expirados (nunca resgatados) reduzem o passivo sem custo de caixa — esse "breakage" é, na prática, parte do modelo de sustentabilidade de qualquer programa de fidelidade do mercado. Não deve ser tratado como objetivo do produto (não desenhamos para maximizar expiração, ver `010-Manifesto.md`), mas é um efeito natural e esperado a ser reportado com transparência à empresa parceira.

## 7. Estornos

Quando uma transação de origem é cancelada (ex.: devolução de produto) ou identificada como fraudulenta, o ponto correspondente deve ser estornado — removido do saldo do consumidor. **Caso de saldo insuficiente** (consumidor já resgatou o ponto antes do estorno da transação de origem): **proposta** — o saldo do consumidor fica negativo até a próxima emissão compensar, nunca gera cobrança direta ao consumidor (evita fricção/atrito desnecessário; o risco fica com a empresa parceira/Bright, não com o usuário final) — mas casos recorrentes do mesmo consumidor devem acionar Antifraude (`080-Seguranca.md`).

## 8. Limite de emissão

**Proposta central desta seção:** toda empresa parceira opera dentro de um **teto de emissão** (valor máximo de pontos/cashback que pode conceder em um período), configurável mas sempre limitado por uma faixa definida pela Bright — nunca ilimitado. Isso protege:
- a empresa parceira de conceder mais do que consegue honrar;
- a Bright de expor sua própria marca a um parceiro que promete e não paga;
- o consumidor final de uma experiência de "pontos que a empresa depois não consegue honrar".

Ao atingir o teto, novas emissões são pausadas automaticamente (não retroativas — o que já foi emitido continua válido) até o próximo período ou até a empresa parceira ajustar seu plano/limite junto à Bright.

## 9. Fraude (financeira)

Ver `080-Seguranca.md` para o módulo de Antifraude como um todo. Nesta seção, o recorte é puramente econômico: todo padrão que gere emissão de ponto sem uma transação real subjacente (ex.: OCR de comprovante forjado, múltiplas contas do mesmo consumidor, conluio entre consumidor e funcionário da empresa parceira) é tratado como **perda a ser minimizada pelo modelo**, não como estatística aceitável de "custo do negócio" sem monitoramento. O Motor de Benefícios (`060-IA.md`) deve considerar sinais de risco antes de confirmar a emissão, não só depois.
