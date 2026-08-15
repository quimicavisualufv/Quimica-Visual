# 08 — Animação: Visualizador de Orbitais Atômicos e Moleculares

## Objetivo do texto acessível

Este texto descreve a animação “Visualizador de Orbitais atômicos e moleculares” para uso como recurso de acessibilidade. A descrição considera pessoas que utilizam leitor de tela, baixa visão, daltonismo, navegação por teclado ou que precisam de explicação textual para compreender o canvas WebGL.

A página apresenta estruturas do tipo blobby e metaball, isto é, formas volumétricas suaves que podem representar orbitais, lobos de orbitais, regiões de fase, combinações ligantes e antiligantes, ou aproximações visuais de hibridização local. A cena começa vazia. O usuário adiciona estruturas pelo painel “Estruturas”, seleciona uma forma no canvas e edita cores, tamanho e sinais negativos das partes.

## Organização visual da página

A tela tem um canvas 3D ocupando quase toda a página. Sobre ele há três grupos principais de interface.

À direita, existe o painel “Estruturas”, com botões para adicionar s, px, py, pz, dxy, dyz, dxz, dz², dx²−y², diferentes orbitais f e um anel. A cena começa vazia; a orientação do próprio sistema informa que a pessoa deve dar dois cliques em um quadrado para adicionar uma estrutura.

À esquerda, há um painel de edição. Quando uma estrutura é selecionada, esse painel mostra as partes editáveis da forma, como “Lóbulo 1”, “Lóbulo 2”, “Parte de cima”, “Parte de baixo”, “Anel superior” ou “Anel inferior”. Cada parte pode receber cor própria e pode ser marcada como negativa.

No canto inferior direito, quando os eixos estão ligados, aparece uma miniatura dos eixos cartesianos. O eixo X aparece em vermelho, o eixo Y em verde e o eixo Z em azul. Essa referência ajuda a entender a orientação da cena.

Quando uma estrutura é selecionada, aparece um gizmo de manipulação com três alças coloridas: X em vermelho, Y em verde e Z em azul. Ele indica que a forma pode ser movida no espaço. A seleção também pode ser indicada por uma marca ou guia visual amarela.

## Fundo, eixos e contraste

O canvas usa fundo escuro, quase preto. Sobre ele aparece uma grade no plano de base, com linhas discretas. A grade ajuda a perceber profundidade e posição espacial, mas não deve ser a única referência para pessoas com baixa visão.

Os eixos cartesianos são fundamentais para a descrição. Em vez de dizer apenas “o lóbulo azul está de um lado”, a explicação acessível deve dizer “o lóbulo está no lado negativo do eixo X”, “o lóbulo está acima no eixo Y” ou “o lóbulo está para frente no eixo Z”, de acordo com a orientação da câmera.

## Cores padrão das partes

As cores padrão podem ser editadas, mas a página inicia com uma paleta recorrente. Muitas estruturas usam azul para a primeira parte e vermelho para a segunda parte. Estruturas com mais partes também usam verde, amarelo ou laranja, roxo e ciano. O orbital s usa tons de amarelo e laranja.

Como as cores são editáveis, o texto acessível não deve depender exclusivamente delas. A descrição deve sempre identificar posição, eixo e função: lóbulo positivo ou negativo, parte superior ou inferior, lobo axial, lobo diagonal, anel equatorial ou anel deslocado.

## Sinal negativo e interpretação de fase

Cada parte da estrutura pode ser marcada como “Negative”. Isso altera o sinal matemático da contribuição daquela parte na superfície blobby. Em uma leitura química, essa marcação pode representar mudança de fase de uma função orbital, condição importante para discutir combinações ligantes e antiligantes.

Para acessibilidade, o ideal é anunciar tanto a cor quanto o estado de fase. Exemplo de descrição: “lóbulo no lado positivo do eixo X, colorido em vermelho, marcado como fase negativa”. Isso evita que uma pessoa daltônica ou sem visão dependa da cor para entender a diferença entre partes.

