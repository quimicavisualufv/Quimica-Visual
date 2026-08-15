# Texto acessível — Animação 04 — Geometria Molecular 3D

Categoria: Animação. Pasta analisada: Ensino/Animacao/geometria-molecular. Página principal: index.html. Elementos visuais principais: canvas com id gl, canvas de ângulos com id angleOverlay e miniatura de eixos com id miniAxes.

Objetivo do texto: explicar a visualização molecular de modo acessível, inclusivo e independente de visão plena. O texto descreve arranjos VSEPR, exemplos, cores dos átomos, ligantes, nuvens eletrônicas, ligações e ângulos. A descrição deve servir para pessoas cegas, pessoas com baixa visão, estudantes com daltonismo e qualquer pessoa que precise de uma leitura textual do canvas.

## Descrição geral da visualização

A página mostra uma molécula em 3D. No centro há um átomo central representado por uma esfera maior. Ao redor dele aparecem os ligantes, que são esferas conectadas ao átomo central por cilindros ou hastes que representam ligações químicas. Quando a geometria possui pares de elétrons não ligantes, eles aparecem como nuvens eletrônicas azuis próximas ao átomo central. Essas nuvens não são átomos: são regiões de densidade eletrônica que ocupam espaço e empurram as ligações, alterando os ângulos.

O canvas principal mostra a molécula contra fundo escuro ou fundo claro, dependendo do controle “Fundo branco”. A visualização pode exibir eixos cartesianos X, Y e Z. O eixo X aparece em vermelho, o eixo Y em verde e o eixo Z em azul. O canvas de ângulos sobreposto desenha arcos e marcações para ajudar a identificar os ângulos entre ligações. A miniatura de eixos orienta a rotação da cena.

## Texto curto para aria-label da visualização

Visualização 3D interativa de geometria molecular. Mostra átomo central, ligantes, ligações, nuvens eletrônicas não ligantes, ângulos e eixos de orientação.

## Convenções de cor e leitura inclusiva

As cores ajudam na identificação, mas não devem ser o único recurso de interpretação. Sempre combinar cor com nome do elemento, posição e função. No padrão do projeto, hidrogênio é branco ou cinza muito claro; carbono é preto ou cinza muito escuro; oxigênio é vermelho; nitrogênio é azul; flúor é verde claro; cloro é verde; bromo é marrom alaranjado; iodo é roxo; enxofre é amarelo; fósforo é laranja; boro é laranja claro; silício é bege; xenônio é azul arroxeado; criptônio é azul claro; selênio é ocre; telúrio é marrom claro; alumínio e antimônio aparecem em tons de cinza azulado. As nuvens eletrônicas não ligantes são azuis intensas.

Quando houver daltonismo ou baixa visão, a descrição deve priorizar frases como “dois ligantes em lados opostos”, “quatro ligantes nos cantos de um quadrado”, “uma nuvem acima do átomo central” ou “duas nuvens fora do plano”, em vez de depender apenas de cor.

## Diferença entre ligantes e nuvens eletrônicas

Ligantes são átomos ligados ao átomo central. No canvas, eles aparecem como esferas conectadas por ligações. Nuvens eletrônicas representam pares de elétrons não ligantes; aparecem como formas arredondadas ou alongadas próximas ao átomo central, sem serem conectadas como ligantes. Elas devem ser descritas como regiões que ocupam espaço e influenciam a forma da molécula.

## Descrições por arranjo VSEPR

### Linear (AX2)

Composição visual: 2 ligantes, nenhum par não ligante.

Descrição acessível do arranjo: O átomo central fica no meio da estrutura. A organização espacial apresenta dois ligantes em lados opostos do átomo central, formando uma linha reta. O ângulo ideal ou aproximado é 180°.

Leitura das nuvens eletrônicas: este arranjo não mostra nuvens eletrônicas não ligantes; todos os domínios representados ao redor do átomo central são ligantes.

Exemplos disponíveis no seletor: CO₂, BeCl₂, CS₂, HgCl₂, HCN.

Descrição acessível dos exemplos:

- CO₂: carbono central em preto/cinza escuro e dois oxigênios vermelhos como ligantes; ligações duplas.
- BeCl₂: berílio central em cinza claro azulado e dois cloros verdes como ligantes; ligações simples.
- CS₂: carbono central em preto/cinza escuro e dois enxofres amarelos como ligantes; ligações duplas.
- HgCl₂: mercúrio central em cinza claro e dois cloros verdes como ligantes; ligações simples.
- HCN: carbono central em preto/cinza escuro, hidrogênio branco/cinza claro de um lado e nitrogênio azul do outro; uma ligação simples e uma tripla.

