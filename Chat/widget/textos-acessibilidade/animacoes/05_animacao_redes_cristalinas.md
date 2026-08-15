# Texto acessível — Animação 05 — Redes Cristalinas

Categoria: Animação. Pasta analisada: Ensino/Animacao/redes-cristalinas. Página principal: index.html. Elemento visual principal: canvas com id canvas.

Objetivo do texto: explicar de forma acessível e inclusiva todas as estruturas disponíveis na animação de redes cristalinas. O texto descreve o tipo de célula, a organização espacial das esferas, as cores usadas no canvas, as posições fracionárias principais e o significado didático da visualização. A descrição deve apoiar pessoas cegas, pessoas com baixa visão, estudantes com daltonismo, pessoas neurodivergentes e qualquer pessoa que precise compreender a estrutura sem depender apenas da imagem.

## Descrição geral da visualização

A página apresenta um visualizador 3D de redes cristalinas. As esferas representam átomos, íons ou posições de rede. As linhas e arestas desenham a célula unitária ou a malha cristalina repetida no espaço. A pessoa usuária pode selecionar diferentes estruturas, alterar o número de células exibidas, mudar o raio das esferas, controlar o espaçamento, ligar ou desligar arestas, visualizar uma única célula, recortar a estrutura por face e adicionar ou remover átomos manualmente no modo de construção.

A leitura acessível deve começar sempre pelo tipo de célula e pela ideia espacial principal: se é cúbica, tetragonal, ortorrômbica, monoclínica, triclínica, romboédrica, hexagonal ou uma estrutura iônica. Depois, deve explicar onde ficam as esferas: vértices, centro do corpo, centro das faces, centro das arestas, posições tetraédricas, posições octaédricas ou camadas empilhadas.

## Texto curto para aria-label da visualização

Visualização 3D interativa de redes cristalinas. Mostra células unitárias, esferas em posições de rede, cores por espécie química, arestas da célula e estruturas como cúbica simples, corpo centrado, face centrada, NaCl, CsCl, ZnS, rutilo e empilhamentos hexagonais.

## Convenções de cor e leitura inclusiva

No padrão da página, a esfera do tipo M aparece em cinza azulado. A espécie A aparece em vermelho rosado. A espécie C aparece em azul claro. A espécie B aparece em cinza claro. A espécie T, usada no rutilo, aparece em cinza muito claro. O oxigênio do rutilo aparece em vermelho. A espécie V, quando usada, aparece em amarelo. No modo de adicionar átomos, o tipo A é vermelho e maior, o tipo B é cinza e médio, e o tipo C é verde e menor.

As cores devem ser sempre acompanhadas por nome e posição. Em vez de dizer apenas “a esfera vermelha”, a descrição deve dizer “a espécie A, em vermelho rosado, ocupa os vértices e centros de faces”. Essa regra é importante para estudantes com daltonismo e para leitores de tela.

Os eixos de orientação seguem o padrão: eixo X em vermelho, eixo Y em verde e eixo Z em azul. As camadas do empilhamento usam a convenção A em vermelho rosado, B em cinza claro e C em azul.

## Como ler posições fracionárias

As posições são descritas como coordenadas fracionárias dentro da célula unitária. O ponto [0, 0, 0] representa um vértice de origem da célula. O ponto [0.5, 0.5, 0.5] representa o centro do corpo da célula. Uma posição com uma coordenada 0 e duas coordenadas 0.5 indica centro de face. Uma posição com uma coordenada 0.5 e duas coordenadas 0 indica centro de aresta. Posições como [0.25, 0.25, 0.25] indicam regiões internas associadas a interstícios tetraédricos.

## Descrições por estrutura

### Simples Cúbica (SC)

Tipo de célula: célula cúbica primitiva, também chamada de cúbica simples.

Cores e posições das esferas: as esferas são do tipo M, em cinza azulado. Elas ocupam os vértices da célula cúbica. Na definição da estrutura, a posição de referência é [0, 0, 0], que se repete por translação para formar todos os cantos da rede.

