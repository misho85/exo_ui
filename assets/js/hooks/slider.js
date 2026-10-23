const ExoSlider = {
  mounted() {
    this.syncValue = this.syncValue.bind(this)
    this.bindSlider()
  },

  updated() {
    this.unbindSlider()
    this.bindSlider()
  },

  destroyed() {
    this.unbindSlider()
  },

  bindSlider() {
    this.input = this.el.querySelector('[data-exo-slider="input"]')
    this.output = this.el.querySelector('[data-exo-slider="output"]')

    if (!this.input || !this.output) return

    this.input.addEventListener('input', this.syncValue)
    this.input.addEventListener('change', this.syncValue)
    this.syncValue()
    this._form = this.input?.form
    this._onReset = (event) => {
      clearTimeout(this._resetTimer)
      this._resetTimer = setTimeout(() => {
        if (!event.defaultPrevented) this.syncValue()
      }, 0)
    }
    this._form?.addEventListener('reset', this._onReset)
  },

  unbindSlider() {
    clearTimeout(this._resetTimer)
    this._form?.removeEventListener('reset', this._onReset)
    this._form = null

    if (!this.input) return

    this.input.removeEventListener('input', this.syncValue)
    this.input.removeEventListener('change', this.syncValue)
  },

  syncValue() {
    if (!this.input || !this.output) return

    const suffix = this.output.dataset.suffix || ''
    const visibleValue = `${this.input.value}${suffix}`
    const ariaValueText = this.output.dataset.ariaValueText || (suffix ? visibleValue : '')

    this.output.textContent = visibleValue

    if (ariaValueText) {
      this.input.setAttribute('aria-valuetext', ariaValueText)
    } else {
      this.input.removeAttribute('aria-valuetext')
    }
  }
}

export { ExoSlider }
