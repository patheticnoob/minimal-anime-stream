export type BroadcastInfo = {
  summary?: string | null;
  day?: string | null;
  time?: string | null;
  timezone?: string | null;
  status?: "airing" | "complete" | "upcoming" | null;
};
