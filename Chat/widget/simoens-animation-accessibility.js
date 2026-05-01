(function () {
  var MAP = {
  "ensino/": {
    "title": "Página Ensino",
    "type": "catálogo",
    "summary": "Lista os recursos didáticos do SiMoEns por tipo: visualizações, guias, exercícios e jogos.",
    "visual3d": "Não há canvas 3D nesta página; a interação principal está nos cards do catálogo.",
    "visual2d": "Os cards exibem imagem, título e descrição curta de cada recurso.",
    "animations": [
      "Filtro por categoria, busca por nome e alternância de conteúdos protegidos por senha."
    ],
    "stages": [
      "Observe o campo de busca e os filtros.",
      "Escolha um card pelo título ou tipo de atividade.",
      "Use Enter no card selecionado para abrir o recurso."
    ],
    "controls": [
      "Campo de busca",
      "Filtros por categoria",
      "Botão de mostrar ou ocultar apps protegidos"
    ],
    "glossary": []
  },
  "ensino/animacao/buracos-e-empacotamento/": {
    "title": "Empacotamento, Buracos e Camadas",
    "type": "visualização",
    "summary": "Mostra como esferas se organizam em camadas e como surgem buracos tetraédricos e octaédricos em empacotamentos cristalinos.",
    "visual3d": "O canvas exibe esferas em arranjo cristalino, camadas A, B e C, buracos entre esferas e mudanças de perspectiva para comparar empacotamentos.",
    "visual2d": "A visualização 2D aparece como apoio conceitual nos textos e controles, destacando modo, raio, espaçamento e camadas.",
    "animations": [
      "Adição de camadas no empacotamento.",
      "Exibição ou ocultação de arestas, sólido e buracos.",
      "Alteração de raio, afastamento e transparência para perceber espaços vazios."
    ],
    "stages": [
      "Primeiro aparece uma camada de esferas como base do empacotamento.",
      "Depois novas camadas são adicionadas, mostrando a diferença entre arranjos ABA e ABC.",
      "Os buracos tetraédricos aparecem em regiões menores entre quatro esferas próximas.",
      "Os buracos octaédricos aparecem entre seis esferas em uma cavidade mais ampla.",
      "Ao rotacionar ou alterar espaçamentos, a relação entre coordenação, ocupação e vazios fica mais clara."
    ],
    "controls": [
      "Selecionar modo",
      "Ajustar raio",
      "Ajustar espaçamento",
      "Adicionar camada",
      "Mostrar arestas",
      "Reiniciar visualização"
    ],
    "glossary": [
      "empacotamento",
      "buraco tetraédrico",
      "buraco octaédrico",
      "coordenação",
      "camada"
    ]
  },
  "ensino/animacao/geometria-cristalografica/": {
    "title": "Geometria Cristalográfica",
    "type": "visualização",
    "summary": "Compara os sistemas cristalinos e a forma geométrica das células unitárias.",
    "visual3d": "O canvas mostra células 3D com arestas, faces e eixos, permitindo observar sistemas como cúbico, tetragonal, ortorrômbico, monoclínico, triclínico, hexagonal e romboédrico.",
    "visual2d": "A parte 2D está nos controles de cor, preenchimento e rotação, que funcionam como legenda operacional do modelo.",
    "animations": [
      "Rotação nos eixos X, Y e Z.",
      "Ativação de faces preenchidas e alteração de cores.",
      "Ajuste para enquadrar a célula na tela."
    ],
    "stages": [
      "Identifique a célula exibida pelo sistema cristalino selecionado.",
      "Observe os comprimentos relativos dos eixos a, b e c.",
      "Observe os ângulos entre os eixos.",
      "Rotacione a estrutura para perceber que a classificação depende da geometria espacial.",
      "Use preenchimento e arestas para diferenciar volume da célula e contorno."
    ],
    "controls": [
      "Rotação X",
      "Rotação Y",
      "Rotação Z",
      "Cor das arestas",
      "Preenchimento de faces",
      "Resetar",
      "Ajustar ao enquadramento"
    ],
    "glossary": [
      "sistema cristalino",
      "célula unitária",
      "eixo cristalográfico",
      "ângulo interaxial"
    ]
  },
  "ensino/animacao/geometria-molecular/": {
    "title": "Geometria Molecular 3D",
    "type": "visualização",
    "summary": "Representa arranjos moleculares em 3D, incluindo ligações, átomos ligantes, elétrons livres e ângulos.",
    "visual3d": "O canvas principal mostra átomo central, ligantes, pares de elétrons livres e ligações em posições tridimensionais compatíveis com o arranjo selecionado.",
    "visual2d": "A camada 2D de ângulos sobreposta indica valores angulares e a miniatura de eixos ajuda na orientação espacial.",
    "animations": [
      "Troca entre geometrias moleculares.",
      "Rotação e aproximação do modelo.",
      "Exibição de ângulos e pares livres.",
      "Ajuste visual de tamanho, saturação, luz e escala."
    ],
    "stages": [
      "Escolha uma geometria molecular.",
      "Observe o átomo central no meio da estrutura.",
      "Compare a posição dos ligantes e dos pares de elétrons livres.",
      "Use os ângulos para relacionar a forma com o modelo VSEPR.",
      "Rotacione a estrutura para perceber quais grupos estão fora do plano da tela."
    ],
    "controls": [
      "Selecionar geometria",
      "Comprimento de ligação",
      "Tamanho dos átomos",
      "Escala dos pares livres",
      "Mostrar ângulos",
      "Rotação/arraste no canvas"
    ],
    "glossary": [
      "VSEPR",
      "par eletrônico",
      "par livre",
      "ângulo de ligação",
      "geometria molecular"
    ]
  },
  "ensino/animacao/redes-cristalinas/": {
    "title": "Redes Cristalinas",
    "type": "visualização",
    "summary": "Mostra redes e estruturas cristalinas formadas por repetição espacial de células e pontos de rede.",
    "visual3d": "O canvas exibe conjuntos de átomos ou pontos repetidos em 3D, podendo mostrar célula isolada, faces, arestas, empacotamentos e estruturas selecionadas.",
    "visual2d": "Os controles funcionam como leitura 2D da cena: estrutura, número de células, raio, espaçamento, luz e filtros de visualização.",
    "animations": [
      "Troca da estrutura cristalina.",
      "Mudança do número de células repetidas.",
      "Ajuste de raio e espaçamento.",
      "Exibição de uma face ou da célula completa.",
      "Modos introdutórios de camadas e Wigner-Seitz quando disponíveis."
    ],
    "stages": [
      "Comece observando a célula unitária isolada.",
      "Aumente o número de células para ver a repetição periódica.",
      "Ative arestas e faces para entender limites da célula.",
      "Compare estruturas diferentes para perceber mudanças na posição dos átomos.",
      "Use modos de camada para observar como a rede surge por empilhamento."
    ],
    "controls": [
      "Selecionar estrutura",
      "Número de células",
      "Raio",
      "Espaçamento",
      "Luz",
      "Mostrar arestas",
      "Somente célula",
      "Selecionar face"
    ],
    "glossary": [
      "rede cristalina",
      "ponto de rede",
      "translação",
      "célula unitária",
      "empacotamento"
    ]
  },
  "ensino/animacao/simetria-e-formula-unitaria/": {
    "title": "Simetria e Fórmula Unitária",
    "type": "hub",
    "summary": "Página de entrada para módulos de translação, simetria e contagem fracionária em células unitárias.",
    "visual3d": "O hub não possui canvas principal; ele direciona para visualizações específicas sobre células, frações, órbitas e modelos.",
    "visual2d": "A visualização 2D aparece como botões de navegação entre módulos.",
    "animations": [
      "Troca de abas/módulos.",
      "Abertura de visualizações específicas de contagem e simetria."
    ],
    "stages": [
      "Escolha um módulo no hub.",
      "Use células para visualizar translação.",
      "Use frações para entender contribuições de vértices, arestas, faces e interior.",
      "Use órbitas para relacionar simetria e repetição."
    ],
    "controls": [
      "Abas do hub",
      "Links para módulos internos"
    ],
    "glossary": [
      "simetria",
      "fórmula unitária",
      "fração",
      "translação"
    ]
  },
  "ensino/animacao/simetria-e-formula-unitaria/views/celulas/": {
    "title": "Translação — Células Unitárias",
    "type": "visualização",
    "summary": "Mostra como uma célula unitária se repete por translação e como a estrutura se organiza no espaço.",
    "visual3d": "O canvas mostra uma cena 3D com célula unitária, rede de repetição e objetos posicionados por translação nos eixos.",
    "visual2d": "Os controles 2D permitem alterar deslocamento nos eixos, tipo de célula, preset e parâmetros de contagem.",
    "animations": [
      "Translação em X, Y e Z.",
      "Mudança de tipo de célula e preset.",
      "Exibição da rede de repetição."
    ],
    "stages": [
      "Observe a célula inicial.",
      "Ajuste tx, ty e tz para deslocar a repetição.",
      "Ative a rede para perceber a periodicidade.",
      "Compare presets para entender como a fórmula depende da posição dos átomos."
    ],
    "controls": [
      "Translação X",
      "Translação Y",
      "Translação Z",
      "Mostrar rede",
      "Tipo de célula",
      "Preset",
      "Zoom"
    ],
    "glossary": [
      "translação",
      "periodicidade",
      "célula unitária"
    ]
  },
  "ensino/animacao/simetria-e-formula-unitaria/views/fracoes/": {
    "title": "Contagem por Frações",
    "type": "visualização",
    "summary": "Explica a contribuição fracionária dos átomos conforme sua posição na célula unitária.",
    "visual3d": "O canvas mostra a célula 3D e os pontos em vértices, arestas, faces e centro, relacionando posição espacial à fração contada.",
    "visual2d": "A parte 2D aparece nos seletores de simetria e frações, usados para calcular a contribuição total.",
    "animations": [
      "Troca de célula e preset.",
      "Destaque de vértices, arestas, faces e centro.",
      "Atualização da contagem por fração."
    ],
    "stages": [
      "Localize os átomos nos vértices.",
      "Observe que vértices são compartilhados por oito células.",
      "Compare arestas, faces e centro.",
      "Some as contribuições para obter a fórmula unitária."
    ],
    "controls": [
      "Tipo de célula",
      "Zoom",
      "Preset",
      "Simetria de vértices",
      "Simetria de arestas",
      "Simetria de faces",
      "Centro"
    ],
    "glossary": [
      "fração",
      "vértice",
      "aresta",
      "face",
      "fórmula mínima"
    ]
  },
  "ensino/animacao/simetria-e-formula-unitaria/views/orbits/": {
    "title": "Método da Simetria de Translação",
    "type": "visualização",
    "summary": "Relaciona grupos equivalentes de posições por simetria e translação para apoiar a contagem estrutural.",
    "visual3d": "O canvas mostra a célula 3D com grupos de posições equivalentes, permitindo identificar órbitas de vértices, faces, arestas e centro.",
    "visual2d": "A parte 2D está nos seletores que ligam ou desligam grupos de posições e elementos.",
    "animations": [
      "Ativação de grupos de posições.",
      "Troca de elementos em posições equivalentes.",
      "Mudança de célula e zoom."
    ],
    "stages": [
      "Escolha o tipo de célula.",
      "Ative um grupo de posições equivalentes.",
      "Observe como a simetria repete os pontos.",
      "Relacione as posições equivalentes com a contagem total."
    ],
    "controls": [
      "Tipo de célula",
      "Zoom",
      "Grupos de vértice",
      "Grupos de face",
      "Grupos de aresta",
      "Seleção de elemento"
    ],
    "glossary": [
      "órbita",
      "posição equivalente",
      "simetria de translação"
    ]
  },
  "ensino/animacao/simetria-e-formula-unitaria/views/cubicas/": {
    "title": "Estruturas Cúbicas SC/BCC/FCC",
    "type": "visualização",
    "summary": "Compara estruturas cúbicas simples, cúbica de corpo centrado e cúbica de face centrada.",
    "visual3d": "A visualização apresenta modelos 3D renderizados da célula cúbica e das posições atômicas características.",
    "visual2d": "Os controles 2D permitem selecionar SC, BCC ou FCC e reiniciar a vista.",
    "animations": [
      "Troca entre SC, BCC e FCC.",
      "Reset da visualização."
    ],
    "stages": [
      "Observe a cúbica simples com átomos nos vértices.",
      "Compare com a BCC, que inclui átomo no corpo.",
      "Compare com a FCC, que inclui átomos nas faces.",
      "Relacione cada estrutura à contagem por célula."
    ],
    "controls": [
      "Selecionar estrutura",
      "Resetar"
    ],
    "glossary": [
      "SC",
      "BCC",
      "FCC",
      "cúbica"
    ]
  },
  "ensino/animacao/simetria-e-formula-unitaria/views/modelos/": {
    "title": "Modelos 3D — Posições na Célula",
    "type": "visualização",
    "summary": "Mostra posições típicas dentro da célula unitária para apoiar a leitura espacial e a contagem.",
    "visual3d": "A visualização 3D destaca modelos de posições, como vértice, aresta, face e interior da célula.",
    "visual2d": "Os controles 2D permitem escolher o modelo e reiniciar a cena.",
    "animations": [
      "Troca de modelo de posição.",
      "Reset da visualização."
    ],
    "stages": [
      "Escolha uma posição.",
      "Observe se ela está no limite ou no interior da célula.",
      "Relacione a posição com o número de células que a compartilham."
    ],
    "controls": [
      "Selecionar posição",
      "Resetar"
    ],
    "glossary": [
      "posição cristalográfica",
      "compartilhamento",
      "contagem"
    ]
  },
  "ensino/animacao/visualizador_de_hidrogenoides/": {
    "title": "Visualizador de Hidrogenoides",
    "type": "visualização",
    "summary": "Mostra orbitais hidrogenoides com nuvem 3D, função de onda, densidade eletrônica e distribuição radial.",
    "visual3d": "O canvas 3D exibe a nuvem de pontos do orbital, com cor/fase e tamanho ajustáveis, além de eixos de orientação quando ativados.",
    "visual2d": "Os canvases 2D mostram função de onda, densidade eletrônica e gráfico radial associados ao orbital escolhido.",
    "animations": [
      "Troca de n e orbital.",
      "Navegação anterior/próximo.",
      "Alteração de zoom, tamanho dos pontos e qualidade.",
      "Mudança de modo de cor e eixos."
    ],
    "stages": [
      "Selecione o número quântico e o orbital.",
      "Observe a forma 3D da densidade.",
      "Compare regiões positivas e negativas quando houver modo de fase.",
      "Leia os gráficos 2D para relacionar forma espacial e função matemática.",
      "Use qualidade e tamanho dos pontos para tornar a nuvem mais legível."
    ],
    "controls": [
      "Selecionar n",
      "Selecionar orbital",
      "Anterior/próximo",
      "Zoom",
      "Tamanho dos pontos",
      "Qualidade",
      "Modo de cor",
      "Eixos"
    ],
    "glossary": [
      "orbital",
      "função de onda",
      "densidade eletrônica",
      "número quântico",
      "radial"
    ]
  },
  "ensino/animacao/visualizador_orbitais/": {
    "title": "Visualizador de Orbitais Atômicos e Moleculares",
    "type": "visualização",
    "summary": "Permite compor e comparar formas de orbitais com estruturas blobby/metaball, cores, fases e lóbulos.",
    "visual3d": "O canvas 3D mostra lóbulos de orbitais e partes editáveis em torno de centros, com posições e cores configuráveis.",
    "visual2d": "A visualização 2D está nos controles de posição, cor e fase de cada parte do orbital.",
    "animations": [
      "Alteração de posição dos lóbulos.",
      "Mudança de cores e fases positivas/negativas.",
      "Edição de estruturas blobby."
    ],
    "stages": [
      "Observe a forma inicial do orbital.",
      "Altere a posição de partes para perceber como os lóbulos se combinam.",
      "Troque cores e fases para representar sinais da função de onda.",
      "Compare formas atômicas e moleculares."
    ],
    "controls": [
      "Posição X",
      "Posição Y",
      "Posição Z",
      "Cor das partes",
      "Fase negativa",
      "Seleção de estrutura"
    ],
    "glossary": [
      "orbital atômico",
      "orbital molecular",
      "fase",
      "lóbulo",
      "metaball"
    ]
  },
  "ensino/animacao/catalogo-de-vidrarias-animado/": {
    "title": "Vidrarias e Equipamentos de Laboratório",
    "type": "visualização",
    "summary": "Catálogo interativo com vidrarias e equipamentos de laboratório, seus usos e animações de comportamento.",
    "visual3d": "Quando há modelo 3D, ele representa a vidraria selecionada, sua forma, líquido, vapor, aquecimento, agitação ou fluxo de gás conforme o tipo de equipamento.",
    "visual2d": "A leitura 2D aparece em cards, nomes, descrições, categorias e controles de seleção das vidrarias.",
    "animations": [
      "Troca de vidraria/equipamento.",
      "Animações de líquido, gás, aquecimento e agitação quando aplicáveis.",
      "Exibição de descrições funcionais e usos."
    ],
    "stages": [
      "Selecione uma vidraria no catálogo.",
      "Observe sua forma geral e a função indicada.",
      "Quando houver líquido, veja o comportamento do volume ou da agitação.",
      "Quando houver gás ou aquecimento, diferencie vapor, bolhas e fluxo.",
      "Use a descrição textual para associar a animação ao uso laboratorial."
    ],
    "controls": [
      "Buscar vidraria",
      "Selecionar categoria",
      "Abrir modelo",
      "Alternar animação quando disponível"
    ],
    "glossary": [
      "vidraria",
      "aquecimento",
      "destilação",
      "gás",
      "agitação"
    ]
  },
  "ensino/guia/celulas/": {
    "title": "Células Unitárias e Parâmetros de Rede",
    "type": "guia",
    "summary": "Guia em etapas sobre célula unitária, parâmetros de rede, ângulos e sistemas cristalinos.",
    "visual3d": "O canvas mostra uma célula 3D com eixos, parâmetros a, b, c e ângulos alfa, beta e gama ajustáveis.",
    "visual2d": "Os textos e sliders funcionam como leitura 2D dos parâmetros geométricos.",
    "animations": [
      "Tutorial anterior/próximo.",
      "Mudança de sistema e rede.",
      "Ajuste dos parâmetros a, b, c e dos ângulos."
    ],
    "stages": [
      "Leia a etapa atual do guia.",
      "Observe a célula no canvas.",
      "Altere a, b e c para perceber alongamento dos eixos.",
      "Altere alfa, beta e gama para observar inclinação.",
      "Compare os sistemas cristalinos."
    ],
    "controls": [
      "Sistema",
      "Rede",
      "Parâmetro a",
      "Parâmetro b",
      "Parâmetro c",
      "Ângulo alfa",
      "Ângulo beta",
      "Ângulo gama",
      "Anterior/próximo"
    ],
    "glossary": [
      "parâmetro de rede",
      "alfa beta gama",
      "sistema cristalino"
    ]
  },
  "ensino/guia/celulas-primitivas-sistemas-bravais-e-celula-de-wigner/": {
    "title": "Células Primitivas, Sistemas de Bravais e Célula de Wigner",
    "type": "guia",
    "summary": "Apresenta células primitivas, redes de Bravais e a construção conceitual da célula de Wigner-Seitz.",
    "visual3d": "O canvas mostra pontos de rede, célula escolhida e regiões de vizinhança que ajudam a entender células primitivas e Wigner-Seitz.",
    "visual2d": "A parte 2D aparece no roteiro textual de etapas e botões de navegação.",
    "animations": [
      "Avanço e retorno do tutorial.",
      "Reset da visualização.",
      "Mudança de destaque entre rede, célula e região de Wigner-Seitz."
    ],
    "stages": [
      "Comece pelos pontos de rede.",
      "Identifique uma célula que repete a rede por translação.",
      "Compare célula convencional e célula primitiva.",
      "Observe a região mais próxima de um ponto de rede na construção de Wigner-Seitz."
    ],
    "controls": [
      "Anterior",
      "Próximo",
      "Resetar"
    ],
    "glossary": [
      "Bravais",
      "célula primitiva",
      "Wigner-Seitz",
      "ponto de rede"
    ]
  },
  "ensino/guia/geometria-molecular-passo-a-passo/": {
    "title": "Geometria Molecular — Passo a Passo",
    "type": "guia",
    "summary": "Guia orientado para construir geometrias moleculares e entender arranjos eletrônicos em etapas.",
    "visual3d": "O canvas principal mostra molécula 3D com átomo central, ligantes e pares livres; a miniatura de eixos auxilia a orientação.",
    "visual2d": "A camada 2D mostra ângulos e textos de tutorial para leitura do arranjo.",
    "animations": [
      "Avanço de etapas guiadas.",
      "Troca de geometria.",
      "Exibição de ângulos.",
      "Ajustes de luz, tamanho e ligações."
    ],
    "stages": [
      "Leia a etapa do guia.",
      "Observe o número de regiões eletrônicas ao redor do átomo central.",
      "Compare ligantes e pares livres.",
      "Veja os ângulos e relacione com VSEPR.",
      "Gire a molécula para perceber a tridimensionalidade."
    ],
    "controls": [
      "Selecionar geometria",
      "Mostrar ângulos",
      "Avançar tutorial",
      "Ajustar ligação",
      "Ajustar pares livres"
    ],
    "glossary": [
      "VSEPR",
      "arranjo eletrônico",
      "geometria molecular",
      "par livre"
    ]
  },
  "ensino/guia/geometria-molecular-passo-a-passo_old/": {
    "title": "Geometria Molecular — Passo a Passo",
    "type": "guia",
    "summary": "Guia orientado para construir geometrias moleculares e entender arranjos eletrônicos em etapas.",
    "visual3d": "O canvas principal mostra molécula 3D com átomo central, ligantes e pares livres; a miniatura de eixos auxilia a orientação.",
    "visual2d": "A camada 2D mostra ângulos e textos de tutorial para leitura do arranjo.",
    "animations": [
      "Avanço de etapas guiadas.",
      "Troca de geometria.",
      "Exibição de ângulos.",
      "Ajustes de luz, tamanho e ligações."
    ],
    "stages": [
      "Leia a etapa do guia.",
      "Observe o número de regiões eletrônicas ao redor do átomo central.",
      "Compare ligantes e pares livres.",
      "Veja os ângulos e relacione com VSEPR.",
      "Gire a molécula para perceber a tridimensionalidade."
    ],
    "controls": [
      "Selecionar geometria",
      "Mostrar ângulos",
      "Avançar tutorial",
      "Ajustar ligação",
      "Ajustar pares livres"
    ],
    "glossary": [
      "VSEPR",
      "arranjo eletrônico",
      "geometria molecular",
      "par livre"
    ]
  },
  "ensino/guia/geometria-molecular_old/": {
    "title": "Geometria Molecular — Passo a Passo",
    "type": "guia",
    "summary": "Guia orientado para construir geometrias moleculares e entender arranjos eletrônicos em etapas.",
    "visual3d": "O canvas principal mostra molécula 3D com átomo central, ligantes e pares livres; a miniatura de eixos auxilia a orientação.",
    "visual2d": "A camada 2D mostra ângulos e textos de tutorial para leitura do arranjo.",
    "animations": [
      "Avanço de etapas guiadas.",
      "Troca de geometria.",
      "Exibição de ângulos.",
      "Ajustes de luz, tamanho e ligações."
    ],
    "stages": [
      "Leia a etapa do guia.",
      "Observe o número de regiões eletrônicas ao redor do átomo central.",
      "Compare ligantes e pares livres.",
      "Veja os ângulos e relacione com VSEPR.",
      "Gire a molécula para perceber a tridimensionalidade."
    ],
    "controls": [
      "Selecionar geometria",
      "Mostrar ângulos",
      "Avançar tutorial",
      "Ajustar ligação",
      "Ajustar pares livres"
    ],
    "glossary": [
      "VSEPR",
      "arranjo eletrônico",
      "geometria molecular",
      "par livre"
    ]
  },
  "ensino/guia/polaridade-molecular-tutorial-guiado-passo-a-passo/": {
    "title": "Polaridade Molecular — Tutorial Guiado",
    "type": "guia",
    "summary": "Guia em etapas para relacionar geometria molecular, vetores de ligação e polaridade resultante.",
    "visual3d": "O canvas 3D mostra moléculas com ligantes, pares livres e orientação espacial; a forma determina se os vetores se cancelam ou não.",
    "visual2d": "A camada 2D mostra ângulos e apoio visual para interpretar vetores e assimetria.",
    "animations": [
      "Troca de geometria.",
      "Exibição de ângulos e orientação.",
      "Ajuste da aparência molecular.",
      "Passagem por etapas do tutorial."
    ],
    "stages": [
      "Identifique a geometria da molécula.",
      "Observe se as ligações estão distribuídas simetricamente.",
      "Compare os vetores de ligação.",
      "Veja se os vetores se cancelam.",
      "Conclua se a molécula é polar ou apolar."
    ],
    "controls": [
      "Selecionar geometria",
      "Mostrar ângulos",
      "Avançar tutorial",
      "Ajustar visualização"
    ],
    "glossary": [
      "polaridade",
      "momento dipolar",
      "vetor de ligação",
      "simetria molecular"
    ]
  },
  "ensino/guia/polaridade-molecular-tutorial-guiado-passo-a-passo_old/": {
    "title": "Polaridade Molecular — Tutorial Guiado",
    "type": "guia",
    "summary": "Guia em etapas para relacionar geometria molecular, vetores de ligação e polaridade resultante.",
    "visual3d": "O canvas 3D mostra moléculas com ligantes, pares livres e orientação espacial; a forma determina se os vetores se cancelam ou não.",
    "visual2d": "A camada 2D mostra ângulos e apoio visual para interpretar vetores e assimetria.",
    "animations": [
      "Troca de geometria.",
      "Exibição de ângulos e orientação.",
      "Ajuste da aparência molecular.",
      "Passagem por etapas do tutorial."
    ],
    "stages": [
      "Identifique a geometria da molécula.",
      "Observe se as ligações estão distribuídas simetricamente.",
      "Compare os vetores de ligação.",
      "Veja se os vetores se cancelam.",
      "Conclua se a molécula é polar ou apolar."
    ],
    "controls": [
      "Selecionar geometria",
      "Mostrar ângulos",
      "Avançar tutorial",
      "Ajustar visualização"
    ],
    "glossary": [
      "polaridade",
      "momento dipolar",
      "vetor de ligação",
      "simetria molecular"
    ]
  },
  "ensino/guia/complexos e polimorfismo/": {
    "title": "Complexos e Polimorfismo",
    "type": "guia",
    "summary": "Visualizador acadêmico para estruturas cristalinas, complexos, polimorfismo, Azul da Prússia e cisplatina.",
    "visual3d": "O canvas mostra estruturas 3D com átomos, ligações, célula, rótulos e modelos químicos/cristalográficos selecionados.",
    "visual2d": "A leitura 2D aparece nos parâmetros, roteiro do tutorial e controles de exibição.",
    "animations": [
      "Navegação pelo tutorial.",
      "Ajuste de zoom e pitch.",
      "Exibição de célula, rótulos, átomos e ligações.",
      "Mudança de escala de esferas e ligações."
    ],
    "stages": [
      "Escolha a estrutura ou etapa do tutorial.",
      "Observe a célula e os átomos no espaço.",
      "Ative rótulos para identificar espécies.",
      "Compare ligações, coordenação e organização estrutural.",
      "Use zoom e pitch para entender a profundidade."
    ],
    "controls": [
      "Tutorial anterior/próximo",
      "Zoom",
      "Pitch",
      "Escala de esferas",
      "Escala de ligações",
      "Mostrar célula",
      "Mostrar rótulos",
      "Mostrar átomos",
      "Mostrar ligações"
    ],
    "glossary": [
      "complexo",
      "polimorfismo",
      "coordenação",
      "célula cristalina",
      "cisplatina"
    ]
  },
  "ensino/guia/modelos_atomicos/": {
    "title": "Modelos Atômicos",
    "type": "guia",
    "summary": "Percurso histórico e visual dos modelos atômicos de Dalton a Schrödinger.",
    "visual3d": "O canvas mostra representações 3D do modelo atômico em foco, podendo incluir núcleo, elétrons, órbitas, nuvem e efeitos de brilho/trilha.",
    "visual2d": "O gráfico radial e os textos funcionam como apoio 2D para a interpretação do modelo.",
    "animations": [
      "Avanço do tutorial.",
      "Mudança de zoom, rotação automática, pitch e brilho.",
      "Exibição de eixos, rótulos, onda e trilhas."
    ],
    "stages": [
      "Leia o modelo histórico em foco.",
      "Observe a representação visual associada.",
      "Compare modelos de partícula, núcleo, órbita e nuvem eletrônica.",
      "Use rótulos e eixos para entender os componentes.",
      "Relacione o gráfico ao modelo quântico quando aparecer."
    ],
    "controls": [
      "Anterior/próximo",
      "Zoom",
      "Eixos",
      "Rótulos",
      "Autorotação",
      "Pitch",
      "Brilho",
      "Mostrar onda",
      "Mostrar trilhas"
    ],
    "glossary": [
      "Dalton",
      "Thomson",
      "Rutherford",
      "Bohr",
      "Schrödinger",
      "orbital"
    ]
  },
  "ensino/guia/eq_de_ondas_hidrogenoides/": {
    "title": "Equações de Onda dos Hidrogenoides",
    "type": "guia",
    "summary": "Conecta a equação de Schrödinger, orbitais hidrogenoides, função de onda, densidade e gráficos radiais.",
    "visual3d": "Os canvases 3D mostram orbital, nuvem, fase, eixos e colorização; alguns modos exibem a geometria orbital em profundidade.",
    "visual2d": "Os canvases 2D mostram gráfico radial, função de onda, densidade e outras leituras matemáticas associadas.",
    "animations": [
      "Navegação pelo tutorial.",
      "Troca de modo de cor.",
      "Ajuste de zoom, rotação, pitch e brilho.",
      "Exibição de onda, eixos e rótulos."
    ],
    "stages": [
      "Leia a equação ou conceito da etapa.",
      "Observe o orbital 3D.",
      "Compare a cor/fase com a função de onda.",
      "Leia os gráficos 2D para entender densidade e distribuição radial.",
      "Relacione números quânticos com a forma observada."
    ],
    "controls": [
      "Anterior/próximo",
      "Modo de cor",
      "Zoom",
      "Autorotação",
      "Pitch",
      "Brilho",
      "Eixos",
      "Rótulos",
      "Mostrar onda"
    ],
    "glossary": [
      "Schrödinger",
      "hidrogenoide",
      "função de onda",
      "densidade",
      "número quântico"
    ]
  },
  "ensino/guia/fases_da_agua/": {
    "title": "Fases da Água",
    "type": "guia",
    "summary": "Relaciona pressão, temperatura e fases da água com visualização molecular e diagrama de fases.",
    "visual3d": "O canvas 3D mostra amostras de água como partículas em diferentes estados e condições, variando comportamento conforme pressão e temperatura.",
    "visual2d": "O diagrama 2D mostra regiões de fase, ponto triplo, ponto crítico e posição atual no gráfico.",
    "animations": [
      "Navegação pelo tutorial.",
      "Ajuste de pressão e temperatura.",
      "Ir para ponto triplo ou crítico.",
      "Troca de unidade de pressão e amostras."
    ],
    "stages": [
      "Observe a amostra 3D.",
      "Ajuste temperatura e pressão.",
      "Veja a posição no diagrama de fases.",
      "Compare sólido, líquido, vapor e regiões especiais.",
      "Use ponto triplo e crítico para estudar mudanças de fase."
    ],
    "controls": [
      "Anterior/próximo",
      "Pressão",
      "Temperatura",
      "Unidade de pressão",
      "Amostra",
      "Ponto triplo",
      "Ponto crítico"
    ],
    "glossary": [
      "fase",
      "pressão",
      "temperatura",
      "ponto triplo",
      "ponto crítico",
      "diagrama de fases"
    ]
  },
  "ensino/guia/atlas_termodinamico/": {
    "title": "Atlas Termodinâmico",
    "type": "guia",
    "summary": "Organiza conceitos e relações termodinâmicas com leitura guiada, gráficos e exemplos de processos.",
    "visual3d": "Quando há visualização, ela representa processos, estados e relações entre grandezas termodinâmicas.",
    "visual2d": "Os elementos 2D concentram cards, gráficos, fórmulas e textos de interpretação.",
    "animations": [
      "Navegação por tópicos do atlas.",
      "Mudança de estados, processos e exemplos.",
      "Leitura de gráficos e relações."
    ],
    "stages": [
      "Escolha o tópico termodinâmico.",
      "Leia a grandeza ou relação apresentada.",
      "Observe o gráfico ou esquema associado.",
      "Relacione variáveis como pressão, volume, temperatura e energia."
    ],
    "controls": [
      "Navegação de tópicos",
      "Cards explicativos",
      "Gráficos e relações"
    ],
    "glossary": [
      "termodinâmica",
      "pressão",
      "volume",
      "temperatura",
      "energia",
      "processo"
    ]
  },
  "ensino/guia/interacoes_intermoleculares/": {
    "title": "Interações Intermoleculares",
    "type": "guia",
    "summary": "Percurso visual sobre dipolo-dipolo, forças de dispersão, ligações de hidrogênio e efeitos em propriedades.",
    "visual3d": "Quando há cena ou ilustração, ela mostra moléculas se aproximando e interagindo por regiões de carga, polarização ou ligação de hidrogênio.",
    "visual2d": "A leitura 2D aparece em cards, etapas, comparações e textos explicativos.",
    "animations": [
      "Avanço por tipos de interação.",
      "Comparação entre moléculas e intensidade das forças.",
      "Destaque de regiões de carga e ligação de hidrogênio."
    ],
    "stages": [
      "Identifique o tipo de interação.",
      "Observe as regiões positivas e negativas.",
      "Compare intensidade relativa.",
      "Relacione a interação com propriedades como ebulição e solubilidade."
    ],
    "controls": [
      "Navegação por etapas",
      "Cards de comparação",
      "Botões interativos quando disponíveis"
    ],
    "glossary": [
      "dipolo-dipolo",
      "dispersão de London",
      "ligação de hidrogênio",
      "polarizabilidade"
    ]
  },
  "ensino/exercicio guiado/polaridade-e-geometria-molecular/": {
    "title": "Polaridade e Geometria Molecular",
    "type": "exercício",
    "summary": "Exercício de fixação para treinar geometria, ângulos, pares livres e polaridade.",
    "visual3d": "O canvas 3D mostra molécula com ligantes, pares livres, ângulos e orientação espacial para resposta ao exercício.",
    "visual2d": "A camada 2D de ângulo e controles ajuda a interpretar a forma e responder.",
    "animations": [
      "Troca de geometria.",
      "Ajustes visuais.",
      "Exercícios de polaridade e geometria."
    ],
    "stages": [
      "Observe a molécula proposta.",
      "Identifique sua geometria.",
      "Analise pares livres e ângulos.",
      "Decida se os vetores se cancelam.",
      "Responda e compare com o feedback."
    ],
    "controls": [
      "Selecionar geometria",
      "Mostrar ângulos",
      "Ajustar visual",
      "Botões de resposta"
    ],
    "glossary": [
      "geometria molecular",
      "polaridade",
      "vetores",
      "par livre"
    ]
  },
  "ensino/exercicio guiado/batalha-de-polaridade/": {
    "title": "Batalha de Polaridade",
    "type": "exercício",
    "summary": "Compara moléculas em rodadas para decidir qual é polar, apolar ou mais polar.",
    "visual3d": "O canvas mostra a molécula ou par de moléculas em 3D, com geometria e organização dos vetores de ligação.",
    "visual2d": "A parte 2D apresenta pergunta, respostas, botão revelar e navegação entre rodadas.",
    "animations": [
      "Rodadas com anterior/próximo.",
      "Revelação da resposta.",
      "Mudança da molécula exibida."
    ],
    "stages": [
      "Leia a pergunta da rodada.",
      "Observe a geometria no canvas.",
      "Analise a simetria e os vetores.",
      "Escolha a resposta.",
      "Use revelar para conferir o raciocínio."
    ],
    "controls": [
      "Anterior",
      "Revelar",
      "Próximo"
    ],
    "glossary": [
      "polaridade",
      "simetria",
      "momento dipolar"
    ]
  },
  "ensino/exercicio guiado/buracos-cristalinos/": {
    "title": "Buracos Cristalinos",
    "type": "exercício",
    "summary": "Exercício para identificar se um sítio cristalino é tetraédrico ou octaédrico.",
    "visual3d": "O canvas mostra arranjos de esferas ao redor de um espaço vazio, destacando o sítio a ser identificado.",
    "visual2d": "A parte 2D traz pergunta, botões de resposta, guias e feedback.",
    "animations": [
      "Exibição de diferentes sítios.",
      "Revelação da resposta.",
      "Ativação de guias visuais."
    ],
    "stages": [
      "Observe quantas esferas cercam o buraco.",
      "Compare o arranjo espacial.",
      "Decida se o sítio é tetraédrico ou octaédrico.",
      "Ative guias se precisar.",
      "Revele a resposta e leia a justificativa."
    ],
    "controls": [
      "Revelar",
      "Próximo",
      "Mostrar guias"
    ],
    "glossary": [
      "sítio tetraédrico",
      "sítio octaédrico",
      "interstício"
    ]
  },
  "ensino/exercicio guiado/caca-ao-sitio-cristalino/": {
    "title": "Caça ao Sítio Cristalino",
    "type": "exercício",
    "summary": "Atividade para localizar sítios cristalinos e relacionar posição, coordenação e ocupação.",
    "visual3d": "O canvas mostra estrutura cristalina 3D com um sítio ou região a ser encontrado no arranjo.",
    "visual2d": "A leitura 2D apresenta rodada, resposta e feedback.",
    "animations": [
      "Troca de rodada.",
      "Revelação do sítio correto.",
      "Destaque visual do local."
    ],
    "stages": [
      "Observe a estrutura inteira.",
      "Procure o sítio indicado pela pergunta.",
      "Relacione posição com coordenação.",
      "Revele a resposta para ver o destaque.",
      "Avance para uma nova estrutura."
    ],
    "controls": [
      "Anterior",
      "Revelar",
      "Próximo"
    ],
    "glossary": [
      "sítio cristalino",
      "coordenação",
      "ocupação"
    ]
  },
  "ensino/exercicio guiado/contagem-de-atomo/": {
    "title": "Fórmula Unitária na Prática",
    "type": "exercício",
    "summary": "Treina a contagem de átomos em posições de vértice, aresta, face e interior da célula unitária.",
    "visual3d": "O canvas mostra célula unitária 3D com posições atômicas que devem ser contadas por frações.",
    "visual2d": "A parte 2D traz perguntas, alternativas, revelar resposta e navegação.",
    "animations": [
      "Troca de exercícios.",
      "Revelação de resposta.",
      "Destaque de posições."
    ],
    "stages": [
      "Observe onde os átomos estão na célula.",
      "Classifique cada posição: vértice, aresta, face ou interior.",
      "Aplique a fração correspondente.",
      "Some as contribuições.",
      "Confira a fórmula unitária no feedback."
    ],
    "controls": [
      "Anterior",
      "Revelar",
      "Próximo",
      "Botões de resposta"
    ],
    "glossary": [
      "fórmula unitária",
      "contagem fracionária",
      "vértice",
      "aresta",
      "face"
    ]
  },
  "ensino/exercicio guiado/coordenacao-empacotamento/": {
    "title": "Coordenação e Empacotamento",
    "type": "exercício",
    "summary": "Exercício para conectar número de coordenação, empacotamento e organização espacial.",
    "visual3d": "O canvas mostra partículas empacotadas e vizinhos próximos ao átomo de referência.",
    "visual2d": "A parte 2D apresenta perguntas, guias e feedback.",
    "animations": [
      "Mudança de questão.",
      "Revelação da resposta.",
      "Guias para destacar vizinhos."
    ],
    "stages": [
      "Observe a partícula central.",
      "Conte os vizinhos mais próximos.",
      "Relacione o número de coordenação ao tipo de empacotamento.",
      "Use guias para conferir.",
      "Leia o feedback."
    ],
    "controls": [
      "Revelar",
      "Próximo",
      "Mostrar guias"
    ],
    "glossary": [
      "coordenação",
      "empacotamento",
      "vizinho próximo"
    ]
  },
  "ensino/exercicio guiado/defeitos-cristalinos/": {
    "title": "Defeitos Cristalinos",
    "type": "exercício",
    "summary": "Compara estrutura original e defeituosa para identificar vacâncias, intersticiais, substitucionais e outros defeitos.",
    "visual3d": "O canvas mostra uma rede cristalina com alteração pontual ou comparativo entre estado ideal e defeituoso.",
    "visual2d": "A parte 2D apresenta pergunta, guias e revelação da resposta.",
    "animations": [
      "Exibição de defeitos diferentes.",
      "Revelação e destaque do defeito.",
      "Ativação de guias."
    ],
    "stages": [
      "Observe a estrutura regular.",
      "Procure a diferença no arranjo.",
      "Identifique se há ausência, substituição ou átomo extra.",
      "Revele a resposta.",
      "Relacione o defeito à organização da rede."
    ],
    "controls": [
      "Revelar",
      "Próximo",
      "Mostrar guias"
    ],
    "glossary": [
      "vacância",
      "intersticial",
      "substitucional",
      "defeito cristalino"
    ]
  },
  "ensino/exercicio guiado/nome-da-celula/": {
    "title": "Classificação do Sistema Cristalino",
    "type": "exercício",
    "summary": "Atividade para reconhecer o nome da célula ou sistema cristalino pela geometria apresentada.",
    "visual3d": "O canvas mostra células 3D com eixos e ângulos característicos para identificação.",
    "visual2d": "A parte 2D traz perguntas, guias e feedback.",
    "animations": [
      "Troca de célula.",
      "Revelação do nome correto.",
      "Ativação de guias visuais."
    ],
    "stages": [
      "Observe comprimentos dos eixos.",
      "Observe ângulos entre os eixos.",
      "Compare com os sistemas cristalinos conhecidos.",
      "Escolha a classificação.",
      "Revele a resposta e leia a justificativa."
    ],
    "controls": [
      "Revelar",
      "Próximo",
      "Mostrar guias"
    ],
    "glossary": [
      "sistema cristalino",
      "eixos",
      "ângulos",
      "classificação"
    ]
  },
  "ensino/jogo/quebra-cabeca-ionico-covalente/": {
    "title": "Quebra-Cabeça Iônico/Covalente",
    "type": "jogo",
    "summary": "Jogo didático para combinar conceitos, propriedades e exemplos de ligações iônicas e covalentes.",
    "visual3d": "Não há canvas 3D principal; a interação é feita por peças e cartões do jogo.",
    "visual2d": "A interface 2D mostra peças, áreas de encaixe, textos e feedback de combinação.",
    "animations": [
      "Arrastar ou selecionar peças.",
      "Combinar conceitos com categorias.",
      "Receber feedback de acerto."
    ],
    "stages": [
      "Leia a peça ou conceito.",
      "Compare com as categorias iônica e covalente.",
      "Mova ou selecione a peça correta.",
      "Use o feedback para revisar o conceito."
    ],
    "controls": [
      "Peças do jogo",
      "Botões de iniciar/reiniciar",
      "Áreas de encaixe"
    ],
    "glossary": [
      "ligação iônica",
      "ligação covalente",
      "propriedade",
      "composto"
    ]
  },
  "ensino/jogo/caça-palavras/": {
    "title": "Caça-Palavras",
    "type": "jogo",
    "summary": "Jogo de vocabulário químico para encontrar termos em uma grade.",
    "visual3d": "Não há canvas 3D; a atividade é uma grade 2D de letras.",
    "visual2d": "A interface 2D mostra letras, lista de palavras, botões e feedback de seleção.",
    "animations": [
      "Seleção de letras na grade.",
      "Marcação de palavras encontradas.",
      "Reinício ou mudança de tema."
    ],
    "stages": [
      "Leia a lista de palavras.",
      "Procure as letras na grade.",
      "Selecione a sequência correta.",
      "Confira a marcação da palavra encontrada."
    ],
    "controls": [
      "Grade de letras",
      "Lista de palavras",
      "Botões de tema/reiniciar"
    ],
    "glossary": [
      "vocabulário químico",
      "termo",
      "revisão"
    ]
  },
  "ensino/jogo/xadrez-quimico/": {
    "title": "Xadrez Químico",
    "type": "jogo",
    "summary": "Jogo temático de estratégia com peças inspiradas em vidrarias e funções de laboratório.",
    "visual3d": "Quando há tabuleiro visual, ele representa peças e casas em uma organização espacial de jogo.",
    "visual2d": "A interface 2D mostra tabuleiro, peças, turnos e regras do jogo.",
    "animations": [
      "Movimento de peças.",
      "Troca de turno.",
      "Aplicação de regras temáticas de química."
    ],
    "stages": [
      "Observe o tabuleiro.",
      "Escolha uma peça.",
      "Leia sua função ou movimento.",
      "Movimente seguindo as regras.",
      "Use a estratégia para avançar no jogo."
    ],
    "controls": [
      "Tabuleiro",
      "Peças",
      "Regras",
      "Turno"
    ],
    "glossary": [
      "vidraria",
      "tabuleiro",
      "estratégia"
    ]
  }
};
  var STORAGE_KEY = 'simoens.accessibility.animation.preferences.v1';
  var currentSpeech = null;
  var speechQueue = [];

  function speechState() {
    window.__simoensA11ySpeech = window.__simoensA11ySpeech || { token: 0, stopped: true };
    return window.__simoensA11ySpeech;
  }

  function hardCancelSpeech(cancelToken) {
    if (!('speechSynthesis' in window)) return;
    function shouldKeepCancelling() {
      var shared = speechState();
      return shared.stopped && shared.token === cancelToken;
    }
    function cancelNow() {
      try { window.speechSynthesis.cancel(); } catch (error) {}
    }
    try {
      cancelNow();
      if (window.speechSynthesis.paused) {
        try { window.speechSynthesis.resume(); } catch (error) {}
        cancelNow();
      }
      [25, 75, 150, 300, 600].forEach(function (delay) {
        window.setTimeout(function () {
          if (shouldKeepCancelling()) cancelNow();
        }, delay);
      });
    } catch (error) {}
  }
  function getScriptBase() {
    var current = document.currentScript;
    if (current && current.src) return current.src.replace(/[^/]*$/, '');
    var scripts = Array.prototype.slice.call(document.querySelectorAll('script[src]')).reverse();
    for (var i = 0; i < scripts.length; i += 1) {
      var src = scripts[i].getAttribute('src') || '';
      if (src.indexOf('simoens-animation-accessibility.js') !== -1) return src.replace(/[^/]*$/, '');
    }
    return '';
  }

  var scriptBase = getScriptBase();
  var mdCache = {};
  var MD_MAP = {
    "ensino/animacao/": "textos-acessibilidade/animacoes/README.md",
    "ensino/guia/": "textos-acessibilidade/guias/00_indice_guias.md",
    "ensino/exercicio guiado/": "textos-acessibilidade/exercicios-guiados/00_indice_exercicios_guiados.md",
    "ensino/animacao/buracos-e-empacotamento/": "textos-acessibilidade/animacoes/01_animacao_empacotamento_de_esferas.md",
    "ensino/animacao/catalogo-de-vidrarias-animado/": "textos-acessibilidade/animacoes/02_animacao_catalogo_de_vidrarias_e_equipamentos.md",
    "ensino/animacao/geometria-cristalografica/": "textos-acessibilidade/animacoes/03_animacao_geometria_cristalografica.md",
    "ensino/animacao/geometria-molecular/": "textos-acessibilidade/animacoes/04_animacao_geometria_molecular.md",
    "ensino/animacao/redes-cristalinas/": "textos-acessibilidade/animacoes/05_animacao_redes_cristalinas.md",
    "ensino/animacao/simetria-e-formula-unitaria/": "textos-acessibilidade/animacoes/06_animacao_simetria_e_formula_unitaria.md",
    "ensino/animacao/simetria-e-formula-unitaria/views/celulas/": "textos-acessibilidade/animacoes/06_animacao_simetria_e_formula_unitaria.md",
    "ensino/animacao/simetria-e-formula-unitaria/views/cubicas/": "textos-acessibilidade/animacoes/06_animacao_simetria_e_formula_unitaria.md",
    "ensino/animacao/simetria-e-formula-unitaria/views/fracoes/": "textos-acessibilidade/animacoes/06_animacao_simetria_e_formula_unitaria.md",
    "ensino/animacao/simetria-e-formula-unitaria/views/modelos/": "textos-acessibilidade/animacoes/06_animacao_simetria_e_formula_unitaria.md",
    "ensino/animacao/simetria-e-formula-unitaria/views/orbits/": "textos-acessibilidade/animacoes/06_animacao_simetria_e_formula_unitaria.md",
    "ensino/animacao/visualizador_de_hidrogenoides/": "textos-acessibilidade/animacoes/07_animacao_visualizador_de_hidrogenoides.md",
    "ensino/animacao/visualizador-orbitais/": "textos-acessibilidade/animacoes/08_animacao_visualizador_de_orbitais.md",
    "ensino/animacao/visualizador_orbitais/": "textos-acessibilidade/animacoes/08_animacao_visualizador_de_orbitais.md",
    "ensino/guia/atlas_termodinamico/": "textos-acessibilidade/guias/01_guia_atlas_termodinamico.md",
    "ensino/guia/celulas/": "textos-acessibilidade/guias/02_guia_celulas_unitarias.md",
    "ensino/guia/celulas-primitivas-sistemas-bravais-e-celula-de-wigner/": "textos-acessibilidade/guias/03_guia_celulas_primitivas_bravais_wigner.md",
    "ensino/guia/complexos e polimorfismo/": "textos-acessibilidade/guias/04_guia_complexos_e_polimorfismo.md",
    "ensino/guia/eq_de_ondas_hidrogenoides/": "textos-acessibilidade/guias/05_guia_equacoes_de_onda_hidrogenoides.md",
    "ensino/guia/fases_da_agua/": "textos-acessibilidade/guias/06_guia_fases_da_agua.md",
    "ensino/guia/geometria-molecular-passo-a-passo/": "textos-acessibilidade/guias/07_guia_geometria_molecular_passo_a_passo.md",
    "ensino/guia/interacoes_intermoleculares/": "textos-acessibilidade/guias/08_guia_interacoes_intermoleculares.md",
    "ensino/guia/modelos_atomicos/": "textos-acessibilidade/guias/09_guia_modelos_atomicos.md",
    "ensino/guia/polaridade-molecular-tutorial-guiado-passo-a-passo/": "textos-acessibilidade/guias/10_guia_polaridade_molecular.md",
    "ensino/exercicio guiado/contagem-de-atomo/": "textos-acessibilidade/exercicios-guiados/01_exercicio_guiado_contagem_de_atomo_formula_unitaria.md",
    "ensino/exercicio guiado/polaridade-e-geometria-molecular/": "textos-acessibilidade/exercicios-guiados/02_exercicio_guiado_polaridade_e_geometria_molecular.md",
    "ensino/exercicio guiado/batalha-de-polaridade/": "textos-acessibilidade/exercicios-guiados/03_exercicio_guiado_batalha_de_polaridade.md",
    "ensino/exercicio guiado/buracos-cristalinos/": "textos-acessibilidade/exercicios-guiados/04_exercicio_guiado_buracos_cristalinos.md",
    "ensino/exercicio guiado/caca-ao-sitio-cristalino/": "textos-acessibilidade/exercicios-guiados/05_exercicio_guiado_caca_ao_sitio_cristalino.md",
    "ensino/exercicio guiado/coordenacao-empacotamento/": "textos-acessibilidade/exercicios-guiados/06_exercicio_guiado_coordenacao_e_empacotamento.md",
    "ensino/exercicio guiado/defeitos-cristalinos/": "textos-acessibilidade/exercicios-guiados/07_exercicio_guiado_defeitos_cristalinos.md",
    "ensino/exercicio guiado/nome-da-celula/": "textos-acessibilidade/exercicios-guiados/08_exercicio_guiado_nome_da_celula.md",
    "ensino/jogo/xadrez-quimico/": "textos-acessibilidade/jogos/01_jogo_xadrez_quimico_modo_narrador.md",
    "ensino/jogo/quebra-cabeca-ionico-covalente/": "textos-acessibilidade/jogos/02_jogo_quebra_cabeca_ionico_covalente_modo_narrador.md",
    "ensino/jogo/caça-palavras/": "textos-acessibilidade/jogos/03_jogo_caca_palavras_cruzadinha_modo_narrador.md",
    "ensino/jogo/ca#u00e7a-palavras/": "textos-acessibilidade/jogos/03_jogo_caca_palavras_cruzadinha_modo_narrador.md"
  };

  function text(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function normalizePath(value) {
    try { value = decodeURIComponent(value || ''); } catch (error) { value = value || ''; }
    return String(value).replace(/\\/g, '/').replace(/\/index\.html$/i, '/').replace(/\/+$/g, '/').toLowerCase();
  }

  function currentEntry() {
    var path = normalizePath(window.location.pathname);
    var bestKey = '';
    Object.keys(MAP).forEach(function (key) {
      var normalized = normalizePath(key);
      if (path.indexOf(normalized) !== -1 && normalized.length > bestKey.length) bestKey = key;
      if (path.endsWith(normalized) && normalized.length > bestKey.length) bestKey = key;
    });
    return bestKey ? MAP[bestKey] : fallbackEntry();
  }

  function fallbackEntry() {
    var title = text(document.title) || 'Página do SiMoEns';
    var headings = Array.prototype.slice.call(document.querySelectorAll('h1,h2,h3')).map(function (item) { return text(item.textContent); }).filter(Boolean).slice(0, 5);
    var canvasCount = document.querySelectorAll('canvas').length;
    return {
      title: title,
      type: 'página',
      summary: headings.length ? headings.join('. ') : 'Página interativa do SiMoEns.',
      visual3d: canvasCount ? 'Esta página possui uma ou mais áreas de visualização em canvas. Use os controles próximos da cena para alterar a representação.' : 'Não foi identificado canvas 3D nesta página.',
      visual2d: 'Os textos, botões, listas e controles da página funcionam como apoio de leitura para a atividade.',
      animations: ['Interações e mudanças visuais dependem dos botões e controles disponíveis nesta página.'],
      stages: headings.length ? headings : ['Leia o título da página.', 'Observe os controles disponíveis.', 'Use os botões de navegação ou interação para avançar.', 'Acione a leitura em voz se quiser ouvir o conteúdo.'],
      controls: detectedControls().slice(0, 8),
      glossary: []
    };
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch];
    });
  }

  function listHtml(items) {
    if (!items || !items.length) return '<p>Não há itens mapeados para esta seção.</p>';
    return '<ul>' + items.map(function (item) { return '<li>' + escapeHtml(item) + '</li>'; }).join('') + '</ul>';
  }

  function currentDocPath() {
    var path = normalizePath(window.location.pathname);
    var bestKey = '';
    Object.keys(MD_MAP).forEach(function (key) {
      var normalized = normalizePath(key);
      if (path.indexOf(normalized) !== -1 && normalized.length > bestKey.length) bestKey = key;
      if (path.endsWith(normalized) && normalized.length > bestKey.length) bestKey = key;
    });
    return bestKey ? MD_MAP[bestKey] : '';
  }

  function markdownUrlCandidates(docPath) {
    var clean = String(docPath || '').replace(/^\/+/, '');
    var urls = [];
    function add(value) {
      if (!value || urls.indexOf(value) !== -1) return;
      urls.push(value);
    }
    try { add(new URL(clean, scriptBase || window.location.href).href); } catch (error) {}
    if (scriptBase) add(scriptBase.replace(/\/?$/, '/') + clean);
    try {
      var scriptUrl = new URL(scriptBase || '', window.location.href).href;
      var match = scriptUrl.match(/^(.*\/Chat\/widget\/)/i);
      if (match && match[1]) add(match[1] + clean);
    } catch (error) {}
    try {
      var pagePath = window.location.pathname || '';
      var ensinoIndex = pagePath.toLowerCase().indexOf('/ensino/');
      if (ensinoIndex >= 0) add(window.location.origin + pagePath.slice(0, ensinoIndex) + '/Chat/widget/' + clean);
      add(window.location.origin + '/Chat/widget/' + clean);
    } catch (error) {}
    return urls;
  }

  function fetchMarkdownSequential(urls, index) {
    if (!urls || index >= urls.length) return Promise.reject(new Error('Arquivo de descrição não encontrado.'));
    return fetch(urls[index], { cache: 'no-store' }).then(function (response) {
      if (!response.ok) throw new Error('Falha ao carregar ' + urls[index]);
      return response.text();
    }).catch(function () {
      return fetchMarkdownSequential(urls, index + 1);
    });
  }

  function markdownUnavailableHtml(docPath, urls) {
    var urlList = (urls || []).map(function (url) { return '<li><code>' + escapeHtml(url) + '</code></li>'; }).join('');
    return '<div class="simoens-a11y-md"><h2>Texto acessível não carregado</h2><p>Esta página está mapeada para um arquivo <code>.md</code>, então o widget não vai usar o texto antigo como substituto.</p><p>Verifique se a pasta <code>Chat/widget/textos-acessibilidade/</code> foi enviada junto com o widget e se o arquivo existe neste caminho:</p><p><code>' + escapeHtml(docPath) + '</code></p>' + (urlList ? '<h3>Caminhos testados</h3><ul>' + urlList + '</ul>' : '') + '</div>';
  }

  function markdownUnavailableSpeech(docPath) {
    return 'Texto acessível não carregado. Esta página está mapeada para um arquivo markdown, então o widget não vai usar o texto antigo. Verifique se a pasta Chat/widget/textos-acessibilidade foi enviada junto com o widget e se existe o arquivo ' + docPath + '.';
  }

  function loadMarkdown(callback) {
    var docPath = currentDocPath();
    if (!docPath) {
      callback(null, { mapped: false, path: '', urls: [] });
      return;
    }
    if (!window.fetch) {
      callback(null, { mapped: true, path: docPath, urls: [], error: 'fetch-indisponivel' });
      return;
    }
    var urls = markdownUrlCandidates(docPath);
    var cacheKey = docPath + '|' + urls.join('|');
    if (Object.prototype.hasOwnProperty.call(mdCache, cacheKey)) {
      callback(mdCache[cacheKey], { mapped: true, path: docPath, urls: urls, cached: true });
      return;
    }
    fetchMarkdownSequential(urls, 0)
      .then(function (markdown) {
        mdCache[cacheKey] = markdown || null;
        callback(mdCache[cacheKey], { mapped: true, path: docPath, urls: urls });
      })
      .catch(function () {
        mdCache[cacheKey] = null;
        callback(null, { mapped: true, path: docPath, urls: urls, error: 'nao-carregado' });
      });
  }

  function stripMarkdown(value) {
    return text(String(value || '')
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/^#{1,6}\s*/gm, '')
      .replace(/^\s*[-*+]\s+/gm, '')
      .replace(/^\s*\d+\.\s+/gm, '')
      .replace(/[*_`>#|]/g, ' ')
      .replace(/-{3,}/g, ' ')
    );
  }

  function inlineMarkdownHtml(value) {
    return escapeHtml(value)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/__([^_]+)__/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
  }

  function markdownToHtml(markdown) {
    var lines = String(markdown || '').replace(/\r\n/g, '\n').split('\n');
    var html = [];
    var paragraph = [];
    var listType = '';

    function flushParagraph() {
      if (!paragraph.length) return;
      html.push('<p>' + inlineMarkdownHtml(paragraph.join(' ')) + '</p>');
      paragraph = [];
    }

    function closeList() {
      if (!listType) return;
      html.push('</' + listType + '>');
      listType = '';
    }

    lines.forEach(function (line) {
      var raw = line.replace(/\s+$/g, '');
      var trimmed = raw.trim();

      if (!trimmed) {
        flushParagraph();
        closeList();
        return;
      }

      if (/^#{1,6}\s+/.test(trimmed)) {
        flushParagraph();
        closeList();
        var level = Math.min(5, Math.max(3, (trimmed.match(/^#+/) || [''])[0].length + 1));
        html.push('<h' + level + '>' + inlineMarkdownHtml(trimmed.replace(/^#{1,6}\s+/, '')) + '</h' + level + '>');
        return;
      }

      if (/^[-*+]\s+/.test(trimmed)) {
        flushParagraph();
        if (listType !== 'ul') {
          closeList();
          html.push('<ul>');
          listType = 'ul';
        }
        html.push('<li>' + inlineMarkdownHtml(trimmed.replace(/^[-*+]\s+/, '')) + '</li>');
        return;
      }

      if (/^\d+\.\s+/.test(trimmed)) {
        flushParagraph();
        if (listType !== 'ol') {
          closeList();
          html.push('<ol>');
          listType = 'ol';
        }
        html.push('<li>' + inlineMarkdownHtml(trimmed.replace(/^\d+\.\s+/, '')) + '</li>');
        return;
      }

      if (/^---+$/.test(trimmed)) {
        flushParagraph();
        closeList();
        html.push('<hr>');
        return;
      }

      closeList();
      paragraph.push(trimmed);
    });

    flushParagraph();
    closeList();
    return html.join('');
  }

  function entryBodyHtml(item) {
    return '<p><strong>Tipo:</strong> ' + escapeHtml(item.type) + '</p>' +
      '<p>' + escapeHtml(item.summary) + '</p>' +
      '<h3>O que aparece no 3D/canvas</h3><p>' + escapeHtml(item.visual3d) + '</p>' +
      '<h3>O que aparece no 2D/interface</h3><p>' + escapeHtml(item.visual2d) + '</p>' +
      '<h3>Animações e mudanças visuais</h3>' + listHtml(item.animations) +
      '<h3>Etapas de leitura</h3>' + listHtml(item.stages);
  }

  function entrySpeech(item) {
    return [item.title, item.type, item.summary, item.visual3d, item.visual2d]
      .concat(item.animations || [], item.stages || [])
      .join('. ');
  }

  function setCanvasDescription(description, item) {
    var hidden = document.getElementById('simoens-canvas-description');
    if (!hidden) {
      hidden = document.createElement('div');
      hidden.id = 'simoens-canvas-description';
      hidden.className = 'simoens-a11y-visually-hidden-description';
      document.body.appendChild(hidden);
    }
    hidden.textContent = description;
    document.querySelectorAll('canvas').forEach(function (canvas, index) {
      canvas.setAttribute('tabindex', canvas.getAttribute('tabindex') || '0');
      canvas.setAttribute('role', canvas.getAttribute('role') || 'img');
      canvas.setAttribute('aria-describedby', 'simoens-canvas-description');
      if (!canvas.getAttribute('aria-label') || canvas.getAttribute('aria-label').indexOf('Visualização interativa') === 0) {
        canvas.setAttribute('aria-label', index === 0 ? item.visual3d : item.visual2d);
      }
    });
  }

  function detectedControls() {
    var labels = [];
    document.querySelectorAll('input, select, textarea, button').forEach(function (control) {
      if (control.closest('.simoens-a11y-widget') || control.closest('.simoens-a11y-modal')) return;
      var type = String(control.getAttribute('type') || '').toLowerCase();
      if (type === 'hidden') return;
      var label = control.getAttribute('aria-label') || control.getAttribute('title') || control.getAttribute('placeholder') || text(control.textContent) || control.id || control.name;
      label = text(label);
      if (label && labels.indexOf(label) === -1) labels.push(label);
    });
    return labels;
  }

  function injectStyle() {
    if (document.getElementById('simoens-animation-a11y-style')) return;
    var style = document.createElement('style');
    style.id = 'simoens-animation-a11y-style';
    style.textContent = `
      html.simoens-a11y-reading body {
        background: #ffffff !important;
        color: #111827 !important;
      }

      html.simoens-a11y-reading main,
      html.simoens-a11y-reading article,
      html.simoens-a11y-reading section,
      html.simoens-a11y-reading .container,
      html.simoens-a11y-reading .container-fluid {
        box-shadow: none !important;
      }

      html.simoens-a11y-reading p,
      html.simoens-a11y-reading li,
      html.simoens-a11y-reading h1,
      html.simoens-a11y-reading h2,
      html.simoens-a11y-reading h3,
      html.simoens-a11y-reading h4,
      html.simoens-a11y-reading h5,
      html.simoens-a11y-reading h6 {
        max-width: 78ch;
        line-height: 1.75 !important;
      }

      html.simoens-a11y-reading .item-wrapper,
      html.simoens-a11y-reading .card,
      html.simoens-a11y-reading canvas {
        border: 2px solid rgba(17,24,39,0.18) !important;
        border-radius: 16px !important;
      }

      .simoens-a11y-extra-section {
        padding-top: 12px;
      }

      .simoens-a11y-modal {
        position: fixed;
        inset: 0;
        z-index: 2147483700;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 18px;
        background: rgba(0,0,0,0.45);
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }

      .simoens-a11y-modal.is-open {
        display: flex;
      }

      .simoens-a11y-modal-card {
        width: min(760px, calc(100vw - 28px));
        max-height: min(84vh, 760px);
        overflow: auto;
        background: #ffffff;
        color: #111827;
        border-radius: 24px;
        box-shadow: 0 28px 90px rgba(0,0,0,0.36);
        border: 1px solid rgba(17,24,39,0.16);
      }

      .simoens-a11y-modal-head {
        position: sticky;
        top: 0;
        z-index: 1;
        display: flex;
        justify-content: space-between;
        gap: 12px;
        align-items: flex-start;
        padding: 18px;
        background: #ffffff;
        border-bottom: 1px solid rgba(17,24,39,0.12);
      }

      .simoens-a11y-modal-title {
        margin: 0;
        font-size: 22px;
        line-height: 1.2;
        font-weight: 850;
      }

      .simoens-a11y-modal-close {
        flex: 0 0 auto;
        border: 0;
        border-radius: 999px;
        width: 38px;
        height: 38px;
        background: #f3f4f6;
        color: #111827;
        font-size: 22px;
        cursor: pointer;
      }

      .simoens-a11y-modal-body {
        padding: 18px;
      }

      .simoens-a11y-modal-body h3 {
        margin: 18px 0 8px;
        font-size: 16px;
        font-weight: 850;
      }

      .simoens-a11y-modal-body p,
      .simoens-a11y-modal-body li {
        font-size: 15px;
        line-height: 1.6;
      }

      .simoens-a11y-md h3,
      .simoens-a11y-md h4,
      .simoens-a11y-md h5 {
        margin: 20px 0 8px;
        line-height: 1.25;
      }

      .simoens-a11y-md code {
        padding: 2px 6px;
        border-radius: 8px;
        background: #f3f4f6;
      }

      .simoens-a11y-md hr {
        border: 0;
        border-top: 1px solid rgba(17,24,39,0.14);
        margin: 18px 0;
      }

      .simoens-a11y-modal-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 16px;
      }

      .simoens-a11y-modal-actions button {
        border: 1px solid rgba(17,24,39,0.18);
        border-radius: 999px;
        background: #111827;
        color: #ffffff;
        padding: 10px 14px;
        font-weight: 750;
        cursor: pointer;
      }

      .simoens-a11y-visually-hidden-description {
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        padding: 0 !important;
        margin: -1px !important;
        overflow: hidden !important;
        clip: rect(0 0 0 0) !important;
        white-space: nowrap !important;
        border: 0 !important;
      }

      html.simoens-a11y-contrast .simoens-a11y-modal-card,
      html.simoens-a11y-contrast .simoens-a11y-modal-head {
        background: #000000 !important;
        color: #ffffff !important;
        border-color: #ffff00 !important;
      }

      html.simoens-a11y-contrast .simoens-a11y-modal-close,
      html.simoens-a11y-contrast .simoens-a11y-modal-actions button {
        background: #000000 !important;
        color: #ffff00 !important;
        border: 2px solid #ffff00 !important;
      }
    `;
    document.head.appendChild(style);
  }

  function ensureModal() {
    var modal = document.getElementById('simoens-a11y-modal');
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = 'simoens-a11y-modal';
    modal.className = 'simoens-a11y-modal simoens-a11y-safe';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'simoens-a11y-modal-title');
    modal.innerHTML = '<div class="simoens-a11y-modal-card"><div class="simoens-a11y-modal-head"><h2 class="simoens-a11y-modal-title" id="simoens-a11y-modal-title">Acessibilidade</h2><button class="simoens-a11y-modal-close" type="button" aria-label="Fechar janela">×</button></div><div class="simoens-a11y-modal-body" id="simoens-a11y-modal-body"></div></div>';
    document.body.appendChild(modal);
    modal.querySelector('.simoens-a11y-modal-close').addEventListener('click', closeModal);
    modal.addEventListener('click', function (event) { if (event.target === modal) closeModal(); });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && modal.classList.contains('is-open')) closeModal(); });
    return modal;
  }

  function openModal(title, body, speakText) {
    var modal = ensureModal();
    modal.querySelector('#simoens-a11y-modal-title').textContent = title;
    modal.querySelector('#simoens-a11y-modal-body').innerHTML = body + '<div class="simoens-a11y-modal-actions"><button type="button" data-simoens-modal-speak>Ouvir este conteúdo</button><button type="button" data-simoens-modal-stop>Parar leitura</button></div>';
    var content = speakText || text(modal.querySelector('#simoens-a11y-modal-body').textContent);
    modal.querySelector('[data-simoens-modal-speak]').addEventListener('click', function () { speak(content); });
    modal.querySelector('[data-simoens-modal-stop]').addEventListener('click', stopSpeak);
    modal.classList.add('is-open');
    setTimeout(function () { modal.querySelector('.simoens-a11y-modal-close').focus(); }, 0);
  }

  function closeModal() {
    var modal = document.getElementById('simoens-a11y-modal');
    if (modal) modal.classList.remove('is-open');
  }

  function splitSpeech(content) {
    var clean = text(content);
    var chunks = [];
    while (clean.length) {
      var part = clean.slice(0, 1800);
      var cut = Math.max(part.lastIndexOf('. '), part.lastIndexOf('! '), part.lastIndexOf('? '), part.lastIndexOf('; '));
      if (cut < 700 || clean.length <= 1800) cut = part.length;
      chunks.push(text(part.slice(0, cut + 1)));
      clean = text(clean.slice(cut + 1));
    }
    return chunks.filter(Boolean);
  }

  function speakNextChunk(token) {
    var shared = speechState();
    if (shared.stopped || token !== shared.token) return;
    if (!speechQueue.length) {
      currentSpeech = null;
      shared.stopped = true;
      return;
    }
    var chunk = speechQueue.shift();
    currentSpeech = new SpeechSynthesisUtterance(chunk);
    currentSpeech.lang = 'pt-BR';
    currentSpeech.rate = 0.95;
    currentSpeech.onend = function () {
      var latest = speechState();
      if (!latest.stopped && latest.token === token) speakNextChunk(token);
    };
    currentSpeech.onerror = function () {
      var latest = speechState();
      if (!latest.stopped && latest.token === token) speakNextChunk(token);
    };
    if (speechState().stopped || speechState().token !== token) return;
    window.speechSynthesis.speak(currentSpeech);
  }

  function speak(content) {
    if (!('speechSynthesis' in window) || !window.SpeechSynthesisUtterance) return;
    stopSpeak(true);
    speechQueue = splitSpeech(content);
    if (!speechQueue.length) return;
    var shared = speechState();
    shared.token += 1;
    shared.stopped = false;
    speakNextChunk(shared.token);
  }

  function stopSpeak(silent) {
    var shared = speechState();
    shared.token += 1;
    shared.stopped = true;
    var cancelToken = shared.token;
    speechQueue = [];
    if (currentSpeech) {
      currentSpeech.onend = null;
      currentSpeech.onerror = null;
      currentSpeech.onboundary = null;
      currentSpeech.onpause = null;
      currentSpeech.onresume = null;
      currentSpeech.onstart = null;
    }
    currentSpeech = null;
    hardCancelSpeech(cancelToken);
  }

  function explainPage() {
    var item = currentEntry();
    loadMarkdown(function (markdown, meta) {
      if (markdown) {
        var speechFromMarkdown = stripMarkdown(markdown);
        openModal('Explicar visualização — ' + item.title, '<div class="simoens-a11y-md">' + markdownToHtml(markdown) + '</div>', speechFromMarkdown);
        speak(speechFromMarkdown);
        return;
      }
      if (meta && meta.mapped) {
        var unavailableSpeech = markdownUnavailableSpeech(meta.path);
        openModal('Texto acessível não carregado — ' + item.title, markdownUnavailableHtml(meta.path, meta.urls), unavailableSpeech);
        speak(unavailableSpeech);
        return;
      }
      var speech = entrySpeech(item);
      openModal('Explicação da visualização — ' + item.title, entryBodyHtml(item), speech);
      speak(speech);
    });
  }

  function readAccessibleDocument() {
    if (!currentDocPath()) return false;
    var item = currentEntry();
    loadMarkdown(function (markdown, meta) {
      if (markdown) {
        var speech = stripMarkdown(markdown);
        openModal('Texto acessível — ' + item.title, '<div class="simoens-a11y-md">' + markdownToHtml(markdown) + '</div>', speech);
        speak(speech);
        return;
      }
      if (meta && meta.mapped) {
        var unavailableSpeech = markdownUnavailableSpeech(meta.path);
        openModal('Texto acessível não carregado — ' + item.title, markdownUnavailableHtml(meta.path, meta.urls), unavailableSpeech);
        speak(unavailableSpeech);
      }
    });
    return true;
  }

  function keyboardHelp() {
    var body = '<p>Use estes comandos como alternativa ao mouse.</p>' + listHtml([
      'Tab: percorre links, botões, campos, sliders e cards interativos.',
      'Shift + Tab: volta para o controle anterior.',
      'Enter ou Espaço: ativa botões, cards e links selecionados.',
      'Esc: fecha menus, popups e janelas de acessibilidade.',
      'Setas: ajustam sliders e campos quando eles estão em foco.',
      'Home e End: levam sliders para valor mínimo ou máximo, quando suportado pelo navegador.',
      'No canvas 3D, use os controles próximos da cena quando arrastar com mouse não for possível.'
    ]);
    openModal('Ajuda de teclado', body);
  }

  function controlsHelp() {
    var item = currentEntry();
    var detected = detectedControls();
    var body = '<p>Controles alternativos mapeados para esta página.</p><h3>Controles principais do recurso</h3>' + listHtml(item.controls || []) + '<h3>Controles detectados na página</h3>' + listHtml(detected.slice(0, 18)) + '<p>Para usar sem mouse, pressione Tab até o controle desejado e ajuste com teclado. Em visualizações 3D, sliders de rotação, zoom, pitch, tamanho ou estrutura funcionam como alternativa ao arraste.</p><div class="simoens-a11y-modal-actions"><button type="button" data-simoens-focus-control>Focar primeiro controle da página</button><button type="button" data-simoens-focus-canvas>Focar visualização</button></div>';
    openModal('Controles 3D e alternativas', body);
    var modal = document.getElementById('simoens-a11y-modal');
    var focusControl = modal.querySelector('[data-simoens-focus-control]');
    var focusCanvas = modal.querySelector('[data-simoens-focus-canvas]');
    if (focusControl) focusControl.addEventListener('click', function () {
      var control = document.querySelector('input:not([type="hidden"]), select, textarea, button:not(.simoens-a11y-action), a[href]');
      closeModal();
      if (control) control.focus();
    });
    if (focusCanvas) focusCanvas.addEventListener('click', function () {
      var canvas = document.querySelector('canvas');
      closeModal();
      if (canvas) canvas.focus();
    });
  }

  function declaration() {
    var body = '<p>O SiMoEns oferece recursos de acessibilidade complementares: VLibras, leitura em voz, contraste, fonte ajustável, tons de cinza, filtros para daltonismo, redução de efeitos, guia de leitura, descrições textuais de visualizações, alternativas de teclado e modo voz contextual no Xadrez Químico.</p><p>As páginas com canvas, animações, guias, exercícios guiados e jogos podem carregar textos acessíveis em arquivos Markdown. Ao acionar “Explicar visualização”, o widget abre o texto completo correspondente à página e inicia a leitura em voz.</p><p>No Xadrez Químico, o modo voz fica em um arquivo JavaScript próprio e não usa Markdown: ao ser ativado, narra peça, vidraria, posição, opções de movimento, capturas, movimentos da máquina, xeque e xeque-mate.</p><p>Quando houver texto selecionado na página, o botão “Ouvir” lê apenas a seleção. Sem seleção ativa, a leitura volta para o texto acessível da página ou para o conteúdo principal disponível.</p><p>Para melhor experiência com leitor de tela, recomenda-se navegar pelos títulos, botões e controles usando Tab, Shift + Tab, Enter, Espaço e Esc.</p>';
    openModal('Declaração de acessibilidade', body);
  }

  function toggleReading(button) {
    var active = !document.documentElement.classList.contains('simoens-a11y-reading');
    document.documentElement.classList.toggle('simoens-a11y-reading', active);
    if (button) button.setAttribute('aria-pressed', active ? 'true' : 'false');
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ reading: active })); } catch (error) {}
  }

  function restoreReadingState() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      document.documentElement.classList.toggle('simoens-a11y-reading', !!saved.reading);
      var button = document.querySelector('[data-simoens-extra="reading"]');
      if (button) button.setAttribute('aria-pressed', saved.reading ? 'true' : 'false');
    } catch (error) {}
  }

  function enhanceCanvasDescriptions() {
    var item = currentEntry();
    var description = [item.title, item.summary, item.visual3d, item.visual2d].filter(Boolean).join(' ');
    setCanvasDescription(description, item);
    loadMarkdown(function (markdown) {
      if (!markdown) return;
      setCanvasDescription([item.title, stripMarkdown(markdown).slice(0, 1800)].filter(Boolean).join('. '), item);
    });
  }

  function enhanceKeyboardAccess() {
    document.querySelectorAll('a[data-open-href], .item-wrapper, canvas').forEach(function (element) {
      if (!element.getAttribute('tabindex')) element.setAttribute('tabindex', '0');
    });
    document.querySelectorAll('a[data-open-href]').forEach(function (link) {
      if (link.getAttribute('data-simoens-key-ready')) return;
      link.setAttribute('data-simoens-key-ready', 'true');
      link.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); link.click(); }
      });
    });
  }

  function appendButtons() {
    var panel = document.querySelector('#simoens-a11y-widget .simoens-a11y-panel');
    if (!panel || panel.querySelector('[data-simoens-extra-section]')) return;
    var section = document.createElement('div');
    section.className = 'simoens-a11y-section simoens-a11y-extra-section';
    section.setAttribute('data-simoens-extra-section', 'true');
    section.innerHTML = '<p class="simoens-a11y-section-title">Conteúdo acessível</p><div class="simoens-a11y-grid"><button class="simoens-a11y-action" type="button" data-simoens-extra="explain" title="Abre e lê o texto acessível completo da visualização atual.">Explicar visualização</button><button class="simoens-a11y-action" type="button" data-simoens-extra="reading" aria-pressed="false" title="Ativa uma leitura visual mais limpa, com menos distrações e melhor espaçamento.">Modo leitura</button><button class="simoens-a11y-action" type="button" data-simoens-extra="keyboard" title="Mostra atalhos e instruções para usar o site sem mouse.">Ajuda teclado</button><button class="simoens-a11y-action" type="button" data-simoens-extra="controls" title="Mostra alternativas para manipular visualizações 3D e controles interativos.">Controles 3D</button><button class="simoens-a11y-action is-wide" type="button" data-simoens-extra="declaration" title="Mostra a declaração de acessibilidade do site.">Declaração de acessibilidade</button></div>';
    var navSection = panel.querySelector('.simoens-a11y-section:last-of-type');
    panel.insertBefore(section, navSection || null);
    panel.addEventListener('click', function (event) {
      var button = event.target.closest('[data-simoens-extra]');
      if (!button) return;
      var action = button.getAttribute('data-simoens-extra');
      if (action === 'explain') explainPage();
      if (action === 'reading') toggleReading(button);
      if (action === 'keyboard') keyboardHelp();
      if (action === 'controls') controlsHelp();
      if (action === 'declaration') declaration();
    });
    restoreReadingState();
  }

  function start() {
    window.simoensReadAccessibleDescription = readAccessibleDocument;
    window.simoensStopAccessibleSpeech = stopSpeak;
    injectStyle();
    appendButtons();
    enhanceCanvasDescriptions();
    enhanceKeyboardAccess();
    restoreReadingState();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }

  var observer = new MutationObserver(function () {
    window.clearTimeout(window.__simoensAnimationA11yTimer);
    window.__simoensAnimationA11yTimer = window.setTimeout(start, 150);
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
