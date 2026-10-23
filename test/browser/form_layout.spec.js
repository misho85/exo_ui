const { test, expect } = require("@playwright/test");

const { expectFocused, expectHiddenState, gotoStory, story } = require("./helpers/storybook");

// TRG-744: record form layout, optional field chip and unsaved-changes bar.
test.describe("form layout", () => {
  test("aside sits beside the main column when wide and under it when narrow", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoStory(page, "/components/forms/form_layout");

    const canvas = story(page);
    const layout = canvas.locator('[data-exo="form-layout"]').first();
    const main = layout.locator('[data-exo="form-layout-main"]');
    const aside = layout.locator('[data-exo="form-layout-aside"]');

    // The story canvas widens after the first paint, so the columns are
    // polled until the container query has applied.
    await expect
      .poll(async () => {
        const m = await main.boundingBox();
        const a = await aside.boundingBox();
        return a.x >= m.x + m.width - 1 && Math.abs(a.y - m.y) < 2;
      })
      .toBe(true);

    await layout.evaluate((node) => {
      node.style.width = "360px";
    });

    const narrowMain = await main.boundingBox();
    const narrowAside = await aside.boundingBox();
    expect(narrowAside.y).toBeGreaterThan(narrowMain.y + narrowMain.height - 1);
    expect(Math.abs(narrowAside.x - narrowMain.x)).toBeLessThan(2);
    expect(await layout.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
  });

  test("a closed optional field opens on click, focuses its field and stays in the form", async ({
    page
  }) => {
    await gotoStory(page, "/components/forms/optional_field");

    const canvas = story(page);
    const closed = canvas.locator('[data-exo="optional-field"]').filter({
      has: page.locator('[name="compare_at_price"]')
    });
    const chip = closed.locator('[data-exo="optional-field-chip"]');
    const content = closed.locator('[data-exo="optional-field-content"]');

    await expect(chip).toBeVisible();
    await expect(chip).toHaveAccessibleName(/Compare-at price/);
    await expectHiddenState(content, true);

    await chip.click();

    await expectHiddenState(chip, true);
    await expectHiddenState(content, false);
    await expectFocused(content.locator('[name="compare_at_price"]'));

    // In a wrapping row of chips the opened field takes the whole row.
    const row = await closed.evaluate((node) => {
      const parent = node.parentElement;
      parent.style.display = "flex";
      parent.style.flexWrap = "wrap";
      parent.style.padding = "0";
      return [node.getBoundingClientRect().width, parent.clientWidth];
    });
    expect(Math.abs(row[0] - row[1])).toBeLessThan(2);

    const open = canvas.locator('[data-exo="optional-field"]').filter({
      has: page.locator('[name="hs_code"]')
    });
    await expectHiddenState(open.locator('[data-exo="optional-field-chip"]'), true);
    await expect(open.locator('[name="hs_code"]')).toBeVisible();
  });

  test("the save bar names itself and its save button submits the form", async ({ page }) => {
    await gotoStory(page, "/components/forms/save_bar");

    const canvas = story(page);
    const bar = canvas.locator('[data-exo="save-bar"]');

    await expect(bar).toBeVisible();
    await expect(page.getByRole("region", { name: "Unsaved changes" })).toBeVisible();
    await expect(bar.getByRole("button", { name: "Discard" })).toHaveAttribute("type", "button");

    const save = bar.getByRole("button", { name: "Save" });
    await expect(save).toHaveAttribute("type", "submit");
    await expect(save).toHaveAttribute("form", "save-bar-demo-form");
  });
});
