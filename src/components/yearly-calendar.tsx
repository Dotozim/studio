"use client";

import * as React from "react";
import { addMonths, startOfYear } from "date-fns";
import { HabitCalendar } from "./habit-calendar";
import { Card, CardContent } from "./ui/card";

type YearlyCalendarProps = {
  year: number;
  onDateSelect: (date: Date | undefined) => void;
};

export function YearlyCalendar({ year, onDateSelect }: YearlyCalendarProps) {
  const yearStart = startOfYear(new Date(year, 0, 1));
  const months = Array.from({ length: 12 }).map((_, i) => addMonths(yearStart, i));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {months.map((month) => (
        <Card key={month.toString()} className="shadow-lg">
          <CardContent className="p-2">
            <HabitCalendar
              month={month}
              onDateSelect={onDateSelect}
              onMonthChange={() => {}} // No month change in year view
              disableNav
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
