import React, { useState } from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';
import { HERO_MOSQUE_IMAGE } from '../data/academyData';

interface HeroSectionProps {
  onApplyClick: () => void;
  onExploreProgrammes: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onApplyClick,
  onExploreProgrammes,
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <section id="top" className="relative overflow-hidden bg-[#06281E] text-[#FAF7F0]">
      {/* Mosque Architectural Background with Fallback & Measured Scrim */}
      <div className="relative min-h-[560px] lg:min-h-[640px] flex flex-col justify-between">
        {!imgError ? (
          <img
            src={HERO_MOSQUE_IMAGE}
            alt="As-Siddique Islamic Academy mosque dome, courtyard archways, and cypress gardens at golden hour"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        ) : (
          <div
            className="absolute inset-0 bg-gradient-to-br from-[#06281E] via-[#0A3E2F] to-[#124B39] islamic-lattice-dark"
            aria-hidden="true"
          />
        )}

        {/* Measured WCAG Contrast Scrim */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#051F17]/95 via-[#06281E]/82 to-[#06281E]/50"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#051F17]/90 via-transparent to-[#051F17]/35"
          aria-hidden="true"
        />

        {/* Top Royal Gold Hairline Trim */}
        <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-20 pb-12">
          <div className="max-w-3xl">
            <p className="text-xs sm:text-sm font-medium tracking-[0.18em] uppercase text-[#E5C158] mb-4">
              بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ · Class 1 to Class 12
            </p>

            <h1
              className="font-serif font-semibold tracking-tight text-[#FAF7F0] leading-[1.08] mb-5"
              style={{ fontSize: 'clamp(2.35rem, 4.4vw, 4rem)', textWrap: 'balance' }}
            >
              Where Sacred Wisdom Meets Academic Excellence
            </h1>

            <p className="text-base sm:text-lg text-[#E6E0D3] leading-relaxed max-w-2xl mb-8">
              As-Siddique Islamic Academy nurtures confident, principled scholars from Class 1 to
              Class 12—uniting rigorous national and international academics with authentic Quranic,
              Arabic, and Islamic character education on campus and online.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onApplyClick}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 text-sm sm:text-base font-semibold text-[#06281E] bg-[#E5C158] hover:bg-[#D5B047] rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E5C158]"
              >
                <span>Apply for 2026–27 Admission</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={onExploreProgrammes}
                className="inline-flex items-center gap-2 px-5 py-3.5 text-sm sm:text-base font-medium text-[#FAF7F0] bg-[#FAF7F0]/10 hover:bg-[#FAF7F0]/18 border border-[#FAF7F0]/25 rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FAF7F0]"
              >
                <BookOpen className="w-4 h-4 text-[#E5C158]" aria-hidden="true" />
                <span>Explore Class 1–12</span>
              </button>
            </div>
          </div>
        </div>

        {/* Full-Width Operational Institutional Utility Strip (below hero narrative) */}
        <div className="relative z-10 border-t border-[#C9A449]/30 bg-[#051E16]/85 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-sm">
              <div className="border-r border-[#C9A449]/20 pr-4 last:border-r-0">
                <p className="text-xs text-[#E5C158] font-medium tracking-wide uppercase">
                  Academic Span
                </p>
                <p className="font-serif text-lg sm:text-xl font-semibold text-[#FAF7F0] tabular-nums mt-0.5">
                  Class 1 – Class 12
                </p>
              </div>
              <div className="lg:border-r border-[#C9A449]/20 pr-4">
                <p className="text-xs text-[#E5C158] font-medium tracking-wide uppercase">
                  Dual Curriculum
                </p>
                <p className="font-serif text-lg sm:text-xl font-semibold text-[#FAF7F0] mt-0.5">
                  General &amp; Islamic Wings
                </p>
              </div>
              <div className="border-r border-[#C9A449]/20 pr-4">
                <p className="text-xs text-[#E5C158] font-medium tracking-wide uppercase">
                  Learning Modes
                </p>
                <p className="font-serif text-lg sm:text-xl font-semibold text-[#FAF7F0] mt-0.5">
                  Campus &amp; Live Online
                </p>
              </div>
              <div>
                <p className="text-xs text-[#E5C158] font-medium tracking-wide uppercase">
                  Admissions Status
                </p>
                <p className="font-serif text-lg sm:text-xl font-semibold text-[#FAF7F0] tabular-nums mt-0.5">
                  Session 2026–2027 Open
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
