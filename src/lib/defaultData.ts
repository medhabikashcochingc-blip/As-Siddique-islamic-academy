import {
  AcademicClass,
  AcademicSession,
  AdmissionApplication,
  AssignmentItem,
  AttendanceRecord,
  CertificateRecord,
  EventRecord,
  ExaminationRecord,
  FeeInvoice,
  FeeStructure,
  GalleryItem,
  HomeworkItem,
  InstitutionSettings,
  LibraryBook,
  LibraryCategory,
  LibraryResource,
  LiveClassSession,
  LmsCourse,
  LmsLesson,
  LmsQaEntry,
  LmsQuestionBankDoc,
  NoticeRecord,
  PaymentRecord,
  PublishedResult,
  SectionRecord,
  StaffRecord,
  StudentRecord,
  SubjectRecord,
  TeacherRecord,
  TimetableSlot,
} from '../types/platform';
import { withBasePath } from './assetUrl';

export const HERO_MOSQUE_IMAGE = withBasePath('/src/assets/images/hero_mosque_academy_1795074356108.jpg');
export const PRINCIPAL_PORTRAIT_IMAGE = withBasePath('/src/assets/images/principal_scholar_portrait_1795074355746.jpg');
export const ONLINE_LEARNING_IMAGE = withBasePath('/src/assets/images/online_learning_session_1795074356262.jpg');
export const LIBRARY_HERO_IMAGE = withBasePath('/src/assets/images/library_reading_hall_1795360522131.jpg');

export const DEFAULT_INSTITUTION_SETTINGS: InstitutionSettings = {
  id: 'main',
  name: 'As-Siddique Islamic Academy',
  tagline: 'Learn · Practice · Preach',
  location: 'West Bengal, India',
  boardName: 'West Bengal State Board',
  address: 'West Bengal, India (Update Campus Street Address in Admin Settings)',
  phone: 'Update Official Contact Phone in Admin Settings',
  email: 'contact@assiddiqueacademy.example',
  registrationNote: 'Institution registration and board affiliation codes are configurable in Admin Settings.',
  heroHeadline: 'Where Sacred Wisdom Meets Academic Excellence',
  heroSubtext:
    'An integrated Class 1 to Class 12 institution in West Bengal, India uniting West Bengal State Board General Education with authentic Islamic scholarship across Offline, Online, and Hybrid learning.',
  aboutContent:
    'As-Siddique Islamic Academy is established to nurture balanced, conscientious learners from Class 1 through Class 12. Rooted in West Bengal, India, our institution brings together structured General School Education aligned with the West Bengal State Board alongside comprehensive Quranic, Arabic, and Islamic moral education.',
  visionText:
    'To raise a generation of scholars and citizens who embody faith, intellectual rigor, and compassionate service—capable of excelling in modern disciplines while remaining anchored in Islamic principles.',
  missionText:
    'To provide accessible, disciplined education across Offline, Online, and Hybrid modes in Bengali, English, and Arabic; pairing qualified subject educators with verified Islamic scholars.',
  principalName: 'Principal (Configure Name in Admin Settings)',
  principalTitle: 'Office of the Principal · As-Siddique Islamic Academy',
  principalMessage:
    'Assalamu Alaikum wa Rahmatullahi wa Barakatuh. Our commitment at As-Siddique Islamic Academy is to ensure that parents never have to choose between rigorous academic preparation and authentic Islamic upbringing. From Class 1 foundational literacy and Noorani Qaida through Class 12 board preparation and deeper Islamic studies, every learner is mentored with care, discipline, and accountability.',
  footerNote: 'Official Digital Education Platform · West Bengal, India · Class 1 to Class 12',
  statsStudentsLabel: 'Class 1–12 Integrated',
  statsClassesLabel: 'General & Islamic Wings',
};

export const DEFAULT_SESSIONS: AcademicSession[] = [
  {
    id: 'session-2026-2027',
    name: '2026–2027',
    startDate: '2026-04-01',
    endDate: '2027-03-31',
    isActive: true,
  },
];

export const DEFAULT_CLASSES: AcademicClass[] = Array.from({ length: 12 }, (_, idx) => {
  const num = idx + 1;
  const wing =
    num <= 5
      ? 'Primary'
      : num <= 8
      ? 'Upper Primary'
      : num <= 10
      ? 'Secondary'
      : 'Higher Secondary';
  const boardTrack =
    num <= 10
      ? 'West Bengal State Board (Configurable)'
      : 'WBCHSE Higher Secondary (Configurable)';
  return {
    id: `Class ${num}`,
    name: `Class ${num}`,
    order: num,
    wing,
    boardTrack,
  };
});

export const DEFAULT_SECTIONS: SectionRecord[] = [
  { id: 'sec-1a', name: 'Section A', classId: 'Class 1', capacity: 30 },
  { id: 'sec-5a', name: 'Section A', classId: 'Class 5', capacity: 35 },
  { id: 'sec-8a', name: 'Section A', classId: 'Class 8', capacity: 35 },
  { id: 'sec-10a', name: 'Section A', classId: 'Class 10', capacity: 40 },
  { id: 'sec-12a', name: 'Section A', classId: 'Class 12', capacity: 40 },
];

export const DEFAULT_SUBJECTS: SubjectRecord[] = [
  { id: 'sub-bn-1', name: 'Bengali (First Language)', code: 'GEN-BN', track: 'general', classId: 'Class 1', fullMarks: 100, passMarks: 35, isOptional: false },
  { id: 'sub-en-1', name: 'English', code: 'GEN-EN', track: 'general', classId: 'Class 1', fullMarks: 100, passMarks: 35, isOptional: false },
  { id: 'sub-ma-1', name: 'Mathematics', code: 'GEN-MA', track: 'general', classId: 'Class 1', fullMarks: 100, passMarks: 35, isOptional: false },
  { id: 'sub-qr-1', name: 'Quran & Nazirah', code: 'ISL-QR', track: 'islamic', classId: 'Class 1', fullMarks: 100, passMarks: 40, isOptional: false },
  { id: 'sub-ar-1', name: 'Arabic & Islamic Manners', code: 'ISL-AR', track: 'islamic', classId: 'Class 1', fullMarks: 100, passMarks: 40, isOptional: false },
  { id: 'sub-bn-10', name: 'Bengali (WB Board Track)', code: 'GEN-BN10', track: 'general', classId: 'Class 10', fullMarks: 100, passMarks: 35, isOptional: false },
  { id: 'sub-en-10', name: 'English', code: 'GEN-EN10', track: 'general', classId: 'Class 10', fullMarks: 100, passMarks: 35, isOptional: false },
  { id: 'sub-ma-10', name: 'Mathematics', code: 'GEN-MA10', track: 'general', classId: 'Class 10', fullMarks: 100, passMarks: 35, isOptional: false },
  { id: 'sub-sc-10', name: 'Physical & Life Sciences', code: 'GEN-SC10', track: 'general', classId: 'Class 10', fullMarks: 100, passMarks: 35, isOptional: false },
  { id: 'sub-fq-10', name: 'Tajweed, Fiqh & Aqeedah', code: 'ISL-FQ10', track: 'islamic', classId: 'Class 10', fullMarks: 100, passMarks: 40, isOptional: false },
  { id: 'sub-ar-10', name: 'Arabic & Seerah', code: 'ISL-AR10', track: 'islamic', classId: 'Class 10', fullMarks: 100, passMarks: 40, isOptional: false },
];

export const DEMO_TEACHERS: TeacherRecord[] = [
  {
    id: 'demo-teacher-islamic',
    name: 'Sample Faculty — Islamic Studies & Quran',
    designation: 'Lead Instructor (Demo Profile)',
    qualification: 'Alim / Fazil & Tajweed Certification (Edit in Admin)',
    department: 'islamic',
    assignedClasses: ['Class 4', 'Class 5', 'Class 8', 'Class 10'],
    assignedSubjects: ['Quran & Nazirah', 'Tajweed, Fiqh & Aqeedah', 'Arabic & Seerah'],
    photoUrl: withBasePath('/src/assets/images/teacher_quran_arabic_1795074356458.jpg'),
    isPublic: true,
    bio: 'Clearly labelled demo faculty profile. Administrators can replace or add real verified teacher names, qualifications, and photographs in Admin Panel → Teachers.',
    status: 'active',
    isDemo: true,
  },
  {
    id: 'demo-teacher-science',
    name: 'Sample Faculty — General Sciences',
    designation: 'Science Educator (Demo Profile)',
    qualification: 'M.Sc., B.Ed. (Edit in Admin)',
    department: 'general',
    assignedClasses: ['Class 8', 'Class 9', 'Class 10', 'Class 12'],
    assignedSubjects: ['Physical & Life Sciences', 'Chemistry'],
    photoUrl: withBasePath('/src/assets/images/teacher_science_female_1795074356658.jpg'),
    isPublic: true,
    bio: 'Clearly labelled demo faculty profile for General School Education Sciences. Update with verified staff records in the Admin Panel.',
    status: 'active',
    isDemo: true,
  },
  {
    id: 'demo-teacher-math',
    name: 'Sample Faculty — Mathematics & Bengali/English',
    designation: 'Senior Mathematics Lead (Demo Profile)',
    qualification: 'M.Sc. Mathematics (Edit in Admin)',
    department: 'general',
    assignedClasses: ['Class 6', 'Class 8', 'Class 10', 'Class 12'],
    assignedSubjects: ['Mathematics', 'English'],
    photoUrl: withBasePath('/src/assets/images/teacher_math_male_1795074356342.jpg'),
    isPublic: true,
    bio: 'Clearly labelled demo faculty profile for Mathematics across Offline and Online cohorts.',
    status: 'active',
    isDemo: true,
  },
];

