import { UserRole } from '../types/platform';

export type PermissionKey =
  | 'view_admin_overview'
  | 'manage_admissions'
  | 'approve_admissions'
  | 'manage_students'
  | 'manage_parents'
  | 'manage_teachers'
  | 'manage_staff_salary'
  | 'manage_academics'
  | 'manage_islamic_education'
  | 'manage_attendance'
  | 'manage_timetable'
  | 'manage_homework_assignments'
  | 'manage_lms'
  | 'manage_live_classes'
  | 'manage_exams_marks'
  | 'approve_results'
  | 'manage_fees_finance'
  | 'manage_library'
  | 'manage_certificates'
  | 'manage_cms_content'
  | 'manage_users_roles'
  | 'view_audit_logs'
  | 'view_reports'
  | 'student_portal'
  | 'parent_portal'
  | 'teacher_portal';

export interface RoleMeta {
  role: UserRole;
  label: string;
  description: string;
  permissions: PermissionKey[];
}

export const ROLE_DEFINITIONS: Record<UserRole, RoleMeta> = {
  super_admin: {
    role: 'super_admin',
    label: 'Super Admin',
    description: 'Full institutional, security, RBAC, finance, and academic authority.',
    permissions: [
      'view_admin_overview',
      'manage_admissions',
      'approve_admissions',
      'manage_students',
      'manage_parents',
      'manage_teachers',
      'manage_staff_salary',
      'manage_academics',
      'manage_islamic_education',
      'manage_attendance',
      'manage_timetable',
      'manage_homework_assignments',
      'manage_lms',
      'manage_live_classes',
      'manage_exams_marks',
      'approve_results',
      'manage_fees_finance',
      'manage_library',
      'manage_certificates',
      'manage_cms_content',
      'manage_users_roles',
      'view_audit_logs',
      'view_reports',
      'teacher_portal',
    ],
  },
  admin: {
    role: 'admin',
    label: 'Admin',
    description: 'Authorized school administration across students, staff, CMS, and operations.',
    permissions: [
      'view_admin_overview',
      'manage_admissions',
      'approve_admissions',
      'manage_students',
      'manage_parents',
      'manage_teachers',
      'manage_staff_salary',
      'manage_academics',
      'manage_islamic_education',
      'manage_attendance',
      'manage_timetable',
      'manage_homework_assignments',
      'manage_lms',
      'manage_live_classes',
      'manage_exams_marks',
      'approve_results',
      'manage_fees_finance',
      'manage_library',
      'manage_certificates',
      'manage_cms_content',
      'manage_users_roles',
      'view_audit_logs',
      'view_reports',
    ],
  },
  principal: {
    role: 'principal',
    label: 'Principal',
    description: 'Academic oversight, faculty supervision, result approval, and CMS guidance.',
    permissions: [
      'view_admin_overview',
      'manage_admissions',
      'approve_admissions',
      'manage_students',
      'manage_teachers',
      'manage_academics',
      'manage_islamic_education',
      'manage_attendance',
      'manage_timetable',
      'manage_exams_marks',
      'approve_results',
      'manage_certificates',
      'manage_cms_content',
      'view_audit_logs',
      'view_reports',
    ],
  },
  teacher: {
    role: 'teacher',
    label: 'Teacher',
    description: 'Assigned classes, attendance entry, homework, LMS lessons, and marks entry.',
    permissions: [
      'teacher_portal',
      'manage_attendance',
      'manage_homework_assignments',
      'manage_lms',
      'manage_live_classes',
      'manage_exams_marks',
      'manage_islamic_education',
    ],
  },
  accountant: {
    role: 'accountant',
    label: 'Accountant',
    description: 'Fee structures, student invoices, payment verification, receipts, and payroll.',
    permissions: [
      'view_admin_overview',
      'manage_fees_finance',
      'manage_staff_salary',
      'view_reports',
    ],
  },
  student: {
    role: 'student',
    label: 'Student',
    description: 'Personal learning portal: routine, homework, LMS, live classes, library, and results.',
    permissions: ['student_portal'],
  },
  parent: {
    role: 'parent',
    label: 'Parent',
    description: 'Verified children attendance, results, homework, routine, and fee status.',
    permissions: ['parent_portal'],
  },
  librarian: {
    role: 'librarian',
    label: 'Librarian',
    description: 'Digital library catalog, Quranic & school PDF uploads, and download permissions.',
    permissions: ['view_admin_overview', 'manage_library'],
  },
  staff: {
    role: 'staff',
    label: 'Staff',
    description: 'Admission intake desk, notices, events, gallery, and certificate issuance.',
    permissions: [
      'view_admin_overview',
      'manage_admissions',
      'manage_certificates',
      'manage_cms_content',
    ],
  },
};

export function hasPermission(role: UserRole | undefined, permission: PermissionKey): boolean {
  if (!role) return false;
  return ROLE_DEFINITIONS[role]?.permissions.includes(permission) ?? false;
}

export const BOOTSTRAPPED_SUPER_ADMIN_EMAIL = 'medhabikashcochingc@gmail.com';
