import React, { useState, useEffect, useCallback, useRef } from 'react';
import Map3D from '../../Map3D.tsx';
import Marker3D from '../../Marker3D.tsx';
import { supabase } from '../../supabaseClient.ts';

const INITIAL_CAMERA_PROPS: Map3DCameraProps = {
  tilt: 45,
  heading: 0,
  zoom: 3,
};

function parseGeometry(geom: any): { lat: number; lng: number } | null {
  if (geom && typeof geom === 'object' && geom.type === 'Point' && Array.isArray(geom.coordinates)) {
    const [lng, lat] = geom.coordinates;
    if (typeof lng === 'number' && typeof lat === 'number') {
      return { lat, lng };
    }
  }
  if (typeof geom === 'string' && geom.includes('POINT\\(([-\\d.]+)\\s+([-\\d.]+)\\)/')) {
    const match = geom.match(/POINT\\(([-\\d.]+)\\s+([-\\d.]+)\\)/);
    if (match) {
      const [, lng, lat] = match;
      return { lat: parseFloat(lat), lng: parseFloat(lng) };
    }
  }
  if (geom && typeof geom.lat === 'number' && typeof geom.lng === 'number') {
    return geom;
  }
  return null;
}

const MyGlobe = () => {
  const [cameraProps, setCameraProps] = useState<Map3DCameraProps>(INITIAL_CAMERA_PROPS);
  const [alerts, setAlerts] = useState<any[]>([]);
  const map3dRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      const { data, error } = await supabase.from('alerts').select('*');
      if (!error && data) setAlerts(data);
    };
    fetchAlerts();
  }, []);

  useEffect(() => {
    if (alerts.length > 0) {
      const firstAlert = alerts[0];
      const pos = parseGeometry(firstAlert.map_point);
      if (pos) {
        setCameraProps(prev => ({
          ...prev,
          center: { lat: pos.lat, lng: pos.lng, altitude: 100 }
        }));
      }
    }
  }, [alerts]);

  const handleCameraChange = useCallback((props: Map3DCameraProps) => setCameraProps(props), []);
  console.log("Camera Props", cameraProps); 
  return (
    <Map3D ref={map3dRef} center={cameraProps.center} onCameraChange={handleCameraChange}>
      {alerts.map(alert => {
        const pos = parseGeometry(alert.map_point);
        if (!pos) return null;
        return (
          <Marker3D
            key={alert.id}
            mapEl={map3dRef.current}
            position={{ ...pos, altitude: 100 }}
          />
        );
      })}
    </Map3D>
  );
};

export default MyGlobe; 