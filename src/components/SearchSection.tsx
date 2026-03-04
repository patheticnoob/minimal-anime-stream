import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Loader2, ChevronLeft, ChevronRight, SlidersHorizontal, X } from "lucide-react";
import { AnimeCard } from "./AnimeCard";
import { Button } from "./ui/button";
import { searchGojo, fetchGojoFilter, type GojoFilterParams } from "@/lib/gojo-api";
import { AnimeItem } from "@/shared/types";

interface SearchSectionProps {
  query: string;
  onItemClick: (item: AnimeItem) => void;
}

const GENRES = [
  "action","adventure","cars","comedy","dementia","demons","mystery","drama","ecchi",
  "fantasy","game","historical","horror","kids","magic","martial_arts","mecha","music",
  "parody","samurai","romance","school","sci-fi","shoujo","shoujo_ai","shounen",
  "shounen_ai","space","sports","super_power","vampire","harem","slice_of_life",
  "supernatural","military","police","psychological","thriller","seinen","josei","isekai"
];

type FilterState = {
  type: GojoFilterParams["type"];
  status: GojoFilterParams["status"];
  rated: GojoFilterParams["rated"];
  score: GojoFilterParams["score"];
  season: GojoFilterParams["season"];
  language: GojoFilterParams["language"];
  sort: GojoFilterParams["sort"];
  genres: string;
};

const DEFAULT_FILTERS: FilterState = {
  type: "all",
  status: "all",
  rated: "all",
  score: "all",
  season: "all",
  language: "all",
  sort: "default",
  genres: "",
};

function hasActiveFilters(filters: FilterState): boolean {
  return (
    (filters.type !== "all" && !!filters.type) ||
    (filters.status !== "all" && !!filters.status) ||
    (filters.rated !== "all" && !!filters.rated) ||
    (filters.score !== "all" && !!filters.score) ||
    (filters.season !== "all" && !!filters.season) ||
    (filters.language !== "all" && !!filters.language) ||
    (filters.sort !== "default" && !!filters.sort) ||
    !!filters.genres
  );
}

