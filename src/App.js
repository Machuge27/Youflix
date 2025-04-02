import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { VideoProvider } from './context/VideoContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import Watch from './pages/Watch';
import Search from './pages/Search';
import NotFound from './pages/NotFound';
import VideoLibraryPage from './pages/VideoLibraryPage';
import VideoPlayerPage from './pages/VideoPlayerPage';
import ProfilePage from './pages/ProfilePage';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <VideoProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<AuthPage />} />
            <Route 
              path="/" 
              element={
                // <ProtectedRoute>
                //   <HomePage />
                // </ProtectedRoute>
                  <HomePage />
              } 
            />
            <Route 
              path="/library" 
              element={
                  <VideoLibraryPage />
                //<ProtectedRoute>
                //</ProtectedRoute>
              } 
            />
            <Route 
              path="/video/:id" 
              element={
                <ProtectedRoute>
                  <VideoPlayerPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                  <ProfilePage />
                //<ProtectedRoute>
                //</ProtectedRoute>
              } 
            />
            {/* Use path pattern with * to handle any potential query params */}
            <Route path="/watch/:videoId/*" element={
                  <Watch />
                //<ProtectedRoute>
                //</ProtectedRoute>
              } />
              
              <Route path="/search" element={
                  <Search />
                //<ProtectedRoute>
                //</ProtectedRoute>
              } />
              {/* 404 Route */}
              <Route path="/not-found" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/not-found" replace />} />
          </Routes>
        </BrowserRouter>
      </VideoProvider>
      <ToastContainer 
        theme="dark" 
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </AuthProvider>
  );
}

export default App;