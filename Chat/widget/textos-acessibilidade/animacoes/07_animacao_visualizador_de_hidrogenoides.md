# 07 — Animação: Visualizador de Hidrogenoides

## Objetivo do texto acessível

Este texto descreve a visualização de orbitais hidrogenoides para pessoas que utilizam leitor de tela, navegação por teclado, baixa visão, daltonismo ou que precisam de uma explicação textual complementar ao canvas. A descrição não depende apenas de cor: sempre que uma cor aparece, ela é acompanhada de posição, forma, eixo ou função visual.

A animação apresenta orbitais de átomos hidrogenoides, isto é, sistemas com um único elétron descritos por funções de onda semelhantes às do átomo de hidrogênio. O usuário pode alterar o nível principal n, escolher o orbital e observar quatro representações ao mesmo tempo: uma nuvem tridimensional de pontos, um mapa da função de onda em corte plano, um mapa da densidade eletrônica e um gráfico radial.

## Organização geral da página

A tela é dividida em um painel lateral de controles e uma área principal com quatro canvas.

No painel lateral, o usuário escolhe o nível principal, escolhe o orbital, avança ou volta entre os orbitais, ajusta zoom, tamanho dos pontos e qualidade da visualização. Também pode escolher o modo de cor da cena tridimensional entre sinal da função, camadas e densidade. Há ainda uma opção para mostrar ou ocultar eixos cartesianos.

Na área principal, o primeiro canvas mostra a nuvem 3D do orbital. Abaixo dele, três painéis menores mostram, respectivamente, a função de onda 2D, a densidade 2D e a curva radial.

## Cores e convenções visuais

Na cena 3D, quando o modo de cor é “Sinal da função”, regiões de fase positiva aparecem em azul claro e regiões de fase negativa aparecem em rosa ou vermelho. Para acessibilidade, essas cores devem ser lidas como duas fases opostas da função de onda, não como materiais diferentes.

No modo “Densidade”, pontos de baixa densidade aparecem em azul muito escuro, enquanto pontos de maior densidade avançam para azul claro e ciano luminoso. A leitura principal é: quanto mais claro e brilhante, maior a densidade eletrônica representada naquela região.

No modo “Camadas”, o orbital é separado em faixas ou cascas radiais. As camadas usam uma sequência de tons frios, indo de azul para variações azul-violeta. Para pessoas com daltonismo ou baixa visão, a descrição deve enfatizar a ordem das camadas: camada interna, camada intermediária e camada externa.

Os eixos cartesianos da cena 3D usam cores diferentes: X aparece em vermelho-rosado, Y aparece em verde claro e Z aparece em azul. A cor ajuda na orientação, mas a posição e o nome do eixo devem ser informados textualmente.

Nos mapas 2D, a função de onda é representada por regiões de cores opostas, indicando mudança de sinal. A densidade 2D não mostra sinal; ela mostra probabilidade. Regiões mais intensas indicam maior chance de localização do elétron naquele corte.

No gráfico radial, a curva R(r) aparece em azul claro e a distribuição radial de probabilidade aparece em amarelo. A linha azul representa a função radial, que pode assumir valores positivos e negativos. A linha amarela representa probabilidade radial, portanto não é negativa.

## Descrição dos quatro canvas

### Canvas 1 — Orbital 3D

O canvas 3D mostra uma nuvem de pontos distribuídos no espaço. Cada ponto representa uma região onde o orbital tem valor relevante dentro do limite usado pela visualização. O fundo é escuro, o que aumenta o contraste das cores. Quando os eixos estão ligados, três linhas atravessam a cena: eixo X na horizontal ou em perspectiva, eixo Y vertical ou inclinado conforme a rotação, e eixo Z em profundidade.

O usuário pode interpretar a nuvem 3D como uma forma volumétrica aproximada do orbital. Orbitais s aparecem como distribuições esféricas. Orbitais p aparecem como dois lobos opostos. Orbitais d aparecem como quatro lobos ou como dois lobos com anel central, dependendo do tipo.

### Canvas 2 — Função de onda 2D

O mapa da função de onda 2D mostra um corte plano do orbital. O plano normalmente é XZ, mas em alguns orbitais o plano XZ coincidiria com uma região nodal e ficaria pouco informativo. Nesses casos, a própria visualização recalcula o corte em outro plano, como XY ou YZ.

Este mapa deve ser descrito como uma imagem de sinal: uma região representa fase positiva e outra representa fase negativa. Onde as duas regiões se separam, há um nó, isto é, uma região em que a função de onda passa por zero.

### Canvas 3 — Densidade 2D

