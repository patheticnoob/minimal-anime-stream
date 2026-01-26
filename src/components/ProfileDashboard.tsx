import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, Palette, Download, Upload, FileJson } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTheme } from "@/hooks/use-theme";
import { useDataFlow } from "@/hooks/use-data-flow";
import { AnimeCard } from "@/components/AnimeCard";
import { ControllerStatus } from "@/components/ControllerStatus";
import { GamepadButtonMapping } from "@/components/GamepadButtonMapping";
import { useGamepad, GAMEPAD_BUTTONS } from "@/hooks/use-gamepad";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

type ProfileAnime = {
  title?: string;
  image?: string;
  type?: string;
  dataId?: string;
  id?: string;
  episodeNumber?: number;
  currentTime?: number;
  duration?: number | string; // number (progress) or string (V4: "24m")
};

interface ProfileDashboardProps {
  userName?: string | null;
  userEmail?: string | null;
  continueWatching: ProfileAnime[];
  watchlist: ProfileAnime[];
  onSelectAnime: (anime: ProfileAnime) => void;
  onLogout?: () => void;
}

const shimmerHighlight =
  "relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition before:duration-[1200ms]";

const emptyIllustration = "/assets/7e7b9501-d78c-4eb0-b98c-b49fdb807c8d.png";

const themeOptions = [
  { value: "classic", label: "Classic", accentClass: "bg-blue-600 hover:bg-blue-700" },
  { value: "retro", label: "Retro", accentClass: "bg-purple-600 hover:bg-purple-700" },
  { value: "nothing", label: "NothingOS", accentClass: "bg-red-600 hover:bg-red-700" },
] as const;

type FocusSection = "continue" | "watchlist" | "theme" | "signout";

