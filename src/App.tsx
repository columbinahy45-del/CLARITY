import React from 'react';
import { ClassTrackProvider, useClassTrack } from './context/ClassTrackContext';
import { TopNav } from './components/TopNav';
import { DesktopSidebar, MobileBottomNav } from './components/Navigation';
import { ClassCardView } from './components/ClassCardView';
import { CourseDetailView } from './components/CourseDetailView';
import { ToDoListView } from './components/ToDoListView';
import { CalendarView } from './components/CalendarView';
import { JoinCreateClassModal } from './components/JoinCreateClassModal';
import { AuthModal } from './components/AuthModal';
import { CreateAssignmentModal } from './components/CreateAssignmentModal';
import { GradeSubmissionModal } from './components/GradeSubmissionModal';
import { EditProfileModal } from './components/EditProfileModal';
import { PublicProfileModal } from './components/PublicProfileModal';
import { LandingHeroView } from './components/LandingHeroView';
import { PendingApprovalView } from './components/PendingApprovalView';
import { AdminApprovalView } from './components/AdminApprovalView';

const AppContent: React.FC = () => {
  const { activeTab, isAuthenticated, currentUser, theme } = useClassTrack();
  const isDark = theme === 'dark';

  // If a teacher signs in and is pending approval, show the dedicated pending review screen
  const isTeacherPending = currentUser?.role === 'teacher' && currentUser.approvalStatus === 'pending';

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      isDark ? 'bg-[#09090b] text-neutral-100' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      {/* Top Bar with Brand, Join/Create, Mode Toggle, and Auth */}
      <TopNav />

      {/* Main Content Area */}
      {!isAuthenticated ? (
        <main className="flex-1 flex flex-col justify-center">
          <LandingHeroView />
        </main>
      ) : isTeacherPending ? (
        <main className="flex-1 flex flex-col justify-center p-4">
          <PendingApprovalView />
        </main>
      ) : (
        <div className="flex-1 flex max-w-full">
          {/* Left Desktop Sidebar with Enrolled Courses */}
          <DesktopSidebar />

          {/* Active Classroom View */}
          <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 overflow-y-auto max-w-full">
            {activeTab === 'classes' && <ClassCardView />}
            {activeTab === 'course_detail' && <CourseDetailView />}
            {activeTab === 'todo' && <ToDoListView />}
            {activeTab === 'calendar' && <CalendarView />}
            {activeTab === 'admin_approvals' && <AdminApprovalView />}
          </main>
        </div>
      )}

      {/* Mobile Navigation (only for active approved users) */}
      {isAuthenticated && !isTeacherPending && <MobileBottomNav />}

      {/* Modals */}
      <JoinCreateClassModal />
      <AuthModal />
      <CreateAssignmentModal />
      <GradeSubmissionModal />
      <EditProfileModal />
      <PublicProfileModal />
    </div>
  );
};

export default function App() {
  return (
    <ClassTrackProvider>
      <AppContent />
    </ClassTrackProvider>
  );
}
