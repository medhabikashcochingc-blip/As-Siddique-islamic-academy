import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2, Video } from 'lucide-react';

const PLAYBOOK_EMBED_URL =
  'https://www.playbook.com/e/as-siddiqueislamicacademy/4RggDwKfDCc5wX4R5uHLA79X?theme=gallery&assetNumber=3&displaySize=medium';

export const EducationalVideosSection: React.FC = () => {
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

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

  return (
    <section
      id="educational-videos"
      aria-labelledby="educational-videos-heading"
      className="pt-4 border-t border-[#D9AD43]/30 space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#8A6518] dark:text-[#D9AD43]">
            <Video className="w-4 h-4 shrink-0" />
            <span>As-Siddique Digital Library · Video Archive</span>
          </div>
          <h2
            id="educational-videos-heading"
            className="font-serif text-2xl sm:text-3xl font-semibold text-[#06452C] dark:text-white"
          >
            Educational Videos
          </h2>
          <p className="text-xs sm:text-sm text-[#5A6D64] dark:text-[#DED7C5] max-w-2xl leading-relaxed">
            Watch recorded academy lessons, Quran &amp; Tajweed guidance, and Islamic Studies
            sessions directly inside the Digital Library gallery.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleToggleFullscreen()}
          className="min-h-[42px] self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 text-xs font-semibold text-[#06452C] dark:text-[#F8F1DF] hover:border-[#D9AD43] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-4 h-4 text-[#8A6518] dark:text-[#D9AD43]" />
              <span>Exit Fullscreen</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-4 h-4 text-[#8A6518] dark:text-[#D9AD43]" />
              <span>Fullscreen Gallery</span>
            </>
          )}
        </button>
      </div>

      <div
        ref={playerContainerRef}
        className="w-full rounded-xl overflow-hidden bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 shadow-sm"
      >
        <div className="px-4 py-2.5 bg-[#06452C] text-[#F8F1DF] border-b border-[#D9AD43]/35 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-white">
            As-Siddique Islamic Academy Educational Videos
          </span>
          <span className="text-[#DED7C5]">Playbook Video Gallery · Inline Player</span>
        </div>

        <div className="relative w-full h-[520px] sm:h-[600px] lg:h-[680px] bg-[#F8F1DF] dark:bg-[#081A14]">
          <iframe
            src={PLAYBOOK_EMBED_URL}
            title="As-Siddique Islamic Academy Educational Videos"
            className="w-full h-full border-0 block"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      </div>
    </section>
  );
};