## Modos de visualização e interação

No modo 3D, arrastar o canvas gira a câmera ao redor da cena. O scroll controla o zoom. Com Shift ou botão direito, a câmera pode ser deslocada. A profundidade é percebida pela rotação, pela iluminação e pela grade.

No modo 2D, a visualização fica ortográfica, mais frontal e com menor sensação de perspectiva. Esse modo é útil para comparar posições no plano, mas pode esconder parte da profundidade de orbitais alinhados ao eixo Z.

A opção “Eixos cartesianos” mostra ou oculta os eixos. Para fins de acessibilidade, recomenda-se manter os eixos ligados sempre que o texto descritivo estiver sendo usado, porque os nomes X, Y e Z dão referência espacial objetiva.

## Descrição por estrutura

### s

A estrutura s é aproximadamente esférica, sem orientação preferencial em X, Y ou Z. Ela aparece como uma forma arredondada e centralizada. Por padrão, usa tons de amarelo e laranja, dividindo a esfera em duas regiões visuais. Essa divisão pode ajudar a representar partes ou fases, mas a forma essencial do orbital s é uma esfera.

Descrição acessível sugerida: “estrutura esférica central, simétrica em todas as direções; não há lobos separados nem eixo principal”.

### px

A estrutura px tem dois lobos opostos alinhados ao eixo X. Um lobo fica no lado negativo de X e o outro no lado positivo de X. A forma parece duas gotas alongadas ou dois balões conectados pela região central. Por padrão, um lado aparece em azul e o outro em vermelho.

Descrição acessível sugerida: “dois lobos opostos no eixo X; um lobo à esquerda ou no lado negativo de X, outro à direita ou no lado positivo de X; há uma região nodal no centro”.

### py

A estrutura py tem dois lobos opostos alinhados ao eixo Y. Um lobo fica na direção negativa de Y e o outro na direção positiva de Y. Dependendo da câmera, essa orientação pode aparecer como acima e abaixo na tela.

Descrição acessível sugerida: “dois lobos opostos no eixo Y; um lobo inferior e outro superior em relação à orientação cartesiana; a mudança de fase pode ser representada por cores ou marcação negativa”.

### pz

A estrutura pz tem dois lobos opostos alinhados ao eixo Z. Como o eixo Z representa profundidade na cena, a percepção completa depende da rotação da câmera. Um lobo fica para o lado negativo de Z e outro para o lado positivo de Z.

Descrição acessível sugerida: “dois lobos em profundidade no eixo Z; ao girar a cena, percebe-se que um lobo está à frente e outro atrás”.

### dxy

A estrutura dxy tem quatro lobos distribuídos no plano XY. Os lobos não ficam sobre os eixos X e Y; eles ficam entre esses eixos, nos quadrantes diagonais. A forma lembra uma cruz diagonal de quatro pétalas.

As partes padrão usam quatro cores: azul, vermelho, verde e amarelo ou laranja. A cor diferencia os lobos, mas a informação principal é a posição: quatro regiões diagonais no plano XY.

Descrição acessível sugerida: “quatro lobos no plano XY, localizados entre os eixos X e Y; as regiões dos eixos funcionam como zonas nodais”.

### dyz

A estrutura dyz tem quatro lobos distribuídos no plano YZ. Os lobos ficam entre os eixos Y e Z, formando uma cruz diagonal no plano vertical ou de profundidade. O eixo X funciona como direção perpendicular ao plano principal.

Descrição acessível sugerida: “quatro lobos diagonais no plano YZ; a forma ocupa altura e profundidade, e não se espalha principalmente pelo eixo X”.

### dxz

A estrutura dxz tem quatro lobos distribuídos no plano XZ. Os lobos ficam entre os eixos X e Z, criando uma cruz diagonal que mistura largura e profundidade. Em visão frontal, parte da forma pode parecer sobreposta; a rotação ajuda a separar os lobos.

