import { useState, useEffect } from 'react';
import { FaLinkedin, FaInstagram, FaFacebook, FaMapMarkerAlt } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXTwitter } from '@fortawesome/free-brands-svg-icons';
import { faPhone } from '@fortawesome/free-solid-svg-icons';
import { API_BASE_URL } from '../../config/apiConfig';

const HQ_CODE = 'bahrain'; // Bahrain is the main headquarters

// Convert any google maps URL to a proper embed URL that won't be blocked by X-Frame-Options
const toEmbedUrl = (src) => {
    if (!src) return '';
    // Already a proper embed URL — pass through
    if (src.includes('/maps/embed')) return src;
    try {
        const url = new URL(src.startsWith('http') ? src : `https://${src}`);
        const q = url.searchParams.get('q');
        const z = url.searchParams.get('z') || '15';
        if (q) {
            const coordMatch = q.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
            if (coordMatch) {
                const [, lat, lng] = coordMatch;
                return `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d5000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2s!4v1`;
            }
            return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=${z}&output=embed`;
        }
        // google.com/maps/place/... — extract @lat,lng from path and embed
        const atMatch = src.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
        if (atMatch) {
            return `https://maps.google.com/maps?q=${atMatch[1]},${atMatch[2]}&z=17&output=embed`;
        }
    } catch { /* ignore */ }
    if (src.includes('output=embed')) return src.replace('http://', 'https://');
    // Short URLs (maps.app.goo.gl) and unknown — can't embed directly
    return '';
};