Descrição acessível do canvas: a estrutura aparece como uma grade de cubos alinhados. As esferas ficam nos cantos das células, formando uma malha regular. Não há esfera no centro do corpo nem no centro das faces. Ao girar a visualização, a pessoa usuária deve perceber uma organização ortogonal: linhas retas se cruzam em ângulos de 90° e os pontos de rede aparecem igualmente espaçados nos três eixos.

Leitura didática: esta estrutura mostra a forma mais simples de uma rede cúbica. Cada vértice é compartilhado por oito células vizinhas; por isso, a contribuição total por célula unitária é equivalente a um átomo quando se considera apenas uma espécie nos vértices.

### Corpo Centrado (BCC)

Tipo de célula: célula cúbica de corpo centrado, também chamada de cúbica I.

Cores e posições das esferas: as esferas são do tipo M, em cinza azulado. Há esferas nos vértices da célula, representadas pela posição [0, 0, 0] repetida por translação, e uma esfera no centro do corpo em [0.5, 0.5, 0.5].

Descrição acessível do canvas: a estrutura aparece como um cubo com esferas nos cantos e uma esfera adicional no meio exato da célula. Essa esfera central fica suspensa no interior do cubo, equidistante das faces. Quando várias células são exibidas, as esferas centrais formam uma rede intercalada entre os vértices.

Leitura didática: a esfera central pertence integralmente à célula unitária, enquanto as esferas dos vértices são compartilhadas. A descrição deve destacar que “corpo centrado” não significa uma nova cor, e sim uma posição espacial: o ponto central do volume cúbico.

### Face Centrada (FCC)

Tipo de célula: célula cúbica de face centrada, também chamada de cúbica F.

Cores e posições das esferas: as esferas são do tipo M, em cinza azulado. Há esferas nos vértices e nos centros das faces. As posições de face usadas são [0, 0.5, 0.5], [0.5, 0, 0.5] e [0.5, 0.5, 0], que se repetem nas faces opostas por translação.

Descrição acessível do canvas: a estrutura mostra um cubo com esferas nos cantos e esferas adicionais no meio de cada face. Cada face quadrada possui uma esfera central. Ao observar a célula, a pessoa usuária deve imaginar uma esfera no centro da face da frente, uma no centro da face de trás, uma no centro da face esquerda, uma no centro da face direita, uma no topo e uma na base.

Leitura didática: os centros de face são compartilhados por duas células vizinhas. A estrutura de face centrada é importante para visualizar empacotamento compacto cúbico e para entender por que existem quatro átomos equivalentes por célula convencional quando todas as posições pertencem à mesma espécie.

### Célula de Wigner-Seitz (BCC)

Tipo de célula: célula primitiva de Wigner-Seitz associada a uma rede cúbica de corpo centrado.

Cores e posições das esferas: a célula de Wigner-Seitz aparece como um sólido acinzentado com arestas escuras. Os pontos de rede da estrutura BCC aparecem como pequenos pontos escuros. Esses pontos indicam a rede original: vértices e centros de corpo da organização cúbica de corpo centrado.

Descrição acessível do canvas: em vez de mostrar uma caixa cúbica tradicional, a visualização mostra a região do espaço mais próxima de um ponto de rede do que de qualquer outro. A forma é um octaedro truncado: um poliedro com faces quadradas e faces hexagonais. Ele parece uma célula “recortada” ao redor de um ponto central, com várias faces inclinadas que delimitam o espaço de vizinhança.

Leitura didática: a descrição deve explicar que a célula de Wigner-Seitz não é uma célula cúbica convencional, mas uma forma construída por simetria e distância. Ela ajuda a entender a vizinhança de cada ponto de rede na estrutura BCC.

### Célula de Wigner-Seitz (FCC)

Tipo de célula: célula primitiva de Wigner-Seitz associada a uma rede cúbica de face centrada.

