import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import { BOOTSTRAPPED_SUPER_ADMIN_EMAIL } from '../lib/permissions';
import { UserAccount, UserRole } from '../types/platform';

interface AuthContextValue {
  firebaseUser: User | null;
  userAccount: UserAccount | null;
  effectiveRole: UserRole | null;
  previewRole: UserRole | null;
  setPreviewRole: (role: UserRole | null) => void;
  authReady: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userAccount, setUserAccount] = useState<UserAccount | null>(null);
  const [previewRole, setPreviewRole] = useState<UserRole | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let unsubUserDoc: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (unsubUserDoc) {
        unsubUserDoc();
        unsubUserDoc = null;
      }

      setFirebaseUser(user);
      setAuthError(null);

      if (!user) {
        setUserAccount(null);
        setPreviewRole(null);
        setAuthReady(true);
        return;
      }

      const userRef = doc(db, 'users', user.uid);
      const isSuperAdmin =
        (user.email || '').toLowerCase() === BOOTSTRAPPED_SUPER_ADMIN_EMAIL.toLowerCase() &&
        user.emailVerified;

      try {
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
          const initialRole: UserRole = isSuperAdmin ? 'super_admin' : 'student';
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'Academy User',
            role: initialRole,
            status: 'active',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } else if (isSuperAdmin && snap.data().role !== 'super_admin') {
          await setDoc(
            userRef,
            {
              uid: user.uid,
              email: user.email || '',
              displayName: snap.data().displayName || user.displayName || 'Super Admin',
              role: 'super_admin',
              status: 'active',
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        }

        unsubUserDoc = onSnapshot(
          userRef,
          (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data() as UserAccount;
              if (data.status === 'deactivated' && !isSuperAdmin) {
                setAuthError('Your account has been deactivated by an administrator.');
                setUserAccount(null);
              } else {
                setUserAccount(data);
              }
            }
            setAuthReady(true);
          },
          (err) => {
            setAuthError(err.message);
            setAuthReady(true);
          }
        );
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
        } catch (wrapped) {
          setAuthError(
            wrapped instanceof Error ? wrapped.message : 'Unable to load user profile.'
          );
          setAuthReady(true);
        }
      }
    });

    return () => {
      unsubAuth();
      if (unsubUserDoc) unsubUserDoc();
    };
  }, []);

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const code = (err as { code?: string })?.code || '';
      if (code === 'auth/unauthorized-domain') {
        setAuthError(
          `This domain (${window.location.hostname}) is not yet listed under Firebase Console -> Authentication -> Settings -> Authorized domains.`
        );
      } else if (code === 'auth/operation-not-allowed') {
        setAuthError(
          'Google Sign-In is not enabled yet. Enable Google under Firebase Console -> Authentication -> Sign-in method.'
        );
      } else if (code === 'auth/popup-blocked') {
        setAuthError(
          'Sign-in popup was blocked by the browser. Please allow popups for this site and click Continue with Google Sign-In again.'
        );
      } else if (code === 'auth/popup-closed-by-user') {
        setAuthError('Sign-in popup was closed before completing authentication.');
      } else {
        setAuthError(err instanceof Error ? err.message : 'Google Sign-In failed.');
      }
    }
  };

  const logout = async () => {
    setPreviewRole(null);
    await signOut(auth);
  };

  const effectiveRole: UserRole | null =
    userAccount?.role === 'super_admin' && previewRole
      ? previewRole
      : userAccount?.role || null;

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        userAccount,
        effectiveRole,
        previewRole,
        setPreviewRole,
        authReady,
        authError,
        signInWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
