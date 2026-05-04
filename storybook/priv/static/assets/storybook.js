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
      this._apply(this._current());
      this.el.setAttribute("data-ready", "");
      this._onClick = (e) => {
        const btn = e.target.closest("[data-theme-value]");
        if (!btn || !this.el.contains(btn)) return;
        const value = btn.getAttribute("data-theme-value");
        this._apply(value);
        localStorage.setItem("exo-theme", value);
      };
      this.el.addEventListener("click", this._onClick);
    },
    _unbind() {
      if (this._onClick) this.el.removeEventListener("click", this._onClick);
      if (this.el) this.el.removeAttribute("data-ready");
      this._onClick = null;
    },
    _current() {
      return localStorage.getItem("exo-theme") || "system";
    },
    _apply(theme) {
      const root = document.documentElement;
      this.el.querySelectorAll("[data-theme-value]").forEach((btn) => {
        const active = btn.getAttribute("data-theme-value") === theme;
        btn.toggleAttribute("data-active", active);
        btn.setAttribute("aria-pressed", active ? "true" : "false");
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vYXNzZXRzL2pzL2hvb2tzL2FjY29yZGlvbi5qcyIsICIuLi8uLi8uLi8uLi9hc3NldHMvanMvaG9va3MvY2Fyb3VzZWwuanMiLCAiLi4vLi4vLi4vLi4vYXNzZXRzL2pzL2hvb2tzL2NvbGxhcHNpYmxlLmpzIiwgIi4uLy4uLy4uLy4uL2Fzc2V0cy9qcy9ob29rcy9jb21tYW5kX3BhbGV0dGUuanMiLCAiLi4vLi4vLi4vLi4vYXNzZXRzL2pzL2hvb2tzL3NpZGViYXIuanMiLCAiLi4vLi4vLi4vLi4vYXNzZXRzL2pzL2hvb2tzL3RoZW1lX3RvZ2dsZS5qcyIsICIuLi8uLi8uLi8uLi9hc3NldHMvanMvaG9va3MvcG9wb3Zlci5qcyIsICIuLi8uLi8uLi8uLi9hc3NldHMvanMvaG9va3MvZHJvcGRvd25fbWVudS5qcyIsICIuLi8uLi8uLi8uLi9hc3NldHMvanMvaG9va3Mvc2VsZWN0LmpzIiwgIi4uLy4uLy4uLy4uL2Fzc2V0cy9qcy9ob29rcy9jb21ib2JveC5qcyIsICIuLi8uLi8uLi8uLi9hc3NldHMvanMvaG9va3MvdG9vbHRpcC5qcyIsICIuLi8uLi8uLi8uLi9hc3NldHMvanMvaG9va3MvaG92ZXJfY2FyZC5qcyIsICIuLi8uLi8uLi8uLi9hc3NldHMvanMvaG9va3MvY29udGV4dF9tZW51LmpzIiwgIi4uLy4uLy4uLy4uL2Fzc2V0cy9qcy9ob29rcy9yYXRpbmcuanMiLCAiLi4vLi4vLi4vLi4vYXNzZXRzL2pzL2hvb2tzL21lbnViYXIuanMiLCAiLi4vLi4vLi4vLi4vYXNzZXRzL2pzL2hvb2tzL292ZXJsYXkuanMiLCAiLi4vLi4vLi4vLi4vYXNzZXRzL2pzL2hvb2tzL3RhYnMuanMiLCAiLi4vLi4vLi4vLi4vYXNzZXRzL2pzL2luZGV4LmpzIiwgIi4uLy4uLy4uL2Fzc2V0cy9qcy9zdG9yeWJvb2suanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKlxuICogRXhvQWNjb3JkaW9uIGhvb2sgXHUyMDE0IGtleWJvYXJkIG5hdmlnYXRpb24gKyBzaW5nbGUtb3BlbiBlbmZvcmNlbWVudC5cbiAqXG4gKiBSZWFkcyBkYXRhLXR5cGUgKFwic2luZ2xlXCJ8XCJtdWx0aXBsZVwiKSBhbmQgZGF0YS1jb2xsYXBzaWJsZSBmcm9tIHRoZSByb290IGVsZW1lbnQuXG4gKiAtIHNpbmdsZTogb25seSBvbmUgaXRlbSBvcGVuIGF0IGEgdGltZVxuICogLSBtdWx0aXBsZTogYW55IG51bWJlciBvZiBpdGVtcyBvcGVuIChkZWZhdWx0IGNoZWNrYm94IGJlaGF2aW9yKVxuICogLSBjb2xsYXBzaWJsZTogaW4gc2luZ2xlIG1vZGUsIGFsbG93cyBjbG9zaW5nIHRoZSBvcGVuIGl0ZW1cbiAqXG4gKiBLZXlib2FyZDpcbiAqICAgQXJyb3dEb3duIC8gQXJyb3dVcCBcdTIwMTQgbW92ZSBmb2N1cyBiZXR3ZWVuIHRyaWdnZXJzXG4gKiAgIEhvbWUgLyBFbmQgXHUyMDE0IGZvY3VzIGZpcnN0IC8gbGFzdCB0cmlnZ2VyXG4gKiAgIEVudGVyIC8gU3BhY2UgXHUyMDE0IHRvZ2dsZSBpdGVtIChoYW5kbGVkIG5hdGl2ZWx5IGJ5IGJ1dHRvbiwgYnV0IHdlIG1hbmFnZSBzaW5nbGUtbW9kZSlcbiAqL1xuY29uc3QgRXhvQWNjb3JkaW9uID0ge1xuICBtb3VudGVkKCkge1xuICAgIHRoaXMuX3RyaWdnZXJzID0gKCkgPT5cbiAgICAgIEFycmF5LmZyb20odGhpcy5lbC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1leG89XCJhY2NvcmRpb24tdHJpZ2dlclwiXTpub3QoW2Rpc2FibGVkXSknKSlcblxuICAgIHRoaXMuX2NoZWNrYm94ZXMgPSAoKSA9PlxuICAgICAgQXJyYXkuZnJvbSh0aGlzLmVsLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWV4bz1cImFjY29yZGlvbi1zdGF0ZVwiXTpub3QoW2Rpc2FibGVkXSknKSlcblxuICAgIHRoaXMuX2lzU2luZ2xlID0gKCkgPT4gdGhpcy5lbC5kYXRhc2V0LnR5cGUgPT09IFwic2luZ2xlXCJcbiAgICB0aGlzLl9pc0NvbGxhcHNpYmxlID0gKCkgPT4gdGhpcy5lbC5oYXNBdHRyaWJ1dGUoXCJkYXRhLWNvbGxhcHNpYmxlXCIpXG5cbiAgICAvLyBLZXlib2FyZCBuYXZpZ2F0aW9uXG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCB0aGlzLl9vbktleWRvd24gPSAoZSkgPT4ge1xuICAgICAgY29uc3QgdHJpZ2dlciA9IGUudGFyZ2V0LmNsb3Nlc3QoJ1tkYXRhLWV4bz1cImFjY29yZGlvbi10cmlnZ2VyXCJdJylcbiAgICAgIGlmICghdHJpZ2dlcikgcmV0dXJuXG5cbiAgICAgIGNvbnN0IHRyaWdnZXJzID0gdGhpcy5fdHJpZ2dlcnMoKVxuICAgICAgY29uc3QgaWR4ID0gdHJpZ2dlcnMuaW5kZXhPZih0cmlnZ2VyKVxuICAgICAgaWYgKGlkeCA9PT0gLTEpIHJldHVyblxuXG4gICAgICBsZXQgdGFyZ2V0ID0gbnVsbFxuXG4gICAgICBzd2l0Y2ggKGUua2V5KSB7XG4gICAgICAgIGNhc2UgXCJBcnJvd0Rvd25cIjpcbiAgICAgICAgICB0YXJnZXQgPSB0cmlnZ2Vyc1soaWR4ICsgMSkgJSB0cmlnZ2Vycy5sZW5ndGhdXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSBcIkFycm93VXBcIjpcbiAgICAgICAgICB0YXJnZXQgPSB0cmlnZ2Vyc1soaWR4IC0gMSArIHRyaWdnZXJzLmxlbmd0aCkgJSB0cmlnZ2Vycy5sZW5ndGhdXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSBcIkhvbWVcIjpcbiAgICAgICAgICB0YXJnZXQgPSB0cmlnZ2Vyc1swXVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgXCJFbmRcIjpcbiAgICAgICAgICB0YXJnZXQgPSB0cmlnZ2Vyc1t0cmlnZ2Vycy5sZW5ndGggLSAxXVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGlmICh0YXJnZXQpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIHRhcmdldC5mb2N1cygpXG4gICAgICB9XG4gICAgfSlcblxuICAgIC8vIENsaWNrIGhhbmRsaW5nIGZvciBzaW5nbGUgbW9kZSArIGNvbGxhcHNpYmxlICsgYXJpYS1leHBhbmRlZCBzeW5jXG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5fb25DbGljayA9IChlKSA9PiB7XG4gICAgICBjb25zdCB0cmlnZ2VyID0gZS50YXJnZXQuY2xvc2VzdCgnW2RhdGEtZXhvPVwiYWNjb3JkaW9uLXRyaWdnZXJcIl0nKVxuICAgICAgaWYgKCF0cmlnZ2VyIHx8IHRyaWdnZXIuZGlzYWJsZWQpIHJldHVyblxuXG4gICAgICBjb25zdCBpdGVtID0gdHJpZ2dlci5jbG9zZXN0KCdbZGF0YS1leG89XCJhY2NvcmRpb24taXRlbVwiXScpXG4gICAgICBjb25zdCBjaGVja2JveCA9IGl0ZW0/LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cImFjY29yZGlvbi1zdGF0ZVwiXScpXG4gICAgICBpZiAoIWNoZWNrYm94KSByZXR1cm5cblxuICAgICAgY29uc3Qgd2FzQ2hlY2tlZCA9IGNoZWNrYm94LmNoZWNrZWRcblxuICAgICAgaWYgKHRoaXMuX2lzU2luZ2xlKCkpIHtcbiAgICAgICAgaWYgKHdhc0NoZWNrZWQgJiYgdGhpcy5faXNDb2xsYXBzaWJsZSgpKSB7XG4gICAgICAgICAgLy8gQ2xvc2UgdGhpcyBpdGVtXG4gICAgICAgICAgY2hlY2tib3guY2hlY2tlZCA9IGZhbHNlXG4gICAgICAgICAgdGhpcy5fc3luY0FyaWEodHJpZ2dlciwgZmFsc2UpXG4gICAgICAgIH0gZWxzZSBpZiAod2FzQ2hlY2tlZCAmJiAhdGhpcy5faXNDb2xsYXBzaWJsZSgpKSB7XG4gICAgICAgICAgLy8gS2VlcCBvcGVuLCBwcmV2ZW50IHRvZ2dsZVxuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIENsb3NlIGFsbCBvdGhlcnMsIG9wZW4gdGhpcyBvbmVcbiAgICAgICAgICB0aGlzLl9jaGVja2JveGVzKCkuZm9yRWFjaCgoY2IpID0+IHtcbiAgICAgICAgICAgIGlmIChjYiAhPT0gY2hlY2tib3ggJiYgY2IuY2hlY2tlZCkge1xuICAgICAgICAgICAgICBjYi5jaGVja2VkID0gZmFsc2VcbiAgICAgICAgICAgICAgY29uc3Qgb3RoZXJUcmlnZ2VyID0gY2IucGFyZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJhY2NvcmRpb24tdHJpZ2dlclwiXScpXG4gICAgICAgICAgICAgIGlmIChvdGhlclRyaWdnZXIpIHRoaXMuX3N5bmNBcmlhKG90aGVyVHJpZ2dlciwgZmFsc2UpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgICBjaGVja2JveC5jaGVja2VkID0gdHJ1ZVxuICAgICAgICAgIHRoaXMuX3N5bmNBcmlhKHRyaWdnZXIsIHRydWUpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIE11bHRpcGxlIG1vZGUgXHUyMDE0IGp1c3QgdG9nZ2xlXG4gICAgICAgIGNoZWNrYm94LmNoZWNrZWQgPSAhd2FzQ2hlY2tlZFxuICAgICAgICB0aGlzLl9zeW5jQXJpYSh0cmlnZ2VyLCBjaGVja2JveC5jaGVja2VkKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICAvLyBTeW5jIGluaXRpYWwgYXJpYSBzdGF0ZXNcbiAgICB0aGlzLl9zeW5jQWxsQXJpYSgpXG4gIH0sXG5cbiAgdXBkYXRlZCgpIHtcbiAgICB0aGlzLl9zeW5jQWxsQXJpYSgpXG4gIH0sXG5cbiAgZGVzdHJveWVkKCkge1xuICAgIGlmICh0aGlzLl9vbktleWRvd24pIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5fb25LZXlkb3duKVxuICAgIGlmICh0aGlzLl9vbkNsaWNrKSB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLl9vbkNsaWNrKVxuICB9LFxuXG4gIF9zeW5jQXJpYSh0cmlnZ2VyLCBleHBhbmRlZCkge1xuICAgIHRyaWdnZXIuc2V0QXR0cmlidXRlKFwiYXJpYS1leHBhbmRlZFwiLCBTdHJpbmcoZXhwYW5kZWQpKVxuICB9LFxuXG4gIF9zeW5jQWxsQXJpYSgpIHtcbiAgICBjb25zdCBpdGVtcyA9IHRoaXMuZWwucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZXhvPVwiYWNjb3JkaW9uLWl0ZW1cIl0nKVxuICAgIGl0ZW1zLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgIGNvbnN0IGNoZWNrYm94ID0gaXRlbS5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJhY2NvcmRpb24tc3RhdGVcIl0nKVxuICAgICAgY29uc3QgdHJpZ2dlciA9IGl0ZW0ucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwiYWNjb3JkaW9uLXRyaWdnZXJcIl0nKVxuICAgICAgaWYgKGNoZWNrYm94ICYmIHRyaWdnZXIpIHtcbiAgICAgICAgdGhpcy5fc3luY0FyaWEodHJpZ2dlciwgY2hlY2tib3guY2hlY2tlZClcbiAgICAgIH1cbiAgICB9KVxuICB9XG59XG5cbmV4cG9ydCB7IEV4b0FjY29yZGlvbiB9XG4iLCAiLyoqXG4gKiBFeG9DYXJvdXNlbCBob29rIFx1MjAxNCBzY3JvbGxhYmxlIGNhcm91c2VsIHdpdGggcHJldi9uZXh0IGJ1dHRvbnMuXG4gKi9cbmNvbnN0IEV4b0Nhcm91c2VsID0ge1xuICBtb3VudGVkKCkge1xuICAgIHRoaXMudHJhY2sgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cImNhcm91c2VsLXRyYWNrXCJdJylcbiAgICB0aGlzLnZpZXdwb3J0ID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJjYXJvdXNlbC12aWV3cG9ydFwiXScpXG4gICAgdGhpcy5wcmV2ID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJjYXJvdXNlbC1wcmV2XCJdJylcbiAgICB0aGlzLm5leHQgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cImNhcm91c2VsLW5leHRcIl0nKVxuICAgIGlmICghdGhpcy50cmFjayB8fCAhdGhpcy52aWV3cG9ydCkgcmV0dXJuXG5cbiAgICBjb25zdCBzbGlkZXMgPSAoKSA9PiBBcnJheS5mcm9tKHRoaXMudHJhY2sucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZXhvPVwiY2Fyb3VzZWwtc2xpZGVcIl0nKSlcbiAgICBjb25zdCBsb29wID0gdGhpcy5lbC5oYXNBdHRyaWJ1dGUoXCJkYXRhLWxvb3BcIilcbiAgICBjb25zdCBhdFN0YXJ0ID0gKCkgPT4gdGhpcy52aWV3cG9ydC5zY3JvbGxMZWZ0IDw9IDVcbiAgICBjb25zdCBhdEVuZCA9ICgpID0+IHRoaXMudmlld3BvcnQuc2Nyb2xsTGVmdCA+PSB0aGlzLnZpZXdwb3J0LnNjcm9sbFdpZHRoIC0gdGhpcy52aWV3cG9ydC5vZmZzZXRXaWR0aCAtIDVcblxuICAgIGNvbnN0IHNldEJ1dHRvblN0YXRlID0gKGJ1dHRvbiwgZGlzYWJsZWQpID0+IHtcbiAgICAgIGlmICghYnV0dG9uKSByZXR1cm5cbiAgICAgIGJ1dHRvbi5kaXNhYmxlZCA9IGRpc2FibGVkXG4gICAgICBidXR0b24udG9nZ2xlQXR0cmlidXRlKFwiZGF0YS1kaXNhYmxlZFwiLCBkaXNhYmxlZClcbiAgICAgIGJ1dHRvbi5zZXRBdHRyaWJ1dGUoXCJhcmlhLWRpc2FibGVkXCIsIGRpc2FibGVkID8gXCJ0cnVlXCIgOiBcImZhbHNlXCIpXG4gICAgfVxuXG4gICAgY29uc3QgdXBkYXRlQ29udHJvbHMgPSAoKSA9PiB7XG4gICAgICBpZiAobG9vcCkge1xuICAgICAgICBzZXRCdXR0b25TdGF0ZSh0aGlzLnByZXYsIGZhbHNlKVxuICAgICAgICBzZXRCdXR0b25TdGF0ZSh0aGlzLm5leHQsIGZhbHNlKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgc2V0QnV0dG9uU3RhdGUodGhpcy5wcmV2LCBhdFN0YXJ0KCkpXG4gICAgICBzZXRCdXR0b25TdGF0ZSh0aGlzLm5leHQsIGF0RW5kKCkpXG4gICAgfVxuXG4gICAgY29uc3Qgc2Nyb2xsVG8gPSAoZGlyZWN0aW9uKSA9PiB7XG4gICAgICBjb25zdCBzID0gc2xpZGVzKClcbiAgICAgIGlmIChzLmxlbmd0aCA9PT0gMCkgcmV0dXJuXG4gICAgICBjb25zdCBzbGlkZVdpZHRoID0gc1swXS5vZmZzZXRXaWR0aFxuICAgICAgY29uc3QgZ2FwID0gcGFyc2VGbG9hdChnZXRDb21wdXRlZFN0eWxlKHRoaXMudHJhY2spLmdhcCkgfHwgMFxuICAgICAgY29uc3Qgc2Nyb2xsQW1vdW50ID0gc2xpZGVXaWR0aCArIGdhcFxuXG4gICAgICBpZiAoZGlyZWN0aW9uID09PSBcIm5leHRcIikge1xuICAgICAgICBpZiAobG9vcCAmJiBhdEVuZCgpKSB7XG4gICAgICAgICAgdGhpcy52aWV3cG9ydC5zY3JvbGxUbyh7IGxlZnQ6IDAsIGJlaGF2aW9yOiBcInNtb290aFwiIH0pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy52aWV3cG9ydC5zY3JvbGxCeSh7IGxlZnQ6IHNjcm9sbEFtb3VudCwgYmVoYXZpb3I6IFwic21vb3RoXCIgfSlcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGxvb3AgJiYgYXRTdGFydCgpKSB7XG4gICAgICAgICAgdGhpcy52aWV3cG9ydC5zY3JvbGxUbyh7IGxlZnQ6IHRoaXMudmlld3BvcnQuc2Nyb2xsV2lkdGgsIGJlaGF2aW9yOiBcInNtb290aFwiIH0pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy52aWV3cG9ydC5zY3JvbGxCeSh7IGxlZnQ6IC1zY3JvbGxBbW91bnQsIGJlaGF2aW9yOiBcInNtb290aFwiIH0pXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgd2luZG93LnNldFRpbWVvdXQodXBkYXRlQ29udHJvbHMsIDM1MClcbiAgICB9XG5cbiAgICBpZiAodGhpcy5wcmV2KSB0aGlzLnByZXYuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuX29uUHJldiA9ICgpID0+IHNjcm9sbFRvKFwicHJldlwiKSlcbiAgICBpZiAodGhpcy5uZXh0KSB0aGlzLm5leHQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuX29uTmV4dCA9ICgpID0+IHNjcm9sbFRvKFwibmV4dFwiKSlcbiAgICB0aGlzLnZpZXdwb3J0LmFkZEV2ZW50TGlzdGVuZXIoXCJzY3JvbGxcIiwgdGhpcy5fb25TY3JvbGwgPSAoKSA9PiB1cGRhdGVDb250cm9scygpKVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHRoaXMuX29uUmVzaXplID0gKCkgPT4gdXBkYXRlQ29udHJvbHMoKSlcblxuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5fb25LZXkgPSAoZSkgPT4ge1xuICAgICAgaWYgKGUua2V5ID09PSBcIkFycm93TGVmdFwiKSB7IGUucHJldmVudERlZmF1bHQoKTsgc2Nyb2xsVG8oXCJwcmV2XCIpIH1cbiAgICAgIGlmIChlLmtleSA9PT0gXCJBcnJvd1JpZ2h0XCIpIHsgZS5wcmV2ZW50RGVmYXVsdCgpOyBzY3JvbGxUbyhcIm5leHRcIikgfVxuICAgIH0pXG5cbiAgICB1cGRhdGVDb250cm9scygpXG4gIH0sXG5cbiAgZGVzdHJveWVkKCkge1xuICAgIGlmICh0aGlzLnByZXYgJiYgdGhpcy5fb25QcmV2KSB0aGlzLnByZXYucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuX29uUHJldilcbiAgICBpZiAodGhpcy5uZXh0ICYmIHRoaXMuX29uTmV4dCkgdGhpcy5uZXh0LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLl9vbk5leHQpXG4gICAgaWYgKHRoaXMudmlld3BvcnQgJiYgdGhpcy5fb25TY3JvbGwpIHRoaXMudmlld3BvcnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLCB0aGlzLl9vblNjcm9sbClcbiAgICBpZiAodGhpcy5fb25SZXNpemUpIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHRoaXMuX29uUmVzaXplKVxuICAgIGlmICh0aGlzLl9vbktleSkgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCB0aGlzLl9vbktleSlcbiAgfVxufVxuXG5leHBvcnQgeyBFeG9DYXJvdXNlbCB9XG4iLCAiLyoqXG4gKiBFeG9Db2xsYXBzaWJsZSBob29rIFx1MjAxNCBjbGljayB0b2dnbGUgKyBhcmlhLWV4cGFuZGVkIHN5bmMuXG4gKlxuICogVXNlcyBhIGhpZGRlbiBjaGVja2JveCB0byBkcml2ZSBDU1Mgc3RhdGUgKHNhbWUgcGF0dGVybiBhcyBFeG9BY2NvcmRpb24pLlxuICogVGhlIHRyaWdnZXIgYnV0dG9uIHRvZ2dsZXMgdGhlIGNoZWNrYm94IGFuZCBzeW5jcyBhcmlhLWV4cGFuZGVkLlxuICovXG5jb25zdCBFeG9Db2xsYXBzaWJsZSA9IHtcbiAgbW91bnRlZCgpIHtcbiAgICB0aGlzLl9jaGVja2JveCA9ICgpID0+IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwiY29sbGFwc2libGUtc3RhdGVcIl0nKVxuICAgIHRoaXMuX3RyaWdnZXIgPSAoKSA9PiB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cImNvbGxhcHNpYmxlLXRyaWdnZXJcIl0nKVxuXG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5fb25DbGljayA9IChlKSA9PiB7XG4gICAgICBjb25zdCB0cmlnZ2VyID0gZS50YXJnZXQuY2xvc2VzdCgnW2RhdGEtZXhvPVwiY29sbGFwc2libGUtdHJpZ2dlclwiXScpXG4gICAgICBpZiAoIXRyaWdnZXIpIHJldHVyblxuXG4gICAgICBjb25zdCBjaGVja2JveCA9IHRoaXMuX2NoZWNrYm94KClcbiAgICAgIGlmICghY2hlY2tib3gpIHJldHVyblxuXG4gICAgICBjaGVja2JveC5jaGVja2VkID0gIWNoZWNrYm94LmNoZWNrZWRcbiAgICAgIHRyaWdnZXIuc2V0QXR0cmlidXRlKFwiYXJpYS1leHBhbmRlZFwiLCBTdHJpbmcoY2hlY2tib3guY2hlY2tlZCkpXG4gICAgfSlcblxuICAgIHRoaXMuX3N5bmNBcmlhKClcbiAgfSxcblxuICB1cGRhdGVkKCkge1xuICAgIHRoaXMuX3N5bmNBcmlhKClcbiAgfSxcblxuICBkZXN0cm95ZWQoKSB7XG4gICAgaWYgKHRoaXMuX29uQ2xpY2spIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuX29uQ2xpY2spXG4gIH0sXG5cbiAgX3N5bmNBcmlhKCkge1xuICAgIGNvbnN0IGNoZWNrYm94ID0gdGhpcy5fY2hlY2tib3goKVxuICAgIGNvbnN0IHRyaWdnZXIgPSB0aGlzLl90cmlnZ2VyKClcbiAgICBpZiAoY2hlY2tib3ggJiYgdHJpZ2dlcikge1xuICAgICAgdHJpZ2dlci5zZXRBdHRyaWJ1dGUoXCJhcmlhLWV4cGFuZGVkXCIsIFN0cmluZyhjaGVja2JveC5jaGVja2VkKSlcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IHsgRXhvQ29sbGFwc2libGUgfVxuIiwgImNvbnN0IFBhbGV0dGVSZWdpc3RyeSA9IHtcbiAgc3RhY2s6IFtdLFxuICBsaXN0ZW5lckJvdW5kOiBmYWxzZSxcblxuICByZWdpc3Rlcihob29rKSB7XG4gICAgdGhpcy5zdGFjayA9IHRoaXMuc3RhY2suZmlsdGVyKChlbnRyeSkgPT4gZW50cnkgIT09IGhvb2spXG4gICAgdGhpcy5zdGFjay5wdXNoKGhvb2spXG4gICAgdGhpcy5fZW5zdXJlTGlzdGVuZXIoKVxuICB9LFxuXG4gIHVucmVnaXN0ZXIoaG9vaykge1xuICAgIHRoaXMuc3RhY2sgPSB0aGlzLnN0YWNrLmZpbHRlcigoZW50cnkpID0+IGVudHJ5ICE9PSBob29rKVxuICAgIGlmICh0aGlzLnN0YWNrLmxlbmd0aCA9PT0gMCAmJiB0aGlzLmxpc3RlbmVyQm91bmQpIHtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIHRoaXMuX29uS2V5KVxuICAgICAgdGhpcy5saXN0ZW5lckJvdW5kID0gZmFsc2VcbiAgICB9XG4gIH0sXG5cbiAgX2Vuc3VyZUxpc3RlbmVyKCkge1xuICAgIGlmICh0aGlzLmxpc3RlbmVyQm91bmQpIHJldHVyblxuICAgIHRoaXMuX29uS2V5ID0gKGUpID0+IHtcbiAgICAgIGlmICghKChlLm1ldGFLZXkgfHwgZS5jdHJsS2V5KSAmJiBlLmtleSA9PT0gXCJrXCIpKSByZXR1cm5cbiAgICAgIGNvbnN0IHRhcmdldCA9IHRoaXMuc3RhY2tbdGhpcy5zdGFjay5sZW5ndGggLSAxXVxuICAgICAgaWYgKCF0YXJnZXQgfHwgIXRhcmdldC5fdG9nZ2xlKSByZXR1cm5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgdGFyZ2V0Ll90b2dnbGUoKVxuICAgIH1cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCB0aGlzLl9vbktleSlcbiAgICB0aGlzLmxpc3RlbmVyQm91bmQgPSB0cnVlXG4gIH1cbn1cblxuY29uc3QgRXhvQ29tbWFuZFBhbGV0dGUgPSB7XG4gIG1vdW50ZWQoKSB7IHRoaXMuX2JpbmQoKSB9LFxuICB1cGRhdGVkKCkgeyB0aGlzLl9iaW5kKCkgfSxcbiAgZGVzdHJveWVkKCkge1xuICAgIFBhbGV0dGVSZWdpc3RyeS51bnJlZ2lzdGVyKHRoaXMpXG4gICAgdGhpcy5fdW5iaW5kKClcbiAgfSxcblxuICBfYmluZCgpIHtcbiAgICB0aGlzLl91bmJpbmQoKVxuICAgIHRoaXMuYmFja2Ryb3AgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cImNvbW1hbmQtcGFsZXR0ZS1iYWNrZHJvcFwiXScpXG4gICAgdGhpcy5pbnB1dCA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwiY29tbWFuZC1wYWxldHRlLWlucHV0XCJdJylcbiAgICB0aGlzLmxpc3QgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cImNvbW1hbmQtcGFsZXR0ZS1saXN0XCJdJylcbiAgICB0aGlzLmVtcHR5ID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJjb21tYW5kLXBhbGV0dGUtZW1wdHlcIl0nKVxuICAgIHRoaXMuaXRlbXMgPSBBcnJheS5mcm9tKHRoaXMuZWwucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZXhvPVwiY29tbWFuZC1wYWxldHRlLWl0ZW1cIl0nKSlcbiAgICB0aGlzLmFjdGl2ZUluZGV4ID0gLTFcblxuICAgIGlmICh0aGlzLmxpc3QgJiYgIXRoaXMubGlzdC5pZCkgdGhpcy5saXN0LmlkID0gYCR7dGhpcy5lbC5pZH0tbGlzdGBcblxuICAgIHRoaXMuaXRlbXMuZm9yRWFjaCgoaXRlbSwgaW5kZXgpID0+IHtcbiAgICAgIGlmICghaXRlbS5pZCkgaXRlbS5pZCA9IGAke3RoaXMuZWwuaWR9LWl0ZW0tJHtpbmRleH1gXG4gICAgICBpdGVtLnNldEF0dHJpYnV0ZShcInJvbGVcIiwgXCJvcHRpb25cIilcbiAgICAgIGl0ZW0uc2V0QXR0cmlidXRlKFwidGFiaW5kZXhcIiwgXCItMVwiKVxuICAgICAgaWYgKCFpdGVtLmRhdGFzZXQudmFsdWUpIGl0ZW0uZGF0YXNldC52YWx1ZSA9IGl0ZW0udGV4dENvbnRlbnQudHJpbSgpXG4gICAgICBpZiAoIWl0ZW0uZGF0YXNldC5zZWFyY2gpIGl0ZW0uZGF0YXNldC5zZWFyY2ggPSBpdGVtLnRleHRDb250ZW50LnRyaW0oKVxuICAgICAgaWYgKGl0ZW0uZGlzYWJsZWQgfHwgaXRlbS5nZXRBdHRyaWJ1dGUoXCJhcmlhLWRpc2FibGVkXCIpID09PSBcInRydWVcIikge1xuICAgICAgICBpdGVtLmRhdGFzZXQuZGlzYWJsZWQgPSBcInRydWVcIlxuICAgICAgICBpdGVtLnNldEF0dHJpYnV0ZShcImFyaWEtZGlzYWJsZWRcIiwgXCJ0cnVlXCIpXG4gICAgICB9XG4gICAgICBpZiAoaXRlbS50YWdOYW1lID09PSBcIkJVVFRPTlwiICYmICFpdGVtLmhhc0F0dHJpYnV0ZShcInR5cGVcIikpIHtcbiAgICAgICAgaXRlbS5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsIFwiYnV0dG9uXCIpXG4gICAgICB9XG4gICAgfSlcblxuICAgIGlmICh0aGlzLmlucHV0KSB7XG4gICAgICB0aGlzLmlucHV0LnNldEF0dHJpYnV0ZShcInJvbGVcIiwgXCJjb21ib2JveFwiKVxuICAgICAgdGhpcy5pbnB1dC5zZXRBdHRyaWJ1dGUoXCJhcmlhLWF1dG9jb21wbGV0ZVwiLCBcImxpc3RcIilcbiAgICAgIGlmICh0aGlzLmxpc3QpIHRoaXMuaW5wdXQuc2V0QXR0cmlidXRlKFwiYXJpYS1jb250cm9sc1wiLCB0aGlzLmxpc3QuaWQpXG4gICAgfVxuXG4gICAgY29uc3QgaXNPcGVuID0gKCkgPT4gdGhpcy5lbC5jbGFzc0xpc3QuY29udGFpbnMoXCJvcGVuXCIpXG4gICAgY29uc3Qgc3luY1N0YXRlID0gKCkgPT4ge1xuICAgICAgdGhpcy5lbC5kYXRhc2V0LnN0YXRlID0gaXNPcGVuKCkgPyBcIm9wZW5cIiA6IFwiY2xvc2VkXCJcbiAgICAgIHRoaXMuZWwuc2V0QXR0cmlidXRlKFwiYXJpYS1oaWRkZW5cIiwgaXNPcGVuKCkgPyBcImZhbHNlXCIgOiBcInRydWVcIilcbiAgICAgIGlmICh0aGlzLmlucHV0KSB0aGlzLmlucHV0LnNldEF0dHJpYnV0ZShcImFyaWEtZXhwYW5kZWRcIiwgaXNPcGVuKCkgPyBcInRydWVcIiA6IFwiZmFsc2VcIilcbiAgICB9XG5cbiAgICB0aGlzLl9vcGVuID0gKCkgPT4ge1xuICAgICAgdGhpcy5lbC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiXG4gICAgICB0aGlzLmVsLmNsYXNzTGlzdC5hZGQoXCJvcGVuXCIpXG4gICAgICBzeW5jU3RhdGUoKVxuICAgICAgdGhpcy5fZmlsdGVyKClcbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmlucHV0KSB0aGlzLmlucHV0LmZvY3VzKClcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgdGhpcy5fY2xvc2UgPSAoKSA9PiB7XG4gICAgICB0aGlzLmVsLmNsYXNzTGlzdC5yZW1vdmUoXCJvcGVuXCIpXG4gICAgICB0aGlzLmVsLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIlxuICAgICAgc3luY1N0YXRlKClcbiAgICAgIGlmICh0aGlzLmlucHV0KSB0aGlzLmlucHV0LnZhbHVlID0gXCJcIlxuICAgICAgdGhpcy5pdGVtcy5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgIGl0ZW0uaGlkZGVuID0gZmFsc2VcbiAgICAgICAgdGhpcy5fc2V0SXRlbUFjdGl2ZShpdGVtLCBmYWxzZSlcbiAgICAgIH0pXG4gICAgICBpZiAodGhpcy5lbXB0eSkgdGhpcy5lbXB0eS5oaWRkZW4gPSB0cnVlXG4gICAgICB0aGlzLmFjdGl2ZUluZGV4ID0gLTFcbiAgICAgIHRoaXMuX3N5bmNBY3RpdmVEZXNjZW5kYW50KClcbiAgICB9XG5cbiAgICBzeW5jU3RhdGUoKVxuICAgIGlmICghaXNPcGVuKCkpIHRoaXMuZWwuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiXG4gICAgaWYgKHRoaXMuZW1wdHkpIHRoaXMuZW1wdHkuaGlkZGVuID0gdHJ1ZVxuICAgIHRoaXMuZWwuZGF0YXNldC5yZWFkeSA9IFwidHJ1ZVwiXG5cbiAgICB0aGlzLl90b2dnbGUgPSAoKSA9PiAoaXNPcGVuKCkgPyB0aGlzLl9jbG9zZSgpIDogdGhpcy5fb3BlbigpKVxuICAgIFBhbGV0dGVSZWdpc3RyeS5yZWdpc3Rlcih0aGlzKVxuXG4gICAgdGhpcy5fb25LZXkgPSAoZSkgPT4ge1xuICAgICAgaWYgKGUua2V5ID09PSBcIkVzY2FwZVwiKSB7XG4gICAgICAgIHRoaXMuX2Nsb3NlKClcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGlmICghaXNPcGVuKCkpIHJldHVyblxuXG4gICAgICBpZiAoZS5rZXkgPT09IFwiQXJyb3dEb3duXCIpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIHRoaXMuX21vdmVBY3RpdmUoMSlcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGlmIChlLmtleSA9PT0gXCJBcnJvd1VwXCIpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIHRoaXMuX21vdmVBY3RpdmUoLTEpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBpZiAoZS5rZXkgPT09IFwiSG9tZVwiKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICB0aGlzLl9zZXRBY3RpdmVCeVZpc2libGVJbmRleCgwKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgaWYgKGUua2V5ID09PSBcIkVuZFwiKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICBjb25zdCB2aXNpYmxlID0gdGhpcy5fdmlzaWJsZUl0ZW1zKClcbiAgICAgICAgdGhpcy5fc2V0QWN0aXZlQnlWaXNpYmxlSW5kZXgodmlzaWJsZS5sZW5ndGggLSAxKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgaWYgKGUua2V5ID09PSBcIkVudGVyXCIgJiYgdGhpcy5hY3RpdmVJbmRleCA+PSAwKSB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSB0aGlzLml0ZW1zW3RoaXMuYWN0aXZlSW5kZXhdXG4gICAgICAgIGlmIChpdGVtICYmICF0aGlzLl9pc0Rpc2FibGVkKGl0ZW0pICYmICFpdGVtLmhpZGRlbikge1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgIGl0ZW0uY2xpY2soKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5fb25LZXkpXG5cbiAgICB0aGlzLl9vbklucHV0ID0gKCkgPT4gdGhpcy5fZmlsdGVyKClcbiAgICBpZiAodGhpcy5pbnB1dCkgdGhpcy5pbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgdGhpcy5fb25JbnB1dClcblxuICAgIHRoaXMuX29uSXRlbVBvaW50ZXJNb3ZlID0gKGUpID0+IHtcbiAgICAgIGNvbnN0IGl0ZW0gPSBlLnRhcmdldC5jbG9zZXN0KCdbZGF0YS1leG89XCJjb21tYW5kLXBhbGV0dGUtaXRlbVwiXScpXG4gICAgICBpZiAoIWl0ZW0gfHwgdGhpcy5faXNEaXNhYmxlZChpdGVtKSB8fCBpdGVtLmhpZGRlbikgcmV0dXJuXG4gICAgICB0aGlzLl9zZXRBY3RpdmUodGhpcy5pdGVtcy5pbmRleE9mKGl0ZW0pKVxuICAgIH1cbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoXCJwb2ludGVybW92ZVwiLCB0aGlzLl9vbkl0ZW1Qb2ludGVyTW92ZSlcblxuICAgIHRoaXMuX29uSXRlbUNsaWNrID0gKGUpID0+IHtcbiAgICAgIGNvbnN0IGl0ZW0gPSBlLnRhcmdldC5jbG9zZXN0KCdbZGF0YS1leG89XCJjb21tYW5kLXBhbGV0dGUtaXRlbVwiXScpXG4gICAgICBpZiAoIWl0ZW0pIHJldHVyblxuICAgICAgaWYgKHRoaXMuX2lzRGlzYWJsZWQoaXRlbSkpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgaWYgKGl0ZW0uZGF0YXNldC5jbG9zZSAhPT0gXCJmYWxzZVwiKSB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy5fY2xvc2UoKSwgMClcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5fb25JdGVtQ2xpY2spXG5cbiAgICBpZiAodGhpcy5iYWNrZHJvcCkge1xuICAgICAgdGhpcy5fb25CYWNrZHJvcCA9ICgpID0+IHRoaXMuX2Nsb3NlKClcbiAgICAgIHRoaXMuYmFja2Ryb3AuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuX29uQmFja2Ryb3ApXG4gICAgfVxuICB9LFxuXG4gIF9pc0Rpc2FibGVkKGl0ZW0pIHtcbiAgICByZXR1cm4gaXRlbS5kaXNhYmxlZCB8fCBpdGVtLmRhdGFzZXQuZGlzYWJsZWQgPT09IFwidHJ1ZVwiIHx8IGl0ZW0uZ2V0QXR0cmlidXRlKFwiYXJpYS1kaXNhYmxlZFwiKSA9PT0gXCJ0cnVlXCJcbiAgfSxcblxuICBfdmlzaWJsZUl0ZW1zKCkge1xuICAgIHJldHVybiB0aGlzLml0ZW1zLmZpbHRlcigoaXRlbSkgPT4gIWl0ZW0uaGlkZGVuICYmICF0aGlzLl9pc0Rpc2FibGVkKGl0ZW0pKVxuICB9LFxuXG4gIF9maWx0ZXIoKSB7XG4gICAgY29uc3QgcXVlcnkgPSAodGhpcy5pbnB1dD8udmFsdWUgfHwgXCJcIikudHJpbSgpLnRvTG93ZXJDYXNlKClcbiAgICBsZXQgdmlzaWJsZUNvdW50ID0gMFxuXG4gICAgdGhpcy5pdGVtcy5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICBjb25zdCB0ZXh0ID0gYCR7aXRlbS5kYXRhc2V0LnNlYXJjaCB8fCBcIlwifSAke2l0ZW0uZGF0YXNldC52YWx1ZSB8fCBcIlwifSAke2l0ZW0udGV4dENvbnRlbnQgfHwgXCJcIn1gLnRvTG93ZXJDYXNlKClcbiAgICAgIGNvbnN0IHZpc2libGUgPSAhcXVlcnkgfHwgdGV4dC5pbmNsdWRlcyhxdWVyeSlcbiAgICAgIGl0ZW0uaGlkZGVuID0gIXZpc2libGVcbiAgICAgIGlmICh2aXNpYmxlICYmICF0aGlzLl9pc0Rpc2FibGVkKGl0ZW0pKSB2aXNpYmxlQ291bnQgKz0gMVxuICAgIH0pXG5cbiAgICBpZiAodGhpcy5lbXB0eSkgdGhpcy5lbXB0eS5oaWRkZW4gPSB2aXNpYmxlQ291bnQgPiAwXG4gICAgdGhpcy5fc2V0QWN0aXZlQnlWaXNpYmxlSW5kZXgoMClcbiAgfSxcblxuICBfbW92ZUFjdGl2ZShkZWx0YSkge1xuICAgIGNvbnN0IHZpc2libGUgPSB0aGlzLl92aXNpYmxlSXRlbXMoKVxuICAgIGlmICghdmlzaWJsZS5sZW5ndGgpIHtcbiAgICAgIHRoaXMuX3NldEFjdGl2ZSgtMSlcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IGN1cnJlbnQgPSB2aXNpYmxlLmluZGV4T2YodGhpcy5pdGVtc1t0aGlzLmFjdGl2ZUluZGV4XSlcbiAgICBjb25zdCBuZXh0ID0gY3VycmVudCA9PT0gLTFcbiAgICAgID8gKGRlbHRhID4gMCA/IDAgOiB2aXNpYmxlLmxlbmd0aCAtIDEpXG4gICAgICA6IChjdXJyZW50ICsgZGVsdGEgKyB2aXNpYmxlLmxlbmd0aCkgJSB2aXNpYmxlLmxlbmd0aFxuXG4gICAgdGhpcy5fc2V0QWN0aXZlKHRoaXMuaXRlbXMuaW5kZXhPZih2aXNpYmxlW25leHRdKSlcbiAgfSxcblxuICBfc2V0QWN0aXZlQnlWaXNpYmxlSW5kZXgoaW5kZXgpIHtcbiAgICBjb25zdCB2aXNpYmxlID0gdGhpcy5fdmlzaWJsZUl0ZW1zKClcbiAgICBpZiAoIXZpc2libGUubGVuZ3RoIHx8IGluZGV4IDwgMCkge1xuICAgICAgdGhpcy5fc2V0QWN0aXZlKC0xKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNvbnN0IGJvdW5kZWQgPSBNYXRoLm1heCgwLCBNYXRoLm1pbihpbmRleCwgdmlzaWJsZS5sZW5ndGggLSAxKSlcbiAgICB0aGlzLl9zZXRBY3RpdmUodGhpcy5pdGVtcy5pbmRleE9mKHZpc2libGVbYm91bmRlZF0pKVxuICB9LFxuXG4gIF9zZXRBY3RpdmUoaW5kZXgpIHtcbiAgICB0aGlzLml0ZW1zLmZvckVhY2goKGl0ZW0sIGl0ZW1JbmRleCkgPT4gdGhpcy5fc2V0SXRlbUFjdGl2ZShpdGVtLCBpdGVtSW5kZXggPT09IGluZGV4KSlcbiAgICB0aGlzLmFjdGl2ZUluZGV4ID0gaW5kZXhcbiAgICB0aGlzLl9zeW5jQWN0aXZlRGVzY2VuZGFudCgpXG5cbiAgICBjb25zdCBpdGVtID0gdGhpcy5pdGVtc1tpbmRleF1cbiAgICBpZiAoaXRlbSkgaXRlbS5zY3JvbGxJbnRvVmlldyh7IGJsb2NrOiBcIm5lYXJlc3RcIiB9KVxuICB9LFxuXG4gIF9zZXRJdGVtQWN0aXZlKGl0ZW0sIGFjdGl2ZSkge1xuICAgIGl0ZW0uZGF0YXNldC5hY3RpdmUgPSBhY3RpdmUgPyBcInRydWVcIiA6IFwiZmFsc2VcIlxuICAgIGl0ZW0uc2V0QXR0cmlidXRlKFwiYXJpYS1zZWxlY3RlZFwiLCBhY3RpdmUgPyBcInRydWVcIiA6IFwiZmFsc2VcIilcbiAgfSxcblxuICBfc3luY0FjdGl2ZURlc2NlbmRhbnQoKSB7XG4gICAgaWYgKCF0aGlzLmlucHV0KSByZXR1cm5cbiAgICBjb25zdCBpdGVtID0gdGhpcy5pdGVtc1t0aGlzLmFjdGl2ZUluZGV4XVxuICAgIGlmIChpdGVtICYmICFpdGVtLmhpZGRlbikge1xuICAgICAgdGhpcy5pbnB1dC5zZXRBdHRyaWJ1dGUoXCJhcmlhLWFjdGl2ZWRlc2NlbmRhbnRcIiwgaXRlbS5pZClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5pbnB1dC5yZW1vdmVBdHRyaWJ1dGUoXCJhcmlhLWFjdGl2ZWRlc2NlbmRhbnRcIilcbiAgICB9XG4gIH0sXG5cbiAgX3VuYmluZCgpIHtcbiAgICBQYWxldHRlUmVnaXN0cnkudW5yZWdpc3Rlcih0aGlzKVxuICAgIGlmICh0aGlzLl9vbktleSkgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCB0aGlzLl9vbktleSlcbiAgICBpZiAodGhpcy5pbnB1dCAmJiB0aGlzLl9vbklucHV0KSB0aGlzLmlucHV0LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCB0aGlzLl9vbklucHV0KVxuICAgIGlmICh0aGlzLl9vbkl0ZW1Qb2ludGVyTW92ZSkgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKFwicG9pbnRlcm1vdmVcIiwgdGhpcy5fb25JdGVtUG9pbnRlck1vdmUpXG4gICAgaWYgKHRoaXMuX29uSXRlbUNsaWNrKSB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLl9vbkl0ZW1DbGljaylcbiAgICBpZiAodGhpcy5iYWNrZHJvcCAmJiB0aGlzLl9vbkJhY2tkcm9wKSB7XG4gICAgICB0aGlzLmJhY2tkcm9wLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLl9vbkJhY2tkcm9wKVxuICAgIH1cbiAgICBkZWxldGUgdGhpcy5lbC5kYXRhc2V0LnJlYWR5XG4gICAgdGhpcy5iYWNrZHJvcCA9IG51bGxcbiAgICB0aGlzLmlucHV0ID0gbnVsbFxuICAgIHRoaXMubGlzdCA9IG51bGxcbiAgICB0aGlzLmVtcHR5ID0gbnVsbFxuICAgIHRoaXMuaXRlbXMgPSBbXVxuICAgIHRoaXMuYWN0aXZlSW5kZXggPSAtMVxuICAgIHRoaXMuX29uS2V5ID0gbnVsbFxuICAgIHRoaXMuX29uSW5wdXQgPSBudWxsXG4gICAgdGhpcy5fb25JdGVtUG9pbnRlck1vdmUgPSBudWxsXG4gICAgdGhpcy5fb25JdGVtQ2xpY2sgPSBudWxsXG4gICAgdGhpcy5fb25CYWNrZHJvcCA9IG51bGxcbiAgICB0aGlzLl9vcGVuID0gbnVsbFxuICAgIHRoaXMuX2Nsb3NlID0gbnVsbFxuICAgIHRoaXMuX3RvZ2dsZSA9IG51bGxcbiAgfVxufVxuXG5leHBvcnQgeyBFeG9Db21tYW5kUGFsZXR0ZSB9XG4iLCAiLyoqXG4gKiBFeG9TaWRlYmFyIGhvb2sgXHUyMDE0IG1hbmFnZXMgY29sbGFwc2libGUgc2lkZWJhciBzdGF0ZS5cbiAqXG4gKiBSZXN0b3JlcyBjb2xsYXBzZWQvZXhwYW5kZWQgZnJvbSBsb2NhbFN0b3JhZ2Ugb24gZGVza3RvcC5cbiAqIE1vYmlsZSBzdGFydHMgY2xvc2VkLiBTZXRzIGRhdGEtc2lkZWJhci1yZWFkeSBvbiA8aHRtbD4gYWZ0ZXIgaW5pdC5cbiAqL1xuY29uc3QgRXhvU2lkZWJhciA9IHtcbiAgbW91bnRlZCgpIHtcbiAgICB0aGlzLnRvZ2dsZSA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwic2lkZWJhci10b2dnbGVcIl0nKVxuICAgIGlmICghdGhpcy50b2dnbGUpIHJldHVyblxuXG4gICAgdGhpcy5fYXBwbHlTdGF0ZSgpXG5cbiAgICAvLyBFbmFibGUgQ1NTIHRyYW5zaXRpb25zIGFmdGVyIGluaXRpYWwgc3RhdGUgKHByZXZlbnRzIEZPVUMpXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RhdGEtc2lkZWJhci1yZWFkeScsICcnKVxuICAgIH0pXG5cbiAgICAvLyBQZXJzaXN0IG9uIHRvZ2dsZVxuICAgIHRoaXMuX29uQ2hhbmdlID0gKCkgPT4ge1xuICAgICAgaWYgKHdpbmRvdy5tYXRjaE1lZGlhKCcobWluLXdpZHRoOiA3NjhweCknKS5tYXRjaGVzKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdleG8tc2lkZWJhci1jb2xsYXBzZWQnLCB0aGlzLnRvZ2dsZS5jaGVja2VkID8gJ2ZhbHNlJyA6ICd0cnVlJylcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy50b2dnbGUuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgdGhpcy5fb25DaGFuZ2UpXG4gIH0sXG5cbiAgZGVzdHJveWVkKCkge1xuICAgIGlmICh0aGlzLnRvZ2dsZSAmJiB0aGlzLl9vbkNoYW5nZSkge1xuICAgICAgdGhpcy50b2dnbGUucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgdGhpcy5fb25DaGFuZ2UpXG4gICAgfVxuICB9LFxuXG4gIHVwZGF0ZWQoKSB7XG4gICAgdGhpcy5fYXBwbHlTdGF0ZSgpXG4gIH0sXG5cbiAgX2FwcGx5U3RhdGUoKSB7XG4gICAgaWYgKCF0aGlzLnRvZ2dsZSkgcmV0dXJuXG4gICAgY29uc3QgaXNEZXNrdG9wID0gd2luZG93Lm1hdGNoTWVkaWEoJyhtaW4td2lkdGg6IDc2OHB4KScpLm1hdGNoZXNcbiAgICBpZiAoaXNEZXNrdG9wKSB7XG4gICAgICBjb25zdCBjb2xsYXBzZWQgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnZXhvLXNpZGViYXItY29sbGFwc2VkJykgPT09ICd0cnVlJ1xuICAgICAgdGhpcy50b2dnbGUuY2hlY2tlZCA9ICFjb2xsYXBzZWRcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy50b2dnbGUuY2hlY2tlZCA9IGZhbHNlXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCB7IEV4b1NpZGViYXIgfVxuIiwgImNvbnN0IEV4b1RoZW1lVG9nZ2xlID0ge1xuICBtb3VudGVkKCkgeyB0aGlzLl9iaW5kKCkgfSxcbiAgdXBkYXRlZCgpIHsgdGhpcy5fYmluZCgpIH0sXG4gIGRlc3Ryb3llZCgpIHsgdGhpcy5fdW5iaW5kKCkgfSxcblxuICBfYmluZCgpIHtcbiAgICB0aGlzLl91bmJpbmQoKVxuICAgIHRoaXMuX2FwcGx5KHRoaXMuX2N1cnJlbnQoKSlcbiAgICB0aGlzLmVsLnNldEF0dHJpYnV0ZSgnZGF0YS1yZWFkeScsICcnKVxuXG4gICAgdGhpcy5fb25DbGljayA9IChlKSA9PiB7XG4gICAgICBjb25zdCBidG4gPSBlLnRhcmdldC5jbG9zZXN0KCdbZGF0YS10aGVtZS12YWx1ZV0nKVxuICAgICAgaWYgKCFidG4gfHwgIXRoaXMuZWwuY29udGFpbnMoYnRuKSkgcmV0dXJuXG4gICAgICBjb25zdCB2YWx1ZSA9IGJ0bi5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGhlbWUtdmFsdWUnKVxuICAgICAgdGhpcy5fYXBwbHkodmFsdWUpXG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnZXhvLXRoZW1lJywgdmFsdWUpXG4gICAgfVxuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9vbkNsaWNrKVxuICB9LFxuXG4gIF91bmJpbmQoKSB7XG4gICAgaWYgKHRoaXMuX29uQ2xpY2spIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9vbkNsaWNrKVxuICAgIGlmICh0aGlzLmVsKSB0aGlzLmVsLnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS1yZWFkeScpXG4gICAgdGhpcy5fb25DbGljayA9IG51bGxcbiAgfSxcblxuICBfY3VycmVudCgpIHtcbiAgICByZXR1cm4gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2V4by10aGVtZScpIHx8ICdzeXN0ZW0nXG4gIH0sXG5cbiAgX2FwcGx5KHRoZW1lKSB7XG4gICAgY29uc3Qgcm9vdCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudFxuICAgIC8vIFVwZGF0ZSBhY3RpdmUgc3RhdGUgb24gYnV0dG9uc1xuICAgIHRoaXMuZWwucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtdGhlbWUtdmFsdWVdJykuZm9yRWFjaChidG4gPT4ge1xuICAgICAgY29uc3QgYWN0aXZlID0gYnRuLmdldEF0dHJpYnV0ZSgnZGF0YS10aGVtZS12YWx1ZScpID09PSB0aGVtZVxuICAgICAgYnRuLnRvZ2dsZUF0dHJpYnV0ZSgnZGF0YS1hY3RpdmUnLCBhY3RpdmUpXG4gICAgICBidG4uc2V0QXR0cmlidXRlKCdhcmlhLXByZXNzZWQnLCBhY3RpdmUgPyAndHJ1ZScgOiAnZmFsc2UnKVxuICAgIH0pXG5cbiAgICBpZiAodGhlbWUgPT09ICdzeXN0ZW0nKSB7XG4gICAgICByb290LnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS10aGVtZScpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJvb3Quc2V0QXR0cmlidXRlKCdkYXRhLXRoZW1lJywgdGhlbWUpXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCB7IEV4b1RoZW1lVG9nZ2xlIH1cbiIsICJjb25zdCBFeG9Qb3BvdmVyID0ge1xuICBtb3VudGVkKCkgeyB0aGlzLl9iaW5kKCkgfSxcbiAgdXBkYXRlZCgpIHsgdGhpcy5fYmluZCgpIH0sXG4gIGRlc3Ryb3llZCgpIHsgdGhpcy5fdW5iaW5kKCkgfSxcbiAgX2JpbmQoKSB7XG4gICAgdGhpcy5fdW5iaW5kKClcbiAgICB0aGlzLl90cmlnZ2VyID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJwb3BvdmVyLXRyaWdnZXJcIl0nKVxuICAgIGNvbnN0IGlkID1cbiAgICAgIHRoaXMuX3RyaWdnZXI/LmRhdGFzZXQucG9wb3ZlclRhcmdldCB8fFxuICAgICAgdGhpcy5fdHJpZ2dlcj8uZ2V0QXR0cmlidXRlKCdwb3BvdmVydGFyZ2V0JylcbiAgICB0aGlzLl9wb3BvdmVyID0gaWQgPyBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCkgOiBudWxsXG4gICAgaWYgKCF0aGlzLl9wb3BvdmVyIHx8ICF0aGlzLl90cmlnZ2VyKSByZXR1cm5cblxuICAgIHRoaXMuX2NvbnRyb2wgPSB0aGlzLl9maW5kQ29udHJvbCgpXG4gICAgdGhpcy5fcHJlcGFyZUNvbnRyb2woKVxuICAgIHRoaXMuZWwuc2V0QXR0cmlidXRlKCdkYXRhLXJlYWR5JywgJycpXG5cbiAgICB0aGlzLl9zeW5jRXhwYW5kZWQgPSAoKSA9PiB7XG4gICAgICBjb25zdCBvcGVuID0gdGhpcy5fcG9wb3Zlci5tYXRjaGVzKCc6cG9wb3Zlci1vcGVuJylcbiAgICAgIHRoaXMuX2NvbnRyb2w/LnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsIFN0cmluZyhvcGVuKSlcbiAgICAgIHRoaXMuX3RyaWdnZXIuc2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJywgU3RyaW5nKG9wZW4pKVxuICAgIH1cbiAgICB0aGlzLl9zeW5jRXhwYW5kZWQoKVxuXG4gICAgdGhpcy5fb25DbGljayA9IChldmVudCkgPT4ge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgdGhpcy5fdG9nZ2xlUG9wb3ZlcigpXG4gICAgfVxuXG4gICAgdGhpcy5fb25LZXlkb3duID0gKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoZXZlbnQua2V5ICE9PSAnRW50ZXInICYmIGV2ZW50LmtleSAhPT0gJyAnKSByZXR1cm5cbiAgICAgIGlmIChldmVudC50YXJnZXQgIT09IHRoaXMuX2NvbnRyb2wgJiYgIXRoaXMuX2NvbnRyb2w/LmNvbnRhaW5zPy4oZXZlbnQudGFyZ2V0KSkgcmV0dXJuXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICB0aGlzLl90b2dnbGVQb3BvdmVyKClcbiAgICB9XG5cbiAgICB0aGlzLl9vblRvZ2dsZSA9ICgpID0+IHRoaXMuX3N5bmNFeHBhbmRlZCgpXG4gICAgdGhpcy5fdHJpZ2dlci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX29uQ2xpY2spXG4gICAgdGhpcy5fdHJpZ2dlci5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5fb25LZXlkb3duKVxuICAgIHRoaXMuX3BvcG92ZXIuYWRkRXZlbnRMaXN0ZW5lcigndG9nZ2xlJywgdGhpcy5fb25Ub2dnbGUpXG4gIH0sXG5cbiAgX2ZpbmRDb250cm9sKCkge1xuICAgIGNvbnN0IHNlbGVjdG9yID0gW1xuICAgICAgJ2J1dHRvbicsXG4gICAgICAnYVtocmVmXScsXG4gICAgICAnaW5wdXQ6bm90KFt0eXBlPVwiaGlkZGVuXCJdKScsXG4gICAgICAnc2VsZWN0JyxcbiAgICAgICd0ZXh0YXJlYScsXG4gICAgICAnW3JvbGU9XCJidXR0b25cIl0nLFxuICAgICAgJ1t0YWJpbmRleF06bm90KFt0YWJpbmRleD1cIi0xXCJdKSdcbiAgICBdLmpvaW4oJywnKVxuXG4gICAgcmV0dXJuIHRoaXMuX3RyaWdnZXIubWF0Y2hlcyhzZWxlY3RvcilcbiAgICAgID8gdGhpcy5fdHJpZ2dlclxuICAgICAgOiB0aGlzLl90cmlnZ2VyLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpIHx8IHRoaXMuX3RyaWdnZXJcbiAgfSxcblxuICBfcHJlcGFyZUNvbnRyb2woKSB7XG4gICAgY29uc3QgaGFzUG9wdXAgPSB0aGlzLl90cmlnZ2VyLmRhdGFzZXQucG9wb3Zlckhhc3BvcHVwIHx8ICd0cnVlJ1xuXG4gICAgdGhpcy5fY29udHJvbC5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGFzcG9wdXAnLCBoYXNQb3B1cClcbiAgICB0aGlzLl9jb250cm9sLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsICdmYWxzZScpXG5cbiAgICBpZiAodGhpcy5fY29udHJvbCA9PT0gdGhpcy5fdHJpZ2dlcikge1xuICAgICAgdGhpcy5fY29udHJvbC5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCAnYnV0dG9uJylcbiAgICAgIHRoaXMuX2NvbnRyb2wuc2V0QXR0cmlidXRlKCd0YWJpbmRleCcsICcwJylcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fY29udHJvbCBpbnN0YW5jZW9mIEhUTUxCdXR0b25FbGVtZW50ICYmICF0aGlzLl9jb250cm9sLmdldEF0dHJpYnV0ZSgndHlwZScpKSB7XG4gICAgICB0aGlzLl9jb250cm9sLnNldEF0dHJpYnV0ZSgndHlwZScsICdidXR0b24nKVxuICAgIH1cbiAgfSxcblxuICBfdG9nZ2xlUG9wb3ZlcigpIHtcbiAgICB0cnkge1xuICAgICAgaWYgKHRoaXMuX3BvcG92ZXIubWF0Y2hlcygnOnBvcG92ZXItb3BlbicpKSB7XG4gICAgICAgIHRoaXMuX3BvcG92ZXIuaGlkZVBvcG92ZXIoKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fcG9wb3Zlci5zaG93UG9wb3ZlcigpXG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ0V4b1BvcG92ZXI6IHRvZ2dsZSBmYWlsZWQnLCBlcnIpXG4gICAgfVxuICB9LFxuXG4gIF91bmJpbmQoKSB7XG4gICAgaWYgKHRoaXMuX3BvcG92ZXIgJiYgdGhpcy5fb25Ub2dnbGUpIHtcbiAgICAgIHRoaXMuX3BvcG92ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG9nZ2xlJywgdGhpcy5fb25Ub2dnbGUpXG4gICAgfVxuICAgIGlmICh0aGlzLl90cmlnZ2VyKSB7XG4gICAgICBpZiAodGhpcy5fb25DbGljaykgdGhpcy5fdHJpZ2dlci5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX29uQ2xpY2spXG4gICAgICBpZiAodGhpcy5fb25LZXlkb3duKSB0aGlzLl90cmlnZ2VyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLl9vbktleWRvd24pXG4gICAgfVxuICAgIGlmICh0aGlzLmVsKSB0aGlzLmVsLnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS1yZWFkeScpXG4gICAgdGhpcy5fdHJpZ2dlciA9IG51bGxcbiAgICB0aGlzLl9jb250cm9sID0gbnVsbFxuICAgIHRoaXMuX3BvcG92ZXIgPSBudWxsXG4gICAgdGhpcy5fc3luY0V4cGFuZGVkID0gbnVsbFxuICAgIHRoaXMuX29uQ2xpY2sgPSBudWxsXG4gICAgdGhpcy5fb25LZXlkb3duID0gbnVsbFxuICAgIHRoaXMuX29uVG9nZ2xlID0gbnVsbFxuICB9XG59XG5cbmV4cG9ydCB7IEV4b1BvcG92ZXIgfVxuIiwgImNvbnN0IEV4b0Ryb3Bkb3duTWVudSA9IHtcbiAgbW91bnRlZCgpIHsgdGhpcy5fYmluZCgpIH0sXG4gIHVwZGF0ZWQoKSB7IHRoaXMuX2JpbmQoKSB9LFxuICBkZXN0cm95ZWQoKSB7IHRoaXMuX3VuYmluZCgpIH0sXG5cbiAgX2JpbmQoKSB7XG4gICAgdGhpcy5fdW5iaW5kKClcbiAgICB0aGlzLl9tZW51ID0gdGhpcy5lbC5tYXRjaGVzKCdbcm9sZT1cIm1lbnVcIl0nKSA/IHRoaXMuZWwgOiB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tyb2xlPVwibWVudVwiXScpXG4gICAgaWYgKCF0aGlzLl9tZW51KSByZXR1cm5cblxuICAgIHRoaXMuX3BvcG92ZXIgPSB0aGlzLl9tZW51LmNsb3Nlc3QoJ1twb3BvdmVyXScpXG4gICAgdGhpcy5fdHJpZ2dlciA9IHRoaXMuX2ZpbmRUcmlnZ2VyKClcbiAgICB0aGlzLl9hbGxJdGVtcygpLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgIGl0ZW0uc2V0QXR0cmlidXRlKCd0YWJpbmRleCcsICctMScpXG4gICAgICBpZiAoaXRlbS50YWdOYW1lID09PSAnQlVUVE9OJyAmJiAhaXRlbS5nZXRBdHRyaWJ1dGUoJ3R5cGUnKSkge1xuICAgICAgICBpdGVtLnNldEF0dHJpYnV0ZSgndHlwZScsICdidXR0b24nKVxuICAgICAgfVxuICAgICAgaWYgKHRoaXMuX2lzRGlzYWJsZWQoaXRlbSkpIHtcbiAgICAgICAgaXRlbS5zZXRBdHRyaWJ1dGUoJ2FyaWEtZGlzYWJsZWQnLCAndHJ1ZScpXG4gICAgICAgIGl0ZW0uZGF0YXNldC5kaXNhYmxlZCA9ICd0cnVlJ1xuICAgICAgfVxuICAgIH0pXG5cbiAgICB0aGlzLl9vblRvZ2dsZSA9ICgpID0+IHtcbiAgICAgIGlmICghdGhpcy5fcG9wb3Zlcj8ubWF0Y2hlcygnOnBvcG92ZXItb3BlbicpKSByZXR1cm5cbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB0aGlzLl9pdGVtcygpWzBdPy5mb2N1cygpKVxuICAgIH1cbiAgICB0aGlzLl9wb3BvdmVyPy5hZGRFdmVudExpc3RlbmVyKCd0b2dnbGUnLCB0aGlzLl9vblRvZ2dsZSlcblxuICAgIHRoaXMuX29uQ2xpY2sgPSAoZSkgPT4ge1xuICAgICAgY29uc3QgaXRlbSA9IGUudGFyZ2V0LmNsb3Nlc3QoJ1tyb2xlPVwibWVudWl0ZW1cIl0nKVxuICAgICAgaWYgKCFpdGVtIHx8ICF0aGlzLl9tZW51LmNvbnRhaW5zKGl0ZW0pKSByZXR1cm5cbiAgICAgIGlmICh0aGlzLl9pc0Rpc2FibGVkKGl0ZW0pKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpXG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX21lbnUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9vbkNsaWNrKVxuXG4gICAgdGhpcy5fb25LZXlkb3duID0gKGUpID0+IHtcbiAgICAgIGlmIChlLmtleSA9PT0gJ0VzY2FwZScpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIHRoaXMuX3BvcG92ZXI/LmhpZGVQb3BvdmVyPy4oKVxuICAgICAgICB0aGlzLl90cmlnZ2VyPy5mb2N1cz8uKClcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGl0ZW1zID0gdGhpcy5faXRlbXMoKVxuICAgICAgaWYgKCFpdGVtcy5sZW5ndGgpIHJldHVyblxuICAgICAgY29uc3QgaWR4ID0gaXRlbXMuaW5kZXhPZihkb2N1bWVudC5hY3RpdmVFbGVtZW50KVxuICAgICAgbGV0IG5leHQgPSAtMVxuXG4gICAgICBzd2l0Y2ggKGUua2V5KSB7XG4gICAgICAgIGNhc2UgJ0Fycm93RG93bic6IG5leHQgPSBpZHggPCBpdGVtcy5sZW5ndGggLSAxID8gaWR4ICsgMSA6IDA7IGJyZWFrXG4gICAgICAgIGNhc2UgJ0Fycm93VXAnOiBuZXh0ID0gaWR4ID4gMCA/IGlkeCAtIDEgOiBpdGVtcy5sZW5ndGggLSAxOyBicmVha1xuICAgICAgICBjYXNlICdIb21lJzogbmV4dCA9IDA7IGJyZWFrXG4gICAgICAgIGNhc2UgJ0VuZCc6IG5leHQgPSBpdGVtcy5sZW5ndGggLSAxOyBicmVha1xuICAgICAgICBkZWZhdWx0OiByZXR1cm5cbiAgICAgIH1cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgaXRlbXNbbmV4dF0/LmZvY3VzKClcbiAgICB9XG4gICAgdGhpcy5fbWVudS5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5fb25LZXlkb3duKVxuICB9LFxuXG4gIF9pdGVtcygpIHtcbiAgICByZXR1cm4gdGhpcy5fYWxsSXRlbXMoKS5maWx0ZXIoKGl0ZW0pID0+ICF0aGlzLl9pc0Rpc2FibGVkKGl0ZW0pKVxuICB9LFxuXG4gIF9hbGxJdGVtcygpIHtcbiAgICByZXR1cm4gWy4uLnRoaXMuX21lbnUucXVlcnlTZWxlY3RvckFsbCgnW3JvbGU9XCJtZW51aXRlbVwiXScpXVxuICB9LFxuXG4gIF9pc0Rpc2FibGVkKGl0ZW0pIHtcbiAgICByZXR1cm4gaXRlbS5kaXNhYmxlZCB8fFxuICAgICAgaXRlbS5kYXRhc2V0LmRpc2FibGVkID09PSAndHJ1ZScgfHxcbiAgICAgIGl0ZW0uaGFzQXR0cmlidXRlKCdkYXRhLWRpc2FibGVkJykgfHxcbiAgICAgIGl0ZW0uZ2V0QXR0cmlidXRlKCdhcmlhLWRpc2FibGVkJykgPT09ICd0cnVlJ1xuICB9LFxuXG4gIF9maW5kVHJpZ2dlcigpIHtcbiAgICBpZiAoIXRoaXMuX3BvcG92ZXI/LmlkKSByZXR1cm4gbnVsbFxuICAgIGNvbnN0IHRyaWdnZXIgPSBbLi4uZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtcG9wb3Zlci10YXJnZXRdJyldXG4gICAgICAuZmluZCgobm9kZSkgPT4gbm9kZS5kYXRhc2V0LnBvcG92ZXJUYXJnZXQgPT09IHRoaXMuX3BvcG92ZXIuaWQpXG4gICAgcmV0dXJuIHRyaWdnZXI/Lm1hdGNoZXMoJ2J1dHRvbiwgYVtocmVmXSwgaW5wdXQsIHNlbGVjdCwgdGV4dGFyZWEsIFtyb2xlPVwiYnV0dG9uXCJdLCBbdGFiaW5kZXhdJylcbiAgICAgID8gdHJpZ2dlclxuICAgICAgOiB0cmlnZ2VyPy5xdWVyeVNlbGVjdG9yKCdidXR0b24sIGFbaHJlZl0sIGlucHV0LCBzZWxlY3QsIHRleHRhcmVhLCBbcm9sZT1cImJ1dHRvblwiXSwgW3RhYmluZGV4XScpIHx8IHRyaWdnZXJcbiAgfSxcblxuICBfdW5iaW5kKCkge1xuICAgIGlmICh0aGlzLl9wb3BvdmVyICYmIHRoaXMuX29uVG9nZ2xlKSB7XG4gICAgICB0aGlzLl9wb3BvdmVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvZ2dsZScsIHRoaXMuX29uVG9nZ2xlKVxuICAgIH1cbiAgICBpZiAodGhpcy5fbWVudSAmJiB0aGlzLl9vbkNsaWNrKSB7XG4gICAgICB0aGlzLl9tZW51LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fb25DbGljaylcbiAgICB9XG4gICAgaWYgKHRoaXMuX21lbnUgJiYgdGhpcy5fb25LZXlkb3duKSB7XG4gICAgICB0aGlzLl9tZW51LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLl9vbktleWRvd24pXG4gICAgfVxuICAgIHRoaXMuX3BvcG92ZXIgPSBudWxsXG4gICAgdGhpcy5fdHJpZ2dlciA9IG51bGxcbiAgICB0aGlzLl9tZW51ID0gbnVsbFxuICAgIHRoaXMuX29uVG9nZ2xlID0gbnVsbFxuICAgIHRoaXMuX29uQ2xpY2sgPSBudWxsXG4gICAgdGhpcy5fb25LZXlkb3duID0gbnVsbFxuICB9XG59XG5cbmV4cG9ydCB7IEV4b0Ryb3Bkb3duTWVudSB9XG4iLCAiY29uc3QgRXhvU2VsZWN0ID0ge1xuICBtb3VudGVkKCkgeyB0aGlzLl9iaW5kKCkgfSxcbiAgdXBkYXRlZCgpIHsgdGhpcy5fYmluZCgpIH0sXG4gIGRlc3Ryb3llZCgpIHsgdGhpcy5fdW5iaW5kKCkgfSxcblxuICBfYmluZCgpIHtcbiAgICB0aGlzLl91bmJpbmQoKVxuXG4gICAgdGhpcy5fdHJpZ2dlciA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvLXNlbGVjdD1cInRyaWdnZXJcIl0nKVxuICAgIGNvbnN0IHBvcG92ZXJJZCA9IHRoaXMuX3RyaWdnZXI/LmdldEF0dHJpYnV0ZSgncG9wb3ZlcnRhcmdldCcpXG4gICAgdGhpcy5fcG9wb3ZlciA9IHBvcG92ZXJJZCA/IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHBvcG92ZXJJZCkgOiBudWxsXG4gICAgdGhpcy5fbGlzdGJveCA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW3JvbGU9XCJsaXN0Ym94XCJdJylcbiAgICB0aGlzLl9oaWRkZW4gPSB0aGlzLmVsLmNsb3Nlc3QoJ1tkYXRhLWV4bz1cImZpZWxkXCJdJyk/LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W3R5cGU9XCJoaWRkZW5cIl0nKVxuXG4gICAgaWYgKCF0aGlzLl9wb3BvdmVyIHx8ICF0aGlzLl9saXN0Ym94KSByZXR1cm5cblxuICAgIC8vIFRvZ2dsZSBhcmlhLWV4cGFuZGVkIG9uIHBvcG92ZXIgb3Blbi9jbG9zZVxuICAgIHRoaXMuX29uVG9nZ2xlID0gKCkgPT4ge1xuICAgICAgY29uc3Qgb3BlbiA9IHRoaXMuX3BvcG92ZXIubWF0Y2hlcygnOnBvcG92ZXItb3BlbicpXG4gICAgICB0aGlzLl90cmlnZ2VyLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsIFN0cmluZyhvcGVuKSlcbiAgICAgIGlmIChvcGVuKSB7XG4gICAgICAgIC8vIEZvY3VzIHNlbGVjdGVkIG9wdGlvbiBvbmx5IFx1MjAxNCBkb24ndCBwcmUtaGlnaGxpZ2h0IGZpcnN0IG9wdGlvblxuICAgICAgICBjb25zdCBzZWxlY3RlZCA9IHRoaXMuX2xpc3Rib3gucXVlcnlTZWxlY3RvcignW2RhdGEtc2VsZWN0ZWRdJylcbiAgICAgICAgaWYgKHNlbGVjdGVkKSBzZWxlY3RlZC5mb2N1cygpXG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX3RyaWdnZXIuc2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJywgU3RyaW5nKHRoaXMuX3BvcG92ZXIubWF0Y2hlcygnOnBvcG92ZXItb3BlbicpKSlcbiAgICB0aGlzLl9wb3BvdmVyLmFkZEV2ZW50TGlzdGVuZXIoJ3RvZ2dsZScsIHRoaXMuX29uVG9nZ2xlKVxuXG4gICAgLy8gQ2xpY2sgb24gb3B0aW9uXG4gICAgdGhpcy5fb25DbGljayA9IChlKSA9PiB7XG4gICAgICBjb25zdCBvcHQgPSBlLnRhcmdldC5jbG9zZXN0KCdbZGF0YS1leG89XCJzZWxlY3Qtb3B0aW9uXCJdJylcbiAgICAgIGlmICghb3B0IHx8IG9wdC5oYXNBdHRyaWJ1dGUoJ2RhdGEtZGlzYWJsZWQnKSkgcmV0dXJuXG4gICAgICB0aGlzLl9zZWxlY3RPcHRpb24ob3B0KVxuICAgIH1cbiAgICB0aGlzLl9saXN0Ym94LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fb25DbGljaylcblxuICAgIC8vIEtleWJvYXJkIG5hdmlnYXRpb25cbiAgICB0aGlzLl9vbktleWRvd24gPSAoZSkgPT4ge1xuICAgICAgY29uc3Qgb3B0aW9ucyA9IFsuLi50aGlzLl9saXN0Ym94LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWV4bz1cInNlbGVjdC1vcHRpb25cIl06bm90KFtkYXRhLWRpc2FibGVkXSknKV1cbiAgICAgIGlmICghb3B0aW9ucy5sZW5ndGgpIHJldHVyblxuICAgICAgY29uc3QgaWR4ID0gb3B0aW9ucy5pbmRleE9mKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpXG4gICAgICBsZXQgbmV4dCA9IC0xXG5cbiAgICAgIHN3aXRjaCAoZS5rZXkpIHtcbiAgICAgICAgY2FzZSAnQXJyb3dEb3duJzpcbiAgICAgICAgICBuZXh0ID0gaWR4IDwgb3B0aW9ucy5sZW5ndGggLSAxID8gaWR4ICsgMSA6IDBcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlICdBcnJvd1VwJzpcbiAgICAgICAgICBuZXh0ID0gaWR4ID4gMCA/IGlkeCAtIDEgOiBvcHRpb25zLmxlbmd0aCAtIDFcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlICdIb21lJzpcbiAgICAgICAgICBuZXh0ID0gMFxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgJ0VuZCc6XG4gICAgICAgICAgbmV4dCA9IG9wdGlvbnMubGVuZ3RoIC0gMVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgJ0VudGVyJzpcbiAgICAgICAgY2FzZSAnICc6XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgaWYgKGlkeCA+PSAwKSB0aGlzLl9zZWxlY3RPcHRpb24ob3B0aW9uc1tpZHhdKVxuICAgICAgICAgIHJldHVyblxuICAgICAgICBjYXNlICdFc2NhcGUnOlxuICAgICAgICAgIHRoaXMuX3BvcG92ZXIuaGlkZVBvcG92ZXIoKVxuICAgICAgICAgIHRoaXMuX3RyaWdnZXIuZm9jdXMoKVxuICAgICAgICAgIHJldHVyblxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIC8vIFR5cGUtYWhlYWQ6IGp1bXAgdG8gb3B0aW9uIHN0YXJ0aW5nIHdpdGggdHlwZWQgY2hhcmFjdGVyXG4gICAgICAgICAgdGhpcy5fdHlwZUFoZWFkKGUua2V5LCBvcHRpb25zKVxuICAgICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIGlmIChuZXh0ID49IDApIG9wdGlvbnNbbmV4dF0uZm9jdXMoKVxuICAgIH1cbiAgICB0aGlzLl9saXN0Ym94LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLl9vbktleWRvd24pXG4gIH0sXG5cbiAgX3NlbGVjdE9wdGlvbihvcHQpIHtcbiAgICBjb25zdCB2YWx1ZSA9IG9wdC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdmFsdWUnKVxuICAgIGNvbnN0IHRleHQgPSBvcHQudGV4dENvbnRlbnQudHJpbSgpXG5cbiAgICAvLyBVcGRhdGUgaGlkZGVuIGlucHV0XG4gICAgaWYgKHRoaXMuX2hpZGRlbikge1xuICAgICAgdGhpcy5faGlkZGVuLnZhbHVlID0gdmFsdWVcbiAgICAgIHRoaXMuX2hpZGRlbi5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnaW5wdXQnLCB7IGJ1YmJsZXM6IHRydWUgfSkpXG4gICAgfVxuXG4gICAgLy8gVXBkYXRlIGFyaWEtc2VsZWN0ZWQgYW5kIGRhdGEtc2VsZWN0ZWQgb24gYWxsIG9wdGlvbnNcbiAgICB0aGlzLl9saXN0Ym94LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWV4bz1cInNlbGVjdC1vcHRpb25cIl0nKS5mb3JFYWNoKChvKSA9PiB7XG4gICAgICBjb25zdCBpc1NlbGVjdGVkID0gby5nZXRBdHRyaWJ1dGUoJ2RhdGEtdmFsdWUnKSA9PT0gdmFsdWVcbiAgICAgIG8uc2V0QXR0cmlidXRlKCdhcmlhLXNlbGVjdGVkJywgU3RyaW5nKGlzU2VsZWN0ZWQpKVxuICAgICAgaWYgKGlzU2VsZWN0ZWQpIHtcbiAgICAgICAgby5zZXRBdHRyaWJ1dGUoJ2RhdGEtc2VsZWN0ZWQnLCAnJylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG8ucmVtb3ZlQXR0cmlidXRlKCdkYXRhLXNlbGVjdGVkJylcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgLy8gVXBkYXRlIHRyaWdnZXIgZGlzcGxheSB0ZXh0XG4gICAgY29uc3QgdmFsdWVFbCA9IHRoaXMuX3RyaWdnZXIucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwic2VsZWN0LXZhbHVlXCJdJylcbiAgICBpZiAodmFsdWVFbCkge1xuICAgICAgdmFsdWVFbC50ZXh0Q29udGVudCA9IHRleHRcbiAgICAgIHZhbHVlRWwucmVtb3ZlQXR0cmlidXRlKCdkYXRhLXBsYWNlaG9sZGVyJylcbiAgICB9XG5cbiAgICAvLyBDbG9zZSBwb3BvdmVyXG4gICAgdGhpcy5fcG9wb3Zlci5oaWRlUG9wb3ZlcigpXG4gICAgdGhpcy5fdHJpZ2dlci5mb2N1cygpXG4gIH0sXG5cbiAgX3R5cGVBaGVhZChjaGFyLCBvcHRpb25zKSB7XG4gICAgaWYgKGNoYXIubGVuZ3RoICE9PSAxKSByZXR1cm5cbiAgICBjb25zdCBsb3dlciA9IGNoYXIudG9Mb3dlckNhc2UoKVxuICAgIGNvbnN0IGN1cnJlbnRJZHggPSBvcHRpb25zLmluZGV4T2YoZG9jdW1lbnQuYWN0aXZlRWxlbWVudClcbiAgICBjb25zdCBzdGFydCA9IGN1cnJlbnRJZHggKyAxXG4gICAgY29uc3Qgcm90YXRlZCA9IFsuLi5vcHRpb25zLnNsaWNlKHN0YXJ0KSwgLi4ub3B0aW9ucy5zbGljZSgwLCBzdGFydCldXG4gICAgY29uc3QgbWF0Y2ggPSByb3RhdGVkLmZpbmQobyA9PiBvLnRleHRDb250ZW50LnRyaW0oKS50b0xvd2VyQ2FzZSgpLnN0YXJ0c1dpdGgobG93ZXIpKVxuICAgIGlmIChtYXRjaCkgbWF0Y2guZm9jdXMoKVxuICB9LFxuXG4gIF91bmJpbmQoKSB7XG4gICAgaWYgKHRoaXMuX3BvcG92ZXIgJiYgdGhpcy5fb25Ub2dnbGUpIHtcbiAgICAgIHRoaXMuX3BvcG92ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG9nZ2xlJywgdGhpcy5fb25Ub2dnbGUpXG4gICAgfVxuICAgIGlmICh0aGlzLl9saXN0Ym94ICYmIHRoaXMuX29uQ2xpY2spIHtcbiAgICAgIHRoaXMuX2xpc3Rib3gucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9vbkNsaWNrKVxuICAgIH1cbiAgICBpZiAodGhpcy5fbGlzdGJveCAmJiB0aGlzLl9vbktleWRvd24pIHtcbiAgICAgIHRoaXMuX2xpc3Rib3gucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX29uS2V5ZG93bilcbiAgICB9XG4gICAgdGhpcy5fdHJpZ2dlciA9IG51bGxcbiAgICB0aGlzLl9wb3BvdmVyID0gbnVsbFxuICAgIHRoaXMuX2xpc3Rib3ggPSBudWxsXG4gICAgdGhpcy5faGlkZGVuID0gbnVsbFxuICAgIHRoaXMuX29uVG9nZ2xlID0gbnVsbFxuICAgIHRoaXMuX29uQ2xpY2sgPSBudWxsXG4gICAgdGhpcy5fb25LZXlkb3duID0gbnVsbFxuICB9XG59XG5cbmV4cG9ydCB7IEV4b1NlbGVjdCB9XG4iLCAiY29uc3QgRXhvQ29tYm9ib3ggPSB7XG4gIG1vdW50ZWQoKSB7IHRoaXMuX2JpbmQoKSB9LFxuICB1cGRhdGVkKCkgeyB0aGlzLl9iaW5kKCkgfSxcbiAgZGVzdHJveWVkKCkgeyB0aGlzLl91bmJpbmQoKSB9LFxuICBfYmluZCgpIHtcbiAgICB0aGlzLl91bmJpbmQoKVxuICAgIGNvbnN0IGlzSW5wdXRUcmlnZ2VyID0gdGhpcy5lbC5kYXRhc2V0LnRyaWdnZXIgPT09ICdpbnB1dCdcbiAgICBjb25zdCBmaWx0ZXIgPSB0aGlzLmVsLmRhdGFzZXQuZmlsdGVyIHx8ICdzZXJ2ZXInXG4gICAgY29uc3Qgb25GaWx0ZXIgPSB0aGlzLmVsLmRhdGFzZXQub25GaWx0ZXJcbiAgICBjb25zdCBkZWJvdW5jZSA9IHBhcnNlSW50KHRoaXMuZWwuZGF0YXNldC5kZWJvdW5jZSB8fCAnMzAwJywgMTApXG5cbiAgICB0aGlzLl9zZWFyY2ggPSBpc0lucHV0VHJpZ2dlclxuICAgICAgPyB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4by1jb21ib2JveD1cImlucHV0LXRyaWdnZXJcIl0nKVxuICAgICAgOiB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cImNvbWJvYm94LXNlYXJjaFwiXScpXG5cbiAgICBjb25zdCB0cmlnZ2VyQnRuID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG8tY29tYm9ib3g9XCJ0cmlnZ2VyXCJdJylcbiAgICBjb25zdCBwb3BvdmVySWQgPSB0cmlnZ2VyQnRuPy5nZXRBdHRyaWJ1dGUoJ3BvcG92ZXJ0YXJnZXQnKSB8fCB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cInBvcG92ZXItY29udGVudFwiXScpPy5pZFxuICAgIHRoaXMuX3BvcG92ZXIgPSBwb3BvdmVySWQgPyBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChwb3BvdmVySWQpIDogbnVsbFxuICAgIHRoaXMuX2hpZGRlbiA9IHRoaXMuZWwuY2xvc2VzdCgnW2RhdGEtZXhvPVwiZmllbGRcIl0nKT8ucXVlcnlTZWxlY3RvcignaW5wdXRbdHlwZT1cImhpZGRlblwiXScpXG4gICAgdGhpcy5fbGlzdGJveCA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW3JvbGU9XCJsaXN0Ym94XCJdJylcbiAgICB0aGlzLl9lbXB0eSA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwiY29tYm9ib3gtZW1wdHlcIl0nKVxuICAgIHRoaXMuX2NyZWF0ZSA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwiY29tYm9ib3gtY3JlYXRlXCJdJylcblxuICAgIHRoaXMuX2NsZWFyID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJjb21ib2JveC1jbGVhclwiXScpXG5cbiAgICBpZiAoIXRoaXMuX3BvcG92ZXIpIHJldHVyblxuXG4gICAgY29uc3Qgc3luY0V4cGFuZGVkID0gKCkgPT4ge1xuICAgICAgY29uc3Qgb3BlbiA9IHRoaXMuX3BvcG92ZXIubWF0Y2hlcygnOnBvcG92ZXItb3BlbicpXG4gICAgICBpZiAodHJpZ2dlckJ0bikgdHJpZ2dlckJ0bi5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCBTdHJpbmcob3BlbikpXG4gICAgICBpZiAodGhpcy5fc2VhcmNoKSB0aGlzLl9zZWFyY2guc2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJywgU3RyaW5nKG9wZW4pKVxuICAgIH1cblxuICAgIGNvbnN0IGZvY3VzU2VhcmNoID0gKCkgPT4ge1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5fcG9wb3Zlcj8ubWF0Y2hlcygnOnBvcG92ZXItb3BlbicpKSByZXR1cm5cbiAgICAgICAgdGhpcy5fc2VhcmNoPy5mb2N1cygpXG5cbiAgICAgICAgaWYgKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IHRoaXMuX3NlYXJjaCkge1xuICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5fcG9wb3Zlcj8ubWF0Y2hlcygnOnBvcG92ZXItb3BlbicpKSB0aGlzLl9zZWFyY2g/LmZvY3VzKClcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9LCAwKVxuICAgIH1cblxuICAgIHN5bmNFeHBhbmRlZCgpXG5cbiAgICAvLyBDbGVhciBidXR0b25cbiAgICBpZiAodGhpcy5fY2xlYXIpIHtcbiAgICAgIHRoaXMuX29uQ2xlYXIgPSAoZSkgPT4ge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgIGlmICh0aGlzLl9oaWRkZW4pIHtcbiAgICAgICAgICB0aGlzLl9oaWRkZW4udmFsdWUgPSAnJ1xuICAgICAgICAgIHRoaXMuX2hpZGRlbi5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnaW5wdXQnLCB7IGJ1YmJsZXM6IHRydWUgfSkpXG4gICAgICAgIH1cbiAgICAgICAgLy8gUmVzZXQgdHJpZ2dlciBkaXNwbGF5XG4gICAgICAgIGNvbnN0IHZhbFNwYW4gPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cImNvbWJvYm94LXZhbHVlXCJdJylcbiAgICAgICAgaWYgKHZhbFNwYW4pIHtcbiAgICAgICAgICB2YWxTcGFuLnRleHRDb250ZW50ID0gdGhpcy5fc2VhcmNoPy5wbGFjZWhvbGRlciB8fCAnJ1xuICAgICAgICAgIHZhbFNwYW4uc2V0QXR0cmlidXRlKCdkYXRhLXBsYWNlaG9sZGVyJywgJycpXG4gICAgICAgIH1cbiAgICAgICAgLy8gQ2xlYXIgdmlzdWFsIHNlbGVjdGlvblxuICAgICAgICBpZiAodGhpcy5fbGlzdGJveCkge1xuICAgICAgICAgIHRoaXMuX2xpc3Rib3gucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZXhvPVwiY29tYm9ib3gtb3B0aW9uXCJdJykuZm9yRWFjaChvID0+IHtcbiAgICAgICAgICAgIG8uc2V0QXR0cmlidXRlKCdhcmlhLXNlbGVjdGVkJywgJ2ZhbHNlJylcbiAgICAgICAgICAgIGRlbGV0ZSBvLmRhdGFzZXQuc2VsZWN0ZWRcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLl9jbGVhci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX29uQ2xlYXIpXG4gICAgfVxuXG4gICAgLy8gVG9nZ2xlIGV2ZW50IGZvciBhcmlhLWV4cGFuZGVkXG4gICAgdGhpcy5fb25Ub2dnbGUgPSAoKSA9PiB7XG4gICAgICBjb25zdCBvcGVuID0gdGhpcy5fcG9wb3Zlci5tYXRjaGVzKCc6cG9wb3Zlci1vcGVuJylcbiAgICAgIHN5bmNFeHBhbmRlZCgpXG4gICAgICBpZiAob3BlbiAmJiB0aGlzLl9zZWFyY2ggJiYgIWlzSW5wdXRUcmlnZ2VyKSB7XG4gICAgICAgIHRoaXMuX3NlYXJjaC52YWx1ZSA9ICcnXG4gICAgICAgIGlmIChmaWx0ZXIgPT09ICdjbGllbnQnKSB0aGlzLl9jbGllbnRGaWx0ZXIoJycpXG4gICAgICAgIGZvY3VzU2VhcmNoKClcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5fcG9wb3Zlci5hZGRFdmVudExpc3RlbmVyKCd0b2dnbGUnLCB0aGlzLl9vblRvZ2dsZSlcblxuICAgIC8vIElucHV0IHRyaWdnZXI6IG9wZW4vY2xvc2UgdmlhIEpTXG4gICAgaWYgKGlzSW5wdXRUcmlnZ2VyICYmIHRoaXMuX3NlYXJjaCkge1xuICAgICAgdGhpcy5fb25Gb2N1cyA9ICgpID0+IHtcbiAgICAgICAgdHJ5IHsgdGhpcy5fcG9wb3Zlci5zaG93UG9wb3ZlcigpIH0gY2F0Y2goX2Vycikge31cbiAgICAgIH1cbiAgICAgIHRoaXMuX29uQmx1ciA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgcG9wb3ZlciA9IHRoaXMuX3BvcG92ZXJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgaWYgKCFwb3BvdmVyKSByZXR1cm5cbiAgICAgICAgICBpZiAoIXBvcG92ZXIuY29udGFpbnMoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCkgJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAhPT0gdGhpcy5fc2VhcmNoKSB7XG4gICAgICAgICAgICB0cnkgeyBwb3BvdmVyLmhpZGVQb3BvdmVyKCkgfSBjYXRjaChfZXJyKSB7fVxuICAgICAgICAgIH1cbiAgICAgICAgfSwgMjAwKVxuICAgICAgfVxuICAgICAgdGhpcy5fc2VhcmNoLmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgdGhpcy5fb25Gb2N1cylcbiAgICAgIHRoaXMuX3NlYXJjaC5hZGRFdmVudExpc3RlbmVyKCdibHVyJywgdGhpcy5fb25CbHVyKVxuICAgIH1cblxuICAgIC8vIFNlYXJjaCBpbnB1dCBoYW5kbGVyXG4gICAgaWYgKHRoaXMuX3NlYXJjaCkge1xuICAgICAgdGhpcy5fb25JbnB1dCA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgcXVlcnkgPSB0aGlzLl9zZWFyY2gudmFsdWVcbiAgICAgICAgaWYgKGZpbHRlciA9PT0gJ2NsaWVudCcpIHtcbiAgICAgICAgICB0aGlzLl9jbGllbnRGaWx0ZXIocXVlcnkpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2RlYm91bmNlVGltZXIpXG4gICAgICAgICAgdGhpcy5fZGVib3VuY2VUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgaWYgKG9uRmlsdGVyKSB0aGlzLnB1c2hFdmVudChvbkZpbHRlciwgeyBxdWVyeSB9KVxuICAgICAgICAgIH0sIGRlYm91bmNlKVxuICAgICAgICB9XG4gICAgICAgIC8vIFVwZGF0ZSBjcmVhdGUgb3B0aW9uIHRleHRcbiAgICAgICAgaWYgKHRoaXMuX2NyZWF0ZSkge1xuICAgICAgICAgIGNvbnN0IHNwYW4gPSB0aGlzLl9jcmVhdGUucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwiY29tYm9ib3gtY3JlYXRlLXF1ZXJ5XCJdJylcbiAgICAgICAgICBpZiAoc3Bhbikgc3Bhbi50ZXh0Q29udGVudCA9IHF1ZXJ5XG4gICAgICAgICAgdGhpcy5fY3JlYXRlLmhpZGRlbiA9ICFxdWVyeVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLl9zZWFyY2guYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCB0aGlzLl9vbklucHV0KVxuICAgIH1cblxuICAgIC8vIE9wdGlvbiBjbGlja1xuICAgIGlmICh0aGlzLl9saXN0Ym94KSB7XG4gICAgICB0aGlzLl9vbkNsaWNrID0gKGUpID0+IHtcbiAgICAgICAgY29uc3Qgb3B0ID0gZS50YXJnZXQuY2xvc2VzdCgnW2RhdGEtZXhvPVwiY29tYm9ib3gtb3B0aW9uXCJdOm5vdChbZGF0YS1kaXNhYmxlZF0pJylcbiAgICAgICAgaWYgKCFvcHQpIHJldHVyblxuICAgICAgICB0aGlzLl9zZWxlY3RPcHRpb24ob3B0KVxuICAgICAgfVxuICAgICAgdGhpcy5fbGlzdGJveC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX29uQ2xpY2spXG5cbiAgICAgIC8vIEtleWJvYXJkXG4gICAgICB0aGlzLl9vbktleWRvd24gPSAoZSkgPT4ge1xuICAgICAgICBjb25zdCBvcHRzID0gWy4uLnRoaXMuX2xpc3Rib3gucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZXhvPVwiY29tYm9ib3gtb3B0aW9uXCJdOm5vdChbZGF0YS1kaXNhYmxlZF0pOm5vdChbaGlkZGVuXSknKV1cbiAgICAgICAgaWYgKCFvcHRzLmxlbmd0aCkgcmV0dXJuXG4gICAgICAgIGNvbnN0IGlkeCA9IG9wdHMuaW5kZXhPZihkb2N1bWVudC5hY3RpdmVFbGVtZW50KVxuICAgICAgICBsZXQgbmV4dCA9IC0xXG4gICAgICAgIHN3aXRjaCAoZS5rZXkpIHtcbiAgICAgICAgICBjYXNlICdBcnJvd0Rvd24nOiBuZXh0ID0gaWR4IDwgb3B0cy5sZW5ndGggLSAxID8gaWR4ICsgMSA6IDA7IGJyZWFrXG4gICAgICAgICAgY2FzZSAnQXJyb3dVcCc6IG5leHQgPSBpZHggPiAwID8gaWR4IC0gMSA6IG9wdHMubGVuZ3RoIC0gMTsgYnJlYWtcbiAgICAgICAgICBjYXNlICdIb21lJzogbmV4dCA9IDA7IGJyZWFrXG4gICAgICAgICAgY2FzZSAnRW5kJzogbmV4dCA9IG9wdHMubGVuZ3RoIC0gMTsgYnJlYWtcbiAgICAgICAgICBjYXNlICdFbnRlcic6XG4gICAgICAgICAgICBpZiAoaWR4ID49IDApIHsgdGhpcy5fc2VsZWN0T3B0aW9uKG9wdHNbaWR4XSk7IGUucHJldmVudERlZmF1bHQoKSB9XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICBjYXNlICdFc2NhcGUnOlxuICAgICAgICAgICAgdHJ5IHsgdGhpcy5fcG9wb3Zlci5oaWRlUG9wb3ZlcigpIH0gY2F0Y2goX2Vycikge31cbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgIGRlZmF1bHQ6IHJldHVyblxuICAgICAgICB9XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICBvcHRzW25leHRdPy5mb2N1cygpXG4gICAgICB9XG4gICAgICB0aGlzLl9wb3BvdmVyLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLl9vbktleWRvd24pXG4gICAgfVxuICB9LFxuICBfY2xpZW50RmlsdGVyKHF1ZXJ5KSB7XG4gICAgaWYgKCF0aGlzLl9saXN0Ym94KSByZXR1cm5cbiAgICBjb25zdCBxID0gcXVlcnkudG9Mb3dlckNhc2UoKVxuICAgIGxldCBoYXNWaXNpYmxlID0gZmFsc2VcbiAgICB0aGlzLl9saXN0Ym94LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWV4bz1cImNvbWJvYm94LW9wdGlvblwiXScpLmZvckVhY2gob3B0ID0+IHtcbiAgICAgIGNvbnN0IG1hdGNoID0gIXEgfHwgb3B0LnRleHRDb250ZW50LnRyaW0oKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHEpXG4gICAgICBvcHQuaGlkZGVuID0gIW1hdGNoXG4gICAgICBpZiAobWF0Y2gpIGhhc1Zpc2libGUgPSB0cnVlXG4gICAgfSlcbiAgICBpZiAodGhpcy5fZW1wdHkpIHRoaXMuX2VtcHR5LmhpZGRlbiA9IGhhc1Zpc2libGVcbiAgfSxcbiAgX3NlbGVjdE9wdGlvbihvcHQpIHtcbiAgICBjb25zdCB2YWx1ZSA9IG9wdC5kYXRhc2V0LnZhbHVlXG4gICAgaWYgKHRoaXMuX2hpZGRlbikge1xuICAgICAgdGhpcy5faGlkZGVuLnZhbHVlID0gdmFsdWVcbiAgICAgIHRoaXMuX2hpZGRlbi5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnaW5wdXQnLCB7IGJ1YmJsZXM6IHRydWUgfSkpXG4gICAgfVxuICAgIC8vIFVwZGF0ZSB2aXN1YWwgc3RhdGVcbiAgICBpZiAodGhpcy5fbGlzdGJveCkge1xuICAgICAgdGhpcy5fbGlzdGJveC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1leG89XCJjb21ib2JveC1vcHRpb25cIl0nKS5mb3JFYWNoKG8gPT4ge1xuICAgICAgICBvLnNldEF0dHJpYnV0ZSgnYXJpYS1zZWxlY3RlZCcsIFN0cmluZyhvLmRhdGFzZXQudmFsdWUgPT09IHZhbHVlKSlcbiAgICAgICAgaWYgKG8uZGF0YXNldC52YWx1ZSA9PT0gdmFsdWUpIG8uZGF0YXNldC5zZWxlY3RlZCA9ICcnXG4gICAgICAgIGVsc2UgZGVsZXRlIG8uZGF0YXNldC5zZWxlY3RlZFxuICAgICAgfSlcbiAgICB9XG4gICAgLy8gVXBkYXRlIHRyaWdnZXIgZGlzcGxheVxuICAgIGNvbnN0IHZhbFNwYW4gPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cImNvbWJvYm94LXZhbHVlXCJdJylcbiAgICBpZiAodmFsU3Bhbikge1xuICAgICAgdmFsU3Bhbi50ZXh0Q29udGVudCA9IG9wdC50ZXh0Q29udGVudC50cmltKClcbiAgICAgIHZhbFNwYW4ucmVtb3ZlQXR0cmlidXRlKCdkYXRhLXBsYWNlaG9sZGVyJylcbiAgICB9XG4gICAgdHJ5IHsgdGhpcy5fcG9wb3Zlcj8uaGlkZVBvcG92ZXIoKSB9IGNhdGNoKF9lcnIpIHt9XG4gIH0sXG4gIF91bmJpbmQoKSB7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuX2RlYm91bmNlVGltZXIpXG4gICAgdGhpcy5fZGVib3VuY2VUaW1lciA9IG51bGxcbiAgICBpZiAodGhpcy5fcG9wb3Zlcikge1xuICAgICAgaWYgKHRoaXMuX29uVG9nZ2xlKSB0aGlzLl9wb3BvdmVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvZ2dsZScsIHRoaXMuX29uVG9nZ2xlKVxuICAgICAgaWYgKHRoaXMuX29uS2V5ZG93bikgdGhpcy5fcG9wb3Zlci5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5fb25LZXlkb3duKVxuICAgIH1cbiAgICBpZiAodGhpcy5fbGlzdGJveCAmJiB0aGlzLl9vbkNsaWNrKSB0aGlzLl9saXN0Ym94LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fb25DbGljaylcbiAgICBpZiAodGhpcy5fc2VhcmNoKSB7XG4gICAgICBpZiAodGhpcy5fb25JbnB1dCkgdGhpcy5fc2VhcmNoLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2lucHV0JywgdGhpcy5fb25JbnB1dClcbiAgICAgIGlmICh0aGlzLl9vbkZvY3VzKSB0aGlzLl9zZWFyY2gucmVtb3ZlRXZlbnRMaXN0ZW5lcignZm9jdXMnLCB0aGlzLl9vbkZvY3VzKVxuICAgICAgaWYgKHRoaXMuX29uQmx1cikgdGhpcy5fc2VhcmNoLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2JsdXInLCB0aGlzLl9vbkJsdXIpXG4gICAgfVxuICAgIGlmICh0aGlzLl9jbGVhciAmJiB0aGlzLl9vbkNsZWFyKSB0aGlzLl9jbGVhci5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX29uQ2xlYXIpXG4gICAgdGhpcy5fcG9wb3ZlciA9IG51bGxcbiAgICB0aGlzLl9saXN0Ym94ID0gbnVsbFxuICAgIHRoaXMuX3NlYXJjaCA9IG51bGxcbiAgICB0aGlzLl9jbGVhciA9IG51bGxcbiAgICB0aGlzLl9lbXB0eSA9IG51bGxcbiAgICB0aGlzLl9jcmVhdGUgPSBudWxsXG4gICAgdGhpcy5faGlkZGVuID0gbnVsbFxuICB9XG59XG5cbmV4cG9ydCB7IEV4b0NvbWJvYm94IH1cbiIsICJsZXQgbGFzdEhpZGVUaW1lID0gMFxuY29uc3QgU0tJUF9ERUxBWV9NUyA9IDMwMFxuY29uc3QgaGFzQW5jaG9yUG9zID1cbiAgdHlwZW9mIENTUyAhPT0gJ3VuZGVmaW5lZCcgJiYgQ1NTLnN1cHBvcnRzKCdwb3NpdGlvbi1hcmVhJywgJ3RvcCcpXG5cbmNvbnN0IEdBUCA9IDQgLy8gbWF0Y2hlcyB2YXIoLS1leG8tc3BhY2UtMSlcblxuY29uc3QgRXhvVG9vbHRpcCA9IHtcbiAgbW91bnRlZCgpIHsgdGhpcy5fYmluZCgpIH0sXG4gIHVwZGF0ZWQoKSB7IHRoaXMuX2JpbmQoKSB9LFxuICBkZXN0cm95ZWQoKSB7IHRoaXMuX3VuYmluZCgpIH0sXG5cbiAgX2JpbmQoKSB7XG4gICAgdGhpcy5fdW5iaW5kKClcbiAgICBjb25zdCB3cmFwcGVyID0gdGhpcy5lbFxuICAgIGNvbnN0IGFuY2hvciA9IHdyYXBwZXIucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwidG9vbHRpcC1hbmNob3JcIl0nKVxuICAgIGNvbnN0IGNvbnRlbnQgPSB3cmFwcGVyLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cInRvb2x0aXAtY29udGVudFwiXScpXG4gICAgaWYgKCFhbmNob3IgfHwgIWNvbnRlbnQpIHJldHVyblxuXG4gICAgdGhpcy5fd3JhcHBlciA9IHdyYXBwZXJcbiAgICB0aGlzLl9hbmNob3IgPSBhbmNob3JcbiAgICB0aGlzLl9jb250ZW50ID0gY29udGVudFxuICAgIHRoaXMuX3RpbWVvdXQgPSBudWxsXG4gICAgdGhpcy5fZGVjbGFyZWRTaWRlID0gY29udGVudC5kYXRhc2V0LnNpZGVcbiAgICB0aGlzLl9kZWxheSA9IHBhcnNlSW50KGNvbnRlbnQuZGF0YXNldC5kZWxheSkgfHwgNTAwXG5cbiAgICAvLyBVcGdyYWRlIHRvIHBvcG92ZXIgQVBJIFx1MjAxNCBlbmFibGVzIHRvcC1sYXllciByZW5kZXJpbmcuXG4gICAgLy8gQmVmb3JlIHRoaXMsIENTUy1vbmx5IDpob3ZlciBmYWxsYmFjayBrZWVwcyB0aGUgdG9vbHRpcCBmdW5jdGlvbmFsLlxuICAgIGNvbnRlbnQuc2V0QXR0cmlidXRlKCdwb3BvdmVyJywgJ21hbnVhbCcpXG5cbiAgICBjb25zdCBzaG93ID0gKCkgPT4ge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3RpbWVvdXQpXG4gICAgICBjb25zdCBlbGFwc2VkID0gRGF0ZS5ub3coKSAtIGxhc3RIaWRlVGltZVxuICAgICAgY29uc3Qgd2FpdCA9IGVsYXBzZWQgPCBTS0lQX0RFTEFZX01TID8gMCA6IHRoaXMuX2RlbGF5XG4gICAgICB0aGlzLl90aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRyeSB7IGNvbnRlbnQuc2hvd1BvcG92ZXIoKSB9IGNhdGNoIChfKSB7IHJldHVybiB9XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICAgICAgaWYgKCFoYXNBbmNob3JQb3MpIHRoaXMuX3Bvc2l0aW9uRmFsbGJhY2soKVxuICAgICAgICAgIHRoaXMuX2RldGVjdEZsaXAoKVxuICAgICAgICB9KVxuICAgICAgfSwgd2FpdClcbiAgICB9XG5cbiAgICBjb25zdCBoaWRlID0gKCkgPT4ge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3RpbWVvdXQpXG4gICAgICBsZXQgZGlkSGlkZSA9IGZhbHNlXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoY29udGVudC5tYXRjaGVzKCc6cG9wb3Zlci1vcGVuJykpIHtcbiAgICAgICAgICBjb250ZW50LmhpZGVQb3BvdmVyKClcbiAgICAgICAgICBkaWRIaWRlID0gdHJ1ZVxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChfKSB7fVxuICAgICAgaWYgKGRpZEhpZGUpIHtcbiAgICAgICAgbGFzdEhpZGVUaW1lID0gRGF0ZS5ub3coKVxuICAgICAgICBjb250ZW50LmRhdGFzZXQuc2lkZSA9IHRoaXMuX2RlY2xhcmVkU2lkZVxuICAgICAgICBpZiAoIWhhc0FuY2hvclBvcykge1xuICAgICAgICAgIGNvbnRlbnQuc3R5bGUudG9wID0gJydcbiAgICAgICAgICBjb250ZW50LnN0eWxlLmxlZnQgPSAnJ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5fc2hvdyA9ICgpID0+IHNob3coKVxuICAgIHRoaXMuX2hpZGUgPSAoKSA9PiBoaWRlKClcbiAgICB0aGlzLl9mb2N1c0luID0gKCkgPT4gc2hvdygpXG4gICAgdGhpcy5fZm9jdXNPdXQgPSAoZSkgPT4ge1xuICAgICAgaWYgKCF3cmFwcGVyLmNvbnRhaW5zKGUucmVsYXRlZFRhcmdldCkpIGhpZGUoKVxuICAgIH1cbiAgICB0aGlzLl9rZXlkb3duID0gKGUpID0+IHtcbiAgICAgIGlmIChlLmtleSA9PT0gJ0VzY2FwZScpIGhpZGUoKVxuICAgIH1cblxuICAgIHdyYXBwZXIuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsIHRoaXMuX3Nob3cpXG4gICAgd3JhcHBlci5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgdGhpcy5faGlkZSlcbiAgICBhbmNob3IuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXNpbicsIHRoaXMuX2ZvY3VzSW4pXG4gICAgYW5jaG9yLmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3Vzb3V0JywgdGhpcy5fZm9jdXNPdXQpXG4gICAgd3JhcHBlci5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5fa2V5ZG93bilcbiAgfSxcblxuICAvKiogRGV0ZWN0IGlmIGFuY2hvciBwb3NpdGlvbmluZyBmbGlwcGVkIHRoZSBzaWRlIGFuZCB1cGRhdGUgZGF0YS1zaWRlIGZvciBhcnJvdyBDU1MuICovXG4gIF9kZXRlY3RGbGlwKCkge1xuICAgIGNvbnN0IGFyID0gdGhpcy5fYW5jaG9yLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgY29uc3QgY3IgPSB0aGlzLl9jb250ZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgbGV0IGFjdHVhbFxuICAgIGlmIChjci5ib3R0b20gPD0gYXIudG9wICsgMSkgYWN0dWFsID0gJ3RvcCdcbiAgICBlbHNlIGlmIChjci50b3AgPj0gYXIuYm90dG9tIC0gMSkgYWN0dWFsID0gJ2JvdHRvbSdcbiAgICBlbHNlIGlmIChjci5yaWdodCA8PSBhci5sZWZ0ICsgMSkgYWN0dWFsID0gJ2xlZnQnXG4gICAgZWxzZSBpZiAoY3IubGVmdCA+PSBhci5yaWdodCAtIDEpIGFjdHVhbCA9ICdyaWdodCdcbiAgICBlbHNlIGFjdHVhbCA9IHRoaXMuX2RlY2xhcmVkU2lkZVxuICAgIHRoaXMuX2NvbnRlbnQuZGF0YXNldC5zaWRlID0gYWN0dWFsXG4gIH0sXG5cbiAgLyoqIEpTIHBvc2l0aW9uaW5nIGZvciBicm93c2VycyB3aXRob3V0IENTUyBhbmNob3IgcG9zaXRpb25pbmcgKFNhZmFyaSkuICovXG4gIF9wb3NpdGlvbkZhbGxiYWNrKCkge1xuICAgIGNvbnN0IGFyID0gdGhpcy5fYW5jaG9yLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgY29uc3QgY3cgPSB0aGlzLl9jb250ZW50Lm9mZnNldFdpZHRoXG4gICAgY29uc3QgY2ggPSB0aGlzLl9jb250ZW50Lm9mZnNldEhlaWdodFxuICAgIGNvbnN0IHNpZGUgPSB0aGlzLl9kZWNsYXJlZFNpZGVcbiAgICBjb25zdCBhbGlnbiA9IHRoaXMuX2NvbnRlbnQuZGF0YXNldC5hbGlnbiB8fCAnY2VudGVyJ1xuICAgIGxldCB0b3AsIGxlZnRcblxuICAgIGlmIChzaWRlID09PSAndG9wJyB8fCBzaWRlID09PSAnYm90dG9tJykge1xuICAgICAgdG9wID0gc2lkZSA9PT0gJ3RvcCcgPyBhci50b3AgLSBjaCAtIEdBUCA6IGFyLmJvdHRvbSArIEdBUFxuICAgICAgaWYgKGFsaWduID09PSAnc3RhcnQnKSBsZWZ0ID0gYXIubGVmdFxuICAgICAgZWxzZSBpZiAoYWxpZ24gPT09ICdlbmQnKSBsZWZ0ID0gYXIucmlnaHQgLSBjd1xuICAgICAgZWxzZSBsZWZ0ID0gYXIubGVmdCArIChhci53aWR0aCAtIGN3KSAvIDJcbiAgICB9IGVsc2Uge1xuICAgICAgbGVmdCA9IHNpZGUgPT09ICdsZWZ0JyA/IGFyLmxlZnQgLSBjdyAtIEdBUCA6IGFyLnJpZ2h0ICsgR0FQXG4gICAgICB0b3AgPSBhci50b3AgKyAoYXIuaGVpZ2h0IC0gY2gpIC8gMlxuICAgIH1cblxuICAgIHRoaXMuX2NvbnRlbnQuc3R5bGUudG9wID0gYCR7dG9wfXB4YFxuICAgIHRoaXMuX2NvbnRlbnQuc3R5bGUubGVmdCA9IGAke2xlZnR9cHhgXG4gIH0sXG5cbiAgX3VuYmluZCgpIHtcbiAgICBjbGVhclRpbWVvdXQodGhpcy5fdGltZW91dClcbiAgICBpZiAodGhpcy5fd3JhcHBlcikge1xuICAgICAgaWYgKHRoaXMuX3Nob3cpIHRoaXMuX3dyYXBwZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsIHRoaXMuX3Nob3cpXG4gICAgICBpZiAodGhpcy5faGlkZSkgdGhpcy5fd3JhcHBlci5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgdGhpcy5faGlkZSlcbiAgICAgIGlmICh0aGlzLl9rZXlkb3duKSB0aGlzLl93cmFwcGVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLl9rZXlkb3duKVxuICAgIH1cbiAgICBpZiAodGhpcy5fYW5jaG9yKSB7XG4gICAgICBpZiAodGhpcy5fZm9jdXNJbikgdGhpcy5fYW5jaG9yLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2ZvY3VzaW4nLCB0aGlzLl9mb2N1c0luKVxuICAgICAgaWYgKHRoaXMuX2ZvY3VzT3V0KSB0aGlzLl9hbmNob3IucmVtb3ZlRXZlbnRMaXN0ZW5lcignZm9jdXNvdXQnLCB0aGlzLl9mb2N1c091dClcbiAgICB9XG4gICAgdGhpcy5fd3JhcHBlciA9IG51bGxcbiAgICB0aGlzLl9hbmNob3IgPSBudWxsXG4gICAgdGhpcy5fY29udGVudCA9IG51bGxcbiAgICB0aGlzLl9zaG93ID0gbnVsbFxuICAgIHRoaXMuX2hpZGUgPSBudWxsXG4gICAgdGhpcy5fZm9jdXNJbiA9IG51bGxcbiAgICB0aGlzLl9mb2N1c091dCA9IG51bGxcbiAgICB0aGlzLl9rZXlkb3duID0gbnVsbFxuICAgIHRoaXMuX3RpbWVvdXQgPSBudWxsXG4gIH1cbn1cblxuZXhwb3J0IHsgRXhvVG9vbHRpcCB9XG4iLCAiY29uc3QgRXhvSG92ZXJDYXJkID0ge1xuICBtb3VudGVkKCkgeyB0aGlzLl9iaW5kKCkgfSxcbiAgdXBkYXRlZCgpIHsgdGhpcy5fYmluZCgpIH0sXG4gIGRlc3Ryb3llZCgpIHsgdGhpcy5fdW5iaW5kKCkgfSxcblxuICBfYmluZCgpIHtcbiAgICB0aGlzLl91bmJpbmQoKVxuICAgIHRoaXMudHJpZ2dlciA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwiaG92ZXItY2FyZC10cmlnZ2VyXCJdJylcbiAgICB0aGlzLmNvbnRlbnQgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cImhvdmVyLWNhcmQtY29udGVudFwiXScpXG4gICAgaWYgKCF0aGlzLnRyaWdnZXIgfHwgIXRoaXMuY29udGVudCkgcmV0dXJuXG4gICAgdGhpcy5fc2hvd1RpbWVvdXQgPSBudWxsXG4gICAgdGhpcy5faGlkZVRpbWVvdXQgPSBudWxsXG4gICAgdGhpcy5fb3BlbkRlbGF5ID0gTnVtYmVyLnBhcnNlSW50KHRoaXMuZWwuZGF0YXNldC5vcGVuRGVsYXkgfHwgXCIzMDBcIiwgMTApXG4gICAgdGhpcy5fY2xvc2VEZWxheSA9IE51bWJlci5wYXJzZUludCh0aGlzLmVsLmRhdGFzZXQuY2xvc2VEZWxheSB8fCBcIjE1MFwiLCAxMClcblxuICAgIHRoaXMuX3Nob3cgPSAoKSA9PiB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5faGlkZVRpbWVvdXQpXG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fc2hvd1RpbWVvdXQpXG4gICAgICB0aGlzLl9zaG93VGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmNvbnRlbnQuaGlkZGVuID0gZmFsc2VcbiAgICAgICAgdGhpcy5jb250ZW50LnNldEF0dHJpYnV0ZShcImRhdGEtb3BlblwiLCBcIlwiKVxuICAgICAgICB0aGlzLnRyaWdnZXIuc2V0QXR0cmlidXRlKFwiYXJpYS1leHBhbmRlZFwiLCBcInRydWVcIilcbiAgICAgIH0sIHRoaXMuX29wZW5EZWxheSlcbiAgICB9XG5cbiAgICB0aGlzLl9oaWRlID0gKCkgPT4ge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3Nob3dUaW1lb3V0KVxuICAgICAgdGhpcy5faGlkZVRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5jb250ZW50LnJlbW92ZUF0dHJpYnV0ZShcImRhdGEtb3BlblwiKVxuICAgICAgICB0aGlzLmNvbnRlbnQuaGlkZGVuID0gdHJ1ZVxuICAgICAgICB0aGlzLnRyaWdnZXIuc2V0QXR0cmlidXRlKFwiYXJpYS1leHBhbmRlZFwiLCBcImZhbHNlXCIpXG4gICAgICB9LCB0aGlzLl9jbG9zZURlbGF5KVxuICAgIH1cblxuICAgIHRoaXMuX29uRm9jdXNPdXQgPSAoZXZlbnQpID0+IHtcbiAgICAgIGlmICghdGhpcy5lbC5jb250YWlucyhldmVudC5yZWxhdGVkVGFyZ2V0KSkgdGhpcy5faGlkZSgpXG4gICAgfVxuXG4gICAgdGhpcy5fb25LZXlkb3duID0gKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoZXZlbnQua2V5ICE9PSBcIkVzY2FwZVwiIHx8ICF0aGlzLmNvbnRlbnQuaGFzQXR0cmlidXRlKFwiZGF0YS1vcGVuXCIpKSByZXR1cm5cblxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgdGhpcy5faGlkZU5vdygpXG4gICAgICB0aGlzLl9maXJzdEZvY3VzYWJsZVRyaWdnZXIoKT8uZm9jdXM/Lih7IHByZXZlbnRTY3JvbGw6IHRydWUgfSlcbiAgICB9XG5cbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoXCJwb2ludGVyZW50ZXJcIiwgdGhpcy5fc2hvdylcbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoXCJwb2ludGVybGVhdmVcIiwgdGhpcy5faGlkZSlcbiAgICB0aGlzLnRyaWdnZXIuYWRkRXZlbnRMaXN0ZW5lcihcImZvY3VzaW5cIiwgdGhpcy5fc2hvdylcbiAgICB0aGlzLnRyaWdnZXIuYWRkRXZlbnRMaXN0ZW5lcihcImZvY3Vzb3V0XCIsIHRoaXMuX29uRm9jdXNPdXQpXG4gICAgdGhpcy5jb250ZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJmb2N1c2luXCIsIHRoaXMuX3Nob3cpXG4gICAgdGhpcy5jb250ZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJmb2N1c291dFwiLCB0aGlzLl9vbkZvY3VzT3V0KVxuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5fb25LZXlkb3duKVxuICAgIHRoaXMuZWwuZGF0YXNldC5yZWFkeSA9IFwidHJ1ZVwiXG4gIH0sXG5cbiAgX2hpZGVOb3coKSB7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuX3Nob3dUaW1lb3V0KVxuICAgIGNsZWFyVGltZW91dCh0aGlzLl9oaWRlVGltZW91dClcbiAgICB0aGlzLmNvbnRlbnQucmVtb3ZlQXR0cmlidXRlKFwiZGF0YS1vcGVuXCIpXG4gICAgdGhpcy5jb250ZW50LmhpZGRlbiA9IHRydWVcbiAgICB0aGlzLnRyaWdnZXI/LnNldEF0dHJpYnV0ZShcImFyaWEtZXhwYW5kZWRcIiwgXCJmYWxzZVwiKVxuICB9LFxuXG4gIF9maXJzdEZvY3VzYWJsZVRyaWdnZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMudHJpZ2dlcj8ucXVlcnlTZWxlY3RvcihcImFbaHJlZl0sYnV0dG9uOm5vdChbZGlzYWJsZWRdKSxbdGFiaW5kZXhdOm5vdChbdGFiaW5kZXg9Jy0xJ10pXCIpXG4gIH0sXG5cbiAgX3VuYmluZCgpIHtcbiAgICBpZiAodGhpcy5lbCAmJiB0aGlzLl9zaG93KSB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJwb2ludGVyZW50ZXJcIiwgdGhpcy5fc2hvdylcbiAgICBpZiAodGhpcy5lbCAmJiB0aGlzLl9oaWRlKSB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJwb2ludGVybGVhdmVcIiwgdGhpcy5faGlkZSlcbiAgICBpZiAodGhpcy5lbCAmJiB0aGlzLl9vbktleWRvd24pIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5fb25LZXlkb3duKVxuICAgIGlmICh0aGlzLmVsKSBkZWxldGUgdGhpcy5lbC5kYXRhc2V0LnJlYWR5XG4gICAgaWYgKHRoaXMudHJpZ2dlciAmJiB0aGlzLl9zaG93KSB0aGlzLnRyaWdnZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImZvY3VzaW5cIiwgdGhpcy5fc2hvdylcbiAgICBpZiAodGhpcy50cmlnZ2VyICYmIHRoaXMuX29uRm9jdXNPdXQpIHRoaXMudHJpZ2dlci5yZW1vdmVFdmVudExpc3RlbmVyKFwiZm9jdXNvdXRcIiwgdGhpcy5fb25Gb2N1c091dClcbiAgICBpZiAodGhpcy5jb250ZW50KSB7XG4gICAgICBpZiAodGhpcy5fc2hvdykgdGhpcy5jb250ZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJmb2N1c2luXCIsIHRoaXMuX3Nob3cpXG4gICAgICBpZiAodGhpcy5fb25Gb2N1c091dCkgdGhpcy5jb250ZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJmb2N1c291dFwiLCB0aGlzLl9vbkZvY3VzT3V0KVxuICAgIH1cbiAgICBjbGVhclRpbWVvdXQodGhpcy5fc2hvd1RpbWVvdXQpXG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuX2hpZGVUaW1lb3V0KVxuICAgIHRoaXMudHJpZ2dlciA9IG51bGxcbiAgICB0aGlzLmNvbnRlbnQgPSBudWxsXG4gICAgdGhpcy5fc2hvdyA9IG51bGxcbiAgICB0aGlzLl9oaWRlID0gbnVsbFxuICAgIHRoaXMuX29uRm9jdXNPdXQgPSBudWxsXG4gICAgdGhpcy5fb25LZXlkb3duID0gbnVsbFxuICAgIHRoaXMuX3Nob3dUaW1lb3V0ID0gbnVsbFxuICAgIHRoaXMuX2hpZGVUaW1lb3V0ID0gbnVsbFxuICAgIHRoaXMuX29wZW5EZWxheSA9IG51bGxcbiAgICB0aGlzLl9jbG9zZURlbGF5ID0gbnVsbFxuICB9XG59XG5cbmV4cG9ydCB7IEV4b0hvdmVyQ2FyZCB9XG4iLCAiY29uc3QgRXhvQ29udGV4dE1lbnUgPSB7XG4gIG1vdW50ZWQoKSB7IHRoaXMuX2JpbmQoKSB9LFxuICB1cGRhdGVkKCkgeyB0aGlzLl9iaW5kKCkgfSxcbiAgZGVzdHJveWVkKCkgeyB0aGlzLl91bmJpbmQoKSB9LFxuXG4gIF9iaW5kKCkge1xuICAgIHRoaXMuX3VuYmluZCgpXG4gICAgdGhpcy50cmlnZ2VyID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJjb250ZXh0LW1lbnUtdHJpZ2dlclwiXScpXG4gICAgdGhpcy5tZW51ID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJjb250ZXh0LW1lbnUtY29udGVudFwiXScpXG4gICAgaWYgKCF0aGlzLnRyaWdnZXIgfHwgIXRoaXMubWVudSkgcmV0dXJuXG5cbiAgICB0aGlzLmVsLnNldEF0dHJpYnV0ZShcImRhdGEtcmVhZHlcIiwgXCJcIilcbiAgICB0aGlzLnRyaWdnZXIuc2V0QXR0cmlidXRlKFwidGFiaW5kZXhcIiwgdGhpcy50cmlnZ2VyLmdldEF0dHJpYnV0ZShcInRhYmluZGV4XCIpIHx8IFwiMFwiKVxuICAgIHRoaXMudHJpZ2dlci5zZXRBdHRyaWJ1dGUoXCJyb2xlXCIsIHRoaXMudHJpZ2dlci5nZXRBdHRyaWJ1dGUoXCJyb2xlXCIpIHx8IFwiYnV0dG9uXCIpXG4gICAgdGhpcy50cmlnZ2VyLnNldEF0dHJpYnV0ZShcImFyaWEtaGFzcG9wdXBcIiwgXCJtZW51XCIpXG4gICAgaWYgKHRoaXMubWVudS5pZCkgdGhpcy50cmlnZ2VyLnNldEF0dHJpYnV0ZShcImFyaWEtY29udHJvbHNcIiwgdGhpcy5tZW51LmlkKVxuICAgIHRoaXMudHJpZ2dlci5zZXRBdHRyaWJ1dGUoXCJhcmlhLWV4cGFuZGVkXCIsIFN0cmluZyh0aGlzLm1lbnUuaGFzQXR0cmlidXRlKFwiZGF0YS1vcGVuXCIpKSlcblxuICAgIHRoaXMuX2l0ZW1zID0gKCkgPT5cbiAgICAgIFsuLi50aGlzLm1lbnUucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZXhvPVwiY29udGV4dC1tZW51LWl0ZW1cIl0nKV1cbiAgICAgICAgLmZpbHRlcigoaXRlbSkgPT4gIXRoaXMuX2lzRGlzYWJsZWQoaXRlbSkpXG5cbiAgICB0aGlzLm1lbnUucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZXhvPVwiY29udGV4dC1tZW51LWl0ZW1cIl0nKS5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICBpdGVtLnNldEF0dHJpYnV0ZShcInRhYmluZGV4XCIsIFwiLTFcIilcbiAgICAgIGlmIChpdGVtLnRhZ05hbWUgPT09IFwiQlVUVE9OXCIgJiYgIWl0ZW0uZ2V0QXR0cmlidXRlKFwidHlwZVwiKSkge1xuICAgICAgICBpdGVtLnNldEF0dHJpYnV0ZShcInR5cGVcIiwgXCJidXR0b25cIilcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLl9pc0Rpc2FibGVkKGl0ZW0pKSB7XG4gICAgICAgIGl0ZW0uc2V0QXR0cmlidXRlKFwiYXJpYS1kaXNhYmxlZFwiLCBcInRydWVcIilcbiAgICAgICAgaXRlbS5kYXRhc2V0LmRpc2FibGVkID0gXCJ0cnVlXCJcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgdGhpcy5fY2xvc2UgPSAoZSkgPT4ge1xuICAgICAgaWYgKHRoaXMudHJpZ2dlcj8uY29udGFpbnMoZS50YXJnZXQpKSByZXR1cm5cbiAgICAgIGlmICghdGhpcy5tZW51LmNvbnRhaW5zKGUudGFyZ2V0KSkge1xuICAgICAgICB0aGlzLl9oaWRlKClcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9vbkNvbnRleHQgPSAoZSkgPT4ge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICB0aGlzLl9vcGVuQXQoZS5jbGllbnRYLCBlLmNsaWVudFkpXG4gICAgfVxuICAgIHRoaXMudHJpZ2dlci5hZGRFdmVudExpc3RlbmVyKFwiY29udGV4dG1lbnVcIiwgdGhpcy5fb25Db250ZXh0KVxuXG4gICAgdGhpcy5fb25UcmlnZ2VyS2V5ZG93biA9IChlKSA9PiB7XG4gICAgICBpZiAoZS5rZXkgIT09IFwiQ29udGV4dE1lbnVcIiAmJiAhKGUuc2hpZnRLZXkgJiYgZS5rZXkgPT09IFwiRjEwXCIpKSByZXR1cm5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgY29uc3QgcmVjdCA9IHRoaXMudHJpZ2dlci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgdGhpcy5fb3BlbkF0KHJlY3QubGVmdCwgcmVjdC5ib3R0b20pXG4gICAgfVxuICAgIHRoaXMudHJpZ2dlci5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCB0aGlzLl9vblRyaWdnZXJLZXlkb3duKVxuXG4gICAgdGhpcy5fb3BlbkF0ID0gKHgsIHkpID0+IHtcbiAgICAgIHRoaXMubWVudS5zZXRBdHRyaWJ1dGUoXCJkYXRhLW9wZW5cIiwgXCJcIilcbiAgICAgIHRoaXMudHJpZ2dlci5zZXRBdHRyaWJ1dGUoXCJhcmlhLWV4cGFuZGVkXCIsIFwidHJ1ZVwiKVxuICAgICAgdGhpcy5fcG9zaXRpb25XaXRoaW5WaWV3cG9ydCh4LCB5KVxuICAgICAgdGhpcy5fYmluZENsb3NlTGlzdGVuZXJzKClcblxuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgdGhpcy5faXRlbXMoKVswXT8uZm9jdXMoKVxuICAgICAgfSlcbiAgICB9XG5cbiAgICB0aGlzLl9wb3NpdGlvbldpdGhpblZpZXdwb3J0ID0gKHgsIHkpID0+IHtcbiAgICAgIHRoaXMubWVudS5zdHlsZS5sZWZ0ID0geCArIFwicHhcIlxuICAgICAgdGhpcy5tZW51LnN0eWxlLnRvcCA9IHkgKyBcInB4XCJcblxuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLm1lbnUuaGFzQXR0cmlidXRlKFwiZGF0YS1vcGVuXCIpKSByZXR1cm5cbiAgICAgICAgY29uc3QgcmVjdCA9IHRoaXMubWVudS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICBjb25zdCBnYXAgPSA0XG4gICAgICAgIGNvbnN0IGxlZnQgPSBNYXRoLm1pbih4LCB3aW5kb3cuaW5uZXJXaWR0aCAtIHJlY3Qud2lkdGggLSBnYXApXG4gICAgICAgIGNvbnN0IHRvcCA9IE1hdGgubWluKHksIHdpbmRvdy5pbm5lckhlaWdodCAtIHJlY3QuaGVpZ2h0IC0gZ2FwKVxuICAgICAgICB0aGlzLm1lbnUuc3R5bGUubGVmdCA9IE1hdGgubWF4KGdhcCwgbGVmdCkgKyBcInB4XCJcbiAgICAgICAgdGhpcy5tZW51LnN0eWxlLnRvcCA9IE1hdGgubWF4KGdhcCwgdG9wKSArIFwicHhcIlxuICAgICAgfSlcbiAgICB9XG5cbiAgICB0aGlzLl9iaW5kQ2xvc2VMaXN0ZW5lcnMgPSAoKSA9PiB7XG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwicG9pbnRlcmRvd25cIiwgdGhpcy5fY2xvc2UsIHRydWUpXG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMuX2Nsb3NlLCB0cnVlKVxuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuX2Nsb3NlLCB0cnVlKVxuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNvbnRleHRtZW51XCIsIHRoaXMuX2Nsb3NlLCB0cnVlKVxuXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwicG9pbnRlcmRvd25cIiwgdGhpcy5fY2xvc2UsIHRydWUpXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMuX2Nsb3NlLCB0cnVlKVxuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuX2Nsb3NlLCB0cnVlKVxuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNvbnRleHRtZW51XCIsIHRoaXMuX2Nsb3NlLCB0cnVlKVxuICAgIH1cblxuICAgIHRoaXMuX2hpZGUgPSAoKSA9PiB7XG4gICAgICB0aGlzLm1lbnUucmVtb3ZlQXR0cmlidXRlKFwiZGF0YS1vcGVuXCIpXG4gICAgICB0aGlzLnRyaWdnZXIuc2V0QXR0cmlidXRlKFwiYXJpYS1leHBhbmRlZFwiLCBcImZhbHNlXCIpXG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwicG9pbnRlcmRvd25cIiwgdGhpcy5fY2xvc2UsIHRydWUpXG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMuX2Nsb3NlLCB0cnVlKVxuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuX2Nsb3NlLCB0cnVlKVxuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNvbnRleHRtZW51XCIsIHRoaXMuX2Nsb3NlLCB0cnVlKVxuICAgIH1cblxuICAgIHRoaXMuX29uSXRlbUNsaWNrID0gKGUpID0+IHtcbiAgICAgIGNvbnN0IGl0ZW0gPSBlLnRhcmdldC5jbG9zZXN0KCdbZGF0YS1leG89XCJjb250ZXh0LW1lbnUtaXRlbVwiXScpXG4gICAgICBpZiAoIWl0ZW0pIHJldHVyblxuICAgICAgaWYgKHRoaXMuX2lzRGlzYWJsZWQoaXRlbSkpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgdGhpcy5faGlkZSgpXG4gICAgfVxuICAgIHRoaXMubWVudS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5fb25JdGVtQ2xpY2spXG5cbiAgICB0aGlzLl9vbktleWRvd24gPSAoZSkgPT4ge1xuICAgICAgaWYgKGUua2V5ID09PSBcIkVzY2FwZVwiKSB7XG4gICAgICAgIHRoaXMuX2hpZGUoKVxuICAgICAgICB0aGlzLnRyaWdnZXIuZm9jdXM/LigpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBjb25zdCBpdGVtcyA9IHRoaXMuX2l0ZW1zKClcbiAgICAgIGlmICghaXRlbXMubGVuZ3RoKSByZXR1cm5cbiAgICAgIGNvbnN0IGlkeCA9IGl0ZW1zLmluZGV4T2YoZG9jdW1lbnQuYWN0aXZlRWxlbWVudClcbiAgICAgIGxldCBuZXh0ID0gLTFcblxuICAgICAgc3dpdGNoIChlLmtleSkge1xuICAgICAgICBjYXNlIFwiQXJyb3dEb3duXCI6IG5leHQgPSBpZHggPCBpdGVtcy5sZW5ndGggLSAxID8gaWR4ICsgMSA6IDA7IGJyZWFrXG4gICAgICAgIGNhc2UgXCJBcnJvd1VwXCI6IG5leHQgPSBpZHggPiAwID8gaWR4IC0gMSA6IGl0ZW1zLmxlbmd0aCAtIDE7IGJyZWFrXG4gICAgICAgIGNhc2UgXCJIb21lXCI6IG5leHQgPSAwOyBicmVha1xuICAgICAgICBjYXNlIFwiRW5kXCI6IG5leHQgPSBpdGVtcy5sZW5ndGggLSAxOyBicmVha1xuICAgICAgICBkZWZhdWx0OiByZXR1cm5cbiAgICAgIH1cblxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBpdGVtc1tuZXh0XT8uZm9jdXMoKVxuICAgIH1cbiAgICB0aGlzLm1lbnUuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5fb25LZXlkb3duKVxuICB9LFxuXG4gIF9pc0Rpc2FibGVkKGl0ZW0pIHtcbiAgICByZXR1cm4gaXRlbS5kaXNhYmxlZCB8fFxuICAgICAgaXRlbS5kYXRhc2V0LmRpc2FibGVkID09PSBcInRydWVcIiB8fFxuICAgICAgaXRlbS5oYXNBdHRyaWJ1dGUoXCJkYXRhLWRpc2FibGVkXCIpIHx8XG4gICAgICBpdGVtLmdldEF0dHJpYnV0ZShcImFyaWEtZGlzYWJsZWRcIikgPT09IFwidHJ1ZVwiXG4gIH0sXG5cbiAgX3VuYmluZCgpIHtcbiAgICBpZiAodGhpcy50cmlnZ2VyICYmIHRoaXMuX29uQ29udGV4dCkgdGhpcy50cmlnZ2VyLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjb250ZXh0bWVudVwiLCB0aGlzLl9vbkNvbnRleHQpXG4gICAgaWYgKHRoaXMudHJpZ2dlciAmJiB0aGlzLl9vblRyaWdnZXJLZXlkb3duKSB0aGlzLnRyaWdnZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5fb25UcmlnZ2VyS2V5ZG93bilcbiAgICBpZiAodGhpcy5tZW51ICYmIHRoaXMuX29uSXRlbUNsaWNrKSB0aGlzLm1lbnUucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuX29uSXRlbUNsaWNrKVxuICAgIGlmICh0aGlzLm1lbnUgJiYgdGhpcy5fb25LZXlkb3duKSB0aGlzLm1lbnUucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5fb25LZXlkb3duKVxuICAgIGlmICh0aGlzLl9jbG9zZSkge1xuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInBvaW50ZXJkb3duXCIsIHRoaXMuX2Nsb3NlLCB0cnVlKVxuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLl9jbG9zZSwgdHJ1ZSlcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLl9jbG9zZSwgdHJ1ZSlcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjb250ZXh0bWVudVwiLCB0aGlzLl9jbG9zZSwgdHJ1ZSlcbiAgICB9XG4gICAgaWYgKHRoaXMuZWwpIHRoaXMuZWwucmVtb3ZlQXR0cmlidXRlKFwiZGF0YS1yZWFkeVwiKVxuICAgIHRoaXMudHJpZ2dlciA9IG51bGxcbiAgICB0aGlzLm1lbnUgPSBudWxsXG4gICAgdGhpcy5faXRlbXMgPSBudWxsXG4gICAgdGhpcy5faGlkZSA9IG51bGxcbiAgICB0aGlzLl9vcGVuQXQgPSBudWxsXG4gICAgdGhpcy5fYmluZENsb3NlTGlzdGVuZXJzID0gbnVsbFxuICAgIHRoaXMuX3Bvc2l0aW9uV2l0aGluVmlld3BvcnQgPSBudWxsXG4gICAgdGhpcy5fb25Db250ZXh0ID0gbnVsbFxuICAgIHRoaXMuX29uVHJpZ2dlcktleWRvd24gPSBudWxsXG4gICAgdGhpcy5fb25JdGVtQ2xpY2sgPSBudWxsXG4gICAgdGhpcy5fb25LZXlkb3duID0gbnVsbFxuICAgIHRoaXMuX2Nsb3NlID0gbnVsbFxuICB9XG59XG5cbmV4cG9ydCB7IEV4b0NvbnRleHRNZW51IH1cbiIsICJjb25zdCBFeG9SYXRpbmcgPSB7XG4gIG1vdW50ZWQoKSB7IHRoaXMuX2JpbmQoKSB9LFxuICB1cGRhdGVkKCkgeyB0aGlzLl9iaW5kKCkgfSxcbiAgZGVzdHJveWVkKCkgeyB0aGlzLl91bmJpbmQoKSB9LFxuXG4gIF9iaW5kKCkge1xuICAgIHRoaXMuX3VuYmluZCgpXG4gICAgdGhpcy5faGlkZGVuID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJyYXRpbmctdmFsdWVcIl0nKVxuICAgIHRoaXMuX2lucHV0cyA9IFsuLi50aGlzLmVsLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWV4bz1cInJhdGluZy1pbnB1dFwiXScpXVxuICAgIGlmICghdGhpcy5faGlkZGVuIHx8IHRoaXMuX2lucHV0cy5sZW5ndGggPT09IDApIHJldHVyblxuXG4gICAgdGhpcy5lbC5zZXRBdHRyaWJ1dGUoJ2RhdGEtcmVhZHknLCAnJylcblxuICAgIHRoaXMuX29uQ2xpY2sgPSAoZXZlbnQpID0+IHtcbiAgICAgIGNvbnN0IHN0YXIgPSBldmVudC50YXJnZXQuY2xvc2VzdCgnW2RhdGEtZXhvPVwicmF0aW5nLXN0YXJcIl0nKVxuICAgICAgaWYgKCFzdGFyKSByZXR1cm5cbiAgICAgIGNvbnN0IGlucHV0ID0gc3Rhci5xdWVyeVNlbGVjdG9yKCdbZGF0YS1leG89XCJyYXRpbmctaW5wdXRcIl0nKVxuICAgICAgaWYgKCFpbnB1dCB8fCBpbnB1dC5kaXNhYmxlZCkgcmV0dXJuXG4gICAgICBpbnB1dC5jaGVja2VkID0gdHJ1ZVxuICAgICAgdGhpcy5fc2V0VmFsdWUoaW5wdXQudmFsdWUsIHRydWUpXG4gICAgfVxuXG4gICAgdGhpcy5fb25DaGFuZ2UgPSAoZXZlbnQpID0+IHtcbiAgICAgIGNvbnN0IGlucHV0ID0gZXZlbnQudGFyZ2V0LmNsb3Nlc3QoJ1tkYXRhLWV4bz1cInJhdGluZy1pbnB1dFwiXScpXG4gICAgICBpZiAoIWlucHV0IHx8ICFpbnB1dC5jaGVja2VkKSByZXR1cm5cbiAgICAgIHRoaXMuX3NldFZhbHVlKGlucHV0LnZhbHVlLCB0cnVlKVxuICAgIH1cblxuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9vbkNsaWNrKVxuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgdGhpcy5fb25DaGFuZ2UpXG4gICAgdGhpcy5fc2V0VmFsdWUodGhpcy5faGlkZGVuLnZhbHVlIHx8IHRoaXMuZWwuZGF0YXNldC52YWx1ZSB8fCAnMCcsIGZhbHNlKVxuICB9LFxuXG4gIF9zZXRWYWx1ZSh2YWx1ZSwgbm90aWZ5KSB7XG4gICAgY29uc3QgbnVtZXJpY1ZhbHVlID0gcGFyc2VJbnQodmFsdWUgfHwgJzAnLCAxMCkgfHwgMFxuICAgIHRoaXMuZWwuZGF0YXNldC52YWx1ZSA9IFN0cmluZyhudW1lcmljVmFsdWUpXG4gICAgdGhpcy5faGlkZGVuLnZhbHVlID0gU3RyaW5nKG51bWVyaWNWYWx1ZSlcblxuICAgIHRoaXMuZWwucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZXhvPVwicmF0aW5nLXN0YXJcIl0nKS5mb3JFYWNoKChzdGFyLCBpbmRleCkgPT4ge1xuICAgICAgc3Rhci50b2dnbGVBdHRyaWJ1dGUoJ2RhdGEtYWN0aXZlJywgaW5kZXggKyAxIDw9IG51bWVyaWNWYWx1ZSlcbiAgICB9KVxuXG4gICAgdGhpcy5faW5wdXRzLmZvckVhY2goKGlucHV0KSA9PiB7XG4gICAgICBpbnB1dC5jaGVja2VkID0gaW5wdXQudmFsdWUgPT09IFN0cmluZyhudW1lcmljVmFsdWUpXG4gICAgfSlcblxuICAgIGlmIChub3RpZnkpIHtcbiAgICAgIHRoaXMuX2hpZGRlbi5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnaW5wdXQnLCB7IGJ1YmJsZXM6IHRydWUgfSkpXG4gICAgICB0aGlzLl9oaWRkZW4uZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2NoYW5nZScsIHsgYnViYmxlczogdHJ1ZSB9KSlcbiAgICB9XG4gIH0sXG5cbiAgX3VuYmluZCgpIHtcbiAgICBpZiAodGhpcy5fb25DbGljaykgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX29uQ2xpY2spXG4gICAgaWYgKHRoaXMuX29uQ2hhbmdlKSB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIHRoaXMuX29uQ2hhbmdlKVxuICAgIGlmICh0aGlzLmVsKSB0aGlzLmVsLnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS1yZWFkeScpXG4gICAgdGhpcy5faGlkZGVuID0gbnVsbFxuICAgIHRoaXMuX2lucHV0cyA9IFtdXG4gICAgdGhpcy5fb25DbGljayA9IG51bGxcbiAgICB0aGlzLl9vbkNoYW5nZSA9IG51bGxcbiAgfVxufVxuXG5leHBvcnQgeyBFeG9SYXRpbmcgfVxuIiwgImNvbnN0IEV4b01lbnViYXIgPSB7XG4gIG1vdW50ZWQoKSB7IHRoaXMuX2JpbmQoKSB9LFxuICB1cGRhdGVkKCkgeyB0aGlzLl9iaW5kKCkgfSxcbiAgZGVzdHJveWVkKCkgeyB0aGlzLl91bmJpbmQoKSB9LFxuXG4gIF9iaW5kKCkge1xuICAgIHRoaXMuX3VuYmluZCgpXG4gICAgdGhpcy5tZW51cyA9IEFycmF5LmZyb20odGhpcy5lbC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1leG89XCJtZW51YmFyLW1lbnVcIl0nKSlcbiAgICB0aGlzLnRyaWdnZXJzID0gdGhpcy5tZW51cy5tYXAoKG1lbnUpID0+IG1lbnUucXVlcnlTZWxlY3RvcignW2RhdGEtZXhvPVwibWVudWJhci10cmlnZ2VyXCJdJykpXG4gICAgdGhpcy5jb250ZW50cyA9IHRoaXMubWVudXMubWFwKChtZW51KSA9PiBtZW51LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWV4bz1cIm1lbnViYXItY29udGVudFwiXScpKVxuICAgIHRoaXMub3BlbkluZGV4ID0gLTFcblxuICAgIHRoaXMudHJpZ2dlcnMuZm9yRWFjaCgodHJpZ2dlciwgaW5kZXgpID0+IHtcbiAgICAgIGlmICghdHJpZ2dlcikgcmV0dXJuXG4gICAgICB0cmlnZ2VyLnNldEF0dHJpYnV0ZShcInRhYmluZGV4XCIsIGluZGV4ID09PSAwID8gXCIwXCIgOiBcIi0xXCIpXG4gICAgICB0cmlnZ2VyLnNldEF0dHJpYnV0ZShcImFyaWEtZXhwYW5kZWRcIiwgXCJmYWxzZVwiKVxuICAgICAgaWYgKHRyaWdnZXIudGFnTmFtZSA9PT0gXCJCVVRUT05cIiAmJiAhdHJpZ2dlci5oYXNBdHRyaWJ1dGUoXCJ0eXBlXCIpKSB7XG4gICAgICAgIHRyaWdnZXIuc2V0QXR0cmlidXRlKFwidHlwZVwiLCBcImJ1dHRvblwiKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICB0aGlzLmNvbnRlbnRzLmZvckVhY2goKGNvbnRlbnQsIGluZGV4KSA9PiB7XG4gICAgICBpZiAoIWNvbnRlbnQpIHJldHVyblxuICAgICAgY29udGVudC5oaWRkZW4gPSB0cnVlXG4gICAgICBjb250ZW50LnJlbW92ZUF0dHJpYnV0ZShcImRhdGEtb3BlblwiKVxuICAgICAgdGhpcy5faXRlbXMoaW5kZXgpLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgaWYgKCFpdGVtLmhhc0F0dHJpYnV0ZShcInJvbGVcIikpIGl0ZW0uc2V0QXR0cmlidXRlKFwicm9sZVwiLCBcIm1lbnVpdGVtXCIpXG4gICAgICAgIGl0ZW0uc2V0QXR0cmlidXRlKFwidGFiaW5kZXhcIiwgXCItMVwiKVxuICAgICAgICBpZiAoaXRlbS50YWdOYW1lID09PSBcIkJVVFRPTlwiICYmICFpdGVtLmhhc0F0dHJpYnV0ZShcInR5cGVcIikpIHtcbiAgICAgICAgICBpdGVtLnNldEF0dHJpYnV0ZShcInR5cGVcIiwgXCJidXR0b25cIilcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgdGhpcy5fb25DbGljayA9IChlKSA9PiB7XG4gICAgICBjb25zdCB0cmlnZ2VyID0gZS50YXJnZXQuY2xvc2VzdCgnW2RhdGEtZXhvPVwibWVudWJhci10cmlnZ2VyXCJdJylcbiAgICAgIGlmICh0cmlnZ2VyICYmIHRoaXMuZWwuY29udGFpbnModHJpZ2dlcikpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy50cmlnZ2Vycy5pbmRleE9mKHRyaWdnZXIpXG4gICAgICAgIHRoaXMub3BlbkluZGV4ID09PSBpbmRleCA/IHRoaXMuX2Nsb3NlQWxsKHRydWUpIDogdGhpcy5fb3BlbihpbmRleClcbiAgICAgICAgdHJpZ2dlci5mb2N1cygpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBjb25zdCBpdGVtID0gZS50YXJnZXQuY2xvc2VzdCgnW2RhdGEtZXhvPVwibWVudWJhci1jb250ZW50XCJdIFtyb2xlPVwibWVudWl0ZW1cIl0sIFtkYXRhLWV4bz1cIm1lbnViYXItY29udGVudFwiXSBidXR0b24sIFtkYXRhLWV4bz1cIm1lbnViYXItY29udGVudFwiXSBhJylcbiAgICAgIGlmIChpdGVtICYmIHRoaXMuZWwuY29udGFpbnMoaXRlbSkgJiYgIXRoaXMuX2lzRGlzYWJsZWQoaXRlbSkpIHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLl9jbG9zZUFsbCh0cnVlKSwgMClcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5fb25DbGljaylcblxuICAgIHRoaXMuX29uUG9pbnRlckVudGVyID0gKGUpID0+IHtcbiAgICAgIGNvbnN0IHRyaWdnZXIgPSBlLnRhcmdldC5jbG9zZXN0KCdbZGF0YS1leG89XCJtZW51YmFyLXRyaWdnZXJcIl0nKVxuICAgICAgaWYgKCF0cmlnZ2VyIHx8ICF0aGlzLmVsLmNvbnRhaW5zKHRyaWdnZXIpIHx8IHRoaXMub3BlbkluZGV4IDwgMCkgcmV0dXJuXG4gICAgICB0aGlzLl9vcGVuKHRoaXMudHJpZ2dlcnMuaW5kZXhPZih0cmlnZ2VyKSlcbiAgICAgIHRyaWdnZXIuZm9jdXMoKVxuICAgIH1cbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoXCJwb2ludGVyb3ZlclwiLCB0aGlzLl9vblBvaW50ZXJFbnRlcilcblxuICAgIHRoaXMuX29uS2V5RG93biA9IChlKSA9PiB7XG4gICAgICBjb25zdCB0cmlnZ2VySW5kZXggPSB0aGlzLnRyaWdnZXJzLmluZGV4T2YoZS50YXJnZXQpXG4gICAgICBpZiAodHJpZ2dlckluZGV4ID49IDApIHtcbiAgICAgICAgdGhpcy5fb25UcmlnZ2VyS2V5KGUsIHRyaWdnZXJJbmRleClcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGNvbnRlbnRJbmRleCA9IHRoaXMuY29udGVudHMuZmluZEluZGV4KChjb250ZW50KSA9PiBjb250ZW50Py5jb250YWlucyhlLnRhcmdldCkpXG4gICAgICBpZiAoY29udGVudEluZGV4ID49IDApIHRoaXMuX29uTWVudUtleShlLCBjb250ZW50SW5kZXgpXG4gICAgfVxuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5fb25LZXlEb3duKVxuXG4gICAgdGhpcy5fb25Eb2N1bWVudFBvaW50ZXJEb3duID0gKGUpID0+IHtcbiAgICAgIGlmICghdGhpcy5lbC5jb250YWlucyhlLnRhcmdldCkpIHRoaXMuX2Nsb3NlQWxsKHRydWUpXG4gICAgfVxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJwb2ludGVyZG93blwiLCB0aGlzLl9vbkRvY3VtZW50UG9pbnRlckRvd24sIHRydWUpXG5cbiAgICB0aGlzLl9vbkZvY3VzT3V0ID0gKCkgPT4ge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2ZvY3VzT3V0VGltZXIpXG4gICAgICB0aGlzLl9mb2N1c091dFRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5lbC5jb250YWlucyhkb2N1bWVudC5hY3RpdmVFbGVtZW50KSkgdGhpcy5fY2xvc2VBbGwodHJ1ZSlcbiAgICAgIH0sIDApXG4gICAgfVxuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcihcImZvY3Vzb3V0XCIsIHRoaXMuX29uRm9jdXNPdXQpXG5cbiAgICB0aGlzLmVsLmRhdGFzZXQucmVhZHkgPSBcInRydWVcIlxuICB9LFxuXG4gIF9vblRyaWdnZXJLZXkoZSwgaW5kZXgpIHtcbiAgICBpZiAoZS5rZXkgPT09IFwiQXJyb3dSaWdodFwiKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIHRoaXMuX2ZvY3VzVHJpZ2dlcih0aGlzLl9uZXh0VHJpZ2dlcihpbmRleCwgMSkpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZiAoZS5rZXkgPT09IFwiQXJyb3dMZWZ0XCIpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgdGhpcy5fZm9jdXNUcmlnZ2VyKHRoaXMuX25leHRUcmlnZ2VyKGluZGV4LCAtMSkpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZiAoZS5rZXkgPT09IFwiSG9tZVwiKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIHRoaXMuX2ZvY3VzVHJpZ2dlcigwKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaWYgKGUua2V5ID09PSBcIkVuZFwiKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIHRoaXMuX2ZvY3VzVHJpZ2dlcih0aGlzLnRyaWdnZXJzLmxlbmd0aCAtIDEpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZiAoW1wiQXJyb3dEb3duXCIsIFwiRW50ZXJcIiwgXCIgXCJdLmluY2x1ZGVzKGUua2V5KSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICB0aGlzLl9vcGVuKGluZGV4KVxuICAgICAgdGhpcy5fZm9jdXNJdGVtKGluZGV4LCAwKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaWYgKGUua2V5ID09PSBcIkVzY2FwZVwiKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIHRoaXMuX2Nsb3NlQWxsKHRydWUpXG4gICAgfVxuICB9LFxuXG4gIF9vbk1lbnVLZXkoZSwgaW5kZXgpIHtcbiAgICBjb25zdCBpdGVtcyA9IHRoaXMuX2VuYWJsZWRJdGVtcyhpbmRleClcbiAgICBjb25zdCBjdXJyZW50ID0gaXRlbXMuaW5kZXhPZihlLnRhcmdldC5jbG9zZXN0KCdbcm9sZT1cIm1lbnVpdGVtXCJdLCBidXR0b24sIGEnKSlcblxuICAgIGlmIChlLmtleSA9PT0gXCJBcnJvd0Rvd25cIikge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICB0aGlzLl9mb2N1c0l0ZW0oaW5kZXgsIGN1cnJlbnQgKyAxKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaWYgKGUua2V5ID09PSBcIkFycm93VXBcIikge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICB0aGlzLl9mb2N1c0l0ZW0oaW5kZXgsIGN1cnJlbnQgLSAxKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaWYgKGUua2V5ID09PSBcIkhvbWVcIikge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICB0aGlzLl9mb2N1c0l0ZW0oaW5kZXgsIDApXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZiAoZS5rZXkgPT09IFwiRW5kXCIpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgdGhpcy5fZm9jdXNJdGVtKGluZGV4LCBpdGVtcy5sZW5ndGggLSAxKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaWYgKGUua2V5ID09PSBcIkFycm93UmlnaHRcIikge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBjb25zdCBuZXh0ID0gdGhpcy5fbmV4dFRyaWdnZXIoaW5kZXgsIDEpXG4gICAgICB0aGlzLl9vcGVuKG5leHQpXG4gICAgICB0aGlzLl9mb2N1c0l0ZW0obmV4dCwgMClcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGlmIChlLmtleSA9PT0gXCJBcnJvd0xlZnRcIikge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBjb25zdCBwcmV2aW91cyA9IHRoaXMuX25leHRUcmlnZ2VyKGluZGV4LCAtMSlcbiAgICAgIHRoaXMuX29wZW4ocHJldmlvdXMpXG4gICAgICB0aGlzLl9mb2N1c0l0ZW0ocHJldmlvdXMsIDApXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZiAoZS5rZXkgPT09IFwiRXNjYXBlXCIpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgdGhpcy5fY2xvc2VBbGwoZmFsc2UpXG4gICAgICB0aGlzLl9mb2N1c1RyaWdnZXIoaW5kZXgpXG4gICAgfVxuICB9LFxuXG4gIF9vcGVuKGluZGV4KSB7XG4gICAgdGhpcy5jb250ZW50cy5mb3JFYWNoKChjb250ZW50LCBjb250ZW50SW5kZXgpID0+IHtcbiAgICAgIGNvbnN0IHRyaWdnZXIgPSB0aGlzLnRyaWdnZXJzW2NvbnRlbnRJbmRleF1cbiAgICAgIGNvbnN0IG9wZW4gPSBjb250ZW50SW5kZXggPT09IGluZGV4XG4gICAgICBpZiAoIWNvbnRlbnQgfHwgIXRyaWdnZXIpIHJldHVyblxuICAgICAgY29udGVudC5oaWRkZW4gPSAhb3BlblxuICAgICAgY29udGVudC50b2dnbGVBdHRyaWJ1dGUoXCJkYXRhLW9wZW5cIiwgb3BlbilcbiAgICAgIHRyaWdnZXIuc2V0QXR0cmlidXRlKFwiYXJpYS1leHBhbmRlZFwiLCBvcGVuID8gXCJ0cnVlXCIgOiBcImZhbHNlXCIpXG4gICAgfSlcbiAgICB0aGlzLm9wZW5JbmRleCA9IGluZGV4XG4gICAgdGhpcy5lbC5kYXRhc2V0Lm9wZW4gPSBcInRydWVcIlxuICB9LFxuXG4gIF9jbG9zZUFsbChyZXNldEZvY3VzKSB7XG4gICAgdGhpcy5jb250ZW50cy5mb3JFYWNoKChjb250ZW50LCBpbmRleCkgPT4ge1xuICAgICAgaWYgKCFjb250ZW50KSByZXR1cm5cbiAgICAgIGNvbnRlbnQuaGlkZGVuID0gdHJ1ZVxuICAgICAgY29udGVudC5yZW1vdmVBdHRyaWJ1dGUoXCJkYXRhLW9wZW5cIilcbiAgICAgIHRoaXMudHJpZ2dlcnNbaW5kZXhdPy5zZXRBdHRyaWJ1dGUoXCJhcmlhLWV4cGFuZGVkXCIsIFwiZmFsc2VcIilcbiAgICB9KVxuICAgIHRoaXMub3BlbkluZGV4ID0gLTFcbiAgICBkZWxldGUgdGhpcy5lbC5kYXRhc2V0Lm9wZW5cbiAgICBpZiAocmVzZXRGb2N1cykgdGhpcy5fc2V0VHJpZ2dlclRhYkluZGV4KDApXG4gIH0sXG5cbiAgX2ZvY3VzVHJpZ2dlcihpbmRleCkge1xuICAgIHRoaXMuX3NldFRyaWdnZXJUYWJJbmRleChpbmRleClcbiAgICB0aGlzLnRyaWdnZXJzW2luZGV4XT8uZm9jdXMoKVxuICAgIGlmICh0aGlzLm9wZW5JbmRleCA+PSAwKSB0aGlzLl9vcGVuKGluZGV4KVxuICB9LFxuXG4gIF9zZXRUcmlnZ2VyVGFiSW5kZXgoaW5kZXgpIHtcbiAgICB0aGlzLnRyaWdnZXJzLmZvckVhY2goKHRyaWdnZXIsIHRyaWdnZXJJbmRleCkgPT4ge1xuICAgICAgdHJpZ2dlcj8uc2V0QXR0cmlidXRlKFwidGFiaW5kZXhcIiwgdHJpZ2dlckluZGV4ID09PSBpbmRleCA/IFwiMFwiIDogXCItMVwiKVxuICAgIH0pXG4gIH0sXG5cbiAgX2ZvY3VzSXRlbShpbmRleCwgaXRlbUluZGV4KSB7XG4gICAgY29uc3QgaXRlbXMgPSB0aGlzLl9lbmFibGVkSXRlbXMoaW5kZXgpXG4gICAgaWYgKCFpdGVtcy5sZW5ndGgpIHJldHVyblxuICAgIGNvbnN0IGJvdW5kZWQgPSAoaXRlbUluZGV4ICsgaXRlbXMubGVuZ3RoKSAlIGl0ZW1zLmxlbmd0aFxuICAgIGl0ZW1zW2JvdW5kZWRdLmZvY3VzKClcbiAgfSxcblxuICBfbmV4dFRyaWdnZXIoaW5kZXgsIGRlbHRhKSB7XG4gICAgaWYgKCF0aGlzLnRyaWdnZXJzLmxlbmd0aCkgcmV0dXJuIC0xXG4gICAgcmV0dXJuIChpbmRleCArIGRlbHRhICsgdGhpcy50cmlnZ2Vycy5sZW5ndGgpICUgdGhpcy50cmlnZ2Vycy5sZW5ndGhcbiAgfSxcblxuICBfaXRlbXMoaW5kZXgpIHtcbiAgICBjb25zdCBjb250ZW50ID0gdGhpcy5jb250ZW50c1tpbmRleF1cbiAgICBpZiAoIWNvbnRlbnQpIHJldHVybiBbXVxuICAgIHJldHVybiBBcnJheS5mcm9tKGNvbnRlbnQucXVlcnlTZWxlY3RvckFsbCgnW3JvbGU9XCJtZW51aXRlbVwiXSwgYnV0dG9uLCBhJykpXG4gIH0sXG5cbiAgX2VuYWJsZWRJdGVtcyhpbmRleCkge1xuICAgIHJldHVybiB0aGlzLl9pdGVtcyhpbmRleCkuZmlsdGVyKChpdGVtKSA9PiAhdGhpcy5faXNEaXNhYmxlZChpdGVtKSlcbiAgfSxcblxuICBfaXNEaXNhYmxlZChpdGVtKSB7XG4gICAgcmV0dXJuIGl0ZW0uZGlzYWJsZWQgfHwgaXRlbS5nZXRBdHRyaWJ1dGUoXCJhcmlhLWRpc2FibGVkXCIpID09PSBcInRydWVcIiB8fCBpdGVtLmRhdGFzZXQuZGlzYWJsZWQgPT09IFwidHJ1ZVwiXG4gIH0sXG5cbiAgX3VuYmluZCgpIHtcbiAgICBpZiAodGhpcy5fb25DbGljaykgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5fb25DbGljaylcbiAgICBpZiAodGhpcy5fb25Qb2ludGVyRW50ZXIpIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInBvaW50ZXJvdmVyXCIsIHRoaXMuX29uUG9pbnRlckVudGVyKVxuICAgIGlmICh0aGlzLl9vbktleURvd24pIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5fb25LZXlEb3duKVxuICAgIGlmICh0aGlzLl9vbkRvY3VtZW50UG9pbnRlckRvd24pIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJwb2ludGVyZG93blwiLCB0aGlzLl9vbkRvY3VtZW50UG9pbnRlckRvd24sIHRydWUpXG4gICAgaWYgKHRoaXMuX29uRm9jdXNPdXQpIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImZvY3Vzb3V0XCIsIHRoaXMuX29uRm9jdXNPdXQpXG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuX2ZvY3VzT3V0VGltZXIpXG4gICAgZGVsZXRlIHRoaXMuZWwuZGF0YXNldC5yZWFkeVxuICAgIHRoaXMubWVudXMgPSBbXVxuICAgIHRoaXMudHJpZ2dlcnMgPSBbXVxuICAgIHRoaXMuY29udGVudHMgPSBbXVxuICAgIHRoaXMub3BlbkluZGV4ID0gLTFcbiAgICB0aGlzLl9vbkNsaWNrID0gbnVsbFxuICAgIHRoaXMuX29uUG9pbnRlckVudGVyID0gbnVsbFxuICAgIHRoaXMuX29uS2V5RG93biA9IG51bGxcbiAgICB0aGlzLl9vbkRvY3VtZW50UG9pbnRlckRvd24gPSBudWxsXG4gICAgdGhpcy5fb25Gb2N1c091dCA9IG51bGxcbiAgICB0aGlzLl9mb2N1c091dFRpbWVyID0gbnVsbFxuICB9XG59XG5cbmV4cG9ydCB7IEV4b01lbnViYXIgfVxuIiwgImNvbnN0IGZvY3VzYWJsZVNlbGVjdG9yID0gW1xuICAnYVtocmVmXScsXG4gICdidXR0b246bm90KFtkaXNhYmxlZF0pJyxcbiAgJ2lucHV0Om5vdChbZGlzYWJsZWRdKTpub3QoW3R5cGU9XCJoaWRkZW5cIl0pJyxcbiAgJ3NlbGVjdDpub3QoW2Rpc2FibGVkXSknLFxuICAndGV4dGFyZWE6bm90KFtkaXNhYmxlZF0pJyxcbiAgJ1t0YWJpbmRleF06bm90KFt0YWJpbmRleD1cIi0xXCJdKScsXG4gICdbY29udGVudGVkaXRhYmxlPVwidHJ1ZVwiXSdcbl0uam9pbignLCcpXG5cbmNvbnN0IEV4b092ZXJsYXkgPSB7XG4gIG1vdW50ZWQoKSB7IHRoaXMuX2JpbmQoKSB9LFxuICB1cGRhdGVkKCkgeyB0aGlzLl9iaW5kKCkgfSxcbiAgZGVzdHJveWVkKCkgeyB0aGlzLl91bmJpbmQoKSB9LFxuXG4gIF9iaW5kKCkge1xuICAgIGNvbnN0IHdhc09wZW4gPSB0aGlzLl9pc09wZW5BY3RpdmVcbiAgICBjb25zdCBwcmV2aW91c0ZvY3VzID0gdGhpcy5fcHJldmlvdXNGb2N1c1xuICAgIGNvbnN0IHBlbmRpbmdJbnZva2VyID0gdGhpcy5fcGVuZGluZ0ludm9rZXJcbiAgICB0aGlzLl91bmJpbmQoKVxuXG4gICAgdGhpcy5faXNPcGVuQWN0aXZlID0gd2FzT3BlbiB8fCBmYWxzZVxuICAgIHRoaXMuX3ByZXZpb3VzRm9jdXMgPSBwcmV2aW91c0ZvY3VzIHx8IG51bGxcbiAgICB0aGlzLl9wZW5kaW5nSW52b2tlciA9IHBlbmRpbmdJbnZva2VyIHx8IG51bGxcbiAgICB0aGlzLl9wYW5lbCA9IHRoaXMuX2ZpbmRQYW5lbCgpXG4gICAgdGhpcy5fY2xvc2UgPSB0aGlzLl9maW5kQ2xvc2UoKVxuXG4gICAgaWYgKCF0aGlzLl9wYW5lbCkgcmV0dXJuXG5cbiAgICB0aGlzLl9vbktleWRvd24gPSAoZXZlbnQpID0+IHRoaXMuX2hhbmRsZUtleWRvd24oZXZlbnQpXG4gICAgdGhpcy5fb25Qb2ludGVyZG93biA9IChldmVudCkgPT4gdGhpcy5fcmVtZW1iZXJJbnZva2VyKGV2ZW50KVxuICAgIHRoaXMuX29uQ2xpY2sgPSAoZXZlbnQpID0+IHRoaXMuX3JlbWVtYmVySW52b2tlcihldmVudClcbiAgICB0aGlzLl9vYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKCgpID0+IHRoaXMuX3N5bmMoKSlcblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLl9vbktleWRvd24sIHRydWUpXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcmRvd24nLCB0aGlzLl9vblBvaW50ZXJkb3duLCB0cnVlKVxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fb25DbGljaywgdHJ1ZSlcbiAgICB0aGlzLl9vYnNlcnZlci5vYnNlcnZlKHRoaXMuZWwsIHtcbiAgICAgIGF0dHJpYnV0ZXM6IHRydWUsXG4gICAgICBhdHRyaWJ1dGVGaWx0ZXI6IFsnZGF0YS1zdGF0ZScsICdjbGFzcycsICdoaWRkZW4nLCAnaW5lcnQnLCAnYXJpYS1oaWRkZW4nLCAnc3R5bGUnXVxuICAgIH0pXG5cbiAgICB0aGlzLmVsLmRhdGFzZXQucmVhZHkgPSAndHJ1ZSdcbiAgICB0aGlzLl9zeW5jKClcbiAgfSxcblxuICBfZmluZFBhbmVsKCkge1xuICAgIHJldHVybiB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoW1xuICAgICAgJ1tkYXRhLWV4bz1cIm1vZGFsLWNvbnRlbnRcIl0nLFxuICAgICAgJ1tkYXRhLWV4bz1cImRyYXdlci1jb250ZW50XCJdJyxcbiAgICAgICdbZGF0YS1leG89XCJzaGVldC1jb250ZW50XCJdJ1xuICAgIF0uam9pbignLCcpKVxuICB9LFxuXG4gIF9maW5kQ2xvc2UoKSB7XG4gICAgcmV0dXJuIHRoaXMuZWwucXVlcnlTZWxlY3RvcihbXG4gICAgICAnW2RhdGEtZXhvPVwibW9kYWwtY2xvc2VcIl0nLFxuICAgICAgJ1tkYXRhLWV4bz1cImRyYXdlci1jbG9zZVwiXScsXG4gICAgICAnW2RhdGEtZXhvPVwic2hlZXQtY2xvc2VcIl0nXG4gICAgXS5qb2luKCcsJykpXG4gIH0sXG5cbiAgX2lzT3BlbigpIHtcbiAgICBpZiAodGhpcy5lbC5kYXRhc2V0LnN0YXRlKSByZXR1cm4gdGhpcy5lbC5kYXRhc2V0LnN0YXRlID09PSAnb3BlbidcbiAgICByZXR1cm4gdGhpcy5lbC5jbGFzc0xpc3QuY29udGFpbnMoJ29wZW4nKSAmJiAhdGhpcy5lbC5oaWRkZW5cbiAgfSxcblxuICBfc3luYygpIHtcbiAgICBjb25zdCBvcGVuID0gdGhpcy5faXNPcGVuKClcblxuICAgIGlmIChvcGVuICYmICF0aGlzLl9pc09wZW5BY3RpdmUpIHtcbiAgICAgIHRoaXMuX2FjdGl2YXRlKClcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGlmICghb3BlbiAmJiB0aGlzLl9pc09wZW5BY3RpdmUpIHtcbiAgICAgIHRoaXMuX2RlYWN0aXZhdGUoKVxuICAgIH1cbiAgfSxcblxuICBfYWN0aXZhdGUoKSB7XG4gICAgdGhpcy5faXNPcGVuQWN0aXZlID0gdHJ1ZVxuXG4gICAgY29uc3QgYWN0aXZlID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50ID8gZG9jdW1lbnQuYWN0aXZlRWxlbWVudCA6IG51bGxcbiAgICBjb25zdCBwcmV2aW91c0ZvY3VzID0gdGhpcy5faXNSZXN0b3JlVGFyZ2V0KHRoaXMuX3BlbmRpbmdJbnZva2VyKVxuICAgICAgPyB0aGlzLl9wZW5kaW5nSW52b2tlclxuICAgICAgOiBhY3RpdmVcblxuICAgIHRoaXMuX3BlbmRpbmdJbnZva2VyID0gbnVsbFxuICAgIHRoaXMuX3ByZXZpb3VzRm9jdXMgPSB0aGlzLl9pc1Jlc3RvcmVUYXJnZXQocHJldmlvdXNGb2N1cykgPyBwcmV2aW91c0ZvY3VzIDogbnVsbFxuXG4gICAgdGhpcy5lbC5yZW1vdmVBdHRyaWJ1dGUoJ2luZXJ0JylcbiAgICB0aGlzLmVsLnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCAnZmFsc2UnKVxuXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgIGNvbnN0IHRhcmdldCA9IHRoaXMuX2ZpcnN0Rm9jdXNhYmxlKCkgfHwgdGhpcy5fcGFuZWxcbiAgICAgIHRhcmdldD8uZm9jdXM/Lih7IHByZXZlbnRTY3JvbGw6IHRydWUgfSlcbiAgICB9KVxuICB9LFxuXG4gIF9kZWFjdGl2YXRlKCkge1xuICAgIHRoaXMuX2lzT3BlbkFjdGl2ZSA9IGZhbHNlXG4gICAgdGhpcy5lbC5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKVxuICAgIHRoaXMuZWwuc2V0QXR0cmlidXRlKCdpbmVydCcsICd0cnVlJylcblxuICAgIGNvbnN0IHRhcmdldCA9IHRoaXMuX3ByZXZpb3VzRm9jdXNcbiAgICB0aGlzLl9wcmV2aW91c0ZvY3VzID0gbnVsbFxuXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgIGlmICh0YXJnZXQgJiYgdGFyZ2V0LmlzQ29ubmVjdGVkKSB0YXJnZXQuZm9jdXMoeyBwcmV2ZW50U2Nyb2xsOiB0cnVlIH0pXG4gICAgfSlcbiAgfSxcblxuICBfZm9jdXNhYmxlcygpIHtcbiAgICBpZiAoIXRoaXMuX3BhbmVsKSByZXR1cm4gW11cblxuICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuX3BhbmVsLnF1ZXJ5U2VsZWN0b3JBbGwoZm9jdXNhYmxlU2VsZWN0b3IpKS5maWx0ZXIoKGVsZW1lbnQpID0+IHtcbiAgICAgIGlmICghKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpIHJldHVybiBmYWxzZVxuICAgICAgaWYgKGVsZW1lbnQuaGlkZGVuIHx8IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicpID09PSAndHJ1ZScpIHJldHVybiBmYWxzZVxuICAgICAgaWYgKGVsZW1lbnQuY2xvc2VzdCgnW2hpZGRlbl0sW2luZXJ0XScpKSByZXR1cm4gZmFsc2VcbiAgICAgIHJldHVybiBCb29sZWFuKGVsZW1lbnQub2Zmc2V0V2lkdGggfHwgZWxlbWVudC5vZmZzZXRIZWlnaHQgfHwgZWxlbWVudC5nZXRDbGllbnRSZWN0cygpLmxlbmd0aClcbiAgICB9KVxuICB9LFxuXG4gIF9maXJzdEZvY3VzYWJsZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fZm9jdXNhYmxlcygpWzBdIHx8IG51bGxcbiAgfSxcblxuICBfaGFuZGxlS2V5ZG93bihldmVudCkge1xuICAgIGlmICghdGhpcy5faXNPcGVuKCkpIHJldHVyblxuXG4gICAgaWYgKGV2ZW50LmtleSA9PT0gJ0VzY2FwZScpIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICB0aGlzLl9jbG9zZT8uY2xpY2s/LigpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZiAoZXZlbnQua2V5ICE9PSAnVGFiJykgcmV0dXJuXG5cbiAgICBjb25zdCBmb2N1c2FibGVzID0gdGhpcy5fZm9jdXNhYmxlcygpXG5cbiAgICBpZiAoZm9jdXNhYmxlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgIHRoaXMuX3BhbmVsPy5mb2N1cz8uKHsgcHJldmVudFNjcm9sbDogdHJ1ZSB9KVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3QgZmlyc3QgPSBmb2N1c2FibGVzWzBdXG4gICAgY29uc3QgbGFzdCA9IGZvY3VzYWJsZXNbZm9jdXNhYmxlcy5sZW5ndGggLSAxXVxuICAgIGNvbnN0IGFjdGl2ZSA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnRcblxuICAgIGlmIChldmVudC5zaGlmdEtleSAmJiAoYWN0aXZlID09PSBmaXJzdCB8fCAhdGhpcy5fcGFuZWwuY29udGFpbnMoYWN0aXZlKSkpIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgIGxhc3QuZm9jdXMoeyBwcmV2ZW50U2Nyb2xsOiB0cnVlIH0pXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZiAoIWV2ZW50LnNoaWZ0S2V5ICYmIGFjdGl2ZSA9PT0gbGFzdCkge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgZmlyc3QuZm9jdXMoeyBwcmV2ZW50U2Nyb2xsOiB0cnVlIH0pXG4gICAgfVxuICB9LFxuXG4gIF9yZW1lbWJlckludm9rZXIoZXZlbnQpIHtcbiAgICBpZiAodGhpcy5faXNPcGVuKCkpIHJldHVyblxuXG4gICAgY29uc3QgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0IGluc3RhbmNlb2YgRWxlbWVudFxuICAgICAgPyBldmVudC50YXJnZXQuY2xvc2VzdChmb2N1c2FibGVTZWxlY3RvcilcbiAgICAgIDogbnVsbFxuXG4gICAgaWYgKHRoaXMuX2lzUmVzdG9yZVRhcmdldCh0YXJnZXQpKSB0aGlzLl9wZW5kaW5nSW52b2tlciA9IHRhcmdldFxuICB9LFxuXG4gIF9pc1Jlc3RvcmVUYXJnZXQoZWxlbWVudCkge1xuICAgIGlmICghKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpIHJldHVybiBmYWxzZVxuICAgIGlmICghZWxlbWVudC5pc0Nvbm5lY3RlZCB8fCB0aGlzLmVsLmNvbnRhaW5zKGVsZW1lbnQpKSByZXR1cm4gZmFsc2VcbiAgICBpZiAoZWxlbWVudC5jbG9zZXN0KCdbaGlkZGVuXSxbaW5lcnRdJykpIHJldHVybiBmYWxzZVxuICAgIGlmIChlbGVtZW50Lmhhc0F0dHJpYnV0ZSgnZGlzYWJsZWQnKSB8fCBlbGVtZW50LmdldEF0dHJpYnV0ZSgnYXJpYS1kaXNhYmxlZCcpID09PSAndHJ1ZScpIHJldHVybiBmYWxzZVxuICAgIGlmICghZWxlbWVudC5tYXRjaGVzKGZvY3VzYWJsZVNlbGVjdG9yKSkgcmV0dXJuIGZhbHNlXG4gICAgcmV0dXJuIHRydWVcbiAgfSxcblxuICBfdW5iaW5kKCkge1xuICAgIGlmICh0aGlzLl9vYnNlcnZlcikgdGhpcy5fb2JzZXJ2ZXIuZGlzY29ubmVjdCgpXG4gICAgaWYgKHRoaXMuX29uS2V5ZG93bikgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX29uS2V5ZG93biwgdHJ1ZSlcbiAgICBpZiAodGhpcy5fb25Qb2ludGVyZG93bikgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigncG9pbnRlcmRvd24nLCB0aGlzLl9vblBvaW50ZXJkb3duLCB0cnVlKVxuICAgIGlmICh0aGlzLl9vbkNsaWNrKSBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX29uQ2xpY2ssIHRydWUpXG4gICAgaWYgKHRoaXMuZWwpIGRlbGV0ZSB0aGlzLmVsLmRhdGFzZXQucmVhZHlcblxuICAgIHRoaXMuX29ic2VydmVyID0gbnVsbFxuICAgIHRoaXMuX29uS2V5ZG93biA9IG51bGxcbiAgICB0aGlzLl9vblBvaW50ZXJkb3duID0gbnVsbFxuICAgIHRoaXMuX29uQ2xpY2sgPSBudWxsXG4gICAgdGhpcy5fcGFuZWwgPSBudWxsXG4gICAgdGhpcy5fY2xvc2UgPSBudWxsXG4gIH1cbn1cblxuZXhwb3J0IHsgRXhvT3ZlcmxheSB9XG4iLCAiY29uc3QgRXhvVGFicyA9IHtcbiAgbW91bnRlZCgpIHsgdGhpcy5fYmluZCgpIH0sXG4gIHVwZGF0ZWQoKSB7IHRoaXMuX2JpbmQoKSB9LFxuICBkZXN0cm95ZWQoKSB7IHRoaXMuX3VuYmluZCgpIH0sXG5cbiAgX2JpbmQoKSB7XG4gICAgdGhpcy5fdW5iaW5kKClcbiAgICB0aGlzLmVsLnNldEF0dHJpYnV0ZSgnZGF0YS1yZWFkeScsICcnKVxuICAgIHRoaXMuX3N5bmNUYWJzKClcblxuICAgIHRoaXMuX29uQ2xpY2sgPSAoZSkgPT4ge1xuICAgICAgY29uc3QgdGFiID0gZS50YXJnZXQuY2xvc2VzdCgnW3JvbGU9XCJ0YWJcIl0nKVxuICAgICAgaWYgKCF0YWIgfHwgIXRoaXMuZWwuY29udGFpbnModGFiKSB8fCAhdGhpcy5faXNEaXNhYmxlZCh0YWIpKSByZXR1cm5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKVxuICAgIH1cbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fb25DbGljaylcblxuICAgIHRoaXMuX29uS2V5ZG93biA9IChlKSA9PiB7XG4gICAgICBjb25zdCB0YWIgPSBlLnRhcmdldC5jbG9zZXN0KCdbcm9sZT1cInRhYlwiXScpXG4gICAgICBpZiAoIXRhYiB8fCAhdGhpcy5lbC5jb250YWlucyh0YWIpIHx8IHRoaXMuX2lzRGlzYWJsZWQodGFiKSkgcmV0dXJuXG5cbiAgICAgIGlmIChlLmtleSA9PT0gJ0VudGVyJyB8fCBlLmtleSA9PT0gJyAnIHx8IGUua2V5ID09PSAnU3BhY2ViYXInKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICB0aGlzLl9hY3RpdmF0ZSh0YWIpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBjb25zdCB0YWJzID0gdGhpcy5fdGFicygpXG4gICAgICBpZiAoIXRhYnMubGVuZ3RoKSByZXR1cm5cblxuICAgICAgY29uc3QgY3VycmVudCA9IHRhYnMuaW5kZXhPZih0YWIpXG4gICAgICBpZiAoY3VycmVudCA9PT0gLTEpIHJldHVyblxuXG4gICAgICBjb25zdCB2ZXJ0aWNhbCA9IHRoaXMuZWwuZGF0YXNldC5vcmllbnRhdGlvbiA9PT0gJ3ZlcnRpY2FsJ1xuICAgICAgbGV0IG5leHQgPSAtMVxuXG4gICAgICBzd2l0Y2ggKGUua2V5KSB7XG4gICAgICAgIGNhc2UgJ0Fycm93UmlnaHQnOlxuICAgICAgICAgIGlmICh2ZXJ0aWNhbCkgcmV0dXJuXG4gICAgICAgICAgbmV4dCA9IGN1cnJlbnQgPCB0YWJzLmxlbmd0aCAtIDEgPyBjdXJyZW50ICsgMSA6IDBcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlICdBcnJvd0xlZnQnOlxuICAgICAgICAgIGlmICh2ZXJ0aWNhbCkgcmV0dXJuXG4gICAgICAgICAgbmV4dCA9IGN1cnJlbnQgPiAwID8gY3VycmVudCAtIDEgOiB0YWJzLmxlbmd0aCAtIDFcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlICdBcnJvd0Rvd24nOlxuICAgICAgICAgIGlmICghdmVydGljYWwpIHJldHVyblxuICAgICAgICAgIG5leHQgPSBjdXJyZW50IDwgdGFicy5sZW5ndGggLSAxID8gY3VycmVudCArIDEgOiAwXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAnQXJyb3dVcCc6XG4gICAgICAgICAgaWYgKCF2ZXJ0aWNhbCkgcmV0dXJuXG4gICAgICAgICAgbmV4dCA9IGN1cnJlbnQgPiAwID8gY3VycmVudCAtIDEgOiB0YWJzLmxlbmd0aCAtIDFcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlICdIb21lJzpcbiAgICAgICAgICBuZXh0ID0gMFxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgJ0VuZCc6XG4gICAgICAgICAgbmV4dCA9IHRhYnMubGVuZ3RoIC0gMVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgdGhpcy5fZm9jdXNUYWIodGFic1tuZXh0XSlcbiAgICAgIGlmICh0aGlzLmVsLmRhdGFzZXQuYWN0aXZhdGlvbiA9PT0gJ2F1dG9tYXRpYycpIHRoaXMuX2FjdGl2YXRlKHRhYnNbbmV4dF0pXG4gICAgfVxuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX29uS2V5ZG93bilcbiAgfSxcblxuICBfYWxsVGFicygpIHtcbiAgICByZXR1cm4gWy4uLnRoaXMuZWwucXVlcnlTZWxlY3RvckFsbCgnW3JvbGU9XCJ0YWJcIl0nKV1cbiAgfSxcblxuICBfdGFicygpIHtcbiAgICByZXR1cm4gdGhpcy5fYWxsVGFicygpLmZpbHRlcigodGFiKSA9PiAhdGhpcy5faXNEaXNhYmxlZCh0YWIpKVxuICB9LFxuXG4gIF9pc0Rpc2FibGVkKHRhYikge1xuICAgIHJldHVybiB0YWIuaGFzQXR0cmlidXRlKCdkYXRhLWRpc2FibGVkJykgfHxcbiAgICAgIHRhYi5nZXRBdHRyaWJ1dGUoJ2FyaWEtZGlzYWJsZWQnKSA9PT0gJ3RydWUnIHx8XG4gICAgICB0YWIuZGlzYWJsZWRcbiAgfSxcblxuICBfc3luY1RhYnMoKSB7XG4gICAgY29uc3QgdGFicyA9IHRoaXMuX3RhYnMoKVxuICAgIGNvbnN0IHNlbGVjdGVkID0gdGFicy5maW5kKCh0YWIpID0+IHRhYi5nZXRBdHRyaWJ1dGUoJ2FyaWEtc2VsZWN0ZWQnKSA9PT0gJ3RydWUnKSB8fCB0YWJzWzBdXG4gICAgdGhpcy5fYWxsVGFicygpLmZvckVhY2goKHRhYikgPT4ge1xuICAgICAgdGFiLnNldEF0dHJpYnV0ZSgndGFiaW5kZXgnLCB0YWIgPT09IHNlbGVjdGVkID8gJzAnIDogJy0xJylcbiAgICB9KVxuICB9LFxuXG4gIF9mb2N1c1RhYih0YWIpIHtcbiAgICBpZiAoIXRhYikgcmV0dXJuXG4gICAgdGhpcy5fYWxsVGFicygpLmZvckVhY2goKGl0ZW0pID0+IGl0ZW0uc2V0QXR0cmlidXRlKCd0YWJpbmRleCcsIGl0ZW0gPT09IHRhYiA/ICcwJyA6ICctMScpKVxuICAgIHRhYi5mb2N1cygpXG4gIH0sXG5cbiAgX2FjdGl2YXRlKHRhYikge1xuICAgIGlmICghdGFiIHx8IHRoaXMuX2lzRGlzYWJsZWQodGFiKSkgcmV0dXJuXG4gICAgdGFiLmNsaWNrKClcbiAgfSxcblxuICBfdW5iaW5kKCkge1xuICAgIGlmICh0aGlzLl9vbkNsaWNrKSB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fb25DbGljaylcbiAgICBpZiAodGhpcy5fb25LZXlkb3duKSB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLl9vbktleWRvd24pXG4gICAgaWYgKHRoaXMuZWwpIHRoaXMuZWwucmVtb3ZlQXR0cmlidXRlKCdkYXRhLXJlYWR5JylcbiAgICB0aGlzLl9vbkNsaWNrID0gbnVsbFxuICAgIHRoaXMuX29uS2V5ZG93biA9IG51bGxcbiAgfVxufVxuXG5leHBvcnQgeyBFeG9UYWJzIH1cbiIsICJpbXBvcnQgeyBFeG9BY2NvcmRpb24gfSBmcm9tICcuL2hvb2tzL2FjY29yZGlvbi5qcydcbmltcG9ydCB7IEV4b0Nhcm91c2VsIH0gZnJvbSAnLi9ob29rcy9jYXJvdXNlbC5qcydcbmltcG9ydCB7IEV4b0NvbGxhcHNpYmxlIH0gZnJvbSAnLi9ob29rcy9jb2xsYXBzaWJsZS5qcydcbmltcG9ydCB7IEV4b0NvbW1hbmRQYWxldHRlIH0gZnJvbSAnLi9ob29rcy9jb21tYW5kX3BhbGV0dGUuanMnXG5pbXBvcnQgeyBFeG9TaWRlYmFyIH0gZnJvbSAnLi9ob29rcy9zaWRlYmFyLmpzJ1xuaW1wb3J0IHsgRXhvVGhlbWVUb2dnbGUgfSBmcm9tICcuL2hvb2tzL3RoZW1lX3RvZ2dsZS5qcydcbmltcG9ydCB7IEV4b1BvcG92ZXIgfSBmcm9tICcuL2hvb2tzL3BvcG92ZXIuanMnXG5pbXBvcnQgeyBFeG9Ecm9wZG93bk1lbnUgfSBmcm9tICcuL2hvb2tzL2Ryb3Bkb3duX21lbnUuanMnXG5pbXBvcnQgeyBFeG9TZWxlY3QgfSBmcm9tICcuL2hvb2tzL3NlbGVjdC5qcydcbmltcG9ydCB7IEV4b0NvbWJvYm94IH0gZnJvbSAnLi9ob29rcy9jb21ib2JveC5qcydcbmltcG9ydCB7IEV4b1Rvb2x0aXAgfSBmcm9tICcuL2hvb2tzL3Rvb2x0aXAuanMnXG5pbXBvcnQgeyBFeG9Ib3ZlckNhcmQgfSBmcm9tICcuL2hvb2tzL2hvdmVyX2NhcmQuanMnXG5pbXBvcnQgeyBFeG9Db250ZXh0TWVudSB9IGZyb20gJy4vaG9va3MvY29udGV4dF9tZW51LmpzJ1xuaW1wb3J0IHsgRXhvUmF0aW5nIH0gZnJvbSAnLi9ob29rcy9yYXRpbmcuanMnXG5pbXBvcnQgeyBFeG9NZW51YmFyIH0gZnJvbSAnLi9ob29rcy9tZW51YmFyLmpzJ1xuaW1wb3J0IHsgRXhvT3ZlcmxheSB9IGZyb20gJy4vaG9va3Mvb3ZlcmxheS5qcydcbmltcG9ydCB7IEV4b1RhYnMgfSBmcm9tICcuL2hvb2tzL3RhYnMuanMnXG5cbmNvbnN0IGhvb2tzID0ge1xuICBFeG9BY2NvcmRpb24sXG4gIEV4b0Nhcm91c2VsLFxuICBFeG9Db2xsYXBzaWJsZSxcbiAgRXhvQ29tbWFuZFBhbGV0dGUsXG4gIEV4b1NpZGViYXIsXG4gIEV4b1RoZW1lVG9nZ2xlLFxuICBFeG9Qb3BvdmVyLFxuICBFeG9Ecm9wZG93bk1lbnUsXG4gIEV4b1NlbGVjdCxcbiAgRXhvQ29tYm9ib3gsXG4gIEV4b1Rvb2x0aXAsXG4gIEV4b0hvdmVyQ2FyZCxcbiAgRXhvQ29udGV4dE1lbnUsXG4gIEV4b1JhdGluZyxcbiAgRXhvTWVudWJhcixcbiAgRXhvT3ZlcmxheSxcbiAgRXhvVGFic1xufVxuXG5leHBvcnQgeyBob29rcyB9XG4iLCAiaW1wb3J0IHsgaG9va3MgYXMgZXhvSG9va3MgfSBmcm9tIFwiLi4vLi4vLi4vYXNzZXRzL2pzL2luZGV4LmpzXCJcblxud2luZG93LnN0b3J5Ym9vayA9IHtcbiAgSG9va3M6IGV4b0hvb2tzLFxuICBQYXJhbXM6IHt9LFxuICBVcGxvYWRlcnM6IHt9XG59XG4iXSwKICAibWFwcGluZ3Mi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
