import React, { useState, useEffect, useRef } from 'react';
import Map3D from '../../Map3D';
import { supabase } from '../../supabaseClient.ts';
import { useParams, Link } from 'react-router-dom';
import { CitizenReport } from '../../types';

function parseGeometry(geom: any): { lat: number; lng: number; altitude: number } | null {
  if (geom && typeof geom === 'object' && geom.type === 'Point' && Array.isArray(geom.coordinates)) {
    const [lng, lat] = geom.coordinates;
    if (typeof lng === 'number' && typeof lat === 'number') {
      return { lat, lng, altitude: 100 };
    }
  }
  if (typeof geom === 'string' && geom.includes('POINT')) {
    const match = geom.match(/POINT\\(([-\\d.]+)\\s+([-\\d.]+)\\)/);
    if (match) {
      const [, lng, lat] = match;
      return { lat: parseFloat(lat), lng: parseFloat(lng), altitude: 100 };
    }
  }
  if (geom && typeof geom.lat === 'number' && typeof geom.lng === 'number') {
    return { ...geom, altitude: 100 };
  }
  return null;
}

const MyGlobe: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [citizenReports, setCitizenReports] = useState<CitizenReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { alertId } = useParams<{ alertId?: string }>();
  const map3dRef = useRef<HTMLElement | null>(null);
  const markerRef = useRef<HTMLElement | null>(null);

  // Transform raw API data to CitizenReport format (same as Activity.tsx)
  const transformReportData = (rawReport: any): CitizenReport => {
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
      priority: (['low', 'medium', 'high', 'urgent'].includes(rawReport.priority) ? rawReport.priority : 'medium') as any,
      coordinates: rawReport.coordinates || undefined
    };
  };

  // Fetch both alerts and citizen reports on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Check if we're on HTTPS and warn user
        if (window.location.protocol === 'https:') {
          throw new Error('HTTPS detected! Please visit http://localhost:5174/ instead. Clear browser cache if it keeps redirecting to HTTPS.');
        }
        
        // Fetch alerts from Supabase
        const { data: alertsData, error: alertsError } = await supabase.from('alerts').select('*');
        if (!alertsError && alertsData) {
          setAlerts(alertsData);
        }

        // Fetch citizen reports from backend
        const response = await fetch('http://localhost:5000/api/citizen-reports', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'cors',
        });
        if (response.ok) {
          const rawReports = await response.json();
          if (Array.isArray(rawReports)) {
            const transformedReports = rawReports.map(transformReportData);
            setCitizenReports(transformedReports);
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        // Set empty arrays to prevent further errors
        setAlerts([]);
        setCitizenReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Center camera whenever data changes or URL id change
  useEffect(() => {
    if (alerts.length === 0 && citizenReports.length === 0) return;

    let selected: any = null;
    let pos: { lat: number; lng: number; altitude: number } | null = null;

    // Try to find by alertId first in alerts
    if (alertId) {
      selected = alerts.find((a) => String(a.id) === alertId);
      if (selected) {
        pos = parseGeometry(selected.map_point);
      }
    }

    // If not found in alerts, try citizen reports or just use first available
    if (!selected) {
      if (alerts.length > 0) {
        selected = alerts[0];
        pos = parseGeometry(selected.map_point);
      } else if (citizenReports.length > 0) {
        selected = citizenReports[0];
        if (selected.coordinates) {
          pos = { ...selected.coordinates, altitude: 100 };
        }
      }
    }

    if (pos && map3dRef.current) {
      map3dRef.current.setAttribute('center', `${pos.lat},${pos.lng},${pos.altitude}`);
    }
  }, [alerts, citizenReports, alertId]);

  // Draw markers for all alerts and citizen reports
  useEffect(() => {
    if (!map3dRef.current || (!alerts.length && !citizenReports.length) || !window.google?.maps?.importLibrary) return;

    let cleanup = () => {};
    const setup = async () => {
      const { Marker3DInteractiveElement, AltitudeMode } = await window.google.maps.importLibrary('maps3d');
      const mapEl = map3dRef.current!;

      // Helper to clear existing markers
      Array.from(mapEl.children).forEach((child) => {
        if (child instanceof HTMLElement && child.tagName.includes('MARKER3D')) {
          mapEl.removeChild(child);
        }
      });

      const markers: HTMLElement[] = [];

      // Add alert markers (red)
      alerts.forEach((alert) => {
        const pos = parseGeometry(alert.map_point);
        if (!pos) return;

        const marker = new Marker3DInteractiveElement({
          position: { ...pos, altitude: 22 },
          altitudeMode: AltitudeMode.ABSOLUTE,
        });
        marker.style.setProperty('--marker-color', '#ef4444'); // Red for alerts
        marker.addEventListener('gmp-click', () => console.log('Alert clicked:', alert.id));
        mapEl.appendChild(marker);
        markers.push(marker);
      });

      // Add citizen report markers (blue)
      citizenReports.forEach((report) => {
        if (!report.coordinates) return;
        
        const marker = new Marker3DInteractiveElement({
          position: { ...report.coordinates, altitude: 22 },
          altitudeMode: AltitudeMode.ABSOLUTE,
        });
        marker.style.setProperty('--marker-color', '#3b82f6'); // Blue for citizen reports
        marker.addEventListener('gmp-click', () => console.log('Citizen report clicked:', report.id));
        mapEl.appendChild(marker);
        markers.push(marker);
      });

      cleanup = () => {
        markers.forEach((marker) => {
          if (mapEl.contains(marker)) {
            mapEl.removeChild(marker);
          }
        });
      };
    };

    setup();
    return () => cleanup();
  }, [alerts, citizenReports]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-lg text-gray-600 mb-2">Loading world view data...</div>
          {window.location.protocol === 'https:' && (
            <div className="text-sm text-red-600">
              Note: If this takes too long, try <a href="http://localhost:5174/" className="underline">switching to HTTP</a>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header with summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">World View</h1>
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>{alerts.length} Alerts</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>{citizenReports.filter(r => r.coordinates).length} Citizen Reports (with coordinates)</span>
          </div>
          <div className="text-gray-500">
            {citizenReports.filter(r => !r.coordinates).length} reports without coordinates
          </div>
        </div>
      </div>

      {/* Map section */}
      <div className="w-full h-[500px] bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Map3D ref={map3dRef} />
      </div>

      {/* Combined data table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Location Data</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Source</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">ID</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Type/Description</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Location</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Latitude</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Longitude</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {/* Alerts */}
              {alerts.map((alert) => {
                const pos = parseGeometry(alert.map_point);
                return (
                  <tr key={`alert-${alert.id}`} className="hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                        Alert
                      </span>
                    </td>
                    <td className="px-4 py-2 font-mono text-xs text-gray-800">{alert.id}</td>
                    <td className="px-4 py-2 capitalize">{alert.type ?? 'n/a'}</td>
                    <td className="px-4 py-2 text-xs text-gray-600">-</td>
                    <td className="px-4 py-2 font-mono text-xs">{pos ? pos.lat.toFixed(5) : '-'}</td>
                    <td className="px-4 py-2 font-mono text-xs">{pos ? pos.lng.toFixed(5) : '-'}</td>
                    <td className="px-4 py-2 text-xs text-gray-600">-</td>
                  </tr>
                );
              })}
              
              {/* Citizen Reports */}
              {citizenReports.map((report) => (
                <tr key={`report-${report.id}`} className="hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      Call
                    </span>
                  </td>
                  <td className="px-4 py-2 font-mono text-xs text-gray-800">{report.id}</td>
                  <td className="px-4 py-2 max-w-xs truncate" title={report.description}>
                    {report.description}
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-600 max-w-xs truncate" title={report.location}>
                    {report.location}
                  </td>
                  <td className="px-4 py-2 font-mono text-xs">
                    {report.coordinates ? report.coordinates.lat.toFixed(5) : '-'}
                  </td>
                  <td className="px-4 py-2 font-mono text-xs">
                    {report.coordinates ? report.coordinates.lng.toFixed(5) : '-'}
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-600">
                    {new Date(report.timestamp).toLocaleDateString()} {new Date(report.timestamp).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
              
              {/* Empty state */}
              {alerts.length === 0 && citizenReports.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No location data available. Make some phone calls to see citizen reports appear here!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyGlobe;
