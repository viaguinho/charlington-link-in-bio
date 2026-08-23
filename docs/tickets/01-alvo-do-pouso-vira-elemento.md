# 01 — Prefactor: alvo do pouso do logo vira elemento

**What to build:** Nada muda na tela. Hoje o ponto onde o logo aterrissa é derivado de
variáveis CSS que descrevem a pílula do topo. Como a pílula vai deixar de existir e o logo
passará a pousar dentro da cápsula, o cálculo precisa ler a posição de um elemento real —
um slot marcado dentro do destino — em vez de números soltos em CSS.

O cálculo continua sendo feito só com caixas de layout, nunca com retângulos já
transformados, para poder ser refeito a qualquer momento durante a animação.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] O destino do logo é lido de um elemento referenciado, não de variáveis CSS
- [ ] O cálculo devolve escala, deslocamento vertical e deslocamento horizontal
- [ ] A medição continua imune a transforms aplicados ao logo
- [ ] Redimensionar a janela reposiciona o destino sem reiniciar a animação
- [ ] Comportamento visual idêntico ao de antes: o logo ainda pousa centrado na pílula
