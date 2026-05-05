const { test, expect } = require("@playwright/test");

const {
  expectAttribute,
  expectFocused,
  gotoStory,
  story
} = require("./helpers/storybook");

test.describe("command routing workflow", () => {
  test("routes between screens from navigation and command palette search", async ({ page }) => {
    await gotoStory(page, "/components/recipes/command_routing_workflow");

    const canvas = story(page);
    const root = canvas.locator('[data-exo="command-routing-workflow"]');
    const state = canvas.locator("#command-routing-state");
    const command = canvas.locator("#routing-command");
    const commandInput = command.locator('[data-exo="command-palette-input"]');

    await expectAttribute(root, "data-active-screen", "overview");
    await expect(state).toHaveAttribute("data-route-count", "0");

    await root.getByRole("button", { name: "Accounts", exact: true }).click();
    await expectAttribute(root, "data-active-screen", "accounts");
    await expect(state).toHaveAttribute("data-last-command", "navigation");
    await expect(state).toHaveAttribute("data-route-count", "1");
    await expect(root.locator("#routing-accounts-table [data-exo=\"table-row\"]")).toHaveCount(3);

    await root.getByRole("button", { name: "Open routing commands" }).click();
    await expectAttribute(command, "data-state", "open");
    await expectFocused(commandInput);

    await commandInput.fill("risk");
    await expect(command.locator('[data-exo="command-palette-item"][data-value="go-risk"]')).toHaveAttribute(
      "data-active",
      "true"
    );
    await commandInput.press("Enter");

    await expectAttribute(command, "data-state", "closed");
    await expectAttribute(root, "data-active-screen", "risk");
    await expect(state).toHaveAttribute("data-last-command", "command palette");
    await expect(state).toHaveAttribute("data-route-count", "2");
    await expect(root.locator("#routing-screen-risk")).toContainText("Policy escalation");

    await root.getByRole("button", { name: "Back to accounts" }).click();
    await expectAttribute(root, "data-active-screen", "accounts");
    await expect(state).toHaveAttribute("data-last-command", "risk drilldown");
    await expect(state).toHaveAttribute("data-route-count", "3");
  });
});
