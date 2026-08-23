# Spec — Página link-in-bio, Dr. Charlington Cavalcante

Estado: construída e verificada em 13/08/2026. Esta spec documenta o que existe e
fixa o comportamento esperado para manutenção futura.

Documentos irmãos: [BRIEF.md](BRIEF.md) registra as decisões e
o porquê de cada uma; o README do projeto registra as armadilhas técnicas.

---

## Problem Statement

O Dr. Charlington Cavalcante, neuropediatra que atende em Campinas e Fortaleza, usa um
Linktree genérico como link da bio do Instagram. Três problemas decorrem disso:

1. **A página não tem identidade.** É o template do Linktree, idêntico ao de qualquer
   outra conta, com a marca do Linktree no rodapé. Nada nela comunica o cuidado que o
   consultório quer transmitir a pais que chegam ansiosos por um diagnóstico.
2. **Dois dos seis itens não funcionam.** Os endereços de Campinas e Fortaleza são texto
   solto: quem quer chegar ao consultório precisa selecionar, copiar e colar no mapa.
3. **A página está irregular perante a publicidade médica.** Não exibe CRM nem
   especialidade registrada, o que a Resolução CFM 2.336/2023 exige em material de
   divulgação profissional.

Além disso, os rótulos são vagos ("Site", "Agendamentos", "Endereço - Campinas, SP") e não
dizem o que acontece ao tocar.

## Solution

Uma página própria que substitui o Linktree, mantendo exatamente os mesmos destinos, com
identidade construída sobre a marca do próprio médico e uma abertura cinematográfica.

A pessoa que chega vê um loader curto, o logo se abrir em tela cheia com o nome e a
especialidade, e — ao rolar uma tela — o logo encolher e pousar numa pílula de vidro no
topo, enquanto um cartão de vidro sobe com os canais. Os consultórios deixam de ser texto
e passam a abrir o endereço completo com um botão que leva direto ao Google Maps. O CRM
aparece discretamente no topo do cartão.

A referência de estrutura e movimento é `marioo.info`; a fidelidade à coreografia dela é
requisito explícito, não enfeite.

## User Stories

### Quem chega pela bio do Instagram

1. Como mãe de um paciente, quero reconhecer de cara que a página é do Dr. Charlington, para saber que não caí num link errado.
2. Como responsável por um paciente, quero um caminho óbvio para agendar, para não precisar procurar o telefone.
3. Como pai ansioso, quero abrir a página no celular e ver tudo sem precisar dar zoom, para resolver o agendamento em pé, na fila da escola.
4. Como paciente, quero tocar em "Agendar consulta no WhatsApp" e cair na conversa já aberta, para não copiar número nenhum.
5. Como paciente de Campinas, quero tocar no consultório de Campinas e ver o endereço completo, para conferir se é o que eu conheço.
6. Como paciente de Fortaleza, quero um botão "Como chegar" que abra o Google Maps já com o destino, para não digitar o endereço.
7. Como paciente, quero ver os dois consultórios lado a lado, para escolher qual é mais perto de mim.
8. Como responsável, quero ler as avaliações no Doctoralia, para me sentir seguro antes de marcar.
9. Como visitante, quero chegar ao site oficial, para conhecer o trabalho do médico com mais profundidade.
10. Como visitante, quero encontrar o Instagram e o LinkedIn sem que eles concorram com os canais de agendamento, para poder seguir depois de resolver o que vim resolver.
11. Como visitante, quero ver o CRM do médico, para confirmar que estou tratando com um profissional registrado.
12. Como visitante, quero que a especialidade e as cidades apareçam já no herói, para saber em dez segundos se é isso que eu procuro.
13. Como visitante em conexão lenta, quero que a página abra sem tela branca, para não achar que quebrou.
14. Como visitante que volta pela segunda vez, quero encontrar tudo no mesmo lugar, para agendar mais rápido do que da primeira vez.

### Quem se importa com a experiência da abertura

