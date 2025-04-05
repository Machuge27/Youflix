import React, { useState, useRef, useEffect } from "react";
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { X, Maximize2, Minimize2, Play, Pause, Volume2, VolumeX, SkipForward, SkipBack, PictureInPicture } from "lucide-react";
import videoService from "../services/videoService";

const Watch = () => {
  const { videoId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const progressRef = useRef(null);
  const relatedVideosRef = useRef(null);

  // Three possible states: fullscreen, maximized, floating, minimized
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
  const [videoTitle, setVideoTitle] = useState(null);
  const [url, setVideoUrl] = useState(null);
  const controlsTimeoutRef = useRef(null);
  
  // Track if we've already fetched related videos to avoid refetching
  const [relatedVideosFetched, setRelatedVideosFetched] = useState(false);
  
  // Fetch video details and related videos
  useEffect(() => {
    const fetchVideoData = async () => {
      setIsLoading(true);
      try {
        const videoDetails = await videoService.getVideoDetails(videoId);
        setVideoTitle(videoDetails.title);
        setVideoUrl(videoDetails.url);
        setVideoDetails(videoDetails);
        
        // Only fetch related videos if we haven't fetched them yet
        if (!relatedVideosFetched) {
          const related = await videoService.getRelatedVideos(videoId);
          setRelatedVideos(related);
          setRelatedVideosFetched(true);
        }
      } catch (error) {
        console.error("Error fetching video data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (videoId) {
      fetchVideoData();
    }
  }, [videoId, relatedVideosFetched]);

  // Scroll current video into view in related videos list
  useEffect(() => {
    if (relatedVideosRef.current && !isLoading) {
      // Find current video in related videos list
      const currentVideoIndex = relatedVideos.findIndex(video => video.videoId === videoId);
      if (currentVideoIndex >= 0) {
        // Find the DOM element for the current video
        const currentVideoElement = relatedVideosRef.current.querySelector(`[data-video-id="${videoId}"]`);
        if (currentVideoElement) {
          // Scroll the element into view with a smooth behavior
          currentVideoElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    }
  }, [videoId, relatedVideos, isLoading]);

  // Implementation of previously empty functions
  const onPrevious = () => {
    // Find current video index in related videos
    const currentIndex = relatedVideos.findIndex(video => video.videoId === videoId);
    
    // If found and not the first item, navigate to previous video
    if (currentIndex > 0) {
      const previousVideo = relatedVideos[currentIndex - 1];
      navigate(`/watch/${previousVideo.videoId}`);
    } else if (currentIndex === -1 && relatedVideos.length > 0) {
      // If current video is not in list but we have related videos, go to last one
      const lastVideo = relatedVideos[relatedVideos.length - 1];
      navigate(`/watch/${lastVideo.videoId}`);
    }
  };
  
  const onNext = () => {
    // Find current video index in related videos
    const currentIndex = relatedVideos.findIndex(video => video.videoId === videoId);
    
    // If found and not the last item, navigate to next video
    if (currentIndex >= 0 && currentIndex < relatedVideos.length - 1) {
      const nextVideo = relatedVideos[currentIndex + 1];
      navigate(`/watch/${nextVideo.videoId}`);
    } else if (relatedVideos.length > 0) {
      // If current video is not in list or it's the last one, go to first related video
      navigate(`/watch/${relatedVideos[0].videoId}`);
    }
  };
  
  const onClose = () => {
    // Return to previous page or navigate to home
    if (location.state && location.state.from) {
      navigate(location.state.from);
    } else {
      navigate('/');
    }
  };
  
  const onEnded = () => {
    // If autoplay is enabled, play next video
    if (autoPlayNext && relatedVideos.length > 0) {
      onNext();
    } else {
      // Otherwise just stop at the end
      setIsPlaying(false);
    }
  };
  
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
      const nextVideo = relatedVideos[0];
      navigate(`/watch/${nextVideo.videoId}`);
    } else {
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
  }, [isYouTube, autoPlayNext, relatedVideos, navigate]);

  // Fixed ESC key handler to properly cycle through states
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        // Proper cycling through states
        if (playerState === "fullscreen") {
          setPlayerState("maximized");
        } else if (playerState === "maximized") {
          setPlayerState("floating");
        } else if (playerState === "floating") {
          setPlayerState("minimized");
        } else if (playerState === "minimized") {
          // If minimized, go back to fullscreen
          setPlayerState("fullscreen");
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
  
  useEffect(() => {
    let timeUpdateInterval;
  
    if (isYouTube && window.YT) {
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
            const duration = event.target.getDuration();
            setDuration(duration);
          },
          onStateChange: (event) => {
            const playerState = window.YT.PlayerState;
            if (event.data === playerState.PLAYING) {
              setIsPlaying(true);
            } else if (event.data === playerState.PAUSED) {
              setIsPlaying(false);
            } else if (event.data === playerState.ENDED) {
              handleVideoEnded();
            }
          },
        }
      });
  
      // Setup time tracking
      timeUpdateInterval = setInterval(() => {
        if (youtubePlayerRef.current?.getCurrentTime && youtubePlayerRef.current?.getDuration) {
          try {
            const current = youtubePlayerRef.current.getCurrentTime();
            const total = youtubePlayerRef.current.getDuration();
  
            setCurrentTime(current);
  
            // If within 1s of duration, treat as ended
            if (total - current <= 1 && isPlaying) {
              handleVideoEnded();
            }
  
          } catch (e) {
            console.error("Error getting YouTube player time:", e);
          }
        }
      }, 1000);
    }
  
    return () => {
      clearInterval(timeUpdateInterval);
      if (youtubePlayerRef.current) {
        try {
          youtubePlayerRef.current.destroy();
        } catch (e) {
          console.error("Error destroying YouTube player:", e);
        }
      }
    };
  }, [isYouTube, youtubeVideoId, isPlaying, isMuted]);
  
  
  // Control functions - updated to work with both direct video and YouTube
  const togglePlay = () => {
    if (isYouTube && youtubePlayerRef.current) {
      try {
        if (isPlaying) {
          youtubePlayerRef.current.pauseVideo();
        } else {
          youtubePlayerRef.current.playVideo();
        }
        setIsPlaying(!isPlaying);
      } catch (e) {
        console.error("Error controlling YouTube playback:", e);
      }
    } else if (videoRef.current) {
      const video = videoRef.current;
      if (isPlaying) {
        video.pause();
      } else {
        video.play().catch(e => console.error("Error playing video:", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (isYouTube && youtubePlayerRef.current) {
      try {
        if (isMuted) {
          youtubePlayerRef.current.unMute();
        } else {
          youtubePlayerRef.current.mute();
        }
        setIsMuted(!isMuted);
      } catch (e) {
        console.error("Error controlling YouTube mute:", e);
      }
    } else if (videoRef.current) {
      const video = videoRef.current;
      video.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (e) => {
    const seekTime = (e.target.value / 100) * duration;
    
    if (isYouTube && youtubePlayerRef.current) {
      try {
        youtubePlayerRef.current.seekTo(seekTime, true);
        setCurrentTime(seekTime);
      } catch (e) {
        console.error("Error seeking in YouTube video:", e);
      }
    } else if (videoRef.current) {
      const video = videoRef.current;
      video.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  // Fixed player state toggle logic to cycle through all states properly
  const togglePlayerState = () => {
    switch (playerState) {
      case "fullscreen":
        setPlayerState("maximized");
        break;
      case "maximized":
        setPlayerState("floating");
        break;
      case "floating":
        setPlayerState("minimized");
        break;
      case "minimized":
        setPlayerState("fullscreen");
        break;
      default:
        setPlayerState("fullscreen");
    }
  };

  const maximizePlayer = () => {
    setPlayerState("fullscreen");
  };

  // Toggle autoplay next
  const toggleAutoPlayNext = () => {
    setAutoPlayNext(!autoPlayNext);
  };

  // Format time (converts seconds to MM:SS format)
  const formatTime = (time) => {
    if (isNaN(time) || time === Infinity) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }).format(date);
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
    }
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
        return "fixed bottom-16 right-16 z-50 bg-black rounded-lg shadow-lg w-96 h-56";
      case "minimized":
        return "fixed bottom-4 right-4 z-50 bg-black rounded-lg shadow-lg w-64 h-36";
      default:
        return "fixed inset-0 z-50 bg-black";
    }
  };

  // Improved Picture in Picture implementation
  const togglePictureInPicture = async () => {
    try {
      if (!isYouTube && videoRef.current) {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await videoRef.current.requestPictureInPicture();
        }
      } else if (isYouTube) {
        // For YouTube iframe, we need to handle this differently
        // This is tricky because we can't directly access the video element
        // One approach is to create a temporary video element with the same source
        
        // Check if we already have access to the iframe video element
        const iframe = document.getElementById('youtube-player');
        if (iframe) {
          // Try to get YouTube iframe's video element
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          const video = iframeDoc?.querySelector('video');
          
          if (video) {
            if (document.pictureInPictureElement) {
              await document.exitPictureInPicture();
            } else {
              await video.requestPictureInPicture();
            }
            return;
          }
        }
        
        // If we couldn't access the iframe's video element (due to cross-origin restrictions)
        // Alert the user
        alert("Picture-in-Picture is not available for YouTube videos due to cross-origin restrictions.");
      }
    } catch (error) {
      console.error("PiP error:", error);
      alert("Failed to enter Picture-in-Picture mode. Your browser may not support this feature.");
    }
  };

  // Script to load YouTube iframe API
  useEffect(() => {
    if (isYouTube && !window.YT) {
      // Create YouTube iframe API script
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      
      // Define the callback for when API is ready
      window.onYouTubeIframeAPIReady = () => {
        console.log("YouTube iframe API is ready");
      };
      
      // Add script to document
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      
      // Cleanup
      return () => {
        window.onYouTubeIframeAPIReady = null;
      };
    }
  }, [isYouTube]);
  
  // Improved control visibility management
  // Show controls on mouse move and hide after exactly 3 seconds of inactivity
  const handleMouseMove = () => {
    setShowControls(true);
    
    // Clear any existing timeout
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    // Set new timeout - hide controls after 3 seconds
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };
  
  // Set up mouse move event listener
  useEffect(() => {
    // Attach event listener for mouse movement
    if (playerRef.current) {
      playerRef.current.addEventListener("mousemove", handleMouseMove);
    } else {
      window.addEventListener("mousemove", handleMouseMove);
    }
    
    // Initial state - show controls when component mounts
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
    
    // Cleanup
    return () => {
      if (playerRef.current) {
        playerRef.current.removeEventListener("mousemove", handleMouseMove);
      } else {
        window.removeEventListener("mousemove", handleMouseMove);
      }
      
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [playerRef.current]);

  // Handle click on related video
  const handleRelatedVideoClick = (relatedVideoId) => {
    navigate(`/watch/${relatedVideoId}`);
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
            src={url || `https://example.com/api/videos/${videoId}`}
            autoPlay
            className="w-full h-full object-contain"
          />
        )}
        
        {/* Top bar with controls - only show on hover or in minimized state */}
        <div 
          className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-3 flex justify-between items-center transition-opacity duration-300 ${showControls || playerState === "minimized" ? 'opacity-100' : 'opacity-0'}`}
        >
          <h3 className="text-white text-sm md:text-base truncate flex-1">
            {playerState === "minimized" ? "Now Playing" : `Now Playing - ${videoTitle || (url ? url.split('/').pop() : '')}`}
          </h3>
          <div className="flex gap-3">
            <button onClick={togglePlayerState} className="text-white hover:text-blue-400">
              {playerState === "fullscreen" || playerState === "maximized" ? 
               <Minimize2 size={playerState === "minimized" ? 14 : 18} /> : 
               <Maximize2 size={playerState === "minimized" ? 14 : 18} />}
            </button>
            <button onClick={onClose} className="text-white hover:text-blue-400">
              <X size={playerState === "minimized" ? 14 : 18} />
            </button>
          </div>
        </div>
        
        {/* Progress bar - always visible except in minimized mode */}
        {playerState !== "minimized" && (
          <div className={`absolute bottom-10 left-0 right-0 px-3 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
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
        )}
        
        {/* Bottom controls - only show on hover or in minimized state */}
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
              
              {/* Autoplay toggle - hide in minimized mode */}
              {playerState !== "minimized" && (
                <button 
                  onClick={toggleAutoPlayNext} 
                  className={`text-xs px-2 py-1 rounded ${autoPlayNext ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
                >
                  AutoPlay: {autoPlayNext ? 'ON' : 'OFF'}
                </button>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <button onClick={toggleMute} className="text-white hover:text-blue-400">
                {isMuted ? <VolumeX size={playerState === "minimized" ? 14 : 18} /> : <Volume2 size={playerState === "minimized" ? 14 : 18} />}
              </button>
              {playerState !== "minimized" && (
                <button onClick={togglePictureInPicture} className="text-white hover:text-blue-400">
                  <PictureInPicture size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render video details section
  const renderVideoDetails = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
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

  // Get next video for highlighting in the related videos list
  const getNextVideoId = () => {
    if (!autoPlayNext || relatedVideos.length === 0) return null;
    
    const currentIndex = relatedVideos.findIndex(video => video.videoId === videoId);
    
    if (currentIndex >= 0 && currentIndex < relatedVideos.length - 1) {
      return relatedVideos[currentIndex + 1].videoId;
    } else {
      return relatedVideos[0].videoId;
    }
  };
  
  const nextVideoId = getNextVideoId();
  const currentlyPlayingId = videoId; // The ID of the currently playing video

  // This effect scrolls to the next video when autoplay is on
  useEffect(() => {
    if (autoPlayNext && nextVideoId && relatedVideosRef.current) {
      // Find the element for the next video
      const nextVideoElement = relatedVideosRef.current.querySelector(`[data-video-id="${nextVideoId}"]`);
      
      if (nextVideoElement) {
        // Scroll to the next video with a small offset to ensure it's at the top
        nextVideoElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [autoPlayNext, nextVideoId]);

  // This effect scrolls to keep the currently playing video visible when it changes
  useEffect(() => {
    if (currentlyPlayingId && relatedVideosRef.current) {
      // Find the element for the currently playing video
      const currentVideoElement = relatedVideosRef.current.querySelector(`[data-video-id="${currentlyPlayingId}"]`);
      
      if (currentVideoElement) {
        // Scroll to the currently playing video with a small offset to ensure it's at the top
        currentVideoElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [currentlyPlayingId]);

  // Render related videos section
  const renderRelatedVideos = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }
    if (!relatedVideos || relatedVideos.length === 0) {
      return <div className="p-4 text-center">No related videos available</div>;
    }
    
    return (
      <div className="p-4 overflow-y-auto" ref={relatedVideosRef}>
        <h3 className="text-lg font-semibold mb-3">
          {autoPlayNext ? 'Up Next (Autoplay On)' : 'Related Videos'}
        </h3>
        <div className="space-y-4">
          {relatedVideos.map((video, index) => {
            const isCurrentlyPlaying = video.videoId === currentlyPlayingId;
            const isNextVideo = video.videoId === nextVideoId && autoPlayNext;
            
            // Define animation style for the currently playing video
            const animatedBorderStyle = isCurrentlyPlaying ? {
              animation: 'pulseBorder 2s infinite',
            } : {};
            
            return (
              <div
                key={video.id || `related-${index}`}
                data-video-id={video.videoId}
                className={`flex space-x-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg 
                  ${isNextVideo ? 'border-l-4 border-blue-500 pl-3' : ''} 
                  ${isCurrentlyPlaying ? 'border-2 border-green-500 bg-green-50 dark:bg-green-900/20' : ''}`}
                style={animatedBorderStyle}
                onClick={() => handleRelatedVideoClick(video.videoId)}
              >
                <div className="relative w-40 h-24 flex-none">
                  <img
                    src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
                    alt={video.title || video.videoId}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                    {video.duration}
                  </div>
                  {isNextVideo && (
                    <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
                      Next
                    </div>
                  )}
                  {isCurrentlyPlaying && (
                    <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-1 py-0.5 rounded flex items-center">
                      <span className="w-1.5 h-1.5 bg-white rounded-full mr-1"></span>
                      Now Playing
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium line-clamp-2 ${isCurrentlyPlaying ? 'text-green-600 dark:text-green-400' : ''}`}>
                    {video.title}
                  </h4>
                  <p className="text-sm text-gray-500">{video.channelName}</p>
                  <div className="text-xs text-gray-500 flex space-x-2">
                    <span>{formatViewCount(video.viewCount)}</span>
                    <span>•</span>
                    <span>{formatDate(video.publishedAt)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <style jsx>{`
          @keyframes pulseBorder {
            0% { border-color: rgba(34, 197, 94, 0.5); }
            50% { border-color: rgba(34, 197, 94, 1); }
            100% { border-color: rgba(34, 197, 94, 0.5); }
          }
        `}</style>
      </div>
    );
  };

  // If minimized or floating, just show the player
  if (playerState === "minimized" || playerState === "floating") {
    return (
      <div 
        ref={playerRef} 
        className={`${getPlayerClasses()} transition-all duration-300 overflow-hidden`}
        onDoubleClick={() => playerState === "minimized" ? setPlayerState("fullscreen") : null}
      >
        {renderPlayer()}
      </div>
    );
  }

  // For maximized mode, show just the video player
  if (playerState === "maximized") {
    return (
      <div 
        ref={playerRef} 
        className={`${getPlayerClasses()} transition-all duration-300 overflow-hidden`}
        onDoubleClick={() => setPlayerState("fullscreen")}
      >
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
            {/* Custom overlay for double-click to toggle minimize/maximize */}
            <div 
              className="absolute inset-0 z-10" 
              onDoubleClick={() => setPlayerState("maximized")}
              style={{ pointerEvents: 'none' }}
            />
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

export default Watch;