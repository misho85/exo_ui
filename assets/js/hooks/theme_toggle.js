const ExoThemeToggle = {
  mounted() {
    this._apply(this._current())

    this._handlers = []
    this.el.querySelectorAll('[data-theme-value]').forEach(btn => {
      const handler = () => {
        const value = btn.getAttribute('data-theme-value')
        this._apply(value)
        localStorage.setItem('exo-theme', value)
      }
      btn.addEventListener('click', handler)
      this._handlers.push({ btn, handler })
    })
  },

  destroyed() {
    this._handlers?.forEach(({ btn, handler }) =>
      btn.removeEventListener('click', handler)
    )
  },

  _current() {
    return localStorage.getItem('exo-theme') || 'system'
  },

  _apply(theme) {
    const root = document.documentElement
    // Update active state on buttons
    this.el.querySelectorAll('[data-theme-value]').forEach(btn => {
      btn.toggleAttribute('data-active', btn.getAttribute('data-theme-value') === theme)
    })

    if (theme === 'system') {
      root.removeAttribute('data-theme')
    } else {
      root.setAttribute('data-theme', theme)
    }
  }
}

export { ExoThemeToggle }
