"use client";

import Link from "next/link";
import { useState } from "react";

import { DataLoadError, DataLoading } from "@/components/data-state";
import { useDemoData } from "@/components/demo-data-provider";
import {
  aggregateMonthlyReport,
  createMonthlyReportCsv,
  formatReportHours,
  formatReportMonth,
  getMonthKey,
  getReportMonths,
} from "@/lib/report-aggregation";

function SummaryIcon({ type }: { type: "hours" | "sessions" | "students" | "tutors" }) {
  const paths = {
    hours: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
    sessions: <><rect x="4" y="5.5" width="16" height="14.5" rx="2" /><path d="M8 3v5m8-5v5M4 10h16" /></>,
    students: <><circle cx="10" cy="8" r="3.5" /><path d="M4.5 20v-1.5c0-2.5 2.5-4.5 5.5-4.5s5.5 2 5.5 4.5V20M16 6a3 3 0 0 1 0 5.8m1.2 2.3c1.7.6 2.8 1.9 2.8 3.4V19" /></>,
    tutors: <><circle cx="9" cy="8" r="3.5" /><path d="M3.5 20v-1.5C3.5 16 6 14 9 14s5.5 2 5.5 4.5V20m1-16.5 5 2.5-5 2.5L11 6l4.5-2.5Zm3 4.1V11" /></>,
  };

  return <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">{paths[type]}</svg>;
}

