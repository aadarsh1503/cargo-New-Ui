import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useLocation } from "react-router-dom"; // useLocation is key
import { FaChevronDown, FaBars, FaTimes } from "react-icons/fa";
import Select from "react-select";
import { AnimatePresence,motion } from "framer-motion";
import { useRegion } from "../../context/RegionContext";
import FuturisticLoader from "./Loader";
import g121 from "./g121.png";
import GVS from "./GVS.png";
import MobileNavbar from "./MobileNavbar";


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
  const location = useLocation(); 
  const [dropdown, setDropdown] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [openMobileDropdown, setOpenMobileDropdown] = useState(null);
  const navRef = useRef(null);
  
  const isHomePage = location.pathname === '/';

  // <<< FIX 1: Add state to track if user has scrolled from the top >>>
  const [isScrolled, setIsScrolled] = useState(false);
  
  // <<< FIX 2: Refined state for controlling navbar visibility on scroll >>>
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const lastScrollY = useRef(0); // Use useRef to avoid re-renders on scroll position change

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
  
  // <<< FIX 3: Improved scroll handler effect >>>
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Logic for showing/hiding the navbar
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsNavbarVisible(false); // Scrolling down
      } else {
        setIsNavbarVisible(true); // Scrolling up
      }
      lastScrollY.current = currentScrollY;

      // Logic for changing navbar style from transparent to solid
      if (currentScrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []); // Empty dependency array means this runs only once on mount

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
      isExternal: true,
      dropdown: [
        { name: "Customer Care", link: `mailto:${content.email_customer_care}` },
        { name: "Sales Team", link: `mailto:${content.email_sales}` },
        { name: "Business Enquiries", link: `mailto:${content.email_business}` },
      ],
    },
    { name: "Offers", link: "/offers" },
  ];

  // <<< FIX 4: Determine navbar style based on page and scroll position >>>
  // True if we are on the homepage AND at the very top
  const isTransparent = isHomePage && !isScrolled;

  const customSelectStyles = useMemo(() => ({
    control: (base) => ({
      ...base,
      background: 'transparent',
      border: isTransparent ? '2px solid rgba(255, 255, 255, 0.4)' : '2px solid #e5e7eb',
      borderRadius: '9999px',
      boxShadow: 'none',
      cursor: 'pointer',
      width: '140px',
      minHeight: '40px',
      height: '40px',
      transition: 'border-color 0.3s ease',
    }),
    singleValue: (base) => ({
      ...base,
      color: isTransparent ? 'white' : '#1f2937', 
      transition: 'color 0.3s ease',
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: isTransparent ? 'rgba(255, 255, 255, 0.7)' : '#6b7280',
      transition: 'color 0.3s ease',
    }),
    // The rest of the styles are fine as they were
    valueContainer: (base) => ({ ...base, padding: '0 8px', height: '36px' }),
    input: (base) => ({ ...base, margin: '0', padding: '0' }),
    indicatorSeparator: () => ({ display: 'none' }),
    menu: (base) => ({ ...base, borderRadius: '1rem', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', overflow: 'hidden', zIndex: 50, }),
    option: (base, state) => ({ ...base, background: state.isFocused ? 'rgba(0, 0, 0, 0.05)' : 'transparent', color: '#333', cursor: 'pointer', }),
  }), [isTransparent]);

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
    // <<< FIX 5: THIS IS THE CRITICAL CHANGE. Using `fixed` positioning and dynamic background. >>>
    <header
      className={`fixed top-0 left-0 w-full z-30 p-4 font-sans transition-all duration-500 ease-in-out ${
        isTransparent ? 'bg-transparent' : 'bg-white shadow-md'
      } ${
        isNavbarVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex-shrink-0">
          <Link to="/">
            <AnimatePresence mode="wait">
              {isTransparent ? (
                <motion.img
                  key="image-logo-transparent"
                  variants={logoVariants} initial="initial" animate="animate" exit="exit"
                  src={g121} alt="GVS Logo" className="h-20 w-auto"
                />
              ) : (
                <motion.img
                  key="image-logo-solid"
                  variants={logoVariants} initial="initial" animate="animate" exit="exit"
                  src={GVS} alt="GVS Logo" className="h-20 w-auto" 
                />
              )}
            </AnimatePresence>
          </Link>
        </div>

        <nav ref={navRef} className="hidden lg:flex flex-grow justify-center">
          <div className="flex items-center gap-3">
            {navItems.map((item) => (
              <div
                key={item.name} className="relative py-2"
                onMouseEnter={() => item.dropdown && handleDropdownHover(item.name)}
                onMouseLeave={() => item.dropdown && handleDropdownLeave()}
              >
                <Link to={item.link || '#'}
                  className={`px-3 py-2 font-bold whitespace-nowrap text-sm rounded-full border-2 transition-colors duration-300 flex items-center gap-1.5 ${
                    isTransparent
                      ? 'text-white border-white/40 hover:bg-white/20'
                      : 'text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {item.name}
                  {item.dropdown && <FaChevronDown size={12} />}
                </Link>
                {dropdown === item.name && item.dropdown && (
                  <div className="absolute font-noto-serif top-full left-1/2 -translate-x-1/2 pt-2">
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

        <div className="flex-shrink-0 flex items-center justify-end">
          <div className="hidden lg:flex items-center gap-4">
            <Select
              value={selectedRegionObject} onChange={handleRegionChange} options={regionOptions}
              formatOptionLabel={formatOptionLabel} styles={customSelectStyles}
            />
            <Link to="/ContactUs"
              className={`px-6 py-2.5 font-semibold text-sm rounded-full shadow-lg transition-all duration-300 ${
                isTransparent
                  ? 'bg-white text-gray-800 hover:bg-gray-200'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Request a Quote
            </Link>
          </div>
          
          <div className="lg:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className={`p-2 ${isTransparent ? 'text-white' : 'text-gray-800'}`}>
              <FaBars size={24} />
            </button>
          </div>
        </div>
      </div>

      <MobileNavbar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        navItems={navItems}
      />
    </header>
  );
};

export default Navbar;