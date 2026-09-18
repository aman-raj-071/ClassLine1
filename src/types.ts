export type UserRole = 'parent' | 'teacher';

export interface UserSession {
  username: string;
  role: UserRole;
  name: string;
  email: string;
  children?: string[];
  class?: string;
  loginTime?: number;
  /** School-office account allowed to manage teacher and parent registrations. */
  isAuthorized?: boolean;
}

export interface Child {
  id: string;
  firstName: string;
  fullName: string;
  year: string;
  class: string;
  avatarColor: string;
  readingNights: {
    completed: number;
    target: number;
  };
  guardians: string[];
}

export type EntryType = 'fee' | 'note' | 'event' | 'general';

export interface TimelineEntry {
  id: string;
  childId: string;
  type: EntryType;
  title: string;
  body: string;
  date: string;
  dateGroup: 'today' | 'yesterday' | 'last-week';
  accentColor: string;
  meta?: {
    amount?: string;
    due?: string;
    paid?: boolean;
    from?: string;
    subject?: string;
    time?: string;
    location?: string;
    date?: string;
  };
  seenAt?: string;
  acknowledged?: boolean;
  replyText?: string;
  replyTime?: string;
  teacherReplyText?: string;
  teacherReplyTime?: string;
  parentMessages?: ParentTeacherMessage[];
  paid?: boolean;
  markedSeen?: boolean;
}

export interface ParentTeacherMessage {
  id: string;
  text: string;
  sentAt: string;
  teacherReplyText?: string;
  teacherReplyTime?: string;
}

export interface Dispatch {
  id: string;
  category: EntryType;
  title: string;
  body: string;
  sentAt: string;
  recipients: number;
  delivered: number;
  status: 'delivered' | 'partial' | 'pending';
  targetScope: 'class' | 'individual' | 'group';
  selectedPupils?: string[];
  acknowledgedCount?: number;
}

export interface Pupil {
  id: string;
  name: string;
  initial: string;
  status: 'connected' | 'pending' | 'absent';
}

export interface PupilDetails {
  fullName: string;
  admissionNumber: string;
  dateOfBirth: string;
  parents: ParentContact[];
  address: string;
  emergencyContact: string;
  bloodGroup: string;
  medicalNotes: string;
}

export interface ParentContact {
  name: string;
  relationship: string;
  phone: string;
  email: string;
  isPrimary?: boolean;
}

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  tags: string[];
  initials: string;
  bgClass: string;
  textClass: string;
}

export type SignOffType = 'reading_log' | 'consent_form' | 'trip_permission' | 'fee_reconciliation';

export interface SignOffItem {
  id: string;
  type: SignOffType;
  pupilId: string;
  pupilName: string;
  parentName: string;
  title: string;
  details: string;
  submittedAt: string;
  status: 'pending' | 'signed' | 'rejected';
  signedAt?: string;
  signedBy?: string;
  meta?: {
    bookTitle?: string;
    minutesRead?: number;
    nightsCount?: number;
    amount?: string;
    activityDate?: string;
  };
}

export type PerformanceBand = 'Greater Depth' | 'Expected Standard' | 'Working Towards' | 'Foundational';
export type EffortRating = 'Outstanding' | 'High Effort' | 'Consistent' | 'Needs Support';
export type CbseGrade = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'D' | 'E1' | 'E2';

export interface SubjectGrade {
  id: string;
  subjectCode?: string; // e.g. "041", "184", "086", "087", "085", "165"
  subject: string;
  category: 'Core' | 'Foundation' | 'Specialist' | 'Language' | 'Elective';
  theoryMarks?: number; // Max 80 in CBSE scholastic model
  internalMarks?: number; // Max 20 in CBSE scholastic model (IA / Practical)
  marksObtained: number; // Sum of theory + internal, Max 100
  maxMarks: number;
  grade: string; // CBSE 9-point scale e.g. "A1", "A2", "B1", "B2", "C1", "C2", "D"
  gradePoint: number; // CBSE 10-point scale: A1->10, A2->9, B1->8, B2->7, C1->6, C2->5, D->4
  band: PerformanceBand;
  effort: EffortRating;
  teacherComment: string;
}

export interface CoScholasticGrade {
  area: string;
  grade: 'A' | 'B' | 'C';
  description: string;
}

export interface GradeCard {
  id: string;
  pupilId: string; // matches child.id or pupil.id (e.g. 'child-leo' / 'p12')
  pupilName: string;
  motherName?: string;
  fatherName?: string;
  rollNumber: string; // CBSE Examination Roll No, e.g. "CBSE/2026/3012"
  registrationNumber: string; // Student Registration / Scholar No, e.g. "SCH/89421/26"
  admitCardId?: string; // Admit Card ID, e.g. "LE263012"
  verificationCode: string; // Unique Certificate Verification Code, e.g. "CBSE-VER-9842-LEO7"
  verificationStatus: 'VERIFIED_ACTIVE' | 'PENDING_AUDIT' | 'REVOKED';
  verifiedAt?: string;
  schoolAffiliationNo?: string; // e.g. "CBSE-AFF-2130094"
  schoolCode?: string; // e.g. "SCH-70192"
  yearGroup: string;
  classGroup: string;
  academicYear: string;
  term: string;
  issuedDate: string;
  teacherName: string;
  headteacherName: string;
  attendancePercentage: number;
  daysPresent: number;
  daysTotal: number;
  conductRating: string;
  subjects: SubjectGrade[];
  coScholastic?: CoScholasticGrade[];
  overallAverage: number;
  cgpa: number; // Cumulative Grade Point Average (out of 10.0)
  indicativePercentage: number; // CBSE formula: CGPA * 9.5
  overallGrade: string; // e.g. "A1 (Greater Depth)"
  overallBand: PerformanceBand;
  resultStatus: 'PASSED' | 'QUALIFIED' | 'COMPARTMENT' | 'ESSENTIAL REPEAT';
  teacherGeneralRemarks: string;
  targetAreas: string[];
  status: 'published' | 'draft';
  lastUpdated: string;
}
