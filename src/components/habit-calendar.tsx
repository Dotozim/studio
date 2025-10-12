"use client";

import * as React from "react";
import { Calendar as UICalendar, CalendarProps as UICalendarProps } from "@/components/ui/calendar";
import { useHabitStore } from "@/lib/store";
import type { Habit } from "@/lib/types";
import { parseISO, format, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

type HabitCalendarProps = Omit<UICalendarProps, 'mode' | 'onSelect' | 'selected'> & {
  month: Date;
  onMonthChange: (date: Date) => void;
  onDateSelect: (date: Date | undefined) => void;
  onMonthSelect?: (date: Date) => void;
  disableNav?: boolean;
};

export function HabitCalendar({ month, onMonthChange, onDateSelect, onMonthSelect, disableNav, ...props }: HabitCalendarProps) {
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
    <UICalendar
      mode="single"
      onSelect={(day) => {
        onDateSelect(day);
      }}
      month={month}
      onMonthChange={onMonthChange}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
        Caption: ({ ...props }) => {
          return (
            <div className="flex justify-center pt-1 relative items-center">
              {!disableNav && (
                <Button
                  variant="outline"
                  className="h-7 w-7 p-0 absolute left-1"
                  onClick={() => onMonthChange(subMonths(month, 1))}
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              <div
                className={cn("text-lg font-medium font-headline", onMonthSelect && !disableNav ? "cursor-pointer hover:bg-accent rounded-md px-2" : "")}
                onClick={onMonthSelect && !disableNav ? () => onMonthSelect(month) : undefined}
                role={onMonthSelect && !disableNav ? 'button' : 'heading'}
                aria-live="polite"
              >
                {format(props.displayMonth, "MMMM yyyy")}
              </div>
              {!disableNav && (
                 <Button
                  variant="outline"
                  className="h-7 w-7 p-0 absolute right-1"
                  onClick={() => onMonthChange(addMonths(month, 1))}
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        },
      }}
      className="p-0"
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4 w-full",
        caption_label: 'hidden', // Hide the default caption label
        caption: "flex justify-center pt-1 relative items-center",
        nav: "space-x-1 flex items-center",
        nav_button: `h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100`,
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
      {...props}
    />
  );
}
