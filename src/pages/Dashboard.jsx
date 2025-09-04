// src/pages/Dashboard.jsx
import Player from '../components/Player';
import MusicBrowser from '../components/MusicBrowser';
import { useState } from 'react';

export default function Dashboard() {
  const [deviceId, setDeviceId] = useState(null);

  return (
    <div className="flex min-h-screen">
      <aside className="w-1/4 border-r p-4">
        <Player onDeviceReady={setDeviceId} />
      </aside>
      <main className="flex-1 p-4">
        <MusicBrowser deviceId={deviceId} />
      </main>
    </div>
  );
}
