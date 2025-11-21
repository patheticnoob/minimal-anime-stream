# Hotstar-Like Video Player Component

A professional, feature-rich HLS video player component built with React and HLS.js, inspired by Hotstar's video player design.

## Features

### Core Playback Features
- ✅ **HLS Adaptive Streaming** - Automatically adjusts quality based on network conditions
- ✅ **Playback Speed Control** - Adjust speed from 0.5x to 2x
- ✅ **Subtitle Support** - Toggle subtitles/captions on/off
- ✅ **Play/Pause Controls** - Center overlay and bottom bar controls
- ✅ **Seek/Scrub** - Click anywhere on progress bar to seek
- ✅ **Volume Control** - Adjustable volume with mute toggle
- ✅ **Skip Forward/Backward** - 10-second skip buttons
- ✅ **Fullscreen Mode** - Native fullscreen support

### UI/UX Features
- ✅ **Auto-hide Controls** - Controls fade after 3 seconds of inactivity
- ✅ **Beautiful Gradient Overlays** - Hotstar-inspired design
- ✅ **Loading Spinner** - Shows while video is buffering
- ✅ **Buffer Progress** - Visual indicator of buffered content
- ✅ **Time Display** - Current time and duration
- ✅ **Subtitle Button** - Dedicated button next to settings for easy subtitle access
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile
- ✅ **Smooth Animations** - All interactions are smooth and polished

### Advanced Features
- ✅ **Keyboard Shortcuts** - Full keyboard navigation
- ✅ **Settings Menu** - Organized speed controls
- ✅ **Subtitle Menu** - Separate subtitle controls with track selection
- ✅ **Video Poster** - Thumbnail before playback
- ✅ **Auto-play Support** - Optional auto-play on load
- ✅ **Test IDs** - All elements have data-testid for testing

## Installation

The component is already set up with all dependencies. HLS.js is included in package.json.

## Usage

### Basic Usage

```jsx
import VideoPlayer from './components/VideoPlayer';

function MyComponent() {
  return (
    <VideoPlayer
      src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
      poster="https://example.com/thumbnail.jpg"
      autoPlay={false}
    />
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | string | required | HLS video URL (.m3u8) |
| `poster` | string | optional | Thumbnail image URL |
| `autoPlay` | boolean | `false` | Auto-play video on load |
| `className` | string | `''` | Additional CSS classes |

### With Your API

If you're fetching video data from your API:

```jsx
import { useState, useEffect } from 'react';
import VideoPlayer from './components/VideoPlayer';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function VideoPage() {
  const [videoData, setVideoData] = useState(null);

  useEffect(() => {
    // Fetch video data from your API
    axios.get(`${BACKEND_URL}/api/videos/123`)
      .then(response => {
        setVideoData(response.data);
      })
      .catch(error => {
        console.error('Error fetching video:', error);
      });
  }, []);

  if (!videoData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="video-container">
      <VideoPlayer
        src={videoData.hlsUrl}
        poster={videoData.thumbnail}
        autoPlay={false}
      />
      <div className="video-info">
        <h1>{videoData.title}</h1>
        <p>{videoData.description}</p>
      </div>
    </div>
  );
}
```

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

## Video Format Requirements

### HLS Format
The video player is designed for **HLS (HTTP Live Streaming)** format:
- Video files must be in `.m3u8` format
- Supports adaptive bitrate streaming
- Multiple quality levels (optional)

### Example HLS Structure
```
playlist.m3u8           # Master playlist
├── 360p/
│   └── stream.m3u8    # 360p quality
├── 480p/
│   └── stream.m3u8    # 480p quality
├── 720p/
│   └── stream.m3u8    # 720p quality
└── 1080p/
    └── stream.m3u8    # 1080p quality
```

### Converting Videos to HLS

If you need to convert MP4 videos to HLS format, use FFmpeg:

```bash
# Basic conversion
ffmpeg -i input.mp4 -codec: copy -start_number 0 -hls_time 10 -hls_list_size 0 -f hls output.m3u8

