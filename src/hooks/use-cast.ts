import { useState, useEffect, useRef, useCallback } from 'react';

export function useCast(source: string | null, title: string, tracks?: any[], animeImage?: string, animeDescription?: string) {
  const [isCasting, setIsCasting] = useState(false);
  const [castAvailable, setCastAvailable] = useState(false);
  const castSessionRef = useRef<any>(null);
  const castTracksMapRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const initializeCast = () => {
      if (typeof window !== 'undefined' && (window as any).chrome?.cast) {
        try {
          const cast = (window as any).chrome.cast;
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
              
              // Add listener for media status updates
              session.addUpdateListener((isAlive: boolean) => {
                if (!isAlive) {
                  setIsCasting(false);
                  castSessionRef.current = null;
                }
              });
              
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

  const loadMediaToCast = useCallback((session: any, currentTime?: number) => {
    if (!session || !source) return;

    castTracksMapRef.current.clear();

    try {
      const cast = (window as any).chrome.cast;
      const mediaInfo = new cast.media.MediaInfo(source, 'application/x-mpegurl');
      
      // Set streaming protocol options for proper video playback
      mediaInfo.streamType = cast.media.StreamType.BUFFERED;
      mediaInfo.duration = null; // Let Cast determine duration
      mediaInfo.contentType = 'application/x-mpegurl'; // Explicitly set content type for HLS
      
      // Add media status listener to handle seek events
      session.addMediaListener((media: any) => {
        if (media) {
          media.addUpdateListener((isAlive: boolean) => {
            if (isAlive) {
              // Re-apply subtitle styling after any media update (including seeks)
              const activeTrackIds = media.activeTrackIds;
              if (activeTrackIds && activeTrackIds.length > 0) {
                const textTrackStyle = new cast.media.TextTrackStyle();
                textTrackStyle.backgroundColor = '#000000CC';
                textTrackStyle.foregroundColor = '#FFFFFF';
                textTrackStyle.edgeType = cast.media.TextTrackEdgeType.DROP_SHADOW;
                textTrackStyle.fontScale = 1.0;
                textTrackStyle.windowType = cast.media.TextTrackWindowType.NONE;
                
                const tracksInfoRequest = new cast.media.EditTracksInfoRequest(activeTrackIds, textTrackStyle);
                media.editTracksInfo(tracksInfoRequest, 
                  () => console.log('✅ Subtitle style reapplied after media update'),
                  (error: any) => console.warn('⚠️ Failed to reapply subtitle style:', error)
                );
              }
            }
          });
        }
      });
      
      mediaInfo.metadata = new cast.media.GenericMediaMetadata();
      mediaInfo.metadata.title = title;
      
      if (animeImage) {
        mediaInfo.metadata.images = [new cast.media.Image(animeImage)];
      }
      
      if (animeDescription) {
        mediaInfo.metadata.subtitle = animeDescription;
      }
      
      if (tracks && tracks.length > 0) {
        const castTracks: any[] = [];
        let trackId = 1;
        
        tracks.forEach((track: any) => {
          if (track.kind === 'thumbnails') {
            const thumbTrack = new cast.media.Track(trackId++, cast.media.TrackType.TEXT);
            thumbTrack.trackContentId = track.file;
            thumbTrack.trackContentType = 'text/vtt';
            thumbTrack.subtype = cast.media.TextTrackType.THUMBNAILS;
            thumbTrack.name = 'Thumbnails';
            castTracks.push(thumbTrack);
            console.log('✅ Added thumbnail track to Cast:', track.file);
          } else if (track.kind === 'subtitles' || track.kind === 'captions' || !track.kind) {
            const currentTrackId = trackId++;
            const subTrack = new cast.media.Track(currentTrackId, cast.media.TrackType.TEXT);
            subTrack.trackContentId = track.file;
            subTrack.trackContentType = 'text/vtt';
            subTrack.subtype = cast.media.TextTrackType.SUBTITLES;
            subTrack.name = track.label || 'Unknown';
            
            castTracksMapRef.current.set(track.file, currentTrackId);
            
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
            console.log('✅ Added subtitle track to Cast:', track.label, 'with ID:', currentTrackId);
          }
        });
        
        if (castTracks.length > 0) {
          mediaInfo.tracks = castTracks;
          console.log(`📺 Total tracks added to Cast: ${castTracks.length}`);
        }
      }

      const request = new cast.media.LoadRequest(mediaInfo);
      request.autoplay = true;
      request.currentTime = currentTime || 0; // Resume from current position
      
      // Configure text track style for subtitles
      const textTrackStyle = new cast.media.TextTrackStyle();
      textTrackStyle.backgroundColor = '#000000CC';
      textTrackStyle.foregroundColor = '#FFFFFF';
      textTrackStyle.edgeType = cast.media.TextTrackEdgeType.DROP_SHADOW;
      textTrackStyle.fontFamily = 'SANS_SERIF';
      textTrackStyle.fontScale = 1.0;
      textTrackStyle.fontGenericFamily = cast.media.TextTrackFontGenericFamily.SANS_SERIF;
      textTrackStyle.windowType = cast.media.TextTrackWindowType.NONE;
      request.textTrackStyle = textTrackStyle;
      
      // Ensure proper media loading
      request.media = mediaInfo;
      
      // Find and enable default English subtitle track
      const subtitleTracks = mediaInfo.tracks?.filter((t: any) => 
        t.subtype === cast.media.TextTrackType.SUBTITLES
      );
      
      if (subtitleTracks && subtitleTracks.length > 0) {
        // Try to find English track first
        const englishTrack = subtitleTracks.find((t: any) => 
          t.language === 'en' || 
          t.name?.toLowerCase().includes('english')
        );
        
        const defaultTrack = englishTrack || subtitleTracks[0];
        request.activeTrackIds = [defaultTrack.trackId];
        console.log(`✅ Enabled default subtitle track: ${defaultTrack.name} (${defaultTrack.language}) with ID: ${defaultTrack.trackId}`);
      }

      session.loadMedia(request).then(
        () => {
          console.log('✅ Media loaded to Cast with metadata and tracks');
        },
        (error: any) => {
          console.error('❌ Error loading media to Cast:', error);
        }
      );
    } catch (err) {
      console.error("Error loading media to cast:", err);
    }
  }, [source, title, tracks, animeImage, animeDescription]);

  // Function to change subtitle on Cast device
  const changeCastSubtitle = useCallback((trackFile: string) => {
    if (!castSessionRef.current) {
      console.log('❌ No active cast session');
      return;
    }
    
    const media = castSessionRef.current.getMediaSession();
    if (!media) {
      console.log('❌ No media session');
      return;
    }
    
    const cast = (window as any).chrome?.cast;
    if (!cast) return;
    
    const castTrackId = castTracksMapRef.current.get(trackFile);
    
    if (castTrackId !== undefined) {
      // Create edit request with proper text track style for sync
      const textTrackStyle = new cast.media.TextTrackStyle();
      textTrackStyle.backgroundColor = '#000000CC';
      textTrackStyle.foregroundColor = '#FFFFFF';
      textTrackStyle.edgeType = cast.media.TextTrackEdgeType.DROP_SHADOW;
      textTrackStyle.fontScale = 1.0;
      textTrackStyle.windowType = cast.media.TextTrackWindowType.NONE;
      
      const tracksInfoRequest = new cast.media.EditTracksInfoRequest([castTrackId], textTrackStyle);
      media.editTracksInfo(tracksInfoRequest, 
        () => console.log(`✅ Cast subtitle changed to track ${castTrackId} with sync settings`),
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
  }, []);

  // Function to force subtitle resync after seek operations
  const resyncCastSubtitles = useCallback(() => {
    if (!castSessionRef.current) return;
    
    const media = castSessionRef.current.getMediaSession();
    if (!media) return;
    
    const cast = (window as any).chrome?.cast;
    if (!cast) return;
    
    const activeTrackIds = media.activeTrackIds;
    if (activeTrackIds && activeTrackIds.length > 0) {
      const textTrackStyle = new cast.media.TextTrackStyle();
      textTrackStyle.backgroundColor = '#000000CC';
      textTrackStyle.foregroundColor = '#FFFFFF';
      textTrackStyle.edgeType = cast.media.TextTrackEdgeType.DROP_SHADOW;
      textTrackStyle.fontScale = 1.0;
      textTrackStyle.windowType = cast.media.TextTrackWindowType.NONE;
      
      // Force reapply the current subtitle track to resync
      const tracksInfoRequest = new cast.media.EditTracksInfoRequest(activeTrackIds, textTrackStyle);
      media.editTracksInfo(tracksInfoRequest, 
        () => console.log('✅ Subtitles resynced after seek'),
        (error: any) => console.warn('⚠️ Failed to resync subtitles:', error)
      );
    }
  }, []);

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

  return { isCasting, castAvailable, handleCastClick, changeCastSubtitle, resyncCastSubtitles };
}