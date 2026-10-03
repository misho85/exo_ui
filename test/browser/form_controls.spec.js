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
});
