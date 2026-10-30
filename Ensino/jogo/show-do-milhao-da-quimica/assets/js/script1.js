const allQuestions =  [
  // LEVEL 1 (EASY)
  { id: 1, difficulty: 1, text: "Qual é a fórmula química da água?", options: ["H2O", "CO2", "O2", "NaCl"], answer: "H2O" },
  { id: 2, difficulty: 1, text: "Qual gás é essencial para a respiração humana?", options: ["Oxigênio", "Hidrogênio", "Carbono", "Nitrogênio"], answer: "Oxigênio" },
  { id: 3, difficulty: 1, text: "Qual é o símbolo químico do Ouro?", options: ["Au", "Ag", "Ou", "Or"], answer: "Au" },
  { id: 4, difficulty: 1, text: "O que a escala de pH mede?", options: ["Acidez ou basicidade", "Temperatura", "Pressão atmosférica", "Volume molar"], answer: "Acidez ou basicidade" },
  { id: 5, difficulty: 1, text: "Qual destes é o principal gás causador do efeito estufa?", options: ["Dióxido de carbono (CO2)", "Oxigênio (O2)", "Hélio (He)", "Nitrogênio (N2)"], answer: "Dióxido de carbono (CO2)" },
  { id: 6, difficulty: 1, text: "Qual é a fórmula química do sal de cozinha?", options: ["NaCl", "HCl", "NaOH", "KCl"], answer: "NaCl" },
  { id: 7, difficulty: 1, text: "Como se chama a mudança do estado líquido para o gasoso?", options: ["Vaporização", "Condensação", "Fusão", "Solidificação"], answer: "Vaporização" },
  { id: 8, difficulty: 1, text: "Qual é o símbolo químico do Ferro?", options: ["Fe", "Fr", "F", "Fm"], answer: "Fe" },
  { id: 9, difficulty: 1, text: "Qual gás é usado para encher balões de festa que flutuam?", options: ["Hélio", "Oxigênio", "Hidrogênio", "Argônio"], answer: "Hélio" },
  { id: 10, difficulty: 1, text: "Qual elemento químico é representado pelo símbolo C?", options: ["Carbono", "Cálcio", "Cloro", "Cobre"], answer: "Carbono" },
  { id: 11, difficulty: 1, text: "O que representa o símbolo H na tabela periódica?", options: ["Hidrogênio", "Hélio", "Hólmio", "Hássio"], answer: "Hidrogênio" },
  { id: 12, difficulty: 1, text: "Qual metal é atraído por ímãs?", options: ["Ferro", "Ouro", "Cobre", "Alumínio"], answer: "Ferro" },
  { id: 13, difficulty: 1, text: "O que é uma mistura homogênea?", options: ["Aquela que apresenta uma única fase", "Aquela que tem cores diferentes", "Aquela onde se vê duas partes", "Uma mistura de água e óleo"], answer: "Aquela que apresenta uma única fase" },
  { id: 14, difficulty: 1, text: "Qual substância é conhecida como o solvente universal?", options: ["Água", "Álcool", "Acetona", "Gasolina"], answer: "Água" },
  { id: 15, difficulty: 1, text: "O que ocorre quando a água congela?", options: ["Solidificação", "Fusão", "Ebulição", "Sublimação"], answer: "Solidificação" },
  { id: 16, difficulty: 2, text: "O bronze é uma liga metálica formada principalmente por cobre e qual outro elemento?", options: ["Estanho", "Zinco", "Ferro", "Prata"], answer: "Estanho" },
  { id: 17, difficulty: 2, text: "Qual é a cor característica do gás cloro (Cl2) à temperatura ambiente?", options: ["Esverdeada", "Incolor", "Avermelhada", "Roxa"], answer: "Esverdeada" },
  { id: 18, difficulty: 1, text: "Qual é o símbolo da Prata?", options: ["Ag", "Pt", "Pr", "Au"], answer: "Ag" },
  { id: 19, difficulty: 1, text: "Qual é a fórmula do gás carbônico?", options: ["CO2", "CO", "C2O", "H2CO3"], answer: "CO2" },
  { id: 20, difficulty: 1, text: "Qual destes materiais não conduz eletricidade (isolante)?", options: ["Borracha", "Cobre", "Ferro", "Ouro"], answer: "Borracha" },

  // LEVEL 2 (MEDIUM)
  { id: 21, difficulty: 2, text: "Qual é o número atômico do Hidrogênio?", options: ["1", "2", "0", "8"], answer: "1" },
  { id: 22, difficulty: 2, text: "Quem propôs o modelo atômico conhecido como 'bola de bilhar'?", options: ["John Dalton", "J.J. Thomson", "Ernest Rutherford", "Niels Bohr"], answer: "John Dalton" },
  { id: 23, difficulty: 2, text: "Qual metal é líquido à temperatura ambiente?", options: ["Mercúrio", "Ouro", "Ferro", "Cobre"], answer: "Mercúrio" },
  { id: 24, difficulty: 3, text: "Em qual família da tabela periódica estão os halogênios?", options: ["17 (VIIA)", "1 (IA)", "18 (VIIIA)", "2 (IIA)"], answer: "17 (VIIA)" },
  { id: 25, difficulty: 2, text: "Qual é o nome da mudança direta do estado sólido para o gasoso?", options: ["Sublimação", "Fusão", "Ebulição", "Condensação"], answer: "Sublimação" },
  { id: 26, difficulty: 2, text: "Qual é a carga elétrica de um elétron?", options: ["Negativa", "Positiva", "Neutra", "Variável"], answer: "Negativa" },
  { id: 27, difficulty: 2, text: "Qual elemento tem o símbolo 'Na'?", options: ["Sódio", "Nitrogênio", "Níquel", "Neônio"], answer: "Sódio" },
  { id: 28, difficulty: 2, text: "Qual tipo de ligação ocorre entre íons de cargas opostas?", options: ["Iônica", "Covalente", "Metálica", "De hidrogênio"], answer: "Iônica" },
  { id: 29, difficulty: 2, text: "Qual gás nobre é frequentemente utilizado em letreiros luminosos avermelhados?", options: ["Neônio", "Argônio", "Hélio", "Criptônio"], answer: "Neônio" },
  { id: 30, difficulty: 2, text: "Quantos elétrons o átomo de carbono possui na sua camada de valência?", options: ["4", "2", "6", "8"], answer: "4" },
  { id: 31, difficulty: 3, text: "Qual é a fórmula química do ácido sulfúrico?", options: ["H2SO4", "HCl", "HNO3", "H3PO4"], answer: "H2SO4" },
  { id: 32, difficulty: 2, text: "O que é uma reação exotérmica?", options: ["Uma reação que libera calor", "Uma reação que absorve calor", "Uma reação que só ocorre no escuro", "Uma reação sem variação de energia"], answer: "Uma reação que libera calor" },
  { id: 33, difficulty: 2, text: "Qual das opções é um hidrocarboneto?", options: ["Metano (CH4)", "Amoníaco (NH3)", "Água (H2O)", "Dióxido de carbono (CO2)"], answer: "Metano (CH4)" },
  { id: 34, difficulty: 2, text: "Qual metal compõe majoritariamente a liga conhecida como aço?", options: ["Ferro", "Alumínio", "Cobre", "Zinco"], answer: "Ferro" },
  { id: 35, difficulty: 2, text: "A ferrugem é resultado de qual processo químico?", options: ["Oxidação", "Sublimação", "Fusão", "Neutralização"], answer: "Oxidação" },
  { id: 36, difficulty: 2, text: "Qual é o nome dado ao íon com carga elétrica positiva?", options: ["Cátion", "Ânion", "Isótopo", "Próton"], answer: "Cátion" },
  { id: 37, difficulty: 3, text: "O calcário é composto principalmente por qual substância?", options: ["Carbonato de cálcio", "Cloreto de sódio", "Sulfato de cobre", "Hidróxido de magnésio"], answer: "Carbonato de cálcio" },
  { id: 38, difficulty: 3, text: "Qual das seguintes substâncias é considerada uma base forte?", options: ["Hidróxido de sódio (NaOH)", "Ácido acético", "Água", "Amônia"], answer: "Hidróxido de sódio (NaOH)" },
  { id: 39, difficulty: 3, text: "Qual processo separa uma mistura de água e sal, permitindo recuperar ambos?", options: ["Destilação", "Filtração", "Decantação", "Centrifugação"], answer: "Destilação" },
  { id: 40, difficulty: 3, text: "A pilha original de Volta usava discos de zinco e qual outro metal?", options: ["Cobre", "Ferro", "Chumbo", "Alumínio"], answer: "Cobre" },

  // LEVEL 3 (HARD)
  { id: 41, difficulty: 3, text: "O que são isótopos?", options: ["Átomos com mesmo número de prótons e diferente de nêutrons", "Átomos com mesmo número de nêutrons e diferente de prótons", "Átomos com mesma massa atômica", "Átomos com o mesmo número de elétrons e diferente de prótons"], answer: "Átomos com mesmo número de prótons e diferente de nêutrons" },
  { id: 42, difficulty: 2, text: "Qual ácido está presente no suco gástrico do estômago humano?", options: ["Ácido clorídrico (HCl)", "Ácido sulfúrico (H2SO4)", "Ácido acético (CH3COOH)", "Ácido nítrico (HNO3)"], answer: "Ácido clorídrico (HCl)" },
  { id: 43, difficulty: 2, text: "Qual cientista elaborou a primeira versão da tabela periódica organizada por massa atômica?", options: ["Dmitri Mendeleev", "Antoine Lavoisier", "Marie Curie", "Linus Pauling"], answer: "Dmitri Mendeleev" },
  { id: 44, difficulty: 2, text: "Qual é o elemento mais abundante no universo?", options: ["Hidrogênio", "Oxigênio", "Carbono", "Hélio"], answer: "Hidrogênio" },
  { id: 45, difficulty: 3, text: "Qual é a hibridização do átomo de carbono na molécula de metano (CH4)?", options: ["sp3", "sp2", "sp", "sp3d"], answer: "sp3" },
  { id: 46, difficulty: 2, text: "Qual é a partícula sem carga elétrica presente no núcleo atômico?", options: ["Nêutron", "Próton", "Elétron", "Pósitron"], answer: "Nêutron" },
  { id: 47, difficulty: 3, text: "O que diz a Lei de Lavoisier?", options: ["Na natureza nada se cria, nada se perde, tudo se transforma", "Volumes iguais de gases contêm o mesmo número de moléculas", "A pressão de um gás é inversamente proporcional ao seu volume", "A velocidade de efusão de um gás é inversamente proporcional à raiz de sua massa"], answer: "Na natureza nada se cria, nada se perde, tudo se transforma" },
  { id: 48, difficulty: 2, text: "Qual é o pH de uma solução neutra a 25 °C?", options: ["7", "0", "14", "1"], answer: "7" },
  { id: 49, difficulty: 3, text: "Qual é a geometria molecular da molécula de amônia (NH3)?", options: ["Piramidal", "Angular", "Trigonal Plana", "Tetraédrica"], answer: "Piramidal" },
  { id: 50, difficulty: 3, text: "Quantos mols de moléculas existem em 18 gramas de água (H2O)?", options: ["1 mol", "2 mols", "0,5 mol", "18 mols"], answer: "1 mol" },
  { id: 51, difficulty: 3, text: "Qual princípio afirma ser impossível determinar simultaneamente a posição e o momento de um elétron?", options: ["Princípio da Incerteza de Heisenberg", "Princípio de Exclusão de Pauli", "Regra de Hund", "Efeito Fotoelétrico"], answer: "Princípio da Incerteza de Heisenberg" },
  { id: 52, difficulty: 3, text: "Qual é a massa molar aproximada do dióxido de carbono (CO2)?", options: ["44 g/mol", "28 g/mol", "32 g/mol", "18 g/mol"], answer: "44 g/mol" },
  { id: 53, difficulty: 3, text: "Na química orgânica, o que caracteriza a função aldeído?", options: ["Uma carbonila ligada a um átomo de hidrogênio na ponta", "Uma hidroxila ligada a carbono saturado", "Um oxigênio entre dois carbonos", "Uma carbonila entre dois carbonos"], answer: "Uma carbonila ligada a um átomo de hidrogênio na ponta" },
  { id: 54, difficulty: 3, text: "O que indica o número de Avogadro?", options: ["O número de entidades elementares em um mol", "A quantidade de elétrons na camada de valência", "O número de isótopos de um elemento", "A massa atômica de um elemento em gramas"], answer: "O número de entidades elementares em um mol" },
  { id: 55, difficulty: 2, text: "Qual cientista descobriu o elétron utilizando raios catódicos?", options: ["J.J. Thomson", "Ernest Rutherford", "Niels Bohr", "James Chadwick"], answer: "J.J. Thomson" },
  { id: 56, difficulty: 2, text: "Qual é o elemento mais eletronegativo da tabela periódica?", options: ["Flúor", "Oxigênio", "Nitrogênio", "Cloro"], answer: "Flúor" },
  { id: 57, difficulty: 3, text: "Na termoquímica, o que representa a Entalpia?", options: ["A quantidade de energia térmica de um sistema a pressão constante", "A desordem do sistema", "A velocidade da reação", "A energia de ativação"], answer: "A quantidade de energia térmica de um sistema a pressão constante" },
  { id: 58, difficulty: 2, text: "Qual é a fórmula do gás ozônio?", options: ["O3", "O2", "O4", "H2O2"], answer: "O3" },
  { id: 59, difficulty: 3, text: "Qual das funções orgânicas possui um grupo hidroxila (OH) diretamente ligado a um anel aromático?", options: ["Fenol", "Álcool", "Éter", "Cetona"], answer: "Fenol" },
  { id: 60, difficulty: 3, text: "A chuva ácida é formada principalmente pela reação da água com óxidos de quais elementos?", options: ["Enxofre e Nitrogênio", "Carbono e Fósforo", "Sódio e Potássio", "Cálcio e Magnésio"], answer: "Enxofre e Nitrogênio" },

  // LEVEL 4 (MILLION)
  { id: 61, difficulty: 3, text: "Qual é a geometria molecular da molécula de água (H2O)?", options: ["Angular", "Linear", "Trigonal Plana", "Tetraédrica"], answer: "Angular" },
  { id: 62, difficulty: 4, text: "Qual é a configuração eletrônica do gás nobre Argônio (Ar)?", options: ["1s² 2s² 2p⁶ 3s² 3p⁶", "1s² 2s² 2p⁶", "1s² 2s² 2p⁶ 3s² 3p⁵", "1s² 2s² 2p⁶ 3s¹"], answer: "1s² 2s² 2p⁶ 3s² 3p⁶" },
  { id: 63, difficulty: 4, text: "Qual desses polímeros é conhecido comercialmente como Teflon?", options: ["Politetrafluoretileno", "Policloreto de vinila", "Polietileno tereftalato", "Poliestireno"], answer: "Politetrafluoretileno" },
  { id: 64, difficulty: 4, text: "Qual foi o primeiro elemento químico sintético a ser produzido artificialmente?", options: ["Tecnécio", "Tório", "Urânio", "Plutônio"], answer: "Tecnécio" },
  { id: 65, difficulty: 3, text: "Qual destas vitaminas é quimicamente conhecida como ácido ascórbico?", options: ["Vitamina C", "Vitamina A", "Vitamina B12", "Vitamina D"], answer: "Vitamina C" },
  { id: 66, difficulty: 4, text: "Na termodinâmica, o que indica um valor negativo de variação da energia livre de Gibbs (ΔG < 0)?", options: ["A reação é espontânea", "A reação está em equilíbrio", "A reação absorve calor", "A reação não ocorre"], answer: "A reação é espontânea" },
  { id: 67, difficulty: 3, text: "Qual é o nome da reação de hidrólise alcalina de ésteres, amplamente usada na fabricação de sabão?", options: ["Saponificação", "Esterificação", "Polimerização", "Hidrogenação"], answer: "Saponificação" },
  { id: 68, difficulty: 4, text: "Qual complexo inorgânico é amplamente usado em tratamentos de quimioterapia para vários tipos de câncer?", options: ["Cisplatina", "EDTA", "Hemoglobina", "Ferroceno"], answer: "Cisplatina" },
  { id: 69, difficulty: 4, text: "De acordo com a teoria de orbitais moleculares, qual é a ordem de ligação da molécula de N2?", options: ["3", "2", "1", "0"], answer: "3" },
  { id: 70, difficulty: 4, text: "Qual o nome do sal cujo ânion é o hipoclorito, principal agente ativo da água sanitária?", options: ["Hipoclorito de sódio", "Cloreto de sódio", "Clorato de potássio", "Perclorato de sódio"], answer: "Hipoclorito de sódio" },
  { id: 71, difficulty: 4, text: "Qual a equação que relaciona a pressão, volume, temperatura e o número de mols de um gás ideal?", options: ["Equação de Clapeyron (PV = nRT)", "Lei de Boyle", "Equação de Arrhenius", "Equação de Nernst"], answer: "Equação de Clapeyron (PV = nRT)" },

  // EXPANDED SET — CRISTALOGRAFIA, POLIMORFISMO, REDES, DEFEITOS E OUTRAS ANIMAÇÕES
  { id: 72, difficulty: 1, text: "Em cristalografia, qual é o nome da menor parte que se repete para formar um cristal?", options: ["Célula unitária", "Molécula isolada", "Isótopo", "Núcleo atômico"], answer: "Célula unitária" },
  { id: 73, difficulty: 1, text: "Um material cristalino possui átomos organizados de que forma?", options: ["De modo ordenado e repetitivo", "Totalmente aleatório", "Sempre líquido", "Sem ligação química"], answer: "De modo ordenado e repetitivo" },
  { id: 74, difficulty: 1, text: "Qual material é um exemplo comum de sólido amorfo?", options: ["Vidro", "Sal de cozinha cristalino", "Diamante", "Quartzo"], answer: "Vidro" },
  { id: 75, difficulty: 1, text: "O que é polimorfismo em sólidos?", options: ["A mesma substância em diferentes estruturas cristalinas", "Uma mistura de vários líquidos", "A mudança de cor de uma chama", "A perda total de massa"], answer: "A mesma substância em diferentes estruturas cristalinas" },
  { id: 76, difficulty: 1, text: "Diamante e grafite são formas diferentes de qual elemento?", options: ["Carbono", "Oxigênio", "Ferro", "Cloro"], answer: "Carbono" },
  { id: 77, difficulty: 1, text: "Qual defeito cristalino ocorre quando falta um átomo em uma posição da rede?", options: ["Vacância", "Ligação covalente", "Sublimação", "Evaporação"], answer: "Vacância" },
  { id: 78, difficulty: 1, text: "Qual defeito ocorre quando um átomo fica em um espaço entre posições normais da rede?", options: ["Intersticial", "Molecular", "Gasoso", "Volumétrico"], answer: "Intersticial" },
  { id: 79, difficulty: 1, text: "Como se chama o número de vizinhos mais próximos de um átomo em uma estrutura?", options: ["Número de coordenação", "Número atômico", "Massa molar", "pH"], answer: "Número de coordenação" },
  { id: 80, difficulty: 1, text: "Quais são dois tipos comuns de buracos em empacotamentos cristalinos?", options: ["Tetraédricos e octaédricos", "Ácidos e básicos", "Sólidos e gasosos", "Metálicos e neutros"], answer: "Tetraédricos e octaédricos" },
  { id: 81, difficulty: 1, text: "Em uma célula cúbica simples, os átomos aparecem principalmente em quais posições?", options: ["Nos vértices do cubo", "No centro de cada aresta apenas", "Somente no centro do cubo", "Fora da célula"], answer: "Nos vértices do cubo" },
  { id: 82, difficulty: 1, text: "Na estrutura cúbica de corpo centrado, existe um átomo adicional em qual região?", options: ["No centro do cubo", "No meio de uma ligação", "Fora da célula", "Apenas nas faces"], answer: "No centro do cubo" },
  { id: 83, difficulty: 1, text: "Na estrutura cúbica de face centrada, há átomos adicionais em quais regiões?", options: ["No centro das faces", "No centro das arestas", "Apenas no interior vazio", "Somente nos vértices"], answer: "No centro das faces" },
  { id: 84, difficulty: 1, text: "Qual técnica é muito usada para investigar a estrutura cristalina de materiais?", options: ["Difração de raios X", "Destilação simples", "Titulação ácido-base", "Filtração comum"], answer: "Difração de raios X" },
  { id: 85, difficulty: 1, text: "Em laboratório, qual vidraria mede e libera líquido gota a gota em uma titulação?", options: ["Bureta", "Béquer", "Funil simples", "Cadinho"], answer: "Bureta" },
  { id: 86, difficulty: 1, text: "Qual vidraria é mais indicada para medir volumes com alta precisão em uma única marca?", options: ["Pipeta volumétrica", "Béquer", "Erlenmeyer", "Proveta improvisada"], answer: "Pipeta volumétrica" },
  { id: 87, difficulty: 1, text: "Uma molécula polar apresenta distribuição de cargas de que tipo?", options: ["Assimétrica", "Sempre nula", "Totalmente metálica", "Sem elétrons"], answer: "Assimétrica" },
  { id: 88, difficulty: 1, text: "Qual geometria molecular é típica da molécula de CO2?", options: ["Linear", "Angular", "Piramidal", "Tetraédrica"], answer: "Linear" },
  { id: 89, difficulty: 1, text: "Qual geometria molecular é típica da molécula de água?", options: ["Angular", "Linear", "Trigonal plana", "Octaédrica"], answer: "Angular" },
  { id: 90, difficulty: 1, text: "Em uma rede cristalina, o que representa um ponto de rede?", options: ["Uma posição repetitiva equivalente", "Um erro de cálculo", "Um átomo sempre radioativo", "Uma molécula de água"], answer: "Uma posição repetitiva equivalente" },
  { id: 91, difficulty: 1, text: "Qual ligação costuma ocorrer entre metal e ametal por transferência de elétrons?", options: ["Iônica", "Covalente apolar", "Metálica pura", "Ponte de hidrogênio"], answer: "Iônica" },
  { id: 92, difficulty: 2, text: "Quantos sistemas cristalinos existem na classificação tradicional da cristalografia?", options: ["7", "4", "10", "14"], answer: "7" },
  { id: 93, difficulty: 2, text: "Quantas redes de Bravais existem em três dimensões?", options: ["14", "7", "32", "230"], answer: "14" },
  { id: 94, difficulty: 2, text: "No sistema cúbico, quais relações entre os parâmetros de rede são corretas?", options: ["a = b = c e ângulos de 90°", "a ≠ b ≠ c e ângulos de 120°", "a = b ≠ c e ângulos de 90°", "a = b = c e ângulos diferentes"], answer: "a = b = c e ângulos de 90°" },
  { id: 95, difficulty: 2, text: "Quantos átomos efetivos existem em uma célula cúbica simples?", options: ["1", "2", "4", "8"], answer: "1" },
  { id: 96, difficulty: 2, text: "Quantos átomos efetivos existem em uma célula cúbica de corpo centrado?", options: ["2", "1", "4", "6"], answer: "2" },
  { id: 97, difficulty: 2, text: "Quantos átomos efetivos existem em uma célula cúbica de face centrada?", options: ["4", "1", "2", "8"], answer: "4" },
  { id: 98, difficulty: 2, text: "Qual é o número de coordenação da estrutura cúbica de corpo centrado?", options: ["8", "6", "12", "4"], answer: "8" },
  { id: 99, difficulty: 2, text: "Qual é o número de coordenação da estrutura cúbica de face centrada?", options: ["12", "8", "6", "4"], answer: "12" },
  { id: 100, difficulty: 2, text: "Qual é a eficiência de empacotamento aproximada da estrutura cúbica de face centrada?", options: ["74%", "52%", "68%", "100%"], answer: "74%" },
  { id: 101, difficulty: 2, text: "Qual é a eficiência de empacotamento aproximada da estrutura cúbica de corpo centrado?", options: ["68%", "74%", "52%", "25%"], answer: "68%" },
  { id: 102, difficulty: 2, text: "Na rede cúbica de face centrada, os átomos se tocam ao longo de qual direção geométrica?", options: ["Diagonal da face", "Aresta do cubo", "Diagonal espacial do cubo", "Altura externa"], answer: "Diagonal da face" },
  { id: 103, difficulty: 2, text: "Na rede cúbica de corpo centrado, os átomos se tocam ao longo de qual direção geométrica?", options: ["Diagonal do corpo", "Aresta do cubo", "Diagonal da face", "Linha fora da célula"], answer: "Diagonal do corpo" },
  { id: 104, difficulty: 2, text: "Em empacotamentos compactos, um buraco tetraédrico é cercado por quantos átomos?", options: ["4", "6", "8", "12"], answer: "4" },
  { id: 105, difficulty: 2, text: "Em empacotamentos compactos, um buraco octaédrico é cercado por quantos átomos?", options: ["6", "4", "8", "12"], answer: "6" },
  { id: 106, difficulty: 2, text: "Em uma célula cúbica de face centrada com N átomos, quantos buracos octaédricos existem?", options: ["N", "2N", "N/2", "4N"], answer: "N" },
  { id: 107, difficulty: 2, text: "Em uma célula cúbica de face centrada com N átomos, quantos buracos tetraédricos existem?", options: ["2N", "N", "N/2", "4"], answer: "2N" },
  { id: 108, difficulty: 2, text: "Qual defeito envolve um átomo substituindo outro em uma posição regular da rede?", options: ["Substitucional", "Vacância dupla", "Sublimação", "Cristalização"], answer: "Substitucional" },
  { id: 109, difficulty: 2, text: "Qual defeito em sólidos iônicos envolve um par de vacâncias: uma de cátion e uma de ânion?", options: ["Defeito de Schottky", "Defeito de Frenkel", "Dislocação em hélice", "Contorno de grão"], answer: "Defeito de Schottky" },
  { id: 110, difficulty: 2, text: "Qual defeito ocorre quando um íon sai de sua posição normal e vai para um interstício?", options: ["Defeito de Frenkel", "Defeito de Schottky", "Plano de Miller", "Empacotamento compacto"], answer: "Defeito de Frenkel" },
  { id: 111, difficulty: 2, text: "Na notação de Miller, os índices (hkl) representam o quê?", options: ["Planos cristalográficos", "Estados físicos", "Cargas elétricas", "Números quânticos apenas"], answer: "Planos cristalográficos" },
  { id: 112, difficulty: 3, text: "Para uma célula cúbica simples, qual é a relação entre a aresta a e o raio atômico r?", options: ["a = 2r", "a = 4r/√3", "a = 4r/√2", "a = r/2"], answer: "a = 2r" },
  { id: 113, difficulty: 3, text: "Para uma célula cúbica de corpo centrado, qual é a relação correta entre a e r?", options: ["a = 4r/√3", "a = 2r", "a = 4r/√2", "a = √2r"], answer: "a = 4r/√3" },
  { id: 114, difficulty: 3, text: "Para uma célula cúbica de face centrada, qual é a relação correta entre a e r?", options: ["a = 4r/√2", "a = 2r", "a = 4r/√3", "a = r√3"], answer: "a = 4r/√2" },
  { id: 115, difficulty: 3, text: "Qual é a expressão do espaçamento interplanar d para cristais cúbicos?", options: ["d = a/√(h²+k²+l²)", "d = a(h+k+l)", "d = √a/(hkl)", "d = 2a senθ"], answer: "d = a/√(h²+k²+l²)" },
  { id: 116, difficulty: 3, text: "Qual lei relaciona difração, comprimento de onda, espaçamento interplanar e ângulo?", options: ["Lei de Bragg", "Lei de Hess", "Lei de Raoult", "Lei de Graham"], answer: "Lei de Bragg" },
  { id: 117, difficulty: 3, text: "Qual é a forma mais comum da Lei de Bragg?", options: ["nλ = 2d senθ", "PV = nRT", "E = mc²", "ΔG = ΔH - TΔS"], answer: "nλ = 2d senθ" },
  { id: 118, difficulty: 3, text: "Em uma estrutura cúbica de corpo centrado, quais reflexões são permitidas em difração de raios X?", options: ["Quando h+k+l é par", "Quando h+k+l é ímpar", "Somente quando h=0", "Todas sem restrição"], answer: "Quando h+k+l é par" },
  { id: 119, difficulty: 3, text: "Em uma estrutura cúbica de face centrada, quais reflexões são permitidas?", options: ["h, k e l todos pares ou todos ímpares", "Apenas h+k+l ímpar", "Somente h=0", "Nenhuma reflexão"], answer: "h, k e l todos pares ou todos ímpares" },
  { id: 120, difficulty: 3, text: "Qual tipo de defeito cristalino é uma dislocação?", options: ["Defeito linear", "Defeito pontual", "Defeito volumétrico apenas", "Defeito molecular gasoso"], answer: "Defeito linear" },
  { id: 121, difficulty: 3, text: "Qual tipo de defeito é um contorno de grão?", options: ["Defeito planar", "Defeito pontual", "Defeito linear isolado", "Defeito eletrônico apenas"], answer: "Defeito planar" },
  { id: 122, difficulty: 3, text: "O aumento da temperatura tende a afetar a concentração de vacâncias de que modo?", options: ["Aumenta a concentração", "Zera todas as vacâncias", "Não altera nunca", "Transforma vacâncias em prótons"], answer: "Aumenta a concentração" },
  { id: 123, difficulty: 3, text: "Na estrutura do NaCl, qual é a coordenação típica de Na+ e Cl-?", options: ["6:6", "4:4", "8:8", "12:12"], answer: "6:6" },
  { id: 124, difficulty: 3, text: "Na estrutura tipo CsCl, qual é a coordenação típica dos íons?", options: ["8:8", "6:6", "4:4", "12:12"], answer: "8:8" },
  { id: 125, difficulty: 3, text: "Na estrutura tipo blenda de zinco (ZnS), qual é a coordenação típica?", options: ["4:4", "6:6", "8:8", "12:12"], answer: "4:4" },
  { id: 126, difficulty: 3, text: "A sequência de empilhamento ABAB é característica de qual estrutura compacta?", options: ["Hexagonal compacta (HCP)", "Cúbica simples", "Cúbica de corpo centrado", "Amorfa"], answer: "Hexagonal compacta (HCP)" },
  { id: 127, difficulty: 3, text: "A sequência de empilhamento ABCABC é característica de qual estrutura compacta?", options: ["Cúbica de face centrada (FCC)", "Hexagonal simples", "Cúbica simples", "Monoclínica"], answer: "Cúbica de face centrada (FCC)" },
  { id: 128, difficulty: 3, text: "Em química do estado sólido, polimorfos diferentes podem apresentar diferenças em qual propriedade?", options: ["Solubilidade e estabilidade", "Número de prótons do elemento", "Identidade nuclear dos átomos", "Carga total dos elétrons isolados"], answer: "Solubilidade e estabilidade" },
  { id: 129, difficulty: 3, text: "Em sólidos farmacêuticos, por que o polimorfismo é importante?", options: ["Pode alterar dissolução e biodisponibilidade", "Sempre impede qualquer reação", "Remove todos os defeitos", "Transforma moléculas em gases nobres"], answer: "Pode alterar dissolução e biodisponibilidade" },
  { id: 130, difficulty: 3, text: "Qual interação intermolecular é especialmente forte quando H está ligado a F, O ou N?", options: ["Ligação de hidrogênio", "Força de London apenas", "Ligação metálica", "Interação nuclear forte"], answer: "Ligação de hidrogênio" },
  { id: 131, difficulty: 3, text: "Pelo método VSEPR, quantos domínios eletrônicos ao redor do átomo central geram geometria tetraédrica?", options: ["4", "2", "3", "6"], answer: "4" },
  { id: 132, difficulty: 4, text: "Na difração de cristais cúbicos, os valores de sen²θ são proporcionais a qual termo?", options: ["h²+k²+l²", "h+k+l", "abc", "α+β+γ"], answer: "h²+k²+l²" },
  { id: 133, difficulty: 4, text: "Na notação de Miller-Bravais para cristais hexagonais, qual relação envolve o índice i?", options: ["i = -(h+k)", "i = h+k", "i = l-h", "i = 2k"], answer: "i = -(h+k)" },
  { id: 134, difficulty: 4, text: "Qual conceito descreve a menor região ao redor de um ponto de rede que está mais próxima dele do que de qualquer outro ponto?", options: ["Célula de Wigner-Seitz", "Defeito de Frenkel", "Buraco tetraédrico", "Plano basal"], answer: "Célula de Wigner-Seitz" },
  { id: 135, difficulty: 4, text: "Quantos grupos espaciais cristalográficos existem em três dimensões?", options: ["230", "14", "32", "7"], answer: "230" },
  { id: 136, difficulty: 4, text: "Quantos grupos pontuais cristalográficos existem em três dimensões?", options: ["32", "14", "230", "7"], answer: "32" },
  { id: 137, difficulty: 4, text: "Qual vetor descreve a magnitude e a direção da distorção associada a uma dislocação?", options: ["Vetor de Burgers", "Vetor dipolo", "Vetor normal de pH", "Vetor de Avogadro"], answer: "Vetor de Burgers" },
  { id: 138, difficulty: 4, text: "Qual defeito planar está associado a uma interrupção na sequência normal de empilhamento?", options: ["Falha de empilhamento", "Defeito de Schottky", "Vacância isolada", "Defeito intersticial simples"], answer: "Falha de empilhamento" },
  { id: 139, difficulty: 4, text: "Em cristalografia, o espaço recíproco é especialmente útil para interpretar qual fenômeno?", options: ["Difração", "Evaporação", "Decantação", "Neutralização"], answer: "Difração" },
  { id: 140, difficulty: 4, text: "Em uma transição polimórfica enantiotrópica, o que ocorre entre duas formas cristalinas?", options: ["Cada forma é estável em uma faixa de temperatura", "Uma forma nunca pode existir", "As formas têm elementos químicos diferentes", "O material vira amorfo obrigatoriamente"], answer: "Cada forma é estável em uma faixa de temperatura" },
  { id: 141, difficulty: 4, text: "Em uma relação monotrópica entre polimorfos, como é a estabilidade relativa?", options: ["Uma forma é mais estável em toda a faixa considerada", "As duas alternam estabilidade infinitamente", "Nenhuma forma cristaliza", "As formas têm fórmulas diferentes"], answer: "Uma forma é mais estável em toda a faixa considerada" },
  { id: 142, difficulty: 4, text: "Qual rede de Bravais NÃO pertence ao sistema tetragonal?", options: ["Tetragonal de face centrada", "Tetragonal primitiva", "Tetragonal de corpo centrado", "Todas pertencem"], answer: "Tetragonal de face centrada" },
  { id: 143, difficulty: 4, text: "Quantas redes de Bravais existem no sistema ortorrômbico?", options: ["4", "2", "1", "7"], answer: "4" },
  { id: 144, difficulty: 4, text: "Em uma rede cúbica, qual família de planos tem maior espaçamento interplanar entre (100), (110) e (111)?", options: ["(100)", "(110)", "(111)", "Todas iguais"], answer: "(100)" },
  { id: 145, difficulty: 4, text: "Qual é a razão mínima aproximada r+/r- para um cátion ocupar de forma estável um buraco octaédrico?", options: ["0,414", "0,225", "0,732", "1,000"], answer: "0,414" },
  { id: 146, difficulty: 4, text: "Qual é a razão mínima aproximada r+/r- para um cátion ocupar um buraco tetraédrico?", options: ["0,225", "0,414", "0,732", "1,000"], answer: "0,225" },
  { id: 147, difficulty: 4, text: "Na estrutura perovskita ideal ABO3, qual íon costuma ocupar o centro do octaedro BO6?", options: ["B", "A", "O", "Nenhum íon"], answer: "B" },
  { id: 148, difficulty: 4, text: "Qual fator termodinâmico governa a espontaneidade de uma transformação de fase a T e P constantes?", options: ["Energia livre de Gibbs", "Massa molar", "Número atômico", "Volume da pipeta"], answer: "Energia livre de Gibbs" },
  { id: 149, difficulty: 4, text: "Em diagramas de fases da água, o ponto triplo representa o quê?", options: ["Equilíbrio entre sólido, líquido e vapor", "Apenas ebulição normal", "Apenas fusão do gelo", "Mistura de dois sais"], answer: "Equilíbrio entre sólido, líquido e vapor" },
  { id: 150, difficulty: 4, text: "No modelo hidrogenoide, quais números quânticos definem um orbital atômico?", options: ["n, l e m", "pH, pOH e Ka", "a, b e c", "h, k e l somente"], answer: "n, l e m" },
  { id: 151, difficulty: 4, text: "Qual é a principal informação visual de uma isossuperfície orbital?", options: ["A região de maior probabilidade eletrônica", "A temperatura de ebulição", "O número de faces do cristal", "A massa do núcleo em gramas"], answer: "A região de maior probabilidade eletrônica" },
];

    const prizes = [
  { level: 1, acerta: 1000, para: 0, erra: 0 },
  { level: 2, acerta: 2000, para: 1000, erra: 500 },
  { level: 3, acerta: 3000, para: 2000, erra: 1000 },
  { level: 4, acerta: 4000, para: 3000, erra: 1500 },
  { level: 5, acerta: 5000, para: 4000, erra: 2000 },
  { level: 6, acerta: 10000, para: 5000, erra: 2500 },
  { level: 7, acerta: 20000, para: 10000, erra: 5000 },
  { level: 8, acerta: 30000, para: 20000, erra: 10000 },
  { level: 9, acerta: 40000, para: 30000, erra: 15000 },
  { level: 10, acerta: 50000, para: 40000, erra: 20000 },
  { level: 11, acerta: 100000, para: 50000, erra: 25000 },
  { level: 12, acerta: 200000, para: 100000, erra: 50000 },
  { level: 13, acerta: 300000, para: 200000, erra: 100000 },
  { level: 14, acerta: 400000, para: 300000, erra: 150000 },
  { level: 15, acerta: 500000, para: 400000, erra: 200000 },
  { level: 16, acerta: 1000000, para: 500000, erra: 0 },
];

    const LOGO_SRC = "assets/media/image-001.png";
    const AUDIO_SRC = {"start":["assets/media/audio-001.mp3"],"openingMusic":["assets/media/audio-002.mp3","assets/media/audio-003.mp3","assets/media/audio-004.mp3"],"participantIntro":"assets/media/audio-005.mp3","questionIntro":"assets/media/audio-006.mp3","suspense":["assets/media/audio-007.mp3","assets/media/audio-008.mp3","assets/media/audio-009.mp3","assets/media/audio-010.mp3","assets/media/audio-011.mp3","assets/media/audio-012.mp3","assets/media/audio-013.mp3"],"round1":"assets/media/audio-014.mp3","round2":"assets/media/audio-015.mp3","round3":"assets/media/audio-016.mp3","prize_1000":"assets/media/audio-017.mp3","prize_2000":"assets/media/audio-018.mp3","prize_3000":"assets/media/audio-019.mp3","prize_4000":"assets/media/audio-020.mp3","prize_5000":"assets/media/audio-021.mp3","prize_10000":"assets/media/audio-022.mp3","prize_20000":"assets/media/audio-023.mp3","prize_30000":"assets/media/audio-024.mp3","prize_40000":"assets/media/audio-025.mp3","prize_50000":"assets/media/audio-026.mp3","prize_100000":"assets/media/audio-027.mp3","prize_200000":"assets/media/audio-028.mp3","prize_300000":"assets/media/audio-029.mp3","prize_400000":"assets/media/audio-030.mp3","prize_500000":"assets/media/audio-031.mp3","prize_1000000":"assets/media/audio-032.mp3","confirmPrompt":["assets/media/audio-033.mp3"],"answerReveal":"assets/media/audio-034.mp3","correct":["assets/media/audio-035.mp3","assets/media/audio-036.mp3"],"wrong":["assets/media/audio-037.mp3","assets/media/audio-038.mp3"],"timeup":["assets/media/audio-039.mp3","assets/media/audio-040.mp3"],"timerFinal":"assets/media/audio-041.mp3","helpPrompt":["assets/media/audio-042.mp3","assets/media/audio-043.mp3","assets/media/audio-044.mp3"],"studentsHelp":"assets/media/audio-045.mp3","platesHelp":"assets/media/audio-046.mp3","cardsHelp":"assets/media/audio-047.mp3","cardsPick":"assets/media/audio-048.mp3","withdraw":["assets/media/audio-049.mp3","assets/media/audio-050.mp3","assets/media/audio-051.mp3","assets/media/audio-052.mp3","assets/media/audio-053.mp3","assets/media/audio-054.mp3"],"millionTeaser":["assets/media/audio-055.mp3","assets/media/audio-056.mp3","assets/media/audio-057.mp3","assets/media/audio-058.mp3"],"millionWin":["assets/media/audio-059.mp3","assets/media/audio-060.mp3","assets/media/audio-061.mp3"],"congrats":["assets/media/audio-062.mp3","assets/media/audio-063.mp3"],"coins":"assets/media/audio-064.mp3","questionChatter":["assets/media/audio-065.mp3","assets/media/audio-066.mp3","assets/media/audio-067.mp3","assets/media/audio-068.mp3","assets/media/audio-069.mp3","assets/media/audio-070.mp3","assets/media/audio-071.mp3","assets/media/audio-072.mp3","assets/media/audio-073.mp3","assets/media/audio-074.mp3"],"goodbye":"assets/media/audio-075.mp3"};

    const app = document.getElementById('app');
    const audioEls = {};
    let timerId = null;
    let currentRevealTimeouts = [];
    let currentAudio = null;
    let currentAudioName = null;
    let audioQueue = [];
    let audioLockToken = 0;
    let introMusicAudio = null;
    let introMusicSource = null;
    let introAutoplayBlocked = false;

    const state = {
      gameState: 'start',
      questions: [],
      currentIndex: 0,
      options: [],
      selectedOption: null,
      isConfirming: false,
      isRevealing: false,
      skipsLeft: 3,
      cardsUsed: false,
      studentsUsed: false,
      platesUsed: false,
      eliminatedIndices: [],
      helpMode: null,
      helpMessage: '',
      winnings: 0,
      soundEnabled: true,
      timeLeft: 60,
      audioLocked: false
    };

    function shuffle(array) {
      return [...array].sort(() => Math.random() - 0.5);
    }

    function getGameQuestions() {
      // Progressão revisada: 5 fáceis, 5 médias, 5 difíceis e 1 pergunta final do milhão.
      const easy = allQuestions.filter(q => q.difficulty === 1);
      const medium = allQuestions.filter(q => q.difficulty === 2);
      const hard = allQuestions.filter(q => q.difficulty === 3);
      const million = allQuestions.filter(q => q.difficulty === 4);
      return [
        ...shuffle(easy).slice(0, 5),
        ...shuffle(medium).slice(0, 5),
        ...shuffle(hard).slice(0, 5),
        ...shuffle(million).slice(0, 1)
      ];
    }

    function shuffleOptions(options, answer) {
      return shuffle(options.map(opt => ({ text: opt, isCorrect: opt === answer })));
    }

    function formatMoney(amount) {
      return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
    }

    function escapeHTML(value) {
      return String(value).replace(/[&<>"']/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
      }[char]));
    }

    function fmtTimer(sec) {
      const s = Math.max(0, sec);
      return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
    }

    function audioSourceFor(name) {
      const entry = AUDIO_SRC[name];
      if (!entry) return null;
      if (Array.isArray(entry)) return entry[Math.floor(Math.random() * entry.length)];
      return entry;
    }

    function isAudioPlaying(audio) {
      return audio && !audio.paused && !audio.ended;
    }

    function isAnyManagedAudioPlaying() {
      return isAudioPlaying(currentAudio);
    }

    const INTERRUPTIBLE_AUDIO_NAMES = new Set([
      'suspense',
      'start', 'openingMusic', 'participantIntro', 'questionIntro', 'questionChatter',
      'round1', 'round2', 'round3',
      'millionTeaser',
      ...Object.keys(AUDIO_SRC).filter(name => name.startsWith('prize_'))
    ]);

    function isCurrentAudioInterruptible() {
      return INTERRUPTIBLE_AUDIO_NAMES.has(currentAudioName);
    }

    function interruptCurrentAudioIfAllowed() {
      if (!isCurrentAudioInterruptible()) return false;
      clearAudioQueue();
      stopSound(currentAudioName);
      return true;
    }

    function updateAudioLockUI() {
      const locked = !!state.audioLocked && state.soundEnabled;
      const interruptible = locked && isCurrentAudioInterruptible();
      app.classList.toggle('audio-waiting', locked);
      document.body.classList.toggle('audio-waiting', locked);
      app.classList.toggle('audio-interruptible', interruptible);
      document.body.classList.toggle('audio-interruptible', interruptible);
    }

    function tryUnlockStartScreenMusic(event) {
      if (state.gameState !== 'start' || !state.soundEnabled) return;
      if (event && event.target.closest('.button.big')) return;
      playStartScreenIntroMusic(true);
    }

    document.addEventListener('pointerdown', tryUnlockStartScreenMusic, true);
    document.addEventListener('keydown', tryUnlockStartScreenMusic, true);

    document.addEventListener('click', function(event) {
      if (!state.audioLocked) return;
      if (event.target.closest('.sound-toggle')) return;
      if (interruptCurrentAudioIfAllowed()) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    }, true);

    function getAudio(name) {
      if (!AUDIO_SRC[name]) return null;
      if (!audioEls[name]) {
        const src = audioSourceFor(name);
        if (!src) return null;
        const audio = new Audio(src);
        audio.preload = 'auto';
        audioEls[name] = audio;
      }
      return audioEls[name];
    }

    function clearAudioQueue() {
      audioQueue = [];
    }

    function finishManagedAudio(audio, token) {
      if (token !== audioLockToken || currentAudio !== audio) return;
      currentAudio = null;
      currentAudioName = null;
      state.audioLocked = false;
      updateAudioLockUI();
      playNextQueuedAudio();
    }

    function playNextQueuedAudio() {
      if (!state.soundEnabled || isAnyManagedAudioPlaying()) return;
      const next = audioQueue.shift();
      if (!next) return;
      playSound(next.name, next.opts);
    }

    function stopSound(name, opts = {}) {
      const audio = audioEls[name];
      if (!audio) return;
      audio.pause();
      audio.loop = false;
      try { audio.currentTime = 0; } catch (e) {}
      if (currentAudio === audio) {
        currentAudio = null;
        currentAudioName = null;
        state.audioLocked = false;
        updateAudioLockUI();
        if (opts.playQueue) playNextQueuedAudio();
      }
    }

    function stopAllSounds(exceptName = null, opts = {}) {
      const force = !!opts.force;
      if (force) {
        clearAudioQueue();
        stopStartScreenIntroMusic();
      }
      Object.keys(audioEls).forEach(key => {
        if (key === exceptName) return;
        const audio = audioEls[key];
        // Sem force, não corta o áudio principal que está tocando.
        // Só limpa o cronômetro/áudios já parados para não embolar.
        if (force || key === 'timerFinal' || !isAudioPlaying(audio)) stopSound(key);
      });
      if (force) {
        currentAudio = null;
        currentAudioName = null;
        state.audioLocked = false;
        updateAudioLockUI();
      }
    }

    function playSound(name, opts = {}) {
      if (!state.soundEnabled || !AUDIO_SRC[name]) {
        if (typeof opts.onEnded === 'function') setTimeout(opts.onEnded, 0);
        return;
      }

      // Se já existe um áudio principal tocando, NÃO corta.
      // Ele coloca o próximo na fila e só toca quando o atual terminar.
      // Exceções: cronômetro, suspense e chamadas de introdução podem ser interrompidos por uma ação do jogador.
      if (isAnyManagedAudioPlaying()) {
        if (currentAudioName === 'timerFinal' && name !== 'timerFinal') {
          stopSound('timerFinal');
        } else if (isCurrentAudioInterruptible()) {
          if (name === currentAudioName || opts.skipIfBusy) return;
          clearAudioQueue();
          stopSound(currentAudioName);
        } else {
          if (opts.skipIfBusy) return;
          audioQueue.push({ name, opts: { ...opts } });
          return;
        }
      }

      const shouldPickNew = opts.random !== false || !audioEls[name];
      if (shouldPickNew) {
        const oldAudio = audioEls[name];
        if (oldAudio && isAudioPlaying(oldAudio)) stopSound(name);
        const src = audioSourceFor(name);
        if (!src) return;
        const audio = new Audio(src);
        audio.preload = 'auto';
        audioEls[name] = audio;
      }

      const audio = audioEls[name];
      if (!audio) return;

      // Garante que nada toque junto. Áudios anteriores parados/cronômetro são limpos,
      // mas o áudio principal nunca é cortado sem force.
      stopAllSounds(name);

      audio.loop = !!opts.loop;
      if (opts.restart !== false) {
        try { audio.currentTime = 0; } catch (e) {}
      }
      audio.volume = opts.volume ?? 1;

      currentAudio = audio;
      currentAudioName = name;
      const token = ++audioLockToken;

      if (opts.lockControls !== false) {
        state.audioLocked = true;
        updateAudioLockUI();
      }

      let callbackDone = false;
      const runAudioCallback = () => {
        if (callbackDone) return;
        callbackDone = true;
        if (typeof opts.onEnded === 'function') opts.onEnded();
      };
      const finishAndCallback = () => {
        finishManagedAudio(audio, token);
        runAudioCallback();
      };

      audio.onended = finishAndCallback;
      audio.onerror = finishAndCallback;

      audio.play().catch(finishAndCallback);
    }

    function playRandomCue(names, opts = {}) {
      const available = names.filter(name => AUDIO_SRC[name]);
      if (!available.length) return;
      const picked = available[Math.floor(Math.random() * available.length)];
      playSound(picked, opts);
    }

    function playTimerFinalIfNeeded() {
      if (state.gameState !== 'playing') return;
      if (state.timeLeft > 0 && state.timeLeft <= 10 && !state.helpMode && !state.isConfirming && !state.isRevealing) {
        const timerAudio = getAudio('timerFinal');
        if (timerAudio && (timerAudio.paused || timerAudio.ended) && !isAnyManagedAudioPlaying()) {
          playSound('timerFinal', { volume: 1, random: false, restart: false, lockControls: false, skipIfBusy: true });
        }
      }
    }

    function clearTimer() {
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
    }

    function startTimer() {
      clearTimer();
      if (state.gameState !== 'playing') return;
      playTimerFinalIfNeeded();
      timerId = setInterval(() => {
        if (state.gameState !== 'playing' || state.helpMode || state.isConfirming || state.isRevealing) return;
        if (state.timeLeft <= 1) {
          state.timeLeft = 0;
          updateTimerOnly();
          stopSound('timerFinal');
          clearTimer();
          handleTimeUp();
          return;
        }
        state.timeLeft -= 1;
        updateTimerOnly();
        playTimerFinalIfNeeded();
      }, 1000);
    }

    function resetQuestionTimer() {
      state.timeLeft = 60;
      startTimer();
    }

    function updateTimerOnly() {
      const display = document.getElementById('timerDisplay');
      const card = document.getElementById('timerCard');
      if (display) display.textContent = fmtTimer(state.timeLeft);
      if (card) card.classList.toggle('warning', state.timeLeft <= 10);
    }

    function queueTimeout(fn, ms) {
      const id = setTimeout(fn, ms);
      currentRevealTimeouts.push(id);
      return id;
    }

    function clearQueuedTimeouts() {
      currentRevealTimeouts.forEach(clearTimeout);
      currentRevealTimeouts = [];
    }

    
    function updateStartAudioHint() {
      const hint = document.getElementById('startAudioHint');
      if (!hint) return;
      hint.textContent = introAutoplayBlocked
        ? '🎵 Clique no logo ou no fundo para ativar a música de abertura'
        : '🎵 Música de abertura pronta nesta tela';
    }

    function stopStartScreenIntroMusic() {
      if (!introMusicAudio) return;
      introMusicAudio.pause();
      try { introMusicAudio.currentTime = 0; } catch (e) {}
    }

    function getStartScreenIntroAudio() {
      const entry = AUDIO_SRC.openingMusic;
      if (!entry) return null;
      if (!introMusicSource) {
        introMusicSource = Array.isArray(entry) ? entry[Math.floor(Math.random() * entry.length)] : entry;
      }
      if (!introMusicAudio) {
        introMusicAudio = new Audio(introMusicSource);
        introMusicAudio.preload = 'auto';
        introMusicAudio.loop = true;
        introMusicAudio.volume = .72;
      }
      return introMusicAudio;
    }

    function playStartScreenIntroMusic(fromUserGesture = false) {
      if (state.gameState !== 'start' || !state.soundEnabled || !AUDIO_SRC.openingMusic) return;
      const audio = getStartScreenIntroAudio();
      if (!audio || !audio.paused) return;
      introAutoplayBlocked = false;
      updateStartAudioHint();
      audio.play().catch(() => {
        introAutoplayBlocked = true;
        updateStartAudioHint();
      });
    }

    function prizeAudioKey(index) {
      const amount = prizes[index]?.acerta;
      return amount ? 'prize_' + amount : null;
    }

    function playQuestionCue() {
      if (state.gameState !== 'playing') return;
      const index = state.currentIndex;
      const cues = [];
      const prizeKey = prizeAudioKey(index);

      if (index === 0) cues.push('participantIntro', 'round1');
      else if (index === 5) cues.push('round2');
      else if (index === 10) cues.push('round3');

      if (index === 15) cues.push('millionTeaser', 'prize_1000000');
      else if (prizeKey) cues.push(prizeKey);

      cues.push('questionIntro');
      if (Math.random() < .35 || index === 15) cues.push('questionChatter');

      queueTimeout(() => playRandomCue(cues, { volume: .95 }), 350);
    }

    function playConfirmPromptThenSuspense() {
      playSound('confirmPrompt', {
        volume: .95,
        onEnded: () => {
          if (state.gameState !== 'playing' || !state.isConfirming || state.isRevealing) return;
          playSound('suspense', {
            volume: .85,
            lockControls: false
          });
        }
      });
    }

    function startGame() {
      clearQueuedTimeouts();
      stopAllSounds(null, { force: true });
      state.questions = getGameQuestions();
      state.currentIndex = 0;
      state.options = shuffleOptions(state.questions[0].options, state.questions[0].answer);
      state.gameState = 'playing';
      state.skipsLeft = 3;
      state.cardsUsed = false;
      state.studentsUsed = false;
      state.platesUsed = false;
      state.eliminatedIndices = [];
      state.selectedOption = null;
      state.isConfirming = false;
      state.isRevealing = false;
      state.helpMode = null;
      state.helpMessage = '';
      state.winnings = 0;
      state.timeLeft = 60;
      state.audioLocked = false;
      render();
      resetQuestionTimer();
      queueTimeout(() => playQuestionCue(), 550);
    }

    function loadQuestion(index) {
      clearQueuedTimeouts();
      stopAllSounds();
      state.currentIndex = index;
      state.options = shuffleOptions(state.questions[index].options, state.questions[index].answer);
      state.eliminatedIndices = [];
      state.selectedOption = null;
      state.isConfirming = false;
      state.isRevealing = false;
      state.helpMode = null;
      state.helpMessage = '';
      state.timeLeft = 60;
      render();
      resetQuestionTimer();
      playQuestionCue();
    }

    function handleOptionClick(index) {
      if (state.isConfirming || state.isRevealing || state.eliminatedIndices.includes(index)) return;
      clearQueuedTimeouts();
      clearTimer();
      stopAllSounds();
      state.selectedOption = index;
      state.isConfirming = true;
      playConfirmPromptThenSuspense();
      render();
    }

    function confirmAnswer() {
      if (state.selectedOption === null) return;
      clearQueuedTimeouts();
      clearTimer();
      stopAllSounds(null, { force: true });
      state.isRevealing = true;
      render();

      const isCorrect = state.options[state.selectedOption].isCorrect;

      if (isCorrect) {
        playSound('correct', {
          volume: 1,
          onEnded: () => {
            if (state.currentIndex === 15) {
              state.winnings = prizes[15].acerta;
              state.gameState = 'winner';
              render();
              playSound('millionWin', { volume: 1 });
              queueTimeout(() => playSound('congrats', { volume: 1 }), 700);
              queueTimeout(() => playSound('coins', { volume: .95 }), 1450);
              queueTimeout(() => playSound('goodbye', { volume: .75 }), 5200);
            } else {
              loadQuestion(state.currentIndex + 1);
            }
          }
        });
      } else {
        playSound('wrong', {
          volume: 1,
          onEnded: () => {
            state.winnings = prizes[state.currentIndex].erra;
            state.gameState = 'gameover';
            render();
            queueTimeout(() => playSound('goodbye', { volume: .75 }), 2600);
          }
        });
      }
    }

    function cancelAnswer() {
      clearQueuedTimeouts();
      stopAllSounds();
      state.selectedOption = null;
      state.isConfirming = false;
      state.isRevealing = false;
      render();
      startTimer();
    }

    function handleTimeUp() {
      if (state.gameState !== 'playing') return;
      clearQueuedTimeouts();
      stopAllSounds();
      state.isConfirming = false;
      state.isRevealing = true;
      state.selectedOption = null;
      render();
      playSound('timeup', { volume: 1 });
      queueTimeout(() => {
        clearTimer();
        state.winnings = prizes[state.currentIndex].erra;
        state.gameState = 'gameover';
        render();
        queueTimeout(() => playSound('goodbye', { volume: .75 }), 2600);
      }, 2500);
    }

    function handleWithdraw() {
      if (state.isConfirming || state.isRevealing) return;
      clearTimer();
      clearQueuedTimeouts();
      stopAllSounds();
      state.winnings = prizes[state.currentIndex].para;
      state.gameState = 'withdraw';
      render();
      playSound('withdraw', { volume: 1 });
      queueTimeout(() => playSound('goodbye', { volume: .75 }), 2600);
    }

    function handleSkip() {
      if (state.skipsLeft <= 0 || state.currentIndex >= 15 || state.isConfirming || state.isRevealing) return;
      state.skipsLeft -= 1;
      loadQuestion(state.currentIndex + 1);
    }

    function handleCards() {
      if (state.cardsUsed || state.isConfirming || state.isRevealing || state.currentIndex === 15) return;
      clearQueuedTimeouts();
      stopAllSounds();
      playRandomCue(['cardsHelp', 'helpPrompt'], { volume: .95 });
      state.helpMode = 'cards';
      render();
    }

    function pickCard() {
      const wrongIndices = state.options.map((o, i) => o.isCorrect ? -1 : i).filter(i => i !== -1);
      const toEliminateCount = Math.floor(Math.random() * 3) + 1;
      state.eliminatedIndices = shuffle(wrongIndices).slice(0, toEliminateCount);
      stopAllSounds();
      playSound('cardsPick', { volume: .95 });
      state.cardsUsed = true;
      state.helpMode = null;
      render();
    }

    function handleStudents() {
      if (state.studentsUsed || state.isConfirming || state.isRevealing || state.currentIndex === 15) return;
      clearQueuedTimeouts();
      stopAllSounds();
      playRandomCue(['studentsHelp', 'helpPrompt'], { volume: .95 });
      const correctIndex = state.options.findIndex(o => o.isCorrect);
      let chosenIndex = correctIndex;
      if (Math.random() <= .1) {
        const wrongIndices = state.options.map((o, i) => o.isCorrect ? -1 : i).filter(i => i !== -1);
        chosenIndex = wrongIndices[Math.floor(Math.random() * wrongIndices.length)];
      }
      state.helpMessage = 'Os convidados acham que a resposta correta é a alternativa ' + (chosenIndex + 1) + '.';
      state.studentsUsed = true;
      state.helpMode = 'students';
      render();
    }

    function handlePlates() {
      if (state.platesUsed || state.isConfirming || state.isRevealing || state.currentIndex === 15) return;
      clearQueuedTimeouts();
      stopAllSounds();
      playRandomCue(['platesHelp', 'helpPrompt'], { volume: .95 });
      const correctIndex = state.options.findIndex(o => o.isCorrect);
      const percentages = [0, 0, 0, 0];
      let remaining = 100;
      const correctPct = Math.floor(Math.random() * 40) + 40;
      percentages[correctIndex] = correctPct;
      remaining -= correctPct;
      const wrongIndices = state.options.map((o, i) => o.isCorrect ? -1 : i).filter(i => i !== -1);
      wrongIndices.forEach((idx, i) => {
        if (i === wrongIndices.length - 1) percentages[idx] = remaining;
        else {
          const pct = Math.floor(Math.random() * (remaining + 1));
          percentages[idx] = pct;
          remaining -= pct;
        }
      });
      state.helpMessage = `Auditório:
1: ${percentages[0]}%
2: ${percentages[1]}%
3: ${percentages[2]}%
4: ${percentages[3]}%`;
      state.platesUsed = true;
      state.helpMode = 'plates';
      render();
    }

    function closeHelp() {
      state.helpMode = null;
      render();
      playTimerFinalIfNeeded();
    }

    function toggleSound() {
      state.soundEnabled = !state.soundEnabled;
      if (!state.soundEnabled) stopAllSounds(null, { force: true });
      render();
      if (state.gameState === 'start' && state.soundEnabled) playStartScreenIntroMusic(true);
      if (state.gameState === 'playing') startTimer();
    }

    function optionClass(option, idx) {
      const classes = ['option-btn'];
      if (state.eliminatedIndices.includes(idx)) classes.push('eliminated');
      if (state.selectedOption === idx) {
        if (state.isRevealing) classes.push(option.isCorrect ? 'correct' : 'wrong', option.isCorrect ? '' : 'pulse-red');
        else classes.push('selected');
      } else if (state.isRevealing && option.isCorrect) classes.push('correct');
      return classes.filter(Boolean).join(' ');
    }

    function renderStart() {
      app.innerHTML = `
        <button class="button sound-toggle" onclick="toggleSound()" aria-label="Som">${state.soundEnabled ? '🔊' : '🔇'}</button>
        <main class="screen center">
          <section class="start-card" onclick="tryUnlockStartScreenMusic(event)">
            <img class="logo-main" src="${LOGO_SRC}" alt="Show do Milhão da Química" />
            <p class="start-note">Quiz de Química baseado no Show do Milhão.</p>
            <p class="start-audio-hint" id="startAudioHint">🎵 Música de abertura pronta nesta tela</p>
            <button class="button big" onclick="startGame()">▶ Jogar</button>
          </section>
        </main>
      `;
      updateStartAudioHint();
      queueTimeout(() => playStartScreenIntroMusic(false), 120);
    }

    function renderEnd() {
      const titles = {
        gameover: '<span style="color:#ff5555">VOCÊ ERROU!</span>',
        withdraw: '<span style="color:#ffe45e">VOCÊ PAROU!</span>',
        winner: '<span class="gold-text">PARABÉNS!</span>'
      };
      app.innerHTML = `
        <button class="button sound-toggle" onclick="toggleSound()" aria-label="Som">${state.soundEnabled ? '🔊' : '🔇'}</button>
        <main class="screen center">
          <section class="panel end-panel">
            <img class="logo-mini" src="${LOGO_SRC}" alt="Show do Milhão da Química" />
            <h1>${titles[state.gameState]}</h1>
            <p>Você ganhou:<span class="money gold-text">${formatMoney(state.winnings)}</span></p>
            <button class="button big" onclick="startGame()">↻ Jogar novamente</button>
          </section>
        </main>
      `;
    }

    function renderPlaying() {
      const currentPrize = prizes[state.currentIndex];
      const isMillion = state.currentIndex === 15;
      const q = state.questions[state.currentIndex];
      const optionHTML = state.options.map((option, idx) => `
        <button class="${optionClass(option, idx)}" onclick="handleOptionClick(${idx})" ${state.isConfirming || state.isRevealing || state.eliminatedIndices.includes(idx) ? 'disabled' : ''}>
          <span class="option-letter">${idx + 1}</span>
          <span>${escapeHTML(option.text)}</span>
        </button>
      `).join('');

      let overlay = '';
      if (state.isConfirming && !state.isRevealing) {
        overlay = `
          <div class="overlay">
            <section class="modal-card">
              <h3>Você tem certeza?</h3>
              <div class="confirm-actions">
                <button class="button green" onclick="confirmAnswer()">Certa disso!</button>
                <button class="button red" onclick="cancelAnswer()">Não</button>
              </div>
            </section>
          </div>`;
      }

      if (state.helpMode === 'cards') {
        overlay = `
          <div class="overlay">
            <section class="modal-card">
              <h3>Escolha uma carta</h3>
              <div class="cards">
                <button class="card-pick panel" onclick="pickCard()">?</button>
                <button class="card-pick panel" onclick="pickCard()">?</button>
                <button class="card-pick panel" onclick="pickCard()">?</button>
                <button class="card-pick panel" onclick="pickCard()">?</button>
              </div>
            </section>
          </div>`;
      }

      if (state.helpMode === 'students' || state.helpMode === 'plates') {
        overlay = `
          <div class="overlay">
            <section class="modal-card">
              <h3>Ajuda</h3>
              <p class="help-message">${escapeHTML(state.helpMessage)}</p>
              <button class="button" onclick="closeHelp()">Fechar</button>
            </section>
          </div>`;
      }

      app.innerHTML = `
        ${isMillion && !state.isRevealing ? '<div class="million-warning">PERGUNTA DE UM MILHÃO!<br>Ajudas e pulos não são permitidos. Se errar, perde tudo!</div>' : ''}
        <button class="button sound-toggle" onclick="toggleSound()" aria-label="Som">${state.soundEnabled ? '🔊' : '🔇'}</button>
        <main class="screen game-screen">
          <section class="game-head">
            <div class="prize-card"><div class="label">Errar</div><div class="value red-txt">${formatMoney(currentPrize.erra)}</div></div>
            <div class="prize-card"><div class="label">Parar</div><div class="value stop-txt">${formatMoney(currentPrize.para)}</div></div>
            <div class="prize-card"><div class="label">Acertar</div><div class="value gold-text">${formatMoney(currentPrize.acerta)}</div></div>
            <div class="prize-card timer-card ${state.timeLeft <= 10 ? 'warning' : ''}" id="timerCard"><div class="label">Tempo</div><div class="timer-display" id="timerDisplay">${fmtTimer(state.timeLeft)}</div></div>
          </section>

          <section class="brand-strip"><div></div><img class="logo-mini" src="${LOGO_SRC}" alt="Show do Milhão da Química" /><div></div></section>

          <section class="question-wrap">
            <div class="question-box">
              <div class="question-badge gold-text">PERGUNTA ${state.currentIndex + 1}</div>
              <h2 class="question-text">${escapeHTML(q?.text || '')}</h2>
            </div>
            <div class="options-grid">${optionHTML}</div>
            ${overlay}
          </section>

          <section class="bottom-bar">
            <button class="button lifeline" onclick="handleCards()" ${state.cardsUsed || state.isConfirming || state.isRevealing || isMillion ? 'disabled' : ''}><span class="ico">🃏</span><span>Cartas</span></button>
            <button class="button lifeline" onclick="handleStudents()" ${state.studentsUsed || state.isConfirming || state.isRevealing || isMillion ? 'disabled' : ''}><span class="ico">🎓</span><span>Convidados</span></button>
            <button class="button lifeline" onclick="handlePlates()" ${state.platesUsed || state.isConfirming || state.isRevealing || isMillion ? 'disabled' : ''}><span class="ico">✋</span><span>Placas</span></button>
            <button class="button lifeline" onclick="handleSkip()" ${state.skipsLeft === 0 || state.isConfirming || state.isRevealing || isMillion ? 'disabled' : ''}><span class="ico">⏩</span><span>Pulos</span><span class="pill-count">${state.skipsLeft}</span></button>
            <button class="button lifeline red wide-mobile" onclick="handleWithdraw()" ${state.isConfirming || state.isRevealing ? 'disabled' : ''}><span class="ico">🛑</span><span>Parar</span></button>
          </section>
        </main>
      `;
    }

    function render() {
      if (state.gameState === 'start') renderStart();
      else if (state.gameState === 'gameover' || state.gameState === 'withdraw' || state.gameState === 'winner') renderEnd();
      else renderPlaying();
    }

    render();
