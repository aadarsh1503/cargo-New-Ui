import React, { useState } from 'react';

import { FiUser, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import LOGO from "./LOGO.png"; // Make sure this path is correct
import { useNavigate, Link } from 'react-router-dom';

import { API_BASE_URL } from '../../config/apiConfig';

const StyleInjector = () => (
    <style>
        {`
            @keyframes liquid-flow {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            @keyframes ripple-pulse {
                0%, 100% { transform: scale(0.95); opacity: 0.7; }
                50% { transform: scale(1.05); opacity: 1; }
            }
        `}
    </style>
);

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
            const response = await fetch(`${API_BASE_URL}/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login Failed');
            }

            if (data.adminToken) {
                localStorage.setItem('adminToken', data.adminToken);
                navigate('/admin/dashboard');
            } else {
                throw new Error('Login response did not include a token.');
            }
        } catch (err) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
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

      
                <img
                    src={LOGO}
                    alt="GVS Cargo Logo"
                    className="w-64 h-auto mb-8 z-10"
                />

                <div className="relative z-10 w-full max-w-md p-8 transition-all duration-500 bg-white/40 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl">
                    <div key={isLoading ? 'loading' : 'form'} className="transition-opacity duration-500 animate-in fade-in">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center space-y-6 py-16">
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-4 h-4 rounded-full bg-[#243670]" style={{ animation: 'ripple-pulse 1.5s ease-in-out infinite' }}></div>
                                    <div className="w-4 h-4 rounded-full bg-[#243670]" style={{ animation: 'ripple-pulse 1.5s ease-in-out infinite', animationDelay: '0.2s' }}></div>
                                    <div className="w-4 h-4 rounded-full bg-[#243670]" style={{ animation: 'ripple-pulse 1.5s ease-in-out infinite', animationDelay: '0.4s' }}></div>
                                </div>
                                <p className="text-[#243670]/80">Authenticating...</p>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div className="text-center">
                                    <h2 className="text-3xl font-bold text-[#243670]">Admin Access</h2>
                                    <p className="text-[#243670]/70">Sign in to continue</p>
                                </div>

                                <form onSubmit={handleLogin} className="space-y-6">
                                    <div className="relative">
                                        <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[#243670]/50" />
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 bg-white/60 text-[#243670] placeholder-[#243670]/50 border-2 border-transparent rounded-xl focus:outline-none focus:ring-4 focus:ring-[#243670]/20 focus:border-white transition-all duration-300"
                                            placeholder="Username"
                                            required
                                        />
                                    </div>

                                    <div className="relative">
                                        <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#243670]/50" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-12 pr-12 py-3 bg-white/60 text-[#243670] placeholder-[#243670]/50 border-2 border-transparent rounded-xl focus:outline-none focus:ring-4 focus:ring-[#243670]/20 focus:border-white transition-all duration-300"
                                            placeholder="Password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={togglePasswordVisibility}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#243670]/50 hover:text-[#243670] transition-colors"
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showPassword ? <FiEyeOff /> : <FiEye />}
                                        </button>
                                    </div>

                                    {error && (
                                        <div className="text-center text-red-800 bg-red-200/50 p-2 rounded-lg text-sm">
                                            <p>{error}</p>
                                        </div>
                                    )}

<button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full font-bold text-white py-3 rounded-xl bg-gradient-to-r from-[#243670] to-[#5b72b4] shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#5b72b4]/50 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
                                    </button>
                                </form>

                                {/* ADD THIS LINK */}
                                <div className="text-center">
                                    <Link
                                        to="/forgot-password"
                                        className="text-sm text-[#243670]/80 hover:text-[#243670] hover:underline transition-colors"
                                    >
                                        Forgot Password?
                                    </Link>
                                </div>
                            </div>
                        )}
                 
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminLogin;