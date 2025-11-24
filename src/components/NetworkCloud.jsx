import React, { useMemo } from 'react';
import SignalIndicator from './SignalIndicator';
import './NetworkCloud.css';

const NetworkCard = React.memo(({ node }) => {
    const cardStyle = useMemo(() => ({
        animationDuration: `${3 + Math.random() * 2}s`,
        left: `calc(50% + ${node.x * 1.2}vmin)`,
        top: `calc(50% + ${node.y * 1.2}vmin)`,
    }), [node.x, node.y]);

    const cardClassName = `network-card glass-panel${node.isConnected ? ' connected' : ''}`;

    return (
        <div
            className={cardClassName}
            style={cardStyle}
        >
            <div className="ssid-name" title={node.ssid}>{node.ssid}</div>
            <div className="card-footer">
                <SignalIndicator rssi={node.baseSignalStrength} />
                <span className="channel-tag">Ch {node.channel}</span>
                <span className="freq-tag">{node.channel > 14 ? '5GHz' : '2.4GHz'}</span>
            </div>
        </div>
    );
});

NetworkCard.displayName = 'NetworkCard';

const NetworkCloud = ({ nodes }) => {
    return (
        <div className="network-cloud">
            {nodes.map((node) => (
                <NetworkCard key={node.id} node={node} />
            ))}

            {/* Central User Marker */}
            <div className="user-marker">
                <div className="pulse-ring"></div>
                <div className="center-dot"></div>
            </div>

            {/* Distance Rings */}
            <div className="scanner-rings">
                <div className="ring ring-1"></div>
                <div className="ring ring-2"></div>
                <div className="ring ring-3"></div>
            </div>
        </div>
    );
};

export default React.memo(NetworkCloud);
