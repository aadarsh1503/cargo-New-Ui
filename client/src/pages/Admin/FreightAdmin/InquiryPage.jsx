import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../config/apiConfig';
import toast from 'react-hot-toast';
import FreightRequestDetail from '../../../components/FreightRequestDetail/FreightRequestDetail';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';

const STATUS_CFG = {
  submitted:               { label: 'New',                    color: 'text-green-500',   dot: 'bg-green-500' },
  admin_review:            { label: 'Under Review',           color: 'text-blue-500',    dot: 'bg-blue-500' },
  forwarded_to_agent:      { label: 'Sent to Agent',          color: 'text-purple-500',  dot: 'bg-purple-500' },
  agent_priced:            { label: 'Agent Priced',           color: 'text-orange-500',  dot: 'bg-orange-500' },
  sent_to_user:            { label: 'Quote Sent to User',     color: 'text-cyan-500',    dot: 'bg-cyan-500' },
  user_approved:           { label: 'User Approved',          color: 'text-teal-500',    dot: 'bg-teal-500' },
  payment_requested:       { label: 'Payment Requested',      color: 'text-pink-500',    dot: 'bg-pink-500' },
  payment_completed:       { label: 'User Paid ✓',            color: 'text-green-600',   dot: 'bg-green-600' },
  agent_payment_requested: { label: 'Agent Requesting Pay',   color: 'text-orange-500',    dot: 'bg-orange-500' },
  agent_payment_completed: { label: 'Agent Paid',             color: 'text-emerald-500', dot: 'bg-emerald-500' },
  in_progress:             { label: 'In Progress',            color: 'text-emerald-500', dot: 'bg-emerald-500' },
  completed:               { label: 'Completed',              color: 'text-green-700',   dot: 'bg-green-700' },
  cancelled:               { label: 'Cancelled',              color: 'text-red-500',     dot: 'bg-red-500' },
};

