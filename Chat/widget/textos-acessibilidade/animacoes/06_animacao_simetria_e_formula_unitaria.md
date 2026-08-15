# Texto acessível — Animação 06 — Simetria e Fórmula Unitária

Categoria: Animação. Pasta analisada: Ensino/Animacao/simetria-e-formula-unitaria. Página principal: index.html. Elementos visuais principais: cinco visualizações carregadas em iframe, com modelos 3D e canvas interativos.

Objetivo do texto: explicar, de modo acessível e inclusivo, as cinco etapas da animação Simetria e Fórmula Unitária. O texto deve apoiar a compreensão de posições cristalográficas, simetria de translação, contagem por frações e fórmula mínima. A leitura deve funcionar para pessoas cegas, pessoas com baixa visão, estudantes com daltonismo e qualquer pessoa que precise de uma descrição textual do que acontece nos modelos visuais.

## Descrição geral da animação

A página organiza o conteúdo em cinco abas numeradas: 1) Cúbicas; 2) Translação — Células; 3) Simetria (orbits); 4) Frações — Células; 5) Modelos — Posições. Cada aba apresenta uma visualização diferente para explicar como os átomos ocupam posições em células unitárias e como essas posições contribuem para a fórmula unitária.

A leitura acessível deve evitar depender apenas da rotação visual do modelo. Sempre que a cena mostrar um ponto, esfera ou conjunto de posições, o texto deve informar se a posição é vértice, aresta, face ou centro do corpo. Também deve informar a fração de contribuição: vértice vale 1/8, aresta vale 1/4, face vale 1/2 e centro do corpo vale 1.

## Texto curto para aria-label da visualização

Visualização interativa sobre simetria e fórmula unitária. Mostra células cúbicas, translação da célula, conjuntos de posições equivalentes, contagem por frações e modelos de vértice, aresta, face e centro.

## Convenções de cor e leitura inclusiva

Nas visualizações em canvas, os contornos de posições usam cores diferentes: vértices aparecem em roxo; arestas em amarelo âmbar; faces em azul ciano; centro do corpo em vermelho. Os elementos químicos ou espécies genéricas aparecem com cores próprias: A em azul claro, B em amarelo, C em vermelho e D em roxo escuro. A célula central pode aparecer destacada em verde. As demais células ou linhas de referência aparecem em cinza claro sobre fundo escuro.

As cores não devem ser usadas sozinhas. A descrição deve dizer, por exemplo: “posição de vértice, marcada em roxo, com contribuição de um oitavo” ou “posição de face, marcada em azul ciano, com contribuição de metade”. Isso torna a informação acessível para estudantes com daltonismo e para leitores de tela.

## 1) Cúbicas

### O que a aba mostra

A primeira aba apresenta modelos 3D das estruturas cúbicas simples, cúbicas de corpo centrado e cúbicas de face centrada. A pessoa usuária pode alternar entre Cúbica Simples (SC), Corpo Centrado (BCC), Face Centrada (FCC) e uma visualização de corte. O modelo pode ser girado, aproximado e reposicionado.

### Cúbica simples (SC)

Descrição acessível: a célula aparece como um cubo com pontos ou esferas nos oito vértices. Não há esfera no centro do corpo nem no centro das faces. A forma principal é uma caixa regular, com arestas iguais e ângulos retos.

Contagem: cada vértice é compartilhado por oito células. Como existem oito vértices e cada um contribui com 1/8, a contribuição total é 1 átomo por célula unitária quando todos os vértices pertencem à mesma espécie.

Leitura sugerida: “célula cúbica simples; oito vértices ocupados; cada vértice vale um oitavo; total equivalente a um átomo por célula”.

### Cúbica de corpo centrado (BCC)

Descrição acessível: a célula aparece como um cubo com pontos ou esferas nos oito vértices e uma esfera adicional no centro do volume. A esfera central fica no meio geométrico do cubo, não encostada em nenhuma face.

