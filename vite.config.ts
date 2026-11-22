import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

function normalizeBasePath(raw?: string): string {
  const trimmed = (raw || '/').trim();
  if (!trimmed || trimmed === '/') return '/';
  const withLeading = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default defineConfig(() => {
  const basePath = normalizeBasePath(process.env.VITE_BASE_PATH);
  const escapedBase = escapeRegExp(basePath);

  return {
    base: basePath,
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'prompt',
        includeAssets: [
          'manifest.webmanifest',
          'icon.svg',
          'apple-touch-icon.png',
          'offline.html',
          'pwa-192x192.png',
          'pwa-512x512.png',
          'pwa-maskable-512x512.png',
        ],
        manifest: false,
        workbox: {
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
          globPatterns: ['**/*.{js,mjs,css,html,ico,png,svg,woff,woff2,webmanifest}'],
          navigateFallback: `${basePath}index.html`,
          navigateFallbackDenylist: [
            new RegExp(`^${escapedBase}(api|__|\\.well-known|media)/`),
            /^\/api\//,
            /^\/__\//,
            /^\/\.well-known\//,
            /^\/media\//,
            /\.pdf(\?.*)?$/i,
            /offline\.html$/,
            /robots\.txt$/,
            /sitemap\.xml$/,
          ],
          runtimeCaching: [
            {
              urlPattern: /^\/api\/.*/i,
              handler: 'NetworkOnly',
            },
            {
              urlPattern: /^\/__\/.*/i,
              handler: 'NetworkOnly',
            },
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/(.*\.)?(googleapis|google|firebaseapp|firebaseio)\.com\/.*/i,
              handler: 'NetworkOnly',
            },
            {
              urlPattern: /\/src\/assets\/images\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'academy-local-images',
                expiration: {
                  maxEntries: 40,
                  maxAgeSeconds: 60 * 60 * 24 * 30,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
          navigateFallbackAllowlist: [/^\/$/],
        },
      }),
      // Copies src/assets into dist/, creates dist/404.html for GitHub Pages SPA fallback,
      // and adjusts dist/manifest.webmanifest base paths only when built for non-GitHub-Pages targets.
      {
        name: 'copy-unbundled-src-assets-and-spa-fallback',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(import.meta.dirname, 'dist');
          const srcAssets = path.resolve(import.meta.dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {recursive: true, force: true});
          }
          const distIndex = path.resolve(distDir, 'index.html');
          if (fs.existsSync(distIndex)) {
            fs.copyFileSync(distIndex, path.resolve(distDir, '404.html'));
          }
          const distManifest = path.resolve(distDir, 'manifest.webmanifest');
          if (
            basePath !== '/As-Siddique-islamic-academy/' &&
            fs.existsSync(distManifest)
          ) {
            const rawManifest = fs.readFileSync(distManifest, 'utf8');
            fs.writeFileSync(
              distManifest,
              rawManifest.replaceAll('/As-Siddique-islamic-academy/', basePath),
              'utf8'
            );
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
