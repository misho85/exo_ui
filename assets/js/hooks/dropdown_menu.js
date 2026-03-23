const ExoDropdownMenu = {
  mounted() { this._bind() },
  updated() { this._bind() },
  destroyed() { this._unbind() },
  _bind() {
    this._unbind()
    this._menu = this.el.querySelector('[role="menu"]')
    if (!this._menu) return
    this._onKeydown = (e) => {
      const items = [...this._menu.querySelectorAll('[role="menuitem"]:not([disabled])')]
      if (!items.length) return
      const idx = items.indexOf(document.activeElement)
      let next = -1
      switch (e.key) {
        case 'ArrowDown': next = idx < items.length - 1 ? idx + 1 : 0; break
        case 'ArrowUp': next = idx > 0 ? idx - 1 : items.length - 1; break
        case 'Home': next = 0; break
        case 'End': next = items.length - 1; break
        default: return
      }
      e.preventDefault()
      items[next]?.focus()
    }
    this._menu.addEventListener('keydown', this._onKeydown)
  },
  _unbind() {
    if (this._menu && this._onKeydown) {
      this._menu.removeEventListener('keydown', this._onKeydown)
    }
    this._menu = null
    this._onKeydown = null
  }
}

export { ExoDropdownMenu }
