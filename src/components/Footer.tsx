import React from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import { AcademyEmblem } from './AcademyEmblem';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#06281E] text-[#FAF7F0] border-t border-[#C9A449]/35">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Academy Identity Column */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3 mb-4">
              <AcademyEmblem className="w-10 h-10 shrink-0" variant="gold-on-emerald" />
              <div>
                <p className="font-serif text-2xl font-semibold text-[#FAF7F0] leading-tight">
                  As-Siddique Islamic Academy
                </p>
                <p className="text-xs text-[#E5C158] tracking-wide">
                  Class 1 – Class 12 · General &amp; Islamic Education
                </p>
              </div>
            </div>
            <p className="text-sm text-[#D7CFC0] leading-relaxed max-w-md">
              Committed to nurturing faithful character, scholarly excellence, and compassionate
              community leadership through integrated modern and Islamic education—on campus and
              live online.
            </p>
          </div>

          {/* Quick Navigation */}
          <div className="lg:col-span-2">
            <h3 className="font-serif text-lg font-semibold text-[#E5C158] mb-3.5">Academy</h3>
            <ul className="space-y-2.5 text-sm text-[#D7CFC0]">
              <li>
                <a href="#programmes" className="hover:text-[#FAF7F0] transition-colors">
                  Class 1–12 Programmes
                </a>
              </li>
              <li>
                <a href="#curriculum" className="hover:text-[#FAF7F0] transition-colors">
                  Dual Curriculum
                </a>
              </li>
              <li>
                <a href="#principal" className="hover:text-[#FAF7F0] transition-colors">
                  Principal’s Message
                </a>
              </li>
              <li>
                <a href="#faculty" className="hover:text-[#FAF7F0] transition-colors">
                  Teachers Gallery
                </a>
              </li>
            </ul>
          </div>

          {/* Wings & Portals */}
          <div className="lg:col-span-2">
            <h3 className="font-serif text-lg font-semibold text-[#E5C158] mb-3.5">
              Learning &amp; Notices
            </h3>
            <ul className="space-y-2.5 text-sm text-[#D7CFC0]">
              <li>
                <a href="#online-classes" className="hover:text-[#FAF7F0] transition-colors">
                  Live Online Classes
                </a>
              </li>
              <li>
                <a href="#notices" className="hover:text-[#FAF7F0] transition-colors">
                  Notice Board
                </a>
              </li>
              <li>
                <a href="#admissions" className="hover:text-[#FAF7F0] transition-colors">
                  Admissions 2026–27
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Campus */}
          <div className="lg:col-span-3">
            <h3 className="font-serif text-lg font-semibold text-[#E5C158] mb-3.5">
              Campus &amp; Registrar
            </h3>
            <ul className="space-y-3 text-sm text-[#D7CFC0]">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#E5C158] mt-1 shrink-0" aria-hidden="true" />
                <span>14 Noorani Courtyard Road, Knowledge Park District</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#E5C158] shrink-0" aria-hidden="true" />
                <a
                  href="tel:+919876543210"
                  className="hover:text-[#FAF7F0] transition-colors tabular-nums"
                >
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#E5C158] shrink-0" aria-hidden="true" />
                <a
                  href="mailto:admissions@as-siddiqueacademy.edu"
                  className="hover:text-[#FAF7F0] transition-colors break-all"
                >
                  admissions@as-siddiqueacademy.edu
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Quiet Copyright Bar */}
        <div className="mt-12 pt-6 border-t border-[#C9A449]/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#D7CFC0]/80">
          <p>© {new Date().getFullYear()} As-Siddique Islamic Academy. All rights reserved.</p>
          <p>Integrated Class 1–12 Education · Campus &amp; Live Online</p>
        </div>
      </div>
    </footer>
  );
};
