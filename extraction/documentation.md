# Nothing OS Theme - Complete Extraction Documentation

## Overview
This extraction contains a complete, working implementation of the Nothing OS theme for the anime streaming platform, including all frontend components, the new V2 API flow, video player with HLS proxy logic, and gamepad/controller support.

**Version**: 1.0
**Date**: January 6, 2026
**Status**: Production Ready ✅

---

## 📁 Directory Structure

```
extraction/
├── src/
│   ├── themes/nothing/           # Nothing OS Theme Core
│   │   ├── pages/                # Theme Pages
│   │   │   ├── Landing.tsx       # Landing page with dark mode
│   │   │   ├── Watch.tsx         # Main watch page with video player
│   │   │   ├── Auth.tsx          # Authentication page
│   │   │   └── WatchHistory.tsx  # Watch history page
│   │   ├── components/           # Theme Components
│   │   │   ├── NothingVideoPlayerV2.tsx        # Latest video player (V2)
│   │   │   ├── NothingVideoPlayer.tsx          # Original video player
│   │   │   ├── NothingPlayerControls.tsx       # Custom player controls
│   │   │   ├── NothingPlayerOverlay.tsx        # Player overlay UI
│   │   │   ├── NothingGestureOverlay.tsx       # Gesture support
│   │   │   ├── NothingPlayerGestures.ts        # Gesture logic
│   │   │   ├── NothingPlayerUtils.ts           # Player utilities
│   │   │   ├── NothingNavBar.tsx               # Navigation bar
│   │   │   ├── NothingAnimeInfo.tsx            # Anime info display
│   │   │   ├── NothingEpisodeList.tsx          # Episode list
│   │   │   └── NothingWatchHeader.tsx          # Watch page header
│   │   └── hooks/                # Theme Hooks
│   │       └── useNothingTheme.ts              # Dark mode hook
│   ├── styles/themes/            # Theme Styles
│   │   └── nothing.css           # Complete Nothing OS CSS (587 lines)
│   ├── hooks/                    # Application Hooks
│   │   ├── use-anime-lists-router.ts           # API version router
│   │   ├── use-anime-lists-v2.ts               # V2 API with Jikan enrichment
│   │   ├── use-data-flow.ts                    # Data flow selector
│   │   ├── use-player-logic.ts                 # Video player logic
│   │   ├── use-gamepad.ts                      # Gamepad support
│   │   └── use-gamepad-cursor.ts               # Gamepad cursor control
│   ├── lib/                      # Libraries & Utilities
│   │   ├── external-api-v2.ts                  # V2 API (Hianime)
│   │   ├── anime-cache.ts                      # Anime caching system
│   │   └── vttParser.ts                        # VTT subtitle parser
│   ├── components/               # Shared Components
│   │   ├── GamepadButtonMapping.tsx            # Controller button config
│   │   ├── GamepadSettings.tsx                 # Gamepad settings UI
│   │   ├── GamepadCursor.tsx                   # Virtual cursor
│   │   └── ControllerStatus.tsx                # Controller status display
│   ├── shared/                   # Shared Resources
│   │   ├── types/                # TypeScript Types
│   │   │   └── index.ts          # Core type definitions
│   │   └── components/           # Shared components
│   └── convex/                   # Backend Logic
│       └── http.ts               # HLS proxy HTTP handler
└── documentation.md              # This file
```

---

## 🎨 Nothing OS Theme Features

### Design System
- **Minimalist Aesthetic**: Clean, spacious design with generous padding
- **Rounded Corners**: 999px pills, 32px cards for modern look
- **Glass-morphism**: Backdrop blur effects with semi-transparent backgrounds
- **Premium Shadows**: Subtle elevation with box-shadow
- **Smooth Transitions**: 200-300ms transitions throughout

### Color Scheme

#### Light Mode
```css
--nothing-bg: #f5f6fb
--nothing-fg: #0a0f1f
--nothing-accent: #ff3b3b
--nothing-elevated: #ffffff
```

#### Dark Mode (Cinematic Premium)
```css
--nothing-bg: #0B0D10
--nothing-fg: #F5F5F7
--nothing-accent: #E50914 (Netflix-inspired red)
--nothing-elevated: #1A1D24
```

### Theme Components

#### 1. **NothingVideoPlayerV2** (Latest)
- Full HLS streaming support
- Custom controls with keyboard/gamepad support
- Picture-in-Picture (PiP) mode
- Quality selector
- Volume control
- Playback speed control
- Subtitle/caption support
- Intro/Outro skip functionality
- Progress saving
- Next episode auto-play

