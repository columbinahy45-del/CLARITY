import React, { useState } from 'react';
import { useClassTrack } from '../context/ClassTrackContext';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Calendar as CalendarIcon,
  List,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CalendarView: React.FC = () => {
  const { userAssignments, userCourses, selectCourse, submitAssignment, theme } = useClassTrack();
  const isDark = theme === 'dark';

  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const prevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayIndex }, (_, i) => i);

  // Selected day's tasks from user's active courses
  const selectedDayAssignments = userAssignments.filter(a => a.dueDate === selectedDateStr);

  // All upcoming assignments sorted by date for Agenda view
  const allUpcomingSorted = [...userAssignments].sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const handleTurnIn = (id: string) => {
    submitAssignment(id, 'submission_document.pdf');
    confetti({
      particleCount: 40,
      spread: 50,
      colors: isDark ? ['#ff2d75', '#ffffff'] : ['#0ea5e9', '#ffffff'],
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight">
            Academic Schedule
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Deadlines, assignment schedules, and submission tracking.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* View Mode Toggle: Grid vs Agenda */}
          <div className={`flex items-center p-1 rounded-2xl ${isDark ? 'bg-[#14141c]' : 'bg-slate-100'}`}>
            <button
              onClick={() => setViewMode('month')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                viewMode === 'month'
                  ? isDark
                    ? 'bg-[#ff2d75] text-black font-bold shadow-[0_0_12px_rgba(255,45,117,0.4)]'
                    : 'bg-white text-slate-900 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                viewMode === 'agenda'
                  ? isDark
                    ? 'bg-[#ff2d75] text-black font-bold shadow-[0_0_12px_rgba(255,45,117,0.4)]'
                    : 'bg-white text-slate-900 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Agenda</span>
            </button>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className={`p-2 rounded-2xl transition-colors cursor-pointer ${
                isDark ? 'bg-[#181822] text-neutral-300 hover:text-white' : 'bg-slate-100 text-slate-700'
              }`}
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-xs sm:text-sm font-display min-w-[110px] text-center">
              {monthNames[month].slice(0, 3)} {year}
            </span>
            <button
              onClick={nextMonth}
              className={`p-2 rounded-2xl transition-colors cursor-pointer ${
                isDark ? 'bg-[#181822] text-neutral-300 hover:text-white' : 'bg-slate-100 text-slate-700'
              }`}
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'month' ? (
        <div className="space-y-5">
          {/* Calendar Grid Container */}
          <div className={`rounded-3xl overflow-hidden transition-all ${
            isDark ? 'bg-[#111116]' : 'bg-white shadow-sm'
          }`}>
            {/* Days of Week Header */}
            <div className={`grid grid-cols-7 text-center py-2.5 text-[11px] sm:text-xs font-bold ${
              isDark ? 'bg-[#161620] text-neutral-400' : 'bg-slate-50 text-slate-500'
            }`}>
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* Days Matrix */}
            <div className={`grid grid-cols-7 auto-rows-fr gap-px ${
              isDark ? 'bg-neutral-900/30' : 'bg-slate-100'
            }`}>
              {blanks.map(b => (
                <div key={`blank-${b}`} className={`min-h-[65px] sm:min-h-[105px] p-1.5 sm:p-2 ${
                  isDark ? 'bg-[#0d0d12]/50' : 'bg-slate-50/50'
                }`} />
              ))}

              {daysArray.map(day => {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dueToday = userAssignments.filter(a => a.dueDate === dateStr);
                const isToday = new Date().toISOString().split('T')[0] === dateStr;
                const isSelected = selectedDateStr === dateStr;

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDateStr(dateStr)}
                    className={`min-h-[65px] sm:min-h-[105px] p-1.5 sm:p-2 flex flex-col justify-between transition-all cursor-pointer ${
                      isSelected
                        ? isDark
                          ? 'bg-[#221226] ring-1 ring-pink-500/50'
                          : 'bg-sky-50 ring-1 ring-sky-400'
                        : isToday
                        ? isDark ? 'bg-[#1a121e]' : 'bg-sky-50/60'
                        : isDark ? 'bg-[#111116] hover:bg-[#16161f]' : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    {/* Day Number Header */}
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] sm:text-xs font-mono font-bold w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full ${
                        isToday
                          ? isDark
                            ? 'bg-[#ff2d75] text-black shadow-[0_0_10px_rgba(255,45,117,0.5)]'
                            : 'bg-[#0ea5e9] text-white'
                          : isSelected
                          ? isDark ? 'text-pink-400 font-extrabold' : 'text-sky-600 font-extrabold'
                          : 'text-neutral-400'
                      }`}>
                        {day}
                      </span>

                      {/* Mobile Event Dot Indicator (solves "P..." squished text on phones) */}
                      {dueToday.length > 0 && (
                        <div className="flex sm:hidden items-center gap-0.5">
                          {dueToday.slice(0, 3).map((_, i) => (
                            <div
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full ${
                                isDark ? 'bg-pink-400' : 'bg-sky-500'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Desktop Full Title Pill (Hidden on tiny mobile screens, shown on md screens) */}
                    <div className="hidden sm:block space-y-1 mt-1 overflow-hidden">
                      {dueToday.map(asgn => {
                        const course = userCourses.find(c => c.id === asgn.courseId);
                        return (
                          <div
                            key={asgn.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (course) selectCourse(course.id, 'classwork');
                            }}
                            className={`px-2 py-1 rounded-lg text-[10px] font-medium truncate cursor-pointer transition-all ${
                              asgn.status === 'turned_in' || asgn.status === 'graded'
                                ? 'bg-emerald-950/60 text-emerald-300'
                                : asgn.status === 'missing'
                                ? 'bg-rose-950/60 text-rose-300'
                                : isDark
                                ? 'bg-pink-950/80 text-pink-300 hover:bg-pink-900'
                                : 'bg-sky-100 text-sky-800 hover:bg-sky-200'
                            }`}
                            title={`${asgn.title} (${course?.name})`}
                          >
                            {asgn.title}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Date Details / Day Schedule (Always visible & super clean on mobile) */}
          <div className={`p-5 rounded-3xl transition-all ${
            isDark ? 'bg-[#121217]' : 'bg-white shadow-sm'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-900/60">
              <div className="flex items-center gap-2">
                <Clock className={`w-4 h-4 ${isDark ? 'text-pink-400' : 'text-sky-600'}`} />
                <h3 className="font-bold text-sm sm:text-base font-display">
                  Tasks Due on {selectedDateStr}
                </h3>
              </div>
              <span className="text-xs font-mono text-neutral-400">
                {selectedDayAssignments.length} {selectedDayAssignments.length === 1 ? 'task' : 'tasks'}
              </span>
            </div>

            <div className="pt-3 space-y-3">
              {selectedDayAssignments.length === 0 ? (
                <div className="py-6 text-center text-xs text-neutral-400">
                  <p>No deliverables due on this date. Select another day on the calendar above.</p>
                </div>
              ) : (
                selectedDayAssignments.map(asgn => {
                  const course = userCourses.find(c => c.id === asgn.courseId);

                  return (
                    <div
                      key={asgn.id}
                      className={`p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                        isDark ? 'bg-[#181822] hover:bg-[#1e1e2c]' : 'bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                          asgn.status === 'missing'
                            ? isDark ? 'bg-rose-950/60 text-rose-400' : 'bg-rose-100 text-rose-700'
                            : asgn.status === 'turned_in' || asgn.status === 'graded'
                            ? isDark ? 'bg-emerald-950/60 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                            : isDark ? 'bg-pink-950/60 text-pink-400' : 'bg-sky-100 text-sky-700'
                        }`}>
                          <FileText className="w-4 h-4" />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono text-neutral-400">{course?.name}</span>
                            <span className="text-[11px] text-neutral-500">·</span>
                            <span className="text-[11px] font-mono text-neutral-400">{asgn.maxPoints} pts</span>
                          </div>

                          <h4
                            onClick={() => course && selectCourse(course.id, 'classwork')}
                            className="text-xs sm:text-sm font-bold text-neutral-100 hover:text-pink-300 cursor-pointer mt-0.5 leading-snug"
                          >
                            {asgn.title}
                          </h4>

                          <p className="text-[11px] text-neutral-400 font-mono mt-1">
                            Due at {asgn.dueTime || '23:59'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {asgn.status === 'assigned' && (
                          <button
                            onClick={() => handleTurnIn(asgn.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isDark
                                ? 'bg-[#ff2d75] hover:bg-[#ff1767] text-black shadow-[0_0_12px_rgba(255,45,117,0.4)]'
                                : 'bg-[#0ea5e9] hover:bg-[#0284c7] text-white shadow-sm'
                            }`}
                          >
                            Turn In
                          </button>
                        )}
                        {asgn.status === 'turned_in' && (
                          <span className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-emerald-950/60 text-emerald-400">
                            Turned In
                          </span>
                        )}
                        {asgn.status === 'graded' && (
                          <span className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-sky-950/60 text-sky-400">
                            Graded ({asgn.earnedPoints}/{asgn.maxPoints})
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Agenda View: Full readable list sorted by date */
        <div className="space-y-4">
          {allUpcomingSorted.map(asgn => {
            const course = userCourses.find(c => c.id === asgn.courseId);

            return (
              <div
                key={asgn.id}
                className={`p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                  isDark ? 'bg-[#121217]' : 'bg-white shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                    asgn.status === 'missing'
                      ? isDark ? 'bg-rose-950/60 text-rose-400' : 'bg-rose-100 text-rose-700'
                      : asgn.status === 'turned_in' || asgn.status === 'graded'
                      ? isDark ? 'bg-emerald-950/60 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                      : isDark ? 'bg-pink-950/60 text-pink-400' : 'bg-sky-100 text-sky-700'
                  }`}>
                    <FileText className="w-4 h-4" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-neutral-400">{course?.name}</span>
                      <span className="text-[11px] text-neutral-500">·</span>
                      <span className="text-[11px] font-mono text-neutral-400">{asgn.maxPoints} pts</span>
                    </div>

                    <h3
                      onClick={() => course && selectCourse(course.id, 'classwork')}
                      className="text-xs sm:text-sm font-bold font-display text-neutral-100 hover:text-pink-300 cursor-pointer mt-0.5"
                    >
                      {asgn.title}
                    </h3>

                    <div className="flex items-center gap-1 text-xs text-neutral-400 mt-1 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Due {asgn.dueDate} at {asgn.dueTime || '23:59'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {asgn.status === 'assigned' && (
                    <button
                      onClick={() => handleTurnIn(asgn.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isDark
                          ? 'bg-[#ff2d75] hover:bg-[#ff1767] text-black shadow-[0_0_12px_rgba(255,45,117,0.4)]'
                          : 'bg-[#0ea5e9] hover:bg-[#0284c7] text-white shadow-sm'
                      }`}
                    >
                      Turn In
                    </button>
                  )}
                  {asgn.status === 'turned_in' && (
                    <span className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-emerald-950/60 text-emerald-400">
                      Turned In
                    </span>
                  )}
                  {asgn.status === 'graded' && (
                    <span className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-sky-950/60 text-sky-400">
                      Graded ({asgn.earnedPoints}/{asgn.maxPoints})
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
