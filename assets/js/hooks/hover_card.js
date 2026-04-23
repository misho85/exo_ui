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

    this._show = () => {
      clearTimeout(this._hideTimeout)
      this._showTimeout = setTimeout(() => {
        this.content.setAttribute("data-open", "")
      }, 300)
    }

    this._hide = () => {
      clearTimeout(this._showTimeout)
      this._hideTimeout = setTimeout(() => {
        this.content.removeAttribute("data-open")
      }, 200)
    }

    this._cancelHide = () => clearTimeout(this._hideTimeout)

    this.trigger.addEventListener("mouseenter", this._show)
    this.trigger.addEventListener("mouseleave", this._hide)
    this.content.addEventListener("mouseenter", this._cancelHide)
    this.content.addEventListener("mouseleave", this._hide)
    this.trigger.addEventListener("focus", this._show)
    this.trigger.addEventListener("blur", this._hide)
  },

  _unbind() {
    if (this.trigger) {
      if (this._show) this.trigger.removeEventListener("mouseenter", this._show)
      if (this._hide) this.trigger.removeEventListener("mouseleave", this._hide)
      if (this._show) this.trigger.removeEventListener("focus", this._show)
      if (this._hide) this.trigger.removeEventListener("blur", this._hide)
    }
    if (this.content) {
      if (this._cancelHide) this.content.removeEventListener("mouseenter", this._cancelHide)
      if (this._hide) this.content.removeEventListener("mouseleave", this._hide)
    }
    clearTimeout(this._showTimeout)
    clearTimeout(this._hideTimeout)
    this.trigger = null
    this.content = null
    this._show = null
    this._hide = null
    this._cancelHide = null
    this._showTimeout = null
    this._hideTimeout = null
  }
}

export { ExoHoverCard }
