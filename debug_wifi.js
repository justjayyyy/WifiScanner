import wifi from 'node-wifi';

wifi.init({
    iface: null // network interface, choose a random wifi interface if set to null
});

console.log('Starting scan...');

wifi.scan()
    .then(networks => {
        console.log(`Success! Found ${networks.length} networks.`);
        networks.forEach(n => {
            console.log(`- SSID: ${n.ssid}, RSSI: ${n.signal_level}, MAC: ${n.mac}`);
        });
    })
    .catch(error => {
        console.error('Scan failed:', error);
    });
