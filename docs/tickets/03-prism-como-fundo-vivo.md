# 03 — Prism como fundo vivo

**What to build:** Um campo animado em WebGL preenchendo a tela inteira, atrás de tudo.
Existe por um motivo funcional, não decorativo: `backdrop-filter` sobre preto puro produz
cinza chapado, não vidro. A referência só parece vidro porque há uma grade colorida de
projetos atrás dela. Este é o nosso equivalente.

Componente Prism (React Bits), sobre `ogl`. Portado de TypeScript para JavaScript — o
projeto é só JS hoje e não vale introduzir uma linguagem a mais por causa de um arquivo.

Matiz puxada para o azul do logo, não o arco-íris padrão: o fundo tem de parecer da mesma
família da marca.

Teto de qualidade, decidido junto com o cliente depois de ver o custo: o shader faz cem
passos de raymarch por pixel, em tela cheia, a cada frame, concorrendo com o scrub e com
um `backdrop-filter`. Limitar o device pixel ratio corta quase metade do trabalho de
fragmento em celular sem mudança visível.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] O campo cobre a viewport inteira e fica atrás de todas as camadas
- [ ] A matiz está alinhada ao azul do logo, não ao padrão do componente
- [ ] O device pixel ratio tem teto, mais baixo em telas estreitas que em desktop
- [ ] Sob `prefers-reduced-motion` o campo não anima
- [ ] Não intercepta toque nem clique em nenhum estado
- [ ] O canvas é destruído ao desmontar, sem vazar contexto de WebGL nem rAF
- [ ] Nenhum erro de console em nenhum estado da página
