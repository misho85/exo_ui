const { test, expect } = require("@playwright/test");

const {
  expectAttribute,
  gotoStory,
  story
} = require("./helpers/storybook");

test.describe("data table workflow", () => {
  test("filters, sorts, paginates, and renders an empty table state", async ({ page }) => {
    await gotoStory(page, "/components/recipes/data_table_workflow");

    const canvas = story(page);
    const root = canvas.locator('[data-exo="data-table-workflow"]');
    const state = canvas.locator("#data-table-state");
    const tableRows = root.locator("#data-table-workflow-table [data-exo=\"table-row\"]");

    await expect(tableRows).toHaveCount(4);
    await expectAttribute(root, "data-total-count", "12");
    await expect(state).toHaveAttribute("data-page", "1");
    await expect(state).toHaveAttribute("data-page-count", "3");
    await expect(root.locator("#data-table-row-northstar")).toContainText("$182k");

    await root.getByLabel("Segment").selectOption("emea");
    await root.getByLabel("Sort").selectOption("risk_desc");
    await root.getByLabel("Rows per page").selectOption("2");
    await expectAttribute(root, "data-segment", "emea");
    await expectAttribute(root, "data-sort", "risk_desc");
    await expectAttribute(root, "data-page-size", "2");
    await expectAttribute(root, "data-total-count", "5");
    await expectAttribute(root, "data-page-count", "3");
    await expect(tableRows).toHaveCount(2);
    await expect(root.locator("#data-table-row-northstar")).toContainText("92");

    await root.getByRole("button", { name: "Next page" }).click();
    await expectAttribute(root, "data-page", "2");
    await expect(root.locator("#data-table-row-vega")).toContainText("Vega Health");
    await expect(root.locator("#data-table-row-quartz")).toContainText("Quartz Media");

    await root.getByLabel("Search table").fill("zzzz");
    await expectAttribute(root, "data-total-count", "0");
    await expectAttribute(root, "data-page", "1");
    await expect(root.locator('[data-exo="table-empty"]')).toContainText(
      "No accounts match the current table controls."
    );

    await root.getByLabel("Search table").fill("helio");
    await expectAttribute(root, "data-total-count", "1");
    await expect(tableRows).toHaveCount(1);
    await expect(root.locator("#data-table-row-helio")).toContainText("Helio Bank");
  });
});
