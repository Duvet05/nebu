import React from 'react';

interface ProductVideoPlayerProps {
  /** Cloudflare Stream playback ID or YouTube video ID */
  playbackId?: string;
  /** Video provider type */
  videoProvider?: 'cloudflare' | 'youtube';
  /** Custom thumbnail URL (optional, auto-generated for Cloudflare) */
  thumbnailUrl?: string;
  /** Additional CSS classes */
  className?: string;
  /** Legacy prop for compatibility - not used in video player */
  color?: string;
  /** Aspect ratio mode: 'landscape' (16:9) or 'vertical' (9:16 like TikTok) */
  aspectRatio?: 'landscape' | 'vertical';
}

/**
 * ProductVideoPlayer - Displays product demo videos
 * 
 * Supports:
 * - Cloudflare Stream (preferred) with @cloudflare/stream-react or iframe fallback
 * - YouTube embeds
 * - Lazy loading with intersection observer
 * - Automatic thumbnail generation for Cloudflare videos
 */
export default function ProductVideoPlayer({
  playbackId,
  videoProvider = 'cloudflare',
  thumbnailUrl,
  className = '',
  aspectRatio = 'landscape'
}: ProductVideoPlayerProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [StreamComponent, setStreamComponent] = React.useState<any>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  // Try to load @cloudflare/stream-react dynamically
  React.useEffect(() => {
    if (videoProvider !== 'cloudflare') return;
    
    import('@cloudflare/stream-react')
      .then((module) => {
        setStreamComponent(() => module.Stream);
      })
      .catch(() => {
        // Library not available, will use iframe fallback
      });
  }, [videoProvider]);

  // Generate thumbnail URL for Cloudflare videos
  const thumbnail = React.useMemo(() => {
    if (thumbnailUrl) return thumbnailUrl;
    if (videoProvider === 'cloudflare' && playbackId) {
      return `https://videodelivery.net/${encodeURIComponent(playbackId)}/thumbnails/thumbnail.jpg?time=2`;
    }
    return undefined;
  }, [playbackId, videoProvider, thumbnailUrl]);

  // Lazy load video when it enters viewport
  React.useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '200px' }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Calculate padding for aspect ratio
  // 16:9 = 56.25% (landscape), 9:16 = 177.78% (vertical like TikTok)
  const paddingBottom = aspectRatio === 'vertical' ? '177.78%' : '56.25%';

  // Render Cloudflare Stream video
  if (videoProvider === 'cloudflare' && playbackId) {
    return (
      <div ref={containerRef} className={`w-full ${className}`}>
        <div className="relative w-full" style={{ paddingBottom }}>
          {!isVisible ? (
            <div className="absolute top-0 left-0 w-full h-full rounded-xl overflow-hidden shadow-md bg-gray-100 flex items-center justify-center">
              {thumbnail ? (
                <img 
                  src={thumbnail} 
                  alt="Video preview" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="text-gray-500">Cargando vista previa…</div>
              )}
            </div>
          ) : StreamComponent ? (
            // Use @cloudflare/stream-react if available
            <div className="absolute top-0 left-0 w-full h-full rounded-xl overflow-hidden shadow-md">
              <StreamComponent
                src={playbackId}
                controls
                poster={thumbnail}
                className="w-full h-full"
              />
            </div>
          ) : (
            // Fallback to iframe
            <iframe
              title="Product video (Cloudflare Stream)"
              src={`https://iframe.videodelivery.net/${encodeURIComponent(playbackId)}`}
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full rounded-xl shadow-md"
            />
          )}
        </div>
      </div>
    );
  }

  // Render YouTube video
  if (videoProvider === 'youtube' && playbackId) {
    const ytSrc = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(playbackId)}?rel=0&modestbranding=1`;
    
    return (
      <div ref={containerRef} className={`w-full ${className}`}>
        <div className="relative w-full" style={{ paddingBottom }}>
          {!isVisible ? (
            <div className="absolute top-0 left-0 w-full h-full rounded-xl overflow-hidden shadow-md bg-gray-100 flex items-center justify-center">
              {thumbnail ? (
                <img 
                  src={thumbnail} 
                  alt="Video preview" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="text-gray-500">Cargando vista previa…</div>
              )}
            </div>
          ) : (
            <iframe
              title="Product video (YouTube)"
              src={ytSrc}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full rounded-xl shadow-md"
            />
          )}
        </div>
      </div>
    );
  }

  // No video data provided
  return (
    <div className={`w-full ${className}`}>
      <div className="relative w-full" style={{ paddingBottom }}>
        <div className="absolute top-0 left-0 w-full h-full rounded-xl overflow-hidden shadow-md bg-gray-100 flex items-center justify-center">
          <div className="text-gray-500">No hay video disponible</div>
        </div>
      </div>
    </div>
  );
}
