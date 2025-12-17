import { motion, AnimatePresence } from "framer-motion";
import { Gamepad2, Wifi, WifiOff } from "lucide-react";
import { useGamepad } from "@/hooks/use-gamepad";

interface ControllerStatusProps {
  showDetails?: boolean;
}

export function ControllerStatus({ showDetails = true }: ControllerStatusProps) {
  const { connected, gamepad } = useGamepad();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--nothing-elevated,white/5)] border border-[var(--nothing-border,white/10)] rounded-lg p-4"
    >
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-full ${connected ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
          <Gamepad2 className={`w-6 h-6 ${connected ? 'text-green-400' : 'text-red-400'}`} />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-[var(--nothing-fg,white)]">Controller</h3>
            {connected ? (
              <Wifi className="w-4 h-4 text-green-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-400" />
            )}
          </div>
          
          <p className="text-sm text-[var(--nothing-gray-4,#8a90a6)] mt-0.5">
            {connected ? (
              showDetails && gamepad ? (
                <span className="truncate block max-w-[300px]">{gamepad.id}</span>
              ) : (
                "Connected"
              )
            ) : (
              "Press any button to connect"
            )}
          </p>
        </div>

        <AnimatePresence>
          {connected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="w-2 h-2 rounded-full bg-green-400 animate-pulse"
            />
          )}
        </AnimatePresence>
      </div>

      {showDetails && connected && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 pt-4 border-t border-[var(--nothing-border,white/10)]"
        >
          <h4 className="text-xs font-semibold text-[var(--nothing-gray-4,#8a90a6)] uppercase tracking-wider mb-2">
            Controls
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs text-[var(--nothing-gray-4,#8a90a6)]">
            <div>• A: Select</div>
            <div>• B: Back</div>
            <div>• D-Pad: Navigate</div>
            <div>• Start: Home</div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
