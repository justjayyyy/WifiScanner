import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

app.use(cors());

// Cache for scan results to reduce redundant scans
let cachedResults = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 3000; // 3 seconds cache

app.get('/api/scan', (req, res) => {
    const now = Date.now();

    // Return cached results if still valid
    if (cachedResults && (now - cacheTimestamp) < CACHE_DURATION) {
        console.log('Returning cached results');
        return res.json(cachedResults);
    }

    const scannerPath = path.join(__dirname, 'wifi-scanner');
    console.log('Executing scanner:', scannerPath);

    // Add timeout to prevent hanging requests
    const timeout = setTimeout(() => {
        console.error('Scanner timeout');
        res.status(504).json({ error: 'Scan timeout' });
    }, 10000); // 10 second timeout

    exec(scannerPath, { timeout: 10000 }, (error, stdout, stderr) => {
        clearTimeout(timeout);

        if (error) {
            console.error('Scan error:', error);
            console.error('Stderr:', stderr);
            return res.status(500).json({ error: 'Scan failed', details: stderr });
        }

        try {
            const networks = JSON.parse(stdout);
            console.log(`Found ${networks.length} networks.`);

            const mapped = networks.map(n => ({
                ssid: n.ssid,
                signal_level: n.rssi,
                channel: n.channel,
                mac: n.bssid,
                is_redacted: n.is_redacted
            }));

            // Update cache
            cachedResults = mapped;
            cacheTimestamp = now;

            res.json(mapped);
        } catch (parseError) {
            console.error('Parse error:', parseError);
            console.log('Raw output:', stdout);
            res.status(500).json({ error: 'Failed to parse scan results' });
        }
    });
});

app.listen(port, () => {
    console.log(`WiFi Scanning Server running at http://localhost:${port}`);
});
