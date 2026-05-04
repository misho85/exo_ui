const { test, expect } = require("@playwright/test");

const { gotoStory, story } = require("./helpers/storybook");

test.describe("component visual styles", () => {
  test("navigation and layout components load their component CSS", async ({ page }) => {
    await gotoStory(page, "/components/navigation/navbar");

    const canvas = story(page);
    const navbar = canvas.locator('[data-exo="navbar"]').first();
    const navbarCenter = canvas.locator('[data-exo="navbar-center"]').first();

    await expect(navbar).toHaveCSS("display", "flex");
    await expect(navbar).toHaveCSS("border-top-style", "solid");
    await expect(navbar).toHaveCSS("font-family", /.+/);
    await expect(navbarCenter).toHaveCSS("display", "flex");

    await gotoStory(page, "/components/layout/footer");

    const footer = story(page).locator('[data-exo="footer"]').first();
    const footerColumns = story(page).locator('[data-exo="footer-columns"]').first();

    await expect(footer).toHaveCSS("display", "flex");
    await expect(footer).toHaveCSS("border-top-style", "solid");
    await expect(footerColumns).toHaveCSS("display", "grid");

    await gotoStory(page, "/components/navigation/bottom_nav");

    const bottomNav = story(page).locator('[data-exo="bottom-nav"]').first();
    const bottomNavItem = bottomNav.locator('[data-exo="bottom-nav-item"]').first();

    await expect(bottomNav).toHaveCSS("display", "grid");
    await expect(bottomNav).toHaveCSS("border-top-style", "solid");
    await expect(bottomNavItem).toHaveCSS("text-decoration-line", "none");
  });

  test("data display and feedback components load their component CSS", async ({ page }) => {
    await gotoStory(page, "/components/layout/hero");

    const hero = story(page).locator('[data-exo="hero"]').first();
    const heroTitle = hero.locator('[data-exo="hero-title"]').first();

    await expect(hero).toHaveCSS("display", "grid");
    await expect(hero).toHaveCSS("overflow", "hidden");
    await expect(heroTitle).toHaveCSS("margin-top", "0px");

    await gotoStory(page, "/components/data_display/chat_bubble");

    const incomingChat = story(page).locator('[data-exo="chat-bubble"]').first();
    const outgoingChat = story(page).locator('[data-exo="chat-bubble"][data-side="end"]').first();
    const chatContent = incomingChat.locator('[data-exo="chat-bubble-content"]').first();

    await expect(incomingChat).toHaveCSS("display", "flex");
    await expect(outgoingChat).toHaveCSS("flex-direction", "row-reverse");

    const chatLineHeight = await chatContent.evaluate(
      (node) => window.getComputedStyle(node).lineHeight
    );
    expect(Number.parseFloat(chatLineHeight)).toBeGreaterThan(0);

    await gotoStory(page, "/components/feedback/indicator");

    const indicator = story(page).locator('[data-exo="indicator"]').first();
    const indicatorBadge = indicator.locator('[data-exo="indicator-badge"]').first();

    const indicatorDisplay = await indicator.evaluate(
      (node) => window.getComputedStyle(node).display
    );

    await expect(indicator).toHaveCSS("position", "relative");
    expect(["flex", "inline-flex"]).toContain(indicatorDisplay);
    await expect(indicatorBadge).toHaveCSS("position", "absolute");

    await gotoStory(page, "/components/feedback/radial_progress");

    const radialProgress = story(page).locator('[data-exo="radial-progress"]').first();
    const radialBox = await radialProgress.boundingBox();
    const radialDisplay = await radialProgress.evaluate(
      (node) => window.getComputedStyle(node).display
    );

    expect(["grid", "inline-grid"]).toContain(radialDisplay);
    expect(radialBox.width).toBeGreaterThan(40);
    expect(radialBox.height).toBeGreaterThan(40);
  });
});
