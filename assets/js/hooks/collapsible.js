/**
 * ExoCollapsible hook — click toggle + aria-expanded sync.
 *
 * Uses a hidden checkbox to drive CSS state (same pattern as ExoAccordion).
 * The trigger button toggles the checkbox and syncs aria-expanded.
 */
const ExoCollapsible = {
  mounted() {
    this._checkbox = () => this.el.querySelector('[data-exo="collapsible-state"]')
    this._trigger = () => this.el.querySelector('[data-exo="collapsible-trigger"]')
    this._content = () => this.el.querySelector('[data-exo="collapsible-content"]')

    this.el.addEventListener("click", this._onClick = (e) => {
      const trigger = this._closestTrigger(e)
      if (!trigger) return

      const checkbox = this._checkbox()
      if (!checkbox) return

      checkbox.checked = !checkbox.checked
      this._syncState(trigger, checkbox.checked)
    })

    this._syncAria()
    this.el.setAttribute("data-ready", "")
  },

  updated() {
    this._syncAria()
  },

  destroyed() {
    if (this._onClick) this.el.removeEventListener("click", this._onClick)
    if (this.el) this.el.removeAttribute("data-ready")
  },

  _syncAria() {
    const checkbox = this._checkbox()
    const trigger = this._trigger()

    if (checkbox && trigger) {
      this._syncState(trigger, checkbox.checked)
    }
  },

  _syncState(trigger, expanded) {
    trigger.setAttribute("aria-expanded", String(expanded))

    const content = this._content()
    if (content) {
      content.setAttribute("aria-hidden", String(!expanded))
      content.inert = !expanded
    }
  },

  _closestTrigger(event) {
    const target = event.target instanceof Element ? event.target : event.target?.parentElement
    return target?.closest?.('[data-exo="collapsible-trigger"]')
  }
}

export { ExoCollapsible }
