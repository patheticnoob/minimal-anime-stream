# Nothing OS UI Theme - Movie & Anime Streaming Platform

## Complete Frontend Design System & Gamepad Implementation

---

## 🎨 **CORE DESIGN PHILOSOPHY**

Nothing OS is characterized by:
- **Monochromatic Excellence**: Pure black and white with strategic red accents
- **Dot Matrix Typography**: Unique dotted font style for brand identity
- **Glyph Interface**: Signature LED-style glyphs and indicators
- **Minimalist Brutalism**: Clean, functional, no unnecessary ornaments
- **High Contrast**: Sharp edges, clear hierarchy, maximum readability

---

## 🎯 **COLOR PALETTE**

```css
/* Primary Colors */
--nothing-black: #000000;
--nothing-white: #FFFFFF;
--nothing-red: #FF0000;

/* Grays */
--nothing-gray-900: #0A0A0A;
--nothing-gray-800: #1A1A1A;
--nothing-gray-700: #2A2A2A;
--nothing-gray-600: #3A3A3A;
--nothing-gray-500: #4A4A4A;
--nothing-gray-400: #6A6A6A;
--nothing-gray-300: #8A8A8A;
--nothing-gray-200: #AAAAAA;
--nothing-gray-100: #CCCCCC;

/* Functional Colors */
--nothing-accent: #FF0000;
--nothing-success: #FFFFFF;
--nothing-warning: #FF0000;
--nothing-error: #FF0000;

/* Opacity Variants */
--nothing-overlay: rgba(0, 0, 0, 0.85);
--nothing-surface: rgba(26, 26, 26, 0.95);
--nothing-border: rgba(255, 255, 255, 0.1);
--nothing-divider: rgba(255, 255, 255, 0.05);
```

---

## 📝 **TYPOGRAPHY**

### Font Families
```css
/* Primary Font - Dot Matrix Style */
--font-primary: 'Ndot', 'Courier New', monospace;

/* Fallback Modern */
--font-modern: 'Inter', -apple-system, sans-serif;

/* Monospace for Metadata */
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Font Sizes
```css
--text-xs: 10px;
--text-sm: 12px;
--text-base: 14px;
--text-lg: 16px;
--text-xl: 20px;
--text-2xl: 24px;
--text-3xl: 32px;
--text-4xl: 40px;
--text-5xl: 56px;
--text-6xl: 72px;
```

### Font Weights
```css
--font-light: 300;
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

---

## 🏠 **HOME PAGE DESIGN**

### Hero Section
```
LAYOUT:
- Full viewport height (100vh)
- Featured content with large backdrop
- Minimalist overlay with dot matrix title
- Glyph indicators for rating/status

STRUCTURE:
┌─────────────────────────────────────────┐
│  [Featured Backdrop - Dark Gradient]    │
│                                          │
│  ⚫ ⚫ ⚫  FEATURED TITLE                 │
│  Genre • Year • Rating                   │
│                                          │
│  [████░░░░] Progress Bar (if watching)   │
│                                          │
│  [▶ PLAY]  [+ MY LIST]  [ℹ INFO]       │
│                                          │
│  Synopsis in dot matrix font...          │
└─────────────────────────────────────────┘

STYLING:
- Backdrop: 60% opacity black overlay
- Title: 72px, dot matrix font, white
- Metadata: 14px, monospace, gray-300
- Buttons: Outlined white borders, red on hover
- Progress bar: White fill, red border, 4px height
```

### Content Rows

```
ROW STRUCTURE:
┌────────────────────────────────────────┐
│ SECTION TITLE ————————————— [→]       │
│                                         │
│ [Card] [Card] [Card] [Card] [Card]     │
└────────────────────────────────────────┘

SPACING:
- Row Gap: 60px
- Card Gap: 16px
- Section Padding: 48px horizontal
- Title to Cards: 24px

CATEGORIES:
1. Continue Watching
2. Trending Now
3. Top Rated
4. Recently Added
5. Genres (Action, Anime, Drama, etc.)
```

---

## 🎴 **CARD DESIGN**

### Movie/Anime Card (Vertical)

```
DIMENSIONS:
- Width: 280px
- Height: 420px (16:9 poster ratio)
- Border Radius: 0px (sharp corners)

STRUCTURE:
┌──────────────┐
│              │
│   [POSTER]   │
│              │
│   [⚫ GLYPH]  │ ← Top-right corner indicator
│              │
├──────────────┤
│ TITLE        │
│ Year • Genre │
│ [██░░] 75%   │ ← Rating/Progress
└──────────────┘

STATES:
1. Default: Border 1px white opacity 10%
2. Hover: Scale 1.05, border white opacity 30%, red glow
3. Focused (Gamepad): Border 2px solid red, glow effect
4. Playing: Red dot glyph pulsing

OVERLAY (On Hover):
- Black gradient from bottom
- White text, 14px
- Quick action buttons: Play, Info, Add
- Fade in 200ms
```

### Episode Card (Horizontal)

```
DIMENSIONS:
- Width: 100%
- Height: 160px

STRUCTURE:
┌─────────┬────────────────────────────┐
│         │ Episode 1: Title           │
│ THUMB   │ 24min • Watched 60%        │
│ [▶]     │ ────────────────────       │
│         │ Synopsis preview...        │
└─────────┴────────────────────────────┘
│ 320px   │ Flexible                   │

STYLING:
- Thumbnail: 16:9 ratio, grayscale filter
- Border: 1px white 10% opacity
- Hover: Color thumbnail, red border-left 3px
- Progress bar: Under metadata, white/red
```

---

## 📺 **WATCH PAGE LAYOUT**

### Structure

```
┌──────────────────────────────────────────────┐
│         VIDEO PLAYER (16:9)                  │
│         [Fullscreen Available]               │
└──────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────┐
│  ← BACK                                      │
│                                               │
│  ⚫ ⚫ ⚫  ANIME/MOVIE TITLE                   │
│  Season 1 • Episode 12 • "Episode Title"     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                               │
│  [EPISODES] [DETAILS] [RELATED]              │
│                                               │
│  ┌─────────────────┐                         │
│  │ Episodes Grid   │                         │
│  │ [1][2][3][4]    │                         │
│  │ [5][6][7][8]    │                         │
│  └─────────────────┘                         │
└──────────────────────────────────────────────┘

SPACING:
- Player to Content: 32px
- Content Padding: 48px horizontal
- Tab Navigation: 40px height, monospace font
- Episode Grid Gap: 12px
```

### Episode Grid (For Series)

```
GRID LAYOUT:
- Columns: Auto-fit, min 140px, max 180px
- Gap: 12px
- Rows: Auto

EPISODE CELL:
┌──────────────┐
│  [THUMB]     │
│  ⚫ Ep 01     │ ← Glyph if watched
│  24min       │
└──────────────┘

STATES:
- Current: Red border 2px, white text
- Watched: White glyph indicator
- Unwatched: Gray border, gray text
- Hover/Focus: White border, scale 1.02
```

### Details Tab

```
LAYOUT:
┌─────────────────────────────────────────┐
│ SYNOPSIS                                 │
│ Long form description text...            │
│                                          │
│ METADATA GRID                            │
│ Release:  2024                           │
│ Genres:   Action, Sci-Fi                 │
│ Rating:   ⚫⚫⚫⚫⚫ 9.2/10                  │
│ Studio:   Production Co.                 │
│                                          │
│ CAST & CREW                              │
│ [Avatar] Name - Role                     │
│ [Avatar] Name - Role                     │
└─────────────────────────────────────────┘

STYLING:
- Text: 14px, line-height 1.6, gray-200
- Labels: 12px, monospace, gray-400, uppercase
- Values: 14px, white
- Grid: 2 columns on desktop, 1 on mobile
```

---

## 🎮 **GAMEPAD CONTROLS SYSTEM**

### Control Mapping

