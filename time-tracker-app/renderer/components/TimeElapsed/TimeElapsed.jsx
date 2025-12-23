import React, { useState, useEffect } from 'react';

const TimeElapsed = (props) => {
    const [startTime, setStartTime] = useState(props.time); // Set the initial start time
    const [elapsedTime, setElapsedTime] = useState(0); // Time elapsed in milliseconds

    useEffect(() => {

        const interval = setInterval(() => {
            const currentTime = new Date();
            const elapsed = currentTime - startTime;
            setElapsedTime(elapsed);
        }, 1000); // Update every second

        return () => {
            clearInterval(interval);
        };
    }, [startTime]);

    const formatTime = (milliseconds) => {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        return `${hours}h : ${minutes % 60}m : ${seconds % 60}s`;
    };

    return (
        <span style={{ fontWeight: 600, fontSize: '30px', lineHeight: '39px', color: '#fff' }}>
            {formatTime(elapsedTime)}
        </span>
    );
};

export default TimeElapsed;