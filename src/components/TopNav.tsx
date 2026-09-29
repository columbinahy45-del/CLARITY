import React, { useState } from 'react';
import { useClassTrack } from '../context/ClassTrackContext';
import {
  Sun,
  Moon,
  Plus,
  LogOut,
  LogIn,
  UserPlus,
  MapPin,
  Settings,
  User,
} from 'lucide-react';

export const TopNav: React.FC = () => {
  const {
    currentUser,
    isAuthenticated,
    signOut,
    openAuthModal,
    openJoinCreateModal,
    openEditProfileModal,
    viewPublicProfile,
    theme,
    toggleTheme,
    setActiveTab,
  } = useClassTrack();

  const isDark = theme === 'dark';
  const isTeacher = currentUser?.role === 'teacher';
  const isAdmin = currentUser?.role === 'admin';
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  return (
    <header className={`h-16 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-xl transition-colors duration-300 select-none ${
      isDark
        ? 'bg-[#09090b]/90 text-neutral-100 shadow-[0_4px_20px_rgba(0,0,0,0.5)] border-b border-neutral-800/50'
        : 'bg-white/90 text-slate-900 shadow-sm border-b border-slate-100'
    }`}>
      {/* Brand & Active System Badge */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        <div
          onClick={() => setActiveTab(isAdmin ? 'admin_approvals' : 'classes')}
          className="flex items-center gap-2 cursor-pointer shrink-0"
        >
          {/* Logo badge with glow */}
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs font-mono shrink-0 transition-all duration-300 ${
            isAdmin
              ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.6)]'
              : isTeacher
              ? 'bg-sky-500 text-black shadow-[0_0_15px_rgba(14,165,233,0.6)]'
              : isDark
              ? 'bg-[#ff2d75] text-black shadow-[0_0_15px_rgba(255,45,117,0.6)]'
              : 'bg-[#0ea5e9] text-white shadow-[0_0_15px_rgba(14,165,233,0.5)]'
          }`}>
            {isAdmin ? 'A' : isTeacher ? 'T' : 'C'}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm sm:text-base tracking-tight font-display whitespace-nowrap">
              CLARITY
            </span>
            <span className={`hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full font-bold whitespace-nowrap uppercase ${
              isAdmin
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : isTeacher
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                : isDark
                ? 'bg-pink-950/60 text-pink-400 border border-pink-500/30'
                : 'bg-sky-50 text-sky-700 border border-sky-200'
            }`}>
              {isAdmin ? 'ADMIN PORTAL' : isTeacher ? 'FACULTY' : 'STUDENT'}
            </span>
          </div>
        </div>
      </div>

      {/* Center / Right Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Plus Button to Join/Create Class */}
        {isAuthenticated && (
          <button
            onClick={() => openJoinCreateModal(isTeacher || isAdmin ? 'create' : 'join')}
            className={`p-2 rounded-2xl shrink-0 transition-all cursor-pointer ${
              isDark
                ? 'bg-[#161620] hover:bg-[#20202e] text-neutral-300 hover:text-white border border-neutral-800'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title={
              isTeacher || isAdmin
                ? 'Create a class'
                : 'Join class with code'
            }
          >
            <Plus className="w-4 h-4" />
          </button>
        )}

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-2xl shrink-0 transition-all cursor-pointer ${
            isDark
              ? 'bg-[#161620] hover:bg-[#20202e] text-pink-400 hover:shadow-[0_0_12px_rgba(255,45,117,0.35)] border border-neutral-800'
              : 'bg-slate-100 hover:bg-slate-200 text-sky-600 hover:shadow-[0_0_12px_rgba(14,165,233,0.35)]'
          }`}
          title={isDark ? 'Switch to Day Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {isAuthenticated && currentUser ? (
          /* Profile Menu */
          <div className="relative shrink-0">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className={`flex items-center gap-1.5 sm:gap-2 pl-1.5 pr-2.5 sm:pl-2 sm:pr-3 py-1.5 rounded-2xl text-xs font-semibold shrink-0 transition-all cursor-pointer border ${
                isDark
                  ? 'bg-[#14141c] hover:bg-[#1c1c28] text-white border-neutral-800'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-200'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                isAdmin
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : isTeacher
                  ? 'bg-sky-500/20 text-sky-400'
                  : isDark
                  ? 'bg-pink-500/20 text-pink-400'
                  : 'bg-sky-100 text-sky-700'
              }`}>
                {currentUser.name.charAt(0)}
              </div>
              <span className="truncate max-w-[80px] sm:max-w-[130px] font-display">{currentUser.name}</span>
            </button>

            {isProfileMenuOpen && (
              <div className={`absolute right-0 mt-2 w-64 rounded-3xl p-2.5 shadow-2xl z-50 text-xs border ${
                isDark
                  ? 'bg-[#14141c] text-white border-neutral-800 shadow-[0_10px_40px_rgba(0,0,0,0.8)]'
                  : 'bg-white text-slate-900 border-slate-200 shadow-xl'
              }`}>
                <div className={`px-3 py-2.5 ${isDark ? 'border-b border-neutral-800' : 'border-b border-slate-100'}`}>
                  <div className="font-bold truncate text-sm">{currentUser.name}</div>
                  <div className="text-[11px] text-neutral-400 truncate font-mono mt-0.5">{currentUser.email}</div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                      isAdmin
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : isTeacher
                        ? 'bg-sky-500/20 text-sky-400'
                        : 'bg-pink-500/20 text-pink-400'
                    }`}>
                      {currentUser.role}
                    </span>
                  </div>

                  {/* Registered Address Info */}
                  <div className="mt-2.5 pt-2 border-t border-neutral-800/60 text-[11px] text-neutral-400">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3 h-3 text-pink-400 shrink-0 mt-0.5" />
                      <div className="leading-tight">
                        {currentUser.address ? (
                          <span>
                            {currentUser.address}
                            {currentUser.city ? `, ${currentUser.city}` : ''}
                            {currentUser.state ? `, ${currentUser.state}` : ''}
                            {currentUser.zipCode ? ` ${currentUser.zipCode}` : ''}
                          </span>
                        ) : (
                          <span className="italic text-neutral-500">Address not provided</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-1.5 space-y-1">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      viewPublicProfile({ id: currentUser.id, name: currentUser.name, email: currentUser.email, role: currentUser.role });
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-2xl hover:bg-neutral-800/40 text-neutral-200 text-left transition-colors cursor-pointer font-semibold"
                  >
                    <User className="w-3.5 h-3.5 text-neutral-400" />
                    <span>View Public Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      openEditProfileModal();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-2xl hover:bg-neutral-800/40 text-neutral-200 text-left transition-colors cursor-pointer font-semibold"
                  >
                    <Settings className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Edit Address & Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      signOut();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-2xl hover:bg-rose-950/40 text-rose-400 text-left transition-colors cursor-pointer font-semibold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => openAuthModal('signin')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                isDark
                  ? 'bg-[#181822] hover:bg-[#20202e] text-neutral-200 border border-neutral-800'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm'
              }`}
            >
              <LogIn className="w-3.5 h-3.5 shrink-0" />
              <span>Sign In</span>
            </button>

            <button
              onClick={() => openAuthModal('signup')}
              className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                isDark
                  ? 'bg-[#ff2d75] hover:bg-[#ff1767] text-black shadow-[0_0_15px_rgba(255,45,117,0.4)]'
                  : 'bg-[#0ea5e9] hover:bg-[#0284c7] text-white shadow-sm'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 shrink-0" />
              <span>Sign Up</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
