const ExoHoverCard = {
  mounted() {
    this.trigger = this.el.querySelector('[data-exo="hover-card-trigger"]')
    this.content = this.el.querySelector('[data-exo="hover-card-content"]')
    if (!this.trigger || !this.content) return

    this._showTimeout = null
    this._hideTimeout = null

    const show = () => {
      clearTimeout(this._hideTimeout)
      this._showTimeout = setTimeout(() => {
        this.content.setAttribute("data-open", "")
      }, 300)
    }

    const hide = () => {
      clearTimeout(this._showTimeout)
      this._hideTimeout = setTimeout(() => {
        this.content.removeAttribute("data-open")
      }, 200)
    }

    this.trigger.addEventListener("mouseenter", show)
    this.trigger.addEventListener("mouseleave", hide)
    this.content.addEventListener("mouseenter", () => clearTimeout(this._hideTimeout))
    this.content.addEventListener("mouseleave", hide)
    this.trigger.addEventListener("focus", show)
    this.trigger.addEventListener("blur", hide)

    this._cleanup = () => {
      this.trigger.removeEventListener("mouseenter", show)
      this.trigger.removeEventListener("mouseleave", hide)
      this.trigger.removeEventListener("focus", show)
      this.trigger.removeEventListener("blur", hide)
    }
  },

  destroyed() {
    if (this._cleanup) this._cleanup()
    clearTimeout(this._showTimeout)
    clearTimeout(this._hideTimeout)
  }
}

export { ExoHoverCard }
