const { test, expect } = require("@playwright/test");

const { gotoStory, story } = require("./helpers/storybook");

test.describe("rating", () => {
  test("syncs clicked stars into the submitted hidden value", async ({ page }) => {
    await gotoStory(page, "/components/forms/rating");

    const canvas = story(page);
    const rating = canvas.getByRole("radiogroup", { name: "Product rating" });
    const hidden = rating.locator('[data-exo="rating-value"]');
    const ratingId = await rating.getAttribute("id");

    await expect(rating).toHaveAttribute("data-ready", "");
    await expect(rating).toHaveAttribute("role", "radiogroup");
    await expect(rating).toHaveAttribute("aria-labelledby", `${ratingId}-label`);
    await expect(rating).toHaveAttribute("aria-describedby", `${ratingId}-description`);
    await expect(hidden).toHaveValue("3");

    await rating.locator('[data-exo="rating-star"]').nth(4).click();

    await expect(hidden).toHaveValue("5");
    await expect(rating.locator('[data-exo="rating-star"][data-active]')).toHaveCount(5);

    const fourthInput = rating.locator('[data-exo="rating-input"]').nth(3);
    await fourthInput.focus();
    await page.keyboard.press("Space");

    await expect(hidden).toHaveValue("4");
    await expect(rating.locator('[data-exo="rating-star"][data-active]')).toHaveCount(4);
    await expect
      .poll(async () =>
        fourthInput.evaluate((node) => getComputedStyle(node.nextElementSibling).outlineStyle)
      )
      .toBe("solid");

    const errorRating = canvas.getByRole("radiogroup", { name: "Support rating" });
    const errorRatingId = await errorRating.getAttribute("id");

    await expect(errorRating).toHaveAttribute("aria-invalid", "true");
    await expect(errorRating).toHaveAttribute(
      "aria-describedby",
      `${errorRatingId}-description ${errorRatingId}-error`
    );
    await expect(canvas.locator(`#${errorRatingId}-error`)).toHaveAttribute("role", "alert");
  });
});
