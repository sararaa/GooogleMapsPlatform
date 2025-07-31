import React, { useState } from 'react';
import { X, Upload, FileText } from 'lucide-react';
import { Project } from '../../types';

interface Document {
  name: string;
  type: 'permits' | 'work_orders' | 'invoices' | 'inspections' | 'other';
  projectId: string;
  fileSize: number;
  fileUrl: string;
  description?: string;
}

interface DocumentModalProps {
  projects: Project[];
  onClose: () => void;
  onSave: (document: Document) => void;
}

export const DocumentModal: React.FC<DocumentModalProps> = ({ projects, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'permits' as const,
    projectId: '',
    description: '',
    file: null as File | null
  });

  const [dragActive, setDragActive] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.file) {
      alert('Please select a file to upload');
      return;
    }

    // Simulate file upload and generate URL
    const fileUrl = `/docs/project-${formData.projectId.padStart(3, '0')}/${formData.type}/${formData.file.name}`;
    
    const document: Document = {
      name: formData.name || formData.file.name,
      type: formData.type,
      projectId: formData.projectId,
      fileSize: formData.file.size,
      fileUrl,
      description: formData.description || undefined
    };

    onSave(document);
    onClose();
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFormData({ ...formData, file, name: formData.name || file.name });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({ ...formData, file, name: formData.name || file.name });
    }
  };

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Upload size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Upload Document</h2>
              <p className="text-sm text-gray-600">Add a new document to your project</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {formData.file ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-3">
                  <FileText size={32} className="text-blue-600" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{formData.file.name}</p>
                    <p className="text-sm text-gray-600">{formatFileSize(formData.file.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, file: null, name: '' })}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload size={48} className="text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-gray-900">Drop your file here</p>
                  <p className="text-sm text-gray-600">or click to browse</p>
                </div>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  <Upload size={16} />
                  Choose File
                </label>
                <p className="text-xs text-gray-500">
                  Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Max 10MB)
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project *
              </label>
              <select
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select a project...</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Document Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="permits">{getTypeIcon('permits')} Permits</option>
                <option value="work_orders">{getTypeIcon('work_orders')} Work Orders</option>
                <option value="invoices">{getTypeIcon('invoices')} Invoices</option>
                <option value="inspections">{getTypeIcon('inspections')} Inspections</option>
                <option value="other">{getTypeIcon('other')} Other</option>
              </select>
            </div>
          </div>

          {/* Document Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter document name (optional - will use filename if empty)"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add a description for this document (optional)"
            />
          </div>

          {/* Preview */}
          {formData.file && formData.projectId && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Upload Preview</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• File: {formData.file.name} ({formatFileSize(formData.file.size)})</p>
                <p>• Project: {projects.find(p => p.id === formData.projectId)?.title}</p>
                <p>• Type: {formData.type.replace('_', ' ')}</p>
                <p>• Path: /docs/project-{formData.projectId.padStart(3, '0')}/{formData.type}/{formData.file.name}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.file || !formData.projectId}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Upload Document
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};