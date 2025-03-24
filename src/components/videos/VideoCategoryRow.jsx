import React from "react";
import VideoCard from "./VideoCard";

const VideoCategoryRow = ({ title, videos }) => {
  return (
    <div className="mb-6">
      <h2 className="text-white text-xl font-bold mb-2">{title}</h2>
      <div className="flex overflow-x-scroll scrollbar-hide space-x-4 p-2">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
};

export default VideoCategoryRow;
