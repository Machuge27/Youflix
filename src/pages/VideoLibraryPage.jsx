import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getVideos } from "../services/videoService";
import VideoGrid from "../components/videos/VideoGrid";
import Navbar from "../components/layout/Navbar";

const VideoLibraryPage = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  
//   useEffect(() => {
//     const fetchVideos = async () => {
//       try {
//         const data = await getVideos();
//         setVideos(data);
//       } catch (error) {
//         console.error("Failed to fetch videos:", error);
//       }
//     };
//     fetchVideos();
//   }, []);

    

  const categories = [
    { title: "Recently Saved", key: "recent" },
    { title: "Frequently Watched", key: "frequent" },
    { title: "All Categories", key: "categories" },
  ];

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      <div className="mt-6 px-6">
        {categories.map((category) => (
          <div key={category.key} className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">{category.title}</h2>
            <VideoGrid videos={videos} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoLibraryPage;
