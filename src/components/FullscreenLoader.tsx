import { motion } from "framer-motion";

interface FullscreenLoaderProps {
  label?: string;
  subLabel?: string;
}

export function FullscreenLoader({
  label = "Loading...",
  subLabel = "",
}: FullscreenLoaderProps) {
  const discSize = 150;

  return (
    <div className="fullscreen-loader" role="status" aria-live="polite">
      <div className="loader-backdrop" />
      <motion.div
        className="loader-content"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
      >
        <div
          className="sharingan-loader"
          style={{ width: `${discSize}px`, height: `${discSize}px` }}
          aria-hidden="true"
        >
          <motion.div
            className="sharingan-eye"
            style={{ width: `${discSize}px`, height: `${discSize}px` }}
            animate={{ rotate: 360 }}
            transition={{ duration: 8, ease: "linear", repeat: Infinity }}
          >
            <span className="sharingan-ring outer-ring" />
            <span className="sharingan-ring inner-ring" />
            <div className="sharingan-pupil" />
            <div className="sharingan-tomoe-container">
              <div className="sharingan-tomoe tomoe-1" />
              <div className="sharingan-tomoe tomoe-2" />
              <div className="sharingan-tomoe tomoe-3" />
            </div>
          </motion.div>
        </div>
        {label && <h2 className="loader-title">{label}</h2>}
        {subLabel && <p className="loader-subtitle">{subLabel}</p>}
      </motion.div>
    </div>
  );
}