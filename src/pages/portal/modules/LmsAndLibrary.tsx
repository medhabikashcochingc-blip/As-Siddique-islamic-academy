import React, { useState } from 'react';
import { CheckCircle2, ExternalLink, Upload, Video } from 'lucide-react';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { AdminLmsCourseManager } from '../../../components/lms/AdminLmsCourseManager';
import { useAuth } from '../../../context/AuthContext';
import { usePlatform } from '../../../context/PlatformContext';
import { storage } from '../../../lib/firebase';
import { hasPermission } from '../../../lib/permissions';

export const LmsAndLibrary: React.FC<{
  section: 'homework' | 'assignments' | 'lms' | 'courses' | 'live-classes' | 'materials' | 'library';
}> = ({ section }) => {
  const {
    homework,
    assignments,
    submissions,
    liveClasses,
    library,
    classes,
    integrations,
    upsertRecord,
  } = usePlatform();
  const { effectiveRole, userAccount } = useAuth();

  const canManageLms = hasPermission(effectiveRole || undefined, 'manage_lms');
  const canManageLib = hasPermission(effectiveRole || undefined, 'manage_library');

  const [hwTitle, setHwTitle] = useState('');
  const [hwClass, setHwClass] = useState('Class 10');
  const [hwSubject, setHwSubject] = useState('Mathematics');
  const [hwDue, setHwDue] = useState('2026-11-30');

  const [liveTitle, setLiveTitle] = useState('');
  const [liveClass, setLiveClass] = useState('Class 10');
  const [liveLink, setLiveLink] = useState('');
  const [liveStart, setLiveStart] = useState('10:00 AM IST');

  const [libTitle, setLibTitle] = useState('');
  const [libCategory, setLibCategory] = useState('Islamic Books');
  const [libClass, setLibClass] = useState('Class 10');
  const [libSearch, setLibSearch] = useState('');
  const [libFile, setLibFile] = useState<File | null>(null);
  const [libExternalUrl, setLibExternalUrl] = useState('');

  const [submissionText, setSubmissionText] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleAddHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = `hw_${Date.now()}`;
    await upsertRecord('homework', id, {
      title: hwTitle,
      description: 'Assigned via Academy ERP.',
      classId: hwClass,
      subjectName: hwSubject,
      dueDate: hwDue,
      teacherUid: userAccount?.uid || 'staff',
    });
    setHwTitle('');
    setFeedback('Homework published to class.');
  };

  const handleAddLiveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = `live_${Date.now()}`;
    await upsertRecord('liveClasses', id, {
      title: liveTitle,
      classId: liveClass,
      subjectName: 'Interactive Session',
      teacherName: userAccount?.displayName || 'Faculty',
      meetingLink: liveLink,
      startTime: liveStart,
      endTime: '11:00 AM IST',
      status: 'Scheduled',
    });
    setLiveTitle('');
    setLiveLink('');
    setFeedback('Live class scheduled.');
  };

  const handleUploadLibrary = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = `lib_${Date.now()}`;
    let fileUrl = libExternalUrl.trim() || '#resource-pending-url';
    if (libFile && storage) {
      try {
        const snap = await uploadBytes(ref(storage, `library/${id}/${libFile.name}`), libFile);
        fileUrl = await getDownloadURL(snap.ref);
      } catch {
        // Fallback cleanly if Firebase Storage bucket requires console setup
      }
    }
    await upsertRecord('library', id, {
      title: libTitle,
      author: userAccount?.displayName || 'Academy Library',
      category: libCategory,
      classId: libClass,
      subjectName: 'Reference',
      fileUrl,
      allowDownload: true,
    });
    setLibTitle('');
    setLibFile(null);
    setLibExternalUrl('');
    setFeedback('Digital Library resource added.');
  };

  const handleStudentSubmit = async (assignmentId: string) => {
    if (!submissionText.trim()) return;
    const id = `sub_${assignmentId}_${userAccount?.uid || 'stu'}`;
    await upsertRecord('submissions', id, {
      assignmentId,
      studentId: userAccount?.linkedStudentId || 'STU-SELF',
      studentUid: userAccount?.uid || 'anon',
      studentName: userAccount?.displayName || 'Student',
      submissionText,
      status: 'submitted',
    });
    setSubmissionText('');
    setFeedback('Assignment submission recorded.');
  };

  return (
    <div className="space-y-6">
      {feedback && (
        <div className="p-3 rounded-lg bg-[#06452C] text-[#F8F1DF] text-xs font-medium">
          {feedback}
        </div>
      )}

      {(section === 'homework' || section === 'assignments') && (
        <div className="space-y-5">
          <h1 className="font-serif text-3xl font-semibold text-[#06452C] dark:text-white">
            {section === 'homework' ? 'Homework Management' : 'Assignments & Evaluations'}
          </h1>

          {canManageLms && (
            <form
              onSubmit={handleAddHomework}
              className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-4 gap-3"
            >
              <input
                type="text"
                required
                placeholder="Task Title"
                value={hwTitle}
                onChange={(e) => setHwTitle(e.target.value)}
                className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
              />
              <select
                value={hwClass}
                onChange={(e) => setHwClass(e.target.value)}
                className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
              >
                {classes.map((c) => (
                  <option key={c.id}>{c.name}</option>
                ))}
              </select>
              <input
                type="text"
                required
                placeholder="Subject"
                value={hwSubject}
                onChange={(e) => setHwSubject(e.target.value)}
                className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
              />
              <div className="flex gap-2">
                <input
                  type="date"
                  value={hwDue}
                  onChange={(e) => setHwDue(e.target.value)}
                  className="flex-1 px-2 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                />
                <button
                  type="submit"
                  className="px-3 py-2 text-xs font-semibold bg-[#06452C] text-white rounded-lg cursor-pointer"
                >
                  Assign
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(section === 'homework' ? homework : assignments).map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-5 space-y-3"
              >
                <p className="text-xs font-semibold text-[#8A6518] dark:text-[#D9AD43] tabular-nums">
                  {item.classId} · {item.subjectName} · Due {item.dueDate}
                </p>
                <h3 className="font-serif text-xl font-semibold">{item.title}</h3>
                <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5]">
                  {'description' in item ? item.description : item.instructions}
                </p>
                {!canManageLms && (
                  <div className="flex gap-2 pt-2">
                    <input
                      type="text"
                      value={submissionText}
                      onChange={(e) => setSubmissionText(e.target.value)}
                      placeholder="Write answer or attach note link..."
                      className="flex-1 px-3 py-1.5 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => void handleStudentSubmit(item.id)}
                      className="px-3 py-1.5 text-xs font-semibold bg-[#06452C] text-white rounded-lg cursor-pointer"
                    >
                      Submit
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {submissions.length > 0 && (
            <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-5">
              <h3 className="font-serif text-xl font-semibold mb-3">Recent Submissions</h3>
              {submissions.map((sub) => (
                <div key={sub.id} className="py-2 text-xs flex justify-between border-t border-[#EFE6D2] dark:border-[#D9AD43]/20">
                  <span>
                    <strong>{sub.studentName}</strong>: {sub.submissionText}
                  </span>
                  <span className="uppercase font-semibold">{sub.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {(section === 'lms' || section === 'courses' || section === 'materials') && (
        <AdminLmsCourseManager canManageLms={canManageLms} />
      )}

      {section === 'live-classes' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl font-semibold text-[#06452C] dark:text-white">
                Live Class Management
              </h1>
              <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5]">
                Video Provider Status:{' '}
                <strong>
                  {integrations?.videoConferencing.configured
                    ? integrations.videoConferencing.provider
                    : 'Not Configured on server — add authorized Zoom / Google Meet / Jitsi meeting links manually below'}
                </strong>
              </p>
            </div>
          </div>

          {canManageLms && (
            <form
              onSubmit={handleAddLiveClass}
              className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-4 gap-3"
            >
              <input
                type="text"
                required
                placeholder="Live Session Title"
                value={liveTitle}
                onChange={(e) => setLiveTitle(e.target.value)}
                className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
              />
              <select
                value={liveClass}
                onChange={(e) => setLiveClass(e.target.value)}
                className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
              >
                {classes.map((c) => (
                  <option key={c.id}>{c.name}</option>
                ))}
              </select>
              <input
                type="url"
                placeholder="Authorized Meeting URL (https://...)"
                value={liveLink}
                onChange={(e) => setLiveLink(e.target.value)}
                className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={liveStart}
                  onChange={(e) => setLiveStart(e.target.value)}
                  className="flex-1 px-2 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                />
                <button
                  type="submit"
                  className="px-3 py-2 text-xs font-semibold bg-[#06452C] text-white rounded-lg cursor-pointer"
                >
                  Schedule
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveClasses.map((lv) => (
              <div
                key={lv.id}
                className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-5 flex justify-between items-center gap-4"
              >
                <div>
                  <p className="text-xs font-semibold text-[#8A6518] dark:text-[#D9AD43]">
                    {lv.classId} · {lv.startTime} – {lv.endTime}
                  </p>
                  <h3 className="font-serif text-xl font-semibold">{lv.title}</h3>
                  <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5]">{lv.teacherName}</p>
                </div>
                {lv.meetingLink ? (
                  <a
                    href={lv.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#06452C] text-white rounded-lg"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Join</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-xs text-[#8A6518] dark:text-[#D9AD43] font-medium">
                    Not Configured
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {section === 'library' && (
        <div className="space-y-5">
          <div>
            <h1 className="font-serif text-3xl font-semibold text-[#06452C] dark:text-white">
              Digital Library (General, Islamic, Arabic &amp; Quran Resources)
            </h1>
            {!storage && (
              <p className="text-xs text-[#8A6518] dark:text-[#D9AD43] mt-1">
                Firebase Storage Bucket Status: Not Configured — add library catalog entries with an
                external HTTPS PDF URL below without requiring Firebase Storage.
              </p>
            )}
          </div>

          {canManageLib && (
            <form
              onSubmit={handleUploadLibrary}
              className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-5 gap-3"
            >
              <input
                type="text"
                required
                placeholder="Book / PDF Title"
                value={libTitle}
                onChange={(e) => setLibTitle(e.target.value)}
                className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
              />
              <select
                value={libCategory}
                onChange={(e) => setLibCategory(e.target.value)}
                className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
              >
                <option>General School Books</option>
                <option>Islamic Books</option>
                <option>Arabic Resources</option>
                <option>Quran Learning</option>
                <option>Subject Notes</option>
              </select>
              <select
                value={libClass}
                onChange={(e) => setLibClass(e.target.value)}
                className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
              >
                {classes.map((c) => (
                  <option key={c.id}>{c.name}</option>
                ))}
              </select>
              <input
                type="url"
                placeholder="Optional PDF URL (https://...)"
                value={libExternalUrl}
                onChange={(e) => setLibExternalUrl(e.target.value)}
                className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
              />
              <div className="flex gap-2">
                <label className="flex-1 flex items-center gap-1 px-2 py-2 text-xs border border-[#D9AD43]/40 rounded-lg cursor-pointer truncate">
                  <Upload className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{libFile ? libFile.name : 'PDF File'}</span>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setLibFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
                <button
                  type="submit"
                  className="px-3 py-2 text-xs font-semibold bg-[#06452C] text-white rounded-lg cursor-pointer"
                >
                  Add
                </button>
              </div>
            </form>
          )}

          <input
            type="text"
            value={libSearch}
            onChange={(e) => setLibSearch(e.target.value)}
            placeholder="Filter library by title, category, or class..."
            className="max-w-sm w-full px-3.5 py-2 text-xs bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-lg"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {library
              .filter(
                (item) =>
                  item.title.toLowerCase().includes(libSearch.toLowerCase()) ||
                  item.category.toLowerCase().includes(libSearch.toLowerCase()) ||
                  item.classId.toLowerCase().includes(libSearch.toLowerCase())
              )
              .map((res) => (
                <div
                  key={res.id}
                  className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-5 flex flex-col justify-between"
                >
                  <div>
                    <p className="text-xs font-semibold text-[#8A6518] dark:text-[#D9AD43]">
                      {res.category} · {res.classId}
                    </p>
                    <h3 className="font-serif text-xl font-semibold mt-1">{res.title}</h3>
                    <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5] mt-1">By {res.author}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#EFE6D2] dark:border-[#D9AD43]/20 flex justify-between items-center text-xs">
                    <span className="inline-flex items-center gap-1 text-[#06452C] dark:text-[#D9AD43]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {res.allowDownload ? 'Download Permitted' : 'View Only'}
                    </span>
                    {res.fileUrl.startsWith('http') ? (
                      <a
                        href={res.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold underline"
                      >
                        Open PDF
                      </a>
                    ) : (
                      <span className="text-[11px] text-[#5A6D64]">Catalog Entry</span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
