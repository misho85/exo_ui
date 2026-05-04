const ExoSwap = {
  mounted() { this._bind() },
  updated() { this._bind() },
  destroyed() { this._unbind() },

  _bind() {
    this._unbind()

    this.input = this.el.querySelector('[data-exo="swap-state"]')
    if (!this.input) return

    this.el.setAttribute('data-ready', '')
    this._sync()

    this._onChange = () => this._sync()
    this._onClick = (event) => {
      const target = event.target instanceof Element ? event.target : event.target?.parentElement
      const interactive = target?.closest('a, button, input, select, textarea')
      if (interactive && interactive !== this.input) return
      if (event.target === this.input) return

      event.preventDefault()
      this._toggle()
    }
    this._onKeydown = (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return

      event.preventDefault()
      this._toggle()
    }

    this.input.addEventListener('change', this._onChange)
    this.el.addEventListener('click', this._onClick)
    this.el.addEventListener('keydown', this._onKeydown)
  },

  _unbind() {
    if (this.input && this._onChange) this.input.removeEventListener('change', this._onChange)
    if (this.el && this._onClick) this.el.removeEventListener('click', this._onClick)
    if (this.el && this._onKeydown) this.el.removeEventListener('keydown', this._onKeydown)
    if (this.el) this.el.removeAttribute('data-ready')

    this.input = null
    this._onChange = null
    this._onClick = null
    this._onKeydown = null
  },

  _toggle() {
    if (!this.input) return

    this.input.checked = !this.input.checked
    this.input.dispatchEvent(new Event('change', { bubbles: true }))
  },

  _sync() {
    const checked = Boolean(this.input && this.input.checked)
    this.el.setAttribute('aria-checked', checked ? 'true' : 'false')
    this.el.toggleAttribute('data-active', checked)
  }
}

export { ExoSwap }
