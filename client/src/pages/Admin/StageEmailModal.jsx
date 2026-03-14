import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaEnvelope, FaUpload } from 'react-icons/fa';
import { API_BASE_URL } from '../../config/apiConfig';

const StageEmailModal = ({ isOpen, onClose, selectedApplications, newStage, onSuccess }) => {
  const [emailData, setEmailData] = useState({
    subject: '',
    emailContent: '',
    date: '',
    time: '',
    venue: '',
    certificateUrl: ''
  });
  const [isSending, setIsSending] = useState(false);
  const [isUploadingCertificate, setIsUploadingCertificate] = useState(false);

  // Generate default email content based on stage
  const generateDefaultEmailContent = (stage, app) => {
    if (!app) return '';

    if (stage === 'Interview') {
      return `Dear ${app.fullName},

We are pleased to inform you that your application for the ${app.employmentDesired} position has been shortlisted.

Interview Details:
Date: ${emailData.date ? new Date(emailData.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '[Please fill in the date]'}
Time: ${emailData.time || '[Please fill in the time]'}
Venue: ${emailData.venue || '[Please fill in the venue]'}

Please confirm your attendance by replying to this email.

We look forward to meeting you!

Best regards,
GVS HR Team
Global Vision Solutions`;
    } else if (stage === 'Accepted') {
      return `Dear ${app.fullName},

Congratulations! You have been selected for the ${app.employmentDesired} position at Global Vision Solutions.

Further details regarding your joining date and onboarding process will be shared with you shortly.

We look forward to having you on our team!

Best regards,
GVS HR Team
Global Vision Solutions`;
    } else if (stage === 'Rejected') {
      return `Dear ${app.fullName},

Thank you for your interest in the ${app.employmentDesired} position at Global Vision Solutions and for taking the time to apply.

After careful consideration, we regret to inform you that we will not be moving forward with your application at this time.

We appreciate your interest in GVS and wish you all the best in your future endeavors.

Best regards,
GVS HR Team
Global Vision Solutions`;
    } else if (stage === 'Completion') {
      return `Dear ${app.fullName},

Congratulations on successfully completing your probation period with GVS as ${app.employmentDesired}!

We appreciate your hard work and dedication during your time with us.

We wish you all the best in your continued career with GVS!

Best regards,
GVS HR Team
Global Vision Solutions`;
    } else if (stage === 'Certification') {
      return `Dear ${app.fullName},

Please find attached your employment completion certificate for your successful completion at Global Vision Solutions.

We are proud of your achievements and wish you continued success in your career.

Thank you for being a part of GVS!

Best regards,
GVS HR Team
Global Vision Solutions`;
    }
    return '';
  };

  useEffect(() => {
    if (isOpen && newStage && selectedApplications && selectedApplications.length > 0) {
      const app = selectedApplications[0];
      
      // Set default subject based on stage
      const defaultSubjects = {
        'Interview': 'Interview Invitation - GVS Employment',
        'Accepted': 'Congratulations! Job Offer - GVS',
        'Rejected': 'Update on Your Job Application - GVS',
        'Completion': 'Employment Completion - GVS',
        'Certification': 'Your Employment Certificate - GVS'
      };
      
      setEmailData({
        subject: defaultSubjects[newStage] || 'Employment Application Update - GVS',
        emailContent: generateDefaultEmailContent(newStage, app),
        date: '',
        time: '',
        venue: '',
        certificateUrl: ''
      });
    }
  }, [isOpen, newStage, selectedApplications]);

  // Update email content when interview details change
  useEffect(() => {
    if (newStage === 'Interview' && selectedApplications && selectedApplications.length > 0) {
      const app = selectedApplications[0];
      setEmailData(prev => ({
        ...prev,
        emailContent: generateDefaultEmailContent(newStage, app)
      }));
    }
  }, [emailData.date, emailData.time, emailData.venue]);

  const handleCertificateUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('❌ File size must be less than 5MB');
      return;
    }

    setIsUploadingCertificate(true);
    try {
      const formData = new FormData();
      formData.append('certificate', file);

      const token = localStorage.getItem('adminToken');
      const response = await axios.post(
        `${API_BASE_URL}/employment/upload-certificate`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setEmailData(prev => ({ ...prev, certificateUrl: response.data.url }));
      toast.success('✅ Certificate uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('❌ Failed to upload certificate');
    } finally {
      setIsUploadingCertificate(false);
    }
  };

  const handleSendEmail = async () => {
    // Validate required fields based on stage
    if (newStage === 'Interview') {
      if (!emailData.date || !emailData.time || !emailData.venue) {
        toast.error('❌ Date, time, and venue are required for interview stage');
        retu
rn;
      }
    }

    if (newStage === 'Certification' && !emailData.certificateUrl) {
      toast.error('❌ Certificate is required for certification stage');
      return;
    }

    setIsSending(true);
    try {
      const token = localStorage.getItem('adminToken');
      const applicationIds = selectedApplications.map(app => app.id);

      await axios.post(
        `${API_BASE_URL}/employment/send-stage-email`,
        {
          applicationIds,
          newStage,
          subject: emailData.subject,
          message: emailData.emailContent,
          date: emailData.date || null,
          time: emailData.time || null,
          venue: emailData.venue || null,
          certificateUrl: emailData.certificateUrl || null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('✅ Email sent and stage updated successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Send error:', error);
      toast.error(error.response?.data?.message || '❌ Failed to send email');
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-[#0284C7]">
                Send Stage Update Email - {newStage}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                To: {selectedApplications.map(app => app.name).join(', ')}
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isSending}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={emailData.subject}
                onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#0284C7] focus:border-transparent"
                placeholder="Email subject"
              />
            </div>

            {/* Interview specific fields */}
            {newStage === 'Interview' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Interview Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={emailData.date}
                      onChange={(e) => setEmailData({ ...emailData, date: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#0284C7] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Interview Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={emailData.time}
                      onChange={(e) => setEmailData({ ...emailData, time: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#0284C7] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Venue <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={emailData.venue}
                      onChange={(e) => setEmailData({ ...emailData, venue: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#0284C7] focus:border-transparent"
                      placeholder="Interview venue"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Certification specific fields */}
            {newStage === 'Certification' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Certificate <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    onChange={handleCertificateUpload}
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    id="certificate-upload"
                    disabled={isUploadingCertificate}
                  />
                  <label
                    htmlFor="certificate-upload"
                    className={`flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition ${
                      isUploadingCertificate ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <FaUpload />
                    {isUploadingCertificate ? 'Uploading...' : 'Choose File'}
                  </label>
                  {emailData.certificateUrl && (
                    <a
                      href={emailData.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View Uploaded Certificate
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Email Content - Editable */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Content <span className="text-red-500">*</span>
              </label>
              <textarea
                value={emailData.emailContent}
                onChange={(e) => setEmailData({ ...emailData, emailContent: e.target.value })}
                rows="14"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#0284C7] focus:border-transparent font-mono text-sm"
                placeholder="Email content..."
              />
              <p className="text-xs text-gray-500 mt-1">
                You can edit the email content above. The email will be sent exactly as written.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={onClose}
                disabled={isSending}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmail}
                disabled={isSending || isUploadingCertificate}
                className="px-6 py-2 bg-[#0284C7] text-white rounded-lg hover:bg-[#0369A1] disabled:opacity-50 flex items-center gap-2 min-w-[180px] justify-center"
              >
                {isSending ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <FaEnvelope />
                    Send Email & Update Stage
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StageEmailModal;
