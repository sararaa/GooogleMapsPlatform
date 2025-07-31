import React, { useState } from 'react';
import { X, Phone, MapPin, Clock, AlertTriangle, Play, Pause } from 'lucide-react';
import { CitizenReport } from '../types';
import { CitizenReportMap } from './CitizenReportMap';

interface CitizenReportModalProps {
  report: CitizenReport;
  onClose: () => void;
  onStatusUpdate: (reportId: string, status: CitizenReport['status']) => void;
}

export const CitizenReportModal: React.FC<CitizenReportModalProps> = ({
  report,
  onClose,
  onStatusUpdate
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Safety check for report data
  if (!report || !report.id) {
    console.error('CitizenReportModal: Invalid report data provided');
    onClose();
    return null;
  }

  const handlePlayRecording = () => {
    try {
      if (!report.recording_url) {
        console.error('No recording URL available');
        return;
      }

      if (!audioElement) {
        const audio = new Audio(report.recording_url);
        audio.onended = () => setIsPlaying(false);
        audio.onerror = (e) => {
          console.error('Audio playback error:', e);
          setIsPlaying(false);
        };
        setAudioElement(audio);
        audio.play().catch(e => {
          console.error('Failed to play audio:', e);
          setIsPlaying(false);
        });
        setIsPlaying(true);
      } else {
        if (isPlaying) {
          audioElement.pause();
          setIsPlaying(false);
        } else {
          audioElement.play().catch(e => {
            console.error('Failed to resume audio:', e);
            setIsPlaying(false);
          });
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error('Error in handlePlayRecording:', error);
      setIsPlaying(false);
    }
  };

  const handleStatusChange = (newStatus: CitizenReport['status']) => {
    onStatusUpdate(report.id, newStatus);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Phone className="text-blue-600" size={24} />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Citizen Report</h2>
              <p className="text-sm text-gray-600">
                {report.timestamp ? (
                  <>
                    Received {new Date(report.timestamp).toLocaleDateString()} at{' '}
                    {new Date(report.timestamp).toLocaleTimeString()}
                  </>
                ) : (
                  'Received at unknown time'
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Report Details */}
            <div className="space-y-6">
              {/* Status and Priority */}
              <div className="flex gap-3">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(report.status)}`}>
                  {report.status.replace('_', ' ').toUpperCase()}
                </span>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(report.priority)}`}>
                  <AlertTriangle size={14} className="inline mr-1" />
                  {report.priority.toUpperCase()} PRIORITY
                </span>
              </div>

              {/* Caller Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Caller Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-gray-500" />
                    <span className="text-gray-700">{report.caller_number || 'Unknown caller'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-500" />
                    <span className="text-gray-700">
                      {report.timestamp ? new Date(report.timestamp).toLocaleString() : 'Time unknown'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Reported Location</h3>
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="text-gray-500 mt-0.5" />
                  <span className="text-gray-700">{report.location || 'Location not specified'}</span>
                </div>
                {report.coordinates && report.coordinates.lat && report.coordinates.lng && (
                  <p className="text-sm text-gray-600 mt-2">
                    Coordinates: {report.coordinates.lat.toFixed(6)}, {report.coordinates.lng.toFixed(6)}
                  </p>
                )}
              </div>

              {/* Audio Recording */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Audio Recording</h3>
                {report.recording_url ? (
                  <button
                    onClick={handlePlayRecording}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    {isPlaying ? 'Pause Recording' : 'Play Recording'}
                  </button>
                ) : (
                  <p className="text-gray-500 text-sm">No recording available</p>
                )}
              </div>

              {/* Status Update */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Update Status</h3>
                <div className="grid grid-cols-2 gap-2">
                  {(['new', 'in_progress', 'resolved', 'closed'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        report.status === status
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {status.replace('_', ' ').toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Transcription and Map */}
            <div className="space-y-6">
              {/* Transcription */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Call Transcription</h3>
                <div className="bg-white rounded border border-gray-200 p-3 max-h-48 overflow-y-auto">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {report.full_transcription || 'Transcription processing...'}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  * Transcription provided by Whisper AI and processed by Gemini AI
                </p>
              </div>

              {/* Map */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Location Map</h3>
                <CitizenReportMap report={report} />
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    📝 Create Work Order
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    📞 Call Back Citizen
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    🚧 Assign to Department
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    📋 Create Project
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};