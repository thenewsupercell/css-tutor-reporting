"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import {
  addDemoSession,
  deleteDemoSession,
  getServerSnapshot,
  getSnapshot,
  loadDemoData,
  subscribe,
} from "@/lib/demo-data-store";
import type { DataStatus } from "@/lib/demo-data-store";
import type { DemoData, TutoringSession } from "@/lib/types";

interface DemoDataContextValue {
  data: DemoData;
  status: DataStatus;
  loadError: string | null;
  retryLoad: () => void;
  addSession: (session: TutoringSession) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
}

const DemoDataContext = createContext<DemoDataContextValue | null>(null);

export function DemoDataProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    void loadDemoData();
  }, []);

  const value = useMemo(
    () => ({
      ...snapshot,
      retryLoad: () => void loadDemoData(true),
      addSession: addDemoSession,
      deleteSession: deleteDemoSession,
    }),
    [snapshot],
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
