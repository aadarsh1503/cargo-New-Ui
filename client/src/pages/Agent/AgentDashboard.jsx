import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/apiConfig';
import toast from 'react-hot-toast';
import FreightRequestDetail from '../../components/FreightRequestDetail/FreightRequestDetail';

const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-16">
    <img src="https://media.tenor.com/1JRARHVuEtUAAAAi/rafsdesign-rafs.gif" alt="Loading..." style={{ width: 140, height: 140 }} />
  </div>
);

// ─── Shared pill button style ─────────────────────────────────────────────────
const pill = 'px-5 py-1.5 rounded-full text-sm font-semibold transition-all';

// ─── Status badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    forwarded_to_agent:      { label: 'New',                    color: 'text-[#243670]' },
    agent_priced:            { label: 'Priced',                 color: 'text-amber-500' },
    commission_added:        { label: 'Commission Added',       color: 'text-indigo-500' },
    sent_to_user:            { label: 'Sent to User',           color: 'text-cyan-500' },
    user_approved:           { label: 'Approved',               color: 'text-teal-500' },
    payment_requested:       { label: 'Payment Req.',           color: 'text-pink-500' },
    payment_completed:       { label: 'User Paid ✓',            color: 'text-green-500' },
    agent_payment_requested: { label: 'Payment Requested',      color: 'text-orange-500' },
    agent_payment_completed: { label: 'Agent Paid',             color: 'text-emerald-500' },
    agent_payment_sent:      { label: 'Payment Sent ✓',         color: 'text-blue-500' },
    in_progress:             { label: 'In Progress',            color: 'text-emerald-500' },
    completed:               { label: 'Delivered',              color: 'text-gray-500' },
    cancelled:               { label: 'Cancelled',              color: 'text-red-500' },
  };
  const s = map[status] || { label: status, color: 'text-gray-500' };
  return (
    <span className={`font-semibold text-sm flex items-center gap-1.5 ${s.color}`}>
      <span className="w-2 h-2 rounded-full bg-current inline-block" />
      {s.label}
    </span>
  );
};

