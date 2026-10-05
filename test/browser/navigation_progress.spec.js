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
    const disabledPrevious = firstPagination
      .locator('button[data-exo="pagination-btn"][data-disabled]')
      .first();

    await expect(disabledPrevious).toHaveAttribute("aria-label", "Previous page");
    await expect(disabledPrevious).toBeDisabled();
    await expect(disabledPrevious.locator('[data-exo="icon"]')).toHaveCount(1);
    await expect(firstPagination.locator('[data-exo="pagination-btn"] [data-exo="icon"]')).toHaveCount(2);
    await expect(firstPagination.locator('[data-exo="pagination-status"]')).toHaveText("Page 1 of 5");
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

    const steps = canvas.locator('[data-exo="steps"]').first();
    const upcomingStep = canvas.locator('[data-exo="step"][data-status="upcoming"]').first();

    // A step is read from its content. An English `aria-label` ("Step 2,
    // Profile, current") used to replace it, title included.
    await expectAttribute(steps, "role", "list");
    await expect(canvas.locator('[data-exo="step"][aria-label]')).toHaveCount(0);
    await expect(currentStep.locator('[data-exo="step-title"]')).toHaveText("Profile");
    await expect(currentStep.locator('[data-exo="sr-only"]')).toHaveCount(0);
    await expect(firstStep.locator('[data-exo="sr-only"]')).toHaveText("Completed");
    await expect(upcomingStep.locator('[data-exo="sr-only"]')).toHaveText("Not completed");
    await expect(currentStep.locator('[data-exo="step-description"]')).toHaveText("Add public profile data");

    const statusBox = await firstStep.locator('[data-exo="sr-only"]').boundingBox();
    expect(statusBox.width).toBeLessThanOrEqual(1);
    expect(statusBox.height).toBeLessThanOrEqual(1);
    expect(firstStepConnector.content).toBe('""');
    expect(Number.parseFloat(firstStepConnector.height)).toBeGreaterThan(0);

    await gotoStory(page, "/components/navigation/wizard_sidebar");

    const wizard = story(page).locator('[data-exo="wizard"]').first();
    const currentWizardStep = wizard.locator('[data-exo="wizard-step"][aria-current="step"]');
    const completedWizardStep = wizard.locator('[data-exo="wizard-step"][data-status="completed"]').first();
    const pendingWizardStep = wizard.locator('[data-exo="wizard-btn"][aria-disabled="true"]').first();

    await expectAttribute(wizard, "aria-label", "Checkout progress");
    await expect(currentWizardStep.locator('[data-exo="wizard-btn"]')).toHaveAttribute(
      "aria-label",
      "Step 2, Profile info, current"
    );
    await expect(
      completedWizardStep.locator('[data-exo="wizard-indicator"] [data-exo="icon"]')
    ).toHaveCount(1);
    await expect(pendingWizardStep).toHaveAttribute("aria-label", "Step 3, Billing, pending");
    await expect(pendingWizardStep).toBeDisabled();
  });

  test("the current step keeps its number readable under one brand colour for both themes", async ({ page }) => {
    await gotoStory(page, "/components/navigation/steps");

    // A storefront sets one brand colour for light and dark, and pairs it with
    // a foreground for its buttons. As text on the page background no colour
    // reaches 4.5:1 on both backgrounds, so the current step's number, drawn
    // in --exo-primary, vanished: black was 1.12:1 in dark, amber 2.05:1 in
    // light (TRG-449). null keeps ExoUI's own primary.
    const brands = [
      [null, null],
      ["#111827", "oklch(99% 0 0)"],
      ["#f59e0b", "oklch(20% 0.006 106)"]
    ];

    const results = [];

    for (const theme of ["light", "dark"]) {
      for (const [primary, foreground] of brands) {
        const result = await story(page).evaluate(
          (root, { theme, primary, foreground }) => {
            const rgb = (css, under) => {
              const canvas = document.createElement("canvas");
              canvas.width = canvas.height = 1;
              const context = canvas.getContext("2d", { colorSpace: "srgb" });

              if (under) {
                context.fillStyle = `rgb(${under.join(",")})`;
                context.fillRect(0, 0, 1, 1);
              }

              context.fillStyle = css;
              context.fillRect(0, 0, 1, 1);
              return [...context.getImageData(0, 0, 1, 1).data].slice(0, 3);
            };

            const luminance = (channels) =>
              channels
                .map((value) => {
                  const v = value / 255;
                  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
                })
                .reduce((sum, v, index) => sum + v * [0.2126, 0.7152, 0.0722][index], 0);

            const ratio = (a, b) => {
              const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
              return (high + 0.05) / (low + 0.05);
            };

            const steps = root.querySelector('[data-exo="steps"]');
            const wrapper = steps.parentElement;
            wrapper.setAttribute("data-theme", theme);
            wrapper.style.background = "var(--exo-background)";

            for (const [name, value] of [
              ["--exo-primary", primary],
              ["--exo-primary-foreground", foreground]
            ]) {
              if (value) wrapper.style.setProperty(name, value);
              else wrapper.style.removeProperty(name);
            }

            const step = (status) => steps.querySelector(`[data-exo="step"][data-status="${status}"]`);
            const indicator = (status) => step(status).querySelector('[data-exo="step-indicator"]');
            const weight = (status) =>
              Number(getComputedStyle(step(status).querySelector('[data-exo="step-title"]')).fontWeight);

            const surface = rgb(getComputedStyle(wrapper).backgroundColor);
            const fill = rgb(getComputedStyle(indicator("current")).backgroundColor, surface);

            return {
              number: indicator("current").textContent.trim(),
              ratio: ratio(rgb(getComputedStyle(indicator("current")).color, fill), fill),
              sameFillAsComplete:
                getComputedStyle(indicator("current")).backgroundColor ===
                getComputedStyle(indicator("complete")).backgroundColor,
              titleWeights: [weight("complete"), weight("current"), weight("upcoming")]
            };
          },
          { theme, primary, foreground }
        );

        results.push({ ...result, label: `${theme}, primary ${primary || "ExoUI"}` });
      }
    }

    for (const { label, number, ratio } of results) {
      expect(number, label).toBe("2");
      expect(ratio, `${label}: number on the fill`).toBeGreaterThanOrEqual(4.5);
    }

    // The fill says "reached", the number and the heavier title say "here".
    for (const { label, sameFillAsComplete, titleWeights } of results) {
      const [complete, current, upcoming] = titleWeights;
      expect(sameFillAsComplete, label).toBe(true);
      expect(current, label).toBeGreaterThan(complete);
      expect(current, label).toBeGreaterThan(upcoming);
    }
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
    await expect(customMax).toHaveAttribute("aria-valuetext", "3 of 5 import steps complete");
    await expect(clamped).toHaveAttribute("aria-valuenow", "100");
    await expect(clamped).toHaveAttribute("aria-valuetext", "100%");

    await gotoStory(page, "/components/feedback/radial_progress");

    const radial = story(page).locator('[data-exo="radial-progress"]').first();
    const radialCustom = story(page).locator('[data-exo="radial-progress"][aria-label="Task progress"]');
    await expect(radial).toHaveAttribute("aria-label", "0 percent complete");
    await expect(radial).toHaveAttribute("aria-valuenow", "0");
    await expect(radial).toHaveAttribute("aria-valuetext", "0%");
    await expect(radial.locator("svg")).toHaveAttribute("aria-hidden", "true");
    await expect(radialCustom).toHaveAttribute("aria-valuenow", "3");
    await expect(radialCustom).toHaveAttribute("aria-valuemax", "5");
    await expect(radialCustom).toHaveAttribute("aria-valuetext", "3 of 5 tasks complete");
  });
});
