import { AnimeItem } from "@/shared/types";
import { Skeleton } from "@/components/ui/skeleton";

export function CompactListSection({ title, items, onOpenAnime, theme }: { title: string, items: AnimeItem[], onOpenAnime: (item: AnimeItem) => void, theme: string }) {
  if (!items || items.length === 0) return null;
  
  const isNothing = theme === "nothing";
  
  return (
    <div className={isNothing ? "bg-[var(--nothing-card-bg)] rounded-[24px] p-5" : "bg-white/5 rounded-xl p-5 border border-white/10"}>
      <h2 className={`text-base md:text-lg font-bold tracking-wide uppercase mb-4 px-1 ${isNothing ? "text-[var(--nothing-fg)]" : "text-white"}`}>{title}</h2>
      <div className="space-y-3">
        {items.slice(0, 5).map((item, idx) => (
          <div key={item.id ?? idx} className={`flex items-center gap-3 cursor-pointer group p-2 rounded-xl transition-colors ${isNothing ? "hover:bg-[var(--nothing-elevated)]" : "hover:bg-white/10"}`} onClick={() => onOpenAnime(item)}>
            <div className={`w-10 h-14 shrink-0 overflow-hidden ${isNothing ? "rounded-lg bg-[var(--nothing-card-inner)]" : "rounded-md bg-black/50"}`}>
              {item.image ? (
                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-[var(--nothing-gray-4)]">No Img</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`text-sm font-bold line-clamp-1 transition-colors tracking-wide ${isNothing ? "text-[var(--nothing-fg)] group-hover:text-[var(--nothing-accent)]" : "text-white group-hover:text-blue-400"}`}>
                {item.title}
              </h3>
              <div className={`flex gap-2 text-[10px] font-bold mt-1 uppercase ${isNothing ? "text-[var(--nothing-gray-4)]" : "text-gray-400"}`}>
                {item.language?.sub && <span>SUB {item.language.sub}</span>}
                {item.language?.sub && item.language?.dub && <span className={isNothing ? "text-[var(--nothing-gray-5)]" : "text-gray-600"}>•</span>}
                {item.language?.dub && <span>DUB {item.language.dub}</span>}
                {item.type && (
                  <>
                    <span className={isNothing ? "text-[var(--nothing-gray-5)]" : "text-gray-600"}>•</span>
                    <span>{item.type}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CompactSkeleton({ title, theme }: { title: string, theme: string }) {
  const isNothing = theme === "nothing";
  return (
    <div className={isNothing ? "bg-[var(--nothing-card-bg)] rounded-[24px] p-5" : "bg-white/5 rounded-xl p-5 border border-white/10"}>
      <h2 className={`text-base md:text-lg font-bold tracking-wide uppercase mb-4 px-1 ${isNothing ? "text-[var(--nothing-fg)]" : "text-white"}`}>{title}</h2>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3 p-2">
            <Skeleton className={`w-10 h-14 shrink-0 ${isNothing ? "rounded-lg bg-[var(--nothing-elevated)]" : "rounded-md bg-white/10"}`} />
            <div className="flex-1 space-y-2 py-1">
              <Skeleton className={`h-3 w-full ${isNothing ? "bg-[var(--nothing-elevated)]" : "bg-white/10"}`} />
              <Skeleton className={`h-2 w-2/3 ${isNothing ? "bg-[var(--nothing-elevated)]" : "bg-white/10"}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}