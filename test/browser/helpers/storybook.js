const { expect } = require("@playwright/test");

const STORYBOOK_CONNECTION_TIMEOUT = Number.parseInt(
  process.env.STORYBOOK_CONNECTION_TIMEOUT || "60000",
  10
);

async function gotoStory(page, path) {
  await page.goto(path, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await expect(page.locator("#story-live")).toBeVisible();
  await expect(page.locator("[data-phx-main]").first()).toHaveClass(/phx-connected/, {
    timeout: STORYBOOK_CONNECTION_TIMEOUT
  });
}

async function expectAttribute(locator, name, value) {
  await expect
    .poll(async () => await locator.getAttribute(name))
    .toBe(value);
}

function story(page) {
  return page.locator("#story-live");
}

async function expectPopoverState(locator, open) {
  await expect
    .poll(async () => locator.evaluate((node) => node.matches(":popover-open")))
    .toBe(open);
}

async function expectFocused(locator) {
  await expect
    .poll(async () => locator.evaluate((node) => node === document.activeElement))
    .toBe(true);
}

async function expectHiddenState(locator, hidden) {
  await expect
    .poll(async () => locator.evaluate((node) => node.hidden))
    .toBe(hidden);
}

module.exports = {
  expectAttribute,
  expectFocused,
  expectHiddenState,
  expectPopoverState,
  gotoStory,
  story
};
