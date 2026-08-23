# Link-in-bio — Dr. Charlington Cavalcante

Substitui `linktr.ee/drcharlington`. Estrutura e motion recriados de `marioo.info`.

**Se você é um agente ou acabou de abrir este projeto: leia [AGENTS.md](AGENTS.md) antes
de editar.** Ele lista as decisões que parecem defeito mas são intencionais, e três
invariantes que já quebraram.

Decisões e o porquê em [docs/BRIEF.md](docs/BRIEF.md); comportamento esperado em
[docs/SPEC.md](docs/SPEC.md); tickets da revisão de agosto/2026 em
[docs/tickets](docs/tickets).

## Rodar

As dependências já estão instaladas nesta pasta, então basta:

```bash
npm run dev
```

Se `node_modules` sumir ou o Node for atualizado, reinstale com `npm install`.

> **Este projeto não está sob controle de versão.** Não há histórico e não há como
> desfazer. Num editor movido a agente, onde alterações grandes acontecem de uma vez, isso
> é risco real. Um `git init` seguido de um commit inicial resolve, e leva segundos.

## Editar num editor de agente

O contexto que um agente precisa está em [AGENTS.md](AGENTS.md): as divergências
deliberadas em relação à referência, os invariantes da coreografia e a ordem de
empilhamento. Sem esse arquivo, a tendência natural é "consertar" coisas que foram
decididas de propósito.

## Testar

```bash
npm test
```

Playwright contra o **build de produção** (não o dev server), em mobile e desktop. Não há
teste de componente de propósito: montar os componentes isoladamente passa com a animação
inteiramente quebrada, e a animação é o projeto.

## Publicar

```bash
npm run build
```

Gera `dist/` (~384 KB, ~128 KB gzip) com `base` relativo — funciona em qualquer host, na
raiz ou em subpasta.

## Editar conteúdo

Tudo em [`src/content.js`](src/content.js). Nenhuma string fica nos componentes.

Ao publicar num domínio definitivo, trocar as URLs absolutas de Open Graph em
[`index.html`](index.html) e gerar um `public/og.png` (1200×630).

## Arquitetura

| Arquivo | Papel |
|---|---|
| `src/App.jsx` | Coreografia inteira: loader, expansão, scrub e o encaixe do logo no slot. |
| `src/Capsule.jsx` | A superfície única de vidro e seu conteúdo. |
| `src/Prism.jsx` | Campo animado em WebGL, portado de TypeScript para JS. |
| `src/content.js` | Conteúdo. Único arquivo tocado em manutenção comum. |
| `src/index.css` | Paleta derivada do logo, Inter, largura do herói. |
| `tests/page.spec.js` | A costura de teste. |

## Detalhes que não são óbvios no código

- **A duração total da timeline do scrub é 1.0 por construção.** O `scrub` mapeia a
  rolagem sobre a duração *total*; se o stagger das linhas empurrar o fim para 1.3, tudo
  antes dele dispara 30% mais cedo do que as marcações escritas sugerem. Ao mexer no
  stagger ou no número de linhas, reajuste para o fim continuar em 1.0. O teste "o logo
  nunca cobre o nome" existe para acusar isso — e já acusou uma vez, no desktop.
- **O conteúdo da cápsula entra tarde (0.80).** No desktop o logo do herói tem 531px
  contra uma cápsula de 236px; a 70% do gesto ele ainda cobre o nome. A superfície de
  vidro materializa cedo, o texto só quando o logo está quase pousado.
- **Empilhamento:** Prism em `z-0`, cápsula em `z-20`, logo e assinatura em `z-30`. O logo
  tem de pousar *sobre* a cápsula — invertido, o `backdrop-filter` dela é pintado por cima
  da marca e a escurece exatamente onde ela precisa de contraste.
- **Dois logos empilhados.** O de gradiente domina o herói; ao encolher para o tamanho do
  slot o gradiente afunda no vidro escuro (termina em `#253b7b`), então uma silhueta clara
  via `mask-image` assume.
- **O Prism usa `hueShift={0}`.** A saída crua do shader já é um azul-aço da mesma família
  do logo. Rotacionar a matiz leva para verde (2.2) ou para cinza quase morto (5.6) — a
  rotação desse shader não é linear. Medido por varredura, não estimado.
- **O véu radial sobre o Prism não é decorativo.** Cru, a crista clara do shader passa por
  cima do nome e apaga os ícones da base da cápsula. O véu escurece mais no centro,
  exatamente onde o texto vive.
- **`maxDpr` é um acréscimo nosso ao componente original.** O shader faz cem passos de
  raymarch por pixel, em tela cheia, a cada frame. O teto de 1.5 corta quase metade do
  trabalho de fragmento em celular sem diferença visível num campo desfocado.
- **A cápsula só recebe toque e foco depois do encaixe** (`inert` até 90% do progresso).
  Antes disso ela está invisível no centro da tela e engoliria o gesto de rolar.
- **O botão de voltar tem círculo de 32px e alvo de 44px.** A referência usa 28px, abaixo
  do mínimo do design system. A regra do sistema já prevê o caso: o alvo de toque excede a
  marca visual. O teste de alvos acusou isso.

## Divergências deliberadas em relação à referência

- **Nome do médico dentro da cápsula.** Em `marioo.info` o logo *é* o nome. O nosso é
  abstrato: sem o nome, o estado final não identifica ninguém.
- **Rótulos curtos.** Uma cápsula de raio total não comporta rótulos longos em uma linha, e
  alargá-la destruiria a proporção. Mesma economia de palavras da referência.
- **Campo em WebGL em vez de grade de projetos.** O vidro da referência lê como vidro por
  causa das miniaturas coloridas atrás. Um neuropediatra não tem portfólio para exibir.

## Acessibilidade

`prefers-reduced-motion` pula loader e scrub e entra direto no estado final, em página de
uma tela, com o Prism congelado. Alvos ≥ 44px, foco visível, `inert` enquanto a cápsula
está oculta.
