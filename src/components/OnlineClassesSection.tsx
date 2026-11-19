import React, { useState } from 'react';
import { ArrowRight, Video } from 'lucide-react';
import { ONLINE_LEARNING_IMAGE, ONLINE_TRACKS } from '../data/academyData';
import { AcademyEmblem } from './AcademyEmblem';

interface OnlineClassesSectionProps {
  onBookOnlineTrial: (classRangeLabel: string) => void;
}

export const OnlineClassesSection: React.FC<OnlineClassesSectionProps> = ({
  onBookOnlineTrial,
}) => {
  const [selectedTrackId, setSelectedTrackId] = useState<'primary' | 'middle' | 'secondary'>(
    'primary'
  );
  const [imgError, setImgError] = useState(false);

  const activeTrack =
    ONLINE_TRACKS.find((track) => track.id === selectedTrackId) || ONLINE_TRACKS[0];

  return (
    <section
      id="online-classes"
      className="py-16 sm:py-24 bg-[#06281E] text-[#FAF7F0] islamic-lattice-dark border-b border-[#C9A449]/25"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top 2-Column Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch mb-12">
          {/* Left Narrative */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#E5C158] mb-2">
              Virtual Academy Wing · Class 1 – Class 12
            </p>
            <h2
              className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#FAF7F0] tracking-tight mb-5"
              style={{ textWrap: 'balance' }}
            >
              Live Interactive Online Classes from Anywhere
            </h2>
            <p className="text-sm sm:text-base text-[#D7CFC0] leading-relaxed mb-6">
              Designed for families seeking authentic Islamic and General Education across cities or
              time zones. Students attend live teacher-led classrooms in small cohorts—not passive
              pre-recorded videos—with direct two-way Tajweed correction, interactive science
              whiteboards, and monthly parent review briefings.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5 border-t border-[#C9A449]/25">
              <div>
                <p className="font-serif text-xl font-semibold text-[#E5C158]">
                  Small Live Cohorts
                </p>
                <p className="text-xs sm:text-sm text-[#D7CFC0] mt-1">
                  Capped at 14–20 students per section for individual recitation and math check-ins.
                </p>
              </div>
              <div>
                <p className="font-serif text-xl font-semibold text-[#E5C158]">
                  Structured Timetable
                </p>
                <p className="text-xs sm:text-sm text-[#D7CFC0] mt-1">
                  Balanced morning and afternoon slots covering both General and Islamic subjects.
                </p>
              </div>
            </div>
          </div>

          {/* Right 4:3 Image */}
          <div className="lg:col-span-6 flex flex-col">
            <div className="flex-1 min-h-[300px] rounded-xl overflow-hidden border border-[#C9A449]/35 bg-[#093B2C]">
              {!imgError ? (
                <img
                  src={ONLINE_LEARNING_IMAGE}
                  alt="Student participating in a live interactive As-Siddique Islamic Academy online class"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
                  <AcademyEmblem className="w-14 h-14 mb-3" variant="gold-on-emerald" />
                  <p className="font-serif text-xl text-[#FAF7F0]">
                    As-Siddique Live Virtual Classrooms
                  </p>
                </div>
              )}
            </div>
            <p className="text-xs font-serif italic text-[#D7CFC0]/80 mt-2.5">
              Live small-group instruction combining interactive whiteboards and daily Quran
              recitation circles.
            </p>
          </div>
        </div>

        {/* Interactive Sample Weekly Timetable Panel */}
        <div className="bg-[#093B2C] border border-[#C9A449]/30 rounded-xl p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#C9A449]/25">
            <div>
              <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#FAF7F0]">
                Live Online Timetable Preview
              </h3>
              <p className="text-xs sm:text-sm text-[#D7CFC0] mt-1">
                {activeTrack.scheduleSummary} · {activeTrack.cohortSize} · {activeTrack.timingNote}
              </p>
            </div>

            {/* Track Switcher */}
            <div
              role="tablist"
              aria-label="Select online class track"
              className="inline-flex flex-wrap gap-1.5 p-1 bg-[#051F17] border border-[#C9A449]/25 rounded-lg"
            >
              {ONLINE_TRACKS.map((track) => {
                const isActive = track.id === selectedTrackId;
                return (
                  <button
                    key={track.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setSelectedTrackId(track.id)}
                    className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-[#E5C158] text-[#06281E] font-semibold'
                        : 'text-[#D7CFC0] hover:text-[#FAF7F0]'
                    }`}
                  >
                    {track.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sessions Table */}
          <div className="divide-y divide-[#C9A449]/20 mt-2">
            {activeTrack.sessions.map((session) => (
              <div
                key={`${session.day}-${session.subject}`}
                className="py-4 grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-center text-sm"
              >
                <div className="md:col-span-3 font-medium text-[#E5C158] tabular-nums">
                  {session.day} · {session.time}
                </div>
                <div className="md:col-span-5 font-serif text-lg sm:text-xl text-[#FAF7F0]">
                  {session.subject}
                </div>
                <div className="md:col-span-4 text-xs sm:text-sm text-[#D7CFC0] md:text-right">
                  Led by {session.instructor}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-5 border-t border-[#C9A449]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-[#D7CFC0]">
              <Video className="w-4 h-4 text-[#E5C158] shrink-0" aria-hidden="true" />
              <span>
                Complimentary two-day online observation &amp; placement assessment available for new
                families.
              </span>
            </div>
            <button
              type="button"
              onClick={() => onBookOnlineTrial(activeTrack.classes.split('–')[0].trim())}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#06281E] bg-[#E5C158] hover:bg-[#D5B047] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Request Online Trial</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
