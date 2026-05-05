const { test, expect } = require("@playwright/test");

const {
  expectAttribute,
  gotoStory,
  story
} = require("./helpers/storybook");

test.describe("button recipes", () => {
  test("covers variants, loading submit state, disabled links, and destructive confirm", async ({
    page
  }) => {
    await gotoStory(page, "/components/recipes/button_recipes");

    const canvas = story(page);
    const root = canvas.locator('[data-exo="button-recipes-workflow"]');
    const state = canvas.locator("#button-recipes-state");
    const save = root.locator("#button-recipe-save");
    const finish = root.locator("#button-recipe-finish-save");
    const disabledLink = root.getByRole("link", { name: "Billing unavailable" });
    const confirm = canvas.locator("#button-delete-confirm");

    await expectAttribute(root, "data-selected-variant", "primary");
    await expect(save).toHaveAttribute("type", "button");
    await expect(disabledLink).toHaveAttribute("role", "link");
    await expect(disabledLink).toHaveAttribute("aria-disabled", "true");
    await expect(disabledLink).toHaveAttribute("tabindex", "-1");
    await expect(disabledLink).not.toHaveAttribute("href", /.+/);

    await root.getByRole("button", { name: "Use Danger" }).click();
    await expectAttribute(root, "data-selected-variant", "danger");
    await expect(save).toHaveAttribute("data-variant", "danger");

    await save.click();
    await expectAttribute(root, "data-saving", "true");
    await expect(save).toBeDisabled();
    await expect(save.locator('[data-exo="spinner"]')).toBeVisible();
    await expect(save).toHaveAttribute("aria-busy", "true");

    await finish.click();
    await expectAttribute(root, "data-saving", "false");
    await expectAttribute(root, "data-saved-count", "1");
    await expect(save).not.toBeDisabled();

    await root.getByRole("button", { name: "Delete draft" }).click();
    await expectAttribute(confirm, "data-state", "open");
    await confirm.getByRole("button", { name: "Confirm delete" }).click();
    await expectAttribute(confirm, "data-state", "closed");
    await expectAttribute(root, "data-destructive-count", "1");
    await expect(state).toHaveAttribute("data-last-action", "confirmed destructive action");

    await root.getByRole("button", { name: "Reset buttons" }).click();
    await expectAttribute(root, "data-selected-variant", "primary");
    await expectAttribute(root, "data-saved-count", "0");
    await expectAttribute(root, "data-destructive-count", "0");
  });
});
