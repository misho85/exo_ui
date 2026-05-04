/**
 * ExoSidebar hook — manages collapsible sidebar state.
 *
 * Restores collapsed/expanded from localStorage on desktop.
 * Mobile starts closed. Sets data-sidebar-ready on <html> after init.
 */
const ExoSidebar = {
  mounted() {
    this.toggle = this.el.querySelector('[data-exo="sidebar-toggle"]')
    this.trigger = this.el.querySelector('[data-exo="sidebar-hamburger"]')
    this.overlay = this.el.querySelector('[data-exo="sidebar-overlay"]')
    this.panel = this.el.querySelector('[data-exo="sidebar-panel"]')
    if (!this.toggle) return

    this._applyState()

    // Enable CSS transitions after initial state (prevents FOUC)
    requestAnimationFrame(() => {
      document.documentElement.setAttribute('data-sidebar-ready', '')
    })

    this._onTriggerClick = () => this._setExpanded(!this.toggle.checked, { persist: true })
    this._onOverlayClick = () => this._setExpanded(false)
    this._onKeyDown = (event) => {
      if (event.key !== 'Escape' || !this.toggle.checked) return
      this._setExpanded(false, { persist: this._isDesktop() })
      this.trigger?.focus()
    }
    this._onChange = () => {
      this._syncState()
      if (this._isDesktop()) this._writeCollapsed(!this.toggle.checked)
    }
    this._mediaQuery = window.matchMedia('(min-width: 768px)')
    this._onMediaChange = () => this._applyState()

    this.trigger?.addEventListener('click', this._onTriggerClick)
    this.overlay?.addEventListener('click', this._onOverlayClick)
    document.addEventListener('keydown', this._onKeyDown)
    this.toggle.addEventListener('change', this._onChange)
    if (this._mediaQuery.addEventListener) {
      this._mediaQuery.addEventListener('change', this._onMediaChange)
    } else {
      this._mediaQuery.addListener(this._onMediaChange)
    }
    this.el.setAttribute('data-ready', '')
  },

  destroyed() {
    this.trigger?.removeEventListener('click', this._onTriggerClick)
    this.overlay?.removeEventListener('click', this._onOverlayClick)
    document.removeEventListener('keydown', this._onKeyDown)
    this.toggle?.removeEventListener('change', this._onChange)
    if (this._mediaQuery?.removeEventListener) {
      this._mediaQuery.removeEventListener('change', this._onMediaChange)
    } else {
      this._mediaQuery?.removeListener(this._onMediaChange)
    }
    this.el?.removeAttribute('data-ready')
  },

  updated() {
    this._applyState()
  },

  _applyState() {
    if (!this.toggle) return
    if (this._isDesktop()) {
      this.toggle.checked = !this._readCollapsed()
    } else {
      this.toggle.checked = false
    }
    this._syncState()
  },

  _setExpanded(expanded, opts = {}) {
    this.toggle.checked = expanded
    this._syncState()
    if (opts.persist && this._isDesktop()) this._writeCollapsed(!expanded)
    this.toggle.dispatchEvent(new Event('change', { bubbles: true }))
  },

  _syncState() {
    const expanded = this.toggle.checked
    const state = expanded ? 'open' : 'closed'

    this.el.setAttribute('data-state', state)
    this.panel?.setAttribute('data-state', state)
    this.trigger?.setAttribute('aria-expanded', expanded ? 'true' : 'false')
  },

  _isDesktop() {
    return window.matchMedia('(min-width: 768px)').matches
  },

  _readCollapsed() {
    try {
      return localStorage.getItem('exo-sidebar-collapsed') === 'true'
    } catch (_err) {
      return false
    }
  },

  _writeCollapsed(collapsed) {
    try {
      localStorage.setItem('exo-sidebar-collapsed', collapsed ? 'true' : 'false')
    } catch (_err) {}
  }
}

export { ExoSidebar }
