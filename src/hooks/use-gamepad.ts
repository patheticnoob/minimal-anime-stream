import { useState, useEffect, useRef } from 'react';

export interface GamepadState {
  connected: boolean;
  gamepad: Gamepad | null;
  buttonPressed: number | null;
}

export function useGamepad() {
  const [gamepadState, setGamepadState] = useState<GamepadState>({
    connected: false,
    gamepad: null,
    buttonPressed: null,
  });
  
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastButtonStateRef = useRef<boolean[]>([]);
  const buttonPressTimeoutRef = useRef<number | null>(null);

  const pollGamepad = () => {
    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[0] || gamepads[1] || gamepads[2] || gamepads[3];

    if (gamepad) {
      // Detect button presses (only trigger on new press, not hold)
      let pressedButton: number | null = null;
      gamepad.buttons.forEach((button, index) => {
        const wasPressed = lastButtonStateRef.current[index] || false;
        const isPressed = button.pressed;
        
        if (isPressed && !wasPressed) {
          pressedButton = index;
          console.log('🎮 Button pressed:', index);
        }
        lastButtonStateRef.current[index] = isPressed;
      });

      // Update state with proper change detection
      if (pressedButton !== null) {
        // Clear any existing timeout
        if (buttonPressTimeoutRef.current) {
          clearTimeout(buttonPressTimeoutRef.current);
        }

        setGamepadState({
          connected: true,
          gamepad,
          buttonPressed: pressedButton,
        });

        // Clear button press after a short delay to ensure React can process it
        buttonPressTimeoutRef.current = window.setTimeout(() => {
          setGamepadState((prev) => ({
            ...prev,
            buttonPressed: null,
          }));
          buttonPressTimeoutRef.current = null;
        }, 100);
      } else {
        setGamepadState((prev) => {
          // Only update if connection state changed
          if (!prev.connected) {
            return { connected: true, gamepad, buttonPressed: null };
          }
          return prev;
        });
      }
    } else {
      setGamepadState({
        connected: false,
        gamepad: null,
        buttonPressed: null,
      });
      lastButtonStateRef.current = [];
    }
  };

  useEffect(() => {
    const animate = () => {
      pollGamepad();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    const handleGamepadConnected = (e: GamepadEvent) => {
      console.log('🎮 Gamepad connected:', e.gamepad.id);
    };

    const handleGamepadDisconnected = (e: GamepadEvent) => {
      console.log('🎮 Gamepad disconnected:', e.gamepad.id);
    };

    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (buttonPressTimeoutRef.current) {
        clearTimeout(buttonPressTimeoutRef.current);
      }
    };
  }, []);

  return gamepadState;
}

export const GAMEPAD_BUTTONS = {
  A: 0,
  B: 1,
  X: 2,
  Y: 3,
  LB: 4,
  RB: 5,
  LT: 6,
  RT: 7,
  SELECT: 8,
  START: 9,
  L3: 10,
  R3: 11,
  DPAD_UP: 12,
  DPAD_DOWN: 13,
  DPAD_LEFT: 14,
  DPAD_RIGHT: 15,
};