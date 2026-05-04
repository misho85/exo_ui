const { test, expect } = require("@playwright/test");

const { expectAttribute, expectFocused, gotoStory, story } = require("./helpers/storybook");

test.describe("menubar", () => {
  test("opens menus with pointer and closes with outside click", async ({ page }) => {
    await gotoStory(page, "/components/menus/menubar");

    const canvas = story(page);
    const menubar = canvas.locator("#demo-menubar");
    const file = canvas.locator("#demo-menubar-trigger-0");
    const fileMenu = canvas.locator("#demo-menubar-content-0");

    await expectAttribute(menubar, "data-ready", "true");
    await expect(fileMenu).toBeHidden();

    await file.click();

    await expect(fileMenu).toBeVisible();
    await expect(file).toHaveAttribute("aria-expanded", "true");

    await page.mouse.click(20, 20);

    await expect(fileMenu).toBeHidden();
    await expect(file).toHaveAttribute("aria-expanded", "false");
  });

  test("supports trigger and menu keyboard navigation", async ({ page }) => {
    await gotoStory(page, "/components/menus/menubar");

    const canvas = story(page);
    const file = canvas.locator("#demo-menubar-trigger-0");
    const edit = canvas.locator("#demo-menubar-trigger-1");
    const fileMenu = canvas.locator("#demo-menubar-content-0");
    const editMenu = canvas.locator("#demo-menubar-content-1");
    const newFile = fileMenu.getByRole("menuitem", { name: "New File" });
    const save = fileMenu.getByRole("menuitem", { name: "Save" });
    const undo = editMenu.getByRole("menuitem", { name: "Undo" });

    await expectAttribute(canvas.locator("#demo-menubar"), "data-ready", "true");
    await file.focus();
    await expectFocused(file);

    await page.keyboard.press("ArrowRight");
    await expectFocused(edit);

    await page.keyboard.press("ArrowLeft");
    await expectFocused(file);

    await page.keyboard.press("ArrowDown");
    await expect(fileMenu).toBeVisible();
    await expectFocused(newFile);

    await page.keyboard.press("ArrowDown");
    await expectFocused(save);

    await page.keyboard.press("ArrowRight");
    await expect(fileMenu).toBeHidden();
    await expect(editMenu).toBeVisible();
    await expectFocused(undo);

    await page.keyboard.press("Escape");
    await expect(editMenu).toBeHidden();
    await expectFocused(edit);
  });
});
