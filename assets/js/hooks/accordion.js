/**
 * ExoAccordion hook — keyboard navigation + single-open enforcement.
 *
 * Reads data-type ("single"|"multiple") and data-collapsible from the root element.
 * - single: only one item open at a time
 * - multiple: any number of items open (default checkbox behavior)
 * - collapsible: in single mode, allows closing the open item
 *
 * Keyboard:
 *   ArrowDown / ArrowUp — move focus between triggers
 *   Home / End — focus first / last trigger
 *   Enter / Space — toggle item (handled natively by button, but we manage single-mode)
 */
const ExoAccordion = {
  mounted() {
    this._triggers = () =>
      Array.from(this.el.querySelectorAll('[data-exo="accordion-trigger"]:not([disabled])'))

    this._checkboxes = () =>
      Array.from(this.el.querySelectorAll('[data-exo="accordion-state"]:not([disabled])'))

    this._isSingle = () => this.el.dataset.type === "single"
    this._isCollapsible = () => this.el.hasAttribute("data-collapsible")

    // Keyboard navigation
    this.el.addEventListener("keydown", this._onKeydown = (e) => {
      const trigger = this._closestTrigger(e)
      if (!trigger) return

      const triggers = this._triggers()
      const idx = triggers.indexOf(trigger)
      if (idx === -1) return

      let target = null

      switch (e.key) {
        case "ArrowDown":
          target = triggers[(idx + 1) % triggers.length]
          break
        case "ArrowUp":
          target = triggers[(idx - 1 + triggers.length) % triggers.length]
          break
        case "Home":
          target = triggers[0]
          break
        case "End":
          target = triggers[triggers.length - 1]
          break
        default:
          return
      }

      if (target) {
        e.preventDefault()
        target.focus()
      }
    })

    // Click handling for single mode + collapsible + aria-expanded sync
    this.el.addEventListener("click", this._onClick = (e) => {
      const trigger = this._closestTrigger(e)
      if (!trigger || trigger.disabled) return

      const item = trigger.closest('[data-exo="accordion-item"]')
      const checkbox = item?.querySelector('[data-exo="accordion-state"]')
      if (!checkbox) return

      const wasChecked = checkbox.checked

      if (this._isSingle()) {
        if (wasChecked && this._isCollapsible()) {
          // Close this item
          checkbox.checked = false
          this._syncAria(trigger, false)
        } else if (wasChecked && !this._isCollapsible()) {
          // Keep open, prevent toggle
          e.preventDefault()
          return
        } else {
          // Close all others, open this one
          this._checkboxes().forEach((cb) => {
            if (cb !== checkbox && cb.checked) {
              cb.checked = false
              const otherTrigger = cb.parentElement.querySelector('[data-exo="accordion-trigger"]')
              if (otherTrigger) this._syncAria(otherTrigger, false)
            }
          })
          checkbox.checked = true
          this._syncAria(trigger, true)
        }
      } else {
        // Multiple mode — just toggle
        checkbox.checked = !wasChecked
        this._syncAria(trigger, checkbox.checked)
      }
    })

    // Sync initial aria states
    this._syncAllAria()
    this.el.setAttribute("data-ready", "")
  },

  updated() {
    this._syncAllAria()
  },

  destroyed() {
    if (this._onKeydown) this.el.removeEventListener("keydown", this._onKeydown)
    if (this._onClick) this.el.removeEventListener("click", this._onClick)
    if (this.el) this.el.removeAttribute("data-ready")
  },

  _syncAria(trigger, expanded) {
    trigger.setAttribute("aria-expanded", String(expanded))

    const contentId = trigger.getAttribute("aria-controls")
    const content = contentId ? document.getElementById(contentId) : null

    if (content && this.el.contains(content)) {
      content.setAttribute("aria-hidden", String(!expanded))
      content.inert = !expanded
    }
  },

  _closestTrigger(event) {
    const target = event.target instanceof Element ? event.target : event.target?.parentElement
    return target?.closest?.('[data-exo="accordion-trigger"]')
  },

  _syncAllAria() {
    const items = this.el.querySelectorAll('[data-exo="accordion-item"]')
    items.forEach((item) => {
      const checkbox = item.querySelector('[data-exo="accordion-state"]')
      const trigger = item.querySelector('[data-exo="accordion-trigger"]')
      if (checkbox && trigger) {
        this._syncAria(trigger, checkbox.checked)
      }
    })
  }
}

export { ExoAccordion }