15. Como visitante, quero uma abertura que sinalize cuidado e capricho, para associar isso ao consultório.
16. Como visitante, quero que o logo cresça a partir do mesmo elemento que estava no loader, para a transição parecer contínua e não um corte.
17. Como visitante, quero um convite visível para rolar, para saber que a página continua.
18. Como visitante, quero que o logo encolha acompanhando meu dedo, e não com um tempo próprio, para sentir que eu estou no controle do movimento.
19. Como visitante, quero que o logo pouse exatamente dentro da pílula, para o movimento ter um destino e não terminar no meio do nada.
20. Como visitante, quero que o cartão suba depois que o logo liberou o centro da tela, para não haver dois elementos disputando o mesmo espaço.
21. Como visitante, quero que os itens do cartão apareçam em cascata, para meu olho ser conduzido de cima para baixo.
22. Como visitante, quero que o logo continue legível quando fica pequeno, para a pílula não virar uma mancha.
23. Como visitante, quero poder rolar de volta ao herói, para rever a abertura se quiser.
24. Como visitante rolando no meio da tela, quero que o gesto funcione em qualquer ponto, para não ter zonas mortas.

### Acessibilidade

25. Como pessoa com sensibilidade a movimento, quero que a página respeite minha preferência do sistema e vá direto ao estado final, para não passar mal.
26. Como pessoa navegando por teclado, quero alcançar todos os links na ordem visual, para não me perder.
27. Como pessoa navegando por teclado, quero ver claramente onde está o foco, para saber o que vou ativar.
28. Como pessoa navegando por teclado, quero que os links do cartão não recebam foco enquanto o cartão está invisível, para não ativar às cegas algo que não estou vendo.
29. Como usuário de leitor de tela, quero que os consultórios sejam anunciados como algo que abre e fecha, para entender que há conteúdo escondido ali.
30. Como pessoa com baixa visão, quero contraste suficiente nos rótulos, para ler sem esforço.
31. Como pessoa com coordenação motora reduzida, quero alvos de toque generosos, para não errar o link.

### Quem mantém a página

32. Como quem mantém a página, quero trocar um telefone ou endereço editando um único arquivo, para não caçar strings pelos componentes.
33. Como quem mantém a página, quero adicionar ou remover um link sem mexer na animação, para uma mudança de conteúdo não virar um risco visual.
34. Como quem mantém a página, quero publicar o resultado em qualquer host sem configurar caminho base, para não depender de infraestrutura específica.
35. Como quem mantém a página, quero saber por que a coreografia está com esses números, para não "simplificar" algo que quebra o encadeamento.
36. Como quem mantém a página, quero um teste que quebre se o logo deixar de encaixar na pílula, para não descobrir isso por screenshot.
37. Como quem mantém a página, quero um teste que quebre se o cartão voltar a ficar clicável antes da hora, para o bug não reaparecer.
38. Como quem mantém a página, quero que o build falhe ou o teste acuse quando um link apontar para o lugar errado, para não publicar um WhatsApp quebrado.

### O médico

39. Como Dr. Charlington, quero que a página exiba meu CRM, para estar em conformidade com a CFM 2.336/2023.
40. Como Dr. Charlington, quero que a página apresente minha marca e não a de uma plataforma, para o link da bio ser meu.
41. Como Dr. Charlington, quero deixar de depender do Linktree, para não ter a página de outra pessoa promovida no rodapé da minha.
42. Como Dr. Charlington, quero que compartilhar o link no WhatsApp mostre uma prévia com meu nome, para o link parecer confiável.

## Implementation Decisions

### Identidade e paleta

- A página **não** segue o design system existente do médico (fundo claro `#F1F1EF`, azul
  cobalto). Rompe deliberadamente: base quase-preta e paleta derivada dos gradientes do
  próprio logo vetorial. A base escura reaproveita o token de superfície escura que já
  existia no sistema, então a ruptura é de ênfase, não de vocabulário.
- Tipografia é uma grotesk larga em caixa-alta com tracking aberto, não a família do
  design system. É metade do que faz a referência parecer cara.

### Conteúdo

- Apenas os destinos que já existiam no Linktree. Nada de bio, depoimentos ou FAQ — isso é
  papel do site oficial.
- O LinkedIn sai da lista principal e vira ícone de rodapé, ao lado do Instagram. A lista
  fica com cinco linhas, o que respira melhor no retrato.
- Os dois endereços deixam de ser texto e viram itens expansíveis com botão para o mapa.
- Todo texto e URL vive num único módulo de conteúdo. Nenhuma string fica nos componentes.
- Toda linha da lista tem ícone. Sem isso, as linhas sem ícone recuam para a margem e a
  coluna de texto fica serrilhada.

### Estrutura da página

- Um trilho de rolagem de duas telas. Todo o resto é posicionado de forma fixa sobre ele.
- **Não há pin de scroll.** Pin briga com a barra de endereço retrátil do Safari iOS; um
  trilho fixo com unidades de viewport pequenas evita o problema inteiro.
