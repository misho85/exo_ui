const { test, expect } = require("@playwright/test");

const {
  expectAttribute,
  gotoStory,
  story
} = require("./helpers/storybook");

test.describe("navigation shell workflow", () => {
  test("targets tabs and wizard events inside a LiveComponent shell", async ({ page }) => {
    await gotoStory(page, "/components/recipes/navigation_shell_workflow");

    const canvas = story(page);
    const root = canvas.locator('[data-exo="navigation-shell-workflow"]');
    const state = canvas.locator("#navigation-shell-state");
    const tabs = root.locator("#navigation-shell-tabs");
    const wizard = root.locator('[data-exo="wizard"]');
    const pagination = root.locator('[aria-label="Navigation shell pagination"]');
    const bottomNav = root.locator('[aria-label="Navigation shell mobile navigation"]');

    await expectAttribute(root, "data-active-section", "overview");
    await expect(state).toHaveAttribute("data-active-tab", "summary");
    await expect(tabs).toHaveAttribute("data-ready", "");
    await expect(tabs.getByRole("tab", { name: /Teams/ })).toHaveAttribute("phx-target", /.+/);
    await expect(wizard.getByRole("button", { name: "Step 1, Scope, current" })).toHaveAttribute(
      "phx-target",
      /.+/
    );
    await expect(bottomNav.locator('[aria-current="page"]')).toContainText("Overview");

    await tabs.getByRole("tab", { name: /Teams/ }).click();
    await expectAttribute(root, "data-active-tab", "teams");
    await expect(state).toHaveAttribute("data-last-action", "opened Teams tab");

    await root.getByRole("button", { name: "Plan", exact: true }).click();
    await expectAttribute(root, "data-active-section", "plan");
    await expect(root.locator('[data-exo="breadcrumb-current"]')).toHaveText("Plan");
    await expect(bottomNav.locator('[aria-current="page"]')).toContainText("Plan");
    await expectAttribute(root, "data-active-tab", "summary");

    await wizard.getByRole("button", { name: "Step 1, Scope, current" }).click();
    await expectAttribute(root, "data-active-step", "scope");

    await root.getByRole("button", { name: "Next route page" }).click();
    await expectAttribute(root, "data-page", "2");
    await expect(pagination.locator('[aria-current="page"]')).toHaveAttribute(
      "aria-label",
      "Open navigation shell page 2, current page"
    );
    await expect(root.locator("#navigation-shell-page-table")).toContainText(
      "Validate mobile nav labels"
    );

    await root.getByRole("button", { name: "Rollout", exact: true }).click();
    await expectAttribute(root, "data-active-section", "rollout");
    await expect(bottomNav.locator('[aria-current="page"]')).toContainText("Rollout");

    await root.getByRole("button", { name: "Reset shell" }).click();
    await expectAttribute(root, "data-active-section", "overview");
    await expectAttribute(root, "data-active-tab", "summary");
    await expectAttribute(root, "data-page", "1");
  });
});
