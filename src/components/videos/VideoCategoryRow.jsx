import React, { useState } from "react";
import VideoCard from "./VideoCard";
import VideoPlayer from "./VideoPlayer";
import { toast } from 'react-toastify';

const VideoCategoryRow = ({ title, videos }) => {
  const [currentVideo, setCurrentVideo] = useState(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(-1);

  const handlePlay = (video) => {
    // Find the index of the selected video in the array
    const videoIndex = videos.findIndex(v => v.videoId === video.videoId);
    
    // Update states with current video and its index
    setCurrentVideo(video);
    setCurrentVideoIndex(videoIndex);
    
    // Update URL for sharing/bookmarking purposes
    window.history.pushState({}, "", `/watch/${video.videoId}`);
  };

  const handleClosePlayer = () => {
    setCurrentVideo(null);
    setCurrentVideoIndex(-1);
    // Reset the URL
    window.history.pushState({}, "", "/");
  };

  const handleAddToList = (video) => {
    toast.success(`Added "${video.title}" to your list!, actually, that's coming soon!😂😂`);
  };

  const handleVideoEnded = () => {
    // Go to next video if available
    handleNext();
  };

  const handleNext = () => {
    // If there are more videos in the list, play the next one
    if (currentVideoIndex < videos.length - 1) {
      const nextVideo = videos[currentVideoIndex + 1];
      setCurrentVideo(nextVideo);
      setCurrentVideoIndex(currentVideoIndex + 1);
      window.history.pushState({}, "", `/watch/${nextVideo.videoId}`);
    }
  };

  const handlePrevious = () => {
    // If there are previous videos in the list, play the previous one
    if (currentVideoIndex > 0) {
      const prevVideo = videos[currentVideoIndex - 1];
      setCurrentVideo(prevVideo);
      setCurrentVideoIndex(currentVideoIndex - 1);
      window.history.pushState({}, "", `/watch/${prevVideo.videoId}`);
    }
  };

  // Handle playing a related video (when selected from the related videos list)
  const handleRelatedVideoPlay = (relatedVideoId) => {
    // Find the video in our list if it exists
    const relatedVideo = videos.find(v => v.videoId === relatedVideoId);
    
    if (relatedVideo) {
      // If the video exists in our list, play it
      handlePlay(relatedVideo);
    } else {
      // Otherwise, we need to fetch the new video data
      // For now, just update the URL and let the app handle fetching
      window.history.pushState({}, "", `/watch/${relatedVideoId}`);
      
      // In a real implementation, you might want to fetch the video data
      // and update the current video state
      toast.info("Loading related video...");
    }
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
          <div key={video.videoId} className="flex-shrink-0">
            <VideoCard
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
          videoId={currentVideo.videoId}
          videoTitle={currentVideo.title}
          url={currentVideo.url}
          onClose={handleClosePlayer}
          onEnded={handleVideoEnded}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      )}
    </div>
  );
};

export default VideoCategoryRow;