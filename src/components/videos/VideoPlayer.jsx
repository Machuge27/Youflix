import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Maximize2, Minimize2, Play, Pause, Volume2, VolumeX, SkipForward, SkipBack, PictureInPicture } from "lucide-react";
import videoService from "../../services/videoService";

const VideoPlayer = ({ videoId, videoTitle, url, onClose, onEnded, onNext, onPrevious }) => {
  // Three possible states: fullscreen, maximized, floating, minimized
  const navigate = useNavigate();
  const [playerState, setPlayerState] = useState("fullscreen"); // "fullscreen", "maximized", "floating", "minimized"
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [videoDetails, setVideoDetails] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [autoPlayNext, setAutoPlayNext] = useState(true); // Added autoplay state
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  
  // Fetch video details and related videos
  useEffect(() => {
    const fetchVideoData = async () => {
      setIsLoading(true);
      try {
        const videoDetails = await videoService.getVideoDetails(videoId);
        const related = await videoService.getRelatedVideos(videoId);
        console.log("videoDetails",videoDetails)
        
        setVideoDetails(videoDetails);
        setRelatedVideos(related);
      } catch (error) {
        console.error("Error fetching video data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (videoId) {
      fetchVideoData();
    }
  }, [videoId]);
  
  // Extract YouTube video ID from URL
  const getYouTubeId = (youtubeUrl) => {
    if (!youtubeUrl) return null;
    
    // Handle various YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = youtubeUrl.match(regExp);
    
    return (match && match[2].length === 11) ? match[2] : null;
  };
  
  const youtubeVideoId = getYouTubeId(url);
  
  // Determine if we're using YouTube or direct video source
  const isYouTube = !!youtubeVideoId;
  
  // Handle video ended event
  const handleVideoEnded = () => {
    if (autoPlayNext && relatedVideos.length > 0) {
      // Play the first related video
      handleRelatedVideoClick(relatedVideos[0].id);
    } else if (onEnded) {
      onEnded();
    }
  };
  
  // Update video state (only for direct video source)
  useEffect(() => {
    if (!isYouTube && videoRef.current) {
      const video = videoRef.current;
      
      const handleTimeUpdate = () => {
        setCurrentTime(video.currentTime);
      };
      
      const handleLoadedMetadata = () => {
        setDuration(video.duration);
      };
      
      video.addEventListener("timeupdate", handleTimeUpdate);
      video.addEventListener("loadedmetadata", handleLoadedMetadata);
      video.addEventListener("ended", handleVideoEnded);
      
      return () => {
        video.removeEventListener("timeupdate", handleTimeUpdate);
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        video.removeEventListener("ended", handleVideoEnded);
      };
    }
  }, [isYouTube, autoPlayNext, relatedVideos]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (playerState === "maximized") {
          setPlayerState("fullscreen");
        } else if (playerState === "fullscreen") {
          setPlayerState("floating");
        }
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [playerState]);

  // YouTube iframe API reference
  const youtubePlayerRef = useRef(null);
  
  // This function handles YouTube iframe API interactions
  useEffect(() => {
    if (isYouTube && window.YT) {
      // Initialize YouTube Player if YT API is available
      youtubePlayerRef.current = new window.YT.Player('youtube-player', {
        videoId: youtubeVideoId,
        playerVars: {
          autoplay: isPlaying ? 1 : 0,
          mute: isMuted ? 1 : 0,
          controls: 0,
          showinfo: 0,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: (event) => {
            // Update duration when player is ready
            if (event.target.getDuration) {
              setDuration(event.target.getDuration());
            }
          },
          onStateChange: (event) => {
            // Update play state based on YT player state
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            } else if (event.data === window.YT.PlayerState.ENDED) {
              // Handle video end
              handleVideoEnded();
            }
          },
        }
      });
      
      // Set up interval to update current time
      const timeUpdateInterval = setInterval(() => {
        if (youtubePlayerRef.current && youtubePlayerRef.current.getCurrentTime) {
          setCurrentTime(youtubePlayerRef.current.getCurrentTime());
        }
      }, 1000);
      
      return () => {
        clearInterval(timeUpdateInterval);
      };
    }
  }, [isYouTube, youtubeVideoId, isPlaying, isMuted, autoPlayNext, relatedVideos]);
  
  // Control functions - updated to work with both direct video and YouTube
  const togglePlay = () => {
    if (isYouTube && youtubePlayerRef.current) {
      if (isPlaying) {
        youtubePlayerRef.current.pauseVideo();
      } else {
        youtubePlayerRef.current.playVideo();
      }
    } else if (videoRef.current) {
      const video = videoRef.current;
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (isYouTube && youtubePlayerRef.current) {
      if (isMuted) {
        youtubePlayerRef.current.unMute();
      } else {
        youtubePlayerRef.current.mute();
      }
    } else if (videoRef.current) {
      const video = videoRef.current;
      video.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const handleSeek = (e) => {
    const seekTime = (e.target.value / 100) * duration;
    
    if (isYouTube && youtubePlayerRef.current) {
      youtubePlayerRef.current.seekTo(seekTime);
    } else if (videoRef.current) {
      const video = videoRef.current;
      video.currentTime = seekTime;
    }
    
    setCurrentTime(seekTime);
  };

  const togglePlayerState = () => {
    // Updated to include maximized state
    if (playerState === "fullscreen") {
      setPlayerState("maximized");
    } else if (playerState === "maximized") {
      setPlayerState("fullscreen");
    } else if (playerState === "floating") {
      setPlayerState("minimized");
    } else {
      setPlayerState("fullscreen");
    }
  };

  const maximizePlayer = () => {
    setPlayerState("maximized");
  };

  // Toggle autoplay next
  const toggleAutoPlayNext = () => {
    setAutoPlayNext(!autoPlayNext);
  };

  // Format time (converts seconds to MM:SS format)
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  // Format view count
  const formatViewCount = (count) => {
    if (!count) return "0 views";
    if (count < 1000) return `${count} views`;
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K views`;
    return `${(count / 1000000).toFixed(1)}M views`;
  };

  // Determine player classes based on state
  const getPlayerClasses = () => {
    switch (playerState) {
      case "maximized":
        return "fixed inset-0 z-50 bg-black";
      case "fullscreen":
        return "fixed inset-0 z-50 bg-black";
      case "floating":
        return "fixed bottom-16 left-16 z-50 bg-black rounded-lg shadow-lg w-96 h-56";
      case "minimized":
        return "fixed bottom-1 left-1 z-50 bg-black rounded-lg shadow-lg w-6 h-40";
      default:
        return "fixed inset-0 z-50 bg-black";
    }
  };

  // Toggle Picture in Picture mode
  const togglePictureInPicture = async () => {
    try {
      if (!isYouTube && videoRef.current) {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await videoRef.current.requestPictureInPicture();
        }
      } else if (isYouTube) {
        // For YouTube, we'd need to extract the iframe video element
        const iframe = document.getElementById('youtube-player');
        if (iframe) {
          const video = iframe.querySelector('video');
          if (video) {
            if (document.pictureInPictureElement) {
              await document.exitPictureInPicture();
            } else {
              await video.requestPictureInPicture();
            }
          }
        }
      }
    } catch (error) {
      console.error("PiP error:", error);
    }
  };

  // Script to load YouTube iframe API
  useEffect(() => {
    if (isYouTube && !window.YT) {
      // Create YouTube iframe API script
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      
      // Add script to document
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }, [isYouTube]);
  
  // Show controls on mouse move and hide after 3 seconds of inactivity
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
    };

    window.addEventListener("mousemove", handleMouseMove);

    if (showControls) {
      const timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000); // Hide controls after 3 seconds of inactivity

      return () => {
        clearTimeout(timeout);
      };
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [showControls]);

  // Handle click on related video
  const handleRelatedVideoClick = (relatedVideoId) => {
    // You can implement navigation to related video here
    console.log(`Navigate to video ID: ${relatedVideoId}`);
    
    // This would typically update the current video URL/ID in your app's state
    // For demonstration, let's assume there's a function to navigate to the new video
    if (typeof window !== 'undefined') {
      const newUrl = `/watch?v=${relatedVideoId}`;
      window.history.pushState({}, '', newUrl);
      navigate(newUrl);
      
      // In a real app, you would update your app's state or reload the component
      // with the new videoId. For this example, we'll just log it:
      console.log(`Playing next video: ${relatedVideoId}`);
      
      // If onNext is provided as a prop, call it with the related video ID
      if (onNext) {
        onNext(relatedVideoId);
      }
    }
  };

  // Player UI components based on state
  const renderPlayer = () => {
    return (
      <div className="relative w-full h-full">
        {/* Video - conditional rendering based on source type */}
        {isYouTube ? (
          <div id="youtube-player" className="w-full h-full">
            {/* YouTube iframe will be inserted here by the API */}
          </div>
        ) : (
          <video
            ref={videoRef}
            src={`https://example.com/api/videos/${videoId}`}
            autoPlay
            className="w-full h-full object-contain"
          />
        )}
        
        {/* Top bar with controls - only show on hover */}
        <div 
          className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-3 flex justify-between items-center transition-opacity duration-300 ${showControls || playerState === "minimized" ? 'opacity-100' : 'opacity-0'}`}
        >
          <h3 className="text-white text-sm md:text-base truncate flex-1">
            Now Playing {playerState === "minimized" ? "" : `- ${videoTitle || (url ? url.split('/').pop() : '')}`}
          </h3>
          <div className="flex gap-3">
            <button onClick={togglePlayerState} className="text-white hover:text-blue-400">
              {playerState === "maximized" ? <Minimize2 size={playerState === "minimized" ? 14 : 18} /> : 
               playerState === "minimized" ? <Maximize2 size={14} /> : <Maximize2 size={18} />}
            </button>
            <button onClick={onClose} className="text-white hover:text-blue-400">
              <X size={playerState === "minimized" ? 14 : 18} />
            </button>
          </div>
        </div>
        
        {/* Progress bar - always visible */}
        <div className="absolute bottom-10 left-0 right-0 px-3">
          <div className="flex items-center">
            <span className="text-white text-xs mr-2">{formatTime(currentTime)}</span>
            <div className="relative w-full h-1 bg-gray-600 rounded-lg">
              <div
                className="absolute top-0 left-0 h-full bg-green-500 rounded-lg"
                style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
              ></div>
              <input
                type="range"
                min="0"
                max="100"
                value={(currentTime / duration) * 100 || 0}
                onChange={handleSeek}
                className="absolute top-0 left-0 w-full h-full appearance-none cursor-pointer bg-transparent"
              />
            </div>
            <span className="text-white text-xs ml-2">{formatTime(duration)}</span>
          </div>
        </div>
        
        {/* Bottom controls - only show on hover */}
        <div 
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 transition-opacity duration-300 ${showControls || playerState === "minimized" ? 'opacity-100' : 'opacity-0'}`}
        >
          {/* Control buttons */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button onClick={onPrevious} className="text-white hover:text-blue-400">
                <SkipBack size={playerState === "minimized" ? 14 : 18} />
              </button>
              <button onClick={togglePlay} className="text-white hover:text-blue-400">
                {isPlaying ? <Pause size={playerState === "minimized" ? 14 : 18} /> : <Play size={playerState === "minimized" ? 14 : 18} />}
              </button>
              <button onClick={onNext} className="text-white hover:text-blue-400">
                <SkipForward size={playerState === "minimized" ? 14 : 18} />
              </button>
              
              {/* Add autoplay toggle button */}
              <button 
                onClick={toggleAutoPlayNext} 
                className={`text-xs px-2 py-1 rounded ${autoPlayNext ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
              >
                AutoPlay: {autoPlayNext ? 'ON' : 'OFF'}
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <button onClick={toggleMute} className="text-white hover:text-blue-400">
                {isMuted ? <VolumeX size={playerState === "minimized" ? 14 : 18} /> : <Volume2 size={playerState === "minimized" ? 14 : 18} />}
              </button>
              <button onClick={togglePictureInPicture} className="text-white hover:text-blue-400">
                <PictureInPicture size={playerState === "minimized" ? 14 : 18} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Show mini controls when minimized */}
        {playerState === "minimized" && (
          <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-1">
            <button onClick={togglePlay} className="text-white mx-1">
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            </button>
          </div>
        )}
      </div>
    );
  };

  // Render video details section
  const renderVideoDetails = () => {
    if (isLoading) {
      return <div className="p-4 text-center">Loading video details...</div>;
    }

    if (!videoDetails) {
      return <div className="p-4 text-center">No video details available</div>;
    }

    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-2">{videoDetails.title}</h2>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            {videoDetails.channelThumbnail && (
              <img 
                src={videoDetails.channelThumbnail} 
                alt={videoDetails.channelName} 
                className="w-10 h-10 rounded-full mr-3"
              />
            )}
            <div>
              <p className="font-medium">{videoDetails.channelName}</p>
              <p className="text-sm text-gray-500">{videoDetails.subscriberCount} subscribers</p>
            </div>
          </div>
          <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full">
            Subscribe
          </button>
        </div>
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg mb-4">
          <div className="flex justify-between mb-2">
            <span>{formatViewCount(videoDetails.viewCount)}</span>
            <span>{formatDate(videoDetails.publishedAt)}</span>
          </div>
          <p className="text-sm">{videoDetails.description}</p>
        </div>
        
        {/* Autoplay next toggle in details section */}
        <div className="flex items-center justify-end mb-4">
          <span className="mr-2 text-sm">Autoplay Next</span>
          <button 
            onClick={toggleAutoPlayNext}
            className={`relative inline-flex h-6 w-11 items-center rounded-full ${autoPlayNext ? 'bg-blue-600' : 'bg-gray-400'}`}
          >
            <span 
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${autoPlayNext ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
        </div>
      </div>
    );
  };

  // Render related videos section
  const renderRelatedVideos = () => {
    if (isLoading) {
      return <div className="p-4 text-center">Loading related videos...</div>;
    }

    if (!relatedVideos || relatedVideos.length === 0) {
      return <div className="p-4 text-center">No related videos available</div>;
    }

    return (
      <div className="p-4 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-3">
          {autoPlayNext ? 'Up Next (Autoplay On)' : 'Related Videos'}
        </h3>
        <div className="space-y-4">
          {relatedVideos.map((video, index) => (
            <div 
              key={video.id} 
              className={`flex space-x-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg ${index === 0 && autoPlayNext ? 'border-l-4 border-blue-500 pl-3' : ''}`}
              onClick={() => handleRelatedVideoClick(video.id)}
            >
              <div className="relative w-40 h-24 flex-none">
                <img 
                  src={video.thumbnail} 
                  alt={video.videoId} 
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                  {video.duration}
                </div>
                {index === 0 && autoPlayNext && (
                  <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
                    Next
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-medium line-clamp-2">{video.title}</h4>
                <p className="text-sm text-gray-500">{video.channelName}</p>
                <div className="text-xs text-gray-500 flex space-x-2">
                  <span>{formatViewCount(video.viewCount)}</span>
                  <span>•</span>
                  <span>{formatDate(video.publishedAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // If minimized or floating, just show the player
  if (playerState === "minimized" || playerState === "floating") {
    return (
      <div ref={playerRef} className={`${getPlayerClasses()} transition-all duration-300 overflow-hidden`}>
        {renderPlayer()}
      </div>
    );
  }

  // For maximized mode, show just the video player
  if (playerState === "maximized") {
    return (
      <div ref={playerRef} className={`${getPlayerClasses()} transition-all duration-300 overflow-hidden`}>
        {renderPlayer()}
      </div>
    );
  }

  // For fullscreen mode, show the main layout with side-by-side content
  return (
    <div ref={playerRef} className={`${getPlayerClasses()} transition-all duration-300 overflow-hidden`}>
      <div className="flex flex-col h-full md:flex-row">
        {/* Left side (video player and details) */}
        <div className="w-full md:w-2/3 flex flex-col h-full">
          {/* Video player */}
          <div className="relative flex-1">
            {renderPlayer()}
            {/* Maximize button overlay */}
            <button 
              onClick={maximizePlayer}
              className="absolute top-12 right-3 bg-black/50 text-white p-1 rounded-full hover:bg-black/80"
            >
              <Maximize2 size={18} />
            </button>
          </div>
          
          {/* Video details below video */}
          <div className="bg-white dark:bg-gray-900 h-1/3 overflow-y-auto">
            {renderVideoDetails()}
          </div>
        </div>
        
        {/* Right side (related videos) */}
        <div className="w-full md:w-1/3 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 h-full overflow-y-auto">
          {renderRelatedVideos()}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;