Descrição acessível sugerida: “quatro lobos diagonais no plano XZ; dois pares se projetam entre largura e profundidade, com regiões nodais nos eixos do plano”.

### dz²

A estrutura dz² combina dois lobos alongados no eixo Z com um anel ao redor da região central. Os lobos principais ficam um no lado positivo de Z e outro no lado negativo de Z. O anel fica na região equatorial, em torno do centro, perpendicular ao eixo Z.

No editor, as partes podem aparecer como “Parte de cima”, “Parte de baixo”, “Anel superior” e “Anel inferior”. As cores padrão incluem vermelho e azul nos lobos axiais, além de verde e amarelo ou laranja no anel.

Descrição acessível sugerida: “dois lobos no eixo Z e uma argola central ao redor do núcleo; a argola faz parte do mesmo orbital e não deve ser interpretada como objeto separado”.

### dx²−y²

A estrutura dx²−y² tem quatro lobos no plano XY, mas, diferente do dxy, os lobos ficam alinhados diretamente aos eixos X e Y. Dois lobos apontam para os lados positivo e negativo de X; os outros dois apontam para os lados positivo e negativo de Y.

Descrição acessível sugerida: “quatro lobos coplanares formando uma cruz alinhada aos eixos X e Y; os vazios principais ficam nas diagonais entre esses eixos”.

### fz³

A estrutura fz³ é uma forma de orbital f com eixo principal Z. Ela tem dois lobos alongados no eixo Z e dois anéis deslocados, um mais próximo da parte superior e outro da parte inferior. O conjunto parece uma estrutura vertical mais complexa que o dz², com mais regiões separadas.

No editor, as partes são identificadas como lóbulo superior, lóbulo inferior, anel superior A, anel superior B, anel inferior A e anel inferior B. As cores padrão podem incluir vermelho, azul, verde, amarelo ou laranja, roxo e ciano.

Descrição acessível sugerida: “orbital f orientado no eixo Z, com dois lobos axiais e anéis adicionais acima e abaixo do centro, formando uma estrutura em camadas”.

### fxz²

A estrutura fxz² tem seis partes. Duas delas se estendem principalmente ao longo do eixo X, enquanto outras quatro aparecem como lobos diagonais no plano XZ. Ela mistura um eixo alongado com lobos diagonais associados à profundidade.

Descrição acessível sugerida: “duas regiões alongadas no eixo X e quatro lobos diagonais no plano XZ; a forma se espalha para os lados e também em profundidade”.

### fyz²

A estrutura fyz² tem seis partes. Duas regiões se alinham ao eixo Y, e quatro lobos diagonais ocupam o plano YZ. O conjunto combina altura e profundidade.

Descrição acessível sugerida: “duas regiões principais no eixo Y e quatro lobos diagonais no plano YZ; a forma parece uma composição vertical com ramificações em profundidade”.

### fxyz

A estrutura fxyz possui oito lobos orientados para direções diagonais do espaço, semelhantes às direções dos cantos de um cubo ao redor do centro. Embora o editor use seis cores, algumas cores podem se repetir para representar todos os lobos.

Descrição acessível sugerida: “oito lobos distribuídos nas diagonais tridimensionais, apontando para os cantos imaginários de um cubo; há nós associados aos planos coordenados X, Y e Z”.

### fz(x²−y²)

A estrutura fz(x²−y²) combina dois lobos no eixo Z com quatro lobos diagonais no plano XY. Ela pode ser entendida como uma forma com eixo vertical ou de profundidade e uma cruz equatorial.

Descrição acessível sugerida: “dois lobos no eixo Z e quatro lobos ao redor do centro no plano XY; a estrutura mistura uma direção axial com uma distribuição equatorial”.

### fx(x²−3y²)

