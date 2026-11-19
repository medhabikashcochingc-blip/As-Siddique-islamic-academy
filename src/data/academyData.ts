export type ProgrammeStageId = 'primary' | 'middle' | 'secondary' | 'higher-secondary';

export interface AcademicProgramme {
  id: string;
  stage: ProgrammeStageId;
  stageLabel: string;
  classRange: string;
  ageRange: string;
  title: string;
  summary: string;
  weeklyPeriods: string;
  generalSubjects: string[];
  islamicSubjects: string[];
  outcomes: string[];
}

export interface CurriculumStream {
  id: 'general' | 'islamic';
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string;
  pillars: {
    index: string;
    title: string;
    detail: string;
    grades: string;
  }[];
}

export interface FacultyMember {
  id: string;
  name: string;
  role: string;
  department: 'islamic' | 'science' | 'humanities';
  departmentLabel: string;
  qualification: string;
  experience: string;
  classesTaught: string;
  image?: string;
  bio: string;
  specialization: string;
}

export interface OnlineTrack {
  id: 'primary' | 'middle' | 'secondary';
  label: string;
  classes: string;
  scheduleSummary: string;
  cohortSize: string;
  timingNote: string;
  sessions: {
    day: string;
    time: string;
    subject: string;
    instructor: string;
  }[];
}

export interface NoticeItem {
  id: string;
  refCode: string;
  date: string;
  category: 'admissions' | 'examinations' | 'events';
  categoryLabel: string;
  title: string;
  summary: string;
  fullText: string[];
  venueOrMode: string;
  issuedBy: string;
}

export const HERO_MOSQUE_IMAGE = '/src/assets/images/hero_mosque_academy_1795074356108.jpg';
export const PRINCIPAL_PORTRAIT_IMAGE = '/src/assets/images/principal_scholar_portrait_1795074355746.jpg';
export const ONLINE_LEARNING_IMAGE = '/src/assets/images/online_learning_session_1795074356262.jpg';

