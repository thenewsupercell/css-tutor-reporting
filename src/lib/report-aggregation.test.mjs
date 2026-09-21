import assert from "node:assert/strict";
import test from "node:test";

import {
  aggregateMonthlyReport,
  createMonthlyReportCsv,
  getReportMonths,
} from "./report-aggregation.ts";

const data = {
  tutors: [
    { id: "tutor-1", name: "Alex Tutor", email: "alex@example.org" },
    { id: "tutor-2", name: "Bailey Tutor", email: "bailey@example.org" },
  ],
  students: [
    { id: "student-1", name: "Casey Student", tutoringSite: "North Site", status: "active" },
    { id: "student-2", name: "Drew Student", tutoringSite: "South Site", status: "active" },
  ],
  assignments: [
    { id: "assignment-1", tutorId: "tutor-1", studentId: "student-1", termLabel: "Spring", startDate: "2026-01-01", endDate: null },
    { id: "assignment-2", tutorId: "tutor-2", studentId: "student-2", termLabel: "Spring", startDate: "2026-01-01", endDate: null },
  ],
  sessions: [
    { id: "session-1", assignmentId: "assignment-1", date: "2026-02-03", durationMinutes: 60, createdAt: "2026-02-03T18:00:00Z" },
    { id: "session-2", assignmentId: "assignment-1", date: "2026-02-10", durationMinutes: 30, createdAt: "2026-02-10T18:00:00Z" },
    { id: "session-3", assignmentId: "assignment-2", date: "2026-02-11", durationMinutes: 45, createdAt: "2026-02-11T18:00:00Z" },
    { id: "session-4", assignmentId: "assignment-1", date: "2026-01-20", durationMinutes: 120, createdAt: "2026-01-20T18:00:00Z" },
  ],
  goals: [],
};

test("aggregates one month by tutor and student", () => {
  const report = aggregateMonthlyReport(data, "2026-02");

  assert.deepEqual(report.totals, {
    sessionCount: 3,
    totalMinutes: 135,
    studentCount: 2,
    tutorCount: 2,
  });
  assert.equal(report.tutorGroups[0].tutorName, "Alex Tutor");
  assert.equal(report.tutorGroups[0].students[0].sessionCount, 2);
  assert.equal(report.tutorGroups[0].students[0].totalMinutes, 90);
  assert.equal(report.tutorGroups[1].students[0].tutoringSite, "South Site");
});

test("discovers data months and exports the displayed totals", () => {
  assert.deepEqual(getReportMonths(data.sessions, "2026-03"), [
    "2026-03",
    "2026-02",
    "2026-01",
  ]);

  const csv = createMonthlyReportCsv(
    aggregateMonthlyReport(data, "2026-02"),
  );
  const rows = csv.split("\r\n");

  assert.equal(rows.length, 4);
  assert.match(rows[1], /"Alex Tutor","Casey Student","North Site","2","1.5"/);
  assert.equal(rows.at(-1), '"2026-02","Grand total","","","3","2.25"');
});
