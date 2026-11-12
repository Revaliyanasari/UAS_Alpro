import { defineConfig, devices } from '@playwright/test';

// Uji end-to-end memakai Microsoft Edge yang sudah terpasang (channel 'msedge'),
// terhadap hasil build produksi (npm run build) agar PWA/service worker ikut teruji.
export default defineConfig({
  testDir: './e2e',
  outputDir: './e2e/.results',
  fullyParallel: true,
  workers: 2, // laptop pengembang: 4 browser sekaligus membuat uji ponsel melewati batas waktu
  timeout: 60_000,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    channel: 'msedge',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'ponsel-360', use: { ...devices['Pixel 7'], viewport: { width: 360, height: 800 }, channel: 'msedge' } },
    { name: 'laptop-1440', use: { viewport: { width: 1440, height: 900 }, channel: 'msedge' } },
  ],
  webServer: {
    command: 'node node_modules/vite/bin/vite.js preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
