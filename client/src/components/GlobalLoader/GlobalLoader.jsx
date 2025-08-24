import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./GlobalLoader.css";
import gvs from "./gvs.png";

const GlobalLoader = () => {
    const [loading, setLoading] = useState(false);
    const location = useLocation();

    useEffect(() => {
        // Check if the loader has already been shown in this session
        const hasSeenLoader = sessionStorage.getItem("hasSeenLoader");

        if (!hasSeenLoader) {
            setLoading(true); // Show the loader
            sessionStorage.setItem("hasSeenLoader", "true"); // Mark that the loader has been shown in this session

            // Hide the loader after 2 seconds (adjustable time)
            setTimeout(() => {
                setLoading(false);
            }, 1000);
        }
    }, []); // Run only once when the component is first mounted (on initial page load)

    return loading ? (
        <div className="loader-overlay bg-white">
            <div className="loader-image">
                <img
                    src={gvs} // Replace with your image
                    alt="Loading"
                />
            </div>
        </div>
    ) : null;
};

export default GlobalLoader;
