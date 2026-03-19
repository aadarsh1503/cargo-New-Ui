import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import useFreightCounts from '../../../hooks/useFreightCounts';

const TABS = [
  { key: 'inquiry', label: 'Inquiry', path: '/admin/freight/inquiry', countKey: 'inquiry' },
  { key: 'leads', label: 'Leads', path: '/admin/freight/leads', countKey: 'leads' },
  { key: 'bookings', label: 'Bookings', path: '/admin/freight/bookings', countKey: 'bookings' },
  { key: 'ocean', label: 'Ocean Freight', path: '/admin/freight/ocean' },
  { key: 'agents', label: 'Agents', path: '/admin/freight/agents' },
  { key: 'settings', label: 'Settings', path: '/admin/freight/settings' },
];

const FreightAdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { badges, markSeen } = useFreightCounts();

  const activeTab = TABS.find(t => location.pathname.startsWith(t.path))?.key || 'inquiry';

  useEffect(() => {
    const tab = TABS.find(t => t.key === activeTab);
    if (tab?.countKey) markSeen(tab.countKey);
  }, [activeTab, markSeen]);

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-100 px-8 py-3 flex items-center sticky top-0 bg-white z-40">
        <div className="flex items-center gap-2">
          {TABS.map(tab => {
            const badgeCount = tab.countKey ? badges[tab.countKey] : 0;
            return (
              <button
                key={tab.key}
                onClick={() => navigate(tab.path)}
                className={`relative px-5 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  activeTab === tab.key
                    ? 'bg-[#243670] text-white'
                    : 'text-[#243670] hover:bg-blue-50 border border-transparent hover:border-blue-200'
                }`}
              >
                {tab.label}
                {badgeCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FDBE10] text-[#243670] text-[10px] font-bold flex items-center justify-center leading-none shadow">
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <Outlet />
    </div>
  );
};

export default FreightAdminLayout;
