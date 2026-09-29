import React, { useState, useMemo } from 'react';
import { useClassTrack } from '../context/ClassTrackContext';
import { ClassCourse, AttendanceStatus } from '../types';

interface ClassAttendanceViewProps {
  course: ClassCourse;
}

export const ClassAttendanceView: React.FC<ClassAttendanceViewProps> = ({ course }) => {
  const {
    getClassmates,
    addStudentToCourse,
    attendanceRecords,
    markAttendance,
    markAllAttendance,
    studentSelfCheckIn,
    setDailyAttendanceCode,
    toggleAttendanceOpen,
    viewPublicProfile,
    currentUser,
    theme,
  } = useClassTrack();

  const isDark = theme === 'dark';
  const isCourseTeacher = currentUser && course.teacher.email.toLowerCase() === currentUser.email.toLowerCase();
  const isTeacher = currentUser?.role === 'teacher';
  const isAdmin = currentUser?.role === 'admin';
  const hasTeacherPrivileges = isTeacher || isAdmin || isCourseTeacher;

  // View mode toggle: allows switching between teacher management and student check-in
  const [viewMode, setViewMode] = useState<'teacher' | 'student'>(() => {
    return hasTeacherPrivileges ? 'teacher' : 'student';
  });

  // Today's date in YYYY-MM-DD
  const todayStr = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});

  // Student check-in form state
  const [checkInStatus, setCheckInStatus] = useState<AttendanceStatus>('present');
  const [checkInCode, setCheckInCode] = useState('');
  const [checkInNote, setCheckInNote] = useState('');
  const [checkInFile, setCheckInFile] = useState('');
  const [checkInMessage, setCheckInMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Teacher new student modal/input inline
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');

  // Enrolled students in this class
  const students = useMemo(() => {
    const classmates = getClassmates(course.id);
    return classmates.filter(c => c.role === 'student');
  }, [getClassmates, course.id]);

  // All attendance records for this course
  const courseAttendance = useMemo(() => {
    return attendanceRecords.filter(r => r.courseId === course.id);
  }, [attendanceRecords, course.id]);

  // Attendance records for the selected date
  const selectedDateRecords = useMemo(() => {
    return courseAttendance.filter(r => r.date === selectedDate);
  }, [courseAttendance, selectedDate]);

  // Current student record for today
  const myTodayRecord = useMemo(() => {
    if (!currentUser) return null;
    return courseAttendance.find(
      r => r.date === selectedDate && (
        r.studentId === currentUser.id ||
        (r.studentEmail && r.studentEmail.toLowerCase() === currentUser.email.toLowerCase())
      )
    );
  }, [courseAttendance, currentUser, selectedDate]);

  // Student-specific records (when student views full log)
  const currentStudentRecords = useMemo(() => {
    if (!currentUser) return [];
    return courseAttendance.filter(
      r => r.studentId === currentUser.id ||
      (r.studentEmail && r.studentEmail.toLowerCase() === currentUser.email.toLowerCase())
    );
  }, [courseAttendance, currentUser]);

  // Calculate overall attendance rate for a student across all recorded dates in this course
  const getStudentStats = (studentId: string, studentEmail?: string) => {
    const records = courseAttendance.filter(
      r => r.studentId === studentId || (studentEmail && r.studentEmail && r.studentEmail.toLowerCase() === studentEmail.toLowerCase())
    );
    const total = records.length;
    if (total === 0) return { total: 0, present: 0, late: 0, absent: 0, excused: 0, rate: 100 };

    const present = records.filter(r => r.status === 'present').length;
    const late = records.filter(r => r.status === 'late').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const excused = records.filter(r => r.status === 'excused').length;
    const attended = present + late;
    const countableTotal = total - excused > 0 ? total - excused : total;
    const rate = Math.round((attended / (countableTotal || 1)) * 100);

    return { total, present, late, absent, excused, rate };
  };

  // Stats for the selected date
  const dateSummary = useMemo(() => {
    let presentCount = 0;
    let lateCount = 0;
    let absentCount = 0;
    let excusedCount = 0;
    let recordedCount = 0;

    students.forEach(student => {
      const rec = selectedDateRecords.find(
        r => r.studentId === student.id || (r.studentEmail && r.studentEmail.toLowerCase() === student.email.toLowerCase())
      );
      if (rec) {
        recordedCount++;
        if (rec.status === 'present') presentCount++;
        else if (rec.status === 'late') lateCount++;
        else if (rec.status === 'absent') absentCount++;
        else if (rec.status === 'excused') excusedCount++;
      }
    });

    const unrecordedCount = Math.max(0, students.length - recordedCount);
    const rate = students.length > 0 ? Math.round(((presentCount + lateCount) / students.length) * 100) : 0;

    return {
      present: presentCount,
      late: lateCount,
      absent: absentCount,
      excused: excusedCount,
      unrecorded: unrecordedCount,
      totalStudents: students.length,
      rate,
    };
  }, [students, selectedDateRecords]);

  // Filtered student list for teachers
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = student.name.toLowerCase().includes(q);
        const matchEmail = student.email.toLowerCase().includes(q);
        if (!matchName && !matchEmail) return false;
      }

      if (filterStatus !== 'all') {
        const rec = selectedDateRecords.find(
          r => r.studentId === student.id || (r.studentEmail && r.studentEmail.toLowerCase() === student.email.toLowerCase())
        );
        const status = rec ? rec.status : 'unrecorded';
        if (status !== filterStatus) return false;
      }

      return true;
    });
  }, [students, searchQuery, filterStatus, selectedDateRecords]);

  // Teacher directly changes student status (fairness override)
  const handleTeacherStatusChange = (
    studentId: string,
    studentName: string,
    studentEmail: string,
    status: AttendanceStatus
  ) => {
    const currentNote = editingNotes[`${selectedDate}_${studentId}`];
    // Always marked as verifiedByTeacher = true and submittedBy = 'teacher'
    markAttendance(course.id, studentId, studentName, studentEmail, selectedDate, status, currentNote, true, 'teacher');
  };

  const handleNoteChange = (studentId: string, noteValue: string) => {
    setEditingNotes(prev => ({
      ...prev,
      [`${selectedDate}_${studentId}`]: noteValue,
    }));
  };

  const handleNoteBlur = (
    studentId: string,
    studentName: string,
    studentEmail: string,
    currentStatus?: AttendanceStatus
  ) => {
    const noteValue = editingNotes[`${selectedDate}_${studentId}`];
    if (currentStatus) {
      markAttendance(course.id, studentId, studentName, studentEmail, selectedDate, currentStatus, noteValue, true, 'teacher');
    }
  };

  // Student self-submission handler
  const handleStudentCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckInMessage(null);

    const res = studentSelfCheckIn(
      course.id,
      selectedDate,
      checkInStatus,
      checkInNote.trim() || undefined,
      checkInCode.trim() || undefined,
      checkInFile.trim() || undefined
    );

    setCheckInMessage({
      text: res.message,
      isError: !res.success,
    });

    if (res.success) {
      setCheckInCode('');
      setCheckInNote('');
      setCheckInFile('');
    }
  };

  // Quick generate a 4-digit attendance code for teacher
  const handleGenerateCode = () => {
    const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
    setDailyAttendanceCode(course.id, randomCode);
  };

  const handleClearCode = () => {
    setDailyAttendanceCode(course.id, null);
  };

  const handleToggleOpen = () => {
    const currentState = course.attendanceOpen !== false;
    toggleAttendanceOpen(course.id, !currentState);
  };

  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentEmail.trim()) return;
    addStudentToCourse(course.id, newStudentName.trim(), newStudentEmail.trim());
    setNewStudentName('');
    setNewStudentEmail('');
    setShowAddStudent(false);
  };

  const isCheckInOpen = course.attendanceOpen !== false;

  return (
    <div className="space-y-6">
      {/* Top Bar: View Mode Switcher & Role Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/40 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight">
            Attendance System
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            {viewMode === 'teacher'
              ? 'Instructor roll call and verification overrides'
              : 'Student attendance submission and attendance record'}
          </p>
        </div>

        {/* View Switcher: allows switching between Teacher and Student perspectives */}
        <div className={`flex items-center p-1 rounded-2xl border self-start sm:self-auto ${
          isDark ? 'bg-[#121217] border-neutral-800' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            type="button"
            onClick={() => setViewMode('student')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'student'
                ? isDark
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'bg-white text-slate-900 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Student Check-In
          </button>

          <button
            type="button"
            onClick={() => setViewMode('teacher')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'teacher'
                ? isDark
                  ? 'bg-emerald-500 text-black font-bold shadow-sm'
                  : 'bg-emerald-600 text-white font-bold shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Teacher Roll Call
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: STUDENT ATTENDANCE SUBMISSION & PERSONAL LOG                      */}
      {/* ========================================================================= */}
      {viewMode === 'student' && (
        <div className="space-y-6">
          {/* Active Check-In Card for Student */}
          <div className={`p-5 sm:p-6 rounded-3xl border transition-all ${
            isDark ? 'bg-[#121217] border-neutral-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800/40">
              <div>
                <span className="text-xs uppercase tracking-wider text-neutral-400 font-bold block">
                  Attendance Submission
                </span>
                <h3 className="text-lg sm:text-xl font-bold font-display mt-0.5">
                  Check In for Class
                </h3>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize border ${
                  !isCheckInOpen
                    ? isDark ? 'border-rose-500/40 text-rose-300 bg-rose-950/40' : 'border-rose-300 text-rose-800 bg-rose-50'
                    : isDark ? 'border-emerald-500/40 text-emerald-300 bg-emerald-950/40' : 'border-emerald-300 text-emerald-800 bg-emerald-50'
                }`}>
                  {isCheckInOpen ? 'Check-in Open' : 'Check-in Closed'}
                </span>
              </div>
            </div>

            {/* If Student Already Checked In Today */}
            {myTodayRecord ? (
              <div className="py-4 space-y-4">
                <div className={`p-4 rounded-2xl border ${
                  myTodayRecord.status === 'present'
                    ? isDark ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
                    : myTodayRecord.status === 'late'
                    ? isDark ? 'bg-amber-950/20 border-amber-500/30' : 'bg-amber-50 border-amber-200'
                    : isDark ? 'bg-rose-950/20 border-rose-500/30' : 'bg-rose-50 border-rose-200'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs text-neutral-400 block font-medium">Recorded Status</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-lg font-bold capitalize">
                          {myTodayRecord.status}
                        </span>
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                          myTodayRecord.verifiedByTeacher
                            ? isDark ? 'border-emerald-500/40 text-emerald-300 bg-emerald-950/40' : 'border-emerald-300 text-emerald-800 bg-emerald-50'
                            : isDark ? 'border-amber-500/40 text-amber-300 bg-amber-950/40' : 'border-amber-300 text-amber-800 bg-amber-50'
                        }`}>
                          {myTodayRecord.verifiedByTeacher ? 'Verified by Teacher' : 'Pending Teacher Confirmation'}
                        </span>
                      </div>
                    </div>

                    <div className="text-left sm:text-right text-xs text-neutral-400 font-mono">
                      <span>Date: {myTodayRecord.date}</span>
                      {myTodayRecord.timeCheckedIn && (
                        <span className="block text-[11px]">Logged at {myTodayRecord.timeCheckedIn}</span>
                      )}
                    </div>
                  </div>

                  {myTodayRecord.note && (
                    <div className="mt-3 pt-3 border-t border-neutral-800/30 text-xs text-neutral-300">
                      <span className="text-neutral-400 font-medium">Note: </span>
                      {myTodayRecord.note}
                    </div>
                  )}

                  {myTodayRecord.proofFileName && (
                    <div className="mt-1 text-xs text-neutral-400">
                      <span className="font-medium">Attached Proof: </span>
                      <span className="font-mono text-neutral-200">{myTodayRecord.proofFileName}</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-neutral-400">
                  Your instructor can update or verify your recorded attendance on their roll sheet to ensure class accuracy.
                </p>
              </div>
            ) : !isCheckInOpen ? (
              <div className="py-6 text-center text-xs text-neutral-400 space-y-1">
                <p className="font-bold text-sm text-neutral-300">Check-in is currently closed</p>
                <p>The instructor has not opened self check-in for this session. Contact your teacher to be marked present manually.</p>
              </div>
            ) : (
              /* Check-in Form for Student */
              <form onSubmit={handleStudentCheckIn} className="pt-4 space-y-4">
                {checkInMessage && (
                  <div className={`p-3 rounded-2xl text-xs font-medium border ${
                    checkInMessage.isError
                      ? isDark ? 'bg-rose-950/40 text-rose-300 border-rose-500/30' : 'bg-rose-50 text-rose-800 border-rose-200'
                      : isDark ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}>
                    {checkInMessage.text}
                  </div>
                )}

                {/* 1. Select Status to Submit */}
                <div>
                  <label className="text-xs text-neutral-400 font-medium block mb-2">
                    Select Your Attendance Status
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {(['present', 'late', 'excused'] as const).map(st => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setCheckInStatus(st)}
                        className={`flex-1 sm:flex-none px-4 py-2.5 rounded-2xl text-xs font-semibold capitalize transition-all cursor-pointer border ${
                          checkInStatus === st
                            ? isDark
                              ? 'bg-neutral-200 text-black border-white font-bold'
                              : 'bg-slate-900 text-white border-slate-900 font-bold'
                            : isDark
                            ? 'bg-[#181822] text-neutral-400 border-neutral-800 hover:text-white'
                            : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
                        }`}
                      >
                        {st === 'excused' ? 'Absent (Request Excuse)' : st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Optional Session Code (if teacher required one) */}
                {course.dailyAttendanceCode && (
                  <div>
                    <label className="text-xs text-neutral-400 font-medium block mb-1">
                      Classroom Session Code (Required)
                    </label>
                    <input
                      type="text"
                      placeholder="Enter 4-digit code shown on classroom board..."
                      value={checkInCode}
                      onChange={e => setCheckInCode(e.target.value)}
                      maxLength={8}
                      className={`w-full sm:w-64 px-3.5 py-2.5 rounded-xl text-xs uppercase tracking-wider font-mono border focus:outline-none transition-colors ${
                        isDark ? 'bg-[#181822] text-white border-neutral-800' : 'bg-white text-slate-900 border-slate-200'
                      }`}
                      required
                    />
                    <span className="text-[11px] text-neutral-500 mt-1 block">
                      The teacher sets a session code to verify physical attendance in the room.
                    </span>
                  </div>
                )}

                {/* 3. Reason or Note */}
                <div>
                  <label className="text-xs text-neutral-400 font-medium block mb-1">
                    Note or Reason (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Attending online stream, or doctor's appointment excuse..."
                    value={checkInNote}
                    onChange={e => setCheckInNote(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none transition-colors ${
                      isDark ? 'bg-[#181822] text-white border-neutral-800' : 'bg-white text-slate-900 border-slate-200'
                    }`}
                  />
                </div>

                {/* 4. Upload Attendance Proof (File Name simulation) */}
                <div>
                  <label className="text-xs text-neutral-400 font-medium block mb-1">
                    Upload Attendance Proof / Doctor Note (Optional)
                  </label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="text"
                      placeholder="Attachment file name (e.g. medical_slip.pdf, pass.jpg)..."
                      value={checkInFile}
                      onChange={e => setCheckInFile(e.target.value)}
                      className={`flex-1 px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none transition-colors ${
                        isDark ? 'bg-[#181822] text-white border-neutral-800' : 'bg-white text-slate-900 border-slate-200'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setCheckInFile(`attendance_proof_${Date.now().toString().slice(-4)}.pdf`)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                        isDark ? 'bg-[#181822] text-neutral-300 border-neutral-800 hover:text-white' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      Attach Sample File
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className={`w-full sm:w-auto px-6 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
                      isDark
                        ? 'bg-white text-black hover:bg-neutral-200 border-white'
                        : 'bg-slate-900 text-white hover:bg-slate-800 border-slate-900'
                    }`}
                  >
                    Submit Attendance Check-In
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Student Overview Numbers */}
          {(() => {
            const studentStats = currentUser
              ? getStudentStats(currentUser.id, currentUser.email)
              : { total: 0, present: 0, late: 0, absent: 0, excused: 0, rate: 100 };
            const sortedRecords = [...currentStudentRecords].sort((a, b) => b.date.localeCompare(a.date));

            return (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#121217] border-neutral-800' : 'bg-white border-slate-200'}`}>
                    <span className="text-xs text-neutral-400 block font-medium">Attendance Rate</span>
                    <span className="text-2xl sm:text-3xl font-bold font-display mt-1 block">
                      {studentStats.rate}%
                    </span>
                  </div>

                  <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#121217] border-neutral-800' : 'bg-white border-slate-200'}`}>
                    <span className="text-xs text-neutral-400 block font-medium">Present</span>
                    <span className="text-2xl sm:text-3xl font-bold font-display mt-1 block text-emerald-400">
                      {studentStats.present}
                    </span>
                  </div>

                  <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#121217] border-neutral-800' : 'bg-white border-slate-200'}`}>
                    <span className="text-xs text-neutral-400 block font-medium">Late</span>
                    <span className="text-2xl sm:text-3xl font-bold font-display mt-1 block text-amber-400">
                      {studentStats.late}
                    </span>
                  </div>

                  <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#121217] border-neutral-800' : 'bg-white border-slate-200'}`}>
                    <span className="text-xs text-neutral-400 block font-medium">Absent</span>
                    <span className="text-2xl sm:text-3xl font-bold font-display mt-1 block text-rose-400">
                      {studentStats.absent}
                    </span>
                  </div>

                  <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#121217] border-neutral-800' : 'bg-white border-slate-200'} col-span-2 sm:col-span-1`}>
                    <span className="text-xs text-neutral-400 block font-medium">Total Sessions</span>
                    <span className="text-2xl sm:text-3xl font-bold font-display mt-1 block">
                      {studentStats.total}
                    </span>
                  </div>
                </div>

                {/* Attendance Log Table */}
                <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-[#121217] border-neutral-800' : 'bg-white border-slate-200'}`}>
                  <div className="p-4 border-b border-neutral-800/40 font-semibold text-xs text-neutral-400 uppercase tracking-wider">
                    Attendance Log
                  </div>

                  {sortedRecords.length === 0 ? (
                    <div className="p-8 text-center text-xs text-neutral-400">
                      No attendance records logged for your account in this class yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-neutral-800/40">
                      {sortedRecords.map(record => (
                        <div key={record.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">{record.date}</span>
                              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                                record.verifiedByTeacher
                                  ? isDark ? 'border-emerald-500/40 text-emerald-300 bg-emerald-950/40' : 'border-emerald-300 text-emerald-800 bg-emerald-50'
                                  : isDark ? 'border-amber-500/40 text-amber-300 bg-amber-950/40' : 'border-amber-300 text-amber-800 bg-amber-50'
                              }`}>
                                {record.verifiedByTeacher ? 'Verified by Teacher' : 'Self Checked-In'}
                              </span>
                            </div>
                            {record.note && (
                              <div className="text-neutral-400 text-xs mt-0.5">{record.note}</div>
                            )}
                            {record.proofFileName && (
                              <div className="text-neutral-500 text-[11px] mt-0.5 font-mono">Proof: {record.proofFileName}</div>
                            )}
                          </div>

                          <span
                            className={`inline-block px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize self-start sm:self-auto border ${
                              record.status === 'present'
                                ? isDark ? 'border-emerald-500/40 text-emerald-300 bg-emerald-950/40' : 'border-emerald-300 text-emerald-800 bg-emerald-50'
                                : record.status === 'late'
                                ? isDark ? 'border-amber-500/40 text-amber-300 bg-amber-950/40' : 'border-amber-300 text-amber-800 bg-amber-50'
                                : record.status === 'absent'
                                ? isDark ? 'border-rose-500/40 text-rose-300 bg-rose-950/40' : 'border-rose-300 text-rose-800 bg-rose-50'
                                : isDark ? 'border-neutral-700 text-neutral-300 bg-neutral-900' : 'border-slate-300 text-slate-800 bg-slate-100'
                            }`}
                          >
                            {record.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: TEACHER ROLL CALL & FAIRNESS OVERRIDES                            */}
      {/* ========================================================================= */}
      {viewMode === 'teacher' && (
        <div className="space-y-6">
          {/* Fairness Controls & Code Projector Bar */}
          <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
            isDark ? 'bg-[#121217] border-neutral-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-neutral-200 block">
                Classroom Verification & Fairness Controls
              </span>
              <p className="text-[11px] text-neutral-400">
                Teachers can override any student's self check-in to prevent cheating.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Check-In Toggle */}
              <button
                type="button"
                onClick={handleToggleOpen}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  isCheckInOpen
                    ? isDark ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/50' : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                    : isDark ? 'bg-rose-950/40 text-rose-300 border-rose-500/40 hover:bg-rose-900/50' : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
                }`}
              >
                {isCheckInOpen ? 'Check-in: Open' : 'Check-in: Locked'}
              </button>

              {/* Classroom Code Projector */}
              {course.dailyAttendanceCode ? (
                <div className="flex items-center gap-1.5">
                  <div className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold border ${
                    isDark ? 'bg-black text-pink-300 border-pink-500/40' : 'bg-white text-sky-800 border-sky-300'
                  }`}>
                    Code: {course.dailyAttendanceCode}
                  </div>
                  <button
                    type="button"
                    onClick={handleClearCode}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                      isDark ? 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:text-white' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    Clear Code
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleGenerateCode}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                    isDark ? 'bg-[#181822] text-neutral-300 border-neutral-800 hover:text-white' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Generate 4-Digit Code
                </button>
              )}

              {/* Add Student Shortcut */}
              <button
                type="button"
                onClick={() => setShowAddStudent(!showAddStudent)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  isDark ? 'bg-[#181822] text-neutral-300 border-neutral-800 hover:text-white' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {showAddStudent ? 'Cancel' : 'Add Student'}
              </button>
            </div>
          </div>

          {/* Quick Add Student Inline Form */}
          {showAddStudent && (
            <form onSubmit={handleAddStudentSubmit} className={`p-4 rounded-2xl border space-y-3 ${
              isDark ? 'bg-[#14141e] border-neutral-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <span className="text-xs font-bold text-neutral-200 block">
                Add Student to Class Roll
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  placeholder="Student Full Name..."
                  value={newStudentName}
                  onChange={e => setNewStudentName(e.target.value)}
                  className={`px-3 py-2 rounded-xl text-xs border focus:outline-none ${
                    isDark ? 'bg-[#181822] text-white border-neutral-800' : 'bg-slate-50 text-slate-900 border-slate-200'
                  }`}
                  required
                />
                <input
                  type="email"
                  placeholder="Student Email Address..."
                  value={newStudentEmail}
                  onChange={e => setNewStudentEmail(e.target.value)}
                  className={`px-3 py-2 rounded-xl text-xs border focus:outline-none ${
                    isDark ? 'bg-[#181822] text-white border-neutral-800' : 'bg-slate-50 text-slate-900 border-slate-200'
                  }`}
                  required
                />
              </div>
              <button
                type="submit"
                className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer border ${
                  isDark ? 'bg-white text-black border-white' : 'bg-slate-900 text-white border-slate-900'
                }`}
              >
                Save Student to Class
              </button>
            </form>
          )}

          {/* Date Picker & Mark All Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium border focus:outline-none transition-colors ${
                  isDark ? 'bg-[#181822] text-white border-neutral-800' : 'bg-white text-slate-900 border-slate-200'
                }`}
              />
              {selectedDate !== todayStr && (
                <button
                  type="button"
                  onClick={() => setSelectedDate(todayStr)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                    isDark ? 'bg-[#181822] text-neutral-300 border-neutral-800 hover:text-white' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  Today
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => markAllAttendance(course.id, selectedDate, 'present')}
              disabled={students.length === 0}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
                isDark
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/50'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              Mark all present
            </button>
          </div>

          {/* Minimal Stats Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
            <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-[#121217] border-neutral-800' : 'bg-white border-slate-200'}`}>
              <span className="text-[11px] text-neutral-400 block font-medium">Present</span>
              <span className="text-xl sm:text-2xl font-bold font-display mt-0.5 block text-emerald-400">
                {dateSummary.present}
              </span>
            </div>

            <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-[#121217] border-neutral-800' : 'bg-white border-slate-200'}`}>
              <span className="text-[11px] text-neutral-400 block font-medium">Late</span>
              <span className="text-xl sm:text-2xl font-bold font-display mt-0.5 block text-amber-400">
                {dateSummary.late}
              </span>
            </div>

            <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-[#121217] border-neutral-800' : 'bg-white border-slate-200'}`}>
              <span className="text-[11px] text-neutral-400 block font-medium">Absent</span>
              <span className="text-xl sm:text-2xl font-bold font-display mt-0.5 block text-rose-400">
                {dateSummary.absent}
              </span>
            </div>

            <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-[#121217] border-neutral-800' : 'bg-white border-slate-200'}`}>
              <span className="text-[11px] text-neutral-400 block font-medium">Excused</span>
              <span className="text-xl sm:text-2xl font-bold font-display mt-0.5 block text-neutral-300">
                {dateSummary.excused}
              </span>
            </div>

            <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-[#121217] border-neutral-800' : 'bg-white border-slate-200'}`}>
              <span className="text-[11px] text-neutral-400 block font-medium">Unrecorded</span>
              <span className="text-xl sm:text-2xl font-bold font-display mt-0.5 block text-neutral-500">
                {dateSummary.unrecorded}
              </span>
            </div>

            <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-[#121217] border-neutral-800' : 'bg-white border-slate-200'}`}>
              <span className="text-[11px] text-neutral-400 block font-medium">Daily Rate</span>
              <span className="text-xl sm:text-2xl font-bold font-display mt-0.5 block">
                {dateSummary.rate}%
              </span>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className={`flex flex-wrap items-center p-1 rounded-2xl border ${
              isDark ? 'bg-[#121217] border-neutral-800' : 'bg-slate-100 border-slate-200'
            }`}>
              {(['all', 'present', 'late', 'absent', 'excused', 'unrecorded'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilterStatus(tab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-colors cursor-pointer ${
                    filterStatus === tab
                      ? isDark
                        ? 'bg-[#1f1f2e] text-white font-semibold'
                        : 'bg-white text-slate-900 shadow-sm font-semibold'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder="Search student name or email..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className={`w-full px-3.5 py-1.5 rounded-xl text-xs border focus:outline-none transition-colors ${
                  isDark ? 'bg-[#121217] border-neutral-800 text-white placeholder-neutral-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>
          </div>

          {/* Student Roll Call List: Teacher Override Authority */}
          <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-[#121217] border-neutral-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            {students.length === 0 ? (
              <div className="p-10 text-center text-xs text-neutral-400 space-y-3">
                <p className="font-bold text-sm text-neutral-200">No students enrolled yet</p>
                <p className="max-w-md mx-auto">
                  Click "Add Student" above to add students to this course, or share the class code <span className="font-mono font-bold text-pink-400">{course.code}</span> so students can join.
                </p>
                <button
                  type="button"
                  onClick={() => setShowAddStudent(true)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    isDark ? 'bg-white text-black border-white' : 'bg-slate-900 text-white border-slate-900'
                  }`}
                >
                  Add First Student
                </button>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-400">
                No students match the current filter or search query.
              </div>
            ) : (
              <div className="divide-y divide-neutral-800/40">
                {filteredStudents.map(student => {
                  const rec = selectedDateRecords.find(
                    r => r.studentId === student.id || (r.studentEmail && r.studentEmail.toLowerCase() === student.email.toLowerCase())
                  );
                  const currentStatus = rec?.status;
                  const stats = getStudentStats(student.id, student.email);
                  const noteKey = `${selectedDate}_${student.id}`;
                  const noteValue = editingNotes[noteKey] !== undefined ? editingNotes[noteKey] : rec?.note || '';

                  return (
                    <div
                      key={student.id}
                      className={`p-4 transition-colors ${isDark ? 'hover:bg-[#161620]' : 'hover:bg-slate-50/60'}`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                        {/* Student Details & Origin Badge */}
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              onClick={() => viewPublicProfile({ id: student.id, name: student.name, email: student.email, role: 'student' })}
                              className="font-semibold text-xs sm:text-sm text-neutral-100 hover:text-pink-400 transition-colors cursor-pointer"
                              title="Click to view public profile"
                            >
                              {student.name}
                            </span>
                            <span className="text-[11px] text-neutral-500 font-mono">
                              {stats.total > 0 ? `${stats.rate}% overall` : 'New'}
                            </span>
                            {rec && (
                              <span className={`px-2 py-0.2 rounded-lg text-[10px] font-bold border ${
                                rec.submittedBy === 'student' && !rec.verifiedByTeacher
                                  ? isDark ? 'border-amber-500/40 text-amber-300 bg-amber-950/40' : 'border-amber-300 text-amber-800 bg-amber-50'
                                  : isDark ? 'border-emerald-500/40 text-emerald-300 bg-emerald-950/40' : 'border-emerald-300 text-emerald-800 bg-emerald-50'
                              }`}>
                                {rec.submittedBy === 'student' && !rec.verifiedByTeacher
                                  ? 'Student Checked In'
                                  : 'Teacher Verified'}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                            {student.email}
                            {rec?.timeCheckedIn && ` · Checked in ${rec.timeCheckedIn}`}
                            {rec?.proofFileName && ` · File: ${rec.proofFileName}`}
                          </div>
                        </div>

                        {/* Teacher Override Status Buttons: Zero Symbols, Pure Text */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {(['present', 'late', 'absent', 'excused'] as const).map(statusOpt => {
                            const isSelected = currentStatus === statusOpt;
                            return (
                              <button
                                key={statusOpt}
                                type="button"
                                onClick={() => handleTeacherStatusChange(student.id, student.name, student.email, statusOpt)}
                                className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer border ${
                                  isSelected
                                    ? statusOpt === 'present'
                                      ? isDark
                                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50 shadow-sm'
                                        : 'bg-emerald-50 text-emerald-800 border-emerald-400 shadow-sm'
                                      : statusOpt === 'late'
                                      ? isDark
                                        ? 'bg-amber-950/60 text-amber-300 border-amber-500/50 shadow-sm'
                                        : 'bg-amber-50 text-amber-800 border-amber-400 shadow-sm'
                                      : statusOpt === 'absent'
                                      ? isDark
                                        ? 'bg-rose-950/60 text-rose-300 border-rose-500/50 shadow-sm'
                                        : 'bg-rose-50 text-rose-800 border-rose-400 shadow-sm'
                                      : isDark
                                      ? 'bg-neutral-800 text-neutral-200 border-neutral-600 shadow-sm'
                                      : 'bg-slate-200 text-slate-900 border-slate-400 shadow-sm'
                                    : isDark
                                    ? 'bg-[#181822] text-neutral-400 border-neutral-800 hover:text-neutral-200 hover:border-neutral-700'
                                    : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:border-slate-300'
                                }`}
                              >
                                {statusOpt}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Optional Note Row for Teacher Overrides */}
                      <div className="mt-2.5 pt-2 border-t border-neutral-800/30">
                        <input
                          type="text"
                          placeholder="Teacher note (e.g. Overridden: student was absent from lecture)..."
                          value={noteValue}
                          onChange={e => handleNoteChange(student.id, e.target.value)}
                          onBlur={() => handleNoteBlur(student.id, student.name, student.email, currentStatus)}
                          className={`w-full px-3 py-1.5 rounded-xl text-[11px] border focus:outline-none transition-colors ${
                            isDark
                              ? 'bg-[#14141d] border-neutral-800/80 text-neutral-300 placeholder-neutral-600'
                              : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
