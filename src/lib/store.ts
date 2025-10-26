"use client"
import { create } from 'zustand';
import type { HabitEntry, HabitTime } from './types';
import { produce } from 'immer';

interface HabitState {
  entries: HabitEntry[];
  setHabitEntry: (entry: HabitEntry) => void;
}

const initialEntries: HabitEntry[] = [
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


export const useHabitStore = create<HabitState>((set) => ({
  entries: initialEntries,
  setHabitEntry: (entry) => {
    set(
      produce((state: HabitState) => {
        const index = state.entries.findIndex((e) => e.date === entry.date);

        const hasHabits = Object.values(entry.habits).some(habitTimes => 
            habitTimes && Object.values(habitTimes).some(time => time && time.count && time.count > 0)
        );
        const hasSocial = entry.social && (entry.social.count > 0 || (entry.social.partners && entry.social.partners.length > 0));

        if (index !== -1) {
          // Entry exists, update it
          if (hasHabits || hasSocial) {
            state.entries[index] = entry;
          } else {
            // If no habits and no social, remove the entry
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
