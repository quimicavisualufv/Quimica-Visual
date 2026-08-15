(function () {
  var STORAGE_KEY = 'simoens.xadrez.voice.enabled.v1';
  var active = false;
  var currentUtterance = null;
  var lastMessage = '';
  var liveRegion = null;
  var speechQueue = Promise.resolve();
  var speechToken = 0;
  var currentSelectionMessage = '';
  var currentSelectionDetail = null;

  function isChessPage() {
    return /\/Ensino\/jogo\/xadrez-quimico\/?(?:index\.html)?/i.test(decodeURIComponent(location.pathname).replace(/\\/g, '/'));
  }

  function normalize(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function upperSquare(square) {
    return String(square || '').toUpperCase();
  }

  function joinSquares(squares) {
    if (!squares || !squares.length) return 'nenhuma opção disponível';
    return squares.map(upperSquare).join(', ');
  }

  function ensureLiveRegion() {
    if (liveRegion && document.body.contains(liveRegion)) return liveRegion;
    liveRegion = document.createElement('div');
    liveRegion.id = 'simoens-xadrez-voice-live';
    liveRegion.setAttribute('aria-live', 'assertive');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.position = 'absolute';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.padding = '0';
    liveRegion.style.margin = '-1px';
    liveRegion.style.overflow = 'hidden';
    liveRegion.style.clip = 'rect(0, 0, 0, 0)';
    liveRegion.style.whiteSpace = 'nowrap';
    liveRegion.style.border = '0';
    document.body.appendChild(liveRegion);
    return liveRegion;
  }

  function stop() {
    speechToken += 1;
    currentUtterance = null;
    speechQueue = Promise.resolve();
    try {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    } catch (error) {}
  }

  function applySharedVoiceSettings(utterance) {
    if (!utterance) return utterance;
    if (window.SiMoEnsA11yVoice && typeof window.SiMoEnsA11yVoice.applyToUtterance === 'function') {
      return window.SiMoEnsA11yVoice.applyToUtterance(utterance);
    }
    var settings = window.__simoensA11yVoiceSettings || {};
    var volume = Number.isFinite(parseFloat(settings.volume)) ? parseFloat(settings.volume) : 1;
    var rate = Number.isFinite(parseFloat(settings.rate)) ? parseFloat(settings.rate) : 0.95;
    var gender = settings.gender === 'male' ? 'male' : 'female';
    utterance.lang = 'pt-BR';
    utterance.volume = Math.max(0, Math.min(1, volume));
    utterance.rate = Math.max(0.5, Math.min(3, rate));
    utterance.pitch = gender === 'male' ? 0.55 : 1.45;
    return utterance;
  }

  function speakNow(message, force) {
    message = normalize(message);
    if (!message) return Promise.resolve();
    if (!force && !active) return Promise.resolve();
    lastMessage = message;
    var token = speechToken;
    var live = ensureLiveRegion();
    live.textContent = '';
    setTimeout(function () {
      if (token === speechToken) live.textContent = message;
    }, 20);
    if (!('speechSynthesis' in window) || !window.SpeechSynthesisUtterance) {
      return new Promise(function (resolve) {
        setTimeout(resolve, Math.min(3500, Math.max(900, message.length * 45)));
      });
    }
    return new Promise(function (resolve) {
      var done = false;
      var utterance = new SpeechSynthesisUtterance(message);
      applySharedVoiceSettings(utterance);
      var finish = function () {
        if (done) return;
        done = true;
        if (currentUtterance === utterance) currentUtterance = null;
        resolve();
      };
      utterance.onend = finish;
      utterance.onerror = finish;
      currentUtterance = utterance;
      try {
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        finish();
      }
      setTimeout(finish, Math.min(25000, Math.max(2500, message.length * 120)));
    });
  }

  function speak(message, force) {
    message = normalize(message);
    if (!message) return Promise.resolve();
    if (!force && !active) return Promise.resolve();
    speechQueue = speechQueue.catch(function () {}).then(function () {
      return speakNow(message, force);
    });
    return speechQueue;
  }

  function waitUntilIdle() {
    if (!active) return Promise.resolve();
    return speechQueue.catch(function () {});
  }

  function pieceText(piece) {
    if (!piece) return 'peça não identificada';
    var pieceName = normalize(piece.pieceName || piece.piece || piece.type);
    var glassware = normalize(piece.glassware || piece.name || 'vidraria não identificada');
    var square = upperSquare(piece.square || piece.to || piece.position);
    return [pieceName, glassware, square].filter(Boolean).join(', ');
  }

  function kingText(king) {
    if (!king) return 'posição do rei não identificada';
    return pieceText(king);
  }

  function colorLabel(color) {
    return color === 'b' ? 'pretas' : 'brancas';
  }

  function sideLabel(color) {
    return color === 'b' ? 'inimigo' : 'seu';
  }

  function describeSelect(detail) {
    var options = detail.options || [];
    return 'Selecionado: ' + pieceText(detail.piece) + '. Opções: ' + joinSquares(options) + '.' + describeTactical(detail);
  }

  function describeMove(detail) {
    var moving = detail.moving || {};
    var from = upperSquare(moving.from || detail.from);
    var to = upperSquare(moving.to || detail.to || moving.square);
    var base = '';
    if (moving.color === 'b') {
      base = 'Movimento do inimigo: ' + normalize(moving.pieceName) + ', ' + normalize(moving.glassware) + ', de ' + from + ' para ' + to + '.';
      if (detail.kings && detail.kings.w) base += ' Seu rei: ' + kingText(detail.kings.w) + '.';
    } else {
      base = 'Movimento realizado: ' + normalize(moving.pieceName) + ', ' + normalize(moving.glassware) + ', de ' + from + ' para ' + to + '.';
      if (detail.kings && detail.kings.b) base += ' Rei inimigo: ' + kingText(detail.kings.b) + '.';
    }
    return base + describeThreat(detail) + describeTactical(detail);
  }

  function describeCaptureCard(card) {
    if (!card) return '';
    var title = normalize(card.title || 'Vidraria capturada');
    var name = normalize(card.name || 'vidraria');
    var heading = normalize(card.heading || 'Uso em laboratório');
    var desc = normalize(card.desc || 'Descrição não encontrada.');
    return ' ' + title + '. ' + name + '. ' + heading + ': ' + desc;
  }

  function describeCapture(detail) {
    var moving = detail.moving || {};
    var captured = detail.captured || {};
    var from = upperSquare(moving.from || detail.from);
    var to = upperSquare(moving.to || detail.to || moving.square || captured.square);
    var message = '';
    if (moving.color === 'b') {
      message = 'Movimento do inimigo. Capturado o ' + normalize(captured.pieceName) + ', ' + normalize(captured.glassware) + ' em ' + upperSquare(captured.square || to) + '. Peça atacante: ' + normalize(moving.pieceName) + ', ' + normalize(moving.glassware) + ', de ' + from + ' para ' + to + '.';
      if (detail.kings && detail.kings.w) message += ' Seu rei: ' + kingText(detail.kings.w) + '.';
    } else {
      message = 'Captura realizada. Capturado o ' + normalize(captured.pieceName) + ', ' + normalize(captured.glassware) + ' em ' + upperSquare(captured.square || to) + '. Peça atacante: ' + normalize(moving.pieceName) + ', ' + normalize(moving.glassware) + ', de ' + from + ' para ' + to + '.';
      if (detail.kings && detail.kings.b) message += ' Rei inimigo: ' + kingText(detail.kings.b) + '.';
    }
    return message + describeCaptureCard(detail.captureCard) + describeThreat(detail) + describeTactical(detail);
  }

  function describeThreat(detail) {
    if (!detail) return '';
    if (detail.checkmate) {
      var kingMate = detail.inCheckColor === 'b' ? detail.kings && detail.kings.b : detail.kings && detail.kings.w;
      var winner = detail.inCheckColor === 'b' ? 'brancas' : 'pretas';
      return ' Xeque-mate. Rei em xeque: ' + kingText(kingMate) + '. ' + winner + ' vencem.';
    }
    if (detail.check) {
      if (detail.inCheckColor === 'w') {
        return ' Atenção: xeque contra seu rei. Rei em xeque: ' + kingText(detail.kings && detail.kings.w) + '.';
      }
      return ' Xeque contra o rei inimigo. Rei em xeque: ' + kingText(detail.kings && detail.kings.b) + '.';
    }
    return '';
  }

  function pieceWithoutSquare(piece) {
    if (!piece) return 'peça não identificada';
    var pieceName = normalize(piece.pieceName || piece.piece || piece.type);
    var glassware = normalize(piece.glassware || piece.name || 'vidraria não identificada');
    return [pieceName, glassware].filter(Boolean).join(', ');
  }

  function tacticalItemText(item, isEnemy) {
    if (!item) return '';
    var attacker = pieceWithoutSquare(item.attacker);
    var target = pieceWithoutSquare(item.target);
    var from = upperSquare((item.attacker && item.attacker.square) || item.from);
    var to = upperSquare((item.target && item.target.square) || item.to);
    if (isEnemy) return attacker + ' em ' + from + ' ameaça capturar ' + target + ' em ' + to;
    return attacker + ' em ' + from + ' pode capturar ' + target + ' em ' + to;
  }

  function describeTactical(detail) {
    var tactical = detail && detail.tactical;
    if (!tactical) return '';
    var enemyThreats = tactical.enemyThreats || [];
    var allyCaptures = tactical.allyCaptures || [];
    var parts = [];
    if (enemyThreats.length) {
      var enemyShown = enemyThreats.slice(0, 4).map(function (item) { return tacticalItemText(item, true); }).filter(Boolean);
      var enemyRestCount = enemyThreats.length - enemyShown.length;
      var enemyRest = enemyRestCount > 0 ? ' Mais ' + enemyRestCount + ' ameaça' + (enemyRestCount === 1 ? '' : 's') + ' inimiga' + (enemyRestCount === 1 ? '' : 's') + ' não lida' + (enemyRestCount === 1 ? '' : 's') + '.' : '';
      parts.push('Atenção. Peças inimigas no alcance de captura: ' + enemyShown.join('; ') + '.' + enemyRest);
    }
    if (allyCaptures.length) {
      var allyShown = allyCaptures.slice(0, 4).map(function (item) { return tacticalItemText(item, false); }).filter(Boolean);
      var allyRestCount = allyCaptures.length - allyShown.length;
      var allyRest = allyRestCount > 0 ? ' Mais ' + allyRestCount + ' captura' + (allyRestCount === 1 ? '' : 's') + ' aliada' + (allyRestCount === 1 ? '' : 's') + ' disponível' + (allyRestCount === 1 ? '' : 'is') + '.' : '';
      parts.push('Peças aliadas no alcance de captura: ' + allyShown.join('; ') + '.' + allyRest);
    }
    return parts.length ? ' ' + parts.join(' ') : '';
  }

  function describeStatus(detail) {
    if (!detail) return '';
    if (detail.status === 'reset') return 'Partida reiniciada. Modo voz do xadrez permanece ativo.';
    if (detail.status === 'blocked') return '';
    if (detail.status === 'cancel') return normalize(detail.message || 'Seleção cancelada.');
    if (detail.status === 'invalid') return normalize(detail.message || 'Movimento inválido.');
    return normalize(detail.message || 'Estado do xadrez atualizado.');
  }

  function describeDetail(detail) {
    detail = detail || {};
    var type = detail.type || detail.action || '';
    if (type === 'select') return describeSelect(detail);
    if (type === 'move') return describeMove(detail);
    if (type === 'capture') return describeCapture(detail);
    if (type === 'status') return describeStatus(detail);
    if (type === 'check') return describeThreat(detail);
    return normalize(detail.message || '');
  }

  function handleEvent(event) {
    var detail = event && event.detail ? event.detail : {};
    var message = describeDetail(detail);
    var type = detail.type || detail.action || '';
    if (type === 'select') {
      currentSelectionDetail = detail;
      currentSelectionMessage = message;
      window.__simoensChessVoiceCurrentSelectionText = message;
    } else if (type === 'move' || type === 'capture' || (type === 'status' && (detail.status === 'reset' || detail.status === 'cancel'))) {
      currentSelectionDetail = null;
      currentSelectionMessage = '';
      window.__simoensChessVoiceCurrentSelectionText = '';
    }
    if (message) speak(message);
  }

  function runAfterSpeech(input, callback) {
    var message = typeof input === 'string' ? normalize(input) : describeDetail(input || {});
    var chain = active ? (message ? speak(message, true) : waitUntilIdle()) : Promise.resolve();
    return chain.then(function () {
      return new Promise(function (resolve) {
        setTimeout(resolve, active ? 450 : 0);
      });
    }).then(function () {
      if (typeof callback === 'function') callback();
    });
  }

  function setActive(value, silent) {
    active = !!value;
    try {
      localStorage.setItem(STORAGE_KEY, active ? '1' : '0');
    } catch (error) {}
    window.dispatchEvent(new CustomEvent('simoens-xadrez-voice-state', { detail: { active: active } }));
    if (!silent) speak(active ? 'Modo voz do Xadrez Químico ativado. Ao clicar em uma peça, vou falar peça, vidraria, posição e opções de movimento. Também aviso capturas disponíveis, capturas realizadas, xeque e xeque-mate. Use os controles de volume, velocidade e voz no widget para ajustar a narração.' : 'Modo voz do Xadrez Químico desativado.', true);
    return active;
  }

  function toggle() {
    return setActive(!active, false);
  }

  function restore() {
    try {
      active = localStorage.getItem(STORAGE_KEY) === '1';
    } catch (error) {
      active = false;
    }
    window.dispatchEvent(new CustomEvent('simoens-xadrez-voice-state', { detail: { active: active } }));
  }

  if (!isChessPage()) return;
  restore();
  ensureLiveRegion();
  window.addEventListener('simoens-chess-voice', handleEvent);
  window.SiMoEnsChessVoice = {
    isActive: function () { return active; },
    setActive: setActive,
    toggle: toggle,
    stop: stop,
    speak: speak,
    waitUntilIdle: waitUntilIdle,
    runAfterSpeech: runAfterSpeech,
    describe: describeDetail,
    getCurrentSelectionText: function () { return currentSelectionMessage || ''; },
    getCurrentSelectionDetail: function () { return currentSelectionDetail; },
    repeat: function () { speak(lastMessage, true); }
  };
})();
