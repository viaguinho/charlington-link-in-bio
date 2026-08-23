# 07 — Suíte Playwright

**What to build:** A primeira costura de teste do projeto, no ponto mais alto: navegador
real contra o build de produção. Nada de teste de componente — montar os componentes
isoladamente passaria com a animação inteiramente quebrada, e a animação é o projeto.

Um bom teste aqui afirma o que a pessoa vê e consegue fazer. Que o centro do logo coincida
com o centro do slot é comportamento externo; que uma timeline tenha certa posição é
detalhe de implementação e não deve ser testado.

Isto formaliza o roteiro de verificação já usado à mão durante a construção, adaptado à
cápsula única.

**Blocked by:** 02 — Herói mostra especialidade e CRM; 05 — Conteúdo da cápsula;
06 — Tipografia da referência

**Status:** ready-for-agent

- [ ] A suíte roda contra o build de produção, não contra o servidor de desenvolvimento
- [ ] **Encaixe:** ao fim da rolagem o centro do logo coincide com o centro do slot, com tolerância explícita em pixels
- [ ] **Ordem da coreografia:** em progressos intermediários, o logo já liberou a faixa vertical da cápsula antes de ela ficar visível — regressão do bug de compressão da timeline
- [ ] **Portão de interatividade:** no herói nenhum link da cápsula é clicável nem alcançável por teclado; depois da transição, ambos funcionam
- [ ] **Destinos:** os cinco rótulos e os dois ícones sociais apontam para as URLs esperadas, e os links de mapa carregam o endereço certo
- [ ] **Botão de voltar:** devolve ao herói
- [ ] **Movimento reduzido:** o estado final está presente sem rolagem e a página tem altura de uma tela
- [ ] **Alvos de toque:** todo clicável tem ao menos 44px de altura
- [ ] **Saúde:** nenhum erro de console em nenhum estado
- [ ] Rodável por um comando único documentado no README
