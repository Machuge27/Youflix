import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

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

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search logic
    console.log('Searching for:', searchQuery);
    if (isMobile) {
      setShowSearch(false);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (showSearch) setShowSearch(false);
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (mobileMenuOpen) setMobileMenuOpen(false);
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
          <form onSubmit={handleSearch} className="flex-grow max-w-xl mx-6">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search videos, categories..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-red-600"
              />
              <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            </div>
          </form>
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
        <div className="mt-3">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search videos, categories..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                autoFocus
              />
              <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            </div>
          </form>
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