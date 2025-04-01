import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DownloadIcon, ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/solid';

const VideoPlayerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentVideo, setCurrentVideo] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Fetch video data based on ID
  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        // In a real app, you would fetch from an API
        // This is a placeholder to simulate fetching video data
        
        // Mock data for demonstration
        const mockVideos = [
          {
            id: '1',
            title: 'Amazing Cat Video',
            channelName: 'PetLovers',
            videoUrl: 'https://example.com/video1.mp4',
            thumbnail: '/api/placeholder/1280/720',
            duration: '10:30',
            currentTime: '0:00'
          },
          {
            id: '2',
            title: 'JavaScript Tutorial for Beginners',
            channelName: 'CodeMasters',
            videoUrl: 'https://example.com/video2.mp4',
            thumbnail: '/api/placeholder/1280/720',
            duration: '15:45',
            currentTime: '0:00'
          },
          {
            id: '3',
            title: 'Travel Vlog: Paris',
            channelName: 'TravelTheWorld',
            videoUrl: 'https://example.com/video3.mp4',
            thumbnail: '/api/placeholder/1280/720',
            duration: '22:18',
            currentTime: '0:00'
          }
        ];
        
        // Find the current video and set related videos
        const foundVideo = mockVideos.find(video => video.id === id);
        if (foundVideo) {
          setCurrentVideo(foundVideo);
          setRelatedVideos(mockVideos);
          setCurrentIndex(mockVideos.findIndex(video => video.id === id));
        } else {
          // Handle video not found
          console.error('Video not found');
        }
      } catch (error) {
        console.error('Error fetching video data', error);
      }
    };
    
    fetchVideoData();
  }, [id]);
  
  const handleDownload = async () => {
    if (!currentVideo) return;
    
    try {
      // Y2mate API integration would go here
      // This is a placeholder implementation
      console.log('Downloading video:', currentVideo.title);
      
      // Simulate API call
      alert(`Starting download of "${currentVideo.title}"`);
      
      // In a real implementation, you would:
      // 1. Make a request to Y2mate API with the video URL
      // 2. Get the download links
      // 3. Trigger the download
    } catch (error) {
      console.error('Download failed', error);
      alert('Download failed. Please try again later.');
    }
  };
  
  const handleNextVideo = () => {
    if (!relatedVideos.length) return;
    
    const nextIndex = (currentIndex + 1) % relatedVideos.length;
    const nextVideo = relatedVideos[nextIndex];
    
    // Navigate to the next video
    navigate(`/watch/${nextVideo.id}`);
  };
  
  const handlePreviousVideo = () => {
    if (!relatedVideos.length) return;
    
    const prevIndex = (currentIndex - 1 + relatedVideos.length) % relatedVideos.length;
    const prevVideo = relatedVideos[prevIndex];
    
    // Navigate to the previous video
    navigate(`/watch/${prevVideo.id}`);
  };
  
  if (!currentVideo) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-white text-xl">Loading video...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Video Player */}
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
          {/* This would be replaced with an actual video player */}
          <div className="w-full h-full flex items-center justify-center">
            <img 
              src={currentVideo.thumbnail || "/api/placeholder/1280/720"}
              alt={currentVideo.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-lg">Video Player Would Appear Here</span>
            </div>
          </div>
          
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
          <h1 className="text-2xl font-bold text-white">{currentVideo.title}</h1>
          <p className="text-gray-400 mt-2">{currentVideo.channelName}</p>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerPage;