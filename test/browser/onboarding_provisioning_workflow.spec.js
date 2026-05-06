const { test, expect } = require("@playwright/test");

const {
  expectAttribute,
  gotoStory,
  story
} = require("./helpers/storybook");

test.describe("onboarding provisioning workflow", () => {
  test("routes identity setup, guards activation, requests setup info, activates, and resets", async ({
    page
  }) => {
    await gotoStory(page, "/components/recipes/onboarding_provisioning_workflow");

    const canvas = story(page);
    const root = canvas.locator('[data-exo="onboarding-provisioning-workflow"]');
    const state = canvas.locator("#onboarding-state");
    const command = canvas.locator("#onboarding-command");
    const drawer = canvas.locator("#onboarding-user-drawer");
    const detail = canvas.locator("#onboarding-user-detail");
    const confirm = canvas.locator("#onboarding-provision-confirm");
    const rows = root.locator("#onboarding-table [data-exo=\"table-row\"]");

    await expectAttribute(root, "data-active-tab", "pending");
    await expectAttribute(root, "data-team-filter", "all");
    await expectAttribute(root, "data-visible-count", "2");
    await expectAttribute(root, "data-pending-count", "2");
    await expectAttribute(root, "data-provisioned-total", "1");
    await expectAttribute(root, "data-blocked-total", "1");
    await expectAttribute(root, "data-readiness-score", "25");
    await expect(rows).toHaveCount(2);
    await expect(command).toHaveAttribute("data-shortcut", "ctrl+shift+o");

    await root.getByRole("button", { name: "Open onboarding commands" }).click();
    await expectAttribute(command, "data-state", "open");
    await command.locator('[data-exo="command-palette-input"]').fill("identity");
    await command.locator('[data-exo="command-palette-input"]').press("Enter");
    await expectAttribute(command, "aria-hidden", "true");
    await expectAttribute(root, "data-active-tab", "pending");
    await expectAttribute(root, "data-team-filter", "identity");
    await expectAttribute(root, "data-visible-count", "1");
    await expectAttribute(root, "data-command-count", "1");

    await root
      .locator("#onboarding-user-ana-enterprise")
      .getByRole("button", { name: "Review Ana Markovic" })
      .click();
    await expectAttribute(drawer, "data-state", "open");
    await expectAttribute(root, "data-selected-user", "ana-enterprise");
    await expect(detail).toHaveAttribute("data-plan", "enterprise");
    await expect(detail).toContainText("SSO domain is verified");

    await drawer.getByRole("button", { name: "Prepare activation" }).click();
    await expectAttribute(drawer, "data-state", "closed");
    await expectAttribute(confirm, "data-state", "open");
    await expect(confirm.getByRole("alertdialog")).toContainText(
      "Account activation is guarded"
    );
    await confirm.getByRole("button", { name: "Activate account" }).click();
    await expectAttribute(confirm, "data-state", "open");
    await expectAttribute(root, "data-validation-count", "1");
    await expect(state).toHaveAttribute("data-last-action", "blocked onboarding decision");

    await confirm.getByRole("button", { name: "Keep reviewing" }).click();
    await expectAttribute(confirm, "data-state", "closed");

    await root
      .locator("#onboarding-user-ana-enterprise")
      .getByRole("button", { name: "Review Ana Markovic" })
      .click();
    await expectAttribute(drawer, "data-state", "open");
    await expect(drawer.locator("#onboarding-note")).toHaveAttribute("aria-invalid", "true");
    await expect(drawer.locator("#onboarding-note-error")).toHaveText(
      "Add at least 14 characters before saving onboarding."
    );

    await drawer.getByLabel("Setup note").fill("SSO role mapping and workspace defaults are approved.");
    await drawer.getByLabel("Provisioner").selectOption("identity");
    await drawer.getByRole("button", { name: "Request setup info" }).click();
    await expectAttribute(root, "data-info-count", "1");
    await expectAttribute(root, "data-info-total", "1");
    await expect(detail).toHaveAttribute("data-status", "info");
    await expect(detail).toContainText("Info requested");

    await drawer.getByRole("button", { name: "Prepare activation" }).click();
    await expectAttribute(drawer, "data-state", "closed");
    await expectAttribute(confirm, "data-state", "open");
    await expect(confirm.getByRole("alertdialog")).toContainText("The setup note is recorded");
    await confirm.getByRole("button", { name: "Activate account" }).click();
    await expectAttribute(confirm, "data-state", "closed");
    await expectAttribute(root, "data-active-tab", "provisioned");
    await expectAttribute(root, "data-selected-user", "");
    await expectAttribute(root, "data-provisioned-count", "1");
    await expectAttribute(root, "data-provisioned-total", "2");
    await expectAttribute(root, "data-pending-count", "1");
    await expectAttribute(root, "data-readiness-score", "50");

    await root.getByRole("button", { name: "Reset onboarding" }).click();
    await expectAttribute(root, "data-active-tab", "pending");
    await expectAttribute(root, "data-team-filter", "all");
    await expectAttribute(root, "data-visible-count", "2");
    await expectAttribute(root, "data-pending-count", "2");
    await expectAttribute(root, "data-provisioned-total", "1");
    await expectAttribute(root, "data-command-count", "0");
    await expectAttribute(root, "data-validation-count", "0");
  });
});
