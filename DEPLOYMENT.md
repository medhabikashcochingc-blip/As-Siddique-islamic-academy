# As-Siddique Islamic Academy — Production Deployment Architecture

## 1. Target Infrastructure (Existing Resources Only)
- **Firebase Project ID**: `gen-lang-client-0175021821`
- **Firebase Hosting Site & Primary Domain**: `https://gen-lang-client-0175021821.web.app` (site `gen-lang-client-0175021821`)
- **Cloud Firestore Database ID**: `ai-studio-assiddiqueislami-9f6874df-3ab3-47d1-8a0a-587cd48d2926`
- **Firebase Storage Bucket**: `gen-lang-client-0175021821.firebasestorage.app`
- **Cloud Run Backend Service**: `as-siddique-academy-api` (Region: `asia-southeast1`)

## 2. Full-Stack Request Routing (`firebase.json`)
Firebase Hosting serves the Vite React SPA (`dist/`) globally over CDN while rewriting dynamic backend routes directly to Cloud Run (`server.ts`):
1. `/api/**` -> Cloud Run `as-siddique-academy-api` (`GET /api/health`, `GET /api/integrations/status`, `POST /api/results/verify`, `POST /api/payments/create-order`, `POST /api/payments/verify`, `POST /api/notifications/dispatch`)
2. `/robots.txt` & `/sitemap.xml` -> Cloud Run `as-siddique-academy-api` (dynamic SEO generation)
3. `/**` -> `/index.html` (React Router SPA for all 20 public pages, `/results`, `/login`, `/portal/*`)

> **Important**: Never deploy Firebase Hosting without first deploying the Cloud Run service `as-siddique-academy-api` in project `gen-lang-client-0175021821` (region `asia-southeast1`), otherwise `/api/**` rewrites will fail to resolve the Cloud Run origin.

## 3. Production Environment Variables (Cloud Run)
Set non-secret and secret environment variables on the Cloud Run service (never in frontend code):
- `NODE_ENV=production`
- `APP_URL=https://gen-lang-client-0175021821.web.app`
- Optional integrations (app runs non-blocking in `"Not Configured"` fallback mode if omitted):
  - Payment Gateway: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
  - Email Alerts: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
  - SMS Alerts: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`
  - Video Conferencing: `VIDEO_CONFERENCING_PROVIDER`, `VIDEO_CONFERENCING_BASE_URL`

## 4. Deployment Sequence (Do Not Run Until Ready)
1. **Verify build & types locally**:
   ```bash
   npm run lint
   npm run build
   npx eslint firestore.rules
   ```
2. **Deploy Cloud Run Backend (`server.ts`) to `gen-lang-client-0175021821`**:
   ```bash
   gcloud run deploy as-siddique-academy-api \
     --source . \
     --project gen-lang-client-0175021821 \
     --region asia-southeast1 \
     --allow-unauthenticated \
     --set-env-vars "NODE_ENV=production,APP_URL=https://gen-lang-client-0175021821.web.app"
   ```
3. **Deploy Firebase Hosting + Storage Rules (Firestore rules already deployed)**:
   ```bash
   firebase login
   firebase deploy --project gen-lang-client-0175021821 --only hosting,storage,firestore:rules
   ```

## 5. Post-Deployment Verification Checklist
- Open `https://gen-lang-client-0175021821.web.app/api/health` -> verify `{"ok": true}`.
- Open `https://gen-lang-client-0175021821.web.app/api/integrations/status` -> verify integration status.
- In Firebase Console (`gen-lang-client-0175021821`):
  - Ensure **Google Sign-In** is enabled under *Authentication -> Sign-in method*.
  - Confirm `gen-lang-client-0175021821.web.app` and `gen-lang-client-0175021821.firebaseapp.com` are in *Authentication -> Settings -> Authorized domains*.
  - Confirm **Firebase Storage** is initialized if uploading admission documents or library PDFs.
- Sign in on `/login` with `medhabikashcochingc@gmail.com` to access `/portal` as `super_admin`.
