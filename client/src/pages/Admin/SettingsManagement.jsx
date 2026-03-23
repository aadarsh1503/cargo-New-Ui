import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';
import toast from 'react-hot-toast';
import { FaSave, FaCheckCircle } from 'react-icons/fa';

// ─── Google Maps Section ──────────────────────────────────────────────────────
const GoogleMapsSection = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingKey, setEditingKey] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    fetch(`${API_BASE_URL}/settings`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setSettings(Array.isArray(data) ? data.filter(s => s.setting_key === 'google_maps_api_key') : []))
      .catch(() => toast.error('Error fetching settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e, key) => {
    e.preventDefault();
    const value = new FormData(e.target).get('value');
    setSaving(true); setEditingKey(key);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE_URL}/settings/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ value })
      });
      if (res.ok) toast.success('Setting updated');
      else toast.error('Update failed');
    } catch { toast.error('Error updating setting'); }
    finally { setSaving(false); setEditingKey(null); }
  };

  if (loading) return <p className="text-xs text-gray-400">Loading...</p>;

  return (
    <div className="space-y-3">
      {settings.length === 0 ? (
        <p className="text-xs text-gray-400">No Google Maps key found. Run the SQL migration first.</p>
      ) : settings.map(setting => (
        <div key={setting.id}>
          {setting.description && <p className="text-xs text-gray-400 mb-1">{setting.description}</p>}
          <form onSubmit={(e) => handleSubmit(e, setting.setting_key)} className="flex gap-2">
            <input type="text" name="value" defaultValue={setting.setting_value}
              className="flex-1 border border-[#243670]/20 rounded-lg px-3 py-1.5 text-xs font-mono focus:border-[#F59E0B] focus:outline-none"
              placeholder="Enter Google Maps API Key" />
            <button type="submit" disabled={saving && editingKey === setting.setting_key}
              className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50 whitespace-nowrap">
              {saving && editingKey === setting.setting_key ? 'Saving...' : '💾 Save'}
            </button>
          </form>
        </div>
      ))}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
        <p className="text-xs text-blue-800 mb-1.5">Used for interactive maps. <a href="https://console.cloud.google.com/google/maps-apis" target="_blank" rel="noopener noreferrer" className="font-semibold underline">Get API key →</a></p>
        <ol className="text-[10px] text-blue-700 space-y-0.5 list-decimal list-inside">
          <li>Visit Google Cloud Console</li>
          <li>Enable "Maps JavaScript API"</li>
          <li>Create credentials (API Key)</li>
          <li>Paste the key above</li>
        </ol>
      </div>
    </div>
  );
};

