const { test, expect } = require("@playwright/test");

const {
  expectAttribute,
  gotoStory,
  story
} = require("./helpers/storybook");

test.describe("input recipes", () => {
  test("covers validation, readonly, disabled, textarea, checkbox, and submit state", async ({
    page
  }) => {
    await gotoStory(page, "/components/recipes/input_recipes");

    const canvas = story(page);
    const root = canvas.locator('[data-exo="input-recipes-workflow"]');
    const state = canvas.locator("#input-recipes-state");
    const name = root.locator("#input-recipe-name");
    const email = root.locator("#input-recipe-email");
    const slug = root.locator("#input-recipe-slug");
    const apiKey = root.locator("#input-recipe-api-key");
    const notes = root.locator("#input-recipe-notes");
    const terms = root.locator("#input-recipe-terms");
    const termsLabel = root.locator('label[for="input-recipe-terms"]');
    const submit = root.locator("#input-recipe-submit");

    await expectAttribute(root, "data-validation-state", "clean");
    await expect(name).toHaveAttribute("required", "");
    await expect(email).toHaveAttribute("type", "email");
    await expect(email).toHaveAttribute("autocomplete", "email");
    await expect(slug).toHaveAttribute("readonly", "");
    await expect(apiKey).toBeDisabled();
    await expect(terms).toBeChecked();
    await expect(submit).not.toBeDisabled();

    await email.fill("bad-email");
    await expectAttribute(root, "data-validation-state", "invalid");
    await expect(email).toHaveAttribute("aria-invalid", "true");
    await expectAttribute(
      email,
      "aria-describedby",
      "input-recipe-email-description input-recipe-email-error"
    );
    await expect(root.locator("#input-recipe-email-error")).toHaveText(
      "must be a valid email address"
    );
    await expect(submit).toBeDisabled();

    await termsLabel.click();
    await expectAttribute(root, "data-terms-accepted", "false");
    await expect(terms).toHaveAttribute("aria-invalid", "true");
    await expectAttribute(
      terms,
      "aria-describedby",
      "input-recipe-terms-description input-recipe-terms-error"
    );

    await notes.fill(
      "This note is intentionally too long for the recipe guard so the textarea can expose an aria-describedby error while preserving the description."
    );
    await expect(notes).toHaveAttribute("aria-invalid", "true");
    await expect(root.locator("#input-recipe-notes-error")).toHaveText(
      "must be 120 characters or fewer"
    );

    await name.fill("Operations Lead");
    await email.fill("lead@example.com");
    await notes.fill("Ready for the next review.");
    await termsLabel.click();

    await expectAttribute(root, "data-validation-state", "ready");
    await expect(submit).not.toBeDisabled();

    await submit.click();
    await expectAttribute(root, "data-validation-state", "submitted");
    await expectAttribute(root, "data-submitted-count", "1");
    await expect(state).toHaveAttribute("data-last-action", "submitted input recipe");

    await root.getByRole("button", { name: "Reset inputs" }).click();
    await expectAttribute(root, "data-validation-state", "clean");
    await expectAttribute(root, "data-submitted-count", "1");
  });
});