```javascript
// BUTTON MAPPING
const GAMEPAD_MAP = {
  // Face Buttons (PlayStation / Xbox)
  BUTTON_A: 0,        // Cross / A - Select/Confirm
  BUTTON_B: 1,        // Circle / B - Back/Cancel
  BUTTON_X: 2,        // Square / X - Quick Action
  BUTTON_Y: 3,        // Triangle / Y - Info/Options

  // Shoulder Buttons
  LB: 4,              // L1 / LB - Previous Tab
  RB: 5,              // R1 / RB - Next Tab
  LT: 6,              // L2 / LT - Page Up
  RT: 7,              // R2 / RT - Page Down

  // Special Buttons
  SELECT: 8,          // Select / View - Filter Menu
  START: 9,           // Start / Menu - Main Menu
  L3: 10,             // L3 - Search
  R3: 11,             // R3 - Toggle Fullscreen

  // D-Pad
  DPAD_UP: 12,
  DPAD_DOWN: 13,
  DPAD_LEFT: 14,
  DPAD_RIGHT: 15,

  // Analog Sticks (Axes)
  LEFT_STICK_X: 0,    // -1 to 1
  LEFT_STICK_Y: 1,    // -1 to 1
  RIGHT_STICK_X: 2,   // -1 to 1 (Scroll horizontal)
  RIGHT_STICK_Y: 3,   // -1 to 1 (Scroll vertical)
};
```

### Navigation Behavior

```javascript
// FOCUS NAVIGATION SYSTEM

class GamepadNavigator {
  // Grid Navigation
  navigateGrid(direction) {
    /*
    - Calculate focusable elements in grid
    - Determine rows/columns dynamically
    - Move focus based on direction
    - Wrap around edges (optional)
    - Smooth scroll to element
    - Trigger focus animations
    */
  }

  // Row Navigation (Horizontal Scrolling)
  navigateRow(direction) {
    /*
    - Focus next/previous card in row
    - Lazy load adjacent items
    - Smooth scroll container
    - Handle edge cases (first/last item)
    */
  }

  // Section Navigation (Vertical)
  navigateSection(direction) {
    /*
    - Jump between content rows
    - Remember horizontal position
    - Skip hidden sections
    - Scroll page smoothly
    */
  }
}
```

### Context-Specific Controls

**HOME PAGE:**
```
D-Pad/Left Stick:
  ↑↓ - Navigate between rows
  ←→ - Navigate cards within row

A Button: Play/Select content
B Button: (Not used on home)
X Button: Add to list
Y Button: Show info modal

Bumpers:
  LB/RB - Quick category jump
  LT/RT - Fast scroll rows

Right Stick:
  ↑↓ - Smooth page scroll
  ←→ - Fast horizontal scroll in row
```

**WATCH PAGE:**
```
D-Pad:
  ↑↓ - Navigate tabs/episodes
  ←→ - Seek video (±10s)

A Button: Play/Pause
B Button: Back to previous page
X Button: Mark as watched
Y Button: Episode options

Bumpers:
  LB/RB - Previous/Next episode
  LT/RT - Skip intro/outro

Right Stick Y: Volume control
```

**VIDEO PLAYER (Focused):**
```
D-Pad/Left Stick:
  ←→ - Seek ±10 seconds
  ↑↓ - Volume ±5%

A Button: Play/Pause
B Button: Exit fullscreen
Y Button: Toggle subtitles

Bumpers:
  LB/RB - Previous/Next episode
  LT/RT - Skip ±30 seconds

R3: Toggle fullscreen
```

### Focus Visual Feedback

```css
/* Gamepad Focus Styles */
.focusable {
  position: relative;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.focusable.gamepad-focus {
  /* Red border glow */
  outline: 2px solid var(--nothing-red);
  outline-offset: 4px;
  box-shadow:
    0 0 0 2px var(--nothing-red),
    0 0 20px rgba(255, 0, 0, 0.5),
    0 0 40px rgba(255, 0, 0, 0.2);

  /* Scale up */
  transform: scale(1.05);
  z-index: 10;
}

/* Glyph Indicator for Focused */
.focusable.gamepad-focus::before {
  content: '⚫';
  position: absolute;
  top: -12px;
  right: -12px;
  color: var(--nothing-red);
  font-size: 20px;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

### Gamepad UI Hints

```
BOTTOM-RIGHT OVERLAY (Auto-hide after 3s):
┌────────────────────────────────┐
│  🎮 A Select  B Back           │
│     X Add     Y Info           │
│     LB/RB Tabs                 │
└────────────────────────────────┘

STYLING:
- Position: Fixed, bottom-right
- Background: rgba(0, 0, 0, 0.9)
- Border: 1px white 20% opacity
- Font: 12px, monospace
- Icons: White, text: gray-300
- Padding: 16px
- Fade out after 3s idle
```

---

## ⚡ **PRELOADER DESIGN**

### Initial Page Load

```
FULLSCREEN PRELOADER:
┌──────────────────────────────────────┐
│                                       │
│                                       │
│            ⚫ ⚫ ⚫                    │
│                                       │
│         [████████░░]                  │
│            75%                        │
│                                       │
└──────────────────────────────────────┘

ANIMATION:
- Three dots: Sequenced pulse (0.2s delay each)
- Progress bar: Fills left to right
- Percentage: Counts up (animated number)
- Duration: Min 1s, max 3s
- Easing: Cubic-bezier(0.4, 0, 0.2, 1)

STYLING:
- Background: Pure black (#000000)
- Dots: White, 24px diameter
- Bar: White fill, red border, 4px height, 200px width
- Text: 14px, monospace, gray-300
```

### Content Loading (In-Page)

```
ROW SKELETON:
┌────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓ ——————————————         │
│                                     │
│ [▓▓▓] [▓▓▓] [▓▓▓] [▓▓▓] [▓▓▓]     │
└────────────────────────────────────┘

CARD SKELETON:
┌──────────────┐
│  ▓▓▓▓▓▓▓▓▓▓  │
│  ▓▓▓▓▓▓▓▓▓▓  │
│  ▓▓▓▓▓▓▓▓▓▓  │
│  ▓▓▓▓▓▓▓▓▓▓  │
├──────────────┤
│ ▓▓▓▓▓▓▓     │
│ ▓▓▓▓ ▓▓▓    │
└──────────────┘

ANIMATION:
- Shimmer effect: Linear gradient sweep
- Direction: Left to right
- Duration: 1.5s infinite
- Colors: gray-800 → gray-600 → gray-800
```

```css
/* Skeleton Shimmer */
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--nothing-gray-800) 0%,
    var(--nothing-gray-600) 50%,
    var(--nothing-gray-800) 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 1.5s infinite linear;
}
```

---

## 🎭 **MODAL & OVERLAY DESIGN**

### Info Modal

```
CENTERED MODAL (800px max width):
┌────────────────────────────────────────┐
│  ⚫ ⚫ ⚫  MOVIE TITLE              [✕] │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                         │
│  [▶ PLAY]  [+ MY LIST]                 │
│                                         │
│  ┌──────────┐  Synopsis text here...   │
│  │ POSTER   │  Full description with    │
│  │          │  multiple lines...        │
│  └──────────┘                           │
│                                         │
│  DETAILS                                │
│  Genres: Action, Sci-Fi                 │
│  Year: 2024 • Rating: 9.2               │
│  Duration: 2h 15min                     │
│                                         │
│  RELATED CONTENT                        │
│  [Card] [Card] [Card]                   │
└────────────────────────────────────────┘

BACKDROP:
- Black overlay: 85% opacity
- Blur background: 20px (optional, expensive)

MODAL STYLING:
- Background: gray-900
- Border: 1px white 15% opacity
- Border-radius: 0px
- Box-shadow: 0 20px 60px rgba(0,0,0,0.8)
- Padding: 32px

