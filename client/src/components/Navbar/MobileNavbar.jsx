// MobileNavbar.js
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaTimes, FaChevronDown } from "react-icons/fa";

const MobileNavbar = ({ isOpen, setIsOpen, navItems = [] }) => {
  const [openMobileDropdown, setOpenMobileDropdown] = useState(null);
  const location = useLocation();

  // Effect to close the entire mobile menu when the route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, setIsOpen]);

  // Effect to reset open dropdowns when the menu is closed
  useEffect(() => {
    if (!isOpen) {
      setOpenMobileDropdown(null);
    }
  }, [isOpen]);

  // Toggles the visibility of a specific dropdown in the mobile menu
  const handleMobileDropdownToggle = (index) => {
    setOpenMobileDropdown(openMobileDropdown === index ? null : index);
  };

  // Closes the menu when any link is clicked
  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    // 👇 Main container with light glassmorphism effect
    <div
      className={`fixed inset-0 min-h-screen bg-white z-50 transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-500 ease-in-out lg:hidden`}
    >
      <div className="flex justify-end p-5">
        {/* 👇 Updated close button style for light theme */}
        <button onClick={() => setIsOpen(false)} className="text-gray-700 hover:text-black transition-colors">
          <FaTimes size={28} />
        </button>
      </div>

      <nav className="flex flex-col bg-white z-50 items-center mt-8 px-4">
        {navItems.map((item, index) => (
          <div 
            key={item.name} 
            className="w-full text-center border-b border-gray-200"
            // 👇 Staggered animation for menu items
            style={{ transitionDelay: `${index * 50}ms` }}
          >
            {/* 👇 Item container with transition for fade-in/slide-up effect */}
            <div
              className={`transform transition-all duration-300 ${
                isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
              }`}
            >
              {item.dropdown ? (
                <>
                  <button
                    onClick={() => handleMobileDropdownToggle(index)}
                    // 👇 Updated button style
                    className="w-full py-4 text-gray-800 text-lg font-medium flex justify-center items-center gap-2"
                  >
                    {item.name}
                    <FaChevronDown
                      className={`transition-transform duration-300 ${
                        openMobileDropdown === index ? "rotate-180" : ""
                      }`}
                      size={14}
                    />
                  </button>
                  {/* 👇 Wrapper for smooth dropdown animation */}
                  <div
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${
                      openMobileDropdown === index ? 'max-h-96' : 'max-h-0'
                    }`}
                  >
                    <div className="bg-black/5 py-2 rounded-lg">
                      {item.dropdown.map((subItem) =>
                        item.isExternal ? (
                          <a
                            key={subItem.name}
                            href={subItem.link}
                            // 👇 Updated link style
                            className="block py-3 text-gray-600 hover:text-black transition-colors"
                          >
                            {subItem.name}
                          </a>
                        ) : (
                          <Link
                            key={subItem.name}
                            to={subItem.link}
                            onClick={handleLinkClick}
                            // 👇 Updated link style
                            className="block py-3 text-gray-600 hover:text-black transition-colors"
                          >
                            {subItem.name}
                          </Link>
                        )
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <Link
                  to={item.link}
                  onClick={handleLinkClick}
                   // 👇 Updated link style
                  className="block w-full py-4 text-gray-800 text-lg font-medium"
                >
                  {item.name}
                </Link>
              )}
            </div>
          </div>
        ))}
        {/* 👇 Enhanced CTA button with animation */}
        <div
          className={`mt-6 transform transition-all mb-6 duration-300 ${
            isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
          style={{ transitionDelay: `${navItems.length * 50}ms` }}
        >
          <Link
            to="/ContactUs"
            onClick={handleLinkClick}
            className="px-10 py-3  bg-blue-600 text-white font-semibold rounded-full shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105"
          >
            Request a Quote
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default MobileNavbar;