# Jogo — Quebra-cabeça Iônico/Covalente

Arquivo de texto para recurso de acessibilidade interativa, no formato modo narrador. Este jogo não deve receber apenas uma descrição fixa do canvas, porque a experiência acontece por seleção, arraste, encaixe, ligação, fórmula formada, carga total e feedback de acerto ou erro.

## 1. Descrição inicial acessível do hub

A tela inicial do jogo se chama Mini Hub — Tudo em um. Ela apresenta duas abas principais: Íons e Covalente. Cada aba abre uma atividade própria dentro de uma área central.

Na aba Íons, o jogador combina cátions e ânions para formar espécies eletricamente neutras ou para observar a carga total de um conjunto. O foco visual são peças coloridas com símbolos químicos, cargas e portas de encaixe.

Na aba Covalente, o jogador monta estruturas com átomos e ligações covalentes. O foco visual são peças de átomos com elétrons ao redor, linhas de ligação entre átomos, símbolos de reação e leitura da fórmula formada.

O modo narrador deve sempre informar qual aba está ativa, qual peça está selecionada, o que existe na mesa de montagem e qual é o estado químico atual.

## 2. Aba Íons — descrição visual e lógica

A tela de Íons tem três regiões: biblioteca à esquerda, mesa de montagem ao centro e painel de leitura e dicas à direita.

A biblioteca lista íons arrastáveis. Cada peça mostra símbolo químico, nome e tipo. Cátions têm carga positiva e aparecem com família visual em amarelo ou tons quentes. Ânions têm carga negativa e aparecem com famílias de cor diferentes, como amarelo claro para nitrogênio, verde claro para fósforo, rosa para enxofre, lilás para halogênios, cinza para carbono e azul claro para outros grupos. A cor ajuda a agrupar, mas a narração deve dizer sempre o nome, o símbolo, a carga e o tipo.

A mesa de montagem é uma área clara com grade discreta. Nela, as peças podem ser arrastadas, reposicionadas e encaixadas. Cada íon possui um número de portas igual ao módulo da carga. Um cátion de carga +1 tem uma porta. Um cátion de carga +2 tem duas portas. Um ânion de carga -3 tem três portas. Uma porta só se liga a uma porta de carga oposta.

O painel de leitura mostra a carga total, a quantidade de peças na mesa e a expressão ou fórmula formada. Quando a carga total é zero, o jogo pode indicar a espécie como eletroneutra e exibir o nome correspondente quando reconhecido.

## 3. Aba Íons — estados narráveis

### Entrada na aba

Narração sugerida: Aba Íons ativa. A biblioteca lista cátions e ânions. Arraste uma peça para a mesa ou dê duplo clique para adicioná-la. O objetivo é combinar cargas positivas e negativas até formar uma espécie eletroneutra.

### Leitura de peça na biblioteca

Modelo: Peça da biblioteca: Na, sódio, cátion de carga +1. Possui uma porta de encaixe.

Modelo: Peça da biblioteca: SO₄, sulfato, ânion de carga -2. Possui duas portas de encaixe.

Modelo: Peça da biblioteca: NH₄, amônio, cátion poliatômico de carga +1. Possui uma porta de encaixe.

### Peça adicionada à mesa

Modelo: Sódio, Na+, adicionado à mesa. Carga total atual: +1. Ainda falta carga negativa para neutralizar.

Modelo: Cloreto, Cl−, adicionado à mesa. Carga total atual: zero. A combinação NaCl está eletroneutra.

### Encaixe entre íons

Modelo: Encaixe feito entre Na+ e Cl−. Uma porta positiva foi conectada a uma porta negativa. Carga total: zero.

Modelo com íon multivalente: Encaixe feito entre Ca2+ e Cl−. O cálcio ainda possui uma porta positiva livre. Carga total do conjunto: +1.

Modelo final multivalente: Segundo cloreto encaixado ao Ca2+. Fórmula formada: CaCl₂. Carga total: zero.

### Tentativa incompleta ou desequilibrada

Modelo: A montagem ainda não está neutra. Carga total: +2. Ainda falta carga negativa, ou mais ânions, para equilibrar.

Modelo: A montagem ainda não está neutra. Carga total: -1. Ainda falta carga positiva, ou mais cátions, para equilibrar.

### Verificação

Se não houver íons: Nada na mesa ainda. Adicione um cátion e um ânion para começar.

Se carga total for zero: Eletroneutro. Expressão formada: leitura da fórmula atual.

Se carga positiva sobrar: Ainda falta carga negativa, ou seja, ânions suficientes para neutralizar a montagem.

Se carga negativa sobrar: Ainda falta carga positiva, ou seja, cátions suficientes para neutralizar a montagem.

### Remover seleção

Modelo: Peça selecionada removida da mesa. As ligações dessa peça também foram desfeitas. Carga total recalculada.

### Limpar mesa

Modelo: Mesa limpa. Nenhum íon está posicionado. Carga total: zero. Fórmula: vazia.

## 4. Aba Íons — dicionário narrável de famílias

Cátions: íons positivos, geralmente metais ou espécies como H+, H₃O+ e NH₄+. Na interface, aparecem com destaque quente/amarelado. Na narração, chamar de cátion e informar a carga positiva.

Ânions nitrogenados: nitrito, nitrato, azida e nitreto. Informar que são ânions e citar a carga.

Ânions fosforados: metafosfato, hipofosfito, hidrogenofosfito, fosfito, fosfato, fosfeto, pirofosfato e hipofosfato. Quando forem poliatômicos, a narração deve dizer que a peça representa um grupo de átomos com carga total.

Ânions sulfurados: sulfeto, sulfato, sulfito, tiossulfato, hidrogenossulfito, persulfato e tetrationato.