export const ACADEMIC_PROGRAMMES: AcademicProgramme[] = [
  {
    id: 'foundational-primary',
    stage: 'primary',
    stageLabel: 'Primary Wing',
    classRange: 'Class 1 – Class 3',
    ageRange: 'Ages 6 – 9',
    title: 'Foundational Literacy, Numeracy & Noorani Qaida',
    summary:
      'Gentle, structured early schooling that nurtures curiosity in reading and numbers while establishing joyful Quranic recitation, daily Adab, and love for the Masjid.',
    weeklyPeriods: '32 Periods / Week',
    generalSubjects: [
      'English Phonics & Reading',
      'Foundational Mathematics',
      'Environmental Discovery',
      'Creative Drawing & Calligraphy',
      'Guided Physical Activity',
    ],
    islamicSubjects: [
      'Noorani Qaida & Nazirah Quran',
      'Short Surahs Memorization (Juz Amma)',
      'Stories of the Prophets',
      'Daily Duas & Islamic Manners (Adab)',
    ],
    outcomes: [
      'Confident reading fluency in English and foundational Arabic script',
      'Accurate pronunciation (Makharij) from Class 1 onward',
      'Kindness, truthfulness, and respectful classroom habits',
    ],
  },
  {
    id: 'upper-primary',
    stage: 'primary',
    stageLabel: 'Primary Wing',
    classRange: 'Class 4 – Class 5',
    ageRange: 'Ages 9 – 11',
    title: 'Core Sciences, Arabic Foundations & Tajweed',
    summary:
      'Bridging concrete understanding with analytical thinking across Mathematics, General Science, and structured Tajweed rules alongside introductory Arabic grammar.',
    weeklyPeriods: '34 Periods / Week',
    generalSubjects: [
      'English Grammar & Composition',
      'Arithmetic, Fractions & Geometry',
      'Integrated General Science',
      'World Geography & Civics',
      'Digital Literacy & Typing',
    ],
    islamicSubjects: [
      'Applied Tajweed & Fluent Recitation',
      'Foundations of Wudu & Salah (Fiqh)',
      'Seerah of Prophet Muhammad (SAW)',
      'Conversational Arabic Vocabulary',
    ],
    outcomes: [
      'Independent problem-solving in multi-step arithmetic',
      'Consistent five-times daily prayer awareness and Tajweed fluency',
      'Structured paragraph writing and scientific observation journals',
    ],
  },
  {
    id: 'middle-wing',
    stage: 'middle',
    stageLabel: 'Middle Wing',
    classRange: 'Class 6 – Class 8',
    ageRange: 'Ages 11 – 14',
    title: 'Pre-Secondary STEM, Classical Arabic & Tarbiyah',
    summary:
      'A pivotal stage cultivating critical reasoning, laboratory inquiry, coding fundamentals, and deeper engagement with Quranic Tafsir, Hadith, and classical Arabic morphology.',
    weeklyPeriods: '36 Periods / Week',
    generalSubjects: [
      'Algebra & Euclidean Geometry',
      'Physics, Chemistry & Biology Labs',
      'English Literature & Rhetoric',
      'Python Computing & Data Literacy',
      'History & Civic Studies',
    ],
    islamicSubjects: [
      'Selected Tafsir & Word-to-Word Quran',
      '40 Hadith An-Nawawi Study',
      'Arabic Nahw & Sarf Foundations',
      'Optional Guided Hifz-ul-Quran Track',
    ],
    outcomes: [
      'Readiness for national board science and mathematics syllabi',
      'Ability to comprehend simple classical Arabic sentences directly',
      'Resilient Islamic identity in peer and digital environments',
    ],
  },
  {
    id: 'secondary-board',
    stage: 'secondary',
    stageLabel: 'Secondary Wing',
    classRange: 'Class 9 – Class 10',
    ageRange: 'Ages 14 – 16',
    title: 'Secondary Board Excellence & Islamic Jurisprudence',
    summary:
      'Rigorous board-examination preparation in Pure Sciences, Higher Mathematics, and Computing paired with disciplined study of Fiqh, Aqeedah, and contemporary Islamic ethics.',
    weeklyPeriods: '38 Periods / Week',
    generalSubjects: [
      'Secondary Physics, Chemistry & Biology',
      'Higher Mathematics & Trigonometry',
      'Computer Science & Algorithms',
      'Academic English & Essay Writing',
      'Economics & Modern History',
    ],
    islamicSubjects: [
      'Usul al-Fiqh & Practical Worship',
      'Aqeedah & Intellectual Clarity',
      'Quranic Sciences (Ulum al-Quran)',
      'Dawah, Ethics & Leadership Seminars',
    ],
    outcomes: [
      'Distinction-level board examination readiness with weekly mock clinics',
      'Sound grounding in Islamic creed and evidence-based jurisprudence',
      'Articulate public speaking in English and Arabic assemblies',
    ],
  },
  {
    id: 'higher-secondary',
    stage: 'higher-secondary',
    stageLabel: 'Higher Secondary Wing',
    classRange: 'Class 11 – Class 12',
    ageRange: 'Ages 16 – 18',
    title: 'Pre-University Streams (Science / Commerce) & Alimiyyah Bridge',
    summary:
      'Senior college preparation guiding graduates toward leading universities in Medicine, Engineering, Finance, or Classical Islamic Scholarship without compromising moral character.',
    weeklyPeriods: '40 Periods / Week',
    generalSubjects: [
      'Calculus, Mechanics & Electromagnetism',
      'Organic Chemistry & Molecular Biology',
      'Accounting, Finance & Business Economics',
      'Computer Science & Applied Statistics',
      'University Entrance & Career Mentorship',
    ],
    islamicSubjects: [
      'Comparative Hadith & Tafsir Methodology',
      'Islamic Finance & Contemporary Issues',
      'Arabic Balaghah (Eloquence)',
      'Community Service & Khutbah Mentorship',
    ],
    outcomes: [
      'Competitive scores for medical, engineering, and business admissions',
      'Balanced worldview capable of ethical leadership in modern professions',
      'Optional Alimiyyah / Ijazah certification pathway alongside graduation',
    ],
  },
];

