const { test, expect } = require("@playwright/test");

const {
  chooseSelect,
  expectAttribute,
  gotoStory,
  story
} = require("./helpers/storybook");

test.describe("bulk action workflow", () => {
  test("filters rows, selects a bulk target, and keeps guarded archive validation open", async ({
    page
  }) => {
    await gotoStory(page, "/components/recipes/bulk_action_workflow");

    const canvas = story(page);
    const root = canvas.locator('[data-exo="bulk-action-workflow"]');
    const state = canvas.locator("#bulk-action-state");
    const confirm = canvas.locator("#bulk-archive-confirm");
    const tableRows = root.locator("#bulk-action-table [data-exo=\"table-row\"]");

    await expect(tableRows).toHaveCount(4);
    await expect(state).toHaveAttribute("data-bulk-state", "ready");
    await expect(state).toHaveAttribute("data-selected-count", "0");

    await root.getByLabel("Search queue").fill("north");
    await expect(state).toHaveAttribute("data-query", "north");
    await chooseSelect(root, "bulk-filter-status", "blocked");
    await expect(state).toHaveAttribute("data-status", "blocked");
    await expect(tableRows).toHaveCount(1);
    await expect(root.locator("#bulk-record-northstar")).toContainText("Unassigned");

    await root.getByRole("button", { name: "Select filtered" }).click();
    await expect(state).toHaveAttribute("data-selected-count", "1");
    await expect(state).toHaveAttribute("data-bulk-state", "selected");
    await expect(root.getByRole("checkbox", { name: "Select Northstar" })).toBeChecked();

    await root.getByRole("button", { name: "Queue bulk archive" }).click();
    await expectAttribute(confirm, "data-state", "open");
    await expect(state).toHaveAttribute("data-bulk-state", "saving");

    await confirm.getByRole("button", { name: "Validate bulk archive" }).click();
    await expectAttribute(confirm, "data-state", "open");
    await expect(state).toHaveAttribute("data-bulk-state", "blocked");
    await expect(canvas.locator("#bulk-action-error")).toContainText("Cannot archive Northstar");
  });
});
