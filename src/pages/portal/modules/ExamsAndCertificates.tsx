import React, { useState } from 'react';
import { Award, CheckCircle2, Download, Plus } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { usePlatform } from '../../../context/PlatformContext';
import { downloadCertificatePdf, downloadMarksheetPdf } from '../../../lib/pdfGenerator';
import { hasPermission } from '../../../lib/permissions';
import { CertificateRecord, ExaminationRecord, PublishedResult } from '../../../types/platform';

export const ExamsAndCertificates: React.FC<{
  section: 'exams' | 'marks' | 'results' | 'marksheet' | 'certificates';
}> = ({ section }) => {
  const {
    examinations,
    students,
    results,
    certificates,
    classes,
    sessions,
    settings,
    upsertRecord,
  } = usePlatform();
  const { effectiveRole, userAccount } = useAuth();

  const [examTitle, setExamTitle] = useState('');
  const [examType, setExamType] = useState<ExaminationRecord['examType']>('Half-Yearly Examination');
  const [examClass, setExamClass] = useState('Class 10');

  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [genScore, setGenScore] = useState(84);
  const [mathScore, setMathScore] = useState(88);
  const [islScore, setIslScore] = useState(90);
  const [remarks, setRemarks] = useState('Commendable progress in both General and Islamic wings.');

  const [certType, setCertType] =
    useState<CertificateRecord['templateType']>('Bonafide Certificate');
  const [certStudentId, setCertStudentId] = useState(students[0]?.id || '');
  const [feedback, setFeedback] = useState('');

  const canApproveResults = hasPermission(effectiveRole || undefined, 'approve_results');

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = `EXAM-${Date.now().toString().slice(-6)}`;
    await upsertRecord('examinations', id, {
      title: examTitle,
      examType,
      sessionId: sessions[0]?.name || '2026–2027',
      classId: examClass,
      startDate: new Date().toISOString().slice(0, 10),
      status: 'marks_entry',
    });
    setExamTitle('');
    setFeedback(`Examination ${id} created.`);
  };

  const handleSaveMarksAndCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find((s) => s.id === selectedStudentId);
    if (!st) return;

    const total = Number(genScore) + Number(mathScore) + Number(islScore);
    const full = 300;
    const pct = (total / full) * 100;
    const grade = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 65 ? 'B' : pct >= 45 ? 'C' : 'D';
    const resultStatus: PublishedResult['resultStatus'] = pct >= 40 ? 'Passed' : 'Needs Improvement';

    const resId = `RES-${st.rollNumber}-${st.classId.replace(/\s+/g, '')}`;
    await upsertRecord('results', resId, {
      examId: examinations[0]?.id || 'EXAM-HY-2026',
      examTitle: examinations[0]?.title || 'Academy Assessment 2026–2027',
      studentName: st.name,
      fatherName: st.fatherName,
      admissionNumber: st.admissionNumber,
      rollNumber: st.rollNumber,
      classId: st.classId,
      sessionId: st.sessionId,
      subjects: [
        { subjectName: 'Bengali & English', track: 'general', fullMarks: 100, passMarks: 35, obtainedMarks: Number(genScore) },
        { subjectName: 'Mathematics & Science', track: 'general', fullMarks: 100, passMarks: 35, obtainedMarks: Number(mathScore) },
        { subjectName: 'Quran, Tajweed & Islamic Studies', track: 'islamic', fullMarks: 100, passMarks: 40, obtainedMarks: Number(islScore) },
      ],
      totalMarks: total,
      fullMarks: full,
      percentage: Number(pct.toFixed(2)),
      grade,
      resultStatus,
      remarks,
      isPublished: false,
    });
    setFeedback(`Marks calculated (${pct.toFixed(1)}% · Grade ${grade}) and staged for Principal/Admin approval.`);
  };

  const handleTogglePublish = async (res: PublishedResult) => {
    if (!canApproveResults) {
      setFeedback('Only Principal, Admin, or Super Admin may approve and publish results.');
      return;
    }
    await upsertRecord(
      'results',
      res.id,
      { ...res, isPublished: !res.isPublished },
      `${!res.isPublished ? 'Published' : 'Unpublished'} result for ${res.studentName}`
    );
    setFeedback(
      `${res.studentName} result is now ${!res.isPublished ? 'PUBLISHED on Public Portal' : 'Unpublished'}.`
    );
  };

  const handleIssueCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find((s) => s.id === certStudentId);
    if (!st) return;
    const certNo = `CERT-${Date.now().toString().slice(-6)}`;
    const cert: CertificateRecord = {
      id: certNo,
      certificateNumber: certNo,
      templateType: certType,
      studentId: st.studentId,
      studentName: st.name,
      issuedDate: new Date().toISOString().slice(0, 10),
      issuedBy: userAccount?.displayName || 'Office of the Registrar',
    };
    await upsertRecord('certificates', certNo, cert as unknown as Record<string, unknown>);
    setFeedback(`Issued ${certType} (${certNo}) for ${st.name}.`);
  };

  return (
    <div className="space-y-6">
      {feedback && (
        <div className="p-3 rounded-lg bg-[#06452C] text-[#F8F1DF] text-xs font-medium">
          {feedback}
        </div>
      )}

      {section === 'exams' && (
        <div className="space-y-5">
          <h1 className="font-serif text-3xl font-semibold text-[#06452C] dark:text-white">
            Examination Management
          </h1>
          <form
            onSubmit={handleCreateExam}
            className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-4 gap-3"
          >
            <input
              type="text"
              required
              placeholder="Exam Title"
              value={examTitle}
              onChange={(e) => setExamTitle(e.target.value)}
              className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
            />
            <select
              value={examType}
              onChange={(e) => setExamType(e.target.value as ExaminationRecord['examType'])}
              className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
            >
              <option>Unit Test</option>
              <option>Monthly Test</option>
              <option>Half-Yearly Examination</option>
              <option>Annual Examination</option>
              <option>Pre-Board Examination</option>
              <option>Class Test</option>
              <option>Islamic Education Assessment</option>
            </select>
            <select
              value={examClass}
              onChange={(e) => setExamClass(e.target.value)}
              className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
            >
              {classes.map((c) => (
                <option key={c.id}>{c.name}</option>
              ))}
            </select>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1 px-4 py-2 text-xs font-semibold bg-[#06452C] text-white rounded-lg cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Examination</span>
            </button>
          </form>

          <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl divide-y divide-[#EFE6D2] dark:divide-[#D9AD43]/15">
            {examinations.map((ex) => (
              <div key={ex.id} className="p-4 flex flex-wrap justify-between gap-2 text-sm">
                <div>
                  <p className="font-semibold">{ex.title}</p>
                  <p className="text-xs text-[#5A6D64]">
                    {ex.examType} · {ex.classId} · {ex.sessionId} · Starts {ex.startDate}
                  </p>
                </div>
                <span className="text-xs font-semibold uppercase text-[#8A6518] dark:text-[#D9AD43]">
                  {ex.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {section === 'marks' && (
        <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-6 max-w-2xl">
          <h1 className="font-serif text-3xl font-semibold text-[#06452C] dark:text-white mb-4">
            Dual-Track Marks Entry
          </h1>
          <form onSubmit={handleSaveMarksAndCalculate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase mb-1">Student</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (Roll {s.rollNumber} · {s.classId})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase mb-1">
                  Bengali &amp; English (/100)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={genScore}
                  onChange={(e) => setGenScore(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase mb-1">
                  Math &amp; Science (/100)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={mathScore}
                  onChange={(e) => setMathScore(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase mb-1">
                  Islamic &amp; Quran (/100)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={islScore}
                  onChange={(e) => setIslScore(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase mb-1">Teacher Remarks</label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-semibold bg-[#06452C] text-white rounded-lg cursor-pointer"
            >
              Calculate Grade &amp; Save Marks
            </button>
          </form>
        </div>
      )}

      {(section === 'results' || section === 'marksheet') && (
        <div className="space-y-5">
          <h1 className="font-serif text-3xl font-semibold text-[#06452C] dark:text-white">
            {section === 'marksheet'
              ? 'Official Navy-Blue & Gold Marksheets'
              : 'Result Approval & Publication'}
          </h1>
          <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-[#EFE6D2] text-xs uppercase text-[#8A6518]">
                  <th className="p-4">Roll / Class</th>
                  <th className="p-4">Student</th>
                  <th className="p-4">Score &amp; Grade</th>
                  <th className="p-4">Publication</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE6D2] dark:divide-[#D9AD43]/15">
                {results.map((r) => (
                  <tr key={r.id}>
                    <td className="p-4 text-xs tabular-nums">
                      <p className="font-semibold">Roll {r.rollNumber}</p>
                      <p>{r.classId}</p>
                    </td>
                    <td className="p-4 font-semibold">{r.studentName}</td>
                    <td className="p-4 text-xs tabular-nums">
                      {r.totalMarks}/{r.fullMarks} ({r.percentage}%) · Grade {r.grade}
                    </td>
                    <td className="p-4 text-xs font-semibold">
                      {r.isPublished ? 'Published (Live)' : 'Draft / Pending Approval'}
                    </td>
                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => downloadMarksheetPdf(r, settings)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-[#0B1F3A] text-[#D9AD43] rounded cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Marksheet PDF</span>
                      </button>
                      {canApproveResults && (
                        <button
                          type="button"
                          onClick={() => void handleTogglePublish(r)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-[#06452C] text-white rounded cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{r.isPublished ? 'Unpublish' : 'Approve & Publish'}</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {section === 'certificates' && (
        <div className="space-y-6">
          <h1 className="font-serif text-3xl font-semibold text-[#06452C] dark:text-white">
            Certificate Management &amp; PDF Templates
          </h1>

          <form
            onSubmit={handleIssueCertificate}
            className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            <select
              value={certType}
              onChange={(e) => setCertType(e.target.value as CertificateRecord['templateType'])}
              className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
            >
              <option>Student ID Card</option>
              <option>Transfer Certificate</option>
              <option>Bonafide Certificate</option>
              <option>Character Certificate</option>
              <option>Academic Certificate</option>
              <option>Fee Receipt</option>
            </select>
            <select
              value={certStudentId}
              onChange={(e) => setCertStudentId(e.target.value)}
              className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.classId})
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#06452C] text-white rounded-lg cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>Generate Certificate</span>
            </button>
          </form>

          <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl divide-y divide-[#EFE6D2] dark:divide-[#D9AD43]/15">
            {certificates.map((cert) => {
              const st = students.find((s) => s.studentId === cert.studentId);
              return (
                <div key={cert.id} className="p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-sm">
                      {cert.templateType} · {cert.studentName}
                    </p>
                    <p className="text-xs text-[#5A6D64] tabular-nums">
                      No: {cert.certificateNumber} · Issued {cert.issuedDate} by {cert.issuedBy}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => downloadCertificatePdf(cert, st, settings)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#06452C] text-white rounded-lg cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