**Location**: `src/themes/nothing/components/NothingVideoPlayerV2.tsx`

#### 2. **NothingPlayerControls**
- Custom control bar with gradient overlay
- Play/pause, skip intro/outro buttons
- Progress bar with scrubbing
- Volume slider
- Settings menu (quality, speed, subtitles)
- Fullscreen toggle
- PiP button

**Location**: `src/themes/nothing/components/NothingPlayerControls.tsx`

#### 3. **NothingGestureOverlay**
- Mobile gesture support
- Double-tap left/right to skip 10 seconds
- Swipe up/down for volume
- Single tap to toggle controls
- Visual feedback for gestures

**Location**: `src/themes/nothing/components/NothingGestureOverlay.tsx`

#### 4. **NothingNavBar**
- Theme toggle (light/dark mode)
- Logo and branding
- Navigation links
- Search bar integration
- Responsive mobile menu

**Location**: `src/themes/nothing/components/NothingNavBar.tsx`

#### 5. **Dark Mode Hook**
- localStorage persistence
- Tab synchronization
- System preference detection
- Smooth transitions

**Location**: `src/themes/nothing/hooks/useNothingTheme.ts`

---

## 🔄 V2 API Flow (No V1 Dependencies)

### Architecture Overview
The V2 flow uses the Hianime API directly, enriched with Jikan metadata for comprehensive anime information.

### Key Files

#### 1. **external-api-v2.ts**
Main API interface for fetching anime data.

**Location**: `src/lib/external-api-v2.ts`

**Functions**:
- `fetchHianimeHome()` - Fetch homepage data (spotlight + trending)
- `fetchHianimeSpotlight()` - Fetch spotlight anime
- `fetchHianimeTopTen(period)` - Fetch top 10 anime (today/week/month)
- `searchHianime(query, page)` - Search anime
- `fetchHianimeCategory(category)` - Fetch specific category

**API Endpoint**: `https://hianime-api-jzl7.onrender.com/api/v1`

**Categories Supported**:
- `trending` - Trending anime
- `topAiring` - Currently airing
- `mostPopular` - Most popular
- `mostFavorite` - Most favorited
- `latestCompleted` - Recently completed
- `latestEpisode` - Latest episodes
- `newAdded` - Newly added
- `topUpcoming` - Upcoming releases

#### 2. **use-anime-lists-v2.ts**
Hook for managing anime lists with V2 API and Jikan enrichment.

**Location**: `src/hooks/use-anime-lists-v2.ts`

**Features**:
- Fetches from Hianime API
- Enriches ALL items with Jikan metadata (MAL ID, synopsis, genres, scores, studios)
- Rate limiting (1 req/sec for Jikan)
- In-memory caching
- Retry logic with exponential backoff
- Progressive loading
- Auto-rotating hero banner

**Jikan Enrichment Fields**:
```typescript
{
  malId: number,           // MyAnimeList ID
  synopsis: string,        // Full description
  genres: string[],        // Genre tags
  score: number,           // User rating
  totalEpisodes: number,   // Episode count
  status: string,          // Airing status
  aired: string,           // Air date
  studios: string[]        // Production studios
}
```

#### 3. **use-anime-lists-router.ts**
Router that selects the appropriate API version based on user preference.

**Location**: `src/hooks/use-anime-lists-router.ts`

```typescript
// Routes to V1, V2, or V3 based on dataFlow setting
if (dataFlow === "v2") {
  return useAnimeListsV2();
} else if (dataFlow === "v3") {
  return useAnimeListsV3();
}
// Default to V1
return useAnimeListsV1();
```

#### 4. **use-data-flow.ts**
Hook for managing data flow preference.

**Location**: `src/hooks/use-data-flow.ts`

```typescript
const { dataFlow, setDataFlow, isV1, isV2, isV3 } = useDataFlow();
// Change API version
await setDataFlow("v2");
```

### Usage Example

