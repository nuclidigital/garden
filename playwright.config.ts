import { existsSync } from "node:fs"
import { defineConfig } from "@playwright/test"

const browserCandidates = [
  process.env.PLAYWRIGHT_CHROMIUM_PATH,
  "/usr/sbin/chromium",
  "/usr/bin/chromium",
  "/usr/bin/google-chrome",
].filter((candidate): candidate is string => Boolean(candidate))

const executablePath = browserCandidates.find(existsSync)

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "test-results",
  fullyParallel: false,
  workers: 1,
  forbidOnly: true,
  retries: 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: "http://127.0.0.1:4173",
    headless: true,
    launchOptions: executablePath ? { executablePath } : undefined,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop-1440",
      use: { viewport: { width: 1440, height: 900 } },
    },
    {
      name: "tablet-1024",
      use: { viewport: { width: 1024, height: 768 }, hasTouch: true },
    },
    {
      name: "mobile-390",
      use: { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true },
    },
  ],
  webServer: {
    command: "node scripts/serve-regression.mjs",
    url: "http://127.0.0.1:4173/",
    reuseExistingServer: false,
    stdout: "ignore",
    stderr: "pipe",
    timeout: 15_000,
  },
})
