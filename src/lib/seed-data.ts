import type { DemoData } from "@/lib/types";

export const DEMO_TUTOR_ID = "tutor-elena";

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dayInMonth(reference: Date, day: number, monthOffset = 0) {
  return dateKey(
    new Date(reference.getFullYear(), reference.getMonth() + monthOffset, day, 12),
  );
}

function createdAt(date: string, hour = 16) {
  return `${date}T${String(hour).padStart(2, "0")}:30:00.000Z`;
}

export function createSeedData(reference = new Date()): DemoData {
  const currentDay = reference.getDate();
  const sessionDays = [2, 4, 7, 9, 11, 14, 16, 18].filter(
    (day) => day <= Math.max(currentDay, 2),
  );
  const safeDays = sessionDays.length >= 4 ? sessionDays : [1, 1, 1, 1];

  const thisMonth = (index: number) =>
    dayInMonth(reference, safeDays[index] ?? Math.max(1, currentDay - index));
  const lastMonth = (day: number) => dayInMonth(reference, day, -1);
  const termStart = dayInMonth(reference, 3, -1);

  return {
    tutors: [
      { id: "tutor-elena", name: "Elena Martínez", email: "elena@example.org" },
      { id: "tutor-daniel", name: "Daniel Kim", email: "daniel@example.org" },
      { id: "tutor-nia", name: "Nia Brooks", email: "nia@example.org" },
    ],
    students: [
      {
        id: "student-camila",
        name: "Camila R.",
        tutoringSite: "Washington Heights Library",
        status: "active",
      },
      {
        id: "student-malik",
        name: "Malik T.",
        tutoringSite: "Harlem Community Center",
        status: "active",
      },
      {
        id: "student-sofia",
        name: "Sofía A.",
        tutoringSite: "Washington Heights Library",
        status: "active",
      },
      {
        id: "student-james",
        name: "James W.",
        tutoringSite: "Inwood Learning Hub",
        status: "active",
      },
      {
        id: "student-ana",
        name: "Ana P.",
        tutoringSite: "Harlem Community Center",
        status: "stopped",
      },
    ],
    assignments: [
      { id: "assignment-1", tutorId: "tutor-elena", studentId: "student-camila", termLabel: "Fall term", startDate: termStart, endDate: null },
      { id: "assignment-2", tutorId: "tutor-elena", studentId: "student-sofia", termLabel: "Fall term", startDate: termStart, endDate: null },
      { id: "assignment-3", tutorId: "tutor-daniel", studentId: "student-malik", termLabel: "Fall term", startDate: termStart, endDate: null },
      { id: "assignment-4", tutorId: "tutor-nia", studentId: "student-james", termLabel: "Fall term", startDate: termStart, endDate: null },
      { id: "assignment-5", tutorId: "tutor-daniel", studentId: "student-ana", termLabel: "Fall term", startDate: termStart, endDate: lastMonth(22) },
    ],
    sessions: [
      { id: "session-1", assignmentId: "assignment-1", date: thisMonth(0), durationMinutes: 90, notes: "Reading comprehension and vocabulary practice.", createdAt: createdAt(thisMonth(0)) },
      { id: "session-2", assignmentId: "assignment-3", date: thisMonth(1), durationMinutes: 60, notes: "Reviewed fractions and word problems.", createdAt: createdAt(thisMonth(1), 18) },
      { id: "session-3", assignmentId: "assignment-2", date: thisMonth(2), durationMinutes: 75, notes: "Conversation practice and school forms.", createdAt: createdAt(thisMonth(2), 17) },
      { id: "session-4", assignmentId: "assignment-4", date: thisMonth(3), durationMinutes: 120, notes: "GED math preparation.", createdAt: createdAt(thisMonth(3), 19) },
      { id: "session-5", assignmentId: "assignment-1", date: thisMonth(4), durationMinutes: 90, notes: "Drafted and revised a short essay.", createdAt: createdAt(thisMonth(4), 16) },
      { id: "session-6", assignmentId: "assignment-3", date: thisMonth(5), durationMinutes: 60, notes: "Percentages and household budgeting.", createdAt: createdAt(thisMonth(5), 18) },
      { id: "session-7", assignmentId: "assignment-2", date: thisMonth(6), durationMinutes: 75, notes: "Workplace vocabulary and pronunciation.", createdAt: createdAt(thisMonth(6), 17) },
      { id: "session-8", assignmentId: "assignment-4", date: thisMonth(7), durationMinutes: 90, notes: "Practice test and review.", createdAt: createdAt(thisMonth(7), 19) },
      { id: "session-9", assignmentId: "assignment-1", date: lastMonth(12), durationMinutes: 90, createdAt: createdAt(lastMonth(12)) },
      { id: "session-10", assignmentId: "assignment-5", date: lastMonth(18), durationMinutes: 60, createdAt: createdAt(lastMonth(18), 18) },
      { id: "session-11", assignmentId: "assignment-3", date: lastMonth(20), durationMinutes: 75, createdAt: createdAt(lastMonth(20), 18) },
    ],
    goals: [
      { id: "goal-1", studentId: "student-camila", title: "Write a five-paragraph personal essay", category: "educational", status: "in_progress", createdAt: createdAt(termStart), completedAt: null },
      { id: "goal-2", studentId: "student-malik", title: "Create and follow a monthly budget", category: "economic", status: "in_progress", createdAt: createdAt(termStart), completedAt: null },
      { id: "goal-3", studentId: "student-sofia", title: "Complete school enrollment forms independently", category: "family", status: "completed", createdAt: createdAt(termStart), completedAt: createdAt(thisMonth(1)) },
      { id: "goal-4", studentId: "student-james", title: "Pass the GED mathematics practice test", category: "educational", status: "in_progress", createdAt: createdAt(termStart), completedAt: null },
      { id: "goal-5", studentId: "student-camila", title: "Join a neighborhood reading group", category: "community", status: "completed", createdAt: createdAt(termStart), completedAt: createdAt(thisMonth(2)) },
      { id: "goal-6", studentId: "student-ana", title: "Build confidence using online services", category: "other", status: "in_progress", createdAt: createdAt(termStart), completedAt: null },
    ],
  };
}
