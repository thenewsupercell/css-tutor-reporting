import type { DemoData, TutoringSession } from "@/lib/types";

export interface StudentReportRow {
  studentId: string;
  studentName: string;
  tutoringSite: string;
  sessionCount: number;
  totalMinutes: number;
}

export interface TutorReportGroup {
  tutorId: string;
  tutorName: string;
  students: StudentReportRow[];
  sessionCount: number;
  totalMinutes: number;
}

export interface MonthlyReport {
  month: string;
  tutorGroups: TutorReportGroup[];
  totals: {
    sessionCount: number;
    totalMinutes: number;
    studentCount: number;
    tutorCount: number;
  };
}

interface CombinedRow extends StudentReportRow {
  tutorId: string;
  tutorName: string;
}

export function getMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function getReportMonths(
  sessions: TutoringSession[],
  currentMonth = getMonthKey(),
) {
  const months = new Set([currentMonth]);

  sessions.forEach((session) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(session.date)) {
      months.add(session.date.slice(0, 7));
    }
  });

  return Array.from(months).sort((a, b) => b.localeCompare(a));
}

export function formatReportMonth(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, monthNumber - 1, 1, 12));
}

export function formatReportHours(minutes: number) {
  return (minutes / 60).toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
}

export function aggregateMonthlyReport(
  data: DemoData,
  month: string,
): MonthlyReport {
  const assignments = new Map(
    data.assignments.map((assignment) => [assignment.id, assignment]),
  );
  const tutors = new Map(data.tutors.map((tutor) => [tutor.id, tutor]));
  const students = new Map(
    data.students.map((student) => [student.id, student]),
  );
  const combinedRows = new Map<string, CombinedRow>();

  data.sessions
    .filter((session) => session.date.startsWith(`${month}-`))
    .forEach((session) => {
      const assignment = assignments.get(session.assignmentId);
      const tutorId = assignment?.tutorId ?? "unknown-tutor";
      const studentId = assignment?.studentId ?? "unknown-student";
      const tutor = tutors.get(tutorId);
      const student = students.get(studentId);
      const tutoringSite = student?.tutoringSite ?? "Site unavailable";
      const rowKey = `${tutorId}:${studentId}:${tutoringSite}`;
      const existing = combinedRows.get(rowKey);

      if (existing) {
        existing.sessionCount += 1;
        existing.totalMinutes += session.durationMinutes;
        return;
      }

      combinedRows.set(rowKey, {
        tutorId,
        tutorName: tutor?.name ?? "Tutor unavailable",
        studentId,
        studentName: student?.name ?? "Student unavailable",
        tutoringSite,
        sessionCount: 1,
        totalMinutes: session.durationMinutes,
      });
    });

  const groupMap = new Map<string, TutorReportGroup>();
  Array.from(combinedRows.values())
    .sort(
      (a, b) =>
        a.tutorName.localeCompare(b.tutorName) ||
        a.studentName.localeCompare(b.studentName),
    )
    .forEach((row) => {
      const group = groupMap.get(row.tutorId);
      const studentRow: StudentReportRow = {
        studentId: row.studentId,
        studentName: row.studentName,
        tutoringSite: row.tutoringSite,
        sessionCount: row.sessionCount,
        totalMinutes: row.totalMinutes,
      };

      if (group) {
        group.students.push(studentRow);
        group.sessionCount += row.sessionCount;
        group.totalMinutes += row.totalMinutes;
        return;
      }

      groupMap.set(row.tutorId, {
        tutorId: row.tutorId,
        tutorName: row.tutorName,
        students: [studentRow],
        sessionCount: row.sessionCount,
        totalMinutes: row.totalMinutes,
      });
    });

  const tutorGroups = Array.from(groupMap.values());
  const allRows = tutorGroups.flatMap((group) => group.students);

  return {
    month,
    tutorGroups,
    totals: {
      sessionCount: tutorGroups.reduce(
        (total, group) => total + group.sessionCount,
        0,
      ),
      totalMinutes: tutorGroups.reduce(
        (total, group) => total + group.totalMinutes,
        0,
      ),
      studentCount: new Set(allRows.map((row) => row.studentId)).size,
      tutorCount: tutorGroups.length,
    },
  };
}

function csvCell(value: string | number) {
  let text = String(value);
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export function createMonthlyReportCsv(report: MonthlyReport) {
  const rows: Array<Array<string | number>> = [
    [
      "Month",
      "Tutor",
      "Student",
      "Tutoring Site",
      "Session Count",
      "Total Hours",
    ],
  ];

  report.tutorGroups.forEach((group) => {
    group.students.forEach((student) => {
      rows.push([
        report.month,
        group.tutorName,
        student.studentName,
        student.tutoringSite,
        student.sessionCount,
        formatReportHours(student.totalMinutes),
      ]);
    });
  });

  rows.push([
    report.month,
    "Grand total",
    "",
    "",
    report.totals.sessionCount,
    formatReportHours(report.totals.totalMinutes),
  ]);

  return rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
}
