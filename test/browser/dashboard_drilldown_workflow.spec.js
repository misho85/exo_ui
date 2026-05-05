const { test, expect } = require("@playwright/test");

const {
  expectAttribute,
  gotoStory,
  story
} = require("./helpers/storybook");

test.describe("dashboard drilldown workflow", () => {
  test("filters dashboard metrics, opens account details, and marks a review", async ({
    page
  }) => {
    await gotoStory(page, "/components/recipes/dashboard_drilldown_workflow");

    const canvas = story(page);
    const root = canvas.locator('[data-exo="dashboard-drilldown-workflow"]');
    const state = canvas.locator("#dashboard-drilldown-state");
    const drawer = canvas.locator("#dashboard-drilldown-drawer");
    const detail = drawer.locator("#dashboard-drilldown-detail");
    const rows = root.locator("#dashboard-drilldown-table [data-exo=\"table-row\"]");

    await expectAttribute(root, "data-active-metric", "all");
    await expectAttribute(root, "data-visible-count", "8");
    await expectAttribute(root, "data-reviewed-count", "0");
    await expect(rows).toHaveCount(8);

    await root.getByRole("button", { name: /At risk/ }).click();
    await expectAttribute(root, "data-active-metric", "at_risk");
    await expectAttribute(root, "data-visible-count", "3");
    await expect(state).toHaveAttribute("data-drilldown-count", "1");
    await expect(rows).toHaveCount(3);
    await expect(root.locator("#dashboard-account-northstar")).toContainText("Northstar");
    await expect(root.locator("#dashboard-account-atlas")).toContainText("Atlas Works");

    await root
      .locator("#dashboard-account-northstar")
      .getByRole("button", { name: "Open details" })
      .click();
    await expectAttribute(drawer, "data-state", "open");
    await expectAttribute(root, "data-selected-account", "northstar");
    await expect(detail).toHaveAttribute("data-selected-account", "northstar");
    await expect(detail).toContainText("Assign executive sponsor");
    await expect(drawer.locator('[data-exo="progress"]')).toHaveAttribute("aria-valuenow", "42");

    await drawer.getByRole("button", { name: "Mark reviewed" }).click();
    await expectAttribute(root, "data-reviewed-count", "1");
    await expect(detail).toHaveAttribute("data-reviewed", "true");
    await expect(root.locator("#dashboard-account-northstar")).toContainText("Reviewed");

    await drawer.getByRole("button", { name: "Close details" }).click();
    await expectAttribute(drawer, "data-state", "closed");

    await root.getByRole("button", { name: /Renewals/ }).click();
    await expectAttribute(root, "data-active-metric", "renewals");
    await expectAttribute(root, "data-visible-count", "3");
    await expect(root.locator("#dashboard-account-lumen")).toContainText("Lumen Retail");

    await root.getByRole("button", { name: "Reset dashboard" }).click();
    await expectAttribute(root, "data-active-metric", "all");
    await expectAttribute(root, "data-visible-count", "8");
    await expectAttribute(root, "data-reviewed-count", "0");
  });
});
