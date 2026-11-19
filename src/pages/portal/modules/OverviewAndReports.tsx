import React, { useMemo, useState } from 'react';
import { BarChart3, BookOpen, CreditCard, Download, GraduationCap, Users } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { usePlatform } from '../../../context/PlatformContext';
import { exportCsvReport } from '../../../lib/pdfGenerator';

export const OverviewAndReports: React.FC<{ initialTab?: 'overview' | 'reports' }> = ({
  initialTab = 'overview',
}) => {
  const {
    students,
    admissions,
    teachers,
    invoices,
    payments,
    attendance,
    courses,
    classes,
    sessions,
    results,
    seedDemoData,
    isSeedingDemo,
    integrations,
  } = usePlatform();
  const { effectiveRole } = useAuth();

  const [tab, setTab] = useState<'overview' | 'reports'>(initialTab);
  const [filterClass, setFilterClass] = useState('All');
  const [filterSession, setFilterSession] = useState(sessions[0]?.name || '2026–2027');

  const stats = useMemo(() => {
    const activeStudents = students.filter((s) => s.status === 'active');
    const pendingAdm = admissions.filter((a) => a.status === 'Pending' || a.status === 'Under Review');
    const totalCollected = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalDues = invoices.reduce(
      (sum, inv) => sum + Math.max(0, (inv.amount || 0) - (inv.discountAmount || 0) - (inv.paidAmount || 0)),
      0
    );
    const presentCount = attendance.filter((a) => a.status === 'Present').length;
    const attendanceRate = attendance.length
      ? Math.round((presentCount / attendance.length) * 100)
      : 0;

    return {
      activeStudents: activeStudents.length,
      pendingAdm: pendingAdm.length,
      totalCollected,
      totalDues,
      attendanceRate,
      teacherCount: teachers.length,
      courseCount: courses.length,
    };
  }, [students, admissions, payments, invoices, attendance, teachers, courses]);

  const classDistribution = useMemo(() => {
    return classes.map((c) => ({
      name: c.name,
      count: students.filter((s) => s.classId === c.name && s.status === 'active').length,
    }));
  }, [classes, students]);

  const maxClassCount = Math.max(1, ...classDistribution.map((d) => d.count));

  const filteredStudents = students.filter(
    (s) =>
      (filterClass === 'All' || s.classId === filterClass) &&
      (!filterSession || s.sessionId === filterSession)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#8A6518] dark:text-[#D9AD43]">
            Live Cloud Firestore Analytics
          </p>
          <h1 className="font-serif text-3xl font-semibold text-[#06452C] dark:text-white">
            {tab === 'overview' ? 'Institutional Dashboard' : 'Reports & Analytics'}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setTab('overview')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg border cursor-pointer ${
              tab === 'overview'
                ? 'bg-[#06452C] text-white border-[#06452C]'
                : 'bg-white dark:bg-[#102D23] border-[#D9AD43]/35'
            }`}
          >
            Dashboard Overview
          </button>
          <button
            type="button"
            onClick={() => setTab('reports')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg border cursor-pointer ${
              tab === 'reports'
                ? 'bg-[#06452C] text-white border-[#06452C]'
                : 'bg-white dark:bg-[#102D23] border-[#D9AD43]/35'
            }`}
          >
            Reports &amp; Exports
          </button>
          {['super_admin', 'admin'].includes(effectiveRole || '') && (
            <button
              type="button"
              disabled={isSeedingDemo}
              onClick={() => void seedDemoData()}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#D9AD43] text-[#102D23] hover:bg-[#c79b32] cursor-pointer"
            >
              {isSeedingDemo ? 'Syncing Demo Data...' : 'Sync Demo Dataset to Firestore'}
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-[#8A6518] dark:text-[#D9AD43] mb-2">
            <span>Active Students</span>
            <GraduationCap className="w-4 h-4" />
          </div>
          <p className="font-serif text-3xl font-semibold text-[#06452C] dark:text-white tabular-nums">
            {stats.activeStudents}
          </p>
          <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5] mt-1">
            Pending Admissions: <span className="tabular-nums font-semibold">{stats.pendingAdm}</span>
          </p>
        </div>

        <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-[#8A6518] dark:text-[#D9AD43] mb-2">
            <span>Fee Collection</span>
            <CreditCard className="w-4 h-4" />
          </div>
          <p className="font-serif text-3xl font-semibold text-[#06452C] dark:text-white tabular-nums">
            ₹{stats.totalCollected.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5] mt-1 tabular-nums">
            Outstanding Dues: ₹{stats.totalDues.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-[#8A6518] dark:text-[#D9AD43] mb-2">
            <span>Attendance Rate</span>
            <Users className="w-4 h-4" />
          </div>
          <p className="font-serif text-3xl font-semibold text-[#06452C] dark:text-white tabular-nums">
            {stats.attendanceRate}%
          </p>
          <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5] mt-1 tabular-nums">
            Faculty Members: {stats.teacherCount}
          </p>
        </div>

        <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-[#8A6518] dark:text-[#D9AD43] mb-2">
            <span>LMS &amp; Results</span>
            <BookOpen className="w-4 h-4" />
          </div>
          <p className="font-serif text-3xl font-semibold text-[#06452C] dark:text-white tabular-nums">
            {stats.courseCount} Courses
          </p>
          <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5] mt-1 tabular-nums">
            Published Results: {results.filter((r) => r.isPublished).length}
          </p>
        </div>
      </div>

      {tab === 'overview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Class-wise Enrollment Chart */}
          <div className="lg:col-span-7 bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-2xl font-semibold text-[#06452C] dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#D9AD43]" />
                <span>Class 1–12 Enrollment Distribution</span>
              </h2>
              <span className="text-xs text-[#5A6D64] dark:text-[#DED7C5]">Live Student Count</span>
            </div>
            <div className="space-y-2.5">
              {classDistribution.map((row) => (
                <div key={row.name} className="flex items-center gap-3 text-xs">
                  <span className="w-20 font-medium tabular-nums">{row.name}</span>
                  <div className="flex-1 h-4 bg-[#F8F1DF] dark:bg-[#081A14] rounded overflow-hidden">
                    <div
                      className="h-full bg-[#06452C] dark:bg-[#D9AD43] rounded"
                      style={{ width: `${Math.max(4, (row.count / maxClassCount) * 100)}%` }}
                    />
                  </div>
                  <span className="w-8 text-right font-semibold tabular-nums">{row.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Server Integration Status */}
          <div className="lg:col-span-5 bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-6">
            <h2 className="font-serif text-2xl font-semibold text-[#06452C] dark:text-white mb-4">
              External Integration Status
            </h2>
            <div className="space-y-3 text-xs">
              {[
                { label: 'Payment Gateway', data: integrations?.paymentGateway },
                { label: 'Email Dispatch (SMTP)', data: integrations?.emailNotifications },
                { label: 'SMS Alerts (Twilio)', data: integrations?.smsNotifications },
                { label: 'Video Conferencing', data: integrations?.videoConferencing },
              ].map((item) => (
                <div
                  key={item.label}
                  className="p-3.5 rounded-lg bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/25"
                >
                  <div className="flex items-center justify-between font-semibold mb-1">
                    <span>{item.label}</span>
                    <span
                      className={
                        item.data?.configured ? 'text-[#06452C] dark:text-[#4ADE80]' : 'text-[#8A6518] dark:text-[#D9AD43]'
                      }
                    >
                      {item.data?.configured ? 'Configured' : 'Not Configured'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5A6D64] dark:text-[#DED7C5]">
                    Provider: {item.data?.provider || 'Not Configured'} · Required Env:{' '}
                    {item.data?.requiredEnv.join(', ') || 'Check .env.example'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Reports Tab with Class & Session Filters + CSV Export */
        <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#EFE6D2] dark:border-[#D9AD43]/20">
            <div className="flex flex-wrap gap-3">
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35 rounded-lg"
              >
                <option value="All">All Classes (1–12)</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select
                value={filterSession}
                onChange={(e) => setFilterSession(e.target.value)}
                className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35 rounded-lg"
              >
                {sessions.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  exportCsvReport(
                    'Students_Dual_Progress_Report.csv',
                    ['Student ID', 'Name', 'Class', 'Mode', 'Quran Surah', 'Tajweed', 'Hifz Juz'],
                    filteredStudents.map((s) => [
                      s.studentId,
                      s.name,
                      s.classId,
                      s.learningMode,
                      s.islamicProgress.quranSurah,
                      s.islamicProgress.tajweedGrade,
                      s.islamicProgress.hifzJuzCompleted,
                    ])
                  )
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#06452C] text-white rounded-lg cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Student &amp; Islamic CSV</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  exportCsvReport(
                    'Finance_Collection_Report.csv',
                    ['Receipt No', 'Student', 'Amount', 'Method', 'Paid Date'],
                    payments.map((p) => [p.receiptNumber, p.studentName, p.amount, p.method, p.paidAt])
                  )
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-[#06452C] text-[#06452C] dark:text-[#D9AD43] dark:border-[#D9AD43] rounded-lg cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Finance CSV</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-[#EFE6D2] dark:border-[#D9AD43]/20 text-xs uppercase text-[#8A6518] dark:text-[#D9AD43]">
                  <th className="py-2.5 pr-4">Student</th>
                  <th className="py-2.5 pr-4">Class</th>
                  <th className="py-2.5 pr-4">Mode</th>
                  <th className="py-2.5 pr-4">Quran &amp; Tajweed</th>
                  <th className="py-2.5">Hifz Juz</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE6D2] dark:divide-[#D9AD43]/15">
                {filteredStudents.map((s) => (
                  <tr key={s.id}>
                    <td className="py-2.5 pr-4 font-medium">{s.name}</td>
                    <td className="py-2.5 pr-4">{s.classId}</td>
                    <td className="py-2.5 pr-4">{s.learningMode}</td>
                    <td className="py-2.5 pr-4">
                      {s.islamicProgress.quranSurah} ({s.islamicProgress.tajweedGrade})
                    </td>
                    <td className="py-2.5 tabular-nums">{s.islamicProgress.hifzJuzCompleted}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
