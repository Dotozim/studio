
"use client";

import { useState, useEffect, useCallback } from "react";
import { format, startOfMonth, getYear, parseISO, isSameDay, addYears, subYears } from "date-fns";
import { HabitCalendar } from "@/components/habit-calendar";
import { HabitDialog } from "@/components/habit-dialog";
import { HourlyViewDialog } from "@/components/hourly-view-dialog";
import { MonthlySummary } from "@/components/monthly-summary";
import { MonthlyHourlySummaryDialog } from "@/components/monthly-hourly-summary-dialog";
import { YearlyCalendar } from "@/components/yearly-calendar";
import { ImportDialog } from "@/components/import-dialog";
import { TimerScreen } from "@/components/timer-screen"; 
import { useHabitStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { LoggedHabit } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function Home() {
  const [currentMonth, setCurrentMonth] = useState<Date | null>(null);
  const [isHabitDialogOpen, setIsHabitDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isHourlyViewOpen, setIsHourlyViewOpen] = useState(false);
  const [isMonthlyHourlySummaryOpen, setIsMonthlyHourlySummaryOpen] = useState(false);
  const [isTimerVisible, setIsTimerVisible] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [entriesForSelectedDate, setEntriesForSelectedDate] = useState<LoggedHabit[]>([]);
  
  const [view, setView] = useState<"month" | "year">("month");
  
  const [timerData, setTimerData] = useState<{startTime: string, duration: number, edgeCount: number} | undefined>(undefined);

  const allEntries = useHabitStore((state) => state.entries);
  const isLoaded = useHabitStore((state) => state.isLoaded);
  const loadEntries = useHabitStore((state) => state.loadEntries);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        loadEntries();
    }
    setCurrentMonth(startOfMonth(new Date()));
  }, [loadEntries]);
  
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setTimerData(undefined);
      setSelectedDate(date);
      setIsHabitDialogOpen(true);
    }
  };

  const handleDateDoubleClick = useCallback((date: Date | undefined) => {
    if (date) {
        setSelectedDate(date);
        const entries = allEntries.filter(entry => isSameDay(parseISO(entry.startTime), date));
        setEntriesForSelectedDate(entries);
        setIsHourlyViewOpen(true);
    }
  }, [allEntries]);

  const handleMonthSelect = (month: Date) => {
    setCurrentMonth(month);
    setView("month");
  };

  const handleTimerStop = (startTime: Date, elapsedTime: number, edgeCount: number) => {
    setIsTimerVisible(false);
    setTimerData({ startTime: startTime.toISOString(), duration: elapsedTime, edgeCount: edgeCount });
    setSelectedDate(new Date());
    setIsHabitDialogOpen(true);
  };

  const handleYearChange = (direction: 'next' | 'prev') => {
    if (currentMonth) {
      const newMonth = direction === 'next' ? addYears(currentMonth, 1) : subYears(currentMonth, 1);
      setCurrentMonth(newMonth);
    }
  }
    
  const currentYear = currentMonth ? getYear(currentMonth) : new Date().getFullYear();

  if (!isLoaded || !currentMonth) {
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
                <CardHeader>
                  <CardTitle className="font-headline text-2xl">
                    Month Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                   <Skeleton className="h-16 w-full" />
                   <Skeleton className="h-16 w-full" />
                   <Skeleton className="h-16 w-full" />
                </Content>
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
              onClick={() => setIsImportDialogOpen(true)}
              className="mt-2"
            >
              <Upload />
              <span className="ml-2">Import</span>
            </Button>
          </div>
        </header>

        <div className="flex justify-center items-center gap-4 mb-8">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleYearChange('prev')}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous Year</span>
          </Button>
          <h2 
            className={cn(
              "text-3xl font-bold text-center font-headline",
              "cursor-pointer hover:text-primary transition-colors"
            )}
            onClick={() => setView(view === 'month' ? 'year' : 'month')}
          >
            {currentYear}
          </h2>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleYearChange('next')}>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next Year</span>
          </Button>
        </div>


        {view === "month" ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              <Card className="md:col-span-2 shadow-lg">
                <CardContent className="p-2 sm:p-4">
                  <HabitCalendar
                    month={currentMonth}
                    onMonthChange={setCurrentMonth}
                    onDateSelect={handleDateSelect}
                    onDateDoubleClick={handleDateDoubleClick}
                    onMonthSelect={() => setIsMonthlyHourlySummaryOpen(true)}
                  />
                </CardContent>
              </Card>
              <div className="md:col-span-1">
                <MonthlySummary month={currentMonth} />
              </div>
            </div>
          </>
        ) : (
          <YearlyCalendar year={currentYear} onDateSelect={handleDateSelect} onDateDoubleClick={handleDateDoubleClick} onMonthSelect={handleMonthSelect} />
        )}

        {selectedDate && (
          <HabitDialog
            isOpen={isHabitDialogOpen}
            setIsOpen={setIsHabitDialogOpen}
            date={selectedDate}
            timerData={timerData}
          />
        )}
         {selectedDate && (
          <HourlyViewDialog
            isOpen={isHourlyViewOpen}
            setIsOpen={setIsHourlyViewOpen}
            date={selectedDate}
            entries={entriesForSelectedDate}
          />
        )}
        <ImportDialog 
          isOpen={isImportDialogOpen}
          setIsOpen={setIsImportDialogOpen}
        />
        <MonthlyHourlySummaryDialog
          isOpen={isMonthlyHourlySummaryOpen}
          setIsOpen={setIsMonthlyHourlySummaryOpen}
          month={currentMonth}
        />
      </main>
      {isTimerVisible && <TimerScreen onStop={handleTimerStop} />}
    </>
  );
}
