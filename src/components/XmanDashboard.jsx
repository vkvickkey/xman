import React, { useState } from 'react';
import GitHubManager from './GitHubManager';
import JioSaavanManager from './JioSaavanManager';

const XmanDashboard = () => {
  const [activeTab, setActiveTab] = useState('jiosaavan');

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">XMAN Dashboard</h1>
        
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-md p-1">
            <button
              onClick={() => setActiveTab('jiosaavan')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === 'jiosaavan'
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Jio Saavan Music
            </button>
            <button
              onClick={() => setActiveTab('github')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === 'github'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              GitHub Manager
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-300">
          {activeTab === 'jiosaavan' && <JioSaavanManager />}
          {activeTab === 'github' && <GitHubManager />}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-600">
          <p className="text-sm">XMAN Dashboard - Integrated Music & GitHub Management</p>
          <p className="text-xs mt-2">Powered by Jio Saavan API & GitHub API</p>
        </div>
      </div>
    </div>
  );
};

export default XmanDashboard;
