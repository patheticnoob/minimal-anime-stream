/**
 * Example: Using VideoPlayer with API Integration
 * 
 * This file shows different ways to integrate the VideoPlayer component
 * with your backend API for a real streaming application.
 */

import React, { useState, useEffect } from 'react';
import VideoPlayer from '../components/VideoPlayer';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// ==========================================
// Example 1: Single Video Page
// ==========================================
export const SingleVideoPage = ({ videoId }) => {
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await axios.get(`${API}/videos/${videoId}`);
        setVideo(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchVideo();
  }, [videoId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading video...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Video Player */}
        <div className="aspect-video mb-8">
          <VideoPlayer
            src={video.hlsUrl}
            poster={video.thumbnail}
            autoPlay={false}
          />
        </div>

        {/* Video Info */}
        <div className="text-white">
          <h1 className="text-4xl font-bold mb-4">{video.title}</h1>
          <p className="text-gray-300 text-lg mb-4">{video.description}</p>
          <div className="flex gap-4 text-sm text-gray-400">
            <span>{video.views} views</span>
            <span>•</span>
            <span>{video.duration} mins</span>
            <span>•</span>
            <span>{video.uploadDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// Example 2: Video Gallery with Player
// ==========================================
export const VideoGallery = () => {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get(`${API}/videos`);
        setVideos(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching videos:', err);
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) {
    return <div className="text-white text-center p-8">Loading videos...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {selectedVideo ? (
        <div className="p-8">
          <button
            onClick={() => setSelectedVideo(null)}
            className="mb-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
          >
            ← Back to Gallery
          </button>
          <div className="max-w-7xl mx-auto">
            <div className="aspect-video">
              <VideoPlayer
                src={selectedVideo.hlsUrl}
                poster={selectedVideo.thumbnail}
                autoPlay={true}
              />
            </div>
            <div className="text-white mt-6">
              <h2 className="text-3xl font-bold">{selectedVideo.title}</h2>
              <p className="text-gray-300 mt-2">{selectedVideo.description}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8">
          <h1 className="text-4xl font-bold text-white mb-8">Video Gallery</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div
                key={video.id}
                onClick={() => setSelectedVideo(video)}
                className="cursor-pointer group"
              >
                <div className="relative aspect-video rounded-lg overflow-hidden mb-3">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white bg-opacity-0 group-hover:bg-opacity-90 rounded-full flex items-center justify-center transition-all duration-300">
                      <span className="text-2xl">▶</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-white font-semibold group-hover:text-blue-400 transition-colors">
                  {video.title}
                </h3>
                <p className="text-gray-400 text-sm mt-1">{video.duration} mins</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// Example 3: Continue Watching Feature
// ==========================================
export const ContinueWatching = () => {
  const [video, setVideo] = useState(null);
  const [watchProgress, setWatchProgress] = useState(0);

  useEffect(() => {
    // Fetch user's watch history from API
    const fetchWatchHistory = async () => {
      try {
        const response = await axios.get(`${API}/watch-history/current`);
        setVideo(response.data.video);
        setWatchProgress(response.data.progress); // Progress in seconds
      } catch (err) {
        console.error('Error fetching watch history:', err);
      }
    };

    fetchWatchHistory();
  }, []);

  const handleVideoProgress = (currentTime) => {
    // Save progress to backend every 10 seconds
    if (Math.floor(currentTime) % 10 === 0) {
      axios.post(`${API}/watch-history`, {
        videoId: video.id,
        progress: currentTime,
      }).catch(err => console.error('Error saving progress:', err));
    }
  };

  if (!video) {
    return <div className="text-white p-8">No videos in progress</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <h1 className="text-3xl font-bold text-white mb-6">Continue Watching</h1>
      <div className="max-w-7xl mx-auto">
        <div className="aspect-video">
          <VideoPlayer
            src={video.hlsUrl}
            poster={video.thumbnail}
            autoPlay={false}
            // You can add a custom prop to start from specific time
            // startTime={watchProgress}
          />
        </div>
        <p className="text-gray-400 mt-4">
          Resume from {Math.floor(watchProgress / 60)}:{String(Math.floor(watchProgress % 60)).padStart(2, '0')}
        </p>
      </div>
    </div>
  );
};

// ==========================================
// Example 4: Video with Recommendations
// ==========================================
export const VideoWithRecommendations = ({ videoId }) => {
  const [currentVideo, setCurrentVideo] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const fetchVideoAndRecommendations = async () => {
      try {
        const [videoRes, recsRes] = await Promise.all([
          axios.get(`${API}/videos/${videoId}`),
          axios.get(`${API}/videos/${videoId}/recommendations`),
        ]);
        setCurrentVideo(videoRes.data);
        setRecommendations(recsRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchVideoAndRecommendations();
  }, [videoId]);

  if (!currentVideo) {
    return <div className="text-white p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Video */}
          <div className="lg:col-span-2">
            <div className="aspect-video">
              <VideoPlayer
                src={currentVideo.hlsUrl}
                poster={currentVideo.thumbnail}
                autoPlay={false}
              />
            </div>
            <div className="text-white mt-6">
              <h1 className="text-3xl font-bold mb-2">{currentVideo.title}</h1>
              <p className="text-gray-300">{currentVideo.description}</p>
            </div>
          </div>

          {/* Recommendations */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-white mb-4">Up Next</h2>
            <div className="space-y-4">
              {recommendations.map((video) => (
                <div
                  key={video.id}
                  onClick={() => window.location.href = `/video/${video.id}`}
                  className="flex gap-3 cursor-pointer group"
                >
                  <div className="w-40 aspect-video rounded overflow-hidden flex-shrink-0">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold group-hover:text-blue-400 transition-colors line-clamp-2">
                      {video.title}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">{video.views} views</p>
                    <p className="text-gray-400 text-sm">{video.duration} mins</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// Example 5: Backend API Endpoints (Python/FastAPI)
// ==========================================

/*
Here's how your backend API might look:

# server.py

from fastapi import APIRouter, HTTPException
from typing import List
from pydantic import BaseModel

api_router = APIRouter(prefix="/api")

class Video(BaseModel):
    id: str
    title: str
    description: str
    hlsUrl: str
    thumbnail: str
    duration: int  # in minutes
    views: int
    uploadDate: str

class WatchHistory(BaseModel):
    videoId: str
    progress: float  # in seconds
    userId: str

@api_router.get("/videos", response_model=List[Video])
async def get_all_videos():
    # Fetch all videos from MongoDB
    videos = await db.videos.find({}, {"_id": 0}).to_list(100)
    return videos

@api_router.get("/videos/{video_id}", response_model=Video)
async def get_video(video_id: str):
    # Fetch single video from MongoDB
    video = await db.videos.find_one({"id": video_id}, {"_id": 0})
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    return video

@api_router.get("/videos/{video_id}/recommendations", response_model=List[Video])
async def get_recommendations(video_id: str):
    # Get recommended videos based on current video
    recommendations = await db.videos.find(
        {"id": {"$ne": video_id}},
        {"_id": 0}
    ).limit(10).to_list(10)
    return recommendations

@api_router.post("/watch-history")
async def save_watch_history(history: WatchHistory):
    # Save user's watch progress
    await db.watch_history.update_one(
        {"userId": history.userId, "videoId": history.videoId},
        {"$set": history.model_dump()},
        upsert=True
    )
    return {"status": "success"}

@api_router.get("/watch-history/current")
async def get_current_watch_history(user_id: str):
    # Get user's most recent watch history
    history = await db.watch_history.find_one(
        {"userId": user_id},
        {"_id": 0},
        sort=[("updatedAt", -1)]
    )
    if not history:
        return None
    
    # Fetch the video details
    video = await db.videos.find_one({"id": history["videoId"]}, {"_id": 0})
    return {
        "video": video,
        "progress": history["progress"]
    }
*/

export default {
  SingleVideoPage,
  VideoGallery,
  ContinueWatching,
  VideoWithRecommendations,
};
