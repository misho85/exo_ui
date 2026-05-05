const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]'
].join(',')

let overlaySequence = 0

const overlayRegistry = {
  active: new Set(),
  inertElements: new Set(),
  originalState: new WeakMap(),
  scrollLock: null,
  stackedRoots: new Set(),
  rootStyleState: new WeakMap(),

  register(hook) {
    if (!hook?.el?.isConnected) return

    this.active.add(hook)
    this.syncOutsideInert()
  },

  unregister(hook) {
    this.active.delete(hook)
    this.syncOutsideInert()
  },

  top() {
    const hooks = this.hooks()
    return hooks[hooks.length - 1] || null
  },

  hooks() {
    return Array.from(this.active)
      .filter((hook) => hook?.el?.isConnected && hook._isOpen())
      .sort((a, b) => (a._overlayOrder || 0) - (b._overlayOrder || 0))
  },

  syncOutsideInert() {
    const next = new Set()
    const roots = this.hooks().map((hook) => hook.el)

    this._syncStacking(roots)
    this._syncScrollLock(roots.length > 0)

    if (roots.length > 0) {
      for (const element of this._outsideElements(roots)) {
        if (!this._canInert(element, roots)) continue
        this._applyInert(element)
        next.add(element)
      }
    }

    for (const element of this.inertElements) {
      if (next.has(element)) continue

      if (roots.includes(element)) {
        this._release(element)
      } else {
        this._restore(element)
      }
    }

    this.inertElements = next
  },

  _outsideElements(roots) {
    const allowed = new Set()
    const candidates = new Set()

    for (const root of roots) {
      let node = root

      while (node && node instanceof HTMLElement) {
        allowed.add(node)
        if (node === document.body) break
        node = node.parentElement
      }
    }

    for (const root of roots) {
      let node = root

      while (node?.parentElement && node.parentElement !== document.documentElement) {
        for (const child of Array.from(node.parentElement.children)) {
          if (!(child instanceof HTMLElement)) continue
          if (child === node || allowed.has(child)) continue
          if (roots.some((activeRoot) => child.contains(activeRoot))) continue
          candidates.add(child)
        }

        if (node.parentElement === document.body) break
        node = node.parentElement
      }
    }

    return candidates
  },

  _canInert(element, roots) {
    if (element === document.body || element === document.documentElement) return false
    if (element.matches('script,style,link,template')) return false
    if (element.matches('[phx-hook="ExoOverlay"]') && this._elementIsOpenOverlay(element)) return false
    return roots.every((root) => !element.contains(root))
  },

  _elementIsOpenOverlay(element) {
    if (element.dataset.state) return element.dataset.state === 'open'
    return element.classList.contains('open') && !element.hidden
  },

  _applyInert(element) {
    if (!this.originalState.has(element)) {
      this.originalState.set(element, {
        inert: element.inert,
        ariaHidden: element.getAttribute('aria-hidden')
      })
    }

    element.inert = true
    element.setAttribute('aria-hidden', 'true')
  },

  _restore(element) {
    const original = this.originalState.get(element)
    if (!original) return

    element.inert = original.inert

    if (original.ariaHidden === null) {
      element.removeAttribute('aria-hidden')
    } else {
      element.setAttribute('aria-hidden', original.ariaHidden)
    }

    this.originalState.delete(element)
  },

  _release(element) {
    this.originalState.delete(element)
  },

  _syncStacking(roots) {
    const next = new Set(roots)

    roots.forEach((root, index) => {
      if (!this.rootStyleState.has(root)) {
        this.rootStyleState.set(root, { zIndex: root.style.zIndex })
      }

      root.style.zIndex = String(1000 + index)
      root.dataset.overlayStackIndex = String(index + 1)
    })

    for (const root of this.stackedRoots) {
      if (next.has(root)) continue
      this._restoreStacking(root)
    }

    this.stackedRoots = next
  },

  _restoreStacking(root) {
    const original = this.rootStyleState.get(root)
    if (!original) return

    root.style.zIndex = original.zIndex
    delete root.dataset.overlayStackIndex
    this.rootStyleState.delete(root)
  },

  _syncScrollLock(locked) {
    if (locked) {
      this._lockScroll()
    } else {
      this._restoreScroll()
    }
  },

  _lockScroll() {
    if (this.scrollLock || !document.body) return

    const html = document.documentElement
    const body = document.body
    const scrollbarWidth = Math.max(0, window.innerWidth - html.clientWidth)

    this.scrollLock = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyPaddingRight: body.style.paddingRight
    }

    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'

    if (scrollbarWidth > 0) {
      const currentPadding = Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0
      body.style.paddingRight = `${currentPadding + scrollbarWidth}px`
    }
  },

  _restoreScroll() {
    if (!this.scrollLock || !document.body) return

    const html = document.documentElement
    const body = document.body

    html.style.overflow = this.scrollLock.htmlOverflow
    body.style.overflow = this.scrollLock.bodyOverflow
    body.style.paddingRight = this.scrollLock.bodyPaddingRight
    this.scrollLock = null
  }
}

const ExoOverlay = {
  mounted() { this._bind() },
  updated() { this._bind() },
  destroyed() { this._unbind() },

  _bind() {
    const wasOpen = this._isOpenActive
    const previousFocus = this._previousFocus
    const pendingInvoker = this._pendingInvoker
    const overlayOrder = this._overlayOrder
    this._unbind({ preserveOpenState: true })

    this._isOpenActive = wasOpen || false
    this._previousFocus = previousFocus || null
    this._pendingInvoker = pendingInvoker || null
    this._overlayOrder = overlayOrder || null
    this._panel = this._findPanel()
    this._close = this._findClose()

    if (!this._panel) {
      overlayRegistry.unregister(this)
      return
    }

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
    this._overlayOrder = overlaySequence += 1

    const active = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousFocus = this._isRestoreTarget(this._pendingInvoker)
      ? this._pendingInvoker
      : active

    this._pendingInvoker = null
    this._previousFocus = this._isRestoreTarget(previousFocus) ? previousFocus : null

    this.el.removeAttribute('inert')
    this.el.setAttribute('aria-hidden', 'false')
    overlayRegistry.register(this)

    requestAnimationFrame(() => {
      if (!this._isOpenActive || !this._isOpen()) return

      const target = this._firstFocusable() || this._panel
      target?.focus?.({ preventScroll: true })
    })
  },

  _deactivate() {
    this._isOpenActive = false
    this._overlayOrder = null
    overlayRegistry.unregister(this)

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
    if (overlayRegistry.top() && overlayRegistry.top() !== this) return

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

  _unbind(options = {}) {
    if (!options.preserveOpenState) overlayRegistry.unregister(this)

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
