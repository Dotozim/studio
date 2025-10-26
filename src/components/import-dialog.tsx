
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
import { useLegacyHabitStore, useHabitStore } from "@/lib/store";
import type { OldHabitEntry, TimeOfDay, Habit, LoggedHabit, HabitType } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Label } from "./ui/label";
import { produce } from "immer";
import { set, parseISO } from 'date-fns';

type ImportDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

const validTimes: TimeOfDay[] = ["dawn", "morning", "afternoon", "night"];
const habitKeywords: string[] = ["BOB", "FL", "1"];

const getTimeOfDayDate = (date: Date, time: TimeOfDay): Date => {
    switch (time) {
        case 'dawn': return set(date, { hours: 5, minutes: 0, seconds: 0 });
        case 'morning': return set(date, { hours: 9, minutes: 0, seconds: 0 });
        case 'afternoon': return set(date, { hours: 14, minutes: 0, seconds: 0 });
        case 'night': return set(date, { hours: 21, minutes: 0, seconds: 0 });
        default: return date;
    }
}

export function ImportDialog({ isOpen, setIsOpen }: ImportDialogProps) {
  const [importData, setImportData] = useState("");
  const addHabit = useHabitStore((state) => state.addHabit);
  const { toast } = useToast();

  const handleImport = () => {
    const lines = importData.trim().split('\n');
    if (lines.length < 2) {
        toast({
            variant: "destructive",
            title: "Invalid Format",
            description: "The import data is not in the correct format.",
        });
        return;
    }

    const year = parseInt(lines[0].trim(), 10);
    if (isNaN(year)) {
        toast({
            variant: "destructive",
            title: "Invalid Year",
            description: "The first line must be a valid year.",
        });
        return;
    }
    
    let importedCount = 0;

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === "") continue;

        const parts = line.split(/\s+/).map(p => p.trim());
        const datePart = parts[0];
        
        const dateSegments = datePart.split('/');
        if (dateSegments.length !== 2) continue;

        const day = parseInt(dateSegments[0], 10);
        const month = parseInt(dateSegments[1], 10);

        if (isNaN(day) || isNaN(month) || day < 1 || day > 31 || month < 1 || month > 12) {
            continue;
        }

        const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const baseDate = parseISO(dateStr);
        
        const habitsInLine = parts.slice(1);
        if (habitsInLine.length === 0) { // Just date, so it's a BOB
            addHabit({
                type: 'BOB',
                startTime: getTimeOfDayDate(baseDate, 'not-sure').toISOString(),
                duration: 0,
            });
            importedCount++;
            continue;
        }
        
        let currentHabit: { type: HabitType, partners?: string[], count: number} | null = null;
        
        const processCurrentHabit = (time: TimeOfDay) => {
            if (!currentHabit) return;

            for(let i=0; i<currentHabit.count; i++) {
                addHabit({
                    type: currentHabit.type,
                    startTime: getTimeOfDayDate(baseDate, time).toISOString(),
                    duration: 0,
                    partners: currentHabit.partners,
                });
            }
            importedCount++;
            currentHabit = null;
        }

        for (let j = 0; j < habitsInLine.length; j++) {
            const part = habitsInLine[j];
            const partUpper = part.toUpperCase();

            if (validTimes.includes(part.toLowerCase() as TimeOfDay)) {
                processCurrentHabit(part.toLowerCase() as TimeOfDay);
            } else if (part.toLowerCase().startsWith('x') && !isNaN(parseInt(part.substring(1)))) {
                if (currentHabit) {
                    currentHabit.count = parseInt(part.substring(1));
                }
            } else { // It's a new habit or partner
                processCurrentHabit('not-sure'); // process previous habit with default time
                
                if (habitKeywords.includes(partUpper)) {
                    currentHabit = { type: (partUpper === '1' ? 'BOB' : partUpper as Habit), count: 1 };
                } else { // partner name
                    currentHabit = { type: 'SOCIAL', partners: [part], count: 1 };
                }
            }
        }
        processCurrentHabit('not-sure'); // process any leftover habit
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
            Paste your data below. Format: Year, then DD/MM [HABIT/Partner] [time] [xCount] on new lines.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <Label htmlFor="import-data">Data</Label>
            <Textarea
                id="import-data"
                placeholder="2024\n01/07 BOB morning\n03/07 FL x2\n05/07 Alice night..."
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