ANIMATION:
- Enter: Fade in + scale from 0.95 to 1
- Exit: Fade out + scale to 0.95
- Duration: 250ms
- Easing: Cubic-bezier(0.4, 0, 0.2, 1)
```

### Filter/Menu Sidebar

```
SLIDE-IN FROM LEFT (400px width):
┌─────────────────────────┐
│  FILTERS          [✕]   │
│  ━━━━━━━━━━━━━━━━━━━━  │
│                          │
│  GENRE                   │
│  ☐ Action                │
│  ☑ Anime                 │
│  ☐ Comedy                │
│  ☐ Drama                 │
│                          │
│  YEAR                    │
│  [2024 ————————— 1990]   │
│                          │
│  RATING                  │
│  [9.0+ ————————— Any]    │
│                          │
│  [RESET]    [APPLY]      │
└─────────────────────────┘

STYLING:
- Background: Pure black (#000000)
- Border-right: 1px white 15% opacity
- Checkboxes: Custom, red when checked
- Sliders: White track, red thumb
- Buttons: Outlined white, filled red on apply

ANIMATION:
- Slide from left: translateX(-100%) to 0
- Duration: 300ms
- Easing: Cubic-bezier(0.4, 0, 0.2, 1)
```

---

## 🔍 **SEARCH INTERFACE**

### Search Overlay (Fullscreen)

```
FULLSCREEN OVERLAY:
┌──────────────────────────────────────────┐
│  [🔍 Search movies, anime...]      [✕]  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                           │
│  RESULTS (247)                            │
│                                           │
│  ┌───┬─────────────────────────────────┐ │
│  │ T │ Movie Title (2024)              │ │
│  │ H │ Action, Sci-Fi • 8.5/10         │ │
│  └───┴─────────────────────────────────┘ │
│                                           │
│  ┌───┬─────────────────────────────────┐ │
│  │ T │ Anime Series S01E12             │ │
│  │ H │ Adventure • 9.2/10              │ │
│  └───┴─────────────────────────────────┘ │
│                                           │
└──────────────────────────────────────────┘

SEARCH INPUT:
- Full width, centered, max 800px
- Height: 64px
- Font: 24px, white
- Background: gray-900
- Border: 2px white 20% opacity
- Focus: Red border, glow effect
- Icon: Left side, 24px, gray-400

RESULTS:
- List view with thumbnails
- Instant search (debounced 300ms)
- Highlight matching text in red
- Group by type: Movies, Series, Anime
- Infinite scroll or pagination
```

---

## 📱 **RESPONSIVE BREAKPOINTS**

```css
/* Mobile First Approach */

/* Extra Small: 0-639px */
@media (max-width: 639px) {
  - Single column cards
  - Stack player controls
  - Hamburger menu
  - Touch-optimized buttons (44px min)
}

/* Small: 640-767px */
@media (min-width: 640px) {
  - 2 column grid
  - Reduced padding
}

/* Medium: 768-1023px */
@media (min-width: 768px) {
  - 3-4 column grid
  - Show sidebar navigation
  - Larger hero section
}

/* Large: 1024-1279px */
@media (min-width: 1024px) {
  - 4-5 column grid
  - Full navigation
  - Standard desktop layout
}

/* Extra Large: 1280px+ */
@media (min-width: 1280px) {
  - 5-6 column grid
  - Max content width: 1920px
  - Increased spacing
}
```

---

## 🎬 **ANIMATION SPECIFICATIONS**

### Micro-interactions

```css
/* Hover Scale */
.card:hover {
  transform: scale(1.05);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Button Press */
.button:active {
  transform: scale(0.95);
  transition: transform 0.1s;
}

/* Glyph Pulse */
@keyframes glyph-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.1);
  }
}

/* Shimmer Text */
@keyframes shimmer-text {
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
}

/* Slide Up */
@keyframes slide-up {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Red Glow */
@keyframes red-glow {
  0%, 100% {
    box-shadow: 0 0 10px rgba(255, 0, 0, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(255, 0, 0, 0.8);
  }
}
```

### Page Transitions

```javascript
// Framer Motion Variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3
    }
  }
};

const cardStagger = {
  container: {
    enter: {
      transition: {
        staggerChildren: 0.05
      }
    }
  },
  item: {
    initial: { opacity: 0, y: 20 },
    enter: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4
      }
    }
  }
};
```

---

## 🎯 **SPECIAL COMPONENTS**

### Glyph Indicators

```
USAGE: Status indicators throughout UI

⚫ - Primary indicator (white)
🔴 - Active/Playing (red, pulsing)
⭕ - Loading (spinning)
✓ - Completed (white)
━ - Progress bar segment

SIZES:
- Small: 8px (inline with text)
- Medium: 16px (card corners)
- Large: 24px (hero section)

ANIMATIONS:
- Pulse: 1.5s ease-in-out infinite
- Spin: 1s linear infinite
- Fade: 0.3s ease
```

### Progress Bars

```css
.progress-bar {
  /* Container */
  width: 100%;
  height: 4px;
  background: var(--nothing-gray-700);
  border: 1px solid var(--nothing-border);
  position: relative;
  overflow: hidden;
}

.progress-bar__fill {
  /* Fill */
  height: 100%;
  background: var(--nothing-white);
  border-right: 2px solid var(--nothing-red);
  transition: width 0.3s ease;
}

.progress-bar__buffer {
  /* Buffered content */
  position: absolute;
  height: 100%;
  background: var(--nothing-gray-600);
  opacity: 0.5;
}

/* Indeterminate loading */
.progress-bar--loading .progress-bar__fill {
  animation: loading-bar 1.5s ease-in-out infinite;
}

@keyframes loading-bar {
  0% {
    width: 0;
    margin-left: 0;
  }
  50% {
    width: 40%;
    margin-left: 30%;
  }
  100% {
    width: 0;
    margin-left: 100%;
  }
}
```

### Toast Notifications

```
POSITION: Bottom-right, stacked

┌──────────────────────────────────┐
│  ⚫  Added to My List             │
│     Title of Movie         [✕]   │
└──────────────────────────────────┘

STYLING:
- Background: gray-900, 95% opacity
- Border: 1px white 20% opacity
- Border-left: 3px solid red (accent)
- Padding: 16px
- Min-width: 320px
- Max-width: 480px

VARIANTS:
- Success: White glyph, white left border
- Error: Red glyph, red left border
- Info: White glyph, gray left border
- Warning: Red glyph, orange left border

ANIMATION:
- Enter: Slide in from right + fade
- Exit: Slide out to right + fade
- Duration: 300ms
- Auto-dismiss: 3-5 seconds
- Pause on hover
```

---

## 🛠️ **IMPLEMENTATION NOTES**

### Required Libraries

```json
{
  "dependencies": {
    "react": "^18.x",
    "react-router": "^6.x",
    "framer-motion": "^10.x",
    "react-intersection-observer": "^9.x",
    "@radix-ui/react-dialog": "^1.x",
    "@radix-ui/react-select": "^2.x",
    "@radix-ui/react-slider": "^1.x"
  }
}
```

### Gamepad Implementation Hooks

```typescript
// useGamepad.ts
import { useEffect, useState } from 'react';

export const useGamepad = () => {
  const [gamepad, setGamepad] = useState<Gamepad | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const handleConnect = (e: GamepadEvent) => {
      setGamepad(e.gamepad);
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      setGamepad(null);
      setIsConnected(false);
    };

    window.addEventListener('gamepadconnected', handleConnect);
    window.addEventListener('gamepaddisconnected', handleDisconnect);

    return () => {
      window.removeEventListener('gamepadconnected', handleConnect);
      window.removeEventListener('gamepaddisconnected', handleDisconnect);
    };
  }, []);

  return { gamepad, isConnected };
};

