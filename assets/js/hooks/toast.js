const ExoToast = {
  mounted() { this._bind() },
  updated() { this._bind() },
  destroyed() { this._clearTimers() },

  _bind() {
    this._timers ||= new Map()
    this._remaining ||= new Map()
    this._duration = Number.parseInt(this.el.dataset.duration || "5000", 10)
    this._autoDismiss = this.el.dataset.autoDismiss === "true"

    this.el.dataset.ready = "true"

    this._toasts().forEach((toast) => {
      if (!toast.dataset.exoToastBound) this._bindToast(toast)
      if (this._autoDismiss && !this._timers.has(toast.id)) {
        this._schedule(toast, this._duration)
      }
    })
  },

  _bindToast(toast) {
    toast.dataset.exoToastBound = "true"

    toast.addEventListener("pointerenter", () => this._pause(toast))
    toast.addEventListener("pointerleave", () => this._resume(toast))
    toast.addEventListener("focusin", () => this._pause(toast))
    toast.addEventListener("focusout", () => this._resume(toast))
    toast.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return
      event.preventDefault()
      this._dismiss(toast)
    })
  },

  _toasts() {
    return Array.from(this.el.querySelectorAll('[data-exo="toast"][id]'))
  },

  _schedule(toast, delay) {
    if (!this._autoDismiss || !toast?.id || toast.hidden) return

    this._clearTimer(toast.id)
    const timeout = window.setTimeout(() => this._dismiss(toast), delay)
    this._timers.set(toast.id, { timeout, startedAt: Date.now(), delay })
  },

  _pause(toast) {
    const timer = this._timers?.get(toast.id)
    if (!timer) return

    window.clearTimeout(timer.timeout)
    this._timers.delete(toast.id)
    this._remaining.set(toast.id, Math.max(0, timer.delay - (Date.now() - timer.startedAt)))
  },

  _resume(toast) {
    if (!this._autoDismiss || !toast?.id || toast.hidden) return

    const delay = this._remaining.get(toast.id) || this._duration
    this._remaining.delete(toast.id)
    this._schedule(toast, delay)
  },

  _dismiss(toast) {
    if (!toast?.id) return

    this._clearTimer(toast.id)
    this._remaining.delete(toast.id)
    toast.hidden = true
    toast.setAttribute("data-state", "closed")
  },

  _clearTimer(id) {
    const timer = this._timers?.get(id)
    if (!timer) return

    window.clearTimeout(timer.timeout)
    this._timers.delete(id)
  },

  _clearTimers() {
    if (!this._timers) return

    this._timers.forEach(({ timeout }) => window.clearTimeout(timeout))
    this._timers.clear()
    this._remaining?.clear()
  }
}

export { ExoToast }
