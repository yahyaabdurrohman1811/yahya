import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Anchor, 
  Database, 
  LogOut, 
  ShieldCheck, 
  Boxes, 
  ListOrdered, 
  History, 
  Plus
} from 'lucide-react';

interface Props {
  activeView: 'list' | 'yard' | 'logs';
  setActiveView: (view: 'list' | 'yard' | 'logs') => void;
  onOpenCreateModal: () => void;
  containerCount: number;
}

export const Navbar: React.FC<Props> = ({
  activeView,
  setActiveView,
  onOpenCreateModal,
  containerCount,
}) => {
  const { terminalUser, signOut } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Terminal Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Anchor className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900">
                  TERMINAL PETI KEMAS
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Firestore Online
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Container Terminal Operating System &bull; Tanjung Pelabuhan
              </p>
            </div>
          </div>

          {/* Navigation View Switcher */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              id="nav-tab-list"
              type="button"
              onClick={() => setActiveView('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeView === 'list'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListOrdered className="w-4 h-4" />
              <span>Daftar Kontainer ({containerCount})</span>
            </button>

            <button
              id="nav-tab-yard"
              type="button"
              onClick={() => setActiveView('yard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeView === 'yard'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>Yard Grid Stacking</span>
            </button>

            <button
              id="nav-tab-logs"
              type="button"
              onClick={() => setActiveView('logs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeView === 'logs'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Audit Trail</span>
            </button>
          </nav>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-3">
            <button
              id="btn-quick-create-container"
              type="button"
              onClick={onOpenCreateModal}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Gate In Baru</span>
            </button>

            {/* User details */}
            <div className="hidden lg:flex flex-col items-end text-right border-l pl-3 border-slate-200">
              <span className="text-xs font-bold text-slate-800 leading-tight">
                {terminalUser?.displayName || 'Operator'}
              </span>
              <span className="text-[11px] font-semibold text-blue-600">
                {terminalUser?.role || 'Admin'}
              </span>
            </div>

            {/* Logout button */}
            <button
              id="btn-logout"
              type="button"
              onClick={() => signOut()}
              title="Keluar dari Sistem Terminal"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex items-center gap-1 py-2 border-t border-slate-100 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveView('list')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg shrink-0 ${
              activeView === 'list' ? 'bg-blue-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Daftar ({containerCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveView('yard')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg shrink-0 ${
              activeView === 'yard' ? 'bg-blue-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Yard Grid
          </button>
          <button
            type="button"
            onClick={() => setActiveView('logs')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg shrink-0 ${
              activeView === 'logs' ? 'bg-blue-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Audit Trail
          </button>
        </div>
      </div>
    </header>
  );
};
