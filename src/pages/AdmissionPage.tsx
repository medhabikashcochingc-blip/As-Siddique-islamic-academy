import React, { useState } from 'react';
import { CheckCircle2, Upload } from 'lucide-react';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { usePlatform } from '../context/PlatformContext';
import { storage } from '../lib/firebase';

export const AdmissionPage: React.FC = () => {
  const { classes, sessions, settings, submitAdmissionApplication } = usePlatform();

  const [studentName, setStudentName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [previousSchool, setPreviousSchool] = useState('');
  const [previousClass, setPreviousClass] = useState('');
  const [applyingClass, setApplyingClass] = useState('Class 1');
  const [academicSession, setAcademicSession] = useState(sessions[0]?.name || '2026–2027');
  const [learningMode, setLearningMode] = useState<
    'Offline School' | 'Online Classes' | 'Hybrid Learning'
  >('Offline School');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!studentName.trim() || !fatherName.trim() || !mobile.trim() || !dob) {
      setErrorMsg('Student Full Name, Date of Birth, Father’s Name, and Mobile Number are required.');
      return;
    }

    setSubmitting(true);
    try {
      let photoUrl = '';
      const documentUrls: string[] = [];
      const uploadId = `adm_${Date.now()}`;

      if (photoFile && storage) {
        if (photoFile.size > 5 * 1024 * 1024) {
          throw new Error('Photograph must be smaller than 5 MB.');
        }
        try {
          const snap = await uploadBytes(
            ref(storage, `admissions/${uploadId}/photo_${photoFile.name}`),
            photoFile
          );
          photoUrl = await getDownloadURL(snap.ref);
        } catch {
          // If Firebase Storage bucket isn't enabled yet, continue cleanly without blocking admission submission
        }
      }

      if (docFile && storage) {
        if (docFile.size > 10 * 1024 * 1024) {
          throw new Error('Document file must be smaller than 10 MB.');
        }
        try {
          const snap = await uploadBytes(
            ref(storage, `admissions/${uploadId}/doc_${docFile.name}`),
            docFile
          );
          documentUrls.push(await getDownloadURL(snap.ref));
        } catch {
          // Non-blocking fallback
        }
      }

      const appNumber = await submitAdmissionApplication({
        studentName: studentName.trim(),
        dob,
        gender,
        fatherName: fatherName.trim(),
        motherName: motherName.trim(),
        guardianName: (guardianName || fatherName).trim(),
        mobile: mobile.trim(),
        email: email.trim(),
        address: address.trim(),
        previousSchool: previousSchool.trim(),
        previousClass: previousClass.trim(),
        applyingClass,
        academicSession,
        learningMode,
        source: 'online',
        photoUrl,
        documentUrls,
      });

      setSubmittedRef(appNumber);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to submit admission form.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="bg-[#06452C] text-[#F8F1DF] islamic-lattice-dark border-b border-[#D9AD43]/35 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#D9AD43] mb-2">
            Session {academicSession} · Class 1 to Class 12
          </p>
          <h1 className="font-serif text-3xl sm:text-5xl font-semibold text-white">
            Online Admission Portal
          </h1>
          <p className="text-sm text-[#E6DFCE] mt-2">
            {settings.name} · {settings.boardName} &amp; Islamic Education
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 rounded-xl p-6 sm:p-10">
          {submittedRef ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="w-14 h-14 text-[#06452C] dark:text-[#D9AD43] mx-auto mb-4" />
              <p className="text-xs font-semibold uppercase tracking-widest text-[#8A6518] dark:text-[#D9AD43]">
                Unique Application Number: {submittedRef}
              </p>
              <h2 className="font-serif text-3xl font-semibold text-[#06452C] dark:text-white mt-2 mb-3">
                Application Submitted Successfully
              </h2>
              <p className="text-sm text-[#314A3F] dark:text-[#E6DFCE] max-w-lg mx-auto mb-6">
                Your application is now <strong>Pending</strong> verification by authorized Academy
                staff. Only authorized administrators may review and approve admissions.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmittedRef(null);
                  setStudentName('');
                  setFatherName('');
                  setMotherName('');
                  setMobile('');
                }}
                className="px-6 py-2.5 text-sm font-semibold bg-[#06452C] text-white rounded-lg cursor-pointer"
              >
                Submit Another Application
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#06452C] dark:text-white pb-3 border-b border-[#EFE6D2] dark:border-[#D9AD43]/25">
                Student Admission Form
              </h2>

              {errorMsg && (
                <div className="p-3.5 rounded-lg bg-[#FDF2F2] border border-[#E5B4B4] text-sm text-[#7F1D1D]">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1">Gender *</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'Male' | 'Female')}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35 rounded-lg"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1">
                    Applying Class (1–12) *
                  </label>
                  <select
                    value={applyingClass}
                    onChange={(e) => setApplyingClass(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35 rounded-lg"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({c.wing})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1">
                    Father’s Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1">Mother’s Name</label>
                  <input
                    type="text"
                    value={motherName}
                    onChange={(e) => setMotherName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1">
                    Guardian Name &amp; Relation
                  </label>
                  <input
                    type="text"
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    placeholder="If different from Father"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1">
                    Academic Session *
                  </label>
                  <select
                    value={academicSession}
                    onChange={(e) => setAcademicSession(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35 rounded-lg"
                  >
                    {sessions.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1">
                    Learning Method *
                  </label>
                  <select
                    value={learningMode}
                    onChange={(e) =>
                      setLearningMode(
                        e.target.value as 'Offline School' | 'Online Classes' | 'Hybrid Learning'
                      )
                    }
                    className="w-full px-3.5 py-2.5 text-sm bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35 rounded-lg"
                  >
                    <option value="Offline School">Offline School</option>
                    <option value="Online Classes">Online Classes</option>
                    <option value="Hybrid Learning">Hybrid Learning</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1">
                    Previous School &amp; Class
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={previousSchool}
                      onChange={(e) => setPreviousSchool(e.target.value)}
                      placeholder="Previous School"
                      className="px-3 py-2.5 text-sm bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35 rounded-lg"
                    />
                    <input
                      type="text"
                      value={previousClass}
                      onChange={(e) => setPreviousClass(e.target.value)}
                      placeholder="Prev. Class"
                      className="px-3 py-2.5 text-sm bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase mb-1">
                  Residential Address *
                </label>
                <textarea
                  rows={2}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35 rounded-lg"
                />
              </div>

              {!storage && (
                <p className="text-xs text-[#8A6518] dark:text-[#D9AD43] bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35 rounded-lg p-3">
                  Document Storage Status: Optional (Not Configured). You can still submit your online
                  admission form immediately and submit physical copies during campus verification.
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <label className="block p-4 border border-dashed border-[#D9AD43]/50 rounded-lg cursor-pointer text-xs">
                  <span className="font-semibold flex items-center gap-2 mb-1">
                    <Upload className="w-4 h-4 text-[#8A6518] dark:text-[#D9AD43]" />
                    Student Photograph (Optional, &lt; 5MB)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                    className="block w-full text-xs mt-1"
                  />
                </label>
                <label className="block p-4 border border-dashed border-[#D9AD43]/50 rounded-lg cursor-pointer text-xs">
                  <span className="font-semibold flex items-center gap-2 mb-1">
                    <Upload className="w-4 h-4 text-[#8A6518] dark:text-[#D9AD43]" />
                    Birth Certificate / TC (Optional, &lt; 10MB)
                  </span>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                    className="block w-full text-xs mt-1"
                  />
                </label>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 text-sm font-semibold bg-[#06452C] text-[#F8F1DF] hover:bg-[#102D23] rounded-lg disabled:opacity-60 cursor-pointer"
                >
                  {submitting ? 'Submitting Application...' : 'Submit Online Admission'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
