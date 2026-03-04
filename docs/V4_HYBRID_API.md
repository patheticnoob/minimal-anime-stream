# V4 Hybrid API - Best of Both Worlds

## Overview

V4 is a hybrid API approach that combines the strengths of both Yuma API and Hianime package to deliver the best user experience.

```
┌────────────────────────────────────────────────────────┐
│                    V4 HYBRID FLOW                       │
├────────────────────────────────────────────────────────┤
│                                                         │
│  📱 HOME PAGE                                           │
│  ├─ Source: Yuma API                                   │
│  ├─ Endpoint: https://yumaapi.vercel.app/spotlight     │
│  ├─ Benefits:                                           │
│  │  ✅ High-quality 1366x768 banner images            │
│  │  ✅ Full anime descriptions                         │
│  │  ✅ Spotlight rankings (#1, #2, etc.)              │
│  │  ✅ Release dates                                   │
│  │  ✅ Better home page presentation                  │
│  └─ Sections: Spotlight, Top Airing, Recent, Movies   │
│                                                         │
│  🎮 EPISODES & STREAMING                               │
│  ├─ Source: Hianime NPM Package                        │
│  ├─ Actions: api.hianime.episodes/servers/sources      │
│  ├─ Benefits:                                           │
│  │  ✅ Proven reliability                              │
│  │  ✅ Works with existing caching                     │
│  │  ✅ Subtitle tracks included                        │
│  │  ✅ Intro/outro skip timestamps                     │
│  │  ✅ Multiple server options                         │
│  └─ Used by: use-player-logic.ts (shared by all)      │
│                                                         │
└────────────────────────────────────────────────────────┘
```

## Why V4?

### Problem
- **Yuma API**: Great home page data but unreliable streaming sources (404 errors)
- **Hianime Package**: Reliable streaming but basic home page data (smaller images, no descriptions)

### Solution
Use the best part of each API:

| Feature | V1 (Hianime) | V3 (Yuma) | V4 (Hybrid) |
|---------|--------------|-----------|-------------|
| Hero Banner Quality | 300x400px | 1366x768px ✅ | 1366x768px ✅ |
| Descriptions | ❌ Basic | ✅ Full | ✅ Full |
| Spotlight Rankings | ❌ No | ✅ Yes | ✅ Yes |
| Episode Fetching | ✅ Reliable | ❓ Unknown | ✅ Reliable |
| Streaming Sources | ✅ Working | ❌ 404 errors | ✅ Working |
| Subtitle Tracks | ✅ Yes | ❌ No | ✅ Yes |
| Intro/Outro Skip | ✅ Yes | ❌ No | ✅ Yes |

## Data Flow Example

### 1. User Opens App

```javascript
// V4 Hook fetches home page data from Yuma API
const response = await fetch('https://yumaapi.vercel.app/spotlight');
// Returns:
{
  "id": "one-punch-man-season-3-19932",
  "title": "One-Punch Man Season 3",
  "image": "https://cdn.noitatnemucod.net/thumbnail/1366x768/...",
  "description": "The third season of One Punch Man. Saitama is a hero...",
  "rank": "#3 Spotlight",
  "releaseDate": "Oct 12, 2025",
  "sub": 12,
  "dub": 7
}
```

### 2. User Clicks Anime

```javascript
// ID from Yuma API is passed to player logic
const animeId = "one-punch-man-season-3-19932";
```

### 3. Fetch Episodes (Hianime Package)

```javascript
// use-player-logic.ts (line 22)
const fetchEpisodes = useAction(api.hianime.episodes);
// Calls: client.getEpisodes("one-punch-man-season-3-19932")
// Returns episode list with IDs
```

### 4. User Selects Episode

```javascript
// Get available servers
const fetchServers = useAction(api.hianime.episodeServers);
// Returns: { sub: [...servers], dub: [...servers] }
```

### 5. Play Video (Hianime Package)

```javascript
// Get streaming source
const fetchSources = useAction(api.hianime.episodeSources);
// Returns:
{
  "sources": [{ "file": "https://video.m3u8", "type": "hls" }],
  "tracks": [{ "file": "subtitle.vtt", "label": "English" }],
  "intro": { "start": 90, "end": 120 },
  "outro": { "start": 1320, "end": 1380 }
}
```

## ID Compatibility

Both APIs use the same data source (`hianime.to`), ensuring perfect ID compatibility:

