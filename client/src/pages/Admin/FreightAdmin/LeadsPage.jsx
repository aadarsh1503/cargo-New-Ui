import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../config/apiConfig';
import toast from 'react-hot-toast';
import FreightRequestDetail from '../../../components/FreightRequestDetail/FreightRequestDetail';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';

const STATUS_CFG = {
  submitted:          { color: 'text-green-500',  dot: 'bg-green-500' },
  admin_review:       { color: 'text-blue-500',   dot: 'bg-blue-500' },
  forwarded_to_agent: { color: 'text-purple-500', dot: 'bg-purple-500' },
  agent_priced:       { color: 'text-orange-500', dot: 'bg-orange-500' },
  commission_added:   { color: 'text-indigo-500', dot: 'bg-indigo-500' },
  sent_to_user:       { color: 'text-cyan-500',   dot: 'bg-cyan-500' },
  user_approved:      { color: 'text-teal-500',   dot: 'bg-teal-500' },
  payment_requested:  { color: 'text-pink-500',   dot: 'bg-pink-500' },
  payment_completed:  { color: 'text-green-500',  dot: 'bg-green-500' },
  cancelled:          { color: 'text-red-500',    dot: 'bg-red-500' },
};

const LeadsPage = () => {
  const [leads, setLeads] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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

  const filtered = leads
    .filter(l => {
      const q = search.toLowerCase();
      const matchSearch = !search || l.company?.toLowerCase().includes(q) || l.email?.toLowerCase().includes(q) || l.reference_id?.toLowerCase().includes(q);
      const matchStatus = !statusFilter || l.status === statusFilter;
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
            placeholder="Search company, email, ref..."
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
            {Object.keys(STATUS_CFG).map(k => (
              <option key={k} value={k}>{k.replace(/_/g, ' ')}</option>
            ))}
          </select>
          {(search || statusFilter) && (
            <button onClick={() => { setSearch(''); setStatusFilter(''); }} className="text-xs text-[#243670] underline">
              Clear filters
            </button>
          )}
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <p className="text-center py-10 text-gray-400 text-sm">{leads.length === 0 ? 'No leads yet' : 'No results'}</p>
        ) : filtered.map(lead => {
          const isActive = selected?.id === lead.id;
          return (
            <div
              key={lead.id}
              onClick={() => setSelected(lead)}
              className={`p-4 border border-gray-100 rounded-xl mx-3 my-2 cursor-pointer transition-all ${isActive ? 'border-[#243670] bg-blue-50/30' : 'hover:border-gray-200 hover:bg-gray-50'}`}
            >
              <div className="flex items-start justify-between mb-1">
                <p className="font-bold text-[#243670] text-sm">{lead.company}</p>
                <span className="text-xs text-[#243670] font-semibold">Details</span>
              </div>
              <p className="text-sm text-gray-600">{lead.email}</p>
              <p className="text-xs text-gray-400">{new Date(lead.created_at).toLocaleString()}</p>
            </div>
          );
        })}
      </div>

      {/* Right detail */}
      <div className="flex-1 p-8 overflow-y-auto">
        {!selected ? (
          <p className="text-gray-400 text-sm">Select a lead to view details</p>
        ) : (
          <div className="max-w-2xl">
            <FreightRequestDetail request={selected} />
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadsPage;

