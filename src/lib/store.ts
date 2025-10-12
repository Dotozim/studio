"use client"
import { create } from 'zustand';
import type { HabitEntry } from './types';
import { produce } from 'immer';

interface HabitState {
  entries: HabitEntry[];
  setHabitEntry: (entry: HabitEntry) => void;
}

const initialEntries: HabitEntry[] = [
    { date: '2024-07-01', habits: ['BOB'], partner: 'Alice' },
    { date: '2024-07-03', habits: ['FL'] },
    { date: '2024-07-04', habits: ['BOB', 'FL'], partner: 'Bob' },
    { date: '2024-07-08', habits: ['BOB'], partner: 'Alice' },
    { date: '2024-07-10', habits: ['FL'] },
    { date: '2024-07-12', habits: ['BOB'] },
    { date: '2024-07-15', habits: ['FL'], partner: 'Charlie' },
    { date: '2024-07-16', habits: ['BOB', 'FL'], partner: 'Alice' },
    { date: '2024-07-20', habits: ['BOB'] },
    { date: '2024-07-22', habits: ['FL'] },
    { date: '2024-07-25', habits: ['BOB'], partner: 'Bob' },
    { date: '2024-08-02', habits: ['BOB', 'FL'], partner: 'David' },
];


export const useHabitStore = create<HabitState>((set) => ({
  entries: initialEntries,
  setHabitEntry: (entry) => {
    set(
      produce((state: HabitState) => {
        const index = state.entries.findIndex((e) => e.date === entry.date);
        
        if (index !== -1) {
          // Entry exists, update it
          state.entries[index].habits = entry.habits;
          state.entries[index].partner = entry.partner;

          const hasHabits = entry.habits && entry.habits.length > 0;
          const hasPartner = entry.partner && entry.partner.trim() !== '';

          if (!hasHabits && !hasPartner) {
            // If no habits and no partner, remove the entry
            state.entries.splice(index, 1);
          }
        } else {
          // No entry exists, create a new one if it has data
          const hasHabits = entry.habits && entry.habits.length > 0;
          const hasPartner = entry.partner && entry.partner.trim() !== '';

          if (hasHabits || hasPartner) {
            state.entries.push(entry);
          }
        }
      })
    );
  },
}));