// ─── Price Submit Modal ───────────────────────────────────────────────────────
const PriceModal = ({ request, onClose, onRefresh }) => {
  const [agentPrice, setAgentPrice] = useState('');
  const agentCurrency = 'USD';
  const [agentNotes, setAgentNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agentPrice) return toast.error('Please enter a price');
    setSaving(true);
    try {
      const token = localStorage.getItem('agentToken');
      const res = await fetch(`${API_BASE_URL}/freight/agent/requests/${request.id}/price`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ agentPrice, agentCurrency, agentNotes }),
      });
      if (!res.ok) throw new Error();
      toast.success('Price submitted to admin');
      onRefresh();
      onClose();
    } catch {
      toast.error('Failed to submit price');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
          <div>
            <p className="font-bold text-gray-800">Request Details & Submit Price</p>
            <p className="text-xs text-[#243670] font-mono">{request.reference_id}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
        </div>
        <div className="flex flex-col md:flex-row overflow-hidden flex-1 min-h-0">
          {/* Left: full details */}
          <div className="flex-1 overflow-y-auto p-6 border-r border-gray-100">
            <FreightRequestDetail request={request} />
          </div>
          {/* Right: price form */}
          {request.status === 'forwarded_to_agent' && (
            <div className="w-full md:w-96 p-6 flex-shrink-0">
              <p className="font-semibold text-gray-800 mb-4 text-sm">Submit Your Price</p>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="number"
                    required
                    value={agentPrice}
                    onChange={e => setAgentPrice(e.target.value)}
                    placeholder="Your price (USD)"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#243670]"
                  />
                  <span className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 flex items-center">USD</span>
                </div>
                <textarea
                  value={agentNotes}
                  onChange={e => setAgentNotes(e.target.value)}
                  rows={3}
                  placeholder="Notes for admin (optional)"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#243670]"
                />
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-[#243670] text-white py-2.5 rounded-full font-semibold hover:bg-blue-900 transition-colors disabled:opacity-50 text-sm"
                >
                  {saving ? 'Submitting...' : 'Submit Price to Admin'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Read-only Booking Detail Modal ──────────────────────────────────────────
const BookingDetailModal = ({ request, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
        <div>
          <p className="font-bold text-gray-800">Booking Details</p>
          <p className="text-xs text-[#243670] font-mono">{request.reference_id}</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none">×</button>
      </div>
      <div className="overflow-y-auto p-6">
        <FreightRequestDetail request={request} />
      </div>
    </div>
  </div>
);

// ─── Bookings Tab ─────────────────────────────────────────────────────────────
const BookingsTab = ({ requests, loading, onSelectRequest, onRefresh, token }) => {
  const [polFilter, setPolFilter] = useState('');
  const [podFilter, setPodFilter] = useState('');
  const [search, setSearch] = useState('');
  const [detailRequest, setDetailRequest] = useState(null);
  const [requestingPayment, setRequestingPayment] = useState(null);
  const [markingDelivered, setMarkingDelivered] = useState(null);
  const [confirmingPayment, setConfirmingPayment] = useState(null);
  const [rejectModal, setRejectModal] = useState(null); // req object
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  const handleRequestPayment = async (req) => {
    if (!window.confirm('Request payment from admin for this booking?')) return;
    setRequestingPayment(req.id);
    try {
      const res = await fetch(`${API_BASE_URL}/freight/agent/requests/${req.id}/request-payment`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      toast.success('Payment request sent to admin');
      onRefresh();
    } catch {
      toast.error('Failed to request payment');
    } finally {
      setRequestingPayment(null);
    }
  };

  const handleMarkDelivered = async (req) => {
    if (!window.confirm('Mark this shipment as delivered?')) return;
    setMarkingDelivered(req.id);
    try {
      const res = await fetch(`${API_BASE_URL}/freight/agent/requests/${req.id}/mark-delivered`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      toast.success('Shipment marked as delivered');
      onRefresh();
    } catch {
      toast.error('Failed to mark as delivered');
    } finally {
      setMarkingDelivered(null);
    }
  };

  const handleConfirmPaymentReceived = async (req) => {
    if (!window.confirm('Confirm you have received this payment?')) return;
    setConfirmingPayment(req.id);
    try {
      const res = await fetch(`${API_BASE_URL}/freight/agent/requests/${req.id}/confirm-payment-received`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      toast.success('Payment confirmed — booking is now in progress');
      onRefresh();
    } catch {
      toast.error('Failed to confirm payment');
    } finally {
      setConfirmingPayment(null);
    }
  };

  const handleRejectPayment = async () => {
    if (!rejectReason.trim()) return toast.error('Please provide a reason');
    setRejecting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/freight/agent/requests/${rejectModal.id}/reject-payment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason: rejectReason }),
      });
      if (!res.ok) throw new Error();
      toast.success('Rejection reported to admin');
      setRejectModal(null);
      setRejectReason('');
      onRefresh();
    } catch {
      toast.error('Failed to submit rejection');
    } finally {
      setRejecting(false);
    }
  };

  const filtered = requests
    .filter(r => {
      const q = search.toLowerCase();
      const polMatch = !polFilter || r.port_of_loading_city?.toLowerCase().includes(polFilter.toLowerCase());
      const podMatch = !podFilter || r.port_of_discharge_city?.toLowerCase().includes(podFilter.toLowerCase());
      const searchMatch = !search ||
        r.reference_id?.toLowerCase().includes(q) ||
        r.company?.toLowerCase().includes(q) ||
        r.name?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q) ||
        r.port_of_loading_city?.toLowerCase().includes(q) ||
        r.port_of_discharge_city?.toLowerCase().includes(q);
      return polMatch && podMatch && searchMatch;
    })
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

  return (
    <>
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <input
          type="text"
          placeholder="Search ref, company, name, email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-300 rounded-full px-4 py-1.5 text-sm focus:outline-none focus:border-[#243670] bg-white w-full sm:w-64"
        />
        <select
          value={polFilter}
          onChange={e => setPolFilter(e.target.value)}
          className="border border-gray-300 rounded-full px-4 py-1.5 text-sm focus:outline-none focus:border-[#243670] bg-white"
        >
          <option value="">All POL</option>
          {[...new Set(requests.map(r => r.port_of_loading_city).filter(Boolean))].map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select
          value={podFilter}
          onChange={e => setPodFilter(e.target.value)}
          className="border border-gray-300 rounded-full px-4 py-1.5 text-sm focus:outline-none focus:border-[#243670] bg-white"
        >
          <option value="">All POD</option>
          {[...new Set(requests.map(r => r.port_of_discharge_city).filter(Boolean))].map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        {(search || polFilter || podFilter) && (
          <button
            onClick={() => { setSearch(''); setPolFilter(''); setPodFilter(''); }}
            className="px-4 py-1.5 rounded-full border border-gray-200 text-gray-500 text-sm hover:bg-gray-50"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <p className="text-center py-10 text-gray-400">No bookings found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {['Ref ID', 'Company', 'POL', 'POD', 'Mode', 'Commodity', 'Your Price', 'Status', ''].map(h => (
                  <th key={h} className="text-left py-3 px-3 font-semibold text-[#243670] text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(req => (
                <tr key={req.id} onClick={() => setDetailRequest(req)} className={`border-b border-gray-100 transition-colors cursor-pointer ${req.status === 'payment_completed' ? 'bg-green-50 hover:bg-green-100' : 'hover:bg-gray-50'}`}>
                  <td className="py-3 px-3 font-mono text-xs text-gray-500">{req.reference_id}</td>
                  <td className="py-3 px-3">
                    <p className="font-semibold text-gray-800">{req.company}</p>
                    <p className="text-xs text-gray-400">{req.name}</p>
                  </td>
                  <td className="py-3 px-3 text-gray-700">{req.port_of_loading_city}</td>
                  <td className="py-3 px-3 text-gray-700">{req.port_of_discharge_city}</td>
                  <td className="py-3 px-3 text-gray-700">{req.mode_of_shipment}</td>
                  <td className="py-3 px-3 text-gray-700">{req.commodity}</td>
                  <td className="py-3 px-3 font-semibold text-gray-800">
                    {req.agent_price ? `USD ${parseFloat(req.agent_price).toLocaleString()}` : '—'}
                  </td>
                  <td className="py-3 px-3"><StatusBadge status={req.status} /></td>
                  <td className="py-3 px-3" onClick={e => e.stopPropagation()}>
                    {req.status === 'forwarded_to_agent' && (
                      <button
                        onClick={() => onSelectRequest(req)}
                        className={`${pill} bg-[#243670] text-white text-xs hover:bg-blue-900`}
                      >
                        Submit Price
                      </button>
                    )}
                    {req.status === 'payment_completed' && (
                      <button
                        onClick={() => handleRequestPayment(req)}
                        disabled={requestingPayment === req.id}
                        className={`${pill} bg-green-500 text-white text-xs hover:bg-green-600 disabled:opacity-50`}
                      >
                        {requestingPayment === req.id ? 'Requesting...' : 'Request Payment'}
                      </button>
                    )}
                    {req.status === 'agent_payment_requested' && (
                      <span className="text-xs text-orange-500 font-semibold">Awaiting Admin...</span>
                    )}
                    {req.status === 'agent_payment_sent' && (
                      <div className="space-y-1.5">
                        {req.agent_payment_method === 'bank' && req.agent_payment_proof_url && (
                          <a href={req.agent_payment_proof_url} target="_blank" rel="noreferrer"
                            className="block text-xs text-blue-500 underline">View Proof</a>
                        )}
                        {req.agent_payment_method === 'paypal' && (
                          <span className="block text-xs text-blue-500 font-semibold">Paid via PayPal</span>
                        )}
                        <button
                          onClick={() => handleConfirmPaymentReceived(req)}
                          disabled={confirmingPayment === req.id}
                          className={`${pill} bg-emerald-500 text-white text-xs hover:bg-emerald-600 disabled:opacity-50 w-full`}
                        >
                          {confirmingPayment === req.id ? 'Confirming...' : '✓ Confirm Received'}
                        </button>
                        <button
                          onClick={() => { setRejectModal(req); setRejectReason(''); }}
                          className={`${pill} bg-red-100 text-red-600 text-xs hover:bg-red-200 w-full`}
                        >
                          ✕ Reject Payment
                        </button>
                      </div>
                    )}
                    {req.status === 'in_progress' && (
                      <button
                        onClick={() => handleMarkDelivered(req)}
                        disabled={markingDelivered === req.id}
                        className={`${pill} bg-emerald-500 text-white text-xs hover:bg-emerald-600 disabled:opacity-50`}
                      >
                        {markingDelivered === req.id ? 'Updating...' : 'Mark Delivered'}
                      </button>
                    )}
                    {req.status === 'completed' && (
                      <span className="text-xs text-gray-500 font-semibold">✓ Delivered</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>

    {/* Booking Detail Modal */}
    {detailRequest && (
      <BookingDetailModal request={detailRequest} onClose={() => setDetailRequest(null)} />
    )}

    {/* Reject Payment Modal */}
    {rejectModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
          <p className="font-bold text-gray-800 text-lg">Reject Payment</p>
          <p className="text-sm text-gray-500">
            {'Please explain why the payment for '}
            <span className="font-semibold text-gray-700">{rejectModal.reference_id}</span>
            {' was not received correctly. This will be sent to admin.'}
          </p>
          <textarea
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            rows={4}
            placeholder="e.g. Amount received was incorrect, payment not received yet..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-300 resize-none"
          />
          <div className="flex gap-3">
            <button
              onClick={() => { setRejectModal(null); setRejectReason(''); }}
              className="flex-1 py-2.5 rounded-full border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleRejectPayment}
              disabled={rejecting || !rejectReason.trim()}
              className="flex-1 py-2.5 rounded-full bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-50"
            >
              {rejecting ? 'Submitting...' : 'Submit Rejection'}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

// ─── Ocean Freight Tab ────────────────────────────────────────────────────────
// ─── Country/City selector for POL/POD ───────────────────────────────────────
const cityCache = new Map();
const fetchCities = async (country) => {
  if (cityCache.has(country)) return cityCache.get(country);
  try {
    const res = await fetch('https://countriesnow.space/api/v0.1/countries/cities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country }),
    });
    const data = await res.json();
    const cities = data.data || [];
    cityCache.set(country, cities);
    return cities;
  } catch { return []; }
};

// Lazy-loaded country list
let _countryList = null;
const getCountries = async () => {
  if (_countryList) return _countryList;
  const { default: countryList } = await import('react-select-country-list');
  _countryList = countryList().getData().map(c => c.label);
  return _countryList;
};

const PortSelector = ({ label, countryVal, cityVal, onCountryChange, onCityChange, colClass }) => {
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => { getCountries().then(setCountries); }, []);

  const handleCountry = async (e) => {
    onCountryChange(e.target.value);
    onCityChange('');
    if (e.target.value) {
      const c = await fetchCities(e.target.value);
      setCities(c);
    } else {
      setCities([]);
    }
  };

  // Pre-load cities if editing with existing country
  useEffect(() => {
    if (countryVal) {
      fetchCities(countryVal).then(setCities);
    }
  }, []);

  return (
    <div className="flex flex-col gap-1 min-w-[120px]">
      <select value={countryVal} onChange={handleCountry} className={colClass}>
        <option value="">Country</option>
        {countries.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <select value={cityVal} onChange={e => onCityChange(e.target.value)} className={colClass} disabled={!cities.length}>
        <option value="">City/Port</option>
        {cities.map((c, i) => <option key={i} value={c}>{c}</option>)}
      </select>
    </div>
  );
};

// ─── Date range picker for availability ──────────────────────────────────────
const DateRangePicker = ({ value, onChange, colClass }) => {
  // value format: "YYYY-MM-DD ~ YYYY-MM-DD" or empty
  const parts = (value || '').split(' ~ ');
  const from = parts[0] || '';
  const to = parts[1] || '';

  const today = new Date().toISOString().split('T')[0];

  const handleFrom = (e) => onChange(`${e.target.value} ~ ${to}`);
  const handleTo = (e) => onChange(`${from} ~ ${e.target.value}`);

  return (
    <div className="flex flex-col gap-1 min-w-[130px]">
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide px-0.5">From</span>
        <input type="date" value={from} min={today} onChange={handleFrom} className={colClass} />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide px-0.5">To</span>
        <input type="date" value={to} min={from || today} onChange={handleTo} className={colClass} />
      </div>
    </div>
  );
};

const OceanFreightTab = ({ token }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateRow, setShowCreateRow] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [polFilter, setPolFilter] = useState('');
  const [podFilter, setPodFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const emptyForm = { liner: '', polCountry: '', polCity: '', podCountry: '', podCity: '', transitTime: '', availability: '', price20gp: '', price40gp: '', price40hq: '', price40nor: '', price45hq: '', remarks: '' };
  const [newRow, setNewRow] = useState(emptyForm);
  const [editRow, setEditRow] = useState({});

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/freight/ocean-freight/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Error loading ocean freight');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEntries(); }, []);

  const handleCreate = async () => {
    if (!newRow.liner || !newRow.polCity || !newRow.podCity) return toast.error('Liner, POL and POD are required');
    setSaving(true);
    try {
      const payload = {
        ...newRow,
        pol: `${newRow.polCity}${newRow.polCountry ? ` (${newRow.polCountry})` : ''}`,
        pod: `${newRow.podCity}${newRow.podCountry ? ` (${newRow.podCountry})` : ''}`,
      };
      const res = await fetch(`${API_BASE_URL}/freight/ocean-freight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      toast.success('Created');
      setNewRow(emptyForm);
      setShowCreateRow(false);
      fetchEntries();
    } catch {
      toast.error('Failed to create');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id) => {
    setSaving(true);
    try {
      const payload = {
        ...editRow,
        pol: editRow.polCity
          ? `${editRow.polCity}${editRow.polCountry ? ` (${editRow.polCountry})` : ''}`
          : editRow.pol,
        pod: editRow.podCity
          ? `${editRow.podCity}${editRow.podCountry ? ` (${editRow.podCountry})` : ''}`
          : editRow.pod,
      };
      const res = await fetch(`${API_BASE_URL}/freight/ocean-freight/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      toast.success('Updated');
      setEditingId(null);
      fetchEntries();
    } catch {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/freight/ocean-freight/${id}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      fetchEntries();
    } catch {
      toast.error('Failed to toggle');
    }
  };

  const startEdit = (entry) => {
    // Parse "City (Country)" format back into parts
    const parsePort = (val) => {
      if (!val) return { country: '', city: '' };
      const match = val.match(/^(.+?)\s*\((.+)\)$/);
      return match ? { city: match[1].trim(), country: match[2].trim() } : { city: val, country: '' };
    };
    const pol = parsePort(entry.pol);
    const pod = parsePort(entry.pod);
    setEditingId(entry.id);
    setEditRow({
      liner: entry.liner,
      pol: entry.pol, pod: entry.pod,
      polCountry: pol.country, polCity: pol.city,
      podCountry: pod.country, podCity: pod.city,
      transitTime: entry.transit_time || '', availability: entry.availability || '',
      price20gp: entry.price_20gp || '', price40gp: entry.price_40gp || '',
      price40hq: entry.price_40hq || '', price40nor: entry.price_40nor || '',
      price45hq: entry.price_45hq || '',
      remarks: entry.remarks || '', isActive: entry.is_active,
    });
  };

  const colClass = 'border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#243670] w-full';
  const priceColClass = 'border border-gray-200 rounded px-1 py-1 text-xs focus:outline-none focus:border-[#243670] w-16';

  const headers = ['Liners', 'POL', 'POD', 'Transit Time', 'Availability', '20GP', '40GP', '40HQ', '40NOR', '45HQ', 'More Info', ''];

  const filteredEntries = entries.filter(e => {
    const q = search.toLowerCase();
    const matchSearch = !search || e.liner?.toLowerCase().includes(q) || e.pol?.toLowerCase().includes(q) || e.pod?.toLowerCase().includes(q) || e.remarks?.toLowerCase().includes(q);
    const matchPol = !polFilter || e.pol?.toLowerCase().includes(polFilter.toLowerCase());
    const matchPod = !podFilter || e.pod?.toLowerCase().includes(podFilter.toLowerCase());
    const matchStatus = !statusFilter || (statusFilter === 'active' ? e.is_active : !e.is_active);
    return matchSearch && matchPol && matchPod && matchStatus;
  });

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Search liner, POL, POD, remarks..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-300 rounded-full px-4 py-1.5 text-sm focus:outline-none focus:border-[#243670] bg-white w-full sm:w-64"
        />
        <select
          value={polFilter}
          onChange={e => setPolFilter(e.target.value)}
          className="border border-gray-300 rounded-full px-4 py-1.5 text-sm focus:outline-none focus:border-[#243670] bg-white"
        >
          <option value="">All POL</option>
          {[...new Set(entries.map(e => e.pol).filter(Boolean))].map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select
          value={podFilter}
          onChange={e => setPodFilter(e.target.value)}
          className="border border-gray-300 rounded-full px-4 py-1.5 text-sm focus:outline-none focus:border-[#243670] bg-white"
        >
          <option value="">All POD</option>
          {[...new Set(entries.map(e => e.pod).filter(Boolean))].map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-full px-4 py-1.5 text-sm focus:outline-none focus:border-[#243670] bg-white"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        {(search || polFilter || podFilter || statusFilter) && (
          <button
            onClick={() => { setSearch(''); setPolFilter(''); setPodFilter(''); setStatusFilter(''); }}
            className="px-4 py-1.5 rounded-full border border-gray-200 text-gray-500 text-sm hover:bg-gray-50"
          >
            Clear
          </button>
        )}
        <span className="ml-auto text-xs text-gray-400">{filteredEntries.length} entries</span>
        <button
          onClick={() => setShowCreateRow(!showCreateRow)}
          className={`${pill} bg-[#243670] text-white hover:bg-blue-900`}
        >
          {showCreateRow ? 'Cancel' : 'Create Ocean Freight'}
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="overflow-x-auto -mx-3 md:mx-0">
          <div className="min-w-[900px] px-3 md:px-0">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                {headers.map(h => (
                  <th key={h} className="text-left py-3 px-3 font-semibold text-[#243670] text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Create row */}
              {showCreateRow && (
                <tr className="border-b border-gray-100 bg-blue-50/40">
                  <td className="py-2 px-2"><input value={newRow.liner} onChange={e => setNewRow(p => ({ ...p, liner: e.target.value }))} placeholder="Liner" className={colClass} /></td>
                  <td className="py-2 px-2">
                    <PortSelector
                      label="POL" countryVal={newRow.polCountry} cityVal={newRow.polCity}
                      onCountryChange={v => setNewRow(p => ({ ...p, polCountry: v }))}
                      onCityChange={v => setNewRow(p => ({ ...p, polCity: v }))}
                      colClass={colClass}
                    />
                  </td>
                  <td className="py-2 px-2">
                    <PortSelector
                      label="POD" countryVal={newRow.podCountry} cityVal={newRow.podCity}
                      onCountryChange={v => setNewRow(p => ({ ...p, podCountry: v }))}
                      onCityChange={v => setNewRow(p => ({ ...p, podCity: v }))}
                      colClass={colClass}
                    />
                  </td>
                  <td className="py-2 px-2"><input value={newRow.transitTime} onChange={e => setNewRow(p => ({ ...p, transitTime: e.target.value }))} placeholder="Days" className={colClass} /></td>
                  <td className="py-2 px-2">
                    <DateRangePicker value={newRow.availability} onChange={v => setNewRow(p => ({ ...p, availability: v }))} colClass={colClass} />
                  </td>
                  <td className="py-2 px-2"><input type="number" value={newRow.price20gp} onChange={e => setNewRow(p => ({ ...p, price20gp: e.target.value }))} placeholder="Price" className={priceColClass} /></td>
                  <td className="py-2 px-2"><input type="number" value={newRow.price40gp} onChange={e => setNewRow(p => ({ ...p, price40gp: e.target.value }))} placeholder="Price" className={priceColClass} /></td>
                  <td className="py-2 px-2"><input type="number" value={newRow.price40hq} onChange={e => setNewRow(p => ({ ...p, price40hq: e.target.value }))} placeholder="Price" className={priceColClass} /></td>
                  <td className="py-2 px-2"><input type="number" value={newRow.price40nor} onChange={e => setNewRow(p => ({ ...p, price40nor: e.target.value }))} placeholder="Price" className={priceColClass} /></td>
                  <td className="py-2 px-2"><input type="number" value={newRow.price45hq} onChange={e => setNewRow(p => ({ ...p, price45hq: e.target.value }))} placeholder="Price" className={priceColClass} /></td>
                  <td className="py-2 px-2"><input value={newRow.remarks} onChange={e => setNewRow(p => ({ ...p, remarks: e.target.value }))} placeholder="Notes" className={colClass} /></td>
                  <td className="py-2 px-2">
                    <button onClick={handleCreate} disabled={saving} className={`${pill} bg-[#243670] text-white text-xs hover:bg-blue-900 disabled:opacity-50`}>
                      {saving ? '...' : 'Create'}
                    </button>
                  </td>
                </tr>
              )}

              {entries.length === 0 && !showCreateRow && (
                <tr><td colSpan={12} className="text-center py-10 text-gray-400">No ocean freight entries yet</td></tr>
              )}

              {filteredEntries.length === 0 && entries.length > 0 && !showCreateRow && (
                <tr><td colSpan={12} className="text-center py-10 text-gray-400">No results match your filters</td></tr>
              )}

              {filteredEntries.map(entry => (
                <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  {editingId === entry.id ? (
                    <>
                      <td className="py-2 px-2"><input value={editRow.liner} onChange={e => setEditRow(p => ({ ...p, liner: e.target.value }))} className={colClass} /></td>
                      <td className="py-2 px-2">
                        <PortSelector
                          label="POL" countryVal={editRow.polCountry || ''} cityVal={editRow.polCity || ''}
                          onCountryChange={v => setEditRow(p => ({ ...p, polCountry: v }))}
                          onCityChange={v => setEditRow(p => ({ ...p, polCity: v }))}
                          colClass={colClass}
                        />
                      </td>
                      <td className="py-2 px-2">
                        <PortSelector
                          label="POD" countryVal={editRow.podCountry || ''} cityVal={editRow.podCity || ''}
                          onCountryChange={v => setEditRow(p => ({ ...p, podCountry: v }))}
                          onCityChange={v => setEditRow(p => ({ ...p, podCity: v }))}
                          colClass={colClass}
                        />
                      </td>
                      <td className="py-2 px-2"><input value={editRow.transitTime} onChange={e => setEditRow(p => ({ ...p, transitTime: e.target.value }))} className={colClass} /></td>
                      <td className="py-2 px-2">
                        <DateRangePicker value={editRow.availability} onChange={v => setEditRow(p => ({ ...p, availability: v }))} colClass={colClass} />
                      </td>
                      <td className="py-2 px-2"><input type="number" value={editRow.price20gp} onChange={e => setEditRow(p => ({ ...p, price20gp: e.target.value }))} className={priceColClass} /></td>
                      <td className="py-2 px-2"><input type="number" value={editRow.price40gp} onChange={e => setEditRow(p => ({ ...p, price40gp: e.target.value }))} className={priceColClass} /></td>
                      <td className="py-2 px-2"><input type="number" value={editRow.price40hq} onChange={e => setEditRow(p => ({ ...p, price40hq: e.target.value }))} className={priceColClass} /></td>
                      <td className="py-2 px-2"><input type="number" value={editRow.price40nor} onChange={e => setEditRow(p => ({ ...p, price40nor: e.target.value }))} className={priceColClass} /></td>
                      <td className="py-2 px-2"><input type="number" value={editRow.price45hq} onChange={e => setEditRow(p => ({ ...p, price45hq: e.target.value }))} className={priceColClass} /></td>
                      <td className="py-2 px-2"><input value={editRow.remarks} onChange={e => setEditRow(p => ({ ...p, remarks: e.target.value }))} className={colClass} /></td>
                      <td className="py-2 px-2 flex gap-1">
                        <button onClick={() => handleUpdate(entry.id)} disabled={saving} className={`${pill} bg-[#243670] text-white text-xs hover:bg-blue-900 disabled:opacity-50`}>Save</button>
                        <button onClick={() => setEditingId(null)} className={`${pill} bg-gray-200 text-gray-700 text-xs hover:bg-gray-300`}>Cancel</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3 px-3 text-gray-800">{entry.liner}</td>
                      <td className="py-3 px-3 text-gray-700">{entry.pol}</td>
                      <td className="py-3 px-3 text-gray-700">{entry.pod}</td>
                      <td className="py-3 px-3 text-gray-600">{entry.transit_time || '—'}</td>
                      <td className="py-3 px-3 text-gray-600">{entry.availability || '—'}</td>
                      <td className="py-3 px-3 text-gray-800 font-medium">{entry.price_20gp ? `$${entry.price_20gp}` : '—'}</td>
                      <td className="py-3 px-3 text-gray-800 font-medium">{entry.price_40gp ? `$${entry.price_40gp}` : '—'}</td>
                      <td className="py-3 px-3 text-gray-800 font-medium">{entry.price_40hq ? `$${entry.price_40hq}` : '—'}</td>
                      <td className="py-3 px-3 text-gray-800 font-medium">{entry.price_40nor ? `$${entry.price_40nor}` : '—'}</td>
                      <td className="py-3 px-3 text-gray-800 font-medium">{entry.price_45hq ? `$${entry.price_45hq}` : '—'}</td>
                      <td className="py-3 px-3 text-gray-500 text-xs">{entry.remarks || '—'}</td>
                      <td className="py-3 px-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(entry)}
                            className={`${pill} bg-[#243670] text-white text-xs hover:bg-blue-900`}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggle(entry.id)}
                            className={`${pill} text-xs ${entry.is_active ? 'bg-gray-200 text-gray-600 hover:bg-gray-300' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                          >
                            {entry.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Payment Details Tab ──────────────────────────────────────────────────────
const PaymentDetailsTab = ({ token }) => {
  const [form, setForm] = useState({
    bankName: '', branchName: '', accountHolder: '', accountNumber: '',
    iban: '', swiftCode: '', paymentInstructions: '', paypalEmail: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/freight/agent/payment-details`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json()).then(data => {
      setForm({
        bankName: data.bank_name || '',
        branchName: data.branch_name || '',
        accountHolder: data.account_holder || '',
        accountNumber: data.account_number || '',
        iban: data.iban || '',
        swiftCode: data.swift_code || '',
        paymentInstructions: data.payment_instructions || '',
        paypalEmail: data.paypal_email || '',
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/freight/agent/payment-details`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success('Payment details saved');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const inp = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#243670]';
  const label = 'text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block';

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Bank Details */}
      <div className="border border-gray-200 rounded-2xl p-6 space-y-4">
        <p className="font-bold text-gray-800 text-sm uppercase tracking-widest">🏦 Bank Details</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={label}>Bank Name *</label>
            <input value={form.bankName} onChange={e => setForm(p => ({ ...p, bankName: e.target.value }))} className={inp} placeholder="e.g. National Bank of Bahrain" />
          </div>
          <div>
            <label className={label}>Branch Name *</label>
            <input value={form.branchName} onChange={e => setForm(p => ({ ...p, branchName: e.target.value }))} className={inp} placeholder="e.g. Manama Branch" />
          </div>
          <div>
            <label className={label}>Account Holder Name *</label>
            <input value={form.accountHolder} onChange={e => setForm(p => ({ ...p, accountHolder: e.target.value }))} className={inp} placeholder="Full name on account" />
          </div>
          <div>
            <label className={label}>Account Number *</label>
            <input value={form.accountNumber} onChange={e => setForm(p => ({ ...p, accountNumber: e.target.value }))} className={inp} placeholder="Account number" />
          </div>
          <div>
            <label className={label}>IBAN Number *</label>
            <input value={form.iban} onChange={e => setForm(p => ({ ...p, iban: e.target.value }))} className={inp} placeholder="e.g. BH29BMAG1299123456BH00" />
          </div>
          <div>
            <label className={label}>SWIFT Code *</label>
            <input value={form.swiftCode} onChange={e => setForm(p => ({ ...p, swiftCode: e.target.value }))} className={inp} placeholder="e.g. NBOBBHBM" />
          </div>
        </div>
        <div>
          <label className={label}>Payment Instructions (Optional)</label>
          <textarea value={form.paymentInstructions} onChange={e => setForm(p => ({ ...p, paymentInstructions: e.target.value }))} rows={2} className={inp} placeholder="Any special instructions for the admin..." />
        </div>
        <p className="text-xs text-gray-400">Please provide both IBAN number and SWIFT code for all bank transfers.</p>
      </div>

      {/* PayPal Details */}
      <div className="border border-gray-200 rounded-2xl p-6 space-y-4">
        <p className="font-bold text-gray-800 text-sm uppercase tracking-widest">💳 PayPal Details</p>
        <div>
          <label className={label}>PayPal Email</label>
          <input type="email" value={form.paypalEmail} onChange={e => setForm(p => ({ ...p, paypalEmail: e.target.value }))} className={inp} placeholder="your-paypal@email.com" />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className={`${pill} bg-[#243670] text-white hover:bg-blue-900 disabled:opacity-50 w-full py-3`}
      >
        {saving ? 'Saving...' : 'Save Payment Details'}
      </button>
    </div>
  );
};

// ─── Main Agent Dashboard ─────────────────────────────────────────────────────
const AgentDashboard = () => {
  const [activeTab, setActiveTab] = useState('bookings');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();

  const agentInfo = JSON.parse(localStorage.getItem('agentInfo') || '{}');
  const token = localStorage.getItem('agentToken');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/freight/agent/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Error loading requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchRequests();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('agentToken');
    localStorage.removeItem('agentInfo');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-4 md:px-8 py-3 md:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Tab toggle */}
          <button
            onClick={() => setActiveTab('bookings')}
            className={`${pill} text-xs md:text-sm ${activeTab === 'bookings' ? 'bg-[#243670] text-white' : 'border border-rose-300 text-[#243670] hover:bg-blue-50'}`}
          >
            Bookings
          </button>
          <button
            onClick={() => setActiveTab('ocean')}
            className={`${pill} text-xs md:text-sm ${activeTab === 'ocean' ? 'bg-[#243670] text-white' : 'border border-rose-300 text-[#243670] hover:bg-blue-50'}`}
          >
            Ocean Freight
          </button>
          <button
            onClick={() => setActiveTab('payment')}
            className={`${pill} text-xs md:text-sm ${activeTab === 'payment' ? 'bg-[#243670] text-white' : 'border border-rose-300 text-[#243670] hover:bg-blue-50'}`}
          >
            Payment Details
          </button>
        </div>

        <button
          onClick={() => setShowLogoutConfirm(true)}
          className={`${pill} bg-[#243670] text-white hover:bg-blue-900 text-xs md:text-sm self-end sm:self-auto`}
        >
          Logout
        </button>
      </div>

      {/* Logout confirmation modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center">
            <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-[#243670] text-2xl">👋</span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Confirm Logout</h3>
            <p className="text-gray-500 text-sm mb-6">Are you sure you want to log out of your agent account?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-full border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 rounded-full bg-[#243670] text-white text-sm font-semibold hover:bg-blue-900 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-3 md:px-8 py-4 md:py-6">
        {activeTab === 'bookings' && (
          <BookingsTab
            requests={requests}
            loading={loading}
            onSelectRequest={setSelectedRequest}
            onRefresh={fetchRequests}
            token={token}
          />
        )}
        {activeTab === 'ocean' && (
          <OceanFreightTab token={token} />
        )}
        {activeTab === 'payment' && (
          <PaymentDetailsTab token={token} />
        )}
      </div>

      {selectedRequest && (
        <PriceModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onRefresh={fetchRequests}
        />
      )}
    </div>
  );
};

export default AgentDashboard;

