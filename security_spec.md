# Security Specification — As-Siddique Islamic Academy

## 1. Data Invariants & Master Source of Truth
1. **Master Role Authority**: User roles (`super_admin`, `admin`, `principal`, `teacher`, `accountant`, `student`, `parent`, `librarian`, `staff`) and `status` (`active` | `deactivated`) live exclusively in `/users/{uid}` (and bootstrapped super admin `medhabikashcochingc@gmail.com` verified via `request.auth.token.email_verified == true`). Client-supplied role claims in tokens or localStorage are NEVER trusted.
2. **Self-Registration Guard**: When a new user creates their own `/users/{uid}` document on first Google login, they may ONLY set `role: 'student'` (or `'guest'`) and `status: 'active'`, and `uid == request.auth.uid`. They CANNOT self-assign `admin`, `super_admin`, `principal`, `teacher`, `accountant`, `librarian`, or `staff`.
3. **PII Isolation**:
   - `/students/{studentId}`, `/parents/{parentId}`, `/staff/{staffId}`, `/staffPayroll/{id}`, `/invoices/{id}`, `/payments/{id}` contain PII or confidential financial records and are NEVER publicly readable.
   - Public examination results live in `/results/{resultId}` ONLY after formal approval (`isPublished == true && status == 'approved'`) and contain NO phone numbers, addresses, emails, or dates of birth.
4. **Admission Integrity**: Public visitors may submit `/admissions/{admissionId}` ONLY with `status == 'Pending'`, bounded string lengths, and `createdAt == request.time`. Only authorized Admin/Principal/Staff may transition status (`Pending` -> `Under Review` -> `Approved` | `Rejected`).
5. **Temporal & Structural Integrity**: All `createdAt` / `updatedAt` timestamps on validated writes match `request.time`. All document IDs match `^[a-zA-Z0-9_\\-]+$` and `<= 128` chars. No unbounded lists or shadow fields are permitted (`keys().hasOnly(...)` + `affectedKeys().hasOnly(...)`).
6. **Immutable Audit Trail**: `/auditLogs/{logId}` is append-only for authenticated staff/system actions (`allow update, delete: if false`).

## 2. "Dirty Dozen" Adversarial Payloads (Must All Return PERMISSION_DENIED)
1. **Privilege Escalation on Signup**: Unauthenticated or new user writes `/users/{uid}` with `role: 'super_admin'`.
2. **Role Tampering on Update**: Authenticated student updates `/users/{uid}` changing `role` from `'student'` to `'admin'`.
3. **Unverified Admin Email Spoof**: User with `email == 'medhabikashcochingc@gmail.com'` and `email_verified == false` attempts admin write.
4. **Shadow Field Injection**: Applicant submits `/admissions/{id}` including an extra ghost field `isApproved: true`.
5. **Admission Status Shortcut**: Public user submits `/admissions/{id}` directly with `status: 'Approved'`.
6. **Student PII Scraping**: Authenticated student executes `list` on `/students` without `studentUid == request.auth.uid`.
7. **Unlinked Parent Read**: Parent A attempts `get` on Student B's record where `parentUid != request.auth.uid`.
8. **Salary Data Leak**: Teacher attempts `get` or `list` on `/staffPayroll/{id}`.
9. **Unapproved Result Leak**: Public visitor queries `/results` where `isPublished == false`.
10. **Audit Log Tampering**: Admin attempts `delete` or `update` on `/auditLogs/{logId}`.
11. **ID Poisoning**: Attacker attempts `create` on `/admissions/{1500_char_id}` or ID containing spaces/slashes.
12. **Fake Timestamp Backdating**: User submits `/admissions/{id}` with `createdAt` set to a past year instead of `request.time`.
