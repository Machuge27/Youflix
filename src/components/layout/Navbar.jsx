import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  HomeIcon, 
  FilmIcon, 
  UserIcon, 
  SearchIcon, 
  LogoutIcon,
  MenuIcon,
  XIcon
} from '@heroicons/react/solid';
import { useAuth } from '../../context/AuthContext';
import videoService from '../../services/videoService';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const { user, logout } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();

  // Responsive check
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1080);
    };
    
    // Check on mount and add resize listener
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Cleanup listener
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Search functionality
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);
    
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);
  
  // Handle click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSearchResults && !event.target.closest('.search-container')) {
        setShowSearchResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSearchResults]);

  const performSearch = async (query) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    
    try {
      // Assuming videoService has a search method
      const results = await videoService.searchVideos(query);
      setSearchResults(results);
      setShowSearchResults(true);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Only navigate if there's a search query
    if (searchQuery.trim()) {
      // Navigate to search page with the query parameter
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      
      // Reset search field and close results
      setSearchQuery('');
      setShowSearchResults(false);
    }
    
    // Close search bar on mobile after search
    if (isMobile) {
      setShowSearch(false);
    }
  };

  const navigateToVideo = (videoId, currentTime) => {
    navigate(`/watch/${videoId}?t=${encodeURIComponent(currentTime || '0:00')}`);
    setShowSearchResults(false);
    setSearchQuery('');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (showSearch) setShowSearch(false);
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  const formatDuration = (duration) => {
    return duration || "0:00";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-md z-50 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/" className="text-red-600 font-bold text-2xl">
            Youflix 
          </Link>

          {/* Navigation Links - Desktop */}
          {!isMobile && (
            <div className="flex space-x-4 ml-6">
              <Link 
                to="/" 
                className="text-gray-300 hover:text-white flex items-center space-x-1"
              >
                <HomeIcon className="h-5 w-5" />
                <span>Home</span>
              </Link>
              <Link 
                to="/library" 
                className="text-gray-300 hover:text-white flex items-center space-x-1"
              >
                <FilmIcon className="h-5 w-5" />
                <span>Library</span>
              </Link>
            </div>
          )}
        </div>

        {/* Desktop: Search Bar */}
        {!isMobile && (
          <div className="flex-grow max-w-xl mx-6 relative search-container">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search videos, categories..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  onFocus={() => {
                    if (searchResults.length > 0) {
                      setShowSearchResults(true);
                    }
                  }}
                />
                {isSearching ? (
                  <div className="absolute right-3 top-2.5">
                    <div className="h-5 w-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                )}
              </div>
            </form>
            
            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 rounded-lg shadow-lg overflow-hidden z-50">
                <div className="max-h-96 overflow-y-auto">
                  {searchResults.map((video) => (
                    <div 
                      key={video.id}
                      className="px-4 py-2 hover:bg-gray-800 cursor-pointer"
                      onClick={() => navigateToVideo(video.videoId, video.currentTime)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-16 h-12 bg-gray-800 rounded overflow-hidden">
                          <img 
                            src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{video.title}</p>
                          <p className="text-xs text-gray-400">{video.channelName}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-500">{formatDuration(video.duration)}</span>
                            {video.savedAt && (
                              <span className="text-xs text-gray-500">{formatDate(video.savedAt)}</span>
                            )}
                            <span className="text-xs px-1.5 py-0.5 bg-gray-700 text-gray-300 rounded">{video.category}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="px-4 py-2 border-t border-gray-800">
                    <button 
                      onClick={handleSearch}
                      className="w-full text-center text-sm text-red-600 hover:text-red-500"
                    >
                      View all results for "{searchQuery}"
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Desktop: User Profile & Actions */}
        {!isMobile && (
          <div className="flex items-center space-x-4">
            <Link 
              to="/profile" 
              className="text-gray-300 hover:text-white flex items-center space-x-2"
            >
              <UserIcon className="h-6 w-6" />
              <span>{user?.username}</span>
            </Link>
            <button 
              onClick={logout} 
              className="text-red-600 hover:text-red-500 flex items-center space-x-1"
            >
              <LogoutIcon className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        )}

        {/* Mobile: Action Icons */}
        {isMobile && (
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleSearch}
              className="text-gray-300 hover:text-white p-1"
            >
              <SearchIcon className="h-6 w-6" />
            </button>
            <Link 
              to="/profile" 
              className="text-gray-300 hover:text-white p-1"
            >
              <UserIcon className="h-6 w-6" />
            </Link>
            <button 
              onClick={toggleMobileMenu}
              className="text-gray-300 hover:text-white p-1"
            >
              {mobileMenuOpen ? (
                <XIcon className="h-6 w-6" />
              ) : (
                <MenuIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Mobile: Search Bar */}
      {isMobile && showSearch && (
        <div className="mt-3 search-container">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search videos, categories..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                autoFocus
                onFocus={() => {
                  if (searchResults.length > 0) {
                    setShowSearchResults(true);
                  }
                }}
              />
              {isSearching ? (
                <div className="absolute right-3 top-2.5">
                  <div className="h-5 w-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              )}
            </div>
          </form>
          
          {/* Mobile Search Results */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="mt-2 bg-gray-900 rounded-lg shadow-lg overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                {searchResults.map((video) => (
                  <div 
                    key={video.id}
                    className="p-3 border-b border-gray-800 hover:bg-gray-800 cursor-pointer"
                    onClick={() => navigateToVideo(video.videoId, video.currentTime)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-16 h-12 bg-gray-800 rounded overflow-hidden">
                        <img 
                          src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{video.title}</p>
                        <p className="text-xs text-gray-400">{video.channelName}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">{formatDuration(video.duration)}</span>
                          <span className="text-xs px-1.5 py-0.5 bg-gray-700 text-gray-300 rounded">{video.category}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="p-3 border-t border-gray-800">
                  <button 
                    onClick={handleSearch}
                    className="w-full text-center text-sm text-red-600 hover:text-red-500"
                  >
                    View all results
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mobile: Menu */}
      {isMobile && mobileMenuOpen && (
        <div className="mt-3 bg-gray-900 rounded-lg p-4 flex flex-col space-y-4">
          <Link 
            to="/" 
            className="text-gray-300 hover:text-white flex items-center space-x-2 py-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            <HomeIcon className="h-5 w-5" />
            <span>Home</span>
          </Link>
          <Link 
            to="/library" 
            className="text-gray-300 hover:text-white flex items-center space-x-2 py-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            <FilmIcon className="h-5 w-5" />
            <span>Library</span>
          </Link>
          <div className="border-t border-gray-700 pt-2">
            <button 
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              className="text-red-600 hover:text-red-500 flex items-center space-x-2 py-2 w-full"
            >
              <LogoutIcon className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;