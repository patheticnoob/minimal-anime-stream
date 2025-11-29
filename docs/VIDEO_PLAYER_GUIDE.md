# Video Player Implementation Guide

## Overview
This project features two video player implementations optimized for different themes:
- **VideoPlayer.tsx**: Classic theme player with modern UI
- **RetroVideoPlayer.tsx**: Retro-themed player with VHS aesthetic

## Key Features

### Both Players Support:
- HLS streaming with hls.js
- Subtitle management with dynamic positioning
- Progress tracking and resume functionality
- Keyboard shortcuts (Space/K: play/pause, F: fullscreen, M: mute, Arrow keys: seek/volume)
- Skip intro/outro functionality
- Buffering indicators
- Fullscreen support

### VideoPlayer (Classic Theme)
- Modern glass-morphism design
- Dropdown subtitle selector
- Settings menu for playback speed
- Smooth gradient progress bar
- Auto-hide controls (3s timeout)

### RetroVideoPlayer (Retro Theme)
- Monospace "Courier Prime" font
- Neon pink (#FF69B4) borders and glows
- Inline subtitle dropdown (left of fullscreen button)
- Simplified controls with retro styling
- VHS-inspired visual effects

## Subtitle Positioning

### Dynamic Subtitle Adjustment
Both players dynamically adjust subtitle position based on control visibility:

**When controls are visible:**
- Subtitles move up by 120px to avoid overlap

**When controls are hidden:**
- Subtitles move up by 60px for better readability

Implementation uses CSS injection: