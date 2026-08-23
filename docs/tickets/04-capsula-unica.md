# 04 — Cápsula única substitui pílula e cartão

**What to build:** Ao fim da rolagem existe **uma** superfície de vidro, centralizada na
tela, e o logo pousa dentro do topo dela. A pílula do topo deixa de existir.

Isto corrige um erro de leitura da referência feito na primeira rodada: `marioo.info` não
tem pílula de navegação mais cartão separado — tem uma cápsula única centralizada com o
logo dentro. Duas superfícies eram invenção nossa.

Valores extraídos do DOM da referência, não estimados:

| Propriedade | Valor |
|---|---|
| Raio | `9999px` (cápsula completa) |
| Desfoque de fundo | `blur(24px)` |
| Fundo | `rgba(0, 0, 0, 0.25)` |
| Borda | `1px` em `rgba(255, 255, 255, 0.1)` |
| Largura | 118px em mobile, 172px em desktop |

Nossa cápsula é mais alta e um pouco mais larga que a da referência, porque carrega cinco
destinos em vez de três. A proporção esbelta (largura em torno de 40% da altura) é o que
faz o raio total ler como cápsula em vez de pastilha, e precisa ser preservada.

A coreografia existente permanece: o logo continua saindo do centro cedo, a cápsula
materializa antes do conteúdo, e o último elemento da timeline termina exatamente em 1.0.

**Blocked by:** 01 — Prefactor: alvo do pouso do logo vira elemento

**Status:** ready-for-agent

- [ ] Existe uma única superfície de vidro na página; a pílula do topo não existe mais
- [ ] A cápsula usa os cinco valores da tabela acima
- [ ] A cápsula fica centralizada na viewport
- [ ] O centro do logo coincide com o centro do slot no topo da cápsula ao fim da rolagem
- [ ] A proporção esbelta se mantém em mobile e desktop
- [ ] O logo é pintado acima da cápsula, nunca por baixo do desfoque dela
- [ ] O último elemento da timeline do scrub ainda termina em 1.0
