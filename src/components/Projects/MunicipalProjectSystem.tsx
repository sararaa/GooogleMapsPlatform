// Municipal Project Management System for Google Maps Platform
// Complete project lifecycle management with mapping capabilities

import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, Marker, Polygon, DrawingManager, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { MapPin, PenTool, AlertCircle, Plus, Edit3, Calendar, DollarSign, Users, Trash2 } from 'lucide-react';

// Core Types and Interfaces
export interface MunicipalProject {
  id: string;
  name: string;
  description?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'on_hold';
  start_date?: string;
  end_date?: string;
  budget?: number;
  department?: string;
  contractor_name?: string;
  location_name?: string;
  color?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  created_at?: string;
  updated_at?: string;
}

export interface ProjectLocation {
  id: string;
  project_id: string;
  location: any; // PostGIS geometry object (WKT or GeoJSON)
  created_at: string;
}

export interface ProjectWithLocations extends MunicipalProject {
  locations: ProjectLocation[];
}

interface Coordinate {
  lat: number;
  lng: number;
}

// Utility Functions
function parseGeometry(geom: any): { lat: number; lng: number } | null {
  if (geom && typeof geom === 'object' && geom.type === 'Point' && Array.isArray(geom.coordinates)) {
    const [lng, lat] = geom.coordinates;
    if (typeof lng === 'number' && typeof lat === 'number') {
      return { lat, lng };
    }
  }
  
  if (typeof geom === 'string') {
    if (geom.includes('POINT')) {
      const match = geom.match(/POINT\(([-\d.]+)\s+([-\d.]+)\)/);
      if (match) {
        const [, lng, lat] = match;
        return { lat: parseFloat(lat), lng: parseFloat(lng) };
      }
    }
  }
  
  if (geom && typeof geom.lat === 'number' && typeof geom.lng === 'number') {
    return geom;
  }
  
  return null;
}

function parsePolygonGeometry(geom: any): { lat: number; lng: number }[] | null {
  if (geom && typeof geom === 'object' && geom.type === 'Polygon' && Array.isArray(geom.coordinates)) {
    return geom.coordinates[0].map((coord: number[]) => ({
      lat: coord[1],
      lng: coord[0]
    }));
  }
  
  if (typeof geom === 'string' && geom.includes('POLYGON')) {
    const match = geom.match(/POLYGON\(\(([^)]+)\)\)/);
    if (match) {
      const coords = match[1].split(',').map(pair => {
        const [lng, lat] = pair.trim().split(' ').map(Number);
        return { lat, lng };
      });
      return coords;
    }
  }
  
  return null;
}

function dateRangesOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
  const start1Date = new Date(start1);
  const end1Date = new Date(end1);
  const start2Date = new Date(start2);
  const end2Date = new Date(end2);
  return start1Date <= end2Date && start2Date <= end1Date;
}

function checkLocationOverlap(loc1: any, loc2: any): boolean {
  const point1 = parseGeometry(loc1);
  const point2 = parseGeometry(loc2);
  
  // Simple distance check for points (within 100m)
  if (point1 && point2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = point1.lat * Math.PI/180;
    const φ2 = point2.lat * Math.PI/180;
    const Δφ = (point2.lat-point1.lat) * Math.PI/180;
    const Δλ = (point2.lng-point1.lng) * Math.PI/180;
    
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance < 100; // Within 100 meters
  }
  
  return false;
}

// Project Map Marker Component
interface ProjectMapMarkerProps {
  project: ProjectWithLocations;
  onClick: (project: ProjectWithLocations, locationId: string) => void;
  selectedProject: ProjectWithLocations | null;
  conflictingProjects?: string[];
}

