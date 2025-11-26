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
  const [tomoe1Visible, setTomoe1Visible] = useState(false);
  const [tomoe2Visible, setTomoe2Visible] = useState(false);
  const [isMangekyou, setIsMangekyou] = useState(false);

  useEffect(() => {
    // Show second tomoe after 1 second
    const timer1 = setTimeout(() => setTomoe1Visible(true), 1000);
    // Show third tomoe after 2 seconds
    const timer2 = setTimeout(() => setTomoe2Visible(true), 2000);
    // Transform to Mangekyou after 4 seconds
    const timer3 = setTimeout(() => setIsMangekyou(true), 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

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
          animate={{ 
            rotate: 360,
            scale: isMangekyou ? [1, 0.7, 1] : 1
          }}
          transition={{ 
            rotate: { duration: 4, ease: "linear", repeat: Infinity },
            scale: isMangekyou ? { duration: 0.5, times: [0, 0.5, 1] } : {}
          }}
          aria-hidden="true"
        >
          {/* Outer black border circle */}
          <div className="sharingan-outer-border" />
          
          {/* Red eye circle */}
          <div className="sharingan-eye-red" />
          
          {/* Inner area with tomoe */}
          <div className="sharingan-inner-area">
            {/* Inner red background */}
            <div className="sharingan-inner-red" />
            
            {/* Tomoe elements */}
            {!isMangekyou ? (
              <>
                {/* First tomoe - always visible */}
                <div className="sharingan-tomoe tomoe-1" />
                
                {/* Second tomoe - fades in */}
                <motion.div 
                  className="sharingan-tomoe tomoe-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: tomoe1Visible ? 1 : 0 }}
                  transition={{ duration: 1.5 }}
                />
                
                {/* Third tomoe - fades in */}
                <motion.div 
                  className="sharingan-tomoe tomoe-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: tomoe2Visible ? 1 : 0 }}
                  transition={{ duration: 1.5 }}
                />
              </>
            ) : (
              <>
                {/* Mangekyou fins */}
                <motion.div 
                  className="mangekyou-fin fin-1"
                  initial={{ scale: 0, rotate: 0 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.5 }}
                />
                <motion.div 
                  className="mangekyou-fin fin-2"
                  initial={{ scale: 0, rotate: 120 }}
                  animate={{ scale: 1, rotate: 120 }}
                  transition={{ duration: 0.5 }}
                />
                <motion.div 
                  className="mangekyou-fin fin-3"
                  initial={{ scale: 0, rotate: 240 }}
                  animate={{ scale: 1, rotate: 240 }}
                  transition={{ duration: 0.5 }}
                />
              </>
            )}
            
            {/* Center pupil */}
            <div className={`sharingan-pupil ${isMangekyou ? 'mangekyou-pupil' : ''}`} />
          </div>
        </motion.div>
        
        {label && <h2 className="loader-title">{label}</h2>}
        {subLabel && <p className="loader-subtitle">{subLabel}</p>}
      </motion.div>
    </div>
  );
}