import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import videoService from "../services/videoService";
import VideoCategoryRow from "../components/videos/VideoCategoryRow";
import VideoPlayer from "../components/videos/VideoPlayer";
import Navbar from "../components/layout/Navbar";
import { Play, Clock, Flame, Grid, Search } from "lucide-react";

const VideoLibraryPage = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentVideo, setCurrentVideo] = useState(null);
  
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const data = await videoService.getVideos();
        setVideos(data);
      } catch (error) {
        console.error("Failed to fetch videos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();

    // Check if there's a video ID in the URL (for direct linking)
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get('v');
    if (videoId) {
      handlePlayFromUrl(videoId);
    }
  }, []);

  const handlePlayFromUrl = async (videoId) => {
    try {
      const videoDetails = await videoService.getVideoById(videoId);
      if (videoDetails) {
        setCurrentVideo(videoDetails);
      }
    } catch (error) {
      console.error("Failed to load video:", error);
    }
  };

  const handlePlayVideo = (video) => {
    setCurrentVideo(video);
    // Update URL for sharing without page refresh
    const url = new URL(window.location);
    url.searchParams.set('v', video.id);
    window.history.pushState({}, '', url);
  };

  const handleClosePlayer = () => {
    setCurrentVideo(null);
    // Remove video ID from URL
    const url = new URL(window.location);
    url.searchParams.delete('v');
    window.history.pushState({}, '', url);
  };

  // Filter videos based on search term
  const filteredVideos = videos.filter(video => 
    video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group videos by category
  const getVideosByCategory = (category) => {
    return filteredVideos.filter(video => video.category === category);
  };

  // Get recently added videos (assuming videos have a dateAdded property)
  const getRecentVideos = () => {
    return [...filteredVideos]
      .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
      .slice(0, 8);
  };

  // Get trending videos (could be based on views or other metrics)
  const getTrendingVideos = () => {
    return [...filteredVideos]
      .sort((a, b) => b.views - a.views)
      .slice(0, 8);
  };

  // Get all unique categories
  const categories = [...new Set(filteredVideos.map(video => video.category))];

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      
      {/* Search bar */}
      <div className="pt-6 px-6">
        <div className="relative max-w-2xl mx-auto mb-8">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 rounded-lg bg-gray-800 border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            placeholder="Search videos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="px-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {searchTerm ? (
              // Search results
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 flex items-center">
                  <Search size={20} className="mr-2" />
                  Search Results ({filteredVideos.length})
                </h2>
                <VideoCategoryRow 
                  title="" 
                  videos={filteredVideos} 
                  onPlay={handlePlayVideo}
                />
              </div>
            ) : (
              // Regular categories
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center">
                    <Clock size={20} className="mr-2" />
                    Recently Added
                  </h2>
                  <VideoCategoryRow 
                    title="" 
                    videos={getRecentVideos()} 
                    onPlay={handlePlayVideo}
                  />
                </div>
                
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center">
                    <Flame size={20} className="mr-2" />
                    Trending Now
                  </h2>
                  <VideoCategoryRow 
                    title="" 
                    videos={getTrendingVideos()} 
                    onPlay={handlePlayVideo}
                  />
                </div>
                
                <div className="mb-4">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center">
                    <Grid size={20} className="mr-2" />
                    Browse Categories
                  </h2>
                </div>
                
                {categories.map(category => (
                  <VideoCategoryRow 
                    key={category}
                    title={category} 
                    videos={getVideosByCategory(category)} 
                    onPlay={handlePlayVideo}
                  />
                ))}
              </>
            )}
          </>
        )}
      </div>
      
      {/* Video Player */}
      {currentVideo && (
        <VideoPlayer 
          videoId={currentVideo.id} 
          onClose={handleClosePlayer} 
        />
      )}
    </div>
  );
};

export default VideoLibraryPage;