export const DEMO_STUDENTS: StudentRecord[] = [
  {
    id: 'STU-2026-001',
    studentId: 'STU-2026-001',
    admissionNumber: 'ADM-2026-101',
    rollNumber: '1001',
    name: 'Demo Student (Class 10)',
    fatherName: 'Guardian Demo Record',
    motherName: 'Mother Demo Record',
    dob: '2011-05-14',
    gender: 'Male',
    classId: 'Class 10',
    sectionId: 'Section A',
    sessionId: '2026–2027',
    learningMode: 'Hybrid Learning',
    phone: 'Demo Contact Only',
    address: 'West Bengal, India (Demo Entry)',
    status: 'active',
    islamicProgress: {
      quranSurah: 'Surah Yaseen (Nazirah)',
      nazirahLevel: 'Fluent with Rules',
      tajweedGrade: 'A',
      hifzJuzCompleted: 3,
      adabRemarks: 'Respectful and punctual in daily prayers (Demo)',
      dailyDuaMastered: 28,
    },
    isDemo: true,
  },
  {
    id: 'STU-2026-002',
    studentId: 'STU-2026-002',
    admissionNumber: 'ADM-2026-102',
    rollNumber: '502',
    name: 'Demo Student (Class 5)',
    fatherName: 'Guardian Demo Record',
    motherName: 'Mother Demo Record',
    dob: '2016-09-02',
    gender: 'Female',
    classId: 'Class 5',
    sectionId: 'Section A',
    sessionId: '2026–2027',
    learningMode: 'Offline School',
    phone: 'Demo Contact Only',
    address: 'West Bengal, India (Demo Entry)',
    status: 'active',
    islamicProgress: {
      quranSurah: 'Juz Amma Complete',
      nazirahLevel: 'Developing Fluency',
      tajweedGrade: 'A-',
      hifzJuzCompleted: 1,
      adabRemarks: 'Attentive in Noorani & Tajweed circle (Demo)',
      dailyDuaMastered: 20,
    },
    isDemo: true,
  },
];

export const DEMO_RESULTS: PublishedResult[] = [
  {
    id: 'RES-2026-1001',
    examId: 'EXAM-HY-2026',
    examTitle: 'Half-Yearly Examination 2026–2027 (Demo)',
    studentName: 'Demo Student (Class 10)',
    fatherName: 'Guardian Demo Record',
    admissionNumber: 'ADM-2026-101',
    rollNumber: '1001',
    classId: 'Class 10',
    sessionId: '2026–2027',
    subjects: [
      { subjectName: 'Bengali (First Language)', track: 'general', fullMarks: 100, passMarks: 35, obtainedMarks: 86 },
      { subjectName: 'English', track: 'general', fullMarks: 100, passMarks: 35, obtainedMarks: 88 },
      { subjectName: 'Mathematics', track: 'general', fullMarks: 100, passMarks: 35, obtainedMarks: 91 },
      { subjectName: 'Physical & Life Sciences', track: 'general', fullMarks: 100, passMarks: 35, obtainedMarks: 84 },
      { subjectName: 'Tajweed, Fiqh & Aqeedah', track: 'islamic', fullMarks: 100, passMarks: 40, obtainedMarks: 92 },
      { subjectName: 'Arabic & Seerah', track: 'islamic', fullMarks: 100, passMarks: 40, obtainedMarks: 89 },
    ],
    totalMarks: 530,
    fullMarks: 600,
    percentage: 88.33,
    grade: 'A+',
    resultStatus: 'Passed',
    remarks: 'Demo Result Record — Balanced excellence in General and Islamic Education.',
    isPublished: true,
    isDemo: true,
  },
];

export const DEMO_NOTICES: NoticeRecord[] = [
  {
    id: 'notice-adm-2026',
    refCode: 'AIA/ADM/2026-01',
    title: 'Admissions Open for Session 2026–2027 (Class 1 to Class 12)',
    category: 'Admissions',
    date: '2026-11-18',
    summary:
      'Applications are open across Offline School, Online Classes, and Hybrid Learning tracks for General and Islamic Education.',
    body:
      'Parents and guardians may apply online via the Admissions Portal or visit the Academy office in West Bengal. All official notices can be managed by authorized staff in the Admin Panel.',
    isPublic: true,
  },
  {
    id: 'notice-exam-2026',
    refCode: 'AIA/EXM/2026-02',
    title: 'Half-Yearly Written & Quran Tajweed Oral Evaluation Schedule',
    category: 'Examinations',
    date: '2026-11-12',
    summary:
      'Combined assessment schedule covering General School subjects and Islamic Education oral evaluations.',
    body:
      'Written assessments will be conducted class-wise from Class 1 to Class 12 alongside individual Tajweed and Nazirah evaluations. Approved results will be published on the Online Result Portal.',
    isPublic: true,
  },
];

export const DEMO_EVENTS: EventRecord[] = [
  {
    id: 'evt-seerah-2026',
    title: 'Annual Seerah & Multilingual Oratory Assembly (Bengali · English · Arabic)',
    date: '2026-12-12',
    venue: 'Academy Courtyard & Live Stream',
    description:
      'Students from Class 1–12 present Seerah reflections, Quran recitation, and science demonstrations.',
    isPublic: true,
  },
  {
    id: 'evt-ptm-2026',
    title: 'Parent–Teacher Dual Progress Consultation',
    date: '2026-12-20',
    venue: 'Campus Classrooms & Online Wing',
    description:
      'Combined review of West Bengal Board academics and Islamic Tarbiyah progress.',
    isPublic: true,
  },
];

export const DEMO_GALLERY: GalleryItem[] = [
  {
    id: 'gal-courtyard',
    title: 'Academy Courtyard & Mosque Architecture',
    mediaType: 'photo',
    url: HERO_MOSQUE_IMAGE,
    caption: 'Architectural concept visualization for the Academy courtyard.',
    isPublic: true,
  },
  {
    id: 'gal-online',
    title: 'Hybrid & Online Learning Session',
    mediaType: 'photo',
    url: ONLINE_LEARNING_IMAGE,
    caption: 'Interactive online learning across Bengali, English, and Arabic tracks.',
    isPublic: true,
  },
];

export const DEMO_COURSES: LmsCourse[] = [
  {
    id: 'crs-quran-tajweed',
    title: 'Quran Learning, Makharij & Applied Tajweed',
    sessionId: '2026–2027',
    classId: 'Class 5',
    subjectName: 'Quran & Nazirah',
    track: 'islamic',
    instructorName: 'Islamic Studies Wing',
    description: 'Step-by-step mastery of Arabic articulation points, Madd rules, and fluent Nazirah recitation.',
    isPublic: true,
    certificateEnabled: true,
    chapters: [
      { id: 'ch-qt-1', title: 'Chapter 1: Foundations of Makharij & Madd', order: 1 },
    ],
  },
  {
    id: 'crs-arabic-foundations',
    title: 'Arabic Language, Nahw & Daily Duas',
    sessionId: '2026–2027',
    classId: 'Class 8',
    subjectName: 'Arabic & Seerah',
    track: 'islamic',
    instructorName: 'Arabic & Seerah Wing',
    description: 'Right-to-left classical Arabic comprehension, grammar basics, and Prophetic Supplications.',
    isPublic: true,
    certificateEnabled: true,
    chapters: [
      { id: 'ch-ar-1', title: 'Chapter 1: Arabic Alphabet & Nominal Sentences', order: 1 },
    ],
  },
  {
    id: 'crs-hadith-seerah',
    title: 'Hadith & Seerah of the Prophet (ﷺ)',
    sessionId: '2026–2027',
    classId: 'Class 10',
    subjectName: 'Hadith & Seerah',
    track: 'islamic',
    instructorName: 'Islamic Studies Wing',
    description: 'Authentic 40 Hadith studies, Makkan and Madinan Seerah timeline, and prophetic character lessons.',
    isPublic: true,
    certificateEnabled: true,
    chapters: [
      { id: 'ch-hs-1', title: 'Chapter 1: Introduction to Hadith Sciences', order: 1 },
    ],
  },
  {
    id: 'crs-aqeedah-fiqh',
    title: 'Aqeedah & Fiqh Foundations (Taharah, Salah & Akhlaq)',
    sessionId: '2026–2027',
    classId: 'Class 10',
    subjectName: 'Tajweed, Fiqh & Aqeedah',
    track: 'islamic',
    instructorName: 'Islamic Studies Wing',
    description: 'Clear foundations of Islamic creed, practical rulings of worship, and moral ethics for daily life.',
    isPublic: true,
    certificateEnabled: true,
    chapters: [
      { id: 'ch-af-1', title: 'Chapter 1: Pillars of Iman & Taharah', order: 1 },
    ],
  },
  {
    id: 'crs-islamic-studies',
    title: 'Integrated Islamic Studies & Tarbiyah (Class 1–12)',
    sessionId: '2026–2027',
    classId: 'Class 1',
    subjectName: 'Islamic Manners & Studies',
    track: 'islamic',
    instructorName: 'Islamic Studies Wing',
    description: 'Age-graded Islamic worldview, Adab, Memorization of short Surahs, and Duas across school wings.',
    isPublic: true,
    certificateEnabled: true,
    chapters: [
      { id: 'ch-is-1', title: 'Chapter 1: Daily Adab & Sunnah', order: 1 },
    ],
  },
  {
    id: 'crs-wb-math-10',
    title: 'Class 10 Mathematics — West Bengal Board Track',
    sessionId: '2026–2027',
    classId: 'Class 10',
    subjectName: 'Mathematics',
    track: 'general',
    instructorName: 'Mathematics Wing',
    description: 'Structured algebra, geometry, and trigonometry lessons with sequential mastery assessments.',
    isPublic: true,
    certificateEnabled: true,
    chapters: [
      { id: 'ch-m10-1', title: 'Chapter 1: Quadratic Equations & Sridharacharya Formula', order: 1 },
    ],
  },
];