Halogenetos e oxi-halogênios: fluoreto, cloreto, brometo, iodeto e espécies oxigenadas relacionadas. A narração deve diferenciar símbolos parecidos, como Cl− e ClO−.

Carbonatos e outros oxiânions: carbonato, bicarbonato, hidróxido, acetato e outros grupos. Informar sempre carga e nome, porque a cor sozinha não identifica o íon.

## 5. Aba Covalente — descrição visual e lógica

A tela Covalente também tem três regiões: biblioteca à esquerda, mesa de montagem ao centro e painel Leitura & Dicas à direita.

A biblioteca contém átomos dos primeiros elementos disponíveis, excluindo gases nobres, e símbolos de reação como adição, seta de reação e equilíbrio. Cada átomo mostra símbolo, nome e valência. A mesa de montagem recebe átomos e símbolos. Os átomos aparecem como peças circulares ou arredondadas com elétrons posicionados ao redor. As ligações são linhas entre átomos.

Para criar uma ligação, o jogador arma o arraste em um elétron de um átomo, arrasta até um elétron de outro átomo e solta. Quando a ligação é criada, a distância entre os átomos pode ser ajustada automaticamente para manter uma separação visual estável. O painel lateral mostra pares de ligação, quantidade de peças e fórmula das espécies formadas.

O modo narrador deve dizer quantos elétrons livres ou posições de ligação ainda restam quando isso for importante para a ação.

## 6. Aba Covalente — estados narráveis

### Entrada na aba

Narração sugerida: Aba Covalente ativa. A biblioteca contém átomos e símbolos de reação. A mesa de montagem está vazia. Para montar uma molécula, adicione átomos e crie ligações entre elétrons de átomos diferentes.

### Leitura de átomo na biblioteca

Modelo: Átomo da biblioteca: C, carbono. Valência 4. Pode formar até quatro ligações covalentes.

Modelo: Átomo da biblioteca: O, oxigênio. Valência 6 no desenho de elétrons de valência, com capacidade usual de duas ligações nesta atividade.

Modelo: Átomo da biblioteca: H, hidrogênio. Capacidade de uma ligação.

### Átomo adicionado à mesa

Modelo: Carbono adicionado à mesa. Símbolo C. Quatro possibilidades de ligação disponíveis.

Modelo: Dois hidrogênios e um oxigênio estão na mesa. Nenhuma ligação criada ainda.

### Início de ligação

Modelo: Elétron do oxigênio selecionado para formar ligação. Arraste até um elétron de outro átomo.

Modelo: Alvo possível detectado: elétron de hidrogênio. Solte para criar ligação O–H.

### Ligação criada

Modelo: Ligação criada entre oxigênio e hidrogênio. Número de pares de ligação: 1. Fórmula parcial: HO.

Modelo: Segunda ligação criada entre oxigênio e hidrogênio. Número de pares de ligação: 2. Fórmula formada: H₂O.

### Ligação não criada

Modelo: Ligação não criada. O alvo precisa ser um elétron de outro átomo e os dois átomos precisam ter capacidade de ligação disponível.

Modelo: Este átomo já atingiu sua capacidade de ligação nesta atividade.

### Remover ligação

Modelo: Modo remover ligação ativado. Clique em uma ligação para desfazê-la.

Modelo: Ligação removida. Os átomos permanecem na mesa e a fórmula foi recalculada.

### Limpar mesa

Modelo: Mesa limpa. Nenhum átomo ou símbolo está posicionado. Fórmula vazia. Número de ligações: zero.

### Esconder ou mostrar leitura e dicas

Modelo: Painel de Leitura & Dicas ocultado. A mesa de montagem ocupa mais espaço.

Modelo: Painel de Leitura & Dicas exibido. Estão visíveis os contadores de ligações, peças e fórmula.

## 7. Leitura acessível da fórmula

A fórmula não deve ser lida apenas como texto corrido. O modo narrador deve expandir os índices.

H₂O deve ser lido como: H dois O; dois átomos de hidrogênio e um átomo de oxigênio.

CO₂ deve ser lido como: C O dois; um átomo de carbono e dois átomos de oxigênio.

CaCl₂ deve ser lido como: cálcio cloreto dois; um cátion cálcio para dois ânions cloreto, quando estiver na aba Íons.

Quando a montagem tiver carga, a carga deve ser narrada junto: SO₄ com carga -2; sulfato, ânion poliatômico.

## 8. Regras de narração inclusiva

Não dizer apenas peça amarela, azul ou rosa. Dizer o símbolo, o nome, o tipo e a carga ou valência.

Não dizer apenas bolinha ou ponto. Dizer elétron disponível, porta de encaixe ou ligação, conforme o modo.

Não antecipar resposta quando o objetivo for resolução. Em vez de dizer monte NaCl, dizer: você tem uma carga positiva +1 e precisa de uma carga negativa -1 para neutralizar.

Quando a montagem estiver correta, explicar o motivo: A soma das cargas é zero, portanto a espécie está eletricamente neutra.

Quando a montagem estiver incompleta, indicar a necessidade sem ridicularizar erro: a montagem ainda precisa de carga oposta ou de mais ligações para ficar coerente.

## 9. Resumo pedagógico do modo narrador

Na aba Íons, o jogo trabalha neutralidade elétrica, formação de compostos iônicos, íons monoatômicos, íons poliatômicos e proporção entre cargas. A narração deve focar em carga, quantidade de portas, encaixe e fórmula.

Na aba Covalente, o jogo trabalha átomos, elétrons de valência, capacidade de ligação, pares compartilhados e fórmula molecular. A narração deve focar em elétrons disponíveis, ligações criadas, clusters e fórmula final.