Cores e posições das esferas: o poliedro principal aparece em cinza com arestas escuras. Pequenos pontos escuros marcam os pontos da rede FCC, isto é, vértices e centros de face da célula convencional.

Descrição acessível do canvas: a forma exibida é um dodecaedro rômbico. Ela possui doze faces em forma de losango. Em vez de se parecer com uma caixa, parece um poliedro de muitas faces inclinadas, delimitando a região mais próxima de um ponto de rede em uma rede de face centrada.

Leitura didática: a descrição deve reforçar que a célula de Wigner-Seitz representa uma divisão do espaço por proximidade. Para acessibilidade, é útil dizer que a forma é a “zona de influência” de um ponto de rede na estrutura FCC.

### Hexagonal (ABA/ABC)

Tipo de célula: visualização de empilhamento hexagonal e de camadas compactas, com alternância entre sequências ABA e ABC.

Cores e posições das esferas: a camada A aparece em vermelho rosado. A camada B aparece em cinza claro. A camada C aparece em azul. As esferas se organizam em padrões triangulares ou hexagonais no plano. A camada intermediária é deslocada em relação à camada inferior, encaixando esferas nos vãos deixados pela primeira camada. A terceira camada pode repetir a posição A, formando ABA, ou ocupar uma nova posição C, formando ABC.

Descrição acessível do canvas: a estrutura mostra esferas agrupadas em camadas. Na camada inferior, as esferas formam uma rede triangular compacta: cada esfera toca ou se aproxima de vizinhas em torno dela, criando pequenos espaços vazios entre três esferas. A segunda camada fica deslocada e encaixa suas esferas sobre parte desses espaços. Quando a terceira camada é adicionada como A, ela fica alinhada com a primeira camada; quando é adicionada como C, ela ocupa outra posição deslocada, sem ficar exatamente acima da primeira.

Leitura didática: a descrição deve focar nos interstícios. Entre três esferas de uma camada surgem cavidades triangulares. Quando outra esfera é colocada sobre uma cavidade, forma-se uma relação de empilhamento. A sequência ABA é típica do empacotamento hexagonal compacto; a sequência ABC é típica do empacotamento cúbico compacto. Para leitor de tela, anunciar “camada A”, “camada B” e “camada C” é mais importante que anunciar apenas as cores.

### Tetragonal (P)

Tipo de célula: célula tetragonal primitiva.

Cores e posições das esferas: esferas do tipo M, em cinza azulado, ocupam os vértices. A posição de referência é [0, 0, 0], repetida por translação.

Descrição acessível do canvas: a célula parece uma caixa de base quadrada, mas alongada em um eixo. Dois lados da base têm o mesmo comprimento, enquanto a altura é diferente. Não há esfera no centro do corpo nem no centro das faces.

Leitura didática: a célula tetragonal primitiva conserva uma base quadrada, mas diferencia o eixo vertical. É uma boa comparação com a cúbica simples: a forma deixa de ser um cubo perfeito e passa a ser um prisma de base quadrada.

### Tetragonal (I)

Tipo de célula: célula tetragonal de corpo centrado.

Cores e posições das esferas: esferas do tipo M, em cinza azulado, ocupam os vértices e o centro do corpo. As posições principais são [0, 0, 0] e [0.5, 0.5, 0.5].

Descrição acessível do canvas: a célula mantém base quadrada e altura diferente, como uma caixa alongada. Além das esferas nos vértices, há uma esfera no interior, exatamente no meio do volume da célula.

Leitura didática: a diferença em relação à tetragonal primitiva é a esfera central. A descrição deve destacar que o corpo centrado acompanha a forma alongada da célula; o centro continua no meio geométrico, mesmo que a altura seja maior que a base.

### Ortorrômbico (P)

Tipo de célula: célula ortorrômbica primitiva.

Cores e posições das esferas: esferas do tipo M, em cinza azulado, ocupam os vértices.

Descrição acessível do canvas: a célula parece uma caixa retangular. Os três eixos têm comprimentos diferentes, mas os ângulos continuam retos. Não há esfera no centro do corpo nem nos centros das faces.

