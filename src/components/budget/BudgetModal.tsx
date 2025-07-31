import React, { useState, useEffect } from 'react';
import { X, DollarSign } from 'lucide-react';
import { Project } from '../../types';

interface BudgetEntry {
  id: string;
  projectId: string;
  category: 'labor' | 'materials' | 'equipment' | 'permits' | 'other';
  description: string;
  plannedAmount: number;
  actualAmount: number;
  contractorId?: string;
  contractorName?: string;
  dateCreated: string;
  dateUpdated: string;
  status: 'pending' | 'approved' | 'paid';
}

interface BudgetModalProps {
  entry?: BudgetEntry | null;
  projects: Project[];
  onClose: () => void;
  onSave: (entry: any) => void;
}

const mockContractors = [
  { id: '1', name: 'ABC Construction Co.' },
  { id: '2', name: 'Metro Equipment Rental' },
  { id: '3', name: 'City Plumbing Solutions' },
  { id: '4', name: 'Elite Electrical Services' },
  { id: '5', name: 'Premier Paving Inc.' }
];

export const BudgetModal: React.FC<BudgetModalProps> = ({ entry, projects, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    projectId: entry?.projectId || '',
    category: entry?.category || 'labor' as const,
    description: entry?.description || '',
    plannedAmount: entry?.plannedAmount || 0,
    actualAmount: entry?.actualAmount || 0,
    contractorId: entry?.contractorId || '',
    contractorName: entry?.contractorName || '',
    status: entry?.status || 'pending' as const
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (entry) {
      // Update existing entry
      onSave({
        ...entry,
        ...formData
      });
    } else {
      // Create new entry
      onSave(formData);
    }
    
    onClose();
  };

  const handleContractorChange = (contractorId: string) => {
    const contractor = mockContractors.find(c => c.id === contractorId);
    setFormData({
      ...formData,
      contractorId,
      contractorName: contractor?.name || ''
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <DollarSign size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {entry ? 'Edit Budget Entry' : 'Add Budget Entry'}
              </h2>
              <p className="text-sm text-gray-600">
                {entry ? 'Update budget information' : 'Create a new budget entry for a project'}
              </p>
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

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="labor">👷 Labor</option>
                <option value="materials">🏗️ Materials</option>
                <option value="equipment">🚜 Equipment</option>
                <option value="permits">📋 Permits</option>
                <option value="other">📄 Other</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe this budget item..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Planned Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Planned Amount *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="number"
                  value={formData.plannedAmount}
                  onChange={(e) => setFormData({ ...formData, plannedAmount: Number(e.target.value) })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            {/* Actual Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Actual Amount
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="number"
                  value={formData.actualAmount}
                  onChange={(e) => setFormData({ ...formData, actualAmount: Number(e.target.value) })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contractor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contractor
              </label>
              <select
                value={formData.contractorId}
                onChange={(e) => handleContractorChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">No contractor assigned</option>
                {mockContractors.map(contractor => (
                  <option key={contractor.id} value={contractor.id}>
                    {contractor.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>

          {/* Variance Display */}
          {(formData.plannedAmount > 0 || formData.actualAmount > 0) && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Budget Summary</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Planned</p>
                  <p className="font-medium text-gray-900">
                    ${formData.plannedAmount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Actual</p>
                  <p className="font-medium text-gray-900">
                    ${formData.actualAmount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Variance</p>
                  <p className={`font-medium ${
                    formData.actualAmount - formData.plannedAmount > 0 ? 'text-red-600' : 
                    formData.actualAmount - formData.plannedAmount < 0 ? 'text-green-600' : 'text-gray-900'
                  }`}>
                    {formData.actualAmount - formData.plannedAmount > 0 ? '+' : ''}
                    ${(formData.actualAmount - formData.plannedAmount).toLocaleString()}
                  </p>
                </div>
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {entry ? 'Update Entry' : 'Create Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};