(function(){
  function onReady(fn){
    if(window.__geomTutorialAPI) return fn(window.__geomTutorialAPI);
    window.addEventListener('geom-api-ready', function(){ fn(window.__geomTutorialAPI); }, {once:true});
    setTimeout(function(){ if(window.__geomTutorialAPI) fn(window.__geomTutorialAPI); }, 80);
  }

  function esc(s){ return String(s==null?'':s).replace(/[&<>\"]/g,function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[m]; }); }
  function sleep(ms){ return new Promise(function(r){ setTimeout(r, ms||0); }); }
  function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
  function round(n,d){ var p=Math.pow(10,d||2); return Math.round(n*p)/p; }
  function v(x,y,z){ return [x,y,z]; }
  function vAdd(a,b){ return [a[0]+b[0],a[1]+b[1],a[2]+b[2]]; }
  function vSub(a,b){ return [a[0]-b[0],a[1]-b[1],a[2]-b[2]]; }
  function vMul(a,s){ return [a[0]*s,a[1]*s,a[2]*s]; }
  function vDot(a,b){ return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]; }
  function vCross(a,b){ return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]]; }
  function vLen(a){ return Math.hypot(a[0],a[1],a[2]); }
  function vNorm(a){ var L=vLen(a)||1; return [a[0]/L,a[1]/L,a[2]/L]; }
  function lerp(a,b,t){ return a+(b-a)*t; }
  function ease(t){ return t<.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2; }

  function geomPositions(type){
    
    var DEG = Math.PI/180;
    var SQ2=Math.sqrt(2), SQ3=Math.sqrt(3);
    var trig = [
      [ 1, 0, 0 ],
      [ -0.5,  SQ3/2, 0 ],
      [ -0.5, -SQ3/2, 0 ]
    ];
    var r = 2*SQ2/3, z = -1/3;
    var tetra = [
      [0,0,1],
      [ r, 0, z],
      [ r*Math.cos(2*Math.PI/3), r*Math.sin(2*Math.PI/3), z],
      [ r*Math.cos(4*Math.PI/3), r*Math.sin(4*Math.PI/3), z]
    ];
    var tbp = { eq: trig, ax: [[0,0,1],[0,0,-1]] };
    var oct = [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
    function nrm(v){ var L=Math.hypot(v[0],v[1],v[2])||1; return [v[0]/L,v[1]/L,v[2]/L]; }
    tetra = tetra.map(nrm);

    switch(type){
      case 'linear': return {lig:[[0,0,1],[0,0,-1]], lp:[], angle:'180°', ideal:'180°', arr:'AX2', label:'Linear'};
      case 'trigonal_planar': return {lig:trig, lp:[], angle:'120°', ideal:'120°', arr:'AX3', label:'Trigonal planar'};
      case 'tetrahedral':
      case 'tetra': return {lig:[tetra[0],tetra[1],tetra[2],tetra[3]], lp:[], angle:'109,5° (3D)', ideal:'109,5°', arr:'AX4', label:'Tetraédrica'};
      case 'trigonal_bipyramidal':
      case 'tbp': return {lig:tbp.eq.concat(tbp.ax), lp:[], angle:'120° (eq-eq), 90° (ax-eq), 180° (ax-ax)', ideal:'120°/90°/180°', arr:'AX5', label:'Bipirâmide trigonal'};
      case 'octahedral':
      case 'oct': return {lig:oct, lp:[], angle:'90° (adj.), 180° (opostos)', ideal:'90°/180°', arr:'AX6', label:'Octaédrica'};

      case 'bent_tp': {
        var t=60*DEG;
        var lig=[ [ Math.sin(t),0,-Math.cos(t) ], [ -Math.sin(t),0,-Math.cos(t) ] ];
        var lp=[ [0,0,1] ];
        return {lig:lig, lp:lp, angle:'≈120° (1 par livre)', ideal:'≈120°', arr:'AX2E', label:'Angular (AX2E)'};
      }
      case 'trigonal_pyramidal': {
        var lig=[tetra[1],tetra[2],tetra[3]];
        var lp=[tetra[0]];
        return {lig:lig, lp:lp, angle:'≈107° (1 par livre)', ideal:'≈107°', arr:'AX3E', label:'Piramidal trigonal (AX3E)'};
      }
      case 'bent_tet': {
        var lig=[nrm([1,0,-0.78]), nrm([-1,0,-0.78])];
        var lp=[nrm([1,1,1]), nrm([-1,-1,1])];
        return {lig:lig, lp:lp, angle:'≈104,5° (2 pares livres)', ideal:'≈104,5°', arr:'AX2E2', label:'Angular (AX2E2)'};
      }
      case 'see_saw': {
        var lp=[tbp.eq[0]];
        var lig=[tbp.eq[1],tbp.eq[2],tbp.ax[0],tbp.ax[1]];
        return {lig:lig, lp:lp, angle:'≈120° (eq-eq), ≈90° (ax-eq), ≈180° (ax-ax)', ideal:'≈120°/≈90°/≈180°', arr:'AX4E', label:'Gangorra (AX4E)'};
      }
      case 't_shaped': {
        var lp=[tbp.eq[0],tbp.eq[1]];
        var lig=[tbp.eq[2],tbp.ax[0],tbp.ax[1]];
        return {lig:lig, lp:lp, angle:'≈90° (ax-eq), ≈180° (ax-ax)', ideal:'≈90°/≈180°', arr:'AX3E2', label:'Em T (AX3E2)'};
      }
      case 'linear_tbp': {
        var lig=[tbp.ax[0],tbp.ax[1]];
        var lp=tbp.eq.slice();
        return {lig:lig, lp:lp, angle:'≈180° (lig-lig); pares livres equatoriais a ≈120°', ideal:'≈180°', arr:'AX2E3', label:'Linear (AX2E3)'};
      }
      case 'square_pyramidal': {
        var lig=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,-1]];
        var lp=[[0,0,1]];
        return {lig:lig, lp:lp, angle:'≈90° (ax-basal), ≈90°/≈180° na base', ideal:'≈90°/≈90°/≈180°', arr:'AX5E', label:'Piramidal quadrada (AX5E)'};
      }
      case 'square_planar': {
        var lig=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0]];
        var lp=[[0,0,1],[0,0,-1]];
        return {lig:lig, lp:lp, angle:'≈90°/≈180° (pares livres trans fora do plano)', ideal:'≈90°/≈180°', arr:'AX4E2', label:'Quadrada planar (AX4E2)'};
      }
      default: return {lig:[tetra[0],tetra[1],tetra[2],tetra[3]], lp:[], angle:'109,5° (3D)', ideal:'109,5°', arr:'AX4', label:'Tetraédrica'};
    }
  }

  var exampleCatalog = {
    H2O: { key:'H2O', label:'H₂O', geom:'bent_tet', center:'O', ligands:['H','H'], centerColor:'#d84040', ligandColor:'#f5f7ff', lpColor:'#1100ff', sign:-1, muBond:1.5, delta:'O é mais eletronegativo que H; cada ligação O-H tem dipolo apontando para O.', view:{camDist:4.65, rotX:0.43, rotY:-0.95, objRotXDeg:0, objRotYDeg:0, objRotZDeg:0}, note:'Geometria angular + dipolos que não se cancelam ⇒ molécula polar.', densityBias:1.0 },
    NH3: { key:'NH3', label:'NH₃', geom:'trigonal_pyramidal', center:'N', ligands:['H','H','H'], centerColor:'#4d7cff', ligandColor:'#f5f7ff', lpColor:'#1100ff', sign:-1, muBond:1.25, delta:'N é mais eletronegativo que H; os dipolos N-H apontam para o N.', view:{camDist:4.9, rotX:0.36, rotY:-0.85, objRotXDeg:0, objRotYDeg:0, objRotZDeg:0}, note:'A pirâmide trigonal e o par livre ajudam a gerar resultante não nula.', densityBias:0.8 },
    CO2: { key:'CO2', label:'CO₂', geom:'linear', center:'C', ligands:['O','O'], centerColor:'#3c3f45', ligandColor:'#d84040', lpColor:'#1100ff', sign:+1, muBond:1.8, delta:'Cada C=O é polar (dipolo aponta para O), mas a geometria linear cancela os vetores.', view:{camDist:4.15, rotX:0.10, rotY:0.06, objRotXDeg:0, objRotYDeg:0, objRotZDeg:0}, note:'Ligação polar não garante molécula polar: a simetria pode cancelar.', densityBias:0.0 },
    BF3: { key:'BF3', label:'BF₃', geom:'trigonal_planar', center:'B', ligands:['F','F','F'], centerColor:'#e39b3c', ligandColor:'#6fd68c', lpColor:'#1100ff', sign:+1, muBond:1.4, delta:'B-F é bem polar, mas os três vetores a 120° se cancelam no plano.', view:{camDist:4.65, rotX:0.07, rotY:0.05, objRotXDeg:0, objRotYDeg:0, objRotZDeg:0}, note:'Exemplo clássico de molécula apolar com ligações polares.', densityBias:0.0 },
    SO2: { key:'SO2', label:'SO₂', geom:'bent_tp', center:'S', ligands:['O','O'], centerColor:'#f0bf4a', ligandColor:'#d84040', lpColor:'#1100ff', sign:+1, muBond:1.55, delta:'O é mais eletronegativo que S; como a geometria é angular, a soma não zera.', view:{camDist:4.65, rotX:0.22, rotY:-0.35, objRotXDeg:0, objRotYDeg:0, objRotZDeg:0}, note:'Ótimo para comparar com CO₂: ambos têm 2 oxigênios, mas geometrias diferentes.', densityBias:0.9 },
    CH4: { key:'CH4', label:'CH₄', geom:'tetrahedral', center:'C', ligands:['H','H','H','H'], centerColor:'#2f343a', ligandColor:'#f5f7ff', lpColor:'#1100ff', sign:+1, muBond:0.35, delta:'C-H é fracamente polar; na tetraédrica os vetores se cancelam quase totalmente.', view:{camDist:5.2, rotX:0.36, rotY:-0.75, objRotXDeg:0, objRotYDeg:0, objRotZDeg:0}, note:'Na prática, CH₄ é tratado como apolar.', densityBias:0.0 },
    CCl4: { key:'CCl4', label:'CCl₄', geom:'tetrahedral', center:'C', ligands:['Cl','Cl','Cl','Cl'], centerColor:'#2f343a', ligandColor:'#7bde64', lpColor:'#1100ff', sign:+1, muBond:1.5, delta:'Cada C-Cl é polar, mas a simetria tetraédrica cancela a resultante.', view:{camDist:5.2, rotX:0.36, rotY:-0.75, objRotXDeg:0, objRotYDeg:0, objRotZDeg:0}, note:'Simetria perfeita = cancelamento vetorial.', densityBias:0.0 },
    BeCl2: { key:'BeCl2', label:'BeCl₂', geom:'linear', center:'Be', ligands:['Cl','Cl'], centerColor:'#b5b9c1', ligandColor:'#7bde64', lpColor:'#1100ff', sign:+1, muBond:1.55, delta:'Ligação polar + arranjo linear simétrico ⇒ resultante nula.', view:{camDist:4.2, rotX:0.12, rotY:0.02, objRotXDeg:0, objRotYDeg:0, objRotZDeg:0}, note:'Linear simétrica é campeã de cancelamento.', densityBias:0.0 }
  };

  var steps = [
    {
      title:'Polaridade molecular: definição e origem',
      body:'A <b>polaridade molecular</b> decorre de uma <b>distribuição espacial não uniforme da densidade eletrônica</b>. Essa distribuição depende principalmente da <b>diferença de eletronegatividade</b> entre os átomos ligados e da <b>geometria molecular</b>. Quando há separação de cargas parciais, formam-se regiões com <b>δ−</b> e <b>δ+</b>, associadas a um <b>momento dipolar</b>.',
      note:'A polaridade é uma propriedade vetorial. Portanto, sua análise exige considerar simultaneamente <b>módulo</b>, <b>direção</b> e <b>sentido</b> dos dipolos de ligação na estrutura tridimensional.',
      pills:['densidade eletrônica','δ+ / δ−','polaridade'],
      examples:['H2O','CO2'],
      viz:{bond:true,result:true,cloud:true,calc:false,deltas:true,angles:false},
      run: async function(api){ await setExample('H2O', {cam:true}); }
    },
    {
      title:'Ângulos de ligação e projeção geométrica',
      body:'A análise dos <b>ângulos de ligação</b> pode ser facilitada por uma <b>projeção geométrica</b> do arranjo molecular. Em geometrias simétricas, a distribuição espacial das ligações ao redor do átomo central conduz a valores angulares característicos, como <b>180°</b> em moléculas lineares, <b>120°</b> em geometrias trigonais planares e aproximadamente <b>109,5°</b> em geometrias tetraédricas.',
      note:'A projeção bidimensional não substitui a estrutura tridimensional real, mas auxilia na visualização da distribuição angular e da orientação relativa dos vetores dipolares.',
      pills:['projeção','pizza','setores angulares'],
      examples:['BF3','CO2','CH4'],
      viz:{bond:true,result:true,cloud:true,calc:false,deltas:false,angles:true,pizza:true},
      run: async function(api){ await setExample('BF3', {cam:true}); }
    },
    {
      title:'Polaridade de ligação e polaridade molecular',
      body:'Uma <b>ligação polar</b> ocorre quando os elétrons compartilhados são deslocados em direção ao átomo mais eletronegativo. Entretanto, a existência de ligações polares <b>não implica, por si só, que a molécula seja polar</b>. A polaridade molecular depende da <b>soma vetorial</b> de todos os dipolos de ligação no arranjo geométrico da molécula.',
      note:'Assim, a classificação correta exige duas etapas: identificar a polaridade de cada ligação e verificar se a geometria molecular promove <b>cancelamento total</b> ou <b>resultante não nula</b>.',
      pills:['ligação polar','soma vetorial','geometria importa'],
      examples:['CO2','SO2','BF3'],
      viz:{bond:true,result:true,cloud:true,calc:true,deltas:true,angles:true},
      run: async function(api){ await setExample('CO2', {cam:true}); }
    },
    {
      title:'Eletronegatividade e deslocamento da densidade eletrônica',
      body:'<b>Eletronegatividade</b> é a tendência relativa de um átomo em atrair para si a densidade eletrônica de uma ligação covalente. Em uma ligação entre átomos com eletronegatividades diferentes, o átomo mais eletronegativo concentra maior densidade eletrônica, adquirindo caráter <b>δ−</b>, enquanto o outro adquire caráter <b>δ+</b>.',
      note:'Esse deslocamento de densidade é a base da formação do <b>dipolo de ligação</b> e constitui a etapa inicial da análise de polaridade molecular.',
      examples:['H2O','NH3','BeCl2'],
      viz:{bond:true,result:false,cloud:true,calc:false,deltas:true,angles:false},
      run: async function(api){ await setExample('H2O', {cam:true}); }
    },
    {
      title:'Tendência periódica da eletronegatividade',
      body:'A eletronegatividade apresenta tendência geral de <b>aumentar ao longo do período, da esquerda para a direita</b>, e de <b>aumentar no grupo, de baixo para cima</b>. Elementos como <b>F</b>, <b>O</b> e <b>N</b> tendem a atrair fortemente a densidade eletrônica, enquanto elementos como <b>H</b>, <b>C</b> e <b>P</b> apresentam valores menores em comparação com esses não metais mais eletronegativos.',
      note:'Para a interpretação qualitativa da polaridade, muitas vezes basta comparar a ordem relativa entre os átomos envolvidos, sem necessidade de recorrer a valores numéricos exatos.',
      examples:['BeCl2','CCl4','BF3'],
      viz:{bond:true,result:false,cloud:true,calc:false,deltas:true,angles:false},
      run: async function(api){ await setExample('BeCl2', {cam:true}); }
    },
    {
      title:'Diferença de eletronegatividade (ΔEN)',
      body:'A <b>diferença de eletronegatividade</b> entre dois átomos, representada por <b>ΔEN</b>, fornece um critério qualitativo para estimar a polaridade de uma ligação. Quanto maior o valor de <b>ΔEN</b>, maior tende a ser a separação de cargas parciais. O átomo de maior eletronegatividade constitui a extremidade <b>δ−</b>, e o outro, a extremidade <b>δ+</b>.',
      note:'A identificação correta de <b>δ−</b> e <b>δ+</b> é essencial para estabelecer o sentido dos vetores dipolares de ligação.',
      examples:['NH3','H2O','SO2'],
      viz:{bond:true,result:false,cloud:true,calc:false,deltas:true,angles:false},
      run: async function(api){ await setExample('NH3', {cam:true}); }
    },
{
      title:'Momento dipolar de ligação (μ)',
      body:'Cada ligação polar pode ser representada por um <b>vetor de momento dipolar</b>, indicado por <b>μ</b>. O vetor é orientado em direção à região de maior densidade eletrônica. Em termos qualitativos, o módulo de <b>μ</b> aumenta com a intensificação da separação de cargas e com a distância efetiva entre os centros de carga.',
      note:'Em formulações simplificadas, o módulo do dipolo pode ser expresso como <b>μ = q·d</b>, em que <b>q</b> representa a carga efetiva separada e <b>d</b> a distância entre os centros de carga.',
      pills:['μ = q·d','sentido do vetor','ligação'],
      examples:['H2O','CO2','BF3'],
      viz:{bond:true,result:false,cloud:true,calc:true,deltas:true,angles:false},
      run: async function(api){ await setExample('H2O', {cam:false}); }
    },
    {
      title:'Regra do paralelogramo para soma vetorial',
      body:'Quando dois vetores partem da mesma origem, a soma gráfica pode ser obtida pela <b>regra do paralelogramo</b>. Constrói-se um paralelogramo com lados paralelos aos vetores originais, e a <b>diagonal traçada a partir da origem comum</b> representa o vetor resultante <b>μR</b>.',
      note:'Esse procedimento é equivalente à soma vetorial formal e permite visualizar, de modo geométrico, a direção e o módulo aproximado da resultante.',
      pills:['paralelogramo','soma gráfica','vetores'],
      examples:[],
      viz:{bond:true,result:true,cloud:false,calc:false,deltas:false,angles:false},
      onlyVectors:true,
      vectorMode:'parallelogram',
      run: async function(api){  }
    },
    {
      title:'Adição vetorial de dipolos',
      body:'Quando os dipolos de ligação possuem componentes orientadas em um <b>mesmo sentido</b>, ocorre <b>adição vetorial</b>. Nessa situação, as componentes ao longo de um eixo se somam, aumentando o módulo da resultante molecular.',
      note:'Em moléculas assimétricas, a coincidência parcial de componentes vetoriais é uma das causas mais frequentes da obtenção de <b>μR ≠ 0</b>.',
      pills:['adição vetorial','componentes','reforço de resultante'],
      examples:[],
      viz:{bond:true,result:true,cloud:true,calc:true,deltas:false,angles:true},
      onlyVectors:true,
      vectorMode:'addition',
      run: async function(api){ await setExample('H2O', {cam:true}); }
    },
    {
      title:'Subtração vetorial e cancelamento',
      body:'Quando dois vetores apresentam componentes em <b>sentidos opostos</b>, parte ou a totalidade da resultante pode ser anulada. Se os módulos forem iguais e os vetores forem colineares e opostos, ocorre <b>cancelamento total</b>. Em outros casos, o cancelamento pode ser apenas parcial, restando uma resultante diferente de zero.',
      note:'Esse princípio explica por que moléculas com ligações polares podem ser apolares quando a geometria distribui os vetores de modo simétrico.',
      pills:['subtração vetorial','cancelamento','simetria'],
      examples:[],
      viz:{bond:true,result:true,cloud:true,calc:true,deltas:false,angles:true},
      onlyVectors:true,
      vectorMode:'subtraction',
      run: async function(api){ await setExample('CO2', {cam:true}); }
    },

    {
      title:'Eixo de referência e leitura espacial',
      body:'Neste visualizador, o <b>eixo de simetria principal</b>, quando presente, é alinhado ao <b>eixo Z</b>. Essa escolha fornece um referencial geométrico estável para a observação da estrutura, da orientação dos vetores dipolares e da relação entre rotação do modelo e simetria molecular.',
      note:'O mini-eixo no canto da interface atua apenas como referência espacial da orientação global do sistema de coordenadas.',
      pills:['eixo Z','orientação','simetria'],
      examples:['CO2','BF3'],
      viz:{bond:true,result:true,cloud:true,calc:false,deltas:true,angles:true},
      run: async function(api){ await setExample('CO2', {cam:true}); }
    },
    {
      title:'Simetria molecular e cancelamento vetorial',
      body:'A <b>simetria molecular</b> corresponde à distribuição espacial regular dos ligantes em torno do átomo central. Em moléculas com ligantes equivalentes e geometria suficientemente simétrica, os vetores dipolares tendem a se distribuir de forma a produzir <b>cancelamento vetorial</b>, levando a <b>μR ≈ 0</b>.',
      note:'Por essa razão, a análise de polaridade não deve ser baseada apenas na polaridade individual das ligações, mas na <b>simetria do conjunto</b>.',
      pills:['simetria','cancelamento','μR'],
      examples:['CO2','SO2'],
      viz:{bond:true,result:true,cloud:true,calc:true,deltas:true,angles:true},
      run: async function(api){ await setExample('SO2', {cam:true}); }
    },
    {
      title:'Influência dos ângulos de ligação na resultante',
      body:'Os <b>ângulos de ligação</b> determinam a orientação espacial dos dipolos. Assim, mesmo dipolos de mesmo módulo podem produzir resultados distintos conforme o ângulo entre eles: <b>180°</b> favorece cancelamento máximo, enquanto ângulos menores ou geometrias deformadas podem gerar resultantes não nulas.',
      note:'Consequentemente, a avaliação da polaridade exige considerar simultaneamente <b>módulo dos dipolos</b>, <b>ângulos</b> e <b>geometria molecular</b>.',
      pills:['ângulos','direção','cancelamento parcial'],
      examples:['CO2','SO2','H2O'],
      viz:{bond:true,result:true,cloud:true,calc:true,deltas:false,angles:true},
      run: async function(api){ await setExample('SO2', {cam:true}); }
    },
    {
      title:'Momento dipolar resultante da molécula (μR)',
      body:'O <b>momento dipolar resultante</b> de uma molécula corresponde à <b>soma vetorial</b> de todos os dipolos de ligação e, em abordagens mais completas, também reflete a contribuição da distribuição associada a <b>pares de elétrons não ligantes</b>. Quando a soma vetorial é nula, a molécula é classificada como <b>apolar</b>; quando é diferente de zero, a molécula é <b>polar</b>.',
      note:'De forma compacta, pode-se representar essa ideia por <b>μR = Σμᵢ</b>, lembrando que se trata de soma vetorial em três dimensões.',
      pills:['Σμᵢ','vetor resultante','polar x apolar'],
      examples:['H2O','NH3','BF3','CCl4'],
      viz:{bond:true,result:true,cloud:true,calc:true,deltas:true,angles:false},
      run: async function(api){ await setExample('NH3', {cam:false}); }
    },
    {
      title:'Geometrias simétricas e apolaridade',
      body:'Em moléculas com <b>geometrias simétricas</b> e ligantes equivalentes, os dipolos de ligação costumam se organizar de modo a produzir <b>cancelamento completo ou aproximadamente completo</b>. Nesses casos, mesmo ligações fortemente polares podem coexistir com uma <b>molécula apolar</b>.',
      note:'Exemplos clássicos incluem moléculas lineares, trigonais planares e tetraédricas perfeitamente simétricas com substituintes idênticos.',
      pills:['simetria','cancelamento','apolar'],
      examples:['CO2','BF3','CCl4','BeCl2'],
      viz:{bond:true,result:true,cloud:true,calc:true,deltas:true,angles:false},
      run: async function(api){ await setExample('BF3', {cam:true}); }
    },
    {
      title:'Geometrias assimétricas e polaridade',
      body:'Quando a molécula apresenta <b>assimetria geométrica</b>, ligantes diferentes ou influência significativa de <b>pares de elétrons livres</b>, o cancelamento vetorial tende a ser incompleto. Nessa condição, permanece uma resultante dipolar diferente de zero, característica de moléculas <b>polares</b>.',
      note:'Em muitos casos, a presença de pares livres no átomo central altera os ângulos ideais e desloca a distribuição eletrônica, favorecendo a polaridade.',
      pills:['assimetria','pares livres','molécula polar'],
      examples:['H2O','NH3','SO2'],
      viz:{bond:true,result:true,cloud:true,calc:true,deltas:true,angles:true},
      run: async function(api){ await setExample('H2O', {cam:false}); }
    },
    {
      title:'Nuvem de densidade eletrônica',
      body:'A <b>nuvem de densidade eletrônica</b> representa, de modo qualitativo, as regiões do espaço nas quais a presença de elétrons é mais provável. Em moléculas polares, essa distribuição tende a ser mais intensa em determinadas regiões da estrutura; em moléculas apolares, a distribuição global tende a apresentar maior equilíbrio espacial.',
      note:'Essa visualização é qualitativa: ela indica a <b>ocupação eletrônica relativa</b> no espaço molecular, sem substituir uma descrição quântica completa da densidade.',
      pills:['nuvem eletrônica','densidade','visualização'],
      examples:['H2O','CO2','NH3'],
      viz:{bond:false,result:true,cloud:true,calc:false,deltas:true,angles:false},
      run: async function(api){ await setExample('H2O', {cam:false}); }
    },
    {
      title:'Mapa de densidade eletrônica',
      body:'O <b>mapa de densidade eletrônica</b> representa uma superfície associada à ocupação espacial da nuvem eletrônica. Essa visualização destaca as regiões onde a densidade eletrônica é relevante e permite observar como a nuvem se distribui ao redor da molécula, incluindo a influência de ligações e de pares não ligantes.',
      note:'Esse mapa descreve principalmente <b>distribuição espacial de densidade</b>; ele não deve ser confundido, por si só, com a indicação direta do sinal do potencial eletrostático.',
      pills:['superfície de densidade','onde ficam os elétrons','ocupação espacial'],
      examples:['H2O','CO2','NH3'],
      viz:{bond:false,result:true,cloud:true,calc:false,deltas:true,angles:false,mapDensity:true,mapESP:false},
      run: async function(api){ await setExample('H2O', {cam:true}); }
    },
    {
      title:'Mapa de potencial eletrostático (MEP)',
      body:'O <b>mapa de potencial eletrostático</b> colore a superfície molecular de acordo com o potencial experimentado por uma <b>carga de teste positiva</b>. Nesta convenção, regiões de <b>maior densidade eletrônica</b> e potencial mais negativo aparecem em <b>vermelho</b>; regiões de <b>menor densidade eletrônica</b> e potencial mais positivo aparecem em <b>azul</b>; e regiões intermediárias são representadas por <b>verde</b> e <b>amarelo</b>.',
      note:'Esse tipo de mapa é útil para identificar áreas relativamente mais eletrorrica ou mais eletropobre da superfície molecular e para discutir possíveis regiões preferenciais de interação.',
      pills:['MEP','superfície colorida','vermelho ↔ azul'],
      examples:['H2O','CO2','CCl4'],
      viz:{bond:false,result:true,cloud:false,calc:false,deltas:true,angles:false,mapDensity:false,mapESP:true},
      run: async function(api){ await setExample('H2O', {cam:false}); }
    },
    {
      title:'Procedimento sistemático para determinar a polaridade',
      body:'Para determinar a polaridade molecular, recomenda-se a seguinte sequência: <b>(1)</b> identificar a <b>geometria molecular</b>; <b>(2)</b> verificar quais ligações são polares com base na <b>diferença de eletronegatividade</b>; <b>(3)</b> representar os <b>dipolos de ligação</b>; <b>(4)</b> realizar a <b>soma vetorial</b> por simetria ou por componentes; <b>(5)</b> concluir se <b>μR = 0</b> ou <b>μR ≠ 0</b>.',
      note:'Esse procedimento evita classificações baseadas apenas na aparência da fórmula e torna explícita a relação entre estrutura e polaridade.',
      pills:['passo a passo','componentes','simetria'],
      examples:['CO2','BF3','H2O'],
      viz:{bond:true,result:true,cloud:false,calc:true,deltas:true,angles:false},
      run: async function(api){ await setExample('CO2', {cam:false}); }
    },
    {
      title:'Soma por componentes cartesianas',
      body:'Quando necessário, cada dipolo de ligação pode ser decomposto em componentes cartesianas <b>(μx, μy, μz)</b>. A resultante é obtida pelas somas <b>Σμx</b>, <b>Σμy</b> e <b>Σμz</b>, e seu módulo pode ser calculado por <b>|μR| = √(Σμx² + Σμy² + Σμz²)</b>.',
      note:'Esse procedimento é especialmente útil em moléculas tridimensionais ou em situações nas quais a simetria não permite concluir a polaridade de forma imediata.',
      pills:['componentes','módulo','√(x²+y²+z²)'],
      examples:['H2O','NH3','CCl4'],
      viz:{bond:true,result:true,cloud:false,calc:true,deltas:false,angles:false},
      run: async function(api){ await setExample('H2O', {cam:false}); }
    },
    {
      title:'Consequências físico-químicas da polaridade',
      body:'A polaridade molecular influencia diretamente diversas propriedades físico-químicas, como <b>interações intermoleculares</b>, <b>solubilidade</b>, <b>pontos de fusão e ebulição</b> e resposta a <b>campos elétricos</b>. Em geral, moléculas polares interagem de forma mais intensa com espécies polares ou carregadas do que moléculas apolares de tamanho comparável.',
      note:'Assim, a polaridade não é apenas uma classificação estrutural; ela contribui para explicar comportamentos observáveis em sistemas reais.',
      pills:['interações','solubilidade','propriedades'],
      examples:['H2O','CH4'],
      viz:{bond:true,result:true,cloud:true,calc:false,deltas:true,angles:false},
      run: async function(api){ await setExample('H2O', {cam:false}); }
    },
    {
      title:'Síntese do critério de análise',
      body:'A determinação da polaridade molecular pode ser resumida em três perguntas centrais: <b>(1)</b> as ligações são polares? <b>(2)</b> qual é a <b>geometria molecular</b>? <b>(3)</b> os dipolos se <b>cancelam vetorialmente</b>? A resposta articulada a essas três questões permite classificar a maior parte das moléculas de forma consistente.',
      note:'A abordagem correta combina eletronegatividade, geometria e soma vetorial, sem depender de memorização isolada de exemplos.',
      pills:['checklist final','comparação','raciocínio visual'],
      examples:['CO2','SO2','BF3','NH3','CCl4','H2O'],
      viz:{bond:true,result:true,cloud:true,calc:true,deltas:true,angles:false},
      run: async function(api){ await setExample('CO2', {cam:true}); }
    }
  ];

  
  
  steps = steps.filter(function(s){ return !/\bMEP\b|potencial eletrost[aá]tico/i.test((s&&s.title)||''); }); 

  var apiRef=null, el={}, overlay=null, octx=null, calcHud=null, stepIdx=0, applying=false, playing=false, token=0;
  var activeExampleKey='H2O';
  var stepClickedExampleKey = null;
  var visualState={ bond:true, result:true, cloud:true, calc:false, deltas:true, angles:false, mapDensity:false, mapESP:false, pizza:false };
  var mapEls={density:null, esp:null, box:null};
  var angleEls={box:null, list:null};
  var angleVisibility={};
  var angleRenderCache={signature:'', items:[], enabled:false};
  var glowPhase=0;

  function injectStyles(){
    var st=document.createElement('style');
    st.textContent = ''+
      '.polarOverlay{position:absolute; inset:0; pointer-events:none; z-index:19;}'+
      '.polarCalcHud{position:absolute; right:14px; bottom:52px; z-index:24; min-width:300px; max-width:min(420px,45vw); background:linear-gradient(180deg, rgba(10,16,30,.78), rgba(8,12,22,.70)); border:1px solid rgba(126,125,255,.22); border-radius:14px; padding:10px 12px; color:#e6f0ff;  font-size:12px; line-height:1.4;}'+
      '.polarCalcHud.hide{display:none}'+
      '.polarCalcHud .row{display:flex; justify-content:space-between; gap:8px; margin:2px 0;}'+
      '.polarCalcHud .mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}'+
      '.polarCalcHud .k{color:#b8cdea} .polarCalcHud .v{color:#fff}'+
      '.polarCalcHud .badge{display:inline-block; margin-left:6px; padding:2px 7px; border-radius:999px; font-weight:700; font-size:11px; border:1px solid rgba(255,255,255,.12)}'+
      '.polarCalcHud .badge.polar{background:rgba(72,196,255,.16); color:#dff7ff; border-color:rgba(72,196,255,.25)}'+
      '.polarCalcHud .badge.apolar{background:rgba(180,200,220,.12); color:#f4f7ff; border-color:rgba(255,255,255,.12)}'+
      '.tutorialExamples .calcBox{margin-top:8px; padding:8px 9px; border-radius:9px; border:1px solid rgba(255,255,255,.08); background:rgba(255,255,255,.02); text-align:justify; text-justify:inter-word; hyphens:auto}'+
      '.tutorialExamples .calcBox .mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}'+
      '.tutorialExamples .legendDots{display:flex; gap:8px; flex-wrap:wrap; margin-top:6px}'+
      '.tutorialExamples .dotItem{display:inline-flex; align-items:center; gap:6px; font-size:11px; color:#cfe0ff}'+
      '.tutorialExamples .dot{width:9px; height:9px; border-radius:50%}'+
      '.tutorialExamples, .tutorialBody, .tutorialNote{word-break:normal; overflow-wrap:break-word}'+
      '.mapOptionBox{margin-top:8px; padding:8px 9px; border-radius:10px; border:1px solid rgba(255,255,255,.08); background:rgba(255,255,255,.02)}'+
      '.mapOptionBox .mapTitle{font-size:11px; color:#bfd4f2; margin:0 0 6px; font-weight:700; letter-spacing:.02em}'+
      '.mapOptionBox .mapHelp{font-size:11px; color:#b6c8e7; margin-top:6px; line-height:1.35; text-align:justify; text-justify:inter-word}'+
      '.mapChk{display:flex; align-items:flex-start; gap:8px; margin:6px 0; padding:6px 7px; border-radius:9px; border:1px solid rgba(255,255,255,.06); background:rgba(255,255,255,.015)}'+
      '.mapChk input{margin-top:2px; accent-color:#6ea6ff}'+
      '.mapChk span{font-size:12px; color:#e6f0ff; line-height:1.25}'+
      '.mapChk small{display:block; color:#b6c8e7; font-size:10px; margin-top:2px}'+
      document.head.appendChild(st);
  }

  function pills(arr){
    arr = arr||[];
    return arr.map(function(p){ return '<span class="pill">'+esc(p)+'</span>'; }).join('');
  }

  function buildExamplesHTML(step){
    var html='';
    if(step.examples && step.examples.length){
      var first = exampleCatalog[step.examples[0]];
      
      if(stepIdx >= 2 && first){
        html += '<button type="button" class="exInlineBtn" data-ex-key="'+esc(first.key)+'"><b>Exemplo(s):</b> clique para jogar o primeiro exemplo na lousa ('+esc(first.label)+') e use os botões abaixo para comparar.</button>';
      } else {
        html += '<div class="small" style="margin:2px 0 8px; opacity:.92"><b>Exemplo(s):</b></div>';
      }
      html += '<div class="exBtns">'+ step.examples.map(function(k){
        var ex=exampleCatalog[k]; if(!ex) return '';
        return '<button type="button" class="exBtn'+(stepClickedExampleKey===k?' active':'')+'" data-ex-key="'+esc(k)+'">'+esc(ex.label||k)+'</button>';
      }).join('') +'</div>';
      html += '<div class="exHelp">Clique para alternar entre moléculas e comparar o cancelamento (ou reforço) dos vetores.</div>';
    }
        html += '<div class="legendDots">'+
      '<span class="dotItem"><span class="dot" style="background:#4ec7ff"></span>dipolos de ligação</span>'+
      '<span class="dotItem"><span class="dot" style="background:#ffd34d"></span>μ resultante</span>'+
      '<span class="dotItem"><span class="dot" style="background:#5f7dff"></span>nuvem eletrônica (mais densa)</span>'+
    '</div>';
    return html;
  }
  function getCoreBondLen(){
    var ui = apiRef && apiRef.ui;
    if(ui && ui.bondLen) return parseFloat(ui.bondLen.value)||1.55;
    return 1.55;
  }

  function formatAngleValue(deg){
    var n = Math.round((deg||0) * 10) / 10;
    if(Math.abs(n - Math.round(n)) < 0.05) return String(Math.round(n)).replace('.', ',') + '°';
    return n.toFixed(1).replace('.', ',') + '°';
  }

  function anglePaletteAt(i){
    var palette = ['#ff6b6b','#ffd166','#06d6a0','#4cc9f0','#a78bfa','#f472b6','#f97316','#22c55e','#60a5fa','#eab308'];
    return palette[((i||0)%palette.length+palette.length)%palette.length];
  }

  function computeAngleDescriptors(data){
    return [];
  }

  function ensureAngleOptionsUI(){
    return;
  }

  function syncAngleOptionsUI(data, enabled){
    return [];
  }

  function drawAngleArcColored(ctx, c, p1, p2, label, color, radius){
    if(!c||!p1||!p2) return;
    var a1=Math.atan2(p1.y-c.y,p1.x-c.x), a2=Math.atan2(p2.y-c.y,p2.x-c.x);
    var da = a2-a1; while(da>Math.PI) da-=2*Math.PI; while(da<-Math.PI) da+=2*Math.PI;
    var rr = radius || Math.max(24, Math.min(58, Math.min(Math.hypot(p1.x-c.x,p1.y-c.y), Math.hypot(p2.x-c.x,p2.y-c.y))*0.52));
    var is180 = Math.abs(Math.abs(da) - Math.PI) < 0.08;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.1;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    if(ctx.setLineDash) ctx.setLineDash([8,5]);
    if(is180){
      ctx.beginPath();
      ctx.arc(c.x, c.y, rr, Math.PI, 0, false);
      ctx.stroke();
      var top = __angleClampLabelPos(ctx, c.x, c.y - rr - 8, label);
      ctx.fillStyle = color;
      ctx.font='700 12px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
      ctx.fillText(label, top.x - ctx.measureText(label).width*0.5, top.y);
    } else {
      ctx.beginPath();
      ctx.arc(c.x, c.y, rr, a1, a1 + da, da < 0);
      ctx.stroke();
      var am = a1 + da * 0.5;
      var pos = __angleClampLabelPos(ctx, c.x + Math.cos(am) * (rr + 16), c.y + Math.sin(am) * (rr + 8), label);
      ctx.fillStyle = color;
      ctx.font='700 12px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
      ctx.fillText(label, pos.x - ctx.measureText(label).width*0.5, pos.y);
    }
    if(ctx.setLineDash) ctx.setLineDash([]);
    ctx.restore();
  }

  function drawAngleOverlay(ctx, data, view, can){
    return;
  }

  function getWorldDataForExample(ex){
    var G = geomPositions(ex.geom);
    var bl = getCoreBondLen();
    var center = [0,0,0];
    var atoms = [{label:ex.center, role:'center', pos:center}];
    for(var i=0;i<G.lig.length;i++){
      atoms.push({label: ex.ligands[i] || 'X', role:'lig', pos:vMul(G.lig[i], bl), dir:G.lig[i]});
    }
    var rCenter = __elementRadiusWorld(ex.center, 'center');
    var ligR = (apiRef && apiRef.ui && apiRef.ui.ligandRadius) ? (parseFloat(apiRef.ui.ligandRadius.value)||0.44) : 0.44;
    var lpScaleVal = (apiRef && apiRef.ui && apiRef.ui.lpScale) ? (parseFloat(apiRef.ui.lpScale.value)||1.6) : 1.6;
    var lpRadius = ligR * Math.max(0.22, Math.min(0.95, lpScaleVal * 0.42));
    var lpDist = bl;
    var lps = (G.lp||[]).map(function(d){
      return {dir:d, pos:vMul(d, lpDist), size:lpRadius, radial:lpRadius*0.82};
    });
    var bondDipoles=[];
    var sum=[0,0,0];
    for(var j=0;j<G.lig.length;j++){
      var dir = G.lig[j];
      var mu = (ex.muBond || 1.0);
      var dvec = vMul(dir, mu * (ex.sign||1));
      var anchor = vMul(dir, bl*0.52);
      bondDipoles.push({anchor:anchor, vec:dvec, dir:dir, mu:mu});
      sum = vAdd(sum, dvec);
    }
    return { ex:ex, geom:G, atoms:atoms, lps:lps, bondDipoles:bondDipoles, muR:sum, muMag:vLen(sum), bondLen:bl };
  }

  function setExampleColors(ex){
    var ui = apiRef.ui;
    if(ui.coreColor) ui.coreColor.value = ex.centerColor || '#bca96a';
    if(ui.ligandColor) ui.ligandColor.value = ex.ligandColor || '#8fd6ff';
    if(ui.lpColor) ui.lpColor.value = ex.lpColor || '#1100ff';
    if(ui.showAxes) ui.showAxes.checked = true;
    if(ui.lpScale){ ui.lpScale.value = (ex.geom==='bent_tet'||ex.geom==='trigonal_pyramidal'||ex.geom==='bent_tp') ? '1.9' : '1.6'; }
  }

  async function setExample(key, opts){
    var ex = exampleCatalog[key]; if(!ex || !apiRef) return;
    activeExampleKey = key;
    if(opts && opts.userClick) stepClickedExampleKey = key;
    playing = false;
    setExampleColors(ex);
    apiRef.setBoardSplit && apiRef.setBoardSplit(false);
    apiRef.clearBalloons && apiRef.clearBalloons();
    apiRef.setGeom(ex.geom);
    apiRef.sync();
    if(el.examples){ el.examples.innerHTML = buildExamplesHTML(steps[stepIdx]); }
    if(opts && opts.cam && ex.view){ try{ await apiRef.animateTo(ex.view, 800); }catch(_e){} }
  }


  function ensureMapOptionsUI(){
    if(mapEls.box) return;
    var host = el.card || document.getElementById('tutorialCard');
    if(!host) return;
    var note = document.getElementById('tutorialNote');
    var examples = document.getElementById('tutorialExamples');
    var box = document.createElement('div');
    box.className = 'mapOptionBox';
    box.id = 'polarMapOptions';
    box.innerHTML = ''+
      '<div class="mapTitle">Mapas de visualização (overlay)</div>'+
      '<label class="mapChk"><input type="checkbox" id="chkMapDensity"><span><b>Mostrar mapa de densidade eletrônica</b><small>superfície/nuvem qualitativa (onde há maior probabilidade de encontrar elétrons)</small></span></label>'+
      '<label class="mapChk"><input type="checkbox" id="chkMapESP"><span><b>Mostrar mapa de potencial eletrostático</b><small>volume 3D colorido: vermelho = mais eletrorrico, azul = mais eletropobre, verde/amarelo = intermediário</small></span></label>'+
      '<div class="mapHelp" style="display:none"></div>';
    if(note && note.parentNode){ note.parentNode.insertBefore(box, examples || note.nextSibling); }
    else host.appendChild(box);
    mapEls.box = box;
    mapEls.density = box.querySelector('#chkMapDensity');
    mapEls.esp = box.querySelector('#chkMapESP');
    [mapEls.density, mapEls.esp].forEach(function(inp){ if(!inp) return; inp.addEventListener('change', function(){
      visualState.mapDensity = !!(mapEls.density && mapEls.density.checked);
      visualState.mapESP = !!(mapEls.esp && mapEls.esp.checked);
    });});
    syncMapOptionsUI();
    syncAngleOptionsUI(moleculeVisualData(), !!(visualState.angles && showAngles && showAngles.checked));
  }

  function syncMapOptionsUI(){
    if(!mapEls.box) return;
    if(mapEls.density) mapEls.density.checked = !!visualState.mapDensity;
    if(mapEls.esp) mapEls.esp.checked = !!visualState.mapESP;
  }

  function updateButtons(){
    if(!el.prev) return;
    el.prev.disabled = applying || stepIdx===0;
    if(el.next) el.next.disabled = applying;
    if(el.restart) el.restart.disabled = applying;
    if(el.play){
      el.play.disabled = applying;
      el.play.textContent = playing ? '⏸ Auto' : '▶ Auto';
    }
    if(el.next) el.next.textContent = stepIdx === steps.length-1 ? 'Concluir ✓' : 'Próximo ▶';
  }

  function setFade(on){ if(el.card) el.card.classList.toggle('fadeStep', !!on); }

  function renderStep(){
    stepClickedExampleKey = null;
    var s = steps[stepIdx];
    visualState = Object.assign({bond:true,result:true,cloud:true,calc:false,deltas:true,angles:true,mapDensity:false,mapESP:false,pizza:false}, s.viz||{});
    
    visualState.result = true;
    
    visualState.angles = !s.onlyVectors;
    
    visualState.mapESP = false;
    visualState.pizza = false;
    if(s.onlyVectors){
      visualState.cloud = false;
      visualState.deltas = false;
      visualState.mapDensity = false;
      visualState.mapESP = false;
      visualState.pizza = false;
    }
    syncMapOptionsUI();
    el.tag.textContent = 'Passo ' + (stepIdx+1) + ' / ' + steps.length;
    el.title.innerHTML = s.title;
    el.body.innerHTML = s.body;
    el.note.innerHTML = s.note || '';
    el.mini.innerHTML = pills(s.pills);
    el.examples.innerHTML = buildExamplesHTML(s);
    el.examples.style.display = '';
    el.prog.style.width = (((stepIdx+1)/steps.length)*100).toFixed(2)+'%';
    updateButtons();
    }

  async function applyStep(i){
    stepIdx = clamp(i, 0, steps.length-1);
    var my = ++token;
    applying = true; updateButtons(); setFade(true); renderStep();
    await sleep(80); setFade(false);
    try{ if(steps[stepIdx].run) await steps[stepIdx].run(apiRef); }catch(e){ console.error(e); }
    if(my !== token) return;
    applying = false; updateButtons();
    }
  async function next(){ if(applying) return; if(stepIdx>=steps.length-1){ playing=false; updateButtons(); return; } await applyStep(stepIdx+1); }
  async function prev(){ if(applying||stepIdx<=0) return; await applyStep(stepIdx-1); }
  async function restart(){ playing=false; token++; await applyStep(0); }
  async function autoplay(){
    if(playing){ playing=false; updateButtons(); return; }
    playing=true; updateButtons();
    while(playing && stepIdx < steps.length-1){ if(applying){ await sleep(120); continue; } await sleep(2700); if(!playing) break; await next(); }
    playing=false; updateButtons();
  }

  function getCanvasAndCtx(){
    var glCanvas = document.getElementById('gl');
    if(!glCanvas) return null;
    if(!overlay){
      overlay = document.createElement('canvas');
      overlay.className='polarOverlay';
      overlay.id='polarOverlay';
      glCanvas.parentElement.appendChild(overlay);
      octx = overlay.getContext('2d');
}
    var dpr = Math.max(1, Math.min(2, window.devicePixelRatio||1));
    var w = glCanvas.clientWidth||1, h = glCanvas.clientHeight||1;
    if(overlay.width !== Math.round(w*dpr) || overlay.height !== Math.round(h*dpr)){
      overlay.width = Math.round(w*dpr); overlay.height = Math.round(h*dpr);
    }
    overlay.style.width = w+'px'; overlay.style.height = h+'px';
    octx.setTransform(dpr,0,0,dpr,0,0);
    return {glCanvas:glCanvas, w:w, h:h, dpr:dpr};
  }

  
  function __projectViaViewer(world){
    if(apiRef && typeof apiRef.projectLocal === 'function'){
      try{
        var pLocal = apiRef.projectLocal(world);
        if(pLocal && isFinite(pLocal.x) && isFinite(pLocal.y)) return { x:pLocal.x, y:pLocal.y, z:isFinite(pLocal.z) ? pLocal.z : 0, scale:pLocal.scale };
      }catch(_e){}
    }
    if(apiRef && typeof apiRef.projectWorld === 'function'){
      try{
        var input = world;
        if(apiRef && typeof apiRef.localToWorld === 'function') input = apiRef.localToWorld(world);
        var p = apiRef.projectWorld(input);
        if(p && isFinite(p.x) && isFinite(p.y)) return { x:p.x, y:p.y, z:isFinite(p.z) ? p.z : 0, scale:p.scale };
      }catch(_e){}
    }
    return null;
  }

  function rotateXYZJS(p, view){
    var DEG_LOCAL = Math.PI/180;
    var rx=((view&&('objRotXDeg' in view))? (view.objRotXDeg||0):0)*DEG_LOCAL;
    var ry=((view&&('objRotYDeg' in view))? (view.objRotYDeg||0):0)*DEG_LOCAL;
    var rz=((view&&('objRotZDeg' in view))? (view.objRotZDeg||0):0)*DEG_LOCAL;
    if(!rx && !ry && !rz) return p;
    var x=p[0], y=p[1], z=p[2];
    var cx=Math.cos(rx), sx=Math.sin(rx);
    var y1=cx*y - sx*z, z1=sx*y + cx*z; y=y1; z=z1;
    var cy=Math.cos(ry), sy=Math.sin(ry);
    var x2=cy*x + sy*z, z2=-sy*x + cy*z; x=x2; z=z2;
    var cz=Math.cos(rz), sz=Math.sin(rz);
    var x3=cz*x - sz*y, y3=sz*x + cz*y; x=x3; y=y3;
    return [x,y,z];
  }

  function getCameraBasisJS(view){
    var ex=view.camDist*Math.cos(view.rotX)*Math.sin(view.rotY);
    var ey=view.camDist*Math.sin(view.rotX);
    var ez=view.camDist*Math.cos(view.rotX)*Math.cos(view.rotY);
    var eye=[ex,ey,ez];
    var f=vNorm([-ex,-ey,-ez]);
    var r=vNorm([Math.cos(view.rotY),0,-Math.sin(view.rotY)]);
    if(!isFinite(r[0])||!isFinite(r[1])||!isFinite(r[2])||vLen(r)<1e-6) r=[1,0,0];
    var u=vCross(r,f);
    if(!isFinite(u[0])||!isFinite(u[1])||!isFinite(u[2])||vLen(u)<1e-6) u=[0,1,0];
    else u=vNorm(u);
    r=vCross(f,u);
    if(!isFinite(r[0])||!isFinite(r[1])||!isFinite(r[2])||vLen(r)<1e-6) r=[1,0,0];
    else r=vNorm(r);
    return {eye:eye,f:f,r:r,u:u};
  }

