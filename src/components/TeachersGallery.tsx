import React, { useState } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import { FACULTY_MEMBERS, FacultyMember } from '../data/academyData';
import { AcademyEmblem, GeometricDivider } from './AcademyEmblem';

type DepartmentFilter = 'all' | 'islamic' | 'science' | 'humanities';

const DEPARTMENT_TABS: { id: DepartmentFilter; label: string }[] = [
  { id: 'all', label: 'All Departments' },
  { id: 'islamic', label: 'Islamic Studies & Quran' },
  { id: 'science', label: 'Sciences & Mathematics' },
  { id: 'humanities', label: 'Languages & Humanities' },
];

export const TeachersGallery: React.FC = () => {
  const [department, setDepartment] = useState<DepartmentFilter>('all');
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyMember | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const featuredChairs = FACULTY_MEMBERS.filter((m) => Boolean(m.image));
  const filteredRoster =
    department === 'all'
      ? FACULTY_MEMBERS
      : FACULTY_MEMBERS.filter((m) => m.department === department);

  return (
    <section id="faculty" className="py-16 sm:py-24 bg-[#F2ECE0] border-b border-[#E4DDD0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#8A6518] mb-2">
            Teachers Gallery &amp; Faculty
          </p>
          <h2
            className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#06281E] tracking-tight mb-4"
            style={{ textWrap: 'balance' }}
          >
            Scholars &amp; Educators Dedicated to Mentorship
          </h2>
          <GeometricDivider />
          <p className="text-sm sm:text-base text-[#465B52] leading-relaxed mt-4">
            Our faculty combines traditional Islamic scholarship with advanced academic degrees,
            ensuring exemplary classroom standards across Classes 1 through 12.
          </p>
        </div>

        {/* 3 Featured Department Chairs Portrait Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7 mb-14">
          {featuredChairs.map((member) => {
            const hasFailed = failedImages[member.id];
            return (
              <article
                key={member.id}
                className="bg-white border border-[#DED5C3] rounded-xl overflow-hidden flex flex-col justify-between transition-colors duration-150 hover:border-[#B8923E]"
              >
                <div>
                  <div className="aspect-square w-full overflow-hidden bg-[#EFE9DC]">
                    {member.image && !hasFailed ? (
                      <img
                        src={member.image}
                        alt={`${member.name} — ${member.role}`}
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setFailedImages((prev) => ({ ...prev, [member.id]: true }))
                        }
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-[#093B2C] text-[#FAF7F0] p-6">
                        <AcademyEmblem className="w-12 h-12 mb-3" variant="gold-on-emerald" />
                        <span className="font-serif text-lg">{member.name}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <p className="text-xs font-medium text-[#8A6518] mb-1.5">
                      {member.departmentLabel} · {member.classesTaught}
                    </p>
                    <h3 className="font-serif text-2xl font-semibold text-[#06281E]">
                      {member.name}
                    </h3>
                    <p className="text-sm font-medium text-[#2E473D] mt-0.5 mb-3">
                      {member.role}
                    </p>
                    <p className="text-xs text-[#5A6D64] leading-relaxed">
                      {member.qualification} · {member.experience}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-5 pt-3 border-t border-[#EFE9DC] flex items-center justify-between">
                  <span className="text-xs text-[#465B52] truncate pr-2">
                    {member.specialization}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedFaculty(member)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#093B2C] hover:text-[#8A6518] whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>Profile</span>
                    <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {/* Filterable Full Department Faculty Directory */}
        <div className="bg-white border border-[#DED5C3] rounded-xl p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[#EFE9DC]">
            <div>
              <h3 className="font-serif text-2xl font-semibold text-[#06281E]">
                Academy Faculty Directory
              </h3>
              <p className="text-xs sm:text-sm text-[#5A6D64] mt-0.5">
                Select a department to explore subject leads across Campus and Online divisions.
              </p>
            </div>

            <div
              role="tablist"
              aria-label="Filter faculty directory by department"
              className="inline-flex flex-wrap gap-1.5 p-1 bg-[#F2ECE0] rounded-lg border border-[#E4DDD0]"
            >
              {DEPARTMENT_TABS.map((tab) => {
                const isActive = department === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setDepartment(tab.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-[#093B2C] text-[#FAF7F0]'
                        : 'text-[#314A3F] hover:text-[#06281E]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="divide-y divide-[#EFE9DC]">
            {filteredRoster.map((member) => (
              <div
                key={member.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h4 className="font-serif text-xl font-semibold text-[#06281E]">
                      {member.name}
                    </h4>
                    <span className="text-xs font-medium text-[#8A6518]">
                      {member.role}
                    </span>
                  </div>
                  <p className="text-xs text-[#5A6D64] mt-1">
                    {member.qualification} · {member.classesTaught} · {member.experience}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedFaculty(member)}
                  className="self-start sm:self-center px-3.5 py-2 text-xs font-semibold text-[#093B2C] border border-[#DED5C3] hover:border-[#093B2C] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  View Biography
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Faculty Profile Modal */}
      {selectedFaculty && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#051F17]/70 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="faculty-modal-title"
          onClick={() => setSelectedFaculty(null)}
        >
          <div
            className="bg-[#FAF7F0] border border-[#C9A449]/40 rounded-xl max-w-lg w-full p-6 sm:p-8 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E4DDD0]">
              <div>
                <p className="text-xs font-medium text-[#8A6518]">
                  {selectedFaculty.departmentLabel} · {selectedFaculty.classesTaught}
                </p>
                <h3
                  id="faculty-modal-title"
                  className="font-serif text-2xl sm:text-3xl font-semibold text-[#06281E] mt-1"
                >
                  {selectedFaculty.name}
                </h3>
                <p className="text-sm font-medium text-[#314A3F] mt-0.5">
                  {selectedFaculty.role}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFaculty(null)}
                aria-label="Close faculty biography"
                className="w-10 h-10 inline-flex items-center justify-center rounded-lg text-[#465B52] hover:bg-[#EFE9DC] hover:text-[#06281E] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4 text-sm text-[#314A3F] leading-relaxed">
              <p>{selectedFaculty.bio}</p>

              <dl className="grid grid-cols-1 gap-3 pt-4 border-t border-[#E4DDD0] text-xs">
                <div>
                  <dt className="uppercase tracking-wider text-[#8A6518] font-semibold">
                    Academic Credentials
                  </dt>
                  <dd className="text-[#06281E] text-sm mt-0.5">
                    {selectedFaculty.qualification}
                  </dd>
                </div>
                <div>
                  <dt className="uppercase tracking-wider text-[#8A6518] font-semibold">
                    Focus Areas
                  </dt>
                  <dd className="text-[#06281E] text-sm mt-0.5">
                    {selectedFaculty.specialization}
                  </dd>
                </div>
                <div>
                  <dt className="uppercase tracking-wider text-[#8A6518] font-semibold">
                    Experience
                  </dt>
                  <dd className="text-[#06281E] text-sm mt-0.5 tabular-nums">
                    {selectedFaculty.experience}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
