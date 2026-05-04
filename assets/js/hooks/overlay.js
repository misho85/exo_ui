const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]'
].join(',')

const ExoOverlay = {
  mounted() { this._bind() },
  updated() { this._bind() },
  destroyed() { this._unbind() },

  _bind() {
    const wasOpen = this._isOpenActive
    const previousFocus = this._previousFocus
    const pendingInvoker = this._pendingInvoker
    this._unbind()

    this._isOpenActive = wasOpen || false
    this._previousFocus = previousFocus || null
    this._pendingInvoker = pendingInvoker || null
    this._panel = this._findPanel()
    this._close = this._findClose()

    if (!this._panel) return

    this._onKeydown = (event) => this._handleKeydown(event)
    this._onPointerdown = (event) => this._rememberInvoker(event)
    this._onClick = (event) => this._rememberInvoker(event)
    this._observer = new MutationObserver(() => this._sync())

    document.addEventListener('keydown', this._onKeydown, true)
    document.addEventListener('pointerdown', this._onPointerdown, true)
    document.addEventListener('click', this._onClick, true)
    this._observer.observe(this.el, {
      attributes: true,
      attributeFilter: ['data-state', 'class', 'hidden', 'inert', 'aria-hidden', 'style']
    })

    this.el.dataset.ready = 'true'
    this._sync()
  },

  _findPanel() {
    return this.el.querySelector([
      '[data-exo="modal-content"]',
      '[data-exo="drawer-content"]',
      '[data-exo="sheet-content"]'
    ].join(','))
  },

  _findClose() {
    return this.el.querySelector([
      '[data-exo="modal-close"]',
      '[data-exo="drawer-close"]',
      '[data-exo="sheet-close"]'
    ].join(','))
  },

  _isOpen() {
    if (this.el.dataset.state) return this.el.dataset.state === 'open'
    return this.el.classList.contains('open') && !this.el.hidden
  },

  _sync() {
    const open = this._isOpen()

    if (open && !this._isOpenActive) {
      this._activate()
      return
    }

    if (!open && this._isOpenActive) {
      this._deactivate()
    }
  },

  _activate() {
    this._isOpenActive = true

    const active = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousFocus = this._isRestoreTarget(this._pendingInvoker)
      ? this._pendingInvoker
      : active

    this._pendingInvoker = null
    this._previousFocus = this._isRestoreTarget(previousFocus) ? previousFocus : null

    this.el.removeAttribute('inert')
    this.el.setAttribute('aria-hidden', 'false')

    requestAnimationFrame(() => {
      const target = this._firstFocusable() || this._panel
      target?.focus?.({ preventScroll: true })
    })
  },

  _deactivate() {
    this._isOpenActive = false
    this.el.setAttribute('aria-hidden', 'true')
    this.el.setAttribute('inert', 'true')

    const target = this._previousFocus
    this._previousFocus = null

    requestAnimationFrame(() => {
      if (target && target.isConnected) target.focus({ preventScroll: true })
    })
  },

  _focusables() {
    if (!this._panel) return []

    return Array.from(this._panel.querySelectorAll(focusableSelector)).filter((element) => {
      if (!(element instanceof HTMLElement)) return false
      if (element.hidden || element.getAttribute('aria-hidden') === 'true') return false
      if (element.closest('[hidden],[inert]')) return false
      return Boolean(element.offsetWidth || element.offsetHeight || element.getClientRects().length)
    })
  },

  _firstFocusable() {
    return this._focusables()[0] || null
  },

  _handleKeydown(event) {
    if (!this._isOpen()) return

    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      this._close?.click?.()
      return
    }

    if (event.key !== 'Tab') return

    const focusables = this._focusables()

    if (focusables.length === 0) {
      event.preventDefault()
      this._panel?.focus?.({ preventScroll: true })
      return
    }

    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    const active = document.activeElement

    if (event.shiftKey && (active === first || !this._panel.contains(active))) {
      event.preventDefault()
      last.focus({ preventScroll: true })
      return
    }

    if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus({ preventScroll: true })
    }
  },

  _rememberInvoker(event) {
    if (this._isOpen()) return

    const target = event.target instanceof Element
      ? event.target.closest(focusableSelector)
      : null

    if (this._isRestoreTarget(target)) this._pendingInvoker = target
  },

  _isRestoreTarget(element) {
    if (!(element instanceof HTMLElement)) return false
    if (!element.isConnected || this.el.contains(element)) return false
    if (element.closest('[hidden],[inert]')) return false
    if (element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true') return false
    if (!element.matches(focusableSelector)) return false
    return true
  },

  _unbind() {
    if (this._observer) this._observer.disconnect()
    if (this._onKeydown) document.removeEventListener('keydown', this._onKeydown, true)
    if (this._onPointerdown) document.removeEventListener('pointerdown', this._onPointerdown, true)
    if (this._onClick) document.removeEventListener('click', this._onClick, true)
    if (this.el) delete this.el.dataset.ready

    this._observer = null
    this._onKeydown = null
    this._onPointerdown = null
    this._onClick = null
    this._panel = null
    this._close = null
  }
}

export { ExoOverlay }
