
export type Habit = "BOB" | "FL";
export type TimeOfDay = "morning" | "afternoon" | "night" | "dawn" | "not-sure";

export type HabitTime = {
  count: number;
  duration?: number;
};

// Deprecated, will be removed after migration
export interface OldHabitEntry {
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


// New data structure
export type HabitType = "BOB" | "FL" | "SOCIAL";

export interface LoggedHabit {
  id: string; // unique id
  type: HabitType;
  startTime: string; // ISO string
  duration: number; // in seconds
  partners?: string[]; // for social habits
  edgeCount?: number;
}
