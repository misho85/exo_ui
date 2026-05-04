const ExoRating = {
  mounted() { this._bind() },
  updated() { this._bind() },
  destroyed() { this._unbind() },

  _bind() {
    this._unbind()
    this._hidden = this.el.querySelector('[data-exo="rating-value"]')
    this._inputs = [...this.el.querySelectorAll('[data-exo="rating-input"]')]
    if (!this._hidden || this._inputs.length === 0) return

    this.el.setAttribute('data-ready', '')

    this._onClick = (event) => {
      const star = event.target.closest('[data-exo="rating-star"]')
      if (!star) return
      const input = star.querySelector('[data-exo="rating-input"]')
      if (!input || input.disabled) return
      input.checked = true
      this._setValue(input.value, true)
    }

    this._onChange = (event) => {
      const input = event.target.closest('[data-exo="rating-input"]')
      if (!input || !input.checked) return
      this._setValue(input.value, true)
    }

    this.el.addEventListener('click', this._onClick)
    this.el.addEventListener('change', this._onChange)
    this._setValue(this._hidden.value || this.el.dataset.value || '0', false)
  },

  _setValue(value, notify) {
    const numericValue = parseInt(value || '0', 10) || 0
    this.el.dataset.value = String(numericValue)
    this._hidden.value = String(numericValue)

    this.el.querySelectorAll('[data-exo="rating-star"]').forEach((star, index) => {
      star.toggleAttribute('data-active', index + 1 <= numericValue)
    })

    this._inputs.forEach((input) => {
      input.checked = input.value === String(numericValue)
    })

    if (notify) {
      this._hidden.dispatchEvent(new Event('input', { bubbles: true }))
      this._hidden.dispatchEvent(new Event('change', { bubbles: true }))
    }
  },

  _unbind() {
    if (this._onClick) this.el.removeEventListener('click', this._onClick)
    if (this._onChange) this.el.removeEventListener('change', this._onChange)
    if (this.el) this.el.removeAttribute('data-ready')
    this._hidden = null
    this._inputs = []
    this._onClick = null
    this._onChange = null
  }
}

export { ExoRating }
