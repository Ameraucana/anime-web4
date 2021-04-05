import React, { useState, useEffect } from "react";

import "./styles/DownloadRange.css";

export default ({ nextEpisode, episodes, progress}) => {
    let end;
    if (nextEpisode === undefined) {
        end = episodes;
    } else {
        end = nextEpisode - 1;
    }
    let [ display, setDisplay ] = useState("");
    
    useEffect(() => {
        let start = progress;
        // even though end can equal episodes, these first two conditions
        // fulfill separate purposes.  if it's less, it passes the first,
        // but if it's all the way at the end, it's Finished.
        if (start === episodes) {
            setDisplay("Finished");
        // don't worry, 0 & (1-1) puts it here
        } else if (start === end) {
            setDisplay("No new episodes");
        // eg 5 - 3 = 2 (download 4)
        //    5 - 4 = 1 (nothing new) 
        } else if (end - start === 1) {
            setDisplay(`Download episode ${start + 1}`);
        } else if (end - start > 1) { 
            setDisplay(`Download episodes ${start + 1}-${end}`);
        }
    }, [progress])
    
    if (display) {
        return <div className="downloadRange">
            {display}
        </div>    
    } else {
        return <div className="nothing downloadRange"></div>
    }
    
}