export function ProfileDashboard({
  userName,
  userEmail,
  continueWatching,
  watchlist,
  onSelectAnime,
  onLogout,
}: ProfileDashboardProps) {
  const { theme, setTheme } = useTheme();
  const { dataFlow, setDataFlow } = useDataFlow();
  const safeContinueWatching = continueWatching ?? [];
  const safeWatchlist = watchlist ?? [];

  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importMode, setImportMode] = useState<"merge" | "replace">("merge");
  const [importFile, setImportFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportData = useQuery(api.dataTransfer.exportUserData);
  const importUserData = useMutation(api.dataTransfer.importUserData);

  const handleExportData = () => {
    if (!exportData) {
      toast.error("No data to export");
      return;
    }

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `gojostream-export-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Data exported successfully!");
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".json")) {
        toast.error("Please select a valid JSON file");
        return;
      }
      setImportFile(file);
      setShowImportDialog(true);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;

    try {
      const text = await importFile.text();
      const result = await importUserData({
        data: text,
        mode: importMode,
      });

      if (result.success) {
        toast.success(
          `Import successful! Added ${result.imported.watchlist} watchlist items and ${result.imported.progress} progress items.` +
          (result.skipped.watchlist + result.skipped.progress > 0
            ? ` Skipped ${result.skipped.watchlist + result.skipped.progress} duplicates.`
            : "")
        );
        setShowImportDialog(false);
        setImportFile(null);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to import data");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--nothing-fg,white)]">My Profile</h1>
          <p className="text-[var(--nothing-gray-4,#8a90a6)] mt-1">{userEmail}</p>
        </div>
        <Button
          variant="outline"
          onClick={onLogout}
          className="border-red-500/50 text-red-400 hover:bg-red-500/10"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>

      {/* Controller Status */}
      <ControllerStatus showDetails={true} />

      {/* Controller Button Mapping Section */}
      <GamepadButtonMapping />

      {/* Data Import/Export */}
      <div className="bg-[var(--nothing-elevated,white/5)] border border-[var(--nothing-border,white/10)] rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-[var(--nothing-fg,white)]">Data Transfer</h2>
        <p className="text-sm text-[var(--nothing-gray-4,gray-400)] mb-4">
          Export your watchlist and progress to transfer to another account or backup your data.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={handleExportData}
            className="border-green-500/50 text-green-400 hover:bg-green-500/10"
          >
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button
            variant="outline"
            onClick={handleImportClick}
            className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
          >
            <Upload className="mr-2 h-4 w-4" />
            Import Data
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Theme Switcher */}
      <div className="bg-[var(--nothing-elevated,white/5)] border border-[var(--nothing-border,white/10)] rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-[var(--nothing-fg,white)]">Theme Settings</h2>
        <div className="flex flex-wrap gap-3">
          {themeOptions.map((option) => (
            <Button
              key={option.value}
              variant={theme === option.value ? "default" : "outline"}
              onClick={() => setTheme(option.value)}
              className={theme === option.value ? option.accentClass : ""}
            >
              {option.label}
            </Button>
          ))}
        </div>
        <p className="text-sm text-[var(--nothing-gray-4,gray-400)] mt-3">
          Current theme: <span className="font-semibold text-[var(--nothing-fg,white)] capitalize">{theme}</span>
        </p>
      </div>

      {/* API Version Switcher */}
      <div className="bg-[var(--nothing-elevated,white/5)] border border-[var(--nothing-border,white/10)] rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-[var(--nothing-fg,white)]">API Version Settings</h2>
        <div className="flex flex-wrap gap-3">
          <Button
            variant={dataFlow === "v1" ? "default" : "outline"}
            onClick={() => setDataFlow("v1")}
            className={dataFlow === "v1" ? "bg-green-600 hover:bg-green-700" : ""}
          >
            v1
          </Button>
          <Button
            variant={dataFlow === "v2" ? "default" : "outline"}
            onClick={() => setDataFlow("v2")}
            className={dataFlow === "v2" ? "bg-orange-600 hover:bg-orange-700" : ""}
          >
            v2
          </Button>
          <Button
            variant={dataFlow === "v3" ? "default" : "outline"}
            onClick={() => setDataFlow("v3")}
            className={dataFlow === "v3" ? "bg-blue-600 hover:bg-blue-700" : ""}
          >
            v3
          </Button>
          <Button
            variant={dataFlow === "v4" ? "default" : "outline"}
            onClick={() => setDataFlow("v4")}
            className={dataFlow === "v4" ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" : ""}
          >
            v4 ⚡
          </Button>
        </div>
        <p className="text-sm text-[var(--nothing-gray-4,gray-400)] mt-3">
          Current API: <span className="font-semibold text-[var(--nothing-fg,white)] uppercase">{dataFlow}</span>
        </p>
        <p className="text-xs text-[var(--nothing-gray-5,gray-500)] mt-2">
          {dataFlow === "v1" && "Original stable API with proven streaming"}
          {dataFlow === "v2" && "Enhanced version with better metadata"}
          {dataFlow === "v3" && "Direct API calls with spotlight features"}
          {dataFlow === "v4" && "🚀 Best of Both Worlds - Rich home page data + reliable streaming"}
        </p>
      </div>

      {/* Continue Watching Section */}
      {safeContinueWatching && safeContinueWatching.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-[var(--nothing-fg,white)]">Continue Watching</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {safeContinueWatching.map((anime, idx) => (
              <AnimeCard
                key={anime.id ?? idx}
                anime={anime}
                onClick={() => onSelectAnime(anime)}
                index={idx}
              />
            ))}
          </div>
        </div>
      )}

      {/* Watchlist Section */}
      {safeWatchlist && safeWatchlist.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-[var(--nothing-fg,white)]">My Watchlist</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {safeWatchlist.map((anime, idx) => (
              <AnimeCard
                key={anime.id ?? idx}
                anime={anime}
                onClick={() => onSelectAnime(anime)}
                index={idx}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty States */}
      {(!safeContinueWatching || safeContinueWatching.length === 0) &&
        (!safeWatchlist || safeWatchlist.length === 0) && (
          <div className="text-center py-16">
            <p className="text-[var(--nothing-gray-4,gray-400)] text-lg">No anime in your library yet.</p>
            <p className="text-[var(--nothing-gray-4,gray-500)] mt-2">Start watching to build your collection!</p>
          </div>
        )}

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="bg-[var(--nothing-bg,#0a0a0f)] border-[var(--nothing-border,white/10)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--nothing-fg,white)]">Import Data</DialogTitle>
            <DialogDescription className="text-[var(--nothing-gray-4,gray-400)]">
              Choose how to import your data. Merge will add to your existing data, while Replace will clear everything first.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2 text-sm text-[var(--nothing-gray-4,gray-400)]">
              <FileJson className="h-4 w-4" />
              <span>{importFile?.name}</span>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--nothing-fg,white)]">Import Mode</label>
              <div className="flex gap-3">
                <Button
                  variant={importMode === "merge" ? "default" : "outline"}
                  onClick={() => setImportMode("merge")}
                  className={importMode === "merge" ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  Merge
                </Button>
                <Button
                  variant={importMode === "replace" ? "default" : "outline"}
                  onClick={() => setImportMode("replace")}
                  className={importMode === "replace" ? "bg-red-600 hover:bg-red-700" : ""}
                >
                  Replace
                </Button>
              </div>
              <p className="text-xs text-[var(--nothing-gray-5,gray-500)]">
                {importMode === "merge"
                  ? "Add imported data to your existing watchlist and progress"
                  : "⚠️ This will delete all your current data and replace it with the imported data"}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              className={importMode === "replace" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}
            >
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}