export const DEMO_LESSON_QUESTION_BANKS: LmsQuestionBankDoc[] = [
  {
    id: 'les-1',
    lessonId: 'les-1',
    courseId: 'crs-quran-tajweed',
    passingPercentage: 70,
    maxAttempts: 5,
    randomizeQuestions: false,
    questions: [
      {
        id: 'les-1-q1',
        question: 'How many main articulation zones (Makharij Al-Ammah) are taught in classical Tajweed?',
        options: ['3 main zones', '5 main zones', '7 main zones', '10 main zones'],
        correctIndex: 1,
        explanation: 'The 5 main zones are Al-Jawf, Al-Halq, Al-Lisan, Ash-Shafatan, and Al-Khayshum.',
      },
      {
        id: 'les-1-q2',
        question: 'Which articulation zone produces the six throat letters (Huroof Al-Halqiyah)?',
        options: ['Al-Khayshum', 'Al-Halq', 'Ash-Shafatan', 'Al-Jawf'],
        correctIndex: 1,
        explanation: 'Al-Halq refers to the throat, divided into deep, middle, and upper throat.',
      },
      {
        id: 'les-1-q3',
        question: 'Which pair of letters originates from the middle of the throat (Wasat al-Halq)?',
        options: ['Hamzah & Ha (ء هـ)', 'Ayn & Ha (ع ح)', 'Ghayn & Kha (غ خ)', 'Ba & Mim (ب م)'],
        correctIndex: 1,
        explanation: 'Ayn (ع) and Ha (ح) are articulated from the middle of the throat.',
      },
      {
        id: 'les-1-q4',
        question: 'What does Al-Khayshum refer to in Quran recitation?',
        options: ['The lips', 'The nasal passage for Ghunnah', 'The upper palate', 'The front teeth'],
        correctIndex: 1,
        explanation: 'Al-Khayshum is the nasal passage responsible for the nasalization sound (Ghunnah).',
      },
      {
        id: 'les-1-q5',
        question: 'What is the primary goal of practicing Makharij with teacher supervision?',
        options: [
          'Reciting faster than others',
          'Giving each Arabic letter its exact sound and rights',
          'Skipping short vowel marks',
          'Changing letter meanings intentionally',
        ],
        correctIndex: 1,
        explanation: 'Accurate Makharij preserves pronunciation clarity and the exact meaning of the Quran.',
      },
    ],
  },
  {
    id: 'les-1-2',
    lessonId: 'les-1-2',
    courseId: 'crs-quran-tajweed',
    passingPercentage: 70,
    maxAttempts: 5,
    randomizeQuestions: false,
    questions: [
      {
        id: 'les-1-2-q1',
        question: 'How many counts (Harakat) is Madd Asli / Madd Tabee‘i lengthened naturally?',
        options: ['1 count', '2 counts', '4 counts', '6 counts'],
        correctIndex: 1,
        explanation: 'Natural lengthening (Madd Tabee‘i) is consistently held for 2 Harakat.',
      },
      {
        id: 'les-1-2-q2',
        question: 'Which three letters act as Madd letters when preceded by their matching vowel?',
        options: ['Alif, Waw, Ya (ا و ي)', 'Nun, Mim, Lam', 'Qaf, Ta, Ba', 'Sad, Dad, Zha'],
        correctIndex: 0,
        explanation: 'Alif with Fathah, Waw Sakinah with Dammah, and Ya Sakinah with Kasrah form the 3 Madd letters.',
      },
      {
        id: 'les-1-2-q3',
        question: 'When Hamzah follows a Madd letter inside the same word, what Madd occurs?',
        options: ['Madd Muttasil (Obligatory)', 'Madd Munfasil', 'Madd Badal', 'No Madd'],
        correctIndex: 0,
        explanation: 'Madd Wajib Muttasil occurs when a Madd letter and Hamzah appear in the same word.',
      },
      {
        id: 'les-1-2-q4',
        question: 'How long is Ghunnah held during Idgham with Ghunnah or Ikhfa?',
        options: ['0 counts', '1 count', '2 counts', '6 counts'],
        correctIndex: 2,
        explanation: 'Ghunnah is measured cleanly at 2 Harakat.',
      },
      {
        id: 'les-1-2-q5',
        question: 'Which rule applies when Nun Sakinah is followed by the letter Ba (ب)?',
        options: ['Izhar', 'Iqlab', 'Qalqalah', 'Tafkheem'],
        correctIndex: 1,
        explanation: 'Iqlab converts Nun Sakinah or Tanween into a hidden Mim sound before Ba (ب).',
      },
    ],
  },
  {
    id: 'les-2',
    lessonId: 'les-2',
    courseId: 'crs-wb-math-10',
    passingPercentage: 70,
    maxAttempts: 5,
    randomizeQuestions: false,
    questions: [
      {
        id: 'les-2-q1',
        question: 'What is the standard form of a single-variable quadratic equation?',
        options: ['ax + b = 0', 'ax² + bx + c = 0 (a ≠ 0)', 'ax³ + bx + c = 0', 'a/x + b = 0'],
        correctIndex: 1,
        explanation: 'A quadratic equation has degree 2 in standard form ax² + bx + c = 0 with a ≠ 0.',
      },
      {
        id: 'les-2-q2',
        question: 'When does ax² + bx + c = 0 have two equal real roots?',
        options: ['b² - 4ac > 0', 'b² - 4ac = 0', 'b² - 4ac < 0', 'a + b + c = 0'],
        correctIndex: 1,
        explanation: 'When the discriminant Δ = b² - 4ac equals 0, the roots are real and equal.',
      },
      {
        id: 'les-2-q3',
        question: 'Factorize the quadratic expression x² - 5x + 6 = 0.',
        options: ['(x - 2)(x - 3) = 0', '(x + 2)(x + 3) = 0', '(x - 1)(x - 6) = 0', '(x + 1)(x - 6) = 0'],
        correctIndex: 0,
        explanation: 'Since (-2) + (-3) = -5 and (-2) × (-3) = +6, the factors are (x - 2)(x - 3) = 0.',
      },
      {
        id: 'les-2-q4',
        question: 'What is the sum of the two roots (α + β) of ax² + bx + c = 0?',
        options: ['c/a', '-b/a', 'b/a', '-c/a'],
        correctIndex: 1,
        explanation: 'By Vieta’s formulas, the sum of roots α + β equals -b/a.',
      },
      {
        id: 'les-2-q5',
        question: 'If x = 2 is a root of x² + kx - 6 = 0, find the value of k.',
        options: ['1', '-1', '2', '3'],
        correctIndex: 0,
        explanation: 'Substituting x = 2 gives 4 + 2k - 6 = 0, so 2k = 2 and k = 1.',
      },
    ],
  },
  {
    id: 'les-2-2',
    lessonId: 'les-2-2',
    courseId: 'crs-wb-math-10',
    passingPercentage: 70,
    maxAttempts: 5,
    randomizeQuestions: false,
    questions: [
      {
        id: 'les-2-2-q1',
        question: 'Who formulated the Sridharacharya (Quadratic) formula used in the WB Board syllabus?',
        options: ['Euclid', 'Sridharacharya', 'Pythagoras', 'Archimedes'],
        correctIndex: 1,
        explanation: 'Acharya Sridhara derived x = (-b ± √(b² - 4ac)) / (2a).',
      },
      {
        id: 'les-2-2-q2',
        question: 'What is the discriminant of 2x² - 4x + 3 = 0?',
        options: ['8', '-8', '40', '0'],
        correctIndex: 1,
        explanation: 'Δ = (-4)² - 4(2)(3) = 16 - 24 = -8.',
      },
      {
        id: 'les-2-2-q3',
        question: 'If discriminant Δ < 0, what is the nature of the roots?',
        options: ['Two distinct real roots', 'Equal real roots', 'No real roots (complex)', 'Infinite roots'],
        correctIndex: 2,
        explanation: 'A negative discriminant means no real square root exists.',
      },
      {
        id: 'les-2-2-q4',
        question: 'What is the product of roots (αβ) for 3x² - 7x + 12 = 0?',
        options: ['7/3', '4', '-4', '12'],
        correctIndex: 1,
        explanation: 'Product of roots αβ = c/a = 12/3 = 4.',
      },
      {
        id: 'les-2-2-q5',
        question: 'If one root of x² - 9x + 20 = 0 is 4, what is the other root?',
        options: ['3', '5', '6', '16'],
        correctIndex: 1,
        explanation: 'Sum of roots = 9, so the second root is 9 - 4 = 5.',
      },
    ],
  },
  {
    id: 'les-3',
    lessonId: 'les-3',
    courseId: 'crs-arabic-foundations',
    passingPercentage: 70,
    maxAttempts: 5,
    randomizeQuestions: false,
    questions: [
      {
        id: 'les-3-q1',
        question: 'With which part of speech does an Arabic Nominal Sentence (Al-Jumlah Al-Ismiyyah) begin?',
        options: ['A Verb (Fi‘l)', 'A Noun (Ism)', 'A Particle (Harf)', 'An Imperative'],
        correctIndex: 1,
        explanation: 'Al-Jumlah Al-Ismiyyah starts with an Ism and consists of Mubtada (subject) and Khabar (predicate).',
      },
      {
        id: 'les-3-q2',
        question: 'What are the two essential pillars of a complete nominal sentence in Arabic?',
        options: ['Fa‘il and Maf‘ul', 'Mubtada and Khabar', 'Hal and Tamyiz', 'Jar and Majrur'],
        correctIndex: 1,
        explanation: 'Mubtada (the subject started with) and Khabar (the news/predicate) form Al-Jumlah Al-Ismiyyah.',
      },
      {
        id: 'les-3-q3',
        question: 'In classical Nahw, what is the default grammatical case ending (I‘rab) of both Mubtada and Khabar?',
        options: ['Mansub (Fathah)', 'Marfu‘ (Dammah)', 'Majrur (Kasrah)', 'Majzum (Sukun)'],
        correctIndex: 1,
        explanation: 'Both Mubtada and Khabar are Marfu‘ (nominative, typically ending in Dammah or Dammatayn).',
      },
      {
        id: 'les-3-q4',
        question: 'In "Al-Kitabu mufidun" (الكتابُ مفيدٌ), which word is normally definite with "Al-" (المعرفة)?',
        options: ['The Khabar (مفيدٌ)', 'The Mubtada (الكتابُ)', 'Neither word', 'Only prepositions'],
        correctIndex: 1,
        explanation: 'The Mubtada is generally definite (Ma‘rifah) while the Khabar is typically indefinite (Nakirah).',
      },
      {
        id: 'les-3-q5',
        question: 'How does the Khabar agree with a feminine singular Mubtada such as "Al-Madrasatu"?',
        options: [
          'It stays masculine',
          'It agrees in gender and takes feminine form (e.g., kabiratun)',
          'It becomes plural automatically',
          'It drops its last letter',
        ],
        correctIndex: 1,
        explanation: 'The Khabar must match the Mubtada in gender (masculine/feminine) and number.',
      },
    ],
  },
  {
    id: 'les-3-2',
    lessonId: 'les-3-2',
    courseId: 'crs-arabic-foundations',
    passingPercentage: 70,
    maxAttempts: 5,
    randomizeQuestions: false,
    questions: [
      {
        id: 'les-3-2-q1',
        question: 'Which attached Arabic phrase correctly says "In the name of Allah" before starting study?',
        options: ['Alhamdulillahi', 'Bismillahi', 'Subhanallahi', 'JazakAllahu'],
        correctIndex: 1,
        explanation: 'Bismillahi (بسم الله) means "In the name of Allah" and combines bi + ismi + Allahi.',
      },
      {
        id: 'les-3-2-q2',
        question: 'What grammatical effect does a preposition (Harf Jar such as fi, ila, min) have on the following noun?',
        options: ['Makes it Marfu‘', 'Makes it Majrur (Kasrah)', 'Makes it Mansub', 'Deletes its vowel'],
        correctIndex: 1,
        explanation: 'Prepositions (Huruf Al-Jarr) place the following noun into the Majrur state.',
      },
      {
        id: 'les-3-2-q3',
        question: 'What does the Prophetic Dua "Rabbi zidni ‘ilma" (رَبِّ زِدْنِي عِلْمًا) mean?',
        options: [
          'My Lord, grant me safe travel',
          'My Lord, increase me in knowledge',
          'My Lord, forgive my parents',
          'My Lord, bless our meal',
        ],
        correctIndex: 1,
        explanation: 'Taught in Surah Taha (20:114), "Rabbi zidni ‘ilma" asks Allah to increase beneficial knowledge.',
      },
      {
        id: 'les-3-2-q4',
        question: 'Which Arabic detached pronoun means "We" in nominal sentences?',
        options: ['Ana (أنا)', 'Nahnu (نحن)', 'Anta (أنت)', 'Huwa (هو)'],
        correctIndex: 1,
        explanation: 'Nahnu (نحن) is the first-person plural pronoun meaning "We".',
      },
      {
        id: 'les-3-2-q5',
        question: 'How is the Arabic Dual (Muthanna) masculine noun formed in the nominative case?',
        options: ['Adding -una (ـون)', 'Adding -ani (ـانِ)', 'Adding -atun (ـات)', 'Prefixing Al- only'],
        correctIndex: 1,
        explanation: 'Adding Alif-Nun (-ani) creates the nominative dual form (e.g., Qalamani = two pens).',
      },
    ],
  },
  {
    id: 'les-4',
    lessonId: 'les-4',
    courseId: 'crs-hadith-seerah',
    passingPercentage: 70,
    maxAttempts: 5,
    randomizeQuestions: false,
    questions: [
      {
        id: 'les-4-q1',
        question: 'What is the central teaching of the first Hadith in Imam An-Nawawi’s collection?',
        options: [
          'Only long prayers are accepted',
          'Actions are judged according to intentions (Niyyah)',
          'Charity is only for Ramadan',
          'Seeking wealth is obligatory first',
        ],
        correctIndex: 1,
        explanation: 'The Prophet (ﷺ) taught: "Innamal a‘malu bin-niyyat" — deeds are judged by their intentions.',
      },
      {
        id: 'les-4-q2',
        question: 'Which companion narrated the famous Hadith "Actions are by intentions"?',
        options: ['Abu Hurayrah (RA)', 'Umar ibn Al-Khattab (RA)', 'Anas ibn Malik (RA)', 'Bilal ibn Rabah (RA)'],
        correctIndex: 1,
        explanation: 'The Hadith was narrated by Amir al-Mu’minin Umar ibn Al-Khattab (RA) from the pulpit.',
      },
      {
        id: 'les-4-q3',
        question: 'What do the two terms "Sanad" and "Matn" refer to in Hadith Sciences?',
        options: [
          'Chapter and verse',
          'Chain of narrators (Sanad) and exact text (Matn)',
          'Translation and commentary',
          'Mosque and school',
        ],
        correctIndex: 1,
        explanation: 'Hadith scholars verify both the unbroken chain of reliable narrators (Sanad) and text (Matn).',
      },
      {
        id: 'les-4-q4',
        question: 'Why does sincere intention (Ikhlas) elevate an everyday habit like studying?',
        options: [
          'It shortens class hours',
          'It turns permissible effort into rewarded worship when done for Allah',
          'It replaces exams',
          'It removes the need for teachers',
        ],
        correctIndex: 1,
        explanation: 'When a student learns to please Allah and serve humanity, studying becomes an act of worship.',
      },
      {
        id: 'les-4-q5',
        question: 'Which two major Hadith compilations are universally called "As-Sahihayn"?',
        options: [
          'Sunan Abu Dawud and Muwatta',
          'Sahih al-Bukhari and Sahih Muslim',
          'Musnad Ahmad and Tirmidhi',
          'Ibn Majah and Nasai',
        ],
        correctIndex: 1,
        explanation: 'Sahih al-Bukhari and Sahih Muslim hold the highest authenticity among Hadith collections.',
      },
    ],
  },
  {
    id: 'les-4-2',
    lessonId: 'les-4-2',
    courseId: 'crs-hadith-seerah',
    passingPercentage: 70,
    maxAttempts: 5,
    randomizeQuestions: false,
    questions: [
      {
        id: 'les-4-2-q1',
        question: 'Which historical event marks the beginning of the Islamic Hijri calendar?',
        options: [
          'The Treaty of Hudaybiyyah',
          'The Hijrah (migration) from Makkah to Madinah',
          'The Conquest of Makkah',
          'The Battle of Badr',
        ],
        correctIndex: 1,
        explanation: 'The Hijrah to Al-Madinah Al-Munawwarah in 622 CE inaugurated the Hijri calendar under Umar (RA).',
      },
      {
        id: 'les-4-2-q2',
        question: 'By what noble title was Prophet Muhammad (ﷺ) known in Makkah even before prophethood?',
        options: ['Al-Mansur', 'As-Sadiq Al-Amin (The Truthful, The Trustworthy)', 'Al-Qadi', 'Al-Malik'],
        correctIndex: 1,
        explanation: 'His integrity earned him the universal title As-Sadiq Al-Amin among the Quraysh.',
      },
      {
        id: 'les-4-2-q3',
        question: 'What was the very first civic institution established upon arriving in Quba and Madinah?',
        options: ['A royal palace', 'The Masjid (center of worship & learning)', 'A mint', 'A fortress wall'],
        correctIndex: 1,
        explanation: 'Building Masjid Quba and Al-Masjid an-Nabawi placed worship and education at the community core.',
      },
      {
        id: 'les-4-2-q4',
        question: 'How did the Prophet (ﷺ) unite the Muhajirun and Ansar in Madinah?',
        options: [
          'Through taxation',
          'Through Al-Mu’akhah (bond of brotherhood and mutual support)',
          'Through separate neighborhoods',
          'Through trade tariffs',
        ],
        correctIndex: 1,
        explanation: 'Al-Mu’akhah paired Makkan emigrants with Madinan helpers in selfless brotherhood.',
      },
      {
        id: 'les-4-2-q5',
        question: 'What lesson does the Seerah emphasize for young Academy learners today?',
        options: [
          'Avoiding community service',
          'Combining moral courage, patience, truthfulness, and excellence',
          'Learning only for competition',
          'Ignoring elders',
        ],
        correctIndex: 1,
        explanation: 'The Seerah models patience (Sabr), trustworthiness (Amanah), and compassionate leadership.',
      },
    ],
  },
  {
    id: 'les-5',
    lessonId: 'les-5',
    courseId: 'crs-aqeedah-fiqh',
    passingPercentage: 70,
    maxAttempts: 5,
    randomizeQuestions: false,
    questions: [
      {
        id: 'les-5-q1',
        question: 'How many obligatory (Fard) acts of Wudu are explicitly stated in Surah Al-Ma’idah (5:6)?',
        options: ['2 acts', '4 acts', '6 acts', '9 acts'],
        correctIndex: 1,
        explanation: 'Washing the face, washing arms to elbows, wiping the head (Masah), and washing feet to ankles.',
      },
      {
        id: 'les-5-q2',
        question: 'How many Articles of Faith (Arkan al-Iman) form the foundation of Islamic Aqeedah?',
        options: ['3 articles', '5 articles', '6 articles', '7 articles'],
        correctIndex: 2,
        explanation: 'Belief in Allah, Angels, Revealed Books, Messengers, the Last Day, and Qadr (Divine Decree).',
      },
      {
        id: 'les-5-q3',
        question: 'According to Prophetic Hadith, what is the spiritual position of Taharah (purification)?',
        options: ['Optional etiquette', 'Half of Faith (Shatr al-Iman)', 'Only for Friday', 'Only for scholars'],
        correctIndex: 1,
        explanation: 'In Sahih Muslim, the Prophet (ﷺ) stated: "At-tuhuru shatrul iman" (Purity is half of faith).',
      },
      {
        id: 'les-5-q4',
        question: 'What is the ruling on performing Wudu before offering obligatory or voluntary Salah?',
        options: [
          'Optional Sunnah',
          'Essential condition (Shart) for the validity of Salah',
          'Recommended only in summer',
          'Required only for Fajr',
        ],
        correctIndex: 1,
        explanation: 'Salah is not accepted without ritual purity (Wudu or Ghusl when required).',
      },
      {
        id: 'les-5-q5',
        question: 'Which Prophetic habit conserves water while performing Wudu?',
        options: [
          'Leaving the tap running continuously',
          'Using moderate water without waste even beside a flowing river',
          'Washing every limb ten times',
          'Avoiding Miswak',
        ],
        correctIndex: 1,
        explanation: 'Islam forbids extravagance (Israf) in water usage even during ablution.',
      },
    ],
  },
  {
    id: 'les-5-2',
    lessonId: 'les-5-2',
    courseId: 'crs-aqeedah-fiqh',
    passingPercentage: 70,
    maxAttempts: 5,
    randomizeQuestions: false,
    questions: [
      {
        id: 'les-5-2-q1',
        question: 'How many daily obligatory prayers (Salah) are prescribed upon every adult Muslim?',
        options: ['3 prayers', '5 prayers', '7 prayers', '2 prayers'],
        correctIndex: 1,
        explanation: 'Fajr, Dhuhr, Asr, Maghrib, and Isha are the five daily obligatory prayers.',
      },
      {
        id: 'les-5-2-q2',
        question: 'Which pillar follows the Shahadah (testimony of faith) in Islam?',
        options: ['Hajj', 'Establishing Salah', 'Sadaqah', 'I‘tikaf'],
        correctIndex: 1,
        explanation: 'Salah is the second and most regular practical pillar of Islam.',
      },
      {
        id: 'les-5-2-q3',
        question: 'What is "Khushu‘" inside Salah?',
        options: [
          'Rushing the recitation',
          'Humility, stillness, and attentive heart presence before Allah',
          'Looking around the Masjid',
          'Praying silently in Dhuhr only',
        ],
        correctIndex: 1,
        explanation: 'Khushu‘ combines physical calmness (Tuma’ninah) with heartfelt focus upon the meanings recited.',
      },
      {
        id: 'les-5-2-q4',
        question: 'By how many degrees did the Prophet (ﷺ) state congregational prayer excels praying alone?',
        options: ['3 degrees', '10 degrees', '27 degrees', '100 degrees'],
        correctIndex: 2,
        explanation: 'Salah in congregation (Jama‘ah) is 27 times greater in reward than praying alone.',
      },
      {
        id: 'les-5-2-q5',
        question: 'In which direction (Qiblah) do Muslims stand during Salah worldwide?',
        options: ['Eastward always', 'Facing the Sacred Ka‘bah in Makkah', 'Northward', 'Toward Jerusalem'],
        correctIndex: 1,
        explanation: 'Facing the Ka‘bah (Masjid al-Haram in Makkah) unites the Ummah in worship.',
      },
    ],
  },
  {
    id: 'les-6',
    lessonId: 'les-6',
    courseId: 'crs-islamic-studies',
    passingPercentage: 70,
    maxAttempts: 5,
    randomizeQuestions: false,
    questions: [
      {
        id: 'les-6-q1',
        question: 'What is the Academy’s three-word educational motto connecting knowledge and character?',
        options: ['Read · Write · Test', 'Learn · Practice · Preach', 'Listen · Memorize · Win', 'Plan · Work · Rest'],
        correctIndex: 1,
        explanation: 'As-Siddique Islamic Academy upholds: Learn · Practice · Preach.',
      },
      {
        id: 'les-6-q2',
        question: 'What is the complete Sunnah greeting taught when meeting teachers or classmates?',
        options: ['Hello friend', 'Assalamu Alaikum wa Rahmatullahi wa Barakatuh', 'Good day', 'Shukran'],
        correctIndex: 1,
        explanation: 'Spreading Salam spreads peace, mercy, and Allah’s blessings across the school.',
      },
      {
        id: 'les-6-q3',
        question: 'Which etiquette (Adab) strengthens barakah (blessing) while studying with teachers?',
        options: [
          'Interrupting explanations',
          'Listening attentively, showing respect, and asking politely',
          'Arriving late deliberately',
          'Hiding notes from peers',
        ],
        correctIndex: 1,
        explanation: 'Imam Malik and classical scholars emphasized learning Adab before advancing in knowledge.',
      },
      {
        id: 'les-6-q4',
        question: 'How should a student care for copies of the Quran, Hadith, and school textbooks?',
        options: [
          'Place them on the floor carelessly',
          'Keep them clean, elevated, and handled respectfully with clean hands',
          'Write unrelated scribbles inside',
          'Leave them uncovered outdoors',
        ],
        correctIndex: 1,
        explanation: 'Honoring books of knowledge is part of Islamic reverence for revealed and beneficial learning.',
      },
      {
        id: 'les-6-q5',
        question: 'What response should be given when someone says "Assalamu Alaikum"?',
        options: ['Wa Alaikumus Salam wa Rahmatullah', 'Masalama only', 'Silence', 'Alhamdulillah'],
        correctIndex: 0,
        explanation: 'Surah An-Nisa (4:86) teaches returning a greeting with an equal or even better response.',
      },
    ],
  },
  {
    id: 'les-6-2',
    lessonId: 'les-6-2',
    courseId: 'crs-islamic-studies',
    passingPercentage: 70,
    maxAttempts: 5,
    randomizeQuestions: false,
    questions: [
      {
        id: 'les-6-2-q1',
        question: 'Which Quranic command comes right after worshipping Allah alone in Surah Al-Isra (17:23)?',
        options: [
          'Traveling afar',
          'Showing kindness and dutifulness to parents (Birr al-Walidayn)',
          'Building tall homes',
          'Collecting silver',
        ],
        correctIndex: 1,
        explanation: 'Allah pairs devotion to Him directly with gentle kindness and respect toward parents.',
      },
      {
        id: 'les-6-2-q2',
        question: 'Which Dua is recited from the Quran for one’s parents?',
        options: [
          'Subhana Rabbiyal Azim',
          'Rabbir hamhuma kama rabbayani saghira',
          'Bismillahi tawakkaltu',
          'Allahu Akbar Kabira',
        ],
        correctIndex: 1,
        explanation: '"My Lord, have mercy upon them as they brought me up when I was small" (Surah Al-Isra 17:24).',
      },
      {
        id: 'les-6-2-q3',
        question: 'What did the Prophet (ﷺ) teach about truthfulness (Sidq)?',
        options: [
          'It harms friendships',
          'Truthfulness guides to righteousness, and righteousness guides to Paradise',
          'It is optional in business',
          'It applies only to elders',
        ],
        correctIndex: 1,
        explanation: 'Sidq builds trust, inner peace, and earns the rank of Siddiqin.',
      },
      {
        id: 'les-6-2-q4',
        question: 'Which character trait protects both online and offline classroom harmony?',
        options: [
          'Mocking classmates',
          'Guarding the tongue, avoiding backbiting, and speaking kindly',
          'Sharing unverified rumors',
          'Boasting about grades',
        ],
        correctIndex: 1,
        explanation: 'Islam forbids mockery and backbiting (Gheebah) and commands gentle, constructive speech.',
      },
      {
        id: 'les-6-2-q5',
        question: 'When finishing a meal or class session successfully, what praise do we offer to Allah?',
        options: ['Alhamdulillah', 'Inna lillahi', 'Astaghfirullah only', 'La hawla'],
        correctIndex: 0,
        explanation: 'Saying Alhamdulillah expresses gratitude to Allah for every blessing and opportunity to learn.',
      },
    ],
  },
];

