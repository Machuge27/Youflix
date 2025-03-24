import React, { useState } from 'react';
import { PlayIcon, PlusIcon } from '@heroicons/react/solid';

const VideoCard = ({ video, onPlay, onAddToList }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative w-64 h-36 overflow-hidden rounded-lg group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Video Thumbnail */}
      <img 
        src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
        alt={video.title}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
      />

      {/* Hover Overlay */}
      {isHovered && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center space-x-4">
          <button 
            onClick={() => onPlay(video)}
            className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition"
          >
            <PlayIcon className="h-6 w-6" />
          </button>
          <button 
            onClick={() => onAddToList(video)}
            className="bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 transition"
          >
            <PlusIcon className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* Video Details */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2">
        <h3 className="text-sm font-semibold text-white truncate">
          {video.title}
        </h3>
        <p className="text-xs text-gray-400">{video.channelName}</p>
      </div>
    </div>
  );
};

export default VideoCard;