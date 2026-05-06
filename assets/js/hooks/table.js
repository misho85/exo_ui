const ExoTable = {
  mounted() {
    this._onKeydown = (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return

      const target = event.target instanceof Element ? event.target : event.target?.parentElement
      const row = target?.closest?.('[data-exo="table-row"][data-clickable]')

      if (!row || row !== target || !this.el.contains(row)) return

      event.preventDefault()
      row.click()
    }

    this.el.addEventListener('keydown', this._onKeydown)
  },

  destroyed() {
    if (this._onKeydown) this.el.removeEventListener('keydown', this._onKeydown)
    this._onKeydown = null
  }
}

export { ExoTable }
