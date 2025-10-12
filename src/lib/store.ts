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

        if (entry.habits.length === 0 && (!entry.partner || entry.partner.trim() === '')) {
          // If no habits and no partner, remove the entry if it exists
          if (index !== -1) {
            state.entries.splice(index, 1);
          }
        } else {
          // Add or update the entry
          if (index !== -1) {
            state.entries[index] = entry;
          } else {
            state.entries.push(entry);
          }
        }
      })
    );
  },
}));
