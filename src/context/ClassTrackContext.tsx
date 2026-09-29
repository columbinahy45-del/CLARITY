import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import {
  ClassCourse,
  ClassworkTopic,
  Assignment,
  AnnouncementPost,
  Classmate,
  UserAccount,
  UserRole,
  ApprovalStatus,
  SubmissionRecord,
  SchoolAnnouncement,
  AttendanceRecord,
  AttendanceStatus,
  PublicUserProfile,
} from '../types';
import { auth, db, isFirebaseConfigured } from '../services/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  deleteUser as deleteAuthUser,
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';

interface ClassTrackContextType {
  // Auth
  currentUser: UserAccount | null;
  isAuthenticated: boolean;
  registeredUsers: UserAccount[];
  signIn: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  signUp: (accountData: Omit<UserAccount, 'id' | 'createdAt' | 'approvalStatus'>, password?: string) => Promise<{ success: boolean; message?: string }>;
  updateUserProfile: (data: Partial<UserAccount>) => void;
  signOut: () => void;
  openAuthModal: (mode?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
  authModalMode: 'signin' | 'signup';
  isEditProfileModalOpen: boolean;
  openEditProfileModal: () => void;
  closeEditProfileModal: () => void;

  // Public Profile Modal
  selectedPublicProfile: PublicUserProfile | null;
  viewPublicProfile: (target: { id?: string; email: string; name?: string; role?: UserRole }) => void;
  closePublicProfile: () => void;

  // Admin Actions
  approveTeacher: (userId: string) => void;
  rejectTeacher: (userId: string) => void;
  deleteUser: (userId: string) => void;
  adminUpdateUserRole: (userId: string, newRole: UserRole) => void;

  // Navigation
  activeTab: 'classes' | 'todo' | 'calendar' | 'course_detail' | 'admin_approvals';
  setActiveTab: (tab: 'classes' | 'todo' | 'calendar' | 'course_detail' | 'admin_approvals') => void;
  activeCourseId: string | null;
  selectCourse: (courseId: string, subTab?: 'stream' | 'classwork' | 'attendance' | 'people' | 'grades') => void;
  courseSubTab: 'stream' | 'classwork' | 'attendance' | 'people' | 'grades';
  setCourseSubTab: (subTab: 'stream' | 'classwork' | 'attendance' | 'people' | 'grades') => void;

  // Attendance
  attendanceRecords: AttendanceRecord[];
  markAttendance: (
    courseId: string,
    studentId: string,
    studentName: string,
    studentEmail: string | undefined,
    date: string,
    status: AttendanceStatus,
    note?: string,
    verified?: boolean,
    submittedBy?: 'student' | 'teacher'
  ) => void;
  markAllAttendance: (courseId: string, date: string, status: AttendanceStatus) => void;
  deleteAttendanceRecord: (recordId: string) => void;
  studentSelfCheckIn: (
    courseId: string,
    date: string,
    status: AttendanceStatus,
    note?: string,
    codeEntered?: string,
    proofFileName?: string
  ) => { success: boolean; message: string };
  setDailyAttendanceCode: (courseId: string, code: string | null) => void;
  toggleAttendanceOpen: (courseId: string, isOpen: boolean) => void;

  // Courses
  courses: ClassCourse[];
  userCourses: ClassCourse[];
  joinCourseWithCode: (code: string) => { success: boolean; message: string };
  createCourse: (data: { name: string; section: string; subject: string; room: string }) => void;
  archiveCourse: (id: string) => void;

  // Classwork & Assignments
  topics: ClassworkTopic[];
  createTopic: (courseId: string, title: string) => void;
  assignments: Assignment[];
  userAssignments: Assignment[];
  submitAssignment: (assignmentId: string, fileTitle?: string) => void;
  submitAssignmentWithDetails: (assignmentId: string, courseId: string, submissionText: string, fileTitle?: string) => void;
  unsubmitAssignment: (assignmentId: string) => void;
  addAssignment: (data: Omit<Assignment, 'id' | 'status'>) => void;
  deleteAssignment: (id: string) => void;

  // Submissions & Grading
  submissions: SubmissionRecord[];
  userSubmissions: SubmissionRecord[];
  gradeSubmission: (submissionId: string, pointsEarned: number, feedback: string) => void;
  gradingSubmissionTarget: SubmissionRecord | null;
  openGradingModal: (submission: SubmissionRecord) => void;
  closeGradingModal: () => void;

  // Assignment Modal
  isCreateAssignmentModalOpen: boolean;
  openCreateAssignmentModal: (courseId?: string) => void;
  closeCreateAssignmentModal: () => void;

  // Stream Announcements & Comments
  announcements: AnnouncementPost[];
  addAnnouncement: (courseId: string, content: string, attachments?: { title: string; type: any; url: string }[]) => void;
  deleteAnnouncement: (id: string) => void;
  addComment: (announcementId: string, content: string) => void;

  // School Announcements (Admin)
  schoolAnnouncements: SchoolAnnouncement[];
  addSchoolAnnouncement: (title: string, content: string, priority: 'normal' | 'important' | 'urgent') => void;
  deleteSchoolAnnouncement: (id: string) => void;

  // People & Classmates
  classmatesMap: Record<string, Classmate[]>;
  getClassmates: (courseId: string) => Classmate[];
  addStudentToCourse: (courseId: string, name: string, email: string) => void;
  removeStudentFromCourse: (courseId: string, classmateId: string) => void;

  // Global Theme
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  // Modals
  isJoinCreateModalOpen: boolean;
  openJoinCreateModal: (mode?: 'join' | 'create') => void;
  closeJoinCreateModal: () => void;
  joinCreateModalMode: 'join' | 'create';

  selectedAssignmentId: string | null;
  setSelectedAssignmentId: (id: string | null) => void;
}

const ClassTrackContext = createContext<ClassTrackContextType | undefined>(undefined);

export const ClassTrackProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Real-time Firestore states
  const [registeredUsers, setRegisteredUsers] = useState<UserAccount[]>([]);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [selectedPublicProfile, setSelectedPublicProfile] = useState<PublicUserProfile | null>(null);

