const { test, expect } = require("@playwright/test");

const { focusedMenuItem } = require("./helpers/focus");
const {
  expectAttribute,
  expectFocused,
  expectHiddenState,
  expectPopoverState,
  gotoStory,
  story
} = require("./helpers/storybook");

test.describe("combobox", () => {
  test("filters client-side options and commits the selected value", async ({ page }) => {
    await gotoStory(page, "/components/forms/combobox");

    const canvas = story(page);
    const comboboxId = "combobox-single-client-filter";
    const root = canvas.locator(`#${comboboxId}-combobox`);
    const trigger = root.locator("[data-exo-combobox=\"trigger\"]");
    const popover = canvas.locator(`#${comboboxId}`);
    const search = canvas.locator(`#${comboboxId} [data-exo="combobox-search"]`);
    const listbox = canvas.locator(`#${comboboxId}-listbox`);
    const status = canvas.locator(`#${comboboxId}-status`);
    const croatia = canvas.locator(`#${comboboxId} [data-exo="combobox-option"][data-value="hr"]`);
    const serbia = canvas.locator(`#${comboboxId} [data-exo="combobox-option"][data-value="rs"]`);
    const value = canvas.locator("input[name=\"country\"]");

    await expectAttribute(root, "data-ready", "");
    await expectAttribute(search, "aria-expanded", "false");
    await trigger.click();

    await expectPopoverState(popover, true);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    await search.fill("cro");
    await expect(croatia).toBeVisible();
    await expectHiddenState(serbia, true);
    await expectFocused(search);
    await expect(search).toHaveAttribute("aria-activedescendant", await croatia.getAttribute("id"));
    await expect(listbox).toHaveAttribute("aria-activedescendant", await croatia.getAttribute("id"));
    await expect(croatia).toHaveAttribute("data-active", "");
    await expect(status).toHaveText("1 result available");

    await page.keyboard.press("Enter");

    await expectPopoverState(popover, false);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(value).toHaveValue("hr");
    await expect(trigger.locator("[data-exo=\"combobox-value\"]")).toHaveText("Croatia");
  });

  test("the active option has a ring that stands 3:1 off the list, in light and dark", async ({ page }) => {
    await gotoStory(page, "/components/forms/combobox");

    const canvas = story(page);
    const comboboxId = "combobox-single-with-value";
    const root = canvas.locator(`#${comboboxId}-combobox`);
    const trigger = root.locator("[data-exo-combobox=\"trigger\"]");
    const popover = canvas.locator(`#${comboboxId}`);
    const search = canvas.locator(`#${comboboxId} [data-exo="combobox-search"]`);
    const options = popover.locator('[data-exo="combobox-option"]');
    const list = '[data-exo="popover-content"]';

    await expectAttribute(root, "data-ready", "");
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expectPopoverState(popover, true);
    await expectFocused(search);

    // Focus stays in the search field; the option the arrow keys reached is
    // the active descendant, marked data-active. Until TRG-496 it carried only
    // the hover fill: --exo-secondary on the list's --exo-card, 1.12:1 in
    // trg24's light theme and 1.08:1 in its dark one, with `outline: none`.
    const results = [];

    // The list opens on the chosen first option, and ArrowDown wraps from the
    // last one back to it. Home and End move the caret in the search field.
    for (const theme of ["light", "dark"]) {
      for (let index = 0; index < (await options.count()); index++) {
        if (results.length > 0) await page.keyboard.press("ArrowDown");
        await expect(search).toHaveAttribute("aria-activedescendant", await options.nth(index).getAttribute("id"));
        results.push({ theme, ...(await focusedMenuItem(page, { menu: list, theme })) });
      }
    }

    // The mouse resting on the active option keeps its ring: the hover rule
    // used to set `outline: none` and would take it away.
    await options.last().hover();
    results.push({ theme: "dark", hovered: true, ...(await focusedMenuItem(page, { menu: list, theme: "dark" })) });

    expect(results.map(({ theme, name, hovered }) => `${theme}: ${name}${hovered ? " (hover)" : ""}`)).toEqual([
      "light: Elixir",
      "light: Rust",
      "light: Go",
      "light: Python",
      "dark: Elixir",
      "dark: Rust",
      "dark: Go",
      "dark: Python",
      "dark: Python (hover)"
    ]);
    // The theme reached the list: two different card colours were measured.
    expect(new Set(results.map(({ card }) => card)).size).toBe(2);

    for (const result of results) {
      const label = `${result.theme}, ${result.name}${result.hovered ? " (hover)" : ""}`;
      expect(result.focusVisible, `${label}: the search field has keyboard focus`).toBe(true);
      expect(result.active, label).toBe(true);
      expect(result.outlineStyle, label).toBe("solid");
      expect(result.outlineWidth, label).toBeGreaterThanOrEqual(2);
      // Inside the option: the list's padding and the gap between options are
      // narrower than a ring drawn outside it.
      expect(result.outlineOffset, label).toBeLessThanOrEqual(-result.outlineWidth);
      expect(result.ringOnMenu, `${label}: ring on the list`).toBeGreaterThanOrEqual(3);
      expect(result.ringOnIdle, `${label}: ring against an option that is not active`).toBeGreaterThanOrEqual(3);
      expect(result.ringOnFill, `${label}: ring on the option's own fill`).toBeGreaterThanOrEqual(3);
    }
  });

  test("shows the empty state when client filtering removes every option", async ({ page }) => {
    await gotoStory(page, "/components/forms/combobox");

    const canvas = story(page);
    const comboboxId = "combobox-single-empty-state";
    const root = canvas.locator(`#${comboboxId}-combobox`);
    const trigger = root.locator("[data-exo-combobox=\"trigger\"]");
    const popover = canvas.locator(`#${comboboxId}`);
    const search = canvas.locator(`#${comboboxId} [data-exo="combobox-search"]`);
    const empty = canvas.locator(`#${comboboxId} [data-exo="combobox-empty"]`);
    const status = canvas.locator(`#${comboboxId}-status`);

    await expectAttribute(root, "data-ready", "");
    await expectAttribute(search, "aria-expanded", "false");
    await trigger.click();

    await expectPopoverState(popover, true);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expectFocused(search);
    await search.fill("zzz");

    await expect(empty).toBeVisible();
    await expect(search).toHaveValue("zzz");
    await expect(search).not.toHaveAttribute("aria-activedescendant", /.+/);
    await expect(status).toHaveAttribute("role", "status");
    await expect(status).toHaveAttribute("aria-live", "polite");
    await expect(status).toHaveText("No results found");
  });

  test("documents grouped, creatable, loading, clearable, and disabled states", async ({ page }) => {
    await gotoStory(page, "/components/forms/combobox");

    const canvas = story(page);
    const groupedId = "combobox-single-grouped-options";
    const grouped = canvas.locator(`#${groupedId}-combobox`);
    const clear = grouped.locator("[data-exo=\"combobox-clear\"]");
    const groupedTrigger = grouped.locator("[data-exo-combobox=\"trigger\"]");
    const groupedValue = canvas.locator("input[name=\"assignee\"]");
    const selected = canvas.locator(`#${groupedId} [data-exo="combobox-option"][data-value="maria"]`);
    const disabledOption = canvas.locator(`#${groupedId} [data-exo="combobox-option"][data-value="stefan"]`);

    await expectAttribute(grouped, "data-ready", "");
    await expect(groupedTrigger).toHaveAccessibleName("Assignee Maria Ilic");
    await expect(selected).toHaveAttribute("aria-selected", "true");
    await expect(disabledOption).toHaveAttribute("data-disabled", "");
    await clear.click();
    await expect(groupedValue).toHaveValue("");

    const creatableId = "combobox-single-creatable";
    const creatable = canvas.locator(`#${creatableId}-combobox`);
    const creatableTrigger = creatable.locator("[data-exo-combobox=\"trigger\"]");
    const creatablePopover = canvas.locator(`#${creatableId}`);
    const creatableSearch = canvas.locator(`#${creatableId} [data-exo="combobox-search"]`);
    const createRow = canvas.locator(`#${creatableId} [data-exo="combobox-create"]`);

    await expectAttribute(creatable, "data-ready", "");
    await creatableTrigger.click();
    await expectPopoverState(creatablePopover, true);
    await creatableSearch.fill("urgent");
    await expect(createRow).toBeVisible();
    await expect(createRow).toContainText("urgent");

    await page.keyboard.press("Escape");

    const loadingId = "combobox-single-loading";
    const loading = canvas.locator(`#${loadingId}-combobox`);
    const loadingTrigger = loading.locator("[data-exo-combobox=\"trigger\"]");
    const loadingPopover = canvas.locator(`#${loadingId}`);
    await expectAttribute(loading, "data-ready", "");
    await loadingTrigger.click();
    await expectPopoverState(loadingPopover, true);
    await expect(canvas.locator(`#${loadingId} [data-exo="combobox-loading"]`)).toBeVisible();
    await expect(canvas.locator(`#${loadingId}-listbox`)).toHaveAttribute("aria-busy", "true");
    await expect(canvas.locator(`#${loadingId}-status`)).toHaveText("Loading results");

    const disabledTrigger = canvas.locator("#combobox-single-disabled-combobox [data-exo-combobox=\"trigger\"]");
    await expect(disabledTrigger).toBeDisabled();
    const disabledValue = canvas.locator("input[name=\"locked_owner\"]");
    await expect(disabledValue).toHaveValue("ops");
    await expect(disabledValue).toBeDisabled();
  });

  test("supports async server filtering with LiveView loading state", async ({ page }) => {
    await gotoStory(page, "/components/forms/combobox_async");

    const canvas = story(page);
    const root = canvas.locator("#cb-async-combobox");
    const trigger = root.locator("[data-exo-combobox=\"trigger\"]");
    const popover = canvas.locator("#cb-async");
    const search = popover.locator("[data-exo=\"combobox-search\"]");
    const listbox = canvas.locator("#cb-async-listbox");
    const status = canvas.locator("#cb-async-status");
    const maria = popover.locator("[data-exo=\"combobox-option\"][data-value=\"maria\"]");
    const value = canvas.locator("input[name=\"async_user\"]");

    await expectAttribute(root, "data-ready", "");
    await trigger.click();
    await expectPopoverState(popover, true);

    await search.fill("maria");
    await expect(status).toHaveText("Loading results");
    await expect(listbox).toHaveAttribute("aria-busy", "true");

    await expect(maria).toBeVisible();
    await expect(listbox).toHaveAttribute("aria-busy", "false");
    await expect(status).toHaveText("1 result available");

    await search.press("ArrowDown");
    await expect(search).toHaveAttribute("aria-activedescendant", await maria.getAttribute("id"));
    await page.keyboard.press("Enter");
    await expect(value).toHaveValue("maria");

    await trigger.click();
    await search.fill("zzzz");
    await expect(status).toHaveText("Loading results");
    await expect(popover.locator("[data-exo=\"combobox-empty\"]")).toContainText("No remote users found");
    await expect(status).toContainText("No remote users found");
  });
});

