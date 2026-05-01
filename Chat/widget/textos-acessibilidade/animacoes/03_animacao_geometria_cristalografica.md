# Texto acessível — Animação 03 — Geometria Cristalográfica

Categoria: Animação. Pasta analisada: Ensino/Animacao/geometria-cristalografica. Página principal: index.html. Elemento visual principal: canvas com id viewport.

Objetivo do texto: explicar, em linguagem inclusiva e acessível, o que aparece no canvas 3D de geometria cristalográfica. O foco é permitir que pessoas cegas, pessoas com baixa visão, estudantes com daltonismo, pessoas neurodivergentes e qualquer pessoa que use leitor de tela compreendam a forma geral de cada sólido, sua organização espacial e seus elementos básicos: faces, arestas e vértices.

## Descrição geral da visualização

A página apresenta um catálogo de sólidos cristalográficos em um canvas 3D. A pessoa usuária escolhe uma figura na lista lateral; o sólido aparece no centro da tela e pode ser girado nos eixos X, Y e Z, aproximado com zoom, reenquadrado e visualizado com faces preenchidas ou apenas com arestas.

As faces são os planos que fecham o sólido, como paredes da forma. As arestas são as linhas onde duas faces se encontram. Os vértices são os pontos onde duas ou mais arestas se cruzam, formando cantos. Quando as faces estão preenchidas, a cor padrão é azul claro. As arestas aparecem em azul muito escuro. A cor pode ser alterada pelo controle da página, então o texto acessível não deve depender somente da cor: sempre deve nomear a forma, a posição, a quantidade e a relação entre faces, arestas e vértices.

## Texto curto para aria-label da visualização

Visualização 3D interativa de sólidos cristalográficos. A figura selecionada pode ser girada e aproximada; o texto descreve faces, arestas, vértices e forma geral de cada sólido.

## Orientação inclusiva de leitura

Ao descrever qualquer sólido, priorizar primeiro a estrutura geométrica e só depois a aparência visual. Uma pessoa que não vê a tela deve conseguir imaginar se a forma é uma caixa, uma pirâmide, duas pirâmides unidas, um prisma, um poliedro com muitos planos, ou uma forma inclinada. Evitar depender de expressões como “à direita” ou “na cor azul” sem explicar também o significado espacial.

## Descrições por sistema cristalino e figura

## Sistema cúbico (regular ou isométrico)

### Hexaedro (Cubo)

Elementos geométricos: 6 faces quadradas, 12 arestas e 8 vértices.

Descrição acessível do canvas: O modelo aparece como um cubo regular. Todas as faces têm o mesmo tamanho e todos os ângulos são retos. As arestas formam uma malha fechada de doze segmentos, com oito cantos equivalentes. É a forma de referência para reconhecer simetria alta em cristais cúbicos.

Como orientar a leitura: ao girar o modelo, as faces voltadas para a pessoa usuária mudam, mas a contagem de faces, arestas e vértices permanece a mesma. O leitor de tela deve reforçar a relação entre planos, linhas e cantos, porque essa é a base para reconhecer o hábito cristalográfico.

### Octaedro

Elementos geométricos: 8 faces triangulares, 12 arestas e 6 vértices.

Descrição acessível do canvas: O modelo tem duas pirâmides de base quadrada unidas pela base. Há um vértice superior, um vértice inferior e quatro vértices em volta da região central. As oito faces são triângulos; quando a peça gira, as faces visíveis alternam como planos inclinados ao redor do centro.

Como orientar a leitura: ao girar o modelo, as faces voltadas para a pessoa usuária mudam, mas a contagem de faces, arestas e vértices permanece a mesma. O leitor de tela deve reforçar a relação entre planos, linhas e cantos, porque essa é a base para reconhecer o hábito cristalográfico.

### Rombododecaedro

Elementos geométricos: 12 faces losangulares, 24 arestas e 14 vértices.

