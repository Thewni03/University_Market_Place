// @ts-check
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './test-cases',

  fullyParallel: true,
  retries: 0,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:5173', 
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // ❌ No webServer (we run servers manually for stability)
});