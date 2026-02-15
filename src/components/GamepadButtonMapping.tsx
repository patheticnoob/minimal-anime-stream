import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gamepad2, RotateCcw } from 'lucide-react';
import { GAMEPAD_BUTTONS } from '@/hooks/use-gamepad';

interface ButtonMapping {
  button: number;
  action: string;
  description: string;
}

const DEFAULT_MAPPINGS: ButtonMapping[] = [
  { button: GAMEPAD_BUTTONS.A, action: 'Select / Click', description: 'Primary action button' },
  { button: GAMEPAD_BUTTONS.B, action: 'Back / Cancel', description: 'Go back or close' },
  { button: GAMEPAD_BUTTONS.X, action: 'Double Click', description: 'Quick double-click action' },
  { button: GAMEPAD_BUTTONS.Y, action: 'Watchlist', description: 'Add/remove from watchlist' },
  { button: GAMEPAD_BUTTONS.LB, action: 'Previous', description: 'Previous episode/item' },
  { button: GAMEPAD_BUTTONS.RB, action: 'Next', description: 'Next episode/item' },
  { button: GAMEPAD_BUTTONS.LT, action: 'Volume Down', description: 'Decrease volume' },
  { button: GAMEPAD_BUTTONS.RT, action: 'Volume Up', description: 'Increase volume' },
  { button: GAMEPAD_BUTTONS.START, action: 'Menu', description: 'Open sidebar menu' },
  { button: GAMEPAD_BUTTONS.SELECT, action: 'Settings', description: 'Open settings' },
  { button: GAMEPAD_BUTTONS.DPAD_UP, action: 'Navigate Up', description: 'Move selection up' },
  { button: GAMEPAD_BUTTONS.DPAD_DOWN, action: 'Navigate Down', description: 'Move selection down' },
  { button: GAMEPAD_BUTTONS.DPAD_LEFT, action: 'Navigate Left', description: 'Move selection left' },
  { button: GAMEPAD_BUTTONS.DPAD_RIGHT, action: 'Navigate Right', description: 'Move selection right' },
  { button: GAMEPAD_BUTTONS.L3, action: 'Unused', description: 'Left stick click' },
  { button: GAMEPAD_BUTTONS.R3, action: 'Cursor Mode', description: 'Right stick for cursor' },
];

const BUTTON_NAMES: Record<number, string> = {
  [GAMEPAD_BUTTONS.A]: 'A',
  [GAMEPAD_BUTTONS.B]: 'B',
  [GAMEPAD_BUTTONS.X]: 'X',
  [GAMEPAD_BUTTONS.Y]: 'Y',
  [GAMEPAD_BUTTONS.LB]: 'LB',
  [GAMEPAD_BUTTONS.RB]: 'RB',
  [GAMEPAD_BUTTONS.LT]: 'LT',
  [GAMEPAD_BUTTONS.RT]: 'RT',
  [GAMEPAD_BUTTONS.START]: 'START',
  [GAMEPAD_BUTTONS.SELECT]: 'SELECT',
  [GAMEPAD_BUTTONS.DPAD_UP]: 'D-PAD ↑',
  [GAMEPAD_BUTTONS.DPAD_DOWN]: 'D-PAD ↓',
  [GAMEPAD_BUTTONS.DPAD_LEFT]: 'D-PAD ←',
  [GAMEPAD_BUTTONS.DPAD_RIGHT]: 'D-PAD →',
  [GAMEPAD_BUTTONS.L3]: 'L3',
  [GAMEPAD_BUTTONS.R3]: 'R3',
};

export function GamepadButtonMapping() {
  const [mappings, setMappings] = useState<ButtonMapping[]>(DEFAULT_MAPPINGS);

  useEffect(() => {
    const saved = localStorage.getItem('gamepadButtonMappings');
    if (saved) {
      try {
        setMappings(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load button mappings:', e);
      }
    }
  }, []);

  const resetToDefaults = () => {
    setMappings(DEFAULT_MAPPINGS);
    localStorage.setItem('gamepadButtonMappings', JSON.stringify(DEFAULT_MAPPINGS));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Gamepad2 className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--nothing-fg,white)]">Controller Mapping</h2>
            <p className="text-sm text-[var(--nothing-gray-4,#8a90a6)]">
              Default button configuration for gamepad navigation
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={resetToDefaults}
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset to Defaults
        </Button>
      </div>

      <div className="bg-[var(--nothing-elevated,white/5)] border border-[var(--nothing-border,white/10)] rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mappings.map((mapping) => (
            <motion.div
              key={mapping.button}
              className="flex items-center gap-4 p-4 bg-[var(--nothing-bg,#0B0F19)] border border-[var(--nothing-border,white/10)] rounded-lg"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Badge
                variant="outline"
                className="min-w-[80px] justify-center text-center font-mono text-sm border-blue-500/50 text-blue-400"
              >
                {BUTTON_NAMES[mapping.button]}
              </Badge>
              <div className="flex-1">
                <p className="font-semibold text-[var(--nothing-fg,white)]">{mapping.action}</p>
                <p className="text-xs text-[var(--nothing-gray-4,#8a90a6)]">{mapping.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <h3 className="font-semibold text-blue-400 mb-2">Virtual Cursor Mode</h3>
        <p className="text-sm text-[var(--nothing-gray-4,#8a90a6)]">
          Use the <strong>right analog stick</strong> to control a virtual cursor that appears when your controller is connected.
          The cursor supports hover effects and will auto-hide after 3 seconds of inactivity in fullscreen mode.
        </p>
      </div>
    </div>
  );
}