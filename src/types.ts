export type AssignmentStatus = 'assigned' | 'turned_in' | 'missing' | 'graded';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceRecord {
  id: string;
  courseId: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  note?: string;
  updatedAt: string;
  submittedBy?: 'student' | 'teacher';
  verifiedByTeacher?: boolean;
  timeCheckedIn?: string;
  proofFileName?: string;
}

export type UserRole = 'student' | 'teacher' | 'admin';
export type ApprovalStatus = 'approved' | 'pending' | 'rejected';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  institution?: string;
  theme: 'dark' | 'light';
  approvalStatus: ApprovalStatus;
  createdAt: string;
  department?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface PublicUserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  institution?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  createdAt?: string;
  courses?: { id: string; name: string; section?: string; code?: string; role: 'teacher' | 'student' }[];
  attendanceStats?: { total: number; rate: number; present: number; late: number; absent: number };
  activeCourseName?: string;
}

export interface ClassCourse {
  id: string;
  name: string;
  section: string;
  subject: string;
  room: string;
  code: string; // Class code e.g. "cs401-2a"
  teacherId?: string;
  teacher: {
    name: string;
    email: string;
    avatar?: string;
  };
  color: string;
  bannerImage?: string;
  meetLink?: string;
  driveFolder?: string;
  enrolledStudentsCount: number;
  enrolledStudentIds?: string[];
  enrolledStudentEmails?: string[];
  dailyAttendanceCode?: string;
  attendanceOpen?: boolean;
}

export interface ClassworkTopic {
  id: string;
  courseId: string;
  title: string;
}

export interface SubmissionRecord {
  id: string;
  assignmentId: string;
  courseId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  submittedAt: string;
  fileTitle?: string;
  fileUrl?: string;
  submissionText?: string;
  pointsEarned?: number;
  maxPoints: number;
  status: AssignmentStatus;
  feedback?: string;
  gradedAt?: string;
  gradedBy?: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  topicId?: string;
  title: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:MM
  maxPoints: number;
  earnedPoints?: number;
  status: AssignmentStatus;
  submittedAt?: string;
  submissionText?: string;
  teacherFeedback?: string;
  attachments?: {
    title: string;
    type: 'doc' | 'pdf' | 'link' | 'drive' | 'code';
    url: string;
  }[];
  studentWork?: {
    title: string;
    url: string;
    submittedAt: string;
  }[];
}

export interface SchoolAnnouncement {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorRole: 'teacher' | 'admin';
  createdAt: string;
  priority: 'normal' | 'important' | 'urgent';
}

export interface AnnouncementPost {
  id: string;
  courseId: string;
  authorId?: string;
  author: {
    name: string;
    role: 'teacher' | 'student' | 'admin';
    avatar?: string;
  };
  content: string;
  createdAt: string;
  attachments?: {
    title: string;
    type: 'doc' | 'pdf' | 'link' | 'drive';
    url: string;
  }[];
  comments: {
    id: string;
    author: string;
    content: string;
    createdAt: string;
  }[];
}

export interface Classmate {
  id: string;
  name: string;
  email: string;
  role: 'teacher' | 'student';
}
