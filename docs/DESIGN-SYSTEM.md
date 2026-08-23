# Design System — Dr. Charlington Cavalcante

Implementação formal de [DESIGN.md](DESIGN.md) via `/design-system` (Claude Design).
DESIGN.md continua sendo a fonte de decisão (o "porquê"); este arquivo é a
implementação técnica (o "como"): tokens em código e componentes documentados.

- **Tokens:** [tokens.css](tokens.css) — nenhuma página deve redeclarar `:root`.
- **Referência viva:** [exemplo.html](exemplo.html) — consome `tokens.css`, zero
  valor de cor/espaçamento/raio hardcoded fora dele.

---

## Design System Audit

### Resumo
**Componentes revisados:** 8 | **Tokens migrados:** 26 | **Score:** 82/100

### Consistência de nomenclatura
| Item | Onde | Recomendação |
|---|---|---|
| Borda clara com dois valores distintos (`rgba(0,0,0,0.06)` na nav vs `rgba(0,0,0,0.08)` no FAQ) | exemplo.html (antes da migração) | Unificado em `--border-light-subtle: rgba(0,0,0,0.08)`. Aplicado. |
| Espaçamentos fora da escala base-4 (`28px`, `26px`, `20px`, `40px`, `60px`, `100px`) | exemplo.html (antes da migração) | Arredondados para o valor de escala mais próximo (ver tabela abaixo). Aplicado. |

### Cobertura de tokens
| Categoria | Definidos em tokens.css | Valores hardcoded restantes em exemplo.html |
|---|---|---|
| Cor | 9 (`--surface-*`, `--text-*`, `--accent`, `--border-*`) | 3 — `#fff` (fundo da pílula de nav), `rgba(255,255,255,0.03)` (fundo do card de depoimento), `rgba(47,102,224,0.15)` (fundo do avatar). Intencionais: são tintas derivadas, não cores novas; ver nota abaixo. |
| Tipografia | 7 (família, 2 pesos, 4 tamanhos de escala) | 4 tamanhos pontuais (13px, 15px, 16px, 20px) que não pertencem à escala nomeada de DESIGN.md — ficam como valores locais de componente, candidatos a token em uma futura revisão de tipografia. |
| Espaçamento | 11 (`--space-4` a `--space-120`) | 0 |
| Forma | 3 (`--radius-pill`, `--radius-card`, `--border-hairline`) | 0 |
| Movimento | 3 (`--ease-out`, `--duration-feedback`, `--duration-state`, `--duration-overlay`) | 0 |

Nota sobre as 3 cores hardcoded: `#fff` puro na pílula de nav e `rgba(255,255,255,0.03)`
no card de depoimento não viram token porque são usos únicos e situacionais (a nav é a
única superfície branca pura do sistema, o card usa uma tinta quase-invisível sobre o
fundo escuro). Promover isso a token criaria uma variável usada uma vez só — ruído, não
sistema. Se um segundo componente precisar da mesma tinta, aí sim vira token.

### Ajustes de espaçamento aplicados (arredondamento para a escala)
| Local | Valor original | Valor na escala | Diferença |
|---|---|---|---|
| `.hero` padding vertical | 120px / 100px | 96px / 96px | -24px / -4px |
| `.nav-pill` gap | 40px | 32px | -8px |
| `.nav-pill` padding horizontal | 28px | 24px | -4px |
| `.btn` padding horizontal | 26px | 24px | -2px |
| `.link-arrow` gap | 10px | 12px | +2px |
| `.section-light` / `.section-dark` padding vertical | 100px | 96px | -4px |
| `.traj-grid` gap | 60px | 64px | +4px |
| `.testi-grid` gap | 20px | 24px | +4px |
| `.foot-grid` gap | 40px | 48px | +8px |

Todos verificados visualmente após a migração — nenhuma quebra de layout.

