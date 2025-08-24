import React from 'react';
import Bounce from '../Bounce/Bounce';
import Slide from '../Slide/Slide';
import ColorBar from '../Colorbar/Colorbar';
import Slide1 from '../Slide1/Slide1';

function CustomClearance() {
  return (
    <div>
      <div className="flex flex-col items-start max-w-6xl lg:mt-32 font-roboto  mx-auto  p-4 lg:p-8 bg-white">
        <div className="mb-2 flex flex-col lg:flex-row mt-6 items-start justify-between w-full">
          <div className="flex-1 mb-4 lg:mb-0">
            <h2 className="text-3xl lg:ml-44 text-black lg:mt-4 font-bold mb-1">
            Specialized  in
              <h2 className='-ml-6 text-black font-roboto text-3xl  mt-10'>Customs Process</h2>
            </h2>
            <div className="h-1 lg:w-[270px] lg:ml-36 bg-yellow-500"></div>
          </div>
          <div className="w-full lg:w-1/2 font-poppins gap-4 ml-4 lg:ml-0">
            <p className="text-md mt-4 font-roboto  text-Graytext">
             
            In addition to the transportation service, BR Freight specializes in the entire customs process, operating in any country in the world quickly and safely, from classifying your cargo according to its tax status and common external tariff (TEC), to releasing accompanied or unaccompanied baggage.<br />


            </p>
            <p className='mt-2 mb-2 text-Graytext'>We prepare all the necessary documentation for companies to participate in international fairs and events, with temporary imports and/or exports. Our team of professionals monitors each phase of your shipment, at ports, airports, border points and customs zones, able to resolve all the details and transmit all the information to our system in real time, where you can track the entire trajectory of your cargo.</p>
            <p className="text-md mt-4 text-Graytext">
            At ports and airports connected to SISCOMEX (Federal Revenue System), our team is prepared to provide you with all the guidance you need for your import or export, as well as preparing all the required documentation.
            </p>
           
          </div>
        </div>
      </div>
      <Bounce />
  
        <Slide />
  
        <ColorBar />
    </div>
  );
}

export default CustomClearance;
