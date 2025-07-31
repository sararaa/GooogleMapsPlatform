import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Download, 
  Plus,
  Filter,
  Calendar,
  BarChart3,
  PieChart,
  FileText
} from 'lucide-react';
import { mockProjects } from '../../data/mockData';
import { Project } from '../../types';
import { BudgetChart } from '../budget/BudgetChart';
import { BudgetModal } from '../budget/BudgetModal';
import { ExportModal } from '../budget/ExportModal';

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

interface ProjectBudget {
  projectId: string;
  totalPlanned: number;
  totalActual: number;
  entries: BudgetEntry[];
}

// Mock budget data
const mockBudgetEntries: BudgetEntry[] = [
  {
    id: '1',
    projectId: '1',
    category: 'labor',
    description: 'Bridge construction crew - Phase 1',
    plannedAmount: 450000,
    actualAmount: 425000,
    contractorId: '1',
    contractorName: 'ABC Construction Co.',
    dateCreated: '2025-01-15T00:00:00Z',
    dateUpdated: '2025-01-27T00:00:00Z',
    status: 'paid'
  },
  {
    id: '2',
    projectId: '1',
    category: 'materials',
    description: 'Steel beams and concrete',
    plannedAmount: 800000,
    actualAmount: 850000,
    contractorId: '1',
    contractorName: 'ABC Construction Co.',
    dateCreated: '2025-01-15T00:00:00Z',
    dateUpdated: '2025-01-27T00:00:00Z',
    status: 'approved'
  },
  {
    id: '3',
    projectId: '1',
    category: 'equipment',
    description: 'Crane rental and heavy machinery',
    plannedAmount: 120000,
    actualAmount: 95000,
    contractorId: '2',
    contractorName: 'Metro Equipment Rental',
    dateCreated: '2025-01-20T00:00:00Z',
    dateUpdated: '2025-01-25T00:00:00Z',
    status: 'paid'
  },
  {
    id: '4',
    projectId: '2',
    category: 'equipment',
    description: 'Smart traffic light hardware',
    plannedAmount: 600000,
    actualAmount: 0,
    dateCreated: '2025-01-10T00:00:00Z',
    dateUpdated: '2025-01-10T00:00:00Z',
    status: 'pending'
  },
  {
    id: '5',
    projectId: '2',
    category: 'permits',
    description: 'Traffic control permits',
    plannedAmount: 25000,
    actualAmount: 28000,
    dateCreated: '2025-01-12T00:00:00Z',
    dateUpdated: '2025-01-20T00:00:00Z',
    status: 'paid'
  },
  {
    id: '6',
    projectId: '3',
    category: 'materials',
    description: 'Water pipes and fittings',
    plannedAmount: 320000,
    actualAmount: 315000,
    contractorId: '3',
    contractorName: 'City Plumbing Solutions',
    dateCreated: '2025-01-20T00:00:00Z',
    dateUpdated: '2025-01-26T00:00:00Z',
    status: 'paid'
  }
];

