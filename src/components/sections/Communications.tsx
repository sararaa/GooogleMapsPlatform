import React, { useState, useEffect } from 'react';
import { Users, MessageSquare, HardHat, Send, Plus, Search, Calendar, MapPin, Clock } from 'lucide-react';
import { mockUsers } from '../../data/mockData';

type CommunicationType = 'reach-out' | 'city-forum' | 'contractors';

interface CommunicationsProps {
  initialType?: CommunicationType;
}

export const Communications: React.FC<CommunicationsProps> = ({ initialType }) => {
  const [activeType, setActiveType] = useState<CommunicationType | null>(initialType || null);

  // Update activeType when initialType prop changes
  useEffect(() => {
    setActiveType(initialType || null);
  }, [initialType]);

  const communicationTypes = [
    { id: 'reach-out', label: 'Reach Out', icon: Users, description: 'Contact other city officials', color: 'blue' },
    { id: 'city-forum', label: 'City Forum', icon: MessageSquare, description: 'Share city updates and announcements', color: 'green' },
    { id: 'contractors', label: 'Contractors', icon: HardHat, description: 'Communicate with contractors and vendors', color: 'orange' }
  ];

  const renderReachOut = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Contact City Officials</h3>
        <p className="text-sm text-blue-800">
          Send messages, schedule meetings, or collaborate with other departments and officials.
        </p>
      </div>

      {/* Quick Message */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="font-medium text-gray-900 mb-4">Send Quick Message</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To:</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">Select recipient...</option>
              {mockUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} - {user.department}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject:</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Message subject..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message:</label>
            <textarea
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Type your message here..."
            />
          </div>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Send size={16} />
            Send Message
          </button>
        </div>
      </div>

      {/* Active Officials */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="font-medium text-gray-900 mb-4">Active Officials</h4>
        <div className="space-y-3">
          {mockUsers.map(user => (
            <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.department}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-sm text-gray-500">Online</span>
                <button className="ml-3 text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Message
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCityForum = () => (
    <div className="space-y-6">
      <div className="bg-green-50 rounded-lg p-4">
        <h3 className="font-medium text-green-900 mb-2">City Forum</h3>
        <p className="text-sm text-green-800">
          Share updates, announcements, and important information with all city staff and officials.
        </p>
      </div>

      {/* Create Post */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="font-medium text-gray-900 mb-4">Create New Post</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Post Type:</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="announcement">Announcement</option>
              <option value="update">City Update</option>
              <option value="alert">Important Alert</option>
              <option value="news">News</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title:</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Post title..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content:</label>
            <textarea
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Write your post content here..."
            />
          </div>
          <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
            <Plus size={16} />
            Create Post
          </button>
        </div>
      </div>

      {/* Recent Posts */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="font-medium text-gray-900 mb-4">Recent Forum Posts</h4>
        <div className="space-y-4">
          {[
            {
              id: 1,
              title: 'Road Closure Updates - Main Street Bridge',
              author: 'Sarah Chen',
              department: 'Transportation',
              time: '2 hours ago',
              type: 'announcement',
              content: 'The Main Street Bridge will be temporarily closed for maintenance work starting Monday...'
            },
            {
              id: 2,
              title: 'Budget Approval for Q2 Projects',
              author: 'Marcus Rodriguez',
              department: 'Public Works',
              time: '1 day ago',
              type: 'update',
              content: 'The city council has approved the budget allocation for second quarter infrastructure projects...'
            },
            {
              id: 3,
              title: 'Emergency Response Protocol Update',
              author: 'Emily Watson',
              department: 'Engineering',
              time: '3 days ago',
              type: 'alert',
              content: 'New emergency response protocols have been established for severe weather events...'
            }
          ].map(post => (
            <div key={post.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h5 className="font-medium text-gray-900">{post.title}</h5>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <span>{post.author}</span>
                    <span>•</span>
                    <span>{post.department}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {post.time}
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  post.type === 'announcement' ? 'bg-blue-100 text-blue-700' :
                  post.type === 'update' ? 'bg-green-100 text-green-700' :
                  post.type === 'alert' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {post.type}
                </span>
              </div>
              <p className="text-gray-700 text-sm">{post.content}</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                <button className="hover:text-blue-600">Reply</button>
                <button className="hover:text-blue-600">Share</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContractors = () => (
    <div className="space-y-6">
      <div className="bg-orange-50 rounded-lg p-4">
        <h3 className="font-medium text-orange-900 mb-2">Contractor Communications</h3>
        <p className="text-sm text-orange-800">
          Manage communications with contractors, vendors, and external partners on city projects.
        </p>
      </div>

      {/* Search Contractors */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="font-medium text-gray-900 mb-4">Find Contractors</h4>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search contractors by name, company, or specialization..."
          />
        </div>
      </div>

      {/* Active Contracts */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">Active Contractors</h4>
          <button className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
            <Plus size={16} />
            Add Contractor
          </button>
        </div>
        <div className="space-y-4">
          {[
            {
              id: 1,
              name: 'ABC Construction Co.',
              contact: 'John Smith',
              phone: '(555) 123-4567',
              email: 'john@abcconstruction.com',
              project: 'Downtown Bridge Renovation',
              status: 'Active',
              lastContact: '2 days ago'
            },
            {
              id: 2,
              name: 'Metro Electrical Services',
              contact: 'Lisa Johnson',
              phone: '(555) 987-6543',
              email: 'lisa@metroelectrical.com',
              project: 'Smart Traffic Light Installation',
              status: 'Pending',
              lastContact: '1 week ago'
            },
            {
              id: 3,
              name: 'City Plumbing Solutions',
              contact: 'Mike Davis',
              phone: '(555) 456-7890',
              email: 'mike@cityplumbing.com',
              project: 'Water Main Replacement',
              status: 'Active',
              lastContact: '3 hours ago'
            }
          ].map(contractor => (
            <div key={contractor.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h5 className="font-medium text-gray-900">{contractor.name}</h5>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      contractor.status === 'Active' ? 'bg-green-100 text-green-700' :
                      contractor.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {contractor.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>Contact: {contractor.contact}</div>
                    <div>Phone: {contractor.phone}</div>
                    <div>Email: {contractor.email}</div>
                    <div>Project: {contractor.project}</div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-2">
                    <Clock size={12} />
                    Last contact: {contractor.lastContact}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Message
                  </button>
                  <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                    Call
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeType) {
      case 'reach-out':
        return renderReachOut();
      case 'city-forum':
        return renderCityForum();
      case 'contractors':
        return renderContractors();
      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-600">Please select a communication type from the sidebar.</p>
          </div>
        );
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {activeType ? communicationTypes.find(t => t.id === activeType)?.label : 'Communications'}
          </h1>
          <p className="text-gray-600">
            {activeType 
              ? communicationTypes.find(t => t.id === activeType)?.description
              : 'Connect with officials, share updates, and manage contractor relationships'
            }
          </p>
        </div>
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
}; 