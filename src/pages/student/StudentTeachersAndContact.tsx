import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  GraduationCap,
  LogIn,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { TeacherPhoto } from '../../components/TeacherPhoto';
import {
  InstitutionSettings,
  TeacherRecord,
  UserRole,
} from '../../types/platform';

interface StudentTeachersAndContactProps {
  mode: 'teachers' | 'contact';
  settings: InstitutionSettings;
  teachers: TeacherRecord[];
  isSignedIn: boolean;
  userUid?: string;
  userName?: string;
  userRole?: UserRole;
  upsertRecord: (
    collectionName: string,
    id: string,
    data: Record<string, unknown>,
    auditDetail?: string
  ) => Promise<void>;
}

export const StudentTeachersAndContact: React.FC<StudentTeachersAndContactProps> = ({
  mode,
  settings,
  teachers,
  isSignedIn,
  userUid,
  userName,
  userRole,
  upsertRecord,
}) => {
  const [deptFilter, setDeptFilter] = useState<'all' | 'islamic' | 'general'>('all');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [subjectLine, setSubjectLine] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sentNotice, setSentNotice] = useState('');
  const [errorNotice, setErrorNotice] = useState('');

  const visibleTeachers = useMemo(
    () =>
      teachers.filter((t) => {
        if (t.status === 'inactive') return false;
        if (deptFilter === 'all') return true;
        return t.department === deptFilter || t.department === 'both';
      }),
    [teachers, deptFilter]
  );

  const selectedTeacher = useMemo(
    () => visibleTeachers.find((t) => t.id === selectedTeacherId) || null,
    [visibleTeachers, selectedTeacherId]
  );

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSentNotice('');
    setErrorNotice('');
    if (!isSignedIn || !userUid) {
      setErrorNotice('Please sign in first to send a direct message to faculty.');
      return;
    }
    const combined = subjectLine.trim()
      ? `[${subjectLine.trim()}] ${messageBody.trim()}`
      : messageBody.trim();
    if (combined.length < 4) {
      setErrorNotice('Please enter a message of at least 4 characters.');
      return;
    }
    setSubmitting(true);
    try {
      const id = `support-${Date.now()}`;
      await upsertRecord(
        'lmsQa',
        id,
        {
          courseId: 'support-desk',
          lessonId: 'general',
          authorUid: userUid,
          authorName: userName || 'Student',
          authorRole: userRole || 'student',
          question: combined.slice(0, 1400),
          createdAt: new Date().toISOString(),
        },
        'Submitted student portal support inquiry'
      );
      setSubjectLine('');
      setMessageBody('');
      setSentNotice('Your inquiry has been saved to the Faculty Support Desk.');
    } catch (err) {
      setErrorNotice(err instanceof Error ? err.message : 'Unable to send message.');
    } finally {
      setSubmitting(false);
    }
  };

  if (mode === 'teachers') {
    return (
      <div className="space-y-6">
        <section className="rounded-2xl bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8A6518] dark:text-[#D9AD43]">
                Verified Academy Educators
              </p>
              <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#06452C] dark:text-white">
                Scholars &amp; Subject Teachers ({visibleTeachers.length})
              </h1>
            </div>

            <div className="flex flex-wrap gap-2">
              {(['all', 'islamic', 'general'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDeptFilter(d)}
                  className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                    deptFilter === d
                      ? 'bg-[#06452C] text-[#F8F1DF]'
                      : 'bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 text-[#06452C] dark:text-[#DED7C5]'
                  }`}
                >
                  {d === 'all' ? 'All Faculty' : d === 'islamic' ? 'Islamic Wing' : 'General Wing'}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleTeachers.map((t) => {
            const expanded = selectedTeacher?.id === t.id;
            return (
              <article
                key={t.id}
                className="rounded-2xl bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 overflow-hidden shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="h-52 w-full bg-[#06452C] overflow-hidden relative">
                    <TeacherPhoto
                      photoUrl={t.photoUrl}
                      name={t.name}
                      className="w-full h-full object-cover object-top"
                      emblemClassName="w-16 h-16"
                    />
                  </div>
                  <div className="p-5 space-y-2.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#8A6518] dark:text-[#D9AD43]">
                      {t.department === 'islamic'
                        ? 'Islamic Wing'
                        : t.department === 'general'
                        ? 'General Wing'
                        : 'Dual Wing'}
                    </p>
                    <h2 className="font-serif text-xl font-semibold text-[#06452C] dark:text-white">
                      {t.name}
                    </h2>
                    <p className="text-xs font-semibold text-[#314A3F] dark:text-[#E6DFCE]">
                      {t.designation}
                    </p>
                    <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5]">
                      {t.qualification}
                    </p>
                    <div className="pt-1 flex flex-wrap gap-1.5">
                      {t.assignedSubjects.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="text-[11px] px-2 py-0.5 rounded bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/25 text-[#06452C] dark:text-[#D9AD43]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    <p
                      className={`text-xs text-[#314A3F] dark:text-[#E6DFCE] leading-relaxed pt-1 ${
                        expanded ? '' : 'line-clamp-2'
                      }`}
                    >
                      {t.bio}
                    </p>
                    {expanded && (
                      <div className="pt-2 border-t border-[#D9AD43]/20 text-[11px] text-[#5A6D64] dark:text-[#DED7C5] space-y-1">
                        <p className="inline-flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-[#D9AD43]" />
                          <span>Classes: {t.assignedClasses.join(', ') || 'All Classes'}</span>
                        </p>
                        {t.email && (
                          <p className="inline-flex items-center gap-1.5 block">
                            <Mail className="w-3.5 h-3.5 text-[#D9AD43]" />
                            <span>{t.email}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-5 pb-5">
                  <button
                    type="button"
                    onClick={() => setSelectedTeacherId(expanded ? null : t.id)}
                    className="w-full min-h-[42px] px-4 py-2 rounded-xl bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35 text-xs font-semibold text-[#06452C] dark:text-[#D9AD43] cursor-pointer"
                  >
                    {expanded ? 'Hide Profile Details' : 'View Classes & Profile'}
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 p-5 sm:p-6 space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8A6518] dark:text-[#D9AD43]">
          Academic &amp; Technical Helpdesk
        </p>
        <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#06452C] dark:text-white">
          Contact Academy &amp; Faculty Support
        </h1>
        <p className="text-xs sm:text-sm text-[#5A6D64] dark:text-[#DED7C5]">
          Reach out for lesson clarifications, quiz unlock queries, fee receipts, or live class
          support.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Official Campus Coordinates */}
        <section className="lg:col-span-5 rounded-2xl bg-[#06452C] text-[#F8F1DF] border border-[#D9AD43]/40 p-6 space-y-4">
          <div className="flex items-center gap-2 text-[#D9AD43]">
            <Users className="w-5 h-5" />
            <h2 className="font-serif text-xl font-semibold text-white">Academy Office</h2>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-[#E6DFCE]">
            <p className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#D9AD43] shrink-0 mt-0.5" />
              <span>{settings.address}</span>
            </p>
            <p className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-[#D9AD43] shrink-0" />
              <span>{settings.phone}</span>
            </p>
            <p className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-[#D9AD43] shrink-0" />
              <span>{settings.email}</span>
            </p>
            <p className="flex items-start gap-2.5">
              <BookOpen className="w-4 h-4 text-[#D9AD43] shrink-0 mt-0.5" />
              <span>
                Principal: {settings.principalName} · {settings.boardName}
              </span>
            </p>
          </div>

          <div className="pt-3 border-t border-[#D9AD43]/25">
            <Link
              to="/contact"
              className="min-h-[42px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D9AD43] text-[#102D23] font-bold text-xs"
            >
              <span>Open Public Campus Contact Page</span>
            </Link>
          </div>
        </section>

        {/* Student Helpdesk Inquiry Form */}
        <section className="lg:col-span-7 rounded-2xl bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#06452C] dark:text-[#D9AD43]" />
            <h2 className="font-serif text-xl font-semibold text-[#06452C] dark:text-white">
              Send Inquiry to Faculty Desk
            </h2>
          </div>

          {!isSignedIn ? (
            <div className="p-5 rounded-xl bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 space-y-3">
              <p className="text-xs text-[#314A3F] dark:text-[#E6DFCE]">
                Sign in with your verified student account to send direct messages to the faculty
                and administration support desk.
              </p>
              <Link
                to="/login?next=/student"
                className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#06452C] text-[#F8F1DF] text-xs font-semibold"
              >
                <LogIn className="w-4 h-4 text-[#D9AD43]" />
                <span>Sign In to Send Message</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSupportSubmit} className="space-y-4">
              {sentNotice && (
                <div className="p-3 rounded-xl bg-[#DCFCE7] border border-[#16A34A]/40 text-xs font-semibold text-[#166534] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{sentNotice}</span>
                </div>
              )}
              {errorNotice && (
                <div className="p-3 rounded-xl bg-[#FEE2E2] border border-[#DC2626]/40 text-xs font-semibold text-[#991B1B]">
                  {errorNotice}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#06452C] dark:text-[#E6DFCE] mb-1.5">
                  Subject / Topic
                </label>
                <input
                  type="text"
                  value={subjectLine}
                  onChange={(e) => setSubjectLine(e.target.value)}
                  placeholder="e.g., Tajweed Lesson 02 question or Admission No. link"
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#D9AD43]/40 bg-[#F8F1DF]/60 dark:bg-[#081A14] text-sm text-[#102D23] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#06452C] dark:text-[#E6DFCE] mb-1.5">
                  Message Details
                </label>
                <textarea
                  rows={4}
                  required
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  placeholder="Write your question clearly for our teachers or academy office..."
                  className="w-full p-3.5 rounded-xl border border-[#D9AD43]/40 bg-[#F8F1DF]/60 dark:bg-[#081A14] text-sm text-[#102D23] dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="min-h-[46px] inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#06452C] hover:bg-[#102D23] text-[#F8F1DF] text-sm font-semibold cursor-pointer disabled:opacity-60"
              >
                <Send className="w-4 h-4 text-[#D9AD43]" />
                <span>{submitting ? 'Sending...' : 'Send Support Message'}</span>
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
};
