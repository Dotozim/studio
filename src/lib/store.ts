"use client"
import { create } from 'zustand';
import type { HabitEntry } from './types';
import { produce } from 'immer';

interface HabitState {
  entries: HabitEntry[];
  setHabitEntry: (entry: HabitEntry) => void;
}

const initialEntries: HabitEntry[] = [
    { date: '2024-07-01', habits: { BOB: { morning: 1 } }, social: { partner: 'Alice', count: 1 } },
    { date: '2024-07-03', habits: { FL: { afternoon: 1 } } },
    { date: '2024-07-04', habits: { BOB: { morning: 2 }, FL: { night: 1 } }, social: { partner: 'Bob', count: 1 } },
    { date: '2024-07-08', habits: { BOB: { morning: 1 } }, social: { partner: 'Alice', count: 1 } },
    { date: '2024-07-10', habits: { FL: { dawn: 1 } } },
    { date: '2024-07-12', habits: { BOB: { afternoon: 1 } } },
    { date: '2024-07-15', habits: { FL: { morning: 1 } }, social: { partner: 'Charlie', count: 1 } },
    { date: '2024-07-16', habits: { BOB: { night: 1 }, FL: { afternoon: 1 } }, social: { partner: 'Alice', count: 1 } },
    { date: '2024-07-20', habits: { BOB: { morning: 1 } } },
    { date: '2024-07-22', habits: { FL: { night: 1 } } },
    { date: '2024-07-25', habits: { BOB: { dawn: 1 } }, social: { partner: 'Bob', count: 1 } },
    { date: '2024-08-02', habits: { BOB: { morning: 1 }, FL: { afternoon: 2 } }, social: { partner: 'David', count: 1 } },
];


export const useHabitStore = create<HabitState>((set) => ({
  entries: initialEntries,
  setHabitEntry: (entry) => {
    set(
      produce((state: HabitState) => {
        const index = state.entries.findIndex((e) => e.date === entry.date);

        const hasHabits = Object.values(entry.habits).some(habitTimes => 
            habitTimes && Object.values(habitTimes).some(count => count && count > 0)
        );
        const hasSocial = entry.social && entry.social.count > 0;

        if (index !== -1) {
          // Entry exists, update it
          state.entries[index].habits = entry.habits;
          state.entries[index].social = entry.social;

          if (!hasHabits && !hasSocial) {
            // If no habits and no partner, remove the entry
            state.entries.splice(index, 1);
          }
        } else {
          // No entry exists, create a new one if it has data
          if (hasHabits || hasSocial) {
            state.entries.push(entry);
          }
        }
      })
    );
  },
}));
