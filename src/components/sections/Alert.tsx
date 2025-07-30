import React, { useState, useEffect, useRef } from 'react';
import Map3D from '../../Map3D';
import { supabase } from '../../supabaseClient.ts';
import { useParams, Link } from 'react-router-dom';

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
  const { alertId } = useParams<{ alertId?: string }>();
  const map3dRef = useRef<HTMLElement | null>(null);
  const markerRef = useRef<HTMLElement | null>(null);

  // Fetch alerts once on mount
  useEffect(() => {
    const fetchAlerts = async () => {
      const { data, error } = await supabase.from('alerts').select('*');
      if (!error && data) setAlerts(data);
    };
    fetchAlerts();
  }, []);

  // Center camera whenever alerts or URL id change
  useEffect(() => {
    if (alerts.length === 0) return;

    let selected = alerts[0];
    if (alertId) {
      const found = alerts.find((a) => String(a.id) === alertId);
      if (found) selected = found;
    }
    const pos = parseGeometry(selected.map_point);
    if (!pos) return;

    // Update center attribute on the map element directly
    if (map3dRef.current) {
      map3dRef.current.setAttribute('center', `${pos.lat},${pos.lng},${pos.altitude}`);
    }
  }, [alerts, alertId]);

  // Draw marker for selected alert and make it movable
  useEffect(() => {
    if (!map3dRef.current || alerts.length === 0 || !window.google?.maps?.importLibrary) return;

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

      let selected = alerts[0];
      if (alertId) {
        const found = alerts.find((a) => String(a.id) === alertId);
        if (found) selected = found;
      }
      const pos = parseGeometry(selected.map_point);
      if (!pos) return;

      const marker = new Marker3DInteractiveElement({
        position: { ...pos, altitude: 22 },
        altitudeMode: AltitudeMode.ABSOLUTE,
      });
      marker.addEventListener('gmp-click', () => console.log('Marker clicked'));
      mapEl.appendChild(marker);
      markerRef.current = marker;

      cleanup = () => {
        if (markerRef.current && mapEl.contains(markerRef.current)) {
          mapEl.removeChild(markerRef.current);
          markerRef.current = null;
        }
      };
    };

    setup();
    return () => cleanup();
  }, [alerts, alertId]);

  return (
    <div className="flex flex-col gap-6">
      {/* Map section */}
      <div className="w-full h-[500px]">
        <Map3D ref={map3dRef} />
      </div>

      {/* Alerts table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left font-semibold text-gray-700">ID</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700">Type</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700">Latitude</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700">Longitude</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {alerts.map((alert) => {
              const pos = parseGeometry(alert.map_point);
              return (
                <tr key={alert.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-mono text-xs text-gray-800">{alert.id}</td>
                  <td className="px-4 py-2 capitalize">{alert.type ?? 'n/a'}</td>
                  <td className="px-4 py-2">{pos ? pos.lat.toFixed(5) : '-'}</td>
                  <td className="px-4 py-2">{pos ? pos.lng.toFixed(5) : '-'}</td>
                  <td className="px-4 py-2">
                    <Link
                      to={`/alert/${alert.id}`}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      View on Map
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyGlobe;