function projectPoint(world, view, size){
    var viewerP = __projectViaViewer(world);
    if(viewerP) return viewerP;
    world = rotateXYZJS(world, view);
    var basis=getCameraBasisJS(view);
    var eye=basis.eye, f=basis.f, r=basis.r, u=basis.u;
    var q=vSub(world, eye);
    var cx=vDot(q, r), cy=vDot(q, u), cz=vDot(q, f);
    if(cz <= -0.15) return null;
    if(cz < 0.05) cz = 0.05;
    var aspect = (size.w||1)/(size.h||1);
    var fov = 1.2;
    var t = Math.tan(fov*0.5);
    var ndcX = cx/(cz*t*aspect);
    var ndcY = cy/(cz*t);
    if(!isFinite(ndcX)||!isFinite(ndcY)) return null;
    return { x:(ndcX*0.5+0.5)*(size.w||1), y:(-ndcY*0.5+0.5)*(size.h||1), z:cz };
  }

  function projectPointOrtho(world, view, size){
    return projectPoint(world, view, size);
  }

  function projectVectorPoint(world, view, size){
    return projectPoint(world, view, size);
  }

  function drawArrow(ctx, a, b, color, width, glow){
    if(!a||!b) return;
    ctx.save();
    ctx.strokeStyle=color; ctx.lineWidth=width||2; ctx.lineCap='round'; ctx.lineJoin='round';
    if(glow){ ctx.shadowColor=color; ctx.shadowBlur=glow; }
    ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
    var dx=b.x-a.x, dy=b.y-a.y; var L=Math.hypot(dx,dy)||1; dx/=L; dy/=L;
    var ah = 8 + (width||2)*1.3;
    ctx.beginPath();
    ctx.moveTo(b.x, b.y);
    ctx.lineTo(b.x - dx*ah - dy*ah*0.55, b.y - dy*ah + dx*ah*0.55);
    ctx.lineTo(b.x - dx*ah + dy*ah*0.55, b.y - dy*ah - dx*ah*0.55);
    ctx.closePath();
    ctx.fillStyle=color; if(glow){ ctx.shadowColor=color; ctx.shadowBlur=glow; } ctx.fill();
    ctx.restore();
  }

  function drawCloudBlob(ctx, x, y, rx, ry, color, alpha, angle){
    ctx.save();
    ctx.translate(x,y); if(angle) ctx.rotate(angle);
    var g = ctx.createRadialGradient(0,0,Math.min(rx,ry)*0.1, 0,0,Math.max(rx,ry));
    g.addColorStop(0, 'rgba('+color[0]+','+color[1]+','+color[2]+','+(alpha||0.18)+')');
    g.addColorStop(0.55, 'rgba('+color[0]+','+color[1]+','+color[2]+','+((alpha||0.18)*0.55)+')');
    g.addColorStop(1, 'rgba('+color[0]+','+color[1]+','+color[2]+',0)');
    ctx.fillStyle=g;
    ctx.beginPath();
    if(ctx.ellipse) ctx.ellipse(0,0,rx,ry,0,0,Math.PI*2); else { ctx.arc(0,0,Math.max(rx,ry),0,Math.PI*2); }
    ctx.fill();
    ctx.restore();
  }

  function drawTextLabel(ctx, p, text, color){
    if(!p) return;
    ctx.save();
    ctx.font='700 13px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
    var pad=4, w=ctx.measureText(text).width + pad*2;
    ctx.fillStyle='rgba(4,8,14,.70)';
    ctx.strokeStyle='rgba(255,255,255,.08)';
    ctx.lineWidth=1;
    var x=p.x-w/2, y=p.y-10;
    ctx.beginPath(); if(ctx.roundRect){ ctx.roundRect(x,y-10,w,20,10); } else { ctx.rect(x,y-10,w,20); }
    ctx.fill(); ctx.stroke();
    ctx.fillStyle=color||'#fff';
    ctx.textBaseline='middle'; ctx.fillText(text, x+pad, y);
    ctx.restore();
  }

  function drawAngleArc(ctx, c, p1, p2, label){
    if(!c||!p1||!p2) return;
    var a1=Math.atan2(p1.y-c.y,p1.x-c.x), a2=Math.atan2(p2.y-c.y,p2.x-c.x);
    var da = a2-a1; while(da>Math.PI) da-=2*Math.PI; while(da<-Math.PI) da+=2*Math.PI;
    var d1=Math.hypot(p1.x-c.x,p1.y-c.y), d2=Math.hypot(p2.x-c.x,p2.y-c.y);
    var baseR=Math.max(72, Math.min(170, Math.max(d1,d2)+28));
    var labTxt = String(label||'');
    var is180 = /^\s*180/.test(labTxt);

    ctx.save();
    ctx.strokeStyle='rgba(255,255,255,.72)';
    ctx.lineWidth=1.4;
    if(ctx.setLineDash) ctx.setLineDash([8,6]);

    if(is180){
      
      ctx.beginPath();
      ctx.arc(c.x,c.y,baseR,Math.PI*1.02,Math.PI*1.98,false); 
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(c.x,c.y,baseR,0.02*Math.PI,0.98*Math.PI,false); 
      ctx.stroke();
      if(ctx.setLineDash) ctx.setLineDash([]);
      drawTextLabel(ctx,{x:c.x, y:c.y-baseR-16}, labTxt, '#ffffff');
      drawTextLabel(ctx,{x:c.x, y:c.y+baseR+16}, labTxt, '#ffffff');
    }else{
      
      var start=a1, end=a1+da;
      ctx.beginPath();
      ctx.arc(c.x,c.y,baseR,start,end,da<0);
      ctx.stroke();
      
      if(ctx.setLineDash) ctx.setLineDash([4,5]);
      var u1={x:(p1.x-c.x)/(d1||1), y:(p1.y-c.y)/(d1||1)};
      var u2={x:(p2.x-c.x)/(d2||1), y:(p2.y-c.y)/(d2||1)};
      ctx.beginPath();
      ctx.moveTo(c.x+u1.x*(Math.min(d1,baseR-6)), c.y+u1.y*(Math.min(d1,baseR-6)));
      ctx.lineTo(c.x+u1.x*baseR, c.y+u1.y*baseR);
      ctx.moveTo(c.x+u2.x*(Math.min(d2,baseR-6)), c.y+u2.y*(Math.min(d2,baseR-6)));
      ctx.lineTo(c.x+u2.x*baseR, c.y+u2.y*baseR);
      ctx.stroke();
      if(ctx.setLineDash) ctx.setLineDash([]);
      var am = a1 + da/2;
      drawTextLabel(ctx,{x:c.x+Math.cos(am)*(baseR+16), y:c.y+Math.sin(am)*(baseR+16)}, labTxt, '#ffffff');
    }
    ctx.restore();
  }


