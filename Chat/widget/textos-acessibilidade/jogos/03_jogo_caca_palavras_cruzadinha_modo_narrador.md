# Jogo — Caça-palavras e Cruzadinha

Arquivo de texto para recurso de acessibilidade interativa, no formato modo narrador. Este jogo não deve ser descrito como uma imagem fixa. Ele funciona como uma grade navegável, com letras, coordenadas, seleção contínua, palavras encontradas, dicas, respostas e níveis de dificuldade.

## 1. Descrição inicial acessível

A tela inicial permite escolher um modo de jogo, uma dificuldade e um tema. Existem dois modos: Caça-palavras e Cruzadinha. As dificuldades são fácil, médio e difícil. Os temas vêm de animações e guias do projeto, como Empacotamento, Buracos e Camadas; Geometria Cristalográfica; Geometria Molecular 3D; Redes Cristalinas; Simetria e Fórmula Unitária; Orbitais de Hidrogenoides; Visualizador de Orbitais; Atlas Termodinâmico; Células Unitárias; Células Primitivas, Sistemas de Bravais e Célula de Wigner; Complexos e Polimorfismo; Equações de Onda dos Hidrogenoides; Fases da Água; Geometria Molecular Passo a Passo; Interações Intermoleculares; Modelos Atômicos; e Polaridade Molecular Passo a Passo.

O modo narrador deve informar a combinação escolhida: modo, dificuldade e tema. Também deve permitir repetir as instruções a qualquer momento.

Modelo: Jogo iniciado. Modo Caça-palavras. Dificuldade média. Tema: Interações Intermoleculares. A grade contém letras distribuídas em linhas e colunas. A lista de palavras aparece ao lado da grade.

## 2. Caça-palavras — descrição visual e lógica

O caça-palavras apresenta uma grade de letras em botões quadrados. Cada célula tem coordenada por linha e coluna. O jogador pressiona uma célula inicial, arrasta em linha reta e solta em uma célula final. O sistema aceita seleção horizontal, vertical ou diagonal. A palavra pode estar no sentido normal ou invertido.

Durante o arraste, as letras do caminho recebem destaque de pré-visualização. Quando a palavra está correta, as células ficam marcadas como encontradas e a palavra correspondente na lista também é marcada. A cor de destaque não deve ser o único feedback; o modo narrador precisa dizer palavra, direção e progresso.

## 3. Caça-palavras — estados narráveis

### Entrada no modo

Narração sugerida: Caça-palavras ativo. Navegue pela grade por linha e coluna. Escolha a primeira letra de uma palavra, arraste em linha horizontal, vertical ou diagonal e solte na última letra.

### Leitura de célula

Modelo: Linha 4, coluna 7, letra P.

Modelo com célula já encontrada: Linha 4, coluna 7, letra P. Esta célula faz parte da palavra Polaridade, já encontrada.

### Início de seleção

Modelo: Seleção iniciada em linha 4, coluna 7, letra P.

### Prévia de caminho

Modelo: Caminho atual horizontal para a direita: P O L A R. Cinco letras selecionadas.

Modelo: Caminho atual diagonal para baixo e à direita: I O N I C A. Seis letras selecionadas.

Modelo: Caminho atual vertical para cima: O L O P I D. Palavra lida no sentido invertido.

### Palavra encontrada

Modelo: Palavra encontrada: Polaridade. Direção horizontal para a direita, da linha 14 coluna 6 até a linha 14 coluna 15. Progresso: 5 de 8 palavras encontradas.

Modelo com sentido invertido: Palavra encontrada: Dipolo. A palavra estava selecionada no sentido invertido. Progresso atualizado.

### Seleção incorreta

Modelo: A seleção não corresponde a nenhuma palavra pendente. Tente outro ponto inicial, outra direção ou confira a lista de palavras.

### Lista de palavras

O modo narrador deve ler a lista como palavras pendentes e palavras encontradas.

Modelo: Palavras pendentes: London, Dipolo, Induzido, Hidrogênio, Moléculas. Palavras encontradas: Polaridade e Iônica.

## 4. Cruzadinha — descrição visual e lógica

A cruzadinha apresenta uma grade com casas brancas preenchíveis e casas pretas bloqueadas. Algumas casas brancas têm números pequenos que identificam dicas. O jogador digita uma letra em cada casa. Há botões de verificar, limpar e mostrar respostas.

Quando o jogador clica em um número, aparece uma caixa de dica com indicação Horizontal ou Vertical e o texto da pista. Ao verificar, casas corretas e incorretas recebem estados visuais diferentes. O modo narrador deve informar correto ou incorreto por palavra e, quando necessário, por célula.

## 5. Cruzadinha — estados narráveis

### Entrada no modo

Narração sugerida: Cruzadinha ativa. A grade contém casas preenchíveis e casas bloqueadas. Use os números das casas para ouvir dicas horizontais ou verticais. Digite uma letra por casa.

### Leitura de célula

Modelo: Linha 2, coluna 5. Casa preenchível, vazia.

Modelo: Linha 2, coluna 5. Casa preenchível com a letra D.

Modelo: Linha 2, coluna 5. Casa bloqueada.

Modelo com número: Linha 1, coluna 10. Casa número 2. Há dica vertical disponível.

### Dica aberta

Modelo: Dica 3 horizontal: Dipolo temporário gerado por distorção eletrônica.

Modelo com duas direções: Dica 3. Horizontal: Dipolo temporário gerado por distorção eletrônica. Vertical: Interação entre espécies carregadas e dipolos.

### Digitação

Modelo: Letra P inserida na linha 5, coluna 1.

Modelo de normalização: A letra digitada foi convertida para maiúscula.

### Verificar respostas

