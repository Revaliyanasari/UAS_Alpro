import { defineConfig, configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Warna diambil dari token desain (src/styles/tokens.css).
const THEME_COLOR = '#7CC6C4';
const BACKGROUND_COLOR = '#FFF8EA';

// Proxy AI (backend/src/server.js). API key hanya ada di backend/.env, tidak pernah di frontend.
const AI_PROXY = { '/api': { target: 'http://localhost:8787', changeOrigin: true } };

// Alamat dasar aplikasi. Lokal & Netlify: '/'. GitHub Pages: '/UAS_Alpro/' (diatur oleh scripts/deploy-pages.mjs).
const BASE = process.env.VITE_BASE || '/';

export default defineConfig({
  base: BASE,
  server: { proxy: AI_PROXY },
  preview: { proxy: AI_PROXY },
  plugins: [
    react(),
    VitePWA({
      // autoUpdate + skipWaiting/clientsClaim: versi baru langsung aktif setelah deploy.
      // Sebelumnya 'prompt': service worker baru MENUNGGU sampai tombol 'Muat ulang' ditekan (tombolnya
      // tertutup latar halaman), sehingga siswa terus melihat versi lama walau situs sudah diperbarui.
      // Muat ulang otomatis ditunda selama pelajaran/kuis/game (src/pwa/UpdatePrompt.jsx).
      registerType: 'autoUpdate',
      includeAssets: ['icons/favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'Algebra Adventure',
        short_name: 'AlgebraAdv',
        description: 'Exploring the World of Algebra — belajar pemfaktoran bentuk aljabar',
        lang: 'id',
        start_url: BASE,
        scope: BASE,
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
        skipWaiting: true, // juga menyelamatkan perangkat yang masih memakai service worker versi lama
        clientsClaim: true,
        cleanupOutdatedCaches: true, // hanya cache file aplikasi; localStorage/IndexedDB (data siswa) tidak disentuh
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [new RegExp('^/api/')], // panggilan AI selalu ke jaringan
      },
      devOptions: { enabled: false },
    }),
  ],
  test: {
    environment: 'jsdom',
    testTimeout: 15_000, // uji interaksi panjang (mis. puluhan ketukan ubin) di laptop yang sibuk
    setupFiles: ['./src/test/setup.js'],
    // Uji mesin aljabar memakai test runner bawaan Node (npm run test:math).
    exclude: [...configDefaults.exclude, 'src/math/**', 'e2e/**', 'e2e-live/**'],
    css: false,
  },
});
