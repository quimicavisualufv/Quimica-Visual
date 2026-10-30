/** SiMoEns: base revisada do Orbital Lab 3.4. Sem dependências externas. 2026-10-30. */
export const siteEntry = Object.freeze({
  id:'orbital_lab', title:'Orbital Lab — Campo Cristalino e Ligantes',
  path:'Ensino/Animacao/orbital-lab/index.html', category:'animação', registryCategory:'animation', catalogEntry:true,
  summary:'Simulador 3D de desdobramento dos orbitais d: geometrias octaédrica, tetraédrica e quadrado planar; séries de ligantes, spin, EECC, substituição, cinética e comparação entre modelos e parâmetros bibliográficos.',
  keywords:['orbital lab','orbital lab 3d','campo cristalino','ligantes de campo forte','ligantes de campo fraco','serie espectroquimica','desdobramento d','eecc','mecanismo de substituicao'],
  related:['Complexos de coordenação','Teoria do Campo Cristalino','Visualizador de Orbitais']
});
export const references = Object.freeze({
  'cft': { id:'cft',title:'Chemistry 2e, 19.3: Spectroscopic and Magnetic Properties of Coordination Compounds',publisher:'OpenStax',year:2019,url:'https://openstax.org/books/chemistry-2e/pages/19-3-spectroscopic-and-magnetic-properties-of-coordination-compounds',accessed:'2026-10-30'},
  'coordination': {id:'coordination',title:'Chemistry 2e, 19.2: Coordination Chemistry of Transition Metals',publisher:'OpenStax',year:2019,url:'https://openstax.org/books/chemistry-2e/pages/19-2-coordination-chemistry-of-transition-metals',accessed:'2026-10-30'},
  'jahn-teller': {id:'jahn-teller',title:'Jahn–Teller effect',publisher:'IUPAC Gold Book',url:'https://goldbook.iupac.org/terms/view/J03361',accessed:'2026-10-30'},
  'orbital-tabulated': {id:'orbital-tabulated',title:'Factors Affecting Electronic Structure — experimental compilation (Shriver, Atkins & Langford, 1994)',publisher:'Chemistry LibreTexts',url:'https://chem.libretexts.org/Courses/Northern_Michigan_University/CH_215%3A_Chemistry_of_the_Elements_Fall_2023/06%3A_Transition_Metals_and_Coordination_Chemistry/6.10%3A_Factors_Affecting_Electronic_Structure',accessed:'2026-10-30'},
  'orbital-mechanisms': {id:'orbital-mechanisms',title:'9.1.3: Ligand Substitution Mechanisms',publisher:'Chemistry LibreTexts — Ursinus College',url:'https://chem.libretexts.org/Courses/Ursinus_College/CHEM322%3A_Inorganic_Chemistry/09%3A_Reactions_of_Coordination_Complexes/9.01%3A_Substitution_Reactions/9.1.03%3A_Ligand_Substitution_Mechanisms',accessed:'2026-10-30'},
  'orbital-substitution': {id:'orbital-substitution',title:'Substitution reaction',publisher:'IUPAC Gold Book',url:'https://goldbook.iupac.org/terms/view/S06078',accessed:'2026-10-30'},
  'orbital-spectrochemical': {id:'orbital-spectrochemical',title:'Crystal Field Theory — Spectrochemical Series',publisher:'Purdue University',url:'https://chemed.chem.purdue.edu/genchem/topicreview/bp/ch12/crystal.php',accessed:'2026-10-30'}
});
export const registryEntry = Object.freeze({
 id:'orbital_lab',title:siteEntry.title,category:'animation',url:siteEntry.path,
 description:siteEntry.summary,
 topics:['campo cristalino','ligantes','complexos de coordenação','geometria octaédrica','geometria tetraédrica','quadrado planar','spin alto','spin baixo','EECC','série espectroquímica','substituição de ligantes','comparador 3D'],
 related:['visualizador_orbitais','gemviewer','geometria_molecular']
});
export const scientificValues = Object.freeze([
 ['[Ti(H₂O)₆]³⁺',20300,'Δo','d¹'],['[Cr(H₂O)₆]³⁺',17400,'Δo','d³'],
 ['[Cr(NH₃)₆]³⁺',21500,'Δo','d³'],['[Fe(H₂O)₆]²⁺',10400,'Δo','d⁶'],
 ['[Fe(CN)₆]⁴⁻',32800,'Δo','d⁶'],['[Co(NH₃)₆]³⁺',22900,'Δo','d⁶'],
 ['[Ni(H₂O)₆]²⁺',8500,'Δo','d⁸'],['[Ni(NH₃)₆]²⁺',10800,'Δo','d⁸'],
 ['[CoCl₄]²⁻',3300,'Δt','d⁷'],['[CoBr₄]²⁻',2900,'Δt','d⁷'],['[CoI₄]²⁻',2700,'Δt','d⁷']
]);
const link = 'https://quimicavisualufv.github.io/Quimica-Visual/'+siteEntry.path;
const sourceNote = (ids)=>'\n\n**Referências:** '+[...new Set(ids)].map(id=>`[${references[id].publisher} — ${references[id].title}](${references[id].url})`).join(' · ')+'.';
const normal = value=>String(value||'').replace(/[Δδ]/g,' delta ').replace(/[₀-₉]/g,c=>String('₀₁₂₃₄₅₆₇₈₉'.indexOf(c))).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\b(co|fe|ni|cr|ti)(cl4|cl6|br4|i4)\b/g,'$1 $2').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
const has = (text,words)=>words.some(w=>{const needle=normal(w);return Boolean(needle) && (' '+text+' ').includes(' '+needle+' ');});
const patterns = Object.freeze({
 link:/\b(?:link|url|acessar|abrir|onde fica|pagina|site|navegar|encontrar)\b/,
 quiz:/\b(?:quest(?:ao|oes)|pergunt(?:a|as)|exercici(?:o|os)|quiz|simulado|teste|gabarito|praticar)\b/,
 compare:/\b(?:compar(?:e|ar|acao)|diferencas?|versus|\bvs\b)\b/,
 numerical:/\b(?:calcule|calcular|calculo|converta|quanto vale|determine|valor numerico)\b/,
 summarized:/\b(?:resuma|resumir|resumo|em poucas palavras|em duas frases|simplifique)\b/
});
const quiz = [
 ['O que caracteriza um ligante de campo forte, mantendo metal, oxidação e geometria comparáveis?',['Eleva sempre o NOX','Produz maior separação energética d','Acelera toda substituição','Possui sempre carga −1'],1,'Compare o desdobramento energético, não a velocidade.','cft'],
 ['Em um octaedro ideal, quais orbitais d ficam mais energéticos?',['t₂g','e_g','Todos iguais','e e t₂ com energias idênticas'],1,'Quais apontam diretamente para os eixos metal–ligante?','cft'],
 ['No tetraedro ideal, qual conjunto está mais alto?',['e','t₂','t₂g','Todos degenerados'],1,'Ligantes entre eixos afetam mais dxy, dxz e dyz.','cft'],
 ['Na comparação didática apropriada, aproximadamente quanto vale Δt/Δo?',['9/4','1','4/9','2'],2,'O desdobramento tetraédrico costuma ser menor.','cft'],
 ['Um octaedro d⁶ de campo forte normalmente apresenta quantos elétrons desemparelhados?',['0','2','4','6'],0,'Distribua primeiro em t₂g, comparando Δo com P.','cft'],
 ['Um octaedro d⁶ de campo fraco usualmente apresenta quantos elétrons desemparelhados?',['0','1','2','4'],3,'O custo de pareamento pode ser maior do que promover para e_g.','cft'],
 ['Um complexo octaédrico d⁸ torna-se sempre diamagnético ao aumentar Δo?',['Sim','Não: costuma conservar dois desemparelhados','Somente se for azul','Sim, se tiver água'],1,'t₂g⁶e_g² conserva duas ocupações simples em e_g.','cft'],
 ['Qual orbital tende a ficar mais alto no esquema quadrado planar usual?',['dx²−y²','dxz','dyz','dz²'],0,'Quais lóbulos apontam para ligantes sobre x e y?','cft'],
 ['Na série, qual par costuma representar campo mais forte?',['I⁻ e Br⁻','Cl⁻ e F⁻','CN⁻ e CO','Br⁻ e H₂O'],2,'Considere ligantes π-aceptores.','orbital-spectrochemical'],
 ['Qual condição controla melhor a comparação H₂O versus NH₃ no Δ?',['Mudar o metal','Manter metal, oxidação e geometria','Mudar temperatura e concentração sem registrar','Usar só cor aparente'],1,'Evite variar duas causas de uma vez.','cft'],
 ['O que significa EECC?',['Energia de estabilização do campo cristalino','Energia de ionização do gás','Entalpia de elétrons livres','Empacotamento cúbico'],0,'Soma contribuições dos níveis d ocupados.','cft'],
 ['Qual expressão descreve EECC octaédrica, sem energia de pareamento?',['(+0,4nt₂g−0,6ne_g)Δo','(−0,4nt₂g+0,6ne_g)Δo','(nt₂g+ne_g)P','−Δt²'],1,'t₂g está 0,4Δo abaixo do baricentro.','cft'],
 ['No modelo spin-only, a estimativa do momento magnético depende diretamente de:',['Massa molar','Número de elétrons desemparelhados','Número de ligantes apenas','Cor observada'],1,'Identifique n e use μ≈√[n(n+2)] μB.','cft'],
 ['Uma substituição de ligantes implica obrigatoriamente oxirredução?',['Sim','Não','Sempre apenas oxidação','Sempre apenas redução'],1,'É possível trocar um doador neutro por outro sem mudar o NOX.','orbital-substitution'],
 ['No esquema dissociativo D para um centro inicialmente hexacoordenado:',['Y entra primeiro','X sai antes da entrada de Y','O metal vira outro elemento','O centro vai de coordenação 6 para 8'],1,'D = dissociação do ligante de saída.','orbital-substitution'],
 ['No esquema associativo A para centro inicialmente hexacoordenado:',['Forma-se coordenação 7 antes da saída do grupo, no esquema idealizado','X sai antes de Y entrar','Não há ligante entrante','Sempre vira tetraedro'],0,'A = associação do ligante entrante.','orbital-substitution'],
 ['O que caracteriza o mecanismo de intercâmbio I?',['Intermediário 5 isolável','Intermediário 7 isolável','Formação e ruptura concertadas, sem intermediário isolável','Mudança obrigatória da carga nuclear'],2,'Compare I com os limites A e D.','orbital-substitution'],
 ['Labilidade de um complexo descreve principalmente:',['Velocidade de substituição','Cor absorvida','Estabilidade termodinâmica apenas','Força gravitacional'],0,'Cinética não é o mesmo que equilíbrio.','coordination'],
 ['Ao aumentar o campo, a cor percebida de qualquer complexo necessariamente muda para azul?',['Sim','Não; espectro e transições precisam ser considerados','Sempre fica incolor','Muda apenas o número atômico'],1,'A cor depende do espectro absorvido e outras transições.','cft'],
 ['Qual fator pode produzir distorção de Jahn–Teller?',['Degenerescência eletrônica apropriada','A presença obrigatória de CO','A pressão atmosférica isolada','O número de prótons sempre par'],0,'É um mecanismo de redução de energia por quebra de simetria.','jahn-teller']
];
const corrections = [
 'Um campo mais forte aumenta a separação dos níveis d sob condições equivalentes; não implica maior NOX.',
 'Os orbitais d(x²−y²) e d(z²) apontam para os seis ligantes axiais e são elevados em energia.',
 'No tetraedro os ligantes ficam entre eixos e interagem mais fortemente com o conjunto t₂.',
 'A relação 4/9 vale para aproximações controladas, não para comparar quaisquer metais e ligantes.',
 'No d⁶ de campo forte ocorre t₂g⁶e_g⁰, com todos os elétrons emparelhados.',
 'No d⁶ de campo fraco ocorre t₂g⁴e_g², produzindo quatro elétrons desemparelhados.',
 'Num octaedro d⁸, o preenchimento t₂g⁶e_g² deixa dois elétrons em orbitais e_g diferentes.',
 'Os lóbulos d(x²−y²) apontam diretamente para os quatro ligantes coplanares.',
 'CN⁻ e CO são exemplos usuais de ligantes de campo forte; a ordem não determina cinética.',
 'O mesmo metal e estado de oxidação isolam o efeito do ligante sobre o desdobramento.',
 'É a contribuição energética dos elétrons d em relação ao baricentro do campo.',
 't₂g está abaixo (−0,4Δo) e e_g acima (+0,6Δo) em um octaedro ideal.',
 'No modelo spin-only, μ≈√[n(n+2)] μB depende de n, número de elétrons desemparelhados.',
 'Trocar ligantes pode ocorrer sem alterar o estado de oxidação do metal.',
 'No limite D, a saída de X antecede a associação de Y, reduzindo primeiro a coordenação.',
 'No limite A, o ligante Y entra antes da saída de X, elevando temporariamente a coordenação.',
 'No intercâmbio não existe intermediário isolável; ruptura e formação são acopladas.',
 'Labilidade é uma propriedade cinética: rapidez de troca, não constante de estabilidade.',
 'A cor depende do espectro de absorção e pode envolver múltiplas transições eletrônicas.',
 'A degenerescência eletrônica apropriada pode ser removida por distorção que diminui a energia.'
];
export const questions = Object.freeze(quiz.map((r,i)=>({id:'orbital-'+(i+1),topic:'Orbital Lab',q:r[0],options:r[1],correct:r[2],hint:r[3],sourceId:r[4]})));
const topical = [
 ['substitution', ['substituicao de ligante','substituicao de ligantes','substituicao de complex','troca de ligante','troca de ligantes','mecanismo dissociativo','mecanismo associativo','intercambio de ligantes','mecanismo d','mecanismo a','mecanismo i','labilidade','cinetica de substituicao']],
 ['bibliography',['valor tabelado','valor experimental','dados experimentais','valores experimentais','valor de delta','dado real','dados reais','dados bibliograficos','dados espectroscopicos','delta medido','32800','10400','20300','17400','3300','delta para']],
 ['magnetism',['magnetismo de complex','magnetismo de complexos','paramagnetismo','diamagnetismo','paramagnetico','diamagnetico','momento magnetico','desemparelhados','spin only','spin alto','spin baixo','high spin','low spin','pareamento','energia de pareamento']],
 ['splitting',['campo cristalino','desdobramento dos orbitais','desdobramento orbital','delta o','delta t','delta oct','separacao dos niveis d','eecc','estabilizacao do campo cristalino','t2g','t 2g','eg','e g','serie espectroquimica','espectroquimica','campo forte','campo fraco','ligantes de coordenacao','ligantes de campo','ligantes']],
 ['distortion',['jahn teller','distorcao tetragonal','alongamento axial','compressao axial','distorcao octaedrica']],
 ['geometry',['octaedrico','octaedrica','octaedro','tetraedrico','tetraedrica','tetraedro','quadrado planar','quadrada plana','geometrias dos complexos','geometria de coordenacao','comparador 3d']],
 ['light',['espectro de absorcao de complexo','cor de complexo','cor dos complexos','transicoes d d','comprimento de onda e delta','delta e lambda']],
 ['overview',['orbital lab','laboratorio orbital','animação de ligantes','simulador de ligantes','simulador de campo cristalino']]
];
const explicitDomain = /\b(?:complex(?:os|o)?|coordenacao|ligantes?|metalicos?|ion metalico|campo cristalino|campo forte|campo fraco|delta\s*[ot]|eecc|espectroquimica|jahn teller|orbital lab|orbitais? d|desdobramento d|spin alto|spin baixo|tetraedr\w*|octaedr\w*|quadrado planar|comparador 3d|substituicao)\b/;
const outside = /\b(?:vsepr da agua|molecula de agua|geometria molecular da agua|ligacao covalente|bragg|gibbs|célula unitária|celula unitaria|minecraft|futebol|eleicao)\b/;
const anyTopic = text => topical.find(([,keys])=>has(text,keys))?.[0] || '';
function assess(userText,context={}) {
 const t=normal(userText), raw=String(userText||'');
 const inExperience = normal(context.contextPath||'').includes('orbital lab') || normal(context.lastTopic||'').includes('orbital lab');
 let subject=anyTopic(t);
 if(/\b(?:valor|valores|delta)\b/.test(t) && /\b(?:fe|co|cr|ni|ti|ferro|cobalto|cromo|niquel|titanio)\b/.test(t))subject='bibliography';
 if(/\b(?:d8|d 8|diamagnetico|paramagnetico)\b/.test(t) && /\b(?:octaedr\w*|complex\w*|ligante\w*)\b/.test(t))subject='magnetism';
 if(!subject && inExperience && /\b(?:geometri(?:a|as)|formas|modelos|comparar|comparacao|comparador)\b/.test(t)) subject='geometry';
 if(!subject && inExperience && /\b(?:ele|isso|explicar|detalhar|mostra|serve|faz)\b/.test(t))subject='overview';
 if (!t || outside.test(t) && !t.includes('orbital lab')) return {match:false,reason:'outside'};
 if (t.includes('orbital lab')) return {match:true,subject:subject||'overview',confidence:1};
 // Do not hijack generic orbitals, VSEPR, ordinary molecular geometries or other catalog routes.
 const technical = subject==='substitution' && /\b(?:associativ|dissociativ|intercambio|labilidade|mecanismo)\w*/.test(t) || subject==='bibliography' && /\b(?:fe|co|ni|cr|ti|ferro|cobalto|cromo|niquel|titanio)\b/.test(t) || /\bdelta\s*[ot]\b/.test(t) || /\b(?:t2g|eg|d6|d8)\b/.test(t);
 if (!subject || (!explicitDomain.test(t) && !inExperience && !technical)) return {match:false,reason:'no-domain'};
 if (subject === 'geometry' && !/\b(?:complex\w*|ligante\w*|coordena\w*|campo|octaedr\w*|tetraedr\w*|quadrado planar|comparador)\b/.test(t) && !inExperience) return {match:false,reason:'generic-geometry'};
 if (subject === 'light' && !/\b(?:complex\w*|coordenacao|ligantes?|orbital lab|delta)\b/.test(t) && !inExperience) return {match:false,reason:'generic-light'};
 return {match:true,subject,confidence:0.86};
}
export const recognize = assess;
function formatQuiz(t) {
 const number=Math.min(8,Math.max(1,Number(t.match(/\b([1-8])\b/)?.[1] || (t.includes('duas')||t.includes('dois')?2:t.includes('tres')?3:3))));
 const pick = /substituicao|mecanismo|cinetica|labilidade/.test(t) ? [13,14,15,16,17] :
   /spin|magnetismo|paramagnetismo|diamagnetismo/.test(t) ? [4,5,6,12] :
   /geometria|octaedr|tetraedr|planar|comparador/.test(t) ? [1,2,3,7] :
   /espectroquimica|ligantes|campo forte|campo fraco/.test(t) ? [0,8,9,4,5] :
   /jahn|distorcao/.test(t) ? [19,7,6] :
   /eecc|estabilizacao/.test(t) ? [10,11,3] : [];
 const ranked=pick.map(i=>quiz[i]);
 const set=(ranked.length>=number?ranked:[...ranked,...quiz.filter(q=>!ranked.includes(q))]).slice(0,number);
 const result=['**Questões — Orbital Lab**',''];
 const noAnswers=/\b(?:sem gabarito|nao mostre (?:a )?resposta|sem resposta)\b/.test(t);
 set.forEach((q,i)=>{result.push(`**Questão ${i+1}.** ${q[0]}`);q[1].forEach((opt,j)=>result.push(`${'ABCD'[j]}) ${opt}`));result.push(`**Dica:** ${q[3]}`,'');});
 if(!noAnswers){result.push('**Gabarito comentado**');set.forEach((q,i)=>result.push(`${i+1}. **${'ABCD'[q[2]]}** — ${q[1][q[2]]}. ${corrections[quiz.indexOf(q)]}`));}
 result.push('',`**Para visualizar:** [Abrir Orbital Lab](${link}).`);
 return {text:result.join('\n'),sourceIds:[...new Set(set.map(q=>q[4]))],kind:'fixed-information'};
}
function valueText(t) {
 const names={ferro:'fe',cobalto:'co',niquel:'ni',cromo:'cr',titanio:'ti'};const target=t.match(/\b(fe|co|ni|cr|ti)\b/)?.[1] || Object.entries(names).find(([name])=>t.includes(name))?.[1];
 const sample=scientificValues.filter(v=>target && normal(v[0]).startsWith(target+' '));
 const ligand=(t.match(/\b(cn|h2o|nh3|cl4|cl6|br4|i4|cl|br|i)\b/)?.[1]||'').replace(/^(cl|br|i)\d+$/,'$1');
 const byLigand=sample.filter(v=>!ligand || normal(v[0]).includes(ligand));
 const selected=(ligand?byLigand:sample.length?sample:scientificValues).slice(0,11);
 if(!selected.length)return `**Não há valor tabelado cadastrado para esse complexo.** Confira metal, estado de oxidação, ligante e geometria. Não substituo o complexo solicitado por um parecido nem invento Δ.${sourceNote(['orbital-tabulated'])}`;
 const warning=/\bdelta o\b/.test(t)&&selected.some(v=>v[2]==='Δt')?'**Atenção:** para o complexo tetraédrico listado, o dado é **Δt**, não Δo. Não confunda as duas geometrias.\n\n':'';
 return `**Parâmetros espectroscópicos compilados no Orbital Lab**\n\n${selected.map(v=>`- **${v[0]}:** ${v[2]} ≈ **${v[1].toLocaleString('pt-BR')} cm⁻¹** (${v[3]}).`).join('\n')}\n\n${warning}**Importante:** não existe um Δ único de um metal sem especificar ligantes, estado de oxidação e geometria.\n\nEsses são **valores compilados de literatura**, não resultados calculados pelo modelo visual, nem equivalem necessariamente ao pico principal de absorção de um complexo multieletrônico. Não há incerteza experimental indicada nesta tabela; não a invente.${sourceNote(['orbital-tabulated'])}`;
}
function detailFor(topic,t){
 if(patterns.link.test(t)) return `**Orbital Lab — acesso à animação**\n\nEndereço previsto para o módulo no SiMoEns: [Orbital Lab — Campo Cristalino e Ligantes](${link}). O link só funcionará após os arquivos da animação serem publicados nessa pasta. No simulador, use o comparador 3D, os diagramas de energia e os controles de ligantes.`;
 if(topic==='bibliography')return valueText(t);
 if(topic==='substitution'){
  if(/\b(?:mecanismo i|intercambio)\b/.test(t))return `**Substituição por intercâmbio (I)**\n\nA formação da ligação com Y e a ruptura da ligação com X ocorrem de maneira acoplada, **sem intermediário isolável** no modelo-limite. Iₐ e I_d indicam, respectivamente, caráter associativo ou dissociativo predominante. O esquema animado não prova o mecanismo de um complexo real.${sourceNote(['orbital-mechanisms','orbital-substitution'])}`;
  if(/\b(?:mecanismo a|associativo|associacao)\b/.test(t))return `**Substituição associativa (A)**\n\nO ligante entrante **Y se associa primeiro**. Em um centro inicialmente hexacoordenado, o esquema ilustrativo pode seguir 6 → 7 → 6. É um **modelo-limite**, não um mecanismo universal para qualquer metal.${sourceNote(['orbital-mechanisms','coordination'])}`;
  if(/\b(?:mecanismo d|dissociativo|dissociacao)\b/.test(t))return `**Substituição dissociativa (D)**\n\nO ligante **X sai primeiro** e depois entra Y. Para um centro inicialmente hexacoordenado, o esquema idealizado pode seguir 6 → 5 → 6. A atribuição D exige dados cinéticos ou mecanísticos, não apenas a animação.${sourceNote(['orbital-mechanisms','coordination'])}`;
  if(/\b(?:labil\w*|cinetica|velocidade)\b/.test(t))return `**Labilidade não é instabilidade termodinâmica**\n\nComplexos **lábeis** substituem ligantes com maior rapidez; **inertes** reagem mais lentamente. Constantes de equilíbrio indicam estabilidade termodinâmica e não determinam sozinhas a velocidade. O Orbital Lab exibe leis-limite como k_obs = k_A[Y], usando constantes **hipotéticas** para a visualização.${sourceNote(['coordination'])}`;
  return `**Troca de ligantes**\n\nNo esquema genérico, **[ML₅X] + Y → [ML₅Y] + X**. O ligante X sai e Y entra; isso **não exige reação de oxirredução**. Explore os mecanismos-limite **D (dissociativo), A (associativo) e I (intercâmbio)** no módulo. O mecanismo real depende do sistema e de evidências experimentais.${sourceNote(['orbital-mechanisms','coordination'])}`;
 }
 if(topic==='magnetism'){
  if(/\bd\s*8\b|\bd8\b/.test(t)) return `**Octaedro d⁸ e magnetismo**\n\nO arranjo octaédrico usual é **t₂g⁶e_g²**, com **dois elétrons desemparelhados**, mesmo quando o desdobramento aumenta. Um complexo **d⁸ quadrado planar** é outro caso e pode ser diamagnético. Não confunda geometria e preenchimento.${sourceNote(['cft'])}`;
  if(/\bd\s*6\b|\bd6\b|alto|baixo|forte|fraco|pareamento/.test(t))return `**Spin alto × spin baixo no octaedro d⁶**\n\n- **Campo fraco (Δo relativamente menor que P):** t₂g⁴e_g², geralmente **4 desemparelhados**.\n- **Campo forte (Δo relativamente maior que P):** t₂g⁶e_g⁰, **0 desemparelhados**.\n\nA competição entre Δo e energia de pareamento P ajuda a explicar o preenchimento. Este critério não pode ser aplicado indiscriminadamente a todas as configurações d ou geometrias.${sourceNote(['cft'])}`;
  return `**Momento magnético no modelo spin-only**\n\nUma aproximação é **μ ≈ √[n(n+2)] μB**, sendo n o número de elétrons desemparelhados. Para n = 2, μ ≈ **2,83 μB**. Não é uma medição de suscetibilidade; contribuições orbitais e acoplamentos podem alterar o valor real.${sourceNote(['cft'])}`;
 }
 if(topic==='geometry'){
  if(/\b(?:compare|comparar|comparacao|comparando|diferenca|diferencas|versus|vs)\b/.test(t))return `**Comparação das geometrias de coordenação**\n\n- **Octaédrica:** seis ligantes; t₂g abaixo e e_g acima.\n- **Tetraédrica:** quatro ligantes entre eixos; e abaixo e t₂ acima; Δt é geralmente menor em comparação apropriada.\n- **Quadrado planar:** quatro ligantes no plano xy; d(x²−y²) costuma ser o mais elevado.\n\nNo Orbital Lab, o comparador 3D permite observar as três geometrias e seus diagramas simultaneamente.${sourceNote(['cft'])}`;
  if(/quadrad|planar/.test(t)) return `**Geometria quadrado planar**\n\nQuatro ligantes ficam no plano xy. No esquema usual, **d(x²−y²)** apresenta maior energia porque aponta para os ligantes; em muitos complexos d⁸ de metais como Pt(II), o arranjo pode ser diamagnético. A ordem fina e os espaçamentos dependem do sistema: não existe um Δ quadrado planar universal.${sourceNote(['cft'])}`;
  if(/tetraedr/.test(t)) return `**Campo tetraédrico**\n\nQuatro ligantes apontam **entre os eixos**. O conjunto **e** fica mais baixo e **t₂** mais alto. Para comparação idealizada do mesmo sistema, **Δt ≈ 4/9 Δo**; não é uma fórmula geral para quaisquer dois complexos diferentes. Complexos tetraédricos são frequentemente de spin alto.${sourceNote(['cft'])}`;
  if(/octaedr/.test(t)) return `**Campo octaédrico**\n\nSeis ligantes cercam o metal ao longo de ±x, ±y e ±z. Os orbitais **d(x²−y²) e d(z²)** formam o conjunto **e_g** mais alto; **dxy, dxz e dyz** compõem **t₂g** mais baixo. A distância energética é **Δo**, relevante para ocupação eletrônica e algumas transições espectrais.${sourceNote(['cft'])}`;
  return `**Comparador 3D do Orbital Lab**\n\nCompare **octaédrica (6 ligantes)**, **tetraédrica (4)** e **quadrado planar (4)** simultaneamente. Observe como a orientação espacial dos doadores modifica a ordem dos níveis d e a ocupação. Os diagramas são modelos didáticos; não leia seus valores arbitrários como medições.${sourceNote(['cft'])}`;
 }
 if(topic==='distortion')return `**Distorção de Jahn–Teller**\n\nEm certas configurações eletrônicas degeneradas, o complexo pode reduzir a energia por uma distorção geométrica. Um exemplo frequente é alongamento ou compressão tetragonal em alguns centros octaédricos (como muitos Cu²⁺, d⁹), causando desdobramentos adicionais. Nem todo octaedro é obrigatoriamente distorcido na mesma magnitude.${sourceNote(['jahn-teller','cft'])}`;
 if(topic==='light')return `**Absorção de luz e campo cristalino**\n\nNo modelo simples, uma transição entre níveis separados por Δ pode absorver fótons com **E = hν = hc/λ**. Se Δ é dado em cm⁻¹, λ (nm) ≈ **10⁷/Δ(cm⁻¹)** para uma **transição diretamente associada a essa energia**. Em íons multieletrônicos, várias transições, regras de seleção e transferência de carga exigem cautela: nem toda cor se explica por um único Δ.${sourceNote(['cft','orbital-tabulated'])}`;
 if(topic==='splitting'){
  if(/\beecc\b|estabilizacao/.test(t))return `**EECC — energia de estabilização do campo cristalino**\n\nNo modelo octaédrico, **EECC = (−0,4 n(t₂g) + 0,6 n(e_g))Δo**; no tetraédrico, **EECC = (−0,6 n(e) + 0,4 n(t₂))Δt**. Essas expressões contabilizam a ocupação relativamente ao baricentro e **não incluem automaticamente a energia de pareamento**. Se Δ é dado em cm⁻¹, a EECC também fica em cm⁻¹ até a conversão de unidades.${sourceNote(['cft'])}`;
  if(/\bdelta o\b/.test(t)&&/\bdelta t\b/.test(t))return `**Δt e Δo — comparação**\n\nNo modelo de campo cristalino idealizado, **Δt ≈ (4/9)Δo** sob condições apropriadamente comparáveis. A inversão da ordem dos níveis também importa: no octaedro **t₂g < e_g**, enquanto no tetraedro **e < t₂**. Não aplique 4/9 a metais, estados de oxidação e ligantes arbitrariamente diferentes.${sourceNote(['cft'])}`;
  if(/serie|espectro|forte|fraco|ligant/.test(t))return `**Ligantes de campo fraco e campo forte**\n\nExemplo de ordem crescente aproximada de campo: **I⁻ < Br⁻ < Cl⁻ < F⁻ < H₂O < NH₃ < en < CN⁻ < CO**. Ligantes de campo mais forte tendem a gerar **maior desdobramento Δ**, mantidos metal, NOX e geometria comparáveis. A série é empírica; **força do campo não é a mesma coisa que velocidade de substituição, carga elétrica ou estabilidade termodinâmica**.${sourceNote(['orbital-spectrochemical','cft'])}`;
  return `**Teoria do campo cristalino (TCC)**\n\nLigantes em torno de um metal removem a degenerescência dos **cinco orbitais d**. No octaedro, t₂g fica abaixo e e_g acima; a separação é **Δo**. Essa abordagem ajuda a interpretar **spin, propriedades magnéticas e algumas bandas de absorção**. É um modelo com limitações: ligações metal–ligante podem ter caráter covalente e mistura orbital que a TCC puramente eletrostática não descreve.${sourceNote(['cft'])}`;
 }
 return `**Orbital Lab — o que explorar**\n\nO módulo apresenta modelos 3D e diagramas de energia para geometrias **octaédrica, tetraédrica e quadrado planar**, comparador simultâneo, troca de ligantes, série espectroquímica, distribuição de elétrons d, spin, EECC, mecanismos A/D/I, cinética didática, distorções e tutorial progressivo. Os valores tabelados identificados como bibliográficos não devem ser confundidos com previsões de modelos ilustrativos.\n\n[Ver animação](${link}) — após sua publicação no SiMoEns.${sourceNote(['cft','coordination'])}`;
}
export function answer(userText,context={}) {
 const match=assess(userText,context);
 if(!match.match)return null;
 const t=normal(userText);
 if(patterns.quiz.test(t))return formatQuiz(t);
 if(patterns.numerical.test(t)){
  if(match.subject==='bibliography' && !/\b(?:converta|calcule|calcular|calculo)\b/.test(t)) return {text:valueText(t),sourceIds:['orbital-tabulated'],kind:'scientific-explanation',subject:'Orbital Lab'};
  // Calculations only where explicit quantities are supplied. Never fabricate Δ, P or rate constants.
  const wav=String(userText).match(/(?:Δ|delta)\s*[ot]?\s*[=:]?\s*(\d+(?:[.,]\d+)?)\s*cm\s*(?:\^\s*-?1|⁻¹|-1)/i);
  if(wav && Number(wav[1].replace(',','.'))>0){const value=Number(wav[1].replace(',','.')),nm=1e7/value,kj=value*0.0119626565638697;return {text:`**Conversão de um desdobramento energético**\n\nPara Δ = **${value.toLocaleString('pt-BR')} cm⁻¹**: a energia molar associada à separação é **${kj.toLocaleString('pt-BR',{maximumFractionDigits:2})} kJ/mol** e o comprimento de onda da transição hipotética correspondente é **${nm.toLocaleString('pt-BR',{maximumFractionDigits:2})} nm**, usando λ = 10⁷/Δ.\n\n**Limite:** a banda observada em complexos multieletrônicos nem sempre coincide com Δ.${sourceNote(['cft'])}`,sourceIds:['cft'],kind:'calculation'};}
  return {text:`**Para calcular no Orbital Lab**, informe a grandeza e os dados com unidades (por exemplo: “Converta Δo = 20300 cm⁻¹ em nm e kJ/mol”). Não vou atribuir valores medidos a um complexo sem uma fonte ou inventar Δ, P e constantes cinéticas.\n\n[Abra o simulador](${link}).`,sourceIds:['cft'],kind:'limitation'};
 }
 const body=detailFor(match.subject,t);
 const referenceIds=match.subject==='bibliography'?['orbital-tabulated']:match.subject==='distortion'?['jahn-teller','cft']:match.subject==='substitution'?['orbital-mechanisms','coordination']:match.subject==='light'?['cft','orbital-tabulated']:['cft'];
 return {text:body,sourceIds:referenceIds,kind:patterns.link.test(t)?'fixed-information':'scientific-explanation',subject:'Orbital Lab'};
}
export default {answer,recognize,questions,references,siteEntry,registryEntry,scientificValues};