Modelo geral: Verificação concluída. 12 casas corretas e 3 casas incorretas.

Modelo por palavra: Palavra 5 horizontal, Polarizabilidade, correta.

Modelo por célula: Linha 4, coluna 8 incorreta. Revise a dica antes de alterar.

### Limpar

Modelo: Cruzadinha limpa. Todas as letras foram removidas e os estados de correto ou incorreto foram apagados.

### Mostrar respostas

Modelo: Respostas exibidas. Todas as casas preenchíveis agora mostram a letra correta. Use esta opção como conferência final ou estudo guiado.

## 6. Temas e vocabulário narrável

Os temas do jogo reutilizam conteúdos de animações e guias. O modo narrador deve adaptar o vocabulário da lista de palavras e dicas ao tema ativo.

### Temas de animações

Empacotamento, Buracos e Camadas: palavras e dicas devem se relacionar a camadas, interstícios, empacotamento, buraco tetraédrico, buraco octaédrico, arranjos AAA, ABA e ABC.

Geometria Cristalográfica: foco em faces, arestas, vértices, sistemas cristalinos, parâmetros de rede e formas geométricas.

Geometria Molecular 3D: foco em átomo central, ligantes, pares de elétrons, arranjos VSEPR, ângulos e geometrias moleculares.

Redes Cristalinas: foco em célula unitária, posições de esferas, rede cúbica simples, cúbica de corpo centrado, cúbica de face centrada, hexagonal e estruturas iônicas.

Simetria e Fórmula Unitária: foco em frações de átomos, vértices, arestas, faces, centro, repetição por translação e fórmula mínima.

Orbitais de Hidrogenoides e Visualizador de Orbitais: foco em orbital s, p, d, f, nós, fases, lóbulos, densidade eletrônica e orientação espacial.

### Temas de guias

Atlas Termodinâmico: foco em estados físicos, energia, temperatura, pressão, calor e transformação.

Células Unitárias e Parâmetros de Rede: foco em a, b, c, alfa, beta, gama, volume da célula e simetria.

Células Primitivas, Bravais e Wigner: foco em célula primitiva, rede de Bravais, vizinhança, fronteiras e região de Wigner-Seitz.

Complexos e Polimorfismo: foco em íon metálico, ligantes, coordenação, geometria e diferentes formas cristalinas.

Equações de Onda dos Hidrogenoides: foco em função de onda, número quântico, densidade radial, nó e probabilidade.

Fases da Água: foco em sólido, líquido, vapor, ligações de hidrogênio, rede aberta do gelo e movimento molecular.

Geometria Molecular Passo a Passo: foco em domínio eletrônico, par ligante, par livre, repulsão e forma molecular.

Interações Intermoleculares: foco em dipolo, London, hidrogênio, polarizabilidade, íon-dipolo e atração.

Modelos Atômicos: foco em Dalton, Thomson, Rutherford, Bohr, núcleo, elétrons e orbitais.

Polaridade Molecular Passo a Passo: foco em eletronegatividade, dipolo de ligação, geometria, soma vetorial e molécula polar ou apolar.

## 7. Regras de navegação acessível

Cada célula deve ter nome acessível com linha, coluna e letra ou estado. A grade deve permitir navegação com setas. Enter pode iniciar seleção no caça-palavras ou editar casa na cruzadinha. Escape cancela seleção ou fecha dica. Um comando de ajuda deve ler o tema, modo, dificuldade e instruções resumidas.

No caça-palavras, o leitor deve informar direção de seleção: horizontal direita, horizontal esquerda, vertical baixo, vertical cima, diagonal para baixo à direita, diagonal para baixo à esquerda, diagonal para cima à direita ou diagonal para cima à esquerda.

Na cruzadinha, o leitor deve informar se a casa é bloqueada, vazia, preenchida, numerada, correta ou incorreta.

## 8. Feedback inclusivo

Não depender apenas de cor para indicar acerto. Quando uma palavra for encontrada, anunciar o nome da palavra e atualizar o progresso.

Não depender apenas de borda ou destaque para indicar prévia de seleção. Durante o arraste, anunciar o caminho atual e as letras selecionadas.

Não expor respostas automaticamente no começo do jogo. No caça-palavras, a lista de palavras pode ser lida porque faz parte da atividade. Na cruzadinha, as respostas só devem ser lidas se o jogador escolher mostrar respostas ou após a verificação, conforme a estratégia pedagógica definida.

Evitar linguagem punitiva. Em vez de erro, usar seleção não encontrada ou resposta ainda não corresponde à dica.

## 9. Modelos prontos de mensagens dinâmicas

Jogo configurado: Modo Caça-palavras, dificuldade difícil, tema Polaridade Molecular Passo a Passo.

Grade carregada com 18 colunas e 18 linhas. Existem 10 palavras para encontrar.

Linha 7, coluna 12, letra D.

Seleção iniciada na linha 7, coluna 12.

Caminho atual diagonal para baixo e à esquerda: D I P O L O.

Palavra encontrada: Dipolo. Restam 7 palavras.

Jogo configurado: Modo Cruzadinha, dificuldade média, tema Interações Intermoleculares.

Dica 2 horizontal: Força de dispersão presente em todas as moléculas.

Casa preenchida com L.

Verificação concluída. Algumas letras ainda não correspondem às dicas.

Respostas exibidas para estudo. Revise as palavras e suas definições.

## 10. Resumo pedagógico do modo narrador

O objetivo do modo narrador é transformar a grade visual em uma experiência jogável por coordenadas. A pessoa deve conseguir saber onde está, que letra selecionou, que caminho formou, quais palavras faltam, qual dica está aberta e qual foi o resultado da verificação. A camada acessível precisa ser equivalente à experiência visual, não apenas uma descrição decorativa da tela.
