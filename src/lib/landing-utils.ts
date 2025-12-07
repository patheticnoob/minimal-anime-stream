export const normalizeEpisodeNumber = (value?: number | string | null) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return 0;
};

export const deriveDataIdFromSlug = (id?: string | null) => {
  if (!id) return undefined;
  const match = id.trim().match(/(\d+)(?:\/)?$/);
  return match ? match[1] : id.replace(/^\/|\/$/g, "");
};
