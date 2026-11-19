import React, { useState } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import { NOTICES, NoticeItem } from '../data/academyData';
import { GeometricDivider } from './AcademyEmblem';

type NoticeFilter = 'all' | 'admissions' | 'examinations' | 'events';

const NOTICE_TABS: { id: NoticeFilter; label: string }[] = [
  { id: 'all', label: 'All Notices' },
  { id: 'admissions', label: 'Admissions' },
  { id: 'examinations', label: 'Examinations' },
  { id: 'events', label: 'Events & Holidays' },
];

export const NoticeBoardSection: React.FC = () => {
  const [filter, setFilter] = useState<NoticeFilter>('all');
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);

  const visibleNotices =
    filter === 'all' ? NOTICES : NOTICES.filter((notice) => notice.category === filter);

  return (
    <section id="notices" className="py-16 sm:py-24 bg-[#FAF7F0] border-b border-[#E4DDD0]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#8A6518] mb-2">
            Official Circulars &amp; Announcements
          </p>
          <h2
            className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#06281E] tracking-tight mb-4"
            style={{ textWrap: 'balance' }}
          >
            Academy Notice Board
          </h2>
          <GeometricDivider />
        </div>

        {/* Category Filter Bar */}
        <div className="flex justify-center mb-8">
          <div
            role="tablist"
            aria-label="Filter official notices"
            className="inline-flex flex-wrap justify-center gap-1.5 p-1 bg-[#EFE9DC] border border-[#DED5C3] rounded-xl"
          >
            {NOTICE_TABS.map((tab) => {
              const isActive = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setFilter(tab.id)}
                  className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
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

        {/* Notices Ledger */}
        <div className="bg-white border border-[#DED5C3] rounded-xl divide-y divide-[#EFE9DC]">
          {visibleNotices.map((notice) => (
            <article
              key={notice.id}
              className="p-5 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#FAF7F0]/60 transition-colors"
            >
              <div className="md:w-36 shrink-0">
                <p className="text-sm font-semibold text-[#06281E] tabular-nums">{notice.date}</p>
                <p className="text-xs text-[#8A6518] font-medium mt-0.5 tabular-nums">
                  {notice.refCode}
                </p>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[#5A6D64] mb-1">
                  {notice.categoryLabel} · {notice.issuedBy}
                </p>
                <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#06281E] leading-snug mb-1.5">
                  {notice.title}
                </h3>
                <p className="text-sm text-[#465B52] leading-relaxed">{notice.summary}</p>
              </div>

              <div className="shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedNotice(notice)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-[#093B2C] border border-[#DED5C3] hover:border-[#093B2C] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Read Circular</span>
                  <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Notice Circular Detail Modal */}
      {selectedNotice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#051F17]/70 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="notice-modal-title"
          onClick={() => setSelectedNotice(null)}
        >
          <div
            className="bg-[#FAF7F0] border border-[#C9A449]/40 rounded-xl max-w-xl w-full p-6 sm:p-8 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E4DDD0]">
              <div>
                <p className="text-xs font-medium text-[#8A6518] tabular-nums">
                  {selectedNotice.refCode} · {selectedNotice.date} · {selectedNotice.categoryLabel}
                </p>
                <h3
                  id="notice-modal-title"
                  className="font-serif text-2xl sm:text-3xl font-semibold text-[#06281E] mt-1 leading-snug"
                >
                  {selectedNotice.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNotice(null)}
                aria-label="Close notice circular"
                className="w-10 h-10 inline-flex items-center justify-center rounded-lg text-[#465B52] hover:bg-[#EFE9DC] hover:text-[#06281E] shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-3 text-sm sm:text-base text-[#314A3F] leading-relaxed">
              {selectedNotice.fullText.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-[#E4DDD0] text-xs text-[#5A6D64] space-y-1">
              <p>
                <span className="font-semibold text-[#06281E]">Venue / Mode:</span>{' '}
                {selectedNotice.venueOrMode}
              </p>
              <p>
                <span className="font-semibold text-[#06281E]">Issued By:</span>{' '}
                {selectedNotice.issuedBy}
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedNotice(null)}
                className="px-5 py-2.5 text-sm font-semibold text-[#FAF7F0] bg-[#093B2C] hover:bg-[#06281E] rounded-lg transition-colors cursor-pointer"
              >
                Close Circular
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
