import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../config/apiConfig';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiEdit2, FiX, FiEye, FiEyeOff } from 'react-icons/fi';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';

const AgentModal = ({ agent, onClose, onSaved }) => {
  const isEdit = !!agent;
  const [form, setForm] = useState({
    name: agent?.name || '',
    email: agent?.email || '',
    password: agent?.plain_password || '',
    company: agent?.company || '',
    phone: agent?.phone || '',
  });
  const [showPwd, setShowPwd] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
      const url = isEdit
        ? `${API_BASE_URL}/freight/agents/${agent.id}`
        : `${API_BASE_URL}/freight/agents/create`;
      const method = isEdit ? 'PUT' : 'POST';
      const body = { ...form };
      if (isEdit && !body.password) delete body.password;
      const res = await fetch(url, { method, headers, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(isEdit ? 'Agent updated' : 'Agent created');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <p className="font-bold text-gray-800">{isEdit ? 'Edit Agent' : 'Create Agent'}</p>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"><FiX /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-3">
          {[
            { name: 'name', label: 'Full Name', type: 'text', required: true },
            { name: 'email', label: 'Email', type: 'email', required: true },
            { name: 'company', label: 'Company', type: 'text' },
            { name: 'phone', label: 'Phone', type: 'text' },
          ].map(f => (
            <div key={f.name}>
              <label className="text-xs font-semibold text-gray-500 block mb-1">{f.label}{f.required && ' *'}</label>
              <input
                type={f.type}
                required={f.required}
                value={form[f.name]}
                onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#243670]"
              />
            </div>
          ))}
          {/* Password with eye toggle */}
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Password *</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                required
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-9 text-sm focus:outline-none focus:border-[#243670]"
              />
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPwd ? <FiEyeOff size={14} /> : <FiEye size={14} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#243670] text-white py-2.5 rounded-full font-semibold hover:bg-blue-900 transition-colors disabled:opacity-50 text-sm mt-1"
          >
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Agent'}
          </button>
        </form>
      </div>
    </div>
  );
};

const AgentsPage = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [revealedPwd, setRevealedPwd] = useState({});
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const token = localStorage.getItem('adminToken');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/freight/agents/list`, { headers });
      const data = await res.json();
      setAgents(Array.isArray(data) ? data : []);
    } catch { toast.error('Error loading agents'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAgents(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this agent?')) return;
    try {
      await fetch(`${API_BASE_URL}/freight/agents/${id}`, { method: 'DELETE', headers });
      toast.success('Agent deleted');
      fetchAgents();
    } catch { toast.error('Failed to delete'); }
  };

  const handleToggle = async (id, isActive) => {
    try {
      const res = await fetch(`${API_BASE_URL}/freight/agents/${id}/toggle`, { method: 'PATCH', headers });
      if (!res.ok) throw new Error();
      toast.success(isActive ? 'Deactivated' : 'Activated');
      fetchAgents();
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-base font-bold text-gray-800">Agents <span className="text-gray-400 font-normal text-sm">({agents.length})</span></p>
        <button
          onClick={() => setModal('create')}
          className="flex items-center gap-1.5 bg-[#243670] text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-blue-900 transition-colors"
        >
          <FiPlus size={13} /> Add Agent
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        <input
          type="text"
          placeholder="Search name, email, company..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-200 rounded-full px-4 py-1.5 text-sm focus:outline-none focus:border-[#243670] w-64"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-full px-4 py-1.5 text-sm focus:outline-none focus:border-[#243670] bg-white"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        {(search || statusFilter) && (
          <button onClick={() => { setSearch(''); setStatusFilter(''); }} className="px-4 py-1.5 rounded-full border border-gray-200 text-gray-500 text-sm hover:bg-gray-50">
            Clear
          </button>
        )}
      </div>

      {(() => {
        const filtered = agents.filter(a => {
          const q = search.toLowerCase();
          const matchSearch = !search || a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || (a.company || '').toLowerCase().includes(q);
          const matchStatus = !statusFilter || (statusFilter === 'active' ? a.is_active : !a.is_active);
          return matchSearch && matchStatus;
        });
        return loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-16">{agents.length === 0 ? 'No agents yet.' : 'No results.'}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  {['Agent', 'Email', 'Phone', 'Company', 'Password', 'Status', 'Joined', ''].map(h => (
                    <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold text-[#243670] uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors group">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-rose-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {a.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-800 whitespace-nowrap">{a.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-gray-500">{a.email}</td>
                    <td className="py-2.5 px-3 text-gray-500">{a.phone || '—'}</td>
                    <td className="py-2.5 px-3 text-gray-500">{a.company || '—'}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {revealedPwd[a.id] ? (a.plain_password || '—') : '••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setRevealedPwd(p => ({ ...p, [a.id]: !p[a.id] }))}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title={revealedPwd[a.id] ? 'Hide' : 'Show'}
                        >
                          {revealedPwd[a.id] ? <FiEyeOff size={12} /> : <FiEye size={12} />}
                        </button>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => handleToggle(a.id, a.is_active)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${a.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                      >
                        {a.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-gray-400 text-xs whitespace-nowrap">{new Date(a.created_at).toLocaleDateString()}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setModal(a)} className="p-1.5 rounded-lg bg-blue-50 text-[#243670] hover:bg-blue-100 transition-colors" title="Edit"><FiEdit2 size={12} /></button>
                        <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition-colors" title="Delete"><FiTrash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })()}

      {modal && (
        <AgentModal
          agent={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={fetchAgents}
        />
      )}
    </div>
  );
};

export default AgentsPage;

