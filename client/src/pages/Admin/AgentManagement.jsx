import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/apiConfig';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiX } from 'react-icons/fi';

const CreateAgentModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ name: '', email: '', password: '', company: '', phone: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE_URL}/freight/agents/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('Agent created successfully');
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to create agent');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-[#243670]">Create New Agent</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500"><FiX /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {[
            { name: 'name', label: 'Full Name', type: 'text', required: true },
            { name: 'email', label: 'Email', type: 'email', required: true },
            { name: 'password', label: 'Password', type: 'password', required: true },
            { name: 'company', label: 'Company', type: 'text' },
            { name: 'phone', label: 'Phone', type: 'text' },
          ].map(field => (
            <div key={field.name}>
              <label className="text-sm font-semibold text-[#243670] block mb-1">{field.label} {field.required && '*'}</label>
              <input
                type={field.type}
                required={field.required}
                value={form[field.name]}
                onChange={e => setForm(p => ({ ...p, [field.name]: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#243670] text-white py-3 rounded-lg font-semibold hover:bg-[#1a2a5e] transition-colors disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Create Agent'}
          </button>
        </form>
      </div>
    </div>
  );
};

const AgentManagement = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

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

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-[#243670] p-8 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-30" style={{
        backgroundImage: 'radial-gradient(#243670 0.5px, transparent 0.5px), radial-gradient(#243670 0.5px, #F0F4F8 0.5px)',
        backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px'
      }} />

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-5xl font-light tracking-widest uppercase text-[#243670]">Agents</h1>
            <p className="text-gray-500 mt-1">Manage freight partners</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-amber-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/30"
          >
            <FiPlus /> Add Agent
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading agents...</div>
        ) : agents.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-6xl mb-4">👤</div>
            <p className="text-xl">No agents yet</p>
            <p className="text-sm mt-2">Create your first agent to start forwarding requests</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map(agent => (
              <div key={agent.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-[#243670]/10 hover:border-amber-400 transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#243670] flex items-center justify-center text-white text-xl font-bold">
                    {agent.name.charAt(0).toUpperCase()}
                  </div>
                  <button
                    onClick={() => handleDelete(agent.id)}
                    className="p-1.5 rounded-lg bg-red-50 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-all"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
                <h3 className="font-bold text-[#243670] text-lg">{agent.name}</h3>
                {agent.company && <p className="text-sm text-gray-500">{agent.company}</p>}
                <p className="text-sm text-gray-400 mt-1">{agent.email}</p>
                {agent.phone && <p className="text-sm text-gray-400">{agent.phone}</p>}
                <div className="mt-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${agent.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {agent.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-3">Joined {new Date(agent.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreate && <CreateAgentModal onClose={() => setShowCreate(false)} onCreated={fetchAgents} />}
    </div>
  );
};

export default AgentManagement;
