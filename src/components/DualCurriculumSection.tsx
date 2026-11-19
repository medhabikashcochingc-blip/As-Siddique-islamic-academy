import React from 'react';
import { CURRICULUM_STREAMS } from '../data/academyData';
import { GeometricDivider } from './AcademyEmblem';

export const DualCurriculumSection: React.FC = () => {
  const [generalStream, islamicStream] = CURRICULUM_STREAMS;

  return (
    <section
      id="curriculum"
      className="py-16 sm:py-24 bg-[#F2ECE0] islamic-lattice-light border-b border-[#E4DDD0]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-14">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#8A6518] mb-2">
            Integrated Dual Curriculum
          </p>
          <h2
            className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#06281E] tracking-tight mb-4"
            style={{ textWrap: 'balance' }}
          >
            Two Harmonious Wings of Knowledge
          </h2>
          <GeometricDivider />
          <p className="text-sm sm:text-base text-[#465B52] leading-relaxed mt-4">
            In the classical Islamic tradition, empirical inquiry and revelation illuminate one
            another. Our timetable dedicates balanced, unhurried hours to both General Education
            and Islamic Education every single day.
          </p>
        </div>

        {/* Twin Architectural Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Wing 01: General Education (Cream White Surface) */}
          <div className="bg-white border border-[#DED5C3] rounded-xl p-7 sm:p-9 flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[#8A6518] mb-2">
                {generalStream.eyebrow}
              </p>
              <h3 className="font-serif text-3xl font-semibold text-[#06281E] mb-2">
                {generalStream.title}
              </h3>
              <p className="text-sm font-medium text-[#314A3F] mb-4">
                {generalStream.subtitle}
              </p>
              <p className="text-sm text-[#465B52] leading-relaxed pb-6 border-b border-[#EFE9DC]">
                {generalStream.description}
              </p>

              <div className="divide-y divide-[#EFE9DC] mt-2">
                {generalStream.pillars.map((pillar) => (
                  <div key={pillar.title} className="py-4 first:pt-4 last:pb-0">
                    <div className="flex items-baseline justify-between gap-4 mb-1">
                      <h4 className="font-serif text-xl font-semibold text-[#06281E]">
                        <span className="text-[#8A6518] mr-2 tabular-nums">{pillar.index}</span>
                        {pillar.title}
                      </h4>
                      <span className="text-xs font-medium text-[#5A6D64] whitespace-nowrap shrink-0 tabular-nums">
                        {pillar.grades}
                      </span>
                    </div>
                    <p className="text-sm text-[#465B52] leading-relaxed">{pillar.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Wing 02: Islamic Education (Deep Emerald Surface with Royal Gold Hairlines) */}
          <div className="bg-[#06281E] text-[#FAF7F0] border border-[#C9A449]/35 rounded-xl p-7 sm:p-9 flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[#E5C158] mb-2">
                {islamicStream.eyebrow}
              </p>
              <h3 className="font-serif text-3xl font-semibold text-[#FAF7F0] mb-2">
                {islamicStream.title}
              </h3>
              <p className="text-sm font-medium text-[#D7CFC0] mb-4">
                {islamicStream.subtitle}
              </p>
              <p className="text-sm text-[#D7CFC0] leading-relaxed pb-6 border-b border-[#C9A449]/25">
                {islamicStream.description}
              </p>

              <div className="divide-y divide-[#C9A449]/20 mt-2">
                {islamicStream.pillars.map((pillar) => (
                  <div key={pillar.title} className="py-4 first:pt-4 last:pb-0">
                    <div className="flex items-baseline justify-between gap-4 mb-1">
                      <h4 className="font-serif text-xl font-semibold text-[#FAF7F0]">
                        <span className="text-[#E5C158] mr-2 tabular-nums">{pillar.index}</span>
                        {pillar.title}
                      </h4>
                      <span className="text-xs font-medium text-[#E5C158] whitespace-nowrap shrink-0 tabular-nums">
                        {pillar.grades}
                      </span>
                    </div>
                    <p className="text-sm text-[#D7CFC0] leading-relaxed">{pillar.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
