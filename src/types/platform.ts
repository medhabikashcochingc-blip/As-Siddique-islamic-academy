export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'principal'
  | 'teacher'
  | 'accountant'
  | 'student'
  | 'parent'
  | 'librarian'
  | 'staff';

export type AccountStatus = 'active' | 'deactivated';

export type LanguageCode = 'en' | 'bn' | 'ar';

export interface UserAccount {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: AccountStatus;
  linkedStudentId?: string;
  linkedStudentIds?: string[];
  linkedParentId?: string;
  linkedTeacherId?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface InstitutionSettings {
  id: string;
  name: string;
  tagline: string;
  location: string;
  boardName: string;
  address: string;
  phone: string;
  email: string;
  registrationNote: string;
  heroHeadline: string;
  heroSubtext: string;
  aboutContent: string;
  visionText: string;
  missionText: string;
  principalName: string;
  principalTitle: string;
  principalMessage: string;
  footerNote: string;
  socialFacebook?: string;
  socialYoutube?: string;
  statsStudentsLabel: string;
  statsClassesLabel: string;
  updatedAt?: unknown;
}

export interface AcademicSession {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface AcademicClass {
  id: string;
  name: string;
  order: number;
  wing: 'Primary' | 'Upper Primary' | 'Secondary' | 'Higher Secondary';
  boardTrack: string;
  classTeacherId?: string;
}

export interface SectionRecord {
  id: string;
  name: string;
  classId: string;
  capacity: number;
  classTeacherId?: string;
}

export interface SubjectRecord {
  id: string;
  name: string;
  code: string;
  track: 'general' | 'islamic';
  classId: string;
  teacherId?: string;
  fullMarks: number;
  passMarks: number;
  isOptional: boolean;
}

export type AdmissionStatus = 'Pending' | 'Under Review' | 'Approved' | 'Rejected';

export interface AdmissionApplication {
  id: string;
  applicationNumber: string;
  studentName: string;
  dob: string;
  gender: 'Male' | 'Female';
  fatherName: string;
  motherName: string;
  guardianName: string;
  mobile: string;
  email?: string;
  address: string;
  previousSchool?: string;
  previousClass?: string;
  applyingClass: string;
  academicSession: string;
  learningMode: 'Offline School' | 'Online Classes' | 'Hybrid Learning';
  status: AdmissionStatus;
  source: 'online' | 'offline';
  photoUrl?: string;
  documentUrls?: string[];
  reviewNotes?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface IslamicProgress {
  quranSurah: string;
  nazirahLevel: string;
  tajweedGrade: string;
  hifzJuzCompleted: number;
  adabRemarks: string;
  dailyDuaMastered: number;
}

export interface StudentRecord {
  id: string;
  studentId: string;
  admissionNumber: string;
  rollNumber: string;
  name: string;
  fatherName: string;
  motherName: string;
  dob: string;
  gender: 'Male' | 'Female';
  classId: string;
  sectionId: string;
  sessionId: string;
  learningMode: 'Offline School' | 'Online Classes' | 'Hybrid Learning';
  phone: string;
  address: string;
  photoUrl?: string;
  studentUid?: string;
  parentUid?: string;
  status: 'active' | 'transferred' | 'archived';
  islamicProgress: IslamicProgress;
  isDemo?: boolean;
}

export interface TeacherRecord {
  id: string;
  uid?: string;
  name: string;
  designation: string;
  qualification: string;
  department: 'general' | 'islamic' | 'both';
  assignedClasses: string[];
  assignedSubjects: string[];
  phone?: string;
  email?: string;
  photoUrl?: string;
  photoStoragePath?: string;
  isPublic: boolean;
  bio: string;
  status: 'active' | 'on_leave' | 'inactive';
  isDemo?: boolean;
}

export interface StaffRecord {
  id: string;
  name: string;
  roleTitle: string;
  department: string;
  phone: string;
  salaryAmount: number;
  joinDate: string;
  status: 'active' | 'inactive';
  isDemo?: boolean;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Leave';

export interface AttendanceRecord {
  id: string;
  targetType: 'student' | 'teacher';
  targetId: string;
  targetName: string;
  classId?: string;
  date: string;
  status: AttendanceStatus;
  recordedBy: string;
  note?: string;
  parentUid?: string;
}

export interface TimetableSlot {
  id: string;
  classId: string;
  sectionId: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string;
  endTime: string;
  subjectName: string;
  teacherId?: string;
  teacherName: string;
  roomOrMode: string;
}

export interface HomeworkItem {
  id: string;
  title: string;
  description: string;
  classId: string;
  subjectName: string;
  dueDate: string;
  teacherUid: string;
  attachmentUrl?: string;
}

export interface AssignmentItem {
  id: string;
  title: string;
  instructions: string;
  classId: string;
  subjectName: string;
  dueDate: string;
  maxMarks: number;
  teacherUid: string;
}

export interface SubmissionItem {
  id: string;
  assignmentId: string;
  studentId: string;
  studentUid: string;
  studentName: string;
  submissionText: string;
  fileUrl?: string;
  marks?: number;
  feedback?: string;
  status: 'submitted' | 'late' | 'evaluated';
}

export interface ExaminationRecord {
  id: string;
  title: string;
  examType:
    | 'Unit Test'
    | 'Monthly Test'
    | 'Half-Yearly Examination'
    | 'Annual Examination'
    | 'Pre-Board Examination'
    | 'Class Test'
    | 'Islamic Education Assessment';
  sessionId: string;
  classId: string;
  startDate: string;
  status: 'scheduled' | 'marks_entry' | 'approved' | 'published';
}

export interface SubjectMark {
  subjectName: string;
  track: 'general' | 'islamic';
  fullMarks: number;
  passMarks: number;
  obtainedMarks: number;
}

export interface PublishedResult {
  id: string;
  examId: string;
  examTitle: string;
  studentName: string;
  fatherName: string;
  admissionNumber: string;
  rollNumber: string;
  classId: string;
  sessionId: string;
  photoUrl?: string;
  subjects: SubjectMark[];
  totalMarks: number;
  fullMarks: number;
  percentage: number;
  grade: string;
  resultStatus: 'Passed' | 'Compartment' | 'Needs Improvement';
  remarks: string;
  isPublished: boolean;
  isDemo?: boolean;
}

export interface FeeStructure {
  id: string;
  title: string;
  category: 'Admission Fee' | 'Tuition Fee' | 'Examination Fee' | 'Other Fee';
  classId: string;
  amount: number;
  frequency: 'Monthly' | 'Quarterly' | 'Annual' | 'One-Time';
}

export interface FeeInvoice {
  id: string;
  invoiceNumber: string;
  studentId: string;
  studentName: string;
  classId: string;
  title: string;
  amount: number;
  discountAmount: number;
  paidAmount: number;
  dueDate: string;
  status: 'Unpaid' | 'Partial' | 'Paid';
  parentUid?: string;
}

export interface PaymentRecord {
  id: string;
  receiptNumber: string;
  invoiceId: string;
  studentId: string;
  studentName: string;
  amount: number;
  method: 'Cash' | 'Bank Transfer' | 'Online Gateway';
  verified: boolean;
  paidAt: string;
  parentUid?: string;
}

export interface LmsCourseChapter {
  id: string;
  title: string;
  order: number;
}

export interface LmsCourse {
  id: string;
  title: string;
  sessionId: string;
  classId: string;
  subjectName: string;
  track: 'general' | 'islamic';
  instructorName: string;
  teacherUid?: string;
  description: string;
  isPublic: boolean;
  chapters?: LmsCourseChapter[];
  certificateEnabled?: boolean;
}

export interface LmsLecture {
  id: string;
  title: string;
  videoType: 'playbook' | 'upload' | 'url' | 'youtube';
  videoUrl: string;
  storagePath?: string;
  durationSeconds?: number;
  transcript?: string;
}

export interface LmsPublicMcqQuestion {
  id: string;
  question: string;
  options: [string, string, string, string];
}

export interface LmsMcqQuestion extends LmsPublicMcqQuestion {
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
}

export interface LmsQuestionBankDoc {
  id: string;
  lessonId: string;
  courseId: string;
  teacherUid?: string;
  passingPercentage: number;
  maxAttempts: number;
  randomizeQuestions: boolean;
  questions: LmsMcqQuestion[];
  updatedAt?: unknown;
}

export interface LmsLesson {
  id: string;
  courseId: string;
  chapterId?: string;
  chapterTitle: string;
  title: string;
  order: number;
  videoType?: 'playbook' | 'upload' | 'url' | 'youtube';
  videoUrl?: string;
  videoStoragePath?: string;
  durationSeconds?: number;
  lectures?: LmsLecture[];
  pdfUrl?: string;
  notes: string;
  transcript?: string;
  passingPercentage?: number;
  maxAttempts?: number;
  randomizeQuestions?: boolean;
  quizQuestionsPublic?: LmsPublicMcqQuestion[];
  sealedAnswerKey?: string;
  teacherUid?: string;
}

export interface LmsQuizQuestionResult {
  questionId: string;
  selectedIndex: number;
  correctIndex: number;
  correct: boolean;
  explanation: string;
}

export interface LmsQuizAttempt {
  attemptNumber: number;
  submittedAt: string;
  answers: Record<string, number>;
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  results: LmsQuizQuestionResult[];
  serverReceiptSig: string;
}

export interface LmsLessonProgress {
  lessonId: string;
  videoWatchSeconds: number;
  durationSeconds: number;
  maxWatchedPercent: number;
  lastPlaybackPosition: number;
  videoCompleted: boolean;
  watchProofToken?: string;
  unlocked: boolean;
  passed: boolean;
  bestScorePercent: number;
  attemptsCount: number;
  attempts: LmsQuizAttempt[];
  updatedAt: string;
}

export interface LmsCourseProgress {
  id: string;
  studentUid: string;
  studentId: string;
  studentName?: string;
  courseId: string;
  courseTitle?: string;
  courseCompletionPercent: number;
  completedLessonIds: string[];
  unlockedLessonIds: string[];
  passedLessonIds: string[];
  lastWatchedLessonId?: string;
  lessonProgress: Record<string, LmsLessonProgress>;
  certificateEarned?: boolean;
  certificateNumber?: string;
  certificateIssuedAt?: string;
  updatedAt?: unknown;
}

export interface LmsQaEntry {
  id: string;
  courseId: string;
  lessonId: string;
  authorUid: string;
  authorName: string;
  authorRole: UserRole;
  question: string;
  answer?: string;
  answeredBy?: string;
  createdAt: string;
}


export interface LiveClassSession {
  id: string;
  title: string;
  classId: string;
  subjectName: string;
  teacherName: string;
  meetingLink: string;
  recordingLink?: string;
  startTime: string;
  endTime: string;
  status: 'Scheduled' | 'Live' | 'Completed';
}

export interface LibraryResource {
  id: string;
  title: string;
  author: string;
  category:
    | 'General School Books'
    | 'Islamic Books'
    | 'Arabic Resources'
    | 'Quran Learning'
    | 'Subject Notes';
  classId: string;
  subjectName: string;
  fileUrl: string;
  allowDownload: boolean;
}

export type LibraryLanguage = 'Bengali' | 'Arabic' | 'English' | 'Urdu' | 'Other';
export type LibraryBookPermission = 'read_only' | 'download' | 'both';
export type LibraryBookStatus = 'published' | 'draft';

export interface LibraryCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  subcategories: string[];
  order: number;
  isActive: boolean;
}

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  publisher?: string;
  language: LibraryLanguage;
  categoryId: string;
  categoryName: string;
  subcategory?: string;
  description: string;
  tags: string[];
  publicationYear?: string;
  permission: LibraryBookPermission;
  status: LibraryBookStatus;
  featured: boolean;
  pdfUrl: string;
  pdfStoragePath?: string;
  coverUrl?: string;
  coverStoragePath?: string;
  fileSizeBytes?: number;
  pageCount?: number;
  viewsCount: number;
  downloadsCount: number;
  searchText?: string;
  ocrRequired?: boolean;
  uploadedByUid?: string;
  uploadedByName?: string;
  isSampleBook?: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface LibraryReadingProgress {
  id: string;
  userUid: string;
  bookId: string;
  lastPage: number;
  totalPages: number;
  zoom?: number;
  updatedAt?: unknown;
}

export interface NoticeRecord {
  id: string;
  refCode: string;
  title: string;
  category: 'Admissions' | 'Examinations' | 'Events & Holidays' | 'Academic';
  date: string;
  summary: string;
  body: string;
  isPublic: boolean;
}

export interface EventRecord {
  id: string;
  title: string;
  date: string;
  venue: string;
  description: string;
  isPublic: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  mediaType: 'photo' | 'video';
  url: string;
  caption: string;
  isPublic: boolean;
}

export interface CertificateRecord {
  id: string;
  certificateNumber: string;
  templateType:
    | 'Student ID Card'
    | 'Transfer Certificate'
    | 'Bonafide Certificate'
    | 'Character Certificate'
    | 'Academic Certificate'
    | 'Fee Receipt';
  studentId: string;
  studentName: string;
  issuedDate: string;
  issuedBy: string;
  parentUid?: string;
}

export interface NotificationItem {
  id: string;
  targetUid?: string;
  targetRole?: UserRole | 'all';
  category: string;
  title: string;
  message: string;
  read: boolean;
  createdAt?: unknown;
}

export interface AuditLogEntry {
  id: string;
  actorUid: string;
  actorEmail: string;
  action: string;
  collectionName: string;
  documentId?: string;
  detail: string;
  createdAt?: unknown;
}
