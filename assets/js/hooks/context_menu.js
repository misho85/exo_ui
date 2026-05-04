const ExoContextMenu = {
  mounted() { this._bind() },
  updated() { this._bind() },
  destroyed() { this._unbind() },

  _bind() {
    this._unbind()
    this.trigger = this.el.querySelector('[data-exo="context-menu-trigger"]')
    this.menu = this.el.querySelector('[data-exo="context-menu-content"]')
    if (!this.trigger || !this.menu) return

    this.el.setAttribute("data-ready", "")
    this.trigger.setAttribute("tabindex", this.trigger.getAttribute("tabindex") || "0")
    this.trigger.setAttribute("role", this.trigger.getAttribute("role") || "button")
    this.trigger.setAttribute("aria-haspopup", "menu")
    if (this.menu.id) this.trigger.setAttribute("aria-controls", this.menu.id)
    this.trigger.setAttribute("aria-expanded", String(this.menu.hasAttribute("data-open")))

    this._items = () =>
      [...this.menu.querySelectorAll('[data-exo="context-menu-item"]')]
        .filter((item) => !this._isDisabled(item))

    this.menu.querySelectorAll('[data-exo="context-menu-item"]').forEach((item) => {
      item.setAttribute("tabindex", "-1")
      if (item.tagName === "BUTTON" && !item.getAttribute("type")) {
        item.setAttribute("type", "button")
      }
      if (this._isDisabled(item)) {
        item.setAttribute("aria-disabled", "true")
        item.dataset.disabled = "true"
      }
    })

    this._close = (e) => {
      if (this.trigger?.contains(e.target)) return
      if (!this.menu.contains(e.target)) {
        this._hide()
      }
    }

    this._onContext = (e) => {
      e.preventDefault()
      this._openAt(e.clientX, e.clientY)
    }
    this.trigger.addEventListener("contextmenu", this._onContext)

    this._onTriggerKeydown = (e) => {
      if (e.key !== "ContextMenu" && !(e.shiftKey && e.key === "F10")) return
      e.preventDefault()
      const rect = this.trigger.getBoundingClientRect()
      this._openAt(rect.left, rect.bottom)
    }
    this.trigger.addEventListener("keydown", this._onTriggerKeydown)

    this._openAt = (x, y) => {
      this.menu.setAttribute("data-open", "")
      this.trigger.setAttribute("aria-expanded", "true")
      this._positionWithinViewport(x, y)
      this._bindCloseListeners()

      requestAnimationFrame(() => {
        this._items()[0]?.focus()
      })
    }

    this._positionWithinViewport = (x, y) => {
      this.menu.style.left = x + "px"
      this.menu.style.top = y + "px"

      requestAnimationFrame(() => {
        if (!this.menu.hasAttribute("data-open")) return
        const rect = this.menu.getBoundingClientRect()
        const gap = 4
        const left = Math.min(x, window.innerWidth - rect.width - gap)
        const top = Math.min(y, window.innerHeight - rect.height - gap)
        this.menu.style.left = Math.max(gap, left) + "px"
        this.menu.style.top = Math.max(gap, top) + "px"
      })
    }

    this._bindCloseListeners = () => {
      document.removeEventListener("pointerdown", this._close, true)
      document.removeEventListener("mousedown", this._close, true)
      document.removeEventListener("click", this._close, true)
      document.removeEventListener("contextmenu", this._close, true)

      document.addEventListener("pointerdown", this._close, true)
      document.addEventListener("mousedown", this._close, true)
      document.addEventListener("click", this._close, true)
      document.addEventListener("contextmenu", this._close, true)
    }

    this._hide = () => {
      this.menu.removeAttribute("data-open")
      this.trigger.setAttribute("aria-expanded", "false")
      document.removeEventListener("pointerdown", this._close, true)
      document.removeEventListener("mousedown", this._close, true)
      document.removeEventListener("click", this._close, true)
      document.removeEventListener("contextmenu", this._close, true)
    }

    this._onItemClick = (e) => {
      const item = e.target.closest('[data-exo="context-menu-item"]')
      if (!item) return
      if (this._isDisabled(item)) {
        e.preventDefault()
        return
      }
      this._hide()
    }
    this.menu.addEventListener("click", this._onItemClick)

    this._onKeydown = (e) => {
      if (e.key === "Escape") {
        this._hide()
        this.trigger.focus?.()
        return
      }

      const items = this._items()
      if (!items.length) return
      const idx = items.indexOf(document.activeElement)
      let next = -1

      switch (e.key) {
        case "ArrowDown": next = idx < items.length - 1 ? idx + 1 : 0; break
        case "ArrowUp": next = idx > 0 ? idx - 1 : items.length - 1; break
        case "Home": next = 0; break
        case "End": next = items.length - 1; break
        default: return
      }

      e.preventDefault()
      items[next]?.focus()
    }
    this.menu.addEventListener("keydown", this._onKeydown)
  },

  _isDisabled(item) {
    return item.disabled ||
      item.dataset.disabled === "true" ||
      item.hasAttribute("data-disabled") ||
      item.getAttribute("aria-disabled") === "true"
  },

  _unbind() {
    if (this.trigger && this._onContext) this.trigger.removeEventListener("contextmenu", this._onContext)
    if (this.trigger && this._onTriggerKeydown) this.trigger.removeEventListener("keydown", this._onTriggerKeydown)
    if (this.menu && this._onItemClick) this.menu.removeEventListener("click", this._onItemClick)
    if (this.menu && this._onKeydown) this.menu.removeEventListener("keydown", this._onKeydown)
    if (this._close) {
      document.removeEventListener("pointerdown", this._close, true)
      document.removeEventListener("mousedown", this._close, true)
      document.removeEventListener("click", this._close, true)
      document.removeEventListener("contextmenu", this._close, true)
    }
    if (this.el) this.el.removeAttribute("data-ready")
    this.trigger = null
    this.menu = null
    this._items = null
    this._hide = null
    this._openAt = null
    this._bindCloseListeners = null
    this._positionWithinViewport = null
    this._onContext = null
    this._onTriggerKeydown = null
    this._onItemClick = null
    this._onKeydown = null
    this._close = null
  }
}

export { ExoContextMenu }
