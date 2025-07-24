// Temporary wrapper for gmp-map-3d

import React, { useEffect, useRef } from 'react';

interface Map3DProps {
  center?: { lat: number; lng: number; altitude?: number };
  onMapLoad?: (mapEl: any) => void;
}

const Map3D: React.FC<Map3DProps> = ({ center, onMapLoad }) => {
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    const init = async () => {
      const { Marker3DInteractiveElement, AltitudeMode } =
        await google.maps.importLibrary('maps3d');

      const mapEl = mapRef.current;
      if (!mapEl) return;

      mapEl.addEventListener('gmp-click', (e: any) => {
        const pos = e.detail?.latLngAlt || e.detail?.position;
        if (!pos) return;

        console.log('📍 Clicked:', pos);

        if (!markerRef.current) {
          const marker = new Marker3DInteractiveElement({
            position: pos,
            altitudeMode: AltitudeMode.ABSOLUTE,
          });

          marker.addEventListener('gmp-click', () => {
            console.log('🟡 Marker clicked!');
          });

          mapEl.append(marker);
          markerRef.current = marker;
        } else {
          markerRef.current.position = pos;
        }
      });

      if (typeof onMapLoad === 'function') {
        onMapLoad(mapEl);
      }
    };

    if (window.google?.maps?.importLibrary) {
      init();
    }
  }, [onMapLoad]);

  useEffect(() => {
    if (mapRef.current && center) {
      mapRef.current.setAttribute('center', `${center.lat},${center.lng},${center.altitude}`);
    }
  }, [center]);

  return (
    <gmp-map-3d
      ref={mapRef}
      style={{ width: '98%', height: '98%' }}
      mode="HYBRID"
      tilt={80}
      heading={0}
      range={2000}
    />
  );
};

export default Map3D;