# Multiple qualities (adaptive streaming)
ffmpeg -i input.mp4 \
  -filter_complex "[v:0]split=4[v1][v2][v3][v4]; [v1]scale=640:360[v1out]; [v2]scale=854:480[v2out]; [v3]scale=1280:720[v3out]; [v4]scale=1920:1080[v4out]" \
  -map "[v1out]" -c:v:0 libx264 -b:v:0 800k \
  -map "[v2out]" -c:v:1 libx264 -b:v:1 1400k \
  -map "[v3out]" -c:v:2 libx264 -b:v:2 2800k \
  -map "[v4out]" -c:v:3 libx264 -b:v:3 5000k \
  -map a:0 -c:a:0 aac -b:a:0 128k \
  -map a:0 -c:a:1 aac -b:a:1 128k \
  -map a:0 -c:a:2 aac -b:a:2 128k \
  -map a:0 -c:a:3 aac -b:a:3 128k \
  -var_stream_map "v:0,a:0 v:1,a:1 v:2,a:2 v:3,a:3" \
  -master_pl_name master.m3u8 \
  -f hls -hls_time 10 -hls_list_size 0 \
  stream_%v.m3u8
```

## Customization

### Styling

The component uses CSS classes that you can override:

```css
/* Change player background */
.video-player-container {
  background: #000;
  border-radius: 12px; /* Custom border radius */
}

/* Customize controls gradient */
.video-gradient-bottom {
  background: linear-gradient(to top, rgba(0, 0, 0, 0.95), transparent);
}

/* Change progress bar color */
.video-progress-bar {
  background: linear-gradient(90deg, #ff0080, #ff8c00);
}

/* Customize buttons */
.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}
```

### Theme Colors

The player uses these default colors:
- Primary: Blue (`#3b82f6`, `#0ea5e9`)
- Backgrounds: Dark with transparency
- Text: White with various opacities
- Gradients: Black to transparent

## Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | Uses HLS.js |
| Firefox | ✅ Full | Uses HLS.js |
| Safari | ✅ Full | Native HLS support |
| Edge | ✅ Full | Uses HLS.js |
| Mobile Safari | ✅ Full | Native HLS support |
| Chrome Mobile | ✅ Full | Uses HLS.js |

## Performance Tips

1. **Use CDN for video hosting** - Host HLS files on a CDN for better performance
2. **Optimize quality levels** - Provide 3-4 quality options (360p, 480p, 720p, 1080p)
3. **Set appropriate segment duration** - 10 seconds is recommended
4. **Enable CORS** - Ensure video server has CORS headers enabled
5. **Use poster images** - Provide thumbnails to improve perceived loading time

## Testing

The component includes data-testid attributes for all interactive elements:

```jsx
// Example test with React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import VideoPlayer from './VideoPlayer';

test('plays video when play button is clicked', () => {
  render(<VideoPlayer src="https://example.com/video.m3u8" />);
  
  const playButton = screen.getByTestId('play-pause-button');
  fireEvent.click(playButton);
  
  // Add your assertions
});
```

### Available Test IDs
- `video-player-container`
- `video-element`
- `video-loading`
- `video-center-button`
- `video-controls`
- `video-progress-bar`
- `play-pause-button`
- `skip-back-button`
- `skip-forward-button`
- `mute-button`
- `volume-slider`
- `time-display`
- `subtitles-button`
- `subtitles-menu`
- `subtitle-off`
- `subtitle-{language}` (e.g., `subtitle-en`)
- `settings-button`
- `settings-menu`
- `playback-rate-{rate}` (e.g., `playback-rate-1.5`)
- `fullscreen-button`

## Troubleshooting

### Video not playing
- Check if HLS URL is accessible
- Verify CORS headers are set on video server
- Check browser console for errors
- Ensure HLS format is correct (.m3u8)

### Quality selector not showing
- HLS manifest must have multiple quality levels
- Check if HLS.js parsed the manifest correctly
- View browser console for HLS.js logs

### Controls not hiding
- Check if video is playing (controls only auto-hide when playing)
- Verify JavaScript is not blocked
- Check browser console for errors

### Keyboard shortcuts not working
- Ensure no input fields are focused
- Check if event listeners are attached
- Verify browser window has focus

## Subtitle Support

The video player includes full subtitle/caption support! Check out the [Subtitle Guide](SUBTITLE_GUIDE.md) for:
- How to add subtitles to videos
- WebVTT format guide
- Converting SRT to VTT
- Backend integration examples
- Auto-generating subtitles with AI

## Future Enhancements

Potential features to add:
- 🔄 Picture-in-Picture mode
- 🎬 Thumbnail preview on hover
- 📊 Analytics integration
- 💾 Watch progress persistence
- 🔗 Share functionality
- 📺 Chromecast support
- ⏯️ Playlist support
- 🎨 Subtitle styling customization

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review HLS.js documentation: https://github.com/video-dev/hls.js
3. Check browser console for errors
4. Verify video format and hosting

## License

This component is part of your MERN streaming site project.