// useGamepadNavigation.ts
export const useGamepadNavigation = (
  onNavigate: (direction: Direction) => void,
  onSelect: () => void,
  onBack: () => void
) => {
  const { gamepad, isConnected } = useGamepad();

  useEffect(() => {
    if (!isConnected || !gamepad) return;

    const pollGamepad = () => {
      const gp = navigator.getGamepads()[gamepad.index];
      if (!gp) return;

      // D-Pad navigation
      if (gp.buttons[12].pressed) onNavigate('up');
      if (gp.buttons[13].pressed) onNavigate('down');
      if (gp.buttons[14].pressed) onNavigate('left');
      if (gp.buttons[15].pressed) onNavigate('right');

      // Face buttons
      if (gp.buttons[0].pressed) onSelect();
      if (gp.buttons[1].pressed) onBack();

      // Analog sticks with deadzone
      const deadzone = 0.25;
      if (Math.abs(gp.axes[0]) > deadzone) {
        onNavigate(gp.axes[0] > 0 ? 'right' : 'left');
      }
      if (Math.abs(gp.axes[1]) > deadzone) {
        onNavigate(gp.axes[1] > 0 ? 'down' : 'up');
      }
    };

    const interval = setInterval(pollGamepad, 100);
    return () => clearInterval(interval);
  }, [gamepad, isConnected, onNavigate, onSelect, onBack]);
};
```

### Focus Management

```typescript
// useFocusManager.ts
export const useFocusManager = () => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [focusMode, setFocusMode] = useState<'mouse' | 'gamepad'>('mouse');
  const focusableElements = useRef<HTMLElement[]>([]);

  const registerFocusable = (element: HTMLElement) => {
    if (!focusableElements.current.includes(element)) {
      focusableElements.current.push(element);
    }
  };

  const moveFocus = (direction: Direction) => {
    setFocusMode('gamepad');

    // Calculate next index based on direction and grid layout
    let nextIndex = focusedIndex;

    switch (direction) {
      case 'up':
        nextIndex = Math.max(0, focusedIndex - getColumnCount());
        break;
      case 'down':
        nextIndex = Math.min(
          focusableElements.current.length - 1,
          focusedIndex + getColumnCount()
        );
        break;
      case 'left':
        nextIndex = focusedIndex > 0 ? focusedIndex - 1 : focusedIndex;
        break;
      case 'right':
        nextIndex = focusedIndex < focusableElements.current.length - 1
          ? focusedIndex + 1
          : focusedIndex;
        break;
    }

    setFocusedIndex(nextIndex);
    focusableElements.current[nextIndex]?.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  };

  const handleSelect = () => {
    focusableElements.current[focusedIndex]?.click();
  };

  return {
    focusedIndex,
    focusMode,
    registerFocusable,
    moveFocus,
    handleSelect
  };
};
```

---

## 🎨 **THEMING & CUSTOMIZATION**

### CSS Custom Properties Setup

```css
:root {
  /* Colors */
  --nothing-black: #000000;
  --nothing-white: #FFFFFF;
  --nothing-red: #FF0000;

  /* Spacing Scale */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;

  /* Border Radius (None for Nothing OS) */
  --radius-none: 0px;

  /* Transitions */
  --transition-fast: 150ms;
  --transition-base: 250ms;
  --transition-slow: 400ms;
  --easing: cubic-bezier(0.4, 0, 0.2, 1);

  /* Z-Index Scale */
  --z-base: 1;
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-fixed: 300;
  --z-modal-backdrop: 400;
  --z-modal: 500;
  --z-popover: 600;
  --z-tooltip: 700;
}
```

### Dark Mode (Primary) / Light Mode (Optional)

```css
/* Light mode variant (if needed) */
[data-theme="light"] {
  --nothing-black: #FFFFFF;
  --nothing-white: #000000;
  --nothing-gray-900: #F5F5F5;
  --nothing-gray-800: #E5E5E5;
  /* Invert all gray values */
}
```

---

## 📊 **PERFORMANCE CONSIDERATIONS**

### Image Optimization

```typescript
// Responsive image loading
<img
  src={thumbnail.small}
  srcSet={`
    ${thumbnail.small} 400w,
    ${thumbnail.medium} 800w,
    ${thumbnail.large} 1200w
  `}
  sizes="(max-width: 640px) 100vw,
         (max-width: 1024px) 50vw,
         280px"
  loading="lazy"
  decoding="async"
/>
```

### Lazy Loading

```typescript
// Intersection Observer for cards
const { ref, inView } = useInView({
  threshold: 0.1,
  triggerOnce: true
});

return (
  <div ref={ref}>
    {inView ? <Card data={content} /> : <CardSkeleton />}
  </div>
);
```

### Virtual Scrolling

```typescript
// For large grids (500+ items)
import { useVirtualizer } from '@tanstack/react-virtual';

const rowVirtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 420, // Card height
  overscan: 5
});
```

---

## ✅ **ACCESSIBILITY**

### Keyboard Navigation

```typescript
// Full keyboard support alongside gamepad
<Card
  tabIndex={0}
  role="button"
  aria-label={`Play ${title}`}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handlePlay();
    }
  }}
/>
```

### Screen Reader Support

```html
<!-- Announce content changes -->
<div aria-live="polite" aria-atomic="true">
  {notification}
</div>

<!-- Skip navigation -->
<a href="#main-content" class="skip-link">
  Skip to content
</a>
```

### Focus Indicators

```css
/* Visible focus for keyboard users */
*:focus-visible {
  outline: 2px solid var(--nothing-red);
  outline-offset: 4px;
}

/* Hide focus for mouse users */
*:focus:not(:focus-visible) {
  outline: none;
}
```

---

## 🧭 **NAVIGATION DESIGN**

### Top Navigation Bar

```
STRUCTURE (Fixed Position):
┌────────────────────────────────────────────────────────────┐
│  [⚫ LOGO]    HOME  MOVIES  SERIES  ANIME    [🔍] [👤]    │
└────────────────────────────────────────────────────────────┘

STYLING:
- Height: 64px
- Background: rgba(0, 0, 0, 0.95) with backdrop-blur
- Border-bottom: 1px solid rgba(255, 255, 255, 0.1)
- Position: Fixed, top: 0, z-index: 300

LOGO:
- Three dot glyph (⚫ ⚫ ⚫) + site name
- Dot matrix font, 18px
- White color, red on hover

MENU ITEMS:
- Font: 14px, uppercase, monospace
- Spacing: 32px between items
- Hover: Red underline, 2px thick
- Active: Red text color

ICONS (Search, Profile):
- Size: 24px
- White color, red on hover
- Click to open overlay/menu
```

### Mobile Navigation (Hamburger)

```
HAMBURGER ICON (Top-left on mobile):
━━━
━━━
━━━

MOBILE MENU (Slide from left):
┌─────────────────────────┐
│  ⚫ ⚫ ⚫  SITE NAME      │
│  ━━━━━━━━━━━━━━━━━━━━  │
│                          │
│  HOME                    │
│  MOVIES                  │
│  SERIES                  │
│  ANIME                   │
│  MY LIST                 │
│  SETTINGS                │
│                          │
│  ━━━━━━━━━━━━━━━━━━━━  │
│                          │
│  [LOGOUT]                │
└─────────────────────────┘

STYLING:
- Full height, 320px width
- Background: Pure black
- Border-right: 1px solid white 15%
- Menu items: 20px vertical padding
- Active item: Red left border 3px
- Animation: Slide in 300ms
```

### Sidebar Navigation (Optional, Desktop)

```
LEFT SIDEBAR (Fixed):
┌──────────────┐
│  ⚫ ⚫ ⚫      │
│              │
│  [⌂] Home    │
│  [▶] Movies  │
│  [≣] Series  │
│  [✦] Anime   │
│  [❤] My List │
│              │
│  ━━━━━━━━━  │
│              │
│  [⚙] Settings│
│  [?] Help    │
└──────────────┘

