const ExoCommandPalette = {
  mounted() { this._bind() },
  updated() { this._bind() },
  destroyed() { this._unbind() },

  _bind() {
    this._unbind()
    this.backdrop = this.el.querySelector('[data-exo="command-palette-backdrop"]')
    this.input = this.el.querySelector('[data-exo="command-palette-input"]')
    this.list = this.el.querySelector('[data-exo="command-palette-list"]')

    const isOpen = () => this.el.classList.contains("open")
    const syncState = () => {
      this.el.dataset.state = isOpen() ? "open" : "closed"
    }

    this._open = () => {
      this.el.style.display = "block"
      this.el.classList.add("open")
      syncState()
      requestAnimationFrame(() => {
        if (this.input) this.input.focus()
      })
    }

    this._close = () => {
      this.el.classList.remove("open")
      this.el.style.display = "none"
      syncState()
      if (this.input) this.input.value = ""
    }

    syncState()

    this._onGlobalKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        isOpen() ? this._close() : this._open()
      }
    }
    document.addEventListener("keydown", this._onGlobalKey)

    this._onKey = (e) => {
      if (e.key === "Escape") this._close()
    }
    this.el.addEventListener("keydown", this._onKey)

    if (this.backdrop) {
      this._onBackdrop = () => this._close()
      this.backdrop.addEventListener("click", this._onBackdrop)
    }
  },

  _unbind() {
    if (this._onGlobalKey) document.removeEventListener("keydown", this._onGlobalKey)
    if (this._onKey) this.el.removeEventListener("keydown", this._onKey)
    if (this.backdrop && this._onBackdrop) {
      this.backdrop.removeEventListener("click", this._onBackdrop)
    }
    this.backdrop = null
    this.input = null
    this.list = null
    this._onGlobalKey = null
    this._onKey = null
    this._onBackdrop = null
    this._open = null
    this._close = null
  }
}

export { ExoCommandPalette }
