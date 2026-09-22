"use client";

import { useState } from "react";

import { DataLoadError, DataLoading } from "@/components/data-state";
import { useDemoData } from "@/components/demo-data-provider";
import { getLocalDateKey } from "@/lib/date-utils";
import type { GoalCategory, GoalStatus } from "@/lib/types";

const categoryLabels: Record<GoalCategory, string> = {
  economic: "Economic",
  educational: "Educational",
  family: "Family",
  community: "Community",
  other: "Other",
};

const categoryStyles: Record<GoalCategory, string> = {
  economic: "bg-amber-50 text-amber-800",
  educational: "bg-blue-50 text-blue-800",
  family: "bg-violet-50 text-violet-800",
  community: "bg-teal-50 text-teal-800",
  other: "bg-slate-100 text-slate-700",
};

export function Students() {
  const { data, status, loadError, retryLoad, updateGoalStatus } = useDemoData();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [pendingGoalId, setPendingGoalId] = useState<string | null>(null);
  const [mutationMessage, setMutationMessage] = useState("");
  const [mutationFailed, setMutationFailed] = useState(false);

  if (status === "loading") {
    return <DataLoading label="Loading students and goals…" />;
  }

  if (status === "error") {
    return <DataLoadError message={loadError ?? "Could not connect to Supabase."} onRetry={retryLoad} />;
  }

  const today = getLocalDateKey();
  const studentViews = [...data.students]
    .sort(
      (a, b) =>
        Number(b.status === "active") - Number(a.status === "active") ||
        a.name.localeCompare(b.name),
    )
    .map((student) => {
      const assignments = data.assignments
        .filter((assignment) => assignment.studentId === student.id)
        .sort((a, b) => b.startDate.localeCompare(a.startDate));
      const assignment =
        assignments.find(
          (item) => !item.endDate || item.endDate >= today,
        ) ?? assignments[0];
      const goals = data.goals
        .filter((goal) => goal.studentId === student.id)
        .sort(
          (a, b) =>
            Number(a.status === "completed") -
              Number(b.status === "completed") ||
            a.title.localeCompare(b.title),
        );

      return {
        student,
        tutorName:
          data.tutors.find((tutor) => tutor.id === assignment?.tutorId)?.name ??
          "Unassigned",
        goals,
        completedGoals: goals.filter((goal) => goal.status === "completed").length,
      };
    });

  const selectedStudent =
    studentViews.find((item) => item.student.id === selectedStudentId) ??
    studentViews[0];
  const activeStudentCount = data.students.filter(
    (student) => student.status === "active",
  ).length;

  async function toggleGoal(goalId: string, nextStatus: GoalStatus) {
    setPendingGoalId(goalId);
    setMutationMessage("");

    try {
      await updateGoalStatus(goalId, nextStatus);
      setMutationFailed(false);
      setMutationMessage(
        nextStatus === "completed"
          ? "Goal marked complete."
          : "Goal marked incomplete.",
      );
    } catch (error) {
      setMutationFailed(true);
      setMutationMessage(
        error instanceof Error
          ? error.message
          : "The goal could not be updated. Please try again.",
      );
    } finally {
      setPendingGoalId(null);
    }
  }

  return (
    <div className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8 sm:py-9 xl:px-12">
      <header>
        <p className="text-sm font-semibold text-teal-700">Student assignments</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-4xl">Students</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          Review tutoring assignments and keep student goals up to date.
        </p>
      </header>

      <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 border-y border-slate-200 py-3 text-sm text-slate-600">
        <p><span className="font-semibold text-slate-900">{data.students.length}</span> total students</p>
        <p><span className="font-semibold text-slate-900">{activeStudentCount}</span> active</p>
        <p><span className="font-semibold text-slate-900">{data.goals.length}</span> goals</p>
      </div>

      {studentViews.length ? (
        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.85fr)] xl:items-start">
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]" aria-labelledby="student-list-heading">
            <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
              <h2 className="font-semibold text-slate-900" id="student-list-heading">Student overview</h2>
              <p className="mt-1 text-xs text-slate-500">Select a student to review their goals</p>
            </div>
            <ul className="divide-y divide-slate-100">
              {studentViews.map((view) => {
                const isSelected = view.student.id === selectedStudent?.student.id;
                return (
                  <li key={view.student.id}>
                    <button
                      aria-pressed={isSelected}
                      className={`w-full border-l-2 px-5 py-4 text-left transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-teal-700 sm:px-6 ${isSelected ? "border-l-teal-600 bg-teal-50/60" : "border-l-transparent hover:bg-slate-50"}`}
                      onClick={() => {
                        setSelectedStudentId(view.student.id);
                        setMutationMessage("");
                      }}
                      type="button"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-950">{view.student.name}</p>
                          <p className="mt-1 text-xs text-slate-500 sm:hidden">{view.student.tutoringSite}</p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${view.student.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                          {view.student.status}
                        </span>
                      </div>
                      <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                        <div><dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Tutor</dt><dd className="mt-1 truncate text-xs font-medium text-slate-700">{view.tutorName}</dd></div>
                        <div className="hidden sm:block"><dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Site</dt><dd className="mt-1 truncate text-xs font-medium text-slate-700">{view.student.tutoringSite}</dd></div>
                        <div><dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Goal progress</dt><dd className="mt-1 text-xs font-medium text-slate-700">{view.completedGoals} of {view.goals.length} complete</dd></div>
                      </dl>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          {selectedStudent && (
            <aside className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)] xl:sticky xl:top-6" aria-labelledby="student-goals-heading">
              <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-950" id="student-goals-heading">{selectedStudent.student.name}</h2>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{selectedStudent.student.tutoringSite} · {selectedStudent.tutorName}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${selectedStudent.student.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{selectedStudent.student.status}</span>
                </div>
                <p className="mt-4 text-sm font-medium text-slate-700">{selectedStudent.completedGoals} of {selectedStudent.goals.length} goals complete</p>
              </div>

              <p aria-live="polite" className={`mx-5 mt-4 rounded-lg border px-3 py-2.5 text-xs font-medium sm:mx-6 ${mutationFailed ? "border-red-200 bg-red-50 text-red-900" : "border-teal-200 bg-teal-50 text-teal-900"} ${mutationMessage ? "block" : "hidden"}`}>{mutationMessage}</p>

              {selectedStudent.goals.length ? (
                <ul className="divide-y divide-slate-100">
                  {selectedStudent.goals.map((goal) => {
                    const isCompleted = goal.status === "completed";
                    const isPending = pendingGoalId === goal.id;
                    return (
                      <li className="px-5 py-5 sm:px-6" key={goal.id}>
                        <div className="flex items-center justify-between gap-3">
                          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${categoryStyles[goal.category]}`}>{categoryLabels[goal.category]}</span>
                          <span className={`text-xs font-medium ${isCompleted ? "text-emerald-700" : "text-slate-500"}`}>{isCompleted ? "Completed" : "Incomplete"}</span>
                        </div>
                        <p className={`mt-3 text-sm font-medium leading-6 ${isCompleted ? "text-slate-500 line-through decoration-slate-300" : "text-slate-900"}`}>{goal.title}</p>
                        <button
                          aria-pressed={isCompleted}
                          className="mt-4 inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-wait disabled:opacity-50"
                          disabled={isPending}
                          onClick={() => void toggleGoal(goal.id, isCompleted ? "in_progress" : "completed")}
                          type="button"
                        >
                          <span className={`grid size-4 place-items-center rounded border ${isCompleted ? "border-teal-700 bg-teal-700 text-white" : "border-slate-400 bg-white"}`}>
                            {isCompleted && <svg aria-hidden="true" className="size-3" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" viewBox="0 0 16 16"><path d="m3 8 3 3 7-7" /></svg>}
                          </span>
                          {isPending ? "Saving…" : isCompleted ? "Mark incomplete" : "Mark complete"}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="px-6 py-12 text-center"><p className="text-sm font-medium text-slate-700">No goals recorded</p><p className="mt-1 text-xs text-slate-500">Goals for this student will appear here.</p></div>
              )}
            </aside>
          )}
        </div>
      ) : (
        <section className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <h2 className="font-semibold text-slate-900">No students found</h2>
          <p className="mt-2 text-sm text-slate-500">Student assignments will appear here once they are added.</p>
        </section>
      )}
    </div>
  );
}
