import React, { useState } from 'react';
import Slide from '../Slide/Slide';
import BounceOne from '../BounceOne/BounceOne';

// Import all images
import first from "./first.png";
import sec from "./sec.png";
import third from "./third.png";
import Refer1 from "./Refer1.png";
import Refer2 from "./Refer2.png";
import Open1 from "./Open1.png";
import Open2 from "./Open2.png";
import Flat1 from "./Flat1.png";
import Flat2 from "./Flat2.png";
import Plataform1 from "./plataform1.png";
import Plataform2 from "./plataform2.png";
import Tank from "./tank.png";
import Slide1 from '../Slide1/Slide1';

function Containers() {
    const [selected, setSelected] = useState('DRY BOX');

    // Image data organized by container type
    const containerImages = {
        'DRY BOX': [first, sec, third],
        'REEFER': [Refer1, Refer2],
        'OPEN TOP': [Open1, Open2],
        'FLAT RACK': [Flat1, Flat2],
        'PLATFORM': [Plataform1, Plataform2],
        'TANK': [Tank],
    };

    return (
        <div>
        <div className="font-roboto max-w-6xl mx-auto p-4 lg:p-8 bg-white">
            {/* Container selection buttons */}
            <div className="flex flex-wrap items-center justify-start space-x-4 space-y-2 lg:space-y-0 cursor-pointer mb-4">
                {Object.keys(containerImages).map((item) => (
                    <div
                        key={item}
                        className={`font-bold text-xl text-black relative group p-2 rounded-md transition-colors duration-300 ${
                            selected === item ? 'border-b-2 border-black' : 'hover:bg-gray-100'
                        }`}
                        onClick={() => setSelected(item)}
                    >
                        {item}
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                ))}
            </div>

            {/* Image grid for selected container type */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {containerImages[selected].map((imageSrc, index) => (
                    <img
                        key={index}
                        src={imageSrc}
                        alt={`${selected} Photo ${index + 1}`}
                        className={`w-full object-fill rounded-lg shadow ${
                            selected === 'TANK' ? 'lg:h-[400px] lg:w-[500px]  object-cover ' : 'h-auto lg:h-[400px]'
                        }`}
                    />
                ))}
            </div>

            <BounceOne />
         
                
            
        </div>
        <Slide />
        </div>
    );
}

export default Containers;
