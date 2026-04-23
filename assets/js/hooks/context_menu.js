const ExoContextMenu = {
  mounted() { this._bind() },
  updated() { this._bind() },
  destroyed() { this._unbind() },

  _bind() {
    this._unbind()
    this.trigger = this.el.querySelector('[data-exo="context-menu-trigger"]')
    this.menu = this.el.querySelector('[data-exo="context-menu-content"]')
    if (!this.trigger || !this.menu) return

    this._close = (e) => {
      if (this.trigger?.contains(e.target)) return
      if (!this.menu.contains(e.target)) {
        this.menu.removeAttribute("data-open")
        document.removeEventListener("click", this._close)
        document.removeEventListener("contextmenu", this._close)
      }
    }

    this._onContext = (e) => {
      e.preventDefault()
      this.menu.style.left = e.clientX + "px"
      this.menu.style.top = e.clientY + "px"
      this.menu.setAttribute("data-open", "")
      document.addEventListener("click", this._close)
      document.addEventListener("contextmenu", this._close)
    }
    this.trigger.addEventListener("contextmenu", this._onContext)

    this._onItemClick = (e) => {
      const item = e.target.closest('[data-exo="context-menu-item"]')
      if (item && !item.disabled) {
        this.menu.removeAttribute("data-open")
        document.removeEventListener("click", this._close)
        document.removeEventListener("contextmenu", this._close)
      }
    }
    this.menu.addEventListener("click", this._onItemClick)

    this._onKeydown = (e) => {
      if (e.key === "Escape") {
        this.menu.removeAttribute("data-open")
        document.removeEventListener("click", this._close)
        document.removeEventListener("contextmenu", this._close)
      }
    }
    this.el.addEventListener("keydown", this._onKeydown)
  },

  _unbind() {
    if (this.trigger && this._onContext) this.trigger.removeEventListener("contextmenu", this._onContext)
    if (this.menu && this._onItemClick) this.menu.removeEventListener("click", this._onItemClick)
    if (this._onKeydown) this.el.removeEventListener("keydown", this._onKeydown)
    if (this._close) {
      document.removeEventListener("click", this._close)
      document.removeEventListener("contextmenu", this._close)
    }
    this.trigger = null
    this.menu = null
    this._onContext = null
    this._onItemClick = null
    this._onKeydown = null
    this._close = null
  }
}

export { ExoContextMenu }
