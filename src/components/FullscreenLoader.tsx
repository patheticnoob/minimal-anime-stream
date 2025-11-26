import { motion } from "framer-motion";

interface FullscreenLoaderProps {
  label?: string;
  subLabel?: string;
}

export function FullscreenLoader({
  label = "Loading...",
  subLabel = "",
}: FullscreenLoaderProps) {
  return (
    <div className="fullscreen-loader" role="status" aria-live="polite">
      <div className="loader-backdrop" />
      <motion.div
        className="loader-content"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
      >
        <motion.div
          className="sharingan-container"
          animate={{ rotate: 360 }}
          transition={{ 
            rotate: { duration: 2, ease: "linear", repeat: Infinity }
          }}
          aria-hidden="true"
        >
          {/* Outer black border circle */}
          <div className="sharingan-outer-border" />
          
          {/* Red eye circle */}
          <div className="sharingan-eye-red" />
          
          {/* Inner area with Mangekyou pattern */}
          <div className="sharingan-inner-area">
            {/* Mangekyou fins (Itachi style pinwheel) */}
            <div className="mangekyou-fin fin-1" />
            <div className="mangekyou-fin fin-2" />
            <div className="mangekyou-fin fin-3" />
            
            {/* Center pupil */}
            <div className="sharingan-pupil mangekyou-pupil" />
          </div>
        </motion.div>
        
        {label && <h2 className="loader-title">{label}</h2>}
        {subLabel && <p className="loader-subtitle">{subLabel}</p>}
      </motion.div>
    </div>
  );
}