import React, { useState, useEffect } from "react";
import axios from "axios";

import "./styles/TopBar.css";

export default (props) => {
    const [ airingInfo, setAiringInfo ] = useState([]);

    const onClick = async () => {
        let fileContent = await axios.get("http://localhost:5000/read");
        fileContent = fileContent.data;
        for (const [ name, nickname ] of Object.entries(fileContent)) {
            const info = props.nameInfo.find(show => show[0] === name);
            if (info.nextEpisode !== 1) {
                window.open(`https://nyaa.si/?f=0&c=1_2&q=${nickname || name}`);
            }
        }
    }

    useEffect(() => {
        let airingCount = 0;
        for (let endDate of props.endDates) {
            // I figure that if there's a year, everything else is there.
            // even if it's not, a date's a date
            if (!endDate.year) {
                airingCount++;
            }
        }
        setAiringInfo([airingCount, Object.keys(props.endDates).length - airingCount])
    }, [props.endDates])

    return (
        <div className="topBar">
            <button id="goButton" onClick={() => onClick()}>Go</button>
            <p><span className="airing">{airingInfo[0]}</span> airing, <span className="completed">{airingInfo[1]}</span> complete</p>
        </div>
    );
}