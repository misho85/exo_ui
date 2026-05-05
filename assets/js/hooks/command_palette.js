import { overlayRegistry } from './overlay.js'

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]'
].join(',')

const PaletteRegistry = {
  stack: [],
  listenerBound: false,

  register(hook) {
    this.stack = this.stack.filter((entry) => entry !== hook)
    this.stack.push(hook)
    this._ensureListener()
  },

  unregister(hook) {
    this.stack = this.stack.filter((entry) => entry !== hook)
    if (this.stack.length === 0 && this.listenerBound) {
      document.removeEventListener("keydown", this._onKey)
      this.listenerBound = false
    }
  },

  _ensureListener() {
    if (this.listenerBound) return
    this._onKey = (e) => {
      const target = [...this.stack].reverse().find((hook) => hook?._matchesShortcut?.(e))
      if (!target || !target._toggle) return
      e.preventDefault()
      target._toggle()
    }
    document.addEventListener("keydown", this._onKey)
    this.listenerBound = true
  }
}

const ExoCommandPalette = {
  mounted() { this._bind() },
  updated() { this._bind() },
  destroyed() {
    PaletteRegistry.unregister(this)
    this._unbind()
  },

  _bind() {
    const wasOpen = this._isOpenActive || false
    const previousFocus = this._previousFocus || null
    const pendingInvoker = this._pendingInvoker || null

    this._unbind({ preserveState: true })
    this._isOpenActive = wasOpen
    this._previousFocus = previousFocus
    this._pendingInvoker = pendingInvoker
    this.backdrop = this.el.querySelector('[data-exo="command-palette-backdrop"]')
    this.dialog = this.el.querySelector('[data-exo="command-palette-dialog"]')
    this.input = this.el.querySelector('[data-exo="command-palette-input"]')
    this.list = this.el.querySelector('[data-exo="command-palette-list"]')
    this.empty = this.el.querySelector('[data-exo="command-palette-empty"]')
    this.items = Array.from(this.el.querySelectorAll('[data-exo="command-palette-item"]'))
    this.shortcut = (this.el.dataset.shortcut || "").trim().toLowerCase()
    this.activeIndex = -1

    if (this.list && !this.list.id) this.list.id = `${this.el.id}-list`

    this.items.forEach((item, index) => {
      if (!item.id) item.id = `${this.el.id}-item-${index}`
      item.setAttribute("role", "option")
      item.setAttribute("tabindex", "-1")
      if (!item.dataset.value) item.dataset.value = item.textContent.trim()
      if (!item.dataset.search) item.dataset.search = item.textContent.trim()
      if (item.disabled || item.getAttribute("aria-disabled") === "true") {
        item.dataset.disabled = "true"
        item.setAttribute("aria-disabled", "true")
      }
      if (item.tagName === "BUTTON" && !item.hasAttribute("type")) {
        item.setAttribute("type", "button")
      }
    })

    if (this.input) {
      this.input.setAttribute("role", "combobox")
      this.input.setAttribute("aria-autocomplete", "list")
      if (this.list) this.input.setAttribute("aria-controls", this.list.id)
    }

    this._syncOpenState({ restoreFocus: false })
    if (!this._isOpen()) this.el.style.display = "none"
    if (this.empty) this.empty.hidden = true
    this.el.dataset.ready = "true"

    this._toggle = () => (this._isOpen() ? this._close() : this._open())
    PaletteRegistry.register(this)

    this._onKey = (e) => {
      if (e.key === "Escape") {
        this._close()
        return
      }

      if (!this._isOpen()) return

      if (e.key === "ArrowDown") {
        e.preventDefault()
        this._moveActive(1)
        return
      }

      if (e.key === "ArrowUp") {
        e.preventDefault()
        this._moveActive(-1)
        return
      }

      if (e.key === "Home") {
        e.preventDefault()
        this._setActiveByVisibleIndex(0)
        return
      }

      if (e.key === "End") {
        e.preventDefault()
        const visible = this._visibleItems()
        this._setActiveByVisibleIndex(visible.length - 1)
        return
      }

      if (e.key === "Enter" && this.activeIndex >= 0) {
        const item = this.items[this.activeIndex]
        if (item && !this._isDisabled(item) && !item.hidden) {
          e.preventDefault()
          item.click()
        }
      }

      if (e.key === "Tab") {
        this._trapFocus(e)
      }
    }
    this.el.addEventListener("keydown", this._onKey)

    this._onDocumentPointerdown = (e) => this._rememberInvoker(e)
    this._onDocumentClick = (e) => this._rememberInvoker(e)
    document.addEventListener("pointerdown", this._onDocumentPointerdown, true)
    document.addEventListener("click", this._onDocumentClick, true)

    this._observer = new MutationObserver(() => this._syncOpenState())
    this._observer.observe(this.el, {
      attributes: true,
      attributeFilter: ["class", "style", "hidden", "aria-hidden", "data-state"]
    })

    this._onInput = () => this._filter()
    if (this.input) this.input.addEventListener("input", this._onInput)

    this._onItemPointerMove = (e) => {
      const item = e.target.closest('[data-exo="command-palette-item"]')
      if (!item || this._isDisabled(item) || item.hidden) return
      this._setActive(this.items.indexOf(item))
    }
    this.el.addEventListener("pointermove", this._onItemPointerMove)

    this._onItemClick = (e) => {
      const item = e.target.closest('[data-exo="command-palette-item"]')
      if (!item) return
      if (this._isDisabled(item)) {
        e.preventDefault()
        return
      }
      if (item.dataset.close !== "false") {
        setTimeout(() => this._close(), 0)
      }
    }
    this.el.addEventListener("click", this._onItemClick)

    if (this.backdrop) {
      this._onBackdrop = () => this._close()
      this.backdrop.addEventListener("click", this._onBackdrop)
    }
  },

  _isOpen() {
    return this.el.classList.contains("open") && this.el.style.display !== "none" && !this.el.hidden
  },

  _open() {
    this.el.style.display = "block"
    this.el.hidden = false
    this.el.classList.add("open")
    this._syncOpenState()
  },

  _close() {
    this.el.classList.remove("open")
    this.el.style.display = "none"
    this._syncOpenState()
  },

  _syncOpenState(options = {}) {
    const open = this._isOpen()
    const state = open ? "open" : "closed"
    const hidden = open ? "false" : "true"
    const expanded = open ? "true" : "false"

    if (this.el.dataset.state !== state) this.el.dataset.state = state
    if (this.el.getAttribute("aria-hidden") !== hidden) this.el.setAttribute("aria-hidden", hidden)
    if (this.input && this.input.getAttribute("aria-expanded") !== expanded) {
      this.input.setAttribute("aria-expanded", expanded)
    }

    if (open && !this._isOpenActive) {
      this._activate(options)
    } else if (!open && this._isOpenActive) {
      this._deactivate(options)
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
    overlayRegistry.register(this)
    this._filter()

    requestAnimationFrame(() => {
      if (!this._isOpenActive || !this._isOpen()) return
      this.input?.focus?.({ preventScroll: true })
    })
  },

  _deactivate(options = {}) {
    this._isOpenActive = false
    overlayRegistry.unregister(this)
    this._overlayOrder = null
    this._reset()

    if (options.restoreFocus === false) return

    const target = this._previousFocus
    this._previousFocus = null

    requestAnimationFrame(() => {
      if (target && target.isConnected && !target.closest("[hidden],[inert]")) {
        target.focus({ preventScroll: true })
      }
    })
  },

  _reset() {
    if (this.input) this.input.value = ""
    this.items.forEach((item) => {
      item.hidden = false
      this._setItemActive(item, false)
    })
    if (this.empty) this.empty.hidden = true
    this.activeIndex = -1
    this._syncActiveDescendant()
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
    if (element.closest("[hidden],[inert]")) return false
    if (element.hasAttribute("disabled") || element.getAttribute("aria-disabled") === "true") return false
    if (!element.matches(focusableSelector)) return false
    return true
  },

  _focusables() {
    if (!this.dialog) return []

    return Array.from(this.dialog.querySelectorAll(focusableSelector)).filter((element) => {
      if (!(element instanceof HTMLElement)) return false
      if (element.hidden || element.getAttribute("aria-hidden") === "true") return false
      if (element.closest("[hidden],[inert]")) return false
      if (element.tabIndex < 0) return false
      return Boolean(element.offsetWidth || element.offsetHeight || element.getClientRects().length)
    })
  },

  _trapFocus(event) {
    const focusables = this._focusables()

    if (focusables.length === 0) {
      event.preventDefault()
      this.dialog?.focus?.({ preventScroll: true })
      return
    }

    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    const active = document.activeElement

    if (event.shiftKey && (active === first || !this.dialog.contains(active))) {
      event.preventDefault()
      last.focus({ preventScroll: true })
      return
    }

    if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus({ preventScroll: true })
    }
  },

  _isDisabled(item) {
    return item.disabled || item.dataset.disabled === "true" || item.getAttribute("aria-disabled") === "true"
  },

  _matchesShortcut(event) {
    if (!this.shortcut) return false
    return this.shortcut
      .split(",")
      .map((combo) => combo.trim())
      .filter(Boolean)
      .some((combo) => this._matchesShortcutCombo(event, combo))
  },

  _matchesShortcutCombo(event, combo) {
    const tokens = combo.split("+").map((token) => token.trim().toLowerCase()).filter(Boolean)
    const modifiers = ["mod", "cmd", "command", "meta", "ctrl", "control", "alt", "option", "shift"]
    const key = tokens.find((token) => !modifiers.includes(token))
    if (!key || event.key.toLowerCase() !== key) return false

    const wantsMod = tokens.includes("mod")
    const wantsMeta = tokens.some((token) => ["cmd", "command", "meta"].includes(token))
    const wantsCtrl = tokens.some((token) => ["ctrl", "control"].includes(token))
    const wantsAlt = tokens.some((token) => ["alt", "option"].includes(token))
    const wantsShift = tokens.includes("shift")

    if (wantsMod && !(event.metaKey || event.ctrlKey)) return false
    if (!wantsMod && event.metaKey !== wantsMeta) return false
    if (!wantsMod && event.ctrlKey !== wantsCtrl) return false
    if (event.altKey !== wantsAlt) return false
    if (event.shiftKey !== wantsShift) return false

    return true
  },

  _visibleItems() {
    return this.items.filter((item) => !item.hidden && !this._isDisabled(item))
  },

  _filter() {
    const query = (this.input?.value || "").trim().toLowerCase()
    let visibleCount = 0

    this.items.forEach((item) => {
      const text = `${item.dataset.search || ""} ${item.dataset.value || ""} ${item.textContent || ""}`.toLowerCase()
      const visible = !query || text.includes(query)
      item.hidden = !visible
      if (visible && !this._isDisabled(item)) visibleCount += 1
    })

    if (this.empty) this.empty.hidden = visibleCount > 0
    this._setActiveByVisibleIndex(0)
  },

  _moveActive(delta) {
    const visible = this._visibleItems()
    if (!visible.length) {
      this._setActive(-1)
      return
    }

    const current = visible.indexOf(this.items[this.activeIndex])
    const next = current === -1
      ? (delta > 0 ? 0 : visible.length - 1)
      : (current + delta + visible.length) % visible.length

    this._setActive(this.items.indexOf(visible[next]))
  },

  _setActiveByVisibleIndex(index) {
    const visible = this._visibleItems()
    if (!visible.length || index < 0) {
      this._setActive(-1)
      return
    }
    const bounded = Math.max(0, Math.min(index, visible.length - 1))
    this._setActive(this.items.indexOf(visible[bounded]))
  },

  _setActive(index) {
    this.items.forEach((item, itemIndex) => this._setItemActive(item, itemIndex === index))
    this.activeIndex = index
    this._syncActiveDescendant()

    const item = this.items[index]
    if (item) item.scrollIntoView({ block: "nearest" })
  },

  _setItemActive(item, active) {
    item.dataset.active = active ? "true" : "false"
    item.setAttribute("aria-selected", active ? "true" : "false")
  },

  _syncActiveDescendant() {
    if (!this.input) return
    const item = this.items[this.activeIndex]
    if (item && !item.hidden) {
      this.input.setAttribute("aria-activedescendant", item.id)
    } else {
      this.input.removeAttribute("aria-activedescendant")
    }
  },

  _unbind(options = {}) {
    if (!options.preserveState) PaletteRegistry.unregister(this)
    if (!options.preserveState) overlayRegistry.unregister(this)
    if (this._onKey) this.el.removeEventListener("keydown", this._onKey)
    if (this._onDocumentPointerdown) document.removeEventListener("pointerdown", this._onDocumentPointerdown, true)
    if (this._onDocumentClick) document.removeEventListener("click", this._onDocumentClick, true)
    if (this._observer) this._observer.disconnect()
    if (this.input && this._onInput) this.input.removeEventListener("input", this._onInput)
    if (this._onItemPointerMove) this.el.removeEventListener("pointermove", this._onItemPointerMove)
    if (this._onItemClick) this.el.removeEventListener("click", this._onItemClick)
    if (this.backdrop && this._onBackdrop) {
      this.backdrop.removeEventListener("click", this._onBackdrop)
    }
    delete this.el.dataset.ready
    this.backdrop = null
    this.dialog = null
    this.input = null
    this.list = null
    this.empty = null
    this.items = []
    this.shortcut = ""
    this.activeIndex = -1
    this._onKey = null
    this._onDocumentPointerdown = null
    this._onDocumentClick = null
    this._observer = null
    this._onInput = null
    this._onItemPointerMove = null
    this._onItemClick = null
    this._onBackdrop = null
    this._toggle = null

    if (!options.preserveState) {
      this._isOpenActive = false
      this._previousFocus = null
      this._pendingInvoker = null
      this._overlayOrder = null
    }
  }
}

export { ExoCommandPalette }
