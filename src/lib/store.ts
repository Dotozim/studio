
"use client"
import { create } from 'zustand';
import { produce } from 'immer';
import type { LoggedHabit, OldHabitEntry, Habit, HabitType, TimeOfDay } from './types';
import { getDay, parseISO, set, startOfDay } from 'date-fns';

const HABIT_STORAGE_KEY = 'habit-cal-entries';

interface HabitState {
  entries: LoggedHabit[];
  isLoaded: boolean;
  addHabit: (habit: Omit<LoggedHabit, 'id'>) => void;
  deleteHabit: (id: string) => void;
  loadEntries: () => void;
}

// This function migrates the old data structure to the new one.
const migrateData = (oldEntries: OldHabitEntry[]): LoggedHabit[] => {
    const newEntries: LoggedHabit[] = [];
    let idCounter = 0;

    oldEntries.forEach(oldEntry => {
        const entryDate = parseISO(oldEntry.date);

        // Migrate habits
        for (const habitName in oldEntry.habits) {
            const habitTimes = oldEntry.habits[habitName as Habit];
            if (habitTimes) {
                for (const time in habitTimes) {
                    const timeData = habitTimes[time as TimeOfDay];
                    if (timeData) {
                        for (let i = 0; i < timeData.count; i++) {
                            newEntries.push({
                                id: `migrated-${idCounter++}`,
                                type: habitName as Habit,
                                startTime: new Date().toISOString(),
                                duration: (timeData.duration || 0) / timeData.count,
                            });
                        }
                    }
                }
            }
        }
    });

    return newEntries;
}

const useHabitStore = create<HabitState>((set, get) => ({
  entries: [],
  isLoaded: false,
  loadEntries: () => {
    try {
      const storedEntries = localStorage.getItem(HABIT_STORAGE_KEY);
      if (storedEntries) {
        set({ entries: JSON.parse(storedEntries), isLoaded: true });
      } else {
        set({ isLoaded: true });
      }
    } catch (error) {
      console.error("Failed to load entries from localStorage", error);
      set({ isLoaded: true });
    }
  },
  addHabit: (habit) => {
    set(
      produce((state: HabitState) => {
        state.entries.push({ ...habit, id: crypto.randomUUID() });
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
                 try {
                    localStorage.setItem(HABIT_STORAGE_KEY, JSON.stringify(state.entries));
                } catch (error) {
                    console.error("Failed to save entries to localStorage", error);
                }
            }
        })
    );
  }
}));

// This effect will run once on client mount to load the data
if (typeof window !== 'undefined') {
    useHabitStore.getState().loadEntries();
}


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
