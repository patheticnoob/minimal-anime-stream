# GojoStream Controller Support Extension

Chrome extension that adds gamepad/controller support to GojoStream.

## Installation

### For Development:
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked"
4. Select the `extension` folder from this project

### For Users:
Download the extension from the Chrome Web Store (coming soon) or install manually using the steps above.

## ⚠️ IMPORTANT: First-Time Setup

**After installing the extension, you MUST:**

1. **Connect your controller** via USB or Bluetooth
2. **Press ANY button** on your controller (this activates the Gamepad API)
3. **Look for the status indicator** in the top-right corner of the page
4. **Click the status indicator** if it doesn't detect automatically

The Gamepad API in browsers requires user interaction (button press) before it can detect controllers. This is a browser security feature.

## Features

- **Visual Status Indicator** - Shows controller connection status in top-right corner
- **Full gamepad support** for Xbox, PlayStation, and generic controllers
- **Video playback control** - Play, pause, seek, volume
- **Navigation** - Browse episodes and menus with controller
- **Episode switching** - Quick access to previous/next episodes
- **Fullscreen control** - Toggle fullscreen mode
- **On-screen notifications** - Visual feedback for all actions

## Button Mapping

| Button | Action |
|--------|--------|
| A | Play/Pause or Select |
| B | Back/Close |
| X | Skip Intro/Outro |
| Y | Toggle Fullscreen |
| LB | Previous Episode |
| RB | Next Episode |
| LT | Volume Down |
| RT | Volume Up |
| D-Pad Up/Down | Navigate Menu |
| D-Pad Left/Right | Seek -10s/+10s |
| Left Stick | Scroll Page |
| Right Stick | Seek Video |
| Start | Go to Home |
| Select | Open Settings |

## Troubleshooting

### "Waiting for controller..." or "Press any controller button"

**This is normal!** The browser's Gamepad API requires you to press a button first:

1. **Make sure your controller is connected** (check Windows/Mac Bluetooth settings)
2. **Press ANY button** on your controller (A, B, Start, etc.)
3. **Wait 1-2 seconds** for detection
4. **Click the status indicator** in the top-right to manually retry

### Controller Not Detected After Pressing Buttons?

1. **Check Chrome console** - Press F12 and look for 🎮 messages
2. **Try a different USB port** or reconnect Bluetooth
3. **Reload the page** - Sometimes a refresh helps
4. **Test in chrome://gamepad** - This Chrome page shows if your controller is detected
5. **Try a different browser** - Edge, Brave, or other Chromium browsers

### Buttons Not Working?

- **Make sure the page has focus** (click on it)
- **Check if video player is visible** - Some controls only work during playback
- **Look for on-screen notifications** - They confirm button presses are detected

### Extension Not Loading?

- Check that it's **enabled** in `chrome://extensions/`
- Make sure you're on a **GojoStream page** (extension only runs there)
- Try **reloading the extension** (toggle it off and on)

## Compatibility

- Chrome 88+
- Edge 88+
- Any Chromium-based browser
- Works with Xbox, PlayStation, and generic USB/Bluetooth controllers

## Privacy

This extension only runs on GojoStream domains and does not collect any user data.

## Development

The extension consists of:
- `manifest.json` - Extension configuration
- `content.js` - Main controller logic with Gamepad API
- `background.js` - Background service worker
- `popup.html/js` - Extension popup UI

## Support

For issues or feature requests, please visit the GitHub repository.

## Debug Mode

Open Chrome DevTools (F12) and look for messages starting with 🎮 to see detailed controller information.