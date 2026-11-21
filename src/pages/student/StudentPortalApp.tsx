import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  BookOpen,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  Home,
  LayoutGrid,
  LogIn,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  Radio,
  Sun,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import { AcademyEmblem } from '../../components/AcademyEmblem';
import { SequentialLmsPlayer } from '../../components/lms/SequentialLmsPlayer';
import { PWAInstallBanner, PWAInstallButton } from '../../components/pwa/PWAInstallButton';
import { useAuth } from '../../context/AuthContext';
import { usePlatform } from '../../context/PlatformContext';
import { downloadStudentIdCardPdf } from '../../lib/pdfGenerator';
import { LanguageCode, LmsCourse } from '../../types/platform';
import { StudentCoursesSection } from './StudentCoursesSection';
import { StudentDashboardProgram } from './StudentDashboardProgram';
import { StudentHomeSection } from './StudentHomeSection';
import { StudentResourcesSection } from './StudentResourcesSection';
import { StudentTeachersAndContact } from './StudentTeachersAndContact';
import {
  buildStudentLmsSummary,
  StudentResourceTab,
  StudentSectionKey,
} from './studentTypes';

interface StudentPortalAppProps {
  embeddedPreview?: boolean;
}

const DESKTOP_NAV: Array<{
  key: StudentSectionKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'program', label: 'Program', icon: GraduationCap },
  { key: 'courses', label: 'Courses', icon: BookOpen },
  { key: 'resources', label: 'Resources', icon: FileText },
  { key: 'teachers', label: 'Teachers', icon: Users },
  { key: 'contact', label: 'Contact', icon: MessageSquare },
];

const MOBILE_BOTTOM_TABS: Array<{
  key: StudentSectionKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'program', label: 'Program', icon: GraduationCap },
  { key: 'courses', label: 'Courses', icon: BookOpen },
  { key: 'teachers', label: 'Teachers', icon: Users },
  { key: 'contact', label: 'Contact', icon: MessageSquare },
];

export const StudentPortalApp: React.FC<StudentPortalAppProps> = ({
  embeddedPreview = false,
}) => {
  const navigate = useNavigate();
  const { firebaseUser, userAccount, effectiveRole, logout } = useAuth();
  const {
    settings,
    integrations,
    darkMode,
    toggleDarkMode,
    language,
    setLanguage,
    students,
    classes,
    subjects,
    courses,
    lessons,
    teachers,
    attendance,
    lmsProgress,
    liveClasses,
    library,
    results,
    homework,
    assignments,
    submissions,
    timetables,
    invoices,
    payments,
    notices,
    notifications,
    upsertRecord,
  } = usePlatform();

  const [activeSection, setActiveSection] = useState<StudentSectionKey>(
    embeddedPreview ? 'program' : 'home'
  );
  const [resourceTab, setResourceTab] = useState<StudentResourceTab>('live');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [activePlayer, setActivePlayer] = useState<{
    course: LmsCourse;
    lessonId?: string;
  } | null>(null);

  const isSignedIn = Boolean(firebaseUser && userAccount);

  const myStudent = useMemo(() => {
    if (!userAccount) return undefined;
    if (userAccount.linkedStudentId) {
      const linked = students.find(
        (s) =>
          s.id === userAccount.linkedStudentId ||
          s.studentId === userAccount.linkedStudentId
      );
      if (linked) return linked;
    }
    const byUid = students.find((s) => s.studentUid === userAccount.uid);
    if (byUid) return byUid;
    return embeddedPreview || userAccount.role === 'super_admin' ? students[0] : undefined;
  }, [students, userAccount, embeddedPreview]);

  const progressByCourse = useMemo(() => {
    const map = new Map<string, (typeof lmsProgress)[number]>();
    for (const p of lmsProgress) {
      const matchesUser = Boolean(userAccount?.uid && p.studentUid === userAccount.uid);
      const matchesStudent = Boolean(
        myStudent?.studentId && p.studentId === myStudent.studentId
      );
      if (!matchesUser && !matchesStudent) continue;
      const prev = map.get(p.courseId);
      if (!prev || matchesUser) {
        map.set(p.courseId, p);
      }
    }
    return map;
  }, [lmsProgress, userAccount?.uid, myStudent?.studentId]);

  const lmsSummary = useMemo(
    () => buildStudentLmsSummary(courses, lessons, progressByCourse),
    [courses, lessons, progressByCourse]
  );

  const studentNotices = useMemo(
    () => notices.filter((n) => n.isPublic).slice(0, 4),
    [notices]
  );

  const unreadNotifCount = notifications.filter((n) => !n.read).length + studentNotices.length;

  const handleNavigate = (section: StudentSectionKey, nextResourceTab?: StudentResourceTab) => {
    setActiveSection(section);
    if (nextResourceTab) setResourceTab(nextResourceTab);
    setActivePlayer(null);
    setDrawerOpen(false);
    setProfileOpen(false);
    setNotifOpen(false);
    if (!embeddedPreview && typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLaunchCourse = (course: LmsCourse, lessonId?: string) => {
    if (!isSignedIn) {
      navigate('/login?next=/student');
      return;
    }
    setActivePlayer({ course, lessonId });
    setDrawerOpen(false);
    setProfileOpen(false);
    setNotifOpen(false);
    if (!embeddedPreview && typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLaunchContinue = () => {
    if (!isSignedIn) {
      navigate('/login?next=/student');
      return;
    }
    if (lmsSummary.continueCandidate) {
      handleLaunchCourse(
        lmsSummary.continueCandidate.course,
        lmsSummary.continueCandidate.lessonId
      );
      return;
    }
    if (courses[0]) {
      handleLaunchCourse(courses[0]);
      return;
    }
    handleNavigate('courses');
  };

  const handleSignOut = async () => {
    setProfileOpen(false);
    setDrawerOpen(false);
    await logout();
    navigate('/login');
  };

  const studentInitials = (myStudent?.name || userAccount?.displayName || 'ST')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');

  return (
    <div
      className={`${
        embeddedPreview ? 'rounded-2xl overflow-hidden border border-[#D9AD43]/40' : 'min-h-screen'
      } flex flex-col overflow-x-hidden bg-[#F8F1DF] text-[#102D23] dark:bg-[#081A14] dark:text-[#F8F1DF]`}
    >
      {!embeddedPreview && <PWAInstallBanner />}
      {/* Top Sticky Portal Header (<= 56px tall so mobile viewport stays clean) */}
      <header className="sticky top-0 z-40 h-14 bg-[#06452C] text-[#F8F1DF] border-b border-[#D9AD43]/35 shadow-sm">
        <div className="max-w-7xl mx-auto h-full px-3 sm:px-6 flex items-center justify-between gap-3">
          {/* Left: Hamburger + Emblem + Brand */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open Student Navigation Menu"
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg text-[#F8F1DF] hover:bg-[#102D23] cursor-pointer shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('home')}
              className="flex items-center gap-2 min-w-0 cursor-pointer text-left"
            >
              <AcademyEmblem className="w-8 h-8 shrink-0" variant="gold-on-emerald" />
              <div className="min-w-0 leading-tight">
                <p className="font-serif text-sm sm:text-base font-semibold text-white truncate">
                  {settings.name}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#D9AD43] truncate">
                  Student Portal
                </p>
              </div>
            </button>
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav
            aria-label="Student Portal Navigation"
            className="hidden lg:flex items-center gap-1.5 text-xs font-semibold"
          >
            {DESKTOP_NAV.map((item) => {
              const Icon = item.icon;
              const isActive = !activePlayer && activeSection === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleNavigate(item.key)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-[#D9AD43] text-[#102D23] font-bold'
                      : 'text-[#E6DFCE] hover:bg-[#102D23] hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: Install App, Language, Theme, Notifications & Student Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {!embeddedPreview && <PWAInstallButton variant="compact" />}
            <div className="hidden sm:inline-flex items-center border border-[#D9AD43]/35 rounded-lg overflow-hidden">
              {(['en', 'bn', 'ar'] as LanguageCode[]).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLanguage(code)}
                  className={`px-2 py-1 text-[10px] font-bold cursor-pointer ${
                    language === code
                      ? 'bg-[#D9AD43] text-[#102D23]'
                      : 'text-[#E6DFCE] hover:text-white'
                  }`}
                >
                  {code === 'en' ? 'EN' : code === 'bn' ? 'বাংলা' : 'عر'}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={toggleDarkMode}
              aria-label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[#D9AD43]/30 text-[#E6DFCE] hover:bg-[#102D23] cursor-pointer"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotifOpen((v) => !v);
                  setProfileOpen(false);
                }}
                aria-label="Student Notices & Notifications"
                className="relative inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[#D9AD43]/30 text-[#E6DFCE] hover:bg-[#102D23] cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-1 -end-1 min-w-[16px] h-4 px-1 rounded-full bg-[#D9AD43] text-[#102D23] text-[9px] font-bold flex items-center justify-center tabular-nums">
                    {Math.min(unreadNotifCount, 9)}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute end-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 shadow-xl p-4 z-50 text-[#102D23] dark:text-[#F8F1DF] space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#8A6518] dark:text-[#D9AD43]">
                      Notices &amp; Alerts
                    </p>
                    <button
                      type="button"
                      onClick={() => setNotifOpen(false)}
                      className="text-xs text-[#5A6D64] hover:text-[#06452C] dark:text-[#DED7C5] cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {studentNotices.map((n) => (
                      <div
                        key={n.id}
                        className="p-2.5 rounded-xl bg-[#F8F1DF]/75 dark:bg-[#081A14] border border-[#D9AD43]/25"
                      >
                        <p className="text-xs font-bold text-[#06452C] dark:text-white">{n.title}</p>
                        <p className="text-[11px] text-[#5A6D64] dark:text-[#DED7C5] mt-0.5 line-clamp-2">
                          {n.summary}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {isSignedIn ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen((v) => !v);
                    setNotifOpen(false);
                  }}
                  aria-label="Open Student Profile"
                  className="inline-flex items-center gap-2 h-9 ps-1.5 pe-2.5 rounded-full bg-[#102D23] border border-[#D9AD43]/45 text-xs font-semibold text-white cursor-pointer"
                >
                  <span className="w-6 h-6 rounded-full bg-[#D9AD43] text-[#102D23] text-[10px] font-bold flex items-center justify-center shrink-0">
                    {studentInitials}
                  </span>
                  <span className="hidden md:inline max-w-[110px] truncate">
                    {myStudent?.name || userAccount?.displayName}
                  </span>
                </button>

                {profileOpen && (
                  <div className="absolute end-0 mt-2 w-72 rounded-2xl bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 shadow-xl p-4 z-50 text-[#102D23] dark:text-[#F8F1DF] space-y-3">
                    <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#D9AD43]/25">
                      <div className="min-w-0">
                        <p className="font-serif text-base font-bold text-[#06452C] dark:text-white truncate">
                          {myStudent?.name || userAccount?.displayName}
                        </p>
                        <p className="text-[11px] text-[#5A6D64] dark:text-[#DED7C5] truncate">
                          {userAccount?.email}
                        </p>
                        {myStudent && (
                          <p className="text-[11px] font-semibold text-[#8A6518] dark:text-[#D9AD43] mt-1 tabular-nums">
                            Adm: {myStudent.admissionNumber} · {myStudent.classId}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setProfileOpen(false)}
                        aria-label="Close profile menu"
                        className="p-1 rounded hover:bg-[#F8F1DF] dark:hover:bg-[#081A14] cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <button
                        type="button"
                        onClick={() => handleNavigate('program')}
                        className="w-full min-h-[40px] px-3 py-2 rounded-xl hover:bg-[#F8F1DF] dark:hover:bg-[#081A14] flex items-center gap-2 text-left font-medium cursor-pointer"
                      >
                        <LayoutGrid className="w-4 h-4 text-[#06452C] dark:text-[#D9AD43]" />
                        <span>Student Dashboard &amp; Program</span>
                      </button>

                      {myStudent && (
                        <button
                          type="button"
                          onClick={() => downloadStudentIdCardPdf(myStudent, settings)}
                          className="w-full min-h-[40px] px-3 py-2 rounded-xl hover:bg-[#F8F1DF] dark:hover:bg-[#081A14] flex items-center gap-2 text-left font-medium cursor-pointer"
                        >
                          <Download className="w-4 h-4 text-[#06452C] dark:text-[#D9AD43]" />
                          <span>Download Student ID Card PDF</span>
                        </button>
                      )}

                      {userAccount && userAccount.role !== 'student' && (
                        <Link
                          to="/portal"
                          onClick={() => setProfileOpen(false)}
                          className="w-full min-h-[40px] px-3 py-2 rounded-xl hover:bg-[#F8F1DF] dark:hover:bg-[#081A14] flex items-center gap-2 text-left font-medium"
                        >
                          <ExternalLink className="w-4 h-4 text-[#8A6518] dark:text-[#D9AD43]" />
                          <span>Open Staff ERP Portal</span>
                        </Link>
                      )}

                      <Link
                        to="/"
                        onClick={() => setProfileOpen(false)}
                        className="w-full min-h-[40px] px-3 py-2 rounded-xl hover:bg-[#F8F1DF] dark:hover:bg-[#081A14] flex items-center gap-2 text-left font-medium"
                      >
                        <Home className="w-4 h-4 text-[#06452C] dark:text-[#D9AD43]" />
                        <span>Academy Public Website</span>
                      </Link>

                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full min-h-[40px] px-3 py-2 rounded-xl hover:bg-[#FEE2E2] dark:hover:bg-[#7F1D1D]/30 text-[#991B1B] dark:text-[#FCA5A5] flex items-center gap-2 text-left font-semibold cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login?next=/student"
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-[#D9AD43] text-[#102D23] text-xs font-bold whitespace-nowrap"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Slide-Out Hamburger Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/55"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative w-72 max-w-[85vw] h-full bg-[#06452C] text-[#F8F1DF] border-e border-[#D9AD43]/40 flex flex-col justify-between p-4 overflow-y-auto z-10">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#D9AD43]/25">
                <div className="flex items-center gap-2 min-w-0">
                  <AcademyEmblem className="w-8 h-8 shrink-0" variant="gold-on-emerald" />
                  <div className="min-w-0">
                    <p className="font-serif text-sm font-semibold text-white truncate">
                      {settings.name}
                    </p>
                    <p className="text-[10px] text-[#D9AD43] truncate">
                      {myStudent?.admissionNumber
                        ? `Adm No: ${myStudent.admissionNumber}`
                        : 'Student Portal'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close Menu"
                  className="w-10 h-10 rounded-lg inline-flex items-center justify-center hover:bg-[#102D23] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {DESKTOP_NAV.map((item) => {
                  const Icon = item.icon;
                  const active = !activePlayer && activeSection === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleNavigate(item.key)}
                      className={`w-full min-h-[44px] px-3.5 py-2 rounded-xl flex items-center gap-3 text-sm font-semibold cursor-pointer ${
                        active
                          ? 'bg-[#D9AD43] text-[#102D23]'
                          : 'text-[#E6DFCE] hover:bg-[#102D23]'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-[#D9AD43]/25 space-y-1">
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#D9AD43]">
                  Quick Learning Tools
                </p>
                <button
                  type="button"
                  onClick={() => handleNavigate('resources', 'live')}
                  className="w-full min-h-[42px] px-3.5 py-2 rounded-xl flex items-center gap-3 text-xs font-medium text-[#E6DFCE] hover:bg-[#102D23] cursor-pointer"
                >
                  <Radio className="w-4 h-4 text-[#D9AD43]" />
                  <span>Live &amp; Recorded Classes</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate('resources', 'notes')}
                  className="w-full min-h-[42px] px-3.5 py-2 rounded-xl flex items-center gap-3 text-xs font-medium text-[#E6DFCE] hover:bg-[#102D23] cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-[#D9AD43]" />
                  <span>Study Notes &amp; PDFs</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate('resources', 'results')}
                  className="w-full min-h-[42px] px-3.5 py-2 rounded-xl flex items-center gap-3 text-xs font-medium text-[#E6DFCE] hover:bg-[#102D23] cursor-pointer"
                >
                  <Trophy className="w-4 h-4 text-[#D9AD43]" />
                  <span>Exam Results &amp; Marksheets</span>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-[#D9AD43]/25 space-y-2">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs text-[#DED7C5]">Language</span>
                <div className="inline-flex border border-[#D9AD43]/35 rounded-lg overflow-hidden">
                  {(['en', 'bn', 'ar'] as LanguageCode[]).map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setLanguage(code)}
                      className={`px-2 py-1 text-[10px] font-bold cursor-pointer ${
                        language === code ? 'bg-[#D9AD43] text-[#102D23]' : 'text-[#E6DFCE]'
                      }`}
                    >
                      {code === 'en' ? 'EN' : code === 'bn' ? 'বাংলা' : 'عر'}
                    </button>
                  ))}
                </div>
              </div>

              {!embeddedPreview && (
                <div className="px-1">
                  <PWAInstallButton variant="portal" />
                </div>
              )}

              <Link
                to="/"
                onClick={() => setDrawerOpen(false)}
                className="w-full min-h-[42px] px-3.5 py-2 rounded-xl bg-[#102D23] text-xs font-semibold text-[#E6DFCE] flex items-center gap-2"
              >
                <Home className="w-4 h-4 text-[#D9AD43]" />
                <span>Public Academy Website</span>
              </Link>

              {isSignedIn ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full min-h-[42px] px-3.5 py-2 rounded-xl bg-[#7F1D1D]/40 text-xs font-semibold text-[#FCA5A5] flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <Link
                  to="/login?next=/student"
                  onClick={() => setDrawerOpen(false)}
                  className="w-full min-h-[42px] px-3.5 py-2 rounded-xl bg-[#D9AD43] text-[#102D23] text-xs font-bold flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Student Sign In</span>
                </Link>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Container */}
      <main
        className={`flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-7 ${
          embeddedPreview ? 'pb-6' : 'pb-24 lg:pb-10'
        }`}
      >
        {activePlayer ? (
          <SequentialLmsPlayer
            course={activePlayer.course}
            initialLessonId={activePlayer.lessonId}
            studentId={myStudent?.studentId || userAccount?.uid}
            studentName={myStudent?.name || userAccount?.displayName || 'Academy Student'}
            previewMode={embeddedPreview || effectiveRole !== 'student'}
            onExit={() => setActivePlayer(null)}
          />
        ) : activeSection === 'home' ? (
          <StudentHomeSection
            settings={settings}
            isSignedIn={isSignedIn}
            myStudent={myStudent}
            courses={courses}
            subjects={subjects}
            teachers={teachers}
            totalStudentsCount={students.length}
            lmsSummary={lmsSummary}
            onNavigateSection={handleNavigate}
            onLaunchContinue={handleLaunchContinue}
          />
        ) : activeSection === 'program' ? (
          <StudentDashboardProgram
            mode="program"
            settings={settings}
            isSignedIn={isSignedIn}
            myStudent={myStudent}
            classes={classes}
            subjects={subjects}
            courses={courses}
            lessons={lessons}
            teachers={teachers}
            attendance={attendance}
            progressByCourse={progressByCourse}
            lmsSummary={lmsSummary}
            onLaunchCourse={handleLaunchCourse}
            onLaunchContinue={handleLaunchContinue}
            onOpenResources={() => handleNavigate('resources', 'live')}
          />
        ) : activeSection === 'courses' ? (
          <StudentCoursesSection
            settings={settings}
            myStudent={myStudent}
            courses={courses}
            lessons={lessons}
            teachers={teachers}
            progressByCourse={progressByCourse}
            lmsSummary={lmsSummary}
            onLaunchCourse={handleLaunchCourse}
          />
        ) : activeSection === 'resources' ? (
          <StudentResourcesSection
            activeTab={resourceTab}
            onChangeTab={setResourceTab}
            settings={settings}
            integrations={integrations}
            isSignedIn={isSignedIn}
            userUid={userAccount?.uid}
            myStudent={myStudent}
            courses={courses}
            lessons={lessons}
            liveClasses={liveClasses}
            library={library}
            results={results}
            homework={homework}
            assignments={assignments}
            submissions={submissions}
            timetables={timetables}
            invoices={invoices}
            payments={payments}
            lmsSummary={lmsSummary}
            upsertRecord={upsertRecord}
            onLaunchCourse={handleLaunchCourse}
          />
        ) : (
          <StudentTeachersAndContact
            mode={activeSection === 'teachers' ? 'teachers' : 'contact'}
            settings={settings}
            teachers={teachers}
            isSignedIn={isSignedIn}
            userUid={userAccount?.uid}
            userName={myStudent?.name || userAccount?.displayName}
            userRole={userAccount?.role}
            upsertRecord={upsertRecord}
          />
        )}
      </main>

      {/* Mobile Bottom Thumb-Zone Navigation Dock (hidden on desktop and embedded preview) */}
      {!embeddedPreview && !activePlayer && (
        <nav
          aria-label="Mobile Student Dock"
          className="fixed bottom-0 inset-x-0 z-40 h-16 bg-[#102D23] text-[#F8F1DF] border-t border-[#D9AD43]/35 lg:hidden pb-safe"
        >
          <div className="h-full max-w-lg mx-auto grid grid-cols-5">
            {MOBILE_BOTTOM_TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeSection === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleNavigate(tab.key)}
                  className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold cursor-pointer ${
                    active ? 'text-[#D9AD43]' : 'text-[#DED7C5] hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
};
