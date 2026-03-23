const ExoTooltip = {
  mounted() {
    this._onKeydown = (e) => {
      if (e.key === 'Escape') {
        this.el.dataset.dismissed = ''
        this.el.addEventListener('mouseleave', () => {
          delete this.el.dataset.dismissed
        }, { once: true })
      }
    }
    this.el.addEventListener('keydown', this._onKeydown)
  },
  destroyed() {
    if (this._onKeydown) this.el.removeEventListener('keydown', this._onKeydown)
  }
}

export { ExoTooltip }
