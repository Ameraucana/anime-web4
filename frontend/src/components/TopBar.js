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
        for (let status of props.statuses) {
            console.log(status);
            if (status === "RELEASING") {
                airingCount++;
            }
        }
        setAiringInfo([airingCount, Object.keys(props.statuses).length - airingCount])
    }, [props.statuses])

    return (
        <div className="topBar">
            <button id="goButton" onClick={() => onClick()}>Go</button>
            <p><span className="airing">{airingInfo[0]}</span> airing, <span className="completed">{airingInfo[1]}</span> complete</p>
        </div>
    );
}