export const CURRICULUM_STREAMS: CurriculumStream[] = [
  {
    id: 'general',
    eyebrow: 'Wing 01 · Modern Academic Standards',
    title: 'General Education',
    subtitle: 'National & International Board Alignment from Class 1 to Class 12',
    description:
      'Every learner receives rigorous instruction in mathematics, natural sciences, humanities, and digital computing—taught by subject specialists in well-equipped laboratories and seminar rooms.',
    pillars: [
      {
        index: '01.',
        title: 'Mathematics & Logical Reasoning',
        detail: 'Structured progression from concrete arithmetic to calculus, statistics, and Olympiad problem-solving.',
        grades: 'Class 1 – Class 12',
      },
      {
        index: '02.',
        title: 'Experimental Sciences & Laboratories',
        detail: 'Hands-on Physics, Chemistry, and Biology practicals fostering disciplined observation and scientific inquiry.',
        grades: 'Class 4 – Class 12',
      },
      {
        index: '03.',
        title: 'English Proficiency & Humanities',
        detail: 'Academic writing, literary analysis, world history, geography, and civic responsibility.',
        grades: 'Class 1 – Class 12',
      },
      {
        index: '04.',
        title: 'Computing & Applied Technology',
        detail: 'Foundational digital stewardship, programming logic, algorithms, and responsible use of technology.',
        grades: 'Class 3 – Class 12',
      },
    ],
  },
  {
    id: 'islamic',
    eyebrow: 'Wing 02 · Sacred Knowledge & Tarbiyah',
    title: 'Islamic Education',
    subtitle: 'Authentic Quranic, Arabic & Moral Formation Woven Into Every School Day',
    description:
      'Islamic studies are never treated as an afterthought. Students learn directly from qualified scholars with unbroken chains of Tajweed, classical Arabic grammar, and compassionate character building.',
    pillars: [
      {
        index: '01.',
        title: 'Quran Recitation, Tajweed & Hifz',
        detail: 'Daily small-circle recitation correcting Makharij, with an optional structured Hifz-ul-Quran memorization track.',
        grades: 'Class 1 – Class 12',
      },
      {
        index: '02.',
        title: 'Classical & Conversational Arabic',
        detail: 'Progressive mastery of Arabic reading, Nahw (syntax), and Sarf (morphology) to understand revelation directly.',
        grades: 'Class 1 – Class 12',
      },
      {
        index: '03.',
        title: 'Aqeedah, Fiqh & Hadith Studies',
        detail: 'Age-appropriate instruction in creed, purification, prayer, transactions, and Prophetic traditions.',
        grades: 'Class 2 – Class 12',
      },
      {
        index: '04.',
        title: 'Seerah & Character Tarbiyah',
        detail: 'Living the Prophetic example through daily congregational Salah, honesty, filial respect, and service.',
        grades: 'Class 1 – Class 12',
      },
    ],
  },
];

export const FACULTY_MEMBERS: FacultyMember[] = [
  {
    id: 'ustadh-tariq',
    name: 'Ustadh Tariq Al-Mansoor',
    role: 'Chair of Quranic Sciences & Arabic',
    department: 'islamic',
    departmentLabel: 'Islamic Studies & Quran',
    qualification: 'Al-Azhar B.A. Usul al-Din · Ijazah in Hafs & Shu’bah',
    experience: '14 Years Teaching',
    classesTaught: 'Class 4 – Class 12',
    image: '/src/assets/images/teacher_quran_arabic_1795074356458.jpg',
    specialization: 'Tajweed Phonetics, Classical Arabic Syntax & Hifz Supervision',
    bio: 'Ustadh Tariq leads the Academy’s Quran and Arabic Wing. Having earned his Ijazah in the Ten Qira’at and a degree from Al-Azhar University, he specializes in guiding young learners toward effortless, heartfelt recitation alongside fluent Arabic comprehension.',
  },
  {
    id: 'dr-ayesha-siddiqui',
    name: 'Dr. Ayesha Siddiqui',
    role: 'Head of Natural Sciences',
    department: 'science',
    departmentLabel: 'Sciences & Mathematics',
    qualification: 'Ph.D. Organic Chemistry · M.Ed.',
    experience: '12 Years Teaching',
    classesTaught: 'Class 8 – Class 12',
    image: '/src/assets/images/teacher_science_female_1795074356658.jpg',
    specialization: 'Secondary & Higher Secondary Chemistry, Laboratory Inquiry',
    bio: 'Dr. Ayesha directs the Academy’s Science Wing and laboratory curriculum. Her pedagogy connects modern molecular science with wonder at the natural world, mentoring Class 11–12 graduates for top medical and science university placements.',
  },
  {
    id: 'prof-imran-farooq',
    name: 'Prof. Imran Farooq',
    role: 'Senior Lead in Mathematics & Computing',
    department: 'science',
    departmentLabel: 'Sciences & Mathematics',
    qualification: 'M.Sc. Applied Mathematics · B.Tech CS',
    experience: '16 Years Teaching',
    classesTaught: 'Class 7 – Class 12',
    image: '/src/assets/images/teacher_math_male_1795074356342.jpg',
    specialization: 'Higher Calculus, Olympiad Problem-Solving & Algorithms',
    bio: 'With sixteen years guiding secondary and higher-secondary scholars, Prof. Imran oversees Mathematics and Computer Science across both Campus and Live Online divisions, helping students turn abstract proofs into clear intuition.',
  },
  {
    id: 'ustadha-maryam-hasan',
    name: 'Ustadha Maryam Hasan',
    role: 'Lead Educator — Primary Tarbiyah & English',
    department: 'humanities',
    departmentLabel: 'Languages & Humanities',
    qualification: 'M.A. English Literature · Montessori & Tarbiyah Diploma',
    experience: '10 Years Teaching',
    classesTaught: 'Class 1 – Class 5',
    specialization: 'Early Literacy, Prophetic Storytelling & Classroom Adab',
    bio: 'Ustadha Maryam anchors the Primary Wing, cultivating joyful early reading habits and gentle Islamic manners in Class 1–5 classrooms.',
  },
  {
    id: 'mawlana-zayd-qasmi',
    name: 'Mawlana Zayd Al-Qasmi',
    role: 'Lecturer in Fiqh, Seerah & Islamic History',
    department: 'islamic',
    departmentLabel: 'Islamic Studies & Quran',
    qualification: 'Fazil-e-Dars-e-Nizami · M.A. Islamic Studies',
    experience: '11 Years Teaching',
    classesTaught: 'Class 6 – Class 12',
    specialization: 'Hanafi & Comparative Fiqh, Islamic Civilization',
    bio: 'Mawlana Zayd teaches Islamic Jurisprudence, Creed, and Civilization, bridging classical texts with thoughtful answers to questions facing modern youth.',
  },
  {
    id: 'ms-nadia-kareem',
    name: 'Ms. Nadia Kareem',
    role: 'Senior Educator — Humanities & Economics',
    department: 'humanities',
    departmentLabel: 'Languages & Humanities',
    qualification: 'M.Phil. Economics · B.Ed.',
    experience: '9 Years Teaching',
    classesTaught: 'Class 9 – Class 12',
    specialization: 'Macroeconomics, Islamic Finance & Academic Writing',
    bio: 'Ms. Nadia leads Commerce and Humanities seminars for Classes 9–12, preparing students for board distinctions and ethical business studies.',
  },
];

