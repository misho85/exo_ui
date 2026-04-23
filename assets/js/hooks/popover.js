const ExoPopover = {
  mounted() { this._bind() },
  updated() { this._bind() },
  destroyed() { this._unbind() },
  _bind() {
    this._unbind()
    const trigger = this.el.querySelector('[data-exo="popover-trigger"]')
    const id = trigger?.getAttribute('popovertarget')
    this._popover = id ? document.getElementById(id) : null
    if (!this._popover) return
    const syncExpanded = () => {
      const open = this._popover.matches(':popover-open')
      trigger.setAttribute('aria-expanded', String(open))
    }
    syncExpanded()
    this._onToggle = () => syncExpanded()
    this._popover.addEventListener('toggle', this._onToggle)
  },
  _unbind() {
    if (this._popover && this._onToggle) {
      this._popover.removeEventListener('toggle', this._onToggle)
    }
    this._popover = null
    this._onToggle = null
  }
}

export { ExoPopover }
