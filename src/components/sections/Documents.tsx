import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  Download, 
  Search, 
  Filter, 
  Calendar,
  FolderOpen,
  Eye,
  Trash2,
  Plus
} from 'lucide-react';
import { mockProjects } from '../../data/mockData';
import { DocumentModal } from '../documents/DocumentModal';
import { DocumentPreviewModal } from '../documents/DocumentPreviewModal';

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

// Mock document data
const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Right-of-Way Permit',
    type: 'permits',
    projectId: '1',
    uploadDate: '2025-01-15T00:00:00Z',
    uploadedBy: 'Sarah Chen',
    fileSize: 2048576,
    fileUrl: '/docs/project-001/permits/row-permit.pdf',
    description: 'Permit for bridge construction right-of-way access'
  },
  {
    id: '2',
    name: 'Environmental Impact Permit',
    type: 'permits',
    projectId: '1',
    uploadDate: '2025-01-12T00:00:00Z',
    uploadedBy: 'Emily Watson',
    fileSize: 5242880,
    fileUrl: '/docs/project-001/permits/environmental-permit.pdf',
    description: 'Environmental clearance for bridge renovation'
  },
  {
    id: '3',
    name: 'Work Order #WO-2025-001',
    type: 'work_orders',
    projectId: '1',
    uploadDate: '2025-01-20T00:00:00Z',
    uploadedBy: 'Marcus Rodriguez',
    fileSize: 1048576,
    fileUrl: '/docs/project-001/work-orders/wo-2025-001.pdf',
    description: 'Initial bridge inspection and preparation work'
  },
  {
    id: '4',
    name: 'Contractor Invoice #1042',
    type: 'invoices',
    projectId: '1',
    uploadDate: '2025-01-25T00:00:00Z',
    uploadedBy: 'Sarah Chen',
    fileSize: 512000,
    fileUrl: '/docs/project-001/invoices/invoice-1042.pdf',
    description: 'ABC Construction Co. - Phase 1 materials'
  },
  {
    id: '5',
    name: 'Steel Beam Delivery Invoice',
    type: 'invoices',
    projectId: '1',
    uploadDate: '2025-01-22T00:00:00Z',
    uploadedBy: 'Marcus Rodriguez',
    fileSize: 768000,
    fileUrl: '/docs/project-001/invoices/steel-beam-invoice.pdf',
    description: 'Materials delivery for bridge construction'
  },
  {
    id: '6',
    name: 'Foundation Inspection Report',
    type: 'inspections',
    projectId: '1',
    uploadDate: '2025-01-18T00:00:00Z',
    uploadedBy: 'Emily Watson',
    fileSize: 3145728,
    fileUrl: '/docs/project-001/inspections/foundation-inspection.pdf',
    description: 'Structural integrity assessment of bridge foundation'
  },
  {
    id: '7',
    name: 'Final Inspection Report',
    type: 'inspections',
    projectId: '1',
    uploadDate: '2025-01-27T00:00:00Z',
    uploadedBy: 'Emily Watson',
    fileSize: 2097152,
    fileUrl: '/docs/project-001/inspections/final-inspection.pdf',
    description: 'Comprehensive final inspection documentation'
  },
  {
    id: '8',
    name: 'Traffic Control Permit',
    type: 'permits',
    projectId: '2',
    uploadDate: '2025-01-10T00:00:00Z',
    uploadedBy: 'Sarah Chen',
    fileSize: 1536000,
    fileUrl: '/docs/project-002/permits/traffic-control-permit.pdf',
    description: 'Permit for traffic light installation work zones'
  },
  {
    id: '9',
    name: 'Equipment Installation Work Order',
    type: 'work_orders',
    projectId: '2',
    uploadDate: '2025-01-14T00:00:00Z',
    uploadedBy: 'Marcus Rodriguez',
    fileSize: 896000,
    fileUrl: '/docs/project-002/work-orders/equipment-installation.pdf',
    description: 'Smart traffic light hardware installation instructions'
  },
  {
    id: '10',
    name: 'Water Main Replacement Permit',
    type: 'permits',
    projectId: '3',
    uploadDate: '2025-01-08T00:00:00Z',
    uploadedBy: 'Emily Watson',
    fileSize: 2560000,
    fileUrl: '/docs/project-003/permits/water-main-permit.pdf',
    description: 'Excavation and utility work permit for Oak Avenue'
  },
  {
    id: '11',
    name: 'Plumbing Contractor Invoice #PL-789',
    type: 'invoices',
    projectId: '3',
    uploadDate: '2025-01-26T00:00:00Z',
    uploadedBy: 'Marcus Rodriguez',
    fileSize: 640000,
    fileUrl: '/docs/project-003/invoices/plumbing-invoice-789.pdf',
    description: 'City Plumbing Solutions - Materials and labor'
  },
  {
    id: '12',
    name: 'Pressure Test Inspection',
    type: 'inspections',
    projectId: '3',
    uploadDate: '2025-01-24T00:00:00Z',
    uploadedBy: 'Emily Watson',
    fileSize: 1792000,
    fileUrl: '/docs/project-003/inspections/pressure-test.pdf',
    description: 'Water main pressure testing results and certification'
  },
  {
    id: '13',
    name: 'Project Charter - Bridge Renovation',
    type: 'other',
    projectId: '1',
    uploadDate: '2025-01-05T00:00:00Z',
    uploadedBy: 'Sarah Chen',
    fileSize: 4194304,
    fileUrl: '/docs/project-001/other/project-charter.pdf',
    description: 'Official project charter and scope definition'
  },
  {
    id: '14',
    name: 'Safety Protocol Documentation',
    type: 'other',
    projectId: '2',
    uploadDate: '2025-01-11T00:00:00Z',
    uploadedBy: 'Emily Watson',
    fileSize: 1280000,
    fileUrl: '/docs/project-002/other/safety-protocols.pdf',
    description: 'Safety procedures for traffic light installation'
  }
];

