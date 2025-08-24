import React, { useState } from 'react';
import ColorBar from '../Colorbar/Colorbar';
import IncotermsSection from './IncotermsSection';
import { useRegion } from '../../context/RegionContext'; // Import the context hook

function CollapsibleSection({ title, description }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSection = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className=''>
      <div className="font-roboto lg:max-w-7xl bg-white lg:mx-auto">
        <div
          className="flex bg-YellowLight lg:px-4 outline-white border outline-1 lg:w-[1280px] lg:py-2 cursor-pointer"
          onClick={toggleSection}
        >
          <div className="text-2xl lg:mr-3">
            {isOpen ? '-' : '▼'}
          </div>
          <div className="font-bold text-start items-center font-roboto justify-center text-lg">{title}</div>
        </div>
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'sm-min-h-screen lg:max-h-screen' : '-h-10'}`}
        >
          {isOpen && (
            <div className="text-start lg:mt-4 lg:ml-56 border-yellow-400">
              <p className="lg:-ml-48 lg:mb-4 p-2 font-roboto">{description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Incoterms() {
  // Get content and loading state from the context
  const { content, isLoading } = useRegion();

  // Show a loading state until content is ready
  if (isLoading || !content) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl">Loading Regional Content...</p>
      </div>
    );
  }

  return (
    <div>
      <IncotermsSection />
      <div className="py-20 bg- outline-white border-1 font-roboto">
        <CollapsibleSection
          title="GROUP E"
          description={
            <>
              <strong className='text-3xl mt-2'>EXW – Ex Works</strong>
              <h2 className='text-black font-bold'>AT ORIGIN (named place of delivery).</h2>
              <br />
              The seller merely makes the goods available to the buyer at his/her home within the established period and is not responsible for the clearance for export or <br /> for loading the goods onto any collection vehicle. Usable in any mode of transport.
              <br />
              <br />
              {/* --- DYNAMIC CHANGE HERE --- */}
              Note: since the foreign buyer does not have the legal conditions to arrange for customs clearance for goods to leave the country, it is understood that this <br /> measure is adopted by the seller, at his/her own expense and risk, in the case of<br /> {content.name.toUpperCase()} exports.
            </>
          }
        />

        <CollapsibleSection
          title="GROUP F"
          description={
            <>
              <strong className='text-3xl mt-10'>FCA – Free Carrier</strong>
              <br />
              <h1 className='text-3xl mt-2 font-roboto font-semibold'>FREE AT CARRIER (named delivery location).</h1>
              <br />
              The seller completes his obligations and ends his liability when he delivers the goods, cleared for export, to the carrier or to another person indicated by<br/> the buyer, at the named place in the country of origin. Usable in any mode of transport.
              <br />
              <br />
              {/* --- DYNAMIC CHANGE HERE --- */}
              Note: since the foreign buyer does not have the legal conditions to arrange for customs clearance for goods to leave the country, it is understood that this <br/> measure is adopted by the seller, at his/her own expense and risk, in the case of {content.name.toUpperCase()} exports.
              <br />
              <br />
              <strong className='text-3xl mt-2'>FAS – Free Along Side Ship</strong>
              <br />
              <h1 className='text-3xl mt-2 font-semibold'>FREE ALONGSIDE SHIP (named port of embarkation).</h1>
              <br />
              The seller's obligations end when the goods are placed, cleared for export, along the side of the carrier vessel indicated by the buyer, on the quay or on <br/> vessels used for loading the goods, at the port of shipment named by the buyer. Usable exclusively in waterway transport (sea or inland waterway).
              <br />
              <br />
              <strong className='text-3xl mt-2'>FOB – Free on Board</strong>
              <br />
              <h1 className='text-3xl mt-2 font-semibold'>FREE ON BOARD (named port of embarkation).</h1>
              <br />
              The seller's obligations and responsibilities end when the goods, cleared for export, are delivered, stowed, on board the ship at the port of embarkation,<br/>  both indicated by the buyer, on the date or within the period agreed. Usable exclusively in water transport (sea or inland waterway).
            </>
          }
        />
        
        <CollapsibleSection
          title="GROUP C"
          description={
            <>
              <strong className='text-3xl mt-10'>CFR – Cost and Freight</strong>
              <br />
              <h1  className='text-3xl mt-2 font-semibold'>COST AND FREIGHT (named port of destination).</h1>
              <br />
              In addition to bearing the obligations and risks provided for in the FOB term, the seller contracts and pays the freight and costs necessary to take the goods to <br /> the agreed port of destination. Usable exclusively in waterway transport (sea or inland waterway).
              <br />
              <br />
              <strong className='text-3xl mt-10'>CIF – Cost, Insurance and Freight</strong>
              <br />
              <h1  className='text-3xl mt-2 font-semibold'>COST, INSURANCE AND FREIGHT (named port of destination).</h1>
              <br />
              In addition to bearing the obligations and risks provided for in the FOB term, the seller contracts and pays freight, costs and insurance relating to the transport<br /> of the goods to the agreed port of destination. Usable exclusively in water transport (sea or inland waterway).
              <br />
              <br />
              <strong className='text-3xl mt-10'>CIP – Carriage and Insurance Paid to</strong>
              <br />
              <h1  className='text-3xl mt-2 font-semibold'>TRANSPORTATION AND INSURANCE PAID TO (named destination).</h1>
              <br />
              In addition to bearing the obligations and risks provided for in the FCA term, the seller contracts and pays for freight, costs and insurance related to the<br /> transportation of the goods to the agreed destination. Usable in any mode of transportation.
            </>
          }
        />

        <CollapsibleSection
          title="GROUP D"
          description={
            <>
              <strong className='text-3xl mt-10'>DAP – Delivered at Place</strong>
              <br />
              <h1 className='text-3xl mt-2 font-semibold'>DELIVERED TO LOCATION (named destination location).</h1>
              <br />
              The seller completes his obligations and ends his liability when he places the goods at the disposal of the buyer, on the date or within the period agreed, at a place of destination indicated other than a terminal, ready to be unloaded from the transport vehicle and not cleared for import. Usable in any mode of transport.
              <br />
              <br />
              <strong className='text-3xl mt-10'>DAT – Delivered at Terminal</strong>
              <br />
              <h1 className='text-3xl mt-2 font-semibold'>DELIVERED TO TERMINAL (named terminal at port or place of destination).</h1>
              <br />
              The seller completes his obligations and ends his liability when the goods are placed at the disposal of the buyer, on the date or within the agreed period, at a named destination terminal (quay, container terminal or warehouse, among others), unloaded from the transport vehicle but not cleared for import.
              <br />
              <br />
              <strong className='text-3xl mt-10'>DDP – Delivered Duty Paid</strong>
              <br />
              <h1 className='text-3xl mt-2 font-semibold'>DELIVERED DUTY PAID (named place of destination).</h1>
              <br />
              The seller completes his obligations and ends his liability when the goods are placed at the disposal of the buyer, on the date or within the agreed period, at the designated place of destination in the importing country, unloaded from the means of transport.
              <br />
              <br />
              The seller, in addition to customs clearance, assumes all risks and costs, including taxes, fees, and other charges incident on import. Usable in any mode of transport.
              <br />
              <br />
              {/* --- DYNAMIC CHANGE HERE --- */}
              <strong className='text-xl mt-10'>Note:</strong> Since the foreign seller does not have the legal conditions to arrange customs clearance for the entry of goods into the country, this term cannot be used for {content.name} imports. DAT or DAP must be chosen if a condition regulated by the ICC is preferred.
            </>
          }
        />
      </div>
      <div className=''>
        <ColorBar />
      </div>
    </div>
  );
}

export default Incoterms;