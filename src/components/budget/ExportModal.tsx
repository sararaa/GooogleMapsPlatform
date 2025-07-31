import React, { useState } from 'react';
import { X, Download, Calendar, Filter } from 'lucide-react';
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

interface ExportModalProps {
  budgetEntries: BudgetEntry[];
  projects: Project[];
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ budgetEntries, projects, onClose }) => {
  const [exportOptions, setExportOptions] = useState({
    includeVariance: true,
    includeContractors: true,
    includeStatus: true,
    dateRange: 'all' as 'all' | 'last30' | 'last90' | 'custom',
    customStartDate: '',
    customEndDate: '',
    format: 'csv' as 'csv' | 'excel'
  });

  const generateCSV = () => {
    const headers = [
      'Project',
      'Category',
      'Description',
      'Planned Amount',
      'Actual Amount',
      ...(exportOptions.includeVariance ? ['Variance', 'Variance %'] : []),
      ...(exportOptions.includeContractors ? ['Contractor'] : []),
      ...(exportOptions.includeStatus ? ['Status'] : []),
      'Date Created',
      'Date Updated'
    ];

    const rows = budgetEntries.map(entry => {
      const project = projects.find(p => p.id === entry.projectId);
      const variance = entry.actualAmount - entry.plannedAmount;
      const variancePercent = entry.plannedAmount > 0 ? (variance / entry.plannedAmount) * 100 : 0;
      
      return [
        project?.title || 'Unknown Project',
        entry.category,
        entry.description,
        entry.plannedAmount,
        entry.actualAmount,
        ...(exportOptions.includeVariance ? [variance, `${variancePercent.toFixed(2)}%`] : []),
        ...(exportOptions.includeContractors ? [entry.contractorName || ''] : []),
        ...(exportOptions.includeStatus ? [entry.status] : []),
        new Date(entry.dateCreated).toLocaleDateString(),
        new Date(entry.dateUpdated).toLocaleDateString()
      ];
    });

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csvContent;
  };

  const handleExport = () => {
    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `budget-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    onClose();
  };

  const getFilteredEntriesCount = () => {
    // In a real implementation, you would filter by date range here
    return budgetEntries.length;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Download size={20} className="text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Export Budget Data</h2>
              <p className="text-sm text-gray-600">Configure your export settings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Export Summary */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Filter size={16} className="text-blue-600" />
              <h3 className="font-medium text-blue-900">Export Summary</h3>
            </div>
            <p className="text-sm text-blue-800">
              {getFilteredEntriesCount()} budget entries will be exported from {projects.length} projects
            </p>
          </div>

          {/* Export Options */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Include in Export</h3>
            
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={exportOptions.includeVariance}
                  onChange={(e) => setExportOptions({
                    ...exportOptions,
                    includeVariance: e.target.checked
                  })}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Variance calculations</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={exportOptions.includeContractors}
                  onChange={(e) => setExportOptions({
                    ...exportOptions,
                    includeContractors: e.target.checked
                  })}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Contractor information</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={exportOptions.includeStatus}
                  onChange={(e) => setExportOptions({
                    ...exportOptions,
                    includeStatus: e.target.checked
                  })}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Payment status</span>
              </label>
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Date Range</h3>
            
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="dateRange"
                  value="all"
                  checked={exportOptions.dateRange === 'all'}
                  onChange={(e) => setExportOptions({
                    ...exportOptions,
                    dateRange: e.target.value as any
                  })}
                  className="border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">All time</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="radio"
                  name="dateRange"
                  value="last30"
                  checked={exportOptions.dateRange === 'last30'}
                  onChange={(e) => setExportOptions({
                    ...exportOptions,
                    dateRange: e.target.value as any
                  })}
                  className="border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Last 30 days</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="radio"
                  name="dateRange"
                  value="last90"
                  checked={exportOptions.dateRange === 'last90'}
                  onChange={(e) => setExportOptions({
                    ...exportOptions,
                    dateRange: e.target.value as any
                  })}
                  className="border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Last 90 days</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="radio"
                  name="dateRange"
                  value="custom"
                  checked={exportOptions.dateRange === 'custom'}
                  onChange={(e) => setExportOptions({
                    ...exportOptions,
                    dateRange: e.target.value as any
                  })}
                  className="border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Custom range</span>
              </label>
            </div>

            {exportOptions.dateRange === 'custom' && (
              <div className="grid grid-cols-2 gap-4 ml-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={exportOptions.customStartDate}
                    onChange={(e) => setExportOptions({
                      ...exportOptions,
                      customStartDate: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={exportOptions.customEndDate}
                    onChange={(e) => setExportOptions({
                      ...exportOptions,
                      customEndDate: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Format Selection */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Export Format</h3>
            
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  checked={exportOptions.format === 'csv'}
                  onChange={(e) => setExportOptions({
                    ...exportOptions,
                    format: e.target.value as any
                  })}
                  className="border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">CSV (Comma Separated Values)</span>
              </label>
              
              <label className="flex items-center opacity-50">
                <input
                  type="radio"
                  name="format"
                  value="excel"
                  disabled
                  className="border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Excel (Coming Soon)</span>
              </label>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Export Preview</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• File format: {exportOptions.format.toUpperCase()}</p>
              <p>• Records: {getFilteredEntriesCount()} entries</p>
              <p>• Columns: {[
                'Project', 'Category', 'Description', 'Planned Amount', 'Actual Amount',
                ...(exportOptions.includeVariance ? ['Variance', 'Variance %'] : []),
                ...(exportOptions.includeContractors ? ['Contractor'] : []),
                ...(exportOptions.includeStatus ? ['Status'] : []),
                'Date Created', 'Date Updated'
              ].length}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
};