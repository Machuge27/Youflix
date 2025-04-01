import React, { useEffect, useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import videoService from '../services/videoService';
import VideoCategoryRow from '../components/videos/VideoCategoryRow';

const HomePage = () => {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoading(true);
      try {
        const response = await videoService.getVideos();
        setVideos(response);
      } catch (error) {
        console.error("Error fetching videos", error);
        setError("Failed to load videos. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, []);

  // Process videos into categories
  const organizeVideosByCategory = (videoList) => {
    // Create a map to hold category-based videos
    const categoryMap = new Map();
    
    // Special categories
    categoryMap.set('Recently Saved', []);
    categoryMap.set('Frequently Watched', []); // This would need logic to determine frequency
    
    // Sort videos by savedAt date (oldest first) for Recently Saved
    const sortedByDate = [...videoList].sort((a, b) => 
      new Date(a.savedAt) - new Date(b.savedAt)
    );
    
    // Add the 5 oldest videos to Recently Saved
    categoryMap.get('Recently Saved').push(...sortedByDate.slice(0, 5));
    
    // Group remaining videos by their category
    videoList.forEach(video => {
      if (video.category) {
        if (!categoryMap.has(video.category)) {
          categoryMap.set(video.category, []);
        }
        categoryMap.get(video.category).push(video);
      }
    });
    
    // Convert map to array of category objects
    const categories = Array.from(categoryMap, ([name, videos]) => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      videos
    })).filter(category => category?.videos.length > 0); // Only include categories with videos
    
    return categories;
  };

  // Organize videos into categories
  const videoCategories = videos?.length > 0 ? organizeVideosByCategory(videos) : [];

  // Fallback static data for development/testing
  const staticCategories = [
    // {
    //   id: 'recently-saved',
    //   name: 'Recently Saved',
    //   videos: [
    //     {
    //       id: 106,
    //       channelName: "Chris Brown",
    //       currentTime: "0:00",
    //       duration: "4:53",
    //       savedAt: "2025-03-31T08:29:02.832Z",
    //       title: "Pills & Automobiles (Official Video)",
    //       url: "https://www.youtube.com/watch?v=GTexe8c0eqw&list=RDlVNt1sUWyDU&index=2",
    //       videoId: "GTexe8c0eqw",
    //       category: "Hip-hop"
    //     },
    //     {
    //       id: 105,
    //       channelName: "QualityControlVEVO",
    //       currentTime: "0:03",
    //       duration: "4:02",
    //       savedAt: "2025-03-31T08:28:55.234Z",
    //       title: "Quality Control, Quavo, Nicki Minaj - She For Keeps (Official Music Video)",
    //       url: "https://www.youtube.com/watch?v=lVNt1sUWyDU&list=RDlVNt1sUWyDU&index=1",
    //       videoId: "lVNt1sUWyDU",
    //       category: "Hip-hop"
    //     }
    //   ]
    // },
    // {
    //   id: 'hip-hop',
    //   name: 'Hip-hop',
    //   videos: [
    //     {
    //       id: 106,
    //       channelName: "Chris Brown",
    //       currentTime: "0:00",
    //       duration: "4:53",
    //       savedAt: "2025-03-31T08:29:02.832Z",
    //       title: "Pills & Automobiles (Official Video)",
    //       url: "https://www.youtube.com/watch?v=GTexe8c0eqw&list=RDlVNt1sUWyDU&index=2",
    //       videoId: "GTexe8c0eqw",
    //       category: "Hip-hop"
    //     },
    //     {
    //       id: 105,
    //       channelName: "QualityControlVEVO",
    //       currentTime: "0:03",
    //       duration: "4:02",
    //       savedAt: "2025-03-31T08:28:55.234Z",
    //       title: "Quality Control, Quavo, Nicki Minaj - She For Keeps (Official Music Video)",
    //       url: "https://www.youtube.com/watch?v=lVNt1sUWyDU&list=RDlVNt1sUWyDU&index=1",
    //       videoId: "lVNt1sUWyDU",
    //       category: "Hip-hop"
    //     }
    //   ]
    // }
  ];

  // Use API organized data if available, otherwise fall back to static data
  const displayCategories = videoCategories.length > 0 ? videoCategories : staticCategories;

  return (
    <div className="min-h-screen bg-netflix-black text-white">
      <Navbar />
      <div className="pt-20">
        <div className="bg-black min-h-screen p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-xl">Loading videos...</p>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-xl text-red-500">{error}</p>
            </div>
          ) : displayCategories.length > 0 ? (
            displayCategories.map((category) => (
              <VideoCategoryRow 
                key={category.id} 
                title={category.name} 
                videos={category.videos} 
              />
            ))
          ) : (
            <div className="flex justify-center items-center h-64">
              <p className="text-xl">No videos found. Add some videos to get started!</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HomePage;