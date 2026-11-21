import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Download,
  FileText,
  HelpCircle,
  ListVideo,
  Lock,
  Maximize2,
  MessageSquare,
  Minimize2,
  Play,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Unlock,
  Video,
  XCircle,
} from 'lucide-react';
import { AcademyEmblem } from '../AcademyEmblem';
import { TeacherPhoto } from '../TeacherPhoto';
import { useAuth } from '../../context/AuthContext';
import { usePlatform } from '../../context/PlatformContext';
import { extractYouTubeId } from '../../lib/lmsVideoUpload';
import { downloadCourseCompletionCertificatePdf } from '../../lib/pdfGenerator';
import {
  LmsCourse,
  LmsCourseProgress,
  LmsLecture,
  LmsLesson,
  LmsLessonProgress,
  LmsPublicMcqQuestion,
  LmsQuizAttempt,
} from '../../types/platform';

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: HTMLElement | string,
        config: {
          videoId: string;
          playerVars?: Record<string, string | number>;
          events?: {
            onReady?: (event: { target: YTPlayerInstance }) => void;
            onStateChange?: (event: { data: number; target: YTPlayerInstance }) => void;
            onError?: (event: { data: number }) => void;
          };
        }
      ) => YTPlayerInstance;
      PlayerState: {
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YTPlayerInstance {
  getCurrentTime: () => number;
  getDuration: () => number;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  destroy: () => void;
}

type PlayerTab = 'quiz' | 'notes' | 'transcript' | 'qa';

interface SequentialLmsPlayerProps {
  course: LmsCourse;
  initialLessonId?: string;
  studentId?: string;
  studentName?: string;
  previewMode?: boolean;
  onExit: () => void;
}

function formatDuration(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function loadYouTubeApi(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.YT && window.YT.Player) return Promise.resolve();

  return new Promise((resolve) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://www.youtube.com/iframe_api"]'
    );
    const prevCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prevCallback) prevCallback();
      resolve();
    };
    if (!existingScript) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      document.head.appendChild(tag);
    }
  });
}

function buildLessonLectures(lesson: LmsLesson): LmsLecture[] {
  if (lesson.lectures && lesson.lectures.length > 0) {
    return lesson.lectures;
  }
  const rawUrl = lesson.videoUrl || '';
  const detectedType: LmsLecture['videoType'] =
    lesson.videoType || (extractYouTubeId(rawUrl) ? 'youtube' : 'url');
  return [
    {
      id: `${lesson.id}-main`,
      title: lesson.title,
      videoType: detectedType,
      videoUrl: rawUrl,
      storagePath: lesson.videoStoragePath,
      durationSeconds: lesson.durationSeconds,
      transcript: lesson.transcript,
    },
  ];
}

