import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { VideoProvider } from './context/VideoContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
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
                <ProtectedRoute>
                  <VideoLibraryPage />
                </ProtectedRoute>
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
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
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