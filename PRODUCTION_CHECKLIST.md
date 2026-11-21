# Production Readiness Checklist — As-Siddique Islamic Academy

Use this checklist before opening live student, parent, and staff access on `https://gen-lang-client-0175021821.web.app`.

---

## 1. Automated Code & Build Verification (Completed in Repo)
- [x] `npx tsc --noEmit --noUnusedLocals --noUnusedParameters` passes with zero errors
- [x] `npx eslint .` and `npx eslint firestore.rules` pass with zero errors and zero warnings
- [x] `npm run build` produces clean production SPA + PWA bundle in `dist/`
- [x] `manifest.webmanifest`, `sw.js`, `offline.html`, `192×192`, `512×512`, maskable `512×512`, and `180×180` icons generated cleanly
- [x] Service worker excludes `/api/**`, `/__/**`, Firestore, Firebase Auth tokens, and private Storage URLs (`NetworkOnly`)
- [x] Express API (`/api/health`, `/api/integrations/status`, `/api/results/verify`, `/api/payments/verify`, `/api/notifications/dispatch`) handles missing optional keys gracefully with **Not Configured**

---

## 2. Firebase & Google Cloud Manual Verification
- [ ] Cloud Run backend `as-siddique-academy-api` deployed in `gen-lang-client-0175021821` (`asia-southeast1`)
- [ ] Firebase Hosting + Firestore rules + Storage rules deployed (`firebase deploy --only hosting,firestore:rules,storage`)
- [ ] **Google Sign-In** enabled in Firebase Authentication → Sign-in method
- [ ] `gen-lang-client-0175021821.web.app` and `gen-lang-client-0175021821.firebaseapp.com` confirmed under **Authorized domains**
- [ ] Super Admin login tested with `medhabikashcochingc@gmail.com` at `/login` → `/portal`
- [ ] Institution profile, contact details, principal name, and academic notices reviewed/updated under **Portal → Institution CMS** (replace any placeholder text before launch)

---

## 3. GitHub Automatic Deployment Setup
- [ ] Repository `medhabikashcochingc-blip/As-Siddique-islamic-academy` has branch `main` pushed
- [ ] Secret `FIREBASE_SERVICE_ACCOUNT_GEN_LANG_CLIENT_0175021821` added in GitHub Repository Secrets
- [ ] Push to `main` tested in GitHub **Actions** tab and completed green

---

## 4. Mobile, PWA & Android TWA Verification (On Your Android Phone)
- [ ] Visit `https://gen-lang-client-0175021821.web.app` in Android Chrome
- [ ] Tap **Install App** banner/button and verify full-screen standalone launch
- [ ] Toggle Airplane Mode to verify Offline banner and `/offline.html` fallback
- [ ] Replace `public/.well-known/assetlinks.json` placeholder with real keystore SHA-256 fingerprint before building final Play Store `.aab`
- [ ] Test internal release track `.aab` on Play Console for `in.assiddiqueacademy.app`

---

## 5. Optional Integrations (Configure Only When Needed)
- [ ] Razorpay payment gateway keys (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`) in Cloud Run env vars
- [ ] SMTP email relay (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`) in Cloud Run env vars
- [ ] Twilio SMS alerts (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`) in Cloud Run env vars
- [ ] Live video conferencing API config (`VIDEO_CONFERENCING_PROVIDER`, `VIDEO_CONFERENCING_BASE_URL`) in Cloud Run env vars
