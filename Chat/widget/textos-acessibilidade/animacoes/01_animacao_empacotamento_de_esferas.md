# Texto acessível — Animação 01 — Empacotamento de Esferas

Categoria: Animação. Pasta analisada: Ensino/Animacao/buracos-e-empacotamento. Página principal: index.html. Elemento visual principal: canvas com id cv.

Objetivo do texto: explicar para leitores de tela o que aparece no canvas, com foco em interstícios, buracos cristalinos e empilhamento de camadas. O texto foi organizado por modo, porque essa animação muda o conteúdo visual de acordo com o seletor “Modo”.

## Descrição geral da tela

A página apresenta uma visualização interativa de esferas usadas como modelo para átomos ou íons em empacotamentos cristalinos. O usuário pode alternar entre modos de buracos, uma camada hexagonal isolada e empilhamentos de camadas triangulares ou cúbicas. O canvas ocupa a maior parte da tela e mostra esferas com aparência tridimensional, iluminação simulada, transparência ajustável e, quando habilitadas, arestas que conectam centros ou delimitam relações geométricas.

Os controles superiores alteram o modo, o zoom, o tamanho dos átomos, a opacidade, a aparência sólida ou translúcida, a largura da camada e a exibição de arestas. Nos modos de empilhamento, o botão “Adicionar camada” acrescenta uma nova camada à pilha; o botão “Reset” retorna à primeira camada.

## Cores e convenções visuais

Nos modos de empilhamento, as camadas são identificadas por letras. A camada A aparece em vermelho; a camada B aparece em tom claro amarelado ou creme; a camada C aparece em azul. Essa diferenciação cromática serve para mostrar se uma nova camada foi colocada exatamente sobre a anterior, sobre um primeiro conjunto de interstícios ou sobre um segundo conjunto de interstícios.

A leitura conceitual mais importante não é apenas a cor, mas a posição relativa entre as camadas: A sobre A indica alinhamento vertical; B sobre A indica ocupação de um conjunto de cavidades/interstícios; C indica uma terceira posição, distinta de A e B, associada a outro conjunto de cavidades.

## Modo: Buraco Octaédrico

Texto curto para aria-label: Visualização do buraco octaédrico formado por seis esferas ao redor de um espaço central.

Descrição detalhada: O canvas é dividido em dois painéis. À esquerda, a área “Animação atual” mostra seis esferas distribuídas ao redor de um centro vazio: duas em posições opostas no eixo horizontal, duas em posições opostas no eixo vertical e duas em profundidade. As arestas conectam as esferas de modo a formar a geometria de um octaedro. O espaço central, sem esfera desenhada, representa o buraco octaédrico.

À direita, a representação 3D coloca esse buraco dentro de uma estrutura cúbica de face centrada. A célula aparece como um cubo translúcido com esferas nos vértices e nos centros das faces. Um poliedro rosado ou translúcido destaca a região octaédrica no interior da célula. A mensagem científica é que o interstício octaédrico é cercado por seis esferas vizinhas, portanto tem coordenação 6.

Foco acessível: orientar que o buraco não é uma esfera visível, mas o vazio geométrico entre seis esferas. A pessoa deve imaginar uma cavidade no centro de um octaedro, com uma esfera em cada vértice do poliedro.

## Modo: Buraco Tetraédrico

Texto curto para aria-label: Visualização do buraco tetraédrico formado por quatro esferas ao redor de uma cavidade menor.

Descrição detalhada: O canvas também é dividido em dois painéis. À esquerda, a área “Animação atual” mostra quatro esferas posicionadas como os vértices de um tetraedro. As arestas ligam as esferas entre si e desenham uma pirâmide triangular. O espaço interno entre as quatro esferas representa o buraco tetraédrico.

À direita, a representação 3D mostra o buraco dentro de uma estrutura cúbica de face centrada. O poliedro destacado em verde ou azul-esverdeado indica a cavidade tetraédrica associada a quatro posições vizinhas. A mensagem científica é que o interstício tetraédrico é menor que o octaédrico e possui coordenação 4.

