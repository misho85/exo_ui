const ExoThemeToggle = {
  mounted() { this._bind() },
  updated() { this._bind() },
  destroyed() { this._unbind() },

  _bind() {
    this._unbind()
    this._apply(this._current())
    this.el.setAttribute('data-ready', '')

    this._onClick = (e) => {
      const btn = e.target.closest('[data-theme-value]')
      if (!btn || !this.el.contains(btn)) return
      const value = btn.getAttribute('data-theme-value')
      this._apply(value)
      this._writeTheme(value)
      document.dispatchEvent(new CustomEvent('exo:theme-change', { detail: value }))
    }
    this.el.addEventListener('click', this._onClick)
    this._onThemeChange = (event) => this._apply(event.detail)
    this._onStorage = (event) => {
      if (event.key === 'exo-theme' || event.key === null) this._apply(this._current())
    }
    document.addEventListener('exo:theme-change', this._onThemeChange)
    window.addEventListener('storage', this._onStorage)
  },

  _unbind() {
    if (this._onClick) this.el.removeEventListener('click', this._onClick)
    if (this._onThemeChange) document.removeEventListener('exo:theme-change', this._onThemeChange)
    if (this._onStorage) window.removeEventListener('storage', this._onStorage)
    if (this.el) this.el.removeAttribute('data-ready')
    this._onClick = null
  },

  _current() {
    try {
      return localStorage.getItem('exo-theme') || 'system'
    } catch (_err) {
      return 'system'
    }
  },

  _apply(theme) {
    if (!['light', 'dark', 'system'].includes(theme)) theme = 'system'
    const root = document.documentElement
    // Update active state on buttons
    this.el.querySelectorAll('[data-theme-value]').forEach(btn => {
      const active = btn.getAttribute('data-theme-value') === theme
      btn.toggleAttribute('data-active', active)
      btn.setAttribute('aria-pressed', active ? 'true' : 'false')
    })

    if (theme === 'system') {
      root.removeAttribute('data-theme')
    } else {
      root.setAttribute('data-theme', theme)
    }
  },

  _writeTheme(theme) {
    try {
      localStorage.setItem('exo-theme', theme)
    } catch (_err) {}
  }
}

export { ExoThemeToggle }
