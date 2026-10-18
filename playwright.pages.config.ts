import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/pages-browser',
  timeout: 30000,
  globalTimeout: 60000,
  workers: 1,
  reporter: 'list',
  outputDir: 'artifacts/pages-results',
  use: { baseURL: 'http://127.0.0.1:4323/', channel: 'chromium', headless: true },
  webServer: {
    command: 'npm run preview -- --port 4323 --ignore-lock',
    url: 'http://127.0.0.1:4323/en/',
    timeout: 15000,
    reuseExistingServer: false,
    env: { SITE_BASE: '/', BUILD_OUTPUT: './dist-pages', SITE_URL: 'https://chenshiyieit.github.io' },
  },
});
