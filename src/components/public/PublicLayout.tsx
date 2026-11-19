import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ChevronDown, Menu, Moon, Sun, X } from 'lucide-react';
import { AcademyEmblem } from '../AcademyEmblem';
import { useAuth } from '../../context/AuthContext';
import { usePlatform } from '../../context/PlatformContext';
import { TRANSLATIONS } from '../../lib/i18n';
import { LanguageCode } from '../../types/platform';

const MORE_PAGES = [
  { label: 'About Academy', to: '/about' },
  { label: 'Vision & Mission', to: '/vision-mission' },
  { label: "Principal's Message", to: '/principal-message' },
  { label: 'Management Committee', to: '/management-committee' },
  { label: 'General Education', to: '/general-education' },
  { label: 'Islamic Education', to: '/islamic-education' },
  { label: 'Notice Board', to: '/notices' },
  { label: 'Events', to: '/events' },
  { label: 'Photo Gallery', to: '/gallery/photos' },
  { label: 'Video Gallery', to: '/gallery/videos' },
  { label: 'Contact Us', to: '/contact' },
  { label: 'FAQ', to: '/faq' },
];

export const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings, darkMode, toggleDarkMode, language, setLanguage } = usePlatform();
  const { userAccount, effectiveRole } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const t = TRANSLATIONS[language];

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-[#F8F1DF] text-[#102D23] dark:bg-[#081A14] dark:text-[#F8F1DF]">
      {/* 1. Contact Information & Utility Top Bar */}
      <div className="no-print bg-[#102D23] text-[#F8F1DF] border-b border-[#D9AD43]/25 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[#E6DFCE]">
            <span>{settings.location}</span>
            <span aria-hidden="true">·</span>
            <span>{settings.boardName}</span>
            <span className="hidden md:inline" aria-hidden="true">
              ·
            </span>
            <span className="hidden md:inline text-[#D9AD43]">{t.tagline}</span>
            <span className="hidden xl:inline" aria-hidden="true">
              ·
            </span>
            <span className="hidden xl:inline">{settings.email}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher (EN / বাংলা / العربية) */}
            <div
              role="group"
              aria-label="Language switcher"
              className="inline-flex items-center border border-[#D9AD43]/30 rounded overflow-hidden"
            >
              {(['en', 'bn', 'ar'] as LanguageCode[]).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLanguage(code)}
                  className={`px-2 py-0.5 text-[11px] font-medium transition-colors cursor-pointer ${
                    language === code
                      ? 'bg-[#D9AD43] text-[#102D23]'
                      : 'text-[#E6DFCE] hover:text-white'
                  }`}
                >
                  {code === 'en' ? 'EN' : code === 'bn' ? 'বাংলা' : 'العربية'}
                </button>
              ))}
            </div>

            {/* Dark / Light Toggle */}
            <button
              type="button"
              onClick={toggleDarkMode}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-[#D9AD43]/30 text-[#E6DFCE] hover:text-white transition-colors cursor-pointer"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{darkMode ? 'Light' : 'Dark'}</span>
            </button>

            <Link
              to={userAccount ? '/portal' : '/login'}
              className="font-semibold text-[#D9AD43] hover:underline whitespace-nowrap"
            >
              {userAccount
                ? `Dashboard (${effectiveRole?.replace('_', ' ')})`
                : t.nav.portal}
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Academy Logo & Primary Navigation */}
      <header className="no-print sticky top-0 z-40 bg-[#F8F1DF]/95 dark:bg-[#0D241C]/95 backdrop-blur-md border-b border-[#D9AD43]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
          <Link
            to="/"
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#06452C] rounded"
          >
            <AcademyEmblem
              className="w-8 h-8 shrink-0"
              variant={darkMode ? 'gold-on-emerald' : 'emerald-on-cream'}
            />
            <span className="font-serif text-lg sm:text-xl font-semibold tracking-tight text-[#06452C] dark:text-[#F8F1DF]">
              {settings.name}
            </span>
          </Link>

          <nav
            aria-label="Main Navigation"
            className="hidden lg:flex items-center gap-5 text-sm font-medium text-[#102D23] dark:text-[#E6DFCE]"
          >
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `whitespace-nowrap shrink-0 py-1 hover:text-[#06452C] dark:hover:text-[#D9AD43] ${
                  isActive ? 'text-[#06452C] dark:text-[#D9AD43] font-semibold' : ''
                }`
              }
            >
              {t.nav.home}
            </NavLink>
            <NavLink
              to="/programmes"
              className={({ isActive }) =>
                `whitespace-nowrap shrink-0 py-1 hover:text-[#06452C] dark:hover:text-[#D9AD43] ${
                  isActive ? 'text-[#06452C] dark:text-[#D9AD43] font-semibold' : ''
                }`
              }
            >
              {t.nav.programmes}
            </NavLink>
            <NavLink
              to="/courses"
              className={({ isActive }) =>
                `whitespace-nowrap shrink-0 py-1 hover:text-[#06452C] dark:hover:text-[#D9AD43] ${
                  isActive ? 'text-[#06452C] dark:text-[#D9AD43] font-semibold' : ''
                }`
              }
            >
              {t.nav.courses}
            </NavLink>
            <NavLink
              to="/teachers"
              className={({ isActive }) =>
                `whitespace-nowrap shrink-0 py-1 hover:text-[#06452C] dark:hover:text-[#D9AD43] ${
                  isActive ? 'text-[#06452C] dark:text-[#D9AD43] font-semibold' : ''
                }`
              }
            >
              {t.nav.teachers}
            </NavLink>
            <NavLink
              to="/results"
              className={({ isActive }) =>
                `whitespace-nowrap shrink-0 py-1 hover:text-[#06452C] dark:hover:text-[#D9AD43] ${
                  isActive ? 'text-[#06452C] dark:text-[#D9AD43] font-semibold' : ''
                }`
              }
            >
              {t.nav.results}
            </NavLink>

            {/* Dropdown for additional institutional pages */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMoreOpen((v) => !v)}
                aria-expanded={moreOpen}
                className="inline-flex items-center gap-1 py-1 whitespace-nowrap shrink-0 hover:text-[#06452C] dark:hover:text-[#D9AD43] cursor-pointer"
              >
                <span>{t.nav.academyMore}</span>
                <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              {moreOpen && (
                <div
                  onMouseLeave={() => setMoreOpen(false)}
                  className="absolute end-0 mt-2 w-56 bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl shadow-lg py-2 z-50"
                >
                  {MORE_PAGES.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMoreOpen(false)}
                      className="block px-4 py-2 text-xs font-medium text-[#102D23] dark:text-[#F8F1DF] hover:bg-[#F8F1DF] dark:hover:bg-[#06452C]"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/admission')}
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-[#F8F1DF] bg-[#06452C] hover:bg-[#102D23] border border-[#D9AD43]/45 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t.nav.admission}
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg text-[#06452C] dark:text-[#F8F1DF] hover:bg-[#EFE6D2] dark:hover:bg-[#102D23] cursor-pointer"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-[#D9AD43]/30 bg-[#F8F1DF] dark:bg-[#0D241C] px-4 py-4 max-h-[80vh] overflow-y-auto space-y-1">
            {[
              { label: t.nav.home, to: '/' },
              { label: t.nav.programmes, to: '/programmes' },
              { label: t.nav.courses, to: '/courses' },
              { label: t.nav.teachers, to: '/teachers' },
              { label: 'Online Result Portal', to: '/results' },
              { label: t.nav.admission, to: '/admission' },
              ...MORE_PAGES,
              { label: userAccount ? 'Open Portal Dashboard' : 'Portal Sign In', to: userAccount ? '/portal' : '/login' },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className="flex items-center min-h-[44px] px-3 text-sm font-medium rounded-lg hover:bg-[#EFE6D2] dark:hover:bg-[#102D23]"
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      {/* 25. Professional Footer */}
      <footer className="no-print bg-[#102D23] text-[#F8F1DF] border-t border-[#D9AD43]/35">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4">
              <div className="flex items-center gap-3 mb-4">
                <AcademyEmblem className="w-10 h-10 shrink-0" variant="gold-on-emerald" />
                <div>
                  <p className="font-serif text-2xl font-semibold text-white">{settings.name}</p>
                  <p className="text-xs text-[#D9AD43]">{settings.tagline}</p>
                </div>
              </div>
              <p className="text-sm text-[#DED7C5] leading-relaxed mb-3">{settings.aboutContent.slice(0, 190)}...</p>
              <p className="text-xs text-[#D9AD43]/90">{settings.registrationNote}</p>
            </div>

            <div className="lg:col-span-2">
              <h3 className="font-serif text-lg font-semibold text-[#D9AD43] mb-3">Institution</h3>
              <ul className="space-y-2 text-sm text-[#DED7C5]">
                <li><Link to="/about" className="hover:text-white">About Academy</Link></li>
                <li><Link to="/vision-mission" className="hover:text-white">Vision &amp; Mission</Link></li>
                <li><Link to="/principal-message" className="hover:text-white">Principal’s Message</Link></li>
                <li><Link to="/management-committee" className="hover:text-white">Management Committee</Link></li>
                <li><Link to="/teachers" className="hover:text-white">Teachers</Link></li>
              </ul>
            </div>

            <div className="lg:col-span-3">
              <h3 className="font-serif text-lg font-semibold text-[#D9AD43] mb-3">Academics &amp; Portals</h3>
              <ul className="space-y-2 text-sm text-[#DED7C5]">
                <li><Link to="/programmes" className="hover:text-white">Class 1–12 Programmes</Link></li>
                <li><Link to="/general-education" className="hover:text-white">General Education ({settings.boardName})</Link></li>
                <li><Link to="/islamic-education" className="hover:text-white">Islamic Education</Link></li>
                <li><Link to="/courses" className="hover:text-white">Online Courses &amp; LMS</Link></li>
                <li><Link to="/results" className="hover:text-white">Online Result Portal</Link></li>
                <li><Link to="/admission" className="hover:text-white">Admission Portal</Link></li>
              </ul>
            </div>

            <div className="lg:col-span-3">
              <h3 className="font-serif text-lg font-semibold text-[#D9AD43] mb-3">Media, Legal &amp; Contact</h3>
              <ul className="space-y-2 text-sm text-[#DED7C5]">
                <li><Link to="/notices" className="hover:text-white">Notice Board</Link></li>
                <li><Link to="/events" className="hover:text-white">Events</Link></li>
                <li><Link to="/gallery/photos" className="hover:text-white">Photo &amp; Video Gallery</Link></li>
                <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
                <li className="pt-2 text-xs text-[#E6DFCE]">
                  {settings.address} · {settings.phone}
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-[#D9AD43]/25 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#DED7C5]/80">
            <p>
              © {new Date().getFullYear()} {settings.name} · {settings.footerNote}
            </p>
            <div className="flex items-center gap-4">
              <Link to="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white">Terms &amp; Conditions</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
