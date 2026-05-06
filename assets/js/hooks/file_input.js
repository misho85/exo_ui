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
  },

  unbindFileInput() {
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
