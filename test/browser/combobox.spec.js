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

  test("documents grouped, creatable, loading, clearable, and disabled states", async ({ page }) => {
    await gotoStory(page, "/components/forms/combobox");

    const canvas = story(page);
    const grouped = canvas.locator("#cb-grouped-combobox");
    const clear = grouped.locator("[data-exo=\"combobox-clear\"]");
    const groupedValue = canvas.locator("input[name=\"assignee\"]");
    const selected = canvas.locator("#cb-grouped [data-exo=\"combobox-option\"][data-value=\"maria\"]");
    const disabledOption = canvas.locator("#cb-grouped [data-exo=\"combobox-option\"][data-value=\"stefan\"]");

    await expect(selected).toHaveAttribute("aria-selected", "true");
    await expect(disabledOption).toHaveAttribute("data-disabled", "");
    await clear.click();
    await expect(groupedValue).toHaveValue("");

    const creatableTrigger = canvas.locator("#cb-creatable-combobox [data-exo-combobox=\"trigger\"]");
    const creatablePopover = canvas.locator("#cb-creatable");
    const creatableSearch = canvas.locator("#cb-creatable [data-exo=\"combobox-search\"]");
    const createRow = canvas.locator("#cb-creatable [data-exo=\"combobox-create\"]");

    await creatableTrigger.click();
    await expectPopoverState(creatablePopover, true);
    await creatableSearch.fill("urgent");
    await expect(createRow).toBeVisible();
    await expect(createRow).toContainText("urgent");

    await page.keyboard.press("Escape");

    const loadingTrigger = canvas.locator("#cb-loading-combobox [data-exo-combobox=\"trigger\"]");
    const loadingPopover = canvas.locator("#cb-loading");
    await loadingTrigger.click();
    await expectPopoverState(loadingPopover, true);
    await expect(canvas.locator("#cb-loading [data-exo=\"combobox-loading\"]")).toBeVisible();

    const disabledTrigger = canvas.locator("#cb-disabled-combobox [data-exo-combobox=\"trigger\"]");
    await expect(disabledTrigger).toBeDisabled();
    await expect(canvas.locator("input[name=\"locked_owner\"]")).toHaveValue("ops");
  });
});
