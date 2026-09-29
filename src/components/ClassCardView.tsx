import React from 'react';
import { useClassTrack } from '../context/ClassTrackContext';
import {
  Folder,
  Video,
  ArrowRight,
  Plus,
  BookOpen,
  Copy,
  Check,
  Users,
  GraduationCap
} from 'lucide-react';

export const ClassCardView: React.FC = () => {
  const {
    userCourses,
    selectCourse,
    userAssignments,
    theme,
    openJoinCreateModal,
    currentUser,
  } = useClassTrack();

  const isDark = theme === 'dark';
  const isTeacher = currentUser?.role === 'teacher';
  const isAdmin = currentUser?.role === 'admin';
  const canCreate = isTeacher || isAdmin;

  const [copiedCodeId, setCopiedCodeId] = React.useState<string | null>(null);

  const handleCopyCode = (e: React.MouseEvent, courseId: string, code: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCodeId(courseId);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/40 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight">
            {isTeacher ? 'Classes You Teach' : isAdmin ? 'All School Classrooms' : 'Your Enrolled Classes'}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            {isTeacher
              ? 'Only your courses are displayed here. Manage coursework, view enrolled students, and grade submissions.'
              : isAdmin
              ? 'Institution-wide catalog of courses, active faculty instructors, and student enrollment metrics.'
              : 'Courses you have joined. Turn in coursework, check grades, and join class video meetings.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canCreate ? (
            <button
              onClick={() => openJoinCreateModal('create')}
              className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                isDark
                  ? 'bg-[#ff2d75] hover:bg-[#ff1767] text-black shadow-[0_0_25px_rgba(255,45,117,0.45)]'
                  : 'bg-[#0ea5e9] hover:bg-[#0284c7] text-white shadow-md'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Create New Class</span>
            </button>
          ) : (
            <button
              onClick={() => openJoinCreateModal('join')}
              className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                isDark
                  ? 'bg-[#ff2d75] hover:bg-[#ff1767] text-black shadow-[0_0_25px_rgba(255,45,117,0.45)]'
                  : 'bg-[#0ea5e9] hover:bg-[#0284c7] text-white shadow-md'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Join Class with Code</span>
            </button>
          )}
        </div>
      </div>

      {/* If No Courses */}
      {userCourses.length === 0 ? (
        <div className={`p-10 sm:p-16 rounded-3xl border text-center space-y-4 ${
          isDark ? 'bg-[#111116] border-neutral-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className={`w-14 h-14 rounded-3xl mx-auto flex items-center justify-center font-bold ${
            isDark ? 'bg-pink-500/20 text-pink-400' : 'bg-sky-100 text-sky-700'
          }`}>
            <BookOpen className="w-7 h-7" />
          </div>

          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-bold font-display">
              {isTeacher ? 'No classes created yet' : 'No classes enrolled yet'}
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {isTeacher
                ? 'You have not created any courses. Click "Create New Class" above to set up your syllabus and generate an enrollment code for students.'
                : 'You have not joined any classes yet. Ask your instructor for their 7-character class code and click "Join Class with Code".'}
            </p>
          </div>

          <div>
            {canCreate ? (
              <button
                onClick={() => openJoinCreateModal('create')}
                className={`px-6 py-2.5 rounded-2xl font-bold text-xs cursor-pointer ${
                  isDark ? 'bg-[#ff2d75] text-black shadow-[0_0_20px_rgba(255,45,117,0.3)]' : 'bg-[#0ea5e9] text-white'
                }`}
              >
                Create Your First Class
              </button>
            ) : (
              <button
                onClick={() => openJoinCreateModal('join')}
                className={`px-6 py-2.5 rounded-2xl font-bold text-xs cursor-pointer ${
                  isDark ? 'bg-[#ff2d75] text-black shadow-[0_0_20px_rgba(255,45,117,0.3)]' : 'bg-[#0ea5e9] text-white'
                }`}
              >
                Join with Class Code
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Classroom Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userCourses.map(course => {
            const courseAssignments = userAssignments
              .filter(a => a.courseId === course.id && a.status === 'assigned')
              .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
              .slice(0, 2);

            return (
              <div
                key={course.id}
                className={`rounded-3xl flex flex-col justify-between overflow-hidden transition-all duration-300 border ${
                  isDark
                    ? 'bg-[#111116] border-neutral-800 hover:bg-[#15151c] hover:border-neutral-700 hover:shadow-[0_0_30px_rgba(255,45,117,0.15)]'
                    : 'bg-white border-slate-200 shadow-sm hover:shadow-lg'
                }`}
              >
                {/* Header Banner */}
                <div
                  onClick={() => selectCourse(course.id, 'stream')}
                  className="p-5 sm:p-6 relative cursor-pointer group transition-all"
                  style={{
                    backgroundColor: isDark ? '#191524' : '#f0f9ff',
                    borderBottom: `3px solid ${course.color || (isDark ? '#ff2d75' : '#0ea5e9')}`,
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-pink-400 font-bold block">
                        {course.subject}
                      </span>
                      <h3 className="font-bold font-display text-base sm:text-lg text-white group-hover:text-pink-300 transition-colors truncate">
                        {course.name}
                      </h3>
                      <p className="text-xs text-neutral-300 font-medium truncate">
                        {course.section} · Room {course.room}
                      </p>
                      <p className="text-xs text-neutral-400 mt-1 truncate">
                        Instructor: <span className="text-neutral-200 font-medium">{course.teacher.name}</span>
                      </p>
                    </div>

                    {/* Teacher Avatar */}
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isDark ? 'bg-pink-500/20 text-pink-400' : 'bg-sky-100 text-sky-700'
                      }`}
                    >
                      {course.teacher.name.charAt(0)}
                    </div>
                  </div>

                  {/* Class Code & Enrolled Badge */}
                  <div className="mt-4 pt-3 flex items-center justify-between text-xs border-t border-white/10">
                    <button
                      onClick={e => handleCopyCode(e, course.id, course.code)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/40 hover:bg-black/60 text-pink-300 font-mono text-[11px] transition-colors cursor-pointer border border-white/10"
                      title="Copy class code for students"
                    >
                      <span>Code: {course.code}</span>
                      {copiedCodeId === course.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>

                    <div className="flex items-center gap-1 text-[11px] text-neutral-300 font-mono">
                      <Users className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{course.enrolledStudentsCount} students</span>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>{isTeacher ? 'Active Coursework' : 'Due Soon'}</span>
                      <span className="font-mono text-[10px] text-neutral-500">
                        {courseAssignments.length} items
                      </span>
                    </div>

                    {courseAssignments.length > 0 ? (
                      <div className="space-y-2">
                        {courseAssignments.map(asgn => (
                          <div
                            key={asgn.id}
                            onClick={() => selectCourse(course.id, 'classwork')}
                            className={`p-2.5 rounded-2xl text-xs cursor-pointer transition-colors border ${
                              isDark
                                ? 'bg-[#161622] border-neutral-800/80 hover:bg-[#1f1f2e] text-neutral-300'
                                : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            <div className="font-medium truncate">{asgn.title}</div>
                            <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                              Due {asgn.dueDate} {asgn.dueTime && `· ${asgn.dueTime}`}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl text-center text-xs text-neutral-500 italic bg-neutral-900/20">
                        No active deliverables
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className={`pt-3 flex items-center justify-between border-t ${
                    isDark ? 'border-neutral-900' : 'border-slate-100'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      {course.meetLink && (
                        <a
                          href={course.meetLink}
                          target="_blank"
                          rel="noreferrer"
                          className={`p-2 rounded-xl transition-colors ${
                            isDark ? 'text-neutral-400 hover:text-pink-400 hover:bg-neutral-900' : 'text-slate-500 hover:text-sky-600 hover:bg-slate-100'
                          }`}
                          title="Open Meet room"
                        >
                          <Video className="w-4 h-4" />
                        </a>
                      )}
                      {course.driveFolder && (
                        <a
                          href={course.driveFolder}
                          target="_blank"
                          rel="noreferrer"
                          className={`p-2 rounded-xl transition-colors ${
                            isDark ? 'text-neutral-400 hover:text-pink-400 hover:bg-neutral-900' : 'text-slate-500 hover:text-sky-600 hover:bg-slate-100'
                          }`}
                          title="Class Drive Folder"
                        >
                          <Folder className="w-4 h-4" />
                        </a>
                      )}
                    </div>

                    <button
                      onClick={() => selectCourse(course.id, 'stream')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isDark ? 'text-pink-400 hover:text-pink-300' : 'text-sky-600 hover:text-sky-700'
                      }`}
                    >
                      <span>Enter Class</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
