import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface VideoSkipButtonsProps {
  showSkipIntro: boolean;
  showSkipOutro: boolean;
  onSkipIntro: () => void;
  onSkipOutro: () => void;
  onNext?: () => void;
  nextTitle?: string;
}

export function VideoSkipButtons({
  showSkipIntro,
  showSkipOutro,
  onSkipIntro,
  onSkipOutro,
  onNext,
  nextTitle,
}: VideoSkipButtonsProps) {
  return (
    <>
      {/* Skip Intro Button */}
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
              className="bg-white/90 hover:bg-white text-black font-semibold px-6 py-2 rounded-md shadow-lg"
            >
              Skip Intro
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip Outro & Next Episode Buttons */}
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
              className="bg-white/90 hover:bg-white text-black font-semibold px-6 py-2 rounded-md shadow-lg"
            >
              Skip Outro
            </Button>
            {onNext && nextTitle && (
              <Button
                onClick={onNext}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-md shadow-lg"
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
