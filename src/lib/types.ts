export type Habit = "BOB" | "FL";
export type TimeOfDay = "morning" | "afternoon" | "night" | "dawn" | "not-sure";

export type HabitTime = {
  count: number;
  duration?: number;
};

export interface HabitEntry {
  date: string; // ISO string like "2024-05-20"
  habits: {
    [key in Habit]?: { [key in TimeOfDay]?: HabitTime };
  };
  social?: {
    partners?: string[];
    count: number;
    times?: { [key in TimeOfDay]?: HabitTime };
  };
}
