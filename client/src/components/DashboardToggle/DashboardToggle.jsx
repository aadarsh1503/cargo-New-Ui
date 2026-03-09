import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLayout, FiFileText, FiImage, FiSettings, FiUsers, FiKey } from 'react-icons/fi';

/**
 * A futuristic, reusable navigation toggle for the admin panel.
 * It navigates between dashboard, data management, gallery, settings, employment, and AWS settings.
 *
 * @param {object} props
 * @param {'dashboard' | 'excel' | 'gallery' | 'settings' | 'employment' | 'aws'} props.activeView - The currently active view.
 */
const DashboardToggle = ({ activeView }) => {
    const navigate = useNavigate();

    const handleNavigate = (view) => {
        if (view === activeView) return;

        const routes = {
            dashboard: '/admin/dashboard',
            excel: '/admin/excel-management',
            gallery: '/admin/gallery',
            settings: '/admin/settings',
            employment: '/admin/employment',
            aws: '/admin/aws-settings'
        };

        navigate(routes[view]);
    };

    // Calculate slider position based on active view
    const getSliderPosition = () => {
        const positions = {
            dashboard: '0.375rem',
            excel: 'calc(16.666% + 0.1875rem)',
            gallery: 'calc(33.333% + 0rem)',
            settings: 'calc(50% - 0.1875rem)',
            employment: 'calc(66.666% - 0.375rem)',
            aws: 'calc(83.333% - 0.5625rem)'
        };
        return positions[activeView] || '0.375rem';
    };

    const buttonBaseStyles = "relative z-10 flex w-1/6 items-center justify-center gap-2 rounded-full py-2.5 text-sm font-bold transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500";

    return (
        <div className="relative flex w-[960px] items-center rounded-full bg-slate-200/70 p-1.5 backdrop-blur-sm border border-slate-300/50 shadow-inner shadow-slate-900/10">
            {/* The Sliding, Glowing Indicator */}
            <span
                className="absolute top-1.5 h-[calc(100%-0.75rem)] w-[calc(16.666%-0.375rem)] rounded-full 
                           bg-gradient-to-br from-amber-400 to-amber-500 
                           shadow-lg shadow-amber-500/30
                           transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ left: getSliderPosition() }}
                aria-hidden="true"
            />

            {/* Dashboard Button */}
            <button
                onClick={() => handleNavigate('dashboard')}
                className={`${buttonBaseStyles} ${
                    activeView === 'dashboard'
                        ? 'text-white'
                        : 'text-[#243670] opacity-70 hover:opacity-100'
                }`}
                aria-current={activeView === 'dashboard'}
            >
                <FiLayout size={16} />
                Dashboard
            </button>

            {/* Excel Management Button */}
            <button
                onClick={() => handleNavigate('excel')}
                className={`${buttonBaseStyles} ${
                    activeView === 'excel'
                        ? 'text-white'
                        : 'text-[#243670] opacity-70 hover:opacity-100'
                }`}
                aria-current={activeView === 'excel'}
            >
                <FiFileText size={16} />
                Data
            </button>

            {/* Gallery Button */}
            <button
                onClick={() => handleNavigate('gallery')}
                className={`${buttonBaseStyles} ${
                    activeView === 'gallery'
                        ? 'text-white'
                        : 'text-[#243670] opacity-70 hover:opacity-100'
                }`}
                aria-current={activeView === 'gallery'}
            >
                <FiImage size={16} />
                Gallery
            </button>

            {/* Settings Button */}
            <button
                onClick={() => handleNavigate('settings')}
                className={`${buttonBaseStyles} ${
                    activeView === 'settings'
                        ? 'text-white'
                        : 'text-[#243670] opacity-70 hover:opacity-100'
                }`}
                aria-current={activeView === 'settings'}
            >
                <FiSettings size={16} />
                Settings
            </button>

            {/* Employment Button */}
            <button
                onClick={() => handleNavigate('employment')}
                className={`${buttonBaseStyles} ${
                    activeView === 'employment'
                        ? 'text-white'
                        : 'text-[#243670] opacity-70 hover:opacity-100'
                }`}
                aria-current={activeView === 'employment'}
            >
                <FiUsers size={16} />
                Jobs
            </button>

            {/* AWS Settings Button */}
            <button
                onClick={() => handleNavigate('aws')}
                className={`${buttonBaseStyles} ${
                    activeView === 'aws'
                        ? 'text-white'
                        : 'text-[#243670] opacity-70 hover:opacity-100'
                }`}
                aria-current={activeView === 'aws'}
            >
                <FiKey size={16} />
                AWS
            </button>
        </div>
    );
};

export default DashboardToggle;