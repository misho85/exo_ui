const { test, expect } = require("@playwright/test");

const { focusedMenuItem } = require("./helpers/focus");
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
    const selectId = "select-single-with-value";
    const trigger = canvas.locator(`#${selectId}-select [data-exo-select="trigger"]`);
    const selectedOption = canvas.locator(`#${selectId} [data-exo="select-option"][data-selected]`);
    const nextOption = canvas.locator(`#${selectId} [data-exo="select-option"][data-value="inactive"]`);
    const value = canvas.locator("select[name=\"status\"]");
    const popover = canvas.locator(`#${selectId}`);
    const listbox = canvas.locator(`#${selectId}-listbox`);

    await expect(trigger).toHaveAccessibleName("Status Active");
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
    await expect(trigger).toHaveAccessibleName("Status Inactive");
  });

  test("the option the keyboard reaches has a ring that stands 3:1 off the list, in light and dark", async ({
    page
  }) => {
    await gotoStory(page, "/components/forms/select");

    const canvas = story(page);
    const selectId = "select-single-with-value";
    const trigger = canvas.locator(`#${selectId}-select [data-exo-select="trigger"]`);
    const popover = canvas.locator(`#${selectId}`);
    const options = popover.locator('[data-exo="select-option"]');
    const list = '[data-exo="popover-content"]';

    // A pointer opens the list on the chosen option with focus on it, but not
    // :focus-visible, so it sees only the fill.
    await trigger.click();
    await expectPopoverState(popover, true);
    await expectFocused(popover.locator('[data-exo="select-option"][data-selected]'));
    const pointer = await focusedMenuItem(page, { menu: list, theme: "light" });
    expect(pointer.focusVisible).toBe(false);
    expect(pointer.outlineStyle).toBe("none");
    await page.keyboard.press("Escape");
    await expectPopoverState(popover, false);

    await trigger.focus();
    await page.keyboard.press("Enter");
    await expectPopoverState(popover, true);
    await expectFocused(popover.locator('[data-exo="select-option"][data-selected]'));

    // Until TRG-496 the only sign of focus was the hover fill: --exo-secondary
    // on the list's --exo-card, 1.12:1 in trg24's light theme and 1.08:1 in its
    // dark one, with `outline: none`.
    const results = [];

    for (const theme of ["light", "dark"]) {
      await page.keyboard.press("Home");

      for (let index = 0; index < (await options.count()); index++) {
        if (index > 0) await page.keyboard.press("ArrowDown");
        await expectFocused(options.nth(index));
        results.push({ theme, ...(await focusedMenuItem(page, { menu: list, theme })) });
      }
    }

    // The mouse resting on the focused option keeps its ring.
    await options.last().hover();
    results.push({ theme: "dark", hovered: true, ...(await focusedMenuItem(page, { menu: list, theme: "dark" })) });

    expect(results.map(({ theme, name, hovered }) => `${theme}: ${name}${hovered ? " (hover)" : ""}`)).toEqual([
      "light: Active",
      "light: Inactive",
      "light: Archived",
      "dark: Active",
      "dark: Inactive",
      "dark: Archived",
      "dark: Archived (hover)"
    ]);
    // The theme reached the list: two different card colours were measured.
    expect(new Set(results.map(({ card }) => card)).size).toBe(2);

    for (const result of results) {
      const label = `${result.theme}, ${result.name}${result.hovered ? " (hover)" : ""}`;
      expect(result.focusVisible, label).toBe(true);
      expect(result.outlineStyle, label).toBe("solid");
      expect(result.outlineWidth, label).toBeGreaterThanOrEqual(2);
      // Inside the option: the list's padding and the gap between options are
      // narrower than a ring drawn outside it.
      expect(result.outlineOffset, label).toBeLessThanOrEqual(-result.outlineWidth);
      expect(result.ringOnMenu, `${label}: ring on the list`).toBeGreaterThanOrEqual(3);
      expect(result.ringOnIdle, `${label}: ring against an option without focus`).toBeGreaterThanOrEqual(3);
      expect(result.ringOnFill, `${label}: ring on the option's own fill`).toBeGreaterThanOrEqual(3);
    }
  });

  test("ignores disabled options instead of committing them", async ({ page }) => {
    await gotoStory(page, "/components/forms/select");

    const canvas = story(page);
    const selectId = "select-single-basic";
    const trigger = canvas.locator(`#${selectId}-select [data-exo-select="trigger"]`);
    const popover = canvas.locator(`#${selectId}`);
    const disabledOption = canvas.locator(`#${selectId} [data-exo="select-option"][data-value="date"]`);
    const value = canvas.locator("select[name=\"fruit\"]");

    await trigger.click();

    await expectPopoverState(popover, true);
    await disabledOption.evaluate((node) => {
      node.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    await expect(value).toHaveValue("");
    await expectPopoverState(popover, true);
    await expect(trigger.locator("[data-exo=\"select-value\"]")).toHaveText("Select a fruit");
  });

  test("keeps disabled custom select out of form submission", async ({ page }) => {
    await gotoStory(page, "/components/forms/select");

    const canvas = story(page);
    const selectId = "select-single-disabled";
    const trigger = canvas.locator(`#${selectId}-select [data-exo-select="trigger"]`);
    const value = canvas.locator("select[name=\"locked\"]");

    await expect(trigger).toBeDisabled();
    await expect(value).toBeDisabled();
  });
});
