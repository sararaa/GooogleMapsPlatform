// Core type definitions for Platform Pigeon
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
  lastActive: string;
}

export type UserRole = 'admin' | 'manager' | 'field_ops' | 'external_partner';

export interface Department {
  id: string;
  name: string;
  color: string;
  memberCount: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  department: string;
  assignedUsers: string[];
  tags: string[];
  progress: number;
  location?: string;
  type: ProjectType;
  createdAt: string;
  updatedAt: string;
  // Area coordinates for map display
  area?: {
    coordinates: Array<{lat: number, lng: number}>;
    center?: {lat: number, lng: number};
  };
}

export type ProjectStatus = 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ProjectType = 'cip' | 'permit' | 'roadwork' | 'maintenance' | 'emergency';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  projectId: string;
  assignedTo: string[];
  dueDate: string;
  priority: ProjectPriority;
  dependencies: string[];
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed';

export interface Budget {
  id: string;
  projectId: string;
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
  lastUpdated: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  projectId: string;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
  version: number;
}

export interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  createdAt: string;
  lastUsed: string;
  isActive: boolean;
  organization: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  userId: string;
  read: boolean;
  createdAt: string;
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  userId: string;
  projectId?: string;
  createdAt: string;
  metadata?: Record<string, any>;
}