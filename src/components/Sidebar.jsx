import React from "react";
import { Home, Search, Library, PlusCircle, Heart } from "lucide-react";

export default function Sidebar({ playlists = [] }) {
  return (
    <aside className="sidebar hidden md:block w-60 bg-black text-white p-4 select-none">
      {/* Logo */}
      <div className="mb-6 text-2xl font-bold flex items-center gap-2">
        <div className="w-8 h-8 rounded-sm bg-gradient-to-br from-green-500 to-green-300 flex items-center justify-center text-black font-black cursor-default">
          S
        </div>
        <div>YourSpot</div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-3">
        <button
          aria-label="Home"
          className="flex items-center gap-3 text-sm text-white/90 hover:text-white p-2 rounded-md cursor-pointer transition"
        >
          <Home size={18} /> Home
        </button>
        <button
          aria-label="Search"
          className="flex items-center gap-3 text-sm text-white/90 hover:text-white p-2 rounded-md cursor-pointer transition"
        >
          <Search size={18} /> Search
        </button>
        <button
          aria-label="Your Library"
          className="flex items-center gap-3 text-sm text-white/90 hover:text-white p-2 rounded-md cursor-pointer transition"
        >
          <Library size={18} /> Your Library
        </button>
      </nav>

      {/* Create and Liked buttons */}
      <div className="flex gap-2 mt-5">
        <button
          aria-label="Create Playlist"
          className="flex items-center gap-2 px-3 py-1 rounded-md bg-white/6 cursor-pointer hover:bg-white/10 transition"
        >
          <PlusCircle size={14} /> Create
        </button>
        <button
          aria-label="Liked Songs"
          className="flex items-center gap-2 px-3 py-1 rounded-md bg-white/6 cursor-pointer hover:bg-white/10 transition"
        >
          <Heart size={14} /> Liked
        </button>
      </div>

      {/* Playlists */}
      <div className="mt-6 overflow-y-auto max-h-[55vh] pr-2 text-sm text-white/80">
        {playlists.length ? (
          playlists.map((p, i) => (
            <div
              key={i}
              className="py-1 hover:text-white cursor-pointer transition"
              title={p.name}
              aria-label={`Playlist: ${p.name}`}
            >
              {p.name}
            </div>
          ))
        ) : (
          <>
            <div className="py-1 text-white/60">Liked Songs</div>
            <div className="py-1 text-white/60">Discover Weekly</div>
            <div className="py-1 text-white/60">Daily Mix 1</div>
          </>
        )}
      </div>
    </aside>
  );
}
