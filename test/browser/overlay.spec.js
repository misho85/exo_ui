const { test, expect } = require("@playwright/test");

const { expectAttribute, expectFocused, gotoStory, story } = require("./helpers/storybook");

async function expectWithinInert(locator, expected) {
  await expect
    .poll(async () =>
      locator.evaluate((node) => Boolean(node.inert || node.closest("[inert]")))
    )
    .toBe(expected);
}

test.describe("overlay dialogs", () => {
  test("modal traps keyboard focus and closes with Escape", async ({ page }) => {
    await gotoStory(page, "/components/overlays/modal");

    const canvas = story(page);
    const modal = canvas.locator("#modal-single-default");
    const labelledModal = canvas.locator("#modal-single-labelled-without-title");
    const closedModal = canvas.locator("#modal-single-closed");
    const dialog = modal.locator('[data-exo="modal-content"]');
    const closeButton = dialog.locator('[data-exo="modal-close"]');
    const saveButton = dialog.getByRole("button", { name: "Save" });
    const modalId = await modal.getAttribute("id");

    await expectAttribute(modal, "data-ready", "true");
    await expectAttribute(modal, "data-state", "open");
    await expect(dialog).toHaveAttribute("aria-labelledby", `${modalId}-title`);
    await expect(dialog).toHaveAttribute("aria-describedby", `${modalId}-body`);
    await expect(dialog.locator('[data-exo="modal-close"]')).toHaveAttribute("type", "button");
    await expect(labelledModal.locator('[data-exo="modal-content"]')).toHaveAttribute(
      "aria-label",
      "Invite teammate dialog"
    );
    await expect(closedModal).toHaveAttribute("data-state", "closed");
    await expect(closedModal).toHaveAttribute("aria-hidden", "true");
    await expectFocused(closeButton);

    await page.keyboard.press("Shift+Tab");
    await expectFocused(saveButton);

    await page.keyboard.press("Tab");
    await expectFocused(closeButton);

    await page.keyboard.press("Escape");

    await expectAttribute(modal, "data-state", "closed");
    await expect(modal).toHaveAttribute("aria-hidden", "true");
    await expect(modal).toHaveAttribute("inert", "true");
  });

  test("sheet traps focus, closes with Escape, and restores focus to its trigger", async ({ page }) => {
    await gotoStory(page, "/components/overlays/sheet");

    const canvas = story(page);
    const trigger = canvas.locator("button", { hasText: "Open right sheet" }).first();
    const sheet = canvas.locator("#sheet-right");
    const topSheet = canvas.locator("#sheet-top");
    const bottomSheet = canvas.locator("#sheet-bottom");
    const dialog = sheet.locator('[data-exo="sheet-content"]');

    await expectAttribute(sheet, "data-ready", "true");
    await expect(dialog).toHaveAttribute("aria-labelledby", "sheet-right-title");
    await expect(dialog).toHaveAttribute("aria-describedby", "sheet-right-body");
    await expect(topSheet).toHaveAttribute("data-side", "top");
    await expect(bottomSheet).toHaveAttribute("data-side", "bottom");
    await expect(bottomSheet.locator('[data-exo="sheet-content"]')).toHaveAttribute(
      "aria-label",
      "Mobile actions"
    );

    await trigger.click();
    await expectAttribute(sheet, "data-state", "open");
    await expect(sheet).toHaveAttribute("aria-hidden", "false");
    await expectWithinInert(trigger, true);

    const closeButton = dialog.locator('[data-exo="sheet-close"]');
    const cancelButton = dialog.getByRole("button", { name: "Cancel" });
    const saveButton = dialog.getByRole("button", { name: "Save" });
    await expectFocused(cancelButton);

    await page.keyboard.press("Shift+Tab");
    await expectFocused(closeButton);

    await page.keyboard.press("Tab");
    await expectFocused(cancelButton);

    await page.keyboard.press("Tab");
    await expectFocused(saveButton);

    await page.keyboard.press("Escape");

    await expectAttribute(sheet, "data-state", "closed");
    await expect(sheet).toHaveAttribute("aria-hidden", "true");
    await expectWithinInert(trigger, false);
    await expectFocused(trigger);
  });

  test("sheet Escape handling is scoped to the topmost open overlay", async ({ page }) => {
    await gotoStory(page, "/components/overlays/sheet");

    const canvas = story(page);
    const trigger = canvas.locator("button", { hasText: "Open right sheet" }).first();
    const rightSheet = canvas.locator("#sheet-right");
    const leftSheet = canvas.locator("#sheet-left");

    await trigger.click();
    await expectAttribute(rightSheet, "data-state", "open");

    await leftSheet.evaluate((node) => {
      node.dataset.state = "open";
      node.setAttribute("aria-hidden", "false");
      node.removeAttribute("inert");
      node.style.display = "block";
      node.classList.add("open");
    });

    await expectAttribute(leftSheet, "data-state", "open");
    await expect(leftSheet).toHaveAttribute("aria-hidden", "false");
    await expectFocused(leftSheet.locator('[data-exo="sheet-close"]'));

    await page.keyboard.press("Escape");

    await expectAttribute(leftSheet, "data-state", "closed");
    await expectAttribute(rightSheet, "data-state", "open");

    await page.keyboard.press("Escape");

    await expectAttribute(rightSheet, "data-state", "closed");
    await expectFocused(trigger);
  });

  test("drawer traps focus, closes with Escape, and restores focus to its trigger", async ({ page }) => {
    await gotoStory(page, "/components/overlays/drawer");

    const canvas = story(page);
    const trigger = canvas.locator("button", { hasText: "Open Right Drawer" }).first();
    const drawer = canvas.locator("#drawer-right");
    const labelledDrawer = canvas.locator("#drawer-labelled");
    const dialog = drawer.locator('[data-exo="drawer-content"]');

    await expectAttribute(drawer, "data-ready", "true");
    await expect(dialog).toHaveAttribute("aria-labelledby", "drawer-right-title");
    await expect(dialog).toHaveAttribute("aria-describedby", "drawer-right-body");
    await expect(labelledDrawer.locator('[data-exo="drawer-content"]')).toHaveAttribute(
      "aria-label",
      "Filters drawer"
    );

    await trigger.click();
    await expectAttribute(drawer, "data-state", "open");
    await expect(drawer).toHaveAttribute("aria-hidden", "false");
    await expectWithinInert(trigger, true);

    const closeButton = dialog.locator('[data-exo="drawer-close"]');
    await expectFocused(closeButton);

    await page.keyboard.press("Tab");
    await expectFocused(closeButton);

    await page.keyboard.press("Shift+Tab");
    await expectFocused(closeButton);

    await page.keyboard.press("Escape");

    await expectAttribute(drawer, "data-state", "closed");
    await expect(drawer).toHaveAttribute("aria-hidden", "true");
    await expectWithinInert(trigger, false);
    await expectFocused(trigger);
  });
});
