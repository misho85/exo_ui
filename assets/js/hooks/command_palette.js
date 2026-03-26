/**
 * ExoCommandPalette hook — Ctrl+K / Cmd+K searchable command dialog.
 */
const ExoCommandPalette = {
  mounted() {
    this.backdrop = this.el.querySelector('[data-exo="command-palette-backdrop"]')
    this.input = this.el.querySelector('[data-exo="command-palette-input"]')
    this.list = this.el.querySelector('[data-exo="command-palette-list"]')

    const isOpen = () => this.el.classList.contains("open")

    const open = () => {
      this.el.style.display = "block"
      this.el.classList.add("open")
      requestAnimationFrame(() => {
        if (this.input) this.input.focus()
      })
    }

    const close = () => {
      this.el.classList.remove("open")
      this.el.style.display = "none"
      if (this.input) this.input.value = ""
    }

    // Global Ctrl+K / Cmd+K
    document.addEventListener("keydown", this._onGlobalKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        isOpen() ? close() : open()
      }
    })

    // Escape to close
    this.el.addEventListener("keydown", this._onKey = (e) => {
      if (e.key === "Escape") close()
    })

    // Click backdrop to close
    if (this.backdrop) {
      this.backdrop.addEventListener("click", this._onBackdrop = () => close())
    }
  },

  destroyed() {
    if (this._onGlobalKey) document.removeEventListener("keydown", this._onGlobalKey)
  }
}

export { ExoCommandPalette }
