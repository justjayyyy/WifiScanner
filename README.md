# WiFi Visualizer

A beautiful, real-time WiFi network visualizer with a Neon Glassmorphism aesthetic. Displays nearby WiFi networks with signal strength indicators, channel information, and highlights your connected network.

![WiFi Visualizer](https://img.shields.io/badge/React-18.x-blue) ![Node.js](https://img.shields.io/badge/Node.js-20.x-green) ![Swift](https://img.shields.io/badge/Swift-5.x-orange)

## Features

✨ **Real-time WiFi Scanning** - Auto-refreshes every 8 seconds  
📡 **Signal Strength Indicators** - Cellular-style bars based on RSSI  
⭐ **Connected Network Highlighting** - Green glow for your current network  
🎨 **Neon Glassmorphism UI** - Modern, premium design with floating animations  
🔄 **Collision Avoidance** - Smart positioning prevents overlapping cards  
🎯 **Deterministic Positioning** - Networks maintain consistent positions

## Screenshots

The app displays WiFi networks as floating glass cards with:
- Network name (or "Signal Source X" on macOS 26.x due to privacy restrictions)
- Signal strength bars
- Channel number
- Frequency band (2.4GHz/5GHz)

## Tech Stack

- **Frontend:** React 18, Vite
- **Backend:** Node.js, Express
- **Scanner:** Swift (CoreWLAN framework)
- **Styling:** CSS with GPU acceleration

## Prerequisites

- macOS (required for CoreWLAN WiFi scanning)
- Node.js 18+ 
- Swift compiler (Xcode Command Line Tools)

## Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd wifi-visualizer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Compile the WiFi scanner:**
   ```bash
   cd server
   swiftc scan_wifi.swift -o wifi-scanner
   cd ..
   ```

## Usage

### Running the App

You need to run both the backend and frontend:

**Terminal 1 - Backend (with sudo for WiFi access):**
```bash
cd server
sudo node index.js
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Then open http://localhost:5174/ in your browser.

### Alternative: Use the startup script

```bash
./start-backend.sh  # In one terminal (requires sudo password)
npm run dev         # In another terminal
```

## macOS Privacy & Permissions

### Why "Signal Source X" Instead of Real Names?

macOS 26.x (and newer versions) have strict privacy controls that prevent apps from accessing WiFi network names (SSIDs), even with:
- ✅ sudo/root permissions
- ✅ Location Services enabled

This is a macOS security feature, not a bug. The app still shows:
- ✅ Accurate signal strength
- ✅ Channel numbers
- ✅ Frequency bands
- ✅ Your connected network (marked with ⭐)

### Attempting to Enable Real Names

While it may not work on macOS 26.x+, you can try:

1. **Enable Location Services for Terminal:**
   - System Settings → Privacy & Security → Location Services
   - Enable for your Terminal app
   - Restart the backend

2. **Run with sudo:**
   - Already required (see usage above)

## Project Structure

```
wifi-visualizer/
├── src/
│   ├── App.jsx                   # Main application
│   ├── App.css                   # Global styles
│   ├── components/
│   │   ├── NetworkCloud.jsx      # Network visualization
│   │   ├── NetworkCloud.css      # Network styles
│   │   └── SignalIndicator.jsx   # Signal bars
│   └── utils/
│       └── wifiData.js           # Data fetching & processing
├── server/
│   ├── index.js                  # Express backend
│   └── scan_wifi.swift           # WiFi scanner (Swift)
├── package.json
└── vite.config.js
```

## How It Works

1. **Swift Scanner** (`scan_wifi.swift`) uses CoreWLAN to scan for WiFi networks
2. **Backend** (`server/index.js`) executes the scanner and serves results via REST API
3. **Frontend** fetches network data every 8 seconds and visualizes it
4. **Collision Detection** spreads out overlapping networks
5. **Deterministic Positioning** keeps networks in consistent positions based on channel + MAC hash

## Performance Optimizations

- React.memo for component memoization
- useMemo for expensive calculations
- GPU-accelerated CSS animations (transform3d)
- Backend response caching (3 seconds)
- Timeout handling (10 seconds)

## Known Limitations

- **macOS only** - Uses CoreWLAN framework
- **Network names may be redacted** - Due to macOS 26.x privacy controls
- **Requires sudo** - For WiFi scanning permissions

## Contributing

Feel free to open issues or submit pull requests!

## License

MIT

## Acknowledgments

Built with ❤️ using React, Node.js, and Swift
