const { test, expect } = require("@playwright/test");

const {
  expectAttribute,
  expectFocused,
  expectHiddenState,
  expectPopoverState,
  gotoStory,
  story
} = require("./helpers/storybook");

test.describe("combobox", () => {
  test("filters client-side options and commits the selected value", async ({ page }) => {
    await gotoStory(page, "/components/forms/combobox");

    const canvas = story(page);
    const trigger = canvas.locator("#cb-client-combobox [data-exo-combobox=\"trigger\"]");
    const popover = canvas.locator("#cb-client");
    const search = canvas.locator("#cb-client [data-exo=\"combobox-search\"]");
    const croatia = canvas.locator("#cb-client [data-exo=\"combobox-option\"][data-value=\"hr\"]");
    const serbia = canvas.locator("#cb-client [data-exo=\"combobox-option\"][data-value=\"rs\"]");
    const value = canvas.locator("input[name=\"country\"]");

    await expectAttribute(search, "aria-expanded", "false");
    await trigger.click();

    await expectPopoverState(popover, true);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    await search.fill("cro");
    await expect(croatia).toBeVisible();
    await expectHiddenState(serbia, true);

    await croatia.click();

    await expectPopoverState(popover, false);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(value).toHaveValue("hr");
    await expect(trigger.locator("[data-exo=\"combobox-value\"]")).toHaveText("Croatia");
  });

  test("shows the empty state when client filtering removes every option", async ({ page }) => {
    await gotoStory(page, "/components/forms/combobox");

    const canvas = story(page);
    const trigger = canvas.locator("#cb-empty-combobox [data-exo-combobox=\"trigger\"]");
    const popover = canvas.locator("#cb-empty");
    const search = canvas.locator("#cb-empty [data-exo=\"combobox-search\"]");
    const empty = canvas.locator("#cb-empty [data-exo=\"combobox-empty\"]");

    await expectAttribute(search, "aria-expanded", "false");
    await trigger.click();

    await expectPopoverState(popover, true);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expectFocused(search);
    await search.fill("zzz");

    await expect(empty).toBeVisible();
    await expect(search).toHaveValue("zzz");
  });
});
