const ExoDropdownMenu = {
  mounted() { this._bind() },
  updated() { this._bind() },
  destroyed() { this._unbind() },

  _bind() {
    this._unbind()
    this._menu = this.el.matches('[role="menu"]') ? this.el : this.el.querySelector('[role="menu"]')
    if (!this._menu) return

    this._popover = this._menu.closest('[popover]')
    this._trigger = this._findTrigger()
    this._allItems().forEach((item) => {
      item.setAttribute('tabindex', '-1')
      if (item.tagName === 'BUTTON' && !item.getAttribute('type')) {
        item.setAttribute('type', 'button')
      }
      if (this._isDisabled(item)) {
        item.setAttribute('aria-disabled', 'true')
        item.dataset.disabled = 'true'
      }
    })

    this._onToggle = () => {
      if (!this._popover?.matches(':popover-open')) return
      requestAnimationFrame(() => this._items()[0]?.focus())
    }
    this._popover?.addEventListener('toggle', this._onToggle)

    this._onClick = (e) => {
      const item = e.target.closest('[role="menuitem"]')
      if (!item || !this._menu.contains(item)) return
      if (this._isDisabled(item)) {
        e.preventDefault()
        e.stopImmediatePropagation()
      }
    }
    this._menu.addEventListener('click', this._onClick)

    this._onKeydown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        this._popover?.hidePopover?.()
        this._trigger?.focus?.()
        return
      }

      const items = this._items()
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

  _items() {
    return this._allItems().filter((item) => !this._isDisabled(item))
  },

  _allItems() {
    return [...this._menu.querySelectorAll('[role="menuitem"]')]
  },

  _isDisabled(item) {
    return item.disabled ||
      item.dataset.disabled === 'true' ||
      item.hasAttribute('data-disabled') ||
      item.getAttribute('aria-disabled') === 'true'
  },

  _findTrigger() {
    if (!this._popover?.id) return null
    const trigger = [...document.querySelectorAll('[data-popover-target]')]
      .find((node) => node.dataset.popoverTarget === this._popover.id)
    return trigger?.matches('button, a[href], input, select, textarea, [role="button"], [tabindex]')
      ? trigger
      : trigger?.querySelector('button, a[href], input, select, textarea, [role="button"], [tabindex]') || trigger
  },

  _unbind() {
    if (this._popover && this._onToggle) {
      this._popover.removeEventListener('toggle', this._onToggle)
    }
    if (this._menu && this._onClick) {
      this._menu.removeEventListener('click', this._onClick)
    }
    if (this._menu && this._onKeydown) {
      this._menu.removeEventListener('keydown', this._onKeydown)
    }
    this._popover = null
    this._trigger = null
    this._menu = null
    this._onToggle = null
    this._onClick = null
    this._onKeydown = null
  }
}

export { ExoDropdownMenu }
