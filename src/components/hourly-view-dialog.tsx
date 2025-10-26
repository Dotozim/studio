
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
import type { LoggedHabit, HabitType } from "@/lib/types";
import { format, parseISO, getHours, getMinutes } from "date-fns";
import { BookHeart, Leaf, Users } from "lucide-react";
import { formatDuration } from "@/lib/utils";

type HourlyViewDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  date: Date;
  entries: LoggedHabit[];
};

const timeSections = [
  { name: "Dawn", hours: [4, 5, 6, 7] },
  { name: "Morning", hours: [8, 9, 10, 11] },
  { name: "Afternoon", hours: [12, 13, 14, 15, 16, 17] },
  { name: "Night", hours: [18, 19, 20, 21, 22, 23, 0, 1, 2, 3] },
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

export function HourlyViewDialog({ isOpen, setIsOpen, date, entries }: HourlyViewDialogProps) {
    
  const sortedEntries = entries.sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime());

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl grid-rows-[auto_minmax(0,1fr)_auto] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Hourly Log for {format(date, "MMMM d, yyyy")}</DialogTitle>
          <DialogDescription>
            A detailed timeline of your logged activities for the day.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="pr-4 -mx-4">
            <div className="relative grid grid-cols-1 gap-y-4 px-4">
            {timeSections.map((section) => {
                const sectionEntries = sortedEntries.filter(entry => section.hours.includes(getHours(parseISO(entry.startTime))));
                return (
                    <div key={section.name} className="grid grid-cols-[60px_1fr] gap-x-4">
                        <div className="text-right font-bold text-muted-foreground pr-4 pt-1 sticky top-0 bg-background/80 backdrop-blur-sm z-10">{section.name}</div>
                        <div className="relative border-l pl-4 space-y-2 py-1">
                            {sectionEntries.length === 0 ? (
                                <div className="text-sm text-muted-foreground/50 h-8 flex items-center">No entries</div>
                            ) : (
                                sectionEntries.map(entry => {
                                    const topPosition = getMinutes(parseISO(entry.startTime));
                                    const height = Math.max(1, entry.duration / 60); // minutes
                                    return (
                                        <div key={entry.id} className={`flex items-center text-sm p-2 rounded-lg border ${getHabitColor(entry.type)}`}>
                                            <HabitIcon type={entry.type} />
                                            <span className="font-semibold">{format(parseISO(entry.startTime), 'HH:mm')}</span>
                                            <span className="mx-2 text-muted-foreground">-</span>
                                            <span>
                                                {entry.type === 'SOCIAL' ? `Social w/ ${entry.partners?.join(', ') || 'friends'}` : entry.type}
                                            </span>
                                            <div className="ml-auto flex items-center gap-2">
                                                {entry.edgeCount && entry.edgeCount > 0 && (
                                                    <Badge variant="outline" className="text-xs">{entry.edgeCount} edge{entry.edgeCount > 1 ? 's' : ''}</Badge>
                                                )}
                                                {entry.duration > 0 && (
                                                    <Badge variant="secondary">{formatDuration(entry.duration)}</Badge>
                                                )}
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
