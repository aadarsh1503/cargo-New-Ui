import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import * as api from './ExcelService';
import FileList from './FileList';
import Modal from './Modal';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';
import FileUploadForm from './FileUploadForm';
import "./e.css";

const ExcelUploadPanel = ({ onLogout }) => {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileToRename, setFileToRename] = useState(null);
  const [newName, setNewName] = useState('');

  const clearMessage = () => setTimeout(() => setMessage({ text: '', type: '' }), 4000);

  const fetchFiles = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.getFiles();
      if (Array.isArray(response.data)) {
        setFiles(response.data.map(file => ({ ...file, status: 'processed' })));
      } else {
        setFiles([]);
      }
    } catch (error) {
      setMessage({ text: 'Error fetching files.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const handleUpload = useCallback(async (file) => {
    setIsUploading(true);
    try {
      const response = await api.uploadFile(file);
      if (response.data && response.data.id) {
        setFiles(prev => [{ ...response.data, status: 'uploaded' }, ...prev]);
        setMessage({ text: 'File uploaded successfully!', type: 'success' });
      } else {
        setMessage({ text: 'Error updating list. Please refresh.', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: error.response?.data?.message || 'Upload failed.', type: 'error' });
    } finally {
      setIsUploading(false);
      clearMessage();
    }
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (window.confirm('Are you sure you want to delete this file permanently?')) {
      setDeletingId(id);
      try {
        await api.deleteFile(id);
        setFiles(files => files.filter(f => f.id !== id));
        setMessage({ text: 'File deleted successfully!', type: 'success' });
      } catch (error) {
        setMessage({ text: error.response?.data?.message || 'Deletion failed.', type: 'error' });
      } finally {
        setDeletingId(null);
        clearMessage();
      }
    }
  }, []);

  const openRenameModal = (file) => {
    setFileToRename(file);
    setNewName(file.fileName);
    setIsModalOpen(true);
  };

  const handleRename = async (e) => {
    e.preventDefault();
    if (!fileToRename || !newName.trim()) return;
    try {
      const response = await api.renameFile(fileToRename.id, newName.trim());
      setFiles(files => files.map(f => f.id === fileToRename.id ? { ...response.data, status: fileToRename.status } : f));
      setMessage({ text: 'File renamed successfully!', type: 'success' });
      setIsModalOpen(false);
    } catch (error) {
      setMessage({ text: error.response?.data?.message || 'Rename failed.', type: 'error' });
    } finally {
      clearMessage();
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] p-4">
      <div className="max-w-5xl mx-auto space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#243670] tracking-widest uppercase">File Management</h1>
            <p className="text-gray-400 text-xs mt-0.5">Upload and manage Excel data sheets</p>
          </div>
          <span className="text-xs text-gray-400">{files.length} file{files.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.type === 'success' ? <FiCheckCircle size={14} /> : <FiXCircle size={14} />}
            {message.text}
          </div>
        )}

        {/* Upload */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-[#243670]/10 shadow-sm p-4">
          <h2 className="text-xs font-semibold text-[#243670] uppercase tracking-widest mb-3">Upload New Sheet</h2>
          <FileUploadForm onUpload={handleUpload} isUploading={isUploading} />
        </div>

        {/* File list */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-[#243670]/10 shadow-sm p-4">
          <h2 className="text-xs font-semibold text-[#243670] uppercase tracking-widest mb-3">Uploaded Files ({files.length})</h2>
          <FileList
            files={files}
            isLoading={isLoading}
            onRename={openRenameModal}
            onDelete={handleDelete}
            deletingId={deletingId}
          />
        </div>

        {/* Rename Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Rename File">
          <form onSubmit={handleRename}>
            <label htmlFor="newName" className="block text-xs font-medium text-gray-600 mb-1">New File Name</label>
            <input
              type="text" id="newName" value={newName || ''}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#243670]"
              autoFocus
            />
            <div className="mt-3 flex justify-end gap-2">
              <button type="button" onClick={() => setIsModalOpen(false)}
                className="px-4 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
                Cancel
              </button>
              <button type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#243670] rounded-lg hover:bg-blue-900">
                Save
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default ExcelUploadPanel;
