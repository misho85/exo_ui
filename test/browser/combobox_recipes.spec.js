const { test, expect } = require("@playwright/test");

const {
  expectAttribute,
  expectPopoverState,
  gotoStory,
  story
} = require("./helpers/storybook");

async function openButtonCombobox(root, id) {
  const hook = root.locator(`#${id}-combobox`);
  const trigger = hook.locator('[data-exo-combobox="trigger"]');
  const popover = root.locator(`#${id}`);
  const search = popover.locator('[data-exo="combobox-search"]');

  await trigger.click();
  await expectPopoverState(popover, true);

  return { hook, trigger, popover, search };
}

async function chooseButtonCombobox(root, id, query, value) {
  const { popover, search } = await openButtonCombobox(root, id);
  const option = popover.locator(`[data-exo="combobox-option"][data-value="${value}"]`);

  await search.fill(query);
  await expect(option).toBeVisible();
  await option.click();
  await expectPopoverState(popover, false);
}

test.describe("combobox recipes", () => {
  test("covers client filtering, server filtering, clearable values, and submit state", async ({
    page
  }) => {
    await gotoStory(page, "/components/recipes/combobox_recipes");

    const canvas = story(page);
    const root = canvas.locator('[data-exo="combobox-recipes-workflow"]');
    const state = canvas.locator("#combobox-recipes-state");
    const assigneeValue = root.locator('input[name="recipe[assignee]"]');
    const remoteValue = root.locator('input[name="recipe[remote_user]"]');
    const cityValue = root.locator('input[name="recipe[city]"]');
    const assigneeTrigger = root.locator(
      '#combobox-recipe-assignee-combobox [data-exo-combobox="trigger"]'
    );
    const lockedTrigger = root.locator(
      '#combobox-recipe-locked-team-combobox [data-exo-combobox="trigger"]'
    );
    const submit = root.locator("#combobox-recipe-submit");

    await expectAttribute(root, "data-validation-state", "clean");
    await expectAttribute(root, "data-assignee", "maria");
    await expect(assigneeValue).toHaveValue("maria");
    await expect(remoteValue).toHaveValue("ana");
    await expect(lockedTrigger).toBeDisabled();

    const assignee = await openButtonCombobox(root, "combobox-recipe-assignee");
    const disabledOption = assignee.popover.locator(
      '[data-exo="combobox-option"][data-value="stefan"]'
    );
    await assignee.search.fill("stef");
    await expect(disabledOption).toBeVisible();
    await expect(disabledOption).toHaveAttribute("aria-disabled", "true");
    await disabledOption.evaluate((node) => {
      node.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    await expectAttribute(root, "data-assignee", "maria");
    await expect(assigneeValue).toHaveValue("maria");
    await expectPopoverState(assignee.popover, true);
    await page.keyboard.press("Escape");

    await root
      .locator('#combobox-recipe-assignee-combobox [data-exo="combobox-clear"]')
      .click();
    await expectAttribute(root, "data-validation-state", "invalid");
    await expectAttribute(root, "data-assignee", "");
    await expect(assigneeTrigger).toHaveAttribute("aria-invalid", "true");
    await expectAttribute(
      assigneeTrigger,
      "aria-describedby",
      "combobox-recipe-assignee-description combobox-recipe-assignee-error"
    );
    await expect(root.locator("#combobox-recipe-assignee-error")).toHaveText(
      "choose an assignee"
    );
    await expect(submit).toBeDisabled();

    await chooseButtonCombobox(root, "combobox-recipe-assignee", "nik", "nikola");
    await expectAttribute(root, "data-assignee", "nikola");
    await expectAttribute(root, "data-validation-state", "ready");

    const remote = await openButtonCombobox(root, "combobox-recipe-remote");
    const remoteStatus = root.locator("#combobox-recipe-remote-status");
    const maria = remote.popover.locator(
      '[data-exo="combobox-option"][data-value="maria"]'
    );
    await remote.search.fill("maria");
    await expectAttribute(root, "data-remote-query", "maria");
    await expect(remoteStatus).toContainText("1 remote users available");
    await expect(maria).toBeVisible();
    await maria.click();
    await expectAttribute(root, "data-remote-user", "maria");
    await expect(remoteValue).toHaveValue("maria");

    const cityHook = root.locator("#combobox-recipe-city-combobox");
    const cityInput = cityHook.locator('[data-exo-combobox="input-trigger"]');
    const cityPopover = root.locator("#combobox-recipe-city");
    const belgrade = cityPopover.locator('[data-exo="combobox-option"][data-value="bg"]');
    await cityInput.focus();
    await expectPopoverState(cityPopover, true);
    await cityInput.fill("bel");
    await expect(belgrade).toBeVisible();
    await belgrade.click();
    await expectAttribute(root, "data-city", "bg");
    await expect(cityValue).toHaveValue("bg");

    const tag = await openButtonCombobox(root, "combobox-recipe-tag");
    await tag.search.fill("urgent");
    await expect(tag.popover.locator('[data-exo="combobox-create"]')).toContainText("urgent");
    await page.keyboard.press("Escape");

    await expect(submit).not.toBeDisabled();
    await submit.click();
    await expectAttribute(root, "data-validation-state", "submitted");
    await expectAttribute(root, "data-submitted-count", "1");
    await expect(state).toHaveAttribute("data-last-action", "submitted combobox recipe");

    await root.getByRole("button", { name: "Reset comboboxes" }).click();
    await expectAttribute(root, "data-validation-state", "clean");
    await expectAttribute(root, "data-assignee", "nikola");
  });
});
