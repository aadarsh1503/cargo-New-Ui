import React, { useState, useEffect } from 'react';
import { FaLinkedin, FaInstagram, FaFacebook } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXTwitter } from '@fortawesome/free-brands-svg-icons';
import { faPhone } from '@fortawesome/free-solid-svg-icons';
import { API_BASE_URL } from '../../config/apiConfig';



// A reusable card component for each location
const LocationCard = ({ location }) => {
    // Default to an empty array if address is not present or not an array
    const addressLines = location.address && Array.isArray(location.address) ? location.address : [];
    const socialIcons = [
        { key: 'phone', href: `tel:${location.phone}`, icon: <FontAwesomeIcon icon={faPhone} />, title: `Call ${location.name} Office`, data: location.phone },
        { key: 'linkedin', href: location.social_linkedin, icon: <FaLinkedin />, title: `LinkedIn`, data: location.social_linkedin },
        { key: 'instagram', href: location.social_instagram, icon: <FaInstagram />, title: `Instagram`, data: location.social_instagram },
        { key: 'facebook', href: location.social_facebook, icon: <FaFacebook />, title: `Facebook`, data: location.social_facebook },
        { key: 'twitter', href: location.social_twitter, icon: <FontAwesomeIcon icon={faXTwitter} />, title: `Twitter`, data: location.social_twitter }
    ];
    return (
        <div className="bg-white top-0 w-full max-w-[300px] shadow-custom rounded-lg overflow-hidden flex flex-col">
            <div className="relative z-10 bg-white p-6 rounded-t-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">{location.name} Office</h2>
                <p className="text-gray-600 text-sm mb-4 h-16"> {/* Fixed height for alignment */}
                    <strong>Address:</strong> {addressLines.join(', ')}
                </p>
                <div className="grid grid-cols-5 gap-2">
                    {socialIcons.map(social => (
                        // Render the link only if the data for it exists
                        social.data ? (
                            <a
                                key={social.key}
                                href={social.href}
                                target={social.key !== 'phone' ? '_blank' : undefined} // Don't open tel: links in new tab
                                rel={social.key !== 'phone' ? 'noopener noreferrer' : undefined}
                                className="flex items-center justify-center bg-white p-2 rounded-full text-DarkBlue text-3xl hover:bg-gray-100 transition-colors"
                                title={social.title}
                            >
                                {social.icon}
                            </a>
                        ) : (
                            // Render an empty div as a placeholder to maintain grid structure
                            <div key={social.key} className="w-full h-full"></div>
                        )
                    ))}
                </div>
            </div>
            {/* The mt-auto will push the map to the bottom, ensuring all cards have the same height */}
            <div className="-mt-16 mt-auto"> 
                <a href={`https://www.google.com/maps?q=${encodeURIComponent(addressLines.join(', '))}`} target="_blank" rel="noopener noreferrer" title="Open in Google Maps">
                    <iframe
                        className="w-full rounded-b-lg pointer-events-none"
                        src={location.local_modal_map_src}
                        width="100%" height="270" style={{ border: 0 }}
                        allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                        title={`Location Map ${location.name}`}
                    ></iframe>
                </a>
            </div>
        </div>
    );
};

function LocationSection() {
    const [locations, setLocations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null); // Add error state

    useEffect(() => {
        const fetchAllLocations = async () => {
            try {
                const regionsResponse = await fetch(`${API_BASE_URL}/regions`);
                if (!regionsResponse.ok) {
                    throw new Error(`Failed to fetch regions: ${regionsResponse.statusText}`);
                }
                const regionsData = await regionsResponse.json();

                if (regionsData.length === 0) {
                    setIsLoading(false);
                    return;
                }
                
                // Fetch all content concurrently
                const locationPromises = regionsData.map(region =>
                    fetch(`${API_URL}/content/${region.code}`)
                        .then(res => {
                            if (!res.ok) {
                                // Don't let one failed fetch break the whole page
                                console.error(`Failed to fetch content for ${region.code}`);
                                return null; // Return null for failed fetches
                            }
                            return res.json();
                        })
                );
                
                const locationsResults = await Promise.all(locationPromises);
                
                // Filter out any null results from failed fetches
                const validLocations = locationsResults.filter(loc => loc !== null);
                setLocations(validLocations);

            } catch (error) {
                console.error("Failed to fetch locations:", error);
                setError(error.message); // Set error message to display to user
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllLocations();
    }, []);

    if (isLoading) {
        return <div className="text-center p-10 font-semibold text-gray-700">Loading Locations...</div>;
    }
    
    if (error) {
         return <div className="text-center p-10 text-red-600">Error: {error}</div>;
    }

    if (locations.length === 0) {
        return <div className="text-center p-10 text-gray-500">No locations found.</div>;
    }

    return (
        // --- THIS IS THE MAIN CHANGE ---
        // Using a grid layout that's responsive
        <div className="container mx-auto px-4 py-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
                {locations.map(loc => (
                    <LocationCard key={loc.code} location={loc} />
                ))}
            </div>
        </div>
        // --- END OF CHANGE ---
    );
}

export default LocationSection;