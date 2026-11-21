import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Download,
  Plus,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import firebaseConfig from '../../../../firebase-applet-config.json';
import { useAuth } from '../../../context/AuthContext';
import { usePlatform } from '../../../context/PlatformContext';
import { testConnection } from '../../../lib/firebase';
import { downloadFeeReceiptPdf } from '../../../lib/pdfGenerator';
import { BOOTSTRAPPED_SUPER_ADMIN_EMAIL, ROLE_DEFINITIONS } from '../../../lib/permissions';
import { InstitutionSettings, UserRole } from '../../../types/platform';

export const FinanceAndGovernance: React.FC<{
  section:
    | 'fees'
    | 'payments'
    | 'notices'
    | 'events'
    | 'gallery'
    | 'users'
    | 'roles'
    | 'cms'
    | 'settings'
    | 'audit'
    | 'security';
}> = ({ section }) => {
  const {
    feeStructures,
    invoices,
    payments,
    students,
    notices,
    events,
    gallery,
    users,
    settings,
    auditLogs,
    integrations,
    refreshIntegrations,
    seedDemoData,
    isSeedingDemo,
    upsertRecord,
    deleteRecord,
  } = usePlatform();
  const { userAccount } = useAuth();

  const [invStudentId, setInvStudentId] = useState(students[0]?.id || '');
  const [invTitle, setInvTitle] = useState('Monthly Tuition Fee');
  const [invAmount, setInvAmount] = useState(1200);
  const [invDiscount, setInvDiscount] = useState(0);

  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeCat, setNoticeCat] = useState<'Admissions' | 'Examinations' | 'Events & Holidays' | 'Academic'>('Academic');
  const [noticeSummary, setNoticeSummary] = useState('');

  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('2026-12-28');
  const [eventVenue, setEventVenue] = useState('Academy Campus');

  const [cmsForm, setCmsForm] = useState<InstitutionSettings>(settings);
  const [feedback, setFeedback] = useState('');
  const [checkingInt, setCheckingInt] = useState(false);
  const [guardCheckResult, setGuardCheckResult] = useState<string>('');
  const [fbCheckResult, setFbCheckResult] = useState<{ connected: boolean; message: string } | null>(
    null
  );
  const [checkingFb, setCheckingFb] = useState(false);

  useEffect(() => {
    setCmsForm(settings);
  }, [settings]);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find((s) => s.id === invStudentId);
    if (!st) return;
    const id = `INV-${Date.now().toString().slice(-6)}`;
    await upsertRecord('invoices', id, {
      invoiceNumber: id,
      studentId: st.studentId,
      studentName: st.name,
      classId: st.classId,
      title: invTitle,
      amount: Number(invAmount),
      discountAmount: Number(invDiscount),
      paidAmount: 0,
      dueDate: '2026-12-10',
      status: 'Unpaid',
    });
    setFeedback(`Created invoice ${id} for ${st.name}.`);
  };

  const handleRecordPayment = async (
    invoiceId: string,
    studentId: string,
    studentName: string,
    dueAmount: number,
    method: 'Cash' | 'Bank Transfer' | 'Online Gateway'
  ) => {
    if (method === 'Online Gateway' && !integrations?.paymentGateway.configured) {
      const resp = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await resp.json();
      setFeedback(data.message || 'Online Payment Gateway requires server configuration.');
      return;
    }

    const rcpId = `RCP-${Date.now().toString().slice(-6)}`;
    await upsertRecord('payments', rcpId, {
      receiptNumber: rcpId,
      invoiceId,
      studentId,
      studentName,
      amount: dueAmount,
      method,
      verified: true,
      paidAt: new Date().toISOString().slice(0, 10),
    });
    await upsertRecord('invoices', invoiceId, {
      paidAmount: dueAmount,
      status: 'Paid',
    });
    setFeedback(`Recorded ${method} payment (${rcpId}) for ${studentName}.`);
  };

  const handleAddNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = `not_${Date.now()}`;
    await upsertRecord('notices', id, {
      refCode: `AIA/${Date.now().toString().slice(-4)}`,
      title: noticeTitle,
      category: noticeCat,
      date: new Date().toISOString().slice(0, 10),
      summary: noticeSummary,
      body: noticeSummary,
      isPublic: true,
    });
    setNoticeTitle('');
    setNoticeSummary('');
    setFeedback('Notice published to public website.');
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = `evt_${Date.now()}`;
    await upsertRecord('events', id, {
      title: eventTitle,
      date: eventDate,
      venue: eventVenue,
      description: 'Scheduled via Academy CMS.',
      isPublic: true,
    });
    setEventTitle('');
    setFeedback('Event published to public calendar.');
  };

  const handleSaveCms = async (e: React.FormEvent) => {
    e.preventDefault();
    await upsertRecord(
      'institutionSettings',
      'main',
      cmsForm as unknown as Record<string, unknown>,
      'Updated public website CMS & Institution settings'
    );
    setFeedback('Institution settings & website content updated live in Firestore.');
  };

  return (
    <div className="space-y-6">
      {feedback && (
        <div className="p-3.5 rounded-lg bg-[#06452C] text-[#F8F1DF] text-xs font-medium">
          {feedback}
        </div>
      )}

      {(section === 'fees' || section === 'payments') && (
        <div className="space-y-6">
          <h1 className="font-serif text-3xl font-semibold text-[#06452C] dark:text-white">
            Fees, Invoices &amp; Payment Ledger
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {feeStructures.map((fs) => (
              <div
                key={fs.id}
                className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-4"
              >
                <p className="text-xs font-semibold text-[#8A6518] dark:text-[#D9AD43]">
                  {fs.category} · {fs.classId}
                </p>
                <p className="font-serif text-xl font-semibold mt-0.5">{fs.title}</p>
                <p className="text-sm font-bold tabular-nums mt-1">
                  ₹{fs.amount.toLocaleString('en-IN')} ({fs.frequency})
                </p>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleCreateInvoice}
            className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-5 gap-3"
          >
            <select
              value={invStudentId}
              onChange={(e) => setInvStudentId(e.target.value)}
              className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              required
              value={invTitle}
              onChange={(e) => setInvTitle(e.target.value)}
              placeholder="Invoice Title"
              className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
            />
            <input
              type="number"
              required
              value={invAmount}
              onChange={(e) => setInvAmount(Number(e.target.value))}
              placeholder="Amount"
              className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
            />
            <input
              type="number"
              value={invDiscount}
              onChange={(e) => setInvDiscount(Number(e.target.value))}
              placeholder="Scholarship / Discount"
              className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
            />
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-[#06452C] text-white rounded-lg cursor-pointer"
            >
              Issue Invoice
            </button>
          </form>

          <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-[#EFE6D2] text-xs uppercase text-[#8A6518]">
                  <th className="p-4">Invoice</th>
                  <th className="p-4">Student</th>
                  <th className="p-4">Net Payable</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Record Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE6D2] dark:divide-[#D9AD43]/15">
                {invoices.map((inv) => {
                  const net = Math.max(0, inv.amount - inv.discountAmount);
                  return (
                    <tr key={inv.id}>
                      <td className="p-4 text-xs tabular-nums">
                        <p className="font-semibold">{inv.invoiceNumber}</p>
                        <p>{inv.title}</p>
                      </td>
                      <td className="p-4 text-xs">{inv.studentName}</td>
                      <td className="p-4 text-xs font-semibold tabular-nums">
                        ₹{net.toLocaleString('en-IN')}
                      </td>
                      <td className="p-4 text-xs font-semibold">{inv.status}</td>
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        {inv.status !== 'Paid' && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                void handleRecordPayment(
                                  inv.id,
                                  inv.studentId,
                                  inv.studentName,
                                  net,
                                  'Cash'
                                )
                              }
                              className="px-2.5 py-1 text-xs bg-[#06452C] text-white rounded cursor-pointer"
                            >
                              Mark Cash Paid
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                void handleRecordPayment(
                                  inv.id,
                                  inv.studentId,
                                  inv.studentName,
                                  net,
                                  'Bank Transfer'
                                )
                              }
                              className="px-2.5 py-1 text-xs border border-[#06452C] rounded cursor-pointer"
                            >
                              Bank Transfer
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-5">
            <h2 className="font-serif text-2xl font-semibold mb-3">Payment Receipts</h2>
            <div className="divide-y divide-[#EFE6D2] dark:divide-[#D9AD43]/15">
              {payments.map((pay) => (
                <div key={pay.id} className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span>
                    <strong className="tabular-nums">{pay.receiptNumber}</strong> · {pay.studentName} ·{' '}
                    <strong className="tabular-nums">₹{pay.amount.toLocaleString('en-IN')}</strong> ({pay.method})
                  </span>
                  <button
                    type="button"
                    onClick={() => downloadFeeReceiptPdf(pay, settings)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#06452C] text-white rounded cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Receipt PDF</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {section === 'notices' && (
        <div className="space-y-5">
          <h1 className="font-serif text-3xl font-semibold text-[#06452C] dark:text-white">
            Notice Board CMS
          </h1>
          <form
            onSubmit={handleAddNotice}
            className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 rounded-xl p-5 space-y-3"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                required
                placeholder="Notice Title"
                value={noticeTitle}
                onChange={(e) => setNoticeTitle(e.target.value)}
                className="sm:col-span-2 px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
              />
              <select
                value={noticeCat}
                onChange={(e) =>
                  setNoticeCat(
                    e.target.value as 'Admissions' | 'Examinations' | 'Events & Holidays' | 'Academic'
                  )
                }
                className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
              >
                <option>Admissions</option>
                <option>Examinations</option>
                <option>Events & Holidays</option>
                <option>Academic</option>
              </select>
            </div>
            <textarea
              rows={2}
              required
              placeholder="Summary & Circular Details..."
              value={noticeSummary}
              onChange={(e) => setNoticeSummary(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#06452C] text-white rounded-lg cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Publish Notice</span>
            </button>
          </form>

          <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl divide-y divide-[#EFE6D2]">
            {notices.map((n) => (
              <div key={n.id} className="p-4 flex justify-between gap-4 text-sm">
                <div>
                  <p className="text-xs text-[#8A6518] tabular-nums">
                    {n.date} · {n.category}
                  </p>
                  <p className="font-semibold">{n.title}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void deleteRecord('notices', n.id)}
                  className="text-xs text-[#7F1D1D] cursor-pointer"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {section === 'events' && (
        <div className="space-y-5">
          <h1 className="font-serif text-3xl font-semibold text-[#06452C] dark:text-white">
            Events &amp; Gallery CMS
          </h1>
          <form
            onSubmit={handleAddEvent}
            className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/40 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-4 gap-3"
          >
            <input
              type="text"
              required
              placeholder="Event Title"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
            />
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
            />
            <input
              type="text"
              value={eventVenue}
              onChange={(e) => setEventVenue(e.target.value)}
              className="px-3 py-2 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
            />
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-[#06452C] text-white rounded-lg cursor-pointer"
            >
              Add Event
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-4 flex justify-between"
              >
                <div>
                  <p className="text-xs text-[#8A6518] tabular-nums">
                    {ev.date} · {ev.venue}
                  </p>
                  <p className="font-semibold text-sm">{ev.title}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void deleteRecord('events', ev.id)}
                  className="text-xs text-[#7F1D1D] cursor-pointer"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {section === 'gallery' && (
        <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-6 space-y-4">
          <h1 className="font-serif text-3xl font-semibold">Photo &amp; Video Gallery Manager</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {gallery.map((g) => (
              <div key={g.id} className="p-4 border border-[#D9AD43]/30 rounded-lg flex justify-between items-center">
                <div>
                  <p className="text-xs uppercase text-[#8A6518]">{g.mediaType}</p>
                  <p className="font-semibold text-sm">{g.title}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void deleteRecord('gallery', g.id)}
                  className="text-xs text-[#7F1D1D] cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {(section === 'users' || section === 'roles') && (
        <div className="space-y-6">
          <h1 className="font-serif text-3xl font-semibold text-[#06452C] dark:text-white">
            User &amp; Role-Based Access Management
          </h1>

          <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-[#EFE6D2] text-xs uppercase text-[#8A6518]">
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Student Profile Link</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Account Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE6D2] dark:divide-[#D9AD43]/15">
                {users.map((u) => (
                  <tr key={u.uid}>
                    <td className="p-4 text-xs">
                      <p className="font-semibold">{u.displayName}</p>
                      <p className="text-[#5A6D64]">{u.email}</p>
                    </td>
                    <td className="p-4">
                      <select
                        value={u.role}
                        onChange={(e) =>
                          void upsertRecord('users', u.uid, {
                            ...u,
                            role: e.target.value as UserRole,
                          })
                        }
                        className="px-2.5 py-1.5 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded"
                      >
                        {Object.keys(ROLE_DEFINITIONS).map((r) => (
                          <option key={r} value={r}>
                            {ROLE_DEFINITIONS[r as UserRole].label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4">
                      {u.role === 'student' ? (
                        <select
                          value={u.linkedStudentId || ''}
                          onChange={async (e) => {
                            const nextId = e.target.value;
                            await upsertRecord('users', u.uid, {
                              ...u,
                              linkedStudentId: nextId,
                            });
                            if (nextId) {
                              const st = students.find((s) => s.id === nextId || s.studentId === nextId);
                              if (st) {
                                await upsertRecord('students', st.id, {
                                  ...st,
                                  studentUid: u.uid,
                                });
                              }
                            }
                            setFeedback(`Linked ${u.displayName} to student record ${nextId || 'none'}.`);
                          }}
                          className="px-2.5 py-1.5 text-xs bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded max-w-[200px]"
                        >
                          <option value="">Not Linked</option>
                          {students.map((st) => (
                            <option key={st.id} value={st.id}>
                              {st.name} ({st.admissionNumber})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-xs text-[#5A6D64]">—</span>
                      )}
                    </td>
                    <td className="p-4 text-xs font-semibold capitalize">{u.status}</td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        disabled={u.uid === userAccount?.uid}
                        onClick={() =>
                          void upsertRecord('users', u.uid, {
                            ...u,
                            status: u.status === 'active' ? 'deactivated' : 'active',
                          })
                        }
                        className="px-3 py-1 text-xs border border-[#D9AD43]/45 rounded cursor-pointer disabled:opacity-40"
                      >
                        {u.status === 'active' ? 'Deactivate' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.values(ROLE_DEFINITIONS).map((r) => (
              <div
                key={r.role}
                className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/30 rounded-xl p-4"
              >
                <p className="font-serif text-lg font-semibold text-[#06452C] dark:text-[#D9AD43]">
                  {r.label}
                </p>
                <p className="text-xs text-[#5A6D64] mt-1">{r.description}</p>
                <p className="text-[11px] mt-2 text-[#8A6518] tabular-nums">
                  {r.permissions.length} Server-Enforced Permissions
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {section === 'settings' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl font-semibold text-[#06452C] dark:text-white">
                Admin System Settings &amp; External Integrations
              </h1>
              <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5] mt-1">
                Optional external providers are non-blocking. Core ERP, LMS, Admissions, PDFs, and
                Cash/Bank fee ledgers operate normally when integrations are Not Configured.
              </p>
            </div>
            <button
              type="button"
              disabled={checkingInt}
              onClick={async () => {
                setCheckingInt(true);
                await refreshIntegrations();
                setCheckingInt(false);
                setFeedback('Refreshed live server integration status from /api/integrations/status.');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#06452C] text-[#F8F1DF] text-xs font-semibold hover:bg-[#102D23] cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checkingInt ? 'animate-spin' : ''}`} />
              <span>{checkingInt ? 'Checking...' : 'Refresh Integration Status'}</span>
            </button>
          </div>

          {/* 4 Optional Integrations Status Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                key: 'payment',
                title: 'Online Payment Gateway (Razorpay)',
                detail: integrations.paymentGateway,
              },
              {
                key: 'email',
                title: 'Email Notification Relay (SMTP)',
                detail: integrations.emailNotifications,
              },
              {
                key: 'sms',
                title: 'SMS Alert Provider (Twilio)',
                detail: integrations.smsNotifications,
              },
              {
                key: 'video',
                title: 'Live Video Conferencing API',
                detail: integrations.videoConferencing,
              },
            ].map((item) => (
              <div
                key={item.key}
                className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-5 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-xl font-semibold text-[#06452C] dark:text-white">
                      {item.title}
                    </h2>
                    <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5]">
                      Active Provider: <strong>{item.detail.provider}</strong>
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold shrink-0 ${
                      item.detail.configured
                        ? 'bg-[#06452C]/15 text-[#06452C] dark:text-[#4ADE80]'
                        : 'bg-[#D9AD43]/20 text-[#8A6518] dark:text-[#D9AD43]'
                    }`}
                  >
                    {item.detail.configured ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    )}
                    {item.detail.statusLabel}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[#F8F1DF] dark:bg-[#081A14] text-xs space-y-1.5">
                  <p className="text-[#314A3F] dark:text-[#E6DFCE]">
                    <strong>Active Fallback:</strong> {item.detail.fallbackMode}
                  </p>
                  <p className="text-[11px] text-[#5A6D64] dark:text-[#C9C2B2]">
                    <strong>Required Server Env Vars:</strong>{' '}
                    <code>{item.detail.requiredEnv.join(', ')}</code>
                  </p>
                  {!item.detail.configured && item.detail.missingEnv.length > 0 && (
                    <p className="text-[11px] text-[#8A6518] dark:text-[#D9AD43]">
                      <strong>Missing Env Vars:</strong>{' '}
                      <code>{item.detail.missingEnv.join(', ')}</code>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Diagnostic Guard Verification Controls */}
          <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-6 space-y-4">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-[#06452C] dark:text-white">
                Security &amp; Integration Fallback Verification
              </h2>
              <p className="text-xs text-[#5A6D64] dark:text-[#DED7C5] mt-1">
                Verify that server endpoints safely block unconfigured online payments and external
                dispatch without crashing or exposing secrets.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await fetch('/api/payments/verify', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ orderId: 'test', paymentId: 'test', signature: 'test' }),
                    });
                    const body = await res.json();
                    setGuardCheckResult(
                      `POST /api/payments/verify -> HTTP ${res.status} (${body.error || 'OK'}): ${body.message}`
                    );
                  } catch (err) {
                    setGuardCheckResult(err instanceof Error ? err.message : 'Request failed');
                  }
                }}
                className="px-4 py-2 rounded-lg border border-[#D9AD43]/50 text-xs font-semibold hover:bg-[#F8F1DF] dark:hover:bg-[#081A14] cursor-pointer"
              >
                Test Payment Verification Guard
              </button>

              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await fetch('/api/notifications/dispatch', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ channel: 'email' }),
                    });
                    const body = await res.json();
                    setGuardCheckResult(
                      `POST /api/notifications/dispatch (email) -> HTTP ${res.status} (${body.error || 'OK'}): ${body.message}`
                    );
                  } catch (err) {
                    setGuardCheckResult(err instanceof Error ? err.message : 'Request failed');
                  }
                }}
                className="px-4 py-2 rounded-lg border border-[#D9AD43]/50 text-xs font-semibold hover:bg-[#F8F1DF] dark:hover:bg-[#081A14] cursor-pointer"
              >
                Test SMTP Fallback Guard
              </button>

              <button
                type="button"
                disabled={isSeedingDemo}
                onClick={() => void seedDemoData()}
                className="px-4 py-2 rounded-lg bg-[#D9AD43] text-[#102D23] text-xs font-semibold hover:bg-[#c79b32] cursor-pointer disabled:opacity-60"
              >
                {isSeedingDemo ? 'Syncing Demo Dataset...' : 'Sync Demo Dataset to Firestore'}
              </button>
            </div>

            {guardCheckResult && (
              <div className="p-3.5 rounded-lg bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/35 text-xs font-mono text-[#06452C] dark:text-[#D9AD43]">
                {guardCheckResult}
              </div>
            )}
          </div>

          {/* Firebase Setup & Super Admin Instructions */}
          <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-[#06452C] dark:text-[#D9AD43]" />
                <h2 className="font-serif text-2xl font-semibold text-[#06452C] dark:text-white">
                  Firebase Setup &amp; Super Admin Verification
                </h2>
              </div>
              <button
                type="button"
                disabled={checkingFb}
                onClick={async () => {
                  setCheckingFb(true);
                  const res = await testConnection();
                  setFbCheckResult(res);
                  setCheckingFb(false);
                }}
                className="px-4 py-2 rounded-lg bg-[#06452C] text-white text-xs font-semibold cursor-pointer disabled:opacity-60"
              >
                {checkingFb ? 'Testing...' : 'Test Firestore Connection'}
              </button>
            </div>

            {fbCheckResult && (
              <div
                className={`p-3 rounded-lg text-xs font-medium border ${
                  fbCheckResult.connected
                    ? 'bg-[#06452C]/10 border-[#06452C]/30 text-[#06452C] dark:text-[#4ADE80]'
                    : 'bg-[#FDF2F2] border-[#E5B4B4] text-[#7F1D1D]'
                }`}
              >
                Firestore Check: {fbCheckResult.connected ? 'Connected' : 'Error'} —{' '}
                {fbCheckResult.message}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-lg bg-[#F8F1DF] dark:bg-[#081A14] space-y-1.5">
                <p className="font-semibold text-[#8A6518] dark:text-[#D9AD43] uppercase">
                  Connected Firebase Configuration
                </p>
                <p>
                  <strong>Project ID:</strong> <code>{firebaseConfig.projectId}</code>
                </p>
                <p>
                  <strong>Firestore DB ID:</strong>{' '}
                  <code className="break-all">{firebaseConfig.firestoreDatabaseId}</code>
                </p>
                <p>
                  <strong>Auth Domain:</strong> <code>{firebaseConfig.authDomain}</code>
                </p>
                <p>
                  <strong>Bootstrapped Super Admin:</strong>{' '}
                  <code>{BOOTSTRAPPED_SUPER_ADMIN_EMAIL}</code>
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#F8F1DF] dark:bg-[#081A14] space-y-1.5 leading-relaxed">
                <p className="font-semibold text-[#8A6518] dark:text-[#D9AD43] uppercase">
                  Firebase Console Checklist
                </p>
                <p>
                  1. <strong>Google Sign-In:</strong> Enable under{' '}
                  <em>Authentication → Sign-in method → Google</em>.
                </p>
                <p>
                  2. <strong>Authorized Domains:</strong> Add preview/production domains under{' '}
                  <em>Authentication → Settings → Authorized domains</em>.
                </p>
                <p>
                  3. <strong>Storage Bucket:</strong> Enable Firebase Storage &amp; deploy{' '}
                  <code>storage.rules</code> for admission/library file uploads.
                </p>
                <p>
                  4. <strong>Server Secrets:</strong> Add optional provider credentials in your
                  runtime environment (see <code>.env.example</code>) and click Refresh above.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {section === 'cms' && (
        <form
          onSubmit={handleSaveCms}
          className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-6 sm:p-8 space-y-4 max-w-4xl"
        >
          <h1 className="font-serif text-3xl font-semibold text-[#06452C] dark:text-white">
            Institution Profile &amp; Public Website CMS
          </h1>
          <p className="text-xs text-[#5A6D64]">
            Updates saved here immediately reflect on the public website, PDF marksheets, and
            certificates.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase mb-1">Institution Name</label>
              <input
                type="text"
                value={cmsForm.name}
                onChange={(e) => setCmsForm({ ...cmsForm, name: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase mb-1">Tagline</label>
              <input
                type="text"
                value={cmsForm.tagline}
                onChange={(e) => setCmsForm({ ...cmsForm, tagline: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase mb-1">Campus Address</label>
              <input
                type="text"
                value={cmsForm.address}
                onChange={(e) => setCmsForm({ ...cmsForm, address: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase mb-1">Official Phone</label>
              <input
                type="text"
                value={cmsForm.phone}
                onChange={(e) => setCmsForm({ ...cmsForm, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase mb-1">Official Email</label>
              <input
                type="email"
                value={cmsForm.email}
                onChange={(e) => setCmsForm({ ...cmsForm, email: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase mb-1">Principal Name</label>
              <input
                type="text"
                value={cmsForm.principalName}
                onChange={(e) => setCmsForm({ ...cmsForm, principalName: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase mb-1">Hero Banner Headline</label>
            <input
              type="text"
              value={cmsForm.heroHeadline}
              onChange={(e) => setCmsForm({ ...cmsForm, heroHeadline: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase mb-1">Principal’s Message</label>
            <textarea
              rows={4}
              value={cmsForm.principalMessage}
              onChange={(e) => setCmsForm({ ...cmsForm, principalMessage: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 rounded-lg"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 text-sm font-semibold bg-[#06452C] text-white rounded-lg cursor-pointer"
          >
            Save Public CMS Settings
          </button>
        </form>
      )}

      {(section === 'audit' || section === 'security') && (
        <div className="space-y-6">
          <h1 className="font-serif text-3xl font-semibold text-[#06452C] dark:text-white">
            {section === 'audit' ? 'Immutable Audit Logs' : 'Security & Child Privacy Settings'}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-5">
              <p className="text-xs font-semibold uppercase text-[#8A6518] flex items-center gap-1.5 mb-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Firestore &amp; Storage Hardening Active</span>
              </p>
              <ul className="text-xs space-y-1.5 text-[#314A3F] dark:text-[#E6DFCE]">
                <li>• Zero self-assigned admin roles in user signup rules</li>
                <li>• Verified email required for all privileged mutations</li>
                <li>• Student PII isolated from public search &amp; result endpoints</li>
                <li>• Immutable append-only audit logs (`update, delete: if false`)</li>
              </ul>
            </div>
            <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl p-5">
              <p className="text-xs font-semibold uppercase text-[#8A6518] flex items-center gap-1.5 mb-2">
                <ShieldAlert className="w-4 h-4" />
                <span>Backup &amp; Recovery Guidance</span>
              </p>
              <p className="text-xs text-[#314A3F] dark:text-[#E6DFCE] leading-relaxed">
                Schedule daily managed Firestore exports (`gcloud firestore export`) to a regional
                Cloud Storage bucket in Google Cloud and enable Point-in-Time Recovery (PITR) for
                production deployments.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#102D23] border border-[#D9AD43]/35 rounded-xl overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left border-b border-[#EFE6D2] uppercase text-[#8A6518]">
                  <th className="p-3.5">Actor</th>
                  <th className="p-3.5">Action</th>
                  <th className="p-3.5">Target Collection</th>
                  <th className="p-3.5">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE6D2] dark:divide-[#D9AD43]/15">
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="p-3.5 font-medium">{log.actorEmail}</td>
                    <td className="p-3.5 font-semibold">{log.action}</td>
                    <td className="p-3.5">{log.collectionName}</td>
                    <td className="p-3.5">{log.detail}</td>
                  </tr>
                ))}
                {auditLogs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-[#5A6D64]">
                      Audit logs record automatically when authenticated staff perform Firestore mutations.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
