import React, { useEffect, useState } from 'react';
import "./LanguageSwitcher.css";

const LanguageSwitcher = () => {
    const [isThrottled, setIsThrottled] = useState(false);
    const [loading, setLoading] = useState(false); // New loading state

    useEffect(() => {
        const existingScript = document.getElementById('google-translate-script');
        if (!existingScript) {
            const googleTranslateScript = document.createElement('script');
            googleTranslateScript.id = 'google-translate-script';
            googleTranslateScript.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
            document.body.appendChild(googleTranslateScript);
        }

        window.googleTranslateElementInit = () => {
            new window.google.translate.TranslateElement({ pageLanguage: 'en' }, 'google_translate_element');
        };
    }, []);

    const changeLanguage = (lang) => {
        if (isThrottled) return; // Ignore clicks if throttled

        const selectElem = document.querySelector('#google_translate_element select');
        if (selectElem) {
            selectElem.value = lang;
            selectElem.dispatchEvent(new Event('change', { bubbles: true }));
            console.log(`Language changed to: ${lang}`);
            
            setLoading(true); // Start loading

            // Wait for the text to change before reloading
            setTimeout(() => {
                window.location.reload(); // Reload the page
            }, 1000); // Adjust the timeout as necessary

            // Set throttling for 1 second (1000 ms)
            setIsThrottled(true);
            setTimeout(() => {
                setIsThrottled(false);
            }, 1000);
        } else {
            console.log('Google Translate has not been initialized yet.');
        }
    };

    useEffect(() => {
        // Remove loading state when the page loads
        const handleLoad = () => {
            setLoading(false);
        };

        window.addEventListener('load', handleLoad);
        
        return () => {
            window.removeEventListener('load', handleLoad);
        };
    }, []);

    return (
<div>
    {loading && (
        <div className="loading-overlay fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="loading-spinner border-4 border-t-4 border-gray-200 rounded-full w-16 h-16 animate-spin"></div>
        </div>
    )}
    <div className="flex items-center justify-between p-  rounded-lg shadow-lg">
        <div className="font-bold text-xl text-white"></div>
        <div id="google_translate_element" className="hidden"></div>
        <div className="language-switcher flex gap-4 items-center">
            <div class="flex items-center space-x-4">
                <div class="flex items-center space-x-2">
                    <img
                        src="https://t3.ftcdn.net/jpg/00/66/61/74/360_F_66617490_w7bC64aJjLgIJc4iBRN1QawdvhV9SVuF.jpg"
                        alt="Switch to Arabic"
                        onClick={() => changeLanguage('ar')}
                        className="cursor-pointer w-7 h-7 rounded-full transition-transform duration-300 hover:scale-110"
                    />
                    <span class="text-sm text-white font-semibold">Ar</span>
                </div>

                <div class="flex items-center space-x-2">
                    <img
                        src="https://cdn.britannica.com/79/4479-050-6EF87027/flag-Stars-and-Stripes-May-1-1795.jpg"
                        alt="Switch to English"
                        onClick={() => changeLanguage('en')}
                        className="cursor-pointer w-7 h-7 rounded-full transition-transform duration-300 hover:scale-110"
                    />
                    <span class="text-sm text-white font-semibold">En</span>
                </div>
            </div>
        </div>
    </div>
</div>

    );
};

export default LanguageSwitcher;
