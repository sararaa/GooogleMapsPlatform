import React, { useRef, useEffect, useState } from 'react';
import { MapPin, Info } from 'lucide-react';
import { Project } from '../types';

interface ProjectsMapViewProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
}

declare global {
  interface Window {
    google: any;
  }
}

export const ProjectsMapView: React.FC<ProjectsMapViewProps> = ({ projects, onProjectClick }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [polygons, setPolygons] = useState<any[]>([]);
  const [infoWindow, setInfoWindow] = useState<any>(null);

  useEffect(() => {
    initializeMap();
  }, []);

  useEffect(() => {
    if (map) {
      displayProjects();
    }
  }, [map, projects]);

  const initializeMap = async () => {
    if (!window.google?.maps) {
      console.error('Google Maps not loaded');
      return;
    }

    // Default center - US center, but we'll adjust bounds based on projects
    const defaultCenter = { lat: 39.8283, lng: -98.5795 };
    
    const mapInstance = new window.google.maps.Map(mapRef.current, {
      zoom: 4,
      center: defaultCenter,
      mapTypeId: 'hybrid',
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
    });

    const infoWindowInstance = new window.google.maps.InfoWindow();

    setMap(mapInstance);
    setInfoWindow(infoWindowInstance);
  };

  const displayProjects = () => {
    if (!map) return;

    // Clear existing markers and polygons
    markers.forEach(marker => marker.setMap(null));
    polygons.forEach(polygon => polygon.setMap(null));
    setMarkers([]);
    setPolygons([]);

    const newMarkers: any[] = [];
    const newPolygons: any[] = [];
    const bounds = new window.google.maps.LatLngBounds();
    let hasValidLocations = false;

    projects.forEach(project => {
      const statusColors = {
        planning: '#f59e0b',
        in_progress: '#3b82f6',
        on_hold: '#f97316',
        completed: '#10b981',
        cancelled: '#ef4444'
      };

      // If project has area coordinates, display as polygon
      if (project.area?.coordinates?.length) {
        const polygon = new window.google.maps.Polygon({
          paths: project.area.coordinates,
          fillColor: statusColors[project.status],
          fillOpacity: 0.3,
          strokeWeight: 2,
          strokeColor: statusColors[project.status],
          clickable: true,
        });

        polygon.setMap(map);
        newPolygons.push(polygon);

        // Add click listener
        polygon.addListener('click', () => {
          showProjectInfo(project, project.area!.center!);
        });

        // Extend bounds to include all polygon points
        project.area.coordinates.forEach(coord => {
          bounds.extend(coord);
          hasValidLocations = true;
        });

      } else if (project.location) {
        // If no area but has location, try to geocode or use a default marker
        // For now, we'll place markers at random locations as fallback
        // In a real app, you'd geocode the location string
        const fallbackCoords = generateFallbackCoordinates(project.id);
        
        const marker = new window.google.maps.Marker({
          position: fallbackCoords,
          map: map,
          title: project.title,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: statusColors[project.status],
            fillOpacity: 0.8,
            strokeWeight: 2,
            strokeColor: '#ffffff',
          },
        });

        newMarkers.push(marker);
        bounds.extend(fallbackCoords);
        hasValidLocations = true;

        // Add click listener
        marker.addListener('click', () => {
          showProjectInfo(project, fallbackCoords);
        });
      }
    });

    setMarkers(newMarkers);
    setPolygons(newPolygons);

    // Fit map bounds to show all projects
    if (hasValidLocations && !bounds.isEmpty()) {
      map.fitBounds(bounds);
      
      // Prevent zoom from being too close
      const listener = window.google.maps.event.addListener(map, 'bounds_changed', () => {
        if (map.getZoom() > 15) {
          map.setZoom(15);
        }
        window.google.maps.event.removeListener(listener);
      });
    }
  };

  const generateFallbackCoordinates = (projectId: string): { lat: number, lng: number } => {
    // Generate consistent coordinates based on project ID
    // This is a simple hash function for demo purposes
    let hash = 0;
    for (let i = 0; i < projectId.length; i++) {
      const char = projectId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Map hash to lat/lng within reasonable bounds (US-ish area)
    const lat = 25 + (Math.abs(hash) % 20); // 25-45 latitude
    const lng = -125 + (Math.abs(hash >> 16) % 50); // -125 to -75 longitude
    
    return { lat, lng };
  };

  const showProjectInfo = (project: Project, position: { lat: number, lng: number }) => {
    const content = `
      <div class="p-3 max-w-sm">
        <h3 class="font-semibold text-gray-900 mb-2">${project.title}</h3>
        <p class="text-sm text-gray-600 mb-3">${project.description}</p>
        <div class="space-y-1 text-xs">
          <div class="flex justify-between">
            <span class="text-gray-500">Status:</span>
            <span class="font-medium">${project.status.replace('_', ' ')}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Budget:</span>
            <span class="font-medium">$${(project.budget / 1000000).toFixed(1)}M</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Progress:</span>
            <span class="font-medium">${project.progress}%</span>
          </div>
        </div>
        <button 
          onclick="window.openProject('${project.id}')" 
          class="mt-3 w-full bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-700 transition-colors"
        >
          View Details
        </button>
      </div>
    `;

    infoWindow.setContent(content);
    infoWindow.setPosition(position);
    infoWindow.open(map);

    // Store the project click handler globally so the button can access it
    (window as any).openProject = (projectId: string) => {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        onProjectClick(project);
        infoWindow.close();
      }
    };
  };

  const getProjectsWithAreas = () => {
    return projects.filter(p => p.area?.coordinates?.length).length;
  };

  const getProjectsWithoutAreas = () => {
    return projects.filter(p => !p.area?.coordinates?.length).length;
  };

  return (
    <div className="space-y-4">
      {/* Map Info Bar */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info size={16} className="text-blue-600" />
            <span className="text-sm text-blue-800">
              Showing {projects.length} projects on map
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-blue-700">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-600 opacity-30 border border-blue-600 rounded"></div>
              <span>{getProjectsWithAreas()} with defined areas</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <span>{getProjectsWithoutAreas()} location markers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
        <div 
          ref={mapRef} 
          style={{ height: '600px', width: '100%' }}
        />
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="font-medium text-gray-900 mb-3">Project Status Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
          {[
            { status: 'planning', label: 'Planning', color: '#f59e0b' },
            { status: 'in_progress', label: 'In Progress', color: '#3b82f6' },
            { status: 'on_hold', label: 'On Hold', color: '#f97316' },
            { status: 'completed', label: 'Completed', color: '#10b981' },
            { status: 'cancelled', label: 'Cancelled', color: '#ef4444' }
          ].map(({ status, label, color }) => (
            <div key={status} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded border-2 border-white"
                style={{ backgroundColor: color, opacity: 0.8 }}
              ></div>
              <span className="text-gray-700">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 