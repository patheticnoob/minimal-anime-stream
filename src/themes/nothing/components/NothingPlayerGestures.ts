import { useState, useRef, useEffect, type TouchEvent } from "react";

export interface UsePlayerGesturesProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onVolumeChange: (volume: number) => void;
  onSeek: (time: number) => void;
}

const DOUBLE_TAP_WINDOW = 300;
const DOUBLE_TAP_DISTANCE = 100;
const SINGLE_TAP_DELAY = 300;

export function usePlayerGestures({
  videoRef,
  isPlaying,
  volume,
  currentTime,
  onPlayPause,
  onVolumeChange,
  onSeek,
}: UsePlayerGesturesProps) {
  // State for visual feedback
  const [doubleTapAction, setDoubleTapAction] = useState<{ side: 'left' | 'right'; seconds: number } | null>(null);
  const [swipeAction, setSwipeAction] = useState<{ type: 'volume' | 'brightness'; value: number } | null>(null);
  const [centerAction, setCenterAction] = useState<{ type: 'play' | 'pause' } | null>(null);

  // Refs for gesture tracking
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTapRef = useRef<{ time: number; x: number } | null>(null);
  const doubleTapTimerRef = useRef<number | null>(null);
  const singleTapTimerRef = useRef<number | null>(null); // New ref for single tap delay
  const seekAccumulatorRef = useRef<number>(0);
  const isSwipingRef = useRef(false);
  const swipeDirectionRef = useRef<'vertical' | 'horizontal' | null>(null);
  const initialValueRef = useRef<number>(0); // Stores initial volume/brightness on swipe start
  const controlsVisibleRef = useRef(false);

  useEffect(() => {
    controlsVisibleRef.current = false;
  }, []);

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    isSwipingRef.current = false;
    swipeDirectionRef.current = null;
    
    // Determine zone for swipe initialization
    const rect = e.currentTarget.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const width = rect.width;
    
    if (x < width / 3) {
      initialValueRef.current = volume;
    } else if (x > (width * 2) / 3) {
      initialValueRef.current = volume;
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touchStartRef.current.y - touch.clientY; // Up is positive

    // Determine swipe direction if not yet determined
    if (!swipeDirectionRef.current) {
      if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
        swipeDirectionRef.current = Math.abs(deltaY) > Math.abs(deltaX) ? 'vertical' : 'horizontal';
      }
    }

    // Handle Vertical Swipe
    if (swipeDirectionRef.current === 'vertical') {
      isSwipingRef.current = true;
      if (e.cancelable) e.preventDefault(); // Prevent scrolling

      const rect = e.currentTarget.getBoundingClientRect();
      const startX = touchStartRef.current.x - rect.left;
      const width = rect.width;
      const height = rect.height;
      
      // Sensitivity: Full height = 100% change
      const change = deltaY / (height * 0.6); 

      if (startX < width / 3) {
        // Left Side: Brightness
        const newVal = Math.max(0, Math.min(1, initialValueRef.current + change));
        onVolumeChange(newVal);
        setSwipeAction({ type: 'volume', value: newVal });
      } else if (startX > (width * 2) / 3) {
        // Right Side: Volume
        const newVal = Math.max(0, Math.min(1, initialValueRef.current + change));
        onVolumeChange(newVal);
        setSwipeAction({ type: 'volume', value: newVal });
      }
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    const touchEnd = e.changedTouches[0];
    const now = Date.now();
    
    // Clear swipe feedback
    if (isSwipingRef.current) {
      setTimeout(() => setSwipeAction(null), 500);
      touchStartRef.current = null;
      return;
    }

    if (!touchStartRef.current) return;

    // It's a tap
    const rect = e.currentTarget.getBoundingClientRect();
    const x = touchEnd.clientX - rect.left;
    const width = rect.width;
    
    // Determine Zone
    let zone: 'left' | 'center' | 'right' = 'center';
    if (x < width / 3) zone = 'left';
    else if (x > (width * 2) / 3) zone = 'right';

    // Check for Double Tap
    const isDoubleTap = lastTapRef.current &&
      now - lastTapRef.current.time < DOUBLE_TAP_WINDOW &&
      Math.abs(touchEnd.clientX - lastTapRef.current.x) < DOUBLE_TAP_DISTANCE;

    if (isDoubleTap && zone !== 'center') {
      // Handle Double Tap (Seek) - DO NOT TOGGLE CONTROLS
      
      // Cancel any pending single tap action
      if (singleTapTimerRef.current) {
        clearTimeout(singleTapTimerRef.current);
        singleTapTimerRef.current = null;
      }

      if (doubleTapTimerRef.current) {
        clearTimeout(doubleTapTimerRef.current);
      }

      const seconds = zone === 'left' ? -10 : 10;
      seekAccumulatorRef.current += seconds;
      
      setDoubleTapAction({ 
        side: zone === 'left' ? 'left' : 'right', 
        seconds: Math.abs(seekAccumulatorRef.current) 
      });

      // Schedule the seek
      doubleTapTimerRef.current = window.setTimeout(() => {
        onSeek(currentTime + seekAccumulatorRef.current);
        seekAccumulatorRef.current = 0;
        setDoubleTapAction(null);
        doubleTapTimerRef.current = null;
      }, 600); // Wait for more taps

      lastTapRef.current = null; // Reset tap tracking
      // DO NOT call toggleControls here - double tap should not affect controls
    } else {
      // Handle Single Tap (Potential)
      if (zone === 'center') {
        // Center Tap: Play/Pause ONLY (no fullscreen toggle)
        // Check actual video state for accurate animation
        const video = videoRef.current;
        const willBePlaying = video ? video.paused : !isPlaying;

        onPlayPause();
        setCenterAction({ type: willBePlaying ? 'play' : 'pause' });
        setTimeout(() => setCenterAction(null), 600);
      } else {
        // Side Tap: Show controls with auto-hide (or hide if already visible)
        // Delay to allow for double tap detection
        if (singleTapTimerRef.current) {
          clearTimeout(singleTapTimerRef.current);
        }
        
        singleTapTimerRef.current = window.setTimeout(() => {
          // Side tap: Just toggle controls visibility, no fullscreen
          // This will be handled by the parent component's control visibility logic
          singleTapTimerRef.current = null;
        }, SINGLE_TAP_DELAY);
      }
      
      lastTapRef.current = { time: now, x: touchEnd.clientX };
    }

    touchStartRef.current = null;
  };

  return {
    gestureHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    overlayProps: {
      doubleTapAction,
      swipeAction,
      centerAction,
    }
  };
}