const frameIons = document.getElementById('frame-ions');
const frameCov = document.getElementById('frame-cov');
const tabs = [...document.querySelectorAll('.tab')];

const views = {
  ions: 'views/ions.html',
  cov: 'views/covalente.html'
};

function ensureLoaded(frame, src){
  const normalized = new URL(src, window.location.href).href;
  if(frame.dataset.loaded !== normalized){
    frame.src = src;
    frame.dataset.loaded = normalized;
  }
}

function setView(view){
  tabs.forEach(tab => tab.classList.toggle('active', tab.dataset.view === view));
  frameIons.classList.toggle('active', view === 'ions');
  frameCov.classList.toggle('active', view === 'cov');

  if(view === 'ions') ensureLoaded(frameIons, views.ions);
  if(view === 'cov') ensureLoaded(frameCov, views.cov);
}

tabs.forEach(tab => tab.addEventListener('click', () => setView(tab.dataset.view)));
setView('ions');
