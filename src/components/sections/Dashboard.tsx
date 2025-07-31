import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Clock, DollarSign, FolderKanban, Users, Phone, MapPin, AlertTriangle } from 'lucide-react';
import { mockProjects, mockUsers } from '../../data/mockData';
import { CitizenReport, ProjectPriority } from '../../types';
import { CitizenReportModal } from '../CitizenReportModal';
import { ErrorBoundary } from '../ErrorBoundary';

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
  const [citizenReports, setCitizenReports] = useState<CitizenReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<CitizenReport | null>(null);
  const [loading, setLoading] = useState(true);

  // Transform raw API data to CitizenReport format
  const transformReportData = (rawReport: any): CitizenReport => {
    // Handle both formats: raw Twilio data and already formatted data
    return {
      id: rawReport.id || `report_${Date.now()}`,
      type: 'citizen_report',
      title: rawReport.title || 'Citizen Report Received',
      description: rawReport.description || 
                  (rawReport.transcription ? `Phone report: ${rawReport.transcription.substring(0, 100)}${rawReport.transcription.length > 100 ? '...' : ''}` : 'No description available'),
      location: rawReport.location || 'Location not specified',
      caller_number: rawReport.caller_number || 'Unknown',
      recording_url: rawReport.recording_url || '',
      full_transcription: rawReport.full_transcription || rawReport.transcription || 'No transcription available',
      timestamp: rawReport.timestamp || rawReport.call_time || new Date().toISOString(),
      status: rawReport.status || 'new',
      priority: (['low', 'medium', 'high', 'urgent'].includes(rawReport.priority) ? rawReport.priority : 'medium') as ProjectPriority,
      coordinates: rawReport.coordinates || undefined
    };
  };



  const activeProjects = mockProjects.filter(p => p.status === 'in_progress').length;
  const totalBudget = mockProjects.reduce((acc, p) => acc + p.budget, 0);
  const totalSpent = mockProjects.reduce((acc, p) => acc + p.spent, 0);

  const recentProjects = mockProjects
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  // Fetch citizen reports from backend
  useEffect(() => {
    const fetchCitizenReports = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/citizen-reports');
        if (response.ok) {
          const rawReports = await response.json();
          if (Array.isArray(rawReports)) {
            const transformedReports = rawReports.map(transformReportData);
            setCitizenReports(transformedReports);
          } else {
            setCitizenReports([]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch citizen reports:', error);
        setCitizenReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCitizenReports();
    
    // Poll for new reports every 30 seconds
    const interval = setInterval(fetchCitizenReports, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusUpdate = async (reportId: string, status: CitizenReport['status']) => {
    try {
      const response = await fetch(`http://localhost:5001/api/citizen-reports/${reportId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        // Update local state
        setCitizenReports(prev => 
          prev.map(report => 
            report.id === reportId ? { ...report, status } : report
          )
        );
        
        // Update selected report if it's the same one
        if (selectedReport?.id === reportId) {
          setSelectedReport(prev => prev ? { ...prev, status } : null);
        }
      }
    } catch (error) {
      console.error('Failed to update report status:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your projects.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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
        <StatCard
          title="Citizen Reports"
          value={citizenReports.length.toString()}
          change={`${citizenReports.filter(r => r.status === 'new').length} new`}
          changeType={citizenReports.filter(r => r.status === 'new').length > 0 ? "positive" : "neutral"}
          icon={Phone}
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

        {/* Activity Feed */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Phone size={20} className="text-blue-600" />
              Activity
            </h2>
            <div className="flex items-center gap-2">
              {citizenReports.filter(r => r.status === 'new').length > 0 && (
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                  {citizenReports.filter(r => r.status === 'new').length} New
                </span>
              )}
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('change-section', { detail: 'activity' }))}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View all
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Loading reports...</p>
            </div>
          ) : citizenReports.length === 0 ? (
            <div className="text-center py-8">
              <Phone size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No reports yet</p>
              <p className="text-sm text-gray-500">Citizens can call to report issues</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {citizenReports
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .slice(0, 8)
                .map(report => (
                <div 
                  key={report.id} 
                  className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-100 transition-colors"
                  onClick={(e) => {
                    e.preventDefault(); 
                    e.stopPropagation();
                    console.log('Dashboard - Clicking on report:', report);
                    try {
                      setSelectedReport(report);
                    } catch (error) {
                      console.error('Dashboard - Error setting selected report:', error);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full ${
                        report.status === 'new' ? 'bg-red-500' :
                        report.status === 'in_progress' ? 'bg-yellow-500' :
                        report.status === 'resolved' ? 'bg-green-500' :
                        'bg-gray-500'
                      }`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {report.title}
                        </p>
                        <AlertTriangle 
                          size={12} 
                          className={`flex-shrink-0 ${getPriorityColor(report.priority)}`}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {report.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <MapPin size={10} />
                          <span className="truncate max-w-20">
                            {report.location}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={10} />
                          <span>
                            {new Date(report.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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

      {/* Citizen Report Modal */}
      {selectedReport && (
        <ErrorBoundary fallback={
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Report</h2>
              <p className="text-gray-600 mb-4">There was an error loading the report details.</p>
              <button 
                onClick={() => setSelectedReport(null)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        }>
          <CitizenReportModal
            report={selectedReport}
            onClose={() => setSelectedReport(null)}
            onStatusUpdate={handleStatusUpdate}
          />
        </ErrorBoundary>
      )}
    </div>
  );
};