const { test, expect } = require("@playwright/test");

const {
  expectAttribute,
  gotoStory,
  story
} = require("./helpers/storybook");

test.describe("release readiness workflow", () => {
  test("guards launch, routes commands, validates review notes, approves checks, and resets", async ({
    page
  }) => {
    await gotoStory(page, "/components/recipes/release_readiness_workflow");

    const canvas = story(page);
    const root = canvas.locator('[data-exo="release-readiness-workflow"]');
    const state = canvas.locator("#release-readiness-state");
    const command = canvas.locator("#release-command");
    const drawer = canvas.locator("#release-check-drawer");
    const detail = canvas.locator("#release-check-detail");
    const confirm = canvas.locator("#release-launch-confirm");
    const rows = root.locator("#release-readiness-table [data-exo=\"table-row\"]");

    await expectAttribute(root, "data-active-tab", "pending");
    await expectAttribute(root, "data-lane-filter", "all");
    await expectAttribute(root, "data-visible-count", "2");
    await expectAttribute(root, "data-ready-count", "1");
    await expectAttribute(root, "data-blocked-count", "1");
    await expectAttribute(root, "data-readiness-score", "25");
    await expect(rows).toHaveCount(2);
    await expect(command).toHaveAttribute("data-shortcut", "ctrl+shift+r");

    await root.getByRole("button", { name: "Prepare launch" }).click();
    await expectAttribute(confirm, "data-state", "open");
    await confirm.getByRole("button", { name: "Launch release" }).click();
    await expectAttribute(confirm, "data-state", "open");
    await expectAttribute(root, "data-validation-count", "1");
    await expect(state).toHaveAttribute("data-launch-error", /Resolve every pending/);
    await confirm.getByRole("button", { name: "Keep reviewing" }).click();
    await expectAttribute(confirm, "data-state", "closed");

    await root.getByRole("button", { name: "Open release commands" }).click();
    await expectAttribute(command, "data-state", "open");
    await command.locator('[data-exo="command-palette-input"]').fill("engineering");
    await command.locator('[data-exo="command-palette-input"]').press("Enter");
    await expectAttribute(command, "aria-hidden", "true");
    await expectAttribute(root, "data-active-tab", "pending");
    await expectAttribute(root, "data-lane-filter", "engineering");
    await expectAttribute(root, "data-visible-count", "1");
    await expectAttribute(root, "data-command-count", "1");

    await root
      .locator("#release-check-migration-smoke")
      .getByRole("button", { name: "Review Migration smoke test" })
      .click();
    await expectAttribute(drawer, "data-state", "open");
    await expectAttribute(root, "data-selected-check", "migration-smoke");
    await expect(detail).toHaveAttribute("data-status", "pending");

    await drawer.getByRole("button", { name: "Approve check" }).click();
    await expectAttribute(root, "data-validation-count", "2");
    await expect(drawer.locator("#release-note")).toHaveAttribute("aria-invalid", "true");
    await expect(drawer.locator("#release-note-error")).toHaveText(
      "Add at least 12 characters before saving the review."
    );

    await drawer.getByLabel("Review note").fill("Smoke test reviewed and approved.");
    await drawer.getByLabel("Reviewer").selectOption("engineering-lead");
    await drawer.getByRole("button", { name: "Approve check" }).click();
    await expectAttribute(root, "data-ready-count", "2");
    await expectAttribute(root, "data-pending-count", "1");
    await expect(detail).toHaveAttribute("data-status", "ready");
    await expect(state).toHaveAttribute("data-launch-error", "");
    await drawer.getByRole("button", { name: "Close review" }).click();
    await expectAttribute(drawer, "data-state", "closed");

    await root.getByLabel("Lane").selectOption("all");
    await expectAttribute(root, "data-lane-filter", "all");
    await expectAttribute(root, "data-active-tab", "ready");
    await expectAttribute(root, "data-visible-count", "2");
    await root.getByRole("tab", { name: "Pending" }).click();
    await expectAttribute(root, "data-active-tab", "pending");
    await expectAttribute(root, "data-visible-count", "1");
    await root
      .locator("#release-check-rollout-flags")
      .getByRole("button", { name: "Review Feature flag rollout" })
      .click();
    await expectAttribute(drawer, "data-state", "open");
    await drawer.getByLabel("Review note").fill("Rollout flags match the launch plan.");
    await drawer.getByLabel("Reviewer").selectOption("product-lead");
    await drawer.getByRole("button", { name: "Approve check" }).click();
    await expectAttribute(root, "data-ready-count", "3");
    await expectAttribute(root, "data-pending-count", "0");
    await drawer.getByRole("button", { name: "Close review" }).click();

    await root.getByRole("tab", { name: "Blocked" }).click();
    await expectAttribute(root, "data-active-tab", "blocked");
    await expectAttribute(root, "data-visible-count", "1");
    await root
      .locator("#release-check-rollback-runbook")
      .getByRole("button", { name: "Review Rollback runbook" })
      .click();
    await expectAttribute(drawer, "data-state", "open");
    await drawer.getByLabel("Review note").fill("Rollback runbook is approved for launch.");
    await drawer.getByLabel("Reviewer").selectOption("release-manager");
    await drawer.getByRole("button", { name: "Approve check" }).click();
    await expectAttribute(root, "data-ready-count", "4");
    await expectAttribute(root, "data-blocked-count", "0");
    await expectAttribute(root, "data-readiness-score", "100");
    await expectAttribute(root, "data-release-state", "ready");
    await drawer.getByRole("button", { name: "Close review" }).click();
    await expectAttribute(drawer, "data-state", "closed");

    await root.getByRole("button", { name: "Prepare launch" }).click();
    await expectAttribute(confirm, "data-state", "open");
    await expect(confirm.getByRole("alertdialog")).toContainText("All release checks are ready");
    await confirm.getByRole("button", { name: "Launch release" }).click();
    await expectAttribute(confirm, "data-state", "closed");
    await expectAttribute(root, "data-release-state", "launched");
    await expectAttribute(root, "data-launch-count", "1");

    await root.getByRole("button", { name: "Reset release" }).click();
    await expectAttribute(root, "data-active-tab", "pending");
    await expectAttribute(root, "data-visible-count", "2");
    await expectAttribute(root, "data-ready-count", "1");
    await expectAttribute(root, "data-blocked-count", "1");
    await expectAttribute(root, "data-launch-count", "0");
  });
});
