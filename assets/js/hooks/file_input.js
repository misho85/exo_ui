const ExoFileInput = {
  mounted() {
    this.syncSelected = this.syncSelected.bind(this)
    this.bindFileInput()
  },

  updated() {
    this.unbindFileInput()
    this.bindFileInput()
  },

  destroyed() {
    this.unbindFileInput()
  },

  bindFileInput() {
    this.input = this.el.querySelector('[data-exo-file-input="input"]')
    this.selected = this.el.querySelector('[data-exo-file-input="selected"]')

    if (!this.input || !this.selected) return

    this.input.addEventListener('change', this.syncSelected)
    this.syncSelected()
    this._form = this.input?.form
    this._onReset = (event) => {
      clearTimeout(this._resetTimer)
      this._resetTimer = setTimeout(() => {
        if (!event.defaultPrevented) this.syncSelected()
      }, 0)
    }
    this._form?.addEventListener('reset', this._onReset)
  },

  unbindFileInput() {
    clearTimeout(this._resetTimer)
    this._form?.removeEventListener('reset', this._onReset)
    this._form = null

    if (!this.input) return

    this.input.removeEventListener('change', this.syncSelected)
  },

  syncSelected() {
    if (!this.input || !this.selected) return

    const files = Array.from(this.input.files || [])
    const emptyLabel = this.selected.dataset.emptyLabel || 'No file selected'
    const text = files.length > 0 ? files.map((file) => file.name).join(', ') : emptyLabel

    this.selected.textContent = text
  }
}

export { ExoFileInput }
