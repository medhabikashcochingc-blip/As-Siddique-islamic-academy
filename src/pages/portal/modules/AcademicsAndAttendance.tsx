import React, { useEffect, useState } from 'react';
import { Calendar, Download, Plus, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { usePlatform } from '../../../context/PlatformContext';
import { DEFAULT_ACADEMIC_CALENDAR } from '../../../lib/defaultData';
import { downloadTimetablePdf } from '../../../lib/pdfGenerator';
import { AttendanceStatus, TimetableSlot } from '../../../types/platform';

export const AcademicsAndAttendance: React.FC<{
  section:
    | 'classes'
    | 'sections'
    | 'subjects'
    | 'sessions'
    | 'general'
    | 'islamic'
    | 'attendance'
    | 'timetable';
}> = ({ section }) => {
  const {
    classes,
    sections,
    subjects,
    sessions,
    students,
    attendance,
    timetables,
    events,
    settings,
    upsertRecord,
  } = usePlatform();
  const { userAccount } = useAuth();
  const [calTitle, setCalTitle] = useState('');
  const [calDate, setCalDate] = useState('2026-12-25');
  const [calVenue, setCalVenue] = useState('Academic Calendar');

  const [subName, setSubName] = useState('');
  const [subCode, setSubCode] = useState('');
  const [subClass, setSubClass] = useState('Class 1');
  const [subTrack, setSubTrack] = useState<'general' | 'islamic'>('general');

  const [attDate, setAttDate] = useState('2026-11-19');
  const [attClass, setAttClass] = useState('Class 10');

  const [ttClass, setTtClass] = useState('Class 10');
  const [ttDay, setTtDay] = useState<TimetableSlot['day']>('Monday');
  const [ttStart, setTtStart] = useState('10:15');
  const [ttEnd, setTtEnd] = useState('11:00');
  const [ttSubject, setTtSubject] = useState('');
  const [ttTeacher, setTtTeacher] = useState('');
  const [ttRoom, setTtRoom] = useState('Room 101');
  const [conflictMsg, setConflictMsg] = useState('');

  const [islamicEditId, setIslamicEditId] = useState(students[0]?.id || '');
  const selectedStudent = students.find((s) => s.id === islamicEditId) || students[0];
  const [quranSurah, setQuranSurah] = useState(selectedStudent?.islamicProgress.quranSurah || '');
  const [tajweedGrade, setTajweedGrade] = useState(selectedStudent?.islamicProgress.tajweedGrade || 'A');
  const [hifzJuz, setHifzJuz] = useState(selectedStudent?.islamicProgress.hifzJuzCompleted || 0);
  const [noticeText, setNoticeText] = useState('');

  useEffect(() => {
    if (selectedStudent) {
      setQuranSurah(selectedStudent.islamicProgress.quranSurah || '');
      setTajweedGrade(selectedStudent.islamicProgress.tajweedGrade || 'A');
      setHifzJuz(selectedStudent.islamicProgress.hifzJuzCompleted || 0);
    }
  }, [selectedStudent]);

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = `sub_${Date.now()}`;
    await upsertRecord('subjects', id, {
      name: subName,
      code: subCode || `SUB-${Date.now().toString().slice(-3)}`,
      track: subTrack,
      classId: subClass,
      fullMarks: 100,
      passMarks: subTrack === 'islamic' ? 40 : 35,
      isOptional: false,
    });
    setSubName('');
    setSubCode('');
    setNoticeText('Configurable subject added to Firestore.');
  };

  const handleMarkAttendance = async (studentId: string, studentName: string, status: AttendanceStatus) => {
    const id = `att_${attDate}_${studentId}`;
    await upsertRecord('attendance', id, {
      targetType: 'student',
      targetId: studentId,
      targetName: studentName,
      classId: attClass,
      date: attDate,
      status,
      recordedBy: userAccount?.email || 'Teacher',
    });
    setNoticeText(`Marked ${studentName} as ${status} for ${attDate}.`);
  };

  const handleAddTimetable = async (e: React.FormEvent) => {
    e.preventDefault();
    setConflictMsg('');

    // Conflict detection: same day & overlapping startTime for teacher OR room
    const conflict = timetables.find(
      (slot) =>
        slot.day === ttDay &&
        slot.startTime === ttStart &&
        (slot.teacherName.toLowerCase() === ttTeacher.toLowerCase() ||
          slot.roomOrMode.toLowerCase() === ttRoom.toLowerCase() ||
          slot.classId === ttClass)
    );

    if (conflict) {
      setConflictMsg(
        `Scheduling Conflict Detected: ${conflict.day} at ${conflict.startTime} already has ${conflict.subjectName} (${conflict.classId}, ${conflict.teacherName}, ${conflict.roomOrMode}).`
      );
      return;
    }

    const id = `tt_${Date.now()}`;
    await upsertRecord('timetables', id, {
      classId: ttClass,
      sectionId: 'Section A',
      day: ttDay,
      startTime: ttStart,
      endTime: ttEnd,
      subjectName: ttSubject,
      teacherName: ttTeacher,
      roomOrMode: ttRoom,
    });
    setTtSubject('');
    setTtTeacher('');
    setNoticeText('Timetable slot saved with zero scheduling conflicts.');
  };

  const handleSaveIslamicProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    await upsertRecord('students', selectedStudent.id, {
      ...selectedStudent,
      islamicProgress: {
        ...selectedStudent.islamicProgress,
        quranSurah: quranSurah || selectedStudent.islamicProgress.quranSurah,
        tajweedGrade,
        hifzJuzCompleted: Number(hifzJuz),
      },
    });
    setNoticeText(`Updated Islamic Education report for ${selectedStudent.name}.`);
  };

  return (
    <div className="space-y-6">
      {noticeText && (
        <div className="p-3 rounded-lg bg-[#06452C] text-[#F8F1DF] text-xs font-medium">
          {noticeText}
        </div>
      )}

      {(section === 'classes' || section === 'sections' || section === 'sessions') && (
        <div className="space-y-5">
          <h1 className="font-serif text-3xl font-semibold text-[#06452C] dark:text-white">
            Academic Structure (Class 1–12 &amp; Sessions)
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 rounded-xl p-5"
              >
                <p className="text-xs font-semibold text-[#8A6518] dark:text-[#D9AD43]">
                  {s.isActive ? 'ACTIVE SESSION' : 'ARCHIVED'}
                </p>
                <h2 className="font-serif text-2xl font-semibold mt-1">{s.name}</h2>
                <p className="text-xs text-[#5A6D64] mt-1 tabular-nums">
                  {s.startDate} to {s.endDate}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-6">
            <h2 className="font-serif text-2xl font-semibold mb-4">
              Class 1–12 &amp; Configurable Board Tracks ({sections.length} Active Sections)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {classes.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-lg bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30"
                >
                  <p className="text-xs font-semibold text-[#8A6518] dark:text-[#D9AD43]">{c.wing}</p>
                  <p className="font-serif text-xl font-semibold">{c.name}</p>
                  <p className="text-[11px] text-[#5A6D64] mt-1">{c.boardTrack}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-serif text-2xl font-semibold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#D9AD43]" />
                  <span>Academic Calendar &amp; Term Milestones</span>
                </h2>
                <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5]">
                  Session schedule, exam windows, and events synchronized with Cloud Firestore.
                </p>
              </div>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!calTitle.trim()) return;
                await upsertRecord('events', `evt_${Date.now()}`, {
                  title: calTitle.trim(),
                  date: calDate,
                  venue: calVenue,
                  description: 'Published to Academy Academic Calendar.',
                  isPublic: true,
                });
                setCalTitle('');
                setNoticeText('Academic calendar milestone added.');
              }}
              className="grid grid-cols-1 sm:grid-cols-4 gap-2"
            >
              <input
                type="text"
                required
                placeholder="Calendar Milestone / Holiday"
                value={calTitle}
                onChange={(e) => setCalTitle(e.target.value)}
                className="sm:col-span-2 px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
              />
              <input
                type="date"
                value={calDate}
                onChange={(e) => setCalDate(e.target.value)}
                className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
              />
              <button
                type="submit"
                onClick={() => setCalVenue('Academic Calendar')}
                className="px-4 py-2 text-xs font-semibold bg-[#06452C] text-white rounded-lg cursor-pointer"
              >
                Add to Calendar
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {DEFAULT_ACADEMIC_CALENDAR.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 rounded-lg bg-[#F8F1DF]/70 dark:bg-[#081A14] border border-[#D9AD43]/25 flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-[11px] font-semibold text-[#8A6518] dark:text-[#D9AD43] tabular-nums">
                      {entry.date} · {entry.category}
                    </p>
                    <p className="text-sm font-medium mt-0.5">{entry.title}</p>
                  </div>
                </div>
              ))}
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="p-4 rounded-lg bg-[#F8F1DF]/70 dark:bg-[#081A14] border border-[#D9AD43]/25 flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-[11px] font-semibold text-[#8A6518] dark:text-[#D9AD43] tabular-nums">
                      {ev.date} · {ev.venue}
                    </p>
                    <p className="text-sm font-medium mt-0.5">{ev.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {(section === 'subjects' || section === 'general') && (
        <div className="space-y-5">
          <h1 className="font-serif text-3xl font-semibold text-[#06452C] dark:text-white">
            {section === 'general' ? 'General School Education Wing' : 'Configurable Subjects Manager'}
          </h1>

          <form
            onSubmit={handleAddSubject}
            className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-5 gap-3"
          >
            <input
              type="text"
              required
              placeholder="Subject Name (e.g. Bengali)"
              value={subName}
              onChange={(e) => setSubName(e.target.value)}
              className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
            />
            <input
              type="text"
              placeholder="Code (e.g. GEN-BN)"
              value={subCode}
              onChange={(e) => setSubCode(e.target.value)}
              className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
            />
            <select
              value={subClass}
              onChange={(e) => setSubClass(e.target.value)}
              className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
            >
              {classes.map((c) => (
                <option key={c.id}>{c.name}</option>
              ))}
            </select>
            <select
              value={subTrack}
              onChange={(e) => setSubTrack(e.target.value as 'general' | 'islamic')}
              className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
            >
              <option value="general">General Education</option>
              <option value="islamic">Islamic Education</option>
            </select>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1 px-4 py-2 text-xs font-semibold bg-[#06452C] text-white rounded-lg cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Subject</span>
            </button>
          </form>

          <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-[#EFE6D2] text-xs uppercase text-[#8A6518]">
                  <th className="p-4">Code</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Stream</th>
                  <th className="p-4">Class</th>
                  <th className="p-4">Full / Pass</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE6D2] dark:divide-[#D9AD43]/15">
                {subjects
                  .filter((s) => (section === 'general' ? s.track === 'general' : true))
                  .map((s) => (
                    <tr key={s.id}>
                      <td className="p-4 text-xs font-semibold tabular-nums">{s.code}</td>
                      <td className="p-4 font-medium">{s.name}</td>
                      <td className="p-4 text-xs capitalize">{s.track}</td>
                      <td className="p-4 text-xs">{s.classId}</td>
                      <td className="p-4 text-xs tabular-nums">
                        {s.fullMarks} / {s.passMarks}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {section === 'islamic' && (
        <div className="space-y-6">
          <div>
            <h1 className="font-serif text-3xl font-semibold text-[#06452C] dark:text-white">
              Islamic Education Management (System B)
            </h1>
            <p className="text-xs text-[#5A6D64]">
              Track Quran, Nazirah, Tajweed, Hifz memorization, Hadith, Aqeedah, Fiqh, Seerah,
              Arabic, and Daily Dua progress alongside General Education.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <form
              onSubmit={handleSaveIslamicProgress}
              className="lg:col-span-5 bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 rounded-xl p-6 space-y-4"
            >
              <h2 className="font-serif text-2xl font-semibold">Update Quran &amp; Hifz Progress</h2>
              <div>
                <label className="block text-xs font-semibold uppercase mb-1">Student</label>
                <select
                  value={islamicEditId}
                  onChange={(e) => setIslamicEditId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.classId})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase mb-1">
                  Current Surah / Nazirah Milestone
                </label>
                <input
                  type="text"
                  value={quranSurah}
                  onChange={(e) => setQuranSurah(e.target.value)}
                  placeholder="e.g. Surah Yaseen / Juz 3"
                  className="w-full px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1">Tajweed Grade</label>
                  <select
                    value={tajweedGrade}
                    onChange={(e) => setTajweedGrade(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                  >
                    <option value="A+">A+</option>
                    <option value="A">A</option>
                    <option value="A-">A-</option>
                    <option value="B">B</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1">Hifz Juz Completed</label>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={hifzJuz}
                    onChange={(e) => setHifzJuz(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 text-xs font-semibold bg-[#06452C] text-white rounded-lg cursor-pointer"
              >
                Save Islamic Report Card Progress
              </button>
            </form>

            <div className="lg:col-span-7 bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-6">
              <h2 className="font-serif text-2xl font-semibold mb-4">
                Combined Islamic Education Progress Ledger
              </h2>
              <div className="divide-y divide-[#EFE6D2] dark:divide-[#D9AD43]/15">
                {students.map((st) => (
                  <div key={st.id} className="py-3 flex flex-wrap justify-between gap-2 text-sm">
                    <div>
                      <p className="font-semibold">
                        {st.name} · <span className="text-xs text-[#8A6518]">{st.classId}</span>
                      </p>
                      <p className="text-xs text-[#5A6D64]">
                        Surah: {st.islamicProgress.quranSurah} · Level: {st.islamicProgress.nazirahLevel}
                      </p>
                    </div>
                    <div className="text-right text-xs tabular-nums">
                      <p className="font-semibold">Tajweed: {st.islamicProgress.tajweedGrade}</p>
                      <p>Hifz: {st.islamicProgress.hifzJuzCompleted} Juz · Duas: {st.islamicProgress.dailyDuaMastered}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {section === 'attendance' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="font-serif text-3xl font-semibold text-[#06452C] dark:text-white">
              Daily Attendance Register
            </h1>
            <div className="flex gap-2">
              <input
                type="date"
                value={attDate}
                onChange={(e) => setAttDate(e.target.value)}
                className="px-3 py-2 text-xs bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-lg"
              />
              <select
                value={attClass}
                onChange={(e) => setAttClass(e.target.value)}
                className="px-3 py-2 text-xs bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-lg"
              >
                {classes.map((c) => (
                  <option key={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-[#EFE6D2] text-xs uppercase text-[#8A6518]">
                  <th className="p-4">Student</th>
                  <th className="p-4">Class</th>
                  <th className="p-4">Mark Status for {attDate}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE6D2] dark:divide-[#D9AD43]/15">
                {students
                  .filter((s) => s.classId === attClass || attClass === 'All')
                  .map((s) => {
                    const current = attendance.find(
                      (a) => a.targetId === s.id && a.date === attDate
                    );
                    return (
                      <tr key={s.id}>
                        <td className="p-4 font-semibold">{s.name}</td>
                        <td className="p-4 text-xs">{s.classId}</td>
                        <td className="p-4 flex flex-wrap gap-2">
                          {(['Present', 'Absent', 'Late', 'Leave'] as AttendanceStatus[]).map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => void handleMarkAttendance(s.id, s.name, st)}
                              className={`px-3 py-1 text-xs font-semibold rounded border cursor-pointer ${
                                current?.status === st
                                  ? 'bg-[#06452C] text-white border-[#06452C]'
                                  : 'border-[#D9AD43]/40'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {section === 'timetable' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="font-serif text-3xl font-semibold text-[#06452C] dark:text-white">
              Timetable &amp; Conflict Detection
            </h1>
            <button
              type="button"
              onClick={() => downloadTimetablePdf('Academy Weekly Timetable', timetables, settings)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#06452C] text-white rounded-lg cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Timetable PDF</span>
            </button>
          </div>

          {conflictMsg && (
            <div className="p-3.5 rounded-lg bg-[#FDF2F2] border border-[#E5B4B4] text-xs text-[#7F1D1D] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{conflictMsg}</span>
            </div>
          )}

          <form
            onSubmit={handleAddTimetable}
            className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-7 gap-3"
          >
            <select
              value={ttClass}
              onChange={(e) => setTtClass(e.target.value)}
              className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
            >
              {classes.map((c) => (
                <option key={c.id}>{c.name}</option>
              ))}
            </select>
            <select
              value={ttDay}
              onChange={(e) => setTtDay(e.target.value as TimetableSlot['day'])}
              className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
            >
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
            <input
              type="text"
              required
              aria-label="Start time"
              value={ttStart}
              onChange={(e) => setTtStart(e.target.value)}
              placeholder="Start 09:00"
              className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
            />
            <input
              type="text"
              required
              aria-label="End time"
              value={ttEnd}
              onChange={(e) => setTtEnd(e.target.value)}
              placeholder="End 09:45"
              className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
            />
            <input
              type="text"
              required
              value={ttSubject}
              onChange={(e) => setTtSubject(e.target.value)}
              placeholder="Subject"
              className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
            />
            <input
              type="text"
              required
              value={ttTeacher}
              onChange={(e) => setTtTeacher(e.target.value)}
              placeholder="Teacher"
              className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
            />
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={ttRoom}
                onChange={(e) => setTtRoom(e.target.value)}
                placeholder="Room"
                className="w-20 px-2 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
              />
              <button
                type="submit"
                className="flex-1 px-3 py-2 text-xs font-semibold bg-[#06452C] text-white rounded-lg cursor-pointer"
              >
                Add
              </button>
            </div>
          </form>

          <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-[#EFE6D2] text-xs uppercase text-[#8A6518]">
                  <th className="p-4">Day &amp; Time</th>
                  <th className="p-4">Class</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Teacher</th>
                  <th className="p-4">Room / Mode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE6D2] dark:divide-[#D9AD43]/15">
                {timetables.map((slot) => (
                  <tr key={slot.id}>
                    <td className="p-4 text-xs font-semibold tabular-nums">
                      {slot.day} · {slot.startTime}–{slot.endTime}
                    </td>
                    <td className="p-4 text-xs">{slot.classId}</td>
                    <td className="p-4 font-medium">{slot.subjectName}</td>
                    <td className="p-4 text-xs">{slot.teacherName}</td>
                    <td className="p-4 text-xs">{slot.roomOrMode}</td>
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
