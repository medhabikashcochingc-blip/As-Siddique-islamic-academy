import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { AcademyEmblem } from './AcademyEmblem';

interface NavbarProps {
  onApplyClick: () => void;
}

const NAV_LINKS = [
  { label: 'Programmes', href: '#programmes' },
  { label: 'Curriculum', href: '#curriculum' },
  { label: 'Faculty', href: '#faculty' },
  { label: 'Online Classes', href: '#online-classes' },
  { label: 'Notices', href: '#notices' },
];

export const Navbar: React.FC<NavbarProps> = ({ onApplyClick }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleMobileNav = (href: string) => {
    setMobileOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F0]/95 backdrop-blur-md border-b border-[#E4DDD0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Academy Brand Wordmark */}
        <a
          href="#top"
          className="flex items-center gap-2.5 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#093B2C] rounded"
        >
          <AcademyEmblem className="w-8 h-8 shrink-0" variant="emerald-on-cream" />
          <span className="font-serif text-lg sm:text-xl font-semibold tracking-tight text-[#06281E]">
            As-Siddique Islamic Academy
          </span>
        </a>

        {/* Zone 2: 5 concise single-line text links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#2E473D]"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative py-1 whitespace-nowrap shrink-0 hover:text-[#06281E] transition-colors duration-150 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-px after:w-0 after:bg-[#B8923E] hover:after:w-full after:transition-all after:duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#093B2C]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: 1 primary CTA + Mobile Drawer Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onApplyClick}
            className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-[#FAF7F0] bg-[#093B2C] hover:bg-[#06281E] border border-[#C9A449]/40 rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#093B2C]"
          >
            Apply Now
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg text-[#06281E] hover:bg-[#EFE9DC] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#093B2C]"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[#E4DDD0] bg-[#FAF7F0] px-4 py-4 space-y-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                handleMobileNav(link.href);
              }}
              className="flex items-center min-h-[44px] px-3 text-base font-medium text-[#12241D] hover:bg-[#F2ECE0] rounded-lg transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onApplyClick();
              }}
              className="w-full min-h-[44px] px-5 py-2.5 text-sm font-medium text-[#FAF7F0] bg-[#093B2C] hover:bg-[#06281E] rounded-lg transition-colors cursor-pointer"
            >
              Apply for Admission
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
