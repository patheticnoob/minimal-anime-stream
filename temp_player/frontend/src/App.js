import { useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import VideoPlayer from "./components/VideoPlayer";
import { Play } from "lucide-react";

const Home = () => {
  const [videoUrl, setVideoUrl] = useState("");
  const [showPlayer, setShowPlayer] = useState(false);

  // Example HLS video URLs for demo
  const demoVideos = [
    {
      name: "Big Buck Bunny",
      url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&q=80",
    },
    {
      name: "Sintel",
      url: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
      poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1920&q=80",
    },
    {
      name: "Custom URL",
      url: "custom",
      poster: "",
    },
  ];

  const [selectedDemo, setSelectedDemo] = useState(demoVideos[0]);
  const [customUrl, setCustomUrl] = useState("");

  const handlePlayVideo = () => {
    if (selectedDemo.url === "custom") {
      if (customUrl) {
        setVideoUrl(customUrl);
        setShowPlayer(true);
      }
    } else {
      setVideoUrl(selectedDemo.url);
      setShowPlayer(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Hotstar-Like Video Player
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            A beautiful, feature-rich HLS video player with adaptive streaming, quality selection, 
            playback speed control, and keyboard shortcuts.
          </p>
        </div>

        {!showPlayer ? (
          <div className="max-w-4xl mx-auto">
            {/* Video Selection */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-gray-700">
              <h2 className="text-2xl font-semibold text-white mb-6">Select a Video</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {demoVideos.map((video, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedDemo(video)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                      selectedDemo.name === video.name
                        ? "border-blue-500 bg-blue-500/20"
                        : "border-gray-600 bg-gray-700/30 hover:border-gray-500"
                    }`}
                    data-testid={`demo-video-${index}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        selectedDemo.name === video.name ? "bg-blue-500" : "bg-gray-600"
                      }`}>
                        <Play size={24} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{video.name}</h3>
                        {video.url !== "custom" && (
                          <p className="text-gray-400 text-sm truncate">HLS Stream</p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {selectedDemo.url === "custom" && (
                <div className="mb-6">
                  <label className="block text-white mb-2 font-medium">Enter HLS Video URL (.m3u8)</label>
                  <input
                    type="text"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://example.com/video/playlist.m3u8"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="custom-url-input"
                  />
                </div>
              )}

              <button
                onClick={handlePlayVideo}
                disabled={selectedDemo.url === "custom" && !customUrl}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 shadow-lg"
                data-testid="play-video-button"
              >
                <Play size={24} />
                Play Video
              </button>
            </div>

            {/* Features List */}
            <div className="mt-8 bg-gray-800/30 backdrop-blur-lg rounded-2xl p-8 border border-gray-700">
              <h2 className="text-2xl font-semibold text-white mb-4">Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                <div className="flex items-start gap-2">
                  <span className="text-blue-400">✓</span>
                  <span>HLS Adaptive Streaming</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-400">✓</span>
                  <span>Quality Selection (Auto, 360p, 480p, 720p, 1080p)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-400">✓</span>
                  <span>Playback Speed Control (0.5x - 2x)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-400">✓</span>
                  <span>Forward/Backward Skip (10 seconds)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-400">✓</span>
                  <span>Fullscreen Mode</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-400">✓</span>
                  <span>Volume Control with Mute</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-400">✓</span>
                  <span>Keyboard Shortcuts (Space, F, M, Arrows)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-400">✓</span>
                  <span>Auto-hide Controls</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-400">✓</span>
                  <span>Buffer Progress Indicator</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-400">✓</span>
                  <span>Beautiful Gradient UI</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            <button
              onClick={() => setShowPlayer(false)}
              className="mb-4 px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              data-testid="back-button"
            >
              ← Back to Selection
            </button>
            
            <div className="aspect-video w-full">
              <VideoPlayer
                src={videoUrl}
                poster={selectedDemo.poster}
                autoPlay={true}
              />
            </div>

            {/* Keyboard Shortcuts Guide */}
            <div className="mt-6 bg-gray-800/30 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">Keyboard Shortcuts</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-gray-300">
                  <kbd className="px-2 py-1 bg-gray-700 rounded text-white font-mono">Space</kbd> Play/Pause
                </div>
                <div className="text-gray-300">
                  <kbd className="px-2 py-1 bg-gray-700 rounded text-white font-mono">F</kbd> Fullscreen
                </div>
                <div className="text-gray-300">
                  <kbd className="px-2 py-1 bg-gray-700 rounded text-white font-mono">M</kbd> Mute
                </div>
                <div className="text-gray-300">
                  <kbd className="px-2 py-1 bg-gray-700 rounded text-white font-mono">→</kbd> Skip +10s
                </div>
                <div className="text-gray-300">
                  <kbd className="px-2 py-1 bg-gray-700 rounded text-white font-mono">←</kbd> Skip -10s
                </div>
                <div className="text-gray-300">
                  <kbd className="px-2 py-1 bg-gray-700 rounded text-white font-mono">↑</kbd> Volume Up
                </div>
                <div className="text-gray-300">
                  <kbd className="px-2 py-1 bg-gray-700 rounded text-white font-mono">↓</kbd> Volume Down
                </div>
                <div className="text-gray-300">
                  <kbd className="px-2 py-1 bg-gray-700 rounded text-white font-mono">K</kbd> Play/Pause
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
