"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { useHabitStore } from "@/lib/store";
import type { Habit } from "@/lib/types";
import { parseISO, add, set } from "date-fns";

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
      .map((entry) => {
        // The selected date is at midnight UTC, which can cause it to be off by one day.
        const date = parseISO(entry.date)
        const userTimezoneOffset = date.getTimezoneOffset() * 60 * 1000;
        return new Date(date.getTime() + userTimezoneOffset);
      });

  const socialOnlyDays = entries
    .filter(
      (entry) =>
        entry.partner && entry.partner.trim() !== "" && entry.habits.length === 0
    )
    .map((entry) => {
      const date = parseISO(entry.date)
      const userTimezoneOffset = date.getTimezoneOffset() * 60 * 1000;
      return new Date(date.getTime() + userTimezoneOffset);
    });

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
      onSelect={(day) => {
        if (!day) {
            onDateSelect(undefined);
            return;
        }
        const correctedDate = set(day, { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
        onDateSelect(correctedDate);
      }}
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
        day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-md",
        day_selected:"bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
      }}
      modifiers={modifiers}
      modifiersClassNames={modifiersClassNames}
      showOutsideDays
    />
  );
}
