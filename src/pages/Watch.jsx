import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { 
  PlayIcon, 
  PauseIcon, 
  VolumeUpIcon, 
  VolumeOffIcon,
  ArrowsExpandIcon,
  FastForwardIcon,
  RewindIcon,
  PhotographIcon,
  XIcon
} from '@heroicons/react/solid';

import { X, Maximize2, Minimize2, Play, Pause, Volume2, VolumeX } from "lucide-react";
import videoService from '../services/videoService';

const Watch = () => {
  const { videoId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const progressRef = useRef(null);
  
  // States for video player
  const [video, setVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPiP, setIsPiP] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [controlsTimeout, setControlsTimeout] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  
  // Parse the time parameter from URL
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const timeParam = query.get('t');
    
    if (timeParam) {
      let seconds = 0;
      
      // Handle formats like "7:35" or "7m35s" or just seconds
      if (timeParam.includes(':')) {
        const [minutes, secs] = timeParam.split(':');
        seconds = (parseInt(minutes) * 60) + parseInt(secs);
      } else if (timeParam.includes('m') && timeParam.includes('s')) {
        const minuteMatch = timeParam.match(/(\d+)m/);
        const secondMatch = timeParam.match(/(\d+)s/);
        
        if (minuteMatch) seconds += parseInt(minuteMatch[1]) * 60;
        if (secondMatch) seconds += parseInt(secondMatch[1]);
      } else {
        seconds = parseInt(timeParam);
      }
      
      if (!isNaN(seconds) && videoRef.current) {
        videoRef.current.currentTime = seconds;
        setCurrentTime(seconds);
      }
    }
  }, [location.search, videoRef.current]);

  // Fetch video details and related videos
  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        const videoDetails = await videoService.getVideoDetails(videoId);
        setVideo(videoDetails);
                
        // Get related videos
        const related = await videoService.getRelatedVideos(videoId);
        setRelatedVideos(related);
        
        // Save to recent videos
        await videoService.addToRecentVideos({
          videoId,
          title: videoDetails.title,
          channelName: videoDetails.channelName,
          duration: videoDetails.duration,
          category: videoDetails.category,
          currentTime: 0
        });

      } catch (error) {
        console.error("Failed to fetch video details:", error);
      }
    };
    
    if (videoId) {
      fetchVideoDetails();
    }
  }, [videoId]);

  // Set up video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      
      // Save current time to recent videos every 5 seconds
      if (Math.floor(video.currentTime) % 5 === 0 && video) {
        videoService.updateVideoProgress(videoId, video.currentTime);
      }
    };
    
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
    };
    
    // Add event listeners
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);
    
    // Cleanup listeners
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, [videoRef.current, videoId]);

  // Toggle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Handle volume change
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  // Handle seeking
  const handleSeek = (e) => {
    if (videoRef.current && progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      const seekTime = pos * duration;
      
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Toggle Picture-in-Picture
  const togglePiP = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPiP(false);
      } else if (document.pictureInPictureEnabled && videoRef.current) {
        await videoRef.current.requestPictureInPicture();
        setIsPiP(true);
      }
    } catch (error) {
      console.error("PiP failed:", error);
    }
  };

  // Toggle minimize player
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // Handle mouse movement to show/hide controls
  const handleMouseMove = () => {
    setShowControls(true);
    
    // Clear existing timeout
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    
    // Set new timeout
    const timeout = setTimeout(() => {
      setShowControls(false);
    }, 3000);
    
    setControlsTimeout(timeout);
  };

  // Format time (seconds to MM:SS)
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Navigate to previous or next video
  const navigateToVideo = (direction) => {
    if (!relatedVideos || relatedVideos.length === 0) return;
    
    // Find current video index in related videos
    const currentIndex = relatedVideos.findIndex(v => v.videoId === videoId);
    
    let newIndex;
    if (direction === 'next') {
      newIndex = currentIndex < relatedVideos.length - 1 ? currentIndex + 1 : 0;
    } else {
      newIndex = currentIndex > 0 ? currentIndex - 1 : relatedVideos.length - 1;
    }
    
    // Navigate to the new video
    navigate(`/watch/${relatedVideos[newIndex].videoId}`);
  };

  // Calculate progress bar width
  const progressWidth = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="pt-16 min-h-screen bg-black">
      <div className="container mx-auto px-4">
        <div 
          ref={containerRef}
          className={`relative ${isMinimized ? 'fixed bottom-4 right-4 w-80 z-50 shadow-lg rounded-lg overflow-hidden' : 'w-full'}`}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setShowControls(false)}
        >
          {/* Video Player */}
          <div className="relative bg-black aspect-video overflow-hidden rounded-lg">
            {video && (
              <video 
                ref={videoRef}
                src={video.videoUrl || `https://www.youtube.com/embed/${videoId}`}
                className="w-full h-full object-contain"
                autoPlay
                playsInline
              />
            )}
            
            {/* Overlay Controls - Shown on hover */}
            <div 
              className={`absolute inset-0 bg-gradient-to-t from-black/70 to-transparent transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}
            >
              {/* Top Controls */}
              <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
                <div>
                  {video && <h3 className="text-white text-lg font-medium">{video.title}</h3>}
                </div>
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={toggleMinimize} 
                    className="text-white p-1 hover:bg-white/20 rounded-full"
                  >
                    {isMinimized ? <ArrowsExpandIcon className="h-5 w-5" /> : <Minimize2 className="h-5 w-5" />}
                  </button>
                  {isMinimized && (
                    <button 
                      onClick={() => navigate(-1)} 
                      className="text-white p-1 hover:bg-white/20 rounded-full"
                    >
                      <XIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Center Controls */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="flex space-x-8 pointer-events-auto">
                  <button 
                    onClick={() => navigateToVideo('prev')} 
                    className="text-white p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                  >
                    <RewindIcon className="h-8 w-8" />
                  </button>
                  <button 
                    onClick={togglePlay} 
                    className="text-white p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                  >
                    {isPlaying ? <PauseIcon className="h-10 w-10" /> : <PlayIcon className="h-10 w-10" />}
                  </button>
                  <button 
                    onClick={() => navigateToVideo('next')} 
                    className="text-white p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                  >
                    <FastForwardIcon className="h-8 w-8" />
                  </button>
                </div>
              </div>
              
              {/* Bottom Controls */}
              <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col space-y-2">
                {/* Progress bar */}
                <div 
                  ref={progressRef}
                  className="w-full h-1 bg-gray-600 rounded cursor-pointer"
                  onClick={handleSeek}
                >
                  <div 
                    className="h-full bg-red-600 rounded"
                    style={{ width: `${progressWidth}%` }}
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={togglePlay} 
                      className="text-white hover:text-gray-300"
                    >
                      {isPlaying ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
                    </button>
                    
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={toggleMute} 
                        className="text-white hover:text-gray-300"
                      >
                        {isMuted ? <VolumeOffIcon className="h-5 w-5" /> : <VolumeUpIcon className="h-5 w-5" />}
                      </button>
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.01" 
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-16 accent-red-600"
                      />
                    </div>
                    
                    <div className="text-white text-sm">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={togglePiP} 
                      className="text-white hover:text-gray-300"
                      title="Picture in Picture"
                    >
                      <PhotographIcon className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={toggleFullscreen} 
                      className="text-white hover:text-gray-300"
                    >
                      {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <ArrowsExpandIcon className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Video Info & Comments (only when not minimized) */}
          {!isMinimized && video && (
            <div className="mt-4 pb-8">
              <h1 className="text-2xl font-bold text-white">{video.title}</h1>
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                    <span className="text-white font-medium">{video.channelName?.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{video.channelName}</h3>
                    <p className="text-gray-400 text-sm">{video.subscriberCount} subscribers</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-white bg-gray-800/50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="px-2 py-1 bg-gray-700 rounded text-sm">{video.category}</span>
                  <span>{video.viewCount} views</span>
                  <span>·</span>
                  <span>{video.uploadDate}</span>
                </div>
                <p className="text-gray-300">{video.description}</p>
              </div>
              
              {/* Related Videos */}
              <div className="mt-8">
                <h3 className="text-white text-xl font-medium mb-4">Related Videos</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {relatedVideos.map((video) => (
                    <div 
                      key={video.videoId} 
                      className="bg-gray-800/50 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-700/50 transition-colors"
                      onClick={() => navigate(`/watch/${video.videoId}`)}
                    >
                      <div className="aspect-video bg-gray-900 relative">
                        <img 
                          src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1 py-0.5 rounded">
                          {video.duration || "0:00"}
                        </div>
                      </div>
                      <div className="p-3">
                        <h4 className="text-white font-medium line-clamp-2">{video.title}</h4>
                        <p className="text-gray-400 text-sm mt-1">{video.channelName}</p>
                        <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                          <span>{video.viewCount} views</span>
                          <span>·</span>
                          <span>{video.uploadDate}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Watch;