import React from 'react';
import FileItem from './FileItem';
import { FiRefreshCw, FiInbox } from 'react-icons/fi';

const FileList = ({ files, isLoading, onProcess, onRename, onDelete, processingId, deletingId }) => {
  if (isLoading) return (
    <div className="flex justify-center items-center py-8">
      <FiRefreshCw className="animate-spin text-blue-500 text-2xl" />
    </div>
  );

  if (files.length === 0) return (
    <div className="text-center py-8">
      <FiInbox size={32} className="mx-auto text-gray-300" />
      <p className="mt-1 text-xs font-medium text-gray-500">No files yet. Upload one above.</p>
    </div>
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full" style={{ borderCollapse: 'separate', borderSpacing: '0 4px' }}>
        <thead>
          <tr>
            <th className="px-3 pb-2 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">File</th>
            <th className="px-3 pb-2 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Size</th>
            <th className="px-3 pb-2 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
            <th className="px-3 pb-2 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Uploaded</th>
            <th className="px-3 pb-2 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <FileItem key={file.id} file={file} onProcess={onProcess} onRename={onRename}
              onDelete={onDelete} processingId={processingId} deletingId={deletingId} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FileList;
