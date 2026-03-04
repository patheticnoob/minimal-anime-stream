import { motion } from "framer-motion";

interface FullscreenLoaderProps {
  label?: string;
  subLabel?: string;
  maxDuration?: number; // in milliseconds
}

export function FullscreenLoader({
  label = "GOJO",
  subLabel = "SYSTEM_INIT",
}: FullscreenLoaderProps) {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black text-white font-mono overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(10px)" }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      {/* Background Grid Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]" />

      <div className="relative z-10 flex flex-col items-center">
        {/* Nothing-style Spinner */}
        <div className="relative w-24 h-24 mb-12">
           {/* Outer Ring */}
           <motion.div 
             className="absolute inset-0 border-2 border-dashed border-white/20 rounded-full"
             animate={{ rotate: 360 }}
             transition={{ duration: 20, ease: "linear", repeat: Infinity }}
           />
           
           {/* Inner Active Ring */}
           <motion.div 
             className="absolute inset-2 border-2 border-dotted border-white rounded-full"
             style={{ borderTopColor: 'transparent', borderLeftColor: 'transparent' }}
             animate={{ rotate: -360 }}
             transition={{ duration: 3, ease: "linear", repeat: Infinity }}
           />
           
           {/* Center Red Dot (Nothing signature) */}
           <div className="absolute inset-0 flex items-center justify-center">
             <motion.div 
               className="w-3 h-3 bg-[#D71921] rounded-full"
               animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
               transition={{ duration: 2, repeat: Infinity }}
             />
           </div>
        </div>

        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-3"
        >
          <h1 className="text-5xl md:text-7xl dotted-matrix-text">{label}</h1>
          <div className="flex items-center justify-center gap-3 matrix-subtext text-xs">
            <span>{subLabel}</span>
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 1] }}
              className="inline-block w-1.5 h-3 bg-[#D71921]"
            />
          </div>
        </motion.div>
      </div>

      {/* Corner Accents */}
      <div className="absolute top-8 left-8 text-[10px] text-white/30 font-mono tracking-widest">
        N(01) // SYS.BOOT
      </div>
      <div className="absolute bottom-8 right-8 text-[10px] text-white/30 font-mono tracking-widest">
        V(2.0) // READY
      </div>
      
      {/* Decorative Lines */}
      <div className="absolute top-8 right-8 w-24 h-[1px] bg-white/10" />
      <div className="absolute bottom-8 left-8 w-24 h-[1px] bg-white/10" />

    </motion.div>
  );
}