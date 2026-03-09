import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/apiConfig';
import toast from 'react-hot-toast';

const SettingsManagement = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingKey, setEditingKey] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      toast.error('Error fetching settings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (key, value) => {
    setSaving(true);
    setEditingKey(key);
    const token = localStorage.getItem('adminToken');

    try {
      const response = await fetch(`${API_BASE_URL}/settings/${key}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ value })
      });

      if (response.ok) {
        toast.success('Setting updated successfully');
        fetchSettings();
      } else {
        toast.error('Update failed');
      }
    } catch (error) {
      toast.error('Error updating setting');
    } finally {
      setSaving(false);
      setEditingKey(null);
    }
  };

  const handleSubmit = (e, key) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const value = formData.get('value');
    handleUpdate(key, value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center">
        <div className="text-[#243670] text-xl">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-[#243670] p-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-30" style={{
        backgroundImage: 'radial-gradient(#243670 0.5px, transparent 0.5px), radial-gradient(#243670 0.5px, #F0F4F8 0.5px)',
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 10px 10px'
      }}></div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-light tracking-widest uppercase text-[#243670] mb-2">
            Settings Management
          </h1>
          <p className="text-gray-500">Configure your application settings</p>
        </div>

        {/* Settings Cards */}
        <div className="space-y-6">
          {settings.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 border-2 border-[#243670]/10">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">⚙️</div>
                <h3 className="text-2xl font-semibold text-[#243670] mb-4">No Settings Found</h3>
                <p className="text-gray-600 mb-6">Run the SQL migration to add default settings.</p>
              </div>
              <div className="bg-[#243670]/5 rounded-xl p-6">
                <code className="text-sm text-[#243670] block whitespace-pre-wrap">
                  INSERT INTO settings (setting_key, setting_value, description){'\n'}
                  VALUES ('google_maps_api_key', '', 'Google Maps API Key for map components'){'\n'}
                  ON DUPLICATE KEY UPDATE setting_key = setting_key;
                </code>
              </div>
            </div>
          ) : (
            settings.map((setting) => (
              <div key={setting.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border-2 border-[#243670]/10 hover:border-[#F59E0B] transition-all duration-300">
                <div className="flex items-start gap-4 mb-6">
                  <div className="text-4xl">
                    {setting.setting_key === 'google_maps_api_key' ? '🗺️' : '⚙️'}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold text-[#243670] capitalize mb-2">
                      {setting.setting_key.replace(/_/g, ' ')}
                    </h3>
                    {setting.description && (
                      <p className="text-sm text-gray-600">{setting.description}</p>
                    )}
                  </div>
                </div>
                
                <form onSubmit={(e) => handleSubmit(e, setting.setting_key)}>
                  <div className="flex gap-4">
                    <input
                      type="text"
                      name="value"
                      defaultValue={setting.setting_value}
                      className="flex-1 border-2 border-[#243670]/20 rounded-lg p-4 focus:border-[#F59E0B] focus:outline-none transition-colors text-[#243670] font-mono text-sm"
                      placeholder={`Enter ${setting.setting_key.replace(/_/g, ' ')}`}
                    />
                    <button
                      type="submit"
                      disabled={saving && editingKey === setting.setting_key}
                      className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg hover:shadow-[#F59E0B]/30 disabled:opacity-50 transition-all duration-300 transform hover:-translate-y-1 whitespace-nowrap"
                    >
                      {saving && editingKey === setting.setting_key ? '💾 Saving...' : '💾 Save'}
                    </button>
                  </div>
                </form>
              </div>
            ))
          )}
        </div>

        {/* Info Card */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-8 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="text-4xl">💡</div>
            <div>
              <h3 className="font-bold text-blue-900 text-xl mb-3">Google Maps API Key</h3>
              <p className="text-blue-800 mb-4 leading-relaxed">
                The Google Maps API Key is used for displaying interactive maps on your website. 
                This key enables location-based features and map visualizations.
              </p>
              <div className="bg-white/60 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-900 font-semibold mb-2">How to get your API key:</p>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Visit Google Cloud Console</li>
                  <li>Create a new project or select existing one</li>
                  <li>Enable "Maps JavaScript API"</li>
                  <li>Create credentials (API Key)</li>
                  <li>Copy and paste the key above</li>
                </ol>
              </div>
              <a
                href="https://console.cloud.google.com/google/maps-apis"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                🔗 Open Google Cloud Console
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsManagement;