Leitura didática: a estrutura ajuda a diferenciar uma célula com ângulos de 90° mas lados desiguais. Para leitura acessível, comparar com uma caixa de sapato alongada em três dimensões pode ajudar, desde que se explique que essa comparação é apenas espacial.

### Ortorrômbico (I)

Tipo de célula: célula ortorrômbica de corpo centrado.

Cores e posições das esferas: esferas do tipo M, em cinza azulado, ocupam os vértices e o centro do corpo em [0.5, 0.5, 0.5].

Descrição acessível do canvas: a estrutura é uma caixa retangular com uma esfera no meio interno. As dimensões dos três eixos são diferentes, mas a esfera central continua equidistante das faces opostas da célula.

Leitura didática: o foco deve ser a combinação entre forma ortorrômbica e centragem no corpo. A esfera central pertence integralmente à célula, enquanto os vértices são compartilhados.

### Ortorrômbico (F)

Tipo de célula: célula ortorrômbica de face centrada.

Cores e posições das esferas: esferas do tipo M, em cinza azulado, ocupam os vértices e os centros das faces. As posições de face usadas são [0, 0.5, 0.5], [0.5, 0, 0.5] e [0.5, 0.5, 0], repetidas por simetria/translação nas faces opostas.

Descrição acessível do canvas: a célula é uma caixa retangular com esferas nos cantos e no centro de cada face. As faces não são todas quadradas, mas cada uma possui uma esfera posicionada no meio do seu plano.

Leitura didática: o termo face centrada indica que há posições adicionais nas faces. Para acessibilidade, sempre dizer “centro das faces” e não apenas “F”, pois a letra sozinha não comunica a posição espacial.

### Ortorrômbico (C)

Tipo de célula: célula ortorrômbica com centragem em um par de faces, também chamada de base centrada.

Cores e posições das esferas: esferas do tipo M, em cinza azulado, ocupam os vértices e um conjunto de centros de faces equivalente. No arquivo da animação, a posição adicional é [0, 0.5, 0.5], correspondente ao centro de uma face lateral e sua repetição por translação.

Descrição acessível do canvas: a célula é uma caixa retangular. Além dos vértices, há esferas no centro de um par de faces opostas. Diferentemente da ortorrômbica F, nem todas as faces têm centro ocupado.

Leitura didática: a descrição deve destacar a diferença entre face centrada completa e base centrada: na célula C, apenas um par de faces recebe esfera central.

### Monoclínico (P)

Tipo de célula: célula monoclínica primitiva.

Cores e posições das esferas: esferas do tipo M, em cinza azulado, ocupam os vértices.

Descrição acessível do canvas: a célula parece uma caixa inclinada. Dois ângulos permanecem retos, mas um ângulo é oblíquo; por isso, a estrutura não fica perfeitamente vertical como uma caixa ortogonal. As esferas aparecem nos cantos dessa forma inclinada.

Leitura didática: a descrição deve reforçar que a diferença principal é a inclinação de um eixo. Pessoas com baixa visão podem não perceber a obliquidade de imediato, então o texto deve dizer explicitamente que a célula está “tombada” ou “inclinada” em uma direção.

### Monoclínico (C)

Tipo de célula: célula monoclínica base centrada.

Cores e posições das esferas: esferas do tipo M, em cinza azulado, ocupam os vértices e uma posição adicional de face/base em [0, 0.5, 0.5].

Descrição acessível do canvas: a célula é inclinada, como no sistema monoclínico primitivo, mas possui esferas extras no centro de um par de faces equivalentes. Assim, a estrutura combina a obliquidade do sistema monoclínico com a centragem parcial.

Leitura didática: a leitura deve separar duas ideias: primeiro, a forma inclinada da célula; segundo, a presença de centros em faces específicas. Isso evita que a pessoa usuária confunda a inclinação geométrica com a posição das esferas.

