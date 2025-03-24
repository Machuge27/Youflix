import React, { createContext, useContext, useState, useReducer } from 'react';
import { videoService } from '../services/videoService';

const VideoContext = createContext();

// Reducer for managing video state
const videoReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_WATCH_HISTORY':
      return {
        ...state,
        watchHistory: [
          action.payload,
          ...state.watchHistory.filter(video => video.id !== action.payload.id)
        ]
      };
    case 'ADD_TO_SAVED_VIDEOS':
      return {
        ...state,
        savedVideos: [...state.savedVideos, action.payload]
      };
    default:
      return state;
  }
};

export const VideoProvider = ({ children }) => {
  const [videoState, dispatch] = useReducer(videoReducer, {
    savedVideos: [],
    watchHistory: [],
    categories: []
  });

  const addToWatchHistory = (video) => {
    dispatch({ type: 'ADD_TO_WATCH_HISTORY', payload: video });
  };

  const saveVideo = async (videoData) => {
    try {
      const savedVideo = await videoService.saveVideo(videoData);
      dispatch({ type: 'ADD_TO_SAVED_VIDEOS', payload: savedVideo });
      return savedVideo;
    } catch (error) {
      console.error('Failed to save video', error);
      throw error;
    }
  };

  return (
    <VideoContext.Provider 
      value={{ 
        videoState, 
        addToWatchHistory, 
        saveVideo 
      }}
    >
      {children}
    </VideoContext.Provider>
  );
};

export const useVideo = () => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error('useVideo must be used within a VideoProvider');
  }
  return context;
};