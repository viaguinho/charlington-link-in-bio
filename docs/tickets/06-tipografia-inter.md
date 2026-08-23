# 06 — Tipografia da referência

**What to build:** A página passa a usar Inter, a família real da referência. Isto
**substitui** a decisão da primeira rodada (grotesk larga em caixa-alta), tomada quando eu
ainda não tinha medido a referência.

A referência usa dois tratamentos distintos da mesma família, e ambos importam:

| Onde | Tratamento |
|---|---|
| Dentro da cápsula | Inter 11px (13px em desktop), peso 400, tracking normal, **caixa mista** |
| Herói e navegação | Inter em caixa-alta com tracking largo |

Ou seja: `Agendar`, não `AGENDAR`, dentro da cápsula. O caixa-alta com tracking largo fica
só no nome e na linha de especialidade do herói.

Inter é também a família que o design system do médico já especifica, então esta mudança
aproxima a página do sistema existente sem desfazer a ruptura deliberada de cor.

**Blocked by:** 05 — Conteúdo da cápsula

**Status:** ready-for-agent

- [ ] Inter carregada e aplicada em toda a página
- [ ] A grotesk anterior não é mais carregada nem referenciada
- [ ] Conteúdo da cápsula em caixa mista, tracking normal, nos tamanhos da tabela
- [ ] Herói mantém caixa-alta com tracking largo
- [ ] O carregamento da fonte continua sendo aguardado pelo loader antes da expansão