DIMENSIONS:
- Width: 240px
- Full height, fixed position
- Collapsible to 64px (icons only)

STYLING:
- Background: rgba(10, 10, 10, 0.98)
- Border-right: 1px solid rgba(255, 255, 255, 0.1)
- Icons: 20px, white
- Text: 14px, gray-300
- Hover: Red icon + white text
- Active: Red background 10% opacity
```

---

## 🎞️ **GENRE & CATEGORY PAGES**

### Browse Page Layout

```
STRUCTURE:
┌──────────────────────────────────────────────┐
│  [FILTERS ≡]     MOVIES • ACTION        [⚙]  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                               │
│  Showing 247 results                          │
│                                               │
│  [Card] [Card] [Card] [Card] [Card] [Card]   │
│  [Card] [Card] [Card] [Card] [Card] [Card]   │
│  [Card] [Card] [Card] [Card] [Card] [Card]   │
│  [Card] [Card] [Card] [Card] [Card] [Card]   │
│                                               │
│  [← PREV]  1 2 3 ... 25  [NEXT →]            │
└──────────────────────────────────────────────┘

GRID:
- Responsive: 2-6 columns depending on viewport
- Gap: 24px horizontal, 32px vertical
- Cards: Same as home page cards
- Pagination: Bottom, monospace font

FILTERS BAR:
- Sticky below navigation
- Background: gray-900
- Border: 1px solid white 10%
- Quick filters: Genre, Year, Rating, Sort
- Click to open sidebar with advanced filters
```

### Sort & Filter Options

```
SORT DROPDOWN:
┌─────────────────────┐
│  SORT BY            │
│  ━━━━━━━━━━━━━━━  │
│  • Latest          │
│  ○ Rating          │
│  ○ Trending        │
│  ○ A-Z             │
│  ○ Release Year    │
└─────────────────────┘

FILTER TAGS (Active filters):
[ACTION ✕] [2024 ✕] [8.0+ ✕]

STYLING:
- Tags: gray-800 background, white text
- Border: 1px solid white 20%
- Close icon: Red on hover
- Padding: 8px 12px
- Gap: 8px between tags
```

---

## 👤 **USER PROFILE & MY LIST**

### Profile Dropdown

```
DROPDOWN (Top-right):
┌──────────────────────────┐
│  [Avatar] Username       │
│  ━━━━━━━━━━━━━━━━━━━━  │
│  My List                 │
│  Watch History           │
│  Settings                │
│  ━━━━━━━━━━━━━━━━━━━━  │
│  Logout                  │
└──────────────────────────┘

STYLING:
- Width: 240px
- Background: gray-900, 98% opacity
- Border: 1px solid white 15%
- Items: 14px, 16px vertical padding
- Hover: gray-800 background
- Logout: Red text color
```

### My List Page

```
LAYOUT:
┌──────────────────────────────────────────────┐
│  MY LIST                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                               │
│  127 items • Last updated today               │
│                                               │
│  [▶ PLAY ALL]  [SORT ▾]  [FILTER ≡]         │
│                                               │
│  [Card] [Card] [Card] [Card] [Card] [Card]   │
│  [Card] [Card] [Card] [Card] [Card] [Card]   │
│                                               │
└──────────────────────────────────────────────┘

FEATURES:
- Remove button on hover (X icon, red)
- Sort: Date added, A-Z, Rating
- Filter: Movies, Series, Anime
- Empty state with add content prompt
```

---

## 🔒 **AUTH & ONBOARDING**

### Login/Signup Page

```
CENTERED MODAL (400px width):
┌──────────────────────────────────────┐
│                                       │
│         ⚫ ⚫ ⚫                       │
│         SITE NAME                     │
│                                       │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                       │
│  Email                                │
│  [________________]                   │
│                                       │
│  Password                             │
│  [________________]                   │
│                                       │
│  [SIGN IN]                            │
│                                       │
│  Don't have an account? Sign up       │
│                                       │
└──────────────────────────────────────┘

STYLING:
- Background: Pure black with subtle border
- Inputs: gray-800 background, white text
- Input focus: Red border, 2px
- Button: White border, red on hover/focus
- Links: gray-400, white on hover
- Form validation: Red error messages below inputs
```

### Welcome/Onboarding Screen

```
FULLSCREEN:
┌──────────────────────────────────────────────┐
│                                               │
│         ⚫ ⚫ ⚫  WELCOME                      │
│                                               │
│         Choose your favorite genres           │
│                                               │
│   [ACTION]   [ANIME]   [COMEDY]   [DRAMA]    │
│   [HORROR]   [SCI-FI]  [ROMANCE]  [THRILLER] │
│                                               │
│         [← BACK]           [CONTINUE →]       │
│                                               │
└──────────────────────────────────────────────┘

GENRE CHIPS:
- Size: 120px × 80px
- Border: 1px solid white 20%
- Selected: Red border 2px, white background 5%
- Multi-select allowed
- Hover: Scale 1.05, border white 40%
```

---

## ⚙️ **SETTINGS PAGE**

### Settings Layout

```
TWO-COLUMN LAYOUT:
┌────────────┬─────────────────────────────────┐
│  PROFILE   │  ACCOUNT INFORMATION            │
│  PLAYBACK  │                                  │
│  DISPLAY   │  Username:  [John Doe]          │
│  PRIVACY   │  Email:     [john@email.com]    │
│  ABOUT     │                                  │
│            │  [CHANGE PASSWORD]               │
│            │                                  │
│            │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│            │                                  │
│            │  DANGER ZONE                     │
│            │  [DELETE ACCOUNT]                │
└────────────┴─────────────────────────────────┘

LEFT SIDEBAR (Settings Menu):
- Width: 200px
- Items: 16px vertical padding
- Active: Red left border 3px
- Font: 14px, uppercase

RIGHT CONTENT:
- Padding: 32px
- Forms: Stacked vertically
- Input spacing: 24px
- Section dividers: 1px solid white 5%
```

### Settings Options

```
PLAYBACK SETTINGS:
• Auto-play next episode: [Toggle]
• Skip intro automatically: [Toggle]
• Default quality: [Dropdown: Auto, 1080p, 720p, 480p]
• Subtitles language: [Dropdown]
• Audio language: [Dropdown]

DISPLAY SETTINGS:
• Theme: [Light / Dark] (Nothing OS is dark by default)
• Font size: [Slider: Small - Medium - Large]
• Reduce animations: [Toggle]
• Show gamepad hints: [Toggle]

TOGGLE STYLE:
━━━━━━  ⚫   (OFF - gray)
  ⚫  ━━━━━━  (ON - red)
```

---

## 📱 **MOBILE-SPECIFIC DESIGNS**

### Mobile Watch Page

```
STACKED LAYOUT:
┌────────────────────────┐
│   VIDEO PLAYER (16:9)  │
│   [Rotate for fullscreen] │
├────────────────────────┤
│  ← Back                │
│                        │
│  ⚫ Episode Title      │
│  S01 E12 • 24min      │
│  ━━━━━━━━━━━━━━━━━  │
│                        │
│  [EPISODES] [DETAILS]  │
│                        │
│  Episodes (Scrollable):│
│  [1] [2] [3] [4] [5]  │
│  [6] [7] [8] [9] [10] │
│                        │
└────────────────────────┘

MOBILE PLAYER CONTROLS:
- Tap to show/hide controls
- Double-tap left/right to seek ±10s
- Swipe up for volume
- Swipe down to exit fullscreen
- Pinch to zoom (optional)
```

### Mobile Card Layout

```
SMALLER CARDS:
┌─────────┐
│         │
│ POSTER  │
│         │
├─────────┤
│ Title   │
│ Year    │
└─────────┘

