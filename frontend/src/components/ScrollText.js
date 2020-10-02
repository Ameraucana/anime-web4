import React from "react";
import "./styles/ScrollText.css";

export default () => {
    
    return (
        <div id="scrollingTextBox">
            <p className="scrollingText">List List List List List List</p>
            <p className="scrollingText reverseScroll">List List List List List List</p>
        </div>
    );
}