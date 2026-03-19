import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/apiConfig';
import toast from 'react-hot-toast';
import { FiEye, FiTrash2, FiX } from 'react-icons/fi';

const STATUS_COLORS = {
  payment_completed: 'bg-green-100 text-green-700',
  in_progress: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-700',
};

const STATUS_LABELS = {
  payment_completed: 'Payment Completed',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const BookingDetailModal = ({ booking, onClose, onRefresh }) => {
  const [status, setStatus] = useState(booking.status);
  const [adminNotes, setAdminNotes] = useState(booking.admin_notes || '');
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem('adminToken');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const handleUpdateStatus = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/freight/${booking.id}/status`, {
        method: 'PATCH', headers,
        body: JSON.stringify({ status, adminNotes })
      });
      if (!res.ok) throw new Error();
      toast.success('Status updated');
      onRefresh(); onClose();
    } catch { toast.error('Failed to update'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-[#243670]">Booking Details</h2>
            <span className="text-sm font-mono text-amber-600">{booking.reference_id}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[booking.status] || 'bg-gray-100 text-gray-700'}`}>
              {STATUS_LABELS[booking.status] || booking.status}
            </span>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500"><FiX /></button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-xl">
            <div><p className="text-xs text-gray-500">Company</p><p className="font-semibold text-[#243670]">{booking.company}</p></div>
            <div><p className="text-xs text-gray-500">Name</p><p className="font-semibold text-[#243670]">{booking.name}</p></div>
            <div><p className="text-xs text-gray-500">Email</p><p className="font-semibold text-[#243670]">{booking.email}</p></div>
            <div><p className="text-xs text-gray-500">Phone</p><p className="font-semibold text-[#243670]">{booking.telephone}</p></div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 rounded-xl">
            <div><p className="text-xs text-gray-500">Port of Loading</p><p className="font-semibold text-[#243670]">{booking.port_of_loading_city}, {booking.port_of_loading}</p></div>
            <div><p className="text-xs text-gray-500">Port of Discharge</p><p className="font-semibold text-[#243670]">{booking.port_of_discharge_city}, {booking.port_of_discharge}</p></div>
            <div><p className="text-xs text-gray-500">Mode</p><p className="font-semibold text-[#243670]">{booking.mode_of_shipment}</p></div>
            <div><p className="text-xs text-gray-500">Commodity</p><p className="font-semibold text-[#243670]">{booking.commodity}</p></div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 bg-amber-50 rounded-xl">
            <div><p className="text-xs text-gray-500">Agent Price</p><p className="font-bold text-purple-700">USD {booking.agent_price ? parseFloat(booking.agent_price).toLocaleString() : '—'}</p></div>
            <div><p className="text-xs text-gray-500">Final Price (with commission)</p><p className="font-bold text-green-700">USD {booking.final_price ? parseFloat(booking.final_price).toLocaleString() : '—'}</p></div>
            <div><p className="text-xs text-gray-500">Agent</p><p className="font-semibold text-[#243670]">{booking.agent_name || '—'}</p></div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold text-[#243670] block mb-1">Update Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-amber-400">
                {Object.entries(STATUS_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-[#243670] block mb-1">Admin Notes</label>
              <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} rows={2} className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-amber-400" />
            </div>
            <button onClick={handleUpdateStatus} disabled={saving} className="w-full bg-[#243670] text-white py-2.5 rounded-lg font-semibold hover:bg-[#1a2a5e] transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : 'Update Status'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BookingsManager = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const token = localStorage.getItem('adminToken');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/freight/bookings`, { headers });
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch { toast.error('Error loading bookings'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this booking?')) return;
    try {
      await fetch(`${API_BASE_URL}/freight/${id}`, { method: 'DELETE', headers });
      toast.success('Deleted');
      fetchBookings();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-[#243670] p-8 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-30" style={{
        backgroundImage: 'radial-gradient(#243670 0.5px, transparent 0.5px), radial-gradient(#243670 0.5px, #F0F4F8 0.5px)',
        backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px'
      }} />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-5xl font-light tracking-widest uppercase text-[#243670]">Bookings</h1>
          <p className="text-gray-500 mt-1">Confirmed cargo bookings</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <div key={key} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-[#243670]/10 shadow">
              <p className="text-2xl font-bold text-[#243670]">{bookings.filter(b => b.status === key).length}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-xl">No bookings yet</p>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-[#243670]/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#243670] text-white">
                  <th className="text-left p-4 font-semibold">Ref ID</th>
                  <th className="text-left p-4 font-semibold">Company</th>
                  <th className="text-left p-4 font-semibold">Route</th>
                  <th className="text-left p-4 font-semibold">Final Price</th>
                  <th className="text-left p-4 font-semibold">Agent</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-left p-4 font-semibold">Date</th>
                  <th className="text-left p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b, i) => (
                  <tr
                    key={b.id}
                    onClick={() => setSelected(b)}
                    className={`cursor-pointer hover:bg-amber-50 transition-colors border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                  >
                    <td className="p-4 font-mono text-amber-600 font-semibold">{b.reference_id}</td>
                    <td className="p-4">
                      <div className="font-semibold">{b.company}</div>
                      <div className="text-gray-400 text-xs">{b.name}</div>
                    </td>
                    <td className="p-4 text-xs">
                      <div>{b.port_of_loading_city}</div>
                      <div className="text-gray-400">→ {b.port_of_discharge_city}</div>
                    </td>
                    <td className="p-4 font-bold text-green-700">
                      {b.final_price ? `USD ${parseFloat(b.final_price).toLocaleString()}` : '—'}
                    </td>
                    <td className="p-4 text-xs">{b.agent_name || '—'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[b.status] || 'bg-gray-100 text-gray-700'}`}>
                        {STATUS_LABELS[b.status] || b.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-gray-500">{new Date(b.created_at).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button onClick={e => { e.stopPropagation(); setSelected(b); }} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"><FiEye size={14} /></button>
                        <button onClick={e => handleDelete(b.id, e)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"><FiTrash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <BookingDetailModal booking={selected} onClose={() => setSelected(null)} onRefresh={fetchBookings} />
      )}
    </div>
  );
};

export default BookingsManager;
