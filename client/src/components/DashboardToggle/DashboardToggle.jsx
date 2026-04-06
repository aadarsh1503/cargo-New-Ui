import { useNavigate } from 'react-router-dom';
import { FiLayout, FiFileText, FiImage, FiSettings, FiUsers, FiTruck } from 'react-icons/fi';

/**
 * A futuristic, reusable navigation toggle for the admin panel.
 *
 * @param {object} props
 * @param {'dashboard' | 'excel' | 'gallery' | 'settings' | 'employment' | 'aws' | 'leads' | 'bookings' | 'agents'} props.activeView
 * @param {number} [props.freightBadge] - total unread count for freight tab
 */
const DashboardToggle = ({ activeView, freightBadge = 0 }) => {
    const navigate = useNavigate();

    const handleNavigate = (view) => {
        if (view === activeView) return;

        const routes = {
            dashboard: '/admin/dashboard',
            excel: '/admin/excel-management',
            gallery: '/admin/gallery',
            settings: '/admin/settings',
            employment: '/admin/employment',
            freight: '/admin/freight/inquiry',
        };

        navigate(routes[view]);
    };

    const tabs = [
        { key: 'dashboard', label: 'Branch Settings', icon: <FiLayout size={14} /> },
        { key: 'freight', label: 'Freight Services', icon: <FiTruck size={14} /> },
        { key: 'excel', label: 'Offers', icon: <FiFileText size={14} /> },
        { key: 'gallery', label: 'Gallery', icon: <FiImage size={14} /> },
        { key: 'settings', label: 'Settings', icon: <FiSettings size={14} /> },
        { key: 'employment', label: 'Jobs', icon: <FiUsers size={14} /> },
    ];

    return (
    <div className="relative flex items-center rounded-full bg-slate-200/70 p-1.5 gap-1 backdrop-blur-sm border border-slate-300/50 shadow-inner shadow-slate-900/10">
            {tabs.map(tab => (
                <button
                    key={tab.key}
                    onClick={() => handleNavigate(tab.key)}
                    className={`relative z-10 flex items-center justify-center gap-1.5 rounded-full py-2 px-2.5 md:px-4 text-xs font-bold transition-all duration-300 whitespace-nowrap focus:outline-none ${
                        activeView === tab.key
                            ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-lg shadow-amber-500/30'
                            : 'text-[#243670] opacity-70 hover:opacity-100 hover:bg-white/40'
                    }`}
                    aria-current={activeView === tab.key}
                    title={tab.label}
                >
                    {tab.icon}
                    <span className="hidden md:inline">{tab.label}</span>
                    {tab.key === 'freight' && freightBadge > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-0.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center leading-none shadow">
                            {freightBadge > 99 ? '99+' : freightBadge}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
};

export default DashboardToggle;