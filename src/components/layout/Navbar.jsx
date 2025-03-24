import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  HomeIcon, 
  FilmIcon, 
  UserIcon, 
  SearchIcon, 
  LogoutIcon 
} from '@heroicons/react/solid';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search logic
    console.log('Searching for:', searchQuery);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-md z-50 px-4 py-3 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center space-x-6">
        <Link to="/" className="text-red-600 font-bold text-2xl">
          StreamTube
        </Link>

        {/* Navigation Links */}
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
      </div>

      {/* Search Bar */}
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

      {/* User Profile & Actions */}
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
    </nav>
  );
};

export default Navbar;