function SelectFilter<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-400 uppercase tracking-wider font-mono">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="bg-[var(--nothing-elevated,rgba(255,255,255,0.05))] border border-[var(--nothing-border,rgba(255,255,255,0.1))] rounded-full px-4 py-2 text-[var(--nothing-fg,white)] text-sm font-mono focus:outline-none focus:ring-1 focus:ring-[var(--nothing-accent,rgba(255,255,255,0.3))] cursor-pointer transition-all"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#0B0F19]">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function SearchSection({ query, onItemClick }: SearchSectionProps) {
  const [results, setResults] = useState<AnimeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [pendingFilters, setPendingFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [isFilterMode, setIsFilterMode] = useState(false);

  const activeFilters = hasActiveFilters(filters);

  const fetchResults = useCallback(async (searchQuery: string, page: number, currentFilters: FilterState, filterMode: boolean) => {
    setIsLoading(true);
    try {
      if (filterMode || (!searchQuery.trim() && hasActiveFilters(currentFilters))) {
        const data = await fetchGojoFilter({
          keyword: searchQuery.trim() || undefined,
          type: currentFilters.type,
          status: currentFilters.status,
          rated: currentFilters.rated,
          score: currentFilters.score,
          season: currentFilters.season,
          language: currentFilters.language,
          sort: currentFilters.sort,
          genres: currentFilters.genres || undefined,
          page,
        });
        setResults(data.results);
        setHasNextPage(data.hasNextPage);
      } else if (searchQuery.trim()) {
        const data = await searchGojo(searchQuery.trim(), page);
        setResults(data.results);
        setHasNextPage(data.hasNextPage);
      } else {
        setResults([]);
        setHasNextPage(false);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Search failed";
      toast.error(msg);
      setResults([]);
      setHasNextPage(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!query.trim() && !isFilterMode) {
      setResults([]);
      setHasNextPage(false);
      setCurrentPage(1);
      return;
    }
    setCurrentPage(1);
    const timeoutId = setTimeout(() => {
      fetchResults(query, 1, filters, isFilterMode);
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [query, filters, isFilterMode, fetchResults]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchResults(query, newPage, filters, isFilterMode);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const applyFilters = () => {
    const newFilters = { ...pendingFilters };
    setFilters(newFilters);
    setIsFilterMode(hasActiveFilters(newFilters));
    setCurrentPage(1);
    setShowFilters(false);
    fetchResults(query, 1, newFilters, hasActiveFilters(newFilters));
  };

  const clearFilters = () => {
    setPendingFilters(DEFAULT_FILTERS);
    setFilters(DEFAULT_FILTERS);
    setIsFilterMode(false);
    setCurrentPage(1);
    setShowFilters(false);
    if (query.trim()) {
      fetchResults(query, 1, DEFAULT_FILTERS, false);
    } else {
      setResults([]);
      setHasNextPage(false);
    }
  };

  const updatePending = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setPendingFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div>
      {/* Filter Toggle Bar - always visible */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setPendingFilters(filters);
            setShowFilters(!showFilters);
          }}
          className={`flex items-center gap-2 border transition-all font-mono uppercase tracking-wider text-xs rounded-full ${
            activeFilters
              ? "bg-[var(--nothing-accent,rgba(255,255,255,0.15))] border-[var(--nothing-accent,rgba(255,255,255,0.3))] text-white"
              : "bg-[var(--nothing-elevated,rgba(255,255,255,0.05))] border-[var(--nothing-border,rgba(255,255,255,0.1))] text-[var(--nothing-fg,white)] hover:bg-[var(--nothing-gray-1,rgba(255,255,255,0.1))]"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilters && (
            <span className="ml-1 bg-white text-black text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
              !
            </span>
          )}
        </Button>
        {activeFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-[var(--nothing-gray-4,#9CA3AF)] hover:text-[var(--nothing-fg,white)] flex items-center gap-1 font-mono uppercase tracking-wider text-xs rounded-full"
          >
            <X className="h-3 w-3" />
            Clear filters
          </Button>
        )}
        {results.length > 0 && (
          <span className="text-sm text-[var(--nothing-gray-4,#9CA3AF)] ml-auto font-mono uppercase tracking-wider text-xs">
            Page {currentPage}
          </span>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mb-6 p-6 bg-[var(--nothing-elevated,rgba(255,255,255,0.05))] border-2 border-[var(--nothing-border,rgba(255,255,255,0.1))] rounded-3xl">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
            <SelectFilter
              label="Type"
              value={pendingFilters.type || "all"}
              options={[
                { value: "all", label: "All Types" },
                { value: "tv", label: "TV" },
                { value: "movie", label: "Movie" },
                { value: "ova", label: "OVA" },
                { value: "special", label: "Special" },
                { value: "music", label: "Music" },
              ]}
              onChange={(v) => updatePending("type", v)}
            />
            <SelectFilter
              label="Status"
              value={pendingFilters.status || "all"}
              options={[
                { value: "all", label: "All Status" },
                { value: "currently_airing", label: "Airing" },
                { value: "finished_airing", label: "Finished" },
                { value: "not_yet_aired", label: "Upcoming" },
              ]}
              onChange={(v) => updatePending("status", v)}
            />
            <SelectFilter
              label="Language"
              value={pendingFilters.language || "all"}
              options={[
                { value: "all", label: "All" },
                { value: "sub", label: "Sub" },
                { value: "dub", label: "Dub" },
                { value: "sub_dub", label: "Sub + Dub" },
              ]}
              onChange={(v) => updatePending("language", v)}
            />
            <SelectFilter
              label="Season"
              value={pendingFilters.season || "all"}
              options={[
                { value: "all", label: "All Seasons" },
                { value: "spring", label: "Spring" },
                { value: "summer", label: "Summer" },
                { value: "fall", label: "Fall" },
                { value: "winter", label: "Winter" },
              ]}
              onChange={(v) => updatePending("season", v)}
            />
            <SelectFilter
              label="Score"
              value={pendingFilters.score || "all"}
              options={[
                { value: "all", label: "Any Score" },
                { value: "masterpiece", label: "Masterpiece" },
                { value: "great", label: "Great" },
                { value: "very_good", label: "Very Good" },
                { value: "good", label: "Good" },
                { value: "fine", label: "Fine" },
                { value: "average", label: "Average" },
                { value: "bad", label: "Bad" },
                { value: "very_bad", label: "Very Bad" },
                { value: "horrible", label: "Horrible" },
                { value: "appalling", label: "Appalling" },
              ]}
              onChange={(v) => updatePending("score", v)}
            />
            <SelectFilter
              label="Rating"
              value={pendingFilters.rated || "all"}
              options={[
                { value: "all", label: "All Ratings" },
                { value: "g", label: "G" },
                { value: "pg", label: "PG" },
                { value: "pg-13", label: "PG-13" },
                { value: "r", label: "R" },
                { value: "r+", label: "R+" },
                { value: "rx", label: "RX" },
              ]}
              onChange={(v) => updatePending("rated", v)}
            />
            <SelectFilter
              label="Sort By"
              value={pendingFilters.sort || "default"}
              options={[
                { value: "default", label: "Default" },
                { value: "recently_added", label: "Recently Added" },
                { value: "recently_updated", label: "Recently Updated" },
                { value: "score", label: "Score" },
                { value: "name_az", label: "Name A-Z" },
                { value: "release_date", label: "Release Date" },
                { value: "most_watched", label: "Most Watched" },
              ]}
              onChange={(v) => updatePending("sort", v)}
            />
          </div>

          {/* Genre Pills */}
          <div className="mb-5">
            <label className="text-xs text-[var(--nothing-gray-4,#9CA3AF)] uppercase tracking-wider font-mono block mb-3">Genre</label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
              {GENRES.map((g) => (
                <button
                  key={g}
                  onClick={() => updatePending("genres", pendingFilters.genres === g ? "" : g)}
                  className={`px-3 py-1 rounded-full text-xs font-mono font-medium transition-all capitalize ${
                    pendingFilters.genres === g
                      ? "bg-[var(--nothing-accent,white)] text-white border border-[var(--nothing-accent,white)]"
                      : "bg-[var(--nothing-elevated,rgba(255,255,255,0.05))] text-[var(--nothing-gray-4,#9CA3AF)] border border-[var(--nothing-border,rgba(255,255,255,0.1))] hover:border-[var(--nothing-accent,rgba(255,255,255,0.3))] hover:text-[var(--nothing-fg,white)]"
                  }`}
                >
                  {g.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              size="sm"
              onClick={applyFilters}
              className="bg-[var(--nothing-accent,white)] text-white hover:opacity-90 font-mono uppercase tracking-wider text-xs rounded-full border-2 border-[var(--nothing-accent,white)] px-6"
            >
              Apply Filters
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(false)}
              className="text-[var(--nothing-gray-4,#9CA3AF)] hover:text-[var(--nothing-fg,white)] font-mono uppercase tracking-wider text-xs rounded-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Empty state - no query and no filters */}
      {!query.trim() && !isFilterMode && !isLoading && results.length === 0 && (
        <div className="text-center py-20">
          <p className="text-[var(--nothing-gray-4,#9CA3AF)] text-base font-mono uppercase tracking-wider">Start typing to search for anime</p>
          <p className="text-[var(--nothing-gray-4,#9CA3AF)] mt-2 text-sm font-mono opacity-60">Or use filters above to browse</p>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-[var(--nothing-accent,rgba(255,255,255,0.5))]" />
        </div>
      )}

      {/* No results */}
      {!isLoading && results.length === 0 && (query.trim() || isFilterMode) && (
        <div className="text-center py-20">
          <p className="text-[var(--nothing-gray-4,#9CA3AF)] text-base font-mono uppercase tracking-wider">No results found</p>
          {query && <p className="text-[var(--nothing-gray-4,#9CA3AF)] mt-2 font-mono text-sm opacity-60">Try a different search term or adjust filters</p>}
        </div>
      )}

      {!isLoading && results.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {results.map((item, idx) => (
              <AnimeCard
                key={item.id ?? idx}
                anime={item}
                onClick={() => onItemClick(item)}
                index={idx}
              />
            ))}
          </div>

          {/* Pagination */}
          {(currentPage > 1 || hasNextPage) && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="bg-[var(--nothing-elevated,rgba(255,255,255,0.05))] border-2 border-[var(--nothing-border,rgba(255,255,255,0.1))] text-[var(--nothing-fg,white)] hover:border-[var(--nothing-accent,rgba(255,255,255,0.3))] font-mono uppercase tracking-wider text-xs rounded-full px-5 disabled:opacity-40 transition-all"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Prev
              </Button>
              <span className="text-sm text-[var(--nothing-gray-4,#9CA3AF)] font-mono uppercase tracking-wider text-xs">Page {currentPage}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!hasNextPage}
                className="bg-[var(--nothing-elevated,rgba(255,255,255,0.05))] border-2 border-[var(--nothing-border,rgba(255,255,255,0.1))] text-[var(--nothing-fg,white)] hover:border-[var(--nothing-accent,rgba(255,255,255,0.3))] font-mono uppercase tracking-wider text-xs rounded-full px-5 disabled:opacity-40 transition-all"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}