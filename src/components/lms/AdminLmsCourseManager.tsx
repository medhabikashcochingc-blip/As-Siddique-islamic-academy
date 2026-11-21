import React, { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Edit3,
  Eye,
  HelpCircle,
  Layers,
  Plus,
  ShieldCheck,
  Trash2,
  Upload,
  Video,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePlatform } from '../../context/PlatformContext';
import {
  ALLOWED_LMS_VIDEO_ACCEPT,
  extractYouTubeId,
  getLmsVideoStorageStatus,
  removeLmsLectureVideo,
  uploadLmsLectureVideo,
  validateLmsVideoFile,
} from '../../lib/lmsVideoUpload';
import {
  LmsCourse,
  LmsCourseChapter,
  LmsLecture,
  LmsLesson,
  LmsMcqQuestion,
} from '../../types/platform';
import { SequentialLmsPlayer } from './SequentialLmsPlayer';

export const AdminLmsCourseManager: React.FC<{ canManageLms: boolean }> = ({ canManageLms }) => {
  const { firebaseUser, userAccount, effectiveRole } = useAuth();
  const {
    courses,
    lessons,
    lmsQuestionBanks,
    classes,
    teachers,
    upsertRecord,
    deleteRecord,
  } = usePlatform();

  const [trackFilter, setTrackFilter] = useState<'all' | 'islamic' | 'general'>('all');
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || 'crs-quran-tajweed');
  const [previewCourse, setPreviewCourse] = useState<LmsCourse | null>(null);
  const [feedback, setFeedback] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Teacher authorization check
  const myTeacherProfile = useMemo(
    () =>
      teachers.find(
        (t) =>
          (userAccount?.uid && t.uid === userAccount.uid) ||
          (userAccount?.linkedTeacherId && t.id === userAccount.linkedTeacherId)
      ),
    [teachers, userAccount?.uid, userAccount?.linkedTeacherId]
  );

  const isCourseAuthorized = (course: LmsCourse): boolean => {
    if (!canManageLms) return false;
    if (['super_admin', 'admin', 'principal'].includes(effectiveRole || '')) return true;
    if (effectiveRole === 'teacher') {
      if (course.teacherUid && course.teacherUid === userAccount?.uid) return true;
      if (myTeacherProfile) {
        return (
          myTeacherProfile.assignedClasses.includes(course.classId) ||
          myTeacherProfile.assignedSubjects.some(
            (s) => s.toLowerCase() === course.subjectName.toLowerCase()
          )
        );
      }
      // Allow managing newly created or unowned demo preview courses if teacher profile not yet linked
      return !course.teacherUid;
    }
    return false;
  };

  // New Course State
  const [showNewCourse, setShowNewCourse] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseClass, setNewCourseClass] = useState('Class 10');
  const [newCourseTrack, setNewCourseTrack] = useState<'islamic' | 'general'>('islamic');
  const [newCourseSubject, setNewCourseSubject] = useState('Quran & Tajweed');
  const [newCourseDesc, setNewCourseDesc] = useState('');
  const [newCourseCert, setNewCourseCert] = useState(true);

  // Chapter Creator State
  const [newChapterTitle, setNewChapterTitle] = useState('');

  // Lesson Editor State
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [lessonChapter, setLessonChapter] = useState('Chapter 1');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonNotes, setLessonNotes] = useState('');
  const [lessonPdfUrl, setLessonPdfUrl] = useState('');
  const [lessonTranscript, setLessonTranscript] = useState('');
  const [lessonLectures, setLessonLectures] = useState<LmsLecture[]>([
    {
      id: `lec_${Date.now()}`,
      title: 'Part 1: Main Video Lecture',
      videoType: 'youtube',
      videoUrl: '',
    },
  ]);
  const [uploadingLectureIdx, setUploadingLectureIdx] = useState<number | null>(null);
  const [uploadPct, setUploadPct] = useState(0);

  // MCQ Quiz Builder State
  const [quizTargetLesson, setQuizTargetLesson] = useState<LmsLesson | null>(null);
  const [passingPercentage, setPassingPercentage] = useState<number>(70);
  const [maxAttempts, setMaxAttempts] = useState<number>(3);
  const [randomizeQuestions, setRandomizeQuestions] = useState<boolean>(false);
  const [mcqDrafts, setMcqDrafts] = useState<LmsMcqQuestion[]>([]);
  const [savingQuiz, setSavingQuiz] = useState(false);

  // New Question Form Inside Quiz Drawer
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [qStem, setQStem] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctIdx, setCorrectIdx] = useState<0 | 1 | 2 | 3>(0);
  const [qExplanation, setQExplanation] = useState('');

  const storageStatus = useMemo(() => getLmsVideoStorageStatus(), []);

  const filteredCourses = useMemo(
    () => (trackFilter === 'all' ? courses : courses.filter((c) => c.track === trackFilter)),
    [courses, trackFilter]
  );

  const selectedCourse = useMemo(
    () =>
      courses.find((c) => c.id === selectedCourseId) ||
      filteredCourses[0] ||
      courses[0],
    [courses, filteredCourses, selectedCourseId]
  );

  const courseLessons = useMemo(
    () =>
      selectedCourse
        ? lessons
            .filter((l) => l.courseId === selectedCourse.id)
            .sort((a, b) => (a.order || 0) - (b.order || 0))
        : [],
    [lessons, selectedCourse]
  );

  const canEditSelectedCourse = selectedCourse ? isCourseAuthorized(selectedCourse) : false;

  if (previewCourse) {
    return (
      <SequentialLmsPlayer
        course={previewCourse}
        previewMode
        studentName={`${userAccount?.displayName || 'Instructor'} (Preview)`}
        onExit={() => setPreviewCourse(null)}
      />
    );
  }

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle.trim()) return;
    setErrorMsg('');
    const id = `crs_${Date.now()}`;
    await upsertRecord(
      'courses',
      id,
      {
        title: newCourseTitle.trim(),
        sessionId: '2026–2027',
        classId: newCourseClass,
        subjectName: newCourseSubject.trim() || 'General',
        track: newCourseTrack,
        instructorName: userAccount?.displayName || 'Academy Faculty',
        teacherUid: userAccount?.uid || '',
        description:
          newCourseDesc.trim() ||
          'Sequential video-based course with chapter lectures and verified MCQ mastery assessments.',
        isPublic: true,
        certificateEnabled: newCourseCert,
        chapters: [{ id: `ch_${Date.now()}`, title: 'Chapter 1: Foundations', order: 1 }],
      },
      `Created LMS course ${newCourseTitle.trim()}`
    );
    setSelectedCourseId(id);
    setNewCourseTitle('');
    setNewCourseDesc('');
    setShowNewCourse(false);
    setFeedback('Course created! Add chapters, video lessons, and MCQ assessments below.');
  };

  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !canEditSelectedCourse || !newChapterTitle.trim()) return;
    const existingChapters = selectedCourse.chapters || [];
    const nextChapter: LmsCourseChapter = {
      id: `ch_${Date.now()}`,
      title: newChapterTitle.trim(),
      order: existingChapters.length + 1,
    };
    await upsertRecord(
      'courses',
      selectedCourse.id,
      {
        chapters: [...existingChapters, nextChapter],
      },
      `Added chapter ${nextChapter.title} to ${selectedCourse.title}`
    );
    setLessonChapter(nextChapter.title);
    setNewChapterTitle('');
    setFeedback(`Added chapter "${nextChapter.title}".`);
  };

  const handleUploadLectureVideo = async (idx: number, file: File | null) => {
    if (!file || !selectedCourse) return;
    setErrorMsg('');
    const check = validateLmsVideoFile(file);
    if (!check.valid) {
      setErrorMsg(check.error || 'Invalid video file.');
      return;
    }

    setUploadingLectureIdx(idx);
    setUploadPct(0);
    try {
      const previousPath = lessonLectures[idx]?.storagePath;
      const result = await uploadLmsLectureVideo(selectedCourse.id, file, setUploadPct);
      if (previousPath && previousPath !== result.storagePath) {
        await removeLmsLectureVideo(previousPath);
      }
      setLessonLectures((prev) =>
        prev.map((lec, i) =>
          i === idx
            ? {
                ...lec,
                videoType: 'upload',
                videoUrl: result.videoUrl,
                storagePath: result.storagePath,
              }
            : lec
        )
      );
      setFeedback('Lecture video uploaded to Firebase Storage.');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to upload video.');
    } finally {
      setUploadingLectureIdx(null);
      setUploadPct(0);
    }
  };

  const resetLessonForm = () => {
    setEditingLessonId(null);
    setLessonTitle('');
    setLessonNotes('');
    setLessonPdfUrl('');
    setLessonTranscript('');
    setLessonLectures([
      {
        id: `lec_${Date.now()}`,
        title: 'Part 1: Main Video Lecture',
        videoType: 'youtube',
        videoUrl: '',
      },
    ]);
  };

  const startEditLesson = (les: LmsLesson) => {
    setEditingLessonId(les.id);
    setLessonChapter(les.chapterTitle || 'Chapter 1');
    setLessonTitle(les.title);
    setLessonNotes(les.notes || '');
    setLessonPdfUrl(les.pdfUrl || '');
    setLessonTranscript(les.transcript || '');
    if (les.lectures && les.lectures.length > 0) {
      setLessonLectures(les.lectures);
    } else {
      setLessonLectures([
        {
          id: `lec_${Date.now()}`,
          title: les.title,
          videoType: les.videoType || (extractYouTubeId(les.videoUrl || '') ? 'youtube' : 'url'),
          videoUrl: les.videoUrl || '',
          storagePath: les.videoStoragePath,
        },
      ]);
    }
    setFeedback('');
    setErrorMsg('');
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !canEditSelectedCourse || !lessonTitle.trim()) return;
    setErrorMsg('');

    const validLectures = lessonLectures
      .filter((l) => l.videoUrl.trim().length > 0)
      .map((l, idx) => ({
        ...l,
        title: l.title.trim() || `Lecture Part ${idx + 1}`,
        videoUrl: l.videoUrl.trim(),
      }));

    if (validLectures.length === 0) {
      setErrorMsg('Please attach at least one YouTube URL, uploaded video, or direct MP4 link.');
      return;
    }

    const existing = editingLessonId
      ? courseLessons.find((l) => l.id === editingLessonId)
      : undefined;
    const lessonId = editingLessonId || `les_${Date.now()}`;
    const primaryLecture = validLectures[0];

    await upsertRecord(
      'lessons',
      lessonId,
      {
        courseId: selectedCourse.id,
        chapterTitle: lessonChapter.trim() || 'Chapter 1',
        title: lessonTitle.trim(),
        order: existing?.order || courseLessons.length + 1,
        videoType: primaryLecture.videoType,
        videoUrl: primaryLecture.videoUrl,
        videoStoragePath: primaryLecture.storagePath || '',
        lectures: validLectures,
        pdfUrl: lessonPdfUrl.trim() || '',
        notes: lessonNotes.trim() || 'Study notes for this lesson.',
        transcript: lessonTranscript.trim() || '',
        passingPercentage: existing?.passingPercentage ?? 70,
        maxAttempts: existing?.maxAttempts ?? 3,
        randomizeQuestions: existing?.randomizeQuestions ?? false,
        teacherUid: userAccount?.uid || '',
      },
      `${editingLessonId ? 'Updated' : 'Created'} video lesson ${lessonTitle.trim()}`
    );

    resetLessonForm();
    setFeedback('Video lesson saved! Now configure its MCQ quiz questions below.');
  };

  const handleMoveLesson = async (idx: number, direction: -1 | 1) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= courseLessons.length || !canEditSelectedCourse) return;
    const current = courseLessons[idx];
    const swap = courseLessons[targetIdx];
    await upsertRecord('lessons', current.id, { order: targetIdx + 1 });
    await upsertRecord('lessons', swap.id, { order: idx + 1 });
    setFeedback('Lesson sequence reordered.');
  };

  const openQuizBuilder = (les: LmsLesson) => {
    const bank = lmsQuestionBanks.find((b) => b.lessonId === les.id);
    setQuizTargetLesson(les);
    setPassingPercentage(bank?.passingPercentage ?? les.passingPercentage ?? 70);
    setMaxAttempts(bank?.maxAttempts ?? les.maxAttempts ?? 3);
    setRandomizeQuestions(bank?.randomizeQuestions ?? les.randomizeQuestions ?? false);
    setMcqDrafts(bank?.questions || []);
    setEditingQuestionId(null);
    setQStem('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setCorrectIdx(0);
    setQExplanation('');
    setErrorMsg('');
  };

  const handleAddOrUpdateDraftQuestion = () => {
    if (!qStem.trim() || !optA.trim() || !optB.trim() || !optC.trim() || !optD.trim()) {
      setErrorMsg('Please enter the question stem and all 4 options (A, B, C, D).');
      return;
    }
    setErrorMsg('');
    const qObj: LmsMcqQuestion = {
      id: editingQuestionId || `q_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      question: qStem.trim(),
      options: [optA.trim(), optB.trim(), optC.trim(), optD.trim()],
      correctIndex: correctIdx,
      explanation: qExplanation.trim() || 'Review the lesson lecture to confirm this concept.',
    };

    if (editingQuestionId) {
      setMcqDrafts((prev) => prev.map((q) => (q.id === editingQuestionId ? qObj : q)));
    } else {
      setMcqDrafts((prev) => [...prev, qObj]);
    }
    setEditingQuestionId(null);
    setQStem('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setCorrectIdx(0);
    setQExplanation('');
  };

  const handleSaveAndSealQuiz = async () => {
    if (!quizTargetLesson || !selectedCourse || !canEditSelectedCourse) return;
    if (mcqDrafts.length < 5 || mcqDrafts.length > 10) {
      setErrorMsg('Each video lesson requires 5 to 10 MCQ questions before publishing.');
      return;
    }
    setSavingQuiz(true);
    setErrorMsg('');
    try {
      const idToken = firebaseUser ? await firebaseUser.getIdToken() : '';
      if (!idToken) {
        throw new Error('Sign in with a verified instructor/admin account to publish MCQ quizzes.');
      }

      const res = await fetch('/api/lms/seal-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          lessonId: quizTargetLesson.id,
          courseId: selectedCourse.id,
          passingPercentage,
          maxAttempts,
          randomizeQuestions,
          questions: mcqDrafts,
        }),
      });
      const sealed = await res.json();
      if (!res.ok || !sealed.ok) {
        throw new Error(sealed.message || 'Unable to seal MCQ answer key.');
      }

      // Persist instructor-only answer bank + student-safe stripped prompts + encrypted sealedAnswerKey
      await upsertRecord(
        'lmsQuestionBanks',
        quizTargetLesson.id,
        {
          id: quizTargetLesson.id,
          lessonId: quizTargetLesson.id,
          courseId: selectedCourse.id,
          teacherUid: userAccount?.uid || '',
          passingPercentage: sealed.passingPercentage,
          maxAttempts: sealed.maxAttempts,
          randomizeQuestions: sealed.randomizeQuestions,
          questions: mcqDrafts,
        },
        `Updated MCQ question bank (${mcqDrafts.length} questions) for ${quizTargetLesson.title}`
      );

      await upsertRecord('lessons', quizTargetLesson.id, {
        passingPercentage: sealed.passingPercentage,
        maxAttempts: sealed.maxAttempts,
        randomizeQuestions: sealed.randomizeQuestions,
        quizQuestionsPublic: sealed.quizQuestionsPublic,
        sealedAnswerKey: sealed.sealedAnswerKey,
      });

      setFeedback(
        `Saved & sealed ${mcqDrafts.length} MCQ questions (Passing: ${sealed.passingPercentage}%, Max Attempts: ${sealed.maxAttempts}).`
      );
      setQuizTargetLesson(null);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save MCQ quiz.');
    } finally {
      setSavingQuiz(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-[#06452C] dark:text-white">
            Sequential Video LMS &amp; Assessment Studio
          </h1>
          <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5]">
            Courses · Chapters · YouTube / MP4 Video Lectures · Sequential MCQ Gating · Student Preview
          </p>
        </div>
        {canManageLms && (
          <button
            type="button"
            onClick={() => setShowNewCourse((v) => !v)}
            className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#06452C] text-white text-xs font-semibold cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#D9AD43]" />
            <span>{showNewCourse ? 'Close Course Form' : 'Create New Course'}</span>
          </button>
        )}
      </div>

      {feedback && (
        <div className="p-3 rounded-lg bg-[#06452C] text-[#F8F1DF] text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#D9AD43] shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-lg bg-[#FDF2F2] border border-[#E5B4B4] text-[#7F1D1D] text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {/* Create Course Panel */}
      {showNewCourse && canManageLms && (
        <form
          onSubmit={handleCreateCourse}
          className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/45 rounded-xl p-5 space-y-3"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-[#8A6518] dark:text-[#D9AD43]">
            Create New Sequential LMS Course
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              type="text"
              required
              placeholder="Course Title (e.g. Tajweed Level 2)"
              value={newCourseTitle}
              onChange={(e) => setNewCourseTitle(e.target.value)}
              className="sm:col-span-2 px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35 rounded-lg"
            />
            <select
              value={newCourseClass}
              onChange={(e) => setNewCourseClass(e.target.value)}
              className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35 rounded-lg"
            >
              {classes.map((c) => (
                <option key={c.id}>{c.name}</option>
              ))}
            </select>
            <select
              value={newCourseTrack}
              onChange={(e) => setNewCourseTrack(e.target.value as 'islamic' | 'general')}
              className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35 rounded-lg"
            >
              <option value="islamic">Islamic Education Wing</option>
              <option value="general">General Education Wing</option>
            </select>
            <input
              type="text"
              required
              placeholder="Subject Name"
              value={newCourseSubject}
              onChange={(e) => setNewCourseSubject(e.target.value)}
              className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35 rounded-lg"
            />
            <input
              type="text"
              placeholder="Course Overview / Description"
              value={newCourseDesc}
              onChange={(e) => setNewCourseDesc(e.target.value)}
              className="sm:col-span-2 px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35 rounded-lg"
            />
            <label className="inline-flex items-center gap-2 text-xs font-medium px-2">
              <input
                type="checkbox"
                checked={newCourseCert}
                onChange={(e) => setNewCourseCert(e.target.checked)}
                className="accent-[#06452C]"
              />
              <span>Issue Completion Certificate</span>
            </label>
          </div>
          <button
            type="submit"
            className="min-h-[44px] px-5 py-2 rounded-lg bg-[#06452C] text-white text-xs font-semibold cursor-pointer"
          >
            Save Course
          </button>
        </form>
      )}

      {/* Course Filter & Selector Cards */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {(
            [
              { key: 'all', label: `All Courses (${courses.length})` },
              {
                key: 'islamic',
                label: `Islamic Education (${courses.filter((c) => c.track === 'islamic').length})`,
              },
              {
                key: 'general',
                label: `General Education (${courses.filter((c) => c.track === 'general').length})`,
              },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTrackFilter(t.key)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                trackFilter === t.key
                  ? 'bg-[#06452C] text-white border-[#06452C]'
                  : 'bg-white dark:bg-[#102D23] border-[#D9AD43]/35'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredCourses.map((c) => {
            const cLessons = lessons.filter((l) => l.courseId === c.id);
            const active = selectedCourse?.id === c.id;
            const authorized = isCourseAuthorized(c);
            return (
              <div
                key={c.id}
                className={`rounded-xl border p-4 transition-colors flex flex-col justify-between gap-3 ${
                  active
                    ? 'bg-[#06452C] text-white border-[#D9AD43]'
                    : 'bg-white dark:bg-[#102D23] border-[#D9AD43]/35'
                }`}
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedCourseId(c.id)}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedCourseId(c.id)}
                  className="cursor-pointer space-y-1"
                >
                  <p
                    className={`text-[11px] font-semibold ${
                      active ? 'text-[#D9AD43]' : 'text-[#8A6518] dark:text-[#D9AD43]'
                    }`}
                  >
                    {c.classId} · {c.subjectName} · {cLessons.length} Lessons
                  </p>
                  <h3 className="font-serif text-lg font-semibold leading-snug">{c.title}</h3>
                  <p className={`text-[11px] ${active ? 'text-[#E6DFCE]' : 'text-[#5A6D64] dark:text-[#DED7C5]'}`}>
                    {c.instructorName} {!authorized && canManageLms ? '· View Only (Unassigned)' : ''}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#D9AD43]/25">
                  <button
                    type="button"
                    onClick={() => setSelectedCourseId(c.id)}
                    className={`text-xs font-semibold cursor-pointer ${
                      active ? 'text-[#D9AD43]' : 'text-[#06452C] dark:text-[#D9AD43]'
                    }`}
                  >
                    {active ? 'Selected Curriculum' : 'Manage Curriculum'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewCourse(c)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                      active
                        ? 'bg-[#D9AD43] text-[#102D23]'
                        : 'bg-[#06452C] text-white'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Course Curriculum, Chapters, Video Lessons & MCQ Builder */}
      {selectedCourse && (
        <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 rounded-xl p-5 sm:p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#D9AD43]/25">
            <div>
              <p className="text-xs font-semibold text-[#8A6518] dark:text-[#D9AD43]">
                {selectedCourse.classId} · {selectedCourse.subjectName}
              </p>
              <h2 className="font-serif text-2xl font-semibold text-[#06452C] dark:text-white">
                {selectedCourse.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setPreviewCourse(selectedCourse)}
              className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D9AD43] text-[#102D23] text-xs font-bold hover:bg-[#e5be5c] cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>Preview Student Learning Experience</span>
            </button>
          </div>

          {!canEditSelectedCourse ? (
            <div className="p-4 rounded-lg bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35 text-xs">
              You are viewing this course in read-only mode. Teachers can modify courses assigned to their
              classes/subjects or courses they created. Use the <strong>Preview</strong> button above to test
              the player.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left 7 Cols: Chapter Creator + Sequential Lesson List + MCQ Modal/Panel */}
              <div className="lg:col-span-7 space-y-5">
                {/* Quick Add Chapter */}
                <form onSubmit={handleAddChapter} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add Chapter Title (e.g. Chapter 2: Madd Rules)"
                    value={newChapterTitle}
                    onChange={(e) => setNewChapterTitle(e.target.value)}
                    className="flex-1 min-h-[44px] px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                  />
                  <button
                    type="submit"
                    className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#102D23] text-[#F8F1DF] border border-[#D9AD43]/40 text-xs font-semibold cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5 text-[#D9AD43]" />
                    <span>Add Chapter</span>
                  </button>
                </form>

                {/* Sequential Lessons List */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#8A6518] dark:text-[#D9AD43]">
                    Sequential Lessons ({courseLessons.length}) — Pass Lesson N MCQ to Unlock N+1
                  </p>

                  {courseLessons.map((les, idx) => {
                    const bank = lmsQuestionBanks.find((b) => b.lessonId === les.id);
                    const qCount = bank?.questions.length ?? les.quizQuestionsPublic?.length ?? 0;
                    const passPct = bank?.passingPercentage ?? les.passingPercentage ?? 70;
                    const lectureCount = les.lectures?.length || (les.videoUrl ? 1 : 0);

                    return (
                      <div
                        key={les.id}
                        className="p-4 rounded-xl bg-[#F8F1DF]/70 dark:bg-[#081A14] border border-[#D9AD43]/30 space-y-3"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-semibold text-[#8A6518] dark:text-[#D9AD43]">
                              #{idx + 1} · {les.chapterTitle}
                            </p>
                            <h3 className="font-serif text-lg font-semibold">{les.title}</h3>
                            <p className="text-[11px] text-[#5A6D64] dark:text-[#DED7C5] tabular-nums mt-0.5">
                              {lectureCount} video lecture(s) · {qCount} MCQ questions · Pass ≥ {passPct}%
                            </p>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => void handleMoveLesson(idx, -1)}
                              aria-label="Move lesson up"
                              className="p-1.5 rounded border border-[#D9AD43]/35 disabled:opacity-35 cursor-pointer"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === courseLessons.length - 1}
                              onClick={() => void handleMoveLesson(idx, 1)}
                              aria-label="Move lesson down"
                              className="p-1.5 rounded border border-[#D9AD43]/35 disabled:opacity-35 cursor-pointer"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2 border-t border-[#D9AD43]/20">
                          <button
                            type="button"
                            onClick={() => startEditLesson(les)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#D9AD43]/40 text-xs font-semibold cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit Video &amp; Notes</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openQuizBuilder(les)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#06452C] text-white text-xs font-semibold cursor-pointer"
                          >
                            <HelpCircle className="w-3.5 h-3.5 text-[#D9AD43]" />
                            <span>Manage MCQ Quiz ({qCount})</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => void deleteRecord('lessons', les.id, `Deleted lesson ${les.title}`)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E5B4B4] text-[#991B1B] dark:text-[#FCA5A5] text-xs font-semibold cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {courseLessons.length === 0 && (
                    <p className="text-xs text-[#5A6D64] p-4 border border-dashed border-[#D9AD43]/40 rounded-lg">
                      No lessons added yet. Use the Video Lesson Builder to create Lesson 01.
                    </p>
                  )}
                </div>

                {/* Inline MCQ Quiz Editor Panel when a lesson is selected */}
                {quizTargetLesson && (
                  <div className="p-5 rounded-xl border-2 border-[#06452C] dark:border-[#D9AD43] bg-[#F8F1DF] dark:bg-[#081A14] space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-[#8A6518] dark:text-[#D9AD43]">
                          MCQ Quiz &amp; Progression Rules · {mcqDrafts.length}/10 Questions (5–10 Required)
                        </p>
                        <h3 className="font-serif text-xl font-semibold">
                          {quizTargetLesson.title}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setQuizTargetLesson(null)}
                        className="text-xs underline cursor-pointer"
                      >
                        Close Editor
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white dark:bg-[#102D23] p-3.5 rounded-lg border border-[#D9AD43]/30">
                      <label className="text-xs space-y-1">
                        <span className="font-semibold block">Passing % (Default 70)</span>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={passingPercentage}
                          onChange={(e) => setPassingPercentage(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded border border-[#D9AD43]/35 bg-[#F8F1DF] dark:bg-[#081A14]"
                        />
                      </label>
                      <label className="text-xs space-y-1">
                        <span className="font-semibold block">Max Attempts</span>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={maxAttempts}
                          onChange={(e) => setMaxAttempts(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded border border-[#D9AD43]/35 bg-[#F8F1DF] dark:bg-[#081A14]"
                        />
                      </label>
                      <label className="flex items-center gap-2 text-xs font-semibold pt-4 sm:pt-5">
                        <input
                          type="checkbox"
                          checked={randomizeQuestions}
                          onChange={(e) => setRandomizeQuestions(e.target.checked)}
                          className="accent-[#06452C]"
                        />
                        <span>Randomize Order</span>
                      </label>
                    </div>

                    {/* Existing Questions in Bank */}
                    <div className="space-y-2">
                      {mcqDrafts.map((q, idx) => (
                        <div
                          key={q.id}
                          className="p-3 rounded-lg bg-white dark:bg-[#102D23] border border-[#D9AD43]/30 text-xs space-y-1.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold">
                              Q{idx + 1}. {q.question}
                            </p>
                            <div className="flex gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingQuestionId(q.id);
                                  setQStem(q.question);
                                  setOptA(q.options[0]);
                                  setOptB(q.options[1]);
                                  setOptC(q.options[2]);
                                  setOptD(q.options[3]);
                                  setCorrectIdx(q.correctIndex);
                                  setQExplanation(q.explanation);
                                }}
                                className="text-[#06452C] dark:text-[#D9AD43] underline cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setMcqDrafts((prev) => prev.filter((item) => item.id !== q.id))
                                }
                                className="text-[#991B1B] underline cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          <p className="text-[11px] text-[#06452C] dark:text-[#34D399]">
                            Correct Answer: {String.fromCharCode(65 + q.correctIndex)}.{' '}
                            {q.options[q.correctIndex]}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Add / Edit Single MCQ Form */}
                    <div className="p-3.5 rounded-lg bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 space-y-2.5">
                      <p className="text-xs font-semibold text-[#8A6518] dark:text-[#D9AD43]">
                        {editingQuestionId ? 'Update MCQ Question' : 'Add New MCQ Question'}
                      </p>
                      <input
                        type="text"
                        placeholder="Question text..."
                        value={qStem}
                        onChange={(e) => setQStem(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Option A"
                          value={optA}
                          onChange={(e) => setOptA(e.target.value)}
                          className="px-3 py-1.5 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="Option B"
                          value={optB}
                          onChange={(e) => setOptB(e.target.value)}
                          className="px-3 py-1.5 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="Option C"
                          value={optC}
                          onChange={(e) => setOptC(e.target.value)}
                          className="px-3 py-1.5 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="Option D"
                          value={optD}
                          onChange={(e) => setOptD(e.target.value)}
                          className="px-3 py-1.5 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <select
                          value={correctIdx}
                          onChange={(e) => setCorrectIdx(Number(e.target.value) as 0 | 1 | 2 | 3)}
                          className="px-3 py-1.5 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                        >
                          <option value={0}>Correct: Option A</option>
                          <option value={1}>Correct: Option B</option>
                          <option value={2}>Correct: Option C</option>
                          <option value={3}>Correct: Option D</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Explanation shown after submission"
                          value={qExplanation}
                          onChange={(e) => setQExplanation(e.target.value)}
                          className="sm:col-span-2 px-3 py-1.5 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddOrUpdateDraftQuestion}
                        className="px-3.5 py-2 rounded-lg border border-[#06452C] text-xs font-semibold text-[#06452C] dark:text-[#D9AD43] cursor-pointer"
                      >
                        {editingQuestionId ? 'Apply Question Edit' : '+ Add Question to Bank'}
                      </button>
                    </div>

                    <button
                      type="button"
                      disabled={savingQuiz || mcqDrafts.length < 5 || mcqDrafts.length > 10}
                      onClick={() => void handleSaveAndSealQuiz()}
                      className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#06452C] text-white text-xs font-bold disabled:opacity-50 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 text-[#D9AD43]" />
                      <span>
                        {savingQuiz
                          ? 'Sealing & Publishing Quiz...'
                          : mcqDrafts.length < 5
                          ? `Add ${5 - mcqDrafts.length} More MCQ(s) (Min 5 Required)`
                          : mcqDrafts.length > 10
                          ? 'Maximum 10 MCQs Allowed per Lesson'
                          : `Save & Seal ${mcqDrafts.length} MCQ Questions`}
                      </span>
                    </button>
                  </div>
                )}
              </div>

              {/* Right 5 Cols: Add / Edit Video Lesson Form */}
              <form
                onSubmit={handleSaveLesson}
                className="lg:col-span-5 bg-[#F8F1DF]/60 dark:bg-[#081A14] border border-[#D9AD43]/35 rounded-xl p-5 space-y-3.5"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#8A6518] dark:text-[#D9AD43]">
                    {editingLessonId ? 'Edit Video Lesson' : 'Add Sequential Video Lesson'}
                  </p>
                  {editingLessonId && (
                    <button
                      type="button"
                      onClick={resetLessonForm}
                      className="text-xs underline cursor-pointer"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  required
                  placeholder="Chapter Title (e.g. Chapter 1)"
                  value={lessonChapter}
                  onChange={(e) => setLessonChapter(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#102D23] border border-[#D9AD43]/30 rounded-lg"
                />
                <input
                  type="text"
                  required
                  placeholder="Lesson Title (e.g. Lesson 01: Makharij Overview)"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#102D23] border border-[#D9AD43]/30 rounded-lg"
                />

                {/* Multiple Lectures Builder */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">Video Lectures ({lessonLectures.length})</span>
                    <button
                      type="button"
                      onClick={() =>
                        setLessonLectures((prev) => [
                          ...prev,
                          {
                            id: `lec_${Date.now()}`,
                            title: `Part ${prev.length + 1}: Video Lecture`,
                            videoType: 'youtube',
                            videoUrl: '',
                          },
                        ])
                      }
                      className="text-xs font-semibold text-[#06452C] dark:text-[#D9AD43] underline cursor-pointer"
                    >
                      + Add Lecture Video
                    </button>
                  </div>

                  {!storageStatus.configured && (
                    <p className="text-[11px] text-[#8A6518] dark:text-[#D9AD43]">
                      {storageStatus.setupMessage}
                    </p>
                  )}

                  {lessonLectures.map((lec, idx) => {
                    const ytId =
                      lec.videoType === 'youtube' ? extractYouTubeId(lec.videoUrl) : null;
                    return (
                      <div
                        key={lec.id}
                        className="p-3 rounded-lg bg-white dark:bg-[#102D23] border border-[#D9AD43]/30 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            placeholder="Lecture Part Title"
                            value={lec.title}
                            onChange={(e) =>
                              setLessonLectures((prev) =>
                                prev.map((item, i) =>
                                  i === idx ? { ...item, title: e.target.value } : item
                                )
                              )
                            }
                            className="flex-1 px-2.5 py-1.5 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded"
                          />
                          {lessonLectures.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setLessonLectures((prev) => prev.filter((_, i) => i !== idx))
                              }
                              className="text-[11px] text-[#991B1B] cursor-pointer"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <select
                          value={lec.videoType}
                          onChange={(e) =>
                            setLessonLectures((prev) =>
                              prev.map((item, i) =>
                                i === idx
                                  ? {
                                      ...item,
                                      videoType: e.target.value as 'youtube' | 'upload' | 'url',
                                    }
                                  : item
                              )
                            )
                          }
                          className="w-full px-2.5 py-1.5 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded"
                        >
                          <option value="youtube">YouTube Embedded Video (URL or ID)</option>
                          <option value="upload">Upload Video from Device (MP4 / WEBM / MOV)</option>
                          <option value="url">Direct MP4 / Web Video URL</option>
                        </select>

                        {lec.videoType === 'upload' ? (
                          <div className="space-y-1.5">
                            <label className="min-h-[44px] flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold border border-dashed border-[#D9AD43] rounded-lg cursor-pointer hover:bg-[#F8F1DF] dark:hover:bg-[#081A14]">
                              <Upload className="w-4 h-4 text-[#8A6518] dark:text-[#D9AD43]" />
                              <span>
                                {uploadingLectureIdx === idx
                                  ? `Uploading ${uploadPct}%...`
                                  : lec.videoUrl
                                  ? 'Replace Uploaded Video'
                                  : 'Select Video from Device (Max 150 MB)'}
                              </span>
                              <input
                                type="file"
                                accept={ALLOWED_LMS_VIDEO_ACCEPT}
                                onChange={(e) =>
                                  void handleUploadLectureVideo(idx, e.target.files?.[0] || null)
                                }
                                className="hidden"
                              />
                            </label>
                            {lec.videoUrl && (
                              <p className="text-[11px] text-[#06452C] dark:text-[#34D399] truncate">
                                Video Ready: {lec.videoUrl}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <input
                              type="text"
                              placeholder={
                                lec.videoType === 'youtube'
                                  ? 'Paste YouTube URL (e.g. https://youtu.be/...) or 11-char ID'
                                  : 'Direct MP4 URL (e.g. https://... or /media/...)'
                              }
                              value={lec.videoUrl}
                              onChange={(e) =>
                                setLessonLectures((prev) =>
                                  prev.map((item, i) =>
                                    i === idx ? { ...item, videoUrl: e.target.value } : item
                                  )
                                )
                              }
                              className="w-full px-2.5 py-1.5 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded"
                            />
                            {lec.videoType === 'youtube' && lec.videoUrl.trim() && (
                              <p
                                className={`text-[11px] ${
                                  ytId
                                    ? 'text-[#06452C] dark:text-[#34D399]'
                                    : 'text-[#8A6518] dark:text-[#D9AD43]'
                                }`}
                              >
                                {ytId
                                  ? `Embedded YouTube Video ID detected: ${ytId}`
                                  : 'Enter a valid YouTube link or 11-character video ID.'}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <input
                  type="url"
                  placeholder="Optional Study Notes / Worksheet PDF URL (https://...)"
                  value={lessonPdfUrl}
                  onChange={(e) => setLessonPdfUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#102D23] border border-[#D9AD43]/30 rounded-lg"
                />

                <textarea
                  rows={3}
                  placeholder="Lesson Study Notes & Homework Guidance"
                  value={lessonNotes}
                  onChange={(e) => setLessonNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#102D23] border border-[#D9AD43]/30 rounded-lg"
                />

                <textarea
                  rows={3}
                  placeholder="Optional Video Transcript (Time-stamped or Full Text)"
                  value={lessonTranscript}
                  onChange={(e) => setLessonTranscript(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#102D23] border border-[#D9AD43]/30 rounded-lg"
                />

                <button
                  type="submit"
                  className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#06452C] text-white text-xs font-bold cursor-pointer"
                >
                  <Video className="w-4 h-4 text-[#D9AD43]" />
                  <span>{editingLessonId ? 'Update Video Lesson' : 'Publish Video Lesson'}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
