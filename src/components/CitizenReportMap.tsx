import React, { useEffect, useRef, useState } from 'react';
import Map3D from '../Map3D';
import { MapPin, ExternalLink, AlertTriangle } from 'lucide-react';
import { CitizenReport } from '../types';

interface CitizenReportMapProps {
  report: CitizenReport;
  className?: string;
}

const DEFAULT_CENTER = { lat: 40, lng: -82.75, altitude: 100 };

export const CitizenReportMap: React.FC<CitizenReportMapProps> = ({
  report,
  className = '',
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const mapRef = useRef<HTMLElement | null>(null);
  const markerRef = useRef<HTMLElement | null>(null);

  // Helper to remove an existing marker element
  const removeMarker = () => {
    const mapEl = mapRef.current;
    if (mapEl && markerRef.current && mapEl.contains(markerRef.current)) {
      mapEl.removeChild(markerRef.current);
      markerRef.current = null;
    }
  };

  // Draw or update the marker whenever coordinates change
  useEffect(() => {
    if (!report.coordinates) return;

    let cleanup = () => {};

    const setup = async () => {
      const { Marker3DInteractiveElement, AltitudeMode } = await window.google.maps.importLibrary(
        'maps3d'
      );

      const mapEl = mapRef.current;
      if (!mapEl) return;

      // Remove any previous marker
      removeMarker();

      // Create marker at the report coordinates
      const marker = new Marker3DInteractiveElement({
        position: { ...report.coordinates, altitude: 22},
        altitudeMode: AltitudeMode.RELATIVE_TO_GROUND,
      });
      marker.addEventListener('gmp-click', () => setShowInfo((prev) => !prev));
      mapEl.appendChild(marker);
      markerRef.current = marker;

      // Provide cleanup for this specific marker
      cleanup = () => {
        if (mapEl.contains(marker)) {
          mapEl.removeChild(marker);
        }
      };
    };

    if (window.google?.maps?.importLibrary) {
      setup();
    }

    return () => cleanup();
  }, [report.coordinates]);

  // Styling helper for priority
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-50';
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // Fallback UI if we couldn't geocode the report
  if (!report.coordinates) {
    return (
      <div className={`bg-gray-50 rounded-lg overflow-hidden ${className}`}>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <MapPin size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Location not available</p>
            <p className="text-sm text-gray-400">Coordinates could not be determined from the call</p>
            <p className="text-xs text-gray-400 mt-2">Reported location: {report.location}</p>
          </div>
        </div>
      </div>
    );
  }

  // Open native Google Maps tab with the report coordinates
  const handleOpenInMaps = () => {
    if (report.coordinates) {
      const { lat, lng } = report.coordinates;
      const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className={`bg-gray-50 rounded-lg overflow-hidden ${className}`}>
      <div className="relative">
        {/* 3-D Map */}
        <Map3D ref={mapRef} center={{ ...(report.coordinates ?? DEFAULT_CENTER), altitude: 100 }} />

        {/* Info card shown when the marker is clicked */}
        {showInfo && (
          <div className="absolute bottom-4 left-4 bg-white bg-opacity-95 rounded-lg p-3 shadow-lg max-w-xs backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-blue-600" />
              <h3 className="font-semibold text-gray-900 text-sm">Citizen Report</h3>
            </div>

            <div
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mb-2 ${getPriorityColor(
                report.priority
              )}`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  report.priority === 'urgent'
                    ? 'bg-red-500'
                    : report.priority === 'high'
                    ? 'bg-orange-500'
                    : report.priority === 'medium'
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
              ></div>
              {report.priority.toUpperCase()} Priority
            </div>

            <p className="text-sm text-gray-700 mb-2 font-medium">{report.location}</p>
            <p className="text-xs text-gray-600 mb-3 line-clamp-3">{report.description}</p>

            <div className="text-xs text-gray-500 mb-2">
              Status:{' '}
              <span className="font-medium capitalize">{report.status.replace('_', ' ')}</span>
            </div>
            <div className="text-xs text-gray-500">{new Date(report.timestamp).toLocaleString()}</div>
          </div>
        )}

        {/* Status / Priority chip */}
        <div className="absolute top-3 left-3 bg-white bg-opacity-95 rounded-lg px-3 py-2 shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                report.status === 'new'
                  ? 'bg-red-500'
                  : report.status === 'in_progress'
                  ? 'bg-yellow-500'
                  : report.status === 'resolved'
                  ? 'bg-green-500'
                  : 'bg-gray-500'
              }`}
            ></div>
            <span className="text-xs font-medium text-gray-700">
              {report.priority.toUpperCase()} Priority
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="bg-white bg-opacity-95 hover:bg-opacity-100 rounded-lg p-2 shadow-lg backdrop-blur-sm transition-colors"
            title="Show report details"
          >
            <AlertTriangle size={16} className="text-blue-600" />
          </button>
          <button
            onClick={handleOpenInMaps}
            className="bg-white bg-opacity-95 hover:bg-opacity-100 rounded-lg p-2 shadow-lg backdrop-blur-sm transition-colors"
            title="Open in Google Maps"
          >
            <ExternalLink size={16} className="text-blue-600" />
          </button>
        </div>
      </div>
    </div>
  );
};