const ProjectMapMarker: React.FC<ProjectMapMarkerProps> = ({ 
  project, 
  onClick, 
  selectedProject,
  conflictingProjects = []
}) => {
  const isSelected = selectedProject?.id === project.id;
  const hasConflict = conflictingProjects.includes(project.id);
  
  const getMarkerIcon = (color: string) => {
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: hasConflict ? '#ef4444' : color,
      fillOpacity: isSelected ? 1.0 : 0.9,
      strokeWeight: isSelected ? 3 : 2,
      strokeColor: hasConflict ? '#dc2626' : '#ffffff',
      scale: isSelected ? 12 : 10
    };
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'planned': '#f59e0b',
      'in_progress': '#3b82f6',
      'completed': '#10b981',
      'on_hold': '#ef4444'
    };
    return colors[status as keyof typeof colors] || '#6b7280';
  };

  if (!project.locations || project.locations.length === 0) {
    return null;
  }

  return (
    <>
      {project.locations.map((location, index) => {
        const pointGeom = parseGeometry(location.location);
        const polygonGeom = parsePolygonGeometry(location.location);

        if (pointGeom) {
          return (
            <Marker
              key={`${project.id}-point-${index}`}
              position={pointGeom}
              icon={getMarkerIcon(getStatusColor(project.status))}
              title={`${project.name}${hasConflict ? ' (CONFLICT!)' : ''}`}
              onClick={() => onClick(project, location.id)}
            />
          );
        }

        if (polygonGeom) {
          return (
            <Polygon
              key={`${project.id}-polygon-${index}`}
              paths={polygonGeom}
              options={{
                fillColor: hasConflict ? '#ef4444' : getStatusColor(project.status),
                fillOpacity: isSelected ? 0.4 : 0.3,
                strokeColor: hasConflict ? '#dc2626' : getStatusColor(project.status),
                strokeWeight: isSelected ? 3 : 2,
                clickable: true
              }}
              onClick={() => onClick(project, location.id)}
            />
          );
        }

        return null;
      })}
    </>
  );
};

// Project Creation Modal
interface ProjectCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Omit<MunicipalProject, 'id' | 'created_at'>, location?: Coordinate, coordinates?: Coordinate[]) => void;
  existingProjects: ProjectWithLocations[];
}

