import { useState, useEffect, useRef, useCallback } from 'react';

export function useCast(source: string | null, title: string, tracks?: any[]) {
  const [isCasting, setIsCasting] = useState(false);
  const [castAvailable, setCastAvailable] = useState(false);
  const castSessionRef = useRef<any>(null);

  useEffect(() => {
    const initializeCast = () => {
      if (typeof window !== 'undefined' && (window as any).chrome?.cast) {
        try {
          const cast = (window as any).chrome.cast;
          // Check if we can construct the request (will fail in sandbox without allow-presentation)
          try {
            new cast.SessionRequest(cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID);
          } catch (e) {
            console.warn("Cast API available but SessionRequest failed (likely sandbox restriction):", e);
            return;
          }

          const sessionRequest = new cast.SessionRequest(cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID);
          const apiConfig = new cast.ApiConfig(
            sessionRequest,
            (session: any) => {
              console.log('Cast session started');
              castSessionRef.current = session;
              setIsCasting(true);
              loadMediaToCast(session);
            },
            (availability: string) => {
              setCastAvailable(availability === 'available');
            }
          );
          cast.initialize(apiConfig, () => {
            console.log('Cast initialized');
          }, (error: any) => {
            console.error('Cast initialization error:', error);
          });
        } catch (err) {
          console.warn('Google Cast initialization failed:', err);
          setCastAvailable(false);
        }
      }
    };

    if ((window as any).__onGCastApiAvailable) {
      initializeCast();
    } else {
      (window as any).__onGCastApiAvailable = (isAvailable: boolean) => {
        if (isAvailable) {
          initializeCast();
        }
      };
    }
  }, []);

  const loadMediaToCast = useCallback((session: any) => {
    if (!session || !source) return;

    try {
      const cast = (window as any).chrome.cast;
      const mediaInfo = new cast.media.MediaInfo(source, 'application/x-mpegurl');
      mediaInfo.metadata = new cast.media.GenericMediaMetadata();
      mediaInfo.metadata.title = title;
      
      // Add subtitle tracks
      if (tracks && tracks.length > 0) {
        mediaInfo.tracks = tracks
          .filter((t: any) => t.kind !== 'thumbnails')
          .map((track: any, idx: number) => {
            const castTrack = new cast.media.Track(idx, cast.media.TrackType.TEXT);
            castTrack.trackContentId = track.file;
            castTrack.trackContentType = 'text/vtt';
            castTrack.subtype = cast.media.TextTrackType.SUBTITLES;
            castTrack.name = track.label;
            castTrack.language = track.label?.slice(0, 2)?.toLowerCase() || 'en';
            return castTrack;
          });
      }

      const request = new cast.media.LoadRequest(mediaInfo);
      request.autoplay = true;

      session.loadMedia(request).then(
        () => {
          console.log('Media loaded to Cast');
        },
        (error: any) => {
          console.error('Error loading media:', error);
        }
      );
    } catch (err) {
      console.error("Error loading media to cast:", err);
    }
  }, [source, title, tracks]);

  const handleCastClick = useCallback(() => {
    if (isCasting && castSessionRef.current) {
      castSessionRef.current.stop(() => {
        setIsCasting(false);
        castSessionRef.current = null;
      }, (error: any) => {
        console.error('Error stopping cast:', error);
      });
    } else {
      const cast = (window as any).chrome?.cast;
      if (cast) {
        try {
          cast.requestSession(
            (session: any) => {
              castSessionRef.current = session;
              setIsCasting(true);
              loadMediaToCast(session);
            },
            (error: any) => {
              console.error('Error requesting cast session:', error);
            }
          );
        } catch (err) {
          console.error("Error requesting cast session:", err);
        }
      }
    }
  }, [isCasting, loadMediaToCast]);

  return { isCasting, castAvailable, handleCastClick };
}
