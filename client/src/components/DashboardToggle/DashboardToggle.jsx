import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLayout, FiFileText } from 'react-icons/fi';

/**
 * A futuristic, reusable navigation toggle for the admin panel.
 * It navigates between the main dashboard and the data management view.
 *
 * @param {object} props
 * @param {'dashboard' | 'excel'} props.activeView - The currently active view. This determines the slider position and active styles.
 */
const DashboardToggle = ({ activeView }) => {
    const navigate = useNavigate();

    const handleNavigate = (view) => {
        if (view === activeView) return; // Prevent re-navigating to the same page

        if (view === 'dashboard') {
            navigate('/admin/dashboard');
        } else if (view === 'excel') {
            navigate('/admin/excel-management');
        }
    };

    // This determines the position of the sliding, glowing indicator.
    const sliderPosition = activeView === 'excel' ? 'translate-x-full' : 'translate-x-0';

    const buttonBaseStyles = "relative z-10 flex w-1/2 items-center justify-center gap-2 rounded-full py-2.5 text-sm font-bold transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500";

    return (
        <div className="relative flex w-80 items-center rounded-full bg-slate-200/70 p-1.5 backdrop-blur-sm border border-slate-300/50 shadow-inner shadow-slate-900/10">
            {/* The Sliding, Glowing Indicator */}
            <span
                className={`absolute top-1.5 left-1.5 h-[calc(100%-0.75rem)] w-[calc(50%-0.375rem)] rounded-full 
                           bg-gradient-to-br from-amber-400 to-amber-500 
                           shadow-lg shadow-amber-500/30
                           transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
                           ${sliderPosition}`}
                aria-hidden="true"
            />

            {/* Dashboard Button */}
            <button
                onClick={() => handleNavigate('dashboard')}
                className={`${buttonBaseStyles} ${
                    activeView === 'dashboard'
                        ? 'text-white' // Active text color
                        : 'text-[#243670] opacity-70 hover:opacity-100' // Inactive text
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
                        ? 'text-white' // Active text color
                        : 'text-[#243670] opacity-70 hover:opacity-100' // Inactive text
                }`}
                aria-current={activeView === 'excel'}
            >
                <FiFileText size={16} />
                Data Manager
            </button>
        </div>
    );
};

export default DashboardToggle;