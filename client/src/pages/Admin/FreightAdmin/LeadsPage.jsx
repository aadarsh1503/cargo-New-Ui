import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../config/apiConfig';
import toast from 'react-hot-toast';
import FreightRequestDetail from '../../../components/FreightRequestDetail/FreightRequestDetail';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';

const STATUS_CFG = {
  submitted:          { label: 'Submitted',       color: 'text-green-600',  dot: 'bg-green-500',  bg: 'bg-green-50' },
  admin_review:       { label: 'Under Review',    color: 'text-blue-600',   dot: 'bg-blue-500',   bg: 'bg-blue-50' },
  forwarded_to_agent: { label: 'Fwd to Agent',    color: 'text-purple-600', dot: 'bg-purple-500', bg: 'bg-purple-50' },
  agent_priced:       { label: 'Agent Priced',    color: 'text-orange-600', dot: 'bg-orange-500', bg: 'bg-orange-50' },
  commission_added:   { label: 'Commission Added',color: 'text-indigo-600', dot: 'bg-indigo-500', bg: 'bg-indigo-50' },
  sent_to_user:       { label: 'Sent to User',    color: 'text-cyan-600',   dot: 'bg-cyan-500',   bg: 'bg-cyan-50' },
  user_approved:      { label: 'User Approved',   color: 'text-teal-600',   dot: 'bg-teal-500',   bg: 'bg-teal-50' },
  payment_requested:  { label: 'Payment Req.',    color: 'text-pink-600',   dot: 'bg-pink-500',   bg: 'bg-pink-50' },
  payment_completed:  { label: 'Paid ✓',          color: 'text-green-700',  dot: 'bg-green-600',  bg: 'bg-green-50' },
  cancelled:          { label: 'Cancelled',       color: 'text-red-600',    dot: 'bg-red-500',    bg: 'bg-red-50' },
};

const LeadsPage = () => {
  const [leads, setLeads] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleting, setDeleting] = useState(false);

  const token = localStorage.getItem('adminToken');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/freight/leads`, { headers });
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setLeads(list);
      if (list.length > 0 && !selected) setSelected(list[0]);
    } catch { toast.error('Error loading leads'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLeads(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lead?')) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/freight/${id}`, { method: 'DELETE', headers: { ...headers, 'Content-Type': 'application/json' } });
      if (!res.ok) throw new Error();
      toast.success('Deleted');
      setSelected(null);
      fetchLeads();
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting(false); }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm(`Delete all ${filtered.length} visible leads? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await Promise.all(filtered.map(l =>
        fetch(`${API_BASE_URL}/freight/${l.id}`, { method: 'DELETE', headers: { ...headers, 'Content-Type': 'application/json' } })
      ));
      toast.success(`Deleted ${filtered.length} leads`);
      setSelected(null);
      fetchLeads();
    } catch { toast.error('Some deletions failed'); }
    finally { setDeleting(false); }
  };

  const filtered = leads
    .filter(l => {
      const q = search.toLowerCase();
      const matchSearch = !search || l.company?.toLowerCase().includes(q) || l.email?.toLowerCase().includes(q) || l.reference_id?.toLowerCase().includes(q);
      const matchStatus = !statusFilter || l.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

  return (
    <div className="flex h-[calc(100vh-57px)] overflow-hidden">
      {/* Left — compact table list */}
      <div className="w-[420px] border-r border-gray-100 flex-shrink-0 flex flex-col h-full">
        {/* Filters */}
        <div className="p-2 border-b border-gray-100 flex gap-1.5 flex-wrap flex-shrink-0">
          <input type="text" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-0 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#243670]" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none bg-white">
            <option value="">All</option>
            {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          {(search || statusFilter) && (
            <button onClick={() => { setSearch(''); setStatusFilter(''); }} className="text-[10px] text-[#243670] underline px-1">Clear</button>
          )}
          <span className="text-[10px] text-gray-400 self-center ml-auto">{filtered.length}</span>
          {filtered.length > 0 && (
            <button onClick={handleDeleteAll} disabled={deleting}
              className="text-[10px] text-red-500 border border-red-200 rounded px-2 py-1 hover:bg-red-50 disabled:opacity-50">
              Delete All
            </button>
          )}
        </div>

        {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
          <p className="text-center py-8 text-gray-400 text-xs">{leads.length === 0 ? 'No leads yet' : 'No results'}</p>
        ) : (
          <div className="flex-1 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-gray-50 z-10">
              <tr className="border-b border-gray-200">
                <th className="text-left px-3 py-1.5 font-semibold text-gray-500 uppercase tracking-wide text-[10px]">Company</th>
                <th className="text-left px-2 py-1.5 font-semibold text-gray-500 uppercase tracking-wide text-[10px]">Route</th>
                <th className="text-left px-2 py-1.5 font-semibold text-gray-500 uppercase tracking-wide text-[10px]">Status</th>
                <th className="text-left px-2 py-1.5 font-semibold text-gray-500 uppercase tracking-wide text-[10px]">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(lead => {
                const c = STATUS_CFG[lead.status] || STATUS_CFG.submitted;
                const isActive = selected?.id === lead.id;
                return (
                  <tr key={lead.id} onClick={() => setSelected(lead)}
                    className={`border-b border-gray-100 cursor-pointer transition-colors ${isActive ? 'bg-blue-50 border-l-2 border-l-[#243670]' : 'hover:bg-gray-50'}`}>
                    <td className="px-3 py-1.5">
                      <p className="font-semibold text-[#243670] truncate max-w-[110px]">{lead.company || '—'}</p>
                      <p className="text-gray-400 truncate max-w-[110px]">{lead.email}</p>
                    </td>
                    <td className="px-2 py-1.5 text-gray-600 max-w-[120px]">
                      <span className="block truncate" title={
                        lead.port_of_loading_city && lead.port_of_discharge_city
                          ? `${lead.port_of_loading_city} → ${lead.port_of_discharge_city}`
                          : '—'
                      }>
                        {lead.port_of_loading_city && lead.port_of_discharge_city
                          ? `${lead.port_of_loading_city} → ${lead.port_of_discharge_city}`
                          : '—'}
                      </span>
                    </td>
                    <td className="px-2 py-1.5">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${c.bg} ${c.color}`}>
                        <span className={`w-1 h-1 rounded-full ${c.dot}`} />{c.label}
                      </span>
                    </td>
                    <td className="px-2 py-1.5 text-gray-400 whitespace-nowrap">{new Date(lead.created_at).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* Right detail */}
      <div className="flex-1 h-full overflow-y-auto p-4">
        {!selected ? (
          <p className="text-gray-400 text-xs">Select a lead to view details</p>
        ) : (
          <div className="max-w-2xl">
            <div className="flex justify-end mb-2">
              <button onClick={() => handleDelete(selected.id)} disabled={deleting}
                className="px-3 py-1.5 rounded-full border border-red-200 text-red-500 text-xs font-semibold hover:bg-red-50 disabled:opacity-50">
                🗑 Delete
              </button>
            </div>
            <FreightRequestDetail request={selected} />
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadsPage;
