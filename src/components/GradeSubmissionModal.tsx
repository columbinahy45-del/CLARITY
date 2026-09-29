import React, { useState, useEffect } from 'react';
import { useClassTrack } from '../context/ClassTrackContext';
import { X, Award, CheckCircle2, User, FileText, MessageSquare } from 'lucide-react';
import confetti from 'canvas-confetti';

export const GradeSubmissionModal: React.FC = () => {
  const {
    gradingSubmissionTarget,
    closeGradingModal,
    gradeSubmission,
    assignments,
    theme,
  } = useClassTrack();

  const isDark = theme === 'dark';

  const assignment = assignments.find(a => a.id === gradingSubmissionTarget?.assignmentId);
  const maxPts = gradingSubmissionTarget?.maxPoints || assignment?.maxPoints || 100;

  const [points, setPoints] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');

  useEffect(() => {
    if (gradingSubmissionTarget) {
      setPoints(
        gradingSubmissionTarget.pointsEarned !== undefined
          ? gradingSubmissionTarget.pointsEarned.toString()
          : maxPts.toString()
      );
      setFeedback(gradingSubmissionTarget.feedback || '');
    }
  }, [gradingSubmissionTarget, maxPts]);

  if (!gradingSubmissionTarget) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const score = parseFloat(points);
    if (isNaN(score)) return;

    gradeSubmission(
      gradingSubmissionTarget.id,
      Math.min(Math.max(0, score), maxPts),
      feedback.trim() || 'Good submission. Meets coursework requirements.'
    );

    confetti({
      particleCount: 40,
      spread: 60,
      colors: isDark ? ['#10b981', '#ff2d75', '#ffffff'] : ['#10b981', '#0ea5e9', '#ffffff'],
    });

    closeGradingModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div
        className={`w-full max-w-lg p-6 sm:p-7 rounded-3xl transition-all relative my-auto shadow-2xl ${
          isDark
            ? 'bg-[#121218] text-white border border-neutral-800 shadow-[0_0_50px_rgba(16,185,129,0.2)]'
            : 'bg-white text-slate-900 shadow-2xl'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800/60 mb-5">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs ${
                isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-display">Evaluate & Grade Work</h2>
              <p className="text-[11px] text-neutral-400">Teacher scoring portal & student feedback</p>
            </div>
          </div>
          <button
            onClick={closeGradingModal}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Student Info Card */}
        <div className={`p-4 rounded-2xl mb-4 space-y-2.5 ${isDark ? 'bg-[#181822]' : 'bg-slate-50'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-neutral-400" />
              <span className="font-bold text-xs text-neutral-200">{gradingSubmissionTarget.studentName}</span>
              <span className="text-[11px] text-neutral-400 font-mono">({gradingSubmissionTarget.studentEmail})</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
              Turned In
            </span>
          </div>

          <div className="text-[11px] text-neutral-400">
            <span className="font-semibold text-neutral-300">Assignment: </span>
            {assignment?.title || 'Coursework Assignment'}
          </div>

          {gradingSubmissionTarget.submissionText && (
            <div className="text-[11px] text-neutral-300 italic pt-1 border-t border-neutral-800/50">
              "{gradingSubmissionTarget.submissionText}"
            </div>
          )}

          {gradingSubmissionTarget.fileTitle && (
            <div className="flex items-center gap-2 pt-1 text-[11px] text-pink-400 font-mono">
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{gradingSubmissionTarget.fileTitle}</span>
            </div>
          )}
        </div>

        {/* Grading Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-neutral-400 font-medium flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span>Points Earned (Score)</span>
              </label>
              <span className="text-neutral-400 font-mono text-[11px]">Out of {maxPts} pts</span>
            </div>
            <div className="relative">
              <input
                type="number"
                min="0"
                max={maxPts}
                step="0.5"
                required
                value={points}
                onChange={e => setPoints(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-2xl focus:outline-none font-mono font-bold text-sm ${
                  isDark ? 'bg-[#181824] text-emerald-400' : 'bg-slate-100 text-emerald-700'
                }`}
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 font-mono text-xs">
                / {maxPts}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-neutral-400 mb-1 font-medium flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-neutral-400" />
              <span>Teacher Feedback & Comments</span>
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Excellent work on the consensus tests! Well-structured logs and good error recovery."
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-2xl focus:outline-none resize-none ${
                isDark ? 'bg-[#181824] text-white' : 'bg-slate-100 text-slate-900'
              }`}
            />
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={closeGradingModal}
              className={`px-4 py-2.5 rounded-2xl font-semibold cursor-pointer transition-colors ${
                isDark ? 'text-neutral-400 hover:text-white hover:bg-neutral-800' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold transition-all cursor-pointer ${
                isDark
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Return Grade</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
