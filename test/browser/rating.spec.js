const { test, expect } = require("@playwright/test");

const { gotoStory, story } = require("./helpers/storybook");

test.describe("rating", () => {
  test("syncs clicked stars into the submitted hidden value", async ({ page }) => {
    await gotoStory(page, "/components/forms/rating");

    const canvas = story(page);
    const rating = canvas.locator("#rating-basic");
    const hidden = rating.locator('[data-exo="rating-value"]');

    await expect(rating).toHaveAttribute("data-ready", "");
    await expect(hidden).toHaveValue("3");

    await rating.locator('[data-exo="rating-star"]').nth(4).click();

    await expect(hidden).toHaveValue("5");
    await expect(rating.locator('[data-exo="rating-star"][data-active]')).toHaveCount(5);
  });
});
