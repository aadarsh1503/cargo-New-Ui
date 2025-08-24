import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useLocation } from "react-router-dom"; // useLocation is key
import { FaChevronDown, FaBars, FaTimes } from "react-icons/fa";
import Select from "react-select";
import { AnimatePresence,motion } from "framer-motion";
import { useRegion } from "../../context/RegionContext";
import FuturisticLoader from "./Loader";
import g121 from "./g121.png";
import GVS from "./GVS.png";


// Helper component for dropdown items
const DropdownItem = ({ to, children, isExternal = false }) => {
  if (isExternal) {
    return (
      <a
        href={to}
        className="block px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 whitespace-nowrap"
      >
        {children}
      </a>
    );
  }
  return (
    <Link
      to={to}
      className="block px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 whitespace-nowrap"
    >
      {children}
    </Link>
  );
};


const Navbar = () => {
  // --- STATE & HOOKS ---
  const { region, setRegion, isLoading, content, availableRegions } = useRegion();
  const location = useLocation(); // <<< 1. Get the current location
  const [dropdown, setDropdown] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [openMobileDropdown, setOpenMobileDropdown] = useState(null);
  const navRef = useRef(null);
  
  // <<< 2. Determine if we are on the homepage
  const isHomePage = location.pathname === '/';

  // Hover handlers
  const handleDropdownHover = (menuName) => setDropdown(menuName);
  const handleDropdownLeave = () => setDropdown(null);

  // Memoize region options for performance
  const regionOptions = useMemo(
    () => availableRegions.map((r) => ({ value: r.code, label: r.name, flag: r.country_flag })),
    [availableRegions]
  );
  const selectedRegionObject = useMemo(() => regionOptions.find((o) => o.value === region), [region, regionOptions]);
  const handleRegionChange = (selectedOption) => {
    if (selectedOption) setRegion(selectedOption.value);
  };

  // Effects for closing dropdowns
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) setDropdown(null);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    setDropdown(null);
    setIsOpen(false);
  }, [location.pathname]);

  // Loading state
  if (isLoading || !content) {
    return <FuturisticLoader />;
  }

  // --- DYNAMIC NAVIGATION ITEMS (POPULATED) ---
  const navItems = [
    { name: "Home", link: "/" },
    {
      name: "About Us",
      dropdown: [
        { name: "Who We Are", link: "/whoWeAre" },
        { name: "Our Testimonials", link: "/testimonials" },
        { name: `We Operate in ${content.name} & GCC`, link: "/whereServe" },
        { name: "We Operate Worldwide", link: "/operateWorld" },
        { name: "Mission, Vision, and Values", link: "/missionvisionandvalues" },
      ],
    },
    {
      name: "Freights",
      dropdown: [
        { name: "Air Freight", link: "/airFreight" },
        { name: "Road Freight", link: "/roadFreight" },
        { name: "Sea Freight", link: "/seaFreight" },
      ],
    },
    {
      name: "Services",
      dropdown: [
        { name: "Stuffing Unloading", link: "/stuffingUnloading" },
        { name: "LCL - Less Than Container Loaded", link: "/lcl" },
        { name: "FCL- Full Container Loaded", link: "/fcl" },
        { name: "Custom Clearance", link: "/customClearance" },
        { name: "DGR-per-Dangerous perishable Products", link: "/dgr" },
        { name: "Inspection", link: "/inspection" },
        { name: "Packaging", link: "/packaging" },
        { name: "Storage", link: "/storage" },
        { name: "Commercial and logical consultancy", link: "/commercial" },
        { name: "International Cargo Insurance", link: "/insurance" },
      ],
    },
    {
      name: "Tools",
      dropdown: [
        { name: "Incoterms", link: "/incoterms" },
        { name: "Container", link: "/container" },
      ],
    },
    {
      name: "Contact Us",
      isExternal: true, // Mark this dropdown for external links
      dropdown: [
        { name: "Customer Care", link: `mailto:${content.email_customer_care}` },
        { name: "Sales Team", link: `mailto:${content.email_sales}` },
        { name: "Business Enquiries", link: `mailto:${content.email_business}` },
      ],
    },
    { name: "Offers", link: "/offers" },
  ];

  // <<< 3. Memoize styles to make them conditional based on `isHomePage`
  const customSelectStyles = useMemo(() => ({
    control: (base) => ({
      ...base,
      background: 'transparent',
      border: isHomePage ? '2px solid rgba(255, 255, 255, 0.4)' : '2px solid #e5e7eb', // gray-200
      borderRadius: '9999px',
      boxShadow: 'none',
      cursor: 'pointer',
      width: '140px',
      minHeight: '40px',
      height: '40px',
      transition: 'border-color 0.3s ease',
    }),
    valueContainer: (base) => ({ ...base, padding: '0 8px', height: '36px' }),
    input: (base) => ({ ...base, margin: '0', padding: '0' }),
    singleValue: (base) => ({
      ...base,
      color: isHomePage ? 'white' : '#1f2937', // gray-800
      margin: '0',
      transition: 'color 0.3s ease',
    }),
    indicatorSeparator: () => ({ display: 'none' }),
    dropdownIndicator: (base) => ({
      ...base,
      color: isHomePage ? 'rgba(255, 255, 255, 0.7)' : '#6b7280',
      padding: '6px',
      transition: 'color 0.3s ease',
    }),
    menu: (base) => ({
      ...base,
      borderRadius: '1rem',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      overflow: 'hidden',
      zIndex: 50,
    }),
    option: (base, state) => ({
      ...base,
      background: state.isFocused ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
      color: '#333',
      cursor: 'pointer',
    }),
  }), [isHomePage]);

  const formatOptionLabel = ({ label, flag }) => (
    <div style={{ display: "flex", alignItems: "center" }}>
      <span style={{ marginBottom: "4px",marginRight: "10px", fontSize: "1.2em" }}>{flag}</span>
      <span className="font-semibold">{label}</span>
    </div>
  );
  const logoVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.4 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };
  const handleMobileDropdownToggle = (index) => setOpenMobileDropdown(openMobileDropdown === index ? null : index);

  return (
    // <<< 4. Apply conditional classes to the main header element
    <header
      className={`w-full z-30 p-4 font-sans transition-all duration-500 ease-in-out ${
        isHomePage ? 'absolute top-0 left-0' : 'relative bg-white shadow-md'
      }`}
    >
      <div className="container mx-auto flex justify-between items-center">
        {/* --- LOGO --- */}
        <div className="flex-shrink-0">
          <Link to="/">
            {/* AnimatePresence handles the smooth transition between the two logos */}
            <AnimatePresence mode="wait">
              {isHomePage ? (
                // <<< Render IMAGE LOGO on the homepage
                <motion.img
                  key="image-logo" // A unique key is crucial for AnimatePresence
                  variants={logoVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  src={g121}
                  alt="GVS Logo"
                  className="h-20 w-auto"
                />
              ) : (
                // <<< THIS IS THE CORRECTED BLOCK >>>
                // It's now an `img` tag with an `src` attribute
                <motion.img
                  key="image-logo-other" // A different unique key
                  variants={logoVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  src={GVS} // <<< Use your second, imported logo here
                  alt="GVS Logo"
                  className="h-20 w-auto" // <<< Use the SAME class to prevent layout shifts
                />
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* --- DESKTOP NAVIGATION --- */}
        <nav ref={navRef} className="hidden lg:flex flex-grow justify-center">
          <div className="flex items-center gap-3">
            {navItems.map((item) => (
              <div
                key={item.name}
                className="relative py-2"
                onMouseEnter={() => item.dropdown && handleDropdownHover(item.name)}
                onMouseLeave={() => item.dropdown && handleDropdownLeave()}
              >
                <Link
                  to={item.link || '#'}
                  // <<< 5. Apply conditional text, border, and hover styles to nav links
                  className={`px-5 py-2 font-bold whitespace-nowrap text-sm rounded-full border-2 transition-colors duration-300 flex items-center gap-1.5 ${
                    isHomePage
                      ? 'text-white border-white/40 hover:bg-white/20'
                      : 'text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {item.name}
                  {item.dropdown && <FaChevronDown size={12} />}
                </Link>
                {dropdown === item.name && item.dropdown && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2">
                    <div className="bg-white rounded-lg shadow-xl p-2 z-50 min-w-max">
                      {item.dropdown.map((subItem) => (
                        <DropdownItem key={subItem.name} to={subItem.link} isExternal={item.isExternal}>
                          {subItem.name}
                        </DropdownItem>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* --- ACTIONS & MOBILE TOGGLE --- */}
        <div className="flex-shrink-0 flex items-center justify-end">
          <div className="hidden lg:flex items-center gap-4">
            <Select
              value={selectedRegionObject}
              onChange={handleRegionChange}
              options={regionOptions}
              formatOptionLabel={formatOptionLabel}
              styles={customSelectStyles}
            />
            {/* <<< 6. Conditional styling for the "Request a Quote" button for better contrast */}
            <Link
              to="/ContactUs"
              className={`px-6 py-2.5 font-semibold text-sm rounded-full shadow-lg transition-all duration-300 ${
                isHomePage
                  ? 'bg-white text-gray-800 hover:bg-gray-200'
                  : 'bg-blue-600 text-white hover:bg-blue-700' // Example: A vibrant color for other pages
              }`}
            >
              Request a Quote
            </Link>
          </div>
          
          <div className="lg:hidden">
            {/* <<< 7. Conditional color for the mobile menu icon */}
            <button onClick={() => setIsOpen(!isOpen)} className={`p-2 ${isHomePage ? 'text-white' : 'text-gray-800'}`}>
              <FaBars size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* --- MOBILE MENU OVERLAY (no changes needed here as it's always dark) --- */}
      <div className={`fixed inset-0 bg-black bg-opacity-80 backdrop-blur-lg z-50 transform ${isOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out lg:hidden`}>
        {/* ... Mobile menu content remains the same */}
        <div className="flex justify-end p-4">
            <button onClick={() => setIsOpen(false)} className="text-white">
                <FaTimes size={28} />
            </button>
        </div>
        <nav className="flex flex-col items-center mt-8">
          {navItems.map((item, index) => (
            <div key={item.name} className="w-full text-center border-b border-gray-700">
              {item.dropdown ? (
                <button onClick={() => handleMobileDropdownToggle(index)} className="w-full py-4 text-white text-lg flex justify-center items-center gap-2">
                  {item.name}
                  <FaChevronDown className={`transition-transform duration-300 ${openMobileDropdown === index ? 'rotate-180' : ''}`} size={14} />
                </button>
              ) : (
                <Link to={item.link} className="block w-full py-4 text-white text-lg">
                  {item.name}
                </Link>
              )}
              {item.dropdown && openMobileDropdown === index && (
                <div className="bg-white/10 pb-2">
                  {item.dropdown.map((subItem) => (
                    // Using Link for internal and regular <a> for external in mobile menu too
                    item.isExternal ? (
                      <a key={subItem.name} href={subItem.link} className="block py-3 text-white/80 hover:text-white">
                        {subItem.name}
                      </a>
                    ) : (
                      <Link key={subItem.name} to={subItem.link} className="block py-3 text-white/80 hover:text-white">
                        {subItem.name}
                      </Link>
                    )
                  ))}
                </div>
              )}
            </div>
          ))}
          <Link to="/ContactUs" className="mt-8 px-8 py-3 bg-white text-gray-800 font-semibold rounded-full">
            Request a Quote
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;