Descrição acessível do canvas: O sólido é formado por doze losangos. A forma lembra um poliedro arredondado por muitas faces inclinadas, com seis vértices mais destacados alinhados aos eixos principais e oito vértices associados aos cantos internos de uma referência cúbica. É útil para discutir formas ligadas ao sistema cúbico sem depender só do cubo.

Como orientar a leitura: ao girar o modelo, as faces voltadas para a pessoa usuária mudam, mas a contagem de faces, arestas e vértices permanece a mesma. O leitor de tela deve reforçar a relação entre planos, linhas e cantos, porque essa é a base para reconhecer o hábito cristalográfico.

### Piritoedro (Pentagonododecaedro)

Elementos geométricos: aproximadamente 12 faces pentagonais, 30 arestas e 20 vértices.

Descrição acessível do canvas: A página usa uma aproximação visual por dodecaedro. O sólido aparece com doze faces de cinco lados. A leitura acessível deve informar que, na visualização, cada face é pentagonal, formando uma peça fechada e bastante simétrica, associada ao hábito cristalino da pirita.

Como orientar a leitura: ao girar o modelo, as faces voltadas para a pessoa usuária mudam, mas a contagem de faces, arestas e vértices permanece a mesma. O leitor de tela deve reforçar a relação entre planos, linhas e cantos, porque essa é a base para reconhecer o hábito cristalográfico.

### Tetraedro

Elementos geométricos: 4 faces triangulares, 6 arestas e 4 vértices.

Descrição acessível do canvas: O modelo é uma pirâmide triangular: quatro faces triangulares se encontram em quatro vértices. Não há face quadrada. Ao girar, a pessoa usuária percebe que cada canto se conecta aos outros três por arestas, formando a menor estrutura fechada com faces planas.

Como orientar a leitura: ao girar o modelo, as faces voltadas para a pessoa usuária mudam, mas a contagem de faces, arestas e vértices permanece a mesma. O leitor de tela deve reforçar a relação entre planos, linhas e cantos, porque essa é a base para reconhecer o hábito cristalográfico.

## Sistema tetragonal

### Prisma tetragonal

Elementos geométricos: 6 faces, 12 arestas e 8 vértices.

Descrição acessível do canvas: O modelo é um prisma de base quadrada alongado em um eixo. Tem duas faces quadradas paralelas e quatro faces laterais retangulares. A forma comunica a relação a = a ≠ c: a base mantém simetria quadrada, mas a altura se diferencia.

Como orientar a leitura: ao girar o modelo, as faces voltadas para a pessoa usuária mudam, mas a contagem de faces, arestas e vértices permanece a mesma. O leitor de tela deve reforçar a relação entre planos, linhas e cantos, porque essa é a base para reconhecer o hábito cristalográfico.

### Prisma ditetragonal

Elementos geométricos: 10 faces, 24 arestas e 16 vértices.

Descrição acessível do canvas: O modelo é um prisma com base de oito lados. Há duas faces octogonais paralelas e oito faces retangulares laterais. A palavra ditetragonal indica duplicação visual de direções ao redor do eixo principal.

Como orientar a leitura: ao girar o modelo, as faces voltadas para a pessoa usuária mudam, mas a contagem de faces, arestas e vértices permanece a mesma. O leitor de tela deve reforçar a relação entre planos, linhas e cantos, porque essa é a base para reconhecer o hábito cristalográfico.

### Pirâmide tetragonal

Elementos geométricos: 5 faces, 8 arestas e 5 vértices.

Descrição acessível do canvas: A base é quadrada e quatro faces triangulares sobem até um vértice único. A leitura deve destacar a oposição entre a base plana de quatro lados e o ápice, que concentra as arestas laterais.

Como orientar a leitura: ao girar o modelo, as faces voltadas para a pessoa usuária mudam, mas a contagem de faces, arestas e vértices permanece a mesma. O leitor de tela deve reforçar a relação entre planos, linhas e cantos, porque essa é a base para reconhecer o hábito cristalográfico.

