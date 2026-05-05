const { test, expect } = require("@playwright/test");

const {
  expectAttribute,
  expectPopoverState,
  gotoStory,
  story
} = require("./helpers/storybook");

async function chooseSelect(root, selectId, value) {
  const trigger = root.locator(`#${selectId}-select [data-exo-select="trigger"]`);
  const popover = root.locator(`#${selectId}`);
  const option = popover.locator(`[data-exo="select-option"][data-value="${value}"]`);

  await trigger.click();
  await expectPopoverState(popover, true);
  await option.click();
  await expectPopoverState(popover, false);
}

test.describe("select recipes", () => {
  test("covers grouped options, disabled options, validation, and server-owned submit state", async ({
    page
  }) => {
    await gotoStory(page, "/components/recipes/select_recipes");

    const canvas = story(page);
    const root = canvas.locator('[data-exo="select-recipes-workflow"]');
    const state = canvas.locator("#select-recipes-state");
    const statusTrigger = root.locator(
      '#select-recipe-status-select [data-exo-select="trigger"]'
    );
    const statusPopover = root.locator("#select-recipe-status");
    const statusValue = root.locator('input[name="recipe[status]"]');
    const ownerTrigger = root.locator(
      '#select-recipe-owner-select [data-exo-select="trigger"]'
    );
    const regionTrigger = root.locator(
      '#select-recipe-region-select [data-exo-select="trigger"]'
    );
    const submit = root.locator("#select-recipe-submit");

    await expectAttribute(root, "data-validation-state", "clean");
    await expectAttribute(root, "data-status", "active");
    await expect(statusValue).toHaveValue("active");
    await expect(statusTrigger.locator('[data-exo="select-value"]')).toContainText("Active");
    await expect(regionTrigger).toBeDisabled();

    await statusTrigger.click();
    await expectPopoverState(statusPopover, true);
    const disabledStatus = statusPopover.locator(
      '[data-exo="select-option"][data-value="deleted"]'
    );
    await expect(disabledStatus).toHaveAttribute("aria-disabled", "true");
    await disabledStatus.evaluate((node) => {
      node.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    await expectAttribute(root, "data-status", "active");
    await expect(statusValue).toHaveValue("active");
    await expectPopoverState(statusPopover, true);
    await page.keyboard.press("Escape");

    await root.getByRole("button", { name: "Clear required selections" }).click();
    await expectAttribute(root, "data-validation-state", "invalid");
    await expectAttribute(root, "data-status", "");
    await expect(statusTrigger).toHaveAttribute("aria-invalid", "true");
    await expectAttribute(
      statusTrigger,
      "aria-describedby",
      "select-recipe-status-description select-recipe-status-error"
    );
    await expect(root.locator("#select-recipe-status-error")).toHaveText(
      "choose a workflow status"
    );
    await expect(ownerTrigger).toHaveAttribute("aria-invalid", "true");
    await expect(submit).toBeDisabled();

    await chooseSelect(root, "select-recipe-status", "blocked");
    await expectAttribute(root, "data-status", "blocked");
    await chooseSelect(root, "select-recipe-priority", "high");
    await expectAttribute(root, "data-priority", "high");
    await chooseSelect(root, "select-recipe-owner", "support");
    await expectAttribute(root, "data-owner", "support");

    await expectAttribute(root, "data-validation-state", "ready");
    await expect(submit).not.toBeDisabled();

    await submit.click();
    await expectAttribute(root, "data-validation-state", "submitted");
    await expectAttribute(root, "data-submitted-count", "1");
    await expect(state).toHaveAttribute("data-last-action", "submitted select recipe");

    await root.getByRole("button", { name: "Reset selects" }).click();
    await expectAttribute(root, "data-validation-state", "clean");
    await expectAttribute(root, "data-status", "blocked");
  });
});
