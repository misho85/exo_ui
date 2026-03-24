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
      this.el.querySelectorAll("[data-theme-value]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const value = btn.getAttribute("data-theme-value");
          this._apply(value);
          localStorage.setItem("exo-theme", value);
        });
      });
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
      const match = options.find(
        (o) => o.textContent.trim().toLowerCase().startsWith(lower)
      );
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
          setTimeout(() => {
            if (!this._popover.contains(document.activeElement) && document.activeElement !== this._search) {
              try {
                this._popover.hidePopover();
              } catch (_err) {
              }
            }
          }, 200);
        };
        this._search.addEventListener("focus", this._onFocus);
        this._search.addEventListener("blur", this._onBlur);
      }
      if (this._search) {
        let timer = null;
        this._onInput = () => {
          const query = this._search.value;
          if (filter === "client") {
            this._clientFilter(query);
          } else {
            clearTimeout(timer);
            timer = setTimeout(() => {
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
      this._listbox.querySelectorAll('[data-exo="combobox-option"]').forEach((o) => {
        o.setAttribute("aria-selected", String(o.dataset.value === value));
        if (o.dataset.value === value) o.dataset.selected = "";
        else delete o.dataset.selected;
      });
      const valSpan = this.el.querySelector('[data-exo="combobox-value"]');
      if (valSpan) valSpan.textContent = opt.textContent.trim();
      if (!this.el.dataset.multiple) {
        try {
          this._popover.hidePopover();
        } catch (_err) {
        }
      }
    },
    _unbind() {
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
    }
  };

  // ../../assets/js/hooks/tooltip.js
  var ExoTooltip = {
    mounted() {
      this._onKeydown = (e) => {
        if (e.key === "Escape") {
          this.el.dataset.dismissed = "";
          this.el.addEventListener("mouseleave", () => {
            delete this.el.dataset.dismissed;
          }, { once: true });
        }
      };
      this.el.addEventListener("keydown", this._onKeydown);
    },
    destroyed() {
      if (this._onKeydown) this.el.removeEventListener("keydown", this._onKeydown);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vYXNzZXRzL2pzL2hvb2tzL3NpZGViYXIuanMiLCAiLi4vLi4vLi4vLi4vYXNzZXRzL2pzL2hvb2tzL3RoZW1lX3RvZ2dsZS5qcyIsICIuLi8uLi8uLi8uLi9hc3NldHMvanMvaG9va3MvcG9wb3Zlci5qcyIsICIuLi8uLi8uLi8uLi9hc3NldHMvanMvaG9va3MvZHJvcGRvd25fbWVudS5qcyIsICIuLi8uLi8uLi8uLi9hc3NldHMvanMvaG9va3Mvc2VsZWN0LmpzIiwgIi4uLy4uLy4uLy4uL2Fzc2V0cy9qcy9ob29rcy9jb21ib2JveC5qcyIsICIuLi8uLi8uLi8uLi9hc3NldHMvanMvaG9va3MvdG9vbHRpcC5qcyIsICIuLi8uLi8uLi8uLi9hc3NldHMvanMvaW5kZXguanMiLCAiLi4vLi4vLi4vYXNzZXRzL2pzL3N0b3J5Ym9vay5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLyoqXG4gKiBFeG9TaWRlYmFyIGhvb2sgXHUyMDE0IG1hbmFnZXMgY29sbGFwc2libGUgc2lkZWJhciBzdGF0ZS5cbiAqXG4gKiBSZXN0b3JlcyBjb2xsYXBzZWQvZXhwYW5kZWQgZnJvbSBsb2NhbFN0b3JhZ2Ugb24gZGVza3RvcC5cbiAqIE1vYmlsZSBzdGFydHMgY2xvc2VkLiBTZXRzIGRhdGEtc2lkZWJhci1yZWFkeSBvbiA8aHRtbD4gYWZ0ZXIgaW5pdC5cbiAqL1xuY29uc3QgRXhvU2lkZWJhciA9IHtcbiAgbW91bnRlZCgpIHtcbiAgICB0aGlzLnRvZ2dsZSA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwic2lkZWJhci10b2dnbGVcIl0nKVxuICAgIGlmICghdGhpcy50b2dnbGUpIHJldHVyblxuXG4gICAgdGhpcy5fYXBwbHlTdGF0ZSgpXG5cbiAgICAvLyBFbmFibGUgQ1NTIHRyYW5zaXRpb25zIGFmdGVyIGluaXRpYWwgc3RhdGUgKHByZXZlbnRzIEZPVUMpXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RhdGEtc2lkZWJhci1yZWFkeScsICcnKVxuICAgIH0pXG5cbiAgICAvLyBQZXJzaXN0IG9uIHRvZ2dsZVxuICAgIHRoaXMuX29uQ2hhbmdlID0gKCkgPT4ge1xuICAgICAgaWYgKHdpbmRvdy5tYXRjaE1lZGlhKCcobWluLXdpZHRoOiA3NjhweCknKS5tYXRjaGVzKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdleG8tc2lkZWJhci1jb2xsYXBzZWQnLCB0aGlzLnRvZ2dsZS5jaGVja2VkID8gJ2ZhbHNlJyA6ICd0cnVlJylcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy50b2dnbGUuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgdGhpcy5fb25DaGFuZ2UpXG4gIH0sXG5cbiAgZGVzdHJveWVkKCkge1xuICAgIGlmICh0aGlzLnRvZ2dsZSAmJiB0aGlzLl9vbkNoYW5nZSkge1xuICAgICAgdGhpcy50b2dnbGUucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgdGhpcy5fb25DaGFuZ2UpXG4gICAgfVxuICB9LFxuXG4gIHVwZGF0ZWQoKSB7XG4gICAgdGhpcy5fYXBwbHlTdGF0ZSgpXG4gIH0sXG5cbiAgX2FwcGx5U3RhdGUoKSB7XG4gICAgaWYgKCF0aGlzLnRvZ2dsZSkgcmV0dXJuXG4gICAgY29uc3QgaXNEZXNrdG9wID0gd2luZG93Lm1hdGNoTWVkaWEoJyhtaW4td2lkdGg6IDc2OHB4KScpLm1hdGNoZXNcbiAgICBpZiAoaXNEZXNrdG9wKSB7XG4gICAgICBjb25zdCBjb2xsYXBzZWQgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnZXhvLXNpZGViYXItY29sbGFwc2VkJykgPT09ICd0cnVlJ1xuICAgICAgdGhpcy50b2dnbGUuY2hlY2tlZCA9ICFjb2xsYXBzZWRcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy50b2dnbGUuY2hlY2tlZCA9IGZhbHNlXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCB7IEV4b1NpZGViYXIgfVxuIiwgImNvbnN0IEV4b1RoZW1lVG9nZ2xlID0ge1xuICBtb3VudGVkKCkge1xuICAgIHRoaXMuX2FwcGx5KHRoaXMuX2N1cnJlbnQoKSlcblxuICAgIHRoaXMuZWwucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtdGhlbWUtdmFsdWVdJykuZm9yRWFjaChidG4gPT4ge1xuICAgICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGJ0bi5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGhlbWUtdmFsdWUnKVxuICAgICAgICB0aGlzLl9hcHBseSh2YWx1ZSlcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2V4by10aGVtZScsIHZhbHVlKVxuICAgICAgfSlcbiAgICB9KVxuICB9LFxuXG4gIF9jdXJyZW50KCkge1xuICAgIHJldHVybiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnZXhvLXRoZW1lJykgfHwgJ3N5c3RlbSdcbiAgfSxcblxuICBfYXBwbHkodGhlbWUpIHtcbiAgICBjb25zdCByb290ID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50XG4gICAgLy8gVXBkYXRlIGFjdGl2ZSBzdGF0ZSBvbiBidXR0b25zXG4gICAgdGhpcy5lbC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS10aGVtZS12YWx1ZV0nKS5mb3JFYWNoKGJ0biA9PiB7XG4gICAgICBidG4udG9nZ2xlQXR0cmlidXRlKCdkYXRhLWFjdGl2ZScsIGJ0bi5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGhlbWUtdmFsdWUnKSA9PT0gdGhlbWUpXG4gICAgfSlcblxuICAgIGlmICh0aGVtZSA9PT0gJ3N5c3RlbScpIHtcbiAgICAgIHJvb3QucmVtb3ZlQXR0cmlidXRlKCdkYXRhLXRoZW1lJylcbiAgICB9IGVsc2Uge1xuICAgICAgcm9vdC5zZXRBdHRyaWJ1dGUoJ2RhdGEtdGhlbWUnLCB0aGVtZSlcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IHsgRXhvVGhlbWVUb2dnbGUgfVxuIiwgImNvbnN0IEV4b1BvcG92ZXIgPSB7XG4gIG1vdW50ZWQoKSB7IHRoaXMuX2JpbmQoKSB9LFxuICB1cGRhdGVkKCkgeyB0aGlzLl9iaW5kKCkgfSxcbiAgZGVzdHJveWVkKCkgeyB0aGlzLl91bmJpbmQoKSB9LFxuICBfYmluZCgpIHtcbiAgICB0aGlzLl91bmJpbmQoKVxuICAgIGNvbnN0IHRyaWdnZXIgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cInBvcG92ZXItdHJpZ2dlclwiXScpXG4gICAgY29uc3QgaWQgPSB0cmlnZ2VyPy5nZXRBdHRyaWJ1dGUoJ3BvcG92ZXJ0YXJnZXQnKVxuICAgIHRoaXMuX3BvcG92ZXIgPSBpZCA/IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKSA6IG51bGxcbiAgICBpZiAoIXRoaXMuX3BvcG92ZXIpIHJldHVyblxuICAgIHRoaXMuX29uVG9nZ2xlID0gKCkgPT4ge1xuICAgICAgY29uc3Qgb3BlbiA9IHRoaXMuX3BvcG92ZXIubWF0Y2hlcygnOnBvcG92ZXItb3BlbicpXG4gICAgICB0cmlnZ2VyLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsIFN0cmluZyhvcGVuKSlcbiAgICB9XG4gICAgdGhpcy5fcG9wb3Zlci5hZGRFdmVudExpc3RlbmVyKCd0b2dnbGUnLCB0aGlzLl9vblRvZ2dsZSlcbiAgfSxcbiAgX3VuYmluZCgpIHtcbiAgICBpZiAodGhpcy5fcG9wb3ZlciAmJiB0aGlzLl9vblRvZ2dsZSkge1xuICAgICAgdGhpcy5fcG9wb3Zlci5yZW1vdmVFdmVudExpc3RlbmVyKCd0b2dnbGUnLCB0aGlzLl9vblRvZ2dsZSlcbiAgICB9XG4gICAgdGhpcy5fcG9wb3ZlciA9IG51bGxcbiAgICB0aGlzLl9vblRvZ2dsZSA9IG51bGxcbiAgfVxufVxuXG5leHBvcnQgeyBFeG9Qb3BvdmVyIH1cbiIsICJjb25zdCBFeG9Ecm9wZG93bk1lbnUgPSB7XG4gIG1vdW50ZWQoKSB7IHRoaXMuX2JpbmQoKSB9LFxuICB1cGRhdGVkKCkgeyB0aGlzLl9iaW5kKCkgfSxcbiAgZGVzdHJveWVkKCkgeyB0aGlzLl91bmJpbmQoKSB9LFxuICBfYmluZCgpIHtcbiAgICB0aGlzLl91bmJpbmQoKVxuICAgIHRoaXMuX21lbnUgPSB0aGlzLmVsLm1hdGNoZXMoJ1tyb2xlPVwibWVudVwiXScpID8gdGhpcy5lbCA6IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW3JvbGU9XCJtZW51XCJdJylcbiAgICBpZiAoIXRoaXMuX21lbnUpIHJldHVyblxuICAgIHRoaXMuX29uS2V5ZG93biA9IChlKSA9PiB7XG4gICAgICBjb25zdCBpdGVtcyA9IFsuLi50aGlzLl9tZW51LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tyb2xlPVwibWVudWl0ZW1cIl06bm90KFtkaXNhYmxlZF0pJyldXG4gICAgICBpZiAoIWl0ZW1zLmxlbmd0aCkgcmV0dXJuXG4gICAgICBjb25zdCBpZHggPSBpdGVtcy5pbmRleE9mKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpXG4gICAgICBsZXQgbmV4dCA9IC0xXG4gICAgICBzd2l0Y2ggKGUua2V5KSB7XG4gICAgICAgIGNhc2UgJ0Fycm93RG93bic6IG5leHQgPSBpZHggPCBpdGVtcy5sZW5ndGggLSAxID8gaWR4ICsgMSA6IDA7IGJyZWFrXG4gICAgICAgIGNhc2UgJ0Fycm93VXAnOiBuZXh0ID0gaWR4ID4gMCA/IGlkeCAtIDEgOiBpdGVtcy5sZW5ndGggLSAxOyBicmVha1xuICAgICAgICBjYXNlICdIb21lJzogbmV4dCA9IDA7IGJyZWFrXG4gICAgICAgIGNhc2UgJ0VuZCc6IG5leHQgPSBpdGVtcy5sZW5ndGggLSAxOyBicmVha1xuICAgICAgICBkZWZhdWx0OiByZXR1cm5cbiAgICAgIH1cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgaXRlbXNbbmV4dF0/LmZvY3VzKClcbiAgICB9XG4gICAgdGhpcy5fbWVudS5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5fb25LZXlkb3duKVxuICB9LFxuICBfdW5iaW5kKCkge1xuICAgIGlmICh0aGlzLl9tZW51ICYmIHRoaXMuX29uS2V5ZG93bikge1xuICAgICAgdGhpcy5fbWVudS5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5fb25LZXlkb3duKVxuICAgIH1cbiAgICB0aGlzLl9tZW51ID0gbnVsbFxuICAgIHRoaXMuX29uS2V5ZG93biA9IG51bGxcbiAgfVxufVxuXG5leHBvcnQgeyBFeG9Ecm9wZG93bk1lbnUgfVxuIiwgImNvbnN0IEV4b1NlbGVjdCA9IHtcbiAgbW91bnRlZCgpIHsgdGhpcy5fYmluZCgpIH0sXG4gIHVwZGF0ZWQoKSB7IHRoaXMuX2JpbmQoKSB9LFxuICBkZXN0cm95ZWQoKSB7IHRoaXMuX3VuYmluZCgpIH0sXG5cbiAgX2JpbmQoKSB7XG4gICAgdGhpcy5fdW5iaW5kKClcblxuICAgIHRoaXMuX3RyaWdnZXIgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4by1zZWxlY3Q9XCJ0cmlnZ2VyXCJdJylcbiAgICBjb25zdCBwb3BvdmVySWQgPSB0aGlzLl90cmlnZ2VyPy5nZXRBdHRyaWJ1dGUoJ3BvcG92ZXJ0YXJnZXQnKVxuICAgIHRoaXMuX3BvcG92ZXIgPSBwb3BvdmVySWQgPyBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChwb3BvdmVySWQpIDogbnVsbFxuICAgIHRoaXMuX2xpc3Rib3ggPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tyb2xlPVwibGlzdGJveFwiXScpXG4gICAgdGhpcy5faGlkZGVuID0gdGhpcy5lbC5jbG9zZXN0KCdbZGF0YS1leG89XCJmaWVsZFwiXScpPy5xdWVyeVNlbGVjdG9yKCdpbnB1dFt0eXBlPVwiaGlkZGVuXCJdJylcblxuICAgIGlmICghdGhpcy5fcG9wb3ZlciB8fCAhdGhpcy5fbGlzdGJveCkgcmV0dXJuXG5cbiAgICAvLyBUb2dnbGUgYXJpYS1leHBhbmRlZCBvbiBwb3BvdmVyIG9wZW4vY2xvc2VcbiAgICB0aGlzLl9vblRvZ2dsZSA9ICgpID0+IHtcbiAgICAgIGNvbnN0IG9wZW4gPSB0aGlzLl9wb3BvdmVyLm1hdGNoZXMoJzpwb3BvdmVyLW9wZW4nKVxuICAgICAgdGhpcy5fdHJpZ2dlci5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCBTdHJpbmcob3BlbikpXG4gICAgICBpZiAob3Blbikge1xuICAgICAgICAvLyBGb2N1cyBzZWxlY3RlZCBvciBmaXJzdCBvcHRpb25cbiAgICAgICAgY29uc3Qgc2VsZWN0ZWQgPSB0aGlzLl9saXN0Ym94LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLXNlbGVjdGVkXScpXG4gICAgICAgIGNvbnN0IGZpcnN0ID0gdGhpcy5fbGlzdGJveC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJzZWxlY3Qtb3B0aW9uXCJdOm5vdChbZGF0YS1kaXNhYmxlZF0pJylcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gc2VsZWN0ZWQgfHwgZmlyc3RcbiAgICAgICAgaWYgKHRhcmdldCkgdGFyZ2V0LmZvY3VzKClcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5fcG9wb3Zlci5hZGRFdmVudExpc3RlbmVyKCd0b2dnbGUnLCB0aGlzLl9vblRvZ2dsZSlcblxuICAgIC8vIENsaWNrIG9uIG9wdGlvblxuICAgIHRoaXMuX29uQ2xpY2sgPSAoZSkgPT4ge1xuICAgICAgY29uc3Qgb3B0ID0gZS50YXJnZXQuY2xvc2VzdCgnW2RhdGEtZXhvPVwic2VsZWN0LW9wdGlvblwiXScpXG4gICAgICBpZiAoIW9wdCB8fCBvcHQuaGFzQXR0cmlidXRlKCdkYXRhLWRpc2FibGVkJykpIHJldHVyblxuICAgICAgdGhpcy5fc2VsZWN0T3B0aW9uKG9wdClcbiAgICB9XG4gICAgdGhpcy5fbGlzdGJveC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX29uQ2xpY2spXG5cbiAgICAvLyBLZXlib2FyZCBuYXZpZ2F0aW9uXG4gICAgdGhpcy5fb25LZXlkb3duID0gKGUpID0+IHtcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSBbLi4udGhpcy5fbGlzdGJveC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1leG89XCJzZWxlY3Qtb3B0aW9uXCJdOm5vdChbZGF0YS1kaXNhYmxlZF0pJyldXG4gICAgICBpZiAoIW9wdGlvbnMubGVuZ3RoKSByZXR1cm5cbiAgICAgIGNvbnN0IGlkeCA9IG9wdGlvbnMuaW5kZXhPZihkb2N1bWVudC5hY3RpdmVFbGVtZW50KVxuICAgICAgbGV0IG5leHQgPSAtMVxuXG4gICAgICBzd2l0Y2ggKGUua2V5KSB7XG4gICAgICAgIGNhc2UgJ0Fycm93RG93bic6XG4gICAgICAgICAgbmV4dCA9IGlkeCA8IG9wdGlvbnMubGVuZ3RoIC0gMSA/IGlkeCArIDEgOiAwXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAnQXJyb3dVcCc6XG4gICAgICAgICAgbmV4dCA9IGlkeCA+IDAgPyBpZHggLSAxIDogb3B0aW9ucy5sZW5ndGggLSAxXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAnSG9tZSc6XG4gICAgICAgICAgbmV4dCA9IDBcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlICdFbmQnOlxuICAgICAgICAgIG5leHQgPSBvcHRpb25zLmxlbmd0aCAtIDFcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlICdFbnRlcic6XG4gICAgICAgIGNhc2UgJyAnOlxuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgIGlmIChpZHggPj0gMCkgdGhpcy5fc2VsZWN0T3B0aW9uKG9wdGlvbnNbaWR4XSlcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgY2FzZSAnRXNjYXBlJzpcbiAgICAgICAgICB0aGlzLl9wb3BvdmVyLmhpZGVQb3BvdmVyKClcbiAgICAgICAgICB0aGlzLl90cmlnZ2VyLmZvY3VzKClcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAvLyBUeXBlLWFoZWFkOiBqdW1wIHRvIG9wdGlvbiBzdGFydGluZyB3aXRoIHR5cGVkIGNoYXJhY3RlclxuICAgICAgICAgIHRoaXMuX3R5cGVBaGVhZChlLmtleSwgb3B0aW9ucylcbiAgICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBpZiAobmV4dCA+PSAwKSBvcHRpb25zW25leHRdLmZvY3VzKClcbiAgICB9XG4gICAgdGhpcy5fbGlzdGJveC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5fb25LZXlkb3duKVxuICB9LFxuXG4gIF9zZWxlY3RPcHRpb24ob3B0KSB7XG4gICAgY29uc3QgdmFsdWUgPSBvcHQuZ2V0QXR0cmlidXRlKCdkYXRhLXZhbHVlJylcbiAgICBjb25zdCB0ZXh0ID0gb3B0LnRleHRDb250ZW50LnRyaW0oKVxuXG4gICAgLy8gVXBkYXRlIGhpZGRlbiBpbnB1dFxuICAgIGlmICh0aGlzLl9oaWRkZW4pIHtcbiAgICAgIHRoaXMuX2hpZGRlbi52YWx1ZSA9IHZhbHVlXG4gICAgICB0aGlzLl9oaWRkZW4uZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2lucHV0JywgeyBidWJibGVzOiB0cnVlIH0pKVxuICAgIH1cblxuICAgIC8vIFVwZGF0ZSBhcmlhLXNlbGVjdGVkIGFuZCBkYXRhLXNlbGVjdGVkIG9uIGFsbCBvcHRpb25zXG4gICAgdGhpcy5fbGlzdGJveC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1leG89XCJzZWxlY3Qtb3B0aW9uXCJdJykuZm9yRWFjaCgobykgPT4ge1xuICAgICAgY29uc3QgaXNTZWxlY3RlZCA9IG8uZ2V0QXR0cmlidXRlKCdkYXRhLXZhbHVlJykgPT09IHZhbHVlXG4gICAgICBvLnNldEF0dHJpYnV0ZSgnYXJpYS1zZWxlY3RlZCcsIFN0cmluZyhpc1NlbGVjdGVkKSlcbiAgICAgIGlmIChpc1NlbGVjdGVkKSB7XG4gICAgICAgIG8uc2V0QXR0cmlidXRlKCdkYXRhLXNlbGVjdGVkJywgJycpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvLnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS1zZWxlY3RlZCcpXG4gICAgICB9XG4gICAgfSlcblxuICAgIC8vIFVwZGF0ZSB0cmlnZ2VyIGRpc3BsYXkgdGV4dFxuICAgIGNvbnN0IHZhbHVlRWwgPSB0aGlzLl90cmlnZ2VyLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cInNlbGVjdC12YWx1ZVwiXScpXG4gICAgaWYgKHZhbHVlRWwpIHZhbHVlRWwudGV4dENvbnRlbnQgPSB0ZXh0XG5cbiAgICAvLyBDbG9zZSBwb3BvdmVyXG4gICAgdGhpcy5fcG9wb3Zlci5oaWRlUG9wb3ZlcigpXG4gICAgdGhpcy5fdHJpZ2dlci5mb2N1cygpXG4gIH0sXG5cbiAgX3R5cGVBaGVhZChjaGFyLCBvcHRpb25zKSB7XG4gICAgaWYgKGNoYXIubGVuZ3RoICE9PSAxKSByZXR1cm5cbiAgICBjb25zdCBsb3dlciA9IGNoYXIudG9Mb3dlckNhc2UoKVxuICAgIGNvbnN0IG1hdGNoID0gb3B0aW9ucy5maW5kKChvKSA9PlxuICAgICAgby50ZXh0Q29udGVudC50cmltKCkudG9Mb3dlckNhc2UoKS5zdGFydHNXaXRoKGxvd2VyKVxuICAgIClcbiAgICBpZiAobWF0Y2gpIG1hdGNoLmZvY3VzKClcbiAgfSxcblxuICBfdW5iaW5kKCkge1xuICAgIGlmICh0aGlzLl9wb3BvdmVyICYmIHRoaXMuX29uVG9nZ2xlKSB7XG4gICAgICB0aGlzLl9wb3BvdmVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvZ2dsZScsIHRoaXMuX29uVG9nZ2xlKVxuICAgIH1cbiAgICBpZiAodGhpcy5fbGlzdGJveCAmJiB0aGlzLl9vbkNsaWNrKSB7XG4gICAgICB0aGlzLl9saXN0Ym94LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fb25DbGljaylcbiAgICB9XG4gICAgaWYgKHRoaXMuX2xpc3Rib3ggJiYgdGhpcy5fb25LZXlkb3duKSB7XG4gICAgICB0aGlzLl9saXN0Ym94LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLl9vbktleWRvd24pXG4gICAgfVxuICAgIHRoaXMuX3RyaWdnZXIgPSBudWxsXG4gICAgdGhpcy5fcG9wb3ZlciA9IG51bGxcbiAgICB0aGlzLl9saXN0Ym94ID0gbnVsbFxuICAgIHRoaXMuX2hpZGRlbiA9IG51bGxcbiAgICB0aGlzLl9vblRvZ2dsZSA9IG51bGxcbiAgICB0aGlzLl9vbkNsaWNrID0gbnVsbFxuICAgIHRoaXMuX29uS2V5ZG93biA9IG51bGxcbiAgfVxufVxuXG5leHBvcnQgeyBFeG9TZWxlY3QgfVxuIiwgImNvbnN0IEV4b0NvbWJvYm94ID0ge1xuICBtb3VudGVkKCkgeyB0aGlzLl9iaW5kKCkgfSxcbiAgdXBkYXRlZCgpIHsgdGhpcy5fYmluZCgpIH0sXG4gIGRlc3Ryb3llZCgpIHsgdGhpcy5fdW5iaW5kKCkgfSxcbiAgX2JpbmQoKSB7XG4gICAgdGhpcy5fdW5iaW5kKClcbiAgICBjb25zdCBpc0lucHV0VHJpZ2dlciA9IHRoaXMuZWwuZGF0YXNldC50cmlnZ2VyID09PSAnaW5wdXQnXG4gICAgY29uc3QgZmlsdGVyID0gdGhpcy5lbC5kYXRhc2V0LmZpbHRlciB8fCAnc2VydmVyJ1xuICAgIGNvbnN0IG9uRmlsdGVyID0gdGhpcy5lbC5kYXRhc2V0Lm9uRmlsdGVyXG4gICAgY29uc3QgZGVib3VuY2UgPSBwYXJzZUludCh0aGlzLmVsLmRhdGFzZXQuZGVib3VuY2UgfHwgJzMwMCcsIDEwKVxuXG4gICAgdGhpcy5fc2VhcmNoID0gaXNJbnB1dFRyaWdnZXJcbiAgICAgID8gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG8tY29tYm9ib3g9XCJpbnB1dC10cmlnZ2VyXCJdJylcbiAgICAgIDogdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJjb21ib2JveC1zZWFyY2hcIl0nKVxuXG4gICAgY29uc3QgdHJpZ2dlckJ0biA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvLWNvbWJvYm94PVwidHJpZ2dlclwiXScpXG4gICAgY29uc3QgcG9wb3ZlcklkID0gdHJpZ2dlckJ0bj8uZ2V0QXR0cmlidXRlKCdwb3BvdmVydGFyZ2V0JykgfHwgdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJwb3BvdmVyLWNvbnRlbnRcIl0nKT8uaWRcbiAgICB0aGlzLl9wb3BvdmVyID0gcG9wb3ZlcklkID8gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocG9wb3ZlcklkKSA6IG51bGxcbiAgICB0aGlzLl9oaWRkZW4gPSB0aGlzLmVsLmNsb3Nlc3QoJ1tkYXRhLWV4bz1cImZpZWxkXCJdJyk/LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W3R5cGU9XCJoaWRkZW5cIl0nKVxuICAgIHRoaXMuX2xpc3Rib3ggPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tyb2xlPVwibGlzdGJveFwiXScpXG4gICAgdGhpcy5fZW1wdHkgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cImNvbWJvYm94LWVtcHR5XCJdJylcbiAgICB0aGlzLl9jcmVhdGUgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cImNvbWJvYm94LWNyZWF0ZVwiXScpXG5cbiAgICB0aGlzLl9jbGVhciA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwiY29tYm9ib3gtY2xlYXJcIl0nKVxuXG4gICAgaWYgKCF0aGlzLl9wb3BvdmVyKSByZXR1cm5cblxuICAgIC8vIENsZWFyIGJ1dHRvblxuICAgIGlmICh0aGlzLl9jbGVhcikge1xuICAgICAgdGhpcy5fb25DbGVhciA9IChlKSA9PiB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgaWYgKHRoaXMuX2hpZGRlbikge1xuICAgICAgICAgIHRoaXMuX2hpZGRlbi52YWx1ZSA9ICcnXG4gICAgICAgICAgdGhpcy5faGlkZGVuLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdpbnB1dCcsIHsgYnViYmxlczogdHJ1ZSB9KSlcbiAgICAgICAgfVxuICAgICAgICAvLyBSZXNldCB0cmlnZ2VyIGRpc3BsYXlcbiAgICAgICAgY29uc3QgdmFsU3BhbiA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwiY29tYm9ib3gtdmFsdWVcIl0nKVxuICAgICAgICBpZiAodmFsU3BhbikgdmFsU3Bhbi50ZXh0Q29udGVudCA9IHRoaXMuX3NlYXJjaD8ucGxhY2Vob2xkZXIgfHwgJydcbiAgICAgICAgLy8gQ2xlYXIgdmlzdWFsIHNlbGVjdGlvblxuICAgICAgICBpZiAodGhpcy5fbGlzdGJveCkge1xuICAgICAgICAgIHRoaXMuX2xpc3Rib3gucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZXhvPVwiY29tYm9ib3gtb3B0aW9uXCJdJykuZm9yRWFjaChvID0+IHtcbiAgICAgICAgICAgIG8uc2V0QXR0cmlidXRlKCdhcmlhLXNlbGVjdGVkJywgJ2ZhbHNlJylcbiAgICAgICAgICAgIGRlbGV0ZSBvLmRhdGFzZXQuc2VsZWN0ZWRcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLl9jbGVhci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX29uQ2xlYXIpXG4gICAgfVxuXG4gICAgLy8gVG9nZ2xlIGV2ZW50IGZvciBhcmlhLWV4cGFuZGVkXG4gICAgdGhpcy5fb25Ub2dnbGUgPSAoKSA9PiB7XG4gICAgICBjb25zdCBvcGVuID0gdGhpcy5fcG9wb3Zlci5tYXRjaGVzKCc6cG9wb3Zlci1vcGVuJylcbiAgICAgIGlmICh0cmlnZ2VyQnRuKSB0cmlnZ2VyQnRuLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsIFN0cmluZyhvcGVuKSlcbiAgICAgIGlmICh0aGlzLl9zZWFyY2gpIHRoaXMuX3NlYXJjaC5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCBTdHJpbmcob3BlbikpXG4gICAgICBpZiAob3BlbiAmJiB0aGlzLl9zZWFyY2ggJiYgIWlzSW5wdXRUcmlnZ2VyKSB7XG4gICAgICAgIHRoaXMuX3NlYXJjaC52YWx1ZSA9ICcnXG4gICAgICAgIHRoaXMuX3NlYXJjaC5mb2N1cygpXG4gICAgICAgIGlmIChmaWx0ZXIgPT09ICdjbGllbnQnKSB0aGlzLl9jbGllbnRGaWx0ZXIoJycpXG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX3BvcG92ZXIuYWRkRXZlbnRMaXN0ZW5lcigndG9nZ2xlJywgdGhpcy5fb25Ub2dnbGUpXG5cbiAgICAvLyBJbnB1dCB0cmlnZ2VyOiBvcGVuL2Nsb3NlIHZpYSBKU1xuICAgIGlmIChpc0lucHV0VHJpZ2dlciAmJiB0aGlzLl9zZWFyY2gpIHtcbiAgICAgIHRoaXMuX29uRm9jdXMgPSAoKSA9PiB7XG4gICAgICAgIHRyeSB7IHRoaXMuX3BvcG92ZXIuc2hvd1BvcG92ZXIoKSB9IGNhdGNoKF9lcnIpIHt9XG4gICAgICB9XG4gICAgICB0aGlzLl9vbkJsdXIgPSAoKSA9PiB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIGlmICghdGhpcy5fcG9wb3Zlci5jb250YWlucyhkb2N1bWVudC5hY3RpdmVFbGVtZW50KSAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9PSB0aGlzLl9zZWFyY2gpIHtcbiAgICAgICAgICAgIHRyeSB7IHRoaXMuX3BvcG92ZXIuaGlkZVBvcG92ZXIoKSB9IGNhdGNoKF9lcnIpIHt9XG4gICAgICAgICAgfVxuICAgICAgICB9LCAyMDApXG4gICAgICB9XG4gICAgICB0aGlzLl9zZWFyY2guYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCB0aGlzLl9vbkZvY3VzKVxuICAgICAgdGhpcy5fc2VhcmNoLmFkZEV2ZW50TGlzdGVuZXIoJ2JsdXInLCB0aGlzLl9vbkJsdXIpXG4gICAgfVxuXG4gICAgLy8gU2VhcmNoIGlucHV0IGhhbmRsZXJcbiAgICBpZiAodGhpcy5fc2VhcmNoKSB7XG4gICAgICBsZXQgdGltZXIgPSBudWxsXG4gICAgICB0aGlzLl9vbklucHV0ID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBxdWVyeSA9IHRoaXMuX3NlYXJjaC52YWx1ZVxuICAgICAgICBpZiAoZmlsdGVyID09PSAnY2xpZW50Jykge1xuICAgICAgICAgIHRoaXMuX2NsaWVudEZpbHRlcihxdWVyeSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjbGVhclRpbWVvdXQodGltZXIpXG4gICAgICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGlmIChvbkZpbHRlcikgdGhpcy5wdXNoRXZlbnQob25GaWx0ZXIsIHsgcXVlcnkgfSlcbiAgICAgICAgICB9LCBkZWJvdW5jZSlcbiAgICAgICAgfVxuICAgICAgICAvLyBVcGRhdGUgY3JlYXRlIG9wdGlvbiB0ZXh0XG4gICAgICAgIGlmICh0aGlzLl9jcmVhdGUpIHtcbiAgICAgICAgICBjb25zdCBzcGFuID0gdGhpcy5fY3JlYXRlLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cImNvbWJvYm94LWNyZWF0ZS1xdWVyeVwiXScpXG4gICAgICAgICAgaWYgKHNwYW4pIHNwYW4udGV4dENvbnRlbnQgPSBxdWVyeVxuICAgICAgICAgIHRoaXMuX2NyZWF0ZS5oaWRkZW4gPSAhcXVlcnlcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5fc2VhcmNoLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgdGhpcy5fb25JbnB1dClcbiAgICB9XG5cbiAgICAvLyBPcHRpb24gY2xpY2tcbiAgICBpZiAodGhpcy5fbGlzdGJveCkge1xuICAgICAgdGhpcy5fb25DbGljayA9IChlKSA9PiB7XG4gICAgICAgIGNvbnN0IG9wdCA9IGUudGFyZ2V0LmNsb3Nlc3QoJ1tkYXRhLWV4bz1cImNvbWJvYm94LW9wdGlvblwiXTpub3QoW2RhdGEtZGlzYWJsZWRdKScpXG4gICAgICAgIGlmICghb3B0KSByZXR1cm5cbiAgICAgICAgdGhpcy5fc2VsZWN0T3B0aW9uKG9wdClcbiAgICAgIH1cbiAgICAgIHRoaXMuX2xpc3Rib3guYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9vbkNsaWNrKVxuXG4gICAgICAvLyBLZXlib2FyZFxuICAgICAgdGhpcy5fb25LZXlkb3duID0gKGUpID0+IHtcbiAgICAgICAgY29uc3Qgb3B0cyA9IFsuLi50aGlzLl9saXN0Ym94LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWV4bz1cImNvbWJvYm94LW9wdGlvblwiXTpub3QoW2RhdGEtZGlzYWJsZWRdKTpub3QoW2hpZGRlbl0pJyldXG4gICAgICAgIGlmICghb3B0cy5sZW5ndGgpIHJldHVyblxuICAgICAgICBjb25zdCBpZHggPSBvcHRzLmluZGV4T2YoZG9jdW1lbnQuYWN0aXZlRWxlbWVudClcbiAgICAgICAgbGV0IG5leHQgPSAtMVxuICAgICAgICBzd2l0Y2ggKGUua2V5KSB7XG4gICAgICAgICAgY2FzZSAnQXJyb3dEb3duJzogbmV4dCA9IGlkeCA8IG9wdHMubGVuZ3RoIC0gMSA/IGlkeCArIDEgOiAwOyBicmVha1xuICAgICAgICAgIGNhc2UgJ0Fycm93VXAnOiBuZXh0ID0gaWR4ID4gMCA/IGlkeCAtIDEgOiBvcHRzLmxlbmd0aCAtIDE7IGJyZWFrXG4gICAgICAgICAgY2FzZSAnRW50ZXInOlxuICAgICAgICAgICAgaWYgKGlkeCA+PSAwKSB7IHRoaXMuX3NlbGVjdE9wdGlvbihvcHRzW2lkeF0pOyBlLnByZXZlbnREZWZhdWx0KCkgfVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgY2FzZSAnRXNjYXBlJzpcbiAgICAgICAgICAgIHRyeSB7IHRoaXMuX3BvcG92ZXIuaGlkZVBvcG92ZXIoKSB9IGNhdGNoKF9lcnIpIHt9XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICBkZWZhdWx0OiByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgb3B0c1tuZXh0XT8uZm9jdXMoKVxuICAgICAgfVxuICAgICAgdGhpcy5fcG9wb3Zlci5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5fb25LZXlkb3duKVxuICAgIH1cbiAgfSxcbiAgX2NsaWVudEZpbHRlcihxdWVyeSkge1xuICAgIGlmICghdGhpcy5fbGlzdGJveCkgcmV0dXJuXG4gICAgY29uc3QgcSA9IHF1ZXJ5LnRvTG93ZXJDYXNlKClcbiAgICBsZXQgaGFzVmlzaWJsZSA9IGZhbHNlXG4gICAgdGhpcy5fbGlzdGJveC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1leG89XCJjb21ib2JveC1vcHRpb25cIl0nKS5mb3JFYWNoKG9wdCA9PiB7XG4gICAgICBjb25zdCBtYXRjaCA9ICFxIHx8IG9wdC50ZXh0Q29udGVudC50cmltKCkudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhxKVxuICAgICAgb3B0LmhpZGRlbiA9ICFtYXRjaFxuICAgICAgaWYgKG1hdGNoKSBoYXNWaXNpYmxlID0gdHJ1ZVxuICAgIH0pXG4gICAgaWYgKHRoaXMuX2VtcHR5KSB0aGlzLl9lbXB0eS5oaWRkZW4gPSBoYXNWaXNpYmxlXG4gIH0sXG4gIF9zZWxlY3RPcHRpb24ob3B0KSB7XG4gICAgY29uc3QgdmFsdWUgPSBvcHQuZGF0YXNldC52YWx1ZVxuICAgIGlmICh0aGlzLl9oaWRkZW4pIHtcbiAgICAgIHRoaXMuX2hpZGRlbi52YWx1ZSA9IHZhbHVlXG4gICAgICB0aGlzLl9oaWRkZW4uZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2lucHV0JywgeyBidWJibGVzOiB0cnVlIH0pKVxuICAgIH1cbiAgICAvLyBVcGRhdGUgdmlzdWFsIHN0YXRlXG4gICAgdGhpcy5fbGlzdGJveC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1leG89XCJjb21ib2JveC1vcHRpb25cIl0nKS5mb3JFYWNoKG8gPT4ge1xuICAgICAgby5zZXRBdHRyaWJ1dGUoJ2FyaWEtc2VsZWN0ZWQnLCBTdHJpbmcoby5kYXRhc2V0LnZhbHVlID09PSB2YWx1ZSkpXG4gICAgICBpZiAoby5kYXRhc2V0LnZhbHVlID09PSB2YWx1ZSkgby5kYXRhc2V0LnNlbGVjdGVkID0gJydcbiAgICAgIGVsc2UgZGVsZXRlIG8uZGF0YXNldC5zZWxlY3RlZFxuICAgIH0pXG4gICAgLy8gVXBkYXRlIHRyaWdnZXIgZGlzcGxheVxuICAgIGNvbnN0IHZhbFNwYW4gPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cImNvbWJvYm94LXZhbHVlXCJdJylcbiAgICBpZiAodmFsU3BhbikgdmFsU3Bhbi50ZXh0Q29udGVudCA9IG9wdC50ZXh0Q29udGVudC50cmltKClcbiAgICAvLyBDbG9zZSAodW5sZXNzIG11bHRpcGxlKVxuICAgIGlmICghdGhpcy5lbC5kYXRhc2V0Lm11bHRpcGxlKSB7XG4gICAgICB0cnkgeyB0aGlzLl9wb3BvdmVyLmhpZGVQb3BvdmVyKCkgfSBjYXRjaChfZXJyKSB7fVxuICAgIH1cbiAgfSxcbiAgX3VuYmluZCgpIHtcbiAgICBpZiAodGhpcy5fcG9wb3Zlcikge1xuICAgICAgaWYgKHRoaXMuX29uVG9nZ2xlKSB0aGlzLl9wb3BvdmVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvZ2dsZScsIHRoaXMuX29uVG9nZ2xlKVxuICAgICAgaWYgKHRoaXMuX29uS2V5ZG93bikgdGhpcy5fcG9wb3Zlci5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5fb25LZXlkb3duKVxuICAgIH1cbiAgICBpZiAodGhpcy5fbGlzdGJveCAmJiB0aGlzLl9vbkNsaWNrKSB0aGlzLl9saXN0Ym94LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fb25DbGljaylcbiAgICBpZiAodGhpcy5fc2VhcmNoKSB7XG4gICAgICBpZiAodGhpcy5fb25JbnB1dCkgdGhpcy5fc2VhcmNoLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2lucHV0JywgdGhpcy5fb25JbnB1dClcbiAgICAgIGlmICh0aGlzLl9vbkZvY3VzKSB0aGlzLl9zZWFyY2gucmVtb3ZlRXZlbnRMaXN0ZW5lcignZm9jdXMnLCB0aGlzLl9vbkZvY3VzKVxuICAgICAgaWYgKHRoaXMuX29uQmx1cikgdGhpcy5fc2VhcmNoLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2JsdXInLCB0aGlzLl9vbkJsdXIpXG4gICAgfVxuICAgIGlmICh0aGlzLl9jbGVhciAmJiB0aGlzLl9vbkNsZWFyKSB0aGlzLl9jbGVhci5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX29uQ2xlYXIpXG4gICAgdGhpcy5fcG9wb3ZlciA9IG51bGxcbiAgICB0aGlzLl9saXN0Ym94ID0gbnVsbFxuICAgIHRoaXMuX3NlYXJjaCA9IG51bGxcbiAgICB0aGlzLl9jbGVhciA9IG51bGxcbiAgfVxufVxuXG5leHBvcnQgeyBFeG9Db21ib2JveCB9XG4iLCAiY29uc3QgRXhvVG9vbHRpcCA9IHtcbiAgbW91bnRlZCgpIHtcbiAgICB0aGlzLl9vbktleWRvd24gPSAoZSkgPT4ge1xuICAgICAgaWYgKGUua2V5ID09PSAnRXNjYXBlJykge1xuICAgICAgICB0aGlzLmVsLmRhdGFzZXQuZGlzbWlzc2VkID0gJydcbiAgICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgKCkgPT4ge1xuICAgICAgICAgIGRlbGV0ZSB0aGlzLmVsLmRhdGFzZXQuZGlzbWlzc2VkXG4gICAgICAgIH0sIHsgb25jZTogdHJ1ZSB9KVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLl9vbktleWRvd24pXG4gIH0sXG4gIGRlc3Ryb3llZCgpIHtcbiAgICBpZiAodGhpcy5fb25LZXlkb3duKSB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLl9vbktleWRvd24pXG4gIH1cbn1cblxuZXhwb3J0IHsgRXhvVG9vbHRpcCB9XG4iLCAiaW1wb3J0IHsgRXhvU2lkZWJhciB9IGZyb20gJy4vaG9va3Mvc2lkZWJhci5qcydcbmltcG9ydCB7IEV4b1RoZW1lVG9nZ2xlIH0gZnJvbSAnLi9ob29rcy90aGVtZV90b2dnbGUuanMnXG5pbXBvcnQgeyBFeG9Qb3BvdmVyIH0gZnJvbSAnLi9ob29rcy9wb3BvdmVyLmpzJ1xuaW1wb3J0IHsgRXhvRHJvcGRvd25NZW51IH0gZnJvbSAnLi9ob29rcy9kcm9wZG93bl9tZW51LmpzJ1xuaW1wb3J0IHsgRXhvU2VsZWN0IH0gZnJvbSAnLi9ob29rcy9zZWxlY3QuanMnXG5pbXBvcnQgeyBFeG9Db21ib2JveCB9IGZyb20gJy4vaG9va3MvY29tYm9ib3guanMnXG5pbXBvcnQgeyBFeG9Ub29sdGlwIH0gZnJvbSAnLi9ob29rcy90b29sdGlwLmpzJ1xuXG5jb25zdCBob29rcyA9IHtcbiAgRXhvU2lkZWJhcixcbiAgRXhvVGhlbWVUb2dnbGUsXG4gIEV4b1BvcG92ZXIsXG4gIEV4b0Ryb3Bkb3duTWVudSxcbiAgRXhvU2VsZWN0LFxuICBFeG9Db21ib2JveCxcbiAgRXhvVG9vbHRpcFxufVxuXG5leHBvcnQgeyBob29rcyB9XG4iLCAiaW1wb3J0IHsgaG9va3MgYXMgZXhvSG9va3MgfSBmcm9tIFwiLi4vLi4vLi4vYXNzZXRzL2pzL2luZGV4LmpzXCJcblxud2luZG93LnN0b3J5Ym9vayA9IHtcbiAgSG9va3M6IGV4b0hvb2tzLFxuICBQYXJhbXM6IHt9LFxuICBVcGxvYWRlcnM6IHt9XG59XG4iXSwKICAibWFwcGluZ3MiOiAiOztBQU1BLE1BQU0sYUFBYTtBQUFBLElBQ2pCLFVBQVU7QUFDUixXQUFLLFNBQVMsS0FBSyxHQUFHLGNBQWMsNkJBQTZCO0FBQ2pFLFVBQUksQ0FBQyxLQUFLLE9BQVE7QUFFbEIsV0FBSyxZQUFZO0FBR2pCLDRCQUFzQixNQUFNO0FBQzFCLGlCQUFTLGdCQUFnQixhQUFhLHNCQUFzQixFQUFFO0FBQUEsTUFDaEUsQ0FBQztBQUdELFdBQUssWUFBWSxNQUFNO0FBQ3JCLFlBQUksT0FBTyxXQUFXLG9CQUFvQixFQUFFLFNBQVM7QUFDbkQsdUJBQWEsUUFBUSx5QkFBeUIsS0FBSyxPQUFPLFVBQVUsVUFBVSxNQUFNO0FBQUEsUUFDdEY7QUFBQSxNQUNGO0FBQ0EsV0FBSyxPQUFPLGlCQUFpQixVQUFVLEtBQUssU0FBUztBQUFBLElBQ3ZEO0FBQUEsSUFFQSxZQUFZO0FBQ1YsVUFBSSxLQUFLLFVBQVUsS0FBSyxXQUFXO0FBQ2pD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
