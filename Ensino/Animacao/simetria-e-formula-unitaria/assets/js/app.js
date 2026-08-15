const STAGE = document.getElementById('stage');
const TABS = [
  ['tab-cubicas', 'cubicas', 'Estruturas cúbicas — SC, BCC e FCC'],
  ['tab-celulas', 'celulas', 'Translação — Células Unitárias'],
  ['tab-orbits', 'orbits', 'Método da simetria de translação'],
  ['tab-fracoes', 'fracoes', 'Contagem por frações — Células Unitárias'],
  ['tab-modelos', 'modelos', 'Modelos 3D — posições na célula'],
];

function getCandidates(key){
  return [
    `views/${key}/`,
    `views/${key}.html`,
    `view/${key}/`,
    `view/${key}.html`,
  ];
}

function load(key){
  const [preferred, ...fallbacks] = getCandidates(key);
  STAGE.src = preferred;

  let tried = 0;
  STAGE.onerror = () => {
    if(tried >= fallbacks.length) return;
    STAGE.src = fallbacks[tried++];
  };
}

function setActive(id){
  for(const [btnId, , title] of TABS){
    const el = document.getElementById(btnId);
    const on = btnId === id;
    el.setAttribute('aria-selected', on ? 'true' : 'false');
    el.tabIndex = on ? 0 : -1;
    if(on){
      STAGE.setAttribute('aria-labelledby', btnId);
      STAGE.title = title;
    }
  }
}

for(const [btnId, key] of TABS){
  const button = document.getElementById(btnId);
  button.addEventListener('click', () => {
    setActive(btnId);
    load(key);
  });
  button.addEventListener('keydown', (event) => {
    const index = TABS.findIndex(([id]) => id === btnId);
    let next = index;
    if(event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % TABS.length;
    else if(event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + TABS.length) % TABS.length;
    else if(event.key === 'Home') next = 0;
    else if(event.key === 'End') next = TABS.length - 1;
    else return;
    event.preventDefault();
    document.getElementById(TABS[next][0]).focus();
    document.getElementById(TABS[next][0]).click();
  });
}

window.addEventListener('keydown', (e) => {
  if(e.target && ['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName)) return;
  if(e.key === '1') document.getElementById('tab-cubicas').click();
  if(e.key === '2') document.getElementById('tab-celulas').click();
  if(e.key === '3') document.getElementById('tab-orbits').click();
  if(e.key === '4') document.getElementById('tab-fracoes').click();
  if(e.key === '5') document.getElementById('tab-modelos').click();
});

load('cubicas');
