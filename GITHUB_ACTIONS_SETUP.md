# GitHub Actions Automatic Deployment Setup

Repository: **`medhabikashcochingc-blip/As-Siddique-islamic-academy`**  
Branch: **`main`**

---

## 1. Included Workflows
1. **Production Deployment (`.github/workflows/firebase-hosting-deploy.yml`)**
   - Triggers automatically on every `push` to `main` (and supports manual `workflow_dispatch`).
   - Runs `npm ci` → `npx tsc --noEmit --noUnusedLocals --noUnusedParameters` → `npx eslint .` → `npm run build`.
   - Verifies PWA outputs (`manifest.webmanifest`, `sw.js`, `offline.html`, PNG icons, `.well-known/assetlinks.json`) and smoke-tests `server.ts` (`/api/health`, `/api/integrations/status`).
   - Deploys Firebase Hosting **live** channel (`gen-lang-client-0175021821`) only after all checks pass.
   - Optionally deploys Cloud Run backend (`as-siddique-academy-api`) if GCP Workload Identity secrets are also configured.
2. **Pull Request Preview (`.github/workflows/firebase-hosting-preview.yml`)**
   - Triggers on `pull_request` targeting `main`.
   - Runs verification checks + builds and publishes a temporary Firebase Hosting Preview URL on the PR without touching live production.

---

## 2. Step-by-Step Setup Using an Android Phone
Follow these steps in **Chrome on Android** (or desktop browser):

### Step A: Generate Your Firebase CI Service Account Secret
1. Open [https://shell.cloud.google.com](https://shell.cloud.google.com) in Chrome on your Android phone (set Chrome menu → **Desktop site** if helpful).
2. Run:
   ```bash
   npx firebase-tools login:ci --no-localhost
   ```
   *(Or better yet, create a Service Account JSON key in Google Cloud Console → **IAM & Admin → Service Accounts** for `gen-lang-client-0175021821` with roles **Firebase Hosting Admin** and **API Keys Viewer**, and download/copy the JSON key.)*
3. Keep that JSON text private — **never commit it to any file in GitHub**.

### Step B: Add Required Secret in GitHub Mobile Browser
1. Open Chrome on your Android phone and go to:  
   `https://github.com/medhabikashcochingc-blip/As-Siddique-islamic-academy`
2. Tap **Settings** (top repository tabs; scroll right or switch Chrome to **Desktop site** if hidden).
3. In the left menu, expand **Secrets and variables** → tap **Actions**.
4. Tap **New repository secret** and create:
   - **Name:** `FIREBASE_SERVICE_ACCOUNT_GEN_LANG_CLIENT_0175021821`
   - **Secret:** Paste the entire Firebase Service Account JSON content.
5. Tap **Add secret**.

### Step C (Recommended for Backend API Auto-Deploy): Optional Cloud Run Secrets
If you also want pushes to `main` to rebuild `as-siddique-academy-api` on Cloud Run automatically, add these two repository secrets:
- `GCP_WORKLOAD_IDENTITY_PROVIDER`
- `GCP_SERVICE_ACCOUNT`

### Step D: Optional Manual Approval Protection
To require your explicit approval before live Hosting deploys:
1. Open **Settings → Environments → New environment** → create `production`.
2. Check **Required reviewers**, add your GitHub account (`medhabikashcochingc-blip`), and tap **Save protection rules**.

### Step E: Watch Deployments From Your Phone
1. Tap the **Actions** tab on GitHub (`github.com/medhabikashcochingc-blip/As-Siddique-islamic-academy/actions`).
2. Every push to `main` shows live green/red status for **TypeScript**, **ESLint**, **PWA Build**, and **Deploy to Firebase Hosting**.
