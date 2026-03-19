import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/apiConfig';
import toast from 'react-hot-toast';
import { FiEye, FiSend, FiTrash2, FiX, FiCheck, FiDollarSign, FiUser } from 'react-icons/fi';

const STATUS_COLORS = {
  submitted: 'bg-blue-100 text-blue-700',
  admin_review: 'bg-yellow-100 text-yellow-700',
  forwarded_to_agent: 'bg-purple-100 text-purple-700',
  agent_priced: 'bg-orange-100 text-orange-700',
  commission_added: 'bg-indigo-100 text-indigo-700',
  sent_to_user: 'bg-cyan-100 text-cyan-700',
  user_approved: 'bg-teal-100 text-teal-700',
  payment_requested: 'bg-pink-100 text-pink-700',
  payment_completed: 'bg-green-100 text-green-700',
  in_progress: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-700',
};

const STATUS_LABELS = {
  submitted: 'Submitted',
  admin_review: 'Admin Review',
  forwarded_to_agent: 'Forwarded to Agent',
  agent_priced: 'Agent Priced',
  commission_added: 'Commission Added',
  sent_to_user: 'Sent to User',
  user_approved: 'User Approved',
  payment_requested: 'Payment Requested',
  payment_completed: 'Payment Completed',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

// ─── Detail Modal ─────────────────────────────────────────────────────────────
const DetailModal = ({ request, agents, onClose, onRefresh }) => {
  const [agentId, setAgentId] = useState(request.assigned_agent_id || '');
  const [adminNotes, setAdminNotes] = useState(request.admin_notes || '');
  const [commissionType, setCommissionType] = useState(request.commission_type || 'percentage');
  const [commissionValue, setCommissionValue] = useState(request.commission_value || '');
  const [finalPrice, setFinalPrice] = useState(request.final_price || '');
  const finalCurrency = 'USD';
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem('adminToken');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const autoCalcFinal = () => {
    if (!request.agent_price || !commissionValue) return;
    const base = parseFloat(request.agent_price);
    const val = parseFloat(commissionValue);
    if (commissionType === 'percentage') {
      setFinalPrice((base + (base * val / 100)).toFixed(2));
    } else {
      setFinalPrice((base + val).toFixed(2));
    }
  };

  const handleForward = async () => {
    if (!agentId) return toast.error('Please select an agent');
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/freight/${request.id}/forward-to-agent`, {
        method: 'PATCH', headers,
        body: JSON.stringify({ agentId, adminNotes })
      });
      if (!res.ok) throw new Error();
      toast.success('Forwarded to agent');
      onRefresh(); onClose();
    } catch { toast.error('Failed to forward'); }
    finally { setSaving(false); }
  };

  const handleAddCommission = async () => {
    if (!finalPrice) return toast.error('Please set a final price');
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/freight/${request.id}/add-commission`, {
        method: 'PATCH', headers,
        body: JSON.stringify({ commissionType, commissionValue, finalPrice, finalCurrency, adminNotes })
      });
      if (!res.ok) throw new Error();
      toast.success('Commission added & sent to user');
      onRefresh(); onClose();
    } catch { toast.error('Failed to add commission'); }
    finally { setSaving(false); }
  };

  const handleSendPaymentRequest = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/freight/${request.id}/send-payment-request`, {
        method: 'PATCH', headers, body: JSON.stringify({})
      });
      if (!res.ok) throw new Error();
      toast.success('Payment request sent');
      onRefresh(); onClose();
    } catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  const handleMarkPaid = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/freight/${request.id}/mark-payment-completed`, {
        method: 'PATCH', headers, body: JSON.stringify({})
      });
      if (!res.ok) throw new Error();
      toast.success('Payment marked as completed — moved to Bookings');
      onRefresh(); onClose();
    } catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-[#243670]">Request Details</h2>
            <span className="text-sm font-mono text-amber-600">{request.reference_id}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[request.status]}`}>
              {STATUS_LABELS[request.status]}
            </span>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500"><FiX /></button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* User Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-xl">
            <div><p className="text-xs text-gray-500">Company</p><p className="font-semibold text-[#243670]">{request.company}</p></div>
            <div><p className="text-xs text-gray-500">Name</p><p className="font-semibold text-[#243670]">{request.name}</p></div>
            <div><p className="text-xs text-gray-500">Email</p><p className="font-semibold text-[#243670]">{request.email}</p></div>
            <div><p className="text-xs text-gray-500">Phone</p><p className="font-semibold text-[#243670]">{request.telephone}</p></div>
          </div>

          {/* Shipment Route */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 rounded-xl">
            <div><p className="text-xs text-gray-500">Port of Loading</p><p className="font-semibold text-[#243670]">{request.port_of_loading_city}, {request.port_of_loading}</p></div>
            <div><p className="text-xs text-gray-500">Port of Discharge</p><p className="font-semibold text-[#243670]">{request.port_of_discharge_city}, {request.port_of_discharge}</p></div>
            <div><p className="text-xs text-gray-500">Mode</p><p className="font-semibold text-[#243670]">{request.mode_of_shipment}</p></div>
            <div><p className="text-xs text-gray-500">Commodity</p><p className="font-semibold text-[#243670]">{request.commodity}</p></div>
          </div>

          {/* Cargo Details */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-amber-50 rounded-xl">
            <div><p className="text-xs text-gray-500">Gross Weight</p><p className="font-semibold text-[#243670]">{request.gross_weight} {request.weight_unit}</p></div>
            <div><p className="text-xs text-gray-500">Boxes/Pallets</p><p className="font-semibold text-[#243670]">{request.boxes_pallets}</p></div>
            <div><p className="text-xs text-gray-500">Box/Pallet Size</p><p className="font-semibold text-[#243670]">{request.box_pallet_size} {request.box_pallet_unit}</p></div>
            <div><p className="text-xs text-gray-500">Dimensions (LxWxH)</p><p className="font-semibold text-[#243670]">{request.length_dim} x {request.width_dim} x {request.height_dim} {request.dimension_unit}</p></div>
          </div>

          {request.message && (
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">Message</p>
              <p className="text-[#243670]">{request.message}</p>
            </div>
          )}

          {/* Agent Price (if submitted) */}
          {request.agent_price && (
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
              <p className="text-xs text-gray-500 mb-1">Agent Price</p>
              <p className="text-2xl font-bold text-purple-700">USD {parseFloat(request.agent_price).toLocaleString()}</p>
              {request.agent_notes && <p className="text-sm text-gray-600 mt-1">{request.agent_notes}</p>}
            </div>
          )}

          {/* Final Price (if set) */}
          {request.final_price && (
            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
              <p className="text-xs text-gray-500 mb-1">Final Price (with commission)</p>
              <p className="text-2xl font-bold text-green-700">USD {parseFloat(request.final_price).toLocaleString()}</p>
            </div>
          )}

          {/* Admin Notes */}
          <div>
            <label className="text-sm font-semibold text-[#243670] block mb-1">Admin Notes</label>
            <textarea
              value={adminNotes}
              onChange={e => setAdminNotes(e.target.value)}
              rows={2}
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-amber-400"
              placeholder="Internal notes..."
            />
          </div>

          {/* Action: Forward to Agent */}
          {['submitted', 'admin_review'].includes(request.status) && (
            <div className="p-4 border-2 border-dashed border-purple-200 rounded-xl space-y-3">
              <h3 className="font-semibold text-[#243670] flex items-center gap-2"><FiSend /> Forward to Agent</h3>
              <select
                value={agentId}
                onChange={e => setAgentId(e.target.value)}
                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-amber-400"
              >
                <option value="">Select Agent</option>
                {agents.map(a => <option key={a.id} value={a.id}>{a.name} — {a.company || a.email}</option>)}
              </select>
              <button
                onClick={handleForward}
                disabled={saving}
                className="w-full bg-[#243670] text-white py-2.5 rounded-lg font-semibold hover:bg-[#1a2a5e] transition-colors disabled:opacity-50"
              >
                {saving ? 'Forwarding...' : 'Forward to Agent'}
              </button>
            </div>
          )}

          {/* Action: Add Commission */}
          {request.status === 'agent_priced' && (
            <div className="p-4 border-2 border-dashed border-amber-200 rounded-xl space-y-3">
              <h3 className="font-semibold text-[#243670] flex items-center gap-2"><FiDollarSign /> Add Commission & Send to User</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Commission Type</label>
                  <select value={commissionType} onChange={e => setCommissionType(e.target.value)} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-amber-400">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Commission Value</label>
                  <input type="number" value={commissionValue} onChange={e => setCommissionValue(e.target.value)} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-amber-400" placeholder="e.g. 10" />
                </div>
              </div>
              <button onClick={autoCalcFinal} type="button" className="text-sm text-amber-600 underline">Auto-calculate final price</button>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Final Price</label>
                  <input type="number" value={finalPrice} onChange={e => setFinalPrice(e.target.value)} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-amber-400" placeholder="Final amount" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Currency</label>
                  <div className="w-full border border-gray-200 rounded-lg p-2.5 text-sm bg-gray-50 text-gray-500">USD</div>
                </div>
              </div>
              <button
                onClick={handleAddCommission}
                disabled={saving}
                className="w-full bg-amber-500 text-white py-2.5 rounded-lg font-semibold hover:bg-amber-600 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Add Commission & Send to User'}
              </button>
            </div>
          )}

          {/* Action: Send Payment Request */}
          {request.status === 'user_approved' && (
            <button
              onClick={handleSendPaymentRequest}
              disabled={saving}
              className="w-full bg-pink-500 text-white py-2.5 rounded-lg font-semibold hover:bg-pink-600 transition-colors disabled:opacity-50"
            >
              {saving ? 'Sending...' : 'Send Payment Request to User'}
            </button>
          )}

          {/* Action: Mark Payment Completed */}
          {request.status === 'payment_requested' && (
            <button
              onClick={handleMarkPaid}
              disabled={saving}
              className="w-full bg-green-500 text-white py-2.5 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FiCheck /> {saving ? 'Saving...' : 'Mark Payment Completed'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Leads Manager ───────────────────────────────────────────────────────
const LeadsManager = () => {
  const [leads, setLeads] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const token = localStorage.getItem('adminToken');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leadsRes, agentsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/freight/leads`, { headers }),
        fetch(`${API_BASE_URL}/freight/agents/list`, { headers })
      ]);
      const leadsData = await leadsRes.json();
      const agentsData = await agentsRes.json();
      setLeads(Array.isArray(leadsData) ? leadsData : []);
      setAgents(Array.isArray(agentsData) ? agentsData : []);
    } catch { toast.error('Error loading data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this lead?')) return;
    try {
      await fetch(`${API_BASE_URL}/freight/${id}`, { method: 'DELETE', headers });
      toast.success('Deleted');
      fetchData();
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = filterStatus === 'all' ? leads : leads.filter(l => l.status === filterStatus);

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-[#243670] p-8 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-30" style={{
        backgroundImage: 'radial-gradient(#243670 0.5px, transparent 0.5px), radial-gradient(#243670 0.5px, #F0F4F8 0.5px)',
        backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px'
      }} />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-5xl font-light tracking-widest uppercase text-[#243670]">Leads</h1>
          <p className="text-gray-500 mt-1">Price inquiries from users</p>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['all', ...Object.keys(STATUS_LABELS)].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filterStatus === s ? 'bg-[#243670] text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {s === 'all' ? 'All' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading leads...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-xl">No leads found</p>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-[#243670]/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#243670] text-white">
                  <th className="text-left p-4 font-semibold">Ref ID</th>
                  <th className="text-left p-4 font-semibold">Company</th>
                  <th className="text-left p-4 font-semibold">Route</th>
                  <th className="text-left p-4 font-semibold">Mode</th>
                  <th className="text-left p-4 font-semibold">Agent</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-left p-4 font-semibold">Date</th>
                  <th className="text-left p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead, i) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelected(lead)}
                    className={`cursor-pointer hover:bg-amber-50 transition-colors border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                  >
                    <td className="p-4 font-mono text-amber-600 font-semibold">{lead.reference_id}</td>
                    <td className="p-4">
                      <div className="font-semibold">{lead.company}</div>
                      <div className="text-gray-400 text-xs">{lead.name}</div>
                    </td>
                    <td className="p-4 text-xs">
                      <div>{lead.port_of_loading_city}</div>
                      <div className="text-gray-400">→ {lead.port_of_discharge_city}</div>
                    </td>
                    <td className="p-4">{lead.mode_of_shipment}</td>
                    <td className="p-4 text-xs">{lead.agent_name || <span className="text-gray-400">Unassigned</span>}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[lead.status]}`}>
                        {STATUS_LABELS[lead.status]}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-gray-500">{new Date(lead.created_at).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button onClick={e => { e.stopPropagation(); setSelected(lead); }} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"><FiEye size={14} /></button>
                        <button onClick={e => handleDelete(lead.id, e)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"><FiTrash2 size={14} /></button>
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
        <DetailModal
          request={selected}
          agents={agents}
          onClose={() => setSelected(null)}
          onRefresh={fetchData}
        />
      )}
    </div>
  );
};

export default LeadsManager;
