# Jogo — Xadrez Químico / LabChess 3D

Arquivo de texto para recurso de acessibilidade interativa, no formato modo narrador. Este texto não deve ser usado como uma legenda fixa única. Ele deve alimentar mensagens dinâmicas conforme o jogador seleciona casas, move peças, captura vidrarias, recebe xeque, consulta histórico ou encerra a partida.

## 1. Descrição inicial acessível

Este jogo apresenta um tabuleiro de xadrez em três dimensões com peças modeladas como vidrarias de laboratório. A tela principal tem fundo escuro e uma área 3D central. À esquerda há um painel de configuração e acompanhamento com o título LabChess 3D, subtítulo Química Encontra Estratégia, seleção de kit de vidraria, nível da inteligência artificial, histórico de jogadas, status da partida e botão para reiniciar.

O tabuleiro possui oito colunas, de A até H, e oito linhas, de 1 até 8. As casas claras aparecem em cinza muito claro ou branco acinzentado. As casas escuras aparecem em cinza escuro. Quando uma peça é selecionada, as casas para onde ela pode se mover recebem destaque verde. O destaque deve ser descrito como movimento possível, não apenas como cor.

As peças brancas são controladas pelo jogador. Elas usam vidro transparente claro com líquido interno verde esmeralda. As peças pretas são controladas pela máquina. Elas usam vidro transparente acinzentado com líquido interno azul. Algumas peças, dependendo do kit escolhido, podem ter detalhes âmbar, roxos, brancos, dourados ou azuis. As cores ajudam visualmente, mas o modo narrador deve sempre informar a equipe, o nome da peça e a casa.

## 2. Estrutura espacial do tabuleiro

A casa A1 fica no canto inferior esquerdo do jogador, e a casa H8 fica no canto superior direito. A leitura acessível deve usar sempre coordenadas de xadrez: coluna A a H e linha 1 a 8. A posição 3D do objeto pode girar visualmente, porque há controle de órbita, mas a posição lógica da peça não muda. O leitor de tela deve priorizar a coordenada da casa, não a rotação da câmera.

Modelo de narração de casa vazia: Casa E4, vazia.

Modelo de narração de casa ocupada: Casa E2, peça branca: Tubo de Ensaio, peão.

Modelo de narração de casa com movimento possível: Casa E4, vazia, movimento permitido para o peão selecionado.

Modelo de narração de casa crítica: Casa E1, Rei branco em risco. O jogador está em xeque.

## 3. Peças, temas e equivalência química

O jogo usa quatro kits de vidraria. Cada kit mantém a função enxadrística das peças, mas muda o objeto químico representado.

### Kit 1 — Clássica

Peão: Tubo de Ensaio. Vidraria pequena e cilíndrica, usada para conter pequenas amostras líquidas ou sólidas e para realizar reações em pequena escala.

Torre: Béquer. Recipiente largo, aberto, de uso geral, usado para misturar líquidos, dissolver substâncias e realizar reações sem exigência de alta precisão volumétrica.

Cavalo: Proveta. Cilindro graduado usado para medir volumes com precisão moderada. A narração deve lembrar que é instrumento de medição, não de aquecimento.

Bispo: Balão de Fundo Redondo. Vidraria esférica que distribui calor de modo uniforme, associada a aquecimento prolongado, refluxo e destilações.

Rainha: Erlenmeyer. Frasco cônico com gargalo estreito, usado para agitar líquidos com menor risco de derramamento, muito presente em titulações.

Rei: Kitasato. Frasco semelhante ao Erlenmeyer, mas com saída lateral, usado em filtração a vácuo.

### Kit 2 — Analítica Fina

Peão: Vial de Amostra. Frasco pequeno para acondicionar amostras em análises instrumentais.

Torre: Cristalizador. Recipiente largo e baixo, usado para evaporação de solventes e formação de cristais.

Cavalo: Pipeta Graduada. Tubo longo graduado para medir e transferir volumes variáveis.

Bispo: Bureta. Tubo vertical com torneira inferior, usado para liberar líquido de forma controlada em titulações.

Rainha: Funil de Separação. Equipamento em forma de pera, com torneira, usado para separar líquidos imiscíveis.

Rei: Balão Volumétrico. Frasco com bojo e gargalo fino, usado para preparar soluções com volume exato.

### Kit 3 — Síntese e Destilação

Peão: Tubo de Nessler. Tubo reto e transparente, associado à comparação visual de cores.

Torre: Frasco de Reagente. Frasco espesso, em tom âmbar, usado para armazenar substâncias sensíveis à luz.

Cavalo: Pipeta Pasteur. Vidraria fina com ponta capilar, usada para transferência de pequenas gotas.

Bispo: Condensador Liebig. Tubo linear com camisa de resfriamento, usado em destilação.

Rainha: Balão de Destilação. Frasco com braço lateral para conduzir vapor durante destilação.

Rei: Dessecador. Recipiente fechado, pesado e hermético, usado para resfriar ou conservar amostras longe da umidade.

### Kit 4 — Conceitual Premium

Peão: Tubo de Cultura. Tubo cilíndrico com fechamento, associado a armazenamento e cultivo.

Torre: Cuba Cromatográfica. Câmara retangular para processos de cromatografia em camada delgada.

Cavalo: Pipeta Volumétrica. Pipeta com bojo central e marca única, usada para transferir volume fixo com alta precisão.

