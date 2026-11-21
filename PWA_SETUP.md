# PWA Setup & Maintenance Guide — As-Siddique Islamic Academy

This guide explains how the Progressive Web App (PWA) is configured in this repository and how to install or test it on an **Android phone** or desktop browser.

---

## 1. Configured Manifest & App Identity
The PWA manifest is generated automatically during `npm run build` by `vite-plugin-pwa` in `vite.config.ts` and served at `/manifest.webmanifest`:

- **App Name:** `As-Siddique Islamic Academy`
- **Short Name:** `As-Siddique`
- **Theme Color (Dark Islamic Green):** `#06452C`
- **Background Color (Warm Ivory):** `#F8F1DF`
- **Display Mode:** `standalone`
- **Start URL / Scope / ID:** `/`
- **App Shortcuts:** Result Portal (`/results`), Online Admission (`/admission`), Student Portal (`/student`)

---

## 2. Icons & Offline Assets (`public/`)
- `public/icon.svg` — Vector icon for modern desktop tabs
- `public/pwa-192x192.png` — `192×192` standard icon (`purpose: "any"`)
- `public/pwa-512x512.png` — `512×512` splash & store icon (`purpose: "any"`)
- `public/pwa-maskable-512x512.png` — `512×512` full-bleed emerald icon with safe-zone margin (`purpose: "maskable"`)
- `public/apple-touch-icon.png` — `180×180` non-transparent iOS home screen icon
- `public/offline.html` — Branded offline fallback page shown if connectivity drops

---

## 3. Safe Caching & Privacy Protection
Configured in `vite.config.ts` (`workbox.runtimeCaching` & `navigateFallbackDenylist`):
- **Never Cached (`NetworkOnly`):**
  - All backend API routes (`/api/**`) including payment verification, result tokens, and notification dispatch
  - Firebase Auth routes (`/__/**`), Google Identity Toolkit, Secure Token, and OAuth endpoints
  - Cloud Firestore (`firestore.googleapis.com`) and Firebase Storage (`firebasestorage.googleapis.com`) requests
- **Cached Safely:**
  - App shell static assets (`JS`, `CSS`, `HTML`, `PNG`, `SVG`, `WOFF2`)
  - Google Fonts (`CacheFirst`) and local academy showcase photography (`StaleWhileRevalidate`)

---

## 4. Automatic Update Detection & Offline Indicator
- **Update Banner (`src/components/pwa/ServiceWorkerUpdater.tsx`):** Checks automatically on tab focus/visibility and every 15 minutes while online. When a new release is detected, an **Update Available** notification with a **Refresh** button appears cleanly without interrupting active form or portal edits.
- **Install Button (`src/components/pwa/PWAInstallButton.tsx`):** Mounted in the public header/drawer, Student Portal header/drawer, and ERP/LMS portal header, plus an automatic `PWAInstallBanner` on supported Android Chrome browsers. Automatically hides once installed in standalone mode, and provides guided installation dialogs for both Android Chrome and iOS Safari.
- **Offline Banner (`src/components/pwa/OfflineIndicator.tsx`):** Appears automatically whenever the device goes offline.

---

## 5. How to Install & Test Using an Android Phone (Beginner Steps)
1. Open **Google Chrome** on your Android phone.
2. Visit your live site: `https://gen-lang-client-0175021821.web.app` (or your preview URL).
3. Wait a few seconds for the page to finish loading.
4. Tap **Install App** in the top bar (or open Chrome’s **⋮** three-dot menu → **Add to Home screen** / **Install app**).
5. Tap **Install**. The **As-Siddique Academy** icon appears on your Android home screen and launches full-screen without a browser URL bar.
6. **Test Offline Mode:** Turn on **Airplane Mode** on your phone, open the installed app, and confirm the **Offline Mode** indicator appears without crashing. Turn Airplane Mode back off and tap **Retry**.
