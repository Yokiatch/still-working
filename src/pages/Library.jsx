import React from "react";

export default function Library(){
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Your Library</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({length:6}).map((_,i)=>(
          <div key={i} className="p-4 bg-white/4 rounded-md">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gray-800 rounded-sm overflow-hidden">
                <img src={`https://picsum.photos/200/200?random=${i+20}`} className="w-full h-full object-cover"/>
              </div>
              <div>
                <div className="font-semibold">Playlist {i+1}</div>
                <div className="text-xs text-white/60">By you</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
