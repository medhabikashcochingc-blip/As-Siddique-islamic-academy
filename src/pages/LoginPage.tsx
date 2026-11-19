import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Database, LogIn, ShieldCheck } from 'lucide-react';
import firebaseConfig from '../../firebase-applet-config.json';
import { AcademyEmblem } from '../components/AcademyEmblem';
import { useAuth } from '../context/AuthContext';
import { BOOTSTRAPPED_SUPER_ADMIN_EMAIL, ROLE_DEFINITIONS } from '../lib/permissions';

export const LoginPage: React.FC = () => {
  const { firebaseUser, userAccount, effectiveRole, authReady, authError, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [signingIn, setSigningIn] = useState(false);
  const [showSetupHelp, setShowSetupHelp] = useState(false);

  useEffect(() => {
    if (authReady && firebaseUser && userAccount) {
      navigate('/portal', { replace: true });
    }
  }, [authReady, firebaseUser, userAccount, navigate]);

  const handleLogin = async () => {
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="min-h-[78vh] flex items-center justify-center px-4 py-12 bg-[#F8F1DF] dark:bg-[#081A14] islamic-lattice-light">
      <div className="max-w-xl w-full bg-white dark:bg-[#102D23] border border-[#D9AD43]/45 rounded-xl p-8 sm:p-10 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <AcademyEmblem className="w-10 h-10 shrink-0" variant="emerald-on-cream" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8A6518] dark:text-[#D9AD43]">
              Unified School ERP &amp; LMS
            </p>
            <h1 className="font-serif text-3xl font-semibold text-[#06452C] dark:text-white">
              As-Siddique Portal Sign In
            </h1>
          </div>
        </div>

        <p className="text-sm text-[#314A3F] dark:text-[#E6DFCE] leading-relaxed mb-6">
          Sign in with your verified Google Account. Role-based permissions (Super Admin, Admin,
          Principal, Teacher, Accountant, Student, Parent, Librarian, Staff) are enforced
          server-side in Cloud Firestore.
        </p>

        {authError && (
          <div className="mb-5 p-3.5 rounded-lg bg-[#FDF2F2] border border-[#E5B4B4] text-sm text-[#7F1D1D]">
            {authError}
          </div>
        )}

        <button
          type="button"
          onClick={handleLogin}
          disabled={signingIn}
          className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm font-semibold bg-[#06452C] hover:bg-[#102D23] text-[#F8F1DF] border border-[#D9AD43]/45 rounded-lg transition-colors cursor-pointer disabled:opacity-60"
        >
          <LogIn className="w-4 h-4 text-[#D9AD43]" />
          <span>{signingIn ? 'Authenticating with Google...' : 'Continue with Google Sign-In'}</span>
        </button>

        {effectiveRole && (
          <div className="mt-4 text-center space-y-2">
            <p className="text-xs text-[#06452C] dark:text-[#D9AD43] font-semibold">
              Signed in as {ROLE_DEFINITIONS[effectiveRole].label} — Redirecting to portal...
            </p>
            <Link
              to="/portal"
              className="inline-block text-xs font-semibold underline text-[#8A6518] dark:text-[#D9AD43]"
            >
              Click here if not redirected automatically
            </Link>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-[#EFE6D2] dark:border-[#D9AD43]/25">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#8A6518] dark:text-[#D9AD43] flex items-center gap-1.5 mb-3">
            <ShieldCheck className="w-4 h-4" />
            <span>9 Role-Based Access Tiers</span>
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs text-[#465B52] dark:text-[#DED7C5]">
            {Object.values(ROLE_DEFINITIONS).map((r) => (
              <span key={r.role} className="truncate">
                • {r.label}
              </span>
            ))}
          </div>
        </div>

        {/* Collapsible Firebase & Initial Super Admin Setup Instructions */}
        <div className="mt-6 pt-5 border-t border-[#EFE6D2] dark:border-[#D9AD43]/25">
          <button
            type="button"
            onClick={() => setShowSetupHelp((v) => !v)}
            className="w-full flex items-center justify-between text-xs font-semibold text-[#06452C] dark:text-[#D9AD43] cursor-pointer"
          >
            <span className="inline-flex items-center gap-1.5">
              <Database className="w-4 h-4" />
              Firebase Auth &amp; Initial Super Admin Setup Guide
            </span>
            {showSetupHelp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showSetupHelp && (
            <div className="mt-3 p-4 rounded-lg bg-[#F8F1DF] dark:bg-[#081A14] border border-[#D9AD43]/30 text-xs text-[#314A3F] dark:text-[#E6DFCE] space-y-2 leading-relaxed">
              <p>
                <strong>1. Initial Super Admin Account:</strong> Sign in with verified Google email{' '}
                <code className="px-1.5 py-0.5 rounded bg-white dark:bg-[#102D23]">
                  {BOOTSTRAPPED_SUPER_ADMIN_EMAIL}
                </code>{' '}
                to receive automatic <code>super_admin</code> provisioning in Firestore.
              </p>
              <p>
                <strong>2. Firebase Project &amp; Database:</strong> Project{' '}
                <code>{firebaseConfig.projectId}</code> · Firestore DB{' '}
                <code className="break-all">{firebaseConfig.firestoreDatabaseId}</code>.
              </p>
              <p>
                <strong>3. If Popup Fails in Firebase Console:</strong> Verify{' '}
                <em>Authentication → Sign-in method → Google</em> is enabled and your current
                hostname (<code>{typeof window !== 'undefined' ? window.location.hostname : 'localhost'}</code>)
                is listed under <em>Authentication → Settings → Authorized domains</em>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
