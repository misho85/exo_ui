const { test, expect } = require("@playwright/test");

const {
  expectAttribute,
  expectFocused,
  expectPopoverState,
  gotoStory,
  story
} = require("./helpers/storybook");

test.describe("data and feedback components", () => {
  test("alert renders live-region semantics, icons, and actions", async ({ page }) => {
    await gotoStory(page, "/components/feedback/alert");

    const canvas = story(page);
    const success = canvas.locator('[data-exo="alert"][data-kind="success"]');
    const warning = canvas.locator('[data-exo="alert"][data-kind="warning"]').first();
    const actionAlert = canvas.locator('[data-exo="alert"][data-kind="warning"]').last();
    const error = canvas.locator('[data-exo="alert"][data-kind="error"]');

    await expectAttribute(success, "role", "status");
    await expectAttribute(success, "aria-live", "polite");
    await expect(success.locator('[data-exo="alert-icon"] [data-exo="icon"]')).toHaveCount(1);
    await expectAttribute(warning, "role", "alert");
    await expectAttribute(error, "aria-live", "assertive");
    await expect(actionAlert.locator('[data-exo="alert-action"] [data-exo="btn"]')).toHaveText("Review");
  });

  test("alert text meets WCAG AA on its own tint in both themes", async ({ page }) => {
    await gotoStory(page, "/components/feedback/alert");

    const foregrounds = [];

    for (const theme of ["light", "dark"]) {
      // The theme is scoped to the wrapper the alerts sit in, so the measurement
      // does not depend on the Storybook chrome around the story.
      const result = await story(page).evaluate((root, themeName) => {
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

        // Every variation renders in its own wrapper, so each one gets the theme.
        const alerts = [...root.querySelectorAll('[data-exo="alert"]')];

        for (const alert of alerts) {
          alert.parentElement.setAttribute("data-theme", themeName);
          alert.parentElement.style.background = "var(--exo-background)";
        }

        return {
          foreground: getComputedStyle(alerts[0]).getPropertyValue("--exo-foreground").trim(),
          alerts: alerts.map((alert) => {
            const surface = rgb(getComputedStyle(alert.parentElement).backgroundColor);
            const background = rgb(getComputedStyle(alert).backgroundColor, surface);
            const message = alert.querySelector('[data-exo="alert-message"]');
            const style = getComputedStyle(message);

            return {
              kind: alert.dataset.kind,
              opacity: Number.parseFloat(style.opacity),
              ratio: ratio(rgb(style.color), background)
            };
          })
        };
      }, theme);

      foregrounds.push(result.foreground);
      expect(result.alerts.length).toBeGreaterThanOrEqual(4);

      for (const alert of result.alerts) {
        expect(alert.opacity, `${theme} ${alert.kind} message opacity`).toBe(1);
        expect(alert.ratio, `${theme} ${alert.kind} text contrast`).toBeGreaterThanOrEqual(4.5);
      }
    }

    // Both passes must have measured a different theme, not the same one twice.
    expect(foregrounds[0]).not.toEqual(foregrounds[1]);
  });

  test("alert text keeps the hue of its kind under a tinted foreground", async ({ page }) => {
    await gotoStory(page, "/components/feedback/alert");

    // ExoUI's own neutrals have chroma 0, and a hue with no chroma is powerless,
    // so a mix that interpolates hue looks right with them. A theme whose
    // foreground carries a trace of colour is where it breaks: these are
    // trg24's, under which the oklch mix turned error text brown (hue 66 for
    // 27) and info text teal (175 for 245), TRG-346. In oklab the text drifts
    // at most about 4 degrees from its kind; in oklch at least 14.
    const tinted = { light: "oklch(20% 0.006 106)", dark: "oklch(96% 0.004 106)" };
    const tokens = { info: "--exo-info", success: "--exo-success", warning: "--exo-warning", error: "--exo-danger" };

    for (const [theme, foreground] of Object.entries(tinted)) {
      const alerts = await story(page).evaluate(
        (root, { themeName, foreground, tokens }) => {
          const rgb = (css) => {
            const canvas = document.createElement("canvas");
            canvas.width = canvas.height = 1;
            const context = canvas.getContext("2d", { colorSpace: "srgb" });
            context.fillStyle = css;
            context.fillRect(0, 0, 1, 1);
            return [...context.getImageData(0, 0, 1, 1).data].slice(0, 3);
          };

          // sRGB bytes -> OKLab -> hue angle in degrees.
          const hue = (channels) => {
            const [r, g, b] = channels.map((value) => {
              const v = value / 255;
              return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
            });
            const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
            const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
            const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
            const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
            const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
            return ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360;
          };

          return [...root.querySelectorAll('[data-exo="alert"]')].map((alert) => {
            const wrapper = alert.parentElement;
            wrapper.setAttribute("data-theme", themeName);
            wrapper.style.setProperty("--exo-foreground", foreground);

            const message = alert.querySelector('[data-exo="alert-message"]');
            const kind = getComputedStyle(wrapper).getPropertyValue(tokens[alert.dataset.kind]).trim();

            return {
              kind: alert.dataset.kind,
              foreground: getComputedStyle(alert).getPropertyValue("--exo-foreground").trim(),
              expected: hue(rgb(kind)),
              actual: hue(rgb(getComputedStyle(message).color))
            };
          });
        },
        { themeName: theme, foreground, tokens }
      );

      expect(alerts.length).toBeGreaterThanOrEqual(4);

      for (const alert of alerts) {
        // The override must have reached the alert, or this measures ExoUI's grey.
        expect(alert.foreground, `${theme} ${alert.kind} foreground`).toBe(foreground);

        const drift = Math.abs(((alert.actual - alert.expected + 540) % 360) - 180);
        expect(drift, `${theme} ${alert.kind} text hue ${alert.actual} vs ${alert.expected}`).toBeLessThanOrEqual(8);
      }
    }
  });

  test("skeleton exposes loading semantics without announcing decorative shapes", async ({ page }) => {
    await gotoStory(page, "/components/feedback/skeleton");

    const canvas = story(page);
    const labelled = canvas.locator('[data-exo="skeleton"][aria-label="Loading billing summary"]');
    const emptyText = canvas.locator('[data-exo="skeleton"][data-type="text"]').last();

    await expectAttribute(labelled, "role", "status");
    await expectAttribute(labelled, "aria-busy", "true");
    await expectAttribute(labelled, "aria-live", "polite");
    await expect(labelled.locator('[aria-hidden="true"]')).toHaveCount(3);
    await expect(emptyText.locator('[data-exo="skeleton-line"]')).toHaveCount(0);
  });

  test("badge exposes size variants and shared icon markup", async ({ page }) => {
    await gotoStory(page, "/components/feedback/badge");

    const canvas = story(page);
    const largeBadge = canvas.locator('[data-exo="badge"][data-size="lg"]');
    const iconBadge = canvas.locator('[data-exo="badge"][data-variant="success"]').last();

    await expectAttribute(largeBadge, "data-size", "lg");
    await expect(iconBadge.locator('[data-exo="icon"]')).toHaveCount(1);
    await expect(iconBadge.locator('[data-exo="icon"]')).toHaveAttribute("aria-hidden", "true");
  });

  test("date picker exposes calendar semantics, form value, and error links", async ({ page }) => {
    await gotoStory(page, "/components/forms/date_picker");

    const canvas = story(page);
    const invalidPicker = canvas.locator("#date-picker-single-with-error");
    const selectedPicker = canvas.locator("#date-picker-single-selected");
    const keyboardPicker = canvas.locator("#date-picker-single-keyboard-navigation");

    await expect(canvas.locator('[data-exo="date-picker-month"][id="-month"]')).toHaveCount(0);
    await expect(canvas.locator('[data-exo="date-picker-grid"][aria-labelledby="-month"]')).toHaveCount(0);
    await expectAttribute(selectedPicker, "data-ready", "");
    await expect(selectedPicker.locator('[data-exo="date-picker-month"]')).toHaveAttribute(
      "id",
      /.+-month/
    );
    await expectAttribute(invalidPicker, "role", "group");
    await expectAttribute(invalidPicker, "aria-invalid", "true");
    await expectAttribute(
      invalidPicker,
      "aria-describedby",
      "date-picker-single-with-error-description date-picker-single-with-error-error"
    );
    await expect(invalidPicker.locator('[role="grid"]')).toHaveAttribute(
      "aria-labelledby",
      "date-picker-single-with-error-month"
    );
    await expect(invalidPicker.locator("#date-picker-single-with-error-error")).toHaveAttribute(
      "role",
      "alert"
    );

    const selectedValue = await selectedPicker.locator('input[name="departure"]').inputValue();
    await expect(selectedPicker.locator(`[data-exo="date-picker-day"][aria-selected="true"]`)).toHaveCount(1);
    expect(selectedValue).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    await expectAttribute(keyboardPicker, "data-ready", "");

    const day15 = keyboardPicker.locator('[data-exo="date-picker-day"][phx-value-date="2026-03-15"]');
    const day16 = keyboardPicker.locator('[data-exo="date-picker-day"][phx-value-date="2026-03-16"]');
    const day22 = keyboardPicker.locator('[data-exo="date-picker-day"][phx-value-date="2026-03-22"]');
    const day23 = keyboardPicker.locator('[data-exo="date-picker-day"][phx-value-date="2026-03-23"]');

    await day15.focus();
    await expectFocused(day15);

    await page.keyboard.press("ArrowRight");
    await expectFocused(day16);
    await expect(day16).toHaveAttribute("tabindex", "0");
    await expect(day15).toHaveAttribute("tabindex", "-1");

    await page.keyboard.press("End");
    await expectFocused(day22);

    await page.keyboard.press("Home");
    await expectFocused(day16);

    await page.keyboard.press("ArrowDown");
    await expectFocused(day23);

    await page.keyboard.press("ArrowUp");
    await expectFocused(day16);
  });

  test("controlled date picker updates month and selected date through LiveComponent events", async ({ page }) => {
    await gotoStory(page, "/components/forms/date_picker_controlled");

    const canvas = story(page);
    const picker = canvas.locator("#controlled-booking-date");
    const state = canvas.locator("#controlled-date-picker-state");
    const next = picker.getByRole("button", { name: "Next month" });
    const previous = picker.getByRole("button", { name: "Previous month" });

    await expectAttribute(picker, "data-ready", "");
    await expect(previous.locator('[data-exo="icon"]')).toHaveCount(1);
    await expect(next.locator('[data-exo="icon"]')).toHaveCount(1);
    await expect(picker.locator('[data-exo="date-picker-month"]')).toHaveText("March 2026");
    await expect(state).toHaveAttribute("data-month", "2026-03-01");
    await expect(state).toHaveAttribute("data-selected", "2026-03-15");

    await next.click();
    await expect(picker.locator('[data-exo="date-picker-month"]')).toHaveText("April 2026");
    await expect(state).toHaveAttribute("data-month", "2026-04-01");

    await picker.locator('[data-exo="date-picker-day"][phx-value-date="2026-04-12"]').click();
    await expect(state).toHaveAttribute("data-selected", "2026-04-12");
    await expect(picker.locator('input[name="booking[date]"]')).toHaveValue("2026-04-12");

    await previous.click();
    await expect(picker.locator('[data-exo="date-picker-month"]')).toHaveText("March 2026");
  });

  test("editable record workflow combines table menus, command search, drawer validation, dates, and guarded delete", async ({
    page
  }) => {
    await gotoStory(page, "/components/data_display/editable_record_workflow");

    const canvas = story(page);
    const root = canvas.locator('[data-exo="editable-record-workflow"]');
    const state = canvas.locator("#editable-record-state");
    const acmeActions = canvas.getByRole("button", { name: "Actions for Acme Corp" });
    const acmeMenu = canvas.locator("#editable-record-actions-acme");
    const command = canvas.locator("#editable-record-command");
    const commandInput = command.locator('[data-exo="command-palette-input"]');
    const drawer = canvas.locator("#editable-record-drawer");
    const confirm = canvas.locator("#editable-record-delete-confirm");
    const owner = drawer.getByLabel("Owner");
    const renewal = drawer.locator("#editable-record-renewal");

    await expect(root.locator("#editable-records-table [data-exo=\"table-row\"]")).toHaveCount(3);
    await expect(root.getByRole("cell", { name: "Unassigned" })).toBeVisible();

    await acmeActions.click();
    await expectPopoverState(acmeMenu, true);
    await expect(canvas.getByRole("menuitem", { name: "Edit record" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expectPopoverState(acmeMenu, false);

    await canvas.getByRole("button", { name: "Open record commands" }).click();
    await expectAttribute(command, "data-state", "open");
    await commandInput.fill("northstar");
    await expect(
      command.locator('[data-exo="command-palette-item"][data-value="edit-northstar"]')
    ).toHaveAttribute("data-active", "true");
    await commandInput.press("Enter");

    await expectAttribute(drawer, "data-state", "open");
    await expect(state).toHaveAttribute("data-selected", "northstar");
    await expect(owner).toHaveValue("");

    await drawer.getByRole("button", { name: "Save record" }).click();
    await expect(state).toHaveAttribute("data-save-state", "blocked");
    await expect(owner).toHaveAttribute("aria-invalid", "true");
    await expect(drawer.locator('[data-exo="field-error"]')).toContainText(
      "Owner is required before saving"
    );

    await owner.fill("Lena");
    await expect(state).toHaveAttribute("data-save-state", "dirty");
    await drawer.getByRole("button", { name: "Next month" }).click();
    await expect(renewal.locator('[data-exo="date-picker-month"]')).toHaveText("August 2026");
    await renewal.locator('[data-exo="date-picker-day"][phx-value-date="2026-08-12"]').click();
    await expect(renewal.locator('input[name="record[renewal_date]"]')).toHaveValue("2026-08-12");

    await drawer.getByRole("button", { name: "Save record" }).click();
    await expect(state).toHaveAttribute("data-save-state", "saved");
    await expect(root.locator("#editable-record-northstar [data-exo=\"editable-owner\"]")).toHaveText(
      "Lena"
    );

    await drawer.getByRole("button", { name: "Delete record" }).click();
    await expectAttribute(confirm, "data-state", "open");
    await confirm.getByRole("button", { name: "Validate delete" }).click();
    await expectAttribute(confirm, "data-state", "open");
    await expect(canvas.locator("#editable-record-delete-error")).toContainText(
      "Cannot delete an active renewal record"
    );
  });

  test("table renders caption, aligned cells, row labels, and empty state", async ({ page }) => {
    await gotoStory(page, "/components/data_display/table");

    const canvas = story(page);
    const table = canvas.getByRole("table", { name: "Team members and access levels" });
    const emptyTable = canvas.getByRole("table", { name: "Archived members" });
    const loadingTable = canvas.getByRole("table", { name: "Loading members" });

    await expect(table.locator('[data-exo="table-caption"]')).toHaveText("Team members and access levels");
    await expect(canvas.locator('[data-exo="table-head-cell"][data-align="center"]').first()).toHaveText("Status");
    await expect(table.locator('[data-exo="table-row"][aria-label="Open Alice Smith"]')).toHaveCount(1);
    await expect(emptyTable.locator('[data-exo="table-empty"]')).toContainText("No archived members.");
    // Two <tbody> since the state rows left the stream container (c385921): the
    // rows body is the one that is busy, the state body only hosts the status row.
    const stateBody = loadingTable.locator('tbody[data-exo="table-state-body"]');
    const rowsBody = loadingTable.locator('tbody:not([data-exo="table-state-body"])');
    await expect(rowsBody).toHaveAttribute("aria-busy", "true");
    await expect(stateBody).not.toHaveAttribute("aria-busy", /.*/);
    await expect(loadingTable.locator('[data-exo="table-loading"]')).toHaveAttribute("role", "status");
    await expect(loadingTable.locator('[data-exo="table-loading"]')).toContainText("Loading member rows...");
  });

  test("list renders description-list semantics", async ({ page }) => {
    await gotoStory(page, "/components/data_display/list");

    const canvas = story(page);
    const list = canvas.locator('dl[data-exo="list"]');

    await expect(list).toHaveCount(1);
    await expect(list.locator('dt[data-exo="list-title"]').first()).toHaveText("Full name");
    await expect(list.locator('dd[data-exo="list-content"]').first()).toHaveText("Alice Smith");
  });

  test("card components expose header, body, trend, and trailing slots", async ({ page }) => {
    await gotoStory(page, "/components/data_display/content_card");

    const canvas = story(page);
    const overview = canvas.locator("#content-card-single-overview");
    const withAction = canvas.locator("#content-card-single-with-action");
    const bodyOnly = canvas.locator("#content-card-single-body-only");

    await expect(overview.locator('[data-exo="card-title"]')).toHaveText("Overview");
    await expect(overview.locator('[data-exo="card-body"]')).toContainText(
      "A simple card for grouping related text or controls."
    );
    await expect(withAction.locator('[data-exo="card-action"] [data-exo="btn"]')).toHaveText("View");
    await expect(bodyOnly.locator('[data-exo="card-header"]')).toHaveCount(0);
    await expect(bodyOnly.locator('[data-exo="card-body"]')).toHaveText(
      "A compact body-only card without a header."
    );

    await gotoStory(page, "/components/data_display/stat_card");

    const statCanvas = story(page);
    const positiveStat = statCanvas.locator("#stat-card-single-positive-trend");
    const negativeStat = statCanvas.locator("#stat-card-single-negative-trend");
    const minimalStat = statCanvas.locator("#stat-card-single-minimal");

    await expect(positiveStat.locator('[data-exo="stat-card-label"]')).toHaveText("Total users");
    await expect(positiveStat.locator('[data-exo="stat-card-value"]')).toHaveText("12,481");
    await expect(positiveStat.locator('[data-exo="stat-card-icon"] [data-exo="icon"]')).toHaveCount(1);
    await expect(positiveStat.locator('[data-exo="stat-card-trend"]')).toHaveAttribute("data-direction", "up");
    await expect(positiveStat.locator('[data-exo="stat-card-trend"]')).toHaveAttribute(
      "aria-label",
      "Up 12 percent versus last month"
    );
    await expect(negativeStat.locator('[data-exo="stat-card-trend"]')).toHaveAttribute("data-direction", "down");
    await expect(negativeStat.locator('[data-exo="stat-card-trend"]')).toHaveAttribute(
      "aria-label",
      "Down 3.1 percent versus last month"
    );
    await expect(minimalStat.locator('[data-exo="stat-card-bottom"]')).toHaveCount(0);

    await gotoStory(page, "/components/data_display/metric_card");

    const metricCanvas = story(page);
    const defaultMetric = metricCanvas.locator("#metric-card-single-default");
    const trailingMetric = metricCanvas.locator("#metric-card-single-with-trailing");

    await expect(defaultMetric.locator('[data-exo="metric-card-label"]')).toHaveText("Conversion rate");
    await expect(defaultMetric.locator('[data-exo="metric-card-subtitle"]')).toHaveText("From 1,240 sessions");
    await expect(trailingMetric.locator('[data-exo="badge"]')).toHaveAttribute("data-variant", "success");
    await expect(trailingMetric.locator('[data-exo="metric-card-value"]')).toHaveText("$87.50");
  });

  test("flash and toast notifications expose live-region roles and close controls", async ({ page }) => {
    await gotoStory(page, "/components/feedback/flash");

    const canvas = story(page);
    const success = canvas.locator('[data-exo="flash"][data-kind="success"]');
    const warning = canvas.locator('[data-exo="flash"][data-kind="warning"]');
    const error = canvas.locator('[data-exo="flash"][data-kind="error"]');

    await expectAttribute(success, "role", "status");
    await expectAttribute(warning, "role", "alert");
    await expectAttribute(error, "aria-live", "assertive");
    await expect(error.locator('[data-exo="flash-close"]')).toHaveAttribute("type", "button");
    await expect(error.locator('[data-exo="flash-close"] [data-exo="icon"]')).toHaveCount(1);

    await gotoStory(page, "/components/feedback/toast_container");

    const toastCanvas = story(page);
    const container = toastCanvas.locator(
      '[data-exo="toast-container"][data-placement="bottom-right"][data-auto-dismiss="false"]',
    );
    const autoContainer = toastCanvas.locator('[data-exo="toast-container"][data-auto-dismiss="true"]');
    const errorToast = toastCanvas.locator("#toast-3");

    await expectAttribute(container, "data-placement", "bottom-right");
    await expectAttribute(container, "role", "region");
    await expectAttribute(container, "aria-label", "Notifications");
    await expectAttribute(autoContainer, "data-ready", "true");
    await expectAttribute(autoContainer, "data-auto-dismiss", "true");
    await expectAttribute(autoContainer, "data-duration", "60000");
    await expectAttribute(errorToast, "role", "alert");
    await expectAttribute(errorToast, "aria-live", "assertive");
    await expect(errorToast.locator('[data-exo="toast-close"]')).toHaveAttribute("type", "button");
    await expect(errorToast.locator('[data-exo="toast-close"] [data-exo="icon"]')).toHaveCount(1);
  });
});
