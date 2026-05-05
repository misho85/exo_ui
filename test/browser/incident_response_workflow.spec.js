const { test, expect } = require("@playwright/test");

const {
  expectAttribute,
  gotoStory,
  story
} = require("./helpers/storybook");

test.describe("incident response workflow", () => {
  test("routes commands, filters incidents, validates escalation, resolves, and resets", async ({
    page
  }) => {
    await gotoStory(page, "/components/recipes/incident_response_workflow");

    const canvas = story(page);
    const root = canvas.locator('[data-exo="incident-response-workflow"]');
    const state = canvas.locator("#incident-response-state");
    const command = canvas.locator("#incident-command");
    const drawer = canvas.locator("#incident-response-drawer");
    const detail = canvas.locator("#incident-response-detail");
    const confirm = canvas.locator("#incident-resolve-confirm");
    const rows = root.locator("#incident-response-table [data-exo=\"table-row\"]");

    await expectAttribute(root, "data-active-tab", "open");
    await expectAttribute(root, "data-severity-filter", "all");
    await expectAttribute(root, "data-visible-count", "4");
    await expect(rows).toHaveCount(4);
    await expect(command).toHaveAttribute("data-shortcut", "ctrl+shift+i");

    await root.getByRole("button", { name: "Open incident commands" }).click();
    await expectAttribute(command, "data-state", "open");
    await command.locator('[data-exo="command-palette-input"]').fill("critical");
    await command.locator('[data-exo="command-palette-input"]').press("Enter");
    await expectAttribute(command, "aria-hidden", "true");
    await expectAttribute(root, "data-severity-filter", "critical");
    await expectAttribute(root, "data-visible-count", "2");
    await expectAttribute(root, "data-command-count", "1");

    await root
      .locator("#incident-row-checkout-latency")
      .getByRole("button", { name: "Open incident Checkout API latency" })
      .click();
    await expectAttribute(drawer, "data-state", "open");
    await expectAttribute(root, "data-selected-incident", "checkout-latency");
    await expect(detail).toHaveAttribute("data-severity", "critical");
    await expect(detail).toContainText("p95 latency crossed");

    await drawer.getByRole("button", { name: "Escalate incident" }).click();
    await expectAttribute(root, "data-validation-count", "1");
    await expectAttribute(drawer, "data-state", "open");
    await expect(drawer.locator("#incident-note")).toHaveAttribute("aria-invalid", "true");
    await expect(drawer.locator("#incident-note-error")).toHaveText(
      "Add at least 10 characters before escalating."
    );
    await expect(state).toHaveAttribute("data-last-action", "blocked incident escalation");

    await drawer.getByLabel("Triage note").fill("Payments rollback is ready.");
    await drawer.getByLabel("Response owner").selectOption("payments");
    await drawer.getByRole("button", { name: "Escalate incident" }).click();
    await expectAttribute(root, "data-escalation-count", "1");
    await expect(detail).toHaveAttribute("data-status", "escalated");
    await expect(detail).toContainText("Escalated incident");

    await drawer.getByRole("button", { name: "Prepare resolve" }).click();
    await expectAttribute(confirm, "data-state", "open");
    await expect(confirm.getByRole("alertdialog")).toContainText("Resolve Checkout API latency");
    await confirm.getByRole("button", { name: "Resolve incident" }).click();
    await expectAttribute(confirm, "data-state", "closed");
    await expectAttribute(drawer, "data-state", "closed");
    await expectAttribute(root, "data-active-tab", "resolved");
    await expectAttribute(root, "data-resolved-count", "1");
    await expectAttribute(root, "data-selected-incident", "");
    await expect(root.locator("#incident-row-checkout-latency")).toContainText("Resolved");

    await root.getByRole("tab", { name: "Open" }).click();
    await expectAttribute(root, "data-active-tab", "open");
    await root.getByLabel("Severity").selectOption("all");
    await expectAttribute(root, "data-severity-filter", "all");
    await expectAttribute(root, "data-visible-count", "3");

    await root.getByRole("button", { name: "Reset incidents" }).click();
    await expectAttribute(root, "data-active-tab", "open");
    await expectAttribute(root, "data-severity-filter", "all");
    await expectAttribute(root, "data-visible-count", "4");
    await expectAttribute(root, "data-command-count", "0");
    await expectAttribute(root, "data-resolved-count", "0");
  });
});
