import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Award,
  BarChart3,
  Bell,
  BookMarked,
  BookOpen,
  Building2,
  Calendar,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  CreditCard,
  Eye,
  FileCheck2,
  FileText,
  FolderKanban,
  Globe,
  GraduationCap,
  Home,
  Image as ImageIcon,
  Layers,
  LayoutDashboard,
  Library,
  LogOut,
  Megaphone,
  Menu,
  Moon,
  Receipt,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sun,
  UserCheck,
  UserCog,
  UserPlus,
  Users,
  Video,
  Wallet,
  X,
} from 'lucide-react';
import { AcademyEmblem } from '../../components/AcademyEmblem';
import { PWAInstallButton } from '../../components/pwa/PWAInstallButton';
import { useAuth } from '../../context/AuthContext';
import { usePlatform } from '../../context/PlatformContext';
import { hasPermission, PermissionKey, ROLE_DEFINITIONS } from '../../lib/permissions';
import { LanguageCode, UserRole } from '../../types/platform';

export interface PortalNavItem {
  key: string;
  label: string;
  group: string;
  icon: React.ComponentType<{ className?: string }>;
  permission: PermissionKey;
}

export const PORTAL_NAV_ITEMS: PortalNavItem[] = [
  // Core Overview & Tailored Role Homes
  { key: 'super-admin-home', label: 'Super Admin Console', group: 'Core', icon: ShieldCheck, permission: 'manage_users_roles' },
  { key: 'principal-home', label: 'Principal Oversight', group: 'Core', icon: Building2, permission: 'approve_results' },
  { key: 'accounts-home', label: 'Accounts Staff Desk', group: 'Core', icon: Wallet, permission: 'manage_fees_finance' },
  { key: 'overview', label: 'Dashboard Overview', group: 'Core', icon: LayoutDashboard, permission: 'view_admin_overview' },
  { key: 'student-home', label: 'Student Portal', group: 'My Portal', icon: GraduationCap, permission: 'student_portal' },
  { key: 'parent-home', label: 'Parent Portal', group: 'My Portal', icon: Users, permission: 'parent_portal' },
  { key: 'teacher-home', label: 'Teacher Workspace', group: 'My Portal', icon: UserCheck, permission: 'teacher_portal' },

  // Admissions & People
  { key: 'admissions', label: 'Admissions & Intake', group: 'People & Admissions', icon: UserPlus, permission: 'manage_admissions' },
  { key: 'students', label: 'Students Directory', group: 'People & Admissions', icon: GraduationCap, permission: 'manage_students' },
  { key: 'parents', label: 'Parents & Guardians', group: 'People & Admissions', icon: Users, permission: 'manage_parents' },
  { key: 'teachers', label: 'Teachers & Faculty', group: 'People & Admissions', icon: UserCheck, permission: 'manage_teachers' },
  { key: 'staff', label: 'Staff & Payroll', group: 'People & Admissions', icon: Wallet, permission: 'manage_staff_salary' },

  // Academics & Dual Education
  { key: 'classes', label: 'Classes (1–12)', group: 'Academics', icon: Building2, permission: 'manage_academics' },
  { key: 'sections', label: 'Sections', group: 'Academics', icon: Layers, permission: 'manage_academics' },
  { key: 'subjects', label: 'Subjects', group: 'Academics', icon: BookOpen, permission: 'manage_academics' },
  { key: 'sessions', label: 'Academic Sessions', group: 'Academics', icon: CalendarDays, permission: 'manage_academics' },
  { key: 'general', label: 'General Education', group: 'Academics', icon: BookMarked, permission: 'manage_academics' },
  { key: 'islamic', label: 'Islamic Education', group: 'Academics', icon: Award, permission: 'manage_islamic_education' },
  { key: 'attendance', label: 'Attendance Register', group: 'Academics', icon: CalendarCheck, permission: 'manage_attendance' },
  { key: 'timetable', label: 'Timetable & Routine', group: 'Academics', icon: Clock, permission: 'manage_timetable' },

  // LMS & Digital Learning
  { key: 'homework', label: 'Daily Homework', group: 'LMS & Digital', icon: ClipboardList, permission: 'manage_homework_assignments' },
  { key: 'assignments', label: 'Assignments & Grading', group: 'LMS & Digital', icon: FileCheck2, permission: 'manage_homework_assignments' },
  { key: 'lms', label: 'LMS Lessons & Modules', group: 'LMS & Digital', icon: FolderKanban, permission: 'manage_lms' },
  { key: 'courses', label: 'Online Courses', group: 'LMS & Digital', icon: BookOpen, permission: 'manage_lms' },
  { key: 'live-classes', label: 'Live Classes', group: 'LMS & Digital', icon: Video, permission: 'manage_live_classes' },
  { key: 'materials', label: 'Study Materials', group: 'LMS & Digital', icon: FileText, permission: 'manage_lms' },
  { key: 'library', label: 'Digital Library', group: 'LMS & Digital', icon: Library, permission: 'manage_library' },

  // Examinations & Certificates
  { key: 'exams', label: 'Examinations Setup', group: 'Exams & Records', icon: Calendar, permission: 'manage_exams_marks' },
  { key: 'marks', label: 'Marks Entry', group: 'Exams & Records', icon: ClipboardList, permission: 'manage_exams_marks' },
  { key: 'results', label: 'Result Publishing', group: 'Exams & Records', icon: CheckCircle2, permission: 'approve_results' },
  { key: 'marksheet', label: 'Marksheets & PDFs', group: 'Exams & Records', icon: FileCheck2, permission: 'manage_exams_marks' },
  { key: 'certificates', label: 'Certificates & ID Cards', group: 'Exams & Records', icon: Award, permission: 'manage_certificates' },

  // Finance
  { key: 'fees', label: 'Fees & Invoices', group: 'Finance', icon: CreditCard, permission: 'manage_fees_finance' },
  { key: 'payments', label: 'Payments & Receipts', group: 'Finance', icon: Receipt, permission: 'manage_fees_finance' },

  // Website CMS
  { key: 'notices', label: 'Notice Board CMS', group: 'Website & CMS', icon: Megaphone, permission: 'manage_cms_content' },
  { key: 'events', label: 'Events CMS', group: 'Website & CMS', icon: CalendarDays, permission: 'manage_cms_content' },
  { key: 'gallery', label: 'Media Gallery CMS', group: 'Website & CMS', icon: ImageIcon, permission: 'manage_cms_content' },
  { key: 'cms', label: 'Institution CMS', group: 'Website & CMS', icon: Globe, permission: 'manage_cms_content' },

  // Governance & Security
  { key: 'reports', label: 'Reports & Analytics', group: 'Governance', icon: BarChart3, permission: 'view_reports' },
  { key: 'users', label: 'User Accounts', group: 'Governance', icon: UserCog, permission: 'manage_users_roles' },
  { key: 'roles', label: 'Roles & Permissions', group: 'Governance', icon: ShieldCheck, permission: 'manage_users_roles' },
  { key: 'settings', label: 'System & Integrations', group: 'Governance', icon: Settings, permission: 'manage_users_roles' },
  { key: 'audit', label: 'Audit Logs', group: 'Governance', icon: FileText, permission: 'view_audit_logs' },
  { key: 'security', label: 'Security & Rules', group: 'Governance', icon: ShieldAlert, permission: 'manage_users_roles' },
];

