/**
 * ExoCarousel hook — scrollable carousel with prev/next buttons.
 */
const ExoCarousel = {
  mounted() {
    this.track = this.el.querySelector('[data-exo="carousel-track"]')
    this.viewport = this.el.querySelector('[data-exo="carousel-viewport"]')
    this.prev = this.el.querySelector('[data-exo="carousel-prev"]')
    this.next = this.el.querySelector('[data-exo="carousel-next"]')
    if (!this.track || !this.viewport) return

    const slides = () => Array.from(this.track.querySelectorAll('[data-exo="carousel-slide"]'))
    const loop = this.el.hasAttribute("data-loop")
    const atStart = () => this.viewport.scrollLeft <= 5
    const atEnd = () => this.viewport.scrollLeft >= this.viewport.scrollWidth - this.viewport.offsetWidth - 5

    const setButtonState = (button, disabled) => {
      if (!button) return
      button.disabled = disabled
      button.toggleAttribute("data-disabled", disabled)
      button.setAttribute("aria-disabled", disabled ? "true" : "false")
    }

    const updateControls = () => {
      if (loop) {
        setButtonState(this.prev, false)
        setButtonState(this.next, false)
        return
      }

      setButtonState(this.prev, atStart())
      setButtonState(this.next, atEnd())
    }

    const scrollTo = (direction) => {
      const s = slides()
      if (s.length === 0) return
      const slideWidth = s[0].offsetWidth
      const gap = parseFloat(getComputedStyle(this.track).gap) || 0
      const scrollAmount = slideWidth + gap

      if (direction === "next") {
        if (loop && atEnd()) {
          this.viewport.scrollTo({ left: 0, behavior: "smooth" })
        } else {
          this.viewport.scrollBy({ left: scrollAmount, behavior: "smooth" })
        }
      } else {
        if (loop && atStart()) {
          this.viewport.scrollTo({ left: this.viewport.scrollWidth, behavior: "smooth" })
        } else {
          this.viewport.scrollBy({ left: -scrollAmount, behavior: "smooth" })
        }
      }

      window.setTimeout(updateControls, 350)
    }

    if (this.prev) this.prev.addEventListener("click", this._onPrev = () => scrollTo("prev"))
    if (this.next) this.next.addEventListener("click", this._onNext = () => scrollTo("next"))
    this.viewport.addEventListener("scroll", this._onScroll = () => updateControls())
    window.addEventListener("resize", this._onResize = () => updateControls())

    this.el.addEventListener("keydown", this._onKey = (e) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); scrollTo("prev") }
      if (e.key === "ArrowRight") { e.preventDefault(); scrollTo("next") }
    })

    updateControls()
  },

  destroyed() {
    if (this.prev && this._onPrev) this.prev.removeEventListener("click", this._onPrev)
    if (this.next && this._onNext) this.next.removeEventListener("click", this._onNext)
    if (this.viewport && this._onScroll) this.viewport.removeEventListener("scroll", this._onScroll)
    if (this._onResize) window.removeEventListener("resize", this._onResize)
    if (this._onKey) this.el.removeEventListener("keydown", this._onKey)
  }
}

export { ExoCarousel }
