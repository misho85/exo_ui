const { test, expect } = require("@playwright/test");

const { expectAttribute, expectFocused, gotoStory, story } = require("./helpers/storybook");

test.describe("content structure components", () => {
  test("carousel exposes slide controls and updates disabled navigation state", async ({ page }) => {
    await gotoStory(page, "/components/layout/carousel");

    const canvas = story(page);
    const carousel = canvas.locator("#demo-carousel");
    const singleCarousel = canvas.locator("#single-carousel");
    const noControlsCarousel = canvas.locator("#no-controls-carousel");
    const viewport = carousel.locator("#demo-carousel-viewport");
    const prev = carousel.locator('[data-exo="carousel-prev"]');
    const next = carousel.locator('[data-exo="carousel-next"]');

    await expectAttribute(carousel, "aria-label", "Product highlights");
    await expectAttribute(viewport, "aria-live", "polite");
    await expect(carousel.locator("#demo-carousel-slide-1")).toHaveAttribute("aria-label", "Campaign overview");
    await expect(prev).toHaveAttribute("aria-controls", "demo-carousel-viewport");
    await expect(prev).toHaveAttribute("aria-disabled", "true");

    await next.click();

    await expect
      .poll(async () => await prev.getAttribute("aria-disabled"))
      .toBe("false");

    await expect(singleCarousel.locator('[data-exo="carousel-prev"]')).toBeDisabled();
    await expect(singleCarousel.locator('[data-exo="carousel-next"]')).toBeDisabled();
    await expect(noControlsCarousel.locator('[data-exo="carousel-prev"]')).toHaveCount(0);
    await expect(noControlsCarousel.locator('[data-exo="carousel-next"]')).toHaveCount(0);
  });

  test("breadcrumb and timeline expose current item semantics", async ({ page }) => {
    await gotoStory(page, "/components/navigation/breadcrumb");

    const canvas = story(page);
    const docsBreadcrumb = canvas.locator('[aria-label="Docs breadcrumb"]');

    await expect(docsBreadcrumb.locator('[data-exo="breadcrumb-separator"]').first()).toHaveAttribute(
      "aria-hidden",
      "true"
    );
    await expect(docsBreadcrumb.locator('[data-exo="breadcrumb-current"]')).toHaveAttribute(
      "aria-current",
      "page"
    );

    await gotoStory(page, "/components/data_display/timeline");

    const timeline = story(page).locator('[data-exo="timeline"]');
    const currentEvent = timeline.locator('[data-exo="timeline-event"][aria-current="step"]');

    await expectAttribute(timeline, "aria-label", "Order timeline");
    await expect(currentEvent.locator('[data-exo="timeline-title"]')).toHaveText("Shipped");
    await expect(timeline.locator("time").first()).toHaveAttribute("datetime", "2026-03-20");
  });

  test("scroll area viewport is focusable and labelled", async ({ page }) => {
    await gotoStory(page, "/components/layout/scroll_area");

    const canvas = story(page);
    const scrollArea = canvas.locator("#vertical-scroll");
    const viewport = canvas.locator("#vertical-scroll-viewport");

    await expectAttribute(scrollArea, "role", "region");
    await expectAttribute(scrollArea, "aria-label", "Scrollable item list");
    await expect(viewport).toHaveAttribute("tabindex", "0");

    await viewport.focus();
    await expectFocused(viewport);
  });
});