O mapa de densidade 2D usa o mesmo tipo de corte, mas mostra |ψ|², ou seja, a probabilidade associada à função de onda. Como é uma densidade, os valores não são negativos. As regiões mais claras e luminosas indicam maior densidade eletrônica. As regiões escuras indicam baixa densidade ou regiões nodais.

Para acessibilidade, a descrição deve evitar frases como “a cor mostra tudo”. A explicação adequada é: a posição das manchas claras mostra onde o elétron tem maior probabilidade de ser encontrado naquele plano.

### Canvas 4 — Gráfico radial

O gráfico radial coloca a distância ao núcleo no eixo horizontal, medida em unidades de raio de Bohr, a₀. Ele mostra duas curvas: R(r), em azul, e a probabilidade radial, em amarelo. A curva azul pode cruzar o eixo e mudar de sinal. Esses cruzamentos indicam nós radiais. A curva amarela mostra onde a probabilidade radial é maior; seus picos representam camadas de maior ocorrência provável do elétron.

## Leitura geral por nível principal n

### n = 1

No nível n = 1, há apenas o orbital 1s. A visualização é compacta, centralizada no núcleo e sem nós radiais. A densidade é mais concentrada perto da região central. O gráfico radial mostra uma única região principal de probabilidade, com um pico associado à camada mais provável.

### n = 2

No nível n = 2, aparecem o orbital 2s e os três orbitais 2p. O 2s continua esférico, mas passa a ter uma separação radial: há uma casca interna e uma casca externa, divididas por um nó radial. Os orbitais 2p têm dois lobos opostos separados por um plano nodal que passa pelo núcleo.

### n = 3

No nível n = 3, aparecem orbitais 3s, 3p e 3d. O 3s tem mais camadas radiais que o 2s, com duas separações nodais. Os orbitais 3p mantêm a forma de dois lobos, mas são mais extensos e mais difusos. Os orbitais 3d introduzem formas com quatro lobos ou com anel central, dependendo da orientação.

### n = 4

No nível n = 4, os orbitais ficam ainda mais extensos no espaço. O 4s mostra várias camadas radiais, com três nós radiais destacados na representação. Os orbitais 4p e 4d têm lobos semelhantes aos níveis anteriores, porém mais afastados do centro e mais difusos. A leitura acessível deve enfatizar que o aumento de n aumenta o tamanho espacial médio do orbital.

### n = 5

No nível n = 5, a visualização ocupa uma extensão maior. O 5s apresenta quatro nós radiais e várias camadas concêntricas. Os orbitais 5p e 5d preservam a geometria básica de suas famílias, mas se tornam mais espalhados. Para baixa visão, recomenda-se usar zoom e tamanho de ponto maiores, pois algumas regiões podem parecer rarefeitas.

## Descrição por família de orbital

### Orbitais s: 1s, 2s, 3s, 4s e 5s

Os orbitais s são aproximadamente esféricos. A nuvem envolve o centro de maneira simétrica em todas as direções. Não há preferência por eixo X, Y ou Z. Em modo de densidade, a região mais provável aparece como uma concentração ao redor do núcleo e, nos níveis maiores, como camadas esféricas sucessivas.

O 1s é uma esfera simples, compacta e sem nó radial. O 2s apresenta duas regiões esféricas separadas por um nó radial. O 3s mostra três faixas principais de probabilidade, separadas por dois nós radiais. O 4s mostra quatro camadas principais, separadas por três nós radiais. O 5s mostra cinco camadas principais, separadas por quatro nós radiais.

Para leitura inclusiva, a melhor descrição é: “uma nuvem esférica centrada no núcleo; nos níveis maiores, a esfera é dividida em cascas, como camadas concêntricas, separadas por zonas de baixa ou nenhuma probabilidade”.

### Orbitais p: px, py e pz

Os orbitais p têm dois lobos opostos, separados por um plano nodal que passa pelo núcleo. A forma geral lembra duas gotas, dois balões ou dois volumes alongados apontando em direções contrárias.

O orbital px tem os dois lobos alinhados ao eixo X. Um lobo fica do lado negativo de X e o outro fica do lado positivo de X. A mudança de cor ou fase entre os lobos indica que eles têm sinais opostos da função de onda.

O orbital py tem os dois lobos alinhados ao eixo Y. Um lobo fica na direção negativa de Y e o outro na direção positiva de Y. O plano nodal corta o centro e separa as duas metades.

O orbital pz tem os dois lobos alinhados ao eixo Z. Um lobo fica para a frente ou para trás, dependendo da rotação da câmera, e o outro fica no sentido oposto do eixo Z. A rotação da cena ajuda a perceber a profundidade.

Para acessibilidade, cada orbital p deve ser descrito pela orientação do eixo, não apenas pela cor. A frase recomendada é: “dois lobos opostos no eixo indicado; entre eles existe um plano nodal que passa pelo núcleo”.