// Extract a clickable Google Maps URL from the embed src
const toMapsLink = (src, addressFallback) => {
    if (src) {
        // pb= embed URL — extract place ID and name for a proper place link
        if (src.includes('/maps/embed?pb=')) {
            // Place ID can be URL-encoded (0x...%3A0x...) or plain (0x...:0x...)
            const placeIdMatch = src.match(/!1s(0x[0-9a-f]+(?:%3A|:)0x[0-9a-f]+)/i);
            // Place name is encoded as !2s<name>
            const nameMatch = src.match(/!2s([^!]+)/);
            const placeName = nameMatch ? decodeURIComponent(nameMatch[1]) : addressFallback;

            if (placeIdMatch) {
                const placeId = decodeURIComponent(placeIdMatch[1]);
                return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeName)}&query_place_id=${encodeURIComponent(placeId)}`;
            }
            // No place ID — use name if found
            if (nameMatch) {
                return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeName)}`;
            }
        }
        // Regular google maps URL or short URL — use directly
        if (src.includes('google.com/maps') || src.includes('maps.app.goo.gl')) return src;
        try {
            const url = new URL(src);
            const q = url.searchParams.get('q');
            if (q) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
        } catch { /* ignore */ }
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressFallback)}`;
};
const LocationCard = ({ location, isHQ = false }) => {
    const addressLines = location.address && Array.isArray(location.address) ? location.address : [];
    const socialIcons = [
        { key: 'phone', href: `tel:${location.phone}`, icon: <FontAwesomeIcon icon={faPhone} />, title: `Call ${location.name} Office`, data: location.phone },
        { key: 'linkedin', href: location.social_linkedin, icon: <FaLinkedin />, title: `LinkedIn`, data: location.social_linkedin },
        { key: 'instagram', href: location.social_instagram, icon: <FaInstagram />, title: `Instagram`, data: location.social_instagram },
        { key: 'facebook', href: location.social_facebook, icon: <FaFacebook />, title: `Facebook`, data: location.social_facebook },
        { key: 'twitter', href: location.social_twitter, icon: <FontAwesomeIcon icon={faXTwitter} />, title: `Twitter`, data: location.social_twitter }
    ];
    return (
        <div className={`bg-white w-full shadow-custom rounded-lg overflow-hidden flex flex-col ${isHQ ? 'ring-2 ring-DarkBlue' : ''}`}>
            <div className="relative z-10 bg-white p-6 rounded-t-lg">
                <div className="flex items-center gap-2 mb-1">
                    {isHQ && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-DarkBlue text-white px-2 py-0.5 rounded-full">
                            <FaMapMarkerAlt className="text-[10px]" /> Main HQ
                        </span>
                    )}
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    {isHQ ? 'Bahrain Office' : `${location.name} Office`}
                </h2>
                <p className="text-gray-600 text-sm mb-4 h-16">
                    <strong>Address:</strong> {addressLines.join(', ')}
                </p>
                <div className="flex flex-wrap gap-2">
                    {socialIcons.filter(s => s.data).map(social => (
                        <a
                            key={social.key}
                            href={social.href}
                            target={social.key !== 'phone' ? '_blank' : undefined}
                            rel={social.key !== 'phone' ? 'noopener noreferrer' : undefined}
                            className="flex items-center justify-center bg-white p-2 rounded-full text-DarkBlue text-3xl hover:bg-gray-100 transition-colors"
                            title={social.title}
                        >
                            {social.icon}
                        </a>
                    ))}
                </div>
            </div>
            <div className="mt-auto">
                <a href={toMapsLink(location.local_modal_map_src, addressLines.join(', '))} target="_blank" rel="noopener noreferrer" title="Open in Google Maps">
                    {toEmbedUrl(location.local_modal_map_src) ? (
                        <iframe
                            className="w-full rounded-b-lg pointer-events-none"
                            src={toEmbedUrl(location.local_modal_map_src)}
                            width="100%" height="270" style={{ border: 0 }}
                            allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                            title={`Location Map ${location.name}`}
                        />
                    ) : (
                        <div className="w-full h-[270px] bg-gray-100 rounded-b-lg flex items-center justify-center text-gray-400 text-sm hover:bg-gray-200 transition-colors">
                            <FaMapMarkerAlt className="mr-2" /> View on Google Maps
                        </div>
                    )}
                </a>
            </div>
        </div>
    );
};

function LocationSection() {
    const [locations, setLocations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const CACHE_KEY = 'gvs_locations_cache';
        const CACHE_TTL = 0; // Set to 0 to always fetch fresh (change back to 5 * 60 * 1000 after debugging)

        const fetchAllLocations = async () => {
            // Check cache first
            try {
                const cached = localStorage.getItem(CACHE_KEY);
                if (cached) {
                    const { data, ts } = JSON.parse(cached);
                    if (Date.now() - ts < CACHE_TTL) {
                        console.log('[Map] Serving from cache:', data);
                        setLocations(data);
                        setIsLoading(false);
                        return;
                    } else {
                        console.log('[Map] Cache expired, fetching fresh data...');
                    }
                } else {
                    console.log('[Map] No cache found, fetching...');
                }
            } catch { /* ignore bad cache */ }

            try {
                console.log('[Map] Fetching from:', `${API_BASE_URL}/locations/all`);
                const res = await fetch(`${API_BASE_URL}/locations/all`);
                if (!res.ok) throw new Error(`Failed to fetch locations`);
                const data = await res.json();
                console.log('[Map] Raw data from backend:', data);
                data.forEach(loc => {
                    console.log(`[Map] ${loc.code} — local_modal_map_src:`, loc.local_modal_map_src);
                });
                setLocations(data);
                localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
            } catch (err) {
                console.error('[Map] Failed to fetch locations:', err);
                setError(err.message);
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

    const hq = locations.find(l => l.code === HQ_CODE);
    const others = locations.filter(l => l.code !== HQ_CODE);

    return (
        <div className="container mx-auto px-4 py-10">
            {/* Section heading */}
            <div className="text-center mb-10">
                <h2 className="text-4xl font-bold text-gray-800 mb-2">Our Locations</h2>
                <p className="text-gray-500 text-sm">Find us around the world</p>
                <div className="mt-3 mx-auto w-16 h-1 bg-DarkBlue rounded-full" />
            </div>

            {/* All locations — HQ in centre, others on left/right */}
            <div className="flex flex-col lg:flex-row items-stretch justify-center gap-8">

                {/* Left offices */}
                {others.length > 0 && (
                    <div className="flex flex-col gap-8 flex-1 max-w-[360px] mx-auto lg:mx-0">
                        {others.filter((_, i) => i % 2 === 0).map(loc => (
                            <LocationCard key={loc.code} location={loc} />
                        ))}
                    </div>
                )}

                {/* Centre — Main HQ */}
                {hq && (
                    <div className="flex flex-col items-center gap-2 flex-shrink-0 w-full max-w-[400px] mx-auto">
                        <p className="text-xs font-semibold uppercase tracking-widest text-DarkBlue">Main Headquarters</p>
                        <LocationCard location={hq} isHQ={true} />
                    </div>
                )}

                {/* Right offices */}
                {others.length > 1 && (
                    <div className="flex flex-col gap-8 flex-1 max-w-[360px] mx-auto lg:mx-0">
                        {others.filter((_, i) => i % 2 === 1).map(loc => (
                            <LocationCard key={loc.code} location={loc} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default LocationSection;