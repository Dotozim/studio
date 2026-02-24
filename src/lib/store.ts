
"use client"
import { create } from 'zustand';
import { produce } from 'immer';
import type { LoggedHabit, OldHabitEntry, Habit, HabitType, TimeOfDay } from './types';
import { getDay, parseISO, set, startOfDay, format } from 'date-fns';

const HABIT_STORAGE_KEY = 'habit-cal-entries';

const computeHabitsByDay = (entries: LoggedHabit[]): Map<string, Set<HabitType>> => {
  const map = new Map<string, Set<HabitType>>();
  for (const entry of entries) {
    try {
      const dayKey = format(startOfDay(parseISO(entry.startTime)), "yyyy-MM-dd");
      if (!map.has(dayKey)) {
        map.set(dayKey, new Set());
      }
      map.get(dayKey)!.add(entry.type);
    } catch(e) {
      // ignore entries with invalid dates
    }
  }
  return map;
};

const computeEntriesByMonth = (entries: LoggedHabit[]): Map<string, LoggedHabit[]> => {
  const map = new Map<string, LoggedHabit[]>();
  for (const entry of entries) {
    try {
      const monthKey = format(parseISO(entry.startTime), "yyyy-MM");
      if (!map.has(monthKey)) {
        map.set(monthKey, []);
      }
      map.get(monthKey)!.push(entry);
    } catch (e) {
      // Ignore invalid date entries
    }
  }
  return map;
};


interface HabitState {
  entries: LoggedHabit[];
  habitsByDay: Map<string, Set<HabitType>>;
  entriesByMonth: Map<string, LoggedHabit[]>;
  isLoaded: boolean;
  addHabit: (habit: Omit<LoggedHabit, 'id'>) => void;
  deleteHabit: (id: string) => void;
  updateHabit: (id: string, updatedHabit: Partial<Omit<LoggedHabit, 'id'>>) => void;
  loadEntries: () => void;
}

const useHabitStore = create<HabitState>((set, get) => ({
  entries: [],
  habitsByDay: new Map(),
  entriesByMonth: new Map(),
  isLoaded: false,
  loadEntries: () => {
    try {
      const storedEntries = localStorage.getItem(HABIT_STORAGE_KEY);
      if (storedEntries) {
        const entries: LoggedHabit[] = JSON.parse(storedEntries);
        const habitsByDay = computeHabitsByDay(entries);
        const entriesByMonth = computeEntriesByMonth(entries);
        set({ entries, habitsByDay, entriesByMonth, isLoaded: true });
      } else {
        set({ isLoaded: true, entries: [], habitsByDay: new Map(), entriesByMonth: new Map() });
      }
    } catch (error) {
      console.error("Failed to load entries from localStorage", error);
      set({ isLoaded: true, entries: [], habitsByDay: new Map(), entriesByMonth: new Map() });
    }
  },
  addHabit: (habit) => {
    set(
      produce((state: HabitState) => {
        state.entries.push({ ...habit, id: crypto.randomUUID() });
        state.habitsByDay = computeHabitsByDay(state.entries);
        state.entriesByMonth = computeEntriesByMonth(state.entries);
        try {
          localStorage.setItem(HABIT_STORAGE_KEY, JSON.stringify(state.entries));
        } catch (error) {
          console.error("Failed to save entries to localStorage", error);
        }
      })
    );
  },
  deleteHabit: (id) => {
    set(
        produce((state: HabitState) => {
            const index = state.entries.findIndex(e => e.id === id);
            if (index !== -1) {
                state.entries.splice(index, 1);
                state.habitsByDay = computeHabitsByDay(state.entries);
                state.entriesByMonth = computeEntriesByMonth(state.entries);
                 try {
                    localStorage.setItem(HABIT_STORAGE_KEY, JSON.stringify(state.entries));
                } catch (error) {
                    console.error("Failed to save entries to localStorage", error);
                }
            }
        })
    );
  },
  updateHabit: (id, updatedHabit) => {
    set(
      produce((state: HabitState) => {
        const index = state.entries.findIndex(e => e.id === id);
        if (index !== -1) {
          state.entries[index] = { ...state.entries[index], ...updatedHabit };
          state.habitsByDay = computeHabitsByDay(state.entries);
          state.entriesByMonth = computeEntriesByMonth(state.entries);
          try {
            localStorage.setItem(HABIT_STORAGE_KEY, JSON.stringify(state.entries));
          } catch (error) {
            console.error("Failed to save entries to localStorage", error);
          }
        }
      })
    )
  }
}));

// Legacy store for import compatibility - will be removed later
export const useLegacyHabitStore = create<{
    entries: OldHabitEntry[],
    setHabitEntry: (entry: OldHabitEntry) => void,
}>((set) => ({
    entries: [],
    setHabitEntry: (entry) => {
        set(
          produce((state: { entries: OldHabitEntry[] }) => {
            const index = state.entries.findIndex((e) => e.date === entry.date);
            const hasHabits = Object.values(entry.habits).some(habitTimes => 
                habitTimes && Object.values(habitTimes).some(time => time && time.count && time.count > 0)
            );
            const hasSocial = entry.social && (entry.social.count > 0 || (entry.social.partners && entry.social.partners.length > 0));
            if (index !== -1) {
              if (hasHabits || hasSocial) {
                state.entries[index] = entry;
              } else {
                state.entries.splice(index, 1);
              }
            } else {
              if (hasHabits || hasSocial) {
                state.entries.push(entry);
              }
            }
          })
        );
      },
}));

export { useHabitStore };
