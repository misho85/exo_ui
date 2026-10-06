const { test, expect } = require("@playwright/test");

const { expectAttribute, gotoStory, story } = require("./helpers/storybook");

test.describe("form controls", () => {
  test("input and checkbox expose error descriptions to assistive tech", async ({ page }) => {
    await gotoStory(page, "/components/forms/input");

    const canvas = story(page);
    const input = canvas.locator("[data-exo=\"input\"][name=\"email\"][aria-invalid=\"true\"]");
    const checkbox = canvas.locator("[data-exo=\"checkbox\"][name=\"terms\"][aria-invalid=\"true\"]");
    const inputId = await input.getAttribute("id");
    const checkboxId = await checkbox.getAttribute("id");

    await expectAttribute(input, "aria-invalid", "true");
    await expectAttribute(input, "aria-describedby", `${inputId}-description ${inputId}-error`);
    await expect(canvas.locator(`#${inputId}-error`)).toHaveAttribute("role", "alert");

    const budget = canvas.locator('[data-exo="input"][name="budget"]');
    const budgetFrame = canvas.locator('[data-exo="input-frame"]:has([data-exo="input"][name="budget"])');
    const iconFrame = canvas.locator('[data-exo="input-frame"]:has([data-exo="input"][name="query"])');

    await expect(budgetFrame).toContainText("$");
    await expect(budgetFrame).toContainText("USD");
    await expectAttribute(budget, "data-adorned", "");
    await expect(iconFrame.locator('[data-exo="input-icon"][data-position="leading"]')).toHaveAttribute(
      "aria-hidden",
      "true"
    );
    await expect(iconFrame.locator('[data-exo="input-icon"][data-position="trailing"]')).toHaveAttribute(
      "aria-hidden",
      "true"
    );

    await expectAttribute(checkbox, "aria-invalid", "true");
    await expectAttribute(checkbox, "aria-describedby", `${checkboxId}-description ${checkboxId}-error`);
    await expect(canvas.locator(`#${checkboxId}-error`)).toHaveAttribute("role", "alert");
  });

  test("grouped form controls expose invalid state and describedby links", async ({ page }) => {
    await gotoStory(page, "/components/forms/radio_group");

    const canvas = story(page);
    const group = canvas.locator("#radio-group-single-invalid-frequency");

    await expectAttribute(group, "aria-invalid", "true");
    await expectAttribute(
      group,
      "aria-describedby",
      "radio-group-single-invalid-frequency-description radio-group-single-invalid-frequency-error"
    );
    await expect(canvas.locator("#radio-group-single-invalid-frequency-error")).toHaveAttribute(
      "role",
      "alert"
    );
    await expect(canvas.locator("#radio-group-single-priority-critical")).toBeDisabled();
    await expect(canvas.locator("#radio-group-single-slot-items-pickup")).toBeDisabled();
    await expect(canvas.locator("#radio-group-single-disabled")).toHaveAttribute("disabled", "");

    await gotoStory(page, "/components/forms/fieldset");

    const fieldset = story(page).locator("[data-exo=\"fieldset\"][aria-invalid=\"true\"]");
    await expect(fieldset).toHaveAttribute("aria-describedby", /description.*error/);
    await expect(fieldset.locator("[data-exo=\"field-error\"]")).toHaveAttribute("role", "alert");

    await gotoStory(page, "/components/forms/slider");

    const slider = story(page).locator("[data-exo=\"slider\"][name=\"threshold\"][aria-invalid=\"true\"]");
    const sliderId = await slider.getAttribute("id");
    const disabledSlider = story(page).locator("[data-exo=\"slider\"][name=\"locked_quota\"]");
    const valueSlider = story(page).locator("[data-exo=\"slider\"][name=\"brightness\"]");
    const valueSliderId = await valueSlider.getAttribute("id");
    const valueOutput = story(page).locator(`[data-exo="slider-value"][for="${valueSliderId}"]`);

    await expectAttribute(slider, "aria-invalid", "true");
    await expectAttribute(slider, "aria-describedby", `${sliderId}-description ${sliderId}-error`);
    await expect(disabledSlider).toBeDisabled();
    await expectAttribute(valueSlider, "aria-valuetext", "75%");
    await expect(valueOutput).toHaveText("75%");

    await valueSlider.evaluate((node) => {
      node.value = "76";
      node.dispatchEvent(new Event("input", { bubbles: true }));
    });

    await expectAttribute(valueSlider, "aria-valuetext", "76%");
    await expect(valueOutput).toHaveText("76%");

    await gotoStory(page, "/components/forms/file_input");

    const file = story(page).locator('[data-exo="file-input"][name="required_upload"]');
    const fileId = await file.getAttribute("id");
    const documents = story(page).locator('[data-exo="file-input"][name="documents"]');
    const documentsId = await documents.getAttribute("id");
    const selected = story(page).locator(`[data-exo="file-input-selected"][for="${documentsId}"]`);

    await expectAttribute(file, "aria-invalid", "true");
    await expectAttribute(
      file,
      "aria-describedby",
      `${fileId}-description ${fileId}-selected ${fileId}-error`
    );
    await expectAttribute(documents, "aria-describedby", `${documentsId}-description ${documentsId}-selected`);
    await expect(selected).toHaveText("No documents selected");

    await documents.setInputFiles([
      {
        name: "accounts.csv",
        mimeType: "text/csv",
        buffer: Buffer.from("account,owner\nNorthstar,Iva\n")
      },
      {
        name: "contracts.pdf",
        mimeType: "application/pdf",
        buffer: Buffer.from("%PDF-1.4\n")
      }
    ]);

    await expect(selected).toHaveText("accounts.csv, contracts.pdf");
  });

  test("select and combobox triggers expose description and error ids", async ({ page }) => {
    await gotoStory(page, "/components/forms/select");

    const canvas = story(page);
    const selectTrigger = canvas.locator("#select-single-with-errors-select [data-exo-select=\"trigger\"]");

    await expectAttribute(selectTrigger, "aria-invalid", "true");
    await expectAttribute(
      selectTrigger,
      "aria-describedby",
      "select-single-with-errors-description select-single-with-errors-error"
    );

    await gotoStory(page, "/components/forms/combobox");

    const comboboxTrigger = story(page).locator(
      "#combobox-single-with-errors-combobox [data-exo-combobox=\"trigger\"]"
    );
    await expectAttribute(comboboxTrigger, "aria-invalid", "true");
    await expectAttribute(
      comboboxTrigger,
      "aria-describedby",
      "combobox-single-with-errors-description combobox-single-with-errors-error"
    );
  });

  // An option's description goes under its label. It had no rule, so in the
  // one-row flex item it became a third column, and in a narrow card the label
  // broke into a column one or two words wide (TRG-392). Measured under both box
  // models, because the indicator is 20px tall under `content-box` (Storybook)
  // and 16px under `border-box` (an app with a CSS reset).
  test("radio option description sits under its label", async ({ page }) => {
    await gotoStory(page, "/components/forms/radio_group");

    const group = story(page).locator("#radio-group-single-plan");
    const measure = () =>
      group.locator('[data-exo="radio-item"]').evaluateAll((nodes) =>
        nodes.map((item) => {
          const part = (name) => item.querySelector(`[data-exo="${name}"]`);
          const box = (name) => part(name).getBoundingClientRect();
          const range = document.createRange();
          range.selectNodeContents(part("radio-label"));
          const firstLine = range.getClientRects()[0];

          return {
            value: item.dataset.value,
            item: item.getBoundingClientRect(),
            indicator: box("radio-indicator"),
            label: box("radio-label"),
            description: box("radio-description"),
            firstLine: { top: firstLine.top, bottom: firstLine.bottom },
            labelSize: Number.parseFloat(getComputedStyle(part("radio-label")).fontSize),
            descriptionSize: Number.parseFloat(getComputedStyle(part("radio-description")).fontSize)
          };
        })
      );

    for (const boxModel of ["content-box", "border-box"]) {
      await group.evaluate((node, sizing) => {
        for (const element of [node, ...node.querySelectorAll("*")]) element.style.boxSizing = sizing;
      }, boxModel);

      const items = await measure();
      expect(items.map((item) => item.value)).toEqual(["free", "pro", "enterprise"]);

      for (const { value, item, indicator, label, description, firstLine, labelSize, descriptionSize } of items) {
        const at = `${boxModel} ${value}`;
        expect(description.top, `${at}: description under the label`).toBeGreaterThanOrEqual(label.bottom - 0.5);
        expect(Math.abs(description.left - label.left), `${at}: description starts where the label does`).toBeLessThanOrEqual(0.5);
        expect(label.left, `${at}: label right of the indicator`).toBeGreaterThan(indicator.right);
        expect(item.right - label.right, `${at}: label takes the rest of the row`).toBeLessThanOrEqual(0.5);

        const lineCenter = (firstLine.top + firstLine.bottom) / 2;
        const indicatorCenter = (indicator.top + indicator.bottom) / 2;
        expect(Math.abs(indicatorCenter - lineCenter), `${at}: indicator centred on the label's line`).toBeLessThanOrEqual(0.5);

        expect(descriptionSize, `${at}: description smaller than the label`).toBeLessThan(labelSize);
      }
    }
  });

  // WCAG 1.4.11: the boundary of a control, and what tells its state apart, need
  // 3:1 against what is next to them. Before, an unchecked checkbox or radio and
  // an off toggle were drawn in --exo-input / --exo-muted: about 1.1–1.3:1.
  test("toggle, checkbox and radio boundaries meet 3:1 in both themes", async ({ page }) => {
    const measure = (root, { themeName, selector }) => {
      const rgb = (css, under) => {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 1;
        const context = canvas.getContext("2d", { colorSpace: "srgb" });

        if (under) {
          context.fillStyle = `rgb(${under.join(",")})`;
          context.fillRect(0, 0, 1, 1);
        }

        context.fillStyle = css;
        context.fillRect(0, 0, 1, 1);
        return [...context.getImageData(0, 0, 1, 1).data].slice(0, 3);
      };

      const luminance = (channels) =>
        channels
          .map((value) => {
            const v = value / 255;
            return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
          })
          .reduce((sum, v, index) => sum + v * [0.2126, 0.7152, 0.0722][index], 0);

      const ratio = (a, b) => {
        const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
        return (high + 0.05) / (low + 0.05);
      };

      const controls = [...root.querySelectorAll(selector)];

      // Every variation renders in its own wrapper, so each one gets the theme.
      for (const control of controls) {
        const wrapper = control.closest('[data-exo="toggle"], [data-exo="checkbox-item"], [data-exo="radio-item"]')
          .parentElement;
        wrapper.setAttribute("data-theme", themeName);
        wrapper.style.background = "var(--exo-background)";
      }

      // The track and thumb transition their colours, so right after the theme
      // flips the computed colour is still the old theme's. Reading a style
      // starts the transitions; finishing them measures the settled state.
      getComputedStyle(controls[0]).borderTopColor;
      document.getAnimations().forEach((animation) => animation.finish());

      return {
        foreground: getComputedStyle(controls[0]).getPropertyValue("--exo-foreground").trim(),
        controls: controls.map((control) => {
          const item = control.closest('[data-exo="toggle"], [data-exo="checkbox-item"], [data-exo="radio-item"]');
          const surface = rgb(getComputedStyle(item.parentElement).backgroundColor);
          const style = getComputedStyle(control);
          const fill = rgb(style.backgroundColor, surface);
          const checked = item.querySelector('input[type="checkbox"], input[type="radio"]').checked;
          // Without a border, `borderTopColor` is `currentColor`, which would pass
          // for any control; the edge is then the control's own fill.
          const bordered = style.borderTopStyle !== "none" && Number.parseFloat(style.borderTopWidth) > 0;
          const edge = bordered ? rgb(style.borderTopColor, surface) : fill;
          const result = {
            name: `${item.dataset.exo} ${checked ? "on" : "off"}`,
            boundary: ratio(edge, surface)
          };

          if (item.dataset.exo === "toggle") {
            const thumb = getComputedStyle(control.querySelector('[data-exo="toggle-thumb"]'));
            result.thumb = ratio(rgb(thumb.backgroundColor, fill), fill);
          }

          return result;
        })
      };
    };

    const cases = [
      { path: "/components/actions/toggle", selector: '[data-exo="toggle-track"]', min: 4 },
      { path: "/components/forms/input", selector: '[data-exo="checkbox-indicator"]', min: 3 },
      { path: "/components/forms/radio_group", selector: '[data-exo="radio-indicator"]', min: 3 }
    ];

    for (const { path, selector, min } of cases) {
      await gotoStory(page, path);
      const foregrounds = [];

      for (const themeName of ["light", "dark"]) {
        const result = await story(page).evaluate(measure, { themeName, selector });
        foregrounds.push(result.foreground);
        expect(result.controls.length, `${path} controls`).toBeGreaterThanOrEqual(min);

        for (const control of result.controls) {
          expect(control.boundary, `${themeName} ${control.name} boundary`).toBeGreaterThanOrEqual(3);

          if (control.thumb !== undefined) {
            expect(control.thumb, `${themeName} ${control.name} thumb on its track`).toBeGreaterThanOrEqual(3);
          }
        }
      }

      // Both passes must have measured a different theme, not the same one twice.
      expect(foregrounds[0], path).not.toEqual(foregrounds[1]);
    }
  });

  // A storefront sets one brand colour for light and dark, and pairs it with a
  // foreground for its buttons. Drawn on the page or on a card, no such colour
  // stays visible in both themes, so a mark in --exo-primary vanished in one of
  // them: the check of the chosen option was 1.06:1 for #111827 on the dark
  // list and 2.15:1 for amber on the light one, the dot of a checked radio
  // 1.11:1 and 2.09:1 (TRG-452). null keeps ExoUI's own primary.
  test("the chosen option's check and a checked radio stay visible under one brand colour for both themes", async ({
    page
  }) => {
    const brands = [
      [null, null],
      ["#111827", "oklch(99% 0 0)"],
      ["#f59e0b", "oklch(20% 0.006 106)"]
    ];

    const measure = (root, { kind, theme, primary, foreground, radioId }) => {
      const rgb = (css, under) => {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 1;
        const context = canvas.getContext("2d", { colorSpace: "srgb" });

        if (under) {
          context.fillStyle = `rgb(${under.join(",")})`;
          context.fillRect(0, 0, 1, 1);
        }

        context.fillStyle = css;
        context.fillRect(0, 0, 1, 1);
        return [...context.getImageData(0, 0, 1, 1).data].slice(0, 3);
      };

      const luminance = (channels) =>
        channels
          .map((value) => {
            const v = value / 255;
            return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
          })
          .reduce((sum, v, index) => sum + v * [0.2126, 0.7152, 0.0722][index], 0);

      const ratio = (a, b) => {
        const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
        return (high + 0.05) / (low + 0.05);
      };

      const radio =
        kind === "radio" && (radioId ? root.querySelector(`#${radioId}`) : document.activeElement);

      // The theme goes on the control's own wrapper: the story sandbox around
      // it sets the light tokens itself, so a theme above it would not reach.
      const scope =
        kind === "radio"
          ? radio.closest('[data-exo="radio-group"]').parentElement
          : root.querySelector(`#${kind}-single-with-value-${kind}`).parentElement;

      scope.setAttribute("data-theme", theme);
      scope.style.background = "var(--exo-background)";

      for (const [name, value] of [
        ["--exo-primary", primary],
        ["--exo-primary-foreground", foreground]
      ]) {
        if (value) scope.style.setProperty(name, value);
        else scope.style.removeProperty(name);
      }

      // Options and indicators transition their colours: finish the
      // transitions so the settled theme is measured, not the previous one.
      const settle = (node) => {
        getComputedStyle(node).color;
        document.getAnimations().forEach((animation) => animation.finish());
      };

      const ground = rgb(getComputedStyle(scope).backgroundColor);

      if (kind === "radio") {
        const indicator = radio.nextElementSibling;
        settle(indicator);
        const style = getComputedStyle(indicator);
        // The ring right around the dot is the inset shadow. Before TRG-452 it
        // was the page colour around a --exo-primary dot; a focus ring that
        // replaces it leaves no inset shadow, and then the dot has no ring.
        const inset = style.boxShadow.match(/(?:^|,\s*)((?:rgba?|oklch|oklab|lab|lch|color)\([^)]*\))[^,]*\binset\b/);
        const ring = inset ? inset[1] : style.backgroundColor;

        return {
          card: getComputedStyle(scope).getPropertyValue("--exo-card").trim(),
          checked: radio.checked,
          focusVisible: radio.matches(":focus-visible"),
          ring: style.boxShadow,
          dot: ratio(rgb(style.backgroundColor, ground), rgb(ring, ground))
        };
      }

      const popover = root.querySelector(`#${kind}-single-with-value`);
      const option = popover.querySelector(`[data-exo="${kind}-option"][data-selected]`);
      const check = option.querySelector(`[data-exo="${kind}-check"]`);
      const list = rgb(getComputedStyle(popover).backgroundColor, ground);
      const states = {};

      // A combobox opens with its chosen option active, under the same colours
      // as focus; the option at rest is the one the arrow keys moved away from.
      const active = option.hasAttribute("data-active");

      for (const state of ["rest", "focus"]) {
        if (state === "focus") {
          if (active) option.setAttribute("data-active", "");
          option.focus();
        } else {
          option.removeAttribute("data-active");
          document.activeElement?.blur();
        }

        settle(option);
        const surface = rgb(getComputedStyle(option).backgroundColor, list);
        const icon = check.querySelector("svg") || check;

        states[state] = {
          check: ratio(rgb(getComputedStyle(icon).color, surface), surface),
          sameAsText: getComputedStyle(icon).color === getComputedStyle(option).color,
          opacity: Number(getComputedStyle(check).opacity)
        };
      }

      return { card: getComputedStyle(scope).getPropertyValue("--exo-card").trim(), states };
    };

    const results = [];

    for (const kind of ["select", "combobox"]) {
      await gotoStory(page, `/components/forms/${kind}`);

      const trigger = story(page).locator(`#${kind}-single-with-value-${kind} [data-exo-${kind}="trigger"]`);
      await trigger.click();
      await expect
        .poll(() => story(page).locator(`#${kind}-single-with-value`).evaluate((node) => node.matches(":popover-open")))
        .toBe(true);

      for (const theme of ["light", "dark"]) {
        for (const [primary, foreground] of brands) {
          const { card, states } = await story(page).evaluate(measure, { kind, theme, primary, foreground });
          results.push({ label: `${kind}, ${theme}, primary ${primary || "ExoUI"}`, kind, theme, card, states });
        }
      }
    }

    // Each control was measured in two different themes, not in one twice.
    for (const kind of ["select", "combobox"]) {
      const cards = new Set(results.filter((r) => r.kind === kind).map((r) => `${r.theme} ${r.card}`));
      const values = new Set(results.filter((r) => r.kind === kind).map((r) => r.card));
      expect(values.size, `${kind}: ${[...cards].join(", ")}`).toBe(2);
    }

    for (const { label, states } of results) {
      for (const [state, { check, opacity }] of Object.entries(states)) {
        expect(opacity, `${label}, ${state}: the check is shown`).toBe(1);
        expect(check, `${label}, ${state}: the check on its surface`).toBeGreaterThanOrEqual(3);
      }
    }

    // The option's own colour is the one a theme keeps readable on the list
    // and under the pointer, whatever the brand colour is.
    for (const { label, states } of results) {
      for (const [state, { sameAsText }] of Object.entries(states)) {
        expect(sameAsText, `${label}, ${state}: the check is the option's text colour`).toBe(true);
      }
    }

    await gotoStory(page, "/components/forms/radio_group");

    // The plan group is checked at "Pro". A key press moves the choice to
    // "Free" and makes the focus visible, so the focused checked radio is
    // measured as well as the one at rest.
    const pro = story(page).locator("#radio-group-single-plan-pro");
    await expect(pro).toBeChecked();

    const radioCards = new Set();

    for (const focused of [false, true]) {
      if (focused) {
        await pro.focus();
        await page.keyboard.press("ArrowUp");
        await expect(story(page).locator("#radio-group-single-plan-free")).toBeFocused();
      }

      const radioId = focused ? null : "radio-group-single-plan-pro";

      for (const theme of ["light", "dark"]) {
        for (const [primary, foreground] of brands) {
          const result = await story(page).evaluate(measure, { kind: "radio", theme, primary, foreground, radioId });
          const label = `radio${focused ? ", focused" : ""}, ${theme}, primary ${primary || "ExoUI"}`;

          expect(result.checked, label).toBe(true);
          expect(result.focusVisible, `${label}: focus ring shown`).toBe(focused);
          expect(result.dot, `${label}: the dot on its ring (${result.ring})`).toBeGreaterThanOrEqual(3);
          radioCards.add(result.card);
        }
      }
    }

    expect(radioCards.size, `radio themes: ${[...radioCards].join(", ")}`).toBe(2);
  });
});

const { mountHook, fixture } = require('./helpers/hooks');

test('slider and file summaries follow native form reset', async ({ page }) => {
  await fixture(page, `<form>
    <div id="slider"><input type="range" value="20" data-exo-slider="input"><output data-exo-slider="output" data-suffix="%"></output></div>
    <div id="file"><input type="file" data-exo-file-input="input"><output data-exo-file-input="selected" data-empty-label="No file"></output></div>
    <button type="reset">Reset</button></form>`);
  await mountHook(page, 'ExoSlider', 'slider.js', '#slider');
  await mountHook(page, 'ExoFileInput', 'file_input.js', '#file');
  await page.locator('input[type="range"]').fill('70');
  await page.locator('input[type="file"]').setInputFiles({ name: 'example.txt', mimeType: 'text/plain', buffer: Buffer.from('text') });
  await expect(page.locator('#slider output')).toHaveText('70%');
  await expect(page.locator('#file output')).toHaveText('example.txt');
  await page.getByRole('button', { name: 'Reset' }).click();
  await expect(page.locator('#slider output')).toHaveText('20%');
  await expect(page.locator('#slider input')).toHaveAttribute('aria-valuetext', '20%');
  await expect(page.locator('#file output')).toHaveText('No file');
});