DIMENSIONS:
- Width: 140px (mobile)
- Height: 210px
- Font: 12px
- Reduced spacing: 12px gaps
```

---

## 🎨 **ADDITIONAL UI ELEMENTS**

### Badges & Labels

```
NEW BADGE:
[NEW] - Red background, white text, 8px padding

QUALITY BADGE:
[4K] [HD] [SD] - Gray background, white text

EPISODE COUNT:
[12 Episodes] - White border, transparent bg

STYLING:
- Font: 10px, uppercase, monospace
- Padding: 4px 8px
- Position: Top-left on cards
- Multiple badges: Stack vertically, 4px gap
```

### Context Menu (Right-click)

```
MENU:
┌──────────────────────┐
│  ▶ Play              │
│  + Add to My List    │
│  ℹ More Info         │
│  ━━━━━━━━━━━━━━━━  │
│  ✓ Mark as Watched   │
│  ✕ Not Interested    │
└──────────────────────┘

STYLING:
- Background: gray-900, 98% opacity
- Border: 1px solid white 15%
- Shadow: 0 10px 40px rgba(0,0,0,0.8)
- Items: 14px, 12px vertical padding
- Icons: 16px, left-aligned
- Hover: gray-800 background
- Divider: 1px solid white 5%
```

### Empty States

```
NO CONTENT:
┌──────────────────────────────────┐
│                                   │
│            ⚫                     │
│                                   │
│        No content found           │
│                                   │
│     Try adjusting your filters    │
│                                   │
│        [RESET FILTERS]            │
│                                   │
└──────────────────────────────────┘

STYLING:
- Centered vertically and horizontally
- Glyph: 48px, gray-600
- Text: 16px, gray-400
- Button: Outlined, white border
```

### Error States

```
ERROR MESSAGE:
┌──────────────────────────────────┐
│            ⚫                     │
│                                   │
│     Something went wrong          │
│                                   │
│  We couldn't load this content.   │
│  Please try again later.          │
│                                   │
│  [TRY AGAIN]    [GO HOME]         │
└──────────────────────────────────┘

STYLING:
- Red glyph pulsing
- White text, 14px
- Buttons: Outlined white border
- Centered on page
- Background: black
```

### Loading Spinner

```
NOTHING OS SPINNER:
    ⚫
  ⚫   ⚫
⚫       ⚫
  ⚫   ⚫
    ⚫

ANIMATION:
- 8 dots rotating in circle
- Sequential fade (opacity 1 → 0.3)
- 1s rotation speed
- Size: 48px diameter
- Center on loading area
```

---

## 🎯 **SUMMARY CHECKLIST**

### Core UI Components
- [ ] Hero section with dot matrix typography
- [ ] Horizontal scrolling content rows
- [ ] Vertical movie/anime cards with hover states
- [ ] Horizontal episode cards
- [ ] Watch page layout with tabbed interface
- [ ] Episode grid for series
- [ ] Details metadata display
- [ ] Search overlay with instant results
- [ ] Info modal with related content
- [ ] Filter sidebar
- [ ] Toast notifications
- [ ] Progress indicators

### Visual Elements
- [ ] Glyph indicators (⚫ white, 🔴 red pulsing)
- [ ] Sharp corners (0px border-radius)
- [ ] White borders with low opacity
- [ ] Red accent on focus/hover
- [ ] Dot matrix font for titles
- [ ] Monospace font for metadata
- [ ] High contrast design

### Animations & Loading
- [ ] Fullscreen preloader with dots and progress
- [ ] Skeleton loading states with shimmer
- [ ] Page transitions (fade + scale)
- [ ] Card hover animations (scale 1.05)
- [ ] Staggered card entrance
- [ ] Smooth scrolling
- [ ] Glyph pulse animation
- [ ] Red glow effect on focus

### Gamepad Implementation
- [ ] Gamepad detection hook
- [ ] Button mapping configuration
- [ ] Grid navigation system
- [ ] Row/section navigation
- [ ] Focus visual feedback (red border + glow)
- [ ] Context-specific controls
- [ ] Gamepad hints overlay
- [ ] Analog stick support (movement + scroll)
- [ ] Shoulder button actions
- [ ] D-Pad navigation
- [ ] Focus management system

### Responsive Design
- [ ] Mobile-first approach
- [ ] Breakpoints: 640, 768, 1024, 1280px
- [ ] Touch-optimized buttons (44px min)
- [ ] Responsive grids (1-6 columns)
- [ ] Mobile navigation (hamburger)
- [ ] Tablet-optimized layouts

### Performance
- [ ] Lazy loading images
- [ ] Intersection Observer
- [ ] Virtual scrolling for large lists
- [ ] Debounced search
- [ ] Optimized image srcsets
- [ ] Code splitting

### Accessibility
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Focus indicators
- [ ] ARIA labels
- [ ] Skip links
- [ ] Color contrast compliance

---

## 🚀 **FINAL NOTES**

This Nothing OS theme emphasizes:

1. **Brutalist Minimalism**: No gradients (except functional overlays), no rounded corners, sharp and functional.

2. **Monochrome + Red**: Strict black/white palette with red as the ONLY accent color. Use red sparingly for maximum impact.

3. **Glyph Language**: LED-style indicators (⚫) as a signature design element throughout the interface.

4. **Gamepad-First**: Full gamepad support with visual feedback, making the experience console-like.

5. **Performance**: Lazy loading, virtualization, and optimized animations for smooth 60fps experience.

6. **Typography Hierarchy**: Dot matrix for headlines, modern sans for body, monospace for data.

7. **Consistent Spacing**: Use the spacing scale (4px increments) consistently.

8. **High Contrast**: Always maintain WCAG AA contrast ratios minimum.

Remember: **Less is more**. The Nothing OS aesthetic is about removing unnecessary elements and focusing on pure functionality with distinctive style.

---

## 🎮 **BUTTON & INPUT STYLES**

### Primary Buttons

```css
.button-primary {
  /* Outlined style */
  background: transparent;
  border: 2px solid var(--nothing-white);
  color: var(--nothing-white);
  padding: 12px 32px;
  font: 14px var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s var(--easing);
}

.button-primary:hover {
  background: var(--nothing-white);
  color: var(--nothing-black);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
}

.button-primary:active {
  transform: translateY(0);
}

/* Red accent variant */
.button-accent {
  border-color: var(--nothing-red);
  color: var(--nothing-red);
}

.button-accent:hover {
  background: var(--nothing-red);
  color: var(--nothing-white);
  box-shadow: 0 4px 12px rgba(255, 0, 0, 0.3);
}

/* Icon buttons */
.button-icon {
  width: 48px;
  height: 48px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0;
}
```

### Input Fields

```css
.input-field {
  background: var(--nothing-gray-800);
  border: 1px solid var(--nothing-border);
  color: var(--nothing-white);
  padding: 14px 16px;
  font: 14px var(--font-modern);
  width: 100%;
  transition: all 0.2s var(--easing);
}

.input-field:focus {
  outline: none;
  border: 2px solid var(--nothing-red);
  background: var(--nothing-gray-900);
}

.input-field::placeholder {
  color: var(--nothing-gray-400);
  font-style: italic;
}

/* Input with icon */
.input-wrapper {
  position: relative;
}

.input-wrapper::before {
  content: '';
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  /* Icon styles */
}

.input-wrapper input {
  padding-left: 48px;
}
```

### Checkboxes & Radio Buttons

```css
/* Custom checkbox */
.checkbox {
  appearance: none;
  width: 20px;
  height: 20px;
  border: 2px solid var(--nothing-white);
  background: transparent;
  cursor: pointer;
  position: relative;
}

.checkbox:checked {
  background: var(--nothing-red);
  border-color: var(--nothing-red);
}

