import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/apiConfig';
import toast from 'react-hot-toast';

const AgentLogin = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [deactivated, setDeactivated] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setDeactivated(false);
    try {
      const res = await fetch(`${API_BASE_URL}/freight/agent/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.status === 403) {
        setDeactivated(true);
        return;
      }
      if (!res.ok) throw new Error(data.message);
      localStorage.setItem('agentToken', data.agentToken);
      localStorage.setItem('agentInfo', JSON.stringify(data.agent));
      toast.success(`Welcome, ${data.agent.name}`);
      navigate('/agent/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-30" style={{
        backgroundImage: 'radial-gradient(#243670 0.5px, transparent 0.5px), radial-gradient(#243670 0.5px, #F0F4F8 0.5px)',
        backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px'
      }} />

      <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md border border-[#243670]/10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#243670] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">🚢</span>
          </div>
          <h1 className="text-3xl font-bold text-[#243670]">Agent Portal</h1>
          <p className="text-gray-500 mt-1 text-sm">GVS Cargo — Partner Login</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {deactivated && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <p className="text-red-600 font-semibold text-sm">Your account has been deactivated.</p>
              <p className="text-red-400 text-xs mt-1">Please contact the admin to restore access.</p>
            </div>
          )}
          <div>
            <label className="text-sm font-semibold text-[#243670] block mb-1">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:border-amber-400 transition-colors"
              placeholder="agent@company.com"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-[#243670] block mb-1">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:border-amber-400 transition-colors"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#243670] text-white py-3 rounded-xl font-bold hover:bg-[#1a2a5e] transition-colors disabled:opacity-50 shadow-lg shadow-[#243670]/20"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AgentLogin;
