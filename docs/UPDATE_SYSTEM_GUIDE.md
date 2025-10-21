# App Update System Setup Guide

## 🎯 How Your Update System Works

### Current Setup:

1. **UpdatePrompt Component** - Shows modal when update is available
2. **Version API** - `/api/users/latest-version` returns latest version
3. **Version Comparison** - Compares user's app version vs latest version
4. **Store Links** - Directs users to App Store/Play Store

## 🔧 How to Use It

### Step 1: Update Your App Version

When you want to release a new version:

```bash
# Update to version 1.0.11
node scripts/update-version.js 1.0.11
```

This will update:

- `apps/mobile/app.config.js` (version field)
- `apps/mobile/package.json` (version field)

### Step 2: Set Environment Variable

Add to your `.env` file:

```bash
LATEST_APP_VERSION=1.0.11
```

### Step 3: Deploy API

Deploy your API with the new environment variable.

### Step 4: Build & Submit App

Build and submit your new version to the App Store.

## 🎉 Result

Users with older versions will see:

- **Modal popup**: "New Update Available"
- **Button**: "Update from Store"
- **Action**: Opens App Store to download new version

## 🔍 Testing

### Test Locally:

1. Set `LATEST_APP_VERSION=1.0.12` in your `.env`
2. Restart your API
3. Open your app (version 1.0.10)
4. You should see the update prompt!

### Test in Production:

1. Deploy API with new `LATEST_APP_VERSION`
2. Submit new app version to App Store
3. Users with old versions get update prompt

## 📱 User Experience

### What Users See:

```
┌─────────────────────────────┐
│     New Update Available   │
│                             │
│ A newer version of Bomber   │
│ Fastpitch is available.    │
│                             │
│  [Update from Store]       │
│  [Not Now]                  │
└─────────────────────────────┘
```

### What Happens:

- **"Update from Store"** → Opens App Store
- **"Not Now"** → Closes modal (will show again next app launch)

## ⚙️ Configuration

### UpdatePrompt Settings:

- **OTA Updates**: Currently disabled (`OTA_ENABLED = false`)
- **Store Links**:
  - iOS: `https://apps.apple.com/app/id6744776521`
  - Android: `https://play.google.com/store/apps/details?id=com.emberdevco.bomberapp`

### Customization:

You can modify `apps/mobile/components/ui/molecules/UpdatePrompt.tsx` to:

- Change modal appearance
- Add custom messaging
- Enable OTA updates
- Modify store links

## 🚀 Ready to Use!

Your update system is now properly configured. Just follow the steps above when you want to release a new version!
