
"use client"
import { create } from 'zustand';
import { produce } from 'immer';
import type { LoggedHabit, Habit, HabitType, TimeOfDay } from './types';
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

interface HabitState {
  entries: LoggedHabit[];
  habitsByDay: Map<string, Set<HabitType>>;
  isLoaded: boolean;
  addHabit: (habit: Omit<LoggedHabit, 'id'>) => void;
  deleteHabit: (id: string) => void;
  updateHabit: (id: string, updatedHabit: Partial<Omit<LoggedHabit, 'id'>>) => void;
  loadEntries: () => void;
}

const useHabitStore = create<HabitState>((set, get) => ({
  entries: [],
  habitsByDay: new Map(),
  isLoaded: false,
  loadEntries: () => {
    try {
      const storedEntries = localStorage.getItem(HABIT_STORAGE_KEY);
      if (storedEntries) {
        const entries: LoggedHabit[] = JSON.parse(storedEntries);
        const habitsByDay = computeHabitsByDay(entries);
        set({ entries, habitsByDay, isLoaded: true });
      } else {
        set({ isLoaded: true, entries: [], habitsByDay: new Map() });
      }
    } catch (error) {
      console.error("Failed to load entries from localStorage", error);
      set({ isLoaded: true, entries: [], habitsByDay: new Map() });
    }
  },
  addHabit: (habit) => {
    set(
      produce((state: HabitState) => {
        state.entries.push({ ...habit, id: crypto.randomUUID() });
        state.habitsByDay = computeHabitsByDay(state.entries);
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

export { useHabitStore };
