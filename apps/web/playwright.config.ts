import { defineConfig, devices } from '@playwright/test';

// 专用端口，避免与本机已在跑的 next dev（3000/3001…）冲突
const PLAYWRIGHT_WEB_PORT = process.env.PLAYWRIGHT_WEB_PORT ?? '3477';
const defaultBaseURL = `http://127.0.0.1:${PLAYWRIGHT_WEB_PORT}`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: true,
  retries: 2,
  workers: 4,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.BASE_URL || defaultBaseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: devices['Desktop Chrome'],
    },
    {
      name: 'firefox',
      use: devices['Desktop Firefox'],
    },
    {
      name: 'webkit',
      use: devices['Desktop Safari'],
    },
    {
      name: 'Mobile Chrome',
      use: devices['Pixel 5'],
    },
    {
      name: 'Mobile Safari',
      use: devices['iPhone 12'],
    },
  ],
  webServer: {
    command: `npx next dev --hostname 127.0.0.1 -p ${PLAYWRIGHT_WEB_PORT}`,
    url: process.env.BASE_URL || defaultBaseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
