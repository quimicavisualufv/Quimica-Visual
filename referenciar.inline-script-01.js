const copyButtons = document.querySelectorAll('[data-copy-target]');
const generatorInputs = document.querySelectorAll('.gerador-abnt-container input');
const outCitacao = document.getElementById('citacao-gerada');
const outLegenda = document.getElementById('abnt-legenda');
const checkLocal = document.getElementById('abnt-check-local');
const inputLocal = document.getElementById('abnt-local');
const checkEditora = document.getElementById('abnt-check-editora');
const inputEditora = document.getElementById('abnt-editora');

function escapeHTML(value) {
  return value.replace(/[&<>"]/g, function(character) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;'
    }[character];
  });
}

function atualizarCitacao() {
  const autores = document.getElementById('abnt-autores').value.trim();
  const titulo = document.getElementById('abnt-titulo').value.trim();
  const ano = document.getElementById('abnt-ano').value.trim();
  const url = document.getElementById('abnt-url').value.trim();
  const data = document.getElementById('abnt-data').value.trim();
  inputLocal.disabled = !checkLocal.checked;
  inputEditora.disabled = !checkEditora.checked;
  const localFinal = checkLocal.checked ? inputLocal.value.trim() : '[S. l.]';
  const editoraFinal = checkEditora.checked ? inputEditora.value.trim() : '[s. n.]';
  let localEditoraTexto = `${localFinal}: ${editoraFinal}`;
  if (!checkLocal.checked && !checkEditora.checked) {
    localEditoraTexto = '[S. l.: s. n.]';
  }
  const citacaoFinal = `${escapeHTML(autores)}. <strong>${escapeHTML(titulo)}</strong>. ${escapeHTML(localEditoraTexto)}, ${escapeHTML(ano)}. Disponível em: ${escapeHTML(url)}. Acesso em: ${escapeHTML(data)}.`;
  outCitacao.innerHTML = citacaoFinal;
  let legendaTexto = '';
  if (!checkLocal.checked) legendaTexto += '<strong>[S. l.]</strong> significa <em>Sine loco</em> (sem local). ';
  if (!checkEditora.checked) legendaTexto += '<strong>[s. n.]</strong> significa <em>Sine nomine</em> (sem editora/instituição).';
  outLegenda.innerHTML = legendaTexto;
}

async function copiarTexto(texto, feedback) {
  try {
    await navigator.clipboard.writeText(texto);
    feedback.textContent = 'Copiado.';
  } catch (error) {
    const campoTemporario = document.createElement('textarea');
    campoTemporario.value = texto;
    document.body.appendChild(campoTemporario);
    campoTemporario.select();
    document.execCommand('copy');
    document.body.removeChild(campoTemporario);
    feedback.textContent = 'Copiado.';
  }
}

copyButtons.forEach(function(button) {
  button.addEventListener('click', function() {
    const target = document.getElementById(button.dataset.copyTarget);
    const feedback = document.getElementById(`feedback-${button.dataset.copyTarget}`);
    const texto = button.dataset.copyMode === 'value' ? target.value : target.textContent.trim();
    copiarTexto(texto, feedback);
  });
});

generatorInputs.forEach(function(input) {
  input.addEventListener('input', atualizarCitacao);
  input.addEventListener('change', atualizarCitacao);
});

atualizarCitacao();
