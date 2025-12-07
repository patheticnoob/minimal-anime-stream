import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RetroVideoPlayerUIProps {
  title: string;
  showControls: boolean;
  onClose: () => void;
}

export function RetroVideoPlayerUI({ title, showControls, onClose }: RetroVideoPlayerUIProps) {
  return (
    <>
      <motion.div
        className="absolute top-4 right-4 z-[100]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: showControls ? 1 : 0, y: showControls ? 0 : -20 }}
      >
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          className="bg-black/80 hover:bg-black border-2 border-[#FF69B4] text-[#FF69B4] font-mono uppercase"
        >
          <X className="h-6 w-6" />
        </Button>
      </motion.div>

      <motion.div
        className="absolute top-4 left-4 z-[90]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: showControls ? 1 : 0, y: showControls ? 0 : -20 }}
      >
        <h2 className="text-[#FF69B4] text-lg font-mono uppercase tracking-wider bg-black/80 px-4 py-2 border-2 border-[#FF69B4]" style={{
          textShadow: '0 0 10px #FF69B4'
        }}>
          {title}
        </h2>
      </motion.div>
    </>
  );
}
