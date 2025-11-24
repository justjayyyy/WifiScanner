import React, { useMemo } from 'react';

const SignalIndicator = ({ rssi }) => {
    const { bars, color } = useMemo(() => {
        let bars = 0;
        let color = '#ef4444'; // Red (Weak)

        if (rssi > -50) {
            bars = 4;
            color = '#22c55e'; // Green (Excellent)
        } else if (rssi > -60) {
            bars = 3;
            color = '#22c55e'; // Green (Good)
        } else if (rssi > -70) {
            bars = 2;
            color = '#eab308'; // Yellow (Fair)
        } else if (rssi > -80) {
            bars = 1;
            color = '#ef4444'; // Red (Weak)
        }

        return { bars, color };
    }, [rssi]);

    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '16px' }}>
            {[1, 2, 3, 4].map((barNum) => (
                <div
                    key={barNum}
                    style={{
                        width: '4px',
                        height: `${barNum * 25}%`,
                        backgroundColor: barNum <= bars ? color : 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '1px',
                        transition: 'all 0.3s ease'
                    }}
                />
            ))}
        </div>
    );
};

export default React.memo(SignalIndicator);
