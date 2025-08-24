import React, { useEffect, useState, useRef } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// Importing logos - ye bilkul waise hi hai
import i1 from "./i1.png";
import item2 from "./item2.png";
import i3 from "./i3.png";
import i4 from "./i4.png";
import i5 from "./i5.png";
import i6 from "./i6.png";
import i7 from "./i7.png";
import i8 from "./i8.png";
import i9 from "./i9.png";
import i10 from "./i10.png";
import i11 from "./i11.png";
import i12 from "./i12.png";

const Slide = () => {
    // FUNCTIONALITY - In cheezon ko bilkul nahi badla gaya hai
    const images = [i1, item2, i3, i4, i5, i6 ,i7,i8,i9,i10,i11,i12];
    const imageLinks = [
        "http://www.pangea-network.com",
        "https://www.glafamily.com/",
        "http://www.logifem.com.tr",
        "http://www.signaturegln.com",
        "https://www.jctrans.com/en/",
        "https://fiata.org/",
        "https://bridginglogpro.com/",
        "https://www.gtran.net/",
        "https://www.worldfoodcargoalliance.com",
        "https://crisscrossconnex.co.jp",
        "https://www.df-alliance.com/",
        "https://www.smilelogisticsnetworks.com/"
    ];

    const [isLoaded, setIsLoaded] = useState(false);
    const sliderRef = useRef(null);

    const preloadImages = (images) => {
        let loadedImages = 0;
        const totalImages = images.length;
        images.forEach((src) => {
            const img = new Image();
            img.src = src;
            img.onload = () => {
                loadedImages += 1;
                if (loadedImages === totalImages) {
                    setIsLoaded(true);
                }
            };
        });
    };

    useEffect(() => {
        preloadImages(images);
    }, [images]);

    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 6,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2100,
        cssEase: "linear",
        pauseOnHover: true, // Pause on hover is good for clickable logos
        beforeChange: (current, next) => {
            if (sliderRef.current) {
                sliderRef.current.slickGoTo(next);
            }
        },
        responsive: [
            { breakpoint: 1024, settings: { slidesToShow: 4 } },
            { breakpoint: 768, settings: { slidesToShow: 3 } },
            { breakpoint: 640, settings: { slidesToShow: 2 } }
        ]
    };
    // FUNCTIONALITY END - Yahan tak sab kuch same hai

    // DESIGN - Sirf ye hissa badla gaya hai
    return (
        <section className=" py-20 sm:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-800 tracking-tight sm:text-4xl">
                        Our Partner Networks
                    </h2>
                    <p className="mt-4 text-lg text-gray-600">
                        Connecting the world with trusted industry leaders.
                    </p>
                </div>
                
                <div className="mt-16">
                    {isLoaded ? (
                        <Slider ref={sliderRef} {...settings}>
                            {images.map((src, index) => (
                                // Har slide item ko style kiya gaya hai
                                <div key={index} className="px-4">
                                    <a 
                                        href={imageLinks[index]} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="block p-4 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300"
                                    >
                                        <div className="overflow-hidden rounded-lg"> 
                                            <img
                                                src={src}
                                                alt={`Partner ${index + 1}`}
                                                className="
                                                    h-32 w-full object-contain 
                                                    transition-transform duration-300 ease-in-out
                                                    hover:scale-110 
                                                "
                                            />
                                        </div>
                                    </a>
                                </div>
                            ))}
                        </Slider>
                    ) : (
                
                        <div className="flex justify-center items-center h-40 bg-white/50 rounded-2xl">
                            <p className="text-gray-600 font-semibold">Loading Partners...</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Slide;