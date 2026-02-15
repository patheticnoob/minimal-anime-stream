import { DateTime } from "luxon";
import { useMemo } from "react";
import { BroadcastInfo } from "@/types/broadcast";

interface InfoModalBroadcastProps {
  broadcastInfo?: BroadcastInfo | null;
  broadcastLoading?: boolean;
  audioPreference?: "sub" | "dub";
  onAudioPreferenceChange?: (preference: "sub" | "dub") => void;
  hasSub?: boolean;
  hasDub?: boolean;
}

export function InfoModalBroadcast({
  broadcastInfo,
  broadcastLoading,
  audioPreference,
  onAudioPreferenceChange,
  hasSub,
  hasDub
}: InfoModalBroadcastProps) {
  
  const broadcastDetails = useMemo(() => {
    if (!broadcastInfo?.day || !broadcastInfo?.time || !broadcastInfo?.timezone) {
      return null;
    }
    const normalizedDay = broadcastInfo.day.toLowerCase().replace(/s$/, "");
    const dayMap: Record<string, number> = {
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
      sunday: 7,
    };
    const targetWeekday = dayMap[normalizedDay];
    if (!targetWeekday) return null;
    const [hourStr, minuteStr = "0"] = broadcastInfo.time.split(":");
    const hour = Number(hourStr);
    const minute = Number(minuteStr);
    if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
    const zone = broadcastInfo.timezone || "UTC";
    const nowInZone = DateTime.now().setZone(zone);
    if (!nowInZone.isValid) return null;
    let next = nowInZone
      .startOf("day")
      .plus({ days: (targetWeekday - nowInZone.weekday + 7) % 7 })
      .set({ hour, minute, second: 0, millisecond: 0 });
    if (next <= nowInZone) {
      next = next.plus({ weeks: 1 });
    }
    const nextInIST = next.setZone("Asia/Kolkata");
    if (!nextInIST.isValid) return null;
    const nowInIST = DateTime.now().setZone("Asia/Kolkata");
    const diff = nextInIST.diff(nowInIST, ["days", "hours"]).shiftTo("days", "hours");
    const remainingDays = Math.max(0, Math.floor(diff.days ?? 0));
    const remainingHours = Math.max(0, Math.floor(diff.hours ?? 0));
    return {
      istLabel: `${nextInIST.weekdayLong} at ${nextInIST.toFormat("hh:mm a")} IST`,
      countdown: `${remainingDays} day${remainingDays === 1 ? "" : "s"} ${remainingHours} hour${remainingHours === 1 ? "" : "s"} remaining`,
    };
  }, [broadcastInfo]);

  const isBroadcastActive = broadcastInfo?.status === "airing" || broadcastInfo?.status === "upcoming";
  const shouldShowBroadcast = broadcastLoading || isBroadcastActive;

  if (!shouldShowBroadcast && !hasSub && !hasDub) return null;

  return (
    <div className="bg-white/5 rounded-2xl p-5 flex flex-col md:flex-row gap-6 items-center justify-between border border-white/10 backdrop-blur-sm">
       {/* Audio Toggle */}
       {(hasSub || hasDub) && onAudioPreferenceChange && (
         <div className="flex items-center gap-4 w-full md:w-auto justify-center md:justify-start">
            <span className="text-sm font-medium text-white/60">Audio:</span>
            <div className="flex bg-black/40 rounded-full p-1 border border-white/10">
              <button
                onClick={() => onAudioPreferenceChange("sub")}
                disabled={!hasSub}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  audioPreference === "sub" 
                    ? "bg-[#ff4d4f] text-white shadow-md" 
                    : "text-white/40 hover:text-white/60"
                } ${!hasSub ? "opacity-30 cursor-not-allowed" : ""}`}
              >
                SUB
              </button>
              <button
                onClick={() => onAudioPreferenceChange("dub")}
                disabled={!hasDub}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  audioPreference === "dub" 
                    ? "bg-[#ff4d4f] text-white shadow-md" 
                    : "text-white/40 hover:text-white/60"
                } ${!hasDub ? "opacity-30 cursor-not-allowed" : ""}`}
              >
                DUB
              </button>
            </div>
         </div>
       )}
       
       {/* Broadcast */}
       {shouldShowBroadcast && (
         <div className="flex items-center gap-3 text-center md:text-right w-full md:w-auto justify-center md:justify-end">
            <div className="hidden md:block w-px h-10 bg-white/10 mx-2" />
            <div className="flex flex-col items-center md:items-end">
               <span className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase mb-1">Next Broadcast</span>
               {broadcastLoading ? (
                 <span className="text-sm text-white/60 animate-pulse">Syncing schedule...</span>
               ) : (
                 <>
                   <span className="text-sm font-medium text-white">{broadcastDetails?.istLabel ?? broadcastInfo?.summary ?? "TBA"}</span>
                   {broadcastDetails?.countdown && (
                     <span className="text-xs text-[#ff4d4f] font-medium">{broadcastDetails.countdown}</span>
                   )}
                 </>
               )}
            </div>
         </div>
       )}
    </div>
  );
}