export const ONLINE_TRACKS: OnlineTrack[] = [
  {
    id: 'primary',
    label: 'Primary Online (Class 1–5)',
    classes: 'Class 1 – Class 5',
    scheduleSummary: 'Mon – Fri · 3.5 Live Hours / Day',
    cohortSize: 'Max 14 Students / Section',
    timingNote: 'Morning & Afternoon Time-Zone Batches Available',
    sessions: [
      { day: 'Mon / Wed / Fri', time: '09:00 – 09:45 AM', subject: 'Quran Nazirah & Tajweed Circle', instructor: 'Ustadh Tariq Al-Mansoor' },
      { day: 'Mon – Fri', time: '10:00 – 10:45 AM', subject: 'Core Mathematics & Mental Arithmetic', instructor: 'Primary STEM Faculty' },
      { day: 'Tue / Thu', time: '11:00 – 11:45 AM', subject: 'English Reading, Phonics & Writing', instructor: 'Ustadha Maryam Hasan' },
      { day: 'Daily', time: '12:00 – 12:30 PM', subject: 'Stories of Prophets & Daily Adab', instructor: 'Primary Tarbiyah Mentor' },
    ],
  },
  {
    id: 'middle',
    label: 'Middle Online (Class 6–8)',
    classes: 'Class 6 – Class 8',
    scheduleSummary: 'Mon – Fri · 4.5 Live Hours / Day',
    cohortSize: 'Max 18 Students / Section',
    timingNote: 'Live Interactive Whiteboard + Weekly Lab Demos',
    sessions: [
      { day: 'Mon – Fri', time: '08:30 – 09:20 AM', subject: 'Algebra, Geometry & Reasoning', instructor: 'Prof. Imran Farooq' },
      { day: 'Mon / Wed / Fri', time: '09:30 – 10:20 AM', subject: 'Integrated Physics & Biology', instructor: 'Dr. Ayesha Siddiqui' },
      { day: 'Tue / Thu', time: '10:30 – 11:20 AM', subject: 'Classical Arabic Nahw & Sarf', instructor: 'Ustadh Tariq Al-Mansoor' },
      { day: 'Daily', time: '11:30 – 12:15 PM', subject: 'Tafsir, 40 Hadith & Seerah Seminar', instructor: 'Mawlana Zayd Al-Qasmi' },
    ],
  },
  {
    id: 'secondary',
    label: 'Secondary & Senior (Class 9–12)',
    classes: 'Class 9 – Class 12',
    scheduleSummary: 'Mon – Sat · 5.5 Live Hours / Day',
    cohortSize: 'Max 20 Students / Section',
    timingNote: 'Board Exam Clinics + Recorded Revision Library',
    sessions: [
      { day: 'Mon – Fri', time: '08:00 – 09:00 AM', subject: 'Higher Mathematics & Calculus', instructor: 'Prof. Imran Farooq' },
      { day: 'Mon / Wed / Fri', time: '09:15 – 10:15 AM', subject: 'Organic Chemistry & Lab Analysis', instructor: 'Dr. Ayesha Siddiqui' },
      { day: 'Tue / Thu / Sat', time: '10:30 – 11:30 AM', subject: 'Usul al-Fiqh & Contemporary Issues', instructor: 'Mawlana Zayd Al-Qasmi' },
      { day: 'Sat Clinic', time: '11:45 – 12:45 PM', subject: 'Past-Paper Mock Review & Mentorship', instructor: 'Senior Board Panel' },
    ],
  },
];