export const Budget: React.FC = () => {
  const [budgetEntries, setBudgetEntries] = useState<BudgetEntry[]>(mockBudgetEntries);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<BudgetEntry | null>(null);

  // Calculate project budgets
  const projectBudgets: ProjectBudget[] = mockProjects.map(project => {
    const entries = budgetEntries.filter(entry => entry.projectId === project.id);
    const totalPlanned = entries.reduce((sum, entry) => sum + entry.plannedAmount, 0);
    const totalActual = entries.reduce((sum, entry) => sum + entry.actualAmount, 0);
    
    return {
      projectId: project.id,
      totalPlanned,
      totalActual,
      entries
    };
  });

  // Filter entries based on selected filters
  const filteredEntries = budgetEntries.filter(entry => {
    const projectMatch = selectedProject === 'all' || entry.projectId === selectedProject;
    const categoryMatch = selectedCategory === 'all' || entry.category === selectedCategory;
    return projectMatch && categoryMatch;
  });

  // Calculate totals
  const totalPlanned = filteredEntries.reduce((sum, entry) => sum + entry.plannedAmount, 0);
  const totalActual = filteredEntries.reduce((sum, entry) => sum + entry.actualAmount, 0);
  const variance = totalActual - totalPlanned;
  const variancePercentage = totalPlanned > 0 ? (variance / totalPlanned) * 100 : 0;

  // Get overrun alerts
  const overrunAlerts = projectBudgets.filter(budget => 
    budget.totalActual > budget.totalPlanned && budget.totalPlanned > 0
  );

  const getCategoryColor = (category: string) => {
    const colors = {
      labor: '#3b82f6',
      materials: '#10b981',
      equipment: '#f59e0b',
      permits: '#8b5cf6',
      other: '#6b7280'
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'labor': return '👷';
      case 'materials': return '🏗️';
      case 'equipment': return '🚜';
      case 'permits': return '📋';
      default: return '📄';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleAddEntry = (entry: Omit<BudgetEntry, 'id' | 'dateCreated' | 'dateUpdated'>) => {
    const newEntry: BudgetEntry = {
      ...entry,
      id: Math.random().toString(36).substr(2, 9),
      dateCreated: new Date().toISOString(),
      dateUpdated: new Date().toISOString()
    };
    setBudgetEntries([...budgetEntries, newEntry]);
  };

  const handleUpdateEntry = (updatedEntry: BudgetEntry) => {
    setBudgetEntries(entries => 
      entries.map(entry => 
        entry.id === updatedEntry.id 
          ? { ...updatedEntry, dateUpdated: new Date().toISOString() }
          : entry
      )
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Budget Tracking</h1>
          <p className="text-gray-600">Monitor project budgets, track expenses, and manage contractor payments</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Download size={18} />
            Export CSV
          </button>
          <button
            onClick={() => setShowBudgetModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            Add Budget Entry
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <DollarSign size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalPlanned)}</p>
              <p className="text-sm text-gray-600">Total Planned</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <DollarSign size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalActual)}</p>
              <p className="text-sm text-gray-600">Total Actual</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${variance >= 0 ? 'bg-red-50' : 'bg-green-50'}`}>
              {variance >= 0 ? 
                <TrendingUp size={20} className="text-red-600" /> : 
                <TrendingDown size={20} className="text-green-600" />
              }
            </div>
            <div>
              <p className={`text-2xl font-bold ${variance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {variance >= 0 ? '+' : ''}{formatCurrency(variance)}
              </p>
              <p className="text-sm text-gray-600">Variance</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <AlertTriangle size={20} className="text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{overrunAlerts.length}</p>
              <p className="text-sm text-gray-600">Budget Overruns</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overrun Alerts */}
      {overrunAlerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={20} className="text-red-600" />
            <h3 className="font-medium text-red-900">Budget Overrun Alerts</h3>
          </div>
          <div className="space-y-2">
            {overrunAlerts.map(budget => {
              const project = mockProjects.find(p => p.id === budget.projectId);
              const overrun = budget.totalActual - budget.totalPlanned;
              const overrunPercentage = (overrun / budget.totalPlanned) * 100;
              
              return (
                <div key={budget.projectId} className="text-sm text-red-800">
                  <strong>{project?.title}</strong> is over budget by {formatCurrency(overrun)} ({overrunPercentage.toFixed(1)}%)
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters and View Toggle */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Projects</option>
                {mockProjects.map(project => (
                  <option key={project.id} value={project.id}>{project.title}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="labor">Labor</option>
                <option value="materials">Materials</option>
                <option value="equipment">Equipment</option>
                <option value="permits">Permits</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                viewMode === 'table' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FileText size={16} />
              Table
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                viewMode === 'chart' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <BarChart3 size={16} />
              Charts
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project & Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Planned
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Variance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contractor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEntries.map((entry) => {
                  const project = mockProjects.find(p => p.id === entry.projectId);
                  const variance = entry.actualAmount - entry.plannedAmount;
                  
                  return (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{project?.title}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-lg">{getCategoryIcon(entry.category)}</span>
                            <span 
                              className="px-2 py-1 text-xs font-medium rounded-full text-white"
                              style={{ backgroundColor: getCategoryColor(entry.category) }}
                            >
                              {entry.category}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{entry.description}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Updated {new Date(entry.dateUpdated).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(entry.plannedAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(entry.actualAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${
                          variance > 0 ? 'text-red-600' : variance < 0 ? 'text-green-600' : 'text-gray-900'
                        }`}>
                          {variance !== 0 && (variance > 0 ? '+' : '')}{formatCurrency(variance)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {entry.contractorName || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          entry.status === 'paid' ? 'bg-green-100 text-green-800' :
                          entry.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {entry.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setEditingEntry(entry);
                            setShowBudgetModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <BudgetChart 
          budgetEntries={filteredEntries}
          projects={mockProjects}
        />
      )}

      {/* Modals */}
      {showBudgetModal && (
        <BudgetModal
          entry={editingEntry}
          projects={mockProjects}
          onClose={() => {
            setShowBudgetModal(false);
            setEditingEntry(null);
          }}
          onSave={editingEntry ? handleUpdateEntry : handleAddEntry}
        />
      )}

      {showExportModal && (
        <ExportModal
          budgetEntries={filteredEntries}
          projects={mockProjects}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
};