const { test, expect } = require("@playwright/test");

const {
  expectAttribute,
  expectFocused,
  gotoStory,
  story
} = require("./helpers/storybook");

test.describe("date picker recipes", () => {
  test("covers controlled month state, selection, form value, validation, disabled state, and keyboard movement", async ({
    page
  }) => {
    await gotoStory(page, "/components/recipes/date_picker_recipes");

    const canvas = story(page);
    const root = canvas.locator('[data-exo="date-picker-recipes-workflow"]');
    const state = canvas.locator("#date-picker-recipes-state");
    const picker = root.locator("#date-recipe-booking-date");
    const locked = root.locator("#date-recipe-locked-date");
    const hiddenInput = picker.locator('input[name="booking[date]"]');
    const previous = picker.getByRole("button", { name: "Previous month" });
    const next = picker.getByRole("button", { name: "Next month" });

    await expectAttribute(root, "data-validation-state", "ready");
    await expectAttribute(root, "data-current-month", "2026-03-01");
    await expectAttribute(root, "data-selected-date", "2026-03-15");
    await expectAttribute(picker, "data-ready", "");
    await expect(picker.locator('[role="grid"]')).toHaveAttribute(
      "aria-labelledby",
      "date-recipe-booking-date-month"
    );
    await expect(picker).toHaveAttribute(
      "aria-describedby",
      "date-recipe-booking-date-description"
    );
    await expect(hiddenInput).toHaveValue("2026-03-15");
    await expect(previous).toBeDisabled();
    await expect(next).not.toBeDisabled();

    const day15 = picker.locator('[data-exo="date-picker-day"][phx-value-date="2026-03-15"]');
    const day16 = picker.locator('[data-exo="date-picker-day"][phx-value-date="2026-03-16"]');
    const day22 = picker.locator('[data-exo="date-picker-day"][phx-value-date="2026-03-22"]');

    await expect(day15).toHaveAttribute("aria-selected", "true");
    await expect(day15).toHaveAttribute("data-available", "");

    await day15.focus();
    await expectFocused(day15);
    await page.keyboard.press("ArrowRight");
    await expectFocused(day16);
    await expect(day16).toHaveAttribute("tabindex", "0");
    await expect(day15).toHaveAttribute("tabindex", "-1");
    await page.keyboard.press("End");
    await expectFocused(day22);

    await next.click();
    await expect(picker.locator('[data-exo="date-picker-month"]')).toHaveText("April 2026");
    await expectAttribute(root, "data-current-month", "2026-04-01");
    await expectAttribute(root, "data-month-change-count", "1");
    await expect(previous).not.toBeDisabled();

    const april12 = picker.locator(
      '[data-exo="date-picker-day"][phx-value-date="2026-04-12"]'
    );
    await expect(april12).toHaveAttribute("data-available", "");
    await april12.click();
    await expectAttribute(root, "data-selected-date", "2026-04-12");
    await expect(hiddenInput).toHaveValue("2026-04-12");
    await expect(state).toHaveAttribute("data-last-action", "selected booking date 2026-04-12");

    await root.getByRole("button", { name: "Save booking date" }).click();
    await expectAttribute(root, "data-validation-state", "submitted");
    await expectAttribute(root, "data-submitted-count", "1");

    await root.getByRole("button", { name: "Clear booking date" }).click();
    await expectAttribute(root, "data-validation-state", "blocked");
    await expectAttribute(root, "data-selected-date", "none");
    await expect(hiddenInput).toHaveValue("");
    await expect(picker).toHaveAttribute("aria-invalid", "true");
    await expect(picker).toHaveAttribute(
      "aria-describedby",
      "date-recipe-booking-date-description date-recipe-booking-date-error"
    );
    await expect(picker.locator("#date-recipe-booking-date-error")).toHaveText(
      "Choose a booking date before saving."
    );

    await root.getByRole("button", { name: "Save booking date" }).click();
    await expectAttribute(root, "data-blocked-count", "1");
    await expect(state).toHaveAttribute("data-last-action", "blocked date save");

    await expectAttribute(locked, "data-ready", "");
    await expect(locked.getByRole("button", { name: "Previous month" })).toBeDisabled();
    await expect(locked.getByRole("button", { name: "Next month" })).toBeDisabled();
    await expect(
      locked.locator('[data-exo="date-picker-day"][phx-value-date="2026-04-10"]')
    ).toBeDisabled();
    await expect(locked.locator('input[name="booking[locked_date]"]')).toBeDisabled();

    await root.getByRole("button", { name: "Reset dates" }).click();
    await expectAttribute(root, "data-validation-state", "ready");
    await expectAttribute(root, "data-current-month", "2026-03-01");
    await expectAttribute(root, "data-selected-date", "2026-03-15");
  });
});
