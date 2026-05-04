const { test, expect } = require("@playwright/test");

const { expectAttribute, gotoStory, story } = require("./helpers/storybook");

test.describe("data and feedback components", () => {
  test("date picker exposes calendar semantics, form value, and error links", async ({ page }) => {
    await gotoStory(page, "/components/forms/date_picker");

    const canvas = story(page);
    const invalidPicker = canvas.locator("#dp-error");
    const selectedPicker = canvas.locator("#dp-selected");

    await expectAttribute(invalidPicker, "role", "group");
    await expectAttribute(invalidPicker, "aria-invalid", "true");
    await expectAttribute(invalidPicker, "aria-describedby", "dp-error-description dp-error-error");
    await expect(invalidPicker.locator('[role="grid"]')).toHaveAttribute("aria-labelledby", "dp-error-month");
    await expect(invalidPicker.locator("#dp-error-error")).toHaveAttribute("role", "alert");

    const selectedValue = await selectedPicker.locator('input[name="departure"]').inputValue();
    await expect(selectedPicker.locator(`[data-exo="date-picker-day"][aria-selected="true"]`)).toHaveCount(1);
    expect(selectedValue).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test("table renders caption, aligned cells, row labels, and empty state", async ({ page }) => {
    await gotoStory(page, "/components/data_display/table");

    const canvas = story(page);
    const tableBody = canvas.locator("#users-table");
    const emptyTable = canvas.locator("#empty-users-table");

    await expect(canvas.locator('[data-exo="table-caption"]').first()).toHaveText("Team members and access levels");
    await expect(canvas.locator('[data-exo="table-head-cell"][data-align="center"]').first()).toHaveText("Status");
    await expect(tableBody.locator('[data-exo="table-row"][aria-label="Open Alice Smith"]')).toHaveCount(1);
    await expect(emptyTable.locator('[data-exo="table-empty"]')).toContainText("No archived members.");
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
    const container = toastCanvas.locator("#toast-container");
    const errorToast = toastCanvas.locator("#toast-3");

    await expectAttribute(container, "data-placement", "bottom-right");
    await expectAttribute(errorToast, "role", "alert");
    await expectAttribute(errorToast, "aria-live", "assertive");
    await expect(errorToast.locator('[data-exo="toast-close"]')).toHaveAttribute("type", "button");
  });
});
