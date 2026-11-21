/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect } from 'react';
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';
import { ServiceWorkerUpdater } from './components/pwa/ServiceWorkerUpdater';
import { PublicLayout } from './components/public/PublicLayout';
import { AuthProvider } from './context/AuthContext';
import { PlatformProvider } from './context/PlatformContext';
import { AdmissionPage } from './pages/AdmissionPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import {
  AboutPage,
  ContactPage,
  CoursesPage,
  EventsPage,
  FaqPage,
  GalleryPage,
  GeneralEducationPage,
  IslamicEducationPage,
  LegalPage,
  ManagementCommitteePage,
  NoticesPage,
  PrincipalMessagePage,
  ProgrammesPage,
  TeacherProfilePage,
  TeachersPage,
  VisionMissionPage,
} from './pages/PublicInfoPages';
import { ResultPortalPage } from './pages/ResultPortalPage';
import { PortalDashboard } from './pages/portal/PortalDashboard';
import { StudentPortalApp } from './pages/student/StudentPortalApp';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
};

const NotFoundPage: React.FC = () => (
  <div className="max-w-3xl mx-auto px-4 py-24 text-center">
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A6518] dark:text-[#D9AD43] mb-2">
      404 · Page Not Found
    </p>
    <h1 className="font-serif text-4xl font-semibold text-[#06452C] dark:text-white mb-4">
      Requested Page Unavailable
    </h1>
    <p className="text-sm text-[#5A6D64] dark:text-[#DED7C5] mb-8">
      The page you are looking for does not exist or may have moved inside the As-Siddique Islamic
      Academy platform.
    </p>
    <Link
      to="/"
      className="inline-flex items-center px-6 py-3 rounded-lg bg-[#06452C] text-[#F8F1DF] font-semibold text-sm hover:bg-[#102D23]"
    >
      Return to Academy Homepage
    </Link>
  </div>
);

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <PlatformProvider>
          <BrowserRouter>
            <ScrollToTop />
            <OfflineIndicator />
            <ServiceWorkerUpdater />
            <Routes>
              {/* Authenticated RBAC Portal (ERP + LMS + Role Dashboards) */}
              <Route path="/portal/*" element={<PortalDashboard />} />

              {/* Dedicated Mobile-First Student Portal */}
              <Route path="/student/*" element={<StudentPortalApp />} />

              {/* Public Website & Standalone Portals */}
              <Route
                path="/"
                element={
                  <PublicLayout>
                    <HomePage />
                  </PublicLayout>
                }
              />
              <Route
                path="/about"
                element={
                  <PublicLayout>
                    <AboutPage />
                  </PublicLayout>
                }
              />
              <Route
                path="/vision-mission"
                element={
                  <PublicLayout>
                    <VisionMissionPage />
                  </PublicLayout>
                }
              />
              <Route
                path="/principal-message"
                element={
                  <PublicLayout>
                    <PrincipalMessagePage />
                  </PublicLayout>
                }
              />
              <Route
                path="/management-committee"
                element={
                  <PublicLayout>
                    <ManagementCommitteePage />
                  </PublicLayout>
                }
              />
              <Route
                path="/programmes"
                element={
                  <PublicLayout>
                    <ProgrammesPage />
                  </PublicLayout>
                }
              />
              <Route
                path="/general-education"
                element={
                  <PublicLayout>
                    <GeneralEducationPage />
                  </PublicLayout>
                }
              />
              <Route
                path="/islamic-education"
                element={
                  <PublicLayout>
                    <IslamicEducationPage />
                  </PublicLayout>
                }
              />
              <Route
                path="/courses"
                element={
                  <PublicLayout>
                    <CoursesPage />
                  </PublicLayout>
                }
              />
              <Route
                path="/teachers"
                element={
                  <PublicLayout>
                    <TeachersPage />
                  </PublicLayout>
                }
              />
              <Route
                path="/teachers/:id"
                element={
                  <PublicLayout>
                    <TeacherProfilePage />
                  </PublicLayout>
                }
              />
              <Route
                path="/admission"
                element={
                  <PublicLayout>
                    <AdmissionPage />
                  </PublicLayout>
                }
              />
              <Route
                path="/notices"
                element={
                  <PublicLayout>
                    <NoticesPage />
                  </PublicLayout>
                }
              />
              <Route
                path="/events"
                element={
                  <PublicLayout>
                    <EventsPage />
                  </PublicLayout>
                }
              />
              <Route
                path="/gallery/photos"
                element={
                  <PublicLayout>
                    <GalleryPage mode="photo" />
                  </PublicLayout>
                }
              />
              <Route
                path="/gallery/videos"
                element={
                  <PublicLayout>
                    <GalleryPage mode="video" />
                  </PublicLayout>
                }
              />
              <Route
                path="/results"
                element={
                  <PublicLayout>
                    <ResultPortalPage />
                  </PublicLayout>
                }
              />
              <Route
                path="/contact"
                element={
                  <PublicLayout>
                    <ContactPage />
                  </PublicLayout>
                }
              />
              <Route
                path="/faq"
                element={
                  <PublicLayout>
                    <FaqPage />
                  </PublicLayout>
                }
              />
              <Route
                path="/privacy-policy"
                element={
                  <PublicLayout>
                    <LegalPage type="privacy" />
                  </PublicLayout>
                }
              />
              <Route
                path="/terms"
                element={
                  <PublicLayout>
                    <LegalPage type="terms" />
                  </PublicLayout>
                }
              />
              <Route
                path="/login"
                element={
                  <PublicLayout>
                    <LoginPage />
                  </PublicLayout>
                }
              />
              <Route
                path="*"
                element={
                  <PublicLayout>
                    <NotFoundPage />
                  </PublicLayout>
                }
              />
            </Routes>
          </BrowserRouter>
        </PlatformProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
