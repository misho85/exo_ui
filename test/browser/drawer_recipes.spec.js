const { test, expect } = require("@playwright/test");

const {
  chooseSelect,
  expectAttribute,
  expectFocused,
  gotoStory,
  story
} = require("./helpers/storybook");

async function expectWithinInert(locator, expected) {
  await expect
    .poll(async () =>
      locator.evaluate((node) => Boolean(node.inert || node.closest("[inert]")))
    )
    .toBe(expected);
}

test.describe("drawer recipes", () => {
  test("covers side, labels, validation, scrolling, navigation, and filters", async ({
    page
  }) => {
    await gotoStory(page, "/components/recipes/drawer_recipes");

    const canvas = story(page);
    const root = canvas.locator('[data-exo="drawer-recipes-workflow"]');
    const state = canvas.locator("#drawer-recipes-state");
    const openDetail = root.locator("#drawer-recipe-open-detail");
    const detail = canvas.locator("#drawer-recipe-detail");
    const navigation = canvas.locator("#drawer-recipe-navigation");
    const filters = canvas.locator("#drawer-recipe-filters");
    const detailDialog = detail.locator('[data-exo="drawer-content"]');
    const filterDialog = filters.locator('[data-exo="drawer-content"]');

    await expectAttribute(root, "data-saved-count", "0");
    await expectAttribute(detail, "data-state", "closed");

    await openDetail.click();
    await expectAttribute(detail, "data-state", "open");
    await expectAttribute(detail, "data-side", "right");
    await expect(detailDialog).toHaveAttribute("aria-labelledby", "drawer-recipe-detail-title");
    await expect(detailDialog).toHaveAttribute("aria-describedby", "drawer-recipe-detail-body");
    await expect(detailDialog).toHaveAttribute("role", "dialog");
    await expectFocused(detail.locator('[data-exo="drawer-close"]'));
    await expectWithinInert(openDetail, true);

    const detailBody = detail.locator('[data-exo="drawer-body"]');
    await expect
      .poll(async () => detailBody.evaluate((node) => node.scrollHeight > node.clientHeight))
      .toBe(true);
    await detailBody.evaluate((node) => {
      node.scrollTop = node.scrollHeight;
    });
    await expect.poll(async () => detailBody.evaluate((node) => node.scrollTop)).toBeGreaterThan(0);

    await detail.getByLabel("Account owner").fill("");
    await expectAttribute(root, "data-owner", "");
    await detail.getByRole("button", { name: "Save drawer review" }).click();
    await expectAttribute(detail, "data-state", "open");
    await expectAttribute(root, "data-validation-count", "1");
    await expect(detail.getByLabel("Account owner")).toHaveAttribute("aria-invalid", "true");
    await expect(detail.locator('[data-exo="field-error"]')).toContainText(
      "Owner is required before saving drawer."
    );
    await expect(state).toHaveAttribute("data-last-action", "blocked drawer save");

    await detail.getByLabel("Account owner").fill("Mina");
    await expectAttribute(root, "data-owner", "Mina");
    await detail.getByRole("button", { name: "Save drawer review" }).click();
    await expectAttribute(detail, "data-state", "closed");
    await expectAttribute(root, "data-saved-count", "1");
    await expect(state).toHaveAttribute("data-last-action", "saved drawer review for Mina");
    await expectWithinInert(openDetail, false);

    await root.getByRole("button", { name: "Open navigation drawer" }).click();
    await expectAttribute(navigation, "data-state", "open");
    await expectAttribute(navigation, "data-side", "left");
    await expect(navigation.locator('[data-exo="drawer-content"]')).toHaveAttribute(
      "aria-labelledby",
      "drawer-recipe-navigation-title"
    );
    await navigation.getByRole("button", { name: "Open billing queue" }).click();
    await expectAttribute(navigation, "data-state", "closed");
    await expectAttribute(root, "data-selected-section", "billing");
    await expectAttribute(root, "data-navigation-count", "1");

    await root.getByRole("button", { name: "Open filter drawer" }).click();
    await expectAttribute(filters, "data-state", "open");
    await expect(filterDialog).toHaveAttribute("aria-label", "Segment filters drawer");
    await expect(filterDialog).not.toHaveAttribute("aria-labelledby", /.*/);
    await chooseSelect(filters, "drawer-recipe-segment", "enterprise");
    await filters.getByText("Include archived accounts", { exact: true }).click();
    await expectAttribute(root, "data-segment", "enterprise");
    await expectAttribute(root, "data-include-archived", "true");
    await filters.getByRole("button", { name: "Apply drawer filters" }).click();
    await expectAttribute(filters, "data-state", "closed");
    await expectAttribute(root, "data-filter-count", "1");

    await openDetail.click();
    await detail.locator('[data-exo="drawer-close"]').click();
    await expectAttribute(detail, "data-state", "closed");
    await expectAttribute(root, "data-cancel-count", "1");
  });
});
