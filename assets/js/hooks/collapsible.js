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

    this.el.addEventListener("click", this._onClick = (e) => {
      const trigger = e.target.closest('[data-exo="collapsible-trigger"]')
      if (!trigger) return

      const checkbox = this._checkbox()
      if (!checkbox) return

      checkbox.checked = !checkbox.checked
      trigger.setAttribute("aria-expanded", String(checkbox.checked))
    })

    this._syncAria()
  },

  updated() {
    this._syncAria()
  },

  destroyed() {
    if (this._onClick) this.el.removeEventListener("click", this._onClick)
  },

  _syncAria() {
    const checkbox = this._checkbox()
    const trigger = this._trigger()
    if (checkbox && trigger) {
      trigger.setAttribute("aria-expanded", String(checkbox.checked))
    }
  }
}

export { ExoCollapsible }
