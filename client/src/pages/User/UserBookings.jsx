import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/apiConfig';
import toast from 'react-hot-toast';
import FreightRequestDetail from '../../components/FreightRequestDetail/FreightRequestDetail';
import BookingInvoice from '../../components/BookingInvoice/BookingInvoice';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;

const STATUS_CONFIG = {
  submitted:                { label: 'Pending',      color: 'text-blue-500',    dot: 'bg-blue-500' },
  admin_review:             { label: 'Pending',      color: 'text-blue-500',    dot: 'bg-blue-500' },
  forwarded_to_agent:       { label: 'Pending',      color: 'text-blue-500',    dot: 'bg-blue-500' },
  agent_priced:             { label: 'Pending',      color: 'text-blue-500',    dot: 'bg-blue-500' },
  commission_added:         { label: 'Pending',      color: 'text-blue-500',    dot: 'bg-blue-500' },
  sent_to_user:             { label: 'Quote Ready',  color: 'text-[#243670]',    dot: 'bg-blue-500' },
  user_approved:            { label: 'Confirmed',    color: 'text-green-500',   dot: 'bg-green-500' },
  payment_requested:        { label: 'Pay Now',      color: 'text-orange-500',  dot: 'bg-orange-500' },
  payment_completed:        { label: 'Paid',         color: 'text-green-600',   dot: 'bg-green-600' },
  agent_payment_requested:  { label: 'Processing',   color: 'text-purple-500',  dot: 'bg-purple-500' },
  agent_payment_completed:  { label: 'In Progress',  color: 'text-emerald-500', dot: 'bg-emerald-500' },
  payment_proof_submitted:  { label: 'Proof Sent',   color: 'text-yellow-600',  dot: 'bg-yellow-500' },
  agent_payment_sent:       { label: 'In Progress',  color: 'text-emerald-500', dot: 'bg-emerald-500' },
  in_progress:              { label: 'In Progress',  color: 'text-emerald-500', dot: 'bg-emerald-500' },
  completed:                { label: 'Delivered',    color: 'text-emerald-600', dot: 'bg-emerald-600' },
  cancelled:                { label: 'Cancelled',    color: 'text-red-500',     dot: 'bg-red-500' },
};

// Unique user-facing status options (deduplicated by label, no cancelled)
const USER_STATUS_OPTIONS = [
  { value: 'pending',           label: 'Pending',     keys: ['submitted','admin_review','forwarded_to_agent','agent_priced','commission_added'] },
  { value: 'sent_to_user',      label: 'Quote Ready', keys: ['sent_to_user'] },
  { value: 'user_approved',     label: 'Confirmed',   keys: ['user_approved'] },
  { value: 'payment_completed', label: 'Paid',        keys: ['payment_completed'] },
  { value: 'in_progress',       label: 'In Progress', keys: ['agent_payment_requested','agent_payment_completed','in_progress'] },
  { value: 'completed',         label: 'Delivered',   keys: ['completed'] },
];

// City autocomplete hook
const useCitySearch = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const timer = useState(null);

  const search = (val) => {
    setQuery(val);
    if (timer[0]) clearTimeout(timer[0]);
    if (!val.trim()) { setSuggestions([]); setOpen(false); return; }
    timer[0] = setTimeout(async () => {
      try {
        // Extract country guess from "City (Country)" format or just use val
        const res = await fetch('https://countriesnow.space/api/v0.1/countries/cities/q?country=&city=' + encodeURIComponent(val));
        const data = await res.json();
        const cities = (data.data || []).slice(0, 8);
        setSuggestions(cities);
        setOpen(cities.length > 0);
      } catch { setSuggestions([]); }
    }, 300);
  };

  const pick = (city) => { setQuery(city); setSuggestions([]); setOpen(false); };
  const clear = () => { setQuery(''); setSuggestions([]); setOpen(false); };

  return { query, search, suggestions, open, setOpen, pick, clear };
};

