import { createContext, useContext, useState, type ReactNode } from 'react';

/**
 * Local-only "my schedule" state (competing + spectating session ids).
 * Not persisted anywhere yet — mirrors the prototype's top-level App state,
 * lifted into context so both the Schedule page and the sidebar badge can
 * read it.
 */
interface ScheduleContextValue {
  mySchedule: string[];
  setMySchedule: (ids: string[]) => void;
  spectating: string[];
  setSpectating: (ids: string[]) => void;
}

const ScheduleContext = createContext<ScheduleContextValue | undefined>(
  undefined,
);

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [mySchedule, setMySchedule] = useState<string[]>([]);
  const [spectating, setSpectating] = useState<string[]>([]);

  return (
    <ScheduleContext.Provider
      value={{ mySchedule, setMySchedule, spectating, setSpectating }}
    >
      {children}
    </ScheduleContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSchedule(): ScheduleContextValue {
  const ctx = useContext(ScheduleContext);
  if (ctx === undefined) {
    throw new Error('useSchedule must be used within ScheduleProvider');
  }
  return ctx;
}
