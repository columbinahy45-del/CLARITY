import React, { useState } from 'react';
import { useClassTrack } from '../context/ClassTrackContext';
import {
  X,
  Mail,
  Copy,
  Check,
  Building,
  MapPin,
  Calendar,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

export const PublicProfileModal: React.FC = () => {
  const { selectedPublicProfile, closePublicProfile, theme } = useClassTrack();
  const isDark = theme === 'dark';
  const [copiedEmail, setCopiedEmail] = useState(false);

  if (!selectedPublicProfile) return null;

  const {
    name,
    email,
    role,
    department,
    institution,
    city,
    state,
    address,
    createdAt,
    courses,
    attendanceStats,
    activeCourseName,
  } = selectedPublicProfile;

  const isTeacher = role === 'teacher';
  const isAdmin = role === 'admin';
  const isStudent = role === 'student';

  const copyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Active Term';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
      onClick={e => {
        if (e.target === e.currentTarget) closePublicProfile();
      }}
    >
      <div
        className={`w-full max-w-md rounded-3xl transition-all relative my-auto border shadow-2xl max-h-[92vh] overflow-y-auto ${
          isDark
            ? 'bg-[#111116] text-white border-neutral-800 shadow-[0_20px_60px_rgba(0,0,0,0.9)]'
            : 'bg-white text-slate-900 border-slate-200 shadow-2xl'
        }`}
      >
        {/* Top Header Banner Accent */}
        <div
          className="h-24 w-full relative overflow-hidden flex items-end p-4 rounded-t-3xl"
          style={{
            background: isAdmin
              ? 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)'
              : isTeacher
              ? 'linear-gradient(135deg, #0369a1 0%, #082f49 100%)'
              : 'linear-gradient(135deg, #831843 0%, #500724 100%)',
          }}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={closePublicProfile}
            className="absolute top-4 right-4 p-2 rounded-xl bg-black/40 hover:bg-black/70 text-white/80 hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Avatar and Primary Identity */}
        <div className="px-6 pb-6 pt-0 relative space-y-4">
          <div className="flex items-end justify-between -mt-10 mb-2">
            {/* Avatar Circle */}
            <div
              className={`w-20 h-20 rounded-2xl flex items-center justify-center font-bold text-2xl font-display border-4 shadow-xl shrink-0 ${
                isDark ? 'border-[#111116]' : 'border-white'
              } ${
                isAdmin
                  ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                  : isTeacher
                  ? 'bg-sky-500 text-black shadow-[0_0_20px_rgba(14,165,233,0.4)]'
                  : 'bg-[#ff2d75] text-black shadow-[0_0_20px_rgba(255,45,117,0.4)]'
              }`}
            >
              {name.charAt(0).toUpperCase()}
            </div>

            {/* Role Badge */}
            <div className="flex flex-col items-end gap-1">
              <span
                className={`text-[10px] font-mono px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border ${
                  isAdmin
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : isTeacher
                    ? 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                    : 'bg-pink-500/20 text-pink-400 border-pink-500/30'
                }`}
              >
                {isAdmin ? 'Administrator' : isTeacher ? 'Faculty Instructor' : 'Enrolled Student'}
              </span>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Verified Member</span>
              </div>
            </div>
          </div>

          {/* Name & Email */}
          <div>
            <h3 className="text-xl sm:text-2xl font-bold font-display tracking-tight leading-tight">
              {name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-neutral-400 font-mono truncate">{email}</span>
              <button
                type="button"
                onClick={copyEmail}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
                title="Copy email address"
              >
                {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Public Academic & Campus Info Card */}
          <div
            className={`p-4 rounded-2xl border space-y-3 text-xs ${
              isDark ? 'bg-[#161622] border-neutral-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold block">
              Public Academic Information
            </span>

            {/* Department */}
            <div className="flex items-start gap-2.5">
              <GraduationCap className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-neutral-400 block text-[11px]">Academic Field / Major</span>
                <span className="font-semibold text-neutral-200">
                  {department || (isTeacher ? 'Academic Instruction' : 'General Education')}
                </span>
              </div>
            </div>

            {/* Institution */}
            <div className="flex items-start gap-2.5">
              <Building className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-neutral-400 block text-[11px]">Institution & Campus</span>
                <span className="font-semibold text-neutral-200">
                  {institution || 'Central School Administration'}
                </span>
              </div>
            </div>

            {/* Campus Location */}
            {(city || state || address) && (
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-neutral-400 block text-[11px]">Campus Location</span>
                  <span className="font-semibold text-neutral-200">
                    {city ? city : ''}
                    {state ? (city ? `, ${state}` : state) : ''}
                    {address && !city && !state ? address : ''}
                  </span>
                </div>
              </div>
            )}

            {/* Joined Date */}
            <div className="flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-neutral-400 block text-[11px]">Academic Enrollment</span>
                <span className="font-semibold text-neutral-200 font-mono text-[11px]">
                  Member since {formattedDate}
                </span>
              </div>
            </div>
          </div>

          {/* Context Attendance Rate if available */}
          {attendanceStats && (
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
                isDark ? 'bg-[#14141e] border-neutral-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div>
                <span className="text-[11px] text-neutral-400 block">Class Attendance Rate</span>
                <span className="font-bold text-sm text-emerald-400">
                  {attendanceStats.rate}% Present
                </span>
              </div>
              <div className="text-right text-[11px] text-neutral-400 font-mono">
                <span>{attendanceStats.present} present · {attendanceStats.absent} absent</span>
                <span className="block text-[10px] text-neutral-500">{attendanceStats.total} total sessions</span>
              </div>
            </div>
          )}

          {/* Associated Classes */}
          {courses && courses.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
                <BookOpen className="w-3.5 h-3.5" />
                <span>
                  {isTeacher ? 'Courses Instructed' : 'Enrolled Courses'} ({courses.length})
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {courses.map(c => (
                  <span
                    key={c.id}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold border ${
                      isDark
                        ? 'bg-[#181822] text-neutral-200 border-neutral-800'
                        : 'bg-slate-100 text-slate-800 border-slate-200'
                    }`}
                  >
                    {c.name}
                    {c.section ? ` · ${c.section}` : ''}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-2 flex items-center gap-2">
            <a
              href={`mailto:${email}`}
              className={`flex-1 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 border ${
                isDark
                  ? 'bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Send Email</span>
            </a>

            <button
              type="button"
              onClick={closePublicProfile}
              className={`py-2.5 px-5 rounded-2xl font-bold text-xs transition-colors cursor-pointer border ${
                isDark
                  ? 'bg-white hover:bg-neutral-200 text-black border-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
