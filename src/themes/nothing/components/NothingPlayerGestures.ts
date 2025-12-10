import { useState, useRef, useEffect, type TouchEvent, type RefObject } from "react";

interface UsePlayerGesturesProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  isPlaying: boolean;
  togglePlay: () => void;
  seek: (time: number) => void;
  duration: number;
  currentTime: number;
  volume: number;
  setVolume: (vol: number) => void;
  brightness: number;
  setBrightness: (val: number) => void;
  toggleControls: (force?: boolean) => void;
  areControlsVisible: boolean;
}

const DOUBLE_TAP_WINDOW = 300;
const DOUBLE_TAP_DISTANCE = 100;
const SINGLE_TAP_DELAY = 300;

export function usePlayerGestures({
  videoRef,
  isPlaying,
  togglePlay,
  seek,
  duration,
  currentTime,
  volume,
  setVolume,
  brightness,
  setBrightness,
  toggleControls,
  areControlsVisible,
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
  const controlsVisibleRef = useRef(areControlsVisible);

  useEffect(() => {
    controlsVisibleRef.current = areControlsVisible;
  }, [areControlsVisible]);

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
      initialValueRef.current = brightness;
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
        setBrightness(newVal);
        setSwipeAction({ type: 'brightness', value: newVal });
      } else if (startX > (width * 2) / 3) {
        // Right Side: Volume
        const newVal = Math.max(0, Math.min(1, initialValueRef.current + change));
        setVolume(newVal);
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
        seek(currentTime + seekAccumulatorRef.current);
        seekAccumulatorRef.current = 0;
        setDoubleTapAction(null);
        doubleTapTimerRef.current = null;
      }, 600); // Wait for more taps

      lastTapRef.current = null; // Reset tap tracking
      // DO NOT call toggleControls here - double tap should not affect controls
    } else {
      // Handle Single Tap (Potential)
      if (zone === 'center') {
        // Center Tap: Play/Pause + Show Controls (with auto-hide)
        togglePlay();
        toggleControls(true); // Always show controls on center tap
        setCenterAction({ type: isPlaying ? 'pause' : 'play' });
        setTimeout(() => setCenterAction(null), 600);
      } else {
        // Side Tap: Show controls with auto-hide (or hide if already visible)
        // Delay to allow for double tap detection
        if (singleTapTimerRef.current) {
          clearTimeout(singleTapTimerRef.current);
        }
        
        singleTapTimerRef.current = window.setTimeout(() => {
          // Always show controls and reset the auto-hide timer
          toggleControls(true);
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