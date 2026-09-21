"use client";

import Link from "next/link";
import { useState } from "react";

import { useDemoData } from "@/components/demo-data-provider";
import type { TutoringSession } from "@/lib/types";

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function displayDate(date: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(`${date}T12:00:00`));
}

function displayDuration(minutes: number) {
  if (minutes % 60 === 0) return `${minutes / 60} hr`;
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} hr ${minutes % 60} min`;
}

function displayHours(minutes: number) {
  const hours = minutes / 60;
  return Number.isInteger(hours) ? String(hours) : hours.toFixed(1);
}

function MetricIcon({ type }: { type: "clock" | "calendar" | "people" | "goal" }) {
  const paths = {
    clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
    calendar: <><rect x="4" y="5.5" width="16" height="14.5" rx="2" /><path d="M8 3v5m8-5v5M4 10h16" /></>,
    people: <><path d="M15.5 20v-1.6c0-2.2-2-4-4.5-4s-4.5 1.8-4.5 4V20M11 11.2a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2ZM16 5a3 3 0 0 1 0 5.8m1.5 3c1.6.6 2.5 1.8 2.5 3.2v1" /></>,
    goal: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4" /><path d="m15 9 5-5m-1 0h1v1" /></>,
  };

  return <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">{paths[type]}</svg>;
}

function SessionRow({ session, studentName, tutorName, onDelete }: { session: TutoringSession; studentName: string; tutorName: string; onDelete: () => void }) {
  const initials = studentName.split(" ").map((part) => part[0]).join("").slice(0, 2);

  return (
    <li className="flex items-center gap-3 border-t border-slate-100 px-5 py-4 first:border-t-0 sm:px-6">
      <div className="grid size-10 shrink-0 place-items-center rounded-full bg-teal-50 text-xs font-bold text-teal-800">{initials}</div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">{studentName}</p>
        <p className="mt-0.5 truncate text-xs text-slate-500">{tutorName} · {displayDate(session.date)}</p>
      </div>
      <span className="shrink-0 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{displayDuration(session.durationMinutes)}</span>
      <button
        aria-label={`Delete ${studentName}'s session from ${displayDate(session.date)}`}
        className="grid size-8 shrink-0 place-items-center rounded-md text-slate-400 transition-colors hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
        onClick={onDelete}
        title="Delete session"
        type="button"
      >
        <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M4 7h16m-10 4v6m4-6v6M9 7l1-3h4l1 3m3 0-1 14H7L6 7" />
        </svg>
      </button>
    </li>
  );
}

