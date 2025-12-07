import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface RetroVideoSkipButtonsProps {
  showSkipIntro: boolean;
  showSkipOutro: boolean;
  onSkipIntro: () => void;
  onSkipOutro: () => void;
  onNext?: () => void;
  nextTitle?: string;
}

export function RetroVideoSkipButtons({
  showSkipIntro,
  showSkipOutro,
  onSkipIntro,
  onSkipOutro,
  onNext,
  nextTitle,
}: RetroVideoSkipButtonsProps) {
  return (
    <>
      <AnimatePresence>
        {showSkipIntro && (
          <motion.div
            className="absolute bottom-24 right-8 z-20"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <Button
              onClick={onSkipIntro}
              className="bg-[#FF69B4] hover:bg-[#FF1493] text-black font-mono uppercase tracking-wider border-2 border-[#FF69B4] shadow-[0_0_10px_rgba(255,105,180,0.5)]"
            >
              Skip Intro
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSkipOutro && (
          <motion.div
            className="absolute bottom-24 right-8 z-20 flex gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <Button
              onClick={onSkipOutro}
              className="bg-[#FF69B4] hover:bg-[#FF1493] text-black font-mono uppercase tracking-wider border-2 border-[#FF69B4] shadow-[0_0_10px_rgba(255,105,180,0.5)]"
            >
              Skip Outro
            </Button>
            {onNext && nextTitle && (
              <Button
                onClick={onNext}
                className="bg-[#00FFAA] hover:bg-[#00DD88] text-black font-mono uppercase tracking-wider border-2 border-[#00FFAA] shadow-[0_0_10px_rgba(0,255,170,0.5)]"
              >
                Next Episode
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
