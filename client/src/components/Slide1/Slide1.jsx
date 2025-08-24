import React, { useEffect, useState, useRef } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import "./Slide1.css";
import i2 from "./i2.png";
import i4 from "./i4.png";
import i5 from "./i5.png";
import i1 from "./i1.png";
import i6 from "./i6.png";
import i7 from "./i7.png";
import i8 from "./i8.png";
import i9 from "./i9.png";
import i10 from "./i10.png";
import i11 from "./i11.png";
import i12 from "./i12.png";
import i100 from "./i100.png";
import i101 from "./i101.jpg";

const Slide1 = () => {
    const images = [i1, i2, i4, i5, i101 ,i7,i8,i9,i10,i11,i12,i100];
    const imageLinks = [
        "https://example.com/link1",
        "https://alshaheen.pro/",
        "https://saffary.com/",
        "https://alshaheenexpress.com/",
        "https://gvscargo.net/",
        "https://gvs-bh.com/",
        "https://example.com/link8",
        "https://example.com/link9",
        "https://www.aquacare.me/",
        "https://example.com/link11",
        "https://arabiaseel.com/",
        "https://alzyara.com/"
        
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
        pauseOnHover: false,
        beforeChange: (current, next) => {
            if (sliderRef.current) {
                sliderRef.current.slickGoTo(next);
            }
        },
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 4,
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 3,
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                }
            },
            {
                breakpoint: 360,
                settings: {
                    slidesToShow: 1,
                }
            }
        ]
    };

    return (
        <section className="py-10 lg:max-w-7xl mb-1 lg:w-full w-[200px] mx-auto">
            <div className="">
                {isLoaded ? (
                    <Slider ref={sliderRef} {...settings}>
                        {images.map((src, index) => (
                            <div key={index} className="slide-item">
                                <a href={imageLinks[index]} target="_blank" rel="noopener noreferrer" className="image-link" style={{ outline: 'none' }}>
                                    <img
                                        src={src}
                                        alt={`Slide ${index + 1}`}
                                        className="object-contain w-full md:w-4/4 mx-auto slide-image"
                                        style={{ maxHeight: '200px' }}
                                    />
                                </a>
                            </div>
                        ))}
                    </Slider>
                ) : (
                    <div className="flex justify-center items-center" style={{ height: '300px' }}>
                        <span>Loading...</span>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Slide1;
