import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

interface GamepadSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GamepadSettings({ isOpen, onClose }: GamepadSettingsProps) {
  const [settings, setSettings] = useState({
    enabled: true,
    sensitivity: 0.5,
    vibration: true,
    autoScroll: true,
    focusScale: 1.02,
    focusRingSize: 4,
  });

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("gamepadSettings");
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load gamepad settings:", e);
      }
    }
  }, []);

  // Save settings to localStorage
  const updateSetting = <K extends keyof typeof settings>(
    key: K,
    value: typeof settings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem("gamepadSettings", JSON.stringify(newSettings));
    
    // Apply CSS variables for focus styles
    if (key === "focusScale" || key === "focusRingSize") {
      document.documentElement.style.setProperty(
        "--gamepad-focus-scale",
        String(newSettings.focusScale)
      );
      document.documentElement.style.setProperty(
        "--gamepad-ring-size",
        `${newSettings.focusRingSize}px`
      );
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-[#0B0F19] border-2 border-blue-500/30 rounded-xl max-w-md w-full p-6 shadow-2xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Gamepad2 className="h-6 w-6 text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Gamepad Settings</h2>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Settings */}
          <div className="space-y-6">
            {/* Enable Gamepad */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white font-medium">Enable Gamepad</Label>
                <p className="text-xs text-gray-400 mt-1">
                  Turn gamepad navigation on/off
                </p>
              </div>
              <Switch
                checked={settings.enabled}
                onCheckedChange={(checked) => updateSetting("enabled", checked)}
              />
            </div>

            {/* Sensitivity */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-white font-medium">Sensitivity</Label>
                <span className="text-sm text-blue-400">
                  {Math.round(settings.sensitivity * 100)}%
                </span>
              </div>
              <Slider
                value={[settings.sensitivity]}
                onValueChange={([value]) => updateSetting("sensitivity", value)}
                min={0.1}
                max={1}
                step={0.1}
                className="w-full"
              />
              <p className="text-xs text-gray-400">
                Adjust navigation speed and responsiveness
              </p>
            </div>

            {/* Vibration */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white font-medium">Vibration Feedback</Label>
                <p className="text-xs text-gray-400 mt-1">
                  Haptic feedback on actions
                </p>
              </div>
              <Switch
                checked={settings.vibration}
                onCheckedChange={(checked) => updateSetting("vibration", checked)}
              />
            </div>

            {/* Auto Scroll */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white font-medium">Auto Scroll</Label>
                <p className="text-xs text-gray-400 mt-1">
                  Automatically scroll to focused items
                </p>
              </div>
              <Switch
                checked={settings.autoScroll}
                onCheckedChange={(checked) => updateSetting("autoScroll", checked)}
              />
            </div>

            {/* Focus Scale */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-white font-medium">Focus Scale</Label>
                <span className="text-sm text-blue-400">
                  {settings.focusScale.toFixed(2)}x
                </span>
              </div>
              <Slider
                value={[settings.focusScale]}
                onValueChange={([value]) => updateSetting("focusScale", value)}
                min={1}
                max={1.1}
                step={0.01}
                className="w-full"
              />
              <p className="text-xs text-gray-400">
                Size increase when item is focused
              </p>
            </div>

            {/* Focus Ring Size */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-white font-medium">Focus Ring Size</Label>
                <span className="text-sm text-blue-400">
                  {settings.focusRingSize}px
                </span>
              </div>
              <Slider
                value={[settings.focusRingSize]}
                onValueChange={([value]) => updateSetting("focusRingSize", value)}
                min={2}
                max={8}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-gray-400">
                Thickness of the focus indicator ring
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-gray-400 text-center">
              Press START button to access sidebar navigation
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}