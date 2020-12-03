import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";

import AnimeListBox from "./AnimeListBox";
import "./styles/Overlay.css";

const socket = io("http://localhost:5000");

export default () => {
    const [ allAnime, setAnime ] = useState([]);
    const [ loading, setLoading ] = useState(true);
    const [ tokenIsReady, setTokenIsReady ] = useState(false);

    useEffect(() => {
        socket.on("token ready", () => {
            setTokenIsReady(true);
        });
    }, []);

    useEffect(() => {
        async function authenticate() {
            let response = await axios.get("http://localhost:5000/authcheck");
            if (response.data === "invalid") {
                window.open("https://anilist.co/api/v2/oauth/authorize?client_id=4134&redirect_uri=http://localhost:5000/auth&response_type=code");
            } else {
                setTokenIsReady(true);
            }
        }
        authenticate();
    }, [])

    useEffect(() => {
        async function getShows() {
            const query = 
                `query ($user: String) {
                    Page {
                        mediaList(userName: $user, type: ANIME, status: CURRENT) {
                            progress
                            id
                            media {
                                episodes
                                title {
                                    romaji
                                }
                                coverImage {
                                    large
                                }
                                nextAiringEpisode {
                                    episode
                                    timeUntilAiring
                                }
                                endDate {
                                    year
                                    month
                                    day
                                }
                                meanScore
                                stats {
                                    scoreDistribution {
                                        amount
                                        score
                                    }
                                }
                            }
                        }
                    }
                }
                `;
            const variables = {
                user: "Araucana"
            };

            let response = await axios({
                url: "https://graphql.anilist.co",
                method: "post",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                data: {
                    query: query,
                    variables: variables
                }
            });

            await axios.post("http://localhost:5000/startup",
                JSON.stringify({"data": response.data.data.Page.mediaList.map(item => item.media.title.romaji)}),
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
            setAnime(response.data.data.Page.mediaList.sort((a, b) => {
                const name1 = a.media.title.romaji;
                const name2 = b.media.title.romaji;
                return name1 < name2 ? -1 : name1 > name2 ? 1 : 0;
            }));
            setLoading(false);
        }
        getShows();
        
    }, []);

    return (
        <div className="overlay">
            <AnimeListBox isLoading={loading}
                          allAnime={allAnime}
                          authorized={tokenIsReady}/>
        </div>
    );
}
