import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  GraduationCap,
  Play,
  Sparkles,
  UserCheck,
  Video,
} from 'lucide-react';
import { TeacherPhoto } from '../../components/TeacherPhoto';
import {
  AcademicClass,
  AttendanceRecord,
  InstitutionSettings,
  LmsCourse,
  LmsCourseProgress,
  LmsLesson,
  StudentRecord,
  SubjectRecord,
  TeacherRecord,
} from '../../types/platform';
import { StudentLmsSummary } from './studentTypes';

interface StudentDashboardProgramProps {
  mode: 'dashboard' | 'program';
  settings: InstitutionSettings;
  isSignedIn: boolean;
  myStudent?: StudentRecord;
  classes: AcademicClass[];
  subjects: SubjectRecord[];
  courses: LmsCourse[];
  lessons: LmsLesson[];
  teachers: TeacherRecord[];
  attendance: AttendanceRecord[];
  progressByCourse: Map<string, LmsCourseProgress>;
  lmsSummary: StudentLmsSummary;
  onLaunchCourse: (course: LmsCourse, lessonId?: string) => void;
  onLaunchContinue: () => void;
  onOpenResources: () => void;
}

type WingFilter =
  | 'my-class'
  | 'Primary'
  | 'Upper Primary'
  | 'Secondary'
  | 'Higher Secondary'
  | 'All Years';