### Triclínico (P)

Tipo de célula: célula triclínica primitiva.

Cores e posições das esferas: esferas do tipo M, em cinza azulado, ocupam os vértices.

Descrição acessível do canvas: a célula é a mais assimétrica entre as opções convencionais. Ela parece uma caixa deformada: os três lados têm comprimentos diferentes e os ângulos entre eles também são diferentes de 90°. As esferas ficam nos vértices dessa forma oblíqua.

Leitura didática: para acessibilidade, informar que não há eixo claramente perpendicular como no cubo. A pessoa deve imaginar uma célula inclinada em mais de uma direção, sem faces perfeitamente alinhadas aos eixos ortogonais.

### Romboédrico (R)

Tipo de célula: célula romboédrica ou trigonal R.

Cores e posições das esferas: esferas do tipo M, em cinza azulado, ocupam os vértices.

Descrição acessível do canvas: a célula parece um cubo deformado em que todas as arestas têm comprimento semelhante, mas os ângulos não são retos. As faces lembram losangos. A estrutura mantém uma regularidade própria, mas não é cúbica, porque os ângulos foram inclinados.

Leitura didática: a descrição deve diferenciar romboédrico de triclínico. No romboédrico, há uma repetição mais uniforme das arestas e dos ângulos; no triclínico, a assimetria é maior.

### NaCl (rocha-sal)

Tipo de célula: estrutura cúbica tipo rocha-sal, baseada em uma rede de face centrada com ocupação de posições octaédricas.

Cores e posições das esferas: a espécie A aparece em vermelho rosado e ocupa posições equivalentes a uma rede de face centrada: vértices e centros de faces, com posições de referência [0, 0, 0], [0, 0.5, 0.5], [0.5, 0, 0.5] e [0.5, 0.5, 0]. A espécie C aparece em azul claro e ocupa posições intersticiais octaédricas, como centros de arestas e centro do corpo: [0.5, 0, 0], [0, 0.5, 0], [0, 0, 0.5] e [0.5, 0.5, 0.5].

Descrição acessível do canvas: a estrutura mostra duas espécies alternadas. Uma delas forma a malha cúbica de face centrada, enquanto a outra preenche espaços entre essas esferas. A pessoa usuária deve perceber uma alternância entre esferas vermelhas rosadas e azuis claras, criando uma organização regular, não aleatória.

Leitura didática: a descrição deve falar em interstícios octaédricos. A espécie azul ocupa posições que ficam entre seis vizinhos da espécie vermelha quando a estrutura é considerada em três dimensões. Para leitor de tela, informar “A em vértices e faces; C em centros de arestas e centro do corpo”.

### CsCl

Tipo de célula: estrutura cúbica tipo cloreto de césio, com duas espécies em posições interpenetrantes.

Cores e posições das esferas: a espécie A aparece em vermelho rosado nos vértices, com posição de referência [0, 0, 0]. A espécie C aparece em azul claro no centro do corpo, em [0.5, 0.5, 0.5].

Descrição acessível do canvas: o modelo parece semelhante a uma célula cúbica de corpo centrado quando visto rapidamente, mas as esferas do vértice e do centro têm cores e espécies diferentes. Há uma espécie ocupando os cantos do cubo e outra espécie ocupando o centro interno.

Leitura didática: a descrição deve evitar chamar essa estrutura simplesmente de BCC de um único elemento. O ponto central representa outra espécie química. O foco é a alternância entre duas sub-redes cúbicas deslocadas.

### ZnS (blenda)

Tipo de célula: estrutura cúbica tipo blenda de zinco, baseada em rede de face centrada com ocupação tetraédrica.

Cores e posições das esferas: a espécie A aparece em vermelho rosado e ocupa posições de rede de face centrada: vértices e centros de faces. A espécie C aparece em azul claro e ocupa quatro posições internas tetraédricas: [0.25, 0.25, 0.25], [0.75, 0.75, 0.25], [0.75, 0.25, 0.75] e [0.25, 0.75, 0.75].

