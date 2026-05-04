const { test, expect } = require("@playwright/test");

const {
  expectFocused,
  expectPopoverState,
  gotoStory,
  story
} = require("./helpers/storybook");

test.describe("select", () => {
  test("supports keyboard selection from the focused selected option", async ({ page }) => {
    await gotoStory(page, "/components/forms/select");

    const canvas = story(page);
    const trigger = canvas.locator("#sel-value-select [data-exo-select=\"trigger\"]");
    const selectedOption = canvas.locator("#sel-value [data-exo=\"select-option\"][data-selected]");
    const nextOption = canvas.locator("#sel-value [data-exo=\"select-option\"][data-value=\"inactive\"]");
    const value = canvas.locator("input[name=\"status\"]");
    const popover = canvas.locator("#sel-value");
    const listbox = canvas.locator("#sel-value-listbox");

    await trigger.click();

    await expectPopoverState(popover, true);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await selectedOption.focus();
    await expectFocused(selectedOption);
    await expect(trigger).toHaveAttribute("aria-activedescendant", await selectedOption.getAttribute("id"));
    await expect(listbox).toHaveAttribute("aria-activedescendant", await selectedOption.getAttribute("id"));

    await selectedOption.press("ArrowDown");
    await expectFocused(nextOption);
    await expect(trigger).toHaveAttribute("aria-activedescendant", await nextOption.getAttribute("id"));
    await expect(listbox).toHaveAttribute("aria-activedescendant", await nextOption.getAttribute("id"));

    await nextOption.press("Enter");

    await expectPopoverState(popover, false);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(value).toHaveValue("inactive");
    await expect(trigger.locator("[data-exo=\"select-value\"]")).toHaveText("Inactive");
  });

  test("ignores disabled options instead of committing them", async ({ page }) => {
    await gotoStory(page, "/components/forms/select");

    const canvas = story(page);
    const trigger = canvas.locator("#sel-basic-select [data-exo-select=\"trigger\"]");
    const popover = canvas.locator("#sel-basic");
    const disabledOption = canvas.locator("#sel-basic [data-exo=\"select-option\"][data-value=\"date\"]");
    const value = canvas.locator("input[name=\"fruit\"]");

    await trigger.click();

    await expectPopoverState(popover, true);
    await disabledOption.evaluate((node) => {
      node.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    await expect(value).toHaveValue("");
    await expectPopoverState(popover, true);
    await expect(trigger.locator("[data-exo=\"select-value\"]")).toHaveText("Select a fruit");
  });
});
