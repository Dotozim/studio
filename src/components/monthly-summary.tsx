
"use client";

import { isSameMonth, format, parseISO } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useHabitStore } from "@/lib/store";
import { Separator } from "./ui/separator";
import type { TimeOfDay, HabitType, LoggedHabit } from "@/lib/types";
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

const getTimeOfDay = (date: Date): TimeOfDay => {
    const hour = date.getHours();
    const minutes = date.getMinutes();
    const time = hour * 100 + minutes; // e.g., 6:01 -> 601, 12:00 -> 1200

    if (time >= 1 && time <= 600) return 'dawn'; // 00:01 to 06:00
    if (time >= 601 && time <= 1200) return 'morning'; // 06:01 to 12:00
    if (time >= 1201 && time <= 1800) return 'afternoon'; // 12:01 to 18:00
    if (time >= 1801 || time === 0) return 'night'; // 18:01 to 00:00
    return 'not-sure';
}

export function MonthlySummary({ month }: MonthlySummaryProps) {
  const allEntries = useHabitStore((state) => state.entries);

  const monthlyEntries = allEntries.filter((entry) =>
    isSameMonth(parseISO(entry.startTime), month)
  );

  type HabitStats = {
    total: number;
    duration: number;
    edgeCount: number;
    byTime: { [key in TimeOfDay]?: { count: number; duration: number; edgeCount: number; } };
  };

  const calculateStats = (entries: LoggedHabit[]): HabitStats => {
    return entries.reduce((acc, e) => {
        const timeOfDay = getTimeOfDay(parseISO(e.startTime));
        acc.total += 1;
        acc.duration += e.duration;
        acc.edgeCount += e.edgeCount || 0;
        if (timeOfDay !== 'not-sure') {
            if (!acc.byTime[timeOfDay]) {
                acc.byTime[timeOfDay] = { count: 0, duration: 0, edgeCount: 0 };
            }
            acc.byTime[timeOfDay]!.count += 1;
            acc.byTime[timeOfDay]!.duration += e.duration;
            acc.byTime[timeOfDay]!.edgeCount += e.edgeCount || 0;
        }
        return acc;
    }, { total: 0, duration: 0, edgeCount: 0, byTime: {} });
  }
  
  const bobStats = calculateStats(monthlyEntries.filter(e => e.type === 'BOB'));
  const flStats = calculateStats(monthlyEntries.filter(e => e.type === 'FL'));
  const socialStats = calculateStats(monthlyEntries.filter(e => e.type === 'SOCIAL'));
  
  const partnerCounts = monthlyEntries
    .filter(e => e.type === 'SOCIAL' && e.partners)
    .flatMap(e => e.partners!)
    .reduce((acc, partnerName) => {
        const pName = partnerName.trim();
        if (pName) {
            acc[pName] = (acc[pName] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

  
  const total = bobStats.total + flStats.total + socialStats.total;
  const totalDuration = bobStats.duration + flStats.duration + socialStats.duration;
  const totalEdgeCount = bobStats.edgeCount + flStats.edgeCount + socialStats.edgeCount;

  const totalCountsByTime = timesOfDay.reduce((acc, time) => {
    const timeId = time.id as TimeOfDay;
    const bobTime = bobStats.byTime[timeId] || { count: 0, duration: 0, edgeCount: 0 };
    const flTime = flStats.byTime[timeId] || { count: 0, duration: 0, edgeCount: 0 };
    const socialTime = socialStats.byTime[timeId] || { count: 0, duration: 0, edgeCount: 0 };
    
    const timeTotalCount = bobTime.count + flTime.count + socialTime.count;
    const timeTotalDuration = bobTime.duration + flTime.duration + socialTime.duration;
    const timeTotalEdgeCount = bobTime.edgeCount + flTime.edgeCount + socialTime.edgeCount;

    if (timeTotalCount > 0) {
      acc[timeId] = { count: timeTotalCount, duration: timeTotalDuration, edgeCount: timeTotalEdgeCount };
    }
    return acc;
  }, {} as { [key in TimeOfDay]?: {count: number, duration: number, edgeCount: number} });

  const HabitSummary = ({ habit, counts, colorClass }: { habit: string, counts: HabitStats, colorClass: string }) => (
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
                    <div className="text-right space-x-2">
                        {counts.byTime[time.id]!.edgeCount > 0 && <span className="text-card-foreground/70">{counts.byTime[time.id]!.edgeCount} edges</span>}
                        {counts.byTime[time.id]!.duration > 0 && <span className="text-card-foreground/70">({formatDuration(counts.byTime[time.id]!.duration)})</span>}
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
        <HabitSummary habit="BOB" counts={bobStats} colorClass="bg-primary/20" />
        <HabitSummary habit="FL" counts={flStats} colorClass="bg-accent/30" />
        <HabitSummary habit="Social" counts={socialStats} colorClass="bg-destructive/20" />
        
        {Object.keys(partnerCounts).length > 0 && (
          <>
            <Separator />
            <p className="font-medium text-muted-foreground pt-2">Partners</p>
            {Object.entries(partnerCounts).map(([name, count]) => (
              <div key={name} className="flex justify-between items-center p-3 rounded-lg bg-destructive/10 text-card-foreground">
                <span className="font-medium">{name}</span>
                 <div className="text-right">
                    <span className="font-semibold">{count}</span>
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
              {(totalDuration > 0 || totalEdgeCount > 0) && (
                <div className="text-xs font-normal text-muted-foreground">
                    {totalEdgeCount > 0 && <span>{totalEdgeCount} edges</span>}
                    {totalEdgeCount > 0 && totalDuration > 0 && <span>, </span>}
                    {totalDuration > 0 && <span>{formatDuration(totalDuration)}</span>}
                </div>
              )}
          </div>
        </div>
        <div className="text-xs text-muted-foreground/80 space-y-0.5">
            {timesOfDay.map(time => {
                const timeData = totalCountsByTime[time.id];
                return timeData && timeData.count > 0 ? (
                    <div key={time.id} className="flex justify-between pl-2">
                        <span>{time.label}</span>
                        <div className="text-right space-x-2">
                          {timeData.edgeCount! > 0 && <span className="text-muted-foreground/70">{timeData.edgeCount} edges</span>}
                          {timeData.duration! > 0 && <span className="text-muted-foreground/70">({formatDuration(timeData.duration!)})</span>}
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
