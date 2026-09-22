import { supabaseRepository } from "@/lib/demo-data-repository";
import type { DemoData, GoalStatus, TutoringSession } from "@/lib/types";

export type DataStatus = "loading" | "ready" | "error";

export interface DemoDataSnapshot {
  data: DemoData;
  status: DataStatus;
  loadError: string | null;
}

const emptyData: DemoData = {
  tutors: [],
  students: [],
  assignments: [],
  sessions: [],
  goals: [],
};

const serverSnapshot: DemoDataSnapshot = {
  data: emptyData,
  status: "loading",
  loadError: null,
};

let snapshot = serverSnapshot;
let loadPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function messageFrom(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Could not connect to the shared database.";
}

export function getServerSnapshot() {
  return serverSnapshot;
}

export function getSnapshot() {
  return snapshot;
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function loadDemoData(force = false) {
  if (!force && snapshot.status === "ready") return Promise.resolve();
  if (loadPromise) return loadPromise;

  snapshot = { ...snapshot, status: "loading", loadError: null };
  emit();

  loadPromise = supabaseRepository
    .load()
    .then((data) => {
      snapshot = { data, status: "ready", loadError: null };
      emit();
    })
    .catch((error: unknown) => {
      snapshot = {
        ...snapshot,
        status: "error",
        loadError: messageFrom(error),
      };
      emit();
    })
    .finally(() => {
      loadPromise = null;
    });

  return loadPromise;
}

export async function addDemoSession(session: TutoringSession) {
  const savedSession = await supabaseRepository.addSession(session);
  snapshot = {
    ...snapshot,
    data: {
      ...snapshot.data,
      sessions: [savedSession, ...snapshot.data.sessions],
    },
  };
  emit();
}

export async function deleteDemoSession(sessionId: string) {
  await supabaseRepository.deleteSession(sessionId);
  snapshot = {
    ...snapshot,
    data: {
      ...snapshot.data,
      sessions: snapshot.data.sessions.filter(
        (session) => session.id !== sessionId,
      ),
    },
  };
  emit();
}

export async function updateDemoGoalStatus(
  goalId: string,
  status: GoalStatus,
) {
  const updatedGoal = await supabaseRepository.updateGoalStatus(goalId, status);
  snapshot = {
    ...snapshot,
    data: {
      ...snapshot.data,
      goals: snapshot.data.goals.map((goal) =>
        goal.id === goalId ? updatedGoal : goal,
      ),
    },
  };
  emit();
}