function __anglePanelBase(ctx, x, y, w, h, title){
  ctx.save();
  ctx.fillStyle='rgba(7,11,18,.74)';
  ctx.strokeStyle='rgba(255,255,255,.12)';
  ctx.lineWidth=1;
  ctx.beginPath();
  if(ctx.roundRect) ctx.roundRect(x,y,w,h,14); else ctx.rect(x,y,w,h);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle='rgba(236,244,255,.95)';
  ctx.font='700 13px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
  ctx.fillText(title||'', x+12, y+18);
  ctx.restore();
}

function __angleDrawAtom(ctx, x, y, r, fill, stroke){
  ctx.save();
  var g=ctx.createRadialGradient(x-r*0.35,y-r*0.35,1, x,y,r*1.05);
  g.addColorStop(0,'rgba(255,255,255,.75)');
  g.addColorStop(0.25, fill);
  g.addColorStop(1,'rgba(0,0,0,.18)');
  ctx.fillStyle=g;
  ctx.strokeStyle=stroke||'rgba(255,255,255,.18)';
  ctx.lineWidth=1;
  ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.restore();
}

function __angleDrawBond(ctx, a, b){
  ctx.save();
  ctx.strokeStyle='rgba(168,255,211,.95)';
  ctx.lineWidth=4;
  ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
  ctx.restore();
}