const InquiryPage = () => {
  const [items, setItems] = useState([]);
  const [agents, setAgents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const token = localStorage.getItem('adminToken');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [r1, r2] = await Promise.all([
        fetch(`${API_BASE_URL}/freight/leads`, { headers }),
        fetch(`${API_BASE_URL}/freight/agents/list`, { headers }),
      ]);
      const d1 = await r1.json(); const d2 = await r2.json();
      const list = Array.isArray(d1) ? d1 : [];
      setItems(list);
      setAgents(Array.isArray(d2) ? d2 : []);
      if (list.length > 0 && !selected) setSelected(list[0]);
    } catch { toast.error('Error loading data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const refreshSelected = async (id) => {
    await fetchData();
    const res = await fetch(`${API_BASE_URL}/freight/${id}`, { headers });
    if (res.ok) setSelected(await res.json());
  };

  const cfg = selected ? (STATUS_CFG[selected.status] || STATUS_CFG.submitted) : null;
  const canConfirm = selected && ['submitted'].includes(selected.status);

  const filtered = items
    .filter(item => {
      const q = search.toLowerCase();
      const matchSearch = !search || item.company?.toLowerCase().includes(q) || item.email?.toLowerCase().includes(q) || item.port_of_loading_city?.toLowerCase().includes(q) || item.port_of_discharge_city?.toLowerCase().includes(q);
      const matchStatus = !statusFilter || item.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

  return (
    <div className="flex h-[calc(100vh-57px)]">
      {/* Left list */}
      <div className="w-96 border-r border-gray-100 overflow-y-auto flex-shrink-0">
        {/* Filters */}
        <div className="p-3 border-b border-gray-100 space-y-2">
          <input
            type="text"
            placeholder="Search company, email, route..."
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
            {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          {(search || statusFilter) && (
            <button onClick={() => { setSearch(''); setStatusFilter(''); }} className="text-xs text-[#243670] underline">Clear filters</button>
          )}
        </div>
        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <p className="text-center py-10 text-gray-400 text-sm">No results</p>
        ) : filtered.map(item => {
          const c = STATUS_CFG[item.status] || STATUS_CFG.submitted;
          const isActive = selected?.id === item.id;
          return (
            <div
              key={item.id}
              onClick={() => setSelected(item)}
              className={`p-4 border border-gray-100 rounded-xl mx-3 my-2 cursor-pointer transition-all ${isActive ? 'border-[#243670] bg-blue-50/30' : 'hover:border-gray-200 hover:bg-gray-50'}`}
            >
              <div className="flex items-start justify-between mb-1">
                <p className="font-bold text-[#243670] text-sm">{item.port_of_loading_city} → {item.port_of_discharge_city}</p>
                <span className={`text-xs font-semibold flex items-center gap-1 ${c.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${c.dot} inline-block`} />
                  {c.label}
                </span>
              </div>
              <p className="text-sm text-gray-600">{item.company}</p>
              <p className="text-xs text-gray-400">{item.email}</p>
              <p className="text-xs text-gray-400">{new Date(item.created_at).toLocaleString()}</p>
            </div>
          );
        })}
      </div>

      {/* Right detail */}
      <div className="flex-1 p-8 overflow-y-auto">
        {!selected ? (
          <p className="text-gray-400 text-sm">Select an inquiry to view details</p>
        ) : (
          <div className="max-w-2xl space-y-4">
            {/* Header with status + confirm button */}
            <div className="flex items-center justify-between">
              <span className={`text-sm font-semibold flex items-center gap-1.5 ${cfg.color}`}>
                <span className={`w-2 h-2 rounded-full ${cfg.dot} inline-block`} />
                {cfg.label}
              </span>
              {canConfirm && (
                <button
                  onClick={async () => {
                    if (!window.confirm('Confirm this booking?')) return;
                    const res = await fetch(`${API_BASE_URL}/freight/${selected.id}/status`, {
                      method: 'PATCH', headers,
                      body: JSON.stringify({ status: 'admin_review' })
                    });
                    if (res.ok) { toast.success('Booking confirmed'); refreshSelected(selected.id); }
                  }}
                  className="px-6 py-2 rounded-full bg-[#243670] text-white text-sm font-semibold hover:bg-blue-900 transition-colors"
                >
                  Booking Confirm
                </button>
              )}
            </div>

            {/* Full details */}
            <FreightRequestDetail request={selected} />

            {/* Forward to agent */}
            {['submitted', 'admin_review'].includes(selected.status) && (
              <ForwardToAgent request={selected} agents={agents} headers={headers} onDone={() => refreshSelected(selected.id)} />
            )}

            {/* Add commission — only after agent submits price */}
            {selected.status === 'agent_priced' && (
              <AddCommission request={selected} headers={headers} onDone={() => refreshSelected(selected.id)} />
            )}

            {/* Waiting for user to pay */}
            {selected.status === 'sent_to_user' && (
              <div className="w-full py-2.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-600 font-semibold text-sm text-center">
                Quote sent — waiting for user to complete payment...
              </div>
            )}

            {/* User paid — agent will request their payment */}
            {selected.status === 'payment_completed' && (
              <div className="w-full py-2.5 rounded-full bg-green-50 border border-green-200 text-green-700 font-semibold text-sm text-center">
                ✓ User payment received — waiting for agent to request their payment
              </div>
            )}

            {/* Agent requesting payment from admin */}
            {selected.status === 'agent_payment_requested' && (
              <div className="space-y-3">
                <div className="w-full py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold text-sm text-center">
                  🔔 Agent is requesting payment of{' '}
                  <span className="font-bold">
                    USD {parseFloat(selected.agent_price || 0).toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={async () => {
                    if (!window.confirm('Confirm you have paid the agent? This will start the shipment.')) return;
                    const res = await fetch(`${API_BASE_URL}/freight/${selected.id}/pay-agent`, {
                      method: 'PATCH', headers, body: JSON.stringify({})
                    });
                    if (res.ok) { toast.success('Agent paid — shipment started!'); refreshSelected(selected.id); }
                    else toast.error('Failed');
                  }}
                  className="w-full py-2.5 rounded-full bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors text-sm"
                >
                  ✓ Confirm Agent Paid — Start Shipment
                </button>
              </div>
            )}

            {/* In progress / done */}
            {['in_progress', 'completed'].includes(selected.status) && (
              <div className="w-full py-2.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold text-sm text-center">
                {selected.status === 'in_progress' ? '🚢 Shipment in progress' : '✓ Shipment completed'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const ForwardToAgent = ({ request, agents, headers, onDone }) => {
  const [agentId, setAgentId] = useState('');
  const [agentSearch, setAgentSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [saving, setSaving] = useState(false);

  const filteredAgents = agents.filter(a => {
    const q = agentSearch.toLowerCase();
    return !q ||
      a.name?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q) ||
      a.phone?.toLowerCase().includes(q) ||
      a.company?.toLowerCase().includes(q);
  });

  const totalPages = Math.ceil(filteredAgents.length / perPage);
  const pagedAgents = filteredAgents.slice((page - 1) * perPage, page * perPage);
  const selectedAgent = agents.find(a => a.id === Number(agentId));

  const handleSearch = (val) => { setAgentSearch(val); setAgentId(''); setPage(1); };
  const handlePerPage = (val) => { setPerPage(Number(val)); setPage(1); };

  const handleForward = async () => {
    if (!agentId) return toast.error('Select an agent');
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/freight/${request.id}/forward-to-agent`, {
        method: 'PATCH', headers, body: JSON.stringify({ agentId })
      });
      if (!res.ok) throw new Error();
      toast.success('Forwarded to agent');
      onDone();
    } catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="border border-dashed border-gray-300 rounded-xl p-4 space-y-3">
      <p className="text-sm font-semibold text-gray-700">Forward to Agent</p>

      {/* Search + per-page row */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search by name, email, phone, company..."
          value={agentSearch}
          onChange={e => handleSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#243670]"
        />
        <select
          value={perPage}
          onChange={e => handlePerPage(e.target.value)}
          className="border border-gray-200 rounded-lg px-2 py-2 text-xs focus:outline-none focus:border-[#243670] bg-white"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
      </div>

      {/* Agent list — fixed height for perPage rows */}
      <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
        {filteredAgents.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">No agents found</p>
        ) : pagedAgents.map(a => (
          <div
            key={a.id}
            onClick={() => setAgentId(String(a.id))}
            className={`px-3 py-2.5 cursor-pointer transition-colors ${agentId === String(a.id) ? 'bg-blue-50 border-l-2 border-[#243670]' : 'hover:bg-gray-50'}`}
          >
            <p className="text-sm font-semibold text-gray-800">{a.name}</p>
            <p className="text-xs text-gray-500">{a.email}{a.phone ? ` · ${a.phone}` : ''}{a.company ? ` · ${a.company}` : ''}</p>
          </div>
        ))}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{filteredAgents.length} agents · page {page}/{totalPages}</span>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-2 py-1 border border-gray-200 rounded disabled:opacity-40 hover:bg-gray-50">‹</button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-2 py-1 border border-gray-200 rounded disabled:opacity-40 hover:bg-gray-50">›</button>
          </div>
        </div>
      )}

      {/* Selected agent preview */}
      {selectedAgent && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-[#243670]">
          Selected: <span className="font-semibold">{selectedAgent.name}</span> — {selectedAgent.email}
        </div>
      )}

      <button onClick={handleForward} disabled={saving || !agentId} className="w-full py-2 rounded-full bg-[#243670] text-white text-sm font-semibold hover:bg-blue-900 disabled:opacity-50">
        {saving ? 'Forwarding...' : 'Forward'}
      </button>
    </div>
  );
};

const AddCommission = ({ request, headers, onDone }) => {
  const [type, setType] = useState('percentage');
  const [value, setValue] = useState('');
  const [finalPrice, setFinalPrice] = useState('');
  const currency = 'USD';
  const [saving, setSaving] = useState(false);

  const autoCalc = () => {
    if (!request.agent_price || !value) return;
    const base = parseFloat(request.agent_price);
    const v = parseFloat(value);
    setFinalPrice(type === 'percentage' ? (base + base * v / 100).toFixed(2) : (base + v).toFixed(2));
  };

  const handleSubmit = async () => {
    if (!finalPrice) return toast.error('Set a final price');
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/freight/${request.id}/add-commission`, {
        method: 'PATCH', headers,
        body: JSON.stringify({ commissionType: type, commissionValue: value, finalPrice, finalCurrency: currency })
      });
      if (!res.ok) throw new Error();
      toast.success('Commission added & sent to user');
      onDone();
    } catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="border border-dashed border-amber-300 rounded-xl p-4 space-y-3">
      <p className="text-sm font-semibold text-gray-700">Add Commission & Send to User</p>
      <div className="grid grid-cols-2 gap-3">
        <select value={type} onChange={e => setType(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#243670]">
          <option value="percentage">Percentage (%)</option>
          <option value="fixed">Fixed Amount</option>
        </select>
        <input type="number" value={value} onChange={e => setValue(e.target.value)} placeholder="Value" className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#243670]" />
      </div>
      <button onClick={autoCalc} type="button" className="text-xs text-[#243670] underline">Auto-calculate</button>
      <div className="grid grid-cols-2 gap-3">
        <input type="number" value={finalPrice} onChange={e => setFinalPrice(e.target.value)} placeholder="Final price" className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#243670]" />
        <div className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 flex items-center">USD</div>
      </div>
      <button onClick={handleSubmit} disabled={saving} className="w-full py-2 rounded-full bg-[#243670] text-white text-sm font-semibold hover:bg-blue-900 disabled:opacity-50">
        {saving ? 'Saving...' : 'Add Commission & Send to User'}
      </button>
    </div>
  );
};

export default InquiryPage;

