import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Download,
  ExternalLink,
  FileText,
  Play,
  Radio,
  Search,
  Send,
  Trophy,
  Video,
} from 'lucide-react';
import { IntegrationStatus } from '../../context/PlatformContext';
import {
  downloadFeeReceiptPdf,
  downloadMarksheetPdf,
  downloadStudentIdCardPdf,
  downloadTimetablePdf,
} from '../../lib/pdfGenerator';
import {
  AssignmentItem,
  FeeInvoice,
  HomeworkItem,
  InstitutionSettings,
  LibraryResource,
  LiveClassSession,
  LmsCourse,
  LmsLesson,
  PaymentRecord,
  PublishedResult,
  StudentRecord,
  SubmissionItem,
  TimetableSlot,
} from '../../types/platform';
import { StudentLmsSummary, StudentResourceTab } from './studentTypes';

interface StudentResourcesSectionProps {
  activeTab: StudentResourceTab;
  onChangeTab: (tab: StudentResourceTab) => void;
  settings: InstitutionSettings;
  integrations: IntegrationStatus;
  isSignedIn: boolean;
  userUid?: string;
  myStudent?: StudentRecord;
  courses: LmsCourse[];
  lessons: LmsLesson[];
  liveClasses: LiveClassSession[];
  library: LibraryResource[];
  results: PublishedResult[];
  homework: HomeworkItem[];
  assignments: AssignmentItem[];
  submissions: SubmissionItem[];
  timetables: TimetableSlot[];
  invoices: FeeInvoice[];
  payments: PaymentRecord[];
  lmsSummary: StudentLmsSummary;
  upsertRecord: (
    collectionName: string,
    id: string,
    data: Record<string, unknown>,
    auditDetail?: string
  ) => Promise<void>;
  onLaunchCourse: (course: LmsCourse, lessonId?: string) => void;
}

