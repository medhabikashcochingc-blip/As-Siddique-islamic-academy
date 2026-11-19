import React, { useState } from 'react';
import { Check, Download, Plus, Search, UserPlus, X } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { usePlatform } from '../../../context/PlatformContext';
import { downloadStudentIdCardPdf, exportCsvReport } from '../../../lib/pdfGenerator';
import { hasPermission } from '../../../lib/permissions';
import { AdmissionApplication, AdmissionStatus, StudentRecord } from '../../../types/platform';

export const PeopleAndAdmissions: React.FC<{
  section: 'admissions' | 'students' | 'parents' | 'teachers' | 'staff';
}> = ({ section }) => {
  const {
    admissions,
    students,
    teachers,
    staff,
    classes,
    sessions,
    settings,
    upsertRecord,
    deleteRecord,
    submitAdmissionApplication,
  } = usePlatform();
  const { effectiveRole } = useAuth();

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [showOfflineAdm, setShowOfflineAdm] = useState(false);
  const [feedback, setFeedback] = useState<string>('');

  // Form states for quick creation
  const [newStudentName, setNewStudentName] = useState('');
  const [newFatherName, setNewFatherName] = useState('');
  const [newClassId, setNewClassId] = useState('Class 1');
  const [newRoll, setNewRoll] = useState('');
  const [newMode, setNewMode] = useState<'Offline School' | 'Online Classes' | 'Hybrid Learning'>(
    'Offline School'
  );

  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherDesig, setNewTeacherDesig] = useState('');
  const [newTeacherQual, setNewTeacherQual] = useState('');
  const [newTeacherDept, setNewTeacherDept] = useState<'general' | 'islamic' | 'both'>('both');

  const [offStudent, setOffStudent] = useState('');
  const [offFather, setOffFather] = useState('');
  const [offMobile, setOffMobile] = useState('');
  const [offClass, setOffClass] = useState('Class 1');

  const canApproveAdmission = hasPermission(effectiveRole || undefined, 'approve_admissions');

  const handleAdmissionDecision = async (app: AdmissionApplication, nextStatus: AdmissionStatus) => {
    if (!canApproveAdmission && (nextStatus === 'Approved' || nextStatus === 'Rejected')) {
      setFeedback('Only authorized Admin, Principal, or Staff roles can approve or reject admissions.');
      return;
    }

    await upsertRecord(
      'admissions',
      app.id,
      { ...app, status: nextStatus },
      `Updated admission ${app.applicationNumber} to ${nextStatus}`
    );

    if (nextStatus === 'Approved') {
      const studentCode = `STU-2026-${Math.floor(100 + Math.random() * 899)}`;
      const admNo = `ADM-2026-${Math.floor(100 + Math.random() * 899)}`;
      const studentDoc: StudentRecord = {
        id: studentCode,
        studentId: studentCode,
        admissionNumber: admNo,
        rollNumber: String(students.length + 101),
        name: app.studentName,
        fatherName: app.fatherName,
        motherName: app.motherName || '',
        dob: app.dob || '',
        gender: app.gender || 'Male',
        classId: app.applyingClass,
        sectionId: 'Section A',
        sessionId: app.academicSession || '2026–2027',
        learningMode: app.learningMode || 'Offline School',
        phone: app.mobile,
        address: app.address || settings.location,
        status: 'active',
        islamicProgress: {
          quranSurah: 'Initial Assessment',
          nazirahLevel: 'Foundational',
          tajweedGrade: 'B',
          hifzJuzCompleted: 0,
          adabRemarks: 'Newly Enrolled',
          dailyDuaMastered: 5,
        },
      };
      await upsertRecord('students', studentCode, studentDoc as unknown as Record<string, unknown>, `Enrolled ${app.studentName}`);
      setFeedback(`Admission approved and Student ID ${studentCode} generated!`);
    } else {
      setFeedback(`Application ${app.applicationNumber} marked ${nextStatus}.`);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = `STU-${Date.now().toString().slice(-6)}`;
    await upsertRecord(
      'students',
      id,
      {
        studentId: id,
        admissionNumber: `ADM-${Date.now().toString().slice(-5)}`,
        rollNumber: newRoll || String(students.length + 1),
        name: newStudentName,
        fatherName: newFatherName,
        motherName: '',
        dob: '',
        gender: 'Male',
        classId: newClassId,
        sectionId: 'Section A',
        sessionId: sessions[0]?.name || '2026–2027',
        learningMode: newMode,
        phone: 'Configured in Office',
        address: settings.location,
        status: 'active',
        islamicProgress: {
          quranSurah: 'Starting Level',
          nazirahLevel: 'Foundational',
          tajweedGrade: 'B',
          hifzJuzCompleted: 0,
          adabRemarks: 'Enrolled',
          dailyDuaMastered: 0,
        },
      },
      `Added student ${newStudentName}`
    );
    setNewStudentName('');
    setNewFatherName('');
    setNewRoll('');
    setShowAddStudent(false);
    setFeedback(`Student ${id} saved to Firestore.`);
  };

  const handlePromoteStudent = async (st: StudentRecord) => {
    const currentNum = parseInt(st.classId.replace(/\D/g, ''), 10);
    if (isNaN(currentNum) || currentNum >= 12) return;
    const nextClass = `Class ${currentNum + 1}`;
    await upsertRecord(
      'students',
      st.id,
      { ...st, classId: nextClass },
      `Promoted ${st.name} to ${nextClass}`
    );
    setFeedback(`${st.name} promoted to ${nextClass}.`);
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = `tch_${Date.now()}`;
    await upsertRecord(
      'teachers',
      id,
      {
        name: newTeacherName,
        designation: newTeacherDesig,
        qualification: newTeacherQual,
        department: newTeacherDept,
        assignedClasses: ['Class 1', 'Class 5'],
        assignedSubjects: ['General / Islamic'],
        isPublic: true,
        bio: 'Verified faculty member.',
        status: 'active',
      },
      `Added teacher ${newTeacherName}`
    );
    setNewTeacherName('');
    setNewTeacherDesig('');
    setNewTeacherQual('');
    setShowAddTeacher(false);
    setFeedback('Teacher profile added to Firestore.');
  };

  const handleOfflineAdmission = async (e: React.FormEvent) => {
    e.preventDefault();
    const ref = await submitAdmissionApplication({
      studentName: offStudent,
      dob: '',
      gender: 'Male',
      fatherName: offFather,
      motherName: '',
      guardianName: offFather,
      mobile: offMobile,
      address: settings.location,
      applyingClass: offClass,
      academicSession: sessions[0]?.name || '2026–2027',
      learningMode: 'Offline School',
      source: 'offline',
    });
    setOffStudent('');
    setOffFather('');
    setOffMobile('');
    setShowOfflineAdm(false);
    setFeedback(`Offline admission entry recorded (${ref}).`);
  };

  return (
    <div className="space-y-6">
      {feedback && (
        <div className="p-3.5 rounded-lg bg-[#06452C] text-[#F8F1DF] text-xs sm:text-sm flex items-center justify-between">
          <span>{feedback}</span>
          <button type="button" onClick={() => setFeedback('')} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {section === 'admissions' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl font-semibold text-[#06452C] dark:text-white">
                Admission Management (Online &amp; Offline)
              </h1>
              <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5]">
                Review applications, verify documents, approve enrollments, and auto-generate Student IDs.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowOfflineAdm((v) => !v)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#06452C] text-white rounded-lg cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Offline Admission Entry</span>
            </button>
          </div>

          {showOfflineAdm && (
            <form
              onSubmit={handleOfflineAdmission}
              className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-4 gap-3"
            >
              <input
                type="text"
                required
                placeholder="Student Name"
                value={offStudent}
                onChange={(e) => setOffStudent(e.target.value)}
                className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
              />
              <input
                type="text"
                required
                placeholder="Father Name"
                value={offFather}
                onChange={(e) => setOffFather(e.target.value)}
                className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
              />
              <input
                type="tel"
                required
                placeholder="Mobile"
                value={offMobile}
                onChange={(e) => setOffMobile(e.target.value)}
                className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
              />
              <div className="flex gap-2">
                <select
                  value={offClass}
                  onChange={(e) => setOffClass(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                >
                  {classes.map((c) => (
                    <option key={c.id}>{c.name}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-[#D9AD43] text-[#102D23] rounded-lg cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          )}

          <div className="flex flex-wrap gap-2">
            {['All', 'Pending', 'Under Review', 'Approved', 'Rejected'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#06452C] text-white'
                    : 'bg-white dark:bg-[#102D23] border-[#D9AD43]/30'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-[#EFE6D2] dark:border-[#D9AD43]/20 text-xs uppercase text-[#8A6518] dark:text-[#D9AD43]">
                  <th className="p-4">App No.</th>
                  <th className="p-4">Student</th>
                  <th className="p-4">Class &amp; Mode</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE6D2] dark:divide-[#D9AD43]/15">
                {admissions
                  .filter((a) => statusFilter === 'All' || a.status === statusFilter)
                  .map((app) => (
                    <tr key={app.id}>
                      <td className="p-4 font-semibold tabular-nums">{app.applicationNumber}</td>
                      <td className="p-4">
                        <p className="font-semibold">{app.studentName}</p>
                        <p className="text-xs text-[#5A6D64]">Father: {app.fatherName}</p>
                      </td>
                      <td className="p-4 text-xs">
                        {app.applyingClass} · {app.learningMode}
                      </td>
                      <td className="p-4 text-xs tabular-nums">{app.mobile}</td>
                      <td className="p-4 text-xs font-semibold">{app.status}</td>
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => void handleAdmissionDecision(app, 'Under Review')}
                          className="px-2.5 py-1 text-xs border border-[#D9AD43]/40 rounded cursor-pointer"
                        >
                          Review
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleAdmissionDecision(app, 'Approved')}
                          className="px-2.5 py-1 text-xs bg-[#06452C] text-white rounded cursor-pointer"
                        >
                          Approve &amp; Enroll
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleAdmissionDecision(app, 'Rejected')}
                          className="px-2.5 py-1 text-xs bg-[#7F1D1D] text-white rounded cursor-pointer"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                {admissions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-xs text-[#5A6D64]">
                      No admission applications recorded yet. Submit one via the public Admission
                      form or Offline Entry above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {section === 'students' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="font-serif text-3xl font-semibold text-[#06452C] dark:text-white">
              Student Information System
            </h1>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  exportCsvReport(
                    'Students_Directory.csv',
                    ['ID', 'Adm No', 'Roll', 'Name', 'Class', 'Mode', 'Status'],
                    students.map((s) => [
                      s.studentId,
                      s.admissionNumber,
                      s.rollNumber,
                      s.name,
                      s.classId,
                      s.learningMode,
                      s.status,
                    ])
                  )
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-[#06452C] rounded-lg cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAddStudent((v) => !v)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#06452C] text-white rounded-lg cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Student</span>
              </button>
            </div>
          </div>

          {showAddStudent && (
            <form
              onSubmit={handleAddStudent}
              className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-5 gap-3"
            >
              <input
                type="text"
                required
                placeholder="Student Name"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
              />
              <input
                type="text"
                required
                placeholder="Father Name"
                value={newFatherName}
                onChange={(e) => setNewFatherName(e.target.value)}
                className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
              />
              <select
                value={newClassId}
                onChange={(e) => setNewClassId(e.target.value)}
                className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
              >
                {classes.map((c) => (
                  <option key={c.id}>{c.name}</option>
                ))}
              </select>
              <select
                value={newMode}
                onChange={(e) =>
                  setNewMode(
                    e.target.value as 'Offline School' | 'Online Classes' | 'Hybrid Learning'
                  )
                }
                className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
              >
                <option value="Offline School">Offline School</option>
                <option value="Online Classes">Online Classes</option>
                <option value="Hybrid Learning">Hybrid Learning</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold bg-[#D9AD43] text-[#102D23] rounded-lg cursor-pointer"
              >
                Save Student
              </button>
            </form>
          )}

          <div className="relative max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#5A6D64]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search student name, ID, or roll..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-lg"
            />
          </div>

          <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-[#EFE6D2] dark:border-[#D9AD43]/20 text-xs uppercase text-[#8A6518] dark:text-[#D9AD43]">
                  <th className="p-4">ID / Roll</th>
                  <th className="p-4">Student Name</th>
                  <th className="p-4">Class &amp; Mode</th>
                  <th className="p-4">Islamic Track</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE6D2] dark:divide-[#D9AD43]/15">
                {students
                  .filter(
                    (s) =>
                      s.name.toLowerCase().includes(query.toLowerCase()) ||
                      s.studentId.toLowerCase().includes(query.toLowerCase()) ||
                      s.rollNumber.includes(query)
                  )
                  .map((s) => (
                    <tr key={s.id}>
                      <td className="p-4 text-xs tabular-nums">
                        <p className="font-semibold">{s.studentId}</p>
                        <p className="text-[#5A6D64]">Roll: {s.rollNumber}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold">{s.name}</p>
                        <p className="text-xs text-[#5A6D64]">Father: {s.fatherName}</p>
                      </td>
                      <td className="p-4 text-xs">
                        {s.classId} · {s.learningMode}
                      </td>
                      <td className="p-4 text-xs">
                        {s.islamicProgress.quranSurah} · Tajweed {s.islamicProgress.tajweedGrade}
                      </td>
                      <td className="p-4 text-xs capitalize font-semibold">{s.status}</td>
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => downloadStudentIdCardPdf(s, settings)}
                          className="px-2.5 py-1 text-xs border border-[#06452C] rounded cursor-pointer"
                        >
                          ID Card PDF
                        </button>
                        <button
                          type="button"
                          onClick={() => void handlePromoteStudent(s)}
                          className="px-2.5 py-1 text-xs bg-[#06452C] text-white rounded cursor-pointer"
                        >
                          Promote
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            void upsertRecord(
                              'students',
                              s.id,
                              { ...s, status: s.status === 'archived' ? 'active' : 'archived' },
                              `Toggled archive status for ${s.name}`
                            )
                          }
                          className="px-2.5 py-1 text-xs border border-[#D9AD43] rounded cursor-pointer"
                        >
                          {s.status === 'archived' ? 'Restore' : 'Archive'}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {section === 'parents' && (
        <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-6">
          <h1 className="font-serif text-3xl font-semibold text-[#06452C] dark:text-white mb-2">
            Parent &amp; Guardian Directory
          </h1>
          <p className="text-xs text-[#5A6D64] mb-5">
            Parent accounts must be explicitly linked to verified student records in User Management
            to preserve child data privacy.
          </p>
          <div className="divide-y divide-[#EFE6D2] dark:divide-[#D9AD43]/20">
            {students.map((s) => (
              <div key={s.id} className="py-3 flex flex-wrap justify-between gap-3 text-sm">
                <div>
                  <p className="font-semibold">{s.fatherName}</p>
                  <p className="text-xs text-[#5A6D64]">
                    Guardian of {s.name} ({s.classId}) · {s.phone}
                  </p>
                </div>
                <span className="text-xs font-medium text-[#8A6518] dark:text-[#D9AD43]">
                  Linked Student ID: {s.studentId}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {section === 'teachers' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="font-serif text-3xl font-semibold text-[#06452C] dark:text-white">
              Teacher Management
            </h1>
            <button
              type="button"
              onClick={() => setShowAddTeacher((v) => !v)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#06452C] text-white rounded-lg cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Teacher</span>
            </button>
          </div>

          {showAddTeacher && (
            <form
              onSubmit={handleAddTeacher}
              className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-4 gap-3"
            >
              <input
                type="text"
                required
                placeholder="Verified Teacher Name"
                value={newTeacherName}
                onChange={(e) => setNewTeacherName(e.target.value)}
                className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
              />
              <input
                type="text"
                required
                placeholder="Designation"
                value={newTeacherDesig}
                onChange={(e) => setNewTeacherDesig(e.target.value)}
                className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
              />
              <input
                type="text"
                required
                placeholder="Qualification"
                value={newTeacherQual}
                onChange={(e) => setNewTeacherQual(e.target.value)}
                className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
              />
              <div className="flex gap-2">
                <select
                  value={newTeacherDept}
                  onChange={(e) => setNewTeacherDept(e.target.value as 'general' | 'islamic' | 'both')}
                  className="flex-1 px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                >
                  <option value="general">General</option>
                  <option value="islamic">Islamic</option>
                  <option value="both">Dual Wing</option>
                </select>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-[#D9AD43] text-[#102D23] rounded-lg cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teachers.map((t) => (
              <div
                key={t.id}
                className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-5 flex justify-between gap-4"
              >
                <div>
                  <p className="text-xs font-semibold text-[#8A6518] dark:text-[#D9AD43]">
                    {t.department.toUpperCase()} {t.isDemo ? '· DEMO' : ''}
                  </p>
                  <h3 className="font-serif text-xl font-semibold">{t.name}</h3>
                  <p className="text-xs text-[#5A6D64]">
                    {t.designation} · {t.qualification}
                  </p>
                  <p className="text-xs mt-2">
                    Classes: {t.assignedClasses.join(', ')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void deleteRecord('teachers', t.id, `Removed teacher ${t.name}`)}
                  className="self-start text-xs text-[#7F1D1D] hover:underline cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {section === 'staff' && (
        <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-serif text-3xl font-semibold text-[#06452C] dark:text-white">
                Staff &amp; Confidential Salary Records
              </h1>
              <p className="text-xs text-[#5A6D64]">
                Strictly restricted to Super Admin, Admin, and Accountant roles in Firestore Rules.
              </p>
            </div>
            <Check className="w-5 h-5 text-[#06452C] dark:text-[#D9AD43]" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-[#EFE6D2] text-xs uppercase text-[#8A6518]">
                  <th className="py-2 pr-4">Staff Member</th>
                  <th className="py-2 pr-4">Role</th>
                  <th className="py-2 pr-4">Department</th>
                  <th className="py-2 pr-4">Monthly Salary (INR)</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE6D2] dark:divide-[#D9AD43]/15">
                {staff.map((stf) => (
                  <tr key={stf.id}>
                    <td className="py-3 pr-4 font-semibold">{stf.name}</td>
                    <td className="py-3 pr-4">{stf.roleTitle}</td>
                    <td className="py-3 pr-4">{stf.department}</td>
                    <td className="py-3 pr-4 tabular-nums">
                      ₹{stf.salaryAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 capitalize">{stf.status}</td>
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
