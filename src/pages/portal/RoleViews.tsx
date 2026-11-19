import React, { useMemo, useState } from 'react';
import {
  Award,
  Bookmark,
  BookOpen,
  Building2,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Download,
  ExternalLink,
  GraduationCap,
  HelpCircle,
  Send,
  Settings,
  ShieldCheck,
  UserCheck,
  Users,
  Video,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePlatform } from '../../context/PlatformContext';
import { DEMO_QUIZZES } from '../../lib/defaultData';
import {
  downloadFeeReceiptPdf,
  downloadMarksheetPdf,
  downloadStudentIdCardPdf,
  downloadTimetablePdf,
} from '../../lib/pdfGenerator';
import { ROLE_DEFINITIONS } from '../../lib/permissions';

type StudentTab =
  | 'overview'
  | 'routine'
  | 'homework'
  | 'lms'
  | 'results'
  | 'fees'
  | 'library'
  | 'islamic';

export const StudentPortalView: React.FC = () => {
  const { userAccount } = useAuth();
  const {
    students,
    subjects,
    attendance,
    timetables,
    homework,
    assignments,
    submissions,
    results,
    courses,
    lessons,
    liveClasses,
    library,
    invoices,
    payments,
    notices,
    settings,
    integrations,
    upsertRecord,
  } = usePlatform();

  const [tab, setTab] = useState<StudentTab>('overview');
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('academy_lesson_bookmarks');
      return saved ? (JSON.parse(saved) as string[]) : [];
    } catch {
      return [];
    }
  });
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('academy_completed_lessons');
      return saved ? (JSON.parse(saved) as Record<string, boolean>) : {};
    } catch {
      return {};
    }
  });
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('academy_quiz_answers');
      return saved ? (JSON.parse(saved) as Record<string, number>) : {};
    } catch {
      return {};
    }
  });
  const [statusMsg, setStatusMsg] = useState('');

  const toggleLessonComplete = (lessonId: string) => {
    setCompletedLessons((prev) => {
      const next = { ...prev, [lessonId]: !prev[lessonId] };
      localStorage.setItem('academy_completed_lessons', JSON.stringify(next));
      return next;
    });
  };

  const selectQuizOption = (quizId: string, idx: number) => {
    setQuizAnswers((prev) => {
      const next = { ...prev, [quizId]: idx };
      localStorage.setItem('academy_quiz_answers', JSON.stringify(next));
      return next;
    });
  };

  // Resolve linked student record (or preview first demo student for Super Admin preview)
  const myStudent = useMemo(() => {
    if (userAccount?.linkedStudentId) {
      const found = students.find(
        (s) => s.id === userAccount.linkedStudentId || s.studentId === userAccount.linkedStudentId
      );
      if (found) return found;
    }
    const byUid = students.find((s) => s.studentUid === userAccount?.uid);
    return byUid || students[0];
  }, [students, userAccount]);

  const myClassId = myStudent?.classId || 'Class 10';
  const mySubjects = subjects.filter((sub) => sub.classId === myClassId);
  const myAttendance = attendance.filter(
    (a) => a.targetId === myStudent?.id || a.targetName === myStudent?.name
  );
  const myRoutine = timetables.filter((t) => t.classId === myClassId);
  const myHomework = homework.filter((h) => h.classId === myClassId);
  const myAssignments = assignments.filter((a) => a.classId === myClassId);
  const myResults = results.filter(
    (r) =>
      r.isPublished &&
      (r.rollNumber === myStudent?.rollNumber || r.admissionNumber === myStudent?.admissionNumber)
  );
  const myCourses = courses.filter((c) => c.classId === myClassId);
  const myLiveClasses = liveClasses.filter((l) => l.classId === myClassId);
  const myLibrary = library.filter(
    (lb) => lb.classId === myClassId || lb.classId === 'All Classes'
  );
  const myInvoices = invoices.filter((inv) => inv.studentId === myStudent?.id);
  const myPayments = payments.filter((p) => p.studentId === myStudent?.id);

  const toggleBookmark = (lessonId: string) => {
    const next = bookmarks.includes(lessonId)
      ? bookmarks.filter((b) => b !== lessonId)
      : [...bookmarks, lessonId];
    setBookmarks(next);
    localStorage.setItem('academy_lesson_bookmarks', JSON.stringify(next));
  };

  const handleAssignmentSubmit = async (e: React.FormEvent, assignmentId: string) => {
    e.preventDefault();
    if (!submissionText.trim() || !userAccount || !myStudent) return;
    await upsertRecord(
      'submissions',
      `sub_${assignmentId}_${userAccount.uid}`,
      {
        assignmentId,
        studentId: myStudent.id,
        studentUid: userAccount.uid,
        studentName: myStudent.name,
        submissionText: submissionText.trim(),
        status: 'submitted',
      },
      `Submitted assignment ${assignmentId}`
    );
    setSubmittingId(null);
    setSubmissionText('');
    setStatusMsg('Assignment submitted successfully.');
  };

  const presentCount = myAttendance.filter((a) => a.status === 'Present').length;
  const attPct = myAttendance.length ? Math.round((presentCount / myAttendance.length) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Top Student Identity Banner */}
      <div className="bg-[#06452C] text-[#F8F1DF] rounded-xl border border-[#D9AD43]/40 p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#D9AD43] mb-1">
            Student Learning Portal {myStudent?.isDemo ? '· [Demo Profile Preview]' : ''}
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-white">
            {myStudent?.name || userAccount?.displayName}
          </h2>
          <p className="text-xs sm:text-sm text-[#E6DFCE] mt-1">
            ID: <strong>{myStudent?.studentId || 'Pending Link'}</strong> · {myClassId} · Roll{' '}
            <strong>{myStudent?.rollNumber || '—'}</strong> · Mode:{' '}
            <strong>{myStudent?.learningMode || 'Hybrid Learning'}</strong>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {myStudent && (
            <button
              type="button"
              onClick={() => downloadStudentIdCardPdf(myStudent, settings)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D9AD43] text-[#102D23] text-xs font-semibold hover:bg-[#E7C266] cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download ID Card PDF
            </button>
          )}
          <button
            type="button"
            onClick={() => downloadTimetablePdf(myClassId, myRoutine, settings)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#D9AD43]/50 text-[#F8F1DF] text-xs font-semibold hover:bg-[#102D23] cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Routine PDF
          </button>
        </div>
      </div>

      {/* Mobile-First Sub-Navigation Pills */}
      <div className="flex flex-wrap gap-2">
        {(
          [
            { key: 'overview', label: 'Overview' },
            { key: 'routine', label: 'Class Routine & Attendance' },
            { key: 'homework', label: 'Homework & Assignments' },
            { key: 'lms', label: 'LMS & Live Classes' },
            { key: 'islamic', label: 'Islamic Education Progress' },
            { key: 'results', label: 'Exams & Marksheet' },
            { key: 'library', label: 'Digital Library' },
            { key: 'fees', label: 'My Fees & Receipts' },
          ] as { key: StudentTab; label: string }[]
        ).map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              tab === item.key
                ? 'bg-[#06452C] text-[#F8F1DF] border border-[#D9AD43]/60'
                : 'bg-white dark:bg-[#102D23] text-[#102D23] dark:text-[#E6DFCE] border border-[#D9AD43]/25 hover:border-[#D9AD43]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {statusMsg && (
        <div className="rounded-lg bg-[#06452C]/10 border border-[#06452C]/30 px-4 py-2.5 text-xs font-medium text-[#06452C] dark:text-[#D9AD43]">
          {statusMsg}
        </div>
      )}

      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/30 rounded-xl p-5">
              <div className="flex items-center justify-between text-[#5A6D64] dark:text-[#D9AD43] text-xs font-semibold mb-2">
                <span>ATTENDANCE</span>
                <CalendarCheck className="w-4 h-4" />
              </div>
              <p className="font-serif text-3xl font-semibold text-[#06452C] dark:text-white">
                {attPct}%
              </p>
              <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5] mt-1">
                {presentCount} of {myAttendance.length || 1} recorded sessions
              </p>
            </div>

            <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/30 rounded-xl p-5">
              <div className="flex items-center justify-between text-[#5A6D64] dark:text-[#D9AD43] text-xs font-semibold mb-2">
                <span>SUBJECTS ENROLLED</span>
                <BookOpen className="w-4 h-4" />
              </div>
              <p className="font-serif text-3xl font-semibold text-[#06452C] dark:text-white">
                {mySubjects.length}
              </p>
              <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5] mt-1">
                General + Islamic Tracks
              </p>
            </div>

            <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/30 rounded-xl p-5">
              <div className="flex items-center justify-between text-[#5A6D64] dark:text-[#D9AD43] text-xs font-semibold mb-2">
                <span>HOMEWORK & TASKS</span>
                <ClipboardList className="w-4 h-4" />
              </div>
              <p className="font-serif text-3xl font-semibold text-[#06452C] dark:text-white">
                {myHomework.length + myAssignments.length}
              </p>
              <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5] mt-1">
                Active items for {myClassId}
              </p>
            </div>

            <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/30 rounded-xl p-5">
              <div className="flex items-center justify-between text-[#5A6D64] dark:text-[#D9AD43] text-xs font-semibold mb-2">
                <span>QURAN & HIFZ</span>
                <Award className="w-4 h-4" />
              </div>
              <p className="font-serif text-2xl font-semibold text-[#06452C] dark:text-white">
                {myStudent?.islamicProgress.quranSurah || 'Surah Al-Mulk'}
              </p>
              <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5] mt-1">
                Tajweed: {myStudent?.islamicProgress.tajweedGrade || 'A'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/30 rounded-xl p-6">
              <h3 className="font-serif text-xl font-semibold text-[#06452C] dark:text-white mb-4">
                Enrolled Subjects ({myClassId})
              </h3>
              <div className="space-y-2">
                {mySubjects.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-[#F8F1DF]/70 dark:bg-[#081A14]"
                  >
                    <div>
                      <p className="text-sm font-semibold">{sub.name}</p>
                      <p className="text-[11px] text-[#5A6D64] dark:text-[#DED7C5]">
                        Code: {sub.code} · Full Marks: {sub.fullMarks}
                      </p>
                    </div>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        sub.track === 'islamic'
                          ? 'bg-[#D9AD43]/25 text-[#8A6518] dark:text-[#D9AD43]'
                          : 'bg-[#06452C]/15 text-[#06452C] dark:text-[#A9D5BE]'
                      }`}
                    >
                      {sub.track === 'islamic' ? 'Islamic Wing' : 'General Wing'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/30 rounded-xl p-6">
              <h3 className="font-serif text-xl font-semibold text-[#06452C] dark:text-white mb-4">
                Latest Academy Notices
              </h3>
              <div className="space-y-3">
                {notices.slice(0, 4).map((n) => (
                  <div key={n.id} className="border-b border-[#D9AD43]/20 pb-3 last:border-0">
                    <div className="flex items-center justify-between text-xs text-[#8A6518] dark:text-[#D9AD43]">
                      <span className="font-semibold">{n.category}</span>
                      <span>{n.date}</span>
                    </div>
                    <p className="text-sm font-semibold mt-0.5">{n.title}</p>
                    <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5] mt-1">{n.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'routine' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-xl font-semibold">Class Timetable ({myClassId})</h3>
              <button
                type="button"
                onClick={() => downloadTimetablePdf(myClassId, myRoutine, settings)}
                className="text-xs font-semibold text-[#06452C] dark:text-[#D9AD43] hover:underline cursor-pointer"
              >
                Download PDF
              </button>
            </div>
            <div className="space-y-2.5">
              {myRoutine.map((slot) => (
                <div
                  key={slot.id}
                  className="p-3 rounded-lg border border-[#D9AD43]/25 bg-[#F8F1DF]/60 dark:bg-[#081A14] flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-[#8A6518] dark:text-[#D9AD43]">
                      {slot.day} · {slot.startTime} – {slot.endTime}
                    </p>
                    <p className="text-sm font-semibold">{slot.subjectName}</p>
                    <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5]">
                      {slot.teacherName} · {slot.roomOrMode}
                    </p>
                  </div>
                </div>
              ))}
              {myRoutine.length === 0 && (
                <p className="text-sm text-[#5A6D64]">No timetable slots configured for {myClassId} yet.</p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/30 rounded-xl p-6">
            <h3 className="font-serif text-xl font-semibold mb-4">Attendance Log</h3>
            <div className="space-y-2">
              {myAttendance.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg border border-[#D9AD43]/20"
                >
                  <span className="text-xs font-medium">{att.date}</span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded ${
                      att.status === 'Present'
                        ? 'bg-[#06452C]/15 text-[#06452C] dark:text-[#A9D5BE]'
                        : 'bg-[#D9AD43]/25 text-[#8A6518] dark:text-[#D9AD43]'
                    }`}
                  >
                    {att.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'homework' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/30 rounded-xl p-6">
            <h3 className="font-serif text-xl font-semibold mb-4">Daily Homework</h3>
            <div className="space-y-3">
              {myHomework.map((hw) => (
                <div
                  key={hw.id}
                  className="p-4 rounded-lg border border-[#D9AD43]/25 bg-[#F8F1DF]/50 dark:bg-[#081A14]"
                >
                  <div className="flex items-center justify-between text-xs text-[#8A6518] dark:text-[#D9AD43]">
                    <span className="font-semibold">{hw.subjectName}</span>
                    <span>Due: {hw.dueDate}</span>
                  </div>
                  <p className="text-sm font-semibold mt-1">{hw.title}</p>
                  <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5] mt-1">{hw.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/30 rounded-xl p-6">
            <h3 className="font-serif text-xl font-semibold mb-4">Assignments & Online Submission</h3>
            <div className="space-y-4">
              {myAssignments.map((asg) => {
                const existing = submissions.find((s) => s.assignmentId === asg.id);
                return (
                  <div
                    key={asg.id}
                    className="p-4 rounded-lg border border-[#D9AD43]/25 bg-[#F8F1DF]/50 dark:bg-[#081A14]"
                  >
                    <div className="flex items-center justify-between text-xs text-[#8A6518] dark:text-[#D9AD43]">
                      <span className="font-semibold">
                        {asg.subjectName} · Max {asg.maxMarks} Marks
                      </span>
                      <span>Due: {asg.dueDate}</span>
                    </div>
                    <p className="text-sm font-semibold mt-1">{asg.title}</p>
                    <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5] mt-1 mb-3">
                      {asg.instructions}
                    </p>

                    {existing ? (
                      <div className="text-xs font-semibold text-[#06452C] dark:text-[#A9D5BE] flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        Status: {existing.status}
                        {existing.marks !== undefined ? ` · Marks: ${existing.marks}` : ''}
                      </div>
                    ) : submittingId === asg.id ? (
                      <form onSubmit={(e) => handleAssignmentSubmit(e, asg.id)} className="space-y-2">
                        <textarea
                          required
                          rows={3}
                          value={submissionText}
                          onChange={(e) => setSubmissionText(e.target.value)}
                          placeholder="Write your assignment response or summary link..."
                          className="w-full rounded-lg border border-[#D9AD43]/40 bg-white dark:bg-[#102D23] px-3 py-2 text-xs"
                        />
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#06452C] text-white text-xs font-semibold cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" /> Submit
                          </button>
                          <button
                            type="button"
                            onClick={() => setSubmittingId(null)}
                            className="px-3 py-1.5 rounded-lg border border-[#D9AD43]/40 text-xs cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSubmittingId(asg.id)}
                        className="px-3 py-1.5 rounded-lg bg-[#06452C] text-[#F8F1DF] text-xs font-semibold hover:bg-[#102D23] cursor-pointer"
                      >
                        Submit Assignment
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === 'lms' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/30 rounded-xl p-6">
            <h3 className="font-serif text-xl font-semibold mb-4">Scheduled Live Classes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myLiveClasses.map((lv) => (
                <div
                  key={lv.id}
                  className="p-4 rounded-lg border border-[#D9AD43]/30 bg-[#F8F1DF]/60 dark:bg-[#081A14] flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-[#8A6518] dark:text-[#D9AD43]">
                        {lv.subjectName}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#06452C] text-[#F8F1DF] text-[10px]">
                        {lv.status}
                      </span>
                    </div>
                    <p className="text-sm font-semibold">{lv.title}</p>
                    <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5]">
                      {lv.teacherName} · {lv.startTime}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {lv.meetingLink ? (
                      <a
                        href={lv.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#06452C] text-white text-xs font-semibold"
                      >
                        <Video className="w-3.5 h-3.5" /> Join Live Session <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-[#8A6518] dark:text-[#D9AD43]">
                        {integrations?.videoConferencing.configured
                          ? 'Meeting link pending from teacher.'
                          : 'Video conferencing link not configured yet.'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/30 rounded-xl p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-serif text-xl font-semibold">LMS Courses, Lessons &amp; Progress</h3>
                <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5]">
                  Complete recorded lessons and Islamic/General mastery quizzes.
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-[#06452C] text-[#F8F1DF] tabular-nums">
                Quizzes Passed: {DEMO_QUIZZES.filter((q) => quizAnswers[q.id] === q.correctIndex).length}/
                {DEMO_QUIZZES.length}
              </span>
            </div>

            <div className="space-y-4">
              {(myCourses.length > 0 ? myCourses : courses).map((course) => {
                const courseLessons = lessons.filter((l) => l.courseId === course.id);
                const doneCount = courseLessons.filter((l) => completedLessons[l.id]).length;
                const pct = courseLessons.length
                  ? Math.round((doneCount / courseLessons.length) * 100)
                  : 0;
                return (
                  <div
                    key={course.id}
                    className="p-4 rounded-xl border border-[#D9AD43]/25 bg-[#F8F1DF]/50 dark:bg-[#081A14]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold text-[#8A6518] dark:text-[#D9AD43]">
                          {course.subjectName} · {course.classId} · {course.instructorName}
                        </p>
                        <h4 className="font-serif text-lg font-semibold mt-0.5">{course.title}</h4>
                      </div>
                      <span className="text-xs font-semibold tabular-nums text-[#06452C] dark:text-[#D9AD43]">
                        {pct}% Complete
                      </span>
                    </div>
                    <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5] mb-3">{course.description}</p>
                    <div className="space-y-2">
                      {courseLessons.map((les) => (
                        <div
                          key={les.id}
                          className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-white dark:bg-[#102D23] border border-[#D9AD43]/20"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold">
                              {les.chapterTitle}: {les.title}
                            </p>
                            <p className="text-[11px] text-[#5A6D64] dark:text-[#DED7C5]">{les.notes}</p>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            <button
                              type="button"
                              onClick={() => toggleBookmark(les.id)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                                bookmarks.includes(les.id)
                                  ? 'bg-[#D9AD43] text-[#102D23]'
                                  : 'border border-[#D9AD43]/40'
                              }`}
                            >
                              <Bookmark className="w-3 h-3" />
                              {bookmarks.includes(les.id) ? 'Bookmarked' : 'Bookmark'}
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleLessonComplete(les.id)}
                              className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                                completedLessons[les.id]
                                  ? 'bg-[#06452C] text-white'
                                  : 'border border-[#06452C] dark:border-[#D9AD43]'
                              }`}
                            >
                              {completedLessons[les.id] ? 'Completed' : 'Mark Done'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-[#D9AD43]/25 space-y-3">
              <h4 className="font-serif text-lg font-semibold text-[#06452C] dark:text-[#D9AD43]">
                Quick Mastery Quizzes (Islamic &amp; General)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {DEMO_QUIZZES.map((q) => {
                  const chosen = quizAnswers[q.id];
                  const answered = chosen !== undefined;
                  return (
                    <div
                      key={q.id}
                      className="p-3.5 rounded-lg bg-[#F8F1DF]/60 dark:bg-[#081A14] border border-[#D9AD43]/25 space-y-2"
                    >
                      <p className="text-xs font-semibold flex items-start gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-[#D9AD43] shrink-0 mt-0.5" />
                        <span>{q.question}</span>
                      </p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {q.options.map((opt, idx) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => selectQuizOption(q.id, idx)}
                            className={`text-left px-2.5 py-1.5 rounded text-[11px] border cursor-pointer ${
                              answered && idx === q.correctIndex
                                ? 'bg-[#06452C] text-white border-[#06452C]'
                                : chosen === idx
                                ? 'bg-[#FDF2F2] text-[#7F1D1D] border-[#E5B4B4]'
                                : 'bg-white dark:bg-[#102D23] border-[#D9AD43]/30'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                      {answered && (
                        <p className="text-[11px] text-[#5A6D64] dark:text-[#DED7C5]">{q.explanation}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'islamic' && myStudent && (
        <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-6">
          <h3 className="font-serif text-2xl font-semibold text-[#06452C] dark:text-[#D9AD43] mb-4">
            Islamic Education & Combined Tarbiyah Report
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-[#F8F1DF] dark:bg-[#081A14]">
              <p className="text-xs text-[#5A6D64] dark:text-[#D9AD43]">Current Quran Surah</p>
              <p className="font-serif text-xl font-semibold mt-1">{myStudent.islamicProgress.quranSurah}</p>
            </div>
            <div className="p-4 rounded-lg bg-[#F8F1DF] dark:bg-[#081A14]">
              <p className="text-xs text-[#5A6D64] dark:text-[#D9AD43]">Nazirah Level</p>
              <p className="font-serif text-xl font-semibold mt-1">{myStudent.islamicProgress.nazirahLevel}</p>
            </div>
            <div className="p-4 rounded-lg bg-[#F8F1DF] dark:bg-[#081A14]">
              <p className="text-xs text-[#5A6D64] dark:text-[#D9AD43]">Tajweed Grade</p>
              <p className="font-serif text-xl font-semibold mt-1">{myStudent.islamicProgress.tajweedGrade}</p>
            </div>
            <div className="p-4 rounded-lg bg-[#F8F1DF] dark:bg-[#081A14]">
              <p className="text-xs text-[#5A6D64] dark:text-[#D9AD43]">Hifz Juz Completed</p>
              <p className="font-serif text-xl font-semibold mt-1">
                {myStudent.islamicProgress.hifzJuzCompleted} Juz
              </p>
            </div>
            <div className="p-4 rounded-lg bg-[#F8F1DF] dark:bg-[#081A14]">
              <p className="text-xs text-[#5A6D64] dark:text-[#D9AD43]">Daily Duas Mastered</p>
              <p className="font-serif text-xl font-semibold mt-1">
                {myStudent.islamicProgress.dailyDuaMastered}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-[#F8F1DF] dark:bg-[#081A14]">
              <p className="text-xs text-[#5A6D64] dark:text-[#D9AD43]">Akhlaq & Adab Remarks</p>
              <p className="text-sm font-medium mt-1">{myStudent.islamicProgress.adabRemarks}</p>
            </div>
          </div>
        </div>
      )}

      {tab === 'results' && (
        <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/30 rounded-xl p-6 space-y-4">
          <h3 className="font-serif text-xl font-semibold">Published Examination Results</h3>
          {myResults.map((res) => (
            <div
              key={res.id}
              className="p-5 rounded-xl border-2 border-[#D9AD43]/50 bg-[#0B1F3A] text-[#F8F1DF] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <p className="text-xs text-[#D9AD43] font-semibold uppercase">{res.examTitle}</p>
                <p className="font-serif text-xl font-semibold mt-1">
                  {res.totalMarks}/{res.fullMarks} ({res.percentage.toFixed(1)}%) · Grade {res.grade}
                </p>
                <p className="text-xs text-[#E6DFCE] mt-1">{res.remarks}</p>
              </div>
              <button
                type="button"
                onClick={() => downloadMarksheetPdf(res, settings)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D9AD43] text-[#0B1F3A] text-xs font-bold cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download Official Marksheet PDF
              </button>
            </div>
          ))}
          {myResults.length === 0 && (
            <p className="text-sm text-[#5A6D64]">No published results linked to your student record yet.</p>
          )}
        </div>
      )}

      {tab === 'library' && (
        <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/30 rounded-xl p-6">
          <h3 className="font-serif text-xl font-semibold mb-4">Digital Library Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myLibrary.map((res) => (
              <div
                key={res.id}
                className="p-4 rounded-lg border border-[#D9AD43]/25 bg-[#F8F1DF]/60 dark:bg-[#081A14] flex items-center justify-between gap-3"
              >
                <div>
                  <span className="text-[11px] font-semibold text-[#8A6518] dark:text-[#D9AD43]">
                    {res.category}
                  </span>
                  <p className="text-sm font-semibold">{res.title}</p>
                  <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5]">
                    {res.author} · {res.subjectName}
                  </p>
                </div>
                {res.fileUrl && res.allowDownload ? (
                  <a
                    href={res.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#06452C] text-white text-xs font-semibold"
                  >
                    <Download className="w-3.5 h-3.5" /> Open
                  </a>
                ) : (
                  <span className="text-[11px] text-[#5A6D64]">
                    {res.allowDownload ? 'Upload Pending' : 'Read-Only'}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'fees' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/30 rounded-xl p-6">
            <h3 className="font-serif text-xl font-semibold mb-4">Fee Invoices</h3>
            <div className="space-y-3">
              {myInvoices.map((inv) => {
                const due = Math.max(0, inv.amount - inv.discountAmount - inv.paidAmount);
                return (
                  <div
                    key={inv.id}
                    className="p-4 rounded-lg border border-[#D9AD43]/25 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-semibold text-[#8A6518] dark:text-[#D9AD43]">
                        {inv.invoiceNumber} · Due {inv.dueDate}
                      </p>
                      <p className="text-sm font-semibold">{inv.title}</p>
                      <p className="text-xs text-[#5A6D64]">
                        Total: INR {inv.amount} · Paid: INR {inv.paidAmount} · Balance: INR {due}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded text-xs font-semibold bg-[#06452C]/15 text-[#06452C] dark:text-[#D9AD43]">
                      {inv.status}
                    </span>
                  </div>
                );
              })}
            </div>
            {!integrations?.paymentGateway.configured && (
              <p className="mt-4 text-xs text-[#8A6518] dark:text-[#D9AD43] bg-[#D9AD43]/15 p-3 rounded-lg">
                Online Payment Gateway ({integrations?.paymentGateway.provider || 'Razorpay'}) is not
                configured on the server yet. Please pay at the Academy Accounts Office or configure{' '}
                <code>RAZORPAY_KEY_ID</code> and <code>RAZORPAY_KEY_SECRET</code>.
              </p>
            )}
          </div>

          <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/30 rounded-xl p-6">
            <h3 className="font-serif text-xl font-semibold mb-4">Payment Receipts</h3>
            <div className="space-y-3">
              {myPayments.map((pay) => (
                <div
                  key={pay.id}
                  className="p-4 rounded-lg border border-[#D9AD43]/25 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-semibold text-[#8A6518] dark:text-[#D9AD43]">
                      {pay.receiptNumber} · {pay.paidAt}
                    </p>
                    <p className="text-sm font-semibold">
                      INR {pay.amount} ({pay.method})
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => downloadFeeReceiptPdf(pay, settings)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#06452C] text-white text-xs font-semibold cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Receipt PDF
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const ParentPortalView: React.FC = () => {
  const { userAccount } = useAuth();
  const {
    students,
    attendance,
    results,
    homework,
    timetables,
    invoices,
    payments,
    notices,
    settings,
  } = usePlatform();

  const linkedChildren = useMemo(() => {
    const ids = userAccount?.linkedStudentIds || [];
    const matched = students.filter(
      (s) =>
        ids.includes(s.id) ||
        ids.includes(s.studentId) ||
        s.parentUid === userAccount?.uid ||
        s.id === userAccount?.linkedStudentId
    );
    return matched.length > 0 ? matched : students.slice(0, 1);
  }, [students, userAccount]);

  const [selectedId, setSelectedId] = useState<string>(linkedChildren[0]?.id || '');
  const activeChild = linkedChildren.find((c) => c.id === selectedId) || linkedChildren[0];

  const childAtt = attendance.filter(
    (a) => a.targetId === activeChild?.id || a.targetName === activeChild?.name
  );
  const childResults = results.filter(
    (r) =>
      r.isPublished &&
      (r.rollNumber === activeChild?.rollNumber || r.admissionNumber === activeChild?.admissionNumber)
  );
  const childHomework = homework.filter((h) => h.classId === activeChild?.classId);
  const childRoutine = timetables.filter((t) => t.classId === activeChild?.classId);
  const childInvoices = invoices.filter((inv) => inv.studentId === activeChild?.id);
  const childPayments = payments.filter((p) => p.studentId === activeChild?.id);

  return (
    <div className="space-y-6">
      <div className="bg-[#06452C] text-[#F8F1DF] rounded-xl border border-[#D9AD43]/40 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#D9AD43]">
            Parent & Guardian Portal
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-white">
            Welcome, {userAccount?.displayName}
          </h2>
          <p className="text-xs text-[#E6DFCE] mt-1">
            Monitor attendance, combined General & Islamic progress, fees, and examination results.
          </p>
        </div>

        {linkedChildren.length > 0 && (
          <div className="flex items-center gap-2">
            <label htmlFor="child-selector" className="text-xs text-[#D9AD43] font-semibold">
              Child:
            </label>
            <select
              id="child-selector"
              value={activeChild?.id || ''}
              onChange={(e) => setSelectedId(e.target.value)}
              className="rounded-lg bg-[#102D23] border border-[#D9AD43]/50 text-white px-3 py-2 text-xs"
            >
              {linkedChildren.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.classId})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {activeChild && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/30 rounded-xl p-6 space-y-3">
            <h3 className="font-serif text-xl font-semibold text-[#06452C] dark:text-[#D9AD43]">
              Combined Progress Summary
            </h3>
            <p className="text-xs">
              <strong>Student:</strong> {activeChild.name} ({activeChild.classId} · Roll{' '}
              {activeChild.rollNumber})
            </p>
            <p className="text-xs">
              <strong>Quran Surah:</strong> {activeChild.islamicProgress.quranSurah}
            </p>
            <p className="text-xs">
              <strong>Tajweed Grade:</strong> {activeChild.islamicProgress.tajweedGrade} ·{' '}
              <strong>Nazirah:</strong> {activeChild.islamicProgress.nazirahLevel}
            </p>
            <p className="text-xs">
              <strong>Adab Remarks:</strong> {activeChild.islamicProgress.adabRemarks}
            </p>
            <div className="pt-2 border-t border-[#D9AD43]/20">
              <p className="text-xs font-semibold mb-1.5">Recent Attendance ({childAtt.length})</p>
              {childAtt.map((a) => (
                <div key={a.id} className="flex justify-between text-xs py-1">
                  <span>{a.date}</span>
                  <span className="font-semibold text-[#06452C] dark:text-[#D9AD43]">{a.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/30 rounded-xl p-6 space-y-3">
            <h3 className="font-serif text-xl font-semibold text-[#06452C] dark:text-[#D9AD43]">
              Exam Results & Homework
            </h3>
            {childResults.map((res) => (
              <div key={res.id} className="p-3 rounded-lg bg-[#0B1F3A] text-white space-y-2">
                <p className="text-xs text-[#D9AD43] font-semibold">{res.examTitle}</p>
                <p className="text-sm font-bold">
                  {res.percentage.toFixed(1)}% · Grade {res.grade} ({res.resultStatus})
                </p>
                <button
                  type="button"
                  onClick={() => downloadMarksheetPdf(res, settings)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#D9AD43] text-[#0B1F3A] text-xs font-semibold cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Marksheet PDF
                </button>
              </div>
            ))}
            <div className="pt-2">
              <p className="text-xs font-semibold mb-2">Homework & Class Routine</p>
              {childHomework.map((hw) => (
                <div key={hw.id} className="text-xs py-1 border-b border-[#D9AD43]/15">
                  <strong>{hw.subjectName}:</strong> {hw.title} (Due {hw.dueDate})
                </div>
              ))}
              {childRoutine.length > 0 && (
                <button
                  type="button"
                  onClick={() => downloadTimetablePdf(activeChild.classId, childRoutine, settings)}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#06452C] dark:text-[#D9AD43] hover:underline cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download Routine PDF
                </button>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/30 rounded-xl p-6 space-y-3">
            <h3 className="font-serif text-xl font-semibold text-[#06452C] dark:text-[#D9AD43]">
              Fees, Receipts & Notices
            </h3>
            {childInvoices.map((inv) => (
              <div key={inv.id} className="p-3 rounded-lg border border-[#D9AD43]/25 text-xs">
                <p className="font-semibold">
                  {inv.title} ({inv.status})
                </p>
                <p className="text-[#5A6D64] dark:text-[#DED7C5]">
                  Amount: INR {inv.amount} · Paid: INR {inv.paidAmount}
                </p>
              </div>
            ))}
            {childPayments.map((pay) => (
              <button
                key={pay.id}
                type="button"
                onClick={() => downloadFeeReceiptPdf(pay, settings)}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-[#F8F1DF] dark:bg-[#081A14] text-xs font-semibold cursor-pointer"
              >
                <span>
                  Receipt {pay.receiptNumber} (INR {pay.amount})
                </span>
                <Download className="w-3.5 h-3.5" />
              </button>
            ))}
            <div className="pt-2 border-t border-[#D9AD43]/20">
              <p className="text-xs font-semibold mb-1.5">School Notices</p>
              {notices.slice(0, 2).map((n) => (
                <p key={n.id} className="text-xs text-[#5A6D64] dark:text-[#DED7C5] mb-1">
                  · {n.title} ({n.date})
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const TeacherPortalView: React.FC<{ onNavigateModule: (moduleKey: string) => void }> = ({
  onNavigateModule,
}) => {
  const { userAccount } = useAuth();
  const { teachers, students, liveClasses, homework, submissions, timetables, examinations } = usePlatform();

  const myTeacher =
    teachers.find((t) => t.uid === userAccount?.uid || t.id === userAccount?.linkedTeacherId) ||
    teachers[0];

  const shortcuts = [
    { key: 'attendance', label: 'Attendance Entry', desc: 'Mark daily class & section attendance', icon: CalendarCheck },
    { key: 'homework', label: 'Daily Homework', desc: 'Publish homework tasks with due dates', icon: ClipboardList },
    { key: 'assignments', label: 'Assignments & Grading', desc: 'Evaluate online student submissions', icon: UserCheck },
    { key: 'marks', label: 'Marks Entry', desc: 'Record General & Islamic subject marks', icon: GraduationCap },
    { key: 'live-classes', label: 'Live Classes', desc: 'Schedule & manage online sessions', icon: Video },
    { key: 'lms', label: 'LMS Upload & Notes', desc: 'Add chapters, video links & PDF notes', icon: BookOpen },
    { key: 'islamic', label: 'Islamic Education', desc: 'Update Quran, Tajweed & Adab tracking', icon: Award },
    { key: 'students', label: 'Class Student Lists', desc: 'View enrolled student profiles', icon: CreditCard },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-[#06452C] text-[#F8F1DF] rounded-xl border border-[#D9AD43]/40 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#D9AD43]">
          Faculty & Teacher Portal {myTeacher?.isDemo ? '· [Demo Faculty Preview]' : ''}
        </p>
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-white mt-1">
          {myTeacher?.name || userAccount?.displayName}
        </h2>
        <p className="text-xs sm:text-sm text-[#E6DFCE] mt-1">
          {myTeacher?.designation || 'Faculty'} · {myTeacher?.qualification || 'Academic Staff'} ·
          Assigned Classes: {(myTeacher?.assignedClasses || []).join(', ') || 'All Assigned'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/30 rounded-xl p-5">
          <p className="text-xs font-semibold text-[#5A6D64] dark:text-[#D9AD43]">ACTIVE STUDENTS</p>
          <p className="font-serif text-3xl font-semibold mt-1 tabular-nums">{students.length}</p>
        </div>
        <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/30 rounded-xl p-5">
          <p className="text-xs font-semibold text-[#5A6D64] dark:text-[#D9AD43]">LIVE CLASSES</p>
          <p className="font-serif text-3xl font-semibold mt-1 tabular-nums">{liveClasses.length}</p>
        </div>
        <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/30 rounded-xl p-5">
          <p className="text-xs font-semibold text-[#5A6D64] dark:text-[#D9AD43]">HOMEWORK & SUBMISSIONS</p>
          <p className="font-serif text-3xl font-semibold mt-1 tabular-nums">
            {homework.length} / {submissions.length}
          </p>
        </div>
        <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/30 rounded-xl p-5">
          <p className="text-xs font-semibold text-[#5A6D64] dark:text-[#D9AD43]">EXAMINATIONS</p>
          <p className="font-serif text-3xl font-semibold mt-1 tabular-nums">{examinations.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {shortcuts.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onNavigateModule(item.key)}
              className="text-left p-5 rounded-xl bg-white dark:bg-[#102D23] border border-[#D9AD43]/30 hover:border-[#06452C] dark:hover:border-[#D9AD43] transition-colors cursor-pointer"
            >
              <Icon className="w-5 h-5 text-[#06452C] dark:text-[#D9AD43] mb-3" />
              <p className="font-serif text-lg font-semibold">{item.label}</p>
              <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5] mt-1">{item.desc}</p>
            </button>
          );
        })}
      </div>

      {timetables.length > 0 && (
        <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/30 rounded-xl p-5">
          <h3 className="font-serif text-xl font-semibold mb-3">Scheduled Teaching Timetable</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {timetables.slice(0, 6).map((slot) => (
              <div
                key={slot.id}
                className="p-3 rounded-lg bg-[#F8F1DF]/70 dark:bg-[#081A14] border border-[#D9AD43]/25 text-xs"
              >
                <p className="font-semibold text-[#8A6518] dark:text-[#D9AD43] tabular-nums">
                  {slot.day} · {slot.startTime}–{slot.endTime}
                </p>
                <p className="font-semibold mt-0.5">
                  {slot.classId} — {slot.subjectName}
                </p>
                <p className="text-[#5A6D64] dark:text-[#DED7C5]">{slot.roomOrMode}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const PrincipalPortalView: React.FC<{ onNavigateModule: (moduleKey: string) => void }> = ({
  onNavigateModule,
}) => {
  const { userAccount } = useAuth();
  const { admissions, results, teachers, students, classes, subjects, settings, auditLogs } =
    usePlatform();

  const pendingAdmissions = admissions.filter((a) => a.status === 'Pending');
  const unpublishedResults = results.filter((r) => !r.isPublished);

  return (
    <div className="space-y-6">
      <div className="bg-[#06452C] text-[#F8F1DF] rounded-xl border border-[#D9AD43]/40 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#D9AD43]">
            Office of the Principal · Academic Leadership
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-white mt-1">
            {settings.principalName} ({userAccount?.displayName})
          </h2>
          <p className="text-xs sm:text-sm text-[#E6DFCE] mt-1">
            Academic oversight across General School Education &amp; Islamic Education ({classes.length}{' '}
            classes, {subjects.length} configured subjects).
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigateModule('results')}
          className="px-4 py-2.5 rounded-lg bg-[#D9AD43] text-[#102D23] text-xs font-bold hover:bg-[#e4bb55] cursor-pointer shrink-0"
        >
          Review &amp; Approve Results ({unpublishedResults.length})
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-5">
          <p className="text-xs font-semibold text-[#8A6518] dark:text-[#D9AD43]">PENDING ADMISSIONS</p>
          <p className="font-serif text-3xl font-semibold mt-1 tabular-nums">
            {pendingAdmissions.length}
          </p>
          <button
            type="button"
            onClick={() => onNavigateModule('admissions')}
            className="text-xs font-semibold text-[#06452C] dark:text-[#D9AD43] underline mt-2 cursor-pointer"
          >
            Open Admissions Desk →
          </button>
        </div>
        <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-5">
          <p className="text-xs font-semibold text-[#8A6518] dark:text-[#D9AD43]">RESULTS TO PUBLISH</p>
          <p className="font-serif text-3xl font-semibold mt-1 tabular-nums">
            {unpublishedResults.length}
          </p>
          <button
            type="button"
            onClick={() => onNavigateModule('results')}
            className="text-xs font-semibold text-[#06452C] dark:text-[#D9AD43] underline mt-2 cursor-pointer"
          >
            Approve Marksheets →
          </button>
        </div>
        <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-5">
          <p className="text-xs font-semibold text-[#8A6518] dark:text-[#D9AD43]">FACULTY &amp; SCHOLARS</p>
          <p className="font-serif text-3xl font-semibold mt-1 tabular-nums">{teachers.length}</p>
          <button
            type="button"
            onClick={() => onNavigateModule('teachers')}
            className="text-xs font-semibold text-[#06452C] dark:text-[#D9AD43] underline mt-2 cursor-pointer"
          >
            Faculty Directory →
          </button>
        </div>
        <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-5">
          <p className="text-xs font-semibold text-[#8A6518] dark:text-[#D9AD43]">ENROLLED STUDENTS</p>
          <p className="font-serif text-3xl font-semibold mt-1 tabular-nums">{students.length}</p>
          <button
            type="button"
            onClick={() => onNavigateModule('islamic')}
            className="text-xs font-semibold text-[#06452C] dark:text-[#D9AD43] underline mt-2 cursor-pointer"
          >
            Islamic Progress Ledger →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-6 space-y-3">
          <h3 className="font-serif text-xl font-semibold">Leadership Quick Modules</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {[
              { key: 'admissions', label: 'Admissions Review' },
              { key: 'results', label: 'Result Publishing' },
              { key: 'islamic', label: 'Islamic Wing (Quran)' },
              { key: 'general', label: 'General Wing (Board)' },
              { key: 'timetable', label: 'Timetable & Routine' },
              { key: 'certificates', label: 'Certificates & IDs' },
              { key: 'cms', label: 'Principal CMS Note' },
              { key: 'reports', label: 'Academic Reports' },
              { key: 'audit', label: 'Audit Logs' },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => onNavigateModule(item.key)}
                className="p-3 rounded-lg bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 text-left text-xs font-semibold hover:border-[#06452C] cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-6 space-y-3">
          <h3 className="font-serif text-xl font-semibold">Recent Institutional Audit Trail</h3>
          {auditLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="text-xs py-2 border-b border-[#EFE6D2] dark:border-[#D9AD43]/20 flex justify-between gap-2">
              <span className="truncate">
                <strong>{log.actorEmail}</strong>: {log.action} ({log.collectionName})
              </span>
              <span className="text-[#5A6D64] shrink-0">{log.detail}</span>
            </div>
          ))}
          {auditLogs.length === 0 && (
            <p className="text-xs text-[#5A6D64]">No audit actions recorded in this session yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export const AccountsPortalView: React.FC<{ onNavigateModule: (moduleKey: string) => void }> = ({
  onNavigateModule,
}) => {
  const { userAccount } = useAuth();
  const { invoices, payments, staff, feeStructures, integrations, settings } = usePlatform();

  const totalBilled = invoices.reduce((s, inv) => s + Math.max(0, inv.amount - inv.discountAmount), 0);
  const totalCollected = payments.reduce((s, p) => s + p.amount, 0);
  const outstandingDues = Math.max(0, totalBilled - totalCollected);
  const payrollMonthly = staff.reduce((s, st) => s + (st.salaryAmount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="bg-[#06452C] text-[#F8F1DF] rounded-xl border border-[#D9AD43]/40 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#D9AD43]">
            Accounts &amp; Finance Staff Desk
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-white mt-1">
            Welcome, {userAccount?.displayName}
          </h2>
          <p className="text-xs sm:text-sm text-[#E6DFCE] mt-1">
            Manage fee structures ({feeStructures.length}), student invoices, Cash/Bank receipt
            recording, and staff salary ledger.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigateModule('fees')}
          className="px-4 py-2.5 rounded-lg bg-[#D9AD43] text-[#102D23] text-xs font-bold hover:bg-[#e4bb55] cursor-pointer shrink-0"
        >
          Collect Fees &amp; Generate Invoice
        </button>
      </div>

      {!integrations?.paymentGateway.configured && (
        <div className="p-4 rounded-xl bg-white dark:bg-[#102D23] border border-[#D9AD43]/45 text-xs flex flex-wrap items-center justify-between gap-2">
          <span>
            <strong>Online Payment Gateway ({integrations?.paymentGateway.provider || 'Razorpay'}):</strong>{' '}
            <span className="text-[#8A6518] dark:text-[#D9AD43] font-semibold">Not Configured</span> —
            Accounts Staff can record Cash, Bank Transfer, and Offline UPI receipts safely without
            online gateway credentials.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-5">
          <p className="text-xs font-semibold text-[#8A6518] dark:text-[#D9AD43]">NET BILLED</p>
          <p className="font-serif text-3xl font-semibold mt-1 tabular-nums">INR {totalBilled}</p>
        </div>
        <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-5">
          <p className="text-xs font-semibold text-[#8A6518] dark:text-[#D9AD43]">TOTAL COLLECTED</p>
          <p className="font-serif text-3xl font-semibold mt-1 tabular-nums text-[#06452C] dark:text-[#A9D5BE]">
            INR {totalCollected}
          </p>
        </div>
        <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-5">
          <p className="text-xs font-semibold text-[#8A6518] dark:text-[#D9AD43]">OUTSTANDING DUES</p>
          <p className="font-serif text-3xl font-semibold mt-1 tabular-nums">INR {outstandingDues}</p>
        </div>
        <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-5">
          <p className="text-xs font-semibold text-[#8A6518] dark:text-[#D9AD43]">MONTHLY PAYROLL</p>
          <p className="font-serif text-3xl font-semibold mt-1 tabular-nums">INR {payrollMonthly}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-semibold">Pending &amp; Recent Invoices</h3>
            <button
              type="button"
              onClick={() => onNavigateModule('fees')}
              className="text-xs font-semibold text-[#06452C] dark:text-[#D9AD43] underline cursor-pointer"
            >
              Manage All →
            </button>
          </div>
          {invoices.slice(0, 5).map((inv) => {
            const due = Math.max(0, inv.amount - inv.discountAmount - inv.paidAmount);
            return (
              <div
                key={inv.id}
                className="p-3 rounded-lg bg-[#F8F1DF]/70 dark:bg-[#081A14] border border-[#D9AD43]/25 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-semibold">
                    {inv.studentName} · {inv.invoiceNumber}
                  </p>
                  <p className="text-[#5A6D64] dark:text-[#DED7C5] tabular-nums">
                    {inv.title} · Due Balance: INR {due}
                  </p>
                </div>
                <span className="font-semibold px-2 py-0.5 rounded bg-[#06452C]/15 text-[#06452C] dark:text-[#D9AD43]">
                  {inv.status}
                </span>
              </div>
            );
          })}
        </div>

        <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-semibold">Verified Fee Receipts</h3>
            <button
              type="button"
              onClick={() => onNavigateModule('staff')}
              className="text-xs font-semibold text-[#06452C] dark:text-[#D9AD43] underline cursor-pointer"
            >
              Staff Payroll →
            </button>
          </div>
          {payments.slice(0, 5).map((pay) => (
            <div
              key={pay.id}
              className="p-3 rounded-lg bg-[#F8F1DF]/70 dark:bg-[#081A14] border border-[#D9AD43]/25 flex items-center justify-between text-xs"
            >
              <div>
                <p className="font-semibold">
                  {pay.receiptNumber} · {pay.studentName}
                </p>
                <p className="text-[#5A6D64] dark:text-[#DED7C5] tabular-nums">
                  INR {pay.amount} ({pay.method}) · {pay.paidAt}
                </p>
              </div>
              <button
                type="button"
                onClick={() => downloadFeeReceiptPdf(pay, settings)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#06452C] text-white font-semibold cursor-pointer"
              >
                <Download className="w-3 h-3" /> PDF
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const SuperAdminPortalView: React.FC<{ onNavigateModule: (moduleKey: string) => void }> = ({
  onNavigateModule,
}) => {
  const { userAccount } = useAuth();
  const { students, teachers, admissions, users, integrations, auditLogs } = usePlatform();

  const integrationList = [
    { name: 'Razorpay Gateway', configured: Boolean(integrations?.paymentGateway.configured) },
    { name: 'Email (SMTP)', configured: Boolean(integrations?.emailNotifications.configured) },
    { name: 'SMS / WhatsApp', configured: Boolean(integrations?.smsNotifications.configured) },
    { name: 'Video Conferencing', configured: Boolean(integrations?.videoConferencing.configured) },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-[#06452C] text-[#F8F1DF] rounded-xl border border-[#D9AD43]/40 p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#D9AD43]">
            Super Admin Governance Console · Full Authority
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-white mt-1">
            {userAccount?.displayName} ({userAccount?.email})
          </h2>
          <p className="text-xs sm:text-sm text-[#E6DFCE] mt-1">
            Cloud Firestore Project: <strong>gen-lang-client-0175021821</strong> · Use the Sidebar
            Role Switcher to preview any user portal live.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onNavigateModule('settings')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#D9AD43] text-[#102D23] text-xs font-bold cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" /> System &amp; Integrations
          </button>
          <button
            type="button"
            onClick={() => onNavigateModule('overview')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#D9AD43]/50 text-[#F8F1DF] text-xs font-semibold cursor-pointer"
          >
            <Building2 className="w-3.5 h-3.5" /> Full Admin Analytics
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-5">
          <p className="text-xs font-semibold text-[#8A6518] dark:text-[#D9AD43]">REGISTERED USERS</p>
          <p className="font-serif text-3xl font-semibold mt-1 tabular-nums">{users.length}</p>
        </div>
        <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-5">
          <p className="text-xs font-semibold text-[#8A6518] dark:text-[#D9AD43]">STUDENTS &amp; FACULTY</p>
          <p className="font-serif text-3xl font-semibold mt-1 tabular-nums">
            {students.length} / {teachers.length}
          </p>
        </div>
        <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-5">
          <p className="text-xs font-semibold text-[#8A6518] dark:text-[#D9AD43]">ADMISSION APPLICATIONS</p>
          <p className="font-serif text-3xl font-semibold mt-1 tabular-nums">{admissions.length}</p>
        </div>
        <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-5">
          <p className="text-xs font-semibold text-[#8A6518] dark:text-[#D9AD43]">RBAC ROLES ACTIVE</p>
          <p className="font-serif text-3xl font-semibold mt-1 tabular-nums">
            {Object.keys(ROLE_DEFINITIONS).length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-semibold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#D9AD43]" />
              <span>Optional External Integrations Status</span>
            </h3>
            <button
              type="button"
              onClick={() => onNavigateModule('settings')}
              className="text-xs font-semibold text-[#06452C] dark:text-[#D9AD43] underline cursor-pointer"
            >
              Configure →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {integrationList.map((item) => (
              <div
                key={item.name}
                className="p-3 rounded-lg bg-[#F8F1DF]/70 dark:bg-[#081A14] border border-[#D9AD43]/25 flex items-center justify-between text-xs"
              >
                <span className="font-semibold">{item.name}</span>
                <span
                  className={`px-2 py-0.5 rounded font-semibold ${
                    item.configured
                      ? 'bg-[#06452C] text-white'
                      : 'bg-[#D9AD43]/25 text-[#8A6518] dark:text-[#D9AD43]'
                  }`}
                >
                  {item.configured ? 'Configured' : 'Not Configured'}
                </span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
            {[
              { key: 'users', label: 'User Accounts', icon: Users },
              { key: 'roles', label: 'RBAC Matrix', icon: ShieldCheck },
              { key: 'security', label: 'Rules & Seeding', icon: Settings },
              { key: 'fees', label: 'Finance & Fees', icon: Wallet },
              { key: 'lms', label: 'LMS & Courses', icon: BookOpen },
              { key: 'audit', label: 'Audit Logs', icon: Award },
            ].map((btn) => {
              const Icon = btn.icon;
              return (
                <button
                  key={btn.key}
                  type="button"
                  onClick={() => onNavigateModule(btn.key)}
                  className="p-2.5 rounded-lg border border-[#D9AD43]/30 hover:border-[#06452C] flex items-center gap-2 text-xs font-semibold cursor-pointer"
                >
                  <Icon className="w-3.5 h-3.5 text-[#D9AD43] shrink-0" />
                  <span className="truncate">{btn.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-semibold">Security &amp; Audit Activity</h3>
            <button
              type="button"
              onClick={() => onNavigateModule('audit')}
              className="text-xs font-semibold text-[#06452C] dark:text-[#D9AD43] underline cursor-pointer"
            >
              View All →
            </button>
          </div>
          {auditLogs.slice(0, 6).map((log) => (
            <div
              key={log.id}
              className="py-2 border-b border-[#EFE6D2] dark:border-[#D9AD43]/20 text-xs flex justify-between gap-2"
            >
              <span className="truncate">
                <strong>{log.actorEmail}</strong>: {log.action} ({log.collectionName})
              </span>
              <span className="text-[#8A6518] dark:text-[#D9AD43] shrink-0">
                {log.detail}
              </span>
            </div>
          ))}
          {auditLogs.length === 0 && (
            <p className="text-xs text-[#5A6D64]">
              All critical actions (approvals, marks publishing, role changes, fee verification) are
              logged to Firestore automatically.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

