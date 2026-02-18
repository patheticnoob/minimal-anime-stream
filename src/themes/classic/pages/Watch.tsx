import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks/use-auth';
import { usePlayerLogic } from '@/hooks/use-player-logic';
import { ClassicVideoPlayer } from '@/components/ClassicVideoPlayer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ClassicWatch() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    videoSource,
    videoTitle,
    videoTracks,
    videoIntro,
    videoOutro,
    videoHeaders,
    handleProgressUpdate,
    closePlayer,
    playNextEpisode,
    nextEpisodeTitle,
    animeProgress,
  } = usePlayerLogic(isAuthenticated, 'v4');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  if (!videoSource) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">No video selected</h2>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Button
            variant="ghost"
            onClick={closePlayer}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <h1 className="text-white font-semibold text-lg truncate max-w-2xl">
            {videoTitle}
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={closePlayer}
            className="text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Video Player */}
      <div className="w-full h-screen">
        <ClassicVideoPlayer
          src={videoSource}
          title={videoTitle}
          tracks={videoTracks}
          intro={videoIntro}
          outro={videoOutro}
          headers={videoHeaders}
          onProgress={handleProgressUpdate}
          onEnded={playNextEpisode}
          initialTime={animeProgress?.currentTime || 0}
          nextEpisodeTitle={nextEpisodeTitle}
        />
      </div>

      {/* Next Episode Notification */}
      <AnimatePresence>
        {nextEpisodeTitle && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-40"
          >
            <div className="bg-black/90 backdrop-blur-sm rounded-lg p-4 shadow-xl border border-white/20">
              <p className="text-white text-sm mb-2">Up Next:</p>
              <p className="text-white font-semibold">{nextEpisodeTitle}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