### Completude dos componentes
| Componente | Estados | Variantes | Docs | Score |
|---|---|---|---|---|
| Nav | ✅ | — (único) | ✅ | 9/10 |
| Botão | ✅ | ✅ (primário/secundário) | ✅ | 9/10 |
| Link com ação | ✅ | — (único) | ✅ | 8/10 |
| Tag/eyebrow | ⚠️ (sem estado ativo definido) | — (único) | ✅ | 7/10 |
| Card de depoimento | ⚠️ (sem estado de carregamento/vazio) | — (único) | ✅ | 7/10 |
| Accordion | ✅ | — (único) | ✅ | 8/10 |
| Lista de tópicos | — (estático) | — (único) | ✅ | 9/10 |
| Slides (abertura/conteúdo/citação/dados/rodapé) | — (estático) | ✅ (5 tipos) | ✅ | 8/10 |

### Ações prioritárias
1. Definir estado de foco visível em código para nav, botões e accordion (regra já
   existe em DESIGN.md → Acessibilidade; falta implementação de `:focus-visible` em
   exemplo.html).
2. Nenhum componente de formulário existe em DESIGN.md nem em exemplo.html (input,
   select, validação). Necessário antes de construir a página de agendamento — ver
   "Extend" abaixo.
3. Padronizar os 4 tamanhos de tipografia pontuais (13/15/16/20px) usados em
   metadados de componente — hoje fora da escala nomeada.

---

## Componentes documentados

### Nav

**Descrição:** Cápsula de navegação principal, sempre visível, flutuante a
`--space-24` do topo.

**Variantes:** única — não varia por página.

**Props / Propriedades**
| Propriedade | Tipo | Padrão | Descrição |
|---|---|---|---|
| `links` | `{label, href}[]` | 4–5 itens | Itens de navegação |
| `cta` | `{label, href}` | `{Agendar, #}` | Ação primária, sempre a mais à direita |

**Estados**
| Estado | Visual | Comportamento |
|---|---|---|
| Default | fundo `#fff`, borda `--border-light-subtle` | — |
| Hover (link) | cor mantém `--text-on-light`, sem sublinhado | cursor pointer |
| Foco de teclado | outline em `--accent` (pendente de implementação) | `Tab` percorre logo → links → CTA |
| Scroll | permanece fixa (`position: sticky`) | não encolhe, não ganha sombra |

**Acessibilidade**
- **Role:** `nav` com `aria-label="Principal"`.
- **Teclado:** `Tab`/`Shift+Tab` entre itens; `Enter` ativa o link focado.
- **Leitor de tela:** anunciar como "Navegação, Principal"; CTA anunciado como botão
  de link, não botão de formulário.
- Alvo de toque de cada link ≥ 44×44px (aplicado via `min-height` + padding).

**Do's e Don'ts**
| ✅ Fazer | ❌ Não fazer |
|---|---|
| Manter 4–5 links no máximo | Adicionar dropdown/mega-menu — quebra a metáfora de cápsula |
| Logo circular à esquerda | Logo retangular ou com texto — foge da forma pílula do sistema |

**Código**
```html
<nav aria-label="Principal">
  <div class="nav-pill">
    <div class="logo" role="img" aria-label="Charlington Cavalcante"></div>
    <div class="nav-links">
      <a href="#metodo">Método</a>
      <a href="#trajetoria">Trajetória</a>
      <a href="#artigos">Artigos</a>
      <a href="#info">Info</a>
      <a href="#agendar">Agendar</a>
    </div>
  </div>
</nav>
```

---

### Botão

**Descrição:** Ação clicável em formato pílula. Duas variantes, nunca uma terceira
cor.

**Variantes**
| Variante | Usar quando |
|---|---|
| Primário | uma única ação por seção, a mais importante ("Agendar") |
| Secundário (outline) | ações de apoio ao lado do primário |

**Props**
| Propriedade | Tipo | Padrão | Descrição |
|---|---|---|---|
| `variant` | `"primary" \| "secondary"` | `"secondary"` | Estilo visual |
| `label` | `string` | — | Texto do botão, verbo de ação |
| `href` | `string` | — | Destino; usar `<a>`, não `<button>`, quando navega |

**Estados**
| Estado | Visual | Comportamento |
|---|---|---|
| Default | pílula cheia (`--accent`) ou contorno (`--accent` 1px) | — |
| Hover | `opacity: 0.85`, `--duration-state` `--ease-out` | — |
| Foco de teclado | outline visível em `--accent` (pendente) | `Enter`/`Space` ativa |
| Disabled | não definido em DESIGN.md | **gap — ver Ações prioritárias** |

