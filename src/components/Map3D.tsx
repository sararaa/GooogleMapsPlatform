// Map3D.js
import React, { useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

const Map3D: React.FC = () => {
  const mapWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loader = new Loader({
      apiKey: 'AIzaSyBZwtfECQcocEuWwXKrzrn-VkwRe_zOPgc',
      version: 'beta',
    });

    loader.importLibrary('maps3d').then(({ Map3DElement }) => {
      if (!mapWrapperRef.current) return;
      
      const map3d = new Map3DElement({
        center: { lat: 35.68, lng: 139.76, altitude: 1000 },
        tilt: 80,
        heading: 0,
        range: 0,
        mode: 'HYBRID',
      });
      map3d.style.width = '100%';
      map3d.style.height = '500px';
      
      // Add click event to place a marker
      map3d.addEventListener('click', (event: any) => {
        console.log('Map clicked!', event);
        const position = event.detail?.latLngAlt || event.detail?.position;
        console.log('Position:', position);
        
        if (position) {
          // Try to create a 3D marker
          try {
            // @ts-expect-error - Google Maps 3D API types not available yet
            if (window.google.maps.Marker3D) {
              // @ts-expect-error - Google Maps 3D API types not available yet
              new window.google.maps.Marker3D({
                position: position,
                map: map3d,
              });
              console.log('3D Marker created');
            }
          } catch (error) {
            console.error('Error creating 3D marker:', error);
          }
        }
      });
      
      mapWrapperRef.current.innerHTML = '';
      mapWrapperRef.current.appendChild(map3d);
      console.log('3D Map loaded successfully');
    }).catch((error) => {
      console.error('Error loading 3D Map:', error);
    });
  }, []);

  return <div ref={mapWrapperRef} style={{ width: '100%', height: '500px' }} />;
};

export default Map3D;