Bispo: Condensador Allihn. Condensador com bulbos, usado em refluxo para aumentar a área de condensação.

Rainha: Coluna de Vigreux. Coluna com reentrâncias internas, usada em destilação fracionada.

Rei: Frasco de Drechsel. Lavador de gases com tubo interno e conexões para borbulhamento.

## 4. Estados narráveis principais

### Estado inicial

Narração sugerida: Partida iniciada. Você controla as peças brancas, representadas por vidrarias com líquido verde. A máquina controla as peças pretas, representadas por vidrarias com líquido azul. O tabuleiro tem 64 casas. Escolha uma peça branca para começar.

### Seleção de peça

Ao selecionar uma peça, o modo narrador deve informar peça, equipe, casa atual, função de xadrez e movimentos possíveis.

Modelo: Peça selecionada: Cavalo branco, representado por Proveta, na casa G1. Movimentos possíveis: E2, F3 e H3.

Se a peça não tiver movimento legal: Peão branco em A2 selecionado. No momento, esta peça não possui movimento permitido.

### Tentativa de mover

Modelo de movimento válido: Peão branco moveu de E2 para E4. A casa E4 agora está ocupada por Tubo de Ensaio branco.

Modelo de movimento inválido: Movimento inválido. A peça selecionada não pode ir para essa casa pelas regras do xadrez.

Modelo de troca de seleção: Seleção alterada. Nova peça selecionada: Béquer branco, torre, na casa A1.

### Movimento da máquina

Quando a inteligência artificial responde, o jogo mostra o status A Máquina está pensando. O modo narrador deve anunciar espera e depois resultado.

Modelo: A máquina está pensando.

Modelo após movimento: A máquina moveu Peão preto de E7 para E5. Agora é sua vez.

### Captura

Quando há captura, o jogo toca som de vidro quebrando, a peça capturada recebe animação de queda/quebra e aparece um popup Vidraria Capturada. O popup mostra a vidraria capturada em 3D girando e um texto de uso em laboratório.

Modelo antes do popup: Captura realizada. A peça capturada se quebra visualmente e forma uma poça colorida no tabuleiro. Aguarde a explicação da vidraria.

Modelo do popup: Vidraria capturada: Erlenmeyer, rainha. Uso em laboratório: frasco cônico com gargalo estreito, indicado para agitar líquidos e realizar titulações. Botão disponível: Entendi.

Modelo após fechar o popup: Explicação fechada. A máquina continuará a jogada, se for o turno dela.

### Xeque

Modelo: Aviso: você está em xeque. O rei branco, representado pela vidraria do kit atual, está ameaçado. Escolha um movimento que proteja o rei.

### Xeque-mate, empate ou stalemate

Modelo de xeque-mate: Xeque-mate. As peças pretas vencem.

Modelo de vitória do jogador: Xeque-mate. As peças brancas vencem. O texto Vitória aparece sobre o tabuleiro.

Modelo de empate: Partida empatada. Não há vencedor.

Modelo de stalemate: Stalemate. O jogador da vez não está em xeque, mas não possui movimento legal.

### Reinício

Modelo: Partida reiniciada. As peças voltaram às posições iniciais. O menu lateral está aberto novamente.

## 5. Histórico narrável

O histórico de jogadas aparece no painel lateral em pares: jogada das brancas em verde e jogada das pretas em azul. O modo narrador deve transformar a notação enxadrística em frase compreensível quando possível.

Modelo curto: Histórico, lance 1: brancas jogaram E4; pretas jogaram E5.

Modelo expandido: Últimas ações: branco moveu peão de E2 para E4; preto respondeu com peão de E7 para E5.

Para acessibilidade, oferecer comando de leitura do histórico completo e comando de leitura apenas dos três últimos lances.

## 6. Narração por teclado e leitor de tela

A navegação ideal deve permitir percorrer o tabuleiro por coordenadas. As setas podem navegar casa por casa. Enter seleciona ou move. Escape cancela seleção. Uma tecla de ajuda deve ler a peça selecionada e os movimentos possíveis. Outra tecla deve ler o status da partida.

Sugestões de mensagens:

Você está na casa C3. Casa vazia.

Você está na casa F1. Bispo branco, Balão de Fundo Redondo. Movimentos possíveis: G2, H3, E2, D3, C4, B5 e A6.

Seleção cancelada.

Não é sua vez. Aguarde a jogada da máquina.

## 7. Regras para não depender apenas de cor

Nunca narrar somente verde, azul, claro ou escuro. Usar sempre equipe e função: branca/jogador, preta/máquina, peça, casa e ação.

Em vez de: A casa verde está disponível.

Usar: Casa E4 é um movimento permitido para o peão selecionado.

Em vez de: A peça azul capturada quebrou.

Usar: Peça preta capturada: Erlenmeyer, rainha. A animação mostra vidro se quebrando e uma poça azul no tabuleiro.

## 8. Resumo pedagógico do modo narrador

O objetivo não é apenas jogar xadrez com tema químico. Cada captura vira uma oportunidade de revisão de vidrarias: nome, forma, uso e contexto de laboratório. A narração deve equilibrar estratégia e aprendizagem. Primeiro informa o estado do jogo; depois explica o significado químico da peça quando houver captura ou consulta.
