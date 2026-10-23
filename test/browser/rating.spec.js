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

const { mountHook, fixture } = require('./helpers/hooks');

test('rating commits once per change, supports unnamed controls, and resets with its form', async ({ page }) => {
  await fixture(page, `<form>
    <div id="rating" data-exo="rating" data-value="1">
      <input type="hidden" data-exo="rating-value" value="1" name="rating">
      <label data-exo="rating-star"><input type="radio" data-exo="rating-input" name="stars" value="1" checked><span>One</span></label>
      <label data-exo="rating-star"><input type="radio" data-exo="rating-input" name="stars" value="2"><span>Two</span></label>
    </div><button type="reset">Reset</button></form>`);
  await mountHook(page, 'ExoRating', 'rating.js', '#rating');
  await page.evaluate(() => {
    window.ratingChanges = 0;
    document.querySelector('[data-exo="rating-value"]').addEventListener('change', () => window.ratingChanges++);
  });
  await page.getByText('Two', { exact: true }).click();
  expect(await page.evaluate(() => window.ratingChanges)).toBe(1);
  await expect(page.locator('#rating')).toHaveAttribute('data-value', '2');
  await page.getByRole('button', { name: 'Reset' }).click();
  await expect(page.locator('#rating')).toHaveAttribute('data-value', '1');
  await page.evaluate(() => {
    document.querySelector('[data-exo="rating-value"]').remove();
    window.testHooks['#rating'].updated();
  });
  await page.getByText('Two', { exact: true }).click();
  await expect(page.locator('#rating')).toHaveAttribute('data-value', '2');
  await expect(page.locator('[data-exo="rating-star"][data-active]')).toHaveCount(2);
});
