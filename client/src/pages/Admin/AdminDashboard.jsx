import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../config/apiConfig';

const AdminDashboard = () => {
    const [regions, setRegions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchRegions = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/regions`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setRegions(data);
        } catch (error) {
            console.error('Failed to fetch regions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchRegions(); }, []);

    const handleDeleteRegion = async (regionCode, regionName) => {
        if (!window.confirm(`Are you sure you want to delete "${regionName}"? This action cannot be undone.`)) return;
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_BASE_URL}/regions/${regionCode}`, {
                method: 'DELETE',
                headers: { 'Authorization': token ? `Bearer ${token}` : '' },
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to delete region.');
            }
            setRegions(prev => prev.filter(r => r.code !== regionCode));
        } catch (error) {
            console.error('Deletion failed:', error);
            alert(`Error: ${error.message}`);
        }
    };

    return (
        <div className="min-h-screen bg-[#F0F4F8] text-[#243670] p-4 relative overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-30" style={{
                backgroundImage: 'radial-gradient(#243670 0.5px, transparent 0.5px), radial-gradient(#243670 0.5px, #F0F4F8 0.5px)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 10px 10px'
            }} />

            <div className="relative z-10 max-w-7xl mx-auto">
                <header className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-[#243670] tracking-widest uppercase">Dashboard</h1>
                        <p className="text-gray-400 text-xs mt-0.5">Content Management Interface</p>
                    </div>
                    <span className="text-xs text-gray-400">{regions.length} region{regions.length !== 1 ? 's' : ''}</span>
                </header>

                {isLoading ? (
                    <p className="text-sm text-gray-400 py-6 text-center">Loading regions...</p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                        {regions.map(region => (
                            <Link
                                key={region.code}
                                to={`/admin/edit/${region.code}`}
                                className="group relative block p-3 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-lg shadow-sm hover:border-amber-400 hover:shadow-md transition-all duration-200"
                            >
                                <button
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteRegion(region.code, region.name); }}
                                    className="absolute top-2 right-2 z-10 p-0.5 rounded-full bg-red-100 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-600 hover:text-white transition-all duration-150"
                                    aria-label={`Delete ${region.name}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                                <div className="text-xl mb-1">{region.country_flag}</div>
                                <h2 className="text-xs font-bold text-[#243670] truncate">{region.name}</h2>
                                <p className="text-gray-400 font-mono text-[10px] mt-0.5 group-hover:text-amber-600 transition-colors">{region.code}</p>
                            </Link>
                        ))}
                        <Link
                            to="/admin/add-region"
                            className="group p-3 flex items-center justify-center bg-transparent border-2 border-dashed border-slate-300 rounded-lg hover:border-amber-500 hover:bg-white/40 transition-all duration-200 min-h-[72px]"
                        >
                            <span className="text-xs font-semibold text-slate-400 group-hover:text-amber-500 transition-colors">+ Add Region</span>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