Contagem: os oito vértices somam 1 átomo por célula. O centro do corpo pertence inteiramente à célula e soma mais 1. O total é 2 átomos equivalentes por célula unitária quando todos pertencem à mesma espécie.

Leitura sugerida: “célula cúbica de corpo centrado; vértices ocupados e centro do corpo ocupado; vértices somam um, centro soma um; total dois”.

### Cúbica de face centrada (FCC)

Descrição acessível: a célula aparece como um cubo com pontos ou esferas nos oito vértices e no centro das seis faces. Cada face quadrada possui um ponto no meio do seu plano.

Contagem: os oito vértices somam 1 átomo por célula. As seis faces, cada uma com contribuição de 1/2, somam 3 átomos. O total é 4 átomos equivalentes por célula unitária quando todos pertencem à mesma espécie.

Leitura sugerida: “célula cúbica de face centrada; vértices e seis centros de face ocupados; vértices somam um, faces somam três; total quatro”.

### Corte

Descrição acessível: a visualização de corte serve para enxergar posições internas ou compartilhadas que poderiam ficar escondidas em uma vista externa. O modelo aparece como se parte da célula tivesse sido removida ou aberta, facilitando a leitura dos pontos no interior, nas faces ou nos vértices.

Leitura didática: o corte não muda a estrutura cristalina. Ele apenas facilita a compreensão espacial. Para leitor de tela, deve ser anunciado como “vista seccionada” ou “vista aberta da célula”.

## 2) Translação — Células

### O que a aba mostra

A segunda aba apresenta uma célula unitária que pode ser deslocada por translação nos eixos X, Y e Z. A cena mostra que a escolha da célula de referência pode mudar de lugar dentro da rede cristalina, mas a fórmula obtida pela contagem das posições equivalentes permanece a mesma.

A pessoa usuária pode escolher sistemas cristalinos como cúbico, tetragonal, ortorrômbico, hexagonal, romboédrico, monoclínico e triclínico. Também pode selecionar exemplos como SC, BCC, FCC ou uma composição personalizada.

### Descrição acessível do canvas

A visualização mostra uma rede de pontos no espaço e uma célula destacada. Quando os controles de translação são movidos, a célula destacada se desloca em relação à rede. A estrutura visual comunica que a rede é periódica: a mesma organização de pontos se repete em intervalos regulares.

Quando a rede completa está ativada, várias células aparecem ao redor da célula principal, criando um padrão repetido. Quando a rede completa está desativada, a leitura fica mais focada na célula selecionada.

### Cores e posições

Vértices são marcados em roxo e representam posições compartilhadas por oito células. Arestas são marcadas em amarelo âmbar e representam posições compartilhadas por quatro células. Faces são marcadas em azul ciano e representam posições compartilhadas por duas células. O centro do corpo é marcado em vermelho e pertence integralmente à célula.

As espécies A, B, C e D podem ser atribuídas a diferentes categorias de posição. A espécie A aparece em azul claro, B em amarelo, C em vermelho e D em roxo escuro.

### Leitura didática

A translação mostra que a célula unitária é uma escolha de repetição espacial. Deslocar a célula para frente, para trás, para cima ou para os lados não altera a rede. O que define a fórmula é a quantidade de posições ocupadas e a fração de cada posição, não o lugar visual em que a caixa foi desenhada.

Leitura sugerida: “a célula foi transladada, mas as posições equivalentes continuam representando a mesma rede; a fórmula unitária não muda apenas porque a célula foi deslocada”.

## 3) Simetria (orbits)

### O que a aba mostra

A terceira aba mostra conjuntos de posições equivalentes por translação, também chamados de órbitas ou conjuntos de posições. Em vez de contar apenas um ponto isolado, a visualização mostra como uma posição gera pontos equivalentes nas células vizinhas.

Os conjuntos disponíveis incluem vértices, faces perpendiculares aos eixos X, Y e Z, arestas paralelas aos eixos X, Y e Z, e centro do corpo.

### Descrição acessível do canvas

