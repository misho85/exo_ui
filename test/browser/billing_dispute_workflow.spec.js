const { test, expect } = require("@playwright/test");

const {
  expectAttribute,
  gotoStory,
  story
} = require("./helpers/storybook");

test.describe("billing dispute workflow", () => {
  test("routes queues, guards credit approval, requests evidence, issues a credit, and resets", async ({
    page
  }) => {
    await gotoStory(page, "/components/recipes/billing_dispute_workflow");

    const canvas = story(page);
    const root = canvas.locator('[data-exo="billing-dispute-workflow"]');
    const state = canvas.locator("#billing-dispute-state");
    const command = canvas.locator("#billing-command");
    const drawer = canvas.locator("#billing-dispute-drawer");
    const detail = canvas.locator("#billing-dispute-detail");
    const confirm = canvas.locator("#billing-credit-confirm");
    const rows = root.locator("#billing-dispute-table [data-exo=\"table-row\"]");

    await expectAttribute(root, "data-active-tab", "open");
    await expectAttribute(root, "data-queue-filter", "all");
    await expectAttribute(root, "data-visible-count", "3");
    await expectAttribute(root, "data-open-count", "3");
    await expectAttribute(root, "data-approved-total", "1");
    await expectAttribute(root, "data-denied-total", "1");
    await expectAttribute(root, "data-visible-amount", "4560");
    await expect(rows).toHaveCount(3);
    await expect(command).toHaveAttribute("data-shortcut", "ctrl+shift+b");

    await root.getByRole("button", { name: "Open billing commands" }).click();
    await expectAttribute(command, "data-state", "open");
    await command.locator('[data-exo="command-palette-input"]').fill("payments");
    await command.locator('[data-exo="command-palette-input"]').press("Enter");
    await expectAttribute(command, "aria-hidden", "true");
    await expectAttribute(root, "data-active-tab", "open");
    await expectAttribute(root, "data-queue-filter", "payments");
    await expectAttribute(root, "data-visible-count", "1");
    await expectAttribute(root, "data-command-count", "1");

    await root
      .locator("#billing-dispute-duplicate-invoice")
      .getByRole("button", { name: "Review Acme Corp" })
      .click();
    await expectAttribute(drawer, "data-state", "open");
    await expectAttribute(root, "data-selected-dispute", "duplicate-invoice");
    await expect(detail).toHaveAttribute("data-risk", "high");
    await expect(detail).toContainText("duplicate annual invoice charge");

    await drawer.getByRole("button", { name: "Prepare credit" }).click();
    await expectAttribute(confirm, "data-state", "open");
    await expect(confirm.getByRole("alertdialog")).toContainText(
      "Credit issuance is guarded"
    );
    await confirm.getByRole("button", { name: "Issue credit" }).click();
    await expectAttribute(confirm, "data-state", "open");
    await expectAttribute(drawer, "data-state", "closed");
    await expectAttribute(root, "data-validation-count", "1");
    await expect(drawer.locator("#billing-note")).toHaveAttribute("aria-invalid", "true");
    await expect(drawer.locator("#billing-note-error")).toHaveText(
      "Add at least 15 characters before saving the dispute decision."
    );
    await expect(state).toHaveAttribute("data-last-action", "blocked dispute decision");

    await confirm.getByRole("button", { name: "Keep reviewing" }).click();
    await expectAttribute(confirm, "data-state", "closed");

    await root
      .locator("#billing-dispute-duplicate-invoice")
      .getByRole("button", { name: "Review Acme Corp" })
      .click();
    await expectAttribute(drawer, "data-state", "open");
    await drawer.getByLabel("Review note").fill("Duplicate charge confirmed by invoice retry logs.");
    await drawer.getByLabel("Reviewer").selectOption("manager");
    await drawer.getByRole("button", { name: "Request evidence" }).click();
    await expectAttribute(root, "data-evidence-count", "1");
    await expectAttribute(root, "data-evidence-total", "1");
    await expect(detail).toHaveAttribute("data-status", "evidence");
    await expect(detail).toContainText("Evidence requested");

    await drawer.getByRole("button", { name: "Prepare credit" }).click();
    await expectAttribute(drawer, "data-state", "closed");
    await expectAttribute(confirm, "data-state", "open");
    await expect(confirm.getByRole("alertdialog")).toContainText(
      "The review note is recorded"
    );
    await confirm.getByRole("button", { name: "Issue credit" }).click();
    await expectAttribute(confirm, "data-state", "closed");
    await expectAttribute(drawer, "data-state", "closed");
    await expectAttribute(root, "data-active-tab", "approved");
    await expectAttribute(root, "data-selected-dispute", "");
    await expectAttribute(root, "data-approved-count", "1");
    await expectAttribute(root, "data-approved-total", "2");
    await expectAttribute(root, "data-open-count", "2");
    await expectAttribute(root, "data-visible-count", "2");

    await root.getByRole("button", { name: "Reset disputes" }).click();
    await expectAttribute(root, "data-active-tab", "open");
    await expectAttribute(root, "data-queue-filter", "all");
    await expectAttribute(root, "data-visible-count", "3");
    await expectAttribute(root, "data-open-count", "3");
    await expectAttribute(root, "data-approved-total", "1");
    await expectAttribute(root, "data-command-count", "0");
    await expectAttribute(root, "data-validation-count", "0");
  });
});
