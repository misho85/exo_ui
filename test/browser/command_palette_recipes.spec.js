const { test, expect } = require("@playwright/test");

const {
  expectAttribute,
  expectFocused,
  gotoStory,
  story
} = require("./helpers/storybook");

async function expectWithinInert(locator, expected) {
  await expect
    .poll(async () =>
      locator.evaluate((node) => Boolean(node.inert || node.closest("[inert]")))
    )
    .toBe(expected);
}

test.describe("command palette recipes", () => {
  test("covers trigger, shortcut, filtering, disabled, empty, manual, and close=false commands", async ({
    page
  }) => {
    await gotoStory(page, "/components/recipes/command_palette_recipes");

    const canvas = story(page);
    const root = canvas.locator('[data-exo="command-palette-recipes-workflow"]');
    const state = canvas.locator("#command-palette-recipes-state");
    const trigger = root.locator("#command-recipe-open-primary");
    const manualTrigger = root.locator("#command-recipe-open-manual");
    const primary = canvas.locator("#command-recipe-primary");
    const manual = canvas.locator("#command-recipe-manual");
    const input = primary.locator('[data-exo="command-palette-input"]');
    const manualInput = manual.locator('[data-exo="command-palette-input"]');
    const risk = primary.locator('[data-exo="command-palette-item"][data-value="risk"]');
    const billing = primary.locator('[data-exo="command-palette-item"][data-value="billing"]');
    const disabled = primary.locator('[data-exo="command-palette-item"][data-value="deploy"]');
    const empty = primary.locator('[data-exo="command-palette-empty"]');
    const preview = manual.locator(
      '[data-exo="command-palette-item"][data-value="preview-export"]'
    );
    const applyExport = manual.locator(
      '[data-exo="command-palette-item"][data-value="apply-export"]'
    );

    await expectAttribute(root, "data-active-screen", "overview");
    await expectAttribute(primary, "data-state", "closed");
    await expectAttribute(manual, "data-state", "closed");
    await expect(primary).toHaveAttribute("data-shortcut", "ctrl+shift+k");
    await expect(manual).not.toHaveAttribute("data-shortcut", /.*/);

    await trigger.click();
    await expectAttribute(primary, "data-state", "open");
    await expect(primary).toHaveAttribute("aria-hidden", "false");
    await expect(primary).toHaveAttribute("data-overlay-stack-index", /\d+/);
    await expectFocused(input);
    await expectWithinInert(trigger, true);
    await expect(disabled).toHaveAttribute("aria-disabled", "true");
    await expect(disabled).toHaveAttribute("data-disabled", "true");

    await input.fill("risk");
    await expect(risk).toBeVisible();
    await expect(billing).toBeHidden();
    await expect(risk).toHaveAttribute("data-active", "true");
    const activeId = await risk.getAttribute("id");
    await expect(input).toHaveAttribute("aria-activedescendant", activeId);
    await input.press("Enter");
    await expectAttribute(primary, "data-state", "closed");
    await expectAttribute(root, "data-active-screen", "risk");
    await expectAttribute(root, "data-command-count", "1");
    await expect(state).toHaveAttribute("data-last-action", "ran Risk queue");
    await expectWithinInert(trigger, false);
    await expectFocused(trigger);

    await page.keyboard.press("Control+Shift+K");
    await expectAttribute(primary, "data-state", "open");
    await expectAttribute(manual, "data-state", "closed");
    await expectFocused(input);
    await input.fill("zzzz");
    await expect(empty).toBeVisible();
    await page.keyboard.press("Escape");
    await expectAttribute(primary, "data-state", "closed");

    await page.keyboard.press("Control+J");
    await expectAttribute(manual, "data-state", "closed");

    await manualTrigger.click();
    await expectAttribute(manual, "data-state", "open");
    await expectFocused(manualInput);
    await manualInput.fill("preview");
    await expect(preview).toHaveAttribute("data-active", "true");
    await manualInput.press("Enter");
    await expectAttribute(manual, "data-state", "open");
    await expectAttribute(root, "data-preview-count", "1");
    await expect(state).toHaveAttribute("data-last-action", "previewed export without closing");

    await manualInput.fill("apply");
    await expect(applyExport).toHaveAttribute("data-active", "true");
    await manualInput.press("Enter");
    await expectAttribute(manual, "data-state", "closed");
    await expectAttribute(root, "data-active-screen", "exports");
    await expectAttribute(root, "data-export-count", "1");
  });
});