```bash
# Yuma API returns:
"id": "one-punch-man-season-3-19932"
"url": "https://hianime.to/one-punch-man-season-3-19932"

# Hianime package accepts:
client.getEpisodes("one-punch-man-season-3-19932") ✅
```

## Implementation

### File Structure

```
src/
├── hooks/
│   ├── use-anime-lists-v4.ts      ← NEW: V4 hybrid hook
│   ├── use-anime-lists-router.ts  ← Updated: Routes to V4
│   ├── use-data-flow.ts           ← Updated: Added isV4
│   └── use-player-logic.ts        ← No change: Uses Hianime for all versions
├── components/
│   └── ProfileDashboard.tsx       ← Updated: Added V4 button
└── convex/
    └── dataFlow.ts                ← Updated: Validates v4
```

### Key Code Locations

**Home Page Data (Yuma API)**
- `src/hooks/use-anime-lists-v4.ts:70-104` - Fetches spotlight
- `src/hooks/use-anime-lists-v4.ts:33-67` - Fetches paginated lists

**Episodes & Streaming (Hianime Package)**
- `src/hooks/use-player-logic.ts:22-24` - Episode/server/source actions
- `src/convex/hianime.ts:117-163` - Backend Hianime actions

**Router Logic**
- `src/hooks/use-anime-lists-router.ts:21-40` - Selects active hook

## Switching to V4

### Via UI (Recommended)
1. Go to Profile → API Version Settings
2. Click "API v4 (Hybrid) ⚡"
3. Reload page to see improved hero banners

### Via Console
```javascript
// In browser console
await setDataFlow("v4");
location.reload();
```

## Advantages Over Other Versions

### vs V1 (Hianime Package Only)
- ✅ Better hero banners (1366x768 vs 300x400)
- ✅ Full descriptions on home page
- ✅ Spotlight rankings
- ✅ Release dates visible
- ✅ More engaging home page

### vs V3 (Yuma API Only)
- ✅ Reliable episode fetching
- ✅ Working streaming sources
- ✅ Subtitle tracks included
- ✅ Intro/outro skip timestamps
- ✅ Proven stability

## Technical Notes

### Caching
Episodes and sources are cached by `use-player-logic.ts` using the same mechanism for all API versions. V4 benefits from existing cache infrastructure.

### Error Handling
- Home page failures fall back gracefully (empty arrays)
- Episode/streaming failures use Hianime's proven error handling
- Retry logic with exponential backoff

### Performance
- Home page: Direct API calls (fast)
- Episodes: Convex actions with caching (optimized)
- Auto-rotation: 5-second intervals for spotlight items

## Monitoring

Check console logs for V4-specific messages:

```javascript
// Success indicators
'✅ V4 Spotlight loaded - 8 items with descriptions & rankings'
'✅ V4 Top airing loaded from Yuma'
'✅ V4 Recent episodes loaded from Yuma'

// Router confirmation
'🚀 Using v4 HYBRID API hook (Yuma home + Hianime streaming)'
```

## Future Enhancements

Potential improvements for V4:
- [ ] Add Yuma anime info endpoint (richer detail pages)
- [ ] Implement fallback to Hianime home page if Yuma fails
- [ ] Cache spotlight data for offline viewing
- [ ] Add loading skeletons for spotlight items
- [ ] Prefetch spotlight items in background

## Troubleshooting

### Hero banner not showing spotlight
- Check: `curl https://yumaapi.vercel.app/spotlight`
- Verify: Console shows "V4 Spotlight loaded"
- Fallback: System continues with empty hero

### Videos not playing
- Check: `use-player-logic.ts` is using `api.hianime.*` actions
- Verify: Episodes fetched successfully
- Note: V4 uses same streaming as V1 (proven reliable)

### API version not switching
- Clear browser cache
- Check: Profile → Current API shows "v4"
- Verify: Console shows "Using v4 HYBRID API hook"

## Credits

- Yuma API: https://yumaapi.vercel.app
- Hianime Package: npm package `hianime`
- Data Source: hianime.to

## Conclusion

V4 delivers the best user experience by combining:
- 🎨 Beautiful home page (Yuma)
- 🎬 Reliable streaming (Hianime)
- ⚡ Proven stability (existing infrastructure)

**Result**: Premium anime browsing experience with no compromises!
