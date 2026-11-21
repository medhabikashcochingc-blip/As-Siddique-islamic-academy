import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, CheckCircle2, Mail, MapPin, Phone, Play } from 'lucide-react';
import { GeometricDivider } from '../components/AcademyEmblem';
import { TeacherPhoto } from '../components/TeacherPhoto';
import { usePlatform } from '../context/PlatformContext';
import { PRINCIPAL_PORTRAIT_IMAGE } from '../lib/defaultData';

const PageBanner: React.FC<{ eyebrow: string; title: string; subtitle?: string }> = ({
  eyebrow,
  title,
  subtitle,
}) => (
  <div className="bg-[#06452C] text-[#F8F1DF] islamic-lattice-dark border-b border-[#D9AD43]/35 py-14 sm:py-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#D9AD43] mb-2">
        {eyebrow}
      </p>
      <h1 className="font-serif text-3xl sm:text-5xl font-semibold text-white mb-3">{title}</h1>
      {subtitle && <p className="text-sm sm:text-base text-[#E6DFCE] max-w-3xl">{subtitle}</p>}
    </div>
  </div>
);

export const AboutPage: React.FC = () => {
  const { settings } = usePlatform();
  return (
    <div>
      <PageBanner
        eyebrow={`${settings.name} · ${settings.location}`}
        title="About As-Siddique Islamic Academy"
        subtitle={`${settings.tagline} — Integrated Class 1 to Class 12 General & Islamic Education.`}
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
        <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-8">
          <h2 className="font-serif text-3xl font-semibold text-[#06452C] dark:text-[#F8F1DF] mb-4">
            Our Educational Philosophy
          </h2>
          <p className="text-base text-[#314A3F] dark:text-[#E6DFCE] leading-relaxed mb-4">
            {settings.aboutContent}
          </p>
          <p className="text-sm text-[#5A6D64] dark:text-[#DED7C5]">
            Board Alignment: <strong>{settings.boardName}</strong> · Languages:{' '}
            <strong>Bengali, English, Arabic</strong> · Modes:{' '}
            <strong>Offline School, Online Classes, Hybrid Learning</strong>.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/30 rounded-xl p-7">
            <h3 className="font-serif text-2xl font-semibold text-[#06452C] dark:text-[#D9AD43] mb-2">
              Vision
            </h3>
            <p className="text-sm text-[#314A3F] dark:text-[#E6DFCE] leading-relaxed">
              {settings.visionText}
            </p>
          </div>
          <div className="bg-[#06452C] text-[#F8F1DF] border border-[#D9AD43]/35 rounded-xl p-7">
            <h3 className="font-serif text-2xl font-semibold text-[#D9AD43] mb-2">Mission</h3>
            <p className="text-sm text-[#E6DFCE] leading-relaxed">{settings.missionText}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const VisionMissionPage: React.FC = () => {
  const { settings } = usePlatform();
  return (
    <div>
      <PageBanner
        eyebrow="Institutional Direction"
        title="Vision & Mission"
        subtitle={`${settings.name} · ${settings.tagline}`}
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#8A6518] dark:text-[#D9AD43] mb-2">
            01. Our Vision
          </p>
          <h2 className="font-serif text-3xl font-semibold text-[#06452C] dark:text-white mb-4">
            Faithful Scholarship
          </h2>
          <p className="text-base text-[#314A3F] dark:text-[#E6DFCE] leading-relaxed">
            {settings.visionText}
          </p>
        </div>
        <div className="bg-[#06452C] text-[#F8F1DF] border border-[#D9AD43]/40 rounded-xl p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#D9AD43] mb-2">
            02. Our Mission
          </p>
          <h2 className="font-serif text-3xl font-semibold text-white mb-4">
            Learn · Practice · Preach
          </h2>
          <p className="text-base text-[#E6DFCE] leading-relaxed">{settings.missionText}</p>
        </div>
      </div>
    </div>
  );
};

export const PrincipalMessagePage: React.FC = () => {
  const { settings } = usePlatform();
  return (
    <div>
      <PageBanner eyebrow="Leadership" title="Principal’s Message" subtitle={settings.principalTitle} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <div className="md:col-span-5 rounded-xl overflow-hidden border border-[#D9AD43]/35 bg-white">
          <img
            src={PRINCIPAL_PORTRAIT_IMAGE}
            alt={settings.principalName}
            referrerPolicy="no-referrer"
            className="w-full h-auto object-cover"
          />
          <p className="p-4 text-xs font-serif italic text-[#5A6D64]">{settings.principalName}</p>
        </div>
        <div className="md:col-span-7 bg-white dark:bg-[#102D23] border border-[#D9AD43]/30 rounded-xl p-8">
          <h2 className="font-serif text-3xl font-semibold text-[#06452C] dark:text-white mb-4">
            Message to Parents &amp; Scholars
          </h2>
          <p className="text-base text-[#314A3F] dark:text-[#E6DFCE] leading-relaxed whitespace-pre-line">
            {settings.principalMessage}
          </p>
          <div className="mt-8 pt-5 border-t border-[#EFE6D2] dark:border-[#D9AD43]/25">
            <p className="font-serif text-xl font-semibold text-[#06452C] dark:text-[#D9AD43]">
              {settings.principalName}
            </p>
            <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5]">{settings.principalTitle}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ManagementCommitteePage: React.FC = () => {
  const { settings } = usePlatform();
  return (
    <div>
      <PageBanner
        eyebrow="Governance"
        title="Management Committee"
        subtitle="Configurable governance and academic oversight structure."
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-8">
          <h2 className="font-serif text-2xl font-semibold text-[#06452C] dark:text-white mb-3">
            Institutional Governance &amp; Board
          </h2>
          <p className="text-sm text-[#314A3F] dark:text-[#E6DFCE] leading-relaxed mb-6">
            As-Siddique Islamic Academy operates under a transparent trust and academic advisory
            committee. Verified member names and official registration codes are managed directly
            in Admin Settings and never fabricated in code.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { role: 'President / Chairman', note: 'Configure verified name in Admin CMS' },
              { role: 'Secretary & Trustee', note: 'Configure verified name in Admin CMS' },
              { role: 'Principal & Academic Head', note: settings.principalName },
            ].map((item) => (
              <div
                key={item.role}
                className="p-5 rounded-lg bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-[#8A6518] dark:text-[#D9AD43]">
                  {item.role}
                </p>
                <p className="font-serif text-xl font-semibold text-[#06452C] dark:text-white mt-1">
                  {item.note}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProgrammesPage: React.FC = () => {
  const { classes, subjects } = usePlatform();
  const [selectedWing, setSelectedWing] = useState<string>('All');
  const wings = ['All', 'Primary', 'Upper Primary', 'Secondary', 'Higher Secondary'];
  const visibleClasses =
    selectedWing === 'All' ? classes : classes.filter((c) => c.wing === selectedWing);

  return (
    <div>
      <PageBanner
        eyebrow="Class 1 to Class 12"
        title="Academic Programmes"
        subtitle="Configurable West Bengal State Board and Islamic Education structure across every grade."
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex flex-wrap gap-2 mb-8">
          {wings.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setSelectedWing(w)}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg border cursor-pointer ${
                selectedWing === w
                  ? 'bg-[#06452C] text-white border-[#06452C]'
                  : 'bg-white dark:bg-[#102D23] text-[#102D23] dark:text-[#F8F1DF] border-[#D9AD43]/35'
              }`}
            >
              {w}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleClasses.map((cls) => {
            const classSubjects = subjects.filter((s) => s.classId === cls.name);
            return (
              <div
                key={cls.id}
                className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/30 rounded-xl p-6"
              >
                <p className="text-xs font-semibold text-[#8A6518] dark:text-[#D9AD43] mb-1">
                  {cls.wing} · {cls.boardTrack}
                </p>
                <h3 className="font-serif text-2xl font-semibold text-[#06452C] dark:text-white mb-3">
                  {cls.name}
                </h3>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#5A6D64] mb-2">
                  Configured Subjects ({classSubjects.length})
                </p>
                {classSubjects.length > 0 ? (
                  <ul className="space-y-1 text-sm text-[#314A3F] dark:text-[#E6DFCE]">
                    {classSubjects.map((s) => (
                      <li key={s.id}>
                        • {s.name} ({s.track === 'islamic' ? 'Islamic' : 'General'})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5]">
                    Subjects configurable by administrators in Admin Panel → Subjects.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const GeneralEducationPage: React.FC = () => {
  const { settings, subjects } = usePlatform();
  const generalSubjects = subjects.filter((s) => s.track === 'general');
  return (
    <div>
      <PageBanner
        eyebrow={`System A · ${settings.boardName}`}
        title="General School Education"
        subtitle="Bengali, English, Mathematics, Science, History, Geography, and configurable board subjects for Class 1–12."
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
        <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-8">
          <h2 className="font-serif text-3xl font-semibold text-[#06452C] dark:text-white mb-3">
            Configurable West Bengal Board &amp; WBCHSE Structure
          </h2>
          <p className="text-sm sm:text-base text-[#314A3F] dark:text-[#E6DFCE] leading-relaxed">
            General Education subjects, optional streams for Class 11–12, full marks, and pass
            thresholds are configured dynamically per class and academic session by the Academy’s
            Academic Leadership without hardcoding unverified board regulations.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {generalSubjects.map((s) => (
            <div
              key={s.id}
              className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/30 rounded-xl p-5"
            >
              <p className="text-xs text-[#8A6518] dark:text-[#D9AD43] font-semibold">
                {s.classId} · {s.code}
              </p>
              <h3 className="font-serif text-xl font-semibold text-[#06452C] dark:text-white mt-1">
                {s.name}
              </h3>
              <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5] mt-2 tabular-nums">
                Full Marks: {s.fullMarks} · Pass Marks: {s.passMarks}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const IslamicEducationPage: React.FC = () => {
  const pillars = [
    'Quran & Nazirah',
    'Tajweed & Makharij',
    'Hifz-ul-Quran Track',
    'Hadith Studies',
    'Aqeedah (Creed)',
    'Fiqh (Jurisprudence)',
    'Seerah of Prophet (SAW)',
    'Arabic Language (RTL)',
    'Islamic Manners (Adab)',
    'Daily Dua Memorization',
  ];
  return (
    <div>
      <PageBanner
        eyebrow="System B · Sacred Knowledge & Tarbiyah"
        title="Islamic Education Wing"
        subtitle="Structured daily Islamic learning tracked alongside General Academics with combined progress report cards."
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {pillars.map((item, idx) => (
            <div
              key={item}
              className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-6"
            >
              <p className="text-xs font-semibold text-[#8A6518] dark:text-[#D9AD43] tabular-nums mb-1">
                {String(idx + 1).padStart(2, '0')}.
              </p>
              <h3 className="font-serif text-2xl font-semibold text-[#06452C] dark:text-white">
                {item}
              </h3>
            </div>
          ))}
        </div>
        <div
          dir="rtl"
          className="bg-[#06452C] text-[#F8F1DF] border border-[#D9AD43]/40 rounded-xl p-7 text-right"
        >
          <p className="text-sm text-[#D9AD43] mb-1">طلب العلم فريضة</p>
          <p className="font-serif text-2xl text-white">
            رَبِّ زِدْنِي عِلْمًا — اللَّهُمَّ انْفَعْنِي بِمَا عَلَّمْتَنِي
          </p>
        </div>
      </div>
    </div>
  );
};

export const CoursesPage: React.FC = () => {
  const { courses, lessons } = usePlatform();
  const [track, setTrack] = useState<'all' | 'general' | 'islamic'>('all');
  const filtered = track === 'all' ? courses : courses.filter((c) => c.track === track);

  return (
    <div>
      <PageBanner
        eyebrow="Online LMS & Structured Courses"
        title="Academy Courses"
        subtitle="Explore General School and Islamic Education sequential video courses with MCQ mastery assessments."
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex gap-2 mb-8">
          {(['all', 'general', 'islamic'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTrack(t)}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg border cursor-pointer ${
                track === t
                  ? 'bg-[#06452C] text-white border-[#06452C]'
                  : 'bg-white dark:bg-[#102D23] border-[#D9AD43]/35'
              }`}
            >
              {t === 'all' ? 'All Courses' : t === 'general' ? 'General Education' : 'Islamic Education'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course) => {
            const lessonCount = lessons.filter((l) => l.courseId === course.id).length;
            return (
              <div
                key={course.id}
                className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-6 flex flex-col justify-between"
              >
                <div>
                  <p className="text-xs font-semibold text-[#8A6518] dark:text-[#D9AD43] mb-1">
                    {course.classId} · {course.track === 'islamic' ? 'Islamic Wing' : 'General Wing'} ·{' '}
                    {lessonCount} {lessonCount === 1 ? 'Video Lesson' : 'Video Lessons'}
                  </p>
                  <h3 className="font-serif text-2xl font-semibold text-[#06452C] dark:text-white mb-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-[#314A3F] dark:text-[#E6DFCE] mb-4">
                    {course.description}
                  </p>
                </div>
                <div className="pt-4 border-t border-[#EFE6D2] dark:border-[#D9AD43]/20 flex items-center justify-between text-xs">
                  <span className="text-[#5A6D64] dark:text-[#DED7C5]">{course.instructorName}</span>
                  <Link
                    to="/portal"
                    className="font-semibold text-[#06452C] dark:text-[#D9AD43] hover:underline"
                  >
                    Open in Video LMS →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const TeachersPage: React.FC = () => {
  const { teachers } = usePlatform();
  const publicTeachers = teachers
    .filter((teacher) => teacher.isPublic !== false && teacher.status !== 'inactive')
    .sort((a, b) => Number(Boolean(a.isDemo)) - Number(Boolean(b.isDemo)));

  return (
    <div>
      <PageBanner
        eyebrow="Faculty Directory"
        title="Teachers &amp; Islamic Scholars"
        subtitle="Manage verified faculty profiles directly from the Admin Panel."
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-3 gap-6">
        {publicTeachers.map((teacher) => (
          <div
            key={teacher.id}
            className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="aspect-square bg-[#EFE6D2] dark:bg-[#06452C] overflow-hidden">
                <TeacherPhoto
                  photoUrl={teacher.photoUrl}
                  name={teacher.name}
                  className="w-full h-full object-cover object-top"
                  emblemClassName="w-16 h-16"
                  fallbackBgClassName="w-full h-full flex items-center justify-center"
                />
              </div>
              <div className="p-6">
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
                <p className="text-sm text-[#8A6518] dark:text-[#D9AD43] font-medium">
                  {teacher.designation}
                </p>
                <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5] mt-2">
                  {teacher.qualification}
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#EFE6D2] dark:border-[#D9AD43]/20 flex items-center justify-between text-xs">
              <span className="text-[#5A6D64] dark:text-[#C9C2B2] truncate max-w-[55%]">
                {teacher.assignedClasses.slice(0, 3).join(', ')}
              </span>
              <Link
                to={`/teachers/${teacher.id}`}
                className="text-sm font-semibold text-[#06452C] dark:text-[#D9AD43] hover:underline"
              >
                Full Teacher Profile →
              </Link>
            </div>
          </div>
        ))}
        {publicTeachers.length === 0 && (
          <div className="md:col-span-3 bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-10 text-center text-sm text-[#5A6D64] dark:text-[#DED7C5]">
            No public faculty profiles are published yet. Administrators can publish faculty
            profiles in Admin Panel → Teachers.
          </div>
        )}
      </div>
    </div>
  );
};

export const TeacherProfilePage: React.FC = () => {
  const { id } = useParams();
  const { teachers } = usePlatform();
  const teacher = id ? teachers.find((t) => t.id === id) : teachers[0];

  if (!teacher) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="font-serif text-3xl font-semibold text-[#06452C] dark:text-white">
          Teacher Profile Not Found
        </h1>
        <p className="text-sm text-[#5A6D64] dark:text-[#DED7C5]">
          The requested faculty profile may have been updated or removed.
        </p>
        <Link
          to="/teachers"
          className="inline-block text-sm font-semibold text-[#06452C] dark:text-[#D9AD43] hover:underline"
        >
          ← Back to Teachers Directory
        </Link>
      </div>
    );
  }

  return (
    <div>
      <PageBanner eyebrow="Teacher Profile" title={teacher.name} subtitle={teacher.designation} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-4">
          <div className="aspect-square rounded-xl overflow-hidden border border-[#D9AD43]/35 bg-[#EFE6D2] dark:bg-[#06452C]">
            <TeacherPhoto
              photoUrl={teacher.photoUrl}
              name={teacher.name}
              className="w-full h-full object-cover object-top"
              emblemClassName="w-16 h-16"
            />
          </div>
        </div>
        <div className="md:col-span-8 bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-8 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#8A6518] dark:text-[#D9AD43]">
            {teacher.department === 'islamic'
              ? 'Islamic Education'
              : teacher.department === 'general'
              ? 'General Education'
              : 'Dual Stream (General & Islamic)'}
            {teacher.isDemo ? ' · Demo Profile' : ''}
          </p>
          <p className="text-sm text-[#314A3F] dark:text-[#E6DFCE] leading-relaxed">{teacher.bio}</p>
          <div className="pt-4 border-t border-[#EFE6D2] dark:border-[#D9AD43]/25 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase text-[#8A6518] dark:text-[#D9AD43]">
                Qualification
              </p>
              <p>{teacher.qualification}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-[#8A6518] dark:text-[#D9AD43]">
                Assigned Classes
              </p>
              <p>{teacher.assignedClasses.join(', ') || 'Configurable'}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs font-semibold uppercase text-[#8A6518] dark:text-[#D9AD43]">
                Subjects Taught
              </p>
              <p>{teacher.assignedSubjects.join(', ') || 'Configurable'}</p>
            </div>
          </div>
          <Link
            to="/teachers"
            className="inline-block text-sm font-semibold text-[#06452C] dark:text-[#D9AD43] hover:underline"
          >
            ← Back to Teachers Directory
          </Link>
        </div>
      </div>
    </div>
  );
};

export const NoticesPage: React.FC = () => {
  const { notices } = usePlatform();
  const [cat, setCat] = useState('All');
  const filtered = cat === 'All' ? notices : notices.filter((n) => n.category === cat);
  return (
    <div>
      <PageBanner eyebrow="Official Circulars" title="Notice Board" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex flex-wrap gap-2 mb-6">
          {['All', 'Admissions', 'Examinations', 'Events & Holidays', 'Academic'].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg border cursor-pointer ${
                cat === c
                  ? 'bg-[#06452C] text-white border-[#06452C]'
                  : 'bg-white dark:bg-[#102D23] border-[#D9AD43]/35'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="space-y-4">
          {filtered.map((n) => (
            <article
              key={n.id}
              className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-6"
            >
              <p className="text-xs font-semibold text-[#8A6518] dark:text-[#D9AD43] tabular-nums mb-1">
                {n.date} · {n.refCode} · {n.category}
              </p>
              <h2 className="font-serif text-2xl font-semibold text-[#06452C] dark:text-white mb-2">
                {n.title}
              </h2>
              <p className="text-sm text-[#314A3F] dark:text-[#E6DFCE] leading-relaxed">
                {n.body || n.summary}
              </p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export const EventsPage: React.FC = () => {
  const { events } = usePlatform();
  return (
    <div>
      <PageBanner eyebrow="Academic Calendar" title="Events &amp; Assemblies" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-5">
        {events.map((ev) => (
          <div
            key={ev.id}
            className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-6"
          >
            <p className="text-xs font-semibold text-[#8A6518] dark:text-[#D9AD43] flex items-center gap-2 tabular-nums mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{ev.date}</span>
              <span>·</span>
              <span>{ev.venue}</span>
            </p>
            <h2 className="font-serif text-2xl font-semibold text-[#06452C] dark:text-white mb-2">
              {ev.title}
            </h2>
            <p className="text-sm text-[#314A3F] dark:text-[#E6DFCE]">{ev.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const GalleryPage: React.FC<{ mode: 'photo' | 'video' }> = ({ mode }) => {
  const { gallery } = usePlatform();
  const items = gallery.filter((g) => g.mediaType === mode);
  return (
    <div>
      <PageBanner
        eyebrow="Academy Media Archive"
        title={mode === 'photo' ? 'Photo Gallery' : 'Video Gallery'}
        subtitle="Manage public media items in Admin Panel → Gallery."
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex gap-3 mb-8">
          <Link
            to="/gallery/photos"
            className={`px-4 py-2 text-xs font-semibold rounded-lg border ${
              mode === 'photo' ? 'bg-[#06452C] text-white' : 'bg-white dark:bg-[#102D23]'
            }`}
          >
            Photo Gallery
          </Link>
          <Link
            to="/gallery/videos"
            className={`px-4 py-2 text-xs font-semibold rounded-lg border ${
              mode === 'video' ? 'bg-[#06452C] text-white' : 'bg-white dark:bg-[#102D23]'
            }`}
          >
            Video Gallery
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-10 text-center">
            <Play className="w-10 h-10 text-[#D9AD43] mx-auto mb-3" />
            <h3 className="font-serif text-2xl font-semibold text-[#06452C] dark:text-white mb-1">
              No {mode === 'photo' ? 'Photos' : 'Videos'} Published Yet
            </h3>
            <p className="text-sm text-[#5A6D64] dark:text-[#DED7C5]">
              Authorized administrators can publish {mode} gallery links and captions from Admin
              Panel → Gallery.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl overflow-hidden"
              >
                {item.mediaType === 'photo' ? (
                  <img
                    src={item.url}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-56 object-cover"
                  />
                ) : (
                  <div className="p-6 bg-[#06452C] text-white">
                    <a href={item.url} target="_blank" rel="noreferrer" className="underline">
                      Watch Video Resource
                    </a>
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-serif text-xl font-semibold text-[#06452C] dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5] mt-1">{item.caption}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const ContactPage: React.FC = () => {
  const { settings } = usePlatform();
  const [sent, setSent] = useState(false);
  return (
    <div>
      <PageBanner eyebrow="Reach Us" title="Contact Us" subtitle={`${settings.name} · ${settings.location}`} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-7 space-y-4">
          <h2 className="font-serif text-2xl font-semibold text-[#06452C] dark:text-white">
            Institution Office
          </h2>
          <p className="text-sm flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-[#8A6518] dark:text-[#D9AD43] mt-1 shrink-0" />
            <span>{settings.address}</span>
          </p>
          <p className="text-sm flex items-center gap-2.5">
            <Phone className="w-4 h-4 text-[#8A6518] dark:text-[#D9AD43] shrink-0" />
            <span>{settings.phone}</span>
          </p>
          <p className="text-sm flex items-center gap-2.5">
            <Mail className="w-4 h-4 text-[#8A6518] dark:text-[#D9AD43] shrink-0" />
            <span>{settings.email}</span>
          </p>
          <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5] pt-2">{settings.registrationNote}</p>
        </div>

        <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-7">
          {sent ? (
            <div className="text-center py-6">
              <CheckCircle2 className="w-10 h-10 text-[#06452C] dark:text-[#D9AD43] mx-auto mb-2" />
              <h3 className="font-serif text-2xl font-semibold">Inquiry Recorded</h3>
              <p className="text-sm text-[#5A6D64] mt-1">
                Our office will respond during institutional hours.
              </p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="space-y-3"
            >
              <h2 className="font-serif text-2xl font-semibold text-[#06452C] dark:text-white mb-2">
                Send a Message
              </h2>
              <input
                type="text"
                required
                placeholder="Full Name"
                className="w-full px-3.5 py-2.5 text-sm bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
              />
              <input
                type="email"
                required
                placeholder="Email Address"
                className="w-full px-3.5 py-2.5 text-sm bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
              />
              <textarea
                rows={4}
                required
                placeholder="Your Message"
                className="w-full px-3.5 py-2.5 text-sm bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
              />
              <button
                type="submit"
                className="px-5 py-2.5 text-sm font-semibold bg-[#06452C] text-[#F8F1DF] rounded-lg cursor-pointer"
              >
                Submit Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export const FaqPage: React.FC = () => {
  const faqs = [
    {
      q: 'Which classes and education board does As-Siddique Islamic Academy follow?',
      a: 'We serve Class 1 to Class 12 in West Bengal, India, integrating West Bengal State Board General School Education with structured Islamic Education.',
    },
    {
      q: 'What learning modes are offered?',
      a: 'Students may enroll in Offline School (on-campus), Online Classes, or Hybrid Learning tracks.',
    },
    {
      q: 'How are examination results verified?',
      a: 'Approved results are verified server-side and published securely on our Online Result Portal with downloadable Navy-Blue & Gold PDF marksheets.',
    },
    {
      q: 'How do parents and students access their dashboards?',
      a: 'Sign in with your verified Google account on the Portal Login page. Administrators link verified student and parent accounts to protect child privacy.',
    },
  ];
  return (
    <div>
      <PageBanner eyebrow="Help & Guidance" title="Frequently Asked Questions" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-4">
        <GeometricDivider />
        {faqs.map((item) => (
          <div
            key={item.q}
            className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-6"
          >
            <h3 className="font-serif text-xl font-semibold text-[#06452C] dark:text-[#D9AD43] mb-2">
              {item.q}
            </h3>
            <p className="text-sm text-[#314A3F] dark:text-[#E6DFCE] leading-relaxed">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const LegalPage: React.FC<{ type: 'privacy' | 'terms' }> = ({ type }) => {
  const { settings } = usePlatform();
  return (
    <div>
      <PageBanner
        eyebrow="Governance & Child Privacy"
        title={type === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions'}
        subtitle={settings.name}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-8 space-y-4 text-sm text-[#314A3F] dark:text-[#E6DFCE] leading-relaxed">
          {type === 'privacy' ? (
            <>
              <p>
                <strong>Child &amp; Student Data Protection:</strong> As-Siddique Islamic Academy
                enforces strict role-based access control and Firestore Security Rules. Private
                student records, guardian phone numbers, addresses, and fee invoices are never
                exposed on public pages.
              </p>
              <p>
                <strong>Parental Consent &amp; Photographs:</strong> Student photographs and media
                are displayed only when authorized and verified by administration with guardian
                consent.
              </p>
              <p>
                <strong>Result Portal Privacy:</strong> Public examination searches display only
                approved, published marksheets without exposing home addresses, phone numbers, or
                dates of birth.
              </p>
            </>
          ) : (
            <>
              <p>
                <strong>Platform Usage:</strong> Access to Student, Parent, Teacher, Accountant,
                Librarian, Principal, and Admin portals is strictly limited to authorized accounts
                verified via Firebase Authentication.
              </p>
              <p>
                <strong>Academic Records &amp; Admissions:</strong> Submission of an online
                admission application does not guarantee enrollment until document verification and
                authorized administrative approval are completed.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