export const SequentialLmsPlayer: React.FC<SequentialLmsPlayerProps> = ({
  course,
  initialLessonId,
  studentId,
  studentName,
  previewMode = false,
  onExit,
}) => {
  const { firebaseUser, userAccount, effectiveRole } = useAuth();
  const { lessons, teachers, lmsProgress, lmsQa, settings, upsertRecord } = usePlatform();

  const orderedLessons = useMemo(
    () =>
      lessons
        .filter((l) => l.courseId === course.id)
        .sort((a, b) => (a.order || 0) - (b.order || 0)),
    [lessons, course.id]
  );

  const orderedLessonIds = useMemo(() => orderedLessons.map((l) => l.id), [orderedLessons]);
  const progressDocId = `${userAccount?.uid || 'anon'}_${course.id}`;

  const remoteProgress = useMemo(
    () =>
      lmsProgress.find(
        (p) => p.id === progressDocId || (p.courseId === course.id && p.studentUid === userAccount?.uid)
      ),
    [lmsProgress, progressDocId, course.id, userAccount?.uid]
  );

  const [previewProgress, setPreviewProgress] = useState<LmsCourseProgress | null>(null);

  const effectiveProgress: LmsCourseProgress = useMemo(() => {
    if (previewMode && previewProgress) return previewProgress;
    if (remoteProgress) return remoteProgress;
    const firstId = orderedLessonIds[0];
    return {
      id: progressDocId,
      studentUid: userAccount?.uid || 'preview',
      studentId: studentId || userAccount?.linkedStudentId || 'STU-SELF',
      studentName: studentName || userAccount?.displayName || 'Student',
      courseId: course.id,
      courseTitle: course.title,
      courseCompletionPercent: 0,
      completedLessonIds: [],
      unlockedLessonIds: firstId ? [firstId] : [],
      passedLessonIds: [],
      lastWatchedLessonId: firstId,
      lessonProgress: {},
    };
  }, [
    previewMode,
    previewProgress,
    remoteProgress,
    orderedLessonIds,
    progressDocId,
    userAccount?.uid,
    userAccount?.linkedStudentId,
    userAccount?.displayName,
    studentId,
    studentName,
    course.id,
    course.title,
  ]);

  const [activeLessonId, setActiveLessonId] = useState<string>(() => {
    if (initialLessonId && orderedLessonIds.includes(initialLessonId)) return initialLessonId;
    if (
      remoteProgress?.lastWatchedLessonId &&
      orderedLessonIds.includes(remoteProgress.lastWatchedLessonId)
    ) {
      return remoteProgress.lastWatchedLessonId;
    }
    return orderedLessonIds[0] || '';
  });

  useEffect(() => {
    if (!activeLessonId && orderedLessonIds[0]) {
      setActiveLessonId(orderedLessonIds[0]);
    }
  }, [activeLessonId, orderedLessonIds]);

  const activeLessonIndex = orderedLessons.findIndex((l) => l.id === activeLessonId);
  const activeLesson = orderedLessons[activeLessonIndex] || orderedLessons[0];
  const lectures = useMemo(
    () => (activeLesson ? buildLessonLectures(activeLesson) : []),
    [activeLesson]
  );
  const [activeLectureIdx, setActiveLectureIdx] = useState(0);
  useEffect(() => {
    setActiveLectureIdx(0);
  }, [activeLessonId]);

  const activeLecture = lectures[activeLectureIdx] || lectures[0];
  const isLessonUnlocked = useCallback(
    (lessonId: string, idx: number) => {
      if (idx === 0) return true;
      if (effectiveProgress.unlockedLessonIds.includes(lessonId)) return true;
      const prevLesson = orderedLessons[idx - 1];
      return Boolean(prevLesson && effectiveProgress.passedLessonIds.includes(prevLesson.id));
    },
    [effectiveProgress.unlockedLessonIds, effectiveProgress.passedLessonIds, orderedLessons]
  );

  const activeLessonProgress: LmsLessonProgress = useMemo(() => {
    const existing = activeLesson ? effectiveProgress.lessonProgress?.[activeLesson.id] : undefined;
    if (existing) return existing;
    return {
      lessonId: activeLesson?.id || '',
      videoWatchSeconds: 0,
      durationSeconds: activeLesson?.durationSeconds || 0,
      maxWatchedPercent: 0,
      lastPlaybackPosition: 0,
      videoCompleted: false,
      unlocked: true,
      passed: false,
      bestScorePercent: 0,
      attemptsCount: 0,
      attempts: [],
      updatedAt: new Date().toISOString(),
    };
  }, [activeLesson, effectiveProgress.lessonProgress]);

  const [activeTab, setActiveTab] = useState<PlayerTab>('quiz');
  const [autoNext, setAutoNext] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mobilePlaylistRef = useRef<HTMLDivElement | null>(null);

  const courseInstructor = useMemo(
    () =>
      teachers.find(
        (t) =>
          t.name === course.instructorName ||
          t.assignedSubjects.some((s) => s.toLowerCase() === course.subjectName.toLowerCase()) ||
          t.assignedClasses.includes(course.classId)
      ) || teachers[0],
    [teachers, course.instructorName, course.subjectName, course.classId]
  );

  // Playback tracking state & anti-skip guard refs
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const htmlVideoRef = useRef<HTMLVideoElement | null>(null);
  const ytContainerRef = useRef<HTMLDivElement | null>(null);
  const ytPlayerRef = useRef<YTPlayerInstance | null>(null);
  const maxAllowedSecRef = useRef<number>(0);
  const watchedBucketsRef = useRef<Set<number>>(new Set());
  const lastSavedSecRef = useRef<number>(0);
  const verifyingCompletionRef = useRef<boolean>(false);

  const [currentSec, setCurrentSec] = useState<number>(0);
  const [durationSec, setDurationSec] = useState<number>(activeLecture?.durationSeconds || 0);
  const [liveWatchedPct, setLiveWatchedPct] = useState<number>(activeLessonProgress.maxWatchedPercent || 0);
  const [videoError, setVideoError] = useState<string>('');
  const [skipNotice, setSkipNotice] = useState<string>('');
  const [bannerMessage, setBannerMessage] = useState<string>('');

  // Reset per-lesson playback tracking refs when switching lessons
  useEffect(() => {
    const startSec = activeLessonProgress.lastPlaybackPosition || 0;
    const savedWatched = Math.max(startSec, activeLessonProgress.videoWatchSeconds || 0);
    maxAllowedSecRef.current = savedWatched;
    watchedBucketsRef.current = new Set();
    for (let s = 0; s < Math.floor(savedWatched); s++) {
      watchedBucketsRef.current.add(s);
    }
    lastSavedSecRef.current = 0;
    verifyingCompletionRef.current = false;
    setCurrentSec(startSec);
    setDurationSec(activeLessonProgress.durationSeconds || activeLecture?.durationSeconds || 0);
    setLiveWatchedPct(activeLessonProgress.maxWatchedPercent || 0);
    setVideoError('');
    setSkipNotice('');
  }, [activeLessonId, activeLectureIdx]);

  const persistProgress = useCallback(
    async (nextProgress: LmsCourseProgress, auditDetail?: string) => {
      if (previewMode) {
        setPreviewProgress(nextProgress);
        return;
      }
      if (!userAccount?.uid) return;
      await upsertRecord('lmsProgress', nextProgress.id, nextProgress as unknown as Record<string, unknown>, auditDetail);
    },
    [previewMode, userAccount?.uid, upsertRecord]
  );

  const saveVideoCheckpoint = useCallback(
    async (
      posSec: number,
      totalDur: number,
      pct: number,
      markCompleted?: { videoCompleted: boolean; watchProofToken?: string }
    ) => {
      if (!activeLesson) return;
      const prevLessonProg = effectiveProgress.lessonProgress?.[activeLesson.id] || activeLessonProgress;
      const updatedLessonProg: LmsLessonProgress = {
        ...prevLessonProg,
        lessonId: activeLesson.id,
        videoWatchSeconds: Math.max(prevLessonProg.videoWatchSeconds || 0, Math.round(maxAllowedSecRef.current)),
        durationSeconds: Math.max(prevLessonProg.durationSeconds || 0, Math.round(totalDur)),
        maxWatchedPercent: Math.max(prevLessonProg.maxWatchedPercent || 0, Math.min(100, Math.round(pct))),
        lastPlaybackPosition: Math.round(posSec),
        videoCompleted: Boolean(markCompleted?.videoCompleted || prevLessonProg.videoCompleted),
        watchProofToken: markCompleted?.watchProofToken || prevLessonProg.watchProofToken,
        unlocked: true,
        updatedAt: new Date().toISOString(),
      };

      const nextProgress: LmsCourseProgress = {
        ...effectiveProgress,
        lastWatchedLessonId: activeLesson.id,
        lessonProgress: {
          ...effectiveProgress.lessonProgress,
          [activeLesson.id]: updatedLessonProg,
        },
      };

      await persistProgress(nextProgress);
    },
    [activeLesson, activeLessonProgress, effectiveProgress, persistProgress]
  );

  const triggerVerifyVideoCompletion = useCallback(
    async (posSec: number, totalDur: number) => {
      if (!activeLesson || verifyingCompletionRef.current) return;
      if (activeLessonProgress.videoCompleted && activeLessonProgress.watchProofToken) return;

      verifyingCompletionRef.current = true;
      const uniqueSecWatched = Math.max(watchedBucketsRef.current.size, Math.round(maxAllowedSecRef.current));
      const safeDur = Math.max(totalDur, posSec, 3);
      const coverage = Math.min(1, uniqueSecWatched / safeDur);
      const watchedPct = Math.min(100, Math.round(Math.max((posSec / safeDur) * 100, (uniqueSecWatched / safeDur) * 100)));

      try {
        const idToken = firebaseUser ? await firebaseUser.getIdToken() : '';
        let verifiedCompleted = false;
        let proofToken: string | undefined;

        if (idToken) {
          const res = await fetch('/api/lms/verify-video-watch', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({
              courseId: course.id,
              lessonId: activeLesson.id,
              watchedSeconds: uniqueSecWatched,
              durationSeconds: safeDur,
              maxWatchedPercent: watchedPct,
              continuousCoverageRatio: coverage,
            }),
          });
          const data = (await res.json()) as {
            videoCompleted: boolean;
            watchProofToken?: string;
            reason?: string;
          };
          verifiedCompleted = Boolean(data.videoCompleted);
          proofToken = data.watchProofToken;
          if (!verifiedCompleted && data.reason) {
            setSkipNotice(data.reason);
          }
        } else if (previewMode && watchedPct >= 90) {
          verifiedCompleted = true;
          proofToken = 'preview-mode-token';
        }

        if (verifiedCompleted) {
          setLiveWatchedPct(100);
          await saveVideoCheckpoint(posSec, safeDur, 100, {
            videoCompleted: true,
            watchProofToken: proofToken,
          });
          setBannerMessage(
            `Video lecture completed for "${activeLesson.title}". Your MCQ assessment is now unlocked.`
          );
          setActiveTab('quiz');
        }
      } catch {
        setSkipNotice('Unable to verify video completion right now. Please check your connection.');
      } finally {
        verifyingCompletionRef.current = false;
      }
    },
    [
      activeLesson,
      activeLessonProgress.videoCompleted,
      activeLessonProgress.watchProofToken,
      course.id,
      firebaseUser,
      previewMode,
      saveVideoCheckpoint,
    ]
  );

  // Advance to next video lecture within same lesson, OR trigger lesson completion
  const handleLectureEnded = useCallback(
    async (totalDur: number) => {
      if (activeLectureIdx + 1 < lectures.length) {
        setBannerMessage(`Lecture Part ${activeLectureIdx + 1} completed. Loading next lecture part...`);
        if (autoNext) {
          setActiveLectureIdx((i) => i + 1);
        }
        return;
      }
      await triggerVerifyVideoCompletion(totalDur, totalDur);
    },
    [activeLectureIdx, lectures.length, autoNext, triggerVerifyVideoCompletion]
  );

  // YouTube Player lifecycle
  const youtubeId = useMemo(
    () => (activeLecture ? extractYouTubeId(activeLecture.videoUrl) : null),
    [activeLecture]
  );

  useEffect(() => {
    if (!youtubeId || !ytContainerRef.current) return;
    let cancelled = false;
    let intervalId: number | null = null;

    void loadYouTubeApi().then(() => {
      if (cancelled || !ytContainerRef.current || !window.YT?.Player) return;
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch {
          // Ignore stale destroy error
        }
      }

      ytPlayerRef.current = new window.YT.Player(ytContainerRef.current, {
        videoId: youtubeId,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (ev) => {
            if (cancelled) return;
            const d = ev.target.getDuration() || activeLecture?.durationSeconds || 0;
            if (d > 0) setDurationSec(d);
            if (activeLessonProgress.lastPlaybackPosition > 2 && activeLessonProgress.lastPlaybackPosition < d - 2) {
              ev.target.seekTo(activeLessonProgress.lastPlaybackPosition, true);
            }
          },
          onStateChange: (ev) => {
            if (cancelled) return;
            const YTState = window.YT?.PlayerState;
            if (!YTState) return;

            if (ev.data === YTState.PLAYING) {
              if (intervalId) window.clearInterval(intervalId);
              intervalId = window.setInterval(() => {
                if (!ytPlayerRef.current) return;
                const cur = ytPlayerRef.current.getCurrentTime();
                const dur = ytPlayerRef.current.getDuration() || activeLecture?.durationSeconds || 0;
                if (dur > 0) setDurationSec(dur);

                // Anti-skip forward check for YouTube scrubber
                if (!activeLessonProgress.videoCompleted && cur > maxAllowedSecRef.current + 4) {
                  ytPlayerRef.current.seekTo(maxAllowedSecRef.current, true);
                  setSkipNotice(
                    'Skipping ahead is disabled until you watch this section of the lecture.'
                  );
                  return;
                }

                setSkipNotice('');
                if (cur > maxAllowedSecRef.current) {
                  maxAllowedSecRef.current = cur;
                }
                watchedBucketsRef.current.add(Math.floor(cur));
                setCurrentSec(cur);

                if (dur > 0) {
                  const pct = Math.min(100, Math.round((Math.max(cur, maxAllowedSecRef.current) / dur) * 100));
                  setLiveWatchedPct((prev) => Math.max(prev, pct));
                  if (Math.abs(cur - lastSavedSecRef.current) >= 5) {
                    lastSavedSecRef.current = cur;
                    void saveVideoCheckpoint(cur, dur, pct);
                  }
                  if (pct >= 92 && !activeLessonProgress.videoCompleted) {
                    void triggerVerifyVideoCompletion(cur, dur);
                  }
                }
              }, 500);
            } else {
              if (intervalId) {
                window.clearInterval(intervalId);
                intervalId = null;
              }
              if (ev.data === YTState.PAUSED) {
                const cur = ev.target.getCurrentTime();
                const dur = ev.target.getDuration() || durationSec;
                const pct = dur > 0 ? Math.round((maxAllowedSecRef.current / dur) * 100) : liveWatchedPct;
                void saveVideoCheckpoint(cur, dur, pct);
              }
              if (ev.data === YTState.ENDED) {
                const dur = ev.target.getDuration() || durationSec || Math.max(10, maxAllowedSecRef.current);
                maxAllowedSecRef.current = dur;
                for (let s = 0; s < Math.ceil(dur); s++) {
                  watchedBucketsRef.current.add(s);
                }
                void handleLectureEnded(dur);
              }
            }
          },
          onError: (ev) => {
            if (cancelled) return;
            const code = ev.data;
            const msg =
              code === 101 || code === 150
                ? 'The owner of this YouTube video has disabled embedded playback. Ask your instructor to replace the link or upload an MP4 video.'
                : code === 100
                ? 'This YouTube lecture was removed or marked private.'
                : 'YouTube video playback could not initialize. Check the URL or upload a direct MP4 video.';
            setVideoError(msg);
          },
        },
      });
    });

    return () => {
      cancelled = true;
      if (intervalId) window.clearInterval(intervalId);
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch {
          // Ignore cleanup errors
        }
        ytPlayerRef.current = null;
      }
    };
  }, [youtubeId, activeLessonId, activeLectureIdx]);

  // HTML5 <video> handlers
  const handleHtmlLoadedMetadata = () => {
    const vid = htmlVideoRef.current;
    if (!vid) return;
    if (Number.isFinite(vid.duration) && vid.duration > 0) {
      setDurationSec(vid.duration);
      if (
        activeLessonProgress.lastPlaybackPosition > 1 &&
        activeLessonProgress.lastPlaybackPosition < vid.duration - 1
      ) {
        vid.currentTime = activeLessonProgress.lastPlaybackPosition;
      }
    }
  };

  const handleHtmlTimeUpdate = () => {
    const vid = htmlVideoRef.current;
    if (!vid) return;
    const cur = vid.currentTime;
    const dur = Number.isFinite(vid.duration) && vid.duration > 0 ? vid.duration : durationSec;
    if (dur > 0 && dur !== durationSec) setDurationSec(dur);

    if (!activeLessonProgress.videoCompleted && cur > maxAllowedSecRef.current + 3) {
      vid.currentTime = maxAllowedSecRef.current;
      setSkipNotice('Skipping ahead is disabled until you watch this section of the lecture.');
      return;
    }

    setSkipNotice('');
    if (cur > maxAllowedSecRef.current) {
      maxAllowedSecRef.current = cur;
    }
    watchedBucketsRef.current.add(Math.floor(cur));
    setCurrentSec(cur);

    if (dur > 0) {
      const pct = Math.min(100, Math.round((Math.max(cur, maxAllowedSecRef.current) / dur) * 100));
      setLiveWatchedPct((prev) => Math.max(prev, pct));
      if (Math.abs(cur - lastSavedSecRef.current) >= 4) {
        lastSavedSecRef.current = cur;
        void saveVideoCheckpoint(cur, dur, pct);
      }
      if (pct >= 92 && !activeLessonProgress.videoCompleted) {
        void triggerVerifyVideoCompletion(cur, dur);
      }
    }
  };

  const handleHtmlSeeking = () => {
    const vid = htmlVideoRef.current;
    if (!vid || activeLessonProgress.videoCompleted) return;
    if (vid.currentTime > maxAllowedSecRef.current + 3) {
      vid.currentTime = maxAllowedSecRef.current;
      setSkipNotice('Forward skipping is locked until you finish watching this lesson.');
    }
  };

  const handleHtmlEnded = () => {
    const vid = htmlVideoRef.current;
    const dur =
      (vid && Number.isFinite(vid.duration) && vid.duration) ||
      durationSec ||
      Math.max(5, maxAllowedSecRef.current);
    maxAllowedSecRef.current = dur;
    for (let s = 0; s <= Math.ceil(dur); s++) {
      watchedBucketsRef.current.add(s);
    }
    setCurrentSec(dur);
    setLiveWatchedPct(100);
    void handleLectureEnded(dur);
  };

  const toggleFullscreen = async () => {
    const el = playerContainerRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // Mobile Safari fallback uses native <video> fullscreen
      const vid = htmlVideoRef.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
      vid?.webkitEnterFullscreen?.();
    }
  };

  // Quiz State
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizError, setQuizError] = useState('');
  const [latestAttempt, setLatestAttempt] = useState<LmsQuizAttempt | null>(null);

  useEffect(() => {
    setSelectedAnswers({});
    setQuizError('');
    const attempts = activeLessonProgress.attempts || [];
    setLatestAttempt(attempts.length > 0 ? attempts[attempts.length - 1] : null);
  }, [activeLessonId]);

  const quizQuestions: LmsPublicMcqQuestion[] = useMemo(() => {
    const base = activeLesson?.quizQuestionsPublic || [];
    if (!activeLesson?.randomizeQuestions || base.length <= 1) return base;
    // Deterministic shuffle per attempt so options/order don't jump mid-answering
    const seed = `${activeLesson.id}-${activeLessonProgress.attemptsCount || 0}`;
    return [...base].sort((a, b) => {
      const ha = `${seed}:${a.id}`.split('').reduce((s, ch) => s + ch.charCodeAt(0), 0);
      const hb = `${seed}:${b.id}`.split('').reduce((s, ch) => s + ch.charCodeAt(0), 0);
      return ha - hb;
    });
  }, [activeLesson?.quizQuestionsPublic, activeLesson?.randomizeQuestions, activeLesson?.id, activeLessonProgress.attemptsCount]);

  const passingThreshold = activeLesson?.passingPercentage || 70;
  const maxAttempts = activeLesson?.maxAttempts || 5;
  const attemptsUsed = activeLessonProgress.attemptsCount || 0;
  const attemptsRemaining = Math.max(0, maxAttempts - attemptsUsed);

  const handleSubmitQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLesson || quizQuestions.length === 0) return;
    setQuizError('');

    const unanswered = quizQuestions.some((q) => selectedAnswers[q.id] === undefined);
    if (unanswered) {
      setQuizError('Please select an answer for every question before submitting.');
      return;
    }

    setQuizSubmitting(true);
    try {
      const idToken = firebaseUser ? await firebaseUser.getIdToken() : '';
      if (!idToken) {
        throw new Error('Authentication required to grade assessment.');
      }

      const res = await fetch('/api/lms/grade-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          courseId: course.id,
          lessonId: activeLesson.id,
          orderedLessonIds,
          watchProofToken: activeLessonProgress.watchProofToken,
          sealedAnswerKey: activeLesson.sealedAnswerKey,
          answers: selectedAnswers,
          previousAttemptsCount: attemptsUsed,
          passedLessonIdsPreviously: effectiveProgress.passedLessonIds || [],
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.message || 'Unable to grade quiz.');
      }

      const attempt: LmsQuizAttempt = {
        attemptNumber: data.attemptNumber,
        submittedAt: data.submittedAt,
        answers: selectedAnswers,
        score: data.score,
        totalQuestions: data.totalQuestions,
        percentage: data.percentage,
        passed: data.passed,
        results: data.results,
        serverReceiptSig: data.serverReceiptSig,
      };

      const prevLessonProg = effectiveProgress.lessonProgress?.[activeLesson.id] || activeLessonProgress;
      const updatedLessonProg: LmsLessonProgress = {
        ...prevLessonProg,
        lessonId: activeLesson.id,
        passed: Boolean(prevLessonProg.passed || data.passed),
        bestScorePercent: Math.max(prevLessonProg.bestScorePercent || 0, data.percentage),
        attemptsCount: attempt.attemptNumber,
        attempts: [...(prevLessonProg.attempts || []), attempt],
        updatedAt: data.submittedAt,
      };

      const updatedLessonProgressMap: Record<string, LmsLessonProgress> = {
        ...effectiveProgress.lessonProgress,
        [activeLesson.id]: updatedLessonProg,
      };
      if (data.unlockedNextLessonId) {
        const existingNext = updatedLessonProgressMap[data.unlockedNextLessonId];
        updatedLessonProgressMap[data.unlockedNextLessonId] = {
          ...(existingNext || {
            lessonId: data.unlockedNextLessonId,
            videoWatchSeconds: 0,
            durationSeconds: 0,
            maxWatchedPercent: 0,
            lastPlaybackPosition: 0,
            videoCompleted: false,
            unlocked: true,
            passed: false,
            bestScorePercent: 0,
            attemptsCount: 0,
            attempts: [],
            updatedAt: data.submittedAt,
          }),
          unlocked: true,
        };
      }

      const certEarned = Boolean(data.certificateEarned);
      const certNum =
        effectiveProgress.certificateNumber ||
        (certEarned
          ? `AIA-LMS-${course.id.slice(-4).toUpperCase()}-${Date.now().toString().slice(-6)}`
          : undefined);

      const nextCourseProgress: LmsCourseProgress = {
        ...effectiveProgress,
        courseTitle: course.title,
        courseCompletionPercent: data.courseCompletionPercent,
        completedLessonIds: data.passedLessonIds,
        passedLessonIds: data.passedLessonIds,
        unlockedLessonIds: data.unlockedLessonIds,
        lastWatchedLessonId: data.unlockedNextLessonId || activeLesson.id,
        lessonProgress: updatedLessonProgressMap,
        certificateEarned: certEarned,
        certificateNumber: certNum,
        certificateIssuedAt:
          effectiveProgress.certificateIssuedAt || (certEarned ? data.submittedAt : undefined),
      };

      await persistProgress(
        nextCourseProgress,
        `LMS quiz attempt ${attempt.attemptNumber} on ${activeLesson.title}: ${data.percentage}% (${data.passed ? 'Passed' : 'Retry'})`
      );

      setLatestAttempt(attempt);

      if (data.passed) {
        setBannerMessage(
          data.unlockedNextLessonId
            ? `MashaAllah! Passed with ${data.percentage}%. The next lesson is now unlocked.`
            : `MashaAllah! Course completed (${data.courseCompletionPercent}%). Your certificate is ready.`
        );
      } else {
        setBannerMessage(
          `Scored ${data.percentage}%. Minimum ${data.passingPercentage}% required to unlock the next lesson. You can retry the assessment.`
        );
      }
    } catch (err) {
      setQuizError(err instanceof Error ? err.message : 'Quiz submission failed.');
    } finally {
      setQuizSubmitting(false);
    }
  };

  // Q&A state
  const [qaQuestionText, setQaQuestionText] = useState('');
  const [qaSubmitting, setQaSubmitting] = useState(false);
  const [replyTargetId, setReplyTargetId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const lessonQa = useMemo(
    () =>
      lmsQa
        .filter((q) => q.courseId === course.id && q.lessonId === activeLesson?.id)
        .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')),
    [lmsQa, course.id, activeLesson?.id]
  );

  const canReplyQa = ['super_admin', 'admin', 'principal', 'teacher'].includes(effectiveRole || '');

  const handlePostQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qaQuestionText.trim() || !activeLesson || !userAccount) return;
    setQaSubmitting(true);
    try {
      await upsertRecord(
        'lmsQa',
        `qa_${Date.now()}`,
        {
          courseId: course.id,
          lessonId: activeLesson.id,
          authorUid: userAccount.uid,
          authorName: userAccount.displayName || studentName || 'Student',
          authorRole: effectiveRole || 'student',
          question: qaQuestionText.trim(),
          createdAt: new Date().toISOString(),
        },
        `Posted Q&A question in ${activeLesson.title}`
      );
      setQaQuestionText('');
    } finally {
      setQaSubmitting(false);
    }
  };

  const handlePostAnswer = async (qaId: string) => {
    if (!replyText.trim() || !userAccount) return;
    await upsertRecord(
      'lmsQa',
      qaId,
      {
        answer: replyText.trim(),
        answeredBy: userAccount.displayName || 'Faculty',
      },
      `Answered LMS Q&A ${qaId}`
    );
    setReplyTargetId(null);
    setReplyText('');
  };

  const prevLesson = activeLessonIndex > 0 ? orderedLessons[activeLessonIndex - 1] : null;
  const nextLesson =
    activeLessonIndex >= 0 && activeLessonIndex + 1 < orderedLessons.length
      ? orderedLessons[activeLessonIndex + 1]
      : null;
  const nextLessonUnlocked = nextLesson ? isLessonUnlocked(nextLesson.id, activeLessonIndex + 1) : false;

  // Group playlist by chapter title
  const chaptersGrouped = useMemo(() => {
    const map = new Map<string, { lesson: LmsLesson; index: number }[]>();
    orderedLessons.forEach((les, idx) => {
      const ch = les.chapterTitle || 'Chapter 1';
      const list = map.get(ch) || [];
      list.push({ lesson: les, index: idx });
      map.set(ch, list);
    });
    return Array.from(map.entries());
  }, [orderedLessons]);

  if (!activeLesson) {
    return (
      <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 rounded-xl p-8 text-center space-y-3">
        <p className="font-serif text-2xl font-semibold text-[#06452C] dark:text-white">
          No Video Lessons Published Yet
        </p>
        <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5]">
          Ask your course instructor or Administrator to add Lesson 01 and MCQ questions.
        </p>
        <button
          type="button"
          onClick={onExit}
          className="px-4 py-2 rounded-lg bg-[#06452C] text-white text-xs font-semibold cursor-pointer"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  const overallPct = Math.max(0, Math.min(100, effectiveProgress.courseCompletionPercent || 0));
  const ringCircumference = 2 * Math.PI * 14;
  const ringOffset = ringCircumference * (1 - overallPct / 100);

  return (
    <div className="space-y-4">
      {/* Top Bar: Back + Academy Emblem | Auto Next + Prev/Next + Radial Progress + Playlist Jump */}
      <div className="bg-[#06452C] text-[#F8F1DF] rounded-xl border border-[#D9AD43]/40 px-3 py-2.5 sm:px-5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={onExit}
            aria-label="Back to Courses"
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg border border-[#D9AD43]/40 hover:bg-[#102D23] text-[#F8F1DF] cursor-pointer shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <AcademyEmblem className="w-8 h-8 shrink-0" variant="gold-on-emerald" />
          <div className="min-w-0 hidden sm:block">
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#D9AD43]">
              <span>{course.classId}</span>
              <span>·</span>
              <span>{course.subjectName}</span>
              {previewMode && <span>· PREVIEW</span>}
            </div>
            <h2 className="font-serif text-base lg:text-lg font-semibold text-white truncate">
              {course.title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setAutoNext((v) => !v)}
            aria-pressed={autoNext}
            className={`min-h-[38px] inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors cursor-pointer ${
              autoNext
                ? 'bg-[#D9AD43] text-[#102D23] border-[#D9AD43]'
                : 'bg-[#102D23] text-[#E6DFCE] border-[#D9AD43]/35'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${autoNext ? 'bg-[#06452C]' : 'bg-[#8A6518]'}`}
            />
            <span className="whitespace-nowrap">Auto Next</span>
          </button>

          <button
            type="button"
            disabled={!prevLesson}
            onClick={() => prevLesson && setActiveLessonId(prevLesson.id)}
            aria-label="Previous Lesson"
            className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-lg border border-[#D9AD43]/35 hover:bg-[#102D23] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            disabled={!nextLesson || !nextLessonUnlocked}
            onClick={() => nextLesson && nextLessonUnlocked && setActiveLessonId(nextLesson.id)}
            aria-label={nextLesson && !nextLessonUnlocked ? 'Next Lesson Locked' : 'Next Lesson'}
            title={
              nextLesson && !nextLessonUnlocked
                ? 'Pass the MCQ quiz to unlock the next lesson'
                : 'Next Lesson'
            }
            className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-lg border border-[#D9AD43]/35 hover:bg-[#102D23] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            {nextLesson && !nextLessonUnlocked ? (
              <Lock className="w-3.5 h-3.5 text-[#D9AD43]" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {/* Circular Radial Course Progress Indicator */}
          <div
            className="relative w-10 h-10 flex items-center justify-center shrink-0"
            title={`Course Progress: ${overallPct}%`}
          >
            <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="rgba(217,173,67,0.22)"
                strokeWidth="3"
              />
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="#D9AD43"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringOffset}
              />
            </svg>
            <span className="absolute text-[9px] font-bold tabular-nums text-white">
              {overallPct}%
            </span>
          </div>

          <button
            type="button"
            onClick={() => mobilePlaylistRef.current?.scrollIntoView({ behavior: 'smooth' })}
            aria-label="Jump to Curriculum Playlist"
            className="lg:hidden min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-lg border border-[#D9AD43]/35 hover:bg-[#102D23] cursor-pointer"
          >
            <ListVideo className="w-4 h-4 text-[#D9AD43]" />
          </button>

          {effectiveProgress.certificateEarned && effectiveProgress.certificateNumber && (
            <button
              type="button"
              onClick={() =>
                downloadCourseCompletionCertificatePdf({
                  studentName: studentName || userAccount?.displayName || 'Student',
                  studentId: studentId || userAccount?.linkedStudentId || 'STU-SELF',
                  classId: course.classId,
                  courseTitle: course.title,
                  subjectName: course.subjectName,
                  certificateNumber: effectiveProgress.certificateNumber!,
                  issuedAt: effectiveProgress.certificateIssuedAt || new Date().toISOString(),
                  instructorName: course.instructorName,
                  settings,
                })
              }
              className="hidden md:inline-flex min-h-[40px] items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D9AD43] text-[#102D23] text-xs font-bold hover:bg-[#e5be5c] cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>Certificate</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Responsive Grid: Video + Tabs on Left (8 cols on lg), Playlist on Right / Below Video on Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left/Top Column: Video Player + Controls + Interactive Tabs */}
        <div className="lg:col-span-8 space-y-4">
          {/* Video Stage */}
          <div
            ref={playerContainerRef}
            className="bg-[#081A14] rounded-xl overflow-hidden border border-[#D9AD43]/40 shadow-lg"
          >
            <div className="relative aspect-video bg-black flex items-center justify-center">
              {videoError ? (
                <div className="p-6 text-center max-w-md space-y-3 text-[#F8F1DF]">
                  <AlertCircle className="w-10 h-10 text-[#D9AD43] mx-auto" />
                  <p className="font-serif text-lg font-semibold">Video Playback Unavailable</p>
                  <p className="text-xs text-[#DED7C5] leading-relaxed">{videoError}</p>
                </div>
              ) : youtubeId ? (
                <div ref={ytContainerRef} className="w-full h-full" />
              ) : activeLecture?.videoUrl ? (
                <video
                  ref={htmlVideoRef}
                  key={`${activeLesson.id}-${activeLecture.id}-${activeLecture.videoUrl}`}
                  src={activeLecture.videoUrl}
                  controls
                  playsInline
                  controlsList="nodownload"
                  onLoadedMetadata={handleHtmlLoadedMetadata}
                  onTimeUpdate={handleHtmlTimeUpdate}
                  onSeeking={handleHtmlSeeking}
                  onEnded={handleHtmlEnded}
                  onError={() =>
                    setVideoError(
                      'Unable to load the lesson video stream. Ask your instructor to verify the uploaded MP4 or YouTube URL.'
                    )
                  }
                  className="w-full h-full object-contain bg-black"
                />
              ) : (
                <div className="p-6 text-center text-[#DED7C5] space-y-2">
                  <Video className="w-10 h-10 text-[#D9AD43] mx-auto" />
                  <p className="text-sm font-semibold text-white">No video source configured for this lecture</p>
                  <p className="text-xs">Instructors can attach a YouTube link or upload an MP4 video.</p>
                </div>
              )}
            </div>

            {/* Playback Progress & Control Strip */}
            <div className="p-3.5 sm:p-4 bg-[#102D23] text-[#F8F1DF] space-y-3">
              {/* Watched Progress Bar */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] mb-1">
                  <span className="font-medium text-[#E6DFCE]">
                    {activeLesson.chapterTitle} ·{' '}
                    <strong className="text-white">{activeLesson.title}</strong>
                  </span>
                  <span className="tabular-nums text-[#D9AD43] font-semibold">
                    {formatDuration(currentSec)} / {formatDuration(durationSec)} · {liveWatchedPct}% watched
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#081A14] overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      activeLessonProgress.videoCompleted ? 'bg-[#34D399]' : 'bg-[#D9AD43]'
                    }`}
                    style={{ width: `${activeLessonProgress.videoCompleted ? 100 : liveWatchedPct}%` }}
                  />
                </div>
              </div>

              {/* Navigation & Toggles */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={!prevLesson}
                    onClick={() => prevLesson && setActiveLessonId(prevLesson.id)}
                    className="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#D9AD43]/40 text-xs font-semibold disabled:opacity-40 hover:bg-[#06452C] cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>

                  <button
                    type="button"
                    disabled={!nextLesson || !nextLessonUnlocked}
                    onClick={() => nextLesson && nextLessonUnlocked && setActiveLessonId(nextLesson.id)}
                    title={
                      nextLesson && !nextLessonUnlocked
                        ? 'Pass the MCQ quiz for this lesson to unlock Next'
                        : ''
                    }
                    className="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#D9AD43] text-[#102D23] text-xs font-bold disabled:opacity-45 hover:bg-[#e5be5c] cursor-pointer disabled:cursor-not-allowed"
                  >
                    <span>Next Lesson</span>
                    {nextLesson && !nextLessonUnlocked ? (
                      <Lock className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <label className="min-h-[44px] inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#D9AD43]/30 text-xs cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={autoNext}
                      onChange={(e) => setAutoNext(e.target.checked)}
                      className="accent-[#D9AD43] w-4 h-4"
                    />
                    <span>Auto Next</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => void toggleFullscreen()}
                    aria-label="Toggle Fullscreen"
                    className="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#D9AD43]/40 text-xs font-semibold hover:bg-[#06452C] cursor-pointer"
                  >
                    {isFullscreen ? (
                      <Minimize2 className="w-4 h-4" />
                    ) : (
                      <Maximize2 className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">Fullscreen</span>
                  </button>
                </div>
              </div>

              {/* Multi-Lecture Selector inside Same Lesson */}
              {lectures.length > 1 && (
                <div className="pt-2 border-t border-[#D9AD43]/20 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#D9AD43]">
                    Lesson Lectures:
                  </span>
                  {lectures.map((lec, idx) => (
                    <button
                      key={lec.id}
                      type="button"
                      onClick={() => setActiveLectureIdx(idx)}
                      className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-semibold border cursor-pointer ${
                        idx === activeLectureIdx
                          ? 'bg-[#D9AD43] text-[#102D23] border-[#D9AD43]'
                          : 'bg-[#081A14] text-[#F8F1DF] border-[#D9AD43]/30'
                      }`}
                    >
                      {idx + 1}. {lec.title}
                    </button>
                  ))}
                </div>
              )}

              {/* Preview Mode Testing Helper (Instructors/Admins ONLY) */}
              {previewMode && !activeLessonProgress.videoCompleted && (
                <div className="pt-2 border-t border-[#D9AD43]/20 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#D9AD43]">
                  <span>Instructor Preview: Watch the video normally or fast-verify playback check.</span>
                  <button
                    type="button"
                    onClick={() => {
                      const simDur = Math.max(durationSec, 10);
                      maxAllowedSecRef.current = simDur;
                      for (let s = 0; s <= simDur; s++) watchedBucketsRef.current.add(s);
                      void triggerVerifyVideoCompletion(simDur, simDur);
                    }}
                    className="px-3 py-1 rounded bg-[#D9AD43] text-[#102D23] font-bold cursor-pointer"
                  >
                    Preview Complete Video →
                  </button>
                </div>
              )}
            </div>
          </div>

          {skipNotice && (
            <div className="p-3 rounded-lg bg-[#D9AD43]/20 border border-[#D9AD43] text-xs font-medium text-[#8A6518] dark:text-[#F8F1DF] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{skipNotice}</span>
            </div>
          )}

          {bannerMessage && (
            <div className="p-3.5 rounded-lg bg-[#06452C] text-[#F8F1DF] border border-[#D9AD43]/50 text-xs font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D9AD43] shrink-0" />
              <span>{bannerMessage}</span>
            </div>
          )}

          {/* Mobile/Compact Course Heading + Instructor Summary */}
          <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-[#D9AD43]/40 bg-[#06452C] shrink-0">
                <TeacherPhoto
                  photoUrl={courseInstructor?.photoUrl}
                  name={course.instructorName}
                  emblemClassName="w-6 h-6"
                />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8A6518] dark:text-[#D9AD43]">
                  {course.classId} · {course.subjectName} · {orderedLessons.length} Lessons
                </p>
                <h3 className="font-serif text-lg sm:text-xl font-semibold text-[#06452C] dark:text-white truncate">
                  {course.title}
                </h3>
                <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5]">
                  Instructor: <strong>{courseInstructor?.name || course.instructorName}</strong>
                </p>
              </div>
            </div>

            {effectiveProgress.certificateEarned && effectiveProgress.certificateNumber && (
              <button
                type="button"
                onClick={() =>
                  downloadCourseCompletionCertificatePdf({
                    studentName: studentName || userAccount?.displayName || 'Student',
                    studentId: studentId || userAccount?.linkedStudentId || 'STU-SELF',
                    classId: course.classId,
                    courseTitle: course.title,
                    subjectName: course.subjectName,
                    certificateNumber: effectiveProgress.certificateNumber!,
                    issuedAt: effectiveProgress.certificateIssuedAt || new Date().toISOString(),
                    instructorName: course.instructorName,
                    settings,
                  })
                }
                className="md:hidden min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D9AD43] text-[#102D23] text-xs font-bold cursor-pointer"
              >
                <Award className="w-4 h-4" />
                <span>Download Certificate</span>
              </button>
            )}
          </div>

          {/* Mobile Lesson Playlist Position Notice & Full Curriculum Below Video on Mobile */}
          <div
            ref={mobilePlaylistRef}
            className="lg:hidden bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-4"
          >
            <LessonPlaylistCard
              chaptersGrouped={chaptersGrouped}
              activeLessonId={activeLesson.id}
              progress={effectiveProgress}
              isLessonUnlocked={isLessonUnlocked}
              onSelectLesson={(id, tabTarget) => {
                setActiveLessonId(id);
                if (tabTarget) setActiveTab(tabTarget);
              }}
            />
          </div>

          {/* Interactive Tabs: MCQ Quiz, Notes & PDF, Transcript, Q&A */}
          <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl overflow-hidden">
            <div className="flex flex-wrap gap-1.5 p-2.5 border-b border-[#D9AD43]/25 bg-[#F8F1DF]/70 dark:bg-[#081A14]">
              {(
                [
                  {
                    key: 'quiz',
                    label: `MCQ Quiz (${quizQuestions.length})`,
                    icon: activeLessonProgress.videoCompleted ? ShieldCheck : Lock,
                  },
                  { key: 'notes', label: 'Notes & PDF', icon: FileText },
                  { key: 'transcript', label: 'Transcript', icon: Clock },
                  { key: 'qa', label: `Q&A (${lessonQa.length})`, icon: MessageSquare },
                ] as const
              ).map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setActiveTab(t.key)}
                    className={`min-h-[44px] flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      activeTab === t.key
                        ? 'bg-[#06452C] text-white shadow-sm'
                        : 'bg-white/80 dark:bg-[#102D23] text-[#314A3F] dark:text-[#DED7C5] border border-[#D9AD43]/25 hover:border-[#06452C]'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${activeTab === t.key ? 'text-[#D9AD43]' : ''}`} />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-3.5 sm:p-6">
              {activeTab === 'quiz' && (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#8A6518] dark:text-[#D9AD43]">
                        Sequential Lesson Assessment · Passing Score {passingThreshold}%
                      </p>
                      <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#06452C] dark:text-white">
                        {activeLesson.title} — MCQ Quiz
                      </h3>
                    </div>
                    <div className="text-xs text-[#5A6D64] dark:text-[#DED7C5] tabular-nums">
                      Attempts: <strong>{attemptsUsed}/{maxAttempts}</strong> · Best Score:{' '}
                      <strong>{activeLessonProgress.bestScorePercent}%</strong>
                    </div>
                  </div>

                  {!activeLessonProgress.videoCompleted ? (
                    <div className="p-6 rounded-xl bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/40 text-center space-y-3">
                      <Lock className="w-9 h-9 text-[#8A6518] dark:text-[#D9AD43] mx-auto" />
                      <h4 className="font-serif text-xl font-semibold text-[#06452C] dark:text-white">
                        MCQ Quiz Locked Until Video Completion
                      </h4>
                      <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5] max-w-md mx-auto">
                        Watch the video lecture above completely (minimum 90% verified playback without
                        skipping) to unlock this lesson’s MCQ assessment and qualify for the next lesson.
                      </p>
                      <div className="max-w-xs mx-auto pt-1">
                        <div className="flex justify-between text-[11px] font-semibold mb-1 tabular-nums">
                          <span>Watched Progress</span>
                          <span>{liveWatchedPct}% / 90%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-white dark:bg-[#102D23] overflow-hidden border border-[#D9AD43]/30">
                          <div
                            className="h-full bg-[#06452C] dark:bg-[#D9AD43]"
                            style={{ width: `${liveWatchedPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : quizQuestions.length === 0 ? (
                    <div className="p-5 rounded-xl bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 text-xs text-[#5A6D64]">
                      No MCQ questions have been added to this lesson yet. Instructors can add MCQ
                      questions in Portal → LMS Courses.
                    </div>
                  ) : (
                    <>
                      {/* Show Latest Graded Result Card if submitted */}
                      {latestAttempt && (
                        <div
                          className={`p-5 rounded-xl border-2 space-y-3 ${
                            latestAttempt.passed
                              ? 'bg-[#06452C]/10 border-[#06452C] dark:border-[#34D399]'
                              : 'bg-[#FDF2F2] dark:bg-[#2B1212] border-[#B91C1C]'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              {latestAttempt.passed ? (
                                <CheckCircle2 className="w-6 h-6 text-[#06452C] dark:text-[#34D399]" />
                              ) : (
                                <XCircle className="w-6 h-6 text-[#B91C1C] dark:text-[#F87171]" />
                              )}
                              <div>
                                <p className="font-serif text-lg font-semibold">
                                  {latestAttempt.passed
                                    ? 'Assessment Passed — Next Lesson Unlocked!'
                                    : `Score Below ${passingThreshold}% — Next Lesson Remains Locked`}
                                </p>
                                <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5] tabular-nums">
                                  Attempt #{latestAttempt.attemptNumber} · Score:{' '}
                                  <strong>
                                    {latestAttempt.score}/{latestAttempt.totalQuestions} (
                                    {latestAttempt.percentage}%)
                                  </strong>
                                </p>
                              </div>
                            </div>

                            {latestAttempt.passed && nextLesson && nextLessonUnlocked ? (
                              <button
                                type="button"
                                onClick={() => setActiveLessonId(nextLesson.id)}
                                className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#06452C] text-white text-xs font-semibold cursor-pointer"
                              >
                                <Unlock className="w-3.5 h-3.5" />
                                <span>Continue to {nextLesson.title.split(':')[0]}</span>
                              </button>
                            ) : !latestAttempt.passed && attemptsRemaining > 0 ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setLatestAttempt(null);
                                  setSelectedAnswers({});
                                  setQuizError('');
                                }}
                                className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#06452C] text-white text-xs font-semibold cursor-pointer"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Retry MCQ Quiz ({attemptsRemaining} left)</span>
                              </button>
                            ) : null}
                          </div>
                        </div>
                      )}

                      {quizError && (
                        <div className="p-3 rounded-lg bg-[#FDF2F2] border border-[#E5B4B4] text-xs font-medium text-[#7F1D1D]">
                          {quizError}
                        </div>
                      )}

                      <form onSubmit={handleSubmitQuiz} className="space-y-4">
                        {quizQuestions.map((q, qIdx) => {
                          const gradedItem = latestAttempt?.results.find((r) => r.questionId === q.id);
                          const chosenIdx = latestAttempt
                            ? gradedItem?.selectedIndex
                            : selectedAnswers[q.id];

                          return (
                            <div
                              key={q.id}
                              className="p-4 rounded-xl bg-[#F8F1DF]/60 dark:bg-[#081A14] border border-[#D9AD43]/30 space-y-3"
                            >
                              <p className="text-sm font-semibold flex items-start gap-2">
                                <span className="text-[#8A6518] dark:text-[#D9AD43] tabular-nums">
                                  Q{qIdx + 1}.
                                </span>
                                <span>{q.question}</span>
                              </p>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {q.options.map((opt, oIdx) => {
                                  const isSelected = chosenIdx === oIdx;
                                  const isCorrectOpt = gradedItem && gradedItem.correctIndex === oIdx;
                                  const isWrongSelected =
                                    gradedItem && isSelected && !gradedItem.correct;

                                  return (
                                    <button
                                      key={`${q.id}-${oIdx}`}
                                      type="button"
                                      disabled={Boolean(latestAttempt)}
                                      onClick={() =>
                                        setSelectedAnswers((prev) => ({ ...prev, [q.id]: oIdx }))
                                      }
                                      className={`min-h-[48px] text-left px-3.5 py-3 rounded-xl text-xs sm:text-sm border transition-colors cursor-pointer disabled:cursor-default ${
                                        isCorrectOpt
                                          ? 'bg-[#06452C] text-white border-[#06452C] font-semibold'
                                          : isWrongSelected
                                          ? 'bg-[#FDF2F2] text-[#7F1D1D] border-[#B91C1C]'
                                          : isSelected
                                          ? 'bg-[#06452C]/15 dark:bg-[#D9AD43]/20 border-[#06452C] dark:border-[#D9AD43] font-semibold'
                                          : 'bg-white dark:bg-[#102D23] border-[#D9AD43]/30 hover:border-[#06452C]'
                                      }`}
                                    >
                                      <span className="font-bold mr-1.5">
                                        {String.fromCharCode(65 + oIdx)}.
                                      </span>
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>

                              {gradedItem && (
                                <p
                                  className={`text-xs font-medium pt-1 ${
                                    gradedItem.correct
                                      ? 'text-[#06452C] dark:text-[#34D399]'
                                      : 'text-[#8A6518] dark:text-[#D9AD43]'
                                  }`}
                                >
                                  {gradedItem.correct ? '✓ Correct: ' : '✗ Incorrect — Explanation: '}
                                  {gradedItem.explanation}
                                </p>
                              )}
                            </div>
                          );
                        })}

                        {!latestAttempt && (
                          <div className="flex items-center justify-between gap-3 pt-2">
                            {attemptsRemaining === 0 && !activeLessonProgress.passed ? (
                              <p className="text-xs font-semibold text-[#B91C1C]">
                                Maximum quiz attempts ({maxAttempts}) reached.
                              </p>
                            ) : (
                              <button
                                type="submit"
                                disabled={quizSubmitting}
                                className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#06452C] text-white text-sm font-semibold hover:bg-[#102D23] disabled:opacity-50 cursor-pointer"
                              >
                                <HelpCircle className="w-4 h-4 text-[#D9AD43]" />
                                <span>
                                  {quizSubmitting ? 'Grading Answers...' : 'Submit MCQ Answers'}
                                </span>
                              </button>
                            )}
                          </div>
                        )}
                      </form>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="space-y-4">
                  <h3 className="font-serif text-xl font-semibold text-[#06452C] dark:text-white">
                    Lesson Study Notes &amp; Guidance
                  </h3>
                  <p className="text-sm text-[#314A3F] dark:text-[#E6DFCE] leading-relaxed whitespace-pre-line">
                    {activeLesson.notes || 'No study notes attached to this lesson yet.'}
                  </p>
                  {activeLesson.pdfUrl && (
                    <a
                      href={activeLesson.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#06452C] text-white text-xs font-semibold"
                    >
                      <Download className="w-4 h-4" />
                      Open Attached Study Sheet
                    </a>
                  )}
                </div>
              )}

              {activeTab === 'transcript' && (
                <div className="space-y-3">
                  <h3 className="font-serif text-xl font-semibold text-[#06452C] dark:text-white">
                    Lecture Transcript
                  </h3>
                  <div className="p-4 rounded-xl bg-[#F8F1DF]/60 dark:bg-[#081A14] border border-[#D9AD43]/25 text-xs sm:text-sm text-[#314A3F] dark:text-[#E6DFCE] leading-relaxed whitespace-pre-line">
                    {activeLecture?.transcript ||
                      activeLesson.transcript ||
                      'Transcript has not been added for this recorded lecture yet.'}
                  </div>
                </div>
              )}

              {activeTab === 'qa' && (
                <div className="space-y-5">
                  <h3 className="font-serif text-xl font-semibold text-[#06452C] dark:text-white">
                    Lesson Questions &amp; Scholar Replies
                  </h3>

                  <form onSubmit={handlePostQuestion} className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      required
                      value={qaQuestionText}
                      onChange={(e) => setQaQuestionText(e.target.value)}
                      placeholder="Ask a question about this video lesson..."
                      className="flex-1 min-h-[44px] px-3.5 py-2 text-xs sm:text-sm bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35 rounded-lg"
                    />
                    <button
                      type="submit"
                      disabled={qaSubmitting}
                      className="min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#06452C] text-white text-xs font-semibold cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Ask Question</span>
                    </button>
                  </form>

                  <div className="space-y-3">
                    {lessonQa.map((qa) => (
                      <div
                        key={qa.id}
                        className="p-4 rounded-xl bg-[#F8F1DF]/60 dark:bg-[#081A14] border border-[#D9AD43]/25 space-y-2"
                      >
                        <div className="flex items-center justify-between text-[11px] text-[#8A6518] dark:text-[#D9AD43] font-semibold">
                          <span>{qa.authorName}</span>
                          <span>{qa.createdAt.slice(0, 10)}</span>
                        </div>
                        <p className="text-xs sm:text-sm font-medium">{qa.question}</p>

                        {qa.answer ? (
                          <div className="mt-2 pt-2 border-t border-[#D9AD43]/20 text-xs text-[#06452C] dark:text-[#A9D5BE]">
                            <strong>{qa.answeredBy || 'Instructor'}:</strong> {qa.answer}
                          </div>
                        ) : canReplyQa ? (
                          replyTargetId === qa.id ? (
                            <div className="flex gap-2 pt-1">
                              <input
                                type="text"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Write instructor answer..."
                                className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => void handlePostAnswer(qa.id)}
                                className="px-3 py-1.5 rounded-lg bg-[#06452C] text-white text-xs font-semibold cursor-pointer"
                              >
                                Reply
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setReplyTargetId(qa.id);
                                setReplyText('');
                              }}
                              className="text-xs font-semibold text-[#06452C] dark:text-[#D9AD43] underline cursor-pointer"
                            >
                              Reply as Instructor
                            </button>
                          )
                        ) : null}
                      </div>
                    ))}
                    {lessonQa.length === 0 && (
                      <p className="text-xs text-[#5A6D64]">
                        No questions posted yet for this lesson. Ask the first question above.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Sidebar Playlist */}
        <aside className="hidden lg:block lg:col-span-4 bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-5 sticky top-20">
          <LessonPlaylistCard
            chaptersGrouped={chaptersGrouped}
            activeLessonId={activeLesson.id}
            progress={effectiveProgress}
            isLessonUnlocked={isLessonUnlocked}
            onSelectLesson={(id, tabTarget) => {
              setActiveLessonId(id);
              if (tabTarget) setActiveTab(tabTarget);
            }}
          />
        </aside>
      </div>
    </div>
  );
};

const LessonPlaylistCard: React.FC<{
  chaptersGrouped: [string, { lesson: LmsLesson; index: number }[]][];
  activeLessonId: string;
  progress: LmsCourseProgress;
  isLessonUnlocked: (lessonId: string, idx: number) => boolean;
  onSelectLesson: (lessonId: string, tabTarget?: PlayerTab) => void;
}> = ({ chaptersGrouped, activeLessonId, progress, isLessonUnlocked, onSelectLesson }) => {
  const [collapsedChapters, setCollapsedChapters] = useState<Record<string, boolean>>({});

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-[#D9AD43]/25 pb-2.5">
        <h3 className="font-serif text-lg font-semibold text-[#06452C] dark:text-white">
          Course Curriculum
        </h3>
        <span className="text-[11px] font-semibold text-[#8A6518] dark:text-[#D9AD43] tabular-nums">
          {progress.passedLessonIds.length} Passed
        </span>
      </div>

      <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
        {chaptersGrouped.map(([chapterTitle, entries]) => {
          const containsActive = entries.some((e) => e.lesson.id === activeLessonId);
          const isCollapsed = collapsedChapters[chapterTitle] ?? !containsActive;

          return (
            <div
              key={chapterTitle}
              className={`rounded-xl border overflow-hidden transition-colors ${
                containsActive
                  ? 'bg-[#06452C] text-[#F8F1DF] border-[#D9AD43]/60'
                  : 'bg-[#F8F1DF]/65 dark:bg-[#081A14] text-[#102D23] dark:text-[#F8F1DF] border-[#D9AD43]/30'
              }`}
            >
              <button
                type="button"
                onClick={() =>
                  setCollapsedChapters((prev) => ({
                    ...prev,
                    [chapterTitle]: !isCollapsed,
                  }))
                }
                className="w-full min-h-[48px] px-3.5 py-3 flex items-center justify-between gap-2 text-left cursor-pointer"
              >
                <div className="min-w-0">
                  <p
                    className={`text-xs font-bold leading-snug ${
                      containsActive ? 'text-white' : 'text-[#06452C] dark:text-white'
                    }`}
                  >
                    {chapterTitle}
                  </p>
                  <p
                    className={`text-[11px] tabular-nums ${
                      containsActive ? 'text-[#D9AD43]' : 'text-[#5A6D64] dark:text-[#DED7C5]'
                    }`}
                  >
                    {entries.length} Lesson{entries.length === 1 ? '' : 's'}
                  </p>
                </div>
                {isCollapsed ? (
                  <ChevronDown className="w-4 h-4 shrink-0" />
                ) : (
                  <ChevronUp className="w-4 h-4 shrink-0" />
                )}
              </button>

              {!isCollapsed && (
                <div
                  className={`px-3 pb-3 space-y-2 ${
                    containsActive ? 'border-t border-[#D9AD43]/25 pt-2.5' : 'border-t border-[#D9AD43]/20 pt-2.5'
                  }`}
                >
                  {entries.map(({ lesson, index }) => {
                    const unlocked = isLessonUnlocked(lesson.id, index);
                    const passed = progress.passedLessonIds.includes(lesson.id);
                    const lesProg = progress.lessonProgress?.[lesson.id];
                    const videoDone = Boolean(lesProg?.videoCompleted || passed);
                    const isActive = lesson.id === activeLessonId;
                    const mcqCount = lesson.quizQuestionsPublic?.length ?? 5;

                    return (
                      <div key={lesson.id} className="space-y-1.5">
                        {/* Video Lecture Item */}
                        <button
                          type="button"
                          disabled={!unlocked}
                          onClick={() => unlocked && onSelectLesson(lesson.id)}
                          className={`w-full min-h-[48px] text-left px-3 py-2.5 rounded-lg border transition-colors flex items-start gap-2.5 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed ${
                            isActive
                              ? 'bg-[#0D5A3B] text-white border-[#D9AD43]'
                              : unlocked
                              ? containsActive
                                ? 'bg-[#082E1F] text-[#F8F1DF] border-[#D9AD43]/30 hover:border-[#D9AD43]'
                                : 'bg-white dark:bg-[#102D23] border-[#D9AD43]/25 hover:border-[#06452C]'
                              : 'bg-black/10 dark:bg-[#081A14]/60 border-transparent'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {videoDone ? (
                              <CheckCircle2 className="w-4 h-4 text-[#D9AD43]" />
                            ) : unlocked ? (
                              <Play className="w-4 h-4 text-[#D9AD43]" />
                            ) : (
                              <Lock className="w-4 h-4 opacity-70" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold leading-snug">{lesson.title}</p>
                            <p
                              className={`text-[11px] mt-0.5 tabular-nums ${
                                containsActive ? 'text-[#E6DFCE]' : 'text-[#5A6D64] dark:text-[#DED7C5]'
                              }`}
                            >
                              Video · {formatDuration(lesson.durationSeconds || 10)} ·{' '}
                              {videoDone
                                ? 'Watched 100%'
                                : unlocked
                                ? `${lesProg?.maxWatchedPercent || 0}% watched`
                                : 'Locked'}
                            </p>
                          </div>
                        </button>

                        {/* Associated MCQ Quiz Row */}
                        <button
                          type="button"
                          disabled={!unlocked}
                          onClick={() => unlocked && onSelectLesson(lesson.id, 'quiz')}
                          className={`w-full min-h-[42px] text-left px-3 py-2 rounded-lg border text-[11px] flex items-center justify-between gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                            containsActive
                              ? 'bg-[#063623] border-[#D9AD43]/25 text-[#F8F1DF] hover:border-[#D9AD43]'
                              : 'bg-white/75 dark:bg-[#102D23]/75 border-[#D9AD43]/20 hover:border-[#06452C]'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {passed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399] shrink-0" />
                            ) : videoDone ? (
                              <HelpCircle className="w-3.5 h-3.5 text-[#D9AD43] shrink-0" />
                            ) : (
                              <Lock className="w-3.5 h-3.5 opacity-70 shrink-0" />
                            )}
                            <span className="truncate font-semibold">
                              Quiz · Lesson {String(index + 1).padStart(2, '0')} ({mcqCount} MCQs)
                            </span>
                          </div>
                          <span className="shrink-0 font-semibold tabular-nums text-[#D9AD43]">
                            {passed
                              ? `${lesProg?.bestScorePercent || 100}%`
                              : videoDone
                              ? 'Take Quiz'
                              : 'Locked'}
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