A cena apresenta uma grade tridimensional de células. A célula central aparece destacada, enquanto células vizinhas aparecem como referência. Quando uma categoria é ativada, seus pontos equivalentes aparecem repetidos pela rede. Isso mostra que um ponto cristalográfico não existe sozinho; ele faz parte de uma família de posições relacionadas pela translação.

### Conjuntos de posições

Vértices: representam os cantos das células. Embora apareçam em vários cantos da malha, a família de vértices equivale a um conjunto por célula quando considerada pela simetria translacional.

Faces perpendiculares ao eixo X: representam centros de faces atravessadas pelo eixo X. A posição de referência é semelhante a [0, 0.5, 0.5].

Faces perpendiculares ao eixo Y: representam centros de faces atravessadas pelo eixo Y. A posição de referência é semelhante a [0.5, 0, 0.5].

Faces perpendiculares ao eixo Z: representam centros das faces superior e inferior. A posição de referência é semelhante a [0.5, 0.5, 0].

Arestas paralelas ao eixo X: representam pontos no meio de arestas orientadas na direção X. A posição de referência é semelhante a [0.5, 0, 0].

Arestas paralelas ao eixo Y: representam pontos no meio de arestas orientadas na direção Y. A posição de referência é semelhante a [0, 0.5, 0].

Arestas paralelas ao eixo Z: representam pontos no meio de arestas orientadas na direção Z. A posição de referência é semelhante a [0, 0, 0.5].

Centro do corpo: representa o ponto interno da célula, em [0.5, 0.5, 0.5].

### Leitura didática

A ideia principal desta aba é que posições equivalentes formam conjuntos. A contagem por órbitas ajuda a entender que uma estrutura pode ser descrita por grupos de pontos relacionados, e não apenas por pontos individuais desenhados em uma única célula.

Leitura sugerida: “foi ativado um conjunto de posições equivalentes; a célula central mostra a referência, e as células vizinhas mostram como essa posição se repete por translação”.

## 4) Frações — Células

### O que a aba mostra

A quarta aba ensina a contagem por frações em diferentes sistemas cristalinos. A pessoa usuária pode selecionar sistemas como cúbico, tetragonal, ortorrômbico, hexagonal, romboédrico, monoclínico e triclínico. Também pode selecionar centragem primitiva P, corpo centrado I, face centrada F ou base centrada C, quando disponíveis.

### Descrição acessível do canvas

A cena mostra uma célula unitária com pontos em posições cristalográficas. O objetivo é entender quanto cada ponto contribui para a célula. Um ponto no vértice é compartilhado por oito células; um ponto na aresta é compartilhado por quatro; um ponto na face é compartilhado por duas; e um ponto no centro do corpo pertence apenas à célula mostrada.

### Regras de contagem

Vértice: 8 posições possíveis em uma célula convencional. Cada vértice contribui com 1/8. Oito vértices ocupados por uma mesma espécie somam 1.

Aresta: 12 posições possíveis em uma célula convencional. Cada aresta contribui com 1/4. Doze arestas ocupadas por uma mesma espécie somam 3.

Face: 6 posições possíveis em uma célula convencional. Cada face contribui com 1/2. Seis faces ocupadas por uma mesma espécie somam 3.

Centro do corpo: 1 posição possível. O centro contribui com 1 inteiro. Um centro ocupado soma 1.

### Célula P — primitiva

Descrição acessível: a célula primitiva mostra apenas vértices ocupados. A contagem padrão é 8 vértices multiplicados por 1/8, resultando em 1 átomo equivalente por célula quando todos são da mesma espécie.

Leitura sugerida: “célula primitiva; apenas vértices ocupados; total um”.

### Célula I — corpo centrado

Descrição acessível: a célula de corpo centrado mostra vértices ocupados e um ponto no centro do corpo. A contagem é 8 vértices vezes 1/8, somando 1, mais 1 centro inteiro, somando 2.

Leitura sugerida: “célula de corpo centrado; vértices somam um e centro soma um; total dois”.

### Célula F — face centrada

