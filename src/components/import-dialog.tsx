
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useHabitStore } from "@/lib/store";
import type { TimeOfDay, LoggedHabit, HabitType } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Label } from "./ui/label";
import { set, parseISO } from 'date-fns';

type ImportDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

const validTimes: TimeOfDay[] = ["dawn", "morning", "afternoon", "night", "not-sure"];

const getTimeOfDayDate = (date: Date, time: TimeOfDay): Date => {
    switch (time) {
        case 'dawn': return set(date, { hours: 5, minutes: 0, seconds: 0 });
        case 'morning': return set(date, { hours: 9, minutes: 0, seconds: 0 });
        case 'afternoon': return set(date, { hours: 14, minutes: 0, seconds: 0 });
        case 'night': return set(date, { hours: 21, minutes: 0, seconds: 0 });
        case 'not-sure':
        default:
            const randomHour = 8 + Math.floor(Math.random() * 12); // 8am to 7pm
            return set(date, { hours: randomHour, minutes: 0, seconds: 0 });
    }
}

const parseDurationToSeconds = (durationStr: string): number => {
    let totalSeconds = 0;
    const minutesMatch = durationStr.match(/(\d+)\s*m/);
    const secondsMatch = durationStr.match(/(\d+)\s*s/);
    if (minutesMatch) {
        totalSeconds += parseInt(minutesMatch[1], 10) * 60;
    }
    if (secondsMatch) {
        totalSeconds += parseInt(secondsMatch[1], 10);
    }
    return totalSeconds;
};

export function ImportDialog({ isOpen, setIsOpen }: ImportDialogProps) {
  const [importData, setImportData] = useState("");
  const addHabit = useHabitStore((state) => state.addHabit);
  const { toast } = useToast();

  const handleImport = () => {
    const lines = importData.trim().split('\n');
    if (lines.length === 0) return;

    let year: number;
    const firstLineAsYear = parseInt(lines[0].trim(), 10);
    if (!isNaN(firstLineAsYear) && firstLineAsYear > 1900 && firstLineAsYear < 2100) {
        year = firstLineAsYear;
        lines.shift(); // remove year line
    } else {
        year = new Date().getFullYear();
    }
    
    let importedCount = 0;

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine === "") continue;

        const dateMatch = trimmedLine.match(/^(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\s*/);
        if (!dateMatch) continue;
        
        const dateStr = dateMatch[1];
        const dateSegments = dateStr.split('/');
        if (dateSegments.length < 2) continue;

        const day = parseInt(dateSegments[0], 10);
        const month = parseInt(dateSegments[1], 10);
        const lineYear = dateSegments.length === 3 ? parseInt(dateSegments[2], 10) : year;

        if (isNaN(day) || isNaN(month) || day < 1 || day > 31 || month < 1 || month > 12) {
            continue;
        }

        const baseDate = parseISO(`${lineYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
        let remainingLine = trimmedLine.substring(dateMatch[0].length).trim();
        
        if (remainingLine === "") {
            addHabit({
                type: 'BOB',
                startTime: getTimeOfDayDate(baseDate, 'not-sure').toISOString(),
                duration: 0,
            });
            importedCount++;
            continue;
        }
        
        const chunks = remainingLine.split(/\s+(?=(?:1|BOB|FL|[A-Z][a-zA-ZÀ-ÿ'´`]+)(?:\s|$))/i);
        
        for (const chunk of chunks) {
            if (chunk.trim() === "") continue;
            
            const tokens = chunk.trim().split(/\s+/);
            const marker = tokens.shift() || "";
            let content = tokens.join(' ');
            
            let habit: Partial<Omit<LoggedHabit, 'id'>> & { type: HabitType } | null = null;
            
            if (marker.toLowerCase() === '1' || marker.toLowerCase() === 'bob') {
                habit = { type: 'BOB' };
            } else if (marker.toLowerCase() === 'fl') {
                habit = { type: 'FL' };
            } else if (/^[A-Z][a-zA-ZÀ-ÿ'´`]+$/.test(marker)) {
                habit = { type: 'SOCIAL', partners: [marker] };
            }

            if (!habit) continue;
            
            const legacyTimeMatch = content.match(/^(dawn|morning|afternoon|night)$/i);
            if(legacyTimeMatch) {
                habit.startTime = getTimeOfDayDate(baseDate, legacyTimeMatch[1].toLowerCase() as TimeOfDay).toISOString();
                habit.duration = 0;
                addHabit(habit as Omit<LoggedHabit, 'id'>);
                importedCount++;
                continue;
            }

            let notes = '';
            const timeMatch = content.match(/(\d{1,2}:\d{2})/);
            if (timeMatch) {
                const timeStr = timeMatch[1];
                const timeIndex = content.indexOf(timeStr);
                notes = content.substring(timeIndex + timeStr.length).trim();
                content = content.substring(0, timeIndex).trim();

                const [h, m] = timeStr.split(':').map(Number);
                habit.startTime = set(baseDate, { hours: h, minutes: m, seconds: 0 }).toISOString();
            } else {
                 notes = content;
                 content = '';
            }

            if(habit.type === 'SOCIAL' && content.trim() === '') {
                habit.notes = notes;
                notes = '';
            }
            if (notes) {
                habit.notes = notes;
            }

            const edgeMatch = content.match(/(\d+)\s+edge(s?)/i);
            if (edgeMatch) {
                habit.edgeCount = parseInt(edgeMatch[1], 10);
                content = content.replace(edgeMatch[0], '').trim();
            }

            habit.duration = parseDurationToSeconds(content);
            
            if (!habit.startTime) {
                 habit.startTime = getTimeOfDayDate(baseDate, 'not-sure').toISOString();
            }
            if (habit.duration === undefined) {
                 habit.duration = 0;
            }

            addHabit(habit as Omit<LoggedHabit, 'id'>);
            importedCount++;
        }
    }

    toast({
        title: "Import Successful",
        description: `Successfully imported ${importedCount} habits.`,
    });

    setImportData("");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Data</DialogTitle>
          <DialogDescription>
            Paste your data below. One entry per line, with the year on the first line.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <Label htmlFor="import-data">Data</Label>
            <Textarea
                id="import-data"
                placeholder={`2024
01/01 1 20:16 7m 42s
12/02 1 16:00 1 edge 13m
11/01 Bharbara 21:00 Boquete e siririca...
07/02 1 15:36 3m 32s Bharbara 00:00 Ambos gozamos
27/08
20/05 1 Bharbara recaída...`}
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                className="min-h-[200px]"
            />
        </div>
        <DialogFooter>
          <Button onClick={handleImport}>Import Data</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
