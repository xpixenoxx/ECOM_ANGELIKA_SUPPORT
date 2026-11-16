import fs from 'fs';
import { defineConfig, devices, chromium } from '@playwright/test';

const hasBundledChromium = fs.existsSync(chromium.executablePath());
const systemChromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const useChromeChannel = !hasBundledChromium && fs.existsSync(systemChromePath);

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 2 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env['PLAYWRIGHT_BASE_URL'] || 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
    ...(useChromeChannel ? { channel: 'chrome' as const } : {}),
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        ...(useChromeChannel ? { channel: 'chrome' as const } : {}),
      },
    },
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        ...(useChromeChannel ? { channel: 'chrome' as const } : {}),
      },
    },
  ],
  webServer: {
    command: 'node .next/standalone/server.js',
    url: 'http://127.0.0.1:3000/api/health',
    reuseExistingServer: !process.env['CI'],
    timeout: 120000,
    env: {
      PORT: '3000',
      HOSTNAME: '127.0.0.1',
    },
  },
});
