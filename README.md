# Custom YouTube Streaming App

## Overview
This project is a Netflix-like application built to organize, stream, and download YouTube videos saved through a browser extension. The application aims to enhance the user experience by providing categorized video displays, streaming, and download functionalities, while maintaining a smooth, ad-free experience.

---

## 📌 Features

### 1. Browser Extension (Video Saver)
- Allows users to save YouTube videos to the backend.
- Videos are saved with metadata:
  - Channel name
  - Current time (progress)
  - Duration
  - Saved timestamp
  - Title
  - URL
  - Video ID
  - Category
- Multiple categories can be selected for each video.

### 2. Web App (Frontend)
- Netflix-style UI for displaying videos.
- Sections:
  - Frequently Watched (Based on playback history)
  - Recently Saved
  - All Videos (Categorized)
- Users can:
  - Stream videos via embedded YouTube links.
  - Download videos via Y2mate API (Server-side or Local download).
  - Search, filter, and sort videos.
  - Import YouTube playlists via YouTube API.
  - Manage categories and edit metadata.

### 3. Backend (Django)
- Django API to handle:
  - Saving videos from the browser extension.
  - Fetching videos by category, most-watched, recently saved, etc.
  - Updating playback progress.
  - Managing categories and user data.
  - Downloading videos via Y2mate API.
  - Importing playlists via YouTube API.
- Database Structure:
  - Videos Table: `channelName`, `currentTime`, `duration`, `savedAt`, `title`, `url`, `videoId`, `category`
  - Categories Table: List of categories.
  - Users Table (Optional - for authentication).

---

## 🔍 Next Steps
1. Implement Backend API (Django) to handle all endpoints.
2. Build Frontend (React) with Netflix-style UI.
3. Integrate Y2mate API and YouTube API.
4. Connect Browser Extension to the backend.

---

## 💡 Additional Considerations
- Data Persistence: Ensuring the backend properly saves and serves video data.
- Scalability: Making the backend efficient for multiple users (if needed).
- User Authentication (Optional): To provide user-specific data.

 