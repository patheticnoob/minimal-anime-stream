import { useEffect, useRef } from "react";

const AD_SNIPPET =
  `(function(solth){var d = document, s = d.createElement('script'), l = d.scripts[d.scripts.length - 1];s.settings = solth || {};s.src = "//excitableminor.com/b.XJVVsed/GIlb0yYHW-ce/aeTmc9Hu/ZcUWlSkSPuTcYT3nMrTQQ/1pNdzEYPtlNyjRc_xyNZDsU/3RNfwg";s.async = true;s.referrerPolicy = 'no-referrer-when-downgrade';l.parentNode.insertBefore(s, l);})({});`;

type AdSlotProps = {
  placement: "guestHero" | "continueWatching";
};

export function AdSlot({ placement }: AdSlotProps) {
  const slotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = slotRef.current;
    if (!container) return;

    container.innerHTML = `<span class="text-xs text-gray-400">Loading personalized offers...</span>`;

    const script = document.createElement("script");
    script.dataset.adPlacement = placement;
    script.textContent = AD_SNIPPET;
    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, [placement]);

  return (
    <div className="my-8">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6 shadow-lg shadow-black/30 overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">
            Sponsored
          </span>
          <span className="text-[11px] text-gray-500">Ads keep the portal free</span>
        </div>
        <div
          ref={slotRef}
          className="relative rounded-xl border border-white/10 bg-black/40 h-32 flex items-center justify-center text-gray-400 text-xs"
        >
          Loading personalized offers...
        </div>
      </div>
    </div>
  );
}