Foco acessível: explicar que o buraco tetraédrico é uma cavidade cercada por quatro esferas, como se o espaço vazio estivesse no centro de uma pequena pirâmide triangular.

## Modo: Camada Hexagonal

Texto curto para aria-label: Camada plana hexagonal com uma esfera central cercada por seis vizinhas.

Descrição detalhada: O canvas mostra uma única camada plana. Há uma esfera central e seis esferas ao redor, formando um arranjo hexagonal. As arestas ligam a esfera central às vizinhas e também conectam as vizinhas entre si, criando uma malha de triângulos equiláteros.

Os espaços entre três esferas tangentes formam interstícios triangulares. Esses interstícios aparecem alternados: alguns apontam para uma direção e outros para a direção oposta. Essa alternância é essencial porque, ao adicionar uma segunda camada, ela pode ocupar apenas um dos conjuntos de cavidades triangulares, formando a posição B. Uma terceira camada pode retornar à posição A ou ocupar outro conjunto de cavidades, formando a posição C.

Foco acessível: a camada hexagonal é a “base” dos empacotamentos compactos. O que importa é perceber que as esferas não deixam espaços quadrados; elas deixam pequenas cavidades triangulares entre grupos de três esferas.

## Modo: AAA Triangular

Texto curto para aria-label: Empilhamento AAA Triangular, com sequência de camadas A, A, A, A...

Descrição detalhada: As camadas triangulares são empilhadas sempre na mesma posição A. Ao usar “Adicionar camada”, a nova camada aparece diretamente acima da camada anterior, com as esferas alinhadas verticalmente. Como as posições se repetem, os interstícios triangulares também ficam alinhados de um nível para outro, criando canais ou vazios repetitivos em vez de uma compactação alternada.

Comportamento do botão “Adicionar camada”: o estado inicial mostra apenas a camada A. Cada clique adiciona uma nova camada no topo da pilha, seguindo a sequência A, A, A, A... A largura da camada, controlada por N, define quantas esferas aparecem na base e quantas cavidades/interstícios podem ser preenchidos nas camadas seguintes.

Foco acessível: Esse modo serve para comparar um empilhamento repetido e menos deslocado com os modos compactos. A descrição deve destacar que a segunda camada não ocupa as cavidades da primeira; ela simplesmente replica a mesma malha triangular em altura.

## Modo: ABC Triangular

Texto curto para aria-label: Empilhamento ABC Triangular, com sequência de camadas A, B, C, A, B, C...

Descrição detalhada: A primeira camada é triangular e fica na posição A. Ao adicionar a segunda camada, as esferas ocupam um conjunto de interstícios triangulares da camada A, formando a posição B. Ao adicionar a terceira camada, as esferas ocupam outro conjunto de interstícios, diferente de A e B, formando C. A quarta camada volta para A.

Comportamento do botão “Adicionar camada”: o estado inicial mostra apenas a camada A. Cada clique adiciona uma nova camada no topo da pilha, seguindo a sequência A, B, C, A, B, C... A largura da camada, controlada por N, define quantas esferas aparecem na base e quantas cavidades/interstícios podem ser preenchidos nas camadas seguintes.

Foco acessível: Esse modo representa a lógica de empilhamento compacto cúbico, também associado ao padrão ABC. A descrição deve enfatizar que cada camada nova escolhe cavidades que não ficam exatamente sobre a camada anterior, reduzindo vazios e produzindo maior compactação.

## Modo: ABA Triangular

Texto curto para aria-label: Empilhamento ABA Triangular, com sequência de camadas A, B, A, B...

Descrição detalhada: A primeira camada está na posição A. A segunda camada ocupa um conjunto de interstícios triangulares e recebe a letra B. A terceira camada retorna para a posição A, ficando alinhada verticalmente com a primeira. A sequência continua alternando A e B.

Comportamento do botão “Adicionar camada”: o estado inicial mostra apenas a camada A. Cada clique adiciona uma nova camada no topo da pilha, seguindo a sequência A, B, A, B... A largura da camada, controlada por N, define quantas esferas aparecem na base e quantas cavidades/interstícios podem ser preenchidos nas camadas seguintes.

