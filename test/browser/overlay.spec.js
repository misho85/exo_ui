const { test, expect } = require("@playwright/test");

const { expectAttribute, expectFocused, gotoStory, story } = require("./helpers/storybook");

test.describe("overlay dialogs", () => {
  test("modal closes with Escape and syncs closed state", async ({ page }) => {
    await gotoStory(page, "/components/overlays/modal");

    const canvas = story(page);
    const modal = canvas.locator('[data-exo="modal"]');

    await expectAttribute(modal, "data-ready", "true");
    await expectAttribute(modal, "data-state", "open");

    await page.keyboard.press("Escape");

    await expectAttribute(modal, "data-state", "closed");
    await expect(modal).toHaveAttribute("aria-hidden", "true");
    await expect(modal).toHaveAttribute("inert", "true");
  });

  test("sheet closes with Escape and restores focus to its trigger", async ({ page }) => {
    await gotoStory(page, "/components/overlays/sheet");

    const canvas = story(page);
    const trigger = canvas.getByRole("button", { name: "Open right sheet" });
    const sheet = canvas.locator("#sheet-right");

    await expectAttribute(sheet, "data-ready", "true");

    await trigger.click();
    await expectAttribute(sheet, "data-state", "open");
    await expect(sheet).toHaveAttribute("aria-hidden", "false");

    await page.keyboard.press("Escape");

    await expectAttribute(sheet, "data-state", "closed");
    await expect(sheet).toHaveAttribute("aria-hidden", "true");
    await expectFocused(trigger);
  });

  test("drawer closes with Escape and restores focus to its trigger", async ({ page }) => {
    await gotoStory(page, "/components/overlays/drawer");

    const canvas = story(page);
    const trigger = canvas.getByRole("button", { name: "Open Right Drawer" });
    const drawer = canvas.locator("#drawer-right");

    await expectAttribute(drawer, "data-ready", "true");

    await trigger.click();
    await expectAttribute(drawer, "data-state", "open");
    await expect(drawer).toHaveAttribute("aria-hidden", "false");

    await page.keyboard.press("Escape");

    await expectAttribute(drawer, "data-state", "closed");
    await expect(drawer).toHaveAttribute("aria-hidden", "true");
    await expectFocused(trigger);
  });
});
