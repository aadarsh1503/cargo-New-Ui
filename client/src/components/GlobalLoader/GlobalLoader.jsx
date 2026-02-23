import React from "react";
import "./GlobalLoader.css";
import gvs from "./gvs.png";

const GlobalLoader = () => {
    return (
        <div className="loader-overlay bg-white">
            <div className="loader-image">
                <img
                    src={gvs}
                    alt="Loading"
                />
            </div>
        </div>
    );
};

export default GlobalLoader;
