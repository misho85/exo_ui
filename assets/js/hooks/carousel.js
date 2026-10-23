/** Scrollable carousel with lifecycle-safe controls and logical navigation. */
const ExoCarousel = {
  mounted() { this._bind() },
  updated() { this._bind() },
  destroyed() { this._unbind() },

  _bind() {
    this._unbind()
    this.track = this.el.querySelector('[data-exo="carousel-track"]')
    this.viewport = this.el.querySelector('[data-exo="carousel-viewport"]')
    this.prev = this.el.querySelector('[data-exo="carousel-prev"]')
    this.next = this.el.querySelector('[data-exo="carousel-next"]')
    if (!this.track || !this.viewport) return

    this._onPrev = () => this._scroll(-1)
    this._onNext = () => this._scroll(1)
    this._onScroll = () => this._updateControls()
    this._onKey = (event) => {
      // Arrow keys inside a slide belong to its inputs and nested widgets.
      if (![this.el, this.viewport, this.prev, this.next].includes(event.target)) return
      if (event.altKey || event.ctrlKey || event.metaKey) return
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
      event.preventDefault()
      const direction = event.key === 'ArrowRight' ? 1 : -1
      this._scroll(direction * this._direction())
    }

    this.prev?.addEventListener('click', this._onPrev)
    this.next?.addEventListener('click', this._onNext)
    this.viewport.addEventListener('scroll', this._onScroll)
    this.el.addEventListener('keydown', this._onKey)
    this._resizeObserver = new ResizeObserver(this._onScroll)
    this._resizeObserver.observe(this.viewport)
    this._resizeObserver.observe(this.track)
    this._updateControls()
  },

  _direction() {
    return getComputedStyle(this.viewport).direction === 'rtl' ? -1 : 1
  },

  _bounds() {
    const max = Math.max(0, this.viewport.scrollWidth - this.viewport.clientWidth)
    const position = this.viewport.scrollLeft * this._direction()
    return { max, start: position <= 1, end: position >= max - 1 }
  },

  _updateControls() {
    const { max, start, end } = this._bounds()
    const loop = this.el.hasAttribute('data-loop')
    for (const [button, boundary] of [[this.prev, start], [this.next, end]]) {
      if (!button) continue
      const disabled = max <= 1 || (!loop && boundary)
      button.disabled = disabled
      button.toggleAttribute('data-disabled', disabled)
      button.setAttribute('aria-disabled', String(disabled))
    }
  },

  _scroll(direction) {
    const slide = this.track.querySelector('[data-exo="carousel-slide"]')
    if (!slide) return
    const { max, start, end } = this._bounds()
    const logicalDirection = this._direction()
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
    if (this.el.hasAttribute('data-loop') && (direction > 0 ? end : start)) {
      this.viewport.scrollTo({ left: direction > 0 ? 0 : max * logicalDirection, behavior })
    } else {
      const gap = parseFloat(getComputedStyle(this.track).columnGap) || 0
      this.viewport.scrollBy({ left: (slide.offsetWidth + gap) * direction * logicalDirection, behavior })
    }
  },

  _unbind() {
    this.prev?.removeEventListener('click', this._onPrev)
    this.next?.removeEventListener('click', this._onNext)
    this.viewport?.removeEventListener('scroll', this._onScroll)
    this.el.removeEventListener('keydown', this._onKey)
    this._resizeObserver?.disconnect()
    this._resizeObserver = null
  }
}

export { ExoCarousel }
