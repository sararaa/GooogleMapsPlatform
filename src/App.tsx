import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginScreen } from './components/LoginScreen';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { Dashboard } from './components/sections/Dashboard';
import { Projects } from './components/sections/Projects';
import { APIPortal } from './components/sections/APIPortal';
import { Users } from './components/sections/Users';
import { WorldView } from './components/sections/WorldView';

const MainApp: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'projects':
        return <Projects />;
      case 'api':
        return <APIPortal />;
      case 'users':
        return <Users />;
      case 'worldview':
        return <WorldView />;
      case 'budget':
        return (
          <div className="p-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Budget Management</h1>
            <p className="text-gray-600">Budget tracking features will be implemented here</p>
          </div>
        );
      case 'documents':
        return (
          <div className="p-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Document Management</h1>
            <p className="text-gray-600">Document management features will be implemented here</p>
          </div>
        );
      case 'activity':
        return (
          <div className="p-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Activity Feed</h1>
            <p className="text-gray-600">Activity tracking features will be implemented here</p>
          </div>
        );
      case 'notifications':
        return (
          <div className="p-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Notifications</h1>
            <p className="text-gray-600">Notification center will be implemented here</p>
          </div>
        );
      case 'settings':
        return (
          <div className="p-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings</h1>
            <p className="text-gray-600">System settings will be implemented here</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;