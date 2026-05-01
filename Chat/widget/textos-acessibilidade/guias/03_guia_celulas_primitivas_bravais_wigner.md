# Guia — Células Primitivas, Sistemas de Bravais e Célula de Wigner-Seitz

## Texto acessível principal

Este guia apresenta uma leitura geométrica de redes cristalinas em duas dimensões. O canvas mostra pontos de rede, vetores de translação, células convencionais, células primitivas e a construção da célula de Wigner-Seitz. A visualização é didática: ela não representa átomos específicos de um composto, mas sim a lógica geométrica usada para repetir uma estrutura no espaço.

A cor azul-ciano costuma marcar pontos de rede e células convencionais. A cor roxa destaca células primitivas, vetores alternativos ou regiões principais de análise. A cor verde aparece em linhas auxiliares, trajetos de translação ou pontos intermediários. A cor rosa ou vermelha pode destacar conexões, vizinhos ou segmentos usados na construção. Para acessibilidade, cada cor deve ser lida junto de sua função: ponto de rede, vetor, célula primitiva, célula convencional, mediatriz ou região de Wigner-Seitz.

## Descrição geral do canvas

O canvas é uma visualização plana. Os pontos representam posições equivalentes de uma rede. Linhas e polígonos delimitam possíveis células. Setas indicam vetores de translação. Quando um polígono é destacado, ele representa uma região que pode ser repetida para preencher o plano sem deixar lacunas. Quando a célula de Wigner-Seitz aparece, ela corresponde à região do espaço mais próxima de um ponto de rede central do que de qualquer outro ponto de rede.

## Descrição por etapa

### 1. O que é célula unitária e por que ela muda de aparência

A imagem mostra uma rede de pontos igualmente distribuídos e duas possíveis células desenhadas sobre ela. Uma célula pode ser representada por dois vetores; outra célula pode usar uma combinação diferente de vetores e ainda assim repetir a mesma rede.

Texto acessível sugerido: “O canvas mostra vários pontos de rede em um plano. Sobre esses pontos, aparecem duas células possíveis. A primeira é delimitada por vetores mais diretos; a segunda usa vetores combinados. As duas podem reproduzir a mesma rede por repetição, mostrando que a célula unitária não é única.”

### 2. Célula unitária em uma dimensão

A etapa reduz o problema a uma linha com pontos igualmente espaçados. Cada intervalo repetido entre pontos pode ser entendido como uma célula unitária unidimensional.

Texto acessível sugerido: “A visualização mostra uma linha horizontal com pontos repetidos em intervalos regulares. Um segmento entre dois pontos vizinhos é destacado como célula. A ideia central é que uma repetição simples, em uma única direção, já define periodicidade.”

### 3. Célula primitiva: o menor tijolo que tessela

O canvas compara uma célula convencional e uma célula primitiva. A célula primitiva contém exatamente um ponto de rede equivalente por repetição, mesmo que sua forma seja menos intuitiva.

Texto acessível sugerido: “A tela mostra uma célula convencional maior e uma célula primitiva destacada. A célula primitiva é o menor bloco capaz de preencher o plano por translação. Ela pode ter formato inclinado, mas continua reproduzindo a mesma rede.”

### 4. Vetores da rede: como a translação é escrita

A etapa mostra dois vetores de base, geralmente chamados a1 e a2. Uma seta resultante aponta para outro ponto da rede, mostrando que qualquer ponto pode ser alcançado por combinações inteiras desses vetores.

Texto acessível sugerido: “Duas setas partem de uma origem: a1 e a2. Linhas auxiliares mostram deslocamentos repetidos. A seta resultante R aponta para um ponto da rede obtido pela soma de múltiplos inteiros de a1 e a2.”

### 5. Troca de base: mudam os vetores, não a rede

A imagem mostra dois conjuntos de vetores sobre a mesma malha de pontos. A rede não muda; muda apenas a forma de descrevê-la.

Texto acessível sugerido: “O canvas mostra a mesma rede de pontos com duas bases vetoriais diferentes. Uma base aparece em azul-ciano e outra em roxo. Embora os vetores tenham orientação e tamanho diferentes, eles descrevem a mesma periodicidade.”

### 6. Rede retangular centrada: mesma estrutura, duas leituras

A etapa compara uma célula convencional retangular centrada com uma célula primitiva inclinada. A célula convencional é mais fácil de reconhecer visualmente, mas a primitiva é menor.

Texto acessível sugerido: “A rede retangular centrada mostra pontos nos cantos e também no centro do retângulo. Uma célula convencional envolve o retângulo inteiro; uma célula primitiva inclinada usa parte menor da rede e ainda consegue preencher o plano por repetição.”

### 7. Mapa mental: quando convencional é igual à primitiva e quando não é

A visualização resume que, em algumas redes, a célula convencional já é primitiva; em outras, a célula convencional contém mais de um ponto de rede e precisa ser diferenciada da célula primitiva.

Texto acessível sugerido: “A tela apresenta uma célula de referência e uma célula convencional sobre a mesma rede. Quando a célula convencional contém apenas um ponto de rede efetivo, ela também é primitiva. Quando contém mais de um ponto de rede, ela é útil para mostrar simetria, mas não é a menor célula possível.”

### 8. Wigner-Seitz ou Voronoi em 2D: construção passo a passo

A etapa mostra um ponto central e seus vizinhos. Linhas são traçadas do ponto central até pontos vizinhos; depois surgem mediatrizes perpendiculares. A região fechada ao redor do ponto central é a célula de Wigner-Seitz.

Texto acessível sugerido: “O canvas destaca um ponto central em roxo. Pontos vizinhos aparecem ao redor. Segmentos ligam o ponto central aos vizinhos e, no meio desses segmentos, são traçadas linhas perpendiculares. A interseção dessas linhas delimita uma região fechada: todos os pontos dentro dela estão mais próximos do ponto central do que dos demais pontos da rede.”

## Conceitos visuais essenciais

### Pontos de rede

São posições equivalentes por translação. Eles não precisam representar átomos específicos; representam a repetição geométrica.

### Vetores de translação

São setas que indicam como sair de um ponto de rede e chegar a outro ponto equivalente. Usar a1 e a2 permite construir qualquer ponto da rede em duas dimensões.

### Célula convencional

É uma célula escolhida para evidenciar simetria. Pode ser maior que a célula primitiva.

### Célula primitiva

É a menor célula que, por translação, reconstrói toda a rede. Em duas dimensões, sua área corresponde a uma unidade fundamental da rede.

### Célula de Wigner-Seitz

É a região mais próxima de um ponto de rede específico do que de qualquer outro. Ela é construída por mediatrizes entre o ponto central e seus vizinhos.

## Observações inclusivas

Em leitor de tela, evitar expressões como “essa célula aqui” sem referência espacial. Usar descrições como “polígono roxo inclinado”, “retângulo azul-ciano”, “ponto central” e “pontos vizinhos ao redor”. Para pessoas com daltonismo, as cores devem ser redundantes com rótulos e padrões: célula primitiva, célula convencional, vetor a1, vetor a2, mediatriz e região final. Para baixa visão, a descrição deve deixar claro que as linhas auxiliares não são ligações químicas; elas são construções geométricas para entender periodicidade.
