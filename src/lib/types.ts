export type Weekday =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export type AssignmentType =
  | "Homework"
  | "Reading"
  | "Project"
  | "Paper"
  | "Quiz"
  | "Exam"
  | "Other";

export type AssignmentStatus = "Not Started" | "In Progress" | "Completed";

export type Priority = "low" | "medium" | "high";

export type EventKind = "class" | "assignment" | "exam" | "event";

export interface MeetingTime {
  days: Weekday[];
  start: string;
  end: string;
  location: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  professor: string;
  credits: number;
  color: "sage" | "blue" | "pink" | "cream";
  meeting: MeetingTime;
  syllabusUrl?: string;
  websiteUrl?: string;
  currentGrade?: number;
  targetGrade?: number;
  notes?: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  dueTime?: string;
  type: AssignmentType;
  priority: Priority;
  status: AssignmentStatus;
  estimatedMinutes?: number;
  link?: string;
  notes?: string;
  category?: string;
  weight?: number;
  score?: number;
  maxScore?: number;
}

export interface Exam {
  id: string;
  courseId: string;
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  notes?: string;
}

export interface AcademicEvent {
  id: string;
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  kind: EventKind;
  courseId?: string;
  notes?: string;
}

export interface Reading {
  id: string;
  courseId: string;
  title: string;
  source?: string;
  dueDate?: string;
  completed: boolean;
  link?: string;
}

export interface Note {
  id: string;
  courseId?: string;
  title: string;
  body: string;
  pinned?: boolean;
  updatedAt: string;
  links?: { label: string; url: string }[];
}

export interface GradeCategory {
  id: string;
  courseId: string;
  name: string;
  weight: number;
}

export interface Semester {
  id: string;
  name: string;
  season: "Fall" | "Spring" | "Summer";
  year: number;
  startDate: string;
  endDate: string;
  importantDates: { label: string; date: string }[];
}

export interface AcademicSnapshot {
  studentName: string;
  semester: Semester;
  courses: Course[];
  assignments: Assignment[];
  exams: Exam[];
  events: AcademicEvent[];
  readings: Reading[];
  notes: Note[];
  gradeCategories: GradeCategory[];
}
