import React, { useState, useEffect } from 'react';
import { useClassTrack } from '../context/ClassTrackContext';
import { X, Plus, BookOpen, School, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const JoinCreateClassModal: React.FC = () => {
  const {
    isJoinCreateModalOpen,
    closeJoinCreateModal,
    joinCreateModalMode,
    joinCourseWithCode,
    createCourse,
    currentUser,
    theme,
  } = useClassTrack();

  const isDark = theme === 'dark';
  const canCreate = currentUser?.role === 'teacher' || currentUser?.role === 'admin';

  // For students, strictly enforce 'join' mode
  const [mode, setMode] = useState<'join' | 'create'>(canCreate ? joinCreateModalMode : 'join');
  const [classCode, setClassCode] = useState('');
  const [feedback, setFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  const [name, setName] = useState('');
  const [section, setSection] = useState('');
  const [subject, setSubject] = useState('');
  const [room, setRoom] = useState('');

  useEffect(() => {
    if (!canCreate) {
      setMode('join');
    } else {
      setMode(joinCreateModalMode);
    }
    setFeedback(null);
  }, [joinCreateModalMode, isJoinCreateModalOpen, canCreate]);

  if (!isJoinCreateModalOpen) return null;

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classCode.trim()) return;

    const res = joinCourseWithCode(classCode.trim());
    if (res.success) {
      setFeedback({ text: res.message, isError: false });
      confetti({
        particleCount: 40,
        spread: 50,
        colors: isDark ? ['#ff2d75', '#ffffff'] : ['#0ea5e9', '#ffffff'],
      });
      setTimeout(() => {
        closeJoinCreateModal();
      }, 900);
    } else {
      setFeedback({ text: res.message, isError: true });
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (!canCreate) {
      setFeedback({ text: 'Only verified faculty or administrators can create new classes.', isError: true });
      return;
    }
    createCourse({ name, section, subject, room });
    confetti({
      particleCount: 50,
      spread: 60,
      colors: isDark ? ['#ff2d75', '#ffffff'] : ['#0ea5e9', '#ffffff'],
    });
    closeJoinCreateModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div
        className={`w-full max-w-md p-6 sm:p-7 rounded-3xl transition-all relative border my-auto ${
          isDark
            ? 'bg-[#121218] text-white border-neutral-800 shadow-[0_0_50px_rgba(255,45,117,0.15)]'
            : 'bg-white text-slate-900 border-slate-200 shadow-2xl'
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800/50 mb-4">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${isDark ? 'bg-pink-500/20 text-pink-400' : 'bg-sky-100 text-sky-700'}`}>
              <BookOpen className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold font-display">
              {mode === 'join' ? 'Join Classroom with Code' : 'Create New Classroom'}
            </h2>
          </div>
          <button
            onClick={closeJoinCreateModal}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher: visible to Faculty & Admins */}
        {canCreate && (
          <div
            className={`grid grid-cols-2 p-1 rounded-2xl mb-4 text-xs font-semibold ${
              isDark ? 'bg-[#181822]' : 'bg-slate-100'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                setMode('join');
                setFeedback(null);
              }}
              className={`py-2 rounded-xl transition-all cursor-pointer ${
                mode === 'join'
                  ? isDark
                    ? 'bg-[#ff2d75] text-black font-bold shadow-[0_0_12px_rgba(255,45,117,0.4)]'
                    : 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Join Class
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('create');
                setFeedback(null);
              }}
              className={`py-2 rounded-xl transition-all cursor-pointer ${
                mode === 'create'
                  ? isDark
                    ? 'bg-[#ff2d75] text-black font-bold shadow-[0_0_12px_rgba(255,45,117,0.4)]'
                    : 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Create Class
            </button>
          </div>
        )}

        {feedback && (
          <div
            className={`mb-4 p-3 rounded-2xl text-xs border ${
              feedback.isError
                ? 'bg-rose-950/60 text-rose-300 border-rose-800/40'
                : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40'
            }`}
          >
            {feedback.text}
          </div>
        )}

        {mode === 'join' ? (
          <form onSubmit={handleJoin} className="space-y-4 text-xs">
            <div>
              <label className="block text-neutral-400 mb-1.5 font-medium">
                Enter 7-Character Class Code
              </label>
              <input
                type="text"
                required
                placeholder="e.g. d7x9k2p or m4p8q1w"
                value={classCode}
                onChange={e => setClassCode(e.target.value)}
                className={`w-full px-4 py-3 rounded-2xl text-sm font-mono tracking-wider focus:outline-none uppercase ${
                  isDark ? 'bg-[#181824] text-pink-400' : 'bg-slate-100 text-sky-700'
                }`}
              />
              <p className="text-[11px] text-neutral-400 mt-1.5 leading-relaxed">
                Ask your teacher or course instructor for the enrollment code to join this class.
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeJoinCreateModal}
                className="px-4 py-2 text-xs text-neutral-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-6 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
                  isDark
                    ? 'bg-[#ff2d75] hover:bg-[#ff1767] text-black shadow-[0_0_20px_rgba(255,45,117,0.4)]'
                    : 'bg-[#0ea5e9] hover:bg-[#0284c7] text-white shadow-md'
                }`}
              >
                Join Class
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-neutral-400 mb-1 font-medium">Class Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. CS 550: Cloud Computing Architectures"
                value={name}
                onChange={e => setName(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-2xl focus:outline-none ${
                  isDark ? 'bg-[#181824] text-white' : 'bg-slate-100 text-slate-900'
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Section</label>
                <input
                  type="text"
                  placeholder="e.g. Section 01 · Fall 2026"
                  value={section}
                  onChange={e => setSection(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-2xl focus:outline-none ${
                    isDark ? 'bg-[#181824] text-white' : 'bg-slate-100 text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Room</label>
                <input
                  type="text"
                  placeholder="e.g. Lab 402 or Online"
                  value={room}
                  onChange={e => setRoom(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-2xl focus:outline-none ${
                    isDark ? 'bg-[#181824] text-white' : 'bg-slate-100 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-neutral-400 mb-1 font-medium">Subject / Field</label>
              <input
                type="text"
                placeholder="e.g. Computer Science"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-2xl focus:outline-none ${
                  isDark ? 'bg-[#181824] text-white' : 'bg-slate-100 text-slate-900'
                }`}
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeJoinCreateModal}
                className="px-4 py-2 text-xs text-neutral-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-6 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
                  isDark
                    ? 'bg-[#ff2d75] hover:bg-[#ff1767] text-black shadow-[0_0_20px_rgba(255,45,117,0.4)]'
                    : 'bg-[#0ea5e9] hover:bg-[#0284c7] text-white shadow-md'
                }`}
              >
                Create Classroom
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
