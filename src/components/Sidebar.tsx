import React, { useState } from 'react';
import { 
  Home, 
  FolderKanban, 
  Users, 
  DollarSign, 
  FileText, 
  Settings, 
  Key,
  Bell,
  ChevronLeft,
  ChevronRight,
  Activity
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  badge?: number;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'projects', label: 'Projects', icon: FolderKanban, badge: 3 },
  { id: 'budget', label: 'Budget', icon: DollarSign },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'api', label: 'API Portal', icon: Key },
  { id: 'activity', label: 'Activity', icon: Activity },
  { id: 'notifications', label: 'Notifications', icon: Bell, badge: 2 },
  { id: 'settings', label: 'Settings', icon: Settings }
];

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900">Platform Pigeon</h1>
              <p className="text-xs text-gray-500">City Management</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-gray-100 rounded-md transition-colors"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon size={18} />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <span className="bg-blue-100 text-blue-700 text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <img
              src="https://images.pexels.com/photos/3777563/pexels-photo-3777563.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop"
              alt="User"
              className="w-8 h-8 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Sarah Chen</p>
              <p className="text-xs text-gray-500 truncate">Transportation Dept.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};