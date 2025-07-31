import React, { useState, useEffect } from 'react';
import { Phone, MapPin, Clock, AlertTriangle, Filter } from 'lucide-react';
import { CitizenReport, ProjectPriority } from '../../types';
import { CitizenReportModal } from '../CitizenReportModal';
import { ErrorBoundary } from '../ErrorBoundary';

export const Activity: React.FC = () => {
  const [citizenReports, setCitizenReports] = useState<CitizenReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<CitizenReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'in_progress' | 'resolved' | 'closed'>('all');
  const [error, setError] = useState<string | null>(null);

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

  // Fetch citizen reports from backend
  useEffect(() => {
    const fetchCitizenReports = async () => {
      try {
        setError(null);
        const response = await fetch('http://localhost:5000/api/citizen-reports', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const rawReports = await response.json();
          if (Array.isArray(rawReports)) {
            const transformedReports = rawReports.map(transformReportData);
            setCitizenReports(transformedReports);
          } else {
            setCitizenReports([]);
          }
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.error('Failed to fetch citizen reports:', error);
        setError(error instanceof Error ? error.message : 'Failed to load reports. Make sure the backend server is running on http://localhost:5000');
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
      if (!reportId || !status) {
        console.error('Invalid reportId or status provided');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/citizen-reports/${reportId}/status`, {
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
            report?.id === reportId ? { ...report, status } : report
          ).filter(Boolean)
        );
        
        // Update selected report if it's the same one
        if (selectedReport?.id === reportId) {
          setSelectedReport(prev => prev ? { ...prev, status } : null);
        }
      } else {
        throw new Error(`Failed to update status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to update report status:', error);
      // You could add a toast notification here
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

  const safeReports = citizenReports.filter(report => report && report.id && report.status);
  
  const filteredReports = safeReports.filter(report => 
    filter === 'all' || report.status === filter
  );

  const statusCounts = {
    all: safeReports.length,
    new: safeReports.filter(r => r?.status === 'new').length,
    in_progress: safeReports.filter(r => r?.status === 'in_progress').length,
    resolved: safeReports.filter(r => r?.status === 'resolved').length,
    closed: safeReports.filter(r => r?.status === 'closed').length,
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Phone className="text-blue-600" size={28} />
            Activity Feed
          </h1>
          <p className="text-gray-600">View and manage all citizen reports and system activity</p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto">
          {(Object.entries(statusCounts) as Array<[typeof filter, number]>).map(([status, count]) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'All Activity' : status.replace('_', ' ').toUpperCase()} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Activity List */}
      <div className="bg-white rounded-lg border border-gray-200">
        {error ? (
          <div className="text-center py-12">
            <AlertTriangle size={48} className="text-red-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Reports</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading activity...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-12">
            <Phone size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'No activity yet' : `No ${filter.replace('_', ' ')} reports`}
            </h3>
            <p className="text-gray-500">
              {filter === 'all' 
                ? 'Citizens can call to report issues and they will appear here' 
                : `Switch to "All Activity" to see other reports`
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredReports
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map(report => {
                if (!report || !report.id) return null;
                
                return (
                  <div 
                    key={report.id} 
                    className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Clicking on report:', report);
                      try {
                        setSelectedReport(report);
                      } catch (error) {
                        console.error('Error setting selected report:', error);
                      }
                    }}
                  >
                  <div className="flex items-start gap-4">
                    {/* Status Indicator */}
                    <div className="flex-shrink-0 mt-1">
                      <div className={`w-3 h-3 rounded-full ${
                        report.status === 'new' ? 'bg-red-500' :
                        report.status === 'in_progress' ? 'bg-yellow-500' :
                        report.status === 'resolved' ? 'bg-green-500' :
                        'bg-gray-500'
                      }`}></div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {report.title}
                          </h3>
                          <AlertTriangle 
                            size={18} 
                            className={`flex-shrink-0 ${getPriorityColor(report.priority)}`}
                          />
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            report.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                            report.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            report.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {report.priority.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock size={14} />
                          {new Date(report.timestamp).toLocaleString()}
                        </div>
                      </div>

                      <p className="text-gray-700 mb-3 line-clamp-2">
                        {report.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin size={14} />
                            <span>{report.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone size={14} />
                            <span>{report.caller_number}</span>
                          </div>
                        </div>

                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          report.status === 'new' ? 'bg-blue-100 text-blue-800' :
                          report.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                          report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {report.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                )
              })
              .filter(Boolean)}
          </div>
        )}
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