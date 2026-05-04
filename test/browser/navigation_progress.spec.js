const { test, expect } = require("@playwright/test");

const { expectAttribute, expectFocused, gotoStory, story } = require("./helpers/storybook");

test.describe("navigation and progress components", () => {
  test("tabs expose tablist semantics, active focus order, and disabled state", async ({ page }) => {
    await gotoStory(page, "/components/navigation/tabs");

    const canvas = story(page);
    const tabs = canvas.locator("#tabs-single-default");
    const verticalTabs = canvas.locator("#tabs-single-vertical-automatic");
    const activeTab = tabs.locator('[data-exo="tab"][data-active]');
    const detailsTab = tabs.getByRole("tab", { name: /Details/ });
    const settingsTab = tabs.getByRole("tab", { name: /Settings/ });
    const disabledTab = tabs.locator('[data-exo="tab"][data-disabled]');
    const activePanel = canvas.locator("#account-overview-panel");

    await expectAttribute(tabs, "data-ready", "");
    await expectAttribute(tabs, "role", "tablist");
    await expectAttribute(tabs, "aria-label", "Account sections");
    await expectAttribute(activeTab, "aria-selected", "true");
    await expectAttribute(activeTab, "tabindex", "0");
    await expect(activeTab.locator('[data-exo="tab-icon"]')).toHaveCount(1);
    await expect(activePanel).toHaveAttribute("role", "tabpanel");
    const activeTabId = await activeTab.getAttribute("id");
    expect(activeTabId).toBeTruthy();
    await expect(activePanel).toHaveAttribute("aria-labelledby", activeTabId);
    await expectAttribute(disabledTab, "aria-disabled", "true");
    await expectAttribute(disabledTab, "tabindex", "-1");

    await activeTab.focus();
    await page.keyboard.press("ArrowRight");
    await expectFocused(detailsTab);
    await page.keyboard.press("ArrowRight");
    await expectFocused(settingsTab);
    await page.keyboard.press("ArrowRight");
    await expectFocused(activeTab);
    await page.keyboard.press("End");
    await expectFocused(settingsTab);

    await expectAttribute(verticalTabs, "aria-orientation", "vertical");
    await expectAttribute(verticalTabs, "data-activation", "automatic");
    await expect(verticalTabs.getByRole("tab", { name: /Profile/ })).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  test("pagination exposes page labels, current page, and disabled controls", async ({ page }) => {
    await gotoStory(page, "/components/navigation/pagination");

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

  test("bottom navigation exposes active page and real icon markup", async ({ page }) => {
    await gotoStory(page, "/components/navigation/bottom_nav");

    const canvas = story(page);
    const iconNav = canvas.locator('[data-exo="bottom-nav"]').nth(1);
    const appNav = canvas.locator('[aria-label="Main app navigation"]');
    const activeItem = iconNav.locator('[data-exo="bottom-nav-item"][aria-current="page"]');

    await expect(activeItem).toContainText("Home");
    await expect(activeItem.locator('[data-exo="bottom-nav-icon"] svg')).toHaveCount(1);
    await expect(appNav.locator('[data-exo="bottom-nav-item"]')).toHaveCount(5);
    await expect(appNav.locator('[aria-current="page"]')).toContainText("Home");
  });

  test("steps and wizard mark the current step for assistive tech", async ({ page }) => {
    await gotoStory(page, "/components/navigation/steps");

    const canvas = story(page);
    const currentStep = canvas.locator('[data-exo="step"][aria-current="step"]').first();
    const firstStep = canvas.locator('[data-exo="step"]').first();
    const firstStepConnector = await firstStep.evaluate((node) => {
      const styles = window.getComputedStyle(node, "::after");

      return {
        content: styles.content,
        height: styles.height
      };
    });

    await expect(currentStep).toHaveAttribute("aria-label", "Step 2, Profile, current");
    await expect(currentStep.locator('[data-exo="step-description"]')).toHaveText("Add public profile data");
    expect(firstStepConnector.content).toBe('""');
    expect(Number.parseFloat(firstStepConnector.height)).toBeGreaterThan(0);

    await gotoStory(page, "/components/navigation/wizard_sidebar");

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
    await gotoStory(page, "/components/feedback/progress");

    const progress = story(page).locator('[data-exo="progress"]').first();
    await expect(progress).toHaveAttribute("aria-label", "Storage used");
    await expect(progress).toHaveAttribute("aria-valuenow", "65");
    await expect(progress).toHaveAttribute("aria-valuetext", "65%");

    const customMax = story(page).locator('[data-exo="progress"][aria-label="Import steps"]');
    const clamped = story(page).locator('[data-exo="progress"][aria-label="Over quota"]');
    await expect(customMax).toHaveAttribute("aria-valuenow", "3");
    await expect(customMax).toHaveAttribute("aria-valuemax", "5");
    await expect(customMax).toHaveAttribute("aria-valuetext", "60%");
    await expect(clamped).toHaveAttribute("aria-valuenow", "100");
    await expect(clamped).toHaveAttribute("aria-valuetext", "100%");

    await gotoStory(page, "/components/feedback/radial_progress");

    const radial = story(page).locator('[data-exo="radial-progress"]').first();
    await expect(radial).toHaveAttribute("aria-label", "0 percent complete");
    await expect(radial).toHaveAttribute("aria-valuenow", "0");
    await expect(radial).toHaveAttribute("aria-valuetext", "0%");
    await expect(radial.locator("svg")).toHaveAttribute("aria-hidden", "true");
  });
});
