
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
import type { TimeOfDay, Habit, HabitTime } from "@/lib/types";
import { formatDuration } from "@/lib/utils";

type MonthlySummaryProps = {
  month: Date;
};

const timesOfDay: { id: TimeOfDay; label: string }[] = [
    { id: "dawn", label: "Dawn" },
    { id: "morning", label: "Morning" },
    { id: "afternoon", label: "Afternoon" },
    { id: "night", label: "Night" },
];

export function MonthlySummary({ month }: MonthlySummaryProps) {
  const entries = useHabitStore((state) => state.entries);

  const monthlyEntries = entries.filter((entry) =>
    isSameMonth(new Date(entry.date), month)
  );

  type HabitCounts = {
    total: number;
    duration: number;
    byTime: { [key in TimeOfDay]?: HabitTime };
  };

  const countHabits = (habitName: Habit): HabitCounts => {
    return monthlyEntries.reduce((acc, e) => {
      const habitTimes = e.habits[habitName];
      if (habitTimes) {
        for (const time in habitTimes) {
            const timeKey = time as TimeOfDay;
            const timeData = habitTimes[timeKey];
            if (timeData && timeData.count > 0) {
              acc.total += timeData.count;
              acc.duration += timeData.duration || 0;
              if (timeKey !== 'not-sure') {
                  if (!acc.byTime[timeKey]) {
                    acc.byTime[timeKey] = { count: 0, duration: 0 };
                  }
                  acc.byTime[timeKey]!.count += timeData.count;
                  acc.byTime[timeKey]!.duration = (acc.byTime[timeKey]!.duration || 0) + (timeData.duration || 0);
              }
            }
        }
      }
      return acc;
    }, { total: 0, duration: 0, byTime: {} });
  }
  
  const socialCounts: HabitCounts = monthlyEntries.reduce((acc, entry) => {
    const socialTimes = entry.social?.times;
    if (socialTimes) {
      for (const time in socialTimes) {
        const timeKey = time as TimeOfDay;
        const timeData = socialTimes[timeKey];
        if (timeData && timeData.count > 0) {
            acc.total += timeData.count;
            acc.duration += timeData.duration || 0;
            if (timeKey !== 'not-sure') {
                if (!acc.byTime[timeKey]) {
                    acc.byTime[timeKey] = { count: 0, duration: 0 };
                }
                acc.byTime[timeKey]!.count += timeData.count;
                acc.byTime[timeKey]!.duration = (acc.byTime[timeKey]!.duration || 0) + (timeData.duration || 0);
            }
        }
      }
    }
    return acc;
  }, { total: 0, duration: 0, byTime: {} });

  const bobCounts = countHabits("BOB");
  const flCounts = countHabits("FL");
  
  const partnerCounts = monthlyEntries.reduce((acc, entry) => {
    if (entry.social && entry.social.count > 0 && entry.social.partners) {
      entry.social.partners.forEach(partnerNameRaw => {
        const partnerName = partnerNameRaw.trim();
        if (partnerName) {
          const partnerDuration = Object.values(entry.social?.times || {}).reduce((sum, time) => sum + (time?.duration || 0), 0)
          const partnerCount = entry.social?.count || 1;
          
          if (!acc[partnerName]) {
            acc[partnerName] = { count: 0, duration: 0 };
          }
          acc[partnerName].count += partnerCount;
          acc[partnerName].duration += partnerDuration;
        }
      });
    }
    return acc;
  }, {} as Record<string, { count: number, duration: number }>);
  
  const total = bobCounts.total + flCounts.total + socialCounts.total;
  const totalDuration = bobCounts.duration + flCounts.duration + socialCounts.duration;

  const totalCountsByTime = timesOfDay.reduce((acc, time) => {
    const timeId = time.id as TimeOfDay;
    const bobTime = bobCounts.byTime[timeId] || { count: 0, duration: 0 };
    const flTime = flCounts.byTime[timeId] || { count: 0, duration: 0 };
    const socialTime = socialCounts.byTime[timeId] || { count: 0, duration: 0 };
    
    const timeTotalCount = bobTime.count + flTime.count + socialTime.count;
    const timeTotalDuration = (bobTime.duration || 0) + (flTime.duration || 0) + (socialTime.duration || 0);

    if (timeTotalCount > 0) {
      acc[timeId] = { count: timeTotalCount, duration: timeTotalDuration };
    }
    return acc;
  }, {} as { [key in TimeOfDay]?: HabitTime });

  const HabitSummary = ({ habit, counts, colorClass }: { habit: string, counts: HabitCounts, colorClass: string }) => (
    <div className={`p-3 rounded-lg ${colorClass} text-card-foreground`}>
      <div className="flex justify-between items-center">
        <span className="font-medium">{habit}</span>
        <div className="text-right">
            <span className="font-semibold">{counts.total}</span>
        </div>
      </div>
      <div className="text-xs text-card-foreground/80 mt-1 space-y-0.5">
        {timesOfDay.map(time => (
            counts.byTime[time.id] && counts.byTime[time.id]!.count > 0 ? (
                <div key={time.id} className="flex justify-between">
                    <span>{time.label}</span>
                    <div className="text-right">
                        {counts.byTime[time.id]!.duration! > 0 && <span className="mr-2 text-card-foreground/70">({formatDuration(counts.byTime[time.id]!.duration!)})</span>}
                        <span>{counts.byTime[time.id]!.count}</span>
                    </div>
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
          Month Summary
        </CardTitle>
        <CardDescription>Your progress for {format(month, "MMMM")}.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <HabitSummary habit="BOB" counts={bobCounts} colorClass="bg-primary/20" />
        <HabitSummary habit="FL" counts={flCounts} colorClass="bg-accent/30" />
        <HabitSummary habit="Social" counts={socialCounts} colorClass="bg-destructive/20" />
        
        {Object.keys(partnerCounts).length > 0 && (
          <>
            <Separator />
            <p className="font-medium text-muted-foreground pt-2">Partners</p>
            {Object.entries(partnerCounts).map(([name, data]) => (
              <div key={name} className="flex justify-between items-center p-3 rounded-lg bg-destructive/10 text-card-foreground">
                <span className="font-medium">{name}</span>
                 <div className="text-right">
                    <span className="font-semibold">{data.count}</span>
                </div>
              </div>
            ))}
          </>
        )}

        <Separator />
        <div className="flex justify-between items-center font-bold text-base">
          <span>TOTAL</span>
          <div className="text-right">
              <span>{total}</span>
              {totalDuration > 0 && <div className="text-xs font-normal text-muted-foreground">{formatDuration(totalDuration)}</div>}
          </div>
        </div>
        <div className="text-xs text-muted-foreground/80 space-y-0.5">
            {timesOfDay.map(time => {
                const timeData = totalCountsByTime[time.id];
                return timeData && timeData.count > 0 ? (
                    <div key={time.id} className="flex justify-between pl-2">
                        <span>{time.label}</span>
                        <div className="text-right">
                          {timeData.duration! > 0 && <span className="mr-2 text-muted-foreground/70">({formatDuration(timeData.duration!)})</span>}
                          <span>{timeData.count}</span>
                        </div>
                    </div>
                ) : null
            })}
        </div>
      </CardContent>
    </Card>
  );
}
