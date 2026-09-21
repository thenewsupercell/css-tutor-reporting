import type { DemoData } from "@/lib/types";

const STORAGE_KEY = "lvaep-demo-data-v1";

export interface DemoDataRepository {
  load(): DemoData | null;
  save(data: DemoData): void;
}

function isDemoData(value: unknown): value is DemoData {
  if (!value || typeof value !== "object") return false;

  const data = value as Partial<DemoData>;
  return (
    Array.isArray(data.tutors) &&
    Array.isArray(data.students) &&
    Array.isArray(data.assignments) &&
    Array.isArray(data.sessions) &&
    Array.isArray(data.goals)
  );
}

export const localStorageRepository: DemoDataRepository = {
  load() {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const parsed: unknown = JSON.parse(stored);
      return isDemoData(parsed) ? parsed : null;
    } catch {
      return null;
    }
  },
  save(data) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // The demo remains usable in memory when storage is unavailable.
    }
  },
};
