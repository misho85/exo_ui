const ExoMenubar = {
  mounted() { this._bind() },
  updated() { this._bind() },
  destroyed() { this._unbind() },

  _bind() {
    this._unbind()
    this.menus = Array.from(this.el.querySelectorAll('[data-exo="menubar-menu"]'))
    this.triggers = this.menus.map((menu) => menu.querySelector('[data-exo="menubar-trigger"]'))
    this.contents = this.menus.map((menu) => menu.querySelector('[data-exo="menubar-content"]'))
    this.openIndex = -1

    this.triggers.forEach((trigger, index) => {
      if (!trigger) return
      trigger.setAttribute("tabindex", index === 0 ? "0" : "-1")
      trigger.setAttribute("aria-expanded", "false")
      if (trigger.tagName === "BUTTON" && !trigger.hasAttribute("type")) {
        trigger.setAttribute("type", "button")
      }
    })

    this.contents.forEach((content, index) => {
      if (!content) return
      content.hidden = true
      content.removeAttribute("data-open")
      this._items(index).forEach((item) => {
        if (!item.hasAttribute("role")) item.setAttribute("role", "menuitem")
        item.setAttribute("tabindex", "-1")
        if (item.tagName === "BUTTON" && !item.hasAttribute("type")) {
          item.setAttribute("type", "button")
        }
      })
    })

    this._onClick = (e) => {
      const trigger = e.target.closest('[data-exo="menubar-trigger"]')
      if (trigger && this.el.contains(trigger)) {
        e.preventDefault()
        const index = this.triggers.indexOf(trigger)
        this.openIndex === index ? this._closeAll(true) : this._open(index)
        trigger.focus()
        return
      }

      const item = e.target.closest('[data-exo="menubar-content"] [role="menuitem"], [data-exo="menubar-content"] button, [data-exo="menubar-content"] a')
      if (item && this.el.contains(item) && !this._isDisabled(item)) {
        setTimeout(() => this._closeAll(true), 0)
      }
    }
    this.el.addEventListener("click", this._onClick)

    this._onPointerEnter = (e) => {
      const trigger = e.target.closest('[data-exo="menubar-trigger"]')
      if (!trigger || !this.el.contains(trigger) || this.openIndex < 0) return
      this._open(this.triggers.indexOf(trigger))
      trigger.focus()
    }
    this.el.addEventListener("pointerover", this._onPointerEnter)

    this._onKeyDown = (e) => {
      const triggerIndex = this.triggers.indexOf(e.target)
      if (triggerIndex >= 0) {
        this._onTriggerKey(e, triggerIndex)
        return
      }

      const contentIndex = this.contents.findIndex((content) => content?.contains(e.target))
      if (contentIndex >= 0) this._onMenuKey(e, contentIndex)
    }
    this.el.addEventListener("keydown", this._onKeyDown)

    this._onDocumentPointerDown = (e) => {
      if (!this.el.contains(e.target)) this._closeAll(true)
    }
    document.addEventListener("pointerdown", this._onDocumentPointerDown, true)

    this._onFocusOut = () => {
      clearTimeout(this._focusOutTimer)
      this._focusOutTimer = setTimeout(() => {
        if (!this.el.contains(document.activeElement)) this._closeAll(true)
      }, 0)
    }
    this.el.addEventListener("focusout", this._onFocusOut)

    this.el.dataset.ready = "true"
  },

  _onTriggerKey(e, index) {
    if (e.key === "ArrowRight") {
      e.preventDefault()
      this._focusTrigger(this._nextTrigger(index, 1))
      return
    }

    if (e.key === "ArrowLeft") {
      e.preventDefault()
      this._focusTrigger(this._nextTrigger(index, -1))
      return
    }

    if (e.key === "Home") {
      e.preventDefault()
      this._focusTrigger(0)
      return
    }

    if (e.key === "End") {
      e.preventDefault()
      this._focusTrigger(this.triggers.length - 1)
      return
    }

    if (["ArrowDown", "Enter", " "].includes(e.key)) {
      e.preventDefault()
      this._open(index)
      this._focusItem(index, 0)
      return
    }

    if (e.key === "Escape") {
      e.preventDefault()
      this._closeAll(true)
    }
  },

  _onMenuKey(e, index) {
    const items = this._enabledItems(index)
    const current = items.indexOf(e.target.closest('[role="menuitem"], button, a'))

    if (e.key === "ArrowDown") {
      e.preventDefault()
      this._focusItem(index, current + 1)
      return
    }

    if (e.key === "ArrowUp") {
      e.preventDefault()
      this._focusItem(index, current - 1)
      return
    }

    if (e.key === "Home") {
      e.preventDefault()
      this._focusItem(index, 0)
      return
    }

    if (e.key === "End") {
      e.preventDefault()
      this._focusItem(index, items.length - 1)
      return
    }

    if (e.key === "ArrowRight") {
      e.preventDefault()
      const next = this._nextTrigger(index, 1)
      this._open(next)
      this._focusItem(next, 0)
      return
    }

    if (e.key === "ArrowLeft") {
      e.preventDefault()
      const previous = this._nextTrigger(index, -1)
      this._open(previous)
      this._focusItem(previous, 0)
      return
    }

    if (e.key === "Escape") {
      e.preventDefault()
      this._closeAll(false)
      this._focusTrigger(index)
    }
  },

  _open(index) {
    this.contents.forEach((content, contentIndex) => {
      const trigger = this.triggers[contentIndex]
      const open = contentIndex === index
      if (!content || !trigger) return
      content.hidden = !open
      content.toggleAttribute("data-open", open)
      trigger.setAttribute("aria-expanded", open ? "true" : "false")
    })
    this.openIndex = index
    this.el.dataset.open = "true"
  },

  _closeAll(resetFocus) {
    this.contents.forEach((content, index) => {
      if (!content) return
      content.hidden = true
      content.removeAttribute("data-open")
      this.triggers[index]?.setAttribute("aria-expanded", "false")
    })
    this.openIndex = -1
    delete this.el.dataset.open
    if (resetFocus) this._setTriggerTabIndex(0)
  },

  _focusTrigger(index) {
    this._setTriggerTabIndex(index)
    this.triggers[index]?.focus()
    if (this.openIndex >= 0) this._open(index)
  },

  _setTriggerTabIndex(index) {
    this.triggers.forEach((trigger, triggerIndex) => {
      trigger?.setAttribute("tabindex", triggerIndex === index ? "0" : "-1")
    })
  },

  _focusItem(index, itemIndex) {
    const items = this._enabledItems(index)
    if (!items.length) return
    const bounded = (itemIndex + items.length) % items.length
    items[bounded].focus()
  },

  _nextTrigger(index, delta) {
    if (!this.triggers.length) return -1
    return (index + delta + this.triggers.length) % this.triggers.length
  },

  _items(index) {
    const content = this.contents[index]
    if (!content) return []
    return Array.from(content.querySelectorAll('[role="menuitem"], button, a'))
  },

  _enabledItems(index) {
    return this._items(index).filter((item) => !this._isDisabled(item))
  },

  _isDisabled(item) {
    return item.disabled || item.getAttribute("aria-disabled") === "true" || item.dataset.disabled === "true"
  },

  _unbind() {
    if (this._onClick) this.el.removeEventListener("click", this._onClick)
    if (this._onPointerEnter) this.el.removeEventListener("pointerover", this._onPointerEnter)
    if (this._onKeyDown) this.el.removeEventListener("keydown", this._onKeyDown)
    if (this._onDocumentPointerDown) document.removeEventListener("pointerdown", this._onDocumentPointerDown, true)
    if (this._onFocusOut) this.el.removeEventListener("focusout", this._onFocusOut)
    clearTimeout(this._focusOutTimer)
    delete this.el.dataset.ready
    this.menus = []
    this.triggers = []
    this.contents = []
    this.openIndex = -1
    this._onClick = null
    this._onPointerEnter = null
    this._onKeyDown = null
    this._onDocumentPointerDown = null
    this._onFocusOut = null
    this._focusOutTimer = null
  }
}

export { ExoMenubar }
