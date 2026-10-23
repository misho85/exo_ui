const ExoRating = {
  mounted() { this._bind() },
  updated() { this._bind() },
  destroyed() { this._unbind() },

  _bind() {
    this._unbind()
    this._hidden = this.el.querySelector('[data-exo="rating-value"]')
    this._inputs = [...this.el.querySelectorAll('[data-exo="rating-input"]')]
    if (this._inputs.length === 0) return

    this.el.setAttribute('data-ready', '')

    this._onChange = (event) => {
      const input = event.target.closest('[data-exo="rating-input"]')
      if (!input || !input.checked) return
      this._setValue(input.value, true)
    }

    this.el.addEventListener('change', this._onChange)
    this._setValue(this._hidden?.value || this.el.dataset.value || '0', false)
    this._form = this._inputs[0]?.form
    this._onReset = (event) => {
      clearTimeout(this._resetTimer)
      this._resetTimer = setTimeout(() => {
        if (!event.defaultPrevented) this._setValue(this._inputs.find(input => input.checked)?.value || '0', false)
      }, 0)
    }
    this._form?.addEventListener('reset', this._onReset)
  },

  _setValue(value, notify) {
    const numericValue = parseInt(value || '0', 10) || 0
    this.el.dataset.value = String(numericValue)
    if (this._hidden) this._hidden.value = String(numericValue)

    this.el.querySelectorAll('[data-exo="rating-star"]').forEach((star, index) => {
      star.toggleAttribute('data-active', index + 1 <= numericValue)
    })

    this._inputs.forEach((input) => {
      input.checked = input.value === String(numericValue)
    })

    if (notify && this._hidden) {
      this._hidden.dispatchEvent(new Event('input', { bubbles: true }))
      this._hidden.dispatchEvent(new Event('change', { bubbles: true }))
    }
  },

  _unbind() {
    clearTimeout(this._resetTimer)
    this._form?.removeEventListener('reset', this._onReset)
    this._form = null

    if (this._onChange) this.el.removeEventListener('change', this._onChange)
    if (this.el) this.el.removeAttribute('data-ready')
    this._hidden = null
    this._inputs = []
    this._onChange = null
  }
}

export { ExoRating }
