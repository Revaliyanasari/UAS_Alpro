import { defineConfig, configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Warna diambil dari token desain (src/styles/tokens.css).
const THEME_COLOR = '#7CC6C4';
const BACKGROUND_COLOR = '#FFF8EA';

// Proxy AI (backend/src/server.js). API key hanya ada di backend/.env, tidak pernah di frontend.
const AI_PROXY = { '/api': { target: 'http://localhost:8787', changeOrigin: true } };

export default defineConfig({
  server: { proxy: AI_PROXY },
  preview: { proxy: AI_PROXY },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt', // siswa memilih kapan memuat versi baru (tidak memotong tes)
      includeAssets: ['icons/favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'Algebra Adventure',
        short_name: 'AlgebraAdv',
        description: 'Exploring the World of Algebra — belajar pemfaktoran bentuk aljabar',
        lang: 'id',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: THEME_COLOR,
        background_color: BACKGROUND_COLOR,
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // .woff (format lama) tidak di-cache; browser modern memakai .woff2.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,json}'],
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [new RegExp('^/api/')], // panggilan AI selalu ke jaringan
      },
      devOptions: { enabled: false },
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    // Uji mesin aljabar memakai test runner bawaan Node (npm run test:math).
    exclude: [...configDefaults.exclude, 'src/math/**', 'e2e/**'],
    css: false,
  },
});
