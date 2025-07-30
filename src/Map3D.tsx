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