function __angleClampLabelPos(ctx, x, y, txt){
  var b = ctx && ctx.__angleBounds;
  if(!b) return {x:x,y:y};
  var pad = 8;
  var mw = (ctx.measureText ? ctx.measureText(String(txt||'')).width : 28);
  return {
    x: Math.max(b.x+pad+mw*0.5, Math.min(b.x+b.w-pad-mw*0.5, x)),
    y: Math.max(b.y+16, Math.min(b.y+b.h-8, y))
  };
}

function __angleArcLabel(ctx, c, p1, p2, label, rOverride){
  if(!c||!p1||!p2) return;
  var a1=Math.atan2(p1.y-c.y,p1.x-c.x), a2=Math.atan2(p2.y-c.y,p2.x-c.x);
  var da = a2-a1; while(da>Math.PI) da-=2*Math.PI; while(da<-Math.PI) da+=2*Math.PI;
  var rr = rOverride || Math.max(26, Math.min(44, Math.min(Math.hypot(p1.x-c.x,p1.y-c.y), Math.hypot(p2.x-c.x,p2.y-c.y))*0.60));
  ctx.save();
  ctx.strokeStyle='rgba(255,88,88,.95)';
  ctx.lineWidth=2;
  ctx.beginPath();
  ctx.arc(c.x,c.y,rr,a1,a1+da,da<0);
  ctx.stroke();
  var am=a1+da*0.5;
  ctx.fillStyle='rgba(255,255,255,.98)';
  ctx.font='700 12px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
  var tx=c.x+Math.cos(am)*(rr+15), ty=c.y+Math.sin(am)*(rr+4);
  var cl=__angleClampLabelPos(ctx, tx, ty, label);
  ctx.fillText(label, cl.x-ctx.measureText(label).width*0.5, cl.y);
  ctx.restore();
}

function __angleArc180(ctx, c, left, right, label){
  var rr = Math.max(34, Math.abs(right.x-left.x)*0.30);
  ctx.save();
  ctx.strokeStyle='rgba(255,88,88,.95)';
  ctx.lineWidth=2;
  ctx.beginPath();
  ctx.arc(c.x,c.y,rr,Math.PI,0,false);
  ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.98)';
  ctx.font='700 12px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
  var pTop=__angleClampLabelPos(ctx, c.x, c.y-rr-6, label);
  ctx.fillText(label, pTop.x-ctx.measureText(label).width*0.5, pTop.y);
  ctx.restore();
}


function drawAngleSchematic(ctx, data, can){
  if(!ctx||!data||!can) return;
  var DEG = Math.PI/180;
  var w=Math.min(408, Math.max(292, can.w*0.36));
  var h=(can.h < 500)?170:206;
  var x=can.w - w - 16;
  var y=(can.h < 500)?10:16;
  ctx.__angleBounds = {x:x, y:y, w:w, h:h};
  __anglePanelBase(ctx, x, y, w, h, '');

  var cx=x+w*0.52, cy=y+h*0.55;
  var center={x:cx,y:cy}, centerR=12, ligR=9;
  var exGeom = (data.ex && data.ex.geom) ? String(data.ex.geom) : '';
  var arr=(data.geom && data.geom.arr) ? String(data.geom.arr) : '';
  var angleLbl = (data.geom && data.geom.angle) ? String(data.geom.angle) : 'θ';
  function P(dx,dy){ return {x:cx+dx, y:cy+dy}; }

  function footer(text1, text2){
    var lines = [];
    [text1,text2].forEach(function(t){ if(t) lines.push(String(t)); });
    if(!lines.length) return;
    ctx.save();
    ctx.fillStyle='rgba(223,234,255,.90)';
    ctx.font='600 10.5px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
    var maxW = w-22;
    var out=[];
    lines.forEach(function(line){
      var words=String(line).split(/\s+/), cur='';
      words.forEach(function(word){
        var test=cur ? (cur+' '+word) : word;
        if(ctx.measureText(test).width > maxW && cur){ out.push(cur); cur=word; }
        else cur=test;
      });
      if(cur) out.push(cur);
    });
    var lineH=12;
    var maxLines = Math.max(2, Math.floor((h-24)/lineH));
    if(out.length > maxLines){
      out = out.slice(0,maxLines);
      var last = out[out.length-1];
      while(ctx.measureText(last+'…').width > maxW && last.length>4) last = last.slice(0,-1);
      out[out.length-1] = last+'…';
    }
    var startY = y+h-8 - (out.length-1)*lineH;
    out.forEach(function(line, i){
      ctx.fillText(line, x+12, startY + i*lineH);
    });
    ctx.restore();
  }

  function drawCommon(ligs, opts){
    opts=opts||{};
    ligs.forEach(function(p){ __angleDrawBond(ctx, center, p); });
    __angleDrawAtom(ctx, center.x, center.y, centerR, 'rgba(60,92,255,.95)');
    ligs.forEach(function(p){ __angleDrawAtom(ctx, p.x, p.y, ligR, 'rgba(255,90,164,.95)'); });
    if(opts.lp){
      opts.lp.forEach(function(p){
        ctx.save(); ctx.globalAlpha = 0.70;
        __angleDrawAtom(ctx, p.x, p.y, 7.4, 'rgba(88,112,255,.90)');
        ctx.restore();
      });
    }
    return ligs;
  }

  if(exGeom==='bent_tet'){
    
    var Rb=70;
    var ha=52.25*DEG; 
    var dx=Math.sin(ha)*Rb, dy=Math.cos(ha)*Rb;
    var L=P(-dx,dy), R=P(dx,dy);
    var LP1=P(-16,-50), LP2=P(16,-50);
    drawCommon([L,R], {lp:[LP1,LP2]});
    __angleArcLabel(ctx, center, L, R, '≈104,5°', 34);
    footer('AX2E2 (angular): 2 pares livres comprimem o ângulo', 'Ângulo real ≈104,5° em relação ao tetraédrico ideal (109,5°)');
  } else if(exGeom==='bent_tp'){
    
    var Rb2=72;
    var ha2=60*DEG; 
    var dx2=Math.sin(ha2)*Rb2, dy2=Math.cos(ha2)*Rb2;
    var L2=P(-dx2,dy2), R2=P(dx2,dy2), LP=P(0,-54);
    drawCommon([L2,R2], {lp:[LP]});
    __angleArcLabel(ctx, center, L2, R2, '≈120°', 34);
    footer('AX2E (angular, base trigonal planar): 1 par livre comprime', 'Ângulo real ≈120°');
  } else if(exGeom==='trigonal_pyramidal'){
    
    var Rb3=70;
    var ha3=53.5*DEG; 
    var dx3=Math.sin(ha3)*Rb3, dy3=Math.cos(ha3)*Rb3;
    var BL=P(-dx3,dy3), BR=P(dx3,dy3), B=P(0, Rb3);
    drawCommon([BL,BR,B], {lp:[P(0,-56)]});
    __angleArcLabel(ctx, center, BL, BR, '≈107°', 33);
    footer('AX3E (piramidal trigonal): 1 par livre empurra as ligações', 'Ângulo real ≈107° por repulsão do par livre');
  } else if(exGeom==='see_saw'){
    var AXu=P(0,-60), AXd=P(0,60), EqL=P(-52,18), EqR=P(52,18);
    drawCommon([AXu,AXd,EqL,EqR], {lp:[P(-52,-12)]});
    __angleArcLabel(ctx, center, AXu, EqR, '≈90°', 22);
    __angleArcLabel(ctx, center, EqL, EqR, '≈120°', 30);
    footer('AX4E (gangorra): par livre equatorial aumenta repulsão', 'Ax-Eq ≈90°; Eq-Eq ≈120°; Ax-Ax ≈180°');
  } else if(exGeom==='t_shaped'){
    var AX1=P(0,-58), AX2=P(0,58), Eq=P(58,0);
    drawCommon([AX1,AX2,Eq], {lp:[P(-42,-24),P(-42,24)]});
    __angleArcLabel(ctx, center, AX1, Eq, '≈90°', 22);
    __angleArc180(ctx, center, AX1, AX2, '≈180°');
    footer('AX3E2 (em T): dois pares livres equatoriais comprimem', 'Ax-Eq ≈90° e Ax-Ax ≈180°');
  } else if(exGeom==='linear_tbp'){
    var A=P(0,-60), B=P(0,60);
    drawCommon([A,B], {lp:[P(44,0),P(-22,38),P(-22,-38)]});
    __angleArc180(ctx, center, A, B, '≈180°');
    footer('AX2E3 (linear, base TBP): pares livres ficam nas posições equatoriais', 'Ligações ficam opostas: 180°');
  } else if(exGeom==='square_pyramidal'){
    var Top=P(0,-64), U=P(0,-38), D=P(0,38), L=P(-44,0), R=P(44,0);
    drawCommon([Top,U,R,D,L], {lp:[P(0,58)]});
    __angleArcLabel(ctx, center, Top, R, '≈90°', 22);
    __angleArcLabel(ctx, center, U, R, '≈90°', 19);
    __angleArc180(ctx, center, L, R, '≈180°');
    footer('AX5E (piramidal quadrada): 1 par livre em geometria octaédrica', 'Ax-Basal ≈90°; na base: ≈90° e ≈180°');
  } else if(exGeom==='square_planar'){
    var U2=P(0,-44), D2=P(0,44), L3=P(-44,0), R3=P(44,0);
    drawCommon([U2,R3,D2,L3], {lp:[P(0,-56),P(0,56)]});
    __angleArcLabel(ctx, center, U2, R3, '≈90°', 20);
    __angleArc180(ctx, center, L3, R3, '≈180°');
    footer('AX4E2 (quadrada planar): pares livres trans fora do plano', 'Ângulos no plano permanecem ≈90° e ≈180°');
  } else if(arr==='AX2' || exGeom==='linear'){
    var L4=P(-62,0), R4=P(62,0);
    drawCommon([L4,R4]);
    __angleArc180(ctx, center, L4, R4, '180°');
    footer('AX2 (linear)', 'Duas direções opostas maximizam afastamento');
  } else if(arr==='AX3' || exGeom==='trigonal_planar'){
    var T2=P(0,-56), BL2=P(-52,30), BR2=P(52,30);
    drawCommon([T2,BL2,BR2]);
    __angleArcLabel(ctx, center, BL2, BR2, '120°', 28);
    footer('AX3 (trigonal planar)', 'Três direções no mesmo plano -> 120°');
  } else if(arr==='AX4' || exGeom==='tetrahedral' || exGeom==='tetra'){
    var T3=P(0,-58), L5=P(-54,12), R5=P(54,12), F=P(0,54);
    drawCommon([T3,L5,R5,F]);
    __angleArcLabel(ctx, center, T3, R5, '109,5°', 31);
    footer('AX4 (tetraédrica): ângulo ideal em 3D', 'No esquema 2D, a projeção é só didática');
  } else if(arr==='AX5' || exGeom==='trigonal_bipyramidal' || exGeom==='tbp'){
    
    
    var AxU=P(0,-64), EqL=P(-66,0), EqR=P(66,0), EqBL=P(-38,36), EqBR=P(38,36);

    function drawBondC(a, b){
      ctx.save();
      ctx.strokeStyle='rgba(117,255,235,.96)';
      ctx.lineWidth=4;
      ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
      ctx.restore();
    }

    [AxU,EqL,EqR,EqBL,EqBR].forEach(function(p){ drawBondC(center, p); });
    __angleDrawAtom(ctx, center.x, center.y, centerR, 'rgba(60,92,255,.95)');
    [AxU,EqL,EqR,EqBL,EqBR].forEach(function(p){ __angleDrawAtom(ctx, p.x, p.y, ligR, 'rgba(255,92,158,.96)'); });

    __angleArc180(ctx, center, EqL, EqR, '180°');
    __angleArcLabel(ctx, center, AxU, EqR, '90°', 22);
    __angleArcLabel(ctx, center, EqBL, EqBR, '120°', 29);

    footer('AX5 (bipirâmide trigonal): Eq-Eq 120° | Ax-Eq 90° | Ax-Ax 180°', 'Esquema simplificado para destacar os 3 tipos de ângulo sem poluir o painel.');
  } else if(arr==='AX6' || exGeom==='octahedral' || exGeom==='oct'){
    var U3=P(0,-66), D3=P(0,66), L6=P(-62,0), R6=P(62,0), F6=P(-30,-24), B6=P(30,24);
    drawCommon([U3,D3,L6,R6,F6,B6]);
    __angleArcLabel(ctx, center, U3, R6, '90°', 22);
    __angleArc180(ctx, center, L6, R6, '180°');
    footer('AX6 (octaédrica)', 'Adjacentes 90°; opostos 180°');
  } else {
    var ligs = [];
    (data.atoms||[]).slice(1,7).forEach(function(a){
      var p=a.pos||[0,0,0];
      ligs.push({x:cx+p[0]*52, y:cy-p[1]*52});
    });
    if(!ligs.length) return;
    drawCommon(ligs);
    if(ligs.length>=2){
      if((angleLbl||'').indexOf('180')>=0) __angleArc180(ctx, center, ligs[0], ligs[1], angleLbl);
      else __angleArcLabel(ctx, center, ligs[0], ligs[1], angleLbl, 24);
    }
    footer((arr?arr+' ':'')+'(esquema automático)', angleLbl);
  }

  ctx.save();
  ctx.fillStyle='rgba(222,235,255,.90)';
  ctx.font='600 10.5px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
  var txt = ((data.geom && data.geom.arr) ? data.geom.arr+' | ' : '') + ((data.geom && data.geom.angle) ? data.geom.angle : '');
  var maxW = w-24;
  if(ctx.measureText(txt).width > maxW){
    while(txt.length>8 && ctx.measureText(txt+'…').width > maxW) txt = txt.slice(0,-1);
    txt += '…';
  }
  ctx.fillText(txt, x+12, y+20);
  ctx.restore();
}

  function moleculeVisualData(){
    var ex = exampleCatalog[activeExampleKey] || exampleCatalog.H2O;
    
    
    var geomMap = {
      linear:'linear',
      trigonal_planar:'trigonal_planar',
      tetrahedral:'tetra',
      trigonal_bipyramidal:'tbp',
      octahedral:'oct',
      bent_tp:'bent_tp',
      trigonal_pyramidal:'trigonal_pyramidal',
      bent_tet:'bent_tet',
      see_saw:'see_saw',
      t_shaped:'t_shaped',
      linear_tbp:'linear_tbp',
      square_pyramidal:'square_pyramidal',
      square_planar:'square_planar'
    };
    try{
      var uiGeom = apiRef && apiRef.ui && apiRef.ui.geom ? apiRef.ui.geom.value : '';
      if(uiGeom && geomMap[uiGeom]){
        ex = Object.assign({}, ex, { geom: geomMap[uiGeom] });
      }
    }catch(_e){}
    return getWorldDataForExample(ex);
  }

  function refreshMiniCalc(){  }

  
  
  function __elementRadiusWorld(label, role){
    
    var rCenter = (typeof size!=='undefined' && size) ? (parseFloat(size.value)||1.0) : 1.0;
    var rLig = (typeof ligandRadius!=='undefined' && ligandRadius) ? (parseFloat(ligandRadius.value)||0.44) : 0.44;
    var sym = String(label||'').trim();

    if(role === 'center') return rCenter;
    if(/^H$/i.test(sym)) return rLig * 0.82;
    if(/^(F|O|Cl|Br|I|N|S|P)$/i.test(sym)) return rLig * 1.06;
    return rLig;
  }

