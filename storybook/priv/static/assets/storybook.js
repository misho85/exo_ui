(() => {
  // ../../assets/js/hooks/accordion.js
  var ExoAccordion = {
    mounted() {
      this._triggers = () => Array.from(this.el.querySelectorAll('[data-exo="accordion-trigger"]:not([disabled])'));
      this._isSingle = () => this.el.dataset.type === "single";
      this._isCollapsible = () => this.el.hasAttribute("data-collapsible");
      this.el.addEventListener("keydown", this._onKeydown = (e) => {
        const trigger = this._closestTrigger(e);
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
        const trigger = this._closestTrigger(e);
        if (!trigger || trigger.disabled) return;
        const wasExpanded = trigger.getAttribute("aria-expanded") === "true";
        if (this._isSingle()) {
          if (wasExpanded && this._isCollapsible()) {
            this._syncAria(trigger, false);
          } else if (wasExpanded && !this._isCollapsible()) {
            e.preventDefault();
            return;
          } else {
            this._triggers().forEach((otherTrigger) => {
              if (otherTrigger !== trigger) this._syncAria(otherTrigger, false);
            });
            this._syncAria(trigger, true);
          }
        } else {
          this._syncAria(trigger, !wasExpanded);
        }
      });
      this._syncAllAria();
      this.el.setAttribute("data-ready", "");
    },
    updated() {
      this._syncAllAria();
    },
    destroyed() {
      if (this._onKeydown) this.el.removeEventListener("keydown", this._onKeydown);
      if (this._onClick) this.el.removeEventListener("click", this._onClick);
      if (this.el) this.el.removeAttribute("data-ready");
    },
    _syncAria(trigger, expanded) {
      trigger.setAttribute("aria-expanded", String(expanded));
      const contentId = trigger.getAttribute("aria-controls");
      const content = contentId ? document.getElementById(contentId) : null;
      if (content && this.el.contains(content)) {
        content.setAttribute("aria-hidden", String(!expanded));
        content.inert = !expanded;
      }
    },
    _closestTrigger(event) {
      const target = event.target instanceof Element ? event.target : event.target?.parentElement;
      return target?.closest?.('[data-exo="accordion-trigger"]');
    },
    _syncAllAria() {
      const items = this.el.querySelectorAll('[data-exo="accordion-item"]');
      items.forEach((item) => {
        const trigger = item.querySelector('[data-exo="accordion-trigger"]');
        if (trigger) {
          this._syncAria(trigger, trigger.getAttribute("aria-expanded") === "true");
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
      this._content = () => this.el.querySelector('[data-exo="collapsible-content"]');
      this.el.addEventListener("click", this._onClick = (e) => {
        const trigger = this._closestTrigger(e);
        if (!trigger) return;
        const checkbox = this._checkbox();
        if (!checkbox) return;
        checkbox.checked = !checkbox.checked;
        this._syncState(trigger, checkbox.checked);
      });
      this._syncAria();
      this.el.setAttribute("data-ready", "");
    },
    updated() {
      this._syncAria();
    },
    destroyed() {
      if (this._onClick) this.el.removeEventListener("click", this._onClick);
      if (this.el) this.el.removeAttribute("data-ready");
    },
    _syncAria() {
      const checkbox = this._checkbox();
      const trigger = this._trigger();
      if (checkbox && trigger) {
        this._syncState(trigger, checkbox.checked);
      }
    },
    _syncState(trigger, expanded) {
      trigger.setAttribute("aria-expanded", String(expanded));
      const content = this._content();
      if (content) {
        content.setAttribute("aria-hidden", String(!expanded));
        content.inert = !expanded;
      }
    },
    _closestTrigger(event) {
      const target = event.target instanceof Element ? event.target : event.target?.parentElement;
      return target?.closest?.('[data-exo="collapsible-trigger"]');
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
  var overlaySequence = 0;
  var overlayRegistry = {
    active: /* @__PURE__ */ new Set(),
    inertElements: /* @__PURE__ */ new Set(),
    originalState: /* @__PURE__ */ new WeakMap(),
    scrollLock: null,
    stackedRoots: /* @__PURE__ */ new Set(),
    rootStyleState: /* @__PURE__ */ new WeakMap(),
    register(hook) {
      if (!hook?.el?.isConnected) return;
      if (!hook._overlayOrder) hook._overlayOrder = overlaySequence += 1;
      this.active.add(hook);
      this.syncOutsideInert();
    },
    unregister(hook) {
      this.active.delete(hook);
      this.syncOutsideInert();
    },
    top() {
      const hooks2 = this.hooks();
      return hooks2[hooks2.length - 1] || null;
    },
    hooks() {
      return Array.from(this.active).filter((hook) => hook?.el?.isConnected && hook._isOpen()).sort((a, b) => (a._overlayOrder || 0) - (b._overlayOrder || 0));
    },
    syncOutsideInert() {
      const next = /* @__PURE__ */ new Set();
      const roots = this.hooks().map((hook) => hook.el);
      this._syncStacking(roots);
      this._syncScrollLock(roots.length > 0);
      if (roots.length > 0) {
        for (const element of this._outsideElements(roots)) {
          if (!this._canInert(element, roots)) continue;
          this._applyInert(element);
          next.add(element);
        }
      }
      for (const element of this.inertElements) {
        if (next.has(element)) continue;
        if (roots.includes(element)) {
          this._release(element);
        } else {
          this._restore(element);
        }
      }
      this.inertElements = next;
    },
    _outsideElements(roots) {
      const allowed = /* @__PURE__ */ new Set();
      const candidates = /* @__PURE__ */ new Set();
      for (const root of roots) {
        let node = root;
        while (node && node instanceof HTMLElement) {
          allowed.add(node);
          if (node === document.body) break;
          node = node.parentElement;
        }
      }
      for (const root of roots) {
        let node = root;
        while (node?.parentElement && node.parentElement !== document.documentElement) {
          for (const child of Array.from(node.parentElement.children)) {
            if (!(child instanceof HTMLElement)) continue;
            if (child === node || allowed.has(child)) continue;
            this._collectOutsideCandidate(child, roots, candidates);
          }
          if (node.parentElement === document.body) break;
          node = node.parentElement;
        }
      }
      return candidates;
    },
    _collectOutsideCandidate(element, roots, candidates) {
      if (roots.some((activeRoot) => element === activeRoot)) return;
      if (roots.some((activeRoot) => element.contains(activeRoot))) {
        for (const child of Array.from(element.children)) {
          if (child instanceof HTMLElement) this._collectOutsideCandidate(child, roots, candidates);
        }
        return;
      }
      candidates.add(element);
    },
    _canInert(element, roots) {
      if (element === document.body || element === document.documentElement) return false;
      if (element.matches("script,style,link,template")) return false;
      if (element.matches('[phx-hook="ExoOverlay"],[phx-hook="ExoCommandPalette"]')) return false;
      return roots.every((root) => !element.contains(root));
    },
    _applyInert(element) {
      if (!this.originalState.has(element)) {
        this.originalState.set(element, {
          inert: element.inert,
          ariaHidden: element.getAttribute("aria-hidden")
        });
      }
      element.inert = true;
      element.setAttribute("aria-hidden", "true");
    },
    _restore(element) {
      const original = this.originalState.get(element);
      if (!original) return;
      element.inert = original.inert;
      if (original.ariaHidden === null) {
        element.removeAttribute("aria-hidden");
      } else {
        element.setAttribute("aria-hidden", original.ariaHidden);
      }
      this.originalState.delete(element);
    },
    _release(element) {
      this.originalState.delete(element);
    },
    _syncStacking(roots) {
      const next = new Set(roots);
      const topRoot = roots[roots.length - 1] || null;
      roots.forEach((root, index) => {
        if (!this.rootStyleState.has(root)) {
          this.rootStyleState.set(root, {
            zIndex: root.style.zIndex,
            inert: root.inert,
            ariaHidden: root.getAttribute("aria-hidden")
          });
        }
        root.style.zIndex = String(1e3 + index);
        root.dataset.overlayStackIndex = String(index + 1);
        if (root === topRoot) {
          this._restoreRootVisibility(root);
        } else {
          this._coverRoot(root);
        }
      });
      for (const root of this.stackedRoots) {
        if (next.has(root)) continue;
        this._restoreStacking(root);
      }
      this.stackedRoots = next;
    },
    _coverRoot(root) {
      root.inert = true;
      root.setAttribute("aria-hidden", "true");
      root.dataset.overlayCovered = "true";
    },
    _restoreRootVisibility(root) {
      const original = this.rootStyleState.get(root);
      if (!original) return;
      root.inert = original.inert;
      if (original.ariaHidden === null) {
        root.removeAttribute("aria-hidden");
      } else {
        root.setAttribute("aria-hidden", original.ariaHidden);
      }
      delete root.dataset.overlayCovered;
    },
    _restoreStacking(root) {
      const original = this.rootStyleState.get(root);
      if (!original) return;
      root.style.zIndex = original.zIndex;
      this._restoreRootVisibility(root);
      delete root.dataset.overlayStackIndex;
      this.rootStyleState.delete(root);
    },
    _syncScrollLock(locked) {
      if (locked) {
        this._lockScroll();
      } else {
        this._restoreScroll();
      }
    },
    _lockScroll() {
      if (this.scrollLock || !document.body) return;
      const html = document.documentElement;
      const body = document.body;
      const scrollbarWidth = Math.max(0, window.innerWidth - html.clientWidth);
      this.scrollLock = {
        htmlOverflow: html.style.overflow,
        bodyOverflow: body.style.overflow,
        bodyPaddingRight: body.style.paddingRight
      };
      html.style.overflow = "hidden";
      body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        const currentPadding = Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;
        body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
      }
    },
    _restoreScroll() {
      if (!this.scrollLock || !document.body) return;
      const html = document.documentElement;
      const body = document.body;
      html.style.overflow = this.scrollLock.htmlOverflow;
      body.style.overflow = this.scrollLock.bodyOverflow;
      body.style.paddingRight = this.scrollLock.bodyPaddingRight;
      this.scrollLock = null;
    }
  };
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
      const overlayOrder = this._overlayOrder;
      this._unbind({ preserveOpenState: true });
      this._isOpenActive = wasOpen || false;
      this._previousFocus = previousFocus || null;
      this._pendingInvoker = pendingInvoker || null;
      this._overlayOrder = overlayOrder || null;
      this._panel = this._findPanel();
      this._close = this._findClose();
      if (!this._panel) {
        overlayRegistry.unregister(this);
        return;
      }
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
      this._overlayOrder = overlaySequence += 1;
      const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      const previousFocus = this._isRestoreTarget(this._pendingInvoker) ? this._pendingInvoker : active;
      this._pendingInvoker = null;
      this._previousFocus = this._isRestoreTarget(previousFocus) ? previousFocus : null;
      this.el.removeAttribute("inert");
      this.el.setAttribute("aria-hidden", "false");
      overlayRegistry.register(this);
      requestAnimationFrame(() => {
        if (!this._isOpenActive || !this._isOpen()) return;
        const active2 = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        if (active2 && active2 !== this._panel && this._panel.contains(active2)) return;
        const target = this._firstFocusable() || this._panel;
        target?.focus?.({ preventScroll: true });
      });
    },
    _deactivate() {
      this._isOpenActive = false;
      this._overlayOrder = null;
      overlayRegistry.unregister(this);
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
      if (overlayRegistry.top() && overlayRegistry.top() !== this) return;
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
    _unbind(options = {}) {
      if (!options.preserveOpenState) overlayRegistry.unregister(this);
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

  // ../../assets/js/hooks/command_palette.js
  var focusableSelector2 = [
    "a[href]",
    "button:not([disabled])",
    'input:not([disabled]):not([type="hidden"])',
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(",");
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
        const target = [...this.stack].reverse().find((hook) => hook?._matchesShortcut?.(e));
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
      const wasOpen = this._isOpenActive || false;
      const previousFocus = this._previousFocus || null;
      const pendingInvoker = this._pendingInvoker || null;
      this._unbind({ preserveState: true });
      this._isOpenActive = wasOpen;
      this._previousFocus = previousFocus;
      this._pendingInvoker = pendingInvoker;
      this.backdrop = this.el.querySelector('[data-exo="command-palette-backdrop"]');
      this.dialog = this.el.querySelector('[data-exo="command-palette-dialog"]');
      this.input = this.el.querySelector('[data-exo="command-palette-input"]');
      this.list = this.el.querySelector('[data-exo="command-palette-list"]');
      this.empty = this.el.querySelector('[data-exo="command-palette-empty"]');
      this.items = Array.from(this.el.querySelectorAll('[data-exo="command-palette-item"]'));
      this.shortcut = (this.el.dataset.shortcut || "").trim().toLowerCase();
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
      this._syncOpenState({ restoreFocus: false });
      if (!this._isOpen()) this.el.style.display = "none";
      if (this.empty) this.empty.hidden = true;
      this.el.dataset.ready = "true";
      this._toggle = () => this._isOpen() ? this._close() : this._open();
      PaletteRegistry.register(this);
      this._onKey = (e) => {
        if (e.key === "Escape") {
          this._close();
          return;
        }
        if (!this._isOpen()) return;
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
        if (e.key === "Tab") {
          this._trapFocus(e);
        }
      };
      this.el.addEventListener("keydown", this._onKey);
      this._onDocumentPointerdown = (e) => this._rememberInvoker(e);
      this._onDocumentClick = (e) => this._rememberInvoker(e);
      document.addEventListener("pointerdown", this._onDocumentPointerdown, true);
      document.addEventListener("click", this._onDocumentClick, true);
      this._observer = new MutationObserver(() => this._syncOpenState());
      this._observer.observe(this.el, {
        attributes: true,
        attributeFilter: ["class", "style", "hidden", "aria-hidden", "data-state"]
      });
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
    _isOpen() {
      return this.el.classList.contains("open") && this.el.style.display !== "none" && !this.el.hidden;
    },
    _open() {
      this.el.style.display = "block";
      this.el.hidden = false;
      this.el.classList.add("open");
      this._syncOpenState();
    },
    _close() {
      this.el.classList.remove("open");
      this.el.style.display = "none";
      this._syncOpenState();
    },
    _syncOpenState(options = {}) {
      const open = this._isOpen();
      const state = open ? "open" : "closed";
      const hidden = open ? "false" : "true";
      const expanded = open ? "true" : "false";
      if (this.el.dataset.state !== state) this.el.dataset.state = state;
      if (this.el.getAttribute("aria-hidden") !== hidden) this.el.setAttribute("aria-hidden", hidden);
      if (this.input && this.input.getAttribute("aria-expanded") !== expanded) {
        this.input.setAttribute("aria-expanded", expanded);
      }
      if (open && !this._isOpenActive) {
        this._activate(options);
      } else if (!open && this._isOpenActive) {
        this._deactivate(options);
      }
    },
    _activate() {
      this._isOpenActive = true;
      const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      const previousFocus = this._isRestoreTarget(this._pendingInvoker) ? this._pendingInvoker : active;
      this._pendingInvoker = null;
      this._previousFocus = this._isRestoreTarget(previousFocus) ? previousFocus : null;
      overlayRegistry.register(this);
      this._filter();
      requestAnimationFrame(() => {
        if (!this._isOpenActive || !this._isOpen()) return;
        this.input?.focus?.({ preventScroll: true });
      });
    },
    _deactivate(options = {}) {
      this._isOpenActive = false;
      overlayRegistry.unregister(this);
      this._overlayOrder = null;
      this._reset();
      if (options.restoreFocus === false) return;
      const target = this._previousFocus;
      this._previousFocus = null;
      requestAnimationFrame(() => {
        if (target && target.isConnected && !target.closest("[hidden],[inert]")) {
          target.focus({ preventScroll: true });
        }
      });
    },
    _reset() {
      if (this.input) this.input.value = "";
      this.items.forEach((item) => {
        item.hidden = false;
        this._setItemActive(item, false);
      });
      if (this.empty) this.empty.hidden = true;
      this.activeIndex = -1;
      this._syncActiveDescendant();
    },
    _rememberInvoker(event) {
      if (this._isOpen()) return;
      const target = event.target instanceof Element ? event.target.closest(focusableSelector2) : null;
      if (this._isRestoreTarget(target)) this._pendingInvoker = target;
    },
    _isRestoreTarget(element) {
      if (!(element instanceof HTMLElement)) return false;
      if (!element.isConnected || this.el.contains(element)) return false;
      if (element.closest("[hidden],[inert]")) return false;
      if (element.hasAttribute("disabled") || element.getAttribute("aria-disabled") === "true") return false;
      if (!element.matches(focusableSelector2)) return false;
      return true;
    },
    _focusables() {
      if (!this.dialog) return [];
      return Array.from(this.dialog.querySelectorAll(focusableSelector2)).filter((element) => {
        if (!(element instanceof HTMLElement)) return false;
        if (element.hidden || element.getAttribute("aria-hidden") === "true") return false;
        if (element.closest("[hidden],[inert]")) return false;
        if (element.tabIndex < 0) return false;
        return Boolean(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
      });
    },
    _trapFocus(event) {
      const focusables = this._focusables();
      if (focusables.length === 0) {
        event.preventDefault();
        this.dialog?.focus?.({ preventScroll: true });
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !this.dialog.contains(active))) {
        event.preventDefault();
        last.focus({ preventScroll: true });
        return;
      }
      if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    },
    _isDisabled(item) {
      return item.disabled || item.dataset.disabled === "true" || item.getAttribute("aria-disabled") === "true";
    },
    _matchesShortcut(event) {
      if (!this.shortcut) return false;
      return this.shortcut.split(",").map((combo) => combo.trim()).filter(Boolean).some((combo) => this._matchesShortcutCombo(event, combo));
    },
    _matchesShortcutCombo(event, combo) {
      const tokens = combo.split("+").map((token) => token.trim().toLowerCase()).filter(Boolean);
      const modifiers = ["mod", "cmd", "command", "meta", "ctrl", "control", "alt", "option", "shift"];
      const key = tokens.find((token) => !modifiers.includes(token));
      if (!key || event.key.toLowerCase() !== key) return false;
      const wantsMod = tokens.includes("mod");
      const wantsMeta = tokens.some((token) => ["cmd", "command", "meta"].includes(token));
      const wantsCtrl = tokens.some((token) => ["ctrl", "control"].includes(token));
      const wantsAlt = tokens.some((token) => ["alt", "option"].includes(token));
      const wantsShift = tokens.includes("shift");
      if (wantsMod && !(event.metaKey || event.ctrlKey)) return false;
      if (!wantsMod && event.metaKey !== wantsMeta) return false;
      if (!wantsMod && event.ctrlKey !== wantsCtrl) return false;
      if (event.altKey !== wantsAlt) return false;
      if (event.shiftKey !== wantsShift) return false;
      return true;
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
    _unbind(options = {}) {
      if (!options.preserveState) PaletteRegistry.unregister(this);
      if (!options.preserveState) overlayRegistry.unregister(this);
      if (this._onKey) this.el.removeEventListener("keydown", this._onKey);
      if (this._onDocumentPointerdown) document.removeEventListener("pointerdown", this._onDocumentPointerdown, true);
      if (this._onDocumentClick) document.removeEventListener("click", this._onDocumentClick, true);
      if (this._observer) this._observer.disconnect();
      if (this.input && this._onInput) this.input.removeEventListener("input", this._onInput);
      if (this._onItemPointerMove) this.el.removeEventListener("pointermove", this._onItemPointerMove);
      if (this._onItemClick) this.el.removeEventListener("click", this._onItemClick);
      if (this.backdrop && this._onBackdrop) {
        this.backdrop.removeEventListener("click", this._onBackdrop);
      }
      delete this.el.dataset.ready;
      this.backdrop = null;
      this.dialog = null;
      this.input = null;
      this.list = null;
      this.empty = null;
      this.items = [];
      this.shortcut = "";
      this.activeIndex = -1;
      this._onKey = null;
      this._onDocumentPointerdown = null;
      this._onDocumentClick = null;
      this._observer = null;
      this._onInput = null;
      this._onItemPointerMove = null;
      this._onItemClick = null;
      this._onBackdrop = null;
      this._toggle = null;
      if (!options.preserveState) {
        this._isOpenActive = false;
        this._previousFocus = null;
        this._pendingInvoker = null;
        this._overlayOrder = null;
      }
    }
  };

  // ../../assets/js/hooks/sidebar.js
  var ExoSidebar = {
    mounted() {
      this.toggle = this.el.querySelector('[data-exo="sidebar-toggle"]');
      this.trigger = this.el.querySelector('[data-exo="sidebar-hamburger"]');
      this.overlay = this.el.querySelector('[data-exo="sidebar-overlay"]');
      this.panel = this.el.querySelector('[data-exo="sidebar-panel"]');
      if (!this.toggle) return;
      this._applyState();
      requestAnimationFrame(() => {
        document.documentElement.setAttribute("data-sidebar-ready", "");
      });
      this._onTriggerClick = () => this._setExpanded(!this.toggle.checked, { persist: true });
      this._onOverlayClick = () => this._setExpanded(false);
      this._onKeyDown = (event) => {
        if (event.key !== "Escape" || !this.toggle.checked) return;
        this._setExpanded(false, { persist: this._isDesktop() });
        this.trigger?.focus();
      };
      this._onChange = () => {
        this._syncState();
        if (this._isDesktop()) this._writeCollapsed(!this.toggle.checked);
      };
      this._mediaQuery = window.matchMedia("(min-width: 768px)");
      this._onMediaChange = () => this._applyState();
      this.trigger?.addEventListener("click", this._onTriggerClick);
      this.overlay?.addEventListener("click", this._onOverlayClick);
      document.addEventListener("keydown", this._onKeyDown);
      this.toggle.addEventListener("change", this._onChange);
      if (this._mediaQuery.addEventListener) {
        this._mediaQuery.addEventListener("change", this._onMediaChange);
      } else {
        this._mediaQuery.addListener(this._onMediaChange);
      }
      this.el.setAttribute("data-ready", "");
    },
    destroyed() {
      this.trigger?.removeEventListener("click", this._onTriggerClick);
      this.overlay?.removeEventListener("click", this._onOverlayClick);
      document.removeEventListener("keydown", this._onKeyDown);
      this.toggle?.removeEventListener("change", this._onChange);
      if (this._mediaQuery?.removeEventListener) {
        this._mediaQuery.removeEventListener("change", this._onMediaChange);
      } else {
        this._mediaQuery?.removeListener(this._onMediaChange);
      }
      this.el?.removeAttribute("data-ready");
    },
    updated() {
      this._applyState();
    },
    _applyState() {
      if (!this.toggle) return;
      if (this._isDesktop()) {
        this.toggle.checked = !this._readCollapsed();
      } else {
        this.toggle.checked = false;
      }
      this._syncState();
    },
    _setExpanded(expanded, opts = {}) {
      this.toggle.checked = expanded;
      this._syncState();
      if (opts.persist && this._isDesktop()) this._writeCollapsed(!expanded);
      this.toggle.dispatchEvent(new Event("change", { bubbles: true }));
    },
    _syncState() {
      const expanded = this.toggle.checked;
      const state = expanded ? "open" : "closed";
      this.el.setAttribute("data-state", state);
      this.panel?.setAttribute("data-state", state);
      this.trigger?.setAttribute("aria-expanded", expanded ? "true" : "false");
    },
    _isDesktop() {
      return window.matchMedia("(min-width: 768px)").matches;
    },
    _readCollapsed() {
      try {
        return localStorage.getItem("exo-sidebar-collapsed") === "true";
      } catch (_err) {
        return false;
      }
    },
    _writeCollapsed(collapsed) {
      try {
        localStorage.setItem("exo-sidebar-collapsed", collapsed ? "true" : "false");
      } catch (_err) {
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
        this._writeTheme(value);
      };
      this.el.addEventListener("click", this._onClick);
    },
    _unbind() {
      if (this._onClick) this.el.removeEventListener("click", this._onClick);
      if (this.el) this.el.removeAttribute("data-ready");
      this._onClick = null;
    },
    _current() {
      try {
        return localStorage.getItem("exo-theme") || "system";
      } catch (_err) {
        return "system";
      }
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
    },
    _writeTheme(theme) {
      try {
        localStorage.setItem("exo-theme", theme);
      } catch (_err) {
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
      this._syncOptions();
      this._onToggle = () => {
        const open = this._popover.matches(":popover-open");
        this._trigger.setAttribute("aria-expanded", String(open));
        if (open) {
          const selected = this._listbox.querySelector("[data-selected]");
          if (selected) this._setActiveOption(selected);
        } else {
          this._clearActiveOption();
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
        const options = this._enabledOptions();
        if (!options.length) return;
        const idx = Math.max(options.indexOf(this._activeOption), options.indexOf(document.activeElement));
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
        if (next >= 0) this._setActiveOption(options[next]);
      };
      this._listbox.addEventListener("keydown", this._onKeydown);
    },
    _syncOptions() {
      this._listbox.querySelectorAll('[data-exo="select-option"]').forEach((option, index) => {
        if (!option.id) option.id = `${this.el.id}-option-${index}`;
        option.setAttribute("role", "option");
        option.setAttribute("tabindex", "-1");
      });
    },
    _enabledOptions() {
      return [...this._listbox.querySelectorAll('[data-exo="select-option"]:not([data-disabled])')];
    },
    _setActiveOption(option) {
      if (!option) return;
      if (this._activeOption && this._activeOption !== option) {
        delete this._activeOption.dataset.active;
      }
      this._activeOption = option;
      option.dataset.active = "";
      this._trigger?.setAttribute("aria-activedescendant", option.id);
      this._listbox?.setAttribute("aria-activedescendant", option.id);
      option.scrollIntoView({ block: "nearest" });
      option.focus();
    },
    _clearActiveOption() {
      if (this._activeOption) delete this._activeOption.dataset.active;
      this._activeOption = null;
      this._trigger?.removeAttribute("aria-activedescendant");
      this._listbox?.removeAttribute("aria-activedescendant");
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
      this._setActiveOption(opt);
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
      const currentIdx = Math.max(options.indexOf(this._activeOption), options.indexOf(document.activeElement));
      const start = currentIdx + 1;
      const rotated = [...options.slice(start), ...options.slice(0, start)];
      const match = rotated.find((o) => o.textContent.trim().toLowerCase().startsWith(lower));
      if (match) this._setActiveOption(match);
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
      this._activeOption = null;
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
      const onFilterTarget = this.el.getAttribute("phx-target");
      const debounce = parseInt(this.el.dataset.debounce || "300", 10);
      this._search = isInputTrigger ? this.el.querySelector('[data-exo-combobox="input-trigger"]') : this.el.querySelector('[data-exo="combobox-search"]');
      const triggerBtn = this.el.querySelector('[data-exo-combobox="trigger"]');
      const popoverId = triggerBtn?.getAttribute("popovertarget") || this.el.querySelector('[data-exo="popover-content"]')?.id;
      this._popover = popoverId ? document.getElementById(popoverId) : null;
      this._hidden = this.el.closest('[data-exo="field"]')?.querySelector('input[type="hidden"]');
      this._listbox = this.el.querySelector('[role="listbox"]');
      this._empty = this.el.querySelector('[data-exo="combobox-empty"]');
      this._create = this.el.querySelector('[data-exo="combobox-create"]');
      this._loading = this.el.querySelector('[data-exo="combobox-loading"]');
      this._status = this.el.querySelector('[data-exo="combobox-status"]');
      this._serverStatus = this._status?.textContent.trim() || "";
      this._clear = this.el.querySelector('[data-exo="combobox-clear"]');
      if (!this._popover) return;
      if (this._listbox) this._syncOptions();
      this._syncStatusFromState();
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
          this._clearActiveOption();
          this._serverStatus = "";
          this._announceStatus("Selection cleared");
        };
        this._clear.addEventListener("click", this._onClear);
      }
      this._onToggle = () => {
        const open = this._popover.matches(":popover-open");
        syncExpanded();
        if (open && this._search) {
          if (!isInputTrigger) {
            this._search.value = "";
            this._lastQuery = "";
            this._serverStatus = "";
            if (filter === "client") this._clientFilter("");
            focusSearch();
          }
          this._setInitialActiveOption();
          this._syncStatusFromState();
        } else if (!open) {
          this._clearActiveOption();
          this._serverStatus = "";
          this._syncStatusFromState();
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
          this._lastQuery = query;
          this._serverStatus = "";
          if (filter === "client") {
            this._clientFilter(query);
            this._syncActiveAfterFilter();
            this._syncStatusFromState();
          } else {
            clearTimeout(this._debounceTimer);
            this._debounceTimer = setTimeout(() => {
              if (onFilterTarget) this.pushEventTo(onFilterTarget, onFilter, { query });
              else if (onFilter) this.pushEvent(onFilter, { query });
            }, debounce);
            this._announceStatus(query ? "Searching results" : "");
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
          const opts = this._visibleOptions();
          if (!opts.length) return;
          const idx = Math.max(opts.indexOf(this._activeOption), opts.indexOf(document.activeElement));
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
          this._setActiveOption(opts[next]);
        };
        this._popover.addEventListener("keydown", this._onKeydown);
      }
      this.el.setAttribute("data-ready", "");
    },
    _syncOptions() {
      this._listbox.querySelectorAll('[data-exo="combobox-option"]').forEach((option, index) => {
        if (!option.id) option.id = `${this.el.id}-option-${index}`;
        option.setAttribute("role", "option");
        option.setAttribute("tabindex", "-1");
      });
    },
    _visibleOptions() {
      if (!this._listbox) return [];
      return [...this._listbox.querySelectorAll('[data-exo="combobox-option"]:not([data-disabled]):not([hidden])')];
    },
    _setInitialActiveOption() {
      const selected = this._listbox?.querySelector('[data-exo="combobox-option"][data-selected]:not([hidden])');
      if (selected && !selected.hasAttribute("data-disabled")) this._setActiveOption(selected);
    },
    _setActiveOption(option) {
      if (!option) return;
      if (this._activeOption && this._activeOption !== option) {
        delete this._activeOption.dataset.active;
      }
      this._activeOption = option;
      option.dataset.active = "";
      this._search?.setAttribute("aria-activedescendant", option.id);
      this._listbox?.setAttribute("aria-activedescendant", option.id);
      option.scrollIntoView({ block: "nearest" });
    },
    _clearActiveOption() {
      if (this._activeOption) delete this._activeOption.dataset.active;
      this._activeOption = null;
      this._search?.removeAttribute("aria-activedescendant");
      this._listbox?.removeAttribute("aria-activedescendant");
    },
    _syncActiveAfterFilter() {
      const visible = this._visibleOptions();
      if (!visible.length) {
        this._clearActiveOption();
        return;
      }
      if (!this._activeOption || this._activeOption.hidden || !visible.includes(this._activeOption)) {
        this._setActiveOption(visible[0]);
      }
    },
    _isOpen() {
      return this._popover?.matches(":popover-open") === true;
    },
    _isLoading() {
      return this._loading && !this._loading.hidden && this._loading.style.display !== "none";
    },
    _syncBusyState() {
      this._listbox?.setAttribute("aria-busy", String(this._isLoading()));
    },
    _syncStatusFromState() {
      this._syncBusyState();
      if (this._isLoading()) {
        this._announceStatus("Loading results");
        return;
      }
      if (!this._isOpen()) {
        this._announceStatus("");
        return;
      }
      if (this._serverStatus) {
        this._announceStatus(this._serverStatus);
        return;
      }
      const query = this._search?.value || this._lastQuery || "";
      const hasQuery = query.trim().length > 0;
      const shouldAnnounceResults = this.el.dataset.filter === "client" || hasQuery || this._empty;
      if (!shouldAnnounceResults) {
        this._announceStatus("");
        return;
      }
      const visible = this._visibleOptions();
      if (!visible.length) {
        const emptyText = this._empty?.textContent.trim();
        this._announceStatus(emptyText || "No results found");
        return;
      }
      this._announceStatus(`${visible.length} ${visible.length === 1 ? "result" : "results"} available`);
    },
    _announceStatus(message) {
      if (!this._status) return;
      this._status.textContent = message;
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
      this._setActiveOption(opt);
      this._announceStatus(`Selected ${opt.textContent.trim()}`);
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
      if (this.el) this.el.removeAttribute("data-ready");
      this._popover = null;
      this._listbox = null;
      this._search = null;
      this._clear = null;
      this._empty = null;
      this._create = null;
      this._loading = null;
      this._status = null;
      this._hidden = null;
      this._activeOption = null;
      if (!this.el?.isConnected) {
        this._lastQuery = "";
        this._serverStatus = "";
      }
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

  // ../../assets/js/hooks/date_picker.js
  var ExoDatePicker = {
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
      this._grid = this.el.querySelector('[data-exo="date-picker-grid"]');
      if (!this._grid) return;
      this._onKeydown = (event) => {
        const day = this._closestDay(event);
        if (!day) return;
        if (event.key === "PageUp" || event.key === "PageDown") {
          event.preventDefault();
          this._clickNav(event.key === "PageUp" ? "Previous month" : "Next month");
          return;
        }
        const target = this._targetForKey(day, event);
        if (!target) return;
        event.preventDefault();
        this._focusDay(target);
      };
      this._grid.addEventListener("keydown", this._onKeydown);
      this._syncTabStop();
      this.el.setAttribute("data-ready", "");
    },
    _unbind() {
      if (this._grid && this._onKeydown) {
        this._grid.removeEventListener("keydown", this._onKeydown);
      }
      if (this.el) this.el.removeAttribute("data-ready");
      this._grid = null;
      this._onKeydown = null;
    },
    _targetForKey(day, event) {
      switch (event.key) {
        case "ArrowLeft":
          return this._moveBy(day, -1);
        case "ArrowRight":
          return this._moveBy(day, 1);
        case "ArrowUp":
          return this._moveBy(day, -7);
        case "ArrowDown":
          return this._moveBy(day, 7);
        case "Home":
          return this._rowTarget(day, "first");
        case "End":
          return this._rowTarget(day, "last");
        default:
          return null;
      }
    },
    _moveBy(day, delta) {
      const days = this._days();
      const index = days.indexOf(day);
      if (index === -1) return null;
      const step = delta > 0 ? 1 : -1;
      let nextIndex = index + delta;
      while (nextIndex >= 0 && nextIndex < days.length) {
        const candidate = days[nextIndex];
        if (!this._isDisabled(candidate)) return candidate;
        nextIndex += step;
      }
      return null;
    },
    _rowTarget(day, position) {
      const row = day.closest('[data-exo="date-picker-week"]');
      const days = Array.from(row?.querySelectorAll('[data-exo="date-picker-day"]') || []).filter((candidate) => !this._isDisabled(candidate));
      if (days.length === 0) return null;
      return position === "first" ? days[0] : days[days.length - 1];
    },
    _clickNav(label) {
      const button = Array.from(this.el.querySelectorAll('[data-exo="date-picker-nav"]')).find((candidate) => candidate.getAttribute("aria-label") === label);
      if (button && !button.disabled) button.click();
    },
    _focusDay(day) {
      this._days().forEach((candidate) => {
        candidate.tabIndex = candidate === day ? 0 : -1;
      });
      day.focus();
    },
    _syncTabStop() {
      const enabled = this._days().filter((day) => !this._isDisabled(day));
      if (enabled.length === 0) return;
      const active = enabled.find((day) => day.tabIndex === 0) || enabled[0];
      enabled.forEach((day) => {
        day.tabIndex = day === active ? 0 : -1;
      });
    },
    _days() {
      return Array.from(this.el.querySelectorAll('[data-exo="date-picker-day"]'));
    },
    _closestDay(event) {
      const target = event.target instanceof Element ? event.target : event.target?.parentElement;
      return target?.closest?.('[data-exo="date-picker-day"]');
    },
    _isDisabled(day) {
      return day.disabled || day.getAttribute("aria-disabled") === "true";
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

  // ../../assets/js/hooks/swap.js
  var ExoSwap = {
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
      this.input = this.el.querySelector('[data-exo="swap-state"]');
      if (!this.input) return;
      this.el.setAttribute("data-ready", "");
      this._sync();
      this._onChange = () => this._sync();
      this._onClick = (event) => {
        const target = event.target instanceof Element ? event.target : event.target?.parentElement;
        const interactive = target?.closest("a, button, input, select, textarea");
        if (interactive && interactive !== this.input) return;
        if (event.target === this.input) return;
        event.preventDefault();
        this._toggle();
      };
      this._onKeydown = (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        this._toggle();
      };
      this.input.addEventListener("change", this._onChange);
      this.el.addEventListener("click", this._onClick);
      this.el.addEventListener("keydown", this._onKeydown);
    },
    _unbind() {
      if (this.input && this._onChange) this.input.removeEventListener("change", this._onChange);
      if (this.el && this._onClick) this.el.removeEventListener("click", this._onClick);
      if (this.el && this._onKeydown) this.el.removeEventListener("keydown", this._onKeydown);
      if (this.el) this.el.removeAttribute("data-ready");
      this.input = null;
      this._onChange = null;
      this._onClick = null;
      this._onKeydown = null;
    },
    _toggle() {
      if (!this.input) return;
      this.input.checked = !this.input.checked;
      this.input.dispatchEvent(new Event("change", { bubbles: true }));
    },
    _sync() {
      const checked = Boolean(this.input && this.input.checked);
      this.el.setAttribute("aria-checked", checked ? "true" : "false");
      this.el.toggleAttribute("data-active", checked);
    }
  };

  // ../../assets/js/hooks/table.js
  var ExoTable = {
    mounted() {
      this._onKeydown = (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        const target = event.target instanceof Element ? event.target : event.target?.parentElement;
        const row = target?.closest?.('[data-exo="table-row"][data-clickable]');
        if (!row || row !== target || !this.el.contains(row)) return;
        event.preventDefault();
        row.click();
      };
      this.el.addEventListener("keydown", this._onKeydown);
    },
    destroyed() {
      if (this._onKeydown) this.el.removeEventListener("keydown", this._onKeydown);
      this._onKeydown = null;
    }
  };

  // ../../assets/js/hooks/slider.js
  var ExoSlider = {
    mounted() {
      this.syncValue = this.syncValue.bind(this);
      this.bindSlider();
    },
    updated() {
      this.unbindSlider();
      this.bindSlider();
    },
    destroyed() {
      this.unbindSlider();
    },
    bindSlider() {
      this.input = this.el.querySelector('[data-exo-slider="input"]');
      this.output = this.el.querySelector('[data-exo-slider="output"]');
      if (!this.input || !this.output) return;
      this.input.addEventListener("input", this.syncValue);
      this.input.addEventListener("change", this.syncValue);
      this.syncValue();
    },
    unbindSlider() {
      if (!this.input) return;
      this.input.removeEventListener("input", this.syncValue);
      this.input.removeEventListener("change", this.syncValue);
    },
    syncValue() {
      if (!this.input || !this.output) return;
      const suffix = this.output.dataset.suffix || "";
      const visibleValue = `${this.input.value}${suffix}`;
      const ariaValueText = this.output.dataset.ariaValueText || (suffix ? visibleValue : "");
      this.output.textContent = visibleValue;
      if (ariaValueText) {
        this.input.setAttribute("aria-valuetext", ariaValueText);
      } else {
        this.input.removeAttribute("aria-valuetext");
      }
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
    ExoDatePicker,
    ExoRating,
    ExoMenubar,
    ExoOverlay,
    ExoTabs,
    ExoSwap,
    ExoTable,
    ExoSlider
  };

  // js/storybook.js
  window.storybook = {
    Hooks: hooks,
    Params: {},
    Uploaders: {}
  };
})();
