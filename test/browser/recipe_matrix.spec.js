const { test, expect } = require("@playwright/test");

const {
  expectAttribute,
  expectFocused,
  expectPopoverState,
  gotoStory,
  story
} = require("./helpers/storybook");

test.describe("component recipe matrix", () => {
  test("combines common state recipes with command, drawer, and guarded confirm flow", async ({
    page
  }) => {
    await gotoStory(page, "/components/recipes/component_recipe_matrix");

    const canvas = story(page);
    const root = canvas.locator("#component-recipe-matrix");
    const owner = root.locator("#recipe-owner");
    const selectTrigger = root.locator("#recipe-priority-select [data-exo-select=\"trigger\"]");
    const command = root.locator("#recipe-command");
    const commandInput = command.locator('[data-exo="command-palette-input"]');
    const drawer = root.locator("#recipe-drawer");
    const confirm = root.locator("#recipe-confirm");

    await expect(root.getByRole("button", { name: "Disabled destructive" })).toBeDisabled();
    await expect(owner).toHaveAttribute("aria-invalid", "true");
    await expect(root.locator("#recipe-owner-error")).toHaveAttribute("role", "alert");
    await expect(selectTrigger).toHaveAttribute("aria-controls", "recipe-priority-listbox");
    await expect(root.locator("#recipe-state-table [data-exo=\"table-row\"]")).toHaveCount(2);
    await expect(root.locator("#recipe-empty-table [data-exo=\"table-empty\"]")).toContainText(
      "No archived recipe records"
    );

    await root.getByRole("button", { name: "Actions for Alpha" }).click();
    await expectPopoverState(root.locator("#recipe-row-actions-alpha"), true);
    await page.keyboard.press("Escape");
    await expectPopoverState(root.locator("#recipe-row-actions-alpha"), false);

    await root.getByRole("button", { name: "Open command palette" }).click();
    await expectAttribute(command, "data-state", "open");
    await expectFocused(commandInput);

    await commandInput.fill("drawer");
    await expect(command.locator('[data-exo="command-palette-item"][data-value="drawer"]')).toHaveAttribute(
      "data-active",
      "true"
    );
    await commandInput.press("Enter");

    await expectAttribute(command, "data-state", "closed");
    await expectAttribute(drawer, "data-state", "open");
    await expect(drawer.locator("#recipe-drawer-owner")).toHaveAttribute("aria-invalid", "true");

    await drawer.getByRole("button", { name: "Open confirm modal" }).click();
    await expectAttribute(confirm, "data-state", "open");
    await confirm.getByRole("button", { name: "Validate recipe" }).click();
    await expectAttribute(confirm, "data-state", "open");
  });
});
