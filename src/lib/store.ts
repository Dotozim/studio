"use client"
import { create } from 'zustand';
import { produce } from 'immer';
import type { LoggedHabit, OldHabitEntry, Habit, HabitType, TimeOfDay } from './types';
import { getDay, parseISO, set, startOfDay } from 'date-fns';

interface HabitState {
  entries: LoggedHabit[];
  addHabit: (habit: Omit<LoggedHabit, 'id'>) => void;
  deleteHabit: (id: string) => void;
}

// This is a helper to get a plausible start time from the old data structure
const getTimeOfDayDate = (date: Date, time: TimeOfDay): Date => {
    switch (time) {
        case 'dawn': return set(date, { hours: 5, minutes: 0, seconds: 0 });
        case 'morning': return set(date, { hours: 9, minutes: 0, seconds: 0 });
        case 'afternoon': return set(date, { hours: 14, minutes: 0, seconds: 0 });
        case 'night': return set(date, { hours: 21, minutes: 0, seconds: 0 });
        default: return date;
    }
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
                                startTime: getTimeOfDayDate(entryDate, time as TimeOfDay).toISOString(),
                                duration: (timeData.duration || 0) / timeData.count,
                            });
                        }
                    }
                }
            }
        }

        // Migrate social
        if (oldEntry.social && oldEntry.social.count > 0) {
            const socialTimes = oldEntry.social.times;
            if (socialTimes) {
                 for (const time in socialTimes) {
                    const timeData = socialTimes[time as TimeOfDay];
                    if (timeData) {
                         for (let i = 0; i < timeData.count; i++) {
                            newEntries.push({
                                id: `migrated-${idCounter++}`,
                                type: 'SOCIAL',
                                startTime: getTimeOfDayDate(entryDate, time as TimeOfDay).toISOString(),
                                duration: (timeData.duration || 0) / timeData.count,
                                partners: oldEntry.social.partners || [],
                            });
                        }
                    }
                 }
            } else {
                 // If no specific times, create a 'not-sure' entry
                 newEntries.push({
                     id: `migrated-${idCounter++}`,
                     type: 'SOCIAL',
                     startTime: getTimeOfDayDate(entryDate, 'not-sure').toISOString(),
                     duration: 0,
                     partners: oldEntry.social.partners || [],
                 });
            }
        }
    });

    return newEntries;
}


const initialOldEntries: OldHabitEntry[] = [
    { date: '2024-07-01', habits: { BOB: { morning: { count: 1, duration: 300 } } }, social: { partners: ['Alice'], count: 1, times: { morning: { count: 1, duration: 300 } } } },
    { date: '2024-07-03', habits: { FL: { afternoon: { count: 1, duration: 600 } } } },
    { date: '2024-07-04', habits: { BOB: { morning: { count: 2, duration: 600 } }, FL: { night: { count: 1, duration: 120 } } }, social: { partners: ['Bob'], count: 1, times: { night: { count: 1, duration: 120 } } } },
    { date: '2024-07-08', habits: { BOB: { morning: { count: 1, duration: 240 } } }, social: { partners: ['Alice'], count: 1, times: { morning: { count: 1, duration: 240 } } } },
    { date: '2024-07-10', habits: { FL: { dawn: { count: 1, duration: 180 } } } },
    { date: '2024-07-12', habits: { BOB: { afternoon: { count: 1, duration: 420 } } } },
    { date: '2024-07-15', habits: { FL: { morning: { count: 1, duration: 900 } } }, social: { partners: ['Charlie'], count: 1, times: { 'not-sure': { count: 1, duration: 900 } } } },
    { date: '2024-07-16', habits: { BOB: { night: { count: 1, duration: 360 } }, FL: { afternoon: { count: 1, duration: 1800 } } }, social: { partners: ['Alice'], count: 1, times: { afternoon: { count: 1, duration: 1800 } } } },
    { date: '2024-07-20', habits: { BOB: { morning: { count: 1, duration: 300 } } } },
    { date: '2024-07-22', habits: { FL: { night: { count: 1, duration: 720 } } } },
    { date: '2024-07-25', habits: { BOB: { dawn: { count: 1, duration: 120 } } }, social: { partners: ['Bob'], count: 1, times: { dawn: { count: 1, duration: 120 } } } },
    { date: '2024-08-02', habits: { BOB: { morning: { count: 1, duration: 300 } }, FL: { afternoon: { count: 2, duration: 1200 } } }, social: { partners: ['David'], count: 1, times: { 'not-sure': { count: 1, duration: 1500 } } } },
];

const migratedInitialEntries = migrateData(initialOldEntries);

export const useHabitStore = create<HabitState>((set) => ({
  entries: migratedInitialEntries,
  addHabit: (habit) => {
    set(
      produce((state: HabitState) => {
        state.entries.push({ ...habit, id: crypto.randomUUID() });
      })
    );
  },
  deleteHabit: (id) => {
    set(
        produce((state: HabitState) => {
            const index = state.entries.findIndex(e => e.id === id);
            if (index !== -1) {
                state.entries.splice(index, 1);
            }
        })
    );
  }
}));

// Legacy store for import compatibility - will be removed later
export const useLegacyHabitStore = create<{
    entries: OldHabitEntry[],
    setHabitEntry: (entry: OldHabitEntry) => void,
}>((set) => ({
    entries: initialOldEntries,
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
