const { test, expect } = require("@playwright/test");

const { expectPopoverState, gotoStory, story } = require("./helpers/storybook");

// TRG-742: the page header presses its one primary action on Cmd/Ctrl+Enter
// and follows the previous/next record arrows on K and J. The test replaces
// each control's `click` with a recorder, so it sees exactly what the hook
// pressed without navigating the story away.
async function recordPresses(header) {
  await header.evaluate((el) => {
    window.__headerPresses = [];
    el.querySelectorAll("[data-exo-header]").forEach((node) => {
      node.click = () => window.__headerPresses.push(node.dataset.exoHeader);
    });
  });
}

async function presses(page) {
  return page.evaluate(() => window.__headerPresses);
}

// Storybook gives the component its own id (`header-single-record`), so the
// record variation is found by its hook: it is the only header with arrows.
function recordHeader(page) {
  return story(page).locator('[data-exo="header"][phx-hook="ExoHeader"]');
}

test.describe("page header", () => {
  test("Cmd/Ctrl+Enter presses the primary action, K and J follow the arrows", async ({ page }) => {
    await gotoStory(page, "/components/layout/header");

    const header = recordHeader(page);
    await expect(header).toHaveCount(1);

    const primary = header.locator('[data-exo-header="primary"]');
    await expect(primary).toHaveAttribute("title", /^Mark as shipped \((⌘↵|Ctrl\+↵)\)$/);
    await expect(header.locator('[data-exo-header="prev"]')).toHaveAttribute("title", "Previous order (K)");
    await expect(header.locator('[data-exo-header="next"]')).toHaveAttribute("title", "Next order (J)");

    await recordPresses(header);
    await page.locator("body").click({ position: { x: 1, y: 1 } });

    await page.keyboard.press("ControlOrMeta+Enter");
    await page.keyboard.press("j");
    await page.keyboard.press("k");
    expect(await presses(page)).toEqual(["primary", "next", "prev"]);
  });

  test("the letters stay quiet in a field, with Shift and while the menu is open", async ({ page }) => {
    await gotoStory(page, "/components/layout/header");

    const header = recordHeader(page);
    await expect(header).toHaveCount(1);
    await recordPresses(header);

    await page.evaluate(() => {
      const field = document.createElement("input");
      field.id = "header-spec-field";
      document.body.appendChild(field);
    });
    await page.locator("#header-spec-field").focus();
    await page.keyboard.press("j");
    await page.keyboard.press("k");
    await expect(page.locator("#header-spec-field")).toHaveValue("jk");
    expect(await presses(page)).toEqual([]);

    await page.locator("#header-spec-field").blur();
    await page.keyboard.press("Shift+J");
    expect(await presses(page)).toEqual([]);

    const trigger = header.locator('[data-exo-header="more"]');
    const menu = page.locator(`#${await header.getAttribute("id")}-more`);
    await trigger.click();
    await expectPopoverState(menu, true);
    await page.keyboard.press("j");
    await page.keyboard.press("ControlOrMeta+Enter");
    expect(await presses(page)).toEqual([]);

    const cancel = menu.getByRole("menuitem", { name: "Cancel order" });
    await expect(cancel).toHaveAttribute("data-variant", "danger");
  });
});
