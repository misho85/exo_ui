const { test, expect } = require("@playwright/test");

const {
  expectAttribute,
  expectFocused,
  gotoStory,
  story
} = require("./helpers/storybook");

test.describe("modal recipes", () => {
  test("covers modal naming, form state, close callbacks, and guarded confirm", async ({
    page
  }) => {
    await gotoStory(page, "/components/recipes/modal_recipes");

    const canvas = story(page);
    const root = canvas.locator('[data-exo="modal-recipes-workflow"]');
    const state = canvas.locator("#modal-recipes-state");
    const openEditor = root.getByRole("button", { name: "Open editor modal" });
    const editor = canvas.locator("#modal-recipe-editor");
    const labelled = canvas.locator("#modal-recipe-labelled");
    const confirm = canvas.locator("#modal-recipe-archive-confirm");
    const editorDialog = editor.locator('[data-exo="modal-content"]');
    const labelledDialog = labelled.locator('[data-exo="modal-content"]');
    const confirmDialog = confirm.locator('[data-exo="modal-content"]');

    await expectAttribute(root, "data-saved-count", "0");
    await expectAttribute(editor, "data-state", "closed");

    await openEditor.click();
    await expectAttribute(editor, "data-state", "open");
    await expect(editorDialog).toHaveAttribute("aria-labelledby", "modal-recipe-editor-title");
    await expect(editorDialog).toHaveAttribute("aria-describedby", "modal-recipe-editor-body");
    await expect(editorDialog).toHaveAttribute("role", "dialog");
    await expectFocused(editor.locator('[data-exo="modal-close"]'));

    await editor.getByLabel("Workspace name").fill("Northstar Enterprise");
    await editor.getByLabel("Workspace owner").fill("Mina");
    await expectAttribute(root, "data-workspace-name", "Northstar Enterprise");
    await expectAttribute(root, "data-workspace-owner", "Mina");
    await editor.getByRole("button", { name: "Save modal changes" }).click();
    await expectAttribute(editor, "data-state", "closed");
    await expectAttribute(root, "data-saved-count", "1");
    await expect(state).toHaveAttribute("data-last-action", "saved Northstar Enterprise");

    await root.getByRole("button", { name: "Open labelled modal" }).click();
    await expectAttribute(labelled, "data-state", "open");
    await expect(labelledDialog).toHaveAttribute("aria-label", "Invite teammate dialog");
    await expect(labelledDialog).not.toHaveAttribute("aria-labelledby", /.*/);
    await labelled.getByLabel("Invite email").fill("design@example.com");
    await expectAttribute(root, "data-invite-email", "design@example.com");
    await labelled.getByRole("button", { name: "Send labelled invite" }).click();
    await expectAttribute(labelled, "data-state", "closed");
    await expectAttribute(root, "data-invite-count", "1");

    await root.getByRole("button", { name: "Open guarded confirm" }).click();
    await expectAttribute(confirm, "data-state", "open");
    await expect(confirmDialog).toHaveAttribute("role", "alertdialog");
    await confirm.getByRole("button", { name: "Validate archive" }).click();
    await expectAttribute(confirm, "data-state", "open");
    await expectAttribute(root, "data-confirm-count", "1");
    await expect(state).toHaveAttribute("data-last-action", "validated archive request");

    await confirm.getByRole("button", { name: "Keep workspace" }).click();
    await expectAttribute(confirm, "data-state", "closed");
    await expectAttribute(root, "data-cancel-count", "1");
  });
});
