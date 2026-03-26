(() => {
  // ../../assets/js/hooks/accordion.js
  var ExoAccordion = {
    mounted() {
      this._triggers = () => Array.from(this.el.querySelectorAll('[data-exo="accordion-trigger"]:not([disabled])'));
      this._checkboxes = () => Array.from(this.el.querySelectorAll('[data-exo="accordion-state"]:not([disabled])'));
      this._isSingle = () => this.el.dataset.type === "single";
      this._isCollapsible = () => this.el.hasAttribute("data-collapsible");
      this.el.addEventListener("keydown", this._onKeydown = (e) => {
        const trigger = e.target.closest('[data-exo="accordion-trigger"]');
        if (!trigger) return;
        const triggers = this._triggers();
        const idx = triggers.indexOf(trigger);
        if (idx === -1) return;
        let target = null;
        switch (e.key) {
          case "ArrowDown":
            target = triggers[(idx + 1) % triggers.length];
            break;
          case "ArrowUp":
            target = triggers[(idx - 1 + triggers.length) % triggers.length];
            break;
          case "Home":
            target = triggers[0];
            break;
          case "End":
            target = triggers[triggers.length - 1];
            break;
          default:
            return;
        }
        if (target) {
          e.preventDefault();
          target.focus();
        }
      });
      this.el.addEventListener("click", this._onClick = (e) => {
        const trigger = e.target.closest('[data-exo="accordion-trigger"]');
        if (!trigger || trigger.disabled) return;
        const item = trigger.closest('[data-exo="accordion-item"]');
        const checkbox = item?.querySelector('[data-exo="accordion-state"]');
        if (!checkbox) return;
        const wasChecked = checkbox.checked;
        if (this._isSingle()) {
          if (wasChecked && this._isCollapsible()) {
            checkbox.checked = false;
            this._syncAria(trigger, false);
          } else if (wasChecked && !this._isCollapsible()) {
            e.preventDefault();
            return;
          } else {
            this._checkboxes().forEach((cb) => {
              if (cb !== checkbox && cb.checked) {
                cb.checked = false;
                const otherTrigger = cb.parentElement.querySelector('[data-exo="accordion-trigger"]');
                if (otherTrigger) this._syncAria(otherTrigger, false);
              }
            });
            checkbox.checked = true;
            this._syncAria(trigger, true);
          }
        } else {
          checkbox.checked = !wasChecked;
          this._syncAria(trigger, checkbox.checked);
        }
      });
      this._syncAllAria();
    },
    updated() {
      this._syncAllAria();
    },
    destroyed() {
      if (this._onKeydown) this.el.removeEventListener("keydown", this._onKeydown);
      if (this._onClick) this.el.removeEventListener("click", this._onClick);
    },
    _syncAria(trigger, expanded) {
      trigger.setAttribute("aria-expanded", String(expanded));
    },
    _syncAllAria() {
      const items = this.el.querySelectorAll('[data-exo="accordion-item"]');
      items.forEach((item) => {
        const checkbox = item.querySelector('[data-exo="accordion-state"]');
        const trigger = item.querySelector('[data-exo="accordion-trigger"]');
        if (checkbox && trigger) {
          this._syncAria(trigger, checkbox.checked);
        }
      });
    }
  };

  // ../../assets/js/hooks/sidebar.js
  var ExoSidebar = {
    mounted() {
      this.toggle = this.el.querySelector('[data-exo="sidebar-toggle"]');
      if (!this.toggle) return;
      this._applyState();
      requestAnimationFrame(() => {
        document.documentElement.setAttribute("data-sidebar-ready", "");
      });
      this._onChange = () => {
        if (window.matchMedia("(min-width: 768px)").matches) {
          localStorage.setItem("exo-sidebar-collapsed", this.toggle.checked ? "false" : "true");
        }
      };
      this.toggle.addEventListener("change", this._onChange);
    },
    destroyed() {
      if (this.toggle && this._onChange) {
        this.toggle.removeEventListener("change", this._onChange);
      }
    },
    updated() {
      this._applyState();
    },
    _applyState() {
      if (!this.toggle) return;
      const isDesktop = window.matchMedia("(min-width: 768px)").matches;
      if (isDesktop) {
        const collapsed = localStorage.getItem("exo-sidebar-collapsed") === "true";
        this.toggle.checked = !collapsed;
      } else {
        this.toggle.checked = false;
      }
    }
  };

  // ../../assets/js/hooks/theme_toggle.js
  var ExoThemeToggle = {
    mounted() {
      this._apply(this._current());
      this._handlers = [];
      this.el.querySelectorAll("[data-theme-value]").forEach((btn) => {
        const handler = () => {
          const value = btn.getAttribute("data-theme-value");
          this._apply(value);
          localStorage.setItem("exo-theme", value);
        };
        btn.addEventListener("click", handler);
        this._handlers.push({ btn, handler });
      });
    },
    destroyed() {
      this._handlers?.forEach(
        ({ btn, handler }) => btn.removeEventListener("click", handler)
      );
    },
    _current() {
      return localStorage.getItem("exo-theme") || "system";
    },
    _apply(theme) {
      const root = document.documentElement;
      this.el.querySelectorAll("[data-theme-value]").forEach((btn) => {
        btn.toggleAttribute("data-active", btn.getAttribute("data-theme-value") === theme);
      });
      if (theme === "system") {
        root.removeAttribute("data-theme");
      } else {
        root.setAttribute("data-theme", theme);
      }
    }
  };

  // ../../assets/js/hooks/popover.js
  var ExoPopover = {
    mounted() {
      this._bind();
    },
    updated() {
      this._bind();
    },
    destroyed() {
      this._unbind();
    },
    _bind() {
      this._unbind();
      const trigger = this.el.querySelector('[data-exo="popover-trigger"]');
      const id = trigger?.getAttribute("popovertarget");
      this._popover = id ? document.getElementById(id) : null;
      if (!this._popover) return;
      this._onToggle = () => {
        const open = this._popover.matches(":popover-open");
        trigger.setAttribute("aria-expanded", String(open));
      };
      this._popover.addEventListener("toggle", this._onToggle);
    },
    _unbind() {
      if (this._popover && this._onToggle) {
        this._popover.removeEventListener("toggle", this._onToggle);
      }
      this._popover = null;
      this._onToggle = null;
    }
  };

  // ../../assets/js/hooks/dropdown_menu.js
  var ExoDropdownMenu = {
    mounted() {
      this._bind();
    },
    updated() {
      this._bind();
    },
    destroyed() {
      this._unbind();
    },
    _bind() {
      this._unbind();
      this._menu = this.el.matches('[role="menu"]') ? this.el : this.el.querySelector('[role="menu"]');
      if (!this._menu) return;
      this._onKeydown = (e) => {
        const items = [...this._menu.querySelectorAll('[role="menuitem"]:not([disabled])')];
        if (!items.length) return;
        const idx = items.indexOf(document.activeElement);
        let next = -1;
        switch (e.key) {
          case "ArrowDown":
            next = idx < items.length - 1 ? idx + 1 : 0;
            break;
          case "ArrowUp":
            next = idx > 0 ? idx - 1 : items.length - 1;
            break;
          case "Home":
            next = 0;
            break;
          case "End":
            next = items.length - 1;
            break;
          default:
            return;
        }
        e.preventDefault();
        items[next]?.focus();
      };
      this._menu.addEventListener("keydown", this._onKeydown);
    },
    _unbind() {
      if (this._menu && this._onKeydown) {
        this._menu.removeEventListener("keydown", this._onKeydown);
      }
      this._menu = null;
      this._onKeydown = null;
    }
  };

  // ../../assets/js/hooks/select.js
  var ExoSelect = {
    mounted() {
      this._bind();
    },
    updated() {
      this._bind();
    },
    destroyed() {
      this._unbind();
    },
    _bind() {
      this._unbind();
      this._trigger = this.el.querySelector('[data-exo-select="trigger"]');
      const popoverId = this._trigger?.getAttribute("popovertarget");
      this._popover = popoverId ? document.getElementById(popoverId) : null;
      this._listbox = this.el.querySelector('[role="listbox"]');
      this._hidden = this.el.closest('[data-exo="field"]')?.querySelector('input[type="hidden"]');
      if (!this._popover || !this._listbox) return;
      this._onToggle = () => {
        const open = this._popover.matches(":popover-open");
        this._trigger.setAttribute("aria-expanded", String(open));
        if (open) {
          const selected = this._listbox.querySelector("[data-selected]");
          const first = this._listbox.querySelector('[data-exo="select-option"]:not([data-disabled])');
          const target = selected || first;
          if (target) target.focus();
        }
      };
      this._popover.addEventListener("toggle", this._onToggle);
      this._onClick = (e) => {
        const opt = e.target.closest('[data-exo="select-option"]');
        if (!opt || opt.hasAttribute("data-disabled")) return;
        this._selectOption(opt);
      };
      this._listbox.addEventListener("click", this._onClick);
      this._onKeydown = (e) => {
        const options = [...this._listbox.querySelectorAll('[data-exo="select-option"]:not([data-disabled])')];
        if (!options.length) return;
        const idx = options.indexOf(document.activeElement);
        let next = -1;
        switch (e.key) {
          case "ArrowDown":
            next = idx < options.length - 1 ? idx + 1 : 0;
            break;
          case "ArrowUp":
            next = idx > 0 ? idx - 1 : options.length - 1;
            break;
          case "Home":
            next = 0;
            break;
          case "End":
            next = options.length - 1;
            break;
          case "Enter":
          case " ":
            e.preventDefault();
            if (idx >= 0) this._selectOption(options[idx]);
            return;
          case "Escape":
            this._popover.hidePopover();
            this._trigger.focus();
            return;
          default:
            this._typeAhead(e.key, options);
            return;
        }
        e.preventDefault();
        if (next >= 0) options[next].focus();
      };
      this._listbox.addEventListener("keydown", this._onKeydown);
    },
    _selectOption(opt) {
      const value = opt.getAttribute("data-value");
      const text = opt.textContent.trim();
      if (this._hidden) {
        this._hidden.value = value;
        this._hidden.dispatchEvent(new Event("input", { bubbles: true }));
      }
      this._listbox.querySelectorAll('[data-exo="select-option"]').forEach((o) => {
        const isSelected = o.getAttribute("data-value") === value;
        o.setAttribute("aria-selected", String(isSelected));
        if (isSelected) {
          o.setAttribute("data-selected", "");
        } else {
          o.removeAttribute("data-selected");
        }
      });
      const valueEl = this._trigger.querySelector('[data-exo="select-value"]');
      if (valueEl) valueEl.textContent = text;
      this._popover.hidePopover();
      this._trigger.focus();
    },
    _typeAhead(char, options) {
      if (char.length !== 1) return;
      const lower = char.toLowerCase();
      const currentIdx = options.indexOf(document.activeElement);
      const start = currentIdx + 1;
      const rotated = [...options.slice(start), ...options.slice(0, start)];
      const match = rotated.find((o) => o.textContent.trim().toLowerCase().startsWith(lower));
      if (match) match.focus();
    },
    _unbind() {
      if (this._popover && this._onToggle) {
        this._popover.removeEventListener("toggle", this._onToggle);
      }
      if (this._listbox && this._onClick) {
        this._listbox.removeEventListener("click", this._onClick);
      }
      if (this._listbox && this._onKeydown) {
        this._listbox.removeEventListener("keydown", this._onKeydown);
      }
      this._trigger = null;
      this._popover = null;
      this._listbox = null;
      this._hidden = null;
      this._onToggle = null;
      this._onClick = null;
      this._onKeydown = null;
    }
  };

  // ../../assets/js/hooks/combobox.js
  var ExoCombobox = {
    mounted() {
      this._bind();
    },
    updated() {
      this._bind();
    },
    destroyed() {
      this._unbind();
    },
    _bind() {
      this._unbind();
      const isInputTrigger = this.el.dataset.trigger === "input";
      const filter = this.el.dataset.filter || "server";
      const onFilter = this.el.dataset.onFilter;
      const debounce = parseInt(this.el.dataset.debounce || "300", 10);
      this._search = isInputTrigger ? this.el.querySelector('[data-exo-combobox="input-trigger"]') : this.el.querySelector('[data-exo="combobox-search"]');
      const triggerBtn = this.el.querySelector('[data-exo-combobox="trigger"]');
      const popoverId = triggerBtn?.getAttribute("popovertarget") || this.el.querySelector('[data-exo="popover-content"]')?.id;
      this._popover = popoverId ? document.getElementById(popoverId) : null;
      this._hidden = this.el.closest('[data-exo="field"]')?.querySelector('input[type="hidden"]');
      this._listbox = this.el.querySelector('[role="listbox"]');
      this._empty = this.el.querySelector('[data-exo="combobox-empty"]');
      this._create = this.el.querySelector('[data-exo="combobox-create"]');
      this._clear = this.el.querySelector('[data-exo="combobox-clear"]');
      if (!this._popover) return;
      if (this._clear) {
        this._onClear = (e) => {
          e.stopPropagation();
          if (this._hidden) {
            this._hidden.value = "";
            this._hidden.dispatchEvent(new Event("input", { bubbles: true }));
          }
          const valSpan = this.el.querySelector('[data-exo="combobox-value"]');
          if (valSpan) valSpan.textContent = this._search?.placeholder || "";
          if (this._listbox) {
            this._listbox.querySelectorAll('[data-exo="combobox-option"]').forEach((o) => {
              o.setAttribute("aria-selected", "false");
              delete o.dataset.selected;
            });
          }
        };
        this._clear.addEventListener("click", this._onClear);
      }
      this._onToggle = () => {
        const open = this._popover.matches(":popover-open");
        if (triggerBtn) triggerBtn.setAttribute("aria-expanded", String(open));
        if (this._search) this._search.setAttribute("aria-expanded", String(open));
        if (open && this._search && !isInputTrigger) {
          this._search.value = "";
          this._search.focus();
          if (filter === "client") this._clientFilter("");
        }
      };
      this._popover.addEventListener("toggle", this._onToggle);
      if (isInputTrigger && this._search) {
        this._onFocus = () => {
          try {
            this._popover.showPopover();
          } catch (_err) {
          }
        };
        this._onBlur = () => {
          const popover = this._popover;
          setTimeout(() => {
            if (!popover) return;
            if (!popover.contains(document.activeElement) && document.activeElement !== this._search) {
              try {
                popover.hidePopover();
              } catch (_err) {
              }
            }
          }, 200);
        };
        this._search.addEventListener("focus", this._onFocus);
        this._search.addEventListener("blur", this._onBlur);
      }
      if (this._search) {
        this._onInput = () => {
          const query = this._search.value;
          if (filter === "client") {
            this._clientFilter(query);
          } else {
            clearTimeout(this._debounceTimer);
            this._debounceTimer = setTimeout(() => {
              if (onFilter) this.pushEvent(onFilter, { query });
            }, debounce);
          }
          if (this._create) {
            const span = this._create.querySelector('[data-exo="combobox-create-query"]');
            if (span) span.textContent = query;
            this._create.hidden = !query;
          }
        };
        this._search.addEventListener("input", this._onInput);
      }
      if (this._listbox) {
        this._onClick = (e) => {
          const opt = e.target.closest('[data-exo="combobox-option"]:not([data-disabled])');
          if (!opt) return;
          this._selectOption(opt);
        };
        this._listbox.addEventListener("click", this._onClick);
        this._onKeydown = (e) => {
          const opts = [...this._listbox.querySelectorAll('[data-exo="combobox-option"]:not([data-disabled]):not([hidden])')];
          if (!opts.length) return;
          const idx = opts.indexOf(document.activeElement);
          let next = -1;
          switch (e.key) {
            case "ArrowDown":
              next = idx < opts.length - 1 ? idx + 1 : 0;
              break;
            case "ArrowUp":
              next = idx > 0 ? idx - 1 : opts.length - 1;
              break;
            case "Home":
              next = 0;
              break;
            case "End":
              next = opts.length - 1;
              break;
            case "Enter":
              if (idx >= 0) {
                this._selectOption(opts[idx]);
                e.preventDefault();
              }
              return;
            case "Escape":
              try {
                this._popover.hidePopover();
              } catch (_err) {
              }
              return;
            default:
              return;
          }
          e.preventDefault();
          opts[next]?.focus();
        };
        this._popover.addEventListener("keydown", this._onKeydown);
      }
    },
    _clientFilter(query) {
      if (!this._listbox) return;
      const q = query.toLowerCase();
      let hasVisible = false;
      this._listbox.querySelectorAll('[data-exo="combobox-option"]').forEach((opt) => {
        const match = !q || opt.textContent.trim().toLowerCase().includes(q);
        opt.hidden = !match;
        if (match) hasVisible = true;
      });
      if (this._empty) this._empty.hidden = hasVisible;
    },
    _selectOption(opt) {
      const value = opt.dataset.value;
      if (this._hidden) {
        this._hidden.value = value;
        this._hidden.dispatchEvent(new Event("input", { bubbles: true }));
      }
      if (this._listbox) {
        this._listbox.querySelectorAll('[data-exo="combobox-option"]').forEach((o) => {
          o.setAttribute("aria-selected", String(o.dataset.value === value));
          if (o.dataset.value === value) o.dataset.selected = "";
          else delete o.dataset.selected;
        });
      }
      const valSpan = this.el.querySelector('[data-exo="combobox-value"]');
      if (valSpan) valSpan.textContent = opt.textContent.trim();
      if (!this.el.dataset.multiple) {
        try {
          this._popover?.hidePopover();
        } catch (_err) {
        }
      }
    },
    _unbind() {
      clearTimeout(this._debounceTimer);
      this._debounceTimer = null;
      if (this._popover) {
        if (this._onToggle) this._popover.removeEventListener("toggle", this._onToggle);
        if (this._onKeydown) this._popover.removeEventListener("keydown", this._onKeydown);
      }
      if (this._listbox && this._onClick) this._listbox.removeEventListener("click", this._onClick);
      if (this._search) {
        if (this._onInput) this._search.removeEventListener("input", this._onInput);
        if (this._onFocus) this._search.removeEventListener("focus", this._onFocus);
        if (this._onBlur) this._search.removeEventListener("blur", this._onBlur);
      }
      if (this._clear && this._onClear) this._clear.removeEventListener("click", this._onClear);
      this._popover = null;
      this._listbox = null;
      this._search = null;
      this._clear = null;
      this._empty = null;
      this._create = null;
      this._hidden = null;
    }
  };

  // ../../assets/js/hooks/tooltip.js
  var lastHideTime = 0;
  var SKIP_DELAY_MS = 300;
  var hasAnchorPos = typeof CSS !== "undefined" && CSS.supports("position-area", "top");
  var GAP = 4;
  var ExoTooltip = {
    mounted() {
      const wrapper = this.el;
      const anchor = wrapper.querySelector('[data-exo="tooltip-anchor"]');
      const content = wrapper.querySelector('[data-exo="tooltip-content"]');
      if (!anchor || !content) return;
      this._anchor = anchor;
      this._content = content;
      this._timeout = null;
      this._declaredSide = content.dataset.side;
      this._delay = parseInt(content.dataset.delay) || 500;
      content.setAttribute("popover", "manual");
      const show = () => {
        clearTimeout(this._timeout);
        const elapsed = Date.now() - lastHideTime;
        const wait = elapsed < SKIP_DELAY_MS ? 0 : this._delay;
        this._timeout = setTimeout(() => {
          try {
            content.showPopover();
          } catch (_) {
            return;
          }
          requestAnimationFrame(() => {
            if (!hasAnchorPos) this._positionFallback();
            this._detectFlip();
          });
        }, wait);
      };
      const hide = () => {
        clearTimeout(this._timeout);
        try {
          if (content.matches(":popover-open")) {
            content.hidePopover();
            lastHideTime = Date.now();
            content.dataset.side = this._declaredSide;
            if (!hasAnchorPos) {
              content.style.top = "";
              content.style.left = "";
            }
          }
        } catch (_) {
        }
      };
      wrapper.addEventListener("mouseenter", this._show = () => show());
      wrapper.addEventListener("mouseleave", this._hide = () => hide());
      anchor.addEventListener("focusin", this._focusIn = () => show());
      anchor.addEventListener("focusout", this._focusOut = (e) => {
        if (!wrapper.contains(e.relatedTarget)) hide();
      });
      wrapper.addEventListener("keydown", this._keydown = (e) => {
        if (e.key === "Escape") hide();
      });
    },
    /** Detect if anchor positioning flipped the side and update data-side for arrow CSS. */
    _detectFlip() {
      const ar = this._anchor.getBoundingClientRect();
      const cr = this._content.getBoundingClientRect();
      let actual;
      if (cr.bottom <= ar.top + 1) actual = "top";
      else if (cr.top >= ar.bottom - 1) actual = "bottom";
      else if (cr.right <= ar.left + 1) actual = "left";
      else if (cr.left >= ar.right - 1) actual = "right";
      else actual = this._declaredSide;
      this._content.dataset.side = actual;
    },
    /** JS positioning for browsers without CSS anchor positioning (Safari). */
    _positionFallback() {
      const ar = this._anchor.getBoundingClientRect();
      const cw = this._content.offsetWidth;
      const ch = this._content.offsetHeight;
      const side = this._declaredSide;
      const align = this._content.dataset.align || "center";
      let top, left;
      if (side === "top" || side === "bottom") {
        top = side === "top" ? ar.top - ch - GAP : ar.bottom + GAP;
        if (align === "start") left = ar.left;
        else if (align === "end") left = ar.right - cw;
        else left = ar.left + (ar.width - cw) / 2;
      } else {
        left = side === "left" ? ar.left - cw - GAP : ar.right + GAP;
        top = ar.top + (ar.height - ch) / 2;
      }
      this._content.style.top = `${top}px`;
      this._content.style.left = `${left}px`;
    },
    destroyed() {
      clearTimeout(this._timeout);
    }
  };

  // ../../assets/js/index.js
  var hooks = {
    ExoAccordion,
    ExoSidebar,
    ExoThemeToggle,
    ExoPopover,
    ExoDropdownMenu,
    ExoSelect,
    ExoCombobox,
    ExoTooltip
  };

  // js/storybook.js
  window.storybook = {
    Hooks: hooks,
    Params: {},
    Uploaders: {}
  };
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vYXNzZXRzL2pzL2hvb2tzL2FjY29yZGlvbi5qcyIsICIuLi8uLi8uLi8uLi9hc3NldHMvanMvaG9va3Mvc2lkZWJhci5qcyIsICIuLi8uLi8uLi8uLi9hc3NldHMvanMvaG9va3MvdGhlbWVfdG9nZ2xlLmpzIiwgIi4uLy4uLy4uLy4uL2Fzc2V0cy9qcy9ob29rcy9wb3BvdmVyLmpzIiwgIi4uLy4uLy4uLy4uL2Fzc2V0cy9qcy9ob29rcy9kcm9wZG93bl9tZW51LmpzIiwgIi4uLy4uLy4uLy4uL2Fzc2V0cy9qcy9ob29rcy9zZWxlY3QuanMiLCAiLi4vLi4vLi4vLi4vYXNzZXRzL2pzL2hvb2tzL2NvbWJvYm94LmpzIiwgIi4uLy4uLy4uLy4uL2Fzc2V0cy9qcy9ob29rcy90b29sdGlwLmpzIiwgIi4uLy4uLy4uLy4uL2Fzc2V0cy9qcy9pbmRleC5qcyIsICIuLi8uLi8uLi9hc3NldHMvanMvc3Rvcnlib29rLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKipcbiAqIEV4b0FjY29yZGlvbiBob29rIFx1MjAxNCBrZXlib2FyZCBuYXZpZ2F0aW9uICsgc2luZ2xlLW9wZW4gZW5mb3JjZW1lbnQuXG4gKlxuICogUmVhZHMgZGF0YS10eXBlIChcInNpbmdsZVwifFwibXVsdGlwbGVcIikgYW5kIGRhdGEtY29sbGFwc2libGUgZnJvbSB0aGUgcm9vdCBlbGVtZW50LlxuICogLSBzaW5nbGU6IG9ubHkgb25lIGl0ZW0gb3BlbiBhdCBhIHRpbWVcbiAqIC0gbXVsdGlwbGU6IGFueSBudW1iZXIgb2YgaXRlbXMgb3BlbiAoZGVmYXVsdCBjaGVja2JveCBiZWhhdmlvcilcbiAqIC0gY29sbGFwc2libGU6IGluIHNpbmdsZSBtb2RlLCBhbGxvd3MgY2xvc2luZyB0aGUgb3BlbiBpdGVtXG4gKlxuICogS2V5Ym9hcmQ6XG4gKiAgIEFycm93RG93biAvIEFycm93VXAgXHUyMDE0IG1vdmUgZm9jdXMgYmV0d2VlbiB0cmlnZ2Vyc1xuICogICBIb21lIC8gRW5kIFx1MjAxNCBmb2N1cyBmaXJzdCAvIGxhc3QgdHJpZ2dlclxuICogICBFbnRlciAvIFNwYWNlIFx1MjAxNCB0b2dnbGUgaXRlbSAoaGFuZGxlZCBuYXRpdmVseSBieSBidXR0b24sIGJ1dCB3ZSBtYW5hZ2Ugc2luZ2xlLW1vZGUpXG4gKi9cbmNvbnN0IEV4b0FjY29yZGlvbiA9IHtcbiAgbW91bnRlZCgpIHtcbiAgICB0aGlzLl90cmlnZ2VycyA9ICgpID0+XG4gICAgICBBcnJheS5mcm9tKHRoaXMuZWwucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZXhvPVwiYWNjb3JkaW9uLXRyaWdnZXJcIl06bm90KFtkaXNhYmxlZF0pJykpXG5cbiAgICB0aGlzLl9jaGVja2JveGVzID0gKCkgPT5cbiAgICAgIEFycmF5LmZyb20odGhpcy5lbC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1leG89XCJhY2NvcmRpb24tc3RhdGVcIl06bm90KFtkaXNhYmxlZF0pJykpXG5cbiAgICB0aGlzLl9pc1NpbmdsZSA9ICgpID0+IHRoaXMuZWwuZGF0YXNldC50eXBlID09PSBcInNpbmdsZVwiXG4gICAgdGhpcy5faXNDb2xsYXBzaWJsZSA9ICgpID0+IHRoaXMuZWwuaGFzQXR0cmlidXRlKFwiZGF0YS1jb2xsYXBzaWJsZVwiKVxuXG4gICAgLy8gS2V5Ym9hcmQgbmF2aWdhdGlvblxuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5fb25LZXlkb3duID0gKGUpID0+IHtcbiAgICAgIGNvbnN0IHRyaWdnZXIgPSBlLnRhcmdldC5jbG9zZXN0KCdbZGF0YS1leG89XCJhY2NvcmRpb24tdHJpZ2dlclwiXScpXG4gICAgICBpZiAoIXRyaWdnZXIpIHJldHVyblxuXG4gICAgICBjb25zdCB0cmlnZ2VycyA9IHRoaXMuX3RyaWdnZXJzKClcbiAgICAgIGNvbnN0IGlkeCA9IHRyaWdnZXJzLmluZGV4T2YodHJpZ2dlcilcbiAgICAgIGlmIChpZHggPT09IC0xKSByZXR1cm5cblxuICAgICAgbGV0IHRhcmdldCA9IG51bGxcblxuICAgICAgc3dpdGNoIChlLmtleSkge1xuICAgICAgICBjYXNlIFwiQXJyb3dEb3duXCI6XG4gICAgICAgICAgdGFyZ2V0ID0gdHJpZ2dlcnNbKGlkeCArIDEpICUgdHJpZ2dlcnMubGVuZ3RoXVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgXCJBcnJvd1VwXCI6XG4gICAgICAgICAgdGFyZ2V0ID0gdHJpZ2dlcnNbKGlkeCAtIDEgKyB0cmlnZ2Vycy5sZW5ndGgpICUgdHJpZ2dlcnMubGVuZ3RoXVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgXCJIb21lXCI6XG4gICAgICAgICAgdGFyZ2V0ID0gdHJpZ2dlcnNbMF1cbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIFwiRW5kXCI6XG4gICAgICAgICAgdGFyZ2V0ID0gdHJpZ2dlcnNbdHJpZ2dlcnMubGVuZ3RoIC0gMV1cbiAgICAgICAgICBicmVha1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBpZiAodGFyZ2V0KSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICB0YXJnZXQuZm9jdXMoKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICAvLyBDbGljayBoYW5kbGluZyBmb3Igc2luZ2xlIG1vZGUgKyBjb2xsYXBzaWJsZSArIGFyaWEtZXhwYW5kZWQgc3luY1xuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuX29uQ2xpY2sgPSAoZSkgPT4ge1xuICAgICAgY29uc3QgdHJpZ2dlciA9IGUudGFyZ2V0LmNsb3Nlc3QoJ1tkYXRhLWV4bz1cImFjY29yZGlvbi10cmlnZ2VyXCJdJylcbiAgICAgIGlmICghdHJpZ2dlciB8fCB0cmlnZ2VyLmRpc2FibGVkKSByZXR1cm5cblxuICAgICAgY29uc3QgaXRlbSA9IHRyaWdnZXIuY2xvc2VzdCgnW2RhdGEtZXhvPVwiYWNjb3JkaW9uLWl0ZW1cIl0nKVxuICAgICAgY29uc3QgY2hlY2tib3ggPSBpdGVtPy5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJhY2NvcmRpb24tc3RhdGVcIl0nKVxuICAgICAgaWYgKCFjaGVja2JveCkgcmV0dXJuXG5cbiAgICAgIGNvbnN0IHdhc0NoZWNrZWQgPSBjaGVja2JveC5jaGVja2VkXG5cbiAgICAgIGlmICh0aGlzLl9pc1NpbmdsZSgpKSB7XG4gICAgICAgIGlmICh3YXNDaGVja2VkICYmIHRoaXMuX2lzQ29sbGFwc2libGUoKSkge1xuICAgICAgICAgIC8vIENsb3NlIHRoaXMgaXRlbVxuICAgICAgICAgIGNoZWNrYm94LmNoZWNrZWQgPSBmYWxzZVxuICAgICAgICAgIHRoaXMuX3N5bmNBcmlhKHRyaWdnZXIsIGZhbHNlKVxuICAgICAgICB9IGVsc2UgaWYgKHdhc0NoZWNrZWQgJiYgIXRoaXMuX2lzQ29sbGFwc2libGUoKSkge1xuICAgICAgICAgIC8vIEtlZXAgb3BlbiwgcHJldmVudCB0b2dnbGVcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBDbG9zZSBhbGwgb3RoZXJzLCBvcGVuIHRoaXMgb25lXG4gICAgICAgICAgdGhpcy5fY2hlY2tib3hlcygpLmZvckVhY2goKGNiKSA9PiB7XG4gICAgICAgICAgICBpZiAoY2IgIT09IGNoZWNrYm94ICYmIGNiLmNoZWNrZWQpIHtcbiAgICAgICAgICAgICAgY2IuY2hlY2tlZCA9IGZhbHNlXG4gICAgICAgICAgICAgIGNvbnN0IG90aGVyVHJpZ2dlciA9IGNiLnBhcmVudEVsZW1lbnQucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwiYWNjb3JkaW9uLXRyaWdnZXJcIl0nKVxuICAgICAgICAgICAgICBpZiAob3RoZXJUcmlnZ2VyKSB0aGlzLl9zeW5jQXJpYShvdGhlclRyaWdnZXIsIGZhbHNlKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgICAgY2hlY2tib3guY2hlY2tlZCA9IHRydWVcbiAgICAgICAgICB0aGlzLl9zeW5jQXJpYSh0cmlnZ2VyLCB0cnVlKVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBNdWx0aXBsZSBtb2RlIFx1MjAxNCBqdXN0IHRvZ2dsZVxuICAgICAgICBjaGVja2JveC5jaGVja2VkID0gIXdhc0NoZWNrZWRcbiAgICAgICAgdGhpcy5fc3luY0FyaWEodHJpZ2dlciwgY2hlY2tib3guY2hlY2tlZClcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgLy8gU3luYyBpbml0aWFsIGFyaWEgc3RhdGVzXG4gICAgdGhpcy5fc3luY0FsbEFyaWEoKVxuICB9LFxuXG4gIHVwZGF0ZWQoKSB7XG4gICAgdGhpcy5fc3luY0FsbEFyaWEoKVxuICB9LFxuXG4gIGRlc3Ryb3llZCgpIHtcbiAgICBpZiAodGhpcy5fb25LZXlkb3duKSB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIHRoaXMuX29uS2V5ZG93bilcbiAgICBpZiAodGhpcy5fb25DbGljaykgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5fb25DbGljaylcbiAgfSxcblxuICBfc3luY0FyaWEodHJpZ2dlciwgZXhwYW5kZWQpIHtcbiAgICB0cmlnZ2VyLnNldEF0dHJpYnV0ZShcImFyaWEtZXhwYW5kZWRcIiwgU3RyaW5nKGV4cGFuZGVkKSlcbiAgfSxcblxuICBfc3luY0FsbEFyaWEoKSB7XG4gICAgY29uc3QgaXRlbXMgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWV4bz1cImFjY29yZGlvbi1pdGVtXCJdJylcbiAgICBpdGVtcy5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICBjb25zdCBjaGVja2JveCA9IGl0ZW0ucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwiYWNjb3JkaW9uLXN0YXRlXCJdJylcbiAgICAgIGNvbnN0IHRyaWdnZXIgPSBpdGVtLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cImFjY29yZGlvbi10cmlnZ2VyXCJdJylcbiAgICAgIGlmIChjaGVja2JveCAmJiB0cmlnZ2VyKSB7XG4gICAgICAgIHRoaXMuX3N5bmNBcmlhKHRyaWdnZXIsIGNoZWNrYm94LmNoZWNrZWQpXG4gICAgICB9XG4gICAgfSlcbiAgfVxufVxuXG5leHBvcnQgeyBFeG9BY2NvcmRpb24gfVxuIiwgIi8qKlxuICogRXhvU2lkZWJhciBob29rIFx1MjAxNCBtYW5hZ2VzIGNvbGxhcHNpYmxlIHNpZGViYXIgc3RhdGUuXG4gKlxuICogUmVzdG9yZXMgY29sbGFwc2VkL2V4cGFuZGVkIGZyb20gbG9jYWxTdG9yYWdlIG9uIGRlc2t0b3AuXG4gKiBNb2JpbGUgc3RhcnRzIGNsb3NlZC4gU2V0cyBkYXRhLXNpZGViYXItcmVhZHkgb24gPGh0bWw+IGFmdGVyIGluaXQuXG4gKi9cbmNvbnN0IEV4b1NpZGViYXIgPSB7XG4gIG1vdW50ZWQoKSB7XG4gICAgdGhpcy50b2dnbGUgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cInNpZGViYXItdG9nZ2xlXCJdJylcbiAgICBpZiAoIXRoaXMudG9nZ2xlKSByZXR1cm5cblxuICAgIHRoaXMuX2FwcGx5U3RhdGUoKVxuXG4gICAgLy8gRW5hYmxlIENTUyB0cmFuc2l0aW9ucyBhZnRlciBpbml0aWFsIHN0YXRlIChwcmV2ZW50cyBGT1VDKVxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2V0QXR0cmlidXRlKCdkYXRhLXNpZGViYXItcmVhZHknLCAnJylcbiAgICB9KVxuXG4gICAgLy8gUGVyc2lzdCBvbiB0b2dnbGVcbiAgICB0aGlzLl9vbkNoYW5nZSA9ICgpID0+IHtcbiAgICAgIGlmICh3aW5kb3cubWF0Y2hNZWRpYSgnKG1pbi13aWR0aDogNzY4cHgpJykubWF0Y2hlcykge1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnZXhvLXNpZGViYXItY29sbGFwc2VkJywgdGhpcy50b2dnbGUuY2hlY2tlZCA/ICdmYWxzZScgOiAndHJ1ZScpXG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMudG9nZ2xlLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIHRoaXMuX29uQ2hhbmdlKVxuICB9LFxuXG4gIGRlc3Ryb3llZCgpIHtcbiAgICBpZiAodGhpcy50b2dnbGUgJiYgdGhpcy5fb25DaGFuZ2UpIHtcbiAgICAgIHRoaXMudG9nZ2xlLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIHRoaXMuX29uQ2hhbmdlKVxuICAgIH1cbiAgfSxcblxuICB1cGRhdGVkKCkge1xuICAgIHRoaXMuX2FwcGx5U3RhdGUoKVxuICB9LFxuXG4gIF9hcHBseVN0YXRlKCkge1xuICAgIGlmICghdGhpcy50b2dnbGUpIHJldHVyblxuICAgIGNvbnN0IGlzRGVza3RvcCA9IHdpbmRvdy5tYXRjaE1lZGlhKCcobWluLXdpZHRoOiA3NjhweCknKS5tYXRjaGVzXG4gICAgaWYgKGlzRGVza3RvcCkge1xuICAgICAgY29uc3QgY29sbGFwc2VkID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2V4by1zaWRlYmFyLWNvbGxhcHNlZCcpID09PSAndHJ1ZSdcbiAgICAgIHRoaXMudG9nZ2xlLmNoZWNrZWQgPSAhY29sbGFwc2VkXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudG9nZ2xlLmNoZWNrZWQgPSBmYWxzZVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgeyBFeG9TaWRlYmFyIH1cbiIsICJjb25zdCBFeG9UaGVtZVRvZ2dsZSA9IHtcbiAgbW91bnRlZCgpIHtcbiAgICB0aGlzLl9hcHBseSh0aGlzLl9jdXJyZW50KCkpXG5cbiAgICB0aGlzLl9oYW5kbGVycyA9IFtdXG4gICAgdGhpcy5lbC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS10aGVtZS12YWx1ZV0nKS5mb3JFYWNoKGJ0biA9PiB7XG4gICAgICBjb25zdCBoYW5kbGVyID0gKCkgPT4ge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGJ0bi5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGhlbWUtdmFsdWUnKVxuICAgICAgICB0aGlzLl9hcHBseSh2YWx1ZSlcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2V4by10aGVtZScsIHZhbHVlKVxuICAgICAgfVxuICAgICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlcilcbiAgICAgIHRoaXMuX2hhbmRsZXJzLnB1c2goeyBidG4sIGhhbmRsZXIgfSlcbiAgICB9KVxuICB9LFxuXG4gIGRlc3Ryb3llZCgpIHtcbiAgICB0aGlzLl9oYW5kbGVycz8uZm9yRWFjaCgoeyBidG4sIGhhbmRsZXIgfSkgPT5cbiAgICAgIGJ0bi5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZXIpXG4gICAgKVxuICB9LFxuXG4gIF9jdXJyZW50KCkge1xuICAgIHJldHVybiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnZXhvLXRoZW1lJykgfHwgJ3N5c3RlbSdcbiAgfSxcblxuICBfYXBwbHkodGhlbWUpIHtcbiAgICBjb25zdCByb290ID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50XG4gICAgLy8gVXBkYXRlIGFjdGl2ZSBzdGF0ZSBvbiBidXR0b25zXG4gICAgdGhpcy5lbC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS10aGVtZS12YWx1ZV0nKS5mb3JFYWNoKGJ0biA9PiB7XG4gICAgICBidG4udG9nZ2xlQXR0cmlidXRlKCdkYXRhLWFjdGl2ZScsIGJ0bi5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGhlbWUtdmFsdWUnKSA9PT0gdGhlbWUpXG4gICAgfSlcblxuICAgIGlmICh0aGVtZSA9PT0gJ3N5c3RlbScpIHtcbiAgICAgIHJvb3QucmVtb3ZlQXR0cmlidXRlKCdkYXRhLXRoZW1lJylcbiAgICB9IGVsc2Uge1xuICAgICAgcm9vdC5zZXRBdHRyaWJ1dGUoJ2RhdGEtdGhlbWUnLCB0aGVtZSlcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IHsgRXhvVGhlbWVUb2dnbGUgfVxuIiwgImNvbnN0IEV4b1BvcG92ZXIgPSB7XG4gIG1vdW50ZWQoKSB7IHRoaXMuX2JpbmQoKSB9LFxuICB1cGRhdGVkKCkgeyB0aGlzLl9iaW5kKCkgfSxcbiAgZGVzdHJveWVkKCkgeyB0aGlzLl91bmJpbmQoKSB9LFxuICBfYmluZCgpIHtcbiAgICB0aGlzLl91bmJpbmQoKVxuICAgIGNvbnN0IHRyaWdnZXIgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cInBvcG92ZXItdHJpZ2dlclwiXScpXG4gICAgY29uc3QgaWQgPSB0cmlnZ2VyPy5nZXRBdHRyaWJ1dGUoJ3BvcG92ZXJ0YXJnZXQnKVxuICAgIHRoaXMuX3BvcG92ZXIgPSBpZCA/IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKSA6IG51bGxcbiAgICBpZiAoIXRoaXMuX3BvcG92ZXIpIHJldHVyblxuICAgIHRoaXMuX29uVG9nZ2xlID0gKCkgPT4ge1xuICAgICAgY29uc3Qgb3BlbiA9IHRoaXMuX3BvcG92ZXIubWF0Y2hlcygnOnBvcG92ZXItb3BlbicpXG4gICAgICB0cmlnZ2VyLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsIFN0cmluZyhvcGVuKSlcbiAgICB9XG4gICAgdGhpcy5fcG9wb3Zlci5hZGRFdmVudExpc3RlbmVyKCd0b2dnbGUnLCB0aGlzLl9vblRvZ2dsZSlcbiAgfSxcbiAgX3VuYmluZCgpIHtcbiAgICBpZiAodGhpcy5fcG9wb3ZlciAmJiB0aGlzLl9vblRvZ2dsZSkge1xuICAgICAgdGhpcy5fcG9wb3Zlci5yZW1vdmVFdmVudExpc3RlbmVyKCd0b2dnbGUnLCB0aGlzLl9vblRvZ2dsZSlcbiAgICB9XG4gICAgdGhpcy5fcG9wb3ZlciA9IG51bGxcbiAgICB0aGlzLl9vblRvZ2dsZSA9IG51bGxcbiAgfVxufVxuXG5leHBvcnQgeyBFeG9Qb3BvdmVyIH1cbiIsICJjb25zdCBFeG9Ecm9wZG93bk1lbnUgPSB7XG4gIG1vdW50ZWQoKSB7IHRoaXMuX2JpbmQoKSB9LFxuICB1cGRhdGVkKCkgeyB0aGlzLl9iaW5kKCkgfSxcbiAgZGVzdHJveWVkKCkgeyB0aGlzLl91bmJpbmQoKSB9LFxuICBfYmluZCgpIHtcbiAgICB0aGlzLl91bmJpbmQoKVxuICAgIHRoaXMuX21lbnUgPSB0aGlzLmVsLm1hdGNoZXMoJ1tyb2xlPVwibWVudVwiXScpID8gdGhpcy5lbCA6IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW3JvbGU9XCJtZW51XCJdJylcbiAgICBpZiAoIXRoaXMuX21lbnUpIHJldHVyblxuICAgIHRoaXMuX29uS2V5ZG93biA9IChlKSA9PiB7XG4gICAgICBjb25zdCBpdGVtcyA9IFsuLi50aGlzLl9tZW51LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tyb2xlPVwibWVudWl0ZW1cIl06bm90KFtkaXNhYmxlZF0pJyldXG4gICAgICBpZiAoIWl0ZW1zLmxlbmd0aCkgcmV0dXJuXG4gICAgICBjb25zdCBpZHggPSBpdGVtcy5pbmRleE9mKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpXG4gICAgICBsZXQgbmV4dCA9IC0xXG4gICAgICBzd2l0Y2ggKGUua2V5KSB7XG4gICAgICAgIGNhc2UgJ0Fycm93RG93bic6IG5leHQgPSBpZHggPCBpdGVtcy5sZW5ndGggLSAxID8gaWR4ICsgMSA6IDA7IGJyZWFrXG4gICAgICAgIGNhc2UgJ0Fycm93VXAnOiBuZXh0ID0gaWR4ID4gMCA/IGlkeCAtIDEgOiBpdGVtcy5sZW5ndGggLSAxOyBicmVha1xuICAgICAgICBjYXNlICdIb21lJzogbmV4dCA9IDA7IGJyZWFrXG4gICAgICAgIGNhc2UgJ0VuZCc6IG5leHQgPSBpdGVtcy5sZW5ndGggLSAxOyBicmVha1xuICAgICAgICBkZWZhdWx0OiByZXR1cm5cbiAgICAgIH1cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgaXRlbXNbbmV4dF0/LmZvY3VzKClcbiAgICB9XG4gICAgdGhpcy5fbWVudS5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5fb25LZXlkb3duKVxuICB9LFxuICBfdW5iaW5kKCkge1xuICAgIGlmICh0aGlzLl9tZW51ICYmIHRoaXMuX29uS2V5ZG93bikge1xuICAgICAgdGhpcy5fbWVudS5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5fb25LZXlkb3duKVxuICAgIH1cbiAgICB0aGlzLl9tZW51ID0gbnVsbFxuICAgIHRoaXMuX29uS2V5ZG93biA9IG51bGxcbiAgfVxufVxuXG5leHBvcnQgeyBFeG9Ecm9wZG93bk1lbnUgfVxuIiwgImNvbnN0IEV4b1NlbGVjdCA9IHtcbiAgbW91bnRlZCgpIHsgdGhpcy5fYmluZCgpIH0sXG4gIHVwZGF0ZWQoKSB7IHRoaXMuX2JpbmQoKSB9LFxuICBkZXN0cm95ZWQoKSB7IHRoaXMuX3VuYmluZCgpIH0sXG5cbiAgX2JpbmQoKSB7XG4gICAgdGhpcy5fdW5iaW5kKClcblxuICAgIHRoaXMuX3RyaWdnZXIgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4by1zZWxlY3Q9XCJ0cmlnZ2VyXCJdJylcbiAgICBjb25zdCBwb3BvdmVySWQgPSB0aGlzLl90cmlnZ2VyPy5nZXRBdHRyaWJ1dGUoJ3BvcG92ZXJ0YXJnZXQnKVxuICAgIHRoaXMuX3BvcG92ZXIgPSBwb3BvdmVySWQgPyBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChwb3BvdmVySWQpIDogbnVsbFxuICAgIHRoaXMuX2xpc3Rib3ggPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tyb2xlPVwibGlzdGJveFwiXScpXG4gICAgdGhpcy5faGlkZGVuID0gdGhpcy5lbC5jbG9zZXN0KCdbZGF0YS1leG89XCJmaWVsZFwiXScpPy5xdWVyeVNlbGVjdG9yKCdpbnB1dFt0eXBlPVwiaGlkZGVuXCJdJylcblxuICAgIGlmICghdGhpcy5fcG9wb3ZlciB8fCAhdGhpcy5fbGlzdGJveCkgcmV0dXJuXG5cbiAgICAvLyBUb2dnbGUgYXJpYS1leHBhbmRlZCBvbiBwb3BvdmVyIG9wZW4vY2xvc2VcbiAgICB0aGlzLl9vblRvZ2dsZSA9ICgpID0+IHtcbiAgICAgIGNvbnN0IG9wZW4gPSB0aGlzLl9wb3BvdmVyLm1hdGNoZXMoJzpwb3BvdmVyLW9wZW4nKVxuICAgICAgdGhpcy5fdHJpZ2dlci5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCBTdHJpbmcob3BlbikpXG4gICAgICBpZiAob3Blbikge1xuICAgICAgICAvLyBGb2N1cyBzZWxlY3RlZCBvciBmaXJzdCBvcHRpb25cbiAgICAgICAgY29uc3Qgc2VsZWN0ZWQgPSB0aGlzLl9saXN0Ym94LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLXNlbGVjdGVkXScpXG4gICAgICAgIGNvbnN0IGZpcnN0ID0gdGhpcy5fbGlzdGJveC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJzZWxlY3Qtb3B0aW9uXCJdOm5vdChbZGF0YS1kaXNhYmxlZF0pJylcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gc2VsZWN0ZWQgfHwgZmlyc3RcbiAgICAgICAgaWYgKHRhcmdldCkgdGFyZ2V0LmZvY3VzKClcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5fcG9wb3Zlci5hZGRFdmVudExpc3RlbmVyKCd0b2dnbGUnLCB0aGlzLl9vblRvZ2dsZSlcblxuICAgIC8vIENsaWNrIG9uIG9wdGlvblxuICAgIHRoaXMuX29uQ2xpY2sgPSAoZSkgPT4ge1xuICAgICAgY29uc3Qgb3B0ID0gZS50YXJnZXQuY2xvc2VzdCgnW2RhdGEtZXhvPVwic2VsZWN0LW9wdGlvblwiXScpXG4gICAgICBpZiAoIW9wdCB8fCBvcHQuaGFzQXR0cmlidXRlKCdkYXRhLWRpc2FibGVkJykpIHJldHVyblxuICAgICAgdGhpcy5fc2VsZWN0T3B0aW9uKG9wdClcbiAgICB9XG4gICAgdGhpcy5fbGlzdGJveC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX29uQ2xpY2spXG5cbiAgICAvLyBLZXlib2FyZCBuYXZpZ2F0aW9uXG4gICAgdGhpcy5fb25LZXlkb3duID0gKGUpID0+IHtcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSBbLi4udGhpcy5fbGlzdGJveC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1leG89XCJzZWxlY3Qtb3B0aW9uXCJdOm5vdChbZGF0YS1kaXNhYmxlZF0pJyldXG4gICAgICBpZiAoIW9wdGlvbnMubGVuZ3RoKSByZXR1cm5cbiAgICAgIGNvbnN0IGlkeCA9IG9wdGlvbnMuaW5kZXhPZihkb2N1bWVudC5hY3RpdmVFbGVtZW50KVxuICAgICAgbGV0IG5leHQgPSAtMVxuXG4gICAgICBzd2l0Y2ggKGUua2V5KSB7XG4gICAgICAgIGNhc2UgJ0Fycm93RG93bic6XG4gICAgICAgICAgbmV4dCA9IGlkeCA8IG9wdGlvbnMubGVuZ3RoIC0gMSA/IGlkeCArIDEgOiAwXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAnQXJyb3dVcCc6XG4gICAgICAgICAgbmV4dCA9IGlkeCA+IDAgPyBpZHggLSAxIDogb3B0aW9ucy5sZW5ndGggLSAxXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAnSG9tZSc6XG4gICAgICAgICAgbmV4dCA9IDBcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlICdFbmQnOlxuICAgICAgICAgIG5leHQgPSBvcHRpb25zLmxlbmd0aCAtIDFcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlICdFbnRlcic6XG4gICAgICAgIGNhc2UgJyAnOlxuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgIGlmIChpZHggPj0gMCkgdGhpcy5fc2VsZWN0T3B0aW9uKG9wdGlvbnNbaWR4XSlcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgY2FzZSAnRXNjYXBlJzpcbiAgICAgICAgICB0aGlzLl9wb3BvdmVyLmhpZGVQb3BvdmVyKClcbiAgICAgICAgICB0aGlzLl90cmlnZ2VyLmZvY3VzKClcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAvLyBUeXBlLWFoZWFkOiBqdW1wIHRvIG9wdGlvbiBzdGFydGluZyB3aXRoIHR5cGVkIGNoYXJhY3RlclxuICAgICAgICAgIHRoaXMuX3R5cGVBaGVhZChlLmtleSwgb3B0aW9ucylcbiAgICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBpZiAobmV4dCA+PSAwKSBvcHRpb25zW25leHRdLmZvY3VzKClcbiAgICB9XG4gICAgdGhpcy5fbGlzdGJveC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5fb25LZXlkb3duKVxuICB9LFxuXG4gIF9zZWxlY3RPcHRpb24ob3B0KSB7XG4gICAgY29uc3QgdmFsdWUgPSBvcHQuZ2V0QXR0cmlidXRlKCdkYXRhLXZhbHVlJylcbiAgICBjb25zdCB0ZXh0ID0gb3B0LnRleHRDb250ZW50LnRyaW0oKVxuXG4gICAgLy8gVXBkYXRlIGhpZGRlbiBpbnB1dFxuICAgIGlmICh0aGlzLl9oaWRkZW4pIHtcbiAgICAgIHRoaXMuX2hpZGRlbi52YWx1ZSA9IHZhbHVlXG4gICAgICB0aGlzLl9oaWRkZW4uZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2lucHV0JywgeyBidWJibGVzOiB0cnVlIH0pKVxuICAgIH1cblxuICAgIC8vIFVwZGF0ZSBhcmlhLXNlbGVjdGVkIGFuZCBkYXRhLXNlbGVjdGVkIG9uIGFsbCBvcHRpb25zXG4gICAgdGhpcy5fbGlzdGJveC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1leG89XCJzZWxlY3Qtb3B0aW9uXCJdJykuZm9yRWFjaCgobykgPT4ge1xuICAgICAgY29uc3QgaXNTZWxlY3RlZCA9IG8uZ2V0QXR0cmlidXRlKCdkYXRhLXZhbHVlJykgPT09IHZhbHVlXG4gICAgICBvLnNldEF0dHJpYnV0ZSgnYXJpYS1zZWxlY3RlZCcsIFN0cmluZyhpc1NlbGVjdGVkKSlcbiAgICAgIGlmIChpc1NlbGVjdGVkKSB7XG4gICAgICAgIG8uc2V0QXR0cmlidXRlKCdkYXRhLXNlbGVjdGVkJywgJycpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvLnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS1zZWxlY3RlZCcpXG4gICAgICB9XG4gICAgfSlcblxuICAgIC8vIFVwZGF0ZSB0cmlnZ2VyIGRpc3BsYXkgdGV4dFxuICAgIGNvbnN0IHZhbHVlRWwgPSB0aGlzLl90cmlnZ2VyLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cInNlbGVjdC12YWx1ZVwiXScpXG4gICAgaWYgKHZhbHVlRWwpIHZhbHVlRWwudGV4dENvbnRlbnQgPSB0ZXh0XG5cbiAgICAvLyBDbG9zZSBwb3BvdmVyXG4gICAgdGhpcy5fcG9wb3Zlci5oaWRlUG9wb3ZlcigpXG4gICAgdGhpcy5fdHJpZ2dlci5mb2N1cygpXG4gIH0sXG5cbiAgX3R5cGVBaGVhZChjaGFyLCBvcHRpb25zKSB7XG4gICAgaWYgKGNoYXIubGVuZ3RoICE9PSAxKSByZXR1cm5cbiAgICBjb25zdCBsb3dlciA9IGNoYXIudG9Mb3dlckNhc2UoKVxuICAgIGNvbnN0IGN1cnJlbnRJZHggPSBvcHRpb25zLmluZGV4T2YoZG9jdW1lbnQuYWN0aXZlRWxlbWVudClcbiAgICBjb25zdCBzdGFydCA9IGN1cnJlbnRJZHggKyAxXG4gICAgY29uc3Qgcm90YXRlZCA9IFsuLi5vcHRpb25zLnNsaWNlKHN0YXJ0KSwgLi4ub3B0aW9ucy5zbGljZSgwLCBzdGFydCldXG4gICAgY29uc3QgbWF0Y2ggPSByb3RhdGVkLmZpbmQobyA9PiBvLnRleHRDb250ZW50LnRyaW0oKS50b0xvd2VyQ2FzZSgpLnN0YXJ0c1dpdGgobG93ZXIpKVxuICAgIGlmIChtYXRjaCkgbWF0Y2guZm9jdXMoKVxuICB9LFxuXG4gIF91bmJpbmQoKSB7XG4gICAgaWYgKHRoaXMuX3BvcG92ZXIgJiYgdGhpcy5fb25Ub2dnbGUpIHtcbiAgICAgIHRoaXMuX3BvcG92ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG9nZ2xlJywgdGhpcy5fb25Ub2dnbGUpXG4gICAgfVxuICAgIGlmICh0aGlzLl9saXN0Ym94ICYmIHRoaXMuX29uQ2xpY2spIHtcbiAgICAgIHRoaXMuX2xpc3Rib3gucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9vbkNsaWNrKVxuICAgIH1cbiAgICBpZiAodGhpcy5fbGlzdGJveCAmJiB0aGlzLl9vbktleWRvd24pIHtcbiAgICAgIHRoaXMuX2xpc3Rib3gucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX29uS2V5ZG93bilcbiAgICB9XG4gICAgdGhpcy5fdHJpZ2dlciA9IG51bGxcbiAgICB0aGlzLl9wb3BvdmVyID0gbnVsbFxuICAgIHRoaXMuX2xpc3Rib3ggPSBudWxsXG4gICAgdGhpcy5faGlkZGVuID0gbnVsbFxuICAgIHRoaXMuX29uVG9nZ2xlID0gbnVsbFxuICAgIHRoaXMuX29uQ2xpY2sgPSBudWxsXG4gICAgdGhpcy5fb25LZXlkb3duID0gbnVsbFxuICB9XG59XG5cbmV4cG9ydCB7IEV4b1NlbGVjdCB9XG4iLCAiY29uc3QgRXhvQ29tYm9ib3ggPSB7XG4gIG1vdW50ZWQoKSB7IHRoaXMuX2JpbmQoKSB9LFxuICB1cGRhdGVkKCkgeyB0aGlzLl9iaW5kKCkgfSxcbiAgZGVzdHJveWVkKCkgeyB0aGlzLl91bmJpbmQoKSB9LFxuICBfYmluZCgpIHtcbiAgICB0aGlzLl91bmJpbmQoKVxuICAgIGNvbnN0IGlzSW5wdXRUcmlnZ2VyID0gdGhpcy5lbC5kYXRhc2V0LnRyaWdnZXIgPT09ICdpbnB1dCdcbiAgICBjb25zdCBmaWx0ZXIgPSB0aGlzLmVsLmRhdGFzZXQuZmlsdGVyIHx8ICdzZXJ2ZXInXG4gICAgY29uc3Qgb25GaWx0ZXIgPSB0aGlzLmVsLmRhdGFzZXQub25GaWx0ZXJcbiAgICBjb25zdCBkZWJvdW5jZSA9IHBhcnNlSW50KHRoaXMuZWwuZGF0YXNldC5kZWJvdW5jZSB8fCAnMzAwJywgMTApXG5cbiAgICB0aGlzLl9zZWFyY2ggPSBpc0lucHV0VHJpZ2dlclxuICAgICAgPyB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4by1jb21ib2JveD1cImlucHV0LXRyaWdnZXJcIl0nKVxuICAgICAgOiB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cImNvbWJvYm94LXNlYXJjaFwiXScpXG5cbiAgICBjb25zdCB0cmlnZ2VyQnRuID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG8tY29tYm9ib3g9XCJ0cmlnZ2VyXCJdJylcbiAgICBjb25zdCBwb3BvdmVySWQgPSB0cmlnZ2VyQnRuPy5nZXRBdHRyaWJ1dGUoJ3BvcG92ZXJ0YXJnZXQnKSB8fCB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cInBvcG92ZXItY29udGVudFwiXScpPy5pZFxuICAgIHRoaXMuX3BvcG92ZXIgPSBwb3BvdmVySWQgPyBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChwb3BvdmVySWQpIDogbnVsbFxuICAgIHRoaXMuX2hpZGRlbiA9IHRoaXMuZWwuY2xvc2VzdCgnW2RhdGEtZXhvPVwiZmllbGRcIl0nKT8ucXVlcnlTZWxlY3RvcignaW5wdXRbdHlwZT1cImhpZGRlblwiXScpXG4gICAgdGhpcy5fbGlzdGJveCA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW3JvbGU9XCJsaXN0Ym94XCJdJylcbiAgICB0aGlzLl9lbXB0eSA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwiY29tYm9ib3gtZW1wdHlcIl0nKVxuICAgIHRoaXMuX2NyZWF0ZSA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwiY29tYm9ib3gtY3JlYXRlXCJdJylcblxuICAgIHRoaXMuX2NsZWFyID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJjb21ib2JveC1jbGVhclwiXScpXG5cbiAgICBpZiAoIXRoaXMuX3BvcG92ZXIpIHJldHVyblxuXG4gICAgLy8gQ2xlYXIgYnV0dG9uXG4gICAgaWYgKHRoaXMuX2NsZWFyKSB7XG4gICAgICB0aGlzLl9vbkNsZWFyID0gKGUpID0+IHtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICBpZiAodGhpcy5faGlkZGVuKSB7XG4gICAgICAgICAgdGhpcy5faGlkZGVuLnZhbHVlID0gJydcbiAgICAgICAgICB0aGlzLl9oaWRkZW4uZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2lucHV0JywgeyBidWJibGVzOiB0cnVlIH0pKVxuICAgICAgICB9XG4gICAgICAgIC8vIFJlc2V0IHRyaWdnZXIgZGlzcGxheVxuICAgICAgICBjb25zdCB2YWxTcGFuID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJjb21ib2JveC12YWx1ZVwiXScpXG4gICAgICAgIGlmICh2YWxTcGFuKSB2YWxTcGFuLnRleHRDb250ZW50ID0gdGhpcy5fc2VhcmNoPy5wbGFjZWhvbGRlciB8fCAnJ1xuICAgICAgICAvLyBDbGVhciB2aXN1YWwgc2VsZWN0aW9uXG4gICAgICAgIGlmICh0aGlzLl9saXN0Ym94KSB7XG4gICAgICAgICAgdGhpcy5fbGlzdGJveC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1leG89XCJjb21ib2JveC1vcHRpb25cIl0nKS5mb3JFYWNoKG8gPT4ge1xuICAgICAgICAgICAgby5zZXRBdHRyaWJ1dGUoJ2FyaWEtc2VsZWN0ZWQnLCAnZmFsc2UnKVxuICAgICAgICAgICAgZGVsZXRlIG8uZGF0YXNldC5zZWxlY3RlZFxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuX2NsZWFyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fb25DbGVhcilcbiAgICB9XG5cbiAgICAvLyBUb2dnbGUgZXZlbnQgZm9yIGFyaWEtZXhwYW5kZWRcbiAgICB0aGlzLl9vblRvZ2dsZSA9ICgpID0+IHtcbiAgICAgIGNvbnN0IG9wZW4gPSB0aGlzLl9wb3BvdmVyLm1hdGNoZXMoJzpwb3BvdmVyLW9wZW4nKVxuICAgICAgaWYgKHRyaWdnZXJCdG4pIHRyaWdnZXJCdG4uc2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJywgU3RyaW5nKG9wZW4pKVxuICAgICAgaWYgKHRoaXMuX3NlYXJjaCkgdGhpcy5fc2VhcmNoLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsIFN0cmluZyhvcGVuKSlcbiAgICAgIGlmIChvcGVuICYmIHRoaXMuX3NlYXJjaCAmJiAhaXNJbnB1dFRyaWdnZXIpIHtcbiAgICAgICAgdGhpcy5fc2VhcmNoLnZhbHVlID0gJydcbiAgICAgICAgdGhpcy5fc2VhcmNoLmZvY3VzKClcbiAgICAgICAgaWYgKGZpbHRlciA9PT0gJ2NsaWVudCcpIHRoaXMuX2NsaWVudEZpbHRlcignJylcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5fcG9wb3Zlci5hZGRFdmVudExpc3RlbmVyKCd0b2dnbGUnLCB0aGlzLl9vblRvZ2dsZSlcblxuICAgIC8vIElucHV0IHRyaWdnZXI6IG9wZW4vY2xvc2UgdmlhIEpTXG4gICAgaWYgKGlzSW5wdXRUcmlnZ2VyICYmIHRoaXMuX3NlYXJjaCkge1xuICAgICAgdGhpcy5fb25Gb2N1cyA9ICgpID0+IHtcbiAgICAgICAgdHJ5IHsgdGhpcy5fcG9wb3Zlci5zaG93UG9wb3ZlcigpIH0gY2F0Y2goX2Vycikge31cbiAgICAgIH1cbiAgICAgIHRoaXMuX29uQmx1ciA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgcG9wb3ZlciA9IHRoaXMuX3BvcG92ZXJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgaWYgKCFwb3BvdmVyKSByZXR1cm5cbiAgICAgICAgICBpZiAoIXBvcG92ZXIuY29udGFpbnMoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCkgJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAhPT0gdGhpcy5fc2VhcmNoKSB7XG4gICAgICAgICAgICB0cnkgeyBwb3BvdmVyLmhpZGVQb3BvdmVyKCkgfSBjYXRjaChfZXJyKSB7fVxuICAgICAgICAgIH1cbiAgICAgICAgfSwgMjAwKVxuICAgICAgfVxuICAgICAgdGhpcy5fc2VhcmNoLmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgdGhpcy5fb25Gb2N1cylcbiAgICAgIHRoaXMuX3NlYXJjaC5hZGRFdmVudExpc3RlbmVyKCdibHVyJywgdGhpcy5fb25CbHVyKVxuICAgIH1cblxuICAgIC8vIFNlYXJjaCBpbnB1dCBoYW5kbGVyXG4gICAgaWYgKHRoaXMuX3NlYXJjaCkge1xuICAgICAgdGhpcy5fb25JbnB1dCA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgcXVlcnkgPSB0aGlzLl9zZWFyY2gudmFsdWVcbiAgICAgICAgaWYgKGZpbHRlciA9PT0gJ2NsaWVudCcpIHtcbiAgICAgICAgICB0aGlzLl9jbGllbnRGaWx0ZXIocXVlcnkpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2RlYm91bmNlVGltZXIpXG4gICAgICAgICAgdGhpcy5fZGVib3VuY2VUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgaWYgKG9uRmlsdGVyKSB0aGlzLnB1c2hFdmVudChvbkZpbHRlciwgeyBxdWVyeSB9KVxuICAgICAgICAgIH0sIGRlYm91bmNlKVxuICAgICAgICB9XG4gICAgICAgIC8vIFVwZGF0ZSBjcmVhdGUgb3B0aW9uIHRleHRcbiAgICAgICAgaWYgKHRoaXMuX2NyZWF0ZSkge1xuICAgICAgICAgIGNvbnN0IHNwYW4gPSB0aGlzLl9jcmVhdGUucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwiY29tYm9ib3gtY3JlYXRlLXF1ZXJ5XCJdJylcbiAgICAgICAgICBpZiAoc3Bhbikgc3Bhbi50ZXh0Q29udGVudCA9IHF1ZXJ5XG4gICAgICAgICAgdGhpcy5fY3JlYXRlLmhpZGRlbiA9ICFxdWVyeVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLl9zZWFyY2guYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCB0aGlzLl9vbklucHV0KVxuICAgIH1cblxuICAgIC8vIE9wdGlvbiBjbGlja1xuICAgIGlmICh0aGlzLl9saXN0Ym94KSB7XG4gICAgICB0aGlzLl9vbkNsaWNrID0gKGUpID0+IHtcbiAgICAgICAgY29uc3Qgb3B0ID0gZS50YXJnZXQuY2xvc2VzdCgnW2RhdGEtZXhvPVwiY29tYm9ib3gtb3B0aW9uXCJdOm5vdChbZGF0YS1kaXNhYmxlZF0pJylcbiAgICAgICAgaWYgKCFvcHQpIHJldHVyblxuICAgICAgICB0aGlzLl9zZWxlY3RPcHRpb24ob3B0KVxuICAgICAgfVxuICAgICAgdGhpcy5fbGlzdGJveC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX29uQ2xpY2spXG5cbiAgICAgIC8vIEtleWJvYXJkXG4gICAgICB0aGlzLl9vbktleWRvd24gPSAoZSkgPT4ge1xuICAgICAgICBjb25zdCBvcHRzID0gWy4uLnRoaXMuX2xpc3Rib3gucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZXhvPVwiY29tYm9ib3gtb3B0aW9uXCJdOm5vdChbZGF0YS1kaXNhYmxlZF0pOm5vdChbaGlkZGVuXSknKV1cbiAgICAgICAgaWYgKCFvcHRzLmxlbmd0aCkgcmV0dXJuXG4gICAgICAgIGNvbnN0IGlkeCA9IG9wdHMuaW5kZXhPZihkb2N1bWVudC5hY3RpdmVFbGVtZW50KVxuICAgICAgICBsZXQgbmV4dCA9IC0xXG4gICAgICAgIHN3aXRjaCAoZS5rZXkpIHtcbiAgICAgICAgICBjYXNlICdBcnJvd0Rvd24nOiBuZXh0ID0gaWR4IDwgb3B0cy5sZW5ndGggLSAxID8gaWR4ICsgMSA6IDA7IGJyZWFrXG4gICAgICAgICAgY2FzZSAnQXJyb3dVcCc6IG5leHQgPSBpZHggPiAwID8gaWR4IC0gMSA6IG9wdHMubGVuZ3RoIC0gMTsgYnJlYWtcbiAgICAgICAgICBjYXNlICdIb21lJzogbmV4dCA9IDA7IGJyZWFrXG4gICAgICAgICAgY2FzZSAnRW5kJzogbmV4dCA9IG9wdHMubGVuZ3RoIC0gMTsgYnJlYWtcbiAgICAgICAgICBjYXNlICdFbnRlcic6XG4gICAgICAgICAgICBpZiAoaWR4ID49IDApIHsgdGhpcy5fc2VsZWN0T3B0aW9uKG9wdHNbaWR4XSk7IGUucHJldmVudERlZmF1bHQoKSB9XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICBjYXNlICdFc2NhcGUnOlxuICAgICAgICAgICAgdHJ5IHsgdGhpcy5fcG9wb3Zlci5oaWRlUG9wb3ZlcigpIH0gY2F0Y2goX2Vycikge31cbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgIGRlZmF1bHQ6IHJldHVyblxuICAgICAgICB9XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICBvcHRzW25leHRdPy5mb2N1cygpXG4gICAgICB9XG4gICAgICB0aGlzLl9wb3BvdmVyLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLl9vbktleWRvd24pXG4gICAgfVxuICB9LFxuICBfY2xpZW50RmlsdGVyKHF1ZXJ5KSB7XG4gICAgaWYgKCF0aGlzLl9saXN0Ym94KSByZXR1cm5cbiAgICBjb25zdCBxID0gcXVlcnkudG9Mb3dlckNhc2UoKVxuICAgIGxldCBoYXNWaXNpYmxlID0gZmFsc2VcbiAgICB0aGlzLl9saXN0Ym94LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWV4bz1cImNvbWJvYm94LW9wdGlvblwiXScpLmZvckVhY2gob3B0ID0+IHtcbiAgICAgIGNvbnN0IG1hdGNoID0gIXEgfHwgb3B0LnRleHRDb250ZW50LnRyaW0oKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHEpXG4gICAgICBvcHQuaGlkZGVuID0gIW1hdGNoXG4gICAgICBpZiAobWF0Y2gpIGhhc1Zpc2libGUgPSB0cnVlXG4gICAgfSlcbiAgICBpZiAodGhpcy5fZW1wdHkpIHRoaXMuX2VtcHR5LmhpZGRlbiA9IGhhc1Zpc2libGVcbiAgfSxcbiAgX3NlbGVjdE9wdGlvbihvcHQpIHtcbiAgICBjb25zdCB2YWx1ZSA9IG9wdC5kYXRhc2V0LnZhbHVlXG4gICAgaWYgKHRoaXMuX2hpZGRlbikge1xuICAgICAgdGhpcy5faGlkZGVuLnZhbHVlID0gdmFsdWVcbiAgICAgIHRoaXMuX2hpZGRlbi5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnaW5wdXQnLCB7IGJ1YmJsZXM6IHRydWUgfSkpXG4gICAgfVxuICAgIC8vIFVwZGF0ZSB2aXN1YWwgc3RhdGVcbiAgICBpZiAodGhpcy5fbGlzdGJveCkge1xuICAgICAgdGhpcy5fbGlzdGJveC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1leG89XCJjb21ib2JveC1vcHRpb25cIl0nKS5mb3JFYWNoKG8gPT4ge1xuICAgICAgICBvLnNldEF0dHJpYnV0ZSgnYXJpYS1zZWxlY3RlZCcsIFN0cmluZyhvLmRhdGFzZXQudmFsdWUgPT09IHZhbHVlKSlcbiAgICAgICAgaWYgKG8uZGF0YXNldC52YWx1ZSA9PT0gdmFsdWUpIG8uZGF0YXNldC5zZWxlY3RlZCA9ICcnXG4gICAgICAgIGVsc2UgZGVsZXRlIG8uZGF0YXNldC5zZWxlY3RlZFxuICAgICAgfSlcbiAgICB9XG4gICAgLy8gVXBkYXRlIHRyaWdnZXIgZGlzcGxheVxuICAgIGNvbnN0IHZhbFNwYW4gPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cImNvbWJvYm94LXZhbHVlXCJdJylcbiAgICBpZiAodmFsU3BhbikgdmFsU3Bhbi50ZXh0Q29udGVudCA9IG9wdC50ZXh0Q29udGVudC50cmltKClcbiAgICAvLyBDbG9zZSAodW5sZXNzIG11bHRpcGxlKVxuICAgIGlmICghdGhpcy5lbC5kYXRhc2V0Lm11bHRpcGxlKSB7XG4gICAgICB0cnkgeyB0aGlzLl9wb3BvdmVyPy5oaWRlUG9wb3ZlcigpIH0gY2F0Y2goX2Vycikge31cbiAgICB9XG4gIH0sXG4gIF91bmJpbmQoKSB7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuX2RlYm91bmNlVGltZXIpXG4gICAgdGhpcy5fZGVib3VuY2VUaW1lciA9IG51bGxcbiAgICBpZiAodGhpcy5fcG9wb3Zlcikge1xuICAgICAgaWYgKHRoaXMuX29uVG9nZ2xlKSB0aGlzLl9wb3BvdmVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvZ2dsZScsIHRoaXMuX29uVG9nZ2xlKVxuICAgICAgaWYgKHRoaXMuX29uS2V5ZG93bikgdGhpcy5fcG9wb3Zlci5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5fb25LZXlkb3duKVxuICAgIH1cbiAgICBpZiAodGhpcy5fbGlzdGJveCAmJiB0aGlzLl9vbkNsaWNrKSB0aGlzLl9saXN0Ym94LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fb25DbGljaylcbiAgICBpZiAodGhpcy5fc2VhcmNoKSB7XG4gICAgICBpZiAodGhpcy5fb25JbnB1dCkgdGhpcy5fc2VhcmNoLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2lucHV0JywgdGhpcy5fb25JbnB1dClcbiAgICAgIGlmICh0aGlzLl9vbkZvY3VzKSB0aGlzLl9zZWFyY2gucmVtb3ZlRXZlbnRMaXN0ZW5lcignZm9jdXMnLCB0aGlzLl9vbkZvY3VzKVxuICAgICAgaWYgKHRoaXMuX29uQmx1cikgdGhpcy5fc2VhcmNoLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2JsdXInLCB0aGlzLl9vbkJsdXIpXG4gICAgfVxuICAgIGlmICh0aGlzLl9jbGVhciAmJiB0aGlzLl9vbkNsZWFyKSB0aGlzLl9jbGVhci5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX29uQ2xlYXIpXG4gICAgdGhpcy5fcG9wb3ZlciA9IG51bGxcbiAgICB0aGlzLl9saXN0Ym94ID0gbnVsbFxuICAgIHRoaXMuX3NlYXJjaCA9IG51bGxcbiAgICB0aGlzLl9jbGVhciA9IG51bGxcbiAgICB0aGlzLl9lbXB0eSA9IG51bGxcbiAgICB0aGlzLl9jcmVhdGUgPSBudWxsXG4gICAgdGhpcy5faGlkZGVuID0gbnVsbFxuICB9XG59XG5cbmV4cG9ydCB7IEV4b0NvbWJvYm94IH1cbiIsICJsZXQgbGFzdEhpZGVUaW1lID0gMFxuY29uc3QgU0tJUF9ERUxBWV9NUyA9IDMwMFxuY29uc3QgaGFzQW5jaG9yUG9zID1cbiAgdHlwZW9mIENTUyAhPT0gJ3VuZGVmaW5lZCcgJiYgQ1NTLnN1cHBvcnRzKCdwb3NpdGlvbi1hcmVhJywgJ3RvcCcpXG5cbmNvbnN0IEdBUCA9IDQgLy8gbWF0Y2hlcyB2YXIoLS1leG8tc3BhY2UtMSlcblxuY29uc3QgRXhvVG9vbHRpcCA9IHtcbiAgbW91bnRlZCgpIHtcbiAgICBjb25zdCB3cmFwcGVyID0gdGhpcy5lbFxuICAgIGNvbnN0IGFuY2hvciA9IHdyYXBwZXIucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwidG9vbHRpcC1hbmNob3JcIl0nKVxuICAgIGNvbnN0IGNvbnRlbnQgPSB3cmFwcGVyLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cInRvb2x0aXAtY29udGVudFwiXScpXG4gICAgaWYgKCFhbmNob3IgfHwgIWNvbnRlbnQpIHJldHVyblxuXG4gICAgdGhpcy5fYW5jaG9yID0gYW5jaG9yXG4gICAgdGhpcy5fY29udGVudCA9IGNvbnRlbnRcbiAgICB0aGlzLl90aW1lb3V0ID0gbnVsbFxuICAgIHRoaXMuX2RlY2xhcmVkU2lkZSA9IGNvbnRlbnQuZGF0YXNldC5zaWRlXG4gICAgdGhpcy5fZGVsYXkgPSBwYXJzZUludChjb250ZW50LmRhdGFzZXQuZGVsYXkpIHx8IDUwMFxuXG4gICAgLy8gVXBncmFkZSB0byBwb3BvdmVyIEFQSSBcdTIwMTQgZW5hYmxlcyB0b3AtbGF5ZXIgcmVuZGVyaW5nLlxuICAgIC8vIEJlZm9yZSB0aGlzLCBDU1Mtb25seSA6aG92ZXIgZmFsbGJhY2sga2VlcHMgdGhlIHRvb2x0aXAgZnVuY3Rpb25hbC5cbiAgICBjb250ZW50LnNldEF0dHJpYnV0ZSgncG9wb3ZlcicsICdtYW51YWwnKVxuXG4gICAgY29uc3Qgc2hvdyA9ICgpID0+IHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl90aW1lb3V0KVxuICAgICAgY29uc3QgZWxhcHNlZCA9IERhdGUubm93KCkgLSBsYXN0SGlkZVRpbWVcbiAgICAgIGNvbnN0IHdhaXQgPSBlbGFwc2VkIDwgU0tJUF9ERUxBWV9NUyA/IDAgOiB0aGlzLl9kZWxheVxuICAgICAgdGhpcy5fdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0cnkgeyBjb250ZW50LnNob3dQb3BvdmVyKCkgfSBjYXRjaCAoXykgeyByZXR1cm4gfVxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICAgIGlmICghaGFzQW5jaG9yUG9zKSB0aGlzLl9wb3NpdGlvbkZhbGxiYWNrKClcbiAgICAgICAgICB0aGlzLl9kZXRlY3RGbGlwKClcbiAgICAgICAgfSlcbiAgICAgIH0sIHdhaXQpXG4gICAgfVxuXG4gICAgY29uc3QgaGlkZSA9ICgpID0+IHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl90aW1lb3V0KVxuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKGNvbnRlbnQubWF0Y2hlcygnOnBvcG92ZXItb3BlbicpKSB7XG4gICAgICAgICAgY29udGVudC5oaWRlUG9wb3ZlcigpXG4gICAgICAgICAgbGFzdEhpZGVUaW1lID0gRGF0ZS5ub3coKVxuICAgICAgICAgIGNvbnRlbnQuZGF0YXNldC5zaWRlID0gdGhpcy5fZGVjbGFyZWRTaWRlXG4gICAgICAgICAgaWYgKCFoYXNBbmNob3JQb3MpIHtcbiAgICAgICAgICAgIGNvbnRlbnQuc3R5bGUudG9wID0gJydcbiAgICAgICAgICAgIGNvbnRlbnQuc3R5bGUubGVmdCA9ICcnXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChfKSB7fVxuICAgIH1cblxuICAgIHdyYXBwZXIuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsIHRoaXMuX3Nob3cgPSAoKSA9PiBzaG93KCkpXG4gICAgd3JhcHBlci5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgdGhpcy5faGlkZSA9ICgpID0+IGhpZGUoKSlcbiAgICBhbmNob3IuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXNpbicsIHRoaXMuX2ZvY3VzSW4gPSAoKSA9PiBzaG93KCkpXG4gICAgYW5jaG9yLmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3Vzb3V0JywgdGhpcy5fZm9jdXNPdXQgPSAoZSkgPT4ge1xuICAgICAgaWYgKCF3cmFwcGVyLmNvbnRhaW5zKGUucmVsYXRlZFRhcmdldCkpIGhpZGUoKVxuICAgIH0pXG4gICAgd3JhcHBlci5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5fa2V5ZG93biA9IChlKSA9PiB7XG4gICAgICBpZiAoZS5rZXkgPT09ICdFc2NhcGUnKSBoaWRlKClcbiAgICB9KVxuICB9LFxuXG4gIC8qKiBEZXRlY3QgaWYgYW5jaG9yIHBvc2l0aW9uaW5nIGZsaXBwZWQgdGhlIHNpZGUgYW5kIHVwZGF0ZSBkYXRhLXNpZGUgZm9yIGFycm93IENTUy4gKi9cbiAgX2RldGVjdEZsaXAoKSB7XG4gICAgY29uc3QgYXIgPSB0aGlzLl9hbmNob3IuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICBjb25zdCBjciA9IHRoaXMuX2NvbnRlbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICBsZXQgYWN0dWFsXG4gICAgaWYgKGNyLmJvdHRvbSA8PSBhci50b3AgKyAxKSBhY3R1YWwgPSAndG9wJ1xuICAgIGVsc2UgaWYgKGNyLnRvcCA+PSBhci5ib3R0b20gLSAxKSBhY3R1YWwgPSAnYm90dG9tJ1xuICAgIGVsc2UgaWYgKGNyLnJpZ2h0IDw9IGFyLmxlZnQgKyAxKSBhY3R1YWwgPSAnbGVmdCdcbiAgICBlbHNlIGlmIChjci5sZWZ0ID49IGFyLnJpZ2h0IC0gMSkgYWN0dWFsID0gJ3JpZ2h0J1xuICAgIGVsc2UgYWN0dWFsID0gdGhpcy5fZGVjbGFyZWRTaWRlXG4gICAgdGhpcy5fY29udGVudC5kYXRhc2V0LnNpZGUgPSBhY3R1YWxcbiAgfSxcblxuICAvKiogSlMgcG9zaXRpb25pbmcgZm9yIGJyb3dzZXJzIHdpdGhvdXQgQ1NTIGFuY2hvciBwb3NpdGlvbmluZyAoU2FmYXJpKS4gKi9cbiAgX3Bvc2l0aW9uRmFsbGJhY2soKSB7XG4gICAgY29uc3QgYXIgPSB0aGlzLl9hbmNob3IuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICBjb25zdCBjdyA9IHRoaXMuX2NvbnRlbnQub2Zmc2V0V2lkdGhcbiAgICBjb25zdCBjaCA9IHRoaXMuX2NvbnRlbnQub2Zmc2V0SGVpZ2h0XG4gICAgY29uc3Qgc2lkZSA9IHRoaXMuX2RlY2xhcmVkU2lkZVxuICAgIGNvbnN0IGFsaWduID0gdGhpcy5fY29udGVudC5kYXRhc2V0LmFsaWduIHx8ICdjZW50ZXInXG4gICAgbGV0IHRvcCwgbGVmdFxuXG4gICAgaWYgKHNpZGUgPT09ICd0b3AnIHx8IHNpZGUgPT09ICdib3R0b20nKSB7XG4gICAgICB0b3AgPSBzaWRlID09PSAndG9wJyA/IGFyLnRvcCAtIGNoIC0gR0FQIDogYXIuYm90dG9tICsgR0FQXG4gICAgICBpZiAoYWxpZ24gPT09ICdzdGFydCcpIGxlZnQgPSBhci5sZWZ0XG4gICAgICBlbHNlIGlmIChhbGlnbiA9PT0gJ2VuZCcpIGxlZnQgPSBhci5yaWdodCAtIGN3XG4gICAgICBlbHNlIGxlZnQgPSBhci5sZWZ0ICsgKGFyLndpZHRoIC0gY3cpIC8gMlxuICAgIH0gZWxzZSB7XG4gICAgICBsZWZ0ID0gc2lkZSA9PT0gJ2xlZnQnID8gYXIubGVmdCAtIGN3IC0gR0FQIDogYXIucmlnaHQgKyBHQVBcbiAgICAgIHRvcCA9IGFyLnRvcCArIChhci5oZWlnaHQgLSBjaCkgLyAyXG4gICAgfVxuXG4gICAgdGhpcy5fY29udGVudC5zdHlsZS50b3AgPSBgJHt0b3B9cHhgXG4gICAgdGhpcy5fY29udGVudC5zdHlsZS5sZWZ0ID0gYCR7bGVmdH1weGBcbiAgfSxcblxuICBkZXN0cm95ZWQoKSB7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuX3RpbWVvdXQpXG4gIH1cbn1cblxuZXhwb3J0IHsgRXhvVG9vbHRpcCB9XG4iLCAiaW1wb3J0IHsgRXhvQWNjb3JkaW9uIH0gZnJvbSAnLi9ob29rcy9hY2NvcmRpb24uanMnXG5pbXBvcnQgeyBFeG9TaWRlYmFyIH0gZnJvbSAnLi9ob29rcy9zaWRlYmFyLmpzJ1xuaW1wb3J0IHsgRXhvVGhlbWVUb2dnbGUgfSBmcm9tICcuL2hvb2tzL3RoZW1lX3RvZ2dsZS5qcydcbmltcG9ydCB7IEV4b1BvcG92ZXIgfSBmcm9tICcuL2hvb2tzL3BvcG92ZXIuanMnXG5pbXBvcnQgeyBFeG9Ecm9wZG93bk1lbnUgfSBmcm9tICcuL2hvb2tzL2Ryb3Bkb3duX21lbnUuanMnXG5pbXBvcnQgeyBFeG9TZWxlY3QgfSBmcm9tICcuL2hvb2tzL3NlbGVjdC5qcydcbmltcG9ydCB7IEV4b0NvbWJvYm94IH0gZnJvbSAnLi9ob29rcy9jb21ib2JveC5qcydcbmltcG9ydCB7IEV4b1Rvb2x0aXAgfSBmcm9tICcuL2hvb2tzL3Rvb2x0aXAuanMnXG5cbmNvbnN0IGhvb2tzID0ge1xuICBFeG9BY2NvcmRpb24sXG4gIEV4b1NpZGViYXIsXG4gIEV4b1RoZW1lVG9nZ2xlLFxuICBFeG9Qb3BvdmVyLFxuICBFeG9Ecm9wZG93bk1lbnUsXG4gIEV4b1NlbGVjdCxcbiAgRXhvQ29tYm9ib3gsXG4gIEV4b1Rvb2x0aXBcbn1cblxuZXhwb3J0IHsgaG9va3MgfVxuIiwgImltcG9ydCB7IGhvb2tzIGFzIGV4b0hvb2tzIH0gZnJvbSBcIi4uLy4uLy4uL2Fzc2V0cy9qcy9pbmRleC5qc1wiXG5cbndpbmRvdy5zdG9yeWJvb2sgPSB7XG4gIEhvb2tzOiBleG9Ib29rcyxcbiAgUGFyYW1zOiB7fSxcbiAgVXBsb2FkZXJzOiB7fVxufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7QUFhQSxNQUFNLGVBQWU7QUFBQSxJQUNuQixVQUFVO0FBQ1IsV0FBSyxZQUFZLE1BQ2YsTUFBTSxLQUFLLEtBQUssR0FBRyxpQkFBaUIsZ0RBQWdELENBQUM7QUFFdkYsV0FBSyxjQUFjLE1BQ2pCLE1BQU0sS0FBSyxLQUFLLEdBQUcsaUJBQWlCLDhDQUE4QyxDQUFDO0FBRXJGLFdBQUssWUFBWSxNQUFNLEtBQUssR0FBRyxRQUFRLFNBQVM7QUFDaEQsV0FBSyxpQkFBaUIsTUFBTSxLQUFLLEdBQUcsYUFBYSxrQkFBa0I7QUFHbkUsV0FBSyxHQUFHLGlCQUFpQixXQUFXLEtBQUssYUFBYSxDQUFDLE1BQU07QUFDM0QsY0FBTSxVQUFVLEVBQUUsT0FBTyxRQUFRLGdDQUFnQztBQUNqRSxZQUFJLENBQUMsUUFBUztBQUVkLGNBQU0sV0FBVyxLQUFLLFVBQVU7QUFDaEMsY0FBTSxNQUFNLFNBQVMsUUFBUSxPQUFPO0FBQ3BDLFlBQUksUUFBUSxHQUFJO0FBRWhCLFlBQUksU0FBUztBQUViLGdCQUFRLEVBQUUsS0FBSztBQUFBLFVBQ2IsS0FBSztBQUNILHFCQUFTLFVBQVUsTUFBTSxLQUFLLFNBQVMsTUFBTTtBQUM3QztBQUFBLFVBQ0YsS0FBSztBQUNILHFCQUFTLFVBQVUsTUFBTSxJQUFJLFNBQVMsVUFBVSxTQUFTLE1BQU07QUFDL0Q7QUFBQSxVQUNGLEtBQUs7QUFDSCxxQkFBUyxTQUFTLENBQUM7QUFDbkI7QUFBQSxVQUNGLEtBQUs7QUFDSCxxQkFBUyxTQUFTLFNBQVMsU0FBUyxDQUFDO0FBQ3JDO0FBQUEsVUFDRjtBQUNFO0FBQUEsUUFDSjtBQUVBLFlBQUksUUFBUTtBQUNWLFlBQUUsZUFBZTtBQUNqQixpQkFBTyxNQUFNO0FBQUEsUUFDZjtBQUFBLE1BQ0YsQ0FBQztBQUdELFdBQUssR0FBRyxpQkFBaUIsU0FBUyxLQUFLLFdBQVcsQ0FBQyxNQUFNO0FBQ3ZELGNBQU0sVUFBVSxFQUFFLE9BQU8sUUFBUSxnQ0FBZ0M7QUFDakUsWUFBSSxDQUFDLFdBQVcsUUFBUSxTQUFVO0FBRWxDLGNBQU0sT0FBTyxRQUFRLFFBQVEsNkJBQTZCO0FBQzFELGNBQU0sV0FBVyxNQUFNLGNBQWMsOEJBQThCO0FBQ25FLFlBQUksQ0FBQyxTQUFVO0FBRWYsY0FBTSxhQUFhLFNBQVM7QUFFNUIsWUFBSSxLQUFLLFVBQVUsR0FBRztBQUNwQixjQUFJLGNBQWMsS0FBSyxlQUFlLEdBQUc7QUFFdkMscUJBQVMsVUFBVTtBQUNuQixpQkFBSyxVQUFVLFNBQVMsS0FBSztBQUFBLFVBQy9CLFdBQVcsY0FBYyxDQUFDLEtBQUssZUFBZSxHQUFHO0FBRS9DLGNBQUUsZUFBZTtBQUNqQjtBQUFBLFVBQ0YsT0FBTztBQUVMLGlCQUFLLFlBQVksRUFBRSxRQUFRLENBQUMsT0FBTztBQUNqQyxrQkFBSSxPQUFPLFlBQVksR0FBRyxTQUFTO0FBQ2pDLG1CQUFHLFVBQVU7QUFDYixzQkFBTSxlQUFlLEdBQUcsY0FBYyxjQUFjLGdDQUFnQztBQUNwRixvQkFBSSxhQUFjLE1BQUssVUFBVSxjQUFjLEtBQUs7QUFBQSxjQUN0RDtBQUFBLFlBQ0YsQ0FBQztBQUNELHFCQUFTLFVBQVU7QUFDbkIsaUJBQUssVUFBVSxTQUFTLElBQUk7QUFBQSxVQUM5QjtBQUFBLFFBQ0YsT0FBTztBQUVMLG1CQUFTLFVBQVUsQ0FBQztBQUNwQixlQUFLLFVBQVUsU0FBUyxTQUFTLE9BQU87QUFBQSxRQUMxQztBQUFBLE1BQ0YsQ0FBQztBQUdELFdBQUssYUFBYTtBQUFBLElBQ3BCO0FBQUEsSUFFQSxVQUFVO0FBQ1IsV0FBSyxhQUFhO0FBQUEsSUFDcEI7QUFBQSxJQUVBLFlBQVk7QUFDVixVQUFJLEtBQUssV0FBWSxNQUFLLEdBQUcsb0JBQW9CLFdBQVcsS0FBSyxVQUFVO0FBQzNFLFVBQUksS0FBSyxTQUFVLE1BQUssR0FBRyxvQkFBb0IsU0FBUyxLQUFLLFFBQVE7QUFBQSxJQUN2RTtBQUFBLElBRUEsVUFBVSxTQUFTLFVBQVU7QUFDM0IsY0FBUSxhQUFhLGlCQUFpQixPQUFPLFFBQVEsQ0FBQztBQUFBLElBQ3hEO0FBQUEsSUFFQSxlQUFlO0FBQ2IsWUFBTSxRQUFRLEtBQUssR0FBRyxpQkFBaUIsNkJBQTZCO0FBQ3BFLFlBQU0sUUFBUSxDQUFDLFNBQVM7QUFDdEIsY0FBTSxXQUFXLEtBQUssY0FBYyw4QkFBOEI7QUFDbEUsY0FBTSxVQUFVLEtBQUssY0FBYyxnQ0FBZ0M7QUFDbkUsWUFBSSxZQUFZLFNBQVM7QUFDdkIsZUFBSyxVQUFVLFNBQVMsU0FBUyxPQUFPO0FBQUEsUUFDMUM7QUFBQSxNQUNGLENBQUM7QUFBQSxJQUNIO0FBQUEsRUFDRjs7O0FDdEhBLE1BQU0sYUFBYTtBQUFBLElBQ2pCLFVBQVU7QUFDUixXQUFLLFNBQVMsS0FBSyxHQUFHLGNBQWMsNkJBQTZCO0FBQ2pFLFVBQUksQ0FBQyxLQUFLLE9BQVE7QUFFbEIsV0FBSyxZQUFZO0FBR2pCLDRCQUFzQixNQUFNO0FBQzFCLGlCQUFTLGdCQUFnQixhQUFhLHNCQUFzQixFQUFFO0FBQUEsTUFDaEUsQ0FBQztBQUdELFdBQUssWUFBWSxNQUFNO0FBQ3JCLFlBQUksT0FBTyxXQUFXLG9CQUFvQixFQUFFLFNBQVM7QUFDbkQsdUJBQWEsUUFBUSx5QkFBeUIsS0FBSyxPQUFPLFVBQVUsVUFBVSxNQUFNO0FBQUEsUUFDdEY7QUFBQSxNQUNGO0FBQ0EsV0FBSyxPQUFPLGlCQUFpQixVQUFVLEtBQUssU0FBUztBQUFBLElBQ3ZEO0FBQUEsSUFFQSxZQUFZO0FBQ1YsVUFBSSxLQUFLLFVBQVUsS0FBSyxXQUFXO0FBQ2pDLGFBQUssT0FBTyxvQkFBb0IsVUFBVSxLQUFLLFNBQVM7QUFBQSxNQUMxRDtBQUFBLElBQ0Y7QUFBQSxJQUVBLFVBQVU7QUFDUixXQUFLLFlBQVk7QUFBQSxJQUNuQjtBQUFBLElBRUEsY0FBYztBQUNaLFVBQUksQ0FBQyxLQUFLLE9BQVE7QUFDbEIsWUFBTSxZQUFZLE9BQU8sV0FBVyxvQkFBb0IsRUFBRTtBQUMxRCxVQUFJLFdBQVc7QUFDYixjQUFNLFlBQVksYUFBYSxRQUFRLHVCQUF1QixNQUFNO0FBQ3BFLGFBQUssT0FBTyxVQUFVLENBQUM7QUFBQSxNQUN6QixPQUFPO0FBQ0wsYUFBSyxPQUFPLFVBQVU7QUFBQSxNQUN4QjtBQUFBLElBQ0Y7QUFBQSxFQUNGOzs7QUMvQ0EsTUFBTSxpQkFBaUI7QUFBQSxJQUNyQixVQUFVO0FBQ1IsV0FBSyxPQUFPLEtBQUssU0FBUyxDQUFDO0FBRTNCLFdBQUssWUFBWSxDQUFDO0FBQ2xCLFdBQUssR0FBRyxpQkFBaUIsb0JBQW9CLEVBQUUsUUFBUSxTQUFPO0FBQzVELGNBQU0sVUFBVSxNQUFNO0FBQ3BCLGdCQUFNLFFBQVEsSUFBSSxhQUFhLGtCQUFrQjtBQUNqRCxlQUFLLE9BQU8sS0FBSztBQUNqQix1QkFBYSxRQUFRLGFBQWEsS0FBSztBQUFBLFFBQ3pDO0FBQ0EsWUFBSSxpQkFBaUIsU0FBUyxPQUFPO0FBQ3JDLGFBQUssVUFBVSxLQUFLLEVBQUUsS0FBSyxRQUFRLENBQUM7QUFBQSxNQUN0QyxDQUFDO0FBQUEsSUFDSDtBQUFBLElBRUEsWUFBWTtBQUNWLFdBQUssV0FBVztBQUFBLFFBQVEsQ0FBQyxFQUFFLEtBQUssUUFBUSxNQUN0QyxJQUFJLG9CQUFvQixTQUFTLE9BQU87QUFBQSxNQUMxQztBQUFBLElBQ0Y7QUFBQSxJQUVBLFdBQVc7QUFDVCxhQUFPLGFBQWEsUUFBUSxXQUFXLEtBQUs7QUFBQSxJQUM5QztBQUFBLElBRUEsT0FBTyxPQUFPO0FBQ1osWUFBTSxPQUFPLFNBQVM7QUFFdEIsV0FBSyxHQUFHLGlCQUFpQixvQkFBb0IsRUFBRSxRQUFRLFNBQU87QUFDNUQsWUFBSSxnQkFBZ0IsZUFBZSxJQUFJLGFBQWEsa0JBQWtCLE1BQU0sS0FBSztBQUFBLE1BQ25GLENBQUM7QUFFRCxVQUFJLFVBQVUsVUFBVTtBQUN0QixhQUFLLGdCQUFnQixZQUFZO0FBQUEsTUFDbkMsT0FBTztBQUNMLGFBQUssYUFBYSxjQUFjLEtBQUs7QUFBQSxNQUN2QztBQUFBLElBQ0Y7QUFBQSxFQUNGOzs7QUN2Q0EsTUFBTSxhQUFhO0FBQUEsSUFDakIsVUFBVTtBQUFFLFdBQUssTUFBTTtBQUFBLElBQUU7QUFBQSxJQUN6QixVQUFVO0FBQUUsV0FBSyxNQUFNO0FBQUEsSUFBRTtBQUFBLElBQ3pCLFlBQVk7QUFBRSxXQUFLLFFBQVE7QUFBQSxJQUFFO0FBQUEsSUFDN0IsUUFBUTtBQUNOLFdBQUssUUFBUTtBQUNiLFlBQU0sVUFBVSxLQUFLLEdBQUcsY0FBYyw4QkFBOEI7QUFDcEUsWUFBTSxLQUFLLFNBQVMsYUFBYSxlQUFlO0FBQ2hELFdBQUssV0FBVyxLQUFLLFNBQVMsZUFBZSxFQUFFLElBQUk7QUFDbkQsVUFBSSxDQUFDLEtBQUssU0FBVTtBQUNwQixXQUFLLFlBQVksTUFBTTtBQUNyQixjQUFNLE9BQU8sS0FBSyxTQUFTLFFBQVEsZUFBZTtBQUNsRCxnQkFBUSxhQUFhLGlCQUFpQixPQUFPLElBQUksQ0FBQztBQUFBLE1BQ3BEO0FBQ0EsV0FBSyxTQUFTLGlCQUFpQixVQUFVLEtBQUssU0FBUztBQUFBLElBQ3pEO0FBQUEsSUFDQSxVQUFVO0FBQ1IsVUFBSSxLQUFLLFlBQVksS0FBSyxXQUFXO0FBQ25DLGFBQUssU0FBUyxvQkFBb0IsVUFBVSxLQUFLLFNBQVM7QUFBQSxNQUM1RDtBQUNBLFdBQUssV0FBVztBQUNoQixXQUFLLFlBQVk7QUFBQSxJQUNuQjtBQUFBLEVBQ0Y7OztBQ3ZCQSxNQUFNLGtCQUFrQjtBQUFBLElBQ3RCLFVBQVU7QUFBRSxXQUFLLE1BQU07QUFBQSxJQUFFO0FBQUEsSUFDekIsVUFBVTtBQUFFLFdBQUssTUFBTTtBQUFBLElBQUU7QUFBQSxJQUN6QixZQUFZO0FBQUUsV0FBSyxRQUFRO0FBQUEsSUFBRTtBQUFBLElBQzdCLFFBQVE7QUFDTixXQUFLLFFBQVE7QUFDYixXQUFLLFFBQVEsS0FBSyxHQUFHLFFBQVEsZUFBZSxJQUFJLEtBQUssS0FBSyxLQUFLLEdBQUcsY0FBYyxlQUFlO0FBQy9GLFVBQUksQ0FBQyxLQUFLLE1BQU87QUFDakIsV0FBSyxhQUFhLENBQUMsTUFBTTtBQUN2QixjQUFNLFFBQVEsQ0FBQyxHQUFHLEtBQUssTUFBTSxpQkFBaUIsbUNBQW1DLENBQUM7QUFDbEYsWUFBSSxDQUFDLE1BQU0sT0FBUTtBQUNuQixjQUFNLE1BQU0sTUFBTSxRQUFRLFNBQVMsYUFBYTtBQUNoRCxZQUFJLE9BQU87QUFDWCxnQkFBUSxFQUFFLEtBQUs7QUFBQSxVQUNiLEtBQUs7QUFBYSxtQkFBTyxNQUFNLE1BQU0sU0FBUyxJQUFJLE1BQU0sSUFBSTtBQUFHO0FBQUEsVUFDL0QsS0FBSztBQUFXLG1CQUFPLE1BQU0sSUFBSSxNQUFNLElBQUksTUFBTSxTQUFTO0FBQUc7QUFBQSxVQUM3RCxLQUFLO0FBQVEsbUJBQU87QUFBRztBQUFBLFVBQ3ZCLEtBQUs7QUFBTyxtQkFBTyxNQUFNLFNBQVM7QUFBRztBQUFBLFVBQ3JDO0FBQVM7QUFBQSxRQUNYO0FBQ0EsVUFBRSxlQUFlO0FBQ2pCLGNBQU0sSUFBSSxHQUFHLE1BQU07QUFBQSxNQUNyQjtBQUNBLFdBQUssTUFBTSxpQkFBaUIsV0FBVyxLQUFLLFVBQVU7QUFBQSxJQUN4RDtBQUFBLElBQ0EsVUFBVTtBQUNSLFVBQUksS0FBSyxTQUFTLEtBQUssWUFBWTtBQUNqQyxhQUFLLE1BQU0sb0JBQW9CLFdBQVcsS0FBSyxVQUFVO0FBQUEsTUFDM0Q7QUFDQSxXQUFLLFFBQVE7QUFDYixXQUFLLGFBQWE7QUFBQSxJQUNwQjtBQUFBLEVBQ0Y7OztBQ2hDQSxNQUFNLFlBQVk7QUFBQSxJQUNoQixVQUFVO0FBQUUsV0FBSyxNQUFNO0FBQUEsSUFBRTtBQUFBLElBQ3pCLFVBQVU7QUFBRSxXQUFLLE1BQU07QUFBQSxJQUFFO0FBQUEsSUFDekIsWUFBWTtBQUFFLFdBQUssUUFBUTtBQUFBLElBQUU7QUFBQSxJQUU3QixRQUFRO0FBQ04sV0FBSyxRQUFRO0FBRWIsV0FBSyxXQUFXLEtBQUssR0FBRyxjQUFjLDZCQUE2QjtBQUNuRSxZQUFNLFlBQVksS0FBSyxVQUFVLGFBQWEsZUFBZTtBQUM3RCxXQUFLLFdBQVcsWUFBWSxTQUFTLGVBQWUsU0FBUyxJQUFJO0FBQ2pFLFdBQUssV0FBVyxLQUFLLEdBQUcsY0FBYyxrQkFBa0I7QUFDeEQsV0FBSyxVQUFVLEtBQUssR0FBRyxRQUFRLG9CQUFvQixHQUFHLGNBQWMsc0JBQXNCO0FBRTFGLFVBQUksQ0FBQyxLQUFLLFlBQVksQ0FBQyxLQUFLLFNBQVU7QUFHdEMsV0FBSyxZQUFZLE1BQU07QUFDckIsY0FBTSxPQUFPLEtBQUssU0FBUyxRQUFRLGVBQWU7QUFDbEQsYUFBSyxTQUFTLGFBQWEsaUJBQWlCLE9BQU8sSUFBSSxDQUFDO0FBQ3hELFlBQUksTUFBTTtBQUVSLGdCQUFNLFdBQVcsS0FBSyxTQUFTLGNBQWMsaUJBQWlCO0FBQzlELGdCQUFNLFFBQVEsS0FBSyxTQUFTLGNBQWMsaURBQWlEO0FBQzNGLGdCQUFNLFNBQVMsWUFBWTtBQUMzQixjQUFJLE9BQVEsUUFBTyxNQUFNO0FBQUEsUUFDM0I7QUFBQSxNQUNGO0FBQ0EsV0FBSyxTQUFTLGlCQUFpQixVQUFVLEtBQUssU0FBUztBQUd2RCxXQUFLLFdBQVcsQ0FBQyxNQUFNO0FBQ3JCLGNBQU0sTUFBTSxFQUFFLE9BQU8sUUFBUSw0QkFBNEI7QUFDekQsWUFBSSxDQUFDLE9BQU8sSUFBSSxhQUFhLGVBQWUsRUFBRztBQUMvQyxhQUFLLGNBQWMsR0FBRztBQUFBLE1BQ3hCO0FBQ0EsV0FBSyxTQUFTLGlCQUFpQixTQUFTLEtBQUssUUFBUTtBQUdyRCxXQUFLLGFBQWEsQ0FBQyxNQUFNO0FBQ3ZCLGNBQU0sVUFBVSxDQUFDLEdBQUcsS0FBSyxTQUFTLGlCQUFpQixpREFBaUQsQ0FBQztBQUNyRyxZQUFJLENBQUMsUUFBUSxPQUFRO0FBQ3JCLGNBQU0sTUFBTSxRQUFRLFFBQVEsU0FBUyxhQUFhO0FBQ2xELFlBQUksT0FBTztBQUVYLGdCQUFRLEVBQUUsS0FBSztBQUFBLFVBQ2IsS0FBSztBQUNILG1CQUFPLE1BQU0sUUFBUSxTQUFTLElBQUksTUFBTSxJQUFJO0FBQzVDO0FBQUEsVUFDRixLQUFLO0FBQ0gsbUJBQU8sTUFBTSxJQUFJLE1BQU0sSUFBSSxRQUFRLFNBQVM7QUFDNUM7QUFBQSxVQUNGLEtBQUs7QUFDSCxtQkFBTztBQUNQO0FBQUEsVUFDRixLQUFLO0FBQ0gsbUJBQU8sUUFBUSxTQUFTO0FBQ3hCO0FBQUEsVUFDRixLQUFLO0FBQUEsVUFDTCxLQUFLO0FBQ0gsY0FBRSxlQUFlO0FBQ2pCLGdCQUFJLE9BQU8sRUFBRyxNQUFLLGNBQWMsUUFBUSxHQUFHLENBQUM7QUFDN0M7QUFBQSxVQUNGLEtBQUs7QUFDSCxpQkFBSyxTQUFTLFlBQVk7QUFDMUIsaUJBQUssU0FBUyxNQUFNO0FBQ3BCO0FBQUEsVUFDRjtBQUVFLGlCQUFLLFdBQVcsRUFBRSxLQUFLLE9BQU87QUFDOUI7QUFBQSxRQUNKO0FBRUEsVUFBRSxlQUFlO0FBQ2pCLFlBQUksUUFBUSxFQUFHLFNBQVEsSUFBSSxFQUFFLE1BQU07QUFBQSxNQUNyQztBQUNBLFdBQUssU0FBUyxpQkFBaUIsV0FBVyxLQUFLLFVBQVU7QUFBQSxJQUMzRDtBQUFBLElBRUEsY0FBYyxLQUFLO0FBQ2pCLFlBQU0sUUFBUSxJQUFJLGFBQWEsWUFBWTtBQUMzQyxZQUFNLE9BQU8sSUFBSSxZQUFZLEtBQUs7QUFHbEMsVUFBSSxLQUFLLFNBQVM7QUFDaEIsYUFBSyxRQUFRLFFBQVE7QUFDckIsYUFBSyxRQUFRLGNBQWMsSUFBSSxNQUFNLFNBQVMsRUFBRSxTQUFTLEtBQUssQ0FBQyxDQUFDO0FBQUEsTUFDbEU7QUFHQSxXQUFLLFNBQVMsaUJBQWlCLDRCQUE0QixFQUFFLFFBQVEsQ0FBQyxNQUFNO0FBQzFFLGNBQU0sYUFBYSxFQUFFLGFBQWEsWUFBWSxNQUFNO0FBQ3BELFVBQUUsYUFBYSxpQkFBaUIsT0FBTyxVQUFVLENBQUM7QUFDbEQsWUFBSSxZQUFZO0FBQ2QsWUFBRSxhQUFhLGlCQUFpQixFQUFFO0FBQUEsUUFDcEMsT0FBTztBQUNMLFlBQUUsZ0JBQWdCLGVBQWU7QUFBQSxRQUNuQztBQUFBLE1BQ0YsQ0FBQztBQUdELFlBQU0sVUFBVSxLQUFLLFNBQVMsY0FBYywyQkFBMkI7QUFDdkUsVUFBSSxRQUFTLFNBQVEsY0FBYztBQUduQyxXQUFLLFNBQVMsWUFBWTtBQUMxQixXQUFLLFNBQVMsTUFBTTtBQUFBLElBQ3RCO0FBQUEsSUFFQSxXQUFXLE1BQU0sU0FBUztBQUN4QixVQUFJLEtBQUssV0FBVyxFQUFHO0FBQ3ZCLFlBQU0sUUFBUSxLQUFLLFlBQVk7QUFDL0IsWUFBTSxhQUFhLFFBQVEsUUFBUSxTQUFTLGFBQWE7QUFDekQsWUFBTSxRQUFRLGFBQWE7QUFDM0IsWUFBTSxVQUFVLENBQUMsR0FBRyxRQUFRLE1BQU0sS0FBSyxHQUFHLEdBQUcsUUFBUSxNQUFNLEdBQUcsS0FBSyxDQUFDO0FBQ3BFLFlBQU0sUUFBUSxRQUFRLEtBQUssT0FBSyxFQUFFLFlBQVksS0FBSyxFQUFFLFlBQVksRUFBRSxXQUFXLEtBQUssQ0FBQztBQUNwRixVQUFJLE1BQU8sT0FBTSxNQUFNO0FBQUEsSUFDekI7QUFBQSxJQUVBLFVBQVU7QUFDUixVQUFJLEtBQUssWUFBWSxLQUFLLFdBQVc7QUFDbkMsYUFBSyxTQUFTLG9CQUFvQixVQUFVLEtBQUssU0FBUztBQUFBLE1BQzVEO0FBQ0EsVUFBSSxLQUFLLFlBQVksS0FBSyxVQUFVO0FBQ2xDLGFBQUssU0FBUyxvQkFBb0IsU0FBUyxLQUFLLFFBQVE7QUFBQSxNQUMxRDtBQUNBLFVBQUksS0FBSyxZQUFZLEtBQUssWUFBWTtBQUNwQyxhQUFLLFNBQVMsb0JBQW9CLFdBQVcsS0FBSyxVQUFVO0FBQUEsTUFDOUQ7QUFDQSxXQUFLLFdBQVc7QUFDaEIsV0FBSyxXQUFXO0FBQ2hCLFdBQUssV0FBVztBQUNoQixXQUFLLFVBQVU7QUFDZixXQUFLLFlBQVk7QUFDakIsV0FBSyxXQUFXO0FBQ2hCLFdBQUssYUFBYTtBQUFBLElBQ3BCO0FBQUEsRUFDRjs7O0FDeklBLE1BQU0sY0FBYztBQUFBLElBQ2xCLFVBQVU7QUFBRSxXQUFLLE1BQU07QUFBQSxJQUFFO0FBQUEsSUFDekIsVUFBVTtBQUFFLFdBQUssTUFBTTtBQUFBLElBQUU7QUFBQSxJQUN6QixZQUFZO0FBQUUsV0FBSyxRQUFRO0FBQUEsSUFBRTtBQUFBLElBQzdCLFFBQVE7QUFDTixXQUFLLFFBQVE7QUFDYixZQUFNLGlCQUFpQixLQUFLLEdBQUcsUUFBUSxZQUFZO0FBQ25ELFlBQU0sU0FBUyxLQUFLLEdBQUcsUUFBUSxVQUFVO0FBQ3pDLFlBQU0sV0FBVyxLQUFLLEdBQUcsUUFBUTtBQUNqQyxZQUFNLFdBQVcsU0FBUyxLQUFLLEdBQUcsUUFBUSxZQUFZLE9BQU8sRUFBRTtBQUUvRCxXQUFLLFVBQVUsaUJBQ1gsS0FBSyxHQUFHLGNBQWMscUNBQXFDLElBQzNELEtBQUssR0FBRyxjQUFjLDhCQUE4QjtBQUV4RCxZQUFNLGFBQWEsS0FBSyxHQUFHLGNBQWMsK0JBQStCO0FBQ3hFLFlBQU0sWUFBWSxZQUFZLGFBQWEsZUFBZSxLQUFLLEtBQUssR0FBRyxjQUFjLDhCQUE4QixHQUFHO0FBQ3RILFdBQUssV0FBVyxZQUFZLFNBQVMsZUFBZSxTQUFTLElBQUk7QUFDakUsV0FBSyxVQUFVLEtBQUssR0FBRyxRQUFRLG9CQUFvQixHQUFHLGNBQWMsc0JBQXNCO0FBQzFGLFdBQUssV0FBVyxLQUFLLEdBQUcsY0FBYyxrQkFBa0I7QUFDeEQsV0FBSyxTQUFTLEtBQUssR0FBRyxjQUFjLDZCQUE2QjtBQUNqRSxXQUFLLFVBQVUsS0FBSyxHQUFHLGNBQWMsOEJBQThCO0FBRW5FLFdBQUssU0FBUyxLQUFLLEdBQUcsY0FBYyw2QkFBNkI7QUFFakUsVUFBSSxDQUFDLEtBQUssU0FBVTtBQUdwQixVQUFJLEtBQUssUUFBUTtBQUNmLGFBQUssV0FBVyxDQUFDLE1BQU07QUFDckIsWUFBRSxnQkFBZ0I7QUFDbEIsY0FBSSxLQUFLLFNBQVM7QUFDaEIsaUJBQUssUUFBUSxRQUFRO0FBQ3JCLGlCQUFLLFFBQVEsY0FBYyxJQUFJLE1BQU0sU0FBUyxFQUFFLFNBQVMsS0FBSyxDQUFDLENBQUM7QUFBQSxVQUNsRTtBQUVBLGdCQUFNLFVBQVUsS0FBSyxHQUFHLGNBQWMsNkJBQTZCO0FBQ25FLGNBQUksUUFBUyxTQUFRLGNBQWMsS0FBSyxTQUFTLGVBQWU7QUFFaEUsY0FBSSxLQUFLLFVBQVU7QUFDakIsaUJBQUssU0FBUyxpQkFBaUIsOEJBQThCLEVBQUUsUUFBUSxPQUFLO0FBQzFFLGdCQUFFLGFBQWEsaUJBQWlCLE9BQU87QUFDdkMscUJBQU8sRUFBRSxRQUFRO0FBQUEsWUFDbkIsQ0FBQztBQUFBLFVBQ0g7QUFBQSxRQUNGO0FBQ0EsYUFBSyxPQUFPLGlCQUFpQixTQUFTLEtBQUssUUFBUTtBQUFBLE1BQ3JEO0FBR0EsV0FBSyxZQUFZLE1BQU07QUFDckIsY0FBTSxPQUFPLEtBQUssU0FBUyxRQUFRLGVBQWU7QUFDbEQsWUFBSSxXQUFZLFlBQVcsYUFBYSxpQkFBaUIsT0FBTyxJQUFJLENBQUM7QUFDckUsWUFBSSxLQUFLLFFBQVMsTUFBSyxRQUFRLGFBQWEsaUJBQWlCLE9BQU8sSUFBSSxDQUFDO0FBQ3pFLFlBQUksUUFBUSxLQUFLLFdBQVcsQ0FBQyxnQkFBZ0I7QUFDM0MsZUFBSyxRQUFRLFFBQVE7QUFDckIsZUFBSyxRQUFRLE1BQU07QUFDbkIsY0FBSSxXQUFXLFNBQVUsTUFBSyxjQUFjLEVBQUU7QUFBQSxRQUNoRDtBQUFBLE1BQ0Y7QUFDQSxXQUFLLFNBQVMsaUJBQWlCLFVBQVUsS0FBSyxTQUFTO0FBR3ZELFVBQUksa0JBQWtCLEtBQUssU0FBUztBQUNsQyxhQUFLLFdBQVcsTUFBTTtBQUNwQixjQUFJO0FBQUUsaUJBQUssU0FBUyxZQUFZO0FBQUEsVUFBRSxTQUFRLE1BQU07QUFBQSxVQUFDO0FBQUEsUUFDbkQ7QUFDQSxhQUFLLFVBQVUsTUFBTTtBQUNuQixnQkFBTSxVQUFVLEtBQUs7QUFDckIscUJBQVcsTUFBTTtBQUNmLGdCQUFJLENBQUMsUUFBUztBQUNkLGdCQUFJLENBQUMsUUFBUSxTQUFTLFNBQVMsYUFBYSxLQUFLLFNBQVMsa0JBQWtCLEtBQUssU0FBUztBQUN4RixrQkFBSTtBQUFFLHdCQUFRLFlBQVk7QUFBQSxjQUFFLFNBQVEsTUFBTTtBQUFBLGNBQUM7QUFBQSxZQUM3QztBQUFBLFVBQ0YsR0FBRyxHQUFHO0FBQUEsUUFDUjtBQUNBLGFBQUssUUFBUSxpQkFBaUIsU0FBUyxLQUFLLFFBQVE7QUFDcEQsYUFBSyxRQUFRLGlCQUFpQixRQUFRLEtBQUssT0FBTztBQUFBLE1BQ3BEO0FBR0EsVUFBSSxLQUFLLFNBQVM7QUFDaEIsYUFBSyxXQUFXLE1BQU07QUFDcEIsZ0JBQU0sUUFBUSxLQUFLLFFBQVE7QUFDM0IsY0FBSSxXQUFXLFVBQVU7QUFDdkIsaUJBQUssY0FBYyxLQUFLO0FBQUEsVUFDMUIsT0FBTztBQUNMLHlCQUFhLEtBQUssY0FBYztBQUNoQyxpQkFBSyxpQkFBaUIsV0FBVyxNQUFNO0FBQ3JDLGtCQUFJLFNBQVUsTUFBSyxVQUFVLFVBQVUsRUFBRSxNQUFNLENBQUM7QUFBQSxZQUNsRCxHQUFHLFFBQVE7QUFBQSxVQUNiO0FBRUEsY0FBSSxLQUFLLFNBQVM7QUFDaEIsa0JBQU0sT0FBTyxLQUFLLFFBQVEsY0FBYyxvQ0FBb0M7QUFDNUUsZ0JBQUksS0FBTSxNQUFLLGNBQWM7QUFDN0IsaUJBQUssUUFBUSxTQUFTLENBQUM7QUFBQSxVQUN6QjtBQUFBLFFBQ0Y7QUFDQSxhQUFLLFFBQVEsaUJBQWlCLFNBQVMsS0FBSyxRQUFRO0FBQUEsTUFDdEQ7QUFHQSxVQUFJLEtBQUssVUFBVTtBQUNqQixhQUFLLFdBQVcsQ0FBQyxNQUFNO0FBQ3JCLGdCQUFNLE1BQU0sRUFBRSxPQUFPLFFBQVEsbURBQW1EO0FBQ2hGLGNBQUksQ0FBQyxJQUFLO0FBQ1YsZUFBSyxjQUFjLEdBQUc7QUFBQSxRQUN4QjtBQUNBLGFBQUssU0FBUyxpQkFBaUIsU0FBUyxLQUFLLFFBQVE7QUFHckQsYUFBSyxhQUFhLENBQUMsTUFBTTtBQUN2QixnQkFBTSxPQUFPLENBQUMsR0FBRyxLQUFLLFNBQVMsaUJBQWlCLGlFQUFpRSxDQUFDO0FBQ2xILGNBQUksQ0FBQyxLQUFLLE9BQVE7QUFDbEIsZ0JBQU0sTUFBTSxLQUFLLFFBQVEsU0FBUyxhQUFhO0FBQy9DLGNBQUksT0FBTztBQUNYLGtCQUFRLEVBQUUsS0FBSztBQUFBLFlBQ2IsS0FBSztBQUFhLHFCQUFPLE1BQU0sS0FBSyxTQUFTLElBQUksTUFBTSxJQUFJO0FBQUc7QUFBQSxZQUM5RCxLQUFLO0FBQVcscUJBQU8sTUFBTSxJQUFJLE1BQU0sSUFBSSxLQUFLLFNBQVM7QUFBRztBQUFBLFlBQzVELEtBQUs7QUFBUSxxQkFBTztBQUFHO0FBQUEsWUFDdkIsS0FBSztBQUFPLHFCQUFPLEtBQUssU0FBUztBQUFHO0FBQUEsWUFDcEMsS0FBSztBQUNILGtCQUFJLE9BQU8sR0FBRztBQUFFLHFCQUFLLGNBQWMsS0FBSyxHQUFHLENBQUM7QUFBRyxrQkFBRSxlQUFlO0FBQUEsY0FBRTtBQUNsRTtBQUFBLFlBQ0YsS0FBSztBQUNILGtCQUFJO0FBQUUscUJBQUssU0FBUyxZQUFZO0FBQUEsY0FBRSxTQUFRLE1BQU07QUFBQSxjQUFDO0FBQ2pEO0FBQUEsWUFDRjtBQUFTO0FBQUEsVUFDWDtBQUNBLFlBQUUsZUFBZTtBQUNqQixlQUFLLElBQUksR0FBRyxNQUFNO0FBQUEsUUFDcEI7QUFDQSxhQUFLLFNBQVMsaUJBQWlCLFdBQVcsS0FBSyxVQUFVO0FBQUEsTUFDM0Q7QUFBQSxJQUNGO0FBQUEsSUFDQSxjQUFjLE9BQU87QUFDbkIsVUFBSSxDQUFDLEtBQUssU0FBVTtBQUNwQixZQUFNLElBQUksTUFBTSxZQUFZO0FBQzVCLFVBQUksYUFBYTtBQUNqQixXQUFLLFNBQVMsaUJBQWlCLDhCQUE4QixFQUFFLFFBQVEsU0FBTztBQUM1RSxjQUFNLFFBQVEsQ0FBQyxLQUFLLElBQUksWUFBWSxLQUFLLEVBQUUsWUFBWSxFQUFFLFNBQVMsQ0FBQztBQUNuRSxZQUFJLFNBQVMsQ0FBQztBQUNkLFlBQUksTUFBTyxjQUFhO0FBQUEsTUFDMUIsQ0FBQztBQUNELFVBQUksS0FBSyxPQUFRLE1BQUssT0FBTyxTQUFTO0FBQUEsSUFDeEM7QUFBQSxJQUNBLGNBQWMsS0FBSztBQUNqQixZQUFNLFFBQVEsSUFBSSxRQUFRO0FBQzFCLFVBQUksS0FBSyxTQUFTO0FBQ2hCLGFBQUssUUFBUSxRQUFRO0FBQ3JCLGFBQUssUUFBUSxjQUFjLElBQUksTUFBTSxTQUFTLEVBQUUsU0FBUyxLQUFLLENBQUMsQ0FBQztBQUFBLE1BQ2xFO0FBRUEsVUFBSSxLQUFLLFVBQVU7QUFDakIsYUFBSyxTQUFTLGlCQUFpQiw4QkFBOEIsRUFBRSxRQUFRLE9BQUs7QUFDMUUsWUFBRSxhQUFhLGlCQUFpQixPQUFPLEVBQUUsUUFBUSxVQUFVLEtBQUssQ0FBQztBQUNqRSxjQUFJLEVBQUUsUUFBUSxVQUFVLE1BQU8sR0FBRSxRQUFRLFdBQVc7QUFBQSxjQUMvQyxRQUFPLEVBQUUsUUFBUTtBQUFBLFFBQ3hCLENBQUM7QUFBQSxNQUNIO0FBRUEsWUFBTSxVQUFVLEtBQUssR0FBRyxjQUFjLDZCQUE2QjtBQUNuRSxVQUFJLFFBQVMsU0FBUSxjQUFjLElBQUksWUFBWSxLQUFLO0FBRXhELFVBQUksQ0FBQyxLQUFLLEdBQUcsUUFBUSxVQUFVO0FBQzdCLFlBQUk7QUFBRSxlQUFLLFVBQVUsWUFBWTtBQUFBLFFBQUUsU0FBUSxNQUFNO0FBQUEsUUFBQztBQUFBLE1BQ3BEO0FBQUEsSUFDRjtBQUFBLElBQ0EsVUFBVTtBQUNSLG1CQUFhLEtBQUssY0FBYztBQUNoQyxXQUFLLGlCQUFpQjtBQUN0QixVQUFJLEtBQUssVUFBVTtBQUNqQixZQUFJLEtBQUssVUFBVyxNQUFLLFNBQVMsb0JBQW9CLFVBQVUsS0FBSyxTQUFTO0FBQzlFLFlBQUksS0FBSyxXQUFZLE1BQUssU0FBUyxvQkFBb0IsV0FBVyxLQUFLLFVBQVU7QUFBQSxNQUNuRjtBQUNBLFVBQUksS0FBSyxZQUFZLEtBQUssU0FBVSxNQUFLLFNBQVMsb0JBQW9CLFNBQVMsS0FBSyxRQUFRO0FBQzVGLFVBQUksS0FBSyxTQUFTO0FBQ2hCLFlBQUksS0FBSyxTQUFVLE1BQUssUUFBUSxvQkFBb0IsU0FBUyxLQUFLLFFBQVE7QUFDMUUsWUFBSSxLQUFLLFNBQVUsTUFBSyxRQUFRLG9CQUFvQixTQUFTLEtBQUssUUFBUTtBQUMxRSxZQUFJLEtBQUssUUFBUyxNQUFLLFFBQVEsb0JBQW9CLFFBQVEsS0FBSyxPQUFPO0FBQUEsTUFDekU7QUFDQSxVQUFJLEtBQUssVUFBVSxLQUFLLFNBQVUsTUFBSyxPQUFPLG9CQUFvQixTQUFTLEtBQUssUUFBUTtBQUN4RixXQUFLLFdBQVc7QUFDaEIsV0FBSyxXQUFXO0FBQ2hCLFdBQUssVUFBVTtBQUNmLFdBQUssU0FBUztBQUNkLFdBQUssU0FBUztBQUNkLFdBQUssVUFBVTtBQUNmLFdBQUssVUFBVTtBQUFBLElBQ2pCO0FBQUEsRUFDRjs7O0FDL0xBLE1BQUksZUFBZTtBQUNuQixNQUFNLGdCQUFnQjtBQUN0QixNQUFNLGVBQ0osT0FBTyxRQUFRLGVBQWUsSUFBSSxTQUFTLGlCQUFpQixLQUFLO0FBRW5FLE1BQU0sTUFBTTtBQUVaLE1BQU0sYUFBYTtBQUFBLElBQ2pCLFVBQVU7QUFDUixZQUFNLFVBQVUsS0FBSztBQUNyQixZQUFNLFNBQVMsUUFBUSxjQUFjLDZCQUE2QjtBQUNsRSxZQUFNLFVBQVUsUUFBUSxjQUFjLDhCQUE4QjtBQUNwRSxVQUFJLENBQUMsVUFBVSxDQUFDLFFBQVM7QUFFekIsV0FBSyxVQUFVO0FBQ2YsV0FBSyxXQUFXO0FBQ2hCLFdBQUssV0FBVztBQUNoQixXQUFLLGdCQUFnQixRQUFRLFFBQVE7QUFDckMsV0FBSyxTQUFTLFNBQVMsUUFBUSxRQUFRLEtBQUssS0FBSztBQUlqRCxjQUFRLGFBQWEsV0FBVyxRQUFRO0FBRXhDLFlBQU0sT0FBTyxNQUFNO0FBQ2pCLHFCQUFhLEtBQUssUUFBUTtBQUMxQixjQUFNLFVBQVUsS0FBSyxJQUFJLElBQUk7QUFDN0IsY0FBTSxPQUFPLFVBQVUsZ0JBQWdCLElBQUksS0FBSztBQUNoRCxhQUFLLFdBQVcsV0FBVyxNQUFNO0FBQy9CLGNBQUk7QUFBRSxvQkFBUSxZQUFZO0FBQUEsVUFBRSxTQUFTLEdBQUc7QUFBRTtBQUFBLFVBQU87QUFDakQsZ0NBQXNCLE1BQU07QUFDMUIsZ0JBQUksQ0FBQyxhQUFjLE1BQUssa0JBQWtCO0FBQzFDLGlCQUFLLFlBQVk7QUFBQSxVQUNuQixDQUFDO0FBQUEsUUFDSCxHQUFHLElBQUk7QUFBQSxNQUNUO0FBRUEsWUFBTSxPQUFPLE1BQU07QUFDakIscUJBQWEsS0FBSyxRQUFRO0FBQzFCLFlBQUk7QUFDRixjQUFJLFFBQVEsUUFBUSxlQUFlLEdBQUc7QUFDcEMsb0JBQVEsWUFBWTtBQUNwQiwyQkFBZSxLQUFLLElBQUk7QUFDeEIsb0JBQVEsUUFBUSxPQUFPLEtBQUs7QUFDNUIsZ0JBQUksQ0FBQyxjQUFjO0FBQ2pCLHNCQUFRLE1BQU0sTUFBTTtBQUNwQixzQkFBUSxNQUFNLE9BQU87QUFBQSxZQUN2QjtBQUFBLFVBQ0Y7QUFBQSxRQUNGLFNBQVMsR0FBRztBQUFBLFFBQUM7QUFBQSxNQUNmO0FBRUEsY0FBUSxpQkFBaUIsY0FBYyxLQUFLLFFBQVEsTUFBTSxLQUFLLENBQUM7QUFDaEUsY0FBUSxpQkFBaUIsY0FBYyxLQUFLLFFBQVEsTUFBTSxLQUFLLENBQUM7QUFDaEUsYUFBTyxpQkFBaUIsV0FBVyxLQUFLLFdBQVcsTUFBTSxLQUFLLENBQUM7QUFDL0QsYUFBTyxpQkFBaUIsWUFBWSxLQUFLLFlBQVksQ0FBQyxNQUFNO0FBQzFELFlBQUksQ0FBQyxRQUFRLFNBQVMsRUFBRSxhQUFhLEVBQUcsTUFBSztBQUFBLE1BQy9DLENBQUM7QUFDRCxjQUFRLGlCQUFpQixXQUFXLEtBQUssV0FBVyxDQUFDLE1BQU07QUFDekQsWUFBSSxFQUFFLFFBQVEsU0FBVSxNQUFLO0FBQUEsTUFDL0IsQ0FBQztBQUFBLElBQ0g7QUFBQTtBQUFBLElBR0EsY0FBYztBQUNaLFlBQU0sS0FBSyxLQUFLLFFBQVEsc0JBQXNCO0FBQzlDLFlBQU0sS0FBSyxLQUFLLFNBQVMsc0JBQXNCO0FBQy9DLFVBQUk7QUFDSixVQUFJLEdBQUcsVUFBVSxHQUFHLE1BQU0sRUFBRyxVQUFTO0FBQUEsZUFDN0IsR0FBRyxPQUFPLEdBQUcsU0FBUyxFQUFHLFVBQVM7QUFBQSxlQUNsQyxHQUFHLFNBQVMsR0FBRyxPQUFPLEVBQUcsVUFBUztBQUFBLGVBQ2xDLEdBQUcsUUFBUSxHQUFHLFFBQVEsRUFBRyxVQUFTO0FBQUEsVUFDdEMsVUFBUyxLQUFLO0FBQ25CLFdBQUssU0FBUyxRQUFRLE9BQU87QUFBQSxJQUMvQjtBQUFBO0FBQUEsSUFHQSxvQkFBb0I7QUFDbEIsWUFBTSxLQUFLLEtBQUssUUFBUSxzQkFBc0I7QUFDOUMsWUFBTSxLQUFLLEtBQUssU0FBUztBQUN6QixZQUFNLEtBQUssS0FBSyxTQUFTO0FBQ3pCLFlBQU0sT0FBTyxLQUFLO0FBQ2xCLFlBQU0sUUFBUSxLQUFLLFNBQVMsUUFBUSxTQUFTO0FBQzdDLFVBQUksS0FBSztBQUVULFVBQUksU0FBUyxTQUFTLFNBQVMsVUFBVTtBQUN2QyxjQUFNLFNBQVMsUUFBUSxHQUFHLE1BQU0sS0FBSyxNQUFNLEdBQUcsU0FBUztBQUN2RCxZQUFJLFVBQVUsUUFBUyxRQUFPLEdBQUc7QUFBQSxpQkFDeEIsVUFBVSxNQUFPLFFBQU8sR0FBRyxRQUFRO0FBQUEsWUFDdkMsUUFBTyxHQUFHLFFBQVEsR0FBRyxRQUFRLE1BQU07QUFBQSxNQUMxQyxPQUFPO0FBQ0wsZUFBTyxTQUFTLFNBQVMsR0FBRyxPQUFPLEtBQUssTUFBTSxHQUFHLFFBQVE7QUFDekQsY0FBTSxHQUFHLE9BQU8sR0FBRyxTQUFTLE1BQU07QUFBQSxNQUNwQztBQUVBLFdBQUssU0FBUyxNQUFNLE1BQU0sR0FBRyxHQUFHO0FBQ2hDLFdBQUssU0FBUyxNQUFNLE9BQU8sR0FBRyxJQUFJO0FBQUEsSUFDcEM7QUFBQSxJQUVBLFlBQVk7QUFDVixtQkFBYSxLQUFLLFFBQVE7QUFBQSxJQUM1QjtBQUFBLEVBQ0Y7OztBQzdGQSxNQUFNLFFBQVE7QUFBQSxJQUNaO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0Y7OztBQ2hCQSxTQUFPLFlBQVk7QUFBQSxJQUNqQixPQUFPO0FBQUEsSUFDUCxRQUFRLENBQUM7QUFBQSxJQUNULFdBQVcsQ0FBQztBQUFBLEVBQ2Q7IiwKICAibmFtZXMiOiBbXQp9Cg==
