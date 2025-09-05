// src/components/Player.jsx
import React, { useEffect, useState } from 'react';
import useSpotifyPlayer from '../hooks/useSpotifyPlayer';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';

function format(ms = 0) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec < 10 ? '0' : ''}${sec}`;
}

export default function Player() {
  const {
    deviceId,
    isReady,
    state,
    play,
    pause,
    next,
    previous,
    setVolume,
    transferPlayback,
  } = useSpotifyPlayer();

  const [localVolume, setLocalVolume] = useState(0.5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const currentTrack = state?.track_window?.current_track;

  useEffect(() => {
    setIsPlaying(state ? !state.paused : false);
    setPosition(state?.position || 0);
    setDuration(state?.duration || 0);
  }, [state]);

  useEffect(() => {
    // Make sure the web player device is active; if device exists, transfer playback to it (non-destructive)
    if (deviceId && isReady) {
      transferPlayback(deviceId, false).catch(() => {});
    }
  }, [deviceId, isReady, transferPlayback]);

  const togglePlay = async () => {
    try {
      if (isPlaying) {
        await pause();
      } else {
        await play(); // resume current context
      }
    } catch (e) {
      console.error(e);
    }
  };

  const onVolume = async (e) => {
    const v = Number(e.target.value);
    setLocalVolume(v);
    try {
      await setVolume(v);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full h-24 bg-[#181818] border-t border-gray-800 flex items-center justify-between px-4 text-white">
      <div className="flex items-center gap-4 w-1/4">
        <div className="w-14 h-14 bg-gray-900 rounded overflow-hidden">
          {currentTrack?.album?.images?.[0] ? (
            <img src={currentTrack.album.images[0].url} alt="" className="w-full h-full object-cover" />
          ) : null}
        </div>
        <div className="truncate">
          <div className="font-medium truncate">{currentTrack?.name || 'Not Playing'}</div>
          <div className="text-xs text-white/60 truncate">
            {currentTrack?.artists?.map(a => a.name).join(', ') || ''}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 w-2/4">
        <div className="flex items-center gap-6">
          <button onClick={previous}><SkipBack size={20} /></button>
          <button onClick={togglePlay} className="w-10 h-10 flex items-center justify-center bg-white text-black rounded-full">
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button onClick={next}><SkipForward size={20} /></button>
        </div>

        <div className="flex items-center gap-2 w-full mt-1">
          <div className="text-xs text-white/60">{format(position)}</div>
          <div className="relative flex-1 h-1 bg-gray-700 rounded">
            <div
              className="absolute top-0 left-0 h-1 bg-[#1DB954] rounded"
              style={{ width: duration ? `${(position / duration) * 100}%` : '0%' }}
            />
          </div>
          <div className="text-xs text-white/60">{format(duration)}</div>
        </div>
      </div>

      <div className="flex items-center gap-3 w-1/4 justify-end">
        <Volume2 size={18} />
        <input type="range" min={0} max={1} step={0.01} value={localVolume} onChange={onVolume} className="w-28" />
      </div>
    </div>
  );
}