Descrição acessível: a célula de face centrada mostra vértices e seis centros de faces. A contagem é 8 vértices vezes 1/8, somando 1, mais 6 faces vezes 1/2, somando 3. O total é 4.

Leitura sugerida: “célula de face centrada; vértices somam um e faces somam três; total quatro”.

### Célula C — base centrada

Descrição acessível: a célula base centrada mostra vértices e dois centros de faces opostas. A contagem é 8 vértices vezes 1/8, somando 1, mais 2 faces vezes 1/2, somando 1. O total é 2.

Leitura sugerida: “célula base centrada; vértices somam um e duas faces opostas somam um; total dois”.

### Composição personalizada

Descrição acessível: quando a pessoa usuária atribui espécies diferentes a vértices, arestas, faces e centro, a fórmula mínima depende da soma de cada espécie. Por exemplo, se A ocupa vértices e B ocupa faces, a leitura deve calcular A a partir dos vértices e B a partir das faces separadamente.

Leitura didática: o leitor de tela deve anunciar a contribuição por espécie, não apenas o total de pontos. Uma boa leitura seria: “espécie A: contribuição 1; espécie B: contribuição 3; fórmula unitária A1B3, que pode ser simplificada se houver fator comum”.

## 5) Modelos — Posições

### O que a aba mostra

A quinta aba apresenta modelos isolados das quatro posições fundamentais de contagem: vértices, arestas, face e centro. A pessoa usuária escolhe uma posição, e o modelo 3D mostra onde esses pontos aparecem na célula.

### Vértices

Descrição acessível: os vértices são os oito cantos da célula. Cada canto é compartilhado por oito células vizinhas. Em uma célula convencional com todos os vértices ocupados pela mesma espécie, a contagem é 8 pontos multiplicados por 1/8, resultando em 1.

Leitura sugerida: “vértices; oito pontos nos cantos; cada ponto vale um oitavo; total um”.

### Arestas

Descrição acessível: as arestas são as linhas de encontro entre duas faces. Os pontos de aresta ficam no meio dessas linhas. Uma célula convencional tem doze arestas. Cada ponto de aresta é compartilhado por quatro células, então cada um contribui com 1/4. Doze pontos de aresta ocupados somam 3.

Leitura sugerida: “arestas; doze pontos no meio das linhas da célula; cada ponto vale um quarto; total três”.

### Face

Descrição acessível: os pontos de face ficam no centro de cada uma das seis faces da célula. Cada ponto de face é compartilhado por duas células vizinhas, uma de cada lado da face. Por isso, cada ponto vale 1/2. Seis faces ocupadas somam 3.

Leitura sugerida: “faces; seis pontos no centro dos planos laterais, superior e inferior; cada ponto vale metade; total três”.

### Centro

Descrição acessível: o centro do corpo é um ponto único no interior da célula, no meio exato do volume. Ele não é compartilhado com células vizinhas, então vale 1 inteiro.

Leitura sugerida: “centro do corpo; um ponto no meio interno da célula; contribuição inteira; total um”.

## Observações de acessibilidade para implementação

A leitura acessível deve acompanhar a seleção da aba e a seleção interna de cada modelo. Quando a pessoa mudar de SC para BCC ou FCC, o texto deve anunciar a alteração e apresentar a nova contagem. Quando a pessoa ativar vértices, arestas, faces ou centro, a interface deve informar a posição, a cor, a fração e a contribuição total. Em fórmulas, os números devem ser pronunciados de modo explícito, evitando que índices visuais fiquem invisíveis para leitores de tela.

Para estudantes com baixa visão, a interface deve combinar cor, nome e posição. Para estudantes com daltonismo, não usar apenas roxo, amarelo, azul ou vermelho como distinção. Para leitores de tela, priorizar frases curtas: “vértice, um oitavo”; “face, metade”; “centro, inteiro”. Para pessoas neurodivergentes, apresentar a contagem em sequência previsível: posição, quantidade, fração, soma e fórmula.
