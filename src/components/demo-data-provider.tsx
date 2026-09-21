"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import {
  getServerSnapshot,
  getSnapshot,
  subscribe,
  updateDemoData,
} from "@/lib/demo-data-store";
import type { DemoData, TutoringSession } from "@/lib/types";

interface DemoDataContextValue {
  data: DemoData;
  updateData: (updater: (current: DemoData) => DemoData) => void;
  addSession: (session: TutoringSession) => void;
  deleteSession: (sessionId: string) => void;
}

const DemoDataContext = createContext<DemoDataContextValue | null>(null);

export function DemoDataProvider({ children }: { children: ReactNode }) {
  const data = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const value = useMemo(
    () => ({
      data,
      updateData: updateDemoData,
      addSession: (session: TutoringSession) =>
        updateDemoData((current) => ({
          ...current,
          sessions: [session, ...current.sessions],
        })),
      deleteSession: (sessionId: string) =>
        updateDemoData((current) => ({
          ...current,
          sessions: current.sessions.filter((session) => session.id !== sessionId),
        })),
    }),
    [data],
  );

  return (
    <DemoDataContext.Provider value={value}>
      {children}
    </DemoDataContext.Provider>
  );
}

export function useDemoData() {
  const context = useContext(DemoDataContext);
  if (!context) {
    throw new Error("useDemoData must be used within DemoDataProvider");
  }
  return context;
}
