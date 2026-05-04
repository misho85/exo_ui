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
      const atStart = () => this.viewport.scrollLeft <= 5;
      const atEnd = () => this.viewport.scrollLeft >= this.viewport.scrollWidth - this.viewport.offsetWidth - 5;
      const setButtonState = (button, disabled) => {
        if (!button) return;
        button.disabled = disabled;
        button.toggleAttribute("data-disabled", disabled);
        button.setAttribute("aria-disabled", disabled ? "true" : "false");
      };
      const updateControls = () => {
        if (loop) {
          setButtonState(this.prev, false);
          setButtonState(this.next, false);
          return;
        }
        setButtonState(this.prev, atStart());
        setButtonState(this.next, atEnd());
      };
      const scrollTo = (direction) => {
        const s = slides();
        if (s.length === 0) return;
        const slideWidth = s[0].offsetWidth;
        const gap = parseFloat(getComputedStyle(this.track).gap) || 0;
        const scrollAmount = slideWidth + gap;
        if (direction === "next") {
          if (loop && atEnd()) {
            this.viewport.scrollTo({ left: 0, behavior: "smooth" });
          } else {
            this.viewport.scrollBy({ left: scrollAmount, behavior: "smooth" });
          }
        } else {
          if (loop && atStart()) {
            this.viewport.scrollTo({ left: this.viewport.scrollWidth, behavior: "smooth" });
          } else {
            this.viewport.scrollBy({ left: -scrollAmount, behavior: "smooth" });
          }
        }
        window.setTimeout(updateControls, 350);
      };
      if (this.prev) this.prev.addEventListener("click", this._onPrev = () => scrollTo("prev"));
      if (this.next) this.next.addEventListener("click", this._onNext = () => scrollTo("next"));
      this.viewport.addEventListener("scroll", this._onScroll = () => updateControls());
      window.addEventListener("resize", this._onResize = () => updateControls());
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
      updateControls();
    },
    destroyed() {
      if (this.prev && this._onPrev) this.prev.removeEventListener("click", this._onPrev);
      if (this.next && this._onNext) this.next.removeEventListener("click", this._onNext);
      if (this.viewport && this._onScroll) this.viewport.removeEventListener("scroll", this._onScroll);
      if (this._onResize) window.removeEventListener("resize", this._onResize);
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
  var PaletteRegistry = {
    stack: [],
    listenerBound: false,
    register(hook) {
      this.stack = this.stack.filter((entry) => entry !== hook);
      this.stack.push(hook);
      this._ensureListener();
    },
    unregister(hook) {
      this.stack = this.stack.filter((entry) => entry !== hook);
      if (this.stack.length === 0 && this.listenerBound) {
        document.removeEventListener("keydown", this._onKey);
        this.listenerBound = false;
      }
    },
    _ensureListener() {
      if (this.listenerBound) return;
      this._onKey = (e) => {
        if (!((e.metaKey || e.ctrlKey) && e.key === "k")) return;
        const target = this.stack[this.stack.length - 1];
        if (!target || !target._toggle) return;
        e.preventDefault();
        target._toggle();
      };
      document.addEventListener("keydown", this._onKey);
      this.listenerBound = true;
    }
  };
  var ExoCommandPalette = {
    mounted() {
      this._bind();
    },
    updated() {
      this._bind();
    },
    destroyed() {
      PaletteRegistry.unregister(this);
      this._unbind();
    },
    _bind() {
      this._unbind();
      this.backdrop = this.el.querySelector('[data-exo="command-palette-backdrop"]');
      this.input = this.el.querySelector('[data-exo="command-palette-input"]');
      this.list = this.el.querySelector('[data-exo="command-palette-list"]');
      this.empty = this.el.querySelector('[data-exo="command-palette-empty"]');
      this.items = Array.from(this.el.querySelectorAll('[data-exo="command-palette-item"]'));
      this.activeIndex = -1;
      if (this.list && !this.list.id) this.list.id = `${this.el.id}-list`;
      this.items.forEach((item, index) => {
        if (!item.id) item.id = `${this.el.id}-item-${index}`;
        item.setAttribute("role", "option");
        item.setAttribute("tabindex", "-1");
        if (!item.dataset.value) item.dataset.value = item.textContent.trim();
        if (!item.dataset.search) item.dataset.search = item.textContent.trim();
        if (item.disabled || item.getAttribute("aria-disabled") === "true") {
          item.dataset.disabled = "true";
          item.setAttribute("aria-disabled", "true");
        }
        if (item.tagName === "BUTTON" && !item.hasAttribute("type")) {
          item.setAttribute("type", "button");
        }
      });
      if (this.input) {
        this.input.setAttribute("role", "combobox");
        this.input.setAttribute("aria-autocomplete", "list");
        if (this.list) this.input.setAttribute("aria-controls", this.list.id);
      }
      const isOpen = () => this.el.classList.contains("open");
      const syncState = () => {
        this.el.dataset.state = isOpen() ? "open" : "closed";
        this.el.setAttribute("aria-hidden", isOpen() ? "false" : "true");
        if (this.input) this.input.setAttribute("aria-expanded", isOpen() ? "true" : "false");
      };
      this._open = () => {
        this.el.style.display = "block";
        this.el.classList.add("open");
        syncState();
        this._filter();
        requestAnimationFrame(() => {
          if (this.input) this.input.focus();
        });
      };
      this._close = () => {
        this.el.classList.remove("open");
        this.el.style.display = "none";
        syncState();
        if (this.input) this.input.value = "";
        this.items.forEach((item) => {
          item.hidden = false;
          this._setItemActive(item, false);
        });
        if (this.empty) this.empty.hidden = true;
        this.activeIndex = -1;
        this._syncActiveDescendant();
      };
      syncState();
      if (!isOpen()) this.el.style.display = "none";
      if (this.empty) this.empty.hidden = true;
      this.el.dataset.ready = "true";
      this._toggle = () => isOpen() ? this._close() : this._open();
      PaletteRegistry.register(this);
      this._onKey = (e) => {
        if (e.key === "Escape") {
          this._close();
          return;
        }
        if (!isOpen()) return;
        if (e.key === "ArrowDown") {
          e.preventDefault();
          this._moveActive(1);
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          this._moveActive(-1);
          return;
        }
        if (e.key === "Home") {
          e.preventDefault();
          this._setActiveByVisibleIndex(0);
          return;
        }
        if (e.key === "End") {
          e.preventDefault();
          const visible = this._visibleItems();
          this._setActiveByVisibleIndex(visible.length - 1);
          return;
        }
        if (e.key === "Enter" && this.activeIndex >= 0) {
          const item = this.items[this.activeIndex];
          if (item && !this._isDisabled(item) && !item.hidden) {
            e.preventDefault();
            item.click();
          }
        }
      };
      this.el.addEventListener("keydown", this._onKey);
      this._onInput = () => this._filter();
      if (this.input) this.input.addEventListener("input", this._onInput);
      this._onItemPointerMove = (e) => {
        const item = e.target.closest('[data-exo="command-palette-item"]');
        if (!item || this._isDisabled(item) || item.hidden) return;
        this._setActive(this.items.indexOf(item));
      };
      this.el.addEventListener("pointermove", this._onItemPointerMove);
      this._onItemClick = (e) => {
        const item = e.target.closest('[data-exo="command-palette-item"]');
        if (!item) return;
        if (this._isDisabled(item)) {
          e.preventDefault();
          return;
        }
        if (item.dataset.close !== "false") {
          setTimeout(() => this._close(), 0);
        }
      };
      this.el.addEventListener("click", this._onItemClick);
      if (this.backdrop) {
        this._onBackdrop = () => this._close();
        this.backdrop.addEventListener("click", this._onBackdrop);
      }
    },
    _isDisabled(item) {
      return item.disabled || item.dataset.disabled === "true" || item.getAttribute("aria-disabled") === "true";
    },
    _visibleItems() {
      return this.items.filter((item) => !item.hidden && !this._isDisabled(item));
    },
    _filter() {
      const query = (this.input?.value || "").trim().toLowerCase();
      let visibleCount = 0;
      this.items.forEach((item) => {
        const text = `${item.dataset.search || ""} ${item.dataset.value || ""} ${item.textContent || ""}`.toLowerCase();
        const visible = !query || text.includes(query);
        item.hidden = !visible;
        if (visible && !this._isDisabled(item)) visibleCount += 1;
      });
      if (this.empty) this.empty.hidden = visibleCount > 0;
      this._setActiveByVisibleIndex(0);
    },
    _moveActive(delta) {
      const visible = this._visibleItems();
      if (!visible.length) {
        this._setActive(-1);
        return;
      }
      const current = visible.indexOf(this.items[this.activeIndex]);
      const next = current === -1 ? delta > 0 ? 0 : visible.length - 1 : (current + delta + visible.length) % visible.length;
      this._setActive(this.items.indexOf(visible[next]));
    },
    _setActiveByVisibleIndex(index) {
      const visible = this._visibleItems();
      if (!visible.length || index < 0) {
        this._setActive(-1);
        return;
      }
      const bounded = Math.max(0, Math.min(index, visible.length - 1));
      this._setActive(this.items.indexOf(visible[bounded]));
    },
    _setActive(index) {
      this.items.forEach((item2, itemIndex) => this._setItemActive(item2, itemIndex === index));
      this.activeIndex = index;
      this._syncActiveDescendant();
      const item = this.items[index];
      if (item) item.scrollIntoView({ block: "nearest" });
    },
    _setItemActive(item, active) {
      item.dataset.active = active ? "true" : "false";
      item.setAttribute("aria-selected", active ? "true" : "false");
    },
    _syncActiveDescendant() {
      if (!this.input) return;
      const item = this.items[this.activeIndex];
      if (item && !item.hidden) {
        this.input.setAttribute("aria-activedescendant", item.id);
      } else {
        this.input.removeAttribute("aria-activedescendant");
      }
    },
    _unbind() {
      PaletteRegistry.unregister(this);
      if (this._onKey) this.el.removeEventListener("keydown", this._onKey);
      if (this.input && this._onInput) this.input.removeEventListener("input", this._onInput);
      if (this._onItemPointerMove) this.el.removeEventListener("pointermove", this._onItemPointerMove);
      if (this._onItemClick) this.el.removeEventListener("click", this._onItemClick);
      if (this.backdrop && this._onBackdrop) {
        this.backdrop.removeEventListener("click", this._onBackdrop);
      }
      delete this.el.dataset.ready;
      this.backdrop = null;
      this.input = null;
      this.list = null;
      this.empty = null;
      this.items = [];
      this.activeIndex = -1;
      this._onKey = null;
      this._onInput = null;
      this._onItemPointerMove = null;
      this._onItemClick = null;
      this._onBackdrop = null;
      this._open = null;
      this._close = null;
      this._toggle = null;
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
      this._trigger = this.el.querySelector('[data-exo="popover-trigger"]');
      const id = this._trigger?.dataset.popoverTarget || this._trigger?.getAttribute("popovertarget");
      this._popover = id ? document.getElementById(id) : null;
      if (!this._popover || !this._trigger) return;
      this._control = this._findControl();
      this._prepareControl();
      this.el.setAttribute("data-ready", "");
      this._syncExpanded = () => {
        const open = this._popover.matches(":popover-open");
        this._control?.setAttribute("aria-expanded", String(open));
        this._trigger.setAttribute("aria-expanded", String(open));
      };
      this._syncExpanded();
      this._onClick = (event) => {
        event.preventDefault();
        this._togglePopover();
      };
      this._onKeydown = (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        if (event.target !== this._control && !this._control?.contains?.(event.target)) return;
        event.preventDefault();
        this._togglePopover();
      };
      this._onToggle = () => this._syncExpanded();
      this._trigger.addEventListener("click", this._onClick);
      this._trigger.addEventListener("keydown", this._onKeydown);
      this._popover.addEventListener("toggle", this._onToggle);
    },
    _findControl() {
      const selector = [
        "button",
        "a[href]",
        'input:not([type="hidden"])',
        "select",
        "textarea",
        '[role="button"]',
        '[tabindex]:not([tabindex="-1"])'
      ].join(",");
      return this._trigger.matches(selector) ? this._trigger : this._trigger.querySelector(selector) || this._trigger;
    },
    _prepareControl() {
      const hasPopup = this._trigger.dataset.popoverHaspopup || "true";
      this._control.setAttribute("aria-haspopup", hasPopup);
      this._control.setAttribute("aria-expanded", "false");
      if (this._control === this._trigger) {
        this._control.setAttribute("role", "button");
        this._control.setAttribute("tabindex", "0");
      }
      if (this._control instanceof HTMLButtonElement && !this._control.getAttribute("type")) {
        this._control.setAttribute("type", "button");
      }
    },
    _togglePopover() {
      try {
        if (this._popover.matches(":popover-open")) {
          this._popover.hidePopover();
        } else {
          this._popover.showPopover();
        }
      } catch (err) {
        console.warn("ExoPopover: toggle failed", err);
      }
    },
    _unbind() {
      if (this._popover && this._onToggle) {
        this._popover.removeEventListener("toggle", this._onToggle);
      }
      if (this._trigger) {
        if (this._onClick) this._trigger.removeEventListener("click", this._onClick);
        if (this._onKeydown) this._trigger.removeEventListener("keydown", this._onKeydown);
      }
      if (this.el) this.el.removeAttribute("data-ready");
      this._trigger = null;
      this._control = null;
      this._popover = null;
      this._syncExpanded = null;
      this._onClick = null;
      this._onKeydown = null;
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
      this._popover = this._menu.closest("[popover]");
      this._trigger = this._findTrigger();
      this._allItems().forEach((item) => {
        item.setAttribute("tabindex", "-1");
        if (item.tagName === "BUTTON" && !item.getAttribute("type")) {
          item.setAttribute("type", "button");
        }
        if (this._isDisabled(item)) {
          item.setAttribute("aria-disabled", "true");
          item.dataset.disabled = "true";
        }
      });
      this._onToggle = () => {
        if (!this._popover?.matches(":popover-open")) return;
        requestAnimationFrame(() => this._items()[0]?.focus());
      };
      this._popover?.addEventListener("toggle", this._onToggle);
      this._onClick = (e) => {
        const item = e.target.closest('[role="menuitem"]');
        if (!item || !this._menu.contains(item)) return;
        if (this._isDisabled(item)) {
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      };
      this._menu.addEventListener("click", this._onClick);
      this._onKeydown = (e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          this._popover?.hidePopover?.();
          this._trigger?.focus?.();
          return;
        }
        const items = this._items();
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
    _items() {
      return this._allItems().filter((item) => !this._isDisabled(item));
    },
    _allItems() {
      return [...this._menu.querySelectorAll('[role="menuitem"]')];
    },
    _isDisabled(item) {
      return item.disabled || item.dataset.disabled === "true" || item.hasAttribute("data-disabled") || item.getAttribute("aria-disabled") === "true";
    },
    _findTrigger() {
      if (!this._popover?.id) return null;
      const trigger = [...document.querySelectorAll("[data-popover-target]")].find((node) => node.dataset.popoverTarget === this._popover.id);
      return trigger?.matches('button, a[href], input, select, textarea, [role="button"], [tabindex]') ? trigger : trigger?.querySelector('button, a[href], input, select, textarea, [role="button"], [tabindex]') || trigger;
    },
    _unbind() {
      if (this._popover && this._onToggle) {
        this._popover.removeEventListener("toggle", this._onToggle);
      }
      if (this._menu && this._onClick) {
        this._menu.removeEventListener("click", this._onClick);
      }
      if (this._menu && this._onKeydown) {
        this._menu.removeEventListener("keydown", this._onKeydown);
      }
      this._popover = null;
      this._trigger = null;
      this._menu = null;
      this._onToggle = null;
      this._onClick = null;
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
      const wrapper = this.el;
      const anchor = wrapper.querySelector('[data-exo="tooltip-anchor"]');
      const content = wrapper.querySelector('[data-exo="tooltip-content"]');
      if (!anchor || !content) return;
      this._wrapper = wrapper;
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
      this._show = () => show();
      this._hide = () => hide();
      this._focusIn = () => show();
      this._focusOut = (e) => {
        if (!wrapper.contains(e.relatedTarget)) hide();
      };
      this._keydown = (e) => {
        if (e.key === "Escape") hide();
      };
      wrapper.addEventListener("mouseenter", this._show);
      wrapper.addEventListener("mouseleave", this._hide);
      anchor.addEventListener("focusin", this._focusIn);
      anchor.addEventListener("focusout", this._focusOut);
      wrapper.addEventListener("keydown", this._keydown);
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
    _unbind() {
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
      this._wrapper = null;
      this._anchor = null;
      this._content = null;
      this._show = null;
      this._hide = null;
      this._focusIn = null;
      this._focusOut = null;
      this._keydown = null;
      this._timeout = null;
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
      this._openDelay = Number.parseInt(this.el.dataset.openDelay || "300", 10);
      this._closeDelay = Number.parseInt(this.el.dataset.closeDelay || "150", 10);
      this._show = () => {
        clearTimeout(this._hideTimeout);
        clearTimeout(this._showTimeout);
        this._showTimeout = setTimeout(() => {
          this.content.hidden = false;
          this.content.setAttribute("data-open", "");
          this.trigger.setAttribute("aria-expanded", "true");
        }, this._openDelay);
      };
      this._hide = () => {
        clearTimeout(this._showTimeout);
        this._hideTimeout = setTimeout(() => {
          this.content.removeAttribute("data-open");
          this.content.hidden = true;
          this.trigger.setAttribute("aria-expanded", "false");
        }, this._closeDelay);
      };
      this._onFocusOut = (event) => {
        if (!this.el.contains(event.relatedTarget)) this._hide();
      };
      this._onKeydown = (event) => {
        if (event.key !== "Escape" || !this.content.hasAttribute("data-open")) return;
        event.preventDefault();
        this._hideNow();
        this._firstFocusableTrigger()?.focus?.({ preventScroll: true });
      };
      this.el.addEventListener("pointerenter", this._show);
      this.el.addEventListener("pointerleave", this._hide);
      this.trigger.addEventListener("focusin", this._show);
      this.trigger.addEventListener("focusout", this._onFocusOut);
      this.content.addEventListener("focusin", this._show);
      this.content.addEventListener("focusout", this._onFocusOut);
      this.el.addEventListener("keydown", this._onKeydown);
      this.el.dataset.ready = "true";
    },
    _hideNow() {
      clearTimeout(this._showTimeout);
      clearTimeout(this._hideTimeout);
      this.content.removeAttribute("data-open");
      this.content.hidden = true;
      this.trigger?.setAttribute("aria-expanded", "false");
    },
    _firstFocusableTrigger() {
      return this.trigger?.querySelector("a[href],button:not([disabled]),[tabindex]:not([tabindex='-1'])");
    },
    _unbind() {
      if (this.el && this._show) this.el.removeEventListener("pointerenter", this._show);
      if (this.el && this._hide) this.el.removeEventListener("pointerleave", this._hide);
      if (this.el && this._onKeydown) this.el.removeEventListener("keydown", this._onKeydown);
      if (this.el) delete this.el.dataset.ready;
      if (this.trigger && this._show) this.trigger.removeEventListener("focusin", this._show);
      if (this.trigger && this._onFocusOut) this.trigger.removeEventListener("focusout", this._onFocusOut);
      if (this.content) {
        if (this._show) this.content.removeEventListener("focusin", this._show);
        if (this._onFocusOut) this.content.removeEventListener("focusout", this._onFocusOut);
      }
      clearTimeout(this._showTimeout);
      clearTimeout(this._hideTimeout);
      this.trigger = null;
      this.content = null;
      this._show = null;
      this._hide = null;
      this._onFocusOut = null;
      this._onKeydown = null;
      this._showTimeout = null;
      this._hideTimeout = null;
      this._openDelay = null;
      this._closeDelay = null;
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
      this.el.setAttribute("data-ready", "");
      this.trigger.setAttribute("tabindex", this.trigger.getAttribute("tabindex") || "0");
      this.trigger.setAttribute("role", this.trigger.getAttribute("role") || "button");
      this.trigger.setAttribute("aria-haspopup", "menu");
      if (this.menu.id) this.trigger.setAttribute("aria-controls", this.menu.id);
      this.trigger.setAttribute("aria-expanded", String(this.menu.hasAttribute("data-open")));
      this._items = () => [...this.menu.querySelectorAll('[data-exo="context-menu-item"]')].filter((item) => !this._isDisabled(item));
      this.menu.querySelectorAll('[data-exo="context-menu-item"]').forEach((item) => {
        item.setAttribute("tabindex", "-1");
        if (item.tagName === "BUTTON" && !item.getAttribute("type")) {
          item.setAttribute("type", "button");
        }
        if (this._isDisabled(item)) {
          item.setAttribute("aria-disabled", "true");
          item.dataset.disabled = "true";
        }
      });
      this._close = (e) => {
        if (this.trigger?.contains(e.target)) return;
        if (!this.menu.contains(e.target)) {
          this._hide();
        }
      };
      this._onContext = (e) => {
        e.preventDefault();
        this._openAt(e.clientX, e.clientY);
      };
      this.trigger.addEventListener("contextmenu", this._onContext);
      this._onTriggerKeydown = (e) => {
        if (e.key !== "ContextMenu" && !(e.shiftKey && e.key === "F10")) return;
        e.preventDefault();
        const rect = this.trigger.getBoundingClientRect();
        this._openAt(rect.left, rect.bottom);
      };
      this.trigger.addEventListener("keydown", this._onTriggerKeydown);
      this._openAt = (x, y) => {
        this.menu.setAttribute("data-open", "");
        this.trigger.setAttribute("aria-expanded", "true");
        this._positionWithinViewport(x, y);
        this._bindCloseListeners();
        requestAnimationFrame(() => {
          this._items()[0]?.focus();
        });
      };
      this._positionWithinViewport = (x, y) => {
        this.menu.style.left = x + "px";
        this.menu.style.top = y + "px";
        requestAnimationFrame(() => {
          if (!this.menu.hasAttribute("data-open")) return;
          const rect = this.menu.getBoundingClientRect();
          const gap = 4;
          const left = Math.min(x, window.innerWidth - rect.width - gap);
          const top = Math.min(y, window.innerHeight - rect.height - gap);
          this.menu.style.left = Math.max(gap, left) + "px";
          this.menu.style.top = Math.max(gap, top) + "px";
        });
      };
      this._bindCloseListeners = () => {
        document.removeEventListener("pointerdown", this._close, true);
        document.removeEventListener("mousedown", this._close, true);
        document.removeEventListener("click", this._close, true);
        document.removeEventListener("contextmenu", this._close, true);
        document.addEventListener("pointerdown", this._close, true);
        document.addEventListener("mousedown", this._close, true);
        document.addEventListener("click", this._close, true);
        document.addEventListener("contextmenu", this._close, true);
      };
      this._hide = () => {
        this.menu.removeAttribute("data-open");
        this.trigger.setAttribute("aria-expanded", "false");
        document.removeEventListener("pointerdown", this._close, true);
        document.removeEventListener("mousedown", this._close, true);
        document.removeEventListener("click", this._close, true);
        document.removeEventListener("contextmenu", this._close, true);
      };
      this._onItemClick = (e) => {
        const item = e.target.closest('[data-exo="context-menu-item"]');
        if (!item) return;
        if (this._isDisabled(item)) {
          e.preventDefault();
          return;
        }
        this._hide();
      };
      this.menu.addEventListener("click", this._onItemClick);
      this._onKeydown = (e) => {
        if (e.key === "Escape") {
          this._hide();
          this.trigger.focus?.();
          return;
        }
        const items = this._items();
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
      this.menu.addEventListener("keydown", this._onKeydown);
    },
    _isDisabled(item) {
      return item.disabled || item.dataset.disabled === "true" || item.hasAttribute("data-disabled") || item.getAttribute("aria-disabled") === "true";
    },
    _unbind() {
      if (this.trigger && this._onContext) this.trigger.removeEventListener("contextmenu", this._onContext);
      if (this.trigger && this._onTriggerKeydown) this.trigger.removeEventListener("keydown", this._onTriggerKeydown);
      if (this.menu && this._onItemClick) this.menu.removeEventListener("click", this._onItemClick);
      if (this.menu && this._onKeydown) this.menu.removeEventListener("keydown", this._onKeydown);
      if (this._close) {
        document.removeEventListener("pointerdown", this._close, true);
        document.removeEventListener("mousedown", this._close, true);
        document.removeEventListener("click", this._close, true);
        document.removeEventListener("contextmenu", this._close, true);
      }
      if (this.el) this.el.removeAttribute("data-ready");
      this.trigger = null;
      this.menu = null;
      this._items = null;
      this._hide = null;
      this._openAt = null;
      this._bindCloseListeners = null;
      this._positionWithinViewport = null;
      this._onContext = null;
      this._onTriggerKeydown = null;
      this._onItemClick = null;
      this._onKeydown = null;
      this._close = null;
    }
  };

  // ../../assets/js/hooks/rating.js
  var ExoRating = {
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
      this._hidden = this.el.querySelector('[data-exo="rating-value"]');
      this._inputs = [...this.el.querySelectorAll('[data-exo="rating-input"]')];
      if (!this._hidden || this._inputs.length === 0) return;
      this.el.setAttribute("data-ready", "");
      this._onClick = (event) => {
        const star = event.target.closest('[data-exo="rating-star"]');
        if (!star) return;
        const input = star.querySelector('[data-exo="rating-input"]');
        if (!input || input.disabled) return;
        input.checked = true;
        this._setValue(input.value, true);
      };
      this._onChange = (event) => {
        const input = event.target.closest('[data-exo="rating-input"]');
        if (!input || !input.checked) return;
        this._setValue(input.value, true);
      };
      this.el.addEventListener("click", this._onClick);
      this.el.addEventListener("change", this._onChange);
      this._setValue(this._hidden.value || this.el.dataset.value || "0", false);
    },
    _setValue(value, notify) {
      const numericValue = parseInt(value || "0", 10) || 0;
      this.el.dataset.value = String(numericValue);
      this._hidden.value = String(numericValue);
      this.el.querySelectorAll('[data-exo="rating-star"]').forEach((star, index) => {
        star.toggleAttribute("data-active", index + 1 <= numericValue);
      });
      this._inputs.forEach((input) => {
        input.checked = input.value === String(numericValue);
      });
      if (notify) {
        this._hidden.dispatchEvent(new Event("input", { bubbles: true }));
        this._hidden.dispatchEvent(new Event("change", { bubbles: true }));
      }
    },
    _unbind() {
      if (this._onClick) this.el.removeEventListener("click", this._onClick);
      if (this._onChange) this.el.removeEventListener("change", this._onChange);
      if (this.el) this.el.removeAttribute("data-ready");
      this._hidden = null;
      this._inputs = [];
      this._onClick = null;
      this._onChange = null;
    }
  };

  // ../../assets/js/hooks/menubar.js
  var ExoMenubar = {
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
      this.menus = Array.from(this.el.querySelectorAll('[data-exo="menubar-menu"]'));
      this.triggers = this.menus.map((menu) => menu.querySelector('[data-exo="menubar-trigger"]'));
      this.contents = this.menus.map((menu) => menu.querySelector('[data-exo="menubar-content"]'));
      this.openIndex = -1;
      this.triggers.forEach((trigger, index) => {
        if (!trigger) return;
        trigger.setAttribute("tabindex", index === 0 ? "0" : "-1");
        trigger.setAttribute("aria-expanded", "false");
        if (trigger.tagName === "BUTTON" && !trigger.hasAttribute("type")) {
          trigger.setAttribute("type", "button");
        }
      });
      this.contents.forEach((content, index) => {
        if (!content) return;
        content.hidden = true;
        content.removeAttribute("data-open");
        this._items(index).forEach((item) => {
          if (!item.hasAttribute("role")) item.setAttribute("role", "menuitem");
          item.setAttribute("tabindex", "-1");
          if (item.tagName === "BUTTON" && !item.hasAttribute("type")) {
            item.setAttribute("type", "button");
          }
        });
      });
      this._onClick = (e) => {
        const trigger = e.target.closest('[data-exo="menubar-trigger"]');
        if (trigger && this.el.contains(trigger)) {
          e.preventDefault();
          const index = this.triggers.indexOf(trigger);
          this.openIndex === index ? this._closeAll(true) : this._open(index);
          trigger.focus();
          return;
        }
        const item = e.target.closest('[data-exo="menubar-content"] [role="menuitem"], [data-exo="menubar-content"] button, [data-exo="menubar-content"] a');
        if (item && this.el.contains(item) && !this._isDisabled(item)) {
          setTimeout(() => this._closeAll(true), 0);
        }
      };
      this.el.addEventListener("click", this._onClick);
      this._onPointerEnter = (e) => {
        const trigger = e.target.closest('[data-exo="menubar-trigger"]');
        if (!trigger || !this.el.contains(trigger) || this.openIndex < 0) return;
        this._open(this.triggers.indexOf(trigger));
        trigger.focus();
      };
      this.el.addEventListener("pointerover", this._onPointerEnter);
      this._onKeyDown = (e) => {
        const triggerIndex = this.triggers.indexOf(e.target);
        if (triggerIndex >= 0) {
          this._onTriggerKey(e, triggerIndex);
          return;
        }
        const contentIndex = this.contents.findIndex((content) => content?.contains(e.target));
        if (contentIndex >= 0) this._onMenuKey(e, contentIndex);
      };
      this.el.addEventListener("keydown", this._onKeyDown);
      this._onDocumentPointerDown = (e) => {
        if (!this.el.contains(e.target)) this._closeAll(true);
      };
      document.addEventListener("pointerdown", this._onDocumentPointerDown, true);
      this._onFocusOut = () => {
        clearTimeout(this._focusOutTimer);
        this._focusOutTimer = setTimeout(() => {
          if (!this.el.contains(document.activeElement)) this._closeAll(true);
        }, 0);
      };
      this.el.addEventListener("focusout", this._onFocusOut);
      this.el.dataset.ready = "true";
    },
    _onTriggerKey(e, index) {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        this._focusTrigger(this._nextTrigger(index, 1));
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        this._focusTrigger(this._nextTrigger(index, -1));
        return;
      }
      if (e.key === "Home") {
        e.preventDefault();
        this._focusTrigger(0);
        return;
      }
      if (e.key === "End") {
        e.preventDefault();
        this._focusTrigger(this.triggers.length - 1);
        return;
      }
      if (["ArrowDown", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        this._open(index);
        this._focusItem(index, 0);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        this._closeAll(true);
      }
    },
    _onMenuKey(e, index) {
      const items = this._enabledItems(index);
      const current = items.indexOf(e.target.closest('[role="menuitem"], button, a'));
      if (e.key === "ArrowDown") {
        e.preventDefault();
        this._focusItem(index, current + 1);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        this._focusItem(index, current - 1);
        return;
      }
      if (e.key === "Home") {
        e.preventDefault();
        this._focusItem(index, 0);
        return;
      }
      if (e.key === "End") {
        e.preventDefault();
        this._focusItem(index, items.length - 1);
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        const next = this._nextTrigger(index, 1);
        this._open(next);
        this._focusItem(next, 0);
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        const previous = this._nextTrigger(index, -1);
        this._open(previous);
        this._focusItem(previous, 0);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        this._closeAll(false);
        this._focusTrigger(index);
      }
    },
    _open(index) {
      this.contents.forEach((content, contentIndex) => {
        const trigger = this.triggers[contentIndex];
        const open = contentIndex === index;
        if (!content || !trigger) return;
        content.hidden = !open;
        content.toggleAttribute("data-open", open);
        trigger.setAttribute("aria-expanded", open ? "true" : "false");
      });
      this.openIndex = index;
      this.el.dataset.open = "true";
    },
    _closeAll(resetFocus) {
      this.contents.forEach((content, index) => {
        if (!content) return;
        content.hidden = true;
        content.removeAttribute("data-open");
        this.triggers[index]?.setAttribute("aria-expanded", "false");
      });
      this.openIndex = -1;
      delete this.el.dataset.open;
      if (resetFocus) this._setTriggerTabIndex(0);
    },
    _focusTrigger(index) {
      this._setTriggerTabIndex(index);
      this.triggers[index]?.focus();
      if (this.openIndex >= 0) this._open(index);
    },
    _setTriggerTabIndex(index) {
      this.triggers.forEach((trigger, triggerIndex) => {
        trigger?.setAttribute("tabindex", triggerIndex === index ? "0" : "-1");
      });
    },
    _focusItem(index, itemIndex) {
      const items = this._enabledItems(index);
      if (!items.length) return;
      const bounded = (itemIndex + items.length) % items.length;
      items[bounded].focus();
    },
    _nextTrigger(index, delta) {
      if (!this.triggers.length) return -1;
      return (index + delta + this.triggers.length) % this.triggers.length;
    },
    _items(index) {
      const content = this.contents[index];
      if (!content) return [];
      return Array.from(content.querySelectorAll('[role="menuitem"], button, a'));
    },
    _enabledItems(index) {
      return this._items(index).filter((item) => !this._isDisabled(item));
    },
    _isDisabled(item) {
      return item.disabled || item.getAttribute("aria-disabled") === "true" || item.dataset.disabled === "true";
    },
    _unbind() {
      if (this._onClick) this.el.removeEventListener("click", this._onClick);
      if (this._onPointerEnter) this.el.removeEventListener("pointerover", this._onPointerEnter);
      if (this._onKeyDown) this.el.removeEventListener("keydown", this._onKeyDown);
      if (this._onDocumentPointerDown) document.removeEventListener("pointerdown", this._onDocumentPointerDown, true);
      if (this._onFocusOut) this.el.removeEventListener("focusout", this._onFocusOut);
      clearTimeout(this._focusOutTimer);
      delete this.el.dataset.ready;
      this.menus = [];
      this.triggers = [];
      this.contents = [];
      this.openIndex = -1;
      this._onClick = null;
      this._onPointerEnter = null;
      this._onKeyDown = null;
      this._onDocumentPointerDown = null;
      this._onFocusOut = null;
      this._focusOutTimer = null;
    }
  };

  // ../../assets/js/hooks/overlay.js
  var focusableSelector = [
    "a[href]",
    "button:not([disabled])",
    'input:not([disabled]):not([type="hidden"])',
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(",");
  var ExoOverlay = {
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
      const wasOpen = this._isOpenActive;
      const previousFocus = this._previousFocus;
      const pendingInvoker = this._pendingInvoker;
      this._unbind();
      this._isOpenActive = wasOpen || false;
      this._previousFocus = previousFocus || null;
      this._pendingInvoker = pendingInvoker || null;
      this._panel = this._findPanel();
      this._close = this._findClose();
      if (!this._panel) return;
      this._onKeydown = (event) => this._handleKeydown(event);
      this._onPointerdown = (event) => this._rememberInvoker(event);
      this._onClick = (event) => this._rememberInvoker(event);
      this._observer = new MutationObserver(() => this._sync());
      document.addEventListener("keydown", this._onKeydown, true);
      document.addEventListener("pointerdown", this._onPointerdown, true);
      document.addEventListener("click", this._onClick, true);
      this._observer.observe(this.el, {
        attributes: true,
        attributeFilter: ["data-state", "class", "hidden", "inert", "aria-hidden", "style"]
      });
      this.el.dataset.ready = "true";
      this._sync();
    },
    _findPanel() {
      return this.el.querySelector([
        '[data-exo="modal-content"]',
        '[data-exo="drawer-content"]',
        '[data-exo="sheet-content"]'
      ].join(","));
    },
    _findClose() {
      return this.el.querySelector([
        '[data-exo="modal-close"]',
        '[data-exo="drawer-close"]',
        '[data-exo="sheet-close"]'
      ].join(","));
    },
    _isOpen() {
      if (this.el.dataset.state) return this.el.dataset.state === "open";
      return this.el.classList.contains("open") && !this.el.hidden;
    },
    _sync() {
      const open = this._isOpen();
      if (open && !this._isOpenActive) {
        this._activate();
        return;
      }
      if (!open && this._isOpenActive) {
        this._deactivate();
      }
    },
    _activate() {
      this._isOpenActive = true;
      const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      const previousFocus = this._isRestoreTarget(this._pendingInvoker) ? this._pendingInvoker : active;
      this._pendingInvoker = null;
      this._previousFocus = this._isRestoreTarget(previousFocus) ? previousFocus : null;
      this.el.removeAttribute("inert");
      this.el.setAttribute("aria-hidden", "false");
      requestAnimationFrame(() => {
        const target = this._firstFocusable() || this._panel;
        target?.focus?.({ preventScroll: true });
      });
    },
    _deactivate() {
      this._isOpenActive = false;
      this.el.setAttribute("aria-hidden", "true");
      this.el.setAttribute("inert", "true");
      const target = this._previousFocus;
      this._previousFocus = null;
      requestAnimationFrame(() => {
        if (target && target.isConnected) target.focus({ preventScroll: true });
      });
    },
    _focusables() {
      if (!this._panel) return [];
      return Array.from(this._panel.querySelectorAll(focusableSelector)).filter((element) => {
        if (!(element instanceof HTMLElement)) return false;
        if (element.hidden || element.getAttribute("aria-hidden") === "true") return false;
        if (element.closest("[hidden],[inert]")) return false;
        return Boolean(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
      });
    },
    _firstFocusable() {
      return this._focusables()[0] || null;
    },
    _handleKeydown(event) {
      if (!this._isOpen()) return;
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        this._close?.click?.();
        return;
      }
      if (event.key !== "Tab") return;
      const focusables = this._focusables();
      if (focusables.length === 0) {
        event.preventDefault();
        this._panel?.focus?.({ preventScroll: true });
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !this._panel.contains(active))) {
        event.preventDefault();
        last.focus({ preventScroll: true });
        return;
      }
      if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    },
    _rememberInvoker(event) {
      if (this._isOpen()) return;
      const target = event.target instanceof Element ? event.target.closest(focusableSelector) : null;
      if (this._isRestoreTarget(target)) this._pendingInvoker = target;
    },
    _isRestoreTarget(element) {
      if (!(element instanceof HTMLElement)) return false;
      if (!element.isConnected || this.el.contains(element)) return false;
      if (element.closest("[hidden],[inert]")) return false;
      if (element.hasAttribute("disabled") || element.getAttribute("aria-disabled") === "true") return false;
      if (!element.matches(focusableSelector)) return false;
      return true;
    },
    _unbind() {
      if (this._observer) this._observer.disconnect();
      if (this._onKeydown) document.removeEventListener("keydown", this._onKeydown, true);
      if (this._onPointerdown) document.removeEventListener("pointerdown", this._onPointerdown, true);
      if (this._onClick) document.removeEventListener("click", this._onClick, true);
      if (this.el) delete this.el.dataset.ready;
      this._observer = null;
      this._onKeydown = null;
      this._onPointerdown = null;
      this._onClick = null;
      this._panel = null;
      this._close = null;
    }
  };

  // ../../assets/js/hooks/tabs.js
  var ExoTabs = {
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
      this.el.setAttribute("data-ready", "");
      this._syncTabs();
      this._onClick = (e) => {
        const tab = e.target.closest('[role="tab"]');
        if (!tab || !this.el.contains(tab) || !this._isDisabled(tab)) return;
        e.preventDefault();
        e.stopImmediatePropagation();
      };
      this.el.addEventListener("click", this._onClick);
      this._onKeydown = (e) => {
        const tab = e.target.closest('[role="tab"]');
        if (!tab || !this.el.contains(tab) || this._isDisabled(tab)) return;
        if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
          e.preventDefault();
          this._activate(tab);
          return;
        }
        const tabs = this._tabs();
        if (!tabs.length) return;
        const current = tabs.indexOf(tab);
        if (current === -1) return;
        const vertical = this.el.dataset.orientation === "vertical";
        let next = -1;
        switch (e.key) {
          case "ArrowRight":
            if (vertical) return;
            next = current < tabs.length - 1 ? current + 1 : 0;
            break;
          case "ArrowLeft":
            if (vertical) return;
            next = current > 0 ? current - 1 : tabs.length - 1;
            break;
          case "ArrowDown":
            if (!vertical) return;
            next = current < tabs.length - 1 ? current + 1 : 0;
            break;
          case "ArrowUp":
            if (!vertical) return;
            next = current > 0 ? current - 1 : tabs.length - 1;
            break;
          case "Home":
            next = 0;
            break;
          case "End":
            next = tabs.length - 1;
            break;
          default:
            return;
        }
        e.preventDefault();
        this._focusTab(tabs[next]);
        if (this.el.dataset.activation === "automatic") this._activate(tabs[next]);
      };
      this.el.addEventListener("keydown", this._onKeydown);
    },
    _allTabs() {
      return [...this.el.querySelectorAll('[role="tab"]')];
    },
    _tabs() {
      return this._allTabs().filter((tab) => !this._isDisabled(tab));
    },
    _isDisabled(tab) {
      return tab.hasAttribute("data-disabled") || tab.getAttribute("aria-disabled") === "true" || tab.disabled;
    },
    _syncTabs() {
      const tabs = this._tabs();
      const selected = tabs.find((tab) => tab.getAttribute("aria-selected") === "true") || tabs[0];
      this._allTabs().forEach((tab) => {
        tab.setAttribute("tabindex", tab === selected ? "0" : "-1");
      });
    },
    _focusTab(tab) {
      if (!tab) return;
      this._allTabs().forEach((item) => item.setAttribute("tabindex", item === tab ? "0" : "-1"));
      tab.focus();
    },
    _activate(tab) {
      if (!tab || this._isDisabled(tab)) return;
      tab.click();
    },
    _unbind() {
      if (this._onClick) this.el.removeEventListener("click", this._onClick);
      if (this._onKeydown) this.el.removeEventListener("keydown", this._onKeydown);
      if (this.el) this.el.removeAttribute("data-ready");
      this._onClick = null;
      this._onKeydown = null;
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
    ExoContextMenu,
    ExoRating,
    ExoMenubar,
    ExoOverlay,
    ExoTabs
  };

  // js/storybook.js
  window.storybook = {
    Hooks: hooks,
    Params: {},
    Uploaders: {}
  };
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vYXNzZXRzL2pzL2hvb2tzL2FjY29yZGlvbi5qcyIsICIuLi8uLi8uLi8uLi9hc3NldHMvanMvaG9va3MvY2Fyb3VzZWwuanMiLCAiLi4vLi4vLi4vLi4vYXNzZXRzL2pzL2hvb2tzL2NvbGxhcHNpYmxlLmpzIiwgIi4uLy4uLy4uLy4uL2Fzc2V0cy9qcy9ob29rcy9jb21tYW5kX3BhbGV0dGUuanMiLCAiLi4vLi4vLi4vLi4vYXNzZXRzL2pzL2hvb2tzL3NpZGViYXIuanMiLCAiLi4vLi4vLi4vLi4vYXNzZXRzL2pzL2hvb2tzL3RoZW1lX3RvZ2dsZS5qcyIsICIuLi8uLi8uLi8uLi9hc3NldHMvanMvaG9va3MvcG9wb3Zlci5qcyIsICIuLi8uLi8uLi8uLi9hc3NldHMvanMvaG9va3MvZHJvcGRvd25fbWVudS5qcyIsICIuLi8uLi8uLi8uLi9hc3NldHMvanMvaG9va3Mvc2VsZWN0LmpzIiwgIi4uLy4uLy4uLy4uL2Fzc2V0cy9qcy9ob29rcy9jb21ib2JveC5qcyIsICIuLi8uLi8uLi8uLi9hc3NldHMvanMvaG9va3MvdG9vbHRpcC5qcyIsICIuLi8uLi8uLi8uLi9hc3NldHMvanMvaG9va3MvaG92ZXJfY2FyZC5qcyIsICIuLi8uLi8uLi8uLi9hc3NldHMvanMvaG9va3MvY29udGV4dF9tZW51LmpzIiwgIi4uLy4uLy4uLy4uL2Fzc2V0cy9qcy9ob29rcy9yYXRpbmcuanMiLCAiLi4vLi4vLi4vLi4vYXNzZXRzL2pzL2hvb2tzL21lbnViYXIuanMiLCAiLi4vLi4vLi4vLi4vYXNzZXRzL2pzL2hvb2tzL292ZXJsYXkuanMiLCAiLi4vLi4vLi4vLi4vYXNzZXRzL2pzL2hvb2tzL3RhYnMuanMiLCAiLi4vLi4vLi4vLi4vYXNzZXRzL2pzL2luZGV4LmpzIiwgIi4uLy4uLy4uL2Fzc2V0cy9qcy9zdG9yeWJvb2suanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKlxuICogRXhvQWNjb3JkaW9uIGhvb2sgXHUyMDE0IGtleWJvYXJkIG5hdmlnYXRpb24gKyBzaW5nbGUtb3BlbiBlbmZvcmNlbWVudC5cbiAqXG4gKiBSZWFkcyBkYXRhLXR5cGUgKFwic2luZ2xlXCJ8XCJtdWx0aXBsZVwiKSBhbmQgZGF0YS1jb2xsYXBzaWJsZSBmcm9tIHRoZSByb290IGVsZW1lbnQuXG4gKiAtIHNpbmdsZTogb25seSBvbmUgaXRlbSBvcGVuIGF0IGEgdGltZVxuICogLSBtdWx0aXBsZTogYW55IG51bWJlciBvZiBpdGVtcyBvcGVuIChkZWZhdWx0IGNoZWNrYm94IGJlaGF2aW9yKVxuICogLSBjb2xsYXBzaWJsZTogaW4gc2luZ2xlIG1vZGUsIGFsbG93cyBjbG9zaW5nIHRoZSBvcGVuIGl0ZW1cbiAqXG4gKiBLZXlib2FyZDpcbiAqICAgQXJyb3dEb3duIC8gQXJyb3dVcCBcdTIwMTQgbW92ZSBmb2N1cyBiZXR3ZWVuIHRyaWdnZXJzXG4gKiAgIEhvbWUgLyBFbmQgXHUyMDE0IGZvY3VzIGZpcnN0IC8gbGFzdCB0cmlnZ2VyXG4gKiAgIEVudGVyIC8gU3BhY2UgXHUyMDE0IHRvZ2dsZSBpdGVtIChoYW5kbGVkIG5hdGl2ZWx5IGJ5IGJ1dHRvbiwgYnV0IHdlIG1hbmFnZSBzaW5nbGUtbW9kZSlcbiAqL1xuY29uc3QgRXhvQWNjb3JkaW9uID0ge1xuICBtb3VudGVkKCkge1xuICAgIHRoaXMuX3RyaWdnZXJzID0gKCkgPT5cbiAgICAgIEFycmF5LmZyb20odGhpcy5lbC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1leG89XCJhY2NvcmRpb24tdHJpZ2dlclwiXTpub3QoW2Rpc2FibGVkXSknKSlcblxuICAgIHRoaXMuX2NoZWNrYm94ZXMgPSAoKSA9PlxuICAgICAgQXJyYXkuZnJvbSh0aGlzLmVsLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWV4bz1cImFjY29yZGlvbi1zdGF0ZVwiXTpub3QoW2Rpc2FibGVkXSknKSlcblxuICAgIHRoaXMuX2lzU2luZ2xlID0gKCkgPT4gdGhpcy5lbC5kYXRhc2V0LnR5cGUgPT09IFwic2luZ2xlXCJcbiAgICB0aGlzLl9pc0NvbGxhcHNpYmxlID0gKCkgPT4gdGhpcy5lbC5oYXNBdHRyaWJ1dGUoXCJkYXRhLWNvbGxhcHNpYmxlXCIpXG5cbiAgICAvLyBLZXlib2FyZCBuYXZpZ2F0aW9uXG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCB0aGlzLl9vbktleWRvd24gPSAoZSkgPT4ge1xuICAgICAgY29uc3QgdHJpZ2dlciA9IGUudGFyZ2V0LmNsb3Nlc3QoJ1tkYXRhLWV4bz1cImFjY29yZGlvbi10cmlnZ2VyXCJdJylcbiAgICAgIGlmICghdHJpZ2dlcikgcmV0dXJuXG5cbiAgICAgIGNvbnN0IHRyaWdnZXJzID0gdGhpcy5fdHJpZ2dlcnMoKVxuICAgICAgY29uc3QgaWR4ID0gdHJpZ2dlcnMuaW5kZXhPZih0cmlnZ2VyKVxuICAgICAgaWYgKGlkeCA9PT0gLTEpIHJldHVyblxuXG4gICAgICBsZXQgdGFyZ2V0ID0gbnVsbFxuXG4gICAgICBzd2l0Y2ggKGUua2V5KSB7XG4gICAgICAgIGNhc2UgXCJBcnJvd0Rvd25cIjpcbiAgICAgICAgICB0YXJnZXQgPSB0cmlnZ2Vyc1soaWR4ICsgMSkgJSB0cmlnZ2Vycy5sZW5ndGhdXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSBcIkFycm93VXBcIjpcbiAgICAgICAgICB0YXJnZXQgPSB0cmlnZ2Vyc1soaWR4IC0gMSArIHRyaWdnZXJzLmxlbmd0aCkgJSB0cmlnZ2Vycy5sZW5ndGhdXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSBcIkhvbWVcIjpcbiAgICAgICAgICB0YXJnZXQgPSB0cmlnZ2Vyc1swXVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgXCJFbmRcIjpcbiAgICAgICAgICB0YXJnZXQgPSB0cmlnZ2Vyc1t0cmlnZ2Vycy5sZW5ndGggLSAxXVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGlmICh0YXJnZXQpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIHRhcmdldC5mb2N1cygpXG4gICAgICB9XG4gICAgfSlcblxuICAgIC8vIENsaWNrIGhhbmRsaW5nIGZvciBzaW5nbGUgbW9kZSArIGNvbGxhcHNpYmxlICsgYXJpYS1leHBhbmRlZCBzeW5jXG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5fb25DbGljayA9IChlKSA9PiB7XG4gICAgICBjb25zdCB0cmlnZ2VyID0gZS50YXJnZXQuY2xvc2VzdCgnW2RhdGEtZXhvPVwiYWNjb3JkaW9uLXRyaWdnZXJcIl0nKVxuICAgICAgaWYgKCF0cmlnZ2VyIHx8IHRyaWdnZXIuZGlzYWJsZWQpIHJldHVyblxuXG4gICAgICBjb25zdCBpdGVtID0gdHJpZ2dlci5jbG9zZXN0KCdbZGF0YS1leG89XCJhY2NvcmRpb24taXRlbVwiXScpXG4gICAgICBjb25zdCBjaGVja2JveCA9IGl0ZW0/LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cImFjY29yZGlvbi1zdGF0ZVwiXScpXG4gICAgICBpZiAoIWNoZWNrYm94KSByZXR1cm5cblxuICAgICAgY29uc3Qgd2FzQ2hlY2tlZCA9IGNoZWNrYm94LmNoZWNrZWRcblxuICAgICAgaWYgKHRoaXMuX2lzU2luZ2xlKCkpIHtcbiAgICAgICAgaWYgKHdhc0NoZWNrZWQgJiYgdGhpcy5faXNDb2xsYXBzaWJsZSgpKSB7XG4gICAgICAgICAgLy8gQ2xvc2UgdGhpcyBpdGVtXG4gICAgICAgICAgY2hlY2tib3guY2hlY2tlZCA9IGZhbHNlXG4gICAgICAgICAgdGhpcy5fc3luY0FyaWEodHJpZ2dlciwgZmFsc2UpXG4gICAgICAgIH0gZWxzZSBpZiAod2FzQ2hlY2tlZCAmJiAhdGhpcy5faXNDb2xsYXBzaWJsZSgpKSB7XG4gICAgICAgICAgLy8gS2VlcCBvcGVuLCBwcmV2ZW50IHRvZ2dsZVxuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIENsb3NlIGFsbCBvdGhlcnMsIG9wZW4gdGhpcyBvbmVcbiAgICAgICAgICB0aGlzLl9jaGVja2JveGVzKCkuZm9yRWFjaCgoY2IpID0+IHtcbiAgICAgICAgICAgIGlmIChjYiAhPT0gY2hlY2tib3ggJiYgY2IuY2hlY2tlZCkge1xuICAgICAgICAgICAgICBjYi5jaGVja2VkID0gZmFsc2VcbiAgICAgICAgICAgICAgY29uc3Qgb3RoZXJUcmlnZ2VyID0gY2IucGFyZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJhY2NvcmRpb24tdHJpZ2dlclwiXScpXG4gICAgICAgICAgICAgIGlmIChvdGhlclRyaWdnZXIpIHRoaXMuX3N5bmNBcmlhKG90aGVyVHJpZ2dlciwgZmFsc2UpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgICBjaGVja2JveC5jaGVja2VkID0gdHJ1ZVxuICAgICAgICAgIHRoaXMuX3N5bmNBcmlhKHRyaWdnZXIsIHRydWUpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIE11bHRpcGxlIG1vZGUgXHUyMDE0IGp1c3QgdG9nZ2xlXG4gICAgICAgIGNoZWNrYm94LmNoZWNrZWQgPSAhd2FzQ2hlY2tlZFxuICAgICAgICB0aGlzLl9zeW5jQXJpYSh0cmlnZ2VyLCBjaGVja2JveC5jaGVja2VkKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICAvLyBTeW5jIGluaXRpYWwgYXJpYSBzdGF0ZXNcbiAgICB0aGlzLl9zeW5jQWxsQXJpYSgpXG4gIH0sXG5cbiAgdXBkYXRlZCgpIHtcbiAgICB0aGlzLl9zeW5jQWxsQXJpYSgpXG4gIH0sXG5cbiAgZGVzdHJveWVkKCkge1xuICAgIGlmICh0aGlzLl9vbktleWRvd24pIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5fb25LZXlkb3duKVxuICAgIGlmICh0aGlzLl9vbkNsaWNrKSB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLl9vbkNsaWNrKVxuICB9LFxuXG4gIF9zeW5jQXJpYSh0cmlnZ2VyLCBleHBhbmRlZCkge1xuICAgIHRyaWdnZXIuc2V0QXR0cmlidXRlKFwiYXJpYS1leHBhbmRlZFwiLCBTdHJpbmcoZXhwYW5kZWQpKVxuICB9LFxuXG4gIF9zeW5jQWxsQXJpYSgpIHtcbiAgICBjb25zdCBpdGVtcyA9IHRoaXMuZWwucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZXhvPVwiYWNjb3JkaW9uLWl0ZW1cIl0nKVxuICAgIGl0ZW1zLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgIGNvbnN0IGNoZWNrYm94ID0gaXRlbS5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJhY2NvcmRpb24tc3RhdGVcIl0nKVxuICAgICAgY29uc3QgdHJpZ2dlciA9IGl0ZW0ucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwiYWNjb3JkaW9uLXRyaWdnZXJcIl0nKVxuICAgICAgaWYgKGNoZWNrYm94ICYmIHRyaWdnZXIpIHtcbiAgICAgICAgdGhpcy5fc3luY0FyaWEodHJpZ2dlciwgY2hlY2tib3guY2hlY2tlZClcbiAgICAgIH1cbiAgICB9KVxuICB9XG59XG5cbmV4cG9ydCB7IEV4b0FjY29yZGlvbiB9XG4iLCAiLyoqXG4gKiBFeG9DYXJvdXNlbCBob29rIFx1MjAxNCBzY3JvbGxhYmxlIGNhcm91c2VsIHdpdGggcHJldi9uZXh0IGJ1dHRvbnMuXG4gKi9cbmNvbnN0IEV4b0Nhcm91c2VsID0ge1xuICBtb3VudGVkKCkge1xuICAgIHRoaXMudHJhY2sgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cImNhcm91c2VsLXRyYWNrXCJdJylcbiAgICB0aGlzLnZpZXdwb3J0ID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJjYXJvdXNlbC12aWV3cG9ydFwiXScpXG4gICAgdGhpcy5wcmV2ID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJjYXJvdXNlbC1wcmV2XCJdJylcbiAgICB0aGlzLm5leHQgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cImNhcm91c2VsLW5leHRcIl0nKVxuICAgIGlmICghdGhpcy50cmFjayB8fCAhdGhpcy52aWV3cG9ydCkgcmV0dXJuXG5cbiAgICBjb25zdCBzbGlkZXMgPSAoKSA9PiBBcnJheS5mcm9tKHRoaXMudHJhY2sucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZXhvPVwiY2Fyb3VzZWwtc2xpZGVcIl0nKSlcbiAgICBjb25zdCBsb29wID0gdGhpcy5lbC5oYXNBdHRyaWJ1dGUoXCJkYXRhLWxvb3BcIilcbiAgICBjb25zdCBhdFN0YXJ0ID0gKCkgPT4gdGhpcy52aWV3cG9ydC5zY3JvbGxMZWZ0IDw9IDVcbiAgICBjb25zdCBhdEVuZCA9ICgpID0+IHRoaXMudmlld3BvcnQuc2Nyb2xsTGVmdCA+PSB0aGlzLnZpZXdwb3J0LnNjcm9sbFdpZHRoIC0gdGhpcy52aWV3cG9ydC5vZmZzZXRXaWR0aCAtIDVcblxuICAgIGNvbnN0IHNldEJ1dHRvblN0YXRlID0gKGJ1dHRvbiwgZGlzYWJsZWQpID0+IHtcbiAgICAgIGlmICghYnV0dG9uKSByZXR1cm5cbiAgICAgIGJ1dHRvbi5kaXNhYmxlZCA9IGRpc2FibGVkXG4gICAgICBidXR0b24udG9nZ2xlQXR0cmlidXRlKFwiZGF0YS1kaXNhYmxlZFwiLCBkaXNhYmxlZClcbiAgICAgIGJ1dHRvbi5zZXRBdHRyaWJ1dGUoXCJhcmlhLWRpc2FibGVkXCIsIGRpc2FibGVkID8gXCJ0cnVlXCIgOiBcImZhbHNlXCIpXG4gICAgfVxuXG4gICAgY29uc3QgdXBkYXRlQ29udHJvbHMgPSAoKSA9PiB7XG4gICAgICBpZiAobG9vcCkge1xuICAgICAgICBzZXRCdXR0b25TdGF0ZSh0aGlzLnByZXYsIGZhbHNlKVxuICAgICAgICBzZXRCdXR0b25TdGF0ZSh0aGlzLm5leHQsIGZhbHNlKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgc2V0QnV0dG9uU3RhdGUodGhpcy5wcmV2LCBhdFN0YXJ0KCkpXG4gICAgICBzZXRCdXR0b25TdGF0ZSh0aGlzLm5leHQsIGF0RW5kKCkpXG4gICAgfVxuXG4gICAgY29uc3Qgc2Nyb2xsVG8gPSAoZGlyZWN0aW9uKSA9PiB7XG4gICAgICBjb25zdCBzID0gc2xpZGVzKClcbiAgICAgIGlmIChzLmxlbmd0aCA9PT0gMCkgcmV0dXJuXG4gICAgICBjb25zdCBzbGlkZVdpZHRoID0gc1swXS5vZmZzZXRXaWR0aFxuICAgICAgY29uc3QgZ2FwID0gcGFyc2VGbG9hdChnZXRDb21wdXRlZFN0eWxlKHRoaXMudHJhY2spLmdhcCkgfHwgMFxuICAgICAgY29uc3Qgc2Nyb2xsQW1vdW50ID0gc2xpZGVXaWR0aCArIGdhcFxuXG4gICAgICBpZiAoZGlyZWN0aW9uID09PSBcIm5leHRcIikge1xuICAgICAgICBpZiAobG9vcCAmJiBhdEVuZCgpKSB7XG4gICAgICAgICAgdGhpcy52aWV3cG9ydC5zY3JvbGxUbyh7IGxlZnQ6IDAsIGJlaGF2aW9yOiBcInNtb290aFwiIH0pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy52aWV3cG9ydC5zY3JvbGxCeSh7IGxlZnQ6IHNjcm9sbEFtb3VudCwgYmVoYXZpb3I6IFwic21vb3RoXCIgfSlcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGxvb3AgJiYgYXRTdGFydCgpKSB7XG4gICAgICAgICAgdGhpcy52aWV3cG9ydC5zY3JvbGxUbyh7IGxlZnQ6IHRoaXMudmlld3BvcnQuc2Nyb2xsV2lkdGgsIGJlaGF2aW9yOiBcInNtb290aFwiIH0pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy52aWV3cG9ydC5zY3JvbGxCeSh7IGxlZnQ6IC1zY3JvbGxBbW91bnQsIGJlaGF2aW9yOiBcInNtb290aFwiIH0pXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgd2luZG93LnNldFRpbWVvdXQodXBkYXRlQ29udHJvbHMsIDM1MClcbiAgICB9XG5cbiAgICBpZiAodGhpcy5wcmV2KSB0aGlzLnByZXYuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuX29uUHJldiA9ICgpID0+IHNjcm9sbFRvKFwicHJldlwiKSlcbiAgICBpZiAodGhpcy5uZXh0KSB0aGlzLm5leHQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuX29uTmV4dCA9ICgpID0+IHNjcm9sbFRvKFwibmV4dFwiKSlcbiAgICB0aGlzLnZpZXdwb3J0LmFkZEV2ZW50TGlzdGVuZXIoXCJzY3JvbGxcIiwgdGhpcy5fb25TY3JvbGwgPSAoKSA9PiB1cGRhdGVDb250cm9scygpKVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHRoaXMuX29uUmVzaXplID0gKCkgPT4gdXBkYXRlQ29udHJvbHMoKSlcblxuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5fb25LZXkgPSAoZSkgPT4ge1xuICAgICAgaWYgKGUua2V5ID09PSBcIkFycm93TGVmdFwiKSB7IGUucHJldmVudERlZmF1bHQoKTsgc2Nyb2xsVG8oXCJwcmV2XCIpIH1cbiAgICAgIGlmIChlLmtleSA9PT0gXCJBcnJvd1JpZ2h0XCIpIHsgZS5wcmV2ZW50RGVmYXVsdCgpOyBzY3JvbGxUbyhcIm5leHRcIikgfVxuICAgIH0pXG5cbiAgICB1cGRhdGVDb250cm9scygpXG4gIH0sXG5cbiAgZGVzdHJveWVkKCkge1xuICAgIGlmICh0aGlzLnByZXYgJiYgdGhpcy5fb25QcmV2KSB0aGlzLnByZXYucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuX29uUHJldilcbiAgICBpZiAodGhpcy5uZXh0ICYmIHRoaXMuX29uTmV4dCkgdGhpcy5uZXh0LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLl9vbk5leHQpXG4gICAgaWYgKHRoaXMudmlld3BvcnQgJiYgdGhpcy5fb25TY3JvbGwpIHRoaXMudmlld3BvcnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLCB0aGlzLl9vblNjcm9sbClcbiAgICBpZiAodGhpcy5fb25SZXNpemUpIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHRoaXMuX29uUmVzaXplKVxuICAgIGlmICh0aGlzLl9vbktleSkgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCB0aGlzLl9vbktleSlcbiAgfVxufVxuXG5leHBvcnQgeyBFeG9DYXJvdXNlbCB9XG4iLCAiLyoqXG4gKiBFeG9Db2xsYXBzaWJsZSBob29rIFx1MjAxNCBjbGljayB0b2dnbGUgKyBhcmlhLWV4cGFuZGVkIHN5bmMuXG4gKlxuICogVXNlcyBhIGhpZGRlbiBjaGVja2JveCB0byBkcml2ZSBDU1Mgc3RhdGUgKHNhbWUgcGF0dGVybiBhcyBFeG9BY2NvcmRpb24pLlxuICogVGhlIHRyaWdnZXIgYnV0dG9uIHRvZ2dsZXMgdGhlIGNoZWNrYm94IGFuZCBzeW5jcyBhcmlhLWV4cGFuZGVkLlxuICovXG5jb25zdCBFeG9Db2xsYXBzaWJsZSA9IHtcbiAgbW91bnRlZCgpIHtcbiAgICB0aGlzLl9jaGVja2JveCA9ICgpID0+IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwiY29sbGFwc2libGUtc3RhdGVcIl0nKVxuICAgIHRoaXMuX3RyaWdnZXIgPSAoKSA9PiB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cImNvbGxhcHNpYmxlLXRyaWdnZXJcIl0nKVxuXG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5fb25DbGljayA9IChlKSA9PiB7XG4gICAgICBjb25zdCB0cmlnZ2VyID0gZS50YXJnZXQuY2xvc2VzdCgnW2RhdGEtZXhvPVwiY29sbGFwc2libGUtdHJpZ2dlclwiXScpXG4gICAgICBpZiAoIXRyaWdnZXIpIHJldHVyblxuXG4gICAgICBjb25zdCBjaGVja2JveCA9IHRoaXMuX2NoZWNrYm94KClcbiAgICAgIGlmICghY2hlY2tib3gpIHJldHVyblxuXG4gICAgICBjaGVja2JveC5jaGVja2VkID0gIWNoZWNrYm94LmNoZWNrZWRcbiAgICAgIHRyaWdnZXIuc2V0QXR0cmlidXRlKFwiYXJpYS1leHBhbmRlZFwiLCBTdHJpbmcoY2hlY2tib3guY2hlY2tlZCkpXG4gICAgfSlcblxuICAgIHRoaXMuX3N5bmNBcmlhKClcbiAgfSxcblxuICB1cGRhdGVkKCkge1xuICAgIHRoaXMuX3N5bmNBcmlhKClcbiAgfSxcblxuICBkZXN0cm95ZWQoKSB7XG4gICAgaWYgKHRoaXMuX29uQ2xpY2spIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuX29uQ2xpY2spXG4gIH0sXG5cbiAgX3N5bmNBcmlhKCkge1xuICAgIGNvbnN0IGNoZWNrYm94ID0gdGhpcy5fY2hlY2tib3goKVxuICAgIGNvbnN0IHRyaWdnZXIgPSB0aGlzLl90cmlnZ2VyKClcbiAgICBpZiAoY2hlY2tib3ggJiYgdHJpZ2dlcikge1xuICAgICAgdHJpZ2dlci5zZXRBdHRyaWJ1dGUoXCJhcmlhLWV4cGFuZGVkXCIsIFN0cmluZyhjaGVja2JveC5jaGVja2VkKSlcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IHsgRXhvQ29sbGFwc2libGUgfVxuIiwgImNvbnN0IFBhbGV0dGVSZWdpc3RyeSA9IHtcbiAgc3RhY2s6IFtdLFxuICBsaXN0ZW5lckJvdW5kOiBmYWxzZSxcblxuICByZWdpc3Rlcihob29rKSB7XG4gICAgdGhpcy5zdGFjayA9IHRoaXMuc3RhY2suZmlsdGVyKChlbnRyeSkgPT4gZW50cnkgIT09IGhvb2spXG4gICAgdGhpcy5zdGFjay5wdXNoKGhvb2spXG4gICAgdGhpcy5fZW5zdXJlTGlzdGVuZXIoKVxuICB9LFxuXG4gIHVucmVnaXN0ZXIoaG9vaykge1xuICAgIHRoaXMuc3RhY2sgPSB0aGlzLnN0YWNrLmZpbHRlcigoZW50cnkpID0+IGVudHJ5ICE9PSBob29rKVxuICAgIGlmICh0aGlzLnN0YWNrLmxlbmd0aCA9PT0gMCAmJiB0aGlzLmxpc3RlbmVyQm91bmQpIHtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIHRoaXMuX29uS2V5KVxuICAgICAgdGhpcy5saXN0ZW5lckJvdW5kID0gZmFsc2VcbiAgICB9XG4gIH0sXG5cbiAgX2Vuc3VyZUxpc3RlbmVyKCkge1xuICAgIGlmICh0aGlzLmxpc3RlbmVyQm91bmQpIHJldHVyblxuICAgIHRoaXMuX29uS2V5ID0gKGUpID0+IHtcbiAgICAgIGlmICghKChlLm1ldGFLZXkgfHwgZS5jdHJsS2V5KSAmJiBlLmtleSA9PT0gXCJrXCIpKSByZXR1cm5cbiAgICAgIGNvbnN0IHRhcmdldCA9IHRoaXMuc3RhY2tbdGhpcy5zdGFjay5sZW5ndGggLSAxXVxuICAgICAgaWYgKCF0YXJnZXQgfHwgIXRhcmdldC5fdG9nZ2xlKSByZXR1cm5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgdGFyZ2V0Ll90b2dnbGUoKVxuICAgIH1cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCB0aGlzLl9vbktleSlcbiAgICB0aGlzLmxpc3RlbmVyQm91bmQgPSB0cnVlXG4gIH1cbn1cblxuY29uc3QgRXhvQ29tbWFuZFBhbGV0dGUgPSB7XG4gIG1vdW50ZWQoKSB7IHRoaXMuX2JpbmQoKSB9LFxuICB1cGRhdGVkKCkgeyB0aGlzLl9iaW5kKCkgfSxcbiAgZGVzdHJveWVkKCkge1xuICAgIFBhbGV0dGVSZWdpc3RyeS51bnJlZ2lzdGVyKHRoaXMpXG4gICAgdGhpcy5fdW5iaW5kKClcbiAgfSxcblxuICBfYmluZCgpIHtcbiAgICB0aGlzLl91bmJpbmQoKVxuICAgIHRoaXMuYmFja2Ryb3AgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cImNvbW1hbmQtcGFsZXR0ZS1iYWNrZHJvcFwiXScpXG4gICAgdGhpcy5pbnB1dCA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwiY29tbWFuZC1wYWxldHRlLWlucHV0XCJdJylcbiAgICB0aGlzLmxpc3QgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cImNvbW1hbmQtcGFsZXR0ZS1saXN0XCJdJylcbiAgICB0aGlzLmVtcHR5ID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJjb21tYW5kLXBhbGV0dGUtZW1wdHlcIl0nKVxuICAgIHRoaXMuaXRlbXMgPSBBcnJheS5mcm9tKHRoaXMuZWwucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZXhvPVwiY29tbWFuZC1wYWxldHRlLWl0ZW1cIl0nKSlcbiAgICB0aGlzLmFjdGl2ZUluZGV4ID0gLTFcblxuICAgIGlmICh0aGlzLmxpc3QgJiYgIXRoaXMubGlzdC5pZCkgdGhpcy5saXN0LmlkID0gYCR7dGhpcy5lbC5pZH0tbGlzdGBcblxuICAgIHRoaXMuaXRlbXMuZm9yRWFjaCgoaXRlbSwgaW5kZXgpID0+IHtcbiAgICAgIGlmICghaXRlbS5pZCkgaXRlbS5pZCA9IGAke3RoaXMuZWwuaWR9LWl0ZW0tJHtpbmRleH1gXG4gICAgICBpdGVtLnNldEF0dHJpYnV0ZShcInJvbGVcIiwgXCJvcHRpb25cIilcbiAgICAgIGl0ZW0uc2V0QXR0cmlidXRlKFwidGFiaW5kZXhcIiwgXCItMVwiKVxuICAgICAgaWYgKCFpdGVtLmRhdGFzZXQudmFsdWUpIGl0ZW0uZGF0YXNldC52YWx1ZSA9IGl0ZW0udGV4dENvbnRlbnQudHJpbSgpXG4gICAgICBpZiAoIWl0ZW0uZGF0YXNldC5zZWFyY2gpIGl0ZW0uZGF0YXNldC5zZWFyY2ggPSBpdGVtLnRleHRDb250ZW50LnRyaW0oKVxuICAgICAgaWYgKGl0ZW0uZGlzYWJsZWQgfHwgaXRlbS5nZXRBdHRyaWJ1dGUoXCJhcmlhLWRpc2FibGVkXCIpID09PSBcInRydWVcIikge1xuICAgICAgICBpdGVtLmRhdGFzZXQuZGlzYWJsZWQgPSBcInRydWVcIlxuICAgICAgICBpdGVtLnNldEF0dHJpYnV0ZShcImFyaWEtZGlzYWJsZWRcIiwgXCJ0cnVlXCIpXG4gICAgICB9XG4gICAgICBpZiAoaXRlbS50YWdOYW1lID09PSBcIkJVVFRPTlwiICYmICFpdGVtLmhhc0F0dHJpYnV0ZShcInR5cGVcIikpIHtcbiAgICAgICAgaXRlbS5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsIFwiYnV0dG9uXCIpXG4gICAgICB9XG4gICAgfSlcblxuICAgIGlmICh0aGlzLmlucHV0KSB7XG4gICAgICB0aGlzLmlucHV0LnNldEF0dHJpYnV0ZShcInJvbGVcIiwgXCJjb21ib2JveFwiKVxuICAgICAgdGhpcy5pbnB1dC5zZXRBdHRyaWJ1dGUoXCJhcmlhLWF1dG9jb21wbGV0ZVwiLCBcImxpc3RcIilcbiAgICAgIGlmICh0aGlzLmxpc3QpIHRoaXMuaW5wdXQuc2V0QXR0cmlidXRlKFwiYXJpYS1jb250cm9sc1wiLCB0aGlzLmxpc3QuaWQpXG4gICAgfVxuXG4gICAgY29uc3QgaXNPcGVuID0gKCkgPT4gdGhpcy5lbC5jbGFzc0xpc3QuY29udGFpbnMoXCJvcGVuXCIpXG4gICAgY29uc3Qgc3luY1N0YXRlID0gKCkgPT4ge1xuICAgICAgdGhpcy5lbC5kYXRhc2V0LnN0YXRlID0gaXNPcGVuKCkgPyBcIm9wZW5cIiA6IFwiY2xvc2VkXCJcbiAgICAgIHRoaXMuZWwuc2V0QXR0cmlidXRlKFwiYXJpYS1oaWRkZW5cIiwgaXNPcGVuKCkgPyBcImZhbHNlXCIgOiBcInRydWVcIilcbiAgICAgIGlmICh0aGlzLmlucHV0KSB0aGlzLmlucHV0LnNldEF0dHJpYnV0ZShcImFyaWEtZXhwYW5kZWRcIiwgaXNPcGVuKCkgPyBcInRydWVcIiA6IFwiZmFsc2VcIilcbiAgICB9XG5cbiAgICB0aGlzLl9vcGVuID0gKCkgPT4ge1xuICAgICAgdGhpcy5lbC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiXG4gICAgICB0aGlzLmVsLmNsYXNzTGlzdC5hZGQoXCJvcGVuXCIpXG4gICAgICBzeW5jU3RhdGUoKVxuICAgICAgdGhpcy5fZmlsdGVyKClcbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmlucHV0KSB0aGlzLmlucHV0LmZvY3VzKClcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgdGhpcy5fY2xvc2UgPSAoKSA9PiB7XG4gICAgICB0aGlzLmVsLmNsYXNzTGlzdC5yZW1vdmUoXCJvcGVuXCIpXG4gICAgICB0aGlzLmVsLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIlxuICAgICAgc3luY1N0YXRlKClcbiAgICAgIGlmICh0aGlzLmlucHV0KSB0aGlzLmlucHV0LnZhbHVlID0gXCJcIlxuICAgICAgdGhpcy5pdGVtcy5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgIGl0ZW0uaGlkZGVuID0gZmFsc2VcbiAgICAgICAgdGhpcy5fc2V0SXRlbUFjdGl2ZShpdGVtLCBmYWxzZSlcbiAgICAgIH0pXG4gICAgICBpZiAodGhpcy5lbXB0eSkgdGhpcy5lbXB0eS5oaWRkZW4gPSB0cnVlXG4gICAgICB0aGlzLmFjdGl2ZUluZGV4ID0gLTFcbiAgICAgIHRoaXMuX3N5bmNBY3RpdmVEZXNjZW5kYW50KClcbiAgICB9XG5cbiAgICBzeW5jU3RhdGUoKVxuICAgIGlmICghaXNPcGVuKCkpIHRoaXMuZWwuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiXG4gICAgaWYgKHRoaXMuZW1wdHkpIHRoaXMuZW1wdHkuaGlkZGVuID0gdHJ1ZVxuICAgIHRoaXMuZWwuZGF0YXNldC5yZWFkeSA9IFwidHJ1ZVwiXG5cbiAgICB0aGlzLl90b2dnbGUgPSAoKSA9PiAoaXNPcGVuKCkgPyB0aGlzLl9jbG9zZSgpIDogdGhpcy5fb3BlbigpKVxuICAgIFBhbGV0dGVSZWdpc3RyeS5yZWdpc3Rlcih0aGlzKVxuXG4gICAgdGhpcy5fb25LZXkgPSAoZSkgPT4ge1xuICAgICAgaWYgKGUua2V5ID09PSBcIkVzY2FwZVwiKSB7XG4gICAgICAgIHRoaXMuX2Nsb3NlKClcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGlmICghaXNPcGVuKCkpIHJldHVyblxuXG4gICAgICBpZiAoZS5rZXkgPT09IFwiQXJyb3dEb3duXCIpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIHRoaXMuX21vdmVBY3RpdmUoMSlcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGlmIChlLmtleSA9PT0gXCJBcnJvd1VwXCIpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIHRoaXMuX21vdmVBY3RpdmUoLTEpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBpZiAoZS5rZXkgPT09IFwiSG9tZVwiKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICB0aGlzLl9zZXRBY3RpdmVCeVZpc2libGVJbmRleCgwKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgaWYgKGUua2V5ID09PSBcIkVuZFwiKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICBjb25zdCB2aXNpYmxlID0gdGhpcy5fdmlzaWJsZUl0ZW1zKClcbiAgICAgICAgdGhpcy5fc2V0QWN0aXZlQnlWaXNpYmxlSW5kZXgodmlzaWJsZS5sZW5ndGggLSAxKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgaWYgKGUua2V5ID09PSBcIkVudGVyXCIgJiYgdGhpcy5hY3RpdmVJbmRleCA+PSAwKSB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSB0aGlzLml0ZW1zW3RoaXMuYWN0aXZlSW5kZXhdXG4gICAgICAgIGlmIChpdGVtICYmICF0aGlzLl9pc0Rpc2FibGVkKGl0ZW0pICYmICFpdGVtLmhpZGRlbikge1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgIGl0ZW0uY2xpY2soKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5fb25LZXkpXG5cbiAgICB0aGlzLl9vbklucHV0ID0gKCkgPT4gdGhpcy5fZmlsdGVyKClcbiAgICBpZiAodGhpcy5pbnB1dCkgdGhpcy5pbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgdGhpcy5fb25JbnB1dClcblxuICAgIHRoaXMuX29uSXRlbVBvaW50ZXJNb3ZlID0gKGUpID0+IHtcbiAgICAgIGNvbnN0IGl0ZW0gPSBlLnRhcmdldC5jbG9zZXN0KCdbZGF0YS1leG89XCJjb21tYW5kLXBhbGV0dGUtaXRlbVwiXScpXG4gICAgICBpZiAoIWl0ZW0gfHwgdGhpcy5faXNEaXNhYmxlZChpdGVtKSB8fCBpdGVtLmhpZGRlbikgcmV0dXJuXG4gICAgICB0aGlzLl9zZXRBY3RpdmUodGhpcy5pdGVtcy5pbmRleE9mKGl0ZW0pKVxuICAgIH1cbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoXCJwb2ludGVybW92ZVwiLCB0aGlzLl9vbkl0ZW1Qb2ludGVyTW92ZSlcblxuICAgIHRoaXMuX29uSXRlbUNsaWNrID0gKGUpID0+IHtcbiAgICAgIGNvbnN0IGl0ZW0gPSBlLnRhcmdldC5jbG9zZXN0KCdbZGF0YS1leG89XCJjb21tYW5kLXBhbGV0dGUtaXRlbVwiXScpXG4gICAgICBpZiAoIWl0ZW0pIHJldHVyblxuICAgICAgaWYgKHRoaXMuX2lzRGlzYWJsZWQoaXRlbSkpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgaWYgKGl0ZW0uZGF0YXNldC5jbG9zZSAhPT0gXCJmYWxzZVwiKSB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy5fY2xvc2UoKSwgMClcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5fb25JdGVtQ2xpY2spXG5cbiAgICBpZiAodGhpcy5iYWNrZHJvcCkge1xuICAgICAgdGhpcy5fb25CYWNrZHJvcCA9ICgpID0+IHRoaXMuX2Nsb3NlKClcbiAgICAgIHRoaXMuYmFja2Ryb3AuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuX29uQmFja2Ryb3ApXG4gICAgfVxuICB9LFxuXG4gIF9pc0Rpc2FibGVkKGl0ZW0pIHtcbiAgICByZXR1cm4gaXRlbS5kaXNhYmxlZCB8fCBpdGVtLmRhdGFzZXQuZGlzYWJsZWQgPT09IFwidHJ1ZVwiIHx8IGl0ZW0uZ2V0QXR0cmlidXRlKFwiYXJpYS1kaXNhYmxlZFwiKSA9PT0gXCJ0cnVlXCJcbiAgfSxcblxuICBfdmlzaWJsZUl0ZW1zKCkge1xuICAgIHJldHVybiB0aGlzLml0ZW1zLmZpbHRlcigoaXRlbSkgPT4gIWl0ZW0uaGlkZGVuICYmICF0aGlzLl9pc0Rpc2FibGVkKGl0ZW0pKVxuICB9LFxuXG4gIF9maWx0ZXIoKSB7XG4gICAgY29uc3QgcXVlcnkgPSAodGhpcy5pbnB1dD8udmFsdWUgfHwgXCJcIikudHJpbSgpLnRvTG93ZXJDYXNlKClcbiAgICBsZXQgdmlzaWJsZUNvdW50ID0gMFxuXG4gICAgdGhpcy5pdGVtcy5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICBjb25zdCB0ZXh0ID0gYCR7aXRlbS5kYXRhc2V0LnNlYXJjaCB8fCBcIlwifSAke2l0ZW0uZGF0YXNldC52YWx1ZSB8fCBcIlwifSAke2l0ZW0udGV4dENvbnRlbnQgfHwgXCJcIn1gLnRvTG93ZXJDYXNlKClcbiAgICAgIGNvbnN0IHZpc2libGUgPSAhcXVlcnkgfHwgdGV4dC5pbmNsdWRlcyhxdWVyeSlcbiAgICAgIGl0ZW0uaGlkZGVuID0gIXZpc2libGVcbiAgICAgIGlmICh2aXNpYmxlICYmICF0aGlzLl9pc0Rpc2FibGVkKGl0ZW0pKSB2aXNpYmxlQ291bnQgKz0gMVxuICAgIH0pXG5cbiAgICBpZiAodGhpcy5lbXB0eSkgdGhpcy5lbXB0eS5oaWRkZW4gPSB2aXNpYmxlQ291bnQgPiAwXG4gICAgdGhpcy5fc2V0QWN0aXZlQnlWaXNpYmxlSW5kZXgoMClcbiAgfSxcblxuICBfbW92ZUFjdGl2ZShkZWx0YSkge1xuICAgIGNvbnN0IHZpc2libGUgPSB0aGlzLl92aXNpYmxlSXRlbXMoKVxuICAgIGlmICghdmlzaWJsZS5sZW5ndGgpIHtcbiAgICAgIHRoaXMuX3NldEFjdGl2ZSgtMSlcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IGN1cnJlbnQgPSB2aXNpYmxlLmluZGV4T2YodGhpcy5pdGVtc1t0aGlzLmFjdGl2ZUluZGV4XSlcbiAgICBjb25zdCBuZXh0ID0gY3VycmVudCA9PT0gLTFcbiAgICAgID8gKGRlbHRhID4gMCA/IDAgOiB2aXNpYmxlLmxlbmd0aCAtIDEpXG4gICAgICA6IChjdXJyZW50ICsgZGVsdGEgKyB2aXNpYmxlLmxlbmd0aCkgJSB2aXNpYmxlLmxlbmd0aFxuXG4gICAgdGhpcy5fc2V0QWN0aXZlKHRoaXMuaXRlbXMuaW5kZXhPZih2aXNpYmxlW25leHRdKSlcbiAgfSxcblxuICBfc2V0QWN0aXZlQnlWaXNpYmxlSW5kZXgoaW5kZXgpIHtcbiAgICBjb25zdCB2aXNpYmxlID0gdGhpcy5fdmlzaWJsZUl0ZW1zKClcbiAgICBpZiAoIXZpc2libGUubGVuZ3RoIHx8IGluZGV4IDwgMCkge1xuICAgICAgdGhpcy5fc2V0QWN0aXZlKC0xKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNvbnN0IGJvdW5kZWQgPSBNYXRoLm1heCgwLCBNYXRoLm1pbihpbmRleCwgdmlzaWJsZS5sZW5ndGggLSAxKSlcbiAgICB0aGlzLl9zZXRBY3RpdmUodGhpcy5pdGVtcy5pbmRleE9mKHZpc2libGVbYm91bmRlZF0pKVxuICB9LFxuXG4gIF9zZXRBY3RpdmUoaW5kZXgpIHtcbiAgICB0aGlzLml0ZW1zLmZvckVhY2goKGl0ZW0sIGl0ZW1JbmRleCkgPT4gdGhpcy5fc2V0SXRlbUFjdGl2ZShpdGVtLCBpdGVtSW5kZXggPT09IGluZGV4KSlcbiAgICB0aGlzLmFjdGl2ZUluZGV4ID0gaW5kZXhcbiAgICB0aGlzLl9zeW5jQWN0aXZlRGVzY2VuZGFudCgpXG5cbiAgICBjb25zdCBpdGVtID0gdGhpcy5pdGVtc1tpbmRleF1cbiAgICBpZiAoaXRlbSkgaXRlbS5zY3JvbGxJbnRvVmlldyh7IGJsb2NrOiBcIm5lYXJlc3RcIiB9KVxuICB9LFxuXG4gIF9zZXRJdGVtQWN0aXZlKGl0ZW0sIGFjdGl2ZSkge1xuICAgIGl0ZW0uZGF0YXNldC5hY3RpdmUgPSBhY3RpdmUgPyBcInRydWVcIiA6IFwiZmFsc2VcIlxuICAgIGl0ZW0uc2V0QXR0cmlidXRlKFwiYXJpYS1zZWxlY3RlZFwiLCBhY3RpdmUgPyBcInRydWVcIiA6IFwiZmFsc2VcIilcbiAgfSxcblxuICBfc3luY0FjdGl2ZURlc2NlbmRhbnQoKSB7XG4gICAgaWYgKCF0aGlzLmlucHV0KSByZXR1cm5cbiAgICBjb25zdCBpdGVtID0gdGhpcy5pdGVtc1t0aGlzLmFjdGl2ZUluZGV4XVxuICAgIGlmIChpdGVtICYmICFpdGVtLmhpZGRlbikge1xuICAgICAgdGhpcy5pbnB1dC5zZXRBdHRyaWJ1dGUoXCJhcmlhLWFjdGl2ZWRlc2NlbmRhbnRcIiwgaXRlbS5pZClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5pbnB1dC5yZW1vdmVBdHRyaWJ1dGUoXCJhcmlhLWFjdGl2ZWRlc2NlbmRhbnRcIilcbiAgICB9XG4gIH0sXG5cbiAgX3VuYmluZCgpIHtcbiAgICBQYWxldHRlUmVnaXN0cnkudW5yZWdpc3Rlcih0aGlzKVxuICAgIGlmICh0aGlzLl9vbktleSkgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCB0aGlzLl9vbktleSlcbiAgICBpZiAodGhpcy5pbnB1dCAmJiB0aGlzLl9vbklucHV0KSB0aGlzLmlucHV0LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCB0aGlzLl9vbklucHV0KVxuICAgIGlmICh0aGlzLl9vbkl0ZW1Qb2ludGVyTW92ZSkgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKFwicG9pbnRlcm1vdmVcIiwgdGhpcy5fb25JdGVtUG9pbnRlck1vdmUpXG4gICAgaWYgKHRoaXMuX29uSXRlbUNsaWNrKSB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLl9vbkl0ZW1DbGljaylcbiAgICBpZiAodGhpcy5iYWNrZHJvcCAmJiB0aGlzLl9vbkJhY2tkcm9wKSB7XG4gICAgICB0aGlzLmJhY2tkcm9wLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLl9vbkJhY2tkcm9wKVxuICAgIH1cbiAgICBkZWxldGUgdGhpcy5lbC5kYXRhc2V0LnJlYWR5XG4gICAgdGhpcy5iYWNrZHJvcCA9IG51bGxcbiAgICB0aGlzLmlucHV0ID0gbnVsbFxuICAgIHRoaXMubGlzdCA9IG51bGxcbiAgICB0aGlzLmVtcHR5ID0gbnVsbFxuICAgIHRoaXMuaXRlbXMgPSBbXVxuICAgIHRoaXMuYWN0aXZlSW5kZXggPSAtMVxuICAgIHRoaXMuX29uS2V5ID0gbnVsbFxuICAgIHRoaXMuX29uSW5wdXQgPSBudWxsXG4gICAgdGhpcy5fb25JdGVtUG9pbnRlck1vdmUgPSBudWxsXG4gICAgdGhpcy5fb25JdGVtQ2xpY2sgPSBudWxsXG4gICAgdGhpcy5fb25CYWNrZHJvcCA9IG51bGxcbiAgICB0aGlzLl9vcGVuID0gbnVsbFxuICAgIHRoaXMuX2Nsb3NlID0gbnVsbFxuICAgIHRoaXMuX3RvZ2dsZSA9IG51bGxcbiAgfVxufVxuXG5leHBvcnQgeyBFeG9Db21tYW5kUGFsZXR0ZSB9XG4iLCAiLyoqXG4gKiBFeG9TaWRlYmFyIGhvb2sgXHUyMDE0IG1hbmFnZXMgY29sbGFwc2libGUgc2lkZWJhciBzdGF0ZS5cbiAqXG4gKiBSZXN0b3JlcyBjb2xsYXBzZWQvZXhwYW5kZWQgZnJvbSBsb2NhbFN0b3JhZ2Ugb24gZGVza3RvcC5cbiAqIE1vYmlsZSBzdGFydHMgY2xvc2VkLiBTZXRzIGRhdGEtc2lkZWJhci1yZWFkeSBvbiA8aHRtbD4gYWZ0ZXIgaW5pdC5cbiAqL1xuY29uc3QgRXhvU2lkZWJhciA9IHtcbiAgbW91bnRlZCgpIHtcbiAgICB0aGlzLnRvZ2dsZSA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwic2lkZWJhci10b2dnbGVcIl0nKVxuICAgIGlmICghdGhpcy50b2dnbGUpIHJldHVyblxuXG4gICAgdGhpcy5fYXBwbHlTdGF0ZSgpXG5cbiAgICAvLyBFbmFibGUgQ1NTIHRyYW5zaXRpb25zIGFmdGVyIGluaXRpYWwgc3RhdGUgKHByZXZlbnRzIEZPVUMpXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RhdGEtc2lkZWJhci1yZWFkeScsICcnKVxuICAgIH0pXG5cbiAgICAvLyBQZXJzaXN0IG9uIHRvZ2dsZVxuICAgIHRoaXMuX29uQ2hhbmdlID0gKCkgPT4ge1xuICAgICAgaWYgKHdpbmRvdy5tYXRjaE1lZGlhKCcobWluLXdpZHRoOiA3NjhweCknKS5tYXRjaGVzKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdleG8tc2lkZWJhci1jb2xsYXBzZWQnLCB0aGlzLnRvZ2dsZS5jaGVja2VkID8gJ2ZhbHNlJyA6ICd0cnVlJylcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy50b2dnbGUuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgdGhpcy5fb25DaGFuZ2UpXG4gIH0sXG5cbiAgZGVzdHJveWVkKCkge1xuICAgIGlmICh0aGlzLnRvZ2dsZSAmJiB0aGlzLl9vbkNoYW5nZSkge1xuICAgICAgdGhpcy50b2dnbGUucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgdGhpcy5fb25DaGFuZ2UpXG4gICAgfVxuICB9LFxuXG4gIHVwZGF0ZWQoKSB7XG4gICAgdGhpcy5fYXBwbHlTdGF0ZSgpXG4gIH0sXG5cbiAgX2FwcGx5U3RhdGUoKSB7XG4gICAgaWYgKCF0aGlzLnRvZ2dsZSkgcmV0dXJuXG4gICAgY29uc3QgaXNEZXNrdG9wID0gd2luZG93Lm1hdGNoTWVkaWEoJyhtaW4td2lkdGg6IDc2OHB4KScpLm1hdGNoZXNcbiAgICBpZiAoaXNEZXNrdG9wKSB7XG4gICAgICBjb25zdCBjb2xsYXBzZWQgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnZXhvLXNpZGViYXItY29sbGFwc2VkJykgPT09ICd0cnVlJ1xuICAgICAgdGhpcy50b2dnbGUuY2hlY2tlZCA9ICFjb2xsYXBzZWRcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy50b2dnbGUuY2hlY2tlZCA9IGZhbHNlXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCB7IEV4b1NpZGViYXIgfVxuIiwgImNvbnN0IEV4b1RoZW1lVG9nZ2xlID0ge1xuICBtb3VudGVkKCkge1xuICAgIHRoaXMuX2FwcGx5KHRoaXMuX2N1cnJlbnQoKSlcblxuICAgIHRoaXMuX2hhbmRsZXJzID0gW11cbiAgICB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLXRoZW1lLXZhbHVlXScpLmZvckVhY2goYnRuID0+IHtcbiAgICAgIGNvbnN0IGhhbmRsZXIgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gYnRuLmdldEF0dHJpYnV0ZSgnZGF0YS10aGVtZS12YWx1ZScpXG4gICAgICAgIHRoaXMuX2FwcGx5KHZhbHVlKVxuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnZXhvLXRoZW1lJywgdmFsdWUpXG4gICAgICB9XG4gICAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVyKVxuICAgICAgdGhpcy5faGFuZGxlcnMucHVzaCh7IGJ0biwgaGFuZGxlciB9KVxuICAgIH0pXG4gIH0sXG5cbiAgZGVzdHJveWVkKCkge1xuICAgIHRoaXMuX2hhbmRsZXJzPy5mb3JFYWNoKCh7IGJ0biwgaGFuZGxlciB9KSA9PlxuICAgICAgYnRuLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlcilcbiAgICApXG4gIH0sXG5cbiAgX2N1cnJlbnQoKSB7XG4gICAgcmV0dXJuIGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdleG8tdGhlbWUnKSB8fCAnc3lzdGVtJ1xuICB9LFxuXG4gIF9hcHBseSh0aGVtZSkge1xuICAgIGNvbnN0IHJvb3QgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnRcbiAgICAvLyBVcGRhdGUgYWN0aXZlIHN0YXRlIG9uIGJ1dHRvbnNcbiAgICB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLXRoZW1lLXZhbHVlXScpLmZvckVhY2goYnRuID0+IHtcbiAgICAgIGJ0bi50b2dnbGVBdHRyaWJ1dGUoJ2RhdGEtYWN0aXZlJywgYnRuLmdldEF0dHJpYnV0ZSgnZGF0YS10aGVtZS12YWx1ZScpID09PSB0aGVtZSlcbiAgICB9KVxuXG4gICAgaWYgKHRoZW1lID09PSAnc3lzdGVtJykge1xuICAgICAgcm9vdC5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtdGhlbWUnKVxuICAgIH0gZWxzZSB7XG4gICAgICByb290LnNldEF0dHJpYnV0ZSgnZGF0YS10aGVtZScsIHRoZW1lKVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgeyBFeG9UaGVtZVRvZ2dsZSB9XG4iLCAiY29uc3QgRXhvUG9wb3ZlciA9IHtcbiAgbW91bnRlZCgpIHsgdGhpcy5fYmluZCgpIH0sXG4gIHVwZGF0ZWQoKSB7IHRoaXMuX2JpbmQoKSB9LFxuICBkZXN0cm95ZWQoKSB7IHRoaXMuX3VuYmluZCgpIH0sXG4gIF9iaW5kKCkge1xuICAgIHRoaXMuX3VuYmluZCgpXG4gICAgdGhpcy5fdHJpZ2dlciA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwicG9wb3Zlci10cmlnZ2VyXCJdJylcbiAgICBjb25zdCBpZCA9XG4gICAgICB0aGlzLl90cmlnZ2VyPy5kYXRhc2V0LnBvcG92ZXJUYXJnZXQgfHxcbiAgICAgIHRoaXMuX3RyaWdnZXI/LmdldEF0dHJpYnV0ZSgncG9wb3ZlcnRhcmdldCcpXG4gICAgdGhpcy5fcG9wb3ZlciA9IGlkID8gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpIDogbnVsbFxuICAgIGlmICghdGhpcy5fcG9wb3ZlciB8fCAhdGhpcy5fdHJpZ2dlcikgcmV0dXJuXG5cbiAgICB0aGlzLl9jb250cm9sID0gdGhpcy5fZmluZENvbnRyb2woKVxuICAgIHRoaXMuX3ByZXBhcmVDb250cm9sKClcbiAgICB0aGlzLmVsLnNldEF0dHJpYnV0ZSgnZGF0YS1yZWFkeScsICcnKVxuXG4gICAgdGhpcy5fc3luY0V4cGFuZGVkID0gKCkgPT4ge1xuICAgICAgY29uc3Qgb3BlbiA9IHRoaXMuX3BvcG92ZXIubWF0Y2hlcygnOnBvcG92ZXItb3BlbicpXG4gICAgICB0aGlzLl9jb250cm9sPy5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCBTdHJpbmcob3BlbikpXG4gICAgICB0aGlzLl90cmlnZ2VyLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsIFN0cmluZyhvcGVuKSlcbiAgICB9XG4gICAgdGhpcy5fc3luY0V4cGFuZGVkKClcblxuICAgIHRoaXMuX29uQ2xpY2sgPSAoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgIHRoaXMuX3RvZ2dsZVBvcG92ZXIoKVxuICAgIH1cblxuICAgIHRoaXMuX29uS2V5ZG93biA9IChldmVudCkgPT4ge1xuICAgICAgaWYgKGV2ZW50LmtleSAhPT0gJ0VudGVyJyAmJiBldmVudC5rZXkgIT09ICcgJykgcmV0dXJuXG4gICAgICBpZiAoZXZlbnQudGFyZ2V0ICE9PSB0aGlzLl9jb250cm9sICYmICF0aGlzLl9jb250cm9sPy5jb250YWlucz8uKGV2ZW50LnRhcmdldCkpIHJldHVyblxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgdGhpcy5fdG9nZ2xlUG9wb3ZlcigpXG4gICAgfVxuXG4gICAgdGhpcy5fb25Ub2dnbGUgPSAoKSA9PiB0aGlzLl9zeW5jRXhwYW5kZWQoKVxuICAgIHRoaXMuX3RyaWdnZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9vbkNsaWNrKVxuICAgIHRoaXMuX3RyaWdnZXIuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX29uS2V5ZG93bilcbiAgICB0aGlzLl9wb3BvdmVyLmFkZEV2ZW50TGlzdGVuZXIoJ3RvZ2dsZScsIHRoaXMuX29uVG9nZ2xlKVxuICB9LFxuXG4gIF9maW5kQ29udHJvbCgpIHtcbiAgICBjb25zdCBzZWxlY3RvciA9IFtcbiAgICAgICdidXR0b24nLFxuICAgICAgJ2FbaHJlZl0nLFxuICAgICAgJ2lucHV0Om5vdChbdHlwZT1cImhpZGRlblwiXSknLFxuICAgICAgJ3NlbGVjdCcsXG4gICAgICAndGV4dGFyZWEnLFxuICAgICAgJ1tyb2xlPVwiYnV0dG9uXCJdJyxcbiAgICAgICdbdGFiaW5kZXhdOm5vdChbdGFiaW5kZXg9XCItMVwiXSknXG4gICAgXS5qb2luKCcsJylcblxuICAgIHJldHVybiB0aGlzLl90cmlnZ2VyLm1hdGNoZXMoc2VsZWN0b3IpXG4gICAgICA/IHRoaXMuX3RyaWdnZXJcbiAgICAgIDogdGhpcy5fdHJpZ2dlci5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKSB8fCB0aGlzLl90cmlnZ2VyXG4gIH0sXG5cbiAgX3ByZXBhcmVDb250cm9sKCkge1xuICAgIGNvbnN0IGhhc1BvcHVwID0gdGhpcy5fdHJpZ2dlci5kYXRhc2V0LnBvcG92ZXJIYXNwb3B1cCB8fCAndHJ1ZSdcblxuICAgIHRoaXMuX2NvbnRyb2wuc2V0QXR0cmlidXRlKCdhcmlhLWhhc3BvcHVwJywgaGFzUG9wdXApXG4gICAgdGhpcy5fY29udHJvbC5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCAnZmFsc2UnKVxuXG4gICAgaWYgKHRoaXMuX2NvbnRyb2wgPT09IHRoaXMuX3RyaWdnZXIpIHtcbiAgICAgIHRoaXMuX2NvbnRyb2wuc2V0QXR0cmlidXRlKCdyb2xlJywgJ2J1dHRvbicpXG4gICAgICB0aGlzLl9jb250cm9sLnNldEF0dHJpYnV0ZSgndGFiaW5kZXgnLCAnMCcpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2NvbnRyb2wgaW5zdGFuY2VvZiBIVE1MQnV0dG9uRWxlbWVudCAmJiAhdGhpcy5fY29udHJvbC5nZXRBdHRyaWJ1dGUoJ3R5cGUnKSkge1xuICAgICAgdGhpcy5fY29udHJvbC5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAnYnV0dG9uJylcbiAgICB9XG4gIH0sXG5cbiAgX3RvZ2dsZVBvcG92ZXIoKSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICh0aGlzLl9wb3BvdmVyLm1hdGNoZXMoJzpwb3BvdmVyLW9wZW4nKSkge1xuICAgICAgICB0aGlzLl9wb3BvdmVyLmhpZGVQb3BvdmVyKClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3BvcG92ZXIuc2hvd1BvcG92ZXIoKVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS53YXJuKCdFeG9Qb3BvdmVyOiB0b2dnbGUgZmFpbGVkJywgZXJyKVxuICAgIH1cbiAgfSxcblxuICBfdW5iaW5kKCkge1xuICAgIGlmICh0aGlzLl9wb3BvdmVyICYmIHRoaXMuX29uVG9nZ2xlKSB7XG4gICAgICB0aGlzLl9wb3BvdmVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvZ2dsZScsIHRoaXMuX29uVG9nZ2xlKVxuICAgIH1cbiAgICBpZiAodGhpcy5fdHJpZ2dlcikge1xuICAgICAgaWYgKHRoaXMuX29uQ2xpY2spIHRoaXMuX3RyaWdnZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9vbkNsaWNrKVxuICAgICAgaWYgKHRoaXMuX29uS2V5ZG93bikgdGhpcy5fdHJpZ2dlci5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5fb25LZXlkb3duKVxuICAgIH1cbiAgICBpZiAodGhpcy5lbCkgdGhpcy5lbC5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtcmVhZHknKVxuICAgIHRoaXMuX3RyaWdnZXIgPSBudWxsXG4gICAgdGhpcy5fY29udHJvbCA9IG51bGxcbiAgICB0aGlzLl9wb3BvdmVyID0gbnVsbFxuICAgIHRoaXMuX3N5bmNFeHBhbmRlZCA9IG51bGxcbiAgICB0aGlzLl9vbkNsaWNrID0gbnVsbFxuICAgIHRoaXMuX29uS2V5ZG93biA9IG51bGxcbiAgICB0aGlzLl9vblRvZ2dsZSA9IG51bGxcbiAgfVxufVxuXG5leHBvcnQgeyBFeG9Qb3BvdmVyIH1cbiIsICJjb25zdCBFeG9Ecm9wZG93bk1lbnUgPSB7XG4gIG1vdW50ZWQoKSB7IHRoaXMuX2JpbmQoKSB9LFxuICB1cGRhdGVkKCkgeyB0aGlzLl9iaW5kKCkgfSxcbiAgZGVzdHJveWVkKCkgeyB0aGlzLl91bmJpbmQoKSB9LFxuXG4gIF9iaW5kKCkge1xuICAgIHRoaXMuX3VuYmluZCgpXG4gICAgdGhpcy5fbWVudSA9IHRoaXMuZWwubWF0Y2hlcygnW3JvbGU9XCJtZW51XCJdJykgPyB0aGlzLmVsIDogdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbcm9sZT1cIm1lbnVcIl0nKVxuICAgIGlmICghdGhpcy5fbWVudSkgcmV0dXJuXG5cbiAgICB0aGlzLl9wb3BvdmVyID0gdGhpcy5fbWVudS5jbG9zZXN0KCdbcG9wb3Zlcl0nKVxuICAgIHRoaXMuX3RyaWdnZXIgPSB0aGlzLl9maW5kVHJpZ2dlcigpXG4gICAgdGhpcy5fYWxsSXRlbXMoKS5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICBpdGVtLnNldEF0dHJpYnV0ZSgndGFiaW5kZXgnLCAnLTEnKVxuICAgICAgaWYgKGl0ZW0udGFnTmFtZSA9PT0gJ0JVVFRPTicgJiYgIWl0ZW0uZ2V0QXR0cmlidXRlKCd0eXBlJykpIHtcbiAgICAgICAgaXRlbS5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAnYnV0dG9uJylcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLl9pc0Rpc2FibGVkKGl0ZW0pKSB7XG4gICAgICAgIGl0ZW0uc2V0QXR0cmlidXRlKCdhcmlhLWRpc2FibGVkJywgJ3RydWUnKVxuICAgICAgICBpdGVtLmRhdGFzZXQuZGlzYWJsZWQgPSAndHJ1ZSdcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgdGhpcy5fb25Ub2dnbGUgPSAoKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuX3BvcG92ZXI/Lm1hdGNoZXMoJzpwb3BvdmVyLW9wZW4nKSkgcmV0dXJuXG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4gdGhpcy5faXRlbXMoKVswXT8uZm9jdXMoKSlcbiAgICB9XG4gICAgdGhpcy5fcG9wb3Zlcj8uYWRkRXZlbnRMaXN0ZW5lcigndG9nZ2xlJywgdGhpcy5fb25Ub2dnbGUpXG5cbiAgICB0aGlzLl9vbkNsaWNrID0gKGUpID0+IHtcbiAgICAgIGNvbnN0IGl0ZW0gPSBlLnRhcmdldC5jbG9zZXN0KCdbcm9sZT1cIm1lbnVpdGVtXCJdJylcbiAgICAgIGlmICghaXRlbSB8fCAhdGhpcy5fbWVudS5jb250YWlucyhpdGVtKSkgcmV0dXJuXG4gICAgICBpZiAodGhpcy5faXNEaXNhYmxlZChpdGVtKSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLl9tZW51LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fb25DbGljaylcblxuICAgIHRoaXMuX29uS2V5ZG93biA9IChlKSA9PiB7XG4gICAgICBpZiAoZS5rZXkgPT09ICdFc2NhcGUnKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICB0aGlzLl9wb3BvdmVyPy5oaWRlUG9wb3Zlcj8uKClcbiAgICAgICAgdGhpcy5fdHJpZ2dlcj8uZm9jdXM/LigpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBjb25zdCBpdGVtcyA9IHRoaXMuX2l0ZW1zKClcbiAgICAgIGlmICghaXRlbXMubGVuZ3RoKSByZXR1cm5cbiAgICAgIGNvbnN0IGlkeCA9IGl0ZW1zLmluZGV4T2YoZG9jdW1lbnQuYWN0aXZlRWxlbWVudClcbiAgICAgIGxldCBuZXh0ID0gLTFcblxuICAgICAgc3dpdGNoIChlLmtleSkge1xuICAgICAgICBjYXNlICdBcnJvd0Rvd24nOiBuZXh0ID0gaWR4IDwgaXRlbXMubGVuZ3RoIC0gMSA/IGlkeCArIDEgOiAwOyBicmVha1xuICAgICAgICBjYXNlICdBcnJvd1VwJzogbmV4dCA9IGlkeCA+IDAgPyBpZHggLSAxIDogaXRlbXMubGVuZ3RoIC0gMTsgYnJlYWtcbiAgICAgICAgY2FzZSAnSG9tZSc6IG5leHQgPSAwOyBicmVha1xuICAgICAgICBjYXNlICdFbmQnOiBuZXh0ID0gaXRlbXMubGVuZ3RoIC0gMTsgYnJlYWtcbiAgICAgICAgZGVmYXVsdDogcmV0dXJuXG4gICAgICB9XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIGl0ZW1zW25leHRdPy5mb2N1cygpXG4gICAgfVxuICAgIHRoaXMuX21lbnUuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX29uS2V5ZG93bilcbiAgfSxcblxuICBfaXRlbXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2FsbEl0ZW1zKCkuZmlsdGVyKChpdGVtKSA9PiAhdGhpcy5faXNEaXNhYmxlZChpdGVtKSlcbiAgfSxcblxuICBfYWxsSXRlbXMoKSB7XG4gICAgcmV0dXJuIFsuLi50aGlzLl9tZW51LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tyb2xlPVwibWVudWl0ZW1cIl0nKV1cbiAgfSxcblxuICBfaXNEaXNhYmxlZChpdGVtKSB7XG4gICAgcmV0dXJuIGl0ZW0uZGlzYWJsZWQgfHxcbiAgICAgIGl0ZW0uZGF0YXNldC5kaXNhYmxlZCA9PT0gJ3RydWUnIHx8XG4gICAgICBpdGVtLmhhc0F0dHJpYnV0ZSgnZGF0YS1kaXNhYmxlZCcpIHx8XG4gICAgICBpdGVtLmdldEF0dHJpYnV0ZSgnYXJpYS1kaXNhYmxlZCcpID09PSAndHJ1ZSdcbiAgfSxcblxuICBfZmluZFRyaWdnZXIoKSB7XG4gICAgaWYgKCF0aGlzLl9wb3BvdmVyPy5pZCkgcmV0dXJuIG51bGxcbiAgICBjb25zdCB0cmlnZ2VyID0gWy4uLmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLXBvcG92ZXItdGFyZ2V0XScpXVxuICAgICAgLmZpbmQoKG5vZGUpID0+IG5vZGUuZGF0YXNldC5wb3BvdmVyVGFyZ2V0ID09PSB0aGlzLl9wb3BvdmVyLmlkKVxuICAgIHJldHVybiB0cmlnZ2VyPy5tYXRjaGVzKCdidXR0b24sIGFbaHJlZl0sIGlucHV0LCBzZWxlY3QsIHRleHRhcmVhLCBbcm9sZT1cImJ1dHRvblwiXSwgW3RhYmluZGV4XScpXG4gICAgICA/IHRyaWdnZXJcbiAgICAgIDogdHJpZ2dlcj8ucXVlcnlTZWxlY3RvcignYnV0dG9uLCBhW2hyZWZdLCBpbnB1dCwgc2VsZWN0LCB0ZXh0YXJlYSwgW3JvbGU9XCJidXR0b25cIl0sIFt0YWJpbmRleF0nKSB8fCB0cmlnZ2VyXG4gIH0sXG5cbiAgX3VuYmluZCgpIHtcbiAgICBpZiAodGhpcy5fcG9wb3ZlciAmJiB0aGlzLl9vblRvZ2dsZSkge1xuICAgICAgdGhpcy5fcG9wb3Zlci5yZW1vdmVFdmVudExpc3RlbmVyKCd0b2dnbGUnLCB0aGlzLl9vblRvZ2dsZSlcbiAgICB9XG4gICAgaWYgKHRoaXMuX21lbnUgJiYgdGhpcy5fb25DbGljaykge1xuICAgICAgdGhpcy5fbWVudS5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX29uQ2xpY2spXG4gICAgfVxuICAgIGlmICh0aGlzLl9tZW51ICYmIHRoaXMuX29uS2V5ZG93bikge1xuICAgICAgdGhpcy5fbWVudS5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5fb25LZXlkb3duKVxuICAgIH1cbiAgICB0aGlzLl9wb3BvdmVyID0gbnVsbFxuICAgIHRoaXMuX3RyaWdnZXIgPSBudWxsXG4gICAgdGhpcy5fbWVudSA9IG51bGxcbiAgICB0aGlzLl9vblRvZ2dsZSA9IG51bGxcbiAgICB0aGlzLl9vbkNsaWNrID0gbnVsbFxuICAgIHRoaXMuX29uS2V5ZG93biA9IG51bGxcbiAgfVxufVxuXG5leHBvcnQgeyBFeG9Ecm9wZG93bk1lbnUgfVxuIiwgImNvbnN0IEV4b1NlbGVjdCA9IHtcbiAgbW91bnRlZCgpIHsgdGhpcy5fYmluZCgpIH0sXG4gIHVwZGF0ZWQoKSB7IHRoaXMuX2JpbmQoKSB9LFxuICBkZXN0cm95ZWQoKSB7IHRoaXMuX3VuYmluZCgpIH0sXG5cbiAgX2JpbmQoKSB7XG4gICAgdGhpcy5fdW5iaW5kKClcblxuICAgIHRoaXMuX3RyaWdnZXIgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4by1zZWxlY3Q9XCJ0cmlnZ2VyXCJdJylcbiAgICBjb25zdCBwb3BvdmVySWQgPSB0aGlzLl90cmlnZ2VyPy5nZXRBdHRyaWJ1dGUoJ3BvcG92ZXJ0YXJnZXQnKVxuICAgIHRoaXMuX3BvcG92ZXIgPSBwb3BvdmVySWQgPyBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChwb3BvdmVySWQpIDogbnVsbFxuICAgIHRoaXMuX2xpc3Rib3ggPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tyb2xlPVwibGlzdGJveFwiXScpXG4gICAgdGhpcy5faGlkZGVuID0gdGhpcy5lbC5jbG9zZXN0KCdbZGF0YS1leG89XCJmaWVsZFwiXScpPy5xdWVyeVNlbGVjdG9yKCdpbnB1dFt0eXBlPVwiaGlkZGVuXCJdJylcblxuICAgIGlmICghdGhpcy5fcG9wb3ZlciB8fCAhdGhpcy5fbGlzdGJveCkgcmV0dXJuXG5cbiAgICAvLyBUb2dnbGUgYXJpYS1leHBhbmRlZCBvbiBwb3BvdmVyIG9wZW4vY2xvc2VcbiAgICB0aGlzLl9vblRvZ2dsZSA9ICgpID0+IHtcbiAgICAgIGNvbnN0IG9wZW4gPSB0aGlzLl9wb3BvdmVyLm1hdGNoZXMoJzpwb3BvdmVyLW9wZW4nKVxuICAgICAgdGhpcy5fdHJpZ2dlci5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCBTdHJpbmcob3BlbikpXG4gICAgICBpZiAob3Blbikge1xuICAgICAgICAvLyBGb2N1cyBzZWxlY3RlZCBvcHRpb24gb25seSBcdTIwMTQgZG9uJ3QgcHJlLWhpZ2hsaWdodCBmaXJzdCBvcHRpb25cbiAgICAgICAgY29uc3Qgc2VsZWN0ZWQgPSB0aGlzLl9saXN0Ym94LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLXNlbGVjdGVkXScpXG4gICAgICAgIGlmIChzZWxlY3RlZCkgc2VsZWN0ZWQuZm9jdXMoKVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLl90cmlnZ2VyLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsIFN0cmluZyh0aGlzLl9wb3BvdmVyLm1hdGNoZXMoJzpwb3BvdmVyLW9wZW4nKSkpXG4gICAgdGhpcy5fcG9wb3Zlci5hZGRFdmVudExpc3RlbmVyKCd0b2dnbGUnLCB0aGlzLl9vblRvZ2dsZSlcblxuICAgIC8vIENsaWNrIG9uIG9wdGlvblxuICAgIHRoaXMuX29uQ2xpY2sgPSAoZSkgPT4ge1xuICAgICAgY29uc3Qgb3B0ID0gZS50YXJnZXQuY2xvc2VzdCgnW2RhdGEtZXhvPVwic2VsZWN0LW9wdGlvblwiXScpXG4gICAgICBpZiAoIW9wdCB8fCBvcHQuaGFzQXR0cmlidXRlKCdkYXRhLWRpc2FibGVkJykpIHJldHVyblxuICAgICAgdGhpcy5fc2VsZWN0T3B0aW9uKG9wdClcbiAgICB9XG4gICAgdGhpcy5fbGlzdGJveC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX29uQ2xpY2spXG5cbiAgICAvLyBLZXlib2FyZCBuYXZpZ2F0aW9uXG4gICAgdGhpcy5fb25LZXlkb3duID0gKGUpID0+IHtcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSBbLi4udGhpcy5fbGlzdGJveC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1leG89XCJzZWxlY3Qtb3B0aW9uXCJdOm5vdChbZGF0YS1kaXNhYmxlZF0pJyldXG4gICAgICBpZiAoIW9wdGlvbnMubGVuZ3RoKSByZXR1cm5cbiAgICAgIGNvbnN0IGlkeCA9IG9wdGlvbnMuaW5kZXhPZihkb2N1bWVudC5hY3RpdmVFbGVtZW50KVxuICAgICAgbGV0IG5leHQgPSAtMVxuXG4gICAgICBzd2l0Y2ggKGUua2V5KSB7XG4gICAgICAgIGNhc2UgJ0Fycm93RG93bic6XG4gICAgICAgICAgbmV4dCA9IGlkeCA8IG9wdGlvbnMubGVuZ3RoIC0gMSA/IGlkeCArIDEgOiAwXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAnQXJyb3dVcCc6XG4gICAgICAgICAgbmV4dCA9IGlkeCA+IDAgPyBpZHggLSAxIDogb3B0aW9ucy5sZW5ndGggLSAxXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAnSG9tZSc6XG4gICAgICAgICAgbmV4dCA9IDBcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlICdFbmQnOlxuICAgICAgICAgIG5leHQgPSBvcHRpb25zLmxlbmd0aCAtIDFcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlICdFbnRlcic6XG4gICAgICAgIGNhc2UgJyAnOlxuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgIGlmIChpZHggPj0gMCkgdGhpcy5fc2VsZWN0T3B0aW9uKG9wdGlvbnNbaWR4XSlcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgY2FzZSAnRXNjYXBlJzpcbiAgICAgICAgICB0aGlzLl9wb3BvdmVyLmhpZGVQb3BvdmVyKClcbiAgICAgICAgICB0aGlzLl90cmlnZ2VyLmZvY3VzKClcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAvLyBUeXBlLWFoZWFkOiBqdW1wIHRvIG9wdGlvbiBzdGFydGluZyB3aXRoIHR5cGVkIGNoYXJhY3RlclxuICAgICAgICAgIHRoaXMuX3R5cGVBaGVhZChlLmtleSwgb3B0aW9ucylcbiAgICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBpZiAobmV4dCA+PSAwKSBvcHRpb25zW25leHRdLmZvY3VzKClcbiAgICB9XG4gICAgdGhpcy5fbGlzdGJveC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5fb25LZXlkb3duKVxuICB9LFxuXG4gIF9zZWxlY3RPcHRpb24ob3B0KSB7XG4gICAgY29uc3QgdmFsdWUgPSBvcHQuZ2V0QXR0cmlidXRlKCdkYXRhLXZhbHVlJylcbiAgICBjb25zdCB0ZXh0ID0gb3B0LnRleHRDb250ZW50LnRyaW0oKVxuXG4gICAgLy8gVXBkYXRlIGhpZGRlbiBpbnB1dFxuICAgIGlmICh0aGlzLl9oaWRkZW4pIHtcbiAgICAgIHRoaXMuX2hpZGRlbi52YWx1ZSA9IHZhbHVlXG4gICAgICB0aGlzLl9oaWRkZW4uZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2lucHV0JywgeyBidWJibGVzOiB0cnVlIH0pKVxuICAgIH1cblxuICAgIC8vIFVwZGF0ZSBhcmlhLXNlbGVjdGVkIGFuZCBkYXRhLXNlbGVjdGVkIG9uIGFsbCBvcHRpb25zXG4gICAgdGhpcy5fbGlzdGJveC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1leG89XCJzZWxlY3Qtb3B0aW9uXCJdJykuZm9yRWFjaCgobykgPT4ge1xuICAgICAgY29uc3QgaXNTZWxlY3RlZCA9IG8uZ2V0QXR0cmlidXRlKCdkYXRhLXZhbHVlJykgPT09IHZhbHVlXG4gICAgICBvLnNldEF0dHJpYnV0ZSgnYXJpYS1zZWxlY3RlZCcsIFN0cmluZyhpc1NlbGVjdGVkKSlcbiAgICAgIGlmIChpc1NlbGVjdGVkKSB7XG4gICAgICAgIG8uc2V0QXR0cmlidXRlKCdkYXRhLXNlbGVjdGVkJywgJycpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvLnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS1zZWxlY3RlZCcpXG4gICAgICB9XG4gICAgfSlcblxuICAgIC8vIFVwZGF0ZSB0cmlnZ2VyIGRpc3BsYXkgdGV4dFxuICAgIGNvbnN0IHZhbHVlRWwgPSB0aGlzLl90cmlnZ2VyLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cInNlbGVjdC12YWx1ZVwiXScpXG4gICAgaWYgKHZhbHVlRWwpIHtcbiAgICAgIHZhbHVlRWwudGV4dENvbnRlbnQgPSB0ZXh0XG4gICAgICB2YWx1ZUVsLnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS1wbGFjZWhvbGRlcicpXG4gICAgfVxuXG4gICAgLy8gQ2xvc2UgcG9wb3ZlclxuICAgIHRoaXMuX3BvcG92ZXIuaGlkZVBvcG92ZXIoKVxuICAgIHRoaXMuX3RyaWdnZXIuZm9jdXMoKVxuICB9LFxuXG4gIF90eXBlQWhlYWQoY2hhciwgb3B0aW9ucykge1xuICAgIGlmIChjaGFyLmxlbmd0aCAhPT0gMSkgcmV0dXJuXG4gICAgY29uc3QgbG93ZXIgPSBjaGFyLnRvTG93ZXJDYXNlKClcbiAgICBjb25zdCBjdXJyZW50SWR4ID0gb3B0aW9ucy5pbmRleE9mKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpXG4gICAgY29uc3Qgc3RhcnQgPSBjdXJyZW50SWR4ICsgMVxuICAgIGNvbnN0IHJvdGF0ZWQgPSBbLi4ub3B0aW9ucy5zbGljZShzdGFydCksIC4uLm9wdGlvbnMuc2xpY2UoMCwgc3RhcnQpXVxuICAgIGNvbnN0IG1hdGNoID0gcm90YXRlZC5maW5kKG8gPT4gby50ZXh0Q29udGVudC50cmltKCkudG9Mb3dlckNhc2UoKS5zdGFydHNXaXRoKGxvd2VyKSlcbiAgICBpZiAobWF0Y2gpIG1hdGNoLmZvY3VzKClcbiAgfSxcblxuICBfdW5iaW5kKCkge1xuICAgIGlmICh0aGlzLl9wb3BvdmVyICYmIHRoaXMuX29uVG9nZ2xlKSB7XG4gICAgICB0aGlzLl9wb3BvdmVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvZ2dsZScsIHRoaXMuX29uVG9nZ2xlKVxuICAgIH1cbiAgICBpZiAodGhpcy5fbGlzdGJveCAmJiB0aGlzLl9vbkNsaWNrKSB7XG4gICAgICB0aGlzLl9saXN0Ym94LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fb25DbGljaylcbiAgICB9XG4gICAgaWYgKHRoaXMuX2xpc3Rib3ggJiYgdGhpcy5fb25LZXlkb3duKSB7XG4gICAgICB0aGlzLl9saXN0Ym94LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLl9vbktleWRvd24pXG4gICAgfVxuICAgIHRoaXMuX3RyaWdnZXIgPSBudWxsXG4gICAgdGhpcy5fcG9wb3ZlciA9IG51bGxcbiAgICB0aGlzLl9saXN0Ym94ID0gbnVsbFxuICAgIHRoaXMuX2hpZGRlbiA9IG51bGxcbiAgICB0aGlzLl9vblRvZ2dsZSA9IG51bGxcbiAgICB0aGlzLl9vbkNsaWNrID0gbnVsbFxuICAgIHRoaXMuX29uS2V5ZG93biA9IG51bGxcbiAgfVxufVxuXG5leHBvcnQgeyBFeG9TZWxlY3QgfVxuIiwgImNvbnN0IEV4b0NvbWJvYm94ID0ge1xuICBtb3VudGVkKCkgeyB0aGlzLl9iaW5kKCkgfSxcbiAgdXBkYXRlZCgpIHsgdGhpcy5fYmluZCgpIH0sXG4gIGRlc3Ryb3llZCgpIHsgdGhpcy5fdW5iaW5kKCkgfSxcbiAgX2JpbmQoKSB7XG4gICAgdGhpcy5fdW5iaW5kKClcbiAgICBjb25zdCBpc0lucHV0VHJpZ2dlciA9IHRoaXMuZWwuZGF0YXNldC50cmlnZ2VyID09PSAnaW5wdXQnXG4gICAgY29uc3QgZmlsdGVyID0gdGhpcy5lbC5kYXRhc2V0LmZpbHRlciB8fCAnc2VydmVyJ1xuICAgIGNvbnN0IG9uRmlsdGVyID0gdGhpcy5lbC5kYXRhc2V0Lm9uRmlsdGVyXG4gICAgY29uc3QgZGVib3VuY2UgPSBwYXJzZUludCh0aGlzLmVsLmRhdGFzZXQuZGVib3VuY2UgfHwgJzMwMCcsIDEwKVxuXG4gICAgdGhpcy5fc2VhcmNoID0gaXNJbnB1dFRyaWdnZXJcbiAgICAgID8gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG8tY29tYm9ib3g9XCJpbnB1dC10cmlnZ2VyXCJdJylcbiAgICAgIDogdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJjb21ib2JveC1zZWFyY2hcIl0nKVxuXG4gICAgY29uc3QgdHJpZ2dlckJ0biA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvLWNvbWJvYm94PVwidHJpZ2dlclwiXScpXG4gICAgY29uc3QgcG9wb3ZlcklkID0gdHJpZ2dlckJ0bj8uZ2V0QXR0cmlidXRlKCdwb3BvdmVydGFyZ2V0JykgfHwgdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJwb3BvdmVyLWNvbnRlbnRcIl0nKT8uaWRcbiAgICB0aGlzLl9wb3BvdmVyID0gcG9wb3ZlcklkID8gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocG9wb3ZlcklkKSA6IG51bGxcbiAgICB0aGlzLl9oaWRkZW4gPSB0aGlzLmVsLmNsb3Nlc3QoJ1tkYXRhLWV4bz1cImZpZWxkXCJdJyk/LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W3R5cGU9XCJoaWRkZW5cIl0nKVxuICAgIHRoaXMuX2xpc3Rib3ggPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tyb2xlPVwibGlzdGJveFwiXScpXG4gICAgdGhpcy5fZW1wdHkgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cImNvbWJvYm94LWVtcHR5XCJdJylcbiAgICB0aGlzLl9jcmVhdGUgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cImNvbWJvYm94LWNyZWF0ZVwiXScpXG5cbiAgICB0aGlzLl9jbGVhciA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwiY29tYm9ib3gtY2xlYXJcIl0nKVxuXG4gICAgaWYgKCF0aGlzLl9wb3BvdmVyKSByZXR1cm5cblxuICAgIGNvbnN0IHN5bmNFeHBhbmRlZCA9ICgpID0+IHtcbiAgICAgIGNvbnN0IG9wZW4gPSB0aGlzLl9wb3BvdmVyLm1hdGNoZXMoJzpwb3BvdmVyLW9wZW4nKVxuICAgICAgaWYgKHRyaWdnZXJCdG4pIHRyaWdnZXJCdG4uc2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJywgU3RyaW5nKG9wZW4pKVxuICAgICAgaWYgKHRoaXMuX3NlYXJjaCkgdGhpcy5fc2VhcmNoLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsIFN0cmluZyhvcGVuKSlcbiAgICB9XG5cbiAgICBjb25zdCBmb2N1c1NlYXJjaCA9ICgpID0+IHtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuX3BvcG92ZXI/Lm1hdGNoZXMoJzpwb3BvdmVyLW9wZW4nKSkgcmV0dXJuXG4gICAgICAgIHRoaXMuX3NlYXJjaD8uZm9jdXMoKVxuXG4gICAgICAgIGlmIChkb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9PSB0aGlzLl9zZWFyY2gpIHtcbiAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMuX3BvcG92ZXI/Lm1hdGNoZXMoJzpwb3BvdmVyLW9wZW4nKSkgdGhpcy5fc2VhcmNoPy5mb2N1cygpXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfSwgMClcbiAgICB9XG5cbiAgICBzeW5jRXhwYW5kZWQoKVxuXG4gICAgLy8gQ2xlYXIgYnV0dG9uXG4gICAgaWYgKHRoaXMuX2NsZWFyKSB7XG4gICAgICB0aGlzLl9vbkNsZWFyID0gKGUpID0+IHtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICBpZiAodGhpcy5faGlkZGVuKSB7XG4gICAgICAgICAgdGhpcy5faGlkZGVuLnZhbHVlID0gJydcbiAgICAgICAgICB0aGlzLl9oaWRkZW4uZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2lucHV0JywgeyBidWJibGVzOiB0cnVlIH0pKVxuICAgICAgICB9XG4gICAgICAgIC8vIFJlc2V0IHRyaWdnZXIgZGlzcGxheVxuICAgICAgICBjb25zdCB2YWxTcGFuID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJjb21ib2JveC12YWx1ZVwiXScpXG4gICAgICAgIGlmICh2YWxTcGFuKSB7XG4gICAgICAgICAgdmFsU3Bhbi50ZXh0Q29udGVudCA9IHRoaXMuX3NlYXJjaD8ucGxhY2Vob2xkZXIgfHwgJydcbiAgICAgICAgICB2YWxTcGFuLnNldEF0dHJpYnV0ZSgnZGF0YS1wbGFjZWhvbGRlcicsICcnKVxuICAgICAgICB9XG4gICAgICAgIC8vIENsZWFyIHZpc3VhbCBzZWxlY3Rpb25cbiAgICAgICAgaWYgKHRoaXMuX2xpc3Rib3gpIHtcbiAgICAgICAgICB0aGlzLl9saXN0Ym94LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWV4bz1cImNvbWJvYm94LW9wdGlvblwiXScpLmZvckVhY2gobyA9PiB7XG4gICAgICAgICAgICBvLnNldEF0dHJpYnV0ZSgnYXJpYS1zZWxlY3RlZCcsICdmYWxzZScpXG4gICAgICAgICAgICBkZWxldGUgby5kYXRhc2V0LnNlbGVjdGVkXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5fY2xlYXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9vbkNsZWFyKVxuICAgIH1cblxuICAgIC8vIFRvZ2dsZSBldmVudCBmb3IgYXJpYS1leHBhbmRlZFxuICAgIHRoaXMuX29uVG9nZ2xlID0gKCkgPT4ge1xuICAgICAgY29uc3Qgb3BlbiA9IHRoaXMuX3BvcG92ZXIubWF0Y2hlcygnOnBvcG92ZXItb3BlbicpXG4gICAgICBzeW5jRXhwYW5kZWQoKVxuICAgICAgaWYgKG9wZW4gJiYgdGhpcy5fc2VhcmNoICYmICFpc0lucHV0VHJpZ2dlcikge1xuICAgICAgICB0aGlzLl9zZWFyY2gudmFsdWUgPSAnJ1xuICAgICAgICBpZiAoZmlsdGVyID09PSAnY2xpZW50JykgdGhpcy5fY2xpZW50RmlsdGVyKCcnKVxuICAgICAgICBmb2N1c1NlYXJjaCgpXG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX3BvcG92ZXIuYWRkRXZlbnRMaXN0ZW5lcigndG9nZ2xlJywgdGhpcy5fb25Ub2dnbGUpXG5cbiAgICAvLyBJbnB1dCB0cmlnZ2VyOiBvcGVuL2Nsb3NlIHZpYSBKU1xuICAgIGlmIChpc0lucHV0VHJpZ2dlciAmJiB0aGlzLl9zZWFyY2gpIHtcbiAgICAgIHRoaXMuX29uRm9jdXMgPSAoKSA9PiB7XG4gICAgICAgIHRyeSB7IHRoaXMuX3BvcG92ZXIuc2hvd1BvcG92ZXIoKSB9IGNhdGNoKF9lcnIpIHt9XG4gICAgICB9XG4gICAgICB0aGlzLl9vbkJsdXIgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBvcG92ZXIgPSB0aGlzLl9wb3BvdmVyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIGlmICghcG9wb3ZlcikgcmV0dXJuXG4gICAgICAgICAgaWYgKCFwb3BvdmVyLmNvbnRhaW5zKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IHRoaXMuX3NlYXJjaCkge1xuICAgICAgICAgICAgdHJ5IHsgcG9wb3Zlci5oaWRlUG9wb3ZlcigpIH0gY2F0Y2goX2Vycikge31cbiAgICAgICAgICB9XG4gICAgICAgIH0sIDIwMClcbiAgICAgIH1cbiAgICAgIHRoaXMuX3NlYXJjaC5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsIHRoaXMuX29uRm9jdXMpXG4gICAgICB0aGlzLl9zZWFyY2guYWRkRXZlbnRMaXN0ZW5lcignYmx1cicsIHRoaXMuX29uQmx1cilcbiAgICB9XG5cbiAgICAvLyBTZWFyY2ggaW5wdXQgaGFuZGxlclxuICAgIGlmICh0aGlzLl9zZWFyY2gpIHtcbiAgICAgIHRoaXMuX29uSW5wdXQgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdGhpcy5fc2VhcmNoLnZhbHVlXG4gICAgICAgIGlmIChmaWx0ZXIgPT09ICdjbGllbnQnKSB7XG4gICAgICAgICAgdGhpcy5fY2xpZW50RmlsdGVyKHF1ZXJ5KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9kZWJvdW5jZVRpbWVyKVxuICAgICAgICAgIHRoaXMuX2RlYm91bmNlVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGlmIChvbkZpbHRlcikgdGhpcy5wdXNoRXZlbnQob25GaWx0ZXIsIHsgcXVlcnkgfSlcbiAgICAgICAgICB9LCBkZWJvdW5jZSlcbiAgICAgICAgfVxuICAgICAgICAvLyBVcGRhdGUgY3JlYXRlIG9wdGlvbiB0ZXh0XG4gICAgICAgIGlmICh0aGlzLl9jcmVhdGUpIHtcbiAgICAgICAgICBjb25zdCBzcGFuID0gdGhpcy5fY3JlYXRlLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cImNvbWJvYm94LWNyZWF0ZS1xdWVyeVwiXScpXG4gICAgICAgICAgaWYgKHNwYW4pIHNwYW4udGV4dENvbnRlbnQgPSBxdWVyeVxuICAgICAgICAgIHRoaXMuX2NyZWF0ZS5oaWRkZW4gPSAhcXVlcnlcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5fc2VhcmNoLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgdGhpcy5fb25JbnB1dClcbiAgICB9XG5cbiAgICAvLyBPcHRpb24gY2xpY2tcbiAgICBpZiAodGhpcy5fbGlzdGJveCkge1xuICAgICAgdGhpcy5fb25DbGljayA9IChlKSA9PiB7XG4gICAgICAgIGNvbnN0IG9wdCA9IGUudGFyZ2V0LmNsb3Nlc3QoJ1tkYXRhLWV4bz1cImNvbWJvYm94LW9wdGlvblwiXTpub3QoW2RhdGEtZGlzYWJsZWRdKScpXG4gICAgICAgIGlmICghb3B0KSByZXR1cm5cbiAgICAgICAgdGhpcy5fc2VsZWN0T3B0aW9uKG9wdClcbiAgICAgIH1cbiAgICAgIHRoaXMuX2xpc3Rib3guYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9vbkNsaWNrKVxuXG4gICAgICAvLyBLZXlib2FyZFxuICAgICAgdGhpcy5fb25LZXlkb3duID0gKGUpID0+IHtcbiAgICAgICAgY29uc3Qgb3B0cyA9IFsuLi50aGlzLl9saXN0Ym94LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWV4bz1cImNvbWJvYm94LW9wdGlvblwiXTpub3QoW2RhdGEtZGlzYWJsZWRdKTpub3QoW2hpZGRlbl0pJyldXG4gICAgICAgIGlmICghb3B0cy5sZW5ndGgpIHJldHVyblxuICAgICAgICBjb25zdCBpZHggPSBvcHRzLmluZGV4T2YoZG9jdW1lbnQuYWN0aXZlRWxlbWVudClcbiAgICAgICAgbGV0IG5leHQgPSAtMVxuICAgICAgICBzd2l0Y2ggKGUua2V5KSB7XG4gICAgICAgICAgY2FzZSAnQXJyb3dEb3duJzogbmV4dCA9IGlkeCA8IG9wdHMubGVuZ3RoIC0gMSA/IGlkeCArIDEgOiAwOyBicmVha1xuICAgICAgICAgIGNhc2UgJ0Fycm93VXAnOiBuZXh0ID0gaWR4ID4gMCA/IGlkeCAtIDEgOiBvcHRzLmxlbmd0aCAtIDE7IGJyZWFrXG4gICAgICAgICAgY2FzZSAnSG9tZSc6IG5leHQgPSAwOyBicmVha1xuICAgICAgICAgIGNhc2UgJ0VuZCc6IG5leHQgPSBvcHRzLmxlbmd0aCAtIDE7IGJyZWFrXG4gICAgICAgICAgY2FzZSAnRW50ZXInOlxuICAgICAgICAgICAgaWYgKGlkeCA+PSAwKSB7IHRoaXMuX3NlbGVjdE9wdGlvbihvcHRzW2lkeF0pOyBlLnByZXZlbnREZWZhdWx0KCkgfVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgY2FzZSAnRXNjYXBlJzpcbiAgICAgICAgICAgIHRyeSB7IHRoaXMuX3BvcG92ZXIuaGlkZVBvcG92ZXIoKSB9IGNhdGNoKF9lcnIpIHt9XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICBkZWZhdWx0OiByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgb3B0c1tuZXh0XT8uZm9jdXMoKVxuICAgICAgfVxuICAgICAgdGhpcy5fcG9wb3Zlci5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5fb25LZXlkb3duKVxuICAgIH1cbiAgfSxcbiAgX2NsaWVudEZpbHRlcihxdWVyeSkge1xuICAgIGlmICghdGhpcy5fbGlzdGJveCkgcmV0dXJuXG4gICAgY29uc3QgcSA9IHF1ZXJ5LnRvTG93ZXJDYXNlKClcbiAgICBsZXQgaGFzVmlzaWJsZSA9IGZhbHNlXG4gICAgdGhpcy5fbGlzdGJveC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1leG89XCJjb21ib2JveC1vcHRpb25cIl0nKS5mb3JFYWNoKG9wdCA9PiB7XG4gICAgICBjb25zdCBtYXRjaCA9ICFxIHx8IG9wdC50ZXh0Q29udGVudC50cmltKCkudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhxKVxuICAgICAgb3B0LmhpZGRlbiA9ICFtYXRjaFxuICAgICAgaWYgKG1hdGNoKSBoYXNWaXNpYmxlID0gdHJ1ZVxuICAgIH0pXG4gICAgaWYgKHRoaXMuX2VtcHR5KSB0aGlzLl9lbXB0eS5oaWRkZW4gPSBoYXNWaXNpYmxlXG4gIH0sXG4gIF9zZWxlY3RPcHRpb24ob3B0KSB7XG4gICAgY29uc3QgdmFsdWUgPSBvcHQuZGF0YXNldC52YWx1ZVxuICAgIGlmICh0aGlzLl9oaWRkZW4pIHtcbiAgICAgIHRoaXMuX2hpZGRlbi52YWx1ZSA9IHZhbHVlXG4gICAgICB0aGlzLl9oaWRkZW4uZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2lucHV0JywgeyBidWJibGVzOiB0cnVlIH0pKVxuICAgIH1cbiAgICAvLyBVcGRhdGUgdmlzdWFsIHN0YXRlXG4gICAgaWYgKHRoaXMuX2xpc3Rib3gpIHtcbiAgICAgIHRoaXMuX2xpc3Rib3gucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZXhvPVwiY29tYm9ib3gtb3B0aW9uXCJdJykuZm9yRWFjaChvID0+IHtcbiAgICAgICAgby5zZXRBdHRyaWJ1dGUoJ2FyaWEtc2VsZWN0ZWQnLCBTdHJpbmcoby5kYXRhc2V0LnZhbHVlID09PSB2YWx1ZSkpXG4gICAgICAgIGlmIChvLmRhdGFzZXQudmFsdWUgPT09IHZhbHVlKSBvLmRhdGFzZXQuc2VsZWN0ZWQgPSAnJ1xuICAgICAgICBlbHNlIGRlbGV0ZSBvLmRhdGFzZXQuc2VsZWN0ZWRcbiAgICAgIH0pXG4gICAgfVxuICAgIC8vIFVwZGF0ZSB0cmlnZ2VyIGRpc3BsYXlcbiAgICBjb25zdCB2YWxTcGFuID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJjb21ib2JveC12YWx1ZVwiXScpXG4gICAgaWYgKHZhbFNwYW4pIHtcbiAgICAgIHZhbFNwYW4udGV4dENvbnRlbnQgPSBvcHQudGV4dENvbnRlbnQudHJpbSgpXG4gICAgICB2YWxTcGFuLnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS1wbGFjZWhvbGRlcicpXG4gICAgfVxuICAgIHRyeSB7IHRoaXMuX3BvcG92ZXI/LmhpZGVQb3BvdmVyKCkgfSBjYXRjaChfZXJyKSB7fVxuICB9LFxuICBfdW5iaW5kKCkge1xuICAgIGNsZWFyVGltZW91dCh0aGlzLl9kZWJvdW5jZVRpbWVyKVxuICAgIHRoaXMuX2RlYm91bmNlVGltZXIgPSBudWxsXG4gICAgaWYgKHRoaXMuX3BvcG92ZXIpIHtcbiAgICAgIGlmICh0aGlzLl9vblRvZ2dsZSkgdGhpcy5fcG9wb3Zlci5yZW1vdmVFdmVudExpc3RlbmVyKCd0b2dnbGUnLCB0aGlzLl9vblRvZ2dsZSlcbiAgICAgIGlmICh0aGlzLl9vbktleWRvd24pIHRoaXMuX3BvcG92ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX29uS2V5ZG93bilcbiAgICB9XG4gICAgaWYgKHRoaXMuX2xpc3Rib3ggJiYgdGhpcy5fb25DbGljaykgdGhpcy5fbGlzdGJveC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX29uQ2xpY2spXG4gICAgaWYgKHRoaXMuX3NlYXJjaCkge1xuICAgICAgaWYgKHRoaXMuX29uSW5wdXQpIHRoaXMuX3NlYXJjaC5yZW1vdmVFdmVudExpc3RlbmVyKCdpbnB1dCcsIHRoaXMuX29uSW5wdXQpXG4gICAgICBpZiAodGhpcy5fb25Gb2N1cykgdGhpcy5fc2VhcmNoLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgdGhpcy5fb25Gb2N1cylcbiAgICAgIGlmICh0aGlzLl9vbkJsdXIpIHRoaXMuX3NlYXJjaC5yZW1vdmVFdmVudExpc3RlbmVyKCdibHVyJywgdGhpcy5fb25CbHVyKVxuICAgIH1cbiAgICBpZiAodGhpcy5fY2xlYXIgJiYgdGhpcy5fb25DbGVhcikgdGhpcy5fY2xlYXIucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9vbkNsZWFyKVxuICAgIHRoaXMuX3BvcG92ZXIgPSBudWxsXG4gICAgdGhpcy5fbGlzdGJveCA9IG51bGxcbiAgICB0aGlzLl9zZWFyY2ggPSBudWxsXG4gICAgdGhpcy5fY2xlYXIgPSBudWxsXG4gICAgdGhpcy5fZW1wdHkgPSBudWxsXG4gICAgdGhpcy5fY3JlYXRlID0gbnVsbFxuICAgIHRoaXMuX2hpZGRlbiA9IG51bGxcbiAgfVxufVxuXG5leHBvcnQgeyBFeG9Db21ib2JveCB9XG4iLCAibGV0IGxhc3RIaWRlVGltZSA9IDBcbmNvbnN0IFNLSVBfREVMQVlfTVMgPSAzMDBcbmNvbnN0IGhhc0FuY2hvclBvcyA9XG4gIHR5cGVvZiBDU1MgIT09ICd1bmRlZmluZWQnICYmIENTUy5zdXBwb3J0cygncG9zaXRpb24tYXJlYScsICd0b3AnKVxuXG5jb25zdCBHQVAgPSA0IC8vIG1hdGNoZXMgdmFyKC0tZXhvLXNwYWNlLTEpXG5cbmNvbnN0IEV4b1Rvb2x0aXAgPSB7XG4gIG1vdW50ZWQoKSB7IHRoaXMuX2JpbmQoKSB9LFxuICB1cGRhdGVkKCkgeyB0aGlzLl9iaW5kKCkgfSxcbiAgZGVzdHJveWVkKCkgeyB0aGlzLl91bmJpbmQoKSB9LFxuXG4gIF9iaW5kKCkge1xuICAgIHRoaXMuX3VuYmluZCgpXG4gICAgY29uc3Qgd3JhcHBlciA9IHRoaXMuZWxcbiAgICBjb25zdCBhbmNob3IgPSB3cmFwcGVyLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cInRvb2x0aXAtYW5jaG9yXCJdJylcbiAgICBjb25zdCBjb250ZW50ID0gd3JhcHBlci5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJ0b29sdGlwLWNvbnRlbnRcIl0nKVxuICAgIGlmICghYW5jaG9yIHx8ICFjb250ZW50KSByZXR1cm5cblxuICAgIHRoaXMuX3dyYXBwZXIgPSB3cmFwcGVyXG4gICAgdGhpcy5fYW5jaG9yID0gYW5jaG9yXG4gICAgdGhpcy5fY29udGVudCA9IGNvbnRlbnRcbiAgICB0aGlzLl90aW1lb3V0ID0gbnVsbFxuICAgIHRoaXMuX2RlY2xhcmVkU2lkZSA9IGNvbnRlbnQuZGF0YXNldC5zaWRlXG4gICAgdGhpcy5fZGVsYXkgPSBwYXJzZUludChjb250ZW50LmRhdGFzZXQuZGVsYXkpIHx8IDUwMFxuXG4gICAgLy8gVXBncmFkZSB0byBwb3BvdmVyIEFQSSBcdTIwMTQgZW5hYmxlcyB0b3AtbGF5ZXIgcmVuZGVyaW5nLlxuICAgIC8vIEJlZm9yZSB0aGlzLCBDU1Mtb25seSA6aG92ZXIgZmFsbGJhY2sga2VlcHMgdGhlIHRvb2x0aXAgZnVuY3Rpb25hbC5cbiAgICBjb250ZW50LnNldEF0dHJpYnV0ZSgncG9wb3ZlcicsICdtYW51YWwnKVxuXG4gICAgY29uc3Qgc2hvdyA9ICgpID0+IHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl90aW1lb3V0KVxuICAgICAgY29uc3QgZWxhcHNlZCA9IERhdGUubm93KCkgLSBsYXN0SGlkZVRpbWVcbiAgICAgIGNvbnN0IHdhaXQgPSBlbGFwc2VkIDwgU0tJUF9ERUxBWV9NUyA/IDAgOiB0aGlzLl9kZWxheVxuICAgICAgdGhpcy5fdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0cnkgeyBjb250ZW50LnNob3dQb3BvdmVyKCkgfSBjYXRjaCAoXykgeyByZXR1cm4gfVxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICAgIGlmICghaGFzQW5jaG9yUG9zKSB0aGlzLl9wb3NpdGlvbkZhbGxiYWNrKClcbiAgICAgICAgICB0aGlzLl9kZXRlY3RGbGlwKClcbiAgICAgICAgfSlcbiAgICAgIH0sIHdhaXQpXG4gICAgfVxuXG4gICAgY29uc3QgaGlkZSA9ICgpID0+IHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl90aW1lb3V0KVxuICAgICAgbGV0IGRpZEhpZGUgPSBmYWxzZVxuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKGNvbnRlbnQubWF0Y2hlcygnOnBvcG92ZXItb3BlbicpKSB7XG4gICAgICAgICAgY29udGVudC5oaWRlUG9wb3ZlcigpXG4gICAgICAgICAgZGlkSGlkZSA9IHRydWVcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoXykge31cbiAgICAgIGlmIChkaWRIaWRlKSB7XG4gICAgICAgIGxhc3RIaWRlVGltZSA9IERhdGUubm93KClcbiAgICAgICAgY29udGVudC5kYXRhc2V0LnNpZGUgPSB0aGlzLl9kZWNsYXJlZFNpZGVcbiAgICAgICAgaWYgKCFoYXNBbmNob3JQb3MpIHtcbiAgICAgICAgICBjb250ZW50LnN0eWxlLnRvcCA9ICcnXG4gICAgICAgICAgY29udGVudC5zdHlsZS5sZWZ0ID0gJydcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX3Nob3cgPSAoKSA9PiBzaG93KClcbiAgICB0aGlzLl9oaWRlID0gKCkgPT4gaGlkZSgpXG4gICAgdGhpcy5fZm9jdXNJbiA9ICgpID0+IHNob3coKVxuICAgIHRoaXMuX2ZvY3VzT3V0ID0gKGUpID0+IHtcbiAgICAgIGlmICghd3JhcHBlci5jb250YWlucyhlLnJlbGF0ZWRUYXJnZXQpKSBoaWRlKClcbiAgICB9XG4gICAgdGhpcy5fa2V5ZG93biA9IChlKSA9PiB7XG4gICAgICBpZiAoZS5rZXkgPT09ICdFc2NhcGUnKSBoaWRlKClcbiAgICB9XG5cbiAgICB3cmFwcGVyLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCB0aGlzLl9zaG93KVxuICAgIHdyYXBwZXIuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIHRoaXMuX2hpZGUpXG4gICAgYW5jaG9yLmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzaW4nLCB0aGlzLl9mb2N1c0luKVxuICAgIGFuY2hvci5hZGRFdmVudExpc3RlbmVyKCdmb2N1c291dCcsIHRoaXMuX2ZvY3VzT3V0KVxuICAgIHdyYXBwZXIuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX2tleWRvd24pXG4gIH0sXG5cbiAgLyoqIERldGVjdCBpZiBhbmNob3IgcG9zaXRpb25pbmcgZmxpcHBlZCB0aGUgc2lkZSBhbmQgdXBkYXRlIGRhdGEtc2lkZSBmb3IgYXJyb3cgQ1NTLiAqL1xuICBfZGV0ZWN0RmxpcCgpIHtcbiAgICBjb25zdCBhciA9IHRoaXMuX2FuY2hvci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgIGNvbnN0IGNyID0gdGhpcy5fY29udGVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgIGxldCBhY3R1YWxcbiAgICBpZiAoY3IuYm90dG9tIDw9IGFyLnRvcCArIDEpIGFjdHVhbCA9ICd0b3AnXG4gICAgZWxzZSBpZiAoY3IudG9wID49IGFyLmJvdHRvbSAtIDEpIGFjdHVhbCA9ICdib3R0b20nXG4gICAgZWxzZSBpZiAoY3IucmlnaHQgPD0gYXIubGVmdCArIDEpIGFjdHVhbCA9ICdsZWZ0J1xuICAgIGVsc2UgaWYgKGNyLmxlZnQgPj0gYXIucmlnaHQgLSAxKSBhY3R1YWwgPSAncmlnaHQnXG4gICAgZWxzZSBhY3R1YWwgPSB0aGlzLl9kZWNsYXJlZFNpZGVcbiAgICB0aGlzLl9jb250ZW50LmRhdGFzZXQuc2lkZSA9IGFjdHVhbFxuICB9LFxuXG4gIC8qKiBKUyBwb3NpdGlvbmluZyBmb3IgYnJvd3NlcnMgd2l0aG91dCBDU1MgYW5jaG9yIHBvc2l0aW9uaW5nIChTYWZhcmkpLiAqL1xuICBfcG9zaXRpb25GYWxsYmFjaygpIHtcbiAgICBjb25zdCBhciA9IHRoaXMuX2FuY2hvci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgIGNvbnN0IGN3ID0gdGhpcy5fY29udGVudC5vZmZzZXRXaWR0aFxuICAgIGNvbnN0IGNoID0gdGhpcy5fY29udGVudC5vZmZzZXRIZWlnaHRcbiAgICBjb25zdCBzaWRlID0gdGhpcy5fZGVjbGFyZWRTaWRlXG4gICAgY29uc3QgYWxpZ24gPSB0aGlzLl9jb250ZW50LmRhdGFzZXQuYWxpZ24gfHwgJ2NlbnRlcidcbiAgICBsZXQgdG9wLCBsZWZ0XG5cbiAgICBpZiAoc2lkZSA9PT0gJ3RvcCcgfHwgc2lkZSA9PT0gJ2JvdHRvbScpIHtcbiAgICAgIHRvcCA9IHNpZGUgPT09ICd0b3AnID8gYXIudG9wIC0gY2ggLSBHQVAgOiBhci5ib3R0b20gKyBHQVBcbiAgICAgIGlmIChhbGlnbiA9PT0gJ3N0YXJ0JykgbGVmdCA9IGFyLmxlZnRcbiAgICAgIGVsc2UgaWYgKGFsaWduID09PSAnZW5kJykgbGVmdCA9IGFyLnJpZ2h0IC0gY3dcbiAgICAgIGVsc2UgbGVmdCA9IGFyLmxlZnQgKyAoYXIud2lkdGggLSBjdykgLyAyXG4gICAgfSBlbHNlIHtcbiAgICAgIGxlZnQgPSBzaWRlID09PSAnbGVmdCcgPyBhci5sZWZ0IC0gY3cgLSBHQVAgOiBhci5yaWdodCArIEdBUFxuICAgICAgdG9wID0gYXIudG9wICsgKGFyLmhlaWdodCAtIGNoKSAvIDJcbiAgICB9XG5cbiAgICB0aGlzLl9jb250ZW50LnN0eWxlLnRvcCA9IGAke3RvcH1weGBcbiAgICB0aGlzLl9jb250ZW50LnN0eWxlLmxlZnQgPSBgJHtsZWZ0fXB4YFxuICB9LFxuXG4gIF91bmJpbmQoKSB7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuX3RpbWVvdXQpXG4gICAgaWYgKHRoaXMuX3dyYXBwZXIpIHtcbiAgICAgIGlmICh0aGlzLl9zaG93KSB0aGlzLl93cmFwcGVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCB0aGlzLl9zaG93KVxuICAgICAgaWYgKHRoaXMuX2hpZGUpIHRoaXMuX3dyYXBwZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIHRoaXMuX2hpZGUpXG4gICAgICBpZiAodGhpcy5fa2V5ZG93bikgdGhpcy5fd3JhcHBlci5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5fa2V5ZG93bilcbiAgICB9XG4gICAgaWYgKHRoaXMuX2FuY2hvcikge1xuICAgICAgaWYgKHRoaXMuX2ZvY3VzSW4pIHRoaXMuX2FuY2hvci5yZW1vdmVFdmVudExpc3RlbmVyKCdmb2N1c2luJywgdGhpcy5fZm9jdXNJbilcbiAgICAgIGlmICh0aGlzLl9mb2N1c091dCkgdGhpcy5fYW5jaG9yLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2ZvY3Vzb3V0JywgdGhpcy5fZm9jdXNPdXQpXG4gICAgfVxuICAgIHRoaXMuX3dyYXBwZXIgPSBudWxsXG4gICAgdGhpcy5fYW5jaG9yID0gbnVsbFxuICAgIHRoaXMuX2NvbnRlbnQgPSBudWxsXG4gICAgdGhpcy5fc2hvdyA9IG51bGxcbiAgICB0aGlzLl9oaWRlID0gbnVsbFxuICAgIHRoaXMuX2ZvY3VzSW4gPSBudWxsXG4gICAgdGhpcy5fZm9jdXNPdXQgPSBudWxsXG4gICAgdGhpcy5fa2V5ZG93biA9IG51bGxcbiAgICB0aGlzLl90aW1lb3V0ID0gbnVsbFxuICB9XG59XG5cbmV4cG9ydCB7IEV4b1Rvb2x0aXAgfVxuIiwgImNvbnN0IEV4b0hvdmVyQ2FyZCA9IHtcbiAgbW91bnRlZCgpIHsgdGhpcy5fYmluZCgpIH0sXG4gIHVwZGF0ZWQoKSB7IHRoaXMuX2JpbmQoKSB9LFxuICBkZXN0cm95ZWQoKSB7IHRoaXMuX3VuYmluZCgpIH0sXG5cbiAgX2JpbmQoKSB7XG4gICAgdGhpcy5fdW5iaW5kKClcbiAgICB0aGlzLnRyaWdnZXIgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cImhvdmVyLWNhcmQtdHJpZ2dlclwiXScpXG4gICAgdGhpcy5jb250ZW50ID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJob3Zlci1jYXJkLWNvbnRlbnRcIl0nKVxuICAgIGlmICghdGhpcy50cmlnZ2VyIHx8ICF0aGlzLmNvbnRlbnQpIHJldHVyblxuICAgIHRoaXMuX3Nob3dUaW1lb3V0ID0gbnVsbFxuICAgIHRoaXMuX2hpZGVUaW1lb3V0ID0gbnVsbFxuICAgIHRoaXMuX29wZW5EZWxheSA9IE51bWJlci5wYXJzZUludCh0aGlzLmVsLmRhdGFzZXQub3BlbkRlbGF5IHx8IFwiMzAwXCIsIDEwKVxuICAgIHRoaXMuX2Nsb3NlRGVsYXkgPSBOdW1iZXIucGFyc2VJbnQodGhpcy5lbC5kYXRhc2V0LmNsb3NlRGVsYXkgfHwgXCIxNTBcIiwgMTApXG5cbiAgICB0aGlzLl9zaG93ID0gKCkgPT4ge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2hpZGVUaW1lb3V0KVxuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3Nob3dUaW1lb3V0KVxuICAgICAgdGhpcy5fc2hvd1RpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5jb250ZW50LmhpZGRlbiA9IGZhbHNlXG4gICAgICAgIHRoaXMuY29udGVudC5zZXRBdHRyaWJ1dGUoXCJkYXRhLW9wZW5cIiwgXCJcIilcbiAgICAgICAgdGhpcy50cmlnZ2VyLnNldEF0dHJpYnV0ZShcImFyaWEtZXhwYW5kZWRcIiwgXCJ0cnVlXCIpXG4gICAgICB9LCB0aGlzLl9vcGVuRGVsYXkpXG4gICAgfVxuXG4gICAgdGhpcy5faGlkZSA9ICgpID0+IHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9zaG93VGltZW91dClcbiAgICAgIHRoaXMuX2hpZGVUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuY29udGVudC5yZW1vdmVBdHRyaWJ1dGUoXCJkYXRhLW9wZW5cIilcbiAgICAgICAgdGhpcy5jb250ZW50LmhpZGRlbiA9IHRydWVcbiAgICAgICAgdGhpcy50cmlnZ2VyLnNldEF0dHJpYnV0ZShcImFyaWEtZXhwYW5kZWRcIiwgXCJmYWxzZVwiKVxuICAgICAgfSwgdGhpcy5fY2xvc2VEZWxheSlcbiAgICB9XG5cbiAgICB0aGlzLl9vbkZvY3VzT3V0ID0gKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoIXRoaXMuZWwuY29udGFpbnMoZXZlbnQucmVsYXRlZFRhcmdldCkpIHRoaXMuX2hpZGUoKVxuICAgIH1cblxuICAgIHRoaXMuX29uS2V5ZG93biA9IChldmVudCkgPT4ge1xuICAgICAgaWYgKGV2ZW50LmtleSAhPT0gXCJFc2NhcGVcIiB8fCAhdGhpcy5jb250ZW50Lmhhc0F0dHJpYnV0ZShcImRhdGEtb3BlblwiKSkgcmV0dXJuXG5cbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgIHRoaXMuX2hpZGVOb3coKVxuICAgICAgdGhpcy5fZmlyc3RGb2N1c2FibGVUcmlnZ2VyKCk/LmZvY3VzPy4oeyBwcmV2ZW50U2Nyb2xsOiB0cnVlIH0pXG4gICAgfVxuXG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKFwicG9pbnRlcmVudGVyXCIsIHRoaXMuX3Nob3cpXG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKFwicG9pbnRlcmxlYXZlXCIsIHRoaXMuX2hpZGUpXG4gICAgdGhpcy50cmlnZ2VyLmFkZEV2ZW50TGlzdGVuZXIoXCJmb2N1c2luXCIsIHRoaXMuX3Nob3cpXG4gICAgdGhpcy50cmlnZ2VyLmFkZEV2ZW50TGlzdGVuZXIoXCJmb2N1c291dFwiLCB0aGlzLl9vbkZvY3VzT3V0KVxuICAgIHRoaXMuY29udGVudC5hZGRFdmVudExpc3RlbmVyKFwiZm9jdXNpblwiLCB0aGlzLl9zaG93KVxuICAgIHRoaXMuY29udGVudC5hZGRFdmVudExpc3RlbmVyKFwiZm9jdXNvdXRcIiwgdGhpcy5fb25Gb2N1c091dClcbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIHRoaXMuX29uS2V5ZG93bilcbiAgICB0aGlzLmVsLmRhdGFzZXQucmVhZHkgPSBcInRydWVcIlxuICB9LFxuXG4gIF9oaWRlTm93KCkge1xuICAgIGNsZWFyVGltZW91dCh0aGlzLl9zaG93VGltZW91dClcbiAgICBjbGVhclRpbWVvdXQodGhpcy5faGlkZVRpbWVvdXQpXG4gICAgdGhpcy5jb250ZW50LnJlbW92ZUF0dHJpYnV0ZShcImRhdGEtb3BlblwiKVxuICAgIHRoaXMuY29udGVudC5oaWRkZW4gPSB0cnVlXG4gICAgdGhpcy50cmlnZ2VyPy5zZXRBdHRyaWJ1dGUoXCJhcmlhLWV4cGFuZGVkXCIsIFwiZmFsc2VcIilcbiAgfSxcblxuICBfZmlyc3RGb2N1c2FibGVUcmlnZ2VyKCkge1xuICAgIHJldHVybiB0aGlzLnRyaWdnZXI/LnF1ZXJ5U2VsZWN0b3IoXCJhW2hyZWZdLGJ1dHRvbjpub3QoW2Rpc2FibGVkXSksW3RhYmluZGV4XTpub3QoW3RhYmluZGV4PSctMSddKVwiKVxuICB9LFxuXG4gIF91bmJpbmQoKSB7XG4gICAgaWYgKHRoaXMuZWwgJiYgdGhpcy5fc2hvdykgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKFwicG9pbnRlcmVudGVyXCIsIHRoaXMuX3Nob3cpXG4gICAgaWYgKHRoaXMuZWwgJiYgdGhpcy5faGlkZSkgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKFwicG9pbnRlcmxlYXZlXCIsIHRoaXMuX2hpZGUpXG4gICAgaWYgKHRoaXMuZWwgJiYgdGhpcy5fb25LZXlkb3duKSB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIHRoaXMuX29uS2V5ZG93bilcbiAgICBpZiAodGhpcy5lbCkgZGVsZXRlIHRoaXMuZWwuZGF0YXNldC5yZWFkeVxuICAgIGlmICh0aGlzLnRyaWdnZXIgJiYgdGhpcy5fc2hvdykgdGhpcy50cmlnZ2VyLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJmb2N1c2luXCIsIHRoaXMuX3Nob3cpXG4gICAgaWYgKHRoaXMudHJpZ2dlciAmJiB0aGlzLl9vbkZvY3VzT3V0KSB0aGlzLnRyaWdnZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImZvY3Vzb3V0XCIsIHRoaXMuX29uRm9jdXNPdXQpXG4gICAgaWYgKHRoaXMuY29udGVudCkge1xuICAgICAgaWYgKHRoaXMuX3Nob3cpIHRoaXMuY29udGVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwiZm9jdXNpblwiLCB0aGlzLl9zaG93KVxuICAgICAgaWYgKHRoaXMuX29uRm9jdXNPdXQpIHRoaXMuY29udGVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwiZm9jdXNvdXRcIiwgdGhpcy5fb25Gb2N1c091dClcbiAgICB9XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuX3Nob3dUaW1lb3V0KVxuICAgIGNsZWFyVGltZW91dCh0aGlzLl9oaWRlVGltZW91dClcbiAgICB0aGlzLnRyaWdnZXIgPSBudWxsXG4gICAgdGhpcy5jb250ZW50ID0gbnVsbFxuICAgIHRoaXMuX3Nob3cgPSBudWxsXG4gICAgdGhpcy5faGlkZSA9IG51bGxcbiAgICB0aGlzLl9vbkZvY3VzT3V0ID0gbnVsbFxuICAgIHRoaXMuX29uS2V5ZG93biA9IG51bGxcbiAgICB0aGlzLl9zaG93VGltZW91dCA9IG51bGxcbiAgICB0aGlzLl9oaWRlVGltZW91dCA9IG51bGxcbiAgICB0aGlzLl9vcGVuRGVsYXkgPSBudWxsXG4gICAgdGhpcy5fY2xvc2VEZWxheSA9IG51bGxcbiAgfVxufVxuXG5leHBvcnQgeyBFeG9Ib3ZlckNhcmQgfVxuIiwgImNvbnN0IEV4b0NvbnRleHRNZW51ID0ge1xuICBtb3VudGVkKCkgeyB0aGlzLl9iaW5kKCkgfSxcbiAgdXBkYXRlZCgpIHsgdGhpcy5fYmluZCgpIH0sXG4gIGRlc3Ryb3llZCgpIHsgdGhpcy5fdW5iaW5kKCkgfSxcblxuICBfYmluZCgpIHtcbiAgICB0aGlzLl91bmJpbmQoKVxuICAgIHRoaXMudHJpZ2dlciA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwiY29udGV4dC1tZW51LXRyaWdnZXJcIl0nKVxuICAgIHRoaXMubWVudSA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwiY29udGV4dC1tZW51LWNvbnRlbnRcIl0nKVxuICAgIGlmICghdGhpcy50cmlnZ2VyIHx8ICF0aGlzLm1lbnUpIHJldHVyblxuXG4gICAgdGhpcy5lbC5zZXRBdHRyaWJ1dGUoXCJkYXRhLXJlYWR5XCIsIFwiXCIpXG4gICAgdGhpcy50cmlnZ2VyLnNldEF0dHJpYnV0ZShcInRhYmluZGV4XCIsIHRoaXMudHJpZ2dlci5nZXRBdHRyaWJ1dGUoXCJ0YWJpbmRleFwiKSB8fCBcIjBcIilcbiAgICB0aGlzLnRyaWdnZXIuc2V0QXR0cmlidXRlKFwicm9sZVwiLCB0aGlzLnRyaWdnZXIuZ2V0QXR0cmlidXRlKFwicm9sZVwiKSB8fCBcImJ1dHRvblwiKVxuICAgIHRoaXMudHJpZ2dlci5zZXRBdHRyaWJ1dGUoXCJhcmlhLWhhc3BvcHVwXCIsIFwibWVudVwiKVxuICAgIGlmICh0aGlzLm1lbnUuaWQpIHRoaXMudHJpZ2dlci5zZXRBdHRyaWJ1dGUoXCJhcmlhLWNvbnRyb2xzXCIsIHRoaXMubWVudS5pZClcbiAgICB0aGlzLnRyaWdnZXIuc2V0QXR0cmlidXRlKFwiYXJpYS1leHBhbmRlZFwiLCBTdHJpbmcodGhpcy5tZW51Lmhhc0F0dHJpYnV0ZShcImRhdGEtb3BlblwiKSkpXG5cbiAgICB0aGlzLl9pdGVtcyA9ICgpID0+XG4gICAgICBbLi4udGhpcy5tZW51LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWV4bz1cImNvbnRleHQtbWVudS1pdGVtXCJdJyldXG4gICAgICAgIC5maWx0ZXIoKGl0ZW0pID0+ICF0aGlzLl9pc0Rpc2FibGVkKGl0ZW0pKVxuXG4gICAgdGhpcy5tZW51LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWV4bz1cImNvbnRleHQtbWVudS1pdGVtXCJdJykuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgaXRlbS5zZXRBdHRyaWJ1dGUoXCJ0YWJpbmRleFwiLCBcIi0xXCIpXG4gICAgICBpZiAoaXRlbS50YWdOYW1lID09PSBcIkJVVFRPTlwiICYmICFpdGVtLmdldEF0dHJpYnV0ZShcInR5cGVcIikpIHtcbiAgICAgICAgaXRlbS5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsIFwiYnV0dG9uXCIpXG4gICAgICB9XG4gICAgICBpZiAodGhpcy5faXNEaXNhYmxlZChpdGVtKSkge1xuICAgICAgICBpdGVtLnNldEF0dHJpYnV0ZShcImFyaWEtZGlzYWJsZWRcIiwgXCJ0cnVlXCIpXG4gICAgICAgIGl0ZW0uZGF0YXNldC5kaXNhYmxlZCA9IFwidHJ1ZVwiXG4gICAgICB9XG4gICAgfSlcblxuICAgIHRoaXMuX2Nsb3NlID0gKGUpID0+IHtcbiAgICAgIGlmICh0aGlzLnRyaWdnZXI/LmNvbnRhaW5zKGUudGFyZ2V0KSkgcmV0dXJuXG4gICAgICBpZiAoIXRoaXMubWVudS5jb250YWlucyhlLnRhcmdldCkpIHtcbiAgICAgICAgdGhpcy5faGlkZSgpXG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5fb25Db250ZXh0ID0gKGUpID0+IHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgdGhpcy5fb3BlbkF0KGUuY2xpZW50WCwgZS5jbGllbnRZKVxuICAgIH1cbiAgICB0aGlzLnRyaWdnZXIuYWRkRXZlbnRMaXN0ZW5lcihcImNvbnRleHRtZW51XCIsIHRoaXMuX29uQ29udGV4dClcblxuICAgIHRoaXMuX29uVHJpZ2dlcktleWRvd24gPSAoZSkgPT4ge1xuICAgICAgaWYgKGUua2V5ICE9PSBcIkNvbnRleHRNZW51XCIgJiYgIShlLnNoaWZ0S2V5ICYmIGUua2V5ID09PSBcIkYxMFwiKSkgcmV0dXJuXG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIGNvbnN0IHJlY3QgPSB0aGlzLnRyaWdnZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgIHRoaXMuX29wZW5BdChyZWN0LmxlZnQsIHJlY3QuYm90dG9tKVxuICAgIH1cbiAgICB0aGlzLnRyaWdnZXIuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5fb25UcmlnZ2VyS2V5ZG93bilcblxuICAgIHRoaXMuX29wZW5BdCA9ICh4LCB5KSA9PiB7XG4gICAgICB0aGlzLm1lbnUuc2V0QXR0cmlidXRlKFwiZGF0YS1vcGVuXCIsIFwiXCIpXG4gICAgICB0aGlzLnRyaWdnZXIuc2V0QXR0cmlidXRlKFwiYXJpYS1leHBhbmRlZFwiLCBcInRydWVcIilcbiAgICAgIHRoaXMuX3Bvc2l0aW9uV2l0aGluVmlld3BvcnQoeCwgeSlcbiAgICAgIHRoaXMuX2JpbmRDbG9zZUxpc3RlbmVycygpXG5cbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICAgIHRoaXMuX2l0ZW1zKClbMF0/LmZvY3VzKClcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgdGhpcy5fcG9zaXRpb25XaXRoaW5WaWV3cG9ydCA9ICh4LCB5KSA9PiB7XG4gICAgICB0aGlzLm1lbnUuc3R5bGUubGVmdCA9IHggKyBcInB4XCJcbiAgICAgIHRoaXMubWVudS5zdHlsZS50b3AgPSB5ICsgXCJweFwiXG5cbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5tZW51Lmhhc0F0dHJpYnV0ZShcImRhdGEtb3BlblwiKSkgcmV0dXJuXG4gICAgICAgIGNvbnN0IHJlY3QgPSB0aGlzLm1lbnUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgY29uc3QgZ2FwID0gNFxuICAgICAgICBjb25zdCBsZWZ0ID0gTWF0aC5taW4oeCwgd2luZG93LmlubmVyV2lkdGggLSByZWN0LndpZHRoIC0gZ2FwKVxuICAgICAgICBjb25zdCB0b3AgPSBNYXRoLm1pbih5LCB3aW5kb3cuaW5uZXJIZWlnaHQgLSByZWN0LmhlaWdodCAtIGdhcClcbiAgICAgICAgdGhpcy5tZW51LnN0eWxlLmxlZnQgPSBNYXRoLm1heChnYXAsIGxlZnQpICsgXCJweFwiXG4gICAgICAgIHRoaXMubWVudS5zdHlsZS50b3AgPSBNYXRoLm1heChnYXAsIHRvcCkgKyBcInB4XCJcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgdGhpcy5fYmluZENsb3NlTGlzdGVuZXJzID0gKCkgPT4ge1xuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInBvaW50ZXJkb3duXCIsIHRoaXMuX2Nsb3NlLCB0cnVlKVxuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLl9jbG9zZSwgdHJ1ZSlcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLl9jbG9zZSwgdHJ1ZSlcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjb250ZXh0bWVudVwiLCB0aGlzLl9jbG9zZSwgdHJ1ZSlcblxuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcInBvaW50ZXJkb3duXCIsIHRoaXMuX2Nsb3NlLCB0cnVlKVxuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLl9jbG9zZSwgdHJ1ZSlcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLl9jbG9zZSwgdHJ1ZSlcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjb250ZXh0bWVudVwiLCB0aGlzLl9jbG9zZSwgdHJ1ZSlcbiAgICB9XG5cbiAgICB0aGlzLl9oaWRlID0gKCkgPT4ge1xuICAgICAgdGhpcy5tZW51LnJlbW92ZUF0dHJpYnV0ZShcImRhdGEtb3BlblwiKVxuICAgICAgdGhpcy50cmlnZ2VyLnNldEF0dHJpYnV0ZShcImFyaWEtZXhwYW5kZWRcIiwgXCJmYWxzZVwiKVxuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInBvaW50ZXJkb3duXCIsIHRoaXMuX2Nsb3NlLCB0cnVlKVxuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLl9jbG9zZSwgdHJ1ZSlcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLl9jbG9zZSwgdHJ1ZSlcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjb250ZXh0bWVudVwiLCB0aGlzLl9jbG9zZSwgdHJ1ZSlcbiAgICB9XG5cbiAgICB0aGlzLl9vbkl0ZW1DbGljayA9IChlKSA9PiB7XG4gICAgICBjb25zdCBpdGVtID0gZS50YXJnZXQuY2xvc2VzdCgnW2RhdGEtZXhvPVwiY29udGV4dC1tZW51LWl0ZW1cIl0nKVxuICAgICAgaWYgKCFpdGVtKSByZXR1cm5cbiAgICAgIGlmICh0aGlzLl9pc0Rpc2FibGVkKGl0ZW0pKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIHRoaXMuX2hpZGUoKVxuICAgIH1cbiAgICB0aGlzLm1lbnUuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuX29uSXRlbUNsaWNrKVxuXG4gICAgdGhpcy5fb25LZXlkb3duID0gKGUpID0+IHtcbiAgICAgIGlmIChlLmtleSA9PT0gXCJFc2NhcGVcIikge1xuICAgICAgICB0aGlzLl9oaWRlKClcbiAgICAgICAgdGhpcy50cmlnZ2VyLmZvY3VzPy4oKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgY29uc3QgaXRlbXMgPSB0aGlzLl9pdGVtcygpXG4gICAgICBpZiAoIWl0ZW1zLmxlbmd0aCkgcmV0dXJuXG4gICAgICBjb25zdCBpZHggPSBpdGVtcy5pbmRleE9mKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpXG4gICAgICBsZXQgbmV4dCA9IC0xXG5cbiAgICAgIHN3aXRjaCAoZS5rZXkpIHtcbiAgICAgICAgY2FzZSBcIkFycm93RG93blwiOiBuZXh0ID0gaWR4IDwgaXRlbXMubGVuZ3RoIC0gMSA/IGlkeCArIDEgOiAwOyBicmVha1xuICAgICAgICBjYXNlIFwiQXJyb3dVcFwiOiBuZXh0ID0gaWR4ID4gMCA/IGlkeCAtIDEgOiBpdGVtcy5sZW5ndGggLSAxOyBicmVha1xuICAgICAgICBjYXNlIFwiSG9tZVwiOiBuZXh0ID0gMDsgYnJlYWtcbiAgICAgICAgY2FzZSBcIkVuZFwiOiBuZXh0ID0gaXRlbXMubGVuZ3RoIC0gMTsgYnJlYWtcbiAgICAgICAgZGVmYXVsdDogcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgaXRlbXNbbmV4dF0/LmZvY3VzKClcbiAgICB9XG4gICAgdGhpcy5tZW51LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIHRoaXMuX29uS2V5ZG93bilcbiAgfSxcblxuICBfaXNEaXNhYmxlZChpdGVtKSB7XG4gICAgcmV0dXJuIGl0ZW0uZGlzYWJsZWQgfHxcbiAgICAgIGl0ZW0uZGF0YXNldC5kaXNhYmxlZCA9PT0gXCJ0cnVlXCIgfHxcbiAgICAgIGl0ZW0uaGFzQXR0cmlidXRlKFwiZGF0YS1kaXNhYmxlZFwiKSB8fFxuICAgICAgaXRlbS5nZXRBdHRyaWJ1dGUoXCJhcmlhLWRpc2FibGVkXCIpID09PSBcInRydWVcIlxuICB9LFxuXG4gIF91bmJpbmQoKSB7XG4gICAgaWYgKHRoaXMudHJpZ2dlciAmJiB0aGlzLl9vbkNvbnRleHQpIHRoaXMudHJpZ2dlci5yZW1vdmVFdmVudExpc3RlbmVyKFwiY29udGV4dG1lbnVcIiwgdGhpcy5fb25Db250ZXh0KVxuICAgIGlmICh0aGlzLnRyaWdnZXIgJiYgdGhpcy5fb25UcmlnZ2VyS2V5ZG93bikgdGhpcy50cmlnZ2VyLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIHRoaXMuX29uVHJpZ2dlcktleWRvd24pXG4gICAgaWYgKHRoaXMubWVudSAmJiB0aGlzLl9vbkl0ZW1DbGljaykgdGhpcy5tZW51LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLl9vbkl0ZW1DbGljaylcbiAgICBpZiAodGhpcy5tZW51ICYmIHRoaXMuX29uS2V5ZG93bikgdGhpcy5tZW51LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIHRoaXMuX29uS2V5ZG93bilcbiAgICBpZiAodGhpcy5fY2xvc2UpIHtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJwb2ludGVyZG93blwiLCB0aGlzLl9jbG9zZSwgdHJ1ZSlcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5fY2xvc2UsIHRydWUpXG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5fY2xvc2UsIHRydWUpXG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwiY29udGV4dG1lbnVcIiwgdGhpcy5fY2xvc2UsIHRydWUpXG4gICAgfVxuICAgIGlmICh0aGlzLmVsKSB0aGlzLmVsLnJlbW92ZUF0dHJpYnV0ZShcImRhdGEtcmVhZHlcIilcbiAgICB0aGlzLnRyaWdnZXIgPSBudWxsXG4gICAgdGhpcy5tZW51ID0gbnVsbFxuICAgIHRoaXMuX2l0ZW1zID0gbnVsbFxuICAgIHRoaXMuX2hpZGUgPSBudWxsXG4gICAgdGhpcy5fb3BlbkF0ID0gbnVsbFxuICAgIHRoaXMuX2JpbmRDbG9zZUxpc3RlbmVycyA9IG51bGxcbiAgICB0aGlzLl9wb3NpdGlvbldpdGhpblZpZXdwb3J0ID0gbnVsbFxuICAgIHRoaXMuX29uQ29udGV4dCA9IG51bGxcbiAgICB0aGlzLl9vblRyaWdnZXJLZXlkb3duID0gbnVsbFxuICAgIHRoaXMuX29uSXRlbUNsaWNrID0gbnVsbFxuICAgIHRoaXMuX29uS2V5ZG93biA9IG51bGxcbiAgICB0aGlzLl9jbG9zZSA9IG51bGxcbiAgfVxufVxuXG5leHBvcnQgeyBFeG9Db250ZXh0TWVudSB9XG4iLCAiY29uc3QgRXhvUmF0aW5nID0ge1xuICBtb3VudGVkKCkgeyB0aGlzLl9iaW5kKCkgfSxcbiAgdXBkYXRlZCgpIHsgdGhpcy5fYmluZCgpIH0sXG4gIGRlc3Ryb3llZCgpIHsgdGhpcy5fdW5iaW5kKCkgfSxcblxuICBfYmluZCgpIHtcbiAgICB0aGlzLl91bmJpbmQoKVxuICAgIHRoaXMuX2hpZGRlbiA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwicmF0aW5nLXZhbHVlXCJdJylcbiAgICB0aGlzLl9pbnB1dHMgPSBbLi4udGhpcy5lbC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1leG89XCJyYXRpbmctaW5wdXRcIl0nKV1cbiAgICBpZiAoIXRoaXMuX2hpZGRlbiB8fCB0aGlzLl9pbnB1dHMubGVuZ3RoID09PSAwKSByZXR1cm5cblxuICAgIHRoaXMuZWwuc2V0QXR0cmlidXRlKCdkYXRhLXJlYWR5JywgJycpXG5cbiAgICB0aGlzLl9vbkNsaWNrID0gKGV2ZW50KSA9PiB7XG4gICAgICBjb25zdCBzdGFyID0gZXZlbnQudGFyZ2V0LmNsb3Nlc3QoJ1tkYXRhLWV4bz1cInJhdGluZy1zdGFyXCJdJylcbiAgICAgIGlmICghc3RhcikgcmV0dXJuXG4gICAgICBjb25zdCBpbnB1dCA9IHN0YXIucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwicmF0aW5nLWlucHV0XCJdJylcbiAgICAgIGlmICghaW5wdXQgfHwgaW5wdXQuZGlzYWJsZWQpIHJldHVyblxuICAgICAgaW5wdXQuY2hlY2tlZCA9IHRydWVcbiAgICAgIHRoaXMuX3NldFZhbHVlKGlucHV0LnZhbHVlLCB0cnVlKVxuICAgIH1cblxuICAgIHRoaXMuX29uQ2hhbmdlID0gKGV2ZW50KSA9PiB7XG4gICAgICBjb25zdCBpbnB1dCA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KCdbZGF0YS1leG89XCJyYXRpbmctaW5wdXRcIl0nKVxuICAgICAgaWYgKCFpbnB1dCB8fCAhaW5wdXQuY2hlY2tlZCkgcmV0dXJuXG4gICAgICB0aGlzLl9zZXRWYWx1ZShpbnB1dC52YWx1ZSwgdHJ1ZSlcbiAgICB9XG5cbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fb25DbGljaylcbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIHRoaXMuX29uQ2hhbmdlKVxuICAgIHRoaXMuX3NldFZhbHVlKHRoaXMuX2hpZGRlbi52YWx1ZSB8fCB0aGlzLmVsLmRhdGFzZXQudmFsdWUgfHwgJzAnLCBmYWxzZSlcbiAgfSxcblxuICBfc2V0VmFsdWUodmFsdWUsIG5vdGlmeSkge1xuICAgIGNvbnN0IG51bWVyaWNWYWx1ZSA9IHBhcnNlSW50KHZhbHVlIHx8ICcwJywgMTApIHx8IDBcbiAgICB0aGlzLmVsLmRhdGFzZXQudmFsdWUgPSBTdHJpbmcobnVtZXJpY1ZhbHVlKVxuICAgIHRoaXMuX2hpZGRlbi52YWx1ZSA9IFN0cmluZyhudW1lcmljVmFsdWUpXG5cbiAgICB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWV4bz1cInJhdGluZy1zdGFyXCJdJykuZm9yRWFjaCgoc3RhciwgaW5kZXgpID0+IHtcbiAgICAgIHN0YXIudG9nZ2xlQXR0cmlidXRlKCdkYXRhLWFjdGl2ZScsIGluZGV4ICsgMSA8PSBudW1lcmljVmFsdWUpXG4gICAgfSlcblxuICAgIHRoaXMuX2lucHV0cy5mb3JFYWNoKChpbnB1dCkgPT4ge1xuICAgICAgaW5wdXQuY2hlY2tlZCA9IGlucHV0LnZhbHVlID09PSBTdHJpbmcobnVtZXJpY1ZhbHVlKVxuICAgIH0pXG5cbiAgICBpZiAobm90aWZ5KSB7XG4gICAgICB0aGlzLl9oaWRkZW4uZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2lucHV0JywgeyBidWJibGVzOiB0cnVlIH0pKVxuICAgICAgdGhpcy5faGlkZGVuLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdjaGFuZ2UnLCB7IGJ1YmJsZXM6IHRydWUgfSkpXG4gICAgfVxuICB9LFxuXG4gIF91bmJpbmQoKSB7XG4gICAgaWYgKHRoaXMuX29uQ2xpY2spIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9vbkNsaWNrKVxuICAgIGlmICh0aGlzLl9vbkNoYW5nZSkgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCB0aGlzLl9vbkNoYW5nZSlcbiAgICBpZiAodGhpcy5lbCkgdGhpcy5lbC5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtcmVhZHknKVxuICAgIHRoaXMuX2hpZGRlbiA9IG51bGxcbiAgICB0aGlzLl9pbnB1dHMgPSBbXVxuICAgIHRoaXMuX29uQ2xpY2sgPSBudWxsXG4gICAgdGhpcy5fb25DaGFuZ2UgPSBudWxsXG4gIH1cbn1cblxuZXhwb3J0IHsgRXhvUmF0aW5nIH1cbiIsICJjb25zdCBFeG9NZW51YmFyID0ge1xuICBtb3VudGVkKCkgeyB0aGlzLl9iaW5kKCkgfSxcbiAgdXBkYXRlZCgpIHsgdGhpcy5fYmluZCgpIH0sXG4gIGRlc3Ryb3llZCgpIHsgdGhpcy5fdW5iaW5kKCkgfSxcblxuICBfYmluZCgpIHtcbiAgICB0aGlzLl91bmJpbmQoKVxuICAgIHRoaXMubWVudXMgPSBBcnJheS5mcm9tKHRoaXMuZWwucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZXhvPVwibWVudWJhci1tZW51XCJdJykpXG4gICAgdGhpcy50cmlnZ2VycyA9IHRoaXMubWVudXMubWFwKChtZW51KSA9PiBtZW51LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cIm1lbnViYXItdHJpZ2dlclwiXScpKVxuICAgIHRoaXMuY29udGVudHMgPSB0aGlzLm1lbnVzLm1hcCgobWVudSkgPT4gbWVudS5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJtZW51YmFyLWNvbnRlbnRcIl0nKSlcbiAgICB0aGlzLm9wZW5JbmRleCA9IC0xXG5cbiAgICB0aGlzLnRyaWdnZXJzLmZvckVhY2goKHRyaWdnZXIsIGluZGV4KSA9PiB7XG4gICAgICBpZiAoIXRyaWdnZXIpIHJldHVyblxuICAgICAgdHJpZ2dlci5zZXRBdHRyaWJ1dGUoXCJ0YWJpbmRleFwiLCBpbmRleCA9PT0gMCA/IFwiMFwiIDogXCItMVwiKVxuICAgICAgdHJpZ2dlci5zZXRBdHRyaWJ1dGUoXCJhcmlhLWV4cGFuZGVkXCIsIFwiZmFsc2VcIilcbiAgICAgIGlmICh0cmlnZ2VyLnRhZ05hbWUgPT09IFwiQlVUVE9OXCIgJiYgIXRyaWdnZXIuaGFzQXR0cmlidXRlKFwidHlwZVwiKSkge1xuICAgICAgICB0cmlnZ2VyLnNldEF0dHJpYnV0ZShcInR5cGVcIiwgXCJidXR0b25cIilcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgdGhpcy5jb250ZW50cy5mb3JFYWNoKChjb250ZW50LCBpbmRleCkgPT4ge1xuICAgICAgaWYgKCFjb250ZW50KSByZXR1cm5cbiAgICAgIGNvbnRlbnQuaGlkZGVuID0gdHJ1ZVxuICAgICAgY29udGVudC5yZW1vdmVBdHRyaWJ1dGUoXCJkYXRhLW9wZW5cIilcbiAgICAgIHRoaXMuX2l0ZW1zKGluZGV4KS5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgIGlmICghaXRlbS5oYXNBdHRyaWJ1dGUoXCJyb2xlXCIpKSBpdGVtLnNldEF0dHJpYnV0ZShcInJvbGVcIiwgXCJtZW51aXRlbVwiKVxuICAgICAgICBpdGVtLnNldEF0dHJpYnV0ZShcInRhYmluZGV4XCIsIFwiLTFcIilcbiAgICAgICAgaWYgKGl0ZW0udGFnTmFtZSA9PT0gXCJCVVRUT05cIiAmJiAhaXRlbS5oYXNBdHRyaWJ1dGUoXCJ0eXBlXCIpKSB7XG4gICAgICAgICAgaXRlbS5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsIFwiYnV0dG9uXCIpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSlcblxuICAgIHRoaXMuX29uQ2xpY2sgPSAoZSkgPT4ge1xuICAgICAgY29uc3QgdHJpZ2dlciA9IGUudGFyZ2V0LmNsb3Nlc3QoJ1tkYXRhLWV4bz1cIm1lbnViYXItdHJpZ2dlclwiXScpXG4gICAgICBpZiAodHJpZ2dlciAmJiB0aGlzLmVsLmNvbnRhaW5zKHRyaWdnZXIpKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMudHJpZ2dlcnMuaW5kZXhPZih0cmlnZ2VyKVxuICAgICAgICB0aGlzLm9wZW5JbmRleCA9PT0gaW5kZXggPyB0aGlzLl9jbG9zZUFsbCh0cnVlKSA6IHRoaXMuX29wZW4oaW5kZXgpXG4gICAgICAgIHRyaWdnZXIuZm9jdXMoKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgY29uc3QgaXRlbSA9IGUudGFyZ2V0LmNsb3Nlc3QoJ1tkYXRhLWV4bz1cIm1lbnViYXItY29udGVudFwiXSBbcm9sZT1cIm1lbnVpdGVtXCJdLCBbZGF0YS1leG89XCJtZW51YmFyLWNvbnRlbnRcIl0gYnV0dG9uLCBbZGF0YS1leG89XCJtZW51YmFyLWNvbnRlbnRcIl0gYScpXG4gICAgICBpZiAoaXRlbSAmJiB0aGlzLmVsLmNvbnRhaW5zKGl0ZW0pICYmICF0aGlzLl9pc0Rpc2FibGVkKGl0ZW0pKSB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy5fY2xvc2VBbGwodHJ1ZSksIDApXG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuX29uQ2xpY2spXG5cbiAgICB0aGlzLl9vblBvaW50ZXJFbnRlciA9IChlKSA9PiB7XG4gICAgICBjb25zdCB0cmlnZ2VyID0gZS50YXJnZXQuY2xvc2VzdCgnW2RhdGEtZXhvPVwibWVudWJhci10cmlnZ2VyXCJdJylcbiAgICAgIGlmICghdHJpZ2dlciB8fCAhdGhpcy5lbC5jb250YWlucyh0cmlnZ2VyKSB8fCB0aGlzLm9wZW5JbmRleCA8IDApIHJldHVyblxuICAgICAgdGhpcy5fb3Blbih0aGlzLnRyaWdnZXJzLmluZGV4T2YodHJpZ2dlcikpXG4gICAgICB0cmlnZ2VyLmZvY3VzKClcbiAgICB9XG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKFwicG9pbnRlcm92ZXJcIiwgdGhpcy5fb25Qb2ludGVyRW50ZXIpXG5cbiAgICB0aGlzLl9vbktleURvd24gPSAoZSkgPT4ge1xuICAgICAgY29uc3QgdHJpZ2dlckluZGV4ID0gdGhpcy50cmlnZ2Vycy5pbmRleE9mKGUudGFyZ2V0KVxuICAgICAgaWYgKHRyaWdnZXJJbmRleCA+PSAwKSB7XG4gICAgICAgIHRoaXMuX29uVHJpZ2dlcktleShlLCB0cmlnZ2VySW5kZXgpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBjb25zdCBjb250ZW50SW5kZXggPSB0aGlzLmNvbnRlbnRzLmZpbmRJbmRleCgoY29udGVudCkgPT4gY29udGVudD8uY29udGFpbnMoZS50YXJnZXQpKVxuICAgICAgaWYgKGNvbnRlbnRJbmRleCA+PSAwKSB0aGlzLl9vbk1lbnVLZXkoZSwgY29udGVudEluZGV4KVxuICAgIH1cbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIHRoaXMuX29uS2V5RG93bilcblxuICAgIHRoaXMuX29uRG9jdW1lbnRQb2ludGVyRG93biA9IChlKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuZWwuY29udGFpbnMoZS50YXJnZXQpKSB0aGlzLl9jbG9zZUFsbCh0cnVlKVxuICAgIH1cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwicG9pbnRlcmRvd25cIiwgdGhpcy5fb25Eb2N1bWVudFBvaW50ZXJEb3duLCB0cnVlKVxuXG4gICAgdGhpcy5fb25Gb2N1c091dCA9ICgpID0+IHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9mb2N1c091dFRpbWVyKVxuICAgICAgdGhpcy5fZm9jdXNPdXRUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuZWwuY29udGFpbnMoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCkpIHRoaXMuX2Nsb3NlQWxsKHRydWUpXG4gICAgICB9LCAwKVxuICAgIH1cbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoXCJmb2N1c291dFwiLCB0aGlzLl9vbkZvY3VzT3V0KVxuXG4gICAgdGhpcy5lbC5kYXRhc2V0LnJlYWR5ID0gXCJ0cnVlXCJcbiAgfSxcblxuICBfb25UcmlnZ2VyS2V5KGUsIGluZGV4KSB7XG4gICAgaWYgKGUua2V5ID09PSBcIkFycm93UmlnaHRcIikge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICB0aGlzLl9mb2N1c1RyaWdnZXIodGhpcy5fbmV4dFRyaWdnZXIoaW5kZXgsIDEpKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaWYgKGUua2V5ID09PSBcIkFycm93TGVmdFwiKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIHRoaXMuX2ZvY3VzVHJpZ2dlcih0aGlzLl9uZXh0VHJpZ2dlcihpbmRleCwgLTEpKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaWYgKGUua2V5ID09PSBcIkhvbWVcIikge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICB0aGlzLl9mb2N1c1RyaWdnZXIoMClcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGlmIChlLmtleSA9PT0gXCJFbmRcIikge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICB0aGlzLl9mb2N1c1RyaWdnZXIodGhpcy50cmlnZ2Vycy5sZW5ndGggLSAxKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaWYgKFtcIkFycm93RG93blwiLCBcIkVudGVyXCIsIFwiIFwiXS5pbmNsdWRlcyhlLmtleSkpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgdGhpcy5fb3BlbihpbmRleClcbiAgICAgIHRoaXMuX2ZvY3VzSXRlbShpbmRleCwgMClcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGlmIChlLmtleSA9PT0gXCJFc2NhcGVcIikge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICB0aGlzLl9jbG9zZUFsbCh0cnVlKVxuICAgIH1cbiAgfSxcblxuICBfb25NZW51S2V5KGUsIGluZGV4KSB7XG4gICAgY29uc3QgaXRlbXMgPSB0aGlzLl9lbmFibGVkSXRlbXMoaW5kZXgpXG4gICAgY29uc3QgY3VycmVudCA9IGl0ZW1zLmluZGV4T2YoZS50YXJnZXQuY2xvc2VzdCgnW3JvbGU9XCJtZW51aXRlbVwiXSwgYnV0dG9uLCBhJykpXG5cbiAgICBpZiAoZS5rZXkgPT09IFwiQXJyb3dEb3duXCIpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgdGhpcy5fZm9jdXNJdGVtKGluZGV4LCBjdXJyZW50ICsgMSlcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGlmIChlLmtleSA9PT0gXCJBcnJvd1VwXCIpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgdGhpcy5fZm9jdXNJdGVtKGluZGV4LCBjdXJyZW50IC0gMSlcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGlmIChlLmtleSA9PT0gXCJIb21lXCIpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgdGhpcy5fZm9jdXNJdGVtKGluZGV4LCAwKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaWYgKGUua2V5ID09PSBcIkVuZFwiKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIHRoaXMuX2ZvY3VzSXRlbShpbmRleCwgaXRlbXMubGVuZ3RoIC0gMSlcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGlmIChlLmtleSA9PT0gXCJBcnJvd1JpZ2h0XCIpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgY29uc3QgbmV4dCA9IHRoaXMuX25leHRUcmlnZ2VyKGluZGV4LCAxKVxuICAgICAgdGhpcy5fb3BlbihuZXh0KVxuICAgICAgdGhpcy5fZm9jdXNJdGVtKG5leHQsIDApXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZiAoZS5rZXkgPT09IFwiQXJyb3dMZWZ0XCIpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgY29uc3QgcHJldmlvdXMgPSB0aGlzLl9uZXh0VHJpZ2dlcihpbmRleCwgLTEpXG4gICAgICB0aGlzLl9vcGVuKHByZXZpb3VzKVxuICAgICAgdGhpcy5fZm9jdXNJdGVtKHByZXZpb3VzLCAwKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaWYgKGUua2V5ID09PSBcIkVzY2FwZVwiKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIHRoaXMuX2Nsb3NlQWxsKGZhbHNlKVxuICAgICAgdGhpcy5fZm9jdXNUcmlnZ2VyKGluZGV4KVxuICAgIH1cbiAgfSxcblxuICBfb3BlbihpbmRleCkge1xuICAgIHRoaXMuY29udGVudHMuZm9yRWFjaCgoY29udGVudCwgY29udGVudEluZGV4KSA9PiB7XG4gICAgICBjb25zdCB0cmlnZ2VyID0gdGhpcy50cmlnZ2Vyc1tjb250ZW50SW5kZXhdXG4gICAgICBjb25zdCBvcGVuID0gY29udGVudEluZGV4ID09PSBpbmRleFxuICAgICAgaWYgKCFjb250ZW50IHx8ICF0cmlnZ2VyKSByZXR1cm5cbiAgICAgIGNvbnRlbnQuaGlkZGVuID0gIW9wZW5cbiAgICAgIGNvbnRlbnQudG9nZ2xlQXR0cmlidXRlKFwiZGF0YS1vcGVuXCIsIG9wZW4pXG4gICAgICB0cmlnZ2VyLnNldEF0dHJpYnV0ZShcImFyaWEtZXhwYW5kZWRcIiwgb3BlbiA/IFwidHJ1ZVwiIDogXCJmYWxzZVwiKVxuICAgIH0pXG4gICAgdGhpcy5vcGVuSW5kZXggPSBpbmRleFxuICAgIHRoaXMuZWwuZGF0YXNldC5vcGVuID0gXCJ0cnVlXCJcbiAgfSxcblxuICBfY2xvc2VBbGwocmVzZXRGb2N1cykge1xuICAgIHRoaXMuY29udGVudHMuZm9yRWFjaCgoY29udGVudCwgaW5kZXgpID0+IHtcbiAgICAgIGlmICghY29udGVudCkgcmV0dXJuXG4gICAgICBjb250ZW50LmhpZGRlbiA9IHRydWVcbiAgICAgIGNvbnRlbnQucmVtb3ZlQXR0cmlidXRlKFwiZGF0YS1vcGVuXCIpXG4gICAgICB0aGlzLnRyaWdnZXJzW2luZGV4XT8uc2V0QXR0cmlidXRlKFwiYXJpYS1leHBhbmRlZFwiLCBcImZhbHNlXCIpXG4gICAgfSlcbiAgICB0aGlzLm9wZW5JbmRleCA9IC0xXG4gICAgZGVsZXRlIHRoaXMuZWwuZGF0YXNldC5vcGVuXG4gICAgaWYgKHJlc2V0Rm9jdXMpIHRoaXMuX3NldFRyaWdnZXJUYWJJbmRleCgwKVxuICB9LFxuXG4gIF9mb2N1c1RyaWdnZXIoaW5kZXgpIHtcbiAgICB0aGlzLl9zZXRUcmlnZ2VyVGFiSW5kZXgoaW5kZXgpXG4gICAgdGhpcy50cmlnZ2Vyc1tpbmRleF0/LmZvY3VzKClcbiAgICBpZiAodGhpcy5vcGVuSW5kZXggPj0gMCkgdGhpcy5fb3BlbihpbmRleClcbiAgfSxcblxuICBfc2V0VHJpZ2dlclRhYkluZGV4KGluZGV4KSB7XG4gICAgdGhpcy50cmlnZ2Vycy5mb3JFYWNoKCh0cmlnZ2VyLCB0cmlnZ2VySW5kZXgpID0+IHtcbiAgICAgIHRyaWdnZXI/LnNldEF0dHJpYnV0ZShcInRhYmluZGV4XCIsIHRyaWdnZXJJbmRleCA9PT0gaW5kZXggPyBcIjBcIiA6IFwiLTFcIilcbiAgICB9KVxuICB9LFxuXG4gIF9mb2N1c0l0ZW0oaW5kZXgsIGl0ZW1JbmRleCkge1xuICAgIGNvbnN0IGl0ZW1zID0gdGhpcy5fZW5hYmxlZEl0ZW1zKGluZGV4KVxuICAgIGlmICghaXRlbXMubGVuZ3RoKSByZXR1cm5cbiAgICBjb25zdCBib3VuZGVkID0gKGl0ZW1JbmRleCArIGl0ZW1zLmxlbmd0aCkgJSBpdGVtcy5sZW5ndGhcbiAgICBpdGVtc1tib3VuZGVkXS5mb2N1cygpXG4gIH0sXG5cbiAgX25leHRUcmlnZ2VyKGluZGV4LCBkZWx0YSkge1xuICAgIGlmICghdGhpcy50cmlnZ2Vycy5sZW5ndGgpIHJldHVybiAtMVxuICAgIHJldHVybiAoaW5kZXggKyBkZWx0YSArIHRoaXMudHJpZ2dlcnMubGVuZ3RoKSAlIHRoaXMudHJpZ2dlcnMubGVuZ3RoXG4gIH0sXG5cbiAgX2l0ZW1zKGluZGV4KSB7XG4gICAgY29uc3QgY29udGVudCA9IHRoaXMuY29udGVudHNbaW5kZXhdXG4gICAgaWYgKCFjb250ZW50KSByZXR1cm4gW11cbiAgICByZXR1cm4gQXJyYXkuZnJvbShjb250ZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tyb2xlPVwibWVudWl0ZW1cIl0sIGJ1dHRvbiwgYScpKVxuICB9LFxuXG4gIF9lbmFibGVkSXRlbXMoaW5kZXgpIHtcbiAgICByZXR1cm4gdGhpcy5faXRlbXMoaW5kZXgpLmZpbHRlcigoaXRlbSkgPT4gIXRoaXMuX2lzRGlzYWJsZWQoaXRlbSkpXG4gIH0sXG5cbiAgX2lzRGlzYWJsZWQoaXRlbSkge1xuICAgIHJldHVybiBpdGVtLmRpc2FibGVkIHx8IGl0ZW0uZ2V0QXR0cmlidXRlKFwiYXJpYS1kaXNhYmxlZFwiKSA9PT0gXCJ0cnVlXCIgfHwgaXRlbS5kYXRhc2V0LmRpc2FibGVkID09PSBcInRydWVcIlxuICB9LFxuXG4gIF91bmJpbmQoKSB7XG4gICAgaWYgKHRoaXMuX29uQ2xpY2spIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuX29uQ2xpY2spXG4gICAgaWYgKHRoaXMuX29uUG9pbnRlckVudGVyKSB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJwb2ludGVyb3ZlclwiLCB0aGlzLl9vblBvaW50ZXJFbnRlcilcbiAgICBpZiAodGhpcy5fb25LZXlEb3duKSB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIHRoaXMuX29uS2V5RG93bilcbiAgICBpZiAodGhpcy5fb25Eb2N1bWVudFBvaW50ZXJEb3duKSBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwicG9pbnRlcmRvd25cIiwgdGhpcy5fb25Eb2N1bWVudFBvaW50ZXJEb3duLCB0cnVlKVxuICAgIGlmICh0aGlzLl9vbkZvY3VzT3V0KSB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJmb2N1c291dFwiLCB0aGlzLl9vbkZvY3VzT3V0KVxuICAgIGNsZWFyVGltZW91dCh0aGlzLl9mb2N1c091dFRpbWVyKVxuICAgIGRlbGV0ZSB0aGlzLmVsLmRhdGFzZXQucmVhZHlcbiAgICB0aGlzLm1lbnVzID0gW11cbiAgICB0aGlzLnRyaWdnZXJzID0gW11cbiAgICB0aGlzLmNvbnRlbnRzID0gW11cbiAgICB0aGlzLm9wZW5JbmRleCA9IC0xXG4gICAgdGhpcy5fb25DbGljayA9IG51bGxcbiAgICB0aGlzLl9vblBvaW50ZXJFbnRlciA9IG51bGxcbiAgICB0aGlzLl9vbktleURvd24gPSBudWxsXG4gICAgdGhpcy5fb25Eb2N1bWVudFBvaW50ZXJEb3duID0gbnVsbFxuICAgIHRoaXMuX29uRm9jdXNPdXQgPSBudWxsXG4gICAgdGhpcy5fZm9jdXNPdXRUaW1lciA9IG51bGxcbiAgfVxufVxuXG5leHBvcnQgeyBFeG9NZW51YmFyIH1cbiIsICJjb25zdCBmb2N1c2FibGVTZWxlY3RvciA9IFtcbiAgJ2FbaHJlZl0nLFxuICAnYnV0dG9uOm5vdChbZGlzYWJsZWRdKScsXG4gICdpbnB1dDpub3QoW2Rpc2FibGVkXSk6bm90KFt0eXBlPVwiaGlkZGVuXCJdKScsXG4gICdzZWxlY3Q6bm90KFtkaXNhYmxlZF0pJyxcbiAgJ3RleHRhcmVhOm5vdChbZGlzYWJsZWRdKScsXG4gICdbdGFiaW5kZXhdOm5vdChbdGFiaW5kZXg9XCItMVwiXSknLFxuICAnW2NvbnRlbnRlZGl0YWJsZT1cInRydWVcIl0nXG5dLmpvaW4oJywnKVxuXG5jb25zdCBFeG9PdmVybGF5ID0ge1xuICBtb3VudGVkKCkgeyB0aGlzLl9iaW5kKCkgfSxcbiAgdXBkYXRlZCgpIHsgdGhpcy5fYmluZCgpIH0sXG4gIGRlc3Ryb3llZCgpIHsgdGhpcy5fdW5iaW5kKCkgfSxcblxuICBfYmluZCgpIHtcbiAgICBjb25zdCB3YXNPcGVuID0gdGhpcy5faXNPcGVuQWN0aXZlXG4gICAgY29uc3QgcHJldmlvdXNGb2N1cyA9IHRoaXMuX3ByZXZpb3VzRm9jdXNcbiAgICBjb25zdCBwZW5kaW5nSW52b2tlciA9IHRoaXMuX3BlbmRpbmdJbnZva2VyXG4gICAgdGhpcy5fdW5iaW5kKClcblxuICAgIHRoaXMuX2lzT3BlbkFjdGl2ZSA9IHdhc09wZW4gfHwgZmFsc2VcbiAgICB0aGlzLl9wcmV2aW91c0ZvY3VzID0gcHJldmlvdXNGb2N1cyB8fCBudWxsXG4gICAgdGhpcy5fcGVuZGluZ0ludm9rZXIgPSBwZW5kaW5nSW52b2tlciB8fCBudWxsXG4gICAgdGhpcy5fcGFuZWwgPSB0aGlzLl9maW5kUGFuZWwoKVxuICAgIHRoaXMuX2Nsb3NlID0gdGhpcy5fZmluZENsb3NlKClcblxuICAgIGlmICghdGhpcy5fcGFuZWwpIHJldHVyblxuXG4gICAgdGhpcy5fb25LZXlkb3duID0gKGV2ZW50KSA9PiB0aGlzLl9oYW5kbGVLZXlkb3duKGV2ZW50KVxuICAgIHRoaXMuX29uUG9pbnRlcmRvd24gPSAoZXZlbnQpID0+IHRoaXMuX3JlbWVtYmVySW52b2tlcihldmVudClcbiAgICB0aGlzLl9vbkNsaWNrID0gKGV2ZW50KSA9PiB0aGlzLl9yZW1lbWJlckludm9rZXIoZXZlbnQpXG4gICAgdGhpcy5fb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigoKSA9PiB0aGlzLl9zeW5jKCkpXG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5fb25LZXlkb3duLCB0cnVlKVxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJkb3duJywgdGhpcy5fb25Qb2ludGVyZG93biwgdHJ1ZSlcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX29uQ2xpY2ssIHRydWUpXG4gICAgdGhpcy5fb2JzZXJ2ZXIub2JzZXJ2ZSh0aGlzLmVsLCB7XG4gICAgICBhdHRyaWJ1dGVzOiB0cnVlLFxuICAgICAgYXR0cmlidXRlRmlsdGVyOiBbJ2RhdGEtc3RhdGUnLCAnY2xhc3MnLCAnaGlkZGVuJywgJ2luZXJ0JywgJ2FyaWEtaGlkZGVuJywgJ3N0eWxlJ11cbiAgICB9KVxuXG4gICAgdGhpcy5lbC5kYXRhc2V0LnJlYWR5ID0gJ3RydWUnXG4gICAgdGhpcy5fc3luYygpXG4gIH0sXG5cbiAgX2ZpbmRQYW5lbCgpIHtcbiAgICByZXR1cm4gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKFtcbiAgICAgICdbZGF0YS1leG89XCJtb2RhbC1jb250ZW50XCJdJyxcbiAgICAgICdbZGF0YS1leG89XCJkcmF3ZXItY29udGVudFwiXScsXG4gICAgICAnW2RhdGEtZXhvPVwic2hlZXQtY29udGVudFwiXSdcbiAgICBdLmpvaW4oJywnKSlcbiAgfSxcblxuICBfZmluZENsb3NlKCkge1xuICAgIHJldHVybiB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoW1xuICAgICAgJ1tkYXRhLWV4bz1cIm1vZGFsLWNsb3NlXCJdJyxcbiAgICAgICdbZGF0YS1leG89XCJkcmF3ZXItY2xvc2VcIl0nLFxuICAgICAgJ1tkYXRhLWV4bz1cInNoZWV0LWNsb3NlXCJdJ1xuICAgIF0uam9pbignLCcpKVxuICB9LFxuXG4gIF9pc09wZW4oKSB7XG4gICAgaWYgKHRoaXMuZWwuZGF0YXNldC5zdGF0ZSkgcmV0dXJuIHRoaXMuZWwuZGF0YXNldC5zdGF0ZSA9PT0gJ29wZW4nXG4gICAgcmV0dXJuIHRoaXMuZWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdvcGVuJykgJiYgIXRoaXMuZWwuaGlkZGVuXG4gIH0sXG5cbiAgX3N5bmMoKSB7XG4gICAgY29uc3Qgb3BlbiA9IHRoaXMuX2lzT3BlbigpXG5cbiAgICBpZiAob3BlbiAmJiAhdGhpcy5faXNPcGVuQWN0aXZlKSB7XG4gICAgICB0aGlzLl9hY3RpdmF0ZSgpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZiAoIW9wZW4gJiYgdGhpcy5faXNPcGVuQWN0aXZlKSB7XG4gICAgICB0aGlzLl9kZWFjdGl2YXRlKClcbiAgICB9XG4gIH0sXG5cbiAgX2FjdGl2YXRlKCkge1xuICAgIHRoaXMuX2lzT3BlbkFjdGl2ZSA9IHRydWVcblxuICAgIGNvbnN0IGFjdGl2ZSA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCA/IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgOiBudWxsXG4gICAgY29uc3QgcHJldmlvdXNGb2N1cyA9IHRoaXMuX2lzUmVzdG9yZVRhcmdldCh0aGlzLl9wZW5kaW5nSW52b2tlcilcbiAgICAgID8gdGhpcy5fcGVuZGluZ0ludm9rZXJcbiAgICAgIDogYWN0aXZlXG5cbiAgICB0aGlzLl9wZW5kaW5nSW52b2tlciA9IG51bGxcbiAgICB0aGlzLl9wcmV2aW91c0ZvY3VzID0gdGhpcy5faXNSZXN0b3JlVGFyZ2V0KHByZXZpb3VzRm9jdXMpID8gcHJldmlvdXNGb2N1cyA6IG51bGxcblxuICAgIHRoaXMuZWwucmVtb3ZlQXR0cmlidXRlKCdpbmVydCcpXG4gICAgdGhpcy5lbC5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgJ2ZhbHNlJylcblxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICBjb25zdCB0YXJnZXQgPSB0aGlzLl9maXJzdEZvY3VzYWJsZSgpIHx8IHRoaXMuX3BhbmVsXG4gICAgICB0YXJnZXQ/LmZvY3VzPy4oeyBwcmV2ZW50U2Nyb2xsOiB0cnVlIH0pXG4gICAgfSlcbiAgfSxcblxuICBfZGVhY3RpdmF0ZSgpIHtcbiAgICB0aGlzLl9pc09wZW5BY3RpdmUgPSBmYWxzZVxuICAgIHRoaXMuZWwuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICd0cnVlJylcbiAgICB0aGlzLmVsLnNldEF0dHJpYnV0ZSgnaW5lcnQnLCAndHJ1ZScpXG5cbiAgICBjb25zdCB0YXJnZXQgPSB0aGlzLl9wcmV2aW91c0ZvY3VzXG4gICAgdGhpcy5fcHJldmlvdXNGb2N1cyA9IG51bGxcblxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICBpZiAodGFyZ2V0ICYmIHRhcmdldC5pc0Nvbm5lY3RlZCkgdGFyZ2V0LmZvY3VzKHsgcHJldmVudFNjcm9sbDogdHJ1ZSB9KVxuICAgIH0pXG4gIH0sXG5cbiAgX2ZvY3VzYWJsZXMoKSB7XG4gICAgaWYgKCF0aGlzLl9wYW5lbCkgcmV0dXJuIFtdXG5cbiAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLl9wYW5lbC5xdWVyeVNlbGVjdG9yQWxsKGZvY3VzYWJsZVNlbGVjdG9yKSkuZmlsdGVyKChlbGVtZW50KSA9PiB7XG4gICAgICBpZiAoIShlbGVtZW50IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKSByZXR1cm4gZmFsc2VcbiAgICAgIGlmIChlbGVtZW50LmhpZGRlbiB8fCBlbGVtZW50LmdldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nKSA9PT0gJ3RydWUnKSByZXR1cm4gZmFsc2VcbiAgICAgIGlmIChlbGVtZW50LmNsb3Nlc3QoJ1toaWRkZW5dLFtpbmVydF0nKSkgcmV0dXJuIGZhbHNlXG4gICAgICByZXR1cm4gQm9vbGVhbihlbGVtZW50Lm9mZnNldFdpZHRoIHx8IGVsZW1lbnQub2Zmc2V0SGVpZ2h0IHx8IGVsZW1lbnQuZ2V0Q2xpZW50UmVjdHMoKS5sZW5ndGgpXG4gICAgfSlcbiAgfSxcblxuICBfZmlyc3RGb2N1c2FibGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2ZvY3VzYWJsZXMoKVswXSB8fCBudWxsXG4gIH0sXG5cbiAgX2hhbmRsZUtleWRvd24oZXZlbnQpIHtcbiAgICBpZiAoIXRoaXMuX2lzT3BlbigpKSByZXR1cm5cblxuICAgIGlmIChldmVudC5rZXkgPT09ICdFc2NhcGUnKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgdGhpcy5fY2xvc2U/LmNsaWNrPy4oKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaWYgKGV2ZW50LmtleSAhPT0gJ1RhYicpIHJldHVyblxuXG4gICAgY29uc3QgZm9jdXNhYmxlcyA9IHRoaXMuX2ZvY3VzYWJsZXMoKVxuXG4gICAgaWYgKGZvY3VzYWJsZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICB0aGlzLl9wYW5lbD8uZm9jdXM/Lih7IHByZXZlbnRTY3JvbGw6IHRydWUgfSlcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IGZpcnN0ID0gZm9jdXNhYmxlc1swXVxuICAgIGNvbnN0IGxhc3QgPSBmb2N1c2FibGVzW2ZvY3VzYWJsZXMubGVuZ3RoIC0gMV1cbiAgICBjb25zdCBhY3RpdmUgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50XG5cbiAgICBpZiAoZXZlbnQuc2hpZnRLZXkgJiYgKGFjdGl2ZSA9PT0gZmlyc3QgfHwgIXRoaXMuX3BhbmVsLmNvbnRhaW5zKGFjdGl2ZSkpKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBsYXN0LmZvY3VzKHsgcHJldmVudFNjcm9sbDogdHJ1ZSB9KVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaWYgKCFldmVudC5zaGlmdEtleSAmJiBhY3RpdmUgPT09IGxhc3QpIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgIGZpcnN0LmZvY3VzKHsgcHJldmVudFNjcm9sbDogdHJ1ZSB9KVxuICAgIH1cbiAgfSxcblxuICBfcmVtZW1iZXJJbnZva2VyKGV2ZW50KSB7XG4gICAgaWYgKHRoaXMuX2lzT3BlbigpKSByZXR1cm5cblxuICAgIGNvbnN0IHRhcmdldCA9IGV2ZW50LnRhcmdldCBpbnN0YW5jZW9mIEVsZW1lbnRcbiAgICAgID8gZXZlbnQudGFyZ2V0LmNsb3Nlc3QoZm9jdXNhYmxlU2VsZWN0b3IpXG4gICAgICA6IG51bGxcblxuICAgIGlmICh0aGlzLl9pc1Jlc3RvcmVUYXJnZXQodGFyZ2V0KSkgdGhpcy5fcGVuZGluZ0ludm9rZXIgPSB0YXJnZXRcbiAgfSxcblxuICBfaXNSZXN0b3JlVGFyZ2V0KGVsZW1lbnQpIHtcbiAgICBpZiAoIShlbGVtZW50IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKSByZXR1cm4gZmFsc2VcbiAgICBpZiAoIWVsZW1lbnQuaXNDb25uZWN0ZWQgfHwgdGhpcy5lbC5jb250YWlucyhlbGVtZW50KSkgcmV0dXJuIGZhbHNlXG4gICAgaWYgKGVsZW1lbnQuY2xvc2VzdCgnW2hpZGRlbl0sW2luZXJ0XScpKSByZXR1cm4gZmFsc2VcbiAgICBpZiAoZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ2Rpc2FibGVkJykgfHwgZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2FyaWEtZGlzYWJsZWQnKSA9PT0gJ3RydWUnKSByZXR1cm4gZmFsc2VcbiAgICBpZiAoIWVsZW1lbnQubWF0Y2hlcyhmb2N1c2FibGVTZWxlY3RvcikpIHJldHVybiBmYWxzZVxuICAgIHJldHVybiB0cnVlXG4gIH0sXG5cbiAgX3VuYmluZCgpIHtcbiAgICBpZiAodGhpcy5fb2JzZXJ2ZXIpIHRoaXMuX29ic2VydmVyLmRpc2Nvbm5lY3QoKVxuICAgIGlmICh0aGlzLl9vbktleWRvd24pIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLl9vbktleWRvd24sIHRydWUpXG4gICAgaWYgKHRoaXMuX29uUG9pbnRlcmRvd24pIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJkb3duJywgdGhpcy5fb25Qb2ludGVyZG93biwgdHJ1ZSlcbiAgICBpZiAodGhpcy5fb25DbGljaykgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9vbkNsaWNrLCB0cnVlKVxuICAgIGlmICh0aGlzLmVsKSBkZWxldGUgdGhpcy5lbC5kYXRhc2V0LnJlYWR5XG5cbiAgICB0aGlzLl9vYnNlcnZlciA9IG51bGxcbiAgICB0aGlzLl9vbktleWRvd24gPSBudWxsXG4gICAgdGhpcy5fb25Qb2ludGVyZG93biA9IG51bGxcbiAgICB0aGlzLl9vbkNsaWNrID0gbnVsbFxuICAgIHRoaXMuX3BhbmVsID0gbnVsbFxuICAgIHRoaXMuX2Nsb3NlID0gbnVsbFxuICB9XG59XG5cbmV4cG9ydCB7IEV4b092ZXJsYXkgfVxuIiwgImNvbnN0IEV4b1RhYnMgPSB7XG4gIG1vdW50ZWQoKSB7IHRoaXMuX2JpbmQoKSB9LFxuICB1cGRhdGVkKCkgeyB0aGlzLl9iaW5kKCkgfSxcbiAgZGVzdHJveWVkKCkgeyB0aGlzLl91bmJpbmQoKSB9LFxuXG4gIF9iaW5kKCkge1xuICAgIHRoaXMuX3VuYmluZCgpXG4gICAgdGhpcy5lbC5zZXRBdHRyaWJ1dGUoJ2RhdGEtcmVhZHknLCAnJylcbiAgICB0aGlzLl9zeW5jVGFicygpXG5cbiAgICB0aGlzLl9vbkNsaWNrID0gKGUpID0+IHtcbiAgICAgIGNvbnN0IHRhYiA9IGUudGFyZ2V0LmNsb3Nlc3QoJ1tyb2xlPVwidGFiXCJdJylcbiAgICAgIGlmICghdGFiIHx8ICF0aGlzLmVsLmNvbnRhaW5zKHRhYikgfHwgIXRoaXMuX2lzRGlzYWJsZWQodGFiKSkgcmV0dXJuXG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKClcbiAgICB9XG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX29uQ2xpY2spXG5cbiAgICB0aGlzLl9vbktleWRvd24gPSAoZSkgPT4ge1xuICAgICAgY29uc3QgdGFiID0gZS50YXJnZXQuY2xvc2VzdCgnW3JvbGU9XCJ0YWJcIl0nKVxuICAgICAgaWYgKCF0YWIgfHwgIXRoaXMuZWwuY29udGFpbnModGFiKSB8fCB0aGlzLl9pc0Rpc2FibGVkKHRhYikpIHJldHVyblxuXG4gICAgICBpZiAoZS5rZXkgPT09ICdFbnRlcicgfHwgZS5rZXkgPT09ICcgJyB8fCBlLmtleSA9PT0gJ1NwYWNlYmFyJykge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgdGhpcy5fYWN0aXZhdGUodGFiKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgY29uc3QgdGFicyA9IHRoaXMuX3RhYnMoKVxuICAgICAgaWYgKCF0YWJzLmxlbmd0aCkgcmV0dXJuXG5cbiAgICAgIGNvbnN0IGN1cnJlbnQgPSB0YWJzLmluZGV4T2YodGFiKVxuICAgICAgaWYgKGN1cnJlbnQgPT09IC0xKSByZXR1cm5cblxuICAgICAgY29uc3QgdmVydGljYWwgPSB0aGlzLmVsLmRhdGFzZXQub3JpZW50YXRpb24gPT09ICd2ZXJ0aWNhbCdcbiAgICAgIGxldCBuZXh0ID0gLTFcblxuICAgICAgc3dpdGNoIChlLmtleSkge1xuICAgICAgICBjYXNlICdBcnJvd1JpZ2h0JzpcbiAgICAgICAgICBpZiAodmVydGljYWwpIHJldHVyblxuICAgICAgICAgIG5leHQgPSBjdXJyZW50IDwgdGFicy5sZW5ndGggLSAxID8gY3VycmVudCArIDEgOiAwXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAnQXJyb3dMZWZ0JzpcbiAgICAgICAgICBpZiAodmVydGljYWwpIHJldHVyblxuICAgICAgICAgIG5leHQgPSBjdXJyZW50ID4gMCA/IGN1cnJlbnQgLSAxIDogdGFicy5sZW5ndGggLSAxXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAnQXJyb3dEb3duJzpcbiAgICAgICAgICBpZiAoIXZlcnRpY2FsKSByZXR1cm5cbiAgICAgICAgICBuZXh0ID0gY3VycmVudCA8IHRhYnMubGVuZ3RoIC0gMSA/IGN1cnJlbnQgKyAxIDogMFxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgJ0Fycm93VXAnOlxuICAgICAgICAgIGlmICghdmVydGljYWwpIHJldHVyblxuICAgICAgICAgIG5leHQgPSBjdXJyZW50ID4gMCA/IGN1cnJlbnQgLSAxIDogdGFicy5sZW5ndGggLSAxXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAnSG9tZSc6XG4gICAgICAgICAgbmV4dCA9IDBcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlICdFbmQnOlxuICAgICAgICAgIG5leHQgPSB0YWJzLmxlbmd0aCAtIDFcbiAgICAgICAgICBicmVha1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIHRoaXMuX2ZvY3VzVGFiKHRhYnNbbmV4dF0pXG4gICAgICBpZiAodGhpcy5lbC5kYXRhc2V0LmFjdGl2YXRpb24gPT09ICdhdXRvbWF0aWMnKSB0aGlzLl9hY3RpdmF0ZSh0YWJzW25leHRdKVxuICAgIH1cbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLl9vbktleWRvd24pXG4gIH0sXG5cbiAgX2FsbFRhYnMoKSB7XG4gICAgcmV0dXJuIFsuLi50aGlzLmVsLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tyb2xlPVwidGFiXCJdJyldXG4gIH0sXG5cbiAgX3RhYnMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2FsbFRhYnMoKS5maWx0ZXIoKHRhYikgPT4gIXRoaXMuX2lzRGlzYWJsZWQodGFiKSlcbiAgfSxcblxuICBfaXNEaXNhYmxlZCh0YWIpIHtcbiAgICByZXR1cm4gdGFiLmhhc0F0dHJpYnV0ZSgnZGF0YS1kaXNhYmxlZCcpIHx8XG4gICAgICB0YWIuZ2V0QXR0cmlidXRlKCdhcmlhLWRpc2FibGVkJykgPT09ICd0cnVlJyB8fFxuICAgICAgdGFiLmRpc2FibGVkXG4gIH0sXG5cbiAgX3N5bmNUYWJzKCkge1xuICAgIGNvbnN0IHRhYnMgPSB0aGlzLl90YWJzKClcbiAgICBjb25zdCBzZWxlY3RlZCA9IHRhYnMuZmluZCgodGFiKSA9PiB0YWIuZ2V0QXR0cmlidXRlKCdhcmlhLXNlbGVjdGVkJykgPT09ICd0cnVlJykgfHwgdGFic1swXVxuICAgIHRoaXMuX2FsbFRhYnMoKS5mb3JFYWNoKCh0YWIpID0+IHtcbiAgICAgIHRhYi5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgdGFiID09PSBzZWxlY3RlZCA/ICcwJyA6ICctMScpXG4gICAgfSlcbiAgfSxcblxuICBfZm9jdXNUYWIodGFiKSB7XG4gICAgaWYgKCF0YWIpIHJldHVyblxuICAgIHRoaXMuX2FsbFRhYnMoKS5mb3JFYWNoKChpdGVtKSA9PiBpdGVtLnNldEF0dHJpYnV0ZSgndGFiaW5kZXgnLCBpdGVtID09PSB0YWIgPyAnMCcgOiAnLTEnKSlcbiAgICB0YWIuZm9jdXMoKVxuICB9LFxuXG4gIF9hY3RpdmF0ZSh0YWIpIHtcbiAgICBpZiAoIXRhYiB8fCB0aGlzLl9pc0Rpc2FibGVkKHRhYikpIHJldHVyblxuICAgIHRhYi5jbGljaygpXG4gIH0sXG5cbiAgX3VuYmluZCgpIHtcbiAgICBpZiAodGhpcy5fb25DbGljaykgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX29uQ2xpY2spXG4gICAgaWYgKHRoaXMuX29uS2V5ZG93bikgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5fb25LZXlkb3duKVxuICAgIGlmICh0aGlzLmVsKSB0aGlzLmVsLnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS1yZWFkeScpXG4gICAgdGhpcy5fb25DbGljayA9IG51bGxcbiAgICB0aGlzLl9vbktleWRvd24gPSBudWxsXG4gIH1cbn1cblxuZXhwb3J0IHsgRXhvVGFicyB9XG4iLCAiaW1wb3J0IHsgRXhvQWNjb3JkaW9uIH0gZnJvbSAnLi9ob29rcy9hY2NvcmRpb24uanMnXG5pbXBvcnQgeyBFeG9DYXJvdXNlbCB9IGZyb20gJy4vaG9va3MvY2Fyb3VzZWwuanMnXG5pbXBvcnQgeyBFeG9Db2xsYXBzaWJsZSB9IGZyb20gJy4vaG9va3MvY29sbGFwc2libGUuanMnXG5pbXBvcnQgeyBFeG9Db21tYW5kUGFsZXR0ZSB9IGZyb20gJy4vaG9va3MvY29tbWFuZF9wYWxldHRlLmpzJ1xuaW1wb3J0IHsgRXhvU2lkZWJhciB9IGZyb20gJy4vaG9va3Mvc2lkZWJhci5qcydcbmltcG9ydCB7IEV4b1RoZW1lVG9nZ2xlIH0gZnJvbSAnLi9ob29rcy90aGVtZV90b2dnbGUuanMnXG5pbXBvcnQgeyBFeG9Qb3BvdmVyIH0gZnJvbSAnLi9ob29rcy9wb3BvdmVyLmpzJ1xuaW1wb3J0IHsgRXhvRHJvcGRvd25NZW51IH0gZnJvbSAnLi9ob29rcy9kcm9wZG93bl9tZW51LmpzJ1xuaW1wb3J0IHsgRXhvU2VsZWN0IH0gZnJvbSAnLi9ob29rcy9zZWxlY3QuanMnXG5pbXBvcnQgeyBFeG9Db21ib2JveCB9IGZyb20gJy4vaG9va3MvY29tYm9ib3guanMnXG5pbXBvcnQgeyBFeG9Ub29sdGlwIH0gZnJvbSAnLi9ob29rcy90b29sdGlwLmpzJ1xuaW1wb3J0IHsgRXhvSG92ZXJDYXJkIH0gZnJvbSAnLi9ob29rcy9ob3Zlcl9jYXJkLmpzJ1xuaW1wb3J0IHsgRXhvQ29udGV4dE1lbnUgfSBmcm9tICcuL2hvb2tzL2NvbnRleHRfbWVudS5qcydcbmltcG9ydCB7IEV4b1JhdGluZyB9IGZyb20gJy4vaG9va3MvcmF0aW5nLmpzJ1xuaW1wb3J0IHsgRXhvTWVudWJhciB9IGZyb20gJy4vaG9va3MvbWVudWJhci5qcydcbmltcG9ydCB7IEV4b092ZXJsYXkgfSBmcm9tICcuL2hvb2tzL292ZXJsYXkuanMnXG5pbXBvcnQgeyBFeG9UYWJzIH0gZnJvbSAnLi9ob29rcy90YWJzLmpzJ1xuXG5jb25zdCBob29rcyA9IHtcbiAgRXhvQWNjb3JkaW9uLFxuICBFeG9DYXJvdXNlbCxcbiAgRXhvQ29sbGFwc2libGUsXG4gIEV4b0NvbW1hbmRQYWxldHRlLFxuICBFeG9TaWRlYmFyLFxuICBFeG9UaGVtZVRvZ2dsZSxcbiAgRXhvUG9wb3ZlcixcbiAgRXhvRHJvcGRvd25NZW51LFxuICBFeG9TZWxlY3QsXG4gIEV4b0NvbWJvYm94LFxuICBFeG9Ub29sdGlwLFxuICBFeG9Ib3ZlckNhcmQsXG4gIEV4b0NvbnRleHRNZW51LFxuICBFeG9SYXRpbmcsXG4gIEV4b01lbnViYXIsXG4gIEV4b092ZXJsYXksXG4gIEV4b1RhYnNcbn1cblxuZXhwb3J0IHsgaG9va3MgfVxuIiwgImltcG9ydCB7IGhvb2tzIGFzIGV4b0hvb2tzIH0gZnJvbSBcIi4uLy4uLy4uL2Fzc2V0cy9qcy9pbmRleC5qc1wiXG5cbndpbmRvdy5zdG9yeWJvb2sgPSB7XG4gIEhvb2tzOiBleG9Ib29rcyxcbiAgUGFyYW1zOiB7fSxcbiAgVXBsb2FkZXJzOiB7fVxufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7QUFhQSxNQUFNLGVBQWU7QUFBQSxJQUNuQixVQUFVO0FBQ1IsV0FBSyxZQUFZLE1BQ2YsTUFBTSxLQUFLLEtBQUssR0FBRyxpQkFBaUIsZ0RBQWdELENBQUM7QUFFdkYsV0FBSyxjQUFjLE1BQ2pCLE1BQU0sS0FBSyxLQUFLLEdBQUcsaUJBQWlCLDhDQUE4QyxDQUFDO0FBRXJGLFdBQUssWUFBWSxNQUFNLEtBQUssR0FBRyxRQUFRLFNBQVM7QUFDaEQsV0FBSyxpQkFBaUIsTUFBTSxLQUFLLEdBQUcsYUFBYSxrQkFBa0I7QUFHbkUsV0FBSyxHQUFHLGlCQUFpQixX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
