const { test, expect } = require("@playwright/test");

const {
  expectAttribute,
  gotoStory,
  story
} = require("./helpers/storybook");

test.describe("saved filters workflow", () => {
  test("saves, clears, and reapplies a table filter from server state", async ({ page }) => {
    await gotoStory(page, "/components/recipes/saved_filters_workflow");

    const canvas = story(page);
    const root = canvas.locator('[data-exo="saved-filters-workflow"]');
    const state = canvas.locator("#saved-filters-state");
    const tableRows = root.locator("#saved-filters-table [data-exo=\"table-row\"]");

    await expect(tableRows).toHaveCount(5);
    await expectAttribute(root, "data-filtered-count", "5");
    await expect(state).toHaveAttribute("data-saved-filter-count", "2");
    await expect(state).toHaveAttribute("data-active-filter", "");

    await root.getByLabel("Search accounts").fill("north");
    await root.getByLabel("Status").selectOption("blocked");
    await root.getByLabel("Owner").selectOption("unassigned");
    await expectAttribute(root, "data-query", "north");
    await expectAttribute(root, "data-status", "blocked");
    await expectAttribute(root, "data-owner", "unassigned");
    await expect(tableRows).toHaveCount(1);
    await expect(root.locator("#saved-filter-record-northstar")).toContainText("Unassigned");

    await root.getByRole("button", { name: "Save current filter" }).click();
    await expectAttribute(root, "data-active-filter", "custom-filter");
    await expect(state).toHaveAttribute("data-saved-filter-count", "3");
    await expect(state).toHaveAttribute("data-last-action", "saved current view");

    await root.getByRole("button", { name: "Clear filters" }).click();
    await expectAttribute(root, "data-filtered-count", "5");
    await expect(state).toHaveAttribute("data-active-filter", "");
    await expect(state).toHaveAttribute("data-last-action", "cleared filters");

    await root.getByRole("button", { name: "Saved: north" }).click();
    await expectAttribute(root, "data-active-filter", "custom-filter");
    await expectAttribute(root, "data-filtered-count", "1");
    await expect(state).toHaveAttribute("data-query", "north");
    await expect(state).toHaveAttribute("data-status", "blocked");
    await expect(state).toHaveAttribute("data-owner", "unassigned");
    await expect(state).toHaveAttribute("data-last-action", "applied Saved: north");
  });
});
