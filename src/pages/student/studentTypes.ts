import {
  LmsCourse,
  LmsCourseProgress,
  LmsLesson,
  LmsQuizAttempt,
} from '../../types/platform';

export type StudentSectionKey =
  | 'home'
  | 'program'
  | 'courses'
  | 'resources'
  | 'teachers'
  | 'contact';

export type StudentResourceTab = 'live' | 'notes' | 'results' | 'homework';

export interface StudentLmsSummary {
  totalLessons: number;
  completedLessonsCount: number;
  watchedLessonsCount: number;
  lockedLessonsCount: number;
  overallPct: number;
  quizHistory: Array<{
    courseId: string;
    courseTitle: string;
    lessonId: string;
    lessonTitle: string;
    attempt: LmsQuizAttempt;
  }>;
  certificates: Array<{
    course: LmsCourse;
    certificateNumber: string;
    issuedAt: string;
  }>;
  continueCandidate: {
    course: LmsCourse;
    lessonId?: string;
    lessonTitle: string;
    pct: number;
    completedCount: number;
    totalCount: number;
  } | null;
}

export function buildStudentLmsSummary(
  courses: LmsCourse[],
  lessons: LmsLesson[],
  progressByCourse: Map<string, LmsCourseProgress>
): StudentLmsSummary {
  let totalLessons = 0;
  let completedLessonsCount = 0;
  let watchedLessonsCount = 0;
  let lockedLessonsCount = 0;
  let pctSum = 0;

  const quizHistory: StudentLmsSummary['quizHistory'] = [];
  const certificates: StudentLmsSummary['certificates'] = [];
  let continueCandidate: StudentLmsSummary['continueCandidate'] = null;

  for (const course of courses) {
    const courseLessons = lessons
      .filter((l) => l.courseId === course.id)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    const prog = progressByCourse.get(course.id);

    let completedInCourse = 0;
    let firstOpenIncompleteLessonId: string | undefined;

    courseLessons.forEach((les, idx) => {
      totalLessons += 1;
      const lp = prog?.lessonProgress?.[les.id];
      const passed = Boolean(
        prog?.completedLessonIds?.includes(les.id) ||
          prog?.passedLessonIds?.includes(les.id) ||
          lp?.passed
      );
      const watched = Boolean(lp?.videoCompleted || passed);
      const prevLesson = idx > 0 ? courseLessons[idx - 1] : null;
      const prevPassed = prevLesson
        ? Boolean(
            prog?.completedLessonIds?.includes(prevLesson.id) ||
              prog?.passedLessonIds?.includes(prevLesson.id) ||
              prog?.lessonProgress?.[prevLesson.id]?.passed
          )
        : true;
      const unlocked =
        idx === 0 ||
        Boolean(prog?.unlockedLessonIds?.includes(les.id)) ||
        Boolean(lp?.unlocked) ||
        prevPassed;

      if (watched) watchedLessonsCount += 1;
      if (passed) {
        completedLessonsCount += 1;
        completedInCourse += 1;
      }
      if (!unlocked) {
        lockedLessonsCount += 1;
      } else if (!passed && !firstOpenIncompleteLessonId) {
        firstOpenIncompleteLessonId = les.id;
      }

      if (lp?.attempts?.length) {
        lp.attempts.forEach((attempt) => {
          quizHistory.push({
            courseId: course.id,
            courseTitle: course.title,
            lessonId: les.id,
            lessonTitle: les.title,
            attempt,
          });
        });
      }
    });

    const coursePct =
      prog?.courseCompletionPercent ??
      (courseLessons.length > 0 ? Math.round((completedInCourse / courseLessons.length) * 100) : 0);
    pctSum += coursePct;

    if (prog?.certificateEarned && course.certificateEnabled !== false) {
      certificates.push({
        course,
        certificateNumber: prog.certificateNumber || `CERT-${course.id.slice(0, 6).toUpperCase()}`,
        issuedAt: prog.certificateIssuedAt || new Date().toISOString(),
      });
    }

    const targetLessonId =
      prog?.lastWatchedLessonId || firstOpenIncompleteLessonId || courseLessons[0]?.id;
    const targetLessonTitle =
      courseLessons.find((l) => l.id === targetLessonId)?.title || 'Lesson 01';

    if (
      !continueCandidate ||
      (prog?.lastWatchedLessonId && coursePct < 100 && continueCandidate.pct === 0)
    ) {
      continueCandidate = {
        course,
        lessonId: targetLessonId,
        lessonTitle: targetLessonTitle,
        pct: coursePct,
        completedCount: completedInCourse,
        totalCount: courseLessons.length,
      };
    }
  }

  quizHistory.sort(
    (a, b) => new Date(b.attempt.submittedAt).getTime() - new Date(a.attempt.submittedAt).getTime()
  );

  const overallPct = courses.length > 0 ? Math.round(pctSum / courses.length) : 0;

  return {
    totalLessons,
    completedLessonsCount,
    watchedLessonsCount,
    lockedLessonsCount,
    overallPct,
    quizHistory,
    certificates,
    continueCandidate,
  };
}
