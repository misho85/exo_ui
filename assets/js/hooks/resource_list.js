// Hooks of `resource_list/1`.

// A click anywhere in a row opens the row's link.
//
// A row that leads to a record carries exactly one `a[data-row-link]`, the
// only place it navigates from: the hook forwards a click on the rest of the
// row to that link with the same modifier keys, so LiveView and the browser
// do what they would on the link itself — navigate, or open a new tab without
// touching this page. A middle click opens the link in a new tab.
//
// The "row" is the smallest ancestor of the target (inside the hook's element)
// holding EXACTLY one row link: a `<tr>`, a card in a grid. An ancestor with
// more is the list, so a click on it opens nothing. A click on a control of
// the row (select, the link itself) or one that selected text is not forwarded.
const CONTROLS = [
  'a[href]',
  'button',
  'input',
  'select',
  'textarea',
  'label',
  'summary',
  '[contenteditable]',
  '[role=button]',
  '[role=checkbox]',
  '[role=link]',
  '[role=switch]',
  '[phx-click]'
].join(',')

function rowLinkFor(root, event) {
  const target = event.target instanceof Element ? event.target : event.target?.parentElement
  if (!target || !root.contains(target)) return null

  for (let el = target; el && el !== root; el = el.parentElement) {
    if (el.matches(CONTROLS)) return null
    const links = el.querySelectorAll('a[data-row-link]')
    if (links.length === 1) return links[0]
    if (links.length > 1) return null
  }
  return null
}

function selectingText() {
  const selection = window.getSelection()
  return Boolean(selection && !selection.isCollapsed && selection.toString().trim())
}

const ExoRowLink = {
  mounted() {
    this._onClick = (event) => {
      if (event.defaultPrevented || event.button !== 0) return
      const link = rowLinkFor(this.el, event)
      if (!link || selectingText()) return

      link.dispatchEvent(
        new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window,
          ctrlKey: event.ctrlKey,
          metaKey: event.metaKey,
          shiftKey: event.shiftKey,
          altKey: event.altKey
        })
      )
    }

    this._onAuxClick = (event) => {
      if (event.defaultPrevented || event.button !== 1) return
      const link = rowLinkFor(this.el, event)
      if (!link) return
      event.preventDefault()
      window.open(link.href, '_blank', 'noopener')
    }

    this.el.addEventListener('click', this._onClick)
    this.el.addEventListener('auxclick', this._onAuxClick)
  },

  destroyed() {
    this.el.removeEventListener('click', this._onClick)
    this.el.removeEventListener('auxclick', this._onAuxClick)
  }
}

// "Select all" on the server pushes `exo:bulk-select` with the page's ids; the
// rows' checkboxes follow without re-rendering the stream.
const ExoBulkSelect = {
  mounted() {
    this.handleEvent('exo:bulk-select', ({ prefix, ids, checked }) => {
      ids.forEach((id) => {
        const box = this.el.querySelector(`#${CSS.escape(`${prefix}-${id}`)}`)
        if (box) box.checked = checked
      })
    })
  }
}

// Column picker. A column with a key carries the class `exo-col-<key>` on its
// `<th>` and every `<td>`; the hook hides it with a style rule over that class,
// in a `<style>` inside its own element (`phx-update="ignore"`). So the choice
// needs no server, and holds for rows that arrive later. It is remembered in
// `localStorage` per list; a browser without storage only forgets.
const storageKey = (list) => `exo:resource-list:columns:${list}`

function readHidden(list) {
  try {
    const raw = localStorage.getItem(storageKey(list))
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((key) => typeof key === 'string') : []
  } catch (_error) {
    return []
  }
}

function writeHidden(list, hidden) {
  try {
    localStorage.setItem(storageKey(list), JSON.stringify(hidden))
  } catch (_error) {
    // without storage the choice lasts until the next load
  }
}

// A key from the markup is `[a-z0-9_-]`, but storage can hold anything: only
// a safe key goes into a selector.
const safeKey = (key) => /^[a-z0-9_-]+$/i.test(key)

const ExoListColumns = {
  mounted() {
    this.list = this.el.dataset.list
    this.target = this.el.dataset.target
    this.style = this.el.querySelector('[data-list-columns-style]')
    this.boxes = Array.from(this.el.querySelectorAll('input[data-col]'))

    const hidden = readHidden(this.list)
    this.boxes.forEach((box) => {
      box.checked = !hidden.includes(box.dataset.col)
    })
    this.apply()

    this.onChange = (event) => {
      if (!event.target.matches('input[data-col]')) return
      this.apply()
      writeHidden(this.list, this.hiddenKeys())
    }
    this.el.addEventListener('change', this.onChange)
  },

  destroyed() {
    this.el.removeEventListener('change', this.onChange)
  },

  hiddenKeys() {
    return this.boxes
      .filter((box) => !box.checked)
      .map((box) => box.dataset.col)
      .filter(safeKey)
  },

  apply() {
    const scope = this.target ? `#${CSS.escape(this.target)} ` : ''
    this.style.textContent = this.hiddenKeys()
      .map((key) => `${scope}.exo-col-${key}{display:none}`)
      .join('\n')
  }
}

// The server may rewrite the search (words that became filter chips leave it),
// but LiveView does not touch a focused field. `exo:list-search` writes the
// rest into it, so the next key does not send the old text again.
const ExoListSearch = {
  mounted() {
    this.handleEvent('exo:list-search', ({ list, value }) => {
      if (list !== this.el.dataset.list) return
      const input = this.el.querySelector('input[type="search"]')
      if (input) input.value = value
    })
  }
}

export { ExoRowLink, ExoBulkSelect, ExoListColumns, ExoListSearch }
