import { useEffect } from 'react';

interface Marker3DProps {
  mapEl: HTMLElement | null;
  position: google.maps.LatLngAltitudeLiteral;
  onClick?: () => void;
}

const Marker3D = ({ mapEl, position, onClick }: Marker3DProps) => {
  useEffect(() => {
    if (!mapEl || !window.google?.maps) return;

    const placeMarker = async () => {
      const { Marker3DInteractiveElement, AltitudeMode } =
        await google.maps.importLibrary('maps3d');

      const marker = new Marker3DInteractiveElement({
        position,
        altitudeMode: AltitudeMode.ABSOLUTE,
      });

      if (onClick) {
        marker.addEventListener('gmp-click', onClick);
      }

      mapEl.appendChild(marker);

      return () => {
        mapEl.removeChild(marker);
      };
    };

    placeMarker();

    // Cleanup on unmount
    return () => {};
  }, [mapEl, position, onClick]);

  return null; // It's imperatively rendered
};

export default Marker3D;