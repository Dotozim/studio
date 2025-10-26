
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
import type { HabitEntry, TimeOfDay, Habit } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Label } from "./ui/label";
import { produce } from "immer";

type ImportDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

const validTimes: TimeOfDay[] = ["dawn", "morning", "afternoon", "night"];
const habitKeywords: string[] = ["BOB", "FL", "1"];

export function ImportDialog({ isOpen, setIsOpen }: ImportDialogProps) {
  const [importData, setImportData] = useState("");
  const setHabitEntry = useHabitStore((state) => state.setHabitEntry);
  const allEntries = useHabitStore((state) => state.entries);
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
    const entriesToUpdate: { [date: string]: HabitEntry } = {};

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

        if (!entriesToUpdate[dateStr]) {
            const existingEntry = allEntries.find(e => e.date === dateStr);
            entriesToUpdate[dateStr] = existingEntry 
                ? produce(existingEntry, draft => {})
                : {
                    date: dateStr,
                    habits: {},
                    social: { partners: [], count: 0, times: {} },
                  };
        }
        
        const entry = entriesToUpdate[dateStr];
        let currentContext: { type: 'habit' | 'social', name: Habit | string } | null = null;
        
        const processContext = (time: TimeOfDay = 'not-sure', count: number = 1) => {
            if (!currentContext) return;
            if (currentContext.type === 'habit') {
                const habitName = currentContext.name as Habit;
                if (!entry.habits[habitName]) entry.habits[habitName] = {};
                if (!entry.habits[habitName]![time]) entry.habits[habitName]![time] = { count: 0, duration: 0 };
                entry.habits[habitName]![time]!.count += count;
            } else { // social
                const partnerName = currentContext.name;
                if (!entry.social) entry.social = { partners: [], count: 0, times: {} };
                if (!entry.social.partners!.includes(partnerName)) {
                    entry.social.partners!.push(partnerName);
                }
                if (!entry.social.times![time]) entry.social.times![time] = { count: 0, duration: 0 };
                entry.social.times![time]!.count += count;
                entry.social.count += count;
            }
            currentContext = null;
        }

        const habitsInLine = parts.slice(1);
        if (habitsInLine.length === 0) { // Just date, so it's a BOB
            currentContext = { type: 'habit', name: 'BOB' };
            processContext();
            continue;
        }
        
        for (let j = 0; j < habitsInLine.length; j++) {
            const part = habitsInLine[j];
            const partUpper = part.toUpperCase();

            if (habitKeywords.includes(partUpper)) {
                processContext(); // Process any pending context
                currentContext = { type: 'habit', name: partUpper === '1' ? 'BOB' : partUpper as Habit };
            } else if (validTimes.includes(part.toLowerCase() as TimeOfDay)) {
                processContext(part.toLowerCase() as TimeOfDay);
            } else if (part.toLowerCase().startsWith('x') && !isNaN(parseInt(part.substring(1)))) {
                const count = parseInt(part.substring(1));
                const nextPart = (j + 1 < habitsInLine.length) ? habitsInLine[j+1].toLowerCase() : null;
                const time = nextPart && validTimes.includes(nextPart as TimeOfDay) ? nextPart as TimeOfDay : 'not-sure';
                processContext(time, count);
                if (time !== 'not-sure') j++; // Skip next part as it's been consumed
            } else { // It's a partner name
                processContext();
                currentContext = { type: 'social', name: part };
            }
        }
        processContext(); // Process any remaining context at the end of the line
    }

    Object.values(entriesToUpdate).forEach(entry => {
        setHabitEntry(entry);
        importedCount++;
    });

    toast({
        title: "Import Successful",
        description: `Successfully imported or updated ${importedCount} dates.`,
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