A estrutura fx(x²−3y²) tem seis lobos no plano XY. Os lobos formam uma organização aproximadamente hexagonal ou de seis pétalas, com uma das direções principais apontando para o eixo X.

Descrição acessível sugerida: “seis lobos no plano XY, distribuídos como seis pétalas ao redor do centro; uma das pétalas principais está alinhada ao eixo X”.

### fy(3x²−y²)

A estrutura fy(3x²−y²) também tem seis lobos no plano XY, mas a organização é rotacionada em relação à anterior. Uma direção principal fica associada ao eixo Y.

Descrição acessível sugerida: “seis lobos no plano XY, distribuídos ao redor do centro; o padrão é semelhante ao fx(x²−3y²), porém rotacionado, com referência principal no eixo Y”.

### anel

A estrutura anel é um toro, isto é, uma argola tridimensional ao redor do centro. Ela não tem lobos separados como os orbitais p, d ou f. O volume principal forma uma faixa circular com espaço vazio no meio.

Por padrão, o anel pode ser dividido em duas regiões coloridas, uma associada a uma metade e outra à metade oposta. A descrição não deve dizer apenas “argola colorida”; deve explicar que se trata de um volume circular, semelhante a um pneu ou anel, usado para representar uma região toroidal de densidade ou fase.

Descrição acessível sugerida: “argola tridimensional centrada no espaço, com abertura no meio; a estrutura representa uma região toroidal contínua”.

## Combinações e sobreposição de estruturas

A página permite adicionar mais de uma estrutura ao canvas, até o limite definido pela aplicação. Quando várias estruturas são adicionadas, elas aparecem juntas no mesmo espaço 3D. A proximidade entre elas pode fazer as superfícies se conectarem suavemente, como em metaballs. Isso pode ser usado para simular combinação de orbitais.

Quando duas partes têm fases compatíveis, a forma tende a parecer contínua ou reforçada. Quando uma parte é marcada como negativa em relação à outra, a superfície pode criar separações, cancelamentos ou regiões que ajudam a discutir combinação antiligante.

Para acessibilidade, quando houver múltiplas estruturas, a descrição deve listar cada uma pela ordem ou posição: “há um orbital px no centro, um s deslocado para o lado positivo de X e um anel próximo ao plano XY”.

## Texto curto sugerido para botão “Explicar visualização”

Este visualizador mostra estruturas volumétricas suaves que representam orbitais atômicos, orbitais moleculares ou combinações de lobos. A cena começa vazia e o usuário adiciona formas pelo painel de estruturas. Orbitais s são esféricos; orbitais p têm dois lobos opostos; orbitais d têm quatro lobos ou dois lobos com anel; orbitais f têm formas mais complexas, com seis ou oito regiões. As cores identificam partes editáveis e fases, mas a interpretação principal deve considerar posição, eixo, número de lobos, anéis, regiões nodais e marcação de sinal negativo.

## Observações inclusivas para implementação

Ao atualizar descrições para leitor de tela, informar sempre: tipo da estrutura, número de lobos, eixo ou plano principal, presença de anel, cores atuais quando forem relevantes, e quais partes estão marcadas como negativas.

Evitar depender apenas de expressões visuais como “bonito”, “colorido” ou “parecido com flor”. Quando usar analogias, combiná-las com informação espacial objetiva, como “quatro lobos no plano XY” ou “anel perpendicular ao eixo Z”.

Para pessoas com daltonismo, a cor deve ser tratada como informação auxiliar. O essencial é indicar: parte 1, parte 2, fase positiva, fase negativa, lado positivo do eixo, lado negativo do eixo, plano principal e relação com o centro.

Para baixa visão, recomenda-se manter os eixos cartesianos ligados, usar contraste forte e evitar que o significado dependa de mudanças sutis de brilho. A seleção deve ser descrita textualmente, não apenas por contorno amarelo ou gizmo colorido.
