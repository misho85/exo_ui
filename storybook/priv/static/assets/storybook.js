(() => {
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
            let done = false;
            const onDone = () => {
              if (done) return;
              done = true;
              content.removeEventListener("transitionend", onDone);
              content.dataset.side = this._declaredSide;
              if (!hasAnchorPos) {
                content.style.top = "";
                content.style.left = "";
              }
            };
            content.addEventListener("transitionend", onDone, { once: true });
            setTimeout(onDone, 200);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vYXNzZXRzL2pzL2hvb2tzL3NpZGViYXIuanMiLCAiLi4vLi4vLi4vLi4vYXNzZXRzL2pzL2hvb2tzL3RoZW1lX3RvZ2dsZS5qcyIsICIuLi8uLi8uLi8uLi9hc3NldHMvanMvaG9va3MvcG9wb3Zlci5qcyIsICIuLi8uLi8uLi8uLi9hc3NldHMvanMvaG9va3MvZHJvcGRvd25fbWVudS5qcyIsICIuLi8uLi8uLi8uLi9hc3NldHMvanMvaG9va3Mvc2VsZWN0LmpzIiwgIi4uLy4uLy4uLy4uL2Fzc2V0cy9qcy9ob29rcy9jb21ib2JveC5qcyIsICIuLi8uLi8uLi8uLi9hc3NldHMvanMvaG9va3MvdG9vbHRpcC5qcyIsICIuLi8uLi8uLi8uLi9hc3NldHMvanMvaW5kZXguanMiLCAiLi4vLi4vLi4vYXNzZXRzL2pzL3N0b3J5Ym9vay5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLyoqXG4gKiBFeG9TaWRlYmFyIGhvb2sgXHUyMDE0IG1hbmFnZXMgY29sbGFwc2libGUgc2lkZWJhciBzdGF0ZS5cbiAqXG4gKiBSZXN0b3JlcyBjb2xsYXBzZWQvZXhwYW5kZWQgZnJvbSBsb2NhbFN0b3JhZ2Ugb24gZGVza3RvcC5cbiAqIE1vYmlsZSBzdGFydHMgY2xvc2VkLiBTZXRzIGRhdGEtc2lkZWJhci1yZWFkeSBvbiA8aHRtbD4gYWZ0ZXIgaW5pdC5cbiAqL1xuY29uc3QgRXhvU2lkZWJhciA9IHtcbiAgbW91bnRlZCgpIHtcbiAgICB0aGlzLnRvZ2dsZSA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwic2lkZWJhci10b2dnbGVcIl0nKVxuICAgIGlmICghdGhpcy50b2dnbGUpIHJldHVyblxuXG4gICAgdGhpcy5fYXBwbHlTdGF0ZSgpXG5cbiAgICAvLyBFbmFibGUgQ1NTIHRyYW5zaXRpb25zIGFmdGVyIGluaXRpYWwgc3RhdGUgKHByZXZlbnRzIEZPVUMpXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RhdGEtc2lkZWJhci1yZWFkeScsICcnKVxuICAgIH0pXG5cbiAgICAvLyBQZXJzaXN0IG9uIHRvZ2dsZVxuICAgIHRoaXMuX29uQ2hhbmdlID0gKCkgPT4ge1xuICAgICAgaWYgKHdpbmRvdy5tYXRjaE1lZGlhKCcobWluLXdpZHRoOiA3NjhweCknKS5tYXRjaGVzKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdleG8tc2lkZWJhci1jb2xsYXBzZWQnLCB0aGlzLnRvZ2dsZS5jaGVja2VkID8gJ2ZhbHNlJyA6ICd0cnVlJylcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy50b2dnbGUuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgdGhpcy5fb25DaGFuZ2UpXG4gIH0sXG5cbiAgZGVzdHJveWVkKCkge1xuICAgIGlmICh0aGlzLnRvZ2dsZSAmJiB0aGlzLl9vbkNoYW5nZSkge1xuICAgICAgdGhpcy50b2dnbGUucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgdGhpcy5fb25DaGFuZ2UpXG4gICAgfVxuICB9LFxuXG4gIHVwZGF0ZWQoKSB7XG4gICAgdGhpcy5fYXBwbHlTdGF0ZSgpXG4gIH0sXG5cbiAgX2FwcGx5U3RhdGUoKSB7XG4gICAgaWYgKCF0aGlzLnRvZ2dsZSkgcmV0dXJuXG4gICAgY29uc3QgaXNEZXNrdG9wID0gd2luZG93Lm1hdGNoTWVkaWEoJyhtaW4td2lkdGg6IDc2OHB4KScpLm1hdGNoZXNcbiAgICBpZiAoaXNEZXNrdG9wKSB7XG4gICAgICBjb25zdCBjb2xsYXBzZWQgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnZXhvLXNpZGViYXItY29sbGFwc2VkJykgPT09ICd0cnVlJ1xuICAgICAgdGhpcy50b2dnbGUuY2hlY2tlZCA9ICFjb2xsYXBzZWRcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy50b2dnbGUuY2hlY2tlZCA9IGZhbHNlXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCB7IEV4b1NpZGViYXIgfVxuIiwgImNvbnN0IEV4b1RoZW1lVG9nZ2xlID0ge1xuICBtb3VudGVkKCkge1xuICAgIHRoaXMuX2FwcGx5KHRoaXMuX2N1cnJlbnQoKSlcblxuICAgIHRoaXMuX2hhbmRsZXJzID0gW11cbiAgICB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLXRoZW1lLXZhbHVlXScpLmZvckVhY2goYnRuID0+IHtcbiAgICAgIGNvbnN0IGhhbmRsZXIgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gYnRuLmdldEF0dHJpYnV0ZSgnZGF0YS10aGVtZS12YWx1ZScpXG4gICAgICAgIHRoaXMuX2FwcGx5KHZhbHVlKVxuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnZXhvLXRoZW1lJywgdmFsdWUpXG4gICAgICB9XG4gICAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVyKVxuICAgICAgdGhpcy5faGFuZGxlcnMucHVzaCh7IGJ0biwgaGFuZGxlciB9KVxuICAgIH0pXG4gIH0sXG5cbiAgZGVzdHJveWVkKCkge1xuICAgIHRoaXMuX2hhbmRsZXJzPy5mb3JFYWNoKCh7IGJ0biwgaGFuZGxlciB9KSA9PlxuICAgICAgYnRuLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlcilcbiAgICApXG4gIH0sXG5cbiAgX2N1cnJlbnQoKSB7XG4gICAgcmV0dXJuIGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdleG8tdGhlbWUnKSB8fCAnc3lzdGVtJ1xuICB9LFxuXG4gIF9hcHBseSh0aGVtZSkge1xuICAgIGNvbnN0IHJvb3QgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnRcbiAgICAvLyBVcGRhdGUgYWN0aXZlIHN0YXRlIG9uIGJ1dHRvbnNcbiAgICB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLXRoZW1lLXZhbHVlXScpLmZvckVhY2goYnRuID0+IHtcbiAgICAgIGJ0bi50b2dnbGVBdHRyaWJ1dGUoJ2RhdGEtYWN0aXZlJywgYnRuLmdldEF0dHJpYnV0ZSgnZGF0YS10aGVtZS12YWx1ZScpID09PSB0aGVtZSlcbiAgICB9KVxuXG4gICAgaWYgKHRoZW1lID09PSAnc3lzdGVtJykge1xuICAgICAgcm9vdC5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtdGhlbWUnKVxuICAgIH0gZWxzZSB7XG4gICAgICByb290LnNldEF0dHJpYnV0ZSgnZGF0YS10aGVtZScsIHRoZW1lKVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgeyBFeG9UaGVtZVRvZ2dsZSB9XG4iLCAiY29uc3QgRXhvUG9wb3ZlciA9IHtcbiAgbW91bnRlZCgpIHsgdGhpcy5fYmluZCgpIH0sXG4gIHVwZGF0ZWQoKSB7IHRoaXMuX2JpbmQoKSB9LFxuICBkZXN0cm95ZWQoKSB7IHRoaXMuX3VuYmluZCgpIH0sXG4gIF9iaW5kKCkge1xuICAgIHRoaXMuX3VuYmluZCgpXG4gICAgY29uc3QgdHJpZ2dlciA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwicG9wb3Zlci10cmlnZ2VyXCJdJylcbiAgICBjb25zdCBpZCA9IHRyaWdnZXI/LmdldEF0dHJpYnV0ZSgncG9wb3ZlcnRhcmdldCcpXG4gICAgdGhpcy5fcG9wb3ZlciA9IGlkID8gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpIDogbnVsbFxuICAgIGlmICghdGhpcy5fcG9wb3ZlcikgcmV0dXJuXG4gICAgdGhpcy5fb25Ub2dnbGUgPSAoKSA9PiB7XG4gICAgICBjb25zdCBvcGVuID0gdGhpcy5fcG9wb3Zlci5tYXRjaGVzKCc6cG9wb3Zlci1vcGVuJylcbiAgICAgIHRyaWdnZXIuc2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJywgU3RyaW5nKG9wZW4pKVxuICAgIH1cbiAgICB0aGlzLl9wb3BvdmVyLmFkZEV2ZW50TGlzdGVuZXIoJ3RvZ2dsZScsIHRoaXMuX29uVG9nZ2xlKVxuICB9LFxuICBfdW5iaW5kKCkge1xuICAgIGlmICh0aGlzLl9wb3BvdmVyICYmIHRoaXMuX29uVG9nZ2xlKSB7XG4gICAgICB0aGlzLl9wb3BvdmVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvZ2dsZScsIHRoaXMuX29uVG9nZ2xlKVxuICAgIH1cbiAgICB0aGlzLl9wb3BvdmVyID0gbnVsbFxuICAgIHRoaXMuX29uVG9nZ2xlID0gbnVsbFxuICB9XG59XG5cbmV4cG9ydCB7IEV4b1BvcG92ZXIgfVxuIiwgImNvbnN0IEV4b0Ryb3Bkb3duTWVudSA9IHtcbiAgbW91bnRlZCgpIHsgdGhpcy5fYmluZCgpIH0sXG4gIHVwZGF0ZWQoKSB7IHRoaXMuX2JpbmQoKSB9LFxuICBkZXN0cm95ZWQoKSB7IHRoaXMuX3VuYmluZCgpIH0sXG4gIF9iaW5kKCkge1xuICAgIHRoaXMuX3VuYmluZCgpXG4gICAgdGhpcy5fbWVudSA9IHRoaXMuZWwubWF0Y2hlcygnW3JvbGU9XCJtZW51XCJdJykgPyB0aGlzLmVsIDogdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbcm9sZT1cIm1lbnVcIl0nKVxuICAgIGlmICghdGhpcy5fbWVudSkgcmV0dXJuXG4gICAgdGhpcy5fb25LZXlkb3duID0gKGUpID0+IHtcbiAgICAgIGNvbnN0IGl0ZW1zID0gWy4uLnRoaXMuX21lbnUucXVlcnlTZWxlY3RvckFsbCgnW3JvbGU9XCJtZW51aXRlbVwiXTpub3QoW2Rpc2FibGVkXSknKV1cbiAgICAgIGlmICghaXRlbXMubGVuZ3RoKSByZXR1cm5cbiAgICAgIGNvbnN0IGlkeCA9IGl0ZW1zLmluZGV4T2YoZG9jdW1lbnQuYWN0aXZlRWxlbWVudClcbiAgICAgIGxldCBuZXh0ID0gLTFcbiAgICAgIHN3aXRjaCAoZS5rZXkpIHtcbiAgICAgICAgY2FzZSAnQXJyb3dEb3duJzogbmV4dCA9IGlkeCA8IGl0ZW1zLmxlbmd0aCAtIDEgPyBpZHggKyAxIDogMDsgYnJlYWtcbiAgICAgICAgY2FzZSAnQXJyb3dVcCc6IG5leHQgPSBpZHggPiAwID8gaWR4IC0gMSA6IGl0ZW1zLmxlbmd0aCAtIDE7IGJyZWFrXG4gICAgICAgIGNhc2UgJ0hvbWUnOiBuZXh0ID0gMDsgYnJlYWtcbiAgICAgICAgY2FzZSAnRW5kJzogbmV4dCA9IGl0ZW1zLmxlbmd0aCAtIDE7IGJyZWFrXG4gICAgICAgIGRlZmF1bHQ6IHJldHVyblxuICAgICAgfVxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBpdGVtc1tuZXh0XT8uZm9jdXMoKVxuICAgIH1cbiAgICB0aGlzLl9tZW51LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLl9vbktleWRvd24pXG4gIH0sXG4gIF91bmJpbmQoKSB7XG4gICAgaWYgKHRoaXMuX21lbnUgJiYgdGhpcy5fb25LZXlkb3duKSB7XG4gICAgICB0aGlzLl9tZW51LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLl9vbktleWRvd24pXG4gICAgfVxuICAgIHRoaXMuX21lbnUgPSBudWxsXG4gICAgdGhpcy5fb25LZXlkb3duID0gbnVsbFxuICB9XG59XG5cbmV4cG9ydCB7IEV4b0Ryb3Bkb3duTWVudSB9XG4iLCAiY29uc3QgRXhvU2VsZWN0ID0ge1xuICBtb3VudGVkKCkgeyB0aGlzLl9iaW5kKCkgfSxcbiAgdXBkYXRlZCgpIHsgdGhpcy5fYmluZCgpIH0sXG4gIGRlc3Ryb3llZCgpIHsgdGhpcy5fdW5iaW5kKCkgfSxcblxuICBfYmluZCgpIHtcbiAgICB0aGlzLl91bmJpbmQoKVxuXG4gICAgdGhpcy5fdHJpZ2dlciA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvLXNlbGVjdD1cInRyaWdnZXJcIl0nKVxuICAgIGNvbnN0IHBvcG92ZXJJZCA9IHRoaXMuX3RyaWdnZXI/LmdldEF0dHJpYnV0ZSgncG9wb3ZlcnRhcmdldCcpXG4gICAgdGhpcy5fcG9wb3ZlciA9IHBvcG92ZXJJZCA/IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHBvcG92ZXJJZCkgOiBudWxsXG4gICAgdGhpcy5fbGlzdGJveCA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW3JvbGU9XCJsaXN0Ym94XCJdJylcbiAgICB0aGlzLl9oaWRkZW4gPSB0aGlzLmVsLmNsb3Nlc3QoJ1tkYXRhLWV4bz1cImZpZWxkXCJdJyk/LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W3R5cGU9XCJoaWRkZW5cIl0nKVxuXG4gICAgaWYgKCF0aGlzLl9wb3BvdmVyIHx8ICF0aGlzLl9saXN0Ym94KSByZXR1cm5cblxuICAgIC8vIFRvZ2dsZSBhcmlhLWV4cGFuZGVkIG9uIHBvcG92ZXIgb3Blbi9jbG9zZVxuICAgIHRoaXMuX29uVG9nZ2xlID0gKCkgPT4ge1xuICAgICAgY29uc3Qgb3BlbiA9IHRoaXMuX3BvcG92ZXIubWF0Y2hlcygnOnBvcG92ZXItb3BlbicpXG4gICAgICB0aGlzLl90cmlnZ2VyLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsIFN0cmluZyhvcGVuKSlcbiAgICAgIGlmIChvcGVuKSB7XG4gICAgICAgIC8vIEZvY3VzIHNlbGVjdGVkIG9yIGZpcnN0IG9wdGlvblxuICAgICAgICBjb25zdCBzZWxlY3RlZCA9IHRoaXMuX2xpc3Rib3gucXVlcnlTZWxlY3RvcignW2RhdGEtc2VsZWN0ZWRdJylcbiAgICAgICAgY29uc3QgZmlyc3QgPSB0aGlzLl9saXN0Ym94LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cInNlbGVjdC1vcHRpb25cIl06bm90KFtkYXRhLWRpc2FibGVkXSknKVxuICAgICAgICBjb25zdCB0YXJnZXQgPSBzZWxlY3RlZCB8fCBmaXJzdFxuICAgICAgICBpZiAodGFyZ2V0KSB0YXJnZXQuZm9jdXMoKVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLl9wb3BvdmVyLmFkZEV2ZW50TGlzdGVuZXIoJ3RvZ2dsZScsIHRoaXMuX29uVG9nZ2xlKVxuXG4gICAgLy8gQ2xpY2sgb24gb3B0aW9uXG4gICAgdGhpcy5fb25DbGljayA9IChlKSA9PiB7XG4gICAgICBjb25zdCBvcHQgPSBlLnRhcmdldC5jbG9zZXN0KCdbZGF0YS1leG89XCJzZWxlY3Qtb3B0aW9uXCJdJylcbiAgICAgIGlmICghb3B0IHx8IG9wdC5oYXNBdHRyaWJ1dGUoJ2RhdGEtZGlzYWJsZWQnKSkgcmV0dXJuXG4gICAgICB0aGlzLl9zZWxlY3RPcHRpb24ob3B0KVxuICAgIH1cbiAgICB0aGlzLl9saXN0Ym94LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fb25DbGljaylcblxuICAgIC8vIEtleWJvYXJkIG5hdmlnYXRpb25cbiAgICB0aGlzLl9vbktleWRvd24gPSAoZSkgPT4ge1xuICAgICAgY29uc3Qgb3B0aW9ucyA9IFsuLi50aGlzLl9saXN0Ym94LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWV4bz1cInNlbGVjdC1vcHRpb25cIl06bm90KFtkYXRhLWRpc2FibGVkXSknKV1cbiAgICAgIGlmICghb3B0aW9ucy5sZW5ndGgpIHJldHVyblxuICAgICAgY29uc3QgaWR4ID0gb3B0aW9ucy5pbmRleE9mKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpXG4gICAgICBsZXQgbmV4dCA9IC0xXG5cbiAgICAgIHN3aXRjaCAoZS5rZXkpIHtcbiAgICAgICAgY2FzZSAnQXJyb3dEb3duJzpcbiAgICAgICAgICBuZXh0ID0gaWR4IDwgb3B0aW9ucy5sZW5ndGggLSAxID8gaWR4ICsgMSA6IDBcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlICdBcnJvd1VwJzpcbiAgICAgICAgICBuZXh0ID0gaWR4ID4gMCA/IGlkeCAtIDEgOiBvcHRpb25zLmxlbmd0aCAtIDFcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlICdIb21lJzpcbiAgICAgICAgICBuZXh0ID0gMFxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgJ0VuZCc6XG4gICAgICAgICAgbmV4dCA9IG9wdGlvbnMubGVuZ3RoIC0gMVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgJ0VudGVyJzpcbiAgICAgICAgY2FzZSAnICc6XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgaWYgKGlkeCA+PSAwKSB0aGlzLl9zZWxlY3RPcHRpb24ob3B0aW9uc1tpZHhdKVxuICAgICAgICAgIHJldHVyblxuICAgICAgICBjYXNlICdFc2NhcGUnOlxuICAgICAgICAgIHRoaXMuX3BvcG92ZXIuaGlkZVBvcG92ZXIoKVxuICAgICAgICAgIHRoaXMuX3RyaWdnZXIuZm9jdXMoKVxuICAgICAgICAgIHJldHVyblxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIC8vIFR5cGUtYWhlYWQ6IGp1bXAgdG8gb3B0aW9uIHN0YXJ0aW5nIHdpdGggdHlwZWQgY2hhcmFjdGVyXG4gICAgICAgICAgdGhpcy5fdHlwZUFoZWFkKGUua2V5LCBvcHRpb25zKVxuICAgICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIGlmIChuZXh0ID49IDApIG9wdGlvbnNbbmV4dF0uZm9jdXMoKVxuICAgIH1cbiAgICB0aGlzLl9saXN0Ym94LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLl9vbktleWRvd24pXG4gIH0sXG5cbiAgX3NlbGVjdE9wdGlvbihvcHQpIHtcbiAgICBjb25zdCB2YWx1ZSA9IG9wdC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdmFsdWUnKVxuICAgIGNvbnN0IHRleHQgPSBvcHQudGV4dENvbnRlbnQudHJpbSgpXG5cbiAgICAvLyBVcGRhdGUgaGlkZGVuIGlucHV0XG4gICAgaWYgKHRoaXMuX2hpZGRlbikge1xuICAgICAgdGhpcy5faGlkZGVuLnZhbHVlID0gdmFsdWVcbiAgICAgIHRoaXMuX2hpZGRlbi5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnaW5wdXQnLCB7IGJ1YmJsZXM6IHRydWUgfSkpXG4gICAgfVxuXG4gICAgLy8gVXBkYXRlIGFyaWEtc2VsZWN0ZWQgYW5kIGRhdGEtc2VsZWN0ZWQgb24gYWxsIG9wdGlvbnNcbiAgICB0aGlzLl9saXN0Ym94LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWV4bz1cInNlbGVjdC1vcHRpb25cIl0nKS5mb3JFYWNoKChvKSA9PiB7XG4gICAgICBjb25zdCBpc1NlbGVjdGVkID0gby5nZXRBdHRyaWJ1dGUoJ2RhdGEtdmFsdWUnKSA9PT0gdmFsdWVcbiAgICAgIG8uc2V0QXR0cmlidXRlKCdhcmlhLXNlbGVjdGVkJywgU3RyaW5nKGlzU2VsZWN0ZWQpKVxuICAgICAgaWYgKGlzU2VsZWN0ZWQpIHtcbiAgICAgICAgby5zZXRBdHRyaWJ1dGUoJ2RhdGEtc2VsZWN0ZWQnLCAnJylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG8ucmVtb3ZlQXR0cmlidXRlKCdkYXRhLXNlbGVjdGVkJylcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgLy8gVXBkYXRlIHRyaWdnZXIgZGlzcGxheSB0ZXh0XG4gICAgY29uc3QgdmFsdWVFbCA9IHRoaXMuX3RyaWdnZXIucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwic2VsZWN0LXZhbHVlXCJdJylcbiAgICBpZiAodmFsdWVFbCkgdmFsdWVFbC50ZXh0Q29udGVudCA9IHRleHRcblxuICAgIC8vIENsb3NlIHBvcG92ZXJcbiAgICB0aGlzLl9wb3BvdmVyLmhpZGVQb3BvdmVyKClcbiAgICB0aGlzLl90cmlnZ2VyLmZvY3VzKClcbiAgfSxcblxuICBfdHlwZUFoZWFkKGNoYXIsIG9wdGlvbnMpIHtcbiAgICBpZiAoY2hhci5sZW5ndGggIT09IDEpIHJldHVyblxuICAgIGNvbnN0IGxvd2VyID0gY2hhci50b0xvd2VyQ2FzZSgpXG4gICAgY29uc3QgY3VycmVudElkeCA9IG9wdGlvbnMuaW5kZXhPZihkb2N1bWVudC5hY3RpdmVFbGVtZW50KVxuICAgIGNvbnN0IHN0YXJ0ID0gY3VycmVudElkeCArIDFcbiAgICBjb25zdCByb3RhdGVkID0gWy4uLm9wdGlvbnMuc2xpY2Uoc3RhcnQpLCAuLi5vcHRpb25zLnNsaWNlKDAsIHN0YXJ0KV1cbiAgICBjb25zdCBtYXRjaCA9IHJvdGF0ZWQuZmluZChvID0+IG8udGV4dENvbnRlbnQudHJpbSgpLnRvTG93ZXJDYXNlKCkuc3RhcnRzV2l0aChsb3dlcikpXG4gICAgaWYgKG1hdGNoKSBtYXRjaC5mb2N1cygpXG4gIH0sXG5cbiAgX3VuYmluZCgpIHtcbiAgICBpZiAodGhpcy5fcG9wb3ZlciAmJiB0aGlzLl9vblRvZ2dsZSkge1xuICAgICAgdGhpcy5fcG9wb3Zlci5yZW1vdmVFdmVudExpc3RlbmVyKCd0b2dnbGUnLCB0aGlzLl9vblRvZ2dsZSlcbiAgICB9XG4gICAgaWYgKHRoaXMuX2xpc3Rib3ggJiYgdGhpcy5fb25DbGljaykge1xuICAgICAgdGhpcy5fbGlzdGJveC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX29uQ2xpY2spXG4gICAgfVxuICAgIGlmICh0aGlzLl9saXN0Ym94ICYmIHRoaXMuX29uS2V5ZG93bikge1xuICAgICAgdGhpcy5fbGlzdGJveC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5fb25LZXlkb3duKVxuICAgIH1cbiAgICB0aGlzLl90cmlnZ2VyID0gbnVsbFxuICAgIHRoaXMuX3BvcG92ZXIgPSBudWxsXG4gICAgdGhpcy5fbGlzdGJveCA9IG51bGxcbiAgICB0aGlzLl9oaWRkZW4gPSBudWxsXG4gICAgdGhpcy5fb25Ub2dnbGUgPSBudWxsXG4gICAgdGhpcy5fb25DbGljayA9IG51bGxcbiAgICB0aGlzLl9vbktleWRvd24gPSBudWxsXG4gIH1cbn1cblxuZXhwb3J0IHsgRXhvU2VsZWN0IH1cbiIsICJjb25zdCBFeG9Db21ib2JveCA9IHtcbiAgbW91bnRlZCgpIHsgdGhpcy5fYmluZCgpIH0sXG4gIHVwZGF0ZWQoKSB7IHRoaXMuX2JpbmQoKSB9LFxuICBkZXN0cm95ZWQoKSB7IHRoaXMuX3VuYmluZCgpIH0sXG4gIF9iaW5kKCkge1xuICAgIHRoaXMuX3VuYmluZCgpXG4gICAgY29uc3QgaXNJbnB1dFRyaWdnZXIgPSB0aGlzLmVsLmRhdGFzZXQudHJpZ2dlciA9PT0gJ2lucHV0J1xuICAgIGNvbnN0IGZpbHRlciA9IHRoaXMuZWwuZGF0YXNldC5maWx0ZXIgfHwgJ3NlcnZlcidcbiAgICBjb25zdCBvbkZpbHRlciA9IHRoaXMuZWwuZGF0YXNldC5vbkZpbHRlclxuICAgIGNvbnN0IGRlYm91bmNlID0gcGFyc2VJbnQodGhpcy5lbC5kYXRhc2V0LmRlYm91bmNlIHx8ICczMDAnLCAxMClcblxuICAgIHRoaXMuX3NlYXJjaCA9IGlzSW5wdXRUcmlnZ2VyXG4gICAgICA/IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvLWNvbWJvYm94PVwiaW5wdXQtdHJpZ2dlclwiXScpXG4gICAgICA6IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwiY29tYm9ib3gtc2VhcmNoXCJdJylcblxuICAgIGNvbnN0IHRyaWdnZXJCdG4gPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4by1jb21ib2JveD1cInRyaWdnZXJcIl0nKVxuICAgIGNvbnN0IHBvcG92ZXJJZCA9IHRyaWdnZXJCdG4/LmdldEF0dHJpYnV0ZSgncG9wb3ZlcnRhcmdldCcpIHx8IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwicG9wb3Zlci1jb250ZW50XCJdJyk/LmlkXG4gICAgdGhpcy5fcG9wb3ZlciA9IHBvcG92ZXJJZCA/IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHBvcG92ZXJJZCkgOiBudWxsXG4gICAgdGhpcy5faGlkZGVuID0gdGhpcy5lbC5jbG9zZXN0KCdbZGF0YS1leG89XCJmaWVsZFwiXScpPy5xdWVyeVNlbGVjdG9yKCdpbnB1dFt0eXBlPVwiaGlkZGVuXCJdJylcbiAgICB0aGlzLl9saXN0Ym94ID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbcm9sZT1cImxpc3Rib3hcIl0nKVxuICAgIHRoaXMuX2VtcHR5ID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJjb21ib2JveC1lbXB0eVwiXScpXG4gICAgdGhpcy5fY3JlYXRlID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJjb21ib2JveC1jcmVhdGVcIl0nKVxuXG4gICAgdGhpcy5fY2xlYXIgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cImNvbWJvYm94LWNsZWFyXCJdJylcblxuICAgIGlmICghdGhpcy5fcG9wb3ZlcikgcmV0dXJuXG5cbiAgICAvLyBDbGVhciBidXR0b25cbiAgICBpZiAodGhpcy5fY2xlYXIpIHtcbiAgICAgIHRoaXMuX29uQ2xlYXIgPSAoZSkgPT4ge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgIGlmICh0aGlzLl9oaWRkZW4pIHtcbiAgICAgICAgICB0aGlzLl9oaWRkZW4udmFsdWUgPSAnJ1xuICAgICAgICAgIHRoaXMuX2hpZGRlbi5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnaW5wdXQnLCB7IGJ1YmJsZXM6IHRydWUgfSkpXG4gICAgICAgIH1cbiAgICAgICAgLy8gUmVzZXQgdHJpZ2dlciBkaXNwbGF5XG4gICAgICAgIGNvbnN0IHZhbFNwYW4gPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cImNvbWJvYm94LXZhbHVlXCJdJylcbiAgICAgICAgaWYgKHZhbFNwYW4pIHZhbFNwYW4udGV4dENvbnRlbnQgPSB0aGlzLl9zZWFyY2g/LnBsYWNlaG9sZGVyIHx8ICcnXG4gICAgICAgIC8vIENsZWFyIHZpc3VhbCBzZWxlY3Rpb25cbiAgICAgICAgaWYgKHRoaXMuX2xpc3Rib3gpIHtcbiAgICAgICAgICB0aGlzLl9saXN0Ym94LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWV4bz1cImNvbWJvYm94LW9wdGlvblwiXScpLmZvckVhY2gobyA9PiB7XG4gICAgICAgICAgICBvLnNldEF0dHJpYnV0ZSgnYXJpYS1zZWxlY3RlZCcsICdmYWxzZScpXG4gICAgICAgICAgICBkZWxldGUgby5kYXRhc2V0LnNlbGVjdGVkXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5fY2xlYXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9vbkNsZWFyKVxuICAgIH1cblxuICAgIC8vIFRvZ2dsZSBldmVudCBmb3IgYXJpYS1leHBhbmRlZFxuICAgIHRoaXMuX29uVG9nZ2xlID0gKCkgPT4ge1xuICAgICAgY29uc3Qgb3BlbiA9IHRoaXMuX3BvcG92ZXIubWF0Y2hlcygnOnBvcG92ZXItb3BlbicpXG4gICAgICBpZiAodHJpZ2dlckJ0bikgdHJpZ2dlckJ0bi5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCBTdHJpbmcob3BlbikpXG4gICAgICBpZiAodGhpcy5fc2VhcmNoKSB0aGlzLl9zZWFyY2guc2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJywgU3RyaW5nKG9wZW4pKVxuICAgICAgaWYgKG9wZW4gJiYgdGhpcy5fc2VhcmNoICYmICFpc0lucHV0VHJpZ2dlcikge1xuICAgICAgICB0aGlzLl9zZWFyY2gudmFsdWUgPSAnJ1xuICAgICAgICB0aGlzLl9zZWFyY2guZm9jdXMoKVxuICAgICAgICBpZiAoZmlsdGVyID09PSAnY2xpZW50JykgdGhpcy5fY2xpZW50RmlsdGVyKCcnKVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLl9wb3BvdmVyLmFkZEV2ZW50TGlzdGVuZXIoJ3RvZ2dsZScsIHRoaXMuX29uVG9nZ2xlKVxuXG4gICAgLy8gSW5wdXQgdHJpZ2dlcjogb3Blbi9jbG9zZSB2aWEgSlNcbiAgICBpZiAoaXNJbnB1dFRyaWdnZXIgJiYgdGhpcy5fc2VhcmNoKSB7XG4gICAgICB0aGlzLl9vbkZvY3VzID0gKCkgPT4ge1xuICAgICAgICB0cnkgeyB0aGlzLl9wb3BvdmVyLnNob3dQb3BvdmVyKCkgfSBjYXRjaChfZXJyKSB7fVxuICAgICAgfVxuICAgICAgdGhpcy5fb25CbHVyID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBwb3BvdmVyID0gdGhpcy5fcG9wb3ZlclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBpZiAoIXBvcG92ZXIpIHJldHVyblxuICAgICAgICAgIGlmICghcG9wb3Zlci5jb250YWlucyhkb2N1bWVudC5hY3RpdmVFbGVtZW50KSAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9PSB0aGlzLl9zZWFyY2gpIHtcbiAgICAgICAgICAgIHRyeSB7IHBvcG92ZXIuaGlkZVBvcG92ZXIoKSB9IGNhdGNoKF9lcnIpIHt9XG4gICAgICAgICAgfVxuICAgICAgICB9LCAyMDApXG4gICAgICB9XG4gICAgICB0aGlzLl9zZWFyY2guYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCB0aGlzLl9vbkZvY3VzKVxuICAgICAgdGhpcy5fc2VhcmNoLmFkZEV2ZW50TGlzdGVuZXIoJ2JsdXInLCB0aGlzLl9vbkJsdXIpXG4gICAgfVxuXG4gICAgLy8gU2VhcmNoIGlucHV0IGhhbmRsZXJcbiAgICBpZiAodGhpcy5fc2VhcmNoKSB7XG4gICAgICB0aGlzLl9vbklucHV0ID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBxdWVyeSA9IHRoaXMuX3NlYXJjaC52YWx1ZVxuICAgICAgICBpZiAoZmlsdGVyID09PSAnY2xpZW50Jykge1xuICAgICAgICAgIHRoaXMuX2NsaWVudEZpbHRlcihxdWVyeSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5fZGVib3VuY2VUaW1lcilcbiAgICAgICAgICB0aGlzLl9kZWJvdW5jZVRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBpZiAob25GaWx0ZXIpIHRoaXMucHVzaEV2ZW50KG9uRmlsdGVyLCB7IHF1ZXJ5IH0pXG4gICAgICAgICAgfSwgZGVib3VuY2UpXG4gICAgICAgIH1cbiAgICAgICAgLy8gVXBkYXRlIGNyZWF0ZSBvcHRpb24gdGV4dFxuICAgICAgICBpZiAodGhpcy5fY3JlYXRlKSB7XG4gICAgICAgICAgY29uc3Qgc3BhbiA9IHRoaXMuX2NyZWF0ZS5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJjb21ib2JveC1jcmVhdGUtcXVlcnlcIl0nKVxuICAgICAgICAgIGlmIChzcGFuKSBzcGFuLnRleHRDb250ZW50ID0gcXVlcnlcbiAgICAgICAgICB0aGlzLl9jcmVhdGUuaGlkZGVuID0gIXF1ZXJ5XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuX3NlYXJjaC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIHRoaXMuX29uSW5wdXQpXG4gICAgfVxuXG4gICAgLy8gT3B0aW9uIGNsaWNrXG4gICAgaWYgKHRoaXMuX2xpc3Rib3gpIHtcbiAgICAgIHRoaXMuX29uQ2xpY2sgPSAoZSkgPT4ge1xuICAgICAgICBjb25zdCBvcHQgPSBlLnRhcmdldC5jbG9zZXN0KCdbZGF0YS1leG89XCJjb21ib2JveC1vcHRpb25cIl06bm90KFtkYXRhLWRpc2FibGVkXSknKVxuICAgICAgICBpZiAoIW9wdCkgcmV0dXJuXG4gICAgICAgIHRoaXMuX3NlbGVjdE9wdGlvbihvcHQpXG4gICAgICB9XG4gICAgICB0aGlzLl9saXN0Ym94LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fb25DbGljaylcblxuICAgICAgLy8gS2V5Ym9hcmRcbiAgICAgIHRoaXMuX29uS2V5ZG93biA9IChlKSA9PiB7XG4gICAgICAgIGNvbnN0IG9wdHMgPSBbLi4udGhpcy5fbGlzdGJveC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1leG89XCJjb21ib2JveC1vcHRpb25cIl06bm90KFtkYXRhLWRpc2FibGVkXSk6bm90KFtoaWRkZW5dKScpXVxuICAgICAgICBpZiAoIW9wdHMubGVuZ3RoKSByZXR1cm5cbiAgICAgICAgY29uc3QgaWR4ID0gb3B0cy5pbmRleE9mKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpXG4gICAgICAgIGxldCBuZXh0ID0gLTFcbiAgICAgICAgc3dpdGNoIChlLmtleSkge1xuICAgICAgICAgIGNhc2UgJ0Fycm93RG93bic6IG5leHQgPSBpZHggPCBvcHRzLmxlbmd0aCAtIDEgPyBpZHggKyAxIDogMDsgYnJlYWtcbiAgICAgICAgICBjYXNlICdBcnJvd1VwJzogbmV4dCA9IGlkeCA+IDAgPyBpZHggLSAxIDogb3B0cy5sZW5ndGggLSAxOyBicmVha1xuICAgICAgICAgIGNhc2UgJ0hvbWUnOiBuZXh0ID0gMDsgYnJlYWtcbiAgICAgICAgICBjYXNlICdFbmQnOiBuZXh0ID0gb3B0cy5sZW5ndGggLSAxOyBicmVha1xuICAgICAgICAgIGNhc2UgJ0VudGVyJzpcbiAgICAgICAgICAgIGlmIChpZHggPj0gMCkgeyB0aGlzLl9zZWxlY3RPcHRpb24ob3B0c1tpZHhdKTsgZS5wcmV2ZW50RGVmYXVsdCgpIH1cbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgIGNhc2UgJ0VzY2FwZSc6XG4gICAgICAgICAgICB0cnkgeyB0aGlzLl9wb3BvdmVyLmhpZGVQb3BvdmVyKCkgfSBjYXRjaChfZXJyKSB7fVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgZGVmYXVsdDogcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIG9wdHNbbmV4dF0/LmZvY3VzKClcbiAgICAgIH1cbiAgICAgIHRoaXMuX3BvcG92ZXIuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX29uS2V5ZG93bilcbiAgICB9XG4gIH0sXG4gIF9jbGllbnRGaWx0ZXIocXVlcnkpIHtcbiAgICBpZiAoIXRoaXMuX2xpc3Rib3gpIHJldHVyblxuICAgIGNvbnN0IHEgPSBxdWVyeS50b0xvd2VyQ2FzZSgpXG4gICAgbGV0IGhhc1Zpc2libGUgPSBmYWxzZVxuICAgIHRoaXMuX2xpc3Rib3gucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZXhvPVwiY29tYm9ib3gtb3B0aW9uXCJdJykuZm9yRWFjaChvcHQgPT4ge1xuICAgICAgY29uc3QgbWF0Y2ggPSAhcSB8fCBvcHQudGV4dENvbnRlbnQudHJpbSgpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMocSlcbiAgICAgIG9wdC5oaWRkZW4gPSAhbWF0Y2hcbiAgICAgIGlmIChtYXRjaCkgaGFzVmlzaWJsZSA9IHRydWVcbiAgICB9KVxuICAgIGlmICh0aGlzLl9lbXB0eSkgdGhpcy5fZW1wdHkuaGlkZGVuID0gaGFzVmlzaWJsZVxuICB9LFxuICBfc2VsZWN0T3B0aW9uKG9wdCkge1xuICAgIGNvbnN0IHZhbHVlID0gb3B0LmRhdGFzZXQudmFsdWVcbiAgICBpZiAodGhpcy5faGlkZGVuKSB7XG4gICAgICB0aGlzLl9oaWRkZW4udmFsdWUgPSB2YWx1ZVxuICAgICAgdGhpcy5faGlkZGVuLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdpbnB1dCcsIHsgYnViYmxlczogdHJ1ZSB9KSlcbiAgICB9XG4gICAgLy8gVXBkYXRlIHZpc3VhbCBzdGF0ZVxuICAgIGlmICh0aGlzLl9saXN0Ym94KSB7XG4gICAgICB0aGlzLl9saXN0Ym94LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWV4bz1cImNvbWJvYm94LW9wdGlvblwiXScpLmZvckVhY2gobyA9PiB7XG4gICAgICAgIG8uc2V0QXR0cmlidXRlKCdhcmlhLXNlbGVjdGVkJywgU3RyaW5nKG8uZGF0YXNldC52YWx1ZSA9PT0gdmFsdWUpKVxuICAgICAgICBpZiAoby5kYXRhc2V0LnZhbHVlID09PSB2YWx1ZSkgby5kYXRhc2V0LnNlbGVjdGVkID0gJydcbiAgICAgICAgZWxzZSBkZWxldGUgby5kYXRhc2V0LnNlbGVjdGVkXG4gICAgICB9KVxuICAgIH1cbiAgICAvLyBVcGRhdGUgdHJpZ2dlciBkaXNwbGF5XG4gICAgY29uc3QgdmFsU3BhbiA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwiY29tYm9ib3gtdmFsdWVcIl0nKVxuICAgIGlmICh2YWxTcGFuKSB2YWxTcGFuLnRleHRDb250ZW50ID0gb3B0LnRleHRDb250ZW50LnRyaW0oKVxuICAgIC8vIENsb3NlICh1bmxlc3MgbXVsdGlwbGUpXG4gICAgaWYgKCF0aGlzLmVsLmRhdGFzZXQubXVsdGlwbGUpIHtcbiAgICAgIHRyeSB7IHRoaXMuX3BvcG92ZXI/LmhpZGVQb3BvdmVyKCkgfSBjYXRjaChfZXJyKSB7fVxuICAgIH1cbiAgfSxcbiAgX3VuYmluZCgpIHtcbiAgICBjbGVhclRpbWVvdXQodGhpcy5fZGVib3VuY2VUaW1lcilcbiAgICB0aGlzLl9kZWJvdW5jZVRpbWVyID0gbnVsbFxuICAgIGlmICh0aGlzLl9wb3BvdmVyKSB7XG4gICAgICBpZiAodGhpcy5fb25Ub2dnbGUpIHRoaXMuX3BvcG92ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG9nZ2xlJywgdGhpcy5fb25Ub2dnbGUpXG4gICAgICBpZiAodGhpcy5fb25LZXlkb3duKSB0aGlzLl9wb3BvdmVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLl9vbktleWRvd24pXG4gICAgfVxuICAgIGlmICh0aGlzLl9saXN0Ym94ICYmIHRoaXMuX29uQ2xpY2spIHRoaXMuX2xpc3Rib3gucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9vbkNsaWNrKVxuICAgIGlmICh0aGlzLl9zZWFyY2gpIHtcbiAgICAgIGlmICh0aGlzLl9vbklucHV0KSB0aGlzLl9zZWFyY2gucmVtb3ZlRXZlbnRMaXN0ZW5lcignaW5wdXQnLCB0aGlzLl9vbklucHV0KVxuICAgICAgaWYgKHRoaXMuX29uRm9jdXMpIHRoaXMuX3NlYXJjaC5yZW1vdmVFdmVudExpc3RlbmVyKCdmb2N1cycsIHRoaXMuX29uRm9jdXMpXG4gICAgICBpZiAodGhpcy5fb25CbHVyKSB0aGlzLl9zZWFyY2gucmVtb3ZlRXZlbnRMaXN0ZW5lcignYmx1cicsIHRoaXMuX29uQmx1cilcbiAgICB9XG4gICAgaWYgKHRoaXMuX2NsZWFyICYmIHRoaXMuX29uQ2xlYXIpIHRoaXMuX2NsZWFyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fb25DbGVhcilcbiAgICB0aGlzLl9wb3BvdmVyID0gbnVsbFxuICAgIHRoaXMuX2xpc3Rib3ggPSBudWxsXG4gICAgdGhpcy5fc2VhcmNoID0gbnVsbFxuICAgIHRoaXMuX2NsZWFyID0gbnVsbFxuICAgIHRoaXMuX2VtcHR5ID0gbnVsbFxuICAgIHRoaXMuX2NyZWF0ZSA9IG51bGxcbiAgICB0aGlzLl9oaWRkZW4gPSBudWxsXG4gIH1cbn1cblxuZXhwb3J0IHsgRXhvQ29tYm9ib3ggfVxuIiwgImxldCBsYXN0SGlkZVRpbWUgPSAwXG5jb25zdCBTS0lQX0RFTEFZX01TID0gMzAwXG5jb25zdCBoYXNBbmNob3JQb3MgPVxuICB0eXBlb2YgQ1NTICE9PSAndW5kZWZpbmVkJyAmJiBDU1Muc3VwcG9ydHMoJ3Bvc2l0aW9uLWFyZWEnLCAndG9wJylcblxuY29uc3QgR0FQID0gNCAvLyBtYXRjaGVzIHZhcigtLWV4by1zcGFjZS0xKVxuXG5jb25zdCBFeG9Ub29sdGlwID0ge1xuICBtb3VudGVkKCkge1xuICAgIGNvbnN0IHdyYXBwZXIgPSB0aGlzLmVsXG4gICAgY29uc3QgYW5jaG9yID0gd3JhcHBlci5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJ0b29sdGlwLWFuY2hvclwiXScpXG4gICAgY29uc3QgY29udGVudCA9IHdyYXBwZXIucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwidG9vbHRpcC1jb250ZW50XCJdJylcbiAgICBpZiAoIWFuY2hvciB8fCAhY29udGVudCkgcmV0dXJuXG5cbiAgICB0aGlzLl9hbmNob3IgPSBhbmNob3JcbiAgICB0aGlzLl9jb250ZW50ID0gY29udGVudFxuICAgIHRoaXMuX3RpbWVvdXQgPSBudWxsXG4gICAgdGhpcy5fZGVjbGFyZWRTaWRlID0gY29udGVudC5kYXRhc2V0LnNpZGVcbiAgICB0aGlzLl9kZWxheSA9IHBhcnNlSW50KGNvbnRlbnQuZGF0YXNldC5kZWxheSkgfHwgNTAwXG5cbiAgICBjb25zdCBzaG93ID0gKCkgPT4ge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3RpbWVvdXQpXG4gICAgICBjb25zdCBlbGFwc2VkID0gRGF0ZS5ub3coKSAtIGxhc3RIaWRlVGltZVxuICAgICAgY29uc3Qgd2FpdCA9IGVsYXBzZWQgPCBTS0lQX0RFTEFZX01TID8gMCA6IHRoaXMuX2RlbGF5XG4gICAgICB0aGlzLl90aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRyeSB7IGNvbnRlbnQuc2hvd1BvcG92ZXIoKSB9IGNhdGNoIChfKSB7IHJldHVybiB9XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICAgICAgaWYgKCFoYXNBbmNob3JQb3MpIHRoaXMuX3Bvc2l0aW9uRmFsbGJhY2soKVxuICAgICAgICAgIHRoaXMuX2RldGVjdEZsaXAoKVxuICAgICAgICB9KVxuICAgICAgfSwgd2FpdClcbiAgICB9XG5cbiAgICBjb25zdCBoaWRlID0gKCkgPT4ge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3RpbWVvdXQpXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoY29udGVudC5tYXRjaGVzKCc6cG9wb3Zlci1vcGVuJykpIHtcbiAgICAgICAgICBjb250ZW50LmhpZGVQb3BvdmVyKClcbiAgICAgICAgICBsYXN0SGlkZVRpbWUgPSBEYXRlLm5vdygpXG4gICAgICAgICAgLy8gRGVmZXIgc2lkZS9wb3NpdGlvbiByZXNldCB1bnRpbCBleGl0IGFuaW1hdGlvbiBjb21wbGV0ZXNcbiAgICAgICAgICAvLyBzbyB0aGUgdG9vbHRpcCBkb2Vzbid0IGp1bXAgZHVyaW5nIGZhZGUtb3V0XG4gICAgICAgICAgbGV0IGRvbmUgPSBmYWxzZVxuICAgICAgICAgIGNvbnN0IG9uRG9uZSA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmIChkb25lKSByZXR1cm5cbiAgICAgICAgICAgIGRvbmUgPSB0cnVlXG4gICAgICAgICAgICBjb250ZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RyYW5zaXRpb25lbmQnLCBvbkRvbmUpXG4gICAgICAgICAgICBjb250ZW50LmRhdGFzZXQuc2lkZSA9IHRoaXMuX2RlY2xhcmVkU2lkZVxuICAgICAgICAgICAgaWYgKCFoYXNBbmNob3JQb3MpIHtcbiAgICAgICAgICAgICAgY29udGVudC5zdHlsZS50b3AgPSAnJ1xuICAgICAgICAgICAgICBjb250ZW50LnN0eWxlLmxlZnQgPSAnJ1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBjb250ZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RyYW5zaXRpb25lbmQnLCBvbkRvbmUsIHsgb25jZTogdHJ1ZSB9KVxuICAgICAgICAgIC8vIEZhbGxiYWNrIGluIGNhc2UgdHJhbnNpdGlvbmVuZCBkb2Vzbid0IGZpcmUgKGUuZy4gaW5zdGFudCBoaWRlKVxuICAgICAgICAgIHNldFRpbWVvdXQob25Eb25lLCAyMDApXG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKF8pIHt9XG4gICAgfVxuXG4gICAgd3JhcHBlci5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgdGhpcy5fc2hvdyA9ICgpID0+IHNob3coKSlcbiAgICB3cmFwcGVyLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCB0aGlzLl9oaWRlID0gKCkgPT4gaGlkZSgpKVxuICAgIGFuY2hvci5hZGRFdmVudExpc3RlbmVyKCdmb2N1c2luJywgdGhpcy5fZm9jdXNJbiA9ICgpID0+IHNob3coKSlcbiAgICBhbmNob3IuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXNvdXQnLCB0aGlzLl9mb2N1c091dCA9IChlKSA9PiB7XG4gICAgICBpZiAoIXdyYXBwZXIuY29udGFpbnMoZS5yZWxhdGVkVGFyZ2V0KSkgaGlkZSgpXG4gICAgfSlcbiAgICB3cmFwcGVyLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLl9rZXlkb3duID0gKGUpID0+IHtcbiAgICAgIGlmIChlLmtleSA9PT0gJ0VzY2FwZScpIGhpZGUoKVxuICAgIH0pXG4gIH0sXG5cbiAgLyoqIERldGVjdCBpZiBhbmNob3IgcG9zaXRpb25pbmcgZmxpcHBlZCB0aGUgc2lkZSBhbmQgdXBkYXRlIGRhdGEtc2lkZSBmb3IgYXJyb3cgQ1NTLiAqL1xuICBfZGV0ZWN0RmxpcCgpIHtcbiAgICBjb25zdCBhciA9IHRoaXMuX2FuY2hvci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgIGNvbnN0IGNyID0gdGhpcy5fY29udGVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgIGxldCBhY3R1YWxcbiAgICBpZiAoY3IuYm90dG9tIDw9IGFyLnRvcCArIDEpIGFjdHVhbCA9ICd0b3AnXG4gICAgZWxzZSBpZiAoY3IudG9wID49IGFyLmJvdHRvbSAtIDEpIGFjdHVhbCA9ICdib3R0b20nXG4gICAgZWxzZSBpZiAoY3IucmlnaHQgPD0gYXIubGVmdCArIDEpIGFjdHVhbCA9ICdsZWZ0J1xuICAgIGVsc2UgaWYgKGNyLmxlZnQgPj0gYXIucmlnaHQgLSAxKSBhY3R1YWwgPSAncmlnaHQnXG4gICAgZWxzZSBhY3R1YWwgPSB0aGlzLl9kZWNsYXJlZFNpZGVcbiAgICB0aGlzLl9jb250ZW50LmRhdGFzZXQuc2lkZSA9IGFjdHVhbFxuICB9LFxuXG4gIC8qKiBKUyBwb3NpdGlvbmluZyBmb3IgYnJvd3NlcnMgd2l0aG91dCBDU1MgYW5jaG9yIHBvc2l0aW9uaW5nIChTYWZhcmkpLiAqL1xuICBfcG9zaXRpb25GYWxsYmFjaygpIHtcbiAgICBjb25zdCBhciA9IHRoaXMuX2FuY2hvci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgIGNvbnN0IGN3ID0gdGhpcy5fY29udGVudC5vZmZzZXRXaWR0aFxuICAgIGNvbnN0IGNoID0gdGhpcy5fY29udGVudC5vZmZzZXRIZWlnaHRcbiAgICBjb25zdCBzaWRlID0gdGhpcy5fZGVjbGFyZWRTaWRlXG4gICAgY29uc3QgYWxpZ24gPSB0aGlzLl9jb250ZW50LmRhdGFzZXQuYWxpZ24gfHwgJ2NlbnRlcidcbiAgICBsZXQgdG9wLCBsZWZ0XG5cbiAgICBpZiAoc2lkZSA9PT0gJ3RvcCcgfHwgc2lkZSA9PT0gJ2JvdHRvbScpIHtcbiAgICAgIHRvcCA9IHNpZGUgPT09ICd0b3AnID8gYXIudG9wIC0gY2ggLSBHQVAgOiBhci5ib3R0b20gKyBHQVBcbiAgICAgIGlmIChhbGlnbiA9PT0gJ3N0YXJ0JykgbGVmdCA9IGFyLmxlZnRcbiAgICAgIGVsc2UgaWYgKGFsaWduID09PSAnZW5kJykgbGVmdCA9IGFyLnJpZ2h0IC0gY3dcbiAgICAgIGVsc2UgbGVmdCA9IGFyLmxlZnQgKyAoYXIud2lkdGggLSBjdykgLyAyXG4gICAgfSBlbHNlIHtcbiAgICAgIGxlZnQgPSBzaWRlID09PSAnbGVmdCcgPyBhci5sZWZ0IC0gY3cgLSBHQVAgOiBhci5yaWdodCArIEdBUFxuICAgICAgdG9wID0gYXIudG9wICsgKGFyLmhlaWdodCAtIGNoKSAvIDJcbiAgICB9XG5cbiAgICB0aGlzLl9jb250ZW50LnN0eWxlLnRvcCA9IGAke3RvcH1weGBcbiAgICB0aGlzLl9jb250ZW50LnN0eWxlLmxlZnQgPSBgJHtsZWZ0fXB4YFxuICB9LFxuXG4gIGRlc3Ryb3llZCgpIHtcbiAgICBjbGVhclRpbWVvdXQodGhpcy5fdGltZW91dClcbiAgfVxufVxuXG5leHBvcnQgeyBFeG9Ub29sdGlwIH1cbiIsICJpbXBvcnQgeyBFeG9TaWRlYmFyIH0gZnJvbSAnLi9ob29rcy9zaWRlYmFyLmpzJ1xuaW1wb3J0IHsgRXhvVGhlbWVUb2dnbGUgfSBmcm9tICcuL2hvb2tzL3RoZW1lX3RvZ2dsZS5qcydcbmltcG9ydCB7IEV4b1BvcG92ZXIgfSBmcm9tICcuL2hvb2tzL3BvcG92ZXIuanMnXG5pbXBvcnQgeyBFeG9Ecm9wZG93bk1lbnUgfSBmcm9tICcuL2hvb2tzL2Ryb3Bkb3duX21lbnUuanMnXG5pbXBvcnQgeyBFeG9TZWxlY3QgfSBmcm9tICcuL2hvb2tzL3NlbGVjdC5qcydcbmltcG9ydCB7IEV4b0NvbWJvYm94IH0gZnJvbSAnLi9ob29rcy9jb21ib2JveC5qcydcbmltcG9ydCB7IEV4b1Rvb2x0aXAgfSBmcm9tICcuL2hvb2tzL3Rvb2x0aXAuanMnXG5cbmNvbnN0IGhvb2tzID0ge1xuICBFeG9TaWRlYmFyLFxuICBFeG9UaGVtZVRvZ2dsZSxcbiAgRXhvUG9wb3ZlcixcbiAgRXhvRHJvcGRvd25NZW51LFxuICBFeG9TZWxlY3QsXG4gIEV4b0NvbWJvYm94LFxuICBFeG9Ub29sdGlwXG59XG5cbmV4cG9ydCB7IGhvb2tzIH1cbiIsICJpbXBvcnQgeyBob29rcyBhcyBleG9Ib29rcyB9IGZyb20gXCIuLi8uLi8uLi9hc3NldHMvanMvaW5kZXguanNcIlxuXG53aW5kb3cuc3Rvcnlib29rID0ge1xuICBIb29rczogZXhvSG9va3MsXG4gIFBhcmFtczoge30sXG4gIFVwbG9hZGVyczoge31cbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7O0FBTUEsTUFBTSxhQUFhO0FBQUEsSUFDakIsVUFBVTtBQUNSLFdBQUssU0FBUyxLQUFLLEdBQUcsY0FBYyw2QkFBNkI7QUFDakUsVUFBSSxDQUFDLEtBQUssT0FBUTtBQUVsQixXQUFLLFlBQVk7QUFHakIsNEJBQXNCLE1BQU07QUFDMUIsaUJBQVMsZ0JBQWdCLGFBQWEsc0JBQXNCLEVBQUU7QUFBQSxNQUNoRSxDQUFDO0FBR0QsV0FBSyxZQUFZLE1BQU07QUFDckIsWUFBSSxPQUFPLFdBQVcsb0JBQW9CLEVBQUUsU0FBUztBQUNuRCx1QkFBYSxRQUFRLHlCQUF5QixLQUFLLE9BQU8sVUFBVSxVQUFVLE1BQU07QUFBQSxRQUN0RjtBQUFBLE1BQ0Y7QUFDQSxXQUFLLE9BQU8saUJBQWlCLFVBQVUsS0FBSyxTQUFTO0FBQUEsSUFDdkQ7QUFBQSxJQUVBLFlBQVk7QUFDVixVQUFJLEtBQUssVUFBVSxLQUFLLFdBQVc7QUFDakMsYUFBSyxPQUFPLG9CQUFvQixVQUFVLEtBQUssU0FBUztBQUFBLE1BQzFEO0FBQUEsSUFDRjtBQUFBLElBRUEsVUFBVTtBQUNSLFdBQUssWUFBWTtBQUFBLElBQ25CO0FBQUEsSUFFQSxjQUFjO0FBQ1osVUFBSSxDQUFDLEtBQUssT0FBUTtBQUNsQixZQUFNLFlBQVksT0FBTyxXQUFXLG9CQUFvQixFQUFFO0FBQzFELFVBQUksV0FBVztBQUNiLGNBQU0sWUFBWSxhQUFhLFFBQVEsdUJBQXVCLE1BQU07QUFDcEUsYUFBSyxPQUFPLFVBQVUsQ0FBQztBQUFBLE1BQ3pCLE9BQU87QUFDTCxhQUFLLE9BQU8sVUFBVTtBQUFBLE1BQ3hCO0FBQUEsSUFDRjtBQUFB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
