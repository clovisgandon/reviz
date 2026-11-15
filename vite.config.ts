/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';
import { readFileSync } from 'node:fs';

// Sur GitHub Pages, l'appli est servie sous /<nom-du-repo>/ : la GitHub Action
// fournit VITE_BASE. En local (et sur Netlify/Vercel) on reste à la racine.
const base = process.env.VITE_BASE ?? '/';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string };

export default defineConfig({
  base,
  define: {
    __APP_VERSION__: JSON.stringify(`${pkg.version} (${new Date().toISOString().slice(0, 10)})`),
  },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['favicon.svg', 'apple-touch-icon-180.png'],
      manifest: {
        name: 'RéviZ – révisions STAB 1',
        short_name: 'RéviZ',
        description: 'QCM, partiels blancs et contrôle sur table pour réviser le génie civil.',
        lang: 'fr',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#1f4e79',
        background_color: '#0f1c2b',
        start_url: '.',
        scope: '.',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Tout le bundle (JS, CSS, polices KaTeX, JSON des banques) est précaché :
        // l'appli fonctionne en mode avion après la première visite.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2,json,webmanifest}'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        navigateFallback: 'index.html',
      },
      devOptions: { enabled: false },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'],
  },
});
