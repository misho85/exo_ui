const { test, expect } = require("@playwright/test");

const {
  expectAttribute,
  gotoStory,
  story
} = require("./helpers/storybook");

test.describe("table recipes", () => {
  test("covers row labels, row actions, filters, aligned cells, and empty state", async ({
    page
  }) => {
    await gotoStory(page, "/components/recipes/table_recipes");

    const canvas = story(page);
    const root = canvas.locator('[data-exo="table-recipes-workflow"]');
    const state = canvas.locator("#table-recipes-state");
    const table = root.getByRole("table", { name: "Table recipe account review queue" });
    const northstar = root.locator("#table-recipe-northstar");
    const helio = root.locator("#table-recipe-helio");

    await expectAttribute(root, "data-filter", "all");
    await expectAttribute(root, "data-visible-count", "4");
    await expect(table.locator('[data-exo="table-caption"]')).toHaveText(
      "Table recipe account review queue"
    );
    await expect(table.locator('[data-exo="table-head-cell"][data-align="right"]').first()).toHaveText(
      "ARR"
    );
    await expect(northstar).toHaveAttribute("aria-label", "Open Northstar CRM");
    await expect(northstar).toHaveAttribute("tabindex", "0");
    await expect(northstar).not.toHaveAttribute("phx-keydown", /.+/);
    await expect(northstar.locator('[data-exo="table-cell"][data-align="right"]')).toContainText(
      "$128k"
    );

    await northstar.focus();
    await page.keyboard.press("Enter");
    await expectAttribute(root, "data-selected-row", "northstar");
    await expect(state).toHaveAttribute("data-last-action", "opened Northstar CRM");

    await root.getByRole("button", { name: "Review Northstar CRM" }).click();
    await expectAttribute(root, "data-reviewed-count", "1");
    await expect(northstar).toContainText("Reviewed");

    await root.getByRole("button", { name: "Blocked rows" }).click();
    await expectAttribute(root, "data-filter", "blocked");
    await expectAttribute(root, "data-visible-count", "2");
    await expect(helio).toBeVisible();
    await expect(root.locator("#table-recipe-arc")).toHaveCount(0);

    await root.getByRole("button", { name: "Escalate Helio Labs" }).click();
    await expectAttribute(root, "data-selected-row", "helio");
    await expectAttribute(root, "data-escalated-count", "1");
    await expect(helio).toContainText("Escalated");

    await root.getByRole("button", { name: "Empty state" }).click();
    await expectAttribute(root, "data-filter", "empty");
    await expectAttribute(root, "data-visible-count", "0");
    await expect(root.locator('[data-exo="table-empty"]')).toContainText("No matching accounts");

    await root.getByRole("button", { name: "Reset table" }).click();
    await expectAttribute(root, "data-filter", "all");
    await expectAttribute(root, "data-reviewed-count", "0");
    await expectAttribute(root, "data-escalated-count", "0");
    await expectAttribute(root, "data-visible-count", "4");
  });
});
