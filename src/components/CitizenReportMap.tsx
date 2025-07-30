import React, { useCallback, useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { MapPin, ExternalLink, AlertTriangle } from 'lucide-react';
import { CitizenReport } from '../types';

interface CitizenReportMapProps {
  report: CitizenReport;
  className?: string;
}

const GOOGLE_MAPS_API_KEY = 'AIzaSyBZwtfECQcocEuWwXKrzrn-VkwRe_zOPgc';

const mapContainerStyle = {
  width: '100%',
  height: '256px'
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
};

export const CitizenReportMap: React.FC<CitizenReportMapProps> = ({ 
  report, 
  className = "" 
}) => {
  const [showInfoWindow, setShowInfoWindow] = useState(false);

  const center = report.coordinates || { lat: 40.0, lng: -82.75 };

  const onLoad = useCallback((_map: google.maps.Map) => {
    // Map is loaded and ready
  }, []);

  const onUnmount = useCallback(() => {
    // Map is being unmounted
  }, []);

  const handleOpenInMaps = () => {
    if (report.coordinates) {
      const { lat, lng } = report.coordinates;
      const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
      window.open(url, '_blank');
    }
  };

  const getMarkerIcon = () => {
    const color = report.priority === 'urgent' ? 'red' : 
                  report.priority === 'high' ? 'orange' : 
                  report.priority === 'medium' ? 'yellow' : 'green';
                  
    return {
      url: `http://maps.google.com/mapfiles/ms/icons/${color}-dot.png`,
      scaledSize: new window.google.maps.Size(32, 32),
    };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (!report.coordinates) {
    return (
      <div className={`bg-gray-50 rounded-lg overflow-hidden ${className}`}>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <MapPin size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Location not available</p>
            <p className="text-sm text-gray-400">
              Coordinates could not be determined from the call
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Reported location: {report.location}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 rounded-lg overflow-hidden ${className}`}>
      <LoadScript 
        googleMapsApiKey={GOOGLE_MAPS_API_KEY}
        loadingElement={
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        }
      >
        <div className="relative">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={16}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={mapOptions}
          >
            <Marker
              position={center}
              title={report.location}
              icon={getMarkerIcon()}
              onClick={() => setShowInfoWindow(true)}
            />
            
            {showInfoWindow && (
              <InfoWindow
                position={center}
                onCloseClick={() => setShowInfoWindow(false)}
              >
                <div className="p-2 max-w-xs">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={16} className="text-blue-600" />
                    <h3 className="font-semibold text-gray-900 text-sm">
                      Citizen Report
                    </h3>
                  </div>
                  
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mb-2 ${getPriorityColor(report.priority)}`}>
                    <div className={`w-2 h-2 rounded-full ${
                      report.priority === 'urgent' ? 'bg-red-500' :
                      report.priority === 'high' ? 'bg-orange-500' :
                      report.priority === 'medium' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}></div>
                    {report.priority.toUpperCase()} Priority
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-2 font-medium">
                    {report.location}
                  </p>
                  
                  <p className="text-xs text-gray-600 mb-3 line-clamp-3">
                    {report.description}
                  </p>
                  
                  <div className="text-xs text-gray-500 mb-2">
                    Status: <span className="font-medium capitalize">{report.status.replace('_', ' ')}</span>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    {new Date(report.timestamp).toLocaleString()}
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
          
          {/* Overlay with report info */}
          <div className="absolute top-3 left-3 bg-white bg-opacity-95 rounded-lg px-3 py-2 shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                report.status === 'new' ? 'bg-red-500' :
                report.status === 'in_progress' ? 'bg-yellow-500' :
                report.status === 'resolved' ? 'bg-green-500' :
                'bg-gray-500'
              }`}></div>
              <span className="text-xs font-medium text-gray-700">
                {report.priority.toUpperCase()} Priority
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="absolute top-3 right-3 flex gap-2">
            <button
              onClick={() => setShowInfoWindow(!showInfoWindow)}
              className="bg-white bg-opacity-95 hover:bg-opacity-100 rounded-lg p-2 shadow-lg backdrop-blur-sm transition-colors"
              title="Show report details"
            >
              <AlertTriangle size={16} className="text-blue-600" />
            </button>
            <button
              onClick={handleOpenInMaps}
              className="bg-white bg-opacity-95 hover:bg-opacity-100 rounded-lg p-2 shadow-lg backdrop-blur-sm transition-colors"
              title="Open in Google Maps"
            >
              <ExternalLink size={16} className="text-blue-600" />
            </button>
          </div>
        </div>
      </LoadScript>
    </div>
  );
};