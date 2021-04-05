import React, { useState, useEffect } from "react";
import axios from "axios";

import "./styles/TopBar.css";

export default ({statuses, nameInfo}) => {
    const [ airingInfo, setAiringInfo ] = useState([]);

    const onClick = async () => {
        let fileContent = await axios.get("http://localhost:5000/read");
        fileContent = fileContent.data;
        for (const [ name, nickname ] of Object.entries(fileContent)) {
            const info = nameInfo.find(show => show[0] === name);
            if (info.nextEpisode !== 1) {
                window.open(`https://nyaa.si/?f=0&c=1_2&q=${nickname || name}`);
            }
        }
    }

    useEffect(() => {
        let airingCount = 0,
            unreleasedCount = 0,
            completedCount = 0,
            cancelledCount = 0,
            hiatusCount = 0;
        for (let status of statuses) {
            console.log(status);
            switch (status) {
                case "RELEASING":
                    airingCount++;
                    break;
                case "NOT_YET_RELEASED":
                    unreleasedCount++;
                    break;
                case "FINISHED":
                    completedCount++;
                    break;
                case "CANCELLED":
                    cancelledCount++;
                    break;
                case "HIATUS":
                    hiatusCount++;
                    break;
                default:
                    break;
            }
        }
        setAiringInfo([airingCount, completedCount, unreleasedCount, cancelledCount, hiatusCount]);
    }, [statuses])

    const categoryLister = () => {
        let jsxItems = [],
            indexToClassname = {
                0: "airing",
                1: "completed",
                2: "unaired",
                3: "cancelled",
                4: "hiatus"},
            indexToVerb = {
                0: "airing",
                1: "completed",
                2: "yet to start",
                3: "cancelled",
                4: "on hiatus"
            };

        airingInfo.forEach((count, index) => {
            if (count) {
                jsxItems.push(
                    <span key={index} className={indexToClassname[index]}>{count} {indexToVerb[index]}</span>
                );
            }
        });
        return jsxItems;
    }

    if (airingInfo) {
        return (
            <div className="topBar">
                <button id="goButton" onClick={() => onClick()}>Go</button>
                {categoryLister()}
            </div>
        )
    } else {
        return (
            <div className="topBar">
                <button id="goButton" onClick={() => onClick()}>Go</button>
                
            </div>
        );
    }
    
}