/**
 * ExoSidebar hook — manages collapsible sidebar state.
 *
 * Restores collapsed/expanded from localStorage on desktop.
 * Mobile starts closed. Sets data-sidebar-ready on <html> after init.
 */
const ExoSidebar = {
  mounted() {
    this.toggle = this.el.querySelector('[data-exo="sidebar-toggle"]')
    if (!this.toggle) return

    this._applyState()

    // Enable CSS transitions after initial state (prevents FOUC)
    requestAnimationFrame(() => {
      document.documentElement.setAttribute('data-sidebar-ready', '')
    })

    // Persist on toggle
    this.toggle.addEventListener('change', () => {
      if (window.matchMedia('(min-width: 768px)').matches) {
        localStorage.setItem('exo-sidebar-collapsed', this.toggle.checked ? 'false' : 'true')
      }
    })
  },

  updated() {
    this._applyState()
  },

  _applyState() {
    if (!this.toggle) return
    const isDesktop = window.matchMedia('(min-width: 768px)').matches
    if (isDesktop) {
      const collapsed = localStorage.getItem('exo-sidebar-collapsed') === 'true'
      this.toggle.checked = !collapsed
    } else {
      this.toggle.checked = false
    }
  }
}

export { ExoSidebar }
