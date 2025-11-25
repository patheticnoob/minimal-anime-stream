import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface FullscreenLoaderProps {
  label?: string;
  subLabel?: string;
}

export function FullscreenLoader({
  label = "Loading...",
  subLabel = "",
}: FullscreenLoaderProps) {
  const [isMangekyou, setIsMangekyou] = useState(false);
  const [diameter, setDiameter] = useState(160);

  useEffect(() => {
    // Transform to Mangekyou after 3.5 seconds
    const transformTimer = setTimeout(() => {
      setIsMangekyou(true);
    }, 3500);

    // Spring bounce animation
    const bounceTimer = setTimeout(() => {
      setDiameter(130); // Shrink
      setTimeout(() => {
        setDiameter(160); // Bounce back
      }, 200);
    }, 3300);

    return () => {
      clearTimeout(transformTimer);
      clearTimeout(bounceTimer);
    };
  }, []);

  return (
    <div className="fullscreen-loader">
      <div className="loader-backdrop" />
      <motion.div 
        className="loader-content"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="sharingan-loader" style={{ width: `${diameter}px`, height: `${diameter}px` }}>
          <div className="sharingan-eye" style={{ width: `${diameter}px`, height: `${diameter}px` }}>
            <div className="sharingan-pupil" />
            <div className={`sharingan-tomoe-container ${isMangekyou ? 'mangekyou' : ''}`}>
              <div className={`sharingan-tomoe tomoe-1 ${isMangekyou ? 'mangekyou-fin' : ''}`} />
              <div className={`sharingan-tomoe tomoe-2 ${isMangekyou ? 'mangekyou-fin' : ''}`} />
              <div className={`sharingan-tomoe tomoe-3 ${isMangekyou ? 'mangekyou-fin' : ''}`} />
            </div>
          </div>
        </div>
        {label && <h2 className="loader-title">{label}</h2>}
        {subLabel && <p className="loader-subtitle">{subLabel}</p>}
      </motion.div>
    </div>
  );
}