# Video Player Documentation

## Overview
A professional HLS video player component with Hotstar-inspired UI, integrated with Convex backend proxy for secure streaming.

## Features

### Core Playback
- ✅ **HLS Adaptive Streaming** - Automatically adjusts quality via HLS.js
- ✅ **Playback Speed Control** - 0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x speeds
- ✅ **Subtitle Support** - Proxied through Convex for CORS safety, auto-enabled
- ✅ **Play/Pause Controls** - Center overlay and bottom bar
- ✅ **Seek/Scrub** - Click progress bar with hover timestamp preview
- ✅ **Volume Control** - Adjustable with mute toggle
- ✅ **Skip Forward/Backward** - 10-second skip buttons
- ✅ **Fullscreen Mode** - Native fullscreen support

### Advanced Features
- ✅ **Keyboard Shortcuts** - Full keyboard navigation (see below)
- ✅ **Episodes Overlay** - Grid view of all episodes with quick selection
- ✅ **Info Panel on Pause** - Hotstar-style panel showing anime details
- ✅ **Next Episode Countdown** - Auto-play next episode near end
- ✅ **Skip Intro** - Smart detection and skip button
- ✅ **Auto-hide Controls** - Fade after 2.5 seconds of inactivity
- ✅ **Buffer Progress** - Visual indicator of buffered content
- ✅ **Test IDs** - All elements have data-testid for testing

### UI/UX
- ✅ **Cinematic Gradients** - Beautiful overlays and effects
- ✅ **Glassy Control Bar** - Modern backdrop blur design
- ✅ **Smooth Animations** - Framer Motion powered
- ✅ **Responsive Design** - Works on desktop, tablet, mobile
- ✅ **Loading Spinner** - Shows during buffering

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` or `K` | Play/Pause |
| `F` | Toggle Fullscreen |
| `M` | Toggle Mute |
| `→` | Skip forward 10 seconds |
| `←` | Skip backward 10 seconds |
| `↑` | Increase volume |
| `↓` | Decrease volume |

## Usage

### Basic Usage