### Pirâmide ditetragonal

Elementos geométricos: 9 faces, 16 arestas e 9 vértices.

Descrição acessível do canvas: A base possui oito lados e oito faces triangulares convergem para um ápice. A forma lembra uma pirâmide mais facetada, com maior número de planos triangulares ao redor do eixo vertical.

Como orientar a leitura: ao girar o modelo, as faces voltadas para a pessoa usuária mudam, mas a contagem de faces, arestas e vértices permanece a mesma. O leitor de tela deve reforçar a relação entre planos, linhas e cantos, porque essa é a base para reconhecer o hábito cristalográfico.

### Bipirâmide tetragonal

Elementos geométricos: 8 faces, 12 arestas e 6 vértices.

Descrição acessível do canvas: Duas pirâmides de base quadrada estão unidas base com base. A região central forma uma cintura quadrada; há um ápice superior e um ápice inferior. As faces são triângulos.

Como orientar a leitura: ao girar o modelo, as faces voltadas para a pessoa usuária mudam, mas a contagem de faces, arestas e vértices permanece a mesma. O leitor de tela deve reforçar a relação entre planos, linhas e cantos, porque essa é a base para reconhecer o hábito cristalográfico.

### Bipirâmide ditetragonal

Elementos geométricos: 16 faces, 24 arestas e 10 vértices.

Descrição acessível do canvas: Duas pirâmides de base octogonal estão unidas pela cintura. O sólido tem oito vértices ao redor da faixa central, mais dois ápices. O aumento de faces reforça a simetria repetida ao redor do eixo principal.

Como orientar a leitura: ao girar o modelo, as faces voltadas para a pessoa usuária mudam, mas a contagem de faces, arestas e vértices permanece a mesma. O leitor de tela deve reforçar a relação entre planos, linhas e cantos, porque essa é a base para reconhecer o hábito cristalográfico.

## Sistema hexagonal

### Prisma hexagonal

Elementos geométricos: 8 faces, 18 arestas e 12 vértices.

Descrição acessível do canvas: O modelo tem duas bases hexagonais paralelas e seis faces retangulares laterais. A leitura deve enfatizar os seis lados da base e o eixo vertical alongado, típico de representações hexagonais.

Como orientar a leitura: ao girar o modelo, as faces voltadas para a pessoa usuária mudam, mas a contagem de faces, arestas e vértices permanece a mesma. O leitor de tela deve reforçar a relação entre planos, linhas e cantos, porque essa é a base para reconhecer o hábito cristalográfico.

### Prisma dihexagonal

Elementos geométricos: 14 faces, 36 arestas e 24 vértices.

Descrição acessível do canvas: O modelo usa bases de doze lados, com doze faces laterais. Visualmente é um prisma com contorno mais circular, porém ainda formado por arestas retas e faces planas.

Como orientar a leitura: ao girar o modelo, as faces voltadas para a pessoa usuária mudam, mas a contagem de faces, arestas e vértices permanece a mesma. O leitor de tela deve reforçar a relação entre planos, linhas e cantos, porque essa é a base para reconhecer o hábito cristalográfico.

### Pirâmide hexagonal

Elementos geométricos: 7 faces, 12 arestas e 7 vértices.

Descrição acessível do canvas: A base tem seis lados. Seis faces triangulares sobem até um ápice. O sólido mostra como uma base hexagonal pode convergir para um único ponto.

Como orientar a leitura: ao girar o modelo, as faces voltadas para a pessoa usuária mudam, mas a contagem de faces, arestas e vértices permanece a mesma. O leitor de tela deve reforçar a relação entre planos, linhas e cantos, porque essa é a base para reconhecer o hábito cristalográfico.

### Pirâmide dihexagonal

Elementos geométricos: 13 faces, 24 arestas e 13 vértices.