- Rolagem suave por biblioteca dedicada, integrada ao motor de animação pelo ticker
  compartilhado — não por proxy de scroller.

### Coreografia

Quatro fases. A terceira é dirigida por rolagem, com inércia.

| Fase | Gatilho | O que acontece |
|---|---|---|
| Loader | carga | Logo em escala mínima, régua de progresso preenchendo, halo pulsando. Piso fixo de 2,5s em toda visita, aguardando também fontes e o SVG. |
| Expansão | fim do loader | O **mesmo** elemento cresce até o herói (~950ms). Nome, especialidade e convite de rolagem entram atrasados. Rolagem destravada só ao fim. |
| Scrub | rolagem, 1 tela | Ver tabela abaixo. |
| Repouso | progresso = 1 | Pílula fixa no topo com a marca; cartão de vidro centralizado. |

Posições na timeline do scrub, normalizadas — **o último elemento termina exatamente em
1.0 por construção** (ver Further Notes):

| Elemento | Início | Fim | Curva |
|---|---|---|---|
| Logo (escala + translação até a pílula) | 0 | 1.0 | `power2.inOut` |
| Assinatura (nome/especialidade) some | 0 | 0.35 | `power2.in` |
| Convite de rolagem some | 0 | 0.15 | — |
| Halo recolhe até ficar atrás do cartão | 0 | 0.85 | `power2.out` |
| Pílula materializa | 0.55 | 0.85 | `power2.out` |
| Cartão sobe | 0.62 | 0.90 | `power3.out` |
| Linhas do cartão em cascata (7 itens, stagger 0.03) | 0.68 | 1.0 | `power2.out` |
| Troca de marca do logo | 0.72 | 0.92 | — |

- A curva do logo é `inOut`, não `in`. Com `in`, o logo fica grande e centralizado tempo
  demais e passa por cima do próprio título quando o cartão sobe.
- **Dois logos empilhados no mesmo elemento animado.** O de gradiente domina o herói; ao
  encolher, o gradiente afunda no vidro escuro, então uma silhueta clara em máscara
  vetorial assume. Mesma forma, contraste suficiente.
- **O halo não zera** — fica atrás do cartão. Sem nada para refratar, desfoque de fundo
  sobre preto puro vira cinza chapado, não vidro.
- As medidas do encaixe são recalculadas por função a cada refresh, a partir de caixas de
  layout (nunca de retângulos transformados), então redimensionar a janela reposiciona o
  destino sem reiniciar a animação.

### Empilhamento

Pílula abaixo, cartão no meio, logo e assinatura acima. O logo precisa pousar *sobre* a
pílula: invertido, o desfoque de fundo dela é pintado por cima da marca e escurece
justamente o que precisa de contraste.

### Interatividade do cartão

- O cartão existe no DOM desde o início, para poder ser animado, mas fica inerte até 90%
  do progresso. Antes disso ele está invisível no centro da tela e engoliria o gesto de
  rolar, além de deixar os links clicáveis às cegas.
- A supressão da rolagem suave dentro do cartão só entra quando ele **de fato** transborda.
  Fixa, ela prenderia a pessoa no fim da página sem como voltar ao herói.
- Os consultórios expandem por transição de linhas de grade, não por altura medida em JS —
  degrada sozinho sob preferência de movimento reduzido.

### Conformidade e metadados

- CRM exibido no topo do cartão, em texto pequeno e apagado, junto da especialidade.
- Tags Open Graph e ícone presentes; as URLs absolutas ficam pendentes até o domínio ser
  definido.
- Build com caminho base relativo: o resultado funciona em raiz ou subpasta, em qualquer
  host estático.

### Movimento reduzido

Sob preferência de movimento reduzido, o loader e o scrub são pulados por inteiro: a
página entra no estado final, com altura de uma tela e sem trilho de rolagem.

## Testing Decisions

**Uma única costura, no ponto mais alto: navegador real contra o build de produção.**
Nada de teste de componente ou de unidade. O valor inteiro desta página é geometria e
tempo de animação, e nenhum dos dois existe fora de um navegador com layout resolvido.
Um teste que montasse os componentes isoladamente passaria com a animação completamente
quebrada — seria uma rede de segurança falsa.

Um bom teste aqui afirma **o que a pessoa vê e consegue fazer**, nunca como está
implementado. Concretamente: afirmar que o centro do logo coincide com o centro da pílula
ao fim da rolagem é comportamento externo; afirmar que uma certa timeline tem uma certa
posição é detalhe de implementação e não deve ser testado.

