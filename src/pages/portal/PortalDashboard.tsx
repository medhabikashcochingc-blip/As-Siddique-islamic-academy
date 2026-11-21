import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { hasPermission } from '../../lib/permissions';
import { PortalLayout, PORTAL_NAV_ITEMS } from './PortalLayout';
import {
  AccountsPortalView,
  ParentPortalView,
  PrincipalPortalView,
  SuperAdminPortalView,
  TeacherPortalView,
} from './RoleViews';
import { StudentPortalApp } from '../student/StudentPortalApp';
import { AcademicsAndAttendance } from './modules/AcademicsAndAttendance';
import { ExamsAndCertificates } from './modules/ExamsAndCertificates';
import { FinanceAndGovernance } from './modules/FinanceAndGovernance';
import { LmsAndLibrary } from './modules/LmsAndLibrary';
import { OverviewAndReports } from './modules/OverviewAndReports';
import { PeopleAndAdmissions } from './modules/PeopleAndAdmissions';

function getDefaultModuleForRole(role: string | null): string {
  if (role === 'super_admin') return 'super-admin-home';
  if (role === 'principal') return 'principal-home';
  if (role === 'accountant') return 'accounts-home';
  if (role === 'student') return 'student-home';
  if (role === 'parent') return 'parent-home';
  if (role === 'teacher') return 'teacher-home';
  return 'overview';
}

export const PortalDashboard: React.FC = () => {
  const { firebaseUser, userAccount, effectiveRole, authReady } = useAuth();
  const [activeModule, setActiveModule] = useState<string>(() =>
    getDefaultModuleForRole(effectiveRole)
  );
  const lastRoleRef = useRef<string | null>(effectiveRole);

  const allowedKeys = useMemo(
    () =>
      PORTAL_NAV_ITEMS.filter((i) =>
        hasPermission(effectiveRole || undefined, i.permission)
      ).map((i) => i.key),
    [effectiveRole]
  );

  // Switch neatly to the role's home view when Super Admin uses Role Previewer or permissions shift
  useEffect(() => {
    if (!effectiveRole) return;
    if (lastRoleRef.current !== effectiveRole) {
      lastRoleRef.current = effectiveRole;
      setActiveModule(getDefaultModuleForRole(effectiveRole));
      return;
    }
    if (!allowedKeys.includes(activeModule)) {
      setActiveModule(getDefaultModuleForRole(effectiveRole));
    }
  }, [effectiveRole, allowedKeys, activeModule]);

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F1DF] dark:bg-[#081A14]">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-[#06452C] border-t-[#D9AD43] rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-[#06452C] dark:text-[#D9AD43]">
            Loading As-Siddique Portal...
          </p>
        </div>
      </div>
    );
  }

  if (!firebaseUser || !userAccount) {
    return <Navigate to="/login" replace />;
  }

  // Strict portal separation: genuine student accounts stay in the dedicated mobile-first Student Portal
  if (userAccount.role === 'student') {
    return <Navigate to="/student" replace />;
  }

  const renderModule = () => {
    switch (activeModule) {
      case 'super-admin-home':
        return <SuperAdminPortalView onNavigateModule={(key) => setActiveModule(key)} />;
      case 'principal-home':
        return <PrincipalPortalView onNavigateModule={(key) => setActiveModule(key)} />;
      case 'accounts-home':
        return <AccountsPortalView onNavigateModule={(key) => setActiveModule(key)} />;
      case 'student-home':
        return <StudentPortalApp embeddedPreview />;
      case 'parent-home':
        return <ParentPortalView />;
      case 'teacher-home':
        return <TeacherPortalView onNavigateModule={(key) => setActiveModule(key)} />;
      case 'overview':
      case 'reports':
        return (
          <OverviewAndReports
            key={activeModule}
            initialTab={activeModule === 'reports' ? 'reports' : 'overview'}
          />
        );
      case 'admissions':
      case 'students':
      case 'parents':
      case 'teachers':
      case 'staff':
        return <PeopleAndAdmissions section={activeModule} />;
      case 'classes':
      case 'sections':
      case 'subjects':
      case 'sessions':
      case 'general':
      case 'islamic':
      case 'attendance':
      case 'timetable':
        return <AcademicsAndAttendance section={activeModule} />;
      case 'exams':
      case 'marks':
      case 'results':
      case 'marksheet':
      case 'certificates':
        return <ExamsAndCertificates section={activeModule} />;
      case 'homework':
      case 'assignments':
      case 'lms':
      case 'courses':
      case 'live-classes':
      case 'materials':
      case 'library':
        return <LmsAndLibrary section={activeModule} />;
      case 'fees':
      case 'payments':
      case 'notices':
      case 'events':
      case 'gallery':
      case 'users':
      case 'roles':
      case 'cms':
      case 'settings':
      case 'audit':
      case 'security':
        return <FinanceAndGovernance section={activeModule} />;
      default:
        return <OverviewAndReports key="overview-fallback" initialTab="overview" />;
    }
  };

  return (
    <PortalLayout activeModule={activeModule} onSelectModule={setActiveModule}>
      {renderModule()}
    </PortalLayout>
  );
};