export function MonthlyReports() {
  const { data, status, loadError, retryLoad } = useDemoData();
  const currentMonth = getMonthKey();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [downloadMessage, setDownloadMessage] = useState("");

  if (status === "loading") {
    return <DataLoading label="Loading monthly reports…" />;
  }

  if (status === "error") {
    return <DataLoadError message={loadError ?? "Could not connect to Supabase."} onRetry={retryLoad} />;
  }

  const reportMonths = getReportMonths(data.sessions, currentMonth);
  const report = aggregateMonthlyReport(data, selectedMonth);
  const hasSessions = report.totals.sessionCount > 0;

  const summary = [
    { label: "Tutoring hours", value: formatReportHours(report.totals.totalMinutes), icon: "hours" as const },
    { label: "Sessions", value: String(report.totals.sessionCount), icon: "sessions" as const },
    { label: "Students tutored", value: String(report.totals.studentCount), icon: "students" as const },
    { label: "Tutors reporting", value: String(report.totals.tutorCount), icon: "tutors" as const },
  ];

  function downloadCsv() {
    if (!hasSessions) return;

    const csv = createMonthlyReportCsv(report);
    const url = URL.createObjectURL(
      new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `lvaep-monthly-report-${selectedMonth}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setDownloadMessage(`${formatReportMonth(selectedMonth)} report downloaded.`);
  }

  return (
    <div className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8 sm:py-9 xl:px-12">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-teal-700">Program reporting</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-4xl">Monthly reports</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">Review tutoring activity by tutor and student, then export the same totals for administrative use.</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div>
            <label className="text-xs font-semibold text-slate-600" htmlFor="report-month">Reporting month</label>
            <select
              className="mt-1.5 h-10 min-w-52 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
              id="report-month"
              onChange={(event) => {
                setSelectedMonth(event.target.value);
                setDownloadMessage("");
              }}
              value={selectedMonth}
            >
              {reportMonths.map((month) => <option key={month} value={month}>{formatReportMonth(month)}</option>)}
            </select>
          </div>
          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={!hasSessions}
            onClick={downloadCsv}
            type="button"
          >
            <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 3v12m-4-4 4 4 4-4M5 20h14" /></svg>
            Download CSV
          </button>
        </div>
      </header>

      <p aria-live="polite" className="mt-3 min-h-5 text-right text-xs font-medium text-teal-700">{downloadMessage}</p>

      <section aria-label={`${formatReportMonth(selectedMonth)} summary`} className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => (
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]" key={item.label}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-600">{item.label}</p>
              <div className="grid size-9 place-items-center rounded-lg bg-teal-50 text-teal-700"><SummaryIcon type={item.icon} /></div>
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950">{item.value}</p>
          </article>
        ))}
      </section>

      {hasSessions ? (
        <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
            <h2 className="font-semibold text-slate-900">{formatReportMonth(selectedMonth)} activity</h2>
            <p className="mt-1 text-xs text-slate-500">Grouped by tutor and student</p>
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <caption className="sr-only">Tutoring activity for {formatReportMonth(selectedMonth)}</caption>
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3" scope="col">Tutor</th>
                  <th className="px-6 py-3" scope="col">Student</th>
                  <th className="px-6 py-3" scope="col">Tutoring site</th>
                  <th className="px-6 py-3 text-right" scope="col">Sessions</th>
                  <th className="px-6 py-3 text-right" scope="col">Hours</th>
                </tr>
              </thead>
              {report.tutorGroups.map((group) => (
                <tbody className="border-t border-slate-200 first:border-t-0" key={group.tutorId}>
                  {group.students.map((student, index) => (
                    <tr className="border-t border-slate-100 first:border-t-0" key={`${group.tutorId}-${student.studentId}-${student.tutoringSite}`}>
                      {index === 0 && (
                        <th className="w-1/5 px-6 py-4 align-top text-sm font-semibold text-slate-900" rowSpan={group.students.length} scope="rowgroup">
                          {group.tutorName}
                          <span className="mt-1 block text-xs font-normal text-slate-500">{group.sessionCount} {group.sessionCount === 1 ? "session" : "sessions"}</span>
                        </th>
                      )}
                      <th className="px-6 py-4 text-sm font-medium text-slate-800" scope="row">{student.studentName}</th>
                      <td className="px-6 py-4 text-sm text-slate-600">{student.tutoringSite}</td>
                      <td className="px-6 py-4 text-right text-sm tabular-nums text-slate-700">{student.sessionCount}</td>
                      <td className="px-6 py-4 text-right text-sm font-semibold tabular-nums text-slate-900">{formatReportHours(student.totalMinutes)}</td>
                    </tr>
                  ))}
                </tbody>
              ))}
              <tfoot className="border-t-2 border-slate-300 bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-950" colSpan={3} scope="row">Grand total</th>
                  <td className="px-6 py-4 text-right text-sm font-semibold tabular-nums text-slate-950">{report.totals.sessionCount}</td>
                  <td className="px-6 py-4 text-right text-sm font-semibold tabular-nums text-slate-950">{formatReportHours(report.totals.totalMinutes)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="divide-y divide-slate-200 md:hidden">
            {report.tutorGroups.map((group) => (
              <div key={group.tutorId}>
                <div className="flex items-center justify-between bg-slate-50 px-5 py-3">
                  <h3 className="text-sm font-semibold text-slate-900">{group.tutorName}</h3>
                  <span className="text-xs font-medium text-slate-500">{formatReportHours(group.totalMinutes)} hrs</span>
                </div>
                <ul className="divide-y divide-slate-100">
                  {group.students.map((student) => (
                    <li className="px-5 py-4" key={`${group.tutorId}-${student.studentId}-${student.tutoringSite}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0"><p className="text-sm font-semibold text-slate-900">{student.studentName}</p><p className="mt-1 text-xs leading-5 text-slate-500">{student.tutoringSite}</p></div>
                        <p className="shrink-0 text-sm font-semibold tabular-nums text-slate-900">{formatReportHours(student.totalMinutes)} hrs</p>
                      </div>
                      <p className="mt-2 text-xs text-slate-500">{student.sessionCount} {student.sessionCount === 1 ? "session" : "sessions"}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="flex items-center justify-between bg-slate-100 px-5 py-4">
              <div><p className="text-sm font-semibold text-slate-950">Grand total</p><p className="mt-0.5 text-xs text-slate-600">{report.totals.sessionCount} sessions</p></div>
              <p className="text-base font-semibold tabular-nums text-slate-950">{formatReportHours(report.totals.totalMinutes)} hrs</p>
            </div>
          </div>
        </section>
      ) : (
        <section className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-slate-100 text-slate-500">
            <svg aria-hidden="true" className="size-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M5 3h14a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm3 13v-3m4 3V8m4 8v-5" /></svg>
          </div>
          <h2 className="mt-4 font-semibold text-slate-900">No sessions recorded for {formatReportMonth(selectedMonth)}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Choose another reporting month or log a session to begin this month&apos;s report.</p>
          <Link className="mt-5 inline-flex rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700" href="/sessions/new">Log a session</Link>
        </section>
      )}
    </div>
  );
}