```typescript
import { useAnimeListsRouter } from "@/hooks/use-anime-lists-router";
import { useDataFlow } from "@/hooks/use-data-flow";

function MyComponent() {
  const { dataFlow, setDataFlow } = useDataFlow();
  const {
    loading,
    popularItems,    // Enriched with Jikan
    airingItems,     // Enriched with Jikan
    heroAnime,       // Auto-rotating
    loadMoreItems,   // Pagination
  } = useAnimeListsRouter();

  // Switch to V2 API
  const switchToV2 = () => setDataFlow("v2");

  return (
    <div>
      <button onClick={switchToV2}>Use V2 API</button>
      {popularItems.map(anime => (
        <div key={anime.id}>
          <h3>{anime.title}</h3>
          <p>{anime.synopsis}</p>
          <p>Score: {anime.score}/10</p>
          <p>Genres: {anime.genres?.join(", ")}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 🎬 Video Player & HLS Proxy Logic

### HLS Proxy Implementation

#### **http.ts** - Convex HTTP Handler
Handles proxying of HLS streams and subtitles to bypass CORS restrictions.

**Location**: `src/convex/http.ts`

**Features**:
- Proxies m3u8 playlists and video segments
- Rewrites URLs in playlists to route through proxy
- Handles byte-range requests (HTTP 206)
- Sets proper CORS headers
- Adds Referer and Origin headers for source authentication
- Supports subtitle (VTT) proxying
- Handles EXT-X-KEY (encryption keys)

**Endpoint**: `/proxy?url=<encoded_url>`

**How It Works**:
1. Client requests video through proxy: `/proxy?url=https://example.com/video.m3u8`
2. Proxy fetches from source with proper headers (Referer, Origin)
3. For playlists, rewrites all URLs to route through proxy
4. Returns modified playlist or raw video segments
5. Preserves range requests for seeking

**Example Proxy URL**:
```typescript
const proxiedUrl = `${base}/proxy?url=${encodeURIComponent(originalUrl)}`;
// https://your-app.convex.site/proxy?url=https%3A%2F%2Fcdn.example.com%2Fvideo.m3u8
```

### Player Logic

#### **use-player-logic.ts**
Core video player logic hook.

**Location**: `src/hooks/use-player-logic.ts`

**Features**:
- Episode fetching with retry logic
- Server selection (HD-2 preferred)
- Source fetching and caching
- Audio preference (sub/dub)
- Progress tracking and saving
- Prefetching next episode
- Intro/outro skip data
- Subtitle track management

**Key Functions**:
```typescript
const {
  videoSource,          // Proxied HLS URL
  videoTitle,           // "Anime Name - Episode 5 (SUB)"
  videoTracks,          // Subtitle tracks
  videoIntro,           // { start: 90, end: 180 }
  videoOutro,           // { start: 1200, end: 1320 }
  playEpisode,          // Play specific episode
  playNextEpisode,      // Auto-advance
  closePlayer,          // Close player
  handleProgressUpdate, // Save progress
  audioPreference,      // "sub" | "dub"
} = usePlayerLogic(isAuthenticated, dataFlow);
```

**Caching Strategy**:
- Episodes cached for 10 minutes
- Sources cached for 5 minutes with audio preference key
- Prefetches current + next episode for instant playback

### Video Player Component

#### **NothingVideoPlayerV2.tsx**
The main video player component using HLS.js.

**Location**: `src/themes/nothing/components/NothingVideoPlayerV2.tsx`

**Technical Details**:
- Uses HLS.js for adaptive streaming
- Custom controls (hides native controls)
- Keyboard shortcuts (Space, Arrow keys, F, M, etc.)
- Gamepad support
- Auto-quality selection
- Manual quality override
- PiP support
- Fullscreen API
- Progress bar scrubbing
- Volume control
- Subtitle rendering

**Keyboard Shortcuts**:
```
Space     - Play/Pause
→ (Right) - Skip forward 10s
← (Left)  - Skip backward 10s
↑ (Up)    - Volume up
↓ (Down)  - Volume down
F         - Toggle fullscreen
M         - Toggle mute
P         - Toggle PiP
I         - Skip intro
O         - Skip outro
```

### Subtitle Parser

#### **vttParser.ts**
Parses VTT subtitle files.

**Location**: `src/lib/vttParser.ts`

Handles WebVTT subtitle format parsing for custom subtitle rendering.

---

## 🎮 Controller/Gamepad Support

### Gamepad Implementation

#### 1. **use-gamepad.ts**
Core gamepad detection and button mapping.

**Location**: `src/hooks/use-gamepad.ts`

**Features**:
- Automatic gamepad detection
- Button press events
- D-pad and analog stick support
- Axis mapping with threshold (0.6)
- Debounced button presses (150ms)

**Button Mappings** (Xbox/PlayStation):
```typescript
GAMEPAD_BUTTONS = {
  A: 0,           // Cross/A
  B: 1,           // Circle/B
  X: 2,           // Square/X
  Y: 3,           // Triangle/Y
  LB: 4,          // L1/LB
  RB: 5,          // R1/RB
  LT: 6,          // L2/LT
  RT: 7,          // R2/RT
  SELECT: 8,      // Share/Select
  START: 9,       // Options/Start
  L3: 10,         // L3
  R3: 11,         // R3
  DPAD_UP: 12,
  DPAD_DOWN: 13,
  DPAD_LEFT: 14,
  DPAD_RIGHT: 15,
}
```

