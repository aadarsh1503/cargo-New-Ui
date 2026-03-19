import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaSave, FaCheckCircle } from 'react-icons/fa';
import { API_BASE_URL } from '../../config/apiConfig';

const Field = ({ label, name, value, onChange, type = 'text', placeholder, hint }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type} name={name} value={value || ''} onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
    />
    {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
  </div>
);

const AWSSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [activeTab, setActiveTab] = useState('smtp');
  const [settings, setSettings] = useState({
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
        setSettings(prev => ({ ...prev, ...r.data.data }));
        setActiveTab(r.data.data.EMAIL_PROVIDER === 'aws' ? 'aws' : 'smtp');
      })
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API_BASE_URL}/aws-settings`, { settings }, { headers });
      toast.success('Settings saved');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      await axios.put(`${API_BASE_URL}/aws-settings`, { settings }, { headers });
      const r = await axios.post(`${API_BASE_URL}/aws-settings/test`, {}, { headers });
      toast.success(r.data.message);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Test failed');
    } finally {
      setTesting(false);
    }
  };

  const setProvider = (p) => {
    setSettings(prev => ({ ...prev, EMAIL_PROVIDER: p }));
    setActiveTab(p);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
    </div>
  );

  const activeProvider = settings.EMAIL_PROVIDER || 'smtp';

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Email Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Configure how the system sends emails — SMTP or AWS SES.</p>
        </div>

        {/* Provider toggle */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <p className="text-sm font-semibold text-gray-700">Active Email Provider</p>
          <div className="flex gap-3">
            {[
              { key: 'smtp', label: '📧 SMTP', desc: 'Titan, Gmail, Outlook, etc.' },
              { key: 'aws',  label: '☁️ AWS SES', desc: 'Amazon Simple Email Service' },
            ].map(opt => (
              <button
                key={opt.key}
                onClick={() => setProvider(opt.key)}
                className={`flex-1 py-3 px-4 rounded-xl border-2 text-left transition-all ${
                  activeProvider === opt.key
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className={`font-semibold text-sm ${activeProvider === opt.key ? 'text-blue-700' : 'text-gray-700'}`}>{opt.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400">
            Currently active: <span className="font-semibold text-gray-600">{activeProvider === 'aws' ? 'AWS SES' : 'SMTP'}</span>
          </p>
        </div>

        {/* SMTP Settings */}
        {activeTab === 'smtp' && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <p className="font-semibold text-gray-700 text-sm">📧 SMTP Configuration</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="SMTP Host" name="SMTP_HOST" value={settings.SMTP_HOST} onChange={handleChange} placeholder="smtp.titan.email" />
              <Field label="Port" name="SMTP_PORT" value={settings.SMTP_PORT} onChange={handleChange} placeholder="465" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Username / Email" name="SMTP_USER" value={settings.SMTP_USER} onChange={handleChange} placeholder="you@domain.com" />
              <Field label="Password" name="SMTP_PASS" value={settings.SMTP_PASS} onChange={handleChange} placeholder="••••••••" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="From Email" name="SMTP_FROM_EMAIL" value={settings.SMTP_FROM_EMAIL} onChange={handleChange} placeholder="noreply@domain.com" />
              <Field label="From Name" name="SMTP_FROM_NAME" value={settings.SMTP_FROM_NAME} onChange={handleChange} placeholder="GVS Cargo" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Secure (SSL)</label>
              <select
                name="SMTP_SECURE" value={settings.SMTP_SECURE} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="true">Yes — SSL (port 465)</option>
                <option value="false">No — TLS/STARTTLS (port 587)</option>
              </select>
            </div>
          </div>
        )}

        {/* AWS SES Settings */}
        {activeTab === 'aws' && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <p className="font-semibold text-gray-700 text-sm">☁️ AWS SES Configuration</p>
            <Field label="Access Key ID" name="AWS_ACCESS_KEY_ID" value={settings.AWS_ACCESS_KEY_ID} onChange={handleChange} placeholder="AKIA..." />
            <Field label="Secret Access Key" name="AWS_SECRET_ACCESS_KEY" value={settings.AWS_SECRET_ACCESS_KEY} onChange={handleChange} placeholder="••••••••" />
            <Field label="Region" name="AWS_REGION" value={settings.AWS_REGION} onChange={handleChange} placeholder="eu-north-1" hint="e.g. us-east-1, eu-north-1, ap-south-1" />
            <div className="grid grid-cols-2 gap-4">
              <Field label="From Email" name="AWS_SES_FROM_EMAIL" value={settings.AWS_SES_FROM_EMAIL} onChange={handleChange} placeholder="info@gvs-bh.com" hint="Must be verified in SES" />
              <Field label="From Name" name="AWS_SES_FROM_NAME" value={settings.AWS_SES_FROM_NAME} onChange={handleChange} placeholder="GVS Cargo" />
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 space-y-1">
              <p className="font-semibold">Before using AWS SES:</p>
              <p>• Verify your sender email in the AWS SES console</p>
              <p>• Ensure your IAM user has ses:SendEmail permission</p>
              <p>• If in sandbox mode, verify recipient emails too</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleSave} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition"
          >
            <FaSave /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
          <button
            onClick={handleTest} disabled={testing}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 disabled:opacity-50 transition"
          >
            <FaCheckCircle /> {testing ? 'Sending...' : 'Test & Send Email'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AWSSettings;
