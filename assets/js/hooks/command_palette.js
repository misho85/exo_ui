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
    this._unbind()
    this.backdrop = this.el.querySelector('[data-exo="command-palette-backdrop"]')
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

    const isOpen = () => this.el.classList.contains("open")
    const syncState = () => {
      this.el.dataset.state = isOpen() ? "open" : "closed"
      this.el.setAttribute("aria-hidden", isOpen() ? "false" : "true")
      if (this.input) this.input.setAttribute("aria-expanded", isOpen() ? "true" : "false")
    }

    this._open = () => {
      this.el.style.display = "block"
      this.el.classList.add("open")
      syncState()
      this._filter()
      requestAnimationFrame(() => {
        if (this.input) this.input.focus()
      })
    }

    this._close = () => {
      this.el.classList.remove("open")
      this.el.style.display = "none"
      syncState()
      if (this.input) this.input.value = ""
      this.items.forEach((item) => {
        item.hidden = false
        this._setItemActive(item, false)
      })
      if (this.empty) this.empty.hidden = true
      this.activeIndex = -1
      this._syncActiveDescendant()
    }

    syncState()
    if (!isOpen()) this.el.style.display = "none"
    if (this.empty) this.empty.hidden = true
    this.el.dataset.ready = "true"

    this._toggle = () => (isOpen() ? this._close() : this._open())
    PaletteRegistry.register(this)

    this._onKey = (e) => {
      if (e.key === "Escape") {
        this._close()
        return
      }

      if (!isOpen()) return

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
    }
    this.el.addEventListener("keydown", this._onKey)

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

  _unbind() {
    PaletteRegistry.unregister(this)
    if (this._onKey) this.el.removeEventListener("keydown", this._onKey)
    if (this.input && this._onInput) this.input.removeEventListener("input", this._onInput)
    if (this._onItemPointerMove) this.el.removeEventListener("pointermove", this._onItemPointerMove)
    if (this._onItemClick) this.el.removeEventListener("click", this._onItemClick)
    if (this.backdrop && this._onBackdrop) {
      this.backdrop.removeEventListener("click", this._onBackdrop)
    }
    delete this.el.dataset.ready
    this.backdrop = null
    this.input = null
    this.list = null
    this.empty = null
    this.items = []
    this.shortcut = ""
    this.activeIndex = -1
    this._onKey = null
    this._onInput = null
    this._onItemPointerMove = null
    this._onItemClick = null
    this._onBackdrop = null
    this._open = null
    this._close = null
    this._toggle = null
  }
}

export { ExoCommandPalette }