  // Navigation State
  const [activeTab, setActiveTab] = useState<'classes' | 'todo' | 'calendar' | 'course_detail' | 'admin_approvals'>('classes');
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [courseSubTab, setCourseSubTab] = useState<'stream' | 'classwork' | 'attendance' | 'people' | 'grades'>('stream');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);

  // Attendance State
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  // Modals
  const [isJoinCreateModalOpen, setIsJoinCreateModalOpen] = useState(false);
  const [joinCreateModalMode, setJoinCreateModalMode] = useState<'join' | 'create'>('join');
  const [isCreateAssignmentModalOpen, setIsCreateAssignmentModalOpen] = useState(false);
  const [gradingSubmissionTarget, setGradingSubmissionTarget] = useState<SubmissionRecord | null>(null);

  // Classroom Collections
  const [rawCourses, setCourses] = useState<ClassCourse[]>([]);
  const [topics, setTopics] = useState<ClassworkTopic[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementPost[]>([]);
  const [schoolAnnouncements, setSchoolAnnouncements] = useState<SchoolAnnouncement[]>([]);
  const [classmatesMap, setClassmatesMap] = useState<Record<string, Classmate[]>>({});

  // Enrolment counts are derived from the live roster (students cannot write to course docs,
  // and a shared counter would race anyway).
  const courses = useMemo(
    () =>
      rawCourses.map(c => ({
        ...c,
        enrolledStudentsCount: (classmatesMap[c.id] || []).filter(m => m.role === 'student').length,
      })),
    [rawCourses, classmatesMap]
  );

  // Theme preference
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('classtrack_theme');
      return (saved as 'dark' | 'light') || 'dark';
    } catch {
      return 'dark';
    }
  });

  // Sync theme to DOM and localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
    try {
      localStorage.setItem('classtrack_theme', theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // --------------------------------------------------------------------------
  // FIREBASE REAL-TIME LISTENERS (Syncs across devices)
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!auth) return;

    // Listen to Firebase Auth state
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (db) {
          try {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userSnap = await getDoc(userDocRef);
            if (userSnap.exists()) {
              setCurrentUser(userSnap.data() as UserAccount);
            }
          } catch (err) {
            console.error('[Firebase] Error fetching user doc on auth change:', err);
          }
        }
      } else {
        setCurrentUser(null);
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  // Listen to the active user's document for real-time clearance/role/profile changes
  useEffect(() => {
    if (!db || !currentUser?.id) return;

    const unsubscribeUserDoc = onSnapshot(
      doc(db, 'users', currentUser.id),
      (snapshot) => {
        if (snapshot.exists()) {
          setCurrentUser(snapshot.data() as UserAccount);
        }
      },
      (err) => {
        console.warn('[Firebase] Current user listener note:', err.message);
      }
    );

    return () => {
      unsubscribeUserDoc();
    };
  }, [currentUser?.id]);

  // Data is only loaded once someone is signed in AND cleared to see it.
  // (Listeners attached before sign-in are rejected by the security rules and never retry.)
  const currentUserId = currentUser?.id;
  const currentUserRole = currentUser?.role;
  const currentUserEmail = currentUser?.email;
  const isCleared =
    !!currentUser && (currentUser.role === 'admin' || currentUser.approvalStatus === 'approved');

  // Shared collections: readable by any cleared, signed-in user.
  useEffect(() => {
    if (!db) return;
    if (!isCleared) {
      setRegisteredUsers([]);
      setCourses([]);
      setTopics([]);
      setAssignments([]);
      setAnnouncements([]);
      setSchoolAnnouncements([]);
      setClassmatesMap({});
      return;
    }

    const warn = (label: string) => (err: { message: string }) =>
      console.warn(`[Firebase] ${label} snapshot:`, err.message);

    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        setRegisteredUsers(snapshot.docs.map(d => ({ ...d.data(), id: d.id }) as UserAccount));
      },
      warn('Users')
    );

    const unsubCourses = onSnapshot(
      collection(db, 'courses'),
      (snapshot) => {
        setCourses(snapshot.docs.map(d => ({ ...d.data(), id: d.id }) as ClassCourse));
      },
      warn('Courses')
    );

    const unsubTopics = onSnapshot(
      collection(db, 'topics'),
      (snapshot) => {
        setTopics(snapshot.docs.map(d => ({ ...d.data(), id: d.id }) as ClassworkTopic));
      },
      warn('Topics')
    );

    const unsubAssignments = onSnapshot(
      collection(db, 'assignments'),
      (snapshot) => {
        setAssignments(snapshot.docs.map(d => ({ ...d.data(), id: d.id }) as Assignment));
      },
      warn('Assignments')
    );

    const unsubAnnouncements = onSnapshot(
      collection(db, 'announcements'),
      (snapshot) => {
        setAnnouncements(snapshot.docs.map(d => ({ ...d.data(), id: d.id }) as AnnouncementPost));
      },
      warn('Announcements')
    );

    const unsubSchoolAnnouncements = onSnapshot(
      collection(db, 'schoolAnnouncements'),
      (snapshot) => {
        setSchoolAnnouncements(
          snapshot.docs.map(d => ({ ...d.data(), id: d.id }) as SchoolAnnouncement)
        );
      },
      warn('School announcements')
    );

    const unsubClassmates = onSnapshot(
      collection(db, 'classmates'),
      (snapshot) => {
        const map: Record<string, Classmate[]> = {};
        snapshot.docs.forEach(d => {
          const data = d.data();
          const cId = data.courseId;
          if (cId) {
            if (!map[cId]) map[cId] = [];
            map[cId].push({
              id: data.id || d.id,
              name: data.name,
              email: data.email,
              role: data.role,
            });
          }
        });
        setClassmatesMap(map);
      },
      warn('Classmates')
    );

    return () => {
      unsubUsers();
      unsubCourses();
      unsubTopics();
      unsubAssignments();
      unsubAnnouncements();
      unsubSchoolAnnouncements();
      unsubClassmates();
    };
  }, [isCleared, currentUserId]);

  // Course ids a teacher owns (used to scope their submissions/attendance queries).
  const ownedCourseKey = useMemo(() => {
    if (currentUserRole !== 'teacher' || !currentUserEmail) return '';
    const mine = currentUserEmail.toLowerCase();
    return courses
      .filter(c => c.teacher?.email?.toLowerCase() === mine)
      .map(c => c.id)
      .sort()
      .join(',');
  }, [courses, currentUserRole, currentUserEmail]);

  // Submissions and attendance are private per-student data. Firestore rules are not
  // filters, so each role must query only what it is allowed to read:
  //   admin   -> everything
  //   teacher -> one query per owned course
  //   student -> only their own rows
  useEffect(() => {
    if (!db) return;
    const fdb = db;
    if (!isCleared || !currentUserEmail) {
      setSubmissions([]);
      setAttendanceRecords([]);
      return;
    }

    const warn = (label: string) => (err: { message: string }) =>
      console.warn(`[Firebase] ${label} snapshot:`, err.message);

    const unsubs: Array<() => void> = [];

    if (currentUserRole === 'admin') {
      unsubs.push(
        onSnapshot(
          collection(fdb, 'submissions'),
          (snap) =>
            setSubmissions(snap.docs.map(d => ({ ...d.data(), id: d.id }) as SubmissionRecord)),
          warn('Submissions')
        ),
        onSnapshot(
          collection(fdb, 'attendance'),
          (snap) =>
            setAttendanceRecords(
              snap.docs.map(d => ({ ...d.data(), id: d.id }) as AttendanceRecord)
            ),
          warn('Attendance')
        )
      );
    } else if (currentUserRole === 'teacher') {
      const courseIds = ownedCourseKey ? ownedCourseKey.split(',') : [];
      if (courseIds.length === 0) {
        setSubmissions([]);
        setAttendanceRecords([]);
      }
      const subsByCourse = new Map<string, SubmissionRecord[]>();
      const attByCourse = new Map<string, AttendanceRecord[]>();
      courseIds.forEach(courseId => {
        unsubs.push(
          onSnapshot(
            query(collection(fdb, 'submissions'), where('courseId', '==', courseId)),
            (snap) => {
              subsByCourse.set(
                courseId,
                snap.docs.map(d => ({ ...d.data(), id: d.id }) as SubmissionRecord)
              );
              setSubmissions(Array.from(subsByCourse.values()).flat());
            },
            warn('Submissions')
          ),
          onSnapshot(
            query(collection(fdb, 'attendance'), where('courseId', '==', courseId)),
            (snap) => {
              attByCourse.set(
                courseId,
                snap.docs.map(d => ({ ...d.data(), id: d.id }) as AttendanceRecord)
              );
              setAttendanceRecords(Array.from(attByCourse.values()).flat());
            },
            warn('Attendance')
          )
        );
      });
    } else {
      unsubs.push(
        onSnapshot(
          query(collection(fdb, 'submissions'), where('studentEmail', '==', currentUserEmail)),
          (snap) =>
            setSubmissions(snap.docs.map(d => ({ ...d.data(), id: d.id }) as SubmissionRecord)),
          warn('Submissions')
        ),
        onSnapshot(
          query(collection(fdb, 'attendance'), where('studentEmail', '==', currentUserEmail)),
          (snap) =>
            setAttendanceRecords(
              snap.docs.map(d => ({ ...d.data(), id: d.id }) as AttendanceRecord)
            ),
          warn('Attendance')
        )
      );
    }

    return () => unsubs.forEach(u => u());
  }, [isCleared, currentUserId, currentUserRole, currentUserEmail, ownedCourseKey]);

  // --------------------------------------------------------------------------
  // USER-SCOPED FILTERED VIEWS
  // --------------------------------------------------------------------------
  const userCourses = useMemo(() => {
    if (!currentUser) return [];
    const userEmail = currentUser.email.toLowerCase();

    if (currentUser.role === 'admin') {
      return courses;
    }
    if (currentUser.role === 'teacher') {
      return courses.filter(c => c.teacher.email.toLowerCase() === userEmail);
    }
    if (currentUser.role === 'student') {
      return courses.filter(c => {
        const members = classmatesMap[c.id] || [];
        return members.some(m => m.email.toLowerCase() === userEmail);
      });
    }
    return [];
  }, [currentUser, courses, classmatesMap]);

  const userAssignments = useMemo(() => {
    if (!currentUser) return [];
    const courseIds = new Set(userCourses.map(c => c.id));
    const inMyCourses = assignments.filter(a => courseIds.has(a.courseId));

    // Assignment documents are shared by the whole class, so per-student state
    // (turned in / grade / feedback) is layered on from that student's own submission.
    if (currentUser.role !== 'student') return inMyCourses;

    const mine = new Map(submissions.map(sub => [sub.assignmentId, sub]));
    return inMyCourses.map(a => {
      const sub = mine.get(a.id);
      if (!sub) {
        return {
          ...a,
          status: 'assigned' as const,
          earnedPoints: undefined,
          teacherFeedback: undefined,
          submittedAt: undefined,
          submissionText: undefined,
          studentWork: [],
        };
      }
      return {
        ...a,
        status: sub.status,
        earnedPoints: sub.pointsEarned,
        teacherFeedback: sub.feedback,
        submittedAt: sub.submittedAt,
        submissionText: sub.submissionText,
        studentWork: sub.fileTitle
          ? [{ title: sub.fileTitle, url: sub.fileUrl || '#', submittedAt: sub.submittedAt }]
          : [],
      };
    });
  }, [currentUser, userCourses, assignments, submissions]);

  const userSubmissions = useMemo(() => {
    if (!currentUser) return [];
    const userEmail = currentUser.email.toLowerCase();

    if (currentUser.role === 'admin') {
      return submissions;
    }
    if (currentUser.role === 'teacher') {
      const taughtCourseIds = new Set(
        courses
          .filter(c => c.teacher.email.toLowerCase() === userEmail)
          .map(c => c.id)
      );
      return submissions.filter(s => taughtCourseIds.has(s.courseId));
    }
    if (currentUser.role === 'student') {
      return submissions.filter(s => s.studentEmail.toLowerCase() === userEmail);
    }
    return [];
  }, [currentUser, courses, submissions]);

  // --------------------------------------------------------------------------
  // MODAL CONTROLLERS
  // --------------------------------------------------------------------------
  const openAuthModal = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const openEditProfileModal = () => {
    setIsEditProfileModalOpen(true);
  };

  const closeEditProfileModal = () => {
    setIsEditProfileModalOpen(false);
  };

  const viewPublicProfile = (target: { id?: string; email: string; name?: string; role?: UserRole }) => {
    const targetEmail = target.email.trim().toLowerCase();
    const registered = registeredUsers.find(
      u => u.email.toLowerCase() === targetEmail || (target.id && u.id === target.id)
    );

    const userRelatedCourses: { id: string; name: string; section?: string; code?: string; role: 'teacher' | 'student' }[] = [];
    courses.forEach(c => {
      if (c.teacher.email.toLowerCase() === targetEmail) {
        userRelatedCourses.push({
          id: c.id,
          name: c.name,
          section: c.section,
          code: c.code,
          role: 'teacher',
        });
      } else {
        const members = classmatesMap[c.id] || [];
        const isMember = members.some(m => m.email.toLowerCase() === targetEmail);
        if (isMember) {
          userRelatedCourses.push({
            id: c.id,
            name: c.name,
            section: c.section,
            code: c.code,
            role: 'student',
          });
        }
      }
    });

    const studentRecords = attendanceRecords.filter(
      r => (target.id && r.studentId === target.id) || (r.studentEmail && r.studentEmail.toLowerCase() === targetEmail)
    );
    let attendanceStats = undefined;
    if (studentRecords.length > 0) {
      const total = studentRecords.length;
      const present = studentRecords.filter(r => r.status === 'present').length;
      const late = studentRecords.filter(r => r.status === 'late').length;
      const absent = studentRecords.filter(r => r.status === 'absent').length;
      const rate = Math.round(((present + late) / total) * 100);
      attendanceStats = { total, rate, present, late, absent };
    }

    const currentCourse = courses.find(c => c.id === activeCourseId);

    const profile: PublicUserProfile = {
      id: registered?.id || target.id || `usr-${Date.now()}`,
      name: registered?.name || target.name || target.email.split('@')[0],
      email: target.email,
      role: registered?.role || target.role || (targetEmail.includes('teacher') || targetEmail.includes('admin') ? 'teacher' : 'student'),
      avatar: registered?.avatar,
      department: registered?.department || (registered?.role === 'teacher' ? 'Academic Faculty' : 'General Studies'),
      institution: registered?.institution || 'Central School Administration',
      address: registered?.address,
      city: registered?.city || 'Campus Location',
      state: registered?.state || 'Academic District',
      zipCode: registered?.zipCode,
      createdAt: registered?.createdAt || new Date().toISOString(),
      courses: userRelatedCourses,
      attendanceStats,
      activeCourseName: currentCourse?.name,
    };

    setSelectedPublicProfile(profile);
  };

  const closePublicProfile = () => {
    setSelectedPublicProfile(null);
  };

  // --------------------------------------------------------------------------
  // AUTHENTICATION METHODS (Real Firebase Auth + Firestore)
  // --------------------------------------------------------------------------
  const signIn = async (email: string, password = ''): Promise<{ success: boolean; message?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      return { success: false, message: 'Please provide both email and password.' };
    }

    if (!isFirebaseConfigured || !auth || !db) {
      return {
        success: false,
        message: 'Firebase is not configured yet. Please configure your Firebase project in .env.local.',
      };
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      const uid = userCredential.user.uid;
      const userDocRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        // The profile was removed by an administrator (or never finished being created).
        // Do not silently re-create it: that would undo a removal.
        await firebaseSignOut(auth);
        return {
          success: false,
          message: 'This account has been removed or is not set up. Please contact an administrator.',
        };
      }

      const userData = userSnap.data() as UserAccount;
      setCurrentUser(userData);
      setActiveTab(userData.role === 'admin' ? 'admin_approvals' : 'classes');

      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err: any) {
      console.error('[Firebase] Sign-in error:', err);
      let message = 'Invalid email or password.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        message = 'Invalid email or password.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'Access temporarily disabled due to many failed attempts. Try again later.';
      }
      return { success: false, message };
    }
  };

  const signUp = async (
    accountData: Omit<UserAccount, 'id' | 'createdAt' | 'approvalStatus'>,
    password = ''
  ): Promise<{ success: boolean; message?: string }> => {
    const cleanEmail = accountData.email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      return { success: false, message: 'All required fields must be filled.' };
    }

    if (!isFirebaseConfigured || !auth || !db) {
      return {
        success: false,
        message: 'Firebase is not configured yet. Please configure your Firebase project in .env.local.',
      };
    }

    // Role safety: strictly 'student' or 'teacher'. Nobody can register as admin.
    const requestedRole: UserRole = accountData.role === 'teacher' ? 'teacher' : 'student';
    // Students start approved immediately; Teachers start pending review
    const approvalStatus: ApprovalStatus = requestedRole === 'student' ? 'approved' : 'pending';

    let createdAuthUser: import('firebase/auth').User | null = null;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      createdAuthUser = userCredential.user;
      const uid = userCredential.user.uid;

      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: accountData.name.trim(),
        });
      }

      const newUser: UserAccount = {
        id: uid,
        name: accountData.name.trim(),
        email: cleanEmail,
        role: requestedRole,
        approvalStatus,
        theme,
        institution: accountData.institution || 'State University',
        department: accountData.department || (requestedRole === 'teacher' ? 'General Faculty' : undefined),
        address: accountData.address,
        city: accountData.city,
        state: accountData.state,
        zipCode: accountData.zipCode,
        createdAt: new Date().toISOString(),
      };

      // Save user document in Firestore without storing password
      await setDoc(doc(db, 'users', uid), newUser);
      setCurrentUser(newUser);

      setActiveTab('classes');
      setIsAuthModalOpen(false);
      return { success: true, message: 'Account registered successfully!' };
    } catch (err: any) {
      console.error('[Firebase] Sign-up error:', err);
      // If the login was created but the profile could not be saved, remove the login
      // so the person can simply try again instead of being stuck with a half-account.
      if (createdAuthUser) {
        try {
          await deleteAuthUser(createdAuthUser);
        } catch (cleanupErr) {
          console.error('[Firebase] Could not clean up partial sign-up:', cleanupErr);
        }
      }
      let message = 'Failed to create account.';
      if (err.code === 'auth/email-already-in-use') {
        message = 'An account with this email address already exists. Please sign in.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password must be at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      }
      return { success: false, message };
    }
  };

  const updateUserProfile = async (data: Partial<UserAccount>) => {
    if (!currentUser || !db) return;
    // Security: never allow updating role or clearance through client profile update
    const { role, approvalStatus, id, email, ...allowedUpdates } = data;
    const updated = { ...currentUser, ...allowedUpdates };
    setCurrentUser(updated);

    try {
      await updateDoc(doc(db, 'users', currentUser.id), allowedUpdates);
    } catch (err) {
      console.error('[Firebase] Error updating profile in Firestore:', err);
    }
  };

  const signOut = async () => {
    if (auth) {
      try {
        await firebaseSignOut(auth);
      } catch (err) {
        console.error('[Firebase] Sign-out error:', err);
      }
    }
    setCurrentUser(null);
    setActiveCourseId(null);
    setActiveTab('classes');
  };

  // --------------------------------------------------------------------------
  // ADMIN ACTIONS
  // --------------------------------------------------------------------------
  const approveTeacher = async (userId: string) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'users', userId), { approvalStatus: 'approved' });
    } catch (err) {
      console.error('[Firebase] Error approving teacher:', err);
    }
  };

  const rejectTeacher = async (userId: string) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'users', userId), { approvalStatus: 'rejected' });
    } catch (err) {
      console.error('[Firebase] Error rejecting teacher:', err);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
      if (currentUser && currentUser.id === userId) {
        await signOut();
      }
    } catch (err) {
      console.error('[Firebase] Error deleting user:', err);
    }
  };

  const adminUpdateUserRole = async (userId: string, newRole: UserRole) => {
    if (!db) return;
    // Security: client writes can never set role to 'admin'
    if (newRole === 'admin') {
      console.warn('Admins must be configured directly in Firebase Console for security.');
      return;
    }
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
    } catch (err) {
      console.error('[Firebase] Error updating user role:', err);
    }
  };

  // --------------------------------------------------------------------------
  // NAVIGATION
  // --------------------------------------------------------------------------
  const selectCourse = (courseId: string, subTab: 'stream' | 'classwork' | 'attendance' | 'people' | 'grades' = 'stream') => {
    setActiveCourseId(courseId);
    setCourseSubTab(subTab);
    setActiveTab('course_detail');
  };

  // --------------------------------------------------------------------------
  // COURSES
  // --------------------------------------------------------------------------
  const joinCourseWithCode = (code: string): { success: boolean; message: string } => {
    if (!currentUser) {
      return { success: false, message: 'Please sign in to join a class.' };
    }

    const trimmed = code.trim().toLowerCase();
    const existing = courses.find(c => c.code.toLowerCase() === trimmed);
    if (!existing) {
      return { success: false, message: 'Invalid class code. Please check with your teacher.' };
    }

    if (existing.teacher.email.toLowerCase() === currentUser.email.toLowerCase()) {
      return { success: false, message: 'You are the instructor of this class.' };
    }

    const currentMembers = classmatesMap[existing.id] || [];
    const isAlreadyEnrolled = currentMembers.some(
      m => m.email.toLowerCase() === currentUser.email.toLowerCase()
    );
    if (isAlreadyEnrolled) {
      return { success: false, message: 'You are already enrolled in this class.' };
    }

    if (db) {
      const cmId = `cm-${existing.id}-${currentUser.id}`;
      setDoc(doc(db, 'classmates', cmId), {
        id: cmId,
        courseId: existing.id,
        name: currentUser.name,
        email: currentUser.email,
        role: 'student',
      }).catch(err => console.error('[Firebase] Error enrolling classmate:', err));
    }

    setActiveCourseId(existing.id);
    setActiveTab('course_detail');
    return { success: true, message: `Successfully enrolled in ${existing.name}!` };
  };

  const createCourse = async (data: { name: string; section: string; subject: string; room: string }) => {
    if (!currentUser) return;
    // Real clearance check: Teachers must be approved by admin
    if (currentUser.role === 'teacher' && currentUser.approvalStatus !== 'approved') {
      return;
    }

    const courseId = `c-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const generatedCode = Math.random().toString(36).substring(2, 9);
    const newCourse: ClassCourse = {
      id: courseId,
      name: data.name.trim(),
      section: data.section.trim() || 'Section 01',
      subject: data.subject.trim() || 'General',
      room: data.room.trim() || 'Room 101',
      code: generatedCode,
      teacher: {
        name: currentUser.name,
        email: currentUser.email,
        avatar: currentUser.avatar,
      },
      color: theme === 'dark' ? '#ff2d75' : '#0ea5e9',
      enrolledStudentsCount: 0,
    };

    if (db) {
      try {
        await setDoc(doc(db, 'courses', courseId), newCourse);

        // Add teacher to classmates roster
        const cmId = `cm-t-${courseId}-${currentUser.id}`;
        await setDoc(doc(db, 'classmates', cmId), {
          id: cmId,
          courseId,
          name: currentUser.name,
          email: currentUser.email,
          role: 'teacher',
        });

        // Create initial syllabus topic
        const topicId = `t-${courseId}-init`;
        await setDoc(doc(db, 'topics', topicId), {
          id: topicId,
          courseId,
          title: 'Course Materials & Syllabus',
        });
      } catch (err) {
        console.error('[Firebase] Error creating course:', err);
      }
    }

    setActiveCourseId(courseId);
    setActiveTab('course_detail');
  };

  const archiveCourse = async (id: string) => {
    if (db) {
      try {
        await deleteDoc(doc(db, 'courses', id));
      } catch (err) {
        console.error('[Firebase] Error archiving course:', err);
      }
    }
    if (activeCourseId === id) {
      setActiveCourseId(null);
      setActiveTab('classes');
    }
  };

  // --------------------------------------------------------------------------
  // CLASSWORK & ASSIGNMENTS
  // --------------------------------------------------------------------------
  const createTopic = async (courseId: string, title: string) => {
    if (!db) return;
    const topicId = `t-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    try {
      await setDoc(doc(db, 'topics', topicId), {
        id: topicId,
        courseId,
        title: title.trim(),
      });
    } catch (err) {
      console.error('[Firebase] Error creating topic:', err);
    }
  };

  const submitAssignment = (assignmentId: string, fileTitle = 'student_submission.pdf') => {
    const currentAssignment = assignments.find(a => a.id === assignmentId);
    submitAssignmentWithDetails(
      assignmentId,
      currentAssignment?.courseId || '',
      'Turned in assignment.',
      fileTitle
    );
  };

  const submitAssignmentWithDetails = async (
    assignmentId: string,
    courseId: string,
    submissionText: string,
    fileTitle = 'submission_document.pdf'
  ) => {
    if (!currentUser || !db) return;
    const now = new Date().toISOString();
    const subId = `sub-${assignmentId}-${currentUser.id}`;
    const targetAssignment = assignments.find(a => a.id === assignmentId);
    const maxPts = targetAssignment?.maxPoints || 100;

    const record: SubmissionRecord = {
      id: subId,
      assignmentId,
      courseId: courseId || targetAssignment?.courseId || '',
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentEmail: currentUser.email,
      submittedAt: now,
      fileTitle,
      fileUrl: '#',
      submissionText,
      maxPoints: maxPts,
      status: 'turned_in',
    };

    try {
      await setDoc(doc(db, 'submissions', subId), record, { merge: true });
    } catch (err) {
      console.error('[Firebase] Error submitting assignment:', err);
    }
  };

  const unsubmitAssignment = async (assignmentId: string) => {
    if (!currentUser || !db) return;
    const subId = `sub-${assignmentId}-${currentUser.id}`;
    try {
      await deleteDoc(doc(db, 'submissions', subId));
    } catch (err) {
      console.error('[Firebase] Error unsubmitting assignment:', err);
    }
  };

  const addAssignment = async (data: Omit<Assignment, 'id' | 'status'>) => {
    if (!db) return;
    const assignmentId = `a-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newAssignment: Assignment = {
      ...data,
      id: assignmentId,
      status: 'assigned',
    };
    try {
      await setDoc(doc(db, 'assignments', assignmentId), newAssignment);
    } catch (err) {
      console.error('[Firebase] Error adding assignment:', err);
    }
  };

  const deleteAssignment = async (id: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, 'assignments', id));
    } catch (err) {
      console.error('[Firebase] Error deleting assignment:', err);
    }
  };

  // --------------------------------------------------------------------------
  // GRADING
  // --------------------------------------------------------------------------
  const gradeSubmission = async (submissionId: string, pointsEarned: number, feedback: string) => {
    if (!currentUser || !db) return;
    // Real clearance check: Pending teachers cannot grade
    if (currentUser.role === 'teacher' && currentUser.approvalStatus !== 'approved') return;

    const now = new Date().toISOString();
    const graderName = currentUser.name || 'Instructor';

    try {
      await updateDoc(doc(db, 'submissions', submissionId), {
        pointsEarned,
        feedback,
        status: 'graded',
        gradedAt: now,
        gradedBy: graderName,
      });

    } catch (err) {
      console.error('[Firebase] Error grading submission:', err);
    }

    setGradingSubmissionTarget(null);
  };

  const openGradingModal = (submission: SubmissionRecord) => {
    setGradingSubmissionTarget(submission);
  };

  const closeGradingModal = () => {
    setGradingSubmissionTarget(null);
  };

  const openCreateAssignmentModal = (courseId?: string) => {
    if (courseId) {
      setActiveCourseId(courseId);
    }
    setIsCreateAssignmentModalOpen(true);
  };

  const closeCreateAssignmentModal = () => {
    setIsCreateAssignmentModalOpen(false);
  };

  // --------------------------------------------------------------------------
  // ANNOUNCEMENTS
  // --------------------------------------------------------------------------
  const addAnnouncement = async (
    courseId: string,
    content: string,
    attachments?: { title: string; type: any; url: string }[]
  ) => {
    if (!currentUser || !db) return;
    const id = `p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newPost: AnnouncementPost = {
      id,
      courseId,
      authorId: currentUser.id,
      author: {
        name: currentUser.name,
        role: currentUser.role,
        avatar: currentUser.avatar,
      },
      content,
      createdAt: new Date().toISOString(),
      attachments: attachments || [],
      comments: [],
    };
    try {
      await setDoc(doc(db, 'announcements', id), newPost);
    } catch (err) {
      console.error('[Firebase] Error adding announcement:', err);
    }
  };

  const deleteAnnouncement = async (id: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, 'announcements', id));
    } catch (err) {
      console.error('[Firebase] Error deleting announcement:', err);
    }
  };

  const addComment = async (announcementId: string, content: string) => {
    if (!currentUser || !db) return;
    const target = announcements.find(a => a.id === announcementId);
    if (!target) return;

    const newComment = {
      id: `cm-${Date.now()}`,
      author: currentUser.name || 'User',
      content,
      createdAt: new Date().toISOString(),
    };

    try {
      await updateDoc(doc(db, 'announcements', announcementId), {
        comments: [...(target.comments || []), newComment],
      });
    } catch (err) {
      console.error('[Firebase] Error adding comment:', err);
    }
  };

  const addSchoolAnnouncement = async (
    title: string,
    content: string,
    priority: 'normal' | 'important' | 'urgent' = 'normal'
  ) => {
    if (!currentUser || !db) return;
    const id = `sa-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newAnn: SchoolAnnouncement = {
      id,
      title,
      content,
      authorName: currentUser.name || 'ADMINISTRATOR',
      authorRole: currentUser.role === 'admin' ? 'admin' : 'teacher',
      createdAt: new Date().toISOString(),
      priority,
    };
    try {
      await setDoc(doc(db, 'schoolAnnouncements', id), newAnn);
    } catch (err) {
      console.error('[Firebase] Error adding school announcement:', err);
    }
  };

  const deleteSchoolAnnouncement = async (id: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, 'schoolAnnouncements', id));
    } catch (err) {
      console.error('[Firebase] Error deleting school announcement:', err);
    }
  };

  // --------------------------------------------------------------------------
  // PEOPLE & ROSTER
  // --------------------------------------------------------------------------
  const getClassmates = (courseId: string): Classmate[] => {
    return classmatesMap[courseId] || [];
  };

  const addStudentToCourse = async (courseId: string, name: string, email: string) => {
    if (!db) return;
    const cmId = `cm-${courseId}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newStudent: Classmate = {
      id: cmId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: 'student',
    };
    try {
      await setDoc(doc(db, 'classmates', cmId), {
        ...newStudent,
        courseId,
      });
    } catch (err) {
      console.error('[Firebase] Error adding student to course:', err);
    }
  };

  const removeStudentFromCourse = async (courseId: string, classmateId: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, 'classmates', classmateId));    } catch (err) {
      console.error('[Firebase] Error removing student from course:', err);
    }
  };

  const openJoinCreateModal = (mode: 'join' | 'create' = 'join') => {
    setJoinCreateModalMode(mode);
    setIsJoinCreateModalOpen(true);
  };

  const closeJoinCreateModal = () => {
    setIsJoinCreateModalOpen(false);
  };

  // --------------------------------------------------------------------------
  // ATTENDANCE ACTIONS
  // --------------------------------------------------------------------------
  const markAttendance = async (
    courseId: string,
    studentId: string,
    studentName: string,
    studentEmail: string | undefined,
    date: string,
    status: AttendanceStatus,
    note?: string,
    verified = true,
    submittedBy: 'student' | 'teacher' = 'teacher'
  ) => {
    if (!db) return;
    // Real clearance check: Pending teachers cannot take attendance
    if (currentUser?.role === 'teacher' && currentUser.approvalStatus !== 'approved') return;

    const attId = `att-${courseId}-${studentId}-${date}`;
    const now = new Date().toISOString();

    const record: AttendanceRecord = {
      id: attId,
      courseId,
      studentId,
      studentName,
      studentEmail: studentEmail || '',
      date,
      status,
      note: note || '',
      submittedBy,
      verifiedByTeacher: verified,
      timeCheckedIn: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, 'attendance', attId), record, { merge: true });
    } catch (err) {
      console.error('[Firebase] Error marking attendance:', err);
    }
  };

  const markAllAttendance = async (courseId: string, date: string, status: AttendanceStatus) => {
    if (!db) return;
    if (currentUser?.role === 'teacher' && currentUser.approvalStatus !== 'approved') return;

    const students = getClassmates(courseId).filter(c => c.role === 'student');
    if (students.length === 0) return;

    const now = new Date().toISOString();
    try {
      for (const student of students) {
        const attId = `att-${courseId}-${student.id}-${date}`;
        await setDoc(
          doc(db, 'attendance', attId),
          {
            id: attId,
            courseId,
            studentId: student.id,
            studentName: student.name,
            studentEmail: student.email,
            date,
            status,
            note: '',
            submittedBy: 'teacher',
            verifiedByTeacher: true,
            updatedAt: now,
          },
          { merge: true }
        );
      }
    } catch (err) {
      console.error('[Firebase] Error marking all attendance:', err);
    }
  };

  const deleteAttendanceRecord = async (recordId: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, 'attendance', recordId));
    } catch (err) {
      console.error('[Firebase] Error deleting attendance record:', err);
    }
  };

  const studentSelfCheckIn = (
    courseId: string,
    date: string,
    status: AttendanceStatus,
    note?: string,
    codeEntered?: string,
    proofFileName?: string
  ): { success: boolean; message: string } => {
    if (!currentUser) {
      return { success: false, message: 'Please sign in to check in.' };
    }

    const targetCourse = courses.find(c => c.id === courseId);
    if (!targetCourse) {
      return { success: false, message: 'Course not found.' };
    }

    if (targetCourse.attendanceOpen === false) {
      return { success: false, message: 'Check-in is currently closed by the instructor.' };
    }

    if (targetCourse.dailyAttendanceCode && targetCourse.dailyAttendanceCode.trim()) {
      if (!codeEntered || codeEntered.trim().toUpperCase() !== targetCourse.dailyAttendanceCode.trim().toUpperCase()) {
        return { success: false, message: 'Incorrect class session code. Please verify the code provided by your teacher.' };
      }
    }

    const now = new Date().toISOString();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const attId = `att-${courseId}-${currentUser.id}-${date}`;

    const record: AttendanceRecord = {
      id: attId,
      courseId,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentEmail: currentUser.email,
      date,
      status,
      note: note || (status === 'present' ? 'Student self check-in' : 'Submitted by student'),
      submittedBy: 'student',
      verifiedByTeacher: false,
      timeCheckedIn: timeStr,
      proofFileName,
      updatedAt: now,
    };

    if (db) {
      setDoc(doc(db, 'attendance', attId), record, { merge: true }).catch(err => {
        console.error('[Firebase] Error during self check-in:', err);
      });
    }

    return { success: true, message: `Successfully checked in as ${status} at ${timeStr}!` };
  };

  const setDailyAttendanceCode = async (courseId: string, code: string | null) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'courses', courseId), {
        dailyAttendanceCode: code || null,
      });
    } catch (err) {
      console.error('[Firebase] Error setting daily attendance code:', err);
    }
  };

  const toggleAttendanceOpen = async (courseId: string, isOpen: boolean) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'courses', courseId), {
        attendanceOpen: isOpen,
      });
    } catch (err) {
      console.error('[Firebase] Error toggling attendance open:', err);
    }
  };

  return (
    <ClassTrackContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        registeredUsers,
        signIn,
        signUp,
        updateUserProfile,
        signOut,
        openAuthModal,
        closeAuthModal,
        isAuthModalOpen,
        authModalMode,
        isEditProfileModalOpen,
        openEditProfileModal,
        closeEditProfileModal,
        selectedPublicProfile,
        viewPublicProfile,
        closePublicProfile,
        approveTeacher,
        rejectTeacher,
        deleteUser,
        adminUpdateUserRole,
        activeTab,
        setActiveTab,
        activeCourseId,
        selectCourse,
        courseSubTab,
        setCourseSubTab,
        attendanceRecords,
        markAttendance,
        markAllAttendance,
        deleteAttendanceRecord,
        studentSelfCheckIn,
        setDailyAttendanceCode,
        toggleAttendanceOpen,
        courses,
        userCourses,
        joinCourseWithCode,
        createCourse,
        archiveCourse,
        topics,
        createTopic,
        assignments,
        userAssignments,
        submitAssignment,
        submitAssignmentWithDetails,
        unsubmitAssignment,
        addAssignment,
        deleteAssignment,
        submissions,
        userSubmissions,
        gradeSubmission,
        gradingSubmissionTarget,
        openGradingModal,
        closeGradingModal,
        isCreateAssignmentModalOpen,
        openCreateAssignmentModal,
        closeCreateAssignmentModal,
        announcements,
        addAnnouncement,
        deleteAnnouncement,
        addComment,
        schoolAnnouncements,
        addSchoolAnnouncement,
        deleteSchoolAnnouncement,
        classmatesMap,
        getClassmates,
        addStudentToCourse,
        removeStudentFromCourse,
        theme,
        toggleTheme,
        isJoinCreateModalOpen,
        openJoinCreateModal,
        closeJoinCreateModal,
        joinCreateModalMode,
        selectedAssignmentId,
        setSelectedAssignmentId,
      }}
    >
      {children}
    </ClassTrackContext.Provider>
  );
};

export const useClassTrack = () => {
  const context = useContext(ClassTrackContext);
  if (!context) {
    throw new Error('useClassTrack must be used within a ClassTrackProvider');
  }
  return context;
};
