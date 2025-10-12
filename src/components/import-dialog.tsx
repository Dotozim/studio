
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
const validHabits: Habit[] = ["BOB", "FL"];

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
                ? produce(existingEntry, draft => {}) // Deep copy
                : {
                    date: dateStr,
                    habits: {},
                    social: { partners: [], count: 0, times: {} },
                  };
        }
        
        const entry = entriesToUpdate[dateStr];

        // Case: Only date is present, it's a BOB entry
        if (parts.length === 1) {
            entry.habits.BOB = {
                ...entry.habits.BOB,
                'not-sure': (entry.habits.BOB?.['not-sure'] || 0) + 1,
            };
            continue; // Go to next line
        }

        let currentHabit: Habit | 'social' | null = null;
        
        for (let j = 1; j < parts.length; j++) {
            let part = parts[j];
            let nextPart = j + 1 < parts.length ? parts[j+1] : null;
            const partUpper = part.toUpperCase();
            
            if (part === '1') {
                part = 'BOB';
            }

            if (validHabits.includes(partUpper as Habit)) {
                currentHabit = partUpper as Habit;
                const nextPartIsTime = nextPart && validTimes.includes(nextPart.toLowerCase() as TimeOfDay);
                const nextPartIsQuantity = nextPart && nextPart.toLowerCase().startsWith('x');

                if (!nextPart || (!nextPartIsTime && !nextPartIsQuantity)) {
                    entry.habits[currentHabit] = {
                        ...entry.habits[currentHabit],
                        'not-sure': (entry.habits[currentHabit]?.['not-sure'] || 0) + 1,
                    };
                    currentHabit = null; // Reset after logging
                }
            } else if (validTimes.includes(part as TimeOfDay)) {
                const time: TimeOfDay = part as TimeOfDay;
                if (currentHabit) {
                     if (currentHabit === 'social') {
                        entry.social!.times![time] = (entry.social!.times![time] || 0) + 1;
                        entry.social!.count = (entry.social!.count || 0) + 1;
                    } else {
                        entry.habits[currentHabit] = {
                            ...entry.habits[currentHabit],
                            [time]: (entry.habits[currentHabit]?.[time] || 0) + 1,
                        };
                    }
                    currentHabit = null; // Reset after logging
                }
            } else if (part.toLowerCase().startsWith('x') && !isNaN(parseInt(part.substring(1), 10))) {
                const count = parseInt(part.substring(1), 10);
                if (currentHabit) {
                     const time: TimeOfDay = (nextPart && validTimes.includes(nextPart as TimeOfDay)) ? nextPart as TimeOfDay : 'not-sure';
                     if (currentHabit === 'social') {
                         entry.social!.times![time] = (entry.social!.times![time] || 0) + count;
                         entry.social!.count = (entry.social!.count || 0) + count;
                     } else {
                         entry.habits[currentHabit] = {
                            ...entry.habits[currentHabit],
                            [time]: (entry.habits[currentHabit]?.[time] || 0) + count,
                        };
                     }
                     if (time !== 'not-sure') j++; // Skip next part since it's used as time
                     currentHabit = null; // Reset after logging
                }
            } else { // It's a partner name
                currentHabit = 'social';
                const currentPartner = part;
                if (!entry.social!.partners!.includes(currentPartner)) {
                    entry.social!.partners!.push(currentPartner);
                }
                const nextPartIsTime = nextPart && validTimes.includes(nextPart.toLowerCase() as TimeOfDay);
                const nextPartIsQuantity = nextPart && nextPart.toLowerCase().startsWith('x');
                
                if (!nextPart || (!nextPartIsTime && !nextPartIsQuantity)) {
                     entry.social!.times!['not-sure'] = (entry.social!.times!['not-sure'] || 0) + 1;
                     entry.social!.count = (entry.social!.count || 0) + 1;
                     currentHabit = null; // Reset after logging
                }
            }
        }
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
