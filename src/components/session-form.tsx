"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";

import { DataLoadError, DataLoading } from "@/components/data-state";
import { useDemoData } from "@/components/demo-data-provider";
import { getLocalDateKey } from "@/lib/date-utils";
import { FIXED_DEMO_TUTOR_ID } from "@/lib/demo-config";

const durationPresets = [
  { label: "30 min", hours: "0.5" },
  { label: "1 hour", hours: "1" },
  { label: "1.5 hours", hours: "1.5" },
  { label: "2 hours", hours: "2" },
];

interface FormErrors {
  student?: string;
  date?: string;
  duration?: string;
}

interface SavedSession {
  studentName: string;
  date: string;
  durationMinutes: number;
}

function formatFullDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining ? `${hours} hr ${remaining} min` : `${hours} ${hours === 1 ? "hour" : "hours"}`;
}

export function SessionForm() {
  const { data, status, loadError, retryLoad, addSession } = useDemoData();
  const today = getLocalDateKey();
  const [studentId, setStudentId] = useState("");
  const [date, setDate] = useState(today);
  const [duration, setDuration] = useState("1");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [savedSession, setSavedSession] = useState<SavedSession | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const submitErrorRef = useRef<HTMLDivElement>(null);

  if (status === "loading") {
    return <DataLoading label="Loading tutor assignments…" />;
  }

  if (status === "error") {
    return <DataLoadError message={loadError ?? "Could not connect to Supabase."} onRetry={retryLoad} />;
  }

  const tutor = data.tutors.find((item) => item.id === FIXED_DEMO_TUTOR_ID);
  const eligibleAssignments = data.assignments.filter(
    (assignment) =>
      assignment.tutorId === FIXED_DEMO_TUTOR_ID &&
      assignment.startDate <= today &&
      (!assignment.endDate || assignment.endDate >= today) &&
      data.students.some(
        (student) =>
          student.id === assignment.studentId && student.status === "active",
      ),
  ).sort((a, b) => b.startDate.localeCompare(a.startDate));
  const eligibleStudents = Array.from(
    new Map(
      eligibleAssignments.map((assignment) => {
        const student = data.students.find(
          (item) => item.id === assignment.studentId,
        );
        return [assignment.studentId, student] as const;
      }),
    ).values(),
  )
    .filter((student) => student !== undefined)
    .sort((a, b) => a.name.localeCompare(b.name));

  function clearFieldError(field: keyof FormErrors) {
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FormErrors = {};
    const assignment = eligibleAssignments.find(
      (item) => item.studentId === studentId,
    );
    const hours = Number(duration);
    const durationMinutes = Math.round(hours * 60);

    if (!studentId || !assignment) {
      nextErrors.student = "Choose one of your active assigned students.";
    }
    if (!date) {
      nextErrors.date = "Enter the session date.";
    } else if (date > today) {
      nextErrors.date = "Session date cannot be in the future.";
    }
    if (!duration.trim() || !Number.isFinite(hours)) {
      nextErrors.duration = "Enter the tutoring duration.";
    } else if (hours <= 0) {
      nextErrors.duration = "Duration must be greater than zero.";
    } else if (durationMinutes < 15) {
      nextErrors.duration = "Duration must be at least 15 minutes.";
    } else if (durationMinutes > 480) {
      nextErrors.duration = "Duration cannot exceed 8 hours.";
    }

    if (Object.keys(nextErrors).length > 0 || !assignment) {
      setErrors(nextErrors);
      requestAnimationFrame(() => errorSummaryRef.current?.focus());
      return;
    }

    const student = data.students.find((item) => item.id === studentId);
    setSubmitError("");
    setIsSaving(true);

    try {
      await addSession({
        id: crypto.randomUUID(),
        assignmentId: assignment.id,
        date,
        durationMinutes,
        notes: notes.trim() || undefined,
        createdAt: new Date().toISOString(),
      });
      setErrors({});
      setSavedSession({
        studentName: student?.name ?? "Student",
        date,
        durationMinutes,
      });
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "The session could not be saved. Please try again.",
      );
      requestAnimationFrame(() => submitErrorRef.current?.focus());
    } finally {
      setIsSaving(false);
    }
  }

  if (savedSession) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8 sm:py-16">
        <div className="rounded-2xl border border-teal-200 bg-white p-7 text-center shadow-[0_12px_36px_rgba(15,23,42,0.07)] sm:p-10" role="status">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-teal-100 text-teal-700">
            <svg aria-hidden="true" className="size-7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
              <path d="m5 12 4 4L19 6" />
            </svg>
          </div>
          <h1 className="mt-5 text-2xl font-semibold tracking-[-0.025em] text-slate-950">Session logged</h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
            {formatDuration(savedSession.durationMinutes)} with {savedSession.studentName} on {formatFullDate(savedSession.date)} was saved to the shared database.
          </p>
          <div className="mt-7 flex flex-col-reverse justify-center gap-3 sm:flex-row">
            <button
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
              onClick={() => {
                setStudentId("");
                setDate(today);
                setDuration("1");
                setNotes("");
                setSavedSession(null);
              }}
              type="button"
            >
              Log another session
            </button>
            <Link className="rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700" href="/">
              View updated dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-7 sm:px-8 sm:py-10 xl:px-12">
      <header>
        <p className="text-sm font-semibold text-teal-700">Session reporting</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-4xl">Log a tutoring session</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">Record the time you spent with a student. Fields marked with an asterisk are required.</p>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
        <form aria-busy={isSaving} className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-7" noValidate onSubmit={handleSubmit}>
          {submitError && (
            <div ref={submitErrorRef} className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 focus:outline-none" role="alert" tabIndex={-1}>
              <p className="text-sm font-semibold text-red-900">Session not saved</p>
              <p className="mt-1 text-sm leading-5 text-red-800">{submitError}</p>
            </div>
          )}

          {Object.keys(errors).length > 0 && (
            <div ref={errorSummaryRef} className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 focus:outline-none" role="alert" tabIndex={-1}>
              <p className="text-sm font-semibold text-red-900">Please correct the following:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-800">
                {errors.student && <li><a className="underline underline-offset-2" href="#student">{errors.student}</a></li>}
                {errors.date && <li><a className="underline underline-offset-2" href="#session-date">{errors.date}</a></li>}
                {errors.duration && <li><a className="underline underline-offset-2" href="#duration">{errors.duration}</a></li>}
              </ul>
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-slate-800" htmlFor="student">Student <span aria-hidden="true" className="text-red-600">*</span></label>
            <select
              aria-describedby={errors.student ? "student-error" : "student-help"}
              aria-invalid={Boolean(errors.student)}
              className={`mt-2 w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-teal-700/20 ${errors.student ? "border-red-400 focus:border-red-500" : "border-slate-300 focus:border-teal-700"}`}
              id="student"
              name="student"
              onChange={(event) => {
                setStudentId(event.target.value);
                clearFieldError("student");
              }}
              required
              value={studentId}
            >
              <option value="">{eligibleStudents.length ? "Select a student" : "No active assigned students"}</option>
              {eligibleStudents.map((student) => <option key={student.id} value={student.id}>{student.name} — {student.tutoringSite}</option>)}
            </select>
            <p className={`mt-1.5 text-xs ${errors.student ? "text-red-700" : "text-slate-500"}`} id={errors.student ? "student-error" : "student-help"}>{errors.student ?? "Only active students currently assigned to you are shown."}</p>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-slate-800" htmlFor="session-date">Date <span aria-hidden="true" className="text-red-600">*</span></label>
              <input
                aria-describedby={errors.date ? "date-error" : undefined}
                aria-invalid={Boolean(errors.date)}
                className={`mt-2 w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-teal-700/20 ${errors.date ? "border-red-400 focus:border-red-500" : "border-slate-300 focus:border-teal-700"}`}
                id="session-date"
                max={today}
                name="date"
                onChange={(event) => {
                  setDate(event.target.value);
                  clearFieldError("date");
                }}
                required
                type="date"
                value={date}
              />
              {errors.date && <p className="mt-1.5 text-xs text-red-700" id="date-error">{errors.date}</p>}
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-800" htmlFor="duration">Duration in hours <span aria-hidden="true" className="text-red-600">*</span></label>
              <div className="relative mt-2">
                <input
                  aria-describedby={errors.duration ? "duration-error" : "duration-help"}
                  aria-invalid={Boolean(errors.duration)}
                  className={`w-full rounded-lg border bg-white px-3.5 py-2.5 pr-16 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-teal-700/20 ${errors.duration ? "border-red-400 focus:border-red-500" : "border-slate-300 focus:border-teal-700"}`}
                  id="duration"
                  inputMode="decimal"
                  max="8"
                  min="0.25"
                  name="duration"
                  onChange={(event) => {
                    setDuration(event.target.value);
                    clearFieldError("duration");
                  }}
                  required
                  step="0.25"
                  type="number"
                  value={duration}
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-medium text-slate-500">hours</span>
              </div>
              <p className={`mt-1.5 text-xs ${errors.duration ? "text-red-700" : "text-slate-500"}`} id={errors.duration ? "duration-error" : "duration-help"}>{errors.duration ?? "For example, enter 1.5 for 1 hour 30 minutes."}</p>
            </div>
          </div>

          <fieldset className="mt-4">
            <legend className="text-xs font-medium text-slate-600">Quick duration</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {durationPresets.map((preset) => (
                <button
                  aria-pressed={duration === preset.hours}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${duration === preset.hours ? "border-teal-700 bg-teal-50 text-teal-800" : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"}`}
                  key={preset.hours}
                  onClick={() => {
                    setDuration(preset.hours);
                    clearFieldError("duration");
                  }}
                  type="button"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="mt-6">
            <div className="flex items-baseline justify-between gap-4">
              <label className="text-sm font-semibold text-slate-800" htmlFor="notes">Notes <span className="font-normal text-slate-500">(optional)</span></label>
              <span className="text-xs text-slate-400">{notes.length}/500</span>
            </div>
            <textarea
              className="mt-2 min-h-28 w-full resize-y rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
              id="notes"
              maxLength={500}
              name="notes"
              onChange={(event) => setNotes(event.target.value)}
              placeholder="What did you work on? Add any useful context for staff."
              value={notes}
            />
          </div>

          <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
            <Link className="rounded-lg px-4 py-2.5 text-center text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700" href="/">Cancel</Link>
            <button className="rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300" disabled={isSaving || eligibleStudents.length === 0} type="submit">{isSaving ? "Saving…" : "Save session"}</button>
          </div>
        </form>

        <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Logging as</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-full bg-amber-100 text-xs font-bold text-amber-800">EM</div>
            <div><p className="text-sm font-semibold text-slate-900">{tutor?.name ?? "Demo tutor"}</p><p className="mt-0.5 text-xs text-slate-500">{eligibleStudents.length} active assignments</p></div>
          </div>
          <div className="mt-5 border-t border-slate-100 pt-4">
            <p className="flex gap-2 text-xs leading-5 text-slate-500">
              <svg aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-teal-600" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-10v6m0-10h.01" /></svg>
              Your entry is saved to the shared database and will appear on the dashboard immediately.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
