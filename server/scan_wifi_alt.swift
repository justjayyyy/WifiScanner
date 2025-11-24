#!/usr/bin/env swift

import Foundation

// Alternative scanner using system_profiler which has better permissions
func scanWithSystemProfiler() {
    let task = Process()
    task.executableURL = URL(fileURLWithPath: "/usr/sbin/system_profiler")
    task.arguments = ["SPAirPortDataType", "-json", "-detailLevel", "basic"]
    
    let pipe = Pipe()
    task.standardOutput = pipe
    task.standardError = pipe
    
    do {
        try task.run()
        task.waitUntilExit()
        
        let data = pipe.fileHandleForReading.readDataToEndOfFile()
        
        if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
           let spAirport = json["SPAirPortDataType"] as? [[String: Any]] {
            
            var networks: [[String: Any]] = []
            var index = 1
            
            for item in spAirport {
                if let interfaces = item["spairport_airport_interfaces"] as? [[String: Any]] {
                    for interface in interfaces {
                        if let otherNetworks = interface["spairport_airport_other_local_wireless_networks"] as? [[String: Any]] {
                            for network in otherNetworks {
                                let ssid = network["_name"] as? String ?? ""
                                let channel = network["spairport_network_channel"] as? String ?? "0"
                                let signal = network["spairport_signal_noise"] as? String ?? "-90"
                                
                                // Parse RSSI from signal string (format: "-50 dBm")
                                let rssi = Int(signal.components(separatedBy: " ").first ?? "-90") ?? -90
                                let channelNum = Int(channel.components(separatedBy: " ").first ?? "0") ?? 0
                                
                                let isRedacted = ssid.isEmpty
                                let finalSSID = isRedacted ? "Signal Source \(index) (Ch:\(channelNum))" : ssid
                                
                                networks.append([
                                    "ssid": finalSSID,
                                    "bssid": "system-profiler",
                                    "rssi": rssi,
                                    "channel": channelNum,
                                    "is_redacted": isRedacted
                                ])
                                
                                index += 1
                            }
                        }
                    }
                }
            }
            
            if let jsonData = try? JSONSerialization.data(withJSONObject: networks),
               let jsonString = String(data: jsonData, encoding: .utf8) {
                print(jsonString)
                return
            }
        }
    } catch {
        // Fallback to empty array
    }
    
    print("[]")
}

scanWithSystemProfiler()
