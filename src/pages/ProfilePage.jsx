import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import videoService from "../services/videoService";
import Navbar from "../components/layout/Navbar";
import { Edit, User, Clock, Film, Heart, Bookmark, Settings, Blocks, LayoutGrid, DatabaseBackup } from "lucide-react";
import VideoPlayer from "../components/videos/VideoPlayer";
import { toast } from 'react-toastify';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("watchHistory");
  const [videos, setVideos] = useState({
    watchHistory: [],
    favorites: [],
    savedVideos: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.displayName || "User",
    bio: "Video enthusiast and content creator",
    joinDate: "January 2023"
  });
  
  // New state for video player
  const [currentVideo, setCurrentVideo] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUserVideos = async () => {
      setIsLoading(true);
      try {
        // In a real application, these would be separate API calls
        const history = await videoService.getWatchHistory();
        const favorites = await videoService.getFavorites();
        const saved = await videoService.getSavedVideos();
        
        // Transform the data to ensure we can handle the structure shown in the image
        const transformVideos = (videoArray) => {
          return Array.isArray(videoArray) ? videoArray.map(video => {
            // Check if video is already in the expected format or needs transformation
            if (video.category && video.channelName && video.videoId) {
              return {
                id: video.id || video.videoId,
                title: video.title || "Untitled Video",
                thumbnail: `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`,
                duration: video.duration || "0:00",
                channelName: video.channelName,
                category: video.category,
                url: video.url,
                savedAt: video.savedAt,
                currentTime: video.currentTime || "0:00"
              };
            }
            return video; // Return as is if already in expected format
          }) : [];
        };
        
        console.log("Fetched favorites:", favorites);
        setIsLoading(false);
        
        setVideos({
          watchHistory: transformVideos(history || []),
          favorites: transformVideos(favorites || []),
          savedVideos: transformVideos(saved || [])
        });
      } catch (error) {
        console.error("Failed to fetch user videos:", error);
        toast.error("Failed to load videos. Please try again later.");
        setIsLoading(false);
      }
    };
    
    fetchUserVideos();
  }, []);

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    // Here you would send the updated profile to your backend
    setIsEditing(false);
  };

  const getActiveVideos = () => {
    return videos[activeTab] || [];
  };

  // Format timestamp for display (converts "1:35:38" format or seconds to readable format)
  const formatDuration = (duration) => {
    if (!duration) return "--:--";
    
    // If already in string format like "1:35:38", return as is
    if (typeof duration === 'string' && duration.includes(':')) {
      return duration;
    }
    
    // If in seconds, convert to HH:MM:SS
    const seconds = parseInt(duration, 10);
    if (isNaN(seconds)) return "--:--";
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Format date from timestamp
  const formatSavedDate = (timestamp) => {
    if (!timestamp) return "";
    
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return timestamp; // Return original if parsing fails
    }
  };

  // Play a video
  const playVideo = (video) => {
    setCurrentVideo(video);
    setShowPlayer(true);
  };

  // Close the video player
  const closePlayer = () => {
    setShowPlayer(false);
    setCurrentVideo(null);
  };

  // Function to play the next video when current one ends
  const playNextVideo = useCallback(() => {
    if (!currentVideo) return;
    
    const activeVideosList = getActiveVideos();
    const currentIndex = activeVideosList.findIndex(v => v.id === currentVideo.id);
    
    if (currentIndex >= 0 && currentIndex < activeVideosList.length - 1) {
      // Play next video in the list
      setCurrentVideo(activeVideosList[currentIndex + 1]);
    } else if (activeVideosList.length > 0) {
      // Loop back to first video if at the end of the list
      setCurrentVideo(activeVideosList[0]);
    }
  }, [currentVideo, getActiveVideos]);

  // Handle video end
  const handleVideoEnd = useCallback(() => {
    playNextVideo();
  }, [playNextVideo]);

  // Handle videos backup
  const handleBackup = useCallback(async () => {
    try {
      const response = await videoService.backupVideos();
      if (response.status === 'success') {
        toast.success(`${response.message}`);
      } else {
        toast.error(`${response.message}`);
      }
    } catch (error) {
      console.error("Error during backup:", error);
      toast.error("An error occurred. Please try again.");
    }
  }, []);

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-10">
        {/* Profile Header */}
        <div className="lg:w-[calc(100%-10rem)] sm:w-full mx-auto border-dotted border-gray-900 bg-gray-900 rounded-lg p-6 my-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mt-4 p-2">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User size={48} className="text-gray-400" />
                )}
              </div>
            </div>
            
            <div className="flex-1">
              {isEditing ? (
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                      className="w-full bg-gray-800 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Bio</label>
                    <textarea
                      value={profile.bio}
                      onChange={(e) => setProfile({...profile, bio: e.target.value})}
                      className="w-full bg-gray-800 rounded px-3 py-2 text-white"
                      rows="3"
                    ></textarea>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      type="submit" 
                      className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <h1 className="text-2xl font-bold">{profile.name}</h1>
                      <p className="text-gray-400 mt-1">Member since {profile.joinDate}</p>
                    </div>
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="p-2 rounded hover:bg-gray-800"
                    >
                      <Edit size={18} />
                    </button>
                  </div>
                  <p className="mt-3">{profile.bio}</p>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Profile Tabs */}
          <div className="mb-6">
            <div className="flex overflow-x-auto border-b border-gray-800 mb-4">
              <button 
                onClick={() => setActiveTab("watchHistory")}
                className={`py-3 px-4 font-medium flex items-center ${activeTab === 'watchHistory' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
                title="History"
              >
                <Clock size={18} className="mr-2" />
                <span className="hidden sm:inline">Watch History</span>
              </button>
              <button 
                onClick={() => setActiveTab("favorites")}
                className={`py-3 px-4 font-medium flex items-center ${activeTab === 'favorites' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
                title="Favorites"
              >
                <Heart size={18} className="mr-2" />
                <span className="hidden sm:inline">Favorites</span>
              </button>
              <button 
                onClick={() => setActiveTab("savedVideos")}
                className={`py-3 px-4 font-medium flex items-center ${activeTab === 'savedVideos' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
                title="Saved Videos"
              >
                <Bookmark size={18} className="mr-2" />
                <span className="hidden sm:inline">Saved Videos</span>
              </button>
              <button 
                onClick={() => setActiveTab("settings")}
                className={`py-3 px-4 font-medium flex items-center ${activeTab === 'settings' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
                title="Settings"
              >
                <Settings size={18} className="mr-2" />
                <span className="hidden sm:inline">Settings</span>
              </button>
            </div>
            
            {/* Tab Content */}
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : activeTab !== "settings" ? (
              <>
                <h2 className="text-xl font-semibold mb-4">
            {activeTab === "watchHistory" ? "Watch History" : 
             activeTab === "favorites" ? "Favorites" : 
             "Saved Videos"}
                </h2>
                
                {getActiveVideos().length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getActiveVideos().map((video, index) => (
                <div 
                  key={video.id || index} 
                  className="bg-gray-900 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-800 transition-colors"
                  onClick={() => playVideo(video)}
                >
                  <div className="relative">
              <img 
                src={video.thumbnail || `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`} 
                alt={video.title} 
                className="w-full h-48 object-cover"
              />
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 px-2 py-1 text-xs rounded">
                {formatDuration(video.duration)}
              </div>
              {video.currentTime && video.currentTime !== "0:00" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                  <div 
                    className="h-full bg-red-500" 
                    style={{ 
                width: `${(parseFloat(video.currentTime.split(':').reduce((acc, time) => (60 * acc) + +time)) / 
                   parseFloat(video.duration.split(':').reduce((acc, time) => (60 * acc) + +time))) * 100}%` 
                    }}
                  ></div>
                </div>
              )}
                  </div>
                  <div className="p-4">
              <h3 className="font-medium line-clamp-2 mb-1">{video.title}</h3>
              <p className="text-gray-400 text-sm">
                {video.channelName}
                {video.category && <span className="ml-2 px-2 py-0.5 bg-gray-800 rounded-full text-xs">{video.category}</span>}
              </p>
              {video.savedAt && (
                <p className="text-gray-500 text-xs mt-2">
                  Saved on {formatSavedDate(video.savedAt)}
                </p>
              )}
                  </div>
                </div>
              ))}
            </div>
                ) : (
            <div className="text-center py-12">
              <Film size={48} className="mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl font-medium text-gray-400">No videos found</h3>
              <p className="text-gray-500 mt-2">
                {activeTab === "watchHistory" ? "Videos you watch will appear here" : 
                 activeTab === "favorites" ? "Your favorite videos will appear here" : 
                 "Videos you save will appear here"}
              </p>
            </div>
                )}
              </>
            ) : (
              <div className="bg-gray-900 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
                
                <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Email</h3>
              <p className="text-gray-400">{user?.email || "user@example.com"}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Preferences</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-gray-300">Autoplay videos</label>
                  <div className="relative inline-block w-12 h-6 bg-gray-700 rounded-full cursor-pointer">
              <input type="checkbox" className="sr-only" defaultChecked />
              <span className="block absolute left-1 top-1 bg-blue-500 w-4 h-4 rounded-full transition-transform duration-200 transform translate-x-6"></span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-gray-300">Email notifications</label>
                  <div className="relative inline-block w-12 h-6 bg-gray-700 rounded-full cursor-pointer">
              <input type="checkbox" className="sr-only" />
              <span className="block absolute left-1 top-1 bg-gray-400 w-4 h-4 rounded-full transition-transform duration-200"></span>
                  </div>
                </div>
              </div>
            </div>
            
            </div>
            <div className="flex flex-col sm:flex-row mt-8 gap-4">
              <button 
                onClick={logout}
                className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
              >
                Sign Out
              </button>
              <button 
                title="Get Mobile App"
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-white font-medium"
              >
                <LayoutGrid size={18} />
                <span className="font-[10px]">Get the Mobile App</span>
              </button>
              <button 
                title="Get browser extension"
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-white font-medium"
              >
                <Blocks size={18} />
                <span className="font-[10px]">Get the Browser Extension</span>
              </button>
              <button 
                title="Get browser extension"
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-green-700 rounded text-white font-medium"
                onClick={handleBackup}
              >
                <DatabaseBackup size={18} />
                <span className="font-[10px]">Backup</span>
              </button>
            </div>
              </div>
            )}
          </div>
              </div>
              
              {/* Video Player */}
      {showPlayer && currentVideo && (
        <VideoPlayer 
          videoId={currentVideo.id || currentVideo.videoId}
          videoTitle={currentVideo.title}
          url={currentVideo.url}
          onClose={closePlayer}
          onEnded={handleVideoEnd}
        />
      )}
    </div>
  );
};

export default ProfilePage;