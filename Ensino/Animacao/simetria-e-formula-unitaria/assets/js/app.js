const STAGE = document.getElementById('stage');
const TABS = [
  ['tab-cubicas', 'cubicas'],
  ['tab-celulas', 'celulas'],
  ['tab-orbits', 'orbits'],
  ['tab-fracoes', 'fracoes'],
  ['tab-modelos', 'modelos'],
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
  for(const [btnId] of TABS){
    const el = document.getElementById(btnId);
    const on = btnId === id;
    el.setAttribute('aria-selected', on ? 'true' : 'false');
  }
}

for(const [btnId, key] of TABS){
  document.getElementById(btnId).addEventListener('click', () => {
    setActive(btnId);
    load(key);
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
