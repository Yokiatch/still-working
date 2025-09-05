import React from "react";
import AlbumCard from "../components/AlbumCard";

export default function Home(){
  return (
    <section>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({length:8}).map((_,i)=>(
          <AlbumCard key={i} title={`Top ${i+1}`} subtitle="Various" img={`https://picsum.photos/300/300?random=${i+1}`} />
        ))}
      </div>
    </section>
  );
}
