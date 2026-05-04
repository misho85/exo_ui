const ExoCombobox = {
  mounted() { this._bind() },
  updated() { this._bind() },
  destroyed() { this._unbind() },
  _bind() {
    this._unbind()
    const isInputTrigger = this.el.dataset.trigger === 'input'
    const filter = this.el.dataset.filter || 'server'
    const onFilter = this.el.dataset.onFilter
    const debounce = parseInt(this.el.dataset.debounce || '300', 10)

    this._search = isInputTrigger
      ? this.el.querySelector('[data-exo-combobox="input-trigger"]')
      : this.el.querySelector('[data-exo="combobox-search"]')

    const triggerBtn = this.el.querySelector('[data-exo-combobox="trigger"]')
    const popoverId = triggerBtn?.getAttribute('popovertarget') || this.el.querySelector('[data-exo="popover-content"]')?.id
    this._popover = popoverId ? document.getElementById(popoverId) : null
    this._hidden = this.el.closest('[data-exo="field"]')?.querySelector('input[type="hidden"]')
    this._listbox = this.el.querySelector('[role="listbox"]')
    this._empty = this.el.querySelector('[data-exo="combobox-empty"]')
    this._create = this.el.querySelector('[data-exo="combobox-create"]')

    this._clear = this.el.querySelector('[data-exo="combobox-clear"]')

    if (!this._popover) return
    if (this._listbox) this._syncOptions()

    const syncExpanded = () => {
      const open = this._popover.matches(':popover-open')
      if (triggerBtn) triggerBtn.setAttribute('aria-expanded', String(open))
      if (this._search) this._search.setAttribute('aria-expanded', String(open))
    }

    const focusSearch = () => {
      setTimeout(() => {
        if (!this._popover?.matches(':popover-open')) return
        this._search?.focus()

        if (document.activeElement !== this._search) {
          requestAnimationFrame(() => {
            if (this._popover?.matches(':popover-open')) this._search?.focus()
          })
        }
      }, 0)
    }

    syncExpanded()

    // Clear button
    if (this._clear) {
      this._onClear = (e) => {
        e.stopPropagation()
        if (this._hidden) {
          this._hidden.value = ''
          this._hidden.dispatchEvent(new Event('input', { bubbles: true }))
        }
        // Reset trigger display
        const valSpan = this.el.querySelector('[data-exo="combobox-value"]')
        if (valSpan) {
          valSpan.textContent = this._search?.placeholder || ''
          valSpan.setAttribute('data-placeholder', '')
        }
        // Clear visual selection
        if (this._listbox) {
          this._listbox.querySelectorAll('[data-exo="combobox-option"]').forEach(o => {
            o.setAttribute('aria-selected', 'false')
            delete o.dataset.selected
          })
        }
        this._clearActiveOption()
      }
      this._clear.addEventListener('click', this._onClear)
    }

    // Toggle event for aria-expanded
    this._onToggle = () => {
      const open = this._popover.matches(':popover-open')
      syncExpanded()
      if (open && this._search) {
        if (!isInputTrigger) {
          this._search.value = ''
          if (filter === 'client') this._clientFilter('')
          focusSearch()
        }
        this._setInitialActiveOption()
      } else if (!open) {
        this._clearActiveOption()
      }
    }
    this._popover.addEventListener('toggle', this._onToggle)

    // Input trigger: open/close via JS
    if (isInputTrigger && this._search) {
      this._onFocus = () => {
        try { this._popover.showPopover() } catch(_err) {}
      }
      this._onBlur = () => {
        const popover = this._popover
        setTimeout(() => {
          if (!popover) return
          if (!popover.contains(document.activeElement) && document.activeElement !== this._search) {
            try { popover.hidePopover() } catch(_err) {}
          }
        }, 200)
      }
      this._search.addEventListener('focus', this._onFocus)
      this._search.addEventListener('blur', this._onBlur)
    }

    // Search input handler
    if (this._search) {
      this._onInput = () => {
        const query = this._search.value
        if (filter === 'client') {
          this._clientFilter(query)
        } else {
          clearTimeout(this._debounceTimer)
          this._debounceTimer = setTimeout(() => {
            if (onFilter) this.pushEvent(onFilter, { query })
          }, debounce)
        }
        // Update create option text
        if (this._create) {
          const span = this._create.querySelector('[data-exo="combobox-create-query"]')
          if (span) span.textContent = query
          this._create.hidden = !query
        }
        this._syncActiveAfterFilter()
      }
      this._search.addEventListener('input', this._onInput)
    }

    // Option click
    if (this._listbox) {
      this._onClick = (e) => {
        const opt = e.target.closest('[data-exo="combobox-option"]:not([data-disabled])')
        if (!opt) return
        this._selectOption(opt)
      }
      this._listbox.addEventListener('click', this._onClick)

      // Keyboard
      this._onKeydown = (e) => {
        const opts = this._visibleOptions()
        if (!opts.length) return
        const idx = Math.max(opts.indexOf(this._activeOption), opts.indexOf(document.activeElement))
        let next = -1
        switch (e.key) {
          case 'ArrowDown': next = idx < opts.length - 1 ? idx + 1 : 0; break
          case 'ArrowUp': next = idx > 0 ? idx - 1 : opts.length - 1; break
          case 'Home': next = 0; break
          case 'End': next = opts.length - 1; break
          case 'Enter':
            if (idx >= 0) { this._selectOption(opts[idx]); e.preventDefault() }
            return
          case 'Escape':
            try { this._popover.hidePopover() } catch(_err) {}
            return
          default: return
        }
        e.preventDefault()
        this._setActiveOption(opts[next])
      }
      this._popover.addEventListener('keydown', this._onKeydown)
    }

    this.el.setAttribute('data-ready', '')
  },

  _syncOptions() {
    this._listbox.querySelectorAll('[data-exo="combobox-option"]').forEach((option, index) => {
      if (!option.id) option.id = `${this.el.id}-option-${index}`
      option.setAttribute('role', 'option')
      option.setAttribute('tabindex', '-1')
    })
  },

  _visibleOptions() {
    if (!this._listbox) return []

    return [...this._listbox.querySelectorAll('[data-exo="combobox-option"]:not([data-disabled]):not([hidden])')]
  },

  _setInitialActiveOption() {
    const selected = this._listbox?.querySelector('[data-exo="combobox-option"][data-selected]:not([hidden])')
    if (selected && !selected.hasAttribute('data-disabled')) this._setActiveOption(selected)
  },

  _setActiveOption(option) {
    if (!option) return

    if (this._activeOption && this._activeOption !== option) {
      delete this._activeOption.dataset.active
    }

    this._activeOption = option
    option.dataset.active = ''
    this._search?.setAttribute('aria-activedescendant', option.id)
    this._listbox?.setAttribute('aria-activedescendant', option.id)
    option.scrollIntoView({ block: 'nearest' })
  },

  _clearActiveOption() {
    if (this._activeOption) delete this._activeOption.dataset.active
    this._activeOption = null
    this._search?.removeAttribute('aria-activedescendant')
    this._listbox?.removeAttribute('aria-activedescendant')
  },

  _syncActiveAfterFilter() {
    const visible = this._visibleOptions()

    if (!visible.length) {
      this._clearActiveOption()
      return
    }

    if (!this._activeOption || this._activeOption.hidden || !visible.includes(this._activeOption)) {
      this._setActiveOption(visible[0])
    }
  },

  _clientFilter(query) {
    if (!this._listbox) return
    const q = query.toLowerCase()
    let hasVisible = false
    this._listbox.querySelectorAll('[data-exo="combobox-option"]').forEach(opt => {
      const match = !q || opt.textContent.trim().toLowerCase().includes(q)
      opt.hidden = !match
      if (match) hasVisible = true
    })
    if (this._empty) this._empty.hidden = hasVisible
  },
  _selectOption(opt) {
    const value = opt.dataset.value
    if (this._hidden) {
      this._hidden.value = value
      this._hidden.dispatchEvent(new Event('input', { bubbles: true }))
    }
    // Update visual state
    if (this._listbox) {
      this._listbox.querySelectorAll('[data-exo="combobox-option"]').forEach(o => {
        o.setAttribute('aria-selected', String(o.dataset.value === value))
        if (o.dataset.value === value) o.dataset.selected = ''
        else delete o.dataset.selected
      })
    }
    this._setActiveOption(opt)
    // Update trigger display
    const valSpan = this.el.querySelector('[data-exo="combobox-value"]')
    if (valSpan) {
      valSpan.textContent = opt.textContent.trim()
      valSpan.removeAttribute('data-placeholder')
    }
    try { this._popover?.hidePopover() } catch(_err) {}
  },
  _unbind() {
    clearTimeout(this._debounceTimer)
    this._debounceTimer = null
    if (this._popover) {
      if (this._onToggle) this._popover.removeEventListener('toggle', this._onToggle)
      if (this._onKeydown) this._popover.removeEventListener('keydown', this._onKeydown)
    }
    if (this._listbox && this._onClick) this._listbox.removeEventListener('click', this._onClick)
    if (this._search) {
      if (this._onInput) this._search.removeEventListener('input', this._onInput)
      if (this._onFocus) this._search.removeEventListener('focus', this._onFocus)
      if (this._onBlur) this._search.removeEventListener('blur', this._onBlur)
    }
    if (this._clear && this._onClear) this._clear.removeEventListener('click', this._onClear)
    if (this.el) this.el.removeAttribute('data-ready')
    this._popover = null
    this._listbox = null
    this._search = null
    this._clear = null
    this._empty = null
    this._create = null
    this._hidden = null
    this._activeOption = null
  }
}

export { ExoCombobox }
