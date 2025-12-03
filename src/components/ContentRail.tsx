import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimeCard } from "./AnimeCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

type AnimeItem = {
  title?: string;
  image?: string;
  type?: string;
  id?: string;
  dataId?: string;
  language?: {
    sub?: string | null;
    dub?: string | null;
  };
};

interface ContentRailProps {
  title: string;
  items: AnimeItem[];
  onItemClick: (item: AnimeItem) => void;
  onViewAll?: () => void;
  variant?: "portrait" | "landscape";
  enableInfiniteScroll?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

export function ContentRail({ 
  title, 
  items, 
  onItemClick, 
  onViewAll, 
  variant = "portrait",
  enableInfiniteScroll = false,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false
}: ContentRailProps) {
  const { theme } = useTheme();
  const [displayCount, setDisplayCount] = useState(12);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const displayedItems = useMemo(
    () => (enableInfiniteScroll ? items : items.slice(0, displayCount)),
    [enableInfiniteScroll, items, displayCount]
  );
  const canShowMore = useMemo(
    () => !enableInfiniteScroll && items.length > displayCount,
    [enableInfiniteScroll, items.length, displayCount]
  );

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 16);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 16);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => updateScrollState();
    el.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    return () => {
      el.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [displayedItems.length, items.length, updateScrollState]);

  if (!items || items.length === 0) return null;

  const scrollRail = useCallback((direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.85;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }, []);

  const handleShowMore = useCallback(() => {
    if (enableInfiniteScroll && onLoadMore && hasMore) {
      onLoadMore();
    } else {
      setDisplayCount(prev => prev + 12);
    }
  }, [enableInfiniteScroll, hasMore, onLoadMore]);

  return (
    <section className="content-rail mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="content-rail-header flex items-center justify-between mb-4 px-4 md:px-0">
        <h2 className={`text-lg md:text-xl font-bold ${theme === "nothing" ? "text-[#0a0f1f]" : "text-white"} tracking-wide uppercase`}>
          {title}
        </h2>
        {onViewAll && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewAll}
            className={`${theme === "nothing" ? "text-[#ff3b3b] hover:text-[#ff3b3b] hover:bg-[#ff3b3b]/10" : "text-[#1977F3] hover:text-[#1977F3] hover:bg-blue-500/10"} text-xs font-semibold`}
          >
            View All
            <ChevronRight className="ml-1 h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="content-rail-track relative">
        {/* Fade overlays - adjusted for theme */}
        <div className={`absolute left-0 top-0 bottom-0 w-6 ${theme === "nothing" ? "bg-gradient-to-r from-[#f5f6fb]/40 to-transparent" : "bg-gradient-to-r from-[#050814]/40 to-transparent"} z-10 pointer-events-none md:hidden`} />
        <div className={`absolute right-0 top-0 bottom-0 w-6 ${theme === "nothing" ? "bg-gradient-to-r from-transparent to-[#f5f6fb]/40" : "bg-gradient-to-r from-transparent to-[#050814]/40"} z-10 pointer-events-none md:hidden`} />

        {canScrollLeft && (
          <button
            aria-label="Scroll left"
            onClick={() => scrollRail("left")}
            className={`hidden md:flex items-center justify-center absolute left-2 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full ${theme === "nothing" ? "bg-white border-2 border-black/10 text-[#0a0f1f] hover:bg-[#f5f6fb]" : "bg-black/60 border border-white/10 text-white hover:bg-black/80"} transition`}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        {canScrollRight && (
          <button
            aria-label="Scroll right"
            onClick={() => scrollRail("right")}
            className={`hidden md:flex items-center justify-center absolute right-2 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full ${theme === "nothing" ? "bg-white border-2 border-black/10 text-[#0a0f1f] hover:bg-[#f5f6fb]" : "bg-black/60 border border-white/10 text-white hover:bg-black/80"} transition`}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}

        <div
          ref={scrollRef}
          className="content-rail-scroll flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory px-4 md:px-0"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {displayedItems.map((item, idx) => (
            <div
              key={item.id ?? item.dataId ?? idx}
              className={`content-rail-card flex-none snap-start ${variant === "landscape" ? "w-[140px] md:w-[170px]" : "w-[95px] md:w-[120px]"}`}
            >
              <AnimeCard
                anime={item}
                onClick={() => onItemClick(item)}
                index={idx}
                variant={variant}
              />
            </div>
          ))}
          
          {/* Show More Button */}
          {(canShowMore || (hasMore && !isLoadingMore)) && (
            <div className={`content-rail-card flex-none snap-start ${variant === "landscape" ? "w-[140px] md:w-[170px]" : "w-[95px] md:w-[120px]"} flex items-center justify-center`}>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShowMore}
                className={`h-full w-full ${theme === "nothing" ? "bg-white/90 border-2 border-black/10 text-[#0a0f1f] hover:bg-[#f5f6fb]" : "bg-white/5 border-white/10 text-white hover:bg-white/10"} flex flex-col gap-2`}
              >
                <ChevronRight className="h-6 w-6" />
                <span className="text-xs">Load More</span>
              </Button>
            </div>
          )}
          
          {/* Loading Indicator */}
          {isLoadingMore && (
            <div className={`content-rail-card flex-none snap-start ${variant === "landscape" ? "w-[140px] md:w-[170px]" : "w-[95px] md:w-[120px]"} flex items-center justify-center`}>
              <div className={`h-full w-full ${theme === "nothing" ? "bg-white/90 border-2 border-black/10" : "bg-white/5 border border-white/10"} rounded-md flex items-center justify-center`}>
                <div className={`animate-spin h-8 w-8 border-2 ${theme === "nothing" ? "border-[#ff3b3b] border-t-transparent" : "border-blue-500 border-t-transparent"} rounded-full`} />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}