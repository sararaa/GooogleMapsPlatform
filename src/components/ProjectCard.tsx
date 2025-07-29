import React from 'react';
import { Calendar, DollarSign, Users, MapPin, Clock, Map } from 'lucide-react';
import { Project } from '../types';
import { mockUsers } from '../data/mockData';

interface ProjectCardProps {
  project: Project;
  onClick: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const getStatusColor = (status: Project['status']) => {
    const colors = {
      planning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
      on_hold: 'bg-orange-100 text-orange-800 border-orange-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status];
  };

  const getPriorityColor = (priority: Project['priority']) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority];
  };

  const assignedUserAvatars = project.assignedUsers
    .map(userId => mockUsers.find(u => u.id === userId))
    .filter(Boolean)
    .slice(0, 3);

  const budgetUsedPercentage = (project.spent / project.budget) * 100;

  return (
    <div
      onClick={() => onClick(project)}
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {project.title}
          </h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{project.description}</p>
        </div>
        <div className="flex gap-2 ml-4">
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(project.status)}`}>
            {project.status.replace('_', ' ')}
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(project.priority)}`}>
            {project.priority}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Progress</span>
          <span>{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${project.progress}%` }}
          ></div>
        </div>
      </div>

      {/* Project Details */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar size={16} />
          <span>{new Date(project.endDate).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <DollarSign size={16} />
          <span>${(project.budget / 1000000).toFixed(1)}M</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <div className="flex items-center gap-1">
            <MapPin size={16} />
            {project.area?.coordinates?.length ? (
              <span title="Project area defined on map">
                <Map size={14} className="text-green-600" />
              </span>
            ) : (
              <span title="No project area defined">
                <Map size={14} className="text-gray-300" />
              </span>
            )}
          </div>
          <span className="truncate">{project.location || 'No location specified'}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Clock size={16} />
          <span>{project.type.toUpperCase()}</span>
        </div>
      </div>

      {/* Budget Usage */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Budget Used</span>
          <span>{budgetUsedPercentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all ${
              budgetUsedPercentage > 80 ? 'bg-red-500' : budgetUsedPercentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${budgetUsedPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Assigned Users */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-gray-500" />
          <div className="flex -space-x-2">
            {assignedUserAvatars.map((user, index) => (
              <img
                key={user!.id}
                src={user!.avatar}
                alt={user!.name}
                className="w-6 h-6 rounded-full border-2 border-white"
                title={user!.name}
              />
            ))}
            {project.assignedUsers.length > 3 && (
              <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs text-gray-600">
                +{project.assignedUsers.length - 3}
              </div>
            )}
          </div>
        </div>
        <span className="text-xs text-gray-500">{project.department}</span>
      </div>

      {/* Tags */}
      {project.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {project.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};