export const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesType = selectedType === 'all' || doc.type === selectedType;
    const matchesProject = selectedProject === 'all' || doc.projectId === selectedProject;
    const matchesSearch = searchTerm === '' || 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesProject && matchesSearch;
  });

  // Group documents by type
  const documentsByType = filteredDocuments.reduce((acc, doc) => {
    if (!acc[doc.type]) {
      acc[doc.type] = [];
    }
    acc[doc.type].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = (document: Document) => {
    // Simulate file download
    const link = document.createElement('a');
    link.href = document.fileUrl;
    link.download = document.name;
    link.click();
  };

  const handlePreview = (document: Document) => {
    setSelectedDocument(document);
    setShowPreviewModal(true);
  };

  const handleAddDocument = (newDoc: Omit<Document, 'id' | 'uploadDate' | 'uploadedBy'>) => {
    const document: Document = {
      ...newDoc,
      id: Math.random().toString(36).substr(2, 9),
      uploadDate: new Date().toISOString(),
      uploadedBy: 'Current User'
    };
    setDocuments([...documents, document]);
  };

  const documentTypes = [
    { id: 'all', label: 'All Documents', count: filteredDocuments.length },
    { id: 'permits', label: 'Permits', count: documentsByType.permits?.length || 0 },
    { id: 'work_orders', label: 'Work Orders', count: documentsByType.work_orders?.length || 0 },
    { id: 'invoices', label: 'Invoices', count: documentsByType.invoices?.length || 0 },
    { id: 'inspections', label: 'Inspections', count: documentsByType.inspections?.length || 0 },
    { id: 'other', label: 'Other', count: documentsByType.other?.length || 0 }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Document Management</h1>
          <p className="text-gray-600">Organize and manage project documents, permits, and files</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Upload Document
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {documentTypes.slice(1).map(type => (
          <div key={type.id} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{getTypeIcon(type.id)}</div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{type.count}</p>
                <p className="text-sm text-gray-600">{type.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex gap-4">
            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {documentTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.label} ({type.count})
                </option>
              ))}
            </select>

            {/* Project Filter */}
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Projects</option>
              {mockProjects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Document Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {documentTypes.map(type => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  selectedType === type.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {type.id !== 'all' && <span className="text-lg">{getTypeIcon(type.id)}</span>}
                {type.label}
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                  {type.count}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Documents List */}
      {filteredDocuments.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <FolderOpen size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedType !== 'all' || selectedProject !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Upload your first document to get started'
            }
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <Upload size={16} />
            Upload Document
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uploaded
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDocuments
                  .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
                  .map((document) => {
                    const project = mockProjects.find(p => p.id === document.projectId);
                    
                    return (
                      <tr key={document.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{getTypeIcon(document.type)}</div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{document.name}</div>
                              {document.description && (
                                <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                                  {document.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{project?.title || 'Unknown Project'}</div>
                          <div className="text-xs text-gray-500">{project?.department}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(document.type)}`}>
                            {document.type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatFileSize(document.fileSize)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(document.uploadDate).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">by {document.uploadedBy}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handlePreview(document)}
                              className="text-blue-600 hover:text-blue-700 p-1"
                              title="Preview"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleDownload(document)}
                              className="text-green-600 hover:text-green-700 p-1"
                              title="Download"
                            >
                              <Download size={16} />
                            </button>
                            <button
                              className="text-red-600 hover:text-red-700 p-1"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {showUploadModal && (
        <DocumentModal
          projects={mockProjects}
          onClose={() => setShowUploadModal(false)}
          onSave={handleAddDocument}
        />
      )}

      {showPreviewModal && selectedDocument && (
        <DocumentPreviewModal
          document={selectedDocument}
          onClose={() => {
            setShowPreviewModal(false);
            setSelectedDocument(null);
          }}
          onDownload={() => handleDownload(selectedDocument)}
        />
      )}
    </div>
  );
};