### Orbitais dxy, dyz e dxz

Esses orbitais d têm quatro lobos. Os lobos ficam entre os eixos do plano indicado no nome do orbital.

O dxy está distribuído no plano XY. Seus quatro lobos ficam entre os eixos X e Y, ocupando os quadrantes diagonais do plano. Há planos nodais associados aos próprios eixos X e Y.

O dyz está distribuído no plano YZ. Seus quatro lobos aparecem entre os eixos Y e Z, formando uma cruz diagonal nesse plano. O eixo X fica perpendicular ao plano principal da forma.

O dxz está distribuído no plano XZ. Seus quatro lobos ficam entre os eixos X e Z. Ao girar a visualização, a pessoa percebe que a forma se organiza em profundidade, não apenas na tela plana.

A descrição inclusiva deve indicar que os lobos não ficam “em cima” dos eixos, mas entre eles. Isso ajuda estudantes que não veem a imagem a diferenciar dxy, dyz e dxz do dx²−y².

### Orbital dx²−y²

O orbital dx²−y² tem quatro lobos no plano XY, mas, diferente do dxy, os lobos ficam alinhados diretamente aos eixos X e Y. Dois lobos apontam ao longo do eixo X e dois apontam ao longo do eixo Y.

A forma pode ser descrita como uma cruz de quatro pétalas no plano XY. As regiões nodais ficam nas diagonais entre os eixos, em planos equivalentes às direções x = y e x = −y.

Para não depender de cor, a descrição principal deve ser: “quatro lobos coplanares, dois no eixo X e dois no eixo Y; as regiões vazias ficam nas diagonais”.

### Orbital dz²

O orbital dz² tem uma forma diferente dos outros orbitais d. Ele possui dois lobos alongados no eixo Z, um em cada sentido do eixo, e um anel ou toro ao redor da região central, no plano perpendicular ao eixo Z.

A imagem pode ser descrita como “dois balões alinhados verticalmente ou em profundidade, com uma argola ao redor do centro”. O anel representa uma região de densidade associada ao orbital, não uma ligação química separada.

Para acessibilidade, é importante dizer que o anel não é um objeto solto: ele faz parte da mesma função orbital. A cor do anel pode indicar fase ou parte da superfície, mas a leitura conceitual deve focar na combinação de dois lobos axiais e uma faixa equatorial.

## Descrição dos estados de colorização

### Sinal da função

Este modo ajuda a diferenciar fases da função de onda. Fases opostas aparecem em cores diferentes. Ele é especialmente útil em orbitais p e d, pois os lobos alternam sinal. Para leitores de tela, a descrição deve dizer “fase positiva” e “fase negativa”, pois cor isolada não é suficiente.

### Camadas

Este modo organiza a nuvem em camadas radiais. Ele é útil para orbitais s de níveis maiores, pois evidencia cascas internas e externas. Para uma pessoa com baixa visão, as camadas devem ser descritas como “de dentro para fora”, e não apenas por matiz.

### Densidade

Este modo destaca onde a densidade é maior. Regiões mais claras e brilhantes correspondem a maior densidade eletrônica. Regiões escuras, rarefeitas ou vazias indicam baixa densidade ou nós.

## Texto curto sugerido para botão “Explicar visualização”

Esta visualização mostra orbitais hidrogenoides em quatro formas complementares. O painel 3D apresenta uma nuvem de pontos ao redor do núcleo, com cores que podem indicar fase da função, camadas radiais ou densidade eletrônica. Os mapas 2D mostram cortes planos da função de onda e da densidade de probabilidade. O gráfico radial mostra como a função e a probabilidade variam conforme a distância ao núcleo, em unidades de raio de Bohr. Orbitais s são esféricos; orbitais p têm dois lobos opostos; orbitais d têm quatro lobos ou dois lobos com anel central. As cores ajudam, mas a interpretação principal deve considerar forma, eixo, posição dos lobos, nós e camadas.

## Observações inclusivas para implementação

Evitar usar apenas “azul”, “vermelho” ou “brilhante” como informação essencial. Sempre combinar cor com posição e significado: fase positiva, fase negativa, maior densidade, camada interna, camada externa, lobo no eixo X, lobo no eixo Y ou lobo no eixo Z.

Quando a pessoa alterar o nível n ou o orbital, o texto acessível deve atualizar o nome do orbital, o tipo de forma, o número de lobos, a orientação, a presença de nós e o tipo de corte 2D ativo.

Quando houver fallback de plano, como em p_y, d_xy ou d_yz, o texto deve avisar que o corte foi alterado para evitar um plano nodal vazio. Isso evita que a pessoa pense que a visualização falhou.
