const { test, expect } = require("@playwright/test");

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
