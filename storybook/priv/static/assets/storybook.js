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
      const syncState = () => {
        this.el.dataset.state = isOpen() ? "open" : "closed";
      };
      const open = () => {
        this.el.style.display = "block";
        this.el.classList.add("open");
        syncState();
        requestAnimationFrame(() => {
          if (this.input) this.input.focus();
        });
      };
      const close = () => {
        this.el.classList.remove("open");
        this.el.style.display = "none";
        syncState();
        if (this.input) this.input.value = "";
      };
      syncState();
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
      const syncExpanded = () => {
        const open = this._popover.matches(":popover-open");
        trigger.setAttribute("aria-expanded", String(open));
      };
      syncExpanded();
      this._onToggle = () => syncExpanded();
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
          if (selected) selected.focus();
        }
      };
      this._trigger.setAttribute("aria-expanded", String(this._popover.matches(":popover-open")));
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
      const syncExpanded = () => {
        const open = this._popover.matches(":popover-open");
        if (triggerBtn) triggerBtn.setAttribute("aria-expanded", String(open));
        if (this._search) this._search.setAttribute("aria-expanded", String(open));
      };
      const focusSearch = () => {
        setTimeout(() => {
          if (!this._popover?.matches(":popover-open")) return;
          this._search?.focus();
          if (document.activeElement !== this._search) {
            requestAnimationFrame(() => {
              if (this._popover?.matches(":popover-open")) this._search?.focus();
            });
          }
        }, 0);
      };
      syncExpanded();
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
        syncExpanded();
        if (open && this._search && !isInputTrigger) {
          this._search.value = "";
          if (filter === "client") this._clientFilter("");
          focusSearch();
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
      try {
        this._popover?.hidePopover();
      } catch (_err) {
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
        let didHide = false;
        try {
          if (content.matches(":popover-open")) {
            content.hidePopover();
            didHide = true;
          }
        } catch (_) {
        }
        if (didHide) {
          lastHideTime = Date.now();
          content.dataset.side = this._declaredSide;
          if (!hasAnchorPos) {
            content.style.top = "";
            content.style.left = "";
          }
        }
      };
      this._wrapper = wrapper;
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
      if (this._wrapper) {
        if (this._show) this._wrapper.removeEventListener("mouseenter", this._show);
        if (this._hide) this._wrapper.removeEventListener("mouseleave", this._hide);
        if (this._keydown) this._wrapper.removeEventListener("keydown", this._keydown);
      }
      if (this._anchor) {
        if (this._focusIn) this._anchor.removeEventListener("focusin", this._focusIn);
        if (this._focusOut) this._anchor.removeEventListener("focusout", this._focusOut);
      }
    }
  };

  // ../../assets/js/hooks/hover_card.js
  var ExoHoverCard = {
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
      this.trigger = this.el.querySelector('[data-exo="hover-card-trigger"]');
      this.content = this.el.querySelector('[data-exo="hover-card-content"]');
      if (!this.trigger || !this.content) return;
      this._showTimeout = null;
      this._hideTimeout = null;
      this._show = () => {
        clearTimeout(this._hideTimeout);
        this._showTimeout = setTimeout(() => {
          this.content.setAttribute("data-open", "");
        }, 300);
      };
      this._hide = () => {
        clearTimeout(this._showTimeout);
        this._hideTimeout = setTimeout(() => {
          this.content.removeAttribute("data-open");
        }, 200);
      };
      this._cancelHide = () => clearTimeout(this._hideTimeout);
      this.trigger.addEventListener("mouseenter", this._show);
      this.trigger.addEventListener("mouseleave", this._hide);
      this.content.addEventListener("mouseenter", this._cancelHide);
      this.content.addEventListener("mouseleave", this._hide);
      this.trigger.addEventListener("focus", this._show);
      this.trigger.addEventListener("blur", this._hide);
    },
    _unbind() {
      if (this.trigger) {
        if (this._show) this.trigger.removeEventListener("mouseenter", this._show);
        if (this._hide) this.trigger.removeEventListener("mouseleave", this._hide);
        if (this._show) this.trigger.removeEventListener("focus", this._show);
        if (this._hide) this.trigger.removeEventListener("blur", this._hide);
      }
      if (this.content) {
        if (this._cancelHide) this.content.removeEventListener("mouseenter", this._cancelHide);
        if (this._hide) this.content.removeEventListener("mouseleave", this._hide);
      }
      clearTimeout(this._showTimeout);
      clearTimeout(this._hideTimeout);
      this.trigger = null;
      this.content = null;
      this._show = null;
      this._hide = null;
      this._cancelHide = null;
      this._showTimeout = null;
      this._hideTimeout = null;
    }
  };

  // ../../assets/js/hooks/context_menu.js
  var ExoContextMenu = {
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
      this.trigger = this.el.querySelector('[data-exo="context-menu-trigger"]');
      this.menu = this.el.querySelector('[data-exo="context-menu-content"]');
      if (!this.trigger || !this.menu) return;
      this._close = (e) => {
        if (this.trigger?.contains(e.target)) return;
        if (!this.menu.contains(e.target)) {
          this.menu.removeAttribute("data-open");
          document.removeEventListener("click", this._close);
          document.removeEventListener("contextmenu", this._close);
        }
      };
      this._onContext = (e) => {
        e.preventDefault();
        this.menu.style.left = e.clientX + "px";
        this.menu.style.top = e.clientY + "px";
        this.menu.setAttribute("data-open", "");
        document.addEventListener("click", this._close);
        document.addEventListener("contextmenu", this._close);
      };
      this.trigger.addEventListener("contextmenu", this._onContext);
      this._onItemClick = (e) => {
        const item = e.target.closest('[data-exo="context-menu-item"]');
        if (item && !item.disabled) {
          this.menu.removeAttribute("data-open");
          document.removeEventListener("click", this._close);
          document.removeEventListener("contextmenu", this._close);
        }
      };
      this.menu.addEventListener("click", this._onItemClick);
      this._onKeydown = (e) => {
        if (e.key === "Escape") {
          this.menu.removeAttribute("data-open");
          document.removeEventListener("click", this._close);
          document.removeEventListener("contextmenu", this._close);
        }
      };
      this.el.addEventListener("keydown", this._onKeydown);
    },
    _unbind() {
      if (this.trigger && this._onContext) this.trigger.removeEventListener("contextmenu", this._onContext);
      if (this.menu && this._onItemClick) this.menu.removeEventListener("click", this._onItemClick);
      if (this._onKeydown) this.el.removeEventListener("keydown", this._onKeydown);
      if (this._close) {
        document.removeEventListener("click", this._close);
        document.removeEventListener("contextmenu", this._close);
      }
      this.trigger = null;
      this.menu = null;
      this._onContext = null;
      this._onItemClick = null;
      this._onKeydown = null;
      this._close = null;
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
