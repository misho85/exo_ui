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

  // ../../assets/js/hooks/carousel.js
  var ExoCarousel = {
    mounted() {
      this.track = this.el.querySelector('[data-exo="carousel-track"]');
      this.viewport = this.el.querySelector('[data-exo="carousel-viewport"]');
      this.prev = this.el.querySelector('[data-exo="carousel-prev"]');
      this.next = this.el.querySelector('[data-exo="carousel-next"]');
      if (!this.track || !this.viewport) return;
      const slides = () => Array.from(this.track.querySelectorAll('[data-exo="carousel-slide"]'));
      const loop = this.el.hasAttribute("data-loop");
      const scrollTo = (direction) => {
        const s = slides();
        if (s.length === 0) return;
        const slideWidth = s[0].offsetWidth;
        const gap = parseFloat(getComputedStyle(this.track).gap) || 0;
        const scrollAmount = slideWidth + gap;
        if (direction === "next") {
          if (loop && this.viewport.scrollLeft >= this.viewport.scrollWidth - this.viewport.offsetWidth - 5) {
            this.viewport.scrollTo({ left: 0, behavior: "smooth" });
          } else {
            this.viewport.scrollBy({ left: scrollAmount, behavior: "smooth" });
          }
        } else {
          if (loop && this.viewport.scrollLeft <= 5) {
            this.viewport.scrollTo({ left: this.viewport.scrollWidth, behavior: "smooth" });
          } else {
            this.viewport.scrollBy({ left: -scrollAmount, behavior: "smooth" });
          }
        }
      };
      if (this.prev) this.prev.addEventListener("click", this._onPrev = () => scrollTo("prev"));
      if (this.next) this.next.addEventListener("click", this._onNext = () => scrollTo("next"));
      this.el.addEventListener("keydown", this._onKey = (e) => {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          scrollTo("prev");
        }
        if (e.key === "ArrowRight") {
          e.preventDefault();
          scrollTo("next");
        }
      });
    },
    destroyed() {
      if (this.prev && this._onPrev) this.prev.removeEventListener("click", this._onPrev);
      if (this.next && this._onNext) this.next.removeEventListener("click", this._onNext);
      if (this._onKey) this.el.removeEventListener("keydown", this._onKey);
    }
  };

  // ../../assets/js/hooks/collapsible.js
  var ExoCollapsible = {
    mounted() {
      this._checkbox = () => this.el.querySelector('[data-exo="collapsible-state"]');
      this._trigger = () => this.el.querySelector('[data-exo="collapsible-trigger"]');
      this.el.addEventListener("click", this._onClick = (e) => {
        const trigger = e.target.closest('[data-exo="collapsible-trigger"]');
        if (!trigger) return;
        const checkbox = this._checkbox();
        if (!checkbox) return;
        checkbox.checked = !checkbox.checked;
        trigger.setAttribute("aria-expanded", String(checkbox.checked));
      });
      this._syncAria();
    },
    updated() {
      this._syncAria();
    },
    destroyed() {
      if (this._onClick) this.el.removeEventListener("click", this._onClick);
    },
    _syncAria() {
      const checkbox = this._checkbox();
      const trigger = this._trigger();
      if (checkbox && trigger) {
        trigger.setAttribute("aria-expanded", String(checkbox.checked));
      }
    }
  };

  // ../../assets/js/hooks/command_palette.js
  var ExoCommandPalette = {
    mounted() {
      this.backdrop = this.el.querySelector('[data-exo="command-palette-backdrop"]');
      this.input = this.el.querySelector('[data-exo="command-palette-input"]');
      this.list = this.el.querySelector('[data-exo="command-palette-list"]');
      const isOpen = () => this.el.classList.contains("open");
      const open = () => {
        this.el.style.display = "block";
        this.el.classList.add("open");
        requestAnimationFrame(() => {
          if (this.input) this.input.focus();
        });
      };
      const close = () => {
        this.el.classList.remove("open");
        this.el.style.display = "none";
        if (this.input) this.input.value = "";
      };
      document.addEventListener("keydown", this._onGlobalKey = (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "k") {
          e.preventDefault();
          isOpen() ? close() : open();
        }
      });
      this.el.addEventListener("keydown", this._onKey = (e) => {
        if (e.key === "Escape") close();
      });
      if (this.backdrop) {
        this.backdrop.addEventListener("click", this._onBackdrop = () => close());
      }
    },
    destroyed() {
      if (this._onGlobalKey) document.removeEventListener("keydown", this._onGlobalKey);
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

  // ../../assets/js/hooks/hover_card.js
  var ExoHoverCard = {
    mounted() {
      this.trigger = this.el.querySelector('[data-exo="hover-card-trigger"]');
      this.content = this.el.querySelector('[data-exo="hover-card-content"]');
      if (!this.trigger || !this.content) return;
      this._showTimeout = null;
      this._hideTimeout = null;
      const show = () => {
        clearTimeout(this._hideTimeout);
        this._showTimeout = setTimeout(() => {
          this.content.setAttribute("data-open", "");
        }, 300);
      };
      const hide = () => {
        clearTimeout(this._showTimeout);
        this._hideTimeout = setTimeout(() => {
          this.content.removeAttribute("data-open");
        }, 200);
      };
      this.trigger.addEventListener("mouseenter", show);
      this.trigger.addEventListener("mouseleave", hide);
      this.content.addEventListener("mouseenter", () => clearTimeout(this._hideTimeout));
      this.content.addEventListener("mouseleave", hide);
      this.trigger.addEventListener("focus", show);
      this.trigger.addEventListener("blur", hide);
      this._cleanup = () => {
        this.trigger.removeEventListener("mouseenter", show);
        this.trigger.removeEventListener("mouseleave", hide);
        this.trigger.removeEventListener("focus", show);
        this.trigger.removeEventListener("blur", hide);
      };
    },
    destroyed() {
      if (this._cleanup) this._cleanup();
      clearTimeout(this._showTimeout);
      clearTimeout(this._hideTimeout);
    }
  };

  // ../../assets/js/hooks/context_menu.js
  var ExoContextMenu = {
    mounted() {
      this.trigger = this.el.querySelector('[data-exo="context-menu-trigger"]');
      this.menu = this.el.querySelector('[data-exo="context-menu-content"]');
      if (!this.trigger || !this.menu) return;
      this.trigger.addEventListener("contextmenu", this._onContext = (e) => {
        e.preventDefault();
        this.menu.style.left = e.clientX + "px";
        this.menu.style.top = e.clientY + "px";
        this.menu.setAttribute("data-open", "");
        const close = (ev) => {
          if (!this.menu.contains(ev.target)) {
            this.menu.removeAttribute("data-open");
            document.removeEventListener("click", close);
            document.removeEventListener("contextmenu", close);
          }
        };
        setTimeout(() => {
          document.addEventListener("click", close);
          document.addEventListener("contextmenu", close);
        }, 0);
      });
      this.menu.addEventListener("click", this._onItemClick = (e) => {
        const item = e.target.closest('[data-exo="context-menu-item"]');
        if (item && !item.disabled) {
          this.menu.removeAttribute("data-open");
        }
      });
      this.el.addEventListener("keydown", this._onKeydown = (e) => {
        if (e.key === "Escape") this.menu.removeAttribute("data-open");
      });
    },
    destroyed() {
      if (this.trigger && this._onContext) this.trigger.removeEventListener("contextmenu", this._onContext);
    }
  };

  // ../../assets/js/index.js
  var hooks = {
    ExoAccordion,
    ExoCarousel,
    ExoCollapsible,
    ExoCommandPalette,
    ExoSidebar,
    ExoThemeToggle,
    ExoPopover,
    ExoDropdownMenu,
    ExoSelect,
    ExoCombobox,
    ExoTooltip,
    ExoHoverCard,
    ExoContextMenu
  };

  // js/storybook.js
  window.storybook = {
    Hooks: hooks,
    Params: {},
    Uploaders: {}
  };
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vYXNzZXRzL2pzL2hvb2tzL2FjY29yZGlvbi5qcyIsICIuLi8uLi8uLi8uLi9hc3NldHMvanMvaG9va3MvY2Fyb3VzZWwuanMiLCAiLi4vLi4vLi4vLi4vYXNzZXRzL2pzL2hvb2tzL2NvbGxhcHNpYmxlLmpzIiwgIi4uLy4uLy4uLy4uL2Fzc2V0cy9qcy9ob29rcy9jb21tYW5kX3BhbGV0dGUuanMiLCAiLi4vLi4vLi4vLi4vYXNzZXRzL2pzL2hvb2tzL3NpZGViYXIuanMiLCAiLi4vLi4vLi4vLi4vYXNzZXRzL2pzL2hvb2tzL3RoZW1lX3RvZ2dsZS5qcyIsICIuLi8uLi8uLi8uLi9hc3NldHMvanMvaG9va3MvcG9wb3Zlci5qcyIsICIuLi8uLi8uLi8uLi9hc3NldHMvanMvaG9va3MvZHJvcGRvd25fbWVudS5qcyIsICIuLi8uLi8uLi8uLi9hc3NldHMvanMvaG9va3Mvc2VsZWN0LmpzIiwgIi4uLy4uLy4uLy4uL2Fzc2V0cy9qcy9ob29rcy9jb21ib2JveC5qcyIsICIuLi8uLi8uLi8uLi9hc3NldHMvanMvaG9va3MvdG9vbHRpcC5qcyIsICIuLi8uLi8uLi8uLi9hc3NldHMvanMvaG9va3MvaG92ZXJfY2FyZC5qcyIsICIuLi8uLi8uLi8uLi9hc3NldHMvanMvaG9va3MvY29udGV4dF9tZW51LmpzIiwgIi4uLy4uLy4uLy4uL2Fzc2V0cy9qcy9pbmRleC5qcyIsICIuLi8uLi8uLi9hc3NldHMvanMvc3Rvcnlib29rLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKipcbiAqIEV4b0FjY29yZGlvbiBob29rIFx1MjAxNCBrZXlib2FyZCBuYXZpZ2F0aW9uICsgc2luZ2xlLW9wZW4gZW5mb3JjZW1lbnQuXG4gKlxuICogUmVhZHMgZGF0YS10eXBlIChcInNpbmdsZVwifFwibXVsdGlwbGVcIikgYW5kIGRhdGEtY29sbGFwc2libGUgZnJvbSB0aGUgcm9vdCBlbGVtZW50LlxuICogLSBzaW5nbGU6IG9ubHkgb25lIGl0ZW0gb3BlbiBhdCBhIHRpbWVcbiAqIC0gbXVsdGlwbGU6IGFueSBudW1iZXIgb2YgaXRlbXMgb3BlbiAoZGVmYXVsdCBjaGVja2JveCBiZWhhdmlvcilcbiAqIC0gY29sbGFwc2libGU6IGluIHNpbmdsZSBtb2RlLCBhbGxvd3MgY2xvc2luZyB0aGUgb3BlbiBpdGVtXG4gKlxuICogS2V5Ym9hcmQ6XG4gKiAgIEFycm93RG93biAvIEFycm93VXAgXHUyMDE0IG1vdmUgZm9jdXMgYmV0d2VlbiB0cmlnZ2Vyc1xuICogICBIb21lIC8gRW5kIFx1MjAxNCBmb2N1cyBmaXJzdCAvIGxhc3QgdHJpZ2dlclxuICogICBFbnRlciAvIFNwYWNlIFx1MjAxNCB0b2dnbGUgaXRlbSAoaGFuZGxlZCBuYXRpdmVseSBieSBidXR0b24sIGJ1dCB3ZSBtYW5hZ2Ugc2luZ2xlLW1vZGUpXG4gKi9cbmNvbnN0IEV4b0FjY29yZGlvbiA9IHtcbiAgbW91bnRlZCgpIHtcbiAgICB0aGlzLl90cmlnZ2VycyA9ICgpID0+XG4gICAgICBBcnJheS5mcm9tKHRoaXMuZWwucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZXhvPVwiYWNjb3JkaW9uLXRyaWdnZXJcIl06bm90KFtkaXNhYmxlZF0pJykpXG5cbiAgICB0aGlzLl9jaGVja2JveGVzID0gKCkgPT5cbiAgICAgIEFycmF5LmZyb20odGhpcy5lbC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1leG89XCJhY2NvcmRpb24tc3RhdGVcIl06bm90KFtkaXNhYmxlZF0pJykpXG5cbiAgICB0aGlzLl9pc1NpbmdsZSA9ICgpID0+IHRoaXMuZWwuZGF0YXNldC50eXBlID09PSBcInNpbmdsZVwiXG4gICAgdGhpcy5faXNDb2xsYXBzaWJsZSA9ICgpID0+IHRoaXMuZWwuaGFzQXR0cmlidXRlKFwiZGF0YS1jb2xsYXBzaWJsZVwiKVxuXG4gICAgLy8gS2V5Ym9hcmQgbmF2aWdhdGlvblxuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5fb25LZXlkb3duID0gKGUpID0+IHtcbiAgICAgIGNvbnN0IHRyaWdnZXIgPSBlLnRhcmdldC5jbG9zZXN0KCdbZGF0YS1leG89XCJhY2NvcmRpb24tdHJpZ2dlclwiXScpXG4gICAgICBpZiAoIXRyaWdnZXIpIHJldHVyblxuXG4gICAgICBjb25zdCB0cmlnZ2VycyA9IHRoaXMuX3RyaWdnZXJzKClcbiAgICAgIGNvbnN0IGlkeCA9IHRyaWdnZXJzLmluZGV4T2YodHJpZ2dlcilcbiAgICAgIGlmIChpZHggPT09IC0xKSByZXR1cm5cblxuICAgICAgbGV0IHRhcmdldCA9IG51bGxcblxuICAgICAgc3dpdGNoIChlLmtleSkge1xuICAgICAgICBjYXNlIFwiQXJyb3dEb3duXCI6XG4gICAgICAgICAgdGFyZ2V0ID0gdHJpZ2dlcnNbKGlkeCArIDEpICUgdHJpZ2dlcnMubGVuZ3RoXVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgXCJBcnJvd1VwXCI6XG4gICAgICAgICAgdGFyZ2V0ID0gdHJpZ2dlcnNbKGlkeCAtIDEgKyB0cmlnZ2Vycy5sZW5ndGgpICUgdHJpZ2dlcnMubGVuZ3RoXVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgXCJIb21lXCI6XG4gICAgICAgICAgdGFyZ2V0ID0gdHJpZ2dlcnNbMF1cbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIFwiRW5kXCI6XG4gICAgICAgICAgdGFyZ2V0ID0gdHJpZ2dlcnNbdHJpZ2dlcnMubGVuZ3RoIC0gMV1cbiAgICAgICAgICBicmVha1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBpZiAodGFyZ2V0KSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICB0YXJnZXQuZm9jdXMoKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICAvLyBDbGljayBoYW5kbGluZyBmb3Igc2luZ2xlIG1vZGUgKyBjb2xsYXBzaWJsZSArIGFyaWEtZXhwYW5kZWQgc3luY1xuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuX29uQ2xpY2sgPSAoZSkgPT4ge1xuICAgICAgY29uc3QgdHJpZ2dlciA9IGUudGFyZ2V0LmNsb3Nlc3QoJ1tkYXRhLWV4bz1cImFjY29yZGlvbi10cmlnZ2VyXCJdJylcbiAgICAgIGlmICghdHJpZ2dlciB8fCB0cmlnZ2VyLmRpc2FibGVkKSByZXR1cm5cblxuICAgICAgY29uc3QgaXRlbSA9IHRyaWdnZXIuY2xvc2VzdCgnW2RhdGEtZXhvPVwiYWNjb3JkaW9uLWl0ZW1cIl0nKVxuICAgICAgY29uc3QgY2hlY2tib3ggPSBpdGVtPy5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJhY2NvcmRpb24tc3RhdGVcIl0nKVxuICAgICAgaWYgKCFjaGVja2JveCkgcmV0dXJuXG5cbiAgICAgIGNvbnN0IHdhc0NoZWNrZWQgPSBjaGVja2JveC5jaGVja2VkXG5cbiAgICAgIGlmICh0aGlzLl9pc1NpbmdsZSgpKSB7XG4gICAgICAgIGlmICh3YXNDaGVja2VkICYmIHRoaXMuX2lzQ29sbGFwc2libGUoKSkge1xuICAgICAgICAgIC8vIENsb3NlIHRoaXMgaXRlbVxuICAgICAgICAgIGNoZWNrYm94LmNoZWNrZWQgPSBmYWxzZVxuICAgICAgICAgIHRoaXMuX3N5bmNBcmlhKHRyaWdnZXIsIGZhbHNlKVxuICAgICAgICB9IGVsc2UgaWYgKHdhc0NoZWNrZWQgJiYgIXRoaXMuX2lzQ29sbGFwc2libGUoKSkge1xuICAgICAgICAgIC8vIEtlZXAgb3BlbiwgcHJldmVudCB0b2dnbGVcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBDbG9zZSBhbGwgb3RoZXJzLCBvcGVuIHRoaXMgb25lXG4gICAgICAgICAgdGhpcy5fY2hlY2tib3hlcygpLmZvckVhY2goKGNiKSA9PiB7XG4gICAgICAgICAgICBpZiAoY2IgIT09IGNoZWNrYm94ICYmIGNiLmNoZWNrZWQpIHtcbiAgICAgICAgICAgICAgY2IuY2hlY2tlZCA9IGZhbHNlXG4gICAgICAgICAgICAgIGNvbnN0IG90aGVyVHJpZ2dlciA9IGNiLnBhcmVudEVsZW1lbnQucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwiYWNjb3JkaW9uLXRyaWdnZXJcIl0nKVxuICAgICAgICAgICAgICBpZiAob3RoZXJUcmlnZ2VyKSB0aGlzLl9zeW5jQXJpYShvdGhlclRyaWdnZXIsIGZhbHNlKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgICAgY2hlY2tib3guY2hlY2tlZCA9IHRydWVcbiAgICAgICAgICB0aGlzLl9zeW5jQXJpYSh0cmlnZ2VyLCB0cnVlKVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBNdWx0aXBsZSBtb2RlIFx1MjAxNCBqdXN0IHRvZ2dsZVxuICAgICAgICBjaGVja2JveC5jaGVja2VkID0gIXdhc0NoZWNrZWRcbiAgICAgICAgdGhpcy5fc3luY0FyaWEodHJpZ2dlciwgY2hlY2tib3guY2hlY2tlZClcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgLy8gU3luYyBpbml0aWFsIGFyaWEgc3RhdGVzXG4gICAgdGhpcy5fc3luY0FsbEFyaWEoKVxuICB9LFxuXG4gIHVwZGF0ZWQoKSB7XG4gICAgdGhpcy5fc3luY0FsbEFyaWEoKVxuICB9LFxuXG4gIGRlc3Ryb3llZCgpIHtcbiAgICBpZiAodGhpcy5fb25LZXlkb3duKSB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIHRoaXMuX29uS2V5ZG93bilcbiAgICBpZiAodGhpcy5fb25DbGljaykgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5fb25DbGljaylcbiAgfSxcblxuICBfc3luY0FyaWEodHJpZ2dlciwgZXhwYW5kZWQpIHtcbiAgICB0cmlnZ2VyLnNldEF0dHJpYnV0ZShcImFyaWEtZXhwYW5kZWRcIiwgU3RyaW5nKGV4cGFuZGVkKSlcbiAgfSxcblxuICBfc3luY0FsbEFyaWEoKSB7XG4gICAgY29uc3QgaXRlbXMgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWV4bz1cImFjY29yZGlvbi1pdGVtXCJdJylcbiAgICBpdGVtcy5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICBjb25zdCBjaGVja2JveCA9IGl0ZW0ucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwiYWNjb3JkaW9uLXN0YXRlXCJdJylcbiAgICAgIGNvbnN0IHRyaWdnZXIgPSBpdGVtLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cImFjY29yZGlvbi10cmlnZ2VyXCJdJylcbiAgICAgIGlmIChjaGVja2JveCAmJiB0cmlnZ2VyKSB7XG4gICAgICAgIHRoaXMuX3N5bmNBcmlhKHRyaWdnZXIsIGNoZWNrYm94LmNoZWNrZWQpXG4gICAgICB9XG4gICAgfSlcbiAgfVxufVxuXG5leHBvcnQgeyBFeG9BY2NvcmRpb24gfVxuIiwgIi8qKlxuICogRXhvQ2Fyb3VzZWwgaG9vayBcdTIwMTQgc2Nyb2xsYWJsZSBjYXJvdXNlbCB3aXRoIHByZXYvbmV4dCBidXR0b25zLlxuICovXG5jb25zdCBFeG9DYXJvdXNlbCA9IHtcbiAgbW91bnRlZCgpIHtcbiAgICB0aGlzLnRyYWNrID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJjYXJvdXNlbC10cmFja1wiXScpXG4gICAgdGhpcy52aWV3cG9ydCA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwiY2Fyb3VzZWwtdmlld3BvcnRcIl0nKVxuICAgIHRoaXMucHJldiA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwiY2Fyb3VzZWwtcHJldlwiXScpXG4gICAgdGhpcy5uZXh0ID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJjYXJvdXNlbC1uZXh0XCJdJylcbiAgICBpZiAoIXRoaXMudHJhY2sgfHwgIXRoaXMudmlld3BvcnQpIHJldHVyblxuXG4gICAgY29uc3Qgc2xpZGVzID0gKCkgPT4gQXJyYXkuZnJvbSh0aGlzLnRyYWNrLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWV4bz1cImNhcm91c2VsLXNsaWRlXCJdJykpXG4gICAgY29uc3QgbG9vcCA9IHRoaXMuZWwuaGFzQXR0cmlidXRlKFwiZGF0YS1sb29wXCIpXG5cbiAgICBjb25zdCBzY3JvbGxUbyA9IChkaXJlY3Rpb24pID0+IHtcbiAgICAgIGNvbnN0IHMgPSBzbGlkZXMoKVxuICAgICAgaWYgKHMubGVuZ3RoID09PSAwKSByZXR1cm5cbiAgICAgIGNvbnN0IHNsaWRlV2lkdGggPSBzWzBdLm9mZnNldFdpZHRoXG4gICAgICBjb25zdCBnYXAgPSBwYXJzZUZsb2F0KGdldENvbXB1dGVkU3R5bGUodGhpcy50cmFjaykuZ2FwKSB8fCAwXG4gICAgICBjb25zdCBzY3JvbGxBbW91bnQgPSBzbGlkZVdpZHRoICsgZ2FwXG5cbiAgICAgIGlmIChkaXJlY3Rpb24gPT09IFwibmV4dFwiKSB7XG4gICAgICAgIGlmIChsb29wICYmIHRoaXMudmlld3BvcnQuc2Nyb2xsTGVmdCA+PSB0aGlzLnZpZXdwb3J0LnNjcm9sbFdpZHRoIC0gdGhpcy52aWV3cG9ydC5vZmZzZXRXaWR0aCAtIDUpIHtcbiAgICAgICAgICB0aGlzLnZpZXdwb3J0LnNjcm9sbFRvKHsgbGVmdDogMCwgYmVoYXZpb3I6IFwic21vb3RoXCIgfSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnZpZXdwb3J0LnNjcm9sbEJ5KHsgbGVmdDogc2Nyb2xsQW1vdW50LCBiZWhhdmlvcjogXCJzbW9vdGhcIiB9KVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAobG9vcCAmJiB0aGlzLnZpZXdwb3J0LnNjcm9sbExlZnQgPD0gNSkge1xuICAgICAgICAgIHRoaXMudmlld3BvcnQuc2Nyb2xsVG8oeyBsZWZ0OiB0aGlzLnZpZXdwb3J0LnNjcm9sbFdpZHRoLCBiZWhhdmlvcjogXCJzbW9vdGhcIiB9KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMudmlld3BvcnQuc2Nyb2xsQnkoeyBsZWZ0OiAtc2Nyb2xsQW1vdW50LCBiZWhhdmlvcjogXCJzbW9vdGhcIiB9KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMucHJldikgdGhpcy5wcmV2LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLl9vblByZXYgPSAoKSA9PiBzY3JvbGxUbyhcInByZXZcIikpXG4gICAgaWYgKHRoaXMubmV4dCkgdGhpcy5uZXh0LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLl9vbk5leHQgPSAoKSA9PiBzY3JvbGxUbyhcIm5leHRcIikpXG5cbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIHRoaXMuX29uS2V5ID0gKGUpID0+IHtcbiAgICAgIGlmIChlLmtleSA9PT0gXCJBcnJvd0xlZnRcIikgeyBlLnByZXZlbnREZWZhdWx0KCk7IHNjcm9sbFRvKFwicHJldlwiKSB9XG4gICAgICBpZiAoZS5rZXkgPT09IFwiQXJyb3dSaWdodFwiKSB7IGUucHJldmVudERlZmF1bHQoKTsgc2Nyb2xsVG8oXCJuZXh0XCIpIH1cbiAgICB9KVxuICB9LFxuXG4gIGRlc3Ryb3llZCgpIHtcbiAgICBpZiAodGhpcy5wcmV2ICYmIHRoaXMuX29uUHJldikgdGhpcy5wcmV2LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLl9vblByZXYpXG4gICAgaWYgKHRoaXMubmV4dCAmJiB0aGlzLl9vbk5leHQpIHRoaXMubmV4dC5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5fb25OZXh0KVxuICAgIGlmICh0aGlzLl9vbktleSkgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCB0aGlzLl9vbktleSlcbiAgfVxufVxuXG5leHBvcnQgeyBFeG9DYXJvdXNlbCB9XG4iLCAiLyoqXG4gKiBFeG9Db2xsYXBzaWJsZSBob29rIFx1MjAxNCBjbGljayB0b2dnbGUgKyBhcmlhLWV4cGFuZGVkIHN5bmMuXG4gKlxuICogVXNlcyBhIGhpZGRlbiBjaGVja2JveCB0byBkcml2ZSBDU1Mgc3RhdGUgKHNhbWUgcGF0dGVybiBhcyBFeG9BY2NvcmRpb24pLlxuICogVGhlIHRyaWdnZXIgYnV0dG9uIHRvZ2dsZXMgdGhlIGNoZWNrYm94IGFuZCBzeW5jcyBhcmlhLWV4cGFuZGVkLlxuICovXG5jb25zdCBFeG9Db2xsYXBzaWJsZSA9IHtcbiAgbW91bnRlZCgpIHtcbiAgICB0aGlzLl9jaGVja2JveCA9ICgpID0+IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwiY29sbGFwc2libGUtc3RhdGVcIl0nKVxuICAgIHRoaXMuX3RyaWdnZXIgPSAoKSA9PiB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cImNvbGxhcHNpYmxlLXRyaWdnZXJcIl0nKVxuXG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5fb25DbGljayA9IChlKSA9PiB7XG4gICAgICBjb25zdCB0cmlnZ2VyID0gZS50YXJnZXQuY2xvc2VzdCgnW2RhdGEtZXhvPVwiY29sbGFwc2libGUtdHJpZ2dlclwiXScpXG4gICAgICBpZiAoIXRyaWdnZXIpIHJldHVyblxuXG4gICAgICBjb25zdCBjaGVja2JveCA9IHRoaXMuX2NoZWNrYm94KClcbiAgICAgIGlmICghY2hlY2tib3gpIHJldHVyblxuXG4gICAgICBjaGVja2JveC5jaGVja2VkID0gIWNoZWNrYm94LmNoZWNrZWRcbiAgICAgIHRyaWdnZXIuc2V0QXR0cmlidXRlKFwiYXJpYS1leHBhbmRlZFwiLCBTdHJpbmcoY2hlY2tib3guY2hlY2tlZCkpXG4gICAgfSlcblxuICAgIHRoaXMuX3N5bmNBcmlhKClcbiAgfSxcblxuICB1cGRhdGVkKCkge1xuICAgIHRoaXMuX3N5bmNBcmlhKClcbiAgfSxcblxuICBkZXN0cm95ZWQoKSB7XG4gICAgaWYgKHRoaXMuX29uQ2xpY2spIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuX29uQ2xpY2spXG4gIH0sXG5cbiAgX3N5bmNBcmlhKCkge1xuICAgIGNvbnN0IGNoZWNrYm94ID0gdGhpcy5fY2hlY2tib3goKVxuICAgIGNvbnN0IHRyaWdnZXIgPSB0aGlzLl90cmlnZ2VyKClcbiAgICBpZiAoY2hlY2tib3ggJiYgdHJpZ2dlcikge1xuICAgICAgdHJpZ2dlci5zZXRBdHRyaWJ1dGUoXCJhcmlhLWV4cGFuZGVkXCIsIFN0cmluZyhjaGVja2JveC5jaGVja2VkKSlcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IHsgRXhvQ29sbGFwc2libGUgfVxuIiwgIi8qKlxuICogRXhvQ29tbWFuZFBhbGV0dGUgaG9vayBcdTIwMTQgQ3RybCtLIC8gQ21kK0sgc2VhcmNoYWJsZSBjb21tYW5kIGRpYWxvZy5cbiAqL1xuY29uc3QgRXhvQ29tbWFuZFBhbGV0dGUgPSB7XG4gIG1vdW50ZWQoKSB7XG4gICAgdGhpcy5iYWNrZHJvcCA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwiY29tbWFuZC1wYWxldHRlLWJhY2tkcm9wXCJdJylcbiAgICB0aGlzLmlucHV0ID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJjb21tYW5kLXBhbGV0dGUtaW5wdXRcIl0nKVxuICAgIHRoaXMubGlzdCA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwiY29tbWFuZC1wYWxldHRlLWxpc3RcIl0nKVxuXG4gICAgY29uc3QgaXNPcGVuID0gKCkgPT4gdGhpcy5lbC5jbGFzc0xpc3QuY29udGFpbnMoXCJvcGVuXCIpXG5cbiAgICBjb25zdCBvcGVuID0gKCkgPT4ge1xuICAgICAgdGhpcy5lbC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiXG4gICAgICB0aGlzLmVsLmNsYXNzTGlzdC5hZGQoXCJvcGVuXCIpXG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5pbnB1dCkgdGhpcy5pbnB1dC5mb2N1cygpXG4gICAgICB9KVxuICAgIH1cblxuICAgIGNvbnN0IGNsb3NlID0gKCkgPT4ge1xuICAgICAgdGhpcy5lbC5jbGFzc0xpc3QucmVtb3ZlKFwib3BlblwiKVxuICAgICAgdGhpcy5lbC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCJcbiAgICAgIGlmICh0aGlzLmlucHV0KSB0aGlzLmlucHV0LnZhbHVlID0gXCJcIlxuICAgIH1cblxuICAgIC8vIEdsb2JhbCBDdHJsK0sgLyBDbWQrS1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIHRoaXMuX29uR2xvYmFsS2V5ID0gKGUpID0+IHtcbiAgICAgIGlmICgoZS5tZXRhS2V5IHx8IGUuY3RybEtleSkgJiYgZS5rZXkgPT09IFwia1wiKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICBpc09wZW4oKSA/IGNsb3NlKCkgOiBvcGVuKClcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgLy8gRXNjYXBlIHRvIGNsb3NlXG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCB0aGlzLl9vbktleSA9IChlKSA9PiB7XG4gICAgICBpZiAoZS5rZXkgPT09IFwiRXNjYXBlXCIpIGNsb3NlKClcbiAgICB9KVxuXG4gICAgLy8gQ2xpY2sgYmFja2Ryb3AgdG8gY2xvc2VcbiAgICBpZiAodGhpcy5iYWNrZHJvcCkge1xuICAgICAgdGhpcy5iYWNrZHJvcC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5fb25CYWNrZHJvcCA9ICgpID0+IGNsb3NlKCkpXG4gICAgfVxuICB9LFxuXG4gIGRlc3Ryb3llZCgpIHtcbiAgICBpZiAodGhpcy5fb25HbG9iYWxLZXkpIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIHRoaXMuX29uR2xvYmFsS2V5KVxuICB9XG59XG5cbmV4cG9ydCB7IEV4b0NvbW1hbmRQYWxldHRlIH1cbiIsICIvKipcbiAqIEV4b1NpZGViYXIgaG9vayBcdTIwMTQgbWFuYWdlcyBjb2xsYXBzaWJsZSBzaWRlYmFyIHN0YXRlLlxuICpcbiAqIFJlc3RvcmVzIGNvbGxhcHNlZC9leHBhbmRlZCBmcm9tIGxvY2FsU3RvcmFnZSBvbiBkZXNrdG9wLlxuICogTW9iaWxlIHN0YXJ0cyBjbG9zZWQuIFNldHMgZGF0YS1zaWRlYmFyLXJlYWR5IG9uIDxodG1sPiBhZnRlciBpbml0LlxuICovXG5jb25zdCBFeG9TaWRlYmFyID0ge1xuICBtb3VudGVkKCkge1xuICAgIHRoaXMudG9nZ2xlID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJzaWRlYmFyLXRvZ2dsZVwiXScpXG4gICAgaWYgKCF0aGlzLnRvZ2dsZSkgcmV0dXJuXG5cbiAgICB0aGlzLl9hcHBseVN0YXRlKClcblxuICAgIC8vIEVuYWJsZSBDU1MgdHJhbnNpdGlvbnMgYWZ0ZXIgaW5pdGlhbCBzdGF0ZSAocHJldmVudHMgRk9VQylcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNldEF0dHJpYnV0ZSgnZGF0YS1zaWRlYmFyLXJlYWR5JywgJycpXG4gICAgfSlcblxuICAgIC8vIFBlcnNpc3Qgb24gdG9nZ2xlXG4gICAgdGhpcy5fb25DaGFuZ2UgPSAoKSA9PiB7XG4gICAgICBpZiAod2luZG93Lm1hdGNoTWVkaWEoJyhtaW4td2lkdGg6IDc2OHB4KScpLm1hdGNoZXMpIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2V4by1zaWRlYmFyLWNvbGxhcHNlZCcsIHRoaXMudG9nZ2xlLmNoZWNrZWQgPyAnZmFsc2UnIDogJ3RydWUnKVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnRvZ2dsZS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCB0aGlzLl9vbkNoYW5nZSlcbiAgfSxcblxuICBkZXN0cm95ZWQoKSB7XG4gICAgaWYgKHRoaXMudG9nZ2xlICYmIHRoaXMuX29uQ2hhbmdlKSB7XG4gICAgICB0aGlzLnRvZ2dsZS5yZW1vdmVFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCB0aGlzLl9vbkNoYW5nZSlcbiAgICB9XG4gIH0sXG5cbiAgdXBkYXRlZCgpIHtcbiAgICB0aGlzLl9hcHBseVN0YXRlKClcbiAgfSxcblxuICBfYXBwbHlTdGF0ZSgpIHtcbiAgICBpZiAoIXRoaXMudG9nZ2xlKSByZXR1cm5cbiAgICBjb25zdCBpc0Rlc2t0b3AgPSB3aW5kb3cubWF0Y2hNZWRpYSgnKG1pbi13aWR0aDogNzY4cHgpJykubWF0Y2hlc1xuICAgIGlmIChpc0Rlc2t0b3ApIHtcbiAgICAgIGNvbnN0IGNvbGxhcHNlZCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdleG8tc2lkZWJhci1jb2xsYXBzZWQnKSA9PT0gJ3RydWUnXG4gICAgICB0aGlzLnRvZ2dsZS5jaGVja2VkID0gIWNvbGxhcHNlZFxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnRvZ2dsZS5jaGVja2VkID0gZmFsc2VcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IHsgRXhvU2lkZWJhciB9XG4iLCAiY29uc3QgRXhvVGhlbWVUb2dnbGUgPSB7XG4gIG1vdW50ZWQoKSB7XG4gICAgdGhpcy5fYXBwbHkodGhpcy5fY3VycmVudCgpKVxuXG4gICAgdGhpcy5faGFuZGxlcnMgPSBbXVxuICAgIHRoaXMuZWwucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtdGhlbWUtdmFsdWVdJykuZm9yRWFjaChidG4gPT4ge1xuICAgICAgY29uc3QgaGFuZGxlciA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBidG4uZ2V0QXR0cmlidXRlKCdkYXRhLXRoZW1lLXZhbHVlJylcbiAgICAgICAgdGhpcy5fYXBwbHkodmFsdWUpXG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdleG8tdGhlbWUnLCB2YWx1ZSlcbiAgICAgIH1cbiAgICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZXIpXG4gICAgICB0aGlzLl9oYW5kbGVycy5wdXNoKHsgYnRuLCBoYW5kbGVyIH0pXG4gICAgfSlcbiAgfSxcblxuICBkZXN0cm95ZWQoKSB7XG4gICAgdGhpcy5faGFuZGxlcnM/LmZvckVhY2goKHsgYnRuLCBoYW5kbGVyIH0pID0+XG4gICAgICBidG4ucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVyKVxuICAgIClcbiAgfSxcblxuICBfY3VycmVudCgpIHtcbiAgICByZXR1cm4gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2V4by10aGVtZScpIHx8ICdzeXN0ZW0nXG4gIH0sXG5cbiAgX2FwcGx5KHRoZW1lKSB7XG4gICAgY29uc3Qgcm9vdCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudFxuICAgIC8vIFVwZGF0ZSBhY3RpdmUgc3RhdGUgb24gYnV0dG9uc1xuICAgIHRoaXMuZWwucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtdGhlbWUtdmFsdWVdJykuZm9yRWFjaChidG4gPT4ge1xuICAgICAgYnRuLnRvZ2dsZUF0dHJpYnV0ZSgnZGF0YS1hY3RpdmUnLCBidG4uZ2V0QXR0cmlidXRlKCdkYXRhLXRoZW1lLXZhbHVlJykgPT09IHRoZW1lKVxuICAgIH0pXG5cbiAgICBpZiAodGhlbWUgPT09ICdzeXN0ZW0nKSB7XG4gICAgICByb290LnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS10aGVtZScpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJvb3Quc2V0QXR0cmlidXRlKCdkYXRhLXRoZW1lJywgdGhlbWUpXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCB7IEV4b1RoZW1lVG9nZ2xlIH1cbiIsICJjb25zdCBFeG9Qb3BvdmVyID0ge1xuICBtb3VudGVkKCkgeyB0aGlzLl9iaW5kKCkgfSxcbiAgdXBkYXRlZCgpIHsgdGhpcy5fYmluZCgpIH0sXG4gIGRlc3Ryb3llZCgpIHsgdGhpcy5fdW5iaW5kKCkgfSxcbiAgX2JpbmQoKSB7XG4gICAgdGhpcy5fdW5iaW5kKClcbiAgICBjb25zdCB0cmlnZ2VyID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJwb3BvdmVyLXRyaWdnZXJcIl0nKVxuICAgIGNvbnN0IGlkID0gdHJpZ2dlcj8uZ2V0QXR0cmlidXRlKCdwb3BvdmVydGFyZ2V0JylcbiAgICB0aGlzLl9wb3BvdmVyID0gaWQgPyBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCkgOiBudWxsXG4gICAgaWYgKCF0aGlzLl9wb3BvdmVyKSByZXR1cm5cbiAgICB0aGlzLl9vblRvZ2dsZSA9ICgpID0+IHtcbiAgICAgIGNvbnN0IG9wZW4gPSB0aGlzLl9wb3BvdmVyLm1hdGNoZXMoJzpwb3BvdmVyLW9wZW4nKVxuICAgICAgdHJpZ2dlci5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCBTdHJpbmcob3BlbikpXG4gICAgfVxuICAgIHRoaXMuX3BvcG92ZXIuYWRkRXZlbnRMaXN0ZW5lcigndG9nZ2xlJywgdGhpcy5fb25Ub2dnbGUpXG4gIH0sXG4gIF91bmJpbmQoKSB7XG4gICAgaWYgKHRoaXMuX3BvcG92ZXIgJiYgdGhpcy5fb25Ub2dnbGUpIHtcbiAgICAgIHRoaXMuX3BvcG92ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG9nZ2xlJywgdGhpcy5fb25Ub2dnbGUpXG4gICAgfVxuICAgIHRoaXMuX3BvcG92ZXIgPSBudWxsXG4gICAgdGhpcy5fb25Ub2dnbGUgPSBudWxsXG4gIH1cbn1cblxuZXhwb3J0IHsgRXhvUG9wb3ZlciB9XG4iLCAiY29uc3QgRXhvRHJvcGRvd25NZW51ID0ge1xuICBtb3VudGVkKCkgeyB0aGlzLl9iaW5kKCkgfSxcbiAgdXBkYXRlZCgpIHsgdGhpcy5fYmluZCgpIH0sXG4gIGRlc3Ryb3llZCgpIHsgdGhpcy5fdW5iaW5kKCkgfSxcbiAgX2JpbmQoKSB7XG4gICAgdGhpcy5fdW5iaW5kKClcbiAgICB0aGlzLl9tZW51ID0gdGhpcy5lbC5tYXRjaGVzKCdbcm9sZT1cIm1lbnVcIl0nKSA/IHRoaXMuZWwgOiB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tyb2xlPVwibWVudVwiXScpXG4gICAgaWYgKCF0aGlzLl9tZW51KSByZXR1cm5cbiAgICB0aGlzLl9vbktleWRvd24gPSAoZSkgPT4ge1xuICAgICAgY29uc3QgaXRlbXMgPSBbLi4udGhpcy5fbWVudS5xdWVyeVNlbGVjdG9yQWxsKCdbcm9sZT1cIm1lbnVpdGVtXCJdOm5vdChbZGlzYWJsZWRdKScpXVxuICAgICAgaWYgKCFpdGVtcy5sZW5ndGgpIHJldHVyblxuICAgICAgY29uc3QgaWR4ID0gaXRlbXMuaW5kZXhPZihkb2N1bWVudC5hY3RpdmVFbGVtZW50KVxuICAgICAgbGV0IG5leHQgPSAtMVxuICAgICAgc3dpdGNoIChlLmtleSkge1xuICAgICAgICBjYXNlICdBcnJvd0Rvd24nOiBuZXh0ID0gaWR4IDwgaXRlbXMubGVuZ3RoIC0gMSA/IGlkeCArIDEgOiAwOyBicmVha1xuICAgICAgICBjYXNlICdBcnJvd1VwJzogbmV4dCA9IGlkeCA+IDAgPyBpZHggLSAxIDogaXRlbXMubGVuZ3RoIC0gMTsgYnJlYWtcbiAgICAgICAgY2FzZSAnSG9tZSc6IG5leHQgPSAwOyBicmVha1xuICAgICAgICBjYXNlICdFbmQnOiBuZXh0ID0gaXRlbXMubGVuZ3RoIC0gMTsgYnJlYWtcbiAgICAgICAgZGVmYXVsdDogcmV0dXJuXG4gICAgICB9XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIGl0ZW1zW25leHRdPy5mb2N1cygpXG4gICAgfVxuICAgIHRoaXMuX21lbnUuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX29uS2V5ZG93bilcbiAgfSxcbiAgX3VuYmluZCgpIHtcbiAgICBpZiAodGhpcy5fbWVudSAmJiB0aGlzLl9vbktleWRvd24pIHtcbiAgICAgIHRoaXMuX21lbnUucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX29uS2V5ZG93bilcbiAgICB9XG4gICAgdGhpcy5fbWVudSA9IG51bGxcbiAgICB0aGlzLl9vbktleWRvd24gPSBudWxsXG4gIH1cbn1cblxuZXhwb3J0IHsgRXhvRHJvcGRvd25NZW51IH1cbiIsICJjb25zdCBFeG9TZWxlY3QgPSB7XG4gIG1vdW50ZWQoKSB7IHRoaXMuX2JpbmQoKSB9LFxuICB1cGRhdGVkKCkgeyB0aGlzLl9iaW5kKCkgfSxcbiAgZGVzdHJveWVkKCkgeyB0aGlzLl91bmJpbmQoKSB9LFxuXG4gIF9iaW5kKCkge1xuICAgIHRoaXMuX3VuYmluZCgpXG5cbiAgICB0aGlzLl90cmlnZ2VyID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG8tc2VsZWN0PVwidHJpZ2dlclwiXScpXG4gICAgY29uc3QgcG9wb3ZlcklkID0gdGhpcy5fdHJpZ2dlcj8uZ2V0QXR0cmlidXRlKCdwb3BvdmVydGFyZ2V0JylcbiAgICB0aGlzLl9wb3BvdmVyID0gcG9wb3ZlcklkID8gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocG9wb3ZlcklkKSA6IG51bGxcbiAgICB0aGlzLl9saXN0Ym94ID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbcm9sZT1cImxpc3Rib3hcIl0nKVxuICAgIHRoaXMuX2hpZGRlbiA9IHRoaXMuZWwuY2xvc2VzdCgnW2RhdGEtZXhvPVwiZmllbGRcIl0nKT8ucXVlcnlTZWxlY3RvcignaW5wdXRbdHlwZT1cImhpZGRlblwiXScpXG5cbiAgICBpZiAoIXRoaXMuX3BvcG92ZXIgfHwgIXRoaXMuX2xpc3Rib3gpIHJldHVyblxuXG4gICAgLy8gVG9nZ2xlIGFyaWEtZXhwYW5kZWQgb24gcG9wb3ZlciBvcGVuL2Nsb3NlXG4gICAgdGhpcy5fb25Ub2dnbGUgPSAoKSA9PiB7XG4gICAgICBjb25zdCBvcGVuID0gdGhpcy5fcG9wb3Zlci5tYXRjaGVzKCc6cG9wb3Zlci1vcGVuJylcbiAgICAgIHRoaXMuX3RyaWdnZXIuc2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJywgU3RyaW5nKG9wZW4pKVxuICAgICAgaWYgKG9wZW4pIHtcbiAgICAgICAgLy8gRm9jdXMgc2VsZWN0ZWQgb3IgZmlyc3Qgb3B0aW9uXG4gICAgICAgIGNvbnN0IHNlbGVjdGVkID0gdGhpcy5fbGlzdGJveC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1zZWxlY3RlZF0nKVxuICAgICAgICBjb25zdCBmaXJzdCA9IHRoaXMuX2xpc3Rib3gucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwic2VsZWN0LW9wdGlvblwiXTpub3QoW2RhdGEtZGlzYWJsZWRdKScpXG4gICAgICAgIGNvbnN0IHRhcmdldCA9IHNlbGVjdGVkIHx8IGZpcnN0XG4gICAgICAgIGlmICh0YXJnZXQpIHRhcmdldC5mb2N1cygpXG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX3BvcG92ZXIuYWRkRXZlbnRMaXN0ZW5lcigndG9nZ2xlJywgdGhpcy5fb25Ub2dnbGUpXG5cbiAgICAvLyBDbGljayBvbiBvcHRpb25cbiAgICB0aGlzLl9vbkNsaWNrID0gKGUpID0+IHtcbiAgICAgIGNvbnN0IG9wdCA9IGUudGFyZ2V0LmNsb3Nlc3QoJ1tkYXRhLWV4bz1cInNlbGVjdC1vcHRpb25cIl0nKVxuICAgICAgaWYgKCFvcHQgfHwgb3B0Lmhhc0F0dHJpYnV0ZSgnZGF0YS1kaXNhYmxlZCcpKSByZXR1cm5cbiAgICAgIHRoaXMuX3NlbGVjdE9wdGlvbihvcHQpXG4gICAgfVxuICAgIHRoaXMuX2xpc3Rib3guYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9vbkNsaWNrKVxuXG4gICAgLy8gS2V5Ym9hcmQgbmF2aWdhdGlvblxuICAgIHRoaXMuX29uS2V5ZG93biA9IChlKSA9PiB7XG4gICAgICBjb25zdCBvcHRpb25zID0gWy4uLnRoaXMuX2xpc3Rib3gucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZXhvPVwic2VsZWN0LW9wdGlvblwiXTpub3QoW2RhdGEtZGlzYWJsZWRdKScpXVxuICAgICAgaWYgKCFvcHRpb25zLmxlbmd0aCkgcmV0dXJuXG4gICAgICBjb25zdCBpZHggPSBvcHRpb25zLmluZGV4T2YoZG9jdW1lbnQuYWN0aXZlRWxlbWVudClcbiAgICAgIGxldCBuZXh0ID0gLTFcblxuICAgICAgc3dpdGNoIChlLmtleSkge1xuICAgICAgICBjYXNlICdBcnJvd0Rvd24nOlxuICAgICAgICAgIG5leHQgPSBpZHggPCBvcHRpb25zLmxlbmd0aCAtIDEgPyBpZHggKyAxIDogMFxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgJ0Fycm93VXAnOlxuICAgICAgICAgIG5leHQgPSBpZHggPiAwID8gaWR4IC0gMSA6IG9wdGlvbnMubGVuZ3RoIC0gMVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgJ0hvbWUnOlxuICAgICAgICAgIG5leHQgPSAwXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAnRW5kJzpcbiAgICAgICAgICBuZXh0ID0gb3B0aW9ucy5sZW5ndGggLSAxXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAnRW50ZXInOlxuICAgICAgICBjYXNlICcgJzpcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICBpZiAoaWR4ID49IDApIHRoaXMuX3NlbGVjdE9wdGlvbihvcHRpb25zW2lkeF0pXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIGNhc2UgJ0VzY2FwZSc6XG4gICAgICAgICAgdGhpcy5fcG9wb3Zlci5oaWRlUG9wb3ZlcigpXG4gICAgICAgICAgdGhpcy5fdHJpZ2dlci5mb2N1cygpXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgLy8gVHlwZS1haGVhZDoganVtcCB0byBvcHRpb24gc3RhcnRpbmcgd2l0aCB0eXBlZCBjaGFyYWN0ZXJcbiAgICAgICAgICB0aGlzLl90eXBlQWhlYWQoZS5rZXksIG9wdGlvbnMpXG4gICAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgaWYgKG5leHQgPj0gMCkgb3B0aW9uc1tuZXh0XS5mb2N1cygpXG4gICAgfVxuICAgIHRoaXMuX2xpc3Rib3guYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX29uS2V5ZG93bilcbiAgfSxcblxuICBfc2VsZWN0T3B0aW9uKG9wdCkge1xuICAgIGNvbnN0IHZhbHVlID0gb3B0LmdldEF0dHJpYnV0ZSgnZGF0YS12YWx1ZScpXG4gICAgY29uc3QgdGV4dCA9IG9wdC50ZXh0Q29udGVudC50cmltKClcblxuICAgIC8vIFVwZGF0ZSBoaWRkZW4gaW5wdXRcbiAgICBpZiAodGhpcy5faGlkZGVuKSB7XG4gICAgICB0aGlzLl9oaWRkZW4udmFsdWUgPSB2YWx1ZVxuICAgICAgdGhpcy5faGlkZGVuLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdpbnB1dCcsIHsgYnViYmxlczogdHJ1ZSB9KSlcbiAgICB9XG5cbiAgICAvLyBVcGRhdGUgYXJpYS1zZWxlY3RlZCBhbmQgZGF0YS1zZWxlY3RlZCBvbiBhbGwgb3B0aW9uc1xuICAgIHRoaXMuX2xpc3Rib3gucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZXhvPVwic2VsZWN0LW9wdGlvblwiXScpLmZvckVhY2goKG8pID0+IHtcbiAgICAgIGNvbnN0IGlzU2VsZWN0ZWQgPSBvLmdldEF0dHJpYnV0ZSgnZGF0YS12YWx1ZScpID09PSB2YWx1ZVxuICAgICAgby5zZXRBdHRyaWJ1dGUoJ2FyaWEtc2VsZWN0ZWQnLCBTdHJpbmcoaXNTZWxlY3RlZCkpXG4gICAgICBpZiAoaXNTZWxlY3RlZCkge1xuICAgICAgICBvLnNldEF0dHJpYnV0ZSgnZGF0YS1zZWxlY3RlZCcsICcnKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgby5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtc2VsZWN0ZWQnKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICAvLyBVcGRhdGUgdHJpZ2dlciBkaXNwbGF5IHRleHRcbiAgICBjb25zdCB2YWx1ZUVsID0gdGhpcy5fdHJpZ2dlci5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJzZWxlY3QtdmFsdWVcIl0nKVxuICAgIGlmICh2YWx1ZUVsKSB2YWx1ZUVsLnRleHRDb250ZW50ID0gdGV4dFxuXG4gICAgLy8gQ2xvc2UgcG9wb3ZlclxuICAgIHRoaXMuX3BvcG92ZXIuaGlkZVBvcG92ZXIoKVxuICAgIHRoaXMuX3RyaWdnZXIuZm9jdXMoKVxuICB9LFxuXG4gIF90eXBlQWhlYWQoY2hhciwgb3B0aW9ucykge1xuICAgIGlmIChjaGFyLmxlbmd0aCAhPT0gMSkgcmV0dXJuXG4gICAgY29uc3QgbG93ZXIgPSBjaGFyLnRvTG93ZXJDYXNlKClcbiAgICBjb25zdCBjdXJyZW50SWR4ID0gb3B0aW9ucy5pbmRleE9mKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpXG4gICAgY29uc3Qgc3RhcnQgPSBjdXJyZW50SWR4ICsgMVxuICAgIGNvbnN0IHJvdGF0ZWQgPSBbLi4ub3B0aW9ucy5zbGljZShzdGFydCksIC4uLm9wdGlvbnMuc2xpY2UoMCwgc3RhcnQpXVxuICAgIGNvbnN0IG1hdGNoID0gcm90YXRlZC5maW5kKG8gPT4gby50ZXh0Q29udGVudC50cmltKCkudG9Mb3dlckNhc2UoKS5zdGFydHNXaXRoKGxvd2VyKSlcbiAgICBpZiAobWF0Y2gpIG1hdGNoLmZvY3VzKClcbiAgfSxcblxuICBfdW5iaW5kKCkge1xuICAgIGlmICh0aGlzLl9wb3BvdmVyICYmIHRoaXMuX29uVG9nZ2xlKSB7XG4gICAgICB0aGlzLl9wb3BvdmVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvZ2dsZScsIHRoaXMuX29uVG9nZ2xlKVxuICAgIH1cbiAgICBpZiAodGhpcy5fbGlzdGJveCAmJiB0aGlzLl9vbkNsaWNrKSB7XG4gICAgICB0aGlzLl9saXN0Ym94LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fb25DbGljaylcbiAgICB9XG4gICAgaWYgKHRoaXMuX2xpc3Rib3ggJiYgdGhpcy5fb25LZXlkb3duKSB7XG4gICAgICB0aGlzLl9saXN0Ym94LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLl9vbktleWRvd24pXG4gICAgfVxuICAgIHRoaXMuX3RyaWdnZXIgPSBudWxsXG4gICAgdGhpcy5fcG9wb3ZlciA9IG51bGxcbiAgICB0aGlzLl9saXN0Ym94ID0gbnVsbFxuICAgIHRoaXMuX2hpZGRlbiA9IG51bGxcbiAgICB0aGlzLl9vblRvZ2dsZSA9IG51bGxcbiAgICB0aGlzLl9vbkNsaWNrID0gbnVsbFxuICAgIHRoaXMuX29uS2V5ZG93biA9IG51bGxcbiAgfVxufVxuXG5leHBvcnQgeyBFeG9TZWxlY3QgfVxuIiwgImNvbnN0IEV4b0NvbWJvYm94ID0ge1xuICBtb3VudGVkKCkgeyB0aGlzLl9iaW5kKCkgfSxcbiAgdXBkYXRlZCgpIHsgdGhpcy5fYmluZCgpIH0sXG4gIGRlc3Ryb3llZCgpIHsgdGhpcy5fdW5iaW5kKCkgfSxcbiAgX2JpbmQoKSB7XG4gICAgdGhpcy5fdW5iaW5kKClcbiAgICBjb25zdCBpc0lucHV0VHJpZ2dlciA9IHRoaXMuZWwuZGF0YXNldC50cmlnZ2VyID09PSAnaW5wdXQnXG4gICAgY29uc3QgZmlsdGVyID0gdGhpcy5lbC5kYXRhc2V0LmZpbHRlciB8fCAnc2VydmVyJ1xuICAgIGNvbnN0IG9uRmlsdGVyID0gdGhpcy5lbC5kYXRhc2V0Lm9uRmlsdGVyXG4gICAgY29uc3QgZGVib3VuY2UgPSBwYXJzZUludCh0aGlzLmVsLmRhdGFzZXQuZGVib3VuY2UgfHwgJzMwMCcsIDEwKVxuXG4gICAgdGhpcy5fc2VhcmNoID0gaXNJbnB1dFRyaWdnZXJcbiAgICAgID8gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG8tY29tYm9ib3g9XCJpbnB1dC10cmlnZ2VyXCJdJylcbiAgICAgIDogdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJjb21ib2JveC1zZWFyY2hcIl0nKVxuXG4gICAgY29uc3QgdHJpZ2dlckJ0biA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvLWNvbWJvYm94PVwidHJpZ2dlclwiXScpXG4gICAgY29uc3QgcG9wb3ZlcklkID0gdHJpZ2dlckJ0bj8uZ2V0QXR0cmlidXRlKCdwb3BvdmVydGFyZ2V0JykgfHwgdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJwb3BvdmVyLWNvbnRlbnRcIl0nKT8uaWRcbiAgICB0aGlzLl9wb3BvdmVyID0gcG9wb3ZlcklkID8gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocG9wb3ZlcklkKSA6IG51bGxcbiAgICB0aGlzLl9oaWRkZW4gPSB0aGlzLmVsLmNsb3Nlc3QoJ1tkYXRhLWV4bz1cImZpZWxkXCJdJyk/LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W3R5cGU9XCJoaWRkZW5cIl0nKVxuICAgIHRoaXMuX2xpc3Rib3ggPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tyb2xlPVwibGlzdGJveFwiXScpXG4gICAgdGhpcy5fZW1wdHkgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cImNvbWJvYm94LWVtcHR5XCJdJylcbiAgICB0aGlzLl9jcmVhdGUgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cImNvbWJvYm94LWNyZWF0ZVwiXScpXG5cbiAgICB0aGlzLl9jbGVhciA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwiY29tYm9ib3gtY2xlYXJcIl0nKVxuXG4gICAgaWYgKCF0aGlzLl9wb3BvdmVyKSByZXR1cm5cblxuICAgIC8vIENsZWFyIGJ1dHRvblxuICAgIGlmICh0aGlzLl9jbGVhcikge1xuICAgICAgdGhpcy5fb25DbGVhciA9IChlKSA9PiB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgaWYgKHRoaXMuX2hpZGRlbikge1xuICAgICAgICAgIHRoaXMuX2hpZGRlbi52YWx1ZSA9ICcnXG4gICAgICAgICAgdGhpcy5faGlkZGVuLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdpbnB1dCcsIHsgYnViYmxlczogdHJ1ZSB9KSlcbiAgICAgICAgfVxuICAgICAgICAvLyBSZXNldCB0cmlnZ2VyIGRpc3BsYXlcbiAgICAgICAgY29uc3QgdmFsU3BhbiA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwiY29tYm9ib3gtdmFsdWVcIl0nKVxuICAgICAgICBpZiAodmFsU3BhbikgdmFsU3Bhbi50ZXh0Q29udGVudCA9IHRoaXMuX3NlYXJjaD8ucGxhY2Vob2xkZXIgfHwgJydcbiAgICAgICAgLy8gQ2xlYXIgdmlzdWFsIHNlbGVjdGlvblxuICAgICAgICBpZiAodGhpcy5fbGlzdGJveCkge1xuICAgICAgICAgIHRoaXMuX2xpc3Rib3gucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZXhvPVwiY29tYm9ib3gtb3B0aW9uXCJdJykuZm9yRWFjaChvID0+IHtcbiAgICAgICAgICAgIG8uc2V0QXR0cmlidXRlKCdhcmlhLXNlbGVjdGVkJywgJ2ZhbHNlJylcbiAgICAgICAgICAgIGRlbGV0ZSBvLmRhdGFzZXQuc2VsZWN0ZWRcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLl9jbGVhci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX29uQ2xlYXIpXG4gICAgfVxuXG4gICAgLy8gVG9nZ2xlIGV2ZW50IGZvciBhcmlhLWV4cGFuZGVkXG4gICAgdGhpcy5fb25Ub2dnbGUgPSAoKSA9PiB7XG4gICAgICBjb25zdCBvcGVuID0gdGhpcy5fcG9wb3Zlci5tYXRjaGVzKCc6cG9wb3Zlci1vcGVuJylcbiAgICAgIGlmICh0cmlnZ2VyQnRuKSB0cmlnZ2VyQnRuLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsIFN0cmluZyhvcGVuKSlcbiAgICAgIGlmICh0aGlzLl9zZWFyY2gpIHRoaXMuX3NlYXJjaC5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCBTdHJpbmcob3BlbikpXG4gICAgICBpZiAob3BlbiAmJiB0aGlzLl9zZWFyY2ggJiYgIWlzSW5wdXRUcmlnZ2VyKSB7XG4gICAgICAgIHRoaXMuX3NlYXJjaC52YWx1ZSA9ICcnXG4gICAgICAgIHRoaXMuX3NlYXJjaC5mb2N1cygpXG4gICAgICAgIGlmIChmaWx0ZXIgPT09ICdjbGllbnQnKSB0aGlzLl9jbGllbnRGaWx0ZXIoJycpXG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX3BvcG92ZXIuYWRkRXZlbnRMaXN0ZW5lcigndG9nZ2xlJywgdGhpcy5fb25Ub2dnbGUpXG5cbiAgICAvLyBJbnB1dCB0cmlnZ2VyOiBvcGVuL2Nsb3NlIHZpYSBKU1xuICAgIGlmIChpc0lucHV0VHJpZ2dlciAmJiB0aGlzLl9zZWFyY2gpIHtcbiAgICAgIHRoaXMuX29uRm9jdXMgPSAoKSA9PiB7XG4gICAgICAgIHRyeSB7IHRoaXMuX3BvcG92ZXIuc2hvd1BvcG92ZXIoKSB9IGNhdGNoKF9lcnIpIHt9XG4gICAgICB9XG4gICAgICB0aGlzLl9vbkJsdXIgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBvcG92ZXIgPSB0aGlzLl9wb3BvdmVyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIGlmICghcG9wb3ZlcikgcmV0dXJuXG4gICAgICAgICAgaWYgKCFwb3BvdmVyLmNvbnRhaW5zKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IHRoaXMuX3NlYXJjaCkge1xuICAgICAgICAgICAgdHJ5IHsgcG9wb3Zlci5oaWRlUG9wb3ZlcigpIH0gY2F0Y2goX2Vycikge31cbiAgICAgICAgICB9XG4gICAgICAgIH0sIDIwMClcbiAgICAgIH1cbiAgICAgIHRoaXMuX3NlYXJjaC5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsIHRoaXMuX29uRm9jdXMpXG4gICAgICB0aGlzLl9zZWFyY2guYWRkRXZlbnRMaXN0ZW5lcignYmx1cicsIHRoaXMuX29uQmx1cilcbiAgICB9XG5cbiAgICAvLyBTZWFyY2ggaW5wdXQgaGFuZGxlclxuICAgIGlmICh0aGlzLl9zZWFyY2gpIHtcbiAgICAgIHRoaXMuX29uSW5wdXQgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdGhpcy5fc2VhcmNoLnZhbHVlXG4gICAgICAgIGlmIChmaWx0ZXIgPT09ICdjbGllbnQnKSB7XG4gICAgICAgICAgdGhpcy5fY2xpZW50RmlsdGVyKHF1ZXJ5KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9kZWJvdW5jZVRpbWVyKVxuICAgICAgICAgIHRoaXMuX2RlYm91bmNlVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGlmIChvbkZpbHRlcikgdGhpcy5wdXNoRXZlbnQob25GaWx0ZXIsIHsgcXVlcnkgfSlcbiAgICAgICAgICB9LCBkZWJvdW5jZSlcbiAgICAgICAgfVxuICAgICAgICAvLyBVcGRhdGUgY3JlYXRlIG9wdGlvbiB0ZXh0XG4gICAgICAgIGlmICh0aGlzLl9jcmVhdGUpIHtcbiAgICAgICAgICBjb25zdCBzcGFuID0gdGhpcy5fY3JlYXRlLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cImNvbWJvYm94LWNyZWF0ZS1xdWVyeVwiXScpXG4gICAgICAgICAgaWYgKHNwYW4pIHNwYW4udGV4dENvbnRlbnQgPSBxdWVyeVxuICAgICAgICAgIHRoaXMuX2NyZWF0ZS5oaWRkZW4gPSAhcXVlcnlcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5fc2VhcmNoLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgdGhpcy5fb25JbnB1dClcbiAgICB9XG5cbiAgICAvLyBPcHRpb24gY2xpY2tcbiAgICBpZiAodGhpcy5fbGlzdGJveCkge1xuICAgICAgdGhpcy5fb25DbGljayA9IChlKSA9PiB7XG4gICAgICAgIGNvbnN0IG9wdCA9IGUudGFyZ2V0LmNsb3Nlc3QoJ1tkYXRhLWV4bz1cImNvbWJvYm94LW9wdGlvblwiXTpub3QoW2RhdGEtZGlzYWJsZWRdKScpXG4gICAgICAgIGlmICghb3B0KSByZXR1cm5cbiAgICAgICAgdGhpcy5fc2VsZWN0T3B0aW9uKG9wdClcbiAgICAgIH1cbiAgICAgIHRoaXMuX2xpc3Rib3guYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9vbkNsaWNrKVxuXG4gICAgICAvLyBLZXlib2FyZFxuICAgICAgdGhpcy5fb25LZXlkb3duID0gKGUpID0+IHtcbiAgICAgICAgY29uc3Qgb3B0cyA9IFsuLi50aGlzLl9saXN0Ym94LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWV4bz1cImNvbWJvYm94LW9wdGlvblwiXTpub3QoW2RhdGEtZGlzYWJsZWRdKTpub3QoW2hpZGRlbl0pJyldXG4gICAgICAgIGlmICghb3B0cy5sZW5ndGgpIHJldHVyblxuICAgICAgICBjb25zdCBpZHggPSBvcHRzLmluZGV4T2YoZG9jdW1lbnQuYWN0aXZlRWxlbWVudClcbiAgICAgICAgbGV0IG5leHQgPSAtMVxuICAgICAgICBzd2l0Y2ggKGUua2V5KSB7XG4gICAgICAgICAgY2FzZSAnQXJyb3dEb3duJzogbmV4dCA9IGlkeCA8IG9wdHMubGVuZ3RoIC0gMSA/IGlkeCArIDEgOiAwOyBicmVha1xuICAgICAgICAgIGNhc2UgJ0Fycm93VXAnOiBuZXh0ID0gaWR4ID4gMCA/IGlkeCAtIDEgOiBvcHRzLmxlbmd0aCAtIDE7IGJyZWFrXG4gICAgICAgICAgY2FzZSAnSG9tZSc6IG5leHQgPSAwOyBicmVha1xuICAgICAgICAgIGNhc2UgJ0VuZCc6IG5leHQgPSBvcHRzLmxlbmd0aCAtIDE7IGJyZWFrXG4gICAgICAgICAgY2FzZSAnRW50ZXInOlxuICAgICAgICAgICAgaWYgKGlkeCA+PSAwKSB7IHRoaXMuX3NlbGVjdE9wdGlvbihvcHRzW2lkeF0pOyBlLnByZXZlbnREZWZhdWx0KCkgfVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgY2FzZSAnRXNjYXBlJzpcbiAgICAgICAgICAgIHRyeSB7IHRoaXMuX3BvcG92ZXIuaGlkZVBvcG92ZXIoKSB9IGNhdGNoKF9lcnIpIHt9XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICBkZWZhdWx0OiByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgb3B0c1tuZXh0XT8uZm9jdXMoKVxuICAgICAgfVxuICAgICAgdGhpcy5fcG9wb3Zlci5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5fb25LZXlkb3duKVxuICAgIH1cbiAgfSxcbiAgX2NsaWVudEZpbHRlcihxdWVyeSkge1xuICAgIGlmICghdGhpcy5fbGlzdGJveCkgcmV0dXJuXG4gICAgY29uc3QgcSA9IHF1ZXJ5LnRvTG93ZXJDYXNlKClcbiAgICBsZXQgaGFzVmlzaWJsZSA9IGZhbHNlXG4gICAgdGhpcy5fbGlzdGJveC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1leG89XCJjb21ib2JveC1vcHRpb25cIl0nKS5mb3JFYWNoKG9wdCA9PiB7XG4gICAgICBjb25zdCBtYXRjaCA9ICFxIHx8IG9wdC50ZXh0Q29udGVudC50cmltKCkudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhxKVxuICAgICAgb3B0LmhpZGRlbiA9ICFtYXRjaFxuICAgICAgaWYgKG1hdGNoKSBoYXNWaXNpYmxlID0gdHJ1ZVxuICAgIH0pXG4gICAgaWYgKHRoaXMuX2VtcHR5KSB0aGlzLl9lbXB0eS5oaWRkZW4gPSBoYXNWaXNpYmxlXG4gIH0sXG4gIF9zZWxlY3RPcHRpb24ob3B0KSB7XG4gICAgY29uc3QgdmFsdWUgPSBvcHQuZGF0YXNldC52YWx1ZVxuICAgIGlmICh0aGlzLl9oaWRkZW4pIHtcbiAgICAgIHRoaXMuX2hpZGRlbi52YWx1ZSA9IHZhbHVlXG4gICAgICB0aGlzLl9oaWRkZW4uZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2lucHV0JywgeyBidWJibGVzOiB0cnVlIH0pKVxuICAgIH1cbiAgICAvLyBVcGRhdGUgdmlzdWFsIHN0YXRlXG4gICAgaWYgKHRoaXMuX2xpc3Rib3gpIHtcbiAgICAgIHRoaXMuX2xpc3Rib3gucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZXhvPVwiY29tYm9ib3gtb3B0aW9uXCJdJykuZm9yRWFjaChvID0+IHtcbiAgICAgICAgby5zZXRBdHRyaWJ1dGUoJ2FyaWEtc2VsZWN0ZWQnLCBTdHJpbmcoby5kYXRhc2V0LnZhbHVlID09PSB2YWx1ZSkpXG4gICAgICAgIGlmIChvLmRhdGFzZXQudmFsdWUgPT09IHZhbHVlKSBvLmRhdGFzZXQuc2VsZWN0ZWQgPSAnJ1xuICAgICAgICBlbHNlIGRlbGV0ZSBvLmRhdGFzZXQuc2VsZWN0ZWRcbiAgICAgIH0pXG4gICAgfVxuICAgIC8vIFVwZGF0ZSB0cmlnZ2VyIGRpc3BsYXlcbiAgICBjb25zdCB2YWxTcGFuID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJjb21ib2JveC12YWx1ZVwiXScpXG4gICAgaWYgKHZhbFNwYW4pIHZhbFNwYW4udGV4dENvbnRlbnQgPSBvcHQudGV4dENvbnRlbnQudHJpbSgpXG4gICAgLy8gQ2xvc2UgKHVubGVzcyBtdWx0aXBsZSlcbiAgICBpZiAoIXRoaXMuZWwuZGF0YXNldC5tdWx0aXBsZSkge1xuICAgICAgdHJ5IHsgdGhpcy5fcG9wb3Zlcj8uaGlkZVBvcG92ZXIoKSB9IGNhdGNoKF9lcnIpIHt9XG4gICAgfVxuICB9LFxuICBfdW5iaW5kKCkge1xuICAgIGNsZWFyVGltZW91dCh0aGlzLl9kZWJvdW5jZVRpbWVyKVxuICAgIHRoaXMuX2RlYm91bmNlVGltZXIgPSBudWxsXG4gICAgaWYgKHRoaXMuX3BvcG92ZXIpIHtcbiAgICAgIGlmICh0aGlzLl9vblRvZ2dsZSkgdGhpcy5fcG9wb3Zlci5yZW1vdmVFdmVudExpc3RlbmVyKCd0b2dnbGUnLCB0aGlzLl9vblRvZ2dsZSlcbiAgICAgIGlmICh0aGlzLl9vbktleWRvd24pIHRoaXMuX3BvcG92ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX29uS2V5ZG93bilcbiAgICB9XG4gICAgaWYgKHRoaXMuX2xpc3Rib3ggJiYgdGhpcy5fb25DbGljaykgdGhpcy5fbGlzdGJveC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX29uQ2xpY2spXG4gICAgaWYgKHRoaXMuX3NlYXJjaCkge1xuICAgICAgaWYgKHRoaXMuX29uSW5wdXQpIHRoaXMuX3NlYXJjaC5yZW1vdmVFdmVudExpc3RlbmVyKCdpbnB1dCcsIHRoaXMuX29uSW5wdXQpXG4gICAgICBpZiAodGhpcy5fb25Gb2N1cykgdGhpcy5fc2VhcmNoLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgdGhpcy5fb25Gb2N1cylcbiAgICAgIGlmICh0aGlzLl9vbkJsdXIpIHRoaXMuX3NlYXJjaC5yZW1vdmVFdmVudExpc3RlbmVyKCdibHVyJywgdGhpcy5fb25CbHVyKVxuICAgIH1cbiAgICBpZiAodGhpcy5fY2xlYXIgJiYgdGhpcy5fb25DbGVhcikgdGhpcy5fY2xlYXIucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9vbkNsZWFyKVxuICAgIHRoaXMuX3BvcG92ZXIgPSBudWxsXG4gICAgdGhpcy5fbGlzdGJveCA9IG51bGxcbiAgICB0aGlzLl9zZWFyY2ggPSBudWxsXG4gICAgdGhpcy5fY2xlYXIgPSBudWxsXG4gICAgdGhpcy5fZW1wdHkgPSBudWxsXG4gICAgdGhpcy5fY3JlYXRlID0gbnVsbFxuICAgIHRoaXMuX2hpZGRlbiA9IG51bGxcbiAgfVxufVxuXG5leHBvcnQgeyBFeG9Db21ib2JveCB9XG4iLCAibGV0IGxhc3RIaWRlVGltZSA9IDBcbmNvbnN0IFNLSVBfREVMQVlfTVMgPSAzMDBcbmNvbnN0IGhhc0FuY2hvclBvcyA9XG4gIHR5cGVvZiBDU1MgIT09ICd1bmRlZmluZWQnICYmIENTUy5zdXBwb3J0cygncG9zaXRpb24tYXJlYScsICd0b3AnKVxuXG5jb25zdCBHQVAgPSA0IC8vIG1hdGNoZXMgdmFyKC0tZXhvLXNwYWNlLTEpXG5cbmNvbnN0IEV4b1Rvb2x0aXAgPSB7XG4gIG1vdW50ZWQoKSB7XG4gICAgY29uc3Qgd3JhcHBlciA9IHRoaXMuZWxcbiAgICBjb25zdCBhbmNob3IgPSB3cmFwcGVyLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cInRvb2x0aXAtYW5jaG9yXCJdJylcbiAgICBjb25zdCBjb250ZW50ID0gd3JhcHBlci5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJ0b29sdGlwLWNvbnRlbnRcIl0nKVxuICAgIGlmICghYW5jaG9yIHx8ICFjb250ZW50KSByZXR1cm5cblxuICAgIHRoaXMuX2FuY2hvciA9IGFuY2hvclxuICAgIHRoaXMuX2NvbnRlbnQgPSBjb250ZW50XG4gICAgdGhpcy5fdGltZW91dCA9IG51bGxcbiAgICB0aGlzLl9kZWNsYXJlZFNpZGUgPSBjb250ZW50LmRhdGFzZXQuc2lkZVxuICAgIHRoaXMuX2RlbGF5ID0gcGFyc2VJbnQoY29udGVudC5kYXRhc2V0LmRlbGF5KSB8fCA1MDBcblxuICAgIC8vIFVwZ3JhZGUgdG8gcG9wb3ZlciBBUEkgXHUyMDE0IGVuYWJsZXMgdG9wLWxheWVyIHJlbmRlcmluZy5cbiAgICAvLyBCZWZvcmUgdGhpcywgQ1NTLW9ubHkgOmhvdmVyIGZhbGxiYWNrIGtlZXBzIHRoZSB0b29sdGlwIGZ1bmN0aW9uYWwuXG4gICAgY29udGVudC5zZXRBdHRyaWJ1dGUoJ3BvcG92ZXInLCAnbWFudWFsJylcblxuICAgIGNvbnN0IHNob3cgPSAoKSA9PiB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fdGltZW91dClcbiAgICAgIGNvbnN0IGVsYXBzZWQgPSBEYXRlLm5vdygpIC0gbGFzdEhpZGVUaW1lXG4gICAgICBjb25zdCB3YWl0ID0gZWxhcHNlZCA8IFNLSVBfREVMQVlfTVMgPyAwIDogdGhpcy5fZGVsYXlcbiAgICAgIHRoaXMuX3RpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdHJ5IHsgY29udGVudC5zaG93UG9wb3ZlcigpIH0gY2F0Y2ggKF8pIHsgcmV0dXJuIH1cbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgICBpZiAoIWhhc0FuY2hvclBvcykgdGhpcy5fcG9zaXRpb25GYWxsYmFjaygpXG4gICAgICAgICAgdGhpcy5fZGV0ZWN0RmxpcCgpXG4gICAgICAgIH0pXG4gICAgICB9LCB3YWl0KVxuICAgIH1cblxuICAgIGNvbnN0IGhpZGUgPSAoKSA9PiB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fdGltZW91dClcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChjb250ZW50Lm1hdGNoZXMoJzpwb3BvdmVyLW9wZW4nKSkge1xuICAgICAgICAgIGNvbnRlbnQuaGlkZVBvcG92ZXIoKVxuICAgICAgICAgIGxhc3RIaWRlVGltZSA9IERhdGUubm93KClcbiAgICAgICAgICBjb250ZW50LmRhdGFzZXQuc2lkZSA9IHRoaXMuX2RlY2xhcmVkU2lkZVxuICAgICAgICAgIGlmICghaGFzQW5jaG9yUG9zKSB7XG4gICAgICAgICAgICBjb250ZW50LnN0eWxlLnRvcCA9ICcnXG4gICAgICAgICAgICBjb250ZW50LnN0eWxlLmxlZnQgPSAnJ1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoXykge31cbiAgICB9XG5cbiAgICB3cmFwcGVyLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCB0aGlzLl9zaG93ID0gKCkgPT4gc2hvdygpKVxuICAgIHdyYXBwZXIuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIHRoaXMuX2hpZGUgPSAoKSA9PiBoaWRlKCkpXG4gICAgYW5jaG9yLmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzaW4nLCB0aGlzLl9mb2N1c0luID0gKCkgPT4gc2hvdygpKVxuICAgIGFuY2hvci5hZGRFdmVudExpc3RlbmVyKCdmb2N1c291dCcsIHRoaXMuX2ZvY3VzT3V0ID0gKGUpID0+IHtcbiAgICAgIGlmICghd3JhcHBlci5jb250YWlucyhlLnJlbGF0ZWRUYXJnZXQpKSBoaWRlKClcbiAgICB9KVxuICAgIHdyYXBwZXIuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX2tleWRvd24gPSAoZSkgPT4ge1xuICAgICAgaWYgKGUua2V5ID09PSAnRXNjYXBlJykgaGlkZSgpXG4gICAgfSlcbiAgfSxcblxuICAvKiogRGV0ZWN0IGlmIGFuY2hvciBwb3NpdGlvbmluZyBmbGlwcGVkIHRoZSBzaWRlIGFuZCB1cGRhdGUgZGF0YS1zaWRlIGZvciBhcnJvdyBDU1MuICovXG4gIF9kZXRlY3RGbGlwKCkge1xuICAgIGNvbnN0IGFyID0gdGhpcy5fYW5jaG9yLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgY29uc3QgY3IgPSB0aGlzLl9jb250ZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgbGV0IGFjdHVhbFxuICAgIGlmIChjci5ib3R0b20gPD0gYXIudG9wICsgMSkgYWN0dWFsID0gJ3RvcCdcbiAgICBlbHNlIGlmIChjci50b3AgPj0gYXIuYm90dG9tIC0gMSkgYWN0dWFsID0gJ2JvdHRvbSdcbiAgICBlbHNlIGlmIChjci5yaWdodCA8PSBhci5sZWZ0ICsgMSkgYWN0dWFsID0gJ2xlZnQnXG4gICAgZWxzZSBpZiAoY3IubGVmdCA+PSBhci5yaWdodCAtIDEpIGFjdHVhbCA9ICdyaWdodCdcbiAgICBlbHNlIGFjdHVhbCA9IHRoaXMuX2RlY2xhcmVkU2lkZVxuICAgIHRoaXMuX2NvbnRlbnQuZGF0YXNldC5zaWRlID0gYWN0dWFsXG4gIH0sXG5cbiAgLyoqIEpTIHBvc2l0aW9uaW5nIGZvciBicm93c2VycyB3aXRob3V0IENTUyBhbmNob3IgcG9zaXRpb25pbmcgKFNhZmFyaSkuICovXG4gIF9wb3NpdGlvbkZhbGxiYWNrKCkge1xuICAgIGNvbnN0IGFyID0gdGhpcy5fYW5jaG9yLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgY29uc3QgY3cgPSB0aGlzLl9jb250ZW50Lm9mZnNldFdpZHRoXG4gICAgY29uc3QgY2ggPSB0aGlzLl9jb250ZW50Lm9mZnNldEhlaWdodFxuICAgIGNvbnN0IHNpZGUgPSB0aGlzLl9kZWNsYXJlZFNpZGVcbiAgICBjb25zdCBhbGlnbiA9IHRoaXMuX2NvbnRlbnQuZGF0YXNldC5hbGlnbiB8fCAnY2VudGVyJ1xuICAgIGxldCB0b3AsIGxlZnRcblxuICAgIGlmIChzaWRlID09PSAndG9wJyB8fCBzaWRlID09PSAnYm90dG9tJykge1xuICAgICAgdG9wID0gc2lkZSA9PT0gJ3RvcCcgPyBhci50b3AgLSBjaCAtIEdBUCA6IGFyLmJvdHRvbSArIEdBUFxuICAgICAgaWYgKGFsaWduID09PSAnc3RhcnQnKSBsZWZ0ID0gYXIubGVmdFxuICAgICAgZWxzZSBpZiAoYWxpZ24gPT09ICdlbmQnKSBsZWZ0ID0gYXIucmlnaHQgLSBjd1xuICAgICAgZWxzZSBsZWZ0ID0gYXIubGVmdCArIChhci53aWR0aCAtIGN3KSAvIDJcbiAgICB9IGVsc2Uge1xuICAgICAgbGVmdCA9IHNpZGUgPT09ICdsZWZ0JyA/IGFyLmxlZnQgLSBjdyAtIEdBUCA6IGFyLnJpZ2h0ICsgR0FQXG4gICAgICB0b3AgPSBhci50b3AgKyAoYXIuaGVpZ2h0IC0gY2gpIC8gMlxuICAgIH1cblxuICAgIHRoaXMuX2NvbnRlbnQuc3R5bGUudG9wID0gYCR7dG9wfXB4YFxuICAgIHRoaXMuX2NvbnRlbnQuc3R5bGUubGVmdCA9IGAke2xlZnR9cHhgXG4gIH0sXG5cbiAgZGVzdHJveWVkKCkge1xuICAgIGNsZWFyVGltZW91dCh0aGlzLl90aW1lb3V0KVxuICB9XG59XG5cbmV4cG9ydCB7IEV4b1Rvb2x0aXAgfVxuIiwgImNvbnN0IEV4b0hvdmVyQ2FyZCA9IHtcbiAgbW91bnRlZCgpIHtcbiAgICB0aGlzLnRyaWdnZXIgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cImhvdmVyLWNhcmQtdHJpZ2dlclwiXScpXG4gICAgdGhpcy5jb250ZW50ID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJob3Zlci1jYXJkLWNvbnRlbnRcIl0nKVxuICAgIGlmICghdGhpcy50cmlnZ2VyIHx8ICF0aGlzLmNvbnRlbnQpIHJldHVyblxuXG4gICAgdGhpcy5fc2hvd1RpbWVvdXQgPSBudWxsXG4gICAgdGhpcy5faGlkZVRpbWVvdXQgPSBudWxsXG5cbiAgICBjb25zdCBzaG93ID0gKCkgPT4ge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2hpZGVUaW1lb3V0KVxuICAgICAgdGhpcy5fc2hvd1RpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5jb250ZW50LnNldEF0dHJpYnV0ZShcImRhdGEtb3BlblwiLCBcIlwiKVxuICAgICAgfSwgMzAwKVxuICAgIH1cblxuICAgIGNvbnN0IGhpZGUgPSAoKSA9PiB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fc2hvd1RpbWVvdXQpXG4gICAgICB0aGlzLl9oaWRlVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmNvbnRlbnQucmVtb3ZlQXR0cmlidXRlKFwiZGF0YS1vcGVuXCIpXG4gICAgICB9LCAyMDApXG4gICAgfVxuXG4gICAgdGhpcy50cmlnZ2VyLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsIHNob3cpXG4gICAgdGhpcy50cmlnZ2VyLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsIGhpZGUpXG4gICAgdGhpcy5jb250ZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsICgpID0+IGNsZWFyVGltZW91dCh0aGlzLl9oaWRlVGltZW91dCkpXG4gICAgdGhpcy5jb250ZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsIGhpZGUpXG4gICAgdGhpcy50cmlnZ2VyLmFkZEV2ZW50TGlzdGVuZXIoXCJmb2N1c1wiLCBzaG93KVxuICAgIHRoaXMudHJpZ2dlci5hZGRFdmVudExpc3RlbmVyKFwiYmx1clwiLCBoaWRlKVxuXG4gICAgdGhpcy5fY2xlYW51cCA9ICgpID0+IHtcbiAgICAgIHRoaXMudHJpZ2dlci5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCBzaG93KVxuICAgICAgdGhpcy50cmlnZ2VyLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsIGhpZGUpXG4gICAgICB0aGlzLnRyaWdnZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImZvY3VzXCIsIHNob3cpXG4gICAgICB0aGlzLnRyaWdnZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImJsdXJcIiwgaGlkZSlcbiAgICB9XG4gIH0sXG5cbiAgZGVzdHJveWVkKCkge1xuICAgIGlmICh0aGlzLl9jbGVhbnVwKSB0aGlzLl9jbGVhbnVwKClcbiAgICBjbGVhclRpbWVvdXQodGhpcy5fc2hvd1RpbWVvdXQpXG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuX2hpZGVUaW1lb3V0KVxuICB9XG59XG5cbmV4cG9ydCB7IEV4b0hvdmVyQ2FyZCB9XG4iLCAiY29uc3QgRXhvQ29udGV4dE1lbnUgPSB7XG4gIG1vdW50ZWQoKSB7XG4gICAgdGhpcy50cmlnZ2VyID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJjb250ZXh0LW1lbnUtdHJpZ2dlclwiXScpXG4gICAgdGhpcy5tZW51ID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJjb250ZXh0LW1lbnUtY29udGVudFwiXScpXG4gICAgaWYgKCF0aGlzLnRyaWdnZXIgfHwgIXRoaXMubWVudSkgcmV0dXJuXG5cbiAgICB0aGlzLnRyaWdnZXIuYWRkRXZlbnRMaXN0ZW5lcihcImNvbnRleHRtZW51XCIsIHRoaXMuX29uQ29udGV4dCA9IChlKSA9PiB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIHRoaXMubWVudS5zdHlsZS5sZWZ0ID0gZS5jbGllbnRYICsgXCJweFwiXG4gICAgICB0aGlzLm1lbnUuc3R5bGUudG9wID0gZS5jbGllbnRZICsgXCJweFwiXG4gICAgICB0aGlzLm1lbnUuc2V0QXR0cmlidXRlKFwiZGF0YS1vcGVuXCIsIFwiXCIpXG5cbiAgICAgIGNvbnN0IGNsb3NlID0gKGV2KSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5tZW51LmNvbnRhaW5zKGV2LnRhcmdldCkpIHtcbiAgICAgICAgICB0aGlzLm1lbnUucmVtb3ZlQXR0cmlidXRlKFwiZGF0YS1vcGVuXCIpXG4gICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGNsb3NlKVxuICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjb250ZXh0bWVudVwiLCBjbG9zZSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBjbG9zZSlcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNvbnRleHRtZW51XCIsIGNsb3NlKVxuICAgICAgfSwgMClcbiAgICB9KVxuXG4gICAgdGhpcy5tZW51LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLl9vbkl0ZW1DbGljayA9IChlKSA9PiB7XG4gICAgICBjb25zdCBpdGVtID0gZS50YXJnZXQuY2xvc2VzdCgnW2RhdGEtZXhvPVwiY29udGV4dC1tZW51LWl0ZW1cIl0nKVxuICAgICAgaWYgKGl0ZW0gJiYgIWl0ZW0uZGlzYWJsZWQpIHtcbiAgICAgICAgdGhpcy5tZW51LnJlbW92ZUF0dHJpYnV0ZShcImRhdGEtb3BlblwiKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIHRoaXMuX29uS2V5ZG93biA9IChlKSA9PiB7XG4gICAgICBpZiAoZS5rZXkgPT09IFwiRXNjYXBlXCIpIHRoaXMubWVudS5yZW1vdmVBdHRyaWJ1dGUoXCJkYXRhLW9wZW5cIilcbiAgICB9KVxuICB9LFxuXG4gIGRlc3Ryb3llZCgpIHtcbiAgICBpZiAodGhpcy50cmlnZ2VyICYmIHRoaXMuX29uQ29udGV4dCkgdGhpcy50cmlnZ2VyLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjb250ZXh0bWVudVwiLCB0aGlzLl9vbkNvbnRleHQpXG4gIH1cbn1cblxuZXhwb3J0IHsgRXhvQ29udGV4dE1lbnUgfVxuIiwgImltcG9ydCB7IEV4b0FjY29yZGlvbiB9IGZyb20gJy4vaG9va3MvYWNjb3JkaW9uLmpzJ1xuaW1wb3J0IHsgRXhvQ2Fyb3VzZWwgfSBmcm9tICcuL2hvb2tzL2Nhcm91c2VsLmpzJ1xuaW1wb3J0IHsgRXhvQ29sbGFwc2libGUgfSBmcm9tICcuL2hvb2tzL2NvbGxhcHNpYmxlLmpzJ1xuaW1wb3J0IHsgRXhvQ29tbWFuZFBhbGV0dGUgfSBmcm9tICcuL2hvb2tzL2NvbW1hbmRfcGFsZXR0ZS5qcydcbmltcG9ydCB7IEV4b1NpZGViYXIgfSBmcm9tICcuL2hvb2tzL3NpZGViYXIuanMnXG5pbXBvcnQgeyBFeG9UaGVtZVRvZ2dsZSB9IGZyb20gJy4vaG9va3MvdGhlbWVfdG9nZ2xlLmpzJ1xuaW1wb3J0IHsgRXhvUG9wb3ZlciB9IGZyb20gJy4vaG9va3MvcG9wb3Zlci5qcydcbmltcG9ydCB7IEV4b0Ryb3Bkb3duTWVudSB9IGZyb20gJy4vaG9va3MvZHJvcGRvd25fbWVudS5qcydcbmltcG9ydCB7IEV4b1NlbGVjdCB9IGZyb20gJy4vaG9va3Mvc2VsZWN0LmpzJ1xuaW1wb3J0IHsgRXhvQ29tYm9ib3ggfSBmcm9tICcuL2hvb2tzL2NvbWJvYm94LmpzJ1xuaW1wb3J0IHsgRXhvVG9vbHRpcCB9IGZyb20gJy4vaG9va3MvdG9vbHRpcC5qcydcbmltcG9ydCB7IEV4b0hvdmVyQ2FyZCB9IGZyb20gJy4vaG9va3MvaG92ZXJfY2FyZC5qcydcbmltcG9ydCB7IEV4b0NvbnRleHRNZW51IH0gZnJvbSAnLi9ob29rcy9jb250ZXh0X21lbnUuanMnXG5cbmNvbnN0IGhvb2tzID0ge1xuICBFeG9BY2NvcmRpb24sXG4gIEV4b0Nhcm91c2VsLFxuICBFeG9Db2xsYXBzaWJsZSxcbiAgRXhvQ29tbWFuZFBhbGV0dGUsXG4gIEV4b1NpZGViYXIsXG4gIEV4b1RoZW1lVG9nZ2xlLFxuICBFeG9Qb3BvdmVyLFxuICBFeG9Ecm9wZG93bk1lbnUsXG4gIEV4b1NlbGVjdCxcbiAgRXhvQ29tYm9ib3gsXG4gIEV4b1Rvb2x0aXAsXG4gIEV4b0hvdmVyQ2FyZCxcbiAgRXhvQ29udGV4dE1lbnVcbn1cblxuZXhwb3J0IHsgaG9va3MgfVxuIiwgImltcG9ydCB7IGhvb2tzIGFzIGV4b0hvb2tzIH0gZnJvbSBcIi4uLy4uLy4uL2Fzc2V0cy9qcy9pbmRleC5qc1wiXG5cbndpbmRvdy5zdG9yeWJvb2sgPSB7XG4gIEhvb2tzOiBleG9Ib29rcyxcbiAgUGFyYW1zOiB7fSxcbiAgVXBsb2FkZXJzOiB7fVxufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7QUFhQSxNQUFNLGVBQWU7QUFBQSxJQUNuQixVQUFVO0FBQ1IsV0FBSyxZQUFZLE1BQ2YsTUFBTSxLQUFLLEtBQUssR0FBRyxpQkFBaUIsZ0RBQWdELENBQUM7QUFFdkYsV0FBSyxjQUFjLE1BQ2pCLE1BQU0sS0FBSyxLQUFLLEdBQUcsaUJBQWlCLDhDQUE4QyxDQUFDO0FBRXJGLFdBQUssWUFBWSxNQUFNLEtBQUssR0FBRyxRQUFRLFNBQVM7QUFDaEQsV0FBSyxpQkFBaUIsTUFBTSxLQUFLLEdBQUcsYUFBYSxrQkFBa0I7QUFHbkUsV0FBSyxHQUFHLGlCQUFpQixXQUFXLEtBQUssYUFBYSxDQUFDLE1BQU07QUFDM0QsY0FBTSxVQUFVLEVBQUUsT0FBTyxRQUFRLGdDQUFnQztBQUNqRSxZQUFJLENBQUMsUUFBUztBQUVkLGNBQU0sV0FBVyxLQUFLLFVBQVU7QUFDaEMsY0FBTSxNQUFNLFNBQVMsUUFBUSxPQUFPO0FBQ3BDLFlBQUksUUFBUSxHQUFJO0FBRWhCLFlBQUksU0FBUztBQUViLGdCQUFRLEVBQUUsS0FBSztBQUFBLFVBQ2IsS0FBSztBQUNILHFCQUFTLFVBQVUsTUFBTSxLQUFLLFNBQVMsTUFBTTtBQUM3QztBQUFBLFVBQ0YsS0FBSztBQUNILHFCQUFTLFVBQVUsTUFBTSxJQUFJLFNBQVMsVUFBVSxTQUFTLE1BQU07QUFDL0Q7QUFBQSxVQUNGLEtBQUs7QUFDSCxxQkFBUyxTQUFTLENBQUM7QUFDbkI7QUFBQSxVQUNGLEtBQUs7QUFDSCxxQkFBUyxTQUFTLFNBQVMsU0FBUyxDQUFDO0FBQ3JDO0FBQUEsVUFDRjtBQUNFO0FBQUEs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
