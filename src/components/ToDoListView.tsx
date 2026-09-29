import React, { useState } from 'react';
import { useClassTrack } from '../context/ClassTrackContext';
import {
  CheckCircle2,
  FileText,
  Clock,
  Filter,
  Award,
  AlertCircle,
  User,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ToDoListView: React.FC = () => {
  const {
    userAssignments,
    userCourses,
    selectCourse,
    submitAssignment,
    userSubmissions,
    openGradingModal,
    currentUser,
    theme,
  } = useClassTrack();

  const isDark = theme === 'dark';
  const isTeacher = currentUser?.role === 'teacher';
  const isAdmin = currentUser?.role === 'admin';

  const [studentTab, setStudentTab] = useState<'assigned' | 'missing' | 'done'>('assigned');
  const [teacherTab, setTeacherTab] = useState<'needs_grading' | 'graded' | 'all_assignments'>('needs_grading');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');

  const handleTurnIn = (id: string) => {
    submitAssignment(id, 'submission_document.pdf');
    confetti({
      particleCount: 40,
      spread: 50,
      colors: isDark ? ['#ff2d75', '#ffffff'] : ['#0ea5e9', '#ffffff'],
    });
  };

  // Student Filtered Assignments (Strictly from user's enrolled courses)
  const filteredStudentAssignments = userAssignments.filter(a => {
    const matchesCourse = selectedCourseFilter === 'all' || a.courseId === selectedCourseFilter;
    if (!matchesCourse) return false;

    if (studentTab === 'assigned') {
      return a.status === 'assigned';
    }
    if (studentTab === 'missing') {
      return a.status === 'missing';
    }
    if (studentTab === 'done') {
      return a.status === 'turned_in' || a.status === 'graded';
    }
    return true;
  });

  // Teacher Filtered Submissions (Strictly from user's taught courses)
  const filteredTeacherSubmissions = userSubmissions.filter(s => {
    const matchesCourse = selectedCourseFilter === 'all' || s.courseId === selectedCourseFilter;
    if (!matchesCourse) return false;

    if (teacherTab === 'needs_grading') {
      return s.status === 'turned_in';
    }
    if (teacherTab === 'graded') {
      return s.status === 'graded';
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/40 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight">
            {isTeacher ? 'Faculty Grading & Review Queue' : 'To-Do & Assignment Deadlines'}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            {isTeacher
              ? 'Submissions turned in by students across classes you teach.'
              : 'Track pending deliverables, missing homework, and completed assignments for your enrolled courses.'}
          </p>
        </div>

        {/* Course Filter Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-neutral-400" />
          <select
            value={selectedCourseFilter}
            onChange={e => setSelectedCourseFilter(e.target.value)}
            className={`px-3 py-2 rounded-2xl text-xs focus:outline-none border ${
              isDark ? 'bg-[#181822] border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
            }`}
          >
            <option value="all">All My Classes</option>
            {userCourses.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TEACHER VIEW */}
      {isTeacher || isAdmin ? (
        <div className="space-y-5">
          {/* Sub-Tabs */}
          <div className={`flex items-center p-1 rounded-2xl border self-start ${
            isDark ? 'bg-[#121217] border-neutral-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              onClick={() => setTeacherTab('needs_grading')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                teacherTab === 'needs_grading'
                  ? isDark
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold'
                    : 'bg-white text-amber-900 shadow-sm font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Needs Grading ({userSubmissions.filter(s => s.status === 'turned_in').length})</span>
            </button>

            <button
              onClick={() => setTeacherTab('graded')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                teacherTab === 'graded'
                  ? isDark
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold'
                    : 'bg-white text-emerald-900 shadow-sm font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Graded & Returned ({userSubmissions.filter(s => s.status === 'graded').length})</span>
            </button>

            <button
              onClick={() => setTeacherTab('all_assignments')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                teacherTab === 'all_assignments'
                  ? isDark
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 font-bold'
                    : 'bg-white text-sky-900 shadow-sm font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>All Coursework ({userAssignments.length})</span>
            </button>
          </div>

          {/* Submissions List */}
          {teacherTab !== 'all_assignments' ? (
            <div className="space-y-3">
              {filteredTeacherSubmissions.map(sub => {
                const targetCourse = userCourses.find(c => c.id === sub.courseId);
                const targetAsgn = userAssignments.find(a => a.id === sub.assignmentId);

                return (
                  <div
                    key={sub.id}
                    className={`p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border ${
                      isDark ? 'bg-[#121217] border-neutral-800' : 'bg-white border-slate-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        sub.status === 'graded' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {sub.status === 'graded' ? <Award className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-neutral-100">{sub.studentName}</span>
                          <span className="text-[10px] text-neutral-500 font-mono">({sub.studentEmail})</span>
                        </div>

                        <div className="text-xs text-neutral-300 font-medium">
                          Assignment: <span className="text-white">{targetAsgn?.title || 'Assignment'}</span>
                        </div>

                        <div className="text-[11px] text-neutral-500 font-mono">
                          {targetCourse?.name} · Submitted {new Date(sub.submittedAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>

                        {sub.submissionText && (
                          <div className="text-xs text-neutral-400 italic pt-1">
                            "{sub.submissionText}"
                          </div>
                        )}

                        {sub.feedback && (
                          <div className="text-xs text-emerald-400 pt-1 font-mono">
                            Feedback: {sub.feedback}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <div className="text-right">
                        <span className="font-mono font-bold text-sm text-emerald-400">
                          {sub.pointsEarned !== undefined ? `${sub.pointsEarned}/${sub.maxPoints} pts` : `${sub.maxPoints} max pts`}
                        </span>
                      </div>

                      <button
                        onClick={() => openGradingModal(sub)}
                        className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                          sub.status === 'graded'
                            ? isDark ? 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700' : 'bg-slate-200 text-slate-800'
                            : isDark ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-emerald-600 text-white shadow-sm'
                        }`}
                      >
                        {sub.status === 'graded' ? 'Edit Grade' : 'Grade Submission'}
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredTeacherSubmissions.length === 0 && (
                <div className="p-10 text-center text-neutral-500 text-xs rounded-3xl border border-dashed border-neutral-800">
                  No submissions in this category.
                </div>
              )}
            </div>
          ) : (
            /* All Classwork Overview */
            <div className="space-y-3">
              {userAssignments.map(asgn => {
                const targetCourse = userCourses.find(c => c.id === asgn.courseId);
                const asgnSubs = userSubmissions.filter(s => s.assignmentId === asgn.id);
                const turnedIn = asgnSubs.filter(s => s.status === 'turned_in').length;
                const graded = asgnSubs.filter(s => s.status === 'graded').length;

                return (
                  <div
                    key={asgn.id}
                    onClick={() => selectCourse(asgn.courseId, 'classwork')}
                    className={`p-4 sm:p-5 rounded-3xl flex items-center justify-between gap-4 border cursor-pointer transition-all ${
                      isDark ? 'bg-[#121217] border-neutral-800 hover:bg-[#161622]' : 'bg-white border-slate-200 shadow-sm hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-neutral-100">{asgn.title}</div>
                      <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                        {targetCourse?.name} · Due {asgn.dueDate} · {asgn.maxPoints} pts
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono px-3 py-1 rounded-xl bg-sky-500/20 text-sky-400 font-bold">
                        {turnedIn} To Grade · {graded} Graded
                      </span>
                      <ArrowRight className="w-4 h-4 text-neutral-400" />
                    </div>
                  </div>
                );
              })}

              {userAssignments.length === 0 && (
                <div className="p-10 text-center text-neutral-500 text-xs rounded-3xl border border-dashed border-neutral-800">
                  No coursework items published in your classes yet.
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* STUDENT VIEW */
        <div className="space-y-5">
          {/* Sub-Tabs */}
          <div className={`flex items-center p-1 rounded-2xl border self-start ${
            isDark ? 'bg-[#121217] border-neutral-800' : 'bg-slate-100 border-slate-200'
          }`}>
            {(['assigned', 'missing', 'done'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setStudentTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                  studentTab === tab
                    ? isDark
                      ? 'bg-[#ff2d75] text-black font-bold shadow-[0_0_12px_rgba(255,45,117,0.4)]'
                      : 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredStudentAssignments.map(asgn => {
              const targetCourse = userCourses.find(c => c.id === asgn.courseId);

              return (
                <div
                  key={asgn.id}
                  className={`p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border ${
                    isDark ? 'bg-[#121217] border-neutral-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      asgn.status === 'graded' || asgn.status === 'turned_in'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : asgn.status === 'missing'
                        ? 'bg-rose-500/20 text-rose-400'
                        : 'bg-pink-500/20 text-pink-400'
                    }`}>
                      <FileText className="w-5 h-5" />
                    </div>

                    <div>
                      <h3
                        onClick={() => selectCourse(asgn.courseId, 'classwork')}
                        className="font-bold text-sm text-neutral-100 hover:text-pink-400 cursor-pointer transition-colors"
                      >
                        {asgn.title}
                      </h3>
                      <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                        {targetCourse?.name} · Due {asgn.dueDate} {asgn.dueTime && `· ${asgn.dueTime}`} · {asgn.maxPoints} pts
                      </div>
                      {asgn.teacherFeedback && (
                        <div className="text-xs text-emerald-400 font-mono mt-1">
                          Teacher Note: "{asgn.teacherFeedback}"
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    {asgn.status === 'graded' ? (
                      <div className="text-right">
                        <span className="font-mono font-bold text-sm text-emerald-400">
                          {asgn.earnedPoints} / {asgn.maxPoints} pts
                        </span>
                      </div>
                    ) : asgn.status === 'assigned' ? (
                      <button
                        onClick={() => handleTurnIn(asgn.id)}
                        className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                          isDark
                            ? 'bg-[#ff2d75] hover:bg-[#ff1767] text-black shadow-[0_0_15px_rgba(255,45,117,0.3)]'
                            : 'bg-[#0ea5e9] hover:bg-[#0284c7] text-white shadow-sm'
                        }`}
                      >
                        Turn In Work
                      </button>
                    ) : (
                      <span className="text-xs font-mono font-bold text-emerald-400 uppercase">
                        {asgn.status}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredStudentAssignments.length === 0 && (
              <div className="p-10 text-center text-neutral-500 text-xs rounded-3xl border border-dashed border-neutral-800">
                No assignments in this category for your enrolled courses.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
