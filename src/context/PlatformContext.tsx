import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import {
  db,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import {
  DEFAULT_CLASSES,
  DEFAULT_INSTITUTION_SETTINGS,
  DEFAULT_LIBRARY_CATEGORIES,
  DEFAULT_SECTIONS,
  DEFAULT_SESSIONS,
  DEFAULT_SUBJECTS,
  DEMO_ADMISSIONS,
  DEMO_ASSIGNMENTS,
  DEMO_ATTENDANCE,
  DEMO_CERTIFICATES,
  DEMO_COURSES,
  DEMO_EVENTS,
  DEMO_EXAMINATIONS,
  DEMO_FEE_STRUCTURES,
  DEMO_GALLERY,
  DEMO_HOMEWORK,
  DEMO_INVOICES,
  DEMO_LESSON_QUESTION_BANKS,
  DEMO_LESSONS,
  DEMO_LIBRARY,
  DEMO_LIBRARY_BOOKS,
  DEMO_LIVE_CLASSES,
  DEMO_LMS_QA,
  DEMO_NOTICES,
  DEMO_PAYMENTS,
  DEMO_RESULTS,
  DEMO_STAFF,
  DEMO_STUDENTS,
  DEMO_TEACHERS,
  DEMO_TIMETABLE,
} from '../lib/defaultData';
import { isStaticOnlyHost, resolveApiUrl } from '../lib/assetUrl';
import {
  AcademicClass,
  AcademicSession,
  AdmissionApplication,
  AssignmentItem,
  AttendanceRecord,
  AuditLogEntry,
  CertificateRecord,
  EventRecord,
  ExaminationRecord,
  FeeInvoice,
  FeeStructure,
  GalleryItem,
  HomeworkItem,
  InstitutionSettings,
  LanguageCode,
  LibraryBook,
  LibraryCategory,
  LibraryReadingProgress,
  LibraryResource,
  LiveClassSession,
  LmsCourse,
  LmsCourseProgress,
  LmsLesson,
  LmsQaEntry,
  LmsQuestionBankDoc,
  NoticeRecord,
  NotificationItem,
  PaymentRecord,
  PublishedResult,
  SectionRecord,
  StaffRecord,
  StudentRecord,
  SubjectRecord,
  SubmissionItem,
  TeacherRecord,
  TimetableSlot,
  UserAccount,
} from '../types/platform';
import { useAuth } from './AuthContext';

export interface IntegrationDetail {
  configured: boolean;
  statusLabel: 'Configured' | 'Not Configured';
  provider: string;
  fallbackMode: string;
  requiredEnv: string[];
  missingEnv: string[];
}

export interface IntegrationStatus {
  paymentGateway: IntegrationDetail;
  emailNotifications: IntegrationDetail;
  smsNotifications: IntegrationDetail;
  videoConferencing: IntegrationDetail;
}

export const DEFAULT_INTEGRATIONS_STATUS: IntegrationStatus = {
  paymentGateway: {
    configured: false,
    statusLabel: 'Not Configured',
    provider: 'Not Configured',
    fallbackMode: 'Cash & Bank Transfer fee recording remain fully operational.',
    requiredEnv: ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'],
    missingEnv: ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'],
  },
  emailNotifications: {
    configured: false,
    statusLabel: 'Not Configured',
    provider: 'Not Configured',
    fallbackMode: 'In-app Firestore notifications remain active.',
    requiredEnv: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'],
    missingEnv: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'],
  },
  smsNotifications: {
    configured: false,
    statusLabel: 'Not Configured',
    provider: 'Not Configured',
    fallbackMode: 'In-app Firestore announcements remain active.',
    requiredEnv: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_FROM_NUMBER'],
    missingEnv: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_FROM_NUMBER'],
  },
  videoConferencing: {
    configured: false,
    statusLabel: 'Not Configured',
    provider: 'Not Configured',
    fallbackMode: 'Teachers can paste manual Zoom / Google Meet / Jitsi meeting links.',
    requiredEnv: ['VIDEO_CONFERENCING_PROVIDER', 'VIDEO_CONFERENCING_BASE_URL'],
    missingEnv: ['VIDEO_CONFERENCING_PROVIDER', 'VIDEO_CONFERENCING_BASE_URL'],
  },
};

interface PlatformContextValue {
  darkMode: boolean;
  toggleDarkMode: () => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  settings: InstitutionSettings;
  sessions: AcademicSession[];
  classes: AcademicClass[];
  sections: SectionRecord[];
  subjects: SubjectRecord[];
  teachers: TeacherRecord[];
  students: StudentRecord[];
  staff: StaffRecord[];
  admissions: AdmissionApplication[];
  attendance: AttendanceRecord[];
  timetables: TimetableSlot[];
  homework: HomeworkItem[];
  assignments: AssignmentItem[];
  submissions: SubmissionItem[];
  examinations: ExaminationRecord[];
  results: PublishedResult[];
  feeStructures: FeeStructure[];
  invoices: FeeInvoice[];
  payments: PaymentRecord[];
  courses: LmsCourse[];
  lessons: LmsLesson[];
  lmsQuestionBanks: LmsQuestionBankDoc[];
  lmsProgress: LmsCourseProgress[];
  lmsQa: LmsQaEntry[];
  liveClasses: LiveClassSession[];
  library: LibraryResource[];
  libraryCategories: LibraryCategory[];
  libraryBooks: LibraryBook[];
  libraryReadingProgress: LibraryReadingProgress[];
  notices: NoticeRecord[];
  events: EventRecord[];
  gallery: GalleryItem[];
  certificates: CertificateRecord[];
  notifications: NotificationItem[];
  auditLogs: AuditLogEntry[];
  users: UserAccount[];
  integrations: IntegrationStatus;
  refreshIntegrations: () => Promise<IntegrationStatus>;
  isSeedingDemo: boolean;
  upsertRecord: (
    collectionName: string,
    id: string,
    data: Record<string, unknown>,
    auditDetail?: string
  ) => Promise<void>;
  deleteRecord: (collectionName: string, id: string, auditDetail?: string) => Promise<void>;
  submitAdmissionApplication: (
    payload: Omit<AdmissionApplication, 'id' | 'applicationNumber' | 'status' | 'createdAt' | 'updatedAt'>
  ) => Promise<string>;
  seedDemoData: () => Promise<void>;
}

const PlatformContext = createContext<PlatformContextValue | undefined>(undefined);

export const PlatformProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userAccount, effectiveRole, authReady } = useAuth();

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('academy_theme') === 'dark';
  });
  const [language, setLanguageState] = useState<LanguageCode>('en');

  const [settings, setSettings] = useState<InstitutionSettings>(DEFAULT_INSTITUTION_SETTINGS);
  const [sessions, setSessions] = useState<AcademicSession[]>(DEFAULT_SESSIONS);
  const [classes, setClasses] = useState<AcademicClass[]>(DEFAULT_CLASSES);
  const [sections, setSections] = useState<SectionRecord[]>(DEFAULT_SECTIONS);
  const [subjects, setSubjects] = useState<SubjectRecord[]>(DEFAULT_SUBJECTS);
  const [teachers, setTeachers] = useState<TeacherRecord[]>(DEMO_TEACHERS);
  const [students, setStudents] = useState<StudentRecord[]>(DEMO_STUDENTS);
  const [staff, setStaff] = useState<StaffRecord[]>(DEMO_STAFF);
  const [admissions, setAdmissions] = useState<AdmissionApplication[]>(DEMO_ADMISSIONS);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(DEMO_ATTENDANCE);
  const [timetables, setTimetables] = useState<TimetableSlot[]>(DEMO_TIMETABLE);
  const [homework, setHomework] = useState<HomeworkItem[]>(DEMO_HOMEWORK);
  const [assignments, setAssignments] = useState<AssignmentItem[]>(DEMO_ASSIGNMENTS);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [examinations, setExaminations] = useState<ExaminationRecord[]>(DEMO_EXAMINATIONS);
  const [results, setResults] = useState<PublishedResult[]>(DEMO_RESULTS);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>(DEMO_FEE_STRUCTURES);
  const [invoices, setInvoices] = useState<FeeInvoice[]>(DEMO_INVOICES);
  const [payments, setPayments] = useState<PaymentRecord[]>(DEMO_PAYMENTS);
  const [courses, setCourses] = useState<LmsCourse[]>(DEMO_COURSES);
  const [lessons, setLessons] = useState<LmsLesson[]>(DEMO_LESSONS);
  const [lmsQuestionBanks, setLmsQuestionBanks] = useState<LmsQuestionBankDoc[]>(DEMO_LESSON_QUESTION_BANKS);
  const [lmsProgress, setLmsProgress] = useState<LmsCourseProgress[]>([]);
  const [lmsQa, setLmsQa] = useState<LmsQaEntry[]>(DEMO_LMS_QA);
  const [liveClasses, setLiveClasses] = useState<LiveClassSession[]>(DEMO_LIVE_CLASSES);
  const [library, setLibrary] = useState<LibraryResource[]>(DEMO_LIBRARY);
  const [libraryCategories, setLibraryCategories] = useState<LibraryCategory[]>(DEFAULT_LIBRARY_CATEGORIES);
  const [libraryBooks, setLibraryBooks] = useState<LibraryBook[]>(DEMO_LIBRARY_BOOKS);
  const [libraryReadingProgress, setLibraryReadingProgress] = useState<LibraryReadingProgress[]>([]);
  const [notices, setNotices] = useState<NoticeRecord[]>(DEMO_NOTICES);
  const [events, setEvents] = useState<EventRecord[]>(DEMO_EVENTS);
  const [gallery, setGallery] = useState<GalleryItem[]>(DEMO_GALLERY);
  const [certificates, setCertificates] = useState<CertificateRecord[]>(DEMO_CERTIFICATES);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationStatus>(DEFAULT_INTEGRATIONS_STATUS);
  const [isSeedingDemo, setIsSeedingDemo] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('academy_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);
  const setLanguage = (lang: LanguageCode) => setLanguageState(lang);

  const refreshIntegrations = async (): Promise<IntegrationStatus> => {
    if (isStaticOnlyHost()) {
      return DEFAULT_INTEGRATIONS_STATUS;
    }
    try {
      const res = await fetch(resolveApiUrl('/api/integrations/status'));
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = (await res.json()) as IntegrationStatus;
        setIntegrations(data);
        return data;
      }
    } catch {
      // Non-blocking fallback keeps DEFAULT_INTEGRATIONS_STATUS
    }
    return DEFAULT_INTEGRATIONS_STATUS;
  };

  // Fetch optional integration configuration status from Express backend
  useEffect(() => {
    void refreshIntegrations();
  }, []);

  // Public Firestore subscriptions (safe public collections)
  useEffect(() => {
    const unsubs: (() => void)[] = [];

    unsubs.push(
      onSnapshot(
        doc(db, 'institutionSettings', 'main'),
        (snap) => {
          if (snap.exists()) {
            setSettings({ ...DEFAULT_INSTITUTION_SETTINGS, ...(snap.data() as InstitutionSettings) });
          }
        },
        () => {
          // Keep defaults if offline or not yet seeded
        }
      )
    );

    const bindPublicCol = <T,>(
      name: string,
      setter: React.Dispatch<React.SetStateAction<T[]>>,
      fallback: T[]
    ) => {
      unsubs.push(
        onSnapshot(
          collection(db, name),
          (snap) => {
            if (!snap.empty) {
              setter(snap.docs.map((d) => ({ ...(d.data() as T), id: d.id })));
            } else {
              setter(fallback);
            }
          },
          () => {
            setter(fallback);
          }
        )
      );
    };

    bindPublicCol<AcademicSession>('academicSessions', setSessions, DEFAULT_SESSIONS);
    bindPublicCol<AcademicClass>('classes', setClasses, DEFAULT_CLASSES);
    bindPublicCol<SubjectRecord>('subjects', setSubjects, DEFAULT_SUBJECTS);
    bindPublicCol<TeacherRecord>('teachers', setTeachers, DEMO_TEACHERS);
    bindPublicCol<NoticeRecord>('notices', setNotices, DEMO_NOTICES);
    bindPublicCol<EventRecord>('events', setEvents, DEMO_EVENTS);
    bindPublicCol<GalleryItem>('gallery', setGallery, DEMO_GALLERY);
    bindPublicCol<LmsCourse>('courses', setCourses, DEMO_COURSES);
    bindPublicCol<PublishedResult>('results', setResults, DEMO_RESULTS);
    bindPublicCol<LibraryCategory>('libraryCategories', setLibraryCategories, DEFAULT_LIBRARY_CATEGORIES);

    // Public visitors read published Digital Library books (drafts remain restricted to Admin/Librarian)
    const qPublishedBooks = query(
      collection(db, 'libraryBooks'),
      where('status', '==', 'published')
    );
    unsubs.push(
      onSnapshot(
        qPublishedBooks,
        (snap) => {
          if (!snap.empty) {
            setLibraryBooks(snap.docs.map((d) => ({ ...(d.data() as LibraryBook), id: d.id })));
          } else {
            setLibraryBooks(DEMO_LIBRARY_BOOKS);
          }
        },
        () => {
          setLibraryBooks(DEMO_LIBRARY_BOOKS);
        }
      )
    );

    return () => unsubs.forEach((u) => u());
  }, []);

  // Authenticated role-aware Firestore subscriptions
  useEffect(() => {
    if (!authReady || !userAccount || !effectiveRole) return;
    const unsubs: (() => void)[] = [];

    const bindAuthCol = <T,>(
      name: string,
      setter: React.Dispatch<React.SetStateAction<T[]>>,
      fallback: T[]
    ) => {
      unsubs.push(
        onSnapshot(
          collection(db, name),
          (snap) => {
            if (!snap.empty) {
              setter(snap.docs.map((d) => ({ ...(d.data() as T), id: d.id })));
            } else {
              setter(fallback);
            }
          },
          () => {
            // Respect permission boundaries silently for unauthorized roles
          }
        )
      );
    };

    bindAuthCol<SectionRecord>('sections', setSections, DEFAULT_SECTIONS);
    bindAuthCol<TimetableSlot>('timetables', setTimetables, DEMO_TIMETABLE);
    bindAuthCol<HomeworkItem>('homework', setHomework, DEMO_HOMEWORK);
    bindAuthCol<AssignmentItem>('assignments', setAssignments, DEMO_ASSIGNMENTS);
    bindAuthCol<LmsLesson>('lessons', setLessons, DEMO_LESSONS);
    bindAuthCol<LmsQaEntry>('lmsQa', setLmsQa, DEMO_LMS_QA);
    bindAuthCol<LiveClassSession>('liveClasses', setLiveClasses, DEMO_LIVE_CLASSES);
    bindAuthCol<LibraryResource>('library', setLibrary, DEMO_LIBRARY);
    bindAuthCol<ExaminationRecord>('examinations', setExaminations, DEMO_EXAMINATIONS);
    bindAuthCol<FeeStructure>('feeStructures', setFeeStructures, DEMO_FEE_STRUCTURES);

    if (['super_admin', 'admin', 'principal', 'teacher'].includes(effectiveRole)) {
      bindAuthCol<LmsQuestionBankDoc>('lmsQuestionBanks', setLmsQuestionBanks, DEMO_LESSON_QUESTION_BANKS);
      bindAuthCol<LmsCourseProgress>('lmsProgress', setLmsProgress, []);
    } else if (effectiveRole === 'student') {
      const qStudentProgress = query(
        collection(db, 'lmsProgress'),
        where('studentUid', '==', userAccount.uid)
      );
      unsubs.push(
        onSnapshot(
          qStudentProgress,
          (snap) => {
            setLmsProgress(snap.docs.map((d) => ({ ...(d.data() as LmsCourseProgress), id: d.id })));
          },
          () => {
            // Respect permission boundaries silently
          }
        )
      );
    } else if (effectiveRole === 'parent') {
      const childIds = [
        ...(userAccount.linkedStudentIds || []),
        ...(userAccount.linkedStudentId ? [userAccount.linkedStudentId] : []),
      ].filter(Boolean);
      if (childIds.length > 0) {
        const qParentProgress = query(
          collection(db, 'lmsProgress'),
          where('studentId', 'in', childIds.slice(0, 10))
        );
        unsubs.push(
          onSnapshot(
            qParentProgress,
            (snap) => {
              setLmsProgress(snap.docs.map((d) => ({ ...(d.data() as LmsCourseProgress), id: d.id })));
            },
            () => {
              // Respect permission boundaries silently
            }
          )
        );
      }
    }

    if (['super_admin', 'admin', 'principal', 'teacher', 'accountant', 'staff'].includes(effectiveRole)) {
      bindAuthCol<StudentRecord>('students', setStudents, DEMO_STUDENTS);
      bindAuthCol<AttendanceRecord>('attendance', setAttendance, DEMO_ATTENDANCE);
      bindAuthCol<SubmissionItem>('submissions', setSubmissions, []);
    } else if (effectiveRole === 'student') {
      const qMyStudentByUid = query(
        collection(db, 'students'),
        where('studentUid', '==', userAccount.uid)
      );
      unsubs.push(
        onSnapshot(
          qMyStudentByUid,
          (snap) => {
            if (!snap.empty) {
              setStudents(snap.docs.map((d) => ({ ...(d.data() as StudentRecord), id: d.id })));
            }
          },
          () => {
            // Respect permission boundaries silently
          }
        )
      );

      if (userAccount.linkedStudentId) {
        unsubs.push(
          onSnapshot(
            doc(db, 'students', userAccount.linkedStudentId),
            (snap) => {
              if (snap.exists()) {
                setStudents([{ ...(snap.data() as StudentRecord), id: snap.id }]);
              }
            },
            () => {
              // Respect permission boundaries silently
            }
          )
        );

        const qMyAtt = query(
          collection(db, 'attendance'),
          where('targetId', '==', userAccount.linkedStudentId)
        );
        unsubs.push(
          onSnapshot(
            qMyAtt,
            (snap) => {
              if (!snap.empty) {
                setAttendance(snap.docs.map((d) => ({ ...(d.data() as AttendanceRecord), id: d.id })));
              }
            },
            () => {}
          )
        );

        const qMyInvoices = query(
          collection(db, 'invoices'),
          where('studentId', '==', userAccount.linkedStudentId)
        );
        unsubs.push(
          onSnapshot(
            qMyInvoices,
            (snap) => {
              if (!snap.empty) {
                setInvoices(snap.docs.map((d) => ({ ...(d.data() as FeeInvoice), id: d.id })));
              }
            },
            () => {}
          )
        );

        const qMyPayments = query(
          collection(db, 'payments'),
          where('studentId', '==', userAccount.linkedStudentId)
        );
        unsubs.push(
          onSnapshot(
            qMyPayments,
            (snap) => {
              if (!snap.empty) {
                setPayments(snap.docs.map((d) => ({ ...(d.data() as PaymentRecord), id: d.id })));
              }
            },
            () => {}
          )
        );

        const qMyCerts = query(
          collection(db, 'certificates'),
          where('studentId', '==', userAccount.linkedStudentId)
        );
        unsubs.push(
          onSnapshot(
            qMyCerts,
            (snap) => {
              if (!snap.empty) {
                setCertificates(snap.docs.map((d) => ({ ...(d.data() as CertificateRecord), id: d.id })));
              }
            },
            () => {}
          )
        );
      }

      const qMySubmissions = query(
        collection(db, 'submissions'),
        where('studentUid', '==', userAccount.uid)
      );
      unsubs.push(
        onSnapshot(
          qMySubmissions,
          (snap) => {
            setSubmissions(snap.docs.map((d) => ({ ...(d.data() as SubmissionItem), id: d.id })));
          },
          () => {}
        )
      );
    }

    if (['super_admin', 'admin', 'principal', 'staff'].includes(effectiveRole)) {
      bindAuthCol<AdmissionApplication>('admissions', setAdmissions, DEMO_ADMISSIONS);
      bindAuthCol<CertificateRecord>('certificates', setCertificates, DEMO_CERTIFICATES);
    }

    if (['super_admin', 'admin', 'accountant'].includes(effectiveRole)) {
      bindAuthCol<StaffRecord>('staff', setStaff, DEMO_STAFF);
      bindAuthCol<FeeInvoice>('invoices', setInvoices, DEMO_INVOICES);
      bindAuthCol<PaymentRecord>('payments', setPayments, DEMO_PAYMENTS);
    }

    if (['super_admin', 'admin', 'principal'].includes(effectiveRole)) {
      bindAuthCol<AuditLogEntry>('auditLogs', setAuditLogs, []);
    }

    if (['super_admin', 'admin'].includes(effectiveRole)) {
      bindAuthCol<UserAccount>('users', setUsers, []);
    }

    if (['super_admin', 'admin', 'principal', 'librarian'].includes(effectiveRole)) {
      bindAuthCol<LibraryBook>('libraryBooks', setLibraryBooks, DEMO_LIBRARY_BOOKS);
    }

    const qMyLibraryProgress = query(
      collection(db, 'libraryReadingProgress'),
      where('userUid', '==', userAccount.uid)
    );
    unsubs.push(
      onSnapshot(
        qMyLibraryProgress,
        (snap) => {
          setLibraryReadingProgress(
            snap.docs.map((d) => ({ ...(d.data() as LibraryReadingProgress), id: d.id }))
          );
        },
        () => {
          // Respect permission boundaries silently
        }
      )
    );

    bindAuthCol<NotificationItem>('notifications', setNotifications, []);

    return () => unsubs.forEach((u) => u());
  }, [authReady, userAccount, effectiveRole]);

  const logAudit = async (action: string, collectionName: string, documentId: string, detail: string) => {
    if (!userAccount) return;
    const logId = `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    try {
      await setDoc(doc(db, 'auditLogs', logId), {
        actorUid: userAccount.uid,
        actorEmail: userAccount.email,
        action: action.slice(0, 120),
        collectionName: collectionName.slice(0, 80),
        documentId: documentId.slice(0, 128),
        detail: detail.slice(0, 400),
        createdAt: serverTimestamp(),
      });
    } catch {
      // Do not interrupt workflow if audit log write is disallowed for role
    }
  };

  const upsertRecord = async (
    collectionName: string,
    id: string,
    data: Record<string, unknown>,
    auditDetail?: string
  ) => {
    const cleanId = id.replace(/[^a-zA-Z0-9_-]/g, '_');
    try {
      await setDoc(
        doc(db, collectionName, cleanId),
        {
          ...data,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      await logAudit('UPSERT', collectionName, cleanId, auditDetail || `Saved ${collectionName}/${cleanId}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `${collectionName}/${cleanId}`);
    }
  };

  const deleteRecord = async (collectionName: string, id: string, auditDetail?: string) => {
    try {
      await deleteDoc(doc(db, collectionName, id));
      await logAudit('DELETE', collectionName, id, auditDetail || `Deleted ${collectionName}/${id}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${collectionName}/${id}`);
    }
  };

  const submitAdmissionApplication = async (
    payload: Omit<AdmissionApplication, 'id' | 'applicationNumber' | 'status' | 'createdAt' | 'updatedAt'>
  ): Promise<string> => {
    const appNumber = `AIA-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const docId = `adm_${Date.now()}`;
    try {
      await setDoc(doc(db, 'admissions', docId), {
        ...payload,
        applicationNumber: appNumber,
        status: 'Pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return appNumber;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `admissions/${docId}`);
    }
  };

  const seedDemoData = async () => {
    if (!userAccount) return;
    setIsSeedingDemo(true);
    try {
      const batch = writeBatch(db);
      batch.set(doc(db, 'institutionSettings', 'main'), {
        ...DEFAULT_INSTITUTION_SETTINGS,
        updatedAt: serverTimestamp(),
      });
      DEFAULT_SESSIONS.forEach((s) => batch.set(doc(db, 'academicSessions', s.id), s));
      DEFAULT_CLASSES.forEach((c) => batch.set(doc(db, 'classes', c.id.replace(/\s+/g, '_')), c));
      DEFAULT_SECTIONS.forEach((sec) => batch.set(doc(db, 'sections', sec.id), sec));
      DEFAULT_SUBJECTS.forEach((sub) => batch.set(doc(db, 'subjects', sub.id), sub));
      DEMO_TEACHERS.forEach((t) => batch.set(doc(db, 'teachers', t.id), t));
      DEMO_STUDENTS.forEach((st) => batch.set(doc(db, 'students', st.id), st));
      DEMO_RESULTS.forEach((r) => batch.set(doc(db, 'results', r.id), r));
      DEMO_NOTICES.forEach((n) => batch.set(doc(db, 'notices', n.id), n));
      DEMO_EVENTS.forEach((ev) => batch.set(doc(db, 'events', ev.id), ev));
      DEMO_GALLERY.forEach((g) => batch.set(doc(db, 'gallery', g.id), g));
      DEMO_COURSES.forEach((c) => batch.set(doc(db, 'courses', c.id), c));
      DEMO_LESSONS.forEach((l) => batch.set(doc(db, 'lessons', l.id), l));
      DEMO_LESSON_QUESTION_BANKS.forEach((qb) => batch.set(doc(db, 'lmsQuestionBanks', qb.id), qb));
      DEMO_LMS_QA.forEach((qa) => batch.set(doc(db, 'lmsQa', qa.id), qa));
      DEMO_LIVE_CLASSES.forEach((lv) => batch.set(doc(db, 'liveClasses', lv.id), lv));
      DEMO_LIBRARY.forEach((lb) => batch.set(doc(db, 'library', lb.id), lb));
      DEFAULT_LIBRARY_CATEGORIES.forEach((cat) => batch.set(doc(db, 'libraryCategories', cat.id), cat));
      DEMO_LIBRARY_BOOKS.forEach((book) => batch.set(doc(db, 'libraryBooks', book.id), book));
      DEMO_TIMETABLE.forEach((tt) => batch.set(doc(db, 'timetables', tt.id), tt));
      DEMO_HOMEWORK.forEach((hw) => batch.set(doc(db, 'homework', hw.id), hw));
      DEMO_ASSIGNMENTS.forEach((asg) => batch.set(doc(db, 'assignments', asg.id), asg));
      DEMO_EXAMINATIONS.forEach((ex) => batch.set(doc(db, 'examinations', ex.id), ex));
      DEMO_FEE_STRUCTURES.forEach((fs) => batch.set(doc(db, 'feeStructures', fs.id), fs));
      DEMO_INVOICES.forEach((inv) => batch.set(doc(db, 'invoices', inv.id), inv));
      DEMO_PAYMENTS.forEach((p) => batch.set(doc(db, 'payments', p.id), p));
      DEMO_ATTENDANCE.forEach((a) => batch.set(doc(db, 'attendance', a.id), a));
      DEMO_STAFF.forEach((stf) => batch.set(doc(db, 'staff', stf.id), stf));
      DEMO_CERTIFICATES.forEach((crt) => batch.set(doc(db, 'certificates', crt.id), crt));

      await batch.commit();
      await logAudit('SEED_DEMO', 'institutionSettings', 'main', 'Seeded clearly labelled demo records to Firestore.');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'batch_seed_demo');
    } finally {
      setIsSeedingDemo(false);
    }
  };

  return (
    <PlatformContext.Provider
      value={{
        darkMode,
        toggleDarkMode,
        language,
        setLanguage,
        settings,
        sessions,
        classes,
        sections,
        subjects,
        teachers,
        students,
        staff,
        admissions,
        attendance,
        timetables,
        homework,
        assignments,
        submissions,
        examinations,
        results,
        feeStructures,
        invoices,
        payments,
        courses,
        lessons,
        lmsQuestionBanks,
        lmsProgress,
        lmsQa,
        liveClasses,
        library,
        libraryCategories,
        libraryBooks,
        libraryReadingProgress,
        notices,
        events,
        gallery,
        certificates,
        notifications,
        auditLogs,
        users,
        integrations,
        refreshIntegrations,
        isSeedingDemo,
        upsertRecord,
        deleteRecord,
        submitAdmissionApplication,
        seedDemoData,
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
};

export function usePlatform(): PlatformContextValue {
  const ctx = useContext(PlatformContext);
  if (!ctx) throw new Error('usePlatform must be used inside PlatformProvider');
  return ctx;
}
