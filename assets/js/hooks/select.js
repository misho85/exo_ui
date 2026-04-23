const ExoSelect = {
  mounted() { this._bind() },
  updated() { this._bind() },
  destroyed() { this._unbind() },

  _bind() {
    this._unbind()

    this._trigger = this.el.querySelector('[data-exo-select="trigger"]')
    const popoverId = this._trigger?.getAttribute('popovertarget')
    this._popover = popoverId ? document.getElementById(popoverId) : null
    this._listbox = this.el.querySelector('[role="listbox"]')
    this._hidden = this.el.closest('[data-exo="field"]')?.querySelector('input[type="hidden"]')

    if (!this._popover || !this._listbox) return

    // Toggle aria-expanded on popover open/close
    this._onToggle = () => {
      const open = this._popover.matches(':popover-open')
      this._trigger.setAttribute('aria-expanded', String(open))
      if (open) {
        // Focus selected option only — don't pre-highlight first option
        const selected = this._listbox.querySelector('[data-selected]')
        if (selected) selected.focus()
      }
    }
    this._trigger.setAttribute('aria-expanded', String(this._popover.matches(':popover-open')))
    this._popover.addEventListener('toggle', this._onToggle)

    // Click on option
    this._onClick = (e) => {
      const opt = e.target.closest('[data-exo="select-option"]')
      if (!opt || opt.hasAttribute('data-disabled')) return
      this._selectOption(opt)
    }
    this._listbox.addEventListener('click', this._onClick)

    // Keyboard navigation
    this._onKeydown = (e) => {
      const options = [...this._listbox.querySelectorAll('[data-exo="select-option"]:not([data-disabled])')]
      if (!options.length) return
      const idx = options.indexOf(document.activeElement)
      let next = -1

      switch (e.key) {
        case 'ArrowDown':
          next = idx < options.length - 1 ? idx + 1 : 0
          break
        case 'ArrowUp':
          next = idx > 0 ? idx - 1 : options.length - 1
          break
        case 'Home':
          next = 0
          break
        case 'End':
          next = options.length - 1
          break
        case 'Enter':
        case ' ':
          e.preventDefault()
          if (idx >= 0) this._selectOption(options[idx])
          return
        case 'Escape':
          this._popover.hidePopover()
          this._trigger.focus()
          return
        default:
          // Type-ahead: jump to option starting with typed character
          this._typeAhead(e.key, options)
          return
      }

      e.preventDefault()
      if (next >= 0) options[next].focus()
    }
    this._listbox.addEventListener('keydown', this._onKeydown)
  },

  _selectOption(opt) {
    const value = opt.getAttribute('data-value')
    const text = opt.textContent.trim()

    // Update hidden input
    if (this._hidden) {
      this._hidden.value = value
      this._hidden.dispatchEvent(new Event('input', { bubbles: true }))
    }

    // Update aria-selected and data-selected on all options
    this._listbox.querySelectorAll('[data-exo="select-option"]').forEach((o) => {
      const isSelected = o.getAttribute('data-value') === value
      o.setAttribute('aria-selected', String(isSelected))
      if (isSelected) {
        o.setAttribute('data-selected', '')
      } else {
        o.removeAttribute('data-selected')
      }
    })

    // Update trigger display text
    const valueEl = this._trigger.querySelector('[data-exo="select-value"]')
    if (valueEl) {
      valueEl.textContent = text
      valueEl.removeAttribute('data-placeholder')
    }

    // Close popover
    this._popover.hidePopover()
    this._trigger.focus()
  },

  _typeAhead(char, options) {
    if (char.length !== 1) return
    const lower = char.toLowerCase()
    const currentIdx = options.indexOf(document.activeElement)
    const start = currentIdx + 1
    const rotated = [...options.slice(start), ...options.slice(0, start)]
    const match = rotated.find(o => o.textContent.trim().toLowerCase().startsWith(lower))
    if (match) match.focus()
  },

  _unbind() {
    if (this._popover && this._onToggle) {
      this._popover.removeEventListener('toggle', this._onToggle)
    }
    if (this._listbox && this._onClick) {
      this._listbox.removeEventListener('click', this._onClick)
    }
    if (this._listbox && this._onKeydown) {
      this._listbox.removeEventListener('keydown', this._onKeydown)
    }
    this._trigger = null
    this._popover = null
    this._listbox = null
    this._hidden = null
    this._onToggle = null
    this._onClick = null
    this._onKeydown = null
  }
}

export { ExoSelect }
