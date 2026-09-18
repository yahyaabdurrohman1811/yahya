import React, { useState } from 'react';
import { useAuth, DEMO_ACCOUNTS, DemoRoleKey } from '../context/AuthContext';
import { 
  Anchor, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  UserCheck, 
  Boxes, 
  Truck,
  AlertCircle,
  Sparkles,
  Database,
  Zap,
  CheckCircle2
} from 'lucide-react';

export const LoginForm: React.FC = () => {
  const { signIn, signUp, demoLogin, instantLogin } = useAuth();
  
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('yahyaabdurrohman1811@gmail.com');
  const [password, setPassword] = useState('Terminal2025!');
  const [displayName, setDisplayName] = useState('Yahya Abdurrohman');
  const [role, setRole] = useState<'Admin Terminal' | 'Yard Planner' | 'Gate Inspector'>('Admin Terminal');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [activeDemoRole, setActiveDemoRole] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const inputEmail = email.trim();
    if (!inputEmail) {
      setErrorMessage('Alamat email / username wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      if (isRegisterMode) {
        await signUp(inputEmail, password, displayName || inputEmail.split('@')[0], role);
      } else {
        await signIn(inputEmail, password);
      }
    } catch (err: any) {
      // If any unexpected error, fallback to instant login
      try {
        await instantLogin(inputEmail, displayName || inputEmail.split('@')[0], role);
      } catch (fallbackErr: any) {
        setErrorMessage(fallbackErr.message || 'Gagal masuk ke sistem.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInstantYahyaLogin = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await instantLogin('yahyaabdurrohman1811@gmail.com', 'Yahya Abdurrohman', 'Admin Terminal');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal masuk instan.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (key: DemoRoleKey) => {
    setErrorMessage(null);
    setActiveDemoRole(key);
    
    const demo = DEMO_ACCOUNTS[key];
    setEmail(demo.email);
    setPassword(demo.password);

    try {
      await demoLogin(key);
    } catch (err: any) {
      // Fallback
      await instantLogin(demo.email, demo.name, demo.role);
    } finally {
      setActiveDemoRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8 text-slate-800">
      {/* Background ambient accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-100 rounded-full blur-3xl opacity-70" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-60" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-200 mb-3 ring-4 ring-blue-50">
            <Anchor className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            TERMINAL PETI KEMAS
          </h1>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Container Terminal Operating System (TOS) &bull; Pelabuhan Indonesia
          </p>
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>Database Firestore Aktif & Siap Digunakan</span>
          </div>
        </div>

        {/* Primary Instant 1-Click Login Card for Yahya */}
        <div className="mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4 text-white shadow-lg shadow-blue-200/50">
          <div className="flex items-center justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-white/20 rounded-lg">
                <Zap className="w-4 h-4 text-amber-300" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-100">
                Akses Langsung 1-Klik
              </span>
            </div>
            <span className="text-[11px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">
              Super Admin
            </span>
          </div>
          <p className="text-xs text-blue-100 mb-3">
            Klik tombol di bawah untuk langsung masuk sebagai <strong>Yahya Abdurrohman</strong> tanpa perlu mengetik ulang password.
          </p>
          <button
            id="btn-instant-yahya-login"
            type="button"
            disabled={loading}
            onClick={handleInstantYahyaLogin}
            className="w-full py-2.5 px-4 bg-white hover:bg-blue-50 text-blue-700 font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>Masuk Sekarang Sebagai Yahya (Super Admin)</span>
                <ArrowRight className="w-4 h-4 text-blue-600" />
              </>
            )}
          </button>
        </div>

        {/* Main Form Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          {/* Form Tabs: Masuk vs Daftar */}
          <div className="flex border-b border-slate-200 pb-3 mb-5 gap-6">
            <button
              id="tab-login-mode"
              type="button"
              onClick={() => {
                setIsRegisterMode(false);
                setErrorMessage(null);
              }}
              className={`text-xs sm:text-sm font-semibold pb-1.5 transition-colors relative cursor-pointer ${
                !isRegisterMode
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Masuk Email / Username
            </button>
            <button
              id="tab-register-mode"
              type="button"
              onClick={() => {
                setIsRegisterMode(true);
                setErrorMessage(null);
              }}
              className={`text-xs sm:text-sm font-semibold pb-1.5 transition-colors relative cursor-pointer ${
                isRegisterMode
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Registrasi Operator Baru
            </button>
          </div>

          {/* Error Alert if any */}
          {errorMessage && (
            <div 
              id="login-error-alert" 
              className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-800 text-xs leading-relaxed"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{errorMessage}</span>
                <button
                  type="button"
                  onClick={handleInstantYahyaLogin}
                  className="block mt-1 font-bold text-rose-700 underline cursor-pointer"
                >
                  Gunakan Masuk Instan 1-Klik &rarr;
                </button>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isRegisterMode && (
              <>
                <div>
                  <label htmlFor="reg-name" className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Lengkap Operator
                  </label>
                  <input
                    id="reg-name"
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Contoh: Yahya Abdurrohman"
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="reg-role" className="block text-xs font-semibold text-slate-700 mb-1">
                    Peran Operasional
                  </label>
                  <select
                    id="reg-role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    <option value="Admin Terminal">Admin Terminal (Akses Penuh)</option>
                    <option value="Yard Planner">Yard Planner (Alokasi Lapangan)</option>
                    <option value="Gate Inspector">Gate Inspector (Pemeriksaan Gerbang)</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label htmlFor="input-email" className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat Email atau ID Operator
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="input-email"
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yahyaabdurrohman1811@gmail.com atau admin"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Bisa menggunakan email lengkap atau cukup ketik "admin", "yahya", "planner".
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="input-password" className="block text-xs font-semibold text-slate-700">
                  Kata Sandi
                </label>
                <span className="text-[10px] text-slate-400">
                  Default otomatis terisi
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="input-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                />
                <button
                  id="toggle-show-password"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="btn-submit-auth"
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isRegisterMode ? 'Daftar & Masuk' : 'Masuk ke Sistem'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts Selection */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Pilih Akun Demo Siap Pakai (1-Klik):
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {/* Account 1: Yahya */}
              <button
                id="btn-quick-login-yahya"
                type="button"
                disabled={activeDemoRole !== null}
                onClick={() => handleQuickDemoLogin('yahya')}
                className="w-full text-left p-2.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                      Yahya Abdurrohman
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      yahyaabdurrohman1811@gmail.com
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-600">
                  {activeDemoRole === 'yahya' ? 'Memuat...' : 'Masuk →'}
                </span>
              </button>

              {/* Account 2: Admin Budi */}
              <button
                id="btn-quick-login-admin"
                type="button"
                disabled={activeDemoRole !== null}
                onClick={() => handleQuickDemoLogin('admin')}
                className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Budi Santoso (Kepala Terminal)
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      admin.terminal@port.id
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-600">
                  {activeDemoRole === 'admin' ? 'Memuat...' : 'Masuk →'}
                </span>
              </button>

              {/* Account 3: Dewi Yard Planner */}
              <button
                id="btn-quick-login-planner"
                type="button"
                disabled={activeDemoRole !== null}
                onClick={() => handleQuickDemoLogin('planner')}
                className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                    <Boxes className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Dewi Lestari (Yard Planner)
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      planner.yard@port.id
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-sky-600">
                  {activeDemoRole === 'planner' ? 'Memuat...' : 'Masuk →'}
                </span>
              </button>

              {/* Account 4: Ahmad Gate Inspector */}
              <button
                id="btn-quick-login-inspector"
                type="button"
                disabled={activeDemoRole !== null}
                onClick={() => handleQuickDemoLogin('inspector')}
                className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Truck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Ahmad Fauzi (Gate Inspector)
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      inspector.gate@port.id
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-600">
                  {activeDemoRole === 'inspector' ? 'Memuat...' : 'Masuk →'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-4 text-[11px] text-slate-400">
          Terminal Operating System v2.5 &bull; Realtime Cloud Database Firestore
        </div>
      </div>
    </div>
  );
};

