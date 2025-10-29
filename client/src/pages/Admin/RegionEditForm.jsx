import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FaSave, FaArrowLeft, FaSpinner, FaCheckCircle, FaExclamationTriangle
} from 'react-icons/fa';

import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

import { API_BASE_URL } from '../../config/apiConfig';

const FuturisticLoader = ({ regionCode }) => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="relative">
            <div className="w-24 h-24 border-4 border-[#243670]/20 rounded-full"></div>
            <div className="w-24 h-24 border-t-4 border-b-4 border-[#F59E0B] rounded-full absolute top-0 animate-spin"></div>
        </div>
        <p className="mt-6 text-xl text-[#243670] tracking-widest font-light">LOADING {regionCode.toUpperCase()}...</p>
    </div>
);

const RegionEditForm = () => {
    const { regionCode } = useParams();
    const navigate = useNavigate();
    const [content, setContent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [regionName, setRegionName] = useState('');

    const fetchContent = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/content/${regionCode}`);
            if (!response.ok) throw new Error('Failed to fetch content');
            const data = await response.json();
            setRegionName(data.name);
            if (data.address && Array.isArray(data.address)) {
                data.address = data.address.join('\n');
            }
            setContent(data);
        } catch (error) {
            setMessage(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [regionCode]);

    useEffect(() => {
        fetchContent();
    }, [fetchContent]);

    const handleChange = (e) => {
        setContent({ ...content, [e.target.name]: e.target.value });
    };

    const handlePhoneChange = (value, name) => {
        setContent(prevContent => ({ ...prevContent, [name]: value }));
    };

// Replace the entire handleSubmit function in your RegionEditForm.jsx file with this.

const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    
    // 1. Get the raw token (e.g., "eyJ...") from localStorage.
    const token = localStorage.getItem('adminToken');
    
    // 2. Prepare the data for submission (your logic for this part is correct).
    const submissionData = { ...content };
    if (submissionData.address) {
        submissionData.address = submissionData.address.split('\n').filter(line => line.trim() !== '');
    }
    const fieldsToDelete = ['id', 'region_id', 'name', 'code', 'country_flag', 'updated_at', 'welcome_message', 'operate_heading', 'local_button_text', 'global_button_text', 'local_modal_title', 'local_modal_description', 'global_modal_title', 'global_modal_description', 'close_button_text', 'operate_in_country_title', 'operate_in_country_desc'];
    fieldsToDelete.forEach(field => delete submissionData[field]);

    try {
        // --- THIS IS THE FIX ---

        // 3. Define the URL for the API endpoint.
        const url = `${API_BASE_URL}/content/${regionCode}`;

        // 4. Create the correctly formatted Authorization header string.
        //    We add the "Bearer " prefix (with a space) to the raw token.
        const authHeader = token ? `Bearer ${token}` : '';

        // 5. Make the fetch call with the correct URL and the formatted header.
        const response = await fetch(url, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': authHeader // Use the new, correctly formatted header variable
            },
            body: JSON.stringify(submissionData),
        });
        
        // --- END OF FIX ---

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || 'Failed to update content');
        }

        const result = await response.json();
        setMessage(result.message);
        await fetchContent(); 
        setTimeout(() => setMessage(''), 4000);
        
    } catch (error) { 
        setMessage(`Error: ${error.message}`);
    } finally {
        setIsSaving(false);
    }
};
    
    const coreFields = ['address', 'phone', 'whatsapp', 'whatsapp_sales', 'whatsapp_support'];
    const optionalFields = [
        'email_customer_care', 'email_sales', 'email_business',
        'social_linkedin', 'social_instagram', 'social_facebook', 'social_twitter',
        'local_modal_map_src'
    ];
    
    const baseInputClass = "w-full bg-slate-50 border-2 border-transparent rounded-lg outline-none transition-all duration-300 placeholder-slate-400 text-[#243670] focus:bg-white focus:border-[#F59E0B] p-3";

    if (isLoading) return <FuturisticLoader regionCode={regionCode} />;
    if (!content) return (
        <div className="flex items-center justify-center h-screen bg-slate-50 text-[#243670]">
            <div className="text-center p-8 bg-white rounded-lg shadow-lg">
                <FaExclamationTriangle className="inline-block mr-4 text-red-500 h-8 w-8" />
                <h2 className="text-2xl font-bold">Data Stream Not Found</h2>
                <p className="text-slate-500 mt-2">Could not retrieve data for region code: {regionCode.toUpperCase()}</p>
            </div>
        </div>
    );
    
    const formatLabel = (key) => key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());

    return (
        <div className="min-h-screen bg-slate-100 p-4 sm:p-8 flex items-center justify-center">
            <div className="w-full max-w-4xl bg-white/70 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl shadow-blue-900/10">
                <form onSubmit={handleSubmit} className="p-8 sm:p-12 space-y-8">
                    <div className="text-center mb-8">
                        <h1 className="text-5xl font-bold text-[#243670]">Edit Region</h1>
                        <p className="text-slate-500 mt-2 text-lg">Modifying data stream for <span className="font-semibold text-[#243670]">{regionName}</span></p>
                    </div>

                    <div className="space-y-6">
                        <fieldset className="border border-slate-300 rounded-lg p-6">
                            <legend className="px-2 text-lg font-semibold text-[#243670]">Core Details</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {coreFields.map(key => (
                                    <div key={key} className={key === 'address' ? 'md:col-span-2' : ''}>
                                        <label className="block text-sm font-semibold text-gray-600 mb-2">{formatLabel(key)}</label>
                                        {key === 'address' ? (
                                            <textarea name="address" value={content.address || ''} onChange={handleChange} placeholder="Enter full address, one line per line" rows="4" className={baseInputClass} />
                                        ) : (
                                            <PhoneInput country={'us'} value={content[key] || ''} onChange={(value) => handlePhoneChange(value, key)} inputClass={baseInputClass} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </fieldset>

                        <fieldset className="border border-slate-300 rounded-lg p-6">
                            <legend className="px-2 text-lg font-semibold text-[#243670]">Optional Content</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {optionalFields.map(key => (
                                    <div key={key}>
                                        <label className="block text-sm font-semibold text-gray-600 mb-2">{formatLabel(key)}</label>
                                        <input
                                            type={key.startsWith('email_') ? 'email' : 'url'}
                                            name={key}
                                            value={content[key] || ''}
                                            onChange={handleChange}
                                            placeholder={`Enter ${formatLabel(key)}...`}
                                            className={baseInputClass}
                                        />
                                    </div>
                                ))}
                            </div>
                        </fieldset>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between pt-6 gap-4 border-t border-slate-200">
                        <button type="button" onClick={() => navigate('/admin/dashboard')} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-transparent border-2 border-slate-300 text-slate-600 rounded-lg font-semibold hover:border-[#243670] hover:text-[#243670] transition-all duration-300">
                            <FaArrowLeft />
                            Back to Dashboard
                        </button>
                        <button type="submit" disabled={isSaving} className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-3 bg-[#243670] text-white rounded-lg font-bold shadow-lg shadow-blue-900/20 hover:shadow-xl hover:shadow-blue-900/30 hover:bg-blue-900 transition-all duration-300 transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100">
                            {isSaving ? ( <><FaSpinner className="animate-spin" /><span>Saving...</span></> ) : ( <><FaSave /><span>Save Changes</span></> )}
                        </button>
                    </div>

                    {message && (
                        <div className={`mt-4 p-4 rounded-lg flex items-center gap-3 text-sm font-medium transition-opacity duration-300 ${message.startsWith('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-800'}`}>
                            {message.startsWith('Error') ? <FaExclamationTriangle /> : <FaCheckCircle />}
                            <span>{message}</span>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default RegionEditForm;