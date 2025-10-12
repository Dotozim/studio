"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { useHabitStore } from "@/lib/store";
import type { Habit } from "@/lib/types";
import { parseISO } from "date-fns";

type HabitCalendarProps = {
  month: Date;
  onMonthChange: (date: Date) => void;
  onDateSelect: (date: Date | undefined) => void;
  disableNav?: boolean;
};

export function HabitCalendar({ month, onMonthChange, onDateSelect, disableNav = false }: HabitCalendarProps) {
  const entries = useHabitStore((state) => state.entries);

  const habitDays = (habit: Habit) =>
    entries
      .filter((entry) => {
        const habitTimes = entry.habits[habit];
        return habitTimes && Object.values(habitTimes).some(count => count && count > 0);
      })
      .map((entry) => {
        return parseISO(entry.date);
      });

  const socialDays = entries
    .filter(
      (entry) =>
        entry.social && entry.social.count > 0
    )
    .map((entry) => {
      return parseISO(entry.date);
    });

  const modifiers = {
    bob: habitDays("BOB"),
    fl: habitDays("FL"),
    social: socialDays,
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
        onDateSelect(day);
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
        nav_button: disableNav ? "hidden" : "",
        table: "w-full border-collapse space-y-1",
        head_row: "flex justify-around",
        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-sm",
        row: "flex w-full mt-2 justify-around",
        day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-md",
        day_selected:"bg-primary/20 text-primary-foreground hover:bg-primary/30",
        day_today: "bg-secondary text-secondary-foreground",
        day_outside: "text-muted-foreground opacity-50 invisible",
      }}
      modifiers={modifiers}
      modifiersClassNames={modifiersClassNames}
    />
  );
}
