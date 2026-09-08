"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { mockSnapshot } from "@/lib/data/mock";
import type { AcademicEvent, AcademicSnapshot, AssignmentStatus } from "@/lib/types";

const STORAGE_KEY = "gow-academic-overrides";
const EVENTS_STORAGE_KEY = "gow-calendar-events";

type AcademicContextValue = {
  data: AcademicSnapshot;
  setAssignmentStatus: (id: string, status: AssignmentStatus) => void;
  toggleReading: (id: string) => void;
  setScoreOverride: (id: string, score: number) => void;
  addEvent: (event: Omit<AcademicEvent, "id">) => void;
  scoreOverrides: Record<string, number>;
};

const AcademicContext = createContext<AcademicContextValue | null>(null);

function loadStatusOverrides(): Record<string, AssignmentStatus> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw).statuses ?? {} : {};
  } catch {
    return {};
  }
}

function loadLocalEvents(): AcademicEvent[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(EVENTS_STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function AcademicProvider({ children }: { children: ReactNode }) {
  const [statuses, setStatuses] = useState<Record<string, AssignmentStatus>>(
    loadStatusOverrides,
  );
  const [readings, setReadings] = useState<Record<string, boolean>>({});
  const [scoreOverrides, setScoreOverrides] = useState<Record<string, number>>(
    {},
  );
  const [remoteData, setRemoteData] = useState<AcademicSnapshot | null>(null);
  const [localEvents, setLocalEvents] = useState<AcademicEvent[]>(loadLocalEvents);

  useEffect(() => {
    let active = true;
    fetch("/api/academic")
      .then((response) => (response.ok ? response.json() : null))
      .then((snapshot: AcademicSnapshot | null) => {
        if (active && snapshot) setRemoteData(snapshot);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const data = useMemo(() => {
    const source = remoteData ?? mockSnapshot;
    return {
      ...source,
      events: [...source.events, ...localEvents],
      assignments: source.assignments.map((item) =>
        statuses[item.id] ? { ...item, status: statuses[item.id] } : item,
      ),
      readings: source.readings.map((item) =>
        readings[item.id] != null
          ? { ...item, completed: readings[item.id] }
          : item,
      ),
    };
  }, [remoteData, localEvents, statuses, readings]);

  const value = useMemo<AcademicContextValue>(
    () => ({
      data,
      scoreOverrides,
      setAssignmentStatus(id, status) {
        setStatuses((prev) => {
          const next = { ...prev, [id]: status };
          try {
            window.localStorage.setItem(
              STORAGE_KEY,
              JSON.stringify({ statuses: next }),
            );
          } catch {
            /* ignore quota */
          }
          return next;
        });
      },
      toggleReading(id) {
        setReadings((prev) => ({ ...prev, [id]: !(prev[id] ?? data.readings.find((r) => r.id === id)?.completed) }));
      },
      setScoreOverride(id, score) {
        setScoreOverrides((prev) => ({ ...prev, [id]: score }));
      },
      addEvent(event) {
        setLocalEvents((prev) => {
          const next = [...prev, { ...event, id: `local-event-${Date.now()}` }];
          try {
            window.localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(next));
          } catch {
            /* ignore quota */
          }
          return next;
        });
      },
    }),
    [data, scoreOverrides],
  );

  return (
    <AcademicContext.Provider value={value}>{children}</AcademicContext.Provider>
  );
}

export function useAcademic() {
  const ctx = useContext(AcademicContext);
  if (!ctx) throw new Error("useAcademic must be used within AcademicProvider");
  return ctx;
}
