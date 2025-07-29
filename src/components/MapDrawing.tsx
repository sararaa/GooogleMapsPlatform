import React, { useRef, useEffect, useState } from 'react';
import { Trash2, RotateCcw } from 'lucide-react';

interface MapDrawingProps {
  initialArea?: {
    coordinates: Array<{lat: number, lng: number}>;
    center?: {lat: number, lng: number};
  };
  onAreaChange: (area: {coordinates: Array<{lat: number, lng: number}>, center: {lat: number, lng: number}}) => void;
}

declare global {
  interface Window {
    google: any;
  }
}

export const MapDrawing: React.FC<MapDrawingProps> = ({ initialArea, onAreaChange }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [drawingManager, setDrawingManager] = useState<any>(null);
  const [currentPolygon, setCurrentPolygon] = useState<any>(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);

  useEffect(() => {
    initializeMap();
  }, []);

  useEffect(() => {
    if (map && initialArea && initialArea.coordinates.length > 0) {
      displayExistingArea();
    }
  }, [map, initialArea]);

  const initializeMap = async () => {
    if (!window.google?.maps) {
      console.error('Google Maps not loaded');
      return;
    }

    const defaultCenter = initialArea?.center || { lat: 39.8283, lng: -98.5795 }; // Center of US
    
    const mapInstance = new window.google.maps.Map(mapRef.current, {
      zoom: initialArea?.center ? 15 : 4,
      center: defaultCenter,
      mapTypeId: 'hybrid',
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: false,
    });

    // Initialize Drawing Manager
    const drawingManagerInstance = new window.google.maps.drawing.DrawingManager({
      drawingMode: null,
      drawingControl: true,
      drawingControlOptions: {
        position: window.google.maps.ControlPosition.TOP_CENTER,
        drawingModes: ['polygon'],
      },
      polygonOptions: {
        fillColor: '#2563eb',
        fillOpacity: 0.3,
        strokeWeight: 2,
        strokeColor: '#1d4ed8',
        clickable: true,
        editable: true,
      },
    });

    drawingManagerInstance.setMap(mapInstance);

    // Handle polygon completion
    drawingManagerInstance.addListener('polygoncomplete', (polygon: any) => {
      // Remove previous polygon if exists
      if (currentPolygon) {
        currentPolygon.setMap(null);
      }

      setCurrentPolygon(polygon);
      setIsDrawingMode(false);
      drawingManagerInstance.setDrawingMode(null);
      
      // Get coordinates and update parent
      updateAreaFromPolygon(polygon);

      // Add listeners for polygon editing
      polygon.getPath().addListener('set_at', () => updateAreaFromPolygon(polygon));
      polygon.getPath().addListener('insert_at', () => updateAreaFromPolygon(polygon));
    });

    // Handle drawing mode changes
    drawingManagerInstance.addListener('drawingmode_changed', () => {
      const mode = drawingManagerInstance.getDrawingMode();
      setIsDrawingMode(mode === 'polygon');
    });

    setMap(mapInstance);
    setDrawingManager(drawingManagerInstance);
  };

  const displayExistingArea = () => {
    if (!map || !initialArea?.coordinates?.length) return;

    const polygon = new window.google.maps.Polygon({
      paths: initialArea.coordinates,
      fillColor: '#2563eb',
      fillOpacity: 0.3,
      strokeWeight: 2,
      strokeColor: '#1d4ed8',
      clickable: true,
      editable: true,
    });

    polygon.setMap(map);
    setCurrentPolygon(polygon);

    // Add listeners for editing
    polygon.getPath().addListener('set_at', () => updateAreaFromPolygon(polygon));
    polygon.getPath().addListener('insert_at', () => updateAreaFromPolygon(polygon));

    // Fit map to polygon bounds
    const bounds = new window.google.maps.LatLngBounds();
    initialArea.coordinates.forEach(coord => bounds.extend(coord));
    map.fitBounds(bounds);
  };

  const updateAreaFromPolygon = (polygon: any) => {
    const path = polygon.getPath();
    const coordinates: Array<{lat: number, lng: number}> = [];
    
    for (let i = 0; i < path.getLength(); i++) {
      const point = path.getAt(i);
      coordinates.push({
        lat: point.lat(),
        lng: point.lng(),
      });
    }

    // Calculate center
    const bounds = new window.google.maps.LatLngBounds();
    coordinates.forEach(coord => bounds.extend(coord));
    const center = {
      lat: bounds.getCenter().lat(),
      lng: bounds.getCenter().lng(),
    };

    onAreaChange({ coordinates, center });
  };

  const clearArea = () => {
    if (currentPolygon) {
      currentPolygon.setMap(null);
      setCurrentPolygon(null);
      onAreaChange({ coordinates: [], center: { lat: 0, lng: 0 } });
    }
  };

  const resetView = () => {
    if (map) {
      const defaultCenter = { lat: 39.8283, lng: -98.5795 };
      map.setCenter(defaultCenter);
      map.setZoom(4);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Draw Project Area</h3>
        <p className="text-sm text-blue-800">
          Use the polygon tool in the map to draw the area where your project will take place. 
          You can click and drag the points to adjust the area after drawing.
        </p>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={clearArea}
          disabled={!currentPolygon}
          className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <Trash2 size={16} />
          Clear Area
        </button>
        <button
          onClick={resetView}
          className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <RotateCcw size={16} />
          Reset View
        </button>
      </div>

      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <div 
          ref={mapRef} 
          style={{ height: '400px', width: '100%' }}
        />
      </div>

      {currentPolygon && (
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-green-800">
            ✓ Project area defined. You can still edit the area by dragging the polygon points on the map.
          </p>
        </div>
      )}
    </div>
  );
}; 