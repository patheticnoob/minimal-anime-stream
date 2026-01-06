import { useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGamepadCursor } from '@/hooks/use-gamepad-cursor';
import { useGamepad, GAMEPAD_BUTTONS } from '@/hooks/use-gamepad';
import { useTheme } from '@/hooks/use-theme';

export function GamepadCursor() {
  const { cursorPosition, isVisible, simulateClick } = useGamepadCursor();
  const { buttonPressed } = useGamepad({ enableButtonEvents: true });
  const { theme } = useTheme();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as any;
      setIsFullscreen(
        Boolean(
          doc.fullscreenElement ||
            doc.webkitFullscreenElement ||
            doc.mozFullScreenElement ||
            doc.msFullscreenElement,
        ),
      );
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    handleFullscreenChange();

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const scrollAtCursor = useCallback(
    (direction: 'up' | 'down') => {
      const delta = direction === 'up' ? -200 : 200;
      const startElement = document.elementFromPoint(cursorPosition.x, cursorPosition.y);

      const findScrollableParent = (node: Element | null): HTMLElement | null => {
        let current = node instanceof HTMLElement ? node : null;

        while (current) {
          const style = window.getComputedStyle(current);
          const canScroll =
            /(auto|scroll)/.test(style.overflowY) &&
            current.scrollHeight > current.clientHeight;

          if (canScroll) {
            return current;
          }

          current = current.parentElement;
        }

        return null;
      };

      const target = findScrollableParent(startElement);

      if (target) {
        target.scrollBy({ top: delta, behavior: 'smooth' });
        return;
      }

      window.scrollBy({ top: delta, behavior: 'smooth' });
    },
    [cursorPosition],
  );

  const triggerBackAction = useCallback(() => {
    const eventInit: KeyboardEventInit = {
      key: 'b',
      code: 'KeyB',
      bubbles: true,
      cancelable: true,
    };

    document.dispatchEvent(new KeyboardEvent('keydown', eventInit));
    document.dispatchEvent(new KeyboardEvent('keyup', eventInit));
  }, []);

  useEffect(() => {
    if (isFullscreen || buttonPressed === null) return;

    if (buttonPressed === GAMEPAD_BUTTONS.A) {
      simulateClick('left');
      return;
    }

    if (buttonPressed === GAMEPAD_BUTTONS.X) {
      scrollAtCursor('up');
      return;
    }

    if (buttonPressed === GAMEPAD_BUTTONS.Y) {
      scrollAtCursor('down');
      return;
    }

    if (buttonPressed === GAMEPAD_BUTTONS.B) {
      triggerBackAction();
    }
  }, [buttonPressed, simulateClick, scrollAtCursor, triggerBackAction, isFullscreen]);

  // Theme-based cursor styles
  const getCursorStyle = () => {
    switch (theme) {
      case 'retro':
        return {
          bg: 'bg-[#FF69B4]',
          border: 'border-[#FF1493]',
          shadow: 'shadow-[0_0_20px_rgba(255,105,180,0.8)]',
          glow: 'drop-shadow(0_0_10px_rgba(255,105,180,1))',
        };
      case 'nothing':
        return {
          bg: 'bg-[#ff4d4f]',
          border: 'border-red-500',
          shadow: 'shadow-[0_0_20px_rgba(255,77,79,0.8)]',
          glow: 'drop-shadow(0_0_10px_rgba(255,77,79,1))',
        };
      default:
        return {
          bg: 'bg-blue-500',
          border: 'border-blue-400',
          shadow: 'shadow-[0_0_20px_rgba(59,130,246,0.8)]',
          glow: 'drop-shadow(0_0_10px_rgba(59,130,246,1))',
        };
    }
  };

  const style = getCursorStyle();

  return (
    <AnimatePresence>
      {isVisible && !isFullscreen && (
        <motion.div
          className="fixed pointer-events-none z-[9999]"
          style={{
            left: cursorPosition.x,
            top: cursorPosition.y,
            transform: 'translate(-50%, -50%)',
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className={`relative flex items-center justify-center ${style.glow}`}>
            {/* Outer ring - centered */}
            <div
              className={`absolute w-8 h-8 rounded-full border-4 ${style.border} ${style.shadow} animate-ping`}
              style={{ animationDuration: '1.5s', left: '-6px', top: '-6px' }}
            />
            {/* Inner dot */}
            <div className={`w-4 h-4 rounded-full ${style.bg} border-2 ${style.border} ${style.shadow}`} />
            {/* Center dot */}
            <div className="absolute w-1 h-1 bg-white rounded-full" style={{ left: '7px', top: '7px' }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}