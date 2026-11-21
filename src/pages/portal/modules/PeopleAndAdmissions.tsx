import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Check,
  Download,
  ExternalLink,
  ImagePlus,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserPlus,
  X,
} from 'lucide-react';
import { TeacherPhoto } from '../../../components/TeacherPhoto';
import { TeacherPhotoPicker } from '../../../components/TeacherPhotoPicker';
import { useAuth } from '../../../context/AuthContext';
import { usePlatform } from '../../../context/PlatformContext';
import { downloadStudentIdCardPdf, exportCsvReport } from '../../../lib/pdfGenerator';
import { hasPermission } from '../../../lib/permissions';
import {
  getTeacherStorageStatus,
  removeTeacherPhotoFile,
  uploadTeacherPhoto,
} from '../../../lib/teacherPhotoUpload';
import {
  AdmissionApplication,
  AdmissionStatus,
  StudentRecord,
  TeacherRecord,
} from '../../../types/platform';

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

  // Form states for quick creation & editing
  const [newStudentName, setNewStudentName] = useState('');
  const [newFatherName, setNewFatherName] = useState('');
  const [newClassId, setNewClassId] = useState('Class 1');
  const [newRoll, setNewRoll] = useState('');
  const [newAdmissionNo, setNewAdmissionNo] = useState('');
  const [newStudentUid, setNewStudentUid] = useState('');
  const [newMode, setNewMode] = useState<'Offline School' | 'Online Classes' | 'Hybrid Learning'>(
    'Offline School'
  );

  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editStudentName, setEditStudentName] = useState('');
  const [editFatherName, setEditFatherName] = useState('');
  const [editAdmissionNo, setEditAdmissionNo] = useState('');
  const [editRollNo, setEditRollNo] = useState('');
  const [editClassId, setEditClassId] = useState('Class 1');
  const [editMode, setEditMode] = useState<'Offline School' | 'Online Classes' | 'Hybrid Learning'>(
    'Offline School'
  );
  const [editPhone, setEditPhone] = useState('');
  const [editStudentUid, setEditStudentUid] = useState('');

  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherDesig, setNewTeacherDesig] = useState('');
  const [newTeacherQual, setNewTeacherQual] = useState('');
  const [newTeacherDept, setNewTeacherDept] = useState<'general' | 'islamic' | 'both'>('both');
  const [newTeacherClasses, setNewTeacherClasses] = useState('Class 1, Class 5');
  const [newTeacherSubjects, setNewTeacherSubjects] = useState('General Studies, Islamic Education');
  const [newTeacherBio, setNewTeacherBio] = useState('Verified faculty member.');
  const [newTeacherIsPublic, setNewTeacherIsPublic] = useState(true);
  const [newTeacherPhotoFile, setNewTeacherPhotoFile] = useState<File | null>(null);
  const [newTeacherPhotoError, setNewTeacherPhotoError] = useState('');
  const [savingNewTeacher, setSavingNewTeacher] = useState(false);

  const [teacherQuery, setTeacherQuery] = useState('');
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [editTeacherName, setEditTeacherName] = useState('');
  const [editTeacherDesig, setEditTeacherDesig] = useState('');
  const [editTeacherQual, setEditTeacherQual] = useState('');
  const [editTeacherDept, setEditTeacherDept] = useState<'general' | 'islamic' | 'both'>('both');
  const [editTeacherClasses, setEditTeacherClasses] = useState('');
  const [editTeacherSubjects, setEditTeacherSubjects] = useState('');
  const [editTeacherBio, setEditTeacherBio] = useState('');
  const [editTeacherIsPublic, setEditTeacherIsPublic] = useState(true);
  const [editTeacherStatus, setEditTeacherStatus] = useState<'active' | 'on_leave' | 'inactive'>('active');
  const [editTeacherPhotoFile, setEditTeacherPhotoFile] = useState<File | null>(null);
  const [editTeacherPhotoError, setEditTeacherPhotoError] = useState('');
  const [removeExistingTeacherPhoto, setRemoveExistingTeacherPhoto] = useState(false);
  const [savingEditTeacher, setSavingEditTeacher] = useState(false);
  const [busyTeacherPhotoId, setBusyTeacherPhotoId] = useState<string | null>(null);

  const [offStudent, setOffStudent] = useState('');
  const [offFather, setOffFather] = useState('');
  const [offMobile, setOffMobile] = useState('');
  const [offClass, setOffClass] = useState('Class 1');

  const canApproveAdmission = hasPermission(effectiveRole || undefined, 'approve_admissions');
  const canManageTeachers = hasPermission(effectiveRole || undefined, 'manage_teachers');
  const storageStatus = getTeacherStorageStatus();

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
        admissionNumber: newAdmissionNo.trim() || `ADM-${Date.now().toString().slice(-5)}`,
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
        studentUid: newStudentUid.trim() || '',
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
    setNewAdmissionNo('');
    setNewStudentUid('');
    setShowAddStudent(false);
    setFeedback(`Student ${id} saved to Firestore.`);
  };

  const startEditingStudent = (st: StudentRecord) => {
    setEditingStudentId(st.id);
    setEditStudentName(st.name);
    setEditFatherName(st.fatherName);
    setEditAdmissionNo(st.admissionNumber);
    setEditRollNo(st.rollNumber);
    setEditClassId(st.classId);
    setEditMode(st.learningMode);
    setEditPhone(st.phone || '');
    setEditStudentUid(st.studentUid || '');
  };

  const handleUpdateStudent = async (e: React.FormEvent, st: StudentRecord) => {
    e.preventDefault();
    await upsertRecord(
      'students',
      st.id,
      {
        ...st,
        name: editStudentName.trim() || st.name,
        fatherName: editFatherName.trim() || st.fatherName,
        admissionNumber: editAdmissionNo.trim() || st.admissionNumber,
        rollNumber: editRollNo.trim() || st.rollNumber,
        classId: editClassId,
        learningMode: editMode,
        phone: editPhone.trim() || st.phone,
        studentUid: editStudentUid.trim(),
      },
      `Updated student record ${st.studentId}`
    );
    setEditingStudentId(null);
    setFeedback(`Updated profile for ${editStudentName.trim()}.`);
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

  const parseCommaList = (raw: string, fallback: string[]): string[] => {
    const items = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    return items.length > 0 ? items : fallback;
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageTeachers) {
      setFeedback('Only authorized Admin or Principal roles can add teachers or upload photos.');
      return;
    }
    if (newTeacherPhotoError) {
      setFeedback(newTeacherPhotoError);
      return;
    }

    setSavingNewTeacher(true);
    const id = `tch_${Date.now()}`;
    let photoUrl = '';
    let photoStoragePath = '';
    let photoWarning = '';

    try {
      if (newTeacherPhotoFile) {
        if (!storageStatus.configured) {
          photoWarning = `Teacher saved without photo. ${storageStatus.setupMessage}`;
        } else {
          try {
            const uploaded = await uploadTeacherPhoto(id, newTeacherPhotoFile);
            photoUrl = uploaded.photoUrl;
            photoStoragePath = uploaded.photoStoragePath;
          } catch (uploadErr) {
            photoWarning = `Teacher profile saved without photo: ${
              uploadErr instanceof Error ? uploadErr.message : 'Firebase Storage upload failed.'
            }`;
          }
        }
      }

      await upsertRecord(
        'teachers',
        id,
        {
          name: newTeacherName.trim(),
          designation: newTeacherDesig.trim(),
          qualification: newTeacherQual.trim(),
          department: newTeacherDept,
          assignedClasses: parseCommaList(newTeacherClasses, ['Class 1', 'Class 5']),
          assignedSubjects: parseCommaList(newTeacherSubjects, ['General / Islamic']),
          photoUrl,
          photoStoragePath,
          isPublic: newTeacherIsPublic,
          bio: newTeacherBio.trim() || 'Verified faculty member.',
          status: 'active',
        },
        `Added teacher ${newTeacherName.trim()}${photoUrl ? ' with photo' : ''}`
      );

      setNewTeacherName('');
      setNewTeacherDesig('');
      setNewTeacherQual('');
      setNewTeacherDept('both');
      setNewTeacherClasses('Class 1, Class 5');
      setNewTeacherSubjects('General Studies, Islamic Education');
      setNewTeacherBio('Verified faculty member.');
      setNewTeacherIsPublic(true);
      setNewTeacherPhotoFile(null);
      setNewTeacherPhotoError('');
      setShowAddTeacher(false);
      setFeedback(
        photoWarning ||
          (photoUrl
            ? 'Teacher profile and photograph saved to Firebase.'
            : 'Teacher profile added to Firestore.')
      );
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Unable to save teacher profile.');
    } finally {
      setSavingNewTeacher(false);
    }
  };

  const startEditingTeacher = (teacher: TeacherRecord) => {
    setEditingTeacherId(teacher.id);
    setEditTeacherName(teacher.name);
    setEditTeacherDesig(teacher.designation);
    setEditTeacherQual(teacher.qualification);
    setEditTeacherDept(teacher.department);
    setEditTeacherClasses(teacher.assignedClasses.join(', '));
    setEditTeacherSubjects(teacher.assignedSubjects.join(', '));
    setEditTeacherBio(teacher.bio || '');
    setEditTeacherIsPublic(teacher.isPublic !== false);
    setEditTeacherStatus(teacher.status || 'active');
    setEditTeacherPhotoFile(null);
    setEditTeacherPhotoError('');
    setRemoveExistingTeacherPhoto(false);
  };

  const cancelEditingTeacher = () => {
    setEditingTeacherId(null);
    setEditTeacherPhotoFile(null);
    setEditTeacherPhotoError('');
    setRemoveExistingTeacherPhoto(false);
  };

  const handleUpdateTeacher = async (e: React.FormEvent, existing: TeacherRecord) => {
    e.preventDefault();
    if (!canManageTeachers) {
      setFeedback('Only authorized Admin or Principal roles can update teachers or photos.');
      return;
    }
    if (editTeacherPhotoError) {
      setFeedback(editTeacherPhotoError);
      return;
    }

    setSavingEditTeacher(true);
    let nextPhotoUrl = existing.photoUrl || '';
    let nextStoragePath = existing.photoStoragePath || '';
    let photoWarning = '';

    try {
      if (editTeacherPhotoFile) {
        if (!storageStatus.configured) {
          photoWarning = `Details updated, but new photo was not uploaded. ${storageStatus.setupMessage}`;
        } else {
          try {
            const uploaded = await uploadTeacherPhoto(existing.id, editTeacherPhotoFile);
            if (existing.photoStoragePath && existing.photoStoragePath !== uploaded.photoStoragePath) {
              await removeTeacherPhotoFile(existing.photoStoragePath);
            }
            nextPhotoUrl = uploaded.photoUrl;
            nextStoragePath = uploaded.photoStoragePath;
          } catch (uploadErr) {
            photoWarning = `Details updated, but photo upload failed: ${
              uploadErr instanceof Error ? uploadErr.message : 'Firebase Storage error.'
            }`;
          }
        }
      } else if (removeExistingTeacherPhoto) {
        if (existing.photoStoragePath) {
          await removeTeacherPhotoFile(existing.photoStoragePath);
        }
        nextPhotoUrl = '';
        nextStoragePath = '';
      }

      await upsertRecord(
        'teachers',
        existing.id,
        {
          name: editTeacherName.trim(),
          designation: editTeacherDesig.trim(),
          qualification: editTeacherQual.trim(),
          department: editTeacherDept,
          assignedClasses: parseCommaList(editTeacherClasses, ['Class 1']),
          assignedSubjects: parseCommaList(editTeacherSubjects, ['General / Islamic']),
          bio: editTeacherBio.trim() || 'Verified faculty member.',
          isPublic: editTeacherIsPublic,
          status: editTeacherStatus,
          photoUrl: nextPhotoUrl,
          photoStoragePath: nextStoragePath,
        },
        `Updated teacher ${editTeacherName.trim()}`
      );

      cancelEditingTeacher();
      setFeedback(photoWarning || `Updated profile for ${editTeacherName.trim()}.`);
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Unable to update teacher profile.');
    } finally {
      setSavingEditTeacher(false);
    }
  };

  const handleQuickRemoveTeacherPhoto = async (teacher: TeacherRecord) => {
    if (!canManageTeachers) {
      setFeedback('Only authorized Admin or Principal roles can remove teacher photos.');
      return;
    }
    setBusyTeacherPhotoId(teacher.id);
    try {
      if (teacher.photoStoragePath) {
        await removeTeacherPhotoFile(teacher.photoStoragePath);
      }
      await upsertRecord(
        'teachers',
        teacher.id,
        {
          photoUrl: '',
          photoStoragePath: '',
        },
        `Removed photo for teacher ${teacher.name}`
      );
      if (editingTeacherId === teacher.id) {
        setRemoveExistingTeacherPhoto(true);
        setEditTeacherPhotoFile(null);
      }
      setFeedback(`Photo removed for ${teacher.name}.`);
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Unable to remove teacher photo.');
    } finally {
      setBusyTeacherPhotoId(null);
    }
  };

  const handleDeleteTeacher = async (teacher: TeacherRecord) => {
    if (!canManageTeachers) {
      setFeedback('Only authorized Admin or Principal roles can remove teachers.');
      return;
    }
    try {
      if (teacher.photoStoragePath) {
        await removeTeacherPhotoFile(teacher.photoStoragePath);
      }
      await deleteRecord('teachers', teacher.id, `Removed teacher ${teacher.name}`);
      if (editingTeacherId === teacher.id) {
        cancelEditingTeacher();
      }
      setFeedback(`Removed teacher ${teacher.name}.`);
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Unable to remove teacher.');
    }
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
              className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
            >
              <input
                type="text"
                required
                placeholder="Student Name *"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
              />
              <input
                type="text"
                required
                placeholder="Father Name *"
                value={newFatherName}
                onChange={(e) => setNewFatherName(e.target.value)}
                className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
              />
              <input
                type="text"
                placeholder="Admission No (Optional, auto if blank)"
                value={newAdmissionNo}
                onChange={(e) => setNewAdmissionNo(e.target.value)}
                className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
              />
              <input
                type="text"
                placeholder="Roll Number (Optional)"
                value={newRoll}
                onChange={(e) => setNewRoll(e.target.value)}
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
              <input
                type="text"
                placeholder="Linked Firebase Student UID (Optional)"
                value={newStudentUid}
                onChange={(e) => setNewStudentUid(e.target.value)}
                className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
              />
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold bg-[#D9AD43] text-[#102D23] rounded-lg cursor-pointer"
              >
                Save Student
              </button>
            </form>
          )}

          {editingStudentId && (() => {
            const target = students.find((st) => st.id === editingStudentId);
            if (!target) return null;
            return (
              <form
                onSubmit={(e) => void handleUpdateStudent(e, target)}
                className="bg-[#F8F1DF] dark:bg-[#102D23] border-2 border-[#06452C] dark:border-[#D9AD43] rounded-xl p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#06452C] dark:text-[#D9AD43]">
                    Edit Student Record &amp; Portal Account Link ({target.studentId})
                  </p>
                  <button
                    type="button"
                    onClick={() => setEditingStudentId(null)}
                    className="text-xs underline cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Student Name"
                    value={editStudentName}
                    onChange={(e) => setEditStudentName(e.target.value)}
                    className="px-3 py-2 text-xs bg-white dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Father Name"
                    value={editFatherName}
                    onChange={(e) => setEditFatherName(e.target.value)}
                    className="px-3 py-2 text-xs bg-white dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Admission Number"
                    value={editAdmissionNo}
                    onChange={(e) => setEditAdmissionNo(e.target.value)}
                    className="px-3 py-2 text-xs bg-white dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Roll Number"
                    value={editRollNo}
                    onChange={(e) => setEditRollNo(e.target.value)}
                    className="px-3 py-2 text-xs bg-white dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                  />
                  <select
                    value={editClassId}
                    onChange={(e) => setEditClassId(e.target.value)}
                    className="px-3 py-2 text-xs bg-white dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                  >
                    {classes.map((c) => (
                      <option key={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <select
                    value={editMode}
                    onChange={(e) =>
                      setEditMode(
                        e.target.value as 'Offline School' | 'Online Classes' | 'Hybrid Learning'
                      )
                    }
                    className="px-3 py-2 text-xs bg-white dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                  >
                    <option value="Offline School">Offline School</option>
                    <option value="Online Classes">Online Classes</option>
                    <option value="Hybrid Learning">Hybrid Learning</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Contact Phone"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="px-3 py-2 text-xs bg-white dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Firebase Student UID"
                    value={editStudentUid}
                    onChange={(e) => setEditStudentUid(e.target.value)}
                    className="px-3 py-2 text-xs bg-white dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-[#06452C] text-white rounded-lg cursor-pointer"
                >
                  Save Changes
                </button>
              </form>
            );
          })()}

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
                        <p className="text-[#5A6D64]">Adm: {s.admissionNumber} · Roll: {s.rollNumber}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold">{s.name}</p>
                        <p className="text-xs text-[#5A6D64]">
                          Father: {s.fatherName} {s.studentUid ? '· Portal Linked' : ''}
                        </p>
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
                          onClick={() => startEditingStudent(s)}
                          className="px-2.5 py-1 text-xs border border-[#D9AD43] rounded cursor-pointer"
                        >
                          Edit
                        </button>
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
            <div>
              <h1 className="font-serif text-3xl font-semibold text-[#06452C] dark:text-white">
                Teacher Management
              </h1>
              <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5]">
                Add, update, and publish verified faculty profiles and photographs across the Academy website.
              </p>
            </div>
            {canManageTeachers && (
              <button
                type="button"
                onClick={() => setShowAddTeacher((v) => !v)}
                className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 text-xs font-semibold bg-[#06452C] text-white rounded-lg cursor-pointer hover:bg-[#102D23] transition-colors"
              >
                {showAddTeacher ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{showAddTeacher ? 'Close Add Form' : 'Add Teacher'}</span>
              </button>
            )}
          </div>

          {!canManageTeachers && (
            <div className="p-4 rounded-xl bg-[#FEF3C7] dark:bg-[#3A2809] border border-[#D9AD43]/60 text-xs text-[#5C3D08] dark:text-[#FDE68A]">
              Only authorized Super Admin, Admin, and Principal accounts can add, edit, or upload teacher photographs.
            </div>
          )}

          {!storageStatus.configured && canManageTeachers && (
            <div
              role="status"
              className="flex items-start gap-2.5 p-4 rounded-xl bg-[#FEF3C7] dark:bg-[#3A2809] border border-[#D9AD43]/60 text-xs text-[#5C3D08] dark:text-[#FDE68A]"
            >
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Firebase Storage Setup Required for Photo Uploads</p>
                <p className="mt-0.5">{storageStatus.setupMessage}</p>
              </div>
            </div>
          )}

          {showAddTeacher && canManageTeachers && (
            <form
              onSubmit={handleAddTeacher}
              className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 rounded-xl p-5 sm:p-6 space-y-4"
            >
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#EFE6D2] dark:border-[#D9AD43]/20">
                <h2 className="font-serif text-xl font-semibold text-[#06452C] dark:text-white">
                  Add New Teacher Profile
                </h2>
                <span className="text-[11px] text-[#5A6D64] dark:text-[#C9C2B2]">
                  Fields marked * are required
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#5A6D64] dark:text-[#DED7C5] mb-1">
                    Teacher Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maulana Abdul Karim"
                    value={newTeacherName}
                    onChange={(e) => setNewTeacherName(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 text-xs sm:text-sm bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#5A6D64] dark:text-[#DED7C5] mb-1">
                    Designation *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Quran & Tajweed Teacher"
                    value={newTeacherDesig}
                    onChange={(e) => setNewTeacherDesig(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 text-xs sm:text-sm bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#5A6D64] dark:text-[#DED7C5] mb-1">
                    Qualification *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fazil, M.A. Arabic"
                    value={newTeacherQual}
                    onChange={(e) => setNewTeacherQual(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 text-xs sm:text-sm bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#5A6D64] dark:text-[#DED7C5] mb-1">
                    Academic Wing *
                  </label>
                  <select
                    value={newTeacherDept}
                    onChange={(e) =>
                      setNewTeacherDept(e.target.value as 'general' | 'islamic' | 'both')
                    }
                    className="w-full min-h-[44px] px-3 py-2 text-xs sm:text-sm bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                  >
                    <option value="general">General Education</option>
                    <option value="islamic">Islamic Education</option>
                    <option value="both">Dual Wing (General &amp; Islamic)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#5A6D64] dark:text-[#DED7C5] mb-1">
                    Assigned Classes (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="Class 1, Class 5, Class 8"
                    value={newTeacherClasses}
                    onChange={(e) => setNewTeacherClasses(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 text-xs sm:text-sm bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#5A6D64] dark:text-[#DED7C5] mb-1">
                    Subjects Taught (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="Quran & Tajweed, Arabic, Mathematics"
                    value={newTeacherSubjects}
                    onChange={(e) => setNewTeacherSubjects(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 text-xs sm:text-sm bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#5A6D64] dark:text-[#DED7C5] mb-1">
                  Short Faculty Biography
                </label>
                <textarea
                  rows={2}
                  placeholder="Verified experience, teaching specialization, and academic focus..."
                  value={newTeacherBio}
                  onChange={(e) => setNewTeacherBio(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                />
              </div>

              <TeacherPhotoPicker
                label="Upload Teacher Photo"
                teacherName={newTeacherName || 'New Teacher'}
                selectedFile={newTeacherPhotoFile}
                validationError={newTeacherPhotoError}
                disabled={savingNewTeacher}
                onSelectFile={(file, err) => {
                  setNewTeacherPhotoFile(file);
                  setNewTeacherPhotoError(err);
                }}
              />

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <label className="inline-flex items-center gap-2 text-xs font-medium cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newTeacherIsPublic}
                    onChange={(e) => setNewTeacherIsPublic(e.target.checked)}
                    className="w-4 h-4 accent-[#06452C]"
                  />
                  <span>Show on Public Website (Homepage Faculty Showcase &amp; Directory)</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={savingNewTeacher}
                    onClick={() => {
                      setShowAddTeacher(false);
                      setNewTeacherPhotoFile(null);
                      setNewTeacherPhotoError('');
                    }}
                    className="min-h-[44px] px-4 py-2 text-xs font-semibold border border-[#D9AD43]/40 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingNewTeacher}
                    className="min-h-[44px] px-5 py-2 text-xs font-semibold bg-[#D9AD43] hover:bg-[#c79b32] text-[#102D23] rounded-lg cursor-pointer disabled:opacity-60"
                  >
                    {savingNewTeacher
                      ? newTeacherPhotoFile
                        ? 'Uploading Photo & Saving...'
                        : 'Saving...'
                      : 'Save Teacher Profile'}
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="relative max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#5A6D64]" />
            <input
              type="text"
              value={teacherQuery}
              onChange={(e) => setTeacherQuery(e.target.value)}
              placeholder="Search teacher name, designation, subject..."
              className="w-full min-h-[42px] pl-9 pr-3 py-2 text-xs bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {teachers
              .filter((t) => {
                const q = teacherQuery.trim().toLowerCase();
                if (!q) return true;
                return (
                  t.name.toLowerCase().includes(q) ||
                  t.designation.toLowerCase().includes(q) ||
                  t.qualification.toLowerCase().includes(q) ||
                  t.assignedSubjects.join(' ').toLowerCase().includes(q)
                );
              })
              .map((t) => {
                const isEditing = editingTeacherId === t.id;
                const isPhotoBusy = busyTeacherPhotoId === t.id;
                return (
                  <div
                    key={t.id}
                    className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-5 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row gap-4 justify-between">
                      <div className="flex items-start gap-4 min-w-0">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden border border-[#D9AD43]/40 bg-[#EFE6D2] dark:bg-[#06452C]">
                          <TeacherPhoto
                            photoUrl={t.photoUrl}
                            name={t.name}
                            className="w-full h-full object-cover object-top"
                            emblemClassName="w-10 h-10"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <span className="text-[11px] font-semibold text-[#8A6518] dark:text-[#D9AD43]">
                              {t.department.toUpperCase()} {t.isDemo ? '· DEMO' : ''}
                            </span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                                t.photoUrl
                                  ? 'bg-[#E6F4EA] text-[#06452C] dark:bg-[#06452C] dark:text-[#D9AD43]'
                                  : 'bg-[#F8F1DF] text-[#5A6D64] dark:bg-[#081A14] dark:text-[#C9C2B2]'
                              }`}
                            >
                              {t.photoUrl ? 'Photo Uploaded' : 'No Photo'}
                            </span>
                            {t.isPublic === false && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#FDF2F2] text-[#7F1D1D]">
                                Hidden Publicly
                              </span>
                            )}
                          </div>
                          <h3 className="font-serif text-xl font-semibold text-[#06452C] dark:text-white truncate">
                            {t.name}
                          </h3>
                          <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5]">
                            {t.designation} · {t.qualification}
                          </p>
                          <p className="text-xs text-[#314A3F] dark:text-[#C9C2B2] mt-1.5">
                            Classes: {t.assignedClasses.join(', ')}
                          </p>
                          <Link
                            to={`/teachers/${t.id}`}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#06452C] dark:text-[#D9AD43] hover:underline mt-1.5"
                          >
                            <span>View Public Profile</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>

                    {canManageTeachers && !isEditing && (
                      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#EFE6D2] dark:border-[#D9AD43]/20">
                        <button
                          type="button"
                          onClick={() => startEditingTeacher(t)}
                          className="inline-flex items-center gap-1.5 min-h-[40px] px-3 py-1.5 text-xs font-semibold bg-[#06452C] text-white rounded-lg cursor-pointer hover:bg-[#102D23]"
                        >
                          {t.photoUrl ? (
                            <Pencil className="w-3.5 h-3.5" />
                          ) : (
                            <ImagePlus className="w-3.5 h-3.5" />
                          )}
                          <span>{t.photoUrl ? 'Edit / Change Photo' : 'Edit / Upload Photo'}</span>
                        </button>

                        {t.photoUrl && (
                          <button
                            type="button"
                            disabled={isPhotoBusy}
                            onClick={() => void handleQuickRemoveTeacherPhoto(t)}
                            className="inline-flex items-center gap-1.5 min-h-[40px] px-3 py-1.5 text-xs font-semibold border border-[#7F1D1D]/40 text-[#7F1D1D] dark:text-[#FCA5A5] rounded-lg cursor-pointer hover:bg-[#FDF2F2] disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{isPhotoBusy ? 'Removing...' : 'Remove Photo'}</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => void handleDeleteTeacher(t)}
                          className="ml-auto inline-flex items-center gap-1 min-h-[40px] px-2.5 py-1.5 text-xs font-medium text-[#7F1D1D] dark:text-[#FCA5A5] hover:underline cursor-pointer"
                        >
                          Remove Teacher
                        </button>
                      </div>
                    )}

                    {isEditing && canManageTeachers && (
                      <form
                        onSubmit={(e) => void handleUpdateTeacher(e, t)}
                        className="pt-4 border-t border-[#D9AD43]/30 space-y-3"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            required
                            placeholder="Teacher Name *"
                            value={editTeacherName}
                            onChange={(e) => setEditTeacherName(e.target.value)}
                            className="min-h-[42px] px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                          />
                          <input
                            type="text"
                            required
                            placeholder="Designation *"
                            value={editTeacherDesig}
                            onChange={(e) => setEditTeacherDesig(e.target.value)}
                            className="min-h-[42px] px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                          />
                          <input
                            type="text"
                            required
                            placeholder="Qualification *"
                            value={editTeacherQual}
                            onChange={(e) => setEditTeacherQual(e.target.value)}
                            className="min-h-[42px] px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <select
                              value={editTeacherDept}
                              onChange={(e) =>
                                setEditTeacherDept(
                                  e.target.value as 'general' | 'islamic' | 'both'
                                )
                              }
                              className="min-h-[42px] px-2.5 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                            >
                              <option value="general">General</option>
                              <option value="islamic">Islamic</option>
                              <option value="both">Dual Wing</option>
                            </select>
                            <select
                              value={editTeacherStatus}
                              onChange={(e) =>
                                setEditTeacherStatus(
                                  e.target.value as 'active' | 'on_leave' | 'inactive'
                                )
                              }
                              className="min-h-[42px] px-2.5 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                            >
                              <option value="active">Active</option>
                              <option value="on_leave">On Leave</option>
                              <option value="inactive">Inactive</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Assigned Classes (comma separated)"
                            value={editTeacherClasses}
                            onChange={(e) => setEditTeacherClasses(e.target.value)}
                            className="min-h-[42px] px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                          />
                          <input
                            type="text"
                            placeholder="Subjects Taught (comma separated)"
                            value={editTeacherSubjects}
                            onChange={(e) => setEditTeacherSubjects(e.target.value)}
                            className="min-h-[42px] px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                          />
                        </div>

                        <textarea
                          rows={2}
                          placeholder="Teacher bio..."
                          value={editTeacherBio}
                          onChange={(e) => setEditTeacherBio(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                        />

                        <TeacherPhotoPicker
                          label="Change or Remove Teacher Photo"
                          teacherName={editTeacherName || t.name}
                          existingPhotoUrl={t.photoUrl}
                          selectedFile={editTeacherPhotoFile}
                          removeExistingPhoto={removeExistingTeacherPhoto}
                          validationError={editTeacherPhotoError}
                          disabled={savingEditTeacher}
                          onSelectFile={(file, err) => {
                            setEditTeacherPhotoFile(file);
                            setEditTeacherPhotoError(err);
                          }}
                          onToggleRemoveExisting={setRemoveExistingTeacherPhoto}
                        />

                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <label className="inline-flex items-center gap-2 text-xs font-medium cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={editTeacherIsPublic}
                              onChange={(e) => setEditTeacherIsPublic(e.target.checked)}
                              className="w-4 h-4 accent-[#06452C]"
                            />
                            <span>Show publicly</span>
                          </label>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={savingEditTeacher}
                              onClick={cancelEditingTeacher}
                              className="min-h-[42px] px-3.5 py-2 text-xs font-semibold border border-[#D9AD43]/40 rounded-lg cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={savingEditTeacher}
                              className="min-h-[42px] px-4 py-2 text-xs font-semibold bg-[#D9AD43] hover:bg-[#c79b32] text-[#102D23] rounded-lg cursor-pointer disabled:opacity-60"
                            >
                              {savingEditTeacher
                                ? editTeacherPhotoFile
                                  ? 'Uploading Photo & Saving...'
                                  : 'Saving Changes...'
                                : 'Save Changes'}
                            </button>
                          </div>
                        </div>
                      </form>
                    )}
                  </div>
                );
              })}
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
