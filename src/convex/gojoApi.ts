"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

const GOJO_API_BASE = "https://gojoback.zeabur.app/api/v1";

export const getHome = action({
  args: {},
  handler: async () => {
    try {
      const response = await fetch(`${GOJO_API_BASE}/home`);
      if (!response.ok) throw new Error(`Gojo API returned ${response.status}`);
      return await response.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch home";
      throw new Error(`Unable to load home from Gojo: ${message}`);
    }
  },
});

export const getSpotlight = action({
  args: {},
  handler: async () => {
    try {
      const response = await fetch(`${GOJO_API_BASE}/spotlight`);
      if (!response.ok) throw new Error(`Gojo API returned ${response.status}`);
      return await response.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch spotlight";
      throw new Error(`Unable to load spotlight from Gojo: ${message}`);
    }
  },
});

export const getTopTen = action({
  args: {},
  handler: async () => {
    try {
      const response = await fetch(`${GOJO_API_BASE}/topten`);
      if (!response.ok) throw new Error(`Gojo API returned ${response.status}`);
      return await response.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch top ten";
      throw new Error(`Unable to load top ten from Gojo: ${message}`);
    }
  },
});

export const search = action({
  args: {
    keyword: v.string(),
    page: v.optional(v.number()),
  },
  handler: async (_, args) => {
    try {
      const page = args.page ?? 1;
      const response = await fetch(
        `${GOJO_API_BASE}/search?keyword=${encodeURIComponent(args.keyword)}&page=${page}`
      );
      if (!response.ok) throw new Error(`Gojo API returned ${response.status}`);
      return await response.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to search";
      throw new Error(`Unable to search Gojo: ${message}`);
    }
  },
});

export const getAnimeDetails = action({
  args: { animeId: v.string() },
  handler: async (_, args) => {
    try {
      const response = await fetch(`${GOJO_API_BASE}/anime/${args.animeId}`);
      if (!response.ok) throw new Error(`Gojo API returned ${response.status}`);
      return await response.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch anime details";
      throw new Error(`Unable to load anime details from Gojo: ${message}`);
    }
  },
});

export const getEpisodes = action({
  args: { animeId: v.string() },
  handler: async (_, args) => {
    try {
      const response = await fetch(`${GOJO_API_BASE}/episodes/${args.animeId}`);
      if (!response.ok) throw new Error(`Gojo API returned ${response.status}`);
      return await response.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch episodes";
      throw new Error(`Unable to load episodes from Gojo: ${message}`);
    }
  },
});

export const getServers = action({
  args: { episodeId: v.string() },
  handler: async (_, args) => {
    try {
      const response = await fetch(`${GOJO_API_BASE}/servers/${args.episodeId}`);
      if (!response.ok) throw new Error(`Gojo API returned ${response.status}`);
      return await response.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch servers";
      throw new Error(`Unable to load servers from Gojo: ${message}`);
    }
  },
});