### Trigonal planar (AX3)

Composição visual: 3 ligantes, nenhum par não ligante.

Descrição acessível do arranjo: O átomo central fica no meio da estrutura. A organização espacial apresenta três ligantes ao redor do átomo central no mesmo plano, como os três vértices de um triângulo. O ângulo ideal ou aproximado é 120°.

Leitura das nuvens eletrônicas: este arranjo não mostra nuvens eletrônicas não ligantes; todos os domínios representados ao redor do átomo central são ligantes.

Exemplos disponíveis no seletor: BF₃, BCl₃, SO₃, NO₃⁻, CO₃²⁻.

Descrição acessível dos exemplos:

- BF₃: boro central em laranja claro e três flúors verdes claros ao redor.
- BCl₃: boro central em laranja claro e três cloros verdes ao redor.
- SO₃: enxofre central amarelo e três oxigênios vermelhos como ligantes.
- NO₃⁻: nitrogênio central azul e três oxigênios vermelhos como ligantes.
- CO₃²⁻: carbono central em preto/cinza escuro e três oxigênios vermelhos como ligantes.

### Tetraédrica (AX4)

Composição visual: 4 ligantes, nenhum par não ligante.

Descrição acessível do arranjo: O átomo central fica no meio da estrutura. A organização espacial apresenta quatro ligantes distribuídos em três dimensões, como os vértices de um tetraedro ao redor do átomo central. O ângulo ideal ou aproximado é 109,5°.

Leitura das nuvens eletrônicas: este arranjo não mostra nuvens eletrônicas não ligantes; todos os domínios representados ao redor do átomo central são ligantes.

Exemplos disponíveis no seletor: CH₄, CCl₄, CF₄, SiCl₄, NH₄⁺.

Descrição acessível dos exemplos:

- CH₄: carbono central em preto/cinza escuro e quatro hidrogênios branco/cinza claro.
- CCl₄: carbono central em preto/cinza escuro e quatro cloros verdes.
- CF₄: carbono central em preto/cinza escuro e quatro flúors verdes claros.
- SiCl₄: silício central bege e quatro cloros verdes.
- NH₄⁺: nitrogênio central azul e quatro hidrogênios branco/cinza claro.

### Bipirâmide trigonal (AX5)

Composição visual: 5 ligantes, nenhum par não ligante.

Descrição acessível do arranjo: O átomo central fica no meio da estrutura. A organização espacial apresenta três ligantes no plano equatorial e dois ligantes axiais, um acima e outro abaixo. O ângulo ideal ou aproximado é 120° no plano equatorial, 90° entre axial e equatorial, 180° entre axiais.

Leitura das nuvens eletrônicas: este arranjo não mostra nuvens eletrônicas não ligantes; todos os domínios representados ao redor do átomo central são ligantes.

Exemplos disponíveis no seletor: PCl₅, PF₅, PBr₅, AsF₅, SbCl₅.

Descrição acessível dos exemplos:

- PCl₅: fósforo central laranja e cinco cloros verdes.
- PF₅: fósforo central laranja e cinco flúors verdes claros.
- PBr₅: fósforo central laranja e cinco bromos marrom alaranjados.
- AsF₅: arsênio central azul acinzentado e cinco flúors verdes claros.
- SbCl₅: antimônio central cinza azulado e cinco cloros verdes.

### Octaédrica (AX6)

Composição visual: 6 ligantes, nenhum par não ligante.

Descrição acessível do arranjo: O átomo central fica no meio da estrutura. A organização espacial apresenta seis ligantes posicionados em pares opostos nos eixos espaciais, como os vértices de um octaedro. O ângulo ideal ou aproximado é 90° entre vizinhos e 180° entre opostos.

Leitura das nuvens eletrônicas: este arranjo não mostra nuvens eletrônicas não ligantes; todos os domínios representados ao redor do átomo central são ligantes.

Exemplos disponíveis no seletor: SF₆, SeF₆, PF₆⁻, SiF₆²⁻, AlF₆³⁻.

Descrição acessível dos exemplos:

