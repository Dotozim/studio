export type Habit = "BOB" | "FL";

export interface HabitEntry {
  date: string; // ISO string like "2024-05-20"
  habits: { [key in Habit]?: number };
  partner?: string;
}
