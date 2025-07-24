import { useEffect } from 'react';

interface Marker3DProps {
  mapEl: HTMLElement | null;
  position: google.maps.LatLngAltitudeLiteral;
  onClick?: () => void;
}

const Marker3D = ({ mapEl, position, onClick }: Marker3DProps) => {
  useEffect(() => {
    if (!mapEl || !window.google?.maps) return;

    

    // Cleanup on unmount
    return () => {};
  }, [mapEl, position, onClick]);

  return null; // It's imperatively rendered
};

export default Marker3D;