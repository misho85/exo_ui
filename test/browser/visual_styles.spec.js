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

    await gotoStory(page, "/components/layout/icon");

    const iconCanvas = story(page);
    const knownIcon = iconCanvas.locator('[data-exo="icon"]:not([data-missing-icon])').first();
    const missingIcon = iconCanvas.locator('[data-missing-icon="missing-icon"]').first();

    await expect(knownIcon).toHaveAttribute("aria-hidden", "true");
    await expect(knownIcon).toHaveAttribute("focusable", "false");
    await expect(knownIcon).toHaveCSS("width", "24px");
    await expect(missingIcon).toHaveAttribute("data-exo", "icon");
    await expect(missingIcon).toHaveCSS("width", "24px");
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
    const dotIndicator = story(page).locator('[data-exo="indicator"]').last();

    const indicatorDisplay = await indicator.evaluate(
      (node) => window.getComputedStyle(node).display
    );
    const dotIndicatorAfter = await dotIndicator.evaluate((node) => {
      const styles = window.getComputedStyle(node, "::after");

      return {
        content: styles.content,
        position: styles.position,
        width: styles.width
      };
    });

    await expect(indicator).toHaveCSS("position", "relative");
    expect(["flex", "inline-flex"]).toContain(indicatorDisplay);
    await expect(indicatorBadge).toHaveCSS("position", "absolute");
    expect(dotIndicatorAfter.content).toBe('""');
    expect(dotIndicatorAfter.position).toBe("absolute");
    expect(Number.parseFloat(dotIndicatorAfter.width)).toBeGreaterThan(6);

    await gotoStory(page, "/components/feedback/empty_state");

    const emptyStateIcon = story(page).locator('[data-exo="empty-state-icon"] [data-exo="icon"]').first();

    await expect(emptyStateIcon).toHaveCSS("width", "32px");

    await gotoStory(page, "/components/feedback/spinner");

    const spinner = story(page).locator('[data-exo="spinner"]').first();
    const spinnerSvg = spinner.locator("svg").first();

    await expect(spinner).toHaveAttribute("role", "status");
    await expect(spinnerSvg).toHaveAttribute("aria-hidden", "true");
    await expect(spinnerSvg).toHaveAttribute("focusable", "false");

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
