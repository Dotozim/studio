
"use client";

import { useState, useEffect } from "react";
import { format, startOfMonth, getYear } from "date-fns";
import { HabitCalendar } from "@/components/habit-calendar";
import { HabitDialog } from "@/components/habit-dialog";
import { MonthlySummary } from "@/components/monthly-summary";
import { YearlyCalendar } from "@/components/yearly-calendar";
import { ImportDialog } from "@/components/import-dialog";
import { TimerScreen } from "@/components/timer-screen"; 
import { useHabitStore } from "@/lib/store";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronsRightLeft, Upload } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [currentMonth, setCurrentMonth] = useState<Date | null>(null);
  const [isHabitDialogOpen, setIsHabitDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isTimerVisible, setIsTimerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [view, setView] = useState<"month" | "year">("month");
  const [timerDuration, setTimerDuration] = useState<number | undefined>(undefined);

  const allEntries = useHabitStore((state) => state.entries);

  useEffect(() => {
    setCurrentMonth(startOfMonth(new Date()));
  }, []);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setTimerDuration(undefined);
      setSelectedDate(date);
      setIsHabitDialogOpen(true);
    }
  };

  const handleMonthSelect = (month: Date) => {
    setCurrentMonth(month);
    setView("month");
  };

  const handleTimerStop = (elapsedTime: number) => {
    setIsTimerVisible(false);
    setTimerDuration(elapsedTime);
    setSelectedDate(new Date());
    setIsHabitDialogOpen(true);
  };

  const selectedEntry = selectedDate
    ? allEntries.find(
        (entry) => entry.date === format(selectedDate, "yyyy-MM-dd")
      )
    : undefined;
    
  const currentYear = currentMonth ? getYear(currentMonth) : new Date().getFullYear();

  if (!currentMonth) {
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
            <Skeleton className="h-9 w-32 mt-2" />
            <Skeleton className="h-9 w-28 mt-2" />
          </div>
        </header>
         <h2 className="text-3xl font-bold text-center mb-8 font-headline">{currentYear}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <Card className="md:col-span-2 shadow-lg">
              <CardContent className="p-2 sm:p-4">
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
            <div className="md:col-span-1">
               <Card className="shadow-lg">
                <CardContent className="p-6">
                  <CardTitle className="font-headline text-2xl">
                    Month Summary
                  </CardTitle>
                   <Skeleton className="h-4 w-40 mt-2" />
                </CardContent>
                <CardContent className="space-y-4 text-sm">
                   <Skeleton className="h-16 w-full" />
                   <Skeleton className="h-16 w-full" />
                   <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
      </main>
    );
  }

  return (
    <>
      <main className="container mx-auto p-4 sm:p-6 md:p-8">
        <header className="text-center mb-8">
          <h1 
            className="font-headline text-4xl font-bold text-primary sm:text-5xl cursor-pointer"
            onClick={() => setIsTimerVisible(true)}
          >
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsImportDialogOpen(true)}
              className="mt-2"
            >
              <Upload />
              <span className="ml-2">Import</span>
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
            isOpen={isHabitDialogOpen}
            setIsOpen={setIsHabitDialogOpen}
            date={selectedDate}
            entry={selectedEntry}
            timerDuration={timerDuration}
          />
        )}
        <ImportDialog 
          isOpen={isImportDialogOpen}
          setIsOpen={setIsImportDialogOpen}
        />
      </main>
      {isTimerVisible && <TimerScreen onStop={handleTimerStop} />}
    </>
  );
}
