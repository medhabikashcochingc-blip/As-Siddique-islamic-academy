import React, { useState } from 'react';
import { ArrowLeft, Download, Printer, Search, ShieldCheck } from 'lucide-react';
import { AcademyEmblem } from '../components/AcademyEmblem';
import { usePlatform } from '../context/PlatformContext';
import { downloadMarksheetPdf } from '../lib/pdfGenerator';
import { PublishedResult } from '../types/platform';

export const ResultPortalPage: React.FC = () => {
  const { results, classes, sessions, settings } = usePlatform();

  const [studentName, setStudentName] = useState('');
  const [rollNumber, setRollNumber] = useState('1001');
  const [classId, setClassId] = useState('Class 10');
  const [sessionId, setSessionId] = useState(sessions[0]?.name || '2026–2027');
  const [foundResult, setFoundResult] = useState<PublishedResult | null>(null);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSearching(true);

    try {
      const verifyResp = await fetch('/api/results/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rollNumber, classId, sessionId, studentName }),
      });

      const verifyData = await verifyResp.json();
      if (!verifyResp.ok || !verifyData.verified) {
        setErrorMsg(verifyData.error || 'Result verification failed.');
        setSearching(false);
        return;
      }

      const match = results.find(
        (r) =>
          r.isPublished &&
          r.rollNumber.trim().toUpperCase() === verifyData.normalizedRoll &&
          r.classId === verifyData.classId &&
          r.sessionId === verifyData.sessionId &&
          (!studentName.trim() ||
            r.studentName.toLowerCase().includes(studentName.trim().toLowerCase()))
      );

      if (!match) {
        setErrorMsg(
          'No approved published marksheet matched those exact Roll Number, Class, and Session details. Demo sample available: Roll 1001 · Class 10 · 2026–2027.'
        );
        setFoundResult(null);
      } else {
        setVerificationToken(verifyData.verificationToken);
        setFoundResult(match);
      }
    } catch {
      setErrorMsg('Unable to reach server-side verification endpoint.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-[#0B1F3A] text-[#F8F1DF] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {!foundResult ? (
          <div className="bg-[#102A4C] border border-[#D9AD43]/50 rounded-xl p-7 sm:p-10 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <AcademyEmblem className="w-10 h-10 shrink-0" variant="gold-on-emerald" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#D9AD43]">
                  Standalone Examination Result Portal
                </p>
                <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-white">
                  {settings.name}
                </h1>
              </div>
            </div>
            <p className="text-sm text-[#D7E0EC] mb-6">
              Enter Student Roll Number, Class, and Academic Session. Queries are verified
              server-side and display only formally approved results without exposing private
              personal details.
            </p>

            {errorMsg && (
              <div className="mb-5 p-4 rounded-lg bg-[#3B1219] border border-[#F87171]/40 text-sm text-[#FECACA]">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-[#D9AD43] mb-1">
                  Roll Number *
                </label>
                <input
                  type="text"
                  required
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="e.g. 1001"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#0B1F3A] border border-[#D9AD43]/40 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#D9AD43] mb-1">
                  Student Name (Optional Filter)
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Optional verification name"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#0B1F3A] border border-[#D9AD43]/40 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#D9AD43] mb-1">
                  Class *
                </label>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#0B1F3A] border border-[#D9AD43]/40 rounded-lg text-white"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#D9AD43] mb-1">
                  Academic Session *
                </label>
                <select
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#0B1F3A] border border-[#D9AD43]/40 rounded-lg text-white"
                >
                  {sessions.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 pt-2 flex flex-wrap items-center justify-between gap-4">
                <span className="text-xs text-[#D7E0EC] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#D9AD43]" />
                  Demo sample ready: Roll <strong className="text-[#D9AD43]">1001</strong> · Class 10
                </span>
                <button
                  type="submit"
                  disabled={searching}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-[#D9AD43] hover:bg-[#c79b32] text-[#0B1F3A] rounded-lg cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>{searching ? 'Verifying...' : 'Search Approved Result'}</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Premium Navy-Blue & Royal-Gold Marksheet */
          <div className="bg-white text-[#0B1F3A] border-4 border-[#D9AD43] rounded-xl overflow-hidden shadow-2xl">
            <div className="bg-[#0B1F3A] text-[#F8F1DF] px-6 sm:px-10 py-7 border-b-2 border-[#D9AD43] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <AcademyEmblem className="w-12 h-12 shrink-0" variant="gold-on-emerald" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#D9AD43]">
                    {settings.tagline} · {settings.location}
                  </p>
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                    {settings.name}
                  </h1>
                  <p className="text-xs text-[#D7E0EC] mt-0.5">{foundResult.examTitle}</p>
                </div>
              </div>
              <div className="text-left sm:text-right text-xs">
                <p className="text-[#D9AD43] font-semibold">OFFICIAL MARKSHEET</p>
                <p className="tabular-nums text-[#D7E0EC]">Verify ID: {verificationToken}</p>
              </div>
            </div>

            <div className="p-6 sm:p-10">
              {/* Student Header Info */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 pb-6 border-b border-[#D9AD43]/40 mb-6 items-center">
                <div className="sm:col-span-9 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-slate-500">Student Name</p>
                    <p className="font-semibold text-[#0B1F3A]">{foundResult.studentName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Father’s Name</p>
                    <p className="font-semibold text-[#0B1F3A]">{foundResult.fatherName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Admission No.</p>
                    <p className="font-semibold tabular-nums">{foundResult.admissionNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Roll Number</p>
                    <p className="font-semibold tabular-nums">{foundResult.rollNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Class</p>
                    <p className="font-semibold">{foundResult.classId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Academic Session</p>
                    <p className="font-semibold tabular-nums">{foundResult.sessionId}</p>
                  </div>
                </div>
                <div className="sm:col-span-3 flex sm:justify-end">
                  <div className="w-24 h-28 rounded-lg border-2 border-[#D9AD43] bg-[#F8F1DF] flex flex-col items-center justify-center text-center p-2">
                    <AcademyEmblem className="w-8 h-8 mb-1" variant="emerald-on-cream" />
                    <span className="text-[10px] font-semibold text-[#0B1F3A]">
                      Student Photo
                    </span>
                  </div>
                </div>
              </div>

              {/* Subject-wise Marks Table */}
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm border border-[#0B1F3A]/20">
                  <thead>
                    <tr className="bg-[#0B1F3A] text-[#D9AD43] text-left">
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Stream</th>
                      <th className="py-3 px-4 text-right">Full Marks</th>
                      <th className="py-3 px-4 text-right">Pass Marks</th>
                      <th className="py-3 px-4 text-right">Obtained Marks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {foundResult.subjects.map((sub) => (
                      <tr key={sub.subjectName} className="odd:bg-[#F8F1DF]/40">
                        <td className="py-2.5 px-4 font-medium">{sub.subjectName}</td>
                        <td className="py-2.5 px-4 capitalize text-slate-600">{sub.track}</td>
                        <td className="py-2.5 px-4 text-right tabular-nums">{sub.fullMarks}</td>
                        <td className="py-2.5 px-4 text-right tabular-nums">{sub.passMarks}</td>
                        <td className="py-2.5 px-4 text-right font-semibold tabular-nums">
                          {sub.obtainedMarks}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-[#0B1F3A] text-[#F8F1DF] mb-6">
                <div>
                  <p className="text-xs text-[#D9AD43]">Total Marks</p>
                  <p className="text-xl font-bold tabular-nums">
                    {foundResult.totalMarks} / {foundResult.fullMarks}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#D9AD43]">Percentage</p>
                  <p className="text-xl font-bold tabular-nums">
                    {foundResult.percentage.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#D9AD43]">Grade</p>
                  <p className="text-xl font-bold">{foundResult.grade}</p>
                </div>
                <div>
                  <p className="text-xs text-[#D9AD43]">Result Status</p>
                  <p className="text-xl font-bold">{foundResult.resultStatus}</p>
                </div>
              </div>

              <p className="text-sm text-slate-700 mb-8">
                <strong>Teacher Remarks:</strong> {foundResult.remarks}
              </p>

              {/* Signatures & Seal */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-200 text-xs text-slate-600">
                <div className="text-center">
                  <div className="w-40 border-b border-slate-400 mb-1" />
                  <p>Controller of Examinations</p>
                </div>
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#D9AD43] flex items-center justify-center text-center font-semibold text-[#0B1F3A] p-2">
                  OFFICIAL SEAL
                </div>
                <div className="text-center">
                  <div className="w-40 border-b border-slate-400 mb-1" />
                  <p>Principal ({settings.principalName})</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="no-print mt-8 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setFoundResult(null)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border border-[#0B1F3A]/30 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Search</span>
                </button>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border border-[#0B1F3A] text-[#0B1F3A] rounded-lg hover:bg-slate-100 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadMarksheetPdf(foundResult, settings)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-[#0B1F3A] text-[#D9AD43] rounded-lg hover:bg-[#14325B] cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
