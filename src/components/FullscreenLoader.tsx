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
    <div className="fullscreen-loader">
      <div className="loader-backdrop" />
      <motion.div 
        className="loader-content"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="sharingan-loader">
          <div className="sharingan-eye">
            <div className="sharingan-pupil" />
            <div className="sharingan-tomoe-container">
              <div className="sharingan-tomoe tomoe-1" />
              <div className="sharingan-tomoe tomoe-2" />
              <div className="sharingan-tomoe tomoe-3" />
            </div>
          </div>
        </div>
        {label && <h2 className="loader-title">{label}</h2>}
        {subLabel && <p className="loader-subtitle">{subLabel}</p>}
      </motion.div>
    </div>
  );
}