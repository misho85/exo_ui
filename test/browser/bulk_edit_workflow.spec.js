const { test, expect } = require("@playwright/test");

const {
  expectAttribute,
  gotoStory,
  story
} = require("./helpers/storybook");

test.describe("bulk edit workflow", () => {
  test("selects filtered rows, applies a successful bulk edit, and clears filters", async ({
    page
  }) => {
    await gotoStory(page, "/components/recipes/bulk_edit_workflow");

    const canvas = story(page);
    const root = canvas.locator('[data-exo="bulk-edit-workflow"]');
    const state = canvas.locator("#bulk-edit-state");
    const tableRows = root.locator("#bulk-edit-table [data-exo=\"table-row\"]");

    await expect(tableRows).toHaveCount(6);
    await expectAttribute(root, "data-edit-state", "ready");
    await expect(state).toHaveAttribute("data-selected-count", "0");

    await root.getByLabel("Status filter").selectOption("needs_review");
    await expectAttribute(root, "data-status", "needs_review");
    await expectAttribute(root, "data-filtered-count", "3");
    await expect(tableRows).toHaveCount(3);

    await root.getByRole("button", { name: "Select filtered" }).click();
    await expectAttribute(root, "data-selected-count", "3");
    await expectAttribute(root, "data-edit-state", "selected");
    await expect(root.getByRole("checkbox", { name: "Select Atlas Labs" })).toBeChecked();

    await root.getByLabel("New owner").selectOption("Mina");
    await root.getByLabel("New status").selectOption("ready");
    await expectAttribute(root, "data-edit-owner", "Mina");
    await expectAttribute(root, "data-edit-status", "ready");

    await root.getByRole("button", { name: "Apply bulk edit" }).click();
    await expectAttribute(root, "data-edit-state", "applied");
    await expect(state).toHaveAttribute("data-updated-count", "3");
    await expect(state).toHaveAttribute("data-selected-count", "0");
    await expect(state).toHaveAttribute("data-filtered-count", "0");
    await expect(root.locator('[data-exo="table-empty"]')).toContainText(
      "No accounts remain in the active bulk edit filter."
    );

    await root.getByRole("button", { name: "Clear filters" }).click();
    await expectAttribute(root, "data-filtered-count", "6");
    await expect(tableRows).toHaveCount(6);
    await expect(root.locator("#bulk-edit-record-atlas")).toContainText("Mina");
    await expect(root.locator("#bulk-edit-record-atlas")).toContainText("Ready");
    await expect(root.locator("#bulk-edit-record-lumen")).toContainText("Mina");
    await expect(root.locator("#bulk-edit-record-lumen")).toContainText("Ready");
  });
});
