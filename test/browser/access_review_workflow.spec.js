const { test, expect } = require("@playwright/test");

const {
  chooseSelect,
  expectAttribute,
  gotoStory,
  story
} = require("./helpers/storybook");

test.describe("access review workflow", () => {
  test("routes commands, filters grants, validates evidence, revokes access, and resets", async ({
    page
  }) => {
    await gotoStory(page, "/components/recipes/access_review_workflow");

    const canvas = story(page);
    const root = canvas.locator('[data-exo="access-review-workflow"]');
    const state = canvas.locator("#access-review-state");
    const command = canvas.locator("#access-review-command");
    const drawer = canvas.locator("#access-review-drawer");
    const detail = canvas.locator("#access-review-detail");
    const confirm = canvas.locator("#access-review-revoke-confirm");
    const rows = root.locator("#access-review-table [data-exo=\"table-row\"]");

    await expectAttribute(root, "data-active-tab", "pending");
    await expectAttribute(root, "data-risk-filter", "all");
    await expectAttribute(root, "data-visible-count", "4");
    await expect(rows).toHaveCount(4);
    await expect(command).toHaveAttribute("data-shortcut", "ctrl+shift+a");

    await root.getByRole("button", { name: "Open access commands" }).click();
    await expectAttribute(command, "data-state", "open");
    await command.locator('[data-exo="command-palette-input"]').fill("high risk");
    await command.locator('[data-exo="command-palette-input"]').press("Enter");
    await expectAttribute(command, "aria-hidden", "true");
    await expectAttribute(root, "data-risk-filter", "high");
    await expectAttribute(root, "data-visible-count", "2");
    await expectAttribute(root, "data-command-count", "1");

    await root
      .locator("#access-grant-ana-admin")
      .getByRole("button", { name: "Open access review for Ana Markovic" })
      .click();
    await expectAttribute(drawer, "data-state", "open");
    await expectAttribute(root, "data-selected-grant", "ana-admin");
    await expect(detail).toHaveAttribute("data-risk", "high");
    await expect(detail).toContainText("Billing console");

    await drawer.getByRole("button", { name: "Request evidence" }).click();
    await expectAttribute(root, "data-validation-count", "1");
    await expectAttribute(drawer, "data-state", "open");
    await expect(drawer.locator("#access-review-note")).toHaveAttribute("aria-invalid", "true");
    await expect(drawer.locator("#access-review-note-error")).toHaveText(
      "Add at least 8 characters before requesting evidence."
    );
    await expect(state).toHaveAttribute("data-last-action", "blocked evidence request");

    await drawer.getByLabel("Decision note").fill("Manager approval is missing.");
    await chooseSelect(drawer, "access-review-owner", "manager");
    await drawer.getByRole("button", { name: "Request evidence" }).click();
    await expectAttribute(root, "data-evidence-count", "1");
    await expect(detail).toHaveAttribute("data-status", "evidence");
    await expect(detail).toContainText("Evidence requested");

    await drawer.getByRole("button", { name: "Prepare revoke" }).click();
    await expectAttribute(confirm, "data-state", "open");
    await expect(confirm.getByRole("alertdialog")).toContainText("Revoke Workspace admin access");
    await confirm.getByRole("button", { name: "Revoke access" }).click();
    await expectAttribute(confirm, "data-state", "closed");
    await expectAttribute(drawer, "data-state", "closed");
    await expectAttribute(root, "data-active-tab", "revoked");
    await expectAttribute(root, "data-revoked-count", "1");
    await expectAttribute(root, "data-selected-grant", "");
    await expect(root.locator("#access-grant-ana-admin")).toContainText("Revoked");

    await chooseSelect(root, "access-review-risk", "all");
    await expectAttribute(root, "data-risk-filter", "all");
    await root.getByRole("tab", { name: "Approved" }).click();
    await expectAttribute(root, "data-active-tab", "approved");
    await expectAttribute(root, "data-visible-count", "1");
    await expect(root.locator("#access-grant-ivan-reports")).toContainText("Ivan Jovanovic");

    await root.getByRole("button", { name: "Reset review" }).click();
    await expectAttribute(root, "data-active-tab", "pending");
    await expectAttribute(root, "data-risk-filter", "all");
    await expectAttribute(root, "data-visible-count", "4");
    await expectAttribute(root, "data-command-count", "0");
    await expectAttribute(root, "data-revoked-count", "0");
  });
});
