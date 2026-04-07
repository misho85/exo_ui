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
      if (valueEl) {
        valueEl.textContent = text;
        valueEl.removeAttribute("data-placeholder");
      }
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
          if (valSpan) {
            valSpan.textContent = this._search?.placeholder || "";
            valSpan.setAttribute("data-placeholder", "");
          }
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
      if (valSpan) {
        valSpan.textContent = opt.textContent.trim();
        valSpan.removeAttribute("data-placeholder");
      }
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vYXNzZXRzL2pzL2hvb2tzL2FjY29yZGlvbi5qcyIsICIuLi8uLi8uLi8uLi9hc3NldHMvanMvaG9va3MvY2Fyb3VzZWwuanMiLCAiLi4vLi4vLi4vLi4vYXNzZXRzL2pzL2hvb2tzL2NvbGxhcHNpYmxlLmpzIiwgIi4uLy4uLy4uLy4uL2Fzc2V0cy9qcy9ob29rcy9jb21tYW5kX3BhbGV0dGUuanMiLCAiLi4vLi4vLi4vLi4vYXNzZXRzL2pzL2hvb2tzL3NpZGViYXIuanMiLCAiLi4vLi4vLi4vLi4vYXNzZXRzL2pzL2hvb2tzL3RoZW1lX3RvZ2dsZS5qcyIsICIuLi8uLi8uLi8uLi9hc3NldHMvanMvaG9va3MvcG9wb3Zlci5qcyIsICIuLi8uLi8uLi8uLi9hc3NldHMvanMvaG9va3MvZHJvcGRvd25fbWVudS5qcyIsICIuLi8uLi8uLi8uLi9hc3NldHMvanMvaG9va3Mvc2VsZWN0LmpzIiwgIi4uLy4uLy4uLy4uL2Fzc2V0cy9qcy9ob29rcy9jb21ib2JveC5qcyIsICIuLi8uLi8uLi8uLi9hc3NldHMvanMvaG9va3MvdG9vbHRpcC5qcyIsICIuLi8uLi8uLi8uLi9hc3NldHMvanMvaG9va3MvaG92ZXJfY2FyZC5qcyIsICIuLi8uLi8uLi8uLi9hc3NldHMvanMvaG9va3MvY29udGV4dF9tZW51LmpzIiwgIi4uLy4uLy4uLy4uL2Fzc2V0cy9qcy9pbmRleC5qcyIsICIuLi8uLi8uLi9hc3NldHMvanMvc3Rvcnlib29rLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKipcbiAqIEV4b0FjY29yZGlvbiBob29rIFx1MjAxNCBrZXlib2FyZCBuYXZpZ2F0aW9uICsgc2luZ2xlLW9wZW4gZW5mb3JjZW1lbnQuXG4gKlxuICogUmVhZHMgZGF0YS10eXBlIChcInNpbmdsZVwifFwibXVsdGlwbGVcIikgYW5kIGRhdGEtY29sbGFwc2libGUgZnJvbSB0aGUgcm9vdCBlbGVtZW50LlxuICogLSBzaW5nbGU6IG9ubHkgb25lIGl0ZW0gb3BlbiBhdCBhIHRpbWVcbiAqIC0gbXVsdGlwbGU6IGFueSBudW1iZXIgb2YgaXRlbXMgb3BlbiAoZGVmYXVsdCBjaGVja2JveCBiZWhhdmlvcilcbiAqIC0gY29sbGFwc2libGU6IGluIHNpbmdsZSBtb2RlLCBhbGxvd3MgY2xvc2luZyB0aGUgb3BlbiBpdGVtXG4gKlxuICogS2V5Ym9hcmQ6XG4gKiAgIEFycm93RG93biAvIEFycm93VXAgXHUyMDE0IG1vdmUgZm9jdXMgYmV0d2VlbiB0cmlnZ2Vyc1xuICogICBIb21lIC8gRW5kIFx1MjAxNCBmb2N1cyBmaXJzdCAvIGxhc3QgdHJpZ2dlclxuICogICBFbnRlciAvIFNwYWNlIFx1MjAxNCB0b2dnbGUgaXRlbSAoaGFuZGxlZCBuYXRpdmVseSBieSBidXR0b24sIGJ1dCB3ZSBtYW5hZ2Ugc2luZ2xlLW1vZGUpXG4gKi9cbmNvbnN0IEV4b0FjY29yZGlvbiA9IHtcbiAgbW91bnRlZCgpIHtcbiAgICB0aGlzLl90cmlnZ2VycyA9ICgpID0+XG4gICAgICBBcnJheS5mcm9tKHRoaXMuZWwucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZXhvPVwiYWNjb3JkaW9uLXRyaWdnZXJcIl06bm90KFtkaXNhYmxlZF0pJykpXG5cbiAgICB0aGlzLl9jaGVja2JveGVzID0gKCkgPT5cbiAgICAgIEFycmF5LmZyb20odGhpcy5lbC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1leG89XCJhY2NvcmRpb24tc3RhdGVcIl06bm90KFtkaXNhYmxlZF0pJykpXG5cbiAgICB0aGlzLl9pc1NpbmdsZSA9ICgpID0+IHRoaXMuZWwuZGF0YXNldC50eXBlID09PSBcInNpbmdsZVwiXG4gICAgdGhpcy5faXNDb2xsYXBzaWJsZSA9ICgpID0+IHRoaXMuZWwuaGFzQXR0cmlidXRlKFwiZGF0YS1jb2xsYXBzaWJsZVwiKVxuXG4gICAgLy8gS2V5Ym9hcmQgbmF2aWdhdGlvblxuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5fb25LZXlkb3duID0gKGUpID0+IHtcbiAgICAgIGNvbnN0IHRyaWdnZXIgPSBlLnRhcmdldC5jbG9zZXN0KCdbZGF0YS1leG89XCJhY2NvcmRpb24tdHJpZ2dlclwiXScpXG4gICAgICBpZiAoIXRyaWdnZXIpIHJldHVyblxuXG4gICAgICBjb25zdCB0cmlnZ2VycyA9IHRoaXMuX3RyaWdnZXJzKClcbiAgICAgIGNvbnN0IGlkeCA9IHRyaWdnZXJzLmluZGV4T2YodHJpZ2dlcilcbiAgICAgIGlmIChpZHggPT09IC0xKSByZXR1cm5cblxuICAgICAgbGV0IHRhcmdldCA9IG51bGxcblxuICAgICAgc3dpdGNoIChlLmtleSkge1xuICAgICAgICBjYXNlIFwiQXJyb3dEb3duXCI6XG4gICAgICAgICAgdGFyZ2V0ID0gdHJpZ2dlcnNbKGlkeCArIDEpICUgdHJpZ2dlcnMubGVuZ3RoXVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgXCJBcnJvd1VwXCI6XG4gICAgICAgICAgdGFyZ2V0ID0gdHJpZ2dlcnNbKGlkeCAtIDEgKyB0cmlnZ2Vycy5sZW5ndGgpICUgdHJpZ2dlcnMubGVuZ3RoXVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgXCJIb21lXCI6XG4gICAgICAgICAgdGFyZ2V0ID0gdHJpZ2dlcnNbMF1cbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIFwiRW5kXCI6XG4gICAgICAgICAgdGFyZ2V0ID0gdHJpZ2dlcnNbdHJpZ2dlcnMubGVuZ3RoIC0gMV1cbiAgICAgICAgICBicmVha1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBpZiAodGFyZ2V0KSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICB0YXJnZXQuZm9jdXMoKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICAvLyBDbGljayBoYW5kbGluZyBmb3Igc2luZ2xlIG1vZGUgKyBjb2xsYXBzaWJsZSArIGFyaWEtZXhwYW5kZWQgc3luY1xuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuX29uQ2xpY2sgPSAoZSkgPT4ge1xuICAgICAgY29uc3QgdHJpZ2dlciA9IGUudGFyZ2V0LmNsb3Nlc3QoJ1tkYXRhLWV4bz1cImFjY29yZGlvbi10cmlnZ2VyXCJdJylcbiAgICAgIGlmICghdHJpZ2dlciB8fCB0cmlnZ2VyLmRpc2FibGVkKSByZXR1cm5cblxuICAgICAgY29uc3QgaXRlbSA9IHRyaWdnZXIuY2xvc2VzdCgnW2RhdGEtZXhvPVwiYWNjb3JkaW9uLWl0ZW1cIl0nKVxuICAgICAgY29uc3QgY2hlY2tib3ggPSBpdGVtPy5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJhY2NvcmRpb24tc3RhdGVcIl0nKVxuICAgICAgaWYgKCFjaGVja2JveCkgcmV0dXJuXG5cbiAgICAgIGNvbnN0IHdhc0NoZWNrZWQgPSBjaGVja2JveC5jaGVja2VkXG5cbiAgICAgIGlmICh0aGlzLl9pc1NpbmdsZSgpKSB7XG4gICAgICAgIGlmICh3YXNDaGVja2VkICYmIHRoaXMuX2lzQ29sbGFwc2libGUoKSkge1xuICAgICAgICAgIC8vIENsb3NlIHRoaXMgaXRlbVxuICAgICAgICAgIGNoZWNrYm94LmNoZWNrZWQgPSBmYWxzZVxuICAgICAgICAgIHRoaXMuX3N5bmNBcmlhKHRyaWdnZXIsIGZhbHNlKVxuICAgICAgICB9IGVsc2UgaWYgKHdhc0NoZWNrZWQgJiYgIXRoaXMuX2lzQ29sbGFwc2libGUoKSkge1xuICAgICAgICAgIC8vIEtlZXAgb3BlbiwgcHJldmVudCB0b2dnbGVcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBDbG9zZSBhbGwgb3RoZXJzLCBvcGVuIHRoaXMgb25lXG4gICAgICAgICAgdGhpcy5fY2hlY2tib3hlcygpLmZvckVhY2goKGNiKSA9PiB7XG4gICAgICAgICAgICBpZiAoY2IgIT09IGNoZWNrYm94ICYmIGNiLmNoZWNrZWQpIHtcbiAgICAgICAgICAgICAgY2IuY2hlY2tlZCA9IGZhbHNlXG4gICAgICAgICAgICAgIGNvbnN0IG90aGVyVHJpZ2dlciA9IGNiLnBhcmVudEVsZW1lbnQucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwiYWNjb3JkaW9uLXRyaWdnZXJcIl0nKVxuICAgICAgICAgICAgICBpZiAob3RoZXJUcmlnZ2VyKSB0aGlzLl9zeW5jQXJpYShvdGhlclRyaWdnZXIsIGZhbHNlKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgICAgY2hlY2tib3guY2hlY2tlZCA9IHRydWVcbiAgICAgICAgICB0aGlzLl9zeW5jQXJpYSh0cmlnZ2VyLCB0cnVlKVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBNdWx0aXBsZSBtb2RlIFx1MjAxNCBqdXN0IHRvZ2dsZVxuICAgICAgICBjaGVja2JveC5jaGVja2VkID0gIXdhc0NoZWNrZWRcbiAgICAgICAgdGhpcy5fc3luY0FyaWEodHJpZ2dlciwgY2hlY2tib3guY2hlY2tlZClcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgLy8gU3luYyBpbml0aWFsIGFyaWEgc3RhdGVzXG4gICAgdGhpcy5fc3luY0FsbEFyaWEoKVxuICB9LFxuXG4gIHVwZGF0ZWQoKSB7XG4gICAgdGhpcy5fc3luY0FsbEFyaWEoKVxuICB9LFxuXG4gIGRlc3Ryb3llZCgpIHtcbiAgICBpZiAodGhpcy5fb25LZXlkb3duKSB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIHRoaXMuX29uS2V5ZG93bilcbiAgICBpZiAodGhpcy5fb25DbGljaykgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5fb25DbGljaylcbiAgfSxcblxuICBfc3luY0FyaWEodHJpZ2dlciwgZXhwYW5kZWQpIHtcbiAgICB0cmlnZ2VyLnNldEF0dHJpYnV0ZShcImFyaWEtZXhwYW5kZWRcIiwgU3RyaW5nKGV4cGFuZGVkKSlcbiAgfSxcblxuICBfc3luY0FsbEFyaWEoKSB7XG4gICAgY29uc3QgaXRlbXMgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWV4bz1cImFjY29yZGlvbi1pdGVtXCJdJylcbiAgICBpdGVtcy5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICBjb25zdCBjaGVja2JveCA9IGl0ZW0ucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwiYWNjb3JkaW9uLXN0YXRlXCJdJylcbiAgICAgIGNvbnN0IHRyaWdnZXIgPSBpdGVtLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cImFjY29yZGlvbi10cmlnZ2VyXCJdJylcbiAgICAgIGlmIChjaGVja2JveCAmJiB0cmlnZ2VyKSB7XG4gICAgICAgIHRoaXMuX3N5bmNBcmlhKHRyaWdnZXIsIGNoZWNrYm94LmNoZWNrZWQpXG4gICAgICB9XG4gICAgfSlcbiAgfVxufVxuXG5leHBvcnQgeyBFeG9BY2NvcmRpb24gfVxuIiwgIi8qKlxuICogRXhvQ2Fyb3VzZWwgaG9vayBcdTIwMTQgc2Nyb2xsYWJsZSBjYXJvdXNlbCB3aXRoIHByZXYvbmV4dCBidXR0b25zLlxuICovXG5jb25zdCBFeG9DYXJvdXNlbCA9IHtcbiAgbW91bnRlZCgpIHtcbiAgICB0aGlzLnRyYWNrID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJjYXJvdXNlbC10cmFja1wiXScpXG4gICAgdGhpcy52aWV3cG9ydCA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwiY2Fyb3VzZWwtdmlld3BvcnRcIl0nKVxuICAgIHRoaXMucHJldiA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwiY2Fyb3VzZWwtcHJldlwiXScpXG4gICAgdGhpcy5uZXh0ID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJjYXJvdXNlbC1uZXh0XCJdJylcbiAgICBpZiAoIXRoaXMudHJhY2sgfHwgIXRoaXMudmlld3BvcnQpIHJldHVyblxuXG4gICAgY29uc3Qgc2xpZGVzID0gKCkgPT4gQXJyYXkuZnJvbSh0aGlzLnRyYWNrLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWV4bz1cImNhcm91c2VsLXNsaWRlXCJdJykpXG4gICAgY29uc3QgbG9vcCA9IHRoaXMuZWwuaGFzQXR0cmlidXRlKFwiZGF0YS1sb29wXCIpXG5cbiAgICBjb25zdCBzY3JvbGxUbyA9IChkaXJlY3Rpb24pID0+IHtcbiAgICAgIGNvbnN0IHMgPSBzbGlkZXMoKVxuICAgICAgaWYgKHMubGVuZ3RoID09PSAwKSByZXR1cm5cbiAgICAgIGNvbnN0IHNsaWRlV2lkdGggPSBzWzBdLm9mZnNldFdpZHRoXG4gICAgICBjb25zdCBnYXAgPSBwYXJzZUZsb2F0KGdldENvbXB1dGVkU3R5bGUodGhpcy50cmFjaykuZ2FwKSB8fCAwXG4gICAgICBjb25zdCBzY3JvbGxBbW91bnQgPSBzbGlkZVdpZHRoICsgZ2FwXG5cbiAgICAgIGlmIChkaXJlY3Rpb24gPT09IFwibmV4dFwiKSB7XG4gICAgICAgIGlmIChsb29wICYmIHRoaXMudmlld3BvcnQuc2Nyb2xsTGVmdCA+PSB0aGlzLnZpZXdwb3J0LnNjcm9sbFdpZHRoIC0gdGhpcy52aWV3cG9ydC5vZmZzZXRXaWR0aCAtIDUpIHtcbiAgICAgICAgICB0aGlzLnZpZXdwb3J0LnNjcm9sbFRvKHsgbGVmdDogMCwgYmVoYXZpb3I6IFwic21vb3RoXCIgfSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnZpZXdwb3J0LnNjcm9sbEJ5KHsgbGVmdDogc2Nyb2xsQW1vdW50LCBiZWhhdmlvcjogXCJzbW9vdGhcIiB9KVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAobG9vcCAmJiB0aGlzLnZpZXdwb3J0LnNjcm9sbExlZnQgPD0gNSkge1xuICAgICAgICAgIHRoaXMudmlld3BvcnQuc2Nyb2xsVG8oeyBsZWZ0OiB0aGlzLnZpZXdwb3J0LnNjcm9sbFdpZHRoLCBiZWhhdmlvcjogXCJzbW9vdGhcIiB9KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMudmlld3BvcnQuc2Nyb2xsQnkoeyBsZWZ0OiAtc2Nyb2xsQW1vdW50LCBiZWhhdmlvcjogXCJzbW9vdGhcIiB9KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMucHJldikgdGhpcy5wcmV2LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLl9vblByZXYgPSAoKSA9PiBzY3JvbGxUbyhcInByZXZcIikpXG4gICAgaWYgKHRoaXMubmV4dCkgdGhpcy5uZXh0LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLl9vbk5leHQgPSAoKSA9PiBzY3JvbGxUbyhcIm5leHRcIikpXG5cbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIHRoaXMuX29uS2V5ID0gKGUpID0+IHtcbiAgICAgIGlmIChlLmtleSA9PT0gXCJBcnJvd0xlZnRcIikgeyBlLnByZXZlbnREZWZhdWx0KCk7IHNjcm9sbFRvKFwicHJldlwiKSB9XG4gICAgICBpZiAoZS5rZXkgPT09IFwiQXJyb3dSaWdodFwiKSB7IGUucHJldmVudERlZmF1bHQoKTsgc2Nyb2xsVG8oXCJuZXh0XCIpIH1cbiAgICB9KVxuICB9LFxuXG4gIGRlc3Ryb3llZCgpIHtcbiAgICBpZiAodGhpcy5wcmV2ICYmIHRoaXMuX29uUHJldikgdGhpcy5wcmV2LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLl9vblByZXYpXG4gICAgaWYgKHRoaXMubmV4dCAmJiB0aGlzLl9vbk5leHQpIHRoaXMubmV4dC5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5fb25OZXh0KVxuICAgIGlmICh0aGlzLl9vbktleSkgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCB0aGlzLl9vbktleSlcbiAgfVxufVxuXG5leHBvcnQgeyBFeG9DYXJvdXNlbCB9XG4iLCAiLyoqXG4gKiBFeG9Db2xsYXBzaWJsZSBob29rIFx1MjAxNCBjbGljayB0b2dnbGUgKyBhcmlhLWV4cGFuZGVkIHN5bmMuXG4gKlxuICogVXNlcyBhIGhpZGRlbiBjaGVja2JveCB0byBkcml2ZSBDU1Mgc3RhdGUgKHNhbWUgcGF0dGVybiBhcyBFeG9BY2NvcmRpb24pLlxuICogVGhlIHRyaWdnZXIgYnV0dG9uIHRvZ2dsZXMgdGhlIGNoZWNrYm94IGFuZCBzeW5jcyBhcmlhLWV4cGFuZGVkLlxuICovXG5jb25zdCBFeG9Db2xsYXBzaWJsZSA9IHtcbiAgbW91bnRlZCgpIHtcbiAgICB0aGlzLl9jaGVja2JveCA9ICgpID0+IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwiY29sbGFwc2libGUtc3RhdGVcIl0nKVxuICAgIHRoaXMuX3RyaWdnZXIgPSAoKSA9PiB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cImNvbGxhcHNpYmxlLXRyaWdnZXJcIl0nKVxuXG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5fb25DbGljayA9IChlKSA9PiB7XG4gICAgICBjb25zdCB0cmlnZ2VyID0gZS50YXJnZXQuY2xvc2VzdCgnW2RhdGEtZXhvPVwiY29sbGFwc2libGUtdHJpZ2dlclwiXScpXG4gICAgICBpZiAoIXRyaWdnZXIpIHJldHVyblxuXG4gICAgICBjb25zdCBjaGVja2JveCA9IHRoaXMuX2NoZWNrYm94KClcbiAgICAgIGlmICghY2hlY2tib3gpIHJldHVyblxuXG4gICAgICBjaGVja2JveC5jaGVja2VkID0gIWNoZWNrYm94LmNoZWNrZWRcbiAgICAgIHRyaWdnZXIuc2V0QXR0cmlidXRlKFwiYXJpYS1leHBhbmRlZFwiLCBTdHJpbmcoY2hlY2tib3guY2hlY2tlZCkpXG4gICAgfSlcblxuICAgIHRoaXMuX3N5bmNBcmlhKClcbiAgfSxcblxuICB1cGRhdGVkKCkge1xuICAgIHRoaXMuX3N5bmNBcmlhKClcbiAgfSxcblxuICBkZXN0cm95ZWQoKSB7XG4gICAgaWYgKHRoaXMuX29uQ2xpY2spIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuX29uQ2xpY2spXG4gIH0sXG5cbiAgX3N5bmNBcmlhKCkge1xuICAgIGNvbnN0IGNoZWNrYm94ID0gdGhpcy5fY2hlY2tib3goKVxuICAgIGNvbnN0IHRyaWdnZXIgPSB0aGlzLl90cmlnZ2VyKClcbiAgICBpZiAoY2hlY2tib3ggJiYgdHJpZ2dlcikge1xuICAgICAgdHJpZ2dlci5zZXRBdHRyaWJ1dGUoXCJhcmlhLWV4cGFuZGVkXCIsIFN0cmluZyhjaGVja2JveC5jaGVja2VkKSlcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IHsgRXhvQ29sbGFwc2libGUgfVxuIiwgIi8qKlxuICogRXhvQ29tbWFuZFBhbGV0dGUgaG9vayBcdTIwMTQgQ3RybCtLIC8gQ21kK0sgc2VhcmNoYWJsZSBjb21tYW5kIGRpYWxvZy5cbiAqL1xuY29uc3QgRXhvQ29tbWFuZFBhbGV0dGUgPSB7XG4gIG1vdW50ZWQoKSB7XG4gICAgdGhpcy5iYWNrZHJvcCA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwiY29tbWFuZC1wYWxldHRlLWJhY2tkcm9wXCJdJylcbiAgICB0aGlzLmlucHV0ID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJjb21tYW5kLXBhbGV0dGUtaW5wdXRcIl0nKVxuICAgIHRoaXMubGlzdCA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwiY29tbWFuZC1wYWxldHRlLWxpc3RcIl0nKVxuXG4gICAgY29uc3QgaXNPcGVuID0gKCkgPT4gdGhpcy5lbC5jbGFzc0xpc3QuY29udGFpbnMoXCJvcGVuXCIpXG5cbiAgICBjb25zdCBvcGVuID0gKCkgPT4ge1xuICAgICAgdGhpcy5lbC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiXG4gICAgICB0aGlzLmVsLmNsYXNzTGlzdC5hZGQoXCJvcGVuXCIpXG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5pbnB1dCkgdGhpcy5pbnB1dC5mb2N1cygpXG4gICAgICB9KVxuICAgIH1cblxuICAgIGNvbnN0IGNsb3NlID0gKCkgPT4ge1xuICAgICAgdGhpcy5lbC5jbGFzc0xpc3QucmVtb3ZlKFwib3BlblwiKVxuICAgICAgdGhpcy5lbC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCJcbiAgICAgIGlmICh0aGlzLmlucHV0KSB0aGlzLmlucHV0LnZhbHVlID0gXCJcIlxuICAgIH1cblxuICAgIC8vIEdsb2JhbCBDdHJsK0sgLyBDbWQrS1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIHRoaXMuX29uR2xvYmFsS2V5ID0gKGUpID0+IHtcbiAgICAgIGlmICgoZS5tZXRhS2V5IHx8IGUuY3RybEtleSkgJiYgZS5rZXkgPT09IFwia1wiKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICBpc09wZW4oKSA/IGNsb3NlKCkgOiBvcGVuKClcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgLy8gRXNjYXBlIHRvIGNsb3NlXG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCB0aGlzLl9vbktleSA9IChlKSA9PiB7XG4gICAgICBpZiAoZS5rZXkgPT09IFwiRXNjYXBlXCIpIGNsb3NlKClcbiAgICB9KVxuXG4gICAgLy8gQ2xpY2sgYmFja2Ryb3AgdG8gY2xvc2VcbiAgICBpZiAodGhpcy5iYWNrZHJvcCkge1xuICAgICAgdGhpcy5iYWNrZHJvcC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5fb25CYWNrZHJvcCA9ICgpID0+IGNsb3NlKCkpXG4gICAgfVxuICB9LFxuXG4gIGRlc3Ryb3llZCgpIHtcbiAgICBpZiAodGhpcy5fb25HbG9iYWxLZXkpIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIHRoaXMuX29uR2xvYmFsS2V5KVxuICB9XG59XG5cbmV4cG9ydCB7IEV4b0NvbW1hbmRQYWxldHRlIH1cbiIsICIvKipcbiAqIEV4b1NpZGViYXIgaG9vayBcdTIwMTQgbWFuYWdlcyBjb2xsYXBzaWJsZSBzaWRlYmFyIHN0YXRlLlxuICpcbiAqIFJlc3RvcmVzIGNvbGxhcHNlZC9leHBhbmRlZCBmcm9tIGxvY2FsU3RvcmFnZSBvbiBkZXNrdG9wLlxuICogTW9iaWxlIHN0YXJ0cyBjbG9zZWQuIFNldHMgZGF0YS1zaWRlYmFyLXJlYWR5IG9uIDxodG1sPiBhZnRlciBpbml0LlxuICovXG5jb25zdCBFeG9TaWRlYmFyID0ge1xuICBtb3VudGVkKCkge1xuICAgIHRoaXMudG9nZ2xlID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJzaWRlYmFyLXRvZ2dsZVwiXScpXG4gICAgaWYgKCF0aGlzLnRvZ2dsZSkgcmV0dXJuXG5cbiAgICB0aGlzLl9hcHBseVN0YXRlKClcblxuICAgIC8vIEVuYWJsZSBDU1MgdHJhbnNpdGlvbnMgYWZ0ZXIgaW5pdGlhbCBzdGF0ZSAocHJldmVudHMgRk9VQylcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNldEF0dHJpYnV0ZSgnZGF0YS1zaWRlYmFyLXJlYWR5JywgJycpXG4gICAgfSlcblxuICAgIC8vIFBlcnNpc3Qgb24gdG9nZ2xlXG4gICAgdGhpcy5fb25DaGFuZ2UgPSAoKSA9PiB7XG4gICAgICBpZiAod2luZG93Lm1hdGNoTWVkaWEoJyhtaW4td2lkdGg6IDc2OHB4KScpLm1hdGNoZXMpIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2V4by1zaWRlYmFyLWNvbGxhcHNlZCcsIHRoaXMudG9nZ2xlLmNoZWNrZWQgPyAnZmFsc2UnIDogJ3RydWUnKVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnRvZ2dsZS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCB0aGlzLl9vbkNoYW5nZSlcbiAgfSxcblxuICBkZXN0cm95ZWQoKSB7XG4gICAgaWYgKHRoaXMudG9nZ2xlICYmIHRoaXMuX29uQ2hhbmdlKSB7XG4gICAgICB0aGlzLnRvZ2dsZS5yZW1vdmVFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCB0aGlzLl9vbkNoYW5nZSlcbiAgICB9XG4gIH0sXG5cbiAgdXBkYXRlZCgpIHtcbiAgICB0aGlzLl9hcHBseVN0YXRlKClcbiAgfSxcblxuICBfYXBwbHlTdGF0ZSgpIHtcbiAgICBpZiAoIXRoaXMudG9nZ2xlKSByZXR1cm5cbiAgICBjb25zdCBpc0Rlc2t0b3AgPSB3aW5kb3cubWF0Y2hNZWRpYSgnKG1pbi13aWR0aDogNzY4cHgpJykubWF0Y2hlc1xuICAgIGlmIChpc0Rlc2t0b3ApIHtcbiAgICAgIGNvbnN0IGNvbGxhcHNlZCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdleG8tc2lkZWJhci1jb2xsYXBzZWQnKSA9PT0gJ3RydWUnXG4gICAgICB0aGlzLnRvZ2dsZS5jaGVja2VkID0gIWNvbGxhcHNlZFxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnRvZ2dsZS5jaGVja2VkID0gZmFsc2VcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IHsgRXhvU2lkZWJhciB9XG4iLCAiY29uc3QgRXhvVGhlbWVUb2dnbGUgPSB7XG4gIG1vdW50ZWQoKSB7XG4gICAgdGhpcy5fYXBwbHkodGhpcy5fY3VycmVudCgpKVxuXG4gICAgdGhpcy5faGFuZGxlcnMgPSBbXVxuICAgIHRoaXMuZWwucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtdGhlbWUtdmFsdWVdJykuZm9yRWFjaChidG4gPT4ge1xuICAgICAgY29uc3QgaGFuZGxlciA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBidG4uZ2V0QXR0cmlidXRlKCdkYXRhLXRoZW1lLXZhbHVlJylcbiAgICAgICAgdGhpcy5fYXBwbHkodmFsdWUpXG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdleG8tdGhlbWUnLCB2YWx1ZSlcbiAgICAgIH1cbiAgICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZXIpXG4gICAgICB0aGlzLl9oYW5kbGVycy5wdXNoKHsgYnRuLCBoYW5kbGVyIH0pXG4gICAgfSlcbiAgfSxcblxuICBkZXN0cm95ZWQoKSB7XG4gICAgdGhpcy5faGFuZGxlcnM/LmZvckVhY2goKHsgYnRuLCBoYW5kbGVyIH0pID0+XG4gICAgICBidG4ucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVyKVxuICAgIClcbiAgfSxcblxuICBfY3VycmVudCgpIHtcbiAgICByZXR1cm4gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2V4by10aGVtZScpIHx8ICdzeXN0ZW0nXG4gIH0sXG5cbiAgX2FwcGx5KHRoZW1lKSB7XG4gICAgY29uc3Qgcm9vdCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudFxuICAgIC8vIFVwZGF0ZSBhY3RpdmUgc3RhdGUgb24gYnV0dG9uc1xuICAgIHRoaXMuZWwucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtdGhlbWUtdmFsdWVdJykuZm9yRWFjaChidG4gPT4ge1xuICAgICAgYnRuLnRvZ2dsZUF0dHJpYnV0ZSgnZGF0YS1hY3RpdmUnLCBidG4uZ2V0QXR0cmlidXRlKCdkYXRhLXRoZW1lLXZhbHVlJykgPT09IHRoZW1lKVxuICAgIH0pXG5cbiAgICBpZiAodGhlbWUgPT09ICdzeXN0ZW0nKSB7XG4gICAgICByb290LnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS10aGVtZScpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJvb3Quc2V0QXR0cmlidXRlKCdkYXRhLXRoZW1lJywgdGhlbWUpXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCB7IEV4b1RoZW1lVG9nZ2xlIH1cbiIsICJjb25zdCBFeG9Qb3BvdmVyID0ge1xuICBtb3VudGVkKCkgeyB0aGlzLl9iaW5kKCkgfSxcbiAgdXBkYXRlZCgpIHsgdGhpcy5fYmluZCgpIH0sXG4gIGRlc3Ryb3llZCgpIHsgdGhpcy5fdW5iaW5kKCkgfSxcbiAgX2JpbmQoKSB7XG4gICAgdGhpcy5fdW5iaW5kKClcbiAgICBjb25zdCB0cmlnZ2VyID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJwb3BvdmVyLXRyaWdnZXJcIl0nKVxuICAgIGNvbnN0IGlkID0gdHJpZ2dlcj8uZ2V0QXR0cmlidXRlKCdwb3BvdmVydGFyZ2V0JylcbiAgICB0aGlzLl9wb3BvdmVyID0gaWQgPyBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCkgOiBudWxsXG4gICAgaWYgKCF0aGlzLl9wb3BvdmVyKSByZXR1cm5cbiAgICB0aGlzLl9vblRvZ2dsZSA9ICgpID0+IHtcbiAgICAgIGNvbnN0IG9wZW4gPSB0aGlzLl9wb3BvdmVyLm1hdGNoZXMoJzpwb3BvdmVyLW9wZW4nKVxuICAgICAgdHJpZ2dlci5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCBTdHJpbmcob3BlbikpXG4gICAgfVxuICAgIHRoaXMuX3BvcG92ZXIuYWRkRXZlbnRMaXN0ZW5lcigndG9nZ2xlJywgdGhpcy5fb25Ub2dnbGUpXG4gIH0sXG4gIF91bmJpbmQoKSB7XG4gICAgaWYgKHRoaXMuX3BvcG92ZXIgJiYgdGhpcy5fb25Ub2dnbGUpIHtcbiAgICAgIHRoaXMuX3BvcG92ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG9nZ2xlJywgdGhpcy5fb25Ub2dnbGUpXG4gICAgfVxuICAgIHRoaXMuX3BvcG92ZXIgPSBudWxsXG4gICAgdGhpcy5fb25Ub2dnbGUgPSBudWxsXG4gIH1cbn1cblxuZXhwb3J0IHsgRXhvUG9wb3ZlciB9XG4iLCAiY29uc3QgRXhvRHJvcGRvd25NZW51ID0ge1xuICBtb3VudGVkKCkgeyB0aGlzLl9iaW5kKCkgfSxcbiAgdXBkYXRlZCgpIHsgdGhpcy5fYmluZCgpIH0sXG4gIGRlc3Ryb3llZCgpIHsgdGhpcy5fdW5iaW5kKCkgfSxcbiAgX2JpbmQoKSB7XG4gICAgdGhpcy5fdW5iaW5kKClcbiAgICB0aGlzLl9tZW51ID0gdGhpcy5lbC5tYXRjaGVzKCdbcm9sZT1cIm1lbnVcIl0nKSA/IHRoaXMuZWwgOiB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tyb2xlPVwibWVudVwiXScpXG4gICAgaWYgKCF0aGlzLl9tZW51KSByZXR1cm5cbiAgICB0aGlzLl9vbktleWRvd24gPSAoZSkgPT4ge1xuICAgICAgY29uc3QgaXRlbXMgPSBbLi4udGhpcy5fbWVudS5xdWVyeVNlbGVjdG9yQWxsKCdbcm9sZT1cIm1lbnVpdGVtXCJdOm5vdChbZGlzYWJsZWRdKScpXVxuICAgICAgaWYgKCFpdGVtcy5sZW5ndGgpIHJldHVyblxuICAgICAgY29uc3QgaWR4ID0gaXRlbXMuaW5kZXhPZihkb2N1bWVudC5hY3RpdmVFbGVtZW50KVxuICAgICAgbGV0IG5leHQgPSAtMVxuICAgICAgc3dpdGNoIChlLmtleSkge1xuICAgICAgICBjYXNlICdBcnJvd0Rvd24nOiBuZXh0ID0gaWR4IDwgaXRlbXMubGVuZ3RoIC0gMSA/IGlkeCArIDEgOiAwOyBicmVha1xuICAgICAgICBjYXNlICdBcnJvd1VwJzogbmV4dCA9IGlkeCA+IDAgPyBpZHggLSAxIDogaXRlbXMubGVuZ3RoIC0gMTsgYnJlYWtcbiAgICAgICAgY2FzZSAnSG9tZSc6IG5leHQgPSAwOyBicmVha1xuICAgICAgICBjYXNlICdFbmQnOiBuZXh0ID0gaXRlbXMubGVuZ3RoIC0gMTsgYnJlYWtcbiAgICAgICAgZGVmYXVsdDogcmV0dXJuXG4gICAgICB9XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIGl0ZW1zW25leHRdPy5mb2N1cygpXG4gICAgfVxuICAgIHRoaXMuX21lbnUuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX29uS2V5ZG93bilcbiAgfSxcbiAgX3VuYmluZCgpIHtcbiAgICBpZiAodGhpcy5fbWVudSAmJiB0aGlzLl9vbktleWRvd24pIHtcbiAgICAgIHRoaXMuX21lbnUucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX29uS2V5ZG93bilcbiAgICB9XG4gICAgdGhpcy5fbWVudSA9IG51bGxcbiAgICB0aGlzLl9vbktleWRvd24gPSBudWxsXG4gIH1cbn1cblxuZXhwb3J0IHsgRXhvRHJvcGRvd25NZW51IH1cbiIsICJjb25zdCBFeG9TZWxlY3QgPSB7XG4gIG1vdW50ZWQoKSB7IHRoaXMuX2JpbmQoKSB9LFxuICB1cGRhdGVkKCkgeyB0aGlzLl9iaW5kKCkgfSxcbiAgZGVzdHJveWVkKCkgeyB0aGlzLl91bmJpbmQoKSB9LFxuXG4gIF9iaW5kKCkge1xuICAgIHRoaXMuX3VuYmluZCgpXG5cbiAgICB0aGlzLl90cmlnZ2VyID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG8tc2VsZWN0PVwidHJpZ2dlclwiXScpXG4gICAgY29uc3QgcG9wb3ZlcklkID0gdGhpcy5fdHJpZ2dlcj8uZ2V0QXR0cmlidXRlKCdwb3BvdmVydGFyZ2V0JylcbiAgICB0aGlzLl9wb3BvdmVyID0gcG9wb3ZlcklkID8gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocG9wb3ZlcklkKSA6IG51bGxcbiAgICB0aGlzLl9saXN0Ym94ID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbcm9sZT1cImxpc3Rib3hcIl0nKVxuICAgIHRoaXMuX2hpZGRlbiA9IHRoaXMuZWwuY2xvc2VzdCgnW2RhdGEtZXhvPVwiZmllbGRcIl0nKT8ucXVlcnlTZWxlY3RvcignaW5wdXRbdHlwZT1cImhpZGRlblwiXScpXG5cbiAgICBpZiAoIXRoaXMuX3BvcG92ZXIgfHwgIXRoaXMuX2xpc3Rib3gpIHJldHVyblxuXG4gICAgLy8gVG9nZ2xlIGFyaWEtZXhwYW5kZWQgb24gcG9wb3ZlciBvcGVuL2Nsb3NlXG4gICAgdGhpcy5fb25Ub2dnbGUgPSAoKSA9PiB7XG4gICAgICBjb25zdCBvcGVuID0gdGhpcy5fcG9wb3Zlci5tYXRjaGVzKCc6cG9wb3Zlci1vcGVuJylcbiAgICAgIHRoaXMuX3RyaWdnZXIuc2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJywgU3RyaW5nKG9wZW4pKVxuICAgICAgaWYgKG9wZW4pIHtcbiAgICAgICAgLy8gRm9jdXMgc2VsZWN0ZWQgb3IgZmlyc3Qgb3B0aW9uXG4gICAgICAgIGNvbnN0IHNlbGVjdGVkID0gdGhpcy5fbGlzdGJveC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1zZWxlY3RlZF0nKVxuICAgICAgICBjb25zdCBmaXJzdCA9IHRoaXMuX2xpc3Rib3gucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwic2VsZWN0LW9wdGlvblwiXTpub3QoW2RhdGEtZGlzYWJsZWRdKScpXG4gICAgICAgIGNvbnN0IHRhcmdldCA9IHNlbGVjdGVkIHx8IGZpcnN0XG4gICAgICAgIGlmICh0YXJnZXQpIHRhcmdldC5mb2N1cygpXG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX3BvcG92ZXIuYWRkRXZlbnRMaXN0ZW5lcigndG9nZ2xlJywgdGhpcy5fb25Ub2dnbGUpXG5cbiAgICAvLyBDbGljayBvbiBvcHRpb25cbiAgICB0aGlzLl9vbkNsaWNrID0gKGUpID0+IHtcbiAgICAgIGNvbnN0IG9wdCA9IGUudGFyZ2V0LmNsb3Nlc3QoJ1tkYXRhLWV4bz1cInNlbGVjdC1vcHRpb25cIl0nKVxuICAgICAgaWYgKCFvcHQgfHwgb3B0Lmhhc0F0dHJpYnV0ZSgnZGF0YS1kaXNhYmxlZCcpKSByZXR1cm5cbiAgICAgIHRoaXMuX3NlbGVjdE9wdGlvbihvcHQpXG4gICAgfVxuICAgIHRoaXMuX2xpc3Rib3guYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9vbkNsaWNrKVxuXG4gICAgLy8gS2V5Ym9hcmQgbmF2aWdhdGlvblxuICAgIHRoaXMuX29uS2V5ZG93biA9IChlKSA9PiB7XG4gICAgICBjb25zdCBvcHRpb25zID0gWy4uLnRoaXMuX2xpc3Rib3gucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZXhvPVwic2VsZWN0LW9wdGlvblwiXTpub3QoW2RhdGEtZGlzYWJsZWRdKScpXVxuICAgICAgaWYgKCFvcHRpb25zLmxlbmd0aCkgcmV0dXJuXG4gICAgICBjb25zdCBpZHggPSBvcHRpb25zLmluZGV4T2YoZG9jdW1lbnQuYWN0aXZlRWxlbWVudClcbiAgICAgIGxldCBuZXh0ID0gLTFcblxuICAgICAgc3dpdGNoIChlLmtleSkge1xuICAgICAgICBjYXNlICdBcnJvd0Rvd24nOlxuICAgICAgICAgIG5leHQgPSBpZHggPCBvcHRpb25zLmxlbmd0aCAtIDEgPyBpZHggKyAxIDogMFxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgJ0Fycm93VXAnOlxuICAgICAgICAgIG5leHQgPSBpZHggPiAwID8gaWR4IC0gMSA6IG9wdGlvbnMubGVuZ3RoIC0gMVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgJ0hvbWUnOlxuICAgICAgICAgIG5leHQgPSAwXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAnRW5kJzpcbiAgICAgICAgICBuZXh0ID0gb3B0aW9ucy5sZW5ndGggLSAxXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAnRW50ZXInOlxuICAgICAgICBjYXNlICcgJzpcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICBpZiAoaWR4ID49IDApIHRoaXMuX3NlbGVjdE9wdGlvbihvcHRpb25zW2lkeF0pXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIGNhc2UgJ0VzY2FwZSc6XG4gICAgICAgICAgdGhpcy5fcG9wb3Zlci5oaWRlUG9wb3ZlcigpXG4gICAgICAgICAgdGhpcy5fdHJpZ2dlci5mb2N1cygpXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgLy8gVHlwZS1haGVhZDoganVtcCB0byBvcHRpb24gc3RhcnRpbmcgd2l0aCB0eXBlZCBjaGFyYWN0ZXJcbiAgICAgICAgICB0aGlzLl90eXBlQWhlYWQoZS5rZXksIG9wdGlvbnMpXG4gICAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgaWYgKG5leHQgPj0gMCkgb3B0aW9uc1tuZXh0XS5mb2N1cygpXG4gICAgfVxuICAgIHRoaXMuX2xpc3Rib3guYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX29uS2V5ZG93bilcbiAgfSxcblxuICBfc2VsZWN0T3B0aW9uKG9wdCkge1xuICAgIGNvbnN0IHZhbHVlID0gb3B0LmdldEF0dHJpYnV0ZSgnZGF0YS12YWx1ZScpXG4gICAgY29uc3QgdGV4dCA9IG9wdC50ZXh0Q29udGVudC50cmltKClcblxuICAgIC8vIFVwZGF0ZSBoaWRkZW4gaW5wdXRcbiAgICBpZiAodGhpcy5faGlkZGVuKSB7XG4gICAgICB0aGlzLl9oaWRkZW4udmFsdWUgPSB2YWx1ZVxuICAgICAgdGhpcy5faGlkZGVuLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdpbnB1dCcsIHsgYnViYmxlczogdHJ1ZSB9KSlcbiAgICB9XG5cbiAgICAvLyBVcGRhdGUgYXJpYS1zZWxlY3RlZCBhbmQgZGF0YS1zZWxlY3RlZCBvbiBhbGwgb3B0aW9uc1xuICAgIHRoaXMuX2xpc3Rib3gucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZXhvPVwic2VsZWN0LW9wdGlvblwiXScpLmZvckVhY2goKG8pID0+IHtcbiAgICAgIGNvbnN0IGlzU2VsZWN0ZWQgPSBvLmdldEF0dHJpYnV0ZSgnZGF0YS12YWx1ZScpID09PSB2YWx1ZVxuICAgICAgby5zZXRBdHRyaWJ1dGUoJ2FyaWEtc2VsZWN0ZWQnLCBTdHJpbmcoaXNTZWxlY3RlZCkpXG4gICAgICBpZiAoaXNTZWxlY3RlZCkge1xuICAgICAgICBvLnNldEF0dHJpYnV0ZSgnZGF0YS1zZWxlY3RlZCcsICcnKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgby5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtc2VsZWN0ZWQnKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICAvLyBVcGRhdGUgdHJpZ2dlciBkaXNwbGF5IHRleHRcbiAgICBjb25zdCB2YWx1ZUVsID0gdGhpcy5fdHJpZ2dlci5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJzZWxlY3QtdmFsdWVcIl0nKVxuICAgIGlmICh2YWx1ZUVsKSB7XG4gICAgICB2YWx1ZUVsLnRleHRDb250ZW50ID0gdGV4dFxuICAgICAgdmFsdWVFbC5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtcGxhY2Vob2xkZXInKVxuICAgIH1cblxuICAgIC8vIENsb3NlIHBvcG92ZXJcbiAgICB0aGlzLl9wb3BvdmVyLmhpZGVQb3BvdmVyKClcbiAgICB0aGlzLl90cmlnZ2VyLmZvY3VzKClcbiAgfSxcblxuICBfdHlwZUFoZWFkKGNoYXIsIG9wdGlvbnMpIHtcbiAgICBpZiAoY2hhci5sZW5ndGggIT09IDEpIHJldHVyblxuICAgIGNvbnN0IGxvd2VyID0gY2hhci50b0xvd2VyQ2FzZSgpXG4gICAgY29uc3QgY3VycmVudElkeCA9IG9wdGlvbnMuaW5kZXhPZihkb2N1bWVudC5hY3RpdmVFbGVtZW50KVxuICAgIGNvbnN0IHN0YXJ0ID0gY3VycmVudElkeCArIDFcbiAgICBjb25zdCByb3RhdGVkID0gWy4uLm9wdGlvbnMuc2xpY2Uoc3RhcnQpLCAuLi5vcHRpb25zLnNsaWNlKDAsIHN0YXJ0KV1cbiAgICBjb25zdCBtYXRjaCA9IHJvdGF0ZWQuZmluZChvID0+IG8udGV4dENvbnRlbnQudHJpbSgpLnRvTG93ZXJDYXNlKCkuc3RhcnRzV2l0aChsb3dlcikpXG4gICAgaWYgKG1hdGNoKSBtYXRjaC5mb2N1cygpXG4gIH0sXG5cbiAgX3VuYmluZCgpIHtcbiAgICBpZiAodGhpcy5fcG9wb3ZlciAmJiB0aGlzLl9vblRvZ2dsZSkge1xuICAgICAgdGhpcy5fcG9wb3Zlci5yZW1vdmVFdmVudExpc3RlbmVyKCd0b2dnbGUnLCB0aGlzLl9vblRvZ2dsZSlcbiAgICB9XG4gICAgaWYgKHRoaXMuX2xpc3Rib3ggJiYgdGhpcy5fb25DbGljaykge1xuICAgICAgdGhpcy5fbGlzdGJveC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX29uQ2xpY2spXG4gICAgfVxuICAgIGlmICh0aGlzLl9saXN0Ym94ICYmIHRoaXMuX29uS2V5ZG93bikge1xuICAgICAgdGhpcy5fbGlzdGJveC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5fb25LZXlkb3duKVxuICAgIH1cbiAgICB0aGlzLl90cmlnZ2VyID0gbnVsbFxuICAgIHRoaXMuX3BvcG92ZXIgPSBudWxsXG4gICAgdGhpcy5fbGlzdGJveCA9IG51bGxcbiAgICB0aGlzLl9oaWRkZW4gPSBudWxsXG4gICAgdGhpcy5fb25Ub2dnbGUgPSBudWxsXG4gICAgdGhpcy5fb25DbGljayA9IG51bGxcbiAgICB0aGlzLl9vbktleWRvd24gPSBudWxsXG4gIH1cbn1cblxuZXhwb3J0IHsgRXhvU2VsZWN0IH1cbiIsICJjb25zdCBFeG9Db21ib2JveCA9IHtcbiAgbW91bnRlZCgpIHsgdGhpcy5fYmluZCgpIH0sXG4gIHVwZGF0ZWQoKSB7IHRoaXMuX2JpbmQoKSB9LFxuICBkZXN0cm95ZWQoKSB7IHRoaXMuX3VuYmluZCgpIH0sXG4gIF9iaW5kKCkge1xuICAgIHRoaXMuX3VuYmluZCgpXG4gICAgY29uc3QgaXNJbnB1dFRyaWdnZXIgPSB0aGlzLmVsLmRhdGFzZXQudHJpZ2dlciA9PT0gJ2lucHV0J1xuICAgIGNvbnN0IGZpbHRlciA9IHRoaXMuZWwuZGF0YXNldC5maWx0ZXIgfHwgJ3NlcnZlcidcbiAgICBjb25zdCBvbkZpbHRlciA9IHRoaXMuZWwuZGF0YXNldC5vbkZpbHRlclxuICAgIGNvbnN0IGRlYm91bmNlID0gcGFyc2VJbnQodGhpcy5lbC5kYXRhc2V0LmRlYm91bmNlIHx8ICczMDAnLCAxMClcblxuICAgIHRoaXMuX3NlYXJjaCA9IGlzSW5wdXRUcmlnZ2VyXG4gICAgICA/IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvLWNvbWJvYm94PVwiaW5wdXQtdHJpZ2dlclwiXScpXG4gICAgICA6IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwiY29tYm9ib3gtc2VhcmNoXCJdJylcblxuICAgIGNvbnN0IHRyaWdnZXJCdG4gPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4by1jb21ib2JveD1cInRyaWdnZXJcIl0nKVxuICAgIGNvbnN0IHBvcG92ZXJJZCA9IHRyaWdnZXJCdG4/LmdldEF0dHJpYnV0ZSgncG9wb3ZlcnRhcmdldCcpIHx8IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwicG9wb3Zlci1jb250ZW50XCJdJyk/LmlkXG4gICAgdGhpcy5fcG9wb3ZlciA9IHBvcG92ZXJJZCA/IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHBvcG92ZXJJZCkgOiBudWxsXG4gICAgdGhpcy5faGlkZGVuID0gdGhpcy5lbC5jbG9zZXN0KCdbZGF0YS1leG89XCJmaWVsZFwiXScpPy5xdWVyeVNlbGVjdG9yKCdpbnB1dFt0eXBlPVwiaGlkZGVuXCJdJylcbiAgICB0aGlzLl9saXN0Ym94ID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbcm9sZT1cImxpc3Rib3hcIl0nKVxuICAgIHRoaXMuX2VtcHR5ID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJjb21ib2JveC1lbXB0eVwiXScpXG4gICAgdGhpcy5fY3JlYXRlID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJjb21ib2JveC1jcmVhdGVcIl0nKVxuXG4gICAgdGhpcy5fY2xlYXIgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cImNvbWJvYm94LWNsZWFyXCJdJylcblxuICAgIGlmICghdGhpcy5fcG9wb3ZlcikgcmV0dXJuXG5cbiAgICAvLyBDbGVhciBidXR0b25cbiAgICBpZiAodGhpcy5fY2xlYXIpIHtcbiAgICAgIHRoaXMuX29uQ2xlYXIgPSAoZSkgPT4ge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgIGlmICh0aGlzLl9oaWRkZW4pIHtcbiAgICAgICAgICB0aGlzLl9oaWRkZW4udmFsdWUgPSAnJ1xuICAgICAgICAgIHRoaXMuX2hpZGRlbi5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnaW5wdXQnLCB7IGJ1YmJsZXM6IHRydWUgfSkpXG4gICAgICAgIH1cbiAgICAgICAgLy8gUmVzZXQgdHJpZ2dlciBkaXNwbGF5XG4gICAgICAgIGNvbnN0IHZhbFNwYW4gPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cImNvbWJvYm94LXZhbHVlXCJdJylcbiAgICAgICAgaWYgKHZhbFNwYW4pIHtcbiAgICAgICAgICB2YWxTcGFuLnRleHRDb250ZW50ID0gdGhpcy5fc2VhcmNoPy5wbGFjZWhvbGRlciB8fCAnJ1xuICAgICAgICAgIHZhbFNwYW4uc2V0QXR0cmlidXRlKCdkYXRhLXBsYWNlaG9sZGVyJywgJycpXG4gICAgICAgIH1cbiAgICAgICAgLy8gQ2xlYXIgdmlzdWFsIHNlbGVjdGlvblxuICAgICAgICBpZiAodGhpcy5fbGlzdGJveCkge1xuICAgICAgICAgIHRoaXMuX2xpc3Rib3gucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZXhvPVwiY29tYm9ib3gtb3B0aW9uXCJdJykuZm9yRWFjaChvID0+IHtcbiAgICAgICAgICAgIG8uc2V0QXR0cmlidXRlKCdhcmlhLXNlbGVjdGVkJywgJ2ZhbHNlJylcbiAgICAgICAgICAgIGRlbGV0ZSBvLmRhdGFzZXQuc2VsZWN0ZWRcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLl9jbGVhci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX29uQ2xlYXIpXG4gICAgfVxuXG4gICAgLy8gVG9nZ2xlIGV2ZW50IGZvciBhcmlhLWV4cGFuZGVkXG4gICAgdGhpcy5fb25Ub2dnbGUgPSAoKSA9PiB7XG4gICAgICBjb25zdCBvcGVuID0gdGhpcy5fcG9wb3Zlci5tYXRjaGVzKCc6cG9wb3Zlci1vcGVuJylcbiAgICAgIGlmICh0cmlnZ2VyQnRuKSB0cmlnZ2VyQnRuLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsIFN0cmluZyhvcGVuKSlcbiAgICAgIGlmICh0aGlzLl9zZWFyY2gpIHRoaXMuX3NlYXJjaC5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCBTdHJpbmcob3BlbikpXG4gICAgICBpZiAob3BlbiAmJiB0aGlzLl9zZWFyY2ggJiYgIWlzSW5wdXRUcmlnZ2VyKSB7XG4gICAgICAgIHRoaXMuX3NlYXJjaC52YWx1ZSA9ICcnXG4gICAgICAgIHRoaXMuX3NlYXJjaC5mb2N1cygpXG4gICAgICAgIGlmIChmaWx0ZXIgPT09ICdjbGllbnQnKSB0aGlzLl9jbGllbnRGaWx0ZXIoJycpXG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX3BvcG92ZXIuYWRkRXZlbnRMaXN0ZW5lcigndG9nZ2xlJywgdGhpcy5fb25Ub2dnbGUpXG5cbiAgICAvLyBJbnB1dCB0cmlnZ2VyOiBvcGVuL2Nsb3NlIHZpYSBKU1xuICAgIGlmIChpc0lucHV0VHJpZ2dlciAmJiB0aGlzLl9zZWFyY2gpIHtcbiAgICAgIHRoaXMuX29uRm9jdXMgPSAoKSA9PiB7XG4gICAgICAgIHRyeSB7IHRoaXMuX3BvcG92ZXIuc2hvd1BvcG92ZXIoKSB9IGNhdGNoKF9lcnIpIHt9XG4gICAgICB9XG4gICAgICB0aGlzLl9vbkJsdXIgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBvcG92ZXIgPSB0aGlzLl9wb3BvdmVyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIGlmICghcG9wb3ZlcikgcmV0dXJuXG4gICAgICAgICAgaWYgKCFwb3BvdmVyLmNvbnRhaW5zKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IHRoaXMuX3NlYXJjaCkge1xuICAgICAgICAgICAgdHJ5IHsgcG9wb3Zlci5oaWRlUG9wb3ZlcigpIH0gY2F0Y2goX2Vycikge31cbiAgICAgICAgICB9XG4gICAgICAgIH0sIDIwMClcbiAgICAgIH1cbiAgICAgIHRoaXMuX3NlYXJjaC5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsIHRoaXMuX29uRm9jdXMpXG4gICAgICB0aGlzLl9zZWFyY2guYWRkRXZlbnRMaXN0ZW5lcignYmx1cicsIHRoaXMuX29uQmx1cilcbiAgICB9XG5cbiAgICAvLyBTZWFyY2ggaW5wdXQgaGFuZGxlclxuICAgIGlmICh0aGlzLl9zZWFyY2gpIHtcbiAgICAgIHRoaXMuX29uSW5wdXQgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdGhpcy5fc2VhcmNoLnZhbHVlXG4gICAgICAgIGlmIChmaWx0ZXIgPT09ICdjbGllbnQnKSB7XG4gICAgICAgICAgdGhpcy5fY2xpZW50RmlsdGVyKHF1ZXJ5KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9kZWJvdW5jZVRpbWVyKVxuICAgICAgICAgIHRoaXMuX2RlYm91bmNlVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGlmIChvbkZpbHRlcikgdGhpcy5wdXNoRXZlbnQob25GaWx0ZXIsIHsgcXVlcnkgfSlcbiAgICAgICAgICB9LCBkZWJvdW5jZSlcbiAgICAgICAgfVxuICAgICAgICAvLyBVcGRhdGUgY3JlYXRlIG9wdGlvbiB0ZXh0XG4gICAgICAgIGlmICh0aGlzLl9jcmVhdGUpIHtcbiAgICAgICAgICBjb25zdCBzcGFuID0gdGhpcy5fY3JlYXRlLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cImNvbWJvYm94LWNyZWF0ZS1xdWVyeVwiXScpXG4gICAgICAgICAgaWYgKHNwYW4pIHNwYW4udGV4dENvbnRlbnQgPSBxdWVyeVxuICAgICAgICAgIHRoaXMuX2NyZWF0ZS5oaWRkZW4gPSAhcXVlcnlcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5fc2VhcmNoLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgdGhpcy5fb25JbnB1dClcbiAgICB9XG5cbiAgICAvLyBPcHRpb24gY2xpY2tcbiAgICBpZiAodGhpcy5fbGlzdGJveCkge1xuICAgICAgdGhpcy5fb25DbGljayA9IChlKSA9PiB7XG4gICAgICAgIGNvbnN0IG9wdCA9IGUudGFyZ2V0LmNsb3Nlc3QoJ1tkYXRhLWV4bz1cImNvbWJvYm94LW9wdGlvblwiXTpub3QoW2RhdGEtZGlzYWJsZWRdKScpXG4gICAgICAgIGlmICghb3B0KSByZXR1cm5cbiAgICAgICAgdGhpcy5fc2VsZWN0T3B0aW9uKG9wdClcbiAgICAgIH1cbiAgICAgIHRoaXMuX2xpc3Rib3guYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9vbkNsaWNrKVxuXG4gICAgICAvLyBLZXlib2FyZFxuICAgICAgdGhpcy5fb25LZXlkb3duID0gKGUpID0+IHtcbiAgICAgICAgY29uc3Qgb3B0cyA9IFsuLi50aGlzLl9saXN0Ym94LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWV4bz1cImNvbWJvYm94LW9wdGlvblwiXTpub3QoW2RhdGEtZGlzYWJsZWRdKTpub3QoW2hpZGRlbl0pJyldXG4gICAgICAgIGlmICghb3B0cy5sZW5ndGgpIHJldHVyblxuICAgICAgICBjb25zdCBpZHggPSBvcHRzLmluZGV4T2YoZG9jdW1lbnQuYWN0aXZlRWxlbWVudClcbiAgICAgICAgbGV0IG5leHQgPSAtMVxuICAgICAgICBzd2l0Y2ggKGUua2V5KSB7XG4gICAgICAgICAgY2FzZSAnQXJyb3dEb3duJzogbmV4dCA9IGlkeCA8IG9wdHMubGVuZ3RoIC0gMSA/IGlkeCArIDEgOiAwOyBicmVha1xuICAgICAgICAgIGNhc2UgJ0Fycm93VXAnOiBuZXh0ID0gaWR4ID4gMCA/IGlkeCAtIDEgOiBvcHRzLmxlbmd0aCAtIDE7IGJyZWFrXG4gICAgICAgICAgY2FzZSAnSG9tZSc6IG5leHQgPSAwOyBicmVha1xuICAgICAgICAgIGNhc2UgJ0VuZCc6IG5leHQgPSBvcHRzLmxlbmd0aCAtIDE7IGJyZWFrXG4gICAgICAgICAgY2FzZSAnRW50ZXInOlxuICAgICAgICAgICAgaWYgKGlkeCA+PSAwKSB7IHRoaXMuX3NlbGVjdE9wdGlvbihvcHRzW2lkeF0pOyBlLnByZXZlbnREZWZhdWx0KCkgfVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgY2FzZSAnRXNjYXBlJzpcbiAgICAgICAgICAgIHRyeSB7IHRoaXMuX3BvcG92ZXIuaGlkZVBvcG92ZXIoKSB9IGNhdGNoKF9lcnIpIHt9XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICBkZWZhdWx0OiByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgb3B0c1tuZXh0XT8uZm9jdXMoKVxuICAgICAgfVxuICAgICAgdGhpcy5fcG9wb3Zlci5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5fb25LZXlkb3duKVxuICAgIH1cbiAgfSxcbiAgX2NsaWVudEZpbHRlcihxdWVyeSkge1xuICAgIGlmICghdGhpcy5fbGlzdGJveCkgcmV0dXJuXG4gICAgY29uc3QgcSA9IHF1ZXJ5LnRvTG93ZXJDYXNlKClcbiAgICBsZXQgaGFzVmlzaWJsZSA9IGZhbHNlXG4gICAgdGhpcy5fbGlzdGJveC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1leG89XCJjb21ib2JveC1vcHRpb25cIl0nKS5mb3JFYWNoKG9wdCA9PiB7XG4gICAgICBjb25zdCBtYXRjaCA9ICFxIHx8IG9wdC50ZXh0Q29udGVudC50cmltKCkudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhxKVxuICAgICAgb3B0LmhpZGRlbiA9ICFtYXRjaFxuICAgICAgaWYgKG1hdGNoKSBoYXNWaXNpYmxlID0gdHJ1ZVxuICAgIH0pXG4gICAgaWYgKHRoaXMuX2VtcHR5KSB0aGlzLl9lbXB0eS5oaWRkZW4gPSBoYXNWaXNpYmxlXG4gIH0sXG4gIF9zZWxlY3RPcHRpb24ob3B0KSB7XG4gICAgY29uc3QgdmFsdWUgPSBvcHQuZGF0YXNldC52YWx1ZVxuICAgIGlmICh0aGlzLl9oaWRkZW4pIHtcbiAgICAgIHRoaXMuX2hpZGRlbi52YWx1ZSA9IHZhbHVlXG4gICAgICB0aGlzLl9oaWRkZW4uZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2lucHV0JywgeyBidWJibGVzOiB0cnVlIH0pKVxuICAgIH1cbiAgICAvLyBVcGRhdGUgdmlzdWFsIHN0YXRlXG4gICAgaWYgKHRoaXMuX2xpc3Rib3gpIHtcbiAgICAgIHRoaXMuX2xpc3Rib3gucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZXhvPVwiY29tYm9ib3gtb3B0aW9uXCJdJykuZm9yRWFjaChvID0+IHtcbiAgICAgICAgby5zZXRBdHRyaWJ1dGUoJ2FyaWEtc2VsZWN0ZWQnLCBTdHJpbmcoby5kYXRhc2V0LnZhbHVlID09PSB2YWx1ZSkpXG4gICAgICAgIGlmIChvLmRhdGFzZXQudmFsdWUgPT09IHZhbHVlKSBvLmRhdGFzZXQuc2VsZWN0ZWQgPSAnJ1xuICAgICAgICBlbHNlIGRlbGV0ZSBvLmRhdGFzZXQuc2VsZWN0ZWRcbiAgICAgIH0pXG4gICAgfVxuICAgIC8vIFVwZGF0ZSB0cmlnZ2VyIGRpc3BsYXlcbiAgICBjb25zdCB2YWxTcGFuID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJjb21ib2JveC12YWx1ZVwiXScpXG4gICAgaWYgKHZhbFNwYW4pIHtcbiAgICAgIHZhbFNwYW4udGV4dENvbnRlbnQgPSBvcHQudGV4dENvbnRlbnQudHJpbSgpXG4gICAgICB2YWxTcGFuLnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS1wbGFjZWhvbGRlcicpXG4gICAgfVxuICAgIC8vIENsb3NlICh1bmxlc3MgbXVsdGlwbGUpXG4gICAgaWYgKCF0aGlzLmVsLmRhdGFzZXQubXVsdGlwbGUpIHtcbiAgICAgIHRyeSB7IHRoaXMuX3BvcG92ZXI/LmhpZGVQb3BvdmVyKCkgfSBjYXRjaChfZXJyKSB7fVxuICAgIH1cbiAgfSxcbiAgX3VuYmluZCgpIHtcbiAgICBjbGVhclRpbWVvdXQodGhpcy5fZGVib3VuY2VUaW1lcilcbiAgICB0aGlzLl9kZWJvdW5jZVRpbWVyID0gbnVsbFxuICAgIGlmICh0aGlzLl9wb3BvdmVyKSB7XG4gICAgICBpZiAodGhpcy5fb25Ub2dnbGUpIHRoaXMuX3BvcG92ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG9nZ2xlJywgdGhpcy5fb25Ub2dnbGUpXG4gICAgICBpZiAodGhpcy5fb25LZXlkb3duKSB0aGlzLl9wb3BvdmVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLl9vbktleWRvd24pXG4gICAgfVxuICAgIGlmICh0aGlzLl9saXN0Ym94ICYmIHRoaXMuX29uQ2xpY2spIHRoaXMuX2xpc3Rib3gucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9vbkNsaWNrKVxuICAgIGlmICh0aGlzLl9zZWFyY2gpIHtcbiAgICAgIGlmICh0aGlzLl9vbklucHV0KSB0aGlzLl9zZWFyY2gucmVtb3ZlRXZlbnRMaXN0ZW5lcignaW5wdXQnLCB0aGlzLl9vbklucHV0KVxuICAgICAgaWYgKHRoaXMuX29uRm9jdXMpIHRoaXMuX3NlYXJjaC5yZW1vdmVFdmVudExpc3RlbmVyKCdmb2N1cycsIHRoaXMuX29uRm9jdXMpXG4gICAgICBpZiAodGhpcy5fb25CbHVyKSB0aGlzLl9zZWFyY2gucmVtb3ZlRXZlbnRMaXN0ZW5lcignYmx1cicsIHRoaXMuX29uQmx1cilcbiAgICB9XG4gICAgaWYgKHRoaXMuX2NsZWFyICYmIHRoaXMuX29uQ2xlYXIpIHRoaXMuX2NsZWFyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fb25DbGVhcilcbiAgICB0aGlzLl9wb3BvdmVyID0gbnVsbFxuICAgIHRoaXMuX2xpc3Rib3ggPSBudWxsXG4gICAgdGhpcy5fc2VhcmNoID0gbnVsbFxuICAgIHRoaXMuX2NsZWFyID0gbnVsbFxuICAgIHRoaXMuX2VtcHR5ID0gbnVsbFxuICAgIHRoaXMuX2NyZWF0ZSA9IG51bGxcbiAgICB0aGlzLl9oaWRkZW4gPSBudWxsXG4gIH1cbn1cblxuZXhwb3J0IHsgRXhvQ29tYm9ib3ggfVxuIiwgImxldCBsYXN0SGlkZVRpbWUgPSAwXG5jb25zdCBTS0lQX0RFTEFZX01TID0gMzAwXG5jb25zdCBoYXNBbmNob3JQb3MgPVxuICB0eXBlb2YgQ1NTICE9PSAndW5kZWZpbmVkJyAmJiBDU1Muc3VwcG9ydHMoJ3Bvc2l0aW9uLWFyZWEnLCAndG9wJylcblxuY29uc3QgR0FQID0gNCAvLyBtYXRjaGVzIHZhcigtLWV4by1zcGFjZS0xKVxuXG5jb25zdCBFeG9Ub29sdGlwID0ge1xuICBtb3VudGVkKCkge1xuICAgIGNvbnN0IHdyYXBwZXIgPSB0aGlzLmVsXG4gICAgY29uc3QgYW5jaG9yID0gd3JhcHBlci5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJ0b29sdGlwLWFuY2hvclwiXScpXG4gICAgY29uc3QgY29udGVudCA9IHdyYXBwZXIucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwidG9vbHRpcC1jb250ZW50XCJdJylcbiAgICBpZiAoIWFuY2hvciB8fCAhY29udGVudCkgcmV0dXJuXG5cbiAgICB0aGlzLl9hbmNob3IgPSBhbmNob3JcbiAgICB0aGlzLl9jb250ZW50ID0gY29udGVudFxuICAgIHRoaXMuX3RpbWVvdXQgPSBudWxsXG4gICAgdGhpcy5fZGVjbGFyZWRTaWRlID0gY29udGVudC5kYXRhc2V0LnNpZGVcbiAgICB0aGlzLl9kZWxheSA9IHBhcnNlSW50KGNvbnRlbnQuZGF0YXNldC5kZWxheSkgfHwgNTAwXG5cbiAgICAvLyBVcGdyYWRlIHRvIHBvcG92ZXIgQVBJIFx1MjAxNCBlbmFibGVzIHRvcC1sYXllciByZW5kZXJpbmcuXG4gICAgLy8gQmVmb3JlIHRoaXMsIENTUy1vbmx5IDpob3ZlciBmYWxsYmFjayBrZWVwcyB0aGUgdG9vbHRpcCBmdW5jdGlvbmFsLlxuICAgIGNvbnRlbnQuc2V0QXR0cmlidXRlKCdwb3BvdmVyJywgJ21hbnVhbCcpXG5cbiAgICBjb25zdCBzaG93ID0gKCkgPT4ge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3RpbWVvdXQpXG4gICAgICBjb25zdCBlbGFwc2VkID0gRGF0ZS5ub3coKSAtIGxhc3RIaWRlVGltZVxuICAgICAgY29uc3Qgd2FpdCA9IGVsYXBzZWQgPCBTS0lQX0RFTEFZX01TID8gMCA6IHRoaXMuX2RlbGF5XG4gICAgICB0aGlzLl90aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRyeSB7IGNvbnRlbnQuc2hvd1BvcG92ZXIoKSB9IGNhdGNoIChfKSB7IHJldHVybiB9XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICAgICAgaWYgKCFoYXNBbmNob3JQb3MpIHRoaXMuX3Bvc2l0aW9uRmFsbGJhY2soKVxuICAgICAgICAgIHRoaXMuX2RldGVjdEZsaXAoKVxuICAgICAgICB9KVxuICAgICAgfSwgd2FpdClcbiAgICB9XG5cbiAgICBjb25zdCBoaWRlID0gKCkgPT4ge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3RpbWVvdXQpXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoY29udGVudC5tYXRjaGVzKCc6cG9wb3Zlci1vcGVuJykpIHtcbiAgICAgICAgICBjb250ZW50LmhpZGVQb3BvdmVyKClcbiAgICAgICAgICBsYXN0SGlkZVRpbWUgPSBEYXRlLm5vdygpXG4gICAgICAgICAgY29udGVudC5kYXRhc2V0LnNpZGUgPSB0aGlzLl9kZWNsYXJlZFNpZGVcbiAgICAgICAgICBpZiAoIWhhc0FuY2hvclBvcykge1xuICAgICAgICAgICAgY29udGVudC5zdHlsZS50b3AgPSAnJ1xuICAgICAgICAgICAgY29udGVudC5zdHlsZS5sZWZ0ID0gJydcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKF8pIHt9XG4gICAgfVxuXG4gICAgd3JhcHBlci5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgdGhpcy5fc2hvdyA9ICgpID0+IHNob3coKSlcbiAgICB3cmFwcGVyLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCB0aGlzLl9oaWRlID0gKCkgPT4gaGlkZSgpKVxuICAgIGFuY2hvci5hZGRFdmVudExpc3RlbmVyKCdmb2N1c2luJywgdGhpcy5fZm9jdXNJbiA9ICgpID0+IHNob3coKSlcbiAgICBhbmNob3IuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXNvdXQnLCB0aGlzLl9mb2N1c091dCA9IChlKSA9PiB7XG4gICAgICBpZiAoIXdyYXBwZXIuY29udGFpbnMoZS5yZWxhdGVkVGFyZ2V0KSkgaGlkZSgpXG4gICAgfSlcbiAgICB3cmFwcGVyLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLl9rZXlkb3duID0gKGUpID0+IHtcbiAgICAgIGlmIChlLmtleSA9PT0gJ0VzY2FwZScpIGhpZGUoKVxuICAgIH0pXG4gIH0sXG5cbiAgLyoqIERldGVjdCBpZiBhbmNob3IgcG9zaXRpb25pbmcgZmxpcHBlZCB0aGUgc2lkZSBhbmQgdXBkYXRlIGRhdGEtc2lkZSBmb3IgYXJyb3cgQ1NTLiAqL1xuICBfZGV0ZWN0RmxpcCgpIHtcbiAgICBjb25zdCBhciA9IHRoaXMuX2FuY2hvci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgIGNvbnN0IGNyID0gdGhpcy5fY29udGVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgIGxldCBhY3R1YWxcbiAgICBpZiAoY3IuYm90dG9tIDw9IGFyLnRvcCArIDEpIGFjdHVhbCA9ICd0b3AnXG4gICAgZWxzZSBpZiAoY3IudG9wID49IGFyLmJvdHRvbSAtIDEpIGFjdHVhbCA9ICdib3R0b20nXG4gICAgZWxzZSBpZiAoY3IucmlnaHQgPD0gYXIubGVmdCArIDEpIGFjdHVhbCA9ICdsZWZ0J1xuICAgIGVsc2UgaWYgKGNyLmxlZnQgPj0gYXIucmlnaHQgLSAxKSBhY3R1YWwgPSAncmlnaHQnXG4gICAgZWxzZSBhY3R1YWwgPSB0aGlzLl9kZWNsYXJlZFNpZGVcbiAgICB0aGlzLl9jb250ZW50LmRhdGFzZXQuc2lkZSA9IGFjdHVhbFxuICB9LFxuXG4gIC8qKiBKUyBwb3NpdGlvbmluZyBmb3IgYnJvd3NlcnMgd2l0aG91dCBDU1MgYW5jaG9yIHBvc2l0aW9uaW5nIChTYWZhcmkpLiAqL1xuICBfcG9zaXRpb25GYWxsYmFjaygpIHtcbiAgICBjb25zdCBhciA9IHRoaXMuX2FuY2hvci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgIGNvbnN0IGN3ID0gdGhpcy5fY29udGVudC5vZmZzZXRXaWR0aFxuICAgIGNvbnN0IGNoID0gdGhpcy5fY29udGVudC5vZmZzZXRIZWlnaHRcbiAgICBjb25zdCBzaWRlID0gdGhpcy5fZGVjbGFyZWRTaWRlXG4gICAgY29uc3QgYWxpZ24gPSB0aGlzLl9jb250ZW50LmRhdGFzZXQuYWxpZ24gfHwgJ2NlbnRlcidcbiAgICBsZXQgdG9wLCBsZWZ0XG5cbiAgICBpZiAoc2lkZSA9PT0gJ3RvcCcgfHwgc2lkZSA9PT0gJ2JvdHRvbScpIHtcbiAgICAgIHRvcCA9IHNpZGUgPT09ICd0b3AnID8gYXIudG9wIC0gY2ggLSBHQVAgOiBhci5ib3R0b20gKyBHQVBcbiAgICAgIGlmIChhbGlnbiA9PT0gJ3N0YXJ0JykgbGVmdCA9IGFyLmxlZnRcbiAgICAgIGVsc2UgaWYgKGFsaWduID09PSAnZW5kJykgbGVmdCA9IGFyLnJpZ2h0IC0gY3dcbiAgICAgIGVsc2UgbGVmdCA9IGFyLmxlZnQgKyAoYXIud2lkdGggLSBjdykgLyAyXG4gICAgfSBlbHNlIHtcbiAgICAgIGxlZnQgPSBzaWRlID09PSAnbGVmdCcgPyBhci5sZWZ0IC0gY3cgLSBHQVAgOiBhci5yaWdodCArIEdBUFxuICAgICAgdG9wID0gYXIudG9wICsgKGFyLmhlaWdodCAtIGNoKSAvIDJcbiAgICB9XG5cbiAgICB0aGlzLl9jb250ZW50LnN0eWxlLnRvcCA9IGAke3RvcH1weGBcbiAgICB0aGlzLl9jb250ZW50LnN0eWxlLmxlZnQgPSBgJHtsZWZ0fXB4YFxuICB9LFxuXG4gIGRlc3Ryb3llZCgpIHtcbiAgICBjbGVhclRpbWVvdXQodGhpcy5fdGltZW91dClcbiAgfVxufVxuXG5leHBvcnQgeyBFeG9Ub29sdGlwIH1cbiIsICJjb25zdCBFeG9Ib3ZlckNhcmQgPSB7XG4gIG1vdW50ZWQoKSB7XG4gICAgdGhpcy50cmlnZ2VyID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJob3Zlci1jYXJkLXRyaWdnZXJcIl0nKVxuICAgIHRoaXMuY29udGVudCA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwiaG92ZXItY2FyZC1jb250ZW50XCJdJylcbiAgICBpZiAoIXRoaXMudHJpZ2dlciB8fCAhdGhpcy5jb250ZW50KSByZXR1cm5cblxuICAgIHRoaXMuX3Nob3dUaW1lb3V0ID0gbnVsbFxuICAgIHRoaXMuX2hpZGVUaW1lb3V0ID0gbnVsbFxuXG4gICAgY29uc3Qgc2hvdyA9ICgpID0+IHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9oaWRlVGltZW91dClcbiAgICAgIHRoaXMuX3Nob3dUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuY29udGVudC5zZXRBdHRyaWJ1dGUoXCJkYXRhLW9wZW5cIiwgXCJcIilcbiAgICAgIH0sIDMwMClcbiAgICB9XG5cbiAgICBjb25zdCBoaWRlID0gKCkgPT4ge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3Nob3dUaW1lb3V0KVxuICAgICAgdGhpcy5faGlkZVRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5jb250ZW50LnJlbW92ZUF0dHJpYnV0ZShcImRhdGEtb3BlblwiKVxuICAgICAgfSwgMjAwKVxuICAgIH1cblxuICAgIHRoaXMudHJpZ2dlci5hZGRFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCBzaG93KVxuICAgIHRoaXMudHJpZ2dlci5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCBoaWRlKVxuICAgIHRoaXMuY29udGVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCAoKSA9PiBjbGVhclRpbWVvdXQodGhpcy5faGlkZVRpbWVvdXQpKVxuICAgIHRoaXMuY29udGVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCBoaWRlKVxuICAgIHRoaXMudHJpZ2dlci5hZGRFdmVudExpc3RlbmVyKFwiZm9jdXNcIiwgc2hvdylcbiAgICB0aGlzLnRyaWdnZXIuYWRkRXZlbnRMaXN0ZW5lcihcImJsdXJcIiwgaGlkZSlcblxuICAgIHRoaXMuX2NsZWFudXAgPSAoKSA9PiB7XG4gICAgICB0aGlzLnRyaWdnZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIiwgc2hvdylcbiAgICAgIHRoaXMudHJpZ2dlci5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCBoaWRlKVxuICAgICAgdGhpcy50cmlnZ2VyLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJmb2N1c1wiLCBzaG93KVxuICAgICAgdGhpcy50cmlnZ2VyLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJibHVyXCIsIGhpZGUpXG4gICAgfVxuICB9LFxuXG4gIGRlc3Ryb3llZCgpIHtcbiAgICBpZiAodGhpcy5fY2xlYW51cCkgdGhpcy5fY2xlYW51cCgpXG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuX3Nob3dUaW1lb3V0KVxuICAgIGNsZWFyVGltZW91dCh0aGlzLl9oaWRlVGltZW91dClcbiAgfVxufVxuXG5leHBvcnQgeyBFeG9Ib3ZlckNhcmQgfVxuIiwgImNvbnN0IEV4b0NvbnRleHRNZW51ID0ge1xuICBtb3VudGVkKCkge1xuICAgIHRoaXMudHJpZ2dlciA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwiY29udGV4dC1tZW51LXRyaWdnZXJcIl0nKVxuICAgIHRoaXMubWVudSA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwiY29udGV4dC1tZW51LWNvbnRlbnRcIl0nKVxuICAgIGlmICghdGhpcy50cmlnZ2VyIHx8ICF0aGlzLm1lbnUpIHJldHVyblxuXG4gICAgdGhpcy50cmlnZ2VyLmFkZEV2ZW50TGlzdGVuZXIoXCJjb250ZXh0bWVudVwiLCB0aGlzLl9vbkNvbnRleHQgPSAoZSkgPT4ge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICB0aGlzLm1lbnUuc3R5bGUubGVmdCA9IGUuY2xpZW50WCArIFwicHhcIlxuICAgICAgdGhpcy5tZW51LnN0eWxlLnRvcCA9IGUuY2xpZW50WSArIFwicHhcIlxuICAgICAgdGhpcy5tZW51LnNldEF0dHJpYnV0ZShcImRhdGEtb3BlblwiLCBcIlwiKVxuXG4gICAgICBjb25zdCBjbG9zZSA9IChldikgPT4ge1xuICAgICAgICBpZiAoIXRoaXMubWVudS5jb250YWlucyhldi50YXJnZXQpKSB7XG4gICAgICAgICAgdGhpcy5tZW51LnJlbW92ZUF0dHJpYnV0ZShcImRhdGEtb3BlblwiKVxuICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBjbG9zZSlcbiAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwiY29udGV4dG1lbnVcIiwgY2xvc2UpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgY2xvc2UpXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjb250ZXh0bWVudVwiLCBjbG9zZSlcbiAgICAgIH0sIDApXG4gICAgfSlcblxuICAgIHRoaXMubWVudS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5fb25JdGVtQ2xpY2sgPSAoZSkgPT4ge1xuICAgICAgY29uc3QgaXRlbSA9IGUudGFyZ2V0LmNsb3Nlc3QoJ1tkYXRhLWV4bz1cImNvbnRleHQtbWVudS1pdGVtXCJdJylcbiAgICAgIGlmIChpdGVtICYmICFpdGVtLmRpc2FibGVkKSB7XG4gICAgICAgIHRoaXMubWVudS5yZW1vdmVBdHRyaWJ1dGUoXCJkYXRhLW9wZW5cIilcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCB0aGlzLl9vbktleWRvd24gPSAoZSkgPT4ge1xuICAgICAgaWYgKGUua2V5ID09PSBcIkVzY2FwZVwiKSB0aGlzLm1lbnUucmVtb3ZlQXR0cmlidXRlKFwiZGF0YS1vcGVuXCIpXG4gICAgfSlcbiAgfSxcblxuICBkZXN0cm95ZWQoKSB7XG4gICAgaWYgKHRoaXMudHJpZ2dlciAmJiB0aGlzLl9vbkNvbnRleHQpIHRoaXMudHJpZ2dlci5yZW1vdmVFdmVudExpc3RlbmVyKFwiY29udGV4dG1lbnVcIiwgdGhpcy5fb25Db250ZXh0KVxuICB9XG59XG5cbmV4cG9ydCB7IEV4b0NvbnRleHRNZW51IH1cbiIsICJpbXBvcnQgeyBFeG9BY2NvcmRpb24gfSBmcm9tICcuL2hvb2tzL2FjY29yZGlvbi5qcydcbmltcG9ydCB7IEV4b0Nhcm91c2VsIH0gZnJvbSAnLi9ob29rcy9jYXJvdXNlbC5qcydcbmltcG9ydCB7IEV4b0NvbGxhcHNpYmxlIH0gZnJvbSAnLi9ob29rcy9jb2xsYXBzaWJsZS5qcydcbmltcG9ydCB7IEV4b0NvbW1hbmRQYWxldHRlIH0gZnJvbSAnLi9ob29rcy9jb21tYW5kX3BhbGV0dGUuanMnXG5pbXBvcnQgeyBFeG9TaWRlYmFyIH0gZnJvbSAnLi9ob29rcy9zaWRlYmFyLmpzJ1xuaW1wb3J0IHsgRXhvVGhlbWVUb2dnbGUgfSBmcm9tICcuL2hvb2tzL3RoZW1lX3RvZ2dsZS5qcydcbmltcG9ydCB7IEV4b1BvcG92ZXIgfSBmcm9tICcuL2hvb2tzL3BvcG92ZXIuanMnXG5pbXBvcnQgeyBFeG9Ecm9wZG93bk1lbnUgfSBmcm9tICcuL2hvb2tzL2Ryb3Bkb3duX21lbnUuanMnXG5pbXBvcnQgeyBFeG9TZWxlY3QgfSBmcm9tICcuL2hvb2tzL3NlbGVjdC5qcydcbmltcG9ydCB7IEV4b0NvbWJvYm94IH0gZnJvbSAnLi9ob29rcy9jb21ib2JveC5qcydcbmltcG9ydCB7IEV4b1Rvb2x0aXAgfSBmcm9tICcuL2hvb2tzL3Rvb2x0aXAuanMnXG5pbXBvcnQgeyBFeG9Ib3ZlckNhcmQgfSBmcm9tICcuL2hvb2tzL2hvdmVyX2NhcmQuanMnXG5pbXBvcnQgeyBFeG9Db250ZXh0TWVudSB9IGZyb20gJy4vaG9va3MvY29udGV4dF9tZW51LmpzJ1xuXG5jb25zdCBob29rcyA9IHtcbiAgRXhvQWNjb3JkaW9uLFxuICBFeG9DYXJvdXNlbCxcbiAgRXhvQ29sbGFwc2libGUsXG4gIEV4b0NvbW1hbmRQYWxldHRlLFxuICBFeG9TaWRlYmFyLFxuICBFeG9UaGVtZVRvZ2dsZSxcbiAgRXhvUG9wb3ZlcixcbiAgRXhvRHJvcGRvd25NZW51LFxuICBFeG9TZWxlY3QsXG4gIEV4b0NvbWJvYm94LFxuICBFeG9Ub29sdGlwLFxuICBFeG9Ib3ZlckNhcmQsXG4gIEV4b0NvbnRleHRNZW51XG59XG5cbmV4cG9ydCB7IGhvb2tzIH1cbiIsICJpbXBvcnQgeyBob29rcyBhcyBleG9Ib29rcyB9IGZyb20gXCIuLi8uLi8uLi9hc3NldHMvanMvaW5kZXguanNcIlxuXG53aW5kb3cuc3Rvcnlib29rID0ge1xuICBIb29rczogZXhvSG9va3MsXG4gIFBhcmFtczoge30sXG4gIFVwbG9hZGVyczoge31cbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7O0FBYUEsTUFBTSxlQUFlO0FBQUEsSUFDbkIsVUFBVTtBQUNSLFdBQUssWUFBWSxNQUNmLE1BQU0sS0FBSyxLQUFLLEdBQUcsaUJBQWlCLGdEQUFnRCxDQUFDO0FBRXZGLFdBQUssY0FBYyxNQUNqQixNQUFNLEtBQUssS0FBSyxHQUFHLGlCQUFpQiw4Q0FBOEMsQ0FBQztBQUVyRixXQUFLLFlBQVksTUFBTSxLQUFLLEdBQUcsUUFBUSxTQUFTO0FBQ2hELFdBQUssaUJBQWlCLE1BQU0sS0FBSyxHQUFHLGFBQWEsa0JBQWtCO0FBR25FLFdBQUssR0FBRyxpQkFBaUIsV0FBVyxLQUFLLGFBQWEsQ0FBQyxNQUFNO0FBQzNELGNBQU0sVUFBVSxFQUFFLE9BQU8sUUFBUSxnQ0FBZ0M7QUFDakUsWUFBSSxDQUFDLFFBQVM7QUFFZCxjQUFNLFdBQVcsS0FBSyxVQUFVO0FBQ2hDLGNBQU0sTUFBTSxTQUFTLFFBQVEsT0FBTztBQUNwQyxZQUFJLFFBQVEsR0FBSTtBQUVoQixZQUFJLFNBQVM7QUFFYixnQkFBUSxFQUFFLEtBQUs7QUFBQSxVQUNiLEtBQUs7QUFDSCxxQkFB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
