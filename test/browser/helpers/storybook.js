const { expect } = require("@playwright/test");

async function gotoStory(page, path) {
  await page.goto(path);
  await expect(page.locator("#story-live")).toBeVisible();
}

async function expectAttribute(locator, name, value) {
  await expect
    .poll(async () => locator.getAttribute(name))
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
