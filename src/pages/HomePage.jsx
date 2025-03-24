import React from 'react';
import Navbar from '../components/layout/Navbar';
import VideoGrid from '../components/videos/VideoGrid';
import VideoCategoryRow from '../components/videos/VideoCategoryRow';

const HomePage = () => {
  // Mock data - replace with actual API calls
  const videoSections = [
    {
      title: 'Recently Saved',
      videos: [
        { 
          id: 1, 
          videoId: 'dQw4w9WgXcQ', 
          title: 'Sample Video 1', 
          channelName: 'Sample Channel' 
        },
        // More videos...
      ]
    },
    {
      title: 'Frequently Watched',
      videos: [
        { 
          id: 2, 
          videoId: 'aqz-KE-bpKQ', 
          title: 'Sample Video 2', 
          channelName: 'Another Channel' 
        },
        // More videos...
      ]
    },
    {
      title: 'Technology',
      videos: [
        { 
          id: 3, 
          videoId: 'X7R9iY4hbUU', 
          title: 'Tech Video', 
          channelName: 'Tech Channel' 
        },
        // More videos...
      ]
    }
  ];

//   const [categories, setCategories] = useState([]);

//   useEffect(() => {
//     api.get("videos/categories/")
//       .then((response) => setCategories(response.data))
//       .catch((error) => console.error("Error fetching categories", error));
//   }, []);

    const categories = [
    {
      id: 1,
      name: 'Recently Saved',
      videos: [
        { 
          id: 1, 
          videoId: 'dQw4w9WgXcQ', 
          title: 'Sample Video 1',
          channelName: 'Sample Channel'
        },
        // More videos...
        ]
    },
    {
      id: 2,
      name: 'Frequently Watched',
      videos: [
        { 
          id: 2, 
          videoId: 'aqz-KE-bpKQ', 
          title: 'Sample Video 2',
          channelName: 'Another Channel'
        },
        // More videos...
        ]
    },
    {
      id: 3,
      name: 'Technology',
      videos: [
        { 
          id: 3, 
          videoId: 'X7R9iY4hbUU', 
          title: 'Tech Video',
          channelName: 'Tech Channel'
        },
        // More videos...
        ]
    }
    ];

  return (
    <div className="min-h-screen bg-netflix-black text-white">
      <Navbar />
      <div className="pt-20">
        <VideoGrid sections={videoSections} />
        <div className="bg-black min-h-screen p-6">
            {categories.map((category) => (
                <VideoCategoryRow key={category.id} title={category.name} videos={category.videos} />
            ))}
            </div>
      </div>
    </div>
  );
};

export default HomePage;