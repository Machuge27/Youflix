import React, { useState, useRef, useEffect } from "react";
import { X, Maximize2, Minimize2, Play, Pause, Volume2, VolumeX } from "lucide-react";

const VideoPlayer = ({ videoId, videoTitle, url, onClose }) => {
  // Three possible states: fullscreen, minimized, or floating
  const [playerState, setPlayerState] = useState("fullscreen"); // "fullscreen", "minimized", "floating"
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  
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
      video.addEventListener("loadedMetadata", handleLoadedMetadata);
      
      return () => {
        video.removeEventListener("timeupdate", handleTimeUpdate);
        video.removeEventListener("loadedMetadata", handleLoadedMetadata);
      };
    }
  }, [isYouTube]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && playerState === "fullscreen") {
        setPlayerState("floating");
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
  }, [isYouTube, youtubeVideoId, isPlaying, isMuted]);
  
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
    // Cycle between states: fullscreen -> floating -> minimized -> fullscreen
    if (playerState === "fullscreen") {
      setPlayerState("floating");
    } else if (playerState === "floating") {
      setPlayerState("minimized");
    } else {
      setPlayerState("fullscreen");
    }
  };

  // Format time (converts seconds to MM:SS format)
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Determine player classes based on state
  const getPlayerClasses = () => {
    switch (playerState) {
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

  return (
    <div ref={playerRef} className={`${getPlayerClasses()} transition-all duration-300 overflow-hidden`}>
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
        
        {/* Top bar with controls */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-3 flex justify-between items-center">
          <h3 className="text-white text-sm md:text-base truncate flex-1">
            Now Playing {playerState === "minimized" ? "" : `- ${videoTitle || (url ? url.split('/').pop() : '')}`}
          </h3>
          <div className="flex gap-3">
            <button onClick={togglePlayerState} className="text-white hover:text-blue-400">
              {playerState === "fullscreen" ? <Minimize2 size={playerState === "minimized" ? 14 : 18} /> : 
               playerState === "minimized" ? <Maximize2 size={14} /> : <Maximize2 size={18} />}
            </button>
            <button onClick={onClose} className="text-white hover:text-blue-400">
              <X size={playerState === "minimized" ? 14 : 18} />
            </button>
          </div>
        </div>
        
        {/* Bottom controls */}
        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 ${playerState === "minimized" ? "hidden opacity-0 group-hover:opacity-100 group-hover:block" : ""}`}>
          {/* Progress bar */}
          <div className="flex items-center mb-2">
            <span className="text-white text-xs mr-2">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max="100"
              value={(currentTime / duration) * 100 || 0}
              onChange={handleSeek}
              className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-white text-xs ml-2">{formatTime(duration)}</span>
          </div>
          
          {/* Control buttons */}
          <div className="flex justify-between items-center">
            <button onClick={togglePlay} className="text-white hover:text-blue-400">
              {isPlaying ? <Pause size={playerState === "minimized" ? 14 : 18} /> : <Play size={playerState === "minimized" ? 14 : 18} />}
            </button>
            <button onClick={toggleMute} className="text-white hover:text-blue-400">
              {isMuted ? <VolumeX size={playerState === "minimized" ? 14 : 18} /> : <Volume2 size={playerState === "minimized" ? 14 : 18} />}
            </button>
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
    </div>
  );
};

export default VideoPlayer;