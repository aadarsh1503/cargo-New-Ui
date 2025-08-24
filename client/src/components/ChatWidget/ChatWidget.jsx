import React, { useState, useEffect } from "react";
import { FaWhatsapp, FaTimes } from "react-icons/fa";
import "./ChatWidget.css"; // Assuming you have this CSS file


const ChatWidget = ({
  // Provide default fallback numbers
  salesNumber = "+10000000000", 
  supportNumber = "+10000000001", 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // The static numbers are now removed and replaced by props.

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // Handle button click for both "sales" and "support"
  const handleSendMessage = (messageType) => {
    // --- MODIFICATION: Use props to determine the number ---
    const whatsappNumber =
      messageType === "sales" ? salesNumber : supportNumber;

    // Exit if the number is not provided or is just the fallback
    if (!whatsappNumber || whatsappNumber.startsWith('+10000')) {
        console.warn(`WhatsApp number for ${messageType} is not configured.`);
        return;
    }

    const message = `Hello, GVS CARGO Team! I'm [Your Name] from [Your Company]. I'm excited to discuss [Topic/Subject] with you.`;

    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    const whatsappLink = isMobile
      ? `whatsapp://send?phone=${whatsappNumber}&text=${encodeURIComponent(message)}`
      : `https://web.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(message)}`;

    window.open(whatsappLink, "_blank");
  };

  // Minimize chat widget on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isOpen]);

  // --- MODIFICATION: Only render the widget if at least one number is properly configured ---
  const isWidgetActive = salesNumber && !salesNumber.startsWith('+10000') || supportNumber && !supportNumber.startsWith('+10000');

  if (!isWidgetActive) {
    return null; // Don't render the widget if no numbers are set for the region
  }

  return (
    <div className="fixed bottom-8 right-2 z-50">
      <button
        onClick={toggleChat}
        className="bg-green-500 text-white p-2 pl-3 pr-4 rounded-full shadow-lg flex items-center hover:bg-green-600 transition duration-300"
      >
        {isOpen ? (
          <FaTimes size={18} />
        ) : (
          <>
            <FaWhatsapp size={18} className="mr-1" />
            <span className={`hidden sm:inline ${isOpen ? "waving-text" : ""}`}>
              Hi, how can I help?
            </span>
          </>
        )}
      </button>

      {isOpen && (
        <div
          className={`shadow-lg bg-white rounded-lg p-4 w-80 mt-2 relative animate-slide-up`}
        >
          <div className="bg-green-500 text-white p-3 rounded-t-lg">
            <p className="text-sm sm:text-base">Choose the option to contact us:</p>
          </div>

          <div className="p-4 flex flex-col space-y-4">
            {/* --- MODIFICATION: onClick now passes 'sales' --- */}
            <button
              onClick={() => handleSendMessage("sales")}
              className="bg-gray-200 text-green-700 p-3 rounded-lg shadow-md hover:bg-gray-300 transition duration-300 flex items-center justify-center text-lg"
            >
              <FaWhatsapp className="mr-2" size={20} />
              SALES
            </button>
            {/* --- MODIFICATION: onClick now passes 'support' --- */}
            <button
              onClick={() => handleSendMessage("support")}
              className="bg-gray-200 text-green-700 p-3 rounded-lg shadow-md hover:bg-gray-300 transition duration-300 flex items-center justify-center text-lg"
            >
              <FaWhatsapp className="mr-2" size={20} />
              SUPPORT
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;