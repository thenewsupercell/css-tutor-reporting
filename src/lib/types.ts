export type StudentStatus = "active" | "stopped";

export type GoalCategory =
  | "economic"
  | "educational"
  | "family"
  | "community"
  | "other";

export type GoalStatus = "in_progress" | "completed";

export interface Tutor {
  id: string;
  name: string;
  email: string;
}

export interface Student {
  id: string;
  name: string;
  tutoringSite: string;
  status: StudentStatus;
}

export interface Assignment {
  id: string;
  tutorId: string;
  studentId: string;
  termLabel: string;
  startDate: string;
  endDate: string | null;
}

export interface TutoringSession {
  id: string;
  assignmentId: string;
  date: string;
  durationMinutes: number;
  notes?: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  studentId: string;
  title: string;
  category: GoalCategory;
  status: GoalStatus;
  createdAt: string;
  completedAt: string | null;
}

export interface DemoData {
  tutors: Tutor[];
  students: Student[];
  assignments: Assignment[];
  sessions: TutoringSession[];
  goals: Goal[];
}
