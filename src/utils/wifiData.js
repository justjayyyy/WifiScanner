export const generateNodes = (count = 5) => {
    const nodes = [];
    const ssids = ['Home_WiFi', 'Office_Guest', 'Neighbor_Net', 'Starlink_X', '5G_Tower', 'Unknown_Device', 'IoT_Hub', 'Printer_Network'];

    for (let i = 0; i < count; i++) {
        // Random position in a 100x100 grid (centered at 0,0)
        // Range: -50 to 50
        const x = (Math.random() * 100) - 50;
        const y = (Math.random() * 100) - 50;

        nodes.push({
            id: i,
            ssid: `${ssids[i % ssids.length]}_${Math.floor(Math.random() * 100)}`,
            x,
            y,
            baseSignalStrength: -30 - (Math.random() * 20), // Signal at 0 distance
            channel: Math.floor(Math.random() * 11) + 1,
        });
    }

    return nodes;
};

export const fetchRealNodes = async () => {
    try {
        const response = await fetch('http://localhost:3001/api/scan');
        if (!response.ok) throw new Error('Network response was not ok');

        const networks = await response.json();

        // Map real data to our node format
        // Use deterministic positioning based on network characteristics
        const nodes = networks.map((net, index) => {
            // Calculate rough distance from RSSI
            // FSPL approximation: Distance = 10 ^ ((27.55 - (20 * log10(freq)) + |RSSI|) / 20)
            // Simplified: Signal -30 is close (0m), -90 is far (100m)
            const rssi = net.signal_level || -90;
            const clampedRssi = Math.max(-90, Math.min(-30, rssi));
            const distanceFactor = (Math.abs(clampedRssi) - 30) / 60; // 0 to 1

            // Deterministic position based on channel and MAC
            // Create a simple hash from channel and mac to get consistent angle
            const hashString = `${net.channel}_${net.mac}`;
            let hash = 0;
            for (let i = 0; i < hashString.length; i++) {
                hash = ((hash << 5) - hash) + hashString.charCodeAt(i);
                hash = hash & hash; // Convert to 32-bit integer
            }
            const angle = (Math.abs(hash) % 360) * (Math.PI / 180); // Convert hash to angle in radians
            const radius = distanceFactor * 50; // Map to 0-50 units

            return {
                id: `real_${index}_${net.mac}`,
                ssid: net.ssid,
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius,
                baseSignalStrength: rssi,
                channel: net.channel,
                isReal: true,
                isRedacted: net.is_redacted,
                isConnected: net.is_connected || false
            };
        });

        // Apply collision detection to spread out overlapping nodes
        const minDistance = 8; // Minimum distance between nodes in units
        const adjustedNodes = [...nodes];

        for (let i = 0; i < adjustedNodes.length; i++) {
            for (let j = i + 1; j < adjustedNodes.length; j++) {
                const dx = adjustedNodes[i].x - adjustedNodes[j].x;
                const dy = adjustedNodes[i].y - adjustedNodes[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < minDistance && distance > 0) {
                    // Nodes are too close, push them apart
                    const angle = Math.atan2(dy, dx);
                    const overlap = minDistance - distance;
                    const pushDistance = overlap / 2;

                    adjustedNodes[i].x += Math.cos(angle) * pushDistance;
                    adjustedNodes[i].y += Math.sin(angle) * pushDistance;
                    adjustedNodes[j].x -= Math.cos(angle) * pushDistance;
                    adjustedNodes[j].y -= Math.sin(angle) * pushDistance;
                }
            }
        }

        return adjustedNodes;
    } catch (error) {
        console.warn('Failed to fetch real nodes, falling back to simulation:', error);
        return [];
    }
};

export const calculateRelativeProps = (node, userX, userY) => {
    const dx = node.x - userX;
    const dy = node.y - userY;

    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    // Signal strength drops with distance (simplified path loss)
    // Assuming distance 50 is "far" (-90dBm)
    const signalDrop = distance * 1.2;
    const signalStrength = Math.floor(node.baseSignalStrength - signalDrop);

    // Normalize distance for visualization (0 to 1, clamped)
    // We'll say max viewable distance is 60 units
    const maxDist = 60;
    const normalizedDistance = Math.min(distance / maxDist, 1);

    return {
        ...node,
        angle,
        distance: normalizedDistance,
        signalStrength,
        realDistance: distance // Keep raw distance for logic if needed
    };
};