export function Dashboard() {
  const { data, deleteSession } = useDemoData();
  const [statusMessage, setStatusMessage] = useState("");
  const now = new Date();
  const currentMonth = monthKey(now);

  const summary = (() => {
    const sessions = data.sessions.filter((session) => session.date.startsWith(currentMonth)).sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
    const minutes = sessions.reduce((total, session) => total + session.durationMinutes, 0);
    const activeStudents = data.students.filter((student) => student.status === "active");
    const activeStudentIds = new Set(activeStudents.map((student) => student.id));
    const relevantGoals = data.goals.filter((goal) => activeStudentIds.has(goal.studentId));
    const completedGoals = relevantGoals.filter((goal) => goal.status === "completed").length;
    const activity = sessions.slice(0, 5).map((session) => {
      const assignment = data.assignments.find((item) => item.id === session.assignmentId);
      return {
        session,
        studentName: data.students.find((student) => student.id === assignment?.studentId)?.name ?? "Unknown student",
        tutorName: data.tutors.find((tutor) => tutor.id === assignment?.tutorId)?.name ?? "Unknown tutor",
      };
    });
    const sites = Array.from(new Set(activeStudents.map((student) => student.tutoringSite))).map((site) => {
      const studentIds = new Set(activeStudents.filter((student) => student.tutoringSite === site).map((student) => student.id));
      const assignmentIds = new Set(data.assignments.filter((assignment) => studentIds.has(assignment.studentId)).map((assignment) => assignment.id));
      const siteMinutes = sessions.filter((session) => assignmentIds.has(session.assignmentId)).reduce((total, session) => total + session.durationMinutes, 0);
      return { site, students: studentIds.size, minutes: siteMinutes };
    }).sort((a, b) => b.minutes - a.minutes);

    return { sessions, minutes, activeStudents, relevantGoals, completedGoals, activity, sites };
  })();

  const monthLabel = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(now);
  const progress = summary.relevantGoals.length ? Math.round((summary.completedGoals / summary.relevantGoals.length) * 100) : 0;
  const metrics = [
    { label: "Tutoring hours", value: displayHours(summary.minutes), detail: `Across ${summary.sessions.length} sessions`, icon: "clock" as const },
    { label: "Sessions logged", value: String(summary.sessions.length), detail: `For ${monthLabel}`, icon: "calendar" as const },
    { label: "Active students", value: String(summary.activeStudents.length), detail: `Across ${summary.sites.length} tutoring sites`, icon: "people" as const },
    { label: "Goals completed", value: `${summary.completedGoals}/${summary.relevantGoals.length}`, detail: `${progress}% of active goals`, icon: "goal" as const },
  ];

  function confirmDelete(sessionId: string, studentName: string, date: string) {
    const confirmed = window.confirm(
      `Delete the ${displayDate(date)} session with ${studentName}? This cannot be undone.`,
    );
    if (!confirmed) return;

    deleteSession(sessionId);
    setStatusMessage(`Session with ${studentName} deleted.`);
  }

  return (
    <div className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8 sm:py-9 xl:px-12">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-teal-700"><span className="size-2 rounded-full bg-teal-500" />{monthLabel}</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-4xl">Program dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">A current view of tutoring activity, student participation, and goals.</p>
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <Link className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700" href="/sessions/new">
            <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
            Log session
          </Link>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <svg aria-hidden="true" className="size-4 text-teal-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m5 12 4 4L19 6" /></svg>
            Saved in this browser
          </div>
        </div>
      </header>

      <p aria-live="polite" className={`mt-5 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-900 ${statusMessage ? "block" : "hidden"}`}>{statusMessage}</p>

      <section aria-label="Monthly overview" className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]" key={metric.label}>
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium text-slate-600">{metric.label}</p>
              <div className="grid size-9 place-items-center rounded-lg bg-teal-50 text-teal-700"><MetricIcon type={metric.icon} /></div>
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950">{metric.value}</p>
            <p className="mt-1.5 text-xs text-slate-500">{metric.detail}</p>
          </article>
        ))}
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,1fr)]">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
            <div><h2 className="font-semibold text-slate-900">Recent activity</h2><p className="mt-1 text-xs text-slate-500">Latest sessions logged this month</p></div>
            <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">{summary.sessions.length} total</span>
          </div>
          {summary.activity.length ? (
            <ul>{summary.activity.map(({ session, studentName, tutorName }) => <SessionRow key={session.id} session={session} studentName={studentName} tutorName={tutorName} onDelete={() => confirmDelete(session.id, studentName, session.date)} />)}</ul>
          ) : (
            <div className="px-6 py-14 text-center"><p className="text-sm font-medium text-slate-700">No sessions logged this month</p><p className="mt-1 text-xs text-slate-500">New activity will appear here.</p></div>
          )}
        </section>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-1">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-6">
            <div className="flex items-center justify-between"><h2 className="font-semibold text-slate-900">Goal progress</h2><span className="text-sm font-semibold text-teal-700">{progress}%</span></div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-teal-600 transition-[width]" style={{ width: `${progress}%` }} /></div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{summary.completedGoals} of {summary.relevantGoals.length} goals for active students have been completed.</p>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-6">
            <h2 className="font-semibold text-slate-900">Tutoring sites</h2>
            <p className="mt-1 text-xs text-slate-500">Activity by location this month</p>
            <ul className="mt-4 space-y-4">
              {summary.sites.map((site) => (
                <li className="flex items-center justify-between gap-4" key={site.site}>
                  <div className="min-w-0"><p className="truncate text-sm font-medium text-slate-800">{site.site}</p><p className="mt-0.5 text-xs text-slate-500">{site.students} {site.students === 1 ? "student" : "students"}</p></div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-800">{displayHours(site.minutes)} hrs</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
