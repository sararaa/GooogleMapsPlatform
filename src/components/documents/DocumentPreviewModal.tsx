import React from 'react';
import { X, Download, ExternalLink, Calendar, User, FolderOpen } from 'lucide-react';
import { mockProjects } from '../../data/mockData';

interface Document {
  id: string;
  name: string;
  type: 'permits' | 'work_orders' | 'invoices' | 'inspections' | 'other';
  projectId: string;
  uploadDate: string;
  uploadedBy: string;
  fileSize: number;
  fileUrl: string;
  description?: string;
}

interface DocumentPreviewModalProps {
  document: Document;
  onClose: () => void;
  onDownload: () => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({ 
  document, 
  onClose, 
  onDownload 
}) => {
  const project = mockProjects.find(p => p.id === document.projectId);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'permits': return '📋';
      case 'work_orders': return '🔧';
      case 'invoices': return '💰';
      case 'inspections': return '🔍';
      case 'other': return '📄';
      default: return '📄';
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      permits: 'bg-blue-100 text-blue-800',
      work_orders: 'bg-orange-100 text-orange-800',
      invoices: 'bg-green-100 text-green-800',
      inspections: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const isImageFile = (filename: string) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    return imageExtensions.includes(getFileExtension(filename));
  };

  const isPDFFile = (filename: string) => {
    return getFileExtension(filename) === 'pdf';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{getTypeIcon(document.type)}</div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{document.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(document.type)}`}>
                  {document.type.replace('_', ' ')}
                </span>
                <span className="text-sm text-gray-600">
                  {formatFileSize(document.fileSize)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onDownload}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download size={16} />
              Download
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-120px)]">
          {/* Document Info Sidebar */}
          <div className="w-80 border-r border-gray-200 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Project Info */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <FolderOpen size={16} />
                  Project Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Project:</span>
                    <p className="font-medium text-gray-900">{project?.title || 'Unknown Project'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Department:</span>
                    <p className="text-gray-900">{project?.department || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className={`ml-1 px-2 py-1 text-xs rounded-full ${
                      project?.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      project?.status === 'completed' ? 'bg-green-100 text-green-800' :
                      project?.status === 'planning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project?.status?.replace('_', ' ') || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Document Info */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar size={16} />
                  Document Info
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Uploaded:</span>
                    <p className="text-gray-900">{new Date(document.uploadDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Uploaded by:</span>
                    <p className="text-gray-900 flex items-center gap-1">
                      <User size={12} />
                      {document.uploadedBy}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">File size:</span>
                    <p className="text-gray-900">{formatFileSize(document.fileSize)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">File path:</span>
                    <p className="text-gray-900 font-mono text-xs break-all">{document.fileUrl}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {document.description && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Description</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{document.description}</p>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={onDownload}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download size={16} />
                  Download File
                </button>
                <button
                  onClick={() => window.open(document.fileUrl, '_blank')}
                  className="w-full flex items-center justify-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <ExternalLink size={16} />
                  Open in New Tab
                </button>
              </div>
            </div>
          </div>

          {/* Document Preview */}
          <div className="flex-1 bg-gray-50 flex items-center justify-center">
            {isImageFile(document.name) ? (
              <div className="max-w-full max-h-full p-4">
                <img
                  src={`https://via.placeholder.com/800x600/f3f4f6/6b7280?text=${encodeURIComponent(document.name)}`}
                  alt={document.name}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                />
              </div>
            ) : isPDFFile(document.name) ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">📄</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">PDF Document</h3>
                  <p className="text-gray-600 mb-4">
                    PDF preview is not available in this demo
                  </p>
                  <button
                    onClick={onDownload}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                  >
                    <Download size={16} />
                    Download to View
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-6xl mb-4">{getTypeIcon(document.type)}</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {getFileExtension(document.name).toUpperCase()} Document
                </h3>
                <p className="text-gray-600 mb-4">
                  Preview not available for this file type
                </p>
                <button
                  onClick={onDownload}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                >
                  <Download size={16} />
                  Download File
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};