.checkbox:checked::after {
  content: '✓';
  position: absolute;
  color: white;
  font-size: 14px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* Radio button - use filled dot instead */
.radio {
  appearance: none;
  width: 20px;
  height: 20px;
  border: 2px solid var(--nothing-white);
  border-radius: 50%; /* Only element with radius */
  background: transparent;
  cursor: pointer;
  position: relative;
}

.radio:checked::after {
  content: '';
  position: absolute;
  width: 10px;
  height: 10px;
  background: var(--nothing-red);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

### Sliders

```css
.slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 4px;
  background: var(--nothing-gray-700);
  outline: none;
  border: 1px solid var(--nothing-border);
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: var(--nothing-white);
  border: 2px solid var(--nothing-red);
  cursor: pointer;
  transition: all 0.2s;
}

.slider::-webkit-slider-thumb:hover {
  background: var(--nothing-red);
  transform: scale(1.2);
}

.slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: var(--nothing-white);
  border: 2px solid var(--nothing-red);
  cursor: pointer;
}
```

---

## 🔄 **SCROLL BEHAVIORS**

### Custom Scrollbar

```css
/* WebKit browsers (Chrome, Safari, Edge) */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--nothing-gray-900);
}

::-webkit-scrollbar-thumb {
  background: var(--nothing-gray-600);
  border: 1px solid var(--nothing-gray-700);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--nothing-red);
}

/* Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: var(--nothing-gray-600) var(--nothing-gray-900);
}
```

### Horizontal Scroll Indicators

```css
/* Add fade indicators on horizontal scroll */
.scroll-container {
  position: relative;
}

.scroll-container::before,
.scroll-container::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 60px;
  pointer-events: none;
  z-index: 2;
}

.scroll-container::before {
  left: 0;
  background: linear-gradient(
    to right,
    var(--nothing-black),
    transparent
  );
}

.scroll-container::after {
  right: 0;
  background: linear-gradient(
    to left,
    var(--nothing-black),
    transparent
  );
}
```

### Smooth Scrolling

```css
html {
  scroll-behavior: smooth;
}

/* Disable for users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 📏 **LAYOUT UTILITIES**

### Container

```css
.container {
  width: 100%;
  max-width: 1920px;
  margin: 0 auto;
  padding: 0 var(--space-7);
}

@media (max-width: 1024px) {
  .container {
    padding: 0 var(--space-5);
  }
}

@media (max-width: 640px) {
  .container {
    padding: 0 var(--space-4);
  }
}
```

### Grid System

```css
.grid {
  display: grid;
  gap: var(--space-5);
}

/* Responsive grid columns */
.grid-auto {
  grid-template-columns: repeat(
    auto-fill,
    minmax(280px, 1fr)
  );
}

.grid-2 { grid-template-columns: repeat(2, 1fr); }
.grid-3 { grid-template-columns: repeat(3, 1fr); }
.grid-4 { grid-template-columns: repeat(4, 1fr); }
.grid-5 { grid-template-columns: repeat(5, 1fr); }
.grid-6 { grid-template-columns: repeat(6, 1fr); }

@media (max-width: 1280px) {
  .grid-6 { grid-template-columns: repeat(5, 1fr); }
  .grid-5 { grid-template-columns: repeat(4, 1fr); }
}

@media (max-width: 1024px) {
  .grid-6, .grid-5 { grid-template-columns: repeat(3, 1fr); }
  .grid-4 { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 768px) {
  .grid-6, .grid-5, .grid-4, .grid-3 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .grid-6, .grid-5, .grid-4, .grid-3, .grid-2 {
    grid-template-columns: 1fr;
  }
}
```

### Flex Utilities

```css
.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.flex-wrap { flex-wrap: wrap; }
.gap-1 { gap: var(--space-1); }
.gap-2 { gap: var(--space-2); }
.gap-3 { gap: var(--space-3); }
.gap-4 { gap: var(--space-4); }
.gap-5 { gap: var(--space-5); }
```

---

## 🎭 **ADVANCED GAMEPAD FEATURES**

### Gamepad Vibration Feedback

```typescript
// Haptic feedback for actions
export const useGamepadVibration = () => {
  const vibrate = (
    duration: number = 200,
    weakMagnitude: number = 0.5,
    strongMagnitude: number = 0.5
  ) => {
    const gamepad = navigator.getGamepads()[0];
    if (gamepad?.vibrationActuator) {
      gamepad.vibrationActuator.playEffect('dual-rumble', {
        duration,
        weakMagnitude,
        strongMagnitude
      });
    }
  };

  return {
    // Light tap for navigation
    tapFeedback: () => vibrate(50, 0.2, 0.1),
    // Medium for selection
    selectFeedback: () => vibrate(100, 0.4, 0.3),
    // Strong for errors
    errorFeedback: () => vibrate(300, 0.8, 0.8),
    // Success pulse
    successFeedback: () => {
      vibrate(100, 0.5, 0.3);
      setTimeout(() => vibrate(100, 0.3, 0.5), 150);
    }
  };
};
```

### Gamepad Button Combos

```typescript
// Advanced button combinations
export const useGamepadCombos = () => {
  const [pressedButtons, setPressedButtons] = useState<Set<number>>(new Set());

  const checkCombo = (buttons: number[]) => {
    return buttons.every(btn => pressedButtons.has(btn));
  };

  useEffect(() => {
    const pollGamepad = () => {
      const gp = navigator.getGamepads()[0];
      if (!gp) return;

      const pressed = new Set<number>();
      gp.buttons.forEach((button, index) => {
        if (button.pressed) pressed.add(index);
      });

      setPressedButtons(pressed);

      // Check combos
      if (checkCombo([4, 5])) { // LB + RB
        // Open quick menu
      }
      if (checkCombo([8, 9])) { // Select + Start
        // Open settings
      }
      if (checkCombo([0, 3])) { // A + Y
        // Quick add to list
      }
    };

    const interval = setInterval(pollGamepad, 50);
    return () => clearInterval(interval);
  }, [pressedButtons]);
};
```

### Analog Stick Zones

```typescript
// Different actions based on stick pressure
export const getAnalogZone = (value: number): 'idle' | 'walk' | 'run' => {
  const abs = Math.abs(value);
  if (abs < 0.2) return 'idle';
  if (abs < 0.6) return 'walk';
  return 'run';
};

// Usage example
const scrollSpeed = (value: number) => {
  const zone = getAnalogZone(value);
  switch (zone) {
    case 'idle': return 0;
    case 'walk': return value * 5;  // Slow scroll
    case 'run': return value * 15;   // Fast scroll
  }
};
```

---

## 🔊 **SOUND EFFECTS (OPTIONAL)**

### UI Sound System

```typescript
// Subtle sound feedback for Nothing OS
export const useSoundEffects = () => {
  const playSound = (type: 'hover' | 'select' | 'back' | 'error') => {
    // Use Web Audio API for subtle clicks
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    switch (type) {
      case 'hover':
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.05;
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.05);
        break;
      case 'select':
        oscillator.frequency.value = 1200;
        gainNode.gain.value = 0.1;
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.08);
        break;
      case 'back':
        oscillator.frequency.value = 600;
        gainNode.gain.value = 0.08;
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
        break;
      case 'error':
        oscillator.frequency.value = 200;
        gainNode.gain.value = 0.15;
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
        break;
    }
  };

  return { playSound };
};
```

---

## 📦 **DATA STRUCTURES**

### Content Types

```typescript
// Movie/Anime data structure
interface Content {
  id: string;
  type: 'movie' | 'series' | 'anime';
  title: string;
  originalTitle?: string;
  year: number;
  genres: string[];
  rating: number; // 0-10
  duration?: number; // minutes (for movies)
  totalEpisodes?: number; // for series
  synopsis: string;
  poster: {
    small: string;   // 400x600
    medium: string;  // 800x1200
    large: string;   // 1200x1800
  };
  backdrop: {
    small: string;   // 1280x720
    large: string;   // 1920x1080
  };
  trailer?: string;
  releaseDate: Date;
  studio?: string;
  cast?: Cast[];
  crew?: Crew[];
  status: 'upcoming' | 'ongoing' | 'completed';
}

// Episode data structure
interface Episode {
  id: string;
  contentId: string;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  synopsis?: string;
  duration: number; // minutes
  thumbnail: string;
  videoUrl: string;
  releaseDate: Date;
  watched?: boolean;
  watchProgress?: number; // 0-100
}

// User watch history
interface WatchHistory {
  contentId: string;
  episodeId?: string;
  progress: number; // seconds
  totalDuration: number; // seconds
  lastWatched: Date;
  completed: boolean;
}

// User list
interface UserList {
  userId: string;
  items: {
    contentId: string;
    addedAt: Date;
  }[];
}
```

---

## 🎬 **CONTENT STATES**

### Watch Progress Indicator

```typescript
// Calculate and display watch progress
export const getProgressState = (
  progress: number,
  duration: number
): 'unwatched' | 'started' | 'almost-done' | 'completed' => {
  const percentage = (progress / duration) * 100;

  if (percentage === 0) return 'unwatched';
  if (percentage < 10) return 'started';
  if (percentage >= 90) return 'completed';
  return 'almost-done';
};

// Visual representation
const ProgressBadge = ({ progress, duration }) => {
  const state = getProgressState(progress, duration);

  switch (state) {
    case 'completed':
      return <Glyph type="check" color="white" />;
    case 'almost-done':
      return <ProgressBar value={progress} max={duration} color="red" />;
    case 'started':
      return <ProgressBar value={progress} max={duration} color="white" />;
    default:
      return null;
  }
};
```

---

## 🎯 **COMPREHENSIVE IMPLEMENTATION CHECKLIST**

### Phase 1: Foundation
- [ ] Set up project structure (React + Vite/Next.js)
- [ ] Install dependencies (Framer Motion, Radix UI, etc.)
- [ ] Configure Tailwind CSS with Nothing OS theme
- [ ] Set up CSS custom properties
- [ ] Implement typography system (Ndot font)
- [ ] Create base layout components
- [ ] Set up routing system

### Phase 2: Core UI Components
- [ ] Navigation bar (desktop + mobile)
- [ ] Hero section with featured content
- [ ] Content card components (vertical + horizontal)
- [ ] Content rows with horizontal scrolling
- [ ] Skeleton loaders
- [ ] Preloader animation
- [ ] Modal system (info, search, filters)
- [ ] Toast notifications
- [ ] Progress bars and indicators
- [ ] Glyph indicators system

### Phase 3: Pages
- [ ] Home page with hero + rows
- [ ] Watch page with player area
- [ ] Episode grid for series
- [ ] Browse/Genre pages with filtering
- [ ] Search page with results
- [ ] My List page
- [ ] Settings page
- [ ] Profile/Account pages
- [ ] Auth pages (login/signup)
- [ ] Onboarding flow

### Phase 4: Gamepad Integration
- [ ] Gamepad detection system
- [ ] Button mapping configuration
- [ ] Navigation focus manager
- [ ] Grid navigation logic
- [ ] Row/section navigation
- [ ] Context-specific controls
- [ ] Visual focus feedback
- [ ] Gamepad hints overlay
- [ ] Vibration feedback (optional)
- [ ] Button combos (optional)
- [ ] Analog stick zones

### Phase 5: Interactions & Animations
- [ ] Page transitions
- [ ] Card hover effects
- [ ] Staggered animations
- [ ] Scroll behaviors
- [ ] Loading states
- [ ] Glyph pulse animations
- [ ] Red glow effects
- [ ] Smooth scrolling
- [ ] Skeleton shimmer

### Phase 6: Performance Optimization
- [ ] Lazy load images
- [ ] Intersection Observer implementation
- [ ] Virtual scrolling for large lists
- [ ] Code splitting
- [ ] Debounced search
- [ ] Optimized image formats (WebP)
- [ ] Responsive image srcsets
- [ ] Bundle size optimization

### Phase 7: Accessibility & Polish
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] ARIA labels throughout
- [ ] Focus indicators
- [ ] Skip links
- [ ] Color contrast verification
- [ ] Reduced motion support
- [ ] Error boundaries
- [ ] 404 page

### Phase 8: Responsive Design
- [ ] Mobile navigation (hamburger)
- [ ] Touch-optimized buttons
- [ ] Responsive grids (all breakpoints)
- [ ] Mobile watch page layout
- [ ] Tablet optimization
- [ ] Mobile player controls
- [ ] Test on all screen sizes

### Phase 9: Additional Features
- [ ] Context menus (right-click)
- [ ] Sorting and filtering
- [ ] Empty states
- [ ] Error states
- [ ] Loading spinners
- [ ] Badges and labels
- [ ] User preferences persistence
- [ ] Watch history tracking
- [ ] Continue watching row

### Phase 10: Testing & Refinement
- [ ] Cross-browser testing
- [ ] Gamepad testing (multiple controllers)
- [ ] Mobile device testing
- [ ] Performance profiling
- [ ] Accessibility audit
- [ ] User testing
- [ ] Bug fixes
- [ ] Final polish

---

## 🚀 **DEPLOYMENT RECOMMENDATIONS**

### Build Optimizations

```json
// package.json scripts
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "analyze": "vite-bundle-analyzer"
  }
}
```

### Environment Variables

```env
# .env.example
VITE_API_BASE_URL=https://api.yoursite.com
VITE_IMAGE_CDN=https://cdn.yoursite.com
VITE_ANALYTICS_ID=UA-XXXXXXXXX-X
VITE_ENABLE_GAMEPAD=true
VITE_ENABLE_SOUNDS=false
```

### Performance Targets

```
CORE WEB VITALS:
- Largest Contentful Paint (LCP): < 2.5s
- First Input Delay (FID): < 100ms
- Cumulative Layout Shift (CLS): < 0.1

