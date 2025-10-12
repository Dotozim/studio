"use client";

import { useState } from "react";
import { format, startOfMonth } from "date-fns";
import { HabitCalendar } from "@/components/habit-calendar";
import { HabitDialog } from "@/components/habit-dialog";
import { MonthlySummary } from "@/components/monthly-summary";
import { useHabitStore } from "@/lib/store";
import type { HabitEntry } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const allEntries = useHabitStore((state) => state.entries);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setIsDialogOpen(true);
    }
  };

  const selectedEntry = selectedDate
    ? allEntries.find(
        (entry) => entry.date === format(selectedDate, "yyyy-MM-dd")
      )
    : undefined;

  return (
    <main className="container mx-auto p-4 sm:p-6 md:p-8">
      <header className="text-center mb-8">
        <h1 className="font-headline text-4xl font-bold text-primary sm:text-5xl">
          HabitCal
        </h1>
        <p className="text-muted-foreground mt-2">
          Track your habits. One day at a time.
        </p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <Card className="md:col-span-2 shadow-lg">
          <CardContent className="p-2 sm:p-4">
            <HabitCalendar
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              onDateSelect={handleDateSelect}
            />
          </CardContent>
        </Card>
        <div className="md:col-span-1">
          <MonthlySummary month={currentMonth} />
        </div>
      </div>
      {selectedDate && (
        <HabitDialog
          isOpen={isDialogOpen}
          setIsOpen={setIsDialogOpen}
          date={selectedDate}
          entry={selectedEntry}
        />
      )}
    </main>
  );
}
