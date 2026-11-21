# Android App (TWA / AAB) Preparation Guide

This project is pre-configured to be wrapped into a native Google Play **Trusted Web Activity (TWA)** Android App Bundle (`.aab`) using **Bubblewrap CLI**, while keeping 100% of Firebase Auth, Firestore, ERP, LMS, and PWA offline capabilities synced with `https://gen-lang-client-0175021821.web.app`.

---

## 1. Configured Android Identity
- **Application ID (Package Name):** `in.assiddiqueacademy.app`
- **Display Name:** `As-Siddique Islamic Academy`
- **Launcher Name:** `As-Siddique Academy`
- **Theme / Status Bar Color:** `#06452C` (Dark Islamic Green)
- **Splash Screen Background:** `#F8F1DF` (Warm Ivory)
- **TWA Template File:** `twa/twa-manifest.template.json`
- **Digital Asset Links File:** `public/.well-known/assetlinks.json`

---

## 2. How to Generate Signing Key, Build `.aab`, and Link Domain
> **Important Security Notice:** Never commit `.keystore` files, keystore passwords, or private signing keys to GitHub. Keep a backup copy of your keystore safely in offline/encrypted storage — losing it prevents future Play Store app updates.

You can run these commands in **Google Cloud Shell** (`https://shell.cloud.google.com` in Chrome on your Android phone) or on any Windows/Mac/Linux computer with **Node.js 22+** and **Java JDK 17+**:

### Step 1: Deploy Verified Live PWA First
Confirm your live PWA works at:
- `https://gen-lang-client-0175021821.web.app/manifest.webmanifest`
- `https://gen-lang-client-0175021821.web.app/.well-known/assetlinks.json`

### Step 2: Install Bubblewrap CLI
```bash
npm install -g @bubblewrap/cli
```

### Step 3: Initialize & Generate Android Project + Keystore
Create a separate folder outside your repo (or make sure `*.keystore` / `android/` stays git-ignored):
```bash
mkdir twa-build && cd twa-build
bubblewrap init --manifest="https://gen-lang-client-0175021821.web.app/manifest.webmanifest"
```
When Bubblewrap asks prompts, verify/enter:
- **Package ID:** `in.assiddiqueacademy.app`
- **Application name:** `As-Siddique Islamic Academy`
- **Launcher name:** `As-Siddique Academy`
- **Host:** `gen-lang-client-0175021821.web.app`
- **Start URL:** `/`
- **Theme color:** `#06452C`
- **Background color:** `#F8F1DF`
- **Icon URL:** `https://gen-lang-client-0175021821.web.app/pwa-512x512.png`
- **Maskable Icon URL:** `https://gen-lang-client-0175021821.web.app/pwa-maskable-512x512.png`
- Allow Bubblewrap to generate a new signing keystore if you do not have one yet, and **save the alias & passwords safely**.

### Step 4: Get Your Real SHA-256 Fingerprint & Update Digital Asset Links
Print your real certificate SHA-256 fingerprint from the keystore:
```bash
keytool -list -v -keystore android.keystore -alias android | grep SHA256
```
*(Or, if using **Google Play App Signing**, copy the **App signing key certificate SHA-256** from Google Play Console → **Setup → App signing** after creating the app draft.)*

Open `public/.well-known/assetlinks.json` in your repository and replace `REPLACE_WITH_YOUR_ANDROID_KEYSTORE_SHA256_FINGERPRINT` with your actual `XX:XX:...` SHA-256 fingerprint, commit & push to `main` so Firebase Hosting serves it at:
`https://gen-lang-client-0175021821.web.app/.well-known/assetlinks.json`

> Without the real SHA-256 fingerprint deployed at `/.well-known/assetlinks.json`, Android will display a Chrome address bar at the top instead of full-screen standalone mode!

### Step 5: Build the Signed Android App Bundle (`.aab`)
```bash
bubblewrap build
```
Bubblewrap outputs `app-release-bundle.aab` (plus test `app-release-signed.apk`).

### Step 6: Test APK & Upload AAB to Google Play Console
1. **Test on your Android phone first:** Install `app-release-signed.apk` and confirm Google Sign-In works smoothly and the browser address bar does NOT appear.
2. **Play Console Upload:** In [Google Play Console](https://play.google.com/console), create app **`in.assiddiqueacademy.app`**, upload `app-release-bundle.aab` to **Internal testing** first, verify Asset Links with Google Play App Signing SHA-256, and submit for review only when ready.