function __collectEnvelopeItems(data, view, can){
    try{
      var p0 = projectPoint([0,0,0], view, can);
      var pxU = (p0 && isFinite(p0.scale)) ? p0.scale : (Math.min(can.w,can.h)*0.22);
      if(!isFinite(pxU) || pxU<1) pxU = Math.min(can.w,can.h)*0.22;

      var items = [];
      (data.atoms||[]).forEach(function(a, idx){
        var pr = __projectWorldRadius(a.pos, __elementRadiusWorld(a.label, idx===0 ? 'center' : 'lig'), view, can);
        if(!pr) return;
        var rr = Math.max(14, Math.max(pr.rx, pr.ry) * 1.18);
        items.push({x:pr.x, y:pr.y, r:rr, kind:'atom', idx:idx, label:a.label});
      });

      (data.lps||[]).forEach(function(lp, idx){
        var p = projectPoint(lp.pos, view, can);
        if(!p) return;
        var lpWorldR = Math.max(0.18, ((lp && lp.size) || 0.28) * 0.82);
        var rr = Math.max(18, lpWorldR * pxU * 0.95);
        items.push({x:p.x, y:p.y, r:rr, kind:'lp', idx:idx, label:'LP'});
      });

      if(!items.length && p0) items.push({x:p0.x, y:p0.y, r:Math.max(40, pxU*0.9), kind:'fallback'});
      return {items:items, pxU:pxU};
    }catch(e){
      return {items:[], pxU:(Math.min(can.w,can.h)*0.22)};
    }
  }

function __envelopePathPoints(items, pad){
    if(!items || !items.length) return null;
    var cx=0, cy=0, wsum=0;
    for(var i=0;i<items.length;i++){
      var it=items[i], w=Math.max(10, it.r);
      cx += it.x*w; cy += it.y*w; wsum += w;
    }
    cx/=wsum||1; cy/=wsum||1;
    var N = 56;
    var rs = new Array(N);
    for(var k=0;k<N;k++){
      var th = (k/N)*Math.PI*2, ux=Math.cos(th), uy=Math.sin(th);
      var best = 12;
      for(var j=0;j<items.length;j++){
        var it2=items[j];
        var dx=it2.x-cx, dy=it2.y-cy;
        var proj = dx*ux + dy*uy + it2.r;
        if(proj>best) best=proj;
      }
      rs[k] = best + (pad||10);
    }
    
    var rs2 = rs.slice();
    for(var t=0;t<2;t++){
      for(var n=0;n<N;n++){
        var a=rs[(n-1+N)%N], b=rs[n], c=rs[(n+1)%N];
        rs2[n] = a*0.22 + b*0.56 + c*0.22;
      }
      rs = rs2.slice();
    }
    var pts=[];
    for(var m=0;m<N;m++){
      var th2=(m/N)*Math.PI*2;
      pts.push({x:cx+Math.cos(th2)*rs[m], y:cy+Math.sin(th2)*rs[m]});
    }
    return {cx:cx, cy:cy, pts:pts, radii:rs};
  }

  function __expandEnvelopePath(env, extra){
    if(!env || !env.pts || !env.pts.length) return env;
    var e = Math.max(0, extra||0);
    if(!e) return env;
    var pts = env.pts.map(function(p){
      var dx=p.x-env.cx, dy=p.y-env.cy;
      var L=Math.hypot(dx,dy)||1;
      return {x:p.x + (dx/L)*e, y:p.y + (dy/L)*e};
    });
    return {cx:env.cx, cy:env.cy, pts:pts};
  }

  

function __getLocalOverlayBasis(){
  return {
    forward:[0,0,1],
    right:[1,0,0],
    up:[0,1,0]
  };
}

function __safeProjectRadiusLocal(local, radiusLocal, axisA, axisB, view, size){
  var p = projectPoint(local, view, size);
  if(!p) return null;
  var pxScale = isFinite(p.scale) ? Math.abs(p.scale) : 0;
  if(pxScale > 0){
    var rPx = Math.max(1, radiusLocal * pxScale);
    return {x:p.x, y:p.y, z:p.z, rx:rPx, ry:rPx};
  }
  var a = vNorm(axisA || [1,0,0]);
  var b = vNorm(axisB || [0,1,0]);
  if(!isFinite(a[0])||!isFinite(a[1])||!isFinite(a[2])||vLen(a)<1e-6) a=[1,0,0];
  if(!isFinite(b[0])||!isFinite(b[1])||!isFinite(b[2])||vLen(b)<1e-6) b=[0,1,0];
  var offA = projectPoint(vAdd(local, vMul(a, radiusLocal)), view, size);
  var offB = projectPoint(vAdd(local, vMul(b, radiusLocal)), view, size);
  var rx = offA ? Math.hypot(offA.x-p.x, offA.y-p.y) : 0;
  var ry = offB ? Math.hypot(offB.x-p.x, offB.y-p.y) : 0;
  if(!isFinite(rx) || rx < 1) rx = 1;
  if(!isFinite(ry) || ry < 1) ry = rx;
  return {x:p.x, y:p.y, z:p.z, rx:rx, ry:ry};
}

function __projectWorldRadius(world, radiusWorld, view, size, basis){
  basis = basis || __getLocalOverlayBasis();
  return __safeProjectRadiusLocal(world, radiusWorld, basis.right, basis.up, view, size);
}

function __buildVolumetricShell(data, view, can){
  var basis = __getLocalOverlayBasis();
  var out = [];
  function pushBlob(world, radiusWorld, color, alpha, angle, meta){
    var pr = __projectWorldRadius(world, radiusWorld, view, can, basis);
    if(!pr) return;
    out.push({
      x:pr.x, y:pr.y, z:pr.z, rx:pr.rx, ry:pr.ry, angle:angle||0,
      color:color||[170,246,255], alpha:(alpha==null?0.08:alpha),
      meta:meta||null, world:world
    });
  }
  function pushEllipsoid(world, axisMajor, majorR, axisMinor, minorR, color, alpha, meta){
    var p = projectPoint(world, view, can);
    if(!p) return;
    var a = vNorm(axisMajor||basis.right);
    var b = vNorm(axisMinor||basis.up);
    var pxScale = isFinite(p.scale) ? Math.abs(p.scale) : 0;
    var rx = pxScale > 0 ? Math.max(1, majorR * pxScale) : 0;
    var ry = pxScale > 0 ? Math.max(1, minorR * pxScale) : 0;
    var pA = projectPoint(vAdd(world, vMul(a, majorR)), view, can);
    if(!(rx > 0) || !(ry > 0)){
      var pB = projectPoint(vAdd(world, vMul(b, minorR)), view, can);
      rx = pA ? Math.hypot(pA.x-p.x, pA.y-p.y) : 0;
      ry = pB ? Math.hypot(pB.x-p.x, pB.y-p.y) : 0;
      if(!isFinite(rx) || rx < 1) rx = 1;
      if(!isFinite(ry) || ry < 1) ry = Math.max(1, rx*0.66);
    }
    var ang = pA ? Math.atan2(pA.y-p.y, pA.x-p.x) : 0;
    out.push({
      x:p.x, y:p.y, z:p.z, rx:rx, ry:ry, angle:ang,
      color:color||[170,246,255], alpha:(alpha==null?0.08:alpha),
      meta:meta||null, world:world
    });
  }

  (data.atoms||[]).forEach(function(a, idx){
    var rw = __elementRadiusWorld(a.label, idx===0 ? 'center' : 'lig');
    var shellR = rw * (idx===0 ? 1.08 : 0.96);
    var color = idx===0 ? [170,246,255] : [185,248,255];
    pushBlob(a.pos, shellR, color, idx===0 ? 0.10 : 0.082, 0, {kind:'atomCore', idx:idx, label:a.label});

    var ringCount = idx===0 ? 6 : 4;
    var ringScale = idx===0 ? 0.82 : 0.78;
    for(var i=0;i<ringCount;i++){
      var ang = (Math.PI*2*i)/ringCount;
      var radial = vAdd(vMul(basis.right, Math.cos(ang)*shellR*ringScale), vMul(basis.up, Math.sin(ang)*shellR*0.72));
      pushBlob(vAdd(a.pos, radial), shellR*0.54, color, idx===0 ? 0.048 : 0.042, ang, {kind:'atomShell', idx:idx, label:a.label});
    }
    pushBlob(vAdd(a.pos, vMul(basis.forward, shellR*0.24)), shellR*0.54, color, idx===0 ? 0.040 : 0.034, 0, {kind:'capFront', idx:idx, label:a.label});
    pushBlob(vAdd(a.pos, vMul(basis.forward, -shellR*0.24)), shellR*0.58, color, idx===0 ? 0.030 : 0.026, 0, {kind:'capBack', idx:idx, label:a.label});
  });

  (data.bondDipoles||[]).forEach(function(d){
    var negDir = vNorm(d.vec||[1,0,0]);
    var bondLen = (data.bondLen||1.55);
    for(var t=0.18; t<=0.84; t+=0.18){
      var pos = vAdd(d.anchor||[0,0,0], vMul(negDir, bondLen*t));
      pushBlob(pos, bondLen*0.12, [185,248,255], 0.024, 0, {kind:'bond'});
    }
  });

  (data.lps||[]).forEach(function(lp, idx){
    var lpDir = vNorm(lp.dir||[1,0,0]);
    var refAxis = Math.abs(vDot(lpDir, basis.up)) < 0.92 ? basis.up : basis.right;
    var side = vNorm(vCross(lpDir, refAxis));
    if(!isFinite(side[0])||!isFinite(side[1])||!isFinite(side[2])||Math.hypot(side[0],side[1],side[2])<0.2){
      side = basis.right;
    }
    var up2 = vNorm(vCross(side, lpDir));
    if(!isFinite(up2[0])||!isFinite(up2[1])||!isFinite(up2[2])||Math.hypot(up2[0],up2[1],up2[2])<0.2){
      up2 = basis.up;
    }
    var centerLabel = (data.atoms&&data.atoms[0]&&data.atoms[0].label) ? data.atoms[0].label : 'X';
    var centerR = __elementRadiusWorld(centerLabel, 'center');
    var majorR = ((lp&&lp.size) || (centerR*0.50));
    var radialR = ((lp&&lp.radial) || (majorR*0.68));
    var lpPos = lp.pos || vMul(lpDir, data.bondLen || 1.55);
    pushEllipsoid(lpPos, side, majorR*0.88, lpDir, radialR*0.84, [120,205,255], 0.098, {kind:'lpCore', idx:idx});
    pushEllipsoid(vAdd(lpPos, vMul(lpDir, radialR*0.14)), side, majorR*0.74, lpDir, radialR*0.68, [120,205,255], 0.078, {kind:'lpHead', idx:idx});
    pushEllipsoid(vAdd(lpPos, vMul(up2, majorR*0.08)), side, majorR*0.60, lpDir, radialR*0.50, [120,205,255], 0.050, {kind:'lpWing', idx:idx});
  });

  out.sort(function(a,b){ return b.z - a.z; });
  return {basis:basis, blobs:out};
}

