import React from 'react';
import VideoCard from './VideoCard';

const VideoSection = ({ title, videos, onPlay, onAddToList }) => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
      <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
        {videos.map((video) => (
          <VideoCard 
            key={video.id} 
            video={video} 
            onPlay={onPlay}
            onAddToList={onAddToList}
          />
        ))}
      </div>
    </div>
  );
};

const VideoGrid = ({ sections }) => {
  const handlePlay = (video) => {
    // Implement video play logic
    console.log('Playing video:', video);
  };

  const handleAddToList = (video) => {
    // Implement add to list logic
    console.log('Adding to list:', video);
  };

  return (
    <div className="p-6">
      {sections?.length > 0 ? (
        sections.map((section, index) => (
          <VideoSection
            key={index}
            title={section.title}
            videos={section.videos}
            onPlay={handlePlay}
            onAddToList={handleAddToList}
          />
        ))
      ) : (
        <div className="text-center text-gray-500 mt-6">
          No videos available.
        </div>
      )}
      
    </div>
  );
};

export default VideoGrid;