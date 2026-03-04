# Subtitle Guide for Video Player

## Overview
The video player now supports subtitles/captions with a dedicated button next to the settings icon. Users can toggle subtitles on/off and select different language tracks.

## How to Add Subtitles to Your Videos

### Method 1: Using HTML5 Track Element (Recommended)

Add subtitle tracks directly in your video element using the `<track>` tag:

```jsx
import VideoPlayer from './components/VideoPlayer';

function VideoWithSubtitles() {
  return (
    <div className="aspect-video">
      <VideoPlayer
        src="https://example.com/video.m3u8"
        poster="https://example.com/thumbnail.jpg"
      />
      {/* Add tracks manually after component renders */}
    </div>
  );
}
```

### Method 2: Adding Tracks Programmatically

```jsx
import { useEffect, useRef } from 'react';
import VideoPlayer from './components/VideoPlayer';

function VideoWithSubtitles() {
  const playerRef = useRef(null);

  useEffect(() => {
    const video = document.querySelector('video');
    if (!video) return;

    // Add English subtitles
    const trackEN = document.createElement('track');
    trackEN.kind = 'subtitles';
    trackEN.label = 'English';
    trackEN.srclang = 'en';
    trackEN.src = '/subtitles/english.vtt';
    video.appendChild(trackEN);

    // Add Spanish subtitles
    const trackES = document.createElement('track');
    trackES.kind = 'subtitles';
    trackES.label = 'Español';
    trackES.srclang = 'es';
    trackES.src = '/subtitles/spanish.vtt';
    video.appendChild(trackES);

    // Add Hindi subtitles
    const trackHI = document.createElement('track');
    trackHI.kind = 'subtitles';
    trackHI.label = 'हिन्दी';
    trackHI.srclang = 'hi';
    trackHI.src = '/subtitles/hindi.vtt';
    video.appendChild(trackHI);
  }, []);

  return (
    <div className="aspect-video">
      <VideoPlayer
        src="https://example.com/video.m3u8"
        poster="https://example.com/thumbnail.jpg"
      />
    </div>
  );
}
```

### Method 3: Backend API Integration

Store subtitle URLs in your database and load them dynamically:

```jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import VideoPlayer from './components/VideoPlayer';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function VideoWithAPISubtitles({ videoId }) {
  const [video, setVideo] = useState(null);

  useEffect(() => {
    // Fetch video with subtitle data
    axios.get(`${BACKEND_URL}/api/videos/${videoId}`)
      .then(response => {
        setVideo(response.data);
        
        // Add subtitle tracks to video element
        const videoElement = document.querySelector('video');
        if (videoElement && response.data.subtitles) {
          response.data.subtitles.forEach(subtitle => {
            const track = document.createElement('track');
            track.kind = 'subtitles';
            track.label = subtitle.label;
            track.srclang = subtitle.language;
            track.src = subtitle.url;
            videoElement.appendChild(track);
          });
        }
      });
  }, [videoId]);

  if (!video) return <div>Loading...</div>;

  return (
    <div className="aspect-video">
      <VideoPlayer
        src={video.hlsUrl}
        poster={video.thumbnail}
      />
    </div>
  );
}
```

## Subtitle File Format (WebVTT)

Subtitles must be in WebVTT (.vtt) format:

### Example: english.vtt
```vtt
WEBVTT

00:00:00.000 --> 00:00:03.000
Welcome to our video player

00:00:03.500 --> 00:00:06.000
This is a subtitle example

00:00:06.500 --> 00:00:09.000
Subtitles help users understand the content
```

### WebVTT Format Rules
- First line must be `WEBVTT`
- Timestamp format: `HH:MM:SS.mmm --> HH:MM:SS.mmm`
- Blank line between each subtitle block
- File extension must be `.vtt`

## Converting SRT to VTT

If you have SRT subtitle files, convert them to VTT:

### Online Converters
- https://subtitletools.com/convert-to-vtt-online
- https://www.rev.com/captionconverter

### Using FFmpeg
```bash
ffmpeg -i input.srt output.vtt
```

### Using Python
```python
def srt_to_vtt(srt_file, vtt_file):
    with open(srt_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace comma with period in timestamps
    content = content.replace(',', '.')
    
    # Add WEBVTT header
    with open(vtt_file, 'w', encoding='utf-8') as f:
        f.write('WEBVTT\n\n')
        f.write(content)

# Usage
srt_to_vtt('subtitles.srt', 'subtitles.vtt')
```

## Backend Implementation (FastAPI)

### Database Schema
```python
class Video(BaseModel):
    id: str
    title: str
    hlsUrl: str
    thumbnail: str
    subtitles: List[Subtitle] = []

class Subtitle(BaseModel):
    language: str
    label: str
    url: str
```

