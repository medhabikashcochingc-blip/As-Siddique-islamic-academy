import React from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  FileText,
  GraduationCap,
  LogIn,
  Play,
  Radio,
  Sparkles,
  Trophy,
  Users,
  Video,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AcademyEmblem } from '../../components/AcademyEmblem';
import {
  InstitutionSettings,
  LmsCourse,
  StudentRecord,
  SubjectRecord,
  TeacherRecord,
} from '../../types/platform';
import {
  StudentLmsSummary,
  StudentResourceTab,
  StudentSectionKey,
} from './studentTypes';

interface StudentHomeSectionProps {
  settings: InstitutionSettings;
  isSignedIn: boolean;
  myStudent?: StudentRecord;
  courses: LmsCourse[];
  subjects: SubjectRecord[];
  teachers: TeacherRecord[];
  totalStudentsCount: number;
  lmsSummary: StudentLmsSummary;
  onNavigateSection: (section: StudentSectionKey, resourceTab?: StudentResourceTab) => void;
  onLaunchContinue: () => void;
}

export const StudentHomeSection: React.FC<StudentHomeSectionProps> = ({
  settings,
  isSignedIn,
  myStudent,
  courses,
  subjects,
  teachers,
  totalStudentsCount,
  lmsSummary,
  onNavigateSection,
  onLaunchContinue,
}) => {
  return (
    <div className="space-y-6">
      {/* 1. Hero Section — Islamic Emerald & Gold Theme inspired by Reference Screenshots */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#0A3B28] via-[#06452C] to-[#082E1F] text-[#F8F1DF] border border-[#D9AD43]/40 shadow-lg islamic-lattice px-5 py-9 sm:px-8 sm:py-12">
        <div className="max-w-3xl mx-auto text-center space-y-5 relative z-10">
          {/* Glowing Academy Emblem */}
          <div className="relative inline-flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#082E1F]/90 border-2 border-[#D9AD43]/55 shadow-[0_0_40px_rgba(217,173,67,0.18)] mx-auto">
            <AcademyEmblem className="w-14 h-14 sm:w-16 sm:h-16" variant="gold-on-emerald" />
          </div>

          {/* Kicker with Hairline Rules */}
          <div className="flex items-center justify-center gap-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#D9AD43]">
            <span className="h-px w-8 bg-[#D9AD43]/45" aria-hidden="true" />
            <span>{settings.name}</span>
            <span className="h-px w-8 bg-[#D9AD43]/45" aria-hidden="true" />
          </div>

          {/* Serif Two-Tone Headline */}
          <h1 className="font-serif text-3xl sm:text-5xl font-semibold leading-tight text-white">
            Learn, Practice,{' '}
            <span className="text-[#D9AD43] block sm:inline">Preach &amp; Lead.</span>
          </h1>

          <p className="text-sm sm:text-base text-[#E6DFCE] max-w-xl mx-auto leading-relaxed">
            Authentic Quran, Tajweed, Arabic, Hadith &amp; Fiqh combined seamlessly with West Bengal
            State Board academics (Class 1–12). Watch sequential lessons, pass MCQ checkpoints, and
            track your mastery anywhere.
          </p>

          {/* Primary Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2 max-w-md mx-auto">
            {isSignedIn ? (
              <button
                type="button"
                onClick={onLaunchContinue}
                className="min-h-[48px] flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#D9AD43] hover:bg-[#e5be5c] text-[#102D23] font-bold text-sm shadow-md cursor-pointer transition-colors"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>
                  {lmsSummary.overallPct > 0 ? 'Continue Learning' : 'Start Learning Now'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <Link
                to="/login?next=/student"
                className="min-h-[48px] flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#D9AD43] hover:bg-[#e5be5c] text-[#102D23] font-bold text-sm shadow-md transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In to Student Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            <button
              type="button"
              onClick={() => onNavigateSection('program')}
              className="min-h-[48px] flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[#D9AD43]/55 bg-[#082E1F]/50 hover:bg-[#102D23] text-[#F8F1DF] font-semibold text-sm cursor-pointer transition-colors"
            >
              <GraduationCap className="w-4 h-4 text-[#D9AD43]" />
              <span>Year-Wise Program</span>
            </button>
          </div>

          {isSignedIn && myStudent && (
            <p className="text-xs text-[#D9AD43]/95 font-medium pt-1">
              Signed in as <strong>{myStudent.name}</strong> · Admission No:{' '}
              <span className="tabular-nums font-bold">{myStudent.admissionNumber}</span> ·{' '}
              {myStudent.classId}
            </p>
          )}
        </div>
      </section>

      {/* 2. Quick Access Learning Hub Strip (Live, Notes & PDFs, Results, Contact) */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: 'Educational Videos',
            sub: 'Playbook Archive & Live',
            icon: Radio,
            onClick: () => onNavigateSection('resources', 'live'),
          },
          {
            label: 'Notes & PDFs',
            sub: 'Guides & Syllabus Sheets',
            icon: FileText,
            onClick: () => onNavigateSection('resources', 'notes'),
          },
          {
            label: 'Exam Results',
            sub: 'Marksheets & Quizzes',
            icon: Trophy,
            onClick: () => onNavigateSection('resources', 'results'),
          },
          {
            label: 'Faculty & Support',
            sub: `${teachers.length} Verified Teachers`,
            icon: Users,
            onClick: () => onNavigateSection('teachers'),
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              onClick={item.onClick}
              className="min-h-[76px] p-4 rounded-xl bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 hover:border-[#06452C] dark:hover:border-[#D9AD43] text-left transition-colors cursor-pointer flex items-start gap-3 shadow-xs"
            >
              <div className="w-10 h-10 rounded-xl bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-[#06452C] dark:text-[#D9AD43]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-[#06452C] dark:text-white truncate">
                  {item.label}
                </p>
                <p className="text-[11px] text-[#5A6D64] dark:text-[#DED7C5] mt-0.5 truncate">
                  {item.sub}
                </p>
              </div>
            </button>
          );
        })}
      </section>

      {/* 3. Course Introduction Card (Warm Ivory Surface + Gold Top Edge inspired by Screenshot #3) */}
      <section className="rounded-2xl bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 overflow-hidden shadow-sm">
        <div className="h-1.5 bg-gradient-to-r from-[#D9AD43] via-[#E5C158] to-[#06452C]" />
        <div className="p-6 sm:p-8 space-y-6">
          <div className="max-w-3xl space-y-2">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#8A6518] dark:text-[#D9AD43]">
              <span className="h-px w-5 bg-[#D9AD43]" aria-hidden="true" />
              <span>Integrated Academy Program</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#06452C] dark:text-white">
              One Admission, Complete Academic &amp; Islamic Growth
            </h2>
            <p className="text-sm text-[#314A3F] dark:text-[#E6DFCE] leading-relaxed">
              From Class 1 Noorani Qaida &amp; foundational literacy up to Class 12 Higher Secondary,
              every lesson pairs structured video lectures with 5–10 verification MCQs, PDF study
              sheets, and scholar mentorship.
            </p>
          </div>

          {/* 2x2 Feature Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-xl bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 space-y-2">
              <div className="w-10 h-10 rounded-lg bg-white dark:bg-[#102D23] border border-[#D9AD43]/30 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-[#06452C] dark:text-[#D9AD43]" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-[#06452C] dark:text-white">
                {subjects.length} Core Subjects
              </h3>
              <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5]">
                Quran, Arabic, Hadith, Fiqh &amp; WB State Board curriculum
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 space-y-2">
              <div className="w-10 h-10 rounded-lg bg-white dark:bg-[#102D23] border border-[#D9AD43]/30 flex items-center justify-center">
                <Video className="w-5 h-5 text-[#06452C] dark:text-[#D9AD43]" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-[#06452C] dark:text-white">
                Live + Recorded
              </h3>
              <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5]">
                {courses.length} sequential courses with chapter quizzes &amp; replay
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 space-y-2">
              <div className="w-10 h-10 rounded-lg bg-white dark:bg-[#102D23] border border-[#D9AD43]/30 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-[#06452C] dark:text-[#D9AD43]" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-[#06452C] dark:text-white">
                Qualified Scholars
              </h3>
              <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5]">
                Guided by {teachers.length} verified Islamic &amp; board educators
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 space-y-2">
              <div className="w-10 h-10 rounded-lg bg-white dark:bg-[#102D23] border border-[#D9AD43]/30 flex items-center justify-center">
                <Award className="w-5 h-5 text-[#06452C] dark:text-[#D9AD43]" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-[#06452C] dark:text-white">
                Sanad &amp; Certificates
              </h3>
              <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5]">
                Verified PDF completion certificates on course mastery
              </p>
            </div>
          </div>

          {/* Cohort & Quick Launch Row */}
          <div className="p-4 sm:p-5 rounded-xl bg-[#F8F1DF]/75 dark:bg-[#081A14] border border-[#D9AD43]/35 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-serif text-2xl sm:text-3xl font-bold tabular-nums text-[#06452C] dark:text-white">
                {totalStudentsCount} Active Student Record{totalStudentsCount === 1 ? '' : 's'}
              </p>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#8A6518] dark:text-[#D9AD43] mt-0.5">
                {settings.statsStudentsLabel} · {settings.boardName}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onNavigateSection('courses')}
                className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#06452C] text-[#F8F1DF] text-xs font-semibold hover:bg-[#102D23] cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#D9AD43]" />
                <span>Explore Video Courses</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateSection('contact')}
                className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#06452C] dark:border-[#D9AD43] text-[#06452C] dark:text-[#D9AD43] text-xs font-semibold cursor-pointer"
              >
                <span>Contact Office</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