#### 2. **use-gamepad-cursor.ts**
Virtual cursor controlled by gamepad.

**Location**: `src/hooks/use-gamepad-cursor.ts`

**Features**:
- Left analog stick controls cursor
- Sensitivity: 8
- Edge scrolling (50px threshold)
- Auto-hide in fullscreen after 3s
- Hover event simulation
- Click simulation (left/right)

**Usage**:
```typescript
const { cursorPosition, isVisible, simulateClick } = useGamepadCursor();

// Trigger click at cursor position
simulateClick('left');  // Left click
simulateClick('right'); // Right click
```

#### 3. **GamepadButtonMapping.tsx**
UI component showing button mappings.

**Location**: `src/components/GamepadButtonMapping.tsx`

**Default Mappings**:
| Button | Action | Description |
|--------|--------|-------------|
| A | Select / Click | Primary action |
| B | Back / Cancel | Go back or close |
| X | Double Click | Quick action |
| Y | Watchlist | Add/remove from watchlist |
| LB | Previous | Previous episode/item |
| RB | Next | Next episode/item |
| LT | Volume Down | Decrease volume |
| RT | Volume Up | Increase volume |
| START | Menu | Open sidebar |
| SELECT | Settings | Open settings |
| D-PAD ↑↓←→ | Navigate | Move selection |
| L3 | Unused | Left stick click |
| R3 | Cursor Mode | Right stick cursor |

#### 4. **GamepadSettings.tsx**
Settings UI for gamepad configuration.

**Location**: `src/components/GamepadSettings.tsx`

#### 5. **GamepadCursor.tsx**
Visual cursor element.

**Location**: `src/components/GamepadCursor.tsx`

#### 6. **ControllerStatus.tsx**
Shows controller connection status.

**Location**: `src/components/ControllerStatus.tsx`

### Integration Example

```typescript
import { useGamepad, GAMEPAD_BUTTONS } from "@/hooks/use-gamepad";
import { useGamepadCursor } from "@/hooks/use-gamepad-cursor";

function MyComponent() {
  const { connected, buttonPressed } = useGamepad({ enableButtonEvents: true });
  const { cursorPosition, isVisible, simulateClick } = useGamepadCursor();

  useEffect(() => {
    if (buttonPressed === GAMEPAD_BUTTONS.A) {
      simulateClick('left');
    }
    if (buttonPressed === GAMEPAD_BUTTONS.B) {
      // Handle back
    }
  }, [buttonPressed]);

  return (
    <div>
      {connected && <div>Controller Connected!</div>}
      {isVisible && (
        <div
          style={{
            position: 'fixed',
            left: cursorPosition.x,
            top: cursorPosition.y,
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: 'red',
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
}
```

---

## 📦 Dependencies

### Required NPM Packages

```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "hls.js": "^1.x",
    "convex": "^1.x",
    "framer-motion": "^10.x",
    "lucide-react": "^0.x",
    "sonner": "^1.x"
  }
}
```

### Environment Variables

```env
VITE_CONVEX_URL=your-convex-deployment-url
```

---

## 🚀 Setup & Usage

### 1. Install Dependencies

```bash
npm install hls.js convex framer-motion lucide-react sonner
```

### 2. Import Theme CSS

In your main application file:

```typescript
import "@/styles/themes/nothing.css";
```

### 3. Use Nothing Theme Components

```typescript
import { NothingNavBar } from "@/themes/nothing/components/NothingNavBar";
import { Landing } from "@/themes/nothing/pages/Landing";
import { Watch } from "@/themes/nothing/pages/Watch";

function App() {
  return (
    <div className="nothing-theme">
      <NothingNavBar />
      <Landing />
      {/* or */}
      <Watch />
    </div>
  );
}
```

### 4. Enable V2 API Flow

```typescript
import { useDataFlow } from "@/hooks/use-data-flow";

function Settings() {
  const { setDataFlow } = useDataFlow();

  return (
    <button onClick={() => setDataFlow("v2")}>
      Switch to V2 API
    </button>
  );
}
```

### 5. Setup HLS Proxy

Deploy the Convex backend with `http.ts` handler. The proxy will be available at:

```
https://your-app.convex.site/proxy?url=<encoded_url>
```

---

## 🎯 Key Features Summary

### ✅ Nothing OS Theme
- Complete UI implementation
- Light/Dark mode with tab sync
- Responsive design (mobile/desktop)
- Glass-morphism effects
- Premium animations