function __blobEnvelopeFromVolumetric(blobs){
  if(!blobs || !blobs.length) return null;
  var items=[];
  for(var i=0;i<blobs.length;i++){
    var b=blobs[i];
    items.push({x:b.x, y:b.y, r:Math.max(b.rx, b.ry)});
  }
  return __envelopePathPoints(items, 18);
}
function __traceSmoothClosedPath(ctx, pts){
    if(!pts || pts.length<2) return;
    var n=pts.length;
    ctx.beginPath();
    for(var i=0;i<n;i++){
      var p0=pts[(i-1+n)%n], p1=pts[i], p2=pts[(i+1)%n];
      var mx=(p1.x+p2.x)*0.5, my=(p1.y+p2.y)*0.5;
      if(i===0){
        var mPrevX=(p0.x+p1.x)*0.5, mPrevY=(p0.y+p1.y)*0.5;
        ctx.moveTo(mPrevX,mPrevY);
      }
      ctx.quadraticCurveTo(p1.x,p1.y,mx,my);
    }
    ctx.closePath();
  }

  

function __envBounds(env){
  var minX=Infinity, minY=Infinity, maxX=-Infinity, maxY=-Infinity;
  (env && env.pts || []).forEach(function(p){
    minX = Math.min(minX, p.x); minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y);
  });
  if(!isFinite(minX)) return null;
  return {minX:minX, minY:minY, maxX:maxX, maxY:maxY};
}

function __moleculeMapEnvelope(data, view, can, extra){
  var base = __collectEnvelopeItems(data, view, can);
  var env = __envelopePathPoints((base && base.items) ? base.items : [], Math.max(10, (base && base.pxU ? base.pxU*0.05 : 12)));
  if(!env) return null;
  return __expandEnvelopePath(env, extra == null ? 8 : extra);
}

function __espPaletteRGBA(score, alphaMul, soft){
  var s = clamp(score, -1.18, 1.18);
  function mix(c1,c2,t){
    return [
      Math.round(c1[0] + (c2[0]-c1[0])*t),
      Math.round(c1[1] + (c2[1]-c1[1])*t),
      Math.round(c1[2] + (c2[2]-c1[2])*t)
    ];
  }
  var blue = [42, 92, 255], cyan = [79, 206, 255], green = [102, 224, 146], yellow = [243, 221, 96], orange = [255, 145, 72], red = [236, 72, 88];
  var rgb;
  if(s >= 0){
    var t = clamp(s/1.18, 0, 1);
    if(t < 0.18) rgb = mix(green, yellow, t/0.18);
    else if(t < 0.56) rgb = mix(yellow, orange, (t-0.18)/0.38);
    else rgb = mix(orange, red, (t-0.56)/0.44);
  } else {
    var t2 = clamp((-s)/1.18, 0, 1);
    if(t2 < 0.22) rgb = mix(green, cyan, t2/0.22);
    else rgb = mix(cyan, blue, (t2-0.22)/0.78);
  }
  if(soft){ rgb = mix(rgb, [235,239,247], 0.14); }
  return [rgb[0], rgb[1], rgb[2], clamp(alphaMul == null ? 1 : alphaMul, 0, 1)];
}

