# 📱 Android App Build Guide

This guide explains how to build the Income Expense App as an Android APK using GitHub Actions or locally.

## 🚀 Quick Start with GitHub Actions (Recommended)

### Option 1: Manual Trigger
1. Go to your GitHub repository
2. Click on **Actions** tab
3. Select **Build Android APK** workflow
4. Click **Run workflow** → Choose branch → **Run workflow**
5. Wait for the build to complete (~5-10 minutes)
6. Download the APK from **Artifacts** section

### Option 2: Automatic Trigger
The workflow automatically runs when you:
- Push to `main` or `working-app` branches
- Create a pull request to these branches
- Push a tag (e.g., `v1.0.0`) - creates a GitHub Release with APK

### Option 3: Tag Release (Best for Production)
```bash
# Create and push a version tag
git tag v1.0.0
git push origin v1.0.0
```
This will:
- Build the APK
- Create a GitHub Release
- Attach the APK to the release
- Generate release notes automatically

## 📦 What the GitHub Action Does

The workflow performs these steps:
1. ✅ Checks out your code
2. ✅ Sets up Node.js 18
3. ✅ Sets up Java JDK 17
4. ✅ Sets up Android SDK
5. ✅ Installs npm dependencies
6. ✅ Builds the React app
7. ✅ Syncs Capacitor assets
8. ✅ Builds the Android APK
9. ✅ Uploads APK as artifact
10. ✅ Creates release (for tags)

## 🔧 Local Build (Alternative)

### Prerequisites
- Node.js 18+
- Java JDK 17
- Android SDK
- Gradle

### Build Steps
```bash
# Navigate to ClientApp directory
cd IncomeExpenseApp/ClientApp

# Install dependencies
npm install

# Build React app
npm run build

# Sync Capacitor
npm run android:sync

# Build APK
npm run android:build
```

Or use the provided script:
```bash
# From project root
./build-android.sh
```

### Build Output
- **Debug APK**: `ClientApp/android/app/build/outputs/apk/debug/app-debug.apk`
- **Release APK**: `ClientApp/android/app/build/outputs/apk/release/app-release-unsigned.apk`

## 📥 Installing the APK

### On Physical Device
1. Download the APK from GitHub Actions artifacts or releases
2. Transfer to your Android device (USB/Email/Cloud)
3. Enable **Install from Unknown Sources**:
   - Go to Settings → Security → Unknown Sources (enable)
   - Or Settings → Apps → Special Access → Install Unknown Apps
4. Tap the APK file to install
5. Open the app!

### On Emulator (Android Studio)
```bash
# Start emulator first, then:
adb install path/to/app-debug.apk
```

## 🎯 GitHub Actions Workflow Features

### Artifacts
- **Debug APK**: Available for 30 days after build
- **Release APK**: Available for 90 days after build
- Named with commit SHA for easy identification

### Release Automation
When you push a tag (e.g., `v1.0.0`):
- Creates a GitHub Release automatically
- Attaches the APK file
- Generates comprehensive release notes
- Includes installation instructions

### Pull Request Comments
For PRs, the workflow automatically comments with:
- Build status
- APK size
- Download link
- Testing instructions

## 📊 Build Configuration

### App Information
- **Package ID**: `com.incomeexpense.app`
- **App Name**: Income Expense App
- **Min SDK**: 22 (Android 5.1+)
- **Target SDK**: Latest
- **Version**: 1.0

### Capacitor Config
Located in `ClientApp/capacitor.config.ts`:
```typescript
{
  appId: 'com.incomeexpense.app',
  appName: 'Income Expense App',
  webDir: 'build'
}
```

## 🔐 Signing the APK (Production)

For production releases, you should sign the APK:

1. **Generate a keystore**:
```bash
keytool -genkey -v -keystore my-release-key.keystore \
  -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

2. **Add to GitHub Secrets**:
   - `ANDROID_KEYSTORE_BASE64`: Base64 encoded keystore
   - `ANDROID_KEYSTORE_PASSWORD`: Keystore password
   - `ANDROID_KEY_ALIAS`: Key alias
   - `ANDROID_KEY_PASSWORD`: Key password

3. **Update workflow** to include signing step

## 🐛 Troubleshooting

### Build Fails
- Check workflow logs in GitHub Actions
- Ensure `capacitor.config.ts` exists
- Verify `android` folder is committed to git
- Check Node.js and Java versions

### APK Not Installing
- Enable Unknown Sources
- Check minimum Android version (5.1+)
- Try uninstalling old version first

### App Crashes
- Check logcat: `adb logcat`
- Verify all dependencies are included
- Test on multiple devices/Android versions

## 📝 Available npm Scripts

In `ClientApp` directory:
```bash
npm run build                 # Build React app
npm run android:sync          # Sync Capacitor assets
npm run android:build         # Build debug APK
npm run android:build-release # Build release APK
npm run android:open          # Open in Android Studio
```

## 🌐 Alternative: Progressive Web App (PWA)

Instead of building an APK, you can deploy as a PWA:
1. Deploy to Railway/Vercel/Netlify
2. Open URL in Chrome mobile
3. Tap "Add to Home Screen"
4. Acts like a native app!

Benefits:
- ✅ No APK building required
- ✅ Instant updates
- ✅ Cross-platform (iOS too)
- ✅ Smaller size
- ✅ Easier distribution

## 📚 Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/guide)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## 🎉 Success!

Once built, your APK will be:
- 📦 Available as a workflow artifact
- 🏷️ Attached to GitHub releases (for tags)
- 📱 Ready to install on Android devices
- 🚀 Fully functional offline app

---

**Need Help?** Check the workflow logs or open an issue in the repository.