const { mountHook, fixture } = require('./helpers/hooks');

test('input-trigger combobox selects with keyboard and closes an empty result set', async ({ page }) => {
  await fixture(page, `<div data-exo="field">
    <div id="combo" data-trigger="input" data-filter="client">
      <input data-exo-combobox="input-trigger" role="combobox">
      <div id="choices" data-exo="popover-content" popover="manual">
        <div role="listbox">
          <div data-exo="combobox-option" data-value="ana">Ana</div>
          <div data-exo="combobox-option" data-value="milan">Milan</div>
        </div>
        <div data-exo="combobox-empty" hidden>No results found</div>
      </div>
      <span data-exo="combobox-status"></span>
    </div>
    <input type="hidden" name="owner">
  </div>`);
  await mountHook(page, 'ExoCombobox', 'combobox.js', '#combo');
  const input = page.getByRole('combobox');
  await input.focus();
  await input.press('ArrowDown');
  await input.press('ArrowDown');
  await input.press('Enter');
  await expect(input).toHaveValue('Milan');
  await expect(page.locator('input[name="owner"]')).toHaveValue('milan');
  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  await input.fill('unmatched');
  await expect(input).toHaveAttribute('aria-expanded', 'true');
  await input.press('Home');
  expect(await input.evaluate(node => node.selectionStart)).toBe(0);
  await input.press('Escape');
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  await input.press('ArrowDown');
  await expect(input).toHaveAttribute('aria-expanded', 'true');
});


test('input combobox preserves an empty query across LiveView updates', async ({ page }) => {
  await fixture(page, `<div data-exo="field"><div id="combo" data-trigger="input" data-filter="client">
    <input data-exo-combobox="input-trigger" role="combobox">
    <div id="choices" data-exo="popover-content" popover="manual"><div role="listbox">
      <div data-exo="combobox-option" data-value="ana" data-selected>Ana</div>
    </div></div></div><input type="hidden" name="owner" value="ana"></div>`);
  await mountHook(page, 'ExoCombobox', 'combobox.js', '#combo');
  const input = page.getByRole('combobox');
  await expect(input).toHaveValue('Ana');
  await input.fill('');
  await page.evaluate(() => window.testHooks['#combo'].updated());
  await expect(input).toHaveValue('');
});
