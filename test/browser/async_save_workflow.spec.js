const { test, expect } = require("@playwright/test");

const {
  expectAttribute,
  gotoStory,
  story
} = require("./helpers/storybook");

test.describe("async save workflow", () => {
  test("validates a draft, disables submit while saving, and reports saved success", async ({
    page
  }) => {
    await gotoStory(page, "/components/recipes/async_save_workflow");

    const canvas = story(page);
    const root = canvas.locator('[data-exo="async-save-workflow"]');
    const state = canvas.locator("#async-save-state");
    const saveButton = root.getByRole("button", { name: /Save changes|Saving/ });

    await expectAttribute(root, "data-save-state", "clean");
    await expect(state).toHaveAttribute("data-saved-title", "Launch checklist");
    await expect(state).toContainText("unchanged");

    await root.getByLabel("Title").fill("Launch checklist v2");
    await expectAttribute(root, "data-save-state", "dirty");
    await expect(state).toContainText("unsaved changes");

    await saveButton.click();
    await expectAttribute(root, "data-save-state", "saving");
    await expect(root).toHaveAttribute("aria-busy", "true");
    await expect(saveButton).toBeDisabled();
    await expect(state).toContainText("Saving Launch checklist v2");

    await expect(root).toHaveAttribute("data-save-state", "saved");
    await expect(root).toHaveAttribute("data-saved-title", "Launch checklist v2");
    await expect(state).toHaveAttribute("data-saved-title", "Launch checklist v2");
    await expect(state).toContainText("Saved Launch checklist v2 successfully");
    await expect(saveButton).toBeEnabled();
  });
});
