import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import EpisodeCountdown from "./EpisodeCountdown";
import RatingChart from "./RatingChart.js";

import "./styles/AnimeListItem.css";

export default (props) => {
    // there are two values for the title so that we can replicate the native 
    // onChange behavior. i don't want to send redundant events to the backend
    // just because i clicked on and off of an input
    const [ initialTitle, setInitialTitle ] = useState(props.title[1] || props.title[0]);
    const [ actualTitle, setActualTitle ] = useState(props.title[1] || props.title[0]);

    const [ progress, setProgress ] = useState(props.progress);

    const isFirstRender = useRef(true);

    const nameChanged = async () => {
        if (actualTitle !== initialTitle) {
            const actualTitleTrimmed = actualTitle.trim();
            setInitialTitle(actualTitleTrimmed);
            await axios.post(
                "http://localhost:5000/namechange", 
                [ props.title[0], actualTitleTrimmed ],
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }
    }

    const reset = async () => {
        setInitialTitle(props.title[0]);
        setActualTitle(props.title[0]);
        await axios.post(
            "http://localhost:5000/reset", 
            [ props.title[0] ],
            {
                headers: {
                    "Content-Type": "application/json" // instead of sending a one-item array, maybe just don't send JSON????
                }
            }
        );
    }

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
        } else {
            mutate();
        }
        async function mutate() {
            const query =
                `mutation ($id: Int, $progress: Int) {
                    SaveMediaListEntry(id: $id, progress: $progress) {
                        progress
                    }
                }`;
            const token = await axios.get("http://localhost:5000/gettoken");
            await axios({
                url: "https://graphql.anilist.co",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token.data}`
                },
                data: {
                    query: query,
                    variables: {
                        id: props.id,
                        progress: progress
                    }
                }
            });
        }
    }, [progress, props.id])

    const decrement = () => {
        setProgress(Math.max(progress - 1, 0));
    }
    const increment = () => {
        setProgress(Math.min(progress + 1, props.episodeCount || progress + 1));
    }

    return (
        <div className="grid">
            <img className="coverImage" 
                 src={props.imageUrl} alt="Anime Cover"/>
            <div className="infoSection">

                <div className="nameZone">
                    <input value={actualTitle} onChange={(event) => setActualTitle(event.target.value)}
                        onBlur={() => nameChanged()}
                        spellCheck={false} />
                    <button onClick={() => reset()}>Reset</button>
                </div>

                <div className="episodeZone">
                    <button onClick={() => decrement()} disabled={!props.authorized}
                            className={props.authorized ? "episodeButton" : "episodeButton unauthorized"}>◀</button>

                    <span className="episodeCounter">{progress}/{props.episodeCount || "?"}</span>

                    <button onClick={() => increment()} disabled={!props.authorized}
                            className={props.authorized ? "episodeButton" : "episodeButton unauthorized"}>▶</button>
                </div>

                <EpisodeCountdown nextEpisodeIn={props.nextEpisodeIn} nextEpisode={props.nextEpisode} endDate={props.endDate} episodes={props.episodes}/>

            </div>
            <div className="chart">
                <RatingChart 
                    meanScore={props.meanScore}
                    scoreDist={props.scoreDist}/>
            </div>
        </div>
    );
}
