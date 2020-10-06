import React, { useEffect, useState } from "react";
import socket from "socket.io-client";
import axios from "axios";

import "./styles/AnimeListBox.css";

import AnimeListItem from "./AnimeListItem";
import TopBar from "./TopBar";

socket.connect("http://localhost:5000");

export default ({isLoading, allAnime, authorized}) => {
    const [ allInfo, setAllInfo ] = useState([]);

    useEffect(() => {
        // this section effectively combines the file's names with the api's data
        async function getNames() {
            let fileContent = await axios.get("http://localhost:5000/read");
            fileContent = fileContent.data
            const items = [];
            for (const anime of allAnime) {
                for (const [ name, nickname ] of Object.entries(fileContent)) {
                    if (anime.media.title.romaji === name) {
                        items.push({
                            key: anime.id,
                            id: anime.id,
                            titleInfo: [name, nickname],
                            coverImage: anime.media.coverImage.large,
                            progress: anime.progress,
                            episodes: anime.media.episodes,
                            nextEpisode: anime.media.nextAiringEpisode?.episode,
                            nextEpisodeIn: anime.media.nextAiringEpisode?.timeUntilAiring,
                            endDate: anime.media.endDate,
                            meanScore: anime.media.meanScore,
                            scoreDistribution: anime.media.stats.scoreDistribution
                        });
                        break;
                    }
                }
            }
            setAllInfo(items);
        }

        getNames();
    }, [allAnime]);

    let displayedContent;
    if (isLoading) {
        displayedContent =
            <div className="loadingDiv">
                <h1>Loading</h1>
            </div>
    } else {
        displayedContent = 
        <>
            <TopBar 
                nameInfo={allInfo.map(entry => entry.titleInfo)}
                endDates={allInfo.map(entry => entry.endDate)}/>
                
            <div className="animeListBox">
                {
                    allInfo.map(value => {

                        return <AnimeListItem key={value.key}
                            id={value.id}
                            title={value.titleInfo}
                            imageUrl={value.coverImage}
                            progress={value.progress}
                            episodeCount={value.episodes}
                            nextEpisode={value.nextEpisode}
                            nextEpisodeIn={value.nextEpisodeIn}
                            endDate={value.endDate}
                            meanScore={value.meanScore}
                            scoreDist={value.scoreDistribution}
                            authorized={authorized}/>;
                    })
                }
            </div>
        </>
    }

    return displayedContent;
}