LIGHTHOUSE SCORES (TARGET):
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 90
```

---

## 📚 **RESOURCES & REFERENCES**

### Design Inspiration
- Nothing Phone UI
- Console gaming interfaces (PlayStation, Xbox)
- Brutalist web design
- Terminal/CLI aesthetics

### Fonts
- **Ndot** - Primary dot matrix font (Nothing OS signature)
- **Inter** - Modern sans-serif fallback
- **JetBrains Mono** - Monospace for metadata

### Libraries Used
```json
{
  "react": "^18.2.0",
  "react-router": "^6.20.0",
  "framer-motion": "^10.16.0",
  "react-intersection-observer": "^9.5.0",
  "@radix-ui/react-dialog": "^1.0.5",
  "@radix-ui/react-select": "^2.0.0",
  "@radix-ui/react-slider": "^1.1.2",
  "@tanstack/react-virtual": "^3.0.0"
}
```

### Browser Support
```
MINIMUM SUPPORT:
- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions
- Mobile Safari: Last 2 versions
- Chrome Android: Last 2 versions

GAMEPAD API:
- Chrome 21+
- Firefox 29+
- Safari 10.1+
- Edge 12+
```

---

## ✨ **FINAL THOUGHTS**

This Nothing OS themed streaming platform emphasizes:

1. **Minimalist Brutalism** - Sharp edges, no unnecessary flourishes
2. **Monochrome + Red Accent** - High contrast, strategic color use
3. **Glyph Language** - LED-style indicators as design signature
4. **Gamepad-First UX** - Console-like experience with full controller support
5. **Performance** - Smooth 60fps animations, lazy loading, optimization
6. **Accessibility** - Keyboard navigation, screen readers, WCAG compliance
7. **Responsive** - Mobile-first approach, works on all devices
8. **Nothing OS DNA** - Dot matrix typography, minimalist aesthetic, functional design

**Key Principle**: Every element serves a purpose. Remove anything that doesn't contribute to functionality or the distinctive Nothing OS aesthetic.

Good luck building your streaming platform! 🎬
