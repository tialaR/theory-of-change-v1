import { defineConfig, devices } from '@playwright/test';

const useSystemChrome = process.env.TDM_PLAYWRIGHT_BROWSER === 'system-chrome';
const executablePath = process.env.TDM_PLAYWRIGHT_EXECUTABLE_PATH;

export default defineConfig({
  testDir: './src',
  testMatch: '**/*.e2e.ts',
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        ...(useSystemChrome ? { channel: 'chrome' as const } : {}),
        ...(executablePath ? { launchOptions: { executablePath } } : {}),
        viewport: { width: 1440, height: 900 }
      }
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000/canvas',
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  }
});
