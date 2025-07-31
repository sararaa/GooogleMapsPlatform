import React from 'react';
import { BarChart3, PieChart, TrendingUp } from 'lucide-react';
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

interface BudgetChartProps {
  budgetEntries: BudgetEntry[];
  projects: Project[];
}

export const BudgetChart: React.FC<BudgetChartProps> = ({ budgetEntries, projects }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Calculate data for charts
  const categoryData = budgetEntries.reduce((acc, entry) => {
    if (!acc[entry.category]) {
      acc[entry.category] = { planned: 0, actual: 0 };
    }
    acc[entry.category].planned += entry.plannedAmount;
    acc[entry.category].actual += entry.actualAmount;
    return acc;
  }, {} as Record<string, { planned: number; actual: number }>);

  const projectData = projects.map(project => {
    const projectEntries = budgetEntries.filter(entry => entry.projectId === project.id);
    const planned = projectEntries.reduce((sum, entry) => sum + entry.plannedAmount, 0);
    const actual = projectEntries.reduce((sum, entry) => sum + entry.actualAmount, 0);
    return {
      project: project.title,
      planned,
      actual,
      variance: actual - planned
    };
  }).filter(data => data.planned > 0 || data.actual > 0);

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

  const maxAmount = Math.max(
    ...Object.values(categoryData).flatMap(data => [data.planned, data.actual]),
    ...projectData.flatMap(data => [data.planned, data.actual])
  );

  return (
    <div className="space-y-6">
      {/* Category Breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <PieChart size={20} className="text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Budget by Category</h3>
        </div>
        
        <div className="space-y-4">
          {Object.entries(categoryData).map(([category, data]) => (
            <div key={category} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: getCategoryColor(category) }}
                  ></div>
                  <span className="font-medium text-gray-900 capitalize">{category}</span>
                </div>
                <div className="text-sm text-gray-600">
                  Planned: {formatCurrency(data.planned)} | Actual: {formatCurrency(data.actual)}
                </div>
              </div>
              
              {/* Planned vs Actual Bars */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-12">Plan</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{ 
                        backgroundColor: getCategoryColor(category),
                        width: `${(data.planned / maxAmount) * 100}%`,
                        opacity: 0.7
                      }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600 w-20 text-right">
                    {formatCurrency(data.planned)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-12">Actual</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{ 
                        backgroundColor: getCategoryColor(category),
                        width: `${(data.actual / maxAmount) * 100}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600 w-20 text-right">
                    {formatCurrency(data.actual)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 size={20} className="text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Budget by Project</h3>
        </div>
        
        <div className="space-y-4">
          {projectData.map((data, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{data.project}</span>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-600">
                    Variance: 
                    <span className={`ml-1 font-medium ${
                      data.variance > 0 ? 'text-red-600' : data.variance < 0 ? 'text-green-600' : 'text-gray-900'
                    }`}>
                      {data.variance !== 0 && (data.variance > 0 ? '+' : '')}{formatCurrency(data.variance)}
                    </span>
                  </span>
                </div>
              </div>
              
              {/* Planned vs Actual Bars */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-12">Plan</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-500 h-3 rounded-full opacity-70"
                      style={{ width: `${(data.planned / maxAmount) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600 w-24 text-right">
                    {formatCurrency(data.planned)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-12">Actual</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        data.actual > data.planned ? 'bg-red-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${(data.actual / maxAmount) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600 w-24 text-right">
                    {formatCurrency(data.actual)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <TrendingUp size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Most Expensive Category</p>
              <p className="text-lg font-semibold text-gray-900">
                {Object.entries(categoryData).reduce((max, [category, data]) => 
                  data.actual > (categoryData[max]?.actual || 0) ? category : max, 'materials'
                ).charAt(0).toUpperCase() + Object.entries(categoryData).reduce((max, [category, data]) => 
                  data.actual > (categoryData[max]?.actual || 0) ? category : max, 'materials'
                ).slice(1)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Best Performing Project</p>
              <p className="text-lg font-semibold text-gray-900">
                {projectData.reduce((best, project) => 
                  project.variance < best.variance ? project : best, projectData[0] || { project: 'N/A', variance: 0 }
                ).project.split(' ').slice(0, 2).join(' ')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <TrendingUp size={20} className="text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Projects Over Budget</p>
              <p className="text-lg font-semibold text-gray-900">
                {projectData.filter(project => project.variance > 0).length} of {projectData.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};