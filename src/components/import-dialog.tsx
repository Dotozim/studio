
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
import type { HabitEntry, TimeOfDay } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Label } from "./ui/label";

type ImportDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

const validTimes: TimeOfDay[] = ["dawn", "morning", "afternoon", "night"];

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
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === "") continue;

      const lineParts = line.split(' ').map(p => p.toLowerCase());
      const datePart = lineParts[0];
      
      const dateSegments = datePart.split('/');
      if (dateSegments.length !== 2) continue;

      const day = parseInt(dateSegments[0], 10);
      const month = parseInt(dateSegments[1], 10);

      if (isNaN(day) || isNaN(month) || day < 1 || day > 31 || month < 1 || month > 12) {
        continue;
      }

      let timeOfDay: TimeOfDay = "not-sure";
      let count = 1;

      for (let j = 1; j < lineParts.length; j++) {
        const part = lineParts[j];
        if (validTimes.includes(part as TimeOfDay)) {
          timeOfDay = part as TimeOfDay;
        } else if (part.startsWith('x') && !isNaN(parseInt(part.substring(1), 10))) {
          count = parseInt(part.substring(1), 10);
        }
      }
      
      const monthStr = month.toString().padStart(2, '0');
      const dayStr = day.toString().padStart(2, '0');
      const dateStr = `${year}-${monthStr}-${dayStr}`;

      const existingEntry = allEntries.find(e => e.date === dateStr);

      const newEntry: HabitEntry = {
        date: dateStr,
        habits: {
          ...existingEntry?.habits,
          BOB: {
            ...existingEntry?.habits?.BOB,
            [timeOfDay]: (existingEntry?.habits?.BOB?.[timeOfDay] || 0) + count,
          },
        },
        social: existingEntry?.social
      };

      setHabitEntry(newEntry);
      importedCount++;
    }
    
    toast({
        title: "Import Successful",
        description: `Successfully imported ${importedCount} entries.`,
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
            Paste your data below. Format: Year, then DD/MM [time] [xCount] on new lines.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <Label htmlFor="import-data">Data</Label>
            <Textarea
                id="import-data"
                placeholder="2024\n01/07 morning\n03/07 x2\n..."
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
