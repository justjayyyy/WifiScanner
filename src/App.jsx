import React, { useState, useEffect, useCallback } from 'react';
import NetworkCloud from './components/NetworkCloud';
import { generateNodes, fetchRealNodes } from './utils/wifiData';
import './App.css';

function App() {
  const [nodes, setNodes] = useState([]);
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = useCallback(async () => {
    setIsScanning(true);

    // Try to fetch real nodes
    const realNodes = await fetchRealNodes();

    if (realNodes.length > 0) {
      setNodes(realNodes);
    } else {
      // Fallback to simulation if backend fails
      setNodes(generateNodes(Math.floor(Math.random() * 5) + 3));
    }
    setIsScanning(false);
  }, []);

  useEffect(() => {
    // Initial scan
    handleScan();

    // Auto-scan every 8 seconds
    const interval = setInterval(() => {
      handleScan();
    }, 8000);

    return () => clearInterval(interval);
  }, [handleScan]);

  return (
    <div className="app-container">
      <div className="header">
        <h1>WiFi Visualizer</h1>
        <div className="status-badge">
          {isScanning ? 'Scanning...' : 'Live'}
          <span className={`status-dot ${isScanning ? 'pulsing' : ''}`}></span>
        </div>
      </div>

      <NetworkCloud nodes={nodes} />
    </div>
  );
}

export default App;