function stripBankToPublic(lessonId: string) {
  const bank = DEMO_LESSON_QUESTION_BANKS.find((b) => b.lessonId === lessonId);
  if (!bank) return [];
  return bank.questions.map((q) => ({
    id: q.id,
    question: q.question,
    options: [q.options[0], q.options[1], q.options[2], q.options[3]] as [string, string, string, string],
  }));
}

export const DEMO_LESSONS: LmsLesson[] = [
  {
    id: 'les-1',
    courseId: 'crs-quran-tajweed',
    chapterId: 'ch-qt-1',
    chapterTitle: 'Chapter 1: Foundations of Makharij & Madd',
    title: 'Lesson 01: Articulation of Throat & Tongue Letters (Recorded)',
    order: 1,
    videoType: 'url',
    videoUrl: withBasePath('/media/tajweed-lesson-01.mp4'),
    durationSeconds: 10,
    lectures: [
      {
        id: 'lec-1-a',
        title: 'Part 1: Overview of the 5 Makharij Zones',
        videoType: 'url',
        videoUrl: withBasePath('/media/tajweed-lesson-01.mp4'),
        durationSeconds: 10,
        transcript:
          '00:00 — Assalamu Alaikum students. Welcome to Lesson 01 of Quran Learning, Makharij & Applied Tajweed.\n00:03 — Every Arabic letter originates from one of five main articulation zones: Al-Jawf (oral cavity), Al-Halq (throat), Al-Lisan (tongue), Ash-Shafatan (lips), and Al-Khayshum (nasal passage).\n00:07 — Practice throat letters Hamzah, Ha, Ayn, Ha, Ghayn, and Kha clearly before attempting the 5-question assessment.',
      },
    ],
    notes:
      'Practice each throat and tongue letter slowly with a mirror. Once the video reaches completion, complete the 5-question MCQ assessment (minimum 70% required) to unlock Lesson 02.',
    transcript:
      '00:00 — Assalamu Alaikum students. Welcome to Lesson 01 on Makharij Al-Huruf.\n00:03 — Five main zones: Al-Jawf, Al-Halq, Al-Lisan, Ash-Shafatan, and Al-Khayshum.\n00:07 — Throat letters: ء هـ from deep throat, ع ح from middle throat, غ خ from upper throat.',
    passingPercentage: 70,
    maxAttempts: 5,
    randomizeQuestions: false,
    quizQuestionsPublic: stripBankToPublic('les-1'),
  },
  {
    id: 'les-1-2',
    courseId: 'crs-quran-tajweed',
    chapterId: 'ch-qt-1',
    chapterTitle: 'Chapter 1: Foundations of Makharij & Madd',
    title: 'Lesson 02: Natural Madd, Ghunnah & Iqlab Rules (Sequential)',
    order: 2,
    videoType: 'url',
    videoUrl: withBasePath('/media/tajweed-lesson-01.mp4'),
    durationSeconds: 10,
    lectures: [
      {
        id: 'lec-1-2-a',
        title: 'Madd Tabee‘i, Ghunnah (2 Harakat) & Iqlab',
        videoType: 'url',
        videoUrl: withBasePath('/media/tajweed-lesson-01.mp4'),
        durationSeconds: 10,
        transcript:
          '00:00 — In Lesson 02 we study Madd Asli (2 counts) and Nun Sakinah rules.\n00:05 — Hold Ghunnah steadily for 2 Harakat and apply Iqlab before letter Ba (ب).',
      },
    ],
    notes:
      'Unlocked after passing Lesson 01 assessment (>= 70%). Memorize the 3 Madd letters (Alif, Waw, Ya) and 2-count timing.',
    transcript:
      '00:00 — Lesson 02: Natural Madd & Nun Sakinah Rules.\n00:04 — Madd Asli equals 2 counts.\n00:07 — Iqlab occurs when Nun Sakinah or Tanween is followed by Ba (ب).',
    passingPercentage: 70,
    maxAttempts: 5,
    randomizeQuestions: false,
    quizQuestionsPublic: stripBankToPublic('les-1-2'),
  },
  {
    id: 'les-2',
    courseId: 'crs-wb-math-10',
    chapterId: 'ch-m10-1',
    chapterTitle: 'Chapter 1: Quadratic Equations & Sridharacharya Formula',
    title: 'Lesson 01: Standard Form & Factorization (Recorded)',
    order: 1,
    videoType: 'url',
    videoUrl: withBasePath('/media/math-lesson-01.mp4'),
    durationSeconds: 10,
    lectures: [
      {
        id: 'lec-2-a',
        title: 'Lecture 1.1: Standard Form ax² + bx + c = 0',
        videoType: 'url',
        videoUrl: withBasePath('/media/math-lesson-01.mp4'),
        durationSeconds: 10,
        transcript:
          '00:00 — Welcome to Class 10 Mathematics (West Bengal Board Track).\n00:04 — Standard quadratic form is ax² + bx + c = 0 with a ≠ 0.\n00:07 — Equal real roots occur when discriminant b² - 4ac = 0. Watch completely to unlock Lesson 01 MCQ Quiz.',
      },
    ],
    notes:
      'Solve exercises 1.1 through 1.3 and pass the Lesson 01 MCQ check (>= 70%) to unlock Lesson 02 on Sridharacharya Formula.',
    transcript:
      '00:00 — Class 10 Mathematics: Quadratic Equations.\n00:04 — Sum of roots = -b/a, Product of roots = c/a.\n00:07 — Discriminant Δ = b² - 4ac determines nature of roots.',
    passingPercentage: 70,
    maxAttempts: 5,
    randomizeQuestions: false,
    quizQuestionsPublic: stripBankToPublic('les-2'),
  },
  {
    id: 'les-2-2',
    courseId: 'crs-wb-math-10',
    chapterId: 'ch-m10-1',
    chapterTitle: 'Chapter 1: Quadratic Equations & Sridharacharya Formula',
    title: 'Lesson 02: Sridharacharya Formula & Discriminant Analysis',
    order: 2,
    videoType: 'url',
    videoUrl: withBasePath('/media/math-lesson-01.mp4'),
    durationSeconds: 10,
    lectures: [
      {
        id: 'lec-2-2-a',
        title: 'Lecture 1.2: Deriving & Applying Sridharacharya Formula',
        videoType: 'url',
        videoUrl: withBasePath('/media/math-lesson-01.mp4'),
        durationSeconds: 10,
        transcript:
          '00:00 — Welcome to Lesson 02: Sridharacharya Formula.\n00:04 — Roots are x = (-b ± √(b² - 4ac)) / 2a.\n00:08 — Check Δ > 0, Δ = 0, or Δ < 0 before solving.',
      },
    ],
    notes: 'Unlocked upon passing Lesson 01 with 70% or above. Practice discriminant signs carefully.',
    transcript: '00:00 — Lesson 02 focuses on Sridharacharya Formula and discriminant cases.',
    passingPercentage: 70,
    maxAttempts: 5,
    randomizeQuestions: false,
    quizQuestionsPublic: stripBankToPublic('les-2-2'),
  },
  {
    id: 'les-3',
    courseId: 'crs-arabic-foundations',
    chapterId: 'ch-ar-1',
    chapterTitle: 'Chapter 1: Arabic Alphabet & Nominal Sentences',
    title: 'Lesson 01: Nominal Sentences (Al-Jumlah Al-Ismiyyah)',
    order: 1,
    videoType: 'url',
    videoUrl: withBasePath('/media/tajweed-lesson-01.mp4'),
    durationSeconds: 10,
    lectures: [
      {
        id: 'lec-3-a',
        title: 'Part 1: Mubtada & Khabar Agreement Rules',
        videoType: 'url',
        videoUrl: withBasePath('/media/tajweed-lesson-01.mp4'),
        durationSeconds: 10,
        transcript:
          '00:00 — Al-Jumlah Al-Ismiyyah starts with a Noun (Ism).\n00:04 — The two pillars are Mubtada (Subject, typically definite) and Khabar (Predicate).\n00:08 — Complete this video to unlock your 5-question Arabic Nahw MCQ check.',
      },
    ],
    notes: 'Read RTL Arabic examples aloud and memorize 10 core vocabulary roots before Lesson 02.',
    transcript: '00:00 — Mubtada & Khabar are both Marfu‘ (nominative) and agree in gender and number.',
    passingPercentage: 70,
    maxAttempts: 5,
    randomizeQuestions: false,
    quizQuestionsPublic: stripBankToPublic('les-3'),
  },
  {
    id: 'les-3-2',
    courseId: 'crs-arabic-foundations',
    chapterId: 'ch-ar-1',
    chapterTitle: 'Chapter 1: Arabic Alphabet & Nominal Sentences',
    title: 'Lesson 02: Huruf Al-Jarr, Pronouns & Daily Study Duas',
    order: 2,
    videoType: 'url',
    videoUrl: withBasePath('/media/tajweed-lesson-01.mp4'),
    durationSeconds: 10,
    lectures: [
      {
        id: 'lec-3-2-a',
        title: 'Part 1: Prepositions & Prophetic Knowledge Duas',
        videoType: 'url',
        videoUrl: withBasePath('/media/tajweed-lesson-01.mp4'),
        durationSeconds: 10,
        transcript:
          '00:00 — Prepositions (fi, ila, min, ala) place the following noun into Majrur (Kasrah).\n00:05 — Practice "Rabbi zidni ‘ilma" and detached pronouns (Ana, Nahnu, Anta, Huwa).',
      },
    ],
    notes: 'Unlocked after passing Lesson 01 MCQ quiz (>= 70%). Memorize five Harf Jarr examples.',
    transcript: '00:00 — Study Huruf Al-Jarr and daily Duas with exact meaning.',
    passingPercentage: 70,
    maxAttempts: 5,
    randomizeQuestions: false,
    quizQuestionsPublic: stripBankToPublic('les-3-2'),
  },
  {
    id: 'les-4',
    courseId: 'crs-hadith-seerah',
    chapterId: 'ch-hs-1',
    chapterTitle: 'Chapter 1: Introduction to Hadith Sciences',
    title: 'Lesson 01: Hadith of Intention (Innamal A‘malu bin-Niyyat)',
    order: 1,
    videoType: 'url',
    videoUrl: withBasePath('/media/tajweed-lesson-01.mp4'),
    durationSeconds: 10,
    lectures: [
      {
        id: 'lec-4-a',
        title: 'Part 1: Sanad, Matn & Sincerity of Niyyah',
        videoType: 'url',
        videoUrl: withBasePath('/media/tajweed-lesson-01.mp4'),
        durationSeconds: 10,
        transcript:
          '00:00 — Narrated by Umar ibn Al-Khattab (RA): "Actions are judged by intentions."\n00:05 — Learn how Sanad (narrator chain) and Matn (text) verify authentic Hadith.',
      },
    ],
    notes: 'Reflect on sincerity (Ikhlas) in learning, practice, and teaching.',
    transcript: '00:00 — Authentic Hadith preservation across As-Sahihayn (Bukhari & Muslim).',
    passingPercentage: 70,
    maxAttempts: 5,
    randomizeQuestions: false,
    quizQuestionsPublic: stripBankToPublic('les-4'),
  },
  {
    id: 'les-4-2',
    courseId: 'crs-hadith-seerah',
    chapterId: 'ch-hs-1',
    chapterTitle: 'Chapter 1: Introduction to Hadith Sciences',
    title: 'Lesson 02: Hijrah to Madinah & Prophetic Brotherhood',
    order: 2,
    videoType: 'url',
    videoUrl: withBasePath('/media/tajweed-lesson-01.mp4'),
    durationSeconds: 10,
    lectures: [
      {
        id: 'lec-4-2-a',
        title: 'Part 1: As-Sadiq Al-Amin & Building Madinah',
        videoType: 'url',
        videoUrl: withBasePath('/media/tajweed-lesson-01.mp4'),
        durationSeconds: 10,
        transcript:
          '00:00 — Explore how the Hijrah in 622 CE inaugurated the Hijri era.\n00:05 — Study Al-Mu’akhah (brotherhood between Muhajirun and Ansar) and Masjid-centered education.',
      },
    ],
    notes: 'Unlocked after Lesson 01 quiz. Summarize 3 character lessons from As-Sadiq Al-Amin.',
    transcript: '00:00 — Seerah timeline from Makkah to Al-Madinah Al-Munawwarah.',
    passingPercentage: 70,
    maxAttempts: 5,
    randomizeQuestions: false,
    quizQuestionsPublic: stripBankToPublic('les-4-2'),
  },
  {
    id: 'les-5',
    courseId: 'crs-aqeedah-fiqh',
    chapterId: 'ch-af-1',
    chapterTitle: 'Chapter 1: Pillars of Iman & Taharah',
    title: 'Lesson 01: Essentials of Wudu & Articles of Faith',
    order: 1,
    videoType: 'url',
    videoUrl: withBasePath('/media/tajweed-lesson-01.mp4'),
    durationSeconds: 10,
    lectures: [
      {
        id: 'lec-5-a',
        title: 'Part 1: The 4 Fard Acts of Wudu & 6 Pillars of Iman',
        videoType: 'url',
        videoUrl: withBasePath('/media/tajweed-lesson-01.mp4'),
        durationSeconds: 10,
        transcript:
          '00:00 — Purity (Taharah) is half of faith.\n00:05 — Review the 4 Fard acts of Wudu from Surah Al-Ma’idah 5:6 without wasting water.',
      },
    ],
    notes: 'Review Fard and Sunnah acts of Wudu with illustrated checklist and memorize Arkan al-Iman.',
    transcript: '00:00 — Foundations of Aqeedah & Purification (Wudu).',
    passingPercentage: 70,
    maxAttempts: 5,
    randomizeQuestions: false,
    quizQuestionsPublic: stripBankToPublic('les-5'),
  },
  {
    id: 'les-5-2',
    courseId: 'crs-aqeedah-fiqh',
    chapterId: 'ch-af-1',
    chapterTitle: 'Chapter 1: Pillars of Iman & Taharah',
    title: 'Lesson 02: Five Daily Prayers, Khushu‘ & Jama‘ah',
    order: 2,
    videoType: 'url',
    videoUrl: withBasePath('/media/tajweed-lesson-01.mp4'),
    durationSeconds: 10,
    lectures: [
      {
        id: 'lec-5-2-a',
        title: 'Part 1: Establishing Salah with Presence of Heart',
        videoType: 'url',
        videoUrl: withBasePath('/media/tajweed-lesson-01.mp4'),
        durationSeconds: 10,
        transcript:
          '00:00 — Salah is the second pillar of Islam with 5 daily prayers.\n00:05 — Congregational prayer carries 27 degrees greater reward and nurtures Khushu‘.',
      },
    ],
    notes: 'Unlocked after Lesson 01 MCQ pass. Maintain a daily 5-prayer consistency log.',
    transcript: '00:00 — Fajr, Dhuhr, Asr, Maghrib, and Isha timings & Qiblah orientation.',
    passingPercentage: 70,
    maxAttempts: 5,
    randomizeQuestions: false,
    quizQuestionsPublic: stripBankToPublic('les-5-2'),
  },
  {
    id: 'les-6',
    courseId: 'crs-islamic-studies',
    chapterId: 'ch-is-1',
    chapterTitle: 'Chapter 1: Daily Adab & Sunnah',
    title: 'Lesson 01: Etiquette of Seeking Knowledge & Greeting',
    order: 1,
    videoType: 'url',
    videoUrl: withBasePath('/media/tajweed-lesson-01.mp4'),
    durationSeconds: 10,
    lectures: [
      {
        id: 'lec-6-a',
        title: 'Part 1: Adab of the Learner & Spreading Salam',
        videoType: 'url',
        videoUrl: withBasePath('/media/tajweed-lesson-01.mp4'),
        durationSeconds: 10,
        transcript:
          '00:00 — As-Siddique Academy motto: Learn · Practice · Preach.\n00:05 — Greet teachers and peers with Assalamu Alaikum and respect books of knowledge.',
      },
    ],
    notes: 'Practice daily morning/evening Duas and greeting teachers with full Salam.',
    transcript: '00:00 — Etiquette of the student and honoring books of sacred and general knowledge.',
    passingPercentage: 70,
    maxAttempts: 5,
    randomizeQuestions: false,
    quizQuestionsPublic: stripBankToPublic('les-6'),
  },
  {
    id: 'les-6-2',
    courseId: 'crs-islamic-studies',
    chapterId: 'ch-is-1',
    chapterTitle: 'Chapter 1: Daily Adab & Sunnah',
    title: 'Lesson 02: Honoring Parents, Truthfulness & Kind Speech',
    order: 2,
    videoType: 'url',
    videoUrl: withBasePath('/media/tajweed-lesson-01.mp4'),
    durationSeconds: 10,
    lectures: [
      {
        id: 'lec-6-2-a',
        title: 'Part 1: Birr al-Walidayn & Prophetic Character',
        videoType: 'url',
        videoUrl: withBasePath('/media/tajweed-lesson-01.mp4'),
        durationSeconds: 10,
        transcript:
          '00:00 — Memorize "Rabbir hamhuma kama rabbayani saghira" for parents.\n00:05 — Uphold Sidq (truthfulness) and avoid backbiting both offline and online.',
      },
    ],
    notes: 'Unlocked after passing Lesson 01. Recite the Quranic dua for parents after each prayer.',
    transcript: '00:00 — Surah Al-Isra 17:23–24 on parents and Prophetic truthfulness.',
    passingPercentage: 70,
    maxAttempts: 5,
    randomizeQuestions: false,
    quizQuestionsPublic: stripBankToPublic('les-6-2'),
  },
];

