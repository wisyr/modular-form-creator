import { defineConfig, devices } from '@playwright/test'

/**
 * End-to-end tests run against the real stack, e.g. `docker compose up -d --build`
 * (frontend on :5173, backend on :5001). Override the target with E2E_BASE_URL.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list']],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:5173',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
