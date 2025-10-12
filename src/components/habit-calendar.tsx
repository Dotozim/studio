"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { useHabitStore } from "@/lib/store";
import type { Habit } from "@/lib/types";
import { addDays } from "date-fns";

type HabitCalendarProps = {
  month: Date;
  onMonthChange: (date: Date) => void;
  onDateSelect: (date: Date | undefined) => void;
};

export function HabitCalendar({ month, onMonthChange, onDateSelect }: HabitCalendarProps) {
  const entries = useHabitStore((state) => state.entries);

  const habitDays = (habit: Habit) =>
    entries
      .filter((entry) => entry.habits.includes(habit))
      .map((entry) => addDays(new Date(entry.date), 1)); // Adjust for timezone issues

  const socialOnlyDays = entries
    .filter(
      (entry) =>
        entry.partner && entry.partner.trim() !== "" && entry.habits.length === 0
    )
    .map((entry) => addDays(new Date(entry.date), 1));

  const modifiers = {
    bob: habitDays("BOB"),
    fl: habitDays("FL"),
    social: socialOnlyDays,
  };

  const modifiersClassNames = {
    bob: "day-bob",
    fl: "day-fl",
    social: "day-social",
  };
  
  return (
    <Calendar
      mode="single"
      onSelect={onDateSelect}
      month={month}
      onMonthChange={onMonthChange}
      className="p-0"
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4 w-full",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-lg font-medium font-headline",
        nav: "space-x-1 flex items-center",
        table: "w-full border-collapse space-y-1",
        head_row: "flex justify-around",
        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-sm",
        row: "flex w-full mt-2 justify-around",
      }}
      modifiers={modifiers}
      modifiersClassNames={modifiersClassNames}
      showOutsideDays
    />
  );
}
