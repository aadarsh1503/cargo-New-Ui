import React from 'react';
import eng from "./eng.png"

const IncotermsSection = () => {
  return (
    <div className="flex flex-col items-center p-6 space-y-6">
      {/* Title */}
      <h1 className="text-2xl font-bold text-center lg:mt-32 text-black">INCOTERMS</h1>
      
      {/* First Paragraph */}
      <p className="text-center text-gray-500 max-w-6xl">
        No matter how far one country is from another, it is the foreign trade (together with logistics) responsible for the delivery and clearance of the product at the final destination, both importing and exporting. The so-called Incoterms are a standard set of definitions determining neutral rules and practices that serve to define, within an international purchase and sale contract, the reciprocal rights and obligations of the exporter and the importer.
      </p>

      {/* Second Paragraph */}
      <p className="text-center text-gray-500 max-w-6xl">
        The purpose of INCOTERMS is to provide a set of international rules for the interpretation of the most common terms used in international trade. In this way, uncertainties in the interpretation of these terms in different countries can be avoided, or at least reduced. The use of INCOTERMS is optional, but its use is highly recommended for simplification and to avoid conflicts of interpretation.
      </p>

      {/* Image */}
      <div className="w-full  flex justify-center">
        <img
          src={eng}
          alt="Incoterms Chart"
          className=" mb-10  border outline outline-black lg:w-[600px] rounded"
           // Adjust size as needed
        />
      </div>
    </div>
  );
};

export default IncotermsSection;