Descrição acessível do canvas: A base tem doze lados e doze faces triangulares se encontram no ápice. É uma pirâmide mais facetada, com muitas arestas irradiando do vértice superior.

Como orientar a leitura: ao girar o modelo, as faces voltadas para a pessoa usuária mudam, mas a contagem de faces, arestas e vértices permanece a mesma. O leitor de tela deve reforçar a relação entre planos, linhas e cantos, porque essa é a base para reconhecer o hábito cristalográfico.

### Bipirâmide hexagonal

Elementos geométricos: 12 faces, 18 arestas e 8 vértices.

Descrição acessível do canvas: Duas pirâmides de base hexagonal são unidas pela base. Há seis vértices na cintura central e dois ápices. As faces triangulares formam uma sequência contínua em torno do sólido.

Como orientar a leitura: ao girar o modelo, as faces voltadas para a pessoa usuária mudam, mas a contagem de faces, arestas e vértices permanece a mesma. O leitor de tela deve reforçar a relação entre planos, linhas e cantos, porque essa é a base para reconhecer o hábito cristalográfico.

### Bipirâmide dihexagonal

Elementos geométricos: 24 faces, 36 arestas e 14 vértices.

Descrição acessível do canvas: O modelo tem uma cintura com doze vértices, mais um ápice superior e um inferior. As vinte e quatro faces triangulares dão a impressão de uma forma estrelada e altamente facetada.

Como orientar a leitura: ao girar o modelo, as faces voltadas para a pessoa usuária mudam, mas a contagem de faces, arestas e vértices permanece a mesma. O leitor de tela deve reforçar a relação entre planos, linhas e cantos, porque essa é a base para reconhecer o hábito cristalográfico.

## Sistema trigonal (romboédrico)

### Prisma trigonal

Elementos geométricos: 5 faces, 9 arestas e 6 vértices.

Descrição acessível do canvas: O modelo possui duas bases triangulares e três faces laterais. A forma é curta e direta para mostrar a repetição triangular ao longo de uma altura.

Como orientar a leitura: ao girar o modelo, as faces voltadas para a pessoa usuária mudam, mas a contagem de faces, arestas e vértices permanece a mesma. O leitor de tela deve reforçar a relação entre planos, linhas e cantos, porque essa é a base para reconhecer o hábito cristalográfico.

### Prisma ditrigonal

Elementos geométricos: 8 faces, 18 arestas e 12 vértices.

Descrição acessível do canvas: O modelo tem duas bases hexagonais e seis faces laterais, usado aqui para representar a duplicação de direções trigonal. A leitura deve indicar que há mais faces laterais do que no prisma trigonal simples.

Como orientar a leitura: ao girar o modelo, as faces voltadas para a pessoa usuária mudam, mas a contagem de faces, arestas e vértices permanece a mesma. O leitor de tela deve reforçar a relação entre planos, linhas e cantos, porque essa é a base para reconhecer o hábito cristalográfico.

### Pirâmide trigonal

Elementos geométricos: 4 faces, 6 arestas e 4 vértices.

Descrição acessível do canvas: A base é triangular e três faces triangulares chegam a um ápice. Na prática, sua aparência é semelhante ao tetraedro, mas a leitura deve marcar a base triangular e o vértice superior.

Como orientar a leitura: ao girar o modelo, as faces voltadas para a pessoa usuária mudam, mas a contagem de faces, arestas e vértices permanece a mesma. O leitor de tela deve reforçar a relação entre planos, linhas e cantos, porque essa é a base para reconhecer o hábito cristalográfico.

### Bipirâmide trigonal

Elementos geométricos: 6 faces, 9 arestas e 5 vértices.

Descrição acessível do canvas: Duas pirâmides triangulares estão unidas pela base. Há três vértices na cintura central, um ápice superior e um ápice inferior. As seis faces são triângulos.

