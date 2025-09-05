import React from "react";
import { Home, Search, Library, PlusCircle, Heart } from "lucide-react";

export default function Sidebar({playlists = []}) {
  return (
    <aside className="sidebar hidden md:block">
      <div className="mb-6 text-2xl font-bold flex items-center gap-2">
        <div className="w-8 h-8 rounded-sm bg-gradient-to-br from-green-500 to-green-300 flex items-center justify-center text-black font-black">S</div>
        <div>YourSpot</div>
      </div>

      <nav className="flex flex-col gap-3">
        <button className="flex items-center gap-3 text-sm text-white/90 hover:text-white p-2 rounded-md">
          <Home size={18}/> Home
        </button>
        <button className="flex items-center gap-3 text-sm text-white/90 hover:text-white p-2 rounded-md">
          <Search size={18}/> Search
        </button>
        <button className="flex items-center gap-3 text-sm text-white/90 hover:text-white p-2 rounded-md">
          <Library size={18}/> Your Library
        </button>
      </nav>

      <div className="flex gap-2 mt-5">
        <button className="flex items-center gap-2 px-3 py-1 rounded-md bg-white/6">
          <PlusCircle size={14}/> Create
        </button>
        <button className="flex items-center gap-2 px-3 py-1 rounded-md bg-white/6">
          <Heart size={14}/> Liked
        </button>
      </div>

      <div className="mt-6 overflow-y-auto max-h-[55vh] pr-2 text-sm text-white/80">
        {playlists.length ? playlists.map((p,i)=>(
          <div key={i} className="py-1 hover:text-white cursor-pointer">{p.name}</div>
        )) : (
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
