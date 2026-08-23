# Contexto do projeto

Página link-in-bio do Dr. Charlington Cavalcante, neuropediatra que atende em Campinas e
Fortaleza. Substitui um Linktree na bio do Instagram. Tráfego é ~95% celular, e a intenção
número um de quem chega é agendar consulta.

Estrutura e movimento são uma recriação deliberada de `marioo.info`. **Fidelidade à
referência é requisito do cliente**, não preferência estética: quando fidelidade conflita
com otimização (conversão, peso, simplicidade), a fidelidade ganha. Isso já foi decidido
e não deve ser reaberto.

Stack: Vite + React + Tailwind v4 + GSAP (ScrollTrigger) + Lenis + `ogl`. JavaScript puro,
sem TypeScript.

---

## Antes de mudar qualquer coisa, leia isto

### 1. O rompimento com o design system é intencional

`docs/DESIGN.md`, `docs/DESIGN-SYSTEM.md` e `docs/tokens.css` descrevem o sistema do site
oficial do médico: fundo claro `#F1F1EF`, azul cobalto `#2F66E0`, registro clínico e
sereno. **Esta página não segue esse sistema, de propósito.** Ela é quase preta, com
paleta derivada dos gradientes do logo.

Não "corrija" essa inconsistência. Alinhar a página ao `DESIGN.md` desfaz o projeto.

Os documentos estão aqui porque as regras de voz, acessibilidade e espaçamento continuam
valendo — em particular o alvo de toque mínimo de 44px, que já pegou um defeito real.

### 2. A timeline do scrub termina em 1.0 por construção

Em `src/App.jsx`, o `scrub` do ScrollTrigger mapeia a rolagem sobre a **duração total** da
timeline. Se o stagger das linhas empurrar o fim para 1.3, tudo antes dele passa a
disparar 30% mais cedo do que a marcação escrita sugere, e as posições no código passam a
mentir.

Ao mexer em stagger, duração ou número de elementos `[data-row]`, reajuste para o último
elemento terminar exatamente em 1.0. Já quebrou duas vezes por causa disso.

### 3. Ordem de empilhamento

Prism em `z-0`, cápsula em `z-20`, logo e assinatura em `z-30`. O logo precisa ser pintado
**sobre** a cápsula. Invertido, o `backdrop-filter` da cápsula é aplicado por cima da
marca e a escurece exatamente onde ela precisa de contraste.

### 4. O `hueShift` do Prism é zero de propósito

A saída crua do shader já é um azul-aço da mesma família do logo. Rotacionar a matiz leva
para verde (2.2) ou para cinza quase morto (5.6) — a rotação desse shader não é linear.
Isso foi medido por varredura de oito valores, não estimado. Não "melhore" chutando.

### 5. O véu radial sobre o Prism não é decoração

Sem ele, a crista clara do shader passa por cima do nome e apaga os ícones da base da
cápsula. É o que mantém o texto legível.

---

## Como verificar mudanças

```bash
npm test
```

Playwright contra o **build de produção**, em mobile e desktop. Dezoito testes.

Não existe teste de componente, de propósito: montar os componentes isoladamente passa com
a animação inteiramente quebrada, e a animação é o projeto inteiro. Toda asserção é sobre
o que a pessoa vê e consegue fazer.

Se for mexer na coreografia, rode a suíte nos **dois** viewports. O bug mais recente só
aparecia no desktop, onde o logo do herói tem 531px contra uma cápsula de 236px.

---

## Onde mexer

| Quero mudar | Vá em |
|---|---|
| Texto, link, telefone, endereço | `src/content.js` — é o único arquivo de manutenção comum |
| A coreografia (loader, expansão, scrub) | `src/App.jsx` |
| A cápsula de vidro e seu conteúdo | `src/Capsule.jsx` |
| O campo animado de fundo | `src/Prism.jsx` |
| Paleta, fonte, largura do herói | `src/index.css` |

Nenhuma string de conteúdo deve ser escrita direto num componente.

---

## Divergências deliberadas em relação à referência

- **Nome do médico dentro da cápsula.** Em `marioo.info` o logo *é* o nome. O nosso é
  abstrato — sem o nome, o estado final não identifica ninguém.
- **Rótulos curtos** (`Agendar`, `Campinas`, `Fortaleza`, `Doctoralia`, `Site`). Uma
  cápsula de raio total não comporta rótulos longos em uma linha, e alargá-la destruiria a
  proporção que faz a forma funcionar.
- **Campo em WebGL em vez de grade de projetos.** O vidro da referência lê como vidro por
  causa das miniaturas coloridas atrás dele. Um neuropediatra não tem portfólio.
- **Botão de voltar com alvo de 44px** e círculo desenhado de 32px. A referência usa 28px,
  abaixo do mínimo de acessibilidade.

---

## Pendências conhecidas

- **RQE não foi informado.** A página exibe apenas `CRM-SP 173176`. A Resolução CFM
  2.336/2023 pede também o RQE quando há especialidade registrada, e neuropediatria tem.
  Quando o número chegar, é uma linha em `src/content.js`.
- **Domínio indefinido.** As URLs absolutas de Open Graph em `index.html` são
  provisórias e falta gerar `public/og.png` (1200×630). Sem isso, o link compartilhado no
  WhatsApp aparece sem prévia.
- **Sem controle de versão.** Ver aviso no `README.md`.
