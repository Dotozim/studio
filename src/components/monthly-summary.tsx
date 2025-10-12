"use client";

import { isSameMonth, format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useHabitStore } from "@/lib/store";
import { Separator } from "./ui/separator";
import type { TimeOfDay, Habit } from "@/lib/types";

type MonthlySummaryProps = {
  month: Date;
};

const timesOfDay: { id: TimeOfDay; label: string }[] = [
    { id: "dawn", label: "Dawn" },
    { id: "morning", label: "Morning" },
    { id: "afternoon", label: "Afternoon" },
    { id: "night", label: "Night" },
    { id: "not-sure", label: "Not Sure" },
];

export function MonthlySummary({ month }: MonthlySummaryProps) {
  const entries = useHabitStore((state) => state.entries);

  const monthlyEntries = entries.filter((entry) =>
    isSameMonth(new Date(entry.date), month)
  );

  const countHabits = (habitName: Habit) => {
    const counts = monthlyEntries.reduce((acc, e) => {
      const habitTimes = e.habits[habitName];
      if (habitTimes) {
        for (const time in habitTimes) {
            const timeKey = time as TimeOfDay;
            const count = habitTimes[timeKey] || 0;
            acc.total += count;
            acc.byTime[timeKey] = (acc.byTime[timeKey] || 0) + count;
        }
      }
      return acc;
    }, { total: 0, byTime: {} as { [key in TimeOfDay]?: number }});
    return counts;
  }
  
  const socialCounts = monthlyEntries.reduce((acc, entry) => {
    const socialTimes = entry.social?.times;
    if (socialTimes) {
      for (const time in socialTimes) {
        const timeKey = time as TimeOfDay;
        const count = socialTimes[timeKey] || 0;
        acc.total += count;
        acc.byTime[timeKey] = (acc.byTime[timeKey] || 0) + count;
      }
    }
    return acc;
  }, { total: 0, byTime: {} as { [key in TimeOfDay]?: number } });

  const bobCounts = countHabits("BOB");
  const flCounts = countHabits("FL");
  
  const partnerCounts = monthlyEntries.reduce((acc, entry) => {
    if (entry.social && entry.social.count > 0 && entry.social.partners) {
      entry.social.partners.forEach(partnerNameRaw => {
        const partnerName = partnerNameRaw.trim();
        if (partnerName) {
          acc[partnerName] = (acc[partnerName] || 0) + (entry.social?.count || 1);
        }
      });
    }
    return acc;
  }, {} as Record<string, number>);
  
  const total = bobCounts.total + flCounts.total + socialCounts.total;

  const HabitSummary = ({ habit, counts, colorClass }: { habit: string, counts: { total: number, byTime: { [key in TimeOfDay]?: number } }, colorClass: string }) => (
    <div className={`p-3 rounded-lg ${colorClass} text-card-foreground`}>
      <div className="flex justify-between items-center">
        <span className="font-medium">{habit}</span>
        <span className="font-semibold">{counts.total}</span>
      </div>
      <div className="text-xs text-card-foreground/80 mt-1 space-y-0.5">
        {timesOfDay.map(time => (
            counts.byTime[time.id] ? (
                <div key={time.id} className="flex justify-between">
                    <span>{time.label}</span>
                    <span>{counts.byTime[time.id]}</span>
                </div>
            ) : null
        ))}
      </div>
    </div>
  );

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">
          {format(month, "MMMM yyyy")} Summary
        </CardTitle>
        <CardDescription>Your progress for the month.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <HabitSummary habit="BOB" counts={bobCounts} colorClass="bg-primary/20" />
        <HabitSummary habit="FL" counts={flCounts} colorClass="bg-accent/30" />
        <HabitSummary habit="Social" counts={socialCounts} colorClass="bg-destructive/20" />
        
        {Object.keys(partnerCounts).length > 0 && (
          <>
            <Separator />
            <p className="font-medium text-muted-foreground pt-2">Partners</p>
            {Object.entries(partnerCounts).map(([name, count]) => (
              <div key={name} className="flex justify-between items-center p-3 rounded-lg bg-destructive/10 text-card-foreground">
                <span className="font-medium">{name}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </>
        )}

        <Separator />
        <div className="flex justify-between items-center font-bold text-base">
          <span>TOTAL</span>
          <span>{total}</span>
        </div>
      </CardContent>
    </Card>
  );
}
