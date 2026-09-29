import React from 'react';
import { useClassTrack } from '../context/ClassTrackContext';
import {
  BookOpen,
  Calendar,
  CheckSquare,
  Plus,
  ShieldCheck,
  User,
  Settings,
} from 'lucide-react';

export const DesktopSidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    userCourses,
    activeCourseId,
    selectCourse,
    openJoinCreateModal,
    openEditProfileModal,
    theme,
    currentUser,
  } = useClassTrack();

  const isDark = theme === 'dark';
  const isAdmin = currentUser?.role === 'admin';
  const isTeacher = currentUser?.role === 'teacher';

  return (
    <aside className={`w-64 hidden md:flex flex-col justify-between p-4 sticky top-16 h-[calc(100vh-4rem)] transition-colors duration-300 border-r ${
      isDark ? 'bg-[#0b0b0e] text-neutral-300 border-neutral-800/50' : 'bg-slate-50/80 text-slate-700 border-slate-200'
    }`}>
      <div className="space-y-6">
        {/* Main Navigation Links */}
        <div className="space-y-1.5">
          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin_approvals')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'admin_approvals'
                  ? isDark
                    ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)] font-bold'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm font-bold'
                  : isDark
                  ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Teacher Approvals</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('classes')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'classes'
                ? isDark
                  ? 'bg-[#1c1424] text-pink-400 shadow-[0_0_20px_rgba(255,45,117,0.2)] font-bold'
                  : 'bg-white text-sky-700 shadow-sm font-bold'
                : isDark
                ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{isTeacher ? 'Your Classes' : isAdmin ? 'All Classrooms' : 'Enrolled Classes'}</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'calendar'
                ? isDark
                  ? 'bg-[#1c1424] text-pink-400 shadow-[0_0_20px_rgba(255,45,117,0.2)] font-bold'
                  : 'bg-white text-sky-700 shadow-sm font-bold'
                : isDark
                ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Academic Schedule</span>
          </button>

          <button
            onClick={() => setActiveTab('todo')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'todo'
                ? isDark
                  ? 'bg-[#1c1424] text-pink-400 shadow-[0_0_20px_rgba(255,45,117,0.2)] font-bold'
                  : 'bg-white text-sky-700 shadow-sm font-bold'
                : isDark
                ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>{isTeacher ? 'Grading Queue' : 'To-do Tasks'}</span>
          </button>
        </div>

        {/* User's Courses Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
            <span>{isTeacher ? 'Your Teaching Classes' : 'Your Classes'}</span>
            <button
              onClick={() => openJoinCreateModal(isTeacher || isAdmin ? 'create' : 'join')}
              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                isDark ? 'hover:bg-neutral-900 hover:text-pink-400' : 'hover:bg-slate-200 text-slate-600'
              }`}
              title={isTeacher || isAdmin ? 'Create Course' : 'Join Course'}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1 max-h-[340px] overflow-y-auto pr-1">
            {userCourses.map(course => {
              const isSelected = activeTab === 'course_detail' && activeCourseId === course.id;

              return (
                <button
                  key={course.id}
                  onClick={() => selectCourse(course.id, 'stream')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-xs transition-all text-left truncate cursor-pointer ${
                    isSelected
                      ? isDark
                        ? 'bg-[#221426] text-pink-300 font-bold shadow-[0_0_15px_rgba(255,45,117,0.18)]'
                        : 'bg-sky-50 text-sky-800 font-bold shadow-sm'
                      : isDark
                      ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: course.color || (isDark ? '#ff2d75' : '#0ea5e9') }}
                  />
                  <span className="truncate">{course.name}</span>
                </button>
              );
            })}

            {userCourses.length === 0 && (
              <p className="px-3 py-2 text-[11px] text-neutral-500 italic">
                {isTeacher ? 'No classes created yet' : 'No classes joined'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* User Address & Profile Card */}
      {currentUser && (
        <div className={`p-3 rounded-2xl border mb-2 ${
          isDark ? 'bg-[#121217] border-neutral-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="font-bold text-xs truncate block">{currentUser.name}</span>
              <span className="text-[10px] text-neutral-400 truncate block font-mono">
                {currentUser.address ? `${currentUser.address}` : 'No address set'}
              </span>
            </div>
            <button
              onClick={openEditProfileModal}
              className={`p-1.5 rounded-xl border text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0 ${
                isDark ? 'border-neutral-800 hover:bg-neutral-800' : 'border-slate-200 hover:bg-slate-100 text-slate-600'
              }`}
              title="Edit Address & Profile"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Footer info */}
      <div className="pt-3 text-[11px] text-neutral-500 flex items-center justify-between border-t border-neutral-800/40">
        <span className="font-bold tracking-tight">CLARITY LMS</span>
        <span className="font-mono text-[10px] opacity-80 uppercase">
          {currentUser?.role || 'Guest'}
        </span>
      </div>
    </aside>
  );
};

export const MobileBottomNav: React.FC = () => {
  const { activeTab, setActiveTab, theme, currentUser, openEditProfileModal } = useClassTrack();
  const isDark = theme === 'dark';
  const isAdmin = currentUser?.role === 'admin';
  const isTeacher = currentUser?.role === 'teacher';

  return (
    <nav className={`md:hidden fixed bottom-0 left-0 right-0 h-16 px-4 flex items-center justify-around z-40 backdrop-blur-xl transition-all border-t ${
      isDark
        ? 'bg-[#09090d]/95 text-neutral-400 shadow-[0_-10px_30px_rgba(0,0,0,0.8)] border-neutral-800'
        : 'bg-white/95 text-slate-500 shadow-[0_-5px_20px_rgba(0,0,0,0.06)] border-slate-200'
    }`}>
      {isAdmin && (
        <button
          onClick={() => setActiveTab('admin_approvals')}
          className={`flex-1 flex flex-col items-center justify-center py-1 gap-1 transition-colors cursor-pointer ${
            activeTab === 'admin_approvals'
              ? isDark
                ? 'text-emerald-400 font-bold'
                : 'text-emerald-600 font-bold'
              : isDark ? 'hover:text-neutral-200' : 'hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span className="text-[10px] tracking-tight">Approvals</span>
          {activeTab === 'admin_approvals' && (
            <div className="w-4 h-0.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
          )}
        </button>
      )}

      {/* Classes Tab */}
      <button
        onClick={() => setActiveTab('classes')}
        className={`flex-1 flex flex-col items-center justify-center py-1 gap-1 transition-colors cursor-pointer ${
          activeTab === 'classes'
            ? isDark
              ? 'text-pink-400 font-bold'
              : 'text-sky-600 font-bold'
            : isDark ? 'hover:text-neutral-200' : 'hover:text-slate-800'
        }`}
      >
        <BookOpen className="w-5 h-5" />
        <span className="text-[11px] tracking-tight">Classes</span>
        {activeTab === 'classes' && (
          <div className={`w-4 h-0.5 rounded-full ${isDark ? 'bg-pink-400 shadow-[0_0_8px_#ff2d75]' : 'bg-sky-600'}`} />
        )}
      </button>

      {/* Calendar Tab */}
      <button
        onClick={() => setActiveTab('calendar')}
        className={`flex-1 flex flex-col items-center justify-center py-1 gap-1 transition-colors cursor-pointer ${
          activeTab === 'calendar'
            ? isDark
              ? 'text-pink-400 font-bold'
              : 'text-sky-600 font-bold'
            : isDark ? 'hover:text-neutral-200' : 'hover:text-slate-800'
        }`}
      >
        <Calendar className="w-5 h-5" />
        <span className="text-[11px] tracking-tight">Calendar</span>
        {activeTab === 'calendar' && (
          <div className={`w-4 h-0.5 rounded-full ${isDark ? 'bg-pink-400 shadow-[0_0_8px_#ff2d75]' : 'bg-sky-600'}`} />
        )}
      </button>

      {/* To-Do / Review Tab */}
      <button
        onClick={() => setActiveTab('todo')}
        className={`flex-1 flex flex-col items-center justify-center py-1 gap-1 transition-colors cursor-pointer ${
          activeTab === 'todo'
            ? isDark
              ? 'text-pink-400 font-bold'
              : 'text-sky-600 font-bold'
            : isDark ? 'hover:text-neutral-200' : 'hover:text-slate-800'
        }`}
      >
        <CheckSquare className="w-5 h-5" />
        <span className="text-[11px] tracking-tight">{isTeacher ? 'Grading' : 'To-do'}</span>
        {activeTab === 'todo' && (
          <div className={`w-4 h-0.5 rounded-full ${isDark ? 'bg-pink-400 shadow-[0_0_8px_#ff2d75]' : 'bg-sky-600'}`} />
        )}
      </button>

      {/* Profile & Address Tab */}
      <button
        onClick={openEditProfileModal}
        className={`flex-1 flex flex-col items-center justify-center py-1 gap-1 transition-colors cursor-pointer ${
          isDark ? 'hover:text-neutral-200' : 'hover:text-slate-800'
        }`}
      >
        <User className="w-5 h-5" />
        <span className="text-[11px] tracking-tight">Profile</span>
      </button>
    </nav>
  );
};
