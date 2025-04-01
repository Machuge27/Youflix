import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import videoService from "../services/videoService";
import Navbar from "../components/layout/Navbar";
import { Edit, User, Clock, Film, Heart, Bookmark, Settings } from "lucide-react";
import VideoGrid from "../components/videos/VideoGrid";

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

  useEffect(() => {
    const fetchUserVideos = async () => {
      try {
        // In a real application, these would be separate API calls
        const history = await videoService.getWatchHistory();
        const favorites = await videoService.getFavorites();
        const saved = await videoService.getSavedVideos();
        
        setVideos({
          watchHistory: history || [],
          favorites: favorites || [],
          savedVideos: saved || []
        });
      } catch (error) {
        console.error("Failed to fetch user videos:", error);
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
          {activeTab !== "settings" ? (
            <>
              <h2 className="text-xl font-semibold mb-4">
                {activeTab === "watchHistory" ? "Watch History" : 
                 activeTab === "favorites" ? "Favorites" : 
                 "Saved Videos"}
              </h2>
              <VideoGrid videos={getActiveVideos()} />
              
              {getActiveVideos().length === 0 && (
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
                
                <button 
                  onClick={logout}
                  className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 mt-4"
                >
                  Sign Out
                </button>
              </div>
              {/* Additional Buttons */}
              <div className="mt-8 text-center">
                <button 
                  className="px-6 py-3 bg-blue-600 rounded hover:bg-blue-700 text-white font-medium mx-2"
                >
                  Get the Mobile App
                </button>
                <button 
                  className="px-6 py-3 bg-green-600 rounded hover:bg-green-700 text-white font-medium mx-2"
                >
                  Get the Chrome Extension
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;