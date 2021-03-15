import React, { useState, useEffect } from "react";

import "./styles/DownloadRange.css";

export default (props) => {
    let end = props.nextEpisode || props.episodes;
    let [ display, setDisplay ] = useState("");
    
    useEffect(() => {
        let start = props.progress;
        console.log(end);
        if (start === end) {
            setDisplay("Done");
        // eg 4 & 5 (5-1 = 4)
        } else if (start === end - 1) {
            setDisplay("Nothing new");
        // eg 5 - 3 = 2 (download 4)
        //    5 - 4 = 1 (nothing new) 
        } else if (end - start === 2) {
            setDisplay(`Download episode ${start + 1}`);
        } else if (end - start > 2) { 
            setDisplay(`Download episodes ${start + 1}-${end - 1}`);
        }
    }, [props.progress])
    
    if (display) {
        return <div className="downloadRange">
            {display}
        </div>    
    } else {
        return <div className="nothing"></div>
    }
    
}