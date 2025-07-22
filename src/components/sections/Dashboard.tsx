import React from 'react';
import { TrendingUp, TrendingDown, Clock, DollarSign, FolderKanban, Users } from 'lucide-react';
import { mockProjects, mockUsers } from '../../data/mockData';

const StatCard: React.FC<{
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<any>;
}> = ({ title, value, change, changeType, icon: Icon }) => {
  const changeColors = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <div className="flex items-center gap-1 mt-2">
            {changeType === 'positive' && <TrendingUp size={16} className="text-green-600" />}
            {changeType === 'negative' && <TrendingDown size={16} className="text-red-600" />}
            <span className={`text-sm ${changeColors[changeType]}`}>
              {change}
            </span>
          </div>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <Icon size={24} className="text-blue-600" />
        </div>
      </div>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const activeProjects = mockProjects.filter(p => p.status === 'in_progress').length;
  const totalBudget = mockProjects.reduce((acc, p) => acc + p.budget, 0);
  const totalSpent = mockProjects.reduce((acc, p) => acc + p.spent, 0);

  const recentProjects = mockProjects
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your projects.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Active Projects"
          value={activeProjects.toString()}
          change="+2 this month"
          changeType="positive"
          icon={FolderKanban}
        />
        <StatCard
          title="Total Budget"
          value={`$${(totalBudget / 1000000).toFixed(1)}M`}
          change="$800K allocated"
          changeType="neutral"
          icon={DollarSign}
        />
        <StatCard
          title="Budget Utilization"
          value={`${((totalSpent / totalBudget) * 100).toFixed(1)}%`}
          change="+5.2% vs last month"
          changeType="positive"
          icon={TrendingUp}
        />
        <StatCard
          title="Team Members"
          value={mockUsers.length.toString()}
          change="3 departments"
          changeType="neutral"
          icon={Users}
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View all
            </button>
          </div>
          <div className="space-y-4">
            {recentProjects.map(project => (
              <div key={project.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{project.title}</h4>
                  <p className="text-sm text-gray-600">{project.department}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{project.progress}%</p>
                  <p className="text-xs text-gray-500">{project.status.replace('_', ' ')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Budget Overview */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Budget Overview</h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View details
            </button>
          </div>
          <div className="space-y-4">
            {mockProjects.slice(0, 4).map(project => {
              const budgetUsed = (project.spent / project.budget) * 100;
              return (
                <div key={project.id}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-900">{project.title}</span>
                    <span className="text-sm text-gray-600">
                      ${(project.spent / 1000).toFixed(0)}K / ${(project.budget / 1000).toFixed(0)}K
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        budgetUsed > 80 ? 'bg-red-500' : budgetUsed > 60 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${budgetUsed}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};