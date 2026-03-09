import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/apiConfig';

const AdminDashboard = () => {
    const [regions, setRegions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

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

    useEffect(() => {
        fetchRegions();
    }, []);

const handleDeleteRegion = async (regionCode, regionName) => {
    // The confirmation dialog is good, no changes here.
    if (!window.confirm(`Are you sure you want to delete "${regionName}"? This action cannot be undone.`)) {
        return;
    }

    try {
        // --- THIS IS THE FIX ---

        // 1. Get the raw token from localStorage.
        const token = localStorage.getItem('adminToken');

        // 2. Create the correctly formatted Authorization header string.
        const authHeader = token ? `Bearer ${token}` : '';

        // 3. Define the URL.
        const url = `${API_BASE_URL}/regions/${regionCode}`;

        // 4. Make the fetch call with the correct header.
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                // We don't need Content-Type for a DELETE request with no body.
                // The Authorization header is the important one.
                'Authorization': authHeader 
            },
        });

        // --- END OF FIX ---

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to delete region.');
        }
        
        // This part is correct, it updates the UI after a successful delete.
        setRegions(prevRegions => prevRegions.filter(region => region.code !== regionCode));

    } catch (error) {
        console.error('Deletion failed:', error);
        alert(`Error: ${error.message}`);
    }
};

    return (
        <>
            <div className="min-h-screen bg-[#F0F4F8] text-[#243670] p-8 sm:p-12 relative overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-50" style={{
                    backgroundImage: 'radial-gradient(#243670 0.5px, transparent 0.5px), radial-gradient(#243670 0.5px, #F0F4F8 0.5px)',
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 10px 10px'
                }}></div>

                <div className="relative z-10 max-w-7xl mx-auto">
                    <header className="mb-16">
                        <h1 className="text-5xl font-light text-[#243670] tracking-widest uppercase">Dashboard</h1>
                        <p className="text-gray-500 mt-2">Holographic Content Management Interface v2.1</p>
                    </header>

                    {isLoading ? (
                        <div className="text-center py-10">
                            <p className="text-lg text-gray-500">Loading data nodes...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {regions.map(region => (
                                <Link
                                    key={region.code}
                                    to={`/admin/edit/${region.code}`}
                                    className="group relative block p-6 bg-white/60 backdrop-blur-xl border border-slate-300 rounded-xl shadow-lg shadow-blue-900/5 hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-500/20 transform hover:-translate-y-2 transition-all duration-300 ease-in-out"
                                >
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleDeleteRegion(region.code, region.name);
                                        }}
                                        className="absolute top-3 right-3 z-10 p-1 rounded-full bg-red-100 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-600 hover:text-white transition-all duration-200"
                                        aria-label={`Delete ${region.name}`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                    
                                    <div>
                                        <h2 className="text-2xl font-bold text-[#243670] truncate">
                                            <span className="text-3xl mr-3">{region.country_flag}</span>
                                            {region.name}
                                        </h2>
                                        <p className="text-gray-400 group-hover:text-amber-600 mt-2 font-mono text-sm transition-colors duration-300">
                                            code: {region.code}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                            
                            <Link 
                                to="/admin/add-region"
                                className="group p-6 flex items-center justify-center bg-transparent border-2 border-dashed border-slate-400/70 rounded-xl hover:border-amber-500 hover:bg-white/40 cursor-pointer transform hover:-translate-y-2 backdrop-blur-sm transition-all duration-300 ease-in-out"
                            >
                                <span className="text-lg font-semibold text-slate-500 group-hover:text-amber-500 transition-colors duration-300">
                                    + Add New Region
                                </span>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default AdminDashboard;