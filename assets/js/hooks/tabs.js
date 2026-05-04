const ExoTabs = {
  mounted() { this._bind() },
  updated() { this._bind() },
  destroyed() { this._unbind() },

  _bind() {
    this._unbind()
    this.el.setAttribute('data-ready', '')
    this._syncTabs()

    this._onClick = (e) => {
      const tab = e.target.closest('[role="tab"]')
      if (!tab || !this.el.contains(tab) || !this._isDisabled(tab)) return
      e.preventDefault()
      e.stopImmediatePropagation()
    }
    this.el.addEventListener('click', this._onClick)

    this._onKeydown = (e) => {
      const tab = e.target.closest('[role="tab"]')
      if (!tab || !this.el.contains(tab) || this._isDisabled(tab)) return

      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault()
        this._activate(tab)
        return
      }

      const tabs = this._tabs()
      if (!tabs.length) return

      const current = tabs.indexOf(tab)
      if (current === -1) return

      const vertical = this.el.dataset.orientation === 'vertical'
      let next = -1

      switch (e.key) {
        case 'ArrowRight':
          if (vertical) return
          next = current < tabs.length - 1 ? current + 1 : 0
          break
        case 'ArrowLeft':
          if (vertical) return
          next = current > 0 ? current - 1 : tabs.length - 1
          break
        case 'ArrowDown':
          if (!vertical) return
          next = current < tabs.length - 1 ? current + 1 : 0
          break
        case 'ArrowUp':
          if (!vertical) return
          next = current > 0 ? current - 1 : tabs.length - 1
          break
        case 'Home':
          next = 0
          break
        case 'End':
          next = tabs.length - 1
          break
        default:
          return
      }

      e.preventDefault()
      this._focusTab(tabs[next])
      if (this.el.dataset.activation === 'automatic') this._activate(tabs[next])
    }
    this.el.addEventListener('keydown', this._onKeydown)
  },

  _allTabs() {
    return [...this.el.querySelectorAll('[role="tab"]')]
  },

  _tabs() {
    return this._allTabs().filter((tab) => !this._isDisabled(tab))
  },

  _isDisabled(tab) {
    return tab.hasAttribute('data-disabled') ||
      tab.getAttribute('aria-disabled') === 'true' ||
      tab.disabled
  },

  _syncTabs() {
    const tabs = this._tabs()
    const selected = tabs.find((tab) => tab.getAttribute('aria-selected') === 'true') || tabs[0]
    this._allTabs().forEach((tab) => {
      tab.setAttribute('tabindex', tab === selected ? '0' : '-1')
    })
  },

  _focusTab(tab) {
    if (!tab) return
    this._allTabs().forEach((item) => item.setAttribute('tabindex', item === tab ? '0' : '-1'))
    tab.focus()
  },

  _activate(tab) {
    if (!tab || this._isDisabled(tab)) return
    tab.click()
  },

  _unbind() {
    if (this._onClick) this.el.removeEventListener('click', this._onClick)
    if (this._onKeydown) this.el.removeEventListener('keydown', this._onKeydown)
    if (this.el) this.el.removeAttribute('data-ready')
    this._onClick = null
    this._onKeydown = null
  }
}

export { ExoTabs }
