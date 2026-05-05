const { test, expect } = require("@playwright/test");

const {
  expectAttribute,
  gotoStory,
  story
} = require("./helpers/storybook");

test.describe("import export workflow", () => {
  test("reviews a selected file, validates import rows, commits them, and prepares export", async ({
    page
  }) => {
    await gotoStory(page, "/components/recipes/import_export_workflow");

    const canvas = story(page);
    const root = canvas.locator('[data-exo="import-export-workflow"]');
    const state = canvas.locator("#import-export-state");
    const file = root.locator("#import-export-file");
    const rows = root.locator("#import-review-table [data-exo=\"table-row\"]");

    await expectAttribute(root, "data-import-state", "idle");
    await expect(rows).toHaveCount(0);

    await file.setInputFiles({
      name: "accounts.csv",
      mimeType: "text/csv",
      buffer: Buffer.from("account,owner,amount\nNorthstar,Iva,18000\n")
    });
    await expect
      .poll(async () => file.evaluate((node) => node.files[0]?.name))
      .toBe("accounts.csv");

    await root.getByRole("button", { name: "Review sample import" }).click();
    await expectAttribute(root, "data-import-state", "reviewing");
    await expect(state).toHaveAttribute("data-import-progress", "40");
    await expect(rows).toHaveCount(3);
    await expect(root.locator("#import-review-row-helio")).toContainText("Duplicate domain");

    await root.getByRole("button", { name: "Validate import" }).click();
    await expectAttribute(root, "data-import-state", "validated");
    await expect(state).toHaveAttribute("data-valid-count", "2");
    await expect(state).toHaveAttribute("data-warning-count", "1");
    await expect(root.locator('[data-exo="alert"]')).toContainText("1 staged rows have warnings");

    await root.getByRole("button", { name: "Commit import" }).click();
    await expectAttribute(root, "data-import-state", "committed");
    await expect(state).toHaveAttribute("data-committed-count", "3");
    await expect(root.locator('[data-exo="progress"]')).toHaveAttribute("aria-valuenow", "100");

    await root.getByLabel("Export format").selectOption("json");
    await expectAttribute(root, "data-export-format", "json");
    await root.getByRole("button", { name: "Prepare export" }).click();
    await expectAttribute(root, "data-export-state", "ready");
    await expect(state).toHaveAttribute("data-export-filename", "account-import-review.json");
    await expect(root.locator("#export-package")).toContainText("account-import-review.json");
  });
});