export const NOTICES: NoticeItem[] = [
  {
    id: 'adm-2026-01',
    refCode: 'AIA/ADM/2026-04',
    date: '18 Nov 2026',
    category: 'admissions',
    categoryLabel: 'Admissions',
    title: 'Admissions Open for Academic Session 2026–2027 (Class 1 to Class 12)',
    summary:
      'Applications are invited for both On-Campus Day Scholars and Live Online Cohorts across Primary, Middle, Secondary, and Higher Secondary wings.',
    fullText: [
      'As-Siddique Islamic Academy is pleased to announce that admissions for the 2026–2027 academic session are now open across Class 1 through Class 12.',
      'Parents may opt for either our main On-Campus programme or our structured Live Online Classes wing. Merit-based scholarships and sibling fee concessions are available upon formal application.',
      'Entrance assessments for Class 4–12 applicants cover English, Mathematics, and foundational Quranic recitation. Primary Class 1–3 applicants attend an informal readiness interaction with parents.',
    ],
    venueOrMode: 'Main Campus Admissions Office & Online Portal',
    issuedBy: 'Office of the Registrar',
  },
  {
    id: 'exm-2026-02',
    refCode: 'AIA/EXM/2026-11',
    date: '12 Nov 2026',
    category: 'examinations',
    categoryLabel: 'Examinations',
    title: 'Mid-Term Assessment & Quran Tajweed Oral Evaluation Schedule',
    summary:
      'The comprehensive Mid-Term timetable for Class 1–12 written examinations and individual Nazirah/Hifz oral assessments has been finalized.',
    fullText: [
      'Written Mid-Term examinations for General Education subjects will commence on Monday, 7 December 2026, in the morning session from 08:30 AM to 11:30 AM.',
      'Individual oral evaluations for Quran Nazirah, Tajweed rules, and Hifz-ul-Quran revisions will take place during the preceding week (30 November – 4 December 2026).',
      'Online Class students will receive secure proctored assessment links and individual Tajweed Zoom slot timings through their parent email dispatch.',
    ],
    venueOrMode: 'Examination Hall A & Live Online Assessment Rooms',
    issuedBy: 'Controller of Examinations',
  },
  {
    id: 'evt-2026-03',
    refCode: 'AIA/EVT/2026-09',
    date: '04 Nov 2026',
    category: 'events',
    categoryLabel: 'Events & Holidays',
    title: 'Annual Seerah Symposium & Parent-Teacher Tarbiyah Evening',
    summary:
      'Parents and guardians are cordially invited to attend student Arabic & English speeches, Science exhibition stalls, and individual progress consultations.',
    fullText: [
      'Our Annual Seerah Symposium will be held on Saturday, 28 November 2026, from 09:30 AM to 01:30 PM in the Academy Courtyard and Auditorium.',
      'Class 6–12 scholars will present research exhibitions bridging Islamic scientific heritage with modern physics, chemistry, and mathematics, followed by Quran recitation and Seerah reflections.',
      'Parent-Teacher consultations for both campus and online families will follow the main assembly.',
    ],
    venueOrMode: 'Academy Courtyard & Livestream for Online Families',
    issuedBy: 'Student Affairs & Tarbiyah Committee',
  },
  {
    id: 'adm-2026-04',
    refCode: 'AIA/ONL/2026-07',
    date: '29 Oct 2026',
    category: 'admissions',
    categoryLabel: 'Admissions',
    title: 'Free Diagnostic Trial Week for Prospective Online Classes Families',
    summary:
      'Register for a complimentary two-day observation and placement session in our live Class 1–12 online classrooms.',
    fullText: [
      'Families considering our Live Online Classes wing may reserve a complimentary trial observation pass during the first week of each month.',
      'Prospective students join a live Mathematics and Quran Tajweed session suited to their age band and receive a brief academic placement recommendation from our coordinators.',
    ],
    venueOrMode: 'Live Virtual Classrooms',
    issuedBy: 'Online Wing Coordinator',
  },
];
