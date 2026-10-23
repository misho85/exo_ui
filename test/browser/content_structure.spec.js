const { test, expect } = require("@playwright/test");

const { expectAttribute, expectFocused, gotoStory, story } = require("./helpers/storybook");

test.describe("content structure components", () => {
  test("carousel exposes slide controls and updates disabled navigation state", async ({ page }) => {
    await gotoStory(page, "/components/layout/carousel");

    const canvas = story(page);
    const carouselId = "carousel-single-product-highlights";
    const carousel = canvas.locator(`#${carouselId}`);
    const singleCarousel = canvas.locator("#carousel-single-single-slide");
    const noControlsCarousel = canvas.locator("#carousel-single-without-controls");
    const viewport = carousel.locator(`#${carouselId}-viewport`);
    const prev = carousel.locator('[data-exo="carousel-prev"]');
    const next = carousel.locator('[data-exo="carousel-next"]');

    await expectAttribute(carousel, "aria-label", "Product highlights");
    await expectAttribute(viewport, "aria-live", "polite");
    await expect(carousel.locator(`#${carouselId}-slide-1`)).toHaveAttribute("aria-label", "Campaign overview");
    await expect(prev).toHaveAttribute("aria-controls", `${carouselId}-viewport`);
    await expect(prev).toHaveAttribute("aria-disabled", "true");
    await expect(prev.locator('[data-exo="icon"]')).toHaveCount(1);
    await expect(next.locator('[data-exo="icon"]')).toHaveCount(1);

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
    await expect(docsBreadcrumb.locator('[data-exo="breadcrumb-separator"] [data-exo="icon"]')).toHaveCount(1);
    await expect(docsBreadcrumb.locator('[data-exo="breadcrumb-current"]')).toHaveAttribute(
      "aria-current",
      "page"
    );

    await gotoStory(page, "/components/data_display/timeline");

    const timeline = story(page).getByRole("list", { name: "Order timeline" });
    const currentEvent = timeline.locator('[data-exo="timeline-event"][aria-current="step"]');

    await expectAttribute(timeline, "aria-label", "Order timeline");
    await expect(currentEvent.locator('[data-exo="timeline-title"]')).toHaveText("Shipped");
    await expect(timeline.locator("time").first()).toHaveAttribute("datetime", "2026-03-20");
  });

  test("scroll area viewport is focusable and labelled", async ({ page }) => {
    await gotoStory(page, "/components/layout/scroll_area");

    const canvas = story(page);
    const scrollArea = canvas.getByRole("region", { name: "Scrollable item list" });
    const viewport = scrollArea.locator('[data-exo="scroll-area-viewport"]');

    await expectAttribute(scrollArea, "role", "region");
    await expectAttribute(scrollArea, "aria-label", "Scrollable item list");
    await expect(viewport).toHaveAttribute("tabindex", "0");

    await viewport.focus();
    await expectFocused(viewport);
  });

  test("accordion and collapsible hide closed content from assistive tech", async ({ page }) => {
    await gotoStory(page, "/components/layout/accordion");

    const canvas = story(page);
    const defaultAccordion = canvas.locator('[data-exo="accordion"]').first();
    const firstTrigger = defaultAccordion.locator('[data-exo="accordion-trigger"]').first();
    const secondTrigger = defaultAccordion.locator('[data-exo="accordion-trigger"]').nth(1);
    const firstContent = defaultAccordion.locator('[data-exo="accordion-content"]').first();
    const secondContent = defaultAccordion.locator('[data-exo="accordion-content"]').nth(1);

    await expect(defaultAccordion).toHaveAttribute("data-ready", "");
    await expect(firstTrigger).toHaveAttribute("aria-expanded", "true");
    await expect(firstContent).toHaveAttribute("aria-hidden", "false");
    await expect(secondContent).toHaveAttribute("aria-hidden", "true");
    await expect
      .poll(async () => await secondContent.evaluate((node) => node.inert))
      .toBe(true);

    await secondTrigger.click();

    await expect(firstTrigger).toHaveAttribute("aria-expanded", "false");
    await expect(secondTrigger).toHaveAttribute("aria-expanded", "true");
    await expect(firstContent).toHaveAttribute("aria-hidden", "true");
    await expect(secondContent).toHaveAttribute("aria-hidden", "false");
    await expect
      .poll(async () => await firstContent.evaluate((node) => node.inert))
      .toBe(true);
    await expect
      .poll(async () => await secondContent.evaluate((node) => node.inert))
      .toBe(false);

    await gotoStory(page, "/components/layout/collapsible");

    const closedCollapsible = story(page)
      .locator('[data-exo="collapsible"]')
      .filter({ hasText: "Show advanced options" });
    const closedTrigger = closedCollapsible.getByRole("button", { name: "Show advanced options" });
    const closedContent = closedCollapsible.locator('[data-exo="collapsible-content"]');

    await expect(closedCollapsible).toHaveAttribute("data-ready", "");
    const triggerId = await closedTrigger.getAttribute("id");
    const contentId = await closedContent.getAttribute("id");

    expect(triggerId).toBeTruthy();
    expect(contentId).toBeTruthy();
    await expect(closedTrigger).toHaveAttribute("aria-controls", contentId);
    await expect(closedTrigger).toHaveAttribute("aria-expanded", "false");
    await expect(closedContent).toHaveAttribute("aria-labelledby", triggerId);
    await expect(closedContent).toHaveAttribute("aria-hidden", "true");
    await expect(closedTrigger.locator("button")).toHaveCount(0);

    await closedTrigger.click();

    await expect(closedTrigger).toHaveAttribute("aria-expanded", "true");
    await expect(closedContent).toHaveAttribute("aria-hidden", "false");
    await expect
      .poll(async () => await closedContent.evaluate((node) => node.inert))
      .toBe(false);
  });
});

