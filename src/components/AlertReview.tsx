import React, { useEffect, useRef, useState } from 'react';
import Map3D from '../Map3D';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient.ts';

interface Position {
  lat: number;
  lng: number;
  altitude?: number;
}

function parseGeometry(geom: any): Position | null {
  if (geom && typeof geom === 'object' && geom.type === 'Point' && Array.isArray(geom.coordinates)) {
    const [lng, lat] = geom.coordinates;
    if (typeof lng === 'number' && typeof lat === 'number') {
      return { lat, lng, altitude: 100 };
    }
  }
  if (typeof geom === 'string' && geom.includes('POINT')) {
    const match = geom.match(/POINT\(([-\d.]+)\s+([-\d.]+)\)/);
    if (match) {
      const [, lng, lat] = match;
      return { lat: parseFloat(lat), lng: parseFloat(lng), altitude: 100 };
    }
  }
  return null;
}

const AlertReview: React.FC = () => {
  const { alertId } = useParams<{ alertId: string }>();
  const navigate = useNavigate();
  const [alert, setAlert] = useState<any | null>(null);
  const [alreadyConfirmed, setAlreadyConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<HTMLElement | null>(null);
  const markerRef = useRef<any>(null);
  const [markerPos, setMarkerPos] = useState<Position | null>(null);

  // Fetch alert
  useEffect(() => {
    if (!alertId) return;
    const fetchAlert = async () => {
      const { data, error } = await supabase.from('alerts').select('*').eq('id', alertId).single();
      if (!error && data) {
        if (data.confirmed) {
          setAlreadyConfirmed(true);
          setLoading(false);
          return;
        }
        setAlert(data);
        const pos = parseGeometry(data.map_point);
        if (pos) setMarkerPos(pos);
      }
      setLoading(false);
    };
    fetchAlert();
  }, [alertId, navigate]);

  // Setup marker interaction
  useEffect(() => {
    if (!markerPos || !mapRef.current || !window.google?.maps?.importLibrary) return;

    let cleanup = () => {};
    const setup = async () => {
      const { Marker3DInteractiveElement, AltitudeMode } = await window.google.maps.importLibrary('maps3d');
      const mapEl = mapRef.current!;

      // clear existing
      Array.from(mapEl.children).forEach((child) => {
        if (child instanceof Marker3DInteractiveElement) mapEl.removeChild(child);
      });

      const marker = new Marker3DInteractiveElement({
        position: { ...markerPos, altitude: 22 },
        altitudeMode: AltitudeMode.RELATIVE_TO_GROUND,
      });
      let firstMove = true;
      mapEl.appendChild(marker);
      markerRef.current = marker;

      const clickHandler = (e: any) => {
        const pos = e.detail?.latLngAlt || e.position;
        if (pos) {
          const newPos = { lat: pos.lat, lng: pos.lng, altitude: 0 };
          marker.position = newPos;
          console.log('Marker clicked!');
          console.log(marker.position);
          setMarkerPos({ lat: newPos.lat, lng: newPos.lng, altitude: newPos.altitude });
        }
      };
      mapEl.addEventListener('gmp-click', clickHandler);

      cleanup = () => {
        mapEl.removeEventListener('gmp-click', clickHandler);
        if (markerRef.current && mapEl.contains(markerRef.current)) {
          mapEl.removeChild(markerRef.current);
        }
      };
    };
    setup();
    return () => cleanup();
  }, [markerPos]);

  const handleSubmit = async () => {
    if (!markerPos || !alertId) return;
    const pointGeom = `POINT(${markerPos.lng} ${markerPos.lat})`;
    const { error } = await supabase
      .from('alerts')
      .update({ map_point: pointGeom, confirmed: true })
      .eq('id', alertId);

    if (!error) {
      // redirect back to world view and close link
      navigate('/worldview', { replace: true });
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (alreadyConfirmed) {
    return (
      <div className="p-6 text-center text-green-700 font-medium">
        Thank you, but you've already confirmed this alert ❤️
      </div>
    );
  }

  if (!alert || !markerPos) {
    return <div className="p-6 text-center">Alert not found</div>;
  }

  return (
    <div className="flex flex-col gap-6 h-screen p-4">
      <div className="flex-1">
        <Map3D ref={mapRef} center={markerPos} />
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Alert #{alert.id}</h2>
        <p className="text-sm text-gray-600 mb-4 capitalize">Type: {alert.type ?? 'n/a'}</p>
        <p className="text-sm mb-4">
          Current position: {markerPos.lat.toFixed(5)}, {markerPos.lng.toFixed(5)}
        </p>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
        >
          Confirm Position
        </button>
      </div>
    </div>
  );
};

export default AlertReview;
