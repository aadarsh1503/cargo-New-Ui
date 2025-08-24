import React, { useState, useCallback } from 'react';
import { FiUploadCloud, FiFile, FiX, FiRefreshCw } from 'react-icons/fi';

const FileUploadForm = ({ onUpload, isUploading }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);
  
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };
  
  const handleFileSelect = (file) => {
    if (file && (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel')) {
        setSelectedFile(file);
    } else {
        alert('Invalid file type. Please select an Excel file (.xlsx, .xls)');
    }
  };

  const handleUploadClick = () => {
    if (selectedFile) {
      onUpload(selectedFile).then(() => {
        setSelectedFile(null);
      });
    }
  };

  return (
    <>
      <form onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()}>
        <label
          htmlFor="file-upload"
          className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300 ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <FiUploadCloud className={`w-10 h-10 mb-3 ${dragActive ? 'text-blue-600' : 'text-gray-400'}`} />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">Excel files only (.xlsx, .xls)</p>
          </div>
          <input id="file-upload" type="file" className="hidden" accept=".xlsx, .xls" onChange={handleChange} />
        </label>
        {dragActive && <div className="absolute inset-0" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}></div>}
      </form>
      
      {selectedFile && (
        <div className="mt-4 flex items-center justify-between bg-gray-100 p-3 rounded-lg">
            <div className="flex items-center gap-3">
                <FiFile className="text-gray-600" />
                <span className="text-sm font-medium text-gray-800">{selectedFile.name}</span>
                <span className="text-sm text-gray-500">({Math.round(selectedFile.size / 1024)} KB)</span>
            </div>
            <button onClick={() => setSelectedFile(null)} className="p-1 rounded-full hover:bg-red-100">
                <FiX className="text-red-500" />
            </button>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleUploadClick}
          disabled={!selectedFile || isUploading}
          className="btn-futuristic cursor-pointer flex items-center gap-2 px-6 py-2.5 font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
        >
          {isUploading ? (
            <>
              <FiRefreshCw className="animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <FiUploadCloud />
              Upload File
            </>
          )}
        </button>
      </div>
    </>
  );
};

export default FileUploadForm;