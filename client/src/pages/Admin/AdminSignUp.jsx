import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = 'https://gvs-cargo-dynamic.onrender.com/api';

const AdminSignUp = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            // Update the body to send only username and password
            const response = await fetch(`${API_URL}/admin/initiate-admin-creation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create account.');
            }

            setSuccess(data.message + ' Redirecting to login...');
            setTimeout(() => {
                navigate('/admin/login');
            }, 3000);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-sm">
                <h2 className="text-2xl font-bold text-center mb-6">Create Admin Account</h2>
                <form onSubmit={handleSignUp}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="At least 8 characters"
                            className="w-full px-3 py-2 border rounded-lg"
                            required
                        />
                    </div>
                    {/* REMOVED: Invitation Code input field is gone */}
                    
                    {error && <p className="text-red-500 text-center text-sm mb-4">{error}</p>}
                    {success && <p className="text-green-500 text-center text-sm mb-4">{success}</p>}
                    <button type="submit" disabled={isLoading} className="w-full bg-DarkBlue text-white py-2 rounded-lg">
                        {isLoading ? 'Creating...' : 'Create Account'}
                    </button>
                    <p className="text-center mt-4 text-sm">
                        Already have an account? <Link to="/admin/login" className="text-blue-600 hover:underline">Log In</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default AdminSignUp;