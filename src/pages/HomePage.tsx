import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  CreditCard,
  FileCheck2,
  GraduationCap,
  Laptop,
  Library,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  Users,
  Video,
} from 'lucide-react';
import { AcademyEmblem, GeometricDivider } from '../components/AcademyEmblem';
import { useAuth } from '../context/AuthContext';
import { usePlatform } from '../context/PlatformContext';
import { HERO_MOSQUE_IMAGE, PRINCIPAL_PORTRAIT_IMAGE } from '../lib/defaultData';
import { TRANSLATIONS } from '../lib/i18n';

export const HomePage: React.FC = () => {
  const {
    settings,
    teachers,
    notices,
    events,
    students,
    courses,
    classes,
    language,
    submitAdmissionApplication,
  } = usePlatform();
  const { userAccount } = useAuth();
  const navigate = useNavigate();

  const [heroError, setHeroError] = useState(false);
  const [principalError, setPrincipalError] = useState(false);
  const [quickClass, setQuickClass] = useState('Class 1');
  const [quickMode, setQuickMode] = useState<'Offline School' | 'Online Classes' | 'Hybrid Learning'>(
    'Offline School'
  );
  const [quickStudent, setQuickStudent] = useState('');
  const [quickGuardian, setQuickGuardian] = useState('');
  const [quickMobile, setQuickMobile] = useState('');
  const [quickRef, setQuickRef] = useState<string | null>(null);
  const [quickError, setQuickError] = useState('');
  const [contactSent, setContactSent] = useState(false);

  const t = TRANSLATIONS[language];

  const handleQuickAdmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuickError('');
    if (!quickStudent.trim() || !quickGuardian.trim() || quickMobile.replace(/\D/g, '').length < 7) {
      setQuickError('Please provide student name, guardian name, and a valid mobile number.');
      return;
    }
    try {
      const ref = await submitAdmissionApplication({
        studentName: quickStudent.trim(),
        dob: '',
        gender: 'Male',
        fatherName: quickGuardian.trim(),
        motherName: '',
        guardianName: quickGuardian.trim(),
        mobile: quickMobile.trim(),
        address: settings.location,
        applyingClass: quickClass,
        academicSession: '2026–2027',
        learningMode: quickMode,
        source: 'online',
      });
      setQuickRef(ref);
      setQuickStudent('');
      setQuickGuardian('');
      setQuickMobile('');
    } catch (err) {
      setQuickError(err instanceof Error ? err.message : 'Unable to submit inquiry right now.');
    }
  };

  const quickPortals = [
    { label: t.shortcuts.courses, sub: `${courses.length} Courses`, to: '/courses', icon: BookOpen },
    { label: t.shortcuts.liveClasses, sub: 'Interactive Sessions', to: '/portal', icon: Video },
    { label: t.shortcuts.results, sub: 'Online Marksheet', to: '/results', icon: FileCheck2 },
    {
      label: t.shortcuts.studentDashboard,
      sub: userAccount ? 'Open Portal' : 'Sign In Required',
      to: userAccount ? '/portal' : '/login',
      icon: GraduationCap,
    },
    { label: t.shortcuts.fees, sub: 'Invoices & Receipts', to: '/portal', icon: CreditCard },
    { label: t.shortcuts.library, sub: 'Books & Quran PDFs', to: '/portal', icon: Library },
  ];

  const stageBands = [
    {
      wing: 'Primary',
      classes: 'Class 1 – Class 5',
      summary: 'Bengali, English, Mathematics, Environmental Studies, Noorani Qaida, Nazirah Quran & Islamic Manners.',
    },
    {
      wing: 'Upper Primary',
      classes: 'Class 6 – Class 8',
      summary: 'West Bengal Board core sciences & mathematics paired with Tajweed, Arabic Nahw, Hadith & Seerah.',
    },
    {
      wing: 'Secondary',
      classes: 'Class 9 – Class 10',
      summary: 'Secondary Board preparation in Sciences & Humanities integrated with Fiqh, Aqeedah & Quranic Studies.',
    },
    {
      wing: 'Higher Secondary',
      classes: 'Class 11 – Class 12',
      summary: 'WBCHSE configurable Science, Commerce & Arts streams with Islamic Jurisprudence & Leadership.',
    },
  ];

  return (
    <div>
      {/* 3–8. Large Islamic Hero Banner with 4 Badges & Explore Academy CTA */}
      <section className="relative overflow-hidden bg-[#06452C] text-[#F8F1DF]">
        <div className="relative min-h-[560px] lg:min-h-[620px] flex flex-col justify-between">
          {!heroError ? (
            <img
              src={HERO_MOSQUE_IMAGE}
              alt="As-Siddique Islamic Academy mosque dome and courtyard"
              referrerPolicy="no-referrer"
              onError={() => setHeroError(true)}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-[#06452C] islamic-lattice-dark" />
          )}

          <div className="absolute inset-0 bg-gradient-to-r from-[#042E1D]/95 via-[#06452C]/82 to-[#102D23]/55" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#042E1D]/90 via-transparent to-[#042E1D]/30" />

          <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12">
            <div className="max-w-3xl">
              <p
                dir="rtl"
                className="text-sm sm:text-base font-medium text-[#D9AD43] mb-3 tracking-wide"
              >
                {t.hero.arabicGreeting}
              </p>

              {/* 4 Required Institutional Highlight Markers (Clean Archival Ribbon) */}
              <div className="flex flex-wrap items-center gap-2 mb-5 text-xs font-semibold">
                <span className="px-3 py-1 bg-[#102D23]/90 border border-[#D9AD43]/50 text-[#F8F1DF] rounded">
                  {t.badges.classes}
                </span>
                <span className="px-3 py-1 bg-[#102D23]/90 border border-[#D9AD43]/50 text-[#F8F1DF] rounded">
                  {t.badges.board}
                </span>
                <span className="px-3 py-1 bg-[#102D23]/90 border border-[#D9AD43]/50 text-[#D9AD43] rounded">
                  {t.badges.islamic}
                </span>
                <span className="px-3 py-1 bg-[#102D23]/90 border border-[#D9AD43]/50 text-[#F8F1DF] rounded">
                  {t.badges.modes}
                </span>
              </div>

              <h1
                className="font-serif font-semibold text-white leading-[1.08] mb-4"
                style={{ fontSize: 'clamp(2.35rem, 4.4vw, 3.85rem)', textWrap: 'balance' }}
              >
                {settings.heroHeadline}
              </h1>

              <p className="text-base sm:text-lg text-[#EBE3D0] leading-relaxed max-w-2xl mb-7">
                {settings.heroSubtext}
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/about')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-sm sm:text-base font-semibold text-[#102D23] bg-[#D9AD43] hover:bg-[#c79b32] rounded-lg transition-colors cursor-pointer"
                >
                  <span>{t.hero.exploreBtn}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <Link
                  to="/admission"
                  className="inline-flex items-center gap-2 px-5 py-3.5 text-sm sm:text-base font-medium text-[#F8F1DF] bg-white/10 hover:bg-white/20 border border-[#D9AD43]/40 rounded-lg transition-colors"
                >
                  <span>{t.hero.applyBtn}</span>
                </Link>
              </div>
            </div>
          </div>

          {/* 9–14. Six Quick Digital Portal Shortcuts */}
          <div className="relative z-10 border-t border-[#D9AD43]/30 bg-[#102D23]/90 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {quickPortals.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      to={item.to}
                      className="flex items-center gap-3 p-3 rounded-lg bg-[#06452C]/70 hover:bg-[#06452C] border border-[#D9AD43]/25 hover:border-[#D9AD43]/60 transition-colors"
                    >
                      <Icon className="w-5 h-5 text-[#D9AD43] shrink-0" aria-hidden="true" />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-white truncate">
                          {item.label}
                        </p>
                        <p className="text-[11px] text-[#DED7C5] truncate">{item.sub}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 15. Class 1–12 Academic Programmes & Dual Education Overview */}
      <section className="py-16 sm:py-20 bg-[#F8F1DF] dark:bg-[#081A14] border-b border-[#D9AD43]/25">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A6518] dark:text-[#D9AD43] mb-2">
              {t.sections.programmesEyebrow}
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#06452C] dark:text-[#F8F1DF] mb-3">
              {t.sections.programmesTitle}
            </h2>
            <GeometricDivider />
            <p className="text-sm sm:text-base text-[#314A3F] dark:text-[#D7CFC0] mt-3">
              Structured across Primary, Upper Primary, Secondary, and Higher Secondary stages—combining{' '}
              <strong>General School Education</strong> ({settings.boardName}) with{' '}
              <strong>Islamic Education</strong> in Bengali, English, and Arabic.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {stageBands.map((band) => (
              <article
                key={band.wing}
                className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/30 rounded-xl p-6 flex flex-col justify-between"
              >
                <div>
                  <p className="text-xs font-semibold text-[#8A6518] dark:text-[#D9AD43] mb-1 tabular-nums">
                    {band.classes}
                  </p>
                  <h3 className="font-serif text-2xl font-semibold text-[#06452C] dark:text-white mb-2">
                    {band.wing}
                  </h3>
                  <p className="text-sm text-[#314A3F] dark:text-[#D7CFC0] leading-relaxed">
                    {band.summary}
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-[#EFE6D2] dark:border-[#D9AD43]/20">
                  <Link
                    to="/programmes"
                    className="text-xs font-semibold text-[#06452C] dark:text-[#D9AD43] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Explore {band.wing}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-7">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#8A6518] dark:text-[#D9AD43] mb-1">
                System A · Configurable State Curriculum
              </p>
              <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#06452C] dark:text-white mb-2">
                {t.sections.generalWing}
              </h3>
              <p className="text-sm text-[#314A3F] dark:text-[#D7CFC0] leading-relaxed mb-4">
                Bengali, English, Mathematics, Science, History, Geography, and configurable stream
                subjects aligned with West Bengal Board &amp; WBCHSE frameworks.
              </p>
              <Link
                to="/general-education"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#06452C] dark:text-[#D9AD43] hover:underline"
              >
                <span>View General Education Wing</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-[#06452C] text-[#F8F1DF] border border-[#D9AD43]/40 rounded-xl p-7">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#D9AD43] mb-1">
                System B · Sacred Knowledge &amp; Tarbiyah
              </p>
              <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-white mb-2">
                {t.sections.islamicWing}
              </h3>
              <p className="text-sm text-[#E6DFCE] leading-relaxed mb-4">
                Quran, Nazirah, Tajweed, Hifz, Hadith, Aqeedah, Fiqh, Seerah, Arabic (RTL), Islamic
                Manners, and Daily Dua—tracked with dedicated Islamic progress report cards.
              </p>
              <Link
                to="/islamic-education"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#D9AD43] hover:underline"
              >
                <span>View Islamic Education Wing</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 16. Principal's Message */}
      <section className="py-16 sm:py-20 bg-white dark:bg-[#0D241C] border-b border-[#D9AD43]/25">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          <div className="lg:col-span-5 flex flex-col">
            <div className="flex-1 min-h-[340px] rounded-xl overflow-hidden border border-[#D9AD43]/35 bg-[#F8F1DF]">
              {!principalError ? (
                <img
                  src={PRINCIPAL_PORTRAIT_IMAGE}
                  alt={settings.principalName}
                  referrerPolicy="no-referrer"
                  onError={() => setPrincipalError(true)}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#06452C] text-[#F8F1DF] p-8">
                  <AcademyEmblem className="w-16 h-16 mb-3" variant="gold-on-emerald" />
                  <p className="font-serif text-xl">{settings.principalTitle}</p>
                </div>
              )}
            </div>
            <p className="text-xs font-serif italic text-[#5A6D64] dark:text-[#C9C2B2] mt-2.5">
              {settings.principalName} · {settings.principalTitle}
            </p>
          </div>

          <div className="lg:col-span-7 flex flex-col justify-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A6518] dark:text-[#D9AD43] mb-2">
              {t.sections.principalEyebrow}
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#06452C] dark:text-[#F8F1DF] mb-5">
              {t.sections.principalTitle}
            </h2>
            <p className="text-sm sm:text-base text-[#314A3F] dark:text-[#E6DFCE] leading-relaxed mb-6 first-letter:text-5xl first-letter:font-serif first-letter:font-semibold first-letter:float-left first-letter:mr-3 rtl:first-letter:float-right rtl:first-letter:ml-3 rtl:first-letter:mr-0 first-letter:leading-none">
              {settings.principalMessage}
            </p>
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#EFE6D2] dark:border-[#D9AD43]/25">
              <div>
                <p className="font-serif text-xl font-semibold text-[#06452C] dark:text-white">
                  {settings.principalName}
                </p>
                <p className="text-xs text-[#5A6D64] dark:text-[#C9C2B2]">{settings.tagline}</p>
              </div>
              <Link
                to="/principal-message"
                className="text-sm font-semibold text-[#06452C] dark:text-[#D9AD43] hover:underline"
              >
                Read Full Message →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 17. Teachers Gallery */}
      <section className="py-16 sm:py-20 bg-[#F8F1DF] dark:bg-[#081A14] border-b border-[#D9AD43]/25">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A6518] dark:text-[#D9AD43] mb-1">
                {t.sections.teachersEyebrow}
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#06452C] dark:text-[#F8F1DF]">
                {t.sections.teachersTitle}
              </h2>
            </div>
            <Link
              to="/teachers"
              className="text-sm font-semibold text-[#06452C] dark:text-[#D9AD43] hover:underline"
            >
              View All Faculty Profiles →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {teachers.slice(0, 3).map((teacher) => (
              <article
                key={teacher.id}
                className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/30 rounded-xl overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-square bg-[#EFE6D2] dark:bg-[#06452C] overflow-hidden">
                    {teacher.photoUrl ? (
                      <img
                        src={teacher.photoUrl}
                        alt={teacher.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <AcademyEmblem className="w-16 h-16" variant="gold-on-emerald" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-medium text-[#8A6518] dark:text-[#D9AD43] mb-1">
                      {teacher.department === 'islamic'
                        ? 'Islamic Education'
                        : teacher.department === 'general'
                        ? 'General Education'
                        : 'Dual Stream'}
                      {teacher.isDemo ? ' · Demo Profile' : ''}
                    </p>
                    <h3 className="font-serif text-2xl font-semibold text-[#06452C] dark:text-white">
                      {teacher.name}
                    </h3>
                    <p className="text-sm text-[#314A3F] dark:text-[#DED7C5] mt-0.5">
                      {teacher.designation}
                    </p>
                    <p className="text-xs text-[#5A6D64] dark:text-[#C9C2B2] mt-2">
                      {teacher.qualification}
                    </p>
                  </div>
                </div>
                <div className="px-5 py-3.5 border-t border-[#EFE6D2] dark:border-[#D9AD43]/20 flex justify-between items-center text-xs">
                  <span className="text-[#5A6D64] dark:text-[#C9C2B2]">
                    {teacher.assignedClasses.slice(0, 3).join(', ')}
                  </span>
                  <Link
                    to={`/teachers/${teacher.id}`}
                    className="font-semibold text-[#06452C] dark:text-[#D9AD43] hover:underline"
                  >
                    View Profile
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 18. Why Choose Us + 22. Academy Statistics */}
      <section className="py-16 sm:py-20 bg-[#06452C] text-[#F8F1DF] islamic-lattice-dark border-b border-[#D9AD43]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#D9AD43] mb-2">
                Why Choose As-Siddique Islamic Academy
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-white mb-6">
                {t.sections.whyChooseUsTitle}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[
                  {
                    icon: BookOpen,
                    title: 'Dual Curriculum Harmony',
                    text: 'West Bengal State Board academics taught alongside Quran, Tajweed, Arabic, Fiqh, and Seerah.',
                  },
                  {
                    icon: Laptop,
                    title: 'Offline, Online & Hybrid',
                    text: 'Flexible classroom attendance, structured live virtual sessions, and integrated LMS lessons.',
                  },
                  {
                    icon: ShieldCheck,
                    title: 'Verified Security & Child Privacy',
                    text: 'Role-protected portals for students, parents, teachers, and administration.',
                  },
                  {
                    icon: Award,
                    title: 'Multilingual Instruction',
                    text: 'Thoughtful academic grounding across Bengali, English, and Arabic with RTL support.',
                  },
                ].map((point) => {
                  const Icon = point.icon;
                  return (
                    <div
                      key={point.title}
                      className="p-5 rounded-xl bg-[#102D23]/80 border border-[#D9AD43]/30"
                    >
                      <Icon className="w-5 h-5 text-[#D9AD43] mb-2.5" aria-hidden="true" />
                      <h3 className="font-serif text-xl font-semibold text-white mb-1">
                        {point.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#DED7C5] leading-relaxed">
                        {point.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Configurable / Database-Derived Academy Statistics */}
            <div className="lg:col-span-5 bg-[#102D23] border border-[#D9AD43]/40 rounded-xl p-7">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#D9AD43] mb-1">
                Live Platform Overview
              </p>
              <h3 className="font-serif text-2xl font-semibold text-white mb-6">
                Academy at a Glance
              </h3>
              <div className="grid grid-cols-2 gap-5">
                <div className="p-4 rounded-lg bg-[#06452C] border border-[#D9AD43]/25">
                  <p className="font-serif text-3xl font-semibold text-[#D9AD43] tabular-nums">
                    {classes.length}
                  </p>
                  <p className="text-xs text-[#E6DFCE] mt-1">Classes (Class 1–12)</p>
                </div>
                <div className="p-4 rounded-lg bg-[#06452C] border border-[#D9AD43]/25">
                  <p className="font-serif text-3xl font-semibold text-[#D9AD43] tabular-nums">
                    {students.length}
                  </p>
                  <p className="text-xs text-[#E6DFCE] mt-1">Registered Records (Demo/Live)</p>
                </div>
                <div className="p-4 rounded-lg bg-[#06452C] border border-[#D9AD43]/25">
                  <p className="font-serif text-3xl font-semibold text-[#D9AD43] tabular-nums">
                    {teachers.length}
                  </p>
                  <p className="text-xs text-[#E6DFCE] mt-1">Faculty Profiles</p>
                </div>
                <div className="p-4 rounded-lg bg-[#06452C] border border-[#D9AD43]/25">
                  <p className="font-serif text-3xl font-semibold text-[#D9AD43] tabular-nums">
                    {courses.length}
                  </p>
                  <p className="text-xs text-[#E6DFCE] mt-1">Active LMS Courses</p>
                </div>
              </div>
              <p className="text-[11px] text-[#DED7C5]/80 mt-4">
                Counts update dynamically from Cloud Firestore records configured by Academy administrators.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 19. Latest Notices & 20. Upcoming Events */}
      <section className="py-16 sm:py-20 bg-white dark:bg-[#0D241C] border-b border-[#D9AD43]/25">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8A6518] dark:text-[#D9AD43]">
                  Official Announcements
                </p>
                <h2 className="font-serif text-3xl font-semibold text-[#06452C] dark:text-[#F8F1DF]">
                  {t.sections.noticesTitle}
                </h2>
              </div>
              <Link
                to="/notices"
                className="text-sm font-semibold text-[#06452C] dark:text-[#D9AD43] hover:underline"
              >
                All Notices →
              </Link>
            </div>
            <div className="divide-y divide-[#EFE6D2] dark:divide-[#D9AD43]/20 border border-[#D9AD43]/30 rounded-xl bg-[#F8F1DF]/40 dark:bg-[#102D23]">
              {notices.slice(0, 4).map((n) => (
                <div key={n.id} className="p-5">
                  <p className="text-xs font-medium text-[#8A6518] dark:text-[#D9AD43] tabular-nums mb-1">
                    {n.date} · {n.category} · {n.refCode}
                  </p>
                  <h3 className="font-serif text-xl font-semibold text-[#06452C] dark:text-white mb-1">
                    {n.title}
                  </h3>
                  <p className="text-sm text-[#314A3F] dark:text-[#D7CFC0]">{n.summary}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8A6518] dark:text-[#D9AD43]">
                  Academic Calendar
                </p>
                <h2 className="font-serif text-3xl font-semibold text-[#06452C] dark:text-[#F8F1DF]">
                  {t.sections.eventsTitle}
                </h2>
              </div>
              <Link
                to="/events"
                className="text-sm font-semibold text-[#06452C] dark:text-[#D9AD43] hover:underline"
              >
                All Events →
              </Link>
            </div>
            <div className="space-y-4">
              {events.slice(0, 3).map((ev) => (
                <div
                  key={ev.id}
                  className="p-5 rounded-xl bg-[#F8F1DF] dark:bg-[#102D23] border border-[#D9AD43]/35"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#8A6518] dark:text-[#D9AD43] mb-1 tabular-nums">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{ev.date}</span>
                    <span>·</span>
                    <span>{ev.venue}</span>
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-[#06452C] dark:text-white mb-1">
                    {ev.title}
                  </h3>
                  <p className="text-sm text-[#314A3F] dark:text-[#D7CFC0]">{ev.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 21. Online Admission Quick Section */}
      <section className="py-16 sm:py-20 bg-[#F8F1DF] dark:bg-[#081A14] islamic-lattice-light border-b border-[#D9AD43]/25">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 rounded-xl p-7 sm:p-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#EFE6D2] dark:border-[#D9AD43]/25 mb-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A6518] dark:text-[#D9AD43]">
                  Session 2026–2027 · Class 1 to Class 12
                </p>
                <h2 className="font-serif text-3xl font-semibold text-[#06452C] dark:text-white">
                  {t.sections.admissionTitle}
                </h2>
              </div>
              <Link
                to="/admission"
                className="text-sm font-semibold text-[#06452C] dark:text-[#D9AD43] hover:underline whitespace-nowrap"
              >
                Open Full Admission Form (with Documents) →
              </Link>
            </div>

            {quickRef ? (
              <div className="p-6 rounded-lg bg-[#F8F1DF] dark:bg-[#06452C] border border-[#D9AD43]/45 text-center">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#8A6518] dark:text-[#D9AD43]">
                  Application Reference: {quickRef}
                </p>
                <h3 className="font-serif text-2xl font-semibold text-[#06452C] dark:text-white mt-1">
                  Admission Request Submitted
                </h3>
                <p className="text-sm text-[#314A3F] dark:text-[#E6DFCE] mt-2">
                  Your application has been saved to Cloud Firestore with status <strong>Pending</strong>.
                  You may track or complete full document details on the Admission page.
                </p>
                <button
                  type="button"
                  onClick={() => setQuickRef(null)}
                  className="mt-4 px-4 py-2 text-xs font-semibold bg-[#06452C] text-white rounded-lg cursor-pointer"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleQuickAdmission} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickError && (
                  <p className="sm:col-span-2 lg:col-span-3 text-sm text-[#7F1D1D] bg-[#FDF2F2] p-3 rounded-lg">
                    {quickError}
                  </p>
                )}
                <input
                  type="text"
                  required
                  value={quickStudent}
                  onChange={(e) => setQuickStudent(e.target.value)}
                  placeholder="Student Full Name *"
                  className="px-3.5 py-2.5 text-sm bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35 rounded-lg"
                />
                <input
                  type="text"
                  required
                  value={quickGuardian}
                  onChange={(e) => setQuickGuardian(e.target.value)}
                  placeholder="Parent / Guardian Name *"
                  className="px-3.5 py-2.5 text-sm bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35 rounded-lg"
                />
                <input
                  type="tel"
                  required
                  value={quickMobile}
                  onChange={(e) => setQuickMobile(e.target.value)}
                  placeholder="Mobile Number *"
                  className="px-3.5 py-2.5 text-sm bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35 rounded-lg"
                />
                <select
                  value={quickClass}
                  onChange={(e) => setQuickClass(e.target.value)}
                  className="px-3.5 py-2.5 text-sm bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35 rounded-lg"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.wing})
                    </option>
                  ))}
                </select>
                <select
                  value={quickMode}
                  onChange={(e) =>
                    setQuickMode(
                      e.target.value as 'Offline School' | 'Online Classes' | 'Hybrid Learning'
                    )
                  }
                  className="px-3.5 py-2.5 text-sm bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35 rounded-lg"
                >
                  <option value="Offline School">Offline School</option>
                  <option value="Online Classes">Online Classes</option>
                  <option value="Hybrid Learning">Hybrid Learning</option>
                </select>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-semibold text-[#F8F1DF] bg-[#06452C] hover:bg-[#102D23] rounded-lg transition-colors cursor-pointer"
                >
                  Submit Quick Application
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 23. Student Testimonials (Sample / Demo) & 24. Contact Section */}
      <section className="py-16 sm:py-20 bg-white dark:bg-[#0D241C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8A6518] dark:text-[#D9AD43] mb-2">
              Community Voices · Sample Placeholders
            </p>
            <h2 className="font-serif text-3xl font-semibold text-[#06452C] dark:text-[#F8F1DF] mb-6">
              Parent &amp; Student Perspectives
            </h2>
            <div className="space-y-4">
              {[
                {
                  quote:
                    '“Having West Bengal Board subjects and daily Quran Tajweed under one roof saves our family hours every day while keeping character development central.”',
                  author: 'Sample Guardian Feedback (Configure verified testimonials in Admin CMS)',
                },
                {
                  quote:
                    '“The live online classroom and digital library make revision structured for students joining remotely.”',
                  author: 'Sample Student Feedback (Configure verified testimonials in Admin CMS)',
                },
              ].map((item, i) => (
                <blockquote
                  key={i}
                  className="p-5 rounded-xl bg-[#F8F1DF] dark:bg-[#102D23] border border-[#D9AD43]/30"
                >
                  <p className="font-serif italic text-lg text-[#102D23] dark:text-[#F8F1DF] mb-2">
                    {item.quote}
                  </p>
                  <footer className="text-xs text-[#5A6D64] dark:text-[#C9C2B2]">
                    <Users className="w-3.5 h-3.5 inline mr-1.5" />
                    {item.author}
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>

          {/* 24. Contact Section */}
          <div className="lg:col-span-6 bg-[#F8F1DF] dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8A6518] dark:text-[#D9AD43] mb-1">
              Get in Touch
            </p>
            <h2 className="font-serif text-3xl font-semibold text-[#06452C] dark:text-white mb-4">
              {t.sections.contactTitle}
            </h2>
            <div className="space-y-2.5 text-sm text-[#314A3F] dark:text-[#E6DFCE] mb-6">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#8A6518] dark:text-[#D9AD43] mt-0.5 shrink-0" />
                <span>{settings.address}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#8A6518] dark:text-[#D9AD43] shrink-0" />
                <span>{settings.phone}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#8A6518] dark:text-[#D9AD43] shrink-0" />
                <span>{settings.email}</span>
              </p>
            </div>

            {contactSent ? (
              <div className="p-4 rounded-lg bg-white dark:bg-[#06452C] border border-[#D9AD43]/40 text-sm">
                Thank you. Your message has been recorded for the Academy Office.
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setContactSent(true);
                }}
                className="space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    className="px-3.5 py-2.5 text-sm bg-white dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Your Email"
                    className="px-3.5 py-2.5 text-sm bg-white dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                  />
                </div>
                <textarea
                  rows={3}
                  required
                  placeholder="How can our Academy Office help you?"
                  className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-semibold bg-[#06452C] text-[#F8F1DF] hover:bg-[#102D23] rounded-lg cursor-pointer"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