export const DEMO_LMS_QA: LmsQaEntry[] = [
  {
    id: 'qa-demo-1',
    courseId: 'crs-quran-tajweed',
    lessonId: 'les-1',
    authorUid: 'demo-student',
    authorName: 'Demo Student (Class 5)',
    authorRole: 'student',
    question: 'What is the difference between Al-Halq (throat) and Al-Jawf when elongating Madd?',
    answer:
      'Al-Halq articulates the six consonant throat letters (ء هـ ع ح غ خ), whereas Al-Jawf is the open space of the mouth and throat used purely for the three Madd vowels.',
    answeredBy: 'Islamic Studies Wing',
    createdAt: '2026-11-18T10:30:00Z',
  },
];

export interface LmsQuizQuestion {
  id: string;
  courseId: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const DEMO_QUIZZES: LmsQuizQuestion[] = [
  {
    id: 'qz-1',
    courseId: 'crs-quran-tajweed',
    question: 'How many main articulation zones (Makharij Al-Ammah) are recognized in classical Tajweed?',
    options: ['3 zones', '5 zones', '7 zones', '9 zones'],
    correctIndex: 1,
    explanation: 'Al-Jawf, Al-Halq, Al-Lisan, Ash-Shafatan, and Al-Khayshum form the 5 main zones.',
  },
  {
    id: 'qz-2',
    courseId: 'crs-arabic-foundations',
    question: 'In Arabic grammar, a nominal sentence (Al-Jumlah Al-Ismiyyah) begins with which part of speech?',
    options: ['Noun (Ism)', 'Verb (Fi‘l)', 'Preposition (Harf)', 'Adverb'],
    correctIndex: 0,
    explanation: 'Al-Jumlah Al-Ismiyyah starts with an Ism consisting of Mubtada and Khabar.',
  },
  {
    id: 'qz-3',
    courseId: 'crs-hadith-seerah',
    question: 'Which Hadith opens Imam An-Nawawi’s 40 Hadith collection?',
    options: ['Actions are by intentions', 'Cleanliness is half of faith', 'Do not get angry', 'Smile is charity'],
    correctIndex: 0,
    explanation: '“Innamal A‘malu bin-Niyyat” (Actions are judged by intentions) opens Sahih al-Bukhari and Nawawi’s 40.',
  },
  {
    id: 'qz-4',
    courseId: 'crs-aqeedah-fiqh',
    question: 'How many obligatory (Fard) acts are explicitly mentioned in Surah Al-Ma’idah verse 6 for Wudu?',
    options: ['3 acts', '4 acts', '6 acts', '8 acts'],
    correctIndex: 1,
    explanation: 'Washing the face, washing arms up to elbows, wiping the head, and washing feet up to ankles.',
  },
  {
    id: 'qz-5',
    courseId: 'crs-islamic-studies',
    question: 'What is the Academy’s foundational motto connecting knowledge with action?',
    options: ['Read · Write · Test', 'Learn · Practice · Preach', 'Study · Compete · Win', 'Listen · Memorize · Repeat'],
    correctIndex: 1,
    explanation: 'As-Siddique Islamic Academy follows: Learn · Practice · Preach.',
  },
  {
    id: 'qz-6',
    courseId: 'crs-wb-math-10',
    question: 'For a quadratic equation ax² + bx + c = 0 (a ≠ 0), when are roots real and equal?',
    options: ['b² - 4ac > 0', 'b² - 4ac = 0', 'b² - 4ac < 0', 'a + b + c = 0'],
    correctIndex: 1,
    explanation: 'When the discriminant Δ = b² - 4ac equals 0, the equation has two equal real roots.',
  },
];

export interface AcademicCalendarEntry {
  id: string;
  date: string;
  title: string;
  category: 'Term' | 'Examination' | 'Islamic Holiday' | 'State Holiday';
}

export const DEFAULT_ACADEMIC_CALENDAR: AcademicCalendarEntry[] = [
  { id: 'cal-1', date: '2026-04-01', title: 'Academic Session 2026–2027 Opening Assembly', category: 'Term' },
  { id: 'cal-2', date: '2026-12-07', title: 'Half-Yearly General & Islamic Assessment Window', category: 'Examination' },
  { id: 'cal-3', date: '2026-12-20', title: 'Parent–Teacher Dual Progress Consultation', category: 'Term' },
  { id: 'cal-4', date: '2027-03-01', title: 'Annual Examination & Hifz Evaluation Window (Configurable)', category: 'Examination' },
];

export const DEMO_LIVE_CLASSES: LiveClassSession[] = [
  {
    id: 'live-1',
    title: 'Class 10 Mathematics — Live Problem Solving',
    classId: 'Class 10',
    subjectName: 'Mathematics',
    teacherName: 'Mathematics Wing',
    meetingLink: '',
    startTime: '09:00 AM IST',
    endTime: '09:50 AM IST',
    status: 'Scheduled',
  },
  {
    id: 'live-2',
    title: 'Class 5 Quran Nazirah & Tajweed Circle',
    classId: 'Class 5',
    subjectName: 'Quran & Nazirah',
    teacherName: 'Islamic Studies Wing',
    meetingLink: '',
    startTime: '10:30 AM IST',
    endTime: '11:15 AM IST',
    status: 'Scheduled',
  },
];

export const DEMO_LIBRARY: LibraryResource[] = [
  {
    id: 'lib-1',
    title: 'Noorani Qaida & Tajweed Visual Guide (Demo Entry)',
    author: 'Islamic Studies Wing',
    category: 'Quran Learning',
    classId: 'Class 1',
    subjectName: 'Quran & Nazirah',
    fileUrl: '#library-sample',
    allowDownload: true,
  },
  {
    id: 'lib-2',
    title: 'Bengali & English Grammar Reference Handbook (Demo Entry)',
    author: 'Languages Department',
    category: 'General School Books',
    classId: 'Class 10',
    subjectName: 'Bengali (First Language)',
    fileUrl: '#library-sample',
    allowDownload: true,
  },
  {
    id: 'lib-3',
    title: 'Arabic Vocabulary & Daily Duas Booklet (Demo Entry)',
    author: 'Arabic Wing',
    category: 'Arabic Resources',
    classId: 'Class 5',
    subjectName: 'Arabic & Islamic Manners',
    fileUrl: '#library-sample',
    allowDownload: true,
  },
];

export const DEFAULT_LIBRARY_CATEGORIES: LibraryCategory[] = [
  {
    id: 'cat-quran-tafsir',
    name: 'Quran & Tafsir',
    slug: 'quran-tafsir',
    description: 'Mushaf editions, Tajweed sciences, Makharij guides, and authentic Tafsir references.',
    subcategories: ['Tajweed & Makharij', 'Tafsir & Translation', 'Hifz & Nazirah'],
    order: 1,
    isActive: true,
  },
  {
    id: 'cat-hadith-sunnah',
    name: 'Hadith & Sunnah',
    slug: 'hadith-sunnah',
    description: 'Authenticated Prophetic traditions, Nawawi 40, Riyad us-Saliheen, and Hadith methodology.',
    subcategories: ['40 Hadith & Etiquette', 'Hadith Sciences', 'Daily Adhkar & Duas'],
    order: 2,
    isActive: true,
  },
  {
    id: 'cat-seerah-history',
    name: 'Seerah & Islamic History',
    slug: 'seerah-history',
    description: 'Prophetic biography, Rightly Guided Caliphs, and Islamic educational heritage.',
    subcategories: ['Prophetic Biography (Seerah)', 'Companions (Sahabah)', 'Islamic Civilization'],
    order: 3,
    isActive: true,
  },
  {
    id: 'cat-aqeedah-fiqh',
    name: 'Aqeedah & Fiqh',
    slug: 'aqeedah-fiqh',
    description: 'Foundations of Islamic belief, Taharah, Salah, Fasting, Zakah, and moral Akhlaq.',
    subcategories: ['Islamic Creed (Aqeedah)', 'Worship & Salah (Fiqh)', 'Character & Tarbiyah'],
    order: 4,
    isActive: true,
  },
  {
    id: 'cat-arabic-grammar',
    name: 'Arabic Language & Grammar',
    slug: 'arabic-grammar',
    description: 'Classical Nahw (syntax), Sarf (morphology), vocabulary builders, and reading primers.',
    subcategories: ['Nahw (Syntax)', 'Sarf (Morphology)', 'Arabic Reading & Vocabulary'],
    order: 5,
    isActive: true,
  },
  {
    id: 'cat-bengali-literature',
    name: 'Bengali Islamic Literature',
    slug: 'bengali-literature',
    description: 'বাংলা ইসলামিক সাহিত্য, সীরাত, তাজবিদ ও নৈতিক শিক্ষা বিষয়ক প্রবন্ধ ও বই।',
    subcategories: ['বাংলা তাজবিদ ও কুরআন', 'বাংলা সীরাত ও ইতিহাস', 'ছোটদের ইসলামিক গল্প'],
    order: 6,
    isActive: true,
  },
  {
    id: 'cat-school-notes',
    name: 'School Textbooks & Notes',
    slug: 'school-notes',
    description: 'West Bengal State Board Class 1–12 textbooks, study guides, and solved notes.',
    subcategories: ['Class 1–5 Primary', 'Class 6–10 Secondary', 'Class 11–12 Higher Secondary'],
    order: 7,
    isActive: true,
  },
];

export const DEMO_LIBRARY_BOOKS: LibraryBook[] = [
  {
    id: 'lib-book-tajweed',
    title: 'Tajweed & Makharij Practical Primer (তাজবিদ ও মাখরাজ সহায়িকা)',
    author: 'Islamic Studies Wing · As-Siddique Islamic Academy',
    publisher: 'As-Siddique Digital Press',
    language: 'Bengali',
    categoryId: 'cat-quran-tafsir',
    categoryName: 'Quran & Tafsir',
    subcategory: 'Tajweed & Makharij',
    description:
      'Step-by-step guide covering the five main Arabic articulation zones (Al-Jawf, Al-Halq, Al-Lisan, Ash-Shafatan, Al-Khayshum), Madd Tabee‘i counts, Ghunnah, and Nun Sakinah rules for Class 1–12 learners.',
    tags: ['Tajweed', 'Makharij', 'Quran', 'Ghunnah', 'বাংলা তাজবিদ'],
    publicationYear: '2026',
    permission: 'both',
    status: 'published',
    featured: true,
    pdfUrl: withBasePath('/media/library/tajweed-makharij-guide.pdf'),
    coverUrl: withBasePath('/src/assets/images/book_cover_tajweed_1795360523334.jpg'),
    fileSizeBytes: 5120,
    pageCount: 2,
    viewsCount: 248,
    downloadsCount: 114,
    searchText:
      'Tajweed Makharij Practical Primer Quran recitation Al-Jawf Al-Halq Al-Lisan Ash-Shafatan Al-Khayshum Madd Tabeei Ghunnah Iqlab Idgham Ikhfa বাংলা তাজবিদ কুরআন শিক্ষা আস-সিদ্দিক',
    ocrRequired: false,
    isSampleBook: true,
  },
  {
    id: 'lib-book-seerah',
    title: 'Prophetic Seerah & Madinan Brotherhood Chronology',
    author: 'Mawlana Zayd Al-Qasmi (Curriculum Edition)',
    publisher: 'As-Siddique Digital Press',
    language: 'English',
    categoryId: 'cat-seerah-history',
    categoryName: 'Seerah & Islamic History',
    subcategory: 'Prophetic Biography (Seerah)',
    description:
      'Concise study handbook tracing the Makkan period, As-Sadiq Al-Amin character ethics, the Hijrah of 622 CE, Masjid Quba, and the Madinan brotherhood (Al-Mu’akhah).',
    tags: ['Seerah', 'Hijrah', 'Madinah', 'History', 'Akhlaq'],
    publicationYear: '2026',
    permission: 'read_only',
    status: 'published',
    featured: true,
    pdfUrl: withBasePath('/media/library/seerah-chronology-primer.pdf'),
    coverUrl: withBasePath('/src/assets/images/book_cover_seerah_1795360523075.jpg'),
    fileSizeBytes: 5120,
    pageCount: 2,
    viewsCount: 196,
    downloadsCount: 0,
    searchText:
      'Prophetic Seerah Chronology Makkah Madinah Hijrah 622 CE As-Sadiq Al-Amin Masjid Quba Al-Muakhah Muhajirun Ansar Prophet Muhammad Islamic History',
    ocrRequired: false,
    isSampleBook: true,
  },
  {
    id: 'lib-book-arabic',
    title: 'Arabic Nahw & Nominal Sentences Workbook (القواعد العربية)',
    author: 'Ustadh Tariq Al-Mansoor',
    publisher: 'As-Siddique Digital Press',
    language: 'Arabic',
    categoryId: 'cat-arabic-grammar',
    categoryName: 'Arabic Language & Grammar',
    subcategory: 'Nahw (Syntax)',
    description:
      'Structured Arabic grammar primer introducing Al-Jumlah Al-Ismiyyah (Mubtada and Khabar), Huruf Al-Jarr prepositions, and classical reading drills for Middle and Secondary students.',
    tags: ['Arabic', 'Nahw', 'Grammar', 'Mubtada', 'Khabar'],
    publicationYear: '2026',
    permission: 'download',
    status: 'published',
    featured: true,
    pdfUrl: withBasePath('/media/library/arabic-nahw-foundations.pdf'),
    coverUrl: withBasePath('/src/assets/images/book_cover_arabic_1795360523273.jpg'),
    fileSizeBytes: 5120,
    pageCount: 2,
    viewsCount: 162,
    downloadsCount: 89,
    searchText:
      'Arabic Nahw Foundations Al-Jumlah Al-Ismiyyah Mubtada Khabar Marfu Majrur Huruf Al-Jarr Rabbi zidni ilma القواعد العربية النحو الصرف',
    ocrRequired: false,
    isSampleBook: true,
  },
];

export const DEMO_TIMETABLE: TimetableSlot[] = [
  {
    id: 'tt-1',
    classId: 'Class 10',
    sectionId: 'Section A',
    day: 'Monday',
    startTime: '08:30',
    endTime: '09:15',
    subjectName: 'Quran & Tajweed',
    teacherName: 'Islamic Studies Wing',
    roomOrMode: 'Room 101 / Hybrid',
  },
  {
    id: 'tt-2',
    classId: 'Class 10',
    sectionId: 'Section A',
    day: 'Monday',
    startTime: '09:20',
    endTime: '10:05',
    subjectName: 'Mathematics',
    teacherName: 'Mathematics Wing',
    roomOrMode: 'Room 101 / Hybrid',
  },
  {
    id: 'tt-3',
    classId: 'Class 5',
    sectionId: 'Section A',
    day: 'Tuesday',
    startTime: '09:00',
    endTime: '09:45',
    subjectName: 'Bengali (First Language)',
    teacherName: 'Languages Wing',
    roomOrMode: 'Room 204',
  },
];

export const DEMO_HOMEWORK: HomeworkItem[] = [
  {
    id: 'hw-1',
    title: 'Surah Al-Mulk Verses 1–10 Tajweed Practice (Demo)',
    description: 'Recite verses 1 to 10 focusing on Idgham and Ikhfa rules.',
    classId: 'Class 10',
    subjectName: 'Tajweed, Fiqh & Aqeedah',
    dueDate: '2026-11-25',
    teacherUid: 'demo-teacher',
  },
];

export const DEMO_ASSIGNMENTS: AssignmentItem[] = [
  {
    id: 'asg-1',
    title: 'Quadratic Equations Worksheet 1 (Demo)',
    instructions: 'Complete all 10 problems and submit your working steps.',
    classId: 'Class 10',
    subjectName: 'Mathematics',
    dueDate: '2026-11-28',
    maxMarks: 25,
    teacherUid: 'demo-teacher',
  },
];

export const DEMO_EXAMINATIONS: ExaminationRecord[] = [
  {
    id: 'EXAM-HY-2026',
    title: 'Half-Yearly Examination 2026–2027 (Demo)',
    examType: 'Half-Yearly Examination',
    sessionId: '2026–2027',
    classId: 'Class 10',
    startDate: '2026-12-07',
    status: 'published',
  },
];

export const DEMO_FEE_STRUCTURES: FeeStructure[] = [
  { id: 'fee-adm', title: 'New Admission Processing Fee (Demo)', category: 'Admission Fee', classId: 'Class 1', amount: 2500, frequency: 'One-Time' },
  { id: 'fee-tui-10', title: 'Monthly Tuition Fee — Class 10 (Demo)', category: 'Tuition Fee', classId: 'Class 10', amount: 1200, frequency: 'Monthly' },
  { id: 'fee-exm', title: 'Half-Yearly Examination Fee (Demo)', category: 'Examination Fee', classId: 'Class 10', amount: 450, frequency: 'Quarterly' },
];

export const DEMO_INVOICES: FeeInvoice[] = [
  {
    id: 'inv-demo-1',
    invoiceNumber: 'INV-2026-001',
    studentId: 'STU-2026-001',
    studentName: 'Demo Student (Class 10)',
    classId: 'Class 10',
    title: 'Monthly Tuition Fee — November 2026 (Demo)',
    amount: 1200,
    discountAmount: 0,
    paidAmount: 1200,
    dueDate: '2026-11-10',
    status: 'Paid',
  },
  {
    id: 'inv-demo-2',
    invoiceNumber: 'INV-2026-002',
    studentId: 'STU-2026-002',
    studentName: 'Demo Student (Class 5)',
    classId: 'Class 5',
    title: 'Monthly Tuition Fee — November 2026 (Demo)',
    amount: 950,
    discountAmount: 100,
    paidAmount: 0,
    dueDate: '2026-11-25',
    status: 'Unpaid',
  },
];

export const DEMO_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay-demo-1',
    receiptNumber: 'RCP-2026-001',
    invoiceId: 'inv-demo-1',
    studentId: 'STU-2026-001',
    studentName: 'Demo Student (Class 10)',
    amount: 1200,
    method: 'Cash',
    verified: true,
    paidAt: '2026-11-08',
  },
];

export const DEMO_ADMISSIONS: AdmissionApplication[] = [];
export const DEMO_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-demo-1',
    targetType: 'student',
    targetId: 'STU-2026-001',
    targetName: 'Demo Student (Class 10)',
    classId: 'Class 10',
    date: '2026-11-19',
    status: 'Present',
    recordedBy: 'System Demo',
  },
];
export const DEMO_STAFF: StaffRecord[] = [
  {
    id: 'stf-demo-1',
    name: 'Sample Registrar Staff (Demo)',
    roleTitle: 'Admissions & Office Clerk',
    department: 'Administration',
    phone: 'Demo Only',
    salaryAmount: 18000,
    joinDate: '2025-04-01',
    status: 'active',
    isDemo: true,
  },
];
export const DEMO_CERTIFICATES: CertificateRecord[] = [
  {
    id: 'cert-demo-1',
    certificateNumber: 'CERT-2026-001',
    templateType: 'Bonafide Certificate',
    studentId: 'STU-2026-001',
    studentName: 'Demo Student (Class 10)',
    issuedDate: '2026-11-15',
    issuedBy: 'Office of the Registrar',
  },
];
