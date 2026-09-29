import React, { useState } from 'react';
import { useClassTrack } from '../context/ClassTrackContext';
import { X, FileText, Calendar, Clock, Award, Paperclip, PlusCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export const CreateAssignmentModal: React.FC = () => {
  const {
    isCreateAssignmentModalOpen,
    closeCreateAssignmentModal,
    activeCourseId,
    userCourses,
    topics,
    createTopic,
    addAssignment,
    theme,
  } = useClassTrack();

  const isDark = theme === 'dark';

  const defaultCourse = userCourses.find(c => c.id === activeCourseId) || userCourses[0];
  const [courseId, setCourseId] = useState(defaultCourse?.id || '');
  const courseTopics = topics.filter(t => t.courseId === courseId);

  const [topicId, setTopicId] = useState<string>(courseTopics[0]?.id || '');
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [isCreatingNewTopic, setIsCreatingNewTopic] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [dueTime, setDueTime] = useState('23:59');
  const [maxPoints, setMaxPoints] = useState('100');
  const [attachmentTitle, setAttachmentTitle] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');

  if (!isCreateAssignmentModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !courseId) return;

    let finalTopicId = topicId;

    if (isCreatingNewTopic && newTopicTitle.trim()) {
      finalTopicId = `t-${Date.now()}`;
      createTopic(courseId, newTopicTitle.trim());
    }

    const attachments = attachmentTitle.trim()
      ? [
          {
            title: attachmentTitle.trim(),
            type: 'pdf' as const,
            url: attachmentUrl.trim() || '#',
          },
        ]
      : undefined;

    addAssignment({
      courseId,
      topicId: finalTopicId || undefined,
      title: title.trim(),
      description: description.trim() || 'Please review the attached problem statement and submit your solution.',
      dueDate,
      dueTime,
      maxPoints: parseInt(maxPoints, 10) || 100,
      attachments,
    });

    confetti({
      particleCount: 50,
      spread: 60,
      colors: isDark ? ['#ff2d75', '#ffffff'] : ['#0ea5e9', '#ffffff'],
    });

    closeCreateAssignmentModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div
        className={`w-full max-w-lg p-6 sm:p-7 rounded-3xl transition-all relative my-auto shadow-2xl ${
          isDark
            ? 'bg-[#121218] text-white border border-neutral-800 shadow-[0_0_50px_rgba(255,45,117,0.2)]'
            : 'bg-white text-slate-900 shadow-2xl'
        }`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800/60 mb-5">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs ${
                isDark ? 'bg-pink-500/20 text-pink-400' : 'bg-sky-100 text-sky-700'
              }`}
            >
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-display">Create Assignment</h2>
              <p className="text-[11px] text-neutral-400">Publish coursework, due dates, and rubrics</p>
            </div>
          </div>
          <button
            onClick={closeCreateAssignmentModal}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Target Course & Topic */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-400 mb-1 font-medium">Target Class</label>
              <select
                value={courseId}
                onChange={e => {
                  setCourseId(e.target.value);
                  const newTopics = topics.filter(t => t.courseId === e.target.value);
                  setTopicId(newTopics[0]?.id || '');
                }}
                className={`w-full px-3 py-2.5 rounded-2xl focus:outline-none transition-colors ${
                  isDark ? 'bg-[#181824] text-white' : 'bg-slate-100 text-slate-900'
                }`}
              >
                {userCourses.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-neutral-400 font-medium">Topic / Module</label>
                <button
                  type="button"
                  onClick={() => setIsCreatingNewTopic(!isCreatingNewTopic)}
                  className="text-[10px] text-pink-400 hover:underline cursor-pointer flex items-center gap-0.5"
                >
                  <PlusCircle className="w-3 h-3" />
                  <span>{isCreatingNewTopic ? 'Select existing' : 'New topic'}</span>
                </button>
              </div>

              {isCreatingNewTopic ? (
                <input
                  type="text"
                  placeholder="e.g. Module 3: Security & Auth"
                  value={newTopicTitle}
                  onChange={e => setNewTopicTitle(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-2xl focus:outline-none ${
                    isDark ? 'bg-[#181824] text-white' : 'bg-slate-100 text-slate-900'
                  }`}
                />
              ) : (
                <select
                  value={topicId}
                  onChange={e => setTopicId(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-2xl focus:outline-none ${
                    isDark ? 'bg-[#181824] text-white' : 'bg-slate-100 text-slate-900'
                  }`}
                >
                  <option value="">(No specific topic)</option>
                  {courseTopics.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-neutral-400 mb-1 font-medium">Assignment Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Problem Set 3: Byzantine Fault Tolerance"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-2xl focus:outline-none ${
                isDark ? 'bg-[#181824] text-white' : 'bg-slate-100 text-slate-900'
              }`}
            />
          </div>

          {/* Description & Instructions */}
          <div>
            <label className="block text-neutral-400 mb-1 font-medium">Instructions & Deliverables</label>
            <textarea
              rows={3}
              placeholder="Detail the expectations, coding requirements, or submission guidelines..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-2xl focus:outline-none resize-none ${
                isDark ? 'bg-[#181824] text-white' : 'bg-slate-100 text-slate-900'
              }`}
            />
          </div>

          {/* Due Date, Time, Points */}
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-neutral-400 mb-1 font-medium flex items-center gap-1">
                <Calendar className="w-3 h-3 text-neutral-400" />
                <span>Due Date</span>
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className={`w-full px-2.5 py-2.5 rounded-2xl focus:outline-none font-mono text-[11px] ${
                  isDark ? 'bg-[#181824] text-white' : 'bg-slate-100 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3 text-neutral-400" />
                <span>Due Time</span>
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={e => setDueTime(e.target.value)}
                className={`w-full px-2.5 py-2.5 rounded-2xl focus:outline-none font-mono text-[11px] ${
                  isDark ? 'bg-[#181824] text-white' : 'bg-slate-100 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1 font-medium flex items-center gap-1">
                <Award className="w-3 h-3 text-neutral-400" />
                <span>Max Points</span>
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={maxPoints}
                onChange={e => setMaxPoints(e.target.value)}
                className={`w-full px-2.5 py-2.5 rounded-2xl focus:outline-none font-mono text-[11px] ${
                  isDark ? 'bg-[#181824] text-white' : 'bg-slate-100 text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* Reference Document / Attachment */}
          <div className="p-3.5 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 space-y-2">
            <div className="flex items-center gap-1.5 text-neutral-300 font-semibold text-[11px]">
              <Paperclip className="w-3.5 h-3.5 text-pink-400" />
              <span>Attach Resource or Spec (Optional)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Resource title (e.g. Lab Spec PDF)"
                value={attachmentTitle}
                onChange={e => setAttachmentTitle(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl focus:outline-none text-[11px] ${
                  isDark ? 'bg-[#14141c] text-white' : 'bg-white text-slate-900'
                }`}
              />
              <input
                type="text"
                placeholder="Link or Drive URL"
                value={attachmentUrl}
                onChange={e => setAttachmentUrl(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl focus:outline-none text-[11px] ${
                  isDark ? 'bg-[#14141c] text-white' : 'bg-white text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={closeCreateAssignmentModal}
              className={`px-4 py-2.5 rounded-2xl font-semibold cursor-pointer transition-colors ${
                isDark ? 'text-neutral-400 hover:text-white hover:bg-neutral-800' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-6 py-2.5 rounded-2xl font-bold transition-all cursor-pointer ${
                isDark
                  ? 'bg-[#ff2d75] hover:bg-[#ff1767] text-black shadow-[0_0_20px_rgba(255,45,117,0.4)]'
                  : 'bg-[#0ea5e9] hover:bg-[#0284c7] text-white shadow-md'
              }`}
            >
              Publish Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
