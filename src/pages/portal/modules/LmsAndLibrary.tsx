import React, { useMemo, useState } from 'react';
import { Award, BookOpen, CheckCircle2, ExternalLink, HelpCircle, Plus, Upload, Video } from 'lucide-react';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useAuth } from '../../../context/AuthContext';
import { usePlatform } from '../../../context/PlatformContext';
import { DEMO_QUIZZES } from '../../../lib/defaultData';
import { storage } from '../../../lib/firebase';
import { hasPermission } from '../../../lib/permissions';

export const LmsAndLibrary: React.FC<{
  section: 'homework' | 'assignments' | 'lms' | 'courses' | 'live-classes' | 'materials' | 'library';
}> = ({ section }) => {
  const {
    homework,
    assignments,
    submissions,
    courses,
    lessons,
    liveClasses,
    library,
    classes,
    integrations,
    upsertRecord,
  } = usePlatform();
  const { effectiveRole, userAccount } = useAuth();

  const canManageLms = hasPermission(effectiveRole || undefined, 'manage_lms');
  const canManageLib = hasPermission(effectiveRole || undefined, 'manage_library');

  const [hwTitle, setHwTitle] = useState('');
  const [hwClass, setHwClass] = useState('Class 10');
  const [hwSubject, setHwSubject] = useState('Mathematics');
  const [hwDue, setHwDue] = useState('2026-11-30');

  const [courseTitle, setCourseTitle] = useState('');
  const [courseClass, setCourseClass] = useState('Class 10');
  const [courseTrack, setCourseTrack] = useState<'general' | 'islamic'>('islamic');
  const [trackFilter, setTrackFilter] = useState<'all' | 'islamic' | 'general'>('all');

  const [lessonCourseId, setLessonCourseId] = useState(courses[0]?.id || 'crs-quran-tajweed');
  const [lessonChapter, setLessonChapter] = useState('Chapter 2');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonNotes, setLessonNotes] = useState('');
  const [lessonVideoUrl, setLessonVideoUrl] = useState('');

  const [liveTitle, setLiveTitle] = useState('');
  const [liveClass, setLiveClass] = useState('Class 10');
  const [liveLink, setLiveLink] = useState('');
  const [liveStart, setLiveStart] = useState('10:00 AM IST');

  const [libTitle, setLibTitle] = useState('');
  const [libCategory, setLibCategory] = useState('Islamic Books');
  const [libClass, setLibClass] = useState('Class 10');
  const [libSearch, setLibSearch] = useState('');
  const [libFile, setLibFile] = useState<File | null>(null);
  const [libExternalUrl, setLibExternalUrl] = useState('');

  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('academy_completed_lessons');
      return saved ? (JSON.parse(saved) as Record<string, boolean>) : {};
    } catch {
      return {};
    }
  });
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('academy_quiz_answers');
      return saved ? (JSON.parse(saved) as Record<string, number>) : {};
    } catch {
      return {};
    }
  });
  const [submissionText, setSubmissionText] = useState('');
  const [feedback, setFeedback] = useState('');

  const toggleLessonComplete = (lessonId: string) => {
    setCompletedLessons((prev) => {
      const next = { ...prev, [lessonId]: !prev[lessonId] };
      localStorage.setItem('academy_completed_lessons', JSON.stringify(next));
      return next;
    });
  };

  const selectQuizOption = (quizId: string, optionIdx: number) => {
    setQuizAnswers((prev) => {
      const next = { ...prev, [quizId]: optionIdx };
      localStorage.setItem('academy_quiz_answers', JSON.stringify(next));
      return next;
    });
  };

  const overallProgress = useMemo(() => {
    const totalLessons = lessons.length;
    const doneLessons = lessons.filter((l) => completedLessons[l.id]).length;
    const totalQuizzes = DEMO_QUIZZES.length;
    const correctQuizzes = DEMO_QUIZZES.filter((q) => quizAnswers[q.id] === q.correctIndex).length;
    const totalItems = totalLessons + totalQuizzes;
    const doneItems = doneLessons + correctQuizzes;
    return {
      doneLessons,
      totalLessons,
      correctQuizzes,
      totalQuizzes,
      pct: totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0,
    };
  }, [lessons, completedLessons, quizAnswers]);

  const handleAddHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = `hw_${Date.now()}`;
    await upsertRecord('homework', id, {
      title: hwTitle,
      description: 'Assigned via Academy ERP.',
      classId: hwClass,
      subjectName: hwSubject,
      dueDate: hwDue,
      teacherUid: userAccount?.uid || 'staff',
    });
    setHwTitle('');
    setFeedback('Homework published to class.');
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = `crs_${Date.now()}`;
    await upsertRecord('courses', id, {
      title: courseTitle,
      sessionId: '2026–2027',
      classId: courseClass,
      subjectName: courseTrack === 'islamic' ? 'Quran & Islamic Studies' : 'General Subject',
      track: courseTrack,
      instructorName: userAccount?.displayName || 'Academy Faculty',
      description: 'Structured LMS course with recorded lessons, notes, and mastery quizzes.',
      isPublic: true,
    });
    setCourseTitle('');
    setFeedback('LMS Course created.');
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim()) return;
    const id = `les_${Date.now()}`;
    await upsertRecord('lessons', id, {
      courseId: lessonCourseId,
      chapterTitle: lessonChapter.trim() || 'Chapter 1',
      title: lessonTitle.trim(),
      order: lessons.filter((l) => l.courseId === lessonCourseId).length + 1,
      videoUrl: lessonVideoUrl.trim() || undefined,
      notes: lessonNotes.trim() || 'Study notes uploaded via Academy LMS.',
    });
    setLessonTitle('');
    setLessonNotes('');
    setLessonVideoUrl('');
    setFeedback('Recorded lesson & notes published to course.');
  };

  const handleAddLiveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = `live_${Date.now()}`;
    await upsertRecord('liveClasses', id, {
      title: liveTitle,
      classId: liveClass,
      subjectName: 'Interactive Session',
      teacherName: userAccount?.displayName || 'Faculty',
      meetingLink: liveLink,
      startTime: liveStart,
      endTime: '11:00 AM IST',
      status: 'Scheduled',
    });
    setLiveTitle('');
    setLiveLink('');
    setFeedback('Live class scheduled.');
  };

  const handleUploadLibrary = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = `lib_${Date.now()}`;
    let fileUrl = libExternalUrl.trim() || '#resource-pending-url';
    if (libFile && storage) {
      try {
        const snap = await uploadBytes(ref(storage, `library/${id}/${libFile.name}`), libFile);
        fileUrl = await getDownloadURL(snap.ref);
      } catch {
        // Fallback cleanly if Firebase Storage bucket requires console setup
      }
    }
    await upsertRecord('library', id, {
      title: libTitle,
      author: userAccount?.displayName || 'Academy Library',
      category: libCategory,
      classId: libClass,
      subjectName: 'Reference',
      fileUrl,
      allowDownload: true,
    });
    setLibTitle('');
    setLibFile(null);
    setLibExternalUrl('');
    setFeedback('Digital Library resource added.');
  };

  const handleStudentSubmit = async (assignmentId: string) => {
    if (!submissionText.trim()) return;
    const id = `sub_${assignmentId}_${userAccount?.uid || 'stu'}`;
    await upsertRecord('submissions', id, {
      assignmentId,
      studentId: userAccount?.linkedStudentId || 'STU-SELF',
      studentUid: userAccount?.uid || 'anon',
      studentName: userAccount?.displayName || 'Student',
      submissionText,
      status: 'submitted',
    });
    setSubmissionText('');
    setFeedback('Assignment submission recorded.');
  };

  const filteredCourses = useMemo(
    () => (trackFilter === 'all' ? courses : courses.filter((c) => c.track === trackFilter)),
    [courses, trackFilter]
  );

  return (
    <div className="space-y-6">
      {feedback && (
        <div className="p-3 rounded-lg bg-[#06452C] text-[#F8F1DF] text-xs font-medium">
          {feedback}
        </div>
      )}

      {(section === 'homework' || section === 'assignments') && (
        <div className="space-y-5">
          <h1 className="font-serif text-3xl font-semibold text-[#06452C] dark:text-white">
            {section === 'homework' ? 'Homework Management' : 'Assignments & Evaluations'}
          </h1>

          {canManageLms && (
            <form
              onSubmit={handleAddHomework}
              className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-4 gap-3"
            >
              <input
                type="text"
                required
                placeholder="Task Title"
                value={hwTitle}
                onChange={(e) => setHwTitle(e.target.value)}
                className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
              />
              <select
                value={hwClass}
                onChange={(e) => setHwClass(e.target.value)}
                className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
              >
                {classes.map((c) => (
                  <option key={c.id}>{c.name}</option>
                ))}
              </select>
              <input
                type="text"
                required
                placeholder="Subject"
                value={hwSubject}
                onChange={(e) => setHwSubject(e.target.value)}
                className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
              />
              <div className="flex gap-2">
                <input
                  type="date"
                  value={hwDue}
                  onChange={(e) => setHwDue(e.target.value)}
                  className="flex-1 px-2 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                />
                <button
                  type="submit"
                  className="px-3 py-2 text-xs font-semibold bg-[#06452C] text-white rounded-lg cursor-pointer"
                >
                  Assign
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(section === 'homework' ? homework : assignments).map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-5 space-y-3"
              >
                <p className="text-xs font-semibold text-[#8A6518] dark:text-[#D9AD43] tabular-nums">
                  {item.classId} · {item.subjectName} · Due {item.dueDate}
                </p>
                <h3 className="font-serif text-xl font-semibold">{item.title}</h3>
                <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5]">
                  {'description' in item ? item.description : item.instructions}
                </p>
                {!canManageLms && (
                  <div className="flex gap-2 pt-2">
                    <input
                      type="text"
                      value={submissionText}
                      onChange={(e) => setSubmissionText(e.target.value)}
                      placeholder="Write answer or attach note link..."
                      className="flex-1 px-3 py-1.5 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => void handleStudentSubmit(item.id)}
                      className="px-3 py-1.5 text-xs font-semibold bg-[#06452C] text-white rounded-lg cursor-pointer"
                    >
                      Submit
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {submissions.length > 0 && (
            <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-5">
              <h3 className="font-serif text-xl font-semibold mb-3">Recent Submissions</h3>
              {submissions.map((sub) => (
                <div key={sub.id} className="py-2 text-xs flex justify-between border-t border-[#EFE6D2] dark:border-[#D9AD43]/20">
                  <span>
                    <strong>{sub.studentName}</strong>: {sub.submissionText}
                  </span>
                  <span className="uppercase font-semibold">{sub.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {(section === 'lms' || section === 'courses' || section === 'materials') && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl font-semibold text-[#06452C] dark:text-white">
                Islamic &amp; General Online LMS
              </h1>
              <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5]">
                Quran &amp; Tajweed · Arabic Language · Hadith &amp; Seerah · Aqeedah &amp; Fiqh · General Subjects · Quizzes &amp; Progress
              </p>
            </div>

            <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl px-4 py-3 min-w-[240px]">
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="text-[#8A6518] dark:text-[#D9AD43]">Overall LMS Mastery</span>
                <span className="tabular-nums">{overallProgress.pct}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#EFE6D2] dark:bg-[#081A14] overflow-hidden">
                <div
                  className="h-full bg-[#06452C] dark:bg-[#D9AD43] transition-all"
                  style={{ width: `${overallProgress.pct}%` }}
                />
              </div>
              <p className="text-[11px] text-[#5A6D64] dark:text-[#DED7C5] mt-1 tabular-nums">
                {overallProgress.doneLessons}/{overallProgress.totalLessons} Lessons ·{' '}
                {overallProgress.correctQuizzes}/{overallProgress.totalQuizzes} Quizzes Passed
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {(
              [
                { key: 'all', label: `All Courses (${courses.length})` },
                { key: 'islamic', label: `Islamic Education (${courses.filter((c) => c.track === 'islamic').length})` },
                { key: 'general', label: `General Education (${courses.filter((c) => c.track === 'general').length})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setTrackFilter(tab.key)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                  trackFilter === tab.key
                    ? 'bg-[#06452C] text-white border-[#06452C]'
                    : 'bg-white dark:bg-[#102D23] border-[#D9AD43]/35'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {canManageLms && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <form
                onSubmit={handleAddCourse}
                className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 rounded-xl p-5 space-y-3"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-[#8A6518] dark:text-[#D9AD43]">
                  Create New LMS Course
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Course Title"
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    className="sm:col-span-3 px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                  />
                  <select
                    value={courseClass}
                    onChange={(e) => setCourseClass(e.target.value)}
                    className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                  >
                    {classes.map((c) => (
                      <option key={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <select
                    value={courseTrack}
                    onChange={(e) => setCourseTrack(e.target.value as 'general' | 'islamic')}
                    className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                  >
                    <option value="islamic">Islamic Education</option>
                    <option value="general">General Education</option>
                  </select>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-1 px-4 py-2 text-xs font-semibold bg-[#06452C] text-white rounded-lg cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Course</span>
                  </button>
                </div>
              </form>

              <form
                onSubmit={handleAddLesson}
                className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 rounded-xl p-5 space-y-3"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-[#8A6518] dark:text-[#D9AD43]">
                  Publish Recorded Lesson / Study Note
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={lessonCourseId}
                    onChange={(e) => setLessonCourseId(e.target.value)}
                    className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    required
                    placeholder="Chapter (e.g. Chapter 2)"
                    value={lessonChapter}
                    onChange={(e) => setLessonChapter(e.target.value)}
                    className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Lesson Title"
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                  />
                  <input
                    type="url"
                    placeholder="Recorded Video URL (Optional)"
                    value={lessonVideoUrl}
                    onChange={(e) => setLessonVideoUrl(e.target.value)}
                    className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Lesson Summary / Study Notes"
                    value={lessonNotes}
                    onChange={(e) => setLessonNotes(e.target.value)}
                    className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-1 px-4 py-2 text-xs font-semibold bg-[#06452C] text-white rounded-lg cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Publish Lesson</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCourses.map((course) => {
              const courseLessons = lessons.filter((l) => l.courseId === course.id);
              const doneInCourse = courseLessons.filter((l) => completedLessons[l.id]).length;
              const pct = courseLessons.length
                ? Math.round((doneInCourse / courseLessons.length) * 100)
                : 0;

              return (
                <div
                  key={course.id}
                  className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-6 space-y-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold text-[#8A6518] dark:text-[#D9AD43]">
                        {course.sessionId} · {course.classId} · {course.subjectName}
                      </p>
                      <h2 className="font-serif text-2xl font-semibold">{course.title}</h2>
                    </div>
                    <BookOpen className="w-5 h-5 text-[#D9AD43] shrink-0" />
                  </div>
                  <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5]">{course.description}</p>

                  <div>
                    <div className="flex justify-between text-[11px] font-semibold mb-1">
                      <span>Lesson Progress</span>
                      <span className="tabular-nums">
                        {doneInCourse}/{courseLessons.length} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#EFE6D2] dark:bg-[#081A14] overflow-hidden">
                      <div
                        className="h-full bg-[#06452C] dark:bg-[#D9AD43]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-[#EFE6D2] dark:border-[#D9AD43]/20">
                    {courseLessons.map((les) => (
                      <div
                        key={les.id}
                        className="p-3 rounded-lg bg-[#F8F1DF] dark:bg-[#081A14] flex flex-wrap items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-[#8A6518] dark:text-[#D9AD43]">
                            {les.chapterTitle}
                          </p>
                          <p className="font-medium">{les.title}</p>
                          <p className="text-[11px] text-[#5A6D64] dark:text-[#DED7C5] mt-0.5">
                            {les.notes}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {les.videoUrl && (
                            <a
                              href={les.videoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1 border border-[#D9AD43]/40 rounded inline-flex items-center gap-1"
                            >
                              <Video className="w-3 h-3" /> Watch
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              setBookmarks((p) => ({ ...p, [les.id]: !p[les.id] }))
                            }
                            className="px-2 py-1 border border-[#D9AD43]/40 rounded cursor-pointer"
                          >
                            {bookmarks[les.id] ? 'Bookmarked' : 'Bookmark'}
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleLessonComplete(les.id)}
                            className={`px-2 py-1 rounded cursor-pointer ${
                              completedLessons[les.id]
                                ? 'bg-[#06452C] text-white'
                                : 'border border-[#06452C] dark:border-[#D9AD43]'
                            }`}
                          >
                            {completedLessons[les.id] ? 'Completed' : 'Mark Complete'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Course Quizzes & Progress Check */}
          <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 rounded-xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#8A6518] dark:text-[#D9AD43]">
                  Interactive Self-Assessment
                </p>
                <h2 className="font-serif text-2xl font-semibold text-[#06452C] dark:text-white">
                  Quran, Arabic, Hadith, Fiqh &amp; General Concept Quizzes
                </h2>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#06452C] text-[#F8F1DF] text-xs font-semibold">
                <Award className="w-3.5 h-3.5 text-[#D9AD43]" />
                Score: {overallProgress.correctQuizzes} / {overallProgress.totalQuizzes}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DEMO_QUIZZES.map((q) => {
                const chosen = quizAnswers[q.id];
                const isAnswered = chosen !== undefined;
                const isCorrect = chosen === q.correctIndex;
                return (
                  <div
                    key={q.id}
                    className="p-4 rounded-xl bg-[#F8F1DF]/70 dark:bg-[#081A14] border border-[#D9AD43]/30 space-y-2.5"
                  >
                    <div className="flex items-start gap-2">
                      <HelpCircle className="w-4 h-4 text-[#8A6518] dark:text-[#D9AD43] shrink-0 mt-0.5" />
                      <p className="text-xs sm:text-sm font-semibold">{q.question}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, idx) => {
                        const selected = chosen === idx;
                        const correctOpt = isAnswered && idx === q.correctIndex;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => selectQuizOption(q.id, idx)}
                            className={`text-left px-3 py-2 rounded-lg text-xs border transition-colors cursor-pointer ${
                              correctOpt
                                ? 'bg-[#06452C] text-white border-[#06452C]'
                                : selected
                                ? 'bg-[#FDF2F2] text-[#7F1D1D] border-[#E5B4B4]'
                                : 'bg-white dark:bg-[#102D23] border-[#D9AD43]/30 hover:border-[#06452C]'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {isAnswered && (
                      <p
                        className={`text-[11px] font-medium ${
                          isCorrect
                            ? 'text-[#06452C] dark:text-[#A9D5BE]'
                            : 'text-[#8A6518] dark:text-[#D9AD43]'
                        }`}
                      >
                        {isCorrect ? 'Correct: ' : 'Note: '}
                        {q.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {section === 'live-classes' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl font-semibold text-[#06452C] dark:text-white">
                Live Class Management
              </h1>
              <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5]">
                Video Provider Status:{' '}
                <strong>
                  {integrations?.videoConferencing.configured
                    ? integrations.videoConferencing.provider
                    : 'Not Configured on server — add authorized Zoom / Google Meet / Jitsi meeting links manually below'}
                </strong>
              </p>
            </div>
          </div>

          {canManageLms && (
            <form
              onSubmit={handleAddLiveClass}
              className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-4 gap-3"
            >
              <input
                type="text"
                required
                placeholder="Live Session Title"
                value={liveTitle}
                onChange={(e) => setLiveTitle(e.target.value)}
                className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
              />
              <select
                value={liveClass}
                onChange={(e) => setLiveClass(e.target.value)}
                className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
              >
                {classes.map((c) => (
                  <option key={c.id}>{c.name}</option>
                ))}
              </select>
              <input
                type="url"
                placeholder="Authorized Meeting URL (https://...)"
                value={liveLink}
                onChange={(e) => setLiveLink(e.target.value)}
                className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={liveStart}
                  onChange={(e) => setLiveStart(e.target.value)}
                  className="flex-1 px-2 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                />
                <button
                  type="submit"
                  className="px-3 py-2 text-xs font-semibold bg-[#06452C] text-white rounded-lg cursor-pointer"
                >
                  Schedule
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveClasses.map((lv) => (
              <div
                key={lv.id}
                className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-5 flex justify-between items-center gap-4"
              >
                <div>
                  <p className="text-xs font-semibold text-[#8A6518] dark:text-[#D9AD43]">
                    {lv.classId} · {lv.startTime} – {lv.endTime}
                  </p>
                  <h3 className="font-serif text-xl font-semibold">{lv.title}</h3>
                  <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5]">{lv.teacherName}</p>
                </div>
                {lv.meetingLink ? (
                  <a
                    href={lv.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#06452C] text-white rounded-lg"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Join</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-xs text-[#8A6518] dark:text-[#D9AD43] font-medium">
                    Not Configured
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {section === 'library' && (
        <div className="space-y-5">
          <div>
            <h1 className="font-serif text-3xl font-semibold text-[#06452C] dark:text-white">
              Digital Library (General, Islamic, Arabic &amp; Quran Resources)
            </h1>
            {!storage && (
              <p className="text-xs text-[#8A6518] dark:text-[#D9AD43] mt-1">
                Firebase Storage Bucket Status: Not Configured — add library catalog entries with an
                external HTTPS PDF URL below without requiring Firebase Storage.
              </p>
            )}
          </div>

          {canManageLib && (
            <form
              onSubmit={handleUploadLibrary}
              className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-5 gap-3"
            >
              <input
                type="text"
                required
                placeholder="Book / PDF Title"
                value={libTitle}
                onChange={(e) => setLibTitle(e.target.value)}
                className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
              />
              <select
                value={libCategory}
                onChange={(e) => setLibCategory(e.target.value)}
                className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
              >
                <option>General School Books</option>
                <option>Islamic Books</option>
                <option>Arabic Resources</option>
                <option>Quran Learning</option>
                <option>Subject Notes</option>
              </select>
              <select
                value={libClass}
                onChange={(e) => setLibClass(e.target.value)}
                className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
              >
                {classes.map((c) => (
                  <option key={c.id}>{c.name}</option>
                ))}
              </select>
              <input
                type="url"
                placeholder="Optional PDF URL (https://...)"
                value={libExternalUrl}
                onChange={(e) => setLibExternalUrl(e.target.value)}
                className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
              />
              <div className="flex gap-2">
                <label className="flex-1 flex items-center gap-1 px-2 py-2 text-xs border border-[#D9AD43]/40 rounded-lg cursor-pointer truncate">
                  <Upload className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{libFile ? libFile.name : 'PDF File'}</span>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setLibFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
                <button
                  type="submit"
                  className="px-3 py-2 text-xs font-semibold bg-[#06452C] text-white rounded-lg cursor-pointer"
                >
                  Add
                </button>
              </div>
            </form>
          )}

          <input
            type="text"
            value={libSearch}
            onChange={(e) => setLibSearch(e.target.value)}
            placeholder="Filter library by title, category, or class..."
            className="max-w-sm w-full px-3.5 py-2 text-xs bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-lg"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {library
              .filter(
                (item) =>
                  item.title.toLowerCase().includes(libSearch.toLowerCase()) ||
                  item.category.toLowerCase().includes(libSearch.toLowerCase()) ||
                  item.classId.toLowerCase().includes(libSearch.toLowerCase())
              )
              .map((res) => (
                <div
                  key={res.id}
                  className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-5 flex flex-col justify-between"
                >
                  <div>
                    <p className="text-xs font-semibold text-[#8A6518] dark:text-[#D9AD43]">
                      {res.category} · {res.classId}
                    </p>
                    <h3 className="font-serif text-xl font-semibold mt-1">{res.title}</h3>
                    <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5] mt-1">By {res.author}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#EFE6D2] dark:border-[#D9AD43]/20 flex justify-between items-center text-xs">
                    <span className="inline-flex items-center gap-1 text-[#06452C] dark:text-[#D9AD43]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {res.allowDownload ? 'Download Permitted' : 'View Only'}
                    </span>
                    {res.fileUrl.startsWith('http') ? (
                      <a
                        href={res.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold underline"
                      >
                        Open PDF
                      </a>
                    ) : (
                      <span className="text-[11px] text-[#5A6D64]">Catalog Entry</span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
