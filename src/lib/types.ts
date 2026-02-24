
export type Habit = "BOB" | "FL";
export type TimeOfDay = "morning" | "afternoon" | "night" | "dawn" | "not-sure";

export type HabitType = "BOB" | "FL" | "SOCIAL";

export interface LoggedHabit {
  id: string; // unique id
  type: HabitType;
  startTime: string; // ISO string
  duration: number; // in seconds
  partners?: string[]; // for social habits
  edgeCount?: number;
  notes?: string;
}