export const PortalLayout: React.FC<{
  activeModule: string;
  onSelectModule: (key: string) => void;
  children: React.ReactNode;
}> = ({ activeModule, onSelectModule, children }) => {
  const { userAccount, effectiveRole, previewRole, setPreviewRole, logout } = useAuth();
  const {
    settings,
    darkMode,
    toggleDarkMode,
    language,
    setLanguage,
    notifications,
    upsertRecord,
  } = usePlatform();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMsg, setNotifMsg] = useState('');

  const allowedItems = PORTAL_NAV_ITEMS.filter((item) =>
    hasPermission(effectiveRole || undefined, item.permission)
  );

  const grouped = allowedItems.reduce<Record<string, PortalNavItem[]>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  const unreadCount = notifications.filter((n) => !n.read).length;
  const canBroadcastNotif = ['super_admin', 'admin', 'principal', 'teacher'].includes(
    effectiveRole || ''
  );

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMsg.trim()) return;
    const id = `notif_${Date.now()}`;
    await upsertRecord(
      'notifications',
      id,
      {
        targetRole: 'all',
        category: 'Announcement',
        title: notifTitle.trim(),
        message: notifMsg.trim(),
        read: false,
      },
      `Published portal notification: ${notifTitle.trim()}`
    );
    setNotifTitle('');
    setNotifMsg('');
  };

  const SidebarContent = (
    <div className="flex flex-col h-full bg-[#102D23] text-[#F8F1DF] border-r border-[#D9AD43]/25">
      <div className="p-4 border-b border-[#D9AD43]/25 flex items-center justify-between gap-2">
        <Link to="/" className="flex items-center gap-2.5 min-w-0">
          <AcademyEmblem className="w-8 h-8 shrink-0" variant="gold-on-emerald" />
          <div className="min-w-0">
            <p className="font-serif text-base font-semibold text-white truncate">{settings.name}</p>
            <p className="text-[10px] text-[#D9AD43] uppercase tracking-wider truncate">
              {ROLE_DEFINITIONS[effectiveRole || 'student']?.label} Portal
            </p>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
          className="lg:hidden p-1.5 rounded text-[#E6DFCE] hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Super Admin Preview Role Switcher */}
      {userAccount?.role === 'super_admin' && (
        <div className="px-4 py-3 border-b border-[#D9AD43]/20 bg-[#06452C]/50">
          <label
            htmlFor="role-preview-select"
            className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#D9AD43] mb-1.5"
          >
            <Eye className="w-3 h-3" /> Super Admin Role View
          </label>
          <select
            id="role-preview-select"
            value={previewRole || 'super_admin'}
            onChange={(e) => {
              const val = e.target.value as UserRole;
              setPreviewRole(val === 'super_admin' ? null : val);
            }}
            className="w-full rounded-lg bg-[#102D23] border border-[#D9AD43]/40 text-xs text-white px-2.5 py-1.5"
          >
            {(Object.keys(ROLE_DEFINITIONS) as UserRole[]).map((roleKey) => (
              <option key={roleKey} value={roleKey}>
                {ROLE_DEFINITIONS[roleKey].label}
              </option>
            ))}
          </select>
        </div>
      )}

      <nav aria-label="Portal Navigation" className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {Object.entries(grouped).map(([groupName, items]) => (
          <div key={groupName}>
            <p className="px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#D9AD43]/80 mb-1.5">
              {groupName}
            </p>
            <div className="space-y-0.5">
              {items.map((item) => {
                const Icon = item.icon;
                const active = activeModule === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      onSelectModule(item.key);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                      active
                        ? 'bg-[#D9AD43] text-[#102D23] font-semibold'
                        : 'text-[#E6DFCE] hover:bg-[#06452C] hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-[#D9AD43]/25 space-y-1.5">
        <Link
          to="/"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#E6DFCE] hover:bg-[#06452C]"
        >
          <Home className="w-4 h-4" /> Public Website
        </Link>
        <Link
          to="/results"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#E6DFCE] hover:bg-[#06452C]"
        >
          <Award className="w-4 h-4" /> Result Portal
        </Link>
        <button
          type="button"
          onClick={async () => {
            await logout();
            navigate('/login');
          }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#F5C2C0] hover:bg-[#06452C] cursor-pointer"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#F8F1DF] text-[#102D23] dark:bg-[#081A14] dark:text-[#F8F1DF]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-68 shrink-0 h-screen sticky top-0">{SidebarContent}</aside>

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="w-72 h-full">{SidebarContent}</div>
          <div
            className="flex-1 bg-black/50"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-[#0D241C]/95 backdrop-blur border-b border-[#D9AD43]/30 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open portal menu"
              className="lg:hidden p-2 rounded-lg border border-[#D9AD43]/40 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="font-serif text-lg sm:text-xl font-semibold text-[#06452C] dark:text-white truncate">
                {PORTAL_NAV_ITEMS.find((i) => i.key === activeModule)?.label || 'Academy Portal'}
              </h1>
              <p className="text-[11px] text-[#5A6D64] dark:text-[#D9AD43] truncate">
                {userAccount?.displayName} ({userAccount?.email})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <PWAInstallButton variant="portal" />

            {/* Language Switcher */}
            <div className="hidden sm:inline-flex border border-[#D9AD43]/40 rounded-lg overflow-hidden">
              {(['en', 'bn', 'ar'] as LanguageCode[]).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLanguage(code)}
                  className={`px-2 py-1 text-[11px] font-semibold cursor-pointer ${
                    language === code ? 'bg-[#06452C] text-[#F8F1DF]' : ''
                  }`}
                >
                  {code === 'en' ? 'EN' : code === 'bn' ? 'বাংলা' : 'العربية'}
                </button>
              ))}
            </div>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
              className="p-2 rounded-lg border border-[#D9AD43]/40 hover:bg-[#F8F1DF] dark:hover:bg-[#102D23] cursor-pointer"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen((v) => !v)}
                aria-label="Notifications"
                className="relative p-2 rounded-lg border border-[#D9AD43]/40 hover:bg-[#F8F1DF] dark:hover:bg-[#102D23] cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#D9AD43] text-[#102D23] text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 rounded-xl shadow-xl p-4 z-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-serif text-base font-semibold">Portal Notifications</p>
                    <button
                      type="button"
                      onClick={() => setNotifOpen(false)}
                      className="text-xs text-[#5A6D64] cursor-pointer"
                    >
                      Close
                    </button>
                  </div>

                  <div className="max-h-56 overflow-y-auto space-y-2">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className="p-2.5 rounded-lg bg-[#F8F1DF]/70 dark:bg-[#081A14] border border-[#D9AD43]/20 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#06452C] dark:text-[#D9AD43]">
                            {n.title}
                          </span>
                          {!n.read && (
                            <button
                              type="button"
                              onClick={() => upsertRecord('notifications', n.id, { read: true })}
                              className="text-[10px] underline cursor-pointer"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                        <p className="text-[#5A6D64] dark:text-[#DED7C5] mt-1">{n.message}</p>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <p className="text-xs text-[#5A6D64]">No notifications posted yet.</p>
                    )}
                  </div>

                  {canBroadcastNotif && (
                    <form
                      onSubmit={handleSendNotification}
                      className="pt-2 border-t border-[#D9AD43]/25 space-y-2"
                    >
                      <p className="text-[11px] font-semibold text-[#8A6518] dark:text-[#D9AD43]">
                        Post Internal Notification
                      </p>
                      <input
                        type="text"
                        required
                        value={notifTitle}
                        onChange={(e) => setNotifTitle(e.target.value)}
                        placeholder="Title"
                        className="w-full rounded border border-[#D9AD43]/40 bg-white dark:bg-[#081A14] px-2.5 py-1.5 text-xs"
                      />
                      <input
                        type="text"
                        required
                        value={notifMsg}
                        onChange={(e) => setNotifMsg(e.target.value)}
                        placeholder="Message..."
                        className="w-full rounded border border-[#D9AD43]/40 bg-white dark:bg-[#081A14] px-2.5 py-1.5 text-xs"
                      />
                      <button
                        type="submit"
                        className="w-full py-1.5 rounded bg-[#06452C] text-white text-xs font-semibold cursor-pointer"
                      >
                        Broadcast Notice
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
};
