import React, { useMemo, useState } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Download,
  Lock,
  Play,
  RotateCcw,
  Search,
  Unlock,
  XCircle,
} from 'lucide-react';
import { TeacherPhoto } from '../../components/TeacherPhoto';
import { downloadCourseCompletionCertificatePdf } from '../../lib/pdfGenerator';
import {
  InstitutionSettings,
  LmsCourse,
  LmsCourseProgress,
  LmsLesson,
  StudentRecord,
  TeacherRecord,
} from '../../types/platform';
import { StudentLmsSummary } from './studentTypes';

interface StudentCoursesSectionProps {
  settings: InstitutionSettings;
  myStudent?: StudentRecord;
  courses: LmsCourse[];
  lessons: LmsLesson[];
  teachers: TeacherRecord[];
  progressByCourse: Map<string, LmsCourseProgress>;
  lmsSummary: StudentLmsSummary;
  onLaunchCourse: (course: LmsCourse, lessonId?: string) => void;
}

export const StudentCoursesSection: React.FC<StudentCoursesSectionProps> = ({
  settings,
  myStudent,
  courses,
  lessons,
  teachers,
  progressByCourse,
  lmsSummary,
  onLaunchCourse,
}) => {
  const [search, setSearch] = useState('');
  const [trackFilter, setTrackFilter] = useState<'all' | 'islamic' | 'general'>('all');

  const filteredCourses = useMemo(() => {
    const q = search.trim().toLowerCase();
    return courses.filter((c) => {
      if (trackFilter !== 'all' && c.track !== trackFilter) return false;
      if (!q) return true;
      return (
        c.title.toLowerCase().includes(q) ||
        c.subjectName.toLowerCase().includes(q) ||
        c.classId.toLowerCase().includes(q) ||
        c.instructorName.toLowerCase().includes(q)
      );
    });
  }, [courses, search, trackFilter]);

  return (
    <div className="space-y-6">
      {/* Header + Search & Filter */}
      <section className="rounded-2xl bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8A6518] dark:text-[#D9AD43]">
              Sequential Video &amp; MCQ LMS
            </p>
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#06452C] dark:text-white">
              My Enrolled Courses
            </h1>
            <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5] mt-1">
              Watch each video lecture completely and pass its 5–10 MCQ checkpoint to unlock the
              next lesson automatically.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {(['all', 'islamic', 'general'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTrackFilter(t)}
                className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                  trackFilter === t
                    ? 'bg-[#06452C] text-[#F8F1DF]'
                    : 'bg-[#F8F1DF] dark:bg-[#081A14] text-[#06452C] dark:text-[#DED7C5] border border-[#D9AD43]/30'
                }`}
              >
                {t === 'all' ? 'All Tracks' : t === 'islamic' ? 'Islamic LMS' : 'General School'}
              </button>
            ))}
          </div>
        </div>

        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-[#8A6518] dark:text-[#D9AD43] absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses by title, class, subject, or teacher..."
            className="w-full min-h-[44px] ps-10 pe-4 py-2 rounded-xl border border-[#D9AD43]/40 bg-[#F8F1DF]/60 dark:bg-[#081A14] text-sm text-[#102D23] dark:text-white placeholder:text-[#6B7E75]"
          />
        </div>
      </section>

      {/* Course Catalog Cards with Sequential Lesson Chips */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredCourses.map((course) => {
          const courseLessons = lessons
            .filter((l) => l.courseId === course.id)
            .sort((a, b) => (a.order || 0) - (b.order || 0));
          const prog = progressByCourse.get(course.id);
          const doneCount = courseLessons.filter((l) =>
            Boolean(
              prog?.completedLessonIds?.includes(l.id) ||
                prog?.passedLessonIds?.includes(l.id) ||
                prog?.lessonProgress?.[l.id]?.passed
            )
          ).length;
          const pct =
            prog?.courseCompletionPercent ??
            (courseLessons.length > 0
              ? Math.round((doneCount / courseLessons.length) * 100)
              : 0);
          const matchedTeacher = teachers.find(
            (t) =>
              (course.teacherUid && t.uid === course.teacherUid) ||
              t.name.toLowerCase() === course.instructorName.toLowerCase()
          );
          const resumeLessonId = prog?.lastWatchedLessonId || courseLessons[0]?.id;

          return (
            <article
              key={course.id}
              className="rounded-2xl bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 p-5 space-y-4 shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#8A6518] dark:text-[#D9AD43]">
                      {course.classId} · {course.subjectName} ·{' '}
                      {course.track === 'islamic' ? 'Islamic Wing' : 'General Wing'}
                    </p>
                    <h2 className="font-serif text-xl font-semibold text-[#06452C] dark:text-white mt-0.5">
                      {course.title}
                    </h2>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 text-xs font-bold tabular-nums text-[#06452C] dark:text-[#D9AD43] shrink-0">
                    {pct}%
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-[#D9AD43]/35 bg-[#06452C] shrink-0">
                    <TeacherPhoto
                      photoUrl={matchedTeacher?.photoUrl}
                      name={course.instructorName}
                      emblemClassName="w-5 h-5"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#102D23] dark:text-white truncate">
                      {course.instructorName}
                    </p>
                    <p className="text-[11px] text-[#5A6D64] dark:text-[#DED7C5]">
                      {doneCount}/{courseLessons.length} Lessons Completed
                    </p>
                  </div>
                </div>

                <p className="text-xs text-[#314A3F] dark:text-[#E6DFCE] leading-relaxed">
                  {course.description}
                </p>

                {/* Sequential Lesson Lock/Unlock List */}
                <div className="space-y-2 pt-1">
                  {courseLessons.map((les, idx) => {
                    const lp = prog?.lessonProgress?.[les.id];
                    const passed = Boolean(
                      prog?.completedLessonIds?.includes(les.id) ||
                        prog?.passedLessonIds?.includes(les.id) ||
                        lp?.passed
                    );
                    const prev = idx > 0 ? courseLessons[idx - 1] : null;
                    const prevPassed = prev
                      ? Boolean(
                          prog?.completedLessonIds?.includes(prev.id) ||
                            prog?.passedLessonIds?.includes(prev.id) ||
                            prog?.lessonProgress?.[prev.id]?.passed
                        )
                      : true;
                    const unlocked =
                      idx === 0 ||
                      Boolean(prog?.unlockedLessonIds?.includes(les.id)) ||
                      Boolean(lp?.unlocked) ||
                      prevPassed;

                    return (
                      <button
                        key={les.id}
                        type="button"
                        onClick={() => onLaunchCourse(course, les.id)}
                        className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-[#F8F1DF]/70 dark:bg-[#081A14] border border-[#D9AD43]/25 hover:border-[#06452C] dark:hover:border-[#D9AD43] flex items-center justify-between gap-2 text-left cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {passed ? (
                            <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                          ) : unlocked ? (
                            <Unlock className="w-4 h-4 text-[#D9AD43] shrink-0" />
                          ) : (
                            <Lock className="w-4 h-4 text-[#7A8C84] shrink-0" />
                          )}
                          <span className="text-xs font-medium text-[#102D23] dark:text-white truncate">
                            {String(idx + 1).padStart(2, '0')}. {les.title}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded shrink-0 ${
                            passed
                              ? 'bg-[#DCFCE7] text-[#166534]'
                              : unlocked
                              ? 'bg-[#FEF3C7] text-[#92400E]'
                              : 'bg-[#E5E7EB] text-[#4B5563]'
                          }`}
                        >
                          {passed ? 'Passed' : unlocked ? 'Unlocked' : 'Locked'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <div className="h-1.5 w-full rounded-full bg-[#EFE6D2] dark:bg-[#081A14] overflow-hidden">
                  <div
                    className="h-full bg-[#D9AD43] transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onLaunchCourse(course, resumeLessonId)}
                  className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#06452C] hover:bg-[#102D23] text-[#F8F1DF] text-xs font-semibold cursor-pointer transition-colors"
                >
                  <Play className="w-4 h-4 fill-current text-[#D9AD43]" />
                  <span>Open Video Player &amp; Quiz</span>
                </button>
              </div>
            </article>
          );
        })}
      </section>

      {/* Earned Completion Certificates */}
      {lmsSummary.certificates.length > 0 && (
        <section className="rounded-2xl bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#D9AD43]" />
            <h2 className="font-serif text-xl font-semibold text-[#06452C] dark:text-white">
              Earned Course Completion Certificates
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lmsSummary.certificates.map((cert) => (
              <div
                key={cert.certificateNumber}
                className="p-4 rounded-xl bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/40 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#8A6518] dark:text-[#D9AD43]">
                    {cert.certificateNumber}
                  </p>
                  <p className="font-serif text-lg font-semibold text-[#06452C] dark:text-white truncate">
                    {cert.course.title}
                  </p>
                  <p className="text-[11px] text-[#5A6D64] dark:text-[#DED7C5]">
                    Issued: {cert.issuedAt.slice(0, 10)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    downloadCourseCompletionCertificatePdf({
                      studentName: myStudent?.name || 'Academy Student',
                      studentId: myStudent?.studentId || 'ASSIDDIQUE-STUDENT',
                      classId: cert.course.classId,
                      courseTitle: cert.course.title,
                      subjectName: cert.course.subjectName,
                      certificateNumber: cert.certificateNumber,
                      issuedAt: cert.issuedAt,
                      instructorName: cert.course.instructorName,
                      settings,
                    })
                  }
                  className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#06452C] text-[#F8F1DF] text-xs font-semibold cursor-pointer shrink-0"
                >
                  <Download className="w-4 h-4 text-[#D9AD43]" />
                  <span>PDF</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent MCQ Quiz Attempts History */}
      <section className="rounded-2xl bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#06452C] dark:text-[#D9AD43]" />
            <h2 className="font-serif text-xl font-semibold text-[#06452C] dark:text-white">
              MCQ Quiz Attempt History
            </h2>
          </div>
          <span className="text-xs font-semibold tabular-nums text-[#8A6518] dark:text-[#D9AD43]">
            {lmsSummary.quizHistory.length} Recorded Attempt
            {lmsSummary.quizHistory.length === 1 ? '' : 's'}
          </span>
        </div>

        {lmsSummary.quizHistory.length === 0 ? (
          <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5]">
            Complete a lesson video and submit its 5–10 question MCQ quiz to view your scorecards
            and retry history here.
          </p>
        ) : (
          <div className="space-y-2.5">
            {lmsSummary.quizHistory.slice(0, 12).map((row, idx) => {
              const matchedCourse = courses.find((c) => c.id === row.courseId);
              return (
                <div
                  key={`${row.lessonId}-${row.attempt.attemptNumber}-${idx}`}
                  className="p-3.5 rounded-xl bg-[#F8F1DF]/65 dark:bg-[#081A14] border border-[#D9AD43]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#06452C] dark:text-white truncate">
                      {row.lessonTitle}
                    </p>
                    <p className="text-[11px] text-[#5A6D64] dark:text-[#DED7C5] truncate">
                      {row.courseTitle} · Attempt #{row.attempt.attemptNumber} ·{' '}
                      {row.attempt.submittedAt.slice(0, 16).replace('T', ' ')}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-bold tabular-nums text-[#06452C] dark:text-[#D9AD43]">
                      {row.attempt.score}/{row.attempt.totalQuestions} ({row.attempt.percentage}%)
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                        row.attempt.passed
                          ? 'bg-[#DCFCE7] text-[#166534]'
                          : 'bg-[#FEE2E2] text-[#991B1B]'
                      }`}
                    >
                      {row.attempt.passed ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5" />
                      )}
                      {row.attempt.passed ? 'Passed' : 'Retry Needed'}
                    </span>
                    {!row.attempt.passed && matchedCourse && (
                      <button
                        type="button"
                        onClick={() => onLaunchCourse(matchedCourse, row.lessonId)}
                        className="min-h-[38px] inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#06452C] text-[#F8F1DF] text-[11px] font-semibold cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Retry</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
