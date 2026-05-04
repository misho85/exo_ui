const ExoDatePicker = {
  mounted() {
    this._bind()
  },

  updated() {
    this._bind()
  },

  destroyed() {
    this._unbind()
  },

  _bind() {
    this._unbind()
    this._grid = this.el.querySelector('[data-exo="date-picker-grid"]')

    if (!this._grid) return

    this._onKeydown = (event) => {
      const day = this._closestDay(event)
      if (!day) return

      if (event.key === "PageUp" || event.key === "PageDown") {
        event.preventDefault()
        this._clickNav(event.key === "PageUp" ? "Previous month" : "Next month")
        return
      }

      const target = this._targetForKey(day, event)
      if (!target) return

      event.preventDefault()
      this._focusDay(target)
    }

    this._grid.addEventListener("keydown", this._onKeydown)
    this._syncTabStop()
    this.el.setAttribute("data-ready", "")
  },

  _unbind() {
    if (this._grid && this._onKeydown) {
      this._grid.removeEventListener("keydown", this._onKeydown)
    }

    if (this.el) this.el.removeAttribute("data-ready")
    this._grid = null
    this._onKeydown = null
  },

  _targetForKey(day, event) {
    switch (event.key) {
      case "ArrowLeft":
        return this._moveBy(day, -1)
      case "ArrowRight":
        return this._moveBy(day, 1)
      case "ArrowUp":
        return this._moveBy(day, -7)
      case "ArrowDown":
        return this._moveBy(day, 7)
      case "Home":
        return this._rowTarget(day, "first")
      case "End":
        return this._rowTarget(day, "last")
      default:
        return null
    }
  },

  _moveBy(day, delta) {
    const days = this._days()
    const index = days.indexOf(day)
    if (index === -1) return null

    const step = delta > 0 ? 1 : -1
    let nextIndex = index + delta

    while (nextIndex >= 0 && nextIndex < days.length) {
      const candidate = days[nextIndex]
      if (!this._isDisabled(candidate)) return candidate
      nextIndex += step
    }

    return null
  },

  _rowTarget(day, position) {
    const row = day.closest('[data-exo="date-picker-week"]')
    const days = Array.from(row?.querySelectorAll('[data-exo="date-picker-day"]') || [])
      .filter((candidate) => !this._isDisabled(candidate))

    if (days.length === 0) return null
    return position === "first" ? days[0] : days[days.length - 1]
  },

  _clickNav(label) {
    const button = Array.from(this.el.querySelectorAll('[data-exo="date-picker-nav"]'))
      .find((candidate) => candidate.getAttribute("aria-label") === label)

    if (button && !button.disabled) button.click()
  },

  _focusDay(day) {
    this._days().forEach((candidate) => {
      candidate.tabIndex = candidate === day ? 0 : -1
    })

    day.focus()
  },

  _syncTabStop() {
    const enabled = this._days().filter((day) => !this._isDisabled(day))
    if (enabled.length === 0) return

    const active = enabled.find((day) => day.tabIndex === 0) || enabled[0]
    enabled.forEach((day) => {
      day.tabIndex = day === active ? 0 : -1
    })
  },

  _days() {
    return Array.from(this.el.querySelectorAll('[data-exo="date-picker-day"]'))
  },

  _closestDay(event) {
    const target = event.target instanceof Element ? event.target : event.target?.parentElement
    return target?.closest?.('[data-exo="date-picker-day"]')
  },

  _isDisabled(day) {
    return day.disabled || day.getAttribute("aria-disabled") === "true"
  }
}

export { ExoDatePicker }