const { mountHook, fixture } = require('./helpers/hooks');

test('nested accordions keep expansion and keyboard navigation within their own root', async ({ page }) => {
  await fixture(page, `
    <div id="outer" data-exo="accordion" data-type="single" data-collapsible>
      <div data-exo="accordion-item">
        <button id="outer-trigger" data-exo="accordion-trigger" aria-expanded="true" aria-controls="outer-content">Outer</button>
        <div id="outer-content" data-exo="accordion-content">
          <div data-exo="accordion-body">
            <div id="inner" data-exo="accordion" data-type="single" data-collapsible>
              <div data-exo="accordion-item">
                <button id="inner-trigger" data-exo="accordion-trigger" aria-expanded="false" aria-controls="inner-content">Inner</button>
                <div id="inner-content" data-exo="accordion-content"><div data-exo="accordion-body">Details</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div data-exo="accordion-item">
        <button id="sibling" data-exo="accordion-trigger" aria-expanded="false">Sibling</button>
      </div>
    </div>`);
  await mountHook(page, 'ExoAccordion', 'accordion.js', '#inner');
  await mountHook(page, 'ExoAccordion', 'accordion.js', '#outer');
  await page.locator('#inner-trigger').click();
  await expect(page.locator('#inner-trigger')).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#outer-trigger')).toHaveAttribute('aria-expanded', 'true');
  await page.locator('#inner-trigger').press('End');
  await expect(page.locator('#inner-trigger')).toBeFocused();
  await page.locator('#outer-trigger').click();
  await expect(page.locator('#outer-trigger')).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#inner-trigger')).toHaveAttribute('aria-expanded', 'true');
  await expect.poll(() => page.locator('#outer-content').evaluate(node => node.getBoundingClientRect().height)).toBe(0);
});

test('nested collapsibles do not toggle or visually expand their parent', async ({ page }) => {
  const inner = `<div id="inner" data-exo="collapsible">
    <input type="checkbox" data-exo="collapsible-state" checked>
    <button id="inner-trigger" data-exo="collapsible-trigger">Inner</button>
    <div data-exo="collapsible-content">Inner details</div></div>`;
  await fixture(page, `<div id="outer" data-exo="collapsible">
    <input type="checkbox" data-exo="collapsible-state" checked>
    <button id="outer-trigger" data-exo="collapsible-trigger">Outer</button>
    <div id="outer-content" data-exo="collapsible-content">${inner}</div></div>`);
  await mountHook(page, 'ExoCollapsible', 'collapsible.js', '#inner');
  await mountHook(page, 'ExoCollapsible', 'collapsible.js', '#outer');
  await page.locator('#inner-trigger').click();
  await expect(page.locator('#outer-trigger')).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#inner-trigger')).toHaveAttribute('aria-expanded', 'false');
  await page.locator('#inner-trigger').click();
  await page.locator('#outer-trigger').click();
  await expect.poll(() => page.locator('#outer-content').evaluate(node => node.getBoundingClientRect().height)).toBe(0);
});

test('carousel respects reduced motion, input keys, RTL, and updated controls', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await fixture(page, `<div id="carousel" data-exo="carousel" style="width:300px;margin:30px" tabindex="0">
    <div data-exo="carousel-viewport"><div data-exo="carousel-track">
      <div data-exo="carousel-slide"><input value="hello"></div>
      <div data-exo="carousel-slide">Second</div>
    </div></div>
    <button data-exo="carousel-prev">Previous</button><button data-exo="carousel-next">Next</button></div>`);
  await mountHook(page, 'ExoCarousel', 'carousel.js', '#carousel');
  const viewport = page.locator('[data-exo="carousel-viewport"]');
  await page.locator('input').press('ArrowRight');
  expect(await viewport.evaluate(node => node.scrollLeft)).toBe(0);
  await page.evaluate(() => {
    const next = document.querySelector('[data-exo="carousel-next"]');
    next.replaceWith(next.cloneNode(true));
    window.testHooks['#carousel'].updated();
    const viewport = document.querySelector('[data-exo="carousel-viewport"]');
    const scrollBy = viewport.scrollBy.bind(viewport);
    viewport.scrollBy = options => { window.scrollBehavior = options.behavior; scrollBy(options); };
  });
  await page.locator('[data-exo="carousel-next"]').click();
  await expect(page.locator('[data-exo="carousel-next"]')).toBeDisabled();
  expect(await page.evaluate(() => window.scrollBehavior)).toBe('instant');
  await page.evaluate(() => {
    document.querySelector('#carousel').dir = 'rtl';
    document.querySelector('[data-exo="carousel-viewport"]').scrollLeft = 0;
    window.testHooks['#carousel'].updated();
  });
  await page.locator('[data-exo="carousel-next"]').click();
  await expect.poll(() => viewport.evaluate(node => node.scrollLeft)).toBeLessThan(0);
  await page.evaluate(() => {
    document.querySelector('[data-exo="carousel-slide"]:last-child').remove();
    document.querySelector('#carousel').setAttribute('data-loop', '');
    window.testHooks['#carousel'].updated();
  });
  await expect(page.locator('[data-exo="carousel-next"]')).toBeDisabled();
  await expect(page.locator('[data-exo="carousel-prev"]')).toBeDisabled();
});