const CityInput = ({ placeholder, value, onChange }) => {
  const [inputVal, setInputVal] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const timerRef = useState(null);
  const wrapRef = useState(null);

  const handleChange = (val) => {
    setInputVal(val);
    onChange(val);
    if (timerRef[0]) clearTimeout(timerRef[0]);
    if (!val.trim()) { setSuggestions([]); setOpen(false); return; }
    timerRef[0] = setTimeout(async () => {
      try {
        const res = await fetch(`https://countriesnow.space/api/v0.1/countries/cities/q?country=&city=${encodeURIComponent(val)}`);
        const data = await res.json();
        const cities = (data.data || []).slice(0, 8);
        setSuggestions(cities);
        setOpen(cities.length > 0);
      } catch { setSuggestions([]); }
    }, 300);
  };

  const pick = (city) => { setInputVal(city); onChange(city); setSuggestions([]); setOpen(false); };

  return (
    <div className="relative">
      <input
        type="text"
        value={inputVal}
        onChange={e => handleChange(e.target.value)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#243670]"
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 top-full mt-0.5 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
          {suggestions.map((c, i) => (
            <li key={i} onMouseDown={() => pick(c)}
              className="px-3 py-1.5 text-xs text-gray-700 hover:bg-blue-50 cursor-pointer">
              {c}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const UserBookingsInner = () => {
  const [step, setStep]             = useState('email');
  const [emailInput, setEmailInput] = useState('');
  const [email, setEmail]           = useState('');
  const [otpInput, setOtpInput]     = useState('');
  const [sending, setSending]       = useState(false);
  const [verifying, setVerifying]   = useState(false);
  const [bookings, setBookings]     = useState([]);
  const [selected, setSelected]     = useState(null);
  const [loading, setLoading]       = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterPOL, setFilterPOL] = useState('');
  const [filterPOD, setFilterPOD] = useState('');
  const [filterCommodity, setFilterCommodity] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [payMethod, setPayMethod] = useState('paypal'); // 'paypal' | 'bank'
  const [adminPayDetails, setAdminPayDetails] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [proofSubmitted, setProofSubmitted] = useState(false);
  const navigate = useNavigate();

  // On mount — if already verified this session, skip OTP and load bookings
  // Also check if coming from login page with pre-filled email
  useEffect(() => {
    const verified = sessionStorage.getItem('userVerifiedEmail');
    if (verified) {
      setEmail(verified);
      fetchBookings(verified);
      return;
    }
    const fromLogin = localStorage.getItem('userEmail');
    if (fromLogin) {
      setEmailInput(fromLogin);
      setEmail(fromLogin);
      localStorage.removeItem('userEmail');
      // Auto-send OTP
      fetch(`${API_BASE_URL}/freight/user/send-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fromLogin }),
      }).then(async r => {
        const data = await r.json();
        if (r.ok) { setStep('otp'); toast.success('Verification code sent to your email'); }
        else toast.error(data.message || 'Failed to send code. Please try again.');
      }).catch(() => toast.error('Failed to send code. Please try again.'));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`${API_BASE_URL}/freight/user/send-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message || 'Failed to send code. Please try again.'); return; }
      setEmail(emailInput.trim());
      setStep('otp');
      toast.success('Verification code sent to your email');
    } catch { toast.error('Failed to send code. Please try again.'); }
    finally { setSending(false); }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otpInput.trim()) return;
    setVerifying(true);
    try {
      const res = await fetch(`${API_BASE_URL}/freight/user/verify-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message || 'Invalid code'); return; }
      await fetchBookings(email);
    } catch { toast.error('Verification failed. Please try again.'); }
    finally { setVerifying(false); }
  };

  const fetchBookings = async (userEmail) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/freight/user/bookings?email=${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setBookings(list);
      if (list.length > 0) { setSelected(list[0]); }
      sessionStorage.setItem('userVerifiedEmail', userEmail); // persist across refresh
      setStep('bookings');
    } catch { toast.error('Error loading bookings'); }
    finally { setLoading(false); }
  };

  // Fetch admin payment details (for bank transfer option)
  const fetchAdminPayDetails = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/freight/admin/payment-details`);
      if (res.ok) setAdminPayDetails(await res.json());
    } catch { /* silent */ }
  };

  // When selected booking changes, reset proof state and fetch admin details if needed
  useEffect(() => {
    if (selected?.status === 'sent_to_user' && selected?.final_price) {
      setProofSubmitted(false);
      setProofFile(null);
      setPayMethod('paypal');
      fetchAdminPayDetails();
    }
  }, [selected?.id]);

  // Called after PayPal captures the order successfully
  const handlePaymentSuccess = async (orderId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/freight/user/confirm-payment/${selected.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, paypalOrderId: orderId }),
      });
      if (!res.ok) throw new Error();
      toast.success('Payment confirmed! Your booking is now active.');
      await fetchBookings(email);
    } catch { toast.error('Payment captured but confirmation failed. Please contact support.'); }
  };

  const handleCancelBooking = async () => {
    setCancelling(true);
    try {
      const res = await fetch(`${API_BASE_URL}/freight/user/cancel/${selected.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, reason: cancelReason }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message || 'Failed to cancel'); return; }
      toast.success('Booking cancelled successfully.');
      setCancelModal(false);
      setCancelReason('');
      await fetchBookings(email);
    } catch { toast.error('Failed to cancel booking.'); }
    finally { setCancelling(false); }
  };

  const handleBankProofUpload = async () => {
    if (!proofFile) return toast.error('Please select a file');
    setUploadingProof(true);
    try {
      const fd = new FormData();
      fd.append('email', email);
      fd.append('proof', proofFile);
      const res = await fetch(`${API_BASE_URL}/freight/user/payment-proof/${selected.id}`, {
        method: 'POST', body: fd,
      });
      if (!res.ok) throw new Error();
      setProofSubmitted(true);
      toast.success('Payment proof submitted');
      await fetchBookings(email);
    } catch { toast.error('Upload failed. Please try again.'); }
    finally { setUploadingProof(false); }
  };

  const resetAll = () => {    sessionStorage.removeItem('userVerifiedEmail');
    setStep('email'); setEmailInput(''); setEmail('');
    setOtpInput(''); setBookings([]); setSelected(null);
  };

  // ── Email step ──────────────────────────────────────────────────────────────
  if (step === 'email') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">📦</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Track Your Bookings</h1>
            <p className="text-gray-500 mt-1 text-sm">Enter the email you used when submitting your request</p>
          </div>
          <form onSubmit={handleSendOTP} className="space-y-4">
            <input type="email" required value={emailInput} onChange={e => setEmailInput(e.target.value)}
              placeholder="your@email.com"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#243670] text-sm" />
            <button type="submit" disabled={sending}
              className="w-full bg-[#243670] text-white py-3 rounded-full font-semibold hover:bg-blue-900 transition-colors disabled:opacity-60">
              {sending ? 'Sending code...' : 'Send Verification Code'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── OTP step ────────────────────────────────────────────────────────────────
  if (step === 'otp') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">✉️</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Check Your Email</h1>
            <p className="text-gray-500 mt-1 text-sm">
              We sent a 6-digit code to <span className="font-semibold text-gray-700">{email}</span>
            </p>
          </div>
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <input type="text" required maxLength={6} value={otpInput}
              onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 6-digit code"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#243670] text-sm text-center tracking-widest text-lg font-bold" />
            <button type="submit" disabled={verifying || otpInput.length < 6}
              className="w-full bg-[#243670] text-white py-3 rounded-full font-semibold hover:bg-blue-900 transition-colors disabled:opacity-60">
              {verifying ? 'Verifying...' : 'Verify & View Bookings'}
            </button>
          </form>
          <div className="text-center mt-4 space-y-2">
            <button type="button" disabled={sending}
              onClick={async () => {
                setSending(true);
                try {
                  await fetch(`${API_BASE_URL}/freight/user/send-otp`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                  });
                  toast.success('New code sent');
                } catch { toast.error('Failed to resend code'); }
                finally { setSending(false); }
              }}
              className="text-[#243670] text-sm underline disabled:opacity-50">
              {sending ? 'Sending...' : 'Resend code'}
            </button>
            <br />
            <button onClick={resetAll} className="text-gray-400 text-sm underline">Use a different email</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Bookings step ───────────────────────────────────────────────────────────
  const s = selected ? (STATUS_CONFIG[selected.status] || { label: selected.status, color: 'text-gray-500', dot: 'bg-gray-400' }) : null;

  const filteredBookings = bookings
    .filter(b => {
      if (filterPOL && !b.port_of_loading_city?.toLowerCase().includes(filterPOL.toLowerCase())) return false;
      if (filterPOD && !b.port_of_discharge_city?.toLowerCase().includes(filterPOD.toLowerCase())) return false;
      if (filterCommodity && !b.commodity?.toLowerCase().includes(filterCommodity.toLowerCase())) return false;
      if (filterStatus) {
        const group = USER_STATUS_OPTIONS.find(o => o.value === filterStatus);
        if (group && !group.keys.includes(b.status)) return false;
      }
      if (filterDateFrom && new Date(b.created_at) < new Date(filterDateFrom)) return false;
      if (filterDateTo && new Date(b.created_at) > new Date(filterDateTo + 'T23:59:59')) return false;
      return true;
    })
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

  const hasActiveFilters = filterPOL || filterPOD || filterCommodity || filterStatus || filterDateFrom || filterDateTo;

  const clearFilters = () => {
    setFilterPOL(''); setFilterPOD(''); setFilterCommodity('');
    setFilterStatus(''); setFilterDateFrom(''); setFilterDateTo('');
  };

  return (
    <>
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <button onClick={resetAll} className="px-5 py-1.5 rounded-full bg-[#243670] text-white text-sm font-semibold hover:bg-blue-900 transition-colors">
          My Bookings
        </button>
        <button onClick={() => setLogoutModal(true)} className="px-5 py-1.5 rounded-full bg-[#243670] text-white text-sm font-semibold hover:bg-blue-900 transition-colors">
          Logout
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><LoadingSpinner /></div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-lg">No bookings found for {email}</p>
          <button onClick={resetAll} className="mt-4 text-[#243670] underline text-sm">Try another email</button>
        </div>
      ) : (
        <div className="flex h-[calc(100vh-65px)]">
          {/* Left list */}
          <div className="w-80 border-r border-gray-200 overflow-y-auto flex-shrink-0 flex flex-col">
            {/* Filter toggle bar */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}</span>
              <button
                onClick={() => setShowFilters(f => !f)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full transition-colors ${showFilters || hasActiveFilters ? 'bg-[#243670] text-white' : 'border border-gray-200 text-gray-500 hover:bg-gray-50'}`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" /></svg>
                Filters {hasActiveFilters && '●'}
              </button>
            </div>

            {/* Filter panel */}
            {showFilters && (
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/60 space-y-2 flex-shrink-0">
                <CityInput
                  placeholder="Port of Loading"
                  value={filterPOL}
                  onChange={setFilterPOL}
                />
                <CityInput
                  placeholder="Port of Discharge"
                  value={filterPOD}
                  onChange={setFilterPOD}
                />
                <input
                  type="text" value={filterCommodity} onChange={e => setFilterCommodity(e.target.value)}
                  placeholder="Commodity"
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#243670]"
                />
                <select
                  value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#243670] bg-white"
                >
                  <option value="">All Statuses</option>
                  {USER_STATUS_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-400 mb-0.5">From</p>
                    <input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[#243670]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-400 mb-0.5">To</p>
                    <input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[#243670]" />
                  </div>
                </div>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="w-full text-xs text-[#243670] underline text-center">Clear all filters</button>
                )}
              </div>
            )}

            {/* Booking list */}
            <div className="overflow-y-auto flex-1">
              {filteredBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400 text-sm">
                  <p>No bookings match filters</p>
                  <button onClick={clearFilters} className="mt-2 text-[#243670] underline text-xs">Clear filters</button>
                </div>
              ) : filteredBookings.map(b => {
                const cfg = STATUS_CONFIG[b.status] || { label: b.status, color: 'text-gray-500', dot: 'bg-gray-400' };
                const isActive = selected?.id === b.id;
                return (
                  <div key={b.id} onClick={() => setSelected(b)}
                    className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${isActive ? 'border-l-4 border-l-rose-500 bg-blue-50/40' : 'hover:bg-gray-50'}`}>
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-semibold text-sm text-[#243670]">{b.reference_id}</p>
                      <span className={`text-xs font-semibold flex items-center gap-1 ${cfg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} inline-block`} />
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 font-medium">{b.company}</p>
                    {(b.port_of_loading_city || b.port_of_discharge_city) && (
                      <p className="text-xs text-gray-400 mt-0.5">{b.port_of_loading_city} → {b.port_of_discharge_city}</p>
                    )}
                    {b.commodity && <p className="text-xs text-gray-400">{b.commodity}</p>}
                    <p className="text-xs text-gray-400 mt-1">{new Date(b.created_at).toLocaleDateString()}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right detail */}
          {selected && (
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-800">Booking Details</h2>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-semibold flex items-center gap-1.5 ${s.color}`}>
                      <span className={`w-2 h-2 rounded-full ${s.dot} inline-block`} />
                      {s.label}
                    </span>
                  </div>
                </div>

                <FreightRequestDetail request={selected} />

                {/* Payment panel */}
                <div className="border border-gray-200 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-gray-800">Payment Summary</p>
                    <p className="font-bold text-gray-800">
                      {selected.final_price
                        ? `USD ${parseFloat(selected.final_price).toLocaleString()}`
                        : '—'}
                    </p>
                  </div>

                  {/* Quote ready — PayPal checkout */}
                  {selected.status === 'sent_to_user' && selected.final_price && (
                    <div className="space-y-3">
                      <div className="bg-blue-50 border border-rose-200 rounded-lg px-4 py-3 text-sm text-rose-700">
                        Your quote is ready. Complete your payment below to activate your booking.
                      </div>

                      {/* Payment method toggle */}
                      <div className="flex gap-2">
                        <button onClick={() => setPayMethod('paypal')}
                          className={`flex-1 py-2 rounded-full text-sm font-semibold border transition-colors ${payMethod === 'paypal' ? 'bg-[#243670] text-white border-rose-500' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                          💳 PayPal
                        </button>
                        <button onClick={() => setPayMethod('bank')}
                          className={`flex-1 py-2 rounded-full text-sm font-semibold border transition-colors ${payMethod === 'bank' ? 'bg-[#243670] text-white border-rose-500' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                          🏦 Bank Transfer
                        </button>
                      </div>

                      {/* PayPal buttons */}
                      {payMethod === 'paypal' && (
                        <div key={`paypal-${selected.id}`}>
                          <PayPalButtons
                            style={{ layout: 'vertical', shape: 'pill', label: 'pay' }}
                            forceReRender={[selected.id, selected.final_price]}
                            createOrder={(_data, actions) =>
                              actions.order.create({
                                purchase_units: [{
                                  reference_id: selected.reference_id,
                                  description: `GVS Cargo Freight — ${selected.reference_id}`,
                                  amount: { currency_code: 'USD', value: parseFloat(selected.final_price).toFixed(2) },
                                }],
                              })
                            }
                            onApprove={async (_data, actions) => {
                              const order = await actions.order.capture();
                              await handlePaymentSuccess(order.id);
                            }}
                            onError={(err) => { console.error('PayPal error:', err); toast.error('Payment failed. Please try again.'); }}
                            onCancel={() => toast('Payment cancelled.')}
                          />
                        </div>
                      )}

                      {/* Bank transfer */}
                      {payMethod === 'bank' && (
                        <div className="space-y-3">
                          {adminPayDetails && (adminPayDetails.bank_name || adminPayDetails.iban) ? (
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2 text-sm">
                              <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Bank Transfer Details</p>
                              {[
                                ['Bank Name', adminPayDetails.bank_name],
                                ['Branch', adminPayDetails.branch_name],
                                ['Account Holder', adminPayDetails.account_holder],
                                ['Account Number', adminPayDetails.account_number],
                                ['IBAN', adminPayDetails.iban],
                                ['SWIFT Code', adminPayDetails.swift_code],
                              ].map(([l, v]) => v ? (
                                <div key={l} className="flex justify-between">
                                  <span className="text-gray-400 text-xs">{l}</span>
                                  <span className="font-semibold text-gray-800 font-mono text-xs">{v}</span>
                                </div>
                              ) : null)}
                              {adminPayDetails.payment_instructions && (
                                <p className="text-xs text-gray-500 border-t border-gray-200 pt-2 mt-1">{adminPayDetails.payment_instructions}</p>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400">Bank details not available. Please use PayPal or contact support.</p>
                          )}

                          {!proofSubmitted ? (
                            <div className="space-y-2">
                              <p className="text-xs text-gray-500">After transferring, upload your payment proof (PDF or image):</p>
                              <input type="file" accept=".pdf,.jpg,.jpeg,.png"
                                onChange={e => setProofFile(e.target.files[0])}
                                className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2" />
                              {proofFile && <p className="text-xs text-green-600">✓ {proofFile.name}</p>}
                              <button onClick={handleBankProofUpload} disabled={uploadingProof || !proofFile}
                                className="w-full py-2.5 rounded-full bg-[#243670] text-white text-sm font-semibold hover:bg-blue-900 disabled:opacity-50">
                                {uploadingProof ? 'Uploading...' : 'Submit Payment Proof'}
                              </button>
                            </div>
                          ) : (
                            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
                              ✓ Your payment proof has been submitted. Admin will verify and confirm shortly.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quote ready but no price set yet */}
                  {selected.status === 'sent_to_user' && !selected.final_price && (
                    <div className="bg-blue-50 border border-rose-200 rounded-lg px-4 py-3 text-sm text-rose-700">
                      Your quote is being finalised. Please check back shortly.
                    </div>
                  )}

                  {/* Proof submitted — awaiting admin verification */}
                  {selected.status === 'payment_proof_submitted' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-700">
                      ⏳ Your payment proof has been submitted. Admin will verify and confirm shortly.
                    </div>
                  )}

                  {/* Already paid */}
                  {['payment_completed', 'agent_payment_requested', 'agent_payment_completed', 'agent_payment_sent', 'in_progress'].includes(selected.status) && (
                    <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700 font-semibold">
                      ✓ Payment received — your shipment is being processed.
                    </div>
                  )}

                  {/* Completed */}
                  {selected.status === 'completed' && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-sm text-emerald-700 font-semibold">
                      ✓ Shipment delivered successfully. Thank you!
                    </div>
                  )}

                  {/* Pending states */}
                  {['submitted', 'admin_review', 'forwarded_to_agent', 'agent_priced', 'commission_added'].includes(selected.status) && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-500">
                      Your request is being reviewed. We'll notify you once a quote is ready.
                    </div>
                  )}

                  {/* Cancelled */}
                  {selected.status === 'cancelled' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600 space-y-1.5">
                      <p className="font-semibold">This booking has been cancelled.</p>
                      {selected.cancellation_fee != null && (
                        <>
                          <div className="flex justify-between text-gray-600 text-xs">
                            <span>Amount Paid</span>
                            <span>USD {parseFloat(selected.final_price).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-red-500 text-xs">
                            <span>Cancellation Fee</span>
                            <span>− USD {parseFloat(selected.cancellation_fee).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-green-700 text-xs font-semibold border-t border-red-200 pt-1">
                            <span>Your Refund</span>
                            <span>USD {parseFloat(selected.refund_amount).toLocaleString()}</span>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <p className="text-center text-gray-400 text-xs">
                  Booking confirmation may take up to 3 business hours. You will receive an email notification.
                </p>

                {/* Invoice — shown once payment is confirmed */}
                <BookingInvoice booking={selected} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>

    {logoutModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
          <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-[#243670] text-2xl">👋</span>
          </div>
          <p className="font-bold text-gray-800 text-lg">Confirm Logout</p>
          <p className="text-sm text-gray-500">Are you sure you want to log out?</p>
          <div className="flex gap-3">
            <button
              onClick={() => setLogoutModal(false)}
              className="flex-1 py-2.5 rounded-full border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => { setLogoutModal(false); resetAll(); navigate('/'); }}
              className="flex-1 py-2.5 rounded-full bg-[#243670] text-white text-sm font-semibold hover:bg-blue-900 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    )}

    {cancelModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
          <p className="font-bold text-gray-800 text-lg">Cancel Booking</p>
          <p className="text-sm text-gray-500">
            {'Are you sure you want to cancel '}
            <span className="font-semibold text-gray-700">{selected?.reference_id}</span>
            {'?'}
          </p>
          {selected?.status === 'payment_completed' && (
            <p className="text-sm text-red-500">A cancellation fee may apply as you have already paid.</p>
          )}
          <textarea
            value={cancelReason}
            onChange={e => setCancelReason(e.target.value)}
            rows={3}
            placeholder="Reason for cancellation (optional)"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-300 resize-none"
          />
          <div className="flex gap-3">
            <button
              onClick={() => { setCancelModal(false); setCancelReason(''); }}
              className="flex-1 py-2.5 rounded-full border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Keep Booking
            </button>
            <button
              onClick={handleCancelBooking}
              disabled={cancelling}
              className="flex-1 py-2.5 rounded-full bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
            </button>
          </div>
        </div>
      </div>
    )}
  </>
  );
};

// ── Wrap with stable PayPalScriptProvider so SDK loads once ──────────────────
const UserBookings = () => (
  <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: 'USD', components: 'buttons' }}>
    <UserBookingsInner />
  </PayPalScriptProvider>
);

export default UserBookings;

