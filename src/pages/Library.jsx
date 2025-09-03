import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import TrackItem from '../components/TrackItem';

export default function Library() {
  const { user, token } = useAuth();
  const [saved, setSaved] = useState([]);

  useEffect(() => {
    if (user) {
      supabase
        .from('saved_tracks')
        .select('track_data')
        .eq('user_id', user.id)
        .then(({ data }) => setSaved(data.map(d => d.track_data)));
    }
  }, [user]);

  return (
    <div className="p-6">
      <h2 className="text-white text-2xl mb-4">Your Saved Tracks</h2>
      {saved.map(track => (
        <TrackItem key={track.id} track={track} />
      ))}
    </div>
  );
}
