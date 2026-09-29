import React from 'react';
import { useClassTrack } from '../context/ClassTrackContext';
import {
  ShieldCheck,
  GraduationCap,
  User,
  ArrowRight,
  BookOpen,
  CheckSquare,
  Award,
  Calendar,
  Lock,
} from 'lucide-react';

export const LandingHeroView: React.FC = () => {
  const { theme, openAuthModal } = useClassTrack();
  const isDark = theme === 'dark';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-16 space-y-16">
      {/* Hero Headline */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl sm:text-6xl font-bold font-display tracking-tight leading-[1.15]">
          Classroom management{' '}
          <span className={isDark ? 'text-pink-400' : 'text-sky-600'}>
            made simple
          </span>
        </h1>

        <p className="text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          Create courses, share assignments, submit coursework, and keep track of grades in one organized place.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
          <button
            onClick={() => openAuthModal('signin')}
            className={`px-7 py-3.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 border ${
              isDark
                ? 'bg-[#181824] hover:bg-[#222232] text-white border-neutral-700 shadow-md'
                : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-sm'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Sign In</span>
          </button>

          <button
            onClick={() => openAuthModal('signup')}
            className={`px-7 py-3.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
              isDark
                ? 'bg-[#ff2d75] hover:bg-[#ff1767] text-black shadow-[0_0_25px_rgba(255,45,117,0.4)]'
                : 'bg-[#0ea5e9] hover:bg-[#0284c7] text-white shadow-md'
            }`}
          >
            <span>Create an Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Role Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Teacher */}
        <div className={`p-6 sm:p-7 rounded-3xl border flex flex-col justify-between ${
          isDark ? 'bg-[#111116] border-neutral-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold font-display">Teachers</h3>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Create your own courses and share the class code. Post homework assignments, review student submissions, and record grades.
            </p>
          </div>
          <div className="pt-6">
            <button
              onClick={() => openAuthModal('signup')}
              className={`w-full py-2.5 rounded-xl font-bold text-xs cursor-pointer border transition-colors ${
                isDark ? 'bg-sky-950/40 text-sky-300 border-sky-500/30 hover:bg-sky-900/50' : 'bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100'
              }`}
            >
              Sign Up as Teacher
            </button>
          </div>
        </div>

        {/* Student */}
        <div className={`p-6 sm:p-7 rounded-3xl border flex flex-col justify-between ${
          isDark ? 'bg-[#111116] border-neutral-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold font-display">Students</h3>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Enroll in classes with your teacher's code. View upcoming deadlines, upload deliverables, and track your scores.
            </p>
          </div>
          <div className="pt-6">
            <button
              onClick={() => openAuthModal('signup')}
              className={`w-full py-2.5 rounded-xl font-bold text-xs cursor-pointer border transition-colors ${
                isDark ? 'bg-pink-950/40 text-pink-300 border-pink-500/30 hover:bg-pink-900/50' : 'bg-pink-50 text-pink-800 border-pink-200 hover:bg-pink-100'
              }`}
            >
              Sign Up as Student
            </button>
          </div>
        </div>

        {/* Administrator */}
        <div className={`p-6 sm:p-7 rounded-3xl border flex flex-col justify-between ${
          isDark ? 'bg-[#111116] border-neutral-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold font-display">Administrators</h3>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Manage school accounts, verify new teacher registrations, view active classrooms, and send campus announcements.
            </p>
          </div>
          <div className="pt-6">
            <button
              onClick={() => openAuthModal('signin')}
              className={`w-full py-2.5 rounded-xl font-bold text-xs cursor-pointer border transition-colors ${
                isDark ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30 hover:bg-emerald-900/50' : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              Administrator Sign In
            </button>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
        <div className={`p-5 rounded-3xl border ${isDark ? 'bg-[#121217] border-neutral-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <BookOpen className="w-5 h-5 text-pink-400 mb-3" />
          <h4 className="font-bold text-sm">Course Streams</h4>
          <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
            Post updates, share video meeting links, and answer questions.
          </p>
        </div>

        <div className={`p-5 rounded-3xl border ${isDark ? 'bg-[#121217] border-neutral-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <CheckSquare className="w-5 h-5 text-sky-400 mb-3" />
          <h4 className="font-bold text-sm">Classwork & Grading</h4>
          <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
            Assign homework, review student work, and enter grades.
          </p>
        </div>

        <div className={`p-5 rounded-3xl border ${isDark ? 'bg-[#121217] border-neutral-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <Award className="w-5 h-5 text-emerald-400 mb-3" />
          <h4 className="font-bold text-sm">Class Codes</h4>
          <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
            Students quickly join your class with a short 7-character code.
          </p>
        </div>

        <div className={`p-5 rounded-3xl border ${isDark ? 'bg-[#121217] border-neutral-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <Calendar className="w-5 h-5 text-purple-400 mb-3" />
          <h4 className="font-bold text-sm">Calendar</h4>
          <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
            View all upcoming assignment deadlines on a monthly calendar.
          </p>
        </div>
      </div>
    </div>
  );
};
