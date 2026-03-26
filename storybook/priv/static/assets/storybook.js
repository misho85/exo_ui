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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vYXNzZXRzL2pzL2hvb2tzL2FjY29yZGlvbi5qcyIsICIuLi8uLi8uLi8uLi9hc3NldHMvanMvaG9va3MvY2Fyb3VzZWwuanMiLCAiLi4vLi4vLi4vLi4vYXNzZXRzL2pzL2hvb2tzL2NvbW1hbmRfcGFsZXR0ZS5qcyIsICIuLi8uLi8uLi8uLi9hc3NldHMvanMvaG9va3Mvc2lkZWJhci5qcyIsICIuLi8uLi8uLi8uLi9hc3NldHMvanMvaG9va3MvdGhlbWVfdG9nZ2xlLmpzIiwgIi4uLy4uLy4uLy4uL2Fzc2V0cy9qcy9ob29rcy9wb3BvdmVyLmpzIiwgIi4uLy4uLy4uLy4uL2Fzc2V0cy9qcy9ob29rcy9kcm9wZG93bl9tZW51LmpzIiwgIi4uLy4uLy4uLy4uL2Fzc2V0cy9qcy9ob29rcy9zZWxlY3QuanMiLCAiLi4vLi4vLi4vLi4vYXNzZXRzL2pzL2hvb2tzL2NvbWJvYm94LmpzIiwgIi4uLy4uLy4uLy4uL2Fzc2V0cy9qcy9ob29rcy90b29sdGlwLmpzIiwgIi4uLy4uLy4uLy4uL2Fzc2V0cy9qcy9ob29rcy9ob3Zlcl9jYXJkLmpzIiwgIi4uLy4uLy4uLy4uL2Fzc2V0cy9qcy9ob29rcy9jb250ZXh0X21lbnUuanMiLCAiLi4vLi4vLi4vLi4vYXNzZXRzL2pzL2luZGV4LmpzIiwgIi4uLy4uLy4uL2Fzc2V0cy9qcy9zdG9yeWJvb2suanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKlxuICogRXhvQWNjb3JkaW9uIGhvb2sgXHUyMDE0IGtleWJvYXJkIG5hdmlnYXRpb24gKyBzaW5nbGUtb3BlbiBlbmZvcmNlbWVudC5cbiAqXG4gKiBSZWFkcyBkYXRhLXR5cGUgKFwic2luZ2xlXCJ8XCJtdWx0aXBsZVwiKSBhbmQgZGF0YS1jb2xsYXBzaWJsZSBmcm9tIHRoZSByb290IGVsZW1lbnQuXG4gKiAtIHNpbmdsZTogb25seSBvbmUgaXRlbSBvcGVuIGF0IGEgdGltZVxuICogLSBtdWx0aXBsZTogYW55IG51bWJlciBvZiBpdGVtcyBvcGVuIChkZWZhdWx0IGNoZWNrYm94IGJlaGF2aW9yKVxuICogLSBjb2xsYXBzaWJsZTogaW4gc2luZ2xlIG1vZGUsIGFsbG93cyBjbG9zaW5nIHRoZSBvcGVuIGl0ZW1cbiAqXG4gKiBLZXlib2FyZDpcbiAqICAgQXJyb3dEb3duIC8gQXJyb3dVcCBcdTIwMTQgbW92ZSBmb2N1cyBiZXR3ZWVuIHRyaWdnZXJzXG4gKiAgIEhvbWUgLyBFbmQgXHUyMDE0IGZvY3VzIGZpcnN0IC8gbGFzdCB0cmlnZ2VyXG4gKiAgIEVudGVyIC8gU3BhY2UgXHUyMDE0IHRvZ2dsZSBpdGVtIChoYW5kbGVkIG5hdGl2ZWx5IGJ5IGJ1dHRvbiwgYnV0IHdlIG1hbmFnZSBzaW5nbGUtbW9kZSlcbiAqL1xuY29uc3QgRXhvQWNjb3JkaW9uID0ge1xuICBtb3VudGVkKCkge1xuICAgIHRoaXMuX3RyaWdnZXJzID0gKCkgPT5cbiAgICAgIEFycmF5LmZyb20odGhpcy5lbC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1leG89XCJhY2NvcmRpb24tdHJpZ2dlclwiXTpub3QoW2Rpc2FibGVkXSknKSlcblxuICAgIHRoaXMuX2NoZWNrYm94ZXMgPSAoKSA9PlxuICAgICAgQXJyYXkuZnJvbSh0aGlzLmVsLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWV4bz1cImFjY29yZGlvbi1zdGF0ZVwiXTpub3QoW2Rpc2FibGVkXSknKSlcblxuICAgIHRoaXMuX2lzU2luZ2xlID0gKCkgPT4gdGhpcy5lbC5kYXRhc2V0LnR5cGUgPT09IFwic2luZ2xlXCJcbiAgICB0aGlzLl9pc0NvbGxhcHNpYmxlID0gKCkgPT4gdGhpcy5lbC5oYXNBdHRyaWJ1dGUoXCJkYXRhLWNvbGxhcHNpYmxlXCIpXG5cbiAgICAvLyBLZXlib2FyZCBuYXZpZ2F0aW9uXG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCB0aGlzLl9vbktleWRvd24gPSAoZSkgPT4ge1xuICAgICAgY29uc3QgdHJpZ2dlciA9IGUudGFyZ2V0LmNsb3Nlc3QoJ1tkYXRhLWV4bz1cImFjY29yZGlvbi10cmlnZ2VyXCJdJylcbiAgICAgIGlmICghdHJpZ2dlcikgcmV0dXJuXG5cbiAgICAgIGNvbnN0IHRyaWdnZXJzID0gdGhpcy5fdHJpZ2dlcnMoKVxuICAgICAgY29uc3QgaWR4ID0gdHJpZ2dlcnMuaW5kZXhPZih0cmlnZ2VyKVxuICAgICAgaWYgKGlkeCA9PT0gLTEpIHJldHVyblxuXG4gICAgICBsZXQgdGFyZ2V0ID0gbnVsbFxuXG4gICAgICBzd2l0Y2ggKGUua2V5KSB7XG4gICAgICAgIGNhc2UgXCJBcnJvd0Rvd25cIjpcbiAgICAgICAgICB0YXJnZXQgPSB0cmlnZ2Vyc1soaWR4ICsgMSkgJSB0cmlnZ2Vycy5sZW5ndGhdXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSBcIkFycm93VXBcIjpcbiAgICAgICAgICB0YXJnZXQgPSB0cmlnZ2Vyc1soaWR4IC0gMSArIHRyaWdnZXJzLmxlbmd0aCkgJSB0cmlnZ2Vycy5sZW5ndGhdXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSBcIkhvbWVcIjpcbiAgICAgICAgICB0YXJnZXQgPSB0cmlnZ2Vyc1swXVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgXCJFbmRcIjpcbiAgICAgICAgICB0YXJnZXQgPSB0cmlnZ2Vyc1t0cmlnZ2Vycy5sZW5ndGggLSAxXVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGlmICh0YXJnZXQpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIHRhcmdldC5mb2N1cygpXG4gICAgICB9XG4gICAgfSlcblxuICAgIC8vIENsaWNrIGhhbmRsaW5nIGZvciBzaW5nbGUgbW9kZSArIGNvbGxhcHNpYmxlICsgYXJpYS1leHBhbmRlZCBzeW5jXG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5fb25DbGljayA9IChlKSA9PiB7XG4gICAgICBjb25zdCB0cmlnZ2VyID0gZS50YXJnZXQuY2xvc2VzdCgnW2RhdGEtZXhvPVwiYWNjb3JkaW9uLXRyaWdnZXJcIl0nKVxuICAgICAgaWYgKCF0cmlnZ2VyIHx8IHRyaWdnZXIuZGlzYWJsZWQpIHJldHVyblxuXG4gICAgICBjb25zdCBpdGVtID0gdHJpZ2dlci5jbG9zZXN0KCdbZGF0YS1leG89XCJhY2NvcmRpb24taXRlbVwiXScpXG4gICAgICBjb25zdCBjaGVja2JveCA9IGl0ZW0/LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cImFjY29yZGlvbi1zdGF0ZVwiXScpXG4gICAgICBpZiAoIWNoZWNrYm94KSByZXR1cm5cblxuICAgICAgY29uc3Qgd2FzQ2hlY2tlZCA9IGNoZWNrYm94LmNoZWNrZWRcblxuICAgICAgaWYgKHRoaXMuX2lzU2luZ2xlKCkpIHtcbiAgICAgICAgaWYgKHdhc0NoZWNrZWQgJiYgdGhpcy5faXNDb2xsYXBzaWJsZSgpKSB7XG4gICAgICAgICAgLy8gQ2xvc2UgdGhpcyBpdGVtXG4gICAgICAgICAgY2hlY2tib3guY2hlY2tlZCA9IGZhbHNlXG4gICAgICAgICAgdGhpcy5fc3luY0FyaWEodHJpZ2dlciwgZmFsc2UpXG4gICAgICAgIH0gZWxzZSBpZiAod2FzQ2hlY2tlZCAmJiAhdGhpcy5faXNDb2xsYXBzaWJsZSgpKSB7XG4gICAgICAgICAgLy8gS2VlcCBvcGVuLCBwcmV2ZW50IHRvZ2dsZVxuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIENsb3NlIGFsbCBvdGhlcnMsIG9wZW4gdGhpcyBvbmVcbiAgICAgICAgICB0aGlzLl9jaGVja2JveGVzKCkuZm9yRWFjaCgoY2IpID0+IHtcbiAgICAgICAgICAgIGlmIChjYiAhPT0gY2hlY2tib3ggJiYgY2IuY2hlY2tlZCkge1xuICAgICAgICAgICAgICBjYi5jaGVja2VkID0gZmFsc2VcbiAgICAgICAgICAgICAgY29uc3Qgb3RoZXJUcmlnZ2VyID0gY2IucGFyZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJhY2NvcmRpb24tdHJpZ2dlclwiXScpXG4gICAgICAgICAgICAgIGlmIChvdGhlclRyaWdnZXIpIHRoaXMuX3N5bmNBcmlhKG90aGVyVHJpZ2dlciwgZmFsc2UpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgICBjaGVja2JveC5jaGVja2VkID0gdHJ1ZVxuICAgICAgICAgIHRoaXMuX3N5bmNBcmlhKHRyaWdnZXIsIHRydWUpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIE11bHRpcGxlIG1vZGUgXHUyMDE0IGp1c3QgdG9nZ2xlXG4gICAgICAgIGNoZWNrYm94LmNoZWNrZWQgPSAhd2FzQ2hlY2tlZFxuICAgICAgICB0aGlzLl9zeW5jQXJpYSh0cmlnZ2VyLCBjaGVja2JveC5jaGVja2VkKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICAvLyBTeW5jIGluaXRpYWwgYXJpYSBzdGF0ZXNcbiAgICB0aGlzLl9zeW5jQWxsQXJpYSgpXG4gIH0sXG5cbiAgdXBkYXRlZCgpIHtcbiAgICB0aGlzLl9zeW5jQWxsQXJpYSgpXG4gIH0sXG5cbiAgZGVzdHJveWVkKCkge1xuICAgIGlmICh0aGlzLl9vbktleWRvd24pIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5fb25LZXlkb3duKVxuICAgIGlmICh0aGlzLl9vbkNsaWNrKSB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLl9vbkNsaWNrKVxuICB9LFxuXG4gIF9zeW5jQXJpYSh0cmlnZ2VyLCBleHBhbmRlZCkge1xuICAgIHRyaWdnZXIuc2V0QXR0cmlidXRlKFwiYXJpYS1leHBhbmRlZFwiLCBTdHJpbmcoZXhwYW5kZWQpKVxuICB9LFxuXG4gIF9zeW5jQWxsQXJpYSgpIHtcbiAgICBjb25zdCBpdGVtcyA9IHRoaXMuZWwucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZXhvPVwiYWNjb3JkaW9uLWl0ZW1cIl0nKVxuICAgIGl0ZW1zLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgIGNvbnN0IGNoZWNrYm94ID0gaXRlbS5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJhY2NvcmRpb24tc3RhdGVcIl0nKVxuICAgICAgY29uc3QgdHJpZ2dlciA9IGl0ZW0ucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwiYWNjb3JkaW9uLXRyaWdnZXJcIl0nKVxuICAgICAgaWYgKGNoZWNrYm94ICYmIHRyaWdnZXIpIHtcbiAgICAgICAgdGhpcy5fc3luY0FyaWEodHJpZ2dlciwgY2hlY2tib3guY2hlY2tlZClcbiAgICAgIH1cbiAgICB9KVxuICB9XG59XG5cbmV4cG9ydCB7IEV4b0FjY29yZGlvbiB9XG4iLCAiLyoqXG4gKiBFeG9DYXJvdXNlbCBob29rIFx1MjAxNCBzY3JvbGxhYmxlIGNhcm91c2VsIHdpdGggcHJldi9uZXh0IGJ1dHRvbnMuXG4gKi9cbmNvbnN0IEV4b0Nhcm91c2VsID0ge1xuICBtb3VudGVkKCkge1xuICAgIHRoaXMudHJhY2sgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cImNhcm91c2VsLXRyYWNrXCJdJylcbiAgICB0aGlzLnZpZXdwb3J0ID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJjYXJvdXNlbC12aWV3cG9ydFwiXScpXG4gICAgdGhpcy5wcmV2ID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJjYXJvdXNlbC1wcmV2XCJdJylcbiAgICB0aGlzLm5leHQgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cImNhcm91c2VsLW5leHRcIl0nKVxuICAgIGlmICghdGhpcy50cmFjayB8fCAhdGhpcy52aWV3cG9ydCkgcmV0dXJuXG5cbiAgICBjb25zdCBzbGlkZXMgPSAoKSA9PiBBcnJheS5mcm9tKHRoaXMudHJhY2sucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZXhvPVwiY2Fyb3VzZWwtc2xpZGVcIl0nKSlcbiAgICBjb25zdCBsb29wID0gdGhpcy5lbC5oYXNBdHRyaWJ1dGUoXCJkYXRhLWxvb3BcIilcblxuICAgIGNvbnN0IHNjcm9sbFRvID0gKGRpcmVjdGlvbikgPT4ge1xuICAgICAgY29uc3QgcyA9IHNsaWRlcygpXG4gICAgICBpZiAocy5sZW5ndGggPT09IDApIHJldHVyblxuICAgICAgY29uc3Qgc2xpZGVXaWR0aCA9IHNbMF0ub2Zmc2V0V2lkdGhcbiAgICAgIGNvbnN0IGdhcCA9IHBhcnNlRmxvYXQoZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLnRyYWNrKS5nYXApIHx8IDBcbiAgICAgIGNvbnN0IHNjcm9sbEFtb3VudCA9IHNsaWRlV2lkdGggKyBnYXBcblxuICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gXCJuZXh0XCIpIHtcbiAgICAgICAgaWYgKGxvb3AgJiYgdGhpcy52aWV3cG9ydC5zY3JvbGxMZWZ0ID49IHRoaXMudmlld3BvcnQuc2Nyb2xsV2lkdGggLSB0aGlzLnZpZXdwb3J0Lm9mZnNldFdpZHRoIC0gNSkge1xuICAgICAgICAgIHRoaXMudmlld3BvcnQuc2Nyb2xsVG8oeyBsZWZ0OiAwLCBiZWhhdmlvcjogXCJzbW9vdGhcIiB9KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMudmlld3BvcnQuc2Nyb2xsQnkoeyBsZWZ0OiBzY3JvbGxBbW91bnQsIGJlaGF2aW9yOiBcInNtb290aFwiIH0pXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChsb29wICYmIHRoaXMudmlld3BvcnQuc2Nyb2xsTGVmdCA8PSA1KSB7XG4gICAgICAgICAgdGhpcy52aWV3cG9ydC5zY3JvbGxUbyh7IGxlZnQ6IHRoaXMudmlld3BvcnQuc2Nyb2xsV2lkdGgsIGJlaGF2aW9yOiBcInNtb290aFwiIH0pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy52aWV3cG9ydC5zY3JvbGxCeSh7IGxlZnQ6IC1zY3JvbGxBbW91bnQsIGJlaGF2aW9yOiBcInNtb290aFwiIH0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5wcmV2KSB0aGlzLnByZXYuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuX29uUHJldiA9ICgpID0+IHNjcm9sbFRvKFwicHJldlwiKSlcbiAgICBpZiAodGhpcy5uZXh0KSB0aGlzLm5leHQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuX29uTmV4dCA9ICgpID0+IHNjcm9sbFRvKFwibmV4dFwiKSlcblxuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5fb25LZXkgPSAoZSkgPT4ge1xuICAgICAgaWYgKGUua2V5ID09PSBcIkFycm93TGVmdFwiKSB7IGUucHJldmVudERlZmF1bHQoKTsgc2Nyb2xsVG8oXCJwcmV2XCIpIH1cbiAgICAgIGlmIChlLmtleSA9PT0gXCJBcnJvd1JpZ2h0XCIpIHsgZS5wcmV2ZW50RGVmYXVsdCgpOyBzY3JvbGxUbyhcIm5leHRcIikgfVxuICAgIH0pXG4gIH0sXG5cbiAgZGVzdHJveWVkKCkge1xuICAgIGlmICh0aGlzLnByZXYgJiYgdGhpcy5fb25QcmV2KSB0aGlzLnByZXYucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuX29uUHJldilcbiAgICBpZiAodGhpcy5uZXh0ICYmIHRoaXMuX29uTmV4dCkgdGhpcy5uZXh0LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLl9vbk5leHQpXG4gICAgaWYgKHRoaXMuX29uS2V5KSB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIHRoaXMuX29uS2V5KVxuICB9XG59XG5cbmV4cG9ydCB7IEV4b0Nhcm91c2VsIH1cbiIsICIvKipcbiAqIEV4b0NvbW1hbmRQYWxldHRlIGhvb2sgXHUyMDE0IEN0cmwrSyAvIENtZCtLIHNlYXJjaGFibGUgY29tbWFuZCBkaWFsb2cuXG4gKi9cbmNvbnN0IEV4b0NvbW1hbmRQYWxldHRlID0ge1xuICBtb3VudGVkKCkge1xuICAgIHRoaXMuYmFja2Ryb3AgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cImNvbW1hbmQtcGFsZXR0ZS1iYWNrZHJvcFwiXScpXG4gICAgdGhpcy5pbnB1dCA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwiY29tbWFuZC1wYWxldHRlLWlucHV0XCJdJylcbiAgICB0aGlzLmxpc3QgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cImNvbW1hbmQtcGFsZXR0ZS1saXN0XCJdJylcblxuICAgIGNvbnN0IGlzT3BlbiA9ICgpID0+IHRoaXMuZWwuY2xhc3NMaXN0LmNvbnRhaW5zKFwib3BlblwiKVxuXG4gICAgY29uc3Qgb3BlbiA9ICgpID0+IHtcbiAgICAgIHRoaXMuZWwuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIlxuICAgICAgdGhpcy5lbC5jbGFzc0xpc3QuYWRkKFwib3BlblwiKVxuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuaW5wdXQpIHRoaXMuaW5wdXQuZm9jdXMoKVxuICAgICAgfSlcbiAgICB9XG5cbiAgICBjb25zdCBjbG9zZSA9ICgpID0+IHtcbiAgICAgIHRoaXMuZWwuY2xhc3NMaXN0LnJlbW92ZShcIm9wZW5cIilcbiAgICAgIHRoaXMuZWwuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiXG4gICAgICBpZiAodGhpcy5pbnB1dCkgdGhpcy5pbnB1dC52YWx1ZSA9IFwiXCJcbiAgICB9XG5cbiAgICAvLyBHbG9iYWwgQ3RybCtLIC8gQ21kK0tcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCB0aGlzLl9vbkdsb2JhbEtleSA9IChlKSA9PiB7XG4gICAgICBpZiAoKGUubWV0YUtleSB8fCBlLmN0cmxLZXkpICYmIGUua2V5ID09PSBcImtcIikge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgaXNPcGVuKCkgPyBjbG9zZSgpIDogb3BlbigpXG4gICAgICB9XG4gICAgfSlcblxuICAgIC8vIEVzY2FwZSB0byBjbG9zZVxuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5fb25LZXkgPSAoZSkgPT4ge1xuICAgICAgaWYgKGUua2V5ID09PSBcIkVzY2FwZVwiKSBjbG9zZSgpXG4gICAgfSlcblxuICAgIC8vIENsaWNrIGJhY2tkcm9wIHRvIGNsb3NlXG4gICAgaWYgKHRoaXMuYmFja2Ryb3ApIHtcbiAgICAgIHRoaXMuYmFja2Ryb3AuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuX29uQmFja2Ryb3AgPSAoKSA9PiBjbG9zZSgpKVxuICAgIH1cbiAgfSxcblxuICBkZXN0cm95ZWQoKSB7XG4gICAgaWYgKHRoaXMuX29uR2xvYmFsS2V5KSBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCB0aGlzLl9vbkdsb2JhbEtleSlcbiAgfVxufVxuXG5leHBvcnQgeyBFeG9Db21tYW5kUGFsZXR0ZSB9XG4iLCAiLyoqXG4gKiBFeG9TaWRlYmFyIGhvb2sgXHUyMDE0IG1hbmFnZXMgY29sbGFwc2libGUgc2lkZWJhciBzdGF0ZS5cbiAqXG4gKiBSZXN0b3JlcyBjb2xsYXBzZWQvZXhwYW5kZWQgZnJvbSBsb2NhbFN0b3JhZ2Ugb24gZGVza3RvcC5cbiAqIE1vYmlsZSBzdGFydHMgY2xvc2VkLiBTZXRzIGRhdGEtc2lkZWJhci1yZWFkeSBvbiA8aHRtbD4gYWZ0ZXIgaW5pdC5cbiAqL1xuY29uc3QgRXhvU2lkZWJhciA9IHtcbiAgbW91bnRlZCgpIHtcbiAgICB0aGlzLnRvZ2dsZSA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwic2lkZWJhci10b2dnbGVcIl0nKVxuICAgIGlmICghdGhpcy50b2dnbGUpIHJldHVyblxuXG4gICAgdGhpcy5fYXBwbHlTdGF0ZSgpXG5cbiAgICAvLyBFbmFibGUgQ1NTIHRyYW5zaXRpb25zIGFmdGVyIGluaXRpYWwgc3RhdGUgKHByZXZlbnRzIEZPVUMpXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RhdGEtc2lkZWJhci1yZWFkeScsICcnKVxuICAgIH0pXG5cbiAgICAvLyBQZXJzaXN0IG9uIHRvZ2dsZVxuICAgIHRoaXMuX29uQ2hhbmdlID0gKCkgPT4ge1xuICAgICAgaWYgKHdpbmRvdy5tYXRjaE1lZGlhKCcobWluLXdpZHRoOiA3NjhweCknKS5tYXRjaGVzKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdleG8tc2lkZWJhci1jb2xsYXBzZWQnLCB0aGlzLnRvZ2dsZS5jaGVja2VkID8gJ2ZhbHNlJyA6ICd0cnVlJylcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy50b2dnbGUuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgdGhpcy5fb25DaGFuZ2UpXG4gIH0sXG5cbiAgZGVzdHJveWVkKCkge1xuICAgIGlmICh0aGlzLnRvZ2dsZSAmJiB0aGlzLl9vbkNoYW5nZSkge1xuICAgICAgdGhpcy50b2dnbGUucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgdGhpcy5fb25DaGFuZ2UpXG4gICAgfVxuICB9LFxuXG4gIHVwZGF0ZWQoKSB7XG4gICAgdGhpcy5fYXBwbHlTdGF0ZSgpXG4gIH0sXG5cbiAgX2FwcGx5U3RhdGUoKSB7XG4gICAgaWYgKCF0aGlzLnRvZ2dsZSkgcmV0dXJuXG4gICAgY29uc3QgaXNEZXNrdG9wID0gd2luZG93Lm1hdGNoTWVkaWEoJyhtaW4td2lkdGg6IDc2OHB4KScpLm1hdGNoZXNcbiAgICBpZiAoaXNEZXNrdG9wKSB7XG4gICAgICBjb25zdCBjb2xsYXBzZWQgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnZXhvLXNpZGViYXItY29sbGFwc2VkJykgPT09ICd0cnVlJ1xuICAgICAgdGhpcy50b2dnbGUuY2hlY2tlZCA9ICFjb2xsYXBzZWRcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy50b2dnbGUuY2hlY2tlZCA9IGZhbHNlXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCB7IEV4b1NpZGViYXIgfVxuIiwgImNvbnN0IEV4b1RoZW1lVG9nZ2xlID0ge1xuICBtb3VudGVkKCkge1xuICAgIHRoaXMuX2FwcGx5KHRoaXMuX2N1cnJlbnQoKSlcblxuICAgIHRoaXMuX2hhbmRsZXJzID0gW11cbiAgICB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLXRoZW1lLXZhbHVlXScpLmZvckVhY2goYnRuID0+IHtcbiAgICAgIGNvbnN0IGhhbmRsZXIgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gYnRuLmdldEF0dHJpYnV0ZSgnZGF0YS10aGVtZS12YWx1ZScpXG4gICAgICAgIHRoaXMuX2FwcGx5KHZhbHVlKVxuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnZXhvLXRoZW1lJywgdmFsdWUpXG4gICAgICB9XG4gICAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVyKVxuICAgICAgdGhpcy5faGFuZGxlcnMucHVzaCh7IGJ0biwgaGFuZGxlciB9KVxuICAgIH0pXG4gIH0sXG5cbiAgZGVzdHJveWVkKCkge1xuICAgIHRoaXMuX2hhbmRsZXJzPy5mb3JFYWNoKCh7IGJ0biwgaGFuZGxlciB9KSA9PlxuICAgICAgYnRuLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlcilcbiAgICApXG4gIH0sXG5cbiAgX2N1cnJlbnQoKSB7XG4gICAgcmV0dXJuIGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdleG8tdGhlbWUnKSB8fCAnc3lzdGVtJ1xuICB9LFxuXG4gIF9hcHBseSh0aGVtZSkge1xuICAgIGNvbnN0IHJvb3QgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnRcbiAgICAvLyBVcGRhdGUgYWN0aXZlIHN0YXRlIG9uIGJ1dHRvbnNcbiAgICB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLXRoZW1lLXZhbHVlXScpLmZvckVhY2goYnRuID0+IHtcbiAgICAgIGJ0bi50b2dnbGVBdHRyaWJ1dGUoJ2RhdGEtYWN0aXZlJywgYnRuLmdldEF0dHJpYnV0ZSgnZGF0YS10aGVtZS12YWx1ZScpID09PSB0aGVtZSlcbiAgICB9KVxuXG4gICAgaWYgKHRoZW1lID09PSAnc3lzdGVtJykge1xuICAgICAgcm9vdC5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtdGhlbWUnKVxuICAgIH0gZWxzZSB7XG4gICAgICByb290LnNldEF0dHJpYnV0ZSgnZGF0YS10aGVtZScsIHRoZW1lKVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgeyBFeG9UaGVtZVRvZ2dsZSB9XG4iLCAiY29uc3QgRXhvUG9wb3ZlciA9IHtcbiAgbW91bnRlZCgpIHsgdGhpcy5fYmluZCgpIH0sXG4gIHVwZGF0ZWQoKSB7IHRoaXMuX2JpbmQoKSB9LFxuICBkZXN0cm95ZWQoKSB7IHRoaXMuX3VuYmluZCgpIH0sXG4gIF9iaW5kKCkge1xuICAgIHRoaXMuX3VuYmluZCgpXG4gICAgY29uc3QgdHJpZ2dlciA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwicG9wb3Zlci10cmlnZ2VyXCJdJylcbiAgICBjb25zdCBpZCA9IHRyaWdnZXI/LmdldEF0dHJpYnV0ZSgncG9wb3ZlcnRhcmdldCcpXG4gICAgdGhpcy5fcG9wb3ZlciA9IGlkID8gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpIDogbnVsbFxuICAgIGlmICghdGhpcy5fcG9wb3ZlcikgcmV0dXJuXG4gICAgdGhpcy5fb25Ub2dnbGUgPSAoKSA9PiB7XG4gICAgICBjb25zdCBvcGVuID0gdGhpcy5fcG9wb3Zlci5tYXRjaGVzKCc6cG9wb3Zlci1vcGVuJylcbiAgICAgIHRyaWdnZXIuc2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJywgU3RyaW5nKG9wZW4pKVxuICAgIH1cbiAgICB0aGlzLl9wb3BvdmVyLmFkZEV2ZW50TGlzdGVuZXIoJ3RvZ2dsZScsIHRoaXMuX29uVG9nZ2xlKVxuICB9LFxuICBfdW5iaW5kKCkge1xuICAgIGlmICh0aGlzLl9wb3BvdmVyICYmIHRoaXMuX29uVG9nZ2xlKSB7XG4gICAgICB0aGlzLl9wb3BvdmVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvZ2dsZScsIHRoaXMuX29uVG9nZ2xlKVxuICAgIH1cbiAgICB0aGlzLl9wb3BvdmVyID0gbnVsbFxuICAgIHRoaXMuX29uVG9nZ2xlID0gbnVsbFxuICB9XG59XG5cbmV4cG9ydCB7IEV4b1BvcG92ZXIgfVxuIiwgImNvbnN0IEV4b0Ryb3Bkb3duTWVudSA9IHtcbiAgbW91bnRlZCgpIHsgdGhpcy5fYmluZCgpIH0sXG4gIHVwZGF0ZWQoKSB7IHRoaXMuX2JpbmQoKSB9LFxuICBkZXN0cm95ZWQoKSB7IHRoaXMuX3VuYmluZCgpIH0sXG4gIF9iaW5kKCkge1xuICAgIHRoaXMuX3VuYmluZCgpXG4gICAgdGhpcy5fbWVudSA9IHRoaXMuZWwubWF0Y2hlcygnW3JvbGU9XCJtZW51XCJdJykgPyB0aGlzLmVsIDogdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbcm9sZT1cIm1lbnVcIl0nKVxuICAgIGlmICghdGhpcy5fbWVudSkgcmV0dXJuXG4gICAgdGhpcy5fb25LZXlkb3duID0gKGUpID0+IHtcbiAgICAgIGNvbnN0IGl0ZW1zID0gWy4uLnRoaXMuX21lbnUucXVlcnlTZWxlY3RvckFsbCgnW3JvbGU9XCJtZW51aXRlbVwiXTpub3QoW2Rpc2FibGVkXSknKV1cbiAgICAgIGlmICghaXRlbXMubGVuZ3RoKSByZXR1cm5cbiAgICAgIGNvbnN0IGlkeCA9IGl0ZW1zLmluZGV4T2YoZG9jdW1lbnQuYWN0aXZlRWxlbWVudClcbiAgICAgIGxldCBuZXh0ID0gLTFcbiAgICAgIHN3aXRjaCAoZS5rZXkpIHtcbiAgICAgICAgY2FzZSAnQXJyb3dEb3duJzogbmV4dCA9IGlkeCA8IGl0ZW1zLmxlbmd0aCAtIDEgPyBpZHggKyAxIDogMDsgYnJlYWtcbiAgICAgICAgY2FzZSAnQXJyb3dVcCc6IG5leHQgPSBpZHggPiAwID8gaWR4IC0gMSA6IGl0ZW1zLmxlbmd0aCAtIDE7IGJyZWFrXG4gICAgICAgIGNhc2UgJ0hvbWUnOiBuZXh0ID0gMDsgYnJlYWtcbiAgICAgICAgY2FzZSAnRW5kJzogbmV4dCA9IGl0ZW1zLmxlbmd0aCAtIDE7IGJyZWFrXG4gICAgICAgIGRlZmF1bHQ6IHJldHVyblxuICAgICAgfVxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBpdGVtc1tuZXh0XT8uZm9jdXMoKVxuICAgIH1cbiAgICB0aGlzLl9tZW51LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLl9vbktleWRvd24pXG4gIH0sXG4gIF91bmJpbmQoKSB7XG4gICAgaWYgKHRoaXMuX21lbnUgJiYgdGhpcy5fb25LZXlkb3duKSB7XG4gICAgICB0aGlzLl9tZW51LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLl9vbktleWRvd24pXG4gICAgfVxuICAgIHRoaXMuX21lbnUgPSBudWxsXG4gICAgdGhpcy5fb25LZXlkb3duID0gbnVsbFxuICB9XG59XG5cbmV4cG9ydCB7IEV4b0Ryb3Bkb3duTWVudSB9XG4iLCAiY29uc3QgRXhvU2VsZWN0ID0ge1xuICBtb3VudGVkKCkgeyB0aGlzLl9iaW5kKCkgfSxcbiAgdXBkYXRlZCgpIHsgdGhpcy5fYmluZCgpIH0sXG4gIGRlc3Ryb3llZCgpIHsgdGhpcy5fdW5iaW5kKCkgfSxcblxuICBfYmluZCgpIHtcbiAgICB0aGlzLl91bmJpbmQoKVxuXG4gICAgdGhpcy5fdHJpZ2dlciA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvLXNlbGVjdD1cInRyaWdnZXJcIl0nKVxuICAgIGNvbnN0IHBvcG92ZXJJZCA9IHRoaXMuX3RyaWdnZXI/LmdldEF0dHJpYnV0ZSgncG9wb3ZlcnRhcmdldCcpXG4gICAgdGhpcy5fcG9wb3ZlciA9IHBvcG92ZXJJZCA/IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHBvcG92ZXJJZCkgOiBudWxsXG4gICAgdGhpcy5fbGlzdGJveCA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW3JvbGU9XCJsaXN0Ym94XCJdJylcbiAgICB0aGlzLl9oaWRkZW4gPSB0aGlzLmVsLmNsb3Nlc3QoJ1tkYXRhLWV4bz1cImZpZWxkXCJdJyk/LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W3R5cGU9XCJoaWRkZW5cIl0nKVxuXG4gICAgaWYgKCF0aGlzLl9wb3BvdmVyIHx8ICF0aGlzLl9saXN0Ym94KSByZXR1cm5cblxuICAgIC8vIFRvZ2dsZSBhcmlhLWV4cGFuZGVkIG9uIHBvcG92ZXIgb3Blbi9jbG9zZVxuICAgIHRoaXMuX29uVG9nZ2xlID0gKCkgPT4ge1xuICAgICAgY29uc3Qgb3BlbiA9IHRoaXMuX3BvcG92ZXIubWF0Y2hlcygnOnBvcG92ZXItb3BlbicpXG4gICAgICB0aGlzLl90cmlnZ2VyLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsIFN0cmluZyhvcGVuKSlcbiAgICAgIGlmIChvcGVuKSB7XG4gICAgICAgIC8vIEZvY3VzIHNlbGVjdGVkIG9yIGZpcnN0IG9wdGlvblxuICAgICAgICBjb25zdCBzZWxlY3RlZCA9IHRoaXMuX2xpc3Rib3gucXVlcnlTZWxlY3RvcignW2RhdGEtc2VsZWN0ZWRdJylcbiAgICAgICAgY29uc3QgZmlyc3QgPSB0aGlzLl9saXN0Ym94LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cInNlbGVjdC1vcHRpb25cIl06bm90KFtkYXRhLWRpc2FibGVkXSknKVxuICAgICAgICBjb25zdCB0YXJnZXQgPSBzZWxlY3RlZCB8fCBmaXJzdFxuICAgICAgICBpZiAodGFyZ2V0KSB0YXJnZXQuZm9jdXMoKVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLl9wb3BvdmVyLmFkZEV2ZW50TGlzdGVuZXIoJ3RvZ2dsZScsIHRoaXMuX29uVG9nZ2xlKVxuXG4gICAgLy8gQ2xpY2sgb24gb3B0aW9uXG4gICAgdGhpcy5fb25DbGljayA9IChlKSA9PiB7XG4gICAgICBjb25zdCBvcHQgPSBlLnRhcmdldC5jbG9zZXN0KCdbZGF0YS1leG89XCJzZWxlY3Qtb3B0aW9uXCJdJylcbiAgICAgIGlmICghb3B0IHx8IG9wdC5oYXNBdHRyaWJ1dGUoJ2RhdGEtZGlzYWJsZWQnKSkgcmV0dXJuXG4gICAgICB0aGlzLl9zZWxlY3RPcHRpb24ob3B0KVxuICAgIH1cbiAgICB0aGlzLl9saXN0Ym94LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fb25DbGljaylcblxuICAgIC8vIEtleWJvYXJkIG5hdmlnYXRpb25cbiAgICB0aGlzLl9vbktleWRvd24gPSAoZSkgPT4ge1xuICAgICAgY29uc3Qgb3B0aW9ucyA9IFsuLi50aGlzLl9saXN0Ym94LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWV4bz1cInNlbGVjdC1vcHRpb25cIl06bm90KFtkYXRhLWRpc2FibGVkXSknKV1cbiAgICAgIGlmICghb3B0aW9ucy5sZW5ndGgpIHJldHVyblxuICAgICAgY29uc3QgaWR4ID0gb3B0aW9ucy5pbmRleE9mKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpXG4gICAgICBsZXQgbmV4dCA9IC0xXG5cbiAgICAgIHN3aXRjaCAoZS5rZXkpIHtcbiAgICAgICAgY2FzZSAnQXJyb3dEb3duJzpcbiAgICAgICAgICBuZXh0ID0gaWR4IDwgb3B0aW9ucy5sZW5ndGggLSAxID8gaWR4ICsgMSA6IDBcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlICdBcnJvd1VwJzpcbiAgICAgICAgICBuZXh0ID0gaWR4ID4gMCA/IGlkeCAtIDEgOiBvcHRpb25zLmxlbmd0aCAtIDFcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlICdIb21lJzpcbiAgICAgICAgICBuZXh0ID0gMFxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgJ0VuZCc6XG4gICAgICAgICAgbmV4dCA9IG9wdGlvbnMubGVuZ3RoIC0gMVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgJ0VudGVyJzpcbiAgICAgICAgY2FzZSAnICc6XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgaWYgKGlkeCA+PSAwKSB0aGlzLl9zZWxlY3RPcHRpb24ob3B0aW9uc1tpZHhdKVxuICAgICAgICAgIHJldHVyblxuICAgICAgICBjYXNlICdFc2NhcGUnOlxuICAgICAgICAgIHRoaXMuX3BvcG92ZXIuaGlkZVBvcG92ZXIoKVxuICAgICAgICAgIHRoaXMuX3RyaWdnZXIuZm9jdXMoKVxuICAgICAgICAgIHJldHVyblxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIC8vIFR5cGUtYWhlYWQ6IGp1bXAgdG8gb3B0aW9uIHN0YXJ0aW5nIHdpdGggdHlwZWQgY2hhcmFjdGVyXG4gICAgICAgICAgdGhpcy5fdHlwZUFoZWFkKGUua2V5LCBvcHRpb25zKVxuICAgICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIGlmIChuZXh0ID49IDApIG9wdGlvbnNbbmV4dF0uZm9jdXMoKVxuICAgIH1cbiAgICB0aGlzLl9saXN0Ym94LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLl9vbktleWRvd24pXG4gIH0sXG5cbiAgX3NlbGVjdE9wdGlvbihvcHQpIHtcbiAgICBjb25zdCB2YWx1ZSA9IG9wdC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdmFsdWUnKVxuICAgIGNvbnN0IHRleHQgPSBvcHQudGV4dENvbnRlbnQudHJpbSgpXG5cbiAgICAvLyBVcGRhdGUgaGlkZGVuIGlucHV0XG4gICAgaWYgKHRoaXMuX2hpZGRlbikge1xuICAgICAgdGhpcy5faGlkZGVuLnZhbHVlID0gdmFsdWVcbiAgICAgIHRoaXMuX2hpZGRlbi5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnaW5wdXQnLCB7IGJ1YmJsZXM6IHRydWUgfSkpXG4gICAgfVxuXG4gICAgLy8gVXBkYXRlIGFyaWEtc2VsZWN0ZWQgYW5kIGRhdGEtc2VsZWN0ZWQgb24gYWxsIG9wdGlvbnNcbiAgICB0aGlzLl9saXN0Ym94LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWV4bz1cInNlbGVjdC1vcHRpb25cIl0nKS5mb3JFYWNoKChvKSA9PiB7XG4gICAgICBjb25zdCBpc1NlbGVjdGVkID0gby5nZXRBdHRyaWJ1dGUoJ2RhdGEtdmFsdWUnKSA9PT0gdmFsdWVcbiAgICAgIG8uc2V0QXR0cmlidXRlKCdhcmlhLXNlbGVjdGVkJywgU3RyaW5nKGlzU2VsZWN0ZWQpKVxuICAgICAgaWYgKGlzU2VsZWN0ZWQpIHtcbiAgICAgICAgby5zZXRBdHRyaWJ1dGUoJ2RhdGEtc2VsZWN0ZWQnLCAnJylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG8ucmVtb3ZlQXR0cmlidXRlKCdkYXRhLXNlbGVjdGVkJylcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgLy8gVXBkYXRlIHRyaWdnZXIgZGlzcGxheSB0ZXh0XG4gICAgY29uc3QgdmFsdWVFbCA9IHRoaXMuX3RyaWdnZXIucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwic2VsZWN0LXZhbHVlXCJdJylcbiAgICBpZiAodmFsdWVFbCkgdmFsdWVFbC50ZXh0Q29udGVudCA9IHRleHRcblxuICAgIC8vIENsb3NlIHBvcG92ZXJcbiAgICB0aGlzLl9wb3BvdmVyLmhpZGVQb3BvdmVyKClcbiAgICB0aGlzLl90cmlnZ2VyLmZvY3VzKClcbiAgfSxcblxuICBfdHlwZUFoZWFkKGNoYXIsIG9wdGlvbnMpIHtcbiAgICBpZiAoY2hhci5sZW5ndGggIT09IDEpIHJldHVyblxuICAgIGNvbnN0IGxvd2VyID0gY2hhci50b0xvd2VyQ2FzZSgpXG4gICAgY29uc3QgY3VycmVudElkeCA9IG9wdGlvbnMuaW5kZXhPZihkb2N1bWVudC5hY3RpdmVFbGVtZW50KVxuICAgIGNvbnN0IHN0YXJ0ID0gY3VycmVudElkeCArIDFcbiAgICBjb25zdCByb3RhdGVkID0gWy4uLm9wdGlvbnMuc2xpY2Uoc3RhcnQpLCAuLi5vcHRpb25zLnNsaWNlKDAsIHN0YXJ0KV1cbiAgICBjb25zdCBtYXRjaCA9IHJvdGF0ZWQuZmluZChvID0+IG8udGV4dENvbnRlbnQudHJpbSgpLnRvTG93ZXJDYXNlKCkuc3RhcnRzV2l0aChsb3dlcikpXG4gICAgaWYgKG1hdGNoKSBtYXRjaC5mb2N1cygpXG4gIH0sXG5cbiAgX3VuYmluZCgpIHtcbiAgICBpZiAodGhpcy5fcG9wb3ZlciAmJiB0aGlzLl9vblRvZ2dsZSkge1xuICAgICAgdGhpcy5fcG9wb3Zlci5yZW1vdmVFdmVudExpc3RlbmVyKCd0b2dnbGUnLCB0aGlzLl9vblRvZ2dsZSlcbiAgICB9XG4gICAgaWYgKHRoaXMuX2xpc3Rib3ggJiYgdGhpcy5fb25DbGljaykge1xuICAgICAgdGhpcy5fbGlzdGJveC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX29uQ2xpY2spXG4gICAgfVxuICAgIGlmICh0aGlzLl9saXN0Ym94ICYmIHRoaXMuX29uS2V5ZG93bikge1xuICAgICAgdGhpcy5fbGlzdGJveC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5fb25LZXlkb3duKVxuICAgIH1cbiAgICB0aGlzLl90cmlnZ2VyID0gbnVsbFxuICAgIHRoaXMuX3BvcG92ZXIgPSBudWxsXG4gICAgdGhpcy5fbGlzdGJveCA9IG51bGxcbiAgICB0aGlzLl9oaWRkZW4gPSBudWxsXG4gICAgdGhpcy5fb25Ub2dnbGUgPSBudWxsXG4gICAgdGhpcy5fb25DbGljayA9IG51bGxcbiAgICB0aGlzLl9vbktleWRvd24gPSBudWxsXG4gIH1cbn1cblxuZXhwb3J0IHsgRXhvU2VsZWN0IH1cbiIsICJjb25zdCBFeG9Db21ib2JveCA9IHtcbiAgbW91bnRlZCgpIHsgdGhpcy5fYmluZCgpIH0sXG4gIHVwZGF0ZWQoKSB7IHRoaXMuX2JpbmQoKSB9LFxuICBkZXN0cm95ZWQoKSB7IHRoaXMuX3VuYmluZCgpIH0sXG4gIF9iaW5kKCkge1xuICAgIHRoaXMuX3VuYmluZCgpXG4gICAgY29uc3QgaXNJbnB1dFRyaWdnZXIgPSB0aGlzLmVsLmRhdGFzZXQudHJpZ2dlciA9PT0gJ2lucHV0J1xuICAgIGNvbnN0IGZpbHRlciA9IHRoaXMuZWwuZGF0YXNldC5maWx0ZXIgfHwgJ3NlcnZlcidcbiAgICBjb25zdCBvbkZpbHRlciA9IHRoaXMuZWwuZGF0YXNldC5vbkZpbHRlclxuICAgIGNvbnN0IGRlYm91bmNlID0gcGFyc2VJbnQodGhpcy5lbC5kYXRhc2V0LmRlYm91bmNlIHx8ICczMDAnLCAxMClcblxuICAgIHRoaXMuX3NlYXJjaCA9IGlzSW5wdXRUcmlnZ2VyXG4gICAgICA/IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvLWNvbWJvYm94PVwiaW5wdXQtdHJpZ2dlclwiXScpXG4gICAgICA6IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwiY29tYm9ib3gtc2VhcmNoXCJdJylcblxuICAgIGNvbnN0IHRyaWdnZXJCdG4gPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4by1jb21ib2JveD1cInRyaWdnZXJcIl0nKVxuICAgIGNvbnN0IHBvcG92ZXJJZCA9IHRyaWdnZXJCdG4/LmdldEF0dHJpYnV0ZSgncG9wb3ZlcnRhcmdldCcpIHx8IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwicG9wb3Zlci1jb250ZW50XCJdJyk/LmlkXG4gICAgdGhpcy5fcG9wb3ZlciA9IHBvcG92ZXJJZCA/IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHBvcG92ZXJJZCkgOiBudWxsXG4gICAgdGhpcy5faGlkZGVuID0gdGhpcy5lbC5jbG9zZXN0KCdbZGF0YS1leG89XCJmaWVsZFwiXScpPy5xdWVyeVNlbGVjdG9yKCdpbnB1dFt0eXBlPVwiaGlkZGVuXCJdJylcbiAgICB0aGlzLl9saXN0Ym94ID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbcm9sZT1cImxpc3Rib3hcIl0nKVxuICAgIHRoaXMuX2VtcHR5ID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJjb21ib2JveC1lbXB0eVwiXScpXG4gICAgdGhpcy5fY3JlYXRlID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJjb21ib2JveC1jcmVhdGVcIl0nKVxuXG4gICAgdGhpcy5fY2xlYXIgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cImNvbWJvYm94LWNsZWFyXCJdJylcblxuICAgIGlmICghdGhpcy5fcG9wb3ZlcikgcmV0dXJuXG5cbiAgICAvLyBDbGVhciBidXR0b25cbiAgICBpZiAodGhpcy5fY2xlYXIpIHtcbiAgICAgIHRoaXMuX29uQ2xlYXIgPSAoZSkgPT4ge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgIGlmICh0aGlzLl9oaWRkZW4pIHtcbiAgICAgICAgICB0aGlzLl9oaWRkZW4udmFsdWUgPSAnJ1xuICAgICAgICAgIHRoaXMuX2hpZGRlbi5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnaW5wdXQnLCB7IGJ1YmJsZXM6IHRydWUgfSkpXG4gICAgICAgIH1cbiAgICAgICAgLy8gUmVzZXQgdHJpZ2dlciBkaXNwbGF5XG4gICAgICAgIGNvbnN0IHZhbFNwYW4gPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cImNvbWJvYm94LXZhbHVlXCJdJylcbiAgICAgICAgaWYgKHZhbFNwYW4pIHZhbFNwYW4udGV4dENvbnRlbnQgPSB0aGlzLl9zZWFyY2g/LnBsYWNlaG9sZGVyIHx8ICcnXG4gICAgICAgIC8vIENsZWFyIHZpc3VhbCBzZWxlY3Rpb25cbiAgICAgICAgaWYgKHRoaXMuX2xpc3Rib3gpIHtcbiAgICAgICAgICB0aGlzLl9saXN0Ym94LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWV4bz1cImNvbWJvYm94LW9wdGlvblwiXScpLmZvckVhY2gobyA9PiB7XG4gICAgICAgICAgICBvLnNldEF0dHJpYnV0ZSgnYXJpYS1zZWxlY3RlZCcsICdmYWxzZScpXG4gICAgICAgICAgICBkZWxldGUgby5kYXRhc2V0LnNlbGVjdGVkXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5fY2xlYXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9vbkNsZWFyKVxuICAgIH1cblxuICAgIC8vIFRvZ2dsZSBldmVudCBmb3IgYXJpYS1leHBhbmRlZFxuICAgIHRoaXMuX29uVG9nZ2xlID0gKCkgPT4ge1xuICAgICAgY29uc3Qgb3BlbiA9IHRoaXMuX3BvcG92ZXIubWF0Y2hlcygnOnBvcG92ZXItb3BlbicpXG4gICAgICBpZiAodHJpZ2dlckJ0bikgdHJpZ2dlckJ0bi5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCBTdHJpbmcob3BlbikpXG4gICAgICBpZiAodGhpcy5fc2VhcmNoKSB0aGlzLl9zZWFyY2guc2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJywgU3RyaW5nKG9wZW4pKVxuICAgICAgaWYgKG9wZW4gJiYgdGhpcy5fc2VhcmNoICYmICFpc0lucHV0VHJpZ2dlcikge1xuICAgICAgICB0aGlzLl9zZWFyY2gudmFsdWUgPSAnJ1xuICAgICAgICB0aGlzLl9zZWFyY2guZm9jdXMoKVxuICAgICAgICBpZiAoZmlsdGVyID09PSAnY2xpZW50JykgdGhpcy5fY2xpZW50RmlsdGVyKCcnKVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLl9wb3BvdmVyLmFkZEV2ZW50TGlzdGVuZXIoJ3RvZ2dsZScsIHRoaXMuX29uVG9nZ2xlKVxuXG4gICAgLy8gSW5wdXQgdHJpZ2dlcjogb3Blbi9jbG9zZSB2aWEgSlNcbiAgICBpZiAoaXNJbnB1dFRyaWdnZXIgJiYgdGhpcy5fc2VhcmNoKSB7XG4gICAgICB0aGlzLl9vbkZvY3VzID0gKCkgPT4ge1xuICAgICAgICB0cnkgeyB0aGlzLl9wb3BvdmVyLnNob3dQb3BvdmVyKCkgfSBjYXRjaChfZXJyKSB7fVxuICAgICAgfVxuICAgICAgdGhpcy5fb25CbHVyID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBwb3BvdmVyID0gdGhpcy5fcG9wb3ZlclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBpZiAoIXBvcG92ZXIpIHJldHVyblxuICAgICAgICAgIGlmICghcG9wb3Zlci5jb250YWlucyhkb2N1bWVudC5hY3RpdmVFbGVtZW50KSAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9PSB0aGlzLl9zZWFyY2gpIHtcbiAgICAgICAgICAgIHRyeSB7IHBvcG92ZXIuaGlkZVBvcG92ZXIoKSB9IGNhdGNoKF9lcnIpIHt9XG4gICAgICAgICAgfVxuICAgICAgICB9LCAyMDApXG4gICAgICB9XG4gICAgICB0aGlzLl9zZWFyY2guYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCB0aGlzLl9vbkZvY3VzKVxuICAgICAgdGhpcy5fc2VhcmNoLmFkZEV2ZW50TGlzdGVuZXIoJ2JsdXInLCB0aGlzLl9vbkJsdXIpXG4gICAgfVxuXG4gICAgLy8gU2VhcmNoIGlucHV0IGhhbmRsZXJcbiAgICBpZiAodGhpcy5fc2VhcmNoKSB7XG4gICAgICB0aGlzLl9vbklucHV0ID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBxdWVyeSA9IHRoaXMuX3NlYXJjaC52YWx1ZVxuICAgICAgICBpZiAoZmlsdGVyID09PSAnY2xpZW50Jykge1xuICAgICAgICAgIHRoaXMuX2NsaWVudEZpbHRlcihxdWVyeSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5fZGVib3VuY2VUaW1lcilcbiAgICAgICAgICB0aGlzLl9kZWJvdW5jZVRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBpZiAob25GaWx0ZXIpIHRoaXMucHVzaEV2ZW50KG9uRmlsdGVyLCB7IHF1ZXJ5IH0pXG4gICAgICAgICAgfSwgZGVib3VuY2UpXG4gICAgICAgIH1cbiAgICAgICAgLy8gVXBkYXRlIGNyZWF0ZSBvcHRpb24gdGV4dFxuICAgICAgICBpZiAodGhpcy5fY3JlYXRlKSB7XG4gICAgICAgICAgY29uc3Qgc3BhbiA9IHRoaXMuX2NyZWF0ZS5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJjb21ib2JveC1jcmVhdGUtcXVlcnlcIl0nKVxuICAgICAgICAgIGlmIChzcGFuKSBzcGFuLnRleHRDb250ZW50ID0gcXVlcnlcbiAgICAgICAgICB0aGlzLl9jcmVhdGUuaGlkZGVuID0gIXF1ZXJ5XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuX3NlYXJjaC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIHRoaXMuX29uSW5wdXQpXG4gICAgfVxuXG4gICAgLy8gT3B0aW9uIGNsaWNrXG4gICAgaWYgKHRoaXMuX2xpc3Rib3gpIHtcbiAgICAgIHRoaXMuX29uQ2xpY2sgPSAoZSkgPT4ge1xuICAgICAgICBjb25zdCBvcHQgPSBlLnRhcmdldC5jbG9zZXN0KCdbZGF0YS1leG89XCJjb21ib2JveC1vcHRpb25cIl06bm90KFtkYXRhLWRpc2FibGVkXSknKVxuICAgICAgICBpZiAoIW9wdCkgcmV0dXJuXG4gICAgICAgIHRoaXMuX3NlbGVjdE9wdGlvbihvcHQpXG4gICAgICB9XG4gICAgICB0aGlzLl9saXN0Ym94LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fb25DbGljaylcblxuICAgICAgLy8gS2V5Ym9hcmRcbiAgICAgIHRoaXMuX29uS2V5ZG93biA9IChlKSA9PiB7XG4gICAgICAgIGNvbnN0IG9wdHMgPSBbLi4udGhpcy5fbGlzdGJveC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1leG89XCJjb21ib2JveC1vcHRpb25cIl06bm90KFtkYXRhLWRpc2FibGVkXSk6bm90KFtoaWRkZW5dKScpXVxuICAgICAgICBpZiAoIW9wdHMubGVuZ3RoKSByZXR1cm5cbiAgICAgICAgY29uc3QgaWR4ID0gb3B0cy5pbmRleE9mKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpXG4gICAgICAgIGxldCBuZXh0ID0gLTFcbiAgICAgICAgc3dpdGNoIChlLmtleSkge1xuICAgICAgICAgIGNhc2UgJ0Fycm93RG93bic6IG5leHQgPSBpZHggPCBvcHRzLmxlbmd0aCAtIDEgPyBpZHggKyAxIDogMDsgYnJlYWtcbiAgICAgICAgICBjYXNlICdBcnJvd1VwJzogbmV4dCA9IGlkeCA+IDAgPyBpZHggLSAxIDogb3B0cy5sZW5ndGggLSAxOyBicmVha1xuICAgICAgICAgIGNhc2UgJ0hvbWUnOiBuZXh0ID0gMDsgYnJlYWtcbiAgICAgICAgICBjYXNlICdFbmQnOiBuZXh0ID0gb3B0cy5sZW5ndGggLSAxOyBicmVha1xuICAgICAgICAgIGNhc2UgJ0VudGVyJzpcbiAgICAgICAgICAgIGlmIChpZHggPj0gMCkgeyB0aGlzLl9zZWxlY3RPcHRpb24ob3B0c1tpZHhdKTsgZS5wcmV2ZW50RGVmYXVsdCgpIH1cbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgIGNhc2UgJ0VzY2FwZSc6XG4gICAgICAgICAgICB0cnkgeyB0aGlzLl9wb3BvdmVyLmhpZGVQb3BvdmVyKCkgfSBjYXRjaChfZXJyKSB7fVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgZGVmYXVsdDogcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIG9wdHNbbmV4dF0/LmZvY3VzKClcbiAgICAgIH1cbiAgICAgIHRoaXMuX3BvcG92ZXIuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX29uS2V5ZG93bilcbiAgICB9XG4gIH0sXG4gIF9jbGllbnRGaWx0ZXIocXVlcnkpIHtcbiAgICBpZiAoIXRoaXMuX2xpc3Rib3gpIHJldHVyblxuICAgIGNvbnN0IHEgPSBxdWVyeS50b0xvd2VyQ2FzZSgpXG4gICAgbGV0IGhhc1Zpc2libGUgPSBmYWxzZVxuICAgIHRoaXMuX2xpc3Rib3gucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZXhvPVwiY29tYm9ib3gtb3B0aW9uXCJdJykuZm9yRWFjaChvcHQgPT4ge1xuICAgICAgY29uc3QgbWF0Y2ggPSAhcSB8fCBvcHQudGV4dENvbnRlbnQudHJpbSgpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMocSlcbiAgICAgIG9wdC5oaWRkZW4gPSAhbWF0Y2hcbiAgICAgIGlmIChtYXRjaCkgaGFzVmlzaWJsZSA9IHRydWVcbiAgICB9KVxuICAgIGlmICh0aGlzLl9lbXB0eSkgdGhpcy5fZW1wdHkuaGlkZGVuID0gaGFzVmlzaWJsZVxuICB9LFxuICBfc2VsZWN0T3B0aW9uKG9wdCkge1xuICAgIGNvbnN0IHZhbHVlID0gb3B0LmRhdGFzZXQudmFsdWVcbiAgICBpZiAodGhpcy5faGlkZGVuKSB7XG4gICAgICB0aGlzLl9oaWRkZW4udmFsdWUgPSB2YWx1ZVxuICAgICAgdGhpcy5faGlkZGVuLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdpbnB1dCcsIHsgYnViYmxlczogdHJ1ZSB9KSlcbiAgICB9XG4gICAgLy8gVXBkYXRlIHZpc3VhbCBzdGF0ZVxuICAgIGlmICh0aGlzLl9saXN0Ym94KSB7XG4gICAgICB0aGlzLl9saXN0Ym94LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWV4bz1cImNvbWJvYm94LW9wdGlvblwiXScpLmZvckVhY2gobyA9PiB7XG4gICAgICAgIG8uc2V0QXR0cmlidXRlKCdhcmlhLXNlbGVjdGVkJywgU3RyaW5nKG8uZGF0YXNldC52YWx1ZSA9PT0gdmFsdWUpKVxuICAgICAgICBpZiAoby5kYXRhc2V0LnZhbHVlID09PSB2YWx1ZSkgby5kYXRhc2V0LnNlbGVjdGVkID0gJydcbiAgICAgICAgZWxzZSBkZWxldGUgby5kYXRhc2V0LnNlbGVjdGVkXG4gICAgICB9KVxuICAgIH1cbiAgICAvLyBVcGRhdGUgdHJpZ2dlciBkaXNwbGF5XG4gICAgY29uc3QgdmFsU3BhbiA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwiY29tYm9ib3gtdmFsdWVcIl0nKVxuICAgIGlmICh2YWxTcGFuKSB2YWxTcGFuLnRleHRDb250ZW50ID0gb3B0LnRleHRDb250ZW50LnRyaW0oKVxuICAgIC8vIENsb3NlICh1bmxlc3MgbXVsdGlwbGUpXG4gICAgaWYgKCF0aGlzLmVsLmRhdGFzZXQubXVsdGlwbGUpIHtcbiAgICAgIHRyeSB7IHRoaXMuX3BvcG92ZXI/LmhpZGVQb3BvdmVyKCkgfSBjYXRjaChfZXJyKSB7fVxuICAgIH1cbiAgfSxcbiAgX3VuYmluZCgpIHtcbiAgICBjbGVhclRpbWVvdXQodGhpcy5fZGVib3VuY2VUaW1lcilcbiAgICB0aGlzLl9kZWJvdW5jZVRpbWVyID0gbnVsbFxuICAgIGlmICh0aGlzLl9wb3BvdmVyKSB7XG4gICAgICBpZiAodGhpcy5fb25Ub2dnbGUpIHRoaXMuX3BvcG92ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG9nZ2xlJywgdGhpcy5fb25Ub2dnbGUpXG4gICAgICBpZiAodGhpcy5fb25LZXlkb3duKSB0aGlzLl9wb3BvdmVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLl9vbktleWRvd24pXG4gICAgfVxuICAgIGlmICh0aGlzLl9saXN0Ym94ICYmIHRoaXMuX29uQ2xpY2spIHRoaXMuX2xpc3Rib3gucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9vbkNsaWNrKVxuICAgIGlmICh0aGlzLl9zZWFyY2gpIHtcbiAgICAgIGlmICh0aGlzLl9vbklucHV0KSB0aGlzLl9zZWFyY2gucmVtb3ZlRXZlbnRMaXN0ZW5lcignaW5wdXQnLCB0aGlzLl9vbklucHV0KVxuICAgICAgaWYgKHRoaXMuX29uRm9jdXMpIHRoaXMuX3NlYXJjaC5yZW1vdmVFdmVudExpc3RlbmVyKCdmb2N1cycsIHRoaXMuX29uRm9jdXMpXG4gICAgICBpZiAodGhpcy5fb25CbHVyKSB0aGlzLl9zZWFyY2gucmVtb3ZlRXZlbnRMaXN0ZW5lcignYmx1cicsIHRoaXMuX29uQmx1cilcbiAgICB9XG4gICAgaWYgKHRoaXMuX2NsZWFyICYmIHRoaXMuX29uQ2xlYXIpIHRoaXMuX2NsZWFyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fb25DbGVhcilcbiAgICB0aGlzLl9wb3BvdmVyID0gbnVsbFxuICAgIHRoaXMuX2xpc3Rib3ggPSBudWxsXG4gICAgdGhpcy5fc2VhcmNoID0gbnVsbFxuICAgIHRoaXMuX2NsZWFyID0gbnVsbFxuICAgIHRoaXMuX2VtcHR5ID0gbnVsbFxuICAgIHRoaXMuX2NyZWF0ZSA9IG51bGxcbiAgICB0aGlzLl9oaWRkZW4gPSBudWxsXG4gIH1cbn1cblxuZXhwb3J0IHsgRXhvQ29tYm9ib3ggfVxuIiwgImxldCBsYXN0SGlkZVRpbWUgPSAwXG5jb25zdCBTS0lQX0RFTEFZX01TID0gMzAwXG5jb25zdCBoYXNBbmNob3JQb3MgPVxuICB0eXBlb2YgQ1NTICE9PSAndW5kZWZpbmVkJyAmJiBDU1Muc3VwcG9ydHMoJ3Bvc2l0aW9uLWFyZWEnLCAndG9wJylcblxuY29uc3QgR0FQID0gNCAvLyBtYXRjaGVzIHZhcigtLWV4by1zcGFjZS0xKVxuXG5jb25zdCBFeG9Ub29sdGlwID0ge1xuICBtb3VudGVkKCkge1xuICAgIGNvbnN0IHdyYXBwZXIgPSB0aGlzLmVsXG4gICAgY29uc3QgYW5jaG9yID0gd3JhcHBlci5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJ0b29sdGlwLWFuY2hvclwiXScpXG4gICAgY29uc3QgY29udGVudCA9IHdyYXBwZXIucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwidG9vbHRpcC1jb250ZW50XCJdJylcbiAgICBpZiAoIWFuY2hvciB8fCAhY29udGVudCkgcmV0dXJuXG5cbiAgICB0aGlzLl9hbmNob3IgPSBhbmNob3JcbiAgICB0aGlzLl9jb250ZW50ID0gY29udGVudFxuICAgIHRoaXMuX3RpbWVvdXQgPSBudWxsXG4gICAgdGhpcy5fZGVjbGFyZWRTaWRlID0gY29udGVudC5kYXRhc2V0LnNpZGVcbiAgICB0aGlzLl9kZWxheSA9IHBhcnNlSW50KGNvbnRlbnQuZGF0YXNldC5kZWxheSkgfHwgNTAwXG5cbiAgICAvLyBVcGdyYWRlIHRvIHBvcG92ZXIgQVBJIFx1MjAxNCBlbmFibGVzIHRvcC1sYXllciByZW5kZXJpbmcuXG4gICAgLy8gQmVmb3JlIHRoaXMsIENTUy1vbmx5IDpob3ZlciBmYWxsYmFjayBrZWVwcyB0aGUgdG9vbHRpcCBmdW5jdGlvbmFsLlxuICAgIGNvbnRlbnQuc2V0QXR0cmlidXRlKCdwb3BvdmVyJywgJ21hbnVhbCcpXG5cbiAgICBjb25zdCBzaG93ID0gKCkgPT4ge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3RpbWVvdXQpXG4gICAgICBjb25zdCBlbGFwc2VkID0gRGF0ZS5ub3coKSAtIGxhc3RIaWRlVGltZVxuICAgICAgY29uc3Qgd2FpdCA9IGVsYXBzZWQgPCBTS0lQX0RFTEFZX01TID8gMCA6IHRoaXMuX2RlbGF5XG4gICAgICB0aGlzLl90aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRyeSB7IGNvbnRlbnQuc2hvd1BvcG92ZXIoKSB9IGNhdGNoIChfKSB7IHJldHVybiB9XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICAgICAgaWYgKCFoYXNBbmNob3JQb3MpIHRoaXMuX3Bvc2l0aW9uRmFsbGJhY2soKVxuICAgICAgICAgIHRoaXMuX2RldGVjdEZsaXAoKVxuICAgICAgICB9KVxuICAgICAgfSwgd2FpdClcbiAgICB9XG5cbiAgICBjb25zdCBoaWRlID0gKCkgPT4ge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3RpbWVvdXQpXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoY29udGVudC5tYXRjaGVzKCc6cG9wb3Zlci1vcGVuJykpIHtcbiAgICAgICAgICBjb250ZW50LmhpZGVQb3BvdmVyKClcbiAgICAgICAgICBsYXN0SGlkZVRpbWUgPSBEYXRlLm5vdygpXG4gICAgICAgICAgY29udGVudC5kYXRhc2V0LnNpZGUgPSB0aGlzLl9kZWNsYXJlZFNpZGVcbiAgICAgICAgICBpZiAoIWhhc0FuY2hvclBvcykge1xuICAgICAgICAgICAgY29udGVudC5zdHlsZS50b3AgPSAnJ1xuICAgICAgICAgICAgY29udGVudC5zdHlsZS5sZWZ0ID0gJydcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKF8pIHt9XG4gICAgfVxuXG4gICAgd3JhcHBlci5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgdGhpcy5fc2hvdyA9ICgpID0+IHNob3coKSlcbiAgICB3cmFwcGVyLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCB0aGlzLl9oaWRlID0gKCkgPT4gaGlkZSgpKVxuICAgIGFuY2hvci5hZGRFdmVudExpc3RlbmVyKCdmb2N1c2luJywgdGhpcy5fZm9jdXNJbiA9ICgpID0+IHNob3coKSlcbiAgICBhbmNob3IuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXNvdXQnLCB0aGlzLl9mb2N1c091dCA9IChlKSA9PiB7XG4gICAgICBpZiAoIXdyYXBwZXIuY29udGFpbnMoZS5yZWxhdGVkVGFyZ2V0KSkgaGlkZSgpXG4gICAgfSlcbiAgICB3cmFwcGVyLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLl9rZXlkb3duID0gKGUpID0+IHtcbiAgICAgIGlmIChlLmtleSA9PT0gJ0VzY2FwZScpIGhpZGUoKVxuICAgIH0pXG4gIH0sXG5cbiAgLyoqIERldGVjdCBpZiBhbmNob3IgcG9zaXRpb25pbmcgZmxpcHBlZCB0aGUgc2lkZSBhbmQgdXBkYXRlIGRhdGEtc2lkZSBmb3IgYXJyb3cgQ1NTLiAqL1xuICBfZGV0ZWN0RmxpcCgpIHtcbiAgICBjb25zdCBhciA9IHRoaXMuX2FuY2hvci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgIGNvbnN0IGNyID0gdGhpcy5fY29udGVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgIGxldCBhY3R1YWxcbiAgICBpZiAoY3IuYm90dG9tIDw9IGFyLnRvcCArIDEpIGFjdHVhbCA9ICd0b3AnXG4gICAgZWxzZSBpZiAoY3IudG9wID49IGFyLmJvdHRvbSAtIDEpIGFjdHVhbCA9ICdib3R0b20nXG4gICAgZWxzZSBpZiAoY3IucmlnaHQgPD0gYXIubGVmdCArIDEpIGFjdHVhbCA9ICdsZWZ0J1xuICAgIGVsc2UgaWYgKGNyLmxlZnQgPj0gYXIucmlnaHQgLSAxKSBhY3R1YWwgPSAncmlnaHQnXG4gICAgZWxzZSBhY3R1YWwgPSB0aGlzLl9kZWNsYXJlZFNpZGVcbiAgICB0aGlzLl9jb250ZW50LmRhdGFzZXQuc2lkZSA9IGFjdHVhbFxuICB9LFxuXG4gIC8qKiBKUyBwb3NpdGlvbmluZyBmb3IgYnJvd3NlcnMgd2l0aG91dCBDU1MgYW5jaG9yIHBvc2l0aW9uaW5nIChTYWZhcmkpLiAqL1xuICBfcG9zaXRpb25GYWxsYmFjaygpIHtcbiAgICBjb25zdCBhciA9IHRoaXMuX2FuY2hvci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgIGNvbnN0IGN3ID0gdGhpcy5fY29udGVudC5vZmZzZXRXaWR0aFxuICAgIGNvbnN0IGNoID0gdGhpcy5fY29udGVudC5vZmZzZXRIZWlnaHRcbiAgICBjb25zdCBzaWRlID0gdGhpcy5fZGVjbGFyZWRTaWRlXG4gICAgY29uc3QgYWxpZ24gPSB0aGlzLl9jb250ZW50LmRhdGFzZXQuYWxpZ24gfHwgJ2NlbnRlcidcbiAgICBsZXQgdG9wLCBsZWZ0XG5cbiAgICBpZiAoc2lkZSA9PT0gJ3RvcCcgfHwgc2lkZSA9PT0gJ2JvdHRvbScpIHtcbiAgICAgIHRvcCA9IHNpZGUgPT09ICd0b3AnID8gYXIudG9wIC0gY2ggLSBHQVAgOiBhci5ib3R0b20gKyBHQVBcbiAgICAgIGlmIChhbGlnbiA9PT0gJ3N0YXJ0JykgbGVmdCA9IGFyLmxlZnRcbiAgICAgIGVsc2UgaWYgKGFsaWduID09PSAnZW5kJykgbGVmdCA9IGFyLnJpZ2h0IC0gY3dcbiAgICAgIGVsc2UgbGVmdCA9IGFyLmxlZnQgKyAoYXIud2lkdGggLSBjdykgLyAyXG4gICAgfSBlbHNlIHtcbiAgICAgIGxlZnQgPSBzaWRlID09PSAnbGVmdCcgPyBhci5sZWZ0IC0gY3cgLSBHQVAgOiBhci5yaWdodCArIEdBUFxuICAgICAgdG9wID0gYXIudG9wICsgKGFyLmhlaWdodCAtIGNoKSAvIDJcbiAgICB9XG5cbiAgICB0aGlzLl9jb250ZW50LnN0eWxlLnRvcCA9IGAke3RvcH1weGBcbiAgICB0aGlzLl9jb250ZW50LnN0eWxlLmxlZnQgPSBgJHtsZWZ0fXB4YFxuICB9LFxuXG4gIGRlc3Ryb3llZCgpIHtcbiAgICBjbGVhclRpbWVvdXQodGhpcy5fdGltZW91dClcbiAgfVxufVxuXG5leHBvcnQgeyBFeG9Ub29sdGlwIH1cbiIsICJjb25zdCBFeG9Ib3ZlckNhcmQgPSB7XG4gIG1vdW50ZWQoKSB7XG4gICAgdGhpcy50cmlnZ2VyID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJob3Zlci1jYXJkLXRyaWdnZXJcIl0nKVxuICAgIHRoaXMuY29udGVudCA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwiaG92ZXItY2FyZC1jb250ZW50XCJdJylcbiAgICBpZiAoIXRoaXMudHJpZ2dlciB8fCAhdGhpcy5jb250ZW50KSByZXR1cm5cblxuICAgIHRoaXMuX3Nob3dUaW1lb3V0ID0gbnVsbFxuICAgIHRoaXMuX2hpZGVUaW1lb3V0ID0gbnVsbFxuXG4gICAgY29uc3Qgc2hvdyA9ICgpID0+IHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9oaWRlVGltZW91dClcbiAgICAgIHRoaXMuX3Nob3dUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuY29udGVudC5zZXRBdHRyaWJ1dGUoXCJkYXRhLW9wZW5cIiwgXCJcIilcbiAgICAgIH0sIDMwMClcbiAgICB9XG5cbiAgICBjb25zdCBoaWRlID0gKCkgPT4ge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3Nob3dUaW1lb3V0KVxuICAgICAgdGhpcy5faGlkZVRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5jb250ZW50LnJlbW92ZUF0dHJpYnV0ZShcImRhdGEtb3BlblwiKVxuICAgICAgfSwgMjAwKVxuICAgIH1cblxuICAgIHRoaXMudHJpZ2dlci5hZGRFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCBzaG93KVxuICAgIHRoaXMudHJpZ2dlci5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCBoaWRlKVxuICAgIHRoaXMuY29udGVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCAoKSA9PiBjbGVhclRpbWVvdXQodGhpcy5faGlkZVRpbWVvdXQpKVxuICAgIHRoaXMuY29udGVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCBoaWRlKVxuICAgIHRoaXMudHJpZ2dlci5hZGRFdmVudExpc3RlbmVyKFwiZm9jdXNcIiwgc2hvdylcbiAgICB0aGlzLnRyaWdnZXIuYWRkRXZlbnRMaXN0ZW5lcihcImJsdXJcIiwgaGlkZSlcblxuICAgIHRoaXMuX2NsZWFudXAgPSAoKSA9PiB7XG4gICAgICB0aGlzLnRyaWdnZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIiwgc2hvdylcbiAgICAgIHRoaXMudHJpZ2dlci5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCBoaWRlKVxuICAgICAgdGhpcy50cmlnZ2VyLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJmb2N1c1wiLCBzaG93KVxuICAgICAgdGhpcy50cmlnZ2VyLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJibHVyXCIsIGhpZGUpXG4gICAgfVxuICB9LFxuXG4gIGRlc3Ryb3llZCgpIHtcbiAgICBpZiAodGhpcy5fY2xlYW51cCkgdGhpcy5fY2xlYW51cCgpXG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuX3Nob3dUaW1lb3V0KVxuICAgIGNsZWFyVGltZW91dCh0aGlzLl9oaWRlVGltZW91dClcbiAgfVxufVxuXG5leHBvcnQgeyBFeG9Ib3ZlckNhcmQgfVxuIiwgImNvbnN0IEV4b0NvbnRleHRNZW51ID0ge1xuICBtb3VudGVkKCkge1xuICAgIHRoaXMudHJpZ2dlciA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwiY29udGV4dC1tZW51LXRyaWdnZXJcIl0nKVxuICAgIHRoaXMubWVudSA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwiY29udGV4dC1tZW51LWNvbnRlbnRcIl0nKVxuICAgIGlmICghdGhpcy50cmlnZ2VyIHx8ICF0aGlzLm1lbnUpIHJldHVyblxuXG4gICAgdGhpcy50cmlnZ2VyLmFkZEV2ZW50TGlzdGVuZXIoXCJjb250ZXh0bWVudVwiLCB0aGlzLl9vbkNvbnRleHQgPSAoZSkgPT4ge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICB0aGlzLm1lbnUuc3R5bGUubGVmdCA9IGUuY2xpZW50WCArIFwicHhcIlxuICAgICAgdGhpcy5tZW51LnN0eWxlLnRvcCA9IGUuY2xpZW50WSArIFwicHhcIlxuICAgICAgdGhpcy5tZW51LnNldEF0dHJpYnV0ZShcImRhdGEtb3BlblwiLCBcIlwiKVxuXG4gICAgICBjb25zdCBjbG9zZSA9IChldikgPT4ge1xuICAgICAgICBpZiAoIXRoaXMubWVudS5jb250YWlucyhldi50YXJnZXQpKSB7XG4gICAgICAgICAgdGhpcy5tZW51LnJlbW92ZUF0dHJpYnV0ZShcImRhdGEtb3BlblwiKVxuICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBjbG9zZSlcbiAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwiY29udGV4dG1lbnVcIiwgY2xvc2UpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgY2xvc2UpXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjb250ZXh0bWVudVwiLCBjbG9zZSlcbiAgICAgIH0sIDApXG4gICAgfSlcblxuICAgIHRoaXMubWVudS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5fb25JdGVtQ2xpY2sgPSAoZSkgPT4ge1xuICAgICAgY29uc3QgaXRlbSA9IGUudGFyZ2V0LmNsb3Nlc3QoJ1tkYXRhLWV4bz1cImNvbnRleHQtbWVudS1pdGVtXCJdJylcbiAgICAgIGlmIChpdGVtICYmICFpdGVtLmRpc2FibGVkKSB7XG4gICAgICAgIHRoaXMubWVudS5yZW1vdmVBdHRyaWJ1dGUoXCJkYXRhLW9wZW5cIilcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCB0aGlzLl9vbktleWRvd24gPSAoZSkgPT4ge1xuICAgICAgaWYgKGUua2V5ID09PSBcIkVzY2FwZVwiKSB0aGlzLm1lbnUucmVtb3ZlQXR0cmlidXRlKFwiZGF0YS1vcGVuXCIpXG4gICAgfSlcbiAgfSxcblxuICBkZXN0cm95ZWQoKSB7XG4gICAgaWYgKHRoaXMudHJpZ2dlciAmJiB0aGlzLl9vbkNvbnRleHQpIHRoaXMudHJpZ2dlci5yZW1vdmVFdmVudExpc3RlbmVyKFwiY29udGV4dG1lbnVcIiwgdGhpcy5fb25Db250ZXh0KVxuICB9XG59XG5cbmV4cG9ydCB7IEV4b0NvbnRleHRNZW51IH1cbiIsICJpbXBvcnQgeyBFeG9BY2NvcmRpb24gfSBmcm9tICcuL2hvb2tzL2FjY29yZGlvbi5qcydcbmltcG9ydCB7IEV4b0Nhcm91c2VsIH0gZnJvbSAnLi9ob29rcy9jYXJvdXNlbC5qcydcbmltcG9ydCB7IEV4b0NvbW1hbmRQYWxldHRlIH0gZnJvbSAnLi9ob29rcy9jb21tYW5kX3BhbGV0dGUuanMnXG5pbXBvcnQgeyBFeG9TaWRlYmFyIH0gZnJvbSAnLi9ob29rcy9zaWRlYmFyLmpzJ1xuaW1wb3J0IHsgRXhvVGhlbWVUb2dnbGUgfSBmcm9tICcuL2hvb2tzL3RoZW1lX3RvZ2dsZS5qcydcbmltcG9ydCB7IEV4b1BvcG92ZXIgfSBmcm9tICcuL2hvb2tzL3BvcG92ZXIuanMnXG5pbXBvcnQgeyBFeG9Ecm9wZG93bk1lbnUgfSBmcm9tICcuL2hvb2tzL2Ryb3Bkb3duX21lbnUuanMnXG5pbXBvcnQgeyBFeG9TZWxlY3QgfSBmcm9tICcuL2hvb2tzL3NlbGVjdC5qcydcbmltcG9ydCB7IEV4b0NvbWJvYm94IH0gZnJvbSAnLi9ob29rcy9jb21ib2JveC5qcydcbmltcG9ydCB7IEV4b1Rvb2x0aXAgfSBmcm9tICcuL2hvb2tzL3Rvb2x0aXAuanMnXG5pbXBvcnQgeyBFeG9Ib3ZlckNhcmQgfSBmcm9tICcuL2hvb2tzL2hvdmVyX2NhcmQuanMnXG5pbXBvcnQgeyBFeG9Db250ZXh0TWVudSB9IGZyb20gJy4vaG9va3MvY29udGV4dF9tZW51LmpzJ1xuXG5jb25zdCBob29rcyA9IHtcbiAgRXhvQWNjb3JkaW9uLFxuICBFeG9DYXJvdXNlbCxcbiAgRXhvQ29tbWFuZFBhbGV0dGUsXG4gIEV4b1NpZGViYXIsXG4gIEV4b1RoZW1lVG9nZ2xlLFxuICBFeG9Qb3BvdmVyLFxuICBFeG9Ecm9wZG93bk1lbnUsXG4gIEV4b1NlbGVjdCxcbiAgRXhvQ29tYm9ib3gsXG4gIEV4b1Rvb2x0aXAsXG4gIEV4b0hvdmVyQ2FyZCxcbiAgRXhvQ29udGV4dE1lbnVcbn1cblxuZXhwb3J0IHsgaG9va3MgfVxuIiwgImltcG9ydCB7IGhvb2tzIGFzIGV4b0hvb2tzIH0gZnJvbSBcIi4uLy4uLy4uL2Fzc2V0cy9qcy9pbmRleC5qc1wiXG5cbndpbmRvdy5zdG9yeWJvb2sgPSB7XG4gIEhvb2tzOiBleG9Ib29rcyxcbiAgUGFyYW1zOiB7fSxcbiAgVXBsb2FkZXJzOiB7fVxufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7QUFhQSxNQUFNLGVBQWU7QUFBQSxJQUNuQixVQUFVO0FBQ1IsV0FBSyxZQUFZLE1BQ2YsTUFBTSxLQUFLLEtBQUssR0FBRyxpQkFBaUIsZ0RBQWdELENBQUM7QUFFdkYsV0FBSyxjQUFjLE1BQ2pCLE1BQU0sS0FBSyxLQUFLLEdBQUcsaUJBQWlCLDhDQUE4QyxDQUFDO0FBRXJGLFdBQUssWUFBWSxNQUFNLEtBQUssR0FBRyxRQUFRLFNBQVM7QUFDaEQsV0FBSyxpQkFBaUIsTUFBTSxLQUFLLEdBQUcsYUFBYSxrQkFBa0I7QUFHbkUsV0FBSyxHQUFHLGlCQUFp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
