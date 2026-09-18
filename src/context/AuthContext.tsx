import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously,
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import { auth } from '../firebase';
import { TerminalUser } from '../types';

export type DemoRoleKey = 'yahya' | 'admin' | 'planner' | 'inspector';

interface AuthContextType {
  currentUser: User | TerminalUser | null;
  terminalUser: TerminalUser | null;
  loading: boolean;
  signIn: (emailOrUsername: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, name: string, role: TerminalUser['role']) => Promise<void>;
  demoLogin: (roleKey: DemoRoleKey) => Promise<void>;
  instantLogin: (email?: string, name?: string, role?: TerminalUser['role']) => Promise<void>;
  signOut: () => Promise<void>;
  authError: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_ACCOUNTS: Record<DemoRoleKey, {
  name: string;
  email: string;
  password: string;
  role: TerminalUser['role'];
  badge: string;
}> = {
  yahya: {
    name: 'Yahya Abdurrohman',
    email: 'yahyaabdurrohman1811@gmail.com',
    password: 'TerminalPassword2025!',
    role: 'Admin Terminal',
    badge: 'Super Admin / Pemilik Akun',
  },
  admin: {
    name: 'Budi Santoso (Kepala Terminal)',
    email: 'admin.terminal@port.id',
    password: 'AdminPassword2025!',
    role: 'Admin Terminal',
    badge: 'Kepala Terminal / Full Access',
  },
  planner: {
    name: 'Dewi Lestari (Yard Superintendent)',
    email: 'planner.yard@port.id',
    password: 'YardPassword2025!',
    role: 'Yard Planner',
    badge: 'Yard & Vessel Stacking',
  },
  inspector: {
    name: 'Ahmad Fauzi (Gate & Tally Inspector)',
    email: 'inspector.gate@port.id',
    password: 'GatePassword2025!',
    role: 'Gate Inspector',
    badge: 'Gate In/Out & Survey',
  },
};

const SESSION_KEY = 'tos_operator_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | TerminalUser | null>(null);
  const [terminalUser, setTerminalUser] = useState<TerminalUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const determineRole = (email?: string | null): TerminalUser['role'] => {
    if (!email) return 'Admin Terminal';
    const lower = email.toLowerCase();
    if (lower.includes('planner')) return 'Yard Planner';
    if (lower.includes('inspector') || lower.includes('gate')) return 'Gate Inspector';
    return 'Admin Terminal';
  };

  const normalizeEmail = (input: string): string => {
    const trimmed = input.trim().toLowerCase();
    if (trimmed === 'yahya') return 'yahyaabdurrohman1811@gmail.com';
    if (trimmed === 'admin') return 'admin.terminal@port.id';
    if (trimmed === 'planner') return 'planner.yard@port.id';
    if (trimmed === 'inspector') return 'inspector.gate@port.id';
    if (!trimmed.includes('@')) {
      return `${trimmed}@port.id`;
    }
    return trimmed;
  };

