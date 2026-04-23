const { test, expect } = require("@playwright/test");

const { expectAttribute, gotoStory, story } = require("./helpers/storybook");

test.describe("hover card", () => {
  test("opens on hover and closes on mouse leave", async ({ page }) => {
    await gotoStory(page, "/components/hover_card");

    const canvas = story(page);
    const trigger = canvas.locator("#hc-demo [data-exo=\"hover-card-trigger\"]");
    const content = canvas.locator("#hc-demo [data-exo=\"hover-card-content\"]");

    await expect(content).not.toHaveAttribute("data-open", "");

    await trigger.hover();
    await expectAttribute(content, "data-open", "");

    await page.mouse.move(0, 0);
    await expect
      .poll(async () => content.getAttribute("data-open"))
      .toBe(null);
  });
});
