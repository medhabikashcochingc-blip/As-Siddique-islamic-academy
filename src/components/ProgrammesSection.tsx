import React, { useState } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import {
  ACADEMIC_PROGRAMMES,
  AcademicProgramme,
  ProgrammeStageId,
} from '../data/academyData';
import { GeometricDivider } from './AcademyEmblem';

interface ProgrammesSectionProps {
  onSelectClassForAdmission: (classLabel: string) => void;
}

const STAGE_FILTERS: { id: 'all' | ProgrammeStageId; label: string }[] = [
  { id: 'all', label: 'All Classes (1–12)' },
  { id: 'primary', label: 'Primary (1–5)' },
  { id: 'middle', label: 'Middle (6–8)' },
  { id: 'secondary', label: 'Secondary (9–10)' },
  { id: 'higher-secondary', label: 'Higher Secondary (11–12)' },
];

export const ProgrammesSection: React.FC<ProgrammesSectionProps> = ({
  onSelectClassForAdmission,
}) => {
  const [activeStage, setActiveStage] = useState<'all' | ProgrammeStageId>('all');
  const [selectedProgramme, setSelectedProgramme] = useState<AcademicProgramme | null>(null);

  const filteredProgrammes =
    activeStage === 'all'
      ? ACADEMIC_PROGRAMMES
      : ACADEMIC_PROGRAMMES.filter((item) => item.stage === activeStage);

  return (
    <section id="programmes" className="py-16 sm:py-24 bg-[#FAF7F0] border-b border-[#E4DDD0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-12">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#8A6518] mb-2">
            Academic Progression · Class 1 to Class 12
          </p>
          <h2
            className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#06281E] tracking-tight mb-4"
            style={{ textWrap: 'balance' }}
          >
            Twelve Years of Structured Growth
          </h2>
          <GeometricDivider />
          <p className="text-sm sm:text-base text-[#465B52] leading-relaxed mt-4">
            Each academic stage integrates board-aligned General Education with age-calibrated
            Quranic, Arabic, and Moral Tarbiyah—guiding learners seamlessly from Class 1 literacy to
            Class 12 university readiness.
          </p>
        </div>

        {/* Interactive Stage Filter Tabs */}
        <div className="flex justify-center mb-10">
          <div
            role="tablist"
            aria-label="Filter academic programmes by stage"
            className="inline-flex flex-wrap justify-center gap-1.5 p-1.5 bg-[#EFE9DC] border border-[#DED5C3] rounded-xl"
          >
            {STAGE_FILTERS.map((filter) => {
              const isActive = activeStage === filter.id;
              return (
                <button
                  key={filter.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveStage(filter.id)}
                  className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#093B2C] ${
                    isActive
                      ? 'bg-[#093B2C] text-[#FAF7F0] shadow-xs'
                      : 'text-[#314A3F] hover:text-[#06281E] hover:bg-[#FAF7F0]/70'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Programmes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProgrammes.map((programme, idx) => (
            <article
              key={programme.id}
              className={`bg-white border border-[#E4DDD0] rounded-xl p-6 sm:p-7 flex flex-col justify-between transition-colors duration-150 hover:border-[#B8923E]/70 ${
                filteredProgrammes.length === 5 && idx === 0 ? 'lg:col-span-2' : ''
              }`}
            >
              <div>
                {/* Clean Unboxed Metadata */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#8A6518] mb-3">
                  <span>{programme.stageLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums font-semibold text-[#093B2C]">
                    {programme.classRange}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums text-[#5A6D64]">{programme.ageRange}</span>
                </div>

                <h3 className="font-serif text-2xl font-semibold text-[#06281E] leading-snug mb-3">
                  {programme.title}
                </h3>

                <p className="text-sm text-[#465B52] leading-relaxed mb-5">
                  {programme.summary}
                </p>

                {/* Two-column compact subject preview separated by hairline */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#EFE9DC] text-xs">
                  <div>
                    <p className="font-semibold text-[#06281E] uppercase tracking-wider mb-2">
                      General Studies
                    </p>
                    <ul className="space-y-1 text-[#465B52]">
                      {programme.generalSubjects.slice(0, 3).map((subj) => (
                        <li key={subj}>— {subj}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-[#8A6518] uppercase tracking-wider mb-2">
                      Islamic Studies
                    </p>
                    <ul className="space-y-1 text-[#465B52]">
                      {programme.islamicSubjects.slice(0, 3).map((subj) => (
                        <li key={subj}>— {subj}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#EFE9DC] flex items-center justify-between gap-4">
                <span className="text-xs font-medium text-[#5A6D64] tabular-nums">
                  {programme.weeklyPeriods}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedProgramme(programme)}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#093B2C] hover:text-[#8A6518] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#093B2C] rounded"
                >
                  <span>View Syllabus</span>
                  <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Syllabus Detail Modal */}
      {selectedProgramme && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#051F17]/70 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="syllabus-modal-title"
          onClick={() => setSelectedProgramme(null)}
        >
          <div
            className="bg-[#FAF7F0] border border-[#C9A449]/40 rounded-xl max-w-2xl w-full max-h-[88vh] overflow-y-auto p-6 sm:p-8 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E4DDD0]">
              <div>
                <p className="text-xs font-medium text-[#8A6518]">
                  {selectedProgramme.stageLabel} · {selectedProgramme.classRange} ·{' '}
                  {selectedProgramme.weeklyPeriods}
                </p>
                <h3
                  id="syllabus-modal-title"
                  className="font-serif text-2xl sm:text-3xl font-semibold text-[#06281E] mt-1"
                >
                  {selectedProgramme.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProgramme(null)}
                aria-label="Close syllabus details"
                className="w-10 h-10 inline-flex items-center justify-center rounded-lg text-[#465B52] hover:bg-[#EFE9DC] hover:text-[#06281E] transition-colors shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm sm:text-base text-[#314A3F] leading-relaxed mt-5">
              {selectedProgramme.summary}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
              <div className="bg-white border border-[#E4DDD0] rounded-lg p-5">
                <h4 className="font-serif text-lg font-semibold text-[#06281E] mb-3">
                  General Education Subjects
                </h4>
                <ul className="space-y-2 text-sm text-[#465B52]">
                  {selectedProgramme.generalSubjects.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-[#093B2C] text-[#FAF7F0] border border-[#C9A449]/30 rounded-lg p-5">
                <h4 className="font-serif text-lg font-semibold text-[#E5C158] mb-3">
                  Islamic Education Subjects
                </h4>
                <ul className="space-y-2 text-sm text-[#E6E0D3]">
                  {selectedProgramme.islamicSubjects.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-[#E4DDD0]">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8A6518] mb-2.5">
                Key Learning Outcomes
              </h4>
              <ul className="space-y-1.5 text-sm text-[#314A3F]">
                {selectedProgramme.outcomes.map((outcome) => (
                  <li key={outcome}>— {outcome}</li>
                ))}
              </ul>
            </div>

            <div className="mt-7 pt-5 border-t border-[#E4DDD0] flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedProgramme(null)}
                className="px-4 py-2.5 text-sm font-medium text-[#314A3F] hover:text-[#06281E] cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const classLabel = selectedProgramme.classRange.split('–')[0].trim();
                  setSelectedProgramme(null);
                  onSelectClassForAdmission(classLabel);
                }}
                className="px-5 py-2.5 text-sm font-semibold text-[#FAF7F0] bg-[#093B2C] hover:bg-[#06281E] rounded-lg transition-colors cursor-pointer"
              >
                Inquire for {selectedProgramme.classRange}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
