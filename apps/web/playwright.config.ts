import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  use: { baseURL: "http://localhost:5173" },
  webServer: {
    command: "VITE_API_BASE=http://localhost:5173 pnpm dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