Descrição acessível do canvas: a estrutura mostra uma rede principal de esferas vermelhas rosadas e, dentro dela, esferas azuis claras localizadas em regiões internas deslocadas. Essas posições internas não ficam no centro do corpo nem no centro das faces; elas ficam em regiões associadas a interstícios tetraédricos.

Leitura didática: a descrição deve destacar que a espécie azul se distribui em quatro espaços tetraédricos da célula. Cada esfera azul pode ser imaginada como situada entre quatro esferas vizinhas da espécie vermelha, formando uma coordenação tetraédrica.

### Rutilo (TiO2)

Tipo de célula: estrutura tetragonal do rutilo, com duas espécies químicas.

Cores e posições das esferas: a espécie T, associada ao titânio, aparece em cinza muito claro e ocupa as posições [0, 0, 0] e [0.5, 0.5, 0.5]. A espécie O, associada ao oxigênio, aparece em vermelho e ocupa posições deslocadas definidas por um parâmetro interno u, aproximadamente 0.305: [u, u, 0], [-u, -u, 0], [0.5 + u, 0.5 - u, 0.5] e [0.5 - u, 0.5 + u, 0.5].

Descrição acessível do canvas: a estrutura apresenta esferas claras em posições centrais de uma rede tetragonal e esferas vermelhas organizadas ao redor delas em posições deslocadas. A célula não é cúbica: sua proporção é tetragonal, com um eixo diferente dos outros. As esferas vermelhas não ficam apenas em vértices ou faces; elas aparecem em posições internas determinadas pelo deslocamento u.

Leitura didática: a descrição deve explicar que o rutilo não é uma simples célula com uma espécie nos cantos. É uma estrutura com coordenação entre titânio e oxigênio. O parâmetro u indica um deslocamento interno importante para posicionar os oxigênios.

### Monte a sua estrutura (DIY)

Tipo de célula: estrutura personalizada definida pela pessoa usuária.

Cores e posições das esferas: no modo de adição manual, o tipo A é vermelho e maior, o tipo B é cinza e médio, e o tipo C é verde e menor. As posições dependem dos pontos escolhidos pela pessoa usuária no canvas.

Descrição acessível do canvas: a pessoa usuária pode montar uma estrutura própria, adicionando esferas em posições selecionadas. Como a estrutura muda dinamicamente, o texto acessível deve atualizar ou complementar a leitura com uma lista das espécies presentes, suas cores, seus tamanhos relativos e suas coordenadas aproximadas.

Leitura didática: para uma experiência inclusiva, cada átomo adicionado deveria ser anunciado com tipo, cor, tamanho e posição fracionária. Exemplo de leitura: “átomo A, vermelho, maior, adicionado próximo ao centro da face superior”.

## Descrição dos controles que alteram a leitura visual

O controle de tamanho aumenta ou reduz o número de células ou o lado do triângulo em visualizações de camadas. O controle de raio altera o tamanho visual das esferas, mas não altera a posição cristalográfica. O controle de espaçamento afasta ou aproxima as células, ajudando a perceber lacunas e repetições. A projeção ortográfica reduz distorções de perspectiva, sendo útil para comparar alinhamentos. A opção de mostrar apenas uma célula simplifica a leitura para quem precisa focar na célula unitária. A opção de mostrar apenas uma face ou recortar por face ajuda a entender quais esferas pertencem a uma região específica do sólido.

## Observações de acessibilidade para implementação

Cada estrutura selecionada deve ter uma descrição textual própria. O texto deve anunciar o nome da estrutura, o tipo de célula, as espécies presentes, as cores e as posições ocupadas. Em estruturas com várias espécies, a leitura deve separar cada espécie em uma frase curta. Em estruturas de camadas, a leitura deve priorizar a sequência A, B e C, os deslocamentos entre camadas e os interstícios formados. Em estruturas iônicas, a leitura deve explicar quais posições são de rede principal e quais posições são intersticiais.
