// Keyboard for the page header (`header/1`): Cmd/Ctrl+Enter presses the one
// primary action, K and J follow the previous and next record arrows.
//
// Nothing fires while a dialog, a drawer or an open popover (a menu, a
// select) holds the page: the shortcut belongs to what is on top. The
// letters also stay quiet while the viewer types in a field, and Shift or a
// modifier with them is someone else's shortcut.
//
// The primary's tooltip names its shortcut in the viewer's platform, which
// only the browser knows; the arrows' letters are the same everywhere, so the
// server writes their tooltips.

const EDITABLE = 'input, textarea, select, [contenteditable=""], [contenteditable="true"]'

const ON_TOP = [
  '[data-exo="modal"][data-state="open"]',
  '[data-exo="drawer"][data-state="open"]',
  '[data-exo="sheet"][data-state="open"]',
  'dialog[open]'
].join(',')

const ExoHeader = {
  mounted() {
    this._onKeydown = (event) => this._keydown(event)
    window.addEventListener('keydown', this._onKeydown)
    this._describe()
  },

  updated() { this._describe() },

  destroyed() { window.removeEventListener('keydown', this._onKeydown) },

  _primary() { return this.el.querySelector('[data-exo-header="primary"]') },

  _describe() {
    const primary = this._primary()
    if (!primary) return
    const platform = navigator.userAgentData?.platform || navigator.platform || navigator.userAgent
    const keys = /mac|iphone|ipad/i.test(platform) ? '⌘↵' : 'Ctrl+↵'
    primary.title = `${primary.textContent.trim()} (${keys})`
  },

  _blocked() {
    if (document.querySelector(ON_TOP)) return true
    try {
      return document.querySelector(':popover-open') !== null
    } catch (_error) {
      return false
    }
  },

  _keydown(event) {
    if (event.defaultPrevented || event.isComposing || event.repeat) return

    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey) {
      const primary = this._primary()
      if (!primary || primary.matches('[disabled], [aria-disabled="true"]') || this._blocked()) return
      event.preventDefault()
      primary.click()
      return
    }

    if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return
    const key = event.key.toLowerCase()
    if (key !== 'j' && key !== 'k') return
    if (event.target?.closest?.(EDITABLE) || this._blocked()) return

    const arrow = this.el.querySelector(`a[data-exo-header="${key === 'j' ? 'next' : 'prev'}"]`)
    if (!arrow) return
    event.preventDefault()
    arrow.click()
  }
}

export { ExoHeader }
