# DESIGN.md
Sistema de design — Dr. Charlington Cavalcante (neurologia/neuropediatria)
Extraído de charlington.com.br em 11/08/2026.

Implementação: tokens em [tokens.css](tokens.css), componentes documentados e gaps
em [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md), referência viva em [exemplo.html](exemplo.html).

## Marca e voz
Para famílias buscando um neurologista infantil de confiança — pais ansiosos por um
diagnóstico claro, não por jargão. Sensação em três palavras: clínico, humano, sereno.
A escrita é calma e em primeira pessoa quando fala do método ("foco em explicar
diagnósticos de forma compreensível"). Frases curtas, sem exclamação, sem venda
agressiva. Depoimentos de pacientes mantêm a voz espontânea deles, sem editar para
soar corporativo.

## Cor
- Fundo claro (`--surface-light`): `#F1F1EF` — cinza levemente quente, nunca branco puro
- Fundo escuro (`--surface-dark`): `#0A0A0C` — quase preto, nunca `#000`
- Texto sobre claro (`--text-on-light`): `#17181C`
- Texto sobre escuro, primário (`--text-on-dark`): `#F4F5F6`
- Texto sobre escuro, secundário (`--text-muted-dark`): `#9BA1AC`
- Texto secundário sobre claro (`--text-muted-light`): `#6C7078`
- Destaque único (`--accent`): `#2F66E0` — azul cobalto. É a única cor viva do sistema;
  usado em links, botão primário, contorno de tags e ícones de rede social.
Estratégia: **contida com um destaque** — neutros dominam, o azul aparece só em ação
(link, CTA, tag) e nunca decorando.

## Tipografia
- Títulos e corpo: uma família sans humanista/geométrica única (ex.: Inter ou General
  Sans), sem serifada de apoio — a marca não mistura duas famílias.
- Escala: eyebrow 12px caixa-alta com tracking largo → corpo 16–18px → título de seção
  36–44px → título de herói 56–64px. Cada salto é nítido, nunca dois tamanhos próximos.
- Peso: regular no corpo, medium (não bold pesado) nos títulos.
- Linha de texto limitada a ~65–75 caracteres nos parágrafos de método e artigos.

## Espaçamento e layout
- Nav flutuante em cápsula, sempre a ~24px do topo, centralizada.
- Seções ocupam a largura total da viewport (full-bleed), mas o conteúdo interno
  respeita uma coluna central de ~1100–1200px.
- Respiro generoso entre blocos (80–120px de padding vertical por seção); dentro de um
  bloco, o espaçamento é mais apertado (16–24px) — ritmo variado, não uma grade única.
- Alternância estrita: seção clara → seção escura → clara, nunca duas do mesmo tom
  seguidas.
- Escala de espaçamento em base 4 (não só múltiplos de 8, que pulam os intermediários
  úteis): `4, 8, 12, 16, 24, 32, 48, 64, 80, 96, 120px`. Todo valor de gap/padding deve
  cair nessa escala, nunca um número solto.
- Alvo de toque mínimo de 44×44px em qualquer elemento clicável, mesmo quando a marca
  visual (ícone do accordion, seta do link) é menor — a área de clique excede o desenho.

## Forma e elevação
- Raio de canto máximo: pílula (`border-radius: 999px`) em nav, botões e tags.
- Cards e blocos de conteúdo: raio moderado (16–20px), nunca cantos vivos.
- Sem sombra para elevação. Profundidade vem de contraste de fundo (claro/escuro) ou
  borda de 1px sutil (`rgba(255,255,255,0.08)` sobre escuro).
- Divisórias entre itens de lista/FAQ são linhas finas de 1px, não espaço em branco.

## Acessibilidade
- Contraste mínimo WCAG AA: texto de corpo/placeholder ≥ 4.5:1, texto grande (≥24px, ou
  ≥19px em medium) ≥ 3:1, ícones e indicadores de foco ≥ 3:1. Conferir os pares reais de
  fundo/texto nos dois modos, claro e escuro, não só a olho.
- Texto secundário sobre fundo colorido nunca em cinza genérico de sistema: usar os
  tokens já derivados do próprio fundo (`--text-muted-dark`, `--text-muted-light`).
- Estado de foco de teclado sempre visível (outline ou contorno em `--accent`), inclusive
  em nav, botões e itens de accordion.
- Informação nunca comunicada só por cor: erro de formulário leva texto + contorno, não
  só borda vermelha; link leva sublinhado ou peso, não só a cor azul.

## Movimento
- Transições discretas e rápidas (200–250ms, ease-out) em hover de botão e expansão de
  accordion (FAQ, artigos).
- Paginação por pontos (dots) em carrosséis, sem seta grande nem autoplay chamativo.
- Nenhuma animação de entrada exagerada; o movimento serve para orientar (abrir/fechar),
  não para decorar.
- Curva de saída: `cubic-bezier(0.16, 1, 0.3, 1)` (desaceleração natural). Nunca bounce
  ou elástico, mesmo em micro-interações.
- Duração por consequência: 100–150ms feedback imediato (clique, toggle) · 150–300ms
  mudança de estado rotineira (hover, accordion) · 300–500ms transição de camada/overlay
  (modal, menu). Saída sempre mais rápida que entrada.

## Componentes
- **Nav**: cápsula clara flutuante, logo à esquerda, 4–5 links à direita, sempre visível.
- **Botão primário**: pílula azul cheia, texto branco ("Agendar").
- **Botão secundário**: pílula com contorno azul fino, fundo transparente.
- **Link com ação**: círculo com seta + texto azul ("→ Agendar consulta"), não botão.
- **Tag/eyebrow**: pílula com contorno azul, texto caixa-alta pequeno, sem preenchimento.
- **Card de depoimento**: fundo escuro, borda 1px sutil, avatar circular com iniciais,
  citação entre aspas, nome + relação ("Mãe de paciente") abaixo.
- **Accordion**: título + ícone `+`/`—` à direita, linha divisória fina, sem seta rotativa.
- **Lista de tópicos**: travessão (—) como marcador, nunca bullet redondo ou ícone.

## Apresentações (slides)
- Formato 16:9 (1920×1080). Margem de segurança de 96px em todos os lados; nenhum
  elemento de texto encosta na borda.
- Alternância clara/escura vale por slide, como em seções de página: um slide de
  transição escuro a cada 3–4 slides claros, nunca dois escuros seguidos.
- **Slide de abertura/capítulo** (`--surface-dark`): título único centralizado ou à
  esquerda em título de seção (36–44px, peso medium), eyebrow em `--accent` acima,
  sem imagem de fundo decorativa.
- **Slide de conteúdo** (`--surface-light`): título de seção no topo (28–32px),
  corpo em lista de tópicos com travessão (—) como marcador, nunca mais de 5 itens
  por slide. Um único ponto de dado ou ideia por slide, não parágrafos densos.
- **Slide de citação/depoimento**: reaproveita o card de depoimento (fundo escuro,
  borda 1px sutil `rgba(255,255,255,0.08)`, raio 16–20px), citação grande centralizada,
  nome + relação abaixo em `--text-muted-dark`.
- **Slide de dados/gráfico**: fundo claro, um único destaque em `--accent` para o
  dado principal; todas as demais séries em tons de cinza (`--text-muted-light`,
  `--text-muted-dark`). Nunca paleta multicolorida no gráfico. Números sempre com
  rótulo por extenso ao lado, nunca bloco de métrica gigante isolado.
- **Rodapé de slide**: número da página + wordmark discreta em `--text-muted-light`
  (claro) ou `--text-muted-dark` (escuro), canto inferior, 12px, sem linha divisória.
- Transição entre slides: corte seco ou fade rápido (200–250ms), nunca slide/wipe
  decorativo nem zoom.

## Proibições
- Nunca `#000` ou `#fff` puros — sempre os tons levemente tingidos acima.
- Nunca gradiente em texto ou botão.
- Nunca faixa colorida na borda esquerda de card — usar borda completa ou fundo tingido.
- Nunca glassmorphism/blur decorativo — a cápsula de nav é sólida, não translúcida.
- Nunca bloco hero de métrica gigante (número + rótulo minúsculo).
- Nunca grade de cards idênticos (mesmo ícone/título/caixa repetidos) — variar tamanho
  e posição como nos depoimentos.
- Nunca travessão longo (em dash) substituindo vírgula no corpo do texto — usar vírgula,
  dois-pontos ou ponto final; o travessão é reservado a marcador de lista.
- Nunca emoji ou pontuação exclamativa em textos institucionais.
- Nunca modal para uma tarefa que não exige interrupção ou foco protegido (FAQ, exibição
  de conteúdo, confirmação simples) — usar accordion, seção ou página própria.
- Nunca sparkline, anel de progresso ou bloco com sombra suave simulando conteúdo real —
  gráfico e métrica exigem dado real, nunca placeholder decorativo.
- Números de seção (01/02/03) só quando a sequência é informação real, como na ordem
  cronológica da trajetória acadêmica; nunca como decoração estrutural de um bloco.
