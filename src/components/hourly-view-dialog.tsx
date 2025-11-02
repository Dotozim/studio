
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { LoggedHabit, HabitType } from "@/lib/types";
import { format, parseISO, setHours, setMinutes } from "date-fns";
import { BookHeart, Leaf, Users, X, Pencil, Save, Ban } from "lucide-react";
import { useHabitStore } from "@/lib/store";
import { formatDuration } from "@/lib/utils";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

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
    case "BOB": return <BookHeart className="h-4 w-4 mr-2 flex-shrink-0" />;
    case "FL": return <Leaf className="h-4 w-4 mr-2 flex-shrink-0" />;
    case "SOCIAL": return <Users className="h-4 w-4 mr-2 flex-shrink-0" />;
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

const EntryEditor = ({ entry, onSave, onCancel }: { entry: LoggedHabit, onSave: (updatedEntry: Partial<LoggedHabit>) => void, onCancel: () => void }) => {
  const [type, setType] = useState(entry.type);
  const [time, setTime] = useState(format(parseISO(entry.startTime), "HH:mm"));
  const [duration, setDuration] = useState(Math.round(entry.duration / 60)); // in minutes
  const [edgeCount, setEdgeCount] = useState(entry.edgeCount || 0);
  const [partners, setPartners] = useState(entry.partners?.join(', ') || '');

  const handleSave = () => {
    const [hours, minutes] = time.split(':').map(Number);
    const newStartTime = setMinutes(setHours(parseISO(entry.startTime), hours), minutes).toISOString();

    const updatedEntry: Partial<LoggedHabit> = {
      type,
      startTime: newStartTime,
      duration: duration * 60, // convert back to seconds
      edgeCount: edgeCount > 0 ? edgeCount : undefined,
      partners: type === 'SOCIAL' ? partners.split(',').map(p => p.trim()).filter(Boolean) : undefined,
    };
    onSave(updatedEntry);
  };

  return (
    <div className={`relative flex flex-col text-sm p-2 rounded-lg border ${getHabitColor(type)} gap-2`}>
      <div className="flex items-center gap-2">
        <Select value={type} onValueChange={(v: HabitType) => setType(v)}>
          <SelectTrigger className="w-32 h-8">
            <SelectValue/>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="BOB"><div className="flex items-center"><BookHeart className="h-4 w-4 mr-2"/>BOB</div></SelectItem>
            <SelectItem value="FL"><div className="flex items-center"><Leaf className="h-4 w-4 mr-2"/>FL</div></SelectItem>
            <SelectItem value="SOCIAL"><div className="flex items-center"><Users className="h-4 w-4 mr-2"/>Social</div></SelectItem>
          </SelectContent>
        </Select>
        <Input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-28 h-8" />
      </div>
      {type === 'SOCIAL' && (
        <Input placeholder="Partners (comma separated)" value={partners} onChange={e => setPartners(e.target.value)} className="h-8"/>
      )}
      <div className="flex items-center gap-2">
        <Input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-24 h-8" aria-label="Duration in minutes" />
        <span className="text-xs text-muted-foreground">min</span>
        <Input type="number" value={edgeCount} onChange={e => setEdgeCount(Number(e.target.value))} className="w-20 h-8" aria-label="Edge count" />
        <span className="text-xs text-muted-foreground">edges</span>
      </div>
      <div className="flex justify-end gap-2 mt-2">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onCancel}><Ban className="h-4 w-4" /><span className="sr-only">Cancel</span></Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleSave}><Save className="h-4 w-4" /><span className="sr-only">Save</span></Button>
      </div>
    </div>
  );
};


export function HourlyViewDialog({ isOpen, setIsOpen, date, entries }: HourlyViewDialogProps) {
  const { deleteHabit, updateHabit } = useHabitStore();
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  const sortedEntries = entries.sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime());
    
  const handleSave = (id: string, updatedEntry: Partial<LoggedHabit>) => {
    updateHabit(id, updatedEntry);
    setEditingEntryId(null);
  };


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl grid-rows-[auto_minmax(0,1fr)_auto] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Hourly Log for {format(date, "MMMM d, yyyy")}</DialogTitle>
          <DialogDescription>
            A detailed timeline of your logged activities for the day. You can edit entries by clicking the pencil icon.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="pr-4 -mx-4">
            <div className="relative grid grid-cols-1 gap-y-4 px-4">
            {timeSections.map((section) => {
                const sectionEntries = sortedEntries.filter(entry => timeSections.find(s => s.name === section.name)?.hours.includes(parseISO(entry.startTime).getHours()));
                return (
                    <div key={section.name} className="grid grid-cols-[60px_1fr] gap-x-4">
                        <div className="text-right font-bold text-muted-foreground pr-4 pt-1 sticky top-0 bg-background/80 backdrop-blur-sm z-10">{section.name}</div>
                        <div className="relative border-l pl-4 space-y-2 py-1">
                            {sectionEntries.length === 0 ? (
                                <div className="text-sm text-muted-foreground/50 h-8 flex items-center">No entries</div>
                            ) : (
                                sectionEntries.map(entry => {
                                    if (editingEntryId === entry.id) {
                                      return <EntryEditor key={entry.id} entry={entry} onSave={(updated) => handleSave(entry.id, updated)} onCancel={() => setEditingEntryId(null)} />
                                    }

                                    return (
                                        <div key={entry.id} className={`group relative flex items-center justify-between text-sm p-2 rounded-lg border ${getHabitColor(entry.type)}`}>
                                            <div className="flex items-center flex-grow min-w-0">
                                                <HabitIcon type={entry.type} />
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-x-2">
                                                  <span className="font-semibold">{format(parseISO(entry.startTime), 'HH:mm')}</span>
                                                  <span className="hidden sm:inline mx-2 text-muted-foreground">-</span>
                                                  <span className="truncate">
                                                      {entry.type === 'SOCIAL' ? `Social w/ ${entry.partners?.join(', ') || 'friends'}` : entry.type}
                                                  </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 pl-2 shrink-0">
                                                {entry.edgeCount && entry.edgeCount > 0 && (
                                                    <Badge variant="outline" className="text-xs">{entry.edgeCount} edge{entry.edgeCount > 1 ? 's' : ''}</Badge>
                                                )}
                                                {entry.duration > 0 && (
                                                    <Badge variant="secondary">{formatDuration(entry.duration)}</Badge>
                                                )}
                                                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                                                  <Button
                                                      variant="ghost"
                                                      size="icon"
                                                      className="h-7 w-7"
                                                      onClick={() => setEditingEntryId(entry.id)}
                                                  >
                                                      <Pencil className="h-4 w-4" />
                                                      <span className="sr-only">Edit entry</span>
                                                  </Button>
                                                  <Button
                                                      variant="ghost"
                                                      size="icon"
                                                      className="h-7 w-7"
                                                      onClick={() => deleteHabit(entry.id)}
                                                  >
                                                      <X className="h-4 w-4" />
                                                      <span className="sr-only">Delete entry</span>
                                                  </Button>
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

    