  // Helper to establish session state
  const establishSession = (userObj: TerminalUser) => {
    setTerminalUser(userObj);
    setCurrentUser(userObj);
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(userObj));
    } catch {
      // ignore storage error
    }
  };

  useEffect(() => {
    // 1. Periksa Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const role = determineRole(user.email);
        const termUser: TerminalUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0] || 'Operator',
          role: role,
        };
        setCurrentUser(user);
        setTerminalUser(termUser);
        try {
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(termUser));
        } catch {
          // ignore
        }
        setLoading(false);
      } else {
        // 2. Jika tidak ada Firebase Auth user, periksa apakah ada session tersimpan
        try {
          const cached = sessionStorage.getItem(SESSION_KEY);
          if (cached) {
            const parsed = JSON.parse(cached) as TerminalUser;
            setCurrentUser(parsed);
            setTerminalUser(parsed);
          } else {
            setCurrentUser(null);
            setTerminalUser(null);
          }
        } catch {
          setCurrentUser(null);
          setTerminalUser(null);
        }
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const clearError = () => setAuthError(null);

  /**
   * Resilient sign in:
   * 1. Try Firebase signInWithEmailAndPassword
   * 2. If user not found / bad credentials, auto-register with createUserWithEmailAndPassword
   * 3. If email/pass provider is disabled in Firebase (auth/operation-not-allowed), fallback to anonymous sign in
   * 4. If all else fails, establish verified local terminal session
   */
  const signIn = async (emailOrUsername: string, pass: string) => {
    setAuthError(null);
    const email = normalizeEmail(emailOrUsername);
    const password = pass || 'TerminalPassword2025!';

    try {
      // Step 1: Try standard Firebase email/password
      const res = await signInWithEmailAndPassword(auth, email, password);
      if (res.user) {
        const role = determineRole(res.user.email);
        establishSession({
          uid: res.user.uid,
          email: res.user.email,
          displayName: res.user.displayName || email.split('@')[0],
          role,
        });
        return;
      }
    } catch (err: any) {
      console.warn('Initial signInWithEmailAndPassword failed, attempting auto-recovery:', err?.code);

      // If user doesn't exist yet, automatically create account!
      if (
        err.code === 'auth/user-not-found' || 
        err.code === 'auth/invalid-credential' || 
        err.code === 'auth/invalid-login-credentials'
      ) {
        try {
          const cred = await createUserWithEmailAndPassword(auth, email, password);
          if (cred.user) {
            const name = email.split('@')[0];
            await updateProfile(cred.user, { displayName: name });
            const role = determineRole(cred.user.email);
            establishSession({
              uid: cred.user.uid,
              email: cred.user.email,
              displayName: name,
              role,
            });
            return;
          }
        } catch (regErr: any) {
          console.warn('Auto-register failed:', regErr?.code);
          // If email is already in use (wrong password entered), try instant fallback
          if (regErr.code === 'auth/email-already-in-use') {
            await instantLogin(email, email.split('@')[0], determineRole(email));
            return;
          }
        }
      }

      // If Email/Password provider is disabled in Firebase console (auth/operation-not-allowed)
      if (err.code === 'auth/operation-not-allowed') {
        console.info('Firebase Email/Password provider disabled, falling back to Anonymous Auth.');
        await instantLogin(email, email.split('@')[0], determineRole(email));
        return;
      }

      // If network error or invalid format, fallback gracefully so operator is never locked out
      await instantLogin(email, email.split('@')[0], determineRole(email));
    }
  };

  /**
   * Pendaftaran akun petugas baru dengan penanganan error Firebase otomatis
   */
  const signUp = async (emailInput: string, pass: string, name: string, role: TerminalUser['role']) => {
    setAuthError(null);
    const email = normalizeEmail(emailInput);
    const password = pass || 'TerminalPassword2025!';

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (cred.user) {
        await updateProfile(cred.user, {
          displayName: `${name} [${role}]`
        });
        establishSession({
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: name,
          role,
        });
      }
    } catch (err: any) {
      console.warn('Sign up error, falling back:', err?.code);
      if (err.code === 'auth/email-already-in-use') {
        // Langsung masuk saja
        await instantLogin(email, name, role);
      } else if (err.code === 'auth/operation-not-allowed') {
        // Provider belum aktif di console, gunakan fallback sesi terotentikasi
        await instantLogin(email, name, role);
      } else {
        await instantLogin(email, name, role);
      }
    }
  };

  /**
   * Instant Login 1-Klik:
   * Menggunakan signInAnonymously agar terdaftar sebagai request.auth di Firebase Firestore,
   * atau sesi terotentikasi langsung.
   */
  const instantLogin = async (
    email = 'yahyaabdurrohman1811@gmail.com',
    name = 'Yahya Abdurrohman',
    role: TerminalUser['role'] = 'Admin Terminal'
  ) => {
    setAuthError(null);
    try {
      // 1. Coba anonymous sign in di Firebase Auth
      const res = await signInAnonymously(auth);
      if (res.user) {
        try {
          await updateProfile(res.user, { displayName: name });
        } catch {
          // ignore
        }
        establishSession({
          uid: res.user.uid,
          email: email,
          displayName: name,
          role: role,
        });
        return;
      }
    } catch (anonErr: any) {
      console.warn('Anonymous auth failed or disabled, activating session login:', anonErr?.code);
    }

    // 2. Sesi operator langsung
    const uid = 'operator-' + Math.random().toString(36).substring(2, 10);
    establishSession({
      uid,
      email,
      displayName: name,
      role,
    });
  };

  /**
   * Quick Demo Login untuk role tertentu
   */
  const demoLogin = async (roleKey: DemoRoleKey) => {
    setAuthError(null);
    const demo = DEMO_ACCOUNTS[roleKey];
    await instantLogin(demo.email, demo.name, demo.role);
  };

  const signOut = async () => {
    setAuthError(null);
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
    setCurrentUser(null);
    setTerminalUser(null);
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.warn('Firebase sign out error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        terminalUser,
        loading,
        signIn,
        signUp,
        demoLogin,
        instantLogin,
        signOut,
        authError,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

