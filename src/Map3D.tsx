// Temporary wrapper for gmp-map-3d

import React, { useEffect, useRef, forwardRef } from 'react';

interface Map3DProps {
  center?: { lat: number; lng: number; altitude?: number };
  onMapLoad?: (mapEl: any) => void;
}

const Map3D = forwardRef<HTMLElement, Map3DProps>(({ center, onMapLoad }, ref) => {
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Forward the ref to the <gmp-map-3d> DOM element
  useEffect(() => {
    if (typeof ref === 'function') {
      ref(mapRef.current);
    } else if (ref) {
      (ref as React.MutableRefObject<HTMLElement | null>).current = mapRef.current;
    }
  }, [ref]);

  useEffect(() => {
    const init = async () => {
      const { Marker3DInteractiveElement, AltitudeMode } =
        await google.maps.importLibrary('maps3d');

      const mapEl = mapRef.current;
      if (!mapEl) return;

      // Draw initial marker at center if provided
      if (center && center.lat && center.lng) {
        // Remove any existing marker
        Array.from(mapEl.children).forEach(child => {
          if (child instanceof Marker3DInteractiveElement) {
            mapEl.removeChild(child);
          }
        });
        markerRef.current = null;
        // Create new marker
        const marker = new Marker3DInteractiveElement({
          position: { ...center, altitude: 22 },
          altitudeMode: AltitudeMode.ABSOLUTE,
        });
        marker.addEventListener('gmp-click', () => {
          console.log('🟡 Marker clicked!');
        });
        mapEl.append(marker);
        markerRef.current = marker;
        // Debug log
        console.log('[DEBUG] Marker position after creation:', marker.position);
      }


      if (typeof onMapLoad === 'function') {
        onMapLoad(mapEl);
      }
    };

    if (window.google?.maps?.importLibrary) {
      init();
    }
  }, [onMapLoad, center]);

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
});

export default Map3D;