# Gamepad Controls Documentation

## Overview
GojoStream features comprehensive gamepad/controller support with a virtual cursor system and direct video player controls. This document outlines the current implementation, known issues, and areas for future improvement.

## Current Implementation

### Virtual Cursor System
**File**: `src/hooks/use-gamepad-cursor.ts`

The virtual cursor provides mouse-like navigation using a gamepad:

- **Left Stick (Axes 0, 1)**: Moves the virtual cursor
- **Sensitivity**: 8 pixels per frame
- **Dead Zone**: 0.15 (prevents drift)
- **Edge Scrolling**: Automatically scrolls when cursor is within 50px of screen edge
- **Click Debounce**: 500ms to prevent double-clicks
- **Auto-hide**: Cursor hides in fullscreen after 3 seconds of inactivity

**Visual Component**: `src/components/GamepadCursor.tsx`
- Red dot (8px) with white ring (24px)
- Positioned absolutely at cursor coordinates
- Theme-aware styling (works in all themes)
- Only visible when gamepad is connected

### Button Mappings

#### Global Navigation (Virtual Cursor)
- **A Button**: Simulate left click
- **B Button**: Simulate back/close action
- **X Button**: Simulate double-click

#### Video Player Controls
**Files**: 
- `src/themes/nothing/components/NothingVideoPlayerV2.tsx`
- `src/components/VideoPlayer.tsx`
- `src/components/RetroVideoPlayer.tsx`

**Fullscreen Mode Controls:**

The video player has two distinct control modes:

**1. Non-Fullscreen Mode:**
- Virtual cursor is active for navigation
- **RB (R1)**: Enter fullscreen mode

**2. Fullscreen Mode (Virtual cursor hidden):**
- **RB (R1)**: Enter fullscreen (if not already in fullscreen)
- **RT (R2)**: Exit fullscreen
- **X Button**: Play/Pause
- **D-pad Left**: Seek backward 10 seconds
- **D-pad Right**: Seek forward 10 seconds
- **D-pad Up**: Increase volume
- **D-pad Down**: Decrease volume
- **LB (Left Bumper)**: Skip intro (when available, Nothing theme only)
- **RB (Right Bumper)**: Skip outro or next episode (when available, Nothing theme only)

**Note**: Fullscreen-specific controls (X, D-pad, RT) only work when the video player is in fullscreen mode. Outside of fullscreen, the virtual cursor system takes over for navigation.

#### Episode List Scrolling
**Files**:
- `src/components/InfoModal.tsx` (Landing page modal)
- `src/themes/nothing/pages/Watch.tsx` (Nothing theme watch page)

- **D-pad Up**: Scroll up 200px
- **D-pad Down**: Scroll down 200px
- **Note**: Scrolling disabled when video is playing

### Button Mapping UI
**Files**:
- `src/components/GamepadButtonMapping.tsx`: Display current mappings
- `src/components/GamepadSettings.tsx`: Adjust cursor settings

**Location**: Profile Dashboard → Gamepad Settings section

**Features**:
- Shows all current button mappings
- Displays controller connection status
- Stored in localStorage (`gamepad-button-mapping`)
- Reset to defaults option

## Known Issues

### 1. Fullscreen Toggle Instability
**Status**: Partially resolved but not perfect
**Issue**: Fullscreen sometimes enters and exits rapidly
**Attempted Fixes**:
- Increased click debounce to 500ms
- Removed setTimeout delays
- Separated Y and X button handlers

**Potential Solutions**:
- Implement a cooldown timer specifically for fullscreen toggle
- Add state tracking to prevent rapid toggles
- Consider using a different event mechanism

### 2. Edge Scrolling Sensitivity
**Status**: Implemented but may need tuning
**Current**: 50px threshold, 10px scroll speed
**Consideration**: May be too aggressive or not responsive enough depending on content

### 3. Episode List Scrolling
**Status**: Working but selector is fragile
**Issue**: CSS selector `.bg-white.dark\:bg-\[\\#1A1D24\\].border.border-black\/5` is theme-specific
**Recommendation**: Add a dedicated class or data attribute for gamepad-scrollable containers

## Architecture

### Hook: `useGamepad`
**File**: `src/hooks/use-gamepad.ts`
- Polls `navigator.getGamepads()` at 60fps
- Tracks button press states
- Exports `GAMEPAD_BUTTONS` enum for consistent button references
- Returns `{ buttonPressed, isConnected }`

### Hook: `useGamepadCursor`
**File**: `src/hooks/use-gamepad-cursor.ts`
- Manages virtual cursor position
- Handles edge scrolling
- Simulates mouse events (click, hover)
- Auto-hides in fullscreen
- Returns `{ cursorPosition, isVisible, simulateClick }`

### Component Integration Pattern