const ProjectCreationModal: React.FC<ProjectCreationModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  existingProjects 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planned' as const,
    start_date: '',
    end_date: '',
    budget: 0,
    department: '',
    contractor_name: '',
    priority: 'medium' as const,
    color: '#3b82f6'
  });
  
  const [locationType, setLocationType] = useState<'point' | 'draw'>('point');
  const [location, setLocation] = useState<Coordinate | null>(null);
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const [conflicts, setConflicts] = useState<string[]>([]);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyBZwtfECQcocEuWwXKrzrn-VkwRe_zOPgc',
    libraries: ['places', 'drawing']
  });

  const checkForConflicts = useCallback(() => {
    if (!formData.start_date || !formData.end_date) return;
    
    const conflictingProjects = existingProjects.filter(project => {
      if (!project.start_date || !project.end_date) return false;
      
      const dateOverlap = dateRangesOverlap(
        formData.start_date, 
        formData.end_date,
        project.start_date, 
        project.end_date
      );
      
      if (!dateOverlap) return false;
      
      // Check location overlap
      const currentLocation = location ? {
        type: 'Point',
        coordinates: [location.lng, location.lat]
      } : coordinates.length > 0 ? {
        type: 'Polygon',
        coordinates: [coordinates.map(c => [c.lng, c.lat])]
      } : null;
      
      if (!currentLocation) return false;
      
      return project.locations.some(loc => 
        checkLocationOverlap(currentLocation, loc.location)
      );
    });
    
    setConflicts(conflictingProjects.map(p => p.name));
  }, [formData.start_date, formData.end_date, location, coordinates, existingProjects]);

  useEffect(() => {
    checkForConflicts();
  }, [checkForConflicts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, location || undefined, coordinates.length > 0 ? coordinates : undefined);
    onClose();
    // Reset form
    setFormData({
      name: '',
      description: '',
      status: 'planned',
      start_date: '',
      end_date: '',
      budget: 0,
      department: '',
      contractor_name: '',
      priority: 'medium',
      color: '#3b82f6'
    });
    setLocation(null);
    setCoordinates([]);
    setConflicts([]);
  };

  if (!isOpen || !isLoaded) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
        
        {conflicts.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle size={16} />
              <span className="font-medium">Schedule/Location Conflicts Detected</span>
            </div>
            <ul className="mt-2 text-sm text-red-600">
              {conflicts.map((conflict, index) => (
                <li key={index}>• {conflict}</li>
              ))}
            </ul>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="planned">Planned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                required
                value={formData.end_date}
                onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget
              </label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({...formData, budget: Number(e.target.value)})}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contractor
            </label>
            <input
              type="text"
              value={formData.contractor_name}
              onChange={(e) => setFormData({...formData, contractor_name: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Location Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Location
            </label>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setLocationType('point')}
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded ${
                  locationType === 'point' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <MapPin size={16} />
                Point Location
              </button>
              <button
                type="button"
                onClick={() => setLocationType('draw')}
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded ${
                  locationType === 'draw' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <PenTool size={16} />
                Draw Area
              </button>
            </div>
            
            <div className="h-64 border border-gray-300 rounded">
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={{ lat: 34.1478, lng: -118.1445 }}
                zoom={13}
                onClick={(e) => {
                  if (locationType === 'point' && e.latLng) {
                    setLocation({
                      lat: e.latLng.lat(),
                      lng: e.latLng.lng()
                    });
                  }
                }}
              >
                {locationType === 'draw' && (
                  <DrawingManager
                    options={{
                      drawingControl: true,
                      drawingControlOptions: {
                        position: google.maps.ControlPosition.TOP_CENTER,
                        drawingModes: [google.maps.drawing.OverlayType.POLYGON]
                      },
                      polygonOptions: {
                        fillColor: '#3b82f6',
                        fillOpacity: 0.3,
                        strokeWeight: 2,
                        clickable: false,
                        editable: true,
                        zIndex: 1
                      }
                    }}
                    onPolygonComplete={(polygon) => {
                      const path = polygon.getPath();
                      const coords: Coordinate[] = [];
                      for (let i = 0; i < path.getLength(); i++) {
                        const point = path.getAt(i);
                        coords.push({
                          lat: point.lat(),
                          lng: point.lng()
                        });
                      }
                      setCoordinates(coords);
                      polygon.setMap(null);
                    }}
                  />
                )}
                
                {location && locationType === 'point' && (
                  <Marker position={location} />
                )}
                
                {coordinates.length > 0 && locationType === 'draw' && (
                  <Polygon
                    paths={coordinates}
                    options={{
                      fillColor: '#3b82f6',
                      fillOpacity: 0.3,
                      strokeWeight: 2
                    }}
                  />
                )}
              </GoogleMap>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Project Service
class MunicipalProjectService {
  private static projects: ProjectWithLocations[] = [
    {
      id: '1',
      name: 'Downtown Infrastructure Upgrade',
      description: 'Major infrastructure improvements in downtown area',
      status: 'in_progress',
      start_date: '2024-01-15',
      end_date: '2024-06-30',
      budget: 250000,
      department: 'Public Works',
      contractor_name: 'Metro Construction',
      priority: 'high',
      color: '#3b82f6',
      created_at: '2024-01-01T00:00:00Z',
      locations: [
        {
          id: 'loc-1',
          project_id: '1',
          location: {
            type: 'Point',
            coordinates: [-118.1445, 34.1478]
          },
          created_at: '2024-01-01T00:00:00Z'
        }
      ]
    },
    {
      id: '2',
      name: 'Community Park Development',
      description: 'New community park with playground and facilities',
      status: 'planned',
      start_date: '2024-03-01',
      end_date: '2024-08-15',
      budget: 180000,
      department: 'Parks & Recreation',
      contractor_name: 'Green Spaces Inc',
      priority: 'medium',
      color: '#f59e0b',
      created_at: '2024-01-02T00:00:00Z',
      locations: [
        {
          id: 'loc-2',
          project_id: '2',
          location: {
            type: 'Polygon',
            coordinates: [[
              [-118.1465, 34.1488],
              [-118.1455, 34.1488],
              [-118.1455, 34.1478],
              [-118.1465, 34.1478],
              [-118.1465, 34.1488]
            ]]
          },
          created_at: '2024-01-02T00:00:00Z'
        }
      ]
    },
    {
      id: '3',
      name: 'Traffic Signal Installation',
      description: 'New traffic signals at Main St intersection',
      status: 'planned',
      start_date: '2024-02-15',
      end_date: '2024-07-30',
      budget: 95000,
      department: 'Transportation',
      contractor_name: 'Signal Tech Co',
      priority: 'high',
      color: '#10b981',
      created_at: '2024-01-03T00:00:00Z',
      locations: [
        {
          id: 'loc-3',
          project_id: '3',
          location: {
            type: 'Point',
            coordinates: [-118.1450, 34.1480]
          },
          created_at: '2024-01-03T00:00:00Z'
        }
      ]
    }
  ];

  static async getAllProjects(): Promise<ProjectWithLocations[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...this.projects];
  }

  static async createProject(
    projectData: Omit<MunicipalProject, 'id' | 'created_at'>,
    location?: Coordinate,
    coordinates?: Coordinate[]
  ): Promise<ProjectWithLocations> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newProject: ProjectWithLocations = {
      ...projectData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      locations: []
    };
    
    if (location) {
      newProject.locations.push({
        id: `loc-${Date.now()}`,
        project_id: newProject.id,
        location: {
          type: 'Point',
          coordinates: [location.lng, location.lat]
        },
        created_at: new Date().toISOString()
      });
    }
    
    if (coordinates && coordinates.length > 0) {
      newProject.locations.push({
        id: `loc-${Date.now()}`,
        project_id: newProject.id,
        location: {
          type: 'Polygon',
          coordinates: [coordinates.map(c => [c.lng, c.lat])]
        },
        created_at: new Date().toISOString()
      });
    }
    
    this.projects.push(newProject);
    return newProject;
  }

  static async updateProject(id: string, updates: Partial<MunicipalProject>): Promise<ProjectWithLocations | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = this.projects.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    this.projects[index] = {
      ...this.projects[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    return this.projects[index];
  }

  static async deleteProject(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const index = this.projects.findIndex(p => p.id === id);
    if (index === -1) return false;
    
    this.projects.splice(index, 1);
    return true;
  }

  static findConflictingProjects(): string[] {
    const conflicts: string[] = [];
    
    for (let i = 0; i < this.projects.length; i++) {
      for (let j = i + 1; j < this.projects.length; j++) {
        const project1 = this.projects[i];
        const project2 = this.projects[j];
        
        if (!project1.start_date || !project1.end_date || 
            !project2.start_date || !project2.end_date) continue;
        
        const dateOverlap = dateRangesOverlap(
          project1.start_date, project1.end_date,
          project2.start_date, project2.end_date
        );
        
        if (dateOverlap) {
          const locationOverlap = project1.locations.some(loc1 =>
            project2.locations.some(loc2 =>
              checkLocationOverlap(loc1.location, loc2.location)
            )
          );
          
          if (locationOverlap) {
            if (!conflicts.includes(project1.id)) conflicts.push(project1.id);
            if (!conflicts.includes(project2.id)) conflicts.push(project2.id);
          }
        }
      }
    }
    
    return conflicts;
  }
}

// Project Map View Component
interface ProjectMapViewProps {
  projects: ProjectWithLocations[];
  onProjectClick: (project: ProjectWithLocations) => void;
  selectedProject?: ProjectWithLocations | null;
  conflictingProjects?: string[];
}

const ProjectMapView: React.FC<ProjectMapViewProps> = ({ 
  projects, 
  onProjectClick, 
  selectedProject,
  conflictingProjects = []
}) => {
  const containerStyle = {
    width: '100%',
    height: '600px'
  };

  const DEFAULT_CENTER = { lat: 34.1478, lng: -118.1445 };
  const [infoWindow, setInfoWindow] = useState<{
    project: ProjectWithLocations;
    position: Coordinate;
  } | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyBZwtfECQcocEuWwXKrzrn-VkwRe_zOPgc',
    libraries: ['places', 'drawing']
  });

  const handleMarkerClick = (project: ProjectWithLocations, locationId: string) => {
    onProjectClick(project);
    
    // Find the clicked location to show info window
    const location = project.locations.find(loc => loc.id === locationId);
    if (location) {
      const position = parseGeometry(location.location);
      if (position) {
        setInfoWindow({ project, position });
      }
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={DEFAULT_CENTER}
      zoom={13}
      options={{
        mapTypeId: 'roadmap',
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        mapTypeControl: true
      }}
      onClick={() => setInfoWindow(null)}
    >
      {projects.map((project) => (
        <ProjectMapMarker
          key={project.id}
          project={project}
          onClick={handleMarkerClick}
          selectedProject={selectedProject || null}
          conflictingProjects={conflictingProjects}
        />
      ))}
      
      {infoWindow && (
        <InfoWindow
          position={infoWindow.position}
          onCloseClick={() => setInfoWindow(null)}
        >
          <div className="max-w-xs">
            <h3 className="font-medium text-gray-900 mb-1">{infoWindow.project.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{infoWindow.project.description}</p>
            <div className="text-xs text-gray-500">
              <div>Status: <span className="capitalize">{infoWindow.project.status.replace('_', ' ')}</span></div>
              <div>Priority: <span className="capitalize">{infoWindow.project.priority}</span></div>
              {infoWindow.project.department && <div>Department: {infoWindow.project.department}</div>}
              {infoWindow.project.budget && (
                <div>Budget: {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0
                }).format(infoWindow.project.budget)}</div>
              )}
            </div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

// Project List Component
interface ProjectListProps {
  projects: ProjectWithLocations[];
  onProjectSelect: (project: ProjectWithLocations) => void;
  selectedProject?: ProjectWithLocations | null;
  conflictingProjects?: string[];
}

const ProjectList: React.FC<ProjectListProps> = ({ 
  projects, 
  onProjectSelect, 
  selectedProject,
  conflictingProjects = []
}) => {
  const getStatusBadgeColor = (status: string) => {
    const colors = {
      'planned': 'bg-yellow-100 text-yellow-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'on_hold': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadgeColor = (priority: string) => {
    const colors = {
      'low': 'bg-gray-100 text-gray-800',
      'medium': 'bg-blue-100 text-blue-800',
      'high': 'bg-orange-100 text-orange-800',
      'critical': 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Municipal Projects ({projects.length})
        </h3>
      </div>
      
      <div className="divide-y divide-gray-200">
        {projects.map((project) => {
          const hasConflict = conflictingProjects.includes(project.id);
          return (
            <div
              key={project.id}
              className={`p-6 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedProject?.id === project.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              } ${hasConflict ? 'bg-red-50 border-l-4 border-l-red-500' : ''}`}
              onClick={() => onProjectSelect(project)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {project.name}
                    </h4>
                    {hasConflict && (
                      <AlertCircle size={16} className="text-red-500" title="Schedule/Location Conflict" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {project.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{project.department}</span>
                    <span>{project.contractor_name}</span>
                    {project.budget && <span>{formatCurrency(project.budget)}</span>}
                  </div>
                  {project.start_date && project.end_date && (
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <div className="ml-4 flex flex-col items-end gap-2">
                  <div className="flex gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(project.status)}`}>
                      {project.status.replace('_', ' ')}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeColor(project.priority)}`}>
                      {project.priority}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Main Municipal Project System Component
interface MunicipalProjectSystemProps {
  className?: string;
}

export const MunicipalProjectSystem: React.FC<MunicipalProjectSystemProps> = ({ className }) => {
  const [projects, setProjects] = useState<ProjectWithLocations[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectWithLocations | null>(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'map' | 'list'>('map');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [conflictingProjects, setConflictingProjects] = useState<string[]>([]);

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, []);

  // Check for conflicts whenever projects change
  useEffect(() => {
    const conflicts = MunicipalProjectService.findConflictingProjects();
    setConflictingProjects(conflicts);
  }, [projects]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const fetchedProjects = await MunicipalProjectService.getAllProjects();
      setProjects(fetchedProjects);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSelect = (project: ProjectWithLocations) => {
    setSelectedProject(project);
  };

  const handleCreateProject = async (
    projectData: Omit<MunicipalProject, 'id' | 'created_at'>,
    location?: Coordinate,
    coordinates?: Coordinate[]
  ) => {
    try {
      const newProject = await MunicipalProjectService.createProject(projectData, location, coordinates);
      setProjects(prev => [newProject, ...prev]);
      setSelectedProject(newProject);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await MunicipalProjectService.deleteProject(projectId);
        setProjects(prev => prev.filter(p => p.id !== projectId));
        if (selectedProject?.id === projectId) {
          setSelectedProject(null);
        }
      } catch (error) {
        console.error('Failed to delete project:', error);
      }
    }
  };

  const handleUpdateProject = async (projectId: string, updates: Partial<MunicipalProject>) => {
    try {
      const updatedProject = await MunicipalProjectService.updateProject(projectId, updates);
      if (updatedProject) {
        setProjects(prev => prev.map(p => p.id === projectId ? updatedProject : p));
        if (selectedProject?.id === projectId) {
          setSelectedProject(updatedProject);
        }
      }
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  const conflictCount = conflictingProjects.length;
  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const activeProjects = projects.filter(p => p.status === 'in_progress' || p.status === 'planned').length;

  return (
    <div className={`h-full flex flex-col ${className || ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Municipal Project Management
          </h2>
          
          {/* Quick Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              <span>{activeProjects} Active</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign size={16} />
              <span>{new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                notation: 'compact'
              }).format(totalBudget)}</span>
            </div>
            {conflictCount > 0 && (
              <div className="flex items-center gap-1 text-red-600">
                <AlertCircle size={16} />
                <span>{conflictCount} Conflicts</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('map')}
            className={`px-3 py-2 text-sm rounded ${
              view === 'map' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <MapPin size={16} className="inline mr-1" />
            Map View
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-3 py-2 text-sm rounded ${
              view === 'list' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users size={16} className="inline mr-1" />
            List View
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Plus size={16} />
            New Project
          </button>
          <button
            onClick={loadProjects}
            disabled={loading}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Conflict Warning Bar */}
      {conflictCount > 0 && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2">
          <div className="flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle size={16} />
            <span>
              {conflictCount} project{conflictCount > 1 ? 's have' : ' has'} scheduling or location conflicts. 
              Review project timelines and locations to resolve overlaps.
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex">
        {view === 'map' ? (
          <div className="flex-1">
            <ProjectMapView
              projects={projects}
              onProjectClick={handleProjectSelect}
              selectedProject={selectedProject}
              conflictingProjects={conflictingProjects}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-auto p-4">
            <ProjectList
              projects={projects}
              onProjectSelect={handleProjectSelect}
              selectedProject={selectedProject}
              conflictingProjects={conflictingProjects}
            />
          </div>
        )}

        {/* Project Details Sidebar */}
        {selectedProject && (
          <div className="w-80 border-l border-gray-200 bg-white overflow-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedProject.name}
                </h3>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      console.log('Edit project:', selectedProject.id);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="Edit Project"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteProject(selectedProject.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="Delete Project"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              {conflictingProjects.includes(selectedProject.id) && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  <AlertCircle size={14} className="inline mr-1" />
                  This project has scheduling or location conflicts
                </div>
              )}
            </div>
            
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4">
                {selectedProject.description}
              </p>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Status:</span> 
                  <span className="capitalize">{selectedProject.status.replace('_', ' ')}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Priority:</span> 
                  <span className={`capitalize px-2 py-1 rounded text-xs ${
                    selectedProject.priority === 'critical' ? 'bg-red-100 text-red-800' :
                    selectedProject.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    selectedProject.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedProject.priority}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Department:</span> 
                  <span>{selectedProject.department || 'N/A'}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Contractor:</span> 
                  <span>{selectedProject.contractor_name || 'N/A'}</span>
                </div>
                
                {selectedProject.budget && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Budget:</span> 
                    <span className="font-medium text-green-600">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 0
                      }).format(selectedProject.budget)}
                    </span>
                  </div>
                )}
                
                {selectedProject.start_date && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Start Date:</span> 
                    <span>{new Date(selectedProject.start_date).toLocaleDateString()}</span>
                  </div>
                )}
                
                {selectedProject.end_date && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">End Date:</span> 
                    <span>{new Date(selectedProject.end_date).toLocaleDateString()}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Locations:</span> 
                  <span>{selectedProject.locations.length}</span>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => handleUpdateProject(selectedProject.id, { 
                      status: selectedProject.status === 'planned' ? 'in_progress' : 
                              selectedProject.status === 'in_progress' ? 'completed' : selectedProject.status 
                    })}
                    className="w-full px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                    disabled={selectedProject.status === 'completed'}
                  >
                    {selectedProject.status === 'planned' ? 'Start Project' : 
                     selectedProject.status === 'in_progress' ? 'Mark Complete' : 'Project Complete'}
                  </button>
                  
                  {selectedProject.status !== 'on_hold' && selectedProject.status !== 'completed' && (
                    <button
                      onClick={() => handleUpdateProject(selectedProject.id, { 
                        status: selectedProject.status === 'on_hold' ? 'planned' : 'on_hold' 
                      })}
                      className="w-full px-3 py-2 text-sm bg-orange-50 text-orange-700 rounded hover:bg-orange-100"
                    >
                      {selectedProject.status === 'on_hold' ? 'Resume Project' : 'Put On Hold'}
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setSelectedProject(null)}
                className="w-full px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Close Details
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Project Creation Modal */}
      <ProjectCreationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateProject}
        existingProjects={projects}
      />
    </div>
  );
};

export default MunicipalProjectSystem;