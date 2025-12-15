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

## Features

- **Full gamepad support** for Xbox, PlayStation, and generic controllers
- **Video playback control** - Play, pause, seek, volume
- **Navigation** - Browse episodes and menus with controller
- **Episode switching** - Quick access to previous/next episodes
- **Fullscreen control** - Toggle fullscreen mode
- **Visual feedback** - On-screen notifications and status indicator

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

### Controller Not Detected?

1. **Connect your controller** - Make sure it's plugged in via USB or connected via Bluetooth
2. **Press any button** - The Gamepad API requires user interaction to activate
3. **Check the status indicator** - Look for the controller status in the top-right corner
4. **Reload the page** - Sometimes a refresh helps
5. **Check Chrome console** - Press F12 and look for 🎮 messages

### Common Issues

- **"No controller detected"** - Connect your controller and press any button
- **Buttons not working** - Make sure the page has focus (click on it)
- **Extension not loading** - Check that it's enabled in `chrome://extensions/`

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
- `content.js` - Main controller logic
- `background.js` - Background service worker
- `popup.html/js` - Extension popup UI

## Support

For issues or feature requests, please visit the GitHub repository.