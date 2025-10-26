
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { LoggedHabit, HabitType, TimeOfDay } from "@/lib/types";
import { format, parseISO, isSameMonth } from "date-fns";
import { BookHeart, Leaf, Users } from "lucide-react";
import { useHabitStore } from "@/lib/store";
import { formatDuration } from "@/lib/utils";

type MonthlyHourlySummaryDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  month: Date;
};

const getTimeOfDay = (date: Date): TimeOfDay => {
    const hour = date.getHours();
    if (hour >= 4 && hour < 8) return 'dawn';
    if (hour >= 8 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 || hour < 4) return 'night';
    return 'not-sure';
}

const timeSections: { name: TimeOfDay; label: string }[] = [
  { name: "dawn", label: "Dawn" },
  { name: "morning", label: "Morning" },
  { name: "afternoon", label: "Afternoon" },
  { name: "night", label: "Night" },
];

const HabitIcon = ({ type }: { type: HabitType }) => {
  switch (type) {
    case "BOB": return <BookHeart className="h-4 w-4 mr-2" />;
    case "FL": return <Leaf className="h-4 w-4 mr-2" />;
    case "SOCIAL": return <Users className="h-4 w-4 mr-2" />;
    default: return null;
  }
};

const getHabitColor = (type: HabitType) => {
    switch (type) {
        case "BOB": return "bg-primary/20 border-primary/50";
        case "FL": return "bg-accent/30 border-accent/50";
        case "SOCIAL": return "bg-destructive/20 border-destructive/50";
        default: return "bg-muted";
    }
}

type MonthlyHabitStats = {
    count: number;
    duration: number;
    edgeCount: number;
    partners?: Record<string, number>;
}

export function MonthlyHourlySummaryDialog({ isOpen, setIsOpen, month }: MonthlyHourlySummaryDialogProps) {
  const allEntries = useHabitStore((state) => state.entries);
  
  const monthlyEntries = allEntries.filter((entry) =>
    isSameMonth(parseISO(entry.startTime), month)
  );

  const summaryByTime = timeSections.reduce((acc, section) => {
    const sectionEntries = monthlyEntries.filter(entry => getTimeOfDay(parseISO(entry.startTime)) === section.name);
    
    const habitStats = sectionEntries.reduce((habitAcc, entry) => {
        if(!habitAcc[entry.type]) {
            habitAcc[entry.type] = { count: 0, duration: 0, edgeCount: 0, partners: {} };
        }
        habitAcc[entry.type]!.count++;
        habitAcc[entry.type]!.duration += entry.duration;
        habitAcc[entry.type]!.edgeCount += entry.edgeCount || 0;

        if (entry.type === 'SOCIAL' && entry.partners) {
            entry.partners.forEach(partner => {
                const pName = partner.trim();
                if(pName) {
                    habitAcc[entry.type]!.partners![pName] = (habitAcc[entry.type]!.partners![pName] || 0) + 1;
                }
            })
        }

        return habitAcc;

    }, {} as Record<HabitType, MonthlyHabitStats>);

    acc[section.name] = habitStats;

    return acc;
  }, {} as Record<TimeOfDay, Record<HabitType, MonthlyHabitStats>>);


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl grid-rows-[auto_minmax(0,1fr)_auto] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Monthly Summary for {format(month, "MMMM yyyy")}</DialogTitle>
          <DialogDescription>
            An aggregated summary of your activities for the month, broken down by time of day.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="pr-4 -mx-4">
            <div className="relative grid grid-cols-1 gap-y-4 px-4">
            {timeSections.map((section) => {
                const sectionStats = summaryByTime[section.name];
                const habitTypes = Object.keys(sectionStats) as HabitType[];
                
                return (
                    <div key={section.name} className="grid grid-cols-[80px_1fr] gap-x-4">
                        <div className="text-right font-bold text-muted-foreground pr-4 pt-1 sticky top-0 bg-background/80 backdrop-blur-sm z-10">{section.label}</div>
                        <div className="relative border-l pl-4 space-y-2 py-1">
                            {habitTypes.length === 0 ? (
                                <div className="text-sm text-muted-foreground/50 h-8 flex items-center">No entries</div>
                            ) : (
                                habitTypes.map(habitType => {
                                    const stats = sectionStats[habitType]!;
                                    return (
                                        <div key={habitType} className={`flex items-center text-sm p-2 rounded-lg border ${getHabitColor(habitType)}`}>
                                            <HabitIcon type={habitType} />
                                            <span className="font-semibold">{habitType === 'SOCIAL' ? 'Social' : habitType}</span>
                                            {habitType === 'SOCIAL' && stats.partners && Object.keys(stats.partners).length > 0 && (
                                                <span className="text-xs text-muted-foreground ml-2">
                                                   ({Object.entries(stats.partners).map(([name, count]) => `${name} (x${count})`).join(', ')})
                                                </span>
                                            )}
                                            <div className="ml-auto text-right flex items-center gap-2">
                                                 {stats.edgeCount > 0 && (
                                                    <div className="text-right">
                                                        <Badge variant="outline">{stats.edgeCount} edge{stats.edgeCount > 1 ? 's' : ''}</Badge>
                                                    </div>
                                                )}
                                                <div className="text-right">
                                                    <Badge variant="secondary">{stats.count} {stats.count > 1 ? 'times' : 'time'}</Badge>
                                                    {stats.duration > 0 && (
                                                        <div className="text-xs text-muted-foreground mt-1">{formatDuration(stats.duration)} total</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                )
            })}
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
