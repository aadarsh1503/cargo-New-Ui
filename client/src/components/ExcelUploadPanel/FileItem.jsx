import React from 'react';
import { FiFile, FiTrash2, FiRefreshCw } from 'react-icons/fi';

const FileItem = ({ file, onProcess, onRename, onDelete, processingId, deletingId }) => {
  const isDeleting = deletingId === file.id;

  if (!file?.id) return null;

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <FiFile className="text-blue-500 shrink-0" size={14} />
          <div>
            <p className="text-xs font-semibold text-gray-800 truncate max-w-[180px]">{file.fileName}</p>
            <a href={file.filePath} target="_blank" rel="noopener noreferrer"
              className="text-[10px] text-gray-400 hover:text-blue-600">View Original</a>
          </div>
        </div>
      </td>
      <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">
        {Math.round(file.fileSize / 1024)} KB
      </td>
      <td className="px-3 py-2 whitespace-nowrap">
        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-blue-100 text-blue-700">Uploaded</span>
      </td>
      <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">
        {new Date(file.uploadedAt).toLocaleString()}
      </td>
      <td className="px-3 py-2 whitespace-nowrap">
        <button onClick={() => onDelete(file.id)} disabled={isDeleting}
          className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
          {isDeleting ? <FiRefreshCw size={12} className="animate-spin" /> : <FiTrash2 size={12} />}
          Delete
        </button>
      </td>
    </tr>
  );
};

export default FileItem;
