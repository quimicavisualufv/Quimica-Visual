(function () {
  const cfg = Object.assign(
    {
      functionUrl: '',
      anonKey: '',
      siteKey: 'principal',
      position: 'bottom-left',
      label: 'visitas',
      zIndex: 9999
    },
    window.VisitWidgetConfig || {}
  )

const isLocalFile = window.location.protocol === 'file:' || window.location.origin === 'null'

  if (!cfg.functionUrl && !isLocalFile) {

    return
  }

  const existingStyle = document.getElementById('vw-unique-widget-style')
  if (existingStyle) existingStyle.remove()
  const style = document.createElement('style')
  style.id = 'vw-unique-widget-style'
  style.textContent = `
    .vw-unique-widget {
      position: fixed;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      border-radius: 999px;
      background: rgba(14, 14, 18, 0.78);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #ffffff;
      font-family: Inter, Arial, sans-serif;
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.28);
      z-index: ${String(cfg.zIndex)};
      user-select: none;
      pointer-events: none;
    }
    .vw-unique-widget.bottom-right { right: 18px; bottom: 18px; }
    .vw-unique-widget.bottom-left { left: 18px; bottom: 18px; }
    .vw-unique-widget.top-right { right: 18px; top: 18px; }
    .vw-unique-widget.top-left { left: 18px; top: 18px; }
    .vw-unique-widget .vw-eye {
      width: 18px;
      height: 18px;
      display: block;
      opacity: 0.95;
      flex: 0 0 auto;
    }
    .vw-unique-widget .vw-number {
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.02em;
      line-height: 1;
    }
    .vw-unique-widget .vw-label {
      font-size: 13px;
      font-weight: 500;
      line-height: 1;
      opacity: 0.82;
    }
    .vw-unique-widget .vw-divider {
      width: 1px;
      height: 14px;
      background: rgba(255, 255, 255, 0.12);
    }
    .vw-unique-widget .vw-loading {
      opacity: 0.72;
    }
  `
  document.head.appendChild(style)

  document.querySelectorAll('.vw-unique-widget[data-visit-widget="unique"]').forEach((node) => node.remove())

  const widget = document.createElement('div')
  widget.id = 'vw-unique-widget-root'
  widget.dataset.visitWidget = 'unique'
  widget.className = `vw-unique-widget ${cfg.position}`
  widget.setAttribute('aria-live', 'polite')
  widget.innerHTML = `
    <svg class="vw-eye" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M1.5 12C3.7 7.8 7.4 5.5 12 5.5C16.6 5.5 20.3 7.8 22.5 12C20.3 16.2 16.6 18.5 12 18.5C7.4 18.5 3.7 16.2 1.5 12Z" stroke="currentColor" stroke-width="1.8"/>
      <circle cx="12" cy="12" r="3.2" fill="currentColor"/>
    </svg>
    <span class="vw-number vw-loading">...</span>
    <span class="vw-divider"></span>
    <span class="vw-label">${cfg.label}</span>
  `
  document.body.appendChild(widget)

  const numberEl = widget.querySelector('.vw-number')

  async function loadVisits() {
    const headers = {
      'Content-Type': 'application/json'
    }

    if (cfg.anonKey) {
      headers.apikey = cfg.anonKey
      headers.Authorization = `Bearer ${cfg.anonKey}`
    }

    const response = await fetch(cfg.functionUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ site_key: cfg.siteKey })
    })

if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    return response.json()
  }

if (isLocalFile) {
    numberEl.textContent = '0'
    numberEl.classList.remove('vw-loading')
    widget.title = 'Contador indisponível em arquivo local'
    window.VisitWidget = { refresh: () => Promise.resolve({ views: 0, local_file: true }) }
    return
  }


  loadVisits()
    .then((data) => {
      const views = Number(data && data.views ? data.views : 0)
      numberEl.textContent = new Intl.NumberFormat('pt-BR').format(views)
      numberEl.classList.remove('vw-loading')
      widget.title = data && data.unique_today === false
        ? 'Visitante já contabilizado hoje'
        : 'Visitante único contabilizado hoje'
    })
    .catch(() => {
      numberEl.textContent = '0'
      numberEl.classList.remove('vw-loading')
      widget.title = 'Não foi possível carregar o contador'
    })

  window.VisitWidget = {
    refresh: loadVisits
  }
})()
