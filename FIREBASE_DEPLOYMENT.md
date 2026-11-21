# Firebase Hosting & Backend Deployment Guide

This guide covers full-stack deployment for **As-Siddique Islamic Academy** using the existing Firebase project and Cloud Run backend.

---

## 1. Existing Firebase & Cloud Infrastructure
- **Firebase Project ID:** `gen-lang-client-0175021821` (`.firebaserc`)
- **Primary Hosting Site & HTTPS URL:** `https://gen-lang-client-0175021821.web.app`
- **Cloud Firestore Database ID:** `ai-studio-assiddiqueislami-9f6874df-3ab3-47d1-8a0a-587cd48d2926`
- **Firebase Storage Bucket:** `gen-lang-client-0175021821.firebasestorage.app`
- **Express Backend Service (Cloud Run):** `as-siddique-academy-api` (region `asia-southeast1`)
- **Bootstrapped Super Admin Email:** `medhabikashcochingc@gmail.com`

---

## 2. Hosting & Security Configuration (`firebase.json`)
- **Build Output Folder:** `dist` (created by `npm run build`)
- **SPA Routing:** All page routes (`/**`) rewrite to `/index.html` cleanly
- **Backend API & SEO Rewrites:**
  - `/api/**` → Cloud Run `as-siddique-academy-api`
  - `/robots.txt` & `/sitemap.xml` → Cloud Run `as-siddique-academy-api`
- **Security & PWA Headers:**
  - Global HTTPS/security headers: `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy`, `Permissions-Policy`
  - `Cache-Control: no-cache, no-store, must-revalidate` on `/index.html`, `/sw.js`, `/manifest.webmanifest`, and `/offline.html`
  - `Content-Type: application/json` on `/.well-known/assetlinks.json`

---

## 3. Manual Steps Using an Android Phone (or Desktop Browser)
You can complete all Firebase Console steps directly from Chrome on your Android phone:

1. **Open Firebase Console:** Go to [https://console.firebase.google.com](https://console.firebase.google.com) in Chrome on your phone (enable **Desktop site** if menus feel cramped) and open project **`gen-lang-client-0175021821`**.
2. **Verify Google Sign-In:**
   - Go to **Build → Authentication → Sign-in method**.
   - Ensure **Google** is **Enabled**.
3. **Verify Authorized Domains:**
   - Go to **Build → Authentication → Settings → Authorized domains**.
   - Confirm both `gen-lang-client-0175021821.web.app` and `gen-lang-client-0175021821.firebaseapp.com` are listed. (Also add your AI Studio preview hostname if testing there.)
4. **Verify Storage & Firestore:**
   - Ensure **Firestore Database** `ai-studio-assiddiqueislami-9f6874df-3ab3-47d1-8a0a-587cd48d2926` is active.
   - Ensure **Storage** is initialized if staff/applicants upload admission documents or library PDFs.
5. **Deploy Rules & Hosting (Computer / Cloud Shell):**
   > **Note:** On an Android phone, you can use **Google Cloud Shell** directly in Chrome at [https://shell.cloud.google.com](https://shell.cloud.google.com) to run CLI commands without needing a laptop!
   ```bash
   npm ci
   npx tsc --noEmit
   npx eslint .
   npm run build

   # 1. Deploy Express backend to Cloud Run first so /api/** rewrites resolve:
   gcloud run deploy as-siddique-academy-api \
     --source . \
     --project gen-lang-client-0175021821 \
     --region asia-southeast1 \
     --allow-unauthenticated \
     --set-env-vars "NODE_ENV=production,APP_URL=https://gen-lang-client-0175021821.web.app"

   # 2. Deploy Firebase Hosting, Firestore Rules & Storage Rules:
   firebase deploy --project gen-lang-client-0175021821 --only hosting,firestore:rules,storage
   ```

---

## 4. Optional Environment Variables (Cloud Run)
Core ERP, LMS, Admissions, Result Portal, and Cash/Bank Fee Ledger work out of the box with missing external credentials showing **Not Configured** in Admin Settings. If needed later, add secrets on Cloud Run (never in frontend code):
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`
- `VIDEO_CONFERENCING_PROVIDER`, `VIDEO_CONFERENCING_BASE_URL`