function drawDensitySurfaceMap(ctx, data, view, can){
    var shell = __buildVolumetricShell(data, view, can);
    if(!shell || !shell.blobs || !shell.blobs.length) return;
    var isLightBG = !!(document.body && document.body.classList && document.body.classList.contains('lightBg'));

    function chiOf(lbl){
      var s = String(lbl||'X').replace(/[^A-Za-z]/g,'');
      var t = {H:2.20, C:2.55, N:3.04, O:3.44, F:3.98, P:2.19, S:2.58, Cl:3.16, Br:2.96, I:2.66, B:2.04, Be:1.57, Xe:2.60};
      return (t[s] != null) ? t[s] : 2.50;
    }
    function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
    function positiveCompression(score){
      var s = clamp(score, -1.35, 1.35);
      if(s <= 0.08) return 1.0;
      return 1.0 - 0.26 * clamp((s-0.08)/1.27, 0, 1);
    }

    var atoms = (data.atoms||[]);
    var centerLabel = atoms[0] ? atoms[0].label : 'X';
    var centerChi = chiOf(centerLabel);
    var ligAtoms = atoms.slice(1);
    var ligChis = ligAtoms.map(function(a){ return chiOf(a.label); });
    var meanLigChi = ligChis.length ? (ligChis.reduce(function(s,v){return s+v;},0)/ligChis.length) : centerChi;
    var allLigSame = ligAtoms.length>0 && ligAtoms.every(function(a){ return String(a.label||'') === String(ligAtoms[0].label||''); });
    var isCO2 = !!(data.ex && data.ex.key==='CO2');

    function atomScore(idx){
      if(!atoms[idx]) return 0;
      var lbl = atoms[idx].label;
      var chi = chiOf(lbl);
      var sc;
      if(idx===0){
        sc = (centerChi - meanLigChi) * 0.95;
        if((data.lps||[]).length && centerChi > meanLigChi) sc += 0.18 * Math.min(2, (data.lps||[]).length);
      } else {
        sc = (chi - centerChi) * 0.95;
      }
      if(allLigSame && idx>0) sc = ((ligChis[0]||centerChi) - centerChi) * 0.95;
      if(isCO2) sc = (idx===0 ? -0.95 : 1.05);
      return clamp(sc, -1.35, 1.35);
    }

    var comps = [];
    atoms.forEach(function(a, idx){
      comps.push({pos:a.pos, r:(__elementRadiusWorld(a.label, idx===0 ? 'center' : 'lig') * (idx===0 ? 1.16 : 1.04)), s:atomScore(idx), w:1.25});
    });
    ligAtoms.forEach(function(a, li){
      var cSc = atomScore(0), lSc = atomScore(li+1);
      var p0 = [0,0,0], p1 = a.pos;
      for(var k=1;k<7;k++){
        var t = k/7;
        comps.push({
          pos:[p0[0]*(1-t)+p1[0]*t, p0[1]*(1-t)+p1[1]*t, p0[2]*(1-t)+p1[2]*t],
          r:Math.max(0.10, (data.bondLen||1.55)*0.12),
          s:cSc*(1-t)+lSc*t,
          w:0.72
        });
      }
    });
    (data.lps||[]).forEach(function(lp){
      comps.push({pos:lp.pos, r:0.28, s:Math.min(-0.95, atomScore(0)-0.50), w:1.10});
      comps.push({pos:vAdd(lp.pos, vMul(vNorm(lp.dir||[1,0,0]), 0.12)), r:0.22, s:Math.min(-1.05, atomScore(0)-0.62), w:0.88});
    });

    function fieldAtWorld(world){
      var num=0, den=0;
      for(var i=0;i<comps.length;i++){
        var c=comps[i];
        var dx=world[0]-c.pos[0], dy=world[1]-c.pos[1], dz=world[2]-c.pos[2];
        var rr=Math.max(0.08,c.r);
        var q=(dx*dx+dy*dy+dz*dz)/(rr*rr);
        if(q>7.5) continue;
        var wt = c.w * Math.exp(-q*1.22);
        num += c.s * wt;
        den += wt;
      }
      if(den < 1e-6) return 0;
      return clamp((num/den) * clamp(0.68 + 0.32*Math.tanh(den*0.70), 0.68, 1.0), -1.35, 1.35);
    }

    var envItems=[];
    var bbMinX=Infinity, bbMinY=Infinity, bbMaxX=-Infinity, bbMaxY=-Infinity;
    shell.blobs.forEach(function(b){
      var sc = fieldAtWorld(b.world);
      var shrink = positiveCompression(sc);
      var rx=b.rx*shrink, ry=b.ry*shrink;
      envItems.push({x:b.x, y:b.y, r:Math.max(rx, ry)});
      bbMinX=Math.min(bbMinX, b.x-rx*1.18); bbMinY=Math.min(bbMinY, b.y-ry*1.18);
      bbMaxX=Math.max(bbMaxX, b.x+rx*1.18); bbMaxY=Math.max(bbMaxY, b.y+ry*1.18);
    });
    var env = __moleculeMapEnvelope(data, view, can, 6) || __envelopePathPoints(envItems, 12);
    if(!env) return;
    var envBounds = __envBounds(env);
    if(!envBounds) return;
    var cx=env.cx, cy=env.cy;
    bbMinX = envBounds.minX; bbMinY = envBounds.minY; bbMaxX = envBounds.maxX; bbMaxY = envBounds.maxY;
    bbMinX = envBounds.minX; bbMinY = envBounds.minY; bbMaxX = envBounds.maxX; bbMaxY = envBounds.maxY;
    var span = Math.max(bbMaxX-bbMinX, bbMaxY-bbMinY);

    ctx.save();
    __traceSmoothClosedPath(ctx, env.pts);
    ctx.clip();

    var rg = ctx.createRadialGradient(cx-span*0.08, cy-span*0.10, 8, cx, cy, span*0.72);
    if(isLightBG){
      rg.addColorStop(0.00,'rgba(150,158,168,0.15)');
      rg.addColorStop(0.55,'rgba(156,164,174,0.11)');
      rg.addColorStop(1.00,'rgba(164,172,182,0.05)');
    }else{
      rg.addColorStop(0.00,'rgba(165,244,255,0.22)');
      rg.addColorStop(0.48,'rgba(108,206,255,0.16)');
      rg.addColorStop(1.00,'rgba(72,165,255,0.06)');
    }
    ctx.fillStyle = rg;
    ctx.fillRect(bbMinX-32, bbMinY-32, (bbMaxX-bbMinX)+64, (bbMaxY-bbMinY)+64);

    shell.blobs.forEach(function(b, idx){
      var alpha = b.alpha;
      if(b.meta && b.meta.kind==='capBack') alpha *= 0.78;
      if(b.meta && b.meta.kind==='lpCore') alpha *= 1.08;
      var sc = fieldAtWorld(b.world);
      var shrink = positiveCompression(sc);
      var tint = __espPaletteRGBA(sc, isLightBG ? alpha*0.54 : alpha*0.92, true);
      drawCloudBlob(ctx, b.x, b.y, b.rx*0.96*shrink, b.ry*0.88*shrink, [tint[0], tint[1], tint[2]], tint[3], b.angle||0);
      if(idx % 4 === 0){
        drawCloudBlob(ctx, b.x-b.rx*0.10*shrink, b.y-b.ry*0.15*shrink, b.rx*0.28*shrink, b.ry*0.22*shrink, [246,255,255], alpha*0.18, b.angle||0);
      }
    });

    ctx.fillStyle = isLightBG ? 'rgba(255,255,255,0.06)' : 'rgba(245,250,255,0.04)';
    __traceSmoothClosedPath(ctx, env.pts);
    ctx.fill();

    var hl = ctx.createRadialGradient(cx-span*0.20, cy-span*0.24, 2, cx-span*0.12, cy-span*0.14, span*0.62);
    hl.addColorStop(0.00,'rgba(255,255,255,0.20)');
    hl.addColorStop(0.22,'rgba(255,255,255,0.12)');
    hl.addColorStop(0.60,'rgba(255,255,255,0.028)');
    hl.addColorStop(1.00,'rgba(255,255,255,0.00)');
    ctx.fillStyle = hl;
    ctx.fillRect(bbMinX-36, bbMinY-36, (bbMaxX-bbMinX)+72, (bbMaxY-bbMinY)+72);

    ctx.restore();

    ctx.save();
    ctx.strokeStyle=(isLightBG?'rgba(158,168,178,.22)':'rgba(210,228,255,.28)'); ctx.lineWidth=1.1;
    __traceSmoothClosedPath(ctx, env.pts);
    ctx.stroke();
    ctx.restore();

  }

  
  function drawESPMap(ctx, data, view, can){
    if(!ctx||!data||!view||!can) return;

    var env = __moleculeMapEnvelope(data, view, can, 3);
    if(!env) return;
    var envBounds = __envBounds(env);
    if(!envBounds) return;

    function chiOf(lbl){
      var s = String(lbl||'X').replace(/[^A-Za-z]/g,'');
      var t = {H:2.20, C:2.55, N:3.04, O:3.44, F:3.98, P:2.19, S:2.58, Cl:3.16, Br:2.96, I:2.66, B:2.04, Be:1.57, Xe:2.60};
      return (t[s] != null) ? t[s] : 2.50;
    }
    function clampJS(v,a,b){ return Math.max(a, Math.min(b, v)); }
    function rotLocal(dx, dy, ang){
      var c=Math.cos(ang||0), s=Math.sin(ang||0);
      return { x:dx*c + dy*s, y:-dx*s + dy*c };
    }
    function mixRGB(c1,c2,t){
      return [
        Math.round(c1[0] + (c2[0]-c1[0])*t),
        Math.round(c1[1] + (c2[1]-c1[1])*t),
        Math.round(c1[2] + (c2[2]-c1[2])*t)
      ];
    }
    function colorForScore(score, alphaMul){
      var c = __espPaletteRGBA(score, alphaMul == null ? 1 : alphaMul, false);
      return [c[0], c[1], c[2], c[3]];
    }

    var atoms = (data.atoms||[]);
    if(!atoms.length) return;
    var centerLabel = atoms[0] ? atoms[0].label : 'X';
    var centerChi = chiOf(centerLabel);
    var ligAtoms = atoms.slice(1);
    var ligChis = ligAtoms.map(function(a){ return chiOf(a.label); });
    var meanLigChi = ligChis.length ? (ligChis.reduce(function(s,v){ return s+v; }, 0)/ligChis.length) : centerChi;
    var allLigSame = ligAtoms.length>0 && ligAtoms.every(function(a){ return String(a.label||'') === String(ligAtoms[0].label||''); });
    var isCO2 = !!(data.ex && data.ex.key==='CO2');
    var densityBias = isFinite(data.densityBias) ? data.densityBias : (((data.ex && isFinite(data.ex.densityBias)) ? data.ex.densityBias : 0) || 0);

    function atomScore(idx){
      if(!atoms[idx]) return 0;
      var chi = chiOf(atoms[idx].label);
      var sc;
      if(idx===0){
        sc = (centerChi - meanLigChi) * 0.95;
        if((data.lps||[]).length && centerChi > meanLigChi) sc += 0.14 * Math.min(2, (data.lps||[]).length);
      } else {
        sc = (chi - centerChi) * 0.98;
      }
      if(allLigSame && idx>0) sc = ((ligChis[0]||centerChi) - centerChi) * 0.98;
      if(isCO2) sc = (idx===0 ? -0.98 : 1.02);
      sc += densityBias * (idx===0 ? -0.12 : 0.12);
      return clampJS(sc, -1.20, 1.20);
    }

    var comps = [];
    function pushComp(x,y,rx,ry,score,weight,angle){
      if(!isFinite(x)||!isFinite(y)||!isFinite(rx)||!isFinite(ry)) return;
      comps.push({
        x:x, y:y,
        rx:Math.max(6, rx), ry:Math.max(6, ry),
        score:clampJS(score, -1.22, 1.22),
        weight:weight == null ? 1 : weight,
        angle:angle || 0
      });
    }

    atoms.forEach(function(a, idx){
      var rw = __elementRadiusWorld(a.label, idx===0 ? 'center' : 'lig');
      var pr = __projectWorldRadius(a.pos, rw * (idx===0 ? 1.06 : 0.98), view, can);
      if(!pr) return;
      var sc = atomScore(idx);
      pushComp(pr.x, pr.y, pr.rx*(idx===0 ? 1.00 : 0.98), pr.ry*(idx===0 ? 0.98 : 0.96), sc, idx===0 ? 1.40 : 1.16, 0);
      pushComp(pr.x - pr.rx*0.12, pr.y - pr.ry*0.18, pr.rx*0.44, pr.ry*0.36, sc*0.62, idx===0 ? 0.62 : 0.50, 0);
    });

    ligAtoms.forEach(function(a, li){
      var cSc = atomScore(0), lSc = atomScore(li+1);
      var p0 = [0,0,0], p1 = a.pos;
      for(var k=1;k<=5;k++){
        var t = k/6;
        var pos = [p0[0]*(1-t)+p1[0]*t, p0[1]*(1-t)+p1[1]*t, p0[2]*(1-t)+p1[2]*t];
        var pr = __projectWorldRadius(pos, Math.max(0.09, (data.bondLen||1.55)*0.10), view, can);
        if(!pr) continue;
        var sc = cSc*(1-t) + lSc*t;
        pushComp(pr.x, pr.y, pr.rx*0.78, pr.ry*0.78, sc, 0.46, 0);
      }
    });

    (data.lps||[]).forEach(function(lp){
      var lpPos = lp.pos || [0,0,0];
      var dir = vNorm(lp.dir || lp.pos || [1,0,0]);
      var head = vAdd(lpPos, vMul(dir, 0.15));
      var p = projectPoint(lpPos, view, can);
      var pHead = projectPoint(head, view, can);
      var pr = __projectWorldRadius(lpPos, Math.max(0.20, ((lp && lp.size) || 0.28) * 0.82), view, can);
      if(!p || !pr) return;
      var ang = pHead ? Math.atan2(pHead.y-p.y, pHead.x-p.x) : 0;
      var rx = Math.max(12, pr.rx*1.28), ry = Math.max(10, pr.ry*0.92);
      var lpScore = clampJS(Math.max(0.96, atomScore(0)+0.26), -1.20, 1.20);
      pushComp(p.x, p.y, rx, ry, lpScore, 1.28, ang);
      pushComp(p.x + Math.cos(ang)*rx*0.18, p.y + Math.sin(ang)*rx*0.18, rx*0.70, ry*0.64, Math.min(1.20, lpScore+0.10), 0.92, ang);
    });

    if(!comps.length) return;

    var pad = 6;
    var x0 = Math.max(0, Math.floor(envBounds.minX - pad));
    var y0 = Math.max(0, Math.floor(envBounds.minY - pad));
    var x1 = Math.min(can.w, Math.ceil(envBounds.maxX + pad));
    var y1 = Math.min(can.h, Math.ceil(envBounds.maxY + pad));
    var w = Math.max(1, x1-x0), h = Math.max(1, y1-y0);
    var span = Math.max(1, Math.max(envBounds.maxX-envBounds.minX, envBounds.maxY-envBounds.minY));
    var cx = env.cx, cy = env.cy;

    function sampleField(px, py){
      var num = 0, den = 0, peak = 0;
      for(var i=0;i<comps.length;i++){
        var c = comps[i];
        var rr = rotLocal(px-c.x, py-c.y, c.angle||0);
        var q = (rr.x*rr.x)/(c.rx*c.rx) + (rr.y*rr.y)/(c.ry*c.ry);
        if(q > 5.8) continue;
        var wt = Math.exp(-q*1.10) * c.weight;
        num += c.score * wt;
        den += wt;
        if(wt > peak) peak = wt;
      }
      if(den < 1e-6) return {score:0, density:0};
      var score = clampJS((num/den) / 1.02, -1.0, 1.0);
      var radial = Math.hypot(px-cx, py-cy) / Math.max(1, span*0.56);
      var density = clampJS((1 - Math.pow(clampJS(radial, 0, 1), 1.55)) * 0.38 + clampJS(den/2.2, 0, 1)*0.92 + clampJS(peak/1.25, 0, 1)*0.30, 0, 1);
      return {score:score, density:density};
    }

    var sample = 2;
    var sw = Math.max(1, Math.ceil(w/sample));
    var sh = Math.max(1, Math.ceil(h/sample));
    var tmp = document.createElement('canvas');
    tmp.width = sw; tmp.height = sh;
    var tctx = tmp.getContext('2d');
    var img = tctx.createImageData(sw, sh);
    var d = img.data;

    for(var sy=0; sy<sh; sy++){
      for(var sx=0; sx<sw; sx++){
        var px = x0 + (sx+0.5)*sample;
        var py = y0 + (sy+0.5)*sample;
        var f = sampleField(px, py);
        var alpha = clampJS(0.18 + f.density*0.74, 0, 0.96);
        var col = colorForScore(f.score, alpha);
        var idx = (sy*sw + sx)*4;
        d[idx] = col[0];
        d[idx+1] = col[1];
        d[idx+2] = col[2];
        d[idx+3] = Math.round(col[3]*255);
      }
    }
    tctx.putImageData(img, 0, 0);

    ctx.save();
    __traceSmoothClosedPath(ctx, env.pts);
    ctx.clip();
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(tmp, 0, 0, sw, sh, x0, y0, w, h);

    var gloss = ctx.createRadialGradient(cx-span*0.22, cy-span*0.24, 4, cx-span*0.14, cy-span*0.12, span*0.72);
    gloss.addColorStop(0.00, 'rgba(255,255,255,0.18)');
    gloss.addColorStop(0.18, 'rgba(255,255,255,0.10)');
    gloss.addColorStop(0.52, 'rgba(255,255,255,0.035)');
    gloss.addColorStop(1.00, 'rgba(255,255,255,0.00)');
    ctx.fillStyle = gloss;
    ctx.fillRect(x0-12, y0-12, w+24, h+24);

    var lowerShade = ctx.createLinearGradient(cx, envBounds.minY, cx, envBounds.maxY);
    lowerShade.addColorStop(0.00, 'rgba(255,255,255,0.00)');
    lowerShade.addColorStop(0.60, 'rgba(15,24,38,0.04)');
    lowerShade.addColorStop(1.00, 'rgba(6,10,18,0.10)');
    ctx.fillStyle = lowerShade;
    ctx.fillRect(x0-8, y0-8, w+16, h+16);
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.34)';
    ctx.lineWidth = 1.05;
    __traceSmoothClosedPath(ctx, env.pts);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 2.4;
    __traceSmoothClosedPath(ctx, __expandEnvelopePath(env, -1.8).pts);
    ctx.stroke();
    ctx.restore();
  }




  function drawPizzaProjection(ctx, data, view, can){
    if(!ctx||!data||!can) return;
    var pC = projectPoint([0,0,0], view, can); if(!pC) return;

    
    var envBase = __collectEnvelopeItems(data, view, can);
    var items = (envBase && envBase.items) ? envBase.items : [];
    var maxR = 0;
    items.forEach(function(it){
      var d = Math.hypot((it.x||0)-pC.x, (it.y||0)-pC.y) + (it.r||0);
      if(d > maxR) maxR = d;
    });
    if(!isFinite(maxR) || maxR < 30) maxR = Math.min(can.w,can.h)*0.25;
    var r = Math.max(76, Math.min(Math.min(can.w,can.h)*0.46, maxR + 22));
    var cx = pC.x, cy = pC.y;

    var exGeom = (data.ex && data.ex.geom) ? String(data.ex.geom) : '';
    var arr = (data.geom && data.geom.arr) ? String(data.geom.arr) : '';
    var regionCount = Math.max(1, ((data.atoms||[]).length-1) + ((data.lps||[]).length||0));

    function normA(a){ while(a<0) a+=Math.PI*2; while(a>=Math.PI*2) a-=Math.PI*2; return a; }
    function equalSectors(n, start){
      var out=[], a0=(start==null?-Math.PI/2:start), step=(Math.PI*2)/Math.max(1,n);
      for(var i=0;i<n;i++) out.push({a1:a0+i*step, a2:a0+(i+1)*step, kind:'eq'});
      return out;
    }
    function viewBasis(view){
      var eye=[view.camDist*Math.cos(view.rotX)*Math.sin(view.rotY), view.camDist*Math.sin(view.rotX), view.camDist*Math.cos(view.rotX)*Math.cos(view.rotY)];
      var target=[0,0,0], up=[0,1,0];
      var f=vNorm(vSub(target, eye));
      var useUp = Math.abs(vDot(f, up)) > 0.98 ? [0,0,1] : up;
      var rB=vNorm(vCross(f, useUp));
      if(!isFinite(rB[0])||!isFinite(rB[1])||!isFinite(rB[2])) rB=[1,0,0];
      var uB=vCross(rB, f);
      return {r:rB, u:uB, f:f};
    }
    function dirAngleNoPerspective(dir, basis){
      var dx=vDot(dir, basis.r), dy=vDot(dir, basis.u);
      if(!isFinite(dx)||!isFinite(dy)) return null;
      if(Math.hypot(dx,dy) < 0.03) return null; 
      return normA(Math.atan2(-dy, dx)); 
    }
    function uniqueSortedAngles(angles){
      var arrA = (angles||[]).filter(function(a){ return a!=null && isFinite(a); }).map(normA).sort(function(a,b){ return a-b; });
      if(!arrA.length) return [];
      var out=[arrA[0]], tol=0.14; 
      for(var i=1;i<arrA.length;i++){
        var a=arrA[i], prev=out[out.length-1];
        if(Math.abs(a-prev) > tol) out.push(a);
      }
      if(out.length>1){
        var wrapGap = (out[0]+Math.PI*2) - out[out.length-1];
        if(wrapGap < tol){
          
          var a1=out[0], aN=out[out.length-1]-Math.PI*2;
          var m=normA((a1+aN)/2);
          out[0]=m; out.pop(); out.sort(function(a,b){ return a-b; });
        }
      }
      return out;
    }
    function sectorsFromRayAngles(rayAngles){
      var rays = uniqueSortedAngles(rayAngles);
      if(rays.length < 2) return null;
      var out=[];
      for(var i=0;i<rays.length;i++){
        var a1=rays[i], a2=(i===rays.length-1)?(rays[0]+Math.PI*2):rays[i+1];
        out.push({a1:a1, a2:a2, kind:'ray'});
      }
      return out;
    }
    function rayAnglesFromDirs(dirs, basis){
      return (dirs||[]).map(function(d){ return dirAngleNoPerspective(d, basis); }).filter(function(a){ return a!=null; });
    }
    function filterByAbsZ(dirs, predicate){
      var out=[]; (dirs||[]).forEach(function(d){ var z=Math.abs((d&&d[2])||0); if(predicate(z,d)) out.push(d); }); return out;
    }

    
    var basis = viewBasis(view);
    var ligDirs = (data.geom && data.geom.lig) ? data.geom.lig.slice() : (data.atoms||[]).slice(1).map(function(a){ return vNorm(a.pos||[1,0,0]); });
    var lpDirs = (data.geom && data.geom.lp) ? data.geom.lp.slice() : (data.lps||[]).map(function(lp){ return vNorm(lp.dir||lp.pos||[1,0,0]); });
    var sectors = [];
    var auxLines = [];
    var note = '';
    var customRayAngles = null;

    if(arr==='AX5' || exGeom==='tbp' || exGeom==='trigonal_bipyramidal' || exGeom==='see_saw' || exGeom==='t_shaped' || exGeom==='linear_tbp'){
      
      var eqDirs = filterByAbsZ(ligDirs.concat(lpDirs), function(z){ return z < 0.35; });
      var axDirs = filterByAbsZ(ligDirs.concat(lpDirs), function(z){ return z >= 0.35; });
      customRayAngles = rayAnglesFromDirs(eqDirs, basis);
      sectors = sectorsFromRayAngles(customRayAngles) || equalSectors(3, -Math.PI/2);
      auxLines = rayAnglesFromDirs(axDirs, basis).map(function(a){ return {a:a, kind:'ax'}; });
      if(!auxLines.length) auxLines = [{a:-Math.PI/2, kind:'ax'},{a:Math.PI/2, kind:'ax'}];
      note = (arr==='AX5' || exGeom==='tbp' || exGeom==='trigonal_bipyramidal')
        ? 'TBP: a pizza mostra o plano equatorial (3 regiões de 120°). As posições axiais aparecem como linhas fora do plano (90° com as equatoriais).'
        : 'TBP derivada: pares livres costumam ocupar posições equatoriais e comprimem alguns ângulos (<90°, <120°).';
    } else if(arr==='AX6' || exGeom==='oct' || exGeom==='octahedral' || exGeom==='square_pyramidal' || exGeom==='square_planar'){
      
      var planeDirs = filterByAbsZ(ligDirs.concat(lpDirs), function(z){ return z < 0.35; });
      var axisDirs = filterByAbsZ(ligDirs.concat(lpDirs), function(z){ return z >= 0.35; });
      customRayAngles = rayAnglesFromDirs(planeDirs, basis);
      sectors = sectorsFromRayAngles(customRayAngles) || equalSectors(4, -Math.PI/4);
      auxLines = rayAnglesFromDirs(axisDirs, basis).map(function(a){ return {a:a, kind:'ax'}; });
      if(!auxLines.length) auxLines = [{a:-Math.PI/2, kind:'ax'},{a:Math.PI/2, kind:'ax'}];
      note = (arr==='AX6' || exGeom==='oct' || exGeom==='octahedral')
        ? 'Octaédrica: a pizza mostra 4 regiões coplanares (90°). As 2 posições axiais ficam fora do plano.'
        : 'Octaédrica derivada: pares livres em posições axiais mudam alguns ângulos (ex.: AX5E tem Ax-Basal <90°).';
    } else {
      
      customRayAngles = rayAnglesFromDirs(ligDirs, basis);
      sectors = sectorsFromRayAngles(customRayAngles);
      if(!sectors){
        if(regionCount===4){ sectors = equalSectors(4, -Math.PI/4); }
        else sectors = equalSectors(regionCount, -Math.PI/2);
      }
      if(regionCount===4){
        note = ((data.geom&&data.geom.arr)||'').indexOf('AX4')===0
          ? 'Tetraédrica/derivadas: a pizza é uma analogia de projeção. O ângulo tetraédrico real (3D) é 109,5°.'
          : 'Quatro regiões no entorno: projeção ajuda a contar regiões; o ângulo real depende da geometria 3D.';
      } else if(regionCount===2){ note='2 regiões opostas -> 180° (linear).'; }
      else if(regionCount===3){ note='3 regiões no plano -> 120° (trigonal planar / base trigonal).'; }
      else { note = regionCount+' regiões eletrônicas em projeção (analogia da pizza).'; }
    }

    ctx.save();
    
    var rg = ctx.createRadialGradient(cx-r*0.14, cy-r*0.18, r*0.05, cx, cy, r);
    rg.addColorStop(0,'rgba(168,224,255,.12)');
    rg.addColorStop(0.75,'rgba(92,160,255,.07)');
    rg.addColorStop(1,'rgba(92,160,255,.025)');
    ctx.fillStyle = rg;
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='rgba(190,220,255,.35)';
    ctx.lineWidth=1.2;
    if(ctx.setLineDash) ctx.setLineDash([6,5]);
    ctx.stroke();
    if(ctx.setLineDash) ctx.setLineDash([]);

    
    sectors.forEach(function(s, i){
      var a1=s.a1, a2=s.a2;
      var col = (i%2===0) ? 'rgba(255,255,255,.055)' : 'rgba(120,200,255,.045)';
      ctx.beginPath();
      ctx.moveTo(cx,cy);
      ctx.arc(cx,cy,r,a1,a2,false);
      ctx.closePath();
      ctx.fillStyle = col;
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx,cy);
      ctx.lineTo(cx + Math.cos(a1)*r, cy + Math.sin(a1)*r);
      ctx.strokeStyle='rgba(255,255,255,.30)';
      ctx.lineWidth=1.1;
      ctx.stroke();
    });

    
    auxLines.forEach(function(aux){
      var a=aux.a;
      ctx.save();
      if(ctx.setLineDash) ctx.setLineDash([4,4]);
      ctx.strokeStyle='rgba(255,170,120,.55)';
      ctx.lineWidth=1.15;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a)*r*0.12, cy + Math.sin(a)*r*0.12);
      ctx.lineTo(cx + Math.cos(a)*r*0.95, cy + Math.sin(a)*r*0.95);
      ctx.stroke();
      if(ctx.setLineDash) ctx.setLineDash([]);
      ctx.restore();
    });

    
    ctx.beginPath();
    ctx.arc(cx,cy,8.5,0,Math.PI*2);
    ctx.fillStyle='rgba(70,110,255,.85)';
    ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.24)';
    ctx.stroke();

    
    ctx.font='700 12px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
    ctx.fillStyle='rgba(245,251,255,.96)';
    var ttl='Projeção angular (pizza) - esquema sem perspectiva';
    var tw=ctx.measureText(ttl).width;
    ctx.fillText(ttl, Math.max(12, Math.min(can.w-tw-12, cx-tw*0.5)), cy-r-10);

    
    var sliceTxt='';
    if(arr==='AX5' || exGeom==='tbp' || exGeom==='trigonal_bipyramidal') sliceTxt='TBP: 3 fatias equatoriais (120°) + 2 posições axiais (90° com as equatoriais).';
    else if(arr==='AX6' || exGeom==='oct' || exGeom==='octahedral') sliceTxt='Octaédrica: 4 fatias em um plano de referência (90°) + 2 posições axiais.';
    else if(regionCount===4) sliceTxt='4 regiões: a pizza é projeção. Em tetraédrica ideal, o ângulo real em 3D é 109,5°.';
    else if(regionCount===3) sliceTxt='3 regiões: pizza em 3 fatias iguais -> 120°.';
    else if(regionCount===2) sliceTxt='2 regiões: pizza dividida ao meio -> 180°.';
    else sliceTxt = note || (regionCount+' regiões eletrônicas em projeção.');
    if(note && sliceTxt.indexOf(note)===-1 && (arr.indexOf('E')>=0 || exGeom==='see_saw' || exGeom==='t_shaped' || exGeom==='square_pyramidal' || exGeom==='square_planar')){
      sliceTxt += ' ' + note;
    }

    ctx.font='700 14px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
    ctx.fillStyle='rgba(220,234,255,.96)';
    var maxTxtW = Math.max(190, Math.min(can.w*0.78, r*2.05));
    var words = String(sliceTxt).split(/\s+/), lines=[], cur='';
    for(var wi=0; wi<words.length; wi++){
      var test = cur ? (cur+' '+words[wi]) : words[wi];
      if(ctx.measureText(test).width > maxTxtW && cur){ lines.push(cur); cur = words[wi]; }
      else cur = test;
    }
    if(cur) lines.push(cur);
    var lineH = 17;
    var startY = cy + r + 16;
    lines.slice(0,3).forEach(function(tLine, li){
      var tw2 = ctx.measureText(tLine).width;
      var tx = Math.max(12, Math.min(can.w - tw2 - 12, cx - tw2*0.5));
      ctx.fillText(tLine, tx, startY + li*lineH);
    });
    ctx.restore();
  }



  function __drawVectorGrid(ctx, x, y, w, h){
    ctx.save();
    ctx.strokeStyle='rgba(255,255,255,.05)';
    ctx.lineWidth=1;
    for(var gx=x; gx<=x+w+0.1; gx+=24){ ctx.beginPath(); ctx.moveTo(gx,y); ctx.lineTo(gx,y+h); ctx.stroke(); }
    for(var gy=y; gy<=y+h+0.1; gy+=24){ ctx.beginPath(); ctx.moveTo(x,gy); ctx.lineTo(x+w,gy); ctx.stroke(); }
    ctx.restore();
  }

  function __vecLabel(ctx, p, txt, color){
    ctx.save();
    ctx.font='700 12px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
    var w = ctx.measureText(txt).width + 10;
    ctx.fillStyle='rgba(6,10,16,.82)';
    ctx.strokeStyle='rgba(255,255,255,.10)';
    ctx.lineWidth=1;
    ctx.beginPath(); if(ctx.roundRect) ctx.roundRect(p.x-w/2, p.y-12, w, 20, 10); else ctx.rect(p.x-w/2, p.y-12, w, 20); ctx.fill(); ctx.stroke();
    ctx.fillStyle=color||'#fff';
    ctx.textBaseline='middle';
    ctx.fillText(txt, p.x-w/2+5, p.y-2);
    ctx.restore();
  }

  function drawVectorRuleStage(ctx, can, step){
    var w=can.w, h=can.h;
    ctx.save();
    ctx.fillStyle='rgba(3,7,12,.94)';
    ctx.fillRect(0,0,w,h);
    var pad=18;
    var panel={x:pad,y:pad,w:w-pad*2,h:h-pad*2};
    ctx.fillStyle='rgba(8,12,20,.92)';
    ctx.strokeStyle='rgba(255,255,255,.12)';
    ctx.lineWidth=1;
    ctx.beginPath(); if(ctx.roundRect) ctx.roundRect(panel.x,panel.y,panel.w,panel.h,16); else ctx.rect(panel.x,panel.y,panel.w,panel.h); ctx.fill(); ctx.stroke();
    __drawVectorGrid(ctx, panel.x+12, panel.y+42, panel.w-24, panel.h-54);

    var mode = (step && step.vectorMode) || (/Subtração/i.test(String(step&&step.title||'')) ? 'subtraction' : (/Paralelogramo/i.test(String(step&&step.title||'')) ? 'parallelogram' : 'addition'));
    ctx.fillStyle='rgba(236,244,255,.97)';
    ctx.font='700 14px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
    var title = mode==='parallelogram' ? 'Regra do paralelogramo (soma gráfica)' : (mode==='subtraction' ? 'Subtração / cancelamento vetorial' : 'Adição vetorial');
    ctx.fillText(title, panel.x+14, panel.y+22);

    var ox = panel.x + Math.max(170, panel.w*0.32);
    var oy = panel.y + panel.h*0.62;
    var scale = Math.min(panel.w, panel.h) * 0.22;
    var va, vb;
    if(mode==='subtraction'){
      va = {x: scale*1.10, y: -scale*0.05};
      vb = {x: -scale*0.85, y: -scale*0.48};
    }else if(mode==='parallelogram'){
      va = {x: scale*1.00, y: -scale*0.18};
      vb = {x: scale*0.58, y: -scale*0.86};
    }else{
      va = {x: scale*0.95, y: -scale*0.28};
      vb = {x: scale*0.72, y: -scale*0.74};
    }

    function P(v){ return {x:ox+v.x, y:oy+v.y}; }
    var O={x:ox,y:oy}, A=P(va), B=P(vb), R=P({x:va.x+vb.x, y:va.y+vb.y});

    
    ctx.strokeStyle='rgba(255,255,255,.14)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(panel.x+28, oy); ctx.lineTo(panel.x+panel.w-28, oy); ctx.moveTo(ox, panel.y+58); ctx.lineTo(ox, panel.y+panel.h-22); ctx.stroke();

    
    drawArrow(ctx, O, A, '#4ec7ff', 3.0, 10);
    drawArrow(ctx, O, B, '#9cf16c', 3.0, 10);
    __vecLabel(ctx, {x:(O.x+A.x)/2, y:(O.y+A.y)/2-14}, 'μ₁', '#9ed8ff');
    __vecLabel(ctx, {x:(O.x+B.x)/2, y:(O.y+B.y)/2-14}, 'μ₂', '#d3ffb0');

    if(mode==='parallelogram' || mode==='addition'){
      
      ctx.save();
      if(ctx.setLineDash) ctx.setLineDash([7,6]);
      ctx.strokeStyle='rgba(255,255,255,.30)';
      ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.moveTo(A.x,A.y); ctx.lineTo(R.x,R.y); ctx.moveTo(B.x,B.y); ctx.lineTo(R.x,R.y); ctx.stroke();
      ctx.restore();
      drawArrow(ctx, O, R, '#ffd34d', 3.8, 14);
      __vecLabel(ctx, {x:(O.x+R.x)/2, y:(O.y+R.y)/2+16}, 'μR = μ₁ + μ₂', '#ffe98f');
    } else {
      
      var negB = {x:ox-vb.x, y:oy-vb.y};
      drawArrow(ctx, O, negB, '#ff8ea0', 2.8, 10);
      __vecLabel(ctx, {x:(O.x+negB.x)/2, y:(O.y+negB.y)/2+16}, '-μ₂', '#ffc2cb');
      var Rsub = {x: ox + va.x - vb.x, y: oy + va.y - vb.y};
      drawArrow(ctx, O, Rsub, '#ffd34d', 3.8, 14);
      __vecLabel(ctx, {x:(O.x+Rsub.x)/2, y:(O.y+Rsub.y)/2+16}, 'μR = μ₁ - μ₂', '#ffe98f');
      ctx.save(); if(ctx.setLineDash) ctx.setLineDash([7,6]); ctx.strokeStyle='rgba(255,255,255,.24)'; ctx.lineWidth=1.4;
      ctx.beginPath(); ctx.moveTo(A.x,A.y); ctx.lineTo(Rsub.x,Rsub.y); ctx.moveTo(negB.x,negB.y); ctx.lineTo(Rsub.x,Rsub.y); ctx.stroke(); ctx.restore();
    }

    
    var bx=panel.x+14, by=panel.y+44, bw=Math.min(390, panel.w*0.42), bh=86;
    ctx.fillStyle='rgba(7,11,18,.78)'; ctx.strokeStyle='rgba(255,255,255,.10)'; ctx.lineWidth=1;
    ctx.beginPath(); if(ctx.roundRect) ctx.roundRect(bx,by,bw,bh,12); else ctx.rect(bx,by,bw,bh); ctx.fill(); ctx.stroke();
    ctx.fillStyle='rgba(236,244,255,.96)'; ctx.font='700 12px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
    var head = mode==='parallelogram' ? 'Regra do paralelogramo' : (mode==='subtraction' ? 'Subtração vetorial (soma com sinal)' : 'Adição vetorial');
    ctx.fillText(head, bx+10, by+18);
    ctx.font='600 11px system-ui, -apple-system, Segoe UI, Roboto, sans-serif'; ctx.fillStyle='rgba(204,220,245,.95)';
    var l1, l2, l3;
    if(mode==='parallelogram'){
      l1='1) Desenhe μ₁ e μ₂ a partir da mesma origem.';
      l2='2) Copie μ₁ na ponta de μ₂ e μ₂ na ponta de μ₁.';
      l3='3) A diagonal da origem é a resultante μR.';
    }else if(mode==='subtraction'){
      l1='1) Subtrair μ₂ = somar (−μ₂).';
      l2='2) Inverta o sentido de μ₂ e some pela regra da soma.';
      l3='3) Cancelamento total ocorre se forem iguais e opostos.';
    }else{
      l1='1) Some por componentes: Σμx, Σμy, Σμz.';
      l2='2) Componentes no mesmo sentido se reforçam.';
      l3='3) A seta amarela mostra μR (soma final).';
    }
    ctx.fillText(l1, bx+10, by+40); ctx.fillText(l2, bx+10, by+57); ctx.fillText(l3, bx+10, by+74);

    ctx.restore();
  }
  function drawPolarOverlay(){
    var can = getCanvasAndCtx(); if(!can || !octx || !apiRef) return;
    var ctx=octx, w=can.w, h=can.h;
    ctx.clearRect(0,0,w,h);
    var s=steps[stepIdx]; if(!s) return;
    var data = moleculeVisualData();
    var ex = data.ex; var view = apiRef.getView ? apiRef.getView() : {camDist:5, rotX:0.3, rotY:-0.8};
    var vectorOnly = !!(s && s.onlyVectors);
    glowPhase += 0.03;

    if(vectorOnly){
      drawVectorRuleStage(ctx, can, s);
      return;
    }

    
    var projAtoms = data.atoms.map(function(a){ return {a:a, p:projectPoint(a.pos, view, can)}; });
    var pCenter = projAtoms[0] && projAtoms[0].p;
    if(!pCenter) return;

    

        var hasLonePairs = !!(data && data.geom && data.geom.lp && data.geom.lp.length);
    if(!vectorOnly && visualState.mapDensity){
      drawDensitySurfaceMap(ctx, data, view, can);
    }
    if(!vectorOnly && visualState.mapESP){
      drawESPMap(ctx, data, view, can);
    }

    
    if(visualState.bond){
      (data.bondDipoles||[]).forEach(function(d){
        if(!d || !d.dir) return;
        var towardLig = (ex.sign||1) > 0;
        var t0 = towardLig ? 0.34 : 0.78;
        var t1 = towardLig ? 0.82 : 0.38;
        var aW = vMul(d.dir, (data.bondLen||1.55) * t0);
        var bW = vMul(d.dir, (data.bondLen||1.55) * t1);
        var a = projectPoint(aW, view, can);
        var b = projectPoint(bW, view, can);
        if(!a || !b) return;
        if(Math.hypot(b.x-a.x, b.y-a.y) < 10) return;
        drawArrow(ctx, a, b, '#4ec7ff', 2.5, 8);
      });
    }

    if(vectorOnly){
      ctx.save();
      var bx=16, by=18, bw=Math.min(360, can.w*0.34), bh=74;
      ctx.fillStyle='rgba(7,11,18,.78)';
      ctx.strokeStyle='rgba(255,255,255,.12)';
      ctx.lineWidth=1;
      ctx.beginPath(); if(ctx.roundRect) ctx.roundRect(bx,by,bw,bh,12); else ctx.rect(bx,by,bw,bh); ctx.fill(); ctx.stroke();
      ctx.fillStyle='rgba(236,244,255,.96)';
      ctx.font='700 12px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
      var isAdd = /Adição de vetores/i.test(String(s.title||''));
      ctx.fillText(isAdd ? 'Regra de soma vetorial (adição)' : 'Regra de soma vetorial (subtração/cancelamento)', bx+12, by+18);
      ctx.font='600 11px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
      ctx.fillStyle='rgba(203,220,246,.94)';
      var line1 = isAdd ? 'Somamos componentes no mesmo sentido: Σμx, Σμy, Σμz.' : 'Vetores opostos entram com sinal contrário: Σμx, Σμy, Σμz.';
      var line2 = isAdd ? 'Componentes alinhadas se reforçam -> |μR| aumenta.' : 'Módulos iguais e sentidos opostos podem cancelar (μR ~ 0).';
      ctx.fillText(line1, bx+12, by+40);
      ctx.fillText(line2, bx+12, by+58);
      ctx.restore();
    }

    
    if(true){
      if(data.muMag > 0.06){
        var a = projectPoint([0,0,0], view, can) || pCenter;
        var scale = 0.74 + Math.min(0.78, data.muMag*0.18);
        var b = projectPoint(vMul(vNorm(data.muR), (data.bondLen||1.55)*scale), view, can);
        if(b) drawArrow(ctx, a, b, '#ffd34d', 3.4, 12);
      } else {
        drawTextLabel(ctx, {x:pCenter.x, y:pCenter.y+74}, 'μR ~ 0 (cancelamento)', '#f7fbff');
      }
    }

    
    if(!vectorOnly && visualState.deltas){
      
      var centerNeg = (ex.sign||1) < 0;
      drawTextLabel(ctx, {x:pCenter.x, y:pCenter.y- (centerNeg?58:48)}, centerNeg ? 'δ−' : 'δ+', centerNeg ? '#98b8ff' : '#ff9fb2');
      projAtoms.slice(1).forEach(function(it){
        if(!it.p) return;
        var ligNeg = (ex.sign||1) > 0;
        drawTextLabel(ctx, {x:it.p.x, y:it.p.y-42}, ligNeg ? 'δ−' : 'δ+', ligNeg ? '#98b8ff' : '#ff9fb2');
      });
    }

    
    if(!vectorOnly && visualState.angles && !hasLonePairs && (typeof showAngles==='undefined' || !showAngles || showAngles.checked)){
      drawAngleOverlay(ctx, data, view, can);
    }
  }

  function raf(){
    drawPolarOverlay();
    requestAnimationFrame(raf);
  }

  onReady(function(api){
    apiRef = api; if(!apiRef) return;
    injectStyles();

    el = {
      card: document.getElementById('tutorialCard'),
      tag: document.getElementById('tutorialStepTag'),
      title: document.getElementById('tutorialTitle'),
      body: document.getElementById('tutorialBody'),
      note: document.getElementById('tutorialNote'),
      examples: document.getElementById('tutorialExamples'),
      mini: document.getElementById('tutorialMini'),
      prog: document.getElementById('tutorialProgressBar'),
      next: document.getElementById('tutorialNext'),
      prev: document.getElementById('tutorialPrev'),
      hint: document.getElementById('focusHint')
    };

    
    if(apiRef.ui && apiRef.ui.showAxes) apiRef.ui.showAxes.checked = true;
    if(apiRef.ui && apiRef.ui.lpColor) apiRef.ui.lpColor.value = '#1100ff';
    if(apiRef.ui && apiRef.ui.bgStars) apiRef.ui.bgStars.value = apiRef.ui.bgStars.value || '0.6';
    apiRef.setBoardSplit && apiRef.setBoardSplit(false);
    apiRef.clearBalloons && apiRef.clearBalloons();

    var __bootStep = steps && steps[0] ? steps[0] : null;
    var __bootExampleKey = __bootStep && __bootStep.examples && __bootStep.examples[0] ? __bootStep.examples[0] : null;
    var __bootExample = __bootExampleKey ? exampleCatalog[__bootExampleKey] : null;
    if(__bootExample){
      activeExampleKey = __bootExample.key || __bootExampleKey;
      setExampleColors(__bootExample);
      apiRef.setGeom && apiRef.setGeom(__bootExample.geom);
    }
    apiRef.sync();

    
    if(el.card){
      var header = el.card.querySelector('.tutorialHeader .kicker');
      if(header) header.textContent = 'TUTORIAL GUIADO - POLARIDADE';
    }
    if(document.title) document.title = 'Polaridade molecular 3D - Tutorial guiado';
    ensureMapOptionsUI();
    ensureAngleOptionsUI();
    var oldTutorialAnglePanel = document.getElementById('tutorialAngleLegendPanel');
    if(oldTutorialAnglePanel) oldTutorialAnglePanel.remove();

    
    if(apiRef.ui && apiRef.ui.geom){
      var __refreshOnGeomChange = function(){
        if(el.examples){ el.examples.innerHTML = buildExamplesHTML(steps[stepIdx]); }
      };
      apiRef.ui.geom.addEventListener('input', __refreshOnGeomChange);
      apiRef.ui.geom.addEventListener('change', __refreshOnGeomChange);
    }

    el.next && el.next.addEventListener('click', next);
    el.prev && el.prev.addEventListener('click', prev);
    el.examples && el.examples.addEventListener('click', function(ev){
      var t = ev.target && ev.target.closest ? ev.target.closest('.exBtn, .exInlineBtn') : null;
      if(!t) return; ev.preventDefault();
      var k = t.getAttribute('data-ex-key'); if(k) setExample(k, {cam:true, userClick:true});
    });
    window.addEventListener('keydown', function(e){ if(e.key==='ArrowRight') next(); else if(e.key==='ArrowLeft') prev(); });

    raf();
    applyStep(0);
  });
})();
