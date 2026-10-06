const ExoToast = {
  mounted() {
    this._states = new Map()
    this._onPointerOver = (event) => this._setPaused(event, 'pointer', true)
    this._onPointerOut = (event) => this._setPaused(event, 'pointer', false)
    this._onFocusIn = (event) => this._setPaused(event, 'focus', true)
    this._onFocusOut = (event) => this._setPaused(event, 'focus', false)
    this._onKeydown = (event) => {
      const toast = this._toastFor(event)
      if (event.key !== 'Escape' || !toast) return
      event.preventDefault()
      event.stopPropagation()
      this._dismiss(toast)
    }
    this._onClick = (event) => {
      const toast = this._toastFor(event)
      if (toast && event.target.closest('[data-exo="toast-close"]')) this._dismiss(toast)
    }
    this._listeners = {
      pointerover: this._onPointerOver, pointerout: this._onPointerOut,
      focusin: this._onFocusIn, focusout: this._onFocusOut,
      keydown: this._onKeydown, click: this._onClick
    }
    for (const [type, listener] of Object.entries(this._listeners)) this.el.addEventListener(type, listener)
    this._sync()
  },

  updated() { this._sync() },

  destroyed() {
    for (const [type, listener] of Object.entries(this._listeners)) this.el.removeEventListener(type, listener)
    this._states.forEach((state) => clearTimeout(state.timer))
    this._states.clear()
    delete this.el.dataset.ready
  },

  _sync() {
    const duration = Number.parseInt(this.el.dataset.duration, 10)
    this._duration = Number.isFinite(duration) ? Math.max(0, duration) : 5000
    this._autoDismiss = this.el.dataset.autoDismiss === 'true'
    const toasts = new Set(this.el.querySelectorAll('[data-exo="toast"][id]'))
    for (const [toast, state] of this._states) {
      if (!toasts.has(toast)) {
        clearTimeout(state.timer)
        this._states.delete(toast)
      }
    }
    for (const toast of toasts) {
      let state = this._states.get(toast)
      if (!state) {
        state = { remaining: this._duration, timer: null, paused: new Set() }
        if (toast.matches(':hover')) state.paused.add('pointer')
        if (toast.contains(document.activeElement)) state.paused.add('focus')
        this._states.set(toast, state)
      }
      if (!this._autoDismiss || toast.hidden) this._pause(state)
      else this._schedule(toast, state)
    }
    this.el.dataset.ready = 'true'
  },

  _toastFor(event) {
    const toast = event.target.closest('[data-exo="toast"][id]')
    return this._states.has(toast) ? toast : null
  },

  _setPaused(event, reason, paused) {
    const toast = this._toastFor(event)
    if (!toast || toast.contains(event.relatedTarget)) return
    const state = this._states.get(toast)
    if (paused) {
      state.paused.add(reason)
      this._pause(state)
    } else {
      state.paused.delete(reason)
      this._schedule(toast, state)
    }
  },

  _pause(state) {
    if (state.timer === null) return
    clearTimeout(state.timer)
    state.timer = null
    state.remaining = Math.max(0, state.remaining - (Date.now() - state.startedAt))
  },

  _schedule(toast, state) {
    if (!this._autoDismiss || toast.hidden || state.paused.size || state.timer !== null) return
    state.startedAt = Date.now()
    state.timer = setTimeout(() => this._dismiss(toast), state.remaining)
  },

  _dismiss(toast) {
    const state = this._states.get(toast)
    if (state) this._pause(state)
    toast.hidden = true
    toast.setAttribute('data-state', 'closed')
  }
}

export { ExoToast }
