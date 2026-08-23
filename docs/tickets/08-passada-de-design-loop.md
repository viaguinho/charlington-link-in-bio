# 08 — Passada de fidelidade contra a referência

**What to build:** Comparação lado a lado com `marioo.info` nos mesmos viewports e nos
mesmos momentos da coreografia, e correção do que ficar devendo.

Depende do Prism e da suíte porque só faz sentido julgar o vidro com o campo vivo atrás
dele, e só vale corrigir o que a suíte protege de regressão.

Pontos que já sei que merecem escrutínio, por serem onde nós divergimos da referência de
propósito ou por acidente:

- Proporção da cápsula com cinco destinos em vez de três
- Peso e opacidade do texto dentro do vidro sobre um fundo mais colorido que o da referência
- Momento exato em que a cápsula materializa em relação à saída do logo
- Legibilidade da marca no slot, agora sobre um fundo que se move
- Comportamento em telas muito baixas, onde a cápsula chega perto das bordas

**Blocked by:** 03 — Prism como fundo vivo; 07 — Suíte Playwright

**Status:** ready-for-agent

- [ ] Capturas pareadas nossa/referência em mobile e desktop, nos mesmos progressos
- [ ] Cada divergência classificada como deliberada ou defeito
- [ ] Defeitos corrigidos; divergências deliberadas registradas com a justificativa
- [ ] A suíte continua verde depois das correções
