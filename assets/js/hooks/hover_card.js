const ExoHoverCard = {
  mounted() { this._bind() },
  updated() { this._bind() },
  destroyed() { this._unbind() },

  _bind() {
    this._unbind()
    this.trigger = this.el.querySelector('[data-exo="hover-card-trigger"]')
    this.content = this.el.querySelector('[data-exo="hover-card-content"]')
    if (!this.trigger || !this.content) return
    this._showTimeout = null
    this._hideTimeout = null
    this._openDelay = Number.parseInt(this.el.dataset.openDelay || "300", 10)
    this._closeDelay = Number.parseInt(this.el.dataset.closeDelay || "150", 10)

    this._show = () => {
      clearTimeout(this._hideTimeout)
      clearTimeout(this._showTimeout)
      this._showTimeout = setTimeout(() => {
        this.content.hidden = false
        this.content.setAttribute("data-open", "")
        this.trigger.setAttribute("aria-expanded", "true")
      }, this._openDelay)
    }

    this._hide = () => {
      clearTimeout(this._showTimeout)
      this._hideTimeout = setTimeout(() => {
        this.content.removeAttribute("data-open")
        this.content.hidden = true
        this.trigger.setAttribute("aria-expanded", "false")
      }, this._closeDelay)
    }

    this._onFocusOut = (event) => {
      if (!this.el.contains(event.relatedTarget)) this._hide()
    }

    this._onKeydown = (event) => {
      if (event.key !== "Escape" || !this.content.hasAttribute("data-open")) return

      event.preventDefault()
      this._hideNow()
      this._firstFocusableTrigger()?.focus?.({ preventScroll: true })
    }

    this.el.addEventListener("pointerenter", this._show)
    this.el.addEventListener("pointerleave", this._hide)
    this.trigger.addEventListener("focusin", this._show)
    this.trigger.addEventListener("focusout", this._onFocusOut)
    this.content.addEventListener("focusin", this._show)
    this.content.addEventListener("focusout", this._onFocusOut)
    this.el.addEventListener("keydown", this._onKeydown)
    this.el.dataset.ready = "true"
  },

  _hideNow() {
    clearTimeout(this._showTimeout)
    clearTimeout(this._hideTimeout)
    this.content.removeAttribute("data-open")
    this.content.hidden = true
    this.trigger?.setAttribute("aria-expanded", "false")
  },

  _firstFocusableTrigger() {
    return this.trigger?.querySelector("a[href],button:not([disabled]),[tabindex]:not([tabindex='-1'])")
  },

  _unbind() {
    if (this.el && this._show) this.el.removeEventListener("pointerenter", this._show)
    if (this.el && this._hide) this.el.removeEventListener("pointerleave", this._hide)
    if (this.el && this._onKeydown) this.el.removeEventListener("keydown", this._onKeydown)
    if (this.el) delete this.el.dataset.ready
    if (this.trigger && this._show) this.trigger.removeEventListener("focusin", this._show)
    if (this.trigger && this._onFocusOut) this.trigger.removeEventListener("focusout", this._onFocusOut)
    if (this.content) {
      if (this._show) this.content.removeEventListener("focusin", this._show)
      if (this._onFocusOut) this.content.removeEventListener("focusout", this._onFocusOut)
    }
    clearTimeout(this._showTimeout)
    clearTimeout(this._hideTimeout)
    this.trigger = null
    this.content = null
    this._show = null
    this._hide = null
    this._onFocusOut = null
    this._onKeydown = null
    this._showTimeout = null
    this._hideTimeout = null
    this._openDelay = null
    this._closeDelay = null
  }
}

export { ExoHoverCard }
