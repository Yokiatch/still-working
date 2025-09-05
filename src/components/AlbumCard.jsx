import React from "react";

export default function AlbumCard({title, subtitle, img, onClick}) {
  return (
    <div onClick={onClick} className="p-3 rounded-md hover:scale-[1.03] transition-transform cursor-pointer bg-gradient-to-b from-transparent to-black/20">
      <div className="w-full aspect-square rounded-md overflow-hidden mb-3 bg-gray-800">
        <img src={img} alt={title} className="w-full h-full object-cover"/>
      </div>
      <div>
        <div className="text-sm font-semibold truncate">{title}</div>
        <div className="text-xs text-white/60 mt-1 truncate">{subtitle}</div>
      </div>
    </div>
  );
}
