import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import DashboardToggle from '../components/DashboardToggle/DashboardToggle';
import { FiLogOut } from 'react-icons/fi';

// Logout Confirmation Modal
const LogoutConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="mx-auto mb-6 w-20 h-20 flex items-center justify-center rounded-full bg-amber-100">
            <FiLogOut size={40} className="text-amber-500" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Confirm Logout
          </h2>
          
          <p className="text-gray-600 mb-8">
            Are you sure you want to log out? You'll need to sign in again to access the admin panel.
          </p>
          
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-2.5 font-bold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-6 py-2.5 font-bold text-white bg-amber-500 rounded-lg shadow-lg shadow-amber-500/30 hover:bg-amber-600 hover:scale-105 transform transition-all duration-200"
            >
              Confirm Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Determine active view based on current path
  const getActiveView = () => {
    const path = location.pathname;
    if (path.includes('/admin/dashboard')) return 'dashboard';
    if (path.includes('/admin/excel-management')) return 'excel';
    if (path.includes('/admin/gallery')) return 'gallery';
    if (path.includes('/admin/settings')) return 'settings';
    if (path.includes('/admin/employment')) return 'employment';
    if (path.includes('/admin/aws-settings')) return 'aws';
    return 'dashboard';
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem('adminToken');
    setIsLogoutModalOpen(false);
    navigate('/admin/login');
  };

  return (
    <>
      <LogoutConfirmationModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Admin Header with Dashboard Toggle */}
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-center">
                <DashboardToggle activeView={getActiveView()} />
              </div>
              
              {/* Logout Button */}
              <button
                onClick={() => setIsLogoutModalOpen(true)}
                className="flex items-center gap-2 font-semibold text-amber-600 border-2 border-amber-500/50 px-5 py-2 rounded-lg hover:bg-amber-500 hover:text-white hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-300"
              >
                <FiLogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="mx-auto">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default AdminLayout;
