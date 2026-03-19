import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../config/apiConfig';
import toast from 'react-hot-toast';
import FreightRequestDetail from '../../../components/FreightRequestDetail/FreightRequestDetail';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';

const STATUS_CFG = {
  submitted:                    { color: 'text-gray-500',    dot: 'bg-gray-400',    label: 'Submitted' },
  forwarded_to_agent:           { color: 'text-purple-500',  dot: 'bg-purple-500',  label: 'Forwarded to Agent' },
  agent_priced:                 { color: 'text-indigo-500',  dot: 'bg-indigo-500',  label: 'Agent Priced' },
  sent_to_user:                 { color: 'text-amber-500',   dot: 'bg-amber-500',   label: 'Sent to User' },
  user_approved:                { color: 'text-blue-500',    dot: 'bg-blue-500',    label: 'User Approved' },
  payment_requested:            { color: 'text-orange-500',  dot: 'bg-orange-500',  label: 'Payment Requested' },
  payment_proof_submitted:      { color: 'text-yellow-600',  dot: 'bg-yellow-500',  label: 'Proof Submitted ⏳' },
  payment_completed:            { color: 'text-green-600',   dot: 'bg-green-600',   label: 'User Paid ✓' },
  agent_payment_requested:      { color: 'text-orange-500',    dot: 'bg-orange-500',    label: 'Agent Requesting Pay' },
  agent_payment_sent:           { color: 'text-blue-500',    dot: 'bg-blue-500',    label: 'Payment Sent to Agent' },
  in_progress:                  { color: 'text-emerald-500', dot: 'bg-emerald-500', label: 'In Progress' },
  completed:                    { color: 'text-green-600',   dot: 'bg-green-600',   label: 'Completed' },
  cancelled:                    { color: 'text-red-500',     dot: 'bg-red-500',     label: 'Cancelled' },
};

const EDITABLE_OPTIONS = [
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed',   label: 'Completed' },
  { value: 'cancelled',   label: 'Cancelled' },
];

const LOCKED_STATUSES = ['user_approved', 'payment_requested', 'payment_proof_submitted', 'payment_completed', 'agent_payment_requested', 'agent_payment_sent', 'in_progress'];

