import { useState, useEffect, useRef } from 'react';

export interface CursorPosition {
  x: number;
  y: number;
}

export function useGamepadCursor() {
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const lastMoveTimeRef = useRef<number>(Date.now());
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const updateCursor = () => {
      const gamepads = navigator.getGamepads();
      const currentGamepad = gamepads[0] || gamepads[1] || gamepads[2] || gamepads[3];
      
      if (!currentGamepad) {
        setIsVisible(false);
        animationFrameRef.current = requestAnimationFrame(updateCursor);
        return;
      }

      // Show cursor when gamepad is connected
      setIsVisible(true);

      // Right stick for cursor movement (axes 2 and 3)
      const xAxis = currentGamepad.axes[2] || 0;
      const yAxis = currentGamepad.axes[3] || 0;

      const threshold = 0.15;
      const sensitivity = 8;

      if (Math.abs(xAxis) > threshold || Math.abs(yAxis) > threshold) {
        setCursorPosition((prev) => {
          const newX = Math.max(0, Math.min(window.innerWidth, prev.x + xAxis * sensitivity));
          const newY = Math.max(0, Math.min(window.innerHeight, prev.y + yAxis * sensitivity));
          
          // Trigger hover events
          const element = document.elementFromPoint(newX, newY);
          if (element) {
            const hoverEvent = new MouseEvent('mouseover', {
              bubbles: true,
              cancelable: true,
              clientX: newX,
              clientY: newY,
            });
            element.dispatchEvent(hoverEvent);
          }

          return { x: newX, y: newY };
        });

        lastMoveTimeRef.current = Date.now();
      }

      animationFrameRef.current = requestAnimationFrame(updateCursor);
    };

    // Initialize cursor at center
    setCursorPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });

    animationFrameRef.current = requestAnimationFrame(updateCursor);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Auto-hide in fullscreen after inactivity
  useEffect(() => {
    const checkInactivity = setInterval(() => {
      const gamepads = navigator.getGamepads();
      const hasGamepad = !!(gamepads[0] || gamepads[1] || gamepads[2] || gamepads[3]);
      
      if (!hasGamepad) {
        setIsVisible(false);
        return;
      }

      const isFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );

      if (isFullscreen && Date.now() - lastMoveTimeRef.current > 3000) {
        setIsVisible(false);
      } else if (!isFullscreen) {
        setIsVisible(true);
      }
    }, 500);

    return () => clearInterval(checkInactivity);
  }, []);

  const simulateClick = (button: 'left' | 'right' = 'left') => {
    const element = document.elementFromPoint(cursorPosition.x, cursorPosition.y);
    if (element) {
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        clientX: cursorPosition.x,
        clientY: cursorPosition.y,
        button: button === 'left' ? 0 : 2,
      });
      element.dispatchEvent(clickEvent);
    }
  };

  return {
    cursorPosition,
    isVisible,
    simulateClick,
  };
}