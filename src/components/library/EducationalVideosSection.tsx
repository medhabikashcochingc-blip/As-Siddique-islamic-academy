import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, Maximize2, Minimize2, RotateCcw, Video } from 'lucide-react';
import {
  APPROVED_PLAYBOOK_EMBED_URL,
  APPROVED_PLAYBOOK_IFRAME_TITLE,
} from '../../lib/lmsVideoUpload';

interface EducationalVideosSectionProps {
  variant?: 'library' | 'student';
}

export const EducationalVideosSection: React.FC<EducationalVideosSectionProps> = ({
  variant = 'library',
}) => {
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      if (hasError) {
        setHasError(false);
        setIsLoading(true);
        setReloadKey((prev) => prev + 1);
      }
    };
    const handleOffline = () => {
      setHasError(true);
      setIsLoading(false);
    };
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setHasError(true);
      setIsLoading(false);
    }
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [hasError]);

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    setReloadKey((prev) => prev + 1);
  };

  const handleToggleFullscreen = async () => {
    const el = playerContainerRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } else if (el.requestFullscreen) {
        await el.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }
  };

  const kickerLabel =
    variant === 'student'
      ? 'As-Siddique Student Portal · Educational Videos'
      : 'As-Siddique Digital Library · Video Archive';

  const subtitleText =
    variant === 'student'
      ? 'Stream recorded academy lectures, Quran & Tajweed guidance, and Islamic Studies classes directly inside your Student Portal.'
      : 'Watch recorded academy lessons, Quran & Tajweed guidance, and Islamic Studies sessions directly inside the Digital Library gallery.';

  return (
    <section
      id="educational-videos"
      aria-labelledby="educational-videos-heading"
      className={`${
        variant === 'library' ? 'pt-4 border-t border-[#D9AD43]/30' : ''
      } space-y-4`}
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#8A6518] dark:text-[#D9AD43]">
            <Video className="w-4 h-4 shrink-0" />
            <span>{kickerLabel}</span>
          </div>
          <h2
            id="educational-videos-heading"
            className="font-serif text-2xl sm:text-3xl font-semibold text-[#06452C] dark:text-white"
          >
            Educational Videos
          </h2>
          <p className="text-xs sm:text-sm text-[#5A6D64] dark:text-[#DED7C5] max-w-2xl leading-relaxed">
            {subtitleText}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleRetry}
            className="min-h-[42px] inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 text-xs font-semibold text-[#06452C] dark:text-[#F8F1DF] hover:border-[#D9AD43] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#8A6518] dark:text-[#D9AD43]" />
            <span>Reload Player</span>
          </button>

          <button
            type="button"
            onClick={() => void handleToggleFullscreen()}
            className="min-h-[42px] inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 text-xs font-semibold text-[#06452C] dark:text-[#F8F1DF] hover:border-[#D9AD43] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4 text-[#8A6518] dark:text-[#D9AD43]" />
                <span>Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4 text-[#8A6518] dark:text-[#D9AD43]" />
                <span>Fullscreen</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div
        ref={playerContainerRef}
        className="w-full rounded-xl overflow-hidden bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 shadow-sm"
      >
        <div className="px-4 py-2.5 bg-[#06452C] text-[#F8F1DF] border-b border-[#D9AD43]/35 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-white">{APPROVED_PLAYBOOK_IFRAME_TITLE}</span>
          <span className="text-[#DED7C5]">Playbook Video Gallery · Inline Player</span>
        </div>

        <div className="relative w-full h-[600px] bg-[#081A14]">
          {isLoading && !hasError && (
            <div
              role="status"
              aria-live="polite"
              className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#081A14]/90 text-[#F8F1DF] p-6 text-center"
            >
              <div className="w-9 h-9 border-2 border-[#D9AD43]/30 border-t-[#D9AD43] rounded-full animate-spin" />
              <p className="text-sm font-semibold text-white">Loading Educational Videos...</p>
              <p className="text-xs text-[#DED7C5] max-w-sm">
                Preparing Playbook video gallery for mobile and desktop playback.
              </p>
            </div>
          )}

          {hasError ? (
            <div
              role="alert"
              className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-[#081A14] text-[#F8F1DF] p-6 text-center"
            >
              <AlertCircle className="w-10 h-10 text-[#D9AD43]" />
              <p className="font-serif text-lg font-semibold text-white">
                Unable to Load Educational Video Gallery
              </p>
              <p className="text-xs text-[#DED7C5] max-w-md leading-relaxed">
                Please check your internet connection and tap Retry to reload the Playbook video
                player.
              </p>
              <button
                type="button"
                onClick={handleRetry}
                className="min-h-[42px] inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D9AD43] text-[#102D23] text-xs font-bold cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry Video Player</span>
              </button>
            </div>
          ) : (
            <iframe
              key={reloadKey}
              src={APPROVED_PLAYBOOK_EMBED_URL}
              title={APPROVED_PLAYBOOK_IFRAME_TITLE}
              width="100%"
              height="600"
              className="w-full h-[600px] border-0 block"
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              onLoad={() => {
                setIsLoading(false);
                setHasError(false);
              }}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
            />
          )}
        </div>
      </div>
    </section>
  );
};