- SF₆: enxofre central amarelo e seis flúors verdes claros.
- SeF₆: selênio central ocre e seis flúors verdes claros.
- PF₆⁻: fósforo central laranja e seis flúors verdes claros.
- SiF₆²⁻: silício central bege e seis flúors verdes claros.
- AlF₆³⁻: alumínio central cinza azulado claro e seis flúors verdes claros.

### Angular (AX2E)

Composição visual: 2 ligantes e 1 nuvem eletrônica não ligante.

Descrição acessível do arranjo: O átomo central fica no meio da estrutura. A organização espacial apresenta dois ligantes fazem uma forma dobrada; a nuvem eletrônica ocupa uma região que completa a base trigonal planar e empurra os ligantes. O ângulo ideal ou aproximado é aproximadamente 120°.

Leitura das nuvens eletrônicas: as nuvens azuis devem ser descritas como pares não ligantes. Elas ocupam posições do arranjo eletrônico e ajudam a explicar por que a geometria molecular observada é diferente do arranjo eletrônico completo.

Exemplos disponíveis no seletor: SO₂, O₃, NO₂⁻, SnCl₂, SeO₂.

Descrição acessível dos exemplos:

- SO₂: enxofre central amarelo, dois oxigênios vermelhos e uma nuvem eletrônica azul.
- O₃: oxigênio central vermelho, dois oxigênios vermelhos como ligantes e uma nuvem eletrônica azul.
- NO₂⁻: nitrogênio central azul, dois oxigênios vermelhos e uma nuvem eletrônica azul.
- SnCl₂: estanho central azul acinzentado, dois cloros verdes e uma nuvem eletrônica azul.
- SeO₂: selênio central ocre, dois oxigênios vermelhos e uma nuvem eletrônica azul.

### Piramidal trigonal (AX3E)

Composição visual: 3 ligantes e 1 nuvem eletrônica não ligante.

Descrição acessível do arranjo: O átomo central fica no meio da estrutura. A organização espacial apresenta três ligantes formam a base de uma pirâmide e a nuvem eletrônica ocupa a posição do quarto vértice tetraédrico. O ângulo ideal ou aproximado é aproximadamente 107°.

Leitura das nuvens eletrônicas: as nuvens azuis devem ser descritas como pares não ligantes. Elas ocupam posições do arranjo eletrônico e ajudam a explicar por que a geometria molecular observada é diferente do arranjo eletrônico completo.

Exemplos disponíveis no seletor: NH₃, NF₃, PCl₃, PH₃, H₃O⁺.

Descrição acessível dos exemplos:

- NH₃: nitrogênio central azul, três hidrogênios branco/cinza claro e uma nuvem eletrônica azul.
- NF₃: nitrogênio central azul, três flúors verdes claros e uma nuvem eletrônica azul.
- PCl₃: fósforo central laranja, três cloros verdes e uma nuvem eletrônica azul.
- PH₃: fósforo central laranja, três hidrogênios branco/cinza claro e uma nuvem eletrônica azul.
- H₃O⁺: oxigênio central vermelho, três hidrogênios branco/cinza claro e uma nuvem eletrônica azul.

### Angular (AX2E2)

Composição visual: 2 ligantes e 2 nuvens eletrônicas não ligantes.

Descrição acessível do arranjo: O átomo central fica no meio da estrutura. A organização espacial apresenta dois ligantes ficam em forma de V; duas nuvens eletrônicas ocupam outras regiões do arranjo tetraédrico e comprimem o ângulo entre as ligações. O ângulo ideal ou aproximado é aproximadamente 104,5°.

Leitura das nuvens eletrônicas: este arranjo não mostra nuvens eletrônicas não ligantes; todos os domínios representados ao redor do átomo central são ligantes.

Exemplos disponíveis no seletor: H₂O, OF₂, SCl₂, SeCl₂, H₂S.

Descrição acessível dos exemplos:

- H₂O: oxigênio central vermelho, dois hidrogênios branco/cinza claro e duas nuvens eletrônicas azuis.
- OF₂: oxigênio central vermelho, dois flúors verdes claros e duas nuvens eletrônicas azuis.
- SCl₂: enxofre central amarelo, dois cloros verdes e duas nuvens eletrônicas azuis.
- SeCl₂: selênio central ocre, dois cloros verdes e duas nuvens eletrônicas azuis.
- H₂S: enxofre central amarelo, dois hidrogênios branco/cinza claro e duas nuvens eletrônicas azuis.

### Gangorra / Seesaw (AX4E)

Composição visual: 4 ligantes e 1 nuvem eletrônica não ligante.

