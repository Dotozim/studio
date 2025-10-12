export type Habit = "BOB" | "FL";

export interface HabitEntry {
  date: string; // ISO string like "2024-05-20"
  habits: Habit[];
  partner?: string;
}
