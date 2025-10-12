"use client";

import { useState } from "react";
import { format, startOfMonth, getYear } from "date-fns";
import { HabitCalendar } from "@/components/habit-calendar";
import { HabitDialog } from "@/components/habit-dialog";
import { MonthlySummary } from "@/components/monthly-summary";
import { YearlyCalendar } from "@/components/yearly-calendar";
import { useHabitStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronsRightLeft } from "lucide-react";

export default function Home() {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [view, setView] = useState<"month" | "year">("month");

  const allEntries = useHabitStore((state) => state.entries);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setIsDialogOpen(true);
    }
  };

  const handleMonthSelect = (month: Date) => {
    setCurrentMonth(month);
    setView("month");
  };

  const selectedEntry = selectedDate
    ? allEntries.find(
        (entry) => entry.date === format(selectedDate, "yyyy-MM-dd")
      )
    : undefined;
    
  const currentYear = getYear(currentMonth);

  return (
    <main className="container mx-auto p-4 sm:p-6 md:p-8">
      <header className="text-center mb-8">
        <h1 className="font-headline text-4xl font-bold text-primary sm:text-5xl">
          HabitCal
        </h1>
        <div className="flex items-center justify-center gap-4">
          <p className="text-muted-foreground mt-2">
            Track your habits. One day at a time.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setView(view === "month" ? "year" : "month")}
            className="mt-2"
          >
            {view === "month" ? <Calendar/> : <ChevronsRightLeft/>}
            <span className="ml-2">{view === "month" ? "Year View" : "Month View"}</span>
          </Button>
        </div>
      </header>

      {view === "month" ? (
        <>
          <h2 className="text-3xl font-bold text-center mb-8 font-headline">{currentYear}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <Card className="md:col-span-2 shadow-lg">
              <CardContent className="p-2 sm:p-4">
                <HabitCalendar
                  month={currentMonth}
                  onMonthChange={setCurrentMonth}
                  onDateSelect={handleDateSelect}
                  onMonthSelect={() => setView('year')}
                />
              </CardContent>
            </Card>
            <div className="md:col-span-1">
              <MonthlySummary month={currentMonth} />
            </div>
          </div>
        </>
      ) : (
        <YearlyCalendar year={currentYear} onDateSelect={handleDateSelect} onMonthSelect={handleMonthSelect} />
      )}

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
