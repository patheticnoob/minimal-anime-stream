import { useState, useEffect, useRef, useCallback } from 'react';

export function useCast(source: string | null, title: string, tracks?: any[], animeImage?: string, animeDescription?: string) {
  const [isCasting, setIsCasting] = useState(false);
  const [castAvailable, setCastAvailable] = useState(false);
  const [setCastSubtitle, setSetCastSubtitle] = useState<((trackFile: string) => void) | null>(null);
  const castSessionRef = useRef<any>(null);
  const castTracksMapRef = useRef<Map<string, number>>(new Map());

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

    // Clear previous track mappings
    castTracksMapRef.current.clear();

    try {
      const cast = (window as any).chrome.cast;
      const mediaInfo = new cast.media.MediaInfo(source, 'application/x-mpegurl');
      
      // Enhanced metadata with anime information
      mediaInfo.metadata = new cast.media.GenericMediaMetadata();
      mediaInfo.metadata.title = title;
      
      if (animeImage) {
        mediaInfo.metadata.images = [new cast.media.Image(animeImage)];
      }
      
      if (animeDescription) {
        mediaInfo.metadata.subtitle = animeDescription;
      }
      
      // Map all tracks including subtitles and thumbnails
      if (tracks && tracks.length > 0) {
        const castTracks: any[] = [];
        let trackId = 1; // Start from 1 instead of 0
        
        tracks.forEach((track: any) => {
          if (track.kind === 'thumbnails') {
            // Add thumbnail track for seeking preview
            const thumbTrack = new cast.media.Track(trackId++, cast.media.TrackType.TEXT);
            thumbTrack.trackContentId = track.file;
            thumbTrack.trackContentType = 'text/vtt';
            thumbTrack.subtype = cast.media.TextTrackType.THUMBNAILS;
            thumbTrack.name = 'Thumbnails';
            castTracks.push(thumbTrack);
            console.log('✅ Added thumbnail track to Cast:', track.file);
          } else if (track.kind === 'subtitles' || track.kind === 'captions' || !track.kind) {
            // Add subtitle/caption tracks
            const currentTrackId = trackId++;
            const subTrack = new cast.media.Track(currentTrackId, cast.media.TrackType.TEXT);
            subTrack.trackContentId = track.file;
            subTrack.trackContentType = 'text/vtt';
            subTrack.subtype = cast.media.TextTrackType.SUBTITLES;
            subTrack.name = track.label || 'Unknown';
            
            // Map track file to Cast track ID
            castTracksMapRef.current.set(track.file, currentTrackId);
            // Extract proper language code from label or use the language field
            const langCode = track.language?.toLowerCase() || 
                           (track.label?.toLowerCase().includes('english') ? 'en' : 
                            track.label?.toLowerCase().includes('spanish') ? 'es' :
                            track.label?.toLowerCase().includes('french') ? 'fr' :
                            track.label?.toLowerCase().includes('german') ? 'de' :
                            track.label?.toLowerCase().includes('japanese') ? 'ja' :
                            track.label?.toLowerCase().includes('chinese') ? 'zh' :
                            track.label?.toLowerCase().includes('korean') ? 'ko' :
                            track.label?.toLowerCase().includes('portuguese') ? 'pt' :
                            track.label?.toLowerCase().includes('italian') ? 'it' :
                            track.label?.toLowerCase().includes('russian') ? 'ru' :
                            track.label?.slice(0, 2)?.toLowerCase() || 'en');
            subTrack.language = langCode;
            castTracks.push(subTrack);
            console.log('✅ Added subtitle track to Cast:', track.label);
          }
        });
        
        if (castTracks.length > 0) {
          mediaInfo.tracks = castTracks;
          console.log(`📺 Total tracks added to Cast: ${castTracks.length}`);
        }
      }

      const request = new cast.media.LoadRequest(mediaInfo);
      request.autoplay = true;
      
      // Set text track style BEFORE enabling tracks for better visibility
      const textTrackStyle = new cast.media.TextTrackStyle();
      textTrackStyle.backgroundColor = '#000000CC';
      textTrackStyle.foregroundColor = '#FFFFFF';
      textTrackStyle.edgeType = cast.media.TextTrackEdgeType.DROP_SHADOW;
      textTrackStyle.fontFamily = 'SANS_SERIF';
      textTrackStyle.fontScale = 1.2; // Slightly larger for better readability
      textTrackStyle.fontGenericFamily = cast.media.TextTrackFontGenericFamily.SANS_SERIF;
      request.textTrackStyle = textTrackStyle;
      
      // Enable the first subtitle track by default if available
      const subtitleTracks = mediaInfo.tracks?.filter((t: any) => 
        t.subtype === cast.media.TextTrackType.SUBTITLES
      );
      if (subtitleTracks && subtitleTracks.length > 0) {
        request.activeTrackIds = [subtitleTracks[0].trackId];
        console.log(`✅ Enabled default subtitle track: ${subtitleTracks[0].name} (${subtitleTracks[0].language})`);
      }

      session.loadMedia(request).then(
        () => {
          console.log('✅ Media loaded to Cast with metadata and tracks');
          
          // Create subtitle control function
          const subtitleController = (trackFile: string) => {
            if (!session) return;
            
            const media = session.getMediaSession();
            if (!media) return;
            
            const castTrackId = castTracksMapRef.current.get(trackFile);
            
            if (castTrackId !== undefined) {
              const tracksInfoRequest = new cast.media.EditTracksInfoRequest([castTrackId]);
              media.editTracksInfo(tracksInfoRequest, 
                () => console.log(`✅ Cast subtitle changed to track ${castTrackId}`),
                (error: any) => console.error('❌ Error changing Cast subtitle:', error)
              );
            } else {
              // Turn off subtitles
              const tracksInfoRequest = new cast.media.EditTracksInfoRequest([]);
              media.editTracksInfo(tracksInfoRequest,
                () => console.log('✅ Cast subtitles turned off'),
                (error: any) => console.error('❌ Error turning off Cast subtitles:', error)
              );
            }
          };
          
          setSetCastSubtitle(() => subtitleController);
        },
        (error: any) => {
          console.error('❌ Error loading media to Cast:', error);
        }
      );
    } catch (err) {
      console.error("Error loading media to cast:", err);
    }
  }, [source, title, tracks, animeImage, animeDescription]);

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

  return { isCasting, castAvailable, handleCastClick, setCastSubtitle };
}