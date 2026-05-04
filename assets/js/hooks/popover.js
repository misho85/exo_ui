const ExoPopover = {
  mounted() { this._bind() },
  updated() { this._bind() },
  destroyed() { this._unbind() },
  _bind() {
    this._unbind()
    this._trigger = this.el.querySelector('[data-exo="popover-trigger"]')
    const id =
      this._trigger?.dataset.popoverTarget ||
      this._trigger?.getAttribute('popovertarget')
    this._popover = id ? document.getElementById(id) : null
    if (!this._popover || !this._trigger) return

    this._control = this._findControl()
    this._prepareControl()
    this.el.setAttribute('data-ready', '')

    this._syncExpanded = () => {
      const open = this._popover.matches(':popover-open')
      this._control?.setAttribute('aria-expanded', String(open))
      this._trigger.setAttribute('aria-expanded', String(open))
    }
    this._syncExpanded()

    this._onClick = (event) => {
      event.preventDefault()
      this._togglePopover()
    }

    this._onKeydown = (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return
      if (event.target !== this._control && !this._control?.contains?.(event.target)) return
      event.preventDefault()
      this._togglePopover()
    }

    this._onToggle = () => this._syncExpanded()
    this._trigger.addEventListener('click', this._onClick)
    this._trigger.addEventListener('keydown', this._onKeydown)
    this._popover.addEventListener('toggle', this._onToggle)
  },

  _findControl() {
    const selector = [
      'button',
      'a[href]',
      'input:not([type="hidden"])',
      'select',
      'textarea',
      '[role="button"]',
      '[tabindex]:not([tabindex="-1"])'
    ].join(',')

    return this._trigger.matches(selector)
      ? this._trigger
      : this._trigger.querySelector(selector) || this._trigger
  },

  _prepareControl() {
    const hasPopup = this._trigger.dataset.popoverHaspopup || 'true'

    this._control.setAttribute('aria-haspopup', hasPopup)
    this._control.setAttribute('aria-expanded', 'false')

    if (this._control === this._trigger) {
      this._control.setAttribute('role', 'button')
      this._control.setAttribute('tabindex', '0')
    }

    if (this._control instanceof HTMLButtonElement && !this._control.getAttribute('type')) {
      this._control.setAttribute('type', 'button')
    }
  },

  _togglePopover() {
    try {
      if (this._popover.matches(':popover-open')) {
        this._popover.hidePopover()
      } else {
        this._popover.showPopover()
      }
    } catch (_err) {}
  },

  _unbind() {
    if (this._popover && this._onToggle) {
      this._popover.removeEventListener('toggle', this._onToggle)
    }
    if (this._trigger) {
      if (this._onClick) this._trigger.removeEventListener('click', this._onClick)
      if (this._onKeydown) this._trigger.removeEventListener('keydown', this._onKeydown)
    }
    if (this.el) this.el.removeAttribute('data-ready')
    this._trigger = null
    this._control = null
    this._popover = null
    this._syncExpanded = null
    this._onClick = null
    this._onKeydown = null
    this._onToggle = null
  }
}

export { ExoPopover }
