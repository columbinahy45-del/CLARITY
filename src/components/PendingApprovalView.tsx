import React from 'react';
import { useClassTrack } from '../context/ClassTrackContext';
import {
  Clock,
  LogOut,
  RefreshCw,
  Lock
} from 'lucide-react';

export const PendingApprovalView: React.FC = () => {
  const { currentUser, signOut, theme, openAuthModal } = useClassTrack();
  const isDark = theme === 'dark';

  return (
    <div className="max-w-2xl mx-auto py-8 sm:py-16 px-4">
      <div className={`p-8 sm:p-10 rounded-3xl transition-all text-center space-y-6 ${
        isDark
          ? 'bg-[#121218] text-white shadow-[0_0_50px_rgba(255,45,117,0.15)]'
          : 'bg-white text-slate-900 shadow-xl'
      }`}>
        {/* Animated Status Icon */}
        <div className="relative w-16 h-16 mx-auto">
          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center ${
            isDark
              ? 'bg-amber-950/60 text-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.3)]'
              : 'bg-amber-100 text-amber-700 shadow-sm'
          }`}>
            <Clock className="w-8 h-8 animate-pulse" />
          </div>
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <span>Pending Approval</span>
        </div>

        {/* Headline */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight">
            Account Under Review
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto leading-relaxed">
            Welcome, <span className="text-neutral-200 font-semibold">{currentUser?.name}</span>. Your teacher registration has been received and is waiting for administrator approval before you can create classes.
          </p>
        </div>

        {/* Info Box */}
        <div className={`p-5 rounded-2xl text-left text-xs space-y-2.5 ${
          isDark ? 'bg-[#181824]' : 'bg-slate-50'
        }`}>
          <div className="flex items-center gap-2 font-semibold text-neutral-200">
            <Lock className="w-4 h-4 text-pink-400" />
            <span>Verification in Progress</span>
          </div>

          <p className="text-neutral-400 leading-relaxed text-xs">
            New faculty accounts are reviewed by the school administration to prevent unauthorized course creation. Once approved, you will be able to create classes, issue enrollment codes, and publish assignments.
          </p>
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className={`w-full sm:w-auto px-6 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              isDark
                ? 'bg-[#ff2d75] hover:bg-[#ff1767] text-black shadow-[0_0_20px_rgba(255,45,117,0.4)]'
                : 'bg-[#0ea5e9] hover:bg-[#0284c7] text-white shadow-sm'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Check Approval Status</span>
          </button>

          <button
            onClick={signOut}
            className={`w-full sm:w-auto px-5 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              isDark ? 'bg-[#181822] hover:bg-[#20202c] text-neutral-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Sign in as Admin link */}
        <div className="pt-4 border-t border-neutral-900/60 text-center">
          <button
            onClick={() => {
              signOut();
              openAuthModal('signin');
            }}
            className="text-[11px] text-neutral-500 hover:text-emerald-400 transition-colors cursor-pointer"
          >
            Sign in with Administrator account to review and grant clearance →
          </button>
        </div>
      </div>
    </div>
  );
};
