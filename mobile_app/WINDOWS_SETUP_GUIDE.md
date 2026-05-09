# Flutter Mobile App - Windows Setup Guide

## 📋 Prerequisites

### 1. Install Flutter SDK
1. Download Flutter SDK from: https://docs.flutter.dev/get-started/install/windows
2. Extract the zip file to a location (e.g., `C:\src\flutter`)
3. Add Flutter to your PATH:
   - Search for "Environment Variables" in Windows
   - Edit "Path" variable
   - Add: `C:\src\flutter\bin`
4. Verify installation:
   ```bash
   flutter doctor
   ```

### 2. Install Android Studio (Required for Android Emulator)
1. Download from: https://developer.android.com/studio
2. Install Android Studio
3. During installation, make sure to install:
   - ✅ Android SDK
   - ✅ Android SDK Platform
   - ✅ Android Virtual Device (AVD)

### 3. Set Up Android Emulator (AVD)
1. Open Android Studio
2. Go to **Tools → Device Manager** (or click the device manager icon)
3. Click **Create Device**
4. Select a device (recommended: **Pixel 5** or **Pixel 6**)
5. Select a system image:
   - **Recommended**: Latest **API Level 33 or 34** (Android 13/14)
   - Make sure to download it if not already installed
6. Click **Next** → **Finish**
7. Your AVD will appear in the Device Manager

### 4. Install Required Tools
Run these commands in PowerShell or Command Prompt:
```bash
flutter doctor
```
Fix any issues shown (usually requires accepting Android licenses):
```bash
flutter doctor --android-licenses
```
Press `y` to accept all licenses.

---

## 🚀 Running the Mobile App

### Step 1: Navigate to Mobile App Directory
```bash
cd mobile_app
```

### Step 2: Install Dependencies
```bash
flutter pub get
```

### Step 3: Start Android Emulator
**Option A: From Android Studio**
1. Open Android Studio
2. Go to **Tools → Device Manager**
3. Click the **Play** button (▶️) next to your AVD

**Option B: From Command Line**
```bash
# List available emulators
flutter emulators

# Launch a specific emulator (replace with your emulator name)
flutter emulators --launch <emulator_id>

# Or launch the default
flutter emulators --launch <emulator_id>
```

### Step 4: Verify Emulator is Running
```bash
flutter devices
```
You should see your Android emulator listed.

### Step 5: Update API Base URL (Important!)
Before running, update the API base URL in:
```
mobile_app/lib/services/api_service.dart
```

**For Android Emulator:**
- Change `baseUrl` to: `http://10.0.2.2:5001` (Android emulator's special IP for localhost)
- Or use your computer's local IP: `http://192.168.x.x:5001`

**Example:**
```dart
static const String baseUrl = 'http://10.0.2.2:5001';
// For Android emulator, 10.0.2.2 maps to localhost on your PC
```

### Step 6: Run the App
```bash
flutter run
```

Or use the provided script:
```bash
run.bat
```

---

## 🔧 Common Issues & Solutions

### Issue: "No devices found"
**Solution:**
1. Make sure Android emulator is running
2. Check with: `flutter devices`
3. If still not found, restart Android Studio and emulator

### Issue: "Android licenses not accepted"
**Solution:**
```bash
flutter doctor --android-licenses
```
Accept all licenses by pressing `y`.

### Issue: "Gradle build failed"
**Solution:**
1. Make sure you have Java JDK installed (Android Studio includes it)
2. Check `android/local.properties` file exists
3. Try: `flutter clean` then `flutter pub get`

### Issue: "Cannot connect to backend API"
**Solution:**
1. Make sure Express backend is running on `http://localhost:5001`
2. Update `api_service.dart` baseUrl to `http://10.0.2.2:5001` for Android emulator
3. For physical device, use your PC's IP address (e.g., `http://192.168.1.100:5001`)

### Issue: "SDK location not found"
**Solution:**
1. Open Android Studio
2. Go to **File → Settings → Appearance & Behavior → System Settings → Android SDK**
3. Copy the SDK location path
4. Create/edit `android/local.properties`:
   ```
   sdk.dir=C:\\Users\\YourUsername\\AppData\\Local\\Android\\Sdk
   ```
   (Replace with your actual SDK path)

---

## 📱 Running on Physical Android Device

### Option 1: USB Debugging
1. Enable **Developer Options** on your Android phone:
   - Go to **Settings → About Phone**
   - Tap **Build Number** 7 times
2. Enable **USB Debugging**:
   - Go to **Settings → Developer Options**
   - Enable **USB Debugging**
3. Connect phone via USB
4. Allow USB debugging when prompted
5. Run: `flutter devices` (should see your device)
6. Run: `flutter run`

### Option 2: Wireless Debugging (Android 11+)
1. Enable **Wireless Debugging** in Developer Options
2. Connect to same Wi-Fi network as your PC
3. Pair device using IP address shown
4. Run: `flutter run`

---

## 🎯 Quick Start Commands

```bash
# 1. Check Flutter setup
flutter doctor

# 2. Navigate to app
cd mobile_app

# 3. Get dependencies
flutter pub get

# 4. List available devices/emulators
flutter devices

# 5. Launch emulator (if not running)
flutter emulators --launch <emulator_id>

# 6. Run the app
flutter run

# 7. Hot reload: Press 'r' in terminal
# 8. Hot restart: Press 'R' in terminal
# 9. Quit: Press 'q' in terminal
```

---

## 📝 Notes

- **Android Emulator**: The standard emulator is **Android Studio's AVD Manager**. It's the most commonly used and recommended.
- **Performance**: Android emulator can be slow. Make sure you have:
  - At least 8GB RAM (16GB recommended)
  - Enable **Hardware Acceleration** in BIOS (Intel VT-x or AMD-V)
  - Allocate at least 2GB RAM to emulator in AVD settings
- **Backend Connection**: 
  - Android Emulator: Use `http://10.0.2.2:5001`
  - Physical Device: Use your PC's local IP (e.g., `http://192.168.1.100:5001`)
- **Flutter Version**: This app requires Flutter SDK >= 3.0.0

---

## 🆘 Need Help?

1. Check Flutter documentation: https://docs.flutter.dev
2. Run `flutter doctor -v` for detailed diagnostics
3. Check Android Studio logs: **View → Tool Windows → Logcat**

