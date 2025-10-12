"use client"
import { create } from 'zustand';
import type { Habit, HabitEntry } from './types';
import { produce } from 'immer';

interface HabitState {
  entries: HabitEntry[];
  setHabitEntry: (entry: HabitEntry) => void;
}

const initialEntries: HabitEntry[] = [
    { date: '2024-07-01', habits: { BOB: 1 }, partner: 'Alice' },
    { date: '2024-07-03', habits: { FL: 1 } },
    { date: '2024-07-04', habits: { BOB: 2, FL: 1 }, partner: 'Bob' },
    { date: '2024-07-08', habits: { BOB: 1 }, partner: 'Alice' },
    { date: '2024-07-10', habits: { FL: 1 } },
    { date: '2024-07-12', habits: { BOB: 1 } },
    { date: '2024-07-15', habits: { FL: 1 }, partner: 'Charlie' },
    { date: '2024-07-16', habits: { BOB: 1, FL: 1 }, partner: 'Alice' },
    { date: '2024-07-20', habits: { BOB: 1 } },
    { date: '2024-07-22', habits: { FL: 1 } },
    { date: '2024-07-25', habits: { BOB: 1 }, partner: 'Bob' },
    { date: '2024-08-02', habits: { BOB: 1, FL: 2 }, partner: 'David' },
];


export const useHabitStore = create<HabitState>((set) => ({
  entries: initialEntries,
  setHabitEntry: (entry) => {
    set(
      produce((state: HabitState) => {
        const index = state.entries.findIndex((e) => e.date === entry.date);

        const hasHabits = Object.values(entry.habits).some(count => count && count > 0);
        const hasPartner = entry.partner && entry.partner.trim() !== '';

        if (index !== -1) {
          // Entry exists, update it
          state.entries[index].habits = entry.habits;
          state.entries[index].partner = entry.partner;

          if (!hasHabits && !hasPartner) {
            // If no habits and no partner, remove the entry
            state.entries.splice(index, 1);
          }
        } else {
          // No entry exists, create a new one if it has data
          if (hasHabits || hasPartner) {
            state.entries.push(entry);
          }
        }
      })
    );
  },
}));
