import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  use: { 
    baseURL: process.env.E2E_BASE_URL || "http://localhost:4173", 
    trace: "on-first-retry" 
  },
  projects: [
    { name: "chromium", use: { ...devices["Pixel 7"] } },
    { name: "webkit",   use: { ...devices["iPhone 14"] } },
    { name: "firefox",  use: { ...devices["Desktop Firefox"] } }
  ],
  reporter: [["list"], ["html", { outputFolder: "playwright-report" }]]
});