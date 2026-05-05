(() => {
  
  const $ = (id) => document.getElementById(id);

  const cv = $("cv");
  const ctx = cv.getContext("2d", { alpha: false });

  const systemSel = $("systemSel");
  const latticeSel = $("latticeSel");
  const resetBtn = $("resetBtn");
const sa = $("sa"), sb = $("sb"), sc = $("sc");
  const salpha = $("salpha"), sbeta = $("sbeta"), sgamma = $("sgamma");
  const va = $("va"), vb = $("vb"), vc = $("vc");
  const valpha = $("valpha"), vbeta = $("vbeta"), vgamma = $("vgamma");
  const tAlpha = $("tAlpha");
  const fa = $("fa"), fb = $("fb"), fc = $("fc"), falpha = $("falpha"), fbeta = $("fbeta"), fgamma = $("fgamma");

  const tAxes = $("tAxes"), tLabels = $("tLabels"), tRep = $("tRep"), tAngles = $("tAngles");

  const paramReadout = $("paramReadout");

  const stepTitle = $("stepTitle");
  const stepBody = $("stepBody");
  const calloutBody = $("calloutBody");
  const bar = $("bar");
  const prevBtn = $("prevBtn");
  const nextBtn = $("nextBtn");

  const viewerCard = $("viewerCard");
  const leftCard = $("leftCard");
  const rightCard = $("rightCard");
const state = {
    a: 1.00, b: 1.00, c: 1.00,
    alpha: 90, beta: 90, gamma: 90,
    system: "cubic",
    lattice: "corners",
    showAxes: true,
    showLabels: true,
    showAngles: true,
    showAlpha: true,
    repeat: false,

    
    yaw: -0.65,
    pitch: 0.35,
    zoom: 0.55, 
    dragging: false,
    lastX: 0,
    lastY: 0,
  };

  
  
  
  
  
  
  
  
  
  const latticeBySystem = {
    triclinic:    ["none","corners"],
    monoclinic:   ["none","corners","base"],
    orthorhombic: ["none","corners","base","bcc","fcc"],
    tetragonal:   ["none","corners","bcc"],
    hexagonal:    ["none","corners"],
    rhombohedral: ["none","corners"],
    cubic:        ["none","corners","bcc","fcc"],
  };

  const latticeLabels = {
    none:    "Nenhuma",
    corners: "Primitiva (só cantos)",
    base:    "Base centrada",
    bcc:     "Corpo centrado",
    fcc:     "Faces centradas",
  };

  function updateLatticeOptions(){
    const sys = state.system;
    const allowed = latticeBySystem[sys] || ["none","corners"];

    
    latticeSel.innerHTML = "";
    for (const key of allowed){
      const opt = document.createElement("option");
      opt.value = key;
      opt.textContent = latticeLabels[key] || key;
      latticeSel.appendChild(opt);
    }

    
    if (!allowed.includes(state.lattice)){
      state.lattice = allowed.includes("corners") ? "corners" : allowed[0];
    }
    latticeSel.value = state.lattice;
  }

  
  
  
  
  const viewMap = {
    
    getLenA: () => state.c,
    getLenB: () => state.a,
    getLenC: () => state.b,
    setLenA: (v) => state.c = v,
    setLenB: (v) => state.a = v,
    setLenC: (v) => state.b = v,

    
    
    
    
    getAlpha: () => state.gamma,
    getBeta:  () => state.alpha,
    getGamma: () => state.beta,
    setAlpha: (v) => state.gamma = v,
    setBeta:  (v) => state.alpha = v,
    setGamma: (v) => state.beta = v,
  };

  
  const colors = {
    a: 'rgba(34,197,94,.95)',   
    b: 'rgba(96,165,250,.95)',  
    c: 'rgba(245,158,11,.95)',  
  };

  
  const steps = [
    {
      title: "01 — O que você está vendo",
      body:
        "Isso é uma célula unitária: o “tijolinho” que, repetido no espaço, constrói a rede cristalina. " +
        "As arestas são definidas por três vetores (a, b, c). Os ângulos entre eles são α (entre b e c), β (entre a e c) e γ (entre a e b).",
      callout:
        "Arraste pra girar e procure perceber: quando os ângulos deixam de ser 90°, a caixa vira um “paralelepípedo torto” — e isso é exatamente a ideia.",
      action: () => {
        state.system = "cubic";
        applySystemPreset(state.system);
        state.showAxes = false; state.showLabels = false; state.repeat = false;
        tAxes.checked = false; tLabels.checked = false; tRep.checked = false;
        state.lattice = "none"; latticeSel.value = "none"; state.showAngles = false;
      }
    },
    {
      title: "02 — Eixos e Angulos",
      body:
        "Por convenção, são atribuídos a ao eixo y, b ao eixo x e c ao eixo z. " +
        "Entre esses três vetores, formam-se os ângulos α (entre b e c), β (entre a e c) e γ (entre a e b).",
      callout:
        "Observe os angulos.",
      action: () => {
        state.system = "cubic";
        applySystemPreset(state.system);
        state.showAxes = true; state.showLabels = true; state.repeat = false;
        tAxes.checked = true; tLabels.checked = true; tRep.checked = true;
        state.lattice = "none"; latticeSel.value = "none"; state.showAngles = true;
      }
    },
    {
      title: "03 — Parametros e formatos de uma célula",
      body:
        "O formato geometrico nos diz como os lados a, b, c e os ângulos se relacionam. " +
        "Cúbico: a=b=c e α=β=γ=90°. Tetragonal: a=b≠c e ângulos 90°. Ortorrombico: a≠b≠c e ângulos 90°. " +
        "Hexagonal: a=b≠c e γ=120°. Monoclínico: um ângulo diferente de 90°. Triclínico: tudo pode ser diferente.",
      callout:
        "Truque: mexa no seletor de Sistema lá em cima e tente adivinhar quais sliders “deveriam” travar automaticamente.",
      action: () => {
        state.system = "cubic";
        applySystemPreset(state.system);
        state.showAxes = true; state.showLabels = true; state.repeat = false;
        tAxes.checked = true; tLabels.checked = true; tRep.checked = true;
        state.lattice = "none"; latticeSel.value = "none"; state.showAngles = true;
      }
    },
    {
      title: "04 — Cúbico (a=b=c, 90°)",
      body:
        "No cúbico, a simetria é máxima: todos os lados iguais e todos os ângulos retos. " ,
      callout:
        "No 3D, cubo é o “modo zen”: qualquer rotação parece familiar. Se isso te dá conforto, é porque a simetria tá fazendo carinho.",
      action: () => {
        state.system = "cubic";
        applySystemPreset(state.system);
        state.showAxes = true; state.showLabels = true; state.repeat = false;
        tAxes.checked = true; tLabels.checked = true; tRep.checked = true;
        state.lattice = "none"; latticeSel.value = "none"; state.showAngles = true;
      }
    },
    {
      title: "05 — Tetragonal (a=b≠c, 90°)",
      body:
        "Tetragonal é tipo um cubo que tomou um estirão (ou foi comprimido) no eixo c. " +
        "Os ângulos continuam 90°, mas agora você sente a diferença entre “altura” e “base”.",
      callout:
        "A melhor leitura visual: compare as faces quadradas com as faces retangulares.",
      action: () => {
        state.system = "tetragonal";
        applySystemPreset(state.system);
        state.showAxes = true; state.showLabels = true; state.repeat = false;
        tAxes.checked = true; tLabels.checked = true; tRep.checked = true;
        state.lattice = "none"; latticeSel.value = "none"; state.showAngles = true;
      }
    },
    {
      title: "06 — Ortorrombico (a≠b≠c, 90°)",
      body:
        "Ortorrombico mantém ângulos retos, mas perde a igualdade dos comprimentos. " +
        "É o paralelepípedo retinho, só que cada direção tem sua própria escala.",
      callout:
        "Se você estiver pensando em “caixa de sapato”, você está no caminho certo (sem meme).",
      action: () => {
        state.system = "orthorhombic";
        applySystemPreset(state.system);
        state.showAxes = true; state.showLabels = true; state.repeat = false;
        tAxes.checked = true; tLabels.checked = true; tRep.checked = true;
        state.lattice = "none"; latticeSel.value = "none"; state.showAngles = true;
      }
    },
    {
      title: "07 — Hexagonal (γ=120°)",
      body:
        "No hexagonal, a=b e o ângulo γ entre a e b é 120°. Isso cria uma base com simetria hexagonal. " +
        "O eixo c é a “altura” do prisma. Visualmente, a base parece um losango com cara de favo.",
      callout:
        "Gire até olhar “de cima”: a base fica muito mais óbvia quando você alinha a câmera com o eixo c.",
      action: () => {
        state.system = "hexagonal";
        applySystemPreset(state.system);
        state.showAxes = true; state.showLabels = true; state.repeat = false;
        tAxes.checked = true; tLabels.checked = true; tRep.checked = true;
        state.lattice = "none"; latticeSel.value = "none"; state.showAngles = true;
      }
    },
    {
      title: "08 — Monoclínico (um ângulo torto)",
      body:
        "Monoclínico é quando dois ângulos são 90° e um não. Em geral, toma-se α=γ=90° e β ≠ 90°. " +
        "O resultado é uma célula inclinada em uma direção só, como se uma face tivesse “escorregado”.",
      callout:
        "Mexe no β e observe como o topo “desloca” sem quebrar a base.",
      action: () => {
        state.system = "monoclinic";
        applySystemPreset(state.system);
        state.showAxes = true; state.showLabels = true; state.repeat = false;
        tAxes.checked = true; tLabels.checked = true; tRep.checked = true;
        state.lattice = "none"; latticeSel.value = "none"; state.showAngles = true;
      }
    },
    {
      title: "09 — Triclínico (tudo pode)",
      body:
        "Triclínico é o modo sem garantias: a, b, c diferentes e α, β, γ diferentes de 90° em geral. " +
        "É o caso mais geral — útil pra lembrar que os outros sistemas são “restrições” desse aqui.",
      callout:
        "Se parecer caótico, perfeito: o triclínico é o lembrete de que a natureza não assinou contrato com nossos ângulos retos.",
      action: () => {
        state.system = "triclinic"; 
        applySystemPreset(state.system);
        state.showAxes = true; state.showLabels = true; state.repeat = false;
        tAxes.checked = true; tLabels.checked = true; tRep.checked = true;
        state.lattice = "none"; latticeSel.value = "none"; state.showAngles = true;
      }
    },
    {
      title: "10 — Célula vs rede (repetição 3×3×3)",
      body:
        "Uma célula unitária sozinha é só o tijolo. Quando você repete, aparece a ideia de periodicidade: " +
        "a rede é o padrão infinito (na prática, grande o bastante).",
      callout:
        "Ative “Repetir 3×3×3” e gire: repare como o olho para de ver “uma caixa” e começa a ver “estrutura”.",
      action: () => {
        applySystemPreset(state.system);
        state.showAxes = true; state.showLabels = true; state.repeat = true;
        tAxes.checked = true; tLabels.checked = true; tRep.checked = true;
        state.lattice = "none"; latticeSel.value = "none"; state.showAngles = false;
      }
    },
    {
      title: "11 — Célula Unitária com modelo de esferas",
      body:
        "O modelo de esfera representa a posição e interação da menor periodicidade possivel (tijololo) entre os átomos. Existem os mais diversos formatos e peculiaridades" +
        "SC: só cantos. BCC: cantos + centro do corpo. FCC: cantos + centros das faces.",
      callout:
        "Troque o seletor “Modelo de esferas” no topo e compare.",
      action: () => {
        state.system = "cubic"; applySystemPreset(state.system);
        applySystemPreset(state.system);
        state.showAxes = true; state.showLabels = true; state.repeat = false;
        tAxes.checked = true; tLabels.checked = true; tRep.checked = true;
        state.showAngles = false; state.lattice = "bcc"; latticeSel.value = "bcc";
      }
    },
  ];

  let stepIndex = 0;

  function setStep(i){
    stepIndex = Math.max(0, Math.min(steps.length-1, i));
    const s = steps[stepIndex];
    stepTitle.textContent = s.title;
    stepBody.textContent = s.body;
    calloutBody.textContent = s.callout;
    const p = (stepIndex+1)/steps.length;
    bar.style.width = `${Math.round(p*100)}%`;
    prevBtn.disabled = stepIndex === 0;
    nextBtn.disabled = stepIndex === steps.length-1;
    if (typeof s.action === "function") s.action();
    syncUIFromState();
  }

  prevBtn.addEventListener("click", () => setStep(stepIndex-1));
  nextBtn.addEventListener("click", () => setStep(stepIndex+1));

  
  function applySystemPreset(sys){
    state.system = sys;
    systemSel.value = sys;

    
    if (sys === "cubic"){
      state.a = 1.00; state.b = 1.00; state.c = 1.00;
      state.alpha = 90; state.beta = 90; state.gamma = 90;
    } else if (sys === "tetragonal"){
      state.a = 1.00; state.b = 1.00; state.c = 1.55;
      state.alpha = 90; state.beta = 90; state.gamma = 90;
    } else if (sys === "orthorhombic"){
      state.a = 0.90; state.b = 1.35; state.c = 1.65;
      state.alpha = 90; state.beta = 90; state.gamma = 90;
    } else if (sys === "hexagonal"){
      state.a = 1.00; state.b = 1.00; state.c = 1.55;
      state.alpha = 90; state.beta = 90; state.gamma = 120;
    }
    else if (sys === "rhombohedral"){
      
      state.a = 1.00; state.b = 1.00; state.c = 1.00;
      state.alpha = 75; state.beta = 75; state.gamma = 75;
    } else if (sys === "monoclinic"){
      state.a = 1.00; state.b = 1.25; state.c = 1.55;
      state.alpha = 90; state.beta = 108; state.gamma = 90;
    } else if (sys === "triclinic"){
      state.a = 0.95; state.b = 1.35; state.c = 1.25;
      state.alpha = 78; state.beta = 102; state.gamma = 112;
    }

    enforceConstraints();
    updateLatticeOptions();
  }

  function enforceConstraints(){
    const sys = state.system;

    
    if (sys === "cubic"){
      state.b = state.a; state.c = state.a;
      state.alpha = 90; state.beta = 90; state.gamma = 90;
    } else if (sys === "tetragonal"){
      state.b = state.a;
      state.alpha = 90; state.beta = 90; state.gamma = 90;
    } else if (sys === "orthorhombic"){
      state.alpha = 90; state.beta = 90; state.gamma = 90;
    } else if (sys === "hexagonal"){
      state.b = state.a;
      state.alpha = 90; state.beta = 90; state.gamma = 120;
    } else if (sys === "monoclinic"){
      
      state.alpha = 90; state.gamma = 90;
    } else if (sys === "rhombohedral"){
      state.b = state.a; state.c = state.a;
      
      state.beta = state.alpha; state.gamma = state.alpha;
    } else if (sys === "triclinic"){
      
    }

    
    state.alpha = clamp(state.alpha, 55, 125);
    state.beta  = clamp(state.beta,  55, 125);
    state.gamma = clamp(state.gamma, 55, 125);
    
  }

  
  function syncUIFromState(){
    
    
    const sys = state.system;

    const setField = (field, enabled) => {
      field.style.opacity = enabled ? "1" : ".45";
      field.querySelector("input").disabled = !enabled;
    };

    
    setField(fa, (sys !== "cubic" && sys !== "rhombohedral")); 
    setField(fb, true);            
    setField(fc, !(sys === "cubic" || sys === "tetragonal" || sys === "hexagonal" || sys === "rhombohedral"));

    
    
    setField(falpha, sys === "triclinic");
    setField(fbeta,  sys === "triclinic");
    setField(fgamma, sys === "monoclinic" || sys === "triclinic");

    
    const da = viewMap.getLenA(), db = viewMap.getLenB(), dc = viewMap.getLenC();
    const dα = viewMap.getAlpha(), dβ = viewMap.getBeta(), dγ = viewMap.getGamma();

    sa.value = da.toFixed(2);
    sb.value = db.toFixed(2);
    sc.value = dc.toFixed(2);
    salpha.value = dα;
    sbeta.value  = dβ;
    sgamma.value = dγ;

    va.textContent = da.toFixed(2);
    vb.textContent = db.toFixed(2);
    vc.textContent = dc.toFixed(2);
    valpha.textContent = Math.round(dα);
    vbeta.textContent  = Math.round(dβ);
    vgamma.textContent = Math.round(dγ);

    systemSel.value = state.system;
    latticeSel.value = state.lattice;

    tAxes.checked = state.showAxes;
    tLabels.checked = state.showLabels;
    tAngles.checked = state.showAngles;
    tRep.checked = state.repeat;

    
    tAlpha.checked = state.showAlpha;
paramReadout.textContent =
      `a=${da.toFixed(2)} b=${db.toFixed(2)} c=${dc.toFixed(2)} | α=${Math.round(dα)}° β=${Math.round(dβ)}° γ=${Math.round(dγ)}°`;
  }

  function clamp(x, a, b){ return Math.max(a, Math.min(b, x)); }

  
  function bindSlider(slider, on){
    slider.addEventListener("input", () => on());
    slider.addEventListener("change", () => on());
  }

  bindSlider(sa, () => {
    viewMap.setLenA(parseFloat(sa.value));
    enforceConstraints();
    syncUIFromState();
  });
  bindSlider(sb, () => {
    viewMap.setLenB(parseFloat(sb.value));
    enforceConstraints();
    syncUIFromState();
  });
  bindSlider(sc, () => {
    viewMap.setLenC(parseFloat(sc.value));
    enforceConstraints();
    syncUIFromState();
  });

  bindSlider(salpha, () => {
    viewMap.setAlpha(parseFloat(salpha.value));
    enforceConstraints();
    syncUIFromState();
  });
  bindSlider(sbeta, () => {
    viewMap.setBeta(parseFloat(sbeta.value));
    enforceConstraints();
    syncUIFromState();
  });
  bindSlider(sgamma, () => {
    viewMap.setGamma(parseFloat(sgamma.value));
    enforceConstraints();
    syncUIFromState();
  });

  systemSel.addEventListener("change", () => {
    applySystemPreset(systemSel.value);
    updateLatticeOptions();
    syncUIFromState();
  });

  latticeSel.addEventListener("change", () => {
    state.lattice = latticeSel.value;
    syncUIFromState();
  });

  tAxes.addEventListener("change", () => state.showAxes = tAxes.checked);
  tLabels.addEventListener("change", () => state.showLabels = tLabels.checked);
  tAngles.addEventListener("change", () => state.showAngles = tAngles.checked);
  tRep.addEventListener("change", () => state.repeat = tRep.checked);

  
  tAlpha.addEventListener("change", () => state.showAlpha = tAlpha.checked);
resetBtn.addEventListener("click", () => {
    state.yaw = -0.65; state.pitch = 0.35; state.zoom = 0.55;
  });

  function resizeCanvas(){
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const rect = cv.getBoundingClientRect();
    const w = Math.max(2, Math.floor(rect.width * dpr));
    const h = Math.max(2, Math.floor(rect.height * dpr));
    if (cv.width !== w || cv.height !== h){
      cv.width = w; cv.height = h;
    }
  }
  window.addEventListener("resize", resizeCanvas);

  cv.addEventListener("mousedown", (e) => {
    state.dragging = true;
    state.lastX = e.clientX;
    state.lastY = e.clientY;
  });
  window.addEventListener("mouseup", () => state.dragging = false);
  window.addEventListener("mousemove", (e) => {
    if (!state.dragging) return;
    const dx = e.clientX - state.lastX;
    const dy = e.clientY - state.lastY;
    state.lastX = e.clientX;
    state.lastY = e.clientY;

    state.yaw += dx * 0.0075;
    state.pitch += dy * 0.0075;
    state.pitch = clamp(state.pitch, -1.35, 1.35);
  });

  cv.addEventListener("wheel", (e) => {
    e.preventDefault();
    const s = Math.sign(e.deltaY);
    state.zoom *= (s > 0) ? 0.92 : 1.09;
    state.zoom = clamp(state.zoom, 0.35, 1.35);
  }, { passive:false });

  
  function deg2rad(d){ return d * Math.PI / 180; }

  function latticeVectors(a,b,c, alphaDeg, betaDeg, gammaDeg){
    const alpha = deg2rad(alphaDeg);
    const beta  = deg2rad(betaDeg);
    const gamma = deg2rad(gammaDeg);

    const ca = Math.cos(alpha), cb = Math.cos(beta), cg = Math.cos(gamma);
    const sg = Math.sin(gamma);

    
    const ax = a, ay = 0, az = 0;

    
    const bx = b * cg;
    const by = b * sg;
    const bz = 0;

    
    
    
    
    
    const cx = c * cb;
    const cy = c * ( (ca - cb*cg) / (sg || 1e-6) );

    let cz2 = c*c - cx*cx - cy*cy;
    if (cz2 < 1e-10) cz2 = 1e-10; 
    const cz = Math.sqrt(cz2);

    return {
      a: {x:ax,y:ay,z:az},
      b: {x:bx,y:by,z:bz},
      c: {x:cx,y:cy,z:cz},
    };
  }

  function add(u,v){ return {x:u.x+v.x, y:u.y+v.y, z:u.z+v.z}; }
  function sub(u,v){ return {x:u.x-v.x, y:u.y-v.y, z:u.z-v.z}; }
  function mul(u,s){ return {x:u.x*s, y:u.y*s, z:u.z*s}; }

  function centroid(points){
    let x=0,y=0,z=0;
    for (const p of points){ x+=p.x; y+=p.y; z+=p.z; }
    const n = points.length || 1;
    return {x:x/n,y:y/n,z:z/n};
  }

  
  function cellGeometry(){
    const v = latticeVectors(state.a, state.b, state.c, state.alpha, state.beta, state.gamma);
    const O = {x:0,y:0,z:0};
    const A = v.a;
    const B = v.b;
    const C = v.c;

    const P0 = O;
    const P1 = A;
    const P2 = B;
    const P3 = add(A,B);
    const P4 = C;
    const P5 = add(A,C);
    const P6 = add(B,C);
    const P7 = add(add(A,B),C);

    const corners = [P0,P1,P2,P3,P4,P5,P6,P7];

    const edges = [
      [0,1],[0,2],[1,3],[2,3],
      [4,5],[4,6],[5,7],[6,7],
      [0,4],[1,5],[2,6],[3,7]
    ];

    return { corners, edges, v };
  }

    function latticePointsForCell(vectors){
    
    
    if (state.lattice === "none") return [];

    const pts = [];

    
    const cornersFrac = [
      [0,0,0],[1,0,0],[0,1,0],[1,1,0],
      [0,0,1],[1,0,1],[0,1,1],[1,1,1],
    ];
    for (const f of cornersFrac) pts.push({fx:f[0], fy:f[1], fz:f[2]});

    
    if (state.lattice === "base"){
      pts.push({fx:0.5, fy:0.5, fz:0.0});
      pts.push({fx:0.5, fy:0.5, fz:1.0});
    }

    
    if (state.lattice === "bcc"){
      pts.push({fx:0.5, fy:0.5, fz:0.5});
    }

    
    if (state.lattice === "fcc"){
      pts.push({fx:0.5, fy:0.5, fz:0.0});
      pts.push({fx:0.5, fy:0.0, fz:0.5});
      pts.push({fx:0.0, fy:0.5, fz:0.5});
      pts.push({fx:0.5, fy:0.5, fz:1.0});
      pts.push({fx:0.5, fy:1.0, fz:0.5});
      pts.push({fx:1.0, fy:0.5, fz:0.5});
    }

    
    const A = vectors.a, B = vectors.b, C = vectors.c;
    const out = [];
    for (const p of pts){
      const pos = add(add(mul(A,p.fx), mul(B,p.fy)), mul(C,p.fz));
      out.push(pos);
    }
    return out;
  }

  function replicatedCells(baseCorners, edges, vectors){
    
    const A = vectors.a, B = vectors.b, C = vectors.c;
    const allEdges = [];
    const allPoints = [];
    const base = baseCorners;

    
    const cellOffsets = [];
    for (let i=-1;i<=1;i++){
      for (let j=-1;j<=1;j++){
        for (let k=-1;k<=1;k++){
          cellOffsets.push(add(add(mul(A,i), mul(B,j)), mul(C,k)));
        }
      }
    }

    let idxOffset = 0;
    for (const off of cellOffsets){
      const pts = base.map(p => add(p, off));
      for (const p of pts) allPoints.push(p);
      for (const e of edges) allEdges.push([e[0] + idxOffset, e[1] + idxOffset]);
      idxOffset += 8;
    }

    return { points: allPoints, edges: allEdges };
  }

  
  function rotateY(p, a){
    const c = Math.cos(a), s = Math.sin(a);
    return { x: p.x*c + p.z*s, y: p.y, z: -p.x*s + p.z*c };
  }
  function rotateX(p, a){
    const c = Math.cos(a), s = Math.sin(a);
    return { x: p.x, y: p.y*c - p.z*s, z: p.y*s + p.z*c };
  }

  function project(p, w, h){
  
  let q = rotateY(p, state.yaw);
  q = rotateX(q, state.pitch);

  
  q = mul(q, state.zoom);

  
  return {
    x: (w*0.5) + q.x*240,
    y: (h*0.5) - q.y*240,
    z: q.z,   
    k: 1      
  };
}

  function drawTextLabel(text, x, y){
    ctx.save();
    ctx.font = "12px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.fillStyle = "rgba(229,231,235,.92)";
    ctx.strokeStyle = "rgba(2,6,23,.85)";
    ctx.lineWidth = 4;
    ctx.strokeText(text, x+6, y-6);
    ctx.fillText(text, x+6, y-6);
    ctx.restore();
  }

  
  function normAngle(a){
    while (a <= -Math.PI) a += Math.PI*2;
    while (a > Math.PI) a -= Math.PI*2;
    return a;
  }

  function shortestArc(a1, a2){
    const d = normAngle(a2 - a1);
    return { start: a1, end: a1 + d, anticlockwise: d < 0, delta: d };
  }

  function roundRectPath(x, y, w, h, r){
    const rr = Math.max(0, Math.min(r, Math.min(w, h) / 2));
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function drawAngleWedge(cx, cy, a1, a2, r, fill, stroke, label){
    const arc = shortestArc(a1, a2);
    const mid = arc.start + arc.delta / 2;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, arc.start, arc.end, arc.anticlockwise);
    ctx.closePath();

    ctx.fillStyle = fill;
    ctx.fill();

    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1.25;
    ctx.stroke();

    const tx = cx + Math.cos(mid) * (r + 12);
    const ty = cy + Math.sin(mid) * (r + 12);

    ctx.fillStyle = "rgba(226,232,240,.95)";
    ctx.font = "800 14px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, tx, ty);

    ctx.restore();
  }

  function drawMiniAngleDiagram(px, py, dα, dβ, dγ){
    const pw = 260, ph = 190;

    
    px = clamp(px, 8, cv.width - pw - 8);
    py = clamp(py, 8, cv.height - ph - 8);

    ctx.save();

    
    roundRectPath(px, py, pw, ph, 14);
    ctx.fillStyle = "rgba(2,6,23,.55)";
    ctx.fill();
    ctx.strokeStyle = "rgba(148,163,184,.22)";
    ctx.lineWidth = 1;
    ctx.stroke();

        const sum = Math.max(1e-6, (dα + dβ + dγ));
        const k = 180 / sum;

        
        
        const aDeg = clamp(dα * k, 1, 179);
        const bDeg = clamp(dβ * k, 1, 179);

        const alpha = aDeg * Math.PI / 180;
        const beta  = bDeg * Math.PI / 180;

        
        const d1 = {x: Math.cos(alpha), y: Math.sin(alpha)};
        const d2 = {x: Math.cos(Math.PI - beta), y: Math.sin(Math.PI - beta)};
        const denom = d1.x * d2.y - d1.y * d2.x;

        
        let C0 = {x: 0.68, y: 0.62};
        if (Math.abs(denom) > 1e-6){
          const t1 = d2.y / denom; 
          C0 = {x: t1 * d1.x, y: t1 * d1.y};
        }

        
        const maxW = pw - 44;
        const maxH = ph - 86;
        const scale = Math.max(28, Math.min(maxW, maxH / Math.max(0.001, C0.y)));

        const baseY = py + ph - 48;
        const baseX = px + (pw - scale) * 0.5;

        const A = {x: baseX, y: baseY};
        const B = {x: baseX + scale, y: baseY};
        const C = {x: baseX + C0.x*scale, y: baseY - C0.y*scale};

        
        ctx.strokeStyle = "rgba(226,232,240,.72)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(B.x, B.y);
        ctx.lineTo(C.x, C.y);
        ctx.closePath();
        ctx.stroke();

    
    const ang = (V, P) => Math.atan2(P.y - V.y, P.x - V.x);
    drawAngleWedge(A.x, A.y, ang(A, C), ang(A, B), 18, "rgba(250,204,21,.18)", "rgba(250,204,21,.55)", "α");
    drawAngleWedge(B.x, B.y, ang(B, A), ang(B, C), 18, "rgba(34,197,94,.18)",  "rgba(34,197,94,.55)",  "β");
    drawAngleWedge(C.x, C.y, ang(C, B), ang(C, A), 18, "rgba(236,72,153,.18)", "rgba(236,72,153,.55)", "γ");

    
    ctx.fillStyle = "rgba(226,232,240,.9)";
    ctx.font = "700 12px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("A", A.x - 10, A.y + 12);
    ctx.fillText("B", B.x + 10, B.y + 12);
    ctx.fillText("C", C.x + 10, C.y - 12);

    
    const mid = (P, Q) => ({x:(P.x+Q.x)/2, y:(P.y+Q.y)/2});
    const mAB = mid(A, B), mAC = mid(A, C), mBC = mid(B, C);

    ctx.font = "800 12px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.fillStyle = "rgba(226,232,240,.85)";
    ctx.fillText("c", mAB.x, mAB.y + 12);
    ctx.fillText("b", mAC.x - 10, mAC.y);
    ctx.fillText("a", mBC.x + 10, mBC.y);

    
    ctx.font = "700 11px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.fillStyle = "rgba(226,232,240,.78)";
    ctx.fillText(`α ${dα}°   β ${dβ}°   γ ${dγ}°`, px + pw/2, py + ph - 18);

    ctx.restore();
  }

function render(){
    resizeCanvas();
    const w = cv.width, h = cv.height;

    
    ctx.fillStyle = "rgb(6,10,18)";
    ctx.fillRect(0,0,w,h);

    const { corners, edges, v } = cellGeometry();

    
    let latticePts = latticePointsForCell(v);

    
    let points = corners;
    let eds = edges;
    let latticePtsAll = latticePts;

    if (state.repeat){
      const rep = replicatedCells(corners, edges, v);
      points = rep.points;
      eds = rep.edges;

      
      const A = v.a, B = v.b, C = v.c;
      const all = [];
      for (let i=-1;i<=1;i++){
        for (let j=-1;j<=1;j++){
          for (let k=-1;k<=1;k++){
            const off = add(add(mul(A,i), mul(B,j)), mul(C,k));
            for (const p of latticePts) all.push(add(p, off));
          }
        }
      }
      latticePtsAll = all;
    }

    
    const center = centroid(points);
    const centered = points.map(p => sub(p, center));
    const centeredLattice = latticePtsAll.map(p => sub(p, center));

    
    const projPoints = centered.map(p => project(p, w, h));
    const projLattice = centeredLattice.map(p => project(p, w, h));

    
    const edgeDraw = eds.map(e => {
      const p0 = projPoints[e[0]], p1 = projPoints[e[1]];
      return { e, z: (p0.z + p1.z) * 0.5, p0, p1 };
    }).sort((a,b) => a.z - b.z);

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (const ed of edgeDraw){
      const {p0,p1} = ed;
      const zFade = clamp(1 - (ed.z+1.8)/4.5, 0.20, 1);
      ctx.strokeStyle = `rgba(148,163,184,${0.85*zFade})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();
    }

    
    const O = {x:0,y:0,z:0};
    const A = sub(v.a, O);
    const B = sub(v.b, O);
    const C = sub(v.c, O);
    const axisScale = 1.15;

    const o = project(sub(O, center), w, h);
    const pa = project(sub(mul(A, axisScale), center), w, h); 
    const pb = project(sub(mul(B, axisScale), center), w, h); 
    const pc = project(sub(mul(C, axisScale), center), w, h); 

    const drawAxis = (p, style) => {
      ctx.strokeStyle = style;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(o.x, o.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();

      
      const dx = p.x - o.x, dy = p.y - o.y;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len, uy = dy / len;
      const px2 = -uy, py2 = ux;

      ctx.fillStyle = style;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - ux*10 + px2*5, p.y - uy*10 + py2*5);
      ctx.lineTo(p.x - ux*10 - px2*5, p.y - uy*10 - py2*5);
      ctx.closePath();
      ctx.fill();
    };

    if (state.showAxes){
      drawAxis(pa, colors.a);
      drawAxis(pb, colors.b);
      drawAxis(pc, colors.c);

      if (state.showLabels){
        drawTextLabel("b", pa.x, pa.y);
        drawTextLabel("c", pb.x, pb.y);
        drawTextLabel("a", pc.x, pc.y);
      }
    } else if (state.showLabels){
      
      drawTextLabel("b", pa.x, pa.y);
      drawTextLabel("c", pb.x, pb.y);
      drawTextLabel("a", pc.x, pc.y);
    }

    if (state.showAngles){
      const ang = (p) => Math.atan2(p.y - o.y, p.x - o.x);

      const alphaDeg = Math.round(viewMap.getAlpha());
      const betaDeg  = Math.round(viewMap.getBeta());
      const gammaDeg = Math.round(viewMap.getGamma());

      
      drawAngleWedge(o.x, o.y, ang(pa), ang(pb), 32,
        "rgba(250,204,21,.12)", "rgba(250,204,21,.45)", "α");

      drawAngleWedge(o.x, o.y, ang(pc), ang(pb), 32,
        "rgba(34,197,94,.12)", "rgba(34,197,94,.45)", "β");

      drawAngleWedge(o.x, o.y, ang(pc), ang(pa), 32,
        "rgba(236,72,153,.12)", "rgba(236,72,153,.45)", "γ");

      
      drawMiniAngleDiagram(14, h - 14 - 190, alphaDeg, betaDeg, gammaDeg);
    }

    
    
    const dots = projLattice.map(p => ({p, z:p.z})).sort((a,b) => a.z - b.z);
    for (const d of dots){
      const {p} = d;
      const zFade = clamp(1 - (d.z+1.9)/4.8, 0.15, 1);
      const r = 40;

      if (state.showAlpha){
        
        ctx.fillStyle = "rgb(226,232,240)";
        ctx.strokeStyle = "rgb(2,6,23)";
      } else {
        
        ctx.fillStyle = `rgba(226,232,240,${0.85*zFade})`;
        ctx.strokeStyle = `rgba(2,6,23,${0.9*zFade})`;
      }

ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI*2);
      ctx.fill();
      ctx.stroke();
    }

    requestAnimationFrame(render);
  }

  
  function init(){
    
    $("stepBody").textContent = steps[0].body;
    $("calloutBody").textContent = steps[0].callout;

    
    applySystemPreset("cubic");
    enforceConstraints();
    syncUIFromState();

    
    setStep(0);

    render();
  }

  init();
})();
