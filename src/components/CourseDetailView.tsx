import React, { useState } from 'react';
import { useClassTrack } from '../context/ClassTrackContext';
import { ClassAttendanceView } from './ClassAttendanceView';
import {
  Video,
  Folder,
  Send,
  FileText,
  Paperclip,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ArrowLeft,
  Copy,
  Check,
  Plus,
  Trash2,
  Award,
  UserPlus,
  UserCheck,
  UserMinus,
  MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CourseDetailView: React.FC = () => {
  const {
    courses,
    userCourses,
    activeCourseId,
    courseSubTab,
    setCourseSubTab,
    setActiveTab,
    announcements,
    addAnnouncement,
    deleteAnnouncement,
    addComment,
    topics,
    createTopic,
    assignments,
    deleteAssignment,
    submitAssignmentWithDetails,
    unsubmitAssignment,
    submissions,
    openGradingModal,
    openCreateAssignmentModal,
    getClassmates,
    addStudentToCourse,
    removeStudentFromCourse,
    viewPublicProfile,
    currentUser,
    theme,
  } = useClassTrack();

  const isDark = theme === 'dark';
  const isTeacher = currentUser?.role === 'teacher';
  const isAdmin = currentUser?.role === 'admin';
  const canManage = isTeacher || isAdmin;

  // STRICT ACCESS: Only find course within userCourses (courses the user teaches, is enrolled in, or admin)
  const course = userCourses.find(c => c.id === activeCourseId) || userCourses[0];

  const [announcementText, setAnnouncementText] = useState('');
  const [isAnnouncing, setIsAnnouncing] = useState(false);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedAssignment, setExpandedAssignment] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Student submission dialog state
  const [submissionNotes, setSubmissionNotes] = useState<Record<string, string>>({});
  const [submissionFiles, setSubmissionFiles] = useState<Record<string, string>>({});

  // Add topic inline
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [newTopicInput, setNewTopicInput] = useState('');

  // Add student inline (People tab)
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [studentNameInput, setStudentNameInput] = useState('');
  const [studentEmailInput, setStudentEmailInput] = useState('');

  if (!course) {
    return (
      <div className="p-8 text-center text-neutral-400 space-y-4">
        <p>No class selected.</p>
        <button
          onClick={() => setActiveTab('classes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
            isDark ? 'bg-[#ff2d75] text-black' : 'bg-[#0ea5e9] text-white'
          }`}
        >
          Back to Classes
        </button>
      </div>
    );
  }

  const courseAnnouncements = announcements.filter(a => a.courseId === course.id);
  const courseTopics = topics.filter(t => t.courseId === course.id);
  const courseAssignments = assignments.filter(a => a.courseId === course.id);
  const classmates = getClassmates(course.id);
  const courseSubmissions = submissions.filter(s => s.courseId === course.id);

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) return;
    addAnnouncement(course.id, announcementText.trim());
    setAnnouncementText('');
    setIsAnnouncing(false);
  };

  const handleSendComment = (announcementId: string) => {
    const text = commentInputs[announcementId];
    if (!text || !text.trim()) return;
    addComment(announcementId, text.trim());
    setCommentInputs({ ...commentInputs, [announcementId]: '' });
  };

  const handleTurnInWithDetails = (assignmentId: string) => {
    const note = submissionNotes[assignmentId] || 'Completed assignment submission.';
    const file = submissionFiles[assignmentId] || `${course.name.substring(0, 5).toLowerCase()}_submission.pdf`;

    submitAssignmentWithDetails(assignmentId, course.id, note, file);

    confetti({
      particleCount: 40,
      spread: 60,
      colors: isDark ? ['#ff2d75', '#ffffff'] : ['#0ea5e9', '#ffffff'],
    });
  };

  const copyClassCode = () => {
    navigator.clipboard.writeText(course.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicInput.trim()) return;
    createTopic(course.id, newTopicInput.trim());
    setNewTopicInput('');
    setIsAddingTopic(false);
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentNameInput.trim() || !studentEmailInput.trim()) return;
    addStudentToCourse(course.id, studentNameInput.trim(), studentEmailInput.trim());
    setStudentNameInput('');
    setStudentEmailInput('');
    setIsAddingStudent(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* 1. Class Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-800/40">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab('classes')}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isDark ? 'bg-[#14141a] text-neutral-400 hover:text-white border border-neutral-800' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
            title="Back to All Classes"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold font-display tracking-tight leading-tight">{course.name}</h1>
            <p className="text-[11px] text-neutral-400">{course.section} · {course.room}</p>
          </div>
        </div>

        {/* Classroom Sub-Tabs */}
        <div className={`flex items-center gap-1 p-1 rounded-2xl overflow-x-auto max-w-full self-start sm:self-auto border ${
          isDark ? 'bg-[#121217] border-neutral-800' : 'bg-slate-100 border-slate-200'
        }`}>
          {(['stream', 'classwork', 'attendance', 'people', 'grades'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setCourseSubTab(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all cursor-pointer ${
                courseSubTab === tab
                  ? isDark
                    ? 'bg-[#ff2d75] text-black font-bold shadow-[0_0_12px_rgba(255,45,117,0.4)]'
                    : 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {tab === 'grades' && canManage ? 'Gradebook' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* 2. STREAM TAB */}
      {courseSubTab === 'stream' && (
        <div className="space-y-6">
          {/* Banner Card */}
          <div
            className="p-6 sm:p-8 rounded-3xl relative overflow-hidden text-white flex flex-col justify-between min-h-[140px] shadow-lg border border-neutral-800"
            style={{
              backgroundColor: isDark ? '#161324' : '#0284c7',
              borderLeft: `6px solid ${course.color || (isDark ? '#ff2d75' : '#0ea5e9')}`,
            }}
          >
            <div className="space-y-1 max-w-2xl">
              <span className="text-[11px] font-mono uppercase tracking-wider text-pink-300 font-bold">
                {course.subject}
              </span>
              <h2 className="text-xl sm:text-3xl font-bold font-display">{course.name}</h2>
              <p className="text-xs text-neutral-200">{course.section} · Room {course.room}</p>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-neutral-300 font-medium">Class Code:</span>
                <button
                  onClick={copyClassCode}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/40 hover:bg-black/60 font-mono font-bold tracking-wider text-pink-300 transition-colors cursor-pointer border border-white/10"
                  title="Copy enrollment code"
                >
                  <span>{course.code}</span>
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center gap-2">
                {course.meetLink && (
                  <a
                    href={course.meetLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold transition-colors"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Join Meet</span>
                  </a>
                )}
                {course.driveFolder && (
                  <a
                    href={course.driveFolder}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                    title="Open Drive Folder"
                  >
                    <Folder className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Left Sidebar: Upcoming Due Dates */}
            <div className="md:col-span-1 space-y-4">
              <div className={`p-4 rounded-3xl border ${isDark ? 'bg-[#121217] border-neutral-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-xs font-display flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-pink-400" />
                    <span>Upcoming</span>
                  </h3>
                  <span className="text-[10px] font-mono text-neutral-400">Due soon</span>
                </div>

                <div className="space-y-2.5">
                  {courseAssignments.slice(0, 3).map(asgn => (
                    <div
                      key={asgn.id}
                      onClick={() => {
                        setCourseSubTab('classwork');
                        setExpandedAssignment(asgn.id);
                      }}
                      className={`p-2.5 rounded-2xl text-xs cursor-pointer transition-all ${
                        isDark ? 'hover:bg-[#1a1a24] text-neutral-300' : 'hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      <div className="font-semibold truncate">{asgn.title}</div>
                      <div className="text-[10px] text-neutral-400 font-mono mt-0.5">Due {asgn.dueDate}</div>
                    </div>
                  ))}
                  {courseAssignments.length === 0 && (
                    <p className="text-[11px] text-neutral-500 py-2 text-center">No assignments due</p>
                  )}
                </div>
              </div>

              {canManage && (
                <div className={`p-4 rounded-3xl border ${isDark ? 'bg-[#121217] border-neutral-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <h4 className="font-bold text-xs mb-2">Teacher Quick Actions</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => openCreateAssignmentModal(course.id)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        isDark ? 'bg-sky-500/20 text-sky-300 hover:bg-sky-500/30' : 'bg-sky-50 text-sky-800 hover:bg-sky-100'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>New Assignment</span>
                    </button>
                    <button
                      onClick={() => setCourseSubTab('grades')}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        isDark ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      }`}
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Grade Submissions</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Announcement Feed */}
            <div className="md:col-span-3 space-y-4">
              {/* Post Announcement Box */}
              <div className={`p-4 sm:p-5 rounded-3xl border ${
                isDark ? 'bg-[#121217] border-neutral-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                {!isAnnouncing ? (
                  <div
                    onClick={() => setIsAnnouncing(true)}
                    className={`p-3.5 rounded-2xl flex items-center gap-3 cursor-pointer transition-colors ${
                      isDark ? 'bg-[#181824] hover:bg-[#1f1f2e] text-neutral-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-500'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      isDark ? 'bg-pink-500/20 text-pink-400' : 'bg-sky-100 text-sky-700'
                    }`}>
                      {currentUser?.name.charAt(0) || 'U'}
                    </div>
                    <span className="text-xs">Announce something to your class...</span>
                  </div>
                ) : (
                  <form onSubmit={handlePostAnnouncement} className="space-y-3">
                    <textarea
                      rows={3}
                      autoFocus
                      required
                      placeholder="Share notes, resources, syllabus updates, or schedule changes with your class..."
                      value={announcementText}
                      onChange={e => setAnnouncementText(e.target.value)}
                      className={`w-full p-3.5 rounded-2xl text-xs focus:outline-none resize-none ${
                        isDark ? 'bg-[#181824] text-white' : 'bg-slate-100 text-slate-900'
                      }`}
                    />
                    <div className="flex items-center justify-between pt-1">
                      <div className="text-[11px] text-neutral-500 font-mono">
                        Posting as {currentUser?.name} ({currentUser?.role})
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsAnnouncing(false)}
                          className="px-3 py-1.5 rounded-xl text-xs text-neutral-400 hover:text-white cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className={`px-5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isDark
                              ? 'bg-[#ff2d75] hover:bg-[#ff1767] text-black shadow-[0_0_15px_rgba(255,45,117,0.4)]'
                              : 'bg-[#0ea5e9] hover:bg-[#0284c7] text-white shadow-sm'
                          }`}
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>

              {/* Feed Stream */}
              {courseAnnouncements.map(post => (
                <div
                  key={post.id}
                  className={`p-5 rounded-3xl space-y-4 border ${
                    isDark ? 'bg-[#121217] border-neutral-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs ${
                        post.author.role === 'teacher' || post.author.role === 'admin'
                          ? isDark ? 'bg-sky-500/20 text-sky-400' : 'bg-sky-100 text-sky-700'
                          : isDark ? 'bg-pink-500/20 text-pink-400' : 'bg-slate-200 text-slate-800'
                      }`}>
                        {post.author.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-neutral-200">{post.author.name}</span>
                          <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full uppercase ${
                            post.author.role === 'teacher'
                              ? 'bg-sky-500/20 text-sky-400 font-bold'
                              : 'bg-neutral-800 text-neutral-400'
                          }`}>
                            {post.author.role}
                          </span>
                        </div>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          {new Date(post.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    {canManage && (
                      <button
                        onClick={() => deleteAnnouncement(post.id)}
                        className="p-1.5 text-neutral-500 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete announcement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-neutral-300 leading-relaxed whitespace-pre-line">
                    {post.content}
                  </p>

                  {/* Attachments */}
                  {post.attachments && post.attachments.length > 0 && (
                    <div className="space-y-1.5">
                      {post.attachments.map((att, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-2xl flex items-center justify-between text-xs border ${
                            isDark ? 'bg-[#181822] border-neutral-800' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Paperclip className="w-3.5 h-3.5 text-pink-400" />
                            <span className="font-medium text-neutral-200">{att.title}</span>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Comments Thread */}
                  <div className={`pt-3.5 space-y-3 ${isDark ? 'border-t border-neutral-900' : 'border-t border-slate-100'}`}>
                    {post.comments.map(c => (
                      <div key={c.id} className="text-xs flex items-start gap-2.5">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                          isDark ? 'bg-[#222230] text-neutral-300' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {c.author.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-neutral-200 text-[11px]">{c.author}</span>
                            <span className="text-[10px] text-neutral-500 font-mono">
                              {new Date(c.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <p className="text-neutral-300 text-[11px] mt-0.5">{c.content}</p>
                        </div>
                      </div>
                    ))}

                    {/* Add comment box */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Add class comment..."
                        value={commentInputs[post.id] || ''}
                        onChange={e => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleSendComment(post.id);
                        }}
                        className={`flex-1 px-3.5 py-2 rounded-xl text-xs focus:outline-none ${
                          isDark ? 'bg-[#181822] text-white' : 'bg-slate-100 text-slate-900'
                        }`}
                      />
                      <button
                        onClick={() => handleSendComment(post.id)}
                        className={`p-2 rounded-xl transition-colors cursor-pointer ${
                          isDark ? 'bg-[#1f1f2a] text-neutral-300 hover:text-white' : 'bg-slate-200 text-slate-700 hover:text-slate-900'
                        }`}
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. CLASSWORK TAB */}
      {courseSubTab === 'classwork' && (
        <div className="space-y-6">
          {/* Top Classwork Actions (Create Assignment / Create Topic) */}
          {canManage && (
            <div className={`p-4 rounded-3xl flex flex-wrap items-center justify-between gap-3 border ${
              isDark ? 'bg-[#121217] border-neutral-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openCreateAssignmentModal(course.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    isDark
                      ? 'bg-[#ff2d75] hover:bg-[#ff1767] text-black shadow-[0_0_20px_rgba(255,45,117,0.4)]'
                      : 'bg-[#0ea5e9] hover:bg-[#0284c7] text-white shadow-md'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Assignment</span>
                </button>

                <button
                  onClick={() => setIsAddingTopic(!isAddingTopic)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer border ${
                    isDark
                      ? 'bg-[#181824] hover:bg-[#202030] text-neutral-200 border-neutral-700'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Topic</span>
                </button>
              </div>

              <div className="text-xs font-mono text-neutral-400">
                {courseAssignments.length} Assignments · {courseTopics.length} Topics
              </div>
            </div>
          )}

          {/* Add Topic Inline Form */}
          {isAddingTopic && (
            <form onSubmit={handleCreateTopic} className={`p-4 rounded-3xl border ${
              isDark ? 'bg-[#15151e] border-neutral-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  placeholder="New topic name (e.g. Module 4: Memory Caches & Sharding)"
                  value={newTopicInput}
                  onChange={e => setNewTopicInput(e.target.value)}
                  className={`flex-1 px-3.5 py-2 rounded-2xl text-xs focus:outline-none ${
                    isDark ? 'bg-[#1e1e2c] text-white' : 'bg-white text-slate-900 border border-slate-200'
                  }`}
                />
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-2xl font-bold text-xs cursor-pointer ${
                    isDark ? 'bg-[#ff2d75] text-black' : 'bg-[#0ea5e9] text-white'
                  }`}
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingTopic(false)}
                  className="px-3 py-2 text-xs text-neutral-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Topics & Assignments List */}
          {courseTopics.map(topic => {
            const topicAssignments = courseAssignments.filter(a => a.topicId === topic.id);

            return (
              <div key={topic.id} className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-base sm:text-lg font-bold font-display tracking-tight text-neutral-100">
                    {topic.title}
                  </h3>
                  <span className="text-xs font-mono text-neutral-400">
                    {topicAssignments.length} coursework items
                  </span>
                </div>

                <div className="space-y-2.5">
                  {topicAssignments.map(asgn => {
                    const isExpanded = expandedAssignment === asgn.id;
                    const asgnSubmissions = courseSubmissions.filter(s => s.assignmentId === asgn.id);
                    const turnedInCount = asgnSubmissions.filter(s => s.status === 'turned_in').length;
                    const gradedCount = asgnSubmissions.filter(s => s.status === 'graded').length;

                    return (
                      <div
                        key={asgn.id}
                        className={`rounded-3xl transition-all duration-200 overflow-hidden border ${
                          isExpanded
                            ? isDark
                              ? 'bg-[#181824] border-neutral-700 shadow-[0_0_25px_rgba(255,45,117,0.15)]'
                              : 'bg-white border-slate-300 shadow-md'
                            : isDark
                            ? 'bg-[#121217] border-neutral-800 hover:bg-[#16161f]'
                            : 'bg-white border-slate-200 shadow-sm hover:bg-slate-50'
                        }`}
                      >
                        {/* Assignment Header Row */}
                        <div
                          onClick={() => setExpandedAssignment(isExpanded ? null : asgn.id)}
                          className="p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                              asgn.status === 'graded' || asgn.status === 'turned_in'
                                ? isDark ? 'bg-emerald-950/60 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                                : asgn.status === 'missing'
                                ? isDark ? 'bg-rose-950/60 text-rose-400' : 'bg-rose-100 text-rose-700'
                                : isDark ? 'bg-pink-950/60 text-pink-400' : 'bg-sky-100 text-sky-700'
                            }`}>
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="truncate">
                              <h4 className="text-xs sm:text-sm font-bold text-neutral-100 truncate">
                                {asgn.title}
                              </h4>
                              <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                                Due {asgn.dueDate} {asgn.dueTime && `· ${asgn.dueTime}`} · {asgn.maxPoints} pts
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            {canManage ? (
                              <span className="text-[10px] font-mono px-2.5 py-1 rounded-xl font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                                {turnedInCount} Turned In · {gradedCount} Graded
                              </span>
                            ) : (
                              <span className={`text-[10px] font-mono uppercase px-2.5 py-1 rounded-xl font-bold ${
                                asgn.status === 'turned_in'
                                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                                  : asgn.status === 'graded'
                                  ? 'bg-sky-950/60 text-sky-400 border border-sky-500/30'
                                  : asgn.status === 'missing'
                                  ? 'bg-rose-950/60 text-rose-400 border border-rose-500/30'
                                  : isDark ? 'bg-[#20202c] text-neutral-300' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {asgn.status === 'turned_in' ? 'Turned In' : asgn.status === 'graded' ? `${asgn.earnedPoints}/${asgn.maxPoints} pts` : asgn.status}
                              </span>
                            )}
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
                          </div>
                        </div>

                        {/* Expanded Assignment Details */}
                        {isExpanded && (
                          <div className={`p-5 space-y-4 text-xs border-t ${
                            isDark ? 'bg-[#101016] border-neutral-800' : 'bg-slate-50 border-slate-200'
                          }`}>
                            <p className="text-neutral-300 leading-relaxed whitespace-pre-line">
                              {asgn.description}
                            </p>

                            {/* Materials */}
                            {asgn.attachments && asgn.attachments.length > 0 && (
                              <div className="space-y-2">
                                <div className="font-semibold text-neutral-400 text-[11px]">Class Resources:</div>
                                {asgn.attachments.map((att, idx) => (
                                  <div
                                    key={idx}
                                    className={`p-3 rounded-2xl flex items-center justify-between border ${
                                      isDark ? 'bg-[#181822] border-neutral-800' : 'bg-white border-slate-200 shadow-sm'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Paperclip className="w-3.5 h-3.5 text-pink-400" />
                                      <span className="font-medium text-neutral-200">{att.title}</span>
                                    </div>
                                    <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Teacher View: Submissions for this assignment */}
                            {canManage ? (
                              <div className="pt-2 space-y-3">
                                <div className="flex items-center justify-between font-semibold text-neutral-300 text-xs">
                                  <span>Student Submissions ({asgnSubmissions.length})</span>
                                  <button
                                    onClick={() => deleteAssignment(asgn.id)}
                                    className="text-rose-400 hover:text-rose-300 text-[11px] flex items-center gap-1 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete Assignment</span>
                                  </button>
                                </div>

                                {asgnSubmissions.length === 0 ? (
                                  <p className="text-neutral-500 italic text-[11px]">No student has turned in this assignment yet.</p>
                                ) : (
                                  <div className="space-y-2">
                                    {asgnSubmissions.map(sub => (
                                      <div
                                        key={sub.id}
                                        className={`p-3.5 rounded-2xl flex items-center justify-between border ${
                                          isDark ? 'bg-[#161622] border-neutral-800' : 'bg-white border-slate-200'
                                        }`}
                                      >
                                        <div>
                                          <div className="font-bold text-neutral-200">{sub.studentName}</div>
                                          <div className="text-[10px] text-neutral-400 font-mono">
                                            {sub.fileTitle || 'Submission note'} · {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                          </div>
                                          {sub.feedback && (
                                            <div className="text-[10px] text-sky-400 mt-1">Note: {sub.feedback}</div>
                                          )}
                                        </div>

                                        <div className="flex items-center gap-3">
                                          <div className="text-right">
                                            <span className="font-mono font-bold text-xs text-emerald-400">
                                              {sub.pointsEarned !== undefined ? `${sub.pointsEarned}/${sub.maxPoints} pts` : 'Ungraded'}
                                            </span>
                                          </div>
                                          <button
                                            onClick={() => openGradingModal(sub)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                              isDark ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                            }`}
                                          >
                                            {sub.status === 'graded' ? 'Edit Grade' : 'Grade'}
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ) : (
                              /* Student Submission Box */
                              <div className="pt-3 border-t border-neutral-800/60 space-y-3">
                                <div className="font-semibold text-neutral-300 text-xs">Your Work</div>

                                {asgn.status === 'graded' ? (
                                  <div className={`p-4 rounded-2xl border ${
                                    isDark ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                  }`}>
                                    <div className="flex items-center justify-between font-bold text-sm">
                                      <span>Graded</span>
                                      <span className="font-mono">{asgn.earnedPoints} / {asgn.maxPoints} pts</span>
                                    </div>
                                    {asgn.teacherFeedback && (
                                      <div className="mt-2 text-xs text-neutral-300">
                                        <span className="font-semibold text-emerald-400">Teacher Feedback: </span>
                                        "{asgn.teacherFeedback}"
                                      </div>
                                    )}
                                  </div>
                                ) : asgn.status === 'turned_in' ? (
                                  <div className="flex items-center justify-between">
                                    <div className="text-emerald-400 font-mono text-xs flex items-center gap-1.5">
                                      <CheckCircle2 className="w-4 h-4" />
                                      <span>Turned In on {new Date(asgn.submittedAt || '').toLocaleDateString()}</span>
                                    </div>
                                    <button
                                      onClick={() => unsubmitAssignment(asgn.id)}
                                      className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white bg-neutral-800 cursor-pointer"
                                    >
                                      Unsubmit
                                    </button>
                                  </div>
                                ) : (
                                  <div className="space-y-2.5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      <input
                                        type="text"
                                        placeholder="File title (e.g. lab2_consensus_solution.go)"
                                        value={submissionFiles[asgn.id] || ''}
                                        onChange={e => setSubmissionFiles({ ...submissionFiles, [asgn.id]: e.target.value })}
                                        className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${
                                          isDark ? 'bg-[#181822] text-white' : 'bg-white text-slate-900 border border-slate-200'
                                        }`}
                                      />
                                      <input
                                        type="text"
                                        placeholder="Submission comment / notes..."
                                        value={submissionNotes[asgn.id] || ''}
                                        onChange={e => setSubmissionNotes({ ...submissionNotes, [asgn.id]: e.target.value })}
                                        className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${
                                          isDark ? 'bg-[#181822] text-white' : 'bg-white text-slate-900 border border-slate-200'
                                        }`}
                                      />
                                    </div>
                                    <div className="flex justify-end">
                                      <button
                                        onClick={() => handleTurnInWithDetails(asgn.id)}
                                        className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                          isDark
                                            ? 'bg-[#ff2d75] hover:bg-[#ff1767] text-black shadow-[0_0_15px_rgba(255,45,117,0.4)]'
                                            : 'bg-[#0ea5e9] hover:bg-[#0284c7] text-white shadow-sm'
                                        }`}
                                      >
                                        Turn In Work
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. ATTENDANCE TAB */}
      {courseSubTab === 'attendance' && (
        <ClassAttendanceView course={course} />
      )}

      {/* 4. PEOPLE TAB */}
      {courseSubTab === 'people' && (
        <div className="space-y-7 max-w-4xl">
          {/* Teachers Section */}
          <div className="space-y-3">
            <h3 className={`text-lg font-bold font-display ${
              isDark ? 'text-pink-400' : 'text-sky-700'
            }`}>
              Teachers
            </h3>
            <div className="space-y-2">
              {classmates.filter(c => c.role === 'teacher').map(t => (
                <div
                  key={t.id}
                  onClick={() => viewPublicProfile({ id: t.id, name: t.name, email: t.email, role: 'teacher' })}
                  className={`p-4 rounded-2xl flex items-center justify-between text-xs border transition-all cursor-pointer group ${
                    isDark
                      ? 'bg-[#121217] border-neutral-800 hover:border-sky-500/50 hover:bg-[#161824]'
                      : 'bg-white border-slate-200 shadow-sm hover:border-sky-300 hover:bg-sky-50/50'
                  }`}
                  title="Click to view public profile and academic info"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                      isDark ? 'bg-sky-500/20 text-sky-400 group-hover:scale-105' : 'bg-sky-100 text-sky-700 group-hover:scale-105'
                    } transition-transform shrink-0`}>
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-200 group-hover:text-sky-300 transition-colors">{t.name}</span>
                        <span className="text-[10px] text-sky-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">View Profile &rarr;</span>
                      </div>
                      <span className="text-neutral-400 font-mono text-[11px] block">{t.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-400 font-bold border border-sky-500/30">
                      Faculty Instructor
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Students Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-lg font-bold font-display text-neutral-200">
                Classmates
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-neutral-400">
                  {classmates.filter(c => c.role === 'student').length} enrolled students
                </span>
                {canManage && (
                  <button
                    onClick={() => setIsAddingStudent(!isAddingStudent)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isDark ? 'bg-pink-500/20 text-pink-300 hover:bg-pink-500/30' : 'bg-sky-50 text-sky-800 hover:bg-sky-100'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Invite Student</span>
                  </button>
                )}
              </div>
            </div>

            {isAddingStudent && (
              <form onSubmit={handleAddStudent} className={`p-4 rounded-2xl border space-y-2 ${
                isDark ? 'bg-[#161622] border-neutral-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="font-bold text-xs text-neutral-200">Enroll Student to {course.name}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Student Full Name"
                    value={studentNameInput}
                    onChange={e => setStudentNameInput(e.target.value)}
                    className={`px-3 py-2 rounded-xl text-xs focus:outline-none ${
                      isDark ? 'bg-[#1f1f2e] text-white' : 'bg-white text-slate-900 border border-slate-200'
                    }`}
                  />
                  <input
                    type="email"
                    required
                    placeholder="student@university.edu"
                    value={studentEmailInput}
                    onChange={e => setStudentEmailInput(e.target.value)}
                    className={`px-3 py-2 rounded-xl text-xs focus:outline-none ${
                      isDark ? 'bg-[#1f1f2e] text-white' : 'bg-white text-slate-900 border border-slate-200'
                    }`}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingStudent(false)}
                    className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                      isDark ? 'bg-[#ff2d75] text-black' : 'bg-[#0ea5e9] text-white'
                    }`}
                  >
                    Confirm Enrollment
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {classmates.filter(c => c.role === 'student').map(s => (
                <div
                  key={s.id}
                  onClick={() => viewPublicProfile({ id: s.id, name: s.name, email: s.email, role: 'student' })}
                  className={`p-3.5 rounded-2xl flex items-center justify-between text-xs border transition-all cursor-pointer group ${
                    isDark
                      ? 'bg-[#121217] border-neutral-800 hover:border-pink-500/40 hover:bg-[#181522]'
                      : 'bg-white border-slate-200 shadow-sm hover:border-sky-300 hover:bg-slate-50'
                  }`}
                  title="Click to view public profile and academic info"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                      isDark ? 'bg-[#222230] text-neutral-300 group-hover:scale-105' : 'bg-slate-200 text-slate-700 group-hover:scale-105'
                    } transition-transform shrink-0`}>
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-neutral-200 block group-hover:text-pink-300 transition-colors">{s.name}</span>
                        <span className="text-[10px] text-pink-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">View Profile &rarr;</span>
                      </div>
                      <span className="text-[11px] text-neutral-500 font-mono">{s.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        viewPublicProfile({ id: s.id, name: s.name, email: s.email, role: 'student' });
                      }}
                      className="px-2.5 py-1 rounded-xl text-[11px] font-semibold text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer border border-transparent hover:border-neutral-700"
                    >
                      Public Info
                    </button>

                    {canManage && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeStudentFromCourse(course.id, s.id);
                        }}
                        className="p-1.5 text-neutral-500 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Remove from class"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. GRADES TAB */}
      {courseSubTab === 'grades' && (
        <div className="space-y-6">
          {canManage ? (
            /* Teacher Comprehensive Gradebook */
            <div className={`p-6 rounded-3xl border ${
              isDark ? 'bg-[#121217] border-neutral-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold font-display">Faculty Gradebook & Evaluation</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Review student work, award scores, and provide returned feedback
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-xs font-mono px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                    {courseSubmissions.filter(s => s.status === 'graded').length} Graded / {courseSubmissions.length} Submissions
                  </div>
                </div>
              </div>

              {courseSubmissions.length === 0 ? (
                <div className="text-center py-10 text-neutral-500 text-xs">
                  No submissions recorded for this course yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className={`text-[11px] uppercase tracking-wider border-b ${
                        isDark ? 'text-neutral-500 border-neutral-800' : 'text-slate-400 border-slate-200'
                      }`}>
                        <th className="pb-3 font-semibold">Student</th>
                        <th className="pb-3 font-semibold">Assignment</th>
                        <th className="pb-3 font-semibold">Submission File</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold">Score</th>
                        <th className="pb-3 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-neutral-900/80' : 'divide-slate-100'}`}>
                      {courseSubmissions.map(sub => {
                        const targetAsgn = assignments.find(a => a.id === sub.assignmentId);
                        return (
                          <tr key={sub.id} className={isDark ? 'hover:bg-[#181822]' : 'hover:bg-slate-50'}>
                            <td className="py-3.5">
                              <div className="font-bold text-neutral-200">{sub.studentName}</div>
                              <div className="text-[10px] text-neutral-500 font-mono">{sub.studentEmail}</div>
                            </td>
                            <td className="py-3.5 font-medium text-neutral-300">
                              {targetAsgn?.title || 'Assignment'}
                            </td>
                            <td className="py-3.5 font-mono text-[11px] text-pink-400">
                              {sub.fileTitle || 'Text Note'}
                            </td>
                            <td className="py-3.5">
                              <span className={`px-2.5 py-1 rounded-full font-mono uppercase text-[9px] font-bold ${
                                sub.status === 'graded'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              }`}>
                                {sub.status === 'graded' ? 'Graded' : 'Needs Review'}
                              </span>
                            </td>
                            <td className="py-3.5 font-mono font-bold text-neutral-200">
                              {sub.pointsEarned !== undefined ? `${sub.pointsEarned} / ${sub.maxPoints}` : `— / ${sub.maxPoints}`}
                            </td>
                            <td className="py-3.5 text-right">
                              <button
                                onClick={() => openGradingModal(sub)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                  sub.status === 'graded'
                                    ? isDark ? 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700' : 'bg-slate-200 text-slate-800'
                                    : isDark ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]' : 'bg-emerald-600 text-white'
                                }`}
                              >
                                {sub.status === 'graded' ? 'Edit Grade' : 'Grade Work'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            /* Student View: Personal Grade Table */
            <div className={`p-6 rounded-3xl border ${
              isDark ? 'bg-[#121217] border-neutral-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold font-display">Your Grade Report</h3>
                <div className="text-xs font-mono text-neutral-400">
                  Completed: {courseAssignments.filter(a => a.status === 'graded').length} / {courseAssignments.length}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className={`text-[11px] uppercase tracking-wider border-b ${
                      isDark ? 'text-neutral-500 border-neutral-800' : 'text-slate-400 border-slate-200'
                    }`}>
                      <th className="pb-3 font-semibold">Assignment</th>
                      <th className="pb-3 font-semibold">Due Date</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold">Score</th>
                      <th className="pb-3 font-semibold">Teacher Feedback</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-neutral-900/60' : 'divide-slate-100'}`}>
                    {courseAssignments.map(asgn => (
                      <tr key={asgn.id} className={isDark ? 'hover:bg-[#181822]' : 'hover:bg-slate-50'}>
                        <td className="py-3.5 font-bold text-neutral-200">{asgn.title}</td>
                        <td className="py-3.5 font-mono text-neutral-400">{asgn.dueDate}</td>
                        <td className="py-3.5">
                          <span className={`px-2.5 py-1 rounded-full font-mono uppercase text-[9px] font-bold ${
                            asgn.status === 'graded'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : asgn.status === 'turned_in'
                              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                              : asgn.status === 'missing'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : isDark ? 'bg-[#20202c] text-neutral-400' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {asgn.status}
                          </span>
                        </td>
                        <td className="py-3.5 font-mono font-bold text-neutral-200">
                          {asgn.earnedPoints !== undefined ? `${asgn.earnedPoints} / ${asgn.maxPoints}` : `— / ${asgn.maxPoints}`}
                        </td>
                        <td className="py-3.5 text-neutral-400 italic text-[11px]">
                          {asgn.teacherFeedback || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