// ─── Email / AWS Section ──────────────────────────────────────────────────────
const EmailSettingsSection = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [activeTab, setActiveTab] = useState('smtp');
  const [emailSettings, setEmailSettings] = useState({
    EMAIL_PROVIDER: 'smtp',
    AWS_ACCESS_KEY_ID: '', AWS_SECRET_ACCESS_KEY: '',
    AWS_REGION: '', AWS_SES_FROM_EMAIL: '', AWS_SES_FROM_NAME: '',
    SMTP_HOST: '', SMTP_PORT: '465', SMTP_SECURE: 'true',
    SMTP_USER: '', SMTP_PASS: '', SMTP_FROM_EMAIL: '', SMTP_FROM_NAME: '',
  });

  const token = localStorage.getItem('adminToken');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    axios.get(`${API_BASE_URL}/aws-settings`, { headers })
      .then(r => {
        setEmailSettings(prev => ({ ...prev, ...r.data.data }));
        setActiveTab(r.data.data.EMAIL_PROVIDER === 'aws' ? 'aws' : 'smtp');
      })
      .catch(() => toast.error('Failed to load email settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmailSettings(prev => ({ ...prev, [name]: value }));
  };

  const setProvider = (p) => {
    setEmailSettings(prev => ({ ...prev, EMAIL_PROVIDER: p }));
    setActiveTab(p);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API_BASE_URL}/aws-settings`, { settings: emailSettings }, { headers });
      toast.success('Email settings saved');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      await axios.put(`${API_BASE_URL}/aws-settings`, { settings: emailSettings }, { headers });
      const r = await axios.post(`${API_BASE_URL}/aws-settings/test`, {}, { headers });
      toast.success(r.data.message);
    } catch (e) { toast.error(e.response?.data?.message || 'Test failed'); }
    finally { setTesting(false); }
  };

  const inp = 'w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#243670]';
  const lbl = 'block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5';

  if (loading) return <p className="text-xs text-gray-400">Loading...</p>;

  return (
    <div className="space-y-3">
      {/* Provider toggle */}
      <div className="flex gap-2">
        {[{ key: 'smtp', label: '📧 SMTP', desc: 'Titan, Gmail, Outlook…' }, { key: 'aws', label: '☁️ AWS SES', desc: 'Amazon SES' }].map(opt => (
          <button key={opt.key} onClick={() => setProvider(opt.key)}
            className={`flex-1 py-2 px-3 rounded-lg border text-left transition-all ${emailSettings.EMAIL_PROVIDER === opt.key ? 'border-[#243670] bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
            <p className={`font-semibold text-xs ${emailSettings.EMAIL_PROVIDER === opt.key ? 'text-[#243670]' : 'text-gray-600'}`}>{opt.label}</p>
            <p className="text-[10px] text-gray-400">{opt.desc}</p>
          </button>
        ))}
      </div>

      {/* SMTP */}
      {activeTab === 'smtp' && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div><label className={lbl}>SMTP Host</label><input name="SMTP_HOST" value={emailSettings.SMTP_HOST} onChange={handleChange} className={inp} placeholder="smtp.titan.email" /></div>
            <div><label className={lbl}>Port</label><input name="SMTP_PORT" value={emailSettings.SMTP_PORT} onChange={handleChange} className={inp} placeholder="465" /></div>
            <div><label className={lbl}>Username / Email</label><input name="SMTP_USER" value={emailSettings.SMTP_USER} onChange={handleChange} className={inp} placeholder="you@domain.com" /></div>
            <div><label className={lbl}>Password</label><input type="text" name="SMTP_PASS" value={emailSettings.SMTP_PASS} onChange={handleChange} className={inp} placeholder="Enter password" /></div>
            <div><label className={lbl}>From Email</label><input name="SMTP_FROM_EMAIL" value={emailSettings.SMTP_FROM_EMAIL} onChange={handleChange} className={inp} placeholder="noreply@domain.com" /></div>
            <div><label className={lbl}>From Name</label><input name="SMTP_FROM_NAME" value={emailSettings.SMTP_FROM_NAME} onChange={handleChange} className={inp} placeholder="GVS Cargo" /></div>
          </div>
          <div>
            <label className={lbl}>Secure (SSL)</label>
            <select name="SMTP_SECURE" value={emailSettings.SMTP_SECURE} onChange={handleChange} className={inp}>
              <option value="true">Yes — SSL (port 465)</option>
              <option value="false">No — TLS/STARTTLS (port 587)</option>
            </select>
          </div>
        </div>
      )}

      {/* AWS SES */}
      {activeTab === 'aws' && (
        <div className="space-y-2">
          <div><label className={lbl}>Access Key ID</label><input name="AWS_ACCESS_KEY_ID" value={emailSettings.AWS_ACCESS_KEY_ID} onChange={handleChange} className={inp} placeholder="AKIA..." /></div>
          <div><label className={lbl}>Secret Access Key</label><input type="text" name="AWS_SECRET_ACCESS_KEY" value={emailSettings.AWS_SECRET_ACCESS_KEY} onChange={handleChange} className={inp} placeholder="Enter secret key" /></div>
          <div><label className={lbl}>Region</label><input name="AWS_REGION" value={emailSettings.AWS_REGION} onChange={handleChange} className={inp} placeholder="eu-north-1" /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className={lbl}>From Email</label><input name="AWS_SES_FROM_EMAIL" value={emailSettings.AWS_SES_FROM_EMAIL} onChange={handleChange} className={inp} placeholder="info@gvs-bh.com" /></div>
            <div><label className={lbl}>From Name</label><input name="AWS_SES_FROM_NAME" value={emailSettings.AWS_SES_FROM_NAME} onChange={handleChange} className={inp} placeholder="GVS Cargo" /></div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-[10px] text-amber-800 space-y-0.5">
            <p className="font-semibold">Before using AWS SES:</p>
            <p>• Verify sender email in AWS SES console</p>
            <p>• IAM user needs ses:SendEmail permission</p>
            <p>• In sandbox mode, verify recipient emails too</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={handleSave} disabled={saving}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#243670] text-white rounded-lg text-xs font-semibold hover:bg-blue-900 disabled:opacity-50">
          <FaSave size={11} /> {saving ? 'Saving...' : 'Save'}
        </button>
        <button onClick={handleTest} disabled={testing}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 disabled:opacity-50">
          <FaCheckCircle size={11} /> {testing ? 'Sending...' : 'Test Email'}
        </button>
      </div>
    </div>
  );
};

// ─── Main Settings Page ───────────────────────────────────────────────────────
const TABS = ['Google Maps', 'Email / AWS'];

const SettingsManagement = () => {
  const [activeTab, setActiveTab] = useState('Google Maps');

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-[#243670] p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(#243670 0.5px, transparent 0.5px), radial-gradient(#243670 0.5px, #F0F4F8 0.5px)',
        backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px'
      }} />

      <div className="relative z-10 max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-widest uppercase text-[#243670]">Settings</h1>
          <p className="text-gray-400 text-xs mt-0.5">Configure application settings</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${activeTab === tab ? 'bg-[#243670] text-white' : 'border border-gray-200 text-gray-600 hover:bg-white'}`}>
              {tab === 'Google Maps' ? '🗺️ ' : '📧 '}{tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-[#243670]/10 shadow-sm p-4">
          {activeTab === 'Google Maps' && <GoogleMapsSection />}
          {activeTab === 'Email / AWS' && <EmailSettingsSection />}
        </div>
      </div>
    </div>
  );
};

export default SettingsManagement;
