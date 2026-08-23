# 05 — Conteúdo da cápsula

**What to build:** Dentro da cápsula, na ordem da referência, de cima para baixo:

1. O logo (pousa aqui, vindo do herói)
2. O nome do médico
3. Especialidade e CRM, em duas linhas
4. Os cinco destinos, como linhas de texto centralizadas
5. Instagram e LinkedIn, como ícones discretos
6. Um botão circular com seta para cima, que devolve a pessoa ao herói

Os rótulos ficam curtos, na mesma economia de palavras da referência (`All Works`,
`About`, `Contact`). Isto **substitui** a copy de ação aprovada na primeira rodada: uma
cápsula esbelta não comporta "Agendar consulta no WhatsApp" em uma linha, e alargá-la para
caber destruiria a proporção que faz a forma funcionar.

| Rótulo | Destino |
|---|---|
| Agendar | WhatsApp |
| Campinas | Google Maps, consultório de Campinas |
| Fortaleza | Google Maps, consultório de Fortaleza |
| Doctoralia | perfil no Doctoralia |
| Site | site oficial |

Sem ícone por linha, sem seta, sem divisória, sem acordeão — apenas texto centralizado,
como na referência. **O acordeão de endereço deixa de existir**; tocar na cidade abre o
mapa direto.

O nome do médico dentro da cápsula é um desvio consciente da referência: lá o logo *é* o
nome (um M dentro de uma elipse), aqui o logo é abstrato. Sem o nome, o estado final da
página não identifica ninguém, já que o nome do herói desaparece na rolagem.

**Blocked by:** 04 — Cápsula única substitui pílula e cartão

**Status:** ready-for-agent

- [ ] Os seis blocos aparecem na ordem acima
- [ ] Os cinco rótulos curtos apontam para os destinos da tabela
- [ ] Nenhum rótulo quebra em duas linhas na menor largura suportada
- [ ] O acordeão de endereço não existe mais
- [ ] O botão circular devolve ao herói com rolagem suave
- [ ] Todo alvo clicável tem ao menos 44px de altura efetiva
- [ ] O conteúdo continua saindo do módulo de conteúdo, não escrito nos componentes
- [ ] A cápsula segue inerte a toque e foco até o encaixe terminar
- [ ] O conteúdo cabe na viewport sem rolagem interna no menor aparelho suportado
