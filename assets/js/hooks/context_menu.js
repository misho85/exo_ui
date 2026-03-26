const ExoContextMenu = {
  mounted() {
    this.trigger = this.el.querySelector('[data-exo="context-menu-trigger"]')
    this.menu = this.el.querySelector('[data-exo="context-menu-content"]')
    if (!this.trigger || !this.menu) return

    this.trigger.addEventListener("contextmenu", this._onContext = (e) => {
      e.preventDefault()
      this.menu.style.left = e.clientX + "px"
      this.menu.style.top = e.clientY + "px"
      this.menu.setAttribute("data-open", "")

      const close = (ev) => {
        if (!this.menu.contains(ev.target)) {
          this.menu.removeAttribute("data-open")
          document.removeEventListener("click", close)
          document.removeEventListener("contextmenu", close)
        }
      }
      setTimeout(() => {
        document.addEventListener("click", close)
        document.addEventListener("contextmenu", close)
      }, 0)
    })

    this.menu.addEventListener("click", this._onItemClick = (e) => {
      const item = e.target.closest('[data-exo="context-menu-item"]')
      if (item && !item.disabled) {
        this.menu.removeAttribute("data-open")
      }
    })

    this.el.addEventListener("keydown", this._onKeydown = (e) => {
      if (e.key === "Escape") this.menu.removeAttribute("data-open")
    })
  },

  destroyed() {
    if (this.trigger && this._onContext) this.trigger.removeEventListener("contextmenu", this._onContext)
  }
}

export { ExoContextMenu }
