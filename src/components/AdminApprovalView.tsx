import React, { useState } from 'react';
import { useClassTrack } from '../context/ClassTrackContext';
import {
  ShieldCheck,
  UserCheck,
  UserX,
  Clock,
  CheckCircle2,
  GraduationCap,
  Users,
  Search,
  BookOpen,
  Megaphone,
  Plus,
  Trash2,
  AlertTriangle,
  Mail,
  School,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserRole } from '../types';

export const AdminApprovalView: React.FC = () => {
  const {
    registeredUsers,
    approveTeacher,
    rejectTeacher,
    deleteUser,
    adminUpdateUserRole,
    courses,
    archiveCourse,
    schoolAnnouncements,
    addSchoolAnnouncement,
    deleteSchoolAnnouncement,
    viewPublicProfile,
    currentUser,
    theme,
  } = useClassTrack();

  const isDark = theme === 'dark';

  // Admin Navigation Subtabs
  const [adminTab, setAdminTab] = useState<'approvals' | 'users' | 'courses' | 'broadcasts'>('approvals');

  // Approvals Filter & Search
  const [approvalFilter, setApprovalFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  // User Directory Search & Filter
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'student' | 'teacher' | 'admin'>('all');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Broadcast Form
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');
  const [broadcastPriority, setBroadcastPriority] = useState<'normal' | 'important' | 'urgent'>('important');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const teachers = registeredUsers.filter(u => u.role === 'teacher');
  const pendingTeachers = teachers.filter(u => u.approvalStatus === 'pending');
  const approvedTeachers = teachers.filter(u => u.approvalStatus === 'approved');
  const students = registeredUsers.filter(u => u.role === 'student');

  const filteredTeachers = teachers.filter(t => {
    if (approvalFilter !== 'all' && t.approvalStatus !== approvalFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        (t.institution && t.institution.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const filteredUsers = registeredUsers.filter(u => {
    if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
    if (userSearchQuery.trim()) {
      const q = userSearchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.department && u.department.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleApprove = (id: string) => {
    approveTeacher(id);
    confetti({
      particleCount: 50,
      spread: 60,
      colors: isDark ? ['#10b981', '#ffffff'] : ['#10b981', '#0ea5e9'],
    });
  };

  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastContent.trim()) return;

    addSchoolAnnouncement(broadcastTitle.trim(), broadcastContent.trim(), broadcastPriority);
    setBroadcastTitle('');
    setBroadcastContent('');
    setIsBroadcasting(false);

    confetti({
      particleCount: 40,
      spread: 50,
      colors: ['#a855f7', '#10b981', '#ffffff'],
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-neutral-800/40 pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Manage teacher approvals, user accounts, courses, and school announcements.
        </p>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          onClick={() => setAdminTab('approvals')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border ${
            adminTab === 'approvals'
              ? isDark
                ? 'bg-emerald-500 text-black border-emerald-400 font-bold shadow-sm'
                : 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-sm'
              : isDark
              ? 'bg-[#121217] text-neutral-300 border-neutral-800 hover:border-neutral-700 hover:text-white'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 shadow-sm'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Teacher Approvals</span>
          {pendingTeachers.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              adminTab === 'approvals' ? 'bg-black/25 text-black' : 'bg-amber-500/20 text-amber-400'
            }`}>
              {pendingTeachers.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setAdminTab('users')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border ${
            adminTab === 'users'
              ? isDark
                ? 'bg-emerald-500 text-black border-emerald-400 font-bold shadow-sm'
                : 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-sm'
              : isDark
              ? 'bg-[#121217] text-neutral-300 border-neutral-800 hover:border-neutral-700 hover:text-white'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 shadow-sm'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Users ({registeredUsers.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('courses')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border ${
            adminTab === 'courses'
              ? isDark
                ? 'bg-emerald-500 text-black border-emerald-400 font-bold shadow-sm'
                : 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-sm'
              : isDark
              ? 'bg-[#121217] text-neutral-300 border-neutral-800 hover:border-neutral-700 hover:text-white'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 shadow-sm'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Courses ({courses.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('broadcasts')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border ${
            adminTab === 'broadcasts'
              ? isDark
                ? 'bg-emerald-500 text-black border-emerald-400 font-bold shadow-sm'
                : 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-sm'
              : isDark
              ? 'bg-[#121217] text-neutral-300 border-neutral-800 hover:border-neutral-700 hover:text-white'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 shadow-sm'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Announcements</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-5 rounded-3xl border ${isDark ? 'bg-[#121217] border-neutral-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400">Pending Review</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-display mt-2 text-amber-400">
            {pendingTeachers.length}
          </div>
          <span className="text-[11px] text-neutral-500 mt-0.5 block">Awaiting review</span>
        </div>

        <div className={`p-5 rounded-3xl border ${isDark ? 'bg-[#121217] border-neutral-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400">Faculty Members</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-display mt-2 text-emerald-400">
            {approvedTeachers.length}
          </div>
          <span className="text-[11px] text-neutral-500 mt-0.5 block">Approved teachers</span>
        </div>

        <div className={`p-5 rounded-3xl border ${isDark ? 'bg-[#121217] border-neutral-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400">Students</span>
            <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-display mt-2 text-pink-400">
            {students.length}
          </div>
          <span className="text-[11px] text-neutral-500 mt-0.5 block">Registered students</span>
        </div>

        <div className={`p-5 rounded-3xl border ${isDark ? 'bg-[#121217] border-neutral-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400">Active Courses</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-display mt-2 text-sky-400">
            {courses.length}
          </div>
          <span className="text-[11px] text-neutral-500 mt-0.5 block">Active courses</span>
        </div>
      </div>

      {/* SUBTAB 1: TEACHER APPROVALS */}
      {adminTab === 'approvals' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className={`flex items-center p-1 rounded-2xl border ${
              isDark ? 'bg-[#121217] border-neutral-800' : 'bg-slate-100 border-slate-200'
            }`}>
              {(['pending', 'approved', 'rejected', 'all'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setApprovalFilter(tab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                    approvalFilter === tab
                      ? isDark
                        ? 'bg-[#1e1e2c] text-white shadow-sm'
                        : 'bg-white text-slate-900 shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search teacher name, email..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className={`pl-8 pr-3 py-1.5 rounded-xl text-xs focus:outline-none w-full sm:w-64 border ${
                  isDark ? 'bg-[#121217] border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredTeachers.map(teacher => (
              <div
                key={teacher.id}
                className={`p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border ${
                  isDark ? 'bg-[#121217] border-neutral-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 ${
                    teacher.approvalStatus === 'approved'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : teacher.approvalStatus === 'pending'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {teacher.name.charAt(0)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => viewPublicProfile({ id: teacher.id, name: teacher.name, email: teacher.email, role: 'teacher' })}
                        className="font-bold text-sm text-neutral-100 hover:text-emerald-400 cursor-pointer transition-colors text-left"
                        title="Click to view public profile and academic info"
                      >
                        {teacher.name}
                      </button>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                        teacher.approvalStatus === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : teacher.approvalStatus === 'pending'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {teacher.approvalStatus}
                      </span>
                    </div>

                    <div className="text-xs text-neutral-400 font-mono mt-0.5">{teacher.email}</div>
                    <div className="text-[11px] text-neutral-500 mt-1">
                      {teacher.department || 'Department of Computer Science'} · {teacher.institution || 'State University'}
                      {teacher.address && (
                        <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                          Address: {teacher.address}{teacher.city ? `, ${teacher.city}` : ''}{teacher.state ? `, ${teacher.state}` : ''}{teacher.zipCode ? ` ${teacher.zipCode}` : ''}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {teacher.approvalStatus !== 'approved' && (
                    <button
                      onClick={() => handleApprove(teacher.id)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isDark
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Grant Clearance</span>
                    </button>
                  )}

                  {teacher.approvalStatus !== 'rejected' && (
                    <button
                      onClick={() => rejectTeacher(teacher.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isDark
                          ? 'bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/40'
                          : 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                      }`}
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>Revoke / Reject</span>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {filteredTeachers.length === 0 && (
              <div className="p-8 text-center text-neutral-500 text-xs">
                No teacher applications match your filter.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 2: USER DIRECTORY */}
      {adminTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <select
                value={userRoleFilter}
                onChange={e => setUserRoleFilter(e.target.value as any)}
                className={`px-3 py-2 rounded-xl text-xs focus:outline-none border ${
                  isDark ? 'bg-[#121217] border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                <option value="all">All User Roles</option>
                <option value="admin">Administrators</option>
                <option value="teacher">Teachers / Faculty</option>
                <option value="student">Students</option>
              </select>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by name, email..."
                value={userSearchQuery}
                onChange={e => setUserSearchQuery(e.target.value)}
                className={`pl-8 pr-3 py-2 rounded-xl text-xs focus:outline-none w-full sm:w-64 border ${
                  isDark ? 'bg-[#121217] border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* User Table */}
          <div className={`rounded-3xl border overflow-hidden ${
            isDark ? 'bg-[#121217] border-neutral-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className={`text-[11px] uppercase tracking-wider border-b ${
                    isDark ? 'text-neutral-500 border-neutral-800' : 'text-slate-400 border-slate-200'
                  }`}>
                    <th className="p-4 font-semibold">User</th>
                    <th className="p-4 font-semibold">Role</th>
                    <th className="p-4 font-semibold">Clearance Status</th>
                    <th className="p-4 font-semibold">Department</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-neutral-900/80' : 'divide-slate-100'}`}>
                  {filteredUsers.map(user => (
                    <tr key={user.id} className={isDark ? 'hover:bg-[#181822]' : 'hover:bg-slate-50'}>
                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => viewPublicProfile({ id: user.id, name: user.name, email: user.email, role: user.role })}
                          className="font-bold text-neutral-200 hover:text-emerald-400 transition-colors cursor-pointer text-left"
                          title="Click to view public profile and academic info"
                        >
                          {user.name}
                        </button>
                        <div className="text-[11px] text-neutral-400 font-mono">{user.email}</div>
                        {user.address && (
                          <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                            {user.address}{user.city ? `, ${user.city}` : ''}{user.state ? `, ${user.state}` : ''}{user.zipCode ? ` ${user.zipCode}` : ''}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full font-mono uppercase text-[9px] font-bold ${
                          user.role === 'admin'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : user.role === 'teacher'
                            ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                            : 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full font-mono uppercase text-[9px] font-bold ${
                          user.approvalStatus === 'approved'
                            ? 'text-emerald-400'
                            : user.approvalStatus === 'pending'
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}>
                          {user.approvalStatus}
                        </span>
                      </td>
                      <td className="p-4 text-neutral-400">
                        {user.department || user.institution || 'General'}
                      </td>
                      <td className="p-4 text-right">
                        {(!currentUser || user.id !== currentUser.id) && (
                          <button
                            onClick={() => deleteUser(user.id)}
                            className="p-1.5 text-neutral-500 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Delete user account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: CAMPUS COURSES */}
      {adminTab === 'courses' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map(course => (
              <div
                key={course.id}
                className={`p-5 rounded-3xl border flex flex-col justify-between ${
                  isDark ? 'bg-[#121217] border-neutral-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-pink-400">
                      {course.subject}
                    </span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300">
                      Code: {course.code}
                    </span>
                  </div>
                  <h3 className="font-bold text-base mt-1 text-neutral-100">{course.name}</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">{course.section} · Room {course.room}</p>

                  <div className="mt-4 pt-3 border-t border-neutral-800/60 text-xs space-y-1">
                    <div className="text-neutral-400">
                      Instructor: <span className="text-neutral-200 font-semibold">{course.teacher.name}</span>
                    </div>
                    <div className="text-neutral-400">
                      Enrolled: <span className="text-neutral-200 font-mono font-bold">{course.enrolledStudentsCount}</span> students
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => archiveCourse(course.id)}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Archive Course</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 4: BROADCAST ANNOUNCEMENTS */}
      {adminTab === 'broadcasts' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold font-display">Campus-Wide Broadcast System</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Official notices broadcasted to all enrolled students and faculty members.
              </p>
            </div>

            <button
              onClick={() => setIsBroadcasting(!isBroadcasting)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                isDark ? 'bg-purple-500 text-black hover:bg-purple-400' : 'bg-purple-600 text-white'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Broadcast</span>
            </button>
          </div>

          {isBroadcasting && (
            <form onSubmit={handleBroadcastSubmit} className={`p-5 rounded-3xl border space-y-3.5 ${
              isDark ? 'bg-[#151522] border-neutral-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="font-bold text-xs text-neutral-200">Publish Campus Announcement</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    required
                    placeholder="Broadcast Subject (e.g. Fall Semester Final Exam Schedules)"
                    value={broadcastTitle}
                    onChange={e => setBroadcastTitle(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-2xl text-xs focus:outline-none ${
                      isDark ? 'bg-[#1c1c2e] text-white' : 'bg-white text-slate-900 border border-slate-200'
                    }`}
                  />
                </div>
                <div>
                  <select
                    value={broadcastPriority}
                    onChange={e => setBroadcastPriority(e.target.value as any)}
                    className={`w-full px-3.5 py-2.5 rounded-2xl text-xs focus:outline-none ${
                      isDark ? 'bg-[#1c1c2e] text-white' : 'bg-white text-slate-900 border border-slate-200'
                    }`}
                  >
                    <option value="normal">Normal Notice</option>
                    <option value="important">Important Priority</option>
                    <option value="urgent">Urgent Alert</option>
                  </select>
                </div>
              </div>

              <div>
                <textarea
                  rows={3}
                  required
                  placeholder="Detailed announcement content, instructions, or deadlines..."
                  value={broadcastContent}
                  onChange={e => setBroadcastContent(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-2xl text-xs focus:outline-none resize-none ${
                    isDark ? 'bg-[#1c1c2e] text-white' : 'bg-white text-slate-900 border border-slate-200'
                  }`}
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBroadcasting(false)}
                  className="px-4 py-2 text-xs text-neutral-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-2xl font-bold text-xs cursor-pointer ${
                    isDark ? 'bg-purple-500 text-black hover:bg-purple-400' : 'bg-purple-600 text-white'
                  }`}
                >
                  Publish Notice
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {schoolAnnouncements.map(ann => (
              <div
                key={ann.id}
                className={`p-5 rounded-3xl border space-y-2 ${
                  isDark ? 'bg-[#121217] border-neutral-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full font-mono uppercase text-[9px] font-bold ${
                      ann.priority === 'urgent'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : ann.priority === 'important'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                    }`}>
                      {ann.priority}
                    </span>
                    <h4 className="font-bold text-sm text-neutral-100">{ann.title}</h4>
                  </div>

                  <button
                    onClick={() => deleteSchoolAnnouncement(ann.id)}
                    className="p-1.5 text-neutral-500 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed whitespace-pre-line">
                  {ann.content}
                </p>

                <div className="pt-2 text-[10px] text-neutral-500 font-mono flex items-center justify-between border-t border-neutral-800/40">
                  <span>Posted by {ann.authorName} ({ann.authorRole})</span>
                  <span>{new Date(ann.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
