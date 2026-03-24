let lastHideTime = 0
const SKIP_DELAY_MS = 300
const hasAnchorPos =
  typeof CSS !== 'undefined' && CSS.supports('position-area', 'top')

const GAP = 4 // matches var(--exo-space-1)

const ExoTooltip = {
  mounted() {
    const wrapper = this.el
    const anchor = wrapper.querySelector('[data-exo="tooltip-anchor"]')
    const content = wrapper.querySelector('[data-exo="tooltip-content"]')
    if (!anchor || !content) return

    this._anchor = anchor
    this._content = content
    this._timeout = null
    this._declaredSide = content.dataset.side
    this._delay = parseInt(content.dataset.delay) || 500

    // Upgrade to popover API — enables top-layer rendering.
    // Before this, CSS-only :hover fallback keeps the tooltip functional.
    content.setAttribute('popover', 'manual')

    const show = () => {
      clearTimeout(this._timeout)
      const elapsed = Date.now() - lastHideTime
      const wait = elapsed < SKIP_DELAY_MS ? 0 : this._delay
      this._timeout = setTimeout(() => {
        try { content.showPopover() } catch (_) { return }
        requestAnimationFrame(() => {
          if (!hasAnchorPos) this._positionFallback()
          this._detectFlip()
        })
      }, wait)
    }

    const hide = () => {
      clearTimeout(this._timeout)
      try {
        if (content.matches(':popover-open')) {
          content.hidePopover()
          lastHideTime = Date.now()
          content.dataset.side = this._declaredSide
          if (!hasAnchorPos) {
            content.style.top = ''
            content.style.left = ''
          }
        }
      } catch (_) {}
    }

    wrapper.addEventListener('mouseenter', this._show = () => show())
    wrapper.addEventListener('mouseleave', this._hide = () => hide())
    anchor.addEventListener('focusin', this._focusIn = () => show())
    anchor.addEventListener('focusout', this._focusOut = (e) => {
      if (!wrapper.contains(e.relatedTarget)) hide()
    })
    wrapper.addEventListener('keydown', this._keydown = (e) => {
      if (e.key === 'Escape') hide()
    })
  },

  /** Detect if anchor positioning flipped the side and update data-side for arrow CSS. */
  _detectFlip() {
    const ar = this._anchor.getBoundingClientRect()
    const cr = this._content.getBoundingClientRect()
    let actual
    if (cr.bottom <= ar.top + 1) actual = 'top'
    else if (cr.top >= ar.bottom - 1) actual = 'bottom'
    else if (cr.right <= ar.left + 1) actual = 'left'
    else if (cr.left >= ar.right - 1) actual = 'right'
    else actual = this._declaredSide
    this._content.dataset.side = actual
  },

  /** JS positioning for browsers without CSS anchor positioning (Safari). */
  _positionFallback() {
    const ar = this._anchor.getBoundingClientRect()
    const cw = this._content.offsetWidth
    const ch = this._content.offsetHeight
    const side = this._declaredSide
    const align = this._content.dataset.align || 'center'
    let top, left

    if (side === 'top' || side === 'bottom') {
      top = side === 'top' ? ar.top - ch - GAP : ar.bottom + GAP
      if (align === 'start') left = ar.left
      else if (align === 'end') left = ar.right - cw
      else left = ar.left + (ar.width - cw) / 2
    } else {
      left = side === 'left' ? ar.left - cw - GAP : ar.right + GAP
      top = ar.top + (ar.height - ch) / 2
    }

    this._content.style.top = `${top}px`
    this._content.style.left = `${left}px`
  },

  destroyed() {
    clearTimeout(this._timeout)
  }
}

export { ExoTooltip }