const CancelModal = ({ booking, onConfirm, onClose, saving }) => {
  const [reason, setReason] = useState('');
  const [feeInfo, setFeeInfo] = useState(null);
  const token = localStorage.getItem('adminToken');

  // Fetch cancellation fee from settings when modal opens
  useEffect(() => {
    const hasPaid = ['payment_completed', 'agent_payment_requested', 'agent_payment_completed', 'in_progress'].includes(booking?.status);
    if (!hasPaid || !booking?.final_price) return;

    Promise.all([
      fetch(`${API_BASE_URL}/settings/cancellation_fees`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API_BASE_URL}/settings/cancellation_fees_type`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([feeData, typeData]) => {
      const feeVal = parseFloat(feeData.value) || 0;
      const feeType = typeData.value || 'fixed';
      const total = parseFloat(booking.final_price);
      const fee = feeType === 'percentage'
        ? parseFloat(((feeVal / 100) * total).toFixed(2))
        : feeVal;
      const label = feeType === 'percentage' ? `${feeVal}%` : null;
      setFeeInfo({ fee, refund: Math.max(0, parseFloat((total - fee).toFixed(2))), currency: 'USD', label });
    }).catch(() => {});
  }, [booking]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
        <p className="font-bold text-gray-800">Cancel Booking</p>
        <p className="text-sm text-gray-500">Please provide a reason. It will be emailed to the customer, agent, and admin.</p>

        {/* Fee breakdown — only shown if user already paid */}
        {feeInfo && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-1.5 text-sm">
            <p className="font-semibold text-red-700 mb-2">Cancellation Fee Breakdown</p>
            <div className="flex justify-between text-gray-600">
              <span>Amount Paid</span>
              <span className="font-semibold">{feeInfo.currency} {parseFloat(booking.final_price).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>Cancellation Fee{feeInfo.label ? ` (${feeInfo.label})` : ''}</span>
              <span className="font-semibold">− {feeInfo.currency} {feeInfo.fee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-green-700 border-t border-red-200 pt-1.5 mt-1">
              <span className="font-semibold">Refund to Customer</span>
              <span className="font-bold">{feeInfo.currency} {feeInfo.refund.toLocaleString()}</span>
            </div>
          </div>
        )}

        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Reason for cancellation..."
          rows={4}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#243670] resize-none"
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 rounded-full border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50">
            Back
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={saving || !reason.trim()}
            className="flex-1 py-2 rounded-full bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-50"
          >
            {saving ? 'Cancelling...' : 'Confirm Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
};

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [agentPayDetails, setAgentPayDetails] = useState(null);
  const [payAgentMethod, setPayAgentMethod] = useState('paypal');
  const [payAgentFile, setPayAgentFile] = useState(null);
  const [payAgentSaving, setPayAgentSaving] = useState(false);

  const token = localStorage.getItem('adminToken');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/freight/bookings`, { headers });
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setBookings(list);
      if (list.length > 0 && !selected) {
        const first = list[0];
        setSelected(first);
        setNewStatus(first.status);
        if (first.status === 'agent_payment_requested' && first.assigned_agent_id) {
          fetch(`${API_BASE_URL}/freight/agents/${first.assigned_agent_id}/payment-details`, { headers })
            .then(r => r.json()).then(setAgentPayDetails).catch(() => {});
        }
      } else if (selected) {
        // Refresh selected booking data
        const refreshed = list.find(b => b.id === selected.id);
        if (refreshed) {
          setSelected(refreshed);
          setNewStatus(refreshed.status);
          if (refreshed.status === 'agent_payment_requested' && refreshed.assigned_agent_id) {
            fetch(`${API_BASE_URL}/freight/agents/${refreshed.assigned_agent_id}/payment-details`, { headers })
              .then(r => r.json()).then(setAgentPayDetails).catch(() => {});
          }
        }
      }
    } catch {
      toast.error('Error loading bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleSelect = (b) => {
    setSelected(b);
    setNewStatus(b.status);
    setAgentPayDetails(null);
    setPayAgentMethod('paypal');
    setPayAgentFile(null);
    if ((b.status === 'agent_payment_requested') && b.assigned_agent_id) {
      fetch(`${API_BASE_URL}/freight/agents/${b.assigned_agent_id}/payment-details`, { headers })
        .then(r => r.json()).then(setAgentPayDetails).catch(() => {});
    }
  };

  const isLocked = selected && LOCKED_STATUSES.includes(selected.status);
  const isCancelled = selected?.status === 'cancelled';

  const handleUpdateStatus = async () => {
    if (!selected || !newStatus || isLocked || isCancelled) return;
    if (newStatus === 'cancelled') { setShowCancelModal(true); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/freight/${selected.id}/status`, {
        method: 'PATCH', headers, body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success('Status updated');
      fetchBookings();
    } catch {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (reason) => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/freight/${selected.id}/cancel`, {
        method: 'PATCH', headers, body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error();
      toast.success('Booking cancelled — emails sent');
      setShowCancelModal(false);
      fetchBookings();
    } catch {
      toast.error('Failed to cancel');
    } finally {
      setSaving(false);
    }
  };

  const q = search.toLowerCase();

  const handleConfirmUserPayment = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/freight/${selected.id}/confirm-user-payment`, {
        method: 'PATCH', headers,
      });
      if (!res.ok) throw new Error();
      toast.success('Payment confirmed — booking activated');
      fetchBookings();
    } catch { toast.error('Failed to confirm payment'); }
    finally { setSaving(false); }
  };

  const handlePayAgent = async () => {
    if (payAgentMethod === 'bank' && !payAgentFile) return toast.error('Please upload a payment proof file');
    setPayAgentSaving(true);
    try {
      const fd = new FormData();
      fd.append('method', payAgentMethod);
      if (payAgentFile) fd.append('proof', payAgentFile);
      const res = await fetch(`${API_BASE_URL}/freight/${selected.id}/pay-agent-proof`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
        body: fd,
      });
      if (!res.ok) throw new Error();
      toast.success(payAgentMethod === 'paypal' ? 'Agent notified via PayPal' : 'Bank proof sent to agent');
      setPayAgentFile(null);
      fetchBookings();
    } catch { toast.error('Failed to send payment'); }
    finally { setPayAgentSaving(false); }
  };
  const filtered = bookings
    .filter(b => {
      const matchSearch = !search
        || b.reference_id?.toLowerCase().includes(q)
        || b.company?.toLowerCase().includes(q)
        || b.email?.toLowerCase().includes(q);
      const matchStatus = !statusFilter || b.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

  const selectedCfg = selected
    ? (STATUS_CFG[selected.status] || { color: 'text-gray-500', dot: 'bg-gray-400', label: selected.status })
    : null;

  return (
    <div className="flex h-[calc(100vh-57px)]">
      {/* Left list */}
      <div className="w-96 border-r border-gray-100 overflow-y-auto flex-shrink-0">
        <div className="p-3 border-b border-gray-100 space-y-2">
          <input
            type="text"
            placeholder="Search ref, company, email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#243670]"
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#243670] bg-white"
          >
            <option value="">All Statuses</option>
            {Object.entries(STATUS_CFG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          {(search || statusFilter) && (
            <button
              onClick={() => { setSearch(''); setStatusFilter(''); }}
              className="text-xs text-[#243670] underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : bookings.length === 0 ? (
          <p className="text-center py-10 text-gray-400 text-sm">No bookings yet</p>
        ) : filtered.length === 0 ? (
          <p className="text-center py-10 text-gray-400 text-sm">No results</p>
        ) : filtered.map(b => {
          const c = STATUS_CFG[b.status] || { color: 'text-gray-500', dot: 'bg-gray-400', label: b.status };
          const isActive = selected?.id === b.id;
          return (
            <div
              key={b.id}
              onClick={() => handleSelect(b)}
              className={`p-4 border border-gray-100 rounded-xl mx-3 my-2 cursor-pointer transition-all ${isActive ? 'border-[#243670] bg-blue-50/30' : 'hover:border-gray-200 hover:bg-gray-50'}`}
            >
              <div className="flex items-start justify-between mb-1">
                <p className="font-bold text-[#243670] text-sm">{b.reference_id}</p>
                <span className={`text-xs font-semibold flex items-center gap-1 ${c.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${c.dot} inline-block`} />
                  {c.label}
                </span>
              </div>
              <p className="text-sm text-gray-700">{b.company}</p>
              <p className="text-sm text-gray-500">{b.email}</p>
              <p className="text-xs text-gray-400">{new Date(b.created_at).toLocaleString()}</p>
            </div>
          );
        })}
      </div>

      {/* Right detail */}
      <div className="flex-1 p-8 overflow-y-auto">
        {!selected ? (
          <p className="text-gray-400 text-sm">Select a booking to view details</p>
        ) : (
          <div className="max-w-2xl space-y-4">
            <div className="border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700">Status</p>
                {!isLocked && !isCancelled && (
                  <button
                    onClick={handleUpdateStatus}
                    disabled={saving || newStatus === selected.status}
                    className="px-6 py-2 rounded-full bg-[#243670] text-white text-sm font-semibold hover:bg-blue-900 transition-colors disabled:opacity-40"
                  >
                    {saving ? 'Saving...' : 'Update Status'}
                  </button>
                )}
              </div>

              <div className={`flex items-center gap-2 text-sm font-semibold ${selectedCfg.color}`}>
                <span className={`w-2 h-2 rounded-full ${selectedCfg.dot}`} />
                {selectedCfg.label}
                {isLocked && (
                  <span className="ml-2 text-xs text-gray-400 font-normal">(set by system — cannot be changed)</span>
                )}
                {isCancelled && (
                  <span className="ml-2 text-xs text-gray-400 font-normal">(cancelled)</span>
                )}
              </div>

              {!isLocked && !isCancelled && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-400">Change status to:</p>
                  <select
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#243670] bg-white"
                  >
                    <option value={selected.status} disabled>
                      Current: {STATUS_CFG[selected.status]?.label || selected.status}
                    </option>
                    {EDITABLE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Agent Payment Details — shown when agent is requesting payment */}
            {selected.status === 'agent_payment_requested' && agentPayDetails && (
              <div className="border border-[#243670]/20 rounded-xl p-5 bg-blue-50/40 space-y-4">
                <p className="font-bold text-[#243670] text-sm uppercase tracking-widest">💰 Agent Payment Details</p>

                {/* Rejection reason alert */}
                {selected.agent_payment_rejection_reason && (
                  <div className="bg-red-50 border border-red-300 rounded-xl p-4 space-y-1">
                    <p className="text-xs font-bold text-red-700 uppercase tracking-wide">⚠️ Agent Rejected Previous Payment</p>
                    <p className="text-sm text-red-700">{selected.agent_payment_rejection_reason}</p>
                  </div>
                )}

                {/* Bank Details */}
                {agentPayDetails.bank_name && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">🏦 Bank Transfer</p>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                      {[
                        ['Bank Name', agentPayDetails.bank_name],
                        ['Branch', agentPayDetails.branch_name],
                        ['Account Holder', agentPayDetails.account_holder],
                        ['Account Number', agentPayDetails.account_number],
                        ['IBAN', agentPayDetails.iban],
                        ['SWIFT Code', agentPayDetails.swift_code],
                      ].map(([l, v]) => v ? (
                        <div key={l}>
                          <p className="text-xs text-gray-400">{l}</p>
                          <p className="font-semibold text-gray-800 font-mono text-xs">{v}</p>
                        </div>
                      ) : null)}
                    </div>
                    {agentPayDetails.payment_instructions && (
                      <div className="bg-white rounded-lg p-3 border border-blue-100">
                        <p className="text-xs text-gray-400 mb-0.5">Instructions</p>
                        <p className="text-sm text-gray-700">{agentPayDetails.payment_instructions}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* PayPal */}
                {agentPayDetails.paypal_email && (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">💳 PayPal</p>
                    <p className="font-semibold text-gray-800">{agentPayDetails.paypal_email}</p>
                  </div>
                )}

                {!agentPayDetails.bank_name && !agentPayDetails.paypal_email && (
                  <p className="text-sm text-gray-400">Agent has not added payment details yet.</p>
                )}
              </div>
            )}

            {/* Pay Agent action panel — only when agent_payment_requested */}
            {selected.status === 'agent_payment_requested' && (
              <div className="border border-blue-200 rounded-xl p-5 bg-blue-50/40 space-y-4">
                <p className="font-bold text-blue-700 text-sm">
                  {selected.agent_payment_rejection_reason ? '🔄 Resend Payment to Agent' : '💸 Send Payment to Agent'}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setPayAgentMethod('paypal')}
                    className={`flex-1 py-2 rounded-full text-sm font-semibold border transition-colors ${payAgentMethod === 'paypal' ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    💳 PayPal
                  </button>
                  <button
                    onClick={() => setPayAgentMethod('bank')}
                    className={`flex-1 py-2 rounded-full text-sm font-semibold border transition-colors ${payAgentMethod === 'bank' ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    🏦 Bank Transfer
                  </button>
                </div>
                {payAgentMethod === 'bank' && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Upload payment proof (PDF or image)</p>
                    <input
                      type="file" accept=".pdf,.jpg,.jpeg,.png"
                      onChange={e => setPayAgentFile(e.target.files[0])}
                      className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2"
                    />
                    {payAgentFile && <p className="text-xs text-green-600 mt-1">✓ {payAgentFile.name}</p>}
                  </div>
                )}
                <button
                  onClick={handlePayAgent}
                  disabled={payAgentSaving}
                  className="w-full py-2.5 rounded-full bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 disabled:opacity-50"
                >
                  {payAgentSaving ? 'Sending...' : payAgentMethod === 'paypal' ? 'Notify Agent — Paid via PayPal' : 'Send Bank Proof to Agent'}
                </button>
              </div>
            )}

            <FreightRequestDetail request={selected} />

            {/* Confirm user payment — shown when proof submitted */}
            {selected.status === 'payment_proof_submitted' && (
              <div className="border border-yellow-200 rounded-xl p-5 bg-yellow-50/40 space-y-3">
                <p className="font-bold text-yellow-700 text-sm">⏳ Bank Transfer Proof Submitted</p>
                {selected.payment_proof_url && (
                  <a href={selected.payment_proof_url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-[#243670] underline font-semibold">
                    📎 View Payment Proof
                  </a>
                )}
                <button
                  onClick={handleConfirmUserPayment}
                  disabled={saving}
                  className="w-full py-2.5 rounded-full bg-green-500 text-white text-sm font-semibold hover:bg-green-600 disabled:opacity-50"
                >
                  {saving ? 'Confirming...' : '✓ Confirm Payment Received'}
                </button>
              </div>
            )}

            {/* Payment sent — awaiting agent confirmation */}
            {selected.status === 'agent_payment_sent' && (
              <div className="border border-blue-200 rounded-xl p-5 bg-blue-50/40 space-y-2">
                <p className="font-bold text-blue-700 text-sm">⏳ Payment Sent — Awaiting Agent Confirmation</p>
                <p className="text-sm text-gray-500">
                  Payment was sent via{' '}
                  <span className="font-semibold capitalize">{selected.agent_payment_method || 'unknown'}</span>.
                  Waiting for the agent to confirm receipt.
                </p>
                {selected.agent_payment_method === 'bank' && selected.agent_payment_proof_url && (
                  <a href={selected.agent_payment_proof_url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 text-sm text-blue-600 underline font-semibold">
                    📎 View Payment Proof
                  </a>
                )}
              </div>
            )}
            {selected.status === 'cancelled' && selected.cancellation_fee != null && (
              <div className="border border-red-200 rounded-xl p-4 bg-red-50 space-y-1.5 text-sm">
                <p className="font-semibold text-red-700 mb-2">Cancellation Summary</p>
                <div className="flex justify-between text-gray-600">
                  <span>Amount Paid</span>
                  <span className="font-semibold">USD {parseFloat(selected.final_price).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Cancellation Fee</span>
                  <span className="font-semibold">− USD {parseFloat(selected.cancellation_fee).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-700 border-t border-red-200 pt-1.5">
                  <span className="font-semibold">Refund Amount</span>
                  <span className="font-bold">USD {parseFloat(selected.refund_amount).toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showCancelModal && (
        <CancelModal
          booking={selected}
          saving={saving}
          onConfirm={handleCancel}
          onClose={() => setShowCancelModal(false)}
        />
      )}
    </div>
  );
};

export default BookingsPage;

