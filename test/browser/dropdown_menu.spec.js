const { test, expect } = require("@playwright/test");

const {
  expectFocused,
  expectPopoverState,
  gotoStory,
  story
} = require("./helpers/storybook");

test.describe("dropdown menu", () => {
  test("opens with a button trigger without nested button markup", async ({ page }) => {
    await gotoStory(page, "/components/menus/dropdown");

    const canvas = story(page);
    const root = canvas.locator("#dropdown-single-basic-popover");
    const triggerButton = root.locator('[data-exo="popover-trigger"] [data-exo="btn"]');
    const popover = page.locator("#dropdown-single-basic");
    const menu = popover.locator('[data-exo="dropdown-menu"]');

    await expect(root.locator("button button")).toHaveCount(0);
    await expect(root).toHaveAttribute("data-ready", "");

    await triggerButton.click();

    await expectPopoverState(popover, true);
    await expect(menu).toHaveAttribute("aria-label", "Row actions");
    await expect(triggerButton).toHaveAttribute("aria-expanded", "true");

    const edit = popover.getByRole("menuitem", { name: /Edit/ });
    const duplicate = popover.getByRole("menuitem", { name: /Duplicate/ });
    const del = popover.getByRole("menuitem", { name: /Delete/ });

    await expectFocused(edit);
    await page.keyboard.press("ArrowDown");
    await expectFocused(duplicate);
    await page.keyboard.press("End");
    await expectFocused(del);
    await page.keyboard.press("Escape");
    await expectPopoverState(popover, false);
    await expectFocused(triggerButton);
  });

  test("skips disabled link items", async ({ page }) => {
    await gotoStory(page, "/components/menus/dropdown");

    const canvas = story(page);
    const root = canvas.locator("#dropdown-single-link-items-popover");
    const triggerButton = root.locator('[data-exo="popover-trigger"] [data-exo="btn"]');
    const popover = page.locator("#dropdown-single-link-items");
    const menu = popover.locator('[data-exo="dropdown-menu"]');
    const home = popover.getByRole("menuitem", { name: /Home/ });
    const settings = popover.getByRole("menuitem", { name: /Settings/ });
    const billing = popover.getByRole("menuitem", { name: /Billing/ });

    await expect(root).toHaveAttribute("data-ready", "");
    await triggerButton.click();

    await expectPopoverState(popover, true);
    await expect(menu).toHaveAttribute("aria-label", "Navigation actions");
    await expectFocused(home);
    await expect(billing).toHaveAttribute("aria-disabled", "true");
    await page.keyboard.press("End");
    await expectFocused(settings);
  });

  test("reaches menuitemradio and menuitemcheckbox items with the arrow keys", async ({ page }) => {
    await gotoStory(page, "/components/menus/dropdown_menu_choices");

    const canvas = story(page);
    const root = canvas.locator("#dropdown-choices-popover");
    const triggerButton = root.locator('[data-exo="popover-trigger"] [data-exo="btn"]');
    const popover = page.locator("#dropdown-choices");
    const refresh = popover.getByRole("menuitem", { name: "Refresh" });
    const density = popover.getByRole("group", { name: "Density" });
    const compact = density.getByRole("menuitemradio", { name: "Compact" });
    const comfortable = density.getByRole("menuitemradio", { name: "Comfortable", checked: true });
    const spacious = density.getByRole("menuitemradio", { name: "Spacious" });
    const grid = popover.getByRole("menuitemcheckbox", { name: "Show grid", checked: true });
    const reset = popover.getByRole("menuitem", { name: "Reset view" });

    await expect(root).toHaveAttribute("data-ready", "");
    await triggerButton.click();
    await expectPopoverState(popover, true);

    // Every item of the menu leaves the tab order, the checkable ones too.
    for (const item of [refresh, compact, comfortable, spacious, grid, reset]) {
      await expect(item).toHaveAttribute("tabindex", "-1");
    }
    await expect(spacious).toHaveAttribute("aria-disabled", "true");

    await expectFocused(refresh);
    await page.keyboard.press("ArrowDown");
    await expectFocused(compact);
    await page.keyboard.press("ArrowDown");
    await expectFocused(comfortable);
    // The disabled radio is skipped, the checkbox is the next item.
    await page.keyboard.press("ArrowDown");
    await expectFocused(grid);
    await page.keyboard.press("ArrowDown");
    await expectFocused(reset);
    await page.keyboard.press("ArrowUp");
    await expectFocused(grid);
    await page.keyboard.press("Home");
    await expectFocused(refresh);
    await page.keyboard.press("ArrowUp");
    await expectFocused(reset);
    await page.keyboard.press("Escape");
    await expectPopoverState(popover, false);
    await expectFocused(triggerButton);
  });
});
