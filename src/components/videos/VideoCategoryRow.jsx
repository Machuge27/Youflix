// import React from "react";
// import VideoCard from "./VideoCard";

// const VideoCategoryRow = ({ title, videos }) => {
  
//   return (
//     <div className="mb-6">
//       <h2 className="text-white text-xl font-bold mb-2">{title}</h2>
//       <div className="flex w-full overflow-x-auto scrollbar-hide space-x-4 p-2 border-t-1 border-red-200">
//         {videos.map((video) => (
//           <div key={video.id} className="flex-shrink-0">
//             <VideoCard video={video} />
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default VideoCategoryRow;

import React, { useState } from "react";
import VideoCard from "./VideoCard";
import VideoPlayer from "./VideoPlayer";
import { toast } from 'react-toastify';

const VideoCategoryRow = ({ title, videos }) => {
  const [currentVideo, setCurrentVideo] = useState(null);

  const handlePlay = (video) => {
    // Instead of navigating, show the video player
    setCurrentVideo(video);
    // Still maintain the URL for sharing/bookmarking purposes
    window.history.pushState({}, "", `/watch/${video.id}`);
  };
 
  const handleClosePlayer = () => {
    setCurrentVideo(null);
    // Reset the URL
    window.history.pushState({}, "", "/");
  };

  const handleAddToList = (video) => {
    toast.success(`Added "${video.title}" to your list!, actually, that's coming soon!😂😂`);
  };
 
  if (!videos || videos.length === 0) {
    return null; // Don't render if there are no videos
  }

  return (
    <div className="mb-8">
      <h2 className="text-white text-xl font-bold mb-2">
        {title}
      </h2>
      <div className="flex w-full overflow-x-auto scrollbar-hide space-x-4 p-2 border-t-1 border-red-200">
        {videos.map((video) => (
          <div  className="flex-shrink-0">
            <VideoCard
              key={video.id}
              video={video}
              onPlay={() => handlePlay(video)}
              onAddToList={() => handleAddToList(video)}
            />
          </div>
        ))}
      </div>

      {/* Render the video player if a video is selected */}
      {currentVideo && (
        <VideoPlayer 
          videoId={currentVideo.id} 
          videoTitle={currentVideo.title} 
          url={currentVideo.url} 
          onClose={handleClosePlayer} 
        />
      )}
    </div>
  );
};

export default VideoCategoryRow;