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
  LibraryResource,
  LiveClassSession,
  LmsCourse,
  LmsLesson,
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

export const HERO_MOSQUE_IMAGE = '/src/assets/images/hero_mosque_academy_1795074356108.jpg';
export const PRINCIPAL_PORTRAIT_IMAGE = '/src/assets/images/principal_scholar_portrait_1795074355746.jpg';
export const ONLINE_LEARNING_IMAGE = '/src/assets/images/online_learning_session_1795074356262.jpg';

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
    photoUrl: '/src/assets/images/teacher_quran_arabic_1795074356458.jpg',
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
    photoUrl: '/src/assets/images/teacher_science_female_1795074356658.jpg',
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
    photoUrl: '/src/assets/images/teacher_math_male_1795074356342.jpg',
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
  },
  {
    id: 'crs-wb-math-10',
    title: 'Class 10 Mathematics — West Bengal Board Track',
    sessionId: '2026–2027',
    classId: 'Class 10',
    subjectName: 'Mathematics',
    track: 'general',
    instructorName: 'Mathematics Wing',
    description: 'Structured algebra, geometry, and trigonometry lessons with weekly practice tests.',
    isPublic: true,
  },
];

export const DEMO_LESSONS: LmsLesson[] = [
  {
    id: 'les-1',
    courseId: 'crs-quran-tajweed',
    chapterTitle: 'Chapter 1: Foundations of Makharij',
    title: 'Lesson 1.1: Articulation of Throat & Tongue Letters (Recorded)',
    order: 1,
    notes: 'Practice each letter slowly with a mirror and listen to teacher feedback during live Tajweed circle.',
  },
  {
    id: 'les-2',
    courseId: 'crs-wb-math-10',
    chapterTitle: 'Chapter 1: Quadratic Equations',
    title: 'Lesson 1.1: Standard Form & Factorization (Recorded)',
    order: 1,
    notes: 'Solve exercises 1.1 through 1.3 and upload your solution sheet in the Assignments tab.',
  },
  {
    id: 'les-3',
    courseId: 'crs-arabic-foundations',
    chapterTitle: 'Chapter 1: Arabic Alphabet & Harakat',
    title: 'Lesson 1.1: Nominal Sentences (Al-Jumlah Al-Ismiyyah)',
    order: 1,
    notes: 'Read RTL Arabic examples aloud and memorize 10 core vocabulary roots.',
  },
  {
    id: 'les-4',
    courseId: 'crs-hadith-seerah',
    chapterTitle: 'Chapter 1: Introduction to Hadith Sciences',
    title: 'Lesson 1.1: Hadith of Intention (Innamal A‘malu bin-Niyyat)',
    order: 1,
    notes: 'Reflect on sincerity in learning, practice, and teaching.',
  },
  {
    id: 'les-5',
    courseId: 'crs-aqeedah-fiqh',
    chapterTitle: 'Chapter 1: Pillars of Iman & Taharah',
    title: 'Lesson 1.1: Essentials of Wudu & Congregational Prayer',
    order: 1,
    notes: 'Review Fard and Sunnah acts of Wudu with illustrated checklist.',
  },
  {
    id: 'les-6',
    courseId: 'crs-islamic-studies',
    chapterTitle: 'Chapter 1: Daily Adab & Sunnah',
    title: 'Lesson 1.1: Etiquette of Seeking Knowledge & Greeting',
    order: 1,
    notes: 'Practice daily morning/evening Duas and greeting with Salam.',
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
