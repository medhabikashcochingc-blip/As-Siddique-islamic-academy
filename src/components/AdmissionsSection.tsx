import React, { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { GeometricDivider } from './AcademyEmblem';

interface AdmissionsSectionProps {
  preselectedClass?: string;
  preselectedMode?: 'On-Campus' | 'Live Online Classes';
}

const ADMISSION_STEPS = [
  {
    index: '01.',
    title: 'Submit Admission Inquiry',
    detail:
      'Complete the inquiry form with your child’s target grade (Class 1 to Class 12) and preferred learning mode.',
  },
  {
    index: '02.',
    title: 'Readiness & Quran Interaction',
    detail:
      'Applicants attend a gentle placement check in English, Mathematics, and foundational Quranic reading.',
  },
  {
    index: '03.',
    title: 'Document Verification',
    detail:
      'Submit previous school transfer records, birth certificate copy, and guardian identification.',
  },
  {
    index: '04.',
    title: 'Enrollment & Orientation',
    detail:
      'Receive section allotment, booklist, and orientation schedule for Campus or Live Online attendance.',
  },
];

const CLASS_OPTIONS = Array.from({ length: 12 }, (_, idx) => `Class ${idx + 1}`);

export const AdmissionsSection: React.FC<AdmissionsSectionProps> = ({
  preselectedClass = 'Class 1',
  preselectedMode = 'On-Campus',
}) => {
  const [studentName, setStudentName] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [applyingClass, setApplyingClass] = useState(preselectedClass);
  const [studyMode, setStudyMode] = useState<'On-Campus' | 'Live Online Classes'>(preselectedMode);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  useEffect(() => {
    setApplyingClass(preselectedClass);
  }, [preselectedClass]);

  useEffect(() => {
    setStudyMode(preselectedMode);
  }, [preselectedMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!studentName.trim() || !guardianName.trim()) {
      setErrorMsg('Please enter both the student’s full name and parent or guardian name.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg('Please provide a valid email address for admission correspondence.');
      return;
    }

    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 7) {
      setErrorMsg('Please enter a valid contact phone number (at least 7 digits).');
      return;
    }

    const generatedRef = `AIA-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setSubmittedRef(generatedRef);
  };

  const handleReset = () => {
    setStudentName('');
    setGuardianName('');
    setEmail('');
    setPhone('');
    setNotes('');
    setErrorMsg('');
    setSubmittedRef(null);
  };

  return (
    <section
      id="admissions"
      className="py-16 sm:py-24 bg-[#F2ECE0] islamic-lattice-light border-b border-[#E4DDD0]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#8A6518] mb-2">
            Session 2026–2027 · Class 1 to Class 12
          </p>
          <h2
            className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#06281E] tracking-tight mb-4"
            style={{ textWrap: 'balance' }}
          >
            Admissions &amp; Enrollment Inquiry
          </h2>
          <GeometricDivider />
          <p className="text-sm sm:text-base text-[#465B52] leading-relaxed mt-4">
            Begin your child’s academic and spiritual journey at As-Siddique Islamic Academy.
            Our Admissions Office responds within two working days to schedule a campus tour or
            online placement interaction.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left: 4-Step Pathway */}
          <div className="lg:col-span-5 bg-white border border-[#DED5C3] rounded-xl p-6 sm:p-8">
            <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#06281E] mb-2">
              Four-Step Admission Process
            </h3>
            <p className="text-sm text-[#5A6D64] pb-5 border-b border-[#EFE9DC]">
              Transparent, merit-conscious enrollment for both Day Scholars and Live Online
              students.
            </p>

            <div className="divide-y divide-[#EFE9DC] mt-2">
              {ADMISSION_STEPS.map((step) => (
                <div key={step.index} className="py-4">
                  <h4 className="font-serif text-xl font-semibold text-[#06281E] mb-1">
                    <span className="text-[#8A6518] mr-2 tabular-nums">{step.index}</span>
                    {step.title}
                  </h4>
                  <p className="text-sm text-[#465B52] leading-relaxed">{step.detail}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-5 border-t border-[#EFE9DC] text-xs text-[#465B52] space-y-1">
              <p className="font-semibold text-[#06281E] uppercase tracking-wider">
                Admissions Office Hours
              </p>
              <p className="tabular-nums">Monday – Saturday · 08:30 AM to 03:30 PM</p>
              <p>Scholarships &amp; Sibling Concessions available upon assessment.</p>
            </div>
          </div>

          {/* Right: Validated Admissions Inquiry Form */}
          <div className="lg:col-span-7 bg-white border border-[#DED5C3] rounded-xl p-6 sm:p-8">
            {submittedRef ? (
              <div className="py-8 text-center max-w-md mx-auto">
                <CheckCircle2
                  className="w-12 h-12 text-[#093B2C] mx-auto mb-4"
                  aria-hidden="true"
                />
                <p className="text-xs font-semibold uppercase tracking-widest text-[#8A6518] mb-1">
                  Inquiry Recorded · Ref <span className="tabular-nums">{submittedRef}</span>
                </p>
                <h3 className="font-serif text-3xl font-semibold text-[#06281E] mb-3">
                  JazakAllahu Khayran for Your Inquiry
                </h3>
                <p className="text-sm text-[#465B52] leading-relaxed mb-6">
                  We have received the admission request for{' '}
                  <span className="font-semibold text-[#06281E]">{studentName}</span> (
                  {applyingClass} · {studyMode}). Our Registrar will contact{' '}
                  <span className="font-semibold text-[#06281E]">{guardianName}</span> at{' '}
                  <span className="font-medium text-[#06281E]">{email}</span> shortly to arrange
                  next steps.
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-5 py-2.5 text-sm font-semibold text-[#FAF7F0] bg-[#093B2C] hover:bg-[#06281E] rounded-lg transition-colors cursor-pointer"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div className="pb-3 border-b border-[#EFE9DC]">
                  <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#06281E]">
                    Request Admission Prospectus &amp; Assessment
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5A6D64] mt-1">
                    Fill out the form below to reserve an assessment slot for the 2026–2027 session.
                  </p>
                </div>

                {errorMsg && (
                  <div
                    role="alert"
                    className="p-3.5 rounded-lg bg-[#FDF2F2] border border-[#E5B4B4] text-sm text-[#7F1D1D]"
                  >
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="student-name"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#2E473D] mb-1.5"
                    >
                      Student Full Name *
                    </label>
                    <input
                      id="student-name"
                      type="text"
                      required
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="e.g. Yusuf Abdullah"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F0] border border-[#D8CEBC] rounded-lg text-[#12241D] focus:outline-none focus:border-[#093B2C]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="guardian-name"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#2E473D] mb-1.5"
                    >
                      Parent / Guardian Name *
                    </label>
                    <input
                      id="guardian-name"
                      type="text"
                      required
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      placeholder="e.g. Dr. Abdullah Rahman"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F0] border border-[#D8CEBC] rounded-lg text-[#12241D] focus:outline-none focus:border-[#093B2C]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="applying-class"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#2E473D] mb-1.5"
                    >
                      Applying For Grade *
                    </label>
                    <select
                      id="applying-class"
                      value={applyingClass}
                      onChange={(e) => setApplyingClass(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F0] border border-[#D8CEBC] rounded-lg text-[#12241D] focus:outline-none focus:border-[#093B2C]"
                    >
                      {CLASS_OPTIONS.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <span className="block text-xs font-semibold uppercase tracking-wider text-[#2E473D] mb-1.5">
                      Preferred Study Mode *
                    </span>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-[#FAF7F0] border border-[#D8CEBC] rounded-lg">
                      {(['On-Campus', 'Live Online Classes'] as const).map((mode) => {
                        const active = studyMode === mode;
                        return (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => setStudyMode(mode)}
                            className={`py-2 px-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                              active
                                ? 'bg-[#093B2C] text-[#FAF7F0]'
                                : 'text-[#465B52] hover:text-[#06281E]'
                            }`}
                          >
                            {mode === 'Live Online Classes' ? 'Live Online' : 'On-Campus'}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="guardian-email"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#2E473D] mb-1.5"
                    >
                      Email Address *
                    </label>
                    <input
                      id="guardian-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="parent@example.com"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F0] border border-[#D8CEBC] rounded-lg text-[#12241D] focus:outline-none focus:border-[#093B2C]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="guardian-phone"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#2E473D] mb-1.5"
                    >
                      Contact Phone / WhatsApp *
                    </label>
                    <input
                      id="guardian-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F0] border border-[#D8CEBC] rounded-lg text-[#12241D] focus:outline-none focus:border-[#093B2C]"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="admission-notes"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#2E473D] mb-1.5"
                  >
                    Previous School / Hifz Background (Optional)
                  </label>
                  <textarea
                    id="admission-notes"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Share any prior Quranic memorization, transfer details, or questions for our Registrar..."
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F0] border border-[#D8CEBC] rounded-lg text-[#12241D] focus:outline-none focus:border-[#093B2C]"
                  />
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                  <p className="text-xs text-[#5A6D64]">
                    All inquiries are handled confidentially by the Office of the Registrar.
                  </p>
                  <button
                    type="submit"
                    className="px-6 py-3 text-sm font-semibold text-[#FAF7F0] bg-[#093B2C] hover:bg-[#06281E] border border-[#C9A449]/40 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#093B2C]"
                  >
                    Submit Admission Inquiry
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
