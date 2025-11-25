import CoreWLAN
import Foundation

class WiFiScanner {
    let client = CWWiFiClient.shared()

    func scan() {
        guard let interface = client.interface() else {
            print("[]")
            return
        }

        do {
            let networks = try interface.scanForNetworks(withName: nil)
            
            // Deduplicate by channel - keep only one network per channel (strongest signal)
            var channelMap: [Int: CWNetwork] = [:]
            for network in networks {
                let channel = network.wlanChannel?.channelNumber ?? 0
                if let existing = channelMap[channel] {
                    // Keep the one with stronger signal
                    if network.rssiValue > existing.rssiValue {
                        channelMap[channel] = network
                    }
                } else {
                    channelMap[channel] = network
                }
            }
            let uniqueNetworks = Array(channelMap.values) 
            
            // Get current connected network info
            let connectedSSID = interface.ssid()
            let connectedBSSID = interface.bssid()
            let connectedChannel = interface.wlanChannel()?.channelNumber ?? 0
            let connectedRSSI = interface.rssiValue()
            
            // DEBUG: Print first network details to stderr
            if let first = uniqueNetworks.first {
                let debugInfo = """
                Debug First Network:
                SSID: '\(first.ssid ?? "nil")'
                BSSID: '\(first.bssid ?? "nil")'
                RSSI: \(first.rssiValue)
                Channel: \(first.wlanChannel?.channelNumber ?? 0)
                Connected to: Ch:\(connectedChannel) RSSI:\(connectedRSSI)
                """
                FileHandle.standardError.write(Data(debugInfo.utf8))
            }

            let jsonNetworks = uniqueNetworks.enumerated().map { (index, network) -> [String: Any] in
                var ssid = network.ssid ?? ""
                var isRedacted = false
                var isConnected = false
                
                // Check if this is the connected network
                // Match by channel and approximate RSSI (within 5 dBm)
                let channelMatch = network.wlanChannel?.channelNumber == connectedChannel
                let rssiMatch = abs(network.rssiValue - connectedRSSI) <= 5
                
                if channelMatch && rssiMatch && connectedChannel > 0 {
                    isConnected = true
                }
                
                if ssid.isEmpty {
                     isRedacted = true
                     // Fallback to BSSID if available, otherwise use Channel/RSSI/Index
                     if let bssid = network.bssid {
                         ssid = "AP [\(bssid)]"
                     } else {
                         // Completely anonymous - use characteristics to distinguish
                         var baseName = "Signal Source \(index + 1) (Ch:\(network.wlanChannel?.channelNumber ?? 0))"
                         if isConnected {
                             baseName = "⭐ CONNECTED " + baseName
                         }
                         ssid = baseName
                     }
                }
                
                return [
                    "ssid": ssid,
                    "bssid": network.bssid ?? "no-bssid",
                    "rssi": network.rssiValue,
                    "channel": network.wlanChannel?.channelNumber ?? 0,
                    "is_redacted": isRedacted,
                    "is_connected": isConnected
                ]
            }
            
            let jsonData = try JSONSerialization.data(withJSONObject: jsonNetworks, options: [])
            if let jsonString = String(data: jsonData, encoding: .utf8) {
                print(jsonString)
            }
        } catch {
            print("[]") // Return empty array on error
            // FileHandle.standardError.write(Data("Error: \(error)".utf8))
        }
    }
}

let scanner = WiFiScanner()
scanner.scan()