Descrição acessível do arranjo: O átomo central fica no meio da estrutura. A organização espacial apresenta deriva da bipirâmide trigonal: um espaço equatorial é ocupado por nuvem eletrônica, deixando dois ligantes axiais e dois ligantes equatoriais. O ângulo ideal ou aproximado é aproximadamente 120°, 90° e 180°.

Leitura das nuvens eletrônicas: as nuvens azuis devem ser descritas como pares não ligantes. Elas ocupam posições do arranjo eletrônico e ajudam a explicar por que a geometria molecular observada é diferente do arranjo eletrônico completo.

Exemplos disponíveis no seletor: SF₄, SeF₄, TeF₄, SeCl₄, TeCl₄.

Descrição acessível dos exemplos:

- SF₄: enxofre central amarelo, quatro flúors verdes claros e uma nuvem eletrônica azul.
- SeF₄: selênio central ocre, quatro flúors verdes claros e uma nuvem eletrônica azul.
- TeF₄: telúrio central marrom claro, quatro flúors verdes claros e uma nuvem eletrônica azul.
- SeCl₄: selênio central ocre, quatro cloros verdes e uma nuvem eletrônica azul.
- TeCl₄: telúrio central marrom claro, quatro cloros verdes e uma nuvem eletrônica azul.

### Em T (AX3E2)

Composição visual: 3 ligantes e 2 nuvens eletrônicas não ligantes.

Descrição acessível do arranjo: O átomo central fica no meio da estrutura. A organização espacial apresenta também deriva da bipirâmide trigonal: duas nuvens eletrônicas ocupam posições equatoriais e três ligantes desenham a letra T. O ângulo ideal ou aproximado é aproximadamente 90° e 180°.

Leitura das nuvens eletrônicas: este arranjo não mostra nuvens eletrônicas não ligantes; todos os domínios representados ao redor do átomo central são ligantes.

Exemplos disponíveis no seletor: ClF₃, BrF₃, IF₃, ICl₃, XeOF₂.

Descrição acessível dos exemplos:

- ClF₃: cloro central verde, três flúors verdes claros e duas nuvens eletrônicas azuis.
- BrF₃: bromo central marrom alaranjado, três flúors verdes claros e duas nuvens eletrônicas azuis.
- IF₃: iodo central roxo, três flúors verdes claros e duas nuvens eletrônicas azuis.
- ICl₃: iodo central roxo, três cloros verdes e duas nuvens eletrônicas azuis.
- XeOF₂: xenônio central azul arroxeado, um oxigênio vermelho, dois flúors verdes claros e duas nuvens eletrônicas azuis.

### Linear (AX2E3)

Composição visual: 2 ligantes e 3 nuvens eletrônicas não ligantes.

Descrição acessível do arranjo: O átomo central fica no meio da estrutura. A organização espacial apresenta dois ligantes ficam em lados opostos; três nuvens eletrônicas ocupam o plano equatorial, deixando a molécula linear. O ângulo ideal ou aproximado é 180° entre ligantes; nuvens equatoriais separadas por cerca de 120°.

Leitura das nuvens eletrônicas: este arranjo não mostra nuvens eletrônicas não ligantes; todos os domínios representados ao redor do átomo central são ligantes.

Exemplos disponíveis no seletor: XeF₂, I₃⁻, ICl₂⁻, BrF₂⁻, KrF₂.

Descrição acessível dos exemplos:

- XeF₂: xenônio central azul arroxeado, dois flúors verdes claros e três nuvens eletrônicas azuis.
- I₃⁻: iodo central roxo, dois iodos roxos como ligantes e três nuvens eletrônicas azuis.
- ICl₂⁻: iodo central roxo, dois cloros verdes e três nuvens eletrônicas azuis.
- BrF₂⁻: bromo central marrom alaranjado, dois flúors verdes claros e três nuvens eletrônicas azuis.
- KrF₂: criptônio central azul claro, dois flúors verdes claros e três nuvens eletrônicas azuis.

### Piramidal quadrada (AX5E)

Composição visual: 5 ligantes e 1 nuvem eletrônica não ligante.

Descrição acessível do arranjo: O átomo central fica no meio da estrutura. A organização espacial apresenta quatro ligantes formam uma base quadrada, um ligante fica no eixo vertical e uma nuvem eletrônica ocupa a posição oposta. O ângulo ideal ou aproximado é aproximadamente 90° e 180°.

