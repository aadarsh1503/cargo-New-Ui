import React, { useState, useEffect } from 'react';
// <<< STEP 1: Import useLocation from react-router-dom >>>
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// ========= YOUR EXISTING COMPONENT IMPORTS =========
import GlobalLoader from "./components/GlobalLoader/GlobalLoader";
import Navbar from "./components/Navbar/Navbar";
import ChatWidget from "./components/ChatWidget/ChatWidget";
import Footer from "./components/Footer/Footer";
import Home from "./components/Home/Home";
import AboutSection from "./components/WhoWeAre/WhoWeAre";
import WhereBrazil from "./components/WhereBrazil/WhereBrazil";
import OperateWorld from "./components/OperateWorld/OperateWorld";
import MissionVissionAndValues from "./components/MissionVissionAndValues/MissionVissionAndValues";
import AirFreightSection from "./components/AirFreightSection/AirFreightSection";
import SeaFreight from "./components/SeaFrieght/SeaFrieght";
import RoadFreight from "./components/RoadFreight/RoadFreight";
import StuffingUnloading from "./components/StuffingUnloading/StuffingUnloading";
import LCL from "./components/LCL/LCL";
import FCL from "./components/FCL/FCL";
import CustomClearance from "./components/CustomClearance/CustomClearance";
import DGR from "./components/DGR/DGR";
import Inspection from "./components/Inspection/Inspection";
import Packaging from "./components/Packaging/Packaging";
import Storages from "./components/Storages/Storages";
import Commercial from "./components/Commercial/Commercial";
import Insurance from "./components/Insurance/Insurance";
import Containers from "./components/Container/Container";
import Incoterms from "./components/Incoterms/Incoterms";
import ContactUs from "./components/ContactUs/ContactUs";
import Offers from "./components/Offers/Offers";
import Testimonials from "./components/Testimonials/Testimonials";
import RegionTransitionOverlay from './components/RegionTransitionOverlay/RegionTransitionOverlay';


import AdminLogin from './pages/Admin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard';
import RegionEditForm from './pages/Admin/RegionEditForm';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AdminSignUp from './pages/Admin/AdminSignUp';
import CreateRegionPage from './pages/Admin/CreateRegionPage';
import ExcelUploadPanel from './components/ExcelUploadPanel/ExcelUploadPanel';
import { RegionProvider, useRegion } from "./context/RegionContext";
import { Toaster } from 'react-hot-toast';
import useLenis from './hooks/useLenis';
import MobileNavbar from './components/Navbar/MobileNavbar';

// The API URL, make sure this is correct
const API_URL = 'https://gvs-cargo-dynamic.onrender.com/api';

const MainLayout = () => {
  const { isInitializing, isChangingRegion, region, availableRegions } = useRegion();
  const [regionContent, setRegionContent] = useState(null);
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // <<< STEP 2: Get the current location inside the component >>>
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  // <<< STEP 3: Determine the class to apply based on the path >>>
  // Your navbar is about 96px tall. pt-28 (7rem/112px) gives enough space. Adjust if needed.
  const mainContentClass = isHomePage ? '' : 'pt-28';


  useEffect(() => {
    if (!region) return;
    const fetchRegionContent = async () => {
      try {
        const response = await fetch(`${API_URL}/content/${region}`);
        if (!response.ok) {
          throw new Error('Failed to fetch region content');
        }
        const data = await response.json();
        setRegionContent(data);
      } catch (error) {
        console.error("Error fetching content for region:", region, error);
        setRegionContent(null); 
      }
    };
    fetchRegionContent();
  }, [region]); 

  if (isInitializing) {
    return <GlobalLoader />;
  }

  const currentRegionData = availableRegions.find(r => r.code === region);
  const regionName = currentRegionData ? currentRegionData.name : 'Loading...';
  const regionFlag = currentRegionData ? currentRegionData.country_flag : '🌍';
  const regionCoords = currentRegionData?.coords || { x: 0.5, y: 0.5 };

  return (
    <>
      <RegionTransitionOverlay
        isVisible={isChangingRegion}
        regionName={regionName}
        regionFlag={regionFlag}
        regionCoords={regionCoords}
      />

      <Navbar />
      <MobileNavbar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
      <ChatWidget 
        salesNumber={regionContent?.whatsapp_sales}
        supportNumber={regionContent?.whatsapp_support}
      />
      
      {/* <<< STEP 4: Apply the conditional class to the <main> element >>> */}
      <main className={mainContentClass}>
        {/* The nested Routes will render inside this main tag */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/whoWeAre" element={<AboutSection />} />
          <Route path="/whereServe" element={<WhereBrazil />} />
          <Route path="/OperateWorld" element={<OperateWorld />} />
          <Route path="/missionvisionandvalues" element={<MissionVissionAndValues />} />
          <Route path="/airFreight" element={<AirFreightSection />} />
          <Route path="/seaFreight" element={<SeaFreight />} />
          <Route path="/roadFreight" element={<RoadFreight />} />
          <Route path="/stuffingUnloading" element={<StuffingUnloading />} />
          <Route path ="/lcl" element={<LCL/>}/>
          <Route path ="/fcl" element={<FCL/>}/>
          <Route path="/customClearance" element={<CustomClearance />} />
          <Route path="/dgr" element={<DGR />} />
          <Route path="/inspection" element={<Inspection />} />
          <Route path="/packaging" element={<Packaging />} />
          <Route path="/storage" element={<Storages />} />
          <Route path="/commercial" element={<Commercial />} />
          <Route path="/insurance" element={<Insurance />} />
          <Route path="/container" element={<Containers />} />
          <Route path="/incoTerms" element={<Incoterms />} />
          <Route path="/contactUs" element={<ContactUs />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="*" element={<div><h2>404 Page Not Found</h2></div>} />
        </Routes>
      </main>
      <Footer />
    </>
  );
};

function App() {

  return (
    <Router>
      <Toaster 
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 5000,
        }}
      />
      <RegionProvider>
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/create-super-user-access-a9b3c7d1" element={<AdminSignUp />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/add-region" element={<CreateRegionPage />} />
            <Route path="/admin/edit/:regionCode" element={<RegionEditForm />} />
            <Route path="/admin/excel-management" element={<ExcelUploadPanel />} />
          </Route>

          {/* Public-Facing Site Routes */}
          {/* This part remains exactly the same */}
          <Route path="/*" element={<MainLayout />} /> 
        </Routes>
      </RegionProvider>
    </Router>
  );
}

export default App;