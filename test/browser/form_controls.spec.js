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

    await expectAttribute(slider, "aria-invalid", "true");
    await expectAttribute(slider, "aria-describedby", `${sliderId}-description ${sliderId}-error`);
    await expect(disabledSlider).toBeDisabled();

    await gotoStory(page, "/components/forms/file_input");

    const file = story(page).locator('[data-exo="file-input"][name="required_upload"]');
    const fileId = await file.getAttribute("id");

    await expectAttribute(file, "aria-invalid", "true");
    await expectAttribute(file, "aria-describedby", `${fileId}-description ${fileId}-error`);
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
});
