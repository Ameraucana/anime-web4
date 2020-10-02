import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import EpisodeCountdown from "./EpisodeCountdown";

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
            setInitialTitle(actualTitle);
            await axios.post(
                "http://localhost:5000/namechange", 
                [ props.title[0], actualTitle ],
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }
    }

    const reset = async () => {
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
        setProgress(progress - 1);
    }
    const increment = () => {
        setProgress(progress + 1);
    }

    return (
        <div className="grid">
            <img className="coverImage" 
                 src={props.imageUrl} alt="Anime Cover"/>
            <div className="infoSection">

                <div className="nameZone">
                    <input value={actualTitle} onChange={(event) => setActualTitle(event.target.value)}
                        onBlur={() => nameChanged()} />
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
        </div>
    );
}