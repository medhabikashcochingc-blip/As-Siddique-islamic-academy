import { LanguageCode } from '../types/platform';

export interface TranslationBundle {
  tagline: string;
  nav: {
    home: string;
    about: string;
    programmes: string;
    courses: string;
    library: string;
    teachers: string;
    results: string;
    admission: string;
    portal: string;
    academyMore: string;
  };
  hero: {
    exploreBtn: string;
    applyBtn: string;
    arabicGreeting: string;
  };
  badges: {
    classes: string;
    board: string;
    islamic: string;
    modes: string;
  };
  shortcutsTitle: string;
  shortcuts: {
    courses: string;
    liveClasses: string;
    results: string;
    studentDashboard: string;
    fees: string;
    library: string;
  };
  sections: {
    programmesEyebrow: string;
    programmesTitle: string;
    generalWing: string;
    islamicWing: string;
    principalEyebrow: string;
    principalTitle: string;
    teachersEyebrow: string;
    teachersTitle: string;
    whyChooseUsTitle: string;
    noticesTitle: string;
    eventsTitle: string;
    admissionTitle: string;
    contactTitle: string;
  };
}

export const TRANSLATIONS: Record<LanguageCode, TranslationBundle> = {
  en: {
    tagline: 'Learn · Practice · Preach',
    nav: {
      home: 'Home',
      about: 'About',
      programmes: 'Programmes',
      courses: 'Courses',
      library: 'Library',
      teachers: 'Teachers',
      results: 'Results',
      admission: 'Admission',
      portal: 'Portal Login',
      academyMore: 'Academy',
    },
    hero: {
      exploreBtn: 'Explore Academy',
      applyBtn: 'Apply for Admission',
      arabicGreeting: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
    },
    badges: {
      classes: 'Class 1–12',
      board: 'West Bengal State Board',
      islamic: 'Islamic Education',
      modes: 'Offline & Online Learning',
    },
    shortcutsTitle: 'Quick Digital Portals',
    shortcuts: {
      courses: 'Online Courses',
      liveClasses: 'Live Classes',
      results: 'Examination Results',
      studentDashboard: 'Student Dashboard',
      fees: 'Fees & Payment',
      library: 'Digital Library',
    },
    sections: {
      programmesEyebrow: 'Class 1 to Class 12 · Dual Education Architecture',
      programmesTitle: 'Academic Programmes',
      generalWing: 'General School Education',
      islamicWing: 'Islamic Education',
      principalEyebrow: 'Principal’s Message',
      principalTitle: 'Educating the Mind, Illuminating the Heart',
      teachersEyebrow: 'Faculty Showcase',
      teachersTitle: 'Teachers Gallery',
      whyChooseUsTitle: 'Why Choose As-Siddique Islamic Academy',
      noticesTitle: 'Latest Notices',
      eventsTitle: 'Upcoming Events',
      admissionTitle: 'Quick Online Admission',
      contactTitle: 'Contact As-Siddique Islamic Academy',
    },
  },
  bn: {
    tagline: 'শিক্ষা · অনুশীলন · প্রচার (Learn · Practice · Preach)',
    nav: {
      home: 'হোম',
      about: 'পরিচিতি',
      programmes: 'পাঠ্যক্রম',
      courses: 'কোর্স',
      library: 'লাইব্রেরি',
      teachers: 'শিক্ষকমণ্ডলী',
      results: 'ফলাফল',
      admission: 'ভর্তি',
      portal: 'পোর্টাল লগইন',
      academyMore: 'একাডেমি',
    },
    hero: {
      exploreBtn: 'একাডেমি দেখুন',
      applyBtn: 'অনলাইন ভর্তি আবেদন',
      arabicGreeting: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
    },
    badges: {
      classes: 'প্রথম থেকে দ্বাদশ শ্রেণি',
      board: 'পশ্চিমবঙ্গ রাজ্য বোর্ড',
      islamic: 'ইসলামিক শিক্ষা',
      modes: 'অফলাইন ও অনলাইন শিক্ষা',
    },
    shortcutsTitle: 'দ্রুত ডিজিটাল পোর্টাল',
    shortcuts: {
      courses: 'অনলাইন কোর্স',
      liveClasses: 'লাইভ ক্লাস',
      results: 'পরীক্ষার ফলাফল',
      studentDashboard: 'শিক্ষার্থী ড্যাশবোর্ড',
      fees: 'ফি ও পেমেন্ট',
      library: 'ডিজিটাল লাইব্রেরি',
    },
    sections: {
      programmesEyebrow: 'প্রথম থেকে দ্বাদশ শ্রেণি · দ্বৈত শিক্ষা ব্যবস্থা',
      programmesTitle: 'একাডেমিক পাঠ্যক্রম',
      generalWing: 'সাধারণ বিদ্যালয় শিক্ষা',
      islamicWing: 'ইসলামিক শিক্ষা বিভাগ',
      principalEyebrow: 'অধ্যক্ষের বার্তা',
      principalTitle: 'জ্ঞানের চর্চা ও চরিত্রের গঠন',
      teachersEyebrow: 'অভিজ্ঞ শিক্ষকমণ্ডলী',
      teachersTitle: 'শিক্ষক গ্যালারি',
      whyChooseUsTitle: 'কেন আস-সিদ্দিক ইসলামিক একাডেমি বেছে নেবেন',
      noticesTitle: 'সাম্প্রতিক নোটিশ বোর্ড',
      eventsTitle: 'আসন্ন অনুষ্ঠানসমূহ',
      admissionTitle: 'দ্রুত অনলাইন ভর্তি আবেদন',
      contactTitle: 'যোগাযোগ করুন',
    },
  },
  ar: {
    tagline: 'تعلّم · اعمل · بلّغ (Learn · Practice · Preach)',
    nav: {
      home: 'الرئيسية',
      about: 'عن الأكاديمية',
      programmes: 'البرامج الدراسية',
      courses: 'الدورات',
      library: 'المكتبة',
      teachers: 'المعلمون',
      results: 'النتائج',
      admission: 'القبول',
      portal: 'دخول البوابة',
      academyMore: 'الأكاديمية',
    },
    hero: {
      exploreBtn: 'استكشف الأكاديمية',
      applyBtn: 'التقديم للالتحاق',
      arabicGreeting: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
    },
    badges: {
      classes: 'الصف ١ إلى ١٢',
      board: 'مجلس ولاية البنغال الغربية',
      islamic: 'التربية الإسلامية',
      modes: 'التعليم الحضوري والإلكتروني',
    },
    shortcutsTitle: 'البوابات الرقمية السريعة',
    shortcuts: {
      courses: 'الدورات الإلكترونية',
      liveClasses: 'الفصول المباشرة',
      results: 'نتائج الامتحانات',
      studentDashboard: 'لوحة الطالب',
      fees: 'الرسوم والمدفوعات',
      library: 'المكتبة الرقمية',
    },
    sections: {
      programmesEyebrow: 'الصف ١ إلى ١٢ · التعليم المزدوج المتكامل',
      programmesTitle: 'البرامج الأكاديمية',
      generalWing: 'التعليم المدرسي العام',
      islamicWing: 'قسم التربية الإسلامية',
      principalEyebrow: 'كلمة المدير',
      principalTitle: 'تنمية العقل وتزكية القلب',
      teachersEyebrow: 'هيئة التدريس',
      teachersTitle: 'معرض المعلمين',
      whyChooseUsTitle: 'لماذا تختار أكاديمية الصديق الإسلامية',
      noticesTitle: 'أحدث الإعلانات',
      eventsTitle: 'الفعاليات القادمة',
      admissionTitle: 'طلب الالتحاق الإلكتروني',
      contactTitle: 'تواصل معنا',
    },
  },
};