export const StudentDashboardProgram: React.FC<StudentDashboardProgramProps> = ({
  mode,
  settings,
  isSignedIn,
  myStudent,
  classes,
  subjects,
  courses,
  lessons,
  teachers,
  attendance,
  progressByCourse,
  lmsSummary,
  onLaunchCourse,
  onLaunchContinue,
  onOpenResources,
}) => {
  const myClassId = myStudent?.classId || 'Class 10';
  const [wingFilter, setWingFilter] = useState<WingFilter>('All Years');
  const [trackFilter, setTrackFilter] = useState<'all' | 'islamic' | 'general'>('all');

  const myClassSubjects = useMemo(
    () => subjects.filter((s) => s.classId === myClassId),
    [subjects, myClassId]
  );

  const attendanceStats = useMemo(() => {
    const mine = attendance.filter(
      (a) =>
        (myStudent?.id && a.targetId === myStudent.id) ||
        (myStudent?.studentId && a.targetId === myStudent.studentId) ||
        (myStudent?.name && a.targetName === myStudent.name)
    );
    const total = mine.length;
    const present = mine.filter((a) => a.status === 'Present' || a.status === 'Late').length;
    const pct = total > 0 ? Math.round((present / total) * 100) : 100;
    return { total, present, pct };
  }, [attendance, myStudent]);

  const classById = useMemo(() => {
    const map = new Map<string, AcademicClass>();
    classes.forEach((c) => {
      map.set(c.name, c);
      map.set(c.id, c);
    });
    return map;
  }, [classes]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      if (trackFilter !== 'all' && course.track !== trackFilter) return false;
      if (wingFilter === 'All Years') return true;
      if (wingFilter === 'my-class') {
        return course.classId === myClassId || course.classId === 'All Classes';
      }
      if (course.classId === 'All Classes') return true;
      const cls = classById.get(course.classId);
      return cls?.wing === wingFilter;
    });
  }, [courses, wingFilter, trackFilter, myClassId, classById]);

  const filteredSubjects = useMemo(() => {
    return subjects.filter((subj) => {
      if (trackFilter !== 'all' && subj.track !== trackFilter) return false;
      if (wingFilter === 'All Years') return true;
      if (wingFilter === 'my-class') return subj.classId === myClassId;
      const cls = classById.get(subj.classId);
      return cls?.wing === wingFilter;
    });
  }, [subjects, wingFilter, trackFilter, myClassId, classById]);

  // SVG circular progress ring geometry
  const ringRadius = 38;
  const ringCirc = 2 * Math.PI * ringRadius;
  const ringOffset = ringCirc - (lmsSummary.overallPct / 100) * ringCirc;

  const passedMcqCount = useMemo(
    () => lmsSummary.quizHistory.filter((q) => q.attempt.passed).length,
    [lmsSummary.quizHistory]
  );

  return (
    <div className="space-y-6">
      {/* 1. Enrolled Program Deep Emerald Banner with Circular Progress Ring (Screenshot #4) */}
      <section className="rounded-2xl bg-gradient-to-br from-[#06452C] via-[#0A3B28] to-[#082E1F] text-[#F8F1DF] border border-[#D9AD43]/40 p-5 sm:p-7 shadow-md islamic-lattice">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#D9AD43]">
              {isSignedIn ? 'Enrolled Student Workspace' : 'Student Portal Preview'} ·{' '}
              {settings.boardName}
            </p>
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-white">
              {myStudent ? `Assalamu Alaikum, ${myStudent.name}` : 'Integrated Islamic & Academic Program'}
            </h1>
            <p className="text-xs sm:text-sm text-[#E6DFCE]">
              {myStudent
                ? `Class: ${myStudent.classId} (${myStudent.sectionId || 'A'}) · Roll No: ${myStudent.rollNumber} · Student ID: ${myStudent.studentId}`
                : 'Sign in with your Academy student account to sync attendance, admission number, and course progress.'}
            </p>
          </div>

          {/* Circular Radial Progress Ring */}
          <div className="flex items-center gap-4 self-start md:self-center bg-[#082E1F]/80 border border-[#D9AD43]/40 rounded-2xl px-4 py-3 shrink-0">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96" aria-hidden="true">
                <circle
                  cx="48"
                  cy="48"
                  r={ringRadius}
                  fill="none"
                  stroke="rgba(217, 173, 67, 0.22)"
                  strokeWidth="7"
                />
                <circle
                  cx="48"
                  cy="48"
                  r={ringRadius}
                  fill="none"
                  stroke="#D9AD43"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={ringCirc}
                  strokeDashoffset={ringOffset}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-lg font-bold tabular-nums text-white leading-none">
                  {lmsSummary.overallPct}%
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#D9AD43] mt-0.5">
                  Done
                </span>
              </div>
            </div>
            <div className="text-xs space-y-1">
              <p className="font-semibold text-white">Overall Mastery</p>
              <p className="text-[#DED7C5] tabular-nums">
                {lmsSummary.completedLessonsCount}/{lmsSummary.totalLessons} Lessons
              </p>
              <p className="text-[#D9AD43] tabular-nums">
                {lmsSummary.certificates.length} Certificate
                {lmsSummary.certificates.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 4 Stat Cards (Screenshot #4 style KPI grid) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#8A6518] dark:text-[#D9AD43]">
            Admission No.
          </p>
          <p className="font-serif text-lg sm:text-xl font-bold text-[#06452C] dark:text-white mt-1 tabular-nums truncate">
            {myStudent?.admissionNumber || 'Pending Link'}
          </p>
          <p className="text-[11px] text-[#5A6D64] dark:text-[#DED7C5] mt-0.5 truncate">
            ID: {myStudent?.studentId || 'Sign in to view'}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#8A6518] dark:text-[#D9AD43]">
            Track &amp; Mode
          </p>
          <p className="font-serif text-lg sm:text-xl font-bold text-[#06452C] dark:text-white mt-1 truncate">
            {myStudent?.learningMode || 'Hybrid Learning'}
          </p>
          <p className="text-[11px] text-[#5A6D64] dark:text-[#DED7C5] mt-0.5 truncate">
            Class: {myClassId}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#8A6518] dark:text-[#D9AD43]">
            Core Curriculum
          </p>
          <p className="font-serif text-lg sm:text-xl font-bold text-[#06452C] dark:text-white mt-1 tabular-nums">
            {courses.length} Courses
          </p>
          <p className="text-[11px] text-[#5A6D64] dark:text-[#DED7C5] mt-0.5 tabular-nums">
            {myClassSubjects.length || subjects.length} Assigned Subjects
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#8A6518] dark:text-[#D9AD43]">
            Completed
          </p>
          <p className="font-serif text-lg sm:text-xl font-bold text-[#06452C] dark:text-white mt-1 tabular-nums">
            {lmsSummary.completedLessonsCount}/{lmsSummary.totalLessons}
          </p>
          <p className="text-[11px] text-[#5A6D64] dark:text-[#DED7C5] mt-0.5">
            Sequential Video + MCQ
          </p>
        </div>
      </section>

      {/* 3. Study Milestone & Continue Card */}
      <section className="rounded-2xl bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#8A6518] dark:text-[#D9AD43]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Study Milestone &amp; Next Checkpoint</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[#06452C] dark:text-white">
              {lmsSummary.continueCandidate
                ? `${lmsSummary.continueCandidate.course.title} — ${lmsSummary.continueCandidate.lessonTitle}`
                : 'Ready to Begin Lesson 01'}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenResources}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-[#D9AD43]/50 text-xs font-semibold text-[#06452C] dark:text-[#D9AD43] hover:bg-[#F8F1DF] dark:hover:bg-[#081A14] cursor-pointer"
            >
              Notes, Results &amp; Live
            </button>
            <button
              type="button"
              onClick={onLaunchContinue}
              className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#06452C] hover:bg-[#102D23] text-[#F8F1DF] font-semibold text-sm shadow-sm cursor-pointer transition-colors"
            >
              <Play className="w-4 h-4 fill-current text-[#D9AD43]" />
              <span>Continue Studying</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-[#5A6D64] dark:text-[#DED7C5]">
            <span>Course Sequence Progress</span>
            <span className="tabular-nums font-bold text-[#06452C] dark:text-[#D9AD43]">
              {lmsSummary.overallPct}%
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-[#EFE6D2] dark:bg-[#081A14] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#06452C] to-[#D9AD43] transition-all duration-300"
              style={{ width: `${lmsSummary.overallPct}%` }}
            />
          </div>
        </div>

        {/* 3 Metric Cells */}
        <div className="grid grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-[#F8F1DF]/80 dark:bg-[#081A14] border border-[#D9AD43]/25">
            <p className="text-[11px] font-medium text-[#5A6D64] dark:text-[#DED7C5]">
              Videos Watched
            </p>
            <p className="text-base sm:text-lg font-bold tabular-nums text-[#06452C] dark:text-white mt-0.5">
              {lmsSummary.watchedLessonsCount}/{lmsSummary.totalLessons}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#F8F1DF]/80 dark:bg-[#081A14] border border-[#D9AD43]/25">
            <p className="text-[11px] font-medium text-[#5A6D64] dark:text-[#DED7C5]">
              MCQs Passed
            </p>
            <p className="text-base sm:text-lg font-bold tabular-nums text-[#06452C] dark:text-white mt-0.5">
              {passedMcqCount}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#F8F1DF]/80 dark:bg-[#081A14] border border-[#D9AD43]/25">
            <p className="text-[11px] font-medium text-[#5A6D64] dark:text-[#DED7C5]">
              Attendance
            </p>
            <p className="text-base sm:text-lg font-bold tabular-nums text-[#06452C] dark:text-white mt-0.5">
              {attendanceStats.pct}%
            </p>
          </div>
        </div>
      </section>

      {/* 4. Year-Wise Program & Subject Catalog (Screenshot #5 style) */}
      <section className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8A6518] dark:text-[#D9AD43]">
              {mode === 'program' ? 'Complete Academy Syllabus (Class 1–12)' : 'Year-Wise Subjects & Courses'}
            </p>
            <h2 className="font-serif text-2xl font-semibold text-[#06452C] dark:text-white">
              Year-Wise Subjects &amp; Sequential Video Modules
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(['all', 'islamic', 'general'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTrackFilter(t)}
                className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  trackFilter === t
                    ? 'bg-[#06452C] text-[#F8F1DF]'
                    : 'bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 text-[#314A3F] dark:text-[#E6DFCE]'
                }`}
              >
                {t === 'all' ? 'All Tracks' : t === 'islamic' ? 'Islamic Wing' : 'General Wing'}
              </button>
            ))}
          </div>
        </div>

        {/* Year Wing Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {(
            [
              { key: 'All Years', label: 'All Classes (1–12)' },
              { key: 'my-class', label: `My Class (${myClassId})` },
              { key: 'Primary', label: 'Primary (1–5)' },
              { key: 'Upper Primary', label: 'Upper Primary (6–8)' },
              { key: 'Secondary', label: 'Secondary (9–10)' },
              { key: 'Higher Secondary', label: 'Higher Sec (11–12)' },
            ] as Array<{ key: WingFilter; label: string }>
          ).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setWingFilter(item.key)}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                wingFilter === item.key
                  ? 'bg-[#D9AD43] text-[#102D23] font-bold shadow-xs'
                  : 'bg-white dark:bg-[#102D23] border border-[#D9AD43]/30 text-[#314A3F] dark:text-[#DED7C5] hover:border-[#06452C]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Course Cards Grid inspired by Screenshot #5 */}
        {filteredCourses.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-[#102D23] border border-[#D9AD43]/30 text-center space-y-2">
            <p className="text-sm font-semibold text-[#06452C] dark:text-white">
              No video courses match this exact year filter yet.
            </p>
            <button
              type="button"
              onClick={() => {
                setWingFilter('All Years');
                setTrackFilter('all');
              }}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-[#06452C] text-[#F8F1DF] text-xs font-semibold cursor-pointer"
            >
              Show All Years &amp; Courses
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCourses.map((course, idx) => {
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
              const notesCount = courseLessons.filter((l) => Boolean(l.notes || l.pdfUrl)).length;
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
              const targetLessonId = prog?.lastWatchedLessonId || courseLessons[0]?.id;

              return (
                <article
                  key={course.id}
                  className="rounded-2xl bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 overflow-hidden shadow-xs flex flex-col justify-between"
                >
                  <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-[#06452C] text-[#D9AD43] font-bold text-sm flex items-center justify-center shrink-0 tabular-nums">
                          {idx + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-[#8A6518] dark:text-[#D9AD43] truncate">
                            {course.classId} ·{' '}
                            {course.track === 'islamic' ? 'Islamic Wing' : 'General Wing'}
                          </p>
                          <h3 className="font-serif text-lg sm:text-xl font-semibold text-[#06452C] dark:text-white leading-snug">
                            {course.title}
                          </h3>
                        </div>
                      </div>
                      <span className="text-xs font-bold tabular-nums px-2.5 py-1 rounded-lg bg-[#F8F1DF] dark:bg-[#081A14] text-[#06452C] dark:text-[#D9AD43] border border-[#D9AD43]/30 shrink-0">
                        {pct}%
                      </span>
                    </div>

                    {/* Instructor Photo Row */}
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full overflow-hidden border border-[#D9AD43]/40 shrink-0 bg-[#06452C]">
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
                        <p className="text-[11px] text-[#5A6D64] dark:text-[#DED7C5] truncate">
                          {matchedTeacher?.designation || course.subjectName}
                        </p>
                      </div>
                    </div>

                    {/* Counts + Description */}
                    <p className="text-xs text-[#314A3F] dark:text-[#E6DFCE] line-clamp-2">
                      {course.description}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-[#5A6D64] dark:text-[#DED7C5]">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1 tabular-nums font-medium">
                          <Video className="w-3.5 h-3.5 text-[#06452C] dark:text-[#D9AD43]" />
                          {doneCount}/{courseLessons.length} Videos
                        </span>
                        <span className="inline-flex items-center gap-1 tabular-nums font-medium">
                          <FileText className="w-3.5 h-3.5 text-[#8A6518] dark:text-[#D9AD43]" />
                          {notesCount} Notes/PDFs
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onLaunchCourse(course, targetLessonId)}
                        className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#06452C] hover:bg-[#102D23] text-[#F8F1DF] text-xs font-semibold cursor-pointer transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-current text-[#D9AD43]" />
                        <span>{pct > 0 ? 'Continue' : 'Start'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Thin bottom progress bar */}
                  <div className="h-1.5 w-full bg-[#EFE6D2] dark:bg-[#081A14]">
                    <div
                      className="h-full bg-[#D9AD43] transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* School Academic Subjects Register for Selected Year/Wing */}
        <div className="rounded-2xl bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#06452C] dark:text-[#D9AD43]" />
              <h3 className="font-serif text-lg sm:text-xl font-semibold text-[#06452C] dark:text-white">
                Assigned School Subjects ({filteredSubjects.length})
              </h3>
            </div>
            <span className="text-xs font-semibold text-[#8A6518] dark:text-[#D9AD43]">
              Pass &amp; Full Marks Syllabus
            </span>
          </div>

          {filteredSubjects.length === 0 ? (
            <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5]">
              No standalone subject records for this filter; check the All Classes view above.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredSubjects.slice(0, 18).map((subj) => {
                const subjTeacher = teachers.find((t) => t.id === subj.teacherId);
                return (
                  <div
                    key={subj.id}
                    className="p-3.5 rounded-xl bg-[#F8F1DF]/65 dark:bg-[#081A14] border border-[#D9AD43]/25 flex items-start justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#06452C] dark:text-white truncate">
                        {subj.name}
                      </p>
                      <p className="text-[11px] text-[#5A6D64] dark:text-[#DED7C5] mt-0.5 truncate">
                        {subj.classId} · {subj.code} ·{' '}
                        {subj.track === 'islamic' ? 'Islamic' : 'General'}
                      </p>
                      {subjTeacher && (
                        <p className="text-[11px] text-[#8A6518] dark:text-[#D9AD43] mt-1 inline-flex items-center gap-1 truncate">
                          <UserCheck className="w-3 h-3 shrink-0" />
                          <span>{subjTeacher.name}</span>
                        </p>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold tabular-nums text-[#06452C] dark:text-[#D9AD43] shrink-0">
                      {subj.fullMarks}M
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {myStudent && (
            <div className="p-4 rounded-xl bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-xs text-[#102D23] dark:text-[#E6DFCE]">
                <CheckCircle2 className="w-4 h-4 text-[#06452C] dark:text-[#D9AD43] shrink-0" />
                <span>
                  <strong>Quran &amp; Tarbiyah Tracker:</strong>{' '}
                  {myStudent.islamicProgress.quranSurah} · {myStudent.islamicProgress.nazirahLevel}{' '}
                  · Tajweed {myStudent.islamicProgress.tajweedGrade} ·{' '}
                  {myStudent.islamicProgress.hifzJuzCompleted} Juz
                </span>
              </div>
              <span className="text-[11px] font-semibold text-[#8A6518] dark:text-[#D9AD43]">
                {myStudent.islamicProgress.dailyDuaMastered} Duas Mastered
              </span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
