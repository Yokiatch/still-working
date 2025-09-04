// src/pages/Dashboard.jsx
import Player from '../components/Player';
import MusicBrowser from '../components/MusicBrowser';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const [deviceId, setDeviceId] = useState(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                Spotify Clone
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-sm text-gray-600">
                Welcome back!
              </div>
              <button 
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded-md hover:bg-gray-100 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Music Browser - Takes up 3/4 of the space */}
          <div className="lg:col-span-3">
            <MusicBrowser deviceId={deviceId} />
          </div>

          {/* Player - Takes up 1/4 of the space */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Player onDeviceReady={setDeviceId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