Leitura das nuvens eletrônicas: as nuvens azuis devem ser descritas como pares não ligantes. Elas ocupam posições do arranjo eletrônico e ajudam a explicar por que a geometria molecular observada é diferente do arranjo eletrônico completo.

Exemplos disponíveis no seletor: BrF₅, IF₅, ClF₅, XeOF₄, SeF₅⁻.

Descrição acessível dos exemplos:

- BrF₅: bromo central marrom alaranjado, cinco flúors verdes claros e uma nuvem eletrônica azul.
- IF₅: iodo central roxo, cinco flúors verdes claros e uma nuvem eletrônica azul.
- ClF₅: cloro central verde, cinco flúors verdes claros e uma nuvem eletrônica azul.
- XeOF₄: xenônio central azul arroxeado, quatro flúors verdes claros e uma ligação representada para oxigênio no conjunto do exemplo; há uma nuvem eletrônica azul.
- SeF₅⁻: selênio central ocre, cinco flúors verdes claros e uma nuvem eletrônica azul.

### Quadrada planar (AX4E2)

Composição visual: 4 ligantes e 2 nuvens eletrônicas não ligantes.

Descrição acessível do arranjo: O átomo central fica no meio da estrutura. A organização espacial apresenta quatro ligantes ficam no mesmo plano, nos cantos de um quadrado; duas nuvens eletrônicas ficam em lados opostos fora desse plano. O ângulo ideal ou aproximado é 90° entre vizinhos e 180° entre opostos.

Leitura das nuvens eletrônicas: este arranjo não mostra nuvens eletrônicas não ligantes; todos os domínios representados ao redor do átomo central são ligantes.

Exemplos disponíveis no seletor: XeF₄, ICl₄⁻, BrF₄⁻, IF₄⁻, ClF₄⁻.

Descrição acessível dos exemplos:

- XeF₄: xenônio central azul arroxeado, quatro flúors verdes claros e duas nuvens eletrônicas azuis.
- ICl₄⁻: iodo central roxo, quatro cloros verdes e duas nuvens eletrônicas azuis.
- BrF₄⁻: bromo central marrom alaranjado, quatro flúors verdes claros e duas nuvens eletrônicas azuis.
- IF₄⁻: iodo central roxo, quatro flúors verdes claros e duas nuvens eletrônicas azuis.
- ClF₄⁻: cloro central verde, quatro flúors verdes claros e duas nuvens eletrônicas azuis.

## Descrição dos controles visuais

Comprimento de ligação: aumenta ou diminui a distância entre o átomo central e os ligantes. Para o leitor de tela, descrever como “ligações mais curtas” ou “ligações mais longas”.

Raio do átomo central: altera o tamanho da esfera central. A função química do átomo não muda; muda apenas a escala visual.

Raio dos ligantes: altera o tamanho das esferas externas.

Raio da ligação: altera a espessura das hastes que conectam o átomo central aos ligantes.

Tamanho das nuvens eletrônicas: aumenta ou diminui as regiões azuis que representam pares não ligantes. Quando esse controle cresce, a descrição deve reforçar que as nuvens ocupam mais espaço visual ao redor do átomo central.

Mostrar ângulos: ativa arcos e marcações no canvas de sobreposição. Esses arcos indicam relações angulares entre ligações, como 90°, 109,5°, 120° ou 180°.

Fundo branco: alterna a leitura visual entre fundo escuro e fundo claro. O fundo escuro destaca esferas claras, brilhos e nuvens azuis. O fundo claro pode melhorar a leitura de contornos escuros e reduzir sensação de tela pesada. A geometria e os exemplos não mudam com o tema.

Tipo de ligação: alterna entre ligação simples, dupla ou tripla. Na descrição acessível, informar se há uma, duas ou três hastes/linhas entre o átomo central e o ligante quando isso estiver visualmente representado.

## Observações para implementação

Este texto pode ser usado como arquivo separado para a animação de Geometria Molecular 3D. O ideal é que a descrição seja atualizada quando a pessoa usuária trocar o arranjo VSEPR ou clicar em um exemplo molecular. Para cada estado, anunciar: nome do arranjo, fórmula do exemplo, átomo central, ligantes, presença ou ausência de nuvens eletrônicas, tipo de ligação e ângulo principal.

O texto acessível não deve tratar nuvens eletrônicas como objetos decorativos. Elas são parte central da explicação científica, porque indicam pares de elétrons não ligantes e justificam a diferença entre arranjo eletrônico e geometria molecular.
