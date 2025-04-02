import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  SearchIcon, 
  FilterIcon,
  ClockIcon,
  ChevronRightIcon
} from '@heroicons/react/solid';
import videoService from '../services/videoService';

const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: 'all',
    sortBy: 'relevance',
    duration: 'any'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Get search query from URL
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const queryParam = query.get('query');
    
    if (queryParam) {
      setSearchQuery(queryParam);
      // Reset pagination when search query changes
      setPage(1);
    }
  }, [location.search]);
  
  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const catData = await videoService.getCategories();
        setCategories(catData);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Fetch search results
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery) {
        setSearchResults([]);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const results = await videoService.searchVideos(searchQuery, filters, page);
        
        if (page === 1) {
          setSearchResults(results);
        } else {
          setSearchResults(prev => [...prev, ...results]);
        }
        
        // Check if there are more results to load
        setHasMore(results.length > 0);
        setError(null);
      } catch (error) {
        console.error("Search failed:", error);
        setError("Failed to load search results. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSearchResults();
  }, [searchQuery, filters, page]);
  
  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      setPage(1); // Reset pagination
    }
  };
  
  // Navigate to video
  const navigateToVideo = (videoId, currentTime = 0) => {
    // Format currentTime as seconds
    let timeParam = currentTime;
    
    // If it's in format like "7:35", convert to seconds
    if (typeof currentTime === 'string' && currentTime.includes(':')) {
      const [minutes, seconds] = currentTime.split(':').map(Number);
      timeParam = minutes * 60 + seconds;
    }
    
    navigate(`/watch/${videoId}?t=${timeParam}`);
  };
  
  // Toggle filters
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  // Update filters
  const updateFilter = (filterType, value) => {
    setFilters({
      ...filters,
      [filterType]: value
    });
    setPage(1); // Reset pagination when filters change
  };
  
  // Format duration
  const formatDuration = (duration) => {
    return duration || "0:00";
  };
  
  // Load more results
  const loadMoreResults = () => {
    setPage(prevPage => prevPage + 1);
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search videos, categories..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-red-600"
            />
            <SearchIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <button 
              type="button"
              onClick={toggleFilters}
              className="absolute right-3 top-3 text-gray-400 hover:text-white"
            >
              <FilterIcon className="h-6 w-6" />
            </button>
          </div>
        </form>
        
        {/* Filters */}
        {showFilters && (
          <div className="mb-6 bg-gray-800 p-4 rounded-lg">
            <h3 className="text-white font-medium mb-3">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-gray-400 mb-2 text-sm">Category</label>
                <select 
                  value={filters.category}
                  onChange={(e) => updateFilter('category', e.target.value)}
                  className="w-full bg-gray-700 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Sort By Filter */}
              <div>
                <label className="block text-gray-400 mb-2 text-sm">Sort By</label>
                <select 
                  value={filters.sortBy}
                  onChange={(e) => updateFilter('sortBy', e.target.value)}
                  className="w-full bg-gray-700 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="relevance">Relevance</option>
                  <option value="date">Upload Date</option>
                  <option value="views">View Count</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
              
              {/* Duration Filter */}
              <div>
                <label className="block text-gray-400 mb-2 text-sm">Duration</label>
                <select 
                  value={filters.duration}
                  onChange={(e) => updateFilter('duration', e.target.value)}
                  className="w-full bg-gray-700 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="any">Any Length</option>
                  <option value="short">Short</option>
                  <option value="medium">Medium</option>
                  <option value="long">Long</option>
                </select>
              </div>
            </div>
          </div>
        )}
        
        {/* Search Results */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white text-xl font-medium">
              {searchQuery ? `Results for "${searchQuery}"` : 'Popular Videos'}
            </h2>
            {searchResults.length > 0 && (
              <span className="text-gray-400 text-sm">{searchResults.length} videos found</span>
            )}
          </div>
          
          {isLoading && page === 1 ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-900/30 text-red-200 p-4 rounded-lg">
              {error}
            </div>
          ) : searchResults.length === 0 ? (
            <div className="bg-gray-800 p-8 rounded-lg text-center">
              <SearchIcon className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-white text-lg font-medium mb-2">No videos found</h3>
              <p className="text-gray-400">Try searching for something else or adjust your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {searchResults.map((video) => (
                <div 
                  key={`${video.videoId}-${video.currentTime || 0}`}
                  className="bg-gray-800/50 rounded-lg overflow-hidden flex flex-col sm:flex-row hover:bg-gray-700/50 transition-colors cursor-pointer"
                  onClick={() => navigateToVideo(video.videoId, video.currentTime || 0)}
                >
                  {/* Thumbnail */}
                  <div className="sm:w-64 aspect-video bg-gray-900 relative flex-shrink-0">
                    <img 
                      src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1 py-0.5 rounded">
                      {formatDuration(video.duration)}
                    </div>
                    {video.currentTime && video.durationInSeconds && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                        <div 
                          className="h-full bg-red-600"
                          style={{ width: `${(video.currentTime / video.durationInSeconds) * 100}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                  
                  {/* Video Info */}
                  <div className="p-4 flex-grow">
                    <h3 className="text-white font-medium text-lg mb-1 line-clamp-2">{video.title}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
                      <span>{video.viewCount} views</span>
                      <span>•</span>
                      <span>{video.uploadDate}</span>
                      {video.currentTime && (
                        <>
                          <span>•</span>
                          <span className="flex items-center text-red-400">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            Watched at {formatDuration(video.currentTime)}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center mb-3">
                      <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center mr-2">
                        <span className="text-white text-xs">{video.channelName?.charAt(0)}</span>
                      </div>
                      <span className="text-gray-300">{video.channelName}</span>
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-2">{video.description}</p>
                    <div className="mt-3">
                      <span className="inline-block px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded mr-2">
                        {video.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Loading Indicator for Pagination */}
          {isLoading && page > 1 && (
            <div className="flex justify-center mt-6">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
            </div>
          )}
          
          {/* View More Results Button */}
          {searchResults.length > 0 && !isLoading && hasMore && (
            <div className="flex justify-center mt-6">
              <button 
                className="flex items-center bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-full transition-colors"
                onClick={loadMoreResults}
              >
                View More Results
                <ChevronRightIcon className="h-5 w-5 ml-1" />
              </button>
            </div>
          )}
          
          {/* No More Results Message */}
          {searchResults.length > 0 && !isLoading && !hasMore && page > 1 && (
            <div className="text-center mt-6 text-gray-400">
              No more videos to show
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;