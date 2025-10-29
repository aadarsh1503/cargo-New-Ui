import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import LOGO from "./LOGO.png";

import { API_BASE_URL } from '../../config/apiConfig';

const StyleInjector = () => (
    <style>{`@keyframes liquid-flow{0%{background-position:0 50%}50%{background-position:100% 50%}100%{background-position:0 50%}}`}</style>
);

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await fetch(`${API_BASE_URL}/admin/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'An error occurred.');
            }
            setMessage(data.message);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <StyleInjector />
            <div className="relative flex flex-col items-center justify-center min-h-screen font-sans overflow-hidden p-4">
                <div
                    className="absolute inset-0 z-0"
                    style={{
                        backgroundImage: 'linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)',
                        backgroundSize: '200% 200%',
                        animation: 'liquid-flow 15s ease-in-out infinite',
                    }}
                />
                <img src={LOGO} alt="GVS Cargo Logo" className="w-64 h-auto mb-8 z-10" />
                <div className="relative z-10 w-full max-w-md p-8 bg-white/40 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-[#243670]">Reset Password</h2>
                        <p className="text-[#243670]/70">Enter your email to receive a reset link.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#243670]/50" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white/60 text-[#243670] placeholder-[#243670]/50 border-2 border-transparent rounded-xl focus:outline-none focus:ring-4 focus:ring-[#243670]/20 focus:border-white"
                                placeholder="Email Address"
                                required
                            />
                        </div>

                        {message && (
                            <div className="text-center text-green-800 bg-green-200/50 p-3 rounded-lg text-sm">
                                <p>{message}</p>
                            </div>
                        )}
                        {error && (
                            <div className="text-center text-red-800 bg-red-200/50 p-3 rounded-lg text-sm">
                                <p>{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full font-bold text-white py-3 rounded-xl bg-gradient-to-r from-[#243670] to-[#5b72b4] shadow-lg transition-transform transform hover:scale-105 disabled:opacity-70"
                        >
                            {isLoading ? 'SENDING...' : 'SEND RESET LINK'}
                        </button>
                    </form>
                    <div className="text-center mt-6">
                        <Link to="/admin/login" className="inline-flex items-center gap-2 text-sm text-[#243670]/80 hover:text-[#243670] hover:underline">
                            <FiArrowLeft /> Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ForgotPassword;