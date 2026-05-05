const { test, expect } = require("@playwright/test");

const {
  expectAttribute,
  gotoStory,
  story
} = require("./helpers/storybook");

test.describe("role operations workflow", () => {
  test("switches role queues, filters lanes, opens task details, and acknowledges a task", async ({
    page
  }) => {
    await gotoStory(page, "/components/recipes/role_operations_workflow");

    const canvas = story(page);
    const root = canvas.locator('[data-exo="role-operations-workflow"]');
    const state = canvas.locator("#role-operations-state");
    const drawer = canvas.locator("#role-operations-drawer");
    const detail = drawer.locator("#role-operations-detail");
    const rows = root.locator("#role-operations-table [data-exo=\"table-row\"]");

    await expectAttribute(root, "data-active-role", "ops");
    await expectAttribute(root, "data-active-lane", "all");
    await expectAttribute(root, "data-visible-count", "4");
    await expect(rows).toHaveCount(4);

    await root.getByRole("button", { name: /Support/ }).click();
    await expectAttribute(root, "data-active-role", "support");
    await expectAttribute(root, "data-visible-count", "3");
    await expect(state).toHaveAttribute("data-action-count", "1");
    await expect(root.locator("#role-operation-task-helio-domain")).toContainText(
      "Resolve duplicate domain"
    );

    await root.getByRole("button", { name: "Blocked" }).click();
    await expectAttribute(root, "data-active-lane", "blocked");
    await expectAttribute(root, "data-visible-count", "1");
    await expect(rows).toHaveCount(1);

    await root
      .locator("#role-operation-task-helio-domain")
      .getByRole("button", { name: "Open task" })
      .click();
    await expectAttribute(drawer, "data-state", "open");
    await expectAttribute(root, "data-selected-task", "helio-domain");
    await expect(detail).toHaveAttribute("data-selected-task", "helio-domain");
    await expect(detail).toContainText("Confirm canonical domain");
    await expect(drawer.locator('[data-exo="progress"]')).toHaveAttribute("aria-valuenow", "24");

    await drawer.getByRole("button", { name: "Acknowledge task" }).click();
    await expectAttribute(root, "data-acknowledged-count", "1");
    await expect(detail).toHaveAttribute("data-acknowledged", "true");
    await expect(root.locator("#role-operation-task-helio-domain")).toContainText("Acknowledged");

    await drawer.getByRole("button", { name: "Close task" }).click();
    await expectAttribute(drawer, "data-state", "closed");

    await root.getByRole("button", { name: /Finance/ }).click();
    await expectAttribute(root, "data-active-role", "finance");
    await expectAttribute(root, "data-active-lane", "all");
    await expectAttribute(root, "data-visible-count", "3");
    await expect(root.locator("#role-operation-task-atlas-invoice")).toContainText(
      "Clear invoice hold"
    );

    await root.getByRole("button", { name: "Reset operations" }).click();
    await expectAttribute(root, "data-active-role", "ops");
    await expectAttribute(root, "data-active-lane", "all");
    await expectAttribute(root, "data-acknowledged-count", "0");
    await expectAttribute(root, "data-action-count", "0");
  });
});
