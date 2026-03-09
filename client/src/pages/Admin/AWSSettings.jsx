import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaArrowLeft, FaSave, FaCheckCircle, FaKey, FaEnvelope } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/apiConfig';

const AWSSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [settings, setSettings] = useState({
    AWS_ACCESS_KEY_ID: '',
    AWS_SECRET_ACCESS_KEY: '',
    AWS_REGION: '',
    AWS_SES_FROM_EMAIL: '',
    AWS_SES_FROM_NAME: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_BASE_URL}/aws-settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('❌ Failed to fetch AWS settings');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(
        `${API_BASE_URL}/aws-settings`,
        { settings },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('✅ AWS settings saved successfully!');
      fetchSettings(); // Refresh to get masked values
    } catch (error) {
      console.error('Save error:', error);
      toast.error('❌ Failed to save AWS settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post(
        `${API_BASE_URL}/aws-settings/test`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('✅ ' + response.data.message);
    } catch (error) {
      console.error('Test error:', error);
      toast.error('❌ ' + (error.response?.data?.message || 'Failed to send test email'));
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0284C7]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#0284C7] mb-2">AWS SES Settings</h1>
          <p className="text-gray-600">
            Configure your AWS SES credentials for sending emails from the application.
          </p>
        </div>

        {/* Settings Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-6">
            {/* AWS Access Key ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaKey className="inline mr-2" />
                AWS Access Key ID
              </label>
              <input
                type="text"
                name="AWS_ACCESS_KEY_ID"
                value={settings.AWS_ACCESS_KEY_ID}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0284C7] focus:border-transparent"
                placeholder="Enter AWS Access Key ID"
              />
              <p className="text-xs text-gray-500 mt-1">
                Your AWS IAM user access key ID
              </p>
            </div>

            {/* AWS Secret Access Key */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaKey className="inline mr-2" />
                AWS Secret Access Key
              </label>
              <input
                type="text"
                name="AWS_SECRET_ACCESS_KEY"
                value={settings.AWS_SECRET_ACCESS_KEY}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0284C7] focus:border-transparent"
                placeholder="Enter AWS Secret Access Key"
              />
              <p className="text-xs text-gray-500 mt-1">
                Your AWS IAM user secret access key
              </p>
            </div>

            {/* AWS Region */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AWS Region
              </label>
              <input
                type="text"
                name="AWS_REGION"
                value={settings.AWS_REGION}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0284C7] focus:border-transparent"
                placeholder="e.g., eu-north-1, us-east-1, ap-south-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                The AWS region where your SES is configured (e.g., eu-north-1)
              </p>
            </div>

            {/* SES From Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaEnvelope className="inline mr-2" />
                From Email Address
              </label>
              <input
                type="email"
                name="AWS_SES_FROM_EMAIL"
                value={settings.AWS_SES_FROM_EMAIL}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0284C7] focus:border-transparent"
                placeholder="info@gvs-bh.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                The verified email address to send emails from
              </p>
            </div>

            {/* SES From Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Name
              </label>
              <input
                type="text"
                name="AWS_SES_FROM_NAME"
                value={settings.AWS_SES_FROM_NAME}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0284C7] focus:border-transparent"
                placeholder="Global Vision Solutions"
              />
              <p className="text-xs text-gray-500 mt-1">
                The display name for outgoing emails
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8 pt-6 border-t">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#0284C7] text-white rounded-lg hover:bg-[#0369A1] transition disabled:opacity-50"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FaSave />
                  Save Settings
                </>
              )}
            </button>

            <button
              onClick={handleTest}
              disabled={testing}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              {testing ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Testing...</span>
                </>
              ) : (
                <>
                  <FaCheckCircle />
                  Test Connection
                </>
              )}
            </button>
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Important Notes:</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Make sure your AWS IAM user has SES send email permissions</li>
              <li>Verify your sender email address in AWS SES console</li>
              <li>If in sandbox mode, verify recipient emails too</li>
              <li>All settings are stored securely in the database</li>
              <li>Test the connection after saving to ensure everything works</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AWSSettings;
