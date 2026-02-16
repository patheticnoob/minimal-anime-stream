import { useEffect, useRef } from "react";

type AdSlotProps = {
  placement: "guestHero" | "continueWatching" | "episodePage";
  zoneId?: string;
};

export function AdSlot({ placement, zoneId = "10979550" }: AdSlotProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    // Prevent re-execution on re-renders
    if (loadedRef.current) return;
    loadedRef.current = true;

    // Wait for AdCash library to load
    const checkAdCash = setInterval(() => {
      if (typeof (window as any).aclib !== "undefined") {
        clearInterval(checkAdCash);
        
        try {
          (window as any).aclib.runBanner({
            zoneId: zoneId,
            container: adRef.current,
          });
        } catch (err) {
          console.warn("AdCash failed to load:", err);
        }
      }
    }, 100);

    // Cleanup after 5 seconds if library doesn't load
    const timeout = setTimeout(() => {
      clearInterval(checkAdCash);
    }, 5000);

    return () => {
      clearInterval(checkAdCash);
      clearTimeout(timeout);
    };
  }, []); // Empty dependency array - runs only once

  return (
    <div className="ad-container my-6 md:my-8">
      <div className="ad-wrapper">
        <div className="flex items-center justify-between mb-2 px-2">
          <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Sponsored
          </span>
          <span className="text-[9px] md:text-[11px] text-gray-500 dark:text-gray-600">
            Ads keep GojoStream free
          </span>
        </div>
        <div
          ref={adRef}
          className="ad-slot ad-336"
          data-placement={placement}
          suppressHydrationWarning
        >
          {/* AdCash banner will render here - React will never touch this DOM node */}
        </div>
      </div>
      
      <style>{`
        .ad-container {
          width: 100%;
          max-width: 100%;
          overflow: hidden;
        }
        
        .ad-wrapper {
          max-width: 400px;
          margin: 0 auto;
        }
        
        .ad-slot.ad-336 {
          width: 336px;
          min-height: 280px;
          max-width: 100%;
          margin: 0 auto;
          display: flex;
          justify-content: center;
          align-items: center;
          background: rgba(0, 0, 0, 0.05);
          border-radius: 12px;
          overflow: hidden;
          position: relative;
        }
        
        /* Mobile optimization */
        @media (max-width: 400px) {
          .ad-slot.ad-336 {
            transform: scale(0.9);
            transform-origin: center;
          }
        }
        
        /* Dark mode */
        [data-theme="nothing"].dark .ad-slot.ad-336 {
          background: rgba(255, 255, 255, 0.03);
        }
        
        /* Prevent layout shift - maintain space even before ad loads */
        .ad-slot.ad-336::before {
          content: '';
          display: block;
          padding-bottom: 83.33%; /* 280/336 aspect ratio */
        }
      `}</style>
    </div>
  );
}