### API Endpoint
```python
@api_router.get("/videos/{video_id}", response_model=Video)
async def get_video(video_id: str):
    video = await db.videos.find_one({"id": video_id}, {"_id": 0})
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    return video

# Example video document in MongoDB:
{
  "id": "abc123",
  "title": "Sample Video",
  "hlsUrl": "https://cdn.example.com/video.m3u8",
  "thumbnail": "https://cdn.example.com/thumb.jpg",
  "subtitles": [
    {
      "language": "en",
      "label": "English",
      "url": "https://cdn.example.com/subtitles/en.vtt"
    },
    {
      "language": "es",
      "label": "Español",
      "url": "https://cdn.example.com/subtitles/es.vtt"
    },
    {
      "language": "hi",
      "label": "हिन्दी",
      "url": "https://cdn.example.com/subtitles/hi.vtt"
    }
  ]
}
```

## CORS Configuration

Ensure your subtitle files have proper CORS headers:

### For AWS S3
```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET"],
      "AllowedHeaders": ["*"]
    }
  ]
}
```

### For Nginx
```nginx
location /subtitles/ {
    add_header 'Access-Control-Allow-Origin' '*';
    add_header 'Access-Control-Allow-Methods' 'GET, OPTIONS';
}
```

## Subtitle Features

### Current Features
- ✅ Toggle subtitles on/off
- ✅ Multiple language support
- ✅ Language selection menu
- ✅ Automatic track detection
- ✅ Visual indicator when subtitles are active

### Subtitle Button States
- **Inactive:** Gray subtitle icon (no subtitles)
- **Active:** Blue highlighted icon (subtitles enabled)

## Styling Subtitles

You can customize subtitle appearance using CSS:

```css
/* Customize subtitle styling */
video::cue {
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  font-size: 18px;
  font-family: Arial, sans-serif;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

/* Subtitle positioning */
video::cue {
  line-height: 1.2;
  padding: 8px 12px;
  border-radius: 4px;
}
```

## Auto-Generated Subtitles

For automatic subtitle generation, consider these services:

### 1. AWS Transcribe
```javascript
import AWS from 'aws-sdk';

const transcribe = new AWS.TranscribeService();

const params = {
  TranscriptionJobName: 'video-123-transcription',
  LanguageCode: 'en-US',
  MediaFormat: 'mp4',
  Media: {
    MediaFileUri: 's3://bucket/video.mp4'
  },
  Subtitles: {
    Formats: ['vtt'],
    OutputStartIndex: 0
  }
};

transcribe.startTranscriptionJob(params);
```

### 2. Google Cloud Speech-to-Text
```javascript
const speech = require('@google-cloud/speech');
const client = new speech.SpeechClient();

const config = {
  encoding: 'LINEAR16',
  sampleRateHertz: 16000,
  languageCode: 'en-US',
  enableWordTimeOffsets: true,
};

const audio = {
  uri: 'gs://bucket/video-audio.wav',
};

const [response] = await client.recognize({ config, audio });
// Convert response to VTT format
```

### 3. OpenAI Whisper API
```javascript
const openai = require('openai');

const transcription = await openai.audio.transcriptions.create({
  file: fs.createReadStream('audio.mp3'),
  model: 'whisper-1',
  response_format: 'vtt',
  language: 'en'
});

// Save transcription.text as .vtt file
```

## Testing Subtitles

### Test Data
Use these public subtitle files for testing:
- English: https://www.opensubtitles.org/
- Sample VTT: Create a simple test file

### Test Cases
1. **No subtitles:** Video plays without subtitle button being active
2. **Single subtitle:** Only one language track available
3. **Multiple subtitles:** User can switch between languages
4. **Subtitle toggle:** Can turn subtitles on/off
5. **Subtitle persistence:** Selected language persists during playback

## Troubleshooting

### Subtitles Not Showing
1. Check if VTT file is accessible (check network tab)
2. Verify CORS headers are set correctly
3. Ensure VTT format is valid
4. Check browser console for errors
5. Verify track is added to video element

### Subtitles Out of Sync
1. Check timestamp format in VTT file
2. Ensure video and subtitle timestamps match
3. Verify video playback rate doesn't affect subtitles

### Multiple Tracks Not Detected
1. Ensure each track has unique `srclang` attribute
2. Verify tracks are added before video loads
3. Check if `loadedmetadata` event has fired

## Best Practices

1. **Always provide English subtitles** as a baseline
2. **Use descriptive labels** (e.g., "English [CC]" for closed captions)
3. **Host subtitles on CDN** for better performance
4. **Compress VTT files** to reduce size
5. **Test across browsers** for compatibility
6. **Provide subtitle upload** in admin panel
7. **Auto-generate** for better accessibility
8. **Include hearing impaired** versions (with sound effects)

## Language Codes (ISO 639-1)

Common language codes for subtitles:
- `en` - English
- `es` - Spanish
- `hi` - Hindi
- `zh` - Chinese
- `ar` - Arabic
- `fr` - French
- `de` - German
- `ja` - Japanese
- `ko` - Korean
- `pt` - Portuguese
- `ru` - Russian
- `it` - Italian

## Summary

The subtitle feature is now fully integrated into the video player:
- **Dedicated button** next to settings icon
- **Easy toggle** between on/off
- **Multiple languages** supported
- **Visual feedback** when active
- **Automatic detection** of available tracks

For implementation help, refer to the examples above or check the VideoPlayer component source code.
