"use client";

import * as React from "react";
import { addMonths, startOfYear, format } from "date-fns";
import { HabitCalendar } from "./habit-calendar";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

type YearlyCalendarProps = {
  year: number;
  onDateSelect: (date: Date | undefined) => void;
  onMonthSelect: (date: Date) => void;
};

export function YearlyCalendar({ year, onDateSelect, onMonthSelect }: YearlyCalendarProps) {
  const yearStart = startOfYear(new Date(year, 0, 1));
  const months = Array.from({ length: 12 }).map((_, i) => addMonths(yearStart, i));

  return (
    <>
      <h2 className="text-3xl font-bold text-center mb-8 font-headline">{year}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {months.map((month) => (
          <Card key={month.toString()} className="shadow-lg">
            <CardHeader className="p-2 pb-0">
               <CardTitle 
                  className="text-lg font-medium font-headline text-center cursor-pointer hover:bg-accent rounded-md p-1"
                  onClick={() => onMonthSelect(month)}
                >
                  {format(month, "MMMM")}
                </CardTitle>
            </CardHeader>
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
    </>
  );
}
