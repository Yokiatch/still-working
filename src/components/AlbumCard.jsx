import React from "react";
import { Play } from "lucide-react";

export default function AlbumCard({ name, artist, img, uri, onClick }) {
  const handleClick = () => {
    if (onClick) {
      onClick(uri);
    } else {
      console.log('Playing:', name, 'by', artist);
    }
  };

  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/300x300/1a1a1a/6a6a6a?text=No+Image';
  };

  return (
    <div className="album-card" onClick={handleClick}>
      <img 
        src={img || 'https://via.placeholder.com/300x300/1a1a1a/6a6a6a?text=No+Image'} 
        alt={`${name} by ${artist}`}
        className="album-image"
        onError={handleImageError}
        loading="lazy"
      />
      <h3 className="album-title" title={name}>
        {name || 'Unknown Title'}
      </h3>
      <p className="album-artist" title={artist}>
        {artist || 'Unknown Artist'}
      </p>
      <button 
        className="play-button"
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
        aria-label={`Play ${name} by ${artist}`}
      >
        <Play size={20} fill="currentColor" />
      </button>
    </div>
  );
}
