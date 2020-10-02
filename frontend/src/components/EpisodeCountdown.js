import React, { useState, useEffect, useRef } from "react";

import "./styles/EpisodeCountdown.css";

export default (props) => {
    const [ seconds, setSeconds ] = useState(props.nextEpisodeIn);
    const [ displayText, setDisplayText ] = useState("Loading");
    
    const intervalSeconds = useRef(seconds);
    intervalSeconds.current = seconds;
    useEffect(() => {
        // if there is a next episode
        if (props.nextEpisodeIn) {
            const interval = setInterval(() => {
                // this is if it counts down to zero
                let workingSeconds = intervalSeconds.current;

                const days = Math.floor(workingSeconds / 86400);
                workingSeconds -= days * 86400;

                const hours = Math.floor(workingSeconds / 3600);
                workingSeconds -= hours * 3600;

                const minutes = Math.floor(workingSeconds / 60);
                workingSeconds -= minutes * 60;

                setDisplayText(`Episode ${props.nextEpisode} airing in ${days}d ${hours}h ${minutes}m ${workingSeconds}s`);

                if (intervalSeconds.current === 0) {
                    clearInterval(interval);
                    if (props.nextEpisode === props.episodes) {
                        setDisplayText(`Ended on ${props.endDate.month}/${props.endDate.day}/${props.endDate.year}`);
                    } else {
                        setDisplayText(`Episode ${props.nextEpisode} has released`);
                    }
                }
                setSeconds(s => s - 1);
            }, 1000);

            return () => {clearInterval(interval); console.log("cleared by rerender")};
        // if the show already ended
        } else {
            setDisplayText(`Ended on ${props.endDate.month}/${props.endDate.day}/${props.endDate.year}`);
        }
        //eslint-disable-next-line
    }, []);

    return <p className="countdown">{displayText}</p>
}