### ✅ V2 API Flow
- Hianime API integration
- Jikan metadata enrichment
- No V1 dependencies
- Caching & prefetching
- Retry logic

### ✅ Video Player
- HLS streaming
- Custom controls
- Keyboard shortcuts
- Gamepad support
- PiP mode
- Subtitle support
- Intro/outro skip
- Quality selector
- Progress saving

### ✅ HLS Proxy
- CORS bypass
- URL rewriting
- Byte-range requests
- Encryption key handling
- Subtitle proxying

### ✅ Gamepad/Controller
- Auto-detection
- Full button mapping
- Virtual cursor
- Edge scrolling
- Configurable settings

---

## 🔧 Troubleshooting

### Video Won't Play
- Check Convex proxy is deployed
- Verify `VITE_CONVEX_URL` is set
- Check browser console for HLS errors
- Try different episode/server

### Gamepad Not Working
- Press any button to activate gamepad
- Check browser gamepad support: `navigator.getGamepads()`
- Only one gamepad supported at a time

### Dark Mode Not Persisting
- Check localStorage is enabled
- Verify `useNothingTheme` hook is called
- Check for localStorage quota errors

### API Errors
- Verify Hianime API is accessible
- Check Jikan rate limiting (1 req/sec)
- Review console logs for retry attempts

---

## 📝 File Checklist

### Theme Files (16 files)
- [x] Landing.tsx
- [x] Watch.tsx
- [x] Auth.tsx
- [x] WatchHistory.tsx
- [x] NothingVideoPlayerV2.tsx
- [x] NothingVideoPlayer.tsx
- [x] NothingPlayerControls.tsx
- [x] NothingPlayerOverlay.tsx
- [x] NothingGestureOverlay.tsx
- [x] NothingPlayerGestures.ts
- [x] NothingPlayerUtils.ts
- [x] NothingNavBar.tsx
- [x] NothingAnimeInfo.tsx
- [x] NothingEpisodeList.tsx
- [x] NothingWatchHeader.tsx
- [x] useNothingTheme.ts

### V2 API Files (4 files)
- [x] external-api-v2.ts
- [x] use-anime-lists-v2.ts
- [x] use-anime-lists-router.ts
- [x] use-data-flow.ts

### Video Player Files (4 files)
- [x] use-player-logic.ts
- [x] http.ts (HLS proxy)
- [x] anime-cache.ts
- [x] vttParser.ts

### Gamepad Files (6 files)
- [x] use-gamepad.ts
- [x] use-gamepad-cursor.ts
- [x] GamepadButtonMapping.tsx
- [x] GamepadSettings.tsx
- [x] GamepadCursor.tsx
- [x] ControllerStatus.tsx

### Shared Files (3 files)
- [x] shared/types/index.ts
- [x] shared/components/
- [x] styles/themes/nothing.css

---

## 🎓 Learning Resources

### HLS Streaming
- [HLS.js Documentation](https://github.com/video-dev/hls.js/)
- [HTTP Live Streaming Spec](https://datatracker.ietf.org/doc/html/rfc8216)

### Gamepad API
- [MDN Gamepad API](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API)
- [HTML5 Gamepad Tester](https://gamepad-tester.com/)

### Jikan API
- [Jikan MyAnimeList API](https://jikan.moe/)
- [Jikan Rate Limits](https://docs.api.jikan.moe/#section/Information/Rate-Limiting)

### Hianime API
- Endpoint: `https://hianime-api-jzl7.onrender.com/api/v1`
- Categories: `/home`, `/spotlight`, `/topten`, `/search`

---

## 📄 License & Credits

This extraction is based on the original Nothing OS design philosophy and adapted for anime streaming.

**API Credits**:
- Hianime API for anime data
- Jikan (MyAnimeList) for metadata enrichment

**Design Inspiration**:
- Nothing Phone UI/UX principles
- Netflix player controls
- Modern streaming platforms

---

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section
2. Review console logs for errors
3. Verify all dependencies are installed
4. Ensure Convex backend is deployed
5. Test with different browsers (Chrome recommended)

---

**Last Updated**: January 6, 2026
**Version**: 1.0.0
**Status**: Production Ready ✅

---

## 🎉 Ready to Use!

This extraction is a complete, self-contained implementation. All files are copied (not moved) from the original codebase. The current file structure remains unchanged.

To integrate into a new project:
1. Copy the `extraction/src` folder to your project
2. Install dependencies
3. Import theme CSS
4. Use components as shown in examples above

Happy streaming! 🍿
