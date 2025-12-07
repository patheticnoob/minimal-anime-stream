interface VideoProgressBarProps {
  currentTime: number;
  duration: number;
  buffered: number;
  onSeek: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export function VideoProgressBar({
  currentTime,
  duration,
  buffered,
  onSeek,
}: VideoProgressBarProps) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="relative h-1.5 bg-white/20 cursor-pointer mb-4 rounded-full overflow-hidden hover:h-2 transition-all"
      onClick={onSeek}
      data-testid="video-progress-bar"
    >
      <div
        className="absolute top-0 left-0 h-full bg-white/30 pointer-events-none"
        style={{ width: `${buffered}%` }}
      />
      <div
        className="absolute top-0 left-0 h-full bg-gradient-to-r from-sky-500 to-blue-600 pointer-events-none transition-all"
        style={{ width: `${progress}%` }}
      />
      <div
        className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg opacity-0 hover:opacity-100 pointer-events-none transition-opacity"
        style={{
          left: `${progress}%`,
          transform: "translate(-50%, -50%)",
        }}
      />
    </div>
  );
}