**Acessibilidade**
- **Role:** `button` nativo ou `a` com `role` implícito de link — nunca `div`.
- **Teclado:** focável, ativável por `Enter`/`Space` se `<button>`, só `Enter` se `<a>`.
- **Leitor de tela:** o texto do botão é a própria ação ("Agendar"), sem depender de
  ícone.

**Do's e Don'ts**
| ✅ Fazer | ❌ Não fazer |
|---|---|
| Um botão primário por seção visível | Dois botões primários lado a lado |
| Verbo de ação direto ("Agendar") | Texto genérico ("Clique aqui") |

**Código**
```html
<a class="btn btn-primary" href="#agendar">Agendar</a>
<a class="btn btn-outline" href="#metodo">Neurologia</a>
```

---

### Link com ação

**Descrição:** Não é um botão — é um link textual em `--accent` com um círculo-seta
que se desloca no hover. Usado para ações secundárias dentro de blocos de texto.

**Variantes:** única.

**Estados**
| Estado | Visual | Comportamento |
|---|---|---|
| Default | círculo com borda `--accent`, seta `→` centralizada | — |
| Hover | círculo desloca `translateX(3px)` | `--duration-state` `--ease-out` |
| Foco de teclado | outline no texto e no círculo (pendente) | `Enter` ativa |

**Acessibilidade**
- **Role:** `a` nativo.
- **Leitor de tela:** o `→` é puramente decorativo (`aria-hidden="true"`); o texto do
  link já carrega o destino ("Agendar consulta").

**Do's e Don'ts**
| ✅ Fazer | ❌ Não fazer |
|---|---|
| Usar dentro de parágrafo ou fim de bloco de texto | Usar como CTA principal de uma seção — isso é papel do botão primário |

**Código**
```html
<a class="link-arrow" href="#agendar">
  <span class="circle" aria-hidden="true">→</span> Agendar consulta
</a>
```

---

### Tag / eyebrow

**Descrição:** Rótulo pequeno em caixa-alta, pílula com contorno azul, sem
preenchimento. Usado acima de títulos de seção e como marcador de categoria.

**Variantes:** única.

**Estados**
| Estado | Visual | Comportamento |
|---|---|---|
| Default | contorno `--accent`, texto `--accent` ou `--text-muted-light` conforme fundo | — |
| Ativo/selecionado | **não definido em DESIGN.md** | gap — só relevante se a tag virar filtro clicável |

**Acessibilidade**
- Se puramente decorativa (rótulo de seção): `aria-hidden="true"`, o `<h2>` seguinte
  já carrega o significado.
- Se interativa (filtro): precisa de `role="button"` ou `<button>` real e estado
  `aria-pressed`.

**Do's e Don'ts**
| ✅ Fazer | ❌ Não fazer |
|---|---|
| Texto curto, 1–3 palavras, caixa-alta | Frase completa dentro da tag |
| Usar como rótulo, não como navegação | Empilhar várias tags coloridas diferentes — só existe uma cor de tag |

**Código**
```html
<p class="eyebrow">Neurologista</p>
```

---

### Card de depoimento

**Descrição:** Fundo escuro, borda sutil, avatar circular com iniciais, citação e
atribuição. Só existe em seção escura.

**Variantes:** única (mas tamanho/posição variam entre cards — nunca grade
idêntica, ver Proibições em DESIGN.md).

**Estados**
| Estado | Visual | Comportamento |
|---|---|---|
| Default | `background: rgba(255,255,255,0.03)`, borda `--border-dark-subtle`, raio `--radius-card` | — |
| Vazio (sem depoimentos ainda) | **não definido** | gap — precisa de um estado vazio antes de ir para produção |
| Carregando (se depoimentos vierem de API) | **não definido** | gap |

**Acessibilidade**
- **Role:** `blockquote` para a citação, `cite` ou `figcaption` para nome + relação.
- **Leitor de tela:** ordem de leitura é citação → nome → relação, nunca inversa.

**Do's e Don'ts**
| ✅ Fazer | ❌ Não fazer |
|---|---|
| Manter a voz espontânea do depoimento, sem editar para soar corporativo | Cortar a citação no meio para caber no card |

**Código**
```html
<blockquote class="testi-card">
  <p>"Dr. Charlington já havia sido muito bem recomendado..."</p>
  <footer class="testi-foot">
    <div class="avatar" aria-hidden="true">K</div>
    <div><cite class="testi-name">Karina</cite><div class="testi-role">Mãe de paciente</div></div>
  </footer>
</blockquote>
```

---

### Accordion

**Descrição:** Título clicável com ícone `+`/`—`, usado em FAQ e artigos.

**Estados**
| Estado | Visual | Comportamento |
|---|---|---|
| Fechado | ícone `+`, sem conteúdo visível | `aria-expanded="false"` |
| Aberto | ícone `—`, conteúdo visível | `aria-expanded="true"`, expande em `--duration-state` `--ease-out` |
| Hover | sem mudança de cor forte (o sistema não usa hover chamativo aqui) | cursor pointer |
| Foco de teclado | outline visível (pendente) | `Enter`/`Space` alterna |

**Acessibilidade**
- **Role:** botão de cabeçalho com `aria-expanded` e `aria-controls` apontando para
  o painel; painel com `role="region"` e `aria-labelledby`.
- **Teclado:** `Tab` foca o cabeçalho, `Enter`/`Space` alterna.
- Alvo de toque do cabeçalho inteiro (não só o ícone) ≥ 44px de altura.

**Do's e Don'ts**
| ✅ Fazer | ❌ Não fazer |
|---|---|
| Ícone `+`/`—` estático | Seta rotativa — proibido no sistema |
| Um item aberto por vez ou múltiplos, à escolha do produto | Animação de entrada exagerada no conteúdo |

**Código**
```html
<button class="faq-item" aria-expanded="false" aria-controls="faq-1">
  <span class="q">Qual o horário de atendimento?</span>
  <span class="icon" aria-hidden="true">+</span>
</button>
<div id="faq-1" role="region" hidden>...</div>
```

---

### Lista de tópicos

**Descrição:** Lista com travessão (—) como marcador. Usada em trajetória
acadêmica e listas de método.

**Estados:** estático, sem interação.

**Acessibilidade**
- **Role:** `<ul>`/`<li>` semânticos mesmo sem bullet visual — o travessão é
  `aria-hidden`, o item de lista carrega o significado.

**Do's e Don'ts**
| ✅ Fazer | ❌ Não fazer |
|---|---|
| Travessão como `<span aria-hidden="true">—</span>` dentro do `<li>` | Usar `list-style: none` sem repor a semântica de lista para leitor de tela |

**Código**
```html
<ul class="dash-list">
  <li><span class="mark" aria-hidden="true">—</span>Médico graduado pela UECE</li>
</ul>
```

---

## Extend — gaps identificados (fora do escopo atual do DESIGN.md)

Estes padrões vão ser necessários para páginas futuras (agendamento, contato) mas
**não têm especificação em DESIGN.md** — não foram inventados aqui, ficam como
questão em aberto para decisão de marca antes de implementar.

### Campo de formulário (input/select)
**Problema:** a página de agendamento precisa de campos de formulário; nenhum
componente de input existe no sistema hoje.
**Padrões existentes mais próximos:** o botão (pílula, contorno azul) e o card
(raio 16–20px, borda sutil) — nenhum resolve o padrão de campo + label + erro.
**Perguntas em aberto:**
- Campo com contorno pílula (como o botão) ou com raio de card (16–20px)?
- Como o estado de erro se expressa sem violar "nunca faixa colorida na borda" e
  "informação nunca só por cor" (Proibições + Acessibilidade em DESIGN.md)?

### Toast / mensagem de feedback (ex.: "consulta agendada")
**Problema:** nenhuma confirmação assíncrona está desenhada.
**Padrões existentes mais próximos:** card de depoimento (fundo, borda, raio) —
mas depoimento é permanente, toast é transitório.
**Pergunta em aberto:** posição, duração de exibição, se usa `--duration-overlay`
para entrada/saída.

Recomendação: resolver os dois antes de construir a página de agendamento — não
improvisar no momento da implementação.
