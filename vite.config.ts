import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import devtools from 'solid-devtools/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    devtools(),
    solidPlugin(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['mask-icon.svg', 'icon.svg'],
      manifest: {
        name: 'Troc & Services',
        short_name: 'Troc & Services',
        description: 'Plateforme de troc et services entre particuliers',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // Service Worker minimal - pas de cache pour fonctionnement hors ligne
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        // Pas de stratégie de cache, juste un service worker minimal pour l'installation
        runtimeCaching: [],
        // Désactiver le cache pour les assets statiques aussi
        skipWaiting: true,
        clientsClaim: true,
      },
      // Injecter le manifeste dans index.html
      injectManifest: false,
      // Utiliser le mode generateSW (par défaut)
      strategies: 'generateSW',
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
});
