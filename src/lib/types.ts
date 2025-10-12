export type Habit = "BOB" | "FL";
export type TimeOfDay = "morning" | "afternoon" | "night" | "dawn" | "not-sure";

export interface HabitEntry {
  date: string; // ISO string like "2024-05-20"
  habits: {
    [key in Habit]?: { [key in TimeOfDay]?: number };
  };
  social?: {
    partner?: string;
    count: number;
  };
}
