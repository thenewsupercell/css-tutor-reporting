import { localStorageRepository } from "@/lib/demo-data-repository";
import { createSeedData } from "@/lib/seed-data";
import type { DemoData } from "@/lib/types";

const serverSnapshot = createSeedData();
let snapshot = serverSnapshot;
let hasLoadedBrowserData = false;
const listeners = new Set<() => void>();

export function getServerSnapshot() {
  return serverSnapshot;
}

export function getSnapshot() {
  if (!hasLoadedBrowserData && typeof window !== "undefined") {
    snapshot = localStorageRepository.load() ?? snapshot;
    hasLoadedBrowserData = true;
  }
  return snapshot;
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function updateDemoData(updater: (current: DemoData) => DemoData) {
  snapshot = updater(getSnapshot());
  localStorageRepository.save(snapshot);
  listeners.forEach((listener) => listener());
}
