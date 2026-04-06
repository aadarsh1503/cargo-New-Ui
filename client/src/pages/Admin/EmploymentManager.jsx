import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaWhatsapp, FaFileExcel, FaTrash, FaCheckSquare, FaSquare, FaEnvelope } from 'react-icons/fa';
import { FiX } from 'react-icons/fi';
import StageEmailModal from './StageEmailModal';
import { API_BASE_URL } from '../../config/apiConfig';

const STAGE_CFG = {
  Applied:       { bg: 'bg-blue-100',   text: 'text-blue-800' },
  Interview:     { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  Accepted:      { bg: 'bg-green-100',  text: 'text-green-800' },
  Rejected:      { bg: 'bg-red-100',    text: 'text-red-800' },
  Completion:    { bg: 'bg-purple-100', text: 'text-purple-800' },
  Certification: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
};

const STAGES = ['Applied', 'Interview', 'Accepted', 'Rejected', 'Completion', 'Certification'];
const DEPARTMENTS = ['IT', 'Finance', 'Admin', 'HR', 'Marketing', 'Operations'];

const STAGE_FLOW = {
  Applied:       ['Applied', 'Interview'],
  Interview:     ['Interview', 'Accepted', 'Rejected'],
  Accepted:      ['Accepted', 'Completion', 'Certification'],
  Rejected:      ['Rejected'],
  Completion:    ['Completion', 'Certification'],
  Certification: ['Certification'],
};

const ResumeViewer = ({ url }) => {
  const lower = url.toLowerCase();
  const isPdf = lower.includes('.pdf');
  const isWord = lower.includes('.doc') || lower.includes('.docx');
  const isImage = /\.(png|jpe?g|gif|webp|svg)(\?|$)/.test(lower);
  const isRaw = lower.includes('/raw/upload/');
  const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;

  if (isImage) return (
    <div>
      <img src={url} alt="Resume" className="max-w-full rounded border" />
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs mt-1 block">Open in new tab</a>
    </div>
  );
  return (
    <div>
      <iframe src={isPdf ? url : isWord ? googleDocsUrl : isRaw ? googleDocsUrl : url}
        title="Resume" className="w-full rounded border" style={{ height: '400px' }} />
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs mt-1 block">
        {isPdf ? 'Open PDF in new tab' : isWord ? 'Download Word file' : 'Download / Open in new tab'}
      </a>
    </div>
  );
};

const Field = ({ label, value }) => (
  <div>
    <p className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</p>
    <p className="text-xs font-semibold text-gray-800 break-all">{value || 'N/A'}</p>
  </div>
);

const Section = ({ title, children }) => (
  <div>
    <p className="text-xs font-bold text-[#0284C7] uppercase tracking-widest mb-2 pb-1 border-b border-blue-100">{title}</p>
    {children}
  </div>
);

const EmploymentManager = () => {
  const [applications, setApplications] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showStageEmailModal, setShowStageEmailModal] = useState(false);
  const [pendingStageChange, setPendingStageChange] = useState(null);
  const [selectedForDelete, setSelectedForDelete] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [customEmailData, setCustomEmailData] = useState({ subject: '', message: '', attachmentUrl: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [filters, setFilters] = useState({ stage: '', department: '' });
  const [search, setSearch] = useState('');

  useEffect(() => { fetchApplications(); }, []);

  useEffect(() => {
    let f = [...applications];
    if (filters.stage) f = f.filter(a => a.stage === filters.stage);
    if (filters.department) f = f.filter(a => a.department?.toLowerCase().includes(filters.department.toLowerCase()));
    if (search) {
      const q = search.toLowerCase();
      f = f.filter(a => a.fullName?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q) || a.employmentDesired?.toLowerCase().includes(q));
    }
    setFiltered(f);
    setCurrentPage(1);
  }, [filters, applications, search]);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(`${API_BASE_URL}/employment/applications`, { headers: { Authorization: `Bearer ${token}` } });
      setApplications(res.data.data);
      setFiltered(res.data.data);
    } catch { toast.error('Failed to fetch applications'); }
    finally { setLoading(false); }
  };

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentApps = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const updateStage = (id, newStage) => {
    const app = applications.find(a => a.id === id);
    if (!app || app.stage === newStage) return;
    setPendingStageChange({ id, newStage });
    setSelected(app);
    setShowStageEmailModal(true);
  };

  const exportToExcel = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(`${API_BASE_URL}/employment/export`, { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `employment_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link); link.click(); link.remove();
      toast.success('File downloaded');
    } catch { toast.error('Failed to export'); }
  };

  const sendCustomEmail = async () => {
    if (!customEmailData.subject.trim() || !customEmailData.message.trim()) return toast.error('Subject and message required');
    setIsSendingEmail(true);
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(`${API_BASE_URL}/employment/applications/send-custom-email`,
        { applicationIds: [selected.id], ...customEmailData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Email sent');
      setShowEmailModal(false);
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to send email'); }
    finally { setIsSendingEmail(false); }
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (deleteTarget.type === 'single') {
        await axios.delete(`${API_BASE_URL}/employment/applications/${deleteTarget.data.id}`, { headers: { Authorization: `Bearer ${token}` } });
        toast.success('Deleted');
      } else {
        await axios.post(`${API_BASE_URL}/employment/applications/bulk-delete`, { applicationIds: deleteTarget.data }, { headers: { Authorization: `Bearer ${token}` } });
        toast.success(`${deleteTarget.data.length} deleted`);
        setSelectedForDelete([]);
      }
      fetchApplications();
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    } catch { toast.error('Failed to delete'); }
  };

  const toggleSelect = (id) => setSelectedForDelete(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleAll = () => setSelectedForDelete(selectedForDelete.length === filtered.length ? [] : filtered.map(a => a.id));

  const stageCfg = (stage) => STAGE_CFG[stage] || { bg: 'bg-gray-100', text: 'text-gray-700' };

  return (
    <div className="flex flex-col md:flex-row md:h-[calc(100vh-57px)] md:overflow-hidden bg-gray-50">
      {/* Left — table list */}
      <div className="w-full md:w-[480px] border-b md:border-b-0 md:border-r border-gray-200 flex flex-col flex-shrink-0 bg-white">
        {/* Toolbar */}
        <div className="p-2 border-b border-gray-100 space-y-1.5">
          <div className="flex gap-1.5">
            <input type="text" placeholder="Search name, email, position…" value={search} onChange={e => setSearch(e.target.value)}
              className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#0284C7]" />
            <select value={filters.stage} onChange={e => setFilters(p => ({ ...p, stage: e.target.value }))}
              className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none bg-white">
              <option value="">All Stages</option>
              {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filters.department} onChange={e => setFilters(p => ({ ...p, department: e.target.value }))}
              className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none bg-white">
              <option value="">All Depts</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {selectedForDelete.length > 0 && (
                <button onClick={() => { setDeleteTarget({ type: 'bulk', data: selectedForDelete }); setShowDeleteConfirm(true); }}
                  className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded text-[10px] font-semibold hover:bg-red-600">
                  <FaTrash size={9} /> Delete ({selectedForDelete.length})
                </button>
              )}
              <button onClick={exportToExcel}
                className="flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded text-[10px] font-semibold hover:bg-green-700">
                <FaFileExcel size={9} /> Export
              </button>
            </div>
            <span className="text-[10px] text-gray-400">{filtered.length} applications</span>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto md:max-h-none max-h-64">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0284C7]" />
            </div>
          ) : currentApps.length === 0 ? (
            <p className="text-center py-8 text-gray-400 text-xs">No applications found</p>
          ) : (
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-gray-50 z-10">
                <tr className="border-b border-gray-200">
                  <th className="px-2 py-1.5 w-6">
                    <button onClick={toggleAll} className="text-gray-500 hover:text-[#0284C7]">
                      {selectedForDelete.length === filtered.length ? <FaCheckSquare size={12} className="text-[#0284C7]" /> : <FaSquare size={12} />}
                    </button>
                  </th>
                  <th className="text-left px-2 py-1.5 font-semibold text-gray-500 uppercase tracking-wide text-[10px]">Name</th>
                  <th className="text-left px-2 py-1.5 font-semibold text-gray-500 uppercase tracking-wide text-[10px]">Position</th>
                  <th className="text-left px-2 py-1.5 font-semibold text-gray-500 uppercase tracking-wide text-[10px]">Stage</th>
                  <th className="text-left px-2 py-1.5 font-semibold text-gray-500 uppercase tracking-wide text-[10px]">Date</th>
                  <th className="px-2 py-1.5 text-[10px]"></th>
                </tr>
              </thead>
              <tbody>
                {currentApps.map(app => {
                  const sc = stageCfg(app.stage);
                  const isActive = selected?.id === app.id;
                  return (
                    <tr key={app.id} onClick={() => setSelected(app)}
                      className={`border-b border-gray-100 cursor-pointer transition-colors ${isActive ? 'bg-blue-50 border-l-2 border-l-[#0284C7]' : selectedForDelete.includes(app.id) ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                      <td className="px-2 py-1.5" onClick={e => { e.stopPropagation(); toggleSelect(app.id); }}>
                        {selectedForDelete.includes(app.id) ? <FaCheckSquare size={11} className="text-[#0284C7]" /> : <FaSquare size={11} className="text-gray-400" />}
                      </td>
                      <td className="px-2 py-1.5">
                        <p className="font-semibold text-gray-800 truncate max-w-[100px]">{app.fullName}</p>
                        <p className="text-gray-400 truncate max-w-[100px]">{app.email}</p>
                      </td>
                      <td className="px-2 py-1.5 text-gray-600 truncate max-w-[80px]">{app.employmentDesired || '—'}</td>
                      <td className="px-2 py-1.5">
                        <select value={app.stage} onClick={e => e.stopPropagation()}
                          onChange={e => updateStage(app.id, e.target.value)}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold cursor-pointer ${sc.bg} ${sc.text}`}>
                          {STAGES.map(s => {
                            const allowed = STAGE_FLOW[app.stage] || ['Applied'];
                            return <option key={s} value={s} disabled={!allowed.includes(s)}>{s}</option>;
                          })}
                        </select>
                      </td>
                      <td className="px-2 py-1.5 text-gray-400 whitespace-nowrap">{new Date(app.created_at).toLocaleDateString()}</td>
                      <td className="px-2 py-1.5">
                        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                          <button onClick={() => { setSelected(app); setCustomEmailData({ subject: '', message: '', attachmentUrl: '' }); setShowEmailModal(true); }}
                            className="text-purple-500 hover:text-purple-700" title="Email"><FaEnvelope size={11} /></button>
                          <button onClick={() => { const n = app.mobileContact?.replace(/[^0-9]/g, ''); if (n) window.open(`https://wa.me/${n}`, '_blank'); }}
                            className="text-green-500 hover:text-green-700" title="WhatsApp"><FaWhatsapp size={11} /></button>
                          <button onClick={() => { setDeleteTarget({ type: 'single', data: app }); setShowDeleteConfirm(true); }}
                            className="text-red-500 hover:text-red-700" title="Delete"><FaTrash size={11} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="border-t border-gray-100 px-2 py-1.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-gray-400">{indexOfFirst + 1}–{Math.min(indexOfLast, filtered.length)} of {filtered.length}</span>
              <select value={itemsPerPage} onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="border border-gray-200 rounded px-1 py-0.5 text-[10px] bg-white">
                {[10, 25, 50].map(n => <option key={n} value={n}>{n}/page</option>)}
              </select>
            </div>
            {totalPages > 1 && (
              <div className="flex gap-1">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="px-2 py-0.5 border border-gray-200 rounded text-[10px] disabled:opacity-40 hover:bg-gray-50">‹</button>
                <span className="px-2 py-0.5 text-[10px] text-gray-500">{currentPage}/{totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  className="px-2 py-0.5 border border-gray-200 rounded text-[10px] disabled:opacity-40 hover:bg-gray-50">›</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right — detail panel */}
      <div className="flex-1 overflow-y-auto p-4">
        {!selected ? (
          <p className="text-gray-400 text-xs">Select an application to view details</p>
        ) : (
          <div className="max-w-2xl space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-800">{selected.fullName}</p>
                <p className="text-xs text-gray-400">{selected.email} · #{selected.id}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setCustomEmailData({ subject: '', message: '', attachmentUrl: '' }); setShowEmailModal(true); }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded text-xs font-semibold hover:bg-purple-200">
                  <FaEnvelope size={10} /> Email
                </button>
                <button onClick={() => { const n = selected.mobileContact?.replace(/[^0-9]/g, ''); if (n) window.open(`https://wa.me/${n}`, '_blank'); }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded text-xs font-semibold hover:bg-green-200">
                  <FaWhatsapp size={10} /> WhatsApp
                </button>
              </div>
            </div>

            <Section title="Personal Information">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                <Field label="Full Name" value={selected.fullName} />
                <Field label="Email" value={selected.email} />
                <Field label="Mobile" value={selected.mobileContact} />
                <Field label="WhatsApp" value={selected.whatsapp} />
                <Field label="Date of Birth" value={selected.dateOfBirth ? new Date(selected.dateOfBirth).toLocaleDateString() : null} />
                <Field label="Gender" value={selected.gender} />
                <Field label="Nationality" value={selected.nationality} />
              </div>
            </Section>

            <Section title="Address">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                <div className="col-span-1 sm:col-span-2 md:col-span-3"><Field label="Current Address" value={selected.currentAddress} /></div>
                <Field label="City" value={selected.city} />
                <Field label="Country" value={selected.country} />
                <Field label="Postal Code" value={selected.postalCode} />
              </div>
            </Section>

            <Section title="Identification">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                <Field label="CPR / National ID" value={selected.cprNationalId} />
                <Field label="Passport ID" value={selected.passportId} />
                <Field label="Passport Validity" value={selected.passportValidity ? new Date(selected.passportValidity).toLocaleDateString() : null} />
                <Field label="Visa Status" value={selected.visaStatus} />
                <Field label="Visa Validity" value={selected.visaValidity ? new Date(selected.visaValidity).toLocaleDateString() : null} />
              </div>
            </Section>

            <Section title="Education & Experience">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                <Field label="Education Level" value={selected.educationLevel} />
                <Field label="Course / Degree" value={selected.courseDegree} />
                <Field label="Currently Employed" value={selected.currentlyEmployed} />
                <Field label="Years of Experience" value={selected.yearsOfExperience} />
                <Field label="Position Applied" value={selected.employmentDesired} />
                <Field label="Expected Salary (BHD)" value={selected.expectedSalary} />
                <div className="col-span-1 sm:col-span-2 md:col-span-3"><Field label="Skills" value={selected.skills} /></div>
              </div>
            </Section>

            <Section title="Work Preferences">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                <Field label="Available to Start" value={selected.availableStart} />
                <Field label="Shift Available" value={selected.shiftAvailable} />
                <Field label="Can Travel" value={selected.canTravel} />
                <Field label="Driving License" value={selected.drivingLicense} />
              </div>
            </Section>

            <Section title="Client Leads Strategy">
              <p className="text-xs text-gray-700 whitespace-pre-wrap">{selected.clientLeadsStrategy || 'N/A'}</p>
            </Section>

            {(selected.ref1Name || selected.ref2Name || selected.ref3Name) && (
              <Section title="References">
                <div className="space-y-2">
                  {[1, 2, 3].map(n => {
                    const name = selected[`ref${n}Name`];
                    if (!name) return null;
                    return (
                      <div key={n} className="bg-gray-50 rounded p-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        <Field label={`Ref ${n} Name`} value={name} />
                        <Field label="Contact" value={selected[`ref${n}Contact`]} />
                        <Field label="Email" value={selected[`ref${n}Email`]} />
                      </div>
                    );
                  })}
                </div>
              </Section>
            )}

            {selected.resume_url && (
              <Section title="Resume">
                <ResumeViewer url={selected.resume_url} />
              </Section>
            )}

            <Section title="Application Info">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                <Field label="Application ID" value={`#${selected.id}`} />
                <Field label="Current Stage" value={selected.stage} />
                <Field label="Applied Date" value={new Date(selected.created_at).toLocaleString()} />
                <Field label="Last Updated" value={new Date(selected.updated_at).toLocaleString()} />
              </div>
            </Section>
          </div>
        )}
      </div>

      {/* Custom Email Modal */}
      {showEmailModal && selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-800">Send Email</p>
                <p className="text-xs text-gray-400">To: {selected.fullName} ({selected.email})</p>
              </div>
              <button onClick={() => setShowEmailModal(false)} className="p-1 rounded-full hover:bg-gray-100"><FiX size={16} /></button>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Subject *</label>
              <input type="text" value={customEmailData.subject} onChange={e => setCustomEmailData(p => ({ ...p, subject: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#0284C7]" placeholder="Email subject" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Message *</label>
              <textarea value={customEmailData.message} onChange={e => setCustomEmailData(p => ({ ...p, message: e.target.value }))}
                rows={6} className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#0284C7] resize-none"
                placeholder="Write your message..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Attachment URL (optional)</label>
              <input type="url" value={customEmailData.attachmentUrl} onChange={e => setCustomEmailData(p => ({ ...p, attachmentUrl: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#0284C7]" placeholder="https://..." />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setShowEmailModal(false)} disabled={isSendingEmail}
                className="px-4 py-1.5 border border-gray-200 rounded-lg text-xs hover:bg-gray-50">Cancel</button>
              <button onClick={sendCustomEmail} disabled={isSendingEmail}
                className="px-4 py-1.5 bg-[#0284C7] text-white rounded-lg text-xs font-semibold hover:bg-[#0369A1] disabled:opacity-50 flex items-center gap-1.5">
                {isSendingEmail ? 'Sending...' : <><FaEnvelope size={10} /> Send Email</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-4 space-y-3">
            <p className="text-sm font-bold text-gray-800">Confirm Delete</p>
            <p className="text-xs text-gray-600">
              {deleteTarget?.type === 'single'
                ? `Delete application of ${deleteTarget.data.fullName}? This cannot be undone.`
                : `Delete ${deleteTarget?.data.length} selected application(s)? This cannot be undone.`}
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => { setShowDeleteConfirm(false); setDeleteTarget(null); }}
                className="px-4 py-1.5 border border-gray-200 rounded-lg text-xs hover:bg-gray-50">Cancel</button>
              <button onClick={confirmDelete}
                className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Stage Email Modal */}
      <StageEmailModal
        isOpen={showStageEmailModal}
        onClose={() => { setShowStageEmailModal(false); setPendingStageChange(null); setSelected(null); }}
        selectedApplications={selected ? [selected] : []}
        newStage={pendingStageChange?.newStage || ''}
        onSuccess={() => { fetchApplications(); setPendingStageChange(null); setSelected(null); setShowStageEmailModal(false); }}
      />
    </div>
  );
};

export default EmploymentManager;