Prior art: não existe. Esta é a primeira costura de teste do projeto. A base é o roteiro
de verificação já usado na construção — capturas cronometradas e leitura de caixas
delimitadoras num navegador headless em dois viewports —, que passa de script descartável
a suíte versionada.

### O que a suíte cobre

1. **Encaixe do logo.** Ao fim da rolagem, o centro do logo coincide com o centro da
   pílula, dentro de tolerância de um pixel, e a marca está na largura de repouso.
2. **Ordem da coreografia.** Em progressos intermediários amostrados, o logo já liberou a
   faixa vertical do cartão antes de o cartão ficar visível. Este é o teste de regressão
   do bug de compressão da timeline.
3. **Portão de interatividade.** No herói, um clique no centro da tela não navega para
   lugar nenhum e nenhum link do cartão é alcançável por teclado. Depois da transição,
   ambos funcionam.
4. **Destinos.** Os cinco destinos e os dois ícones sociais apontam para as URLs
   esperadas, e os links de mapa carregam o endereço certo na consulta.
5. **Consultórios.** Abrir um consultório revela as linhas do endereço e o botão de mapa;
   fechar esconde de novo, e o estado é anunciado corretamente.
6. **Movimento reduzido.** Com a preferência ligada, o estado final está presente sem
   rolagem alguma e a página tem altura de uma tela.
7. **Alvos de toque.** Todo elemento clicável tem pelo menos 44px de altura.
8. **Saúde do build.** Nenhum erro de console em nenhum dos estados.

A suíte roda contra o build de produção, não contra o servidor de desenvolvimento — é o
artefato que vai ao ar que precisa estar correto.

### Tolerâncias

Asserções de geometria usam tolerância explícita em pixels; asserções de fase amostram
progressos discretos após aguardar a inércia da rolagem assentar. Nenhuma asserção depende
de tempo de parede além dessa espera, para a suíte não ficar instável em máquina lenta.

## Out of Scope

- **Substituir o site oficial.** A página é link-in-bio; o site continua sendo o destino
  de conteúdo aprofundado e é um dos cinco links.
- **Conteúdo editorial**: bio, especialidades, depoimentos, FAQ, artigos.
- **Foto do médico.** Decidido não usar: o herói é logo e tipografia.
- **Agendamento dentro da página.** O agendamento acontece no WhatsApp e no Doctoralia.
- **Analytics, pixel de rastreio ou consentimento de cookies.** Não há coleta.
- **Internacionalização.** Página é somente pt-BR.
- **CMS ou painel de edição.** Manutenção é editar o módulo de conteúdo e rodar o build.
- **Otimizar o tempo do loader.** O piso de 2,5s em toda visita é decisão consciente do
  cliente, com o custo de conversão registrado no brief.
- **Reduzir o peso do bundle.** Aceito em troca de fidelidade à referência.
- **Escolher e configurar o domínio.** Pendente, fora desta entrega.

## Further Notes

### A armadilha que mais vai voltar

A rolagem é mapeada sobre a **duração total** da timeline, não sobre 1.0. Se o stagger das
linhas empurrar o fim para 1.3, tudo que vem antes dispara ~30% mais cedo do que a posição
escrita sugere — e as posições passam a mentir. Foi exatamente esse o bug que fez o logo
passar por cima do título. Ao mexer em stagger, duração ou número de linhas, reajuste para
que o último elemento continue terminando em 1.0. O teste de ordem da coreografia existe
para acusar isso.

### Por que o SVG mudou o projeto

O brief foi fechado assumindo um PNG rasterizado sobre fundo branco, o que impunha teto de
nitidez no herói e tornava impossível a troca de marca. O vetor chegou depois e removeu os
dois riscos: o herói ficou nítido em qualquer tela e a máscara vetorial viabilizou a
silhueta clara na pílula. Qualquer retrabalho futuro deve partir do vetor.

### Pendências herdadas

- **RQE** não foi informado; só o CRM. A CFM 2.336/2023 pede o RQE quando há especialidade
  registrada, e neuropediatria tem. É uma linha no módulo de conteúdo.
- **Imagem de Open Graph** e URLs absolutas dependem do domínio, ainda indefinido. Sem
  isso, o link compartilhado no WhatsApp aparece sem prévia — o que corrói justamente a
  confiança que a página existe para construir.

### Sobre esta spec

O projeto não é um repositório git e não há issue tracker configurado, então esta spec fica
como arquivo em vez de issue com rótulo de triagem. Se um tracker for adotado, ela pode ser
colada como está.
