# SEC-001 — Auditoria Controlada de Dependências

**Status:** Concluída
**Data:** 2026-07-29
**Responsável pela execução:** Claude Code
**Regra desta tarefa:** nenhuma atualização destrutiva, nenhuma alteração em `package.json`.

---

## 1. Resumo

`npm audit` reportou **12 vulnerabilidades, todas de severidade "high"**, zero "critical". Nenhuma correção foi aplicada — apenas análise, conforme escopo da tarefa.

Fontes brutas: [`npm-audit.json`](npm-audit.json), [`npm-outdated.txt`](npm-outdated.txt).

As 12 vulnerabilidades se agrupam em **dois clusters independentes**, com perfis de risco muito diferentes:

- **Cluster A (9 itens) — toolchain de lint (ESLint/minimatch/brace-expansion).** Todas são `devDependencies`, usadas apenas em tempo de build/lint na máquina do desenvolvedor ou no CI. Nunca são incluídas no bundle de produção nem executadas no navegador do usuário final.
- **Cluster B (3 itens) — Next.js e suas dependências internas (`postcss`, `sharp`).** `next` é dependência de produção; `postcss` e `sharp` são internos ao próprio pacote `next` (não estão no nosso `package.json`).

---

## 2. Cluster A — Toolchain de lint (9 vulnerabilidades)

| Dependência | Direta/Transitiva | Severidade | Impacto real neste projeto |
|---|---|---|---|
| `eslint` | Direta (dev) | high | Nenhum — só roda em `npm run lint`, nunca em produção |
| `eslint-config-next` | Direta (dev) | high | Nenhum — idem |
| `@eslint/config-array` | Transitiva (via eslint) | high | Nenhum |
| `@eslint/eslintrc` | Transitiva (via eslint) | high | Nenhum |
| `eslint-plugin-import` | Transitiva (via eslint-config-next) | high | Nenhum |
| `eslint-plugin-jsx-a11y` | Transitiva (via eslint-config-next) | high | Nenhum |
| `eslint-plugin-react` | Transitiva (via eslint-config-next) | high | Nenhum |
| `minimatch` | Transitiva (via as acima) | high | Nenhum |
| `brace-expansion` | Transitiva (via minimatch) | high | Nenhum |

**Causa raiz comum:** todas dependem de uma versão antiga de `minimatch`/`brace-expansion` vulnerável a negação de serviço por expansão de chaves sem limite ([GHSA-mh99-v99m-4gvg](https://github.com/advisories/GHSA-mh99-v99m-4gvg)) — um problema de *quem processa o quê*: aqui, `minimatch` só é usado pelo ESLint para resolver padrões de arquivos a lintar, nunca com entrada controlada por um usuário externo.

**Existência de correção segura:** sim, mas apenas via `eslint@10.8.0` (major) — o `npm audit` marca `isSemVerMajor: true` para praticamente todo o cluster. Não existe patch minor/patch que resolva sem subir o ESLint para a v10.

**Risco de quebra:** alto. ESLint 10 muda a API de flat config e pode quebrar `eslint-config-next` (que hoje está fixado na v16.2.12, compatível com ESLint 9). Subir um sem o outro pode reintroduzir o mesmo erro de "circular structure to JSON" que corrigimos na tarefa anterior, ou pior.

**Ação sugerida:** **não agir agora.** Como é toolchain de desenvolvimento sem exposição em produção, a urgência é baixa. Recomendo tratar como um item de manutenção técnica (`chore:`) futuro, testado isoladamente, quando `eslint-config-next` também tiver uma versão estável para ESLint 10 — hoje ainda não há confirmação disso.

---

## 3. Cluster B — Next.js e dependências internas (3 vulnerabilidades)

| Dependência | Direta/Transitiva | Severidade | Impacto real neste projeto |
|---|---|---|---|
| `next` | Direta (produção) | high | Herdado de `postcss` e `sharp` internos — ver abaixo |
| `postcss` (interno ao `next`, em `node_modules/next/node_modules/postcss`) | Transitiva | high | Baixo hoje: processamento de CSS acontece só em build, sobre nosso próprio código-fonte, não sobre entrada de usuário |
| `sharp` (usado pelo `next/image`) | Transitiva | high | **Nenhum hoje** — o projeto ainda não usa `next/image`; passa a ser relevante assim que otimização de imagem for implementada |

**Detalhes:**
- `postcss <=8.5.17`: path traversal / leitura arbitrária de arquivo via `sourceMappingURL` em comentários CSS ([GHSA-r28c-9q8g-f849](https://github.com/advisories/GHSA-r28c-9q8g-f849), [GHSA-6g55-p6wh-862q](https://github.com/advisories/GHSA-6g55-p6wh-862q)), e XSS via `</style>` não escapado ([GHSA-qx2v-qp2m-jg93](https://github.com/advisories/GHSA-qx2v-qp2m-jg93)). Explorável somente se o pipeline de CSS processar conteúdo controlado por um atacante — não é o caso aqui (só compilamos nosso próprio Tailwind/CSS).
- `sharp <0.35.0`: vulnerabilidades herdadas da libvips (CVE-2026-33327/33328/35590/35591) — ver [GHSA-f88m-g3jw-g9cj](https://github.com/advisories/GHSA-f88m-g3jw-g9cj). Relevante apenas se `sharp` processar imagem vinda de fonte não confiável (ex.: upload de usuário via `next/image` com loader customizado ou processamento manual). Hoje o projeto não processa nenhuma imagem.

**Existência de correção segura:** o `npm audit` sugere `fixAvailable: next@9.3.3` — **essa sugestão é enganosa e não deve ser seguida**. Voltar de `next@16.2.12` para `9.3.3` seria um retrocesso de várias versões maiores, não uma correção. Isso acontece porque o resolvedor do `npm audit fix` às vezes encontra uma árvore de versões antiga que "satisfaz" o range de vulnerabilidade sem considerar que é uma regressão absurda. A correção real é **avançar** para uma versão futura de patch do Next 16.x que já traga `postcss`/`sharp` corrigidos internamente — hoje não há como saber qual será essa versão sem consultar o changelog do Next quando for lançada.

**Risco de quebra:** baixo para um patch futuro do Next 16.x (mudança interna, não deveria afetar nosso código); alto e desnecessário se alguém seguir a sugestão literal do `npm audit fix --force` (regressão de major).

**Ação sugerida:**
- **Não fazer nada agora** em relação a `postcss` (exposição nula no estado atual do projeto).
- **Monitorar `sharp`** e tratar antes de qualquer tarefa futura que implemente upload/processamento de imagem de usuário — nesse momento, validar se o Next já atualizou o `sharp` interno ou se será necessário um `overrides` explícito no `package.json` (decisão que exige aprovação, por alterar árvore de dependências).
- Acompanhar releases de patch do `next@16.x` e reavaliar este relatório quando uma nova versão for lançada.

---

## 4. Conclusão

Nenhuma das 12 vulnerabilidades tem exploração real possível no estado atual do projeto (fundação técnica, sem integrações, sem processamento de dados externos, sem upload de arquivos). Nenhuma ação de correção foi aplicada, conforme escopo da tarefa. Este relatório deve ser revisitado:

1. antes de implementar upload/processamento de imagem (por causa do `sharp`);
2. quando `eslint-config-next` publicar suporte oficial a ESLint 10;
3. a cada nova versão de patch do Next.js 16.x.
