import crypto from 'crypto';

export const FIREBASE_PROJECT_ID = 'gen-lang-client-0175021821';
const SECURETOKEN_CERTS_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

const RUNTIME_FALLBACK_SECRET = crypto.randomBytes(32);

function getSigningSecret(): Buffer {
  const configured = process.env.LMS_SIGNING_SECRET?.trim();
  if (configured && configured.length >= 16) {
    return crypto.createHash('sha256').update(configured).digest();
  }
  return RUNTIME_FALLBACK_SECRET;
}

export interface ServerMcqQuestion {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
}

export interface PublicMcqQuestion {
  id: string;
  question: string;
  options: [string, string, string, string];
}

export interface LessonQuizBank {
  lessonId: string;
  courseId: string;
  passingPercentage: number;
  maxAttempts: number;
  randomizeQuestions: boolean;
  questions: ServerMcqQuestion[];
}

export interface VerifiedFirebaseToken {
  uid: string;
  email: string;
  emailVerified: boolean;
}

// Canonical server-side answer keys for seeded demo lessons so built-in sequential courses
// remain authoritative and verifiable across server restarts even without LMS_SIGNING_SECRET.
export const CANONICAL_DEMO_QUIZ_BANKS: Record<string, LessonQuizBank> = {
  'les-1': {
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
  'les-1-2': {
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
  'les-2': {
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
  'les-2-2': {
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
  'les-3': {
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
  'les-3-2': {
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
  'les-4': {
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
  'les-4-2': {
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
  'les-5': {
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
  'les-5-2': {
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
  'les-6': {
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
  'les-6-2': {
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
};

let certCache: { certs: Record<string, string>; expiresAt: number } | null = null;

async function fetchGoogleSecureTokenCerts(): Promise<Record<string, string>> {
  const now = Date.now();
  if (certCache && now < certCache.expiresAt) {
    return certCache.certs;
  }

  const response = await fetch(SECURETOKEN_CERTS_URL);
  if (!response.ok) {
    throw new Error(`Unable to fetch Firebase public certificates (${response.status}).`);
  }

  const cacheControl = response.headers.get('cache-control') || '';
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/i);
  const maxAgeMs = maxAgeMatch ? Number(maxAgeMatch[1]) * 1000 : 300_000;
  const certs = (await response.json()) as Record<string, string>;

  certCache = {
    certs,
    expiresAt: now + Math.max(60_000, maxAgeMs),
  };
  return certs;
}

function decodeBase64Url(input: string): Buffer {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/');
  const mod = padded.length % 4;
  const suffix = mod === 0 ? '' : '='.repeat(4 - mod);
  return Buffer.from(padded + suffix, 'base64');
}

export async function verifyFirebaseIdToken(bearerHeader?: string): Promise<VerifiedFirebaseToken> {
  if (!bearerHeader || !bearerHeader.startsWith('Bearer ')) {
    throw new Error('MISSING_AUTH_TOKEN');
  }
  const token = bearerHeader.slice('Bearer '.length).trim();
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('INVALID_AUTH_TOKEN_FORMAT');
  }

  const [headerB64, payloadB64, signatureB64] = parts;
  const header = JSON.parse(decodeBase64Url(headerB64).toString('utf8')) as {
    alg?: string;
    kid?: string;
  };
  const payload = JSON.parse(decodeBase64Url(payloadB64).toString('utf8')) as {
    aud?: string;
    iss?: string;
    sub?: string;
    exp?: number;
    iat?: number;
    auth_time?: number;
    email?: string;
    email_verified?: boolean;
  };

  if (header.alg !== 'RS256' || !header.kid) {
    throw new Error('INVALID_TOKEN_HEADER');
  }

  const certs = await fetchGoogleSecureTokenCerts();
  let certPem = certs[header.kid];
  if (!certPem) {
    certCache = null;
    const freshCerts = await fetchGoogleSecureTokenCerts();
    certPem = freshCerts[header.kid];
  }
  if (!certPem) {
    throw new Error('UNKNOWN_TOKEN_KEY_ID');
  }

  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(`${headerB64}.${payloadB64}`);
  verifier.end();
  const sigValid = verifier.verify(certPem, decodeBase64Url(signatureB64));
  if (!sigValid) {
    throw new Error('INVALID_TOKEN_SIGNATURE');
  }

  const nowSec = Math.floor(Date.now() / 1000);
  if (payload.aud !== FIREBASE_PROJECT_ID) {
    throw new Error('INVALID_TOKEN_AUDIENCE');
  }
  if (payload.iss !== `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`) {
    throw new Error('INVALID_TOKEN_ISSUER');
  }
  if (!payload.sub || typeof payload.sub !== 'string' || payload.sub.length > 128) {
    throw new Error('INVALID_TOKEN_SUBJECT');
  }
  if (typeof payload.exp !== 'number' || payload.exp <= nowSec) {
    throw new Error('EXPIRED_AUTH_TOKEN');
  }

  return {
    uid: payload.sub,
    email: typeof payload.email === 'string' ? payload.email : '',
    emailVerified: Boolean(payload.email_verified),
  };
}

export function sanitizeQuestionsForStudents(questions: ServerMcqQuestion[]): PublicMcqQuestion[] {
  return questions.map((q) => ({
    id: q.id,
    question: q.question,
    options: [q.options[0], q.options[1], q.options[2], q.options[3]],
  }));
}

export function sealLessonQuiz(bank: LessonQuizBank): {
  sealedAnswerKey: string;
  quizQuestionsPublic: PublicMcqQuestion[];
  passingPercentage: number;
  maxAttempts: number;
  randomizeQuestions: boolean;
} {
  const cleanPassing = Math.min(100, Math.max(1, Math.round(bank.passingPercentage || 70)));
  const cleanAttempts = Math.min(20, Math.max(1, Math.round(bank.maxAttempts || 3)));
  const cleanBank: LessonQuizBank = {
    lessonId: bank.lessonId,
    courseId: bank.courseId,
    passingPercentage: cleanPassing,
    maxAttempts: cleanAttempts,
    randomizeQuestions: Boolean(bank.randomizeQuestions),
    questions: bank.questions.map((q, idx) => ({
      id: (q.id || `q_${idx + 1}`).trim(),
      question: q.question.trim(),
      options: [
        q.options[0]?.trim() || 'Option A',
        q.options[1]?.trim() || 'Option B',
        q.options[2]?.trim() || 'Option C',
        q.options[3]?.trim() || 'Option D',
      ],
      correctIndex: ([0, 1, 2, 3].includes(Number(q.correctIndex)) ? Number(q.correctIndex) : 0) as
        | 0
        | 1
        | 2
        | 3,
      explanation: (q.explanation || 'Review the lesson lecture for confirmation.').trim(),
    })),
  };

  const iv = crypto.randomBytes(12);
  const key = getSigningSecret();
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const plaintext = Buffer.from(JSON.stringify(cleanBank), 'utf8');
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();

  const sealedAnswerKey = [
    'v1',
    iv.toString('base64url'),
    tag.toString('base64url'),
    encrypted.toString('base64url'),
  ].join('.');

  return {
    sealedAnswerKey,
    quizQuestionsPublic: sanitizeQuestionsForStudents(cleanBank.questions),
    passingPercentage: cleanPassing,
    maxAttempts: cleanAttempts,
    randomizeQuestions: cleanBank.randomizeQuestions,
  };
}

export function unsealLessonQuiz(sealedAnswerKey: string): LessonQuizBank {
  const parts = sealedAnswerKey.split('.');
  if (parts.length !== 4 || parts[0] !== 'v1') {
    throw new Error('INVALID_SEALED_QUIZ_FORMAT');
  }
  const iv = Buffer.from(parts[1], 'base64url');
  const tag = Buffer.from(parts[2], 'base64url');
  const encrypted = Buffer.from(parts[3], 'base64url');

  const key = getSigningSecret();
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
  return JSON.parse(decrypted) as LessonQuizBank;
}

export function verifyVideoWatchAndMintToken(params: {
  uid: string;
  courseId: string;
  lessonId: string;
  watchedSeconds: number;
  durationSeconds: number;
  maxWatchedPercent: number;
  continuousCoverageRatio?: number;
}): {
  videoCompleted: boolean;
  watchedPercent: number;
  watchProofToken?: string;
  reason?: string;
} {
  const safeDuration = Math.max(0, Number(params.durationSeconds || 0));
  const safeWatchedSec = Math.max(0, Number(params.watchedSeconds || 0));
  const computedPct =
    safeDuration > 0
      ? Math.min(100, Math.round((safeWatchedSec / safeDuration) * 100))
      : Math.min(100, Math.round(Number(params.maxWatchedPercent || 0)));
  const maxPct = Math.max(computedPct, Math.min(100, Math.round(Number(params.maxWatchedPercent || 0))));
  const coverage =
    params.continuousCoverageRatio === undefined
      ? 1
      : Math.max(0, Math.min(1, Number(params.continuousCoverageRatio)));

  // Enforce anti-skip completion threshold: >= 90% progress AND >= 80% continuous coverage
  if (safeDuration < 3 || maxPct < 90 || coverage < 0.8) {
    return {
      videoCompleted: false,
      watchedPercent: maxPct,
      reason: `Video watch requirement not yet met (${maxPct}% watched; 90% continuous viewing required to unlock MCQ assessment).`,
    };
  }

  const payload = {
    uid: params.uid,
    courseId: params.courseId,
    lessonId: params.lessonId,
    watchedPercent: maxPct,
    issuedAt: Date.now(),
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto
    .createHmac('sha256', getSigningSecret())
    .update(encodedPayload)
    .digest('base64url');

  return {
    videoCompleted: true,
    watchedPercent: maxPct,
    watchProofToken: `${encodedPayload}.${sig}`,
  };
}

export function verifyWatchProofToken(
  token: string | undefined,
  expectedUid: string,
  expectedCourseId: string,
  expectedLessonId: string
): boolean {
  if (!token || !token.includes('.')) return false;
  const [encodedPayload, sig] = token.split('.');
  if (!encodedPayload || !sig) return false;

  const expectedSig = crypto
    .createHmac('sha256', getSigningSecret())
    .update(encodedPayload)
    .digest('base64url');

  const sigBuf = Buffer.from(sig, 'utf8');
  const expBuf = Buffer.from(expectedSig, 'utf8');
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return false;
  }

  try {
    const parsed = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as {
      uid?: string;
      courseId?: string;
      lessonId?: string;
      watchedPercent?: number;
    };
    return (
      parsed.uid === expectedUid &&
      parsed.courseId === expectedCourseId &&
      parsed.lessonId === expectedLessonId &&
      typeof parsed.watchedPercent === 'number' &&
      parsed.watchedPercent >= 90
    );
  } catch {
    return false;
  }
}

export function gradeLessonQuiz(params: {
  uid: string;
  courseId: string;
  lessonId: string;
  orderedLessonIds: string[];
  watchProofToken?: string;
  sealedAnswerKey?: string;
  answers: Record<string, number>;
  previousAttemptsCount: number;
  passedLessonIdsPreviously: string[];
}): {
  ok: true;
  attemptNumber: number;
  submittedAt: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  passingPercentage: number;
  maxAttempts: number;
  passed: boolean;
  results: {
    questionId: string;
    selectedIndex: number;
    correctIndex: number;
    correct: boolean;
    explanation: string;
  }[];
  unlockedNextLessonId: string | null;
  passedLessonIds: string[];
  unlockedLessonIds: string[];
  courseCompletionPercent: number;
  certificateEarned: boolean;
  serverReceiptSig: string;
} {
  if (!verifyWatchProofToken(params.watchProofToken, params.uid, params.courseId, params.lessonId)) {
    throw new Error('VIDEO_WATCH_PROOF_REQUIRED');
  }

  let bank: LessonQuizBank | undefined;
  if (params.sealedAnswerKey) {
    try {
      const unsealed = unsealLessonQuiz(params.sealedAnswerKey);
      if (unsealed.lessonId === params.lessonId && unsealed.courseId === params.courseId) {
        bank = unsealed;
      }
    } catch {
      // Fallback to canonical demo quiz bank if sealed token was from an earlier ephemeral key
    }
  }

  if (!bank) {
    bank = CANONICAL_DEMO_QUIZ_BANKS[params.lessonId];
  }

  if (!bank || bank.questions.length === 0) {
    throw new Error('QUIZ_BANK_NOT_AVAILABLE');
  }

  const alreadyPassed = params.passedLessonIdsPreviously.includes(params.lessonId);
  if (!alreadyPassed && params.previousAttemptsCount >= bank.maxAttempts) {
    throw new Error('MAX_QUIZ_ATTEMPTS_REACHED');
  }

  const results = bank.questions.map((q) => {
    const rawSelected = params.answers?.[q.id];
    const selectedIndex = typeof rawSelected === 'number' ? rawSelected : -1;
    const correct = selectedIndex === q.correctIndex;
    return {
      questionId: q.id,
      selectedIndex,
      correctIndex: q.correctIndex,
      correct,
      explanation: q.explanation,
    };
  });

  const score = results.filter((r) => r.correct).length;
  const totalQuestions = bank.questions.length;
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const passed = percentage >= bank.passingPercentage;

  const passedSet = new Set(params.passedLessonIdsPreviously);
  if (passed) {
    passedSet.add(params.lessonId);
  }
  const passedLessonIds = params.orderedLessonIds.filter((id) => passedSet.has(id));

  // Sequential progression calculation:
  // Lesson 01 is always unlocked. Lesson i+1 unlocks ONLY when Lesson i has been passed.
  const unlockedSet = new Set<string>();
  if (params.orderedLessonIds.length > 0) {
    unlockedSet.add(params.orderedLessonIds[0]);
  }
  for (let i = 0; i < params.orderedLessonIds.length; i++) {
    const id = params.orderedLessonIds[i];
    if (passedSet.has(id)) {
      unlockedSet.add(id);
      if (i + 1 < params.orderedLessonIds.length) {
        unlockedSet.add(params.orderedLessonIds[i + 1]);
      }
    } else {
      break;
    }
  }

  const currentIdx = params.orderedLessonIds.indexOf(params.lessonId);
  const unlockedNextLessonId =
    passed && currentIdx >= 0 && currentIdx + 1 < params.orderedLessonIds.length
      ? params.orderedLessonIds[currentIdx + 1]
      : null;

  const unlockedLessonIds = params.orderedLessonIds.filter((id) => unlockedSet.has(id));
  const courseCompletionPercent =
    params.orderedLessonIds.length > 0
      ? Math.round((passedLessonIds.length / params.orderedLessonIds.length) * 100)
      : 0;
  const certificateEarned =
    params.orderedLessonIds.length > 0 && passedLessonIds.length === params.orderedLessonIds.length;

  const submittedAt = new Date().toISOString();
  const attemptNumber = params.previousAttemptsCount + 1;
  const serverReceiptSig = crypto
    .createHmac('sha256', getSigningSecret())
    .update(
      `${params.uid}:${params.courseId}:${params.lessonId}:${attemptNumber}:${score}:${totalQuestions}:${passed}:${submittedAt}`
    )
    .digest('hex')
    .slice(0, 24);

  return {
    ok: true,
    attemptNumber,
    submittedAt,
    score,
    totalQuestions,
    percentage,
    passingPercentage: bank.passingPercentage,
    maxAttempts: bank.maxAttempts,
    passed,
    results,
    unlockedNextLessonId,
    passedLessonIds,
    unlockedLessonIds,
    courseCompletionPercent,
    certificateEarned,
    serverReceiptSig,
  };
}
