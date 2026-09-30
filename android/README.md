# Career Tracker — Android APK Project

A dedicated, lightweight native Android wrapper for the **Career Tracker** application, allowing you to run your complete personal study & habit tracking OS directly on Android phones as an APK.

> **CRITICAL ARCHITECTURAL GUARANTEE:**  
> The existing web application, components, CSS, Supabase backend, database schema, desktop/Windows `.exe` build configuration, and business logic remain **100% UNCHANGED and READ-ONLY**. All mobile project files and build configurations are strictly isolated inside `/android`.

---

## 1. Overview & Architecture

- **Shell:** Modern native Android application with hardware-accelerated WebView.
- **Application ID / Package:** `com.leadtracker.careertracker`
- **Application Label:** `Career Tracker`
- **Core Capabilities:**
  - Full access to all views: **MONTH**, **WEEK**, **TODAY**, **PROGRESS**, **SETTINGS**.
  - Interactive checklists (DSA, Semester Answers 1/2/3, Prime 3.0, Project Milestones).
  - Real-time clock, date navigation, and End-of-Day review.
  - Supabase synchronization (direct REST API communication via anon key).
  - Responsive layout with safe edge-to-edge system insets (notch & gesture navigation support).
  - Proper Android system Back button handling (page history navigation before app exit).
  - External link handling (e.g. YouTube playlist lectures open in the YouTube app or browser).
  - Offline error screen with an automatic "Retry Connection" button.

---

## 2. Web App Connection Configuration (`WEB_APP_URL`)

The Android application is designed with a single configuration parameter: `WEB_APP_URL`.

You can set it in `android/gradle.properties`:

```properties
WEB_APP_URL=local
```

### Supported Values:

1. **`local` (Default — Standalone & Offline Ready)**:
   - Uses the web assets bundled directly inside the APK (`assets/www/index.html`).
   - Powered by AndroidX `WebViewAssetLoader` over secure `https://appassets.androidplatform.net/`.
   - **Does NOT require your PC to be on or any local server running.**
   - Connects directly to Supabase cloud database whenever internet is available.

2. **`http://10.0.2.2:3000` (Android Emulator)**:
   - Connects the Android Emulator to your computer's local development server (`npm start` or `node server.js`).

3. **`http://<YOUR_PC_IP>:3000` (Physical Android Phone via Wi-Fi)**:
   - Example: `WEB_APP_URL=http://192.168.1.15:3000`
   - Connects your physical phone to your development machine on the same local Wi-Fi.

4. **`https://your-domain.com` (Hosted Web Deployment)**:
   - Example: `WEB_APP_URL=https://careertracker.vercel.app`
   - Points to your live web production deployment.

---

## 3. Environment & Prerequisites

- **Java JDK:** JDK 17 (or Java 17+ LTS).
- **Android SDK:** Android SDK Platform 35 (Android 15) or 34/36.
- **Build Tools:** Android SDK Build-Tools 35.0.0+.
- **Gradle:** 8.14.3 (included via `gradlew` / `gradlew.bat`).
- **Android Gradle Plugin (AGP):** 8.7.3.
- **Kotlin:** 2.0.21.

---

## 4. How to Build the APK

Navigate to the `android/` directory:

```powershell
cd android
```

### Build Debug APK:
```powershell
./gradlew assembleDebug
```
*Or with a custom URL on the command line:*
```powershell
./gradlew assembleDebug -PWEB_APP_URL=local
```

### Build Release APK:
```powershell
./gradlew assembleRelease
```

---

## 5. APK Output Locations

- **Debug APK:**  
  `android/app/build/outputs/apk/debug/app-debug.apk`

- **Release APK:**  
  `android/app/build/outputs/apk/release/app-release-unsigned.apk` (or `app-release.apk`)

---

## 6. How to Install the APK on Your Android Phone

### Method A: Direct USB Installation (via ADB)
1. Enable **Developer Options** and **USB Debugging** on your phone.
2. Connect your phone to your PC with a USB cable.
3. Run:
   ```bash
   adb install -r app/build/outputs/apk/debug/app-debug.apk
   ```

### Method B: Wireless / File Transfer
1. Copy `app-debug.apk` to your phone via:
   - Google Drive, WhatsApp, Telegram, or USB file transfer.
2. On your phone, tap the APK file in your File Manager.
3. Allow "Install unknown apps" if prompted.
4. Tap **Install** and launch **Career Tracker**!

---

## 7. Supabase Database Integration

The Android application communicates with your existing Supabase project:
- **Project URL:** `https://seexdeigpglovjrneowq.supabase.co`
- Uses the standard public client anon key already configured in the web app.
- **Zero changes** to your database schema, RLS policies, tables, or backend logic.
- Both your desktop browser, Electron app, and Android phone stay in sync on the same data.
