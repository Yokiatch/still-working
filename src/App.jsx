import React from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import AlbumCard from "./components/AlbumCard";
import Player from "./components/Player";
import Home from "./pages/Home";
import Library from "./pages/Library";

export default function App() {
  const playlists = Array.from({length:12}).map((_,i)=>({name:`Playlist ${i+1}`}));
  const sampleTrack = {
    title: "Blinding Lights",
    artist: "The Weeknd",
    img: "https://picsum.photos/300/300?random=4"
  };

  return (
    <div className="app-layout">
      <Sidebar playlists={playlists}/>
      <main className="main">
        <Topbar title="Good evening" subtitle="Recommended for you"/>
        <Home />
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Made for you</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({length:6}).map((_,i)=>(
              <AlbumCard key={i} title={`Mix ${i+1}`} subtitle="Various artists" img={`https://picsum.photos/300/300?random=${i+10}`} />
            ))}
          </div>
        </div>
      </main>
      <Player track={sampleTrack}/>
    </div>
  );
}