export const StudentResourcesSection: React.FC<StudentResourcesSectionProps> = ({
  activeTab,
  onChangeTab,
  settings,
  integrations,
  isSignedIn,
  userUid,
  myStudent,
  courses,
  lessons,
  liveClasses,
  library,
  results,
  homework,
  assignments,
  submissions,
  timetables,
  invoices,
  payments,
  lmsSummary,
  upsertRecord,
  onLaunchCourse,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [resultLookup, setResultLookup] = useState('');
  const [activeAssignmentId, setActiveAssignmentId] = useState<string | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const myClassId = myStudent?.classId || 'Class 10';

  const myLiveClasses = useMemo(
    () =>
      liveClasses.filter((lc) => lc.classId === myClassId || lc.classId === 'All Classes'),
    [liveClasses, myClassId]
  );

  const recordedLessons = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return lessons
      .map((les) => ({
        lesson: les,
        course: courses.find((c) => c.id === les.courseId),
      }))
      .filter((item) => {
        if (!item.course) return false;
        if (!q) return true;
        return (
          item.lesson.title.toLowerCase().includes(q) ||
          item.lesson.chapterTitle.toLowerCase().includes(q) ||
          item.course.title.toLowerCase().includes(q) ||
          item.course.classId.toLowerCase().includes(q)
        );
      });
  }, [lessons, courses, searchQuery]);

  const filteredNotesLessons = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return lessons.filter((les) => {
      if (!les.notes && !les.pdfUrl) return false;
      if (!q) return true;
      return (
        les.title.toLowerCase().includes(q) ||
        les.notes.toLowerCase().includes(q) ||
        les.chapterTitle.toLowerCase().includes(q)
      );
    });
  }, [lessons, searchQuery]);

  const filteredLibrary = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return library.filter((item) => {
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.author.toLowerCase().includes(q) ||
        item.subjectName.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });
  }, [library, searchQuery]);

  const myPublishedResults = useMemo(() => {
    const published = results.filter((r) => r.isPublished);
    const q = resultLookup.trim().toLowerCase();
    if (q) {
      return published.filter(
        (r) =>
          r.rollNumber.toLowerCase().includes(q) ||
          r.admissionNumber.toLowerCase().includes(q) ||
          r.studentName.toLowerCase().includes(q) ||
          r.classId.toLowerCase().includes(q)
      );
    }
    if (myStudent) {
      const exact = published.filter(
        (r) =>
          r.rollNumber === myStudent.rollNumber ||
          r.admissionNumber === myStudent.admissionNumber
      );
      if (exact.length > 0) return exact;
    }
    return published;
  }, [results, resultLookup, myStudent]);

  const myHomework = useMemo(
    () => homework.filter((h) => h.classId === myClassId || h.classId === 'All Classes'),
    [homework, myClassId]
  );

  const myAssignments = useMemo(
    () => assignments.filter((a) => a.classId === myClassId || a.classId === 'All Classes'),
    [assignments, myClassId]
  );

  const myTimetable = useMemo(
    () => timetables.filter((t) => t.classId === myClassId),
    [timetables, myClassId]
  );

  const myInvoices = useMemo(
    () =>
      myStudent
        ? invoices.filter(
            (i) => i.studentId === myStudent.id || i.studentId === myStudent.studentId
          )
        : [],
    [invoices, myStudent]
  );

  const myPayments = useMemo(
    () =>
      myStudent
        ? payments.filter(
            (p) => p.studentId === myStudent.id || p.studentId === myStudent.studentId
          )
        : [],
    [payments, myStudent]
  );

  const handleSubmitAssignment = async (assignmentId: string) => {
    if (!isSignedIn || !userUid || !submissionText.trim()) return;
    const subId = `sub-${assignmentId}-${userUid}`;
    await upsertRecord(
      'submissions',
      subId,
      {
        assignmentId,
        studentId: myStudent?.studentId || myStudent?.id || userUid,
        studentUid: userUid,
        studentName: myStudent?.name || 'Academy Student',
        submissionText: submissionText.trim(),
        status: 'submitted',
      },
      `Submitted assignment ${assignmentId}`
    );
    setActiveAssignmentId(null);
    setSubmissionText('');
    setStatusMessage('Assignment response submitted to your instructor.');
  };

  return (
    <div className="space-y-6">
      {/* Section Header + Sub-Navigation Tabs */}
      <section className="rounded-2xl bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8A6518] dark:text-[#D9AD43]">
              Academic Learning Hub
            </p>
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#06452C] dark:text-white">
              Live Classes, PDFs, Results &amp; Homework
            </h1>
          </div>

          {myStudent && (
            <button
              type="button"
              onClick={() => downloadStudentIdCardPdf(myStudent, settings)}
              className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/40 text-xs font-semibold text-[#06452C] dark:text-[#D9AD43] cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download ID Card PDF</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: 'live', label: 'Live & Recorded', icon: Radio },
              { id: 'notes', label: 'Notes & PDFs', icon: FileText },
              { id: 'results', label: 'Exam Results', icon: Trophy },
              { id: 'homework', label: 'Homework & Fees', icon: ClipboardList },
            ] as Array<{ id: StudentResourceTab; label: string; icon: React.ComponentType<{ className?: string }> }>
          ).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChangeTab(item.id)}
                className={`min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                  activeTab === item.id
                    ? 'bg-[#06452C] text-[#F8F1DF] shadow-xs'
                    : 'bg-[#F8F1DF]/75 dark:bg-[#081A14] border border-[#D9AD43]/30 text-[#314A3F] dark:text-[#E6DFCE]'
                }`}
              >
                <Icon className="w-4 h-4 text-[#D9AD43]" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-[#DCFCE7] border border-[#16A34A]/40 text-xs font-semibold text-[#166534] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* TAB 1: LIVE & RECORDED CLASSES */}
      {activeTab === 'live' && (
        <div className="space-y-6">
          <section className="rounded-2xl bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-[#06452C] dark:text-[#D9AD43]" />
                <h2 className="font-serif text-xl font-semibold text-[#06452C] dark:text-white">
                  Scheduled Live Classes ({myClassId})
                </h2>
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 text-[#8A6518] dark:text-[#D9AD43]">
                Video Service: {integrations.videoConferencing.statusLabel}
              </span>
            </div>

            {myLiveClasses.length === 0 ? (
              <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5]">
                No live classes scheduled for {myClassId} at this moment. You can review any
                recorded video lecture below.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myLiveClasses.map((lc) => {
                  const hasValidUrl = Boolean(
                    lc.meetingLink &&
                      (lc.meetingLink.startsWith('http://') ||
                        lc.meetingLink.startsWith('https://'))
                  );
                  return (
                    <div
                      key={lc.id}
                      className="p-4 rounded-xl bg-[#F8F1DF]/65 dark:bg-[#081A14] border border-[#D9AD43]/30 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wider text-[#8A6518] dark:text-[#D9AD43]">
                            {lc.subjectName} · {lc.classId}
                          </p>
                          <h3 className="font-serif text-lg font-semibold text-[#06452C] dark:text-white">
                            {lc.title}
                          </h3>
                        </div>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white dark:bg-[#102D23] border border-[#D9AD43]/30 text-[#06452C] dark:text-[#D9AD43]">
                          {lc.status}
                        </span>
                      </div>

                      <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5]">
                        Instructor: {lc.teacherName} · {lc.startTime} – {lc.endTime}
                      </p>

                      {hasValidUrl ? (
                        <a
                          href={lc.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#06452C] text-[#F8F1DF] text-xs font-semibold hover:bg-[#102D23]"
                        >
                          <ExternalLink className="w-4 h-4 text-[#D9AD43]" />
                          <span>Join Live Session</span>
                        </a>
                      ) : (
                        <div className="p-2.5 rounded-lg bg-white dark:bg-[#102D23] border border-[#D9AD43]/25 text-[11px] text-[#8A6518] dark:text-[#D9AD43] flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>
                            Live meeting link not configured yet. Please check back before class
                            or watch the recorded archive below.
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Recorded Video Archive */}
          <section className="rounded-2xl bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-[#06452C] dark:text-[#D9AD43]" />
                <h2 className="font-serif text-xl font-semibold text-[#06452C] dark:text-white">
                  Recorded Video Archive ({recordedLessons.length})
                </h2>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-[#8A6518] dark:text-[#D9AD43] absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter recorded lessons..."
                  className="w-full min-h-[42px] ps-9 pe-3 py-1.5 rounded-xl border border-[#D9AD43]/35 bg-[#F8F1DF]/60 dark:bg-[#081A14] text-xs text-[#102D23] dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recordedLessons.map(({ lesson, course }) =>
                course ? (
                  <div
                    key={lesson.id}
                    className="p-3.5 rounded-xl bg-[#F8F1DF]/65 dark:bg-[#081A14] border border-[#D9AD43]/25 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-[#8A6518] dark:text-[#D9AD43] truncate">
                        {course.title} · {lesson.chapterTitle}
                      </p>
                      <p className="text-xs font-semibold text-[#06452C] dark:text-white truncate mt-0.5">
                        {lesson.title}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onLaunchCourse(course, lesson.id)}
                      className="min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#06452C] text-[#F8F1DF] text-xs font-semibold shrink-0 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current text-[#D9AD43]" />
                      <span>Watch</span>
                    </button>
                  </div>
                ) : null
              )}
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: NOTES & PDF LIBRARY */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          <section className="rounded-2xl bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#06452C] dark:text-[#D9AD43]" />
                <h2 className="font-serif text-xl font-semibold text-[#06452C] dark:text-white">
                  Lesson Study Notes &amp; Attached PDFs
                </h2>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-[#8A6518] dark:text-[#D9AD43] absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search notes & PDFs..."
                  className="w-full min-h-[42px] ps-9 pe-3 py-1.5 rounded-xl border border-[#D9AD43]/35 bg-[#F8F1DF]/60 dark:bg-[#081A14] text-xs text-[#102D23] dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredNotesLessons.map((les) => {
                const parentCourse = courses.find((c) => c.id === les.courseId);
                return (
                  <div
                    key={les.id}
                    className="p-4 rounded-xl bg-[#F8F1DF]/70 dark:bg-[#081A14] border border-[#D9AD43]/30 space-y-2.5 flex flex-col justify-between"
                  >
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#8A6518] dark:text-[#D9AD43]">
                        {parentCourse?.title || les.courseId} · {les.chapterTitle}
                      </p>
                      <h3 className="text-sm font-bold text-[#06452C] dark:text-white mt-0.5">
                        {les.title}
                      </h3>
                      <p className="text-xs text-[#314A3F] dark:text-[#E6DFCE] mt-1.5 leading-relaxed">
                        {les.notes}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {les.pdfUrl && (
                        <a
                          href={les.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#06452C] text-[#F8F1DF] text-xs font-semibold"
                        >
                          <Download className="w-3.5 h-3.5 text-[#D9AD43]" />
                          <span>Lesson PDF</span>
                        </a>
                      )}
                      {parentCourse && (
                        <button
                          type="button"
                          onClick={() => onLaunchCourse(parentCourse, les.id)}
                          className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#06452C] dark:border-[#D9AD43] text-xs font-semibold text-[#06452C] dark:text-[#D9AD43] cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Open Lesson</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Digital Library E-Books & PDFs */}
          <section className="rounded-2xl bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#06452C] dark:text-[#D9AD43]" />
                <h2 className="font-serif text-xl font-semibold text-[#06452C] dark:text-white">
                  Digital Islamic &amp; Academic PDF Library ({filteredLibrary.length})
                </h2>
              </div>
              {myTimetable.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    downloadTimetablePdf(`Class Routine ${myClassId}`, myTimetable, settings)
                  }
                  className="min-h-[42px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#06452C] text-[#F8F1DF] text-xs font-semibold cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#D9AD43]" />
                  <span>Class Routine PDF</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredLibrary.map((res) => (
                <div
                  key={res.id}
                  className="p-4 rounded-xl bg-[#F8F1DF]/65 dark:bg-[#081A14] border border-[#D9AD43]/30 flex flex-col justify-between gap-3"
                >
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A6518] dark:text-[#D9AD43]">
                      {res.category} · {res.classId}
                    </p>
                    <h3 className="text-sm font-bold text-[#06452C] dark:text-white mt-0.5">
                      {res.title}
                    </h3>
                    <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5] mt-1">
                      {res.author} · {res.subjectName}
                    </p>
                  </div>
                  {res.fileUrl && res.fileUrl.startsWith('http') ? (
                    <a
                      href={res.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[40px] inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#06452C] text-[#F8F1DF] text-xs font-semibold"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#D9AD43]" />
                      <span>Open Resource</span>
                    </a>
                  ) : (
                    <span className="text-[11px] font-medium text-[#5A6D64] dark:text-[#DED7C5]">
                      Available in Academy Reading Room
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* TAB 3: EXAM RESULTS & MARKSHEET + MCQ QUIZ PERFORMANCE */}
      {activeTab === 'results' && (
        <div className="space-y-6">
          <section className="rounded-2xl bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#D9AD43]" />
                <h2 className="font-serif text-xl font-semibold text-[#06452C] dark:text-white">
                  Official Examination Marksheets
                </h2>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-[#8A6518] dark:text-[#D9AD43] absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={resultLookup}
                  onChange={(e) => setResultLookup(e.target.value)}
                  placeholder="Lookup Roll No, Admission No, or Name..."
                  className="w-full min-h-[42px] ps-9 pe-3 py-1.5 rounded-xl border border-[#D9AD43]/35 bg-[#F8F1DF]/60 dark:bg-[#081A14] text-xs text-[#102D23] dark:text-white"
                />
              </div>
            </div>

            {myPublishedResults.length === 0 ? (
              <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5]">
                No published examination marksheets matched your search.
              </p>
            ) : (
              <div className="space-y-4">
                {myPublishedResults.map((res) => (
                  <div
                    key={res.id}
                    className="p-4 sm:p-5 rounded-xl bg-[#F8F1DF]/75 dark:bg-[#081A14] border border-[#D9AD43]/35 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-[#8A6518] dark:text-[#D9AD43]">
                          {res.examTitle} · {res.sessionId}
                        </p>
                        <h3 className="font-serif text-lg font-semibold text-[#06452C] dark:text-white">
                          {res.studentName} ({res.classId} · Roll {res.rollNumber})
                        </h3>
                        <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5]">
                          Admission No: {res.admissionNumber} · Total: {res.totalMarks}/
                          {res.fullMarks} ({res.percentage.toFixed(1)}%) · Grade {res.grade} ·{' '}
                          <strong>{res.resultStatus}</strong>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => downloadMarksheetPdf(res, settings)}
                        className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#06452C] text-[#F8F1DF] text-xs font-semibold cursor-pointer"
                      >
                        <Download className="w-4 h-4 text-[#D9AD43]" />
                        <span>Download Marksheet PDF</span>
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#D9AD43]/30 text-[#8A6518] dark:text-[#D9AD43]">
                            <th className="py-2 pe-3 font-semibold">Subject</th>
                            <th className="py-2 pe-3 font-semibold">Wing</th>
                            <th className="py-2 pe-3 font-semibold">Full Marks</th>
                            <th className="py-2 font-semibold">Obtained</th>
                          </tr>
                        </thead>
                        <tbody>
                          {res.subjects.map((sub) => (
                            <tr
                              key={sub.subjectName}
                              className="border-b border-[#D9AD43]/15 text-[#102D23] dark:text-[#E6DFCE]"
                            >
                              <td className="py-2 pe-3 font-medium">{sub.subjectName}</td>
                              <td className="py-2 pe-3 capitalize">{sub.track}</td>
                              <td className="py-2 pe-3 tabular-nums">{sub.fullMarks}</td>
                              <td className="py-2 tabular-nums font-bold">{sub.obtainedMarks}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* LMS Quiz Scores Overview */}
          <section className="rounded-2xl bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 p-5 sm:p-6 space-y-3">
            <h2 className="font-serif text-xl font-semibold text-[#06452C] dark:text-white">
              Online Lesson Quiz Results ({lmsSummary.quizHistory.length})
            </h2>
            {lmsSummary.quizHistory.length === 0 ? (
              <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5]">
                No online lesson MCQ attempts recorded yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {lmsSummary.quizHistory.slice(0, 10).map((q, i) => (
                  <div
                    key={`${q.lessonId}-${i}`}
                    className="p-3.5 rounded-xl bg-[#F8F1DF]/65 dark:bg-[#081A14] border border-[#D9AD43]/25 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#06452C] dark:text-white truncate">
                        {q.lessonTitle}
                      </p>
                      <p className="text-[11px] text-[#5A6D64] dark:text-[#DED7C5] truncate">
                        {q.courseTitle} · Attempt #{q.attempt.attemptNumber}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-bold tabular-nums px-2.5 py-1 rounded-lg ${
                        q.attempt.passed
                          ? 'bg-[#DCFCE7] text-[#166534]'
                          : 'bg-[#FEE2E2] text-[#991B1B]'
                      }`}
                    >
                      {q.attempt.score}/{q.attempt.totalQuestions} ({q.attempt.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* TAB 4: HOMEWORK, ASSIGNMENTS, TIMETABLE & FEES */}
      {activeTab === 'homework' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Daily Homework */}
            <section className="rounded-2xl bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-[#06452C] dark:text-[#D9AD43]" />
                <h2 className="font-serif text-xl font-semibold text-[#06452C] dark:text-white">
                  Daily Homework ({myClassId})
                </h2>
              </div>
              {myHomework.length === 0 ? (
                <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5]">
                  No homework assigned for {myClassId}.
                </p>
              ) : (
                myHomework.map((hw) => (
                  <div
                    key={hw.id}
                    className="p-3.5 rounded-xl bg-[#F8F1DF]/65 dark:bg-[#081A14] border border-[#D9AD43]/25 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-[#06452C] dark:text-white">{hw.title}</p>
                      <span className="text-[11px] font-semibold text-[#8A6518] dark:text-[#D9AD43]">
                        Due: {hw.dueDate}
                      </span>
                    </div>
                    <p className="text-xs text-[#314A3F] dark:text-[#E6DFCE]">{hw.description}</p>
                  </div>
                ))
              )}
            </section>

            {/* Class Timetable */}
            <section className="rounded-2xl bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-[#06452C] dark:text-[#D9AD43]" />
                  <h2 className="font-serif text-xl font-semibold text-[#06452C] dark:text-white">
                    Class Routine ({myClassId})
                  </h2>
                </div>
                {myTimetable.length > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      downloadTimetablePdf(`Routine ${myClassId}`, myTimetable, settings)
                    }
                    className="min-h-[38px] px-3 py-1 rounded-lg bg-[#06452C] text-[#F8F1DF] text-xs font-semibold cursor-pointer"
                  >
                    PDF
                  </button>
                )}
              </div>
              {myTimetable.length === 0 ? (
                <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5]">
                  Timetable slots for {myClassId} will appear here once published.
                </p>
              ) : (
                myTimetable.map((slot) => (
                  <div
                    key={slot.id}
                    className="p-3 rounded-xl bg-[#F8F1DF]/65 dark:bg-[#081A14] border border-[#D9AD43]/25 flex items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <p className="font-bold text-[#06452C] dark:text-white">
                        {slot.day} · {slot.subjectName}
                      </p>
                      <p className="text-[11px] text-[#5A6D64] dark:text-[#DED7C5]">
                        {slot.teacherName} · {slot.roomOrMode}
                      </p>
                    </div>
                    <span className="font-semibold tabular-nums text-[#8A6518] dark:text-[#D9AD43]">
                      {slot.startTime}–{slot.endTime}
                    </span>
                  </div>
                ))
              )}
            </section>
          </div>

          {/* Interactive Assignments */}
          <section className="rounded-2xl bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 p-5 sm:p-6 space-y-4">
            <h2 className="font-serif text-xl font-semibold text-[#06452C] dark:text-white">
              Written Assignments &amp; Submissions
            </h2>
            {myAssignments.length === 0 ? (
              <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5]">
                No pending assignments for {myClassId}.
              </p>
            ) : (
              <div className="space-y-3">
                {myAssignments.map((asg) => {
                  const existingSub = submissions.find(
                    (s) =>
                      s.assignmentId === asg.id &&
                      (s.studentUid === userUid || s.studentId === myStudent?.studentId)
                  );
                  return (
                    <div
                      key={asg.id}
                      className="p-4 rounded-xl bg-[#F8F1DF]/65 dark:bg-[#081A14] border border-[#D9AD43]/25 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-bold text-[#06452C] dark:text-white">
                            {asg.title}
                          </h3>
                          <p className="text-[11px] text-[#5A6D64] dark:text-[#DED7C5]">
                            {asg.subjectName} · Due: {asg.dueDate} · Max {asg.maxMarks} Marks
                          </p>
                        </div>
                        {existingSub ? (
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#DCFCE7] text-[#166534]">
                            {existingSub.status}
                            {existingSub.marks !== undefined ? ` (${existingSub.marks}M)` : ''}
                          </span>
                        ) : isSignedIn ? (
                          <button
                            type="button"
                            onClick={() =>
                              setActiveAssignmentId((prev) => (prev === asg.id ? null : asg.id))
                            }
                            className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-[#06452C] text-[#F8F1DF] text-xs font-semibold cursor-pointer"
                          >
                            {activeAssignmentId === asg.id ? 'Cancel' : 'Submit Answer'}
                          </button>
                        ) : (
                          <span className="text-[11px] font-medium text-[#8A6518]">
                            Sign in to submit
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#314A3F] dark:text-[#E6DFCE]">
                        {asg.instructions}
                      </p>

                      {activeAssignmentId === asg.id && (
                        <div className="space-y-2.5 pt-1">
                          <textarea
                            rows={3}
                            value={submissionText}
                            onChange={(e) => setSubmissionText(e.target.value)}
                            placeholder="Write your assignment answer or paste document link..."
                            className="w-full p-3 rounded-xl border border-[#D9AD43]/40 bg-white dark:bg-[#102D23] text-xs text-[#102D23] dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => handleSubmitAssignment(asg.id)}
                            className="min-h-[42px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#06452C] text-[#F8F1DF] text-xs font-semibold cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5 text-[#D9AD43]" />
                            <span>Submit Assignment</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Fee Invoices & Payment Receipts */}
          {myStudent && (
            <section className="rounded-2xl bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#06452C] dark:text-[#D9AD43]" />
                <h2 className="font-serif text-xl font-semibold text-[#06452C] dark:text-white">
                  Fee Invoices &amp; Verified Receipts
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {myInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-3.5 rounded-xl bg-[#F8F1DF]/65 dark:bg-[#081A14] border border-[#D9AD43]/25 flex items-center justify-between gap-2"
                  >
                    <div>
                      <p className="text-xs font-bold text-[#06452C] dark:text-white">{inv.title}</p>
                      <p className="text-[11px] text-[#5A6D64] dark:text-[#DED7C5]">
                        {inv.invoiceNumber} · Due {inv.dueDate}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold tabular-nums text-[#06452C] dark:text-[#D9AD43]">
                        INR {inv.amount.toLocaleString('en-IN')}
                      </p>
                      <span className="text-[10px] font-bold uppercase text-[#8A6518]">
                        {inv.status}
                      </span>
                    </div>
                  </div>
                ))}

                {myPayments.map((pay) => (
                  <div
                    key={pay.id}
                    className="p-3.5 rounded-xl bg-[#F8F1DF]/65 dark:bg-[#081A14] border border-[#D9AD43]/25 flex items-center justify-between gap-2"
                  >
                    <div>
                      <p className="text-xs font-bold text-[#06452C] dark:text-white">
                        Receipt #{pay.receiptNumber}
                      </p>
                      <p className="text-[11px] text-[#5A6D64] dark:text-[#DED7C5]">
                        INR {pay.amount.toLocaleString('en-IN')} · {pay.method} · {pay.paidAt}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => downloadFeeReceiptPdf(pay, settings)}
                      className="min-h-[40px] inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#06452C] text-[#F8F1DF] text-xs font-semibold cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-[#D9AD43]" />
                      <span>Receipt</span>
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};
