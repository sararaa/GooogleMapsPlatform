import React, { useState, useEffect, useRef, useCallback } from 'react';
import Map3D from '../../Map3D.tsx';
import { supabase } from '../../supabaseClient.ts';

const INITIAL_CAMERA_PROPS = {
  tilt: 45,
  heading: 0,
  zoom: 3,
};

function parseGeometry(geom: any): { lat: number; lng: number; altitude: number } | null {
  if (geom && typeof geom === 'object' && geom.type === 'Point' && Array.isArray(geom.coordinates)) {
    const [lng, lat] = geom.coordinates;
    if (typeof lng === 'number' && typeof lat === 'number') {
      return { lat, lng, altitude: 100 };
    }
  }
  if (typeof geom === 'string' && geom.includes('POINT\\(([-\\d.]+)\\s+([-\\d.]+)\\)/')) {
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

const MyGlobe = () => {
  const [cameraProps, setCameraProps] = useState(INITIAL_CAMERA_PROPS);
  const [alerts, setAlerts] = useState<any[]>([]);
  const map3dRef = useRef<HTMLElement | null>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      const { data, error } = await supabase.from('alerts').select('*');
      if (!error && data) setAlerts(data);
    };
    fetchAlerts();
  }, []);

  // Restore: update cameraProps.center when alerts change
  useEffect(() => {
    if (alerts.length > 0) {
      const firstAlert = alerts[0];
      const pos = parseGeometry(firstAlert.map_point);
      if (pos) {
        setCameraProps(prev => ({
          ...prev,
          center: pos
        }));
      }
    }
  }, [alerts]);

  // Marker logic: draw for first alert and allow moving on map click
  useEffect(() => {
    if (!map3dRef.current || !window.google?.maps?.importLibrary) return;
    let marker: any = markerRef.current;
    let clickHandler: any;

    const setup = async () => {
      const { Marker3DInteractiveElement, AltitudeMode } = await window.google.maps.importLibrary('maps3d');
      const mapEl = map3dRef.current;
      if (!mapEl) return;

      // Remove any existing marker
      Array.from(mapEl.children).forEach(child => {
        if (child instanceof Marker3DInteractiveElement) {
          mapEl.removeChild(child);
        }
      });
      markerRef.current = null;

      // Draw marker for the first alert if present
      if (alerts.length > 0) {
        const pos = parseGeometry(alerts[0].map_point);
        if (pos) {
          marker = new Marker3DInteractiveElement({
            position: { ...pos, altitude: 22 },
            altitudeMode: AltitudeMode.ABSOLUTE,
          });
          marker.addEventListener('gmp-click', () => {
            console.log('🟡 Marker itself was clicked!');
          });
          mapEl.appendChild(marker);
          markerRef.current = marker;
          console.log('[DEBUG] Initial marker position:', marker.position);
        }
      }

      // Allow moving marker on map click
      clickHandler = (event: any) => {
        const pos = event.detail?.latLngAlt || event.position;
        if (!pos) return;
        if (!marker) {
          marker = new Marker3DInteractiveElement({
            position: pos,
            altitudeMode: AltitudeMode.ABSOLUTE,
          });
          marker.addEventListener('gmp-click', () => {
            console.log('🟡 Marker itself was clicked!');
            console.log(markerRef.current.position);
          });
          Array.from(mapEl.children).forEach(child => {
            if (child instanceof Marker3DInteractiveElement) {
              mapEl.removeChild(child);
            }
          });
          mapEl.appendChild(marker);
          markerRef.current = marker;
        } else {
          marker.position = pos;
        }
      };
      mapEl.addEventListener('gmp-click', clickHandler);
    };
    setup();
    return () => {
      const mapEl = map3dRef.current;
      if (mapEl && clickHandler) {
        mapEl.removeEventListener('gmp-click', clickHandler);
      }
      // Remove marker on cleanup
      if (markerRef.current && mapEl && mapEl.contains(markerRef.current)) {
        mapEl.removeChild(markerRef.current);
        markerRef.current = null;
      }
    };
  }, [alerts, map3dRef.current]);

  const handleCameraChange = useCallback((props) => setCameraProps(props), []);

  return (
    <Map3D ref={map3dRef} center={cameraProps.center} onCameraChange={handleCameraChange} />
  );
};

export default MyGlobe; 