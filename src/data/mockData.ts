import { Project, User, Department, Task, Budget, Document, APIKey, Notification, Activity } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah.chen@city.gov',
    role: 'admin',
    department: 'Transportation',
    avatar: 'https://images.pexels.com/photos/3777563/pexels-photo-3777563.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    lastActive: '2025-01-27T10:30:00Z'
  },
  {
    id: '2',
    name: 'Marcus Rodriguez',
    email: 'marcus.rodriguez@city.gov',
    role: 'manager',
    department: 'Public Works',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    lastActive: '2025-01-27T09:45:00Z'
  },
  {
    id: '3',
    name: 'Emily Watson',
    email: 'emily.watson@city.gov',
    role: 'field_ops',
    department: 'Engineering',
    avatar: 'https://images.pexels.com/photos/1036622/pexels-photo-1036622.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    lastActive: '2025-01-27T11:15:00Z'
  }
];

export const mockDepartments: Department[] = [
  { id: '1', name: 'Transportation', color: '#005aff', memberCount: 12 },
  { id: '2', name: 'Public Works', color: '#007aff', memberCount: 8 },
  { id: '3', name: 'Engineering', color: '#00c851', memberCount: 15 },
  { id: '4', name: 'Planning', color: '#ff6900', memberCount: 6 }
];

export const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Downtown Bridge Renovation',
    description: 'Complete structural renovation of the Main Street bridge including new deck, railings, and lighting systems.',
    status: 'in_progress',
    priority: 'high',
    startDate: '2025-01-15T00:00:00Z',
    endDate: '2025-06-30T00:00:00Z',
    budget: 2500000,
    spent: 750000,
    department: 'Transportation',
    assignedUsers: ['1', '2'],
    tags: ['infrastructure', 'bridge', 'downtown'],
    progress: 30,
    location: 'Main Street Bridge',
    type: 'cip',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-27T10:00:00Z'
  },
  {
    id: '2',
    title: 'Smart Traffic Light Installation',
    description: 'Installation of AI-powered traffic lights at 15 major intersections to optimize traffic flow.',
    status: 'planning',
    priority: 'medium',
    startDate: '2025-03-01T00:00:00Z',
    endDate: '2025-08-15T00:00:00Z',
    budget: 1200000,
    spent: 0,
    department: 'Transportation',
    assignedUsers: ['1', '3'],
    tags: ['smart-city', 'traffic', 'ai'],
    progress: 5,
    location: 'Ohio State',
    type: 'cip',
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-26T14:30:00Z',
    area: {
      coordinates: [
        { lat: 42.0, lng: -85.0 },    // Top-left (northwest Ohio)
        { lat: 42.0, lng: -80.5 },    // Top-right (northeast Ohio)
        { lat: 38.0, lng: -80.5 },    // Bottom-right (southeast Ohio)
        { lat: 38.0, lng: -85.0 }     // Bottom-left (southwest Ohio)
      ],
      center: { lat: 40.0, lng: -82.75 }
    }
  },
  {
    id: '3',
    title: 'Water Main Replacement - Oak Ave',
    description: 'Replace aging water main infrastructure along Oak Avenue from 1st to 10th Street.',
    status: 'in_progress',
    priority: 'urgent',
    startDate: '2025-01-20T00:00:00Z',
    endDate: '2025-04-30T00:00:00Z',
    budget: 850000,
    spent: 320000,
    department: 'Public Works',
    assignedUsers: ['2'],
    tags: ['water', 'infrastructure', 'maintenance'],
    progress: 45,
    location: 'Oak Avenue',
    type: 'maintenance',
    createdAt: '2024-12-15T00:00:00Z',
    updatedAt: '2025-01-27T08:15:00Z'
  }
];

export const mockAPIKeys: APIKey[] = [
  {
    id: '1',
    name: 'Waymo Integration',
    key: 'pk_live_51HqJyF2eZvKYlo2C...',
    permissions: ['road_closures', 'project_status'],
    createdAt: '2025-01-15T00:00:00Z',
    lastUsed: '2025-01-27T09:30:00Z',
    isActive: true,
    organization: 'Waymo LLC'
  },
  {
    id: '2',
    name: 'Google Maps API',
    key: 'pk_test_TYooMQauvdEDq54NiTph...',
    permissions: ['road_closures'],
    createdAt: '2025-01-10T00:00:00Z',
    lastUsed: '2025-01-26T15:45:00Z',
    isActive: true,
    organization: 'Google LLC'
  }
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Budget Update Required',
    message: 'Downtown Bridge Renovation budget needs review - 30% spent',
    type: 'warning',
    userId: '1',
    read: false,
    createdAt: '2025-01-27T10:00:00Z'
  },
  {
    id: '2',
    title: 'New API Key Request',
    message: 'Tesla Autopilot has requested access to road closure data',
    type: 'info',
    userId: '1',
    read: false,
    createdAt: '2025-01-27T09:30:00Z'
  }
];