Foco acessível: Esse modo representa a lógica do empacotamento hexagonal compacto. A descrição deve destacar que a terceira camada não cria uma nova posição C: ela retorna sobre a primeira, criando repetição ABAB.

## Modo: AAA Cúbica

Texto curto para aria-label: Empilhamento AAA Cúbica, com sequência de camadas A, A, A, A...

Descrição detalhada: As camadas cúbicas são formadas por uma malha quadrada de esferas. Ao adicionar camada, a próxima malha A surge diretamente acima da anterior, sem deslocamento lateral. As colunas de esferas permanecem alinhadas, e os espaços entre elas também se repetem verticalmente.

Comportamento do botão “Adicionar camada”: o estado inicial mostra apenas a camada A. Cada clique adiciona uma nova camada no topo da pilha, seguindo a sequência A, A, A, A... A largura da camada, controlada por N, define quantas esferas aparecem na base e quantas cavidades/interstícios podem ser preenchidos nas camadas seguintes.

Foco acessível: Esse modo é útil para mostrar a diferença entre empilhar redes quadradas sem deslocamento e empilhar redes deslocadas. O foco está nos espaços quadrados alinhados entre camadas.

## Modo: ABA Cúbica

Texto curto para aria-label: Empilhamento ABA Cúbica, com sequência de camadas A, B, A, B...

Descrição detalhada: A primeira camada é uma grade quadrada A. A segunda camada B aparece deslocada para ocupar regiões entre quatro esferas da camada A. A terceira camada retorna para A, ficando alinhada com a primeira. O padrão alternado mostra como uma camada pode assentar sobre cavidades da anterior e depois repetir a posição inicial.

Comportamento do botão “Adicionar camada”: o estado inicial mostra apenas a camada A. Cada clique adiciona uma nova camada no topo da pilha, seguindo a sequência A, B, A, B... A largura da camada, controlada por N, define quantas esferas aparecem na base e quantas cavidades/interstícios podem ser preenchidos nas camadas seguintes.

Foco acessível: O foco acessível é explicar que B não fica exatamente sobre A; B se encaixa nos espaços entre as esferas da camada anterior. Quando A retorna, a pilha ganha repetição alternada.

## Modo: ABC Cúbica

Texto curto para aria-label: Empilhamento ABC Cúbica, com sequência de camadas A, B, C, A, B, C...

Descrição detalhada: A primeira camada é uma grade quadrada A. A segunda camada B é deslocada e ocupa um primeiro conjunto de espaços entre esferas. A terceira camada C ocupa outro conjunto de posições, distinto de A e de B. Ao continuar adicionando camadas, a sequência retorna para A e repete o ciclo.

Comportamento do botão “Adicionar camada”: o estado inicial mostra apenas a camada A. Cada clique adiciona uma nova camada no topo da pilha, seguindo a sequência A, B, C, A, B, C... A largura da camada, controlada por N, define quantas esferas aparecem na base e quantas cavidades/interstícios podem ser preenchidos nas camadas seguintes.

Foco acessível: A descrição deve destacar a progressão de três posições diferentes. A leitura visual fica mais clara quando se acompanha a sequência das cores: vermelho para A, tom claro para B e azul para C.

## Texto geral para o botão “Adicionar camada”

Quando o modo atual é de empilhamento, o botão “Adicionar camada” acrescenta uma nova camada de esferas acima da pilha existente. A nova camada pode repetir a posição A ou ocupar uma posição B ou C, dependendo do modo selecionado. O ponto principal é observar se as esferas novas ficam alinhadas com as de baixo ou se encaixam nos interstícios deixados pela camada anterior. Quando a camada encaixa nos interstícios, a pilha representa maior aproveitamento do espaço.

## Texto geral para “Reset”

O botão “Reset” remove as camadas adicionadas e retorna a visualização ao estado inicial, com apenas a primeira camada A. Isso permite recomeçar a análise do empilhamento desde a base.
