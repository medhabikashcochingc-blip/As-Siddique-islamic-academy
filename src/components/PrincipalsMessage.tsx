import React, { useState } from 'react';
import { PRINCIPAL_PORTRAIT_IMAGE } from '../data/academyData';
import { AcademyEmblem } from './AcademyEmblem';

export const PrincipalsMessage: React.FC = () => {
  const [imgError, setImgError] = useState(false);

  return (
    <section id="principal" className="py-16 sm:py-24 bg-[#FAF7F0] border-b border-[#E4DDD0]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          {/* Portrait Column */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="relative flex-1 min-h-[380px] rounded-xl overflow-hidden border border-[#DED5C3] bg-[#EFE9DC]">
              {!imgError ? (
                <img
                  src={PRINCIPAL_PORTRAIT_IMAGE}
                  alt="Mawlana Dr. Abdul Hakim Siddiqui, Principal of As-Siddique Islamic Academy"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full lg:h-full object-cover object-top"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[#06281E] to-[#0D4433] text-[#FAF7F0]">
                  <AcademyEmblem className="w-16 h-16 mb-4" variant="gold-on-emerald" />
                  <p className="font-serif text-xl font-semibold text-center">
                    Office of the Principal
                  </p>
                </div>
              )}
            </div>
            <p className="text-xs font-serif italic text-[#5A6D64] mt-3">
              Mawlana Dr. Abdul Hakim Siddiqui — Principal, As-Siddique Islamic Academy
            </p>
          </div>

          {/* Editorial Message Column */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#8A6518] mb-2">
              Principal’s Message
            </p>
            <h2
              className="font-serif text-3xl sm:text-4xl font-semibold text-[#06281E] tracking-tight mb-6"
              style={{ textWrap: 'balance' }}
            >
              Educating the Mind, Illuminating the Heart
            </h2>

            <div className="space-y-4 text-sm sm:text-base text-[#314A3F] leading-[1.75] max-w-prose">
              <p className="first-letter:text-5xl first-letter:font-serif first-letter:font-semibold first-letter:text-[#06281E] first-letter:float-left first-letter:mr-3 first-letter:leading-none">
                Assalamu Alaikum wa Rahmatullahi wa Barakatuh. At As-Siddique Islamic Academy, we
                believe parents should never have to choose between high-standard modern schooling
                and authentic Islamic upbringing. From the moment a young student enters Class 1
                until they graduate from Class 12, our mission is to cultivate intellectual rigor
                alongside humility, truthfulness, and living faith.
              </p>

              <p>
                In our laboratories and mathematics seminars, students learn to examine creation
                with discipline and curiosity. In our Quran circles and Arabic classrooms, they
                connect directly with the Book of Allah and the noble character of Prophet Muhammad
                (peace be upon him). Whether joining us on campus or through our live online
                academy, every child is known by name, mentored closely, and guided with mercy.
              </p>
            </div>

            {/* Subtle Top/Bottom Hairline Pull Quote (No thick left accent border) */}
            <blockquote className="my-7 py-5 border-y border-[#C9A449]/45">
              <p className="font-serif italic text-xl sm:text-2xl text-[#06281E] leading-snug">
                “True education does not merely prepare a student to earn a livelihood; it shapes a
                trustworthy human being who brings light to family, profession, and community.”
              </p>
            </blockquote>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
              <div>
                <p className="font-serif text-xl font-semibold text-[#06281E]">
                  Mawlana Dr. Abdul Hakim Siddiqui
                </p>
                <p className="text-xs text-[#5A6D64] mt-0.5">
                  Ph.D. Education · Fazil-e-Dars-e-Nizami · 22 Years in Academic Leadership
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
