import React from 'react';
import FileItem from './FileItem';
import { FiRefreshCw, FiInbox } from 'react-icons/fi';

const FileList = ({ files, isLoading, onProcess, onRename, onDelete, processingId, deletingId }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <FiRefreshCw className="animate-spin text-blue-500 text-4xl" />
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-16">
        <FiInbox size={48} className="mx-auto text-gray-300" />
        <h3 className="mt-2 text-lg font-medium text-gray-800">No Files Found</h3>
        <p className="mt-1 text-sm text-gray-500">Upload a file to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      {/* ✨ Apply the 'file-table' class for vertical spacing */}
      <table className="min-w-full file-table">
        <thead className="bg-transparent">
          <tr>
            <th className="px-6 pb-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">File Details</th>
            <th className="px-6 pb-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Size</th>
            <th className="px-6 pb-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 pb-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Uploaded At</th>
            <th className="px-6 pb-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        {/* ✨ tbody is now just a container, no styling needed here */}
        <tbody>
          {files.map((file) => (
            <FileItem
              key={file.id}
              file={file}
              onProcess={onProcess}
              onRename={onRename}
              onDelete={onDelete}
              processingId={processingId}
              deletingId={deletingId}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FileList;