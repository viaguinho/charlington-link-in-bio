# Brief — Página link-in-bio, Dr. Charlington Cavalcante

Substitui `linktr.ee/drcharlington`. Referência de estrutura e movimento: `marioo.info`.
Definido em sessão de grilling, 13/08/2026.

---

## Decisões travadas

| Eixo | Decisão |
|---|---|
| Identidade | Escuro derivado do logo. Fundo `--surface-dark` (#0A0A0C, do DS existente), paleta de acento extraída do azul iridescente do próprio logo — **não** o `--accent` cobalto do site atual. |
| Conteúdo | Apenas os links do Linktree. Sem bio, sem depoimentos, sem FAQ. |
| Stack | Vite + React + Tailwind (mesma da referência) + GSAP ScrollTrigger + Lenis. |
| Alvo | **Mobile-first.** Animação calibrada em retrato de celular; desktop adapta. |
| Estrutura final | Pílula de vidro fixa no topo (só logo) + cartão de vidro separado abaixo com os links. |
| Abertura | Loader fiel, ~2.5s, **em toda visita**. |
| Logo | Recorte do fundo branco + halo/bloom azul radial por trás para repor a luminosidade perdida sobre preto. |
| Tipografia | Grotesk larga, caixa-alta com tracking aberto (Space Grotesk / Archivo). |
| Herói | Nome + especialidade sob o logo. |
| Endereços | Item expansível revelando endereço completo + botão "Como chegar" (Google Maps). |
| Copy | Reescrita para ação (sujeita a aprovação — ver abaixo). |
| CRM/RQE | Incluir, rodapé discreto do cartão. |
| Foto do médico | Não usar. |
| Instagram | Ícone discreto no rodapé, junto do LinkedIn. |
| Deploy | Build estático com base path relativo. Host indefinido. |

---

## Coreografia da animação

Esta é a parte central do projeto. Cinco fases.

### Fase 0 — Loader (0 → ~2.5s, sempre)
- Fundo `#0A0A0C`. Logo em escala mínima (~28px), centralizado, opacidade ~0.6.
- Abaixo dele, régua de 260×1px em `rgba(255,255,255,0.15)`; preenche em branco de 0→100%,
  atrelada ao preload real dos assets, com piso de 2.5s (nunca termina antes).
- Bloom azul atrás do logo pulsa: `scale 1 → 1.06`, 2s, alternate.

### Fase 1 — Expansão (~900ms)
- Régua desaparece (opacity, 150ms).
- Logo faz scale de 28px até o tamanho de herói com `cubic-bezier(0.16, 1, 0.3, 1)`
  (o `--ease-out` que já existe em `tokens.css`).
- +200ms: nome e especialidade entram com fade + `translateY(12px → 0)`.
- +400ms: "ROLE PARA EXPLORAR ⇳" entra, com loop sutil de `translateY`.

### Fase 2 — Herói em repouso (scroll = 0)
- Logo: `78vw` de largura no mobile, `52vh` de altura no desktop.
- Halo radial azul atrás, blur amplo, extraído da própria paleta do logo.

### Fase 3 — Scrub (scroll 0 → 1 viewport, pinado)
Uma timeline única, `scrub: true`. Progresso `p` de 0 a 1:

| Elemento | Comportamento |
|---|---|
| Logo | scale do herói → 32px + translate do centro → pílula do topo. Curva não-linear: devagar até `p≈0.4`, rápido depois. |
| Nome / especialidade | `opacity 1→0` e `translateY -20px` em `p 0 → 0.35`. |
| Pílula de vidro | Entra em `p 0.55`: largura cresce, `backdrop-blur 0 → 20px`, borda `white/10` em fade. |
| Cartão de links | Entra em `p 0.60`: `translateY(40px → 0)` + opacity. Itens em stagger de 60ms. |
| Halo azul | Contrai e atenua acompanhando o logo. |

### Fase 4 — Repouso final
Pílula fixa a 24px do topo com o logo. Cartão de vidro centralizado com os links.
Rodapé do cartão: CRM/RQE + ícones de LinkedIn e Instagram.

### `prefers-reduced-motion`
Pula o loader, sem scrub, sem pin. Entra direto no estado da Fase 4.

---

## Conteúdo do cartão (copy proposta — precisa de aprovação)

| # | Rótulo proposto | Destino | Rótulo original no Linktree |
|---|---|---|---|
| 1 | Agendar consulta no WhatsApp | `wa.me/5519971502747` | "Agendamentos" |
| 2 | Consultório em Campinas | expansível → Praça Capital, Av. José Rocha Bonfim, 214 — Jardim Santa Genebra + "Como chegar" | "Endereço - Campinas, SP" (era texto puro) |
| 3 | Consultório em Fortaleza | expansível → Uno Medical Office, Av. Pontes Vieira, 2340, sala 704 — São João do Tauape + "Como chegar" | "Endereço - Fortaleza, CE" (era texto puro) |
| 4 | Avaliações e agenda no Doctoralia | `doctoralia.com.br/charlington-cavalcante/...` | "Doctoralia" |
| 5 | Site oficial — charlington.com.br | `https://charlington.com.br/` | "Site" |

**LinkedIn sai da lista** e vira ícone de rodapé, ao lado do Instagram. A lista fica com 5 itens
em vez de 6 — mais limpa no retrato de celular.

**Herói:** `DR. CHARLINGTON CAVALCANTE` em grotesk caixa-alta, e abaixo
`NEUROPEDIATRA · CAMPINAS E FORTALEZA` em corpo pequeno com tracking largo.

---

## Riscos — situação final

| # | Risco | Situação |
|---|---|---|
| 1 | Toolchain pesado para 5 links: trocar um telefone exige Node + `npm run build`. | **Aceito.** Mitigado concentrando todo o conteúdo em `src/content.js`. |
| 2 | Logo raster perderia nitidez no herói em tela cheia. | **Resolvido.** O SVG vetorial (8 paths, gradientes originais) chegou em 13/08. |
| 3 | Sem forma-alvo para o morph. | **Resolvido de outro jeito.** O encaixe é scale + translate com a pílula materializando sob o logo, e a marca troca para silhueta clara ao encolher. |
| 4 | Pin de ScrollTrigger brigando com a barra de endereço do Safari iOS. | **Evitado.** Não há pin: tudo é `fixed` sobre um trilho de `200svh`, com `ignoreMobileResize`. |
| 5 | Loader de 2.5s em toda visita custa conversão. | **Aberto, por decisão do cliente.** Registrado. |
| 6 | Logo abstrato não identifica. | **Mitigado.** Nome no herói e no topo do cartão. |

## Correções encontradas durante a construção

Coisas que só apareceram com a página rodando, todas já corrigidas — estão documentadas
em [../README.md](../README.md) para não voltarem numa manutenção futura.

1. **O cartão invisível engolia o gesto de rolar.** Ficava `pointer-events-auto` no centro
   da tela durante todo o herói, com os links clicáveis às cegas.
2. **A pílula estava empilhada acima do logo**, pintando o próprio `backdrop-blur` sobre a
   marca e escurecendo justamente o que precisava de contraste.
3. **O stagger esticava a timeline para 1.31**, e como o `scrub` mapeia a rolagem sobre a
   duração *total*, tudo disparava ~30% mais cedo do que a marcação sugeria — o logo
   ainda estava grande e centralizado quando o cartão subia, e passava por cima do título.
4. **Rótulos desalinhados**: duas linhas tinham ícone, duas não.
5. **O "vidro" não lia como vidro**: `backdrop-filter` sobre preto puro é cinza chapado.

---

## Pendências

- [ ] **RQE** — só o CRM foi informado (CRM-SP 173176). A CFM 2.336/2023 pede o RQE quando
      há especialidade registrada. Se existir, é uma linha em `PROFILE.council`.
- [ ] **OG image** — gerar `public/og.png` (1200×630) e trocar as URLs absolutas de Open
      Graph em `index.html` quando o domínio for definido.

Entregue e verificado: CRM-SP 173176 no rodapé do cartão, Instagram `charlington.cavalcante`,
copy aprovada dos 5 rótulos, logo vetorial no herói.
