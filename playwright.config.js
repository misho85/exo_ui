const { defineConfig, devices } = require("@playwright/test");

const TEST_TIMEOUT = Number.parseInt(process.env.PLAYWRIGHT_TEST_TIMEOUT || "90000", 10);
const EXPECT_TIMEOUT = Number.parseInt(process.env.PLAYWRIGHT_EXPECT_TIMEOUT || "10000", 10);
const SERVER_TIMEOUT = Number.parseInt(process.env.PLAYWRIGHT_SERVER_TIMEOUT || "300000", 10);

module.exports = defineConfig({
  testDir: "./test/browser",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  timeout: TEST_TIMEOUT,
  expect: {
    timeout: EXPECT_TIMEOUT
  },
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:4100",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  },
  webServer: {
    // PLAYWRIGHT=1 starts no esbuild watcher, and the bundle is not in git (KRF-404):
    // build it first so the suite never runs against a missing or stale storybook.js.
    command: "cd storybook && mix assets.build && PLAYWRIGHT=1 mix phx.server",
    url: "http://127.0.0.1:4100/welcome",
    reuseExistingServer: !process.env.CI,
    timeout: SERVER_TIMEOUT
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"]
      }
    }
  ]
});
