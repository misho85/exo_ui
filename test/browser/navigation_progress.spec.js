const { test, expect } = require("@playwright/test");

const { expectAttribute, gotoStory, story } = require("./helpers/storybook");

test.describe("navigation and progress components", () => {
  test("tabs expose tablist semantics, active focus order, and disabled state", async ({ page }) => {
    await gotoStory(page, "/components/tabs");

    const canvas = story(page);
    const tabs = canvas.locator('[data-exo="tabs"]');
    const activeTab = tabs.locator('[data-exo="tab"][data-active]');
    const disabledTab = tabs.locator('[data-exo="tab"][data-disabled]');

    await expectAttribute(tabs, "role", "tablist");
    await expectAttribute(tabs, "aria-label", "Account sections");
    await expectAttribute(activeTab, "aria-selected", "true");
    await expectAttribute(activeTab, "tabindex", "0");
    await expectAttribute(disabledTab, "aria-disabled", "true");
    await expectAttribute(disabledTab, "tabindex", "-1");
  });

  test("pagination exposes page labels, current page, and disabled controls", async ({ page }) => {
    await gotoStory(page, "/components/pagination");

    const canvas = story(page);
    const firstPagination = canvas.locator('[data-exo="pagination"]').first();
    const customPagination = canvas.locator('[aria-label="Report pages"]');

    await expect(firstPagination.locator('[data-exo="pagination-btn"][data-disabled]').first()).toHaveAttribute(
      "aria-label",
      "Previous page"
    );
    await expect(firstPagination.locator('[aria-current="page"]')).toHaveAttribute(
      "aria-label",
      "Page 1, current page"
    );
    await expect(customPagination.locator('[aria-current="page"]')).toHaveAttribute(
      "aria-label",
      "Open report page 2, current page"
    );
  });

  test("steps and wizard mark the current step for assistive tech", async ({ page }) => {
    await gotoStory(page, "/components/steps");

    const canvas = story(page);
    const currentStep = canvas.locator('[data-exo="step"][aria-current="step"]').first();

    await expect(currentStep).toHaveAttribute("aria-label", "Step 2, Profile, current");
    await expect(currentStep.locator('[data-exo="step-description"]')).toHaveText("Add public profile data");

    await gotoStory(page, "/components/wizard_sidebar");

    const wizard = story(page).locator('[data-exo="wizard"]').first();
    const currentWizardStep = wizard.locator('[data-exo="wizard-step"][aria-current="step"]');
    const pendingWizardStep = wizard.locator('[data-exo="wizard-btn"][aria-disabled="true"]').first();

    await expectAttribute(wizard, "aria-label", "Checkout progress");
    await expect(currentWizardStep.locator('[data-exo="wizard-btn"]')).toHaveAttribute(
      "aria-label",
      "Step 2, Profile info, current"
    );
    await expect(pendingWizardStep).toHaveAttribute("aria-label", "Step 3, Billing, pending");
  });

  test("progress components expose bounded values and accessible names", async ({ page }) => {
    await gotoStory(page, "/components/progress");

    const progress = story(page).locator('[data-exo="progress"]').first();
    await expect(progress).toHaveAttribute("aria-label", "Storage used");
    await expect(progress).toHaveAttribute("aria-valuenow", "65");
    await expect(progress).toHaveAttribute("aria-valuetext", "65%");

    await gotoStory(page, "/components/radial_progress");

    const radial = story(page).locator('[data-exo="radial-progress"]').first();
    await expect(radial).toHaveAttribute("aria-label", "0 percent complete");
    await expect(radial).toHaveAttribute("aria-valuenow", "0");
    await expect(radial).toHaveAttribute("aria-valuetext", "0%");
    await expect(radial.locator("svg")).toHaveAttribute("aria-hidden", "true");
  });
});
