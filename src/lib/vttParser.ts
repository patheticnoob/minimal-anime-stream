/**
 * VTT Thumbnail Parser
 * Parses WebVTT thumbnail files to extract timestamp and image coordinates
 */

export interface ThumbnailCue {
  startTime: number;
  endTime: number;
  url: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

/**
 * Parse time string (HH:MM:SS.mmm or MM:SS.mmm) to seconds
 */
function parseVTTTime(timeString: string): number {
  const parts = timeString.split(':');
  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  if (parts.length === 3) {
    hours = parseInt(parts[0], 10);
    minutes = parseInt(parts[1], 10);
    seconds = parseFloat(parts[2]);
  } else if (parts.length === 2) {
    minutes = parseInt(parts[0], 10);
    seconds = parseFloat(parts[1]);
  } else {
    seconds = parseFloat(parts[0]);
  }

  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Parse VTT thumbnail file content
 */
export async function parseVTTThumbnails(vttUrl: string): Promise<ThumbnailCue[]> {
  try {
    const response = await fetch(vttUrl);
    const text = await response.text();
    
    let originalVttUrl = vttUrl;
    let proxyBase: string | null = null;
    try {
      const parsedVttUrl = new URL(vttUrl);
      const targetUrl = parsedVttUrl.searchParams.get("url");
      if (targetUrl) {
        originalVttUrl = targetUrl;
        proxyBase = `${parsedVttUrl.origin}${parsedVttUrl.pathname}`;
      }
    } catch {
      // Non-proxied VTT URLs won't include a `url` search param
    }
    
    const cues: ThumbnailCue[] = [];
    const lines = text.split('\n');
    
    let i = 0;
    while (i < lines.length) {
      const line = lines[i].trim();
      
      // Skip WEBVTT header and empty lines
      if (line.startsWith('WEBVTT') || line === '' || line.startsWith('NOTE')) {
        i++;
        continue;
      }
      
      // Check if this is a timestamp line (contains -->)
      if (line.includes('-->')) {
        const [startStr, endStr] = line.split('-->').map(s => s.trim());
        const startTime = parseVTTTime(startStr);
        const endTime = parseVTTTime(endStr);
        
        // Next line should contain the image URL and coordinates
        i++;
        if (i < lines.length) {
          const imageLine = lines[i].trim();
          
          // Parse image URL and coordinates
          // Format: url#xywh=x,y,width,height
          const match = imageLine.match(/^(.+?)(?:#xywh=(\d+),(\d+),(\d+),(\d+))?$/);
          
          if (match) {
            const [, rawUrl, x, y, width, height] = match;
            let resolvedUrl = rawUrl.trim();
            
            try {
              resolvedUrl = new URL(resolvedUrl, originalVttUrl).toString();
            } catch {
              // Leave the URL as-is if it can't be resolved relative to the VTT file
            }
            
            if (proxyBase) {
              resolvedUrl = `${proxyBase}?url=${encodeURIComponent(resolvedUrl)}`;
            }
            
            cues.push({
              startTime,
              endTime,
              url: resolvedUrl,
              x: x ? parseInt(x, 10) : undefined,
              y: y ? parseInt(y, 10) : undefined,
              width: width ? parseInt(width, 10) : undefined,
              height: height ? parseInt(height, 10) : undefined,
            });
          }
        }
      }
      
      i++;
    }
    
    return cues;
  } catch (error) {
    console.error('Failed to parse VTT thumbnails:', error);
    return [];
  }
}

/**
 * Find the thumbnail cue for a given time
 */
export function findThumbnailForTime(cues: ThumbnailCue[], time: number): ThumbnailCue | null {
  for (const cue of cues) {
    if (time >= cue.startTime && time <= cue.endTime) {
      return cue;
    }
  }
  return null;
}