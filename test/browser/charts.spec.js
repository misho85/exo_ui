const { expect, test } = require("@playwright/test");
const { gotoStory, story } = require("./helpers/storybook");

test.describe("chart components", () => {
  test("cartesian charts expose accessible SVG semantics", async ({ page }) => {
    await gotoStory(page, "/components/charts/bar_charts/bar_chart");

    const chart = story(page).locator('[data-exo="bar-chart"]');
    await expect(chart).toHaveAttribute("role", "img");
    await expect(chart).toHaveAttribute("aria-label", "Bar chart");
    await expect(chart.locator("title").first()).toHaveText("Bar chart");
  });

  test("radial charts expose accessible SVG semantics", async ({ page }) => {
    await gotoStory(page, "/components/charts/donut_chart");

    const chart = story(page).locator('[data-exo="donut-chart"]');
    await expect(chart).toHaveAttribute("role", "img");
    await expect(chart).toHaveAttribute("aria-label", "Donut chart");
    await expect(chart.locator("title").first()).toHaveText("Donut chart");
  });

  test("sparkline and trend badge expose accessible names", async ({ page }) => {
    await gotoStory(page, "/components/charts/sparkline");

    await expect(story(page).locator('[data-exo="sparkline"]')).toHaveCount(2);
    await expect(story(page).locator('[data-exo="sparkline"]').first()).toHaveAttribute(
      "role",
      "img"
    );
    await expect(story(page).locator('[data-exo="trend-badge"]').first()).toHaveAttribute(
      "aria-label",
      "Up 14.3%"
    );
  });

  test("progress bars expose bounded progress semantics", async ({ page }) => {
    await gotoStory(page, "/components/charts/progress_bar");

    const progressBars = story(page).locator('[data-exo="progress-bar"]');
    await expect(progressBars).toHaveCount(3);
    await expect(progressBars.first()).toHaveAttribute("role", "progressbar");
    await expect(progressBars.first()).toHaveAttribute("aria-valuemin", "0");
    await expect(progressBars.first()).toHaveAttribute("aria-valuemax", "305");
  });
});
