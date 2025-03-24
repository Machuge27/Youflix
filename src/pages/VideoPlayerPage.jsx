import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { DownloadIcon, ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/solid';

const VideoPlayerPage = () => {
  const { id } = useParams();
  const [currentVideo, setCurrentVideo] = useState(null);

  const handleDownload = async () => {
    // Implement Y2mate API download logic
    try {
      // Placeholder for Y2mate API integration
      console.log('Downloading video:', id);
    } catch (error) {
      console.error('Download failed', error);
    }
  };

  const handleNextVideo = () => {
    // Implement navigation to next video
  };

  const handlePreviousVideo = () => {
    // Implement navigation to previous video
  };

  return (
    <div className="min-h-screen bg-netflix-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Video Player */}
        <div className="relative">
          <iframe
            src={`https://www.youtube.com/embed/${id}`}
            title="YouTube Video"
            className="w-full h-[600px] rounded-lg"
            allowFullScreen
          />

          {/* Video Controls */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
            <button 
              onClick={handlePreviousVideo}
              className="bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>

            <button 
              onClick={handleDownload}
              className="bg-red-600 text-white px-4 py-2 rounded-full flex items-center space-x-2 hover:bg-red-700"
            >
              <DownloadIcon className="h-5 w-5" />
              <span>Download</span>
            </button>

            <button 
              onClick={handleNextVideo}
              className="bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700"
            >
              <ArrowRightIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Video Details */}
        <div className="mt-6">
          <h1 className="text-2xl font-bold">Video Title</h1>
          <p className="text-gray-400 mt-2">Channel Name</p>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerPage;