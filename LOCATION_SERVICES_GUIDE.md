# How to Enable Real WiFi Network Names

## The Problem
You're seeing "Signal Source X" instead of real WiFi names because macOS privacy restrictions prevent apps from accessing WiFi SSIDs without explicit permission.

## The Solution
Even with `sudo`, macOS requires **Location Services** to be enabled for your Terminal app.

### Step-by-Step Instructions:

1. **Open System Settings**
   - Click the Apple menu () → System Settings

2. **Navigate to Privacy & Security**
   - Click "Privacy & Security" in the sidebar
   - Scroll down and click "Location Services"

3. **Enable Location Services for Terminal**
   - Make sure "Location Services" is turned ON at the top
   - Scroll down to find your Terminal app (Terminal, iTerm2, or whatever you're using)
   - Check the box next to it to enable Location Services

4. **Restart the Backend**
   - In your terminal where the backend is running, press `Ctrl+C` to stop it
   - Run `sudo node server/index.js` again
   - The app should now show real WiFi network names!

### Alternative: Use the Airport Utility
If Location Services doesn't work, you can also try:
```bash
sudo /System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -s
```

This will show you what networks are actually visible to the system.

### Why This Happens
- macOS considers WiFi network names (SSIDs) as location data
- Apps need explicit permission to access this information
- Even `sudo` doesn't bypass this privacy protection
- The CoreWLAN framework returns `nil` for SSIDs without proper permissions

### Current Status
✅ Backend running with sudo  
❌ Location Services not enabled for Terminal  
❌ SSIDs still redacted  

Once you enable Location Services and restart the backend, you'll see real network names!
