import React, { useState, useCallback } from 'react';
import { FiUploadCloud, FiFile, FiX, FiRefreshCw } from 'react-icons/fi';

const FileUploadForm = ({ onUpload, isUploading }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
  }, []);

  const handleChange = (e) => {
    if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
  };

  const handleFileSelect = (file) => {
    if (file && (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel')) {
      setSelectedFile(file);
    } else {
      alert('Invalid file type. Please select an Excel file (.xlsx, .xls)');
    }
  };

  const handleUploadClick = () => {
    if (selectedFile) onUpload(selectedFile).then(() => setSelectedFile(null));
  };

  return (
    <div>
      <form onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()} className="relative">
        <label htmlFor="file-upload"
          className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-[#243670] hover:bg-gray-50'
          }`}
        >
          <FiUploadCloud className={`w-6 h-6 mb-1 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
          <p className="text-xs text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Excel files only (.xlsx, .xls)</p>
          <input id="file-upload" type="file" className="hidden" accept=".xlsx, .xls" onChange={handleChange} />
        </label>
        {dragActive && (
          <div className="absolute inset-0" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} />
        )}
      </form>

      {selectedFile && (
        <div className="mt-2 flex items-center justify-between bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg">
          <div className="flex items-center gap-2">
            <FiFile className="text-gray-500" size={14} />
            <span className="text-xs font-medium text-gray-700 truncate max-w-xs">{selectedFile.name}</span>
            <span className="text-[10px] text-gray-400">({Math.round(selectedFile.size / 1024)} KB)</span>
          </div>
          <button onClick={() => setSelectedFile(null)} className="p-0.5 rounded-full hover:bg-red-100">
            <FiX className="text-red-500" size={14} />
          </button>
        </div>
      )}

      <div className="mt-3 flex justify-end">
        <button onClick={handleUploadClick} disabled={!selectedFile || isUploading}
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md transition-all">
          {isUploading ? <><FiRefreshCw className="animate-spin" size={13} /> Uploading...</> : <><FiUploadCloud size={13} /> Upload File</>}
        </button>
      </div>
    </div>
  );
};

export default FileUploadForm;
