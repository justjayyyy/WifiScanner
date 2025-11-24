#!/usr/bin/env swift

import CoreWLAN
import Foundation

class WiFiInfo {
    let client = CWWiFiClient.shared()
    
    func getCurrentNetwork() {
        guard let interface = client.interface() else {
            print("{\"error\": \"No WiFi interface found\"}")
            return
        }
        
        // Get currently connected network - this should work even with privacy restrictions
        if let currentSSID = interface.ssid() {
            var result: [String: Any] = [
                "connected_ssid": currentSSID,
                "connected_bssid": interface.bssid() ?? "unknown",
                "rssi": interface.rssiValue(),
                "channel": interface.wlanChannel()?.channelNumber ?? 0,
                "is_connected": true
            ]
            
            // Try to scan for other networks
            do {
                let networks = try interface.scanForNetworks(withName: nil)
                var scannedNetworks: [[String: Any]] = []
                
                for (index, network) in networks.enumerated() {
                    let ssid = network.ssid ?? ""
                    let bssid = network.bssid ?? ""
                    let isRedacted = ssid.isEmpty && bssid.isEmpty
                    
                    var finalSSID = ssid
                    if isRedacted {
                        finalSSID = "Signal Source \(index + 1) (Ch:\(network.wlanChannel?.channelNumber ?? 0))"
                    } else if ssid.isEmpty && !bssid.isEmpty {
                        finalSSID = "AP [\(bssid)]"
                    }
                    
                    scannedNetworks.append([
                        "ssid": finalSSID,
                        "bssid": bssid.isEmpty ? "no-bssid" : bssid,
                        "rssi": network.rssiValue,
                        "channel": network.wlanChannel?.channelNumber ?? 0,
                        "is_redacted": isRedacted,
                        "is_current": ssid == currentSSID
                    ])
                }
                
                result["scanned_networks"] = scannedNetworks
                result["scan_count"] = scannedNetworks.count
            } catch {
                result["scan_error"] = "\(error)"
            }
            
            if let jsonData = try? JSONSerialization.data(withJSONObject: result, options: .prettyPrinted),
               let jsonString = String(data: jsonData, encoding: .utf8) {
                print(jsonString)
                return
            }
        } else {
            print("{\"error\": \"Not connected to WiFi\", \"is_connected\": false}")
        }
    }
}

let info = WiFiInfo()
info.getCurrentNetwork()
