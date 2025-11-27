import { useState, useEffect } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimeCard } from "./AnimeCard";
import { Button } from "./ui/button";

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

interface SearchSectionProps {
  query: string;
  onItemClick: (item: AnimeItem) => void;
}

export function SearchSection({ query, onItemClick }: SearchSectionProps) {
  const searchAnime = useAction(api.hianime.search);
  const [searchResults, setSearchResults] = useState<AnimeItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      setCurrentPage(1);
      setHasNextPage(false);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        const results = await searchAnime({ query: query.trim(), page: currentPage });
        const searchData = results as { results: AnimeItem[]; hasNextPage: boolean };
        setSearchResults(searchData.results || []);
        setHasNextPage(searchData.hasNextPage || false);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Search failed";
        toast.error(msg);
        setSearchResults([]);
        setHasNextPage(false);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query, currentPage, searchAnime]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!query.trim()) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg">Start typing to search for anime</p>
      </div>
    );
  }

  if (isSearching) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (searchResults.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg">No results found for "{query}"</p>
        <p className="text-gray-500 mt-2">Try a different search term</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {searchResults.map((item, idx) => (
          <AnimeCard 
            key={item.id ?? idx} 
            anime={item} 
            onClick={() => onItemClick(item)} 
            index={idx}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      {(currentPage > 1 || hasNextPage) && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          <span className="text-sm text-gray-400">
            Page {currentPage}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!hasNextPage}
            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
