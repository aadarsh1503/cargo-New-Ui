import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiMail, FiLock, FiUser, FiPhone } from 'react-icons/fi';
import { API_BASE_URL } from '../../config/apiConfig';
import toast from 'react-hot-toast';
import LOGO from './LOGO.png';

const ROLES = [
  { key: 'agent', label: 'Agent' },
  { key: 'user',  label: 'User' },
];

// ─── Forgot password modal ────────────────────────────────────────────────────
const ForgotModal = ({ role, onClose }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  // Agent tab covers both agents and admins — try both forgot-password endpoints
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Try agent first, then admin
      let res = await fetch(`${API_BASE_URL}/freight/agent/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        res = await fetch(`${API_BASE_URL}/admin/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSent(true);
    } catch (err) {
      toast.error(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <p className="font-bold text-gray-800">Forgot Password</p>
        {sent ? (
          <div className="text-center space-y-3">
            <p className="text-green-600 text-sm">Reset link sent! Check your email.</p>
            <button onClick={onClose} className="w-full py-2 rounded-full bg-[#243670] text-white text-sm font-semibold">Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Your email address"
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#243670]"
              />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="flex-1 py-2 rounded-full border border-gray-200 text-gray-600 text-sm font-semibold">Cancel</button>
              <button type="submit" disabled={loading} className="flex-1 py-2 rounded-full bg-[#243670] text-white text-sm font-semibold disabled:opacity-50">
                {loading ? 'Sending...' : 'Send Link'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// ─── User signup form ─────────────────────────────────────────────────────────
const UserSignup = ({ onSwitch }) => {
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Store locally and redirect to bookings — no server account needed
      localStorage.setItem('userEmail', form.email);
      localStorage.setItem('userName', form.name);
      toast.success(`Welcome, ${form.name}!`);
      navigate('/my-bookings');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="text-center">
        <p className="text-xl font-bold text-[#243670]">Create Account</p>
        <p className="text-gray-500 text-sm mt-1">Track your shipments with GVS Cargo</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text" required value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            placeholder="Full Name"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#243670]"
          />
        </div>
        <div className="relative">
          <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="email" required value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            placeholder="Email Address"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#243670]"
          />
        </div>
        <div className="relative">
          <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="tel" value={form.phone}
            onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
            placeholder="Phone (optional)"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#243670]"
          />
        </div>
        <button
          type="submit" disabled={loading}
          className="w-full py-2.5 rounded-full bg-[#243670] text-white text-sm font-bold hover:bg-[#1a2a5e] transition-colors disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Account & Track Bookings'}
        </button>
      </form>
      <p className="text-center text-xs text-gray-500">
        Already have an email?{' '}
        <button onClick={onSwitch} className="text-[#243670] font-semibold hover:underline">Sign in</button>
      </p>
    </div>
  );
};

// ─── Main unified login ───────────────────────────────────────────────────────
const AdminLogin = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('agent');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [deactivated, setDeactivated] = useState(false);

  // Redirect if already logged in with a valid session
  useEffect(() => {
    const SESSION_DURATION = 5 * 60 * 60 * 1000;
    const adminToken = localStorage.getItem('adminToken');
    const adminLoginTime = parseInt(localStorage.getItem('adminLoginTime') || '0', 10);
    const agentToken = localStorage.getItem('agentToken');

    if (adminToken && (Date.now() - adminLoginTime) < SESSION_DURATION) {
      navigate('/admin/dashboard', { replace: true });
      return;
    }
    if (adminToken) {
      // Token exists but expired — clean it up
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminLoginTime');
    }
    if (agentToken) { navigate('/agent/dashboard', { replace: true }); return; }
  }, []);

  const handleRoleChange = (r) => {
    setRole(r);
    setError('');
    setDeactivated(false);
    setShowSignup(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setDeactivated(false);

    try {
      if (role === 'agent') {
        // Try agent login first
        const agentRes = await fetch(`${API_BASE_URL}/freight/agent/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const agentData = await agentRes.json();

        if (agentRes.status === 403) { setDeactivated(true); return; }

        if (agentRes.ok) {
          // It's an agent
          localStorage.setItem('agentToken', agentData.agentToken);
          localStorage.setItem('agentInfo', JSON.stringify(agentData.agent));
          toast.success(`Welcome, ${agentData.agent.name}`);
          navigate('/agent/dashboard');
          return;
        }

        // Agent login failed — try admin login (admin uses email as username too)
        const adminRes = await fetch(`${API_BASE_URL}/admin/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: email, password }),
        });
        const adminData = await adminRes.json();

        if (adminRes.ok) {
          localStorage.setItem('adminToken', adminData.adminToken);
          localStorage.setItem('adminLoginTime', Date.now().toString());
          navigate('/admin/dashboard');
          return;
        }

        throw new Error('Invalid credentials');

      } else {
        // User — just store email and go to bookings
        localStorage.setItem('userEmail', email);
        navigate('/my-bookings');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes liquid-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden p-4">
        {/* Background */}
        <div className="absolute inset-0 z-0" style={{
          backgroundImage: 'linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)',
          backgroundSize: '200% 200%',
          animation: 'liquid-flow 15s ease-in-out infinite',
        }} />

        <img src={LOGO} alt="GVS Cargo" className="w-56 h-auto mb-6 z-10" />

        <div className="relative z-10 w-full max-w-md bg-white/40 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl p-8">

          {/* Role tabs */}
          <div className="flex gap-1 bg-white/50 rounded-full p-1 mb-6">
            {ROLES.map(r => (
              <button
                key={r.key}
                onClick={() => handleRoleChange(r.key)}
                className={`flex-1 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  role === r.key
                    ? 'bg-[#243670] text-white shadow'
                    : 'text-[#243670]/70 hover:text-[#243670]'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* User signup view */}
          {role === 'user' && showSignup ? (
            <UserSignup onSwitch={() => setShowSignup(false)} />
          ) : (
            <div className="space-y-5">
              <div className="text-center">
                <p className="text-xl font-bold text-[#243670]">
                  {role === 'agent' ? 'Partner Portal' : 'Track Your Bookings'}
                </p>
                <p className="text-[#243670]/60 text-sm mt-1">
                  {role === 'agent'
                    ? 'Sign in with your agent credentials'
                    : 'Enter your email to view your shipments'}
                </p>
              </div>

              {deactivated && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                  <p className="text-red-600 font-semibold text-sm">Your account has been deactivated.</p>
                  <p className="text-red-400 text-xs mt-0.5">Please contact the admin to restore access.</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email field for both agent and user */}
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#243670]/50" />
                  <input
                    type="email" required value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full pl-11 pr-4 py-3 bg-white/60 text-[#243670] placeholder-[#243670]/50 border-2 border-transparent rounded-xl focus:outline-none focus:ring-4 focus:ring-[#243670]/20 focus:border-white"
                  />
                </div>

                {/* Password — not needed for user */}
                {role !== 'user' && (
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#243670]/50" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full pl-11 pr-11 py-3 bg-white/60 text-[#243670] placeholder-[#243670]/50 border-2 border-transparent rounded-xl focus:outline-none focus:ring-4 focus:ring-[#243670]/20 focus:border-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#243670]/50 hover:text-[#243670]"
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                )}

                {error && (
                  <div className="text-center text-red-800 bg-red-200/50 p-2 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit" disabled={loading}
                  className="w-full font-bold text-white py-3 rounded-xl bg-gradient-to-r from-[#243670] to-[#5b72b4] shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Please wait...' : role === 'user' ? 'View My Bookings' : 'Sign In'}
                </button>
              </form>

              {/* Forgot password — admin and agent only */}
              {role !== 'user' && (
                <div className="text-center">
                  <button
                    onClick={() => setShowForgot(true)}
                    className="text-sm text-[#243670]/70 hover:text-[#243670] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {/* User signup link */}
              {role === 'user' && (
                <p className="text-center text-xs text-[#243670]/60">
                  New here?{' '}
                  <button onClick={() => setShowSignup(true)} className="text-[#243670] font-semibold hover:underline">
                    Create an account
                  </button>
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {showForgot && (
        <ForgotModal role={role} onClose={() => setShowForgot(false)} />
      )}
    </>
  );
};

export default AdminLogin;
