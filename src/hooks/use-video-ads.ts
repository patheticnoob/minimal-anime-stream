// FluidPlayer handles ads internally, this hook is no longer needed
// Keeping file for backward compatibility but functionality moved to FluidPlayer
export function useVideoAds() {
  return {
    adsLoaded: true,
    adPlaying: false,
    playAds: () => {},
  };
}
