import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast'; // 1. Toast library import karein
import * as api from './excelService';
import FileList from './FileList';
import Modal from './Modal';
import { FiCheckCircle, FiXCircle, FiLogOut } from 'react-icons/fi'; 
import FileUploadForm from './FileUploadForm';
import "./e.css";
import DashboardToggle from '../DashboardToggle/DashboardToggle';


const LogoutConfirmation = ({ onConfirm, toastId }) => (
  <div className="flex flex-col items-center gap-4 p-4 bg-white rounded-lg shadow-2xl border border-gray-200 w-80 font-noto-serif">
    <div className="relative">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
        <FiLogOut className="text-red-500 text-4xl animate-pulse" />
      </div>
    </div>
    <h3 className="text-xl font-bold text-gray-800">Are you sure?</h3>
    <p className="text-sm text-center text-gray-500">
      You will be logged out and will need to sign in again to manage files.
    </p>
    <div className="flex w-full gap-3 mt-2">
      <button
        onClick={() => toast.dismiss(toastId)} 
        className="w-full px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-all"
      >
        Cancel
      </button>
      <button
        onClick={() => {
          onConfirm(); 
          toast.dismiss(toastId); 
        }}
        className="w-full px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-md hover:bg-red-600 transition-all shadow-md"
      >
        Logout
      </button>
    </div>
  </div>
);


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
        const filesWithStatus = response.data.map(file => ({
          ...file,
          status: 'processed' 
        }));
        setFiles(filesWithStatus);
      } else {
        setFiles([]);
      }
    } catch (error) {
      setMessage({ text: 'Error fetching files.', type: 'error' });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);
  
  const handleUpload = useCallback(async (file) => {
    setIsUploading(true);
    try {
      const response = await api.uploadFile(file);
      if (response.data && response.data.id) {
       
        const newFileWithStatus = {
          ...response.data,
          status: 'uploaded'
        };
        setFiles(prevFiles => [newFileWithStatus, ...prevFiles]);
        setMessage({ text: 'File uploaded successfully!', type: 'success' });
      } else {
        console.error("Received an invalid object from the server after upload:", response.data);
        setMessage({ text: 'Error updating list. Please refresh.', type: 'error' });
      }
    } catch (error) {
      console.error("❌ Upload Failed:", error.response?.data || error.message);
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
     
      const updatedFileWithStatus = {
          ...response.data,
          status: fileToRename.status 
      };
      setFiles(files => files.map(f => f.id === fileToRename.id ? updatedFileWithStatus : f));
      setMessage({ text: 'File renamed successfully!', type: 'success' });
      setIsModalOpen(false);
    } catch (error) {
      setMessage({ text: error.response?.data?.message || 'Rename failed.', type: 'error' });
    } finally {
      clearMessage();
    }
  };


  const handleLogoutClick = () => {
    toast(
      (t) => (
        <LogoutConfirmation 
          onConfirm={onLogout} 
          toastId={t.id} 
        />
      ),
      {
        duration: Infinity, 
        style: {
          background: 'transparent',
          boxShadow: 'none',
          padding: 0,
        },
      }
    );
  };


  return (
    <div className="panel-container font-noto-serif">
        <div className="panel-header">
            <div>
                <h1 className="page-heading ml-0 lg:-ml-32 text-gradient-heading font-noto-serif">File Management</h1>
                <p className="page-subheading font-noto-serif">Upload, publish, and manage your Excel data sheets.</p>
            </div>
            <DashboardToggle activeView="excel" />
          
            {/* <button onClick={handleLogoutClick} className="btn-logout">
                <FiLogOut size={18} />
                <span>Logout</span>
            </button> */}
        </div>

        {message.text && (
            <div className={`message-box ${message.type === 'success' ? 'message-success' : 'message-error'}`}>
                {message.type === 'success' ? <FiCheckCircle /> : <FiXCircle />}
                {message.text}
            </div>
        )}
        
        <div className="panel-glass font-noto-serif">
            <h2 className="panel-title">Upload New Sheet</h2>
            <FileUploadForm onUpload={handleUpload} isUploading={isUploading} />
        </div>

        <div className="panel-glass">
            <h2 className="panel-title">Uploaded Files Repository</h2>
            <FileList 
                files={files}
                isLoading={isLoading}
                onRename={openRenameModal}
                onDelete={handleDelete}
                deletingId={deletingId}
               
            />
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Rename File">
            <form onSubmit={handleRename}>
                <label htmlFor="newName" className="modal-form-label">New File Name</label>
                <input
                    type="text"
                    id="newName"
                    value={newName || ''} // Safety check
                    onChange={(e) => setNewName(e.target.value)}
                    className="modal-form-input"
                    autoFocus
                />
                <div className="modal-actions">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                        Save Changes
                    </button>
                </div>
            </form>
        </Modal>
    </div>
  );
};

export default ExcelUploadPanel;