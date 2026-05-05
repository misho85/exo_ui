const { test, expect } = require("@playwright/test");

const { expectAttribute, expectFocused, gotoStory, story } = require("./helpers/storybook");

test.describe("data and feedback components", () => {
  test("date picker exposes calendar semantics, form value, and error links", async ({ page }) => {
    await gotoStory(page, "/components/forms/date_picker");

    const canvas = story(page);
    const invalidPicker = canvas.locator("#date-picker-single-with-error");
    const selectedPicker = canvas.locator("#date-picker-single-selected");
    const keyboardPicker = canvas.locator("#date-picker-single-keyboard-navigation");

    await expectAttribute(selectedPicker, "data-ready", "");
    await expectAttribute(invalidPicker, "role", "group");
    await expectAttribute(invalidPicker, "aria-invalid", "true");
    await expectAttribute(
      invalidPicker,
      "aria-describedby",
      "date-picker-single-with-error-description date-picker-single-with-error-error"
    );
    await expect(invalidPicker.locator('[role="grid"]')).toHaveAttribute(
      "aria-labelledby",
      "date-picker-single-with-error-month"
    );
    await expect(invalidPicker.locator("#date-picker-single-with-error-error")).toHaveAttribute(
      "role",
      "alert"
    );

    const selectedValue = await selectedPicker.locator('input[name="departure"]').inputValue();
    await expect(selectedPicker.locator(`[data-exo="date-picker-day"][aria-selected="true"]`)).toHaveCount(1);
    expect(selectedValue).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    await expectAttribute(keyboardPicker, "data-ready", "");

    const day15 = keyboardPicker.locator('[data-exo="date-picker-day"][phx-value-date="2026-03-15"]');
    const day16 = keyboardPicker.locator('[data-exo="date-picker-day"][phx-value-date="2026-03-16"]');
    const day22 = keyboardPicker.locator('[data-exo="date-picker-day"][phx-value-date="2026-03-22"]');
    const day23 = keyboardPicker.locator('[data-exo="date-picker-day"][phx-value-date="2026-03-23"]');

    await day15.focus();
    await expectFocused(day15);

    await page.keyboard.press("ArrowRight");
    await expectFocused(day16);
    await expect(day16).toHaveAttribute("tabindex", "0");
    await expect(day15).toHaveAttribute("tabindex", "-1");

    await page.keyboard.press("End");
    await expectFocused(day22);

    await page.keyboard.press("Home");
    await expectFocused(day16);

    await page.keyboard.press("ArrowDown");
    await expectFocused(day23);

    await page.keyboard.press("ArrowUp");
    await expectFocused(day16);
  });

  test("table renders caption, aligned cells, row labels, and empty state", async ({ page }) => {
    await gotoStory(page, "/components/data_display/table");

    const canvas = story(page);
    const table = canvas.getByRole("table", { name: "Team members and access levels" });
    const emptyTable = canvas.getByRole("table", { name: "Archived members" });

    await expect(canvas.locator('[data-exo="table-caption"]').first()).toHaveText("Team members and access levels");
    await expect(canvas.locator('[data-exo="table-head-cell"][data-align="center"]').first()).toHaveText("Status");
    await expect(table.locator('[data-exo="table-row"][aria-label="Open Alice Smith"]')).toHaveCount(1);
    await expect(emptyTable.locator('[data-exo="table-empty"]')).toContainText("No archived members.");
  });

  test("list renders description-list semantics", async ({ page }) => {
    await gotoStory(page, "/components/data_display/list");

    const canvas = story(page);
    const list = canvas.locator('dl[data-exo="list"]');

    await expect(list).toHaveCount(1);
    await expect(list.locator('dt[data-exo="list-title"]').first()).toHaveText("Full name");
    await expect(list.locator('dd[data-exo="list-content"]').first()).toHaveText("Alice Smith");
  });

  test("flash and toast notifications expose live-region roles and close controls", async ({ page }) => {
    await gotoStory(page, "/components/feedback/flash");

    const canvas = story(page);
    const success = canvas.locator('[data-exo="flash"][data-kind="success"]');
    const warning = canvas.locator('[data-exo="flash"][data-kind="warning"]');
    const error = canvas.locator('[data-exo="flash"][data-kind="error"]');

    await expectAttribute(success, "role", "status");
    await expectAttribute(warning, "role", "alert");
    await expectAttribute(error, "aria-live", "assertive");
    await expect(error.locator('[data-exo="flash-close"]')).toHaveAttribute("type", "button");

    await gotoStory(page, "/components/feedback/toast_container");

    const toastCanvas = story(page);
    const container = toastCanvas.locator('[data-exo="toast-container"][data-placement="bottom-right"]');
    const errorToast = toastCanvas.locator("#toast-3");

    await expectAttribute(container, "data-placement", "bottom-right");
    await expectAttribute(errorToast, "role", "alert");
    await expectAttribute(errorToast, "aria-live", "assertive");
    await expect(errorToast.locator('[data-exo="toast-close"]')).toHaveAttribute("type", "button");
  });
});
