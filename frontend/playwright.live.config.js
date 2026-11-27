import { defineConfig, devices } from '@playwright/test';

// Uji asap untuk situs yang SUDAH online (bukan build lokal).
// Pakai: npm run test:live            (default: GitHub Pages)
//        LIVE_URL=https://situs-lain/ npm run test:live
const LIVE_URL = process.env.LIVE_URL || 'https://revaliyanasari.github.io/UAS_Alpro/';

export default defineConfig({
  testDir: './e2e-live',
  outputDir: './e2e/.results/live',
  timeout: 90_000,
  workers: 1,
  reporter: [['list']],
  use: { baseURL: LIVE_URL, channel: 'msedge', screenshot: 'only-on-failure' },
  projects: [
    { name: 'live-ponsel', use: { ...devices['Pixel 7'], viewport: { width: 360, height: 800 }, channel: 'msedge' } },
    { name: 'live-laptop', use: { viewport: { width: 1440, height: 900 }, channel: 'msedge' } },
  ],
});