Como orientar a leitura: ao girar o modelo, as faces voltadas para a pessoa usuária mudam, mas a contagem de faces, arestas e vértices permanece a mesma. O leitor de tela deve reforçar a relação entre planos, linhas e cantos, porque essa é a base para reconhecer o hábito cristalográfico.

### Romboedro

Elementos geométricos: 6 faces losangulares, 12 arestas e 8 vértices.

Descrição acessível do canvas: O modelo é um paralelepípedo inclinado, com faces em forma de losango e ângulos diferentes de 90 graus. Ele lembra um cubo deformado, como se a parte superior tivesse sido deslocada lateralmente.

Como orientar a leitura: ao girar o modelo, as faces voltadas para a pessoa usuária mudam, mas a contagem de faces, arestas e vértices permanece a mesma. O leitor de tela deve reforçar a relação entre planos, linhas e cantos, porque essa é a base para reconhecer o hábito cristalográfico.

## Sistema rómbico (ortorrômbico)

### Prisma rómbico

Elementos geométricos: 6 faces, 12 arestas e 8 vértices.

Descrição acessível do canvas: O modelo é um paralelepípedo retangular com três dimensões diferentes. Todas as faces se encontram em ângulos retos, mas comprimento, largura e altura não são iguais.

Como orientar a leitura: ao girar o modelo, as faces voltadas para a pessoa usuária mudam, mas a contagem de faces, arestas e vértices permanece a mesma. O leitor de tela deve reforçar a relação entre planos, linhas e cantos, porque essa é a base para reconhecer o hábito cristalográfico.

### Pirâmide rómbica

Elementos geométricos: 5 faces, 8 arestas e 5 vértices.

Descrição acessível do canvas: A base é um losango ou retângulo alongado, e quatro faces triangulares sobem até um ápice. A base não é quadrada regular; uma direção é visualmente mais longa que a outra.

Como orientar a leitura: ao girar o modelo, as faces voltadas para a pessoa usuária mudam, mas a contagem de faces, arestas e vértices permanece a mesma. O leitor de tela deve reforçar a relação entre planos, linhas e cantos, porque essa é a base para reconhecer o hábito cristalográfico.

### Bipirâmide rómbica

Elementos geométricos: 8 faces, 12 arestas e 6 vértices.

Descrição acessível do canvas: Duas pirâmides com cintura losangular são unidas pela base. Há quatro vértices na cintura e dois ápices. A forma enfatiza desigualdade entre os eixos horizontais.

Como orientar a leitura: ao girar o modelo, as faces voltadas para a pessoa usuária mudam, mas a contagem de faces, arestas e vértices permanece a mesma. O leitor de tela deve reforçar a relação entre planos, linhas e cantos, porque essa é a base para reconhecer o hábito cristalográfico.

## Sistema monoclínico

### Prisma monoclínico

Elementos geométricos: 6 faces, 12 arestas e 8 vértices.

Descrição acessível do canvas: O modelo é um paralelepípedo inclinado em uma direção. Parece uma caixa deformada: uma face superior desloca-se em relação à inferior, criando um ângulo diferente de 90 graus em uma das direções. Essa inclinação é a informação visual central.

Como orientar a leitura: ao girar o modelo, as faces voltadas para a pessoa usuária mudam, mas a contagem de faces, arestas e vértices permanece a mesma. O leitor de tela deve reforçar a relação entre planos, linhas e cantos, porque essa é a base para reconhecer o hábito cristalográfico.

## Observações para implementação

Este texto pode ser usado como arquivo separado para a animação de Geometria Cristalográfica. A implementação ideal é atualizar a descrição conforme a figura selecionada no menu lateral, usando o nome do sólido, a contagem de faces, arestas e vértices e a descrição acessível correspondente.

Para acessibilidade cromática, não usar apenas “azul”, “escuro” ou “claro” como informação principal. A cor pode ajudar, mas a descrição precisa informar forma, quantidade, posição e relação geométrica.
