import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../config/apiConfig';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';

const COLS = ['Liner', 'POL', 'POD', 'Transit', 'Availability', '20GP', '40GP', '40HQ', '40NOR', '45HQ', 'Remarks', 'Agent', 'Status', ''];

const OceanFreightPage = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editRow, setEditRow] = useState({});
  const [saving, setSaving] = useState(false);
  const [polFilter, setPolFilter] = useState('');
  const [podFilter, setPodFilter] = useState('');
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('');

  const token = localStorage.getItem('adminToken');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/freight/ocean-freight/all`, { headers });
      const data = await res.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch { toast.error('Error loading ocean freight'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEntries(); }, []);

  const filtered = entries.filter(e => {
    const q = search.toLowerCase();
    const matchSearch = !search || e.liner?.toLowerCase().includes(q) || e.agent_name?.toLowerCase().includes(q);
    const pm = !polFilter || e.pol?.toLowerCase().includes(polFilter.toLowerCase());
    const dm = !podFilter || e.pod?.toLowerCase().includes(podFilter.toLowerCase());
    const am = !activeFilter || (activeFilter === 'active' ? e.is_active : !e.is_active);
    return matchSearch && pm && dm && am;
  });

  const startEdit = (entry) => {
    setEditingId(entry.id);
    setEditRow({
      liner: entry.liner || '',
      pol: entry.pol || '',
      pod: entry.pod || '',
      transitTime: entry.transit_time || '',
      availability: entry.availability || '',
      price20gp: entry.price_20gp || '',
      price40gp: entry.price_40gp || '',
      price40hq: entry.price_40hq || '',
      price40nor: entry.price_40nor || '',
      price45hq: entry.price_45hq || '',
      remarks: entry.remarks || '',
    });
  };

  const handleSave = async (id) => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/freight/ocean-freight/${id}/admin-update`, {
        method: 'PUT', headers,
        body: JSON.stringify(editRow),
      });
      if (!res.ok) throw new Error();
      toast.success('Updated');
      setEditingId(null);
      fetchEntries();
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const handleToggle = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/freight/ocean-freight/${id}/admin-toggle`, {
        method: 'PATCH', headers,
      });
      if (!res.ok) throw new Error();
      fetchEntries();
    } catch { toast.error('Failed to toggle'); }
  };

  const inp = 'border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#243670] w-full min-w-[60px]';

  return (
    <div className="p-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <input
          type="text"
          placeholder="Search liner, agent..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-200 rounded-full px-4 py-1.5 text-sm focus:outline-none focus:border-[#243670] w-48"
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
          value={activeFilter}
          onChange={e => setActiveFilter(e.target.value)}
          className="border border-gray-300 rounded-full px-4 py-1.5 text-sm focus:outline-none focus:border-[#243670] bg-white"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        {(search || polFilter || podFilter || activeFilter) && (
          <button
            onClick={() => { setSearch(''); setPolFilter(''); setPodFilter(''); setActiveFilter(''); }}
            className="px-4 py-1.5 rounded-full border border-gray-200 text-gray-500 text-sm hover:bg-gray-50"
          >
            Clear
          </button>
        )}
        <span className="ml-auto text-xs text-gray-400">{filtered.length} entries</span>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-blue-50 border-b border-gray-200">
                {COLS.map(h => (
                  <th key={h} className="text-left py-3 px-3 font-semibold text-[#243670] text-xs uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={COLS.length} className="text-center py-10 text-gray-400 text-sm">
                    No ocean freight data yet
                  </td>
                </tr>
              ) : filtered.map(entry => (
                <tr key={entry.id} className={`border-b border-gray-100 transition-colors ${editingId === entry.id ? 'bg-blue-50/40' : 'hover:bg-gray-50'}`}>
                  {editingId === entry.id ? (
                    <>
                      <td className="py-2 px-2"><input value={editRow.liner} onChange={e => setEditRow(p => ({ ...p, liner: e.target.value }))} className={inp} /></td>
                      <td className="py-2 px-2"><input value={editRow.pol} onChange={e => setEditRow(p => ({ ...p, pol: e.target.value }))} className={inp} /></td>
                      <td className="py-2 px-2"><input value={editRow.pod} onChange={e => setEditRow(p => ({ ...p, pod: e.target.value }))} className={inp} /></td>
                      <td className="py-2 px-2"><input value={editRow.transitTime} onChange={e => setEditRow(p => ({ ...p, transitTime: e.target.value }))} className={inp} /></td>
                      <td className="py-2 px-2"><input value={editRow.availability} onChange={e => setEditRow(p => ({ ...p, availability: e.target.value }))} className={inp} /></td>
                      <td className="py-2 px-2"><input type="number" value={editRow.price20gp} onChange={e => setEditRow(p => ({ ...p, price20gp: e.target.value }))} className={inp} /></td>
                      <td className="py-2 px-2"><input type="number" value={editRow.price40gp} onChange={e => setEditRow(p => ({ ...p, price40gp: e.target.value }))} className={inp} /></td>
                      <td className="py-2 px-2"><input type="number" value={editRow.price40hq} onChange={e => setEditRow(p => ({ ...p, price40hq: e.target.value }))} className={inp} /></td>
                      <td className="py-2 px-2"><input type="number" value={editRow.price40nor} onChange={e => setEditRow(p => ({ ...p, price40nor: e.target.value }))} className={inp} /></td>
                      <td className="py-2 px-2"><input type="number" value={editRow.price45hq} onChange={e => setEditRow(p => ({ ...p, price45hq: e.target.value }))} className={inp} /></td>
                      <td className="py-2 px-2"><input value={editRow.remarks} onChange={e => setEditRow(p => ({ ...p, remarks: e.target.value }))} className={inp} /></td>
                      <td className="py-2 px-2 text-xs text-gray-500">{entry.agent_name || '—'}</td>
                      <td className="py-2 px-2" />
                      <td className="py-2 px-2">
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleSave(entry.id)}
                            disabled={saving}
                            className="px-3 py-1 rounded-full bg-[#243670] text-white text-xs hover:bg-blue-900 disabled:opacity-50"
                          >
                            {saving ? '...' : 'Save'}
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs hover:bg-gray-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3 px-3 font-medium text-gray-800">{entry.liner || '—'}</td>
                      <td className="py-3 px-3 text-gray-700">{entry.pol || '—'}</td>
                      <td className="py-3 px-3 text-gray-700">{entry.pod || '—'}</td>
                      <td className="py-3 px-3 text-gray-600">{entry.transit_time || '—'}</td>
                      <td className="py-3 px-3 text-gray-600">{entry.availability || '—'}</td>
                      <td className="py-3 px-3 text-gray-800">{entry.price_20gp ?? '—'}</td>
                      <td className="py-3 px-3 text-gray-800">{entry.price_40gp ?? '—'}</td>
                      <td className="py-3 px-3 text-gray-800">{entry.price_40hq ?? '—'}</td>
                      <td className="py-3 px-3 text-gray-800">{entry.price_40nor ?? '—'}</td>
                      <td className="py-3 px-3 text-gray-800">{entry.price_45hq ?? '—'}</td>
                      <td className="py-3 px-3 text-gray-500 text-xs max-w-[120px] truncate">{entry.remarks || '—'}</td>
                      <td className="py-3 px-3 text-xs text-gray-500">{entry.agent_name || '—'}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${entry.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {entry.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(entry)}
                            className="px-3 py-1 rounded-full bg-[#243670] text-white text-xs hover:bg-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggle(entry.id)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${entry.is_active ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
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
      )}
    </div>